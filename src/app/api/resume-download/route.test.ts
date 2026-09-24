import { afterEach, describe, expect, it, vi } from "vitest";
import { NextRequest } from "next/server";

const sendMock = vi.fn().mockResolvedValue({ data: { id: "test" } });

vi.mock("resend", () => ({
  Resend: vi.fn().mockImplementation(() => ({
    emails: { send: sendMock },
  })),
}));

const ENV_KEYS = [
  "RESEND_API_KEY",
  "NOTIFY_EMAIL_TO",
  "VIP_ALERT_EMAIL",
  "NOTIFY_EMAIL_FROM",
  "KV_REST_API_URL",
  "KV_REST_API_TOKEN",
];

function clearEnv() {
  for (const k of ENV_KEYS) delete process.env[k];
}

function makeRequest() {
  return new NextRequest("http://localhost:3000/api/resume-download", { method: "POST" });
}

describe("POST /api/resume-download", () => {
  afterEach(() => {
    clearEnv();
    sendMock.mockClear();
  });

  it("skips silently (ok:true, no send) when RESEND_API_KEY is unset", async () => {
    clearEnv();
    const { POST } = await import("./route");

    const res = await POST(makeRequest());
    const body = await res.json();

    expect(res.status).toBe(200);
    expect(body).toEqual({ ok: true });
    expect(sendMock).not.toHaveBeenCalled();
  });

  it("fails loudly (500, logged) instead of falling back to a hardcoded address when no recipient is configured", async () => {
    clearEnv();
    process.env.RESEND_API_KEY = "test-resend-key";
    const errorSpy = vi.spyOn(console, "error").mockImplementation(() => {});
    try {
      const { POST } = await import("./route");

      const res = await POST(makeRequest());
      const body = await res.json();

      expect(res.status).toBe(500);
      expect(body.ok).toBe(false);
      expect(sendMock).not.toHaveBeenCalled();
      expect(errorSpy).toHaveBeenCalledWith(expect.stringContaining("[resume-download]"));
      // The whole point of this fix: no silent fallback to the old hardcoded address.
      expect(JSON.stringify(body)).not.toContain("damatnic");
    } finally {
      errorSpy.mockRestore();
    }
  });

  it("sends to NOTIFY_EMAIL_TO when set", async () => {
    clearEnv();
    process.env.RESEND_API_KEY = "test-resend-key";
    process.env.NOTIFY_EMAIL_TO = "nickdamatoit@gmail.com";
    const { POST } = await import("./route");

    const res = await POST(makeRequest());
    const body = await res.json();

    expect(res.status).toBe(200);
    expect(body).toEqual({ ok: true });
    expect(sendMock).toHaveBeenCalledTimes(1);
    expect(sendMock.mock.calls[0][0]).toMatchObject({ to: "nickdamatoit@gmail.com" });
  });

  it("falls back to VIP_ALERT_EMAIL when NOTIFY_EMAIL_TO is unset", async () => {
    clearEnv();
    process.env.RESEND_API_KEY = "test-resend-key";
    process.env.VIP_ALERT_EMAIL = "vip@example.com";
    const { POST } = await import("./route");

    const res = await POST(makeRequest());
    await res.json();

    expect(res.status).toBe(200);
    expect(sendMock).toHaveBeenCalledTimes(1);
    expect(sendMock.mock.calls[0][0]).toMatchObject({ to: "vip@example.com" });
  });
});
