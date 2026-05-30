"use client";

import { useEffect, useMemo, useRef } from "react";
import { useFrame, useThree, type ThreeEvent } from "@react-three/fiber";
import * as THREE from "three";
import { METAL_BY_ID } from "@/lib/config";
import type { MetalOption } from "@/lib/types";
import {
  useConfigurator,
  getRingYawTarget,
  getRingPitchTarget,
  getRingReveal,
  setRingPose,
} from "@/store/configurator";
import { Gem } from "./Gem";

/* ----------------------------------------------------------------------------
   Procedural "twist" engagement ring.

   Two metal strands run the full circle of the band. The twist between them is
   not uniform: a smooth bump function concentrates the winding at the top
   shoulders and falls to zero at the bottom, so the lower shank reads as one
   clean comfort-fit band while the shoulders open into a symmetric twist that
   sweeps up and cradles a raised solitaire — the signature of the reference
   ring, rather than a uniform rope eternity band.
---------------------------------------------------------------------------- */

const RING_RADIUS = 1;
const STRAND_TUBE = 0.058;
const SEPARATION = 0.072;
const HALF_TURNS = 3;

const GEM_Y = 1.34;
const GEM_SCALE = 1.35;

type MetalShader = {
  uniforms: Record<string, { value: unknown }>;
  vertexShader: string;
  fragmentShader: string;
};

class TwistStrand extends THREE.Curve<THREE.Vector3> {
  constructor(private phase: number) {
    super();
  }
  getPoint(t: number, target = new THREE.Vector3()) {
    const theta = t * Math.PI * 2;
    const a = theta + Math.PI / 2;
    const g = (1 - Math.cos(a)) / 2;
    const psi = HALF_TURNS * Math.PI * g + this.phase;

    const cx = Math.cos(theta) * RING_RADIUS;
    const cy = Math.sin(theta) * RING_RADIUS;
    const nx = Math.cos(theta);
    const ny = Math.sin(theta);

    const offN = SEPARATION * Math.sin(psi);
    const offB = SEPARATION * Math.cos(psi);
    target.set(cx + nx * offN, cy + ny * offN, offB);
    return target;
  }
}

/* A gentle "materialise" dissolve on first load — premium without being a
   gimmick. Driven by a single uProgress uniform that climbs 0 → 1 once. */
