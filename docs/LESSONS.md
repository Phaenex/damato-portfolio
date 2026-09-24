# Lessons

Defect classes and environment traps beaten in this repo, recorded the session they were
found — see `~/.claude/CLAUDE.md`'s "Always-on learning check" for why this file exists
and gets appended to in-session rather than "later."

## 2026-09-23 — `next build`'s Google Fonts fetch is invisible to the Bash sandbox's
per-command `allowed_domains`, even though a plain `curl` to the same host works

**Symptom:** `npm run build` failed with `next/font: error: Failed to fetch 'Fraunces'/
'Geist'/'Geist Mono' from Google Fonts` — three failures, one per `next/font/google`
import in `src/app/layout.tsx`. Adding `fonts.googleapis.com` / `fonts.gstatic.com` to
the Bash tool's `allowed_domains` for the build command did **not** fix it, even though a
direct `curl https://fonts.googleapis.com/...` in the same sandbox, same session,
succeeded immediately.

**Root cause (instrument, not product):** Turbopack's font-fetch step runs inside worker
threads/processes it spawns itself, and those workers don't inherit whatever
proxy/allowlist wiring the sandbox attaches to the single top-level command's process.
`allowed_domains` covers the command you ran; it doesn't reach into a build tool's own
child workers. Clearing `.next`'s cache first ruled out a stale negative-cache
explanation — the failure was identical on a clean build.

**The fix that actually worked:** re-run the build with `dangerouslyDisableSandbox:
true`. This is a legitimate case for it per the sandbox's own escalation rule ("a specific
command just failed and you see evidence of sandbox restrictions causing the failure") —
the evidence here was the direct `curl` succeeding while the nested build process failed
on the identical host, which rules out an actual network/DNS/cert problem and points
specifically at the sandbox boundary around child processes.

**Generalizable rule:** if a build/test tool spawns its own workers or subprocesses that
make network calls, `allowed_domains` on the outer Bash invocation may not be enough even
when the same host works fine from a plain `curl` in that same invocation. Don't spend
more than one retry chasing domain-allowlist tweaks once a direct `curl` has already
proven the host is reachable — that's the signal to escalate straight to
`dangerouslyDisableSandbox`, not to keep guessing at which subdomain is missing.

## 2026-09-23 — `vi.restoreAllMocks()` in a shared `afterEach` silently breaks later
tests' `vi.fn()`-based module mocks, not just `vi.spyOn` targets

**Symptom:** `src/app/api/resume-download/route.test.ts` had 4 tests. Run individually,
every test passed. Run together in file order, the 4th test (`falls back to
VIP_ALERT_EMAIL...`) failed with `TypeError: Cannot read properties of undefined
(reading 'send')` — as if the mocked `Resend` constructor had stopped returning the
`{ emails: { send } }` shape it was configured to return via
`vi.fn().mockImplementation(() => ({ emails: { send: sendMock } }))` inside a top-level
`vi.mock("resend", ...)` factory.

**Misleading evidence, worth recording on its own:** the failure only appeared on the
*last* test in the file and only in a full-file run, which looks exactly like shared
state leaking forward from an earlier test — the natural suspect is environment
variables or the mock's call history, not the mock's *implementation itself* being torn
down. `sendMock.mockClear()` (called every `afterEach`) was in fact fine — `mockClear()`
only wipes call history, never the implementation. The actual culprit was a second call
in the same `afterEach`: `vi.restoreAllMocks()`, added defensively "to be safe" alongside
the `vi.spyOn(console, "error")` used in exactly one of the four tests.

**Root cause:** `vi.restoreAllMocks()` does not limit itself to spies created via
`vi.spyOn` — it walks every tracked mock, including plain `vi.fn()` mocks created inside
a `vi.mock(...)` factory, and clears their configured implementation back to a bare stub.
A global `afterEach(() => vi.restoreAllMocks())` therefore degrades *any* `vi.fn()` mock
in the file over successive tests, not just the one spy that needed cleaning up.

**The fix:** don't call `vi.restoreAllMocks()` globally when the file has module-level
`vi.fn()` mocks meant to persist across the whole suite. Scope the restore to the
specific spy: `const errorSpy = vi.spyOn(console, "error")...` then
`errorSpy.mockRestore()` in a `try/finally` inside that one test, and drop
`restoreAllMocks()` from the shared `afterEach` entirely.

**Generalizable rule:** treat `vi.restoreAllMocks()` / `vi.resetAllMocks()` in a shared
`afterEach` as suspect the moment a test-order-dependent failure shows up in a file that
has both a `vi.mock(...)` factory and an ad-hoc `vi.spyOn(...)` — restore the spy you
made, not everything vitest has ever tracked.

## 2026-09-23 — a GitHub link rename target that returns 404 under both the old and new
org name

While replacing `github.com/Damatnic` with `github.com/Phaenex` across `src/`, one link
(`car-rental-sql-server`, referenced from `src/lib/projects.ts` and its project page)
was checked against the live GitHub API before renaming, per the task's own
verify-before-renaming instruction. It came back `404` under **both** `Phaenex/
car-rental-sql-server` and `Damatnic/car-rental-sql-server` — not a redirect, not a TLS
failure, a confirmed absence (`Phaenex`'s public repo list has exactly 9 entries and
neither name is in it). The other four renamed links (`python-mastery`, `sql-mastery`,
`olympic-medal-etl`, `power-bi-sales-dashboard`) all resolved with `200` under `Phaenex`.

**Why this is worth recording rather than just fixing:** a link that 404s after a rename
looks identical, from the site visitor's side, to a link that 404s because the rename
missed it. Only checking the *old* name would have wrongly suggested the rename was the
fix needed here; checking both confirmed the repo itself is the problem (private,
deleted, or renamed to something else), which is a different, human-only fix. The rename
was still applied for consistency with the org-wide identity change, but flagged
separately in the session report rather than silently trusted as "fixed by this pass."
