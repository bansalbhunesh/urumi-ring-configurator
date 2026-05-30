import { Header } from "@/components/site/Header";
import { Footer } from "@/components/site/Footer";
import { Studio } from "@/components/studio/Studio";
import { ActOne } from "@/components/sections/ActOne";
import { Marquee } from "@/components/sections/Marquee";
import { BirthOfLight } from "@/components/sections/BirthOfLight";
import { Craft } from "@/components/sections/Craft";
import { TheCut } from "@/components/sections/TheCut";
import { Materials } from "@/components/sections/Materials";
import { Blueprint } from "@/components/sections/Blueprint";
import { HumanConnection } from "@/components/sections/HumanConnection";
import { WeightOfChoice } from "@/components/sections/WeightOfChoice";
import { Showcase } from "@/components/sections/Showcase";
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
      <GlobalCanvas />
      <Header />
      <main className="bg-transparent">
        <ActOne />
        <Studio />
        <Marquee />
        <BirthOfLight />
        <Craft />
        <TheCut />
        <Materials />
        <Blueprint />
        <HumanConnection />
        <WeightOfChoice />
        <Showcase />
        <PromiseSection />
        <Testimonials />
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
