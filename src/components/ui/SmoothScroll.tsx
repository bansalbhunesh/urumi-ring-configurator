"use client";

import { useEffect } from "react";
import Lenis from "lenis";

/* ---------------------------------------------------------------------------
   Global Smooth Scrolling (Lenis)
   Overrides native scroll with buttery-smooth easing, making scroll-tied
   3D animations and velocity marquees feel premium.
--------------------------------------------------------------------------- */

export function SmoothScroll({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    // Only enable on desktop to respect native touch scrolling
    const isTouch = window.matchMedia("(pointer: coarse)").matches;
    if (isTouch) return;

    const lenis = new Lenis({
      duration: 1.2,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)), // expo easing
      orientation: "vertical",
      gestureOrientation: "vertical",
      smoothWheel: true,
      wheelMultiplier: 1,
      touchMultiplier: 2,
    });

    let rafId: number;
    function raf(time: number) {
      lenis.raf(time);
      rafId = requestAnimationFrame(raf);
    }
    rafId = requestAnimationFrame(raf);

    return () => {
      cancelAnimationFrame(rafId);
      lenis.destroy();
    };
  }, []);

  return <>{children}</>;
}
