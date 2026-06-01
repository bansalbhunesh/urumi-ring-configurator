"use client";

import type { StoneId } from "@/lib/types";

/* Stone thumbnails — SVG facet illustrations.
   Replaced Canvas/WebGL to stay within browser's WebGL context budget.
   The page already uses 4 WebGL contexts; 3 more was causing context loss
   and a full React tree crash when switching stones. SVG is also sharper
   at this size (48×56 px) than a transparent WebGL canvas. */

function RoundGem({ selected }: { selected: boolean }) {
  const c = selected ? "#c8a56b" : "#8a7a6a";
  return (
    <svg width="40" height="40" viewBox="0 0 40 40" fill="none" aria-hidden>
      <circle cx="20" cy="20" r="17" stroke={c} strokeWidth="1.2" />
      <circle cx="20" cy="20" r="9" stroke={c} strokeWidth="1" strokeDasharray="2 2" opacity="0.6" />
      <line x1="3" y1="20" x2="37" y2="20" stroke={c} strokeWidth="0.8" opacity="0.4" />
      <line x1="20" y1="3" x2="20" y2="37" stroke={c} strokeWidth="0.8" opacity="0.4" />
      <line x1="7.9" y1="7.9" x2="32.1" y2="32.1" stroke={c} strokeWidth="0.8" opacity="0.3" />
      <line x1="32.1" y1="7.9" x2="7.9" y2="32.1" stroke={c} strokeWidth="0.8" opacity="0.3" />
      {selected && <circle cx="20" cy="20" r="17" stroke={c} strokeWidth="1.6" opacity="0.3" />}
    </svg>
  );
}

function OvalGem({ selected }: { selected: boolean }) {
  const c = selected ? "#c8a56b" : "#8a7a6a";
  return (
    <svg width="40" height="44" viewBox="0 0 40 44" fill="none" aria-hidden>
      <ellipse cx="20" cy="22" rx="17" ry="19" stroke={c} strokeWidth="1.2" />
      <ellipse cx="20" cy="22" rx="9" ry="10" stroke={c} strokeWidth="1" strokeDasharray="2 2" opacity="0.6" />
      <line x1="3" y1="22" x2="37" y2="22" stroke={c} strokeWidth="0.8" opacity="0.4" />
      <line x1="20" y1="3" x2="20" y2="41" stroke={c} strokeWidth="0.8" opacity="0.4" />
      <line x1="8" y1="9" x2="32" y2="35" stroke={c} strokeWidth="0.8" opacity="0.3" />
      <line x1="32" y1="9" x2="8" y2="35" stroke={c} strokeWidth="0.8" opacity="0.3" />
      {selected && <ellipse cx="20" cy="22" rx="17" ry="19" stroke={c} strokeWidth="1.6" opacity="0.3" />}
    </svg>
  );
}

function PrincessGem({ selected }: { selected: boolean }) {
  const c = selected ? "#c8a56b" : "#8a7a6a";
  return (
    <svg width="40" height="40" viewBox="0 0 40 40" fill="none" aria-hidden>
      <rect x="3" y="3" width="34" height="34" stroke={c} strokeWidth="1.2" />
      <rect x="11" y="11" width="18" height="18" stroke={c} strokeWidth="1" strokeDasharray="2 2" opacity="0.6" />
      <line x1="3" y1="3" x2="37" y2="37" stroke={c} strokeWidth="0.8" opacity="0.4" />
      <line x1="37" y1="3" x2="3" y2="37" stroke={c} strokeWidth="0.8" opacity="0.4" />
      <line x1="3" y1="20" x2="37" y2="20" stroke={c} strokeWidth="0.8" opacity="0.3" />
      <line x1="20" y1="3" x2="20" y2="37" stroke={c} strokeWidth="0.8" opacity="0.3" />
      {selected && <rect x="3" y="3" width="34" height="34" stroke={c} strokeWidth="1.6" opacity="0.3" />}
    </svg>
  );
}

const GEMS: Record<StoneId, React.ComponentType<{ selected: boolean }>> = {
  round: RoundGem,
  oval: OvalGem,
  princess: PrincessGem,
};

export function StoneThumb({ stone, selected }: { stone: StoneId; selected: boolean }) {
  const Gem = GEMS[stone];
  return (
    <div
      className="flex h-12 w-14 items-center justify-center transition-opacity duration-300"
      style={{ opacity: selected ? 1 : 0.65 }}
      aria-hidden
    >
      <Gem selected={selected} />
    </div>
  );
}
