"use client";

import { Suspense, useEffect, useRef, useState } from "react";
import { Canvas } from "@react-three/fiber";
import { Environment, Lightformer, ContactShadows, OrbitControls } from "@react-three/drei";
import { Reveal } from "@/components/ui/Reveal";
import { SplitText } from "@/components/ui/SplitText";
import { useConfigurator } from "@/store/configurator";
import { METAL_BY_ID } from "@/lib/config";
import { RingModel } from "@/components/three/RingModel";

/* The photoreal beat. A real (Tripo-generated) ring model in its own canvas —
   drag to inspect, tinted live to the chosen metal. Lazy-mounted on scroll so
   the heavy model never blocks first paint. data-ring="hidden" keeps the main
   configurator ring out of the way here. */
export function Showcase() {
  const ref = useRef<HTMLDivElement>(null);
  const [show, setShow] = useState(false);
  const metal = useConfigurator((s) => s.metal);

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
      { rootMargin: "400px" },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  return (
    <section
      id="showcase"
      data-ring="hidden"
      className="relative z-10 px-6 py-28 sm:px-10 lg:py-40"
    >
      <div className="mx-auto grid max-w-6xl items-center gap-10 lg:grid-cols-2 lg:gap-16">
        <div>
          <span className="eyebrow">The render</span>
          <SplitText as="h2" className="display-2 mt-5 text-balance text-ink">
            The real thing.
          </SplitText>
          <Reveal delay={0.15}>
            <p className="mt-6 max-w-md text-[1.05rem] leading-relaxed text-ink-soft">
              A photoreal capture of the finished piece — drag to turn it in your
              hand. The metal follows your choice; the configurator on the left is
              where you shape every detail.
            </p>
            <p className="mt-3 text-[0.78rem] uppercase tracking-[0.16em] text-muted">
              Now showing · {METAL_BY_ID[metal].label}
            </p>
          </Reveal>
        </div>

        <div
          ref={ref}
          className="relative aspect-square w-full overflow-hidden rounded-3xl border border-line bg-champagne/30"
        >
          {show && (
            <Canvas
              dpr={[1, 2]}
              camera={{ position: [0, 0.1, 6], fov: 35 }}
              gl={{ antialias: true }}
            >
              <ambientLight intensity={0.4} />
              <Environment resolution={256} environmentIntensity={1.0}>
                <Lightformer form="rect" intensity={4.5} color="#fff6ea" scale={[10, 8, 1]} position={[-3, 4, 4]} rotation={[-0.3, 0.2, 0]} />
                <Lightformer form="rect" intensity={6} color="#ffffff" scale={[1.2, 9, 1]} position={[4.5, 1, 3]} rotation={[0, -0.6, 0]} />
                <Lightformer form="rect" intensity={2.2} color="#f3c98b" scale={[6, 3, 1]} position={[3, -3, 2]} rotation={[0.4, -0.3, 0]} />
                <Lightformer form="rect" intensity={0.7} color="#2a2018" scale={[30, 30, 1]} position={[0, 0, -8]} />
              </Environment>
              <Suspense fallback={null}>
                <RingModel metalId={metal} />
              </Suspense>
              <ContactShadows position={[0, -1.4, 0]} opacity={0.5} scale={6} blur={3} far={4.5} color="#1a130b" />
              <OrbitControls autoRotate autoRotateSpeed={1.1} enableZoom={false} enablePan={false} minPolarAngle={Math.PI / 3} maxPolarAngle={Math.PI / 1.7} />
            </Canvas>
          )}
          <span className="pointer-events-none absolute bottom-4 left-1/2 -translate-x-1/2 rounded-full border border-line/80 bg-porcelain/50 px-4 py-1.5 text-[0.6rem] uppercase tracking-[0.24em] text-ink-soft backdrop-blur-sm">
            Drag to inspect
          </span>
        </div>
      </div>
    </section>
  );
}
