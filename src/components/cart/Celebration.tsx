"use client";

import { useEffect } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { useConfigurator } from "@/store/configurator";

/* The Add-to-Cart "film": a held breath. Screen darkens, a single shockwave of
   light leaves the centre, gold dust drifts, and one line settles — then the
   bag opens. ~2s. The confirmation is a moment, not a toast. */

const DUST = Array.from({ length: 20 });

export function Celebration() {
  const on = useConfigurator((s) => s.celebrating);
  const end = useConfigurator((s) => s.endCelebrate);
  const openCart = useConfigurator((s) => s.openCart);

  useEffect(() => {
    if (!on) return;
    const t = window.setTimeout(() => {
      end();
      openCart();
    }, 2050);
    return () => window.clearTimeout(t);
  }, [on, end, openCart]);

  return (
    <AnimatePresence>
      {on && (
        <motion.div
          className="fixed inset-0 z-[80] flex items-center justify-center overflow-hidden"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.4 }}
          aria-hidden
        >
          <motion.div
            className="absolute inset-0 bg-ink"
            initial={{ opacity: 0 }}
            animate={{ opacity: [0, 0.93, 0.93, 0.8] }}
            transition={{ duration: 2, times: [0, 0.18, 0.78, 1] }}
          />

          {/* expanding shockwave ring */}
          <motion.div
            className="absolute h-10 w-10 rounded-full border border-gold-bright"
            initial={{ scale: 0, opacity: 0.9 }}
            animate={{ scale: [0, 16], opacity: [0.9, 0] }}
            transition={{ duration: 1.4, ease: [0.22, 1, 0.36, 1] }}
          />

          {/* warm core bloom */}
          <motion.div
            className="absolute h-44 w-44 rounded-full"
            style={{
              background:
                "radial-gradient(circle, rgba(201,168,106,0.55), transparent 70%)",
            }}
            initial={{ scale: 0.2, opacity: 0 }}
            animate={{ scale: [0.2, 2.6, 1.7], opacity: [0, 0.85, 0] }}
            transition={{ duration: 1.8 }}
          />

          {/* gold dust */}
          {DUST.map((_, i) => {
            const a = (i / DUST.length) * Math.PI * 2;
            const dist = 120 + Math.random() * 180;
            return (
              <motion.span
                key={i}
                className="absolute h-1 w-1 rounded-full bg-gold-bright"
                initial={{ x: 0, y: 0, opacity: 0 }}
                animate={{
                  x: Math.cos(a) * dist,
                  y: Math.sin(a) * dist + 70,
                  opacity: [0, 1, 0],
                }}
                transition={{ duration: 1.6 + Math.random() * 0.6, ease: "easeOut", delay: 0.1 }}
              />
            );
          })}

          <motion.p
            className="font-display relative text-4xl italic text-porcelain sm:text-5xl"
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: [0, 1, 1, 0], y: 0 }}
            transition={{ duration: 2, times: [0, 0.28, 0.74, 1] }}
          >
            Held for you.
          </motion.p>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
