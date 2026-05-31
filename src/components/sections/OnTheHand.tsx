"use client";

import { useRef } from "react";
import { motion, useInView, useReducedMotion } from "framer-motion";
import { SplineScene } from "@/components/ui/splite";
import { Card } from "@/components/ui/card";
import { Spotlight } from "@/components/ui/spotlight";

/* ----------------------------------------------------------------------------
   "See it on the hand" — the interactive beat right after the configurator.

   This is the shipped Spline demo (SplineSceneBasic) reborn in the Aurelle
   system: pure-dark panel, champagne spotlight, the 3D scene beside a quiet
   headline. It declares data-ring="hidden" so the global live ring (see
   three/Scene.tsx) steps aside while the hand owns the frame — no two rings on
   screen at once.

   It is the *interactive* counterpart to Act VII (sections/HumanConnection.tsx),
   which stays the emotional, metal-aware line-art climax. To keep the live ring
   the hero of the page, the WebGL scene is only mounted while this section is
   near the viewport (useInView) — so it never opens a second GPU context during
   the hero/configurator first impression, and is released once you scroll past.

   ⚠️  REPLACE THE SCENE BELOW. The default is Spline's public sample so the
   section renders out of the box. Export your own hand-wearing-the-ring scene
   from Spline (Export → "Public URL" / .splinecode) and paste its URL here.
---------------------------------------------------------------------------- */

const HAND_SCENE =
  "https://prod.spline.design/kZDDjO5HuC9GJUM2/scene.splinecode";

const EASE = [0.22, 1, 0.36, 1] as const;

export function OnTheHand() {
  const reduceMotion = useReducedMotion();
  const stageRef = useRef<HTMLDivElement>(null);
  // Mount the heavy WebGL scene a little before it scrolls in, drop it once
  // it's well past — the global ring keeps the GPU to itself the rest of the time.
  const near = useInView(stageRef, { margin: "200px 0px 200px 0px" });
  const showScene = near && !reduceMotion;

  return (
    <section
      id="on-hand"
      data-ring="hidden"
      className="relative flex min-h-[100svh] items-center overflow-hidden px-6 py-24 sm:px-10 lg:px-16"
    >
      <div className="mx-auto w-full max-w-6xl">
        <Card className="relative overflow-hidden rounded-2xl border-line/60 bg-porcelain/30 shadow-lift backdrop-blur-sm">
          <Spotlight
            className="-top-40 left-0 md:-top-20 md:left-60"
            fill="#e7d6b0"
          />

          <div className="flex flex-col md:min-h-[30rem] md:flex-row">
            {/* Left — the words */}
            <div className="relative z-10 flex flex-1 flex-col justify-center p-8 sm:p-12 lg:p-14">
              <motion.span
                initial={{ opacity: 0, y: 8 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-15%" }}
                transition={{ duration: 0.7, ease: EASE }}
                className="eyebrow"
              >
                On the hand
              </motion.span>

              <motion.h2
                initial={{ opacity: 0, y: 14 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-15%" }}
                transition={{ duration: 0.9, delay: 0.08, ease: EASE }}
                className="display-3 mt-5 max-w-md text-balance text-ink"
              >
                Worn, not just configured.
              </motion.h2>

              <div className="o-dashline my-7 max-w-[14rem]" />

              <motion.p
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                viewport={{ once: true, margin: "-15%" }}
                transition={{ duration: 1, delay: 0.2, ease: EASE }}
                className="max-w-md text-[1.02rem] leading-relaxed text-ink-soft"
              >
                Turn it in the light. The Twist on a finger — real scale, real
                weight, the moment it stops being a configuration and becomes
                yours. Drag to look closer.
              </motion.p>
            </div>

            {/* Right — the 3D hand. Live only while near; a still glyph otherwise
               (and always, under prefers-reduced-motion). */}
            <div ref={stageRef} className="relative min-h-[22rem] flex-1 md:min-h-0">
              {showScene ? (
                <SplineScene scene={HAND_SCENE} className="h-full w-full" />
              ) : (
                <HandStill />
              )}
            </div>
          </div>
        </Card>
      </div>
    </section>
  );
}

/* The calm stand-in shown before the scene is near, and in place of it under
   prefers-reduced-motion: a static line-art ring-on-finger in the same
   gold-stroke language as the rest of the story (cf. HumanConnection.tsx). */
function HandStill() {
  return (
    <div className="flex h-full w-full items-center justify-center p-8">
      <svg viewBox="0 0 240 260" className="h-full max-h-72 w-auto" fill="none" aria-hidden>
        <path d="M104 250 C 98 150, 102 90, 112 42" stroke="#e3c585" strokeOpacity="0.7" strokeWidth="1.3" />
        <path d="M140 250 C 146 150, 140 90, 128 42" stroke="#e3c585" strokeOpacity="0.7" strokeWidth="1.3" />
        <path d="M112 42 C 116 28, 124 28, 128 42" stroke="#e3c585" strokeOpacity="0.7" strokeWidth="1.3" />
        <ellipse cx="120" cy="150" rx="26" ry="10" stroke="#c8a56b" strokeWidth="3" />
        <circle cx="120" cy="141" r="2.8" fill="#fff6e6" />
      </svg>
      <span className="sr-only">The Twist ring on a finger</span>
    </div>
  );
}
