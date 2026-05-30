import { Reveal } from "@/components/ui/Reveal";
import { SplitText } from "@/components/ui/SplitText";

/* Editorial "Atelier" beat. On wide screens the ring rests in the right-hand
   stage rendered by the global canvas, so all copy is held to a left column —
   nothing ever overlaps the product. Below xl the ring steps aside and this
   reads as a centred editorial column. */
export function Craft() {
  return (
    <section
      id="atelier"
      className="relative px-6 py-32 sm:px-10 lg:px-16 lg:py-48"
    >
      <div className="mx-auto max-w-2xl xl:mx-0 xl:max-w-[32rem]">
        <span className="eyebrow">The Atelier</span>
        <SplitText as="h2" className="font-display mt-5 text-balance text-4xl leading-[1.08] sm:text-5xl lg:text-6xl text-ink">
          The smallest thing you will ever wear, and the one that says the most.
        </SplitText>

        <div className="mt-16 space-y-12">
          <Reveal>
            <h3 className="font-display text-2xl text-ink">Two ribbons of gold</h3>
            <p className="mt-4 text-[1.05rem] leading-relaxed text-ink-soft">
              Drawn by hand into a single continuous twist — a quiet symbol of two
              lives winding into one — then finished to a mirror polish that gathers
              the light of whatever room it walks into.
            </p>
          </Reveal>

          <Reveal delay={0.1}>
            <h3 className="font-display text-2xl text-ink">A stone, lifted to the light</h3>
            <p className="mt-4 text-[1.05rem] leading-relaxed text-ink-soft">
              Every centre stone is conflict-free and independently graded for
              brilliance. The twisting shoulders raise it clear of the band so light
              can enter the pavilion from every side.
            </p>
          </Reveal>

          <Reveal delay={0.2}>
            <h3 className="font-display text-2xl text-ink">Made to order, kept for life</h3>
            <p className="mt-4 text-[1.05rem] leading-relaxed text-ink-soft">
              Each ring is built to your configuration in our atelier and guaranteed
              for the life of the setting. Not fast jewellery — a piece meant to
              outlast the moment it marks.
            </p>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
