import "server-only";
import {
  METAL_FROM_TERM,
  METALS,
  PRODUCT_SLUG,
  STONES,
  STONE_FROM_TERM,
} from "./config";
import type {
  CartState,
  MetalId,
  ProductData,
  StoneId,
  Variation,
} from "./types";

/* ----------------------------------------------------------------------------
   WooCommerce Store API client (server-only BFF layer).

   We use the Store API (wc/store/v1) rather than the legacy REST v3 because it
   is the purpose-built headless surface: it serves product/variation/price data
   AND cart over plain HTTP with cookie/token sessions — no OAuth 1.0a dance and
   no consumer keys to leak to the browser. Every call is server-side and short-
   circuited by a timeout so a sleeping container never blocks the request; the
   caller falls back to the seeded mock, which mirrors this exact shape.
---------------------------------------------------------------------------- */

const WOO_URL = (process.env.WOOCOMMERCE_URL ?? "http://localhost:8080").replace(
  /\/$/,
  "",
);
const STORE_API = `${WOO_URL}/wp-json/wc/store/v1`;
const TIMEOUT_MS = Number(process.env.WOOCOMMERCE_TIMEOUT_MS ?? 2500);

// Opt-in flag. Without a running WooCommerce instance (e.g. local `npm run dev`
// with no Docker, or a Vercel preview), we skip the network entirely and serve
// the seeded mock instantly rather than eating a timeout on every request.
const ENABLED = process.env.WOOCOMMERCE_ENABLED === "true";

export const CART_TOKEN_COOKIE = "urumi_cart_token";

const METAL_IDS = new Set<MetalId>(METALS.map((metal) => metal.id));
const STONE_IDS = new Set<StoneId>(STONES.map((stone) => stone.id));

interface StorePrices {
  currency_code: string;
  currency_symbol: string;
  currency_minor_unit: number;
  price: string;
}

interface StoreAttribute {
  name: string;
  value: string;
}

interface StoreVariationRef {
  id: number;
  attributes: StoreAttribute[];
}

interface StoreProduct {
  id: number;
  name: string;
  slug: string;
  sku: string;
  prices: StorePrices;
  variations: StoreVariationRef[];
  attributes?: StoreAttribute[];
}

async function storeFetch(
  path: string,
  init?: RequestInit & { timeoutMs?: number },
): Promise<Response> {
  const controller = new AbortController();
  const timeout = setTimeout(
    () => controller.abort(),
    init?.timeoutMs ?? TIMEOUT_MS,
  );
  try {
    return await fetch(`${STORE_API}${path}`, {
      ...init,
      signal: controller.signal,
      headers: { "Content-Type": "application/json", ...(init?.headers ?? {}) },
      cache: "no-store",
    });
  } finally {
    clearTimeout(timeout);
  }
}

function toMajor(prices: StorePrices, raw: string): number {
  return Number(raw) / 10 ** prices.currency_minor_unit;
}

function resolveAttributes(
  attrs: StoreAttribute[],
): { metal?: MetalId; stone?: StoneId } {
  let metal: MetalId | undefined;
  let stone: StoneId | undefined;
  for (const a of attrs) {
    const v = a.value.toLowerCase().trim();
    const slug = v.replace(/\s+/g, "-");
    // Store API may give us the term label ("White Gold") or its slug
    // ("white-gold"); accept either.
    if (METAL_FROM_TERM[v]) metal = METAL_FROM_TERM[v];
    else if (METAL_IDS.has(slug as MetalId)) metal = slug as MetalId;
    if (STONE_FROM_TERM[v]) stone = STONE_FROM_TERM[v];
    else if (STONE_IDS.has(slug as StoneId)) stone = slug as StoneId;
  }
  return { metal, stone };
}

/** Fetch the variable product and normalise its variations + prices. */
export async function getProduct(): Promise<ProductData | null> {
  if (!ENABLED) return null;
  try {
    const res = await storeFetch(`/products?slug=${PRODUCT_SLUG}&per_page=1`);
    if (!res.ok) return null;
    const list = (await res.json()) as StoreProduct[];
    const product = list?.[0];
    if (!product?.variations?.length) return null;

    // Store API only returns variation ids + attributes on the parent, so we
    // hydrate each variation's price in parallel (cached upstream by no-store +
    // our own route-level revalidate). 9 small calls, once.
    const variations: Variation[] = (
      await Promise.all(
        product.variations.map(async (ref) => {
          const { metal, stone } = resolveAttributes(ref.attributes);
          if (!metal || !stone) return null;
          const vRes = await storeFetch(`/products/${ref.id}`);
          if (!vRes.ok) return null;
          const v = (await vRes.json()) as StoreProduct;
          return {
            id: ref.id,
            metal,
            stone,
            price: toMajor(v.prices, v.prices.price),
            sku: v.sku,
          } satisfies Variation;
        }),
      )
    ).filter((v): v is Variation => v !== null);

    if (!variations.length) return null;

    return {
      id: product.id,
      name: product.name,
      slug: product.slug,
      currency: product.prices.currency_code,
      currencySymbol: product.prices.currency_symbol || "$",
      variations,
      live: true,
    };
  } catch {
    return null;
  }
}

