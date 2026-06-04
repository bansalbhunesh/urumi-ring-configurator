"use client";

import { useRef } from "react";
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

const INSPECTION_LABELS = [
  { n: "01", label: "split twist shank", className: "left-[10%] top-[62%]" },
  { n: "02", label: "pave shoulder", className: "right-[11%] top-[33%]" },
  { n: "03", label: "four-prong basket", className: "left-[25%] top-[29%]" },
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
  const activeStone = STONES.find((item) => item.id === stone) ?? STONES[0];

  useGSAP(
    () => {
      const root = rootRef.current;
      if (!root) return undefined;

      const mm = gsap.matchMedia();
      mm.add("(min-width: 768px)", () => {
        const chapters = gsap.utils.toArray<HTMLElement>(".cinematic-chapter", root);
        const triggers = chapters.map((chapter) =>
          ScrollTrigger.create({
            trigger: chapter,
            start: "top top",
            end: "bottom bottom",
            scrub: 0.65,
            invalidateOnRefresh: true,
            onEnter: () => setChapterState(chapter),
            onEnterBack: () => setChapterState(chapter),
            onUpdate: (self) => {
              chapter.style.setProperty("--chapter-progress", self.progress.toFixed(4));
            },
          }),
        );

        const parkTrigger = ScrollTrigger.create({
          trigger: root.querySelector("#materials") as HTMLElement,
          start: "top 62%",
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
      });

      mm.add("(max-width: 767px)", () => {
        const chapters = gsap.utils.toArray<HTMLElement>(".cinematic-chapter", root);
        const triggers = chapters.map((chapter) =>
          ScrollTrigger.create({
            trigger: chapter,
            start: "top 60%",
            end: "bottom 40%",
            onEnter: () => setChapterState(chapter),
            onEnterBack: () => setChapterState(chapter),
          }),
        );
        return () => triggers.forEach((trigger) => trigger.kill());
      });

      return () => mm.revert();
    },
    { scope: rootRef },
  );

  return (
    <div ref={rootRef} className="cinematic-run relative">
      <section
        id="ring"
        data-ring="impact"
        data-chapter="impact"
        className="cinematic-chapter chapter-impact relative min-h-[260svh] overflow-clip text-bench-ink"
      >
        <div className="chapter-sticky">
          <ChapterField />
          <div className="impact-meter" aria-hidden>
            <span />
            <span />
            <span />
          </div>
          <div className="chapter-copy chapter-copy--impact">
            <span className="bench-label">Chapter 01 / Impact</span>
            <h1 className="mt-5 font-display text-[clamp(3.4rem,9vw,9rem)] font-semibold leading-[0.86]">
              The Twist
            </h1>
            <p className="mt-4 font-display text-[clamp(1.45rem,3vw,2.8rem)] italic leading-none text-bench-gold">
              Engagement Ring
            </p>
          </div>
          <div className="impact-notes" aria-hidden>
            <span>mass 4.8g</span>
            <span>off-axis impact</span>
            <span>polished gold / diamond</span>
          </div>
        </div>
      </section>

      <section
        id="atelier"
        data-ring="inspection"
        data-chapter="inspection"
        className="cinematic-chapter chapter-inspection relative min-h-[215svh] overflow-clip text-bench-ink"
      >
        <div className="chapter-sticky">
          <ChapterField dense />
          <div className="inspection-loupe" aria-hidden />
          <div className="chapter-copy chapter-copy--inspection">
            <span className="bench-label">Chapter 02 / Inspection</span>
            <h2 className="mt-4 max-w-[9ch] font-display text-[clamp(2.9rem,7vw,7.2rem)] font-semibold leading-[0.9]">
              Settled by contact.
            </h2>
            <p className="mt-5 max-w-sm text-[0.94rem] leading-relaxed text-bench-muted">
              The side appears because the ring moved through a real event:
              impact, friction, wobble, rest.
            </p>
          </div>
          <div className="inspection-tags pointer-events-none hidden sm:block">
            {INSPECTION_LABELS.map((item) => (
              <div key={item.n} className={`film-tag absolute ${item.className}`}>
                <span>{item.n}</span>
                {item.label}
              </div>
            ))}
          </div>
        </div>
      </section>

      <section
        id="materials"
        data-ring="config"
        data-chapter="config"
        className="cinematic-chapter chapter-config relative min-h-[250svh] overflow-clip text-bench-ink"
      >
        <div className="chapter-sticky">
          <ChapterField dense />
          <div className="config-stage-keepout" aria-hidden />

          <div className="config-copy">
            <span className="bench-label">Chapter 03 / Configuration bench</span>
            <h2 className="mt-3 font-display text-[clamp(2.4rem,4.5vw,4.8rem)] leading-[0.92]">
              Choose without breaking the film.
            </h2>
          </div>

          <div className="config-metal-panel bench-panel">
            <div className="flex items-end justify-between gap-4 border-b border-bench-line/55 pb-4">
              <div>
                <span className="bench-label">Metal</span>
                <p className="mt-2 font-display text-3xl leading-none text-bench-ink sm:text-4xl">
                  {metalLabel}
                </p>
              </div>
              <p className="max-w-[9rem] text-right text-[0.68rem] uppercase tracking-[0.16em] text-bench-muted">
                Live material response
              </p>
            </div>

            <div className="mt-5 grid grid-cols-2 gap-3 lg:grid-cols-4">
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
                    className="material-swatch min-h-20 p-2 text-left outline-none focus-visible:ring-2 focus-visible:ring-bench-gold sm:min-h-24 sm:p-3"
                    data-selected={selected ? "true" : "false"}
                  >
                    <span
                      className="block h-8 w-full sm:h-10"
                      style={{ background: `linear-gradient(135deg, ${item.swatch[0]}, ${item.swatch[1]})` }}
                      aria-hidden
                    />
                    <span className="mt-3 block text-[0.72rem] font-semibold text-bench-ink sm:text-[0.78rem]">
                      {item.label}
                    </span>
                    <span className="mt-1 block text-[0.56rem] uppercase tracking-[0.14em] text-bench-muted">
                      {premium === 0 ? "base" : `+$${premium}`}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="config-stone-panel bench-panel">
            <div className="flex items-end justify-between gap-4 border-b border-bench-line/55 pb-4">
              <div>
                <span className="bench-label">Center stone</span>
                <p className="mt-2 font-display text-3xl leading-none text-bench-ink">
                  {activeStone.label}
                </p>
              </div>
              <p className="text-right text-[0.68rem] uppercase tracking-[0.16em] text-bench-muted">
                {activeStone.carat}
                <br />
                {activeStone.caption}
              </p>
            </div>
            <div className="mt-5 grid grid-cols-3 gap-3 lg:grid-cols-5">
              {STONES.map((item) => renderStoneButton(item, stone, setStone))}
            </div>
          </div>

          <div className="config-summary bench-panel">
            <div>
              <span className="bench-label">Locked variation</span>
              <p className="mt-2 text-[0.82rem] leading-relaxed text-bench-muted">
                {metalLabel} / {stoneLabel} / US {size}
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
        </div>
      </section>
    </div>
  );
}

function setChapterState(chapter: HTMLElement) {
  const chapterName = chapter.dataset.chapter;
  if (chapterName === "impact") {
    setActiveChapter("impact");
    setRingMotionMode("physical");
  }
  if (chapterName === "inspection") {
    setActiveChapter("inspection");
    setRingMotionMode("physical");
  }
  if (chapterName === "config") {
    setActiveChapter("config");
    setRingMotionMode("parked");
  }
}

function ChapterField({ dense = false }: { dense?: boolean }) {
  return (
    <>
      <div className={`chapter-field ${dense ? "chapter-field--dense" : ""}`} aria-hidden />
      <div className="chapter-reticle" aria-hidden>
        {Array.from({ length: 28 }).map((_, index) => (
          <span key={index} style={{ transform: `rotate(${index * 12.857}deg)` }} />
        ))}
      </div>
      <div className="chapter-surface" aria-hidden />
    </>
  );
}

function renderStoneButton(
  item: (typeof STONES)[number],
  current: string,
  setStone: ReturnType<typeof useConfigurator.getState>["setStone"],
) {
  const selected = item.id === current;
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
      className="stone-vial grid min-h-24 place-items-center gap-2 p-2 text-center outline-none focus-visible:ring-2 focus-visible:ring-bench-gold sm:min-h-28 sm:gap-2"
      data-selected={selected ? "true" : "false"}
    >
      <StoneThumb stone={item.id} selected={selected} />
      <span>
        <span className="block text-[0.68rem] text-bench-ink sm:text-[0.78rem]">{item.label}</span>
        <span className="mt-1 block text-[0.58rem] uppercase tracking-[0.14em] text-bench-muted">
          {premium === 0 ? "base" : `+$${premium}`}
        </span>
      </span>
    </button>
  );
}
