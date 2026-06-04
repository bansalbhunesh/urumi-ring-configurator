"use client";

import { motion } from "framer-motion";
import { STONE_PREMIUM, STONES } from "@/lib/config";
import { nudgeRing, useConfigurator } from "@/store/configurator";
import { playPing } from "@/hooks/useSound";
import { StoneThumb } from "./StoneThumb";

export function StoneSelector() {
  const stone = useConfigurator((s) => s.stone);
  const setStone = useConfigurator((s) => s.setStone);
  const active = STONES.find((s) => s.id === stone);

  return (
    <div>
      <div className="mb-3 flex items-baseline justify-between gap-4">
        <span className="eyebrow">Center Stone</span>
        <span className="text-right text-sm text-ink-soft">
          {active?.carat} / {active?.caption}
        </span>
      </div>
      <div className="atelier-tray grid grid-cols-3 gap-2.5 border-y border-line py-3">
        {STONES.map((s) => {
          const selected = s.id === stone;
          const premium = STONE_PREMIUM[s.id];
          return (
            <button
              key={s.id}
              type="button"
              onClick={() => {
                setStone(s.id);
                nudgeRing("stone");
                playPing();
              }}
              aria-pressed={selected}
              aria-label={`${s.label} center stone, ${s.carat}, ${s.caption}`}
              className="group relative flex min-h-[8.6rem] flex-col items-center justify-between border px-3 py-4 outline-none transition-colors hover:border-gold/70 hover:bg-porcelain focus-visible:ring-2 focus-visible:ring-gold focus-visible:ring-offset-2 focus-visible:ring-offset-porcelain"
              style={{
                borderColor: selected ? "var(--color-gold)" : "var(--color-line)",
                background: selected ? "rgba(176,141,87,0.06)" : "var(--color-porcelain)",
              }}
            >
              {selected && (
                <motion.span
                  layoutId="stone-active"
                  className="pointer-events-none absolute inset-0 ring-1 ring-gold/40"
                  transition={{ type: "spring", stiffness: 380, damping: 30 }}
                />
              )}
              <div className="grid min-h-14 place-items-center">
                <StoneThumb stone={s.id} selected={selected} />
              </div>
              <span className="flex flex-col items-center gap-1 text-center">
                <span
                  className={`text-[0.78rem] transition-colors ${
                    selected ? "text-ink" : "text-muted group-hover:text-ink-soft"
                  }`}
                >
                  {s.label}
                </span>
                <span className="font-mono text-[0.58rem] uppercase tracking-[0.12em] text-muted">
                  {s.carat}
                </span>
                <span className="text-[0.62rem] uppercase tracking-[0.12em] text-muted">
                  {premium === 0 ? "base" : `+$${premium}`}
                </span>
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
