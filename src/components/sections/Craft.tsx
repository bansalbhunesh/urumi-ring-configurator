import { Reveal } from "@/components/ui/Reveal";
import { SplitText } from "@/components/ui/SplitText";

export function Craft() {
  return (
    <section id="craft" className="bg-stage-soft px-6 py-32 sm:px-10 lg:py-48">
      <div className="mx-auto max-w-[1200px]">
        {/* Editorial Title Block without the standard eyebrow */}
        <div className="mb-24 lg:mb-32">
          <SplitText className="font-display max-w-4xl text-4xl leading-[1.1] text-balance sm:text-5xl lg:text-[4.5rem]">
            A ring is the smallest thing you will ever wear that means the most.
          </SplitText>
        </div>

        {/* Asymmetrical Layout instead of identical cards */}
        <div className="grid gap-16 lg:grid-cols-12 lg:gap-24">
          
          <div className="lg:col-span-5 lg:col-start-2">
            <Reveal>
              <h3 className="font-display text-3xl text-ink">Two Ribbons of Gold</h3>
              <p className="mt-5 text-lg leading-relaxed text-ink-soft">
                Drawn by hand into a single continuous twist. It is a quiet symbol of two lives winding into one, finished to a mirror polish that catches the ambient light of any room.
              </p>
            </Reveal>
          </div>

          <div className="lg:col-span-5 lg:col-start-7 lg:mt-32">
            <Reveal>
              <h3 className="font-display text-3xl text-ink">The Center Stone</h3>
              <p className="mt-5 text-lg leading-relaxed text-ink-soft">
                Every diamond is conflict-free, independently graded for brilliance, and set by hand. The twist shoulder lifts the stone to allow maximum light to enter the pavilion.
              </p>
            </Reveal>
          </div>

          <div className="lg:col-span-6 lg:col-start-3 lg:mt-16">
            <Reveal>
              <div className="border-l border-gold pl-8">
                <h3 className="font-display text-3xl text-ink">Backed for Life</h3>
                <p className="mt-5 text-lg leading-relaxed text-ink-soft">
                  Made to order in our atelier. This is not just fine jewelry—it is a piece engineered to outlast the moment it marks. We guarantee the structural integrity of the setting for a lifetime.
                </p>
              </div>
            </Reveal>
          </div>

        </div>
      </div>
    </section>
  );
}
