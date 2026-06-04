"use client";

import { useEffect, useRef } from "react";
import { setScrollY, setScrollVel } from "@/store/configurator";

/* Passive scroll tracker — writes to the module-level scrollY + velocity in
   the store so the R3F render loop can read them every frame without re-renders.
   Mount once at page level. */

export function ScrollTracker() {
  const ticking = useRef(false);
  const lastY = useRef(0);
  const lastTime = useRef(0);
  const velocity = useRef(0);

  useEffect(() => {
    let raf = 0;
    lastY.current = window.scrollY;
    lastTime.current = performance.now();
    setScrollY(window.scrollY);

    const tick = () => {
      velocity.current *= 0.88;
      if (Math.abs(velocity.current) < 0.002) velocity.current = 0;
      setScrollVel(velocity.current);
      setScrollY(window.scrollY);
      raf = requestAnimationFrame(tick);
    };

    const onScroll = () => {
      if (ticking.current) return;
      ticking.current = true;
      requestAnimationFrame(() => {
        const now = performance.now();
        const dt = now - lastTime.current;
        const dy = window.scrollY - lastY.current;
        if (dt > 0) velocity.current = dy / dt;
        setScrollY(window.scrollY);
        lastY.current = window.scrollY;
        lastTime.current = now;
        ticking.current = false;
      });
    };

    raf = requestAnimationFrame(tick);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("scroll", onScroll);
    };
  }, []);

  return null;
}
