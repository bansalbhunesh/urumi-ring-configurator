"use client";

import { motion } from "framer-motion";

const PROOF_PLATES = [
  {
    label: "Three-quarter",
    src: "/img/doamore/twist-round-white-gold-angle.jpg",
    alt: "The Twist engagement ring three-quarter studio angle",
  },
  {
    label: "Front plate",
    src: "/img/doamore/twist-round-white-gold.jpg",
    alt: "The Twist engagement ring front studio view",
  },
] as const;

export function PhotoHandoff() {
  return (
    <section
      id="photo-handoff"
      data-ring="hidden"
      className="photo-chapter relative overflow-hidden px-5 py-20 text-bench-ink sm:px-8 lg:px-14 lg:py-28"
    >
      <div className="mx-auto grid max-w-7xl gap-8 lg:grid-cols-[minmax(0,1.18fr)_minmax(22rem,0.82fr)] lg:items-center">
        <motion.div
          className="photo-chapter__hero"
          initial={{ opacity: 0, y: 28 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/img/generated/story-hand-editorial.png"
            alt="Editorial hand photograph showing the twist engagement ring being worn"
            loading="eager"
          />
          <div className="photo-chapter__shade" aria-hidden />
          <div className="photo-chapter__caption">
            <span>Generated storyboard plate</span>
            <b>3D choice becomes worn scale</b>
          </div>
        </motion.div>

        <div className="photo-chapter__copy">
          <p className="aurelle-kicker">Object to hand</p>
          <h2 className="mt-4 max-w-[10ch] font-display text-[clamp(2.7rem,5vw,5.4rem)] font-semibold leading-[0.88]">
            The configurator has to agree with the real ring.
          </h2>
          <p className="mt-5 max-w-md text-[1rem] leading-relaxed text-bench-muted">
            The story moves from live 3D to worn scale, then back to product plates
            so the twist, basket, and pave shoulder stay believable.
          </p>

          <div className="mt-9 grid grid-cols-2 gap-3">
            {PROOF_PLATES.map((plate, index) => (
              <motion.article
                key={plate.label}
                className="photo-proof"
                initial={{ opacity: 0, y: 18 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-80px" }}
                transition={{ duration: 0.65, ease: [0.22, 1, 0.36, 1], delay: index * 0.08 }}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={plate.src} alt={plate.alt} loading="lazy" />
                <span>{plate.label}</span>
              </motion.article>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
