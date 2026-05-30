"use client";

import dynamic from "next/dynamic";
import { motion } from "framer-motion";
import { STONES } from "@/lib/config";
import { useConfigurator } from "@/store/configurator";
import { playPing } from "@/hooks/useSound";

function StoneCutIcon({ stone, selected }: { stone: string; selected: boolean }) {
  const colorClass = selected ? "text-gold" : "text-ink-soft/75 group-hover:text-ink-soft";
  
  if (stone === "round") {
    return (
      <svg viewBox="0 0 100 100" className={`w-10 h-10 ${colorClass} transition-all duration-300`} fill="none" stroke="currentColor" strokeWidth="1.5">
        <circle cx="50" cy="50" r="44" />
        <circle cx="50" cy="50" r="21" />
        <path d="M50 6 L50 29 M50 71 L50 94 M6 50 L29 50 M71 50 L94 50" />
        <path d="M18.9 18.9 L35.1 35.1 M64.9 64.9 L81.1 81.1 M18.9 81.1 L35.1 64.9 M64.9 35.1 L81.1 18.9" />
        <polygon points="50,29 64.9,35.1 71,50 64.9,64.9 50,71 35.1,64.9 29,50 35.1,35.1" />
      </svg>
    );
  }
  
  if (stone === "oval") {
    return (
      <svg viewBox="0 0 100 100" className={`w-10 h-10 ${colorClass} transition-all duration-300`} fill="none" stroke="currentColor" strokeWidth="1.5">
        <rect x="18" y="6" width="64" height="88" rx="32" ry="44" />
        <rect x="34" y="24" width="32" height="52" rx="16" ry="26" />
        <path d="M50 6 L50 24 M50 76 L50 94 M18 50 L34 50 M66 50 L82 50" />
        <path d="M27.4 22 L38.7 33 M72.6 78 L61.3 67 M27.4 78 L38.7 67 M72.6 22 L61.3 33" />
        <path d="M50 24 L61.3 33 M61.3 33 L66 50 M66 50 L61.3 67 M61.3 67 L50 76 M50 76 L38.7 67 M38.7 67 L34 50 M34 50 L38.7 33 M38.7 33 L50 24" />
      </svg>
    );
  }
  
  if (stone === "princess") {
    return (
      <svg viewBox="0 0 100 100" className={`w-10 h-10 ${colorClass} transition-all duration-300`} fill="none" stroke="currentColor" strokeWidth="1.5">
        <rect x="10" y="10" width="80" height="80" />
        <rect x="26.3" y="26.3" width="47.4" height="47.4" transform="rotate(45 50 50)" />
        <path d="M10 10 L32.3 32.3 M67.7 67.7 L90 90 M10 90 L32.3 67.7 M67.7 32.3 L90 10" />
        <path d="M50 10 L50 26.3 M50 73.7 L50 90 M10 50 L26.3 50 M73.7 50 L90 50" />
        <path d="M50 26.3 L26.3 50 M26.3 50 L50 73.7 M50 73.7 L73.7 50 M73.7 50 L50 26.3" />
      </svg>
    );
  }
  
  return null;
}

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
              onClick={() => { setStone(s.id); playPing(); }}
              aria-pressed={selected}
              className="group relative flex flex-col items-center gap-2 rounded-xl border px-3 py-4 outline-none transition-colors"
              style={{
                borderColor: selected ? "var(--color-gold)" : "var(--color-line)",
                background: selected ? "rgba(176,141,87,0.06)" : "var(--color-porcelain)",
              }}
            >
              {selected && (
                <motion.span
                  layoutId="stone-active"
                  className="pointer-events-none absolute inset-0 rounded-xl ring-1 ring-gold/40"
                  transition={{ type: "spring", stiffness: 380, damping: 30 }}
                />
              )}
              <span className="h-11 w-11 flex items-center justify-center">
                <StoneCutIcon stone={s.id} selected={selected} />
              </span>
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

