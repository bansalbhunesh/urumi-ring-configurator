"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import { MeshTransmissionMaterial } from "@react-three/drei";
import * as THREE from "three";
import { useStoneGeometries } from "./stones";
import { useConfigurator } from "@/store/configurator";
import type { StoneId } from "@/lib/types";

function easeOutQuint(x: number) {
  return 1 - Math.pow(1 - x, 5);
}

const BURST_COUNT = 90;

/* A short-lived cloud of light motes — the old stone "dissolves" into them as a
   new cut is chosen, then they drift up and fade. */
function makeBurstGeometry() {
  const pos = new Float32Array(BURST_COUNT * 3);
  const vel = new Float32Array(BURST_COUNT * 3);
  for (let i = 0; i < BURST_COUNT; i++) {
    const dir = new THREE.Vector3(
      Math.random() * 2 - 1,
      Math.random() * 2 - 1,
      Math.random() * 2 - 1,
    ).normalize();
    const r = 0.05 + Math.random() * 0.05;
    pos[i * 3] = dir.x * r;
    pos[i * 3 + 1] = dir.y * r;
    pos[i * 3 + 2] = dir.z * r;
    vel[i * 3] = dir.x;
    vel[i * 3 + 1] = Math.abs(dir.y) * 0.6 + 0.5; // bias upward
    vel[i * 3 + 2] = dir.z;
  }
  const geo = new THREE.BufferGeometry();
  geo.setAttribute("position", new THREE.BufferAttribute(pos, 3));
  geo.setAttribute("aVel", new THREE.BufferAttribute(vel, 3));
  return geo;
}

/* The configured centre stone — real faceted geometry inside a transmission
   material so light actually passes through and refracts (no flat black facet).
   On every change the previous cut bursts into motes and the new one drops in
   and forms. */
export function StoneGem({ mobile }: { mobile: boolean }) {
  const targetStone = useConfigurator((s) => s.stone);
  const geos = useStoneGeometries();
  const [displayStone, setDisplayStone] = useState<StoneId>(targetStone);
  const geometry = geos[displayStone];

  const { scene } = useThree();
  const envTexture = (scene.environment as THREE.Texture | null) ?? undefined;

  const groupRef = useRef<THREE.Group>(null);
  const burstRef = useRef<THREE.Points>(null);
  const burstGeo = useMemo(() => makeBurstGeometry(), []);
  useEffect(() => () => burstGeo.dispose(), [burstGeo]);

  const t = useRef(0); // 0 dissolved → 1 formed
  const age = useRef(0);
  const burst = useRef(0); // 1 just-burst → 0 gone

  useFrame((state, dt) => {
    age.current += dt;
    const introDone = age.current > 0.7;
    const swapping = displayStone !== targetStone;
    const goal = swapping || !introDone ? 0 : 1;
    t.current = THREE.MathUtils.damp(t.current, goal, 12, dt);

    if (swapping && t.current < 0.05) {
      burst.current = 1; // fire motes from the dissolving stone
      setDisplayStone(targetStone);
      t.current = 0.0001;
    }

    const g = groupRef.current;
    if (g) {
      const formed = easeOutQuint(THREE.MathUtils.clamp(t.current, 0, 1));
      g.scale.setScalar(Math.max(0.0001, formed));
      g.position.y = (1 - formed) * 0.55; // drops into the basket as it forms
      g.rotation.y += dt * 0.22;
      g.visible = formed > 0.004;
    }

    const pts = burstRef.current;
    if (pts) {
      burst.current = Math.max(0, burst.current - dt * 1.25);
      const life = burst.current;
      pts.visible = life > 0.01;
      const mat = pts.material as THREE.PointsMaterial;
      mat.opacity = life * 0.9;
      const spread = (1 - life) * 1.9;
      const posAttr = pts.geometry.getAttribute("position") as THREE.BufferAttribute;
      const velAttr = pts.geometry.getAttribute("aVel") as THREE.BufferAttribute;
      for (let i = 0; i < BURST_COUNT; i++) {
        posAttr.setXYZ(
          i,
          velAttr.getX(i) * spread * 0.5,
          velAttr.getY(i) * spread * 0.5,
          velAttr.getZ(i) * spread * 0.5,
        );
      }
      posAttr.needsUpdate = true;
    }
  });

  return (
    <group>
      <group ref={groupRef}>
        <mesh geometry={geometry} castShadow>
          <MeshTransmissionMaterial
            background={envTexture}
            samples={mobile ? 4 : 8}
            resolution={mobile ? 256 : 512}
            transmission={1}
            thickness={0.4}
            ior={2.42}
            chromaticAberration={0.05}
            anisotropicBlur={0.08}
            roughness={0}
            distortion={0}
            clearcoat={1}
            clearcoatRoughness={0}
            attenuationDistance={3}
            attenuationColor="#ffffff"
            color="#ffffff"
          />
        </mesh>
      </group>

      <points ref={burstRef} geometry={burstGeo} visible={false}>
        <pointsMaterial
          size={0.05}
          color="#ffe6bd"
          transparent
          opacity={0}
          depthWrite={false}
          blending={THREE.AdditiveBlending}
          sizeAttenuation
        />
      </points>
    </group>
  );
}
