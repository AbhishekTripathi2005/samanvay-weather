/**
 * verify_step13.js - Step 13 Trust and Delight verification
 */
const puppeteer = require("puppeteer-core");
const path = require("path");

const EDGE  = "C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe";
const BASE  = "http://localhost:3000";
const OUT   = "C:\\Users\\HP\\.gemini\\antigravity\\brain\\9a174b98-0046-41c3-9365-05769aaaa021";
const delay = (ms) => new Promise((r) => setTimeout(r, ms));

async function run() {
  console.log("\n=== SAMANVAY - Step 13 Trust and Delight Verification ===\n");
  let testErrors = 0;
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

    // ==========================================
    // 1. /about Methodology & KaTeX Formulas
    // ==========================================
    console.log("1. Testing /about Methodology Page (Dark Mode)...");
    await page.emulateMediaFeatures([{ name: "prefers-color-scheme", value: "dark" }]);
    await page.goto(BASE + "/about", { waitUntil: "networkidle0", timeout: 35000 });
    await delay(2000);
    await page.screenshot({ path: path.join(OUT, "desktop_about_dark.png"), fullPage: false });
    console.log("   screenshot: desktop_about_dark.png");

    // Verify KaTeX math elements rendered
    const katexCount = await page.evaluate(() => document.querySelectorAll(".katex").length);
    console.log(`   KaTeX formula elements rendered: ${katexCount} -> ${katexCount >= 6 ? "PASS" : "FAIL"}`);
    if (katexCount < 6) testErrors++;

    // Test Searchable Glossary
    console.log("   Testing Glossary interactive search...");
    await page.evaluate(() => {
      const input = document.querySelector('input[placeholder*="Search glossary"]');
      if (input) {
        input.value = "Quantile";
        input.dispatchEvent(new Event("input", { bubbles: true }));
      }
    });
    await delay(500);

    const glossaryResults = await page.evaluate(() => {
      const cards = document.querySelectorAll("h3");
      return Array.from(cards).some((c) => c.textContent.includes("Quantile"));
    });
    console.log(`   Glossary search results filtered: ${glossaryResults} -> ${glossaryResults ? "PASS" : "FAIL"}`);
    if (!glossaryResults) testErrors++;

    // ==========================================
    // 2. Command Palette (Ctrl+K & NLP Filters)
    // ==========================================
    console.log("2. Testing Command Palette (Ctrl+K)...");
    await page.keyboard.down("Control");
    await page.keyboard.press("KeyK");
    await page.keyboard.up("Control");
    await delay(800);

    // If keyboard shortcut didn't trigger in headless, trigger via DOM button
    const paletteOpen = await page.evaluate(() => {
      return !!document.querySelector('input[placeholder*="Type a command"]');
    });
    if (!paletteOpen) {
      await page.evaluate(() => {
        const btn = Array.from(document.querySelectorAll("button")).find(b => b.textContent.includes("Command Palette") || b.textContent.includes("Ctrl+K"));
        if (btn) btn.click();
      });
      await delay(600);
    }

    // Type NLP filter query
    console.log("   Typing NLP filter query: 'rain day 3 Kerala'...");
    const inputSelector = 'input[placeholder*="Type a command"]';
    await page.click(inputSelector);
    await page.type(inputSelector, "rain day 3 Kerala", { delay: 30 });
    await delay(600);
    await page.screenshot({ path: path.join(OUT, "desktop_command_palette.png") });
    console.log("   screenshot: desktop_command_palette.png");

    const hasNlpFilter = await page.evaluate(() => {
      return document.body.innerText.includes("Apply Filter") && document.body.innerText.includes("Kerala");
    });
    console.log(`   NLP Filter parsed accurately: ${hasNlpFilter} -> ${hasNlpFilter ? "PASS" : "FAIL"}`);
    if (!hasNlpFilter) testErrors++;

    // Close palette with ESC
    await page.keyboard.press("Escape");
    await delay(400);

    // ==========================================
    // 3. Guided Product Tour (8 Steps & No Focus Trap)
    // ==========================================
    console.log("3. Testing Guided Product Tour...");
    // Open help menu and click Tour
    await page.evaluate(() => {
      const helpBtn = document.querySelector('button[aria-label="Help menu"]');
      if (helpBtn) helpBtn.click();
    });
    await delay(400);

    await page.evaluate(() => {
      const tourBtn = Array.from(document.querySelectorAll("button")).find(b => b.textContent.includes("Product Tour"));
      if (tourBtn) tourBtn.click();
    });
    await delay(600);
    await page.screenshot({ path: path.join(OUT, "desktop_product_tour.png") });
    console.log("   screenshot: desktop_product_tour.png");

    const tourVisible = await page.evaluate(() => {
      return document.body.innerText.includes("National Command Center") || document.body.innerText.includes("Step 1 of 8");
    });
    console.log(`   Tour modal visible at Step 1: ${tourVisible} -> ${tourVisible ? "PASS" : "FAIL"}`);
    if (!tourVisible) testErrors++;

    // Test advancing step
    await page.evaluate(() => {
      const nextBtn = Array.from(document.querySelectorAll("button")).find(b => b.textContent.includes("Next"));
      if (nextBtn) nextBtn.click();
    });
    await delay(600);

    const tourStep2 = await page.evaluate(() => {
      return document.body.innerText.includes("Atmospheric Variables") || document.body.innerText.includes("Step 2 of 8");
    });
    console.log(`   Tour advanced to Step 2: ${tourStep2} -> ${tourStep2 ? "PASS" : "FAIL"}`);
    if (!tourStep2) testErrors++;

    // Test Skip / Escape to ensure focus is NEVER trapped
    console.log("   Testing Skip Tour (Focus trap prevention)...");
    await page.keyboard.press("Escape");
    await delay(500);

    const tourClosed = await page.evaluate(() => {
      return !document.body.innerText.includes("Step 2 of 8");
    });
    console.log(`   Tour cleanly closed with ESC: ${tourClosed} -> ${tourClosed ? "PASS" : "FAIL"}`);
    if (!tourClosed) testErrors++;

    // ==========================================
    // 4. Evaluator Demo Mode (Scripted Walkthrough)
    // ==========================================
    console.log("4. Testing Evaluator Demo Mode...");
    await page.evaluate(() => {
      const demoBtn = Array.from(document.querySelectorAll("button")).find(b => b.textContent.includes("Demo Mode"));
      if (demoBtn) demoBtn.click();
    });
    await delay(1000);
    await page.screenshot({ path: path.join(OUT, "desktop_demo_mode.png") });
    console.log("   screenshot: desktop_demo_mode.png");

    const demoRunning = await page.evaluate(() => {
      return document.body.innerText.includes("EVALUATOR DEMO MODE") && document.body.innerText.includes("Stop Demo");
    });
    console.log(`   Demo Mode banner active with controls: ${demoRunning} -> ${demoRunning ? "PASS" : "FAIL"}`);
    if (!demoRunning) testErrors++;

    // Test Pause and Resume
    await page.evaluate(() => {
      const pauseBtn = document.querySelector('button[title*="Pause Walkthrough"]');
      if (pauseBtn) pauseBtn.click();
    });
    await delay(400);

    // Stop Demo cleanly
    console.log("   Stopping Demo Mode via Stop control...");
    await page.evaluate(() => {
      const stopBtn = Array.from(document.querySelectorAll("button")).find(b => b.textContent.includes("Stop Demo"));
      if (stopBtn) stopBtn.click();
    });
    await delay(600);

    const demoStopped = await page.evaluate(() => {
      return !document.body.innerText.includes("EVALUATOR DEMO MODE");
    });
    console.log(`   Demo Mode stopped cleanly: ${demoStopped} -> ${demoStopped ? "PASS" : "FAIL"}`);
    if (!demoStopped) testErrors++;

    // ==========================================
    // 5. Notification Centre with Alert History
    // ==========================================
    console.log("5. Testing Notification Centre & Alert History...");
    await page.evaluate(() => {
      const bell = document.querySelector('button[aria-label="Severe weather alerts"]');
      if (bell) bell.click();
    });
    await delay(800);
    await page.screenshot({ path: path.join(OUT, "desktop_notification_center.png") });
    console.log("   screenshot: desktop_notification_center.png");

    const notifOpen = await page.evaluate(() => {
      return document.body.innerText.includes("Notification Centre") && document.body.innerText.includes("Active (");
    });
    console.log(`   Notification Centre drawer opened: ${notifOpen} -> ${notifOpen ? "PASS" : "FAIL"}`);
    if (!notifOpen) testErrors++;

    // Test History Tab
    console.log("   Switching to Alert History tab...");
    await page.evaluate(() => {
      const histTab = Array.from(document.querySelectorAll("button")).find(b => b.textContent.includes("History"));
      if (histTab) histTab.click();
    });
    await delay(500);

    const hasHistory = await page.evaluate(() => {
      return document.body.innerText.includes("HIT") || document.body.innerText.includes("Observed");
    });
    console.log(`   Alert History verified entries: ${hasHistory} -> ${hasHistory ? "PASS" : "FAIL"}`);
    if (!hasHistory) testErrors++;

    // Close Notification Centre
    await page.keyboard.press("Escape");
    await delay(500);

    // ==========================================
    // 6. Light Mode & Mobile Viewport
    // ==========================================
    console.log("6. Testing Light Mode on /about...");
    await page.emulateMediaFeatures([{ name: "prefers-color-scheme", value: "light" }]);
    await page.goto(BASE + "/about", { waitUntil: "networkidle0", timeout: 30000 });
    await delay(1500);
    await page.screenshot({ path: path.join(OUT, "desktop_about_light.png") });
    console.log("   screenshot: desktop_about_light.png");

    console.log("7. Testing Mobile Viewport on /about...");
    const mob = await browser.newPage();
    await mob.setViewport({ width: 375, height: 812, isMobile: true });
    mob.on("console", (m) => { if (m.type() === "error") consoleErrors.push("[mob] " + m.text()); });
    await mob.goto(BASE + "/about", { waitUntil: "networkidle0", timeout: 30000 });
    await delay(1500);
    await mob.screenshot({ path: path.join(OUT, "mobile_about.png") });
    console.log("   screenshot: mobile_about.png");
    await mob.close();

  } finally {
    await browser.close();
  }

  const realErrors = consoleErrors.filter((e) =>
    !e.includes("ResizeObserver") && !e.includes("favicon") &&
    !e.includes("hydrat") && !e.includes("Non-Error")
  );

  console.log("\n=== STEP 13 SUMMARY ===");
  console.log(`Test Assertions Failed: ${testErrors}`);
  console.log(`Console Errors:         ${realErrors.length === 0 ? "0 (PASS)" : realErrors.length}`);
  realErrors.forEach((e) => console.log("  ERR: " + e.substring(0, 120)));
  const passed = testErrors === 0 && realErrors.length === 0;
  console.log("Overall: " + (passed ? "PASS" : "NEEDS REVIEW"));
  process.exit(passed ? 0 : 1);
}

run().catch((e) => {
  console.error("FATAL in verify_step13:", e);
  process.exit(1);
});