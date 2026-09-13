"use client";

import { useEffect, useState } from "react";

export function useSurfaceTheme(theme = "auto") {
  const [resolvedTheme, setResolvedTheme] = useState("dark");

  useEffect(() => {
    if (theme !== "auto") {
      setResolvedTheme(theme);
      return;
    }

    const checkTheme = () => {
      // Default to dark theme for Resolve MUN 2.0
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
