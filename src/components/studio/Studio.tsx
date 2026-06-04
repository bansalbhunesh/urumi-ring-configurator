"use client";

import { useRef } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import { useConfigurator, setRingPose } from "@/store/configurator";
import { useProduct } from "@/hooks/useProduct";
import { useVariation } from "@/hooks/useVariation";
import { METAL_BY_ID, STONE_BY_ID } from "@/lib/config";
import { MetalSelector } from "./MetalSelector";
import { StoneSelector } from "./StoneSelector";
import { PriceTag } from "./PriceTag";
import { AddToCartButton } from "./AddToCartButton";

const ANATOMY = [
  { label: "Split twist shank", className: "left-[9%] top-[54%] lg:left-[14%] lg:top-[56%]" },
  { label: "Pave shoulder", className: "right-[9%] top-[37%] lg:right-[15%] lg:top-[39%]" },
  { label: "Four-prong basket", className: "left-[13%] top-[30%] lg:left-[22%] lg:top-[25%]" },
] as const;

const VIEWS = [
  { label: "Front", yaw: -0.42, pitch: 0.02 },
  { label: "3/4", yaw: -Math.PI / 5, pitch: 0.12 },
  { label: "Side", yaw: Math.PI / 2, pitch: 0.04 },
] as const;

export function Studio() {
  const ref = useRef<HTMLElement>(null);
  const metal = useConfigurator((state) => state.metal);
  const stone = useConfigurator((state) => state.stone);
  const size = useConfigurator((state) => state.size);
  const { data: product, isLoading } = useProduct();
  const { variation, price } = useVariation(product, metal, stone);
  const symbol = product?.currencySymbol ?? "$";
  const metalLabel = METAL_BY_ID[metal].label;
  const stoneLabel = STONE_BY_ID[stone].label;

  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start start", "end start"],
  });
  const titleOpacity = useTransform(scrollYProgress, [0, 0.2, 0.48], [1, 1, 0.16]);
  const titleY = useTransform(scrollYProgress, [0, 0.24, 0.58], [0, 0, -72]);
  const benchOpacity = useTransform(scrollYProgress, [0, 0.15], [0.4, 1]);
  const loupeScale = useTransform(scrollYProgress, [0.1, 0.42, 0.72], [0.74, 1, 1.16]);
  const marksOpacity = useTransform(scrollYProgress, [0.38, 0.58], [0, 1]);
  const sheetY = useTransform(scrollYProgress, [0.72, 1], [34, 0]);
  const sheetOpacity = useTransform(scrollYProgress, [0.72, 0.9], [0, 1]);

  return (
    <section
      ref={ref}
      id="ring"
      data-ring="bench"
      className="bench-chapter relative min-h-[260svh] overflow-clip text-bench-ink"
    >
      <div className="sticky top-0 h-[100svh] overflow-hidden">
        <motion.div className="bench-surface absolute inset-0" style={{ opacity: benchOpacity }} aria-hidden />

        <motion.div
          className="pointer-events-none absolute left-1/2 top-[45%] h-[min(62vw,38rem)] w-[min(62vw,38rem)] -translate-x-1/2 -translate-y-1/2 sm:top-1/2"
          style={{ scale: loupeScale }}
          aria-hidden
        >
          <div className="bench-loupe absolute inset-0" />
          <CropMarks />
        </motion.div>

        <motion.div
          className="pointer-events-none absolute left-6 top-24 z-20 max-w-[32rem] sm:left-10 lg:left-16 lg:top-28"
          style={{ opacity: titleOpacity, y: titleY }}
        >
          <span className="bench-label">Chapter 01 / The bench</span>
          <h1 className="mt-5 font-display text-[clamp(3rem,9vw,8.4rem)] font-semibold leading-[0.86] tracking-tight text-bench-ink">
            The Twist
          </h1>
          <p className="mt-4 font-display text-[clamp(1.45rem,3vw,2.8rem)] italic leading-none text-bench-gold">
            Engagement Ring
          </p>
        </motion.div>

        <motion.div
          className="pointer-events-none absolute inset-0 z-20 hidden sm:block"
          style={{ opacity: marksOpacity }}
          aria-hidden
        >
          {ANATOMY.map((item) => (
            <span
              key={item.label}
              className={`bench-annotation absolute ${item.className}`}
            >
              {item.label}
            </span>
          ))}
        </motion.div>

        <motion.div
          className="pointer-events-none absolute inset-x-6 bottom-8 z-30 flex items-end justify-between gap-5 sm:inset-x-10 lg:inset-x-16"
          style={{ opacity: marksOpacity }}
        >
          <div className="hidden max-w-xs text-[0.78rem] leading-relaxed text-bench-muted sm:block">
            A live 3D inspection of the split shank, pave shoulder, and four-prong basket before configuration begins.
          </div>
          <div className="flex flex-col items-end gap-3">
            <span className="bench-scroll-cue">Scroll to inspect</span>
            <div
              role="group"
              aria-label="Ring view presets"
              className="pointer-events-auto hidden items-center gap-px border border-bench-line bg-bench-panel/70 p-1 backdrop-blur-sm lg:flex"
            >
              {VIEWS.map((view) => (
                <button
                  key={view.label}
                  type="button"
                  onClick={() => setRingPose(view.yaw, view.pitch)}
                  className="px-3 py-1.5 text-[0.6rem] uppercase tracking-[0.16em] text-bench-muted outline-none transition-colors hover:bg-bench-line hover:text-bench-ink focus-visible:ring-2 focus-visible:ring-bench-gold"
                >
                  {view.label}
                </button>
              ))}
            </div>
          </div>
        </motion.div>
      </div>

      <motion.div
        className="relative z-30 mx-auto -mt-[92svh] flex min-h-[92svh] max-w-6xl items-end px-6 pb-16 sm:px-10 lg:px-16"
        style={{ opacity: sheetOpacity, y: sheetY }}
      >
        <div className="configuration-sheet w-full max-w-[42rem] p-5 sm:p-7">
          <div className="flex flex-wrap items-end justify-between gap-5 border-b border-line pb-5">
            <div>
              <span className="eyebrow">Configuration sheet</span>
              <h2 className="mt-2 font-display text-3xl text-ink sm:text-4xl">
                Build the exact variation.
              </h2>
            </div>
            <div className="text-right">
              <div className="font-sans text-2xl font-semibold leading-none tabular-nums text-ink">
                <PriceTag value={price} symbol={symbol} />
              </div>
              {variation?.sku && (
                <p className="mt-2 text-[0.62rem] uppercase tracking-[0.18em] text-muted">
                  SKU {variation.sku}
                </p>
              )}
            </div>
          </div>

          <div className="mt-7 space-y-7">
            <MetalSelector />
            <StoneSelector />
          </div>

          <div className="mt-7 grid gap-4 border-t border-line pt-5 sm:grid-cols-[1fr_auto] sm:items-center">
            <p className="text-[0.82rem] leading-relaxed text-ink-soft">
              {metalLabel} / {stoneLabel} / US {size}. Price and cart line are pulled from the matched WooCommerce variation.
            </p>
            <AddToCartButton variationId={variation?.id} loading={isLoading} />
          </div>
        </div>
      </motion.div>
    </section>
  );
}

function CropMarks() {
  const marks = [
    "left-0 top-0 border-l border-t",
    "right-0 top-0 border-r border-t",
    "left-0 bottom-0 border-l border-b",
    "right-0 bottom-0 border-r border-b",
  ];
  return (
    <>
      {marks.map((mark) => (
        <span
          key={mark}
          className={`absolute h-12 w-12 border-bench-gold/70 ${mark}`}
          aria-hidden
        />
      ))}
      <span className="absolute left-1/2 top-0 h-full border-l border-dashed border-bench-line/70" aria-hidden />
      <span className="absolute left-0 top-1/2 w-full border-t border-dashed border-bench-line/70" aria-hidden />
    </>
  );
}
