export type MetalId =
  | "white-gold-14k"
  | "white-gold"
  | "yellow-gold-14k"
  | "yellow-gold"
  | "rose-gold-14k"
  | "rose-gold"
  | "platinum"
  | "palladium";
export type StoneId =
  | "round"
  | "oval"
  | "princess"
  | "cushion"
  | "emerald"
  | "radiant"
  | "pear"
  | "marquise"
  | "heart"
  | "asscher";

export interface MetalOption {
  id: MetalId;
  /** WooCommerce attribute term label, e.g. "White Gold" */
  label: string;
  /** Short marketing descriptor shown under the name */
  caption: string;
  /** Base albedo colour for the PBR metal material */
  color: string;
  /** Subtle secondary tone used for the UI swatch gradient */
  swatch: [string, string];
  roughness: number;
}

export interface StoneOption {
  id: StoneId;
  label: string;
  caption: string;
  /** Carat-style descriptor for copy */
  carat: string;
}

/** A WooCommerce variation, normalised for the frontend. */
export interface Variation {
  id: number;
  metal: MetalId;
  stone: StoneId;
  /** Price in major currency units (e.g. dollars) */
  price: number;
  sku: string;
}

export interface ProductData {
  id: number;
  name: string;
  slug: string;
  currency: string;
  currencySymbol: string;
  variations: Variation[];
  /** True when served by the live WooCommerce Store API, false for mock fallback */
  live: boolean;
}

export interface CartLine {
  key: string;
  name: string;
  quantity: number;
  total: number;
  sku: string;
  attributes: { label: string; value: string }[];
}

export interface CartState {
  itemCount: number;
  total: number;
  currencySymbol: string;
  items: CartLine[];
  live: boolean;
}
