"use client";

import { motion } from "framer-motion";
import { useConfigurator } from "@/store/configurator";
import type { MetalId } from "@/lib/types";

/* "The room reacts to the metal." A barely-there ambient wash behind the studio
   that cools for white gold, warms for yellow, blushes for rose — felt, not
   noticed. The 3D environment carries the obvious signal; this carries the mood. */
const TINT: Record<MetalId, string> = {
  "white-gold": "#dbe6ff",
  "yellow-gold": "#ffe6b0",
  "rose-gold": "#ffd6c9",
};

export function RoomTint() {
  const committed = useConfigurator((s) => s.metal);
  const preview = useConfigurator((s) => s.previewMetal);
  const metal = preview ?? committed;
  return (
    <motion.div
      aria-hidden
      className="pointer-events-none absolute inset-0"
      initial={false}
      animate={{
        background: `radial-gradient(75% 65% at 68% 28%, ${TINT[metal]}66, transparent 70%)`,
      }}
      transition={{ duration: 1.1, ease: [0.22, 1, 0.36, 1] }}
    />
  );
}
