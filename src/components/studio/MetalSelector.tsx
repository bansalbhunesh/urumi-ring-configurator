"use client";

import { motion } from "framer-motion";
import { METAL_PREMIUM, METALS } from "@/lib/config";
import { nudgeRing, useConfigurator } from "@/store/configurator";
import { playShimmer } from "@/hooks/useSound";

export function MetalSelector() {
  const metal = useConfigurator((s) => s.metal);
  const preview = useConfigurator((s) => s.previewMetal);
  const setMetal = useConfigurator((s) => s.setMetal);
  const setPreview = useConfigurator((s) => s.setPreviewMetal);

  const shown = preview ?? metal;
  const active = METALS.find((m) => m.id === shown);

  return (
    <div>
      <span className="eyebrow">Metal</span>
      <div className="mb-4 mt-1.5 flex items-baseline gap-3">
        <motion.span
          key={active?.label}
          initial={{ opacity: 0, x: -8 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
          className="font-display text-[2.5rem] leading-none tracking-tight text-ink"
        >
          {active?.label}
        </motion.span>
        <motion.span
          key={active?.caption}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-sm text-ink-soft"
        >
          {active?.caption}
        </motion.span>
      </div>
      <div className="atelier-tray flex items-start gap-3 border-y border-line py-3">
        {METALS.map((m) => {
          const selected = m.id === metal;
          const premium = METAL_PREMIUM[m.id];
          return (
            <button
              key={m.id}
              type="button"
              onClick={() => {
                setMetal(m.id);
                nudgeRing("metal");
                playShimmer();
              }}
              onFocus={() => setPreview(m.id)}
              onBlur={() => setPreview(null)}
              onPointerEnter={() => setPreview(m.id)}
              onPointerLeave={() => setPreview(null)}
              aria-pressed={selected}
              aria-label={`${m.label}, ${m.caption}`}
              className="group relative flex min-h-24 min-w-20 flex-col items-center gap-2 outline-none focus-visible:ring-2 focus-visible:ring-gold focus-visible:ring-offset-2 focus-visible:ring-offset-porcelain"
            >
              <span className="relative grid place-items-center">
                <motion.span
                  className="block h-14 w-14 rounded-full"
                  style={{
                    background: `radial-gradient(120% 120% at 30% 25%, ${m.swatch[0]}, ${m.swatch[1]})`,
                    boxShadow: "inset 0 1px 2px rgba(255,255,255,0.6), 0 3px 10px rgba(28,26,23,0.14)",
                  }}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.97 }}
                  transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
                />
                {selected && (
                  <motion.span
                    layoutId="metal-ring"
                    className="pointer-events-none absolute -inset-2 rounded-full border border-gold"
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
              <span className="font-mono text-[0.58rem] uppercase tracking-[0.12em] text-muted">
                {premium === 0 ? "base" : `+$${premium}`}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
