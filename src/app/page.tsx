import { Header } from "@/components/site/Header";
import { Footer } from "@/components/site/Footer";
import { RingFilm } from "@/components/sections/RingFilm";
import { PhotoHandoff } from "@/components/sections/PhotoHandoff";
import { Provenance } from "@/components/sections/Provenance";
import { Commitment } from "@/components/sections/Commitment";
import { FinishTheLook } from "@/components/sections/FinishTheLook";
import { Mission } from "@/components/sections/Mission";
import { Worn } from "@/components/sections/Worn";
import { Testimonials } from "@/components/sections/Testimonials";
import { Closing } from "@/components/sections/Closing";
import { CartDrawer } from "@/components/cart/CartDrawer";
import { StickyBar } from "@/components/cart/StickyBar";
import { ScrollTracker } from "@/components/ui/ScrollTracker";
import { Toast } from "@/components/ui/Toast";
import { ConfigUrlSync } from "@/components/ui/ConfigUrlSync";
import { GlobalCanvas } from "@/components/three/GlobalCanvas";

export default function Home() {
  return (
    <>
      <ConfigUrlSync />
      <ScrollTracker />
      <GlobalCanvas />
      <Header />
      <main className="bg-transparent">
        <RingFilm />
        <PhotoHandoff />
        <Provenance />
        <Commitment />
        <FinishTheLook />
        <Mission />
        <Testimonials />
        <Worn />
        <Closing />
      </main>
      <Footer />
      <CartDrawer />
      <StickyBar />
      <Toast />
    </>
  );
}
