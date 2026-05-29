"use client";

import dynamic from "next/dynamic";

const RingCanvas = dynamic(() => import("@/components/three/RingCanvas"), {
  ssr: false,
  loading: () => <CanvasSkeleton />,
});

export function CanvasSkeleton() {
  return (
    <div className="flex h-full w-full items-center justify-center">
      <div className="relative">
        <div className="shimmer h-44 w-44 rounded-full opacity-70" />
        <div className="absolute inset-0 m-auto h-3 w-3 rounded-full bg-gold/40" />
      </div>
    </div>
  );
}

export function CanvasMount() {
  return <RingCanvas />;
}
