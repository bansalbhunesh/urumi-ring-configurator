"use client";

import { useEffect, useMemo, useRef } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";
import { METAL_BY_ID } from "@/lib/config";
import { useConfigurator } from "@/store/configurator";
import { Gem } from "./Gem";

/* ----------------------------------------------------------------------------
   Procedural "twist" engagement ring — modelled on the Do Amore twist solitaire.

   Two metal strands run the full circle of the band. The twist between them is
   not uniform: a smooth bump function concentrates the winding at the top
   shoulders and lets it fall to zero at the bottom, so the lower shank reads as
   one clean comfort-fit band while the shoulders open into a symmetric twist
   that sweeps up and cradles a raised solitaire — the signature of the
   reference ring, rather than a uniform rope eternity band.
---------------------------------------------------------------------------- */

const RING_RADIUS = 1;
const STRAND_TUBE = 0.058;
const SEPARATION = 0.072;
const HALF_TURNS = 3; // half-twists from bottom up to the top, per shoulder

const GEM_Y = 1.34;
const GEM_SCALE = 1.35;

class TwistStrand extends THREE.Curve<THREE.Vector3> {
  constructor(private phase: number) {
    super();
  }
  getPoint(t: number, target = new THREE.Vector3()) {
    const theta = t * Math.PI * 2;
    const a = theta + Math.PI / 2; // 0 at the bottom (-Y), PI at the top (+Y)
    const g = (1 - Math.cos(a)) / 2; // smooth 0 -> 1 -> 0, peaks at the top
    const psi = HALF_TURNS * Math.PI * g + this.phase;

    const cx = Math.cos(theta) * RING_RADIUS;
    const cy = Math.sin(theta) * RING_RADIUS;
    const nx = Math.cos(theta);
    const ny = Math.sin(theta);

    // offset rotates from the finger axis (z) at the bottom into the radial
    // plane as it climbs — the strands lie side by side low, twist up high.
    const offN = SEPARATION * Math.sin(psi);
    const offB = SEPARATION * Math.cos(psi);
    target.set(cx + nx * offN, cy + ny * offN, offB);
    return target;
  }
}

export function TwistRing({ mobile }: { mobile: boolean }) {
  const metalId = useConfigurator((s) => s.metal);
  const metal = METAL_BY_ID[metalId];

  const { strandA, strandB } = useMemo(
    () => ({
      strandA: new THREE.TubeGeometry(new TwistStrand(0), 600, STRAND_TUBE, 18, true),
      strandB: new THREE.TubeGeometry(new TwistStrand(Math.PI), 600, STRAND_TUBE, 18, true),
    }),
    [],
  );

  const metalMat = useMemo(
    () =>
      new THREE.MeshStandardMaterial({
        color: new THREE.Color(metal.color),
        metalness: 1,
        roughness: metal.roughness,
        envMapIntensity: 1.55,
      }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [],
  );

  const targetColor = useMemo(() => new THREE.Color(metal.color), [metal.color]);
  const targetRough = metal.roughness;

  useFrame((_, dt) => {
    metalMat.color.lerp(targetColor, 1 - Math.exp(-9 * dt));
    metalMat.roughness = THREE.MathUtils.damp(metalMat.roughness, targetRough, 9, dt);
  });

  // The ring is aware it's being watched: it leans toward the cursor and
  // breathes a fraction of a percent at rest — alive, not animated.
  const tiltRef = useRef<THREE.Group>(null);
  const pointer = useThree((s) => s.pointer);
  useFrame((state) => {
    const g = tiltRef.current;
    if (!g) return;
    g.rotation.x += (-pointer.y * 0.12 - g.rotation.x) * 0.06;
    g.rotation.y += (pointer.x * 0.18 - g.rotation.y) * 0.06;
    const breath = 1 + Math.sin(state.clock.elapsedTime * 1.5708) * 0.004;
    g.scale.setScalar(breath);
  });

  useEffect(() => {
    return () => {
      strandA.dispose();
      strandB.dispose();
      metalMat.dispose();
    };
  }, [strandA, strandB, metalMat]);

  const prongs = useMemo(
    () => [0, 1, 2, 3].map((i) => (i * Math.PI) / 2 + Math.PI / 4),
    [],
  );

  return (
    <group ref={tiltRef}>
      <mesh geometry={strandA} material={metalMat} castShadow receiveShadow />
      <mesh geometry={strandB} material={metalMat} castShadow receiveShadow />

      {/* Setting: basket gallery + four prongs cradling the raised solitaire */}
      <group position={[0, GEM_Y, 0]}>
        <mesh position={[0, -0.22, 0]} material={metalMat} castShadow>
          <torusGeometry args={[0.205, 0.024, 14, 44]} />
        </mesh>
        {prongs.map((ang, i) => {
          const r = 0.235;
          return (
            <mesh
              key={i}
              position={[Math.cos(ang) * r, -0.05, Math.sin(ang) * r]}
              rotation={[Math.sin(ang) * 0.3, 0, -Math.cos(ang) * 0.3]}
              material={metalMat}
              castShadow
            >
              <cylinderGeometry args={[0.018, 0.028, 0.36, 12]} />
            </mesh>
          );
        })}

        <group scale={GEM_SCALE}>
          <Gem mobile={mobile} />
        </group>
      </group>
    </group>
  );
}
