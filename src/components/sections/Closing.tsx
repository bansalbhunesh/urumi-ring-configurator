import { Reveal } from "@/components/ui/Reveal";

export function Closing() {
  return (
    <section className="relative overflow-hidden bg-ink px-6 py-32 text-porcelain sm:px-10 lg:py-44">
      <div className="pointer-events-none absolute inset-0 opacity-60 [background:radial-gradient(80%_60%_at_50%_0%,rgba(201,168,106,0.22),transparent_70%)]" />
      <div className="relative mx-auto max-w-3xl text-center">
        <Reveal>
          <span className="eyebrow">Begin</span>
          <h2 className="font-display mt-6 text-4xl leading-[1.05] text-balance sm:text-6xl">
            Some questions deserve more than words.
          </h2>
          <p className="mx-auto mt-6 max-w-md text-[0.98rem] leading-relaxed text-porcelain/70">
            Configure your Twist above, or speak with an atelier advisor to design
            something entirely your own.
          </p>
          <a
            href="#ring"
            className="mt-10 inline-flex h-13 items-center rounded-full border border-porcelain/30 px-9 py-3.5 text-[0.82rem] uppercase tracking-[0.18em] text-porcelain transition-colors hover:border-gold hover:text-gold"
          >
            Configure your ring
          </a>
        </Reveal>
      </div>
    </section>
  );
}
