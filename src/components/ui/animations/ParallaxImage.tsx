"use client";

import { useRef } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import type { ReactNode } from "react";

/* ============================================================
   ParallaxImage — wraps content so it moves at a different
   speed to the page scroll, creating depth sensation.

   speed: 0 = no parallax (fixed), 1 = full scroll speed
   Default 0.3 = 30% of scroll rate = floats gently.
   ============================================================ */

export function ParallaxImage({
  children,
  className,
  speed = 0.3,
  direction = "up",
}: {
  children: ReactNode;
  className?: string;
  speed?: number;
  direction?: "up" | "down";
}) {
  const ref = useRef<HTMLDivElement>(null);

  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"],
  });

  const yRange = 120 * speed;
  const yValue = useTransform(
    scrollYProgress,
    [0, 1],
    direction === "up" ? [yRange, -yRange] : [-yRange, yRange],
  );

  return (
    <div ref={ref} className={`overflow-hidden ${className ?? ""}`}>
      <motion.div
        style={{ y: yValue }}
        className="h-full w-full"
      >
        {children}
      </motion.div>
    </div>
  );
}
