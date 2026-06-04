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
  "white-gold-14k": 0,
  "white-gold": 180,
  "yellow-gold-14k": 180,
  "yellow-gold": 360,
  "rose-gold-14k": 180,
  "rose-gold": 360,
  platinum: 620,
  palladium: 420,
};

export const STONE_PREMIUM: Record<StoneId, number> = {
  round: 0,
  oval: 420,
  princess: 260,
  cushion: 340,
  emerald: 520,
  radiant: 460,
  pear: 480,
  marquise: 520,
  heart: 560,
  asscher: 500,
};

export const METALS: MetalOption[] = [
  {
    id: "white-gold-14k",
    label: "14k White Gold",
    caption: "14k / cool rhodium finish",
    color: "#e5e7ea",
    swatch: ["#f7f8fa", "#bfc4ca"],
    roughness: 0.08,
  },
  {
    id: "white-gold",
    label: "White Gold",
    caption: "18k / cool rhodium finish",
    color: "#ededf0",
    swatch: ["#fbfbfd", "#c9ccd2"],
    roughness: 0.06,
  },
  {
    id: "yellow-gold-14k",
    label: "14k Yellow Gold",
    caption: "14k / warm classic tone",
    color: "#d9b24d",
    swatch: ["#edcf76", "#bb8f32"],
    roughness: 0.12,
  },
  {
    id: "yellow-gold",
    label: "Yellow Gold",
    caption: "18k / warmer mirror tone",
    color: "#e8c262",
    swatch: ["#f6dd9b", "#c79a3c"],
    roughness: 0.10,
  },
  {
    id: "rose-gold-14k",
    label: "14k Rose Gold",
    caption: "14k / soft blush alloy",
    color: "#d3967c",
    swatch: ["#ecc0af", "#b76e55"],
    roughness: 0.12,
  },
  {
    id: "rose-gold",
    label: "Rose Gold",
    caption: "18k / soft blush alloy",
    color: "#e0a88e",
    swatch: ["#f3c8b6", "#c47e63"],
    roughness: 0.10,
  },
  {
    id: "platinum",
    label: "Platinum",
    caption: "950 / dense white metal",
    color: "#d8d7d4",
    swatch: ["#efefed", "#b5b3af"],
    roughness: 0.09,
  },
  {
    id: "palladium",
    label: "Palladium",
    caption: "950 / soft grey-white tone",
    color: "#c8c3c1",
    swatch: ["#ddd9d7", "#aaa4a1"],
    roughness: 0.12,
  },
];

export const STONES: StoneOption[] = [
  {
    id: "round",
    label: "Round",
    caption: "Brilliant / highest fire",
    carat: "1.20ct",
  },
  {
    id: "oval",
    label: "Oval",
    caption: "Elongated / taller look",
    carat: "1.35ct",
  },
  {
    id: "princess",
    label: "Princess",
    caption: "Square / crisp geometry",
    carat: "1.25ct",
  },
  {
    id: "cushion",
    label: "Cushion",
    caption: "Soft square / pillowed fire",
    carat: "1.30ct",
  },
  {
    id: "emerald",
    label: "Emerald",
    caption: "Step cut / hall-of-mirrors",
    carat: "1.40ct",
  },
  {
    id: "radiant",
    label: "Radiant",
    caption: "Cut-corner / bright facets",
    carat: "1.35ct",
  },
  {
    id: "pear",
    label: "Pear",
    caption: "Teardrop / directional sparkle",
    carat: "1.32ct",
  },
  {
    id: "marquise",
    label: "Marquise",
    caption: "Elongated / pointed profile",
    carat: "1.28ct",
  },
  {
    id: "heart",
    label: "Heart",
    caption: "Romantic / precise symmetry",
    carat: "1.25ct",
  },
  {
    id: "asscher",
    label: "Asscher",
    caption: "Octagonal / vintage steps",
    carat: "1.35ct",
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
  "white-gold-14k": "14k White Gold",
  "white-gold": "White Gold",
  "yellow-gold-14k": "14k Yellow Gold",
  "yellow-gold": "Yellow Gold",
  "rose-gold-14k": "14k Rose Gold",
  "rose-gold": "Rose Gold",
  platinum: "Platinum",
  palladium: "Palladium",
};
export const STONE_TERMS: Record<StoneId, string> = {
  round: "Round",
  oval: "Oval",
  princess: "Princess",
  cushion: "Cushion",
  emerald: "Emerald",
  radiant: "Radiant",
  pear: "Pear",
  marquise: "Marquise",
  heart: "Heart",
  asscher: "Asscher",
};

export const METAL_FROM_TERM: Record<string, MetalId> = Object.fromEntries(
  Object.entries(METAL_TERMS).map(([k, v]) => [v.toLowerCase(), k as MetalId]),
);
export const STONE_FROM_TERM: Record<string, StoneId> = Object.fromEntries(
  Object.entries(STONE_TERMS).map(([k, v]) => [v.toLowerCase(), k as StoneId]),
);
