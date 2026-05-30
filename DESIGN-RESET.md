# Aurelle — Design Direction Reset

A complete reset, judged against real-GPU screenshots (not the swiftshader test
harness, which masked the failures). The verdict from those screenshots is blunt:

- **Hero:** the ring is a **blown-out orange glow blob**. Bloom + over-bright
  reflections + additive ribbons/halo/dust merge into a neon scribble. You cannot
  read it as precious metal. This is *textbook* "Three.js demo / random effects."
- **Showcase:** the photoreal ring renders **pale, plasticky, bone-coloured** —
  cheap, not gold. Heavy scrims dull it further.

Guiding test for every element: **does this increase the perceived value of the
ring?** If not, it goes. The previous direction failed this test — it added
spectacle *around* the ring at the cost of the ring itself. Luxury is restraint:
one hero, one light, deep quiet atmosphere. Bold ≠ cluttered.

## Brutal audit — issues ranked by impact

### TIER 0 — the ring doesn't look precious (fix first, everything depends on it)
1. Bloom blows the metal into an orange cloud (threshold 0.82 / intensity 0.55 too hot).
2. `envMapIntensity 1.9` over-brightens reflections → feeds the bloom.
3. `SilkRibbons` read as random orange scribbles around the ring — pure clutter.
4. `GoldDust` (240 pts) reads as scattered noise/stars across the whole frame.
5. `SilkHalo` torus draws a competing orange circle behind the ring.
6. Caustic floor is additive-bright and blooms instead of grounding.
7. Whole scene is mono-orange — white gold can't read as white; looks like brass.
8. Intro "materialise" edge emissive is hot orange (×2.2) → blooms on load.
9. Showcase GLB under-lit + over-scrimmed → plastic, not metal.
10. No single clear key light = no dramatic "hero" modelling on the metal.

### TIER 1 — background & atmosphere (must feel intentional, not noisy)
11. `body::before` conic-iridescent rainbow = random decoration, not atmosphere.
12. Background competes with the canvas instead of receding behind it.
13. No depth/vignette discipline — frame edges aren't darkened to focus centre.
14. Star/dust field gives "space scene," not "luxury studio."
15. No sense of a real room/stage the ring sits within.

### TIER 2 — typography & hierarchy
16. Hero headline strong, but eyebrow/sub-copy hierarchy is flat.
17. Body copy contrast/measure not tuned for calm reading.
18. Spec numbers and labels lack a clear typographic system (size/weight steps).
19. Letter-spacing on display type could tighten for a more couture feel.
20. Inconsistent vertical rhythm between sections.

### TIER 3 — layout, spacing, composition
21. Hero left column is dense; needs more breathing room / fewer simultaneous ideas.
22. Metal/stone selectors compete visually with the ring (placement + contrast).
23. Section paddings inconsistent; no strict spacing scale applied.
24. Price/CTA block lacks the "moment" weighting it deserves.
25. Showcase copy bands fight the product instead of framing it.

### TIER 4 — motion & interaction
26. Idle ring spin is constant/linear — feels mechanical, not alive.
27. Easing is generic in places; needs cinematic, spring-like timing.
28. Section reveals lack layered choreography (stagger, depth).
29. Metal/stone change should feel like a rewarding material event.
30. Scroll → camera transitions could be more deliberate and slower.

### TIER 5 — materials (beyond bloom)
31. Diamond dispersion/sparkle should be the *only* thing that truly blooms.
32. Metal roughness per finish needs tuning so polished vs matte reads true.
33. Contact shadow softness/όpacity needs grounding without muddiness.
34. Reflective floor should suggest a polished stage, very subtly.

## Reset design language (the synthesis)
- **One hero, one light.** A single dramatic key models the metal; a cool rim
  separates it from the dark; a dim warm fill keeps the shadow side from going black.
- **Deep, quiet atmosphere.** Near-black graded background, a soft central light
  pool, a firm vignette. No stars, no rainbows, no scribbles.
- **Material truth over glow.** Metal reads precious through accurate PBR +
  balanced studio reflections, not emissive bloom. Only the diamond sparkles hot.
- **Grounding, not spectacle.** A barely-there polished-floor reflection and a
  faint refracted-light pool under the stone — justified because they ground and
  flatter the ring. Everything else that merely decorates is removed.
- **Cinematic, restrained motion.** Slow, eased, intentional. Idle motion is a
  breath, not a spin. Changes feel like events.

## Roadmap (highest impact first)
- **Wave 1 — Reclaim the ring (Tier 0 + 11–14).** Tame bloom to a whisper; lower
  envMap; rebalance lighting to neutral-cool key + warm accent; **remove ribbons,
  halo, dust**; subdue caustic; replace rainbow backdrop with intentional dark
  atmosphere + vignette; cool the intro emissive. *Start here.*
- **Wave 2 — Showcase ring reads as metal.** Stronger key, contrast, lighter
  scrims, confirm metal tint; consider studio HDRI.
- **Wave 3 — Typography & hierarchy system.** Type scale, rhythm, measure, eyebrow.
- **Wave 4 — Layout & spacing discipline.** Spacing scale, hero breathing room,
  selector placement, CTA moment.
- **Wave 5 — Motion choreography.** Spring easing, layered reveals, material-change
  reward, slower camera.
- **Wave 6 — Material polish & final pass.** Per-finish roughness, diamond fire,
  shadow grounding; iterate against the reference feeling until no weak points.

### Verification note
The headless harness uses software WebGL and does **not** reproduce real-GPU HDR
bloom — so bloom/exposure choices here are made conservatively (safe on any GPU)
and the user's real-browser screenshots remain the ground truth to iterate against.
