"use client";

import { motion, useReducedMotion } from "framer-motion";
import type { ReactNode, CSSProperties } from "react";

/* ============================================================
   BlurReveal — cinematic focus-pull reveal.

   Elements come in through a blur-to-sharp transition,
   simulating a camera pulling focus. Combined with opacity
   and y-lift for a luxurious entrance.
   ============================================================ */

interface BlurRevealProps {
  children: ReactNode;
  className?: string;
  delay?: number;
  duration?: number;
  as?: "div" | "span" | "p" | "h1" | "h2" | "h3";
  style?: CSSProperties;
  once?: boolean;
}

const EASE = [0.22, 1, 0.36, 1] as const;

export function BlurReveal({
  children,
  className,
  delay = 0,
  duration = 1.1,
  as: Tag = "div",
  style,
  once = true,
}: BlurRevealProps) {
  const reduce = useReducedMotion() ?? false;

  if (reduce) {
    const El = Tag;
    return <El className={className} style={style}>{children}</El>;
  }

  const MotionEl = motion[Tag] as typeof motion.div;

  return (
    <MotionEl
      className={className}
      style={style}
      initial={{ opacity: 0, filter: "blur(20px)", y: 20 }}
      whileInView={{ opacity: 1, filter: "blur(0px)", y: 0 }}
      viewport={{ once, margin: "-60px" }}
      transition={{
        duration,
        ease: EASE,
        delay,
        filter: { duration: duration * 0.9 },
      }}
    >
      {children}
    </MotionEl>
  );
}

/* Word-level blur reveal — each word blurs into focus */
export function BlurRevealWords({
  text,
  className,
  delay = 0,
  as: Tag = "div",
}: {
  text: string;
  className?: string;
  delay?: number;
  as?: "div" | "p" | "h2" | "h3";
}) {
  const reduce = useReducedMotion() ?? false;
  const words = text.split(" ");

  if (reduce) {
    const El = Tag;
    return <El className={className}>{text}</El>;
  }

  const MotionEl = motion[Tag] as typeof motion.div;

  return (
    <MotionEl
      className={`flex flex-wrap gap-[0.25em] ${className ?? ""}`}
      initial="hidden"
      whileInView="show"
      viewport={{ once: true, margin: "-60px" }}
      variants={{
        show: { transition: { staggerChildren: 0.06, delayChildren: delay } },
      }}
    >
      {words.map((word, i) => (
        <motion.span
          key={i}
          className="inline-block"
          variants={{
            hidden: { opacity: 0, filter: "blur(12px)", y: 14 },
            show: {
              opacity: 1,
              filter: "blur(0px)",
              y: 0,
              transition: { duration: 0.85, ease: EASE },
            },
          }}
        >
          {word}
        </motion.span>
      ))}
    </MotionEl>
  );
}
