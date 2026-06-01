"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { useConfigurator } from "@/store/configurator";
import { useCart } from "@/hooks/useProduct";
import { BagIcon } from "@/components/ui/icons";
import { Magnetic } from "@/components/ui/Magnetic";

const LINKS = [
  { label: "The Ring", href: "#ring", section: "ring" },
  { label: "Atelier", href: "#atelier", section: "atelier" },
  { label: "Materials", href: "#materials", section: "materials" },
];

export function Header() {
  const [scrolled, setScrolled] = useState(false);
  const [active, setActive] = useState<string | null>(null);
  const openCart = useConfigurator((s) => s.openCart);
  const { data: cart } = useCart();
  const count = cart?.itemCount ?? 0;

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    const targets = LINKS.map((l) => document.getElementById(l.section)).filter(Boolean) as HTMLElement[];
    if (!targets.length) return;
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (e.isIntersecting) setActive(e.target.id);
        }
      },
      { rootMargin: "-20% 0px -70% 0px", threshold: 0 },
    );
    targets.forEach((t) => io.observe(t));
    return () => io.disconnect();
  }, []);

  return (
    <header
      className={`fixed inset-x-0 top-0 z-40 transition-[border-color,background-color,backdrop-filter] duration-500 ${
        scrolled
          ? "border-b border-line/70 bg-ivory/80 backdrop-blur-md"
          : "border-b border-transparent bg-transparent"
      }`}
    >
      <motion.div
        initial={{ y: "-100%", opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 1, ease: [0.22, 1, 0.36, 1], delay: 0.4 }}
        className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6 sm:px-10"
      >
        <Magnetic strength={10}>
          <a
            href="#"
            className="-m-2 flex min-h-11 items-center gap-2 rounded-md p-2 outline-none focus-visible:ring-2 focus-visible:ring-gold"
          >
            <span className="text-gold">◆</span>
            <span className="text-[0.95rem] font-medium uppercase tracking-[0.4em] text-ink">
              Aurelle
            </span>
          </a>
        </Magnetic>

        <nav className="hidden items-center gap-10 md:flex" aria-label="Primary navigation">
          {LINKS.map((l) => {
            const isActive = active === l.section;
            return (
              <a
                key={l.href}
                href={l.href}
                className="group relative -m-2 block min-h-11 rounded-md p-2 text-[0.82rem] tracking-wide outline-none transition-colors focus-visible:ring-2 focus-visible:ring-gold"
                style={{ color: isActive ? "var(--color-gold)" : undefined }}
                aria-current={isActive ? "page" : undefined}
              >
                <span className={`transition-colors duration-300 ${isActive ? "text-gold" : "text-ink-soft group-hover:text-ink"}`}>
                  {l.label}
                </span>
                <span
                  className="absolute bottom-1 left-2 right-2 h-px bg-gold transition-transform duration-300 origin-left"
                  style={{ transform: isActive ? "scaleX(1)" : "scaleX(0)" }}
                />
              </a>
            );
          })}
        </nav>

        <Magnetic strength={15}>
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
                initial={{ scale: 0.4, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ type: "spring", stiffness: 500, damping: 24 }}
                className="grid h-5 min-w-5 place-items-center rounded-full bg-gold px-1 text-[0.66rem] font-medium text-black"
              >
                {count}
              </motion.span>
            )}
          </button>
        </Magnetic>
      </motion.div>
    </header>
  );
}
