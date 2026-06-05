"use client";

import { motion } from "framer-motion";

const ease = [0.22, 1, 0.36, 1] as const;

/* A full-bleed cinematic beat — the Oryzo "product floating in space" moment.
   data-ring="hidden" hands the canvas off so the live ring yields to a single
   Higgsfield-rendered macro loop of the diamond catching light, with one line of
   monumental type. The video bleeds top/bottom into the warm-black page so it
   reads as atmosphere, not a card. */
export function CinemaInterstitial() {
  return (
    <section id="cinema" data-ring="hidden" className="pp-cinema">
      <video
        className="pp-cinema__video"
        src="/video/ring-cosmos.mp4"
        poster="/img/generated/ring-cosmos-poster.jpg"
        autoPlay
        muted
        loop
        playsInline
        preload="metadata"
        aria-hidden="true"
      />
      <div className="pp-cinema__scrim" />
      <motion.div
        className="pp-cinema__copy"
        initial={{ opacity: 0, y: 24 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-80px" }}
        transition={{ duration: 0.9, ease }}
      >
        <p className="kicker" style={{ justifyContent: "center" }}>The centre stone</p>
        <h2 className="pp-cinema__title">
          A universe in
          <br />
          one stone.
        </h2>
      </motion.div>
    </section>
  );
}
