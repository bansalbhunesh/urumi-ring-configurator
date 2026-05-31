"use client";

/* ============================================================
   BLUEPRINT — animation universe: MICRO ZOOM + SCROLL ROTATION

   Completely different from every section before it:
   - The SVG drawing starts at ~4% of its final size and zooms
     to full scale (Apple/Samsung product reveal "tunnel" effect)
   - Additionally the whole drawing has a subtle scroll-driven
     rotation — as you scroll through, it slowly de-tilts from
     a slight angle to straight, giving depth and motion
   - Annotations sweep in from the edges with clip-path after

   Inspired by: Samsung Galaxy page, Apple Mac Studio reveal
   ============================================================ */

import { motion, useScroll, useTransform } from "framer-motion";
import { useRef } from "react";
import { SplitText } from "@/components/ui/SplitText";
import { InceptionReveal } from "@/components/ui/InceptionReveal";
import { Reveal } from "@/components/ui/Reveal";
import { useConfigurator } from "@/store/configurator";
import { STONE_BY_ID } from "@/lib/config";

const EASE = [0.22, 1, 0.36, 1] as const;
const EX   = [0.16, 1, 0.3, 1] as const;

const stroke = {
  hidden: { pathLength: 0, opacity: 0 },
  show: (i: number) => ({
    pathLength: 1,
    opacity: 1,
    transition: {
      pathLength: { duration: 1.5, ease: EASE, delay: 0.15 + i * 0.16 },
      opacity: { duration: 0.3, delay: 0.15 + i * 0.16 },
    },
  }),
};
const label = {
  hidden: { opacity: 0, y: 6 },
  show: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, delay: 0.9 + i * 0.12, ease: EASE },
  }),
};

export function Blueprint() {
  const stone = useConfigurator((s) => s.stone);
  const spec = STONE_BY_ID[stone];

  const sectionRef = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start end", "end start"],
  });

  /* As the section scrolls through viewport: slight initial tilt → level */
  const rotateY = useTransform(scrollYProgress, [0, 0.5], [6, 0]);
  const rotateX = useTransform(scrollYProgress, [0, 0.4], [-4, 0]);

  return (
    <section
      ref={sectionRef}
      id="precision"
      data-ring="hidden"
      className="relative flex min-h-[100svh] flex-col items-center justify-center px-6 py-28 text-center sm:px-10"
    >
      <InceptionReveal mode="fall">
        <span className="eyebrow">Hidden precision</span>
      </InceptionReveal>

      <SplitText as="h2" className="display-3 mt-5 text-balance text-ink">
        Luxury is precision.
      </SplitText>

      <Reveal delay={0.12}>
        <p className="mx-auto mt-5 max-w-md text-[1.02rem] leading-relaxed text-ink-soft">
          Strip away the shine and a quiet engineering remains — every angle
          measured, every millimetre intentional. This is what you can&apos;t see,
          and what you pay for.
        </p>
      </Reveal>

      {/* The drawing — tunnel zoom + scroll-driven perspective tilt */}
      <motion.div
        className="mt-12 w-full max-w-xl"
        initial={{ opacity: 0, scale: 0.04 }}
        whileInView={{ opacity: 1, scale: 1 }}
        viewport={{ once: true, margin: "-10%" }}
        transition={{ duration: 1.3, ease: EX }}
        style={{ rotateY, rotateX, perspective: 1200 }}
      >
        <motion.svg
          viewBox="0 0 460 420"
          className="w-full text-gold"
          fill="none"
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: "-10%" }}
          aria-hidden
        >
          {/* crosshair guides */}
          <motion.line x1="230" y1="20" x2="230" y2="400" stroke="currentColor" strokeOpacity="0.14" strokeWidth="0.75" strokeDasharray="3 5" variants={stroke} custom={0} />
          <motion.line x1="40" y1="250" x2="420" y2="250" stroke="currentColor" strokeOpacity="0.14" strokeWidth="0.75" strokeDasharray="3 5" variants={stroke} custom={0} />

          {/* band outer + inner */}
          <motion.circle cx="230" cy="250" r="120" stroke="currentColor" strokeWidth="1.25" variants={stroke} custom={1} />
          <motion.circle cx="230" cy="250" r="100" stroke="currentColor" strokeWidth="1.25" variants={stroke} custom={1.4} />

          {/* raised setting */}
          <motion.line x1="205" y1="150" x2="214" y2="96" stroke="currentColor" strokeWidth="1" variants={stroke} custom={2} />
          <motion.line x1="255" y1="150" x2="246" y2="96" stroke="currentColor" strokeWidth="1" variants={stroke} custom={2} />

          {/* stone in section */}
          <motion.path d="M196 80 L264 80 L246 96 L214 96 Z" stroke="currentColor" strokeWidth="1.25" variants={stroke} custom={2.3} />
          <motion.path d="M214 96 L246 96 L230 132 Z" stroke="currentColor" strokeWidth="1.25" variants={stroke} custom={2.6} />
          <motion.line x1="205" y1="88" x2="255" y2="88" stroke="currentColor" strokeOpacity="0.5" strokeWidth="0.75" variants={stroke} custom={2.8} />

          {/* dimension line */}
          <motion.line x1="70" y1="130" x2="70" y2="370" stroke="currentColor" strokeOpacity="0.55" strokeWidth="0.75" variants={stroke} custom={3} />
          <motion.line x1="64" y1="130" x2="76" y2="130" stroke="currentColor" strokeOpacity="0.55" strokeWidth="0.75" variants={stroke} custom={3.1} />
          <motion.line x1="64" y1="370" x2="76" y2="370" stroke="currentColor" strokeOpacity="0.55" strokeWidth="0.75" variants={stroke} custom={3.1} />

          {/* band-width dimension */}
          <motion.line x1="350" y1="250" x2="395" y2="250" stroke="currentColor" strokeOpacity="0.45" strokeWidth="0.75" variants={stroke} custom={3.3} />

          {/* annotations */}
          <motion.text variants={label} custom={0} x="52" y="254" fill="currentColor" fillOpacity="0.85" fontSize="11" letterSpacing="2" transform="rotate(-90 52 254)" textAnchor="middle">Ø 16.5 MM</motion.text>
          <motion.text variants={label} custom={1} x="402" y="246" fill="currentColor" fillOpacity="0.7" fontSize="10" letterSpacing="1.5">BAND 1.9 MM</motion.text>
          <motion.text variants={label} custom={2} x="300" y="86" fill="currentColor" fillOpacity="0.85" fontSize="11" letterSpacing="1.5">{spec.label.toUpperCase()} · {spec.carat}</motion.text>
          <motion.text variants={label} custom={3} x="300" y="104" fill="currentColor" fillOpacity="0.6" fontSize="9.5" letterSpacing="1.5">57° TABLE · GIA</motion.text>
        </motion.svg>
      </motion.div>
    </section>
  );
}
