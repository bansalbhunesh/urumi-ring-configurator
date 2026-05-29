import { Reveal } from "@/components/ui/Reveal";
import { METALS, STONES } from "@/lib/config";
import { StoneGlyph } from "@/components/ui/icons";

export function Materials() {
  return (
    <section id="materials" className="px-6 py-28 sm:px-10 lg:py-40">
      <div className="mx-auto grid max-w-7xl gap-16 lg:grid-cols-2">
        <Reveal>
          <span className="eyebrow">Metals</span>
          <h2 className="font-display mt-4 text-4xl leading-tight sm:text-5xl">
            Three golds, one standard.
          </h2>
          <p className="mt-4 max-w-md text-[0.95rem] leading-relaxed text-ink-soft">
            Each band is cast from solid 18-karat recycled gold and finished to a
            mirror. The colour is yours to choose — the integrity is constant.
          </p>
          <ul className="mt-10 space-y-4">
            {METALS.map((m) => (
              <li
                key={m.id}
                className="flex items-center gap-4 border-b border-line pb-4"
              >
                <span
                  className="h-9 w-9 shrink-0 rounded-full"
                  style={{
                    background: `radial-gradient(120% 120% at 30% 25%, ${m.swatch[0]}, ${m.swatch[1]})`,
                    boxShadow: "0 2px 8px rgba(28,26,23,0.14)",
                  }}
                />
                <span className="font-display text-xl text-ink">{m.label}</span>
                <span className="ml-auto text-sm text-muted">{m.caption}</span>
              </li>
            ))}
          </ul>
        </Reveal>

        <Reveal delay={0.1}>
          <span className="eyebrow">Cuts</span>
          <h2 className="font-display mt-4 text-4xl leading-tight sm:text-5xl">
            A cut for every hand.
          </h2>
          <p className="mt-4 max-w-md text-[0.95rem] leading-relaxed text-ink-soft">
            From the timeless round brilliant to the architectural princess, each
            stone is rendered with the same physically-based shader you see on the
            ring — so the choice always matches the result.
          </p>
          <div className="mt-10 grid grid-cols-3 gap-4">
            {STONES.map((s) => (
              <div
                key={s.id}
                className="flex flex-col items-center gap-3 rounded-xl border border-line bg-porcelain p-6"
              >
                <StoneGlyph stone={s.id} className="h-10 w-10 text-gold" />
                <span className="font-display text-lg text-ink">{s.label}</span>
                <span className="text-[0.72rem] text-muted">{s.carat}</span>
              </div>
            ))}
          </div>
        </Reveal>
      </div>
    </section>
  );
}
