"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { useConfigurator } from "@/store/configurator";
import { useCart } from "@/hooks/useProduct";
import { BagIcon } from "@/components/ui/icons";

const LINKS = [
  { label: "The Ring", href: "#ring" },
  { label: "Craft", href: "#craft" },
  { label: "Materials", href: "#materials" },
];

export function Header() {
  const [scrolled, setScrolled] = useState(false);
  const openCart = useConfigurator((s) => s.openCart);
  const { data: cart } = useCart();
  const count = cart?.itemCount ?? 0;

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      className={`fixed inset-x-0 top-0 z-40 transition-all duration-500 ${
        scrolled
          ? "border-b border-line/70 bg-ivory/80 backdrop-blur-md"
          : "border-b border-transparent bg-transparent"
      }`}
    >
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6 sm:px-10">
        <a href="#" className="flex items-center gap-2">
          <span className="text-gold">◆</span>
          <span className="text-[0.95rem] font-medium uppercase tracking-[0.4em] text-ink">
            Aurelle
          </span>
        </a>

        <nav className="hidden items-center gap-10 md:flex">
          {LINKS.map((l) => (
            <a
              key={l.href}
              href={l.href}
              className="group relative text-[0.82rem] tracking-wide text-ink-soft transition-colors hover:text-ink"
            >
              {l.label}
              <span className="absolute -bottom-1 left-0 h-px w-0 bg-gold transition-all duration-300 group-hover:w-full" />
            </a>
          ))}
        </nav>

        <button
          type="button"
          onClick={openCart}
          className="group relative flex items-center gap-2 text-ink"
          aria-label="Open bag"
        >
          <BagIcon className="h-5 w-5 transition-transform group-hover:scale-110" />
          {count > 0 && (
            <motion.span
              key={count}
              initial={{ scale: 0.4, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ type: "spring", stiffness: 500, damping: 24 }}
              className="grid h-5 min-w-5 place-items-center rounded-full bg-gold px-1 text-[0.66rem] font-medium text-white"
            >
              {count}
            </motion.span>
          )}
        </button>
      </div>
    </header>
  );
}
