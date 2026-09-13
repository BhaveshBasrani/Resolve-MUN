"use client";

import React, { useEffect, useState } from "react";
import { GrainGradient } from "@paper-design/shaders-react";
import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";

class ShaderErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }
  static getDerivedStateFromError() {
    return { hasError: true };
  }
  componentDidCatch(error) {
    console.warn("Modal shader fallback:", error);
  }
  render() {
    if (this.state.hasError) {
      return (
        <div className="absolute inset-0 bg-gradient-to-br from-[#12072b] via-[#090b1c] to-[#04050a] pointer-events-none" />
      );
    }
    return this.props.children;
  }
}

export function cn(...inputs) {
  return twMerge(clsx(inputs));
}

export default function ModalShaderBackdrop() {
  const [modalActive, setModalActive] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);

    const checkModals = () => {
      const active = document.querySelector(".modal-overlay.active");
      const isNowActive = Boolean(active);
      setModalActive(isNowActive);
      if (isNowActive) {
        if (!document.body.classList.contains("modal-locked")) {
          document.body.classList.add("modal-locked");
        }
      } else {
        if (document.body.classList.contains("modal-locked")) {
          document.body.classList.remove("modal-locked");
        }
      }
    };

    // Run initial check
    checkModals();

    const handleCheck = () => {
      // Run synchronously and again after a frame
      checkModals();
      requestAnimationFrame(checkModals);
    };

    // Use capture phase so stopPropagation cannot suppress modal close checks
    window.addEventListener("click", handleCheck, true);
    window.addEventListener("modalStateChange", handleCheck);
    window.addEventListener("keydown", handleCheck, true);

    // MutationObserver to immediately detect when .active is added or removed from any modal
    let observer = null;
    try {
      observer = new MutationObserver(() => {
        checkModals();
      });
      observer.observe(document.body, {
        attributes: true,
        attributeFilter: ["class"],
        subtree: true,
      });
    } catch (e) {
      console.warn("MutationObserver error in ModalShaderBackdrop:", e);
    }

    return () => {
      window.removeEventListener("click", handleCheck, true);
      window.removeEventListener("modalStateChange", handleCheck);
      window.removeEventListener("keydown", handleCheck, true);
      if (observer) observer.disconnect();
      document.body.classList.remove("modal-locked");
    };
  }, []);

  if (!mounted || !modalActive) return null;

  return (
    <div
      className={cn(
        "fixed inset-0 z-[99990] pointer-events-none transition-opacity duration-300 overflow-hidden",
        modalActive ? "opacity-100" : "opacity-0"
      )}
      aria-hidden="true"
    >
      <ShaderErrorBoundary>
        <GrainGradient
          speed={0.9}
          scale={1}
          rotation={0}
          offsetX={0}
          offsetY={0}
          softness={0.5}
          intensity={0.55}
          noise={0.25}
          shape="corners"
          frame={2854.5}
          colors={["#FFFFFF", "#8B5CF6", "#3B82F6", "#FFFFFF"]}
          colorBack="#00000000"
          className="absolute inset-0 bg-black/80 pointer-events-none"
        />
      </ShaderErrorBoundary>
    </div>
  );
}
