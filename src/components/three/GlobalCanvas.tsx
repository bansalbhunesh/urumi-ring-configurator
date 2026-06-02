"use client";

import dynamic from "next/dynamic";
import { CanvasBoundary } from "./CanvasBoundary";

/* The WebGL scene is client-only (it needs a real canvas + window), so we load
   it with ssr:false. This keeps the server render clean and avoids the
   hydration crash that a server-rendered <Canvas> would cause. The
   CanvasBoundary ensures a lost/blocked GL context degrades gracefully instead
   of blanking the entire page. */
const Scene = dynamic(() => import("./Scene"), { ssr: false });

export function GlobalCanvas() {
  return (
    <CanvasBoundary>
      <Scene />
    </CanvasBoundary>
  );
}
