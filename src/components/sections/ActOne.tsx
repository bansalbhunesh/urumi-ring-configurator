"use client";

import { Suspense, useEffect, useMemo, useRef, useState } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { motion, useReducedMotion } from "framer-motion";
import { getScrollY } from "@/store/configurator";

/* ----------------------------------------------------------------------------
   ACT I — The cold open.

   Particles of light scattered in the dark converge into one bright point as
   you scroll — the first facet, the first reflection. Not a ring yet. A promise
   of one. Self-contained canvas; data-ring="hidden" keeps the global ring out.
---------------------------------------------------------------------------- */

const COUNT = 180;

function Overture({ reduceMotion }: { reduceMotion: boolean }) {
  const pointsRef = useRef<THREE.Points>(null);
  const sparkRef = useRef<THREE.Mesh>(null);

  const { positions, start, target } = useMemo(() => {
    const rand = (i: number, n: number) => {
      const x = Math.sin((i + 1) * n) * 43758.5453;
      return x - Math.floor(x);
    };
    const start = new Float32Array(COUNT * 3);
    const target = new Float32Array(COUNT * 3);
    for (let i = 0; i < COUNT; i++) {
      start[i * 3]     = (rand(i, 12.9898) - 0.5) * 14;
      start[i * 3 + 1] = (rand(i, 78.233)  - 0.5) * 10;
      start[i * 3 + 2] = (rand(i, 37.719)  - 0.5) * 7 - 1;
      const a = rand(i, 5.137) * Math.PI * 2;
      const r = 0.10 + rand(i, 9.21) * 0.44;
      target[i * 3]     = Math.cos(a) * r;
      target[i * 3 + 1] = Math.sin(a) * r * 0.8 - 1.5;
      target[i * 3 + 2] = (rand(i, 2.71) - 0.5) * 0.35;
    }
    return { positions: new Float32Array(start), start, target };
  }, []);

  useFrame((state) => {
    const vh = typeof window !== "undefined" ? window.innerHeight : 900;
    const raw = reduceMotion ? 1 : THREE.MathUtils.clamp(getScrollY() / vh, 0, 1);
    const p = raw * raw * (3 - 2 * raw);

    const pts = pointsRef.current;
    if (pts) {
      const arr = pts.geometry.attributes.position.array as Float32Array;
      const drift = reduceMotion ? 0 : Math.sin(state.clock.elapsedTime * 0.28) * (1 - p) * 0.18;
      for (let i = 0; i < COUNT * 3; i++) {
        arr[i] = start[i] + (target[i] - start[i]) * p + (i % 3 === 1 ? drift : 0);
      }
      pts.geometry.attributes.position.needsUpdate = true;
      pts.rotation.y = reduceMotion ? 0 : state.clock.elapsedTime * 0.035;
      // Fade particles as they converge — they "become" the diamond
      (pts.material as THREE.PointsMaterial).opacity = 0.9 - p * 0.55;
    }

    const spark = sparkRef.current;
    if (spark) {
      const s = 0.02 + p * p * 0.46;
      spark.scale.setScalar(s);
      (spark.material as THREE.MeshBasicMaterial).opacity = p * p;
      // Subtle idle pulse on the formed core
      const pulse = 1 + Math.sin(state.clock.elapsedTime * 2.4) * 0.06 * p;
      spark.scale.multiplyScalar(pulse);
    }
  });

  return (
    <group>
      <points ref={pointsRef}>
        <bufferGeometry>
          <bufferAttribute attach="attributes-position" args={[positions, 3]} />
        </bufferGeometry>
        <pointsMaterial
          size={0.048}
          color="#ffe4b0"
          transparent
          opacity={0.9}
          sizeAttenuation
          depthWrite={false}
          blending={THREE.AdditiveBlending}
        />
      </points>
      {/* The first facet — bright core that forms as particles converge */}
      <mesh ref={sparkRef} position={[0, -1.5, 0]}>
        <icosahedronGeometry args={[1, 1]} />
        <meshBasicMaterial
          color="#ffecb8"
          transparent
          opacity={0}
          blending={THREE.AdditiveBlending}
          depthWrite={false}
          toneMapped={false}
        />
      </mesh>
    </group>
  );
}

export function ActOne() {
  const ref = useRef<HTMLDivElement>(null);
  const [show, setShow] = useState(false);
  const reduce = useReducedMotion() ?? false;

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          setShow(true);
          io.disconnect();
        }
      },
      { rootMargin: "200px" },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  return (
    <section
      ref={ref}
      id="overture"
      data-ring="hidden"
      className="relative h-[165svh]"
      aria-label="An overture"
    >
      <div className="sticky top-0 flex h-[100svh] items-center justify-center overflow-hidden">
        <div className="absolute inset-0">
          {show && (
            <Canvas
              dpr={[1, 1.75]}
              camera={{ position: [0, 0, 8], fov: 40 }}
              gl={{ antialias: true, alpha: true }}
            >
              <Suspense fallback={null}>
                <Overture reduceMotion={reduce} />
              </Suspense>
            </Canvas>
          )}
        </div>

        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: false, margin: "-20%" }}
          transition={{ duration: 1.8, ease: [0.22, 1, 0.36, 1] }}
          className="pointer-events-none relative z-10 px-6 text-center"
        >
          {/* Brand mark */}
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 1, delay: 0.3, ease: [0.22, 1, 0.36, 1] }}
            className="mb-8 flex items-center justify-center gap-2"
          >
            <span className="h-px w-8 bg-gold/40" />
            <span className="eyebrow text-gold/60">Aurelle · Est. 2024</span>
            <span className="h-px w-8 bg-gold/40" />
          </motion.div>

          <p className="font-display text-balance text-[1.5rem] leading-snug text-ink/90 sm:text-[2.1rem]">
            Every forever begins
            <br className="hidden sm:block" /> as a possibility.
          </p>

          <motion.span
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: false }}
            transition={{ duration: 1, delay: 0.8 }}
            className="mt-10 block text-[0.62rem] uppercase tracking-[0.32em] text-muted"
          >
            Scroll
          </motion.span>
        </motion.div>
      </div>
    </section>
  );
}
