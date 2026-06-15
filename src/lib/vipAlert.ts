import { Resend } from 'resend';

const ANTHROPIC_UA_REGEX = /anthropic|claudebot|claude-web|claude-ai/i;

const COOLDOWN_SECONDS = 7200;

async function isOnCooldown(ip: string): Promise<boolean> {
  const url = process.env.KV_REST_API_URL?.trim();
  const token = process.env.KV_REST_API_TOKEN?.trim();
  if (!url || !token) return false;
  try {
    const key = `vip:alerted:${ip}`;
    const res = await fetch(`${url}/get/${encodeURIComponent(key)}`, {
      headers: { Authorization: `Bearer ${token}` },
      signal: AbortSignal.timeout(2000),
    });
    if (!res.ok) return false;
    const data = (await res.json()) as { result?: string | null };
    return !!data.result;
  } catch {
    return false;
  }
}

async function setCooldown(ip: string): Promise<void> {
  const url = process.env.KV_REST_API_URL?.trim();
  const token = process.env.KV_REST_API_TOKEN?.trim();
  if (!url || !token) return;
  try {
    const key = `vip:alerted:${ip}`;
    await fetch(`${url}/set/${encodeURIComponent(key)}/1/ex/${COOLDOWN_SECONDS}`, {
      method: 'GET',
      headers: { Authorization: `Bearer ${token}` },
      signal: AbortSignal.timeout(2000),
    });
  } catch {
    // Non-fatal
  }
}

export interface VipCheckInput {
  ip: string | null;
  userAgent: string | null;
  path: string | null;
  country: string | null;
  city: string | null;
  referrer?: string | null;
  site: string;
  siteUrl: string;
}

interface IpInfoResult {
  org?: string;
  hostname?: string;
  city?: string;
  country?: string;
}

async function lookupIpOrg(ip: string): Promise<IpInfoResult> {
  try {
    const token = process.env.IPINFO_TOKEN?.trim();
    const url = token
      ? `https://ipinfo.io/${ip}?token=${token}`
      : `https://ipinfo.io/${ip}/json`;
    const res = await fetch(url, {
      headers: { Accept: 'application/json' },
      signal: AbortSignal.timeout(4000),
    });
    if (!res.ok) return {};
    return (await res.json()) as IpInfoResult;
  } catch {
    return {};
  }
}

