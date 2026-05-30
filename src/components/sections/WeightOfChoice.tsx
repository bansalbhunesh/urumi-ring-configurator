"use client";

import { AnimatePresence, motion } from "framer-motion";
import { Reveal } from "@/components/ui/Reveal";
import { SplitText } from "@/components/ui/SplitText";
import { PriceTag } from "@/components/studio/PriceTag";
import { useConfigurator } from "@/store/configurator";
import { useProduct } from "@/hooks/useProduct";
import { useVariation } from "@/hooks/useVariation";
import { METAL_BY_ID, STONE_BY_ID } from "@/lib/config";

/* ----------------------------------------------------------------------------
   ACT VIII — The weight of choice.

   Before the final reveal, every decision the user made is named back to them —
   the price stops being a number and becomes a sum of meaning: this brilliance,
   this craftsmanship, this material. Earned, not quoted. Reads the live config,
   so it is literally *their* ring being totalled. data-ring="hidden" keeps the
   stage clear so the words carry the moment.
---------------------------------------------------------------------------- */
export function WeightOfChoice() {
  const metal = useConfigurator((s) => s.metal);
  const stone = useConfigurator((s) => s.stone);
  const { data: product } = useProduct();
  const { price } = useVariation(product, metal, stone);
  const symbol = product?.currencySymbol ?? "$";
  const m = METAL_BY_ID[metal];
  const s = STONE_BY_ID[stone];

  const lines = [
    { k: "This brilliance", v: `${s.label} cut · ${s.carat}` },
    { k: "This craftsmanship", v: "The twist — drawn and set by hand" },
    { k: "This material", v: `${m.label} · solid 18k recycled gold` },
  ];

  return (
    <section
      id="weight"
      data-ring="hidden"
      className="relative flex min-h-[100svh] items-center px-6 py-32 sm:px-10 lg:px-16"
    >
      <div className="mx-auto w-full max-w-2xl">
        <span className="eyebrow">The weight of choice</span>
        <SplitText as="h2" className="display-3 mt-5 text-balance text-ink">
          Not a number. A sum of decisions.
        </SplitText>

        <Reveal delay={0.15}>
          <dl className="mt-12 space-y-px">
            {lines.map((l) => (
              <div
                key={l.k}
                className="flex flex-col gap-1 border-b border-line/70 py-5 sm:flex-row sm:items-baseline sm:justify-between"
              >
                <dt className="text-[0.7rem] uppercase tracking-[0.22em] text-gold">{l.k}</dt>
                <dd className="text-right text-[0.98rem] text-ink-soft">
                  <AnimatePresence mode="wait">
                    <motion.span
                      key={l.v}
                      initial={{ opacity: 0, y: 6 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -6 }}
                      transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
                      className="inline-block"
                    >
                      {l.v}
                    </motion.span>
                  </AnimatePresence>
                </dd>
              </div>
            ))}
          </dl>

          <div className="mt-12 flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
            <p className="max-w-xs text-[0.92rem] leading-relaxed text-muted">
              Everything you chose, totalled — and nothing you didn&apos;t.
            </p>
            <div className="sm:text-right">
              <div className="font-sans text-[3rem] font-semibold leading-none tabular-nums whitespace-nowrap text-ink">
                <PriceTag value={price} symbol={symbol} />
              </div>
              <p className="mt-2 text-[0.66rem] uppercase tracking-[0.22em] text-muted">
                Made to order
              </p>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
