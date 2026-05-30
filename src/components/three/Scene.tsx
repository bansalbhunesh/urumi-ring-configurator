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
import { getScrollY, setRingReveal, useConfigurator } from "@/store/configurator";

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
    gl_FragColor = vec4(uColor * val, clamp(val, 0.0, 1.0) * mask * 0.28);
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
  const groupYaw = useRef(0);

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

    // Scroll-scrubbed turntable. The ring's base rotation is driven directly by
    // page scroll progress, so scrolling scrubs a slow cinematic reveal and the
    // ring holds its frame when you stop — the live-3D equivalent of an Apple
    // image-sequence scroll, but interactive and asset-free. Drag/parallax still
    // compose on top via the inner group inside <TwistRing>.
    const maxScroll =
      typeof document !== "undefined"
        ? Math.max(1, document.documentElement.scrollHeight - vh)
        : 1;
    const progress = THREE.MathUtils.clamp(y / maxScroll, 0, 1);
    const yawTarget = progress * Math.PI * 2 * 1.15;
    groupYaw.current = damp(groupYaw.current, yawTarget, reduceMotion ? 999 : 3.2, dt);

    // Act III — drive the metal materialise from the ring's scale: it grows into
    // being as it enters the stage, and is guaranteed solid whenever it's at full
    // scale (so it can never be left half-dissolved while visible).
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
      {/* Studio lighting discipline: one bright neutral key models the metal, a
         cool rim separates it from the dark, warm accents are restrained so the
         scene reads precious (cool-neutral with warmth) rather than mono-orange. */}
      <ambientLight intensity={0.26} />
      <Environment resolution={256} environmentIntensity={0.82}>
        {/* Main key — large neutral softbox, the principal modelling light. */}
        <Lightformer
          form="rect"
          intensity={5}
          color="#ffffff"
          scale={[1.4, 9, 1]}
          position={[4.5, 1, 3]}
          rotation={[0, -0.6, 0]}
        />
        {/* Warm wrap — gentle warmth on the key side, dialed back. */}
        <Lightformer
          form="rect"
          intensity={2.6}
          color="#fdf3e6"
          scale={[10, 8, 1]}
          position={[-3, 4, 4]}
          rotation={[-0.3, 0.2, 0]}
        />
        {/* Cool rim — the "expensive" edge light that lifts metal off the black. */}
        <Lightformer
          form="ring"
          intensity={3.2}
          color="#cfe0ff"
          scale={[4, 4, 1]}
          position={[-3, 1, -5]}
        />
        {/* Faint warm under-fill so the shadow side never crushes to pure black. */}
        <Lightformer
          form="rect"
          intensity={1.2}
          color="#e9d3b0"
          scale={[6, 3, 1]}
          position={[3, -3, 2]}
          rotation={[0.4, -0.3, 0]}
        />
        <Lightformer
          form="rect"
          intensity={0.55}
          color="#241d16"
          scale={[30, 30, 1]}
          position={[0, 0, -8]}
        />
      </Environment>

      <spotLight
        position={[-4, 7, 5]}
        angle={0.5}
        penumbra={1}
        intensity={2.0}
        color="#fff6ec"
        castShadow
        shadow-bias={-0.0001}
        shadow-mapSize={[1024, 1024]}
      />
      <pointLight position={[3.5, -1, 2.5]} intensity={0.26} color="#dcc49a" />

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

      <Suspense fallback={null}>
        <group ref={ringGroupRef}>
          <TwistRing mobile={!isDesktop} reduceMotion={reduceMotion} />
        </group>
      </Suspense>

      {isDesktop && !reduceMotion && (
        <EffectComposer enableNormalPass={false}>
          {/* A whisper of bloom — only the diamond's hottest sparkle should ever
             glow. The metal must read as polished metal, never as a light source. */}
          <Bloom
            intensity={0.18}
            luminanceThreshold={0.96}
            luminanceSmoothing={0.22}
            mipmapBlur
          />
          {/* Firm vignette to darken the frame edges and focus the eye on the ring. */}
          <Vignette eskil={false} offset={0.2} darkness={0.88} />
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
