"use client";

import { useEffect } from "react";
import Lenis from "lenis";

export default function SmoothScroll() {
  useEffect(() => {
    // Respect reduced motion preference
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      return;
    }

    const lenis = new Lenis({
      duration: 1.15,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      orientation: "vertical",
      gestureOrientation: "vertical",
      smoothWheel: true,
      wheelMultiplier: 0.95,
      touchMultiplier: 1.2,
      infinite: false,
    });

    let rafId;
    function raf(time) {
      lenis.raf(time);
      rafId = requestAnimationFrame(raf);
    }

    rafId = requestAnimationFrame(raf);

    if (typeof window !== "undefined") {
      window.lenis = lenis;
    }

    // Connect Lenis to in-page hash links like #about, #venue, #delegate-pass
    const handleAnchorClick = (e) => {
      const target = e.target.closest('a[href^="#"], a[href^="/#"]');
      if (!target) return;
      const href = target.getAttribute("href");
      const hash = href.includes("#") ? "#" + href.split("#")[1] : null;
      if (hash && hash !== "#") {
        const elem = document.querySelector(hash);
        if (elem) {
          e.preventDefault();
          lenis.scrollTo(elem, { offset: -80, duration: 1.2 });
        }
      }
    };
    document.addEventListener("click", handleAnchorClick);

    return () => {
      cancelAnimationFrame(rafId);
      document.removeEventListener("click", handleAnchorClick);
      lenis.destroy();
      if (typeof window !== "undefined") {
        delete window.lenis;
      }
    };
  }, []);

  return null;
}

