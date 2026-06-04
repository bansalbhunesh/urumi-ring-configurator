/* eslint-disable @typescript-eslint/no-require-imports */
const { chromium } = require("playwright");
const BASE = process.argv[2] || "http://localhost:3000";
const TAG = process.argv[3] || "now";
(async () => {
  const b = await chromium.launch();
  const ctx = await b.newContext({ viewport: { width: 1440, height: 900 }, deviceScaleFactor: 1 });
  const page = await ctx.newPage();
  await page.addInitScript(() => {
    window.__SNAP__ = true; // converge the 3D director in one frame under headless rAF throttling
  });
  const errs = [];
  page.on("pageerror", (e) => errs.push(String(e)));
  await page.goto(BASE, { waitUntil: "domcontentloaded", timeout: 60000 });
  await page.waitForTimeout(6500); // GLB load + ring form
  const shots = [0, 0.18, 0.42, 0.68, 1.0];
  for (let i = 0; i < shots.length; i++) {
    await page.evaluate((f) => {
      const max = document.documentElement.scrollHeight - window.innerHeight;
      window.scrollTo({ top: max * f, behavior: "instant" });
    }, shots[i]);
    // With __SNAP__ the director converges in a single frame. Scroll nudges
    // reliably trigger that frame (headless throttles rAF), so nudge a few times.
    for (let n = 0; n < 4; n++) {
      await page.evaluate(() => window.scrollBy(0, 2));
      await page.waitForTimeout(150);
      await page.evaluate(() => window.scrollBy(0, -2));
      await page.waitForTimeout(150);
    }
    await page.waitForTimeout(500);
    await page.screenshot({ path: `test-results/sec-${TAG}-${i}.png`, timeout: 60000 });
  }
  console.log(errs.length ? "PAGE ERRORS:\n" + errs.slice(0, 8).join("\n") : "no page errors");
  await b.close();
})().catch((e) => { console.error("shot failed:", String(e)); process.exit(1); });
