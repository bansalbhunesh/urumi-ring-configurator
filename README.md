# Aurelle: Headless WooCommerce 3D Configurator

A prototype engagement ring product page built for the Urumi Forward Deployed Engineer take-home. It bridges the gap between real WooCommerce backend logic and God Tier physical 3D simulations.

## How to Run

**1. Standard Start (Demo Mode)**
```bash
npm install
npm run dev
```
By default, the `.env.local` sets `WOOCOMMERCE_ENABLED=false`. This hits our internal API routes, which bypass the live WooCommerce server and instantly return mocked composite product data. This guarantees a perfect live demo even if the backend is asleep.

**2. Live WooCommerce Mode**
If you have a live WooCommerce instance ready:
1. Copy `.env.example` to `.env.local`
2. Set `WOOCOMMERCE_ENABLED=true`
3. Set `WOOCOMMERCE_URL` to your backend URL.
4. Run `npm run dev`. The API routes will securely proxy to the WooCommerce REST API.

## Stack Choices
- **Framework:** Next.js (App Router) — Chosen for secure Server API routes (to hide WooCommerce credentials) and robust SSR.
- **3D Engine:** Three.js + `@react-three/fiber` + `@react-three/drei` — Chosen over Babylon because of the unparalleled React ecosystem (specifically R3F), allowing us to seamlessly sync Zustand state to 3D materials.
- **Styling:** Tailwind CSS + Vanilla CSS — For rapid, design-system-driven iterations.
- **Motion:** Framer Motion + Lenis — Lenis intercepts the native scroll for buttery-smooth physics, while Framer handles the cinematic split-text masks and magnetic buttons.

## The Stretch Goal (3D Picker)
**Accomplished.** We did not rely on 2D images or SVGs for the main configurator UI. The "Centre Stone" selector is comprised of live, miniature 3D `<Canvas>` elements (`StoneThumb.tsx`). 
- **The Design Call:** To keep performance buttery smooth, the thumbnails use a simplified `MeshPhysicalMaterial` and reduced lighting passes, saving the expensive volumetric calculations (Caustics/Postprocessing) strictly for the hero ring. 

## Non-Obvious Decisions
- **Mobile Graceful Degradation:** A core mandate was "premium feel". Caustics and Dynamic Depth of Field are incredibly beautiful but mathematically expensive. We wrote logic to strictly disable these post-processing passes on mobile devices, ensuring smaller batteries don't burn out and framerates stay locked at 60fps.
- **Procedural Audio:** Luxury is tactile. Instead of just changing colors, every interaction emits a crystalline procedural Web Audio ping or shimmer. 

## AI Collaboration
This project was built using an aggressive AI workflow as a force multiplier:
- **Architectural Scaffolding:** Used LLMs to draft the complex boilerplate for the Headless WooCommerce Next.js proxy routes in seconds.
- **Shader Math & Postprocessing:** Leveraged advanced reasoning models to calculate the raw math required for simulated Perlin noise ("Living Ring" breath) and the laser raycast targeting for the Cinematic Macro Autofocus.
- **Workflow:** Codebase analysis agents were used to quickly search and edit files across the Next.js directory, allowing for massive, project-wide refactors (like implementing global Smooth Scrolling and Magnetic UI) in a fraction of the time it would take manually.

## What I'd Build Next
1. **Dynamic Ring Sizing:** Implementing parametric shape morphing so the user can see the thickness of the band change in real-time as they select their ring size.
2. **Engraving:** Using a `CanvasTexture` mapped to the inside of the ring shank to allow live, 3D text engraving.
3. **Cart Checkout Flow:** Building out the full headless cart UI overlay to take the user completely through checkout without ever leaving the 3D experience.
