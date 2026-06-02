# Running & verifying the configurator

All commands run from the repo root.

## 1. Run locally (mock mode — no backend needed)

```bash
npm install        # first time only
npm run dev        # → http://localhost:3000
```

`WOOCOMMERCE_ENABLED` defaults to `false`, so every API route serves the seeded
mock — the full configurator and cart work with no backend. If port 3000 is busy,
Next.js auto-picks the next free port and prints the URL.

To free a port manually (Windows):

```powershell
netstat -ano | findstr ":3000"
taskkill /PID <pid> /F
```

## 2. Real-GPU bloom / exposure pass (needs a real GPU)

The HDR bloom curve can only be judged on real hardware — software/headless WebGL
(SwiftShader) does not reproduce it. On a machine with a GPU:

```bash
npm run build      # production build: real bloom curve, no dev overhead
npm start          # → http://localhost:3000
```

Then, in a normal Chrome window, scroll the whole page and check:

- **Hero / Studio ring** — only the diamond's hottest sparkle should glow; the gold
  metal must **never bloom orange** (bloom threshold is 0.98).
- Cycle all 3 metals × 3 stones — confirm no blown-out highlights on any combo.
- `Worn` hand crossfade, `Mission` water-ring, `Provenance` / `pairing` plates —
  confirm warmth and contrast read well on a real panel.
- **Reduced motion**: enable it at the OS level (Windows: Settings → Accessibility →
  Visual effects → Animation effects → Off), reload, and confirm 3D idle, bloom,
  Lenis smooth-scroll, and parallax all quiet down.

## 3. Lighthouse — performance (real browser, not headless)

Headless / software-GL produces a meaningless performance number for a 3D-canvas
page. Run it in a real browser:

1. `npm run build && npm start`
2. Open `http://localhost:3000` in a fresh Chrome **incognito** window (no extensions).
3. **DevTools (F12) → Lighthouse → Mode: Navigation → Device: Desktop → Analyze.**
   - Using DevTools' built-in Lighthouse avoids the Windows `chrome-launcher`
     temp-cleanup error that the standalone CLI can hit.
   - Watch **LCP, CLS, TBT**.

Accessibility, Best-Practices, and SEO are already verified at **100** (localhost,
`npx lighthouse --only-categories=accessibility,seo,best-practices`).

## 4. Automated checks (CI parity)

```bash
npm run lint
npx tsc --noEmit
node tests/e2e.smoke.cjs http://localhost:3000   # server must be running; expects 43/43
```

## 5. Full stack with live WooCommerce (optional)

```bash
docker compose up   # MariaDB → WordPress + WooCommerce → seeder → Next.js
```

First boot takes ~90s while WordPress installs and the product seeds. The UI labels
itself "Live Store" vs "Demo" so it is always clear which mode is active.

## Notes

- `npm start` requires a prior `npm run build`.
- The seeded mock and the live store derive prices from the same `src/lib/config.ts`,
  so they agree to the dollar.
