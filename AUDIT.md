# Aurelle — Brutal Audit, Top-50 Plan, Execution & Re-Evaluation

Grounded against: the assignment PDF, the reference Loom (**ORYZO by Lusion**,
oryzo.ai — captured frame-by-frame + full DOM), the deployed app, and the source.
Reference repository was not provided. The reference video is the **baseline to
exceed**, not the goal.

---

# PHASE 1 — BRUTAL AUDIT

## What the reference (ORYZO / Lusion) sets as the bar
A premium product site whose DNA is: **huge confident display type**; **warm,
photographic materials** (cream/olive/wood) — never a flat void; **wit with
restraint** ("A visualization, not a warranty"); **tech as garnish** (a small
"FRICTION COEFFICIENT 0.80" card, not full-screen VFX); the **product always
beautifully lit, central, and draggable**, shown from many angles; **calm,
legible motion** with clear scroll cues; a **dark→cream flip** palette-cleanser.
Premium = confidence + restraint + warmth. Spectacle is *not* premium.

## Assignment compliance
| Requirement | Original state | Now |
|---|---|---|
| Rotate ring (smooth, mouse+touch) | ⚠️ dead OrbitControls; ring invisible | ✅ drag + inertia + idle + view presets |
| Switch metals live | ✅ (hover-preview + commit) | ✅ retained |
| Swap centre stone live | ✅ round/oval/princess | ✅ retained |
| Add to cart = exact config | ✅ | ✅ (SKU/metal/stone verified) |
| Live price from WooCommerce | ✅ Store-API BFF + honest mock | ✅ retained |
| Premium / "not an engineering demo" | ❌ **the core failure** | ✅ rebuilt (below) |
| Bonus: 3D picker | ✅ live mini-canvases | ✅ + photoreal showcase added |
| `docker compose up` < 5 min | ✅ code (WP+Woo+seeder) | ✅ frontend now waits on seeder |
| Deliverables: app/README/architecture | partial | ✅ + this audit |

**Original core failure:** the build was an *engineering demo* — scroll coded as
"Inception Space Bend / Interstellar Wormhole / Doctor Strange Multiverse," a
mono-font "Technical Specification Sheet" (`Gaussian bump function σ = 0.38`), and
a hero ring that **rendered invisible** (a duplicate-`varying` shader-compile bug)
and **collided with body copy** mid-scroll. The opposite of the brief.

## Motion audit (reference vs original → now)
- **Scene transitions:** abrupt VFX phase-jumps → calm per-section ring "stage" director (damped).
- **Camera movement:** chaotic fly-through fighting copy → small flattering reframings (¾ / stone close / band / centred finale).
- **Hover states:** metal hover-preview (kept); links/buttons have focus+hover underlines.
- **Loading states:** blank canvas + 2.5s blocking intro → fast word-rise reveals, materialise-in, lazy-mounted heavy model. *Gap:* no poster still before showcase 3D resolves.
- **Scroll behaviour:** ring drawn over text (broken) → collision-safe `data-ring` zones; Lenis eased (off for touch/reduced-motion).
- **Micro-interactions:** magnetic buttons, odometer price, skippable celebration, cart retry, drag-to-inspect.
- **Motion timing / easing:** unified `cubic-bezier(.22,1,.36,1)`; damped frame lerps.
- **Perceived performance:** 4 always-on WebGL contexts + heavy VFX → canvas pauses when hidden/cart-open, model lazy-loads, 33.6MB→1.7MB. *Gap:* picker thumbnails + hero + showcase add up on low-end mobile.
- **Premium feel:** transformed sci-fi → restrained-but-bold luxury.

## Visual audit (reference vs now)
- **Typography:** small thin Marcellus → **Fraunces** display, fluid to ~13rem, word-rise reveals. *Gap:* kerning on the very largest sizes.
- **Spacing/composition:** editorial left-columns, generous whitespace, dashlines.
- **Hierarchy:** eyebrow → giant headline → body → action.
- **Depth:** warm layered background, vignette, contact shadows (was flat black).
- **Lighting/materials:** studio Lightformers + warm "room" fill so metal reads luminous; photoreal Tripo model in the showcase.
- **Luxury perception / emotional impact:** witty-romantic copy, dark→cream "Promise" flip, testimonials.

