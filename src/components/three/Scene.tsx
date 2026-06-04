"use client";

import { Suspense, useEffect, useMemo, useRef, useState, type RefObject } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import {
  ContactShadows,
  Environment,
  Lightformer,
  MeshReflectorMaterial,
  PerspectiveCamera,
} from "@react-three/drei";
import { Bloom, EffectComposer, Vignette } from "@react-three/postprocessing";
import * as THREE from "three";
import { TwistRing } from "./TwistRing";
import { HybridRingModel, ModelBoundary } from "./RingModel";
import { OrbitStones } from "./OrbitStones";
import {
  setOrbitStrength,
  setRingPose,
  setRingReveal,
  useConfigurator,
} from "@/store/configurator";

const damp = THREE.MathUtils.damp;

type Stage = {
  x: number;
  y: number;
  scale: number;
  yaw: number;
  orbit: number;
};

/* Which chapter owns the ring right now = the [data-ring] section covering the
   most of the viewport. Overlap (not "centre inside bounds") makes the editorial
   sections reliably take the ring off-stage instead of letting it linger over a
   photograph during the scroll between chapters. */
function currentRingZone() {
  const vh = typeof window !== "undefined" ? window.innerHeight : 900;
  let zone = "hero";
  let bestOverlap = -1;
  let progress = 0;

  if (typeof document !== "undefined") {
    const sections = document.querySelectorAll<HTMLElement>("[data-ring]");
    for (const section of sections) {
      const rect = section.getBoundingClientRect();
      const overlap = Math.max(0, Math.min(vh, rect.bottom) - Math.max(0, rect.top));
      if (overlap > bestOverlap) {
        bestOverlap = overlap;
        zone = section.dataset.ring ?? "hero";
        progress = THREE.MathUtils.clamp(-rect.top / Math.max(1, rect.height - vh), 0, 1);
      }
    }
  }

  return { zone, progress };
}

/* The stage director keeps the ring centred and whole at all times — a calm,
   intentional camera, not a ring that leaps around between scroll zones. It only
   shifts the ring a little left/right per chapter, breathes the scale, and turns
   the orbiting halo on while the configurator is in view. */
function RingStageDirector({
  isDesktop,
  reduceMotion,
  ringGroupRef,
}: {
  isDesktop: boolean;
  reduceMotion: boolean;
  ringGroupRef: RefObject<THREE.Group | null>;
}) {
  const pos = useRef(new THREE.Vector3(isDesktop ? 0.55 : 0, 0, 0));
  const scale = useRef(0.0001);
  const yaw = useRef(-0.32);
  const orbit = useRef(0);
  const intro = useRef(0);
  const pointer = useThree((s) => s.pointer);

  useFrame((state, dt) => {
    const step = Math.min(dt, 1 / 30);
    const { zone } = currentRingZone();

    if (reduceMotion) intro.current = 1;
    else intro.current = Math.min(1, intro.current + step / 0.9);
    const introEase = 1 - Math.pow(1 - intro.current, 3);

    const hero: Stage = isDesktop
      ? { x: 0.45, y: 0.06, scale: 1.04, yaw: -0.3, orbit: 1 }
      : { x: 0, y: 1.0, scale: 0.66, yaw: -0.22, orbit: 0.5 };
    const config: Stage = isDesktop
      ? { x: 0.05, y: 0.06, scale: 1.08, yaw: -0.18, orbit: 1 }
      : { x: 0, y: 1.0, scale: 0.68, yaw: -0.16, orbit: 0.6 };
    const finale: Stage = isDesktop
      ? { x: 0, y: 0.18, scale: 0.96, yaw: -0.12, orbit: 0 }
      : { x: 0, y: 0.6, scale: 0.64, yaw: -0.1, orbit: 0 };
    const hidden: Stage = { x: 0, y: 0.1, scale: 0.0001, yaw: -0.2, orbit: 0 };

    const target =
      zone === "config" ? config : zone === "finale" ? finale : zone === "hidden" ? hidden : hero;

    const snap =
      typeof window !== "undefined" && (window as unknown as { __SNAP__?: boolean }).__SNAP__;
    if (snap) intro.current = 1;
    const targetScale = target.scale * (snap ? 1 : introEase);
    const k = reduceMotion || snap ? 999 : 4.2;

    pos.current.x = damp(pos.current.x, target.x, k, step);
    pos.current.y = damp(pos.current.y, target.y, k, step);
    scale.current = damp(scale.current, targetScale, k, step);
    yaw.current = damp(yaw.current, target.yaw, k, step);
    orbit.current = damp(orbit.current, target.orbit, 3.2, step);

    setRingReveal(1);
    setRingPose(target.yaw, 0.14);
    setOrbitStrength(orbit.current);

    const ring = ringGroupRef.current;
    if (ring) {
      ring.position.copy(pos.current);
      ring.scale.setScalar(Math.max(0.0001, scale.current));
      ring.visible = scale.current > 0.01;
      // calm auto-turn + gentle pointer parallax — life without restlessness
      const idle = reduceMotion ? 0 : Math.sin(state.clock.elapsedTime * 0.22) * 0.12;
      ring.rotation.y = yaw.current + idle + pointer.x * 0.16;
      ring.rotation.x = 0.12 - pointer.y * 0.06;
    }
  });

  return null;
}

