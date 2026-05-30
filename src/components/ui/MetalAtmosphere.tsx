"use client";

import { motion } from "framer-motion";
import { useConfigurator } from "@/store/configurator";
import type { MetalId } from "@/lib/types";

/* Act IV — "The materials of forever." Switching metal shifts the whole room's
   atmosphere, not only the ring: white gold cools to moonlight, yellow warms to
   heritage, rose blushes to intimacy. One fixed, very subtle wash that sits behind
   the alpha canvas — felt, not noticed — so the emotion of the page changes with
   the choice. Kept low-alpha so it never muddies the restrained dark stage; the
   reduced-motion path still cross-fades (it's a colour change, not autoplay). */
const ATMOSPHERE: Record<MetalId, string> = {
  "white-gold":
    "radial-gradient(72% 56% at 56% 10%, rgba(176,202,255,0.10), transparent 60%), radial-gradient(48% 50% at 82% 86%, rgba(110,132,184,0.05), transparent 72%)",
  "yellow-gold":
    "radial-gradient(72% 56% at 56% 10%, rgba(255,208,128,0.11), transparent 60%), radial-gradient(48% 50% at 82% 86%, rgba(150,108,48,0.05), transparent 72%)",
  "rose-gold":
    "radial-gradient(72% 56% at 56% 10%, rgba(255,188,172,0.11), transparent 60%), radial-gradient(48% 50% at 82% 86%, rgba(150,92,82,0.05), transparent 72%)",
};

export function MetalAtmosphere() {
  const committed = useConfigurator((s) => s.metal);
  const preview = useConfigurator((s) => s.previewMetal);
  const metal = preview ?? committed;
  return (
    <motion.div
      aria-hidden
      className="pointer-events-none fixed inset-0 z-0"
      initial={false}
      animate={{ background: ATMOSPHERE[metal] }}
      transition={{ duration: 1.4, ease: [0.22, 1, 0.36, 1] }}
    />
  );
}
