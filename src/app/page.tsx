import { Header } from "@/components/site/Header";
import { Footer } from "@/components/site/Footer";
import { Studio } from "@/components/studio/Studio";
import { Marquee } from "@/components/sections/Marquee";
import { Craft } from "@/components/sections/Craft";
import { Materials } from "@/components/sections/Materials";
import { Closing } from "@/components/sections/Closing";
import { CartDrawer } from "@/components/cart/CartDrawer";
import { StickyBar } from "@/components/cart/StickyBar";
import { Toast } from "@/components/ui/Toast";

export default function Home() {
  return (
    <>
      <Header />
      <main className="bg-stage">
        <Studio />
        <Marquee />
        <Craft />
        <Materials />
        <Closing />
      </main>
      <Footer />
      <CartDrawer />
      <StickyBar />
      <Toast />
    </>
  );
}
