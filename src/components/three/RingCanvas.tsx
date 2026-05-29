"use client";

import { Suspense, useRef } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import {
  Environment,
  Float,
  ContactShadows,
  OrbitControls,
  PerspectiveCamera,
} from "@react-three/drei";
import type { OrbitControls as OrbitControlsImpl } from "three-stdlib";
import * as THREE from "three";
import { TwistRing } from "./TwistRing";

export function RingCanvas({ mobile = false }: { mobile?: boolean }) {
  return (
    <div className="absolute inset-0 z-0 h-full w-full">
      <Canvas shadows dpr={[1, 2]} gl={{ antialias: true, alpha: true }}>
        {/* The Camera: Static, focused on the ring */}
        <PerspectiveCamera makeDefault position={[mobile ? 0 : 1.5, 0.5, 4.0]} fov={30} />
        
        {/* Full 360 Interaction */}
        <OrbitControls
          enableZoom={false}
          enablePan={false}
          enableDamping
          dampingFactor={0.05}
          autoRotate
          autoRotateSpeed={0.5}
          minPolarAngle={Math.PI / 4}
          maxPolarAngle={Math.PI - Math.PI / 4}
        />

        {/* Studio Lighting */}
        <Environment preset="city" environmentIntensity={0.8} />
        
        {/* A dramatic spotlight from above/left to catch the twists */}
        <spotLight
          position={[-5, 8, 5]}
          angle={0.4}
          penumbra={1}
          intensity={3}
          castShadow
          shadow-bias={-0.0001}
        />
        
        {/* Fill light */}
        <ambientLight intensity={0.4} />

        <Suspense fallback={null}>
          <Float speed={2} rotationIntensity={0.1} floatIntensity={0.2}>
            {/* The Ring Model */}
            <TwistRing mobile={mobile} />
          </Float>

          {/* Contact shadow for grounding in the Studio */}
          <ContactShadows
            position={[0, -1.2, 0]}
            opacity={0.6}
            scale={5}
            blur={2.5}
            far={4}
            color="#3a3026"
          />
        </Suspense>
      </Canvas>
    </div>
  );
}
