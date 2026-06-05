"use client";

import { Suspense, useEffect, useRef, useState, type RefObject } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import {
  ContactShadows,
  Environment,
  Lightformer,
  PerspectiveCamera,
} from "@react-three/drei";
import { Bloom, EffectComposer } from "@react-three/postprocessing";
import * as THREE from "three";
import { TwistRing } from "./TwistRing";
import { HybridRingModel, ModelBoundary } from "./RingModel";
import { HoloVariants } from "./HoloVariants";
import { STONE_FRAMING } from "./framing";
import {
  getRingBounds,
  getUserPitch,
  getUserYaw,
  getUserYawVel,
  isDragging,
  setGhostFocus,
  setRingPose,
  setRingReveal,
  setUserYaw,
  useConfigurator,
} from "@/store/configurator";

const damp = THREE.MathUtils.damp;
const CAMERA_FOV = 30;

/* A scene "stage" = where the ring lives in world space + where its centre
   should sit on screen for the chapter that owns it. The camera rig converts
   screenY into a look-at offset and a fit distance, so a chapter can place the
   ring high (finale, leaving the lower frame for the CTA) without ever clipping.
   Both the stage director (which poses the ring) and the camera rig read this,
   so they can never disagree about the composition. */
type Stage = { x: number; y: number; scale: number; screenY: number };

function stageFor(zone: string, isDesktop: boolean): Stage {
  if (zone === "finale") {
    return {
      x: 0,
      y: 0,
      scale: 1,
      // sit in the upper-middle so the price + Add to Bag bar owns clear space below
      screenY: isDesktop ? 0.42 : 0.36,
    };
  }
  if (zone === "hidden") {
    return { x: 0, y: 0.1, scale: 0.0001, screenY: 0.5 };
  }
  // hero / configurator
  return {
    x: isDesktop ? 0.95 : 0,
    y: 0,
    scale: 1,
    // desktop: centred in its column; mobile: crowns the top third over the copy
    screenY: isDesktop ? 0.5 : 0.34,
  };
}

/* Which chapter owns the ring = the [data-ring] section covering the most of the
   viewport. Only the hero and finale show the ring; editorial sections hide it. */
function currentRingZone() {
  const vh = typeof window !== "undefined" ? window.innerHeight : 900;
  let zone = "hero";
  let best = -1;
  if (typeof document !== "undefined") {
    document.querySelectorAll<HTMLElement>("[data-ring]").forEach((s) => {
      const r = s.getBoundingClientRect();
      const overlap = Math.max(0, Math.min(vh, r.bottom) - Math.max(0, r.top));
      if (overlap > best) {
        best = overlap;
        zone = s.dataset.ring ?? "hero";
      }
    });
  }
  return zone;
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
  const pos = useRef(new THREE.Vector3(isDesktop ? 0.95 : 0, 0, 0));
  const scale = useRef(0.0001);
  const intro = useRef(0);
  const yaw = useRef(0);
  const vel = useRef(0);

  useFrame((state, dt) => {
    const step = Math.min(dt, 1 / 30);
    const zone = currentRingZone();
    if (reduceMotion) intro.current = 1;
    else intro.current = Math.min(1, intro.current + step / 1.1);
    const introEase = 1 - Math.pow(1 - intro.current, 3);
    // Entrance arc — the ring descends from above and unwinds its rotation into
    // the resting pose as it scales in (reveal-through-motion, Oryzo #5/#13/#14).
    const introLift = (1 - introEase) * 1.6;
    const introSpin = (1 - introEase) * -1.5;

    const target = stageFor(zone, isDesktop);
    // Ghost variants belong with the live ring only — on in hero/config + finale.
    setGhostFocus(zone === "hidden" ? 0 : 1);

    const k = reduceMotion ? 999 : 5;
    pos.current.x = damp(pos.current.x, target.x, k, step);
    pos.current.y = damp(pos.current.y, target.y, k, step);
    scale.current = damp(scale.current, target.scale * introEase, k, step);

    setRingReveal(1);
    setRingPose(null, null);

    const ring = ringGroupRef.current;
    if (!ring) return;
    ring.position.copy(pos.current);
    ring.position.y += introLift;
    ring.scale.setScalar(Math.max(0.0001, scale.current));
    ring.visible = scale.current > 0.01;

    // Cursor/touch drag drives yaw with inertia — a flick keeps spinning and
    // eases to a slow idle turn (Oryzo "weight"). Reduced-motion holds still.
    if (isDragging()) {
      yaw.current = getUserYaw();
      vel.current = getUserYawVel();
    } else if (reduceMotion) {
      yaw.current = getUserYaw();
    } else {
      vel.current *= 0.94;
      if (Math.abs(vel.current) > 0.0003) {
        yaw.current += vel.current;
      } else {
        yaw.current += 0.0016; // gentle idle turntable
      }
      setUserYaw(yaw.current);
    }
    ring.rotation.y = yaw.current + introSpin;
    ring.rotation.x = THREE.MathUtils.damp(ring.rotation.x, 0.08 + getUserPitch(), 8, step);
  });

  return null;
}

