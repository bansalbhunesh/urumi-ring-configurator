"use client";

import { useEffect, useRef, useState } from "react";
import { motion, useScroll, useTransform, useReducedMotion } from "framer-motion";

/* Crystal-glass parallax panels (moodboard: stacked frosted/faceted glass framing
   the product). A decorative beat behind the centre-stone editorial copy: a few
   translucent slabs that frost what's behind them (backdrop-blur), catch a faint
   iridescent edge, and drift at different rates on scroll for real depth. CSS +
   Framer only — no transmission render pass — so it stays cheap. Kept to the left
   so it never crosses the ring in the right column; md+ only; static if reduced. */
const PANELS = [
  { cls: "left-[1%] top-[6%] h-[80%] w-[44%] rotate-[5deg] rounded-[2.5rem]", blur: "backdrop-blur-md", range: [44, -44] },
  { cls: "left-[26%] top-[18%] h-[66%] w-[30%] -rotate-[4deg] rounded-[2rem]", blur: "backdrop-blur-lg", range: [86, -86] },
  { cls: "left-[40%] top-[2%] h-[42%] w-[12%] rotate-[9deg] rounded-[1.5rem]", blur: "backdrop-blur-sm", range: [18, -64] },
];

export function CrystalPanels() {
  const ref = useRef<HTMLDivElement>(null);
  const reduce = useReducedMotion();
  // Apply the reduced-motion branch only after mount, so the first client render
  // matches the server (avoids a transform hydration mismatch under reduced motion).
  const [mounted, setMounted] = useState(false);
  // React's recommended pattern for server/client render differences; the one-time
  // mount flag is not a cascading-render concern.
  // eslint-disable-next-line react-hooks/set-state-in-effect
  useEffect(() => setMounted(true), []);
  const still = mounted && reduce;
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"],
  });
  // One transform per panel (hooks must be unconditional / fixed count).
  const y0 = useTransform(scrollYProgress, [0, 1], PANELS[0].range);
  const y1 = useTransform(scrollYProgress, [0, 1], PANELS[1].range);
  const y2 = useTransform(scrollYProgress, [0, 1], PANELS[2].range);
  const ys = [y0, y1, y2];

  return (
    <div
      ref={ref}
      aria-hidden
      className="pointer-events-none absolute inset-0 z-0 hidden overflow-hidden md:block"
    >
      {PANELS.map((p, i) => (
        <motion.div
          key={i}
          style={{ y: still ? 0 : ys[i] }}
          className={`absolute ${p.cls} ${p.blur} border border-white/20 bg-gradient-to-br from-white/[0.11] via-white/[0.03] to-transparent`}
        >
          {/* faceted edge highlights + iridescent sheen sweeping across the slab */}
          <div
            className="absolute inset-0 rounded-[inherit] mix-blend-screen"
            style={{
              background:
                "linear-gradient(125deg, rgba(140,112,224,0.16) 0%, rgba(96,176,224,0.12) 38%, rgba(227,197,133,0.20) 100%)",
              boxShadow:
                "inset 0 1.5px 0 rgba(255,255,255,0.38), inset 1.5px 0 0 rgba(255,255,255,0.16), inset 0 -1px 0 rgba(227,197,133,0.18), inset 0 0 70px rgba(227,197,133,0.06)",
            }}
          />
        </motion.div>
      ))}
    </div>
  );
}
