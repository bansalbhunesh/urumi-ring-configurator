"use client";

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
      {/* Subtle ambient glow for the finale — the ring has returned */}
      <div
        className="pointer-events-none absolute inset-0"
        aria-hidden
        style={{
          background:
            "radial-gradient(ellipse 60% 50% at 50% 40%, rgba(200,165,107,0.09) 0%, transparent 70%)",
        }}
      />

      <InceptionReveal mode="fall" className="relative z-10 mx-auto max-w-xl">
        <span className="eyebrow">Forever</span>
        <SplitText as="p" className="font-display mt-6 text-balance text-[1.65rem] leading-snug text-ink sm:text-[2.1rem]">
          Somewhere, someone is about to ask the most important question of their life.
        </SplitText>
        <motion.p
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 1, ease: CI, delay: 0.6 }}
          className="font-display mt-4 text-xl italic text-gold sm:text-2xl"
        >
          This is what they&apos;ll be holding.
        </motion.p>
        <div className="mx-auto mt-6 max-w-[8rem]">
          <div className="rule-gold h-px" />
        </div>
        <p className="mt-6 text-[0.8rem] uppercase tracking-[0.28em] text-muted">
          Some choices last forever
        </p>
      </InceptionReveal>

      <div className="relative z-10 flex flex-col items-center gap-4">
        <InceptionReveal mode="burst" delay={0.3}>
          <motion.a
            href="#ring"
            className="inline-flex h-14 items-center rounded-full bg-gold/10 border border-gold/60 px-10 text-[0.82rem] uppercase tracking-[0.2em] text-gold outline-none transition-all hover:bg-gold hover:text-black focus-visible:ring-2 focus-visible:ring-gold focus-visible:ring-offset-2 focus-visible:ring-offset-porcelain"
            whileHover={{ scale: 1.04, transition: { type: "spring", stiffness: 400, damping: 22 } }}
            whileTap={{ scale: 0.97 }}
          >
            Configure yours
          </motion.a>
        </InceptionReveal>
        <motion.p
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 1, ease: CI, delay: 0.8 }}
          className="text-[0.7rem] tracking-wide text-muted"
        >
          Complimentary shipping · Lifetime warranty · 30-day returns
        </motion.p>
      </div>
    </section>
  );
}
