"use client";

/* ---------------------------------------------------------------------------
   Aurelle — Procedural sound engine
   Jewellery-grade audio feedback for configuration changes.
   Uses raw Web Audio API — zero dependencies, lazy-initialised.
   Sound is OFF by default (respects browser autoplay policies).
   ---------------------------------------------------------------------------*/

let ctx: AudioContext | null = null;
let masterGain: GainNode | null = null;
let soundEnabled = false;

const MASTER_VOLUME = 0.12;

function ensureContext(): AudioContext | null {
  if (ctx) return ctx;
  try {
    const AudioCtx =
      globalThis.AudioContext ??
      (globalThis as unknown as { webkitAudioContext: typeof AudioContext })
        .webkitAudioContext;
    if (!AudioCtx) return null;
    ctx = new AudioCtx();
    masterGain = ctx.createGain();
    masterGain.gain.value = MASTER_VOLUME;
    masterGain.connect(ctx.destination);
  } catch {
    ctx = null;
  }
  return ctx;
}

async function resumeIfNeeded() {
  if (ctx?.state === "suspended") {
    try { await ctx.resume(); } catch { /* swallow */ }
  }
}

export function toggleSound(): boolean {
  soundEnabled = !soundEnabled;
  if (soundEnabled) ensureContext();
  return soundEnabled;
}

export function isSoundOn(): boolean {
  return soundEnabled;
}

/**
 * Metal ting — triangle wave at 1200 Hz with a quick pitch-drop.
 * Triangle waves have rich harmonics that read as polished metal striking itself.
 */
export function playShimmer() {
  if (!soundEnabled) return;
  const c = ensureContext();
  if (!c || !masterGain) return;
  void resumeIfNeeded();

  const now = c.currentTime;
  const osc = c.createOscillator();
  const gain = c.createGain();

  osc.type = "triangle";
  osc.frequency.setValueAtTime(1200, now);
  osc.frequency.exponentialRampToValueAtTime(840, now + 0.18);

  gain.gain.setValueAtTime(0.42, now);
  gain.gain.exponentialRampToValueAtTime(0.001, now + 0.24);

  osc.connect(gain);
  gain.connect(masterGain);
  osc.start(now);
  osc.stop(now + 0.26);
}

/**
 * Crystal bell — sine at 2400 Hz, fast attack, long bell tail.
 * Evokes the crystalline click of a faceted stone being set.
 */
export function playPing() {
  if (!soundEnabled) return;
  const c = ensureContext();
  if (!c || !masterGain) return;
  void resumeIfNeeded();

  const now = c.currentTime;
  const jitter = 1 + (Math.random() - 0.5) * 0.04;

  const osc = c.createOscillator();
  const gain = c.createGain();

  osc.type = "sine";
  osc.frequency.value = 2400 * jitter;

  gain.gain.setValueAtTime(0, now);
  gain.gain.linearRampToValueAtTime(0.28, now + 0.003);
  gain.gain.exponentialRampToValueAtTime(0.001, now + 0.9);

  osc.connect(gain);
  gain.connect(masterGain);
  osc.start(now);
  osc.stop(now + 0.95);
}

/**
 * Celebration chord — C major triad (C4, E4, G4, C5) played as a warm
 * strummed chord. All notes together, slightly soft attack, long sustain.
 */
export function playCelebrate() {
  if (!soundEnabled) return;
  const c = ensureContext();
  if (!c || !masterGain) return;
  void resumeIfNeeded();

  const now = c.currentTime;
  const notes = [261.63, 329.63, 392.0, 523.25];

  for (let i = 0; i < notes.length; i++) {
    const strum = i * 0.022;
    const osc = c.createOscillator();
    const gain = c.createGain();

    osc.type = "sine";
    osc.frequency.value = notes[i];

    gain.gain.setValueAtTime(0, now + strum);
    gain.gain.linearRampToValueAtTime(0.38, now + strum + 0.04);
    gain.gain.exponentialRampToValueAtTime(0.001, now + strum + 1.1);

    osc.connect(gain);
    gain.connect(masterGain);
    osc.start(now + strum);
    osc.stop(now + strum + 1.15);
  }
}
