"use client";

import { Suspense, memo, useEffect, useMemo, useRef, useState, type RefObject } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import {
  Environment,
  Lightformer,
  ContactShadows,
  PerspectiveCamera,
  MeshReflectorMaterial,
} from "@react-three/drei";
import { EffectComposer, Bloom, Vignette } from "@react-three/postprocessing";
import * as THREE from "three";
import { TwistRing } from "./TwistRing";
import { getScrollY, setRingReveal, useConfigurator } from "@/store/configurator";

/* ----------------------------------------------------------------------------
   One fixed, alpha canvas renders the ring for the whole page. The ring lives
   in a deterministic on-screen "stage" chosen per scroll zone so it never
   collides with copy. The camera is calm — small, flattering reframings only.
   Loaded via next/dynamic({ ssr:false }) so WebGL only spins up on the client.
---------------------------------------------------------------------------- */

type Stage = {
  pos: THREE.Vector3;
  scale: number;
  camZ: number;
  lookY: number;
};

const damp = THREE.MathUtils.damp;

/* Diamond caustics — procedural warm light web cast below the ring.
   Additive, depth-write off. Desktop-only; reduced-motion freezes it. */
const CAUSTIC_VERT = /* glsl */ `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;
const CAUSTIC_FRAG = /* glsl */ `
  varying vec2 vUv;
  uniform float uTime;
  uniform vec3 uColor;
  #define TAU 6.28318530718
  #define ITER 5
  void main() {
    float time = uTime * 0.4 + 23.0;
    vec2 p = mod(vUv * TAU * 2.0, TAU) - 250.0;
    vec2 i = vec2(p);
    float c = 1.0;
    float inten = 0.0045;
    for (int n = 0; n < ITER; n++) {
      float t = time * (1.0 - (3.5 / float(n + 1)));
      i = p + vec2(cos(t - i.x) + sin(t + i.y), sin(t - i.y) + cos(t + i.x));
      c += 1.0 / length(vec2(p.x / (sin(i.x + t) / inten), p.y / (cos(i.y + t) / inten)));
    }
    c /= float(ITER);
    c = 1.17 - pow(c, 1.4);
    float val = pow(abs(c), 8.0);
    float d = distance(vUv, vec2(0.5));
    float mask = smoothstep(0.5, 0.06, d);
    gl_FragColor = vec4(uColor * val, clamp(val, 0.0, 1.0) * mask * 0.32);
  }
