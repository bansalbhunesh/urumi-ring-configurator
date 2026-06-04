"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { gemGeometryFor, STONE_SCALE } from "./gemGeometry";
import { useConfigurator } from "@/store/configurator";
import type { StoneId } from "@/lib/types";

/* ----------------------------------------------------------------------------
   The centre diamond.

   A faceted physical material (not MeshRefractionMaterial — that renders black in
   software WebGL and needs a bright cube to refract). With flatShading the facets
   each catch the bright studio soft-boxes, a touch of transmission gives glassy
   depth, iridescence adds fire, and a faint emissive floor means the stone is
   never a dead black shape — it reads as a bright, sparkling diamond on every GPU.
   Geometry is the reliable procedural cut; changing the cut pops the new stone in.
---------------------------------------------------------------------------- */

function easeOutBack(x: number) {
  const c1 = 1.70158;
  const c3 = c1 + 1;
  return 1 + c3 * Math.pow(x - 1, 3) + c1 * Math.pow(x - 1, 2);
}

export function Gem({ mobile }: { mobile: boolean }) {
  const targetStone = useConfigurator((s) => s.stone);
  const [displayStone, setDisplayStone] = useState<StoneId>(targetStone);
  const geometry = useMemo(() => gemGeometryFor(displayStone), [displayStone]);
  useEffect(() => () => geometry.dispose(), [geometry]);

  const groupRef = useRef<THREE.Group>(null);
  const t = useRef(0);
  const age = useRef(0);

  useFrame((_, dt) => {
    age.current += dt;
    const swapping = displayStone !== targetStone;
    const intro = age.current > 0.5;
    const goal = swapping || !intro ? 0 : 1;
    t.current = THREE.MathUtils.damp(t.current, goal, 14, dt);
    if (swapping && t.current < 0.04) {
      setDisplayStone(targetStone);
      t.current = 0.0001;
    }
    const g = groupRef.current;
    if (!g) return;
    const [sx, sy, sz] = STONE_SCALE[displayStone];
    const k = Math.max(0.0001, easeOutBack(THREE.MathUtils.clamp(t.current, 0, 1)));
    g.scale.set(sx * k, sy * k, sz * k);
    g.rotation.y += dt * 0.16;
  });

  return (
    <group ref={groupRef}>
      <mesh geometry={geometry} castShadow>
        <meshPhysicalMaterial
          color="#ffffff"
          metalness={0}
          roughness={0}
          transmission={0.6}
          thickness={0.5}
          ior={2.4}
          reflectivity={1}
          envMapIntensity={mobile ? 3 : 4.5}
          clearcoat={1}
          clearcoatRoughness={0}
          iridescence={0.5}
          iridescenceIOR={1.45}
          specularIntensity={1.5}
          specularColor="#ffffff"
          attenuationColor="#eaf2ff"
          attenuationDistance={1.6}
          emissive="#aebfd8"
          emissiveIntensity={0.08}
          flatShading
        />
      </mesh>
    </group>
  );
}
