import { NextRequest, NextResponse, after } from "next/server";
import { todayKey } from "@/lib/analyticsTime";
import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";
import { checkAndAlertVip } from "@/lib/vipAlert";
import { SITE_URL, SITE_NAME } from "@/lib/site";

const ratelimit = process.env.KV_REST_API_URL && process.env.KV_REST_API_TOKEN
  ? new Ratelimit({
      redis: new Redis({
        url: process.env.KV_REST_API_URL,
        token: process.env.KV_REST_API_TOKEN,
      }),
      limiter: Ratelimit.slidingWindow(20, "10 s"),
    })
  : null;

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

const BOT_REGEX = /bot|crawl|spider|scrape|headless|preview|monitor|pingdom|uptimerobot|googlebot|bingbot|yandex|baidu|slurp|duckduckbot/i;

function isBot(userAgent: string | null): boolean {
  if (!userAgent) return false;
  return BOT_REGEX.test(userAgent);
}

function classifyReferrer(referrer: string | null, selfHost: string | null): 'direct' | 'internal' | 'search' | 'social' | 'other' {
  if (!referrer) return 'direct';
  let host = '';
  try {
    host = new URL(referrer).hostname.toLowerCase();
  } catch {
    return 'other';
  }
  if (selfHost && host === selfHost) return 'internal';
  if (
    host.endsWith('google.com') || host.endsWith('bing.com') || host.endsWith('duckduckgo.com') ||
    host.endsWith('search.brave.com') || host.endsWith('ecosia.org') || host.endsWith('yahoo.com') ||
    host.endsWith('startpage.com') || host.endsWith('kagi.com')
  ) return 'search';
  if (
    host.endsWith('twitter.com') || host === 't.co' || host.endsWith('x.com') ||
    host.endsWith('bsky.app') || host.endsWith('reddit.com') || host.endsWith('instagram.com') ||
    host.endsWith('facebook.com') || host.endsWith('linkedin.com') || host.endsWith('threads.net') ||
    host.endsWith('mastodon.social') || host.endsWith('youtube.com') || host.endsWith('tiktok.com') ||
    host.endsWith('pinterest.com') || host.endsWith('tumblr.com') || host.endsWith('discord.com') ||
    host.endsWith('discord.gg')
  ) return 'social';
  return 'other';
}

async function pushToKV(record: Record<string, unknown>): Promise<void> {
  const url = process.env.KV_REST_API_URL?.trim();
  const token = process.env.KV_REST_API_TOKEN?.trim();
  if (!url || !token) return;

  const date = todayKey();
  const type = String(record.type ?? 'unknown');
  // Only trust a sessionId that's a clean token, so it can't escape its key
  // namespace (e.g. inject ":" to collide with counters/session keys).
  const sessionId =
    typeof record.sessionId === 'string' && /^[A-Za-z0-9_-]{1,64}$/.test(record.sessionId)
      ? record.sessionId
      : null;
  const path = typeof record.path === 'string' ? record.path : null;

  const headers = {
    Authorization: `Bearer ${token}`,
    'Content-Type': 'application/json',
  };

  const pipeline: string[][] = [
    ['LPUSH', 'analytics:events', JSON.stringify(record)],
    ['LTRIM', 'analytics:events', '0', '999'],
    ['INCR', `analytics:counters:${type}:${date}`],
  ];

  if (type === 'pageview' && sessionId && path) {
    pipeline.push(
      ['RPUSH', `analytics:session:${sessionId}`, path],
      ['LTRIM', `analytics:session:${sessionId}`, '0', '49'],
      ['EXPIRE', `analytics:session:${sessionId}`, '86400'],
      ['SADD', `analytics:sessions:${date}`, sessionId],
      ['EXPIRE', `analytics:sessions:${date}`, '604800']
    );
  }

  try {
    await fetch(`${url}/pipeline`, {
      method: 'POST',
      headers,
      body: JSON.stringify(pipeline),
    });
  } catch (err) {
    console.error(JSON.stringify({
      type: 'analytics_kv_error',
      error: (err as Error).message,
    }));
  }
}

