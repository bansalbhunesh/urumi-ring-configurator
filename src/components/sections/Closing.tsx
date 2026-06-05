"use client";

import { motion } from "framer-motion";
import { SceneReveal } from "@/components/ui/SceneReveal";
import { AddToCartButton } from "@/components/studio/AddToCartButton";
import { PriceTag } from "@/components/studio/PriceTag";
import { useProduct } from "@/hooks/useProduct";
import { useVariation } from "@/hooks/useVariation";
import { METAL_BY_ID, STONE_BY_ID } from "@/lib/config";
import { useConfigurator } from "@/store/configurator";

const ease = [0.22, 1, 0.36, 1] as const;

export function Closing() {
  const metal = useConfigurator((s) => s.metal);
  const stone = useConfigurator((s) => s.stone);
  const size = useConfigurator((s) => s.size);
  const { data: product, isLoading } = useProduct();
  const { variation, price } = useVariation(product, metal, stone);
  const symbol = product?.currencySymbol ?? "$";
  const activeStone = STONE_BY_ID[stone];

  return (
    <section id="finale" data-ring="finale" className="pp-finale">
      <SceneReveal className="pp-wrap" depth={1.3}>
        <p className="kicker" style={{ textAlign: "center" }}><span className="kicker__idx">04</span> Your ring</p>
        <h2 className="pp-h2 mt-3" style={{ margin: "0.75rem auto 0", maxWidth: "18ch" }}>
          Some choices last forever.
        </h2>
      </SceneReveal>

      <motion.div
        className="pp-finale__bar"
        initial={{ opacity: 0, y: 24 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.8, ease, delay: 0.1 }}
      >
        <div className="pp-finale__chips">
          <span className="pp-chip">{METAL_BY_ID[metal].label}</span>
          <span className="pp-chip">{activeStone.label} · {activeStone.carat}</span>
          <span className="pp-chip">US {size}</span>
        </div>
        <p className="pp-price" style={{ fontSize: "clamp(2rem,3vw,2.8rem)" }}>
          <PriceTag value={price} symbol={symbol} />
        </p>
        <div style={{ width: "100%", maxWidth: "22rem" }}>
          <AddToCartButton variationId={variation?.id} loading={isLoading} />
        </div>
        <div className="pp-trust" style={{ justifyContent: "center" }}>
          <span>Free insured shipping</span>
          <span>Lifetime warranty</span>
          <span>Conflict-free</span>
        </div>
      </motion.div>
    </section>
  );
}
