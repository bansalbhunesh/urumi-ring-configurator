"use client";

import { Suspense, useEffect, useRef, useState } from "react";
import { Canvas } from "@react-three/fiber";
import {
  Environment,
  ContactShadows,
  OrbitControls,
} from "@react-three/drei";
import { motion, useReducedMotion } from "framer-motion";
import { SplitText } from "@/components/ui/SplitText";
import { useConfigurator } from "@/store/configurator";
import { METAL_BY_ID } from "@/lib/config";
import { RingModel } from "@/components/three/RingModel";

/* Full-bleed photoreal beat. The GLB ring fills the frame — drag to inspect,
   tinted live to the chosen metal. Lightformers simulate a jewelry photography
   studio: key + rim + fill. data-ring="hidden" keeps the global ring aside. */
export function Showcase() {
  const ref = useRef<HTMLDivElement>(null);
  const [show, setShow] = useState(false);
  const metal = useConfigurator((s) => s.metal);
  const reduced = useReducedMotion();

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
      { rootMargin: "500px" },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  return (
    <section
      id="showcase"
      data-ring="hidden"
      ref={ref}
      className="relative z-10 min-h-[100svh] overflow-hidden"
    >
      <div className="absolute inset-0">
        {show && (
          <Canvas
            dpr={[1, 2]}
            camera={{ position: [0, 0.05, 5.2], fov: 35 }}
            gl={{ antialias: true }}
          >
            <ambientLight intensity={0.08} />
            {/* Three-point jewelry studio — same discipline as the configurator scene */}
            <spotLight position={[-4.5, 7, 5]} angle={0.42} penumbra={1} intensity={3.8} color="#fff6ec" castShadow shadow-mapSize={[2048, 2048]} />
            <spotLight position={[5.5, 4, -4]} angle={0.55} penumbra={1} intensity={2.0} color="#c8d8ff" />
            <pointLight position={[0, 5, 1]} intensity={1.4} color="#fff4e8" />

            <Environment files="/hdri/studio.hdr" environmentIntensity={1.15} />
            <Suspense fallback={null}>
              <RingModel metalId={metal} />
            </Suspense>
            <ContactShadows
              position={[0, -1.5, 0]} opacity={0.55} scale={7}
              blur={2.5} far={5} color="#1a130b"
            />
            <OrbitControls
              autoRotate={!reduced}
              autoRotateSpeed={1.2}
              enableZoom={false}
              enablePan={false}
              minPolarAngle={Math.PI / 3}
              maxPolarAngle={Math.PI / 1.7}
            />
          </Canvas>
        )}
      </div>

      <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-black/55 via-transparent to-black/65" />

      <div className="pointer-events-none relative z-10 flex min-h-[100svh] flex-col justify-between px-6 py-20 text-center sm:px-10">
        <motion.div
          initial={{ opacity: 0, y: 18 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-10%" }}
          transition={{ duration: 1, ease: [0.22, 1, 0.36, 1] }}
        >
          <span className="eyebrow">Your creation</span>
          <SplitText as="h2" className="display-2 mt-4 justify-center text-balance text-ink">
            The real thing.
          </SplitText>
        </motion.div>

        <div className="mx-auto max-w-lg">
          <p className="text-[1rem] leading-relaxed text-ink-soft">
            Built from every choice you made — drag to turn it in your hand.
            No one else will create this exact ring.
          </p>
          <p className="mt-3 text-[0.7rem] uppercase tracking-[0.24em] text-muted">
            Drag to inspect · Now showing {METAL_BY_ID[metal].label}
          </p>
        </div>
      </div>
    </section>
  );
}
