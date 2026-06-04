"use client";

/* ============================================================
   FINISH THE LOOK — animation universe: THE PAIR

   Do Amore's "find the perfect band pairing", in our voice. One
   ring asks; the pair keeps. Two band plates rise in, each a
   warm gallery print against the dark — the matching Twist band
   that nests against the engagement ring, and the quiet Mae line
   that steps back for the stone. Restraint over a hard sell.
   ============================================================ */

import { motion } from "framer-motion";
import { Reveal, RevealStagger, RevealItem } from "@/components/ui/Reveal";
import { SplitText } from "@/components/ui/SplitText";

type Band = {
  name: string;
  kind: string;
  price: string;
  body: string;
  image: string;
};

const BANDS: Band[] = [
  {
    name: "The Twist Band",
    kind: "Pavé twist diamond wedding band",
    price: "$1,680",
    body: "The shank's echo — the same double-helix, traced in pavé, made to nest against The Twist as if both were cut from one length of gold.",
    image: "/img/doamore/twist-band-white-gold.jpg",
  },
  {
    name: "The Mae Band",
    kind: "Simple wedding band",
    price: "$1,080",
    body: "A single clean line. It steps back so the centre stone keeps doing the talking — restraint as its own kind of luxury.",
    image: "/img/doamore/mae-band-white-gold.jpg",
  },
];

export function FinishTheLook() {
  return (
    <section
      id="pairing"
      data-ring="hidden"
      className="relative px-6 py-24 sm:px-10 lg:px-16 lg:py-32"
    >
      <div className="mx-auto max-w-6xl">
        <div className="max-w-2xl">
          <Reveal mode="rise">
            <span className="eyebrow">Finish the look</span>
          </Reveal>
          <Reveal mode="rise" delay={0.05} className="mt-5">
            <SplitText as="h2" className="display-3 text-balance text-ink">
              One ring asks. The pair keeps.
            </SplitText>
          </Reveal>
          <Reveal mode="clip" delay={0.12} className="mt-5">
            <p className="text-[1.05rem] leading-relaxed text-ink-soft">
              Each band is made to sit flush against The Twist — chosen, like
              everything here, to be kept rather than replaced.
            </p>
          </Reveal>
        </div>

        <RevealStagger delay={0.15} stagger={0.16} className="mt-12 grid gap-8 md:grid-cols-2">
          {BANDS.map((b) => (
            <RevealItem key={b.name} mode="rise">
              <article className="group flex h-full flex-col">
                {/* Warm gallery plate — the band photo is on white, framed as a print */}
                <div
                  className="relative overflow-hidden rounded-[2px] p-5"
                  style={{
                    background: "linear-gradient(160deg, #f3ead9 0%, #e7d8c0 100%)",
                    boxShadow:
                      "0 40px 90px -44px rgba(0,0,0,0.85), inset 0 0 0 1px rgba(190,150,80,0.32)",
                  }}
                >
                  <motion.div
                    initial={{ scale: 1.05 }}
                    whileInView={{ scale: 1 }}
                    viewport={{ once: true, margin: "-60px" }}
                    transition={{ duration: 1.5, ease: [0.16, 1, 0.3, 1] }}
                    className="aspect-[16/10]"
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={b.image}
                      alt={`${b.name} — ${b.kind}`}
                      className="h-full w-full object-contain transition-transform duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:scale-[1.04]"
                      loading="lazy"
                    />
                  </motion.div>
                </div>

                <div className="mt-6 flex items-baseline justify-between gap-4">
                  <h3 className="font-display text-2xl text-ink">{b.name}</h3>
                  <span className="eyebrow shrink-0 !text-gold">{b.price}</span>
                </div>
                <p className="mt-1 text-[0.78rem] uppercase tracking-[0.16em] text-muted">
                  {b.kind}
                </p>
                <p className="mt-4 max-w-md text-[0.96rem] leading-relaxed text-ink-soft">
                  {b.body}
                </p>
              </article>
            </RevealItem>
          ))}
        </RevealStagger>
      </div>
    </section>
  );
}
