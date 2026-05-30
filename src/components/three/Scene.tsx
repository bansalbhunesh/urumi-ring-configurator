"use client";

import { Suspense, useEffect, useRef, useState, type RefObject } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import {
  Environment,
  Lightformer,
  ContactShadows,
  PerspectiveCamera,
} from "@react-three/drei";
import { EffectComposer, Bloom, Vignette } from "@react-three/postprocessing";
import * as THREE from "three";
import { TwistRing } from "./TwistRing";
import { getScrollY, useConfigurator } from "@/store/configurator";

/* ----------------------------------------------------------------------------
   One fixed, alpha canvas renders the ring for the whole page. The ring lives
   in a deterministic on-screen "stage" chosen per scroll zone so it never
   collides with copy: right column on wide screens, top on mobile, centred for
   the closing finale. The camera is calm — small, flattering reframings only.
   No world-bending, no wormholes. The product is the only spectacle.

   Loaded via next/dynamic({ ssr:false }) so the WebGL context only ever spins
   up on the client.
---------------------------------------------------------------------------- */

type Stage = {
  pos: THREE.Vector3;
  scale: number;
  camZ: number;
  lookY: number;
};

const damp = THREE.MathUtils.damp;

function anchorTop(id: string): number | null {
  if (typeof document === "undefined") return null;
  const el = document.getElementById(id);
  return el ? el.getBoundingClientRect().top + window.scrollY : null;
}

function ScrollDirector({
  isDesktop,
  wide,
  reduceMotion,
  ringGroupRef,
}: {
  isDesktop: boolean;
  wide: boolean;
  reduceMotion: boolean;
  ringGroupRef: RefObject<THREE.Group | null>;
}) {
  const camPos = useRef(new THREE.Vector3(0, 0.5, isDesktop ? 7.2 : 8.6));
  const camLook = useRef(new THREE.Vector3(0, 0.5, 0));
  const scale = useRef(0.0001);
  const groupPos = useRef(new THREE.Vector3(0, isDesktop ? 0 : 1.7, 0));
  const intro = useRef(0);

  useFrame((state, dt) => {
    const y = getScrollY();
    const vh = typeof window !== "undefined" ? window.innerHeight : 900;

    if (reduceMotion) intro.current = 1;
    else if (intro.current < 1) intro.current = Math.min(1, intro.current + dt / 0.9);
    const introEase = 1 - Math.pow(1 - intro.current, 3);

    const studioEl =
      typeof document !== "undefined" ? document.getElementById("ring") : null;
    const studioBottom = studioEl
      ? studioEl.getBoundingClientRect().bottom + window.scrollY
      : vh;
    const finale = anchorTop("finale");

    const inFinale = finale != null && y >= finale - vh * 0.55;
    const inAtelier = !inFinale && y >= studioBottom - vh * 0.6;

    const hero: Stage = isDesktop
      ? { pos: new THREE.Vector3(1.5, 0, 0), scale: 1.0, camZ: 7.2, lookY: 0.5 }
      : { pos: new THREE.Vector3(0, 1.72, 0), scale: 0.52, camZ: 8.7, lookY: 0.95 };

    let target: Stage;
    if (inFinale) {
      target = isDesktop
        ? { pos: new THREE.Vector3(0, -0.12, 0), scale: 0.74, camZ: 7.4, lookY: 0.45 }
        : { pos: new THREE.Vector3(0, 0.0, 0), scale: 0.48, camZ: 8.7, lookY: 0.5 };
    } else if (inAtelier) {
      target = wide
        ? { pos: new THREE.Vector3(1.62, -0.05, 0), scale: 1.05, camZ: 6.7, lookY: 0.66 }
        : { pos: new THREE.Vector3(0, 5, 0), scale: 0.0001, camZ: 8.7, lookY: 0.6 };
    } else {
      target = hero;
    }

    // On mobile the canvas is fixed, so as the hero scrolls up the ring would
    // otherwise sit behind the configurator controls. Fade it out as the user
    // scrolls into the panel — it returns for the finale.
    let mobileFade = 1;
    if (!isDesktop && !inFinale && !inAtelier) {
      mobileFade = 1 - THREE.MathUtils.smoothstep(y, vh * 0.12, vh * 0.5);
    }

    const targetScale =
      target.scale * mobileFade * (intro.current < 1 ? introEase : 1);

    const k = reduceMotion ? 999 : 4.5;
    groupPos.current.x = damp(groupPos.current.x, target.pos.x, k, dt);
    groupPos.current.y = damp(groupPos.current.y, target.pos.y, k, dt);
    groupPos.current.z = damp(groupPos.current.z, target.pos.z, k, dt);
    scale.current = damp(scale.current, targetScale, k, dt);
    camPos.current.z = damp(camPos.current.z, target.camZ, k, dt);
    camLook.current.y = damp(camLook.current.y, target.lookY, k, dt);

    const g = ringGroupRef.current;
    if (g) {
      g.position.copy(groupPos.current);
      g.scale.setScalar(Math.max(scale.current, 0.0001));
    }
    state.camera.position.set(camPos.current.x, camPos.current.y, camPos.current.z);
    state.camera.lookAt(camLook.current);
  });

  return (
    <>
      <ambientLight intensity={0.35} />
      <Environment resolution={256} environmentIntensity={1.0}>
        <Lightformer
          form="rect"
          intensity={4.5}
          color="#fff6ea"
          scale={[10, 8, 1]}
          position={[-3, 4, 4]}
          rotation={[-0.3, 0.2, 0]}
        />
        <Lightformer
          form="rect"
          intensity={6}
          color="#ffffff"
          scale={[1.2, 9, 1]}
          position={[4.5, 1, 3]}
          rotation={[0, -0.6, 0]}
        />
        <Lightformer
          form="rect"
          intensity={2.2}
          color="#f3c98b"
          scale={[6, 3, 1]}
          position={[3, -3, 2]}
          rotation={[0.4, -0.3, 0]}
        />
        <Lightformer
          form="ring"
          intensity={3}
          color="#cfe0ff"
          scale={[4, 4, 1]}
          position={[-3, 1, -5]}
        />
        {/* Dim warm "room" — fills the metal's dark side with warmth instead
           of pure black (the original cause of the invisible ring). */}
        <Lightformer
          form="rect"
          intensity={0.7}
          color="#2a2018"
          scale={[30, 30, 1]}
          position={[0, 0, -8]}
        />
      </Environment>

      <spotLight
        position={[-4, 7, 5]}
        angle={0.5}
        penumbra={1}
        intensity={2.6}
        color="#fff3e2"
        castShadow
        shadow-bias={-0.0001}
        shadow-mapSize={[1024, 1024]}
      />
      <pointLight position={[3.5, -1, 2.5]} intensity={0.6} color="#e9b572" />

      <ContactShadows
        position={[0, -1.35, 0]}
        opacity={0.55}
        scale={6}
        blur={3}
        far={4.5}
        color="#1a130b"
      />

      <Suspense fallback={null}>
        <group ref={ringGroupRef}>
          <TwistRing mobile={!isDesktop} reduceMotion={reduceMotion} />
        </group>
      </Suspense>

      {isDesktop && !reduceMotion && (
        <EffectComposer enableNormalPass={false}>
          <Bloom
            intensity={0.55}
            luminanceThreshold={0.82}
            luminanceSmoothing={0.18}
            mipmapBlur
          />
          <Vignette eskil={false} offset={0.28} darkness={0.7} />
        </EffectComposer>
      )}
    </>
  );
}

