"use client";

/* ============================================================
   WEIGHT OF CHOICE — animation universe: BILATERAL CLIP + COUNTING PRICE

   Completely different from everything above:
   - Each row: label CLIPS from the left while value CLIPS from the right,
     simultaneously, like a ledger being stamped shut (bilateral wipe)
   - Price: animates as a live counter from 0 → final value
   - Total block: springs up with burst energy

   Inspired by: Stripe pricing page (bilateral), Coinbase (counter)
   ============================================================ */

import { AnimatePresence, motion, useInView, animate } from "framer-motion";
import { useRef, useEffect, useState } from "react";
import { SplitText } from "@/components/ui/SplitText";
import { InceptionReveal } from "@/components/ui/InceptionReveal";
import { useConfigurator } from "@/store/configurator";
import { useProduct } from "@/hooks/useProduct";
import { useVariation } from "@/hooks/useVariation";
import { METAL_BY_ID, STONE_BY_ID } from "@/lib/config";

const CI = [0.22, 1, 0.36, 1] as const;
const EX = [0.16, 1, 0.3, 1] as const;

/* Animated counting number */
function AnimatedCounter({
  value,
  symbol,
  className,
}: {
  value: number;
  symbol: string;
  className?: string;
}) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, margin: "-80px" });
  const [display, setDisplay] = useState(0);

  useEffect(() => {
    if (!inView || !value) return;
    const controls = animate(0, value, {
      duration: 2.2,
      ease: EX,
      onUpdate: (v) => setDisplay(Math.round(v)),
    });
    return controls.stop;
  }, [inView, value]);

  return (
    <span ref={ref} className={className}>
      {symbol}
      {display.toLocaleString()}
    </span>
  );
}

/* Row with bilateral clip-wipe: label from left, value from right */
function LedgerRow({
  label,
  value,
  delay = 0,
}: {
  label: string;
  value: string;
  delay?: number;
}) {
  return (
    <div className="flex flex-col gap-1 border-b border-line/70 py-5 sm:flex-row sm:items-baseline sm:justify-between">
      {/* Label clips from the left */}
      <motion.dt
        className="text-[0.7rem] uppercase tracking-[0.22em] text-gold overflow-hidden"
        initial={{ clipPath: "inset(0 100% 0 0)" }}
        whileInView={{ clipPath: "inset(0 0% 0 0%)" }}
        viewport={{ once: true, margin: "-40px" }}
        transition={{ duration: 1.0, ease: EX, delay }}
      >
        {label}
      </motion.dt>

      {/* Value clips from the right — mirror of the label */}
      <motion.dd
        className="text-right text-[0.98rem] text-ink-soft overflow-hidden"
        initial={{ clipPath: "inset(0 0 0 100%)" }}
        whileInView={{ clipPath: "inset(0 0% 0 0%)" }}
        viewport={{ once: true, margin: "-40px" }}
        transition={{ duration: 1.0, ease: EX, delay: delay + 0.06 }}
      >
        <AnimatePresence mode="wait">
          <motion.span
            key={value}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.4, ease: CI }}
            className="inline-block"
          >
            {value}
          </motion.span>
        </AnimatePresence>
      </motion.dd>
    </div>
  );
}

export function WeightOfChoice() {
  const metal = useConfigurator((s) => s.metal);
  const stone = useConfigurator((s) => s.stone);
  const { data: product } = useProduct();
  const { price } = useVariation(product, metal, stone);
  const symbol = product?.currencySymbol ?? "$";
  const m = METAL_BY_ID[metal];
  const s = STONE_BY_ID[stone];

  const lines = [
    { k: "This brilliance",    v: `${s.label} cut · ${s.carat}` },
    { k: "This craftsmanship", v: "The twist — drawn and set by hand" },
    { k: "This material",      v: `${m.label} · solid 18k recycled gold` },
  ];

  return (
    <section
      id="weight"
      data-ring="hidden"
      className="relative flex min-h-[100svh] items-center px-6 py-32 sm:px-10 lg:px-16"
    >
      <div className="mx-auto w-full max-w-2xl">
        <InceptionReveal mode="flip">
          <span className="eyebrow">The weight of choice</span>
        </InceptionReveal>

        <SplitText as="h2" className="display-3 mt-5 text-balance text-ink">
          Not a number. A sum of decisions.
        </SplitText>

        {/* Ledger rows — bilateral clip from both sides simultaneously */}
        <dl className="mt-12 space-y-px">
          {lines.map((l, i) => (
            <LedgerRow
              key={l.k}
              label={l.k}
              value={l.v}
              delay={0.15 + i * 0.12}
            />
          ))}
        </dl>

        {/* Total — bursts up with spring energy after the rows land */}
        <InceptionReveal mode="burst" delay={0.55} className="mt-12">
          <div className="flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
            <p className="max-w-xs text-[0.92rem] leading-relaxed text-muted">
              Everything you chose, totalled — and nothing you didn&apos;t.
            </p>
            <div className="sm:text-right">
              <div className="font-sans text-[3rem] font-semibold leading-none tabular-nums whitespace-nowrap text-ink">
                <AnimatedCounter
                  value={price ?? 2400}
                  symbol={symbol}
                />
              </div>
              <p className="mt-2 text-[0.66rem] uppercase tracking-[0.22em] text-muted">
                Made to order
              </p>
            </div>
          </div>
        </InceptionReveal>
      </div>
    </section>
  );
}
