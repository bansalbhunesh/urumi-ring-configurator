"use client";

import { useRef, useMemo, useEffect } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { Environment, Text, Float } from "@react-three/drei";
import * as THREE from "three";
import { useConfigurator } from "@/store/configurator";
import { METAL_BY_ID } from "@/lib/config";

function LaserSparks({ textLength }: { textLength: number }) {
  const pointsRef = useRef<THREE.Points>(null);
  
  const particleCount = 100;
  const positions = useMemo(() => new Float32Array(particleCount * 3), []);
  const velocities = useMemo(() => new Float32Array(particleCount * 3), []);
  const lifetimes = useMemo(() => new Float32Array(particleCount), []);
  
  // Track previous length to trigger sparks
  const prevLength = useRef(textLength);
  const active = useRef(false);
  const sparkTimer = useRef(0);

  useEffect(() => {
    if (textLength > prevLength.current) {
      active.current = true;
      sparkTimer.current = 0.5; // Sparks last 0.5s after typing
    }
    prevLength.current = textLength;
  }, [textLength]);

  useFrame((_, dt) => {
    if (!pointsRef.current) return;
    
    if (sparkTimer.current > 0) {
      sparkTimer.current -= dt;
    } else {
      active.current = false;
    }

    const pos = pointsRef.current.geometry.attributes.position.array as Float32Array;
    
    // The "laser head" position is roughly based on the text length
    const headX = (textLength * 0.12) - (40 * 0.12) / 2;

    for (let i = 0; i < particleCount; i++) {
      let l = lifetimes[i];
      l -= dt * 2.0;
      
      if (l <= 0 && active.current) {
        // Respawn particle at laser head
        l = Math.random() * 0.8 + 0.2;
        pos[i * 3] = headX + (Math.random() - 0.5) * 0.1;
        pos[i * 3 + 1] = (Math.random() - 0.5) * 0.1;
        pos[i * 3 + 2] = 0.5; // Slightly in front of the band
        
        // Explosion velocity
        velocities[i * 3] = (Math.random() - 0.5) * 2.0;
        velocities[i * 3 + 1] = (Math.random() - 0.5) * 2.0 - 1.0; // Bias downwards
        velocities[i * 3 + 2] = Math.random() * 2.0;
      }
      
      if (l > 0) {
        // Move particle
        pos[i * 3] += velocities[i * 3] * dt;
        pos[i * 3 + 1] += velocities[i * 3 + 1] * dt;
        pos[i * 3 + 2] += velocities[i * 3 + 2] * dt;
        // Gravity
        velocities[i * 3 + 1] -= 4.0 * dt;
      } else {
        // Hide dead particle
        pos[i * 3] = 999;
      }
      
      lifetimes[i] = l;
    }
    
    pointsRef.current.geometry.attributes.position.needsUpdate = true;
  });

  return (
    <points ref={pointsRef}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          args={[positions, 3]}
        />
      </bufferGeometry>
      <pointsMaterial
        size={0.05}
        color="#ffa500"
        transparent
        opacity={0.8}
        blending={THREE.AdditiveBlending}
        depthWrite={false}
      />
    </points>
  );
}

function EngravingBand({ text }: { text: string }) {
  const metalId = useConfigurator((s) => s.metal);
  const metal = METAL_BY_ID[metalId];
  const targetColor = useMemo(() => new THREE.Color(metal.color), [metal.color]);

  const matRef = useRef<THREE.MeshStandardMaterial>(null);

  useFrame((_, dt) => {
    if (matRef.current) {
      matRef.current.color.lerp(targetColor, 9 * dt);
      matRef.current.roughness = THREE.MathUtils.damp(matRef.current.roughness, metal.roughness, 9, dt);
    }
  });

  return (
    <Float speed={1.5} rotationIntensity={0.1} floatIntensity={0.1}>
      <group rotation={[0.1, 0, 0]}>
        {/* The Close-up Inner Band */}
        <mesh position={[0, 0, -2]}>
          <cylinderGeometry args={[5, 5, 1.5, 64, 1, true, Math.PI * 1.2, Math.PI * 0.6]} />
          <meshStandardMaterial
            ref={matRef}
            side={THREE.BackSide}
            metalness={1}
            envMapIntensity={2.0}
          />
        </mesh>

        {/* The Engraved Text */}
        <Text
          position={[0, 0, 2.95]}
          rotation={[0, Math.PI, 0]}
          fontSize={0.2}
          font="/fonts/inter-bold.woff" // Assuming a standard font, fallback is ok
          color="#ffcba4" // Glowing orange/gold color
          anchorX="center"
          anchorY="middle"
          fillOpacity={0.8}
        >
          {text}
          <meshBasicMaterial color="#ffcba4" toneMapped={false} />
        </Text>

        <LaserSparks textLength={text.length} />
      </group>
    </Float>
  );
}

export function EngravingCanvas({ text }: { text: string }) {
  return (
    <Canvas camera={{ position: [0, 0, 0], fov: 40 }} gl={{ antialias: true }}>
      <ambientLight intensity={0.2} />
      <spotLight position={[0, 5, -5]} intensity={2} angle={0.5} penumbra={1} />
      <Environment preset="city" environmentIntensity={0.5} />
      <EngravingBand text={text} />
    </Canvas>
  );
}
