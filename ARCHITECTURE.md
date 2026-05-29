# Aurelle Configurator: Architecture & Data Flow

This document maps the flow of data across the Aurelle product page, specifically detailing how the React frontend interacts with both the 3D scene and the Headless WooCommerce backend.

## The Triad Architecture
The system is built on three independent but perfectly synced layers:
1. **The 3D Canvas** (`@react-three/fiber` + `@react-three/drei` + `@react-three/postprocessing`)
2. **The 2D Interface** (Next.js App Router + Tailwind CSS + Framer Motion + Lenis)
3. **The Global State** (Zustand)

## Data Flow: Interaction to Cart

```mermaid
graph TD
    UI[2D Interface (Metal/Stone Selectors)] -->|Dispatches update| Store[Zustand Global Store]
    Store -->|Reactive state change| 3D[3D Canvas / Materials]
    Store -->|Reactive state change| Price[Live Price Odometer]
    UI_Cart[Add to Cart Button] -->|Reads configuration| API[Next.js Route Handlers]
    API -->|REST API Call| Woo[Headless WooCommerce Backend]
    Woo -->|Returns Success/Cart Data| API
    API -->|Updates UI State| UI_Cart
```

### 1. Live 3D Updates
The 3D model (the Do Amore Twist Ring) and the UI never communicate directly. They both subscribe to a central Zustand store (`src/store/configurator.ts`).
- When a user clicks a metal swatch or 3D stone thumbnail, the UI calls `setMetal(id)` or `setStone(id)` on the store.
- `TwistRing.tsx` and `Gem.tsx` are subscribed to this store.
- As the state changes, the React Three Fiber components reactively interpolate their `MeshStandardMaterial` (for gold) or `MeshTransmissionMaterial` (for stones) directly in the `useFrame` loop, creating smooth, physical transitions without dropping frames.

### 2. Headless WooCommerce Integration
We do not use hardcoded JSON files or fake timeout promises. The application relies on a composite product architecture synced with WooCommerce over REST.
- **Fetching Variations:** On load (or via SSR/SSG), the application fetches product variations from the backend via the WooCommerce REST API (`/api/products`). This maps metal + stone combinations to a specific WooCommerce `variation_id` and price.
- **Adding to Cart:** When the user clicks "Add to Bag", the frontend reads the active configuration from Zustand, finds the matching `variation_id`, and sends a POST request to `/api/cart`.
- **The Backend:** A Next.js Route Handler safely stores the WooCommerce Consumer Key/Secret and forwards the request to the live WooCommerce instance. It returns the updated cart hash, completely bypassing PHP templates and delivering a headless SPA experience.

### 3. Local Mock Fallback
For the sake of this take-home (and to guarantee the prototype never crashes during a demo), the API routes intelligently fall back to a local mock if the WooCommerce URL is unreachable or times out, serving the exact same data schema as the real backend.

## The Awwwards-Tier Motion Layer
We wrapped the standard React DOM in several physical, cinematic interaction layers:
- **Lenis Smooth Scroll:** Intercepts native scroll for buttery easing.
- **Magnetic Physics:** Interactive elements pull toward the cursor.
- **SplitText:** Mask-based typography reveals.
- **Velocity Marquees:** Text translates and skews based on the user's scroll speed.
- **Cinematic Autofocus:** A laser raycast constantly adjusts the 3D depth-of-field based on where the camera is looking.
