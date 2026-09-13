const fs = require('fs');

const css = `/* ==========================================================================
   RESOLVE MUN 2.0 — MODERN SAAS DESIGN SYSTEM (TYPEFORM INSPIRED)
   Clean, interactive, elegant, and minimal.
   ========================================================================== */

:root {
  /* Surface & Base */
  --black: #08090d;
  --black-elevated: #0e1017;
  --deep: #0e1017;
  --surface-base: #08090d;
  --surface-card: rgba(255, 255, 255, 0.03);
  --surface-card-hover: rgba(255, 255, 255, 0.06);
  --surface-elevated: #12141e;
  --surface-glass: rgba(14, 16, 24, 0.85);
  
  /* Borders */
  --card-border: rgba(255, 255, 255, 0.08);
  --card-border-hover: rgba(139, 92, 246, 0.4);
  --border-subtle: rgba(255, 255, 255, 0.06);
  --border-focus: #7c3aed;
  
  /* Typeform / Modern Violet & Indigo Palette */
  --purple: #7c3aed;
  --purple-hover: #8b5cf6;
  --purple-light: #c4b5fd;
  --purple-glow: rgba(124, 58, 237, 0.25);
  --magenta: #6366f1;
  --gold: #7c3aed;
  --gold-light: #a78bfa;
  --gold-shadow: rgba(124, 58, 237, 0.3);
  --accent-gradient: linear-gradient(135deg, #a855f7 0%, #7c3aed 50%, #6366f1 100%);
  --accent-gradient-hover: linear-gradient(135deg, #b76bf8 0%, #8b5cf6 50%, #7073f3 100%);

  /* Text & Typography */
  --white: #ffffff;
  --text-primary: #f8fafc;
  --text-secondary: #94a3b8;
  --text-muted: #64748b;
  --muted: #64748b;
  
  /* Status Colors */
  --success: #10b981;
  --warning: #f59e0b;
  --error: #ef4444;

  /* Typography Stacks */
  --font-sans: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  --font-heading: 'Plus Jakarta Sans', 'Inter', -apple-system, sans-serif;
  
  /* Radii */
  --radius-xs: 6px;
  --radius-sm: 10px;
  --radius-md: 16px;
  --radius-lg: 24px;
  --radius-full: 9999px;
  
  /* Transitions */
  --ease-spring: cubic-bezier(0.16, 1, 0.3, 1);
  --duration-fast: 180ms;
  --duration-normal: 300ms;
  --duration-smooth: 500ms;
}

/* --------------------------------------------------------------------------
   RESET & CORE BOX MODEL
   -------------------------------------------------------------------------- */
*, *::before, *::after {
  box-sizing: border-box;
  margin: 0;
  padding: 0;
}

html {
  scroll-behavior: smooth;
  font-size: 16px;
  -webkit-text-size-adjust: 100%;
}

body {
  background: var(--black);
  color: var(--text-primary);
  font-family: var(--font-sans);
  font-size: 1rem;
  line-height: 1.65;
  font-weight: 400;
  overflow-x: hidden;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-rendering: optimizeLegibility;
  position: relative;
}

/* Native, crisp cursor behavior across interactive elements */
button, a, input, select, textarea, label {
  touch-action: manipulation;
}

input, textarea {
  cursor: text !important;
}

button, a, select, [role="button"] {
  cursor: pointer !important;
}

/* Headings: Clean, modern, high-contrast grotesque sans */
h1, h2, h3, h4, h5, h6 {
  font-family: var(--font-heading);
  color: var(--white);
  font-weight: 700;
  letter-spacing: -0.03em;
  line-height: 1.15;
}

p {
  color: var(--text-secondary);
  margin-bottom: 1.25rem;
  font-size: 1.05rem;
  line-height: 1.7;
}

p:last-child {
  margin-bottom: 0;
}

a {
  color: var(--purple-light);
  text-decoration: none;
  transition: color var(--duration-fast) ease;
}

a:hover {
  color: var(--white);
}

strong, b {
  font-weight: 600;
  color: var(--white);
}

/* --------------------------------------------------------------------------
   REVEAL ANIMATIONS (SMOOTH & GUARANTEED VISIBILITY)
   -------------------------------------------------------------------------- */
.reveal {
  opacity: 1;
  transform: translateY(0);
  transition: opacity 0.7s var(--ease-spring), transform 0.7s var(--ease-spring);
}

.reveal.visible {
  opacity: 1 !important;
  transform: translateY(0) scale(1) !important;
}

.reveal-delay-1 { transition-delay: 0.1s; }
.reveal-delay-2 { transition-delay: 0.18s; }
.reveal-delay-3 { transition-delay: 0.26s; }
.reveal-delay-4 { transition-delay: 0.34s; }

/* --------------------------------------------------------------------------
   PILL BUTTONS & INTERACTIVE ELEMENTS
   -------------------------------------------------------------------------- */
.btn-primary {
  font-family: var(--font-sans);
  font-size: 0.95rem;
  font-weight: 600;
  letter-spacing: -0.01em;
  color: #ffffff;
  background: var(--purple);
  padding: 14px 34px;
  border-radius: var(--radius-full);
  border: 1px solid rgba(255, 255, 255, 0.18);
  outline: none;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  position: relative;
  overflow: hidden;
  transition: all var(--duration-normal) var(--ease-spring);
  box-shadow: 0 8px 24px -4px rgba(124, 58, 237, 0.45);
}

.btn-primary:hover {
  background: var(--purple-hover);
  transform: translateY(-2px);
  box-shadow: 0 14px 32px -4px rgba(124, 58, 237, 0.6);
}

.btn-primary:active {
  transform: translateY(0) scale(0.98);
}

.btn-primary:disabled {
  opacity: 0.5;
  cursor: not-allowed !important;
  transform: none !important;
  box-shadow: none !important;
}

.btn-secondary {
  font-family: var(--font-sans);
  font-size: 0.95rem;
  font-weight: 500;
  letter-spacing: -0.01em;
  color: var(--text-primary);
  background: rgba(255, 255, 255, 0.04);
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
  border: 1px solid rgba(255, 255, 255, 0.12);
  padding: 14px 34px;
  border-radius: var(--radius-full);
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  transition: all var(--duration-normal) var(--ease-spring);
}

.btn-secondary:hover {
  background: rgba(255, 255, 255, 0.08);
  border-color: rgba(255, 255, 255, 0.25);
  color: var(--white);
  transform: translateY(-2px);
}

.btn-secondary:active {
  transform: translateY(0) scale(0.98);
}

.btn-full-width {
  width: 100%;
}

.btn-next {
  font-family: var(--font-sans);
  font-size: 0.95rem;
  font-weight: 600;
  background: var(--purple);
  color: #ffffff;
  border: none;
  border-radius: var(--radius-full);
  padding: 14px 28px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  transition: all var(--duration-normal) var(--ease-spring);
  box-shadow: 0 6px 20px -2px rgba(124, 58, 237, 0.4);
}

.btn-next:hover {
  background: var(--purple-hover);
  transform: translateY(-2px);
  box-shadow: 0 10px 24px -2px rgba(124, 58, 237, 0.55);
}

.btn-back {
  font-family: var(--font-sans);
  font-size: 0.95rem;
  font-weight: 500;
  background: transparent;
  color: var(--text-secondary);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: var(--radius-full);
  padding: 14px 24px;
  transition: all var(--duration-normal) ease;
}

.btn-back:hover {
  color: var(--white);
  background: rgba(255, 255, 255, 0.05);
  border-color: rgba(255, 255, 255, 0.2);
}

.btn-matrix {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  font-size: 0.85rem;
  font-weight: 500;
  color: var(--purple-light);
  background: rgba(124, 58, 237, 0.08);
  border: 1px solid rgba(124, 58, 237, 0.2);
  padding: 8px 16px;
  border-radius: var(--radius-full);
  margin-bottom: 20px;
  transition: all var(--duration-fast) ease;
}

.btn-matrix:hover {
  background: rgba(124, 58, 237, 0.16);
  color: #ffffff;
}

/* --------------------------------------------------------------------------
   NAVIGATION BAR
   -------------------------------------------------------------------------- */
nav {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  z-index: 1000;
  padding: 18px 48px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  background: rgba(8, 9, 13, 0.7);
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  border-bottom: 1px solid var(--border-subtle);
  transition: all var(--duration-normal) ease;
}

nav.scrolled {
  padding: 14px 48px;
  background: rgba(8, 9, 13, 0.9);
  border-bottom-color: rgba(255, 255, 255, 0.08);
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3);
}

.nav-logo {
  display: flex;
  align-items: center;
  gap: 12px;
  font-family: var(--font-heading);
  font-size: 1.15rem;
  font-weight: 800;
  letter-spacing: -0.02em;
  color: var(--white);
  text-decoration: none;
}

.nav-logo-mark {
  width: 28px;
  height: 28px;
  object-fit: contain;
}

.nav-links {
  display: flex;
  align-items: center;
  gap: 32px;
  list-style: none;
}

.nav-links a {
  font-family: var(--font-sans);
  font-size: 0.9rem;
  font-weight: 500;
  color: var(--text-secondary);
  text-decoration: none;
  transition: color var(--duration-fast) ease;
  position: relative;
  padding: 4px 0;
}

.nav-links a:hover {
  color: var(--white);
}

.nav-cta {
  font-family: var(--font-sans);
  font-size: 0.9rem;
  font-weight: 600;
  color: #ffffff !important;
  background: var(--purple);
  padding: 10px 24px;
  border-radius: var(--radius-full);
  text-decoration: none;
  transition: all var(--duration-normal) var(--ease-spring);
  box-shadow: 0 4px 14px rgba(124, 58, 237, 0.35);
}

.nav-cta:hover {
  background: var(--purple-hover);
  transform: translateY(-1px);
  box-shadow: 0 8px 20px rgba(124, 58, 237, 0.5);
}

/* Mobile Menu Button */
.mobile-menu-btn {
  display: none;
  background: transparent;
  border: none;
  cursor: pointer;
  padding: 8px;
  flex-direction: column;
  gap: 5px;
  z-index: 1001;
}

.mobile-menu-btn span {
  display: block;
  width: 24px;
  height: 2px;
  background: var(--white);
  border-radius: 2px;
  transition: all 0.3s ease;
}

.mobile-menu-btn.active span:nth-child(1) {
  transform: translateY(7px) rotate(45deg);
}

.mobile-menu-btn.active span:nth-child(2) {
  opacity: 0;
}

.mobile-menu-btn.active span:nth-child(3) {
  transform: translateY(-7px) rotate(-45deg);
}

/* --------------------------------------------------------------------------
   HERO SECTION
   -------------------------------------------------------------------------- */
#hero {
  position: relative;
  min-height: 92vh;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-align: center;
  padding: 140px 24px 80px;
  overflow: hidden;
}

.hero-bg {
  position: absolute;
  inset: 0;
  background: radial-gradient(circle at 50% 30%, rgba(124, 58, 237, 0.15) 0%, transparent 60%);
  pointer-events: none;
  z-index: 0;
}

.hero-grid {
  position: absolute;
  inset: 0;
  background-image: linear-gradient(rgba(255, 255, 255, 0.02) 1px, transparent 1px),
                    linear-gradient(90deg, rgba(255, 255, 255, 0.02) 1px, transparent 1px);
  background-size: 64px 64px;
  pointer-events: none;
  z-index: 0;
  opacity: 0.5;
  mask-image: radial-gradient(circle at center, black 40%, transparent 80%);
  -webkit-mask-image: radial-gradient(circle at center, black 40%, transparent 80%);
}

.particles-canvas {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
  z-index: 1;
}

.hero-eyebrow {
  position: relative;
  z-index: 2;
  font-family: var(--font-sans);
  font-size: 0.82rem;
  font-weight: 600;
  letter-spacing: 0.04em;
  color: var(--purple-light);
  background: rgba(124, 58, 237, 0.1);
  border: 1px solid rgba(124, 58, 237, 0.25);
  padding: 6px 18px;
  border-radius: var(--radius-full);
  margin-bottom: 28px;
  display: inline-flex;
  align-items: center;
  gap: 8px;
}

.hero-title {
  position: relative;
  z-index: 2;
  font-family: var(--font-heading);
  font-size: clamp(3.6rem, 8vw, 6.8rem);
  font-weight: 800;
  line-height: 1.05;
  letter-spacing: -0.035em;
  color: var(--white);
  max-width: 960px;
  margin: 0 auto;
}

.hero-title span {
  display: block;
}

.hero-title .mun {
  display: block;
  background: var(--accent-gradient);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  filter: drop-shadow(0 0 40px rgba(124, 58, 237, 0.4));
}

.hero-tagline {
  position: relative;
  z-index: 2;
  font-family: var(--font-sans);
  font-size: clamp(1.1rem, 2vw, 1.35rem);
  color: var(--text-secondary);
  max-width: 620px;
  margin: 24px auto 0;
  font-weight: 400;
  line-height: 1.6;
  letter-spacing: -0.01em;
  text-transform: none;
}

.hero-tagline strong {
  color: var(--white);
  font-weight: 600;
}

.hero-meta {
  position: relative;
  z-index: 2;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 40px;
  margin-top: 48px;
  background: rgba(255, 255, 255, 0.02);
  border: 1px solid var(--card-border);
  padding: 16px 36px;
  border-radius: var(--radius-full);
}

.hero-meta-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 2px;
}

.hero-meta-item .label {
  font-size: 0.72rem;
  font-weight: 500;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  color: var(--text-muted);
}

.hero-meta-item .value {
  font-family: var(--font-heading);
  font-size: 1.35rem;
  font-weight: 700;
  color: var(--white);
  letter-spacing: -0.02em;
}

.hero-meta-divider {
  width: 1px;
  height: 28px;
  background: rgba(255, 255, 255, 0.1);
}

.hero-actions {
  position: relative;
  z-index: 2;
  display: flex;
  gap: 16px;
  margin-top: 40px;
  justify-content: center;
  flex-wrap: wrap;
}

/* --------------------------------------------------------------------------
   COUNTDOWN BAR
   -------------------------------------------------------------------------- */
#countdown {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 24px;
  padding: 32px 24px;
  background: rgba(255, 255, 255, 0.015);
  border-top: 1px solid var(--border-subtle);
  border-bottom: 1px solid var(--border-subtle);
  flex-wrap: wrap;
}

.countdown-label {
  font-family: var(--font-sans);
  font-size: 0.85rem;
  font-weight: 600;
  letter-spacing: 0.04em;
  text-transform: uppercase;
  color: var(--purple-light);
}

.countdown-units-wrapper {
  display: flex;
  align-items: center;
  gap: 16px;
}

.countdown-unit {
  text-align: center;
  min-width: 64px;
}

.countdown-num {
  font-family: var(--font-heading);
  font-size: 2.2rem;
  font-weight: 800;
  line-height: 1;
  color: var(--white);
  display: block;
}

.countdown-unit-label {
  font-family: var(--font-sans);
  font-size: 0.72rem;
  font-weight: 500;
  text-transform: uppercase;
  color: var(--text-muted);
  margin-top: 4px;
  display: block;
}

.countdown-sep {
  font-family: var(--font-heading);
  font-size: 1.8rem;
  font-weight: 700;
  color: rgba(255, 255, 255, 0.2);
  margin-bottom: 12px;
}

/* --------------------------------------------------------------------------
   SECTIONS GENERAL
   -------------------------------------------------------------------------- */
section {
  position: relative;
  padding: 120px 48px;
  max-width: 1280px;
  margin: 0 auto;
}

.section-label {
  font-family: var(--font-sans);
  font-size: 0.78rem;
  font-weight: 600;
  letter-spacing: 0.06em;
  text-transform: uppercase;
  color: var(--purple-light);
  background: rgba(124, 58, 237, 0.08);
  border: 1px solid rgba(124, 58, 237, 0.2);
  padding: 6px 16px;
  border-radius: var(--radius-full);
  margin-bottom: 18px;
  display: inline-flex;
  align-items: center;
  gap: 8px;
  width: fit-content;
}

.section-title {
  font-family: var(--font-heading);
  font-size: clamp(2.4rem, 5vw, 3.8rem);
  font-weight: 800;
  line-height: 1.1;
  letter-spacing: -0.03em;
  color: var(--white);
  margin-bottom: 24px;
}

.section-body {
  font-family: var(--font-sans);
  font-size: 1.08rem;
  line-height: 1.75;
  color: var(--text-secondary);
  font-weight: 400;
}

.glow-line {
  height: 1px;
  background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.08), transparent);
  width: 100%;
  max-width: 1280px;
  margin: 0 auto;
}

/* --------------------------------------------------------------------------
   ABOUT SECTION
   -------------------------------------------------------------------------- */
#about {
  padding: 140px 48px;
}

.about-inner {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 80px;
  align-items: center;
}

.about-visual {
  width: 100%;
}

.emblem-wrapper {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 40px;
}

.emblem-main {
  width: 180px;
  height: 180px;
  object-fit: contain;
  filter: drop-shadow(0 0 35px rgba(124, 58, 237, 0.3));
}

.about-stat-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 16px;
}

.about-stat {
  background: var(--surface-card);
  border: 1px solid var(--card-border);
  border-radius: var(--radius-md);
  padding: 24px;
  text-align: left;
  transition: all var(--duration-normal) var(--ease-spring);
}

.about-stat:hover {
  background: var(--surface-card-hover);
  border-color: rgba(139, 92, 246, 0.35);
  transform: translateY(-2px);
}

.about-stat .num {
  font-family: var(--font-heading);
  font-size: 2.2rem;
  font-weight: 800;
  color: var(--white);
  line-height: 1;
  letter-spacing: -0.02em;
}

.about-stat .desc {
  font-size: 0.88rem;
  color: var(--text-secondary);
  margin-top: 6px;
  display: block;
}

.stat-divider {
  display: none;
}

/* --------------------------------------------------------------------------
   SECRETARY GENERAL'S LETTER
   -------------------------------------------------------------------------- */
#letter {
  padding: 140px 48px;
}

.letter-container {
  background: var(--surface-card);
  border: 1px solid var(--card-border);
  border-radius: var(--radius-lg);
  padding: 60px 48px;
  margin-top: 32px;
  position: relative;
  overflow: hidden;
}

.letter-content {
  font-size: 1.08rem;
  line-height: 1.8;
  color: #cbd5e1;
}

.letter-content p {
  color: #cbd5e1;
  margin-bottom: 1.4rem;
}

.letter-content strong {
  color: #ffffff;
}

.letter-signature {
  display: flex;
  align-items: center;
  gap: 16px;
  margin-top: 40px;
  padding-top: 30px;
  border-top: 1px solid rgba(255, 255, 255, 0.08);
}

.sig-avatar {
  width: 48px;
  height: 48px;
  border-radius: var(--radius-full);
  background: var(--accent-gradient);
  color: #ffffff;
  display: flex;
  align-items: center;
  justify-content: center;
  font-family: var(--font-heading);
  font-weight: 700;
  font-size: 1rem;
}

.sig-details h4 {
  font-size: 1.05rem;
  font-weight: 700;
  color: var(--white);
  margin-bottom: 2px;
}

.sig-details span {
  font-size: 0.85rem;
  color: var(--text-secondary);
}

/* --------------------------------------------------------------------------
   COMMITTEES SECTION
   -------------------------------------------------------------------------- */
#committees {
  padding: 140px 48px;
  scroll-margin-top: 100px;
}

.committees-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 20px;
  margin-top: 48px;
}

.committee-card {
  background: var(--surface-card);
  border: 1px solid var(--card-border);
  border-radius: var(--radius-md);
  padding: 32px 24px;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  min-height: 240px;
  transition: all var(--duration-normal) var(--ease-spring);
  position: relative;
  overflow: hidden;
  cursor: pointer;
}

.committee-card:hover {
  background: var(--surface-card-hover);
  border-color: var(--card-border-hover);
  transform: translateY(-4px);
  box-shadow: 0 16px 36px -8px rgba(124, 58, 237, 0.18);
}

.committee-tag {
  font-family: var(--font-sans);
  font-size: 0.75rem;
  font-weight: 600;
  letter-spacing: 0.04em;
  text-transform: uppercase;
  color: var(--purple-light);
  background: rgba(124, 58, 237, 0.08);
  border: 1px solid rgba(124, 58, 237, 0.18);
  padding: 4px 12px;
  border-radius: var(--radius-full);
  width: fit-content;
  margin-bottom: 16px;
}

.committee-name {
  font-family: var(--font-heading);
  font-size: 1.35rem;
  font-weight: 700;
  color: var(--white);
  letter-spacing: -0.02em;
  margin-bottom: 8px;
}

.committee-topic {
  font-size: 0.92rem;
  line-height: 1.6;
  color: var(--text-secondary);
  flex-grow: 1;
}

.committee-coming {
  font-size: 0.78rem;
  font-weight: 500;
  color: var(--text-muted);
  margin-top: 16px;
  display: inline-flex;
  align-items: center;
  gap: 6px;
}

.committee-card--special {
  border-color: rgba(99, 102, 241, 0.2);
}

.committee-card--special:hover {
  border-color: rgba(99, 102, 241, 0.5);
  box-shadow: 0 16px 36px -8px rgba(99, 102, 241, 0.2);
}

/* Committee Prompt (Background Guides Toast) */
.committee-prompt {
  position: fixed;
  bottom: 32px;
  left: 50%;
  transform: translateX(-50%) translateY(100px);
  opacity: 0;
  z-index: 999;
  background: #10121c;
  border: 1px solid var(--purple);
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.6), 0 0 20px rgba(124, 58, 237, 0.3);
  padding: 16px 28px;
  border-radius: var(--radius-full);
  display: flex;
  align-items: center;
  gap: 12px;
  transition: all 0.4s var(--ease-spring);
  pointer-events: none;
}

.committee-prompt.active {
  transform: translateX(-50%) translateY(0);
  opacity: 1;
  pointer-events: auto;
}

.committee-prompt__text {
  font-family: var(--font-heading);
  font-size: 0.95rem;
  font-weight: 700;
  color: var(--white);
}

.committee-prompt__subtext {
  font-family: var(--font-sans);
  font-size: 0.85rem;
  font-weight: 400;
  color: var(--purple-light);
  margin-left: 6px;
}

/* --------------------------------------------------------------------------
   VENUE SECTION
   -------------------------------------------------------------------------- */
#venue {
  padding: 140px 48px;
}

.venue-layout {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 60px;
  align-items: center;
  margin-top: 40px;
}

.venue-visual {
  width: 100%;
  border-radius: var(--radius-lg);
  overflow: hidden;
  border: 1px solid var(--card-border);
  background: var(--surface-card);
}

.venue-visual img {
  width: 100%;
  height: auto;
  display: block;
}

.venue-info h3 {
  font-size: 1.8rem;
  font-weight: 800;
  color: var(--white);
  margin-bottom: 16px;
}

.venue-info p {
  color: var(--text-secondary);
  margin-bottom: 16px;
}

.venue-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  margin-top: 24px;
}

.venue-tag {
  font-size: 0.82rem;
  font-weight: 500;
  color: var(--text-primary);
  background: rgba(255, 255, 255, 0.04);
  border: 1px solid var(--card-border);
  padding: 6px 16px;
  border-radius: var(--radius-full);
}

/* --------------------------------------------------------------------------
   SECRETARIAT CAROUSEL
   -------------------------------------------------------------------------- */
#secretariat {
  padding: 140px 48px;
  max-width: 100%;
  overflow: hidden;
}

.sec-header {
  max-width: 1280px;
  margin: 0 auto;
  text-align: center;
}

.sec-carousel-container {
  margin-top: 56px;
  width: 100%;
  overflow: hidden;
  position: relative;
  cursor: grab;
}

.sec-carousel-container.active {
  cursor: grabbing;
}

.sec-track {
  display: flex;
  gap: 24px;
  width: max-content;
  will-change: transform;
}

.sec-card {
  width: 300px;
  background: var(--surface-card);
  border: 1px solid var(--card-border);
  border-radius: var(--radius-md);
  padding: 36px 24px;
  text-align: center;
  flex-shrink: 0;
  transition: all var(--duration-normal) var(--ease-spring);
}

.sec-card:hover {
  background: var(--surface-card-hover);
  border-color: rgba(139, 92, 246, 0.35);
  transform: translateY(-4px);
}

.sec-avatar-wrap {
  width: 96px;
  height: 96px;
  border-radius: var(--radius-full);
  margin: 0 auto 20px;
  background: var(--accent-gradient);
  display: flex;
  align-items: center;
  justify-content: center;
  font-family: var(--font-heading);
  font-weight: 700;
  font-size: 1.6rem;
  color: #ffffff;
  box-shadow: 0 10px 25px -4px rgba(124, 58, 237, 0.3);
}

.sec-name {
  font-family: var(--font-heading);
  font-size: 1.2rem;
  font-weight: 700;
  color: var(--white);
  margin-bottom: 4px;
}

.sec-role {
  font-size: 0.85rem;
  font-weight: 500;
  color: var(--purple-light);
}

/* --------------------------------------------------------------------------
   OC & EB CALL-TO-ACTION CARDS
   -------------------------------------------------------------------------- */
.oc-layout, .eb-layout {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 48px;
  align-items: center;
  background: var(--surface-card);
  border: 1px solid var(--card-border);
  border-radius: var(--radius-lg);
  padding: 56px 48px;
  margin-top: 48px;
}

.oc-text-content h3, .eb-text-content h3 {
  font-size: 2rem;
  font-weight: 800;
  color: var(--white);
  margin-bottom: 12px;
}

.oc-card, .eb-card {
  background: rgba(255, 255, 255, 0.02);
  border: 1px solid var(--card-border);
  border-radius: var(--radius-md);
  padding: 32px;
}

/* --------------------------------------------------------------------------
   SPONSORS & PARTNERS
   -------------------------------------------------------------------------- */
.sponsors-inner {
  text-align: center;
  padding: 100px 24px;
}

.sponsors-grid {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 36px;
  flex-wrap: wrap;
  margin-top: 40px;
}

/* --------------------------------------------------------------------------
   MODALS & TYPEFORM-INSPIRED CONVERSATIONAL FORMS
   -------------------------------------------------------------------------- */
.modal-overlay {
  position: fixed;
  inset: 0;
  z-index: 2000;
  background: rgba(4, 5, 8, 0.82);
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 24px;
  opacity: 0;
  pointer-events: none;
  transition: opacity var(--duration-normal) ease;
}

.modal-overlay.active {
  opacity: 1;
  pointer-events: auto;
}

.modal-content {
  width: 100%;
  max-width: 640px;
  background: #0d0f18;
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: var(--radius-lg);
  padding: 48px 40px;
  position: relative;
  max-height: 88vh;
  overflow-y: auto;
  box-shadow: 0 30px 80px -10px rgba(0, 0, 0, 0.9), 0 0 0 1px rgba(255, 255, 255, 0.05);
  transform: translateY(24px) scale(0.97);
  transition: transform var(--duration-normal) var(--ease-spring);
}

.modal-overlay.active .modal-content {
  transform: translateY(0) scale(1);
}

.modal-close {
  position: absolute;
  top: 24px;
  right: 24px;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid var(--card-border);
  color: var(--text-secondary);
  width: 36px;
  height: 36px;
  border-radius: var(--radius-full);
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all var(--duration-fast) ease;
  z-index: 10;
}

.modal-close:hover {
  background: rgba(255, 255, 255, 0.1);
  color: var(--white);
  transform: scale(1.05);
}

.modal-header {
  margin-bottom: 32px;
}

.modal-title {
  font-family: var(--font-heading);
  font-size: 1.8rem;
  font-weight: 800;
  color: var(--white);
  letter-spacing: -0.02em;
}

.modal-subtitle {
  font-size: 0.9rem;
  font-weight: 500;
  color: var(--purple-light);
  display: block;
  margin-top: 4px;
}

/* Step Management */
.form-step {
  display: none;
}

.form-step.active {
  display: block;
  animation: stepFadeIn 0.35s ease;
}

@keyframes stepFadeIn {
  from { opacity: 0; transform: translateY(8px); }
  to { opacity: 1; transform: translateY(0); }
}

.form-group {
  margin-bottom: 22px;
}

.form-group label {
  display: block;
  font-family: var(--font-sans);
  font-size: 0.88rem;
  font-weight: 500;
  color: #cbd5e1;
  margin-bottom: 8px;
}

.form-group input,
.form-group select,
.form-group textarea {
  width: 100%;
  height: 50px;
  background: rgba(255, 255, 255, 0.04);
  border: 1px solid rgba(255, 255, 255, 0.12);
  border-radius: var(--radius-sm);
  padding: 0 16px;
  color: #ffffff;
  font-family: var(--font-sans);
  font-size: 0.95rem;
  transition: all 0.2s ease;
  outline: none;
}

.form-group textarea {
  height: auto;
  min-height: 96px;
  padding: 14px 16px;
  resize: vertical;
}

.form-group select {
  appearance: none;
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16' viewBox='0 0 24 24' fill='none' stroke='white' stroke-width='2'%3E%3Cpath d='m6 9 6 6 6-6'/%3E%3C/svg%3E");
  background-repeat: no-repeat;
  background-position: right 16px center;
  padding-right: 42px;
}

.form-group select option {
  background: #12141e;
  color: #ffffff;
}

.form-group input:focus,
.form-group select:focus,
.form-group textarea:focus {
  border-color: var(--purple);
  box-shadow: 0 0 0 3px rgba(124, 58, 237, 0.25);
  background: rgba(255, 255, 255, 0.07);
}

.form-actions {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: 12px;
  margin-top: 32px;
}

/* Pathway Selection Grid (selectionModal) */
.selection-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 16px;
  margin-top: 24px;
}

.selection-card {
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid var(--card-border);
  border-radius: var(--radius-md);
  padding: 24px;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  min-height: 180px;
  transition: all var(--duration-normal) var(--ease-spring);
}

.selection-card:hover {
  background: rgba(255, 255, 255, 0.06);
  border-color: var(--card-border-hover);
  transform: translateY(-2px);
  box-shadow: 0 12px 28px -6px rgba(124, 58, 237, 0.2);
}

.selection-card h3 {
  font-size: 1.25rem;
  font-weight: 700;
  color: var(--white);
  margin-bottom: 6px;
}

.selection-card p {
  font-size: 0.88rem;
  color: var(--text-secondary);
  margin-bottom: 16px;
}

/* Payment Card */
.payment-banner {
  background: var(--accent-gradient);
  padding: 20px 24px;
  border-radius: var(--radius-md);
  text-align: center;
  margin-bottom: 24px;
}

.payment-banner h3 {
  font-size: 1.25rem;
  font-weight: 700;
  color: #ffffff;
}

.payment-card {
  background: rgba(255, 255, 255, 0.02);
  border: 1px solid var(--card-border);
  border-radius: var(--radius-md);
  padding: 28px;
}

.qr-container {
  display: flex;
  justify-content: center;
  margin-bottom: 16px;
}

.qr-container img {
  width: 180px;
  height: 180px;
  border-radius: 12px;
  background: #ffffff;
  padding: 8px;
}

.upi-box {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid var(--card-border);
  padding: 8px 16px;
  border-radius: var(--radius-full);
  margin-bottom: 16px;
}

.upi-box span {
  font-family: monospace;
  font-size: 0.9rem;
  color: var(--white);
}

.copy-btn, .refresh-qr-btn {
  background: transparent;
  border: none;
  color: var(--purple-light);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 4px;
  transition: all var(--duration-fast) ease;
}

.copy-btn:hover, .refresh-qr-btn:hover {
  color: var(--white);
  transform: scale(1.1);
}

.file-upload-wrapper {
  display: flex;
  align-items: center;
  gap: 12px;
  background: rgba(255, 255, 255, 0.04);
  border: 1px dashed rgba(255, 255, 255, 0.2);
  border-radius: var(--radius-sm);
  padding: 14px 18px;
  cursor: pointer;
  transition: all 0.2s ease;
}

.file-upload-wrapper:hover {
  background: rgba(255, 255, 255, 0.07);
  border-color: var(--purple);
}

.file-upload-btn {
  font-size: 0.85rem;
  font-weight: 600;
  background: var(--purple);
  color: #ffffff;
  padding: 6px 14px;
  border-radius: var(--radius-full);
}

.file-name {
  font-size: 0.88rem;
  color: var(--text-secondary);
}

.file-upload-input {
  display: none;
}

.terms-confirmation {
  font-size: 0.82rem;
  color: var(--text-muted);
  text-align: center;
  margin-top: 16px;
}

.terms-confirmation a {
  color: var(--purple-light);
  text-decoration: underline;
}

/* Committee Detail Modal */
.comm-modal-content {
  max-width: 540px;
  text-align: center;
}

.comm-modal-inner {
  padding: 16px 0;
}

.comm-modal-icon {
  font-size: 0.8rem;
  font-weight: 600;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: var(--purple-light);
  background: rgba(124, 58, 237, 0.1);
  border: 1px solid rgba(124, 58, 237, 0.25);
  padding: 4px 14px;
  border-radius: var(--radius-full);
  display: inline-block;
  margin-bottom: 20px;
}

.comm-modal-title {
  font-size: 2.2rem;
  font-weight: 800;
  color: var(--white);
  margin-bottom: 8px;
}

.comm-modal-agenda {
  font-size: 0.95rem;
  font-weight: 500;
  color: var(--text-secondary);
  display: block;
  margin-bottom: 24px;
}

.comm-modal-text {
  font-size: 1rem;
  line-height: 1.7;
  color: #cbd5e1;
  margin-bottom: 28px;
  text-align: left;
}

/* Terms Modal */
.terms-modal-content {
  max-width: 780px;
}

.terms-body {
  margin-top: 24px;
  max-height: 60vh;
  overflow-y: auto;
  padding-right: 12px;
}

.terms-body h3 {
  font-size: 1.2rem;
  font-weight: 700;
  color: var(--white);
  margin: 24px 0 8px;
}

.terms-body p, .terms-body ul {
  font-size: 0.95rem;
  color: #cbd5e1;
  margin-bottom: 12px;
}

.terms-body ul {
  padding-left: 20px;
}

/* --------------------------------------------------------------------------
   LOADING SCREEN & SPINNERS
   -------------------------------------------------------------------------- */
#loading-screen {
  position: fixed;
  inset: 0;
  z-index: 99999;
  background: #08090d;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  transition: opacity 0.6s ease, visibility 0.6s ease;
}

#loading-screen.hidden {
  opacity: 0;
  visibility: hidden;
  pointer-events: none;
}

.loader-logo {
  width: 72px;
  height: 72px;
  margin-bottom: 24px;
  animation: logoPulse 2s ease infinite;
}

@keyframes logoPulse {
  0%, 100% { transform: scale(1); opacity: 0.9; }
  50% { transform: scale(1.06); opacity: 1; }
}

.loader-bar-container {
  width: 180px;
  height: 3px;
  background: rgba(255, 255, 255, 0.08);
  border-radius: var(--radius-full);
  overflow: hidden;
  margin-bottom: 12px;
}

.loader-bar-fill {
  width: 100%;
  height: 100%;
  background: var(--accent-gradient);
  transform: translateX(-100%);
  animation: loaderProgress 1.4s ease infinite;
}

@keyframes loaderProgress {
  0% { transform: translateX(-100%); }
  50% { transform: translateX(0%); }
  100% { transform: translateX(100%); }
}

.loader-text {
  font-size: 0.8rem;
  font-weight: 500;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: var(--text-muted);
}

/* Custom Alert */
#custom-alert-container {
  position: fixed;
  top: 24px;
  right: 24px;
  z-index: 99999;
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.custom-alert {
  background: #141724;
  border: 1px solid var(--card-border);
  color: var(--white);
  padding: 14px 24px;
  border-radius: var(--radius-sm);
  font-size: 0.9rem;
  font-weight: 500;
  box-shadow: 0 16px 36px rgba(0,0,0,0.5);
  animation: alertIn 0.3s var(--ease-spring);
}

.custom-alert.custom-alert-success {
  border-color: rgba(16, 185, 129, 0.4);
  color: #10b981;
}

.custom-alert.fade-out {
  opacity: 0;
  transform: translateY(-8px);
  transition: all 0.4s ease;
}

@keyframes alertIn {
  from { opacity: 0; transform: translateY(-12px); }
  to { opacity: 1; transform: translateY(0); }
}

/* --------------------------------------------------------------------------
   FOOTER
   -------------------------------------------------------------------------- */
footer {
  border-top: 1px solid var(--border-subtle);
  padding: 80px 48px 40px;
  background: #050609;
}

.footer-top {
  display: grid;
  grid-template-columns: 2fr repeat(3, 1fr);
  gap: 48px;
  max-width: 1280px;
  margin: 0 auto 60px;
}

.footer-brand h4 {
  font-size: 1.3rem;
  font-weight: 800;
  color: var(--white);
  margin-bottom: 12px;
}

.footer-brand p {
  color: var(--text-secondary);
  font-size: 0.92rem;
  max-width: 320px;
}

.footer-col h5 {
  font-size: 0.85rem;
  font-weight: 600;
  letter-spacing: 0.06em;
  text-transform: uppercase;
  color: var(--purple-light);
  margin-bottom: 20px;
}

.footer-col ul {
  list-style: none;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.footer-col a {
  color: var(--text-secondary);
  font-size: 0.9rem;
  transition: color var(--duration-fast) ease;
}

.footer-col a:hover {
  color: var(--white);
}

.footer-bottom {
  border-top: 1px solid var(--border-subtle);
  padding-top: 32px;
  max-width: 1280px;
  margin: 0 auto;
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: 16px;
}

.footer-copy {
  font-size: 0.85rem;
  color: var(--text-muted);
}

.footer-tagline {
  font-size: 0.95rem;
  font-weight: 600;
  background: var(--accent-gradient);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
}

/* --------------------------------------------------------------------------
   RESPONSIVE DESIGN (1024px, 768px, 480px)
   -------------------------------------------------------------------------- */
@media (max-width: 1024px) {
  nav {
    padding: 16px 24px;
  }
  
  .nav-links {
    display: none;
  }
  
  .nav-links.mobile-active {
    display: flex !important;
    position: fixed;
    top: 0; right: 0; bottom: 0;
    width: 280px;
    height: 100vh;
    background: #0d0f18;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    gap: 24px;
    z-index: 1000;
    border-left: 1px solid var(--card-border);
    box-shadow: -10px 0 30px rgba(0, 0, 0, 0.5);
  }
  
  .mobile-menu-btn {
    display: flex;
  }
  
  section {
    padding: 90px 24px;
  }
  
  .about-inner {
    grid-template-columns: 1fr;
    gap: 50px;
  }
  
  .venue-layout {
    grid-template-columns: 1fr;
    gap: 40px;
  }
  
  .oc-layout, .eb-layout {
    grid-template-columns: 1fr;
    gap: 32px;
    padding: 36px 24px;
  }
  
  .footer-top {
    grid-template-columns: 1fr 1fr;
    gap: 36px;
  }
}

@media (max-width: 768px) {
  #hero {
    padding: 120px 20px 60px;
    min-height: auto;
  }
  
  .hero-meta {
    gap: 20px;
    padding: 12px 24px;
    flex-wrap: wrap;
  }
  
  .hero-meta-divider {
    display: none;
  }
  
  .hero-actions {
    flex-direction: column;
    width: 100%;
    max-width: 320px;
  }
  
  .hero-actions .btn-primary,
  .hero-actions .btn-secondary {
    width: 100%;
  }
  
  .selection-grid {
    grid-template-columns: 1fr;
  }
  
  .modal-content {
    padding: 36px 24px;
  }
  
  .form-group[style*="grid-template-columns"] {
    grid-template-columns: 1fr !important;
    gap: 12px !important;
  }
  
  .letter-container {
    padding: 36px 24px;
  }
  
  .footer-top {
    grid-template-columns: 1fr;
  }
  
  .footer-bottom {
    flex-direction: column;
    text-align: center;
  }
}
`;

fs.writeFileSync('app/globals.css', css, 'utf8');
console.log('Successfully wrote modern Typeform-inspired design system to app/globals.css!');
