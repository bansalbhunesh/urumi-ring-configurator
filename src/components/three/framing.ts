import * as THREE from "three";
import type { StoneId } from "@/lib/types";
import { gemGeometryFor, STONE_SCALE } from "./gemGeometry";

/* ----------------------------------------------------------------------------
   Per-shape cinematic framing.

   Different diamond cuts have completely different silhouettes and heights, so a
   single hardcoded camera distance crops some cuts and over-spaces others. This
   module is the source of truth for *how each stone should be photographed*:

   1. A rotation-invariant bounding measure of the whole ring (band + prongs +
      the procedural centre stone), so the camera fit can guarantee the object
      never clips at any yaw — we frame the swept cylinder, not the instantaneous
      silhouette.
   2. A per-shape "art-direction" profile that nudges the composition the way a
      jewellery photographer would: marquise pulls back for its length, emerald
      lifts the camera to show the step-cut table, pear leaves headroom for the
      tip, cushion sits a touch tighter.

   The measured fit keeps perceived product size consistent across cuts; the
   profile adds the intentional, individually-photographed feel on top.
---------------------------------------------------------------------------- */

export type RingBounds = {
  /** max horizontal distance of any vertex from the Y (spin) axis, ring-local */
  radiusXZ: number;
  /** lowest point of the ring, ring-local */
  minY: number;
  /** highest point of the ring (the crown of the stone), ring-local */
  maxY: number;
};

export type StoneFraming = {
  /** Fraction of the limiting viewport dimension the ring should span.
      Lower = more negative space / further back. Round is the 0.66 baseline. */
  fill: number;
  /** Horizontal breathing-room multiplier on the ring radius — elongated cuts
      (oval, marquise) need more so their long axis never kisses the edge. */
  sideRoom: number;
  /** Vertical composition in ring-local units. + lowers the subject in frame
      (more top margin) for cuts whose interest sits high (princess corners,
      pear/heart points). */
  yShift: number;
  /** Extra camera elevation (world units) for a higher, more top-down angle —
      step cuts (emerald, asscher) read best looking slightly down onto the table. */
  camElev: number;
};

/* Round is the baseline everything else is described relative to. Values are
   deliberately gentle — the measured fit already prevents clipping; these add
   the per-cut *character* a photographer would dial in. */
export const STONE_FRAMING: Record<StoneId, StoneFraming> = {
  round: { fill: 0.66, sideRoom: 1.0, yShift: 0.0, camElev: 0.0 },
  // Square silhouette, corners read larger → ease back, give top margin.
  princess: { fill: 0.62, sideRoom: 1.03, yShift: 0.1, camElev: 0.04 },
  // Longer footprint → horizontal breathing room, prevent side clipping.
  oval: { fill: 0.63, sideRoom: 1.14, yShift: 0.0, camElev: 0.02 },
  // Soft square, pillowed → close to round, a hair tighter is fine.
  cushion: { fill: 0.68, sideRoom: 1.02, yShift: 0.0, camElev: 0.0 },
  // Large table, step cut → higher camera angle, keep the steps visible.
  emerald: { fill: 0.62, sideRoom: 1.06, yShift: 0.05, camElev: 0.3 },
  // Like princess but visually heavier → slight zoom-out vs round.
  radiant: { fill: 0.63, sideRoom: 1.05, yShift: 0.03, camElev: 0.08 },
  // Asymmetrical teardrop → centre for the point, leave headroom so the tip
  // never touches the frame boundary.
  pear: { fill: 0.6, sideRoom: 1.07, yShift: 0.1, camElev: 0.05 },
  // The longest shape → most horizontal space, significant zoom-out.
  marquise: { fill: 0.55, sideRoom: 1.24, yShift: 0.0, camElev: 0.02 },
  // Top lobes + bottom point must both survive → pull back, add headroom.
  heart: { fill: 0.57, sideRoom: 1.1, yShift: 0.11, camElev: 0.06 },
  // Large square face → the most negative space, looking slightly down.
  asscher: { fill: 0.6, sideRoom: 1.07, yShift: 0.04, camElev: 0.16 },
};

/* The centre stone's own contribution to the ring bounds, in the ring-local
   frame. The gem is rendered at `gemPos` scaled by `gemScaleFactor` (and, inside
   <Gem>, by STONE_SCALE), so we transform the cut's local bounding box through
   exactly that placement and read off its swept radius + vertical extent. */
export function gemBounds(
  stone: StoneId,
  gemPos: [number, number, number],
  gemScaleFactor: number,
): RingBounds {
  const geometry = gemGeometryFor(stone);
  geometry.computeBoundingBox();
  const bb = geometry.boundingBox ?? new THREE.Box3();
  const [sx, sy, sz] = STONE_SCALE[stone];
  const [px, py, pz] = gemPos;

  let radiusXZ = 0;
  let minY = Infinity;
  let maxY = -Infinity;

  for (const cx of [bb.min.x, bb.max.x]) {
    for (const cy of [bb.min.y, bb.max.y]) {
      for (const cz of [bb.min.z, bb.max.z]) {
        const x = px + cx * sx * gemScaleFactor;
        const y = py + cy * sy * gemScaleFactor;
        const z = pz + cz * sz * gemScaleFactor;
        radiusXZ = Math.max(radiusXZ, Math.hypot(x, z));
        minY = Math.min(minY, y);
        maxY = Math.max(maxY, y);
      }
    }
  }

  geometry.dispose();
  return { radiusXZ, minY, maxY };
}

/* Rotation-invariant measure of an object's silhouette in `frame` space: the max
   planar radius from the Y axis and the vertical extent. Iterates real vertices
   (a torus' AABB corner would over-state the radius by √2 and over-zoom), so the
   fit stays tight and honest. Used for the metal band once per scene. */
export function planarBounds(object: THREE.Object3D): RingBounds {
  let radiusXZ = 0;
  let minY = Infinity;
  let maxY = -Infinity;
  const v = new THREE.Vector3();

  object.updateMatrixWorld(true);
  object.traverse((child) => {
    const mesh = child as THREE.Mesh;
    if (!mesh.isMesh || !mesh.geometry) return;
    const pos = mesh.geometry.getAttribute("position") as
      | THREE.BufferAttribute
      | undefined;
    if (!pos) return;
    for (let i = 0; i < pos.count; i++) {
      v.fromBufferAttribute(pos, i).applyMatrix4(mesh.matrixWorld);
      radiusXZ = Math.max(radiusXZ, Math.hypot(v.x, v.z));
      minY = Math.min(minY, v.y);
      maxY = Math.max(maxY, v.y);
    }
  });

  if (!Number.isFinite(minY)) return { radiusXZ: 1.5, minY: -1.2, maxY: 1.4 };
  return { radiusXZ, minY, maxY };
}

export function mergeBounds(a: RingBounds, b: RingBounds): RingBounds {
  return {
    radiusXZ: Math.max(a.radiusXZ, b.radiusXZ),
    minY: Math.min(a.minY, b.minY),
    maxY: Math.max(a.maxY, b.maxY),
  };
}
