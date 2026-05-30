# THE ETERNAL CIRCLE — narrative blueprint

Not a product page. A cinematic, scroll-driven story about the journey from
possibility to commitment. The product is not the story — **the transformation
is the story; the ring is the artifact left behind.** Each scroll should feel like
entering a new scene in a film: its own lighting, camera, motion, atmosphere,
emotion. The configurator's live powers (metal/stone switching, scroll-scrubbed
3D) are kept — but reframed as *moments of authorship inside the story*, never as
"shopping."

## The ten acts → our architecture

| Act | Beat | Home in code | State / how |
|----|------|--------------|-------------|
| **I — Before the ring** | Black. Particles of light appear, orbit, converge into the first facet. "Every forever begins as a possibility." | NEW `ActOne` intro section above `Studio`; GPU points that *converge* (not ambient) tied to scroll, resolving to the gem. | To build. Reuses a disciplined points system (purposeful, converging — the opposite of the removed ambient dust). |
| **II — Birth of light** | Camera inside the diamond; light splits, refracts, spectral color. "Beauty begins where light finds form." | `Gem` + a close dolly beat; dispersion via the transmission material's chromatic aberration ramped on scroll. | Partial: gem exists. Needs a camera-in beat + dispersion ramp. |
| **III — Birth of form** | Metal *grows* around the stone — strands twist, flow, merge. "Craftsmanship gives permanence to emotion." | `Craft` + the existing **materialise dissolve shader** in `TwistRing` (snoise threshold reveal). | **Already half-built** — drive `uProgress` from this section's scroll. |
| **IV — Materials of forever** | Three worlds — White (moonlight), Yellow (heritage), Rose (intimacy). Switching metal transforms the *environment*, not just the ring. | `Materials` + per-metal environment/lighting + body tint. | Achievable: map metal → env preset + background tint + copy. |
| **V — Personality of the stone** | Round (timeless), Oval (graceful), Princess (confident) — introduced as characters, not options. | `TheCut` — reframe spec card into character intros with motion. | Achievable: copy + motion reframe of existing section. |
| **VI — Hidden precision** | Ring turns transparent; blueprint lines, dimensions, measurements. "Luxury is precision." | `TechnicalSpecs` (exists, not yet on page) + a wireframe/blueprint material pass. | Achievable: add section to page; blueprint overlay. |
| **VII — Human connection** | Environment gone. A hand. The ring settles onto a finger. Real scale. "Designed for a moment that changes everything." | NEW `ActSeven`. | Hard: needs a hand asset (model or plate). Lowest-priority / may stylize. |
| **VIII — Weight of choice** | Ring separates into metal/stone/setting; each user decision becomes visible; price appears as a *story*, not a number. | Enhance `Studio` price → a justified breakdown beat. | Achievable: "this brilliance / this craftsmanship / this material" price story. |
| **IX — Your creation** | Everything converges into the final ring, built from every choice; environment reflects the chosen metal/stone. "No one else will create this exact ring." | `Showcase` (photoreal GLB) reframed as the culmination. | Achievable: copy + reflect chosen metal (already tints). |
| **X — Forever** | Camera pulls back. Quiet. UI fades. Only the ring, the final price, the decision. "Some choices last forever." Add to Cart → ownership begins. | `Closing` + final CTA. | Mostly there — reframe copy + a UI-fade finish. |

## Motion philosophy (applies to every act)
Each act = its own lighting, camera language, motion language, atmosphere,
emotion. The user should never feel they're on the same page. Transitions are
designed, not incidental. Premium easing / spring physics throughout; reduced-
motion always degrades gracefully (no autoplay, static frames).

## Build order (highest emotional impact ÷ effort first)
1. **Narrative spine (copy + act framing)** — ✅ done (`273fa61`). Craft → "The
   birth of form", Materials → "The materials of forever / Three metals. Three
   worlds.", TheCut → "The personality of the stone", Showcase → "Your creation",
   Closing → "Forever / Some choices last forever." + signature lines. Plus the
   scroll-scrubbed turntable (`586ab68`) as the image-sequence-style reveal.
   _Still to add here: `TechnicalSpecs` (Act VI) onto the page._
2. **Act IV material worlds** — ✅ done (`718d23a`, `b23db1d`). Global atmosphere
   wash cross-fades the room's mood with the chosen metal (moonlight / heritage /
   intimacy), and the Materials section names each metal as a world.
3. **Act I converging-particles opening** — ✅ done (`d550463`). Scroll-scrubbed
   particle cloud converges into the first facet beneath "Every forever begins as
   a possibility." Self-contained `ActOne` canvas; build-green, SSR-safe.
4. **Act III metal-grows on scroll** — ✅ done (`96fb332`). Reveal coupled to ring
   scale; materialises on entry, solid at full scale.
5. **Act VI blueprint** — ✅ done (`8b79aba`). Animated technical-drawing SVG
   (`Blueprint`), reflects the live stone.
6. **Act VIII price-as-story** — ✅ done (`633091d`, `WeightOfChoice`).
7. **Act II birth-of-light** — ✅ done (`2110a70`, `BirthOfLight`, prism/spectrum SVG).
8. **Act VII the hand** — ✅ done (`HumanConnection`, stylized gold line-art).

**All ten acts shipped.** The signature for the diagrammatic interludes (II/VI/VII)
is a unified gold line-art language. Remaining work is iterative polish against the
real-GPU experience, not new acts — see Constraints. Finale polish (Act IX/X UI
fade, the converging "your creation" recap) is the natural next refinement pass.

## Constraints / honesty
- Real-GPU bloom/material can't be verified in the software-WebGL harness — keep
  effects conservative; the user's real screenshots are ground truth.
- Live metal/stone configurability is a hard requirement — every act preserves it.
- Acts VII (hand) and II (inside-diamond) are the hardest; they may be stylized
  rather than photoreal, and ship last.
