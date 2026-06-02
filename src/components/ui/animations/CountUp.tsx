"use client";

import { useEffect, useRef, useState } from "react";
import { useInView } from "framer-motion";

/* ============================================================
   CountUp — animates a number from 0 (or from) to the target
   value when it enters the viewport.

   Uses requestAnimationFrame for smooth easing.
   ============================================================ */

function easeOutExpo(t: number): number {
  return t === 1 ? 1 : 1 - Math.pow(2, -10 * t);
}

export function CountUp({
  to,
  from = 0,
  duration = 1.8,
  decimals = 0,
  prefix = "",
  suffix = "",
  group = false,
  className,
}: {
  to: number;
  from?: number;
  duration?: number;
  decimals?: number;
  prefix?: string;
  suffix?: string;
  /** Group thousands with separators (e.g. 22,345). */
  group?: boolean;
  className?: string;
}) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, margin: "-60px" });
  const [value, setValue] = useState(from);
  const raf = useRef<number | null>(null);
  const started = useRef<number | null>(null);

  useEffect(() => {
    if (!inView) return;
    started.current = null;

    const step = (now: number) => {
      if (started.current === null) started.current = now;
      const elapsed = (now - started.current) / (duration * 1000);
      const progress = Math.min(elapsed, 1);
      const current = from + (to - from) * easeOutExpo(progress);
      setValue(current);
      if (progress < 1) raf.current = requestAnimationFrame(step);
    };

    raf.current = requestAnimationFrame(step);
    return () => { if (raf.current) cancelAnimationFrame(raf.current); };
  }, [inView, from, to, duration]);

  const formatted = group
    ? value.toLocaleString("en-US", {
        minimumFractionDigits: decimals,
        maximumFractionDigits: decimals,
      })
    : value.toFixed(decimals);

  return (
    <span ref={ref} className={className}>
      {prefix}{formatted}{suffix}
    </span>
  );
}
