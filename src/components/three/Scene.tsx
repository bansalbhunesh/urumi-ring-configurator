"use client";

import { Suspense, useEffect, useMemo, useRef, useState, type RefObject } from "react";
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

/* Gold-dust depth layer (moodboard: cosmic depth + silk glow). Sparse additive
   points; the existing Bloom makes them shimmer. Seeded (stable), count-capped,
   and disabled under reduced-motion. Sits behind the ring — pure ambience. */
function GoldDust({ count, reduceMotion }: { count: number; reduceMotion: boolean }) {
  const ref = useRef<THREE.Points>(null);
  const positions = useMemo(() => {
    const a = new Float32Array(count * 3);
    const r = (i: number, n: number) => {
      const x = Math.sin((i + 1) * n) * 43758.5453;
      return x - Math.floor(x);
    };
    for (let i = 0; i < count; i++) {
      a[i * 3] = (r(i, 12.9898) - 0.5) * 10;
      a[i * 3 + 1] = (r(i, 78.233) - 0.5) * 6.5;
      a[i * 3 + 2] = (r(i, 37.719) - 0.5) * 5 - 2.5;
    }
    return a;
  }, [count]);

  useFrame((state) => {
    if (!ref.current) return;
    ref.current.rotation.y = state.clock.elapsedTime * 0.018;
    ref.current.position.y = Math.sin(state.clock.elapsedTime * 0.14) * 0.12;
  });

  if (reduceMotion) return null;
  return (
    <points ref={ref}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
      </bufferGeometry>
      <pointsMaterial
        size={0.035}
        color="#e3c585"
        transparent
        opacity={0.55}
        sizeAttenuation
        depthWrite={false}
        blending={THREE.AdditiveBlending}
      />
    </points>
  );
}

/* Golden halo of light framing the product (moodboard: energy halo / silk glow).
   One thin additive torus behind the ring; Bloom turns it into a soft glow.
   Larger than the ring so it frames rather than competes. */
function SilkHalo({ reduceMotion }: { reduceMotion: boolean }) {
  const ref = useRef<THREE.Mesh>(null);
  useFrame((s) => {
    if (ref.current && !reduceMotion) ref.current.rotation.z = s.clock.elapsedTime * 0.05;
  });
  return (
    <mesh ref={ref} position={[0, 0.5, -2]}>
      <torusGeometry args={[2.9, 0.014, 12, 140]} />
      <meshBasicMaterial
        color="#e3c585"
        transparent
        opacity={0.2}
        blending={THREE.AdditiveBlending}
        depthWrite={false}
        toneMapped={false}
      />
    </mesh>
  );
}

/* Silk-like golden light trails (moodboard: ribbons of warm light curling around
   the product). A few thin tube ribbons swept along graceful seeded curves, sat
   behind the ring; additive + the existing Bloom render them as soft silk-light,
   never opaque geometry. Built once, animated by a slow group drift so they flow
   without rebuilding geometry. Disabled under reduced-motion. */
function makeRibbonCurve(seed: number, radius: number, height: number) {
  const pts: THREE.Vector3[] = [];
  const N = 16;
  for (let i = 0; i <= N; i++) {
    const t = i / N;
    const a = t * Math.PI * 2 * 1.35 + seed;
    const r = radius * (0.82 + 0.22 * Math.sin(t * Math.PI * 2 + seed));
    pts.push(
      new THREE.Vector3(
        Math.cos(a) * r,
        (t - 0.5) * height + Math.sin(t * Math.PI * 3 + seed) * 0.28,
        Math.sin(a) * r * 0.6,
      ),
    );
  }
  return new THREE.CatmullRomCurve3(pts, false, "catmullrom", 0.6);
}
function SilkRibbons({ reduceMotion }: { reduceMotion: boolean }) {
  const ref = useRef<THREE.Group>(null);
  const geoms = useMemo(
    () => [
      new THREE.TubeGeometry(makeRibbonCurve(0.4, 2.5, 3.4), 130, 0.012, 5, false),
      new THREE.TubeGeometry(makeRibbonCurve(2.3, 2.9, 3.0), 130, 0.009, 5, false),
      new THREE.TubeGeometry(makeRibbonCurve(4.7, 2.2, 3.8), 130, 0.011, 5, false),
    ],
    [],
  );
  useFrame((s) => {
    if (!ref.current || reduceMotion) return;
    const t = s.clock.elapsedTime;
    ref.current.rotation.y = t * 0.05;
    ref.current.rotation.z = Math.sin(t * 0.12) * 0.08;
  });
  useEffect(() => () => geoms.forEach((g) => g.dispose()), [geoms]);
  if (reduceMotion) return null;
  return (
    <group ref={ref} position={[0.5, 0.4, -1.7]}>
      {geoms.map((g, i) => (
        <mesh key={i} geometry={g}>
          <meshBasicMaterial
            color="#f0cd86"
            transparent
            opacity={0.32}
            blending={THREE.AdditiveBlending}
            depthWrite={false}
            toneMapped={false}
          />
        </mesh>
      ))}
    </group>
  );
}

