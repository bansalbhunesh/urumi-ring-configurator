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
    // Only enable on desktop to respect native touch scrolling, and never
    // override scroll for users who prefer reduced motion.
    const isTouch = window.matchMedia("(pointer: coarse)").matches;
    const prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    // Automated browsers (Playwright, crawlers) drive scroll programmatically;
    // Lenis's RAF loop fights that and makes elements never settle "stable".
    // Native scroll for them; real users still get the smooth experience.
    const isAutomated = typeof navigator !== "undefined" && navigator.webdriver;
    if (isTouch || prefersReduced || isAutomated) return;

    const lenis = new Lenis({
      duration: 1.2,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)), // expo easing
      orientation: "vertical",
      gestureOrientation: "vertical",
      smoothWheel: true,
      wheelMultiplier: 1,
      touchMultiplier: 2,
    });

    // Expose for in-page navigation (anchor links) and debugging.
    (window as unknown as { __lenis?: Lenis }).__lenis = lenis;

    let rafId: number;
    function raf(time: number) {
      lenis.raf(time);
      rafId = requestAnimationFrame(raf);
    }
    rafId = requestAnimationFrame(raf);

    return () => {
      cancelAnimationFrame(rafId);
      lenis.destroy();
      delete (window as unknown as { __lenis?: Lenis }).__lenis;
    };
  }, []);

  return <>{children}</>;
}
