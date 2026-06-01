import { create } from "zustand";
import { DEFAULT_METAL, DEFAULT_STONE } from "@/lib/config";
import type { MetalId, StoneId } from "@/lib/types";

/* Scroll position + velocity — updated by a passive listener, read by the 3D
   scroll rig. Lives outside React to avoid re-renders on every pixel. */
let _scrollY = 0;
let _scrollVel = 0;
export function getScrollY() { return _scrollY; }
export function setScrollY(y: number) { _scrollY = y; }
export function getScrollVel() { return _scrollVel; }
export function setScrollVel(v: number) { _scrollVel = v; }

/* Ring "reveal" 0→1, derived from the ring's on-screen scale by the ScrollDirector
   and read by the metal materialise shader (Act III — the ring grows into being as
   it enters the stage). 1 = fully formed; near 0 only while the ring is hidden, so
   it can never be left half-dissolved while visible. */
let _ringReveal = 0;
export function getRingReveal() {
  return _ringReveal;
}
export function setRingReveal(v: number) {
  _ringReveal = v;
}

/* Requested ring pose (radians) for the view presets / reset affordance.
   null = free (idle + drag + pointer parallax). Read by TwistRing each frame;
   cleared the moment the user grabs the ring. */
let _ringYawTarget: number | null = null;
let _ringPitchTarget: number | null = null;
export function getRingYawTarget() {
  return _ringYawTarget;
}
export function getRingPitchTarget() {
  return _ringPitchTarget;
}
export function setRingPose(yaw: number | null, pitch: number | null = yaw) {
  _ringYawTarget = yaw;
  _ringPitchTarget = pitch;
}

interface ConfiguratorState {
  metal: MetalId;
  stone: StoneId;
  /** The metal being previewed on hover — null means show committed metal. */
  previewMetal: MetalId | null;
  /** Monotonic counter bumped on any change — the 3D camera reads it to nudge. */
  changeSeq: number;
  lastChanged: "metal" | "stone" | null;

  cartOpen: boolean;
  toast: string | null;
  celebrating: boolean;

  setMetal: (metal: MetalId) => void;
  setStone: (stone: StoneId) => void;
  setPreviewMetal: (metal: MetalId | null) => void;
  openCart: () => void;
  closeCart: () => void;
  showToast: (message: string) => void;
  clearToast: () => void;
  celebrate: () => void;
  endCelebrate: () => void;
}

export const useConfigurator = create<ConfiguratorState>((set) => ({
  metal: DEFAULT_METAL,
  stone: DEFAULT_STONE,
  previewMetal: null,
  changeSeq: 0,
  lastChanged: null,
  cartOpen: false,
  toast: null,
  celebrating: false,

  setMetal: (metal) =>
    set((s) =>
      s.metal === metal
        ? s
        : { metal, previewMetal: null, lastChanged: "metal", changeSeq: s.changeSeq + 1 },
    ),
  setStone: (stone) =>
    set((s) =>
      s.stone === stone
        ? s
        : { stone, lastChanged: "stone", changeSeq: s.changeSeq + 1 },
    ),
  setPreviewMetal: (metal) => set({ previewMetal: metal }),
  openCart: () => set({ cartOpen: true }),
  closeCart: () => set({ cartOpen: false }),
  showToast: (message) => set({ toast: message }),
  clearToast: () => set({ toast: null }),
  celebrate: () => set({ celebrating: true }),
  endCelebrate: () => set({ celebrating: false }),
}));
