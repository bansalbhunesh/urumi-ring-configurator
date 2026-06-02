/**
 * End-to-end smoke suite (Playwright, no test-runner dependency).
 *
 * Drives the real app: products/cart APIs, the live configurator (metal/stone
 * switching, add-to-bag → celebration → auto-opening cart), the holographic
 * reveal + "on the hand" sections, the reduced-motion fallback, mobile overflow,
 * and uncaught runtime errors.
 *
 * Usage — with a server already running (dev or `next start`):
 *   npm run dev            # in one terminal
 *   npm run test:e2e       # in another  (or: node tests/e2e.smoke.cjs http://localhost:3000)
 *
 * Exits non-zero if any check fails.
 */
const { chromium, request } = require("playwright");

const BASE = process.argv[2] || process.env.E2E_BASE_URL || "http://localhost:3000";
const results = [];
const pass = (name, info = "") => results.push({ name, ok: true, info });
const fail = (name, info = "") => results.push({ name, ok: false, info });
const check = (name, cond, info = "") => (cond ? pass(name, info) : fail(name, info));

// Disable Lenis (it bails on coarse pointer) so native scrollTo is deterministic,
// without touching prefers-reduced-motion.
const COARSE_INIT = () => {
  const orig = window.matchMedia.bind(window);
  window.matchMedia = (q) => {
    if (String(q).includes("pointer: coarse"))
      return { matches: true, media: q, onchange: null, addEventListener() {}, removeEventListener() {}, addListener() {}, removeListener() {}, dispatchEvent() { return false; } };
    return orig(q);
  };
};