export default function Scene() {
  const [isDesktop, setIsDesktop] = useState(
    () => typeof window !== "undefined" && window.innerWidth >= 1024,
  );
  const [wide, setWide] = useState(
    () => typeof window !== "undefined" && window.innerWidth >= 1280,
  );
  const [reduceMotion, setReduceMotion] = useState(
    () =>
      typeof window !== "undefined" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches,
  );
  const ringGroupRef = useRef<THREE.Group>(null);
  const cartOpen = useConfigurator((s) => s.cartOpen);
  const [docHidden, setDocHidden] = useState(
    () => typeof document !== "undefined" && document.hidden,
  );

  useEffect(() => {
    const onVis = () => setDocHidden(document.hidden);
    document.addEventListener("visibilitychange", onVis);
    return () => document.removeEventListener("visibilitychange", onVis);
  }, []);

  useEffect(() => {
    const onResize = () => {
      setIsDesktop(window.innerWidth >= 1024);
      setWide(window.innerWidth >= 1280);
    };
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  useEffect(() => {
    const media = window.matchMedia("(prefers-reduced-motion: reduce)");
    const onChange = () => setReduceMotion(media.matches);
    media.addEventListener("change", onChange);
    return () => media.removeEventListener("change", onChange);
  }, []);

  return (
    <div className="pointer-events-none fixed inset-0 z-0 h-full w-full">
      <Canvas
        shadows
        dpr={[1, isDesktop ? 2 : 1.5]}
        frameloop={cartOpen || docHidden ? "never" : "always"}
        gl={{ antialias: true, alpha: true, powerPreference: "high-performance" }}
        style={{ pointerEvents: "auto" }}
      >
        <PerspectiveCamera makeDefault position={[0, 0.5, 7.2]} fov={32} />
        <ScrollDirector
          isDesktop={isDesktop}
          wide={wide}
          reduceMotion={reduceMotion}
          ringGroupRef={ringGroupRef}
        />
      </Canvas>
    </div>
  );
}
