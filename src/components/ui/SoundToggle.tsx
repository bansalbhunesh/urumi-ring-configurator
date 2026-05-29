"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { isSoundOn, toggleSound, playPing } from "@/hooks/useSound";
import { Magnetic } from "@/components/ui/Magnetic";

function SpeakerOnIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M11 5L6 9H2v6h4l5 4V5z" />
      <path d="M15.54 8.46a5 5 0 0 1 0 7.07" />
      <path d="M19.07 4.93a10 10 0 0 1 0 14.14" />
    </svg>
  );
}

function SpeakerOffIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M11 5L6 9H2v6h4l5 4V5z" />
      <line x1="23" y1="1" x2="1" y2="23" />
    </svg>
  );
}

export function SoundToggle() {
  const [enabled, setEnabled] = useState(false);
  
  useEffect(() => {
    setEnabled(isSoundOn());
  }, []);

  const handleClick = () => {
    const next = toggleSound();
    setEnabled(next);
    if (next) playPing();
  };

  return (
    <Magnetic strength={20} className="fixed bottom-24 right-6 z-50 md:bottom-8 md:right-8">
      <motion.button
        onClick={handleClick}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.9 }}
        className="flex h-10 w-10 items-center justify-center rounded-full border border-line/50 bg-white/40 shadow-sm backdrop-blur-md transition-colors hover:bg-white/60 text-ink"
        aria-label={enabled ? "Mute sound" : "Enable sound"}
      >
        <AnimatePresence mode="wait" initial={false}>
          {enabled ? (
            <motion.div
              key="on"
              initial={{ opacity: 0, scale: 0.5, rotate: -45 }}
              animate={{ opacity: 1, scale: 1, rotate: 0 }}
              exit={{ opacity: 0, scale: 0.5, rotate: 45 }}
              transition={{ duration: 0.2 }}
            >
              <SpeakerOnIcon />
            </motion.div>
          ) : (
            <motion.div
              key="off"
              initial={{ opacity: 0, scale: 0.5, rotate: -45 }}
              animate={{ opacity: 1, scale: 1, rotate: 0 }}
              exit={{ opacity: 0, scale: 0.5, rotate: 45 }}
              transition={{ duration: 0.2 }}
              className="text-muted"
            >
              <SpeakerOffIcon />
            </motion.div>
          )}
        </AnimatePresence>
      </motion.button>
    </Magnetic>
  );
}
