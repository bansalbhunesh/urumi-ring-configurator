import "server-only";
import {
  CURRENCY,
  CURRENCY_SYMBOL,
  METALS,
  METAL_TERMS,
  PRODUCT_NAME,
  PRODUCT_SLUG,
  STONES,
  STONE_TERMS,
  priceFor,
  skuFor,
} from "./config";
import type { CartState, ProductData, Variation } from "./types";

/* ----------------------------------------------------------------------------
   Mock WooCommerce fallback.

   Mirrors the live Store API response shape (ProductData / CartState) and is
   priced from the same source of truth (config.ts -> priceFor), which the Docker
   seeder also uses. The frontend cannot tell the difference except for the
   `live: false` flag, which the UI surfaces honestly as a "demo data" note.
---------------------------------------------------------------------------- */

const MOCK_PRODUCT_ID = 1001;
const MOCK_VARIATION_BASE = 9000;

const MOCK_VARIATIONS: Variation[] = METALS.flatMap((metal, mi) =>
  STONES.map((stone, si) => ({
    id: MOCK_VARIATION_BASE + mi * STONES.length + si,
    metal: metal.id,
    stone: stone.id,
    price: priceFor(metal.id, stone.id),
    sku: skuFor(metal.id, stone.id),
  })),
);

export function mockProduct(): ProductData {
  return {
    id: MOCK_PRODUCT_ID,
    name: PRODUCT_NAME,
    slug: PRODUCT_SLUG,
    currency: CURRENCY,
    currencySymbol: CURRENCY_SYMBOL,
    variations: MOCK_VARIATIONS,
    live: false,
  };
}

function variationById(id: number): Variation | undefined {
  return MOCK_VARIATIONS.find((v) => v.id === id);
}

type Line = { variationId: number; quantity: number };

export function decodeMockCart(raw?: string): Line[] {
  if (!raw) return [];
  try {
    const json = Buffer.from(raw, "base64").toString("utf8");
    const parsed = JSON.parse(json);
    if (!Array.isArray(parsed)) return [];
    return parsed.filter(
      (l): l is Line =>
        typeof l?.variationId === "number" && typeof l?.quantity === "number",
    );
  } catch {
    return [];
  }
}

export function encodeMockCart(lines: Line[]): string {
  return Buffer.from(JSON.stringify(lines)).toString("base64");
}

function buildCart(lines: Line[]): CartState {
  const items = lines
    .map((line) => {
      const v = variationById(line.variationId);
      if (!v) return null;
      const metalLabel = METAL_TERMS[v.metal];
      const stoneLabel = STONE_TERMS[v.stone];
      return {
        key: String(v.id),
        name: PRODUCT_NAME,
        quantity: line.quantity,
        total: v.price * line.quantity,
        sku: v.sku,
        attributes: [
          { label: "Metal", value: metalLabel },
          { label: "Stone", value: stoneLabel },
        ],
      };
    })
    .filter((i): i is NonNullable<typeof i> => i !== null);

  return {
    itemCount: items.reduce((n, i) => n + i.quantity, 0),
    total: items.reduce((n, i) => n + i.total, 0),
    currencySymbol: CURRENCY_SYMBOL,
    items,
    live: false,
  };
}

export function mockGetCart(raw?: string): { cart: CartState; encoded: string } {
  const lines = decodeMockCart(raw);
  return { cart: buildCart(lines), encoded: encodeMockCart(lines) };
}

export function mockAddToCart(
  variationId: number,
  quantity: number,
  raw?: string,
): { cart: CartState; encoded: string } {
  const lines = decodeMockCart(raw);
  const existing = lines.find((l) => l.variationId === variationId);
  if (existing) existing.quantity += quantity;
  else lines.push({ variationId, quantity });
  return { cart: buildCart(lines), encoded: encodeMockCart(lines) };
}

export function mockRemoveFromCart(
  itemKey: string,
  raw?: string,
): { cart: CartState; encoded: string } {
  const lines = decodeMockCart(raw);
  const variationId = Number(itemKey);
  const next = lines.filter((l) => l.variationId !== variationId);
  return { cart: buildCart(next), encoded: encodeMockCart(next) };
}

export function mockUpdateCartItem(
  itemKey: string,
  quantity: number,
  raw?: string,
): { cart: CartState; encoded: string } {
  const lines = decodeMockCart(raw);
  const variationId = Number(itemKey);
  if (quantity <= 0) {
    const next = lines.filter((l) => l.variationId !== variationId);
    return { cart: buildCart(next), encoded: encodeMockCart(next) };
  }
  const line = lines.find((l) => l.variationId === variationId);
  if (line) line.quantity = quantity;
  return { cart: buildCart(lines), encoded: encodeMockCart(lines) };
}

export { PRODUCT_SLUG };
