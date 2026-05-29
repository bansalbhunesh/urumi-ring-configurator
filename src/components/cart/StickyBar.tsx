"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { useConfigurator } from "@/store/configurator";
import { useProduct } from "@/hooks/useProduct";
import { useVariation } from "@/hooks/useVariation";
import { useAddToCart } from "@/hooks/useProduct";
import { METAL_BY_ID, STONE_BY_ID } from "@/lib/config";
import { formatPrice } from "@/lib/format";

/** Condensed add-to-cart bar that rises on mobile once the main panel scrolls
 *  away — keeps the price and primary action always within thumb reach. */
export function StickyBar() {
  const metal = useConfigurator((s) => s.metal);
  const stone = useConfigurator((s) => s.stone);
  const openCart = useConfigurator((s) => s.openCart);
  const showToast = useConfigurator((s) => s.showToast);
  const { data: product } = useProduct();
  const { variation, price } = useVariation(product, metal, stone);
  const add = useAddToCart();
  const symbol = product?.currencySymbol ?? "$";

  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const onScroll = () => setVisible(window.scrollY > window.innerHeight * 0.9);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const handleAdd = () => {
    if (!variation) return;
    add.mutate(
      { variationId: variation.id },
      {
        onSuccess: () => {
          showToast("Added to your bag");
          window.setTimeout(() => openCart(), 400);
        },
      },
    );
  };

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ y: 100 }}
          animate={{ y: 0 }}
          exit={{ y: 100 }}
          transition={{ type: "spring", stiffness: 320, damping: 32 }}
          className="fixed inset-x-0 bottom-0 z-30 border-t border-line bg-ivory/90 px-4 py-3 backdrop-blur-md lg:hidden"
        >
          <div className="flex items-center gap-3">
            <div className="min-w-0 flex-1">
              <p className="truncate text-[0.72rem] text-muted">
                {METAL_BY_ID[metal].label} · {STONE_BY_ID[stone].label}
              </p>
              <p className="font-display text-xl text-ink">
                {formatPrice(price, symbol)}
              </p>
            </div>
            <button
              type="button"
              onClick={handleAdd}
              disabled={!variation || add.isPending}
              className="h-11 shrink-0 rounded-full bg-ink px-6 text-[0.82rem] uppercase tracking-[0.08em] text-porcelain disabled:opacity-60"
            >
              {add.isPending ? "Adding…" : "Add to Bag"}
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
