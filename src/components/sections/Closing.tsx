"use client";

import { motion } from "framer-motion";
import { InceptionReveal } from "@/components/ui/InceptionReveal";
import { SplitText } from "@/components/ui/SplitText";
import { MagneticButton } from "@/components/ui/animations/MagneticButton";

const CI = [0.22, 1, 0.36, 1] as const;

export function Closing() {
  return (
    <section
      id="finale"
      data-ring="finale"
      className="relative flex min-h-[100svh] flex-col items-center justify-between overflow-hidden px-6 pt-28 pb-24 text-center sm:pt-32"
    >
      {/* Deep ambient glow — the ring has returned to centre stage */}
      <div
        className="pointer-events-none absolute inset-0"
        aria-hidden
        style={{
          background:
            "radial-gradient(ellipse 65% 55% at 50% 38%, rgba(200,165,107,0.12) 0%, transparent 68%)",
        }}
      />

      {/* Fine horizontal rule above — entering the finale */}
      <motion.div
        className="relative z-10 w-full max-w-xs"
        initial={{ scaleX: 0 }}
        whileInView={{ scaleX: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 1.4, ease: CI }}
        style={{ originX: 0.5 }}
      >
        <div className="rule-gold h-px" />
      </motion.div>

      <InceptionReveal mode="flip" className="relative z-10 mx-auto max-w-xl mt-8">
        <span className="eyebrow">Forever</span>
        <SplitText
          as="p"
          className="font-display mt-6 text-balance text-[1.65rem] leading-snug text-ink sm:text-[2.1rem]"
          mode="push"
          stagger={0.045}
          delay={0.1}
        >
          Somewhere, someone is about to ask the most important question of their life.
        </SplitText>
        <motion.p
          initial={{ opacity: 0, y: 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 1.1, ease: CI, delay: 0.7 }}
          className="font-display mt-5 text-xl italic text-gold sm:text-2xl"
        >
          This is what they&apos;ll be holding.
        </motion.p>
        <div className="mx-auto mt-7 max-w-[7rem]">
          <div className="rule-gold h-px" />
        </div>
        <motion.p
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 1, ease: CI, delay: 0.95 }}
          className="mt-6 text-[0.8rem] uppercase tracking-[0.28em] text-muted"
        >
          Some choices last forever
        </motion.p>
      </InceptionReveal>

      <div className="relative z-10 flex flex-col items-center gap-5">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 1, ease: CI, delay: 0.3 }}
        >
          <MagneticButton
            href="#ring"
            className="inline-flex h-14 items-center rounded-full bg-gold/10 border border-gold/60 px-12 text-[0.82rem] uppercase tracking-[0.22em] text-gold outline-none transition-all hover:bg-gold hover:text-black focus-visible:ring-2 focus-visible:ring-gold focus-visible:ring-offset-2 focus-visible:ring-offset-porcelain"
            strength={0.28}
          >
            Configure yours
          </MagneticButton>
        </motion.div>
        <motion.p
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 1, ease: CI, delay: 0.55 }}
          className="text-[0.7rem] tracking-wide text-muted"
        >
          Complimentary shipping · Lifetime warranty · 30-day returns
        </motion.p>
      </div>
    </section>
  );
}
