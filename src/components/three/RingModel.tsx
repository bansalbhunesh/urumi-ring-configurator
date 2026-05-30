"use client";

import { Component, useEffect, useMemo, useRef, type ReactNode } from "react";
import { useGLTF } from "@react-three/drei";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { METAL_BY_ID } from "@/lib/config";
import type { MetalId } from "@/lib/types";

/* ----------------------------------------------------------------------------
   Optional photoreal ring.

   Drop a GLB at /public/models/ring.glb (e.g. exported from Tripo3D) and it is
   loaded here, auto-centred, auto-scaled to the stage, with its metallic
   materials tinted live to the selected metal. If the file is absent or fails
   to load, <ModelBoundary> falls back to the procedural TwistRing — so the page
   is never broken by a missing asset.

   Tuning (orientation/scale/which mesh is the band) happens once a real file is
   present; the defaults below auto-fit most exports.
---------------------------------------------------------------------------- */

export const RING_MODEL_URL = "/models/ring.glb";
const TARGET_SIZE = 2.7; // world units the longest dimension is scaled to

export function RingModel({ metalId }: { metalId: MetalId }) {
  const { scene } = useGLTF(RING_MODEL_URL);

  const root = useMemo(() => {
    const clone = scene.clone(true);
    // Auto-centre + auto-scale to fit the stage regardless of export units.
    const box = new THREE.Box3().setFromObject(clone);
    const size = new THREE.Vector3();
    const center = new THREE.Vector3();
    box.getSize(size);
    box.getCenter(center);
    clone.position.sub(center);
    const maxDim = Math.max(size.x, size.y, size.z) || 1;
    clone.scale.setScalar(TARGET_SIZE / maxDim);
    clone.traverse((o) => {
      const m = o as THREE.Mesh;
      if (m.isMesh) {
        m.castShadow = true;
        m.receiveShadow = true;
      }
    });
    return clone;
  }, [scene]);

  // Force every part to read as precious polished metal. Generated GLBs (Tripo)
  // bake a pale, near-matte albedo at metalness ~0 — which renders as plastic/bone.
  // We clone each material (so the cached GLTF is untouched), strip the baked
  // albedo/emissive maps, and drive it as a true metal so the colour tints clean
  // reflections rather than a dull diffuse. The frame loop then tints + damps
  // roughness to the chosen finish.
  const matsRef = useRef<THREE.MeshStandardMaterial[]>([]);
  useEffect(() => {
    const mats: THREE.MeshStandardMaterial[] = [];
    root.traverse((o) => {
      const m = o as THREE.Mesh;
      if (!m.isMesh || !m.material) return;
      const src = m.material as THREE.MeshStandardMaterial;
      const mat = src.clone();
      mat.map = null;
      mat.emissiveMap = null;
      mat.aoMap = null;
      mat.emissive = new THREE.Color(0x000000);
      mat.metalness = 1;
      mat.roughness = 0.22;
      mat.envMapIntensity = 1.4;
      mat.needsUpdate = true;
      m.material = mat;
      mats.push(mat);
    });
    matsRef.current = mats;
  }, [root]);

  /* Mutating three.js material props each frame is the standard R3F pattern;
     these are external (GPU-backed) objects, not React state. */
  /* eslint-disable react-hooks/immutability */
  useFrame((_, dt) => {
    const metal = METAL_BY_ID[metalId];
    const c = new THREE.Color(metal.color);
    for (const mat of matsRef.current) {
      mat.color.lerp(c, 1 - Math.exp(-8 * dt));
      mat.metalness = 1;
      mat.roughness = THREE.MathUtils.damp(mat.roughness, metal.roughness, 8, dt);
    }
  });
  /* eslint-enable react-hooks/immutability */

  return <primitive object={root} />;
}

/* Error boundary: if the GLB is missing / fails, render the fallback ring. */
export class ModelBoundary extends Component<
  { fallback: ReactNode; children: ReactNode },
  { failed: boolean }
> {
  state = { failed: false };
  static getDerivedStateFromError() {
    return { failed: true };
  }
  componentDidCatch() {
    /* swallow — fallback ring renders */
  }
  render() {
    return this.state.failed ? this.props.fallback : this.props.children;
  }
}
