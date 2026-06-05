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

## 2 · The scene director (no flying cameras)
`Scene.tsx` keeps the camera calm and moves the **ring** instead. By scroll zone (measured from
real anchors `#ring` / `#finale`) it places the ring in a deterministic stage:

- **Hero** — right column (desktop) / crowning the top (mobile); enters on an arc.
- **Editorial** (`data-ring="hidden"`) — the ring scales away so it never overlaps copy or the
  full-bleed video beats; `HoloVariants` and the ghosts fade with it.
- **Finale** — centred, leaving clear bands for the copy and the *Add to Bag* bar.

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
source of truth. The UI says so ("demo price") and disables checkout rather than faking an order.

## Source of truth
`lib/config.ts` defines metals, stones, base price and premiums. The mock, the UI **and** the
WooCommerce seeder (`docker/`) all derive from it — so the live store and the demo agree to the
dollar.

---

## The cinematic layer
| Piece | Role |
|---|---|
| `HoloVariants.tsx` | Wireframe ghost-rings + floating diamonds orbiting the hero (zone-gated, depth-faded) |
| `CinemaInterstitial.tsx` | Full-bleed Higgsfield `ring-cosmos.mp4` in a `data-ring="hidden"` beat |
| `PhotoHandoff.tsx` | Framed `ring-hand.mp4` lifestyle loop |
| `PriceTag` | Digit-odometer that rolls on configuration change |
| Bloom + Vignette | Restrained desktop post pass; off under reduced-motion |
| Lenis · Magnetic · Reveal | Eased scroll, cursor-lean, mask-based editorial reveals |

> Headless captures run on software WebGL (SwiftShader) and under-represent the metal and the
> diamond — the browser GPU is the ground truth.
