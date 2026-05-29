"use client";

import { useMemo } from "react";
import { priceFor } from "@/lib/config";
import type { ProductData, Variation } from "@/lib/types";
import type { MetalId, StoneId } from "@/lib/types";

/** Resolve the variation matching the current metal + stone selection.
 *  Falls back to a computed price so the UI never shows an empty value while
 *  product data is still loading. */
export function useVariation(
  product: ProductData | undefined,
  metal: MetalId,
  stone: StoneId,
): { variation?: Variation; price: number; live: boolean } {
  return useMemo(() => {
    const variation = product?.variations.find(
      (v) => v.metal === metal && v.stone === stone,
    );
    return {
      variation,
      price: variation?.price ?? priceFor(metal, stone),
      live: product?.live ?? false,
    };
  }, [product, metal, stone]);
}
