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

export type RingMotionReason = "metal" | "stone" | "pointer" | "park" | "reset";
export type RingMotionMode = "physical" | "parked" | "reduced" | "hidden";
export type ActiveChapter =
  | "impact"
  | "inspection"
  | "config"
  | "photo"
  | "ledger"
  | "finale";

/* Manual ring rotation from cursor / touch drag. The fixed WebGL canvas is
   pointer-events:none so the page stays scrollable; an HTML drag-pad over the
   ring writes the yaw/pitch here and the scene director reads it each frame.
   Lives outside React so dragging never triggers re-renders. */
let _userYaw = 0;
let _userPitch = 0;
let _userYawVel = 0;
let _dragging = false;
export function getUserYaw() {
  return _userYaw;
}
export function setUserYaw(v: number) {
  _userYaw = v;
}
export function getUserYawVel() {
  return _userYawVel;
}
export function getUserPitch() {
  return _userPitch;
}
export function isDragging() {
  return _dragging;
}
export function setDragging(v: boolean) {
  _dragging = v;
}
export function addUserDrag(dxYaw: number, dyPitch: number) {
  _userYaw += dxYaw;
  _userPitch = Math.max(-0.6, Math.min(0.6, _userPitch + dyPitch));
  _userYawVel = dxYaw; // latest delta → flick momentum on release
}

let _ringMotionMode: RingMotionMode = "physical";
let _activeChapter: ActiveChapter = "impact";
export function getRingMotionMode() {
  return _ringMotionMode;
}
export function setRingMotionMode(mode: RingMotionMode) {
  _ringMotionMode = mode;
}
export function getActiveChapter() {
  return _activeChapter;
}
export function setActiveChapter(chapter: ActiveChapter) {
  _activeChapter = chapter;
}

let _ringMotionSeq = 0;
let _ringMotionReason: RingMotionReason = "reset";
export function getRingMotionSeq() {
  return _ringMotionSeq;
}
export function getRingMotionReason() {
  return _ringMotionReason;
}
export function nudgeRing(reason: RingMotionReason) {
  _ringMotionSeq += 1;
  _ringMotionReason = reason;
  _ringMotionMode = reason === "park" ? "parked" : "physical";
  _ringYawTarget = null;
  _ringPitchTarget = null;
}
export function parkRingForConfigurator() {
  nudgeRing("park");
}

interface ConfiguratorState {
  metal: MetalId;
  stone: StoneId;
  /** The metal being previewed on hover — null means show committed metal. */
  previewMetal: MetalId | null;
  /** Monotonic counter bumped on any change — the 3D camera reads it to nudge. */
  changeSeq: number;
  lastChanged: "metal" | "stone" | null;
  inspectionMode: boolean;

  /** Inner-band engraving — the words only the two of them will read. */
  engraving: string;
  /** US ring size. */
  size: number;

  cartOpen: boolean;
  toast: string | null;
  celebrating: boolean;

  setMetal: (metal: MetalId) => void;
  setStone: (stone: StoneId) => void;
  setEngraving: (text: string) => void;
  setSize: (size: number) => void;
  setPreviewMetal: (metal: MetalId | null) => void;
  setInspectionMode: (open: boolean) => void;
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
  inspectionMode: false,
  engraving: "",
  size: 6.5,
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
  setEngraving: (text) =>
    // Keep it to what actually fits inside a band: a short, gentle line.
    set({ engraving: text.replace(/\s+/g, " ").slice(0, 24) }),
  setSize: (size) => set({ size }),
  setPreviewMetal: (metal) => set({ previewMetal: metal }),
  setInspectionMode: (inspectionMode) => set({ inspectionMode }),
  openCart: () => set({ cartOpen: true }),
  closeCart: () => set({ cartOpen: false }),
  showToast: (message) => set({ toast: message }),
  clearToast: () => set({ toast: null }),
  celebrate: () => set({ celebrating: true }),
  endCelebrate: () => set({ celebrating: false }),
}));