`;
function CausticFloor({ reduceMotion }: { reduceMotion: boolean }) {
  const matRef = useRef<THREE.ShaderMaterial>(null);
  const uniforms = useMemo(
    () => ({ uTime: { value: 0 }, uColor: { value: new THREE.Color("#ffe1a3") } }),
    [],
  );
  useFrame((s) => {
    if (matRef.current)
      matRef.current.uniforms.uTime.value = reduceMotion ? 6.0 : s.clock.elapsedTime;
  });
  return (
    <mesh rotation={[-Math.PI / 2, 0, 0]} position={[1.0, -1.38, 0]}>
      <planeGeometry args={[11, 11]} />
      <shaderMaterial
        ref={matRef}
        vertexShader={CAUSTIC_VERT}
        fragmentShader={CAUSTIC_FRAG}
        uniforms={uniforms}
        transparent
        depthWrite={false}
        toneMapped={false}
        blending={THREE.AdditiveBlending}
      />
    </mesh>
  );
}

/* Liquid-metal floor — soft polished sheen, degrades to plain dark. Desktop-only. */
function ReflectiveFloor() {
  return (
    <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -1.4, 0]}>
      <planeGeometry args={[34, 34]} />
      <MeshReflectorMaterial
        resolution={512}
        blur={[400, 120]}
        mixBlur={1}
        mixStrength={4}
        depthScale={1.1}
        minDepthThreshold={0.5}
        maxDepthThreshold={1.3}
        color="#08060a"
        metalness={0.55}
        roughness={0.92}
        mirror={0.35}
      />
    </mesh>
  );
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
  const groupYaw = useRef(0);

  const changeSeq = useConfigurator((s) => s.changeSeq);
  const prevSeq = useRef(0);
  const flourishZ = useRef(0);

  useFrame((state, dt) => {
    const y = getScrollY();
    const vh = typeof window !== "undefined" ? window.innerHeight : 900;

    if (reduceMotion) intro.current = 1;
    else if (intro.current < 1) intro.current = Math.min(1, intro.current + dt / 0.9);
    const introEase = 1 - Math.pow(1 - intro.current, 3);

    const center = y + vh * 0.5;
    let ring = "hero";
    let frame = "full";
    if (typeof document !== "undefined") {
      const els = document.querySelectorAll<HTMLElement>("[data-ring]");
      for (let i = 0; i < els.length; i++) {
        const r = els[i].getBoundingClientRect();
        const top = r.top + y;
        if (center >= top && center < top + r.height) {
          ring = els[i].dataset.ring || "hero";
          frame = els[i].dataset.frame || "full";
          break;
        }
      }
    }

    const hero: Stage = isDesktop
      ? { pos: new THREE.Vector3(1.5, 0, 0), scale: 1.0, camZ: 7.2, lookY: 0.5 }
      : { pos: new THREE.Vector3(0, 1.72, 0), scale: 0.52, camZ: 8.7, lookY: 0.95 };
    const STAGE: Record<string, Stage> = {
      full: { pos: new THREE.Vector3(1.62, -0.05, 0), scale: 1.05, camZ: 6.7, lookY: 0.66 },
      stone: { pos: new THREE.Vector3(1.5, -0.15, 0), scale: 1.12, camZ: 5.9, lookY: 1.0 },
      band: { pos: new THREE.Vector3(1.64, 0.05, 0), scale: 1.0, camZ: 6.9, lookY: 0.32 },
    };
    const hidden: Stage = { pos: new THREE.Vector3(0, 0.35, 0), scale: 0.0001, camZ: 8.7, lookY: 0.6 };
    const bgfloat: Stage = isDesktop
      ? { pos: new THREE.Vector3(1.0, 0.18, 0), scale: 0.36, camZ: 8.0, lookY: 0.6 }
      : { pos: new THREE.Vector3(0, 0.55, 0), scale: 0.20, camZ: 9.5, lookY: 0.55 };
    const finaleStage: Stage = isDesktop
      ? { pos: new THREE.Vector3(0, -0.12, 0), scale: 0.74, camZ: 7.4, lookY: 0.45 }
      : { pos: new THREE.Vector3(0, 0.0, 0), scale: 0.48, camZ: 8.7, lookY: 0.5 };

    let target: Stage;
    if (ring === "finale") target = finaleStage;
    else if (ring === "hidden") target = hidden;
    else if (ring === "bgfloat") target = bgfloat;
    else if (ring === "stage") target = wide ? STAGE[frame] ?? STAGE.full : hidden;
    else target = hero;

    let mobileFade = 1;
    if (!isDesktop && ring === "hero") {
      mobileFade = 1 - THREE.MathUtils.smoothstep(y, vh * 0.12, vh * 0.5);
    }

    const targetScale =
      target.scale * mobileFade * (intro.current < 1 ? introEase : 1);

    if (changeSeq !== prevSeq.current) {
      prevSeq.current = changeSeq;
      flourishZ.current = -0.65;
    }
    flourishZ.current = THREE.MathUtils.lerp(flourishZ.current, 0, Math.min(dt * 2.4, 1));

    const k = reduceMotion ? 999 : 4.5;
    groupPos.current.x = damp(groupPos.current.x, target.pos.x, k, dt);
    groupPos.current.y = damp(groupPos.current.y, target.pos.y, k, dt);
    groupPos.current.z = damp(groupPos.current.z, target.pos.z, k, dt);
    scale.current = damp(scale.current, targetScale, k, dt);
    camPos.current.z = damp(camPos.current.z, target.camZ + flourishZ.current, k, dt);
    camLook.current.y = damp(camLook.current.y, target.lookY, k, dt);

    const maxScroll =
      typeof document !== "undefined"
        ? Math.max(1, document.documentElement.scrollHeight - vh)
        : 1;
    const progress = THREE.MathUtils.clamp(y / maxScroll, 0, 1);
    const yawTarget = progress * Math.PI * 2 * 1.15;
    groupYaw.current = damp(groupYaw.current, yawTarget, reduceMotion ? 999 : 3.2, dt);

    setRingReveal(THREE.MathUtils.clamp(scale.current / 0.55, 0, 1));

    const g = ringGroupRef.current;
    if (g) {
      g.position.copy(groupPos.current);
      g.scale.setScalar(Math.max(scale.current, 0.0001));
      g.rotation.y = groupYaw.current;
    }
    state.camera.position.set(camPos.current.x, camPos.current.y, camPos.current.z);
    state.camera.lookAt(camLook.current);
  });

  return (
    <>
      {/* Real studio HDRI — Poly Haven "studio_small_08" (CC0). A soft,
          low-contrast indoor studio with large softboxes and an octabox highlight.
          Sets scene.environment for physically-correct IBL on both metal and gem.
          Falls back gracefully if the file is missing (Suspense/error boundary). */}
      <Environment
        files="/hdri/studio.hdr"
        environmentIntensity={1.08}
      />

      {/* Three-point sculpture lights on top of the IBL — each has a role:
          KEY shapes the twist, RIM separates metal from the dark, FILL lifts
          shadows, TOP feeds the diamond's pavilion from directly above. */}
      <ambientLight intensity={0.08} />
      <spotLight
        position={[-5, 9, 6]}
        angle={0.40}
        penumbra={1}
        intensity={3.2}
        color="#fff6ec"
        castShadow
        shadow-bias={-0.0001}
        shadow-mapSize={[2048, 2048]}
      />
      <spotLight
        position={[6, 5, -5]}
        angle={0.55}
        penumbra={1}
        intensity={1.6}
        color="#c8d8ff"
      />
      <pointLight position={[3.5, -1, 3]} intensity={0.45} color="#e8cda0" />
      <pointLight position={[0, 6, 1]} intensity={1.0} color="#fff8f0" />

      <ContactShadows
        position={[0, -1.35, 0]}
        opacity={0.6}
        scale={6}
        blur={2.8}
        far={4.5}
        color="#1a130b"
      />

      {isDesktop && <ReflectiveFloor />}
      {isDesktop && <CausticFloor reduceMotion={reduceMotion} />}

      <Suspense fallback={null}>
        <group ref={ringGroupRef}>
          <TwistRing mobile={!isDesktop} reduceMotion={reduceMotion} />
        </group>
      </Suspense>

    </>
  );
}

/* PostFX is memoised separately from ScrollDirector so it never re-renders
   when stone/metal changes (changeSeq). EffectComposer.addPass crashes if
   called during re-renders triggered by those state changes. */
const PostFX = memo(function PostFX({
  isDesktop,
  reduceMotion,
}: {
  isDesktop: boolean;
  reduceMotion: boolean;
}) {
  if (!isDesktop || reduceMotion) return null;
  return (
    <EffectComposer enableNormalPass={false}>
      <Bloom
        intensity={0.12}
        luminanceThreshold={0.98}
        luminanceSmoothing={0.18}
        mipmapBlur
      />
      <Vignette eskil={false} offset={0.22} darkness={0.84} />
    </EffectComposer>
  );
});

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
        <PostFX isDesktop={isDesktop} reduceMotion={reduceMotion} />
      </Canvas>
    </div>
  );
}