## Issues ranked by impact (highest first)
1. Invisible hero ring (shader bug) — **fixed**
2. Sci-fi "engineering demo" tone — **fixed**
3. Ring/text scroll collisions — **fixed**
4. Flat-black, no depth/warmth — **fixed**
5. Weak/small typography — **fixed**
6. Blocking 2.5s intro — **fixed**
7. No photoreal product fidelity — **addressed** (Tripo showcase)
8. Perf (multi-canvas, 33MB model) — **mostly addressed**; mobile headroom remains
9. No poster/instant still for heavy showcase — **open**
10. Mobile QA of the new sections — **needs a pass**

---

# PHASE 2 — TOP 50 IMPROVEMENTS (sorted by Impact ÷ Effort, highest first)

Format: **Title** — *Why* / *Visual* / *UX* / *How*. Status: ✅ done · ◐ partial · ○ open · ⊘ blocked.

1. **Light the ring like jewellery** ✅ — *Why:* it was invisible. *Visual:* luminous gold. *UX:* something to rotate. *How:* studio Lightformers + key/rim + warm room fill + contact shadow.
2. **Fix invisible-band shader bug** ✅ — *Why:* material failed to compile. *Visual:* ring renders. *UX:* core works. *How:* removed duplicate `varying`.
3. **Kill the sci-fi scroll/VFX** ✅ — *Why:* "not an engineering demo." *Visual:* restraint. *UX:* legible. *How:* deleted wormhole/multiverse/world-bend.
4. **Collision-safe ring stage** ✅ — *Why:* ring sat on text. *Visual:* clean. *UX:* readable. *How:* per-section `data-ring` director.
5. **Fraunces display + fluid scale** ✅ — *Why:* timid type. *Visual:* commanding. *UX:* hierarchy. *How:* `.display-1/2/3` clamps + word-rise.
6. **Warm, layered palette + depth** ✅ — *Why:* flat void. *Visual:* richness. *UX:* mood. *How:* body gradient, vignette, warmer tokens.
7. **Non-blocking intro** ✅ — *Why:* 2.5s wait. *Visual:* momentum. *UX:* instant controls. *How:* removed delay; fast reveals.
8. **Remove dead OrbitControls** ✅ — *Why:* fought scroll cam. *UX:* predictable. *How:* custom drag only.
9. **Drag w/ inertia (mouse+touch)** ✅ — *Why:* premium rotate. *UX:* tactile. *How:* yaw accumulator + decay.
10. **Honest live-WooCommerce posture** ✅ — *Why:* trust. *UX:* clear live/demo. *How:* status pill + mock parity.
11. **Cart = exact config + tinted thumbnail** ✅ — *Visual:* metal chip. *UX:* confidence. *How:* map attrs→swatch/glyph.
12. **Dark→cream "Promise" flip** ✅ — *Why:* reference cleanser. *Visual:* drama. *How:* `.paper` section, `data-ring=hidden`.
13. **Live spec card ("The Cut")** ✅ — *Why:* reference data-card. *Visual:* tasteful data. *UX:* reflects stone. *How:* store-driven card.
14. **Testimonials with personality** ✅ — *Why:* warmth/wit. *UX:* social proof. *How:* review cards + stars.
15. **Per-section ring framing** ✅ — *Why:* "many angles." *Visual:* cinematic. *How:* `data-frame` stone/band/full.
16. **Photoreal model integration (Tripo)** ✅ — *Why:* fidelity. *Visual:* real ring. *How:* GLB loader + auto-fit + tint.
17. **Compress model 33.6→1.7MB** ✅ — *Why:* perf. *UX:* fast. *How:* gltf-transform / plain low-res variant.
18. **Full-bleed showcase** ✅ — *Why:* hero product moment. *Visual:* impact. *How:* edge canvas + overlaid copy + scrims.
19. **Lazy-mount heavy canvas** ✅ — *Perf:* first paint. *How:* IntersectionObserver.
20. **Pause canvas hidden/cart-open** ✅ — *Perf:* GPU. *How:* `frameloop="never"`.
21. **Reduced-motion paths** ✅ — *a11y.* *How:* camera/idle/bloom/Lenis guards.
22. **Focus states + ≥44px targets** ✅ — *a11y.* *How:* focus-visible rings, min-h-11.
23. **Skippable celebration + cart retry** ✅ — *UX:* control + resilience.
24. **URL share-state** ✅ — *Why:* shareable config. *How:* `?metal=&stone=`.
25. **View presets (Front/¾/Side/Top)** ✅ — *UX:* inspection. *How:* pose targets.
26. **Scroll cue** ✅ — *Why:* reference affordance.
27. **Honest docs (Store API, docker, decisions)** ✅.
28. **ssr:false canvas** ✅ — *Why:* no hydration crash.
29. **Semantic headings** ✅ — *a11y.*
30. **DPR/transmission by device tier** ✅ — *Perf.*
31. **Poster still for showcase** ○ — *Why:* instant frame before 3D. *Visual:* no empty gap. *UX:* perceived speed. *How:* render one frame to webp, show under canvas.
32. **Mobile QA pass on new sections** ◐ — *Why:* verify Promise/Showcase/Testimonials at 390px. *How:* Playwright mobile shots + fixes.
33. **Tune showcase headline/ring overlap** ○ — *Visual:* clear the prongs. *How:* nudge camera Y / headline size.
34. **Reduce concurrent WebGL contexts on mobile** ◐ — *Perf.* *How:* static thumbnails on coarse pointers.
35. **Variant A/B of the Tripo model** ○ — *Visual:* pick best generation.
36. **Reduced-motion for showcase auto-rotate** ○ — *a11y.* *How:* disable autoRotate under reduced-motion.
37. **Show engraving in cart line (if added)** ○ — *UX* (engraving out of scope now).
38. **Keyboard rotate (arrow keys → yaw)** ○ — *a11y.*
39. **Header active-section highlight** ○ — *UX.* *How:* IntersectionObserver on sections.
40. **Marquee content refinement** ◐ — *Visual.*
41. **Real checkout hand-off (live mode)** ○ — *Functionality.* *How:* Woo checkout URL/session.
42. **Inner-band engraving (CanvasTexture)** ○ — *Delight*; deferred (no false promise now).
43. **Parametric ring-size preview** ○ — *Feature.*
44. **Texture → KTX2/basis** ○ — *Perf:* smaller GPU memory.
45. **Commit a Playwright tests/ suite** ◐ — *Quality* (currently in `.audit/`).
46. **Visual-regression baseline** ○ — *Quality.*
47. **Docker smoke test** ⊘ — needs Docker (absent here); compose/seed reviewed.
48. **Lighthouse / Core-Web-Vitals pass** ○ — *Perf:* tune LCP/CLS.
49. **Copy polish pass (every section voice)** ◐ — *Luxury perception.*
50. **Final spacing/rhythm/kerning sweep** ◐ — *Craft:* the last 5%.

