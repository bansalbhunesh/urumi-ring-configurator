import type { Metadata } from "next";
import { Marcellus, Manrope } from "next/font/google";
import "./globals.css";
import { Providers } from "@/components/providers";

const display = Marcellus({
  variable: "--font-display",
  subsets: ["latin"],
  weight: "400",
  display: "swap",
});

const sans = Manrope({
  variable: "--font-sans",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL("https://urumi-ring.local"),
  title: "Aurelle — The Twist Engagement Ring",
  description:
    "A made-to-order twist solitaire, configured in real time. Choose your metal, your stone, and watch light find every facet.",
  openGraph: {
    title: "Aurelle — The Twist Engagement Ring",
    description:
      "Configure a made-to-order twist solitaire in real time.",
    type: "website",
  },
};

import { SmoothScroll } from "@/components/ui/SmoothScroll";
import { Grain } from "@/components/ui/Grain";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${display.variable} ${sans.variable}`}>
      <body className="antialiased">
        <Grain />
        <SmoothScroll>
          <Providers>{children}</Providers>
        </SmoothScroll>
      </body>
    </html>
  );
}
