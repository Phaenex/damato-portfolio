import { test, expect } from "@playwright/test";

const secret = process.env.ANALYTICS_SECRET?.trim();

test.describe("admin analytics", () => {
  test("rejects requests without a valid secret", async ({ page }) => {
    await page.goto("/admin/analytics");
    await expect(page.getByRole("heading", { name: "Not authorized" })).toBeVisible();
  });

  test("rejects requests with a wrong secret", async ({ page }) => {
    await page.goto("/admin/analytics?secret=definitely-wrong");
    await expect(page.getByRole("heading", { name: "Not authorized" })).toBeVisible();
  });

  test("allows access with ANALYTICS_SECRET", async ({ page }) => {
    test.skip(!secret, "Set ANALYTICS_SECRET in .env.local or CI to run authenticated admin E2E");

    await page.goto(`/admin/analytics?secret=${encodeURIComponent(secret!)}`);
    await expect(page.getByRole("heading", { name: "Analytics" })).toBeVisible();
    // KV may be unset locally — either dashboard or storage-not-configured is fine.
    const kvMissing = page.getByRole("heading", { name: "Storage not configured" });
    const live = page.getByText(/Live site activity|Resume downloads|Top pages/i);
    await expect(kvMissing.or(live.first())).toBeVisible();
  });
});
