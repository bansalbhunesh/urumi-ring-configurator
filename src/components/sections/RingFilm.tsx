"use client";

import { useRef, type ReactNode } from "react";
import { useGSAP } from "@gsap/react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { AddToCartButton } from "@/components/studio/AddToCartButton";
import { PriceTag } from "@/components/studio/PriceTag";
import { StoneGlyph } from "@/components/studio/StoneGlyph";
import { playPing, playShimmer } from "@/hooks/useSound";
import { useProduct } from "@/hooks/useProduct";
import { useVariation } from "@/hooks/useVariation";
import {
  METAL_BY_ID,
  METAL_PREMIUM,
  METALS,
  STONE_BY_ID,
  STONE_PREMIUM,
  STONES,
} from "@/lib/config";
import {
  nudgeRing,
  setActiveChapter,
  setRingMotionMode,
  useConfigurator,
} from "@/store/configurator";

gsap.registerPlugin(ScrollTrigger, useGSAP);

const DETAIL_POINTS = [
  ["01", "Split shank", "two strands cross at the shoulder"],
  ["02", "Pavé shoulder", "small stones trace one upper ribbon"],
  ["03", "Four-prong basket", "the round brilliant, lifted to the light"],
] as const;

export function RingFilm() {
  const rootRef = useRef<HTMLDivElement>(null);
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
  const metalLabel = METAL_BY_ID[shownMetal].label;
  const stoneLabel = STONE_BY_ID[stone].label;
  const activeStone = STONE_BY_ID[stone];

  useGSAP(
    () => {
      const root = rootRef.current;
      if (!root) return undefined;

      const triggers = gsap.utils.toArray<HTMLElement>("[data-product-chapter]", root).map((section) =>
        ScrollTrigger.create({
          trigger: section,
          start: "top 55%",
          end: "bottom 45%",
          invalidateOnRefresh: true,
          onEnter: () => applyChapter(section),
          onEnterBack: () => applyChapter(section),
        }),
      );

      const reveal = gsap.from("[data-reveal-line]", {
        y: 18,
        opacity: 0,
        duration: 0.8,
        ease: "power3.out",
        stagger: 0.07,
      });

      ScrollTrigger.refresh();
      return () => {
        reveal.kill();
        triggers.forEach((trigger) => trigger.kill());
      };
    },
    { scope: rootRef },
  );

  return (
    <div ref={rootRef} className="aurelle-product-story relative">
      <section
        id="ring"
        data-ring="hero"
        data-product-chapter="hero"
        className="aurelle-hero relative min-h-[100svh] overflow-hidden px-5 pt-24 pb-12 text-bench-ink sm:px-8 lg:px-14 lg:pt-28"
      >
        <div className="aurelle-hero__atmos" aria-hidden />

        <div className="relative z-30 grid min-h-[calc(100svh-9rem)] items-center gap-10 lg:grid-cols-[minmax(23rem,30rem)_minmax(0,1fr)]">
          <div className="aurelle-console" id="materials">
            <div data-reveal-line>
              <p className="aurelle-kicker">Made to order · The Twist</p>
              <h1 className="mt-2 font-display text-[clamp(2.3rem,3.6vw,3.6rem)] font-semibold leading-[0.92]">
                The Twist
                <span className="block text-[0.5em] not-italic tracking-[0.02em] text-bench-gold">
                  Engagement Ring
                </span>
              </h1>
              <p className="mt-3 max-w-sm text-[0.9rem] leading-relaxed text-bench-muted">
                A split twist setting — one polished strand, one pavé shoulder, a
                round brilliant held in a four-prong basket. Configured live.
              </p>
            </div>

            <div className="aurelle-console__price" data-reveal-line>
              <div>
                <p className="aurelle-kicker">Current build</p>
                <p className="mt-1 text-[0.8rem] text-bench-muted">
                  {metalLabel} · {stoneLabel} · US {size}
                </p>
              </div>
              <p className="font-sans text-[clamp(1.7rem,2.4vw,2.5rem)] font-semibold leading-none tabular-nums text-bench-ink">
                <PriceTag value={price} symbol={symbol} />
              </p>
            </div>

            <PickerBlock label="Metal" value={metalLabel} reveal>
              <div className="aurelle-metal-grid">
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
                      className="aurelle-metal"
                      data-selected={selected ? "true" : "false"}
                    >
                      <span
                        className="aurelle-metal__swatch"
                        style={{ background: `linear-gradient(135deg, ${item.swatch[0]} 0%, ${item.swatch[1]} 58%, ${item.swatch[0]} 100%)` }}
                        aria-hidden
                      />
                      <span>
                        {item.label.replace(" Gold", "")}
                        <em>{premium === 0 ? "base" : `+$${premium}`}</em>
                      </span>
                    </button>
                  );
                })}
              </div>
            </PickerBlock>

            <PickerBlock label="Centre stone" value={`${activeStone.label} · ${activeStone.carat}`} reveal>
              <div className="aurelle-stone-grid">
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
                      aria-label={`${item.label} centre stone, ${item.carat}, ${item.caption}`}
                      className="aurelle-stone"
                      data-selected={selected ? "true" : "false"}
                    >
                      <span className="aurelle-stone__gem">
                        <StoneGlyph stone={item.id} selected={selected} />
                      </span>
                      <span>{item.label}</span>
                      <em>{premium === 0 ? "base" : `+$${premium}`}</em>
                    </button>
                  );
                })}
              </div>
            </PickerBlock>

            <div className="aurelle-action-row" data-reveal-line>
              <AddToCartButton variationId={variation?.id} loading={isLoading} />
              <a href="#photo-handoff" className="aurelle-text-link">
                See it worn
              </a>
            </div>
          </div>

          <div className="aurelle-stage-caption" aria-hidden>
            <span>Live preview</span>
            <b>Ten cuts orbit the ring — your choice flies to the centre.</b>
          </div>
        </div>
      </section>

      <section
        id="inspection"
        data-ring="config"
        data-product-chapter="inspection"
        className="aurelle-configure relative flex min-h-[100svh] flex-col justify-between overflow-hidden px-5 py-20 text-bench-ink sm:px-8 lg:px-14 lg:py-24"
      >
        <div className="aurelle-configure__copy">
          <p className="aurelle-kicker">Turn it in the light</p>
          <h2 className="mt-3 max-w-[12ch] font-display text-[clamp(2rem,3.6vw,3.6rem)] font-semibold leading-[0.95]">
            Read the ring before you choose it.
          </h2>
          <p className="mt-4 max-w-xs text-[0.95rem] leading-relaxed text-bench-muted">
            The centre stone you picked is set live — turn it, change the metal,
            and watch the light move across every facet.
          </p>
        </div>

        <div className="aurelle-configure__chips" aria-hidden>
          {DETAIL_POINTS.map(([num, title, text]) => (
            <div key={title} className="aurelle-chip">
              <span>{num}</span>
              <b>{title}</b>
              <em>{text}</em>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}

function PickerBlock({
  label,
  value,
  reveal,
  children,
}: {
  label: string;
  value: string;
  reveal?: boolean;
  children: ReactNode;
}) {
  return (
    <section className="aurelle-picker" aria-label={`${label} picker`} data-reveal-line={reveal ? "" : undefined}>
      <div className="mb-2.5 flex items-end justify-between gap-4">
        <p className="aurelle-kicker">{label}</p>
        <p className="text-right text-[0.74rem] text-bench-muted">{value}</p>
      </div>
      {children}
    </section>
  );
}

function applyChapter(section: HTMLElement) {
  const chapter = section.dataset.productChapter;
  if (chapter === "inspection") {
    setActiveChapter("inspection");
  } else {
    setActiveChapter("impact");
  }
  setRingMotionMode("parked");
}
