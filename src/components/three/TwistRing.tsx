"use client";

import { useEffect, useMemo, useRef } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";
import { METAL_BY_ID } from "@/lib/config";
import { useConfigurator } from "@/store/configurator";
import { Gem } from "./Gem";

/* ----------------------------------------------------------------------------
   Procedural "twist" engagement ring — modelled on the Do Amore twist solitaire.

   Two metal strands run the full circle of the band. The twist between them is
   not uniform: a smooth bump function concentrates the winding at the top
   shoulders and lets it fall to zero at the bottom, so the lower shank reads as
   one clean comfort-fit band while the shoulders open into a symmetric twist
   that sweeps up and cradles a raised solitaire — the signature of the
   reference ring, rather than a uniform rope eternity band.
---------------------------------------------------------------------------- */

const RING_RADIUS = 1;
const STRAND_TUBE = 0.058;
const SEPARATION = 0.072;
const HALF_TURNS = 3; // half-twists from bottom up to the top, per shoulder

const GEM_Y = 1.34;
const GEM_SCALE = 1.35;

class TwistStrand extends THREE.Curve<THREE.Vector3> {
  constructor(private phase: number) {
    super();
  }
  getPoint(t: number, target = new THREE.Vector3()) {
    const theta = t * Math.PI * 2;
    const a = theta + Math.PI / 2; // 0 at the bottom (-Y), PI at the top (+Y)
    const g = (1 - Math.cos(a)) / 2; // smooth 0 -> 1 -> 0, peaks at the top
    const psi = HALF_TURNS * Math.PI * g + this.phase;

    const cx = Math.cos(theta) * RING_RADIUS;
    const cy = Math.sin(theta) * RING_RADIUS;
    const nx = Math.cos(theta);
    const ny = Math.sin(theta);

    // offset rotates from the finger axis (z) at the bottom into the radial
    // plane as it climbs — the strands lie side by side low, twist up high.
    const offN = SEPARATION * Math.sin(psi);
    const offB = SEPARATION * Math.cos(psi);
    target.set(cx + nx * offN, cy + ny * offN, offB);
    return target;
  }
}

