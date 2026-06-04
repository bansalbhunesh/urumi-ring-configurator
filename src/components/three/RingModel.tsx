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

export function RingModel({ metalId, mobile = false }: { metalId: MetalId; mobile?: boolean }) {
  const { scene } = useGLTF(RING_MODEL_URL);
  const materials = useMemo(
    () => ({
      metal: metalMaterial(metalId),
      pave: paveMaterial(),
    }),
    [metalId],
  );

  const { root, gemPos, gemScaleFactor } = useMemo(() => {
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

    clone.traverse((o) => {
      const m = o as THREE.Mesh;
      if (m.isMesh) {
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
        } else {
          if (kind === "metal" && m.geometry) {
            m.geometry = m.geometry.clone();
            m.geometry.computeVertexNormals();
          }
          m.material = materials[kind];
        }
      }
    });

    return { root: clone, gemPos, gemScaleFactor };
  }, [scene, materials]);

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
