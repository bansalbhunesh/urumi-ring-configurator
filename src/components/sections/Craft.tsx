"use client";

/* ============================================================
   CRAFT — animation universe: FOLD + CLIP + DRIFT

   The three blocks each live in a completely different motion world:
   - Eyebrow + heading: 3D flip unfold (like opening a physical book)
   - Quote line: horizontal clip wipe from left (film-strip precision)
   - Block 1 "Two ribbons": spring drift in from left
   - Block 2 "A stone": falls from above with rotation
   - Block 3 "Made to order": clip wipe from right

   Inspired by: Lusion.co (flip), Linear.app (clip), Active Theory (fall)
   ============================================================ */

import { InceptionReveal } from "@/components/ui/InceptionReveal";
import { SplitText } from "@/components/ui/SplitText";

const BLOCKS = [
  {
    title: "Two ribbons of gold",
    body: "Drawn by hand into a single continuous twist — a quiet symbol of two lives winding into one — then finished to a mirror polish that gathers the light of whatever room it walks into.",
    mode: "drift",
    dir: "left",
  },
  {
    title: "A stone, lifted to the light",
    body: "Every centre stone is conflict-free and independently graded for brilliance. The twisting shoulders raise it clear of the band so light can enter the pavilion from every side.",
    mode: "fall",
    dir: "left",
  },
  {
    title: "Made to order, kept for life",
    body: "Each ring is built to your configuration in our atelier and guaranteed for the life of the setting. Not fast jewellery — a piece meant to outlast the moment it marks.",
    mode: "drift",
    dir: "right",
  },
] as const;

export function Craft() {
  return (
    <section
      id="atelier"
      data-ring="stage"
      className="relative px-6 py-32 sm:px-10 lg:px-16 lg:py-48"
    >
      <div className="mx-auto max-w-2xl xl:mx-0 xl:max-w-[36rem]">
        {/* Eyebrow flips open in 3D — a different world from the usual fade */}
        <InceptionReveal mode="flip">
          <span className="eyebrow">The birth of form</span>
        </InceptionReveal>

        <SplitText as="h2" className="display-2 mt-5 text-balance text-ink">
          The smallest thing you will ever wear, and the one that says the most.
        </SplitText>

        {/* Quote clips across the screen like a film cell loading */}
        <InceptionReveal mode="clip" delay={0.08} className="mt-6">
          <p className="font-display text-xl italic leading-snug text-gold sm:text-2xl">
            Craftsmanship is the art of giving permanence to emotion.
          </p>
        </InceptionReveal>

        {/* Each block is its own motion universe */}
        <div className="mt-16 space-y-12">
          {BLOCKS.map((b, i) => (
            <InceptionReveal
              key={b.title}
              mode={b.mode}
              dir={b.dir}
              delay={i * 0.07}
            >
              <h3 className="font-display text-2xl text-ink">{b.title}</h3>
              <p className="mt-4 text-[1.05rem] leading-relaxed text-ink-soft">{b.body}</p>
            </InceptionReveal>
          ))}
        </div>
      </div>
    </section>
  );
}
