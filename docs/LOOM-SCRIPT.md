# Aurelle — Loom pitch

The 3-minute screen recording for the Urumi FDE take-home. Voiced as a buyer would
use it, then the decisions and the honest gaps. Stage directions in `[brackets]`.

---

## The pitch (~3:15)

**[0:00 · COLD OPEN — hero, ring slowly turning]**
"Engagement rings are the one thing people buy online without ever seeing in person — and most sites sell them with a flat photo and a *Buy* button. That's the gap. So I built a page where you can hold the ring, turn it in the light, and watch it become *yours* in real time. It's called **Aurelle**. Give me three minutes — and I'll show you the magic *and* where the wires stick out."

**[0:18 · THE OPEN — refresh so the loader plays]**
"It opens like an atelier, not an app: a loader winds up to 100, the curtain lifts, and the ring descends out of the dark and unwinds into place. 'Considered loading states' were on your rubric — I took that personally."

**[0:33 · CONFIGURE — as a shopper, do each live]**
"Now I'm the shopper. I grab the ring and spin it — cursor or touch, with real weight, none of that clunky model-viewer feel. I change the metal—" *[white → yellow → rose]* "—and it *flows* across the band; it's one material morphing, never a reload. I change the cut—" *[round → oval → emerald]* "—live, on the ring. The price moves with me, and Add to Bag—" *[click, drawer glides open]* "—gives me the *exact* ring I built: this metal, this cut, this size."

**[1:15 · THE PART I'M PROUD OF — round → marquise]**
"Here's the detail I'd defend in an interview. A round and a marquise are completely different silhouettes — one's a circle, one's basically a tiny sword. Reuse one camera for both and you clip half the stone. So the camera *measures every cut* and re-frames the shot for it — same perceived size, full breathing room, never clips, even mid-spin. The camera is doing the job of a jewelry photographer."

**[1:40 · THE BONUS — hover the picker]**
"You floated a stretch goal: make the picker 3D too. So every option is a live gem with the **same shaders as the ring** — what you pick is exactly what you get. I didn't have ten hand-modelled diamonds lying around, so I went **parametric**: one procedural builder that grows every cut from math. Ten shapes, eight metals — more than asked, because the quality held."

**[2:05 · REAL BACKEND]**
"And none of it is faked. It's live **headless WooCommerce** over the Store API — eighty real variations, real prices, real cart, server-side, no keys in the browser. `docker compose up` and you've got the whole store in one command."

**[2:25 · AI, THOUGHTFULLY — slow scroll past the films]**
"The cinematic beats — the ring on the hand, the cosmic close-up — are AI, generated from *our* exact ring with Higgsfield, and the whole thing was built with Claude Code. Used aggressively, but every render was cost-checked. The diamond, funnily enough, is hand-tuned — the 'correct' refraction material renders pure black on software GPUs. Very modern art; not very diamond."

**[2:45 · THE HONEST GAPS]**
"And the wires. The demo store's a free sandbox that expires faster than my gym membership, so every call is timeout-bounded and falls back to a mock that's accurate to the dollar. And real checkout is the classic headless catch — the app's cart and WooCommerce's own checkout are two sessions on two domains, so the hand-off looks empty. The right fix is placing the order in-app via the Store API; I scoped it and told you exactly why, instead of faking a receipt."

**[3:05 · CLOSE — back on the hero ring]**
"So: a ring you can turn in the light, a real store underneath, decisions I can defend, and an honest map of what's next. Built to make someone stop scrolling — and, hopefully, to make *you* smile. Thanks for watching."

---

## Coverage map (assignment → moment)
- **01 Rotate** → "grab the ring and spin it" · **02 Metals live** → "it flows across the band"
- **03 Stone swap** → "change the cut, live on the ring" · **04 Live WooCommerce price** → "the price moves with me" + "eighty real variations"
- **05 Add to cart, exact config** → "the exact ring I built" · **06 Premium feel** → loader + cinematic beats + per-shape framing
- **Bonus 3D picker** → "every option is a live gem, same shaders" + parametric decision
- **Headless backend** → "live headless WooCommerce over the Store API" · **AI** → Higgsfield + Claude Code, cost-checked
- **Decision-making** → R3F-grade procedural stones, per-shape camera, 8×10 · **Self-direction** → owned gaps, documented calls

## Delivery
- Record at 1440-wide, clean tab bar. Do one silent dry-run scroll so clicks land on the lines.
- Refresh first (loader) → don't touch anything for ~2s (hero reveal) → configure → one slow scroll to the bottom → open the cart last.
- Smile on the cold open and the close; it carries in your voice. Pace ≈ 150 wpm.
- If you need a hard 3:00: one metal change instead of three, and trim the films beat to a single line.

## 60-second cut
"Most sites sell a $5,000 ring with a flat photo and a Buy button. So I built **Aurelle** — hold the ring, turn it in the light, and watch it become yours. Change the metal, it morphs live; change the cut, it changes on the ring; and the camera re-frames itself for every shape so nothing ever clips. The picker's 3D too — same shaders as the ring, every cut generated procedurally. Underneath it's real headless WooCommerce: eighty live variations, real prices, real cart. AI did the films and the build, cost-checked. It's not perfect — the free demo store expires and true headless checkout is scoped, not shipped, and I'll tell you exactly why. A premium surface, a real integration, an honest roadmap. That's Aurelle."
