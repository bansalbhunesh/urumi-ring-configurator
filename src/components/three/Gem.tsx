"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useFrame } from "@react-three/fiber";
import { MeshTransmissionMaterial } from "@react-three/drei";
import * as THREE from "three";
import { mergeGeometries } from "three/examples/jsm/utils/BufferGeometryUtils.js";
import { useConfigurator } from "@/store/configurator";
import type { StoneId } from "@/lib/types";

/* ----------------------------------------------------------------------------
   The centre stone.

   Three faceted cuts share one physical diamond material. Switching cuts is not
   a hard swap: the stone eases down, the geometry changes at the pinch point,
   then springs back with a back-eased overshoot and a flourish of spin — a
   "morph" in feel without forcing topologically-incompatible vertex morphs.
---------------------------------------------------------------------------- */

function faceted(geo: THREE.BufferGeometry): THREE.BufferGeometry {
  const flat = geo.toNonIndexed();
  flat.computeVertexNormals();
  geo.dispose();
  return flat;
}

function brilliantGeometry(): THREE.BufferGeometry {
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

function princessGeometry(): THREE.BufferGeometry {
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

const SCALE: Record<StoneId, [number, number, number]> = {
  round: [1, 1, 1],
  oval: [0.9, 1, 1.45],
  princess: [1.04, 1, 1.04],
};

function easeOutBack(x: number) {
  const c1 = 1.70158;
  const c3 = c1 + 1;
  return 1 + c3 * Math.pow(x - 1, 3) + c1 * Math.pow(x - 1, 2);
}

export function Gem({ mobile }: { mobile: boolean }) {
  const targetStone = useConfigurator((s) => s.stone);
  const [displayStone, setDisplayStone] = useState<StoneId>(targetStone);

  const geometry = useMemo(
    () => (displayStone === "princess" ? princessGeometry() : brilliantGeometry()),
    [displayStone],
  );
  useEffect(() => () => geometry.dispose(), [geometry]);

  const groupRef = useRef<THREE.Group>(null);
  const t = useRef(1); // transition progress: 1 = fully shown

  useFrame((_, dt) => {
    const swapping = displayStone !== targetStone;
    const goal = swapping ? 0 : 1;
    t.current = THREE.MathUtils.damp(t.current, goal, 13, dt);

    if (swapping && t.current < 0.04) {
      setDisplayStone(targetStone);
      t.current = 0.0001;
    }

    const g = groupRef.current;
    if (!g) return;
    const pop = easeOutBack(THREE.MathUtils.clamp(t.current, 0, 1));
    const [sx, sy, sz] = SCALE[displayStone];
    g.scale.set(sx * pop, sy * pop, sz * pop);
    // flourish of spin only while the stone is changing
    g.rotation.y += dt * (1 - t.current) * 4.2;
  });

  return (
    <group ref={groupRef}>
      <mesh geometry={geometry} castShadow>
        <MeshTransmissionMaterial
          samples={mobile ? 4 : 8}
          resolution={mobile ? 128 : 256}
          transmission={1}
          thickness={0.55}
          ior={2.42}
          chromaticAberration={0.06}
          anisotropicBlur={0.12}
          roughness={0}
          distortion={0}
          temporalDistortion={0}
          clearcoat={1}
          clearcoatRoughness={0}
          attenuationDistance={3}
          attenuationColor="#ffffff"
          color="#ffffff"
        />
      </mesh>
    </group>
  );
}
