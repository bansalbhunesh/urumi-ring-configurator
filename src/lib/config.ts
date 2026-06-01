import type { MetalId, MetalOption, StoneId, StoneOption } from "./types";

/* ----------------------------------------------------------------------------
   Canonical product definition.

   This is the single source of truth shared by the 3D scene, the UI controls,
   and the WooCommerce seeder (docker/provision.sh mirrors these exact prices so
   the mock fallback and the live store agree to the dollar).
---------------------------------------------------------------------------- */

export const PRODUCT_NAME = "The Twist Engagement Ring";
export const PRODUCT_SLUG = "twist-engagement-ring";
export const CURRENCY = "USD";
export const CURRENCY_SYMBOL = "$";

export const BASE_PRICE = 2400;

export const METAL_PREMIUM: Record<MetalId, number> = {
  "white-gold": 0,
  "yellow-gold": 180,
  "rose-gold": 180,
};

export const STONE_PREMIUM: Record<StoneId, number> = {
  round: 0,
  oval: 420,
  princess: 260,
};

export const METALS: MetalOption[] = [
  {
    id: "white-gold",
    label: "White Gold",
    caption: "18k · rhodium finished",
    color: "#ededf0",
    swatch: ["#fbfbfd", "#c9ccd2"],
    roughness: 0.06,
  },
  {
    id: "yellow-gold",
    label: "Yellow Gold",
    caption: "18k · warm lustre",
    color: "#e8c262",
    swatch: ["#f6dd9b", "#c79a3c"],
    roughness: 0.10,
  },
  {
    id: "rose-gold",
    label: "Rose Gold",
    caption: "18k · blush alloy",
    color: "#e0a88e",
    swatch: ["#f3c8b6", "#c47e63"],
    roughness: 0.10,
  },
];

export const STONES: StoneOption[] = [
  {
    id: "round",
    label: "Round",
    caption: "Brilliant cut",
    carat: "1.20ct",
  },
  {
    id: "oval",
    label: "Oval",
    caption: "Elongated brilliance",
    carat: "1.35ct",
  },
  {
    id: "princess",
    label: "Princess",
    caption: "Square step cut",
    carat: "1.25ct",
  },
];

export const DEFAULT_METAL: MetalId = "white-gold";
export const DEFAULT_STONE: StoneId = "round";

export function priceFor(metal: MetalId, stone: StoneId): number {
  return BASE_PRICE + METAL_PREMIUM[metal] + STONE_PREMIUM[stone];
}

export function skuFor(metal: MetalId, stone: StoneId): string {
  return `TWIST-${metal.toUpperCase().replace("-", "")}-${stone.toUpperCase()}`;
}

export const METAL_BY_ID = Object.fromEntries(
  METALS.map((m) => [m.id, m]),
) as Record<MetalId, MetalOption>;

export const STONE_BY_ID = Object.fromEntries(
  STONES.map((s) => [s.id, s]),
) as Record<StoneId, StoneOption>;

/** WooCommerce attribute term labels, used to match Store API variations. */
export const METAL_TERMS: Record<MetalId, string> = {
  "white-gold": "White Gold",
  "yellow-gold": "Yellow Gold",
  "rose-gold": "Rose Gold",
};
export const STONE_TERMS: Record<StoneId, string> = {
  round: "Round",
  oval: "Oval",
  princess: "Princess",
};

export const METAL_FROM_TERM: Record<string, MetalId> = Object.fromEntries(
  Object.entries(METAL_TERMS).map(([k, v]) => [v.toLowerCase(), k as MetalId]),
);
export const STONE_FROM_TERM: Record<string, StoneId> = Object.fromEntries(
  Object.entries(STONE_TERMS).map(([k, v]) => [v.toLowerCase(), k as StoneId]),
);
