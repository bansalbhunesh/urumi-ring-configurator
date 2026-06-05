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
const COOL = new THREE.Color("#e7b27a");

type Ghost = {
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

/* Each ghost is a whole ring — a twisted wireframe band lifting a faceted
   diamond — so the orbiting "variants" actually read as the product (the Oryzo
   "choose your own" duplicates), not abstract orange diagrams. */
const GHOSTS: Ghost[] = [
  { radius: 2.7, height: 0.25, speed: 0.07, phase: 0.4, spin: 0.18, scale: 0.62, tilt: 0.5, color: ACCENT_DEEP, baseOpacity: 0.3 },
  { radius: 3.2, height: -0.5, speed: -0.05, phase: 2.6, spin: -0.12, scale: 0.78, tilt: -0.7, color: ACCENT, baseOpacity: 0.22 },
  { radius: 2.45, height: 1.0, speed: 0.1, phase: 4.2, spin: 0.24, scale: 0.5, tilt: 0.9, color: COOL, baseOpacity: 0.26 },
];

/* A wireframe "twist ring" ghost: two interleaved bands (the twin shanks of The
   Twist) cradling an octahedron diamond. Built once and shared by all ghosts. */
function buildGhostRing(): THREE.BufferGeometry {
  const parts: THREE.BufferGeometry[] = [];

  // Two thin tori, tilted opposite ways, evoke the twisted twin strands.
  for (const sign of [1, -1]) {
    const band = new THREE.TorusGeometry(0.92, 0.05, 6, 80);
    band.rotateX(Math.PI / 2);
    band.rotateZ(sign * 0.17);
    parts.push(new THREE.WireframeGeometry(band));
    band.dispose();
  }

  // Four prongs + the centre stone, lifted to the crown of the band.
  const stone = new THREE.OctahedronGeometry(0.26, 0);
  stone.translate(0, 1.04, 0);
  parts.push(new THREE.WireframeGeometry(stone));
  stone.dispose();

  // Merge the wireframe line segments into one buffer (position-only).
  let total = 0;
  for (const p of parts) total += (p.getAttribute("position") as THREE.BufferAttribute).count;
  const merged = new Float32Array(total * 3);
  let o = 0;
  for (const p of parts) {
    const pos = p.getAttribute("position") as THREE.BufferAttribute;
    merged.set(pos.array as Float32Array, o);
    o += pos.array.length;
    p.dispose();
  }
  const geo = new THREE.BufferGeometry();
  geo.setAttribute("position", new THREE.BufferAttribute(merged, 3));
  return geo;
}

let _sharedGhostGeo: THREE.BufferGeometry | null = null;
function ghostGeometry() {
  if (!_sharedGhostGeo) _sharedGhostGeo = buildGhostRing();
  return _sharedGhostGeo;
}

function GhostNode({ ghost, follow }: { ghost: Ghost; follow: RefObject<THREE.Group | null> }) {
  const group = useRef<THREE.Group>(null);
  const matRef = useRef<THREE.LineBasicMaterial>(null);
  const geometry = useMemo(() => ghostGeometry(), []);

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
      Math.sin(ang) * ghost.radius - 1.6, // bias behind the hero
    );
    g.rotation.x = ghost.tilt + Math.sin(t * 0.2 + ghost.phase) * 0.1;
    g.rotation.y = t * ghost.spin;
    const s = ghost.scale * (0.85 + presence * 0.15);
    g.scale.setScalar(s);

    const mat = matRef.current;
    if (mat) {
      const flicker = 0.86 + Math.sin(t * 1.7 + ghost.phase * 3) * 0.14;
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
