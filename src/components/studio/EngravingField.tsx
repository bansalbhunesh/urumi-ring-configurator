"use client";

import { motion } from "framer-motion";
import { useConfigurator } from "@/store/configurator";

/* ============================================================
   ENGRAVING — "make it yours"

   The README held the inner-band engraving back to avoid a half
   promise (the 3D CanvasTexture on the shank). Here it is the
   verifiable way: a live SVG of the band's inner curve, the
   words following the arc, recessed like real engraving — so the
   shopper sees the secret message take shape as they type. The
   words only the two of them will ever read.
   ============================================================ */

const SIZES = [4.5, 5, 5.5, 6, 6.5, 7, 7.5, 8, 9] as const;
const PLACEHOLDER = "Forever, & a day";

export function EngravingField() {
  const engraving = useConfigurator((s) => s.engraving);
  const setEngraving = useConfigurator((s) => s.setEngraving);
  const size = useConfigurator((s) => s.size);
  const setSize = useConfigurator((s) => s.setSize);

  const shown = engraving || PLACEHOLDER;
  const isPlaceholder = engraving.length === 0;

  return (
    <div>
      <div className="flex items-baseline justify-between">
        <span className="eyebrow">Make it yours</span>
        <span className="text-[0.72rem] tabular-nums text-muted">{engraving.length}/24</span>
      </div>

      {/* Inside-the-band preview — the words follow the inner curve */}
      <div className="mt-4 overflow-hidden rounded-xl border border-line bg-porcelain/40 px-4 pb-2 pt-4">
        <svg viewBox="0 0 420 150" className="h-auto w-full" role="img" aria-label={`Engraving preview: ${shown}`}>
          <defs>
            <linearGradient id="bandGold" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0" stopColor="#7a6033" />
              <stop offset="0.5" stopColor="#d8b873" />
              <stop offset="1" stopColor="#7a6033" />
            </linearGradient>
            {/* the engraving arc — inner curve of the band */}
            <path id="engraveArc" d="M 50 60 Q 210 150 370 60" fill="none" />
          </defs>

          {/* polished band surface */}
          <path d="M 38 52 Q 210 156 382 52" fill="none" stroke="url(#bandGold)" strokeWidth="34" strokeLinecap="round" opacity="0.92" />
          {/* top highlight on the metal */}
          <path d="M 40 46 Q 210 146 380 46" fill="none" stroke="#fff4dc" strokeWidth="2" strokeLinecap="round" opacity="0.35" />

          {/* recessed engraving: a dark cut + a faint light lip below for depth */}
          <text fontSize="19" letterSpacing="2.5" fontFamily="var(--font-display), Georgia, serif" fontStyle="italic">
            <textPath href="#engraveArc" startOffset="50%" textAnchor="middle" fill="rgba(40,26,12,0.55)">
              {shown}
            </textPath>
          </text>
          <text fontSize="19" letterSpacing="2.5" fontFamily="var(--font-display), Georgia, serif" fontStyle="italic" transform="translate(0,1)">
            <textPath href="#engraveArc" startOffset="50%" textAnchor="middle" fill="rgba(255,244,220,0.25)" opacity={isPlaceholder ? 0 : 1}>
              {shown}
            </textPath>
          </text>
        </svg>
        <p className="-mt-1 text-center text-[0.62rem] uppercase tracking-[0.24em] text-muted">
          Engraved inside the band
        </p>
      </div>

      {/* the words */}
      <div className="relative mt-4">
        <input
          type="text"
          value={engraving}
          onChange={(e) => setEngraving(e.target.value)}
          maxLength={24}
          placeholder={`e.g. “${PLACEHOLDER}”`}
          aria-label="Inner-band engraving"
          className="w-full border-b border-line bg-transparent pb-2 font-display text-lg text-ink placeholder:text-muted/70 focus:border-gold focus:outline-none"
        />
        {engraving.length > 0 && (
          <motion.button
            type="button"
            onClick={() => setEngraving("")}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="absolute right-0 top-1 text-[0.7rem] uppercase tracking-[0.16em] text-muted hover:text-ink"
          >
            Clear
          </motion.button>
        )}
      </div>

      {/* size */}
      <div className="mt-8">
        <div className="flex items-baseline justify-between">
          <span className="eyebrow">Ring size</span>
          <span className="text-[0.78rem] text-ink-soft">US {size}</span>
        </div>
        <div className="mt-3 flex flex-wrap gap-2">
          {SIZES.map((s) => {
            const active = s === size;
            return (
              <button
                key={s}
                type="button"
                onClick={() => setSize(s)}
                aria-pressed={active}
                aria-label={`US ring size ${s}`}
                className="min-h-9 min-w-11 rounded-full border px-3 text-[0.82rem] tabular-nums outline-none transition-colors focus-visible:ring-2 focus-visible:ring-gold"
                style={{
                  borderColor: active ? "var(--color-gold)" : "var(--color-line)",
                  background: active ? "rgba(176,141,87,0.10)" : "transparent",
                  color: active ? "var(--color-ink)" : "var(--color-ink-soft)",
                }}
              >
                {s}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
