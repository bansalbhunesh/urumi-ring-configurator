import { create } from "zustand";
import { DEFAULT_METAL, DEFAULT_STONE } from "@/lib/config";
import type { MetalId, StoneId } from "@/lib/types";

interface ConfiguratorState {
  metal: MetalId;
  stone: StoneId;
  /** Monotonic counter bumped on any change — the 3D camera reads it to nudge. */
  changeSeq: number;
  lastChanged: "metal" | "stone" | null;

  cartOpen: boolean;
  toast: string | null;

  setMetal: (metal: MetalId) => void;
  setStone: (stone: StoneId) => void;
  openCart: () => void;
  closeCart: () => void;
  showToast: (message: string) => void;
  clearToast: () => void;
}

export const useConfigurator = create<ConfiguratorState>((set) => ({
  metal: DEFAULT_METAL,
  stone: DEFAULT_STONE,
  changeSeq: 0,
  lastChanged: null,
  cartOpen: false,
  toast: null,

  setMetal: (metal) =>
    set((s) =>
      s.metal === metal
        ? s
        : { metal, lastChanged: "metal", changeSeq: s.changeSeq + 1 },
    ),
  setStone: (stone) =>
    set((s) =>
      s.stone === stone
        ? s
        : { stone, lastChanged: "stone", changeSeq: s.changeSeq + 1 },
    ),
  openCart: () => set({ cartOpen: true }),
  closeCart: () => set({ cartOpen: false }),
  showToast: (message) => set({ toast: message }),
  clearToast: () => set({ toast: null }),
}));