export async function POST(req: NextRequest): Promise<NextResponse> {
  const ip = req.headers.get("x-forwarded-for") ?? req.headers.get("x-real-ip") ?? "127.0.0.1";
  
  if (ratelimit) {
    const { success } = await ratelimit.limit(`ratelimit:track:${ip}`);
    if (!success) {
      return new NextResponse(null, {
        status: 429,
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'POST, OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type',
        }
      });
    }
  }

  let body: Record<string, unknown> = {};
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ ok: false, error: 'invalid_json' }, { status: 400 });
  }

  const ALLOWED_TYPES = new Set(['pageview', 'click', 'link_click', 'resume_download']);
  const rawTypeIn = body.type;
  if (typeof rawTypeIn !== 'string' || !ALLOWED_TYPES.has(rawTypeIn)) {
    return NextResponse.json({ ok: false, error: 'invalid_type' }, { status: 400 });
  }
  const clip = (v: unknown, max = 500): string | null => {
    if (typeof v !== 'string') return null;
    return v.length > max ? v.slice(0, max) : v;
  };

  const userAgent = req.headers.get('user-agent');
  const country = req.headers.get('x-vercel-ip-country') ?? req.headers.get('cf-ipcountry') ?? null;
  const region = req.headers.get('x-vercel-ip-country-region') ?? null;
  const city = req.headers.get('x-vercel-ip-city')
    ? decodeURIComponent(req.headers.get('x-vercel-ip-city') ?? '')
    : null;
  const latitude = req.headers.get('x-vercel-ip-latitude') ?? null;
  const longitude = req.headers.get('x-vercel-ip-longitude') ?? null;
  const timezone = req.headers.get('x-vercel-ip-timezone') ?? null;

  const selfHost = (() => {
    const h = req.headers.get('host');
    if (!h) return null;
    return h.split(':')[0]?.toLowerCase() ?? null;
  })();

  const normalizedType = rawTypeIn === 'click' ? 'link_click' : rawTypeIn;
  const clippedReferrer = clip(body.referrer);

  const record = {
    type: normalizedType,
    path: clip(body.path, 200),
    href: clip(body.href),
    label: clip(body.label, 200),
    kind: clip(body.kind, 32),
    target: clip(body.target, 32),
    referrer: clippedReferrer,
    referrerSource: classifyReferrer(clippedReferrer, selfHost),
    sessionId: typeof body.sessionId === 'string' && body.sessionId.length <= 64 ? body.sessionId : null,
    sessionStart: typeof body.sessionStart === 'number' ? body.sessionStart : null,
    isFirstPageview: body.isFirstPageview === true,
    userAgent: clip(userAgent, 500),
    country,
    region,
    city,
    latitude,
    longitude,
    timezone,
    bot: isBot(userAgent),
    ts: typeof body.ts === 'number' ? body.ts : Date.now(),
    receivedAt: Date.now(),
  };

  console.log(JSON.stringify({ analytics_event: record }));

  void pushToKV(record);

  // VIP detection — deferred via after() so it runs after the 204 response
  // is sent but before Vercel tears down the function.
  // Anthropic UAs (ClaudeBot, etc.) are caught by isBot() because they contain
  // the word "bot". We intentionally bypass the bot gate for them so crawls
  // from Anthropic still trigger the alert.
  const isAnthropicUa = /anthropic|claudebot|claude-web|claude-ai/i.test(userAgent ?? '');
  if (record.type === 'pageview' && (!record.bot || isAnthropicUa)) {
    after(
      checkAndAlertVip({
        ip,
        userAgent,
        path: record.path,
        country,
        city,
        referrer: record.referrer,
        site: SITE_NAME,
        siteUrl: SITE_URL,
      }),
    );
  }

  return new NextResponse(null, {
    status: 204,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    }
  });
}

export async function OPTIONS(): Promise<NextResponse> {
  return new NextResponse(null, {
    status: 204,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  });
}