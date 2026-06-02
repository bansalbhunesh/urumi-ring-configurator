"use client";

import { Component, type ReactNode } from "react";

/* ---------------------------------------------------------------------------
   CanvasBoundary — keeps a WebGL failure from taking down the whole page.

   The global <Canvas> + postprocessing pipeline can throw if the browser
   hands back a null GL context (lost context, software renderer, blocked
   GPU). Without a boundary that error unmounts the entire React tree and the
   page goes blank. Here we swallow it, log once, and let the DOM story render
   on its own — the ring is the centerpiece, but it is never load-bearing for
   the rest of the experience.
--------------------------------------------------------------------------- */

export class CanvasBoundary extends Component<
  { children: ReactNode },
  { failed: boolean }
> {
  state = { failed: false };

  static getDerivedStateFromError() {
    return { failed: true };
  }

  componentDidCatch(error: unknown) {
    if (process.env.NODE_ENV !== "production") {
      console.warn("[CanvasBoundary] WebGL scene disabled:", error);
    }
  }

  render() {
    if (this.state.failed) return null;
    return this.props.children;
  }
}
