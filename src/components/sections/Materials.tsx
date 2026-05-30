import { Reveal } from "@/components/ui/Reveal";
import { SplitText } from "@/components/ui/SplitText";
import { METALS, STONES } from "@/lib/config";
import { StoneGlyph } from "@/components/ui/icons";

export function Materials() {
  return (
    <section
      id="materials"
      className="relative px-6 py-32 sm:px-10 lg:px-16 lg:py-48"
    >
      <div className="mx-auto max-w-2xl xl:mx-0 xl:max-w-[32rem]">
        <span className="eyebrow">Materials</span>
        <SplitText as="h2" className="display-3 mt-5 text-ink">
          Three golds, one standard.
        </SplitText>
        <Reveal delay={0.15}>
          <p className="mt-5 text-[1.05rem] leading-relaxed text-ink-soft">
            Every band is cast from solid 18-karat recycled gold and finished to a
            mirror. The colour is yours to choose — the integrity never changes.
          </p>
          <ul className="mt-10 space-y-5">
            {METALS.map((m) => (
              <li
                key={m.id}
                className="flex items-center gap-5 border-b border-line pb-5"
              >
                <span
                  className="h-9 w-9 shrink-0 rounded-full"
                  style={{
                    background: `radial-gradient(120% 120% at 30% 25%, ${m.swatch[0]}, ${m.swatch[1]})`,
                    boxShadow: "inset 0 1px 2px rgba(255,255,255,0.35), 0 3px 10px rgba(0,0,0,0.45)",
                  }}
                />
                <span className="font-display text-xl text-ink">{m.label}</span>
                <span className="ml-auto text-[0.82rem] text-ink-soft">{m.caption}</span>
              </li>
            ))}
          </ul>
        </Reveal>

        <SplitText as="h2" delay={0.1} className="display-3 mt-24 text-ink">
          A cut for every hand.
        </SplitText>
        <Reveal delay={0.15}>
          <p className="mt-5 text-[1.05rem] leading-relaxed text-ink-soft">
            From the timeless round brilliant to the architectural princess, each
            stone is rendered with the same physically-based shader you see on the
            ring — so the choice always matches the result.
          </p>
          <ul className="mt-10 space-y-5">
            {STONES.map((s) => (
              <li
                key={s.id}
                className="flex items-center justify-between border-b border-line pb-5"
              >
                <span className="flex items-center gap-5">
                  <StoneGlyph stone={s.id} className="h-7 w-7 text-gold" />
                  <span className="font-display text-xl text-ink">{s.label}</span>
                </span>
                <span className="text-[0.82rem] text-ink-soft">
                  {s.carat} · {s.caption}
                </span>
              </li>
            ))}
          </ul>
        </Reveal>
      </div>
    </section>
  );
}
