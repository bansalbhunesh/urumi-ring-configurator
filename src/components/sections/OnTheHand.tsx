"use client";

import Image from "next/image";
import { motion, useReducedMotion } from "framer-motion";
import { useConfigurator } from "@/store/configurator";
import { METAL_BY_ID } from "@/lib/config";
import { InceptionReveal } from "@/components/ui/InceptionReveal";
import { SplitText } from "@/components/ui/SplitText";

/* ----------------------------------------------------------------------------
   "See it on the hand" — an SVG line-art hand with the ring colour following
   the live selection, set beside a photographic ring still. Both sides shift
   with the metal choice: SVG strokes update live, photo is atmospheric.
---------------------------------------------------------------------------- */

const EASE = [0.22, 1, 0.36, 1] as const;

const draw = {
  hidden: { pathLength: 0, opacity: 0 },
  show: (i: number) => ({
    pathLength: 1,
    opacity: 1,
    transition: {
      pathLength: { duration: 1.9, ease: EASE, delay: 0.15 + i * 0.09 },
      opacity:    { duration: 0.25, delay: 0.15 + i * 0.09 },
    },
  }),
};

function HandWithRing({ band }: { band: string }) {
  const reduceMotion = useReducedMotion() ?? false;
  return (
    <motion.svg
      viewBox="0 0 320 520"
      className="w-full max-w-[22rem] lg:max-w-[28rem] xl:max-w-[34rem]"
      fill="none"
      initial={reduceMotion ? "show" : "hidden"}
      whileInView="show"
      viewport={{ once: true, margin: "-8%" }}
      aria-hidden
    >
      <defs>
        <filter id="oth-ring-glow" x="-80%" y="-120%" width="260%" height="340%">
          <feGaussianBlur in="SourceGraphic" stdDeviation="10" result="outer" />
          <feGaussianBlur in="SourceGraphic" stdDeviation="3.5" result="mid" />
          <feMerge>
            <feMergeNode in="outer" />
            <feMergeNode in="mid" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
        <filter id="oth-stone-glow" x="-300%" y="-300%" width="700%" height="700%">
          <feGaussianBlur in="SourceGraphic" stdDeviation="6" result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>

      {/* Index finger */}
      <motion.path d="M92 510 C 88 390 92 300 100 238 C 104 208 106 188 106 168 C 106 150 104 136 103 124" stroke="#e3c585" strokeOpacity="0.36" strokeWidth="1.3" strokeLinecap="round" variants={draw} custom={0} />
      <motion.path d="M124 512 C 120 392 124 300 130 238 C 134 208 136 188 135 167 C 134 149 132 135 130 123" stroke="#e3c585" strokeOpacity="0.36" strokeWidth="1.3" strokeLinecap="round" variants={draw} custom={0.1} />
      <motion.path d="M103 124 C 103 112 111 106 116 105 C 122 105 130 111 130 123" stroke="#e3c585" strokeOpacity="0.36" strokeWidth="1.3" variants={draw} custom={0.15} />

      {/* Ring finger — hero */}
      <motion.path d="M158 516 C 154 394 156 302 162 234 C 166 200 168 174 166 152 C 165 134 163 120 162 110" stroke="#e3c585" strokeOpacity="0.92" strokeWidth="2.2" strokeLinecap="round" variants={draw} custom={0.5} />
      <motion.path d="M200 514 C 202 392 200 300 194 234 C 190 200 188 174 188 152 C 188 134 188 120 188 110" stroke="#e3c585" strokeOpacity="0.92" strokeWidth="2.2" strokeLinecap="round" variants={draw} custom={0.6} />
      <motion.path d="M162 110 C 162 96 168 88 175 87 C 182 87 188 95 188 110" stroke="#e3c585" strokeOpacity="0.92" strokeWidth="2.2" variants={draw} custom={0.75} />
      <motion.path d="M167 110 C 168 122 181 122 183 110" stroke="#e3c585" strokeOpacity="0.38" strokeWidth="1" variants={draw} custom={0.9} />

      {/* Middle finger */}
      <motion.path d="M216 510 C 218 390 220 300 220 236 C 220 206 218 184 215 163 C 212 146 210 132 208 120" stroke="#e3c585" strokeOpacity="0.36" strokeWidth="1.3" strokeLinecap="round" variants={draw} custom={0.25} />
      <motion.path d="M248 510 C 252 390 252 300 248 236 C 246 206 244 184 241 163 C 238 146 236 132 234 120" stroke="#e3c585" strokeOpacity="0.36" strokeWidth="1.3" strokeLinecap="round" variants={draw} custom={0.35} />
      <motion.path d="M208 120 C 208 108 216 101 221 100 C 228 100 234 107 234 120" stroke="#e3c585" strokeOpacity="0.36" strokeWidth="1.3" variants={draw} custom={0.42} />

      {/* Palm */}
      <motion.path d="M92 510 C 140 496 200 496 248 510" stroke="#e3c585" strokeOpacity="0.18" strokeWidth="1.1" variants={draw} custom={0.2} />

      {/* THE RING */}
      <motion.g
        initial={reduceMotion ? { y: 0, opacity: 1 } : { y: -36, opacity: 0 }}
        whileInView={{ y: 0, opacity: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 1.4, ease: EASE, delay: 1.85 }}
      >
        <ellipse cx="178" cy="316" rx="50" ry="18" stroke={band} strokeOpacity="0.13" strokeWidth="26" fill="none" style={{ filter: "blur(14px)" }} />
        <ellipse cx="178" cy="316" rx="48" ry="17" stroke={band} strokeOpacity="0.48" strokeWidth="9" fill="none" style={{ filter: "blur(4px)" }} />
        <ellipse cx="178" cy="316" rx="46" ry="16.5" stroke={band} strokeWidth="4.5" fill="none" filter="url(#oth-ring-glow)" />
        <circle cx="178" cy="299" r="12" fill={band} fillOpacity="0.18" style={{ filter: "blur(10px)" }} />
        <circle cx="178" cy="299" r="5.5" fill="#fff8f0" filter="url(#oth-stone-glow)" />
        <motion.g
          initial={{ opacity: 0, scale: 0 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.55, ease: EASE, delay: 2.9 }}
          style={{ transformOrigin: "178px 299px" }}
        >
          <line x1="178" y1="284" x2="178" y2="290" stroke="#fff8f0" strokeWidth="1.2" />
          <line x1="178" y1="308" x2="178" y2="314" stroke="#fff8f0" strokeWidth="1.2" />
          <line x1="162" y1="299" x2="168" y2="299" stroke="#fff8f0" strokeWidth="1.2" />
          <line x1="188" y1="299" x2="194" y2="299" stroke="#fff8f0" strokeWidth="1.2" />
          <line x1="167" y1="288" x2="171" y2="292" stroke="#fff8f0" strokeWidth="0.8" strokeOpacity="0.65" />
          <line x1="189" y1="288" x2="185" y2="292" stroke="#fff8f0" strokeWidth="0.8" strokeOpacity="0.65" />
          <line x1="167" y1="310" x2="171" y2="306" stroke="#fff8f0" strokeWidth="0.8" strokeOpacity="0.65" />
          <line x1="189" y1="310" x2="185" y2="306" stroke="#fff8f0" strokeWidth="0.8" strokeOpacity="0.65" />
        </motion.g>
      </motion.g>
    </motion.svg>
  );
}

