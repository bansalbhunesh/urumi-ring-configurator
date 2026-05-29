"use client";

import { useMemo, useRef } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { Environment, Lightformer } from "@react-three/drei";
import * as THREE from "three";
import { gemGeometryFor, STONE_SCALE } from "./gemGeometry";
import type { StoneId } from "@/lib/types";

/* A live miniature of the actual centre-stone cut — same geometry, same
   physical diamond look as the ring — so the picker matches the result. Kept
   cheap: tiny canvas, dpr 1, core MeshPhysicalMaterial transmission (no FBO),
   pointer-events disabled so the parent button owns the click. */

function ThumbGem({ stone, active }: { stone: StoneId; active: boolean }) {
  const geo = useMemo(() => gemGeometryFor(stone), [stone]);
  const ref = useRef<THREE.Group>(null);
  const [sx, sy, sz] = STONE_SCALE[stone];

  useFrame((_, dt) => {
    if (ref.current) ref.current.rotation.y += dt * (active ? 0.9 : 0.5);
  });

  return (
    <group ref={ref} scale={[sx * 2.6, sy * 2.6, sz * 2.6]}>
      <mesh geometry={geo}>
        <meshPhysicalMaterial
          transmission={1}
          thickness={0.4}
          ior={2.4}
          roughness={0.02}
          metalness={0}
          clearcoat={1}
          clearcoatRoughness={0}
          attenuationDistance={2}
          attenuationColor="#ffffff"
          color="#ffffff"
          envMapIntensity={2.2}
        />
      </mesh>
    </group>
  );
}

export default function StoneThumb({
  stone,
  active = false,
}: {
  stone: StoneId;
  active?: boolean;
}) {
  return (
    <Canvas
      dpr={1}
      camera={{ position: [0, 0, 2.3], fov: 35 }}
      gl={{ alpha: true, antialias: true }}
      style={{ width: "100%", height: "100%", pointerEvents: "none" }}
      frameloop="always"
    >
      <ambientLight intensity={0.6} />
      <directionalLight position={[2, 3, 2]} intensity={1.2} />
      <Environment resolution={64}>
        <color attach="background" args={["#cfc7b8"]} />
        <Lightformer form="rect" intensity={3} position={[0, 3, 2]} scale={[6, 4, 1]} color="#fff6e8" />
        <Lightformer form="rect" intensity={2.2} position={[0, 0, 4]} scale={[6, 6, 1]} color="#ffffff" />
        <Lightformer form="rect" intensity={2} position={[-3, 1, 1]} scale={[3, 4, 1]} color="#eef2ff" />
      </Environment>
      <ThumbGem stone={stone} active={active} />
    </Canvas>
  );
}
