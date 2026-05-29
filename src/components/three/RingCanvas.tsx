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
import * as THREE from "three";
import { TwistRing } from "./TwistRing";
import { useConfigurator, getScrollY } from "@/store/configurator";

/* ----------------------------------------------------------------------------
   Scroll-traveling ring canvas with God Tier Post-Processing.
---------------------------------------------------------------------------- */

function StudioEnvironment() {
  return (
    <Environment resolution={256}>
      <color attach="background" args={["#cfc7b8"]} />
      <Lightformer form="rect" intensity={3} position={[0, 5, 2]} scale={[10, 7, 1]} color="#fff6e8" />
      <Lightformer form="rect" intensity={1.6} position={[0, 1, 7]} scale={[12, 8, 1]} color="#fffaf0" />
      <Lightformer form="rect" intensity={1.6} position={[-6, 1, 1]} rotation={[0, Math.PI / 2, 0]} scale={[6, 7, 1]} color="#eef2ff" />
      <Lightformer form="rect" intensity={2.4} position={[6, 2, -1]} rotation={[0, -Math.PI / 2, 0]} scale={[5, 7, 1]} color="#ffffff" />
      <Lightformer form="rect" intensity={2} position={[0, 3, -7]} scale={[10, 7, 1]} color="#ffe7c7" />
      <Lightformer form="rect" intensity={6} position={[2.5, 3.5, 3]} scale={[0.6, 3, 1]} color="#ffffff" />
      <Lightformer form="rect" intensity={5} position={[-2.5, 2, 3]} scale={[0.5, 2.5, 1]} color="#ffffff" />
    </Environment>
  );
}

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

/* ── Scroll-zone calculation ─────────────────────────────────────────────── */

interface ScrollZone {
  phase: number;
  t: number;
  orbitActive: boolean;
}

function getZone(scrollY: number, vh: number): ScrollZone {
  const studioEnd = vh * 0.85;
  const cornerStart = vh * 1.0;
  const cornerEnd = vh * 3.2;
  const galleryStart = vh * 3.4;
  const galleryEnd = vh * 4.0;

  if (scrollY <= studioEnd) {
    return { phase: 0, t: scrollY / Math.max(studioEnd, 1), orbitActive: true };
  }
  if (scrollY <= cornerStart) {
    const t = (scrollY - studioEnd) / (cornerStart - studioEnd);
    return { phase: 1, t, orbitActive: false };
  }
  if (scrollY <= cornerEnd) {
    return { phase: 2, t: (scrollY - cornerStart) / (cornerEnd - cornerStart), orbitActive: false };
  }
  if (scrollY <= galleryEnd) {
    const t = THREE.MathUtils.clamp(
      (scrollY - galleryStart) / (galleryEnd - galleryStart),
      0,
      1,
    );
    return { phase: 3, t, orbitActive: false };
  }
  return { phase: 3, t: 1, orbitActive: false };
}

/* ── ScrollRig ───────────────────────────────────────────────────────────── */

