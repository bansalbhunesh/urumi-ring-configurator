"use client";

import { AddToCartButton } from "@/components/studio/AddToCartButton";
import { PriceTag } from "@/components/studio/PriceTag";
import { useProduct } from "@/hooks/useProduct";
import { useVariation } from "@/hooks/useVariation";
import { METAL_BY_ID, STONE_BY_ID } from "@/lib/config";
import { useConfigurator } from "@/store/configurator";

const TRUST = ["Insured shipping", "Lifetime warranty", "60-day returns", "Conflict-free"] as const;

export function Closing() {
  const metal = useConfigurator((state) => state.metal);
  const stone = useConfigurator((state) => state.stone);
  const size = useConfigurator((state) => state.size);
  const { data: product, isLoading } = useProduct();
  const { variation, price } = useVariation(product, metal, stone);
  const symbol = product?.currencySymbol ?? "$";
  const activeStone = STONE_BY_ID[stone];

  return (
    <section
      id="finale"
      data-ring="finale"
      className="finale-chapter relative flex min-h-[100svh] flex-col justify-between overflow-hidden px-5 py-20 text-bench-ink sm:px-8 lg:px-14 lg:py-24"
    >
      <div className="finale-chapter__mark" aria-hidden />

      <div className="relative z-30 mx-auto w-full max-w-3xl text-center">
        <p className="aurelle-kicker">The reveal</p>
        <h2 className="mt-3 font-display text-[clamp(2.2rem,4.4vw,4.2rem)] font-semibold leading-[0.95]">
          Your ring, ready.
        </h2>
        <p className="mx-auto mt-4 max-w-md text-[0.95rem] leading-relaxed text-bench-muted">
          {METAL_BY_ID[metal].label} · {activeStone.label} {activeStone.carat} centre stone.
          Some choices last forever — this is yours.
        </p>
      </div>

      <div className="relative z-30 mx-auto w-full max-w-5xl">
        <div className="finale-reveal">
          <div className="finale-reveal__spec">
            <span>Configuration</span>
            <div className="finale-reveal__chips">
              <b>{METAL_BY_ID[metal].label}</b>
              <b>{activeStone.label}</b>
              <b>US {size}</b>
            </div>
          </div>

          <div className="finale-reveal__buy">
            <p className="font-sans text-[clamp(2rem,3vw,3rem)] font-semibold leading-none tabular-nums">
              <PriceTag value={price} symbol={symbol} />
            </p>
            <div className="w-full max-w-xs">
              <AddToCartButton variationId={variation?.id} loading={isLoading} />
            </div>
          </div>
        </div>

        <div className="finale-trust">
          {TRUST.map((item) => (
            <span key={item}>{item}</span>
          ))}
        </div>
      </div>
    </section>
  );
}
