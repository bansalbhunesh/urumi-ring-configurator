"use client";

import { motion } from "framer-motion";
import { TwistRing } from "@/components/three/TwistRing";
import { Canvas } from "@react-three/fiber";
import { Environment, PerspectiveCamera } from "@react-three/drei";

export function Closing() {
  return (
    <section className="relative flex min-h-[100svh] flex-col items-center justify-center overflow-hidden bg-black px-6 text-center">
      <div className="absolute inset-0 pointer-events-none opacity-40">
        <Canvas gl={{ antialias: true, alpha: true }}>
          <PerspectiveCamera makeDefault position={[0, 0, 15]} fov={30} />
          <ambientLight intensity={0.5} />
          <Environment preset="city" />
          <group rotation={[0.4, 0, 0]}>
            <TwistRing mobile={false} />
          </group>
        </Canvas>
      </div>

      <div className="relative z-10 mx-auto max-w-2xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-20%" }}
          transition={{ duration: 1.5, ease: "easeOut" }}
          className="space-y-4"
        >
          <p className="font-display text-2xl sm:text-3xl leading-relaxed text-white">
            Somewhere, right now, someone is about to ask the most important
            question of their life.
          </p>
          <p className="font-display text-2xl sm:text-3xl text-gold">
            This is what they&apos;ll be holding.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 2, delay: 10 }}
          className="mt-24"
        >
          <a
            href="#ring"
            className="text-sm uppercase tracking-[0.3em] text-white/50 transition-colors hover:text-white"
          >
            Configure yours
          </a>
        </motion.div>
      </div>
    </section>
  );
}
