"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { useConfigurator } from "@/store/configurator";
import { useCart } from "@/hooks/useProduct";
import { BagIcon } from "@/components/ui/icons";
import { Magnetic } from "@/components/ui/Magnetic";
import { toggleSound } from "@/hooks/useSound";

const LINKS = [
  { label: "The Ring", href: "#ring", section: "ring" },
  { label: "Inspect", href: "#atelier", section: "atelier" },
  { label: "Configure", href: "#materials", section: "materials" },
  { label: "Proof", href: "#photo-handoff", section: "photo-handoff" },
];

export function Header() {
  const [scrolled, setScrolled] = useState(false);
  const [soundOn, setSoundOn] = useState(false);
  const [overCinematic, setOverCinematic] = useState(true);
  const [active, setActive] = useState<string | null>(null);
  const openCart = useConfigurator((s) => s.openCart);
  const { data: cart } = useCart();
  const count = cart?.itemCount ?? 0;

  useEffect(() => {
    const onScroll = () => {
      setScrolled(window.scrollY > 24);
      const center = window.innerHeight * 0.5;
      let nearestId: string | null = null;
      let nearestRingState: string | null = null;
      let distance = Number.POSITIVE_INFINITY;
      document.querySelectorAll<HTMLElement>("section[id]").forEach((section) => {
        const rect = section.getBoundingClientRect();
        if (rect.bottom < 0 || rect.top > window.innerHeight) return;
        const nextDistance = Math.abs(rect.top + rect.height * 0.5 - center);
        if (nextDistance < distance) {
          distance = nextDistance;
          nearestId = section.id;
          nearestRingState = section.dataset.ring ?? null;
        }
      });
      if (nearestId) {
        setActive(nearestId);
        setOverCinematic(
          nearestRingState === "impact" ||
            nearestRingState === "inspection" ||
            nearestRingState === "config" ||
            nearestRingState === "photo" ||
            nearestRingState === "finale",
        );
      } else {
        setOverCinematic(window.scrollY < window.innerHeight);
      }
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const darkHeader = overCinematic;
  const quietText = darkHeader ? "text-bench-ink" : "text-ink";
  const mutedText = darkHeader
    ? "text-bench-muted group-hover:text-bench-ink"
    : "text-ink-soft group-hover:text-ink";

  return (
    <header
      className={`fixed inset-x-0 top-0 z-40 transition-[border-color,background-color,backdrop-filter] duration-500 ${
        scrolled && !darkHeader
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
            <span className={darkHeader ? "text-bench-gold" : "text-gold"}>◆</span>
            <span className={`text-[0.95rem] font-medium uppercase tracking-[0.4em] ${quietText}`}>
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
                <span className={`transition-colors duration-300 ${isActive ? "text-gold" : mutedText}`}>
                  {l.label}
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
            className={`group relative -m-2 flex min-h-11 min-w-11 items-center justify-center rounded-md p-2 outline-none transition-colors focus-visible:ring-2 focus-visible:ring-gold ${quietText}`}
            aria-label={soundOn ? "Mute sound" : "Unmute sound"}
          >
            {soundOn ? (
              <svg className="h-[18px] w-[18px] transition-transform group-hover:scale-110" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M11 5L6 9H2v6h4l5 4V5z" /><path d="M15.54 8.46a5 5 0 010 7.07" /><path d="M19.07 4.93a10 10 0 010 14.14" /></svg>
            ) : (
              <svg className="h-[18px] w-[18px] opacity-40 transition-transform group-hover:scale-110 group-hover:opacity-70" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M11 5L6 9H2v6h4l5 4V5z" /><line x1="23" y1="9" x2="17" y2="15" /><line x1="17" y1="9" x2="23" y2="15" /></svg>
            )}
          </button>
          <Magnetic strength={15}>
            <button
              type="button"
              onClick={openCart}
              className={`group relative -m-2 flex min-h-11 min-w-11 items-center justify-center gap-2 rounded-md p-2 outline-none focus-visible:ring-2 focus-visible:ring-gold ${quietText}`}
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
        </div>
      </motion.div>
    </header>
  );
}
