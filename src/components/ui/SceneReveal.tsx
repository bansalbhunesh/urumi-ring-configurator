"use client";

import { useRef, type ReactNode } from "react";
import { motion, useScroll, useTransform, useSpring } from "framer-motion";

/* ----------------------------------------------------------------------------
   SceneReveal — scroll-linked "entering a new scene" motion (motion.dev style).

   Instead of a one-shot fade, content is tied to the section's scroll progress
   and spring-smoothed: it rises out of depth and settles as you scroll into it,
   then drifts and dims as you leave — so each section reads as crossing into a
   new scene rather than a static block. `depth` scales the parallax so stacked
   layers (headline vs. body vs. media) move at different rates.
---------------------------------------------------------------------------- */
export function SceneReveal({
  children,
  className,
  depth = 1,
  as = "div",
}: {
  children: ReactNode;
  className?: string;
  depth?: number;
  as?: "div" | "section";
}) {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"],
  });
  const s = useSpring(scrollYProgress, { stiffness: 70, damping: 22, mass: 0.45 });

  const y = useTransform(s, [0, 0.42, 1], [70 * depth, 0, -54 * depth]);
  const opacity = useTransform(s, [0, 0.16, 0.82, 1], [0, 1, 1, 0.35]);
  const scale = useTransform(s, [0, 0.3], [0.93, 1]);

  const Comp = as === "section" ? motion.section : motion.div;
  return (
    <Comp ref={ref} className={className} style={{ y, opacity, scale }} initial={false}>
      {children}
    </Comp>
  );
}
