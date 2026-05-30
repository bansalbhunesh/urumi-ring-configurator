import { Reveal } from "@/components/ui/Reveal";
import { SplitText } from "@/components/ui/SplitText";

/* The flip. The whole frame goes to cream — a palette-cleansing beat, like the
   reference's light section. The ring steps aside (data-ring="hidden"). */
export function PromiseSection() {
  return (
    <section
      id="promise"
      data-ring="hidden"
      className="paper relative z-10 flex min-h-[80svh] flex-col items-center justify-center px-6 py-40 text-center sm:px-10 lg:py-56"
    >
      <span className="eyebrow">The promise</span>
      <SplitText
        as="h2"
        className="display-1 mt-7 max-w-[14ch] justify-center text-balance"
      >
        A ring is a promise you can hold.
      </SplitText>
      <Reveal delay={0.2}>
        <p className="mx-auto mt-8 max-w-md text-[1.05rem] leading-relaxed text-paper-ink/70">
          Not an algorithm. Not a subscription. One object, made once, meant to
          outlast every phone you will ever own.
        </p>
      </Reveal>
    </section>
  );
}
