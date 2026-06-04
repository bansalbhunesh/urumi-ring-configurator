"use client";

import { Suspense, useEffect, useRef, useState, type RefObject } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import {
  ContactShadows,
  Environment,
  Lightformer,
  PerspectiveCamera,
} from "@react-three/drei";
import { Bloom, EffectComposer, Vignette } from "@react-three/postprocessing";
import * as THREE from "three";
import { TwistRing } from "./TwistRing";
import { HybridRingModel, ModelBoundary } from "./RingModel";
import {
  getScrollY,
  setRingPose,
  setRingReveal,
  useConfigurator,
} from "@/store/configurator";

type Stage = {
  pos: THREE.Vector3;
  scale: number;
  camX: number;
  camY: number;
  camZ: number;
  lookX: number;
  lookY: number;
  yaw: number;
  pitch: number;
};

const damp = THREE.MathUtils.damp;

function currentRingZone() {
  const y = getScrollY();
  const vh = typeof window !== "undefined" ? window.innerHeight : 900;
  const center = y + vh * 0.5;
  let zone = "hero";
  let progress = 0;

  if (typeof document !== "undefined") {
    const sections = document.querySelectorAll<HTMLElement>("[data-ring]");
    for (const section of sections) {
      const rect = section.getBoundingClientRect();
      const top = rect.top + y;
      if (center >= top && center < top + rect.height) {
        zone = section.dataset.ring ?? "hero";
        progress = THREE.MathUtils.clamp(-rect.top / Math.max(1, rect.height - vh), 0, 1);
        break;
      }
    }
  }

  return { zone, progress };
}

function RingStageDirector({
  isDesktop,
  reduceMotion,
  ringGroupRef,
}: {
  isDesktop: boolean;
  reduceMotion: boolean;
  ringGroupRef: RefObject<THREE.Group | null>;
}) {
  const groupPos = useRef(new THREE.Vector3(isDesktop ? 1.42 : 0, isDesktop ? -0.08 : 1.42, 0));
  const scale = useRef(isDesktop ? 0.95 : 0.46);
  const cam = useRef(new THREE.Vector3(0, 0.58, isDesktop ? 7.0 : 8.55));
  const look = useRef(new THREE.Vector3(0, 0.55, 0));
  const intro = useRef(0);

  useFrame((state, dt) => {
    const step = Math.min(dt, 1 / 30);
    const { zone, progress } = currentRingZone();

    if (reduceMotion) intro.current = 1;
    else intro.current = Math.min(1, intro.current + step / 0.9);
    const introEase = 1 - Math.pow(1 - intro.current, 3);

    const hero: Stage = isDesktop
      ? {
          pos: new THREE.Vector3(1.36, -0.06, 0),
          scale: 1.08,
          camX: -0.08,
          camY: 0.58,
          camZ: 6.85,
          lookX: 0.08,
          lookY: 0.58,
          yaw: -0.78,
          pitch: 0.68,
        }
      : {
          pos: new THREE.Vector3(0, 2.08, 0),
          scale: 0.34,
          camX: 0,
          camY: 0.64,
          camZ: 8.5,
          lookX: 0,
          lookY: 1.24,
          yaw: -0.66,
          pitch: 0.48,
        };

    const config: Stage = isDesktop
      ? {
          pos: new THREE.Vector3(1.38, -0.08, 0),
          scale: 1.0,
          camX: 0.02,
          camY: 0.55,
          camZ: 7.05,
          lookX: 0.02,
          lookY: 0.56,
          yaw: -0.94,
          pitch: 0.62,
        }
      : {
          pos: new THREE.Vector3(0, 1.92, 0),
          scale: 0.34,
          camX: 0,
          camY: 0.68,
          camZ: 8.55,
          lookX: 0,
          lookY: 1.18,
          yaw: -0.72,
          pitch: 0.45,
        };

    const finale: Stage = isDesktop
      ? {
          pos: new THREE.Vector3(0, -0.1, 0),
          scale: 0.7,
          camX: 0,
          camY: 0.58,
          camZ: 7.55,
          lookX: 0,
          lookY: 0.5,
          yaw: -0.72,
          pitch: 0.5,
        }
      : {
          pos: new THREE.Vector3(0, 0.18, 0),
          scale: 0.4,
          camX: 0,
          camY: 0.66,
          camZ: 8.75,
          lookX: 0,
          lookY: 0.5,
          yaw: -0.48,
          pitch: 0.1,
        };

    const hidden: Stage = {
      pos: new THREE.Vector3(0, 0.15, 0),
      scale: 0.0001,
      camX: 0,
      camY: 0.58,
      camZ: isDesktop ? 7.5 : 8.6,
      lookX: 0,
      lookY: 0.55,
      yaw: -0.55,
      pitch: 0.1,
    };

    const target =
      zone === "config" ? config : zone === "finale" ? finale : zone === "hidden" ? hidden : hero;

    const photoFade = zone === "photo" ? 1 - THREE.MathUtils.smoothstep(progress, 0, 0.22) : 1;
    const targetScale = target.scale * introEase * photoFade;
    const k = reduceMotion ? 999 : 5.2;

    groupPos.current.x = damp(groupPos.current.x, target.pos.x, k, step);
    groupPos.current.y = damp(groupPos.current.y, target.pos.y, k, step);
    groupPos.current.z = damp(groupPos.current.z, target.pos.z, k, step);
    scale.current = damp(scale.current, targetScale, k, step);
    cam.current.x = damp(cam.current.x, target.camX, k, step);
    cam.current.y = damp(cam.current.y, target.camY, k, step);
    cam.current.z = damp(cam.current.z, target.camZ, k, step);
    look.current.x = damp(look.current.x, target.lookX, k, step);
    look.current.y = damp(look.current.y, target.lookY, k, step);

    setRingReveal(1);
    setRingPose(target.yaw, target.pitch);

    const ring = ringGroupRef.current;
    if (ring) {
      ring.position.copy(groupPos.current);
      ring.scale.setScalar(Math.max(0.0001, scale.current));
      ring.visible = scale.current > 0.01;
    }

    state.camera.position.copy(cam.current);
    state.camera.lookAt(look.current);
  });

  return null;
}

