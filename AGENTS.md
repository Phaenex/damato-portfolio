<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

# damato-portfolio maintainer notes

**Stack:** Next.js 16 · TypeScript · Tailwind v4 · lucide-react · recharts · @vercel/analytics · resend

**Key conventions:**
- Tailwind v4 uses `@tailwindcss/postcss`, not v3's config file
- OG images are `opengraph-image.tsx` / `twitter-image.tsx` files in route directories, generated via the shared `src/lib/og.tsx` (`ImageResponse`). Every route has both.
- The homepage is a server component; its tech filter lives in the `WorkList` client component (`src/components/WorkList.tsx`). The Olympic medals dashboard (`useMemo` + `useState`) is a client component. Project case-study pages and `/now` are server components
- Color palette: `stone-950` bg, `stone-100` text, accent via CSS var `--accent`

**Key data files:**
- `src/lib/projects.ts` — `projects[]` (3 flagship) + `sideProjects[]` (2 "Also Built"). Edit descriptions here.
- `public/olympic-medals.json` — 1,343 medal records for the interactive dashboard (fetched client-side by the Olympic medals page)
- `public/projects/power-bi/page-*.png` — Power BI case study images (layout placeholders until Desktop exports land). PBIP source repo: https://github.com/Phaenex/power-bi-sales-dashboard (ZIP download). Vault ops note: `Obsidian Vault/System/About Nick/damato-data Portfolio.md`.

**Adding a new project:**
1. Add entry to `projects[]` or `sideProjects[]` in `src/lib/projects.ts`
2. If flagship project with detail page: create `src/app/projects/<slug>/page.tsx`
3. Update OG image if needed

**Analytics system:**
- `ClickTracker.tsx` fires on every pageview + link click
- Posts to `/api/track` which logs and optionally writes to KV
- Dashboard at `/admin/analytics?secret=<ANALYTICS_SECRET>`
- See Obsidian → System → About Nick → `damato-data Portfolio.md` for full docs

**Environment variables (Vercel + local):**

| Variable | Production / Preview | Development (Vercel “Development”) | Local `.env.local` |
|----------|----------------------|-----------------------------------|--------------------|
| `NEXT_PUBLIC_SITE_URL` | `https://nicholasdamato.vercel.app` (no trailing slash) | `http://localhost:3000` | Same as Development column |
| `ANALYTICS_SECRET` | Set in dashboard or CLI | Same if you test `/admin/analytics` locally | Copy from Vercel or set your own |
| KV (`KV_REST_API_*`) | From Upstash / Vercel Storage | Optional; `vercel dev` can inject from linked project | `vercel env pull` or leave empty |

`NEXT_PUBLIC_SITE_URL` drives analytics self-referrer filtering (`analyticsStore`) and the cron digest “full dashboard” link (`api/cron/digest`). After changing it, **redeploy** (or wait for the next deploy) so server bundles pick up the new value.

**CLI (from linked repo root, `vercel whoami` must work):**

```bash
# Production
vercel env add NEXT_PUBLIC_SITE_URL production --value "https://nicholasdamato.vercel.app" --no-sensitive --yes

# Preview — third arg "" applies to all preview branches (non-interactive)
vercel env add NEXT_PUBLIC_SITE_URL preview "" --value "https://nicholasdamato.vercel.app" --no-sensitive --yes

# Vercel “Development” (used by vercel env pull / vercel dev)
vercel env add NEXT_PUBLIC_SITE_URL development --value "http://localhost:3000" --no-sensitive --yes
```

Dashboard alternative: Vercel → **damato-portfolio** → **Settings** → **Environment Variables** — same names and targets as the table.

Sync cloud Development vars into `.env.local` (merge by hand if you already have secrets there):

```bash
vercel env pull
```

Template without secrets: [`env.example`](env.example).

**Deployment:** `vercel --prod` from project root. Live at https://nicholasdamato.vercel.app. Vercel project: astral-productions/damato-portfolio.

**Build checks before shipping:**
```bash
npm run typecheck
npm test
npm run build
npm run test:e2e
```

Asset validation runs on `dev` and `build` via `predev` / `prebuild`. See README.md Assets section.

**Related local projects:** python-mastery, sql-mastery (see their AGENTS.md)