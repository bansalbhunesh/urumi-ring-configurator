# Aurelle — Luxury FX Design System & Roadmap

Moodboard analysis (20 tiles) → one unified visual language layered **around** the
ring. The ring stays the hero; effects enhance, never distract.

## Tile analysis (clustered into effect families)

**A. Holographic diffraction / iridescence** — tiles 1, 9, 17.
- Visual: rainbow thin-film sweeps, spectral streaks on band/floor.
- Lighting: a single key + spectral dispersion; dark stage.
- Material: thin-film/dispersive metal + diffraction grating on a floor.
- Motion: slow hue rotation, sweep follows pointer.
- Impl: GLSL thin-film fragment (hue from view·normal) on a backdrop plane;
  R3F floor mesh with a diffraction shader; postFX subtle chromatic offset.

**B. Liquid metal / chrome / mercury** — tiles 2, 10, 14, 18.
- Visual: molten gold and rippling chrome; mirror reflections.
- Lighting: high-contrast studio HDRI; bright streak highlights.
- Material: `metalness=1`, low roughness, strong envMap; ripple normal map.
- Motion: slow flowing normals, droplet ripples.
- Impl: R3F plane with animated noise-displaced normals + `MeshStandardMaterial`
  envMap; or a reflective floor (`MeshReflectorMaterial`) with ripple time uniform.

**C. Crystal glass panels** — tiles 3, 11, 19.
- Visual: stacked frosted/faceted glass framing the ring; soft refraction.
- Lighting: soft, diffuse, airy.
- Material: `MeshTransmissionMaterial` (thickness, roughness, ior~1.5).
- Motion: gentle parallax of panels on scroll/pointer.
- Impl: a few thin transmission slabs behind/around the ring, parallaxed.

**D. Luxury spotlight reveal** — tiles 8, 16.
- Visual: one dramatic spotlight, deep falloff, product emerges from black.
- Lighting: single spot, sharp penumbra, volumetric cone.
- Material: matte stage + glossy ring.
- Motion: light sweeps in on load/scroll ("reveal").
- Impl: R3F `spotLight` + `@react-three/drei` volumetric (or a radial CSS scrim);
  Framer scroll-driven intensity ramp.

**E. Silk-like golden light trails** — tiles 7, 12, 15, 20.
- Visual: warm ribbons/smoke of light curling around the product.
- Lighting: additive warm glow + bloom.
- Material: emissive translucent ribbons.
- Motion: flowing curl-noise ribbons; bloom breathing.
- Impl: GPU points / instanced ribbons along curl-noise paths, additive blending,
  `@react-three/postprocessing` Bloom (already present); or SVG/CSS gradient trails.

**F. Diamond caustics** — tiles 9, 17.
- Visual: refracted light patterns cast around/under the stone.
- Lighting: key light through the gem → caustic projection.
- Material: high-IOR transmission gem.
- Motion: caustics shimmer as the ring rotates.
- Impl: `drei` `<Caustics>` under the gem (perf-gated to desktop), or a baked
  caustic texture on the floor modulated by rotation.

**G. Subtle particle systems / cosmic depth** — tiles 5, 13.
- Visual: fine gold dust / bokeh, deep parallax field.
- Lighting: dim ambient + sparkle.
- Material: additive points, soft sprites.
- Motion: slow drift + parallax.
- Impl: GPU `points` (a few hundred), additive, depthWrite off, seeded.

**H. Golden geometric frame / energy halo** — tiles 4, 6, 12.
- Visual: gold wire polygons / a glowing halo ring behind the product.
- Impl: line geometry / a torus with emissive + bloom; gentle rotation.

## Unified visual language (the synthesis)
- **Stage:** deep warm-charcoal, vignetted, with ONE spotlight reveal (D) + a faint
  iridescent backdrop (A) — depth without noise.
- **Floor:** subtle liquid-metal reflection (B) catching a **diamond caustic** (F).
- **Around the ring:** sparse **golden silk trails** (E) + **gold-dust particles** (G),
  additive + bloom — always behind/below, never crossing the stone.
- **Accent moments:** crystal-glass parallax panels (C) in one editorial beat; a
  golden halo (H) in the finale.
- **Palette/material:** champagne gold + spectral hints on near-black; metal stays
  `metalness 1`; gem high-IOR transmission. Bloom + vignette already in the pipeline.
- **Motion law:** everything damped, slow, reactive to pointer/scroll; reduced-motion
  disables trails/particles/caustics. Effects fade when the cart/section needs focus.

## Implementation roadmap (Impact ÷ Effort, highest first)
Maps onto: `three/Scene.tsx` (stage + lighting + backdrop FX), `three/TwistRing.tsx`
+ `Gem.tsx` (ring/diamond), `@react-three/postprocessing` (Bloom/Vignette already on),
`sections/Showcase.tsx` (photoreal beat).

1. **Spotlight reveal + iridescent backdrop (A+D)** — biggest premium lift, cheapest:
   a dim iridescent gradient plane behind the product + a scroll-ramped spotlight.
   Desktop+mobile. *Start here.*
2. **Gold-dust particles + silk trails (E+G)** — sparse GPU points + a few additive
   curl-noise ribbons behind the ring; bloom does the glow. Reduced-motion off.
3. **Diamond caustics (F)** — `drei <Caustics>` under the gem, desktop-only, perf-gated.
4. **Liquid-metal reflective floor (B)** — `MeshReflectorMaterial` with a ripple
   uniform; grounds the ring and adds realism.
5. **Crystal-glass parallax panels (C)** — one editorial section beat.
6. **Golden halo (H)** — finale accent.

### Performance guardrails
- All FX behind the existing `reduceMotion` + device-tier flags; pause with the
  canvas when hidden/cart-open; cap particle counts; caustics desktop-only;
  keep DPR tiered. The ring + diamond always render first; FX are additive layers
  that fade out if frame budget is tight.

### Status — implementation
Analysis + design system + roadmap: **done (this doc).**
All six roadmap effects shipped to `main`, each gated by tsc + lint and verified by
Playwright screenshot (software-WebGL, console-error-clean):

1. **Spotlight reveal + iridescent backdrop (A+D)** — `globals.css` `body::before`
   holographic spotlight + drift. ✅ `a55b404`
2. **Gold-dust particles (G)** — seeded additive points, `GoldDust`. ✅ `5c3b936`
   **Silk-like golden trails (E)** — additive tube ribbons, `SilkRibbons`. ✅ `a9389a6`
3. **Diamond caustics (F)** — procedural refracted-light floor pool, `CausticFloor`.
   ✅ `bb0ff8b`
4. **Liquid-metal reflective floor (B)** — `MeshReflectorMaterial`, `ReflectiveFloor`.
   ✅ `79121d8`
5. **Crystal-glass parallax panels (C)** — frosted CSS/Framer shards behind the
   centre-stone beat, `CrystalPanels`. ✅ (this commit)
6. **Golden halo (H)** — additive torus frame, `SilkHalo`. ✅ `c66d3b4`

All 3D FX are desktop-gated where they cost a render pass, disabled under
reduced-motion, and additive/behind the ring so the product stays the hero.
