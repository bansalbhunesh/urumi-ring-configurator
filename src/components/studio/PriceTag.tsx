"use client";

import { useEffect } from "react";
import { motion, useSpring, useTransform } from "framer-motion";

/* Odometer price: each digit is a rolling column, so a configuration change
   physically *counts* up or down rather than snapping. */
function Digit({ value }: { value: number }) {
  const mv = useSpring(value, { stiffness: 220, damping: 26 });
  useEffect(() => {
    mv.set(value);
  }, [value, mv]);
  const y = useTransform(mv, (v) => `${-v}em`);

  return (
    <span className="relative inline-block h-[1em] w-[0.56em] overflow-hidden align-baseline tabular-nums">
      <motion.span className="absolute left-0 top-0 flex flex-col items-center" style={{ y }}>
        {Array.from({ length: 10 }).map((_, i) => (
          <span key={i} className="flex h-[1em] items-center justify-center leading-none">
            {i}
          </span>
        ))}
      </motion.span>
    </span>
  );
}

export function PriceTag({
  value,
  symbol = "$",
  className,
}: {
  value: number;
  symbol?: string;
  className?: string;
}) {
  const chars = Math.round(value).toLocaleString("en-US").split("");

  return (
    <span className={className} aria-label={`${symbol}${Math.round(value)}`}>
      <span aria-hidden>{symbol}</span>
      {chars.map((c, i) =>
        /\d/.test(c) ? (
          <Digit key={i} value={Number(c)} />
        ) : (
          <span key={i} aria-hidden>
            {c}
          </span>
        ),
      )}
    </span>
  );
}
