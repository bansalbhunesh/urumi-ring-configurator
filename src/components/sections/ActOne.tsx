"use client";

import { Suspense, useEffect, useMemo, useRef, useState } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { motion, useReducedMotion } from "framer-motion";
import { getScrollY } from "@/store/configurator";

/* ----------------------------------------------------------------------------
   ACT I — Before the ring exists.

   The story's cold open. The screen is nearly black. Faint particles of light
   appear, drift, and — as you scroll — converge from a scattered cloud into a
   single bright point: the first facet, the first reflection. Not a ring yet.
   Just a possibility.

   Self-contained: its own small canvas, lazy-mounted, isolated from the global
   ring canvas (data-ring="hidden" keeps the configurator ring out of frame).
   Scroll-scrubbed convergence; reduced-motion shows the formed point, still.
---------------------------------------------------------------------------- */

const COUNT = 160;

function Overture({ reduceMotion }: { reduceMotion: boolean }) {
  const pointsRef = useRef<THREE.Points>(null);
  const sparkRef = useRef<THREE.Mesh>(null);

  // Seeded scattered start + tight converged target for each particle.
  const { positions, start, target } = useMemo(() => {
    const rand = (i: number, n: number) => {
      const x = Math.sin((i + 1) * n) * 43758.5453;
      return x - Math.floor(x);
    };
    const start = new Float32Array(COUNT * 3);
    const target = new Float32Array(COUNT * 3);
    for (let i = 0; i < COUNT; i++) {
      // scattered: wide cloud
      start[i * 3] = (rand(i, 12.9898) - 0.5) * 12;
      start[i * 3 + 1] = (rand(i, 78.233) - 0.5) * 8;
      start[i * 3 + 2] = (rand(i, 37.719) - 0.5) * 6 - 1;
      // converged: a small luminous core
      // converge to the lower third so the forming facet sits below the line,
      // never behind it
      const a = rand(i, 5.137) * Math.PI * 2;
      const r = 0.12 + rand(i, 9.21) * 0.5;
      target[i * 3] = Math.cos(a) * r;
      target[i * 3 + 1] = Math.sin(a) * r * 0.8 - 1.5;
      target[i * 3 + 2] = (rand(i, 2.71) - 0.5) * 0.4;
    }
    return { positions: new Float32Array(start), start, target };
  }, []);

  useFrame((state) => {
    const vh = typeof window !== "undefined" ? window.innerHeight : 900;
    const raw = reduceMotion ? 1 : THREE.MathUtils.clamp(getScrollY() / vh, 0, 1);
    // ease-in-out so the convergence feels cinematic, not linear
    const p = raw * raw * (3 - 2 * raw);

    const pts = pointsRef.current;
    if (pts) {
      const arr = pts.geometry.attributes.position.array as Float32Array;
      const drift = reduceMotion ? 0 : Math.sin(state.clock.elapsedTime * 0.3) * (1 - p) * 0.15;
      for (let i = 0; i < COUNT * 3; i++) {
        arr[i] = start[i] + (target[i] - start[i]) * p + (i % 3 === 1 ? drift : 0);
      }
      pts.geometry.attributes.position.needsUpdate = true;
      pts.rotation.y = reduceMotion ? 0 : state.clock.elapsedTime * 0.04;
    }

    const spark = sparkRef.current;
    if (spark) {
      const s = 0.02 + p * p * 0.42;
      spark.scale.setScalar(s);
      (spark.material as THREE.MeshBasicMaterial).opacity = p * p;
    }
  });

  return (
    <group>
      <points ref={pointsRef}>
        <bufferGeometry>
          <bufferAttribute attach="attributes-position" args={[positions, 3]} />
        </bufferGeometry>
        <pointsMaterial
          size={0.045}
          color="#ffe4b0"
          transparent
          opacity={0.9}
          sizeAttenuation
          depthWrite={false}
          blending={THREE.AdditiveBlending}
        />
      </points>
      {/* The first facet — a bright core that forms as the particles converge */}
      <mesh ref={sparkRef} position={[0, -1.5, 0]}>
        <icosahedronGeometry args={[1, 0]} />
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
      {/* Pinned stage — particles + line hold center while you scroll through */}
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
          transition={{ duration: 1.6, ease: [0.22, 1, 0.36, 1] }}
          className="pointer-events-none relative z-10 px-6 text-center"
        >
          <p className="font-display text-balance text-[1.5rem] leading-snug text-ink/90 sm:text-[2.1rem]">
            Every forever begins
            <br className="hidden sm:block" /> as a possibility.
          </p>
          <span className="mt-10 block text-[0.62rem] uppercase tracking-[0.32em] text-muted">
            Scroll
          </span>
        </motion.div>
      </div>
    </section>
  );
}
