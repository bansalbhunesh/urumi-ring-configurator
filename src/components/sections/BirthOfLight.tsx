"use client";

import { motion } from "framer-motion";
import { SplitText } from "@/components/ui/SplitText";
import { Reveal } from "@/components/ui/Reveal";

/* ----------------------------------------------------------------------------
   ACT II — The birth of light.

   Before form, light. A single white beam enters a faceted crystal and fans into
   a spectrum — refraction as the origin of beauty. Rendered as a controlled
   prism beat (SVG + Framer, no 3D/GPU) so the spectral colour reads cleanly and
   elegantly, never garish: thin glowing beams over near-black, the facets drawing
   on like the stone assembling itself. "Beauty begins where light finds form."
---------------------------------------------------------------------------- */

const EASE = [0.22, 1, 0.36, 1] as const;
const SPECTRUM = ["#ff6b6b", "#ffb057", "#ffe96b", "#7be08a", "#5ab8ff", "#9a7bff", "#d27bff"];

const beam = {
  hidden: { pathLength: 0, opacity: 0 },
  show: (i: number) => ({
    pathLength: 1,
    opacity: 1,
    transition: {
      pathLength: { duration: 1.1, ease: EASE, delay: 0.6 + i * 0.12 },
      opacity: { duration: 0.3, delay: 0.6 + i * 0.12 },
    },
  }),
};
const facet = {
  hidden: { pathLength: 0, opacity: 0 },
  show: (i: number) => ({
    pathLength: 1,
    opacity: 0.9,
    transition: {
      pathLength: { duration: 1.2, ease: EASE, delay: i * 0.14 },
      opacity: { duration: 0.3, delay: i * 0.14 },
    },
  }),
};

export function BirthOfLight() {
  // crystal apex (entry) and the fan origin (exit) for the spectrum
  const ox = 432;
  const oy = 205;

  return (
    <section
      id="light"
      data-ring="bgfloat"
      className="relative flex min-h-[100svh] flex-col items-center justify-center overflow-hidden px-6 py-28 text-center sm:px-10"
    >
      <span className="eyebrow">The birth of light</span>
      <SplitText as="h2" className="display-3 mt-5 text-balance text-ink">
        Beauty begins where light finds form.
      </SplitText>
      <Reveal delay={0.12}>
        <p className="mx-auto mt-5 max-w-md text-[1.02rem] leading-relaxed text-ink-soft">
          Before a ring, before a stone — a beam of light enters, bends, and breaks
          into colour. Everything that follows is just giving that moment a shape.
        </p>
      </Reveal>

      <motion.svg
        viewBox="0 0 760 420"
        className="mt-10 w-full max-w-3xl"
        fill="none"
        initial="hidden"
        whileInView="show"
        viewport={{ once: true, margin: "-15%" }}
        aria-hidden
      >
        <defs>
          <filter id="spectrum-glow" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="3.4" result="b" />
            <feMerge>
              <feMergeNode in="b" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        {/* incoming white beam */}
        <motion.line
          x1="20" y1="205" x2={ox} y2={oy}
          stroke="#fff6e8" strokeWidth="1.6"
          variants={facet} custom={0}
          style={{ filter: "drop-shadow(0 0 4px rgba(255,246,232,0.6))" }}
        />

        {/* the crystal — a faceted brilliant in section, assembling facet by facet */}
        <motion.path d="M360 150 L432 132 L470 205 L408 250 Z" stroke="#e3c585" strokeOpacity="0.85" strokeWidth="1.25" variants={facet} custom={1} />
        <motion.path d="M360 150 L408 250 L470 205" stroke="#e3c585" strokeOpacity="0.55" strokeWidth="0.9" variants={facet} custom={1.6} />
        <motion.line x1="432" y1="132" x2="408" y2="250" stroke="#e3c585" strokeOpacity="0.45" strokeWidth="0.75" variants={facet} custom={2} />

        {/* the spectrum fanning out of the crystal */}
        <g filter="url(#spectrum-glow)">
          {SPECTRUM.map((c, i) => {
            const spread = (i - (SPECTRUM.length - 1) / 2) * 16;
            return (
              <motion.line
                key={c}
                x1={ox} y1={oy}
                x2={745} y2={oy + spread * 3.4}
                stroke={c}
                strokeWidth="1.5"
                strokeOpacity="0.7"
                variants={beam}
                custom={i}
              />
            );
          })}
        </g>
      </motion.svg>
    </section>
  );
}
