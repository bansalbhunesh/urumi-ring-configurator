"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { useCart } from "@/hooks/useProduct";
import { toggleSound } from "@/hooks/useSound";
import { useConfigurator } from "@/store/configurator";
import { BagIcon } from "@/components/ui/icons";
import { Magnetic } from "@/components/ui/Magnetic";

const LINKS = [
  { label: "The Ring", href: "#ring" },
  { label: "On the Hand", href: "#photo-handoff" },
  { label: "Details", href: "#provenance" },
];

export function Header() {
  const [scrolled, setScrolled] = useState(false);
  const [soundOn, setSoundOn] = useState(false);
  const openCart = useConfigurator((s) => s.openCart);
  const { data: cart } = useCart();
  const count = cart?.itemCount ?? 0;

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 16);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      className={`fixed inset-x-0 top-0 z-40 transition-[background-color,border-color,backdrop-filter] duration-500 ${
        scrolled
          ? "border-b border-line bg-ivory/85 backdrop-blur-md"
          : "border-b border-transparent bg-transparent"
      }`}
    >
      <motion.div
        initial={{ y: "-100%", opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1], delay: 0.1 }}
        className="mx-auto flex h-16 max-w-7xl items-center justify-between px-5 sm:px-10"
      >
        <Magnetic strength={8}>
          <a href="#ring" className="-m-2 flex min-h-11 items-center gap-3 rounded-md p-2 outline-none focus-visible:ring-2 focus-visible:ring-gold">
            <span className="grid h-7 w-7 place-items-center rounded-sm border border-gold/60 text-[0.7rem] font-semibold text-gold">A</span>
            <span className="text-[0.9rem] font-medium uppercase tracking-[0.34em] text-ink">Aurelle</span>
          </a>
        </Magnetic>

        <nav className="hidden items-center gap-8 md:flex" aria-label="Primary">
          {LINKS.map((link) => (
            <a
              key={link.href}
              href={link.href}
              className="-m-2 block min-h-11 rounded-md p-2 text-[0.8rem] tracking-wide text-ink-soft outline-none transition-colors hover:text-ink focus-visible:ring-2 focus-visible:ring-gold"
            >
              {link.label}
            </a>
          ))}
        </nav>

        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={() => setSoundOn(toggleSound())}
            className="group -m-2 grid min-h-11 min-w-11 place-items-center rounded-md p-2 text-ink outline-none transition-colors focus-visible:ring-2 focus-visible:ring-gold"
            aria-label={soundOn ? "Mute sound" : "Unmute sound"}
          >
            {soundOn ? (
              <svg className="h-[18px] w-[18px]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M11 5L6 9H2v6h4l5 4V5z" /><path d="M15.54 8.46a5 5 0 010 7.07" /><path d="M19.07 4.93a10 10 0 010 14.14" /></svg>
            ) : (
              <svg className="h-[18px] w-[18px] opacity-45 transition-opacity group-hover:opacity-75" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M11 5L6 9H2v6h4l5 4V5z" /><line x1="23" y1="9" x2="17" y2="15" /><line x1="17" y1="9" x2="23" y2="15" /></svg>
            )}
          </button>

          <Magnetic strength={10}>
            <button
              type="button"
              onClick={openCart}
              className="group relative -m-2 flex min-h-11 min-w-11 items-center justify-center gap-2 rounded-md p-2 text-ink outline-none focus-visible:ring-2 focus-visible:ring-gold"
              aria-label="Open bag"
            >
              <BagIcon className="h-5 w-5 transition-transform group-hover:scale-110" />
              {count > 0 && (
                <motion.span
                  key={count}
                  initial={{ scale: 0.5, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ duration: 0.2 }}
                  className="grid h-5 min-w-5 place-items-center rounded-full bg-gold px-1 text-[0.66rem] font-medium text-white"
                >
                  {count}
                </motion.span>
              )}
            </button>
          </Magnetic>
        </div>
      </motion.div>
    </header>
  );
}
