# Aurelle — Brutal Audit & Improvement Plan

> Grounded against: the assignment PDF, the reference Loom (ORYZO by Lusion), the running app
> (`localhost:3000`, captured via Playwright), and a full read of the source.
> The reference video is the **baseline to exceed**, not the goal.

---

## What the reference actually teaches

The reference Loom is **ORYZO by Lusion** — a premium product site. It is not a ring, but it defines
the bar for *feel*:

- **Typography is the hero** — huge, confident display type, tightly set.
- **Warm, photographic materials** — cream / olive / wood, real light, real depth. Never a flat void.
- **Wit with restraint** — copy is playful and self-aware ("A visualization, not a warranty").
- **Tech as garnish, not spectacle** — a small "FRICTION COEFFICIENT (EST): 0.80" card, *not* a
  full-screen wormhole.
- **The product is always beautifully lit and central**, draggable, shown from many angles.
- **Calm, legible motion** — clean "scroll to continue" cues; nothing fights the content.

Premium = **confidence + restraint + warmth**. Spectacle is not premium.

---

## Brutal audit

### Assignment compliance
| Requirement | State | Note |
|---|---|---|
| Rotate ring (smooth, premium) | ⚠️ Partial | Custom drag works, but a dead `OrbitControls` is overwritten every frame; ring has no visual presence to rotate. |
| Switch metals live | ✅ | Hover-preview + commit; material lerps. Good idea, kept. |
| Swap centre stone live | ✅ | round / oval / princess, animated swap. |
| Add to cart = exact config | ✅ | Cart carries metal+stone+SKU. |
| Live price from WooCommerce | ✅ (architecturally) | `Store API` BFF + honest mock fallback. Solid. Docker not runnable in this env. |
| Premium, "not an engineering demo" | ❌ | **The single biggest failure.** See below. |
| Bonus: 3D picker | ✅ (but costly) | 3 live `<Canvas>` thumbnails = 4 WebGL contexts. |
| `docker compose up` < 5 min | ✅ (code) | WP + WooCommerce + wp-cli seeder of a real variable product. Correct. |

### The core failure: it reads as an engineering demo, not a jewelry brand
The scroll experience is literally coded as **"Inception Space Bend", "Interstellar Wormhole",
"Doctor Strange Multiverse Split"**, with a "Technical Specification Sheet" listing
`Gaussian bump function, σ = 0.38` and `phase offset π radians`. The brief explicitly says the
opposite: *"Reads like an engagement-ring brand site, not an engineering demo."* No luxury jeweller
ships a multiverse split. This is earnest sci-fi where the reference is witty restraint.

### Motion / visual evidence (from the running app)
1. **The ring is nearly invisible** (P0). On pure `#070605` black the metal has nothing to reflect,
   so the hero product renders as a faint dark/white wire-loop. The whole point of the page has no
   presence.
2. **Ring collides with body copy** (P0). Mid-scroll the scaled ring is drawn straight over the
   "Backed for Life" card and paragraph text. Broken, amateur.
3. **Engraving section over-promises** (P1). Full-viewport "type to see it materialise in real time"
   — nothing materialises; the README admits engraving isn't rendered.
4. **Competing ring transforms** (P1). `<Float>` + "living" wobble + "heartbeat" scale + world-bend
   shader + scroll scale/position all stack → busy, unstable motion.
5. **Blocking 2.5s intro** (P2). Config panel is `delay: 2.5s`; controls appear late.
6. **One-note cold palette** (P2). Pure black + gold lacks the warmth/depth of the reference.
7. **Type lacks scale/impact** (P2). Marcellus is elegant but small; hero doesn't command.

### Technical
- `build` + `tsc` pass; no runtime console errors. Data layer (`woo.ts`, `mock.ts`, API routes,
  `config.ts`) is genuinely clean and well-reasoned — **keep it**.
- 4 simultaneous WebGL contexts is a perf/robustness risk.

---

