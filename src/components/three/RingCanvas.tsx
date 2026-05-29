"use client";

import { Suspense, useEffect, useRef, useState, useCallback } from "react";
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
   Scroll-traveling ring canvas.

   One fixed, full-viewport <Canvas> that follows the user through the page.
   The ring transitions between three zones:

   1. STUDIO — full-size ring in the right panel, orbit controls active
   2. CORNER — miniature ring floats in a corner as editorial scrolls by
   3. GALLERY — ring re-blooms full-frame on a dark background (before Closing)

   The scroll position drives the ring's 3D position, scale, and the CSS
   clip-path of the canvas wrapper. All done per-frame with no React re-renders.
---------------------------------------------------------------------------- */

/* A self-contained studio environment built from Lightformers — gives jewelry-
   grade soft reflections with no external HDRI download (works fully offline). */
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

/* Brief lift in environment intensity whenever metal/stone changes. */
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
  /** 0 = studio, 1 = transitioning to corner, 2 = corner, 3 = gallery bloom */
  phase: number;
  /** Normalised progress within the current phase (0-1) */
  t: number;
  /** Should orbit controls be active? */
  orbitActive: boolean;
}

function getZone(scrollY: number, vh: number): ScrollZone {
  // Studio occupies first 100vh
  const studioEnd = vh * 0.85;
  // Corner starts at ~1vh, editorial runs until ~3.5vh
  const cornerStart = vh * 1.0;
  const cornerEnd = vh * 3.2;
  // Gallery bloom before closing (assume closing starts ~4vh)
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

/* ── ScrollRig: drives ring transform + orbit controls from scroll ──────── */

function ScrollRig({ mobile }: { mobile: boolean }) {
  const controls = useRef<OrbitControlsImpl>(null);
  const resumeAt = useRef(0);
  const ringGroup = useRef<THREE.Group>(null);

  /* Targets that we lerp toward every frame */
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

    /* Compute target transforms based on zone */
    switch (zone.phase) {
      case 0: // Studio — full size
        target.current.ringX = 0;
        target.current.ringY = 0.38;
        target.current.ringScale = 1;
        target.current.fov = 30;
        break;
      case 1: { // Transition to corner
        const t = THREE.MathUtils.smoothstep(zone.t, 0, 1);
        target.current.ringX = THREE.MathUtils.lerp(0, mobile ? 1.2 : 2.5, t);
        target.current.ringY = THREE.MathUtils.lerp(0.38, mobile ? -1.2 : -1.6, t);
        target.current.ringScale = THREE.MathUtils.lerp(1, mobile ? 0.32 : 0.38, t);
        target.current.fov = THREE.MathUtils.lerp(30, 28, t);
        break;
      }
      case 2: // Corner — small, auto-rotating
        target.current.ringX = mobile ? 1.2 : 2.5;
        target.current.ringY = mobile ? -1.2 : -1.6;
        target.current.ringScale = mobile ? 0.32 : 0.38;
        target.current.fov = 28;
        break;
      case 3: { // Gallery bloom
        const t = THREE.MathUtils.smoothstep(zone.t, 0, 1);
        target.current.ringX = THREE.MathUtils.lerp(mobile ? 1.2 : 2.5, 0, t);
        target.current.ringY = THREE.MathUtils.lerp(mobile ? -1.2 : -1.6, 0.38, t);
        target.current.ringScale = THREE.MathUtils.lerp(mobile ? 0.32 : 0.38, 1.15, t);
        target.current.fov = THREE.MathUtils.lerp(28, 26, t);
        break;
      }
    }

    /* Lerp toward targets */
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

    /* Orbit controls: active only in studio zone */
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

      /* Opacity + pointer events based on zone */
      let opacity = 1;
      let pointerEvents = "auto";

      if (zone.phase === 2) {
        // In corner mode, canvas is semi-transparent and non-interactive
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
