"use client";

import { motion } from "framer-motion";
import { STONES } from "@/lib/config";
import { useConfigurator } from "@/store/configurator";
import { StoneGlyph } from "@/components/ui/icons";

export function StoneSelector() {
  const stone = useConfigurator((s) => s.stone);
  const setStone = useConfigurator((s) => s.setStone);
  const active = STONES.find((s) => s.id === stone);

  return (
    <div>
      <div className="mb-3 flex items-baseline justify-between">
        <span className="eyebrow">Centre Stone</span>
        <span className="text-sm text-ink-soft">
          {active?.carat} · {active?.caption}
        </span>
      </div>
      <div className="grid grid-cols-3 gap-2.5">
        {STONES.map((s) => {
          const selected = s.id === stone;
          return (
            <button
              key={s.id}
              type="button"
              onClick={() => setStone(s.id)}
              aria-pressed={selected}
              className="group relative flex flex-col items-center gap-2 rounded-xl border px-3 py-4 outline-none transition-colors"
              style={{
                borderColor: selected ? "var(--color-gold)" : "var(--color-line)",
                background: selected
                  ? "rgba(176,141,87,0.06)"
                  : "var(--color-porcelain)",
              }}
            >
              {selected && (
                <motion.span
                  layoutId="stone-active"
                  className="pointer-events-none absolute inset-0 rounded-xl ring-1 ring-gold/40"
                  transition={{ type: "spring", stiffness: 380, damping: 30 }}
                />
              )}
              <StoneGlyph
                stone={s.id}
                className={`h-9 w-9 transition-colors ${
                  selected ? "text-gold" : "text-ink-soft group-hover:text-ink"
                }`}
              />
              <span
                className={`text-[0.78rem] transition-colors ${
                  selected ? "text-ink" : "text-muted group-hover:text-ink-soft"
                }`}
              >
                {s.label}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
