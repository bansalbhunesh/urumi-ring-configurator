"use client";

import { motion } from "framer-motion";
import { METALS } from "@/lib/config";
import { useConfigurator } from "@/store/configurator";

export function MetalSelector() {
  const metal = useConfigurator((s) => s.metal);
  const setMetal = useConfigurator((s) => s.setMetal);
  const active = METALS.find((m) => m.id === metal);

  return (
    <div>
      <div className="mb-3 flex items-baseline justify-between">
        <span className="eyebrow">Metal</span>
        <span className="text-sm text-ink-soft">{active?.caption}</span>
      </div>
      <div className="flex items-center gap-3">
        {METALS.map((m) => {
          const selected = m.id === metal;
          return (
            <button
              key={m.id}
              type="button"
              onClick={() => setMetal(m.id)}
              aria-pressed={selected}
              aria-label={m.label}
              className="group relative flex flex-col items-center gap-2 outline-none"
            >
              <span className="relative grid place-items-center">
                <motion.span
                  className="block h-11 w-11 rounded-full"
                  style={{
                    background: `radial-gradient(120% 120% at 30% 25%, ${m.swatch[0]}, ${m.swatch[1]})`,
                    boxShadow: "inset 0 1px 2px rgba(255,255,255,0.6), 0 3px 10px rgba(28,26,23,0.14)",
                  }}
                  whileHover={{ scale: 1.08 }}
                  whileTap={{ scale: 0.95 }}
                  transition={{ type: "spring", stiffness: 400, damping: 22 }}
                />
                {selected && (
                  <motion.span
                    layoutId="metal-ring"
                    className="pointer-events-none absolute -inset-1.5 rounded-full border border-gold"
                    transition={{ type: "spring", stiffness: 380, damping: 30 }}
                  />
                )}
              </span>
              <span
                className={`text-[0.72rem] tracking-wide transition-colors ${
                  selected ? "text-ink" : "text-muted group-hover:text-ink-soft"
                }`}
              >
                {m.label}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
