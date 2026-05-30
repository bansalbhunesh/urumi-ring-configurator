"use client";

import { Suspense, useEffect, useMemo, useRef, useState } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import {
  Environment,
  Float,
  ContactShadows,
  OrbitControls,
  PerspectiveCamera,
  Text,
} from "@react-three/drei";
import * as THREE from "three";
import { TwistRing } from "./TwistRing";
import { Gem } from "./Gem";
import { METAL_BY_ID } from "@/lib/config";
import {
  useConfigurator,
  getScrollY,
  setWorldBend,
  setInsideWormhole,
} from "@/store/configurator";

// Crystalline star constellation background for the Specs section
function SpecConstellation() {
  const pointsRef = useRef<THREE.Group>(null);
  const count = 350;
  
  const [positions, lineGeometry] = useMemo(() => {
    const pos = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      // Create a wide sphere/cloud distribution
      const theta = THREE.MathUtils.randFloat(0, Math.PI * 2);
      const phi = THREE.MathUtils.randFloat(0, Math.PI);
      const r = THREE.MathUtils.randFloat(4, 9);
      
      pos[i * 3] = r * Math.sin(phi) * Math.cos(theta);
      pos[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta);
      pos[i * 3 + 2] = r * Math.cos(phi);
    }

    // Connect stars that are close to each other with lines
    const lineIndices: number[] = [];
    for (let i = 0; i < count; i++) {
      const vA = new THREE.Vector3(pos[i * 3], pos[i * 3 + 1], pos[i * 3 + 2]);
      for (let j = i + 1; j < count; j++) {
        const vB = new THREE.Vector3(pos[j * 3], pos[j * 3 + 1], pos[j * 3 + 2]);
        if (vA.distanceTo(vB) < 1.6) {
          lineIndices.push(i, j);
        }
      }
    }

    const lineGeo = new THREE.BufferGeometry();
    lineGeo.setAttribute("position", new THREE.BufferAttribute(pos, 3));
    lineGeo.setIndex(lineIndices);

    return [pos, lineGeo];
  }, []);

  useFrame((state) => {
    const scrollY = getScrollY();
    const height = typeof window !== "undefined" ? window.innerHeight : 1000;
    const s = scrollY / (height || 1);
    
    // Toggle visibility dynamically inside R3F without triggering React re-renders
    const isVisible = s >= 4.6 && s <= 6.0;
    
    if (pointsRef.current) {
      pointsRef.current.visible = isVisible;
      if (isVisible) {
        pointsRef.current.rotation.y = state.clock.elapsedTime * 0.02;
        pointsRef.current.rotation.x = state.clock.elapsedTime * 0.01;
      }
    }
  });

  return (
    <group ref={pointsRef} visible={false}>
      <points>
        <bufferGeometry>
          <bufferAttribute attach="attributes-position" args={[positions, 3]} />
        </bufferGeometry>
        <pointsMaterial
          size={0.06}
          color="#c9a86a"
          transparent
          opacity={0.65}
          blending={THREE.AdditiveBlending}
        />
      </points>
      <lineSegments geometry={lineGeometry}>
        <lineBasicMaterial
          color="#b08d57"
          transparent
          opacity={0.12}
          blending={THREE.AdditiveBlending}
        />
      </lineSegments>
    </group>
  );
}

