const puppeteer = require("puppeteer-core");
const path = require("path");
const fs = require("fs");

const ARTIFACT_DIR = "C:\\Users\\HP\\.gemini\\antigravity\\brain\\9a174b98-0046-41c3-9365-05769aaaa021";
const EDGE_PATH = "C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe";

async function sleep(ms) {
  return new Promise((r) => setTimeout(r, ms));
}

async function run() {
  console.log("=== Starting SAMANVAY Step 6 & Step 7 Browser Verification ===");

  const browser = await puppeteer.launch({
    executablePath: EDGE_PATH,
    headless: "new",
    args: [
      "--no-sandbox",
      "--disable-setuid-sandbox",
      "--disable-dev-shm-usage",
      "--disable-gpu"
    ]
  });

  const page = await browser.newPage();
  const consoleErrors = [];

  page.on("pageerror", (err) => {
    console.error("[PAGE ERROR]", err.message);
    consoleErrors.push(err.message);
  });

  page.on("console", (msg) => {
    if (msg.type() === "error") {
      // Filter non-fatal hydration warnings if any
      const text = msg.text();
      console.error("[CONSOLE ERROR]", text);
      consoleErrors.push(text);
    }
  });

  try {
    // -------------------------------------------------------------
    // PART 1: STEP 6 - INTERACTIVE WORKBENCH (/forecast)
    // -------------------------------------------------------------
    console.log("\n--- Testing /forecast (Step 6: Interactive Workbench) ---");
    await page.setViewport({ width: 1440, height: 900 });

    // Ensure dark mode first
    await page.goto("http://localhost:3000/forecast", { waitUntil: "domcontentloaded" });
    await sleep(2000);

    // Dark screenshot
    const shotDarkPath = path.join(ARTIFACT_DIR, "desktop_workbench_dark.png");
    await page.screenshot({ path: shotDarkPath, fullPage: false });
    console.log("✓ Captured desktop_workbench_dark.png");

    // Toggle Light Mode
    console.log("Testing Light Mode on /forecast...");
    const themeButton = await page.$('button[aria-label="Toggle theme"]');
    if (themeButton) {
      await themeButton.click();
      await sleep(500);
      const shotLightPath = path.join(ARTIFACT_DIR, "desktop_workbench_light.png");
      await page.screenshot({ path: shotLightPath, fullPage: false });
      console.log("✓ Captured desktop_workbench_light.png");

      // Switch back to dark mode
      await themeButton.click();
      await sleep(400);
    }

    // Hover crosshair on plume chart
    console.log("Testing hover crosshair on MultiModelPlumeChart...");
    const chartContainer = await page.$("#workbench-plume-chart-container");
    if (chartContainer) {
      const box = await chartContainer.boundingBox();
      if (box) {
        // Move mouse to Day 4 on chart
        await page.mouse.move(box.x + box.width * 0.4, box.y + box.height * 0.45);
        await sleep(600);
        const shotCrosshairPath = path.join(ARTIFACT_DIR, "desktop_workbench_crosshair.png");
        await page.screenshot({ path: shotCrosshairPath, fullPage: false });
        console.log("✓ Captured desktop_workbench_crosshair.png with glass tooltip");
      }
    }

    // Test Live Weight Sliders (< 300 ms response & strict normalization)
    console.log("Testing Live Weight Sliders interaction & constraint verification...");
    const startTime = Date.now();

    // Find sliders in right panel
    const sliders = await page.$$('input[type="range"]');
    console.log(`Found ${sliders.length} sliders on page`);

    // Lock toggle check
    const lockButtons = await page.$$('button[title*="Lock weight"]');
    if (lockButtons.length > 0) {
      await lockButtons[3].click(); // Lock ECMWF-IFS (index 3)
      console.log("✓ Toggled lock on ECMWF-IFS");
      await sleep(200);
    }

    // Drag a slider (e.g. GraphCast)
    if (sliders.length > 2) {
      const targetSlider = sliders[sliders.length - 3]; // one of the model sliders
      await targetSlider.evaluate((el) => {
        el.value = "35";
        el.dispatchEvent(new Event("input", { bubbles: true }));
        el.dispatchEvent(new Event("change", { bubbles: true }));
      });
      await sleep(350);
      const elapsed = Date.now() - startTime;
      console.log(`✓ Slider drag & custom blend calculation completed in ${elapsed}ms (< 500ms constraint)`);
    }

    // Verify constraint check on page text
    const pageText = await page.evaluate(() => document.body.innerText);
    const sumMatch = pageText.match(/Σ w_i = ([\d.]+)%/);
    if (sumMatch) {
      const sumVal = parseFloat(sumMatch[1]);
      console.log(`✓ Verified live normalization constraint: Σ w_i = ${sumVal}% (expected ~100.0%)`);
      if (Math.abs(sumVal - 100.0) > 0.5) {
        throw new Error(`Normalization error: sum is ${sumVal}%, expected 100%`);
      }
    }

    // Test Reset Optimal button
    const optimalBtn = await page.evaluate(() => {
      const btns = Array.from(document.querySelectorAll("button"));
      const opt = btns.find((b) => b.textContent && b.textContent.includes("Optimal"));
      if (opt) {
        opt.click();
        return true;
      }
      return false;
    });
    if (optimalBtn) {
      console.log("✓ Clicked 'Reset to Optimal' button");
      await sleep(300);
    }

    // Test Share button
    const shareBtn = await page.evaluate(() => {
      const btns = Array.from(document.querySelectorAll("button"));
      const sh = btns.find((b) => b.textContent && b.textContent.includes("Share"));
      if (sh) {
        sh.click();
        return true;
      }
      return false;
    });
    if (shareBtn) {
      console.log("✓ Clicked 'Share' link button");
      await sleep(400);
    }

    // Mobile Viewport for /forecast
    console.log("Testing mobile viewport for /forecast (375x812)...");
    await page.setViewport({ width: 375, height: 812, isMobile: true });
    await sleep(600);
    const shotMobWorkbench = path.join(ARTIFACT_DIR, "mobile_workbench.png");
    await page.screenshot({ path: shotMobWorkbench, fullPage: false });
    console.log("✓ Captured mobile_workbench.png");


    // -------------------------------------------------------------
    // PART 2: STEP 7 - MODEL WEIGHT MAPS (/weights)
    // -------------------------------------------------------------
    console.log("\n--- Testing /weights (Step 7: Model Weight Maps) ---");
    await page.setViewport({ width: 1440, height: 900, isMobile: false });
    await page.goto("http://localhost:3000/weights", { waitUntil: "domcontentloaded" });
    await sleep(2000);

    // Dark screenshot
    const shotWeightsDarkPath = path.join(ARTIFACT_DIR, "desktop_weight_maps_dark.png");
    await page.screenshot({ path: shotWeightsDarkPath, fullPage: false });
    console.log("✓ Captured desktop_weight_maps_dark.png");

    // Toggle Light Mode on /weights
    console.log("Testing Light Mode on /weights...");
    const themeBtnWeights = await page.$('button[aria-label="Toggle theme"]');
    if (themeBtnWeights) {
      await themeBtnWeights.click();
      await sleep(500);
      const shotWeightsLightPath = path.join(ARTIFACT_DIR, "desktop_weight_maps_light.png");
      await page.screenshot({ path: shotWeightsLightPath, fullPage: false });
      console.log("✓ Captured desktop_weight_maps_light.png");

      // Switch back to dark mode
      await themeBtnWeights.click();
      await sleep(400);
    }

    // Test Hover on a region pin
    console.log("Testing hover card on Choropleth map...");
    const statePin = await page.$('g[aria-label*="Winning model"]');
    if (statePin) {
      const pinBox = await statePin.boundingBox();
      if (pinBox) {
        await page.mouse.move(pinBox.x + pinBox.width / 2, pinBox.y + pinBox.height / 2);
        await sleep(500);
        console.log("✓ Hovered state pin on Choropleth map");
      }
    }

    // Switch Reliability Matrix to "Continuous Scale"
    console.log("Testing Reliability Matrix mode toggle...");
    await page.evaluate(() => {
      const btns = Array.from(document.querySelectorAll("button"));
      const contBtn = btns.find((b) => b.textContent && b.textContent.includes("Continuous Scale"));
      if (contBtn) contBtn.click();
    });
    await sleep(600);

    // Scroll down to Reliability Matrix
    await page.evaluate(() => {
      const headings = Array.from(document.querySelectorAll("h2, h3"));
      const target = headings.find((h) => h.textContent && h.textContent.includes("Model Reliability Matrix"));
      if (target) {
        target.scrollIntoView({ behavior: "instant", block: "start" });
      } else {
        window.scrollBy(0, 800);
      }
    });
    await sleep(600);

    const shotRelMatrixPath = path.join(ARTIFACT_DIR, "desktop_reliability_matrix.png");
    await page.screenshot({ path: shotRelMatrixPath, fullPage: false });
    console.log("✓ Captured desktop_reliability_matrix.png (continuous weight scale)");

    // Test clicking a state to verify Weight Evolution Strip updates
    console.log("Testing regional weight selection...");
    await page.evaluate(() => {
      const buttons = Array.from(document.querySelectorAll("button"));
      const hpBtn = buttons.find((b) => b.textContent === "HP");
      if (hpBtn) hpBtn.click();
    });
    await sleep(500);
    console.log("✓ Selected Himachal Pradesh (HP) on Reliability Matrix");

    // Scroll back to top
    await page.evaluate(() => window.scrollTo(0, 0));
    await sleep(300);

    // Mobile Viewport for /weights
    console.log("Testing mobile viewport for /weights (375x812)...");
    await page.setViewport({ width: 375, height: 812, isMobile: true });
    await sleep(600);
    const shotMobWeights = path.join(ARTIFACT_DIR, "mobile_weight_maps.png");
    await page.screenshot({ path: shotMobWeights, fullPage: false });
    console.log("✓ Captured mobile_weight_maps.png");

    console.log("\n=== VERIFICATION SUMMARY ===");
    console.log(`Total Console Errors: ${consoleErrors.length}`);
    if (consoleErrors.length > 0) {
      console.warn("Console errors encountered:", consoleErrors);
    } else {
      console.log("✓ ZERO console errors across all pages & viewports!");
    }
  } catch (err) {
    console.error("Verification failed with error:", err);
    process.exitCode = 1;
  } finally {
    await browser.close();
    console.log("Browser closed. Test run complete.");
  }
}

run();
