"use client";

import { useEffect } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { useConfigurator } from "@/store/configurator";

/* The Add-to-Cart "film": a held breath. Screen darkens, a single shockwave of
   light leaves the centre, gold dust drifts, and one line settles — then the
   bag opens. ~2s. The confirmation is a moment, not a toast. */

const DUST = Array.from({ length: 20 }, (_, i) => {
  const angle = (i / 20) * Math.PI * 2;
  const seeded = Math.sin((i + 1) * 12.9898) * 43758.5453;
  const unit = seeded - Math.floor(seeded);
  return {
    angle,
    distance: 120 + unit * 180,
    duration: 1.1 + unit * 0.3,
  };
});

export function Celebration() {
  const on = useConfigurator((s) => s.celebrating);
  const end = useConfigurator((s) => s.endCelebrate);
  const openCart = useConfigurator((s) => s.openCart);
  const reduceMotion = useReducedMotion();

  useEffect(() => {
    if (!on) return;
    const finish = () => {
      end();
      openCart();
    };
    const t = window.setTimeout(finish, reduceMotion ? 650 : 1500);
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape" || e.key === "Enter" || e.key === " ") finish();
    };
    window.addEventListener("keydown", onKey);
    return () => {
      window.clearTimeout(t);
      window.removeEventListener("keydown", onKey);
    };
  }, [on, end, openCart, reduceMotion]);

  const skip = () => {
    end();
    openCart();
  };

  return (
    <AnimatePresence>
      {on && (
        <motion.div
          className="fixed inset-0 z-[80] flex cursor-pointer items-center justify-center overflow-hidden"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: reduceMotion ? 0.01 : 0.25 }}
          onClick={skip}
          aria-hidden
        >
          <motion.div
            className="absolute inset-0 bg-ink"
            initial={{ opacity: 0 }}
            animate={{ opacity: reduceMotion ? 0.88 : [0, 0.93, 0.9] }}
            transition={{ duration: reduceMotion ? 0.01 : 1.35, times: reduceMotion ? undefined : [0, 0.18, 1] }}
          />

          {/* expanding shockwave ring */}
          <motion.div
            className="absolute h-10 w-10 rounded-full border border-gold-bright"
            initial={{ scale: 0, opacity: 0.9 }}
            animate={{ scale: reduceMotion ? 1 : [0, 16], opacity: reduceMotion ? 0 : [0.9, 0] }}
            transition={{ duration: reduceMotion ? 0.01 : 1.1, ease: [0.22, 1, 0.36, 1] }}
          />

          {/* warm core bloom */}
          <motion.div
            className="absolute h-44 w-44 rounded-full"
            style={{
              background:
                "radial-gradient(circle, rgba(201,168,106,0.55), transparent 70%)",
            }}
            initial={{ scale: 0.2, opacity: 0 }}
            animate={{ scale: reduceMotion ? 1 : [0.2, 2.2, 1.5], opacity: reduceMotion ? 0.25 : [0, 0.75, 0] }}
            transition={{ duration: reduceMotion ? 0.01 : 1.25 }}
          />

          {/* gold dust */}
          {!reduceMotion && DUST.map((dust, i) => {
            return (
              <motion.span
                key={i}
                className="absolute h-1 w-1 rounded-full bg-gold-bright"
                initial={{ x: 0, y: 0, opacity: 0 }}
                animate={{
                  x: Math.cos(dust.angle) * dust.distance,
                  y: Math.sin(dust.angle) * dust.distance + 70,
                  opacity: [0, 1, 0],
                }}
                transition={{ duration: dust.duration, ease: "easeOut", delay: 0.1 }}
              />
            );
          })}

          <motion.p
            className="font-display relative text-4xl italic text-porcelain sm:text-5xl"
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: reduceMotion ? [0, 1] : [0, 1, 1, 0], y: 0 }}
            transition={{ duration: reduceMotion ? 0.2 : 1.4, times: reduceMotion ? undefined : [0, 0.28, 0.76, 1] }}
          >
            Held for you.
          </motion.p>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
