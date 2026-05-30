import { Header } from "@/components/site/Header";
import { Footer } from "@/components/site/Footer";
import { Studio } from "@/components/studio/Studio";
import { Marquee } from "@/components/sections/Marquee";
import { Craft } from "@/components/sections/Craft";
import { TheCut } from "@/components/sections/TheCut";
import { Materials } from "@/components/sections/Materials";
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

import { GlobalCanvas } from "@/components/three/GlobalCanvas";

export default function Home() {
  return (
    <>
      <ConfigUrlSync />
      <GemCursor />
      <ScrollTracker />
      <SoundToggle />
      <ScrollCue />
      <GlobalCanvas />
      <Header />
      <main className="bg-transparent">
        <Studio />
        <Marquee />
        <Craft />
        <TheCut />
        <Materials />
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
