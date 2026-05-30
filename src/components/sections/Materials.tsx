import { Reveal } from "@/components/ui/Reveal";
import { SplitText } from "@/components/ui/SplitText";
import { METALS, STONES } from "@/lib/config";
import { StoneGlyph } from "@/components/ui/icons";

export function Materials() {
  return (
    <section id="materials" className="px-6 py-32 sm:px-10 lg:py-48 bg-transparent">
      <div className="mx-auto grid max-w-[1200px] gap-20 lg:grid-cols-2 lg:gap-32">
        <div>
          <SplitText className="font-display text-4xl leading-tight sm:text-5xl text-ink">
            Three golds, one standard.
          </SplitText>
          <Reveal delay={0.2}>
            <p className="mt-6 text-lg leading-relaxed text-ink-soft">
              Each band is cast from solid 18-karat recycled gold and finished to a
              mirror. The colour is yours to choose — the integrity is constant.
            </p>
            <ul className="mt-12 space-y-6">
              {METALS.map((m) => (
                <li
                  key={m.id}
                  className="flex items-center gap-6 border-b border-line pb-6"
                >
                  <span
                    className="h-10 w-10 shrink-0 rounded-full"
                    style={{
                      background: `radial-gradient(120% 120% at 30% 25%, ${m.swatch[0]}, ${m.swatch[1]})`,
                      boxShadow: "0 2px 8px rgba(28,26,23,0.14)",
                    }}
                  />
                  <span className="font-display text-2xl text-ink">{m.label}</span>
                  <span className="ml-auto text-[0.85rem] text-ink-soft">{m.caption}</span>
                </li>
              ))}
            </ul>
          </Reveal>
        </div>

        <div>
          <SplitText delay={0.1} className="font-display text-4xl leading-tight sm:text-5xl text-ink">
            A cut for every hand.
          </SplitText>
          <Reveal delay={0.3}>
            <p className="mt-6 text-lg leading-relaxed text-ink-soft">
              From the timeless round brilliant to the architectural princess, each
              stone is rendered with the same physically-based shader you see on the
              ring — so the choice always matches the result.
            </p>
            <div className="mt-12 flex flex-col gap-6">
              {STONES.map((s) => (
                <div
                  key={s.id}
                  className="group flex items-center justify-between border-b border-line pb-6"
                >
                  <div className="flex items-center gap-6">
                    <StoneGlyph stone={s.id} className="h-8 w-8 text-gold" />
                    <span className="font-display text-2xl text-ink">{s.label}</span>
                  </div>
                  <span className="text-[0.85rem] text-ink-soft">{s.carat}</span>
                </div>
              ))}
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
