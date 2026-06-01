"use client";

import { Component, useEffect, useMemo, useRef, type ReactNode } from "react";
import { useGLTF } from "@react-three/drei";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { METAL_BY_ID } from "@/lib/config";
import type { MetalId } from "@/lib/types";

/* ----------------------------------------------------------------------------
   Optional photoreal ring. Drop a GLB at /public/models/ring.glb and it is
   loaded here, auto-centred, auto-scaled. If absent, <ModelBoundary> falls
   back to the procedural TwistRing.

   Material override: strips baked albedo, sets metalness=1, roughness=0.08
   (mirror-polished), envMapIntensity=1.8 so the IBL environment gives proper
   jewellery-grade reflections.
---------------------------------------------------------------------------- */

export const RING_MODEL_URL = "/models/ring.glb";
const TARGET_SIZE = 2.7;

export function RingModel({ metalId }: { metalId: MetalId }) {
  const { scene } = useGLTF(RING_MODEL_URL);

  const root = useMemo(() => {
    const clone = scene.clone(true);
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

  /* Strip baked maps, force true precious-metal material on every mesh.
     Generated GLBs bake a pale near-matte albedo at metalness ~0 — plastic/bone.
     We drive it as a pure metal so the colour tints clean reflections. */
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
      mat.roughness = 0.08;
      mat.envMapIntensity = 1.8;
      mat.needsUpdate = true;
      m.material = mat;
      mats.push(mat);
    });
    matsRef.current = mats;
  }, [root]);

  useFrame((_, dt) => {
    const metal = METAL_BY_ID[metalId];
    const c = new THREE.Color(metal.color);
    for (const mat of matsRef.current) {
      mat.color.lerp(c, 1 - Math.exp(-8 * dt));
      mat.metalness = 1;
      mat.roughness = THREE.MathUtils.damp(mat.roughness, metal.roughness, 8, dt);
    }
  });

  return <primitive object={root} />;
}

export class ModelBoundary extends Component<
  { fallback: ReactNode; children: ReactNode },
  { failed: boolean }
> {
  state = { failed: false };
  static getDerivedStateFromError() {
    return { failed: true };
  }
  componentDidCatch() {}
  render() {
    return this.state.failed ? this.props.fallback : this.props.children;
  }
}