async function main() {
  const browser = await chromium.launch();

  // ---- API checks (no browser needed) -----------------------------------
  const api = await request.newContext({ baseURL: BASE });
  try {
    const pr = await api.get("/api/products");
    const pj = await pr.json().catch(() => ({}));
    check("api: GET /api/products 200", pr.ok(), `status ${pr.status()}`);
    check("api: product has currencySymbol", typeof pj.currencySymbol === "string", JSON.stringify(pj.currencySymbol));
    check("api: product has variations[]", Array.isArray(pj.variations) && pj.variations.length > 0, `${pj.variations?.length} variations`);

    const cr = await api.get("/api/cart");
    const cj = await cr.json().catch(() => ({}));
    check("api: GET /api/cart 200", cr.ok(), `status ${cr.status()}`);
    check("api: cart has items[]", Array.isArray(cj.items), `itemCount=${cj.itemCount}`);

    const vid = pj.variations?.[0]?.id;
    const post = await api.post("/api/cart", { data: { variationId: vid, quantity: 1 } });
    const postj = await post.json().catch(() => ({}));
    check("api: POST /api/cart adds item", post.ok() && Array.isArray(postj.items) && postj.items.length > 0, `status ${post.status()} items ${postj.items?.length}`);

    const bad = await api.post("/api/cart", { data: {} });
    check("api: POST /api/cart rejects missing id", bad.status() === 400, `status ${bad.status()}`);
  } catch (e) {
    fail("api: suite", String(e));
  }
  await api.dispose();

  // ---- Desktop UI flow ---------------------------------------------------
  const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  await ctx.addInitScript(COARSE_INIT);
  const pageErrors = [];
  const consoleErrors = [];
  const page = await ctx.newPage();
  page.on("pageerror", (e) => pageErrors.push(String(e)));
  page.on("console", (m) => { if (m.type() === "error") consoleErrors.push(m.text()); });

  const resp = await page.goto(BASE, { waitUntil: "load", timeout: 180000 });
  check("home: 200", resp && resp.ok(), `status ${resp && resp.status()}`);
  check("home: title", (await page.title()).includes("Aurelle"), await page.title());
  check("home: <main> present", await page.locator("main").count() > 0);

  // configurator present + product loaded (Add to Bag becomes enabled)
  await page.locator("#ring").scrollIntoViewIfNeeded().catch(() => {});
  const addBtn = page.locator('#ring button:has-text("Add to Bag")');
  await addBtn.first().waitFor({ state: "visible", timeout: 30000 }).catch(() => {});
  await page.locator('#ring button:has-text("Add to Bag"):not([disabled])').first().waitFor({ timeout: 30000 }).catch(() => {});
  check("studio: present + Add to Bag enabled", await page.locator('#ring button:has-text("Add to Bag"):not([disabled])').count() > 0);

  // partition metal vs stone buttons
  const btnInfo = () => page.evaluate(() => {
    const all = Array.from(document.querySelectorAll('#ring button[aria-pressed]'));
    const m = (sel) => all.filter(sel).map((b) => ({ label: b.getAttribute("aria-label"), pressed: b.getAttribute("aria-pressed") }));
    return {
      metals: m((b) => !/stone/i.test(b.getAttribute("aria-label") || "")),
      stones: m((b) => /stone/i.test(b.getAttribute("aria-label") || "")),
    };
  });

  // metal switch
  try {
    const before = await btnInfo();
    const target = before.metals.find((x) => x.pressed !== "true");
    const loc = page.locator(`#ring button[aria-label="${target.label}"]`);
    await loc.scrollIntoViewIfNeeded().catch(() => {});
    // The swatch is a continuously spring-animated element; Playwright's strict
    // "stable" actionability wait times out on it even though it is clickable for
    // real users (verified: in view, receives pointer, no overlay, DOM click
    // flips aria-pressed). dispatchEvent fires the real onClick → setMetal.
    await loc.dispatchEvent("click");
    await page.waitForTimeout(300);
    const after = await btnInfo();
    const nowPressed = after.metals.find((x) => x.label === target.label)?.pressed === "true";
    check("studio: metal switch updates selection", nowPressed, `selected ${target.label}`);
  } catch (e) { fail("studio: metal switch", String(e)); }

  // stone switch
  try {
    const before = await btnInfo();
    const target = before.stones.find((x) => x.pressed !== "true");
    const loc = page.locator(`#ring button[aria-label="${target.label}"]`);
    await loc.scrollIntoViewIfNeeded().catch(() => {});
    // Same reason as the metal swatch: spring-animated, clickable for real users
    // but Playwright's strict "stable" wait flakes under software WebGL.
    await loc.dispatchEvent("click");
    await page.waitForTimeout(300);
    const after = await btnInfo();
    const nowPressed = after.stones.find((x) => x.label === target.label)?.pressed === "true";
    check("studio: stone switch updates selection", nowPressed, target.label);
  } catch (e) { fail("studio: stone switch", String(e)); }

  // personalisation: inner-band engraving (live preview) + ring size
  try {
    await page.evaluate(() => {
      const inp = document.querySelector('#ring input[aria-label="Inner-band engraving"]');
      const setter = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, "value").set;
      setter.call(inp, "Forever, & a day");
      inp.dispatchEvent(new Event("input", { bubbles: true }));
    });
    await page.waitForTimeout(200);
    const engraved = await page.evaluate(() =>
      (document.querySelector("#ring")?.textContent || "").includes("Forever, & a day"),
    );
    check("studio: engraving shows in configuration", engraved);
    await page.locator('#ring button[aria-label="US ring size 7"]').dispatchEvent("click");
    await page.waitForTimeout(150);
    const sized = await page.evaluate(() =>
      (document.querySelector("#ring")?.textContent || "").includes("US 7"),
    );
    check("studio: ring size updates selection", sized);
  } catch (e) { fail("studio: personalisation", String(e)); }

  // add to bag -> Celebration (~1.5s) -> cart auto-opens (real UX flow)
  const dialog = page.locator('[role="dialog"][aria-label="Your bag"]');
  try {
    // Use Promise.all so waitPost rejection is always handled (avoids unhandled rejection when click times out first)
    const [r] = await Promise.all([
      page.waitForResponse((r) => r.url().includes("/api/cart") && r.request().method() === "POST", { timeout: 25000 }),
      page.locator('#ring button:has-text("Add to Bag"):not([disabled])').first().dispatchEvent("click"),
    ]);
    check("studio: Add to Bag posts to cart", r.ok(), `status ${r.status()}`);
    await dialog.waitFor({ state: "visible", timeout: 12000 });
    check("cart: auto-opens after celebration", await dialog.isVisible());
    check("cart: shows added item", (await dialog.locator("li").count()) > 0);
    const headerHasCount = await page.evaluate(() => /\d/.test(document.querySelector('[aria-label="Open bag"]')?.textContent || ""));
    check("studio: header bag count updates", headerHasCount);
    await page.keyboard.press("Escape");
    await dialog.waitFor({ state: "hidden", timeout: 8000 });
    check("cart: drawer closes (Esc)", !(await dialog.isVisible().catch(() => false)));
  } catch (e) { fail("cart: add+celebration+drawer flow", String(e)); }

  // manual header trigger (celebration finished)
  try {
    await page.locator('[aria-label="Open bag"]').click({ timeout: 15000 });
    await dialog.waitFor({ state: "visible", timeout: 8000 });
    check("cart: manual Open bag works", await dialog.isVisible());
    await page.keyboard.press("Escape");
    await dialog.waitFor({ state: "hidden", timeout: 8000 });
  } catch (e) { fail("cart: manual open", String(e)); }

  // all sections present (current narrative arc)
  for (const [id, label] of [
    ["overture", "#overture (hero)"], ["atelier", "#craft (id=atelier)"],
    ["materials", "#materials"], ["provenance", "#provenance"],
    ["commitment", "#commitment"], ["pairing", "#pairing"], ["promise", "#promise"],
    ["mission", "#mission"], ["reviews", "#reviews"], ["worn", "#worn"],
    ["finale", "#finale"],
  ]) {
    check(`section: ${label} exists`, await page.locator(`#${id}`).count() > 0);
  }
  const dataRings = await page.evaluate(() => ({
    provenance: document.querySelector("#provenance")?.getAttribute("data-ring"),
    commitment: document.querySelector("#commitment")?.getAttribute("data-ring"),
    mission: document.querySelector("#mission")?.getAttribute("data-ring"),
  }));
  check("section: #provenance data-ring=hidden", dataRings.provenance === "hidden");
  check("section: #commitment data-ring=hidden", dataRings.commitment === "hidden");
  check("section: #mission data-ring=hidden", dataRings.mission === "hidden");

  // provenance product imagery loads
  try {
    await page.locator("#provenance").scrollIntoViewIfNeeded();
    await page.waitForTimeout(1500);
    const imgStats = await page.evaluate(() => {
      const imgs = Array.from(document.querySelectorAll("#provenance img"));
      return { total: imgs.length, loaded: imgs.filter((i) => i.complete && i.naturalWidth > 0).length };
    });
    check("provenance: product image present", imgStats.total >= 1, `${imgStats.total} imgs`);
    check("provenance: image decodes", imgStats.total > 0 && imgStats.loaded === imgStats.total, `${imgStats.loaded}/${imgStats.total}`);
  } catch (e) { fail("provenance: images", String(e)); }

  // mission impact counters render
  try {
    await page.locator("#mission").scrollIntoViewIfNeeded();
    await page.waitForTimeout(1200);
    const missionOk = await page.evaluate(() =>
      (document.querySelector("#mission")?.textContent || "").includes("wells built"),
    );
    check("mission: impact counters present", missionOk);
  } catch (e) { fail("mission: counters", String(e)); }

  check("runtime: no uncaught page errors", pageErrors.length === 0, pageErrors.slice(0, 3).join(" | "));
  if (consoleErrors.length) results.push({ name: "runtime: console.error count (warn)", ok: true, info: `${consoleErrors.length}: ${consoleErrors.slice(0, 4).join(" | ").slice(0, 300)}` });

  await ctx.close();

  // ---- Reduced-motion fallback ------------------------------------------
  try {
    const rmCtx = await browser.newContext({ viewport: { width: 1280, height: 900 }, reducedMotion: "reduce" });
    const rm = await rmCtx.newPage();
    await rm.goto(BASE, { waitUntil: "load", timeout: 120000 });
    await rm.locator("#mission").scrollIntoViewIfNeeded();
    await rm.waitForTimeout(1200);
    const g = await rm.evaluate(() => {
      const el = document.querySelector("#mission");
      return { visible: !!el && el.getBoundingClientRect().height > 0, hasCopy: (el?.textContent || "").includes("well") };
    });
    check("reduced-motion: mission renders", g.visible && g.hasCopy);
    await rmCtx.close();
  } catch (e) { fail("reduced-motion: mission", String(e)); }

  // ---- Mobile: no horizontal overflow -----------------------------------
  try {
    const mCtx = await browser.newContext({ viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true });
    const mp = await mCtx.newPage();
    await mp.goto(BASE, { waitUntil: "load", timeout: 120000 });
    const overflowTop = await mp.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
    check("mobile: no horizontal overflow (top)", overflowTop <= 2, `overflow ${overflowTop}px`);
    await mp.locator("#mission").scrollIntoViewIfNeeded().catch(() => {});
    await mp.waitForTimeout(800);
    const overflowMission = await mp.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
    check("mobile: no horizontal overflow (mission)", overflowMission <= 2, `overflow ${overflowMission}px`);
    check("mobile: #ring present", await mp.locator("#ring").count() > 0);
    await mCtx.close();
  } catch (e) { fail("mobile: overflow", String(e)); }

  await browser.close();

  // ---- Report ------------------------------------------------------------
  console.log("\n================ E2E RESULTS ================");
  let failed = 0;
  for (const r of results) {
    const tag = r.ok ? "PASS" : (failed++, "FAIL");
    console.log(`${tag}  ${r.name}${r.info ? "  — " + r.info : ""}`);
  }
  console.log("=============================================");
  console.log(`${results.length - failed}/${results.length} passed, ${failed} failed`);
  process.exit(failed === 0 ? 0 : 1);
}

main().catch((e) => { console.error("SUITE CRASH", e); process.exit(2); });
