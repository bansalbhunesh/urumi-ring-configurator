"use client";

import { motion } from "framer-motion";
import { RoomTint } from "@/components/ui/RoomTint";
import { useConfigurator, setRingPose } from "@/store/configurator";
import { useProduct } from "@/hooks/useProduct";
import { useVariation } from "@/hooks/useVariation";
import { METAL_BY_ID, STONE_BY_ID } from "@/lib/config";
import { MetalSelector } from "./MetalSelector";
import { StoneSelector } from "./StoneSelector";
import { EngravingField } from "./EngravingField";
import { PriceTag } from "./PriceTag";
import { AddToCartButton } from "./AddToCartButton";

const EASE = [0.22, 1, 0.36, 1] as const;

const VIEWS = [
  { label: "Front", yaw: 0, pitch: 0 },
  { label: "¾", yaw: -Math.PI / 5, pitch: 0.14 },
  { label: "Side", yaw: Math.PI / 2, pitch: 0 },
  { label: "Top", yaw: 0, pitch: 1.0 },
] as const;

/* Word-by-word rise, like the reference's headline reveals. */
function Rise({ text, className, delay = 0 }: { text: string; className?: string; delay?: number }) {
  const words = text.split(" ");
  return (
    <span className={className} aria-label={text}>
      {words.map((w, i) => (
        <span key={i} className="inline-block overflow-hidden align-bottom" aria-hidden>
          <motion.span
            className="inline-block"
            initial={{ y: "115%" }}
            animate={{ y: "0%" }}
            transition={{ duration: 1, ease: EASE, delay: delay + i * 0.07 }}
          >
            {w}
            {i < words.length - 1 ? " " : ""}
          </motion.span>
        </span>
      ))}
    </span>
  );
}

export function Studio() {
  const metal = useConfigurator((s) => s.metal);
  const stone = useConfigurator((s) => s.stone);
  const engraving = useConfigurator((s) => s.engraving);
  const size = useConfigurator((s) => s.size);
  const { data: product, isLoading } = useProduct();
  const { variation, price } = useVariation(product, metal, stone);
  const symbol = product?.currencySymbol ?? "$";
  const metalLabel = METAL_BY_ID[metal].label;
  const stoneLabel = STONE_BY_ID[stone].label;

  return (
    <section
      id="ring"
      data-ring="hero"
      className="relative grid min-h-[100svh] overflow-hidden lg:grid-cols-[1.05fr_0.95fr]"
    >
      <RoomTint />

      {/* 3D viewport — ring painted by the global canvas behind this column */}
      <div className="relative z-10 order-1 h-[46svh] min-h-[19rem] w-full pointer-events-none sm:h-[52svh] lg:order-2 lg:h-auto lg:min-h-[100svh]">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1, delay: 1.2, ease: EASE }}
          className="pointer-events-none absolute inset-x-0 bottom-6 z-20 flex flex-col items-center gap-2.5"
        >
          <span className="inline-flex items-center gap-2 rounded-full border border-line/80 bg-porcelain/50 px-4 py-1.5 text-[0.6rem] uppercase tracking-[0.26em] text-ink-soft backdrop-blur-sm">
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
        <div className="w-full max-w-xl lg:mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2, ease: EASE }}
          >
            <span className="eyebrow">Made to order · Solid 18k recycled gold</span>
          </motion.div>

          <h1 className="mt-5">
            <Rise text="The Twist" className="block display-2 text-ink" delay={0.3} />
            <Rise
              text="Engagement Ring"
              className="mt-1 block font-display text-2xl italic tracking-tight text-gold sm:text-3xl"
              delay={0.6}
            />
          </h1>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1, delay: 1, ease: EASE }}
            className="mt-6 max-w-md text-[1.02rem] leading-relaxed text-ink-soft"
          >
            Two ribbons of gold, wound into one. The ring that makes a question
            feel like the only question that has ever mattered.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.9, delay: 1.1, ease: EASE }}
          >
            <div className="o-dashline my-8" />

            <div className="space-y-7">
              <MetalSelector />
              <StoneSelector />
            </div>

            <div className="o-dashline my-8" />

            <EngravingField />

            <div className="mt-9">
              <span className="eyebrow">Your configuration</span>
              <div className="mt-2 font-sans text-2xl font-semibold leading-none tabular-nums text-ink">
                <PriceTag value={price} symbol={symbol} />
              </div>
              <p className="mt-2.5 text-[0.8rem] tracking-wide text-ink-soft">
                {metalLabel} · {stoneLabel} · US {size}
              </p>
              {engraving && (
                <p className="mt-1 text-[0.8rem] italic tracking-wide text-gold/90">
                  Engraved: &ldquo;{engraving}&rdquo;
                </p>
              )}
            </div>

            <div className="mt-6">
              <AddToCartButton variationId={variation?.id} loading={isLoading} />
            </div>

            <p className="mt-4 text-center text-[0.72rem] tracking-wide text-muted">
              Complimentary insured shipping · Lifetime warranty · 60-day returns
            </p>
          </motion.div>
        </div>
      </div>
    </section>
  );
}

function DragGlyph() {
  return (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path d="M12 4a8 8 0 1 1-7.5 5.3" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
      <path d="M4 4v5h5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
