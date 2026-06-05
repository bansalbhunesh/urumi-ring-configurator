<div align="center">

# AURELLE — Architecture & Data Flow

*One page. Interaction → pixels → WooCommerce cart.*

</div>

---

## The shape of it

Three layers that **never talk directly** — they meet at a single store. The 3D scene
reads it in `useFrame`; the DOM reads it in React. No prop-drilling between worlds.

```
                          ┌──────────────────────────────────────┐
            click / drag   │            ZUSTAND STORE             │   read in render
        ┌──────────────────▶   store/configurator.ts             ◀──────────────────┐
        │                  │   metal · stone · size · scroll      │                  │
        │                  └───────┬──────────────────┬───────────┘                  │
        │                          │ read in useFrame  │ useVariation                 │
   ┌────┴─────────┐        ┌────────▼─────────┐  ┌──────▼───────┐          ┌──────────┴────────┐
   │  2D INTERFACE │        │   3D SCENE        │  │  LIVE PRICE  │          │   CART DRAWER     │
   │  App Router   │        │  one fixed Canvas │  │  odometer    │          │  exact config     │
   │  Framer/Lenis │        │  ring · gems ·    │  └──────────────┘          └──────────┬────────┘
   └───────────────┘        │  HoloVariants     │                                       │
                            └───────────────────┘                                       │
                                                                                        │ Add to Bag
        ┌───────────────────────────────────────────────────────────────────────────────┘
        ▼
   ┌─────────────────────┐   Store API (enabled & reachable)   ┌────────────────────────┐
   │  /api/* route        │ ──────────────────────────────────▶ │  HEADLESS WOOCOMMERCE  │
   │  handlers (server)   │                                     │  wc/store/v1 · cart    │
   │                      │ ◀────────────── cart JSON ───────── │  token (httpOnly)      │
   │                      │                                     └────────────────────────┘
   │                      │   otherwise (preview / no backend)  ┌────────────────────────┐
   │                      │ ──────────────────────────────────▶ │  SEEDED MOCK (mock.ts) │
   └─────────────────────┘   identical response shape           │  same source of truth  │
                                                                └────────────────────────┘
```

<details><summary>Same flow as Mermaid</summary>

```mermaid
graph TD
    UI[Metal / Stone / Size] -->|set*| Store[Zustand store]
    Store -->|useFrame| R3F[Ring · Gem · HoloVariants]
    Store -->|useVariation| Price[Live price odometer]
    Add[Add to Bag] -->|variationId| API[/api/* route handlers]
    API -->|Store API, when enabled & reachable| Woo[Headless WooCommerce]
    API -->|seeded fallback| Mock[mock.ts · same shape]
    Woo --> API
    Mock --> API
    API -->|React Query| Cart[Cart drawer · exact config]
```
</details>

---

## 1 · Live 3D updates
A click calls `setMetal(id)` / `setStone(id)`. The ring reads the store inside `useFrame` and
**interpolates** — `RingModel` morphs one shared PBR material's colour/roughness; `Gem` swaps
faceted geometry with a pop. Core geometry is **never remounted**, so a change can't blink the
ring out. The `StonePicker3D` thumbnails render the same geometry + shaders, so the choice
always matches the ring.

## 2 · The cinematographer (per-shape framing)
`Scene.tsx` directs two things every frame, both reading one shared `stageFor(zone)` so they can
never disagree about the composition:

**The stage director** poses the *ring*. By scroll zone (measured from real anchors `#ring` /
`#finale`) it places the ring in a deterministic stage:

- **Hero** — right column (desktop) / crowning the top (mobile); enters on an arc.
- **Editorial** (`data-ring="hidden"`) — the ring scales away so it never overlaps copy or the
  full-bleed video beats; `HoloVariants` and the ghosts fade with it.
- **Finale** — composed high, leaving the lower frame for the copy and the *Add to Bag* bar.

**The `CameraRig`** dollies the *camera* to fit each cut like its own product shot. `framing.ts`
measures the ring's **rotation-invariant** silhouette — the band's swept planar radius + vertical
extent (real vertices, measured once) merged with the live cut's stone bounds (`gemBounds`), and
republished to the store on every stone change. Each frame the rig fits that silhouette to a
per-cut target fill (`STONE_FRAMING`) with safe margins, deriving the vertical look-at from the
zone's `screenY`:

- Fitting the **swept cylinder** (not the instantaneous outline) means the ring can spin a full
  turn and never clip — and tall/long cuts (marquise, oval, pear, heart) get the breathing room a
  round brilliant doesn't need.
- The measured fit keeps **perceived product size consistent** across cuts; the per-shape profile
  then adds the individually-photographed character (marquise pulls back, emerald lifts the angle).
- To re-tune a cut, edit `STONE_FRAMING`; to move where a chapter places the ring, edit
  `stageFor()`. There is no hardcoded camera distance.

Everything honours `prefers-reduced-motion` (instant transitions, no bloom, no idle spin).

## 3 · WooCommerce — the Store API, no keys
`lib/woo.ts` is a **server-only** client for the WooCommerce **Store API** (`wc/store/v1`),
chosen over legacy REST v3 on purpose: it's the headless surface for products, prices and cart,
using cart **tokens** (httpOnly cookie) instead of an OAuth 1.0a consumer secret — so there's no
secret to leak to the browser. Every call is server-side and timeout-bounded.

- `/api/products` — fetches the variable/composite product, hydrates each metal × stone price.
- `/api/cart` (POST) — adds the matched `variationId`; cart token kept in an httpOnly cookie.

## 4 · Seeded fallback (honest)
When `WOOCOMMERCE_ENABLED !== true` or the store is unreachable (e.g. a Vercel preview with no
backend), the handlers return `lib/mock.ts` in the **same response shape**, priced from the same
source of truth. The fallback also covers the live store being only **partly seeded**: if it has no
variation for a chosen combo, `useVariation` synthesises a deterministic fallback id (matching the
mock scheme) so Add to Bag stays enabled, and the cart route resolves that id back to the right
ring. `STORE_ENABLED` / `storeCheckoutUrl()` are shared between the cart and checkout routes so
checkout goes live exactly when products/cart do — it hands off to the real store checkout in
production and is honestly disabled (not faked) in local demo mode.

## Source of truth
`lib/config.ts` defines metals, stones, base price and premiums. The mock, the UI **and** the
WooCommerce seeder (`docker/`) all derive from it — so the live store and the demo agree to the
dollar.

---

## The cinematic layer
One warm, dark grade runs across every scene — the holographic anatomy renders and the cosmic loop
are colour-graded to the product's palette so the page reads as a single film, not separate apps.

| Piece | Role |
|---|---|
| `HoloVariants.tsx` | Wireframe **twist-ring ghosts** (twin interleaved bands lifting a faceted diamond) orbiting the hero — zone-gated, depth-faded, so the "choose your own" variants read as the product |
| `HoloUniverse.tsx` | Sticky scroll "anatomy" beat; each warm-graded universe holds fully before the next warps in |
| `CinemaInterstitial.tsx` | Full-bleed Higgsfield `ring-cosmos.mp4`, graded into the warm universe, in a `data-ring="hidden"` beat |
| `PhotoHandoff.tsx` | Framed `ring-hand.mp4` lifestyle loop |
| `PriceTag` | Digit-odometer that rolls on configuration change |
| Bloom + Vignette | Restrained desktop post pass; off under reduced-motion |
| Lenis · Magnetic · Reveal | Eased scroll, cursor-lean, mask-based editorial reveals |

> Headless captures run on software WebGL (SwiftShader) and under-represent the metal and the
> diamond — the browser GPU is the ground truth.