// Hyperspace warp sparks for the Interstellar corridor
function LaserSparks({ active }: { active: boolean }) {
  const pointsRef = useRef<THREE.Points>(null);
  const count = 120;
  
  const [positions, velocities, lifetimes] = useMemo(() => {
    const pos = new Float32Array(count * 3);
    const vels = new Float32Array(count * 3);
    const life = new Float32Array(count);
    
    for (let i = 0; i < count; i++) {
      life[i] = Math.random();
      // Scatter in a cylinder
      const angle = Math.random() * Math.PI * 2;
      const r = 0.5 + Math.random() * 1.8;
      pos[i * 3] = Math.cos(angle) * r;
      pos[i * 3 + 1] = Math.sin(angle) * r;
      pos[i * 3 + 2] = THREE.MathUtils.randFloat(-6, 6);
      
      vels[i * 3] = 0;
      vels[i * 3 + 1] = 0;
      vels[i * 3 + 2] = THREE.MathUtils.randFloat(3, 7); // Speed along Z axis
    }
    return [pos, vels, life];
  }, []);

  useFrame((_, dt) => {
    if (!pointsRef.current) return;
    const array = pointsRef.current.geometry.attributes.position.array as Float32Array;

    for (let i = 0; i < count; i++) {
      // Speed up flow when active
      const speedMult = active ? 2.5 : 0.8;
      array[i * 3 + 2] += velocities[i * 3 + 2] * dt * speedMult;
      
      // If particles exit front of camera, wrap them back to the far end
      if (array[i * 3 + 2] > 5) {
        array[i * 3 + 2] = -7;
        const angle = Math.random() * Math.PI * 2;
        const r = 0.6 + Math.random() * 1.6;
        array[i * 3] = Math.cos(angle) * r;
        array[i * 3 + 1] = Math.sin(angle) * r;
      }
    }
    pointsRef.current.geometry.attributes.position.needsUpdate = true;
  });

  return (
    <points ref={pointsRef}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
      </bufferGeometry>
      <pointsMaterial
        size={0.05}
        color="#ffa63b"
        transparent
        opacity={active ? 0.75 : 0.2}
        blending={THREE.AdditiveBlending}
        depthWrite={false}
      />
    </points>
  );
}

// Giant physical corridor cylinder for the Interstellar Engraving Zoom
function EngravingCorridor({ text, visible }: { text: string; visible: boolean }) {
  const metalId = useConfigurator((s) => s.metal);
  const metal = METAL_BY_ID[metalId];
  const matRef = useRef<THREE.MeshStandardMaterial>(null);
  const textMatRef = useRef<THREE.MeshBasicMaterial>(null);
  const localText = useRef(text);
  const textPulse = useRef(0);

  // Smooth typing effect sparks
  useEffect(() => {
    localText.current = text;
    textPulse.current = 1.0; // Flash full bright on type
  }, [text]);

  useFrame((state, dt) => {
    if (matRef.current) {
      matRef.current.color.lerp(new THREE.Color(metal.color), 8 * dt);
      matRef.current.roughness = THREE.MathUtils.damp(matRef.current.roughness, metal.roughness, 8, dt);
    }
    if (textMatRef.current) {
      textPulse.current = THREE.MathUtils.damp(textPulse.current, 0.0, 5, dt);
      // Base glowing amber look + spark flash when typing
      const pulseColor = new THREE.Color("#ffa63b").multiplyScalar(1.0 + textPulse.current * 2.5);
      textMatRef.current.color.copy(pulseColor);
    }
  });

  if (!visible) return null;

  return (
    <group position={[0, 0, 0]}>
      {/* Curved corridor band - ROTATED Math.PI/2 on X to align with Z-axis flight path */}
      <mesh position={[0, 0, 0]} rotation={[Math.PI / 2, 0, 0]}>
        <cylinderGeometry args={[2.0, 2.0, 10, 64, 1, true]} />
        <meshStandardMaterial
          ref={matRef}
          side={THREE.BackSide}
          metalness={1.0}
          envMapIntensity={2.5}
        />
      </mesh>

      {/* Engraving Inscription floating centered at the far end of the tunnel */}
      <Text
        position={[0, 0, 4.5]}
        rotation={[0, Math.PI, 0]}
        fontSize={0.15}
        color="#ffa63b"
        anchorX="center"
        anchorY="middle"
        fillOpacity={0.9}
      >
        {text || "YOUR MESSAGE HERE"}
        <meshBasicMaterial ref={textMatRef} toneMapped={false} />
      </Text>

      <LaserSparks active={text.length > 0} />
    </group>
  );
}

