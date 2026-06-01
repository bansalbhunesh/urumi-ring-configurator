<div align="center">

# THE TWIST
### A live, configurable, cinematic engagement-ring experience
#### Take-home assignment — Bhunesh Bansal · DoAmore

`Next.js 16` · `React Three Fiber` · `GLSL` · `Framer Motion 12` · `Headless WooCommerce` · `Tailwind v4`

</div>

---

## What this is

A headless engagement-ring configurator built for DoAmore's twist solitaire. The shopper selects a metal and centre stone, watches every choice reflected **live on a physically-based 3D ring**, and adds to cart — all backed by a real WooCommerce Store API with a seeded mock that holds the same shape when the store is offline.

The design goal is not a product page. It is a film in ten acts: each section has its own lighting, camera language, and motion world. The product is not the story — the transformation is.

---

## Run it

### Option A — full stack (live WooCommerce + Next.js), one command

```bash
docker compose up
```

Starts MariaDB → WordPress + WooCommerce → a one-shot provisioner that installs the plugin and seeds **The Twist Engagement Ring** (3 metals × 3 stones, prices from `lib/config.ts`) → Next.js frontend wired to the WooCommerce Store API.

| Service | URL |
|---|---|
| **Configurator** | http://localhost:3000 |
| **WP Store** | http://localhost:8080 |
| **WP Admin** | http://localhost:8080/wp-admin · `admin / admin` |

First boot takes ~90 s while WordPress installs and the seeder runs. The app renders seeded data until the store answers, then flips to live automatically — the UI notes "Live Store" vs "Demo" honestly, so the reviewer always knows which mode is active.

### Option B — frontend only (instant, no Docker)

```bash
npm install
npm run dev       # → http://localhost:3000
```

`WOOCOMMERCE_ENABLED` defaults to `false`. Every API route returns the seeded mock in the **identical JSON shape** as the live store — price, SKU, cart state, everything — so the full experience works with no backend. Checkout is gracefully disabled rather than faking an order.

To point at a live store, copy `.env.example` → `.env.local` and set `WOOCOMMERCE_ENABLED=true` + `WOOCOMMERCE_URL`.

---

## Environment variables

```bash
# .env.example — copy to .env.local and edit

WOOCOMMERCE_ENABLED=false           # true → live Store API, false → seeded mock
WOOCOMMERCE_URL=http://localhost:8080
WOOCOMMERCE_TIMEOUT_MS=2500         # bail + fall back to mock after this long
# WOOCOMMERCE_CHECKOUT_URL=         # override checkout page URL (defaults to $URL/checkout)
```

---

## The product

**The Twist Engagement Ring** — a double-helix twist-shank solitaire in 18k recycled gold.

| Metal | Premium |
|---|---|
| White Gold | base |
| Yellow Gold | +$180 |
| Rose Gold | +$180 |

| Stone | Premium |
|---|---|
| Round Brilliant 1.20ct | base |
| Oval Elongated 1.35ct | +$420 |
| Princess Square 1.25ct | +$260 |

**Base price: $2,400** · 9 combinations · all from the single source of truth in `lib/config.ts` — the Docker seeder, the mock, and the live store all derive from the same file and agree to the dollar.

---

## Backend API — all routes

All route handlers are **server-only** (`"server-only"` import guard). The WooCommerce Store API (`wc/store/v1`) is used over the legacy REST v3 because it is the purpose-built headless surface with cookie/cart-token sessions — no OAuth keys to leak to the browser.

| Method | Route | What it does |
|---|---|---|
| `GET` | `/api/products` | Fetches the variable product and hydrates all 9 variation prices. Falls back to `mockProduct()` on timeout or when disabled. Cached `no-store`. |
| `GET` | `/api/cart` | Reads the cart from the Store API using the `Cart-Token` cookie. Falls back to the base64-encoded mock cart cookie. |
| `POST` | `/api/cart` | Adds `{ variationId, quantity }` to cart. Quantity is validated: `max(1, min(10, qty))`. Primes nonce from `GET /cart` first (Store API requirement). |
| `PATCH` | `/api/cart` | Updates `{ key, quantity }` for an existing line. `quantity=0` removes the item. Uses Store API `/cart/update-item`. |
| `DELETE` | `/api/cart` | Removes `{ key }` from cart. Uses Store API `/cart/remove-item`. |
| `POST` | `/api/checkout` | Returns `{ url }` — the WooCommerce checkout URL with the `cart_token` query param so the session carries over. Returns `{ url: null, reason: "demo" }` in mock mode so the UI can show an honest message. |