/* ----------------------------------------------------------------------------
   The cinematographer.

   Instead of a single hardcoded distance, the camera is dollied each frame to
   fit the *measured* ring silhouette (band + the live cut's stone) to a per-cut
   target fill, with safe margins on all sides. Because we fit the rotation-
   invariant swept cylinder (radiusXZ) rather than the instantaneous outline, the
   ring can spin a full turn and never clip. The vertical look-at is derived from
   the chapter's screenY so chapters compose the ring high or centred without the
   stone ever leaving frame. Perceived size stays consistent across cuts; the
   per-shape profile then adds the individually-photographed character.
---------------------------------------------------------------------------- */
function CameraRig({
  isDesktop,
  reduceMotion,
}: {
  isDesktop: boolean;
  reduceMotion: boolean;
}) {
  const camPos = useRef(new THREE.Vector3(0, 0.6, 9));
  const lookAt = useRef(new THREE.Vector3(0, 0, 0));
  const tmpLook = useRef(new THREE.Vector3());

  useFrame((state, dt) => {
    const cam = state.camera as THREE.PerspectiveCamera;
    const step = Math.min(dt, 1 / 30);
    const zone = currentRingZone();
    const stage = stageFor(zone, isDesktop);
    const stone = useConfigurator.getState().stone;
    const profile = STONE_FRAMING[stone];
    const b = getRingBounds();
    const s = stage.scale;

    // World-space extent of the ring at the chapter's scale.
    const centerYWorld = stage.y + ((b.minY + b.maxY) / 2) * s;
    const halfH = ((b.maxY - b.minY) / 2) * s;
    const radius = b.radiusXZ * s;

    // Required half-extents to contain the ring (+ horizontal offset, + any
    // intentional vertical shift) with breathing room.
    const halfW = radius * profile.sideRoom + Math.abs(stage.x);
    const reqH = halfH + Math.abs(profile.yShift * s);

    const vHalf = THREE.MathUtils.degToRad(cam.fov) / 2;
    const aspect = state.size.width / Math.max(1, state.size.height);
    const tanV = Math.tan(vHalf);

    // screenY (0 top → 1 bottom) places the ring centre off the optical axis;
    // the vertical budget is the smaller side, so the fit guarantees the stone
    // never clips even when composed high.
    const vBudget = 2 * Math.min(stage.screenY, 1 - stage.screenY);
    const fill = profile.fill * (isDesktop ? 1 : 0.95);

    const distV = reqH / (tanV * fill * Math.max(0.2, vBudget));
    const distH = halfW / (tanV * aspect * fill);
    const dist = THREE.MathUtils.clamp(Math.max(distV, distH), 4.2, 18);

    // Look-at sits above/below centre so the subject lands at screenY; a small
    // base elevation + the cut's camElev give the downward product-shot angle.
    const viewHalfH = dist * tanV;
    const lookY =
      centerYWorld + (stage.screenY - 0.5) * 2 * viewHalfH + profile.yShift * s;
    const camY = centerYWorld + (isDesktop ? 0.55 : 0.4) + profile.camElev;

    const k = reduceMotion ? 999 : 3.2;
    camPos.current.x = damp(camPos.current.x, 0, k, step);
    camPos.current.y = damp(camPos.current.y, camY, k, step);
    camPos.current.z = damp(camPos.current.z, dist, k, step);
    lookAt.current.x = damp(lookAt.current.x, 0, k, step);
    lookAt.current.y = damp(lookAt.current.y, lookY, k, step);

    cam.position.copy(camPos.current);
    cam.lookAt(tmpLook.current.copy(lookAt.current));
  });

  return null;
}

