"use client";

import { AnimatePresence, motion } from "framer-motion";
import { Reveal } from "@/components/ui/Reveal";
import { SplitText } from "@/components/ui/SplitText";
import { CrystalPanels } from "@/components/sections/CrystalPanels";
import { useConfigurator } from "@/store/configurator";
import { STONE_BY_ID } from "@/lib/config";
import type { StoneId } from "@/lib/types";

/* A live "spec card" that reads the chosen stone — the reference's data-card
   motif, but in honest jewellery language with a little wit. */
const CUT_SPEC: Record<
  StoneId,
  { table: string; cut: string; brilliance: string; note: string }
> = {
  round: {
    table: "57%",
    cut: "Triple Excellent",
    brilliance: "Maximum return of light",
    note: "The most light a diamond can throw. Physics, not flattery.",
  },
  oval: {
    table: "58%",
    cut: "Excellent",
    brilliance: "Elongated, finger-lengthening",
    note: "Reads larger than its carat. We won't tell if you won't.",
  },
  princess: {
    table: "70%",
    cut: "Excellent",
    brilliance: "Sharp, contemporary fire",
    note: "Corners and edges. For people with opinions.",
  },
};

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-baseline justify-between gap-4 border-b border-line/70 py-3">
      <span className="text-[0.72rem] uppercase tracking-[0.16em] text-muted">{label}</span>
      <span className="text-right text-[0.92rem] text-ink">{value}</span>
    </div>
  );
}

export function TheCut() {
  const stone = useConfigurator((s) => s.stone);
  const opt = STONE_BY_ID[stone];
  const spec = CUT_SPEC[stone];

  return (
    <section id="cut" data-ring="stage" data-frame="stone" className="relative overflow-hidden px-6 py-32 sm:px-10 lg:px-16 lg:py-48">
      <CrystalPanels />
      <div className="relative z-10 mx-auto max-w-2xl xl:mx-0 xl:max-w-[36rem]">
        <span className="eyebrow">The personality of the stone</span>
        <SplitText as="h2" className="display-2 mt-5 text-balance text-ink">
          Cut to catch the light.
        </SplitText>

        <Reveal delay={0.15}>
          <p className="mt-6 max-w-md text-[1.05rem] leading-relaxed text-ink-soft">
            A cut isn&apos;t a setting — it&apos;s a character. The round is timeless,
            the oval graceful, the princess confident. Each is conflict-free,
            independently graded, and rendered with the same shader you see on the
            ring, so the spec sheet updates the instant you change your mind.
          </p>
        </Reveal>

        <Reveal delay={0.25}>
          <div className="mt-12 overflow-hidden rounded-2xl border border-line bg-champagne/40 p-7 backdrop-blur-sm">
            <div className="flex items-center justify-between">
              <span className="eyebrow">Specification</span>
              <span className="flex items-center gap-1.5 text-[0.66rem] uppercase tracking-[0.16em] text-ink-soft">
                <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-gold" /> Live
              </span>
            </div>

            <AnimatePresence mode="wait">
              <motion.div
                key={stone}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
              >
                <div className="mt-5 flex items-end justify-between">
                  <div>
                    <div className="font-display text-5xl text-ink">{opt.label}</div>
                    <div className="mt-1 text-[0.82rem] text-ink-soft">{opt.carat} · {opt.caption}</div>
                  </div>
                  <div className="text-right">
                    <div className="font-display text-5xl tabular-nums text-gold">{spec.table}</div>
                    <div className="mt-1 text-[0.66rem] uppercase tracking-[0.16em] text-muted">Table</div>
                  </div>
                </div>

                <div className="mt-6">
                  <Row label="Cut grade" value={spec.cut} />
                  <Row label="Brilliance" value={spec.brilliance} />
                  <Row label="Certification" value="GIA · conflict-free" />
                </div>

                <p className="mt-5 text-[0.8rem] italic leading-relaxed text-muted">
                  {spec.note}
                </p>
              </motion.div>
            </AnimatePresence>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