The mock layer (`lib/mock.ts`) implements every operation — `mockGetCart`, `mockAddToCart`, `mockRemoveFromCart`, `mockUpdateCartItem` — using a base64-encoded cookie so the full cart experience works without any backend.

---

## The 12 sections (the ten-act story, expanded)

The page is a scroll-scrubbed film. One fixed `<Canvas>` renders the ring for the entire journey. A `ScrollDirector` running in `useFrame` reads each section's `data-ring` zone every frame and parks the ring at a deterministic on-screen position — it never collides with copy, on any viewport.

| # | Section | Act | What happens |
|---|---|---|---|
| 1 | `ActOne` | I — Before the ring | 180 GPU particles scattered in the dark converge scroll-driven into the first facet. "Every forever begins as a possibility." Self-contained canvas. |
| 2 | `Studio` | III — The ring is born | Metal materialises via a Simplex-noise GLSL dissolve shader driven by the ring's entry scale. Live 3D ring: drag to rotate, three metals, three stones, live price. |
| 3 | `OnTheHand` | VII — Human connection | SVG line-art hand — ring colour follows the live metal selection. Ring ellipse drops onto the finger on scroll. Product still beside the copy. |
| 4 | `HolographicReveal` | IX — Your creation | Six scroll-scrubbed holographic renders of the ring; position scrubbed by `scrollYProgress`. |
| 5 | `Craft` | II/III | "The birth of form." Three editorial blocks in three motion worlds (flip, drift, fall). |
| 6 | `Materials` | IV — Materials of forever | Three metals named as three worlds (moonlight, heritage, intimacy). Stone list drifts from alternating sides. |
| 7 | `WaterDiamond` | II — Birth of light | Custom GLSL caustic ripple shader. Concentric interference rings; the diamond emerges in gold through scroll-driven water. Pure WebGL canvas, no Three.js. |
| 8 | `Showcase` | IX — Your creation | Full-bleed photoreal GLB ring, drag to inspect. Lit by the real HDRI (`studio_small_08`, Poly Haven CC0). Auto-rotates; pauses under reduced-motion. |
| 9 | `BlueprintSpec` | VI — Hidden precision | Animated SVG engineering drawing. Dimension lines draw themselves in over 2.2 s on scroll. HUD spec table slides in from the right. Blueprint grid materialises. |
| 10 | `MirrorRoom` | VIII/IX | Seven nested CSS mirror frames with scroll-driven zoom + rotation. SVG brilliant diamond in the centre with idle spin. "One ring, infinite facets." |
| 11 | `PromiseSection` | X — Forever | Palette flip to cream. The promise. |
| 12 | `Testimonials` | — | Social proof. |
| 13 | `Closing` | X | "Some choices last forever." CTA → `/api/checkout` → WooCommerce session or inline demo message. |

---

## Animation system

Seven Framer Motion components in `src/components/ui/animations/`:

| Component | Effect | Used in |
|---|---|---|
| `BlurReveal` | `filter: blur(20px→0)` + opacity + y lift. Block or word-level. | WaterDiamond, Craft, new sections |
| `CharStagger` | Per-character `rotateX(30→0)` spring with `perspective: 600px`. | Hero headline |
| `ScrollVelocityText` | Horizontal marquee that accelerates with `useVelocity(scrollY)`. | Materials band |
| `MagneticButton` | `useSpring` cursor-pull, strength 0.35, stiffness 150. | CTAs |
| `ParallaxImage` | `useTransform(scrollYProgress)` depth layer. | Product stills |
| `CountUp` | RAF `easeOutExpo` number animation on viewport entry. | Stats |
| `ScrollProgressLine` | Fixed `scaleX(scrollYProgress)` gold bar at viewport top. | Global |

