"use client";

import { Component, useMemo, type ReactNode } from "react";
import { useGLTF } from "@react-three/drei";
import * as THREE from "three";
import { METAL_BY_ID } from "@/lib/config";
import type { MetalId } from "@/lib/types";
import { Gem } from "./Gem";

export const RING_MODEL_URL = "/models/ring.glb";
const TARGET_SIZE = 2.95;

function metalMaterial(metalId: MetalId) {
  const metal = METAL_BY_ID[metalId];
  const color = new THREE.Color(metal.color).lerp(new THREE.Color("#fffaf2"), 0.28);
  return new THREE.MeshPhysicalMaterial({
    color,
    metalness: 1,
    roughness: THREE.MathUtils.clamp(metal.roughness * 1.1, 0.16, 0.32),
    clearcoat: 0.22,
    clearcoatRoughness: 0.18,
    envMapIntensity: 5.6,
    specularIntensity: 1.32,
    specularColor: new THREE.Color("#fff7ec"),
    sheen: 0.08,
    sheenRoughness: 0.35,
    sheenColor: new THREE.Color("#ffe7c0"),
  });
}

function paveMaterial() {
  return new THREE.MeshPhysicalMaterial({
    color: new THREE.Color("#ffffff"),
    metalness: 0,
    roughness: 0.01,
    transparent: true,
    opacity: 0.76,
    transmission: 0.72,
    thickness: 0.1,
    ior: 2.42,
    envMapIntensity: 6.2,
    specularIntensity: 2.6,
    attenuationDistance: 2.2,
    attenuationColor: new THREE.Color("#f7fbff"),
    depthWrite: false,
  });
}

function classifyMesh(mesh: THREE.Mesh) {
  const name = mesh.name.toLowerCase();
  const materialNames = Array.isArray(mesh.material)
    ? mesh.material.map((material) => material.name.toLowerCase()).join(" ")
    : mesh.material.name.toLowerCase();
  const signature = `${name} ${materialNames}`;

  if (signature.includes("centerdiamond")) return "center";
  if (signature.includes("pavediamonds")) return "pave";
  if (signature.includes("metal")) return "metal";
  if (name === "tripo_part_0") return "center";

  const box = new THREE.Box3().setFromObject(mesh);
  const center = new THREE.Vector3();
  const size = new THREE.Vector3();
  box.getCenter(center);
  box.getSize(size);

  const smallShoulderStone =
    center.x < -0.32 &&
    center.y < -0.04 &&
    size.x < 0.04 &&
    size.y < 0.12;

  return smallShoulderStone ? "pave" : "metal";
}

interface ClassifiedClone {
  root: THREE.Object3D;
  metalMeshes: THREE.Mesh[];
  paveMeshes: THREE.Mesh[];
  gemPos: [number, number, number];
  gemScaleFactor: number;
}

/* The deep clone + bounding-box maths + geometry/normal work is expensive and
   does NOT depend on the chosen metal — so we do it once per source scene and
   cache it. Metal changes (incl. hover preview) then only swap a material, which
   is effectively free. (One RingModel renders at a time, so a shared clone per
   scene is safe.) */
const cloneCache = new WeakMap<THREE.Object3D, ClassifiedClone>();

function getClassifiedClone(scene: THREE.Object3D): ClassifiedClone {
  const cached = cloneCache.get(scene);
  if (cached) return cached;

  const clone = scene.clone(true);
  const box = new THREE.Box3().setFromObject(clone);
  const size = new THREE.Vector3();
  const center = new THREE.Vector3();
  box.getSize(size);
  box.getCenter(center);
  clone.position.sub(center);
  const maxDim = Math.max(size.x, size.y, size.z) || 1;
  clone.scale.setScalar(TARGET_SIZE / maxDim);
  clone.updateMatrixWorld(true);

  /* Default gem placement — in case no "center" mesh is found in the GLB. */
  let gemPos: [number, number, number] = [0, 1.2, 0];
  let gemScaleFactor = 1.8;
  const metalMeshes: THREE.Mesh[] = [];
  const paveMeshes: THREE.Mesh[] = [];

  clone.traverse((o) => {
    const m = o as THREE.Mesh;
    if (!m.isMesh) return;
    m.castShadow = true;
    m.receiveShadow = true;
    const kind = classifyMesh(m);
    if (kind === "center") {
      /* Hide the static GLB diamond and record its bounding-box centre
         so the live procedural Gem sits in exactly the same spot. */
      const dBox = new THREE.Box3().setFromObject(m);
      const dCenter = new THREE.Vector3();
      const dSize = new THREE.Vector3();
      dBox.getCenter(dCenter);
      dBox.getSize(dSize);
      gemPos = [dCenter.x, dCenter.y, dCenter.z];
      const glbGemRadius = Math.max(dSize.x, dSize.z) / 2;
      // 0.172 is the round procedural girdle radius. Clamp keeps AI GLB
      // bounds from making elongated replacement stones cartoon-large.
      gemScaleFactor = THREE.MathUtils.clamp(glbGemRadius / 0.172, 0.68, 2.35);
      m.visible = false;
    } else if (kind === "metal") {
      if (m.geometry) {
        m.geometry = m.geometry.clone();
        m.geometry.computeVertexNormals();
      }
      metalMeshes.push(m);
    } else {
      paveMeshes.push(m);
    }
  });

  const entry: ClassifiedClone = { root: clone, metalMeshes, paveMeshes, gemPos, gemScaleFactor };
  cloneCache.set(scene, entry);
  return entry;
}

export function RingModel({ metalId, mobile = false }: { metalId: MetalId; mobile?: boolean }) {
  const { scene } = useGLTF(RING_MODEL_URL);

  const { root, gemPos, gemScaleFactor } = useMemo(() => {
    const classified = getClassifiedClone(scene);
    const metalMat = metalMaterial(metalId);
    const paveMat = paveMaterial();
    for (const mesh of classified.metalMeshes) mesh.material = metalMat;
    for (const mesh of classified.paveMeshes) mesh.material = paveMat;
    return {
      root: classified.root,
      gemPos: classified.gemPos,
      gemScaleFactor: classified.gemScaleFactor,
    };
  }, [scene, metalId]);

  return (
    <group>
      <primitive object={root} />
      <group position={gemPos} scale={gemScaleFactor}>
        <Gem mobile={mobile} />
      </group>
    </group>
  );
}

export function HybridRingModel({
  metalId,
  mobile,
}: {
  metalId: MetalId;
  mobile: boolean;
}) {
  return (
    <group>
      <RingModel metalId={metalId} mobile={mobile} />
    </group>
  );
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

useGLTF.preload(RING_MODEL_URL);
