"use client";

import { useRef } from "react";
import { addUserDrag, setDragging } from "@/store/configurator";

/* Transparent pad over the ring stage. The WebGL canvas is pointer-events:none
   (so the page scrolls), so this HTML layer captures the drag and feeds yaw/pitch
   to the scene director — smooth cursor/touch rotation without blocking scroll. */
export function RingDragPad({ className }: { className?: string }) {
  const last = useRef<{ x: number; y: number } | null>(null);

  return (
    <div
      className={className}
      style={{ touchAction: "pan-y", cursor: "grab" }}
      role="slider"
      aria-label="Drag to rotate the ring"
      aria-valuetext="Rotatable 3D ring"
      tabIndex={0}
      onPointerDown={(e) => {
        last.current = { x: e.clientX, y: e.clientY };
        setDragging(true);
        (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
        (e.currentTarget as HTMLElement).style.cursor = "grabbing";
      }}
      onPointerMove={(e) => {
        if (!last.current) return;
        addUserDrag((e.clientX - last.current.x) * 0.008, (e.clientY - last.current.y) * 0.005);
        last.current = { x: e.clientX, y: e.clientY };
      }}
      onPointerUp={(e) => {
        last.current = null;
        setDragging(false);
        (e.currentTarget as HTMLElement).style.cursor = "grab";
      }}
      onPointerCancel={(e) => {
        last.current = null;
        setDragging(false);
        (e.currentTarget as HTMLElement).style.cursor = "grab";
      }}
      onKeyDown={(e) => {
        if (e.key === "ArrowLeft") addUserDrag(-0.35, 0);
        if (e.key === "ArrowRight") addUserDrag(0.35, 0);
      }}
    />
  );
}
