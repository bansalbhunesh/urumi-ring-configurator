"use client";

import type { StoneId } from "@/lib/types";

/* ----------------------------------------------------------------------------
   Faceted gem glyph (SVG).

   One crisp, scalable diamond per cut — silhouette, table and crown facets —
   drawn from the same outline language as the 3D stones. Rendered as flat vector
   art instead of ten separate WebGL canvases: same "little floating jewel" feel,
   a fraction of the cost, and no risk of exhausting GL contexts.
---------------------------------------------------------------------------- */

type Pt = [number, number];

function ellipse(rx: number, ry: number, n = 16): Pt[] {
  return Array.from({ length: n }, (_, i) => {
    const a = (i / n) * Math.PI * 2 - Math.PI / 2;
    return [Math.cos(a) * rx, Math.sin(a) * ry];
  });
}

function cutCorner(rx: number, ry: number, cut: number): Pt[] {
  const cx = rx * cut;
  const cy = ry * cut;
  return [
    [-rx + cx, -ry],
    [rx - cx, -ry],
    [rx, -ry + cy],
    [rx, ry - cy],
    [rx - cx, ry],
    [-rx + cx, ry],
    [-rx, ry - cy],
    [-rx, -ry + cy],
  ];
}

function cushion(rx: number, ry: number, n = 16): Pt[] {
  return Array.from({ length: n }, (_, i) => {
    const a = (i / n) * Math.PI * 2 - Math.PI / 2;
    const c = Math.cos(a);
    const s = Math.sin(a);
    const p = 0.62;
    return [Math.sign(c) * Math.abs(c) ** p * rx, Math.sign(s) * Math.abs(s) ** p * ry];
  });
}

const OUTLINES: Record<StoneId, Pt[]> = {
  round: ellipse(44, 44, 16),
  oval: ellipse(31, 45, 16),
  princess: cutCorner(40, 40, 0.06),
  cushion: cushion(42, 42, 16),
  emerald: cutCorner(30, 45, 0.26),
  radiant: cutCorner(33, 44, 0.2),
  asscher: cutCorner(40, 40, 0.3),
  pear: [
    [0, -46],
    [13, -32],
    [23, -12],
    [25, 10],
    [18, 30],
    [0, 44],
    [-18, 30],
    [-25, 10],
    [-23, -12],
    [-13, -32],
  ],
  marquise: [
    [0, -46],
    [11, -28],
    [16, 0],
    [11, 28],
    [0, 46],
    [-11, 28],
    [-16, 0],
    [-11, -28],
  ],
  heart: [
    [0, -30],
    [14, -44],
    [30, -40],
    [38, -22],
    [30, 2],
    [12, 26],
    [0, 44],
    [-12, 26],
    [-30, 2],
    [-38, -22],
    [-30, -40],
    [-14, -44],
  ],
};

function toPath(points: Pt[], k = 1): string {
  return points.map(([x, y], i) => `${i === 0 ? "M" : "L"}${(50 + x * k).toFixed(1)} ${(50 + y * k).toFixed(1)}`).join(" ") + " Z";
}

export function StoneGlyph({ stone, selected }: { stone: StoneId; selected: boolean }) {
  const outline = OUTLINES[stone];
  const table = outline.map(([x, y]) => [x * 0.52, y * 0.52] as Pt);
  const gid = `gem-${stone}`;

  return (
    <svg
      viewBox="0 0 100 100"
      className="h-full w-full"
      aria-hidden
      style={{ filter: selected ? "drop-shadow(0 0 6px rgba(255,216,150,0.55))" : "none" }}
    >
      <defs>
        <radialGradient id={gid} cx="50%" cy="38%" r="68%">
          <stop offset="0%" stopColor={selected ? "#fff6e6" : "#f4f9ff"} />
          <stop offset="46%" stopColor={selected ? "#f0dcb6" : "#cfe0ee"} />
          <stop offset="100%" stopColor={selected ? "#8d7a55" : "#74899a"} />
        </radialGradient>
      </defs>

      {/* silhouette */}
      <path d={toPath(outline)} fill={`url(#${gid})`} stroke={selected ? "#ffe6b8" : "#aebcc8"} strokeWidth={1.4} strokeLinejoin="round" />
      {/* crown facets: girdle → table */}
      <g stroke={selected ? "rgba(255,236,200,0.6)" : "rgba(220,232,242,0.45)"} strokeWidth={0.9}>
        {outline.map(([x, y], i) => (
          <line key={i} x1={50 + x} y1={50 + y} x2={50 + table[i][0]} y2={50 + table[i][1]} />
        ))}
      </g>
      {/* table */}
      <path
        d={toPath(table)}
        fill="none"
        stroke={selected ? "rgba(255,243,222,0.85)" : "rgba(232,242,250,0.7)"}
        strokeWidth={1}
        strokeLinejoin="round"
      />
      {/* table sparkle */}
      <circle cx="44" cy="40" r="3.2" fill={selected ? "rgba(255,250,238,0.9)" : "rgba(255,255,255,0.8)"} />
    </svg>
  );
}
