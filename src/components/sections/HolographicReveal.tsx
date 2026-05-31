"use client";

import { useRef, useState } from "react";
import Image from "next/image";
import {
  motion,
  useScroll,
  useTransform,
  useMotionTemplate,
  useMotionValueEvent,
  useReducedMotion,
  type MotionValue,
} from "framer-motion";

/* ----------------------------------------------------------------------------
   THE TWIST — HOLOGRAPHIC RENDER.

   A pinned, scroll-scrubbed reveal (oryzo.ai genre): the section is tall, an
   inner stage sticks to the viewport, and page scroll cross-fades through six
   holographic renders of the ring — iridescent glow, a HUD chrome, a live view
   index. The global r3f ring steps aside (data-ring="hidden") so the hologram
   owns the frame.

   The renders live in /public/holo and are served optimised by next/image.
   Swap any file there to restyle a stage; the sequence is data-driven below.
---------------------------------------------------------------------------- */

const ACCENT = "#86e3ff"; // holographic ice-cyan — the one neon note in this beat

type Stage = { src: string; label: string; sub: string };

// NB: the /public/holo filenames are arbitrary (named at extraction); the labels
// below reflect what each render actually shows, in a deliberate narrative order.
const STAGES: Stage[] = [
  { src: "/holo/oval.png", label: "Iridescent", sub: "Oval · spectral facets" },
  { src: "/holo/pear.png", label: "Spectral", sub: "Pear · prism band" },
  { src: "/holo/profile.png", label: "Wireframe", sub: "Profile · scan grid" },
  { src: "/holo/exploded.png", label: "Assembly", sub: "Exploded · components" },
  { src: "/holo/wireframe.png", label: "Blueprint", sub: "HUD · specification" },
  { src: "/holo/blueprint.png", label: "Brilliance", sub: "Hero · 1.00 ct" },
];

export function HolographicReveal() {
  const reduceMotion = useReducedMotion();
  const ref = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start start", "end end"],
  });

  const [active, setActive] = useState(0);
  useMotionValueEvent(scrollYProgress, "change", (v) => {
    const idx = Math.min(
      STAGES.length - 1,
      Math.max(0, Math.round(v * (STAGES.length - 1))),
    );
    setActive(idx);
  });

  // Reduced motion: no scroll-jacking. Show the renders as a calm static gallery.
  if (reduceMotion) {
    return (
      <section
        id="holographic"
        data-ring="hidden"
        className="relative px-6 py-24 sm:px-10 lg:px-16"
      >
        <div className="mx-auto max-w-6xl">
          <span className="eyebrow" style={{ color: ACCENT }}>
            The Twist · holographic render
          </span>
          <h2 className="display-3 mt-4 max-w-xl text-balance text-ink">
            Rendered in light.
          </h2>
          <div className="mt-12 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {STAGES.map((s) => (
              <figure
                key={s.src}
                className="relative aspect-square overflow-hidden rounded-xl border border-line/60 bg-black"
              >
                <Image
                  src={s.src}
                  alt={`The Twist engagement ring — ${s.label} holographic view`}
                  fill
                  sizes="(max-width: 640px) 90vw, (max-width: 1024px) 45vw, 30vw"
                  className="object-contain"
                />
                <figcaption className="absolute bottom-0 left-0 right-0 flex items-baseline justify-between px-4 py-3 text-[0.6rem] uppercase tracking-[0.22em] text-ink-soft">
                  <span style={{ color: ACCENT }}>{s.label}</span>
                  <span className="text-muted">{s.sub}</span>
                </figcaption>
              </figure>
            ))}
          </div>
        </div>
      </section>
    );
  }

  return (
    <section
      ref={ref}
      id="holographic"
      data-ring="hidden"
      className="relative h-[460vh]"
    >
      <div className="sticky top-0 flex h-screen items-center justify-center overflow-hidden">
        {/* Iridescent backdrop — a slow rotating conic wash, blurred to a glow */}
        <motion.div
          aria-hidden
          className="pointer-events-none absolute left-1/2 top-1/2 h-[120vmax] w-[120vmax] -translate-x-1/2 -translate-y-1/2 opacity-[0.18] blur-[120px] mix-blend-screen"
          style={{
            background:
              "conic-gradient(from 0deg, #4cc3ff, #b388ff, #57f5d4, #ff8ad8, #4cc3ff)",
          }}
          animate={{ rotate: 360 }}
          transition={{ duration: 48, repeat: Infinity, ease: "linear" }}
        />

        {/* Faint perspective grid floor for the tech-stage feel */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-x-0 bottom-0 h-1/2 opacity-[0.12]"
          style={{
            backgroundImage:
              "linear-gradient(to right, rgba(134,227,255,0.5) 1px, transparent 1px), linear-gradient(to bottom, rgba(134,227,255,0.5) 1px, transparent 1px)",
            backgroundSize: "44px 44px",
            maskImage:
              "radial-gradient(120% 90% at 50% 120%, #000 30%, transparent 72%)",
            WebkitMaskImage:
              "radial-gradient(120% 90% at 50% 120%, #000 30%, transparent 72%)",
            transform: "perspective(600px) rotateX(62deg)",
            transformOrigin: "center bottom",
          }}
        />

        {/* The render stack */}
        <div className="relative h-[min(72vh,660px)] w-[min(88vw,660px)]">
          {STAGES.map((s, i) => (
            <HoloStage
              key={s.src}
              stage={s}
              index={i}
              total={STAGES.length}
              progress={scrollYProgress}
              priority={i === 0}
            />
          ))}
        </div>

        {/* ---- HUD chrome ------------------------------------------------- */}
        <CornerTicks />

        {/* top-left identity */}
        <div className="pointer-events-none absolute left-6 top-6 sm:left-10 sm:top-10">
          <div
            className="text-[0.6rem] font-semibold uppercase tracking-[0.32em]"
            style={{ color: ACCENT }}
          >
            The Twist
          </div>
          <div className="mt-1 text-[0.6rem] uppercase tracking-[0.24em] text-muted">
            Holographic render
          </div>
        </div>

        {/* right-side view index, like the blueprint panels */}
        <div className="pointer-events-none absolute right-6 top-1/2 hidden -translate-y-1/2 flex-col items-end gap-2.5 sm:right-10 md:flex">
          {STAGES.map((s, i) => (
            <div
              key={s.src}
              className="flex items-center gap-3 transition-opacity duration-500"
              style={{ opacity: i === active ? 1 : 0.34 }}
            >
              <span className="text-[0.62rem] uppercase tracking-[0.2em] text-ink-soft">
                {s.label}
              </span>
              <span
                className="h-px transition-all duration-500"
                style={{
                  width: i === active ? 34 : 14,
                  backgroundColor: i === active ? ACCENT : "#38322a",
                }}
              />
              <span
                className="tabular-nums text-[0.6rem]"
                style={{ color: i === active ? ACCENT : "#6c6354" }}
              >
                {String(i + 1).padStart(2, "0")}
              </span>
            </div>
          ))}
        </div>

        {/* bottom caption + progress */}
        <div className="pointer-events-none absolute inset-x-0 bottom-7 flex flex-col items-center gap-3 px-6">
          <div className="flex items-baseline gap-3 text-center">
            <span
              className="font-display text-lg italic tracking-tight sm:text-xl"
              style={{ color: ACCENT }}
            >
              {STAGES[active].label}
            </span>
            <span className="text-[0.62rem] uppercase tracking-[0.24em] text-muted">
              {STAGES[active].sub}
            </span>
          </div>
          <div className="relative h-px w-[min(72vw,420px)] overflow-hidden bg-line">
            <motion.div
              className="absolute inset-y-0 left-0 origin-left"
              style={{ width: "100%", scaleX: scrollYProgress, backgroundColor: ACCENT }}
            />
          </div>
          <div className="text-[0.58rem] uppercase tracking-[0.3em] text-muted tabular-nums">
            Render {String(active + 1).padStart(2, "0")} / {String(STAGES.length).padStart(2, "0")}
          </div>
        </div>
      </div>
    </section>
  );
}

