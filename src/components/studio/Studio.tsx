"use client";

import { motion } from "framer-motion";
import { RoomTint } from "@/components/ui/RoomTint";
import { useConfigurator, setRingPose } from "@/store/configurator";

const VIEWS = [
  { label: "Front", yaw: 0, pitch: 0 },
  { label: "¾", yaw: -Math.PI / 5, pitch: 0.14 },
  { label: "Side", yaw: Math.PI / 2, pitch: 0 },
  { label: "Top", yaw: 0, pitch: 1.0 },
] as const;
import { useProduct } from "@/hooks/useProduct";
import { useVariation } from "@/hooks/useVariation";
import { METAL_BY_ID, STONE_BY_ID } from "@/lib/config";
import { MetalSelector } from "./MetalSelector";
import { StoneSelector } from "./StoneSelector";
import { PriceTag } from "./PriceTag";
import { AddToCartButton } from "./AddToCartButton";

const EASE = [0.22, 1, 0.36, 1] as const;

export function Studio() {
  const metal = useConfigurator((s) => s.metal);
  const stone = useConfigurator((s) => s.stone);
  const { data: product, isLoading } = useProduct();
  const { variation, price, live } = useVariation(product, metal, stone);
  const symbol = product?.currencySymbol ?? "$";
  const metalLabel = METAL_BY_ID[metal].label;
  const stoneLabel = STONE_BY_ID[stone].label;

  return (
    <section
      id="ring"
      className="relative grid min-h-[100svh] overflow-hidden lg:grid-cols-[minmax(400px,0.94fr)_1.06fr]"
    >
      <RoomTint />

      {/* 3D viewport — the ring itself is painted by the global canvas behind
          this column. We only reserve the space and host the drag affordance. */}
      <div className="relative z-10 order-1 h-[48svh] min-h-[20rem] w-full pointer-events-none sm:h-[52svh] lg:order-2 lg:h-auto lg:min-h-[100svh]">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1, delay: 1.1, ease: EASE }}
          className="pointer-events-none absolute inset-x-0 bottom-6 z-20 flex flex-col items-center gap-2.5"
        >
          <span className="inline-flex items-center gap-2 rounded-full border border-line/80 bg-porcelain/50 px-4 py-1.5 text-[0.62rem] uppercase tracking-[0.24em] text-ink-soft backdrop-blur-sm">
            <DragGlyph /> Drag to rotate
          </span>
          <div
            role="group"
            aria-label="Ring view presets"
            className="pointer-events-auto hidden items-center gap-0.5 rounded-full border border-line/80 bg-porcelain/50 p-1 backdrop-blur-sm lg:flex"
          >
            {VIEWS.map((v) => (
              <button
                key={v.label}
                type="button"
                onClick={() => setRingPose(v.yaw, v.pitch)}
                className="rounded-full px-3 py-1 text-[0.6rem] uppercase tracking-[0.18em] text-ink-soft outline-none transition-colors hover:bg-ink/5 hover:text-ink focus-visible:ring-2 focus-visible:ring-gold"
              >
                {v.label}
              </button>
            ))}
          </div>
        </motion.div>
      </div>

      {/* Configurator panel */}
      <div className="relative z-20 order-2 flex items-start px-6 pb-28 pt-6 sm:px-10 lg:order-1 lg:items-center lg:px-16 lg:py-0">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.9, ease: EASE, delay: 0.15 }}
          className="w-full max-w-md lg:mx-auto"
        >
          <span className="eyebrow">Made to order · The Aurelle Atelier</span>
          <h1 className="font-display mt-4 text-[2.9rem] leading-[0.95] tracking-tight text-balance sm:text-6xl lg:text-[4rem]">
            The Twist
            <span className="block italic text-gold">Engagement Ring</span>
          </h1>
          <p className="mt-5 max-w-sm text-[0.98rem] leading-relaxed text-ink-soft">
            Two ribbons of gold wind into a single embrace, lifting a brilliant
            solitaire toward the light. Configure yours — every change rendered
            live, in three dimensions.
          </p>

          <div className="rule-gold my-8" />

          <div className="space-y-7">
            <MetalSelector />
            <StoneSelector />
          </div>

          <div className="mt-9 flex items-end justify-between gap-5">
            <div>
              <span className="eyebrow">Your configuration</span>
              <div className="mt-1 font-sans text-4xl font-medium tabular-nums text-ink">
                <PriceTag value={price} symbol={symbol} />
              </div>
              <p className="mt-1 text-[0.76rem] text-ink-soft">
                {metalLabel} · {stoneLabel}
              </p>
            </div>
            <span
              className="mb-1 flex shrink-0 items-center gap-1.5 text-[0.66rem] uppercase tracking-[0.14em] text-ink-soft"
              title={
                live
                  ? "Pricing served live from the WooCommerce Store API"
                  : "Pricing from the seeded mock (WooCommerce not reachable)"
              }
            >
              <span
                className={`h-1.5 w-1.5 rounded-full ${
                  live ? "bg-emerald-400" : "bg-gold"
                }`}
              />
              {isLoading ? "Loading" : live ? "WooCommerce live" : "Seeded demo"}
            </span>
          </div>

          <div className="mt-5">
            <AddToCartButton variationId={variation?.id} loading={isLoading} />
          </div>

          <p className="mt-4 text-center text-[0.72rem] tracking-wide text-muted">
            Complimentary shipping · Lifetime warranty · 30-day returns
          </p>
        </motion.div>
      </div>
    </section>
  );
}

function DragGlyph() {
  return (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M12 4a8 8 0 1 1-7.5 5.3"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
      />
      <path d="M4 4v5h5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
