"use client";
import { motion, useReducedMotion } from "framer-motion";
import type { ReactNode } from "react";

type RevealMode = "rise" | "clip";
const EX = [0.16, 1, 0.3, 1] as const;
const CI = [0.22, 1, 0.36, 1] as const;

function cfg(mode: RevealMode, dir: "left" | "right") {
  if (mode === "clip") return {
    hidden: { clipPath: dir === "left" ? "inset(0 100% 0 0)" : "inset(0 0 0 100%)" },
    show: { clipPath: "inset(0 0% 0 0%)" },
    tr: { duration: 1.1, ease: EX },
  };
  return {
    hidden: { opacity: 0, y: 36 },
    show: { opacity: 1, y: 0 },
    tr: { duration: 0.88, ease: CI },
  };
}

export function Reveal({ children, mode = "rise", delay = 0, dir = "left", className, once = true, margin = "-60px" }: {
  children: ReactNode; mode?: RevealMode; delay?: number; dir?: "left" | "right"; className?: string; once?: boolean; margin?: string;
}) {
  const reduce = useReducedMotion() ?? false;
  if (reduce) return <div className={className}>{children}</div>;
  const c = cfg(mode, dir);
  return (
    <motion.div className={className} initial="hidden" whileInView="show"
      viewport={{ once, margin }} variants={{ hidden: c.hidden, show: c.show }}
      transition={{ ...c.tr, delay }}>
      {children}
    </motion.div>
  );
}

export function RevealStagger({ children, stagger = 0.1, delay = 0, className, margin = "-60px" }: {
  children: ReactNode; stagger?: number; delay?: number; className?: string; margin?: string;
}) {
  return (
    <motion.div className={className} initial="hidden" whileInView="show"
      viewport={{ once: true, margin }}
      variants={{ hidden: {}, show: { transition: { staggerChildren: stagger, delayChildren: delay } } }}>
      {children}
    </motion.div>
  );
}

export function RevealItem({ children, mode = "rise", dir = "left", className }: {
  children: ReactNode; mode?: RevealMode; dir?: "left" | "right"; className?: string;
}) {
  const reduce = useReducedMotion() ?? false;
  if (reduce) return <div className={className}>{children}</div>;
  const c = cfg(mode, dir);
  return (
    <motion.div className={className}
      variants={{ hidden: c.hidden, show: { ...c.show, transition: c.tr } }}>
      {children}
    </motion.div>
  );
}
