"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { useCart } from "@/hooks/useProduct";
import { toggleSound } from "@/hooks/useSound";
import { useConfigurator } from "@/store/configurator";
import { BagIcon } from "@/components/ui/icons";
import { Magnetic } from "@/components/ui/Magnetic";

const LINKS = [
  { label: "The Ring", href: "#ring", section: "ring" },
  { label: "Configure", href: "#materials", section: "materials" },
  { label: "Proof", href: "#photo-handoff", section: "photo-handoff" },
  { label: "Details", href: "#provenance", section: "provenance" },
];

export function Header() {
  const [scrolled, setScrolled] = useState(false);
  const [soundOn, setSoundOn] = useState(false);
  const [overDark, setOverDark] = useState(true);
  const [active, setActive] = useState("ring");
  const openCart = useConfigurator((state) => state.openCart);
  const { data: cart } = useCart();
  const count = cart?.itemCount ?? 0;

  useEffect(() => {
    const onScroll = () => {
      setScrolled(window.scrollY > 24);
      const center = window.innerHeight * 0.48;
      let nextActive = "ring";
      let nextDark = true;
      let distance = Number.POSITIVE_INFINITY;

      document.querySelectorAll<HTMLElement>("section[id]").forEach((section) => {
        const rect = section.getBoundingClientRect();
        if (rect.bottom < 0 || rect.top > window.innerHeight) return;
        const d = Math.abs(rect.top + rect.height * 0.5 - center);
        if (d < distance) {
          distance = d;
          nextActive = section.id;
          nextDark = section.dataset.ring !== "hidden";
        }
      });

      setActive(nextActive);
      setOverDark(nextDark);
    };

    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const tone = overDark ? "text-bench-ink" : "text-ink";
  const muted = overDark
    ? "text-bench-muted group-hover:text-bench-ink"
    : "text-ink-soft group-hover:text-ink";

  return (
    <header
      className={`fixed inset-x-0 top-0 z-40 transition-[border-color,background-color,backdrop-filter] duration-500 ${
        scrolled
          ? overDark
            ? "border-b border-bench-line/35 bg-bench-deep/55 backdrop-blur-md"
            : "border-b border-line/70 bg-ivory/82 backdrop-blur-md"
          : "border-b border-transparent bg-transparent"
      }`}
    >
      <motion.div
        initial={{ y: "-100%", opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1], delay: 0.15 }}
        className="mx-auto flex h-16 max-w-7xl items-center justify-between px-5 sm:px-10"
      >
        <Magnetic strength={8}>
          <a
            href="#ring"
            className="-m-2 flex min-h-11 items-center gap-3 rounded-md p-2 outline-none focus-visible:ring-2 focus-visible:ring-gold"
          >
            <span className="grid h-7 w-7 place-items-center border border-gold/55 text-[0.7rem] font-semibold text-gold">
              A
            </span>
            <span className={`text-[0.9rem] font-medium uppercase tracking-[0.36em] ${tone}`}>
              Aurelle
            </span>
          </a>
        </Magnetic>

        <nav className="hidden items-center gap-8 md:flex" aria-label="Primary navigation">
          {LINKS.map((link) => {
            const isActive = active === link.section;
            return (
              <a
                key={link.href}
                href={link.href}
                className="group relative -m-2 block min-h-11 rounded-md p-2 text-[0.8rem] tracking-wide outline-none transition-colors focus-visible:ring-2 focus-visible:ring-gold"
                aria-current={isActive ? "page" : undefined}
              >
                <span className={`transition-colors duration-300 ${isActive ? "text-gold" : muted}`}>
                  {link.label}
                </span>
                <span
                  className="absolute bottom-1 left-2 right-2 h-px origin-left bg-gold transition-transform duration-300"
                  style={{ transform: isActive ? "scaleX(1)" : "scaleX(0)" }}
                />
              </a>
            );
          })}
        </nav>

        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={() => setSoundOn(toggleSound())}
            className={`group -m-2 grid min-h-11 min-w-11 place-items-center rounded-md p-2 outline-none transition-colors focus-visible:ring-2 focus-visible:ring-gold ${tone}`}
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
              className={`group relative -m-2 flex min-h-11 min-w-11 items-center justify-center gap-2 rounded-md p-2 outline-none focus-visible:ring-2 focus-visible:ring-gold ${tone}`}
              aria-label="Open bag"
            >
              <BagIcon className="h-5 w-5 transition-transform group-hover:scale-110" />
              {count > 0 && (
                <motion.span
                  key={count}
                  initial={{ scale: 0.5, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ duration: 0.2 }}
                  className="grid h-5 min-w-5 place-items-center rounded-full bg-gold px-1 text-[0.66rem] font-medium text-black"
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
