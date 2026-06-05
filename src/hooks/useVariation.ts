"use client";

import { useMemo } from "react";
import { fallbackVariationId, priceFor, skuFor } from "@/lib/config";
import type { ProductData, Variation } from "@/lib/types";
import type { MetalId, StoneId } from "@/lib/types";

/** Resolve the variation matching the current metal + stone selection.
 *  The live demo store is only partly seeded, so when it has no variation for a
 *  combo we synthesise one with a deterministic fallback id (priced from the
 *  shared source of truth). That keeps Add to Bag enabled and addable for every
 *  configuration — the cart route resolves the fallback id back to the combo.
 *  `live` still reflects whether THIS combo is backed by the real store. */
export function useVariation(
  product: ProductData | undefined,
  metal: MetalId,
  stone: StoneId,
): { variation?: Variation; price: number; live: boolean } {
  return useMemo(() => {
    const match = product?.variations.find(
      (v) => v.metal === metal && v.stone === stone,
    );
    const variation: Variation = match ?? {
      id: fallbackVariationId(metal, stone),
      metal,
      stone,
      price: priceFor(metal, stone),
      sku: skuFor(metal, stone),
    };
    return {
      variation,
      price: variation.price,
      live: Boolean(match) && (product?.live ?? false),
    };
  }, [product, metal, stone]);
}
