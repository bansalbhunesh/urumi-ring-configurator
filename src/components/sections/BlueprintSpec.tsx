"use client";

import { useRef } from "react";
import { motion, useScroll, useTransform, useReducedMotion } from "framer-motion";

/* ============================================================
   BlueprintSpec — animated engineering blueprint overlay.

   A technical drawing of the Twist ring: cross-section view
   with dimension lines that draw themselves in on scroll.
   HUD labels fade in, measurement callouts slide.

   Purely CSS/SVG/motion — no Three.js dependency.
   ============================================================ */

const EASE = [0.22, 1, 0.36, 1] as const;

const draw = {
  hidden: { pathLength: 0, opacity: 0 },
  show: (delay: number) => ({
    pathLength: 1,
    opacity: 1,
    transition: {
      pathLength: { duration: 2.2, ease: EASE, delay },
      opacity:    { duration: 0.3, delay },
    },
  }),
};

function DimLine({
  x1, y1, x2, y2, delay, label, labelX, labelY,
}: {
  x1: number; y1: number; x2: number; y2: number;
  delay: number; label: string; labelX: number; labelY: number;
}) {
  return (
    <>
      <motion.line
        x1={x1} y1={y1} x2={x2} y2={y2}
        stroke="#4a9eff" strokeWidth="0.8" strokeDasharray="4 2"
        variants={draw} custom={delay}
      />
      <motion.text
        x={labelX} y={labelY}
        fill="#4a9eff" fontSize="9" fontFamily="monospace"
        initial={{ opacity: 0 }} whileInView={{ opacity: 1 }}
        viewport={{ once: true }} transition={{ delay: delay + 0.5, duration: 0.6 }}
      >
        {label}
      </motion.text>
    </>
  );
}

