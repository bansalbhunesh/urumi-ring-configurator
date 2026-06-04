import * as THREE from "three";
import type { StoneId } from "@/lib/types";

type V2 = [number, number];
type V3 = [number, number, number];

const GIRDLE_H = 0.012;

function buildFacetedGeometry(
  outline: V2[],
  {
    tableScale = 0.54,
    crownH = 0.062,
    pavilionH = 0.3,
    starScale = 0.76,
    tableInsetY = 0.004,
  }: {
    tableScale?: number;
    crownH?: number;
    pavilionH?: number;
    starScale?: number;
    tableInsetY?: number;
  } = {},
) {
  const tris: number[] = [];
  const tri = (a: V3, b: V3, c: V3) => tris.push(...a, ...b, ...c);
  const next = (i: number) => (i + 1) % outline.length;
  const point = ([x, z]: V2, y: number, scale = 1): V3 => [x * scale, y, z * scale];

  const tableCenter: V3 = [0, crownH + tableInsetY, 0];
  const culet: V3 = [0, -pavilionH, 0];

  const table = outline.map((p) => point(p, crownH, tableScale));
  const star = outline.map((p) => point(p, crownH * 0.46, starScale));
  const girdleTop = outline.map((p) => point(p, 0));
  const girdleBottom = outline.map((p) => point(p, -GIRDLE_H));

  for (let i = 0; i < outline.length; i++) {
    const j = next(i);
    tri(tableCenter, table[j], table[i]);
    tri(table[i], table[j], star[j]);
    tri(table[i], star[j], star[i]);
    tri(girdleTop[i], star[i], star[j]);
    tri(girdleTop[i], star[j], girdleTop[j]);
    tri(girdleTop[i], girdleTop[j], girdleBottom[i]);
    tri(girdleTop[j], girdleBottom[j], girdleBottom[i]);
    tri(girdleBottom[i], girdleBottom[j], culet);
  }

  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute("position", new THREE.BufferAttribute(new Float32Array(tris), 3));
  geometry.computeVertexNormals();
  return geometry;
}

function ellipsePoints(rx: number, rz: number, segments = 20): V2[] {
  return Array.from({ length: segments }, (_, index) => {
    const angle = (index / segments) * Math.PI * 2 + Math.PI / segments;
    return [Math.cos(angle) * rx, Math.sin(angle) * rz];
  });
}

function cutCornerRect(rx: number, rz: number, cut = 0.38): V2[] {
  const cx = rx * cut;
  const cz = rz * cut;
  return [
    [-rx + cx, rz],
    [rx - cx, rz],
    [rx, rz - cz],
    [rx, -rz + cz],
    [rx - cx, -rz],
    [-rx + cx, -rz],
    [-rx, -rz + cz],
    [-rx, rz - cz],
  ];
}

function cushionPoints(rx = 0.168, rz = 0.168): V2[] {
  const n = 20;
  return Array.from({ length: n }, (_, index) => {
    const angle = (index / n) * Math.PI * 2 + Math.PI / n;
    const c = Math.cos(angle);
    const s = Math.sin(angle);
    const power = 0.58;
    return [
      Math.sign(c) * Math.pow(Math.abs(c), power) * rx,
      Math.sign(s) * Math.pow(Math.abs(s), power) * rz,
    ];
  });
}

function marquisePoints(): V2[] {
  const n = 18;
  return Array.from({ length: n }, (_, index) => {
    const angle = (index / n) * Math.PI * 2;
    const x = Math.sin(angle) * 0.105 * Math.pow(Math.abs(Math.sin(angle)), 0.16);
    const z = Math.cos(angle) * 0.255;
    return [x, z];
  });
}

function pearPoints(): V2[] {
  return [
    [0, 0.238],
    [0.066, 0.162],
    [0.116, 0.072],
    [0.128, -0.036],
    [0.096, -0.142],
    [0.036, -0.206],
    [0, -0.224],
    [-0.036, -0.206],
    [-0.096, -0.142],
    [-0.128, -0.036],
    [-0.116, 0.072],
    [-0.066, 0.162],
  ];
}

function heartPoints(): V2[] {
  return [
    [0, 0.18],
    [0.074, 0.236],
    [0.148, 0.196],
    [0.158, 0.104],
    [0.12, 0.018],
    [0.064, -0.07],
    [0, -0.178],
    [-0.064, -0.07],
    [-0.12, 0.018],
    [-0.158, 0.104],
    [-0.148, 0.196],
    [-0.074, 0.236],
  ];
}

export function brilliantGeometry(): THREE.BufferGeometry {
  return buildFacetedGeometry(ellipsePoints(0.172, 0.172, 24), {
    tableScale: 0.52,
    starScale: 0.73,
  });
}

export function princessGeometry(): THREE.BufferGeometry {
  return buildFacetedGeometry(cutCornerRect(0.165, 0.165, 0.08), {
    tableScale: 0.55,
    starScale: 0.78,
    pavilionH: 0.285,
  });
}

function ovalGeometry(): THREE.BufferGeometry {
  return buildFacetedGeometry(ellipsePoints(0.132, 0.218, 24), {
    tableScale: 0.53,
    starScale: 0.75,
  });
}

function emeraldGeometry(): THREE.BufferGeometry {
  return buildFacetedGeometry(cutCornerRect(0.126, 0.222, 0.28), {
    tableScale: 0.62,
    starScale: 0.82,
    pavilionH: 0.24,
  });
}

function radiantGeometry(): THREE.BufferGeometry {
  return buildFacetedGeometry(cutCornerRect(0.142, 0.212, 0.24), {
    tableScale: 0.54,
    starScale: 0.78,
    pavilionH: 0.282,
  });
}

function asscherGeometry(): THREE.BufferGeometry {
  return buildFacetedGeometry(cutCornerRect(0.168, 0.168, 0.32), {
    tableScale: 0.62,
    starScale: 0.82,
    pavilionH: 0.25,
  });
}

export function gemGeometryFor(stone: StoneId): THREE.BufferGeometry {
  switch (stone) {
    case "oval":
      return ovalGeometry();
    case "princess":
      return princessGeometry();
    case "cushion":
      return buildFacetedGeometry(cushionPoints(), { tableScale: 0.55, starScale: 0.76 });
    case "emerald":
      return emeraldGeometry();
    case "radiant":
      return radiantGeometry();
    case "pear":
      return buildFacetedGeometry(pearPoints(), { tableScale: 0.5, starScale: 0.74 });
    case "marquise":
      return buildFacetedGeometry(marquisePoints(), { tableScale: 0.48, starScale: 0.72 });
    case "heart":
      return buildFacetedGeometry(heartPoints(), { tableScale: 0.5, starScale: 0.74 });
    case "asscher":
      return asscherGeometry();
    case "round":
    default:
      return brilliantGeometry();
  }
}

export const STONE_SCALE: Record<StoneId, [number, number, number]> = {
  round: [1, 1, 1],
  oval: [1, 1, 1],
  princess: [1.02, 1, 1.02],
  cushion: [1, 1, 1],
  emerald: [1, 1, 1],
  radiant: [1, 1, 1],
  pear: [1, 1, 1],
  marquise: [1, 1, 1],
  heart: [1, 1, 1],
  asscher: [1, 1, 1],
};
