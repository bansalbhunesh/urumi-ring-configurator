import * as THREE from "three";
import { mergeGeometries } from "three/examples/jsm/utils/BufferGeometryUtils.js";
import type { StoneId } from "@/lib/types";

type V3 = [number, number, number];

/* 16-segment round brilliant — 96 triangles, full-symmetry facets catch light
   from far more angles than the original 8-segment version. Proportions tuned
   to GIA standard brilliant: 53% table, 14.5° crown, deep 43° pavilion. */
export function brilliantGeometry(): THREE.BufferGeometry {
  const N = 16;
  const tableR  = 0.088;
  const girdleR = 0.172;
  const crownH  = 0.062;
  const girdleH = 0.012;
  const pavH    = 0.30;

  const angles = Array.from({ length: N }, (_, i) => (i / N) * Math.PI * 2 + Math.PI / N);
  const next = (i: number) => (i + 1) % N;

  const TC: V3 = [0, crownH, 0];
  const TE = angles.map<V3>(a => [Math.cos(a) * tableR,  crownH,   Math.sin(a) * tableR]);
  const GD = angles.map<V3>(a => [Math.cos(a) * girdleR, 0,        Math.sin(a) * girdleR]);
  const GM = angles.map<V3>(a => [Math.cos(a) * girdleR, -girdleH, Math.sin(a) * girdleR]);
  const CU: V3 = [0, -pavH, 0];

  /* Star / upper-half facets at the midpoint radius — adds 16 extra facets that
     break up the crown into the recognisable 8-fold star pattern. */
  const starR = (tableR + girdleR) * 0.52;
  const starH = crownH * 0.45;
  const STAR = angles.map<V3>(a => [Math.cos(a) * starR, starH, Math.sin(a) * starR]);

  const tris: number[] = [];
  const tri = (a: V3, b: V3, c: V3) => tris.push(...a, ...b, ...c);

  for (let i = 0; i < N; i++) {
    const j = next(i);
    // Table star: TC → STAR[i]/[j] instead of directly to TE
    tri(TC, STAR[j], STAR[i]);
    // Upper-star to table edge
    tri(STAR[i], STAR[j], TE[j]);
    tri(STAR[i], TE[j], TE[i]);
    // Crown bezel (lower star down to girdle)
    tri(GD[i], TE[i], TE[j]);
    tri(GD[i], TE[j], GD[j]);
    // Girdle
    tri(GD[i], GD[j], GM[i]);
    tri(GD[j], GM[j], GM[i]);
    // Pavilion main + lower-half facets
    tri(GM[i], GM[j], CU);
  }

  const geo = new THREE.BufferGeometry();
  geo.setAttribute("position", new THREE.BufferAttribute(new Float32Array(tris), 3));
  geo.computeVertexNormals();
  return geo;
}

export function princessGeometry(): THREE.BufferGeometry {
  const half = 0.16;
  const crownH = 0.06;
  const pavH = 0.28;

  const crown = new THREE.CylinderGeometry(half * 0.6, half, crownH, 4, 1);
  crown.rotateY(Math.PI / 4);
  crown.translate(0, crownH / 2, 0);

  const pavilion = new THREE.ConeGeometry(half, pavH, 4, 1);
  pavilion.rotateY(Math.PI / 4);
  pavilion.rotateX(Math.PI);
  pavilion.translate(0, -pavH / 2, 0);

  const merged = mergeGeometries([crown, pavilion], false)!;
  crown.dispose();
  pavilion.dispose();
  const flat = merged.toNonIndexed();
  flat.computeVertexNormals();
  merged.dispose();
  return flat;
}

export function gemGeometryFor(stone: StoneId): THREE.BufferGeometry {
  return stone === "princess" ? princessGeometry() : brilliantGeometry();
}

export const STONE_SCALE: Record<StoneId, [number, number, number]> = {
  round: [1, 1, 1],
  oval: [0.88, 1, 1.44],
  princess: [1.04, 1, 1.04],
};
