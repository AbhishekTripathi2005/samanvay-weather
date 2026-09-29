/**
 * verify_step8.js - Step 8 headless verification (Puppeteer-core + Edge)
 * Run:  node verify_step8.js
 */

const puppeteer = require("puppeteer-core");
const path = require("path");

const EDGE_PATH = "C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe";
const BASE_URL  = "http://localhost:3000";
const OUT_DIR   = "C:\\Users\\HP\\.gemini\\antigravity\\brain\\9a174b98-0046-41c3-9365-05769aaaa021";

let consoleErrors = [];
const SCREENSHOTS = [];

async function delay(ms) { return new Promise(r => setTimeout(r, ms)); }

async function shot(page, name) {
  const file = path.join(OUT_DIR, name);
  await page.screenshot({ path: file, fullPage: false });
  SCREENSHOTS.push(name);
  console.log("  screenshot: " + name);
}

async function run() {
  console.log("\nSAMANVAY - Step 8 Verification\n");

  const browser = await puppeteer.launch({
    executablePath: EDGE_PATH,
    headless: true,
    args: ["--no-sandbox","--disable-setuid-sandbox","--disable-gpu"],
  });

  try {
    // 1. Dark mode desktop
    const page = await browser.newPage();
    await page.setViewport({ width: 1440, height: 900 });
    page.on("console", msg => { if (msg.type() === "error") consoleErrors.push(msg.text()); });
    page.on("pageerror", err => consoleErrors.push(err.message));
    await page.emulateMediaFeatures([{ name: "prefers-color-scheme", value: "dark" }]);
    console.log("1. Dark mode /models ...");
    await page.goto(BASE_URL + "/models", { waitUntil: "networkidle0", timeout: 30000 });
    await delay(2500);
    await shot(page, "desktop_verification_dark.png");

    // 2. Metric switch to Corr
    console.log("2. Switching metric to Corr ...");
    await page.$$eval("button", btns => {
      const b = btns.find(x => x.textContent.trim() === "Corr");
      if (b) b.click();
    });
    await delay(1200);

    // 3. Light mode
    console.log("3. Light mode ...");
    await page.emulateMediaFeatures([{ name: "prefers-color-scheme", value: "light" }]);
    await page.goto(BASE_URL + "/models", { waitUntil: "networkidle0", timeout: 30000 });
    await delay(2000);
    await shot(page, "desktop_verification_light.png");

    // 4. Win/Loss matrix
    console.log("4. Win/Loss matrix ...");
    await page.emulateMediaFeatures([{ name: "prefers-color-scheme", value: "dark" }]);
    await page.goto(BASE_URL + "/models", { waitUntil: "networkidle0", timeout: 30000 });
    await delay(2000);
    await page.evaluate(() => { window.scrollTo(0, document.body.scrollHeight * 0.78); });
    await delay(1500);
    await shot(page, "desktop_win_loss_matrix.png");

    // 5. Taylor diagram area
    console.log("5. Taylor diagram ...");
    await page.evaluate(() => { window.scrollTo(0, document.body.scrollHeight * 0.40); });
    await delay(1200);
    await shot(page, "desktop_taylor_diagram.png");

    // 6. CSV export
    console.log("6. CSV export ...");
    const csvFound = await page.evaluate(() => {
      const b = Array.from(document.querySelectorAll("button")).find(x => x.textContent.includes("CSV") || x.textContent.includes("Export"));
      if (b) { b.click(); return true; }
      return false;
    });
    console.log("   CSV button: " + (csvFound ? "FOUND+clicked" : "not found"));

    // 7. Mobile
    console.log("7. Mobile 375x812 ...");
    const mob = await browser.newPage();
    await mob.setViewport({ width: 375, height: 812, isMobile: true });
    mob.on("console", msg => { if (msg.type() === "error") consoleErrors.push("[mob] " + msg.text()); });
    await mob.goto(BASE_URL + "/models", { waitUntil: "networkidle0", timeout: 30000 });
    await delay(2000);
    await mob.screenshot({ path: path.join(OUT_DIR, "mobile_verification.png"), fullPage: false });
    SCREENSHOTS.push("mobile_verification.png");
    console.log("  screenshot: mobile_verification.png");
    await mob.close();

    // Summary
    const realErrors = consoleErrors.filter(e =>
      !e.includes("ResizeObserver") && !e.includes("favicon") &&
      !e.includes("hydrat") && !e.includes("Non-Error"));
    console.log("\n=== STEP 8 SUMMARY ===");
    console.log("Screenshots: " + SCREENSHOTS.length);
    SCREENSHOTS.forEach(s => console.log("  + " + s));
    console.log("Console errors: " + (realErrors.length === 0 ? "0 (PASS)" : realErrors.length));
    if (realErrors.length) realErrors.forEach(e => console.log("  ERR: " + e.substring(0, 100)));
    console.log("Overall: " + (realErrors.length === 0 ? "PASS" : "NEEDS REVIEW"));

    process.exit(realErrors.length === 0 ? 0 : 1);
  } finally {
    await browser.close();
  }
}

run().catch(err => { console.error(err); process.exit(1); });
