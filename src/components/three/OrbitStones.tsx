"use client";

import { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { useStoneGeometries } from "./stones";
import { STONES } from "@/lib/config";
import { getOrbitStrength, useConfigurator } from "@/store/configurator";

/* ----------------------------------------------------------------------------
   The ten cuts, orbiting the ring.

   While the configurator stage is in view a slow halo of all ten diamond cuts
   circles the ring. The chosen cut lifts, brightens and spins a touch faster —
   a calm, legible map of the choice rather than a busy particle storm. The
   whole halo fades in/out with orbitStrength (set by the scene director).
---------------------------------------------------------------------------- */

const R = 2.05;

export function OrbitStones() {
  const geos = useStoneGeometries();
  const selected = useConfigurator((s) => s.stone);

  const groupRef = useRef<THREE.Group>(null);
  const itemRefs = useRef<(THREE.Group | null)[]>([]);
  const strength = useRef(0);

  const baseMat = useMemo(
    () =>
      new THREE.MeshPhysicalMaterial({
        color: "#ffffff",
        metalness: 0,
        roughness: 0.02,
        transmission: 0.55,
        thickness: 0.45,
        ior: 2.2,
        envMapIntensity: 2.6,
        clearcoat: 1,
        clearcoatRoughness: 0,
        transparent: true,
        opacity: 0.92,
        flatShading: true,
      }),
    [],
  );

  const selMat = useMemo(
    () =>
      new THREE.MeshPhysicalMaterial({
        color: "#ffffff",
        metalness: 0,
        roughness: 0,
        transmission: 0.5,
        thickness: 0.5,
        ior: 2.4,
        envMapIntensity: 3.4,
        emissive: new THREE.Color("#ffd9a0"),
        emissiveIntensity: 0.18,
        clearcoat: 1,
        clearcoatRoughness: 0,
        transparent: true,
        flatShading: true,
      }),
    [],
  );

  useFrame((state, dt) => {
    const g = groupRef.current;
    strength.current = THREE.MathUtils.damp(strength.current, getOrbitStrength(), 3.5, dt);
    const s = strength.current;
    if (!g) return;
    g.visible = s > 0.01;
    g.rotation.y += dt * 0.12;
    g.scale.setScalar(Math.max(0.0001, s));

    STONES.forEach((stone, i) => {
      const it = itemRefs.current[i];
      if (!it) return;
      const isSel = stone.id === selected;
      it.rotation.y += dt * (isSel ? 0.85 : 0.4);
      const bob = Math.sin(state.clock.elapsedTime * 0.8 + i * 0.9) * 0.04;
      const target = (isSel ? 1.55 : 1) * (0.95 + bob);
      const next = THREE.MathUtils.damp(it.scale.x, target, 6, dt);
      it.scale.setScalar(next);
      it.position.y = THREE.MathUtils.damp(it.position.y, isSel ? 0.22 : 0, 6, dt);
    });
  });

  return (
    <group ref={groupRef} visible={false} scale={0.0001} rotation={[0.18, 0, 0]}>
      {STONES.map((stone, i) => {
        const a = (i / STONES.length) * Math.PI * 2;
        const isSel = stone.id === selected;
        return (
          <group key={stone.id} position={[Math.cos(a) * R, 0, Math.sin(a) * R]}>
            <group
              ref={(el) => {
                itemRefs.current[i] = el;
              }}
            >
              <mesh geometry={geos[stone.id]} material={isSel ? selMat : baseMat} scale={1.55} />
            </group>
          </group>
        );
      })}
    </group>
  );
}
