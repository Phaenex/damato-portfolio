/**
 * Posts a VIP-visitor alert to the shared "#project-alerts" Discord channel
 * (the "Project Notifications" server, one channel per alert type across
 * Nick's personal projects — see ~/.claude/DISCORD-NOTIFICATIONS.md). Never
 * throws: a notification failure must not fail the request path it's
 * attached to. Silent no-op if DISCORD_WEBHOOK_PROJECT_ALERTS isn't set,
 * same convention as this project's RESEND_API_KEY handling.
 */

export interface VipAlertNotice {
  site: string;
  path: string | null;
  detectionReason: string;
  ip: string | null;
  org: string;
  city: string | null;
  country: string | null;
  siteUrl: string;
}

export async function notifyVipAlert(notice: VipAlertNotice, fetchImpl: typeof fetch = fetch): Promise<void> {
  const webhookUrl = process.env.DISCORD_WEBHOOK_PROJECT_ALERTS;
  if (!webhookUrl) return;

  const { site, path, detectionReason, ip, org, city, country, siteUrl } = notice;
  const location = [city, country].filter(Boolean).join(', ') || '—';

  const body = {
    embeds: [
      {
        title: `🚨 Anthropic visitor — ${site}`,
        description: [
          `**Page:** ${path ?? '/'}`,
          `**Detection:** ${detectionReason}`,
          `**IP:** ${ip ?? 'unknown'}${org ? ` (${org})` : ''}`,
          `**Location:** ${location}`,
          siteUrl,
        ].join('\n'),
        color: 0xe8a838,
      },
    ],
  };

  try {
    const res = await fetchImpl(webhookUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });
    if (!res.ok) {
      console.error(`[discordNotify] webhook returned ${res.status}: ${await res.text()}`);
    }
  } catch (e) {
    console.error(`[discordNotify] POST failed: ${e instanceof Error ? e.message : String(e)}`);
  }
}
