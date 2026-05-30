"use client";

import dynamic from "next/dynamic";

/* The WebGL scene is client-only (it needs a real canvas + window), so we load
   it with ssr:false. This keeps the server render clean and avoids the
   hydration crash that a server-rendered <Canvas> would cause. */
const Scene = dynamic(() => import("./Scene"), { ssr: false });

export function GlobalCanvas() {
  return <Scene />;
}