// Camera flight controller & Scroll animator
function ScrollDirector({
  isDesktop,
  controlsRef,
  ringGroupRef,
}: {
  isDesktop: boolean;
  controlsRef: React.RefObject<any>;
  ringGroupRef: React.RefObject<THREE.Group>;
}) {
  const engraving = useConfigurator((s) => s.engraving);
  
  const camPos = useRef(new THREE.Vector3(0, 0, 10));
  const camLook = useRef(new THREE.Vector3(0, 0, 0));
  const currentBend = useRef(0);
  const currentWormhole = useRef(false);
  const currentScale = useRef(1.0);

  useFrame((state, dt) => {
    const scrollY = getScrollY();
    const height = typeof window !== "undefined" ? window.innerHeight : 1000;
    const s = scrollY / (height || 1);

    // Dynamic enable/disable of OrbitControls via ref (No React re-renders)
    if (controlsRef.current) {
      controlsRef.current.enabled = (s > 0.35 && s < 1.35);
    }

    // Coordinate maps
    const targetPos = new THREE.Vector3();
    const targetLook = new THREE.Vector3();
    let bend = 0;
    let wormholeActive = false;
    let targetScaleValue = 1.0;

    if (s <= 1.0) {
      // Phase 1: Cosmic / Studio Hero
      // Centered at s = 0 for full epic screen opening, glides to right column at s = 1.0
      // Negative X shifts camera left, which shifts origin right (right column)
      const t = s;
      targetPos.set(
        THREE.MathUtils.lerp(0, isDesktop ? -1.65 : 0, t),
        THREE.MathUtils.lerp(0.4, isDesktop ? -0.1 : 0.8, t),
        THREE.MathUtils.lerp(7.0, 7.5, t)
      );
      targetLook.set(
        THREE.MathUtils.lerp(0, isDesktop ? -0.25 : 0, t),
        THREE.MathUtils.lerp(0.4, isDesktop ? 0.5 : 0.8, t),
        0
      );
      bend = 0;
      targetScaleValue = 1.0;
    } else if (s <= 2.2) {
      // Phase 2: Inception Space Bend (Craft Section)
      // Camera executes orbital sweep; scale down ring to prevent overlapping text cards
      const t = (s - 1.0) / 1.2;
      const angle = t * Math.PI * 1.2;
      const r = 7.5 - t * 1.5;
      
      targetPos.set(
        Math.sin(angle + state.clock.elapsedTime * 0.05) * r,
        -0.1 + t * 1.2,
        Math.cos(angle + state.clock.elapsedTime * 0.05) * r
      );
      targetLook.set(0, 0.4, 0);
      bend = t * 1.8; // Heavy world bending curve active!
      targetScaleValue = isDesktop ? 0.72 : 0.55; // scale down
    } else if (s <= 3.5) {
      // Phase 3: Diamond Zoom (Materials Section)
      const t = (s - 2.2) / 1.3;
      targetPos.set(
        THREE.MathUtils.lerp(0, 0, t),
        THREE.MathUtils.lerp(1.1, 1.62, t),
        THREE.MathUtils.lerp(6.0, 1.9, t)
      );
      targetLook.set(0, 1.34, 0); // Directly focus gem center
      bend = (1 - t) * 1.8; // Morph back to straight geometric diamond
      targetScaleValue = THREE.MathUtils.lerp(isDesktop ? 0.72 : 0.55, 1.0, t);
    } else if (s <= 4.8) {
      // Phase 4: Interstellar Wormhole Inside Ring (Engraving)
      const t = (s - 3.5) / 1.3;
      wormholeActive = true;
      targetPos.set(
        0,
        THREE.MathUtils.lerp(1.62, 0, t),
        THREE.MathUtils.lerp(1.9, -1.8, t)
      );
      targetLook.set(0, 0, 3); // Fly looking straight down the corridor
    } else if (s <= 5.8) {
      // Phase 5: Doctor Strange Multiverse Split (Technical Specs)
      const t = (s - 4.8) / 1.0;
      const angle = t * Math.PI * 0.4;
      targetPos.set(
        Math.sin(angle) * 7.5,
        2.5,
        Math.cos(angle) * 7.5
      );
      targetLook.set(0, 0.5, 0);
      targetScaleValue = isDesktop ? 0.75 : 0.6;
    } else {
      // Phase 6: Reunion CTA (Closing Section)
      const t = Math.min(1.0, (s - 5.8) / 0.5);
      targetPos.set(
        THREE.MathUtils.lerp(7.5, 0, t),
        THREE.MathUtils.lerp(2.5, 0.6, t),
        THREE.MathUtils.lerp(0, 7.2, t)
      );
      targetLook.set(0, 0.6, 0);
      targetScaleValue = THREE.MathUtils.lerp(isDesktop ? 0.75 : 0.6, 1.0, t);
    }

    // Heavy cinematic glide physics (lerp over dt)
    camPos.current.lerp(targetPos, 1 - Math.exp(-4.5 * dt));
    camLook.current.lerp(targetLook, 1 - Math.exp(-4.5 * dt));
    currentBend.current = THREE.MathUtils.damp(currentBend.current, bend, 4.5, dt);
    currentScale.current = THREE.MathUtils.damp(currentScale.current, targetScaleValue, 4.5, dt);
    
    // Smooth crossfade to inside cylinder
    if (wormholeActive && !currentWormhole.current) {
      currentWormhole.current = true;
      setInsideWormhole(true);
    } else if (!wormholeActive && currentWormhole.current) {
      currentWormhole.current = false;
      setInsideWormhole(false);
    }

    setWorldBend(currentBend.current);

    // Apply scale dampening directly to TwistRing group to prevent text overlap
    if (ringGroupRef.current) {
      ringGroupRef.current.scale.setScalar(currentScale.current);
    }

    // Apply vectors to camera
    state.camera.position.copy(camPos.current);
    state.camera.lookAt(camLook.current);
  });

  return (
    <>
      <ambientLight intensity={currentWormhole.current ? 0.35 : 0.45} />
      {/* Studio environments */}
      {!currentWormhole.current && (
        <>
          <Environment preset="city" environmentIntensity={0.8} />
          <spotLight
            position={[-5, 8, 5]}
            angle={0.4}
            penumbra={1}
            intensity={3.5}
            castShadow
            shadow-bias={-0.0001}
          />
          <ContactShadows
            position={[0, -1.2, 0]}
            opacity={0.6}
            scale={5}
            blur={2.5}
            far={4}
            color="#3a3026"
          />
        </>
      )}

      {currentWormhole.current && (
        <>
          <Environment preset="night" environmentIntensity={0.5} />
          <pointLight position={[0, 0, 0]} intensity={2.0} color="#ffa63b" />
          <spotLight position={[0, 3, -4]} angle={0.8} intensity={4.0} color="#ffdfb0" />
        </>
      )}

      {/* Renders models inside global viewport */}
      <Suspense fallback={null}>
        {!currentWormhole.current && (
          <group ref={ringGroupRef}>
            <Float speed={1.5} rotationIntensity={0.06} floatIntensity={0.06}>
              <TwistRing mobile={!isDesktop} />
            </Float>
          </group>
        )}
        
        <EngravingCorridor text={engraving} visible={currentWormhole.current} />
      </Suspense>
    </>
  );
}

