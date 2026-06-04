"use client";

import { PriceTag } from "@/components/studio/PriceTag";
import { useProduct } from "@/hooks/useProduct";
import { useVariation } from "@/hooks/useVariation";
import { METAL_BY_ID, STONE_BY_ID } from "@/lib/config";
import { useConfigurator } from "@/store/configurator";

const SPECS = [
  ["Setting", "split twist solitaire"],
  ["Shoulder", "one polished strand, one pave strand"],
  ["Basket", "four-prong round brilliant setting"],
  ["Profile", "slim comfort-fit shank"],
  ["Service", "insured shipping, warranty, returns"],
] as const;

export function Provenance() {
  const metal = useConfigurator((state) => state.metal);
  const stone = useConfigurator((state) => state.stone);
  const size = useConfigurator((state) => state.size);
  const { data: product } = useProduct();
  const { price } = useVariation(product, metal, stone);
  const symbol = product?.currencySymbol ?? "$";

  return (
    <section
      id="provenance"
      data-ring="hidden"
      className="ledger-chapter relative overflow-hidden px-5 py-20 text-bench-ink sm:px-8 lg:px-14 lg:py-28"
    >
      <div className="mx-auto grid max-w-7xl gap-8 lg:grid-cols-[minmax(23rem,0.82fr)_minmax(0,1.18fr)] lg:items-start">
        <div className="ledger-summary">
          <p className="aurelle-kicker">Build ledger</p>
          <h2 className="mt-4 font-display text-[clamp(2.4rem,4vw,4.6rem)] font-semibold leading-[0.9]">
            Your selected ring, written plainly.
          </h2>
          <div className="mt-8 grid gap-4">
            <div className="ledger-price">
              <span>Price</span>
              <b>
                <PriceTag value={price} symbol={symbol} />
              </b>
            </div>
            <div className="ledger-selection">
              <span>{METAL_BY_ID[metal].label}</span>
              <span>{STONE_BY_ID[stone].label}</span>
              <span>US {size}</span>
            </div>
          </div>
        </div>

        <div className="ledger-sheet">
          <div className="ledger-product-image">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/img/doamore/twist-round-white-gold-angle.jpg"
              alt="The Twist engagement ring three-quarter product plate"
              loading="lazy"
            />
          </div>
          {SPECS.map(([key, value]) => (
            <div key={key} className="ledger-row">
              <span>{key}</span>
              <b>{value}</b>
            </div>
          ))}
          <div className="ledger-note">
            Pricing and variation state remain synchronized with the live
            WooCommerce/cart flow.
          </div>
        </div>
      </div>
    </section>
  );
}
