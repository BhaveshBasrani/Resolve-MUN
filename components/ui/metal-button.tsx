"use client";

import * as React from "react";
import { MetalFx, type MetalFxPreset } from "metal-fx";
import { cn } from "@/lib/utils";
import {
  useSurfaceTheme,
  type SurfaceTheme,
} from "@/components/ui/metal-button-utils/use-surface-theme";

export interface MetalButtonProps
  extends Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, "className"> {
  preset?: MetalFxPreset;
  theme?: SurfaceTheme;
  strength?: number;
  size?: "xs" | "sm" | "md" | "lg";
  paused?: boolean;
  className?: string;
  wrapperClassName?: string;
}

const SIZE = {
  xs: "h-7 px-3 text-[11px] min-w-0",
  sm: "h-9 px-4 text-[12.5px] min-w-[90px]",
  md: "h-12 px-6 text-[15px] min-w-[145px]",
  lg: "h-14 px-8 text-[16.5px] min-w-[190px]",
} as const;

export function MetalButton({
  preset = "chromatic",
  theme = "dark",
  strength = 1,
  size = "md",
  paused = false,
  className,
  wrapperClassName,
  children,
  type = "button",
  ...props
}: MetalButtonProps) {
  const [mounted, setMounted] = React.useState(false);
  const resolved = useSurfaceTheme(theme);

  React.useEffect(() => {
    setMounted(true);
  }, []);

  const innerButton = (
    <button
      type={type}
      className={cn(
        "liquid-glass-pill inline-flex items-center justify-center gap-2.5 rounded-full font-bold tracking-wide transition-all duration-300 ease-out cursor-pointer select-none",
        "text-white hover:brightness-110 active:scale-[0.96]",
        "focus-visible:outline-none disabled:pointer-events-none disabled:opacity-60",
        SIZE[size],
        className
      )}
      {...props}
    >
      <span className="relative z-10 flex items-center gap-2">{children}</span>
    </button>
  );

  if (!mounted) {
    return (
      <div className={cn("inline-flex", wrapperClassName)} suppressHydrationWarning>
        {innerButton}
      </div>
    );
  }

  return (
    <MetalFx
      variant="button"
      preset={preset}
      theme={resolved}
      strength={strength}
      paused={paused}
      className={cn("inline-flex transition-transform duration-300 hover:scale-[1.03] active:scale-[0.97]", wrapperClassName)}
      suppressHydrationWarning
    >
      {innerButton}
    </MetalFx>
  );
}

export default MetalButton;
