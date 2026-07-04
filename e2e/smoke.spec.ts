import { test, expect } from "@playwright/test";

/** Public routes from sitemap.ts — smoke each with a stable heading check. */
const publicRoutes: Array<{ path: string; heading: RegExp }> = [
  { path: "/", heading: /Nicholas D'Amato|Junior Data Analyst/i },
  { path: "/now", heading: /^Now$/ },
  { path: "/projects/olympic-medals", heading: /Olympic Medal/i },
  { path: "/projects/car-rental-sql-server", heading: /Car Rental Database/i },
  { path: "/projects/power-bi-sales-dashboard", heading: /Power BI Sales Dashboard/i },
];

for (const { path, heading } of publicRoutes) {
  test(`smoke ${path}`, async ({ page }) => {
    const res = await page.goto(path);
    expect(res?.status()).toBe(200);
    await expect(page.getByRole("heading", { level: 1 })).toHaveText(heading);
  });
}

test("sitemap.xml lists all public routes", async ({ request }) => {
  const res = await request.get("/sitemap.xml");
  expect(res.status()).toBe(200);
  const body = await res.text();
  for (const { path } of publicRoutes) {
    expect(body).toContain(path === "/" ? "<loc>" : path);
  }
});
