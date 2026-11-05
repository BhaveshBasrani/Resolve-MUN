"use client";

import { useEffect } from "react";

/**
 * Native HTML Scrolling — Lenis wheel hijacking removed so the entire site
 * and all modal forms scroll with instant, zero-latency browser physics.
 */
export default function SmoothScroll() {
  useEffect(() => {
    if (typeof document !== "undefined") {
      document.documentElement.classList.remove("lenis", "lenis-smooth", "lenis-scrolling", "lenis-stopped");
      document.body.classList.remove("lenis", "lenis-smooth", "lenis-scrolling", "lenis-stopped");
    }
    if (typeof window !== "undefined") {
      window.lenis = null;
    }
  }, []);

  return null;
}