/* A bright photographic studio — soft white key + fill so the metal reads as
   polished precious metal and the diamond has bright light to refract. This is
   the Do Amore white-studio look, not a dark cinematic void. */
function StudioLights() {
  return (
    <>
      <ambientLight intensity={0.3} />
      {/* Dark environment with bright soft-boxes: metal gleams against the dark,
          the diamond refracts hot highlights and fires — jewellery-on-dark hero. */}
      <Environment resolution={256} environmentIntensity={1.0}>
        <color attach="background" args={["#0e0b08"]} />
        <Lightformer form="rect" intensity={5} color="#fff4e4" scale={[9, 7, 1]} position={[-3, 4, 5]} rotation={[-0.3, 0.2, 0]} />
        <Lightformer form="rect" intensity={6} color="#ffffff" scale={[2, 9, 1]} position={[4.5, 1, 3.5]} rotation={[0, -0.6, 0]} />
        <Lightformer form="rect" intensity={3} color="#ffe9cf" scale={[7, 3, 1]} position={[2, -3, 3]} rotation={[0.4, -0.3, 0]} />
        <Lightformer form="ring" intensity={3} color="#dbe7ff" scale={[3.5, 3.5, 1]} position={[-3, 2, -4]} />
      </Environment>
      <spotLight position={[-4, 7, 6]} angle={0.5} penumbra={1} intensity={2.4} color="#fff3e2" castShadow shadow-bias={-0.0001} shadow-mapSize={[1024, 1024]} />
      <pointLight position={[4, 0, 3]} intensity={0.7} color="#ffe7c2" />
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
    <div className="pointer-events-none fixed inset-0 z-10 h-full w-full">
      <Canvas
        shadows
        dpr={[1, isDesktop ? 1.75 : 1.25]}
        frameloop={cartOpen || docHidden ? "never" : "always"}
        gl={{ antialias: true, alpha: true, powerPreference: "high-performance" }}
        onCreated={({ gl }) => {
          gl.setClearColor(0x000000, 0);
          gl.setClearAlpha(0);
          gl.toneMapping = THREE.ACESFilmicToneMapping;
          gl.toneMappingExposure = 1.0;
          gl.outputColorSpace = THREE.SRGBColorSpace;
        }}
        style={{ pointerEvents: "none" }}
      >
        {/* Initial transform only — CameraRig dollies it to fit each cut. */}
        <PerspectiveCamera makeDefault position={[0, 0.6, 9]} fov={CAMERA_FOV} />
        <CameraRig isDesktop={isDesktop} reduceMotion={reduceMotion} />
        <StudioLights />

        <group ref={ringGroupRef}>
          <Suspense fallback={<TwistRing mobile={!isDesktop} reduceMotion={reduceMotion} />}>
            <ModelBoundary fallback={<TwistRing mobile={!isDesktop} reduceMotion={reduceMotion} />}>
              <HybridRingModel metalId={previewMetal ?? metal} mobile={!isDesktop} />
            </ModelBoundary>
          </Suspense>
        </group>

        {/* Oryzo "choose your own" ghosts — wireframe variants orbiting the hero */}
        {isDesktop && !reduceMotion && <HoloVariants follow={ringGroupRef} />}

        <ContactShadows position={[0, -1.5, 0]} opacity={0.32} scale={9} blur={2.6} far={5} color="#3a342c" />

        <RingStageDirector isDesktop={isDesktop} reduceMotion={reduceMotion} ringGroupRef={ringGroupRef} />

        {isDesktop && !reduceMotion && (
          <EffectComposer enableNormalPass={false}>
            <Bloom intensity={0.35} luminanceThreshold={0.95} luminanceSmoothing={0.2} mipmapBlur />
          </EffectComposer>
        )}
      </Canvas>
    </div>
  );
}
