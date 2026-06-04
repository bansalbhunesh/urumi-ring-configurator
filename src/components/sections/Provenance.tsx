"use client";

import { motion } from "framer-motion";
import { Reveal, RevealStagger, RevealItem } from "@/components/ui/Reveal";
import { SplitText } from "@/components/ui/SplitText";

const SPECS: { k: string; v: string }[] = [
  { k: "Metal", v: "18k recycled gold, independently certified" },
  { k: "Setting", v: "Twist solitaire with four-prong basket" },
  { k: "Shoulder", v: "One polished strand, one pave strand" },
  { k: "Diamonds", v: "Round brilliant center with side stones" },
  { k: "Profile", v: "Slim split shank with comfort-fit interior" },
  { k: "Configurator", v: "Variation, price, SKU, and cart stay synchronized" },
];

export function Provenance() {
  return (
    <section
      id="provenance"
      data-ring="hidden"
      className="relative overflow-hidden px-6 py-24 sm:px-10 lg:px-16 lg:py-32"
    >
      <div className="mx-auto grid max-w-6xl items-center gap-14 lg:grid-cols-2 lg:gap-20">
        <Reveal mode="rise" className="order-2 lg:order-1">
          <div className="relative mx-auto aspect-square w-full max-w-md">
            <motion.div
              className="group relative h-full w-full overflow-hidden border border-line bg-porcelain p-4 shadow-soft"
              initial={{ scale: 1.02 }}
              whileInView={{ scale: 1 }}
              viewport={{ once: true, margin: "-80px" }}
              transition={{ duration: 1.1, ease: [0.16, 1, 0.3, 1] }}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="/img/doamore/twist-round-white-gold.jpg"
                alt="The Twist engagement ring in white gold, front view"
                className="h-full w-full object-contain transition-opacity duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:opacity-0"
                loading="lazy"
              />
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="/img/doamore/twist-round-white-gold-angle.jpg"
                alt="The Twist engagement ring in white gold, three-quarter view"
                className="absolute inset-4 h-[calc(100%-2rem)] w-[calc(100%-2rem)] object-contain opacity-0 transition-opacity duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:opacity-100"
                loading="eager"
                aria-hidden
              />
              <span className="absolute bottom-3 left-4 z-10 font-mono text-[0.6rem] uppercase tracking-[0.2em] text-paper-ink/45">
                Plate 01 / The Twist
                <span className="ml-2 opacity-0 transition-opacity duration-500 group-hover:opacity-100">
                  / three-quarter
                </span>
              </span>
            </motion.div>
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

        <div className="order-1 lg:order-2">
          <Reveal mode="rise">
            <span className="eyebrow">Spec ledger</span>
          </Reveal>

          <Reveal mode="rise" delay={0.05} className="mt-5">
            <SplitText as="h2" className="display-3 text-ink">
              The product page should feel traceable.
            </SplitText>
          </Reveal>

          <Reveal mode="clip" delay={0.12} className="mt-6">
            <p className="max-w-md text-[1.05rem] leading-relaxed text-ink-soft">
              The visual system borrows from a jeweler&apos;s bench: plates, crop
              marks, hairline rules, and close inspection. The emotion comes
              from confidence in the object, not from decorative noise.
            </p>
          </Reveal>

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
