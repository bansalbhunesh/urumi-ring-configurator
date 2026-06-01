"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";

const EASE = [0.22, 1, 0.36, 1] as const;

export function Loader() {
  const [count, setCount] = useState(0);
  const [done, setDone] = useState(false);

  useEffect(() => {
    let raf: number;
    const start = performance.now();
    const duration = 1100;

    const tick = (now: number) => {
      const t = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - t, 3);
      setCount(Math.round(eased * 100));
      if (t < 1) {
        raf = requestAnimationFrame(tick);
      } else {
        setTimeout(() => setDone(true), 200);
      }
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, []);

  return (
    <AnimatePresence>
      {!done && (
        <motion.div
          key="loader"
          initial={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.65, ease: EASE }}
          className="fixed inset-0 z-[200] flex flex-col items-center justify-center bg-ivory"
          aria-hidden="true"
        >
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: EASE }}
            className="flex flex-col items-center gap-6"
          >
            <div className="flex items-center gap-2">
              <span className="text-gold text-sm">◆</span>
              <span className="text-[0.72rem] uppercase tracking-[0.5em] text-muted">
                Aurelle
              </span>
            </div>

            <div className="font-display text-[5rem] leading-none tabular-nums text-line">
              {String(count).padStart(2, "0")}
            </div>

            <div className="h-px w-20 overflow-hidden bg-line">
              <motion.div
                className="h-full bg-gold/60"
                style={{ width: `${count}%` }}
              />
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
