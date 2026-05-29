"use client";

/* ---------------------------------------------------------------------------
   Filmic Grain Overlay
   A microscopic, animated SVG noise overlay that ties the 3D and 2D
   elements together, removing the flat digital feel.
--------------------------------------------------------------------------- */

export function Grain() {
  return (
    <div className="pointer-events-none fixed inset-0 z-50 h-[100vh] w-[100vw] overflow-hidden opacity-[0.035] mix-blend-overlay">
      <svg
        id="grain-svg"
        viewBox="0 0 200 200"
        xmlns="http://www.w3.org/2000/svg"
        preserveAspectRatio="none"
        className="h-full w-full opacity-100"
        style={{
          filter: "url(#noiseFilter)",
        }}
      >
        <filter id="noiseFilter">
          <feTurbulence
            type="fractalNoise"
            baseFrequency="0.8"
            numOctaves="3"
            stitchTiles="stitch"
          />
        </filter>
        <rect width="100%" height="100%" filter="url(#noiseFilter)" />
      </svg>
      <style dangerouslySetInnerHTML={{ __html: `
        #grain-svg {
          animation: grain-dance 0.2s steps(2) infinite;
          transform-origin: center;
        }
        @keyframes grain-dance {
          0%, 100% { transform: translate(0, 0) scale(1.1); }
          50% { transform: translate(2%, 2%) scale(1.1); }
        }
      `}} />
    </div>
  );
}