function StudioLights() {
  return (
    <>
      <ambientLight intensity={0.34} />
      <Environment resolution={256} environmentIntensity={1.45}>
        <Lightformer
          form="rect"
          intensity={5.4}
          color="#fff5e6"
          scale={[8.5, 6.5, 1]}
          position={[-3.5, 4.5, 4]}
          rotation={[-0.25, 0.25, 0]}
        />
        <Lightformer
          form="rect"
          intensity={7.2}
          color="#ffffff"
          scale={[1.25, 9, 1]}
          position={[4.3, 1.2, 3.2]}
          rotation={[0, -0.58, 0]}
        />
        <Lightformer
          form="rect"
          intensity={2.6}
          color="#f0bf7c"
          scale={[6.2, 3, 1]}
          position={[2.5, -2.8, 2.4]}
          rotation={[0.42, -0.28, 0]}
        />
        <Lightformer form="ring" intensity={2.8} color="#dce8ff" scale={[4, 4, 1]} position={[-3, 1, -5]} />
        <Lightformer form="rect" intensity={0.8} color="#261b14" scale={[30, 30, 1]} position={[0, 0, -8]} />
      </Environment>
      <spotLight
        position={[-4.5, 7, 5.5]}
        angle={0.45}
        penumbra={1}
        intensity={3.3}
        color="#fff1de"
        castShadow
        shadow-bias={-0.0001}
        shadow-mapSize={[1024, 1024]}
      />
      <pointLight position={[3.5, -1, 2.5]} intensity={0.62} color="#eab675" />
      <ContactShadows
        position={[0, -1.32, 0]}
        opacity={0.5}
        scale={6}
        blur={3}
        far={4.5}
        color="#1a130b"
      />
    </>
  );
}

export default function Scene() {
  const [isDesktop, setIsDesktop] = useState(
    () => typeof window !== "undefined" && window.innerWidth >= 1024,
  );
  const [reduceMotion, setReduceMotion] = useState(
    () =>
      typeof window !== "undefined" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches,
  );
  const ringGroupRef = useRef<THREE.Group>(null);
  const cartOpen = useConfigurator((s) => s.cartOpen);
  const metal = useConfigurator((s) => s.metal);
  const previewMetal = useConfigurator((s) => s.previewMetal);
  const [docHidden, setDocHidden] = useState(
    () => typeof document !== "undefined" && document.hidden,
  );

  useEffect(() => {
    const onVis = () => setDocHidden(document.hidden);
    document.addEventListener("visibilitychange", onVis);
    return () => document.removeEventListener("visibilitychange", onVis);
  }, []);

  useEffect(() => {
    const onResize = () => setIsDesktop(window.innerWidth >= 1024);
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
    <div className="pointer-events-none fixed inset-0 z-20 h-full w-full">
      <Canvas
        shadows
        dpr={[1, isDesktop ? 1.75 : 1.25]}
        frameloop={cartOpen || docHidden ? "never" : "always"}
        gl={{ antialias: true, alpha: true, powerPreference: "high-performance" }}
        onCreated={({ gl }) => {
          gl.setClearColor(0x000000, 0);
          gl.setClearAlpha(0);
          gl.toneMapping = THREE.ACESFilmicToneMapping;
          gl.toneMappingExposure = 1.16;
          gl.outputColorSpace = THREE.SRGBColorSpace;
        }}
        style={{ pointerEvents: "none" }}
      >
        <PerspectiveCamera makeDefault position={[0, 0.58, 7.1]} fov={32} />
        <StudioLights />
        <group ref={ringGroupRef}>
          <Suspense fallback={<TwistRing mobile={!isDesktop} reduceMotion={reduceMotion} />}>
            <ModelBoundary fallback={<TwistRing mobile={!isDesktop} reduceMotion={reduceMotion} />}>
              <HybridRingModel metalId={previewMetal ?? metal} mobile={!isDesktop} />
            </ModelBoundary>
          </Suspense>
        </group>
        <RingStageDirector
          isDesktop={isDesktop}
          reduceMotion={reduceMotion}
          ringGroupRef={ringGroupRef}
        />
        {isDesktop && !reduceMotion && (
          <EffectComposer enableNormalPass={false}>
            <Bloom intensity={0.55} luminanceThreshold={0.85} luminanceSmoothing={0.2} mipmapBlur />
            <Vignette eskil={false} offset={0.34} darkness={0.62} />
          </EffectComposer>
        )}
      </Canvas>
    </div>
  );
}
