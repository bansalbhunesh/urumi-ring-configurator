import { Header } from "@/components/site/Header";
import { Footer } from "@/components/site/Footer";
import { Studio } from "@/components/studio/Studio";
import { ActOne } from "@/components/sections/ActOne";
import { Craft } from "@/components/sections/Craft";
import { Materials } from "@/components/sections/Materials";
import { Provenance } from "@/components/sections/Provenance";
import { Commitment } from "@/components/sections/Commitment";
import { PromiseSection } from "@/components/sections/Promise";
import { Mission } from "@/components/sections/Mission";
import { Testimonials } from "@/components/sections/Testimonials";
import { Closing } from "@/components/sections/Closing";
import { CartDrawer } from "@/components/cart/CartDrawer";
import { StickyBar } from "@/components/cart/StickyBar";
import { ScrollTracker } from "@/components/ui/ScrollTracker";
import { Toast } from "@/components/ui/Toast";
import { ScrollCue } from "@/components/ui/ScrollCue";
import { ConfigUrlSync } from "@/components/ui/ConfigUrlSync";
import { MetalAtmosphere } from "@/components/ui/MetalAtmosphere";
import { ScrollProgressLine } from "@/components/ui/animations/ScrollProgressLine";
import { GlobalCanvas } from "@/components/three/GlobalCanvas";
import { Loader } from "@/components/ui/Loader";

export default function Home() {
  return (
    <>
      <Loader />
      <ConfigUrlSync />
      <ScrollTracker />
      <ScrollCue />
      <MetalAtmosphere />
      <ScrollProgressLine />
      <GlobalCanvas />
      <Header />
      <main className="bg-transparent">
        <ActOne />
        <Studio />
        <Craft />
        <Materials />
        <Provenance />
        <Commitment />
        <PromiseSection />
        <Mission />
        <Testimonials />
        <Closing />
      </main>
      <Footer />
      <CartDrawer />
      <StickyBar />
      <Toast />
    </>
  );
}
