"use client";

import type { StoneId } from "@/lib/types";

function RoundGem({ selected }: { selected: boolean }) {
  const c = selected ? "#b08d57" : "#8a7a6a";
  return (
    <svg width="42" height="42" viewBox="0 0 40 40" fill="none" aria-hidden>
      <circle cx="20" cy="20" r="17" stroke={c} strokeWidth="1.2" />
      <circle cx="20" cy="20" r="9" stroke={c} strokeWidth="1" strokeDasharray="2 2" opacity="0.62" />
      <path d="M20 3v34M3 20h34M7.9 7.9l24.2 24.2M32.1 7.9 7.9 32.1" stroke={c} strokeWidth="0.8" opacity="0.34" />
      <path d="m20 3 9 8 8 9-8 9-9 8-9-8-8-9 8-9 9-8Z" stroke={c} strokeWidth="0.75" opacity="0.42" />
      {selected && <circle cx="20" cy="20" r="17" stroke={c} strokeWidth="1.6" opacity="0.34" />}
    </svg>
  );
}

function OvalGem({ selected, narrow = false }: { selected: boolean; narrow?: boolean }) {
  const c = selected ? "#b08d57" : "#8a7a6a";
  const rx = narrow ? 11 : 17;
  return (
    <svg width="42" height="46" viewBox="0 0 40 44" fill="none" aria-hidden>
      <ellipse cx="20" cy="22" rx={rx} ry="19" stroke={c} strokeWidth="1.2" />
      <ellipse cx="20" cy="22" rx={Math.max(5, rx - 8)} ry="10" stroke={c} strokeWidth="1" strokeDasharray="2 2" opacity="0.62" />
      <path d="M20 3v38M3 22h34M8 9l24 26M32 9 8 35" stroke={c} strokeWidth="0.8" opacity="0.34" />
      <path d="m20 3 8 10 9 9-9 9-8 10-8-10-9-9 9-9 8-10Z" stroke={c} strokeWidth="0.75" opacity="0.42" />
      {selected && <ellipse cx="20" cy="22" rx={rx} ry="19" stroke={c} strokeWidth="1.6" opacity="0.34" />}
    </svg>
  );
}

function PrincessGem({ selected, elongated = false, cutCorners = false }: { selected: boolean; elongated?: boolean; cutCorners?: boolean }) {
  const c = selected ? "#b08d57" : "#8a7a6a";
  const x = elongated ? 8 : 3;
  const y = elongated ? 5 : 3;
  const w = elongated ? 24 : 34;
  const h = elongated ? 30 : 34;
  const inset = cutCorners ? "M11 3h18l8 8v18l-8 8H11l-8-8V11l8-8Z" : undefined;
  return (
    <svg width="42" height="42" viewBox="0 0 40 40" fill="none" aria-hidden>
      {inset ? <path d={inset} stroke={c} strokeWidth="1.2" /> : <rect x={x} y={y} width={w} height={h} stroke={c} strokeWidth="1.2" />}
      <rect x="12" y="12" width="16" height="16" stroke={c} strokeWidth="1" strokeDasharray="2 2" opacity="0.62" />
      <path d="M5 5l30 30M35 5 5 35M4 20h32M20 4v32" stroke={c} strokeWidth="0.8" opacity="0.34" />
      {selected && (inset ? <path d={inset} stroke={c} strokeWidth="1.6" opacity="0.34" /> : <rect x={x} y={y} width={w} height={h} stroke={c} strokeWidth="1.6" opacity="0.34" />)}
    </svg>
  );
}

function PearGem({ selected }: { selected: boolean }) {
  const c = selected ? "#b08d57" : "#8a7a6a";
  return (
    <svg width="42" height="46" viewBox="0 0 40 44" fill="none" aria-hidden>
      <path d="M20 3C11 13 7 21 8 29c1 8 7 12 12 12s11-4 12-12c1-8-3-16-12-26Z" stroke={c} strokeWidth="1.2" />
      <path d="M20 3v38M9 27h22M12 13l16 27M28 13 12 40" stroke={c} strokeWidth="0.8" opacity="0.38" />
      {selected && <path d="M20 3C11 13 7 21 8 29c1 8 7 12 12 12s11-4 12-12c1-8-3-16-12-26Z" stroke={c} strokeWidth="1.6" opacity="0.34" />}
    </svg>
  );
}

function HeartGem({ selected }: { selected: boolean }) {
  const c = selected ? "#b08d57" : "#8a7a6a";
  return (
    <svg width="42" height="42" viewBox="0 0 40 40" fill="none" aria-hidden>
      <path d="M20 34 7.5 21.8C1.5 15.9 5.1 6 13.2 6c3.4 0 5.3 1.7 6.8 4 1.5-2.3 3.4-4 6.8-4 8.1 0 11.7 9.9 5.7 15.8L20 34Z" stroke={c} strokeWidth="1.2" />
      <path d="M20 10v24M8 20h24M11 11l21 21M29 11 8 32" stroke={c} strokeWidth="0.75" opacity="0.34" />
      {selected && <path d="M20 34 7.5 21.8C1.5 15.9 5.1 6 13.2 6c3.4 0 5.3 1.7 6.8 4 1.5-2.3 3.4-4 6.8-4 8.1 0 11.7 9.9 5.7 15.8L20 34Z" stroke={c} strokeWidth="1.6" opacity="0.34" />}
    </svg>
  );
}

const GEMS: Record<StoneId, React.ComponentType<{ selected: boolean }>> = {
  round: RoundGem,
  oval: OvalGem,
  princess: PrincessGem,
  cushion: (props) => <PrincessGem {...props} cutCorners />,
  emerald: (props) => <PrincessGem {...props} elongated />,
  radiant: (props) => <PrincessGem {...props} elongated cutCorners />,
  pear: PearGem,
  marquise: (props) => <OvalGem {...props} narrow />,
  heart: HeartGem,
  asscher: (props) => <PrincessGem {...props} cutCorners />,
};

export function StoneThumb({ stone, selected }: { stone: StoneId; selected: boolean }) {
  const Gem = GEMS[stone];
  return (
    <div
      className={`stone-sample flex h-14 w-14 items-center justify-center transition-opacity duration-300 ${
        selected ? "is-selected" : ""
      }`}
      style={{ opacity: selected ? 1 : 0.68 }}
      aria-hidden
    >
      <Gem selected={selected} />
    </div>
  );
}
