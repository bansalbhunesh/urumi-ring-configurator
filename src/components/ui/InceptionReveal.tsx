"use client";

/* ============================================================
   InceptionReveal — 7 animation universes in one primitive.

   Each "mode" is a completely different physics/motion reality,
   extracted from how different world-class sites handle reveals:

   rise    → luxury fashion editorial (Vogue, SSENSE) — fade-up
   clip    → SaaS precision (Linear, Vercel) — horizontal clip-path wipe
   flip    → Awwwards/Lusion — 3D rotateX fold-open from the floor
   burst   → Product-led (Framer, Productboard) — spring scale from 0
   drift   → Narrative (Stripe, Notion) — directional spring slide
   fall    → Cinematic (Active Theory, Unit9) — drop from above with rotate
   tunnel  → Apple/Samsung — zoom from microscopic to full size
   ============================================================ */

import { motion, useReducedMotion, type Variants } from "framer-motion";
import type { CSSProperties, ReactNode } from "react";

export type InceptionMode =
  | "rise"
  | "clip"
  | "flip"
  | "burst"
  | "drift"
  | "fall"
  | "tunnel";

const EX = [0.16, 1, 0.3, 1] as const;   // expo-out — snappy arrival
const CI = [0.22, 1, 0.36, 1] as const;  // cinematic ease

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function cfg(mode: InceptionMode, dir: "left" | "right"): any {
  const xIn = dir === "left" ? -64 : 64;
  switch (mode) {
    case "rise":
      return {
        hidden: { opacity: 0, y: 36 },
        show:   { opacity: 1, y: 0 },
        tr:     { duration: 0.88, ease: CI },
      };
    case "clip":
      return {
        hidden: { clipPath: dir === "left" ? "inset(0 100% 0 0)" : "inset(0 0 0 100%)" },
        show:   { clipPath: "inset(0 0% 0 0%)" },
        tr:     { duration: 1.1, ease: EX },
      };
    case "flip":
      return {
        hidden: { opacity: 0, rotateX: 38, y: 32 },
        show:   { opacity: 1, rotateX: 0, y: 0 },
        tr:     { duration: 0.9, ease: CI },
        wrap:   { perspective: "900px", transformOrigin: "50% 100%" },
      };
    case "burst":
      return {
        hidden: { opacity: 0, scale: 0.28 },
        show:   { opacity: 1, scale: 1 },
        tr:     { type: "spring" as const, stiffness: 270, damping: 22 },
      };
    case "drift":
      return {
        hidden: { opacity: 0, x: xIn },
        show:   { opacity: 1, x: 0 },
        tr:     { type: "spring" as const, stiffness: 190, damping: 24 },
      };
    case "fall":
      return {
        hidden: { opacity: 0, y: -60, rotate: -6, scale: 0.93 },
        show:   { opacity: 1, y: 0, rotate: 0, scale: 1 },
        tr:     { duration: 0.84, ease: CI },
      };
    case "tunnel":
      return {
        hidden: { opacity: 0, scale: 0.04 },
        show:   { opacity: 1, scale: 1 },
        tr:     { duration: 1.28, ease: EX },
      };
  }
}

/* ── Single element ── */
export function InceptionReveal({
  children,
  mode = "rise",
  delay = 0,
  dir = "left",
  className,
  once = true,
  margin = "-60px",
}: {
  children: ReactNode;
  mode?: InceptionMode;
  delay?: number;
  dir?: "left" | "right";
  className?: string;
  once?: boolean;
  margin?: string;
}) {
  const reduce = useReducedMotion() ?? false;
  if (reduce) return <div className={className}>{children}</div>;

  const c = cfg(mode, dir);
  return (
    <motion.div
      className={className}
      style={c.wrap}
      initial="hidden"
      whileInView="show"
      viewport={{ once, margin }}
      variants={{ hidden: c.hidden, show: c.show }}
      transition={{ ...c.tr, delay }}
    >
      {children}
    </motion.div>
  );
}

/* ── Stagger container — children stagger their entrance ── */
export function InceptionStagger({
  children,
  stagger = 0.1,
  delay = 0,
  className,
  margin = "-60px",
}: {
  children: ReactNode;
  stagger?: number;
  delay?: number;
  className?: string;
  margin?: string;
}) {
  return (
    <motion.div
      className={className}
      initial="hidden"
      whileInView="show"
      viewport={{ once: true, margin }}
      variants={{
        hidden: {},
        show: { transition: { staggerChildren: stagger, delayChildren: delay } },
      }}
    >
      {children}
    </motion.div>
  );
}

/* ── Item for use inside InceptionStagger ── */
export function InceptionItem({
  children,
  mode = "rise",
  dir = "left",
  className,
}: {
  children: ReactNode;
  mode?: InceptionMode;
  dir?: "left" | "right";
  className?: string;
}) {
  const reduce = useReducedMotion() ?? false;
  if (reduce) return <div className={className}>{children}</div>;

  const c = cfg(mode, dir);
  return (
    <motion.div
      className={className}
      style={c.wrap}
      variants={{ hidden: c.hidden, show: { ...c.show, transition: c.tr } }}
    >
      {children}
    </motion.div>
  );
}
