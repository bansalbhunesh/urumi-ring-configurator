"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, animate, motion, useMotionValue, useTransform } from "framer-motion";

const EASE = [0.22, 1, 0.36, 1] as const;

/* The atelier intro — a branded loading curtain (Oryzo-style). A counter-rotating
   ring mark counts the atelier up to 100, then the dark panel lifts to reveal the
   hero. Honours reduced-motion by skipping straight through. framer-motion only. */
export function Loader() {
  const [done, setDone] = useState(false);
  const [n, setN] = useState(0);
  const count = useMotionValue(0);
  const width = useTransform(count, (v) => `${v}%`);

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setDone(true);
      return;
    }
    const controls = animate(count, 100, {
      duration: 1.7,
      ease: EASE,
      onUpdate: (v) => setN(Math.round(v)),
      onComplete: () => setTimeout(() => setDone(true), 280),
    });
    return () => controls.stop();
  }, [count]);

  return (
    <AnimatePresence>
      {!done && (
        <motion.div
          key="intro"
          className="intro"
          aria-hidden="true"
          initial={{ y: 0 }}
          exit={{ y: "-101%" }}
          transition={{ duration: 0.92, ease: EASE }}
        >
          <div className="intro__glow" />
          <span className="intro__corner intro__corner--tl">Aurelle · Atelier</span>
          <span className="intro__corner intro__corner--tr">Made to order</span>
          <span className="intro__corner intro__corner--bl">Est. — light, considered</span>
          <span className="intro__corner intro__corner--br">Loading the stage</span>

          <motion.div
            className="intro__core"
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, scale: 1.06 }}
            transition={{ duration: 0.6, ease: EASE }}
          >
            <p className="kicker" style={{ justifyContent: "center" }}>The Atelier</p>

            <div className="intro__ring">
              <svg viewBox="0 0 100 100">
                <circle className="intro__track" cx="50" cy="50" r="46" />
                <circle className="intro__track" cx="50" cy="50" r="35" />
                <motion.circle
                  className="intro__arc"
                  cx="50"
                  cy="50"
                  r="46"
                  style={{ transformBox: "fill-box", transformOrigin: "center" }}
                  animate={{ rotate: 360 }}
                  transition={{ repeat: Infinity, duration: 2.2, ease: "linear" }}
                />
                <motion.circle
                  className="intro__arc2"
                  cx="50"
                  cy="50"
                  r="35"
                  style={{ transformBox: "fill-box", transformOrigin: "center" }}
                  animate={{ rotate: -360 }}
                  transition={{ repeat: Infinity, duration: 3.6, ease: "linear" }}
                />
                <circle className="intro__dot" cx="50" cy="50" r="1.6" />
              </svg>
              <span className="intro__count">{String(n).padStart(3, "0")}</span>
            </div>

            <h1 className="intro__word">AURELLE</h1>

            <div className="intro__bar">
              <motion.div style={{ width }} />
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