function patchMetalShader(shader: MetalShader) {
  shader.uniforms.uProgress = { value: 0 };

  shader.fragmentShader = `
    uniform float uProgress;
    varying vec3 vWorldPosition;

    vec4 permute(vec4 x){return mod(((x*34.0)+1.0)*x, 289.0);}
    vec4 taylorInvSqrt(vec4 r){return 1.79284291400159 - 0.85373472095314 * r;}
    float snoise(vec3 v){
      const vec2 C = vec2(1.0/6.0, 1.0/3.0);
      const vec4 D = vec4(0.0, 0.5, 1.0, 2.0);
      vec3 i = floor(v + dot(v, C.yyy));
      vec3 x0 = v - i + dot(i, C.xxx);
      vec3 g = step(x0.yzx, x0.xyz);
      vec3 l = 1.0 - g;
      vec3 i1 = min(g.xyz, l.zxy);
      vec3 i2 = max(g.xyz, l.zxy);
      vec3 x1 = x0 - i1 + C.xxx;
      vec3 x2 = x0 - i2 + C.yyy;
      vec3 x3 = x0 - D.yyy;
      i = mod(i, 289.0);
      vec4 p = permute(permute(permute(
        i.z + vec4(0.0, i1.z, i2.z, 1.0))
        + i.y + vec4(0.0, i1.y, i2.y, 1.0))
        + i.x + vec4(0.0, i1.x, i2.x, 1.0));
      float n_ = 1.0/7.0;
      vec3 ns = n_ * D.wyz - D.xzx;
      vec4 j = p - 49.0 * floor(p * ns.z * ns.z);
      vec4 x_ = floor(j * ns.z);
      vec4 y_ = floor(j - 7.0 * x_);
      vec4 x = x_ * ns.x + ns.yyyy;
      vec4 y = y_ * ns.x + ns.yyyy;
      vec4 h = 1.0 - abs(x) - abs(y);
      vec4 b0 = vec4(x.xy, y.xy);
      vec4 b1 = vec4(x.zw, y.zw);
      vec4 s0 = floor(b0) * 2.0 + 1.0;
      vec4 s1 = floor(b1) * 2.0 + 1.0;
      vec4 sh = -step(h, vec4(0.0));
      vec4 a0 = b0.xzyw + s0.xzyw * sh.xxyy;
      vec4 a1 = b1.xzyw + s1.xzyw * sh.zzww;
      vec3 p0 = vec3(a0.xy, h.x);
      vec3 p1 = vec3(a0.zw, h.y);
      vec3 p2 = vec3(a1.xy, h.z);
      vec3 p3 = vec3(a1.zw, h.w);
      vec4 norm = taylorInvSqrt(vec4(dot(p0,p0), dot(p1,p1), dot(p2,p2), dot(p3,p3)));
      p0 *= norm.x;
      p1 *= norm.y;
      p2 *= norm.z;
      p3 *= norm.w;
      vec4 m = max(0.6 - vec4(dot(x0,x0), dot(x1,x1), dot(x2,x2), dot(x3,x3)), 0.0);
      m = m * m;
      return 42.0 * dot(m*m, vec4(dot(p0,x0), dot(p1,x1), dot(p2,x2), dot(p3,x3)));
    }

    ${shader.fragmentShader}
  `
    .replace(
      `#include <dithering_fragment>`,
      `
      #include <dithering_fragment>
      float noise = snoise(vWorldPosition * 12.0);
      float threshold = clamp(uProgress * 1.5 - 0.25, 0.0, 1.0);
      if (noise * 0.5 + 0.5 > threshold && uProgress < 0.99) {
        discard;
      }
      float edge = smoothstep(threshold - 0.08, threshold, noise * 0.5 + 0.5);
      if (edge > 0.0 && uProgress < 0.99) {
        gl_FragColor.rgb += vec3(1.0, 0.88, 0.7) * edge * 0.9;
      }
      `,
    );

  shader.vertexShader = shader.vertexShader.replace(
    `#include <worldpos_vertex>`,
    `#include <worldpos_vertex>\n    vWorldPosition = (modelMatrix * vec4(transformed, 1.0)).xyz;`,
  );
  shader.vertexShader = `varying vec3 vWorldPosition;\n${shader.vertexShader}`;
}

function MetalMaterial({
  metal,
  progress,
}: {
  metal: MetalOption;
  progress: { current: number };
}) {
  const materialRef = useRef<THREE.MeshStandardMaterial>(null);
  const shaderRef = useRef<MetalShader | null>(null);
  const targetColor = useMemo(() => new THREE.Color(metal.color), [metal.color]);

  useFrame((_, dt) => {
    const material = materialRef.current;
    if (material) {
      material.color.lerp(targetColor, 1 - Math.exp(-9 * dt));
      material.roughness = THREE.MathUtils.damp(material.roughness, metal.roughness, 9, dt);
    }
    const shader = shaderRef.current;
    if (shader) shader.uniforms.uProgress.value = progress.current;
  });

  return (
    <meshStandardMaterial
      ref={materialRef}
      color="#e9e9ec"
      metalness={1}
      roughness={0.18}
      envMapIntensity={1.15}
      transparent
      depthWrite
      onBeforeCompile={(shader) => {
        patchMetalShader(shader);
        shaderRef.current = shader;
      }}
    />
  );
}