function ScrollRig({ mobile }: { mobile: boolean }) {
  const controls = useRef<OrbitControlsImpl>(null);
  const resumeAt = useRef(0);
  const ringGroup = useRef<THREE.Group>(null);

  const target = useRef({
    ringX: 0,
    ringY: 0.38,
    ringScale: 1,
    camZ: 4.6,
    fov: 30,
  });

  useFrame((state) => {
    const vh = state.size.height;
    const scrollY = getScrollY();
    const zone = getZone(scrollY, vh);

    const c = controls.current;
    const g = ringGroup.current;
    const cam = state.camera as THREE.PerspectiveCamera;

    switch (zone.phase) {
      case 0:
        target.current.ringX = 0;
        target.current.ringY = 0.38;
        target.current.ringScale = 1;
        target.current.fov = 30;
        break;
      case 1: {
        const t = THREE.MathUtils.smoothstep(zone.t, 0, 1);
        target.current.ringX = THREE.MathUtils.lerp(0, mobile ? 1.2 : 2.5, t);
        target.current.ringY = THREE.MathUtils.lerp(0.38, mobile ? -1.2 : -1.6, t);
        target.current.ringScale = THREE.MathUtils.lerp(1, mobile ? 0.32 : 0.38, t);
        target.current.fov = THREE.MathUtils.lerp(30, 28, t);
        break;
      }
      case 2:
        target.current.ringX = mobile ? 1.2 : 2.5;
        target.current.ringY = mobile ? -1.2 : -1.6;
        target.current.ringScale = mobile ? 0.32 : 0.38;
        target.current.fov = 28;
        break;
      case 3: {
        const t = THREE.MathUtils.smoothstep(zone.t, 0, 1);
        target.current.ringX = THREE.MathUtils.lerp(mobile ? 1.2 : 2.5, 0, t);
        target.current.ringY = THREE.MathUtils.lerp(mobile ? -1.2 : -1.6, 0.38, t);
        target.current.ringScale = THREE.MathUtils.lerp(mobile ? 0.32 : 0.38, 1.15, t);
        target.current.fov = THREE.MathUtils.lerp(28, 26, t);
        break;
      }
    }

    const dt = state.clock.getDelta() || 0.016;
    const lerpSpeed = 6;

    if (g) {
      g.position.x = THREE.MathUtils.damp(g.position.x, target.current.ringX, lerpSpeed, dt);
      g.position.y = THREE.MathUtils.damp(g.position.y, target.current.ringY, lerpSpeed, dt);
      const s = THREE.MathUtils.damp(g.scale.x, target.current.ringScale, lerpSpeed, dt);
      g.scale.setScalar(s);
    }

    cam.fov = THREE.MathUtils.damp(cam.fov, target.current.fov, lerpSpeed, dt);
    cam.updateProjectionMatrix();

    if (c) {
      if (zone.orbitActive) {
        c.enabled = true;
        if (performance.now() > resumeAt.current) c.autoRotate = true;
      } else {
        c.enabled = false;
        c.autoRotate = true;
        c.autoRotateSpeed = 0.35;
      }
    }
  });

  return (
    <>
      <PerspectiveCamera makeDefault fov={30} position={[0.25, 0.55, 4.6]} />
      <group ref={ringGroup}>
        <group rotation={[-0.18, -0.42, 0]}>
          <TwistRing mobile={mobile} />
        </group>
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

/* ── Canvas scroll-zone CSS layer ────────────────────────────────────────── */

function useCanvasStyle(mobile: boolean) {
  const frameRef = useRef<number>(0);
  const wrapperRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = wrapperRef.current;
    if (!el) return;

    const vh = window.innerHeight;

    const tick = () => {
      const scrollY = getScrollY();
      const zone = getZone(scrollY, vh);

      let opacity = 1;
      let pointerEvents = "auto";

      if (zone.phase === 2) {
        opacity = 0.85;
        pointerEvents = "none";
      } else if (zone.phase === 1) {
        opacity = THREE.MathUtils.lerp(1, 0.85, zone.t);
        pointerEvents = zone.t > 0.5 ? "none" : "auto";
      }

      el.style.opacity = String(opacity);
      el.style.pointerEvents = pointerEvents;

      frameRef.current = requestAnimationFrame(tick);
    };

    frameRef.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frameRef.current);
  }, [mobile]);

  return wrapperRef;
}

/* ── Main export ─────────────────────────────────────────────────────────── */

export default function RingCanvas() {
  const [mobile, setMobile] = useState(false);
  const [ready, setReady] = useState(false);
  const wrapperRef = useCanvasStyle(mobile);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const dofRef = useRef<any>(null);

  useEffect(() => {
    const mq = window.matchMedia("(max-width: 768px)");
    const update = () => setMobile(mq.matches);
    update();
    mq.addEventListener("change", update);
    return () => mq.removeEventListener("change", update);
  }, []);

  return (
    <div
      ref={wrapperRef}
      className="fixed inset-0 z-[5] h-full w-full transition-opacity duration-700 ease-[cubic-bezier(0.22,1,0.36,1)]"
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
          <ScrollRig mobile={mobile} />
          <StudioEnvironment />
          <EnvPulse />
          <ambientLight intensity={0.45} />
          <directionalLight position={[4, 6, 4]} intensity={1.5} castShadow shadow-mapSize={[1024, 1024]}>
            <orthographicCamera attach="shadow-camera" args={[-3, 3, 3, -3, 0.1, 20]} />
          </directionalLight>
          <directionalLight position={[0, 1.5, 6]} intensity={0.7} />
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
