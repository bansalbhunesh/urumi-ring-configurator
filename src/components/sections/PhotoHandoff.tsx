"use client";

import { motion } from "framer-motion";

const FRAMES = [
  {
    id: "hand",
    label: "On hand",
    title: "Scale, skin, daylight.",
    src: "/img/doamore/twist-lifestyle.jpg",
    alt: "The Twist engagement ring worn on a hand",
    className: "lg:col-span-7",
  },
  {
    id: "angle",
    label: "Studio angle",
    title: "The twist reads from the side.",
    src: "/img/doamore/twist-round-white-gold-angle.jpg",
    alt: "The Twist engagement ring three-quarter studio angle",
    className: "lg:col-span-5",
  },
  {
    id: "front",
    label: "Product plate",
    title: "Round brilliant, four prongs.",
    src: "/img/doamore/twist-round-white-gold.jpg",
    alt: "The Twist engagement ring front studio view",
    className: "lg:col-span-5",
  },
] as const;

export function PhotoHandoff() {
  return (
    <section
      id="photo-handoff"
      data-ring="hidden"
      className="proof-gallery relative overflow-hidden bg-paper px-5 py-24 text-paper-ink sm:px-10 lg:px-16 lg:py-32"
    >
      <div className="mx-auto max-w-7xl">
        <div className="grid gap-8 lg:grid-cols-12 lg:items-end">
          <div className="lg:col-span-5">
            <span className="eyebrow">Proof</span>
            <h2 className="mt-5 max-w-[9ch] font-display text-[clamp(3rem,6vw,6.2rem)] font-semibold leading-[0.9]">
              From render to real life.
            </h2>
          </div>
          <p className="max-w-xl text-[1.02rem] leading-relaxed text-paper-ink/68 lg:col-span-5 lg:col-start-8">
            The 3D view earns trust only when it agrees with product photography. The hand shots make scale, profile, and light legible without another forced animation.
          </p>
        </div>

        <div className="mt-12 grid gap-5 lg:grid-cols-12">
          {FRAMES.map((frame, index) => (
            <motion.article
              key={frame.id}
              className={`proof-card ${frame.className}`}
              initial={{ opacity: 0, y: 28 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-80px" }}
              transition={{ duration: 0.75, ease: [0.22, 1, 0.36, 1], delay: index * 0.08 }}
            >
              <div className="proof-card__image">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={frame.src}
                  alt={frame.alt}
                  className={frame.id === "hand" ? "object-cover" : "object-contain"}
                  loading={index === 0 ? "eager" : "lazy"}
                />
              </div>
              <div className="mt-4 flex items-baseline justify-between gap-5 border-t border-paper-ink/15 pt-3">
                <span className="font-mono text-[0.62rem] uppercase tracking-[0.18em] text-gold-warm">
                  {frame.label}
                </span>
                <h3 className="max-w-[14rem] text-right font-display text-[1.7rem] leading-[0.95]">
                  {frame.title}
                </h3>
              </div>
            </motion.article>
          ))}
        </div>
      </div>
    </section>
  );
}
