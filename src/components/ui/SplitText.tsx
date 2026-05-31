"use client";

import { motion } from "framer-motion";
import { useRef } from "react";

/* ============================================================
   SplitText — word-level typography animation.

   mode "slide"  (default) — luxury editorial: words slide up from
                  behind a mask with slight rotation (Vogue / SSENSE)
   mode "push"   — cinematic depth: words push forward from deep 3D
                  space, blurring in (Apple / Lusion / immersive)
   mode "scatter" — dynamic spring: each word arrives from a random
                  direction with spring physics (Framer / Bento)
   ============================================================ */

const EASE = [0.22, 1, 0.36, 1] as const;
const EX   = [0.16, 1, 0.3, 1] as const;

type Mode = "slide" | "push" | "scatter";

function wordVariants(mode: Mode, i: number) {
  switch (mode) {
    case "slide":
      return {
        hidden:  { y: "110%", rotateZ: 3 },
        visible: {
          y: "0%",
          rotateZ: 0,
          transition: { duration: 0.9, ease: EASE },
        },
      };
    case "push":
      return {
        hidden:  {
          opacity: 0,
          scale: 1.55,
          filter: "blur(12px)",
          y: 8,
        },
        visible: {
          opacity: 1,
          scale: 1,
          filter: "blur(0px)",
          y: 0,
          transition: { duration: 1.05, ease: EX },
        },
      };
    case "scatter": {
      const seed = Math.sin(i * 7.3 + 1.5) * 43758.5;
      const rx = (seed - Math.floor(seed) - 0.5) * 80;
      const ry = Math.abs(Math.sin(i * 3.7) * 60) + 20;
      return {
        hidden:  { opacity: 0, x: rx, y: ry, rotate: rx * 0.08 },
        visible: {
          opacity: 1,
          x: 0,
          y: 0,
          rotate: 0,
          transition: { type: "spring" as const, stiffness: 200, damping: 22 },
        },
      };
    }
  }
}

export function SplitText({
  children,
  className = "",
  delay = 0,
  as = "div",
  mode = "slide",
  stagger = 0.04,
}: {
  children: string;
  className?: string;
  delay?: number;
  as?: "div" | "h2" | "h3" | "p";
  mode?: Mode;
  stagger?: number;
}) {
  const container = useRef(null);
  const words = children.split(" ");

  const MotionTag =
    as === "h2" ? motion.h2
    : as === "h3" ? motion.h3
    : as === "p"  ? motion.p
    : motion.div;

  /* push/scatter modes don't use the overflow-hidden mask wrapper */
  const useMask = mode === "slide";

  return (
    <MotionTag
      ref={container}
      className={`flex flex-wrap ${className}`}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: "-80px" }}
      variants={{
        visible: {
          transition: { staggerChildren: stagger, delayChildren: delay },
        },
      }}
    >
      {words.map((word, i) =>
        useMask ? (
          <span key={i} className="relative overflow-hidden inline-flex mr-[0.25em]">
            <motion.span
              variants={wordVariants(mode, i)}
              className="inline-block"
            >
              {word}
            </motion.span>
          </span>
        ) : (
          <motion.span
            key={i}
            className="inline-block mr-[0.25em]"
            variants={wordVariants(mode, i)}
          >
            {word}
          </motion.span>
        )
      )}
    </MotionTag>
  );
}
