"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { toggleSound, isSoundOn, playPing } from "@/hooks/useSound";

/* ---------------------------------------------------------------------------
   Sound toggle — floating button near the 3D canvas.
   Positioned above the mobile StickyBar so they never overlap.
   ---------------------------------------------------------------------------*/

function SpeakerOnIcon() {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.5}
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M11 5 6 9H2v6h4l5 4V5Z" />
      <path d="M15.54 8.46a5 5 0 0 1 0 7.07" />
      <path d="M19.07 4.93a10 10 0 0 1 0 14.14" />
    </svg>
  );
}

function SpeakerOffIcon() {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.5}
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M11 5 6 9H2v6h4l5 4V5Z" />
      <line x1="22" y1="9" x2="16" y2="15" />
      <line x1="16" y1="9" x2="22" y2="15" />
    </svg>
  );
}

export function SoundToggle() {
  const [enabled, setEnabled] = useState(isSoundOn);

  const handleClick = () => {
    const next = toggleSound();
    setEnabled(next);
    if (next) playPing();
  };

  return (
    <motion.button
      type="button"
      onClick={handleClick}
      aria-label={enabled ? "Mute sound" : "Enable sound"}
      aria-pressed={enabled}
      title={enabled ? "Sound on" : "Sound off"}
      whileTap={{ scale: 0.85 }}
      transition={{ type: "spring", stiffness: 420, damping: 18 }}
      className={[
        "fixed z-40 grid h-9 w-9 place-items-center rounded-full",
        "border border-line/50 backdrop-blur-md",
        "transition-colors duration-200",
        enabled ? "bg-white/60 text-ink" : "bg-white/40 text-muted",
        "bottom-24 right-6 lg:bottom-8 lg:right-8",
      ].join(" ")}
    >
      {enabled ? <SpeakerOnIcon /> : <SpeakerOffIcon />}
    </motion.button>
  );
}
