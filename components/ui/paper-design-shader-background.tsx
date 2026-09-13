"use client";

import React from "react";
import { GrainGradient } from "@paper-design/shaders-react";

export interface GradientBackgroundProps {
  colors?: string[];
  colorBack?: string;
  softness?: number;
  intensity?: number;
  noise?: number;
  shape?: "corners" | "center" | "wave";
  offsetX?: number;
  offsetY?: number;
  scale?: number;
  rotation?: number;
  speed?: number;
  className?: string;
  style?: React.CSSProperties;
}

export function GradientBackground({
  colors = ["hsl(268, 88%, 56%)", "hsl(220, 96%, 60%)", "hsl(285, 85%, 52%)"],
  colorBack = "hsl(240, 25%, 3%)",
  softness = 0.76,
  intensity = 0.52,
  noise = 0,
  shape = "corners",
  offsetX = 0,
  offsetY = 0,
  scale = 1,
  rotation = 0,
  speed = 0.85,
  className = "",
  style = {},
}: GradientBackgroundProps) {
  return (
    <div
      className={`absolute inset-0 -z-10 pointer-events-none overflow-hidden ${className}`}
      style={{ position: "absolute", inset: 0, zIndex: -10, ...style }}
    >
      <GrainGradient
        style={{ height: "100%", width: "100%", position: "absolute", inset: 0 }}
        colorBack={colorBack}
        softness={softness}
        intensity={intensity}
        noise={noise}
        shape={shape}
        offsetX={offsetX}
        offsetY={offsetY}
        scale={scale}
        rotation={rotation}
        speed={speed}
        colors={colors}
      />
    </div>
  );
}

export default GradientBackground;
