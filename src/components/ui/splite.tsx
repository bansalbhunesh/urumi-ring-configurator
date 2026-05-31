"use client";

import dynamic from "next/dynamic";

/* @splinetool/react-spline mounts a live WebGL <canvas> that needs `window` and
   a real GPU context. Like the global ring canvas (see three/GlobalCanvas.tsx),
   we load it with next/dynamic({ ssr: false }) so it never renders on the server.
   The component the task shipped used React.lazy() + Suspense — but in this
   version of Next a lazy Client Component is still *prerendered* on the server
   (see node_modules/next/dist/docs/01-app/02-guides/lazy-loading.md), which would
   trip the exact hydration crash this codebase already guards against. */
const Spline = dynamic(() => import("@splinetool/react-spline"), {
  ssr: false,
  loading: () => <SplineLoader />,
});

interface SplineSceneProps {
  scene: string;
  className?: string;
}

export function SplineScene({ scene, className }: SplineSceneProps) {
  return <Spline scene={scene} className={className} />;
}

/* A restrained, on-brand stand-in while the scene chunk + .splinecode load —
   a single thin gold ring, in the spirit of the design system's loaders. */
function SplineLoader() {
  return (
    <div className="flex h-full w-full items-center justify-center">
      <span
        aria-hidden
        className="block h-8 w-8 animate-spin rounded-full border border-line border-t-gold-bright"
      />
      <span className="sr-only">Loading the 3D scene…</span>
    </div>
  );
}
