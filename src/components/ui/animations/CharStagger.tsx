"use client";

import { motion, useReducedMotion } from "framer-motion";

/* ============================================================
   CharStagger — character-by-character stagger reveal.

   Each character arrives with spring physics — rotateX from
   3D space, blurring in. Used for hero headlines only (expensive
   per-char DOM nodes). Iconic effect from Linear, Vercel.
   ============================================================ */

const EASE = [0.22, 1, 0.36, 1] as const;

const charVariants = {
  hidden: {
    opacity: 0,
    y: 20,
    rotateX: 30,
    filter: "blur(8px)",
  },
  show: (i: number) => ({
    opacity: 1,
    y: 0,
    rotateX: 0,
    filter: "blur(0px)",
    transition: {
      duration: 0.65,
      ease: EASE,
      delay: i * 0.035,
    },
  }),
};

export function CharStagger({
  text,
  className,
  delay = 0,
  as: Tag = "h1",
  staggerDelay = 0.035,
}: {
  text: string;
  className?: string;
  delay?: number;
  as?: "h1" | "h2" | "h3" | "p" | "span";
  staggerDelay?: number;
}) {
  const reduce = useReducedMotion() ?? false;

  const chars = text.split("");

  if (reduce) {
    const El = Tag;
    return <El className={className}>{text}</El>;
  }

  const MotionEl = motion[Tag] as typeof motion.h1;

  return (
    <MotionEl
      className={`inline-flex flex-wrap ${className ?? ""}`}
      initial="hidden"
      animate="show"
      aria-label={text}
      style={{ perspective: "600px" }}
    >
      {chars.map((char, i) => (
        <motion.span
          key={i}
          aria-hidden
          className="inline-block"
          style={{
            whiteSpace: char === " " ? "pre" : undefined,
            transformOrigin: "50% 100%",
            display: "inline-block",
          }}
          variants={charVariants}
          custom={delay / staggerDelay + i}
        >
          {char === " " ? " " : char}
        </motion.span>
      ))}
    </MotionEl>
  );
}
