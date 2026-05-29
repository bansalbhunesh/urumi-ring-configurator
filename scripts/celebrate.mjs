import { chromium } from "playwright";
const base = process.argv[2] ?? "http://localhost:3939";
const browser = await chromium.launch({
  headless: true,
  args: ["--ignore-gpu-blocklist", "--use-gl=angle", "--use-angle=swiftshader", "--enable-unsafe-swiftshader"],
});
const page = await browser.newPage({ viewport: { width: 1320, height: 1000 } });
page.on("pageerror", (e) => console.log("[pageerror]", e.message));
await page.goto(base, { waitUntil: "networkidle" });
await page.waitForTimeout(3500);
await page.getByRole("button", { name: /Add to Bag/i }).click();
await page.waitForTimeout(650);
await page.screenshot({ path: "celebrate.png" });
console.log("celebration captured");
await page.waitForTimeout(2200);
await page.screenshot({ path: "celebrate-cart.png" });
const body = await page.locator("body").innerText();
console.log("cart open w/ subtotal:", /SUBTOTAL|Subtotal/i.test(body));
await browser.close();
