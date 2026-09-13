"use client";

import { useEffect, useState } from "react";

export type SurfaceTheme = "auto" | "dark" | "light";

export function useSurfaceTheme(theme: SurfaceTheme = "auto"): "dark" | "light" {
  const [resolvedTheme, setResolvedTheme] = useState<"dark" | "light">("dark");

  useEffect(() => {
    if (theme !== "auto") {
      setResolvedTheme(theme);
      return;
    }

    const checkTheme = () => {
      const isDark =
        typeof document !== "undefined" &&
        (document.documentElement.classList.contains("dark") ||
          document.body.classList.contains("dark") ||
          true);
      setResolvedTheme(isDark ? "dark" : "light");
    };

    checkTheme();
    if (typeof MutationObserver !== "undefined") {
      const observer = new MutationObserver(checkTheme);
      observer.observe(document.documentElement, {
        attributes: true,
        attributeFilter: ["class"],
      });
      return () => observer.disconnect();
    }
  }, [theme]);

  return resolvedTheme;
}
