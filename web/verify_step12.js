/**
 * verify_step12.js - Step 12 operational workflow verification
 */
const puppeteer = require("puppeteer-core");
const path = require("path");
const http = require("http");

const EDGE  = "C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe";
const BASE  = "http://localhost:3000";
const API   = "http://127.0.0.1:8000";
const OUT   = "C:\\Users\\HP\\.gemini\\antigravity\\brain\\9a174b98-0046-41c3-9365-05769aaaa021";
const delay = (ms) => new Promise((r) => setTimeout(r, ms));

async function apiGet(p) {
  return new Promise((resolve, reject) => {
    http.get(API + p, (res) => {
      let d = "";
      res.on("data", (c) => d += c);
      res.on("end", () => resolve(JSON.parse(d)));
    }).on("error", reject);
  });
}

async function run() {
  console.log("\n=== SAMANVAY - Step 12 Operational Workflow Verification ===\n");
  let testErrors = 0;

  // 1. Check Products API
  console.log("1. Checking /api/ops/products...");
  const prodRes = await apiGet("/api/ops/products");
  const prods = prodRes.products;
  const hasAllFormats = prods && prods.length === 4 && prods.every(p => p.sha256 && p.download_url);
  console.log(`   Products found: ${prods ? prods.length : 0}, all have sha256 & urls: ${hasAllFormats} -> ${hasAllFormats ? "PASS" : "FAIL"}`);
  if (!hasAllFormats) testErrors++;

  // 2. Check Health API
  console.log("2. Checking /api/ops/health...");
  const healthRes = await apiGet("/api/ops/health");
  const hasHealth = healthRes.system_status === "ALL_SYSTEMS_OPERATIONAL" && healthRes.sources.length === 7;
  console.log(`   Status: ${healthRes.system_status}, sources: ${healthRes.sources ? healthRes.sources.length : 0} -> ${hasHealth ? "PASS" : "FAIL"}`);
  if (!hasHealth) testErrors++;

  // 3. Browser Tests
  const consoleErrors = [];
  const browser = await puppeteer.launch({
    executablePath: EDGE,
    headless: true,
    args: ["--no-sandbox", "--disable-setuid-sandbox", "--disable-gpu"],
  });

  try {
    const page = await browser.newPage();
    await page.setViewport({ width: 1440, height: 900 });
    page.on("console", (m) => { if (m.type() === "error") consoleErrors.push(m.text()); });
    page.on("pageerror", (e) => consoleErrors.push(e.message));

    // Dark mode
    await page.emulateMediaFeatures([{ name: "prefers-color-scheme", value: "dark" }]);
    console.log("3. Loading /ops page in Dark Mode...");
    await page.goto(BASE + "/ops", { waitUntil: "networkidle0", timeout: 35000 });
    await delay(2000);
    await page.screenshot({ path: path.join(OUT, "desktop_ops_dark.png"), fullPage: false });
    console.log("   screenshot: desktop_ops_dark.png");

    // 4. Trigger Live Normal Run
    console.log("4. Clicking 'Run Blend Now' for simulated end-to-end execution...");
    await page.evaluate(() => {
      const btns = Array.from(document.querySelectorAll("button"));
      const b = btns.find(x => x.textContent.includes("Run Blend Now"));
      if (b) b.click();
    });

    // Wait for SSE stream to complete (takes ~1.5 seconds)
    console.log("   Waiting for pipeline completion...");
    await delay(3000);
    await page.screenshot({ path: path.join(OUT, "desktop_ops_running_complete.png"), fullPage: false });
    console.log("   screenshot: desktop_ops_running_complete.png");

    // Close the drawer
    await page.keyboard.press("Escape");
    await delay(600);

    // 5. Force Failure State Test
    console.log("5. Testing Force Failure State (Simulated QC Failure)...");
    await page.evaluate(() => {
      const checkbox = document.querySelector('input[type="checkbox"]');
      if (checkbox) {
        checkbox.click();
      }
    });
    await delay(400);

    console.log("   Clicking 'Run Blend Now' with force QC failure...");
    await page.evaluate(() => {
      const btns = Array.from(document.querySelectorAll("button"));
      const b = btns.find(x => x.textContent.includes("Run Blend Now"));
      if (b) b.click();
    });

    await delay(2000);
    await page.screenshot({ path: path.join(OUT, "desktop_ops_failure_state.png"), fullPage: false });
    console.log("   screenshot: desktop_ops_failure_state.png");

    // Verify failure state in UI
    const isFailed = await page.evaluate(() => {
      return document.body.innerText.includes("FAILED") || document.body.innerText.includes("halted");
    });
    console.log(`   Failure state reflected in UI: ${isFailed} -> ${isFailed ? "PASS" : "FAIL"}`);
    if (!isFailed) testErrors++;

    // 6. Test UI Recovery via Retry Button
    console.log("6. Clicking 'Retry Pipeline' to verify UI recovery...");
    await page.evaluate(() => {
      const btns = Array.from(document.querySelectorAll("button"));
      const r = btns.find(x => x.textContent.includes("Retry Pipeline"));
      if (r) r.click();
    });

    await delay(3000);
    await page.screenshot({ path: path.join(OUT, "desktop_ops_recovered.png"), fullPage: false });
    console.log("   screenshot: desktop_ops_recovered.png");

    const isRecovered = await page.evaluate(() => {
      return document.body.innerText.includes("SUCCESS") || document.body.innerText.includes("complete");
    });
    console.log(`   Pipeline successfully recovered: ${isRecovered} -> ${isRecovered ? "PASS" : "FAIL"}`);
    if (!isRecovered) testErrors++;

    // Close drawer
    await page.keyboard.press("Escape");
    await delay(500);

    // 7. Scroll to Scheduler & Products & Health
    console.log("7. Capturing Products and Scheduler configuration...");
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight * 0.45));
    await delay(1200);
    await page.screenshot({ path: path.join(OUT, "desktop_ops_products_scheduler.png"), fullPage: false });
    console.log("   screenshot: desktop_ops_products_scheduler.png");

    // 8. Light Mode
    console.log("8. Light Mode capture...");
    await page.emulateMediaFeatures([{ name: "prefers-color-scheme", value: "light" }]);
    await page.goto(BASE + "/ops", { waitUntil: "networkidle0", timeout: 30000 });
    await delay(2000);
    await page.screenshot({ path: path.join(OUT, "desktop_ops_light.png"), fullPage: false });
    console.log("   screenshot: desktop_ops_light.png");

    // 9. Mobile Viewport (375x812)
    console.log("9. Mobile viewport capture...");
    const mob = await browser.newPage();
    await mob.setViewport({ width: 375, height: 812, isMobile: true });
    mob.on("console", (m) => { if (m.type() === "error") consoleErrors.push("[mob] " + m.text()); });
    await mob.goto(BASE + "/ops", { waitUntil: "networkidle0", timeout: 30000 });
    await delay(2000);
    await mob.screenshot({ path: path.join(OUT, "mobile_ops.png") });
    console.log("   screenshot: mobile_ops.png");
    await mob.close();

  } finally {
    await browser.close();
  }

  const realErrors = consoleErrors.filter((e) =>
    !e.includes("ResizeObserver") && !e.includes("favicon") &&
    !e.includes("hydrat") && !e.includes("Non-Error")
  );

  console.log("\n=== STEP 12 SUMMARY ===");
  console.log(`Test Assertions Failed: ${testErrors}`);
  console.log(`Console Errors:         ${realErrors.length === 0 ? "0 (PASS)" : realErrors.length}`);
  realErrors.forEach((e) => console.log("  ERR: " + e.substring(0, 120)));
  const passed = testErrors === 0 && realErrors.length === 0;
  console.log("Overall: " + (passed ? "PASS" : "NEEDS REVIEW"));
  process.exit(passed ? 0 : 1);
}

run().catch((e) => {
  console.error("FATAL in verify_step12:", e);
  process.exit(1);
});
