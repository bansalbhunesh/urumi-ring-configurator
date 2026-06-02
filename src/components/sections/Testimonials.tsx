"use client";

import { motion } from "framer-motion";
import { Reveal, RevealStagger, RevealItem } from "@/components/ui/Reveal";
import { SplitText } from "@/components/ui/SplitText";

const REVIEWS = [
  {
    stars: 5,
    quote:
      "I knew the moment I saw the way the two bands twist around each other — that was us. She cried before I even finished asking.",
    name: "Scott & Mara",
    role: "Their ring built a well in Siem Reap",
  },
  {
    stars: 5,
    quote:
      "A week after it shipped, we got the coordinates of our well. Same ring on her hand, clean water on the other side of the world.",
    name: "Hannah D.",
    role: "Their ring built a well in Amhara",
  },
  {
    stars: 5,
    quote:
      "They sent real photos of the diamond before I ever committed — no pressure, just care. It catches the light in a way photos never did justice.",
    name: "Chris W.",
    role: "Their ring built a well in Kampong Thom",
  },
];

const EASE = [0.22, 1, 0.36, 1] as const;

function Stars({ n }: { n: number }) {
  return (
    <div className="flex gap-1" aria-label={`${n} out of 5 stars`}>
      {Array.from({ length: 5 }).map((_, i) => (
        <motion.svg
          key={i}
          width="14" height="14" viewBox="0 0 24 24"
          fill={i < n ? "currentColor" : "none"}
          stroke="currentColor" strokeWidth="1.4"
          className="text-gold"
          aria-hidden
          initial={{ opacity: 0, scale: 0.4 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ delay: i * 0.06, duration: 0.4, ease: EASE }}
        >
          <path d="M12 2.5l2.9 5.9 6.6.95-4.75 4.63 1.12 6.52L12 17.9l-5.9 3.1 1.12-6.52L2.5 9.85l6.6-.95L12 2.5z" strokeLinejoin="round" />
        </motion.svg>
      ))}
    </div>
  );
}

export function Testimonials() {
  return (
    <section id="reviews" data-ring="hidden" className="relative z-10 px-6 py-32 sm:px-10 lg:py-44">
      {/* Warm ambient glow — grounds the section without competing with the cards */}
      <div
        className="pointer-events-none absolute inset-0"
        aria-hidden
        style={{
          background: "radial-gradient(ellipse 70% 50% at 50% 60%, rgba(200,165,107,0.05) 0%, transparent 70%)",
        }}
      />

      <div className="mx-auto max-w-6xl">
        <div className="flex flex-wrap items-end justify-between gap-6">
          <div>
            <Reveal mode="clip">
              <span className="eyebrow">Kept forever</span>
            </Reveal>
            <SplitText as="h2" className="display-3 mt-4 text-ink" mode="push" stagger={0.055} delay={0.1}>
              What they say after the yes.
            </SplitText>
          </div>

          <Reveal mode="rise" dir="right" delay={0.2}>
            <div className="flex items-center gap-3">
              <Stars n={5} />
              <span className="text-[0.8rem] uppercase tracking-[0.16em] text-ink-soft">
                5.0 / 5 · every ring, a well
              </span>
            </div>
          </Reveal>
        </div>

        <RevealStagger delay={0.15} stagger={0.13} className="mt-14 grid gap-6 md:grid-cols-3">
          {REVIEWS.map((r) => (
            <RevealItem key={r.name} mode="rise">
              <motion.figure
                className="group flex h-full flex-col justify-between rounded-2xl border border-line bg-champagne/20 p-7 backdrop-blur-sm transition-colors duration-500 hover:border-gold/30 hover:bg-champagne/35"
                whileHover={{ y: -4, transition: { type: "spring", stiffness: 320, damping: 28 } }}
              >
                <div>
                  <Stars n={r.stars} />
                  <blockquote className="mt-5 font-display text-[1.28rem] leading-snug text-ink">
                    &ldquo;{r.quote}&rdquo;
                  </blockquote>
                </div>
                <figcaption className="mt-8 flex items-center gap-3 border-t border-line/60 pt-5">
                  {/* Gold monogram dot */}
                  <span className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-gold/15 text-[0.75rem] font-semibold text-gold">
                    {r.name.charAt(0)}
                  </span>
                  <div>
                    <div className="text-[0.88rem] font-medium text-ink">{r.name}</div>
                    <div className="text-[0.74rem] italic text-muted">{r.role}</div>
                  </div>
                </figcaption>
              </motion.figure>
            </RevealItem>
          ))}
        </RevealStagger>

        {/* Quiet closing line — bridges toward the finale */}
        <Reveal mode="rise" delay={0.3} className="mt-16 text-center">
          <div className="mx-auto max-w-[6rem]">
            <div className="rule-gold h-px" />
          </div>
          <p className="mt-6 text-[0.8rem] uppercase tracking-[0.28em] text-muted">
            Every story starts with a question
          </p>
        </Reveal>
      </div>
    </section>
  );
}
