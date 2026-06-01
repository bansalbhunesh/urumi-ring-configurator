"use client";

import { useRef } from "react";
import { motion, useScroll, useTransform, useReducedMotion } from "framer-motion";
import { BlurReveal } from "@/components/ui/animations/BlurReveal";

/* ============================================================
   MirrorRoom — CSS infinite mirror tunnel.

   Six nested frames, each scaled down and more transparent,
   creating a hall-of-mirrors illusion around the ring shape.

   A pulsing inner glow + slow rotation makes it feel alive.
   Scroll drives the zoom / rotation.
   ============================================================ */

const MIRRORS = 7;
const EASE = [0.22, 1, 0.36, 1] as const;

export function MirrorRoom() {
  const ref = useRef<HTMLDivElement>(null);
  const reduceMotion = useReducedMotion() ?? false;

  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "end start"] });
  const zoom   = useTransform(scrollYProgress, [0.1, 0.8], [0.82, 1.08]);
  const rotate = useTransform(scrollYProgress, [0.0, 1.0], [-12, 12]);
  const glow   = useTransform(scrollYProgress, [0.2, 0.6], [0.15, 0.55]);

  return (
    <section
      ref={ref}
      data-ring="hidden"
      className="relative min-h-[120svh] overflow-hidden bg-black"
    >
      <div className="sticky top-0 flex h-[100svh] flex-col items-center justify-center">
        {/* Mirror tunnel */}
        <motion.div
          style={{
            scale: reduceMotion ? 1 : zoom,
            rotate: reduceMotion ? 0 : rotate,
          }}
          className="relative flex items-center justify-center"
          transition={{ type: "spring", stiffness: 60, damping: 18 }}
        >
          {Array.from({ length: MIRRORS }).map((_, i) => {
            const depth = (i + 1) / MIRRORS;
            const scale = 1 - depth * 0.11;
            const opacity = 0.92 - depth * 0.1;
            const blur = depth * 0.5;
            return (
              <div
                key={i}
                className="absolute inset-0 rounded-[2px]"
                style={{
                  transform: `scale(${scale})`,
                  border: `${1.2 - depth * 0.1}px solid rgba(200,165,107,${0.55 - depth * 0.06})`,
                  opacity,
                  filter: `blur(${blur}px)`,
                  boxShadow: `inset 0 0 ${30 + i * 12}px rgba(200,165,107,${0.04 + i * 0.005}), 0 0 ${20 + i * 10}px rgba(200,165,107,${0.03 + i * 0.004})`,
                  width: `${560 - i * 32}px`,
                  height: `${560 - i * 32}px`,
                }}
              />
            );
          })}

          {/* Central diamond / ring silhouette */}
          <motion.div
            className="relative z-10 flex items-center justify-center"
            animate={reduceMotion ? {} : { rotate: [0, 360] }}
            transition={{ duration: 36, repeat: Infinity, ease: "linear" }}
          >
            <svg viewBox="0 0 120 120" width={120} height={120} fill="none">
              {/* Outer ring */}
              <circle cx="60" cy="60" r="50" stroke="#c8a56b" strokeWidth="2" strokeOpacity="0.8" />
              <circle cx="60" cy="60" r="36" stroke="#c8a56b" strokeWidth="1" strokeOpacity="0.4" />
              {/* Brilliant facets */}
              {[0,30,60,90,120,150,180,210,240,270,300,330].map((deg) => {
                const rad = (deg * Math.PI) / 180;
                const x2 = 60 + 50 * Math.cos(rad);
                const y2 = 60 + 50 * Math.sin(rad);
                return (
                  <line key={deg} x1="60" y1="60" x2={x2} y2={y2}
                    stroke="#c8a56b" strokeWidth="0.6" strokeOpacity="0.25" />
                );
              })}
              {/* Girdle sparkles */}
              {[0,45,90,135,180,225,270,315].map((deg) => {
                const rad = (deg * Math.PI) / 180;
                const x = 60 + 50 * Math.cos(rad);
                const y = 60 + 50 * Math.sin(rad);
                return <circle key={deg} cx={x} cy={y} r="2.5" fill="#e2c06e" />;
              })}
              <circle cx="60" cy="60" r="8" fill="#fff8f0" fillOpacity="0.9" />
            </svg>
          </motion.div>

          {/* Ambient glow that pulses */}
          <motion.div
            className="pointer-events-none absolute inset-0 rounded-[2px]"
            animate={reduceMotion ? {} : { opacity: [0.15, 0.45, 0.15] }}
            transition={{ duration: 3.5, repeat: Infinity, ease: "easeInOut" }}
            style={{
              background:
                "radial-gradient(ellipse 55% 55% at 50% 50%, rgba(200,165,107,0.18) 0%, transparent 70%)",
            }}
          />
        </motion.div>

        {/* Copy overlay */}
        <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-end pb-20">
          <BlurReveal delay={0.2} className="text-center">
            <span className="eyebrow text-gold/70">Refracted · Infinite</span>
            <h2 className="font-display mt-4 text-balance text-[2rem] leading-snug text-ink sm:text-[2.8rem]">
              One ring, infinite facets.
            </h2>
            <p className="mt-4 max-w-sm text-[0.95rem] leading-relaxed text-ink-soft">
              Light doesn&apos;t stop at the surface. Neither should wonder.
            </p>
          </BlurReveal>
        </div>
      </div>
    </section>
  );
}
