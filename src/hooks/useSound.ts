"use client";

/* ---------------------------------------------------------------------------
   Aurelle — Procedural sound engine
   Crystalline audio feedback for configuration changes.
   Uses raw Web Audio API — zero dependencies, lazy-initialised.
   Sound is OFF by default (respects browser autoplay policies).
   ---------------------------------------------------------------------------*/

let ctx: AudioContext | null = null;
let masterGain: GainNode | null = null;
let soundEnabled = false;

const MASTER_VOLUME = 0.12;

/** Lazily spin up the AudioContext on first user gesture. */
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
    try {
      await ctx.resume();
    } catch {
      /* swallow */
    }
  }
}

/** Toggle sound on/off. Returns the new state. */
export function toggleSound(): boolean {
  soundEnabled = !soundEnabled;
  if (soundEnabled) ensureContext();
  return soundEnabled;
}

/** Check current sound state. */
export function isSoundOn(): boolean {
  return soundEnabled;
}

/**
 * Crystalline ping — for stone changes.
 * Short sine wave at ~880 Hz with slight per-call pitch jitter and fast decay.
 */
export function playPing() {
  if (!soundEnabled) return;
  const c = ensureContext();
  if (!c || !masterGain) return;
  void resumeIfNeeded();

  const now = c.currentTime;
  const jitter = 1 + (Math.random() - 0.5) * 0.06;
  const freq = 880 * jitter;

  const osc = c.createOscillator();
  const gain = c.createGain();

  osc.type = "sine";
  osc.frequency.value = freq;

  gain.gain.setValueAtTime(0.6, now);
  gain.gain.exponentialRampToValueAtTime(0.001, now + 0.18);

  osc.connect(gain);
  gain.connect(masterGain);

  osc.start(now);
  osc.stop(now + 0.2);
}

/**
 * Warm shimmer — for metal changes.
 * Layered A-major triad (440 Hz, 554 Hz, 659 Hz) with gentle envelope.
 */
export function playShimmer() {
  if (!soundEnabled) return;
  const c = ensureContext();
  if (!c || !masterGain) return;
  void resumeIfNeeded();

  const now = c.currentTime;
  const frequencies = [440, 554, 659];

  for (const freq of frequencies) {
    const osc = c.createOscillator();
    const gain = c.createGain();

    osc.type = "sine";
    osc.frequency.value = freq;

    gain.gain.setValueAtTime(0, now);
    gain.gain.linearRampToValueAtTime(0.35, now + 0.04);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.4);

    osc.connect(gain);
    gain.connect(masterGain);

    osc.start(now);
    osc.stop(now + 0.45);
  }
}

/**
 * Celebration bell — for add-to-cart.
 * Ascending arpeggio C5 → E5 → G5 → C6 with a reverb-like tail.
 */
export function playCelebrate() {
  if (!soundEnabled) return;
  const c = ensureContext();
  if (!c || !masterGain) return;
  void resumeIfNeeded();

  const now = c.currentTime;
  const notes = [523.25, 659.25, 783.99, 1046.5];
  const noteSpacing = 0.1;
  const noteDuration = 0.6;

  for (let i = 0; i < notes.length; i++) {
    const start = now + i * noteSpacing;

    const osc = c.createOscillator();
    const gain = c.createGain();

    osc.type = "sine";
    osc.frequency.value = notes[i];

    gain.gain.setValueAtTime(0, start);
    gain.gain.linearRampToValueAtTime(0.45, start + 0.02);
    gain.gain.exponentialRampToValueAtTime(0.001, start + noteDuration);

    osc.connect(gain);
    gain.connect(masterGain);

    osc.start(start);
    osc.stop(start + noteDuration + 0.05);
  }
}
