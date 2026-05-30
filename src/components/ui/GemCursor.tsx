"use client";

import { useEffect, useRef, useCallback, useState } from "react";

/* ---------------------------------------------------------------------------
   GemCursor — a luxury diamond cursor for the Aurelle configurator.

   Replaces the browser default with a slowly rotating gold rhombus and a
   delicate trailing dot.  Hidden on touch devices; GPU-accelerated; click
   pulses the gem to 0.7× scale for tactile feedback.
--------------------------------------------------------------------------- */

const lerp = (a: number, b: number, t: number) => a + (b - a) * t;

function isTouchDevice() {
  if (typeof window === "undefined") return true;
  return (
    "ontouchstart" in window ||
    window.matchMedia("(pointer: coarse)").matches
  );
}

const SIZE = 14;
const TRAIL_SIZE = 4;
const TRAIL_LERP = 0.12;

export function GemCursor() {
  const gemRef = useRef<HTMLDivElement>(null);
  const dotRef = useRef<HTMLDivElement>(null);
  const mouse = useRef({ x: -100, y: -100 });
  const trail = useRef({ x: -100, y: -100 });
  const [pressed, setPressed] = useState(false);
  const [visible, setVisible] = useState(false);

  const onMove = useCallback((e: MouseEvent) => {
    mouse.current.x = e.clientX;
    mouse.current.y = e.clientY;
  }, []);

  const onDown = useCallback(() => setPressed(true), []);
  const onUp = useCallback(() => setPressed(false), []);

  useEffect(() => {
    if (isTouchDevice()) return;
    const showFrame = window.requestAnimationFrame(() => setVisible(true));

    document.documentElement.style.cursor = "none";

    window.addEventListener("mousemove", onMove);
    window.addEventListener("mousedown", onDown);
    window.addEventListener("mouseup", onUp);

    let rafId: number;

    const tick = () => {
      const { x, y } = mouse.current;

      if (gemRef.current) {
        gemRef.current.style.transform =
          `translate3d(${x - SIZE / 2}px, ${y - SIZE / 2}px, 0)`;
      }

      trail.current.x = lerp(trail.current.x, x, TRAIL_LERP);
      trail.current.y = lerp(trail.current.y, y, TRAIL_LERP);

      if (dotRef.current) {
        dotRef.current.style.transform =
          `translate3d(${trail.current.x - TRAIL_SIZE / 2}px, ${trail.current.y - TRAIL_SIZE / 2}px, 0)`;
      }

      rafId = requestAnimationFrame(tick);
    };

    rafId = requestAnimationFrame(tick);

    return () => {
      window.cancelAnimationFrame(showFrame);
      cancelAnimationFrame(rafId);
      document.documentElement.style.cursor = "";
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("mousedown", onDown);
      window.removeEventListener("mouseup", onUp);
    };
  }, [onMove, onDown, onUp]);

  if (!visible) return null;

  return (
    <>
      {/* ── Diamond gem ──────────────────────────────────────────────── */}
      <div
        ref={gemRef}
        aria-hidden
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          width: SIZE,
          height: SIZE,
          pointerEvents: "none",
          zIndex: 9999,
          willChange: "transform",
          transition: "scale 0.18s cubic-bezier(0.22,1,0.36,1)",
          scale: pressed ? 0.7 : 1,
          filter: "drop-shadow(0 0 3px rgba(201,168,106,0.55))",
        }}
      >
        <svg
          viewBox="0 0 14 14"
          fill="currentColor"
          style={{
            width: "100%",
            height: "100%",
            color: "#c9a86a",
            animation: "gem-cursor-spin 6s linear infinite",
          }}
        >
          <path d="M7 0 L14 7 L7 14 L0 7 Z" />
        </svg>
      </div>

      {/* ── Trailing dot ─────────────────────────────────────────────── */}
      <div
        ref={dotRef}
        aria-hidden
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          width: TRAIL_SIZE,
          height: TRAIL_SIZE,
          borderRadius: "50%",
          backgroundColor: "#c9a86a",
          opacity: 0.38,
          pointerEvents: "none",
          zIndex: 9998,
          willChange: "transform",
        }}
      />
    </>
  );
}
