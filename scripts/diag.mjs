import { chromium } from "playwright";

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
const page = await browser.newPage({ viewport: { width: 1000, height: 800 } });
page.on("console", (m) => console.log("[page]", m.type(), m.text()));
page.on("pageerror", (e) => console.log("[pageerror]", e.message));

await page.goto("http://localhost:3000", { waitUntil: "networkidle" });
await page.waitForTimeout(5000);

const info = await page.evaluate(() => {
  const c = document.querySelector("canvas");
  let gl = null,
    renderer = "none";
  if (c) {
    gl = c.getContext("webgl2") || c.getContext("webgl");
    if (gl) {
      const dbg = gl.getExtension("WEBGL_debug_renderer_info");
      renderer = dbg
        ? gl.getParameter(dbg.UNMASKED_RENDERER_WEBGL)
        : "unknown";
    }
  }
  return {
    hasCanvas: !!c,
    canvasW: c?.width ?? 0,
    canvasH: c?.height ?? 0,
    cssW: c?.clientWidth ?? 0,
    cssH: c?.clientHeight ?? 0,
    hasGL: !!gl,
    renderer,
    parentOpacity: c?.parentElement?.style.opacity ?? "n/a",
    bodyText: document.body.innerText.slice(0, 200),
  };
});
console.log("DIAG", JSON.stringify(info, null, 2));
await browser.close();
