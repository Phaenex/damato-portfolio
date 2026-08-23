import { afterEach, describe, expect, it, vi } from "vitest";
import { notifyVipAlert } from "./discordNotify";

const notice = {
  site: "damato-portfolio",
  path: "/resume",
  detectionReason: "user-agent match",
  ip: "1.2.3.4",
  org: "Anthropic, PBC",
  city: "San Francisco",
  country: "US",
  siteUrl: "https://damato-data.vercel.app",
};

describe("notifyVipAlert", () => {
  afterEach(() => {
    delete process.env.DISCORD_WEBHOOK_PROJECT_ALERTS;
  });

  it("no-ops without throwing when DISCORD_WEBHOOK_PROJECT_ALERTS is unset", async () => {
    delete process.env.DISCORD_WEBHOOK_PROJECT_ALERTS;
    const fetchImpl = vi.fn();
    await notifyVipAlert(notice, fetchImpl);
    expect(fetchImpl).not.toHaveBeenCalled();
  });

  it("POSTs an embed payload to the webhook URL", async () => {
    process.env.DISCORD_WEBHOOK_PROJECT_ALERTS = "https://discord.com/api/webhooks/test";
    const fetchImpl = vi.fn().mockResolvedValue({ ok: true });
    await notifyVipAlert(notice, fetchImpl);

    expect(fetchImpl).toHaveBeenCalledTimes(1);
    const [url, opts] = fetchImpl.mock.calls[0];
    expect(url).toBe("https://discord.com/api/webhooks/test");
    expect(opts.method).toBe("POST");
    const body = JSON.parse(opts.body);
    expect(body.embeds[0].title).toContain("damato-portfolio");
    expect(body.embeds[0].description).toContain("/resume");
  });

  it("never throws on a non-2xx response", async () => {
    process.env.DISCORD_WEBHOOK_PROJECT_ALERTS = "https://discord.com/api/webhooks/test";
    const fetchImpl = vi.fn().mockResolvedValue({ ok: false, status: 401, text: async () => "Invalid Webhook Token" });
    await expect(notifyVipAlert(notice, fetchImpl)).resolves.toBeUndefined();
  });

  it("never throws when the POST itself fails", async () => {
    process.env.DISCORD_WEBHOOK_PROJECT_ALERTS = "https://discord.com/api/webhooks/test";
    const fetchImpl = vi.fn().mockRejectedValue(new Error("network down"));
    await expect(notifyVipAlert(notice, fetchImpl)).resolves.toBeUndefined();
  });
});
