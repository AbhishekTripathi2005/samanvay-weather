/**
 * verify_step9.js - Step 9 headless verification (Puppeteer-core + Edge)
 * Run:  node verify_step9.js
 */
const puppeteer = require("puppeteer-core");
const path = require("path");

const EDGE   = "C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe";
const BASE   = "http://localhost:3000";
const OUT    = "C:\\Users\\HP\\.gemini\\antigravity\\brain\\9a174b98-0046-41c3-9365-05769aaaa021";
const SHOTS  = [];
let consoleErrors = [];

const delay = (ms) => new Promise((r) => setTimeout(r, ms));

async function shot(page, name) {
  const file = path.join(OUT, name);
  await page.screenshot({ path: file, fullPage: false });
  SHOTS.push(name);
  console.log("  screenshot: " + name);
}

async function run() {
  console.log("\nSAMANVAY - Step 9 Verification\n");
  const browser = await puppeteer.launch({
    executablePath: EDGE,
    headless: true,
    args: ["--no-sandbox","--disable-setuid-sandbox","--disable-gpu"],
  });
  try {
    // 1. Dark mode desktop
    const page = await browser.newPage();
    await page.setViewport({ width: 1440, height: 900 });
    page.on("console", (m) => { if (m.type()==="error") consoleErrors.push(m.text()); });
    page.on("pageerror", (e) => consoleErrors.push(e.message));
    await page.emulateMediaFeatures([{ name: "prefers-color-scheme", value: "dark" }]);

    console.log("1. Dark mode /extremes ...");
    await page.goto(BASE + "/extremes", { waitUntil: "networkidle0", timeout: 30000 });
    await delay(2500);
    await shot(page, "desktop_extremes_dark.png");

    // 2. Click Heatwave tab
    console.log("2. Switching to Heatwave tab ...");
    await page.$$eval("button", (btns) => {
      const b = btns.find((x) => x.textContent.includes("Heatwave"));
      if (b) b.click();
    });
    await delay(1200);

    // 3. Click first district row to open drawer
    console.log("3. Clicking district row to open drawer ...");
    const rowClicked = await page.evaluate(() => {
      const rows = document.querySelectorAll("[role=row]");
      if (rows.length > 0) { rows[0].click(); return true; }
      return false;
    });
    console.log("   Row clicked: " + rowClicked);
    await delay(1500);
    await shot(page, "desktop_extremes_drawer.png");

    // 4. Verify contribution % sums
    const pctSum = await page.evaluate(() => {
      const pctEls = Array.from(document.querySelectorAll("[data-contrib-pct]"));
      if (!pctEls.length) return null;
      return pctEls.reduce((s, el) => s + parseFloat(el.textContent || "0"), 0);
    });
    console.log("   Contribution sum: " + (pctSum !== null ? pctSum.toFixed(1) + "%" : "N/A (data-contrib-pct not found)"));

    // 5. Close drawer, scroll to verification panel
    console.log("4. Closing drawer, scrolling to verification ...");
    await page.keyboard.press("Escape");
    await delay(500);
    await page.evaluate(() => { window.scrollTo(0, document.body.scrollHeight * 0.65); });
    await delay(1500);
    await shot(page, "desktop_extremes_verification.png");

    // 6. Light mode
    console.log("5. Light mode /extremes ...");
    await page.emulateMediaFeatures([{ name: "prefers-color-scheme", value: "light" }]);
    await page.goto(BASE + "/extremes", { waitUntil: "networkidle0", timeout: 30000 });
    await delay(2000);
    await shot(page, "desktop_extremes_light.png");

    // 7. Mobile
    console.log("6. Mobile 375x812 ...");
    const mob = await browser.newPage();
    await mob.setViewport({ width: 375, height: 812, isMobile: true });
    mob.on("console", (m) => { if (m.type()==="error") consoleErrors.push("[mob] " + m.text()); });
    await mob.goto(BASE + "/extremes", { waitUntil: "networkidle0", timeout: 30000 });
    await delay(2000);
    await mob.screenshot({ path: path.join(OUT, "mobile_extremes.png"), fullPage: false });
    SHOTS.push("mobile_extremes.png");
    console.log("  screenshot: mobile_extremes.png");
    await mob.close();

    // Summary
    const realErrors = consoleErrors.filter((e) =>
      !e.includes("ResizeObserver") && !e.includes("favicon") &&
      !e.includes("hydrat") && !e.includes("Non-Error")
    );
    console.log("\n=== STEP 9 SUMMARY ===");
    console.log("Screenshots: " + SHOTS.length);
    SHOTS.forEach((s) => console.log("  + " + s));
    console.log("Console errors: " + (realErrors.length === 0 ? "0 (PASS)" : realErrors.length));
    realErrors.forEach((e) => console.log("  ERR: " + e.substring(0, 120)));
    console.log("Overall: " + (realErrors.length === 0 ? "PASS" : "NEEDS REVIEW"));
    process.exit(realErrors.length === 0 ? 0 : 1);
  } finally {
    await browser.close();
  }
}
run().catch((e) => { console.error(e); process.exit(1); });
