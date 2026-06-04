"use client";

import { motion, useReducedMotion, useScroll, useTransform } from "framer-motion";
import { useRef } from "react";

const PHOTO_FRAMES = [
  {
    id: "worn-01",
    eyebrow: "Worn",
    title: "Scale on the hand",
    src: "/img/doamore/twist-lifestyle.jpg",
    alt: "The Twist engagement ring worn on a hand",
  },
  {
    id: "studio-01",
    eyebrow: "Studio",
    title: "The exact setting",
    src: "/img/doamore/twist-round-white-gold-angle.jpg",
    alt: "The Twist engagement ring studio product angle",
  },
  {
    id: "worn-02",
    eyebrow: "Second angle",
    title: "Light across the stone",
    src: "/img/doamore/twist-lifestyle-angle.jpg",
    alt: "The Twist engagement ring on a hand from another angle",
  },
] as const;

export function PhotoHandoff() {
  const ref = useRef<HTMLElement>(null);
  const reduceMotion = useReducedMotion() ?? false;
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start start", "end end"],
  });

  const captureOpacity = useTransform(scrollYProgress, [0, 0.18, 0.32], [0, 1, 0]);
  const captureScale = useTransform(scrollYProgress, [0, 0.32], reduceMotion ? [1, 1] : [0.92, 1.03]);
  const titleOpacity = useTransform(scrollYProgress, [0.02, 0.28, 0.78], [1, 1, 0.22]);
  const titleY = useTransform(scrollYProgress, [0, 0.7], reduceMotion ? [0, 0] : [0, -38]);
  const gridOpacity = useTransform(scrollYProgress, [0.18, 0.34], [0, 1]);
  const gridY = useTransform(scrollYProgress, [0.22, 0.72], reduceMotion ? ["0vh", "0vh"] : ["8vh", "-5vh"]);
  const leadScale = useTransform(scrollYProgress, [0.22, 0.72], reduceMotion ? [1, 1] : [0.96, 1.04]);

  return (
    <section
      ref={ref}
      id="photo-handoff"
      data-ring="photo"
      data-chapter="photo"
      className="photo-handoff relative min-h-[220svh] overflow-clip bg-bench-deep text-bench-ink"
    >
      <div className="sticky top-0 h-[100svh] overflow-hidden">
        <div className="absolute inset-0 photo-handoff__field" aria-hidden />
        <div className="pointer-events-none absolute inset-0 photo-handoff__aperture" aria-hidden />

        <motion.div
          className="pointer-events-none absolute left-6 top-24 z-30 max-w-[34rem] sm:left-10 lg:left-16 lg:top-28"
          style={{ opacity: titleOpacity, y: titleY }}
        >
          <span className="bench-label">Chapter 04 / Object to hand</span>
          <h2 className="mt-5 max-w-[8ch] font-display text-[clamp(3.1rem,7.4vw,7rem)] font-semibold leading-[0.88]">
            From object to proof.
          </h2>
          <p className="mt-5 max-w-sm text-[0.95rem] leading-relaxed text-bench-muted">
            The render is only useful if it survives contact with skin, scale,
            and daylight.
          </p>
        </motion.div>

        <motion.div
          className="photo-handoff__capture pointer-events-none absolute left-1/2 top-1/2 z-20 aspect-[4/5] w-[min(52vw,31rem)] -translate-x-1/2 -translate-y-1/2 overflow-hidden"
          style={{ opacity: captureOpacity, scale: captureScale }}
          aria-hidden
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/img/doamore/twist-round-white-gold-angle.jpg"
            alt=""
            className="h-full w-full object-contain"
          />
          <span className="photo-handoff__scan" />
          <span className="absolute bottom-4 left-4 font-mono text-[0.58rem] uppercase tracking-[0.22em] text-bench-muted">
            Render capture / matched plate
          </span>
        </motion.div>

        <motion.div
          className="photo-proof-grid absolute inset-x-6 top-[18svh] z-40 grid grid-cols-12 gap-5 sm:inset-x-10 lg:inset-x-16"
          style={{ opacity: gridOpacity, y: gridY }}
        >
          {PHOTO_FRAMES.map((frame, index) => (
            <motion.article
              key={frame.id}
              className={`photo-proof-card ${
                index === 0
                  ? "col-span-7 col-start-5 row-start-1 max-lg:col-span-8 max-lg:col-start-4"
                  : index === 1
                    ? "col-span-4 col-start-2 row-start-1 mt-[34svh] max-lg:col-span-5 max-lg:col-start-1"
                    : "col-span-4 col-start-9 row-start-1 mt-[42svh] max-lg:col-span-5 max-lg:col-start-8"
              } max-sm:col-span-12 max-sm:col-start-1 max-sm:mt-0`}
              style={index === 0 ? { scale: leadScale } : undefined}
            >
              <div className="relative overflow-hidden">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={frame.src}
                  alt={frame.alt}
                  className={`h-[min(58svh,38rem)] w-full max-sm:h-[46svh] ${
                    frame.id.startsWith("studio") ? "object-contain" : "object-cover"
                  }`}
                  loading={index === 0 ? "eager" : "lazy"}
                />
                <div className="pointer-events-none absolute inset-0 photo-handoff__frame-vignette" />
              </div>
              <div className="mt-4 flex items-baseline justify-between gap-5 border-t border-bench-line/45 pt-3">
                <span className="font-mono text-[0.62rem] uppercase tracking-[0.2em] text-bench-gold">
                  {frame.eyebrow}
                </span>
                <h3 className="text-right font-display text-2xl leading-none">{frame.title}</h3>
              </div>
            </motion.article>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