/* Slow champagne dust drifting through the volume — atmosphere, barely there. */
function DustField() {
  const ref = useRef<THREE.Points>(null);
  const geo = useMemo(() => {
    const n = 130;
    const pos = new Float32Array(n * 3);
    for (let i = 0; i < n; i++) {
      pos[i * 3] = (Math.random() - 0.5) * 9;
      pos[i * 3 + 1] = (Math.random() - 0.5) * 6;
      pos[i * 3 + 2] = (Math.random() - 0.5) * 5 - 1;
    }
    const g = new THREE.BufferGeometry();
    g.setAttribute("position", new THREE.BufferAttribute(pos, 3));
    return g;
  }, []);
  useEffect(() => () => geo.dispose(), [geo]);

  useFrame((state) => {
    if (ref.current) ref.current.rotation.y = state.clock.elapsedTime * 0.012;
  });

  return (
    <points ref={ref} geometry={geo}>
      <pointsMaterial
        size={0.018}
        color="#ffe6b8"
        transparent
        opacity={0.5}
        depthWrite={false}
        blending={THREE.AdditiveBlending}
        sizeAttenuation
      />
    </points>
  );
}

/* A dark polished floor that catches the ring's reflection — the velvet-table
   premium beat, replacing the old technical grid entirely. */
function ReflectionFloor({ isDesktop }: { isDesktop: boolean }) {
  return (
    <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -1.46, 0]}>
      <planeGeometry args={[42, 42]} />
      <MeshReflectorMaterial
        resolution={isDesktop ? 512 : 256}
        mixBlur={1}
        mixStrength={2.2}
        blur={[420, 120]}
        mirror={0.5}
        depthScale={1.1}
        minDepthThreshold={0.85}
        maxDepthThreshold={1.4}
        roughness={0.85}
        metalness={0.35}
        color="#0a0807"
        transparent
        opacity={0.9}
      />
    </mesh>
  );
}

function StudioLights() {
  return (
    <>
      <ambientLight intensity={0.26} />
      <Environment resolution={256} environmentIntensity={1.0}>
        {/* key — soft warm, but restrained so white metals stay white */}
        <Lightformer
          form="rect"
          intensity={2.8}
          color="#fff6ec"
          scale={[8.5, 6.5, 1]}
          position={[-3.5, 4.5, 4]}
          rotation={[-0.25, 0.25, 0]}
        />
        {/* tall neutral edge light — the crisp specular line down the band */}
        <Lightformer
          form="rect"
          intensity={5.0}
          color="#ffffff"
          scale={[1.4, 9, 1]}
          position={[4.3, 1.2, 3.2]}
          rotation={[0, -0.58, 0]}
        />
        {/* low champagne fill — atmosphere, kept subtle */}
        <Lightformer
          form="rect"
          intensity={1.1}
          color="#f0c389"
          scale={[6.2, 3, 1]}
          position={[2.5, -2.8, 2.4]}
          rotation={[0.42, -0.28, 0]}
        />
        {/* cool rim to balance the warmth and read as precious white metal */}
        <Lightformer form="ring" intensity={2.9} color="#dbe7ff" scale={[4, 4, 1]} position={[-3, 1, -5]} />
        <Lightformer form="rect" intensity={0.5} color="#1c140d" scale={[30, 30, 1]} position={[0, 0, -8]} />
      </Environment>
      <spotLight
        position={[-4.5, 7, 5.5]}
        angle={0.5}
        penumbra={1}
        intensity={2.0}
        color="#fff1de"
        castShadow
        shadow-bias={-0.0001}
        shadow-mapSize={[1024, 1024]}
      />
      <pointLight position={[3.5, -1, 2.5]} intensity={0.45} color="#eab675" />
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
        onCreated={({ gl, scene }) => {
          gl.setClearColor(0x000000, 0);
          gl.setClearAlpha(0);
          gl.toneMapping = THREE.ACESFilmicToneMapping;
          gl.toneMappingExposure = 1.05;
          gl.outputColorSpace = THREE.SRGBColorSpace;
          scene.fog = new THREE.FogExp2(0x070605, 0.035);
        }}
        style={{ pointerEvents: "none" }}
      >
        <PerspectiveCamera makeDefault position={[0, 0.42, 7.1]} fov={32} />
        <StudioLights />

        <group ref={ringGroupRef}>
          <Suspense fallback={<TwistRing mobile={!isDesktop} reduceMotion={reduceMotion} />}>
            <ModelBoundary fallback={<TwistRing mobile={!isDesktop} reduceMotion={reduceMotion} />}>
              <HybridRingModel metalId={previewMetal ?? metal} mobile={!isDesktop} />
            </ModelBoundary>
          </Suspense>
          <Suspense fallback={null}>
            <OrbitStones />
          </Suspense>
        </group>

        <ContactShadows
          position={[0, -1.4, 0]}
          opacity={0.46}
          scale={7}
          blur={3.2}
          far={4.6}
          color="#120c06"
        />
        <ReflectionFloor isDesktop={isDesktop} />
        {!reduceMotion && <DustField />}

        <RingStageDirector
          isDesktop={isDesktop}
          reduceMotion={reduceMotion}
          ringGroupRef={ringGroupRef}
        />

        {isDesktop && !reduceMotion && (
          <EffectComposer enableNormalPass={false}>
            <Bloom intensity={0.5} luminanceThreshold={0.9} luminanceSmoothing={0.25} mipmapBlur />
            <Vignette eskil={false} offset={0.3} darkness={0.66} />
          </EffectComposer>
        )}
      </Canvas>
    </div>
  );
}
