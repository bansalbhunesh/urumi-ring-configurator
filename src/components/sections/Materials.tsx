"use client";

import { useRef } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import { AddToCartButton } from "@/components/studio/AddToCartButton";
import { PriceTag } from "@/components/studio/PriceTag";
import { StoneThumb } from "@/components/studio/StoneThumb";
import { useProduct } from "@/hooks/useProduct";
import { useVariation } from "@/hooks/useVariation";
import { playPing, playShimmer } from "@/hooks/useSound";
import {
  METAL_BY_ID,
  METAL_PREMIUM,
  METALS,
  STONE_BY_ID,
  STONE_PREMIUM,
  STONES,
} from "@/lib/config";
import { nudgeRing, useConfigurator } from "@/store/configurator";

export function Materials() {
  const ref = useRef<HTMLElement>(null);
  const metal = useConfigurator((state) => state.metal);
  const stone = useConfigurator((state) => state.stone);
  const size = useConfigurator((state) => state.size);
  const previewMetal = useConfigurator((state) => state.previewMetal);
  const setMetal = useConfigurator((state) => state.setMetal);
  const setStone = useConfigurator((state) => state.setStone);
  const setPreviewMetal = useConfigurator((state) => state.setPreviewMetal);
  const { data: product, isLoading } = useProduct();
  const { variation, price } = useVariation(product, metal, stone);
  const symbol = product?.currencySymbol ?? "$";
  const shownMetal = previewMetal ?? metal;
  const activeMetal = METAL_BY_ID[shownMetal];
  const activeStone = STONES.find((item) => item.id === stone) ?? STONES[0];

  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start start", "end start"],
  });

  const titleOpacity = useTransform(scrollYProgress, [0, 0.08, 0.48, 0.72], [0.8, 1, 0.72, 0.18]);
  const titleY = useTransform(scrollYProgress, [0, 0.24, 0.7], [0, -8, -44]);
  const railOpacity = useTransform(scrollYProgress, [0, 0.01], [1, 1]);
  const railY = useTransform(scrollYProgress, [0.1, 0.28], [24, 0]);
  const stoneOpacity = useTransform(scrollYProgress, [0, 0.01], [1, 1]);
  const stoneY = useTransform(scrollYProgress, [0.34, 0.56], [28, 0]);
  const summaryOpacity = useTransform(scrollYProgress, [0, 0.01], [1, 1]);
  const summaryY = useTransform(scrollYProgress, [0.62, 0.84], [28, 0]);
  const prismX = useTransform(scrollYProgress, [0.04, 0.9], ["12%", "88%"]);

  return (
    <section
      ref={ref}
      id="materials"
      data-ring="materials"
      className="materials-chapter relative min-h-[300svh] overflow-clip text-bench-ink"
    >
      <div className="sticky top-0 h-[100svh] overflow-hidden">
        <div className="materials-field absolute inset-0" aria-hidden />

        <motion.div
          className="materials-prism pointer-events-none absolute inset-y-0 z-20 w-[18vw] min-w-32"
          style={{ left: prismX }}
          aria-hidden
        />

        <motion.div
          className="pointer-events-none absolute left-6 top-24 z-20 max-w-[33rem] sm:left-10 lg:left-16 lg:top-28"
          style={{ opacity: titleOpacity, y: titleY }}
        >
          <span className="bench-label">Chapter 03 / Variation lab</span>
          <h2 className="mt-5 max-w-[10ch] font-display text-[clamp(3rem,7.6vw,7rem)] font-semibold leading-[0.9] text-bench-ink">
            Tune the light.
          </h2>
          <p className="mt-5 max-w-sm text-[0.95rem] leading-relaxed text-bench-muted">
            Metal and stone are treated as lighting decisions, not dropdown values.
          </p>
        </motion.div>

        <motion.div
          className="material-rail absolute bottom-6 left-5 right-5 z-30 p-4 sm:bottom-10 sm:left-10 sm:right-auto sm:w-[min(40rem,46vw)] sm:p-5 lg:left-16"
          style={{ opacity: railOpacity, y: railY }}
        >
          <div className="flex items-end justify-between gap-4 border-b border-bench-line/55 pb-4">
            <div>
              <span className="bench-label">Metal</span>
              <p className="mt-2 font-display text-3xl leading-none text-bench-ink sm:text-4xl">
              {activeMetal.label}
              </p>
            </div>
            <p className="max-w-[10rem] text-right text-[0.72rem] uppercase tracking-[0.16em] text-bench-muted">
              {activeMetal.caption}
            </p>
          </div>

          <div className="mt-5 grid grid-cols-3 gap-3">
            {METALS.map((item) => {
              const selected = item.id === metal;
              const premium = METAL_PREMIUM[item.id];
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => {
                    setMetal(item.id);
                    nudgeRing("metal");
                    playShimmer();
                  }}
                  onFocus={() => setPreviewMetal(item.id)}
                  onBlur={() => setPreviewMetal(null)}
                  onPointerEnter={() => setPreviewMetal(item.id)}
                  onPointerLeave={() => setPreviewMetal(null)}
                  aria-pressed={selected}
                  aria-label={`${item.label}, ${item.caption}`}
                  className="material-swatch group min-h-32 p-3 text-left outline-none transition-colors focus-visible:ring-2 focus-visible:ring-bench-gold"
                  data-selected={selected ? "true" : "false"}
                >
                  <span
                    className="block h-14 w-full"
                    style={{
                      background: `linear-gradient(135deg, ${item.swatch[0]}, ${item.swatch[1]})`,
                    }}
                    aria-hidden
                  />
                  <span className="mt-3 block text-[0.78rem] font-semibold text-bench-ink">
                    {item.label}
                  </span>
                  <span className="mt-1 block text-[0.6rem] uppercase tracking-[0.14em] text-bench-muted">
                    {premium === 0 ? "base" : `+$${premium}`}
                  </span>
                </button>
              );
            })}
          </div>
        </motion.div>

        <motion.div
          className="stone-console absolute right-5 top-[27%] z-30 hidden w-[min(31rem,37vw)] p-4 sm:right-10 sm:block lg:right-16"
          style={{ opacity: stoneOpacity, y: stoneY }}
        >
          <div className="flex items-end justify-between gap-4 border-b border-bench-line/55 pb-4">
            <div>
              <span className="bench-label">Center stone</span>
              <p className="mt-2 font-display text-3xl leading-none text-bench-ink">
                {activeStone.label}
              </p>
            </div>
            <p className="text-right text-[0.72rem] uppercase tracking-[0.16em] text-bench-muted">
              {activeStone.carat}<br />{STONE_BY_ID[stone].caption}
            </p>
          </div>
          <div className="mt-5 grid grid-cols-3 gap-3">
            {STONES.map((item) => {
              const selected = item.id === stone;
              const premium = STONE_PREMIUM[item.id];
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => {
                    setStone(item.id);
                    nudgeRing("stone");
                    playPing();
                  }}
                  aria-pressed={selected}
                  aria-label={`${item.label} center stone, ${item.carat}, ${item.caption}`}
                  className="stone-vial group grid min-h-36 place-items-center gap-3 p-3 text-center outline-none transition-colors focus-visible:ring-2 focus-visible:ring-bench-gold"
                  data-selected={selected ? "true" : "false"}
                >
                  <StoneThumb stone={item.id} selected={selected} />
                  <span>
                    <span className="block text-[0.78rem] text-bench-ink">{item.label}</span>
                    <span className="mt-1 block text-[0.58rem] uppercase tracking-[0.14em] text-bench-muted">
                      {premium === 0 ? "base" : `+$${premium}`}
                    </span>
                  </span>
                </button>
              );
            })}
          </div>
        </motion.div>

        <motion.div
          className="material-summary absolute inset-x-5 bottom-6 z-30 mx-auto p-4 sm:hidden"
          style={{ opacity: stoneOpacity, y: stoneY }}
        >
          <div className="grid grid-cols-3 gap-2">
            {STONES.map((item) => {
              const selected = item.id === stone;
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => {
                    setStone(item.id);
                    nudgeRing("stone");
                    playPing();
                  }}
                  aria-pressed={selected}
                  aria-label={`${item.label} center stone, ${item.carat}, ${item.caption}`}
                  className="stone-vial min-h-24 p-2 text-center outline-none focus-visible:ring-2 focus-visible:ring-bench-gold"
                  data-selected={selected ? "true" : "false"}
                >
                  <StoneThumb stone={item.id} selected={selected} />
                  <span className="mt-1 block text-[0.68rem] text-bench-ink">{item.label}</span>
                </button>
              );
            })}
          </div>
        </motion.div>

        <motion.div
          className="material-summary absolute bottom-6 right-5 z-30 hidden w-[min(30rem,34vw)] p-4 sm:right-10 sm:block lg:right-16"
          style={{ opacity: summaryOpacity, y: summaryY }}
        >
          <div className="grid grid-cols-[1fr_auto] items-end gap-5">
            <div>
              <span className="bench-label">Matched variation</span>
              <p className="mt-2 text-[0.82rem] leading-relaxed text-bench-muted">
                {activeMetal.label} / {activeStone.label} / US {size}
              </p>
              {variation?.sku && (
                <p className="mt-2 text-[0.58rem] uppercase tracking-[0.16em] text-bench-muted">
                  SKU {variation.sku}
                </p>
              )}
            </div>
            <div className="text-right">
              <p className="font-sans text-2xl font-semibold tabular-nums text-bench-ink">
                <PriceTag value={price} symbol={symbol} />
              </p>
              <div className="mt-3">
                <AddToCartButton variationId={variation?.id} loading={isLoading} />
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
