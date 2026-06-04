/* eslint-disable @typescript-eslint/no-require-imports */
const { chromium } = require("playwright");
const BASE = process.argv[2] || "http://localhost:3000";
(async () => {
  const b = await chromium.launch();
  const page = await b.newPage();
  const reqs = [];
  const errors = [];
  page.on("response", (r) => reqs.push({ url: r.url(), status: r.status() }));
  page.on("console", (m) => { if (m.type() === "error") errors.push(m.text()); });
  page.on("pageerror", (e) => errors.push("PAGEERROR " + String(e)));
  await page.goto(BASE, { waitUntil: "domcontentloaded", timeout: 60000 });
  await page.waitForTimeout(9000);
  const glb = reqs.find((r) => r.url.includes("/models/ring.glb"));
  const canvas = await page.locator("canvas").count();
  console.log("ring.glb:", glb ? glb.status : "NOT REQUESTED");
  console.log("canvas elements:", canvas);
  console.log("errors:", errors.length, errors.slice(0, 5).join(" | "));
  await b.close();
  const ok = glb && glb.status === 200 && canvas > 0 && errors.length === 0;
  console.log(ok ? "RING OK" : "RING CHECK FAILED");
  process.exit(ok ? 0 : 1);
})().catch((e) => { console.error(String(e)); process.exit(1); });
