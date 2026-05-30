"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { useAddToCart } from "@/hooks/useProduct";
import { useConfigurator } from "@/store/configurator";
import { CheckIcon } from "@/components/ui/icons";
import { playCelebrate } from "@/hooks/useSound";

import { Magnetic } from "@/components/ui/Magnetic";

export function AddToCartButton({
  variationId,
  loading,
}: {
  variationId?: number;
  loading?: boolean;
}) {
  const add = useAddToCart();
  const celebrate = useConfigurator((s) => s.celebrate);
  const showToast = useConfigurator((s) => s.showToast);
  const [done, setDone] = useState(false);

  const disabled = !variationId || loading || add.isPending;

  const handleClick = () => {
    if (!variationId || add.isPending) return;
    add.mutate(
      { variationId },
      {
        onSuccess: () => {
          setDone(true);
          celebrate();
          playCelebrate();
          window.setTimeout(() => setDone(false), 2200);
        },
        onError: () => {
          showToast("Could not add this configuration. Please try again.");
        },
      },
    );
  };

  const state = add.isPending ? "pending" : done ? "done" : "idle";

  return (
    <Magnetic strength={12} className="w-full">
      <motion.button
        type="button"
        onClick={handleClick}
        disabled={disabled}
        whileHover={disabled ? undefined : { y: -2 }}
        whileTap={disabled ? undefined : { scale: 0.985 }}
        transition={{ type: "spring", stiffness: 400, damping: 26 }}
        className="group relative h-14 w-full overflow-hidden rounded-full bg-ink text-porcelain shadow-lift outline-none transition-opacity focus-visible:ring-2 focus-visible:ring-gold focus-visible:ring-offset-2 focus-visible:ring-offset-porcelain disabled:opacity-60"
        aria-live="polite"
      >
        {/* sweeping sheen on hover */}
        <span className="pointer-events-none absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/15 to-transparent transition-transform duration-700 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:translate-x-full" />
        <span className="relative flex h-full items-center justify-center gap-2.5 text-[0.92rem] tracking-[0.08em] uppercase">
          <AnimatePresence mode="wait" initial={false}>
            {state === "pending" && (
              <motion.span
                key="pending"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="flex items-center gap-2.5"
              >
                <span className="h-4 w-4 animate-spin rounded-full border border-porcelain/40 border-t-porcelain" />
                Adding
              </motion.span>
            )}
            {state === "done" && (
              <motion.span
                key="done"
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -6 }}
                className="flex items-center gap-2"
              >
                <CheckIcon className="h-4 w-4" /> Added
              </motion.span>
            )}
            {state === "idle" && (
              <motion.span
                key="idle"
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -6 }}
              >
                Add to Bag
              </motion.span>
            )}
          </AnimatePresence>
        </span>
      </motion.button>
    </Magnetic>
  );
}
