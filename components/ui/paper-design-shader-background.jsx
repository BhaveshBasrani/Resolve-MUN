"use client";

import React, { useEffect, useState, Component } from "react";
import { GrainGradient } from "@paper-design/shaders-react";

// Safe Error Boundary to prevent WebGL context loss or shader crash from breaking mobile render
class ShaderErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }
  static getDerivedStateFromError() {
    return { hasError: true };
  }
  componentDidCatch(error) {
    console.warn("Shader background fallback triggered:", error);
  }
  render() {
    if (this.state.hasError) {
      return this.props.fallback;
    }
    return this.props.children;
  }
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
}) {
  const [isMounted, setIsMounted] = useState(false);
  const [supportsWebGL, setSupportsWebGL] = useState(true);

  useEffect(() => {
    try {
      const canvas = document.createElement("canvas");
      const gl = canvas.getContext("webgl") || canvas.getContext("experimental-webgl");
      setSupportsWebGL(Boolean(gl));
    } catch (e) {
      setSupportsWebGL(false);
    }
    setIsMounted(true);
  }, []);

  const fallbackGradient = (
    <div
      className={`absolute inset-0 -z-10 pointer-events-none overflow-hidden ${className}`}
      style={{
        position: "absolute",
        inset: 0,
        zIndex: -10,
        background:
          "radial-gradient(ellipse at 50% 30%, rgba(99, 102, 241, 0.28) 0%, rgba(5, 5, 10, 0.95) 75%), linear-gradient(135deg, #050614 0%, #030308 100%)",
        ...style,
      }}
    />
  );

  if (!isMounted || !supportsWebGL) {
    return fallbackGradient;
  }

  return (
    <ShaderErrorBoundary fallback={fallbackGradient}>
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
    </ShaderErrorBoundary>
  );
}

export default GradientBackground;
