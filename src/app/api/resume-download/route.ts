import { NextRequest, NextResponse } from "next/server";
import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

// Public POST that can trigger an email, so cap it. Mirrors /api/track's guard.
const ratelimit =
  process.env.KV_REST_API_URL && process.env.KV_REST_API_TOKEN
    ? new Ratelimit({
        redis: new Redis({
          url: process.env.KV_REST_API_URL,
          token: process.env.KV_REST_API_TOKEN,
        }),
        limiter: Ratelimit.slidingWindow(5, "60 s"),
      })
    : null;

export async function POST(req: NextRequest) {
  if (ratelimit) {
    const ip =
      req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "anon";
    const { success } = await ratelimit.limit(`resume:${ip}`);
    if (!success) return NextResponse.json({ ok: true }); // silently drop floods
  }

  // Clip attacker-controlled headers before they reach logs / email subject.
  const referrer = (req.headers.get("referer") || "(direct)").slice(0, 200);
  const ua = (req.headers.get("user-agent") || "(unknown)").slice(0, 200);

  console.log("[resume-download]", {
    ts: new Date().toISOString(),
    referrer,
    ua: ua.slice(0, 120),
  });

  const resendKey = process.env.RESEND_API_KEY;
  const notifyTo = process.env.NOTIFY_EMAIL_TO || process.env.VIP_ALERT_EMAIL;

  if (resendKey) {
    // A configured Resend key with no recipient used to fall back to a
    // hardcoded personal address — silently mailing a real notification to
    // whichever address happened to be typed in here at the time, invisible
    // to whoever reads the env vars later. Require the recipient explicitly
    // instead: fail loudly (server log + 500) so a misconfigured deploy is
    // caught immediately rather than quietly notifying the wrong inbox.
    // sendBeacon() on the client doesn't read this response, so a 500 here
    // never affects the actual PDF download.
    if (!notifyTo) {
      console.error(
        "[resume-download] RESEND_API_KEY is set but NOTIFY_EMAIL_TO / VIP_ALERT_EMAIL is not — cannot send the download alert",
      );
      return NextResponse.json(
        { ok: false, error: "notification recipient not configured" },
        { status: 500 },
      );
    }
    try {
      const { Resend } = await import("resend");
      const resend = new Resend(resendKey);
      await resend.emails.send({
        from: process.env.NOTIFY_EMAIL_FROM ?? "onboarding@resend.dev",
        to: notifyTo,
        subject: `📄 Resume downloaded — ${referrer}`,
        headers: {
          'X-Priority': '1',
          'X-MSMail-Priority': 'High',
          'Importance': 'High',
        },
        text:
          `Someone downloaded your resume.\n\n` +
          `Time: ${new Date().toLocaleString("en-US", { timeZone: "America/Chicago" })} CT\n` +
          `Referrer: ${referrer}\n` +
          `User Agent: ${ua}\n`,
      });
    } catch (err) {
      console.warn("[resume-download] email failed", err);
    }
  }

  return NextResponse.json({ ok: true });
}
