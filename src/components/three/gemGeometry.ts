import * as THREE from "three";
import { mergeGeometries } from "three/examples/jsm/utils/BufferGeometryUtils.js";
import type { StoneId } from "@/lib/types";

/* Shared faceted gem geometry — used by both the hero ring's centre stone and
   the 3D picker thumbnails, so the choice you click is literally the cut you
   see on the ring. */

function faceted(geo: THREE.BufferGeometry): THREE.BufferGeometry {
  const flat = geo.toNonIndexed();
  flat.computeVertexNormals();
  geo.dispose();
  return flat;
}

export function brilliantGeometry(): THREE.BufferGeometry {
  const girdle = 0.17;
  const table = 0.085;
  const crownH = 0.075;
  const pavH = 0.3;

  const crown = new THREE.CylinderGeometry(table, girdle, crownH, 18, 1);
  crown.translate(0, crownH / 2, 0);

  const pavilion = new THREE.ConeGeometry(girdle, pavH, 18, 1);
  pavilion.rotateX(Math.PI);
  pavilion.translate(0, -pavH / 2, 0);

  const merged = mergeGeometries([crown, pavilion], false)!;
  crown.dispose();
  pavilion.dispose();
  return faceted(merged);
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
  return faceted(merged);
}

export function gemGeometryFor(stone: StoneId): THREE.BufferGeometry {
  return stone === "princess" ? princessGeometry() : brilliantGeometry();
}

export const STONE_SCALE: Record<StoneId, [number, number, number]> = {
  round: [1, 1, 1],
  oval: [0.9, 1, 1.45],
  princess: [1.04, 1, 1.04],
};
