"use client";

import { motion } from "framer-motion";
import { SplitText } from "@/components/ui/SplitText";
import { useConfigurator } from "@/store/configurator";
import { METAL_BY_ID } from "@/lib/config";

/* ----------------------------------------------------------------------------
   ACT VII — The human connection.

   The environment falls away. Silence. The ring settles onto a finger — real
   scale, no UI, just the moment. Rendered as a quiet line-art beat in the same
   gold-stroke language as Acts II/VI (a graceful finger; faint neighbours suggest
   the hand), with the band tinted to the chosen metal settling into place as the
   section arrives. "Designed for a moment that changes everything."
---------------------------------------------------------------------------- */

const EASE = [0.22, 1, 0.36, 1] as const;
const line = {
  hidden: { pathLength: 0, opacity: 0 },
  show: (i: number) => ({
    pathLength: 1,
    opacity: 1,
    transition: {
      pathLength: { duration: 1.6, ease: EASE, delay: 0.1 + i * 0.12 },
      opacity: { duration: 0.4, delay: 0.1 + i * 0.12 },
    },
  }),
};

export function HumanConnection() {
  const metal = useConfigurator((s) => s.metal);
  const band = METAL_BY_ID[metal].color;

  return (
    <section
      id="hand"
      data-ring="hidden"
      className="relative flex min-h-[100svh] flex-col items-center justify-center overflow-hidden px-6 py-28 text-center"
    >
      <motion.svg
        viewBox="0 0 480 520"
        className="w-full max-w-md"
        fill="none"
        initial="hidden"
        whileInView="show"
        viewport={{ once: true, margin: "-15%" }}
        aria-hidden
      >
        {/* faint neighbouring fingers — just enough to suggest the hand */}
        <motion.path d="M176 500 C 168 380, 176 280, 188 214" stroke="#e3c585" strokeOpacity="0.22" strokeWidth="1" variants={line} custom={0} />
        <motion.path d="M150 505 C 138 400, 150 320, 168 260" stroke="#e3c585" strokeOpacity="0.16" strokeWidth="1" variants={line} custom={0.4} />
        <motion.path d="M300 500 C 312 380, 306 290, 296 226" stroke="#e3c585" strokeOpacity="0.22" strokeWidth="1" variants={line} custom={0.2} />

        {/* the ring finger — two elegant edges meeting at a soft tip */}
        <motion.path d="M222 505 C 214 360, 220 240, 234 150" stroke="#e3c585" strokeOpacity="0.85" strokeWidth="1.4" variants={line} custom={1} />
        <motion.path d="M270 505 C 276 360, 270 240, 256 150" stroke="#e3c585" strokeOpacity="0.85" strokeWidth="1.4" variants={line} custom={1.2} />
        {/* fingertip */}
        <motion.path d="M234 150 C 238 132, 252 132, 256 150" stroke="#e3c585" strokeOpacity="0.85" strokeWidth="1.4" variants={line} custom={1.5} />
        {/* nail hint */}
        <motion.path d="M238 150 C 240 162, 250 162, 252 150" stroke="#e3c585" strokeOpacity="0.4" strokeWidth="0.8" variants={line} custom={1.8} />
        {/* knuckle / palm hint at the base */}
        <motion.path d="M150 505 C 210 470, 280 470, 320 505" stroke="#e3c585" strokeOpacity="0.18" strokeWidth="1" variants={line} custom={0.6} />

        {/* the ring — tinted to the chosen metal — settles onto the finger */}
        <motion.g
          initial={{ y: -26, opacity: 0 }}
          whileInView={{ y: 0, opacity: 1 }}
          viewport={{ once: true, margin: "-15%" }}
          transition={{ duration: 1.1, ease: EASE, delay: 1.5 }}
        >
          <ellipse cx="246" cy="300" rx="34" ry="13" stroke={band} strokeWidth="3.4" fill="none" />
          <ellipse cx="246" cy="300" rx="34" ry="13" stroke={band} strokeOpacity="0.35" strokeWidth="7" fill="none" style={{ filter: "blur(3px)" }} />
          {/* a small set stone catching light */}
          <circle cx="246" cy="287" r="3.4" fill="#fff6e6" />
        </motion.g>
      </motion.svg>

      <SplitText as="h2" className="display-3 mt-10 max-w-2xl text-balance text-ink">
        Designed for a moment that changes everything.
      </SplitText>
    </section>
  );
}
