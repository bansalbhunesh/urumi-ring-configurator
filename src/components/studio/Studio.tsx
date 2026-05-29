"use client";

import { motion } from "framer-motion";
import { RoomTint } from "@/components/ui/RoomTint";
import { useConfigurator } from "@/store/configurator";
import { useProduct } from "@/hooks/useProduct";
import { useVariation } from "@/hooks/useVariation";
import { MetalSelector } from "./MetalSelector";
import { StoneSelector } from "./StoneSelector";
import { PriceTag } from "./PriceTag";
import { AddToCartButton } from "./AddToCartButton";

import { RingCanvas } from "@/components/three/RingCanvas";

const EASE = [0.22, 1, 0.36, 1] as const;

export function Studio() {
  const metal = useConfigurator((s) => s.metal);
  const stone = useConfigurator((s) => s.stone);
  const { data: product, isLoading } = useProduct();
  const { variation, price, live } = useVariation(product, metal, stone);
  const symbol = product?.currencySymbol ?? "$";

  return (
    <section id="ring" className="relative grid min-h-[100svh] lg:grid-cols-2">
      <RoomTint />

      {/* 3D Canvas Viewport */}
      <div className="relative z-10 order-1 h-[56svh] lg:order-2 lg:h-auto lg:min-h-[100svh] w-full">
        <RingCanvas />
        <div className="pointer-events-none absolute inset-x-0 bottom-5 flex justify-center z-20">
          <span className="rounded-full bg-white/55 px-4 py-1.5 text-[0.66rem] uppercase tracking-[0.28em] text-ink-soft backdrop-blur-sm">
            Drag to rotate
          </span>
        </div>
      </div>

      {/* Configurator panel */}
      <div className="relative z-10 order-2 flex items-center px-6 pb-20 pt-10 sm:px-10 lg:order-1 lg:px-16 lg:py-0">
        <motion.div
          initial={{ opacity: 0, y: 28 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, ease: EASE, delay: 0.15 }}
          className="w-full max-w-md lg:mx-auto"
        >
          <span className="eyebrow">Made to order · The Aurelle Atelier</span>
          <h1 className="font-display mt-4 text-5xl leading-[0.95] tracking-tight text-balance sm:text-6xl">
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

          <div className="mt-9 flex items-end justify-between">
            <div>
              <span className="eyebrow">Your configuration</span>
              <div className="font-display mt-1 text-4xl text-ink">
                <PriceTag value={price} symbol={symbol} />
              </div>
            </div>
            <span
              className="mb-1 flex items-center gap-1.5 text-[0.68rem] uppercase tracking-[0.16em] text-muted"
              title={
                live
                  ? "Pricing served live from the WooCommerce Store API"
                  : "Pricing from the seeded mock (WooCommerce not reachable)"
              }
            >
              <span
                className={`h-1.5 w-1.5 rounded-full ${
                  live ? "bg-emerald-500" : "bg-gold"
                }`}
              />
              {live ? "Live price" : "Demo price"}
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
