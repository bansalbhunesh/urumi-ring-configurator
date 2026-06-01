"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import { MeshTransmissionMaterial } from "@react-three/drei";
import * as THREE from "three";
import { gemGeometryFor, STONE_SCALE } from "./gemGeometry";
import { useConfigurator } from "@/store/configurator";
import type { StoneId } from "@/lib/types";

/* ----------------------------------------------------------------------------
   The centre stone — a 16-facet brilliant rendered with physically-based
   transmission. backside={true} enables two-pass refraction (renders back
   faces separately) giving the internal-reflection depth a real diamond has.
   Tuned for low chromaticAberration so facets stay crisp rather than muddy.
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

  useFrame((state, dt) => {
    age.current += dt;
    const introDelayPassed = age.current > 1.2;
    const swapping = displayStone !== targetStone;

    const goal = (swapping || !introDelayPassed) ? 0 : 1;
    t.current = THREE.MathUtils.damp(t.current, goal, 13, dt);

    if (swapping && t.current < 0.04) {
      setDisplayStone(targetStone);
      t.current = 0.0001;
    }

    const g = groupRef.current;
    if (g) {
      const pop = easeOutBack(THREE.MathUtils.clamp(t.current, 0, 1));
      const [sx, sy, sz] = STONE_SCALE[displayStone];
      g.scale.set(sx * pop, sy * pop, sz * pop);
      // Spin during swap / intro only — holds still once formed
      const spinRate = (1 - t.current) * 4.2;
      g.rotation.y += dt * spinRate;
      // Gentle idle sparkle shimmer: subtle y-oscillation catches light differently
      g.position.y = Math.sin(state.clock.elapsedTime * 1.3) * 0.004;
    }

    void state;
  });

  return (
    <group ref={groupRef}>
      <mesh geometry={geometry} castShadow receiveShadow>
        <MeshTransmissionMaterial
          /* Two-pass refraction — renders the inside of the gem for correct
             internal reflections. This single prop is responsible for the
             "depth inside the diamond" effect. */
          backside
          backsideThickness={0.12}
          samples={mobile ? 6 : 12}
          resolution={mobile ? 256 : 512}
          transmission={1}
          thickness={0.72}
          ior={2.42}
          /* Lower chromatic aberration = crisp fire, not muddy blur.
             0.022 gives subtle rainbow dispersion at facet edges. */
          chromaticAberration={0.022}
          anisotropicBlur={0.04}
          roughness={0}
          distortion={0.04}
          temporalDistortion={0.02}
          clearcoat={1}
          clearcoatRoughness={0}
          attenuationDistance={2.4}
          attenuationColor="#ffffff"
          color="#ffffff"
        />
      </mesh>
    </group>
  );
}
