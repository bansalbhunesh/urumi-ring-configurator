"use client";

import { useEffect, useMemo, useRef } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { Environment, Lightformer } from "@react-three/drei";
import * as THREE from "three";
import { gemGeometryFor, STONE_SCALE } from "@/components/three/gemGeometry";
import type { StoneId } from "@/lib/types";

function StoneMiniature({
  stone,
  selected,
}: {
  stone: StoneId;
  selected: boolean;
}) {
  const geometry = useMemo(() => gemGeometryFor(stone), [stone]);
  const groupRef = useRef<THREE.Group>(null);

  useEffect(() => () => geometry.dispose(), [geometry]);

  useFrame((state, dt) => {
    const group = groupRef.current;
    if (!group) return;
    const baseYaw = selected ? -0.45 : -0.25;
    const idle = Math.sin(state.clock.elapsedTime * 0.9) * (selected ? 0.08 : 0.035);
    group.rotation.y = THREE.MathUtils.damp(group.rotation.y, baseYaw + idle, 6, dt);
    group.rotation.x = THREE.MathUtils.damp(group.rotation.x, 0.62, 6, dt);
    group.position.y = Math.sin(state.clock.elapsedTime * 1.2) * 0.006;
  });

  const [sx, sy, sz] = STONE_SCALE[stone];

  return (
    <group ref={groupRef} scale={[sx * 3.8, sy * 3.8, sz * 3.8]}>
      <mesh geometry={geometry}>
        <meshPhysicalMaterial
          color="#f4fbff"
          emissive="#7a98ad"
          emissiveIntensity={selected ? 0.16 : 0.08}
          metalness={0}
          roughness={0.08}
          transmission={0.22}
          thickness={0.2}
          ior={2.42}
          transparent={false}
          envMapIntensity={selected ? 3.8 : 2.6}
          specularIntensity={selected ? 2.2 : 1.45}
          attenuationColor="#f7fbff"
          attenuationDistance={2.6}
          clearcoat={1}
          clearcoatRoughness={0}
          flatShading
        />
      </mesh>
      <lineSegments>
        <edgesGeometry args={[geometry, 18]} />
        <lineBasicMaterial color={selected ? "#f7e3ae" : "#b9c8d2"} transparent opacity={selected ? 0.58 : 0.34} />
      </lineSegments>
    </group>
  );
}

function ThumbLights() {
  return (
    <>
      <ambientLight intensity={0.28} />
      <Environment resolution={64} frames={1} environmentIntensity={1.2}>
        <Lightformer form="rect" intensity={4.8} color="#fff8ee" position={[-2, 2, 2]} scale={[3, 2.2, 1]} />
        <Lightformer form="rect" intensity={3.2} color="#ffffff" position={[2, 0.7, 2.4]} scale={[0.8, 3, 1]} />
        <Lightformer form="ring" intensity={2.4} color="#dce8ff" position={[0, 1.8, -2]} scale={[2, 2, 1]} />
      </Environment>
      <pointLight position={[1.5, -1, 2]} intensity={0.42} color="#e8c28b" />
    </>
  );
}

export function StoneThumb({ stone, selected }: { stone: StoneId; selected: boolean }) {
  return (
    <div
      className={`stone-sample stone-sample-3d flex h-14 w-14 items-center justify-center transition-opacity duration-300 ${
        selected ? "is-selected" : ""
      }`}
      style={{ opacity: selected ? 1 : 0.72 }}
      aria-hidden
    >
      <Canvas
        dpr={[1, 1.5]}
        gl={{ antialias: true, alpha: true, powerPreference: "low-power" }}
        camera={{ position: [0, 0.12, 1.25], fov: 32 }}
        style={{ height: "100%", width: "100%", pointerEvents: "none" }}
      >
        <ThumbLights />
        <StoneMiniature stone={stone} selected={selected} />
      </Canvas>
    </div>
  );
}
