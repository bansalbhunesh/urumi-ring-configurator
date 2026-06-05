"use client";

import { type ReactNode } from "react";
import { motion } from "framer-motion";

const EASE = [0.22, 1, 0.36, 1] as const;

/* ----------------------------------------------------------------------------
   SceneReveal — "entering a new scene" on scroll.

   A whileInView entrance (rise from depth + scale up + fade) so each section
   arrives like a new scene as you scroll into it. Deliberately viewport-driven
   (not scroll-position-linked) so it is reliable under the tall sticky sections
   above it and can never leave content hidden. `depth` scales how far the layer
   rises, so stacked layers (headline vs. ledger) arrive at different distances.
---------------------------------------------------------------------------- */
export function SceneReveal({
  children,
  className,
  depth = 1,
}: {
  children: ReactNode;
  className?: string;
  depth?: number;
}) {
  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, y: 64 * depth, scale: 0.95 }}
      whileInView={{ opacity: 1, y: 0, scale: 1 }}
      viewport={{ once: true, margin: "-8% 0px -8% 0px" }}
      transition={{ duration: 1.0, ease: EASE }}
    >
      {children}
    </motion.div>
  );
}
