"use client";

import { useEffect } from "react";
import { animate, motion, useMotionValue, useTransform } from "framer-motion";

export function PriceTag({
  value,
  symbol = "$",
  className,
}: {
  value: number;
  symbol?: string;
  className?: string;
}) {
  const mv = useMotionValue(value);
  const text = useTransform(
    mv,
    (v) => `${symbol}${Math.round(v).toLocaleString("en-US")}`,
  );

  useEffect(() => {
    const controls = animate(mv, value, {
      duration: 0.7,
      ease: [0.22, 1, 0.36, 1],
    });
    return () => controls.stop();
  }, [value, mv]);

  return <motion.span className={className}>{text}</motion.span>;
}
