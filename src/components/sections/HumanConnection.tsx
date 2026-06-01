"use client";

import { motion, useReducedMotion } from "framer-motion";
import { SplitText } from "@/components/ui/SplitText";
import { useConfigurator } from "@/store/configurator";
import { METAL_BY_ID } from "@/lib/config";

const EASE = [0.22, 1, 0.36, 1] as const;
const stroke = {
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
  const reduceMotion = useReducedMotion() ?? false;

  return (
    <section
      id="hand"
      data-ring="hidden"
      className="relative flex min-h-[100svh] flex-col items-center justify-center overflow-hidden bg-[#0c0b09] px-6 py-28 text-center"
    >
      {/* warm atmospheric bloom — centered on the ring */}
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "radial-gradient(ellipse 62% 38% at 50% 52%, rgba(195,155,65,0.18) 0%, rgba(130,90,30,0.07) 55%, transparent 78%)",
        }}
        aria-hidden
      />
      {/* cinematic vignette — darkens the four corners */}
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "radial-gradient(ellipse 80% 75% at 50% 50%, transparent 35%, rgba(4,3,2,0.75) 100%)",
        }}
        aria-hidden
      />

      {/* the hand — large enough to feel present, not decorative */}
      <motion.svg
        viewBox="0 0 480 560"
        className="relative z-10 w-full max-w-[24rem] sm:max-w-xl lg:max-w-2xl"
        fill="none"
        initial="hidden"
        whileInView="show"
        viewport={{ once: true, margin: "-15%" }}
        aria-hidden
      >
        <defs>
          {/* layered glow for the ring band */}
          <filter id="hc-ring-glow" x="-80%" y="-120%" width="260%" height="340%">
            <feGaussianBlur in="SourceGraphic" stdDeviation="10" result="outer" />
            <feGaussianBlur in="SourceGraphic" stdDeviation="3.5" result="mid" />
            <feMerge>
              <feMergeNode in="outer" />
              <feMergeNode in="mid" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
          {/* diffuse glow for the stone */}
          <filter id="hc-stone-glow" x="-300%" y="-300%" width="700%" height="700%">
            <feGaussianBlur in="SourceGraphic" stdDeviation="7" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        {/* pinky + index — barely-there atmosphere, not the subject */}
        <motion.path
          d="M148 568 C 136 452, 150 362, 172 292"
          stroke="#e3c585" strokeOpacity="0.32" strokeWidth="1.2"
          variants={stroke} custom={0.3}
        />
        <motion.path
          d="M318 566 C 334 452, 322 362, 308 298"
          stroke="#e3c585" strokeOpacity="0.32" strokeWidth="1.2"
          variants={stroke} custom={0.5}
        />

        {/* neighbouring fingers — visible but secondary */}
        <motion.path
          d="M178 563 C 170 418, 178 300, 190 222"
          stroke="#e3c585" strokeOpacity="0.52" strokeWidth="1.4"
          variants={stroke} custom={0}
        />
        <motion.path
          d="M300 561 C 312 418, 308 308, 296 230"
          stroke="#e3c585" strokeOpacity="0.52" strokeWidth="1.4"
          variants={stroke} custom={0.2}
        />

        {/* ring finger — the hero */}
        <motion.path
          d="M220 568 C 212 400, 218 272, 232 160"
          stroke="#e3c585" strokeOpacity="0.92" strokeWidth="2"
          variants={stroke} custom={1}
        />
        <motion.path
          d="M272 568 C 280 400, 274 272, 258 160"
          stroke="#e3c585" strokeOpacity="0.92" strokeWidth="2"
          variants={stroke} custom={1.2}
        />
        {/* fingertip */}
        <motion.path
          d="M232 160 C 236 138, 254 138, 258 160"
          stroke="#e3c585" strokeOpacity="0.92" strokeWidth="2"
          variants={stroke} custom={1.5}
        />
        {/* nail — fine detail */}
        <motion.path
          d="M237 160 C 239 174, 251 174, 253 160"
          stroke="#e3c585" strokeOpacity="0.48" strokeWidth="1"
          variants={stroke} custom={1.9}
        />
        {/* palm / knuckle hint */}
        <motion.path
          d="M148 568 C 212 530, 288 530, 332 568"
          stroke="#e3c585" strokeOpacity="0.24" strokeWidth="1.1"
          variants={stroke} custom={0.7}
        />

        {/* ── THE RING ── */}
        <motion.g
          initial={reduceMotion ? { opacity: 1 } : { y: -38, opacity: 0 }}
          whileInView={reduceMotion ? { opacity: 1 } : { y: 0, opacity: 1 }}
          viewport={{ once: true, margin: "-15%" }}
          transition={{ duration: 1.35, ease: EASE, delay: 1.7 }}
        >
          {/* outer atmospheric bloom */}
          <ellipse cx="246" cy="312" rx="56" ry="21"
            stroke={band} strokeOpacity="0.18" strokeWidth="28" fill="none"
            style={{ filter: "blur(16px)" }}
          />
          {/* mid glow */}
          <ellipse cx="246" cy="312" rx="54" ry="20"
            stroke={band} strokeOpacity="0.55" strokeWidth="10" fill="none"
            style={{ filter: "blur(5px)" }}
          />
          {/* crisp band */}
          <ellipse cx="246" cy="312" rx="52" ry="19"
            stroke={band} strokeWidth="5.5" fill="none"
            filter="url(#hc-ring-glow)"
          />

          {/* stone diffuse light */}
          <circle cx="246" cy="301" r="11"
            fill={band} fillOpacity="0.20"
            style={{ filter: "blur(10px)" }}
          />
          {/* stone face */}
          <circle cx="246" cy="301" r="5"
            fill="#fff8f0" filter="url(#hc-stone-glow)"
          />

          {/* 8-point sparkle — reveals after the ring lands */}
          <motion.g
            initial={{ opacity: 0, scale: 0 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.55, ease: EASE, delay: 2.7 }}
            style={{ transformOrigin: "246px 301px" }}
          >
            {/* cardinal rays */}
            <line x1="246" y1="287" x2="246" y2="292" stroke="#fff8f0" strokeWidth="1" />
            <line x1="246" y1="310" x2="246" y2="315" stroke="#fff8f0" strokeWidth="1" />
            <line x1="232" y1="301" x2="237" y2="301" stroke="#fff8f0" strokeWidth="1" />
            <line x1="255" y1="301" x2="260" y2="301" stroke="#fff8f0" strokeWidth="1" />
            {/* diagonal rays */}
            <line x1="237" y1="291" x2="240" y2="294" stroke="#fff8f0" strokeWidth="0.7" strokeOpacity="0.65" />
            <line x1="255" y1="291" x2="252" y2="294" stroke="#fff8f0" strokeWidth="0.7" strokeOpacity="0.65" />
            <line x1="237" y1="311" x2="240" y2="308" stroke="#fff8f0" strokeWidth="0.7" strokeOpacity="0.65" />
            <line x1="255" y1="311" x2="252" y2="308" stroke="#fff8f0" strokeWidth="0.7" strokeOpacity="0.65" />
          </motion.g>
        </motion.g>
      </motion.svg>

      <SplitText as="h2" className="display-3 relative z-10 mt-10 max-w-2xl text-balance text-ink">
        Designed for a moment that changes everything.
      </SplitText>
    </section>
  );
}
