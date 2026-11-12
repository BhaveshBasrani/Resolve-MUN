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
  colors = ["#ffffff", "#000000", "#ffffff"],
  colorBack = "#000000",
  softness = 0.9,
  intensity = 0.45,
  noise = 0,
  shape = "corners",
  offsetX = 0,
  offsetY = 0,
  scale = 1,
  rotation = 0,
  speed = 0.4,
  className = "",
  style = {},
}) {
  const [isMounted, setIsMounted] = useState(false);
  const [supportsWebGL, setSupportsWebGL] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isLowPower, setIsLowPower] = useState(false);

  useEffect(() => {
    const isTouchOrMobile = Boolean(
      (typeof window !== "undefined" && window.innerWidth <= 768) ||
      (typeof window !== "undefined" && window.matchMedia?.("(max-width: 768px), (pointer: coarse)").matches) ||
      (typeof navigator !== "undefined" && navigator.deviceMemory && navigator.deviceMemory <= 4)
    );
    setIsLowPower(isTouchOrMobile);

    if (isTouchOrMobile) {
      // On mobile, bypass WebGL completely to prevent GPU thermal throttling, black screens, and context loss
      setSupportsWebGL(false);
      setIsMounted(true);
      return;
    }

    try {
      const canvas = document.createElement("canvas");
      const gl = canvas.getContext("webgl") || canvas.getContext("experimental-webgl");
      setSupportsWebGL(Boolean(gl));
    } catch (e) {
      setSupportsWebGL(false);
    }
    setIsMounted(true);

    const checkModal = () => {
      const active = Boolean(document.querySelector(".modal-overlay.active"));
      setIsModalOpen((prev) => (prev !== active ? active : prev));
    };
    window.addEventListener("modalStateChange", checkModal);
    const obs = new MutationObserver(checkModal);
    if (document.body) {
      obs.observe(document.body, { attributes: true, attributeFilter: ["style", "class"] });
    }
    return () => {
      window.removeEventListener("modalStateChange", checkModal);
      obs.disconnect();
    };
  }, []);

  const fallbackGradient = (
    <div
      className={`absolute inset-0 -z-10 pointer-events-none overflow-hidden ${className}`}
      style={{
        position: "absolute",
        inset: 0,
        zIndex: -10,
        background:
        "radial-gradient(ellipse at 50% 30%, rgba(255, 255, 255, 0.12) 0%, rgba(0, 0, 0, 0.95) 75%), #000000",
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
          speed={isModalOpen ? 0 : (isLowPower ? 0.35 : speed)}
          colors={colors}
          minPixelRatio={isLowPower ? 1 : 2}
          maxPixelCount={isLowPower ? 250000 : 1920 * 1080 * 4}
        />
      </div>
    </ShaderErrorBoundary>
  );
}

export default GradientBackground;
