import { Header } from "@/components/site/Header";
import { Footer } from "@/components/site/Footer";
import { Studio } from "@/components/studio/Studio";
import { Marquee } from "@/components/sections/Marquee";
import { Craft } from "@/components/sections/Craft";
import { Materials } from "@/components/sections/Materials";
import { Closing } from "@/components/sections/Closing";
import { CartDrawer } from "@/components/cart/CartDrawer";
import { StickyBar } from "@/components/cart/StickyBar";
import { Celebration } from "@/components/cart/Celebration";
import { GemCursor } from "@/components/ui/GemCursor";
import { ScrollTracker } from "@/components/ui/ScrollTracker";
import { SoundToggle } from "@/components/ui/SoundToggle";
import { EngravingToy } from "@/components/sections/EngravingToy";
import { TechnicalSpecs } from "@/components/sections/TechnicalSpecs";

export default function Home() {
  return (
    <>
      <GemCursor />
      <ScrollTracker />
      <SoundToggle />
      <Header />
      <main className="bg-stage">
        <Studio />
        <Marquee />
        <Craft />
        <Materials />
        <EngravingToy />
        <TechnicalSpecs />
        <Closing />
      </main>
      <Footer />
      <CartDrawer />
      <StickyBar />
      <Celebration />
    </>
  );
}
