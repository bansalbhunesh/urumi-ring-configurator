"use client";

import { motion } from "framer-motion";
import { SceneReveal } from "@/components/ui/SceneReveal";
import { useProduct } from "@/hooks/useProduct";
import { useVariation } from "@/hooks/useVariation";
import { METAL_BY_ID, STONE_BY_ID } from "@/lib/config";
import { useConfigurator } from "@/store/configurator";

const ease = [0.22, 1, 0.36, 1] as const;

const GALLERY = [
  { src: "/img/doamore/twist-lifestyle-angle.jpg", alt: "The Twist ring worn, three-quarter view" },
  { src: "/img/generated/ring-hand-editorial.png", alt: "Editorial close-up of the ring on the hand" },
  { src: "/img/generated/story-hand-editorial.png", alt: "Editorial portrait of the ring being worn" },
];

export function Provenance() {
  const metal = useConfigurator((s) => s.metal);
  const stone = useConfigurator((s) => s.stone);
  const size = useConfigurator((s) => s.size);
  const { data: product } = useProduct();
  const { live } = useVariation(product, metal, stone);
  const activeStone = STONE_BY_ID[stone];

  // The reader's own choices — set apart and given weight, the way an order card
  // would read, not a row in a database.
  const choices: [string, string][] = [
    ["Metal", METAL_BY_ID[metal].label],
    ["Centre stone", `${activeStone.label} · ${activeStone.carat}`],
    ["Size", `US ${size}`],
  ];
  // How the ring is made — quiet, editorial supporting detail.
  const make: [string, string][] = [
    ["Setting", "Split-twist solitaire"],
    ["Shoulder", "One polished strand, one pavé strand"],
    ["Basket", "Four-prong, lifting the centre stone to the light"],
    ["Service", "Insured shipping · lifetime warranty · 60-day returns"],
  ];

  return (
    <section id="provenance" data-ring="hidden" className="pp-section">
      <div className="pp-wrap">
        <SceneReveal depth={1.15}>
          <p className="kicker"><span className="kicker__idx">03</span> The details</p>
          <h2 className="pp-h2 mt-3">Considered, to the last facet.</h2>
          <p className="pp-body">
            Every choice you make is written into the order — and priced
            {live ? " live from the store" : " from the same source the store uses"}.
          </p>
        </SceneReveal>

        <SceneReveal depth={0.6}>
          <div className="pp-choices">
            {choices.map(([k, v]) => (
              <div key={k} className="pp-choice">
                <span className="pp-choice__k">{k}</span>
                <span className="pp-choice__v">{v}</span>
              </div>
            ))}
          </div>
        </SceneReveal>

        <SceneReveal depth={0.4}>
          <dl className="pp-make">
            {make.map(([k, v]) => (
              <div key={k} className="pp-make__row">
                <dt>{k}</dt>
                <dd>{v}</dd>
              </div>
            ))}
          </dl>
        </SceneReveal>

        <div className="pp-gallery">
          {GALLERY.map((g, i) => (
            <motion.div
              key={g.src}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-60px" }}
              transition={{ duration: 0.7, ease, delay: i * 0.08 }}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={g.src} alt={g.alt} loading="lazy" />
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
