"use client";

import { useRef } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import { METAL_BY_ID, STONE_BY_ID } from "@/lib/config";
import { useConfigurator } from "@/store/configurator";

const INSPECTION_STEPS = [
  {
    id: "01",
    title: "The shank splits before it reaches the head.",
    detail:
      "One strand stays polished and continuous. The second strand crosses forward, so the twist reads in profile instead of becoming a flat line.",
    className: "left-[7%] top-[52%] lg:left-[10%] lg:top-[54%]",
  },
  {
    id: "02",
    title: "The pave shoulder has to remain physical.",
    detail:
      "Small stones are called out as separate settings, not as a glitter texture painted onto the band.",
    className: "right-[8%] top-[33%] lg:right-[12%] lg:top-[34%]",
  },
  {
    id: "03",
    title: "The basket lifts the stone without adding bulk.",
    detail:
      "The four-prong head keeps air under the pavilion, leaving the ring slim while the center diamond still feels elevated.",
    className: "left-[12%] top-[24%] lg:left-[20%] lg:top-[22%]",
  },
] as const;

const LEDGER = [
  ["Construction", "split twist shank"],
  ["Shoulder", "polished strand + pave strand"],
  ["Setting", "four-prong basket"],
  ["Model rule", "same object, live variation"],
] as const;

export function Craft() {
  const ref = useRef<HTMLElement>(null);
  const metal = useConfigurator((state) => state.metal);
  const stone = useConfigurator((state) => state.stone);
  const metalLabel = METAL_BY_ID[metal].label;
  const stoneLabel = STONE_BY_ID[stone].label;

  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start start", "end start"],
  });

  const chapterLabelOpacity = useTransform(scrollYProgress, [0, 0.06, 0.72], [0.72, 1, 0.42]);
  const titleX = useTransform(scrollYProgress, [0, 0.16, 0.62], [-18, 0, -14]);
  const titleOpacity = useTransform(scrollYProgress, [0, 0.1, 0.56, 0.74], [0.82, 1, 0.82, 0.24]);
  const scanX = useTransform(scrollYProgress, [0.04, 0.86], ["16%", "84%"]);
  const scanOpacity = useTransform(scrollYProgress, [0, 0.08, 0.84, 0.94], [0.35, 1, 1, 0]);
  const plateScale = useTransform(scrollYProgress, [0, 0.38, 0.86], [0.9, 1, 1.08]);
  const stepOne = useTransform(scrollYProgress, [0.02, 0.1, 0.38, 0.58], [0.45, 1, 1, 0.42]);
  const stepTwo = useTransform(scrollYProgress, [0.18, 0.32, 0.62], [0, 1, 0.55]);
  const stepThree = useTransform(scrollYProgress, [0.38, 0.54, 0.9], [0, 1, 0.58]);
  const ledgerOpacity = useTransform(scrollYProgress, [0.34, 0.48], [0, 1]);
  const ledgerY = useTransform(scrollYProgress, [0.34, 0.58], [18, 0]);

  const stepOpacities = [stepOne, stepTwo, stepThree];

  return (
    <section
      ref={ref}
      id="atelier"
      data-ring="anatomy"
      className="anatomy-chapter relative min-h-[280svh] overflow-clip text-bench-ink"
    >
      <div className="sticky top-0 h-[100svh] overflow-hidden">
        <div className="anatomy-field absolute inset-0" aria-hidden />

        <motion.div
          className="anatomy-plate pointer-events-none absolute left-1/2 top-[45%] h-[min(66vw,42rem)] w-[min(66vw,42rem)] -translate-x-1/2 -translate-y-1/2 max-sm:top-[32%] max-sm:h-[82vw] max-sm:w-[82vw]"
          style={{ scale: plateScale }}
          aria-hidden
        >
          <span className="anatomy-arc anatomy-arc-a" />
          <span className="anatomy-arc anatomy-arc-b" />
          <span className="anatomy-axis-x" />
          <span className="anatomy-axis-y" />
          {Array.from({ length: 24 }).map((_, index) => (
            <span key={index} className="anatomy-tick" style={{ rotate: `${index * 15}deg` }} />
          ))}
        </motion.div>

        <motion.div
          className="pointer-events-none absolute inset-y-0 z-20 w-px bg-bench-gold/70 shadow-[0_0_36px_rgba(222,177,101,0.28)]"
          style={{ left: scanX, opacity: scanOpacity }}
          aria-hidden
        >
          <span className="absolute -left-2 top-[18%] h-4 w-4 border border-bench-gold bg-bench-deep" />
          <span className="absolute -left-2 bottom-[18%] h-4 w-4 border border-bench-gold bg-bench-deep" />
        </motion.div>

        <motion.div
          className="pointer-events-none absolute left-6 top-24 z-20 max-w-[34rem] sm:left-10 lg:left-16 lg:top-28"
          style={{ x: titleX, opacity: titleOpacity }}
        >
          <motion.span className="bench-label" style={{ opacity: chapterLabelOpacity }}>
            Chapter 02 / Anatomy inspection
          </motion.span>
          <h2 className="mt-5 max-w-[9ch] font-display text-[clamp(3rem,8vw,7.4rem)] font-semibold leading-[0.9] text-bench-ink">
            Trace the twist.
          </h2>
          <p className="mt-5 max-w-sm text-[0.95rem] leading-relaxed text-bench-muted">
            The product stops being a pretty render and becomes a buildable object.
          </p>
        </motion.div>

        <div className="pointer-events-none absolute inset-0 z-30 hidden sm:block">
          {INSPECTION_STEPS.map((step, index) => (
            <motion.article
              key={step.id}
              className={`anatomy-callout absolute ${step.className}`}
              style={{ opacity: stepOpacities[index] }}
            >
              <span>{step.id}</span>
              <h3>{step.title}</h3>
              <p>{step.detail}</p>
            </motion.article>
          ))}
        </div>

        <motion.div
          className="anatomy-ledger absolute inset-x-5 bottom-6 z-30 mx-auto max-w-5xl p-4 sm:inset-x-10 sm:p-5 lg:bottom-10"
          style={{ opacity: ledgerOpacity, y: ledgerY }}
        >
          <div className="grid gap-4 sm:grid-cols-[0.9fr_1.1fr] sm:items-end">
            <div>
              <span className="bench-label">Live configuration</span>
              <p className="mt-3 font-display text-2xl leading-tight text-bench-ink sm:text-3xl">
                {metalLabel} / {stoneLabel}
              </p>
            </div>
            <dl className="grid gap-x-5 gap-y-3 sm:grid-cols-2">
              {LEDGER.map(([key, value]) => (
                <div key={key} className="grid grid-cols-[7.5rem_1fr] gap-3 border-t border-bench-line/55 pt-3">
                  <dt className="text-[0.62rem] uppercase tracking-[0.18em] text-bench-gold">{key}</dt>
                  <dd className="text-[0.78rem] leading-snug text-bench-muted">{value}</dd>
                </div>
              ))}
            </dl>
          </div>
        </motion.div>

        <div className="pointer-events-none absolute bottom-6 right-6 z-20 hidden text-right text-[0.62rem] uppercase tracking-[0.2em] text-bench-muted/70 lg:block">
          Side profile / pave shoulder / basket lift
        </div>
      </div>
    </section>
  );
}
