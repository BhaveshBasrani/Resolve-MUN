const fs = require('fs');

const typeformBlueCss = `/* ==========================================================================
   RESOLVE MUN 2.0 — TYPEFORM BLUE & OBSIDIAN DESIGN SYSTEM
   Clean, authentic, elegant, and minimal.
   Zero AI fluff, zero hallucinated sections, 100% genuine conference content.
   Colors: Obsidian Black (#08090d), Slate (#0f121a), Electric Blue (#2563eb / #3b82f6)
   Typography: Plus Jakarta Sans / Space Grotesk (Headings), Inter (Body)
   ========================================================================== */

:root {
  /* Surfaces */
  --black: #08090d;
  --bg: #08090d;
  --bg-elevated: #0e1118;
  --bg-card: #0f121a;
  --bg-card-hover: #141824;
  --bg-modal: #0d1017;
  
  /* Primary Typeform Blue Palette */
  --blue: #2563eb;
  --blue-bright: #3b82f6;
  --blue-light: #60a5fa;
  --blue-hover: #1d4ed8;
  --blue-tint: rgba(37, 99, 235, 0.12);
  --blue-glow: rgba(37, 99, 235, 0.28);
  --blue-border: rgba(59, 130, 246, 0.35);
  
  /* Borders */
  --border: rgba(255, 255, 255, 0.08);
  --border-hover: #3b82f6;
  --border-subtle: rgba(255, 255, 255, 0.05);
  --border-focus: #3b82f6;
  --border-light: rgba(255, 255, 255, 0.12);
  
  /* Text & Contrast */
  --white: #ffffff;
  --text-primary: #ffffff;
  --text-secondary: #cbd5e1;
  --text-muted: #94a3b8;
  
  /* Typography */
  --font-display: 'Plus Jakarta Sans', 'Space Grotesk', -apple-system, sans-serif;
  --font-body: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
  --font-mono: 'Space Mono', ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
  
  /* Radii (Typeform Pill & Rounded Surfaces) */
  --radius-xs: 6px;
  --radius-sm: 10px;
  --radius-md: 14px;
  --radius-lg: 20px;
  --radius-pill: 9999px;
  
  /* Transitions */
  --transition-fast: 0.18s cubic-bezier(0.16, 1, 0.3, 1);
  --transition-normal: 0.28s cubic-bezier(0.16, 1, 0.3, 1);
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
  line-height: 1.65;
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

.reveal {
  opacity: 1 !important;
  transform: none !important;
  visibility: visible !important;
}

.cursor-dot, .cursor-reticle, #loading-screen, #submitSpinner {
  display: none !important;
}

/* --------------------------------------------------------------------------
   NAVBAR
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
  background: rgba(8, 9, 13, 0.92);
  border-bottom: 1px solid var(--border);
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
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
  height: 32px;
  width: auto;
}

.nav-links {
  display: flex;
  align-items: center;
  gap: 32px;
  list-style: none;
}

.nav-links a {
  font-family: var(--font-mono);
  font-size: 0.82rem;
  letter-spacing: 0.06em;
  color: #94a3b8;
  text-transform: uppercase;
  transition: color var(--transition-fast);
}

.nav-links a:hover {
  color: var(--white);
}

.nav-cta {
  display: inline-flex;
  align-items: center;
  background: var(--blue);
  color: #ffffff !important;
  font-family: var(--font-display);
  font-weight: 700;
  font-size: 0.85rem;
  letter-spacing: 0.04em;
  text-transform: uppercase;
  padding: 10px 24px;
  border-radius: var(--radius-pill);
  box-shadow: 0 4px 14px var(--blue-glow);
  transition: all var(--transition-fast);
}

.nav-cta:hover {
  background: var(--blue-hover);
  transform: translateY(-1px);
  box-shadow: 0 6px 20px var(--blue-glow);
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
   BUTTONS (TYPEFORM PILL SHAPE)
   -------------------------------------------------------------------------- */
.btn-primary,
button.btn-primary,
a.btn-primary {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  background: var(--blue);
  color: #ffffff !important;
  font-family: var(--font-display);
  font-weight: 700;
  font-size: 0.95rem;
  letter-spacing: 0.04em;
  text-transform: uppercase;
  padding: 15px 32px;
  border-radius: var(--radius-pill);
  border: 1px solid var(--blue);
  box-shadow: 0 4px 18px var(--blue-glow);
  transition: all var(--transition-fast);
  text-decoration: none;
}

.btn-primary:hover {
  background: var(--blue-hover);
  border-color: var(--blue-hover);
  transform: translateY(-2px);
  box-shadow: 0 8px 25px var(--blue-glow);
  color: #ffffff !important;
}

.btn-secondary,
button.btn-secondary,
a.btn-secondary {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  background: rgba(255, 255, 255, 0.04);
  color: #ffffff !important;
  font-family: var(--font-display);
  font-weight: 700;
  font-size: 0.95rem;
  letter-spacing: 0.04em;
  text-transform: uppercase;
  padding: 15px 32px;
  border-radius: var(--radius-pill);
  border: 1px solid rgba(255, 255, 255, 0.15);
  transition: all var(--transition-fast);
  text-decoration: none;
}

.btn-secondary:hover {
  background: #ffffff;
  color: #08090d !important;
  border-color: #ffffff;
  transform: translateY(-2px);
}

.btn-matrix {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  background: var(--blue-tint);
  color: var(--blue-light);
  border: 1px solid var(--blue-border);
  padding: 10px 20px;
  border-radius: var(--radius-pill);
  font-family: var(--font-mono);
  font-size: 0.8rem;
  font-weight: 600;
  letter-spacing: 0.05em;
  text-transform: uppercase;
  margin-bottom: 24px;
  transition: all var(--transition-fast);
}

.btn-matrix:hover {
  background: rgba(37, 99, 235, 0.25);
  border-color: var(--blue-bright);
}

/* --------------------------------------------------------------------------
   HERO SECTION (CLEAN TYPEFORM STYLE)
   -------------------------------------------------------------------------- */
#hero {
  position: relative;
  min-height: 88vh;
  display: flex;
  flex-direction: column;
  justify-content: center;
  padding: 150px 0 70px;
  width: 92%;
  max-width: 1280px;
  margin: 0 auto;
}

.hero-bg, .hero-grid, .particles-canvas {
  display: none !important;
}

.hero-eyebrow {
  display: inline-flex;
  align-items: center;
  gap: 10px;
  font-family: var(--font-mono);
  font-size: 0.85rem;
  font-weight: 700;
  letter-spacing: 0.1em;
  color: var(--blue-light);
  background: var(--blue-tint);
  border: 1px solid var(--blue-border);
  padding: 6px 16px;
  border-radius: var(--radius-pill);
  text-transform: uppercase;
  margin-bottom: 24px;
  width: fit-content;
}

.hero-title {
  font-family: var(--font-display);
  font-size: clamp(3.4rem, 7.5vw, 6.8rem);
  font-weight: 900;
  line-height: 0.95;
  letter-spacing: -0.04em;
  text-transform: uppercase;
  color: #ffffff;
  margin-bottom: 20px;
}

.hero-title span.mun {
  color: var(--blue-bright);
  display: inline;
}

.hero-tagline {
  font-family: var(--font-body);
  font-size: 1.35rem;
  line-height: 1.6;
  color: var(--text-secondary);
  max-width: 720px;
  margin-bottom: 36px;
}

.hero-tagline strong {
  color: #ffffff;
}

.hero-actions {
  display: flex;
  align-items: center;
  gap: 18px;
  margin-bottom: 60px;
  flex-wrap: wrap;
}

/* 4-Box Metric Row */
.hero-meta {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 16px;
  width: 100%;
  border-top: 1px solid var(--border);
  padding-top: 36px;
}

.hero-meta-divider {
  display: none;
}

.hero-meta-item {
  background: var(--bg-card);
  border: 1px solid var(--border);
  border-radius: var(--radius-md);
  padding: 24px;
  display: flex;
  flex-direction: column;
  gap: 6px;
  transition: all var(--transition-fast);
}

.hero-meta-item:hover {
  border-color: var(--blue-border);
  transform: translateY(-2px);
}

.hero-meta-item .value {
  font-family: var(--font-display);
  font-size: 2.6rem;
  font-weight: 800;
  line-height: 1;
  color: #ffffff;
}

.hero-meta-item .value-suffix {
  color: var(--blue-bright);
  font-weight: 700;
}

.hero-meta-item .label {
  font-family: var(--font-mono);
  font-size: 0.78rem;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  color: var(--blue-light);
  font-weight: 700;
}

/* --------------------------------------------------------------------------
   COUNTDOWN TIMER BAR
   -------------------------------------------------------------------------- */
#countdown {
  width: 92%;
  max-width: 1280px;
  margin: 40px auto 90px;
  background: var(--bg-card);
  border: 1px solid var(--border);
  border-radius: var(--radius-md);
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
  color: #94a3b8;
  font-weight: 700;
  display: flex;
  align-items: center;
  gap: 8px;
}

.countdown-label::before {
  content: '●';
  color: var(--blue-bright);
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
  color: #94a3b8;
}

.countdown-sep {
  font-family: var(--font-mono);
  font-size: 1.5rem;
  font-weight: 700;
  color: var(--blue-bright);
}

/* --------------------------------------------------------------------------
   EDITORIAL LABELS & HEADINGS
   -------------------------------------------------------------------------- */
.section-label {
  font-family: var(--font-mono);
  font-size: 0.85rem;
  font-weight: 700;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  color: var(--blue-light);
  margin-bottom: 12px;
  display: flex;
  align-items: center;
  gap: 10px;
}

.section-label::before {
  content: '[';
  color: #475569;
}

.section-label::after {
  content: ']';
  color: #475569;
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
  color: var(--blue-bright);
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
  margin: 70px auto;
  width: 92%;
  max-width: 1280px;
}

/* --------------------------------------------------------------------------
   ABOUT SECTION
   -------------------------------------------------------------------------- */
#about {
  width: 92%;
  max-width: 1280px;
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
  background: var(--bg-card);
  border: 1px solid var(--border);
  border-radius: var(--radius-md);
  padding: 24px;
  display: flex;
  flex-direction: column;
  gap: 6px;
  transition: all var(--transition-fast);
}

.about-stat:hover {
  border-color: var(--blue-border);
  transform: translateY(-2px);
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
  color: var(--blue-light);
  font-weight: 700;
}

.stat-divider {
  display: none;
}

.emblem-wrapper {
  background: var(--bg-card);
  border: 1px solid var(--border);
  border-radius: var(--radius-md);
  padding: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.emblem-main {
  max-height: 160px;
  width: auto;
}

.logo-halo, .about-particles {
  display: none !important;
}

/* --------------------------------------------------------------------------
   SECRETARY GENERAL LETTER
   -------------------------------------------------------------------------- */
#letter {
  width: 92%;
  max-width: 1280px;
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
  background: var(--bg-card);
  border: 1px solid var(--border);
  border-radius: var(--radius-md);
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
  background: var(--blue);
  color: #ffffff;
  font-family: var(--font-display);
  font-weight: 800;
  font-size: 1rem;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: var(--radius-pill);
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
  color: #94a3b8;
  text-transform: uppercase;
}

/* --------------------------------------------------------------------------
   COMMITTEES (TYPEFORM GRID)
   -------------------------------------------------------------------------- */
#committees {
  width: 92%;
  max-width: 1280px;
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
  background: var(--bg-card);
  border: 1px solid var(--border);
  border-radius: var(--radius-md);
  padding: 32px;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  min-height: 260px;
  transition: all var(--transition-fast);
}

.committee-card:hover {
  border-color: var(--blue-bright);
  background: var(--bg-card-hover);
  transform: translateY(-4px);
  box-shadow: 0 8px 30px rgba(37, 99, 235, 0.15);
}

.committee-tag {
  font-family: var(--font-mono);
  font-size: 0.75rem;
  font-weight: 700;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: var(--blue-light) !important;
  margin-bottom: 16px;
  display: flex;
  align-items: center;
  gap: 6px;
}

.committee-tag::before {
  content: '■';
  font-size: 0.6rem;
  color: var(--blue-bright);
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
  border: 1px solid var(--border);
  padding: 6px 14px;
  border-radius: var(--radius-pill);
  width: fit-content;
  display: inline-block;
  background: rgba(255, 255, 255, 0.03);
}

/* --------------------------------------------------------------------------
   VENUE SECTION
   -------------------------------------------------------------------------- */
#venue {
  width: 92%;
  max-width: 1280px;
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
  border: 1px solid var(--border);
  border-radius: var(--radius-md);
  overflow: hidden;
  background: var(--bg-card);
  min-height: 280px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.venue-visual img {
  width: 100%;
  height: 100%;
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
  background: var(--bg-card);
  border: 1px solid var(--border);
  color: var(--white);
  padding: 8px 16px;
  border-radius: var(--radius-pill);
}

/* --------------------------------------------------------------------------
   SECRETARIAT CAROUSEL
   -------------------------------------------------------------------------- */
#secretariat {
  width: 92%;
  max-width: 1280px;
  margin: 0 auto;
  padding: 40px 0;
}

.sec-track {
  display: flex;
  gap: 20px;
  overflow-x: auto;
  padding: 20px 0;
  scrollbar-width: thin;
  scrollbar-color: var(--border) transparent;
}

.sec-card {
  flex: 0 0 240px;
  background: var(--bg-card);
  border: 1px solid var(--border);
  border-radius: var(--radius-md);
  padding: 24px;
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  transition: all var(--transition-fast);
}

.sec-card:hover {
  border-color: var(--blue-bright);
  transform: translateY(-2px);
}

.sec-avatar {
  width: 64px;
  height: 64px;
  background: #181d2c;
  border: 1px solid var(--border);
  color: #ffffff;
  font-family: var(--font-display);
  font-weight: 800;
  font-size: 1.2rem;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: var(--radius-pill);
  margin-bottom: 16px;
}

.sec-card--sg .sec-avatar,
.sec-card--dsg .sec-avatar,
.sec-card--dg .sec-avatar {
  background: var(--blue);
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
  color: var(--blue-light);
  text-transform: uppercase;
  font-weight: 600;
}

/* --------------------------------------------------------------------------
   PARTNERS & OC/EB APPLICATION SECTIONS
   -------------------------------------------------------------------------- */
#sponsors, #oc-applications, #eb-applications {
  width: 92%;
  max-width: 1280px;
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
  background: var(--bg-card);
  border: 1px solid var(--border);
  padding: 16px 36px;
  border-radius: var(--radius-pill);
  font-family: var(--font-mono);
  font-size: 0.85rem;
  font-weight: 700;
  color: #94a3b8;
  text-transform: uppercase;
}

.oc-layout, .eb-layout {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 40px;
  align-items: center;
}

.oc-card, .eb-card {
  background: var(--bg-card);
  border: 1px solid var(--border);
  border-radius: var(--radius-md);
  padding: 40px;
}

.oc-card-glow, .eb-card-glow {
  display: none !important;
}

.oc-icon, .eb-icon {
  width: 48px;
  height: 48px;
  color: var(--blue-bright);
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
  color: var(--blue-bright);
  font-weight: 700;
}

/* --------------------------------------------------------------------------
   CTA SECTION (#register)
   -------------------------------------------------------------------------- */
#register {
  width: 92%;
  max-width: 1280px;
  margin: 60px auto 40px;
  padding: 80px 40px;
  background: var(--bg-card);
  border: 1px solid var(--border);
  border-radius: var(--radius-lg);
  text-align: center;
}

.cta-inner {
  max-width: 760px;
  margin: 0 auto;
}

.cta-eyebrow {
  font-family: var(--font-mono);
  font-size: 0.85rem;
  font-weight: 700;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  color: var(--blue-light);
  margin-bottom: 16px;
}

.cta-title {
  font-family: var(--font-display);
  font-size: clamp(2.4rem, 4.5vw, 3.6rem);
  font-weight: 900;
  letter-spacing: -0.03em;
  line-height: 1.05;
  text-transform: uppercase;
  color: #ffffff;
  margin-bottom: 20px;
}

.cta-body {
  font-size: 1.1rem;
  line-height: 1.7;
  color: var(--text-secondary);
  margin-bottom: 36px;
}

.cta-actions {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 16px;
  flex-wrap: wrap;
}

/* --------------------------------------------------------------------------
   MODALS (CONVERSATIONAL TYPEFORM)
   -------------------------------------------------------------------------- */
.modal-overlay {
  position: fixed;
  inset: 0;
  z-index: 10000;
  background: rgba(5, 7, 12, 0.9);
  display: none;
  align-items: center;
  justify-content: center;
  padding: 20px;
  overflow-y: auto;
  backdrop-filter: blur(8px);
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
  background: var(--bg-modal);
  border: 1px solid var(--border-light);
  border-radius: var(--radius-lg);
  padding: 40px;
  max-height: 90vh;
  overflow-y: auto;
  box-shadow: 0 24px 64px rgba(0, 0, 0, 0.8);
}

.modal-close {
  position: absolute;
  top: 20px;
  right: 20px;
  background: none;
  border: 1px solid var(--border);
  color: #ffffff;
  width: 36px;
  height: 36px;
  border-radius: var(--radius-pill);
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all var(--transition-fast);
}

.modal-close:hover {
  border-color: var(--blue-bright);
  background: var(--blue);
  color: #ffffff;
}

.modal-progress-bar {
  width: 100%;
  height: 5px;
  background: #182032;
  border-radius: var(--radius-pill);
  margin-bottom: 24px;
  overflow: hidden;
}

.modal-progress-fill {
  height: 100%;
  background: linear-gradient(90deg, var(--blue), var(--blue-bright));
  border-radius: var(--radius-pill);
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
  color: var(--blue-light);
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
  color: #94a3b8;
  text-transform: uppercase;
}

.selection-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;
}

.selection-card {
  background: var(--bg-card);
  border: 1px solid var(--border);
  border-radius: var(--radius-md);
  padding: 24px;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  gap: 18px;
  transition: border-color var(--transition-fast);
}

.selection-card:hover {
  border-color: var(--blue-border);
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
  margin-bottom: 22px;
}

.form-group label {
  display: block;
  font-family: var(--font-mono);
  font-size: 0.78rem;
  font-weight: 700;
  letter-spacing: 0.06em;
  text-transform: uppercase;
  color: #cbd5e1;
  margin-bottom: 8px;
}

.form-group input,
.form-group select,
.form-group textarea {
  width: 100%;
  background: #111624;
  border: 1px solid #232b3f;
  color: #ffffff;
  font-family: var(--font-body);
  font-size: 0.95rem;
  padding: 14px 18px;
  border-radius: var(--radius-sm);
  outline: none;
  transition: border-color var(--transition-fast), box-shadow var(--transition-fast);
}

.form-group input:focus,
.form-group select:focus,
.form-group textarea:focus {
  border-color: var(--blue-bright);
  box-shadow: 0 0 0 3px var(--blue-tint);
}

.form-group select option {
  background: #111624;
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
  border: 1px solid var(--border);
  color: #ffffff;
  font-family: var(--font-display);
  font-weight: 700;
  font-size: 0.9rem;
  padding: 12px 24px;
  border-radius: var(--radius-pill);
  cursor: pointer;
  text-transform: uppercase;
  transition: all var(--transition-fast);
}

.btn-back:hover {
  background: #1c2336;
}

.btn-next,
.btn-full-width {
  background: var(--blue);
  border: none;
  color: #ffffff;
  font-family: var(--font-display);
  font-weight: 700;
  font-size: 0.9rem;
  padding: 12px 28px;
  border-radius: var(--radius-pill);
  cursor: pointer;
  text-transform: uppercase;
  letter-spacing: 0.04em;
  box-shadow: 0 4px 14px var(--blue-glow);
  transition: all var(--transition-fast);
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
  background: var(--blue-hover);
  box-shadow: 0 6px 20px var(--blue-glow);
}

/* Payment Card */
.payment-banner {
  background: #141b2c;
  border: 1px solid var(--blue-border);
  padding: 20px;
  border-radius: var(--radius-md);
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
  background: #101524;
  border: 1px solid var(--border);
  padding: 28px;
  border-radius: var(--radius-md);
  margin-bottom: 24px;
}

.qr-container {
  display: inline-block;
  background: #ffffff;
  padding: 12px;
  border-radius: var(--radius-sm);
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
  background: #161e32;
  border: 1px solid var(--border);
  padding: 8px 16px;
  border-radius: var(--radius-pill);
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
  color: var(--blue-bright);
  cursor: pointer;
  display: flex;
  align-items: center;
}

.file-upload-wrapper {
  display: flex;
  align-items: center;
  gap: 12px;
  background: #111624;
  border: 1px solid #232b3f;
  padding: 10px 16px;
  border-radius: var(--radius-sm);
  cursor: pointer;
}

.file-upload-btn {
  background: var(--blue);
  color: #ffffff;
  font-family: var(--font-mono);
  font-size: 0.75rem;
  font-weight: 700;
  text-transform: uppercase;
  padding: 6px 14px;
  border-radius: var(--radius-pill);
}

.file-name {
  font-size: 0.85rem;
  color: #94a3b8;
}

.file-upload-input {
  display: none;
}

.terms-confirmation {
  font-size: 0.8rem;
  color: #94a3b8;
  text-align: center;
  margin-top: 16px;
}

.terms-confirmation a {
  color: var(--blue-bright);
  text-decoration: underline;
}

/* --------------------------------------------------------------------------
   FOOTER
   -------------------------------------------------------------------------- */
footer {
  border-top: 1px solid var(--border);
  background: #06070a;
  padding: 60px 0 40px;
}

.footer-top {
  width: 92%;
  max-width: 1280px;
  margin: 0 auto;
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

.footer-logo-img {
  height: 38px !important;
  width: auto !important;
  max-width: 120px !important;
  margin-bottom: 14px;
}

.footer-brand p {
  font-size: 0.95rem;
  color: var(--text-secondary);
}

.footer-col h5 {
  font-family: var(--font-mono);
  font-size: 0.8rem;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  color: var(--blue-light);
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
  color: #94a3b8;
  transition: color var(--transition-fast);
}

.footer-col a:hover {
  color: #ffffff;
}

.footer-bottom {
  width: 92%;
  max-width: 1280px;
  margin: 0 auto;
  border-top: 1px solid var(--border-subtle);
  padding-top: 24px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 16px;
  font-family: var(--font-mono);
  font-size: 0.78rem;
  color: #64748b;
  text-transform: uppercase;
}

.footer-date-pill {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  background: #111624;
  border: 1px solid var(--border);
  padding: 6px 16px;
  border-radius: var(--radius-pill);
  color: #ffffff;
}

.pill-dot {
  width: 6px;
  height: 6px;
  background: var(--blue-bright);
  border-radius: 50%;
}

/* --------------------------------------------------------------------------
   RESPONSIVE DESIGN (TABLET & MOBILE)
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

fs.writeFileSync('app/globals.css', typeformBlueCss, 'utf8');
console.log('Successfully wrote pristine Typeform Blue & Black CSS to app/globals.css');
