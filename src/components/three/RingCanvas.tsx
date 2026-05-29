"use client";

import { Suspense, useEffect, useRef, useState } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import {
  ContactShadows,
  Environment,
  Lightformer,
  OrbitControls,
  PerspectiveCamera,
} from "@react-three/drei";
import type { OrbitControls as OrbitControlsImpl } from "three-stdlib";
import { TwistRing } from "./TwistRing";
import { useConfigurator } from "@/store/configurator";

/* A self-contained studio environment built from Lightformers — gives jewelry-
   grade soft reflections with no external HDRI download (works fully offline). */
function StudioEnvironment() {
  return (
    <Environment resolution={256}>
      {/* Light, warm studio so polished metal (metalness=1, lit entirely by the
          environment) reads as precious rather than black. */}
      <color attach="background" args={["#cfc7b8"]} />
      {/* broad overhead softbox */}
      <Lightformer
        form="rect"
        intensity={3}
        position={[0, 5, 2]}
        scale={[10, 7, 1]}
        color="#fff6e8"
      />
      {/* big frontal bounce so the face never reads dark */}
      <Lightformer
        form="rect"
        intensity={1.6}
        position={[0, 1, 7]}
        scale={[12, 8, 1]}
        color="#fffaf0"
      />
      {/* cool fill from the left */}
      <Lightformer
        form="rect"
        intensity={1.6}
        position={[-6, 1, 1]}
        rotation={[0, Math.PI / 2, 0]}
        scale={[6, 7, 1]}
        color="#eef2ff"
      />
      {/* crisp right edge */}
      <Lightformer
        form="rect"
        intensity={2.4}
        position={[6, 2, -1]}
        rotation={[0, -Math.PI / 2, 0]}
        scale={[5, 7, 1]}
        color="#ffffff"
      />
      {/* warm back rim */}
      <Lightformer
        form="rect"
        intensity={2}
        position={[0, 3, -7]}
        scale={[10, 7, 1]}
        color="#ffe7c7"
      />
      {/* bright facet streaks for sparkle */}
      <Lightformer
        form="rect"
        intensity={6}
        position={[2.5, 3.5, 3]}
        scale={[0.6, 3, 1]}
        color="#ffffff"
      />
      <Lightformer
        form="rect"
        intensity={5}
        position={[-2.5, 2, 3]}
        scale={[0.5, 2.5, 1]}
        color="#ffffff"
      />
    </Environment>
  );
}

/* Brief lift in environment intensity whenever metal/stone changes — light
   "finds" the new surface. Subtle and self-resetting. */
function EnvPulse() {
  const seq = useConfigurator((s) => s.changeSeq);
  const { scene } = useThree();
  const start = useRef(-10);
  const prev = useRef(seq);

  useEffect(() => {
    if (seq !== prev.current) {
      prev.current = seq;
      start.current = performance.now() / 1000;
    }
  }, [seq]);

  useFrame(() => {
    const elapsed = performance.now() / 1000 - start.current;
    const pulse =
      elapsed >= 0 && elapsed < 0.8
        ? Math.sin((elapsed / 0.8) * Math.PI) * 0.55
        : 0;
    scene.environmentIntensity = 1 + pulse;
  });
  return null;
}

function Rig({ mobile }: { mobile: boolean }) {
  const controls = useRef<OrbitControlsImpl>(null);
  const resumeAt = useRef(0);

  // Gentle auto-rotation that pauses when the user takes hold and resumes after
  // a beat of stillness — feels alive without fighting the user.
  useFrame(() => {
    const c = controls.current;
    if (!c) return;
    if (performance.now() > resumeAt.current) c.autoRotate = true;
  });

  return (
    <>
      <PerspectiveCamera makeDefault fov={30} position={[0.25, 0.55, 4.6]} />
      <group rotation={[-0.18, -0.42, 0]}>
        <TwistRing mobile={mobile} />
      </group>

      <OrbitControls
        ref={controls}
        makeDefault
        enablePan={false}
        enableDamping
        dampingFactor={0.08}
        rotateSpeed={0.9}
        autoRotate
        autoRotateSpeed={0.55}
        minDistance={3.2}
        maxDistance={6.5}
        minPolarAngle={Math.PI / 2 - 0.85}
        maxPolarAngle={Math.PI / 2 + 0.55}
        target={[0, 0.38, 0]}
        onStart={() => {
          const c = controls.current;
          if (c) c.autoRotate = false;
          resumeAt.current = performance.now() + 3500;
        }}
        onEnd={() => {
          resumeAt.current = performance.now() + 3500;
        }}
      />
    </>
  );
}

export default function RingCanvas() {
  const [mobile, setMobile] = useState(false);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia("(max-width: 768px)");
    const update = () => setMobile(mq.matches);
    update();
    mq.addEventListener("change", update);
    return () => mq.removeEventListener("change", update);
  }, []);

  return (
    <div
      className="absolute inset-0 h-full w-full transition-opacity duration-1000 ease-[cubic-bezier(0.22,1,0.36,1)]"
      style={{ opacity: ready ? 1 : 0 }}
    >
      <Canvas
        shadows
        dpr={mobile ? [1, 1.5] : [1, 2]}
        gl={{ antialias: true, alpha: true, preserveDrawingBuffer: false }}
        onCreated={({ scene }) => {
          scene.environmentIntensity = 1;
          requestAnimationFrame(() => setReady(true));
        }}
      >
        <Suspense fallback={null}>
          <Rig mobile={mobile} />
          <StudioEnvironment />
          <EnvPulse />
          <ambientLight intensity={0.45} />
          <directionalLight position={[4, 6, 4]} intensity={1.5} castShadow shadow-mapSize={[1024, 1024]}>
            <orthographicCamera attach="shadow-camera" args={[-3, 3, 3, -3, 0.1, 20]} />
          </directionalLight>
          {/* soft frontal fill from the camera so the face never reads flat */}
          <directionalLight position={[0, 1.5, 6]} intensity={0.7} />
          {/* cool rim from behind to separate the ring from the backdrop */}
          <directionalLight position={[-3, 2, -5]} intensity={0.8} color="#dfe6ff" />
          <ContactShadows
            position={[0, -1.25, 0]}
            opacity={0.32}
            scale={7}
            blur={2.6}
            far={3}
            resolution={mobile ? 256 : 512}
            color="#3a3026"
          />
        </Suspense>
      </Canvas>
    </div>
  );
}
