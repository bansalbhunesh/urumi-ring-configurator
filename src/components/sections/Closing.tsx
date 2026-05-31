"use client";

/* ============================================================
   CLOSING — animation universe: FALL + BURST CTA

   The finale drops in from above (like the curtain falling) and
   the CTA springs up with burst energy — the last physics world
   before the page ends.
   ============================================================ */

import { motion } from "framer-motion";
import { InceptionReveal } from "@/components/ui/InceptionReveal";
import { SplitText } from "@/components/ui/SplitText";

const CI = [0.22, 1, 0.36, 1] as const;

export function Closing() {
  return (
    <section
      id="finale"
      data-ring="finale"
      className="relative flex min-h-[100svh] flex-col items-center justify-between overflow-hidden px-6 pt-28 pb-24 text-center sm:pt-32"
    >
      {/* Quote falls from above — cinematic curtain-drop */}
      <InceptionReveal mode="fall" className="relative z-10 mx-auto max-w-lg">
        <span className="eyebrow">Forever</span>
        <p className="font-display mt-4 text-balance text-[1.6rem] leading-snug text-ink sm:text-[2rem]">
          Somewhere, someone is about to ask the most important question of their
          life.
        </p>
        <p className="font-display mt-3 text-xl italic text-gold sm:text-2xl">
          This is what they&apos;ll be holding.
        </p>
        <p className="mt-8 text-[0.8rem] uppercase tracking-[0.28em] text-muted">
          Some choices last forever
        </p>
      </InceptionReveal>

      {/* CTA springs up with burst — final kinetic moment */}
      <InceptionReveal mode="burst" delay={0.3} className="relative z-10">
        <motion.a
          href="#ring"
          className="inline-flex h-12 items-center rounded-full border border-line px-7 text-[0.8rem] uppercase tracking-[0.18em] text-ink outline-none transition-colors hover:border-gold hover:text-gold focus-visible:ring-2 focus-visible:ring-gold focus-visible:ring-offset-2 focus-visible:ring-offset-porcelain"
          whileHover={{ scale: 1.05, transition: { type: "spring", stiffness: 400, damping: 20 } }}
          whileTap={{ scale: 0.96 }}
        >
          Configure yours
        </motion.a>
      </InceptionReveal>
    </section>
  );
}
