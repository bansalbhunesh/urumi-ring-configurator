# Architecture — interaction → WooCommerce cart

One page. How a click in the 3D configurator becomes a priced line item in a
WooCommerce cart.

## Data flow

```
┌──────────────────────────────────────────────────────────────────────────┐
│ BROWSER (Next.js client)                                                   │
│                                                                            │
│  MetalSelector / StoneSelector ──set──►  Zustand store { metal, stone }    │
│         │                                      │                           │
│         │                                      ├──► R3F scene reacts:       │
│         │                                      │     • metal material lerp  │
│         │                                      │     • stone morph/swap     │
│         │                                      │                           │
│         ▼                                      ▼                           │
│  useProduct() ─────────────────────►  useVariation(metal,stone)            │
│  (TanStack Query)                       resolves { variation.id, price }   │
│         │                                      │                           │
│         │                                      ▼                           │
│         │                            PriceTag (animated)  +  AddToCart      │
│         │                                      │                           │
└─────────┼──────────────────────────────────────┼──────────────────────────┘
          │ GET /api/products                     │ POST /api/cart { variationId }
          ▼                                        ▼
┌──────────────────────────────────────────────────────────────────────────┐
│ NEXT.JS SERVER (BFF — route handlers)                                      │
│                                                                            │
│  /api/products            /api/cart (GET reads, POST adds)                 │
│       │                        │                                           │
│       ▼                        ▼                                           │
│   lib/woo.ts ── WOOCOMMERCE_ENABLED? ──► live Store API calls              │
│       │  (no)                                                              │
│       ▼                                                                    │
│   lib/mock.ts  (seeded, same shape, signed cookie cart)                    │
└───────────────────────────────┬──────────────────────────────────────────┘
                                 │ (live mode)
                                 ▼
┌──────────────────────────────────────────────────────────────────────────┐
│ WOOCOMMERCE  (wp-json/wc/store/v1)                                         │
│   GET /products?slug=twist-engagement-ring   → parent + variation refs     │
│   GET /products/{id}                          → per-variation price/SKU     │
│   GET  /cart                                  → Nonce + Cart-Token          │
│   POST /cart/add-item { id, quantity }        → updated cart                │
│   (Variable product: Metal × Stone = 9 variations, seeded by seed.php)     │
└──────────────────────────────────────────────────────────────────────────┘
```

## The add-to-cart sequence (live mode)

1. User picks Metal + Stone → Zustand updates → `useVariation` resolves the matching
   `variation.id` from the product fetched via `/api/products`.
2. User clicks **Add to Bag** → `POST /api/cart { variationId }`.
3. The route reads the `urumi_cart_token` httpOnly cookie (if any), calls Store API
   `GET /cart` to obtain a fresh **Nonce** and **Cart-Token**, then `POST /cart/add-item`
   with those headers.
4. WooCommerce returns the updated cart; the route persists the new `Cart-Token`
   cookie and returns a **normalized** `CartState` to the browser.
5. TanStack Query writes the cart into cache → header badge, drawer, and toast update.

## Why a BFF (route handlers) instead of calling WooCommerce from the browser

- Keeps cart tokens/nonces and any future credentials **server-side**.
- **Normalizes** two different shapes (live Store API vs mock) into one `CartState`/
  `ProductData` contract, so the UI never branches on the data source.
- Lets the **mock fallback** kick in transparently when WooCommerce is unreachable,
  so the deployed link is always functional.

## Source of truth for price

`src/lib/config.ts` defines base price + per-metal/per-stone premiums. `docker/seed.php`
seeds WooCommerce from those exact numbers, and `src/lib/mock.ts` computes from them
too — so live and mock agree to the dollar.
