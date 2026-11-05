"use client";

import * as React from "react";

function cn(...inputs) {
  return inputs.filter(Boolean).join(" ");
}

export const glassButtonStyles = `
@property --angle-1 { syntax: "<angle>"; inherits: false; initial-value: -75deg; }
@property --angle-2 { syntax: "<angle>"; inherits: false; initial-value: -45deg; }

.glass-button-wrap {
  --anim-time: .4s;
  --anim-ease: cubic-bezier(.25, 1, .5, 1);
  --border-width: clamp(1px, .0625em, 4px);
  z-index: 2;
  transform-style: preserve-3d;
  transition: transform var(--anim-time) var(--anim-ease);
  position: relative;
  display: inline-flex;
}

.glass-button-wrap:has(.glass-button:active) {
  transform: rotateX(25deg);
}

.glass-button-shadow {
  --shadow-cutoff-fix: 2em;
  width: calc(100% + var(--shadow-cutoff-fix));
  height: calc(100% + var(--shadow-cutoff-fix));
  top: calc(0% - var(--shadow-cutoff-fix)/2);
  left: calc(0% - var(--shadow-cutoff-fix)/2);
  filter: blur(clamp(2px, .125em, 12px));
  transition: filter var(--anim-time) var(--anim-ease);
  pointer-events: none;
  position: absolute;
}

.glass-button-shadow:after {
  content: "";
  background: linear-gradient(180deg, rgba(255, 255, 255, 0.2), rgba(255, 255, 255, 0.05));
  width: calc(100% - var(--shadow-cutoff-fix) - .25em);
  height: calc(100% - var(--shadow-cutoff-fix) - .25em);
  box-sizing: border-box;
  transition: all var(--anim-time) var(--anim-ease);
  opacity: 1;
  border-radius: inherit;
  padding: .125em;
  position: absolute;
  top: calc(var(--shadow-cutoff-fix) - .5em);
  left: calc(var(--shadow-cutoff-fix) - .875em);
  -webkit-mask-image: linear-gradient(#000 0 0), linear-gradient(#000 0 0);
  mask-image: linear-gradient(#000 0, #000 0), linear-gradient(#000 0, #000 0);
  -webkit-mask-clip: content-box, border-box;
  mask-clip: content-box, border-box;
  -webkit-mask-composite: xor;
  mask-composite: exclude;
}

.glass-button {
  position: relative;
  -webkit-tap-highlight-color: transparent;
  -webkit-backdrop-filter: blur(clamp(1px, .125em, 4px));
  backdrop-filter: blur(clamp(1px, .125em, 4px));
  transition: all var(--anim-time) var(--anim-ease);
  background: linear-gradient(-75deg, rgba(255, 255, 255, 0.05), rgba(255, 255, 255, 0.18), rgba(255, 255, 255, 0.05));
  box-shadow: inset 0 .125em .125em rgba(255, 255, 255, 0.15), inset 0 -.125em .125em rgba(0, 0, 0, 0.5), 0 .25em .125em -.125em rgba(0, 0, 0, 0.35), 0 0 .1em .25em inset rgba(255, 255, 255, 0.05);
  cursor: pointer;
  border: none;
  outline: none;
}

.glass-button:hover {
  -webkit-backdrop-filter: blur(.01em);
  backdrop-filter: blur(.01em);
  box-shadow: inset 0 .125em .125em rgba(255, 255, 255, 0.25), inset 0 -.125em .125em rgba(0, 0, 0, 0.5), 0 .15em .05em -.1em rgba(0, 0, 0, 0.4), 0 0 .05em .1em inset rgba(255, 255, 255, 0.1);
  transform: scale(.975);
}

.glass-button-text {
  color: rgba(255, 255, 255, 0.95);
  text-shadow: 0 .25em .05em rgba(0, 0, 0, 0.4);
  transition: all var(--anim-time) var(--anim-ease);
  position: relative;
  display: block;
  select-none: none;
  letter-spacing: -0.01em;
}

.glass-button:hover .glass-button-text {
  color: #ffffff;
  text-shadow: .025em .025em .025em rgba(255, 255, 255, 0.2);
}

.glass-button-text:after {
  content: "";
  width: calc(100% - var(--border-width));
  height: calc(100% - var(--border-width));
  top: calc(0% + var(--border-width)/2);
  left: calc(0% + var(--border-width)/2);
  box-sizing: border-box;
  background: linear-gradient(var(--angle-2), transparent 0%, rgba(255, 255, 255, 0.45) 40% 50%, transparent 55%);
  z-index: 3;
  mix-blend-mode: screen;
  pointer-events: none;
  transition: background-position calc(var(--anim-time)*1.25) var(--anim-ease), --angle-2 calc(var(--anim-time)*1.25) var(--anim-ease);
  background-position: 0%;
  background-size: 200% 200%;
  border-radius: inherit;
  display: block;
  position: absolute;
  overflow: clip;
}

.glass-button:hover .glass-button-text:after {
  background-position: 25%;
}

.glass-button:active .glass-button-text:after {
  --angle-2: -15deg;
  background-position: 50% 15%;
}

.glass-button:after {
  content: "";
  z-index: 1;
  width: calc(100% + var(--border-width));
  height: calc(100% + var(--border-width));
  top: calc(0% - var(--border-width)/2);
  left: calc(0% - var(--border-width)/2);
  padding: var(--border-width);
  box-sizing: border-box;
  background: conic-gradient(from var(--angle-1) at 50% 50%, rgba(255, 255, 255, 0.5) 0%, transparent 5% 40%, rgba(255, 255, 255, 0.5) 50%, transparent 60% 95%, rgba(255, 255, 255, 0.5) 100%), linear-gradient(180deg, rgba(255, 255, 255, 0.1), rgba(255, 255, 255, 0.02));
  transition: all var(--anim-time) var(--anim-ease), --angle-1 .5s ease;
  box-shadow: inset 0 0 0 calc(var(--border-width)/2) rgba(255, 255, 255, 0.1);
  border-radius: inherit;
  position: absolute;
  -webkit-mask-image: linear-gradient(#000 0 0), linear-gradient(#000 0 0);
  mask-image: linear-gradient(#000 0, #000 0), linear-gradient(#000 0, #000 0);
  -webkit-mask-clip: content-box, border-box;
  mask-clip: content-box, border-box;
  -webkit-mask-composite: xor;
  mask-composite: exclude;
}

.glass-button:hover:after {
  --angle-1: -125deg;
}

.glass-button:active:after {
  --angle-1: -75deg;
}

.glass-button-wrap:has(.glass-button:hover) .glass-button-shadow {
  filter: blur(clamp(2px, .0625em, 6px));
}

.glass-button-wrap:has(.glass-button:hover) .glass-button-shadow:after {
  top: calc(var(--shadow-cutoff-fix) - .875em);
  opacity: 1;
}

.glass-button-wrap:has(.glass-button:active) .glass-button-shadow {
  filter: blur(clamp(2px, .125em, 12px));
}

.glass-button-wrap:has(.glass-button:active) .glass-button-shadow:after {
  top: calc(var(--shadow-cutoff-fix) - .5em);
  opacity: .75;
}

.glass-button-wrap:has(.glass-button:active) .glass-button-text {
  text-shadow: .025em .25em .05em rgba(0, 0, 0, 0.5);
}

.glass-button-wrap:has(.glass-button:active) .glass-button {
  box-shadow: inset 0 .125em .125em rgba(255, 255, 255, 0.1), inset 0 -.125em .125em rgba(0, 0, 0, 0.5), 0 .125em .125em -.125em rgba(0, 0, 0, 0.3), inset 0 .25em .05em rgba(255, 255, 255, 0.15);
}

@media (hover: none) and (pointer: coarse) {
  .glass-button:after,
  .glass-button:hover:after,
  .glass-button:active:after {
    --angle-1: -75deg;
  }
  .glass-button .glass-button-text:after,
  .glass-button:active .glass-button-text:after {
    --angle-2: -45deg;
  }
}
`;

export const GlassButton = React.forwardRef(
  ({ className = "", children, onClick, style = {}, size = "default", ...props }, ref) => {
    const sizePadding =
      size === "sm"
        ? "px-3.5 py-1.5 text-xs"
        : size === "lg"
        ? "px-7 py-3 text-sm"
        : "px-4 py-1.5 text-xs";

    return (
      <div className={cn("glass-button-wrap rounded-xl", className)}>
        <button
          ref={ref}
          type="button"
          onClick={onClick}
          style={style}
          className={cn("glass-button rounded-xl flex items-center justify-center font-bold tracking-wider uppercase", className)}
          {...props}
        >
          <span className={cn("glass-button-text", sizePadding)}>
            {children}
          </span>
        </button>
        <div className="glass-button-shadow rounded-xl" aria-hidden="true" />
      </div>
    );
  }
);

GlassButton.displayName = "GlassButton";

export default GlassButton;
