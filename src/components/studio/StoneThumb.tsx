"use client";

import { useEffect, useMemo, useRef } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { gemGeometryFor, STONE_SCALE } from "@/components/three/gemGeometry";
import type { StoneId } from "@/lib/types";

function MiniStone({
  stone,
  selected,
}: {
  stone: StoneId;
  selected: boolean;
}) {
  const meshRef = useRef<THREE.Mesh>(null);
  const geometry = useMemo(() => gemGeometryFor(stone), [stone]);

  useEffect(() => () => geometry.dispose(), [geometry]);

  useFrame((state, dt) => {
    const mesh = meshRef.current;
    if (!mesh) return;
    mesh.rotation.y += dt * (selected ? 0.42 : 0.18);
    mesh.rotation.x = Math.sin(state.clock.elapsedTime * 0.45) * 0.06;
  });

  const [sx, sy, sz] = STONE_SCALE[stone];

  return (
    <group scale={[sx * 0.78, sy * 0.78, sz * 0.78]}>
      <mesh ref={meshRef} geometry={geometry} rotation={[0.18, 0.45, 0]}>
        <meshPhysicalMaterial
          color="#ffffff"
          roughness={0.02}
          metalness={0}
          transmission={0.9}
          thickness={0.55}
          ior={2.42}
          clearcoat={1}
          clearcoatRoughness={0}
          envMapIntensity={1.2}
          transparent
          opacity={0.96}
        />
      </mesh>
    </group>
  );
}

export function StoneThumb({
  stone,
  selected,
}: {
  stone: StoneId;
  selected: boolean;
}) {
  return (
    <div className="pointer-events-none h-12 w-14" aria-hidden>
      <Canvas
        dpr={[1, 1.5]}
        camera={{ position: [0, 0.18, 3.15], fov: 32 }}
        gl={{ antialias: true, alpha: true }}
      >
        <ambientLight intensity={0.9} />
        <directionalLight position={[2, 3, 4]} intensity={2.2} />
        <directionalLight position={[-3, 1, -2]} intensity={0.7} color="#c9a86a" />
        <MiniStone stone={stone} selected={selected} />
      </Canvas>
    </div>
  );
}
