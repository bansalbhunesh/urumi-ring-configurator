"use client";

import { useEffect, useRef } from "react";
import { setScrollY } from "@/store/configurator";

/* Passive scroll tracker — writes to the module-level scrollY in the store
   so the R3F render loop can read it every frame without React re-renders.
   Mount once at page level. */

export function ScrollTracker() {
  const ticking = useRef(false);

  useEffect(() => {
    const onScroll = () => {
      if (ticking.current) return;
      ticking.current = true;
      requestAnimationFrame(() => {
        setScrollY(window.scrollY);
        ticking.current = false;
      });
    };
    // Seed initial value
    setScrollY(window.scrollY);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return null;
}
