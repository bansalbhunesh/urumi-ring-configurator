import { Header } from "@/components/site/Header";
import { Footer } from "@/components/site/Footer";
import { Studio } from "@/components/studio/Studio";
import { OnTheHand } from "@/components/sections/OnTheHand";
import { HolographicReveal } from "@/components/sections/HolographicReveal";
import { ActOne } from "@/components/sections/ActOne";
import { Craft } from "@/components/sections/Craft";
import { Materials } from "@/components/sections/Materials";
import { Showcase } from "@/components/sections/Showcase";
import { WaterDiamond } from "@/components/sections/WaterDiamond";
import { BlueprintSpec } from "@/components/sections/BlueprintSpec";
import { MirrorRoom } from "@/components/sections/MirrorRoom";
import { PromiseSection } from "@/components/sections/Promise";
import { Testimonials } from "@/components/sections/Testimonials";
import { Closing } from "@/components/sections/Closing";
import { CartDrawer } from "@/components/cart/CartDrawer";
import { StickyBar } from "@/components/cart/StickyBar";
import { Celebration } from "@/components/cart/Celebration";
import { GemCursor } from "@/components/ui/GemCursor";
import { ScrollTracker } from "@/components/ui/ScrollTracker";
import { SoundToggle } from "@/components/ui/SoundToggle";
import { Toast } from "@/components/ui/Toast";
import { ScrollCue } from "@/components/ui/ScrollCue";
import { ConfigUrlSync } from "@/components/ui/ConfigUrlSync";
import { MetalAtmosphere } from "@/components/ui/MetalAtmosphere";
import { ScrollProgressLine } from "@/components/ui/animations/ScrollProgressLine";

import { GlobalCanvas } from "@/components/three/GlobalCanvas";

export default function Home() {
  return (
    <>
      <ConfigUrlSync />
      <GemCursor />
      <ScrollTracker />
      <SoundToggle />
      <ScrollCue />
      <MetalAtmosphere />
      <ScrollProgressLine />
      <GlobalCanvas />
      <Header />
      <main className="bg-transparent">
        {/* 1 — cold open: particles converge into the first facet */}
        <ActOne />
        {/* 2 — the product: hero configurator */}
        <Studio />
        {/* 3 — on the hand: SVG line-art, ring colour follows selection */}
        <OnTheHand />
        {/* 4 — holographic scroll sequence: 6 renders scrubbed by page scroll */}
        <HolographicReveal />
        {/* 5 — editorial: craft, materials, stones */}
        <Craft />
        <Materials />
        {/* 6 — water distortion: diamond emerges through rippling water */}
        <WaterDiamond />
        {/* 7 — photoreal beat: the real GLB ring, drag to inspect */}
        <Showcase />
        {/* 8 — blueprint: engineering spec overlay */}
        <BlueprintSpec />
        {/* 9 — mirror room: infinite reflections */}
        <MirrorRoom />
        {/* 10 — palette flip: the promise statement on cream */}
        <PromiseSection />
        {/* 11 — social proof */}
        <Testimonials />
        {/* 12 — finale CTA */}
        <Closing />
      </main>
      <Footer />
      <CartDrawer />
      <StickyBar />
      <Celebration />
      <Toast />
    </>
  );
}