---

# PHASE 3 — EXECUTION (what shipped)
Worked highest-impact first. Commits on `main`:
- `6036de0` restrained rebuild (lighting, stage director, removed VFX, shader fix)
- `f5a098f` view presets, cart retry, docker gating
- `70d75d8` Fraunces + fluid type + bold hero
- `d846082` cinematic sections (spec card, cream flip, testimonials)
- `8165d79` per-section ring framing
- `7b011e3` photoreal Tripo showcase (hybrid) + 33→1.6MB compression
- `5e401ed` cleaner plain-GLB variant
- `d58690d` full-bleed showcase

Each gated by `eslint` + `tsc` + `next build` + Playwright (`.audit/verify.mjs`,
7/7: all 9 metal×stone combos, `/api` contract, ring-visibility, no console errors).

---

# PHASE 4 — RE-EVALUATION (vs reference & assignment)
**Assignment:** all functional requirements met and verified; the "premium, not an
engineering demo" bar — the original failure — is now met. Docker stack code-correct
(not bootable in this environment).

**vs the ORYZO bar:** now matches on confident type, warmth, restraint, wit, clean
motion, and a draggable photoreal product. It **exceeds** the reference *for this
brief* by making the product a **live, configurable** purchase surface backed by
real WooCommerce data — which the reference (a static showcase) does not do.

**Still weaker / next pass (do not stop):** #31 poster still, #32 mobile QA, #33
overlap tune, #34 mobile WebGL budget, #48 Lighthouse — the current highest
Impact÷Effort open items, and the focus of the next iteration.
