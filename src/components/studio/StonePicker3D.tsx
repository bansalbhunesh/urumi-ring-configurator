"use client";

import { useEffect, useMemo, useRef, useSyncExternalStore, type RefObject } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { View } from "@react-three/drei";
import * as THREE from "three";
import { STONES, STONE_PREMIUM } from "@/lib/config";
import { gemGeometryFor, STONE_SCALE } from "@/components/three/gemGeometry";
import { StoneGlyph } from "./StoneGlyph";
import type { StoneId } from "@/lib/types";

/* ----------------------------------------------------------------------------
   3D stone picker — the brief's bonus, done with the SAME faceted geometry and
   material as the centre stone on the ring, so the choice always matches what
   you see. Ten live gems are composited by a single WebGL context via drei
   <View> (one canvas, ten scissored viewports) for performance. The flat
   StoneGlyph remains as the guaranteed fallback on mobile / reduced-motion /
   no-WebGL, so the picker is never empty.
---------------------------------------------------------------------------- */

/* Render 3D gems only where it pays off: desktop, motion allowed. Read via
   useSyncExternalStore so SSR (and hydration) start from the flat glyph and
   upgrade after mount without a mismatch. */
function use3DEnabled() {
  return useSyncExternalStore(
    (onChange) => {
      const a = window.matchMedia("(min-width: 1024px)");
      const b = window.matchMedia("(prefers-reduced-motion: reduce)");
      a.addEventListener("change", onChange);
      b.addEventListener("change", onChange);
      return () => {
        a.removeEventListener("change", onChange);
        b.removeEventListener("change", onChange);
      };
    },
    () =>
      window.matchMedia("(min-width: 1024px)").matches &&
      !window.matchMedia("(prefers-reduced-motion: reduce)").matches,
    () => false,
  );
}

function ThumbGem({ stone, selected }: { stone: StoneId; selected: boolean }) {
  const group = useRef<THREE.Group>(null);
  const geometry = useMemo(() => gemGeometryFor(stone), [stone]);
  useEffect(() => () => geometry.dispose(), [geometry]);
  const [sx, sy, sz] = STONE_SCALE[stone];
  const base = selected ? 6.0 : 5.3;

  useFrame((_, dt) => {
    if (group.current) group.current.rotation.y += dt * 0.6;
  });

  return (
    <>
      <ambientLight intensity={0.55} />
      <directionalLight position={[2, 3, 4]} intensity={3.4} />
      <directionalLight position={[-3, 1, -1]} intensity={1.5} color="#cfe0ff" />
      <pointLight position={[0, 0.5, 3]} intensity={2.2} color="#fff0d8" />
      <group ref={group} rotation={[0.5, 0, 0]} scale={[base * sx, base * sy, base * sz]}>
        <mesh geometry={geometry}>
          {/* Tuned to read as a bright faceted gem without an IBL env map (the
              picker has no Environment), so it sparkles under the directionals
              alone — flat facets + iridescence + an emissive floor. */}
          <meshPhysicalMaterial
            color="#eef4ff"
            metalness={0.15}
            roughness={0.04}
            transmission={0}
            ior={2.4}
            reflectivity={1}
            clearcoat={1}
            clearcoatRoughness={0}
            iridescence={0.7}
            iridescenceIOR={1.5}
            specularIntensity={1.8}
            specularColor="#ffffff"
            emissive={selected ? "#ffcf9a" : "#cfe0ff"}
            emissiveIntensity={selected ? 0.5 : 0.36}
            flatShading
          />
        </mesh>
      </group>
    </>
  );
}

export function StonePicker3D({
  stone,
  onSelect,
}: {
  stone: StoneId;
  onSelect: (s: StoneId) => void;
}) {
  const container = useRef<HTMLDivElement>(null);
  const enable3D = use3DEnabled();

  return (
    <div className="pp-stones" ref={container}>
      {STONES.map((item) => {
        const selected = item.id === stone;
        return (
          <button
            key={item.id}
            type="button"
            className="pp-stone"
            data-selected={selected ? "true" : "false"}
            aria-pressed={selected}
            aria-label={`${item.label} cut${STONE_PREMIUM[item.id] ? `, +$${STONE_PREMIUM[item.id]}` : ""}`}
            onClick={() => onSelect(item.id)}
          >
            <span className="pp-stone__gem">
              {/* Glyph is always present as the guaranteed fallback; on capable
                  devices the live 3D gem renders over it. */}
              <StoneGlyph stone={item.id} selected={selected} />
              {enable3D && (
                <View className="pp-stone__gem3d">
                  <ThumbGem stone={item.id} selected={selected} />
                </View>
              )}
            </span>
            <span className="pp-stone__name">{item.label}</span>
          </button>
        );
      })}

      {enable3D && (
        <Canvas
          className="pp-stones__canvas"
          eventSource={container as RefObject<HTMLElement>}
          camera={{ position: [0, 0, 3.2], fov: 28 }}
          gl={{ antialias: true, alpha: true, powerPreference: "high-performance" }}
          dpr={[1, 2]}
          style={{ position: "fixed", inset: 0, pointerEvents: "none", zIndex: 30 }}
          onCreated={({ gl }) => gl.setClearAlpha(0)}
        >
          <View.Port />
        </Canvas>
      )}
    </div>
  );
}
