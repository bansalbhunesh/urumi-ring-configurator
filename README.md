<div align="center">

# AURELLE — The Twist Engagement Ring

### A live, 3D, configurable engagement-ring product page

`Next.js 16` · `React Three Fiber` · `Framer Motion` · `Headless WooCommerce` · `Tailwind v4`

</div>

---

## What this is

A premium product page for a configurable engagement ring. The shopper rotates the
ring in 3D, switches the **metal** and **centre stone** and sees the change live,
picks a **size**, watches the **price update from WooCommerce**, and adds the exact
configuration to cart.

The feel is calibrated to **Do Amore** (the brief's reference — considered,
premium, photography-led) with an original, cinematic art direction inspired by
studios like Oryzo: a warm, atmospheric atelier stage rather than a flat template
or a clinical model-viewer. The product is the hero; everything else gets out of
its way.

---

## Run it

**Frontend only (instant):**

```bash
npm install
npm run dev        # → http://localhost:3000
```

`WOOCOMMERCE_ENABLED` defaults to `false`, so every API route returns a seeded
mock in the **identical shape** as the live Store API — product, all variation
prices, and full cart CRUD — priced from the same source of truth the store uses.
Checkout is honestly disabled in demo mode rather than faking an order.

**Full stack (live WooCommerce):**

```bash
docker compose up
```

Boots MariaDB → WordPress + WooCommerce → a seeder that installs the composite
product (priced from `lib/config.ts`) → the Next.js frontend wired to the
WooCommerce **Store API**. Copy `.env.example` → `.env.local` and set
`WOOCOMMERCE_ENABLED=true` to point the dev server at a live store.

---

## How the brief maps to the build

| Requirement | Where |
|---|---|
| Rotate the ring (cursor / touch, smooth) | `three/RingDragPad.tsx` feeds yaw/pitch to the scene director in `three/Scene.tsx`; idle turntable when untouched |
| Switch metals live | `RingModel.tsx` morphs one shared PBR material's colour + roughness in `useFrame` — never remounts, so it can't blink out |
| Swap the centre stone | `Gem.tsx` swaps procedural faceted geometry with a pop animation |
| Live price | `useProduct` → `/api/products` (WooCommerce or mock) → `useVariation` → `PriceTag` odometer |
| Add to cart | `AddToCartButton` → `/api/cart` → `woo.ts` (live) or `mock.ts` (fallback); `CartDrawer` shows the exact metal + stone |
| Premium feel | One atmospheric stage, one key-lit hero ring, restrained type/colour, real photography |

---

## Decisions (the intentionally-ambiguous bits)

- **3D library — React Three Fiber.** Declarative, ties cleanly to the Zustand
  store, and `drei` covers the studio environment / shadows out of the box.
- **The diamond — faceted `MeshPhysicalMaterial`, not `MeshRefractionMaterial`.**
  Refraction looks best on paper but renders black in software WebGL and needs a
  bright cube to refract; a flat-shaded physical material with high
  `envMapIntensity`, a little transmission, iridescence and a faint emissive floor
  reads as a bright, sparkling diamond on **every** GPU. Reliability over a fragile
  showpiece.
- **Metals & stones — 8 metals × 10 cuts.** Quality holds because metals are a real
  material swap and stones are real (consistent) procedural geometry; the picker
  stones are crisp faceted SVG glyphs that match the cut on the ring.
- **One scene, scroll-aware.** A single fixed `<Canvas>` renders the ring; the
  director shows it in the hero and the finale and steps it off-stage for the
  editorial sections so it never collides with copy.
- **Never fake commerce.** Mock mode labels itself ("demo price"); checkout is
  disabled rather than pretending.

See `ARCHITECTURE.md` for the data flow (interaction → WooCommerce cart).

---

## Quality

- `tsc --noEmit` and `next build` clean.
- Honours `prefers-reduced-motion` (no idle spin, no bloom, instant transitions).
- The canvas pauses (`frameloop="never"`) when the cart is open or the tab is hidden.
- Headless screenshots use software WebGL (SwiftShader), which under-represents
  metal gleam and diamond fire — the real browser GPU is the ground truth.

<div align="center">

*Some choices last forever.*

</div>
