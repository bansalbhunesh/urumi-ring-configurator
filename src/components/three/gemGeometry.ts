import * as THREE from "three";
import { mergeGeometries } from "three/examples/jsm/utils/BufferGeometryUtils.js";
import type { StoneId } from "@/lib/types";

/* Shared faceted gem geometry — used by both the hero ring's centre stone and
   the 3D picker thumbnails, so the choice you click is literally the cut you
   see on the ring. */

type V3 = [number, number, number];

/* Proper round brilliant: 48 explicit triangles (8 segments × 6 tris per segment).
   Vertex rings: TC (table centre), TE[8] (table edge), GD[8] (girdle-crown
   junction), GM[8] (girdle-pavilion junction), CU (culet).
   Windings verified via cross-product so every face's normal points outward. */
export function brilliantGeometry(): THREE.BufferGeometry {
  const N = 8;
  const tableR  = 0.082;
  const girdleR = 0.172;
  const crownH  = 0.072;
  const girdleH = 0.016;
  const pavH    = 0.28;

  const angles = Array.from({ length: N }, (_, i) => (i / N) * Math.PI * 2 + Math.PI / N);
  const next = (i: number) => (i + 1) % N;

  const TC: V3 = [0, crownH, 0];
  const TE = angles.map<V3>(a => [Math.cos(a) * tableR,  crownH,   Math.sin(a) * tableR]);
  const GD = angles.map<V3>(a => [Math.cos(a) * girdleR, 0,        Math.sin(a) * girdleR]);
  const GM = angles.map<V3>(a => [Math.cos(a) * girdleR, -girdleH, Math.sin(a) * girdleR]);
  const CU: V3 = [0, -pavH, 0];

  const tris: number[] = [];
  const tri = (a: V3, b: V3, c: V3) => tris.push(...a, ...b, ...c);

  for (let i = 0; i < N; i++) {
    const j = next(i);
    // Crown star — flat table, normal points +Y: TC, TE[j], TE[i]
    tri(TC, TE[j], TE[i]);
    // Crown main (2 triangles, outward+upward normals)
    tri(GD[i], TE[i], TE[j]);
    tri(GD[i], TE[j], GD[j]);
    // Girdle (2 triangles, radially outward normals)
    tri(GD[i], GD[j], GM[i]);
    tri(GD[j], GM[j], GM[i]);
    // Pavilion (outward+downward normals)
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
  const pavH = 0.27;

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
  oval: [0.9, 1, 1.45],
  princess: [1.04, 1, 1.04],
};
