"use client";

import { useEffect, useRef } from "react";
import { useConfigurator } from "@/store/configurator";
import { METAL_BY_ID, STONE_BY_ID } from "@/lib/config";
import type { MetalId, StoneId } from "@/lib/types";

/* Keeps the configuration in the URL (?metal=…&stone=…) so a built ring is
   shareable / linkable, and restores it on load. Uses replaceState so it never
   pollutes browser history on every swatch click. */
export function ConfigUrlSync() {
  const metal = useConfigurator((s) => s.metal);
  const stone = useConfigurator((s) => s.stone);
  const setMetal = useConfigurator((s) => s.setMetal);
  const setStone = useConfigurator((s) => s.setStone);
  const didInit = useRef(false);

  // Restore from URL on first mount.
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const m = params.get("metal");
    const s = params.get("stone");
    if (m && m in METAL_BY_ID) setMetal(m as MetalId);
    if (s && s in STONE_BY_ID) setStone(s as StoneId);
  }, [setMetal, setStone]);

  // Reflect changes back into the URL (skip the very first run).
  useEffect(() => {
    if (!didInit.current) {
      didInit.current = true;
      return;
    }
    const params = new URLSearchParams(window.location.search);
    params.set("metal", metal);
    params.set("stone", stone);
    window.history.replaceState(
      null,
      "",
      `${window.location.pathname}?${params.toString()}`,
    );
  }, [metal, stone]);

  return null;
}