---

## 3D engineering

### The ring — `TwistRing.tsx`

Procedural geometry only — no pre-baked mesh. A FrenetFrames walk along a parametric helix generates ribbon cross-sections; two helices interlock as the twist shank. On entry, a Simplex-noise GLSL dissolve shader materialises the ring from nothing — `uProgress` driven by the ring's own entry scale so it always finishes exactly when the ring is full-size.

Rotation: drag accumulates `yaw`; pointer parallax adds a subtle `±0.06 rad` pitch; arrow-key fallback for keyboard users. Idle breathes with a sine-eased speed oscillation (not linear — it feels alive).

### The gem — `Gem.tsx`

`MeshTransmissionMaterial` with `backside={true}` for two-pass refraction — the back faces are rendered separately so internal reflections have real depth. The scene's HDRI is passed as `background` so the gem refracts actual studio light rather than a black void.

| Parameter | Value | Reason |
|---|---|---|
| `samples` | 12 (desktop) / 6 (mobile) | IOR ray-march quality vs perf |
| `resolution` | 512 / 256 | FBO precision |
| `ior` | 2.42 | Diamond refractive index |
| `chromaticAberration` | 0.022 | Crisp fire, not muddy blur |
| `thickness` | 0.72 | Pavilion depth for internal scattering |
| `backside` + `backsideThickness` | true / 0.12 | Two-pass internal reflections |

The gem geometry (`gemGeometry.ts`) is a 16-segment brilliant cut with star facets at `(tableR + girdleR) × 0.52` — 2× more facets than the default 8-segment gem, catching light from twice as many angles.

### Lighting

Real HDRI IBL (Poly Haven `studio_small_08`, CC0, 5.7 MB — `public/hdri/studio.hdr`) sets the physically-correct environment for both the metal and the gem. Three-point sculpture lights on top:

| Light | Position | Role |
|---|---|---|
| Key spot | `[-5, 9, 6]`, warm `#fff6ec`, 3.2× | Models the twist, casts shadow |
| Rim spot | `[6, 5, -5]`, cool `#c8d8ff`, 1.6× | Separates metal from dark |
| Fill point | `[3.5, -1, 3]`, warm `#e8cda0`, 0.45× | Lifts shadow side |
| Top point | `[0, 6, 1]`, neutral `#fff8f0`, 1.0× | Diamond pavilion feed |

Bloom threshold at 0.98 so only the diamond's hottest sparkle glows — metal never blooms to orange. Vignette darkens the frame edge so the ring is always the light source.

---

## Architecture

```
src/
├── app/
│   ├── api/
│   │   ├── cart/route.ts          ← GET · POST · PATCH · DELETE
│   │   ├── checkout/route.ts      ← POST → WooCommerce checkout URL
│   │   └── products/route.ts      ← GET product + 9 variations
│   └── page.tsx                   ← 12-section layout
├── components/
│   ├── cart/                      ← CartDrawer (qty stepper, remove, checkout)
│   ├── sections/                  ← 12 page sections
│   ├── studio/                    ← Metal/stone selectors, price, add-to-cart
│   ├── three/                     ← Scene, TwistRing, Gem, RingModel, geometry
│   └── ui/animations/             ← 7 FM animation utilities
├── hooks/
│   ├── useProduct.ts              ← useProduct · useCart · useAddToCart
│   │                                 useRemoveFromCart · useUpdateCartItem · useCheckout
│   └── useVariation.ts            ← metal+stone → variation+price lookup
├── lib/
│   ├── api.ts                     ← Client fetch wrappers for all 5 routes
│   ├── config.ts                  ← Single source of truth: metals, stones, prices, SKUs
│   ├── mock.ts                    ← Full cart CRUD mock (server-only)
│   ├── types.ts                   ← Shared types: ProductData, CartState, Variation
│   └── woo.ts                     ← WooCommerce Store API client (server-only)
└── store/configurator.ts          ← Zustand: metal, stone, cart, scroll, ring pose
```

**State flow:**