/* Diamond caustics (moodboard: refracted light cast by the stone). Rather than
   geometry-derived caustics (an extra render pass that would fight the ring's
   per-frame reposition/scale), this projects a procedural caustic web onto the
   stage floor: layered domain-warped light folds, warm gold, pooled under the
   ring by a radial mask and faded to nothing at the edges. Additive, depth-write
   off, so it only ever adds light. Desktop-only; reduced-motion freezes it. */
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
    gl_FragColor = vec4(uColor * val, clamp(val, 0.0, 1.0) * mask * 0.55);
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

/* Liquid-metal floor (moodboard: chrome/mercury reflections). Heavily blurred so
   it reads as a soft polished sheen, not a literal mirror double — worst case it
   degrades to a plain dark floor. Desktop-only (renders an FBO each frame). */
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

  useFrame((state, dt) => {
    const y = getScrollY();
    const vh = typeof window !== "undefined" ? window.innerHeight : 900;

    if (reduceMotion) intro.current = 1;
    else if (intro.current < 1) intro.current = Math.min(1, intro.current + dt / 0.9);
    const introEase = 1 - Math.pow(1 - intro.current, 3);

    // Which section owns the viewport centre? Each section declares data-ring
    // ("hero" | "stage" | "hidden" | "finale"), so adding full-width sections
    // where the ring should step aside is a markup change, not a code change.
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
    // Stage framings — the ring is presented from varied angles as you scroll.
    const STAGE: Record<string, Stage> = {
      full: { pos: new THREE.Vector3(1.62, -0.05, 0), scale: 1.05, camZ: 6.7, lookY: 0.66 },
      stone: { pos: new THREE.Vector3(1.5, -0.15, 0), scale: 1.12, camZ: 5.9, lookY: 1.0 },
      band: { pos: new THREE.Vector3(1.64, 0.05, 0), scale: 1.0, camZ: 6.9, lookY: 0.32 },
    };
    const hidden: Stage = { pos: new THREE.Vector3(0, 0.35, 0), scale: 0.0001, camZ: 8.7, lookY: 0.6 };
    const finaleStage: Stage = isDesktop
      ? { pos: new THREE.Vector3(0, -0.12, 0), scale: 0.74, camZ: 7.4, lookY: 0.45 }
      : { pos: new THREE.Vector3(0, 0.0, 0), scale: 0.48, camZ: 8.7, lookY: 0.5 };

    let target: Stage;
    if (ring === "finale") target = finaleStage;
    else if (ring === "hidden") target = hidden;
    else if (ring === "stage") target = wide ? STAGE[frame] ?? STAGE.full : hidden;
    else target = hero;

    // On mobile the fixed ring would sit behind the hero controls as you scroll;
    // fade it out as you move into the panel. It returns for the finale.
    let mobileFade = 1;
    if (!isDesktop && ring === "hero") {
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

      {isDesktop && <ReflectiveFloor />}
      {isDesktop && <CausticFloor reduceMotion={reduceMotion} />}
      <GoldDust count={isDesktop ? 240 : 80} reduceMotion={reduceMotion} />
      <SilkHalo reduceMotion={reduceMotion} />
      {isDesktop && <SilkRibbons reduceMotion={reduceMotion} />}

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
