import { Reveal } from "@/components/ui/Reveal";
import { SplitText } from "@/components/ui/SplitText";

const PILLARS = [
  {
    no: "01",
    title: "The Twist",
    body: "Two strands of recycled 18k gold are drawn by hand into a single continuous twist — a quiet symbol of two lives winding into one.",
  },
  {
    no: "02",
    title: "The Stone",
    body: "Every centre diamond is conflict-free and graded for brilliance. Choose the cut that catches your light — round, oval, or princess.",
  },
  {
    no: "03",
    title: "The Promise",
    body: "Made to order in our atelier, finished to a mirror polish, and backed for life. A piece intended to outlast the moment it marks.",
  },
];

export function Craft() {
  return (
    <section id="craft" className="bg-stage-soft px-6 py-28 sm:px-10 lg:py-40">
      <div className="mx-auto max-w-7xl">
        <Reveal>
          <span className="eyebrow">The Craft</span>
        </Reveal>
        <SplitText className="font-display mt-4 max-w-3xl text-4xl leading-tight text-balance sm:text-5xl lg:text-6xl">
          A ring is the smallest thing you will ever wear that means the most.
        </SplitText>

        <div className="mt-20 grid gap-px overflow-hidden rounded-2xl border border-line bg-line md:grid-cols-3">
          {PILLARS.map((p, i) => (
            <Reveal key={p.no} delay={i * 0.1} className="bg-porcelain">
              <div className="flex h-full flex-col p-8 lg:p-10">
                <span className="font-display text-2xl text-gold">{p.no}</span>
                <h3 className="font-display mt-6 text-2xl text-ink">{p.title}</h3>
                <p className="mt-3 text-[0.95rem] leading-relaxed text-ink-soft">
                  {p.body}
                </p>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
