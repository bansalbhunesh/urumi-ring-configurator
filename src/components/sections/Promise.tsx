"use client";

/* ============================================================
   PROMISE — animation universe: 3D PERSPECTIVE WORD PUSH

   The palette cleanser. Everything goes cream. But the animation
   universe flips completely:

   - Each word of the heading pushes forward from deep 3D space,
     starting scaled up + blurred + at perspective depth, arriving
     sharp + at 1:1 scale — like text materializing out of fog.
   - The subtext uses clip-path to sweep in from the left.
   - Background has a subtle radial reveal that expands from center.

   This is the most dimensional moment on the page — the promise
   deserves to feel like it's arriving from somewhere real.

   Inspired by: Apple Vision Pro / Lusion.co immersive text reveals
   ============================================================ */

import { motion } from "framer-motion";
import { InceptionReveal } from "@/components/ui/InceptionReveal";
import { SplitText } from "@/components/ui/SplitText";

const EX = [0.16, 1, 0.3, 1] as const;

export function PromiseSection() {
  return (
    <section
      id="promise"
      data-ring="hidden"
      className="paper relative z-10 flex min-h-[80svh] flex-col items-center justify-center overflow-hidden px-6 py-40 text-center sm:px-10 lg:py-56"
    >
      {/* Radial reveal — background pulses open from center as section enters */}
      <motion.div
        className="pointer-events-none absolute inset-0"
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true, margin: "-10%" }}
        transition={{ duration: 1.4, ease: EX }}
        style={{
          background:
            "radial-gradient(ellipse 70% 60% at 50% 50%, rgba(240,230,210,0.55) 0%, transparent 100%)",
        }}
        aria-hidden
      />

      {/* Eyebrow — standard clip (small, precise) */}
      <InceptionReveal mode="clip" className="relative z-10">
        <span className="eyebrow">The promise</span>
      </InceptionReveal>

      {/* The big line — 3D perspective push, each word from deep space */}
      <div className="relative z-10 mt-7">
        <SplitText
          as="h2"
          mode="push"
          stagger={0.07}
          className="display-1 max-w-[14ch] justify-center text-balance"
        >
          A ring is a promise you can hold.
        </SplitText>
      </div>

      {/* Subtext — clips in from left after the heading lands */}
      <InceptionReveal mode="clip" delay={0.6} className="relative z-10 mt-8">
        <p className="mx-auto max-w-md text-[1.05rem] leading-relaxed text-paper-ink/70">
          Not an algorithm. Not a subscription. One object, made once, meant to
          outlast every phone you will ever own.
        </p>
      </InceptionReveal>
    </section>
  );
}
