"use client";

import { Suspense, useEffect, useRef, useState } from "react";
import { Canvas } from "@react-three/fiber";
import { Environment, Lightformer, ContactShadows, OrbitControls } from "@react-three/drei";
import { motion, useReducedMotion } from "framer-motion";
import { SplitText } from "@/components/ui/SplitText";
import { useConfigurator } from "@/store/configurator";
import { METAL_BY_ID } from "@/lib/config";
import { RingModel } from "@/components/three/RingModel";

/* Full-bleed photoreal beat. The real (Tripo-generated) ring fills the frame —
   drag to inspect, tinted live to the chosen metal. Copy is overlaid in top &
   bottom bands over soft scrims so it stays legible. Lazy-mounted on scroll so
   the model never blocks first paint. data-ring="hidden" keeps the configurator
   ring out of the way here. */
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
      {/* Full-bleed 3D */}
      <div className="absolute inset-0">
        {show && (
          <Canvas
            dpr={[1, 2]}
            camera={{ position: [0, 0.05, 5.2], fov: 35 }}
            gl={{ antialias: true }}
          >
            <ambientLight intensity={0.3} />
            <Environment resolution={256} environmentIntensity={0.9}>
              {/* Neutral key + restrained warmth + a cool rim — same studio
                 discipline as the configurator so the metal reads precious. */}
              <Lightformer form="rect" intensity={5.5} color="#ffffff" scale={[1.4, 9, 1]} position={[4.5, 1, 3]} rotation={[0, -0.6, 0]} />
              <Lightformer form="rect" intensity={3.2} color="#fdf3e6" scale={[10, 8, 1]} position={[-3, 4, 4]} rotation={[-0.3, 0.2, 0]} />
              <Lightformer form="ring" intensity={3} color="#cfe0ff" scale={[4, 4, 1]} position={[-4, 1, -5]} />
              <Lightformer form="rect" intensity={1.6} color="#e9d3b0" scale={[6, 3, 1]} position={[3, -3, 2]} rotation={[0.4, -0.3, 0]} />
              <Lightformer form="rect" intensity={0.6} color="#241d16" scale={[30, 30, 1]} position={[0, 0, -8]} />
            </Environment>
            <Suspense fallback={null}>
              <RingModel metalId={metal} />
            </Suspense>
            <ContactShadows position={[0, -1.5, 0]} opacity={0.5} scale={7} blur={3} far={5} color="#1a130b" />
            <OrbitControls autoRotate={!reduced} autoRotateSpeed={1.0} enableZoom={false} enablePan={false} minPolarAngle={Math.PI / 3} maxPolarAngle={Math.PI / 1.7} />
          </Canvas>
        )}
      </div>

      {/* Scrims so overlaid copy stays legible — kept light so the metal isn't
         dulled; legibility comes from the top/bottom bands, not a heavy wash. */}
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-black/55 via-transparent to-black/65" />

      {/* Overlaid copy — top & bottom bands keep the centre clear for the ring */}
      <div className="pointer-events-none relative z-10 flex min-h-[100svh] flex-col justify-between px-6 py-20 text-center sm:px-10">
        <motion.div
          initial={{ opacity: 0, y: 18 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-10%" }}
          transition={{ duration: 1, ease: [0.22, 1, 0.36, 1] }}
        >
          <span className="eyebrow">The render</span>
          <SplitText as="h2" className="display-2 mt-4 justify-center text-balance text-ink">
            The real thing.
          </SplitText>
        </motion.div>

        <div className="mx-auto max-w-lg">
          <p className="text-[1rem] leading-relaxed text-ink-soft">
            A photoreal capture of the finished piece — drag to turn it in your
            hand. The metal follows your choice.
          </p>
          <p className="mt-3 text-[0.7rem] uppercase tracking-[0.24em] text-muted">
            Drag to inspect · Now showing {METAL_BY_ID[metal].label}
          </p>
        </div>
      </div>
    </section>
  );
}
