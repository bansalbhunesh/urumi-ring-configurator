"use client";

import { motion } from "framer-motion";

const ease = [0.22, 1, 0.36, 1] as const;

export function PhotoHandoff() {
  return (
    <section id="photo-handoff" data-ring="hidden" className="pp-section">
      <div className="pp-wrap pp-split pp-split--reverse">
        <div className="pp-split__media">
          <motion.figure
            className="pp-figure pp-figure--video"
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.8, ease }}
          >
            <video
              src="/video/ring-hand.mp4"
              poster="/img/generated/ring-hand-editorial.png"
              autoPlay
              muted
              loop
              playsInline
              preload="metadata"
              aria-label="The Twist engagement ring worn on a hand, cinematic loop"
            />
          </motion.figure>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.8, ease, delay: 0.05 }}
        >
          <p className="kicker"><span className="kicker__idx">02</span> On the hand</p>
          <h2 className="pp-h2 mt-3">Made to be worn,<br />not just admired.</h2>
          <p className="pp-body">
            What you build on screen is what arrives in the box — the same twist of
            the band, the same lift of the basket, the same fire in the stone. Every
            ring is made to order in recycled gold and shipped insured, in a way that
            funds clean water for a person in need.
          </p>
        </motion.div>
      </div>
    </section>
  );
}
