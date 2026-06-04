"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import { MeshTransmissionMaterial } from "@react-three/drei";
import * as THREE from "three";
import { gemGeometryFor, STONE_SCALE } from "./gemGeometry";
import { useConfigurator } from "@/store/configurator";
import type { StoneId } from "@/lib/types";

function easeOutQuint(x: number) {
  return 1 - Math.pow(1 - x, 5);
}

export function Gem({ mobile }: { mobile: boolean }) {
  const targetStone = useConfigurator((s) => s.stone);
  const [displayStone, setDisplayStone] = useState<StoneId>(targetStone);
  const { scene } = useThree();
  const envTexture = (scene.environment as THREE.Texture | null) ?? undefined;

  const geometry = useMemo(() => gemGeometryFor(displayStone), [displayStone]);
  useEffect(() => () => geometry.dispose(), [geometry]);

  const groupRef = useRef<THREE.Group>(null);
  const t = useRef(0);
  const age = useRef(0);
  const settleRoll = useRef(0);

  useFrame((state, dt) => {
    age.current += dt;
    const introDelayPassed = age.current > 1.15;
    const swapping = displayStone !== targetStone;
    const goal = swapping || !introDelayPassed ? 0 : 1;
    t.current = THREE.MathUtils.damp(t.current, goal, 13, dt);

    if (swapping && t.current < 0.035) {
      setDisplayStone(targetStone);
      t.current = 0.0001;
      settleRoll.current = 0.12;
    }

    const group = groupRef.current;
    if (!group) return;

    const formed = easeOutQuint(THREE.MathUtils.clamp(t.current, 0, 1));
    const [sx, sy, sz] = STONE_SCALE[displayStone];
    group.scale.set(sx * formed, sy * formed, sz * formed);

    settleRoll.current = THREE.MathUtils.damp(settleRoll.current, (1 - t.current) * 0.055, 10, dt);
    group.rotation.set(settleRoll.current * 0.28, settleRoll.current, -settleRoll.current * 0.2);
    group.position.y = Math.sin(state.clock.elapsedTime * 0.9) * 0.0018;
  });

  return (
    <group ref={groupRef}>
      <mesh geometry={geometry} castShadow receiveShadow>
        <MeshTransmissionMaterial
          background={envTexture}
          backside
          backsideThickness={0.1}
          samples={mobile ? 5 : 11}
          resolution={mobile ? 224 : 448}
          transmission={1}
          thickness={0.58}
          ior={2.42}
          chromaticAberration={0.018}
          anisotropicBlur={0.006}
          roughness={0}
          distortion={0.006}
          temporalDistortion={0.0015}
          clearcoat={1}
          clearcoatRoughness={0}
          attenuationDistance={3.4}
          attenuationColor="#f7fbff"
          color="#ffffff"
        />
      </mesh>
    </group>
  );
}
