const fs = require('fs');
const path = require('path');

// 1. Build the Flat Design CSS
const flatCss = `/* ==========================================================================
   RESOLVE MUN 2.0 — HIGH-CONTRAST FLAT DESIGN SYSTEM
   Inspired by RenderVoid / Editorial Brutalist Flat Aesthetic
   Colors: Deep Black (#0a0a0c), Stark White (#ffffff), Electric Red (#ff3333)
   Typography: Space Grotesk (Headings), Inter (Body), Space Mono (Technical Meta)
   ========================================================================== */

:root {
  /* Surfaces */
  --black: #0a0a0c;
  --bg: #0a0a0c;
  --bg-elevated: #111116;
  --surface-card: #121216;
  --surface-card-hover: #17171d;
  --surface-modal: #0e0e12;
  
  /* High Impact Flat Borders */
  --card-border: #24242c;
  --card-border-hover: #ff3333;
  --border-subtle: #1c1c22;
  --border-focus: #ff3333;
  --border-light: #33333d;
  
  /* Primary Flat Red / Scarlet Accent */
  --red: #ff3333;
  --red-hover: #e62020;
  --red-tint: rgba(255, 51, 51, 0.1);
  --red-border: rgba(255, 51, 51, 0.3);
  
  /* Text & Contrast */
  --white: #ffffff;
  --text-primary: #ffffff;
  --text-secondary: #d1d5db;
  --text-muted: #888894;
  --muted: #888894;
  
  /* Typography */
  --font-display: 'Space Grotesk', 'Plus Jakarta Sans', -apple-system, sans-serif;
  --font-body: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
  --font-mono: 'Space Mono', ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
  
  /* Radii (Sharp Flat Aesthetic) */
  --radius-xs: 4px;
  --radius-sm: 6px;
  --radius-md: 8px;
  --radius-lg: 12px;
  --radius-pill: 9999px;
  
  /* Transitions */
  --transition-fast: 0.15s ease;
  --transition-normal: 0.25s ease;
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
  background-color: var(--bg);
}

body {
  background: var(--bg);
  color: var(--text-primary);
  font-family: var(--font-body);
  font-size: 1rem;
  line-height: 1.6;
  font-weight: 400;
  overflow-x: hidden;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-rendering: optimizeLegibility;
}

button, a, input, select, textarea, label {
  touch-action: manipulation;
}

input, textarea {
  cursor: text !important;
}

button, a, select, [role="button"], .btn-primary, .btn-secondary, .nav-cta, .committee-card {
  cursor: pointer !important;
}

img, svg {
  display: block;
  max-width: 100%;
}

a {
  color: inherit;
  text-decoration: none;
}

/* --------------------------------------------------------------------------
   GLOBAL CONTAINER & GRID SYSTEM
   -------------------------------------------------------------------------- */
.container {
  width: 92%;
  max-width: 1360px;
  margin: 0 auto;
}

/* Reveal utility - default to visible for instant high performance */
.reveal {
  opacity: 1 !important;
  transform: none !important;
  visibility: visible !important;
}

/* --------------------------------------------------------------------------
   FLAT BUTTONS & CONTROLS
   -------------------------------------------------------------------------- */
.btn-primary,
button.btn-primary,
a.btn-primary {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  background: var(--red);
  color: #ffffff !important;
  font-family: var(--font-display);
  font-weight: 700;
  font-size: 0.95rem;
  letter-spacing: 0.04em;
  text-transform: uppercase;
  padding: 15px 32px;
  border-radius: var(--radius-xs);
  border: 1px solid var(--red);
  box-shadow: none;
  transition: background var(--transition-fast), border-color var(--transition-fast), transform var(--transition-fast);
  text-decoration: none;
}

.btn-primary:hover {
  background: var(--red-hover);
  border-color: var(--red-hover);
  transform: translateY(-2px);
  color: #ffffff !important;
}

.btn-secondary,
button.btn-secondary,
a.btn-secondary {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  background: transparent;
  color: #ffffff !important;
  font-family: var(--font-display);
  font-weight: 700;
  font-size: 0.95rem;
  letter-spacing: 0.04em;
  text-transform: uppercase;
  padding: 15px 32px;
  border-radius: var(--radius-xs);
  border: 1px solid #444450;
  transition: all var(--transition-fast);
  text-decoration: none;
}

.btn-secondary:hover {
  background: #ffffff;
  color: #0a0a0c !important;
  border-color: #ffffff;
  transform: translateY(-2px);
}

.btn-matrix {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  background: #181820;
  color: var(--white);
  border: 1px solid var(--card-border);
  padding: 10px 18px;
  border-radius: var(--radius-xs);
  font-family: var(--font-mono);
  font-size: 0.8rem;
  font-weight: 600;
  letter-spacing: 0.05em;
  text-transform: uppercase;
  margin-bottom: 24px;
  transition: all var(--transition-fast);
}

.btn-matrix:hover {
  border-color: var(--red);
  background: #20202a;
}

/* --------------------------------------------------------------------------
   NAVBAR (FLAT ARCHITECTURAL HEADER)
   -------------------------------------------------------------------------- */
#navbar {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  z-index: 999;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 18px 48px;
  background: rgba(10, 10, 12, 0.95);
  border-bottom: 1px solid var(--border-subtle);
  transition: background var(--transition-fast), padding var(--transition-fast);
}

.nav-logo {
  display: flex;
  align-items: center;
  gap: 12px;
  font-family: var(--font-display);
  font-weight: 800;
  font-size: 1.15rem;
  letter-spacing: 0.06em;
  color: var(--white);
  text-transform: uppercase;
}

.nav-logo-mark {
  height: 28px;
  width: auto;
}

.nav-links {
  display: flex;
  align-items: center;
  gap: 28px;
  list-style: none;
}

.nav-links a {
  font-family: var(--font-mono);
  font-size: 0.82rem;
  letter-spacing: 0.05em;
  color: #a0a0b0;
  text-transform: uppercase;
  transition: color var(--transition-fast);
}

.nav-links a:hover {
  color: var(--white);
}

.nav-cta {
  display: inline-flex;
  align-items: center;
  background: var(--red);
  color: #ffffff !important;
  font-family: var(--font-display);
  font-weight: 700;
  font-size: 0.85rem;
  letter-spacing: 0.05em;
  text-transform: uppercase;
  padding: 10px 22px;
  border-radius: var(--radius-xs);
  transition: background var(--transition-fast), transform var(--transition-fast);
}

.nav-cta:hover {
  background: var(--red-hover);
  transform: translateY(-1px);
}

.mobile-menu-btn {
  display: none;
  background: none;
  border: none;
  flex-direction: column;
  gap: 6px;
  padding: 4px;
}

.mobile-menu-btn span {
  display: block;
  width: 24px;
  height: 2px;
  background: #ffffff;
}

/* --------------------------------------------------------------------------
   HERO SECTION (FLAT EDITORIAL BRUTALIST)
   -------------------------------------------------------------------------- */
#hero {
  position: relative;
  min-height: 92vh;
  display: flex;
  flex-direction: column;
  justify-content: center;
  padding: 140px 0 80px;
  width: 92%;
  max-width: 1360px;
  margin: 0 auto;
}

.hero-bg, .hero-grid, .particles-canvas {
  display: none !important;
}

.hero-eyebrow {
  display: inline-flex;
  align-items: center;
  gap: 12px;
  font-family: var(--font-mono);
  font-size: 0.85rem;
  font-weight: 700;
  letter-spacing: 0.12em;
  color: #888894;
  text-transform: uppercase;
  margin-bottom: 20px;
}

.hero-eyebrow::before {
  content: '';
  display: inline-block;
  width: 8px;
  height: 8px;
  background: var(--red);
  border-radius: 50%;
}

.hero-title {
  font-family: var(--font-display);
  font-size: clamp(3.2rem, 7.5vw, 6.5rem);
  font-weight: 900;
  line-height: 0.95;
  letter-spacing: -0.04em;
  text-transform: uppercase;
  color: #ffffff;
  margin-bottom: 24px;
}

.hero-title span.mun {
  color: #ffffff;
  display: inline;
}

.hero-title span.mun::after {
  content: ' ↗';
  color: var(--red);
  font-weight: 700;
  font-size: 0.8em;
}

/* Flat Red Banner Box matching Image 2 "SIMPLE. CLEAN. IMPACTFUL." */
.hero-tagline {
  display: inline-flex !important;
  align-items: center;
  gap: 12px;
  background: var(--red);
  color: #ffffff !important;
  font-family: var(--font-mono);
  font-weight: 800;
  font-size: 0.92rem;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  padding: 8px 18px;
  border-radius: var(--radius-xs);
  margin-bottom: 28px;
  width: fit-content;
}

.hero-tagline strong {
  color: #ffffff !important;
}

.hero-description-flat {
  font-size: 1.25rem;
  line-height: 1.6;
  color: var(--text-secondary);
  max-width: 780px;
  margin-bottom: 40px;
}

.hero-actions {
  display: flex;
  align-items: center;
  gap: 18px;
  margin-bottom: 64px;
  flex-wrap: wrap;
}

/* Flat 4-Box Metric Row */
.hero-meta {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 16px;
  width: 100%;
  border-top: 1px solid var(--border-subtle);
  padding-top: 40px;
}

.hero-meta-divider {
  display: none;
}

.hero-meta-item {
  background: var(--surface-card);
  border: 1px solid var(--card-border);
  border-radius: var(--radius-sm);
  padding: 24px;
  display: flex;
  flex-direction: column;
  gap: 6px;
  transition: border-color var(--transition-fast);
}

.hero-meta-item:hover {
  border-color: var(--card-border-hover);
}

.hero-meta-item .value {
  font-family: var(--font-display);
  font-size: 2.5rem;
  font-weight: 800;
  line-height: 1;
  color: #ffffff;
}

.hero-meta-item .value-suffix {
  color: var(--red);
  font-weight: 700;
}

.hero-meta-item .label {
  font-family: var(--font-mono);
  font-size: 0.78rem;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  color: var(--red);
  font-weight: 700;
}

/* --------------------------------------------------------------------------
   COUNTDOWN TIMER BAR (FLAT GEOMETRIC)
   -------------------------------------------------------------------------- */
#countdown {
  width: 92%;
  max-width: 1360px;
  margin: 0 auto 100px;
  background: var(--surface-card);
  border: 1px solid var(--card-border);
  border-radius: var(--radius-sm);
  padding: 24px 36px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: 20px;
}

.countdown-label {
  font-family: var(--font-mono);
  font-size: 0.85rem;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  color: #888894;
  font-weight: 700;
  display: flex;
  align-items: center;
  gap: 8px;
}

.countdown-label::before {
  content: '●';
  color: var(--red);
}

.countdown-units-wrapper {
  display: flex;
  align-items: center;
  gap: 24px;
}

.countdown-unit {
  display: flex;
  align-items: baseline;
  gap: 6px;
}

.countdown-num {
  font-family: var(--font-mono);
  font-size: 1.8rem;
  font-weight: 700;
  color: #ffffff;
}

.countdown-unit-label {
  font-family: var(--font-mono);
  font-size: 0.75rem;
  letter-spacing: 0.06em;
  text-transform: uppercase;
  color: #888894;
}

.countdown-sep {
  font-family: var(--font-mono);
  font-size: 1.5rem;
  font-weight: 700;
  color: var(--red);
}

/* --------------------------------------------------------------------------
   SECTION LABELS & TITLES (EDITORIAL FLAT)
   -------------------------------------------------------------------------- */
.section-label {
  font-family: var(--font-mono);
  font-size: 0.85rem;
  font-weight: 700;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  color: var(--red);
  margin-bottom: 12px;
  display: flex;
  align-items: center;
  gap: 10px;
}

.section-label::before {
  content: '[';
  color: #555560;
}

.section-label::after {
  content: ']';
  color: #555560;
}

.section-title {
  font-family: var(--font-display);
  font-size: clamp(2.4rem, 4.5vw, 3.8rem);
  font-weight: 900;
  letter-spacing: -0.03em;
  line-height: 1.05;
  text-transform: uppercase;
  color: #ffffff;
  margin-bottom: 24px;
}

.section-title .title-accent {
  color: var(--red);
}

.section-body {
  font-size: 1.05rem;
  line-height: 1.7;
  color: var(--text-secondary);
  margin-bottom: 24px;
}

.title-line-divider,
.glow-line {
  height: 1px;
  background: var(--border-subtle);
  border: none;
  margin: 80px auto;
  width: 92%;
  max-width: 1360px;
}

/* --------------------------------------------------------------------------
   ABOUT SECTION (FLAT 4-PILLAR EDITORIAL)
   -------------------------------------------------------------------------- */
#about {
  width: 92%;
  max-width: 1360px;
  margin: 0 auto;
  padding: 40px 0;
}

.about-inner {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 60px;
  align-items: start;
}

.about-stat-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;
  margin-top: 24px;
}

.about-stat {
  background: var(--surface-card);
  border: 1px solid var(--card-border);
  border-radius: var(--radius-sm);
  padding: 24px;
  display: flex;
  flex-direction: column;
  gap: 6px;
  transition: border-color var(--transition-fast);
}

.about-stat:hover {
  border-color: var(--card-border-hover);
}

.about-stat .num {
  font-family: var(--font-display);
  font-size: 2.4rem;
  font-weight: 800;
  color: #ffffff;
  line-height: 1;
}

.about-stat .desc {
  font-family: var(--font-mono);
  font-size: 0.78rem;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  color: var(--red);
  font-weight: 700;
}

.stat-divider {
  display: none;
}

.emblem-wrapper {
  background: var(--surface-card);
  border: 1px solid var(--card-border);
  border-radius: var(--radius-sm);
  padding: 48px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.emblem-main {
  max-height: 200px;
  width: auto;
}

.logo-halo, .about-particles {
  display: none !important;
}

/* --------------------------------------------------------------------------
   SECRETARY GENERAL LETTER (FLAT EDITORIAL MANIFESTO)
   -------------------------------------------------------------------------- */
#letter {
  width: 92%;
  max-width: 1360px;
  margin: 0 auto;
  padding: 40px 0;
}

.letter-inner {
  max-width: 1000px;
  margin: 0 auto;
}

.letter-bg-glow {
  display: none !important;
}

.letter-container {
  background: var(--surface-card);
  border: 1px solid var(--card-border);
  border-radius: var(--radius-sm);
  padding: 48px;
  margin-top: 32px;
}

.letter-content p {
  font-size: 1.05rem;
  line-height: 1.8;
  color: var(--text-secondary);
  margin-bottom: 20px;
}

.letter-content strong {
  color: #ffffff;
  font-weight: 700;
}

.letter-signature {
  display: flex;
  align-items: center;
  gap: 18px;
  margin-top: 36px;
  padding-top: 24px;
  border-top: 1px solid var(--border-subtle);
}

.sig-avatar {
  width: 48px;
  height: 48px;
  background: var(--red);
  color: #ffffff;
  font-family: var(--font-display);
  font-weight: 800;
  font-size: 1rem;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: var(--radius-xs);
}

.sig-details h4 {
  font-family: var(--font-display);
  font-size: 1.1rem;
  font-weight: 700;
  color: #ffffff;
  text-transform: uppercase;
}

.sig-details span {
  font-family: var(--font-mono);
  font-size: 0.78rem;
  color: #888894;
  text-transform: uppercase;
}

/* --------------------------------------------------------------------------
   COMMITTEES (FLAT HIGH-CONTRAST GRID)
   -------------------------------------------------------------------------- */
#committees {
  width: 92%;
  max-width: 1360px;
  margin: 0 auto;
  padding: 40px 0;
}

.committees-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 20px;
  margin-top: 40px;
}

.committee-card {
  background: var(--surface-card);
  border: 1px solid var(--card-border);
  border-radius: var(--radius-sm);
  padding: 32px;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  min-height: 260px;
  transition: border-color var(--transition-fast), transform var(--transition-fast), background var(--transition-fast);
}

.committee-card:hover {
  border-color: var(--red);
  background: var(--surface-card-hover);
  transform: translateY(-4px);
}

.committee-tag {
  font-family: var(--font-mono);
  font-size: 0.75rem;
  font-weight: 700;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: var(--red) !important;
  margin-bottom: 16px;
  display: flex;
  align-items: center;
  gap: 6px;
}

.committee-tag::before {
  content: '■';
  font-size: 0.6rem;
}

.committee-name {
  font-family: var(--font-display);
  font-size: 1.8rem;
  font-weight: 800;
  letter-spacing: -0.02em;
  text-transform: uppercase;
  color: #ffffff;
  line-height: 1.1;
  margin-bottom: 12px;
}

.committee-topic {
  font-size: 0.95rem;
  line-height: 1.5;
  color: var(--text-secondary);
  margin-bottom: 24px;
}

.committee-coming {
  font-family: var(--font-mono);
  font-size: 0.75rem;
  letter-spacing: 0.06em;
  text-transform: uppercase;
  color: #ffffff !important;
  border: 1px solid var(--card-border);
  padding: 6px 12px;
  border-radius: var(--radius-xs);
  width: fit-content;
  display: inline-block;
}

.committee-card--special .committee-name {
  color: #ffffff;
}

/* --------------------------------------------------------------------------
   VENUE SECTION
   -------------------------------------------------------------------------- */
#venue {
  width: 92%;
  max-width: 1360px;
  margin: 0 auto;
  padding: 40px 0;
}

.venue-layout {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 40px;
  align-items: center;
  margin-top: 36px;
}

.venue-visual {
  border: 1px solid var(--card-border);
  border-radius: var(--radius-sm);
  overflow: hidden;
  background: var(--surface-card);
}

.venue-visual img {
  width: 100%;
  height: auto;
  object-fit: cover;
}

.venue-info h3 {
  font-family: var(--font-display);
  font-size: 1.8rem;
  font-weight: 800;
  text-transform: uppercase;
  color: #ffffff;
  margin-bottom: 16px;
}

.venue-info p {
  font-size: 1.05rem;
  line-height: 1.7;
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
  font-family: var(--font-mono);
  font-size: 0.78rem;
  font-weight: 600;
  text-transform: uppercase;
  background: var(--surface-card);
  border: 1px solid var(--card-border);
  color: var(--white);
  padding: 8px 14px;
  border-radius: var(--radius-xs);
}

/* --------------------------------------------------------------------------
   SECRETARIAT CAROUSEL (FLAT TILES)
   -------------------------------------------------------------------------- */
#secretariat {
  width: 92%;
  max-width: 1360px;
  margin: 0 auto;
  padding: 40px 0;
}

.sec-track {
  display: flex;
  gap: 20px;
  overflow-x: auto;
  padding: 20px 0;
  scrollbar-width: thin;
  scrollbar-color: var(--card-border) transparent;
}

.sec-card {
  flex: 0 0 240px;
  background: var(--surface-card);
  border: 1px solid var(--card-border);
  border-radius: var(--radius-sm);
  padding: 24px;
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  transition: border-color var(--transition-fast);
}

.sec-card:hover {
  border-color: var(--red);
}

.sec-avatar {
  width: 64px;
  height: 64px;
  background: #1c1c24;
  border: 1px solid var(--card-border);
  color: #ffffff;
  font-family: var(--font-display);
  font-weight: 800;
  font-size: 1.2rem;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: var(--radius-xs);
  margin-bottom: 16px;
}

.sec-card--sg .sec-avatar,
.sec-card--dsg .sec-avatar,
.sec-card--dg .sec-avatar {
  background: var(--red);
  color: #ffffff;
}

.sec-name {
  font-family: var(--font-display);
  font-size: 1.1rem;
  font-weight: 700;
  color: #ffffff;
  margin-bottom: 4px;
  text-transform: uppercase;
}

.sec-role {
  font-family: var(--font-mono);
  font-size: 0.75rem;
  color: var(--red);
  text-transform: uppercase;
  font-weight: 600;
}

/* --------------------------------------------------------------------------
   PARTNERS & OC/EB APPLICATION SECTIONS
   -------------------------------------------------------------------------- */
#sponsors, #oc-applications, #eb-applications {
  width: 92%;
  max-width: 1360px;
  margin: 0 auto;
  padding: 40px 0;
}

.sponsors-row {
  display: flex;
  flex-wrap: wrap;
  gap: 16px;
  justify-content: center;
}

.sponsor-slot {
  background: var(--surface-card);
  border: 1px solid var(--card-border);
  padding: 16px 36px;
  border-radius: var(--radius-xs);
  font-family: var(--font-mono);
  font-size: 0.85rem;
  font-weight: 700;
  color: #888894;
  text-transform: uppercase;
}

.oc-layout, .eb-layout {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 40px;
  align-items: center;
}

.oc-card, .eb-card {
  background: var(--surface-card);
  border: 1px solid var(--card-border);
  border-radius: var(--radius-sm);
  padding: 40px;
}

.oc-card-glow, .eb-card-glow {
  display: none !important;
}

.oc-icon, .eb-icon {
  width: 48px;
  height: 48px;
  color: var(--red);
  margin-bottom: 20px;
}

.oc-card-title, .eb-card-title {
  font-family: var(--font-display);
  font-size: 1.8rem;
  font-weight: 800;
  text-transform: uppercase;
  color: #ffffff;
  margin-bottom: 12px;
}

.oc-perks, .eb-perks {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
  margin-top: 24px;
}

.oc-perk, .eb-perk {
  font-family: var(--font-mono);
  font-size: 0.8rem;
  color: var(--text-secondary);
  display: flex;
  align-items: center;
  gap: 8px;
}

.oc-perk::before, .eb-perk::before {
  content: '→';
  color: var(--red);
  font-weight: 700;
}

/* --------------------------------------------------------------------------
   MODALS (FLAT HIGH-CONTRAST CONVERSATIONAL REGISTRATION)
   -------------------------------------------------------------------------- */
.modal-overlay {
  position: fixed;
  inset: 0;
  z-index: 10000;
  background: rgba(5, 5, 8, 0.88);
  display: none;
  align-items: center;
  justify-content: center;
  padding: 20px;
  overflow-y: auto;
}

.modal-overlay.active {
  display: flex;
}

.modal-particles {
  display: none !important;
}

.modal-content {
  position: relative;
  width: 100%;
  max-width: 680px;
  background: var(--surface-modal);
  border: 1px solid var(--border-light);
  border-radius: var(--radius-sm);
  padding: 40px;
  max-height: 90vh;
  overflow-y: auto;
  box-shadow: 0 20px 50px rgba(0, 0, 0, 0.8);
}

.modal-close {
  position: absolute;
  top: 20px;
  right: 20px;
  background: none;
  border: 1px solid var(--card-border);
  color: #ffffff;
  width: 36px;
  height: 36px;
  border-radius: var(--radius-xs);
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all var(--transition-fast);
}

.modal-close:hover {
  border-color: var(--red);
  background: var(--red);
  color: #ffffff;
}

.modal-progress-bar {
  width: 100%;
  height: 4px;
  background: #202028;
  border-radius: 2px;
  margin-bottom: 24px;
  overflow: hidden;
}

.modal-progress-fill {
  height: 100%;
  background: var(--red);
  transition: width 0.3s ease;
}

.modal-header {
  margin-bottom: 28px;
}

.step-indicator {
  font-family: var(--font-mono);
  font-size: 0.78rem;
  font-weight: 700;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: var(--red);
  margin-bottom: 8px;
  display: block;
}

.modal-title {
  font-family: var(--font-display);
  font-size: 2rem;
  font-weight: 900;
  letter-spacing: -0.02em;
  text-transform: uppercase;
  color: #ffffff;
}

.modal-subtitle {
  font-family: var(--font-mono);
  font-size: 0.82rem;
  color: #888894;
  text-transform: uppercase;
}

/* Selection Modal Cards */
.selection-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;
}

.selection-card {
  background: var(--surface-card);
  border: 1px solid var(--card-border);
  border-radius: var(--radius-xs);
  padding: 24px;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  gap: 18px;
}

.selection-card h3 {
  font-family: var(--font-display);
  font-size: 1.3rem;
  font-weight: 800;
  text-transform: uppercase;
  color: #ffffff;
  margin-bottom: 6px;
}

.selection-card p {
  font-size: 0.9rem;
  color: var(--text-secondary);
}

.selection-card .btn-primary {
  width: 100%;
  padding: 12px;
  font-size: 0.85rem;
}

/* Form Styles */
.form-step {
  display: none;
}

.form-step.active {
  display: block;
}

.form-group {
  margin-bottom: 20px;
}

.form-group label {
  display: block;
  font-family: var(--font-mono);
  font-size: 0.78rem;
  font-weight: 700;
  letter-spacing: 0.06em;
  text-transform: uppercase;
  color: #a0a0b0;
  margin-bottom: 8px;
}

.form-group input,
.form-group select,
.form-group textarea {
  width: 100%;
  background: #16161c;
  border: 1px solid #33333d;
  color: #ffffff;
  font-family: var(--font-body);
  font-size: 0.95rem;
  padding: 14px 16px;
  border-radius: var(--radius-xs);
  outline: none;
  transition: border-color var(--transition-fast);
}

.form-group input:focus,
.form-group select:focus,
.form-group textarea:focus {
  border-color: var(--red);
}

.form-group select option {
  background: #16161c;
  color: #ffffff;
}

.form-actions {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  margin-top: 28px;
}

.btn-back {
  background: transparent;
  border: 1px solid var(--card-border);
  color: #ffffff;
  font-family: var(--font-display);
  font-weight: 700;
  font-size: 0.9rem;
  padding: 12px 24px;
  border-radius: var(--radius-xs);
  cursor: pointer;
  text-transform: uppercase;
  transition: all var(--transition-fast);
}

.btn-back:hover {
  background: #202028;
}

.btn-next,
.btn-full-width {
  background: var(--red);
  border: none;
  color: #ffffff;
  font-family: var(--font-display);
  font-weight: 700;
  font-size: 0.9rem;
  padding: 12px 28px;
  border-radius: var(--radius-xs);
  cursor: pointer;
  text-transform: uppercase;
  letter-spacing: 0.04em;
  transition: background var(--transition-fast);
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
}

.btn-full-width {
  width: 100%;
  padding: 16px;
}

.btn-next:hover {
  background: var(--red-hover);
}

/* Payment Card in Form Step 3 */
.payment-banner {
  background: #181822;
  border: 1px solid var(--card-border);
  padding: 20px;
  border-radius: var(--radius-xs);
  text-align: center;
  margin-bottom: 24px;
}

.payment-banner h3 {
  font-family: var(--font-display);
  font-size: 1.6rem;
  font-weight: 800;
  color: #ffffff;
}

.payment-card {
  background: #14141a;
  border: 1px solid var(--card-border);
  padding: 28px;
  border-radius: var(--radius-xs);
  margin-bottom: 24px;
}

.qr-container {
  display: inline-block;
  background: #ffffff;
  padding: 12px;
  border-radius: var(--radius-xs);
  margin-bottom: 16px;
}

.qr-container img {
  width: 180px;
  height: 180px;
}

.upi-box {
  display: inline-flex;
  align-items: center;
  gap: 10px;
  background: #1c1c26;
  border: 1px solid var(--card-border);
  padding: 8px 16px;
  border-radius: var(--radius-xs);
  margin-bottom: 12px;
}

.upi-box span {
  font-family: var(--font-mono);
  font-size: 0.85rem;
  color: #ffffff;
}

.copy-btn, .refresh-qr-btn {
  background: none;
  border: none;
  color: var(--red);
  cursor: pointer;
  display: flex;
  align-items: center;
}

.file-upload-wrapper {
  display: flex;
  align-items: center;
  gap: 12px;
  background: #16161c;
  border: 1px solid #33333d;
  padding: 10px 16px;
  border-radius: var(--radius-xs);
  cursor: pointer;
}

.file-upload-btn {
  background: var(--red);
  color: #ffffff;
  font-family: var(--font-mono);
  font-size: 0.75rem;
  font-weight: 700;
  text-transform: uppercase;
  padding: 6px 12px;
  border-radius: 2px;
}

.file-name {
  font-size: 0.85rem;
  color: #888894;
}

.file-upload-input {
  display: none;
}

.terms-confirmation {
  font-size: 0.8rem;
  color: #888894;
  text-align: center;
  margin-top: 16px;
}

.terms-confirmation a {
  color: var(--red);
  text-decoration: underline;
}

/* --------------------------------------------------------------------------
   FOOTER (EDITORIAL FLAT BAR)
   -------------------------------------------------------------------------- */
footer {
  border-top: 1px solid var(--border-subtle);
  background: #08080a;
  padding: 60px 0 40px;
}

.footer-inner {
  width: 92%;
  max-width: 1360px;
  margin: 0 auto;
}

.footer-top {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  flex-wrap: wrap;
  gap: 40px;
  margin-bottom: 48px;
}

.footer-brand {
  max-width: 380px;
}

.footer-brand h4 {
  font-family: var(--font-display);
  font-size: 1.5rem;
  font-weight: 900;
  color: #ffffff;
  text-transform: uppercase;
  margin-bottom: 8px;
}

.footer-brand p {
  font-size: 0.95rem;
  color: var(--text-secondary);
}

.footer-links-group {
  display: flex;
  gap: 48px;
  flex-wrap: wrap;
}

.footer-col h5 {
  font-family: var(--font-mono);
  font-size: 0.8rem;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  color: var(--red);
  margin-bottom: 16px;
}

.footer-col ul {
  list-style: none;
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.footer-col a {
  font-size: 0.9rem;
  color: #a0a0b0;
  transition: color var(--transition-fast);
}

.footer-col a:hover {
  color: #ffffff;
}

.footer-bottom {
  border-top: 1px solid var(--border-subtle);
  padding-top: 24px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 16px;
  font-family: var(--font-mono);
  font-size: 0.78rem;
  color: #666675;
  text-transform: uppercase;
}

/* --------------------------------------------------------------------------
   RESPONSIVE DESIGN (MOBILE & TABLET)
   -------------------------------------------------------------------------- */
@media (max-width: 1024px) {
  .hero-meta {
    grid-template-columns: repeat(2, 1fr);
  }
  .committees-grid {
    grid-template-columns: repeat(2, 1fr);
  }
  .about-inner, .venue-layout, .oc-layout, .eb-layout {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 768px) {
  #navbar {
    padding: 14px 20px;
  }
  .nav-links {
    display: none;
  }
  .mobile-menu-btn {
    display: flex;
  }
  .hero-meta {
    grid-template-columns: 1fr 1fr;
    gap: 10px;
  }
  .hero-meta-item {
    padding: 16px;
  }
  .hero-meta-item .value {
    font-size: 1.8rem;
  }
  .committees-grid {
    grid-template-columns: 1fr;
  }
  .selection-grid {
    grid-template-columns: 1fr;
  }
  .modal-content {
    padding: 24px;
  }
  .countdown-units-wrapper {
    gap: 12px;
  }
  .countdown-num {
    font-size: 1.4rem;
  }
}
`;

fs.writeFileSync(path.join(__dirname, '../app/globals.css'), flatCss, 'utf8');
console.log('Successfully wrote flat design to app/globals.css');
