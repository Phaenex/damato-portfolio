/**
 * /api/pixel — 1×1 transparent GIF tracking pixel.
 *
 * Embedded in the Damatnic GitHub profile README via an <img> tag so we get
 * a visit signal when someone views the profile page. Runs the same Anthropic
 * detection logic as /api/track so Anthropic reviewers trigger an immediate
 * email alert regardless of which property they visit first.
 *
 * GitHub proxies images through camo.githubusercontent.com, so individual
 * visitor IPs aren't exposed — but the request still fires and logs the view.
 */
import { NextRequest, NextResponse, after } from 'next/server';
import { checkAndAlertVip } from '@/lib/vipAlert';
import { SITE_URL, SITE_NAME } from '@/lib/site';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const TRANSPARENT_GIF = Buffer.from(
  'R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7',
  'base64',
);

function getIp(req: NextRequest): string | null {
  const fwd = req.headers.get('x-forwarded-for');
  if (fwd) return (fwd.split(',')[0] ?? fwd).trim();
  return req.headers.get('x-real-ip');
}

export async function GET(req: NextRequest): Promise<NextResponse> {
  const ip = getIp(req);
  const userAgent = req.headers.get('user-agent');
  const referrer = req.headers.get('referer');
  const src = new URL(req.url).searchParams.get('src') ?? 'pixel';

  const country = req.headers.get('x-vercel-ip-country') ?? null;
  const city = req.headers.get('x-vercel-ip-city')
    ? decodeURIComponent(req.headers.get('x-vercel-ip-city') ?? '')
    : null;

  after(
    checkAndAlertVip({
      ip,
      userAgent,
      path: `/pixel?src=${src}`,
      country,
      city,
      referrer,
      site: SITE_NAME,
      siteUrl: SITE_URL,
    }),
  );

  return new NextResponse(TRANSPARENT_GIF, {
    status: 200,
    headers: {
      'Content-Type': 'image/gif',
      'Cache-Control': 'no-store, no-cache, must-revalidate',
      Pragma: 'no-cache',
      Expires: '0',
    },
  });
}
