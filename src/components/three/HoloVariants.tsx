"use client";

import { useMemo, useRef, type RefObject } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { getGhostFocus } from "@/store/configurator";

/* ----------------------------------------------------------------------------
   Holographic variant ghosts — the Oryzo "CHOOSE YOUR OWN" signature.

   In the reference (oryzo.ai · product selector) faint wireframe duplicates of
   the hero product orbit behind it in deep space, implying the variants you can
   configure without ever leaving the page. We transfer that feeling literally:
   a few wireframe "ghost rings" and floating diamond octahedra drift in a slow
   orbit behind the live ring — warm-amber, additive, weightless.

   Cheap + software-WebGL-safe: basic wireframe materials only (lines always
   render), depthWrite off, renderOrder behind the hero. Opacity is driven by
   the hero ring's own scale, so the ghosts fade in exactly as the ring takes
   the stage and vanish when an editorial section owns the canvas.
---------------------------------------------------------------------------- */

const ACCENT = new THREE.Color("#ff7a2a");
const ACCENT_DEEP = new THREE.Color("#dc5000");
const COOL = new THREE.Color("#cdb59b");

type Ghost = {
  kind: "ring" | "diamond";
  radius: number; // orbit radius around the hero
  height: number; // vertical offset
  speed: number; // orbital angular velocity
  phase: number; // starting angle
  spin: number; // self-spin speed
  scale: number;
  tilt: number;
  color: THREE.Color;
  baseOpacity: number;
};

const GHOSTS: Ghost[] = [
  { kind: "ring", radius: 2.7, height: 0.2, speed: 0.075, phase: 0.4, spin: 0.16, scale: 0.6, tilt: 0.6, color: ACCENT_DEEP, baseOpacity: 0.28 },
  { kind: "ring", radius: 3.15, height: -0.4, speed: -0.05, phase: 2.6, spin: -0.1, scale: 0.74, tilt: -0.8, color: ACCENT, baseOpacity: 0.2 },
  { kind: "diamond", radius: 2.35, height: 1.05, speed: 0.11, phase: 1.2, spin: 0.6, scale: 0.24, tilt: 0.3, color: ACCENT, baseOpacity: 0.32 },
  { kind: "diamond", radius: 2.9, height: -0.95, speed: -0.09, phase: 4.0, spin: 0.5, scale: 0.2, tilt: 0.9, color: COOL, baseOpacity: 0.26 },
];

function GhostNode({ ghost, follow }: { ghost: Ghost; follow: RefObject<THREE.Group | null> }) {
  const group = useRef<THREE.Group>(null);
  const matRef = useRef<THREE.LineBasicMaterial>(null);

  const geometry = useMemo(() => {
    const src =
      ghost.kind === "ring"
        ? new THREE.TorusGeometry(1, 0.045, 5, 56)
        : new THREE.OctahedronGeometry(1, 0);
    const wire = new THREE.WireframeGeometry(src);
    src.dispose();
    return wire;
  }, [ghost.kind]);

  const focus = useRef(0);

  useFrame((state, dt) => {
    const g = group.current;
    if (!g) return;
    const t = state.clock.elapsedTime;
    const ang = ghost.phase + t * ghost.speed;

    // Follow the hero ring's stage position so the ghosts always orbit it,
    // whether it is parked right (config) or centred (finale).
    const host = follow.current;
    const cx = host ? host.position.x : 0;
    const cy = host ? host.position.y : 0;
    // Presence = scroll-zone focus (snaps with the section) × ring scale, so the
    // ghosts only exist alongside the live ring and fade out in editorial zones.
    focus.current = THREE.MathUtils.damp(focus.current, getGhostFocus(), 7, dt);
    const ringScale = host ? THREE.MathUtils.clamp(host.scale.x, 0, 1) : 0;
    const presence = focus.current * ringScale;

    g.position.set(
      cx + Math.cos(ang) * ghost.radius,
      cy + ghost.height + Math.sin(t * 0.5 + ghost.phase) * 0.12,
      Math.sin(ang) * ghost.radius - 1.4, // bias behind the hero
    );
    g.rotation.x = ghost.tilt + t * ghost.spin * 0.3;
    g.rotation.y = t * ghost.spin;
    const s = ghost.scale * (0.85 + presence * 0.15);
    g.scale.setScalar(s);

    const mat = matRef.current;
    if (mat) {
      const flicker = 0.82 + Math.sin(t * 1.7 + ghost.phase * 3) * 0.18;
      // Fade as a ghost swings toward the front so it never slashes across the
      // hero ring — they read as duplicates receding into the dark behind it.
      const depthFade = THREE.MathUtils.clamp(-g.position.z / 1.3, 0.1, 1);
      mat.opacity = ghost.baseOpacity * presence * presence * flicker * depthFade;
    }
  });

  return (
    <group ref={group}>
      <lineSegments geometry={geometry} renderOrder={-2}>
        <lineBasicMaterial
          ref={matRef}
          color={ghost.color}
          transparent
          opacity={0}
          blending={THREE.AdditiveBlending}
          depthWrite={false}
          toneMapped={false}
        />
      </lineSegments>
    </group>
  );
}

export function HoloVariants({ follow }: { follow: RefObject<THREE.Group | null> }) {
  return (
    <group>
      {GHOSTS.map((ghost, i) => (
        <GhostNode key={i} ghost={ghost} follow={follow} />
      ))}
    </group>
  );
}
