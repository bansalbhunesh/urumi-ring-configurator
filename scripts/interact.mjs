import { chromium } from "playwright";

const base = process.argv[2] ?? "http://localhost:3939";
const browser = await chromium.launch({
  headless: true,
  args: [
    "--ignore-gpu-blocklist",
    "--use-gl=angle",
    "--use-angle=swiftshader",
    "--enable-unsafe-swiftshader",
  ],
});
const page = await browser.newPage({ viewport: { width: 1280, height: 1000 } });
page.on("pageerror", (e) => console.log("[pageerror]", e.message));

await page.goto(base, { waitUntil: "networkidle" });
await page.waitForTimeout(4000);

const priceText = () =>
  page.locator("text=/\\$[0-9],?[0-9]+/").first().innerText();

console.log("initial price:", await priceText());

// Switch metal → Yellow Gold
await page.getByLabel("Yellow Gold").click();
await page.waitForTimeout(900);
console.log("after Yellow Gold:", await priceText());

// Switch stone → Princess
await page.getByRole("button", { name: /Princess/ }).click();
await page.waitForTimeout(1400);
console.log("after Princess:", await priceText());

await page.screenshot({ path: "interact-config.png" });

// Add to bag
await page.getByRole("button", { name: /Add to Bag/i }).click();
await page.waitForTimeout(1600);
const bodyText = await page.locator("body").innerText();
console.log("cart drawer has Subtotal:", bodyText.includes("Subtotal"));
console.log("cart shows Yellow/Princess:", /Yellow Gold/.test(bodyText) && /Princess/.test(bodyText));
await page.screenshot({ path: "interact-cart.png" });

await browser.close();
