"use client";

import { motion } from "framer-motion";

/* The finale. The global canvas brings the ring back to centre stage here, so
   copy is held to clear bands at the top and bottom — the ring fills the gap
   between them and never overlaps text. */
export function Closing() {
  return (
    <section
      id="finale"
      data-ring="finale"
      className="relative flex min-h-[100svh] flex-col items-center justify-between overflow-hidden px-6 pt-28 pb-24 text-center sm:pt-32"
    >
      <motion.div
        initial={{ opacity: 0, y: 18 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-15%" }}
        transition={{ duration: 1.2, ease: [0.22, 1, 0.36, 1] }}
        className="relative z-10 mx-auto max-w-lg"
      >
        <span className="eyebrow">The moment</span>
        <p className="font-display mt-4 text-balance text-[1.6rem] leading-snug text-ink sm:text-[2rem]">
          Somewhere, someone is about to ask the most important question of their
          life.
        </p>
        <p className="font-display mt-3 text-xl italic text-gold sm:text-2xl">
          This is what they&apos;ll be holding.
        </p>
      </motion.div>

      <motion.a
        href="#ring"
        initial={{ opacity: 0, y: 18 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 1, delay: 0.15, ease: [0.22, 1, 0.36, 1] }}
        className="relative z-10 inline-flex h-12 items-center rounded-full border border-line px-7 text-[0.8rem] uppercase tracking-[0.18em] text-ink outline-none transition-colors hover:border-gold hover:text-gold focus-visible:ring-2 focus-visible:ring-gold focus-visible:ring-offset-2 focus-visible:ring-offset-porcelain"
      >
        Configure yours
      </motion.a>
    </section>
  );
}
