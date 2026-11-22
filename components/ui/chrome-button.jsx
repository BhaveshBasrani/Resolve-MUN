"use client";

import React, { useState, useEffect } from "react";
import LiquidChrome from "@/components/ui/liquid-chrome";

export function ChromeButton({
  children,
  onClick,
  className = "",
  style = {},
  disabled = false,
  ...props
}) {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth <= 768);
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);

  if (isMobile) {
    return (
      <button
        type="button"
        onClick={onClick}
        disabled={disabled}
        className={`mobile-chrome-btn relative py-3 px-4 rounded-lg font-bold tracking-wider text-xs uppercase whitespace-nowrap inline-flex items-center justify-center select-none cursor-pointer ${className}`}
        style={style}
        {...props}
      >
        <span>{children}</span>
      </button>
    );
  }

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={`chrome-btn relative py-3.5 px-7 rounded-full border-neutral-900 border-2 bg-neutral-950 overflow-hidden group text-white active:scale-95 transition-all duration-75 shadow-lg cursor-pointer inline-flex items-center justify-center select-none ${className}`}
      style={{
        borderRadius: "9999px",
        overflow: "hidden",
        isolation: "isolate",
        WebkitMaskImage: "-webkit-radial-gradient(white, black)",
        maskImage: "radial-gradient(white, black)",
        ...style,
      }}
      {...props}
    >
      <div
        className="absolute inset-0 z-0 opacity-80 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"
        style={{
          borderRadius: "9999px",
          overflow: "hidden",
          WebkitMaskImage: "-webkit-radial-gradient(white, black)",
          maskImage: "radial-gradient(white, black)",
        }}
      >
        <LiquidChrome
          baseColor={[
            0.0392156862745098, 0.0392156862745098, 0.0392156862745098,
          ]}
          speed={2}
          amplitude={0.1}
          interactive={false}
          style={{ width: "100%", height: "100%", borderRadius: "9999px" }}
        />
      </div>
      <span className="relative z-10 mix-blend-difference font-bold tracking-wider text-xs sm:text-sm uppercase whitespace-nowrap">
        {children}
      </span>
    </button>
  );
}

export default ChromeButton;
