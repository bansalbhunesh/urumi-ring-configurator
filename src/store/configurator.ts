import { create } from "zustand";
import { DEFAULT_METAL, DEFAULT_STONE } from "@/lib/config";
import type { MetalId, StoneId } from "@/lib/types";

/* Scroll position — updated by a passive listener, read by the 3D scroll rig.
   Lives outside React to avoid re-renders on every pixel. */
let _scrollY = 0;
export function getScrollY() {
  return _scrollY;
}
export function setScrollY(y: number) {
  _scrollY = y;
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