## Top improvements, ranked by Impact ÷ Effort

**P0 — do first (correctness + the product itself)**
1. **Light the ring like jewelry.** Studio HDRI + key/rim lights + a warm radial backdrop behind the
   product so metal has something to reflect; tune the diamond. *Turns the hero from invisible to a
   showpiece.* (high impact / med effort)
2. **Kill the scroll-collision.** Give the ring a deterministic, safe on-screen "stage" per section;
   copy lives in the opposite column. Never overlap. (high / med)
3. **Delete the sci-fi choreography** — world-bend, wormhole corridor, multiverse, constellation,
   laser sparks. Replace with calm, restrained camera framing. (high / med — mostly deletion)
4. **Remove the dead `OrbitControls`** that fights the scroll camera. (high / low)

**P1 — premium feel**
5. Simplify ring motion to one tasteful idle + reliable drag (mouse+touch) with inertia + reset.
6. Warm, deepen the palette; add depth (vignette/gradient stage), raise muted-text contrast.
7. Replace the "Technical Specification Sheet" with an elegant, human spec/craft block (witty, not math).
8. Cut or honestly reframe the engraving section (no false "materialise" promise).
9. Non-blocking intro: product + panel arrive fast with a tasteful stagger; real loading skeleton.
10. Hero typography: larger, more confident scale and rhythm.

**P2 — craft & polish**
11. Tighten metal/stone selectors (tactile states, keyboard parity already present).
12. Cart: thumbnail reflecting config, clear demo-vs-live checkout semantics (present, refine copy).
13. Reduced-motion paths for camera/idle/cursor.
14. Reduce WebGL cost: keep 3D thumbnails lightweight or share context; cap DPR by tier.
15. Mobile: give the ring real presence, fix headline wrap, ensure sticky CTA never covers content.

**P3 — verification & docs**
16. Playwright visual checks (desktop hero, scroll stops, cart, mobile) + console-error gate.
17. Honest README/ARCHITECTURE on live-vs-demo posture and scope decisions.

---

## Execution strategy
Keep the strong foundation (Next 16 App Router, R3F, the WooCommerce BFF + mock, config source of
truth). Rebuild the **experience layer** toward restrained luxury: a luminous configurator hero as the
unambiguous centrepiece, a few collision-free editorial sections, calm motion, warm depth. Cut every
sci-fi gimmick. Verify continuously with build + Playwright screenshots.

*Decisions documented in README. This file tracks the audit; progress is committed incrementally.*

---

## Phase 4 — Re-evaluation (after the rebuild)

Verified via `tsc`, `eslint`, `next build`, and Playwright (desktop + mobile,
section-anchored screenshots, plus a scripted config→cart run). No console/page
errors in any capture.

### Before → after
| Issue | Before | After |
|---|---|---|
| Hero product | Invisible dark wire-loop on black | Luminous, faceted gold ring with a sparkling stone |
| Scroll | Ring drawn over body copy | Deterministic per-section "stage"; never overlaps text |
| Tone | Inception / wormhole / multiverse "spec sheet" | Restrained editorial — atelier, materials, finale |
| Metal swap | Risk of disappearing | Smooth lerp; a failed-shader (invisible) bug fixed |
| Intro | 2.5s blocking | Controls in ~0.3s; ring materialises in <1s |
| Cart | Generic glyph, light scrim washing the page | Metal-tinted thumbnail + cut glyph; dark scrim |
| Palette | Flat pure black | Warm, layered depth |
| Motion | Float + wobble + heartbeat + bend stacked | One idle + reliable drag w/ inertia; reduced-motion paths |

### Assignment scorecard
Rotate ✅ · metals live ✅ · stone live ✅ · add-to-cart exact config ✅
(`$2,400→$2,580→$2,840`, SKU `TWIST-YELLOWGOLD-PRINCESS`) · live price via Store API
+ honest mock ✅ · premium / not-a-demo ✅ (the core inversion) · 3D picker bonus ✅ ·
`docker compose up` stack ✅ (code verified; Docker absent in this env).

