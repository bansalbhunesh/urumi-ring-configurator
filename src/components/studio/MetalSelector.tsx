"use client";

import { motion } from "framer-motion";
import { METALS } from "@/lib/config";
import { useConfigurator } from "@/store/configurator";
import { playShimmer } from "@/hooks/useSound";

/* Hover-to-preview: hovering a swatch previews the metal on the live ring
   without committing. Leaving snaps it back. Click commits permanently.
   A UI paradigm they haven't seen on jewelry. */

export function MetalSelector() {
  const metal = useConfigurator((s) => s.metal);
  const preview = useConfigurator((s) => s.previewMetal);
  const setMetal = useConfigurator((s) => s.setMetal);
  const setPreview = useConfigurator((s) => s.setPreviewMetal);

  const shown = preview ?? metal;
  const active = METALS.find((m) => m.id === shown);

  return (
    <div>
      <div className="mb-3 flex items-baseline justify-between">
        <span className="eyebrow">Metal</span>
        <motion.span
          key={active?.caption}
          initial={{ opacity: 0, y: 4 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-sm text-ink-soft"
        >
          {active?.caption}
        </motion.span>
      </div>
      <div className="flex items-center gap-3">
        {METALS.map((m) => {
          const selected = m.id === metal;
          return (
            <button
              key={m.id}
              type="button"
              onClick={() => { setMetal(m.id); playShimmer(); }}
              onFocus={() => setPreview(m.id)}
              onBlur={() => setPreview(null)}
              onPointerEnter={() => setPreview(m.id)}
              onPointerLeave={() => setPreview(null)}
              aria-pressed={selected}
              aria-label={m.label}
              className="group relative flex min-h-16 min-w-16 flex-col items-center gap-2 rounded-lg outline-none focus-visible:ring-2 focus-visible:ring-gold focus-visible:ring-offset-2 focus-visible:ring-offset-porcelain"
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
                {/* Ring indicator stays on the *committed* metal, not the preview */}
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
