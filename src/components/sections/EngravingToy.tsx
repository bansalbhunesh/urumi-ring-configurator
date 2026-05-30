"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { EngravingCanvas } from "@/components/three/EngravingCanvas";
import { useConfigurator } from "@/store/configurator";

export function EngravingToy() {
  const [text, setText] = useState("");
  const setEngraving = useConfigurator((s) => s.setEngraving);

  const handleType = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value.slice(0, 40).toUpperCase();
    setText(val);
    setEngraving(val);
  };

  return (
    <section className="relative min-h-[100svh] bg-black py-32 flex flex-col justify-center overflow-hidden">
      {/* 3D Background Canvas */}
      <div className="absolute inset-0 z-0">
        <EngravingCanvas text={text} />
      </div>

      <div className="relative z-10 mx-auto w-full max-w-4xl px-6 sm:px-10">
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-20%" }}
          transition={{ duration: 1.2, ease: [0.22, 1, 0.36, 1] }}
          className="flex flex-col items-center text-center"
        >
          <h2 className="font-display text-4xl leading-tight sm:text-5xl text-white">
            The Engraving.
          </h2>
          <p className="mt-6 max-w-md text-lg leading-relaxed text-ink-soft">
            Laser-etched into the inner band. Up to 40 characters. Type below to
            see it materialize in real time.
          </p>

          <div className="mt-16 w-full max-w-lg">
            <input
              type="text"
              value={text}
              onChange={handleType}
              placeholder="YOUR MESSAGE HERE"
              className="w-full border-b border-line/30 bg-transparent py-4 text-center font-display text-2xl uppercase tracking-[0.2em] text-gold placeholder-white/10 outline-none transition-colors focus:border-gold"
            />
            <div className="mt-4 flex justify-between text-xs text-ink-soft tracking-widest uppercase">
              <span>Inner Band</span>
              <span>{text.length} / 40</span>
            </div>
          </div>
          
          <p className="mt-20 text-sm text-ink-soft/70 uppercase tracking-widest">
            This is what the inside of your ring could say.
          </p>
        </motion.div>
      </div>
    </section>
  );
}
