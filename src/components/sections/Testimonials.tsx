import { Reveal } from "@/components/ui/Reveal";
import { SplitText } from "@/components/ui/SplitText";

const REVIEWS = [
  {
    stars: 5,
    quote: "She said yes before I finished the sentence. The ring did half the talking.",
    name: "Daniel R.",
    role: "Asked in the rain, anyway",
  },
  {
    stars: 5,
    quote: "I've caught myself staring at my own hand in meetings. Productivity down, joy up.",
    name: "Priya M.",
    role: "Newly, gloriously engaged",
  },
  {
    stars: 5,
    quote: "Configured it at 2am, three times, until it was exactly her. Worth every minute.",
    name: "Marcus T.",
    role: "Reformed perfectionist",
  },
];

function Stars({ n }: { n: number }) {
  return (
    <div className="flex gap-1" aria-label={`${n} out of 5 stars`}>
      {Array.from({ length: 5 }).map((_, i) => (
        <svg key={i} width="14" height="14" viewBox="0 0 24 24" fill={i < n ? "currentColor" : "none"} stroke="currentColor" strokeWidth="1.4" className="text-gold" aria-hidden>
          <path d="M12 2.5l2.9 5.9 6.6.95-4.75 4.63 1.12 6.52L12 17.9l-5.9 3.1 1.12-6.52L2.5 9.85l6.6-.95L12 2.5z" strokeLinejoin="round" />
        </svg>
      ))}
    </div>
  );
}

export function Testimonials() {
  return (
    <section id="reviews" data-ring="hidden" className="relative z-10 px-6 py-32 sm:px-10 lg:py-44">
      <div className="mx-auto max-w-6xl">
        <div className="flex flex-wrap items-end justify-between gap-6">
          <div>
            <span className="eyebrow">Kept forever</span>
            <SplitText as="h2" className="display-3 mt-4 text-ink">
              What they say after the yes.
            </SplitText>
          </div>
          <div className="flex items-center gap-3">
            <Stars n={5} />
            <span className="text-[0.8rem] uppercase tracking-[0.16em] text-ink-soft">4.9 / 5 · 1,400+ reviews</span>
          </div>
        </div>

        <div className="mt-14 grid gap-6 md:grid-cols-3">
          {REVIEWS.map((r, i) => (
            <Reveal key={r.name} delay={i * 0.08}>
              <figure className="flex h-full flex-col justify-between rounded-2xl border border-line bg-champagne/30 p-7 backdrop-blur-sm">
                <div>
                  <Stars n={r.stars} />
                  <blockquote className="mt-5 font-display text-[1.35rem] leading-snug text-ink">
                    “{r.quote}”
                  </blockquote>
                </div>
                <figcaption className="mt-8">
                  <div className="text-[0.92rem] text-ink">{r.name}</div>
                  <div className="text-[0.78rem] text-muted">{r.role}</div>
                </figcaption>
              </figure>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