function HoloStage({
  stage,
  index,
  total,
  progress,
  priority,
}: {
  stage: Stage;
  index: number;
  total: number;
  progress: MotionValue<number>;
  priority: boolean;
}) {
  // Each render owns a band centred on its point along the scroll; it fades,
  // scales and blurs through its neighbours so the sequence reads as one
  // continuous morph rather than a slideshow.
  const span = 1 / (total - 1);
  const cur = index * span;
  const prev = cur - span;
  const next = cur + span;

  const input =
    index === 0 ? [cur, next] : index === total - 1 ? [prev, cur] : [prev, cur, next];
  const oOut = index === 0 ? [1, 0] : index === total - 1 ? [0, 1] : [0, 1, 0];
  const sOut = index === 0 ? [1, 0.92] : index === total - 1 ? [1.08, 1] : [1.08, 1, 0.92];
  const yOut = index === 0 ? [0, -50] : index === total - 1 ? [50, 0] : [50, 0, -50];
  const bOut = index === 0 ? [0, 10] : index === total - 1 ? [10, 0] : [10, 0, 10];

  const opacity = useTransform(progress, input, oOut);
  const scale = useTransform(progress, input, sOut);
  const y = useTransform(progress, input, yOut);
  const blurPx = useTransform(progress, input, bOut);
  const filter = useMotionTemplate`blur(${blurPx}px)`;

  return (
    <motion.div
      className="absolute inset-0 flex items-center justify-center"
      style={{ opacity, scale, y, filter, willChange: "opacity, transform, filter" }}
    >
      <div className="relative h-full w-full drop-shadow-[0_0_60px_rgba(110,200,255,0.25)]">
        <Image
          src={stage.src}
          alt={`The Twist engagement ring — ${stage.label} holographic view`}
          fill
          priority={priority}
          draggable={false}
          sizes="(max-width: 880px) 88vw, 660px"
          className="select-none object-contain"
        />
      </div>
    </motion.div>
  );
}

/* Four corner brackets — the cheap, effective HUD frame. */
function CornerTicks() {
  const base = "pointer-events-none absolute h-8 w-8 border-ink-soft/30";
  return (
    <>
      <span className={`${base} left-5 top-5 border-l border-t sm:left-8 sm:top-8`} />
      <span className={`${base} right-5 top-5 border-r border-t sm:right-8 sm:top-8`} />
      <span className={`${base} bottom-5 left-5 border-b border-l sm:bottom-8 sm:left-8`} />
      <span className={`${base} bottom-5 right-5 border-b border-r sm:bottom-8 sm:right-8`} />
    </>
  );
}