### vs the reference (ORYZO)
Matches the bar on confident type, warm depth, restraint, clean motion and
product presentation — and exceeds it for the jewelry context by making the
*product itself* the live, configurable hero. Remaining headroom (future passes): even bolder hero typography and collapsing
the 3 picker sub-canvases into one shared context for lower-end mobile GPUs.

---

## The 50 — honest status

Verified by `eslint` / `tsc` / `next build` and two Playwright suites
(`.audit/verify.mjs` = 7 checks incl. all 9 combos, API contract, ring-visibility;
`.audit/shot.mjs` = desktop+mobile captures).

✅ = done · ◐ = partial · ⊘ = not applicable here

1. ✅ Metal-change disappearance (shader-compile bug fixed)
2. ✅ Live data path (Store API) + honest demo posture · live stack code-complete
3. ✅ Mobile hero never overlaps
4. ✅ Scroll camera synced to DOM section anchors
5. ✅ Drag-to-rotate from first viewport; hint honest
6. ✅ Real 3D stone thumbnails (same geometry as hero)
7. ✅ Load choreography (materialise; price never blank via `priceFor`)
8. ✅ ESLint clean (React 19 rules)
9. ✅ Animation randomness seeded outside render
10. ✅ No render-time ref visibility hacks (removed)
11. ✅ Metal change crossfades (lerp, no remount)
12. ✅ Diamond reads faceted/brilliant under new lighting
13. ✅ Lighting via Lightformers — no runtime HDRI fetch
14. ✅ Reduced-motion across camera/idle/intro/bloom/cursor/celebration/Lenis
15. ✅ Raised muted/ink-soft contrast; badge black-on-gold
16. ✅ Visible focus states throughout
17. ✅ ≥44px touch targets
18. ✅ Accessible names (stones); engraving input removed
19. ✅ Price is one `aria-live` value
20. ✅ Celebration shortened + skippable (click / Esc / Enter)
21. ✅ Cart line thumbnail reflects metal + cut
22. ◐ Cart error handling via toast (no explicit retry button)
23. ✅ Checkout disabled + clearly demo-only
24. ✅ Sticky bar timing; never covers content
25. ✅ First-viewport composition + "scroll to explore" cue
26. ✅ Ownable type (Marcellus / Manrope), scaled up
27. ✅ Warm, layered palette (not flat black)
28. ◐ Inspection: reset-view added; full top/side/macro presets deferred (drag covers it)
29. ✅ Rotation inertia + reset
30. ✅ Hover preview non-destructive + keyboard-equivalent
31. ✅ Tactile selector states
32. ✅ Network-aware live/demo status pill
33. ✅ No demo-price flicker (computed fallback)
34. ✅ Full config in URL (`?metal=&stone=`), restored on load
35. ✅ Configuration summary by the CTA
36. ✅ Engraving reframed (removed false "materialise" promise)
37. ✅ Sci-fi "spec sheet" replaced with editorial
38. ✅ AI-aesthetic tells removed (wormhole, multiverse, mono-math)
39. ✅ Empty-cart polish + focus return
40. ✅ Cart focus trap + Escape
41. ✅ Header legible across scroll
42. ✅ DPR + transmission resolution by device tier
43. ✅ Canvas render loop pauses when tab hidden / cart open
44. ✅ E2E across all 9 metal×stone combos + totals (`verify.mjs`)
45. ✅ Desktop+mobile capture harness (`shot.mjs`)
46. ✅ Ring-visibility pixel check (mean luma 79/255)
47. ✅ API contract checks for `/api/products` + `/api/cart`
48. ⊘ Docker smoke — Docker absent in this env; `compose`/`provision`/`seed` reviewed
49. ✅ README honest about demo vs live
50. ✅ Final polish pass (spacing, rhythm, timing, mobile QA)

**47 done · 2 partial · 1 N/A.**