/* ------------------------------- Cart ------------------------------------- */

interface StoreCartItem {
  key: string;
  name: string;
  quantity: number;
  sku: string;
  totals: { line_total: string; currency_symbol: string };
  variation: { attribute: string; value: string }[];
}
interface StoreCart {
  items: StoreCartItem[];
  items_count: number;
  totals: { total_price: string; currency_symbol: string; currency_minor_unit: number };
}

function normaliseCart(cart: StoreCart): CartState {
  const minor = cart.totals.currency_minor_unit ?? 2;
  return {
    itemCount: cart.items_count,
    total: Number(cart.totals.total_price) / 10 ** minor,
    currencySymbol: cart.totals.currency_symbol || "$",
    live: true,
    items: cart.items.map((it) => ({
      key: it.key,
      name: it.name,
      quantity: it.quantity,
      total: Number(it.totals.line_total) / 10 ** minor,
      sku: it.sku,
      attributes: it.variation.map((v) => ({
        label: v.attribute,
        value: v.value,
      })),
    })),
  };
}

interface CartResult {
  cart: CartState;
  cartToken?: string;
}

/** Read the Store API nonce + cart token, needed for state-changing writes. */
async function primeCart(
  cartToken?: string,
): Promise<{ nonce: string; cartToken?: string } | null> {
  const res = await storeFetch(`/cart`, {
    headers: cartToken ? { "Cart-Token": cartToken } : {},
  });
  if (!res.ok) return null;
  const nonce =
    res.headers.get("Nonce") ??
    res.headers.get("X-WC-Store-API-Nonce") ??
    "";
  const token = res.headers.get("Cart-Token") ?? cartToken;
  return { nonce, cartToken: token ?? undefined };
}

export async function addToCart(
  variationId: number,
  quantity: number,
  cartToken?: string,
): Promise<CartResult | null> {
  if (!ENABLED) return null;
  try {
    const primed = await primeCart(cartToken);
    if (!primed) return null;
    const res = await storeFetch(`/cart/add-item`, {
      method: "POST",
      headers: {
        Nonce: primed.nonce,
        "X-WC-Store-API-Nonce": primed.nonce,
        ...(primed.cartToken ? { "Cart-Token": primed.cartToken } : {}),
      },
      body: JSON.stringify({ id: variationId, quantity }),
    });
    if (!res.ok) return null;
    const cart = (await res.json()) as StoreCart;
    const token = res.headers.get("Cart-Token") ?? primed.cartToken;
    return { cart: normaliseCart(cart), cartToken: token ?? undefined };
  } catch {
    return null;
  }
}

export async function getCart(cartToken?: string): Promise<CartResult | null> {
  if (!ENABLED) return null;
  try {
    const res = await storeFetch(`/cart`, {
      headers: cartToken ? { "Cart-Token": cartToken } : {},
    });
    if (!res.ok) return null;
    const cart = (await res.json()) as StoreCart;
    const token = res.headers.get("Cart-Token") ?? cartToken;
    return { cart: normaliseCart(cart), cartToken: token ?? undefined };
  } catch {
    return null;
  }
}

export async function removeCartItem(
  itemKey: string,
  cartToken?: string,
): Promise<CartResult | null> {
  if (!ENABLED) return null;
  try {
    const primed = await primeCart(cartToken);
    if (!primed) return null;
    const res = await storeFetch(`/cart/remove-item`, {
      method: "POST",
      headers: {
        Nonce: primed.nonce,
        "X-WC-Store-API-Nonce": primed.nonce,
        ...(primed.cartToken ? { "Cart-Token": primed.cartToken } : {}),
      },
      body: JSON.stringify({ key: itemKey }),
    });
    if (!res.ok) return null;
    const cart = (await res.json()) as StoreCart;
    const token = res.headers.get("Cart-Token") ?? primed.cartToken;
    return { cart: normaliseCart(cart), cartToken: token ?? undefined };
  } catch {
    return null;
  }
}

export async function updateCartItemQuantity(
  itemKey: string,
  quantity: number,
  cartToken?: string,
): Promise<CartResult | null> {
  if (!ENABLED) return null;
  try {
    const primed = await primeCart(cartToken);
    if (!primed) return null;
    const res = await storeFetch(`/cart/update-item`, {
      method: "POST",
      headers: {
        Nonce: primed.nonce,
        "X-WC-Store-API-Nonce": primed.nonce,
        ...(primed.cartToken ? { "Cart-Token": primed.cartToken } : {}),
      },
      body: JSON.stringify({ key: itemKey, quantity }),
    });
    if (!res.ok) return null;
    const cart = (await res.json()) as StoreCart;
    const token = res.headers.get("Cart-Token") ?? primed.cartToken;
    return { cart: normaliseCart(cart), cartToken: token ?? undefined };
  } catch {
    return null;
  }
}