function esc(v: unknown): string {
  return String(v ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function buildEmailHtml(
  site: string,
  path: string | null,
  detectionReason: string,
  ip: string | null,
  org: string,
  city: string | null,
  country: string | null,
  userAgent: string | null,
  referrer: string | null | undefined,
  timestamp: string,
  siteUrl: string,
): string {
  const row = (label: string, value: string) =>
    `<tr><td style="padding:6px 12px 6px 0;color:#a1a1aa;white-space:nowrap;vertical-align:top">${label}</td><td style="padding:6px 0;color:#f4f4f5;word-break:break-all">${value}</td></tr>`;

  return `<!DOCTYPE html>
<html>
<head><meta charset="utf-8"></head>
<body style="margin:0;padding:0;background:#09090b;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;color:#e4e4e7">
<table width="100%" cellpadding="0" cellspacing="0"><tr><td align="center" style="padding:40px 16px">
<table width="520" cellpadding="0" cellspacing="0" style="background:#18181b;border-radius:12px;border:1px solid #27272a">
<tr><td style="padding:28px 28px 12px">
<table cellpadding="0" cellspacing="0"><tr>
<td style="font-size:28px;padding-right:12px;vertical-align:middle">&#x1F6A8;</td>
<td style="vertical-align:middle">
<div style="margin:0;font-size:18px;font-weight:700;color:#ef4444">Anthropic Visitor Detected</div>
<div style="margin:4px 0 0;font-size:13px;color:#a1a1aa">${esc(site)}</div>
</td>
</tr></table>
</td></tr>
<tr><td style="padding:0 28px 24px">
<table cellpadding="0" cellspacing="0" style="font-size:13px;line-height:1.6;width:100%">
${row('Page', `<span style="font-family:ui-monospace,monospace">${esc(path ?? '/')}</span>`)}
${row('Detection', `<span style="background:#27272a;padding:2px 6px;border-radius:4px;font-size:11px">${esc(detectionReason)}</span>`)}
${row('IP', `<span style="font-family:ui-monospace,monospace">${esc(ip ?? 'unknown')}</span>`)}
${org ? row('Org / ASN', esc(org)) : ''}
${row('Location', esc([city, country].filter(Boolean).join(', ') || '—'))}
${referrer ? row('Referrer', esc(referrer)) : ''}
${row('User Agent', `<span style="font-family:ui-monospace,monospace;font-size:11px">${esc(userAgent ?? 'unknown')}</span>`)}
${row('Time (CT)', esc(timestamp))}
</table>
<div style="margin-top:16px">
<a href="${esc(siteUrl)}" style="display:inline-block;background:#e8a838;color:#09090b;font-weight:600;font-size:13px;padding:8px 16px;border-radius:6px;text-decoration:none">View site &#x2192;</a>
</div>
</td></tr>
</table>
</td></tr></table>
</body></html>`;
}

export async function checkAndAlertVip(input: VipCheckInput): Promise<void> {
  const { ip, userAgent, path, country, city, referrer, site, siteUrl } = input;

  let isVip = false;
  let detectionReason = '';
  let org = '';
  let resolvedCity = city;
  let resolvedCountry = country;

  if (userAgent && ANTHROPIC_UA_REGEX.test(userAgent)) {
    isVip = true;
    detectionReason = 'user-agent match';
  }

  if (!isVip && ip && ip !== '127.0.0.1' && ip !== '::1') {
    const cleanIp = (ip.split(',')[0] ?? ip).trim();
    const info = await lookupIpOrg(cleanIp);
    org = info.org ?? '';
    const hostname = info.hostname ?? '';

    if (
      org.toLowerCase().includes('anthropic') ||
      hostname.toLowerCase().endsWith('anthropic.com')
    ) {
      isVip = true;
      detectionReason = `ip-org: ${org || hostname}`;
      if (!resolvedCity && info.city) resolvedCity = info.city;
      if (!resolvedCountry && info.country) resolvedCountry = info.country;
    }
  }

  if (!isVip) return;

  const rawIp = ip ?? 'unknown';
  const cleanIpForCooldown = (rawIp.split(',')[0] ?? rawIp).trim();
  if (await isOnCooldown(cleanIpForCooldown)) return;

  const resendKey = process.env.RESEND_API_KEY?.trim();
  const alertTo = process.env.VIP_ALERT_EMAIL?.trim() || process.env.NOTIFY_EMAIL_TO?.trim();
  const from =
    process.env.NOTIFY_EMAIL_FROM?.trim() || `${site} <onboarding@resend.dev>`;

  if (!resendKey || !alertTo) {
    console.log(
      JSON.stringify({
        type: 'vip_alert_skipped',
        reason: 'no_resend_or_recipient',
        detectionReason,
        site,
        path,
      }),
    );
    return;
  }

  const timestamp = new Date().toLocaleString('en-US', {
    timeZone: 'America/Chicago',
    dateStyle: 'full',
    timeStyle: 'long',
  });

  console.log(
    JSON.stringify({
      type: 'vip_visitor',
      site,
      path,
      detectionReason,
      ip,
      org,
      country: resolvedCountry,
      city: resolvedCity,
    }),
  );

  try {
    const resend = new Resend(resendKey);
    await resend.emails.send({
      from,
      to: [alertTo],
      subject: `🚨 Anthropic on ${site} — ${path ?? '/'}`,
      html: buildEmailHtml(
        site,
        path,
        detectionReason,
        ip,
        org,
        resolvedCity,
        resolvedCountry,
        userAgent,
        referrer,
        timestamp,
        siteUrl,
      ),
      text: `Anthropic visitor on ${site}!\n\nPage: ${path ?? '/'}\nDetection: ${detectionReason}\nIP: ${ip ?? 'unknown'}\nOrg: ${org || '—'}\nLocation: ${[resolvedCity, resolvedCountry].filter(Boolean).join(', ') || '—'}\nReferrer: ${referrer ?? '—'}\nUA: ${userAgent ?? 'unknown'}\nTime: ${timestamp}`,
      headers: { 'X-Entity-Ref-ID': `vip-alert-${Date.now()}` },
    });
    void setCooldown(cleanIpForCooldown);
  } catch (err) {
    console.error(
      JSON.stringify({
        type: 'vip_alert_email_error',
        error: (err as Error).message,
        site,
        path,
      }),
    );
  }
}
