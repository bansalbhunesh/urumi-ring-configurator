<div align="center">

# ✦ AURELLE ✦

### THE ETERNAL CIRCLE

*A cinematic, interactive story about the journey from possibility to commitment.*

**Not a product page. Not a configurator. An experience.**

The user should never feel they are shopping.
They should feel they are witnessing the birth of something meaningful.

`Next.js 16` · `React Three Fiber` · `GLSL` · `Framer Motion` · `Headless WooCommerce` · `Tailwind v4`

</div>

---

> The screen is nearly black.
> A faint particle of light appears.
> Nothing else.
>
> The user scrolls.
>
> The particle moves. A second appears. Then a third — like stars forming.
> They orbit. They converge. The first facet catches the light.
>
> *Every forever begins as a possibility.*

This is an engagement-ring experience built like a film. A shopper configures a
made-to-order twist solitaire — metal, centre stone — and watches every choice
reflected **live** on a real-time 3D ring, while a ten-act narrative carries them
from the first spark of light to the weight of the final decision. Pricing and
cart run on a **headless WooCommerce** store, with a seeded fallback so the
experience never breaks.

The product is not the story. **The transformation is the story.**
The ring is simply the artifact left behind.

---

## ✦ The ten acts

Each scroll is a new scene in a film — its own lighting, camera, motion, emotion.
The user should never feel they are on the same page twice.

| | Act | The scene |
|---|---|---|
| **I** | *Before the ring exists* | Particles of light converge out of black into the first facet. A possibility. |
| **II** | *The birth of light* | A single beam enters a crystal and breaks into spectrum. *Beauty begins where light finds form.* |
| **III** | *The ring is born* | Metal **materialises** — grown, not assembled — as the ring scales into the stage. |
| **IV** | *The materials of forever* | Three metals, three worlds. Switch the gold and the **room itself** shifts — moonlight, heritage, intimacy. |
| **V** | *The personality of the stone* | Round, oval, princess — introduced as characters, not options. |
| **VI** | *Hidden precision* | The ring resolves into a living **blueprint** — diameters, table angle, carat, drawn on stroke by stroke. *Luxury is precision.* |
| **VII** | *The human connection* | Silence. The ring settles onto a finger. Real scale. No UI. Just the moment. |
| **VIII** | *The weight of choice* | Every decision named back to you. The price stops being a number and becomes a **sum of meaning**. |
| **IX** | *Your creation* | Everything converges into the photoreal ring — built from every choice. *No one else will create this exact ring.* |
| **X** | *Forever* | The world goes quiet. Only the ring, the price, the decision. *Some choices last forever.* |

The whole journey is **scroll-scrubbed**: like an Apple image-sequence reveal, but
done in *live 3D* — scrolling turns the real ring (no baked frames, full
configurability) and it holds its frame when you stop.

---

## ✦ The philosophy

Every element answers one question: **does this increase the perceived value of
the ring?** If not, it's cut.

That ruthlessness is the whole design. The ring is the only hero — luminous,
faceted, draggable — on a deep, vignetted stage lit by a single key, a cool rim,
and one breathing pool of warm light. Bloom is a *whisper* (only the diamond's
sparkle glows; the metal reads as metal, never neon). No scattered particles, no
random effects, no clutter. **Bold ≠ cluttered.** Luxury is restraint, material
truth, and cinematic motion in service of one object.

The diagrammatic interludes (Acts II, VI, VII) share a single **gold line-art
language** — the experience never feels like a collection of effects, it feels
like one authored thing.

---

## ✦ Run it

### Option A — the full stack (live WooCommerce), one command
> Requires Docker.
```bash
docker compose up
```
Brings up MariaDB, WordPress + WooCommerce, a one-shot provisioner that installs
the plugin and seeds the **Twist Engagement Ring** variable product (3 metals × 3
stones, priced to match the app), and the Next.js frontend wired to the
WooCommerce **Store API**.

