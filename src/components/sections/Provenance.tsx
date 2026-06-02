"use client";

/* ============================================================
   PROVENANCE — animation universe: PRECISION REVEAL

   Where the ring comes from, and why that matters. Do Amore's
   credibility substance (recycled certified gold, spec truth,
   the wooden box) rendered in our dark studio world.

   The product still sits in a soft pool of light on the left;
   the spec column draws itself in line by line on the right,
   like an inspector's report being typed. The metaphor of the
   twist — two paths interwoven — is stated plainly, once.
   ============================================================ */

import { motion } from "framer-motion";
import { Reveal, RevealStagger, RevealItem } from "@/components/ui/Reveal";
import { SplitText } from "@/components/ui/SplitText";

const SPECS: { k: string; v: string }[] = [
  { k: "Metal", v: "18k recycled gold · independently certified" },
  { k: "Setting", v: "Pavé twist · four-claw basket" },
  { k: "Diamonds", v: "28 stones · 0.10 ctw · VS clarity" },
  { k: "Profile", v: "2.0 mm height · 2.2 mm width" },
  { k: "Fit", v: "Comfort-fit · resizeable for life" },
  { k: "Arrives in", v: "A box of sustainably harvested beech" },
];

export function Provenance() {
  return (
    <section
      id="provenance"
      data-ring="hidden"
      className="relative overflow-hidden px-6 py-32 sm:px-10 lg:px-16 lg:py-48"
    >
      <div className="mx-auto grid max-w-6xl items-center gap-14 lg:grid-cols-2 lg:gap-20">
        {/* Product in a pool of light */}
        <Reveal mode="rise" className="order-2 lg:order-1">
          <div className="relative mx-auto aspect-square w-full max-w-md">
            {/* soft warm pool behind the ring */}
            <div
              className="absolute inset-0 -z-10 blur-2xl"
              style={{
                background:
                  "radial-gradient(circle at 50% 45%, rgba(190,150,80,0.35), transparent 62%)",
              }}
              aria-hidden
            />
            <motion.div
              className="relative h-full w-full overflow-hidden rounded-[2px] p-4"
              style={{
                // A warm studio plate — the photograph is on white, so we frame
                // it as a deliberate gallery print rather than fighting it.
                background:
                  "linear-gradient(160deg, #f3ead9 0%, #e7d8c0 100%)",
                boxShadow:
                  "0 40px 90px -40px rgba(0,0,0,0.85), inset 0 0 0 1px rgba(190,150,80,0.35)",
              }}
              initial={{ scale: 1.04 }}
              whileInView={{ scale: 1 }}
              viewport={{ once: true, margin: "-80px" }}
              transition={{ duration: 1.6, ease: [0.16, 1, 0.3, 1] }}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="/img/doamore/twist-round-white-gold.jpg"
                alt="The Twist engagement ring — recycled white gold, pavé twist band"
                className="h-full w-full object-contain"
                loading="lazy"
              />
              <span className="absolute bottom-3 left-4 font-mono text-[0.6rem] uppercase tracking-[0.2em] text-paper-ink/45">
                Plate 01 · The Twist
              </span>
            </motion.div>
            {/* hairline frame corners — the inspector's crop marks */}
            {[
              "left-0 top-0 border-l border-t",
              "right-0 top-0 border-r border-t",
              "left-0 bottom-0 border-l border-b",
              "right-0 bottom-0 border-r border-b",
            ].map((pos) => (
              <span
                key={pos}
                className={`pointer-events-none absolute h-6 w-6 border-gold/50 ${pos}`}
                aria-hidden
              />
            ))}
          </div>
        </Reveal>

        {/* The narrative + spec ledger */}
        <div className="order-1 lg:order-2">
          <Reveal mode="rise">
            <span className="eyebrow">Origin &amp; craftsmanship</span>
          </Reveal>

          <Reveal mode="rise" delay={0.05} className="mt-5">
            <SplitText as="h2" className="display-3 text-ink">
              Made to be traced back.
            </SplitText>
          </Reveal>

          <Reveal mode="clip" delay={0.12} className="mt-6">
            <p className="max-w-md text-[1.05rem] leading-relaxed text-ink-soft">
              Two bands drawn from the same vine — one set with pavé, one left as
              pure metal — wound together until they read as one. The gold is{" "}
              <span className="text-ink">100% recycled</span> and independently
              certified, so the only thing this ring costs the earth is the
              patience it took to make.
            </p>
          </Reveal>

          {/* Spec ledger — draws in line by line */}
          <RevealStagger delay={0.2} stagger={0.09} className="mt-10 max-w-md">
            {SPECS.map((s) => (
              <RevealItem key={s.k} mode="clip">
                <div className="flex items-baseline justify-between gap-6 border-b border-line py-3.5">
                  <span className="shrink-0 font-mono text-[0.7rem] uppercase tracking-[0.18em] text-gold/80">
                    {s.k}
                  </span>
                  <span className="text-right text-[0.92rem] text-ink-soft">{s.v}</span>
                </div>
              </RevealItem>
            ))}
          </RevealStagger>
        </div>
      </div>
    </section>
  );
}
