"use client";

import { motion } from "framer-motion";
import { useConfigurator } from "@/store/configurator";
import { METAL_BY_ID, STONES } from "@/lib/config";
import { useEffect, useState } from "react";

export function TechnicalSpecs() {
  const metalId = useConfigurator((s) => s.metal);
  const stoneId = useConfigurator((s) => s.stone);
  
  const metal = METAL_BY_ID[metalId];
  const stone = STONES.find((s) => s.id === stoneId);

  const [timeText, setTimeText] = useState("A quiet moment.");

  useEffect(() => {
    const hour = new Date().getHours();
    if (hour >= 0 && hour < 5) setTimeText("It's late. But some choices are clear.");
    else if (hour >= 5 && hour < 12) setTimeText("Morning light. A new beginning.");
    else if (hour >= 12 && hour < 18) setTimeText("The day is bright. The choice is yours.");
    else setTimeText("Evening falls. The metal catches the ambient glow.");
  }, []);

  return (
    <section className="bg-black px-6 py-32 sm:px-10 lg:py-48 text-ink">
      <div className="mx-auto max-w-[800px]">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-10%" }}
          transition={{ duration: 1 }}
        >
          <h3 className="font-display text-3xl text-white mb-16">The Twist Ring — Technical Specification Sheet</h3>
          
          <div className="space-y-6 font-mono text-sm tracking-wide text-ink-soft">
            <div className="flex justify-between border-b border-line/30 pb-2">
              <span className="text-white/60">Alloy</span>
              <span className="text-right">18k recycled gold · Au 75.0% · remainder Ag/Cu</span>
            </div>
            <div className="flex justify-between border-b border-line/30 pb-2">
              <span className="text-white/60">Strand geometry</span>
              <span className="text-right">Double-helix, phase offset π radians</span>
            </div>
            <div className="flex justify-between border-b border-line/30 pb-2">
              <span className="text-white/60">Twist concentration</span>
              <span className="text-right">Gaussian bump function, σ = 0.38</span>
            </div>
            <div className="flex justify-between border-b border-line/30 pb-2">
              <span className="text-white/60">Stone seat</span>
              <span className="text-right">4-prong basket, elevation 12.4mm above shank</span>
            </div>
            <div className="flex justify-between border-b border-line/30 pb-2">
              <span className="text-white/60">Centre stone</span>
              <span className="text-right">{stone?.label}, {stone?.carat}, table 53%</span>
            </div>
            <div className="flex justify-between border-b border-line/30 pb-2">
              <span className="text-white/60">Conflict-free certification</span>
              <span className="text-right">GIA #[generated on order]</span>
            </div>
            <div className="flex justify-between border-b border-line/30 pb-2">
              <span className="text-white/60">Manufacturing</span>
              <span className="text-right">Hand-finished, single artisan, 4 weeks</span>
            </div>
            <div className="flex justify-between border-b border-gold/50 pb-2 mt-12">
              <span className="text-white/80">Weight</span>
              <span className="text-right text-gold">4.2g · The weight of a promise</span>
            </div>
          </div>

          <div className="mt-24 text-center">
            <p className="text-xs uppercase tracking-[0.3em] text-white/30">
              {timeText}
            </p>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