export function BlueprintSpec() {
  const ref = useRef<HTMLDivElement>(null);
  const reduceMotion = useReducedMotion() ?? false;

  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "end start"] });
  const gridOpacity = useTransform(scrollYProgress, [0.1, 0.4], [0, 0.18]);
  const scanY = useTransform(scrollYProgress, [0.1, 0.85], ["0%", "100%"]);

  return (
    <section
      id="blueprint"
      ref={ref}
      data-ring="hidden"
      className="relative min-h-[120svh] overflow-hidden bg-[#020b18] py-24"
    >
      {/* Grid overlay */}
      <motion.div
        className="pointer-events-none absolute inset-0"
        style={{
          opacity: gridOpacity,
          backgroundImage:
            "linear-gradient(rgba(74,158,255,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(74,158,255,0.5) 1px, transparent 1px)",
          backgroundSize: "32px 32px",
        }}
      />

      {/* Scan line */}
      {!reduceMotion && (
        <motion.div
          className="pointer-events-none absolute left-0 right-0 h-px bg-sky-400/30"
          style={{ top: scanY }}
        />
      )}

      <div className="relative z-10 mx-auto max-w-6xl px-6 lg:px-16">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 1, ease: EASE }}
          className="mb-12"
        >
          <div className="mb-2 flex items-center gap-3">
            <span className="h-px w-6 bg-sky-400/60" />
            <span className="font-mono text-[0.65rem] uppercase tracking-[0.28em] text-sky-400/60">
              Blueprint · Rev 04 · Confidential
            </span>
          </div>
          <h2 className="font-display text-[2.2rem] leading-tight text-white sm:text-[3rem]">
            Precision{" "}
            <span className="text-sky-400">by design.</span>
          </h2>
        </motion.div>

        {/* Main blueprint layout */}
        <div className="grid grid-cols-1 gap-12 lg:grid-cols-2 lg:gap-16">
          {/* SVG cross-section drawing */}
          <div className="relative">
            <motion.svg
              viewBox="0 0 360 360"
              className="w-full max-w-[420px]"
              fill="none"
              initial={reduceMotion ? "show" : "hidden"}
              whileInView="show"
              viewport={{ once: true, margin: "-10%" }}
            >
              {/* Ring cross section outline */}
              <motion.ellipse
                cx="180" cy="180" rx="88" ry="88"
                stroke="#4a9eff" strokeWidth="1.5"
                variants={draw} custom={0.1}
              />
              <motion.ellipse
                cx="180" cy="180" rx="62" ry="62"
                stroke="#4a9eff" strokeWidth="1.2"
                variants={draw} custom={0.3}
              />
              {/* Twist cross sections — multiple offset circles */}
              {[0, 45, 90, 135, 180, 225, 270, 315].map((deg, i) => {
                const rad = (deg * Math.PI) / 180;
                const r = 75;
                const x = 180 + r * Math.cos(rad);
                const y = 180 + r * Math.sin(rad);
                return (
                  <motion.circle
                    key={deg}
                    cx={x} cy={y} r="11"
                    stroke="#4a9eff" strokeWidth="0.9" strokeOpacity="0.6"
                    variants={draw} custom={0.5 + i * 0.06}
                  />
                );
              })}
              {/* Centre stone */}
              <motion.polygon
                points="180,142 196,166 180,175 164,166"
                stroke="#a8d4ff" strokeWidth="1.2" fill="#4a9eff" fillOpacity="0.08"
                variants={draw} custom={1.0}
              />
              <motion.polygon
                points="180,142 196,166 180,178 164,166"
                stroke="#a8d4ff" strokeWidth="0.7" strokeOpacity="0.5"
                variants={draw} custom={1.1}
              />
              {/* Dimension lines */}
              <DimLine x1={92} y1={50} x2={268} y2={50} delay={1.3}
                label="⌀ 17.35 mm" labelX={130} labelY={46} />
              <DimLine x1={42} y1={180} x2={42} y2={92} delay={1.5}
                label="h 4.2 mm" labelX={4} labelY={140} />
              <DimLine x1={268} y1={130} x2={318} y2={130} delay={1.7}
                label="w 2.8 mm" labelX={320} labelY={134} />
              {/* Centre cross */}
              <motion.line x1="180" y1="170" x2="180" y2="190"
                stroke="#4a9eff" strokeWidth="0.6"
                variants={draw} custom={0.9} />
              <motion.line x1="170" y1="180" x2="190" y2="180"
                stroke="#4a9eff" strokeWidth="0.6"
                variants={draw} custom={0.9} />
            </motion.svg>
          </div>

          {/* Spec data */}
          <div className="flex flex-col justify-center gap-8">
            {[
              { label: "Ring Style", value: "The Twist — Double-Helix Shank", delay: 0.2 },
              { label: "Band Width", value: "2.8 mm at the shank", delay: 0.4 },
              { label: "Profile", value: "D-profile, hand-finished", delay: 0.5 },
              { label: "Setting", value: "4-claw solitaire, lifted 0.8 mm", delay: 0.6 },
              { label: "Centre Stone", value: "0.50–3.0 ct brilliant", delay: 0.7 },
              { label: "Material", value: "18k Yellow, White, or Rose Gold", delay: 0.8 },
              { label: "Surface", value: "Mirror polish + brushed twist", delay: 0.9 },
            ].map((row) => (
              <motion.div
                key={row.label}
                initial={{ opacity: 0, x: 30 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.8, ease: EASE, delay: row.delay }}
                className="flex items-baseline justify-between border-b border-sky-900/50 pb-3"
              >
                <span className="font-mono text-[0.65rem] uppercase tracking-[0.2em] text-sky-400/70">
                  {row.label}
                </span>
                <span className="font-display text-[0.95rem] text-sky-100">
                  {row.value}
                </span>
              </motion.div>
            ))}

            {/* HUD callout */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 1, ease: EASE, delay: 1.1 }}
              className="mt-4 rounded border border-sky-400/25 bg-sky-400/5 p-4"
            >
              <p className="font-mono text-[0.7rem] text-sky-300/80">
                <span className="text-sky-400">▶ </span>
                Each dimension is validated against a physical sample ring
                before production. Tolerance: ±0.05 mm.
              </p>
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  );
}