export function OnTheHand() {
  const metal = useConfigurator((s) => s.metal);
  const band = METAL_BY_ID[metal].color;

  return (
    <section
      id="on-hand"
      data-ring="hidden"
      className="relative flex min-h-[100svh] items-center overflow-hidden px-6 py-24 sm:px-10 lg:px-16"
    >
      {/* warm centre glow */}
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "radial-gradient(ellipse 58% 64% at 68% 52%, rgba(195,155,65,0.10) 0%, transparent 70%)",
        }}
        aria-hidden
      />

      <div className="mx-auto grid w-full max-w-6xl grid-cols-1 items-center gap-16 lg:grid-cols-2 lg:gap-24">
        {/* LEFT — words */}
        <div className="order-2 lg:order-1">
          <InceptionReveal mode="flip">
            <span className="eyebrow">On the hand</span>
          </InceptionReveal>

          <SplitText as="h2" className="display-2 mt-5 text-balance text-ink" mode="push" stagger={0.05} delay={0.1}>
            Worn, not just configured.
          </SplitText>

          <div className="o-dashline my-7 max-w-[14rem]" />

          <InceptionReveal mode="clip" delay={0.3} className="max-w-md">
            <p className="text-[1.02rem] leading-relaxed text-ink-soft">
              Turn it in the light. The Twist on a finger — real scale, real
              weight, the moment it stops being a configuration and becomes
              yours.
            </p>
          </InceptionReveal>

          {/* Product still — authentic ring photo, appears after the text */}
          <motion.div
            initial={{ opacity: 0, y: 14 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-5%" }}
            transition={{ duration: 1.1, ease: EASE, delay: 0.5 }}
            className="mt-10 overflow-hidden rounded-xl border border-line/50"
            style={{ maxWidth: "22rem" }}
          >
            <Image
              src="/img/ring-angle.jpg"
              alt="The Twist engagement ring — white gold, angled view"
              width={600}
              height={450}
              className="w-full object-cover"
              priority={false}
            />
          </motion.div>
        </div>

        {/* RIGHT — hand illustration */}
        <div className="order-1 flex items-center justify-center lg:order-2">
          <HandWithRing band={band} />
        </div>
      </div>
    </section>
  );
}