- **App** → http://localhost:3000
- **Store** → http://localhost:8080 · WP admin `admin / admin`

First boot takes ~1–2 min while WordPress installs and the product seeds; the app
shows seeded data until the store answers, then flips to live automatically.

### Option B — frontend only (preview mode)
```bash
npm install
npm run dev          # http://localhost:3000
```
With `WOOCOMMERCE_ENABLED` unset, the same API routes return seeded data in the
**identical response shape** — checkout is gracefully disabled rather than faking
an order. Point it at a real store by copying `.env.example` → `.env.local` and
setting `WOOCOMMERCE_ENABLED=true` + `WOOCOMMERCE_URL`.

---

## ✦ The engineering

**One fixed 3D canvas. One ring. Ten scenes.** A single full-page alpha `<Canvas>`
renders the ring for the entire journey. A *stage director* reads each section's
`data-ring` zone every frame and parks the ring in a deterministic on-screen
position, scale and camera framing — so it's always beautifully composed and
**never collides with copy**, on any viewport.

| Layer | What it does |
|---|---|
| **Next.js 16 (App Router, Turbopack)** | Server route handlers keep WooCommerce server-side behind one clean `/api/products` + `/api/cart` contract. |
| **React Three Fiber + drei + postprocessing** | React-native 3D; Zustand state drives materials, camera and the scroll-scrubbed turntable. Restrained Bloom + Vignette. |
| **GLSL** | A Simplex-noise *materialise* shader (the ring's one-time birth) and procedural twist-band curve math — the band is generated, not modelled. |
| **`MeshTransmissionMaterial`** | The centre stone refracts the studio lights as a real high-IOR brilliant. |
| **Tailwind v4 + Framer Motion + Lenis** | Design-system tokens, editorial motion, eased scroll (off for touch + reduced-motion). |
| **Zustand + TanStack Query** | Local config state + server cache for product/cart, decoupled from React re-renders for the per-frame 3D rig. |

The **3D stone picker** is no flat thumbnail: each option renders the *same
faceted geometry* as the hero stone in its own miniature `<Canvas>`, so what you
click is exactly what lands on the ring. Switching metal tints the live ring,
shifts the global atmosphere, and updates the price — instantly.

See `ARCHITECTURE.md` (data flow + stage-director camera), `STORY.md` (the ten-act
blueprint), and `DESIGN-RESET.md` (the design-direction audit).

---

## ✦ Quality

End-to-end verified with Playwright (software-WebGL, console-error-clean):

- **API contract** — 9 variations, correct prices, cart POST + validation
- **Configurator** — all 9 metal × stone combos drive the right price
- **Full journey** — all 13 scenes traversed top-to-bottom, desktop **and** mobile, zero console errors
- **Reduced-motion** — graceful degradation, hydration-clean
- **Ring luminosity** — a luma check guards against the ring ever rendering blank or blown-out

Every commit is `tsc` + `eslint` + `next build` green. Effects are gated behind
device-tier + reduced-motion flags; the frame loop pauses when the tab is hidden
or the cart is open.

---

## ✦ What's next
1. **Live checkout hand-off** to a WooCommerce checkout session.
2. **Inner-band engraving** as a `CanvasTexture` on the shank (kept out rather than shipped as a half-promise).
3. **Parametric ring sizing** with a live band-thickness preview.
4. **Act VII**, evolved — a photoreal hand plate for the human-connection beat.

---

## ✦ Honesty
- Docker was unavailable in the finishing environment, so the live stack was
  verified by review of `docker-compose.yml` + `docker/{provision.sh,seed.php}`
  and by exercising the **identical Store-API code paths** against the mock. The
  seeded fallback is exercised end-to-end (price + exact-config cart) via Playwright.
- The headless test harness uses **software WebGL**, which does not reproduce
  real-GPU HDR bloom — so bloom/exposure are tuned conservatively, and real-GPU
  rendering remains the ground truth.

<div align="center">

---

*Some choices last forever.*

</div>
