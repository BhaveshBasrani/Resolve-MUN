"use client";

import * as React from "react";
import { MetalFx } from "metal-fx";
import { cn } from "@/lib/utils";
import { useSurfaceTheme } from "@/components/ui/metal-button-utils/use-surface-theme";

const SIZE = {
  sm: "h-9 px-4 text-[13px]",
  md: "h-11 px-5 text-[15px]",
  lg: "h-13 px-7 text-base",
};

export function MetalButton({
  preset = "chromatic",
  theme = "auto",
  strength = 1,
  size = "md",
  paused = false,
  className = "",
  wrapperClassName = "",
  children,
  type = "button",
  ...props
}) {
  const [mounted, setMounted] = React.useState(false);
  const resolved = useSurfaceTheme(theme);

  React.useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <button
        type={type}
        className={cn(
          "inline-flex items-center justify-center gap-2 rounded-xl font-medium tracking-[-0.01em]",
          "text-white bg-purple-950/40 border border-purple-500/30",
          SIZE[size] || SIZE.md,
          className
        )}
        {...props}
      >
        {children}
      </button>
    );
  }

  return (
    <MetalFx
      variant="button"
      preset={preset}
      theme={resolved}
      strength={strength}
      paused={paused}
      className={cn("inline-flex cursor-pointer select-none rounded-xl", wrapperClassName)}
    >
      <button
        type={type}
        className={cn(
          "inline-flex items-center justify-center gap-2 rounded-xl font-medium tracking-[-0.01em] transition-[transform,background-color] duration-200 ease-out cursor-pointer",
          "text-white hover:opacity-90 active:scale-[0.97]",
          "focus-visible:outline-none disabled:pointer-events-none disabled:opacity-60",
          SIZE[size] || SIZE.md,
          className
        )}
        {...props}
      >
        {children}
      </button>
    </MetalFx>
  );
}

export default MetalButton;
