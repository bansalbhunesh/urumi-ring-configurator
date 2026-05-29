"use client";

import { useRef } from "react";
import {
  motion,
  useScroll,
  useSpring,
  useTransform,
  useMotionValue,
  useVelocity,
  useAnimationFrame,
} from "framer-motion";
const wrap = (min: number, max: number, v: number) => {
  const rangeSize = max - min;
  return ((((v - min) % rangeSize) + rangeSize) % rangeSize) + min;
};

const WORDS = [
  "Ethically sourced",
  "Conflict-free diamonds",
  "Recycled 18k gold",
  "Hand-finished",
  "Made to order",
  "Lifetime warranty",
];

/* ---------------------------------------------------------------------------
   Velocity Marquee
   Instead of a static CSS loop, this marquee ties its translation and skew
   to the user's scroll velocity. Scrolling fast stretches the text and
   accelerates the loop.
--------------------------------------------------------------------------- */

function ParallaxText({ children, baseVelocity = 100 }: { children: React.ReactNode; baseVelocity: number }) {
  const baseX = useMotionValue(0);
  const { scrollY } = useScroll();
  const scrollVelocity = useVelocity(scrollY);
  const smoothVelocity = useSpring(scrollVelocity, {
    damping: 50,
    stiffness: 400,
  });
  const velocityFactor = useTransform(smoothVelocity, [0, 1000], [0, 5], {
    clamp: false,
  });

  // Skew effect based on velocity
  const skewX = useTransform(smoothVelocity, [-1000, 1000], [-3, 3]);

  const x = useTransform(baseX, (v) => `${wrap(-20, -45, v)}%`);

  const directionFactor = useRef<number>(1);
  useAnimationFrame((t, delta) => {
    let moveBy = directionFactor.current * baseVelocity * (delta / 1000);

    if (velocityFactor.get() < 0) {
      directionFactor.current = -1;
    } else if (velocityFactor.get() > 0) {
      directionFactor.current = 1;
    }

    moveBy += directionFactor.current * moveBy * velocityFactor.get();
    baseX.set(baseX.get() + moveBy);
  });

  return (
    <div className="overflow-hidden whitespace-nowrap flex flex-nowrap">
      <motion.div className="flex flex-nowrap shrink-0 w-max items-center" style={{ x, skewX }}>
        {children}
        {children}
        {children}
        {children}
      </motion.div>
    </div>
  );
}

export function Marquee() {
  return (
    <div className="overflow-hidden border-y border-line bg-champagne/40 py-4">
      <ParallaxText baseVelocity={-2}>
        {WORDS.map((w, i) => (
          <span
            key={i}
            className="flex shrink-0 items-center gap-12 pr-12 text-[0.7rem] uppercase tracking-[0.32em] text-ink-soft"
          >
            {w}
            <span className="text-gold">◆</span>
          </span>
        ))}
      </ParallaxText>
    </div>
  );
}
