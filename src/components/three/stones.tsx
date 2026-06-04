"use client";

import { useMemo } from "react";
import { useGLTF } from "@react-three/drei";
import * as THREE from "three";
import { STONES } from "@/lib/config";
import type { StoneId } from "@/lib/types";

/* ----------------------------------------------------------------------------
   Real faceted diamond geometry.

   Each cut ships as a tiny purpose-built GLB (public/models/stones/*.glb, ~13KB)
   with a single faceted mesh. We load all ten once, normalise each to the same
   girdle radius (so every cut reads proportional in the basket), and cache the
   resulting BufferGeometry. Loading the whole set up front means changing the
   centre stone — or spinning the orbiting halo — never re-suspends the canvas.
---------------------------------------------------------------------------- */

const STONE_URLS = STONES.map((s) => `/models/stones/${s.id}.glb`);
STONE_URLS.forEach((u) => useGLTF.preload(u));

/* The procedural girdle radius the rest of the scene was tuned against, so the
   existing gem-placement maths in RingModel keeps working unchanged. */
const TARGET_GIRDLE = 0.172;

export type StoneGeoMap = Record<StoneId, THREE.BufferGeometry>;

function firstMeshGeometry(root: THREE.Object3D): THREE.BufferGeometry | null {
  let found: THREE.BufferGeometry | null = null;
  root.traverse((o) => {
    const m = o as THREE.Mesh;
    if (m.isMesh && m.geometry && !found) found = m.geometry as THREE.BufferGeometry;
  });
  return found;
}

function normalise(src: THREE.BufferGeometry): THREE.BufferGeometry {
  const g = src.clone();
  g.computeBoundingBox();
  const bb = g.boundingBox ?? new THREE.Box3();
  const size = new THREE.Vector3();
  const center = new THREE.Vector3();
  bb.getSize(size);
  bb.getCenter(center);

  // Centre on the girdle (mid Y), recentre X/Z, then scale so the widest
  // horizontal span matches the target girdle diameter.
  g.translate(-center.x, -center.y, -center.z);
  const spanXZ = Math.max(size.x, size.z) || 1;
  const scale = (TARGET_GIRDLE * 2) / spanXZ;
  g.scale(scale, scale, scale);
  g.computeVertexNormals();
  return g;
}

export function useStoneGeometries(): StoneGeoMap {
  const gltfs = useGLTF(STONE_URLS) as unknown as { scene: THREE.Object3D }[];
  return useMemo(() => {
    const map = {} as StoneGeoMap;
    STONES.forEach((stone, i) => {
      const geo = firstMeshGeometry(gltfs[i].scene);
      map[stone.id] = geo ? normalise(geo) : new THREE.BufferGeometry();
    });
    return map;
  }, [gltfs]);
}
