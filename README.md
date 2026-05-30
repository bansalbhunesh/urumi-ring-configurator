# Aurelle — Headless WooCommerce 3D Ring Configurator

A prototype engagement-ring product page for the Urumi Forward Deployed Engineer
take-home. A shopper configures a made-to-order twist solitaire in 3D — metal and
centre-stone cut — sees every change reflected live, and adds the exact
configuration to cart. Pricing and cart are driven by a headless WooCommerce
store; a seeded fallback keeps the page fully functional when no backend is
reachable.

## Run it

### Option A — the full stack (live WooCommerce), one command
Requires Docker.
```bash
docker compose up
```
This brings up MariaDB, WordPress + WooCommerce, a one-shot provisioner that
installs the plugin and seeds the **Twist Engagement Ring** variable product
(3 metals × 3 stones, priced to match the app), and the Next.js frontend wired to
the WooCommerce **Store API**.

- App:   http://localhost:3000  (status pill reads **WooCommerce live**)
- Store: http://localhost:8080  ·  WP admin `admin / admin`

First boot takes ~1–2 min while WordPress installs and the product seeds; the app
shows seeded data until the store answers, then flips to live automatically.

### Option B — frontend only (demo mode)
```bash
npm install
npm run dev          # http://localhost:3000
```
With `WOOCOMMERCE_ENABLED` unset/false, the same API routes return seeded data in
the identical response shape. The UI labels this **Seeded demo** and disables
checkout rather than faking an order. To point at your own store instead, copy
`.env.example` → `.env.local`, set `WOOCOMMERCE_ENABLED=true` and `WOOCOMMERCE_URL`.

## Design direction (the main non-obvious call)
The brief asks for something that *"reads like an engagement-ring brand site, not
an engineering demo,"* calibrated to the polish of the reference. So the guiding
decision was **restraint over spectacle**: the configurator and the product are
the experience. The ring is the only spectacle — luminous, faceted, draggable —
presented in a warm, dark, type-forward editorial frame (Diamore-grade calm, not
a tech showcase). Motion is calm and purposeful; the camera never fights the copy.
A single fixed 3D canvas parks the ring in a deterministic on-screen *stage* per
section so it is always beautifully framed and never overlaps text.

## Scope decisions (deliberately underspecified in the brief)
- **3 metals, 3 stones.** 14k/18k white, yellow, rose gold; round, oval, princess.
  Enough to prove live configuration end-to-end and polish every state, without
  spreading a 3-day prototype thin. The data model and seeder are list-driven, so
  adding cuts/metals is a config edit, not a refactor.
- **A section within a premium page**, not a bare viewer — hero configurator,
  editorial "atelier" + materials beats, and a closing finale.
- **Mobile** is first-class: the ring leads the hero, then steps aside for the
  controls and copy so nothing ever collides.

## Stack
- **Next.js (App Router)** — server route handlers keep the WooCommerce surface
  server-side and give one tidy `/api/products` + `/api/cart` contract.
- **Three.js + React Three Fiber + drei** — React-native 3D so Zustand state drives
  materials and the camera; `@react-three/postprocessing` for a restrained bloom.
- **Tailwind v4 + Framer Motion + Lenis** — design-system styling, editorial motion,
  eased scroll (disabled for touch and reduced-motion).
- **Zustand + TanStack Query** — local config state + server cache for product/cart.

See `ARCHITECTURE.md` for the data flow and the "stage director" camera model.

## The stretch goal (3D picker) — done
The centre-stone picker is not flat art: each option (`StoneThumb.tsx`) is a live
miniature `<Canvas>` rendering the **same faceted geometry** as the hero stone
(`gemGeometry.ts`), with a lighter material so the choice you click always matches
what lands on the ring.

## How AI helped
- Drafted the headless WooCommerce proxy + Store API normalisation, and the
  Docker/wp-cli seeder, fast.
- Generated the Simplex-noise "materialise" shader and the procedural twist-band
  curve math.
- Ran an audit-and-rebuild loop: an agent captured the live app with Playwright,
  compared it against the reference, and drove the redesign (see `AUDIT.md`) —
  stripping an over-built cinematic scroll in favour of the restrained direction
  above, and fixing a shader bug that had made the ring render invisible.

## What I'd build next
1. **Live checkout hand-off** to a WooCommerce checkout session.
2. **Inner-band engraving** rendered as a `CanvasTexture` on the shank (kept out of
   this build rather than shipped as an unfulfilled promise).
3. **Parametric ring sizing** with a live band-thickness preview.

## Notes / honesty
- Docker was not available in the environment this was finished in, so the live
  stack was verified by review of `docker-compose.yml` + `docker/{provision.sh,seed.php}`
  and by exercising the identical Store-API code paths against the mock. The seeded
  fallback is exercised end-to-end (price + exact-config cart) via Playwright.