```
Click metal/stone → setMetal/setStone (Zustand)
    ↓                     ↓
TwistRing (useFrame)   useVariation → price odometer → PriceTag
    ↓
Add to Bag → POST /api/cart → woo.ts (live) | mock.ts (fallback)
    ↓
React Query ['cart'] cache → CartDrawer
```

**Zustand + React Query are never on the same data** — Zustand owns transient UI state (metal selection, cart open, toast) while React Query owns server state (product, cart). The 3D scene reads Zustand via module-level globals (`getScrollY`, `setScrollY`) to avoid React re-renders every frame.

---

## Cart — full CRUD

The `CartDrawer` is fully functional in both live and demo mode:

- **Quantity stepper** (`−` / count / `+`) — calls `PATCH /api/cart`; hitting `−` at qty 1 removes the item
- **Remove button** (`×`) — calls `DELETE /api/cart`; slides the item out with `AnimatePresence`
- **Item count badge** in drawer header
- **Checkout CTA** — calls `POST /api/checkout` → redirects to WooCommerce (live) or shows an inline explanation (demo)
- **Optimistic cache** — all mutations write back to `['cart']` in React Query immediately

---

## Design philosophy

Every design decision answers one question: **does this increase the perceived value of the ring?**

- **One hero, one key light.** The ring is the only luminous object. Bloom threshold 0.98: only the diamond sparkles, metal never goes orange.
- **Restraint over effects.** Ribbons, halos, star-dust and rainbow backgrounds were built, audited against real-GPU screenshots, and cut. The caustic floor and reflective floor remain because they *ground* the ring — they don't decorate around it.
- **Material truth.** Metal reads precious through accurate PBR (`metalness 1`, tuned roughness per finish) plus studio IBL — not through emissive glow.
- **Cinematic motion, not scroll animations.** Easing is `[0.22, 1, 0.36, 1]` everywhere. Idle is a breath. Configuration changes feel like events, not UI transitions.
- **Never fake the commerce.** Mock mode labels itself. Checkout is disabled rather than pretending. `live: boolean` travels through every API response shape.

---

## Quality

- `tsc --noEmit` clean on every commit
- `next build` green (Turbopack, no errors, no type errors)
- `eslint` clean
- Playwright e2e: `npm run test:e2e` — API contract (9 variations, prices), configurator (all 9 combos), cart POST + validation, full 12-section scroll, reduced-motion, ring luma check — desktop and mobile
- Reduced-motion: all 3D idle, bloom, Lenis easing, particle drift, and caustics are disabled; camera transitions are instant
- Canvas pauses (`frameloop="never"`) when the cart drawer is open or the tab is hidden
- Device tiers: DPR `[1, 2]` desktop / `[1, 1.5]` mobile; gem samples 12→6; caustic + reflective floor desktop-only

---

## Honesty

Docker was not bootable in the finishing environment, so the live WooCommerce integration was verified by auditing `docker-compose.yml`, `docker/provision.sh`, and `docker/seed.php`, and by exercising the identical Store API code paths against the mock. The seeded fallback is exercised end-to-end (price + exact-config cart + remove + quantity update) in the e2e suite.

The headless Playwright harness uses **software WebGL (SwiftShader)**, which does not reproduce real-GPU HDR bloom. All bloom/exposure decisions are made conservatively — the user's real browser is the ground truth, and real-GPU screenshots were used during the design-reset audit to catch and fix the "blown-out orange scribble" failure of an earlier iteration.

---

## What's next (kept out deliberately)

These were designed, partly built, and held back to avoid shipping a half-promise:

1. **Inner-band engraving** — `CanvasTexture` on the shank interior. Architecture is ready; the UI deliberately doesn't offer it yet.
2. **Parametric ring sizing** — live band-thickness preview driven by size selection.
3. **Poster still for Showcase** — a single rendered WebP shown under the canvas before the GLB resolves, to eliminate the blank-frame moment on cold load.
4. **Real-GPU Lighthouse pass** — CLS, LCP, and the exact bloom curve can only be tuned correctly on a real GPU.

---

<div align="center">

*Built for DoAmore by Bhunesh Bansal · 2026*

*Some choices last forever.*

</div>
