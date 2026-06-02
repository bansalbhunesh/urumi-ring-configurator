"use client";

/* ============================================================
   MISSION — animation universe: STILL WATER

   The emotional peak. Do Amore's soul is that every ring funds
   a clean-water well; the buyer receives the coordinates of the
   well they built. We render that as a held breath: a single
   slow caustic shimmer, three counters that climb once, and one
   line that reframes the whole purchase — "one ring, two
   forevers." No product here. Just meaning.
   ============================================================ */

import { motion, useReducedMotion } from "framer-motion";
import { Reveal } from "@/components/ui/Reveal";
import { SplitText } from "@/components/ui/SplitText";
import { CountUp } from "@/components/ui/animations/CountUp";

const STATS: { to: number; suffix?: string; label: string }[] = [
  { to: 22345, label: "people given clean water" },
  { to: 77, label: "wells built" },
  { to: 14, label: "nations reached" },
];

export function Mission() {
  const reduce = useReducedMotion() ?? false;
  return (
    <section
      id="mission"
      data-ring="hidden"
      className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden px-6 py-40 text-center"
    >
      {/* still water — one slow caustic shimmer, cool against the warm studio */}
      <motion.div
        className="pointer-events-none absolute inset-0 -z-10"
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true, margin: "-10%" }}
        transition={{ duration: 2, ease: [0.16, 1, 0.3, 1] }}
        style={{
          background:
            "radial-gradient(60% 50% at 50% 38%, rgba(70,110,140,0.18), transparent 70%)",
        }}
        aria-hidden
      />
      {!reduce && (
        <motion.div
          className="pointer-events-none absolute left-1/2 top-[34%] -z-10 h-[44vw] w-[44vw] -translate-x-1/2 -translate-y-1/2 rounded-full"
          style={{
            border: "1px solid rgba(160,190,210,0.10)",
            boxShadow:
              "0 0 0 18px rgba(160,190,210,0.03), 0 0 0 42px rgba(160,190,210,0.02)",
          }}
          animate={{ scale: [1, 1.06, 1], opacity: [0.5, 0.9, 0.5] }}
          transition={{ duration: 9, ease: "easeInOut", repeat: Infinity }}
          aria-hidden
        />
      )}

      <Reveal mode="clip" className="relative">
        <span className="eyebrow">Every ring, something bigger</span>
      </Reveal>

      <div className="relative mt-7">
        <SplitText
          as="h2"
          mode="push"
          stagger={0.06}
          className="font-display max-w-[14ch] justify-center text-balance font-semibold leading-[0.92] tracking-[-0.025em] text-ink [overflow-wrap:normal] text-[clamp(2.5rem,10vw,8rem)]"
        >
          Somewhere, a well begins.
        </SplitText>
      </div>

      <Reveal mode="clip" delay={0.5} className="relative mt-8">
        <p className="mx-auto max-w-xl text-[1.08rem] leading-relaxed text-ink-soft">
          Every ring made here funds clean water for someone who has never had
          it. When yours ships, you receive the coordinates of the well it built
          — a second place on earth where your promise quietly keeps going.
        </p>
      </Reveal>

      {/* Impact counters */}
      <div className="relative mt-20 grid w-full max-w-3xl grid-cols-1 gap-12 sm:grid-cols-3">
        {STATS.map((s, i) => (
          <Reveal key={s.label} mode="rise" delay={0.2 + i * 0.12}>
            <div className="flex flex-col items-center">
              <CountUp
                to={s.to}
                group
                duration={2.2}
                suffix={s.suffix}
                className="font-display text-5xl text-ink sm:text-6xl"
              />
              <span className="mt-3 max-w-[16ch] text-[0.8rem] uppercase tracking-[0.16em] text-gold/80">
                {s.label}
              </span>
            </div>
          </Reveal>
        ))}
      </div>

      <Reveal mode="rise" delay={0.4} className="relative mt-20">
        <p className="font-display text-2xl text-ink/90 sm:text-3xl">
          One ring. <span className="text-gold">Two forevers.</span>
        </p>
      </Reveal>
    </section>
  );
}