export function TwistRing({
  mobile,
  reduceMotion = false,
}: {
  mobile: boolean;
  reduceMotion?: boolean;
}) {
  const committed = useConfigurator((s) => s.metal);
  const preview = useConfigurator((s) => s.previewMetal);
  const metalId = preview ?? committed;
  const metal = METAL_BY_ID[metalId];

  const { strandA, strandB } = useMemo(
    () => ({
      strandA: new THREE.TubeGeometry(new TwistStrand(0), 600, STRAND_TUBE, 18, true),
      strandB: new THREE.TubeGeometry(new TwistStrand(Math.PI), 600, STRAND_TUBE, 18, true),
    }),
    [],
  );

  const introProgress = useRef(0);
  const tiltRef = useRef<THREE.Group>(null);
  const pointer = useThree((s) => s.pointer);

  // Drag-to-rotate state: yaw accumulator + inertial velocity.
  const drag = useRef({ active: false, lastX: 0, yaw: 0, vel: 0 });

  const onPointerDown = (e: ThreeEvent<PointerEvent>) => {
    drag.current.active = true;
    drag.current.lastX = e.clientX;
    drag.current.vel = 0;
    setRingPose(null, null); // grabbing the ring releases any preset/reset view
    (e.target as Element)?.setPointerCapture?.(e.pointerId);
    e.stopPropagation();
  };
  const onPointerMove = (e: ThreeEvent<PointerEvent>) => {
    if (!drag.current.active) return;
    const sens = mobile ? 0.012 : 0.0085;
    const d = (e.clientX - drag.current.lastX) * sens;
    drag.current.lastX = e.clientX;
    drag.current.yaw += d;
    drag.current.vel = d;
    e.stopPropagation();
  };
  const onPointerUp = (e: ThreeEvent<PointerEvent>) => {
    drag.current.active = false;
    e.stopPropagation();
  };

  useFrame((state, dt) => {
    // Act III — the metal materialises in step with the ring's reveal (scale),
    // so it grows into being as it enters the stage and stays solid once there.
    introProgress.current = THREE.MathUtils.damp(
      introProgress.current,
      getRingReveal(),
      6,
      dt,
    );

    const g = tiltRef.current;
    if (!g) return;
    const d = drag.current;
    const yawTarget = getRingYawTarget();
    const pitchTarget = getRingPitchTarget();

    if (reduceMotion) {
      if (yawTarget != null) d.yaw += (yawTarget - d.yaw) * 0.25;
      g.rotation.y += (d.yaw - g.rotation.y) * 0.2;
      g.rotation.x = pitchTarget ?? 0;
      return;
    }

    if (!d.active) {
      if (yawTarget != null) {
        // Eased move to a requested angle (view preset / reset); idle paused.
        d.yaw += (yawTarget - d.yaw) * 0.12;
        d.vel = 0;
      } else {
        // Base rotation is now scroll-driven (the ScrollDirector turntable scrubs
        // the ring with page scroll). Here we only carry drag inertia so a flick
        // still spins down naturally; when idle the ring holds its frame.
        d.yaw += d.vel; // inertia
        d.vel *= 0.92;
      }
    }

    // Pitch follows a preset when set, otherwise gentle pointer parallax.
    const tiltX = pitchTarget != null ? pitchTarget : -pointer.y * 0.1;
    g.rotation.y += (d.yaw - g.rotation.y) * 0.1;
    g.rotation.x += (tiltX - g.rotation.x) * 0.05;

    // barely-there idle drift so it feels alive, not floating away
    const t = state.clock.elapsedTime;
    g.position.x = Math.sin(t * 0.4) * 0.012;
    g.position.y = Math.cos(t * 0.5) * 0.012;
  });

  useEffect(() => {
    return () => {
      strandA.dispose();
      strandB.dispose();
    };
  }, [strandA, strandB]);

  const prongs = useMemo(
    () => [0, 1, 2, 3].map((i) => (i * Math.PI) / 2 + Math.PI / 4),
    [],
  );

  return (
    <group
      ref={tiltRef}
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={onPointerUp}
      onPointerCancel={onPointerUp}
    >
      <mesh geometry={strandA} castShadow receiveShadow>
        <MetalMaterial metal={metal} progress={introProgress} />
      </mesh>
      <mesh geometry={strandB} castShadow receiveShadow>
        <MetalMaterial metal={metal} progress={introProgress} />
      </mesh>

      {/* Setting: basket gallery + four prongs cradling the raised solitaire */}
      <group position={[0, GEM_Y, 0]}>
        <mesh position={[0, -0.22, 0]} castShadow>
          <torusGeometry args={[0.205, 0.024, 14, 44]} />
          <MetalMaterial metal={metal} progress={introProgress} />
        </mesh>
        {prongs.map((ang, i) => {
          const r = 0.235;
          return (
            <mesh
              key={i}
              position={[Math.cos(ang) * r, -0.05, Math.sin(ang) * r]}
              rotation={[Math.sin(ang) * 0.3, 0, -Math.cos(ang) * 0.3]}
              castShadow
            >
              <cylinderGeometry args={[0.018, 0.028, 0.36, 12]} />
              <MetalMaterial metal={metal} progress={introProgress} />
            </mesh>
          );
        })}

        <group scale={GEM_SCALE}>
          <Gem mobile={mobile} />
        </group>
      </group>
    </group>
  );
}
