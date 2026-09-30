/**
 * verify_step11.js - Step 11 headless verification
 * Checks: R=ET=0 on dry days (API), limitations card visible, console errors=0
 */
const puppeteer = require("puppeteer-core");
const path = require("path");
const http  = require("http");

const EDGE   = "C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe";
const BASE   = "http://localhost:3000";
const API    = "http://127.0.0.1:8000";
const OUT    = "C:\\Users\\HP\\.gemini\\antigravity\\brain\\9a174b98-0046-41c3-9365-05769aaaa021";
const delay  = (ms) => new Promise((r) => setTimeout(r, ms));

async function apiGet(path) {
  return new Promise((resolve, reject) => {
    http.get(API + path, (res) => {
      let d = "";
      res.on("data", (c) => d += c);
      res.on("end", () => resolve(JSON.parse(d)));
    }).on("error", reject);
  });
}

async function run() {
  console.log("\nSAMANVAY - Step 11 Verification\n");
  let errors = 0;

  // 1. API: water balance dry scenario
  console.log("1. API: water-balance with 0mm rainfall (dry day check)...");
  const dry = await apiGet("/api/impact/water-balance?forecast_rain=0&api_30=100&scenario_pct=0");
  const dryDay = dry.days[0];
  const dryOk = dryDay.runoff_mm === 0 && dryDay.et_mm === 0 && dryDay.mass_conserved === true;
  console.log(`   P=0: R=${dryDay.runoff_mm}, ET=${dryDay.et_mm}, mass_conserved=${dryDay.mass_conserved} → ${dryOk ? "PASS" : "FAIL"}`);
  if (!dryOk) errors++;

  // 2. API: mass conservation check flag
  console.log("2. API: mass_conservation_check flag...");
  const wet = await apiGet("/api/impact/water-balance?forecast_rain=85&api_30=142&scenario_pct=0");
  console.log(`   mass_conservation_check: ${wet.mass_conservation_check} → ${wet.mass_conservation_check ? "PASS" : "FAIL"}`);
  if (!wet.mass_conservation_check) errors++;

  // 3. API: scenario +50%
  console.log("3. API: scenario +50% increases runoff...");
  const base_runoff = wet.peak_runoff_mm;
  const scen = await apiGet("/api/impact/water-balance?forecast_rain=85&api_30=142&scenario_pct=50");
  const scenOk = scen.peak_runoff_mm > base_runoff;
  console.log(`   Base peak runoff=${base_runoff}, +50% peak runoff=${scen.peak_runoff_mm} → ${scenOk ? "PASS" : "FAIL"}`);
  if (!scenOk) errors++;

  // 4. API: DEM landslide grid
  console.log("4. API: landslide DEM grid...");
  const dem = await apiGet("/api/impact/landslide-dem");
  const demOk = dem.cells.length === dem.cols * dem.rows;
  console.log(`   Cells=${dem.cells.length} (${dem.cols}x${dem.rows}) → ${demOk ? "PASS" : "FAIL"}`);
  if (!demOk) errors++;

  // 5. Browser verification
  const consoleErrors = [];
  const browser = await puppeteer.launch({
    executablePath: EDGE,
    headless: true,
    args: ["--no-sandbox","--disable-setuid-sandbox","--disable-gpu"],
  });
  try {
    // Dark desktop
    console.log("5. Dark mode /impact...");
    const page = await browser.newPage();
    await page.setViewport({ width: 1440, height: 900 });
    page.on("console", (m) => { if (m.type()==="error") consoleErrors.push(m.text()); });
    page.on("pageerror", (e) => consoleErrors.push(e.message));
    await page.emulateMediaFeatures([{ name: "prefers-color-scheme", value: "dark" }]);
    await page.goto(BASE + "/impact", { waitUntil: "networkidle0", timeout: 35000 });
    await delay(3000);
    await page.screenshot({ path: path.join(OUT, "desktop_impact_dark.png"), fullPage: false });
    console.log("   screenshot: desktop_impact_dark.png");

    // 6. Verify limitations card visible without scrolling
    console.log("6. Limitations card visible without scrolling...");
    const limitsVisible = await page.evaluate(() => {
      const els = Array.from(document.querySelectorAll("h3, h2"));
      const lim = els.find((e) => e.textContent.includes("Limitations") || e.textContent.includes("limitations"));
      if (!lim) return false;
      const rect = lim.getBoundingClientRect();
      return rect.top < window.innerHeight && rect.bottom > 0;
    });
    console.log(`   Limitations visible: ${limitsVisible} → ${limitsVisible ? "PASS" : "FAIL"}`);
    if (!limitsVisible) errors++;

    // 7. Scenario slider interaction
    console.log("7. Drag scenario slider to +50%...");
    await page.evaluate(() => {
      const slider = document.querySelector('input[type="range"]');
      if (slider) {
        const nativeInput = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, "value");
        nativeInput.set.call(slider, "50");
        slider.dispatchEvent(new Event("input", { bubbles: true }));
        slider.dispatchEvent(new Event("change", { bubbles: true }));
      }
    });
    await delay(1500);
    await page.screenshot({ path: path.join(OUT, "desktop_impact_scenario.png"), fullPage: false });
    console.log("   screenshot: desktop_impact_scenario.png");

    // 8. Scroll to DEM map
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight * 0.6));
    await delay(1200);
    await page.screenshot({ path: path.join(OUT, "desktop_impact_dem.png"), fullPage: false });
    console.log("   screenshot: desktop_impact_dem.png");

    // 9. Light mode
    console.log("8. Light mode...");
    await page.emulateMediaFeatures([{ name: "prefers-color-scheme", value: "light" }]);
    await page.goto(BASE + "/impact", { waitUntil: "networkidle0", timeout: 30000 });
    await delay(2000);
    await page.screenshot({ path: path.join(OUT, "desktop_impact_light.png"), fullPage: false });
    console.log("   screenshot: desktop_impact_light.png");

    // 10. Mobile
    const mob = await browser.newPage();
    await mob.setViewport({ width: 375, height: 812, isMobile: true });
    mob.on("console", (m) => { if (m.type()==="error") consoleErrors.push("[mob] " + m.text()); });
    await mob.goto(BASE + "/impact", { waitUntil: "networkidle0", timeout: 30000 });
    await delay(2000);
    await mob.screenshot({ path: path.join(OUT, "mobile_impact.png") });
    console.log("   screenshot: mobile_impact.png");
    await mob.close();

  } finally {
    await browser.close();
  }

  const realErrors = consoleErrors.filter((e) =>
    !e.includes("ResizeObserver") && !e.includes("favicon") &&
    !e.includes("hydrat") && !e.includes("Non-Error")
  );

  console.log("\n=== STEP 11 SUMMARY ===");
  console.log(`API checks failed: ${errors}`);
  console.log(`Console errors:    ${realErrors.length === 0 ? "0 (PASS)" : realErrors.length}`);
  realErrors.forEach((e) => console.log("  ERR: " + e.substring(0, 120)));
  console.log("Overall: " + (errors === 0 && realErrors.length === 0 ? "PASS" : "NEEDS REVIEW"));
  process.exit(errors === 0 && realErrors.length === 0 ? 0 : 1);
}
run().catch((e) => { console.error(e); process.exit(1); });
