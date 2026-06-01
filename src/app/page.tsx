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
        {/* I — cold open: particles converge into the first facet */}
        <ActOne />
        {/* II — the product: hero configurator, ring is born */}
        <Studio />
        {/* III — on the hand: SVG line-art, ring settles onto a finger */}
        <OnTheHand />
        {/* IV — holographic scroll: six renders of the ring scrubbed by scroll */}
        <HolographicReveal />
        {/* V — craft: the birth of form, editorial motion */}
        <Craft />
        {/* VI — materials: three metals, three worlds */}
        <Materials />
        {/* VII — hidden precision: animated blueprint, dimension lines */}
        <BlueprintSpec />
        {/* VIII — born under pressure: GLSL water, diamond emerges */}
        <WaterDiamond />
        {/* IX — your creation: photoreal ring, drag to inspect */}
        <Showcase />
        {/* X — the promise: palette flip to cream */}
        <PromiseSection />
        {/* XI — kept forever: what they said after yes */}
        <Testimonials />
        {/* XII — finale: the weight of the decision */}
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
