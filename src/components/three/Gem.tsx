"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useFrame } from "@react-three/fiber";
import { MeshTransmissionMaterial, Caustics } from "@react-three/drei";
import * as THREE from "three";
import { gemGeometryFor, STONE_SCALE } from "./gemGeometry";
import { useConfigurator, getInsideWormhole } from "@/store/configurator";
import type { StoneId } from "@/lib/types";

/* ----------------------------------------------------------------------------
   The centre stone.

   God Tier features:
   1. Real-time volumetric caustics (rainbow light throw) on desktop.
   2. "Heartbeat" chromatic aberration pulse.
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
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const matRef = useRef<any>(null); 
  const t = useRef(0); // transition progress: start at 0 for the intro sequence

  const age = useRef(0);

  useFrame((state, dt) => {
    // Intro sequence: local mounting age ensures robust materialization whenever the gem mounts
    age.current += dt;
    const introDelayPassed = age.current > 1.2;
    const swapping = displayStone !== targetStone;
    
    const goal = (swapping || !introDelayPassed) ? 0 : 1;
    t.current = THREE.MathUtils.damp(t.current, goal, 13, dt);

    if (swapping && t.current < 0.04) {
      setDisplayStone(targetStone);
      t.current = 0.0001;
    }

    const inside = getInsideWormhole();
    const g = groupRef.current;
    if (g) {
      g.visible = !inside;
    }
    if (inside) return;

    if (g) {
      const pop = easeOutBack(THREE.MathUtils.clamp(t.current, 0, 1));
      const [sx, sy, sz] = STONE_SCALE[displayStone];
      g.scale.set(sx * pop, sy * pop, sz * pop);
      g.rotation.y += dt * (1 - t.current) * 4.2;
    }

    // Heartbeat: Organic pulse of the internal fire (chromatic aberration)
    if (matRef.current) {
      const time = state.clock.elapsedTime;
      // Double-beat pattern similar to a heart: bump...bump......bump...bump
      const beat = Math.sin(time * 2) * Math.sin(time * 1.8) * 0.05;
      const targetAberration = 0.12 + Math.max(0, beat);
      matRef.current.chromaticAberration = THREE.MathUtils.damp(
        matRef.current.chromaticAberration,
        targetAberration,
        4,
        dt
      );
    }
  });

  const material = (
    <MeshTransmissionMaterial
      ref={matRef}
      samples={mobile ? 4 : 8}
      resolution={mobile ? 128 : 256}
      transmission={1}
      thickness={0.55}
      ior={2.42}
      chromaticAberration={0.12} // dynamic in useFrame
      anisotropicBlur={0.1}
      roughness={0}
      distortion={0.08}
      temporalDistortion={0.04}
      clearcoat={1}
      clearcoatRoughness={0}
      attenuationDistance={1.4}
      attenuationColor="#ffffff"
      color="#ffffff"
    />
  );

  return (
    <group ref={groupRef}>
      <mesh geometry={geometry} castShadow receiveShadow>
        {material}
      </mesh>
    </group>
  );
}

