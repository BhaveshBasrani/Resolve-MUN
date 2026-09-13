"use client";

export function useSurfaceTheme(theme = "auto") {
  return theme === "light" ? "light" : "dark";
}
