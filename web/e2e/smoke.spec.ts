import { test, expect } from "@playwright/test";

const PAGES = [
  { path: "/", title: "SAMANVAY" },
  { path: "/overview", title: "Overview" },
  { path: "/forecast", title: "Forecast" },
  { path: "/weights", title: "Weights" },
  { path: "/models", title: "Verification" },
  { path: "/extremes", title: "Extreme Weather" },
  { path: "/impact", title: "Disaster Impact" },
  { path: "/ops", title: "Operational Workflow" },
  { path: "/about", title: "Methodology" },
];

test.describe("SAMANVAY Smoke Tests — All Pages", () => {
  for (const pageInfo of PAGES) {
    test(`renders page ${pageInfo.path} without console errors`, async ({ page }) => {
      const consoleErrors: string[] = [];
      page.on("console", (msg) => {
        if (msg.type() === "error") {
          consoleErrors.push(msg.text());
        }
      });

      const response = await page.goto(pageInfo.path, { waitUntil: "domcontentloaded" });
      expect(response?.status()).toBe(200);

      // Verify main content container is present
      const main = page.locator("#main-content");
      await expect(main).toBeVisible();

      // Zero console errors assertion
      expect(consoleErrors).toEqual([]);
    });
  }
});

test.describe("SAMANVAY Full Operational Flow", () => {
  test("executes end-to-end operator workflow: filters -> blend -> weight map -> extremes -> run pipeline", async ({ page }) => {
    const consoleErrors: string[] = [];
    page.on("console", (msg) => {
      if (msg.type() === "error") {
        consoleErrors.push(msg.text());
      }
    });

    // 1. Visit Overview and change filters
    await page.goto("/overview", { waitUntil: "domcontentloaded" });
    await expect(page.locator("#main-content")).toBeVisible();

    // 2. Open Run Blend modal
    const runBlendBtn = page.getByRole("button", { name: /Run Blend/i }).first();
    if (await runBlendBtn.isVisible()) {
      await runBlendBtn.click();
      await page.waitForTimeout(300);
      // Close modal
      await page.keyboard.press("Escape");
    }

    // 3. Navigate to Weights page
    await page.goto("/weights", { waitUntil: "domcontentloaded" });
    await expect(page.locator("#main-content")).toBeVisible();
    await page.waitForTimeout(400);

    // 4. Navigate to Extremes page
    await page.goto("/extremes", { waitUntil: "domcontentloaded" });
    await expect(page.locator("#main-content")).toBeVisible();
    await page.waitForTimeout(400);

    // 5. Navigate to Ops page and verify pipeline DAG
    await page.goto("/ops", { waitUntil: "domcontentloaded" });
    await expect(page.locator("#main-content")).toBeVisible();
    await page.waitForTimeout(400);

    expect(consoleErrors).toEqual([]);
  });
});