export function TwistRing({ mobile }: { mobile: boolean }) {
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
  
  const metalMat = useMemo(() => {
    const mat = new THREE.MeshStandardMaterial({
      color: new THREE.Color(metal.color),
      metalness: 1,
      roughness: metal.roughness,
      envMapIntensity: 1.55,
      transparent: true,
      depthWrite: true,
    });

    mat.onBeforeCompile = (shader) => {
      shader.uniforms.uProgress = { value: 0 };
      mat.userData.shader = shader;
      
      shader.vertexShader = `
        varying vec3 vWorldPosition;
        ${shader.vertexShader}
      `.replace(
        `#include <worldpos_vertex>`,
        `
        #include <worldpos_vertex>
        vWorldPosition = (modelMatrix * vec4(transformed, 1.0)).xyz;
        `
      );
      
      shader.fragmentShader = `
        uniform float uProgress;
        varying vec3 vWorldPosition;
        
        // Simplex 3D Noise
        vec4 permute(vec4 x){return mod(((x*34.0)+1.0)*x, 289.0);}
        vec4 taylorInvSqrt(vec4 r){return 1.79284291400159 - 0.85373472095314 * r;}
        float snoise(vec3 v){ 
          const vec2  C = vec2(1.0/6.0, 1.0/3.0) ;
          const vec4  D = vec4(0.0, 0.5, 1.0, 2.0);
          vec3 i  = floor(v + dot(v, C.yyy) );
          vec3 x0 = v - i + dot(i, C.xxx) ;
          vec3 g = step(x0.yzx, x0.xyz);
          vec3 l = 1.0 - g;
          vec3 i1 = min( g.xyz, l.zxy );
          vec3 i2 = max( g.xyz, l.zxy );
          vec3 x1 = x0 - i1 + 1.0 * C.xxx;
          vec3 x2 = x0 - i2 + 2.0 * C.xxx;
          vec3 x3 = x0 - 1.0 + 3.0 * C.xxx;
          i = mod(i, 289.0 ); 
          vec4 p = permute( permute( permute( 
                     i.z + vec4(0.0, i1.z, i2.z, 1.0 ))
                   + i.y + vec4(0.0, i1.y, i2.y, 1.0 )) 
                   + i.x + vec4(0.0, i1.x, i2.x, 1.0 ));
          float n_ = 1.0/7.0;
          vec3  ns = n_ * D.wyz - D.xzx;
          vec4 j = p - 49.0 * floor(p * ns.z *ns.z);
          vec4 x_ = floor(j * ns.z);
          vec4 y_ = floor(j - 7.0 * x_ );
          vec4 x = x_ *ns.x + ns.yyyy;
          vec4 y = y_ *ns.x + ns.yyyy;
          vec4 h = 1.0 - abs(x) - abs(y);
          vec4 b0 = vec4( x.xy, y.xy );
          vec4 b1 = vec4( x.zw, y.zw );
          vec4 s0 = floor(b0)*2.0 + 1.0;
          vec4 s1 = floor(b1)*2.0 + 1.0;
          vec4 sh = -step(h, vec4(0.0));
          vec4 a0 = b0.xzyw + s0.xzyw*sh.xxyy ;
          vec4 a1 = b1.xzyw + s1.xzyw*sh.zzww ;
          vec3 p0 = vec3(a0.xy,h.x);
          vec3 p1 = vec3(a0.zw,h.y);
          vec3 p2 = vec3(a1.xy,h.z);
          vec3 p3 = vec3(a1.zw,h.w);
          vec4 norm = taylorInvSqrt(vec4(dot(p0,p0), dot(p1,p1), dot(p2, p2), dot(p3,p3)));
          p0 *= norm.x;
          p1 *= norm.y;
          p2 *= norm.z;
          p3 *= norm.w;
          vec4 m = max(0.6 - vec4(dot(x0,x0), dot(x1,x1), dot(x2,x2), dot(x3,x3)), 0.0);
          m = m * m;
          return 42.0 * dot( m*m, vec4( dot(p0,x0), dot(p1,x1), 
                                        dot(p2,x2), dot(p3,x3) ) );
        }

        ${shader.fragmentShader}
      `.replace(
        `#include <dithering_fragment>`,
        `
        #include <dithering_fragment>
        
        float noise = snoise(vWorldPosition * 12.0);
        float threshold = clamp(uProgress * 1.5 - 0.25, 0.0, 1.0);
        
        if (noise * 0.5 + 0.5 > threshold && uProgress < 0.99) {
          discard;
        }
        
        // Golden burn edge
        float edge = smoothstep(threshold - 0.08, threshold, noise * 0.5 + 0.5);
        if (edge > 0.0 && uProgress < 0.99) {
          gl_FragColor.rgb += vec3(1.0, 0.7, 0.2) * edge * 2.5;
        }
        `
      );
    };
    return mat;
  }, [metal.color, metal.roughness]);

  const targetColor = useMemo(() => new THREE.Color(metal.color), [metal.color]);
  const targetRough = metal.roughness;

  useFrame((_, dt) => {
    metalMat.color.lerp(targetColor, 1 - Math.exp(-9 * dt));
    metalMat.roughness = THREE.MathUtils.damp(metalMat.roughness, targetRough, 9, dt);
    
    // Animate materialization progress over the first few seconds
    if (introProgress.current < 1) {
      introProgress.current = THREE.MathUtils.damp(introProgress.current, 1.1, 1.2, dt);
      if (metalMat.userData.shader) {
        metalMat.userData.shader.uniforms.uProgress.value = introProgress.current;
      }
    }
  });

  // The "Living" Ring
  const tiltRef = useRef<THREE.Group>(null);
  const pointer = useThree((s) => s.pointer);
  
  useFrame((state) => {
    const g = tiltRef.current;
    if (!g) return;
    
    g.rotation.x += (-pointer.y * 0.12 - g.rotation.x) * 0.06;
    g.rotation.y += (pointer.x * 0.18 - g.rotation.y) * 0.06;
    
    const t = state.clock.elapsedTime;
    g.position.x = Math.sin(t * 0.4) * Math.cos(t * 0.31) * 0.015;
    g.position.y = Math.cos(t * 0.5) * Math.sin(t * 0.39) * 0.015;
    g.rotation.z = Math.sin(t * 0.35) * Math.sin(t * 0.28) * 0.02;

    // Heartbeat: 0.3% scale oscillation, 4-second sine loop
    const breath = 1 + Math.sin(t * (Math.PI / 2)) * 0.003;
    g.scale.setScalar(breath);
  });

  useEffect(() => {
    return () => {
      strandA.dispose();
      strandB.dispose();
      metalMat.dispose();
    };
  }, [strandA, strandB, metalMat]);

  const prongs = useMemo(
    () => [0, 1, 2, 3].map((i) => (i * Math.PI) / 2 + Math.PI / 4),
    [],
  );

  return (
    <group ref={tiltRef}>
      <mesh geometry={strandA} material={metalMat} castShadow receiveShadow />
      <mesh geometry={strandB} material={metalMat} castShadow receiveShadow />

      {/* Setting: basket gallery + four prongs cradling the raised solitaire */}
      <group position={[0, GEM_Y, 0]}>
        <mesh position={[0, -0.22, 0]} material={metalMat} castShadow>
          <torusGeometry args={[0.205, 0.024, 14, 44]} />
        </mesh>
        {prongs.map((ang, i) => {
          const r = 0.235;
          return (
            <mesh
              key={i}
              position={[Math.cos(ang) * r, -0.05, Math.sin(ang) * r]}
              rotation={[Math.sin(ang) * 0.3, 0, -Math.cos(ang) * 0.3]}
              material={metalMat}
              castShadow
            >
              <cylinderGeometry args={[0.018, 0.028, 0.36, 12]} />
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
