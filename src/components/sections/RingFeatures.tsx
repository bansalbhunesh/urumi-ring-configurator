"use client";

/* ============================================================
   RING FEATURES — oryzo.ai-style cinematic feature grid

   Three columns, each: icon → tagline → description → o-dashline → BIG TITLE
   Background: slow-rotating orbital ring circle, technical footnotes

   Same structure as oryzo.ai #features but adapted for the ring:
   - The Twist: the continuous gold ribbon
   - The Setting: open-air prong crown
   - The Precision: atelier craftsmanship
   ============================================================ */

import { motion } from "framer-motion";
import { InceptionReveal } from "@/components/ui/InceptionReveal";

/* ── SVG Icons — circle bg + feature mark, à la oryzo.ai ── */

function TwistIcon() {
  return (
    <svg viewBox="0 0 64 64" fill="none" aria-hidden>
      <circle cx="32" cy="32" r="32" fill="currentColor" opacity=".18" />
      {/* Upward ribbon arrow */}
      <path
        fill="currentColor"
        stroke="currentColor"
        strokeWidth="1.036"
        d="m24 28 8-10.2a.09.09 0 0 1 .14 0L40 28h-4.7v12.7h-6.6V28z"
      />
      {/* Trailing stack lines — the "twist" repeating below */}
      <path stroke="currentColor" strokeLinecap="square" strokeWidth="1.15"
        d="M28.8 44.1h6.4" opacity=".8" />
      <path stroke="currentColor" strokeLinecap="square" strokeWidth="1.15"
        d="M28.8 46.8h6.4" opacity=".55" />
      <path stroke="currentColor" strokeLinecap="square" strokeWidth="1.15"
        d="M28.8 49.4h6.4" opacity=".3" />
      {/* Orbital ellipse — the ring's equatorial shadow */}
      <path
        stroke="currentColor"
        strokeWidth=".72"
        d="M32 31.8c3.6 0 6.8.6 9.1 1.6 1.1.5 2.1 1.1 2.7 1.7.6.6.9 1.25.9 1.9s-.3 1.27-.9 1.89c-.6.62-1.53 1.19-2.67 1.68C38.77 39.56 35.56 40.15 32 40.15s-6.76-.6-9.06-1.58c-1.15-.49-2.06-1.06-2.68-1.68-.61-.62-.91-1.26-.91-1.89s.3-1.27.91-1.9c.62-.6 1.53-1.18 2.68-1.67C25.24 32.39 28.44 31.8 32 31.8z"
      />
    </svg>
  );
}

function SettingIcon() {
  return (
    <svg viewBox="0 0 54 54" fill="none" aria-hidden>
      <circle cx="27" cy="27" r="27" fill="currentColor" opacity=".18" />
      {/* Outer precision ring */}
      <circle cx="27" cy="27" r="13.8" stroke="currentColor" strokeWidth=".789" />
      {/* Crosshair end-caps */}
      <rect x="40" y="25.73" width="2.32" height="2.32" fill="currentColor" />
      <rect x="11.68" y="25.73" width="2.32" height="2.32" fill="currentColor" />
      {/* Inner dashed setting circle — the prong diameter */}
      <circle cx="27" cy="27" r="9.25" stroke="currentColor" strokeWidth="1.1"
        fill="none" strokeDasharray="2 2" />
      {/* Stone centre */}
      <circle cx="27" cy="27" r="3.5" fill="currentColor" opacity=".35" />
      {/* Top + bottom marks (prongs) */}
      <rect x="25.83" y="11.96" width="2.32" height="2.32" fill="currentColor" />
      <rect x="25.83" y="39.71" width="2.32" height="2.32" fill="currentColor" />
    </svg>
  );
}

function PrecisionIcon() {
  return (
    <svg viewBox="0 0 54 54" fill="none" aria-hidden>
      <circle cx="27" cy="27" r="27" fill="currentColor" opacity=".18" />
      {/* Thermometer body */}
      <path
        fill="currentColor"
        d="M20.54 21.7a.47.47 0 0 1 .77.36v13.7a5.69 5.69 0 0 0 11.37 0v-1.94h.8v1.94a6.49 6.49 0 0 1-12.97 0V22.96l-.3.36-.61-.52.89-1.04zm6.45-6.85a3.375 3.375 0 0 1 3.375 3.375v17.55a3.375 3.375 0 0 1-6.75 0v-17.55a3.375 3.375 0 0 1 3.375-3.375M24.29 34.76h2.7a.338.338 0 0 0 0-.676h-2.7zm0-2.02h1.35a.338.338 0 0 0 0-.676h-1.35zm0-2.03h2.7a.337.337 0 0 0 0-.675h-2.7zm0-2.02h1.35a.338.338 0 0 0 0-.676h-1.35zm0-2.03h2.7a.337.337 0 0 0 0-.675h-2.7zm0-2.02h1.35a.338.338 0 0 0 0-.676h-1.35z"
      />
      {/* Outer calibration ring */}
      <path
        stroke="currentColor"
        strokeWidth=".72"
        d="M27 11.7a6.49 6.49 0 0 1 6.49 6.49v12.8l.31-.36.6.52-.89 1.04a.47.47 0 0 1-.77-.36v-13.7a5.69 5.69 0 0 0-11.37 0V20.2h-.8v-1.97A6.49 6.49 0 0 1 27 11.7z"
      />
    </svg>
  );
}

