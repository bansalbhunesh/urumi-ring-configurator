"use client";

import { useRef, type ReactNode } from "react";
import { useGSAP } from "@gsap/react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { AddToCartButton } from "@/components/studio/AddToCartButton";
import { PriceTag } from "@/components/studio/PriceTag";
import { StoneThumb } from "@/components/studio/StoneThumb";
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
  parkRingForConfigurator,
  setActiveChapter,
  setRingMotionMode,
  useConfigurator,
} from "@/store/configurator";

gsap.registerPlugin(ScrollTrigger, useGSAP);

const PRODUCT_NOTES = [
  ["01", "split twist shank"],
  ["02", "pave shoulder"],
  ["03", "four-prong basket"],
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
          start: "top 58%",
          end: "bottom 42%",
          invalidateOnRefresh: true,
          onEnter: () => applyChapterState(section),
          onEnterBack: () => applyChapterState(section),
        }),
      );

      const parkTrigger = ScrollTrigger.create({
        trigger: root.querySelector("#materials") as HTMLElement,
        start: "top 65%",
        once: true,
        onEnter: () => {
          parkRingForConfigurator();
          setRingMotionMode("parked");
        },
      });

      ScrollTrigger.refresh();
      return () => {
        triggers.forEach((trigger) => trigger.kill());
        parkTrigger.kill();
      };
    },
    { scope: rootRef },
  );

  return (
    <div ref={rootRef} className="product-run relative">
      <section
        id="ring"
        data-ring="impact"
        data-product-chapter="impact"
        className="product-hero relative min-h-[128svh] overflow-clip text-bench-ink"
      >
        <div className="product-hero__sticky">
          <div className="product-hero__field" aria-hidden />
          <div className="product-hero__plate" aria-hidden />

          <div className="product-hero__copy">
            <span className="bench-label">The Twist Engagement Ring</span>
            <h1 className="mt-5 max-w-[9ch] font-display text-[clamp(3.4rem,8vw,8rem)] font-semibold leading-[0.88]">
              A ring, held still enough to believe.
            </h1>
            <p className="mt-6 max-w-md text-[1rem] leading-relaxed text-bench-muted sm:text-[1.05rem]">
              Split twist shank, pave shoulder, and a four-prong basket. The first screen should sell the object before the interface asks anything from you.
            </p>
            <div className="mt-8 flex flex-wrap gap-2">
              {PRODUCT_NOTES.map(([n, label]) => (
                <span key={n} className="product-note">
                  <b>{n}</b>
                  {label}
                </span>
              ))}
            </div>
          </div>

          <a href="#materials" className="product-hero__cta">
            Configure the ring
          </a>
        </div>
      </section>

      <section
        id="materials"
        data-ring="config"
        data-product-chapter="config"
        className="configurator-bench relative min-h-[100svh] overflow-hidden px-5 py-20 text-bench-ink sm:px-10 lg:px-16 lg:py-20"
      >
        <div className="configurator-bench__field" aria-hidden />
        <div className="mx-auto grid min-h-[calc(100svh-12rem)] max-w-7xl items-center gap-8 lg:grid-cols-[minmax(0,1.02fr)_minmax(24rem,0.78fr)]">
          <div className="configurator-stage" aria-hidden>
            <span className="configurator-stage__label">Live 3D setting</span>
            <span className="configurator-stage__rule configurator-stage__rule--top" />
            <span className="configurator-stage__rule configurator-stage__rule--bottom" />
          </div>

          <div className="configurator-panel">
            <div className="flex flex-wrap items-start justify-between gap-5 border-b border-bench-line/60 pb-5">
              <div>
                <span className="bench-label">Configure</span>
                <h2 className="mt-2 font-display text-[clamp(2rem,3.4vw,3.2rem)] leading-[0.92]">
                  Build the ring.
                </h2>
                <p className="mt-2 text-[0.82rem] leading-relaxed text-bench-muted">
                  {METAL_BY_ID[metal].label} / {stoneLabel} / US {size}
                </p>
              </div>
              <div className="grid justify-items-end gap-3 text-right">
                <p className="font-sans text-3xl font-semibold tabular-nums text-bench-ink">
                  <PriceTag value={price} symbol={symbol} />
                </p>
                <AddToCartButton variationId={variation?.id} loading={isLoading} />
              </div>
            </div>

            <div className="mt-5 space-y-5">
              <PickerBlock label="Metal" value={metalLabel}>
                <div className="metal-grid">
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
                        className="metal-choice"
                        data-selected={selected ? "true" : "false"}
                      >
                        <span
                          className="metal-choice__swatch"
                          style={{ background: `linear-gradient(135deg, ${item.swatch[0]}, ${item.swatch[1]})` }}
                          aria-hidden
                        />
                        <span className="metal-choice__text">
                          <span>{item.label.replace(" Gold", "")}</span>
                          <em>{premium === 0 ? "base" : `+$${premium}`}</em>
                        </span>
                      </button>
                    );
                  })}
                </div>
              </PickerBlock>

              <PickerBlock label="Stone" value={`${activeStone.label} / ${activeStone.carat}`}>
                <div className="stone-grid">
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
                        className="stone-choice"
                        data-selected={selected ? "true" : "false"}
                      >
                        <StoneThumb stone={item.id} selected={selected} />
                        <span>{item.label}</span>
                        <em>{premium === 0 ? "base" : `+$${premium}`}</em>
                      </button>
                    );
                  })}
                </div>
              </PickerBlock>
            </div>

          </div>
        </div>
      </section>
    </div>
  );
}

function PickerBlock({
  label,
  value,
  children,
}: {
  label: string;
  value: string;
  children: ReactNode;
}) {
  return (
    <section className="picker-block" aria-label={`${label} picker`}>
      <div className="mb-3 flex items-end justify-between gap-4">
        <div>
          <span className="bench-label">{label}</span>
          <p className="mt-1 font-display text-[1.45rem] leading-none text-bench-ink">{value}</p>
        </div>
      </div>
      {children}
    </section>
  );
}

function applyChapterState(section: HTMLElement) {
  const chapter = section.dataset.productChapter;
  if (chapter === "impact") {
    setActiveChapter("impact");
    setRingMotionMode("parked");
  }
  if (chapter === "config") {
    setActiveChapter("config");
    setRingMotionMode("parked");
  }
}
