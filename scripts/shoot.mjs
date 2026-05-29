import { chromium } from "playwright";

const url = process.argv[2] ?? "http://localhost:3000";
const out = process.argv[3] ?? "shot.png";
const wait = Number(process.argv[4] ?? 5000);
const w = Number(process.argv[5] ?? 1280);
const h = Number(process.argv[6] ?? 900);

const browser = await chromium.launch({
  headless: true,
  args: [
    "--ignore-gpu-blocklist",
    "--use-gl=angle",
    "--use-angle=swiftshader",
    "--enable-unsafe-swiftshader",
    "--enable-webgl",
  ],
});
const page = await browser.newPage({
  viewport: { width: w, height: h },
  deviceScaleFactor: 2,
});
page.on("console", (m) => console.log("[page]", m.type(), m.text()));
page.on("pageerror", (e) => console.log("[pageerror]", e.message, "\nSTACK:", e.stack));
page.on("requestfailed", (r) =>
  console.log("[reqfailed]", r.url(), r.failure()?.errorText),
);
page.on("response", (r) => {
  if (r.status() >= 400) console.log("[resp>=400]", r.status(), r.url());
});

await page.goto(url, { waitUntil: "networkidle", timeout: 60000 });
await page.waitForTimeout(wait);
await page.screenshot({ path: out });
console.log("saved", out);
await browser.close();
