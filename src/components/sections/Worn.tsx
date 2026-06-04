"use client";

/* ============================================================
   WORN — animation universe: EMERGENCE

   After the cinematic abstraction and the real voices, one
   grounding truth: this object lives on a hand. A real one.
   The photograph is already lit like our world — warm skin, a
   gold ring catching light out of near-black — so we let its
   edges dissolve into the page and the hand simply emerges. A
   slow parallax lift as it scrolls; the copy arrives beside it.
   ============================================================ */

import { useEffect, useRef, useState } from "react";
import { motion, useScroll, useTransform, useReducedMotion, AnimatePresence } from "framer-motion";
import { Reveal } from "@/components/ui/Reveal";
import { SplitText } from "@/components/ui/SplitText";

export function Worn() {
  const ref = useRef<HTMLDivElement>(null);
  const reduce = useReducedMotion() ?? false;
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"],
  });
  const y = useTransform(scrollYProgress, [0, 1], reduce ? ["0%", "0%"] : ["8%", "-8%"]);
  const scale = useTransform(scrollYProgress, [0, 0.5, 1], reduce ? [1, 1, 1] : [1.08, 1.02, 1.08]);

  // The ring, alive on the hand — a slow turn between two angles.
  const SHOTS = ["/img/doamore/twist-lifestyle.jpg", "/img/doamore/twist-lifestyle-angle.jpg"];
  const [shot, setShot] = useState(0);
  useEffect(() => {
    if (reduce) return;
    const id = window.setInterval(() => setShot((s) => (s + 1) % SHOTS.length), 4600);
    return () => window.clearInterval(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [reduce]);

  return (
    <section
      id="worn"
      data-ring="hidden"
      className="relative overflow-hidden px-6 py-24 sm:px-10 lg:px-16 lg:py-32"
    >
      <div
        ref={ref}
        className="mx-auto grid max-w-6xl items-center gap-12 lg:grid-cols-2 lg:gap-16"
      >
        {/* The hand, emerging from the dark */}
        <div className="relative order-2 lg:order-1">
          <div className="relative mx-auto aspect-square w-full max-w-lg overflow-hidden rounded-sm">
            <motion.div className="absolute inset-0" style={{ y, scale }}>
              <AnimatePresence initial={false}>
                <motion.img
                  key={shot}
                  src={SHOTS[shot]}
                  alt="The Twist engagement ring worn on the hand"
                  className="absolute inset-0 h-full w-full object-cover"
                  loading="lazy"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 1.6, ease: [0.16, 1, 0.3, 1] }}
                />
              </AnimatePresence>
            </motion.div>
            {/* dissolve the photo's edges into the page so the hand floats out of the dark */}
            <div
              className="pointer-events-none absolute inset-0"
              aria-hidden
              style={{
                background:
                  "radial-gradient(closest-side at 52% 46%, transparent 48%, rgba(16,9,4,0.55) 78%, var(--color-ivory) 100%)",
              }}
            />
          </div>
        </div>

        {/* The line that grounds everything */}
        <div className="order-1 lg:order-2">
          <Reveal mode="rise">
            <span className="eyebrow">Worn</span>
          </Reveal>
          <Reveal mode="rise" delay={0.05} className="mt-5">
            <SplitText as="h2" className="font-display text-balance text-[clamp(2.4rem,5vw,5.2rem)] font-semibold leading-[0.95] tracking-[-0.02em] text-ink">
              The only place it was ever meant to be.
            </SplitText>
          </Reveal>
          <Reveal mode="clip" delay={0.12} className="mt-6">
            <p className="max-w-md text-[1.05rem] leading-relaxed text-ink-soft">
              Not on a screen, not under studio glass — on a hand, catching the
              light of an ordinary afternoon. Every render on this page was only
              ever rehearsing for this.
            </p>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
