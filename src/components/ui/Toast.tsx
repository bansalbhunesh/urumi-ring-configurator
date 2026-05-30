"use client";

import { useEffect } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { useConfigurator } from "@/store/configurator";
import { CheckIcon } from "./icons";

export function Toast() {
  const toast = useConfigurator((s) => s.toast);
  const clearToast = useConfigurator((s) => s.clearToast);

  useEffect(() => {
    if (!toast) return;
    const t = window.setTimeout(clearToast, 2600);
    return () => window.clearTimeout(t);
  }, [toast, clearToast]);

  return (
    <AnimatePresence>
      {toast && (
        <motion.div
          initial={{ opacity: 0, y: 24, scale: 0.96 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 24, scale: 0.96 }}
          transition={{ type: "spring", stiffness: 360, damping: 28 }}
          className="fixed bottom-24 left-1/2 z-[60] flex -translate-x-1/2 items-center gap-2.5 rounded-full bg-ink px-5 py-3 text-porcelain shadow-lift lg:bottom-8"
          role="status"
          aria-live="polite"
        >
          <span className="grid h-5 w-5 place-items-center rounded-full bg-gold text-ivory">
            <CheckIcon className="h-3 w-3" />
          </span>
          <span className="text-[0.85rem] tracking-wide">{toast}</span>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