/* ── Feature data ── */
const FEATURES = [
  {
    id: "twist",
    Icon: TwistIcon,
    tagline: "Form meets forever",
    desc: "Each ribbon is drawn by hand into a continuous tension loop — no seam, no join. One unbroken line of 18k gold, twisted into permanence.",
    title: "Perpetual twist",
  },
  {
    id: "setting",
    Icon: SettingIcon,
    tagline: "Light enters from every angle",
    desc: "The open-air crown lifts the stone clear of the band, letting pavilion light ignite the facets even in the dimmest candlelight.",
    title: "Open-air crown",
  },
  {
    id: "precision",
    Icon: PrecisionIcon,
    tagline: "Atelier precision, every time",
    desc: "Every stone is conflict-free and independently graded for brilliance. Every setting is checked under 10× magnification before it leaves our atelier.",
    title: "Lifelong precision",
  },
] as const;

/* ── Technical footnotes ── */
const FOOTNOTES = [
  {
    note: "Constant form via geometry",
    eq: "K = ∮ κ ds  ·  Twist constant = 1.0",
  },
  {
    note: "PRONG GEOMETRY (PPG)\nA visualization, not a warranty",
    eq: "θ = 4 × 90°  ·  Girdle depth 0.6 mm",
  },
  {
    note: "Purity index (24k = 1.0)\nHallmark standard: 750‰",
    eq: "0.750 Au  ·  Recycled certified",
  },
];

export function RingFeatures() {
  return (
    <section
      id="ring-features"
      data-ring="stage"
      className="relative min-h-screen overflow-hidden px-6 py-36 sm:px-10 lg:px-16 lg:py-48"
    >
      {/* ── Orbital ring background — very subtle, slowly rotates ── */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 flex items-center justify-center"
      >
        <motion.svg
          viewBox="0 0 809 174"
          className="w-[min(88vw,720px)] text-gold"
          fill="currentColor"
          style={{ opacity: 0.035 }}
          animate={{ rotate: 360 }}
          transition={{ duration: 140, ease: "linear", repeat: Infinity }}
        >
          {/* Two ring silhouettes from the Urumi wordmark geometry */}
          <path d="M87 174C36 174 0 132 0 87S36 0 87 0s87 42 87 87-36 87-87 87zm0-39c25 0 48-20.02 48-48S112 39 87 39 39 59.02 39 87s22 47.98 48 48z" />
          <path d="M722 174c-51 0-87-42-87-87S671 0 722 0s87 42 87 87-36 87-87 87zm0-39c25 0 48-20.02 48-48S747 39 722 39s-48 20.02-48 48 23 47.98 48 48z" />
        </motion.svg>
      </div>

      {/* ── Content ── */}
      <div className="relative mx-auto max-w-7xl">

        {/* Section eyebrow */}
        <InceptionReveal mode="flip">
          <span className="eyebrow">The making of exceptional</span>
        </InceptionReveal>

        {/* ── Three feature columns ── */}
        <div className="mt-16 grid grid-cols-1 gap-20 lg:grid-cols-3 lg:gap-10">
          {FEATURES.map((f, i) => (
            <InceptionReveal
              key={f.id}
              mode="rise"
              delay={i * 0.13}
              className="flex flex-col"
            >
              {/* Top: icon + tagline */}
              <div>
                <div
                  className="h-[64px] w-[64px] text-ink"
                  style={{
                    filter: "drop-shadow(0 0 14px rgba(200,165,107,0.28))",
                  }}
                >
                  <f.Icon />
                </div>

                <p className="mt-6 text-[0.78rem] font-semibold uppercase tracking-[0.24em] text-gold">
                  {f.tagline}
                </p>
              </div>

              {/* Description */}
              <p className="mt-5 text-[1.02rem] leading-relaxed text-ink-soft">
                {f.desc}
              </p>

              {/* Dashed divider — the oryzo o-dashline */}
              <div className="o-dashline my-8 w-full" />

              {/* Big title — the payoff you read last */}
              <h3 className="display-3 text-ink">{f.title}</h3>
            </InceptionReveal>
          ))}
        </div>

        {/* ── Technical footnotes — oryzo bottom captions ── */}
        <div className="mt-24 hidden grid-cols-3 gap-10 text-[0.68rem] leading-snug tracking-wide text-muted lg:grid">
          {FOOTNOTES.map((fn, i) => (
            <InceptionReveal
              key={i}
              mode="clip"
              dir={i === 2 ? "right" : "left"}
              delay={0.25 + i * 0.07}
            >
              <div>
                <div className="whitespace-pre-line uppercase opacity-55">
                  {fn.note}
                </div>
                <div className="mt-2 font-mono text-[0.62rem] opacity-35">
                  {fn.eq}
                </div>
              </div>
            </InceptionReveal>
          ))}
        </div>

        {/* Bottom rule */}
        <InceptionReveal mode="clip" delay={0.35} className="mt-16">
          <div className="h-px bg-gradient-to-r from-transparent via-line to-transparent" />
        </InceptionReveal>
      </div>
    </section>
  );
}
