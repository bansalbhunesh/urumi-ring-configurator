"use client";

/* ============================================================
   MATERIALS — animation universe: TUNNEL → SPRING BURST → DRIFT

   Entering Materials feels like a dimension change from Craft:
   - The heading zooms from near-zero scale (tunnel / Apple-product-page)
   - Metal swatches spring-burst in one by one like igniting sparks
   - Stone list items drift from alternating sides (odd: left, even: right)

   Inspired by: Apple.com (tunnel), Productboard (burst), Stripe (drift)
   ============================================================ */

import { motion } from "framer-motion";
import { InceptionReveal, InceptionStagger, InceptionItem } from "@/components/ui/InceptionReveal";

import { SplitText } from "@/components/ui/SplitText";
import { METALS, STONES } from "@/lib/config";
import { StoneGlyph } from "@/components/ui/icons";

const WORLD: Record<string, string> = {
  "white-gold": "Moonlight — cool clarity",
  "yellow-gold": "Heritage — warmth",
  "rose-gold": "Intimacy — romance",
};

const CI = [0.22, 1, 0.36, 1] as const;

export function Materials() {
  return (
    <section
      id="materials"
      data-ring="stage"
      data-frame="band"
      className="relative px-6 py-32 sm:px-10 lg:px-16 lg:py-48"
    >
      <div className="mx-auto max-w-2xl xl:mx-0 xl:max-w-[32rem]">
        <InceptionReveal mode="flip">
          <span className="eyebrow">The materials of forever</span>
        </InceptionReveal>

        {/* Tunnel zoom — completely different from the flip that just preceded it */}
        <InceptionReveal mode="tunnel" delay={0.05} className="mt-5">
          <SplitText as="h2" className="display-3 text-ink">
            Three metals. Three worlds.
          </SplitText>
        </InceptionReveal>

        <InceptionReveal mode="clip" delay={0.12} className="mt-5">
          <p className="text-[1.05rem] leading-relaxed text-ink-soft">
            Each is cast from solid 18-karat recycled gold and finished to a mirror —
            the integrity never changes. But the feeling does: the cool moonlight of
            white, the heritage of yellow, the intimacy of rose. Choose the one that
            sounds like you.
          </p>
        </InceptionReveal>

        {/* Metal swatches — burst in with spring stagger, each a small explosion */}
        <InceptionStagger delay={0.18} stagger={0.14} className="mt-10 space-y-5">
          {METALS.map((m) => (
            <InceptionItem key={m.id} mode="burst">
              <div className="flex items-center gap-5 border-b border-line pb-5">
                {/* Swatch itself also does a spring pop-in */}
                <motion.span
                  className="h-9 w-9 shrink-0 rounded-full"
                  style={{
                    background: `radial-gradient(120% 120% at 30% 25%, ${m.swatch[0]}, ${m.swatch[1]})`,
                    boxShadow: "inset 0 1px 2px rgba(255,255,255,0.35), 0 3px 10px rgba(0,0,0,0.45)",
                  }}
                  initial={{ scale: 0, rotate: -180 }}
                  whileInView={{ scale: 1, rotate: 0 }}
                  viewport={{ once: true }}
                  transition={{ type: "spring", stiffness: 340, damping: 20, delay: 0.1 }}
                />
                <span className="flex flex-col">
                  <span className="font-display text-xl text-ink">{m.label}</span>
                  <span className="text-[0.74rem] tracking-wide text-gold/80">{WORLD[m.id]}</span>
                </span>
                <span className="ml-auto text-[0.82rem] text-ink-soft">{m.caption}</span>
              </div>
            </InceptionItem>
          ))}
        </InceptionStagger>

        {/* Stone section — flip entrance (back to 3D, different feel from above) */}
        <InceptionReveal mode="flip" delay={0.05} className="mt-24">
          <SplitText as="h2" className="display-3 text-ink">
            A cut for every hand.
          </SplitText>
        </InceptionReveal>

        <InceptionReveal mode="clip" delay={0.1} className="mt-5">
          <p className="text-[1.05rem] leading-relaxed text-ink-soft">
            From the timeless round brilliant to the architectural princess, each
            stone is rendered with the same physically-based shader you see on the
            ring — so the choice always matches the result.
          </p>
        </InceptionReveal>

        {/* Stone items drift from alternating sides — alternating reality */}
        <InceptionStagger delay={0.14} stagger={0.12} className="mt-10 space-y-5">
          {STONES.map((s, i) => (
            <InceptionItem key={s.id} mode="drift" dir={i % 2 === 0 ? "left" : "right"}>
              <div className="flex items-center justify-between border-b border-line pb-5">
                <span className="flex items-center gap-5">
                  <StoneGlyph stone={s.id} className="h-7 w-7 text-gold" />
                  <span className="font-display text-xl text-ink">{s.label}</span>
                </span>
                <span className="text-[0.82rem] text-ink-soft">
                  {s.carat} · {s.caption}
                </span>
              </div>
            </InceptionItem>
          ))}
        </InceptionStagger>
      </div>
    </section>
  );
}
