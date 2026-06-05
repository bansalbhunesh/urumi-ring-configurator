"use client";

import { useRef } from "react";
import {
  motion,
  useScroll,
  useTransform,
  type MotionValue,
} from "framer-motion";

/* ----------------------------------------------------------------------------
   The Anatomy — a cascading "universe" showcase.

   A sticky scrollytelling section: each scroll doesn't slide the next photo down,
   it *warps you into another universe* — the outgoing hologram rushes toward you
   and dissolves (scale-up + blur + fade) while the next emerges from depth
   (scale-from-0.8 + un-blur), with a holographic flash at the threshold. The
   ring's holographic renders (and two living Higgsfield loops) are the universes.
   data-ring="hidden" so the live 3D ring yields the canvas to the full-bleed beat.
---------------------------------------------------------------------------- */

type Slide = {
  src: string;
  kind: "img" | "video";
  poster?: string;
  kicker: string;
  title: [string, string];
  note: string;
};

const SLIDES: Slide[] = [
  {
    src: "/holo/wireframe.png",
    kind: "img",
    kicker: "Anatomy · 01",
    title: ["Measured to", "the micron."],
    note: "42,856 vertices · 85,642 edges · platinum 950",
  },
  {
    src: "/holo/exploded.png",
    kind: "img",
    kicker: "Anatomy · 02",
    title: ["Every part,", "in its place."],
    note: "diamond · precision setting · twin twisted shanks",
  },
  {
    src: "/video/holo-wireframe.mp4",
    kind: "video",
    poster: "/holo/profile.png",
    kicker: "Anatomy · 03",
    title: ["A structure", "you can feel."],
    note: "comfort-fit · recycled 18k & platinum",
  },
  {
    src: "/video/holo-bloom.mp4",
    kind: "video",
    poster: "/holo/blueprint.png",
    kicker: "Anatomy · 04",
    title: ["Light,", "by design."],
    note: "1.20ct round brilliant · four-prong basket",
  },
];

function HoloSlide({
  slide,
  i,
  n,
  progress,
}: {
  slide: Slide;
  i: number;
  n: number;
  progress: MotionValue<number>;
}) {
  const f = 0.085;
  const b0 = i / n;
  const b1 = (i + 1) / n;
  const isFirst = i === 0;
  const isLast = i === n - 1;
  // The first universe holds from the top of the section and the last holds to
  // the bottom — only the middles cross-fade on both edges. (Without this the
  // final universe fades to an empty frame at the end of the scroll.) Breakpoints
  // stay within [0,1] — framer feeds them to the WAAPI as keyframe offsets.
  const oIn = isFirst
    ? [0, b1 - f, b1 + f]
    : isLast
      ? [b0 - f, b0 + f, 1]
      : [b0 - f, b0 + f, b1 - f, b1 + f];
  const oOut = isFirst ? [1, 1, 0] : isLast ? [0, 1, 1] : [0, 1, 1, 0];
  // Strong depth-warp: a new universe rushes up from far away (0.62 → 1) while
  // the previous one flies past the camera (1 → 1.5) — crossing a scene, not
  // sliding a card.
  const sOut = isFirst ? [1, 1, 1.5] : isLast ? [0.62, 1, 1] : [0.62, 1, 1, 1.5];

  const opacity = useTransform(progress, oIn, oOut);
  const scale = useTransform(progress, oIn, sOut);
  const yMedia = useTransform(progress, [b0, b1], ["6%", "-6%"]);

  return (
    <motion.div className="holo__slide" style={{ opacity, scale }} initial={false}>
      <motion.div className="holo__media" style={{ y: yMedia }} initial={false}>
        {slide.kind === "video" ? (
          <video src={slide.src} poster={slide.poster} autoPlay muted loop playsInline preload="metadata" aria-hidden="true" />
        ) : (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={slide.src} alt="" loading="lazy" />
        )}
      </motion.div>
      <div className="holo__scrim" />
      <div className="holo__copy">
        <p className="kicker" style={{ justifyContent: "center" }}>{slide.kicker}</p>
        <h2 className="holo__title">
          {slide.title[0]}
          <br />
          {slide.title[1]}
        </h2>
        <p className="holo__note">{slide.note}</p>
      </div>
    </motion.div>
  );
}

export function HoloUniverse() {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end end"] });
  const n = SLIDES.length;

  // Holographic flash peaks at each universe threshold.
  const f = 0.085;
  const inputs: number[] = [0];
  const outputs: number[] = [0];
  for (let kk = 1; kk < n; kk++) {
    const b = kk / n;
    inputs.push(b - f, b, b + f);
    outputs.push(0, 0.92, 0);
  }
  inputs.push(1);
  outputs.push(0);
  const flash = useTransform(scrollYProgress, inputs, outputs);

  return (
    <section id="anatomy" data-ring="hidden" className="holo">
      <div ref={ref} className="holo__track" style={{ height: `${n * 100}vh` }}>
        <div className="holo__sticky">
          {SLIDES.map((s, i) => (
            <HoloSlide key={i} slide={s} i={i} n={n} progress={scrollYProgress} />
          ))}
          <motion.div className="holo__flash" style={{ opacity: flash }} initial={false} />
          <div className="holo__rail">
            <motion.div className="holo__rail-fill" style={{ scaleX: scrollYProgress }} initial={false} />
          </div>
        </div>
      </div>
    </section>
  );
}
