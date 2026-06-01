"use client";

import { useScroll, useSpring, motion } from "framer-motion";

/* ============================================================
   ScrollProgressLine — a thin gold line at the very top of
   the viewport that grows as the user scrolls down the page.

   Fixed position, always visible, z-50.
   ============================================================ */

export function ScrollProgressLine() {
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, {
    stiffness: 100,
    damping: 30,
    restDelta: 0.001,
  });

  return (
    <motion.div
      className="pointer-events-none fixed left-0 top-0 z-50 h-[2px] w-full origin-left"
      style={{
        scaleX,
        background: "linear-gradient(90deg, #b8892a 0%, #e2c06e 50%, #b8892a 100%)",
      }}
    />
  );
}
