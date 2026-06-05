"use client";

import { motion } from "framer-motion";
import { AddToCartButton } from "@/components/studio/AddToCartButton";
import { PriceTag } from "@/components/studio/PriceTag";
import { StonePicker3D } from "@/components/studio/StonePicker3D";
import { RingDragPad } from "@/components/three/RingDragPad";
import { playPing, playShimmer } from "@/hooks/useSound";
import { useProduct } from "@/hooks/useProduct";
import { useVariation } from "@/hooks/useVariation";
import {
  METAL_BY_ID,
  METAL_PREMIUM,
  METALS,
  STONE_BY_ID,
} from "@/lib/config";
import { useConfigurator } from "@/store/configurator";

const SIZES = [5, 5.5, 6, 6.5, 7, 7.5, 8];

const fade = {
  initial: { opacity: 0, y: 16 },
  animate: { opacity: 1, y: 0 },
};

export function RingFilm() {
  const metal = useConfigurator((s) => s.metal);
  const stone = useConfigurator((s) => s.stone);
  const size = useConfigurator((s) => s.size);
  const previewMetal = useConfigurator((s) => s.previewMetal);
  const setMetal = useConfigurator((s) => s.setMetal);
  const setStone = useConfigurator((s) => s.setStone);
  const setSize = useConfigurator((s) => s.setSize);
  const setPreviewMetal = useConfigurator((s) => s.setPreviewMetal);

  const { data: product } = useProduct();
  const { variation, price, live } = useVariation(product, metal, stone);
  const symbol = product?.currencySymbol ?? "$";

  const shownMetal = previewMetal ?? metal;
  const metalLabel = METAL_BY_ID[shownMetal].label;
  const activeStone = STONE_BY_ID[stone];

  return (
    <section id="ring" data-ring="hero" className="pp-hero">
      {/* Monumental backdrop wordmark — the Oryzo editorial-type signature */}
      <div className="pp-hero__wordmark" aria-hidden="true">
        <span>FOR</span>
        <span>EVER</span>
      </div>

      <div className="pp-hero__grid">
        {/* Configurator */}
        <motion.div
          className="pp-config"
          initial="initial"
          animate="animate"
          transition={{ staggerChildren: 0.06, delayChildren: 0.1 }}
        >
          <motion.p variants={fade} transition={{ duration: 0.6 }} className="kicker">
            <span className="kicker__idx">01</span> Configure yours · made to order
          </motion.p>
          <motion.h1 variants={fade} transition={{ duration: 0.6 }} className="pp-title mt-3">
            The Twist
            <em>Engagement Ring</em>
          </motion.h1>
          <motion.p variants={fade} transition={{ duration: 0.6 }} className="pp-lede">
            One polished strand, one pavé shoulder, a brilliant centre stone held
            in a four-prong basket. Turn it in the light, change the metal and the
            cut — every choice rendered live, in three dimensions.
          </motion.p>

          <motion.div variants={fade} transition={{ duration: 0.6 }} className="pp-price-row">
            <span className="pp-price">
              <PriceTag value={price} symbol={symbol} />
            </span>
            <span className="pp-price-note">
              {metalLabel} · {activeStone.label} {activeStone.carat} · {live ? "live price" : "demo price"}
            </span>
          </motion.div>

          {/* Metal */}
          <motion.div variants={fade} transition={{ duration: 0.6 }} className="pp-field">
            <div className="pp-field__head">
              <span className="pp-field__label">Metal</span>
              <span className="pp-field__value">{metalLabel}</span>
            </div>
            <div className="pp-metals">
              {METALS.map((item) => {
                const selected = item.id === metal;
                return (
                  <button
                    key={item.id}
                    type="button"
                    className="pp-metal"
                    data-selected={selected ? "true" : "false"}
                    aria-pressed={selected}
                    aria-label={`${item.label}${METAL_PREMIUM[item.id] ? `, +$${METAL_PREMIUM[item.id]}` : ""}`}
                    onClick={() => {
                      setMetal(item.id);
                      playShimmer();
                    }}
                    onPointerEnter={() => setPreviewMetal(item.id)}
                    onPointerLeave={() => setPreviewMetal(null)}
                    onFocus={() => setPreviewMetal(item.id)}
                    onBlur={() => setPreviewMetal(null)}
                  >
                    <span
                      className="pp-metal__disc"
                      style={{ background: `radial-gradient(120% 120% at 32% 26%, ${item.swatch[0]} 0%, ${item.swatch[1]} 78%)` }}
                    />
                    <span className="pp-metal__name">{item.label.replace(" Gold", "")}</span>
                  </button>
                );
              })}
            </div>
          </motion.div>

          {/* Stone */}
          <motion.div variants={fade} transition={{ duration: 0.6 }} className="pp-field">
            <div className="pp-field__head">
              <span className="pp-field__label">Centre stone</span>
              <span className="pp-field__value">{activeStone.label} · {activeStone.carat}</span>
            </div>
            <StonePicker3D
              stone={stone}
              onSelect={(s) => {
                setStone(s);
                playPing();
              }}
            />
          </motion.div>

          {/* Size */}
          <motion.div variants={fade} transition={{ duration: 0.6 }} className="pp-field">
            <div className="pp-field__head">
              <span className="pp-field__label">Ring size (US)</span>
              <span className="pp-field__value">{size}</span>
            </div>
            <div className="pp-sizes">
              {SIZES.map((s) => (
                <button
                  key={s}
                  type="button"
                  className="pp-size"
                  data-selected={s === size ? "true" : "false"}
                  aria-pressed={s === size}
                  onClick={() => setSize(s)}
                >
                  {s}
                </button>
              ))}
            </div>
          </motion.div>

          <motion.ul variants={fade} transition={{ duration: 0.6 }} className="pp-features">
            <li>Conflict-free natural diamond, GIA-graded</li>
            <li>Hand-set four-prong basket, comfort-fit band</li>
            <li>Recycled 18k gold &amp; platinum, made to order</li>
          </motion.ul>

          <motion.div variants={fade} transition={{ duration: 0.6 }} className="pp-actions">
            <AddToCartButton variationId={variation?.id} />
            <div className="pp-trust">
              <span>Free insured shipping</span>
              <span>Lifetime warranty</span>
              <span>60-day returns</span>
            </div>
          </motion.div>
        </motion.div>

        {/* Ring stage — the fixed canvas renders the ring here */}
        <div className="pp-stage">
          <RingDragPad className="pp-stage__pad" />
          <div className="pp-stage__hint">Drag to rotate · live preview</div>
        </div>
      </div>

      <div className="pp-scrollcue" aria-hidden="true">
        <span>Scroll</span>
        <i />
      </div>
    </section>
  );
}
