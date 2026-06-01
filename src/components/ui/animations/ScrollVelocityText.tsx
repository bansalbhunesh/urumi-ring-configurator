"use client";

import { useRef } from "react";
import {
  motion,
  useScroll,
  useVelocity,
  useTransform,
  useAnimationFrame,
  useMotionValue,
  wrap,
} from "framer-motion";

/* ============================================================
   ScrollVelocityText — horizontal marquee that accelerates
   with scroll velocity. Classic Lusion/Linear/Basement effect.

   The faster you scroll, the faster the text moves.
   Uses Framer Motion's useVelocity to read scroll speed.
   ============================================================ */

const DEFAULT_TEXT =
  "18k Recycled Gold · Conflict Free Diamonds · Lifetime Warranty · ";

export function ScrollVelocityText({
  text = DEFAULT_TEXT,
  baseVelocity = 2,
  className,
  repeat = 4,
}: {
  text?: string;
  baseVelocity?: number;
  className?: string;
  repeat?: number;
}) {
  const baseX = useMotionValue(0);
  const { scrollY } = useScroll();
  const scrollVelocity = useVelocity(scrollY);

  const velocityFactor = useTransform(scrollVelocity, [0, 1000], [0, 5], {
    clamp: false,
  });

  const x = useTransform(baseX, (v) => `${wrap(-100 / repeat, 0, v)}%`);

  const directionFactor = useRef<number>(1);

  useAnimationFrame((_, delta) => {
    let moveBy = directionFactor.current * baseVelocity * (delta / 1000);
    if (velocityFactor.get() < 0) {
      directionFactor.current = -1;
    } else if (velocityFactor.get() > 0) {
      directionFactor.current = 1;
    }
    moveBy += directionFactor.current * moveBy * velocityFactor.get();
    baseX.set(baseX.get() + moveBy);
  });

  const repeated = Array.from({ length: repeat }, () => text).join("");

  return (
    <div
      className={`relative overflow-hidden whitespace-nowrap ${className ?? ""}`}
      aria-hidden
    >
      <motion.div
        className="flex whitespace-nowrap"
        style={{ x }}
      >
        <span className="block whitespace-nowrap">{repeated}</span>
      </motion.div>
    </div>
  );
}