export function GlobalCanvas() {
  const [isDesktop, setIsDesktop] = useState(false);
  const controlsRef = useRef<any>(null);
  const ringGroupRef = useRef<THREE.Group>(null);

  useEffect(() => {
    const checkSize = () => {
      setIsDesktop(window.innerWidth >= 1024);
    };
    checkSize();
    window.addEventListener("resize", checkSize);
    return () => window.removeEventListener("resize", checkSize);
  }, []);

  return (
    <div className="fixed inset-0 z-0 h-full w-full pointer-events-none">
      {/* Allow full Orbit interaction on Studio Configurator page click margins */}
      <Canvas
        shadows
        dpr={[1, 2]}
        gl={{ antialias: true, alpha: true }}
        style={{ pointerEvents: "auto" }}
      >
        <PerspectiveCamera makeDefault position={[0, 0.5, 7.5]} fov={35} />

        <ScrollDirector
          isDesktop={isDesktop}
          controlsRef={controlsRef}
          ringGroupRef={ringGroupRef}
        />

        {/* Orbit Interaction active exclusively when viewing the studio configurator section */}
        <OrbitControls
          ref={controlsRef}
          enableZoom={false}
          enablePan={false}
          enableDamping
          dampingFactor={0.06}
          enabled={false} // Initially managed directly inside ScrollDirector via ref
          minPolarAngle={Math.PI / 4}
          maxPolarAngle={Math.PI - Math.PI / 4}
        />

        {/* Doctor Strange Specs Background */}
        <SpecConstellation />
      </Canvas>
    </div>
  );
}
