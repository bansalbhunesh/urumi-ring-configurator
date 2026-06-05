<div align="center">

<br>

# ✦ &nbsp; A U R E L L E &nbsp; ✦

### The Twist — a live, 3D, configurable engagement ring

*Turn it in the light. Change the metal, change the cut.*
*Every choice rendered live, in three dimensions.*

<br>

`Next.js 16` · `React Three Fiber` · `Framer Motion` · `Headless WooCommerce` · `Higgsfield AI`

<br>

**[ ▶ Open the experience ](#-open-the-experience)** · **[ The film, scene by scene ](#-the-film-scene-by-scene)** · **[ The brief, answered ](#-the-brief-answered)** · **[ Where AI did the work ](#-where-ai-did-the-heavy-lifting)**

</div>

---

> A ring is not a spec sheet. It's a moment.
> So this isn't a model-viewer bolted to a price — it's a **product page that behaves like a short film**: a single lit ring holds the stage, the configurator lives *in* the scene, and the only UI that survives is the choice itself.

The calibration target is **Do Amore** (considered, premium, photography-led) — re-shot in the cinematic language of **[oryzo.ai](https://oryzo.ai)** (Lusion). A warm, dark *atelier in the void* rather than a flat template or a clinical viewer. The ring is the hero. Everything else gets out of its way.

---

## ▶ &nbsp; Open the experience

**Instant — frontend only:**

```bash
npm install
npm run dev          # → http://localhost:3000
```

`WOOCOMMERCE_ENABLED` defaults to `false`, so every API route returns a seeded mock in the **identical shape** as the live Store API — product, every variation price, full cart CRUD — priced from the same source of truth the store uses. **Add to Bag works for all 8 × 10 configurations** whether or not the live store has that exact variation seeded; locally, checkout is *honestly disabled* (no faked orders) while the deployed showcase hands off to the live store checkout.

**Full stack — live WooCommerce in one command:**

```bash
docker compose up    # MariaDB → WordPress + WooCommerce → seeder → Next.js, wired to the Store API
```

Copy `.env.example` → `.env.local`, set `WOOCOMMERCE_ENABLED=true`, and the same frontend now reads live variations, prices and stock. `docker compose up` then serves the store on `:8080` (`/wp-admin`, admin/admin) and the wired frontend on `:3000`.

> **The frontend is not the store.** The Vercel URL runs the Next.js app — it is *not* a WordPress site, so WooCommerce.com / "Connect your store" can't point at it. The deployed showcase **auto-connects** to a live headless WooCommerce demo store on Vercel production (no manual env needed); local `npm run dev` stays on the instant mock. To use your own store, host WordPress + WooCommerce anywhere public, run the seeder, and set `WOOCOMMERCE_URL` (+ `WOOCOMMERCE_ENABLED=true` to force it locally). The frontend talks to the store **server-side** over the Store API — no keys in the browser; every call is timeout-bounded and falls back to the seeded mock, so a sleeping store never breaks the page.

---

## 🎬 &nbsp; The film, scene by scene

Scroll *is* the edit. The ring is one persistent object that the scene **directs** — never a carousel of pages.

| # | Scene | What you feel | Under the hood |
|:--:|---|---|---|
| 01 | **The hero** | The ring descends out of the dark and unwinds into place; a monumental `FOR / EVER` looms behind it; faint **twist-ring variants orbit** in deep space | `Scene.tsx` entrance arc · `HoloVariants.tsx` wireframe twin-band + diamond ghosts, zone-gated + depth-faded behind the ring |
| — | **Configure** | Metals behave like **liquid material samples** (a light sweeps the surface); the **centre stone is a live 3D gem** you can pick from ten cuts; the **camera re-frames itself for each cut**; price rolls on every change | `StonePicker3D` (drei `<View>`, one canvas / ten gems) · `RingModel` morphs one PBR material · `CameraRig` per-shape fit · `PriceTag` odometer |
| 02 | **On the hand** | A cinematic loop of the ring **worn**, the diamond catching a real star-flare | `ring-hand.mp4` — Higgsfield, framed inset |
| 03 | **The details** | An editorial order card writes *your* exact configuration, priced live | `Provenance.tsx`, reads the store |
| ✦ | **A universe in one stone** | Full-bleed: the ring **levitating in a cosmic nebula**, god-rays sweeping, the diamond erupting in fire | `ring-cosmos.mp4` — Higgsfield 1080p, `CinemaInterstitial` |
| 04 | **Your ring** | It returns to centre; chips, live price, *Add to Bag* | `Closing.tsx`, `data-ring="finale"` |

> Every scene is graded to one warm, dark universe — the holographic anatomy and the cosmic loop share the product's palette, so they read as the same film rather than separate apps. And the cinematic devices stay **behind the ring and out of the shopping flow.** The lesson this build is built on: spectacle that buries the product isn't luxury — it's noise.

---

## ◆ &nbsp; The brief, answered

| Requirement | Where it lives |
|---|---|
| **Rotate** (cursor / touch, no jank) | `RingDragPad` → scene director in `Scene.tsx`; flick-inertia + idle turntable |
| **Switch metals live** | `RingModel.tsx` morphs one shared PBR material's colour + roughness in `useFrame` — never remounts, can't blink out |
| **Swap the centre stone** | `Gem.tsx` swaps faceted geometry with a pop animation; reads the store directly |
| **Live price from WooCommerce** | `useProduct` → `/api/products` → `useVariation` → odometer; never hardcoded |
| **Add to cart, exact config** | `AddToCartButton` → `/api/cart` → `woo.ts` (live) / `mock.ts` (fallback); drawer shows the exact metal + cut |
| **Premium feel** | One lit hero, restrained type & colour, intentional whitespace, real motion |
| **★ Bonus — 3D picker** | **Done.** `StonePicker3D` renders the ten cuts as live 3D gems, same shaders as the ring |

---

## 🤖 &nbsp; Where AI did the heavy lifting

AI wasn't a garnish here — it was the camera crew.

- **Reference, decoded** — fed the oryzo.ai recording through **Higgsfield `video_analysis_create`** for a 27-scene shot-by-shot breakdown (camera, lensing, transitions, pacing), cross-read against 1 fps frames. → [`docs/REFERENCE-ANALYSIS.md`](docs/REFERENCE-ANALYSIS.md)
- **The cosmic hero** (`ring-cosmos.mp4`) — the *real* product shot was composited into a warm void with `ffmpeg`, then animated by **Higgsfield `seedance_2_0` (1080p)** into a ring levitating through a nebula. It showcases *our* exact ring, not stock.
- **The lifestyle loop** (`ring-hand.mp4`) — a subtle worn-on-the-hand close-up, framed as an editorial inset.
- **Thoughtful, not wasteful** — every generation was cost-preflighted; an NSFW false-positive was *not* retried but salvaged locally with `ffmpeg`; extra framing was derived from existing footage rather than re-billed.

---

## ✶ &nbsp; Decisions that weren't obvious

- **R3F over raw Three / Babylon** — declarative, binds cleanly to the Zustand store, `drei` gives the studio environment, shadows and `<View>` multi-scene picker for free.
- **The diamond is a faceted `MeshPhysicalMaterial`, not `MeshRefractionMaterial`** — refraction looks best on paper but renders *black* in software WebGL and needs a bright cube to refract. Flat-shaded physical + high `envMapIntensity` + a little transmission + iridescence + an emissive floor reads as a bright diamond on **every** GPU. Reliability over a fragile showpiece.
- **One scene, scroll-directed** — a single fixed `<Canvas>` owns the ring; the director parks it for the hero & finale and steps it off-stage for editorial sections, so it never collides with copy.
- **Per-shape cinematic framing** — the camera isn't a fixed distance. It measures each cut's *rotation-invariant* silhouette (band + stone) and dollies to a per-cut target fill with safe margins, so every silhouette — round, marquise, pear, heart — is composed like its own product shot, stays the same perceived size, and never clips through a full turn. (`framing.ts` + `CameraRig` in `Scene.tsx`.)
- **8 metals × 10 cuts, always addable** — metals are a real material swap and the cuts share geometry + shaders with the live stone; when the live store lacks a specific variation, a deterministic fallback id keeps every combination buyable.
- **Honest commerce** — the mock mirrors the live shape to the dollar; locally checkout is disabled rather than faked, and in production it hands off to the real store checkout.

---

## ✓ &nbsp; Craft & quality

- `tsc --noEmit` and `next build` clean.
- Honours `prefers-reduced-motion` — no idle spin, no bloom, no 3D picker, instant transitions.
- The canvas pauses (`frameloop="never"`) when the cart is open or the tab is hidden.
- Mobile: the ring crowns the hero with a legibility scrim; the picker falls back to crisp glyphs.
- **One honest caveat:** headless screenshots use software WebGL (SwiftShader), which under-represents metal gleam and diamond fire. The real browser GPU is the ground truth — and it's where this is meant to be seen.

<br>

<div align="center">

──────────────  ✦  ──────────────

### *Some choices last forever.*

</div>
