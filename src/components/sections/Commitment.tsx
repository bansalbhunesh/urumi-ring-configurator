"use client";

/* ============================================================
   COMMITMENT — animation universe: QUIET STAGGER

   The trust beat. Four promises, stated without theatrics —
   because confidence doesn't shout. Each promise rises a beat
   after the last; a hairline gold rule connects them. This is
   the luxury-ecommerce assurance Do Amore leads with, rendered
   as restraint rather than badges.
   ============================================================ */

import { Reveal, RevealStagger, RevealItem } from "@/components/ui/Reveal";
import { SplitText } from "@/components/ui/SplitText";

type Promise = { title: string; body: string; icon: React.ReactNode };

const S = { fill: "none", stroke: "currentColor", strokeWidth: 1.4, strokeLinecap: "round" as const, strokeLinejoin: "round" as const };

const PROMISES: Promise[] = [
  {
    title: "Resizing for life",
    body: "Fingers change. The ring keeps up — resized free, for as long as you wear it.",
    icon: (
      <svg viewBox="0 0 24 24" {...S}><circle cx="12" cy="12" r="7" /><path d="M12 5v3M12 16v3M5 12h3M16 12h3" /></svg>
    ),
  },
  {
    title: "Lifetime warranty",
    body: "Every ring is protected against manufacturing defects for the life of the piece.",
    icon: (
      <svg viewBox="0 0 24 24" {...S}><path d="M12 3l7 3v5c0 4.5-3 7.5-7 9-4-1.5-7-4.5-7-9V6l7-3z" /><path d="M9 12l2 2 4-4" /></svg>
    ),
  },
  {
    title: "Free insured shipping",
    body: "Shipped free and fully insured, with 60 days to be sure. International for a flat fee.",
    icon: (
      <svg viewBox="0 0 24 24" {...S}><path d="M3 7h11v8H3zM14 10h4l3 3v2h-7z" /><circle cx="7" cy="17" r="1.6" /><circle cx="17.5" cy="17" r="1.6" /></svg>
    ),
  },
  {
    title: "0% financing",
    body: "Pay over time from $80/mo with 0% APR — forever shouldn't wait on a balance.",
    icon: (
      <svg viewBox="0 0 24 24" {...S}><rect x="3" y="6" width="18" height="12" rx="2" /><path d="M3 10h18" /><path d="M7 14h3" /></svg>
    ),
  },
];

export function Commitment() {
  return (
    <section
      id="commitment"
      data-ring="hidden"
      className="relative px-6 py-20 sm:px-10 lg:px-16 lg:py-28"
    >
      <div className="mx-auto max-w-6xl">
        <div className="max-w-2xl">
          <Reveal mode="rise">
            <span className="eyebrow">Our promise to you</span>
          </Reveal>
          <Reveal mode="rise" delay={0.05} className="mt-5">
            <SplitText as="h2" className="display-3 text-ink">
              The part nobody photographs.
            </SplitText>
          </Reveal>
          <Reveal mode="clip" delay={0.12} className="mt-5">
            <p className="text-[1.05rem] leading-relaxed text-ink-soft">
              The ring is the easy part. What surrounds it — the resizing, the
              warranty, the way it arrives — is where care is actually proven.
            </p>
          </Reveal>
        </div>

        <div className="rule-gold mt-10" />

        <RevealStagger delay={0.1} stagger={0.12} className="mt-10 grid gap-x-10 gap-y-10 sm:grid-cols-2 lg:grid-cols-4">
          {PROMISES.map((p) => (
            <RevealItem key={p.title} mode="rise">
              <div className="group">
                <span className="block h-8 w-8 text-gold transition-transform duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:-translate-y-1">
                  {p.icon}
                </span>
                <h3 className="mt-5 font-display text-xl text-ink">{p.title}</h3>
                <p className="mt-2.5 text-[0.92rem] leading-relaxed text-ink-soft">{p.body}</p>
              </div>
            </RevealItem>
          ))}
        </RevealStagger>
      </div>
    </section>
  );
}
