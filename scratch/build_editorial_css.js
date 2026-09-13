const fs = require('fs');

const editorialCss = `/* ==========================================================================
   RESOLVE MUN 2.0 — EDITORIAL DIPLOMATIC SUMMIT DESIGN SYSTEM
   A serious international diplomatic event combined with an editorial magazine aesthetic.
   Deep Obsidian (#07080c), Diplomatic Cobalt Blue (#2563eb / #3b82f6), Stark White (#ffffff)
   Typography: Space Grotesk / Plus Jakarta Sans (Headings), Inter (Editorial Body)
   ========================================================================== */

:root {
  /* Surfaces */
  --bg-deep: #060709;
  --bg-main: #07080c;
  --bg-surface: #0e1017;
  --bg-surface-elevated: #131722;
  --bg-modal: #0b0d14;
  
  /* Diplomatic Cobalt & Blue Accents */
  --blue-primary: #2563eb;
  --blue-bright: #3b82f6;
  --blue-sky: #60a5fa;
  --blue-hover: #1d4ed8;
  --blue-tint: rgba(37, 99, 235, 0.12);
  --blue-glow: rgba(37, 99, 235, 0.28);
  --blue-border: rgba(59, 130, 246, 0.3);
  
  /* Architectural Borders */
  --border: rgba(255, 255, 255, 0.09);
  --border-subtle: rgba(255, 255, 255, 0.05);
  --border-focus: #3b82f6;
  --border-light: rgba(255, 255, 255, 0.15);
  
  /* High-Contrast Editorial Text */
  --text-white: #ffffff;
  --text-primary: #f8fafc;
  --text-secondary: #cbd5e1;
  --text-muted: #94a3b8;
  
  /* Typography */
  --font-display: 'Space Grotesk', 'Plus Jakarta Sans', -apple-system, sans-serif;
  --font-serif: 'Crimson Pro', Georgia, serif;
  --font-body: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
  --font-mono: 'Space Mono', ui-monospace, SFMono-Regular, monospace;
  
  /* Radii */
  --radius-xs: 4px;
  --radius-sm: 8px;
  --radius-md: 14px;
  --radius-lg: 24px;
  --radius-pill: 9999px;
  
  /* Transitions */
  --ease-spring: cubic-bezier(0.16, 1, 0.3, 1);
  --duration-fast: 0.18s;
  --duration-smooth: 0.35s;
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
  background-color: var(--bg-main);
}

body {
  background: var(--bg-main);
  color: var(--text-primary);
  font-family: var(--font-body);
  font-size: 1.05rem;
  line-height: 1.7;
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
   EDITORIAL NAVBAR
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
  padding: 22px 60px;
  background: rgba(7, 8, 12, 0.92);
  border-bottom: 1px solid var(--border);
  backdrop-filter: blur(14px);
  -webkit-backdrop-filter: blur(14px);
  transition: all var(--duration-smooth) var(--ease-spring);
}

.nav-logo {
  display: flex;
  align-items: center;
  gap: 14px;
  font-family: var(--font-display);
  font-weight: 800;
  font-size: 1.2rem;
  letter-spacing: 0.05em;
  color: var(--text-white);
  text-transform: uppercase;
}

.nav-logo-mark {
  height: 34px;
  width: auto;
}

.nav-links {
  display: flex;
  align-items: center;
  gap: 36px;
  list-style: none;
}

.nav-links a {
  font-family: var(--font-body);
  font-size: 0.92rem;
  font-weight: 500;
  color: var(--text-muted);
  transition: color var(--duration-fast);
}

.nav-links a:hover {
  color: var(--text-white);
}

.nav-cta {
  display: inline-flex;
  align-items: center;
  background: var(--blue-primary);
  color: #ffffff !important;
  font-family: var(--font-display);
  font-weight: 700;
  font-size: 0.88rem;
  letter-spacing: 0.03em;
  padding: 12px 28px;
  border-radius: var(--radius-pill);
  box-shadow: 0 4px 18px var(--blue-glow);
  transition: all var(--duration-fast) var(--ease-spring);
}

.nav-cta:hover {
  background: var(--blue-hover);
  transform: translateY(-2px);
  box-shadow: 0 6px 24px var(--blue-glow);
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
  width: 26px;
  height: 2px;
  background: #ffffff;
}

/* --------------------------------------------------------------------------
   EDITORIAL BUTTONS
   -------------------------------------------------------------------------- */
.btn-primary,
button.btn-primary,
a.btn-primary {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 12px;
  background: var(--blue-primary);
  color: #ffffff !important;
  font-family: var(--font-display);
  font-weight: 700;
  font-size: 1rem;
  letter-spacing: 0.02em;
  padding: 16px 36px;
  border-radius: var(--radius-pill);
  border: 1px solid var(--blue-primary);
  box-shadow: 0 6px 22px var(--blue-glow);
  transition: all var(--duration-fast) var(--ease-spring);
  text-decoration: none;
}

.btn-primary:hover {
  background: var(--blue-hover);
  border-color: var(--blue-hover);
  transform: translateY(-3px);
  box-shadow: 0 10px 30px var(--blue-glow);
  color: #ffffff !important;
}

.btn-secondary,
button.btn-secondary,
a.btn-secondary {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 12px;
  background: rgba(255, 255, 255, 0.04);
  color: #ffffff !important;
  font-family: var(--font-display);
  font-weight: 600;
  font-size: 1rem;
  letter-spacing: 0.02em;
  padding: 16px 36px;
  border-radius: var(--radius-pill);
  border: 1px solid rgba(255, 255, 255, 0.18);
  transition: all var(--duration-fast) var(--ease-spring);
  text-decoration: none;
}

.btn-secondary:hover {
  background: #ffffff;
  color: #07080c !important;
  border-color: #ffffff;
  transform: translateY(-3px);
}

.btn-matrix {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  background: var(--blue-tint);
  color: var(--blue-sky);
  border: 1px solid var(--blue-border);
  padding: 10px 22px;
  border-radius: var(--radius-pill);
  font-family: var(--font-mono);
  font-size: 0.82rem;
  font-weight: 600;
  letter-spacing: 0.05em;
  text-transform: uppercase;
  margin-bottom: 24px;
  transition: all var(--duration-fast);
}

.btn-matrix:hover {
  background: rgba(37, 99, 235, 0.25);
  border-color: var(--blue-bright);
}

/* --------------------------------------------------------------------------
   HERO SECTION (ASYMMETRICAL DIPLOMATIC EDITORIAL)
   -------------------------------------------------------------------------- */
#hero {
  position: relative;
  min-height: 96vh;
  display: flex;
  flex-direction: column;
  justify-content: center;
  padding: 160px 0 60px;
  width: 90%;
  max-width: 1320px;
  margin: 0 auto;
}

.hero-container {
  display: grid;
  grid-template-columns: 1.15fr 0.85fr;
  gap: 60px;
  align-items: center;
  margin-bottom: 60px;
}

.hero-eyebrow {
  display: flex;
  align-items: center;
  gap: 14px;
  margin-bottom: 28px;
  flex-wrap: wrap;
}

.eyebrow-pill {
  font-family: var(--font-mono);
  font-size: 0.82rem;
  font-weight: 700;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: var(--blue-sky);
  background: var(--blue-tint);
  border: 1px solid var(--blue-border);
  padding: 6px 14px;
  border-radius: var(--radius-pill);
}

.eyebrow-date {
  font-family: var(--font-body);
  font-size: 0.95rem;
  font-weight: 500;
  color: var(--text-muted);
}

.hero-title {
  display: flex;
  flex-direction: column;
  font-family: var(--font-display);
  font-size: clamp(3.8rem, 8vw, 7.2rem);
  font-weight: 900;
  line-height: 0.92;
  letter-spacing: -0.04em;
  text-transform: uppercase;
  color: #ffffff;
  margin-bottom: 28px;
}

.hero-title .title-secondary {
  color: var(--blue-bright);
}

.hero-manifesto {
  font-size: 1.25rem;
  line-height: 1.75;
  color: var(--text-secondary);
  max-width: 620px;
  margin-bottom: 40px;
}

.hero-actions {
  display: flex;
  align-items: center;
  gap: 20px;
  margin-bottom: 36px;
  flex-wrap: wrap;
}

.hero-venue-tag {
  display: inline-flex;
  align-items: center;
  gap: 10px;
  font-size: 0.92rem;
  color: var(--text-muted);
}

.hero-venue-tag svg {
  color: var(--blue-bright);
}

/* Right Column: Diplomatic Visual Composition */
.hero-visual {
  display: flex;
  justify-content: center;
  align-items: center;
}

.emblem-editorial-frame {
  position: relative;
  background: radial-gradient(circle at center, rgba(37, 99, 235, 0.08) 0%, rgba(14, 16, 23, 0.8) 70%);
  border: 1px solid var(--border);
  border-radius: var(--radius-lg);
  padding: 50px 40px;
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  width: 100%;
  max-width: 440px;
}

.emblem-halo {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 260px;
  height: 260px;
  background: radial-gradient(circle, rgba(37, 99, 235, 0.25) 0%, transparent 70%);
  filter: blur(30px);
  pointer-events: none;
}

.hero-emblem-img {
  position: relative;
  z-index: 2;
  width: 220px;
  height: 220px;
  object-fit: contain;
  margin-bottom: 24px;
}

.emblem-caption {
  position: relative;
  z-index: 2;
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.emblem-caption span {
  font-family: var(--font-mono);
  font-size: 0.75rem;
  letter-spacing: 0.12em;
  color: var(--blue-sky);
  text-transform: uppercase;
}

.emblem-caption strong {
  font-family: var(--font-display);
  font-size: 0.95rem;
  letter-spacing: 0.08em;
  color: var(--text-white);
  text-transform: uppercase;
}

/* --------------------------------------------------------------------------
   THE CONFERENCE AT A GLANCE (EDITORIAL HORIZONTAL STATS)
   -------------------------------------------------------------------------- */
.hero-stats-bar {
  display: grid;
  grid-template-columns: 1fr auto 1fr auto 1fr auto 1fr auto 1.2fr;
  align-items: center;
  background: var(--bg-surface);
  border: 1px solid var(--border);
  border-radius: var(--radius-md);
  padding: 36px 48px;
  width: 100%;
}

.stat-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  gap: 6px;
}

.stat-divider {
  width: 1px;
  height: 48px;
  background: var(--border);
}

.stat-num, .stat-num-wrapper {
  font-family: var(--font-display);
  font-size: 3rem;
  font-weight: 900;
  line-height: 1;
  color: var(--text-white);
}

.stat-num-wrapper {
  display: inline-flex;
  align-items: baseline;
}

.stat-suffix {
  color: var(--blue-bright);
  font-size: 2.2rem;
  font-weight: 700;
  margin-left: 2px;
}

.stat-label {
  font-family: var(--font-body);
  font-size: 0.88rem;
  font-weight: 500;
  color: var(--text-muted);
}

.stat-item--highlight .stat-num {
  color: var(--blue-bright);
}

/* --------------------------------------------------------------------------
   COUNTDOWN TIMER BAR
   -------------------------------------------------------------------------- */
#countdown {
  width: 90%;
  max-width: 1320px;
  margin: 40px auto 100px;
  background: var(--bg-surface);
  border: 1px solid var(--border);
  border-radius: var(--radius-md);
  padding: 24px 40px;
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
  color: var(--blue-sky);
  font-weight: 700;
  display: flex;
  align-items: center;
  gap: 10px;
}

.countdown-label::before {
  content: '●';
  color: var(--blue-bright);
}

.countdown-units-wrapper {
  display: flex;
  align-items: center;
  gap: 28px;
}

.countdown-unit {
  display: flex;
  align-items: baseline;
  gap: 8px;
}

.countdown-num {
  font-family: var(--font-mono);
  font-size: 2rem;
  font-weight: 700;
  color: #ffffff;
}

.countdown-unit-label {
  font-family: var(--font-body);
  font-size: 0.8rem;
  font-weight: 500;
  color: var(--text-muted);
}

.countdown-sep {
  font-family: var(--font-mono);
  font-size: 1.6rem;
  font-weight: 700;
  color: var(--blue-bright);
}

/* --------------------------------------------------------------------------
   EDITORIAL HEADINGS & SECTIONS
   -------------------------------------------------------------------------- */
.section-label {
  font-family: var(--font-mono);
  font-size: 0.85rem;
  font-weight: 700;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  color: var(--blue-sky);
  margin-bottom: 16px;
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
  font-size: clamp(2.6rem, 5vw, 4.2rem);
  font-weight: 900;
  letter-spacing: -0.03em;
  line-height: 1.05;
  color: #ffffff;
  margin-bottom: 28px;
}

.section-title .title-accent {
  color: var(--blue-bright);
}

.section-body {
  font-size: 1.15rem;
  line-height: 1.8;
  color: var(--text-secondary);
  margin-bottom: 28px;
}

.title-line-divider,
.glow-line {
  height: 1px;
  background: var(--border-subtle);
  border: none;
  margin: 90px auto;
  width: 90%;
  max-width: 1320px;
}

/* --------------------------------------------------------------------------
   WHERE DIPLOMACY MEETS AMBITION (STORYTELLING)
   -------------------------------------------------------------------------- */
#about {
  width: 90%;
  max-width: 1320px;
  margin: 0 auto;
  padding: 60px 0;
}

.about-inner {
  display: grid;
  grid-template-columns: 1fr 1.2fr;
  gap: 80px;
  align-items: center;
}

.about-visual {
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.emblem-wrapper {
  background: radial-gradient(circle at center, rgba(37, 99, 235, 0.08) 0%, var(--bg-surface) 70%);
  border: 1px solid var(--border);
  border-radius: var(--radius-lg);
  padding: 60px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.emblem-main {
  max-height: 220px;
  width: auto;
}

.about-stat-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;
}

.about-stat {
  background: var(--bg-surface);
  border: 1px solid var(--border);
  border-radius: var(--radius-md);
  padding: 24px;
  display: flex;
  flex-direction: column;
  gap: 4px;
  transition: all var(--duration-fast);
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
  font-family: var(--font-body);
  font-size: 0.85rem;
  font-weight: 500;
  color: var(--text-muted);
}

.logo-halo, .about-particles {
  display: none !important;
}

/* --------------------------------------------------------------------------
   SECRETARY GENERAL'S LETTER (DIPLOMATIC MANIFESTO)
   -------------------------------------------------------------------------- */
#letter {
  width: 90%;
  max-width: 1320px;
  margin: 0 auto;
  padding: 60px 0;
}

.letter-inner {
  max-width: 940px;
  margin: 0 auto;
}

.letter-bg-glow {
  display: none !important;
}

.letter-container {
  background: var(--bg-surface);
  border: 1px solid var(--border);
  border-radius: var(--radius-lg);
  padding: 60px 70px;
  margin-top: 40px;
  position: relative;
}

.letter-content p {
  font-size: 1.15rem;
  line-height: 1.9;
  color: var(--text-secondary);
  margin-bottom: 24px;
}

.letter-content strong {
  color: #ffffff;
  font-weight: 600;
}

.letter-signature {
  display: flex;
  align-items: center;
  gap: 20px;
  margin-top: 44px;
  padding-top: 32px;
  border-top: 1px solid var(--border);
}

.sig-avatar {
  width: 56px;
  height: 56px;
  background: var(--blue-primary);
  color: #ffffff;
  font-family: var(--font-display);
  font-weight: 800;
  font-size: 1.15rem;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: var(--radius-pill);
}

.sig-details h4 {
  font-family: var(--font-display);
  font-size: 1.25rem;
  font-weight: 700;
  color: #ffffff;
}

.sig-details span {
  font-family: var(--font-body);
  font-size: 0.88rem;
  color: var(--text-muted);
}

/* --------------------------------------------------------------------------
   THE ARENA OF HIGH-LEVEL DEBATE (COMMITTEES)
   -------------------------------------------------------------------------- */
#committees {
  width: 90%;
  max-width: 1320px;
  margin: 0 auto;
  padding: 60px 0;
}

.committees-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 24px;
  margin-top: 48px;
}

.committee-card {
  background: var(--bg-surface);
  border: 1px solid var(--border);
  border-radius: var(--radius-md);
  padding: 36px 32px;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  min-height: 280px;
  transition: all var(--duration-fast) var(--ease-spring);
}

.committee-card:hover {
  border-color: var(--blue-bright);
  background: var(--bg-surface-elevated);
  transform: translateY(-6px);
  box-shadow: 0 12px 40px rgba(37, 99, 235, 0.18);
}

.committee-tag {
  font-family: var(--font-mono);
  font-size: 0.78rem;
  font-weight: 700;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: var(--blue-sky) !important;
  margin-bottom: 18px;
  display: flex;
  align-items: center;
  gap: 8px;
}

.committee-tag::before {
  content: '■';
  font-size: 0.65rem;
  color: var(--blue-bright);
}

.committee-name {
  font-family: var(--font-display);
  font-size: 2rem;
  font-weight: 800;
  letter-spacing: -0.02em;
  text-transform: uppercase;
  color: #ffffff;
  line-height: 1.15;
  margin-bottom: 14px;
}

.committee-topic {
  font-size: 1rem;
  line-height: 1.6;
  color: var(--text-secondary);
  margin-bottom: 24px;
}

.committee-coming {
  font-family: var(--font-body);
  font-size: 0.82rem;
  font-weight: 600;
  color: #ffffff !important;
  border: 1px solid var(--border);
  padding: 6px 16px;
  border-radius: var(--radius-pill);
  width: fit-content;
  display: inline-block;
  background: rgba(255, 255, 255, 0.03);
}

/* --------------------------------------------------------------------------
   A STAGE WORTHY OF THE DEBATE (VENUE)
   -------------------------------------------------------------------------- */
#venue {
  width: 90%;
  max-width: 1320px;
  margin: 0 auto;
  padding: 60px 0;
}

.venue-layout {
  display: grid;
  grid-template-columns: 1.1fr 0.9fr;
  gap: 50px;
  align-items: center;
  margin-top: 44px;
}

.venue-visual {
  border: 1px solid var(--border);
  border-radius: var(--radius-lg);
  overflow: hidden;
  background: var(--bg-surface);
  min-height: 380px;
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
  font-size: 2.2rem;
  font-weight: 900;
  text-transform: uppercase;
  color: #ffffff;
  margin-bottom: 20px;
}

.venue-info p {
  font-size: 1.15rem;
  line-height: 1.8;
  color: var(--text-secondary);
  margin-bottom: 20px;
}

.venue-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
  margin-top: 28px;
}

.venue-tag {
  font-family: var(--font-body);
  font-size: 0.88rem;
  font-weight: 500;
  background: var(--bg-surface);
  border: 1px solid var(--border);
  color: var(--text-white);
  padding: 10px 18px;
  border-radius: var(--radius-pill);
}

/* --------------------------------------------------------------------------
   MEET THE TEAM (SECRETARIAT)
   -------------------------------------------------------------------------- */
#secretariat {
  width: 90%;
  max-width: 1320px;
  margin: 0 auto;
  padding: 60px 0;
}

.sec-track {
  display: flex;
  gap: 24px;
  overflow-x: auto;
  padding: 24px 0;
  scrollbar-width: thin;
  scrollbar-color: var(--border) transparent;
}

.sec-card {
  flex: 0 0 250px;
  background: var(--bg-surface);
  border: 1px solid var(--border);
  border-radius: var(--radius-md);
  padding: 28px;
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  transition: all var(--duration-fast);
}

.sec-card:hover {
  border-color: var(--blue-bright);
  transform: translateY(-4px);
}

.sec-avatar {
  width: 72px;
  height: 72px;
  background: #151a28;
  border: 1px solid var(--border);
  color: #ffffff;
  font-family: var(--font-display);
  font-weight: 800;
  font-size: 1.3rem;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: var(--radius-pill);
  margin-bottom: 18px;
}

.sec-card--sg .sec-avatar,
.sec-card--dsg .sec-avatar,
.sec-card--dg .sec-avatar {
  background: var(--blue-primary);
  color: #ffffff;
  box-shadow: 0 4px 18px var(--blue-glow);
}

.sec-name {
  font-family: var(--font-display);
  font-size: 1.15rem;
  font-weight: 700;
  color: #ffffff;
  margin-bottom: 6px;
}

.sec-role {
  font-family: var(--font-body);
  font-size: 0.82rem;
  color: var(--blue-sky);
  font-weight: 500;
}

/* --------------------------------------------------------------------------
   PARTNERS & OC/EB APPLICATIONS
   -------------------------------------------------------------------------- */
#sponsors, #oc-applications, #eb-applications {
  width: 90%;
  max-width: 1320px;
  margin: 0 auto;
  padding: 60px 0;
}

.sponsors-row {
  display: flex;
  flex-wrap: wrap;
  gap: 18px;
  justify-content: center;
}

.sponsor-slot {
  background: var(--bg-surface);
  border: 1px solid var(--border);
  padding: 18px 42px;
  border-radius: var(--radius-pill);
  font-family: var(--font-display);
  font-size: 0.95rem;
  font-weight: 600;
  color: var(--text-muted);
}

.oc-layout, .eb-layout {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 50px;
  align-items: center;
}

.oc-card, .eb-card {
  background: var(--bg-surface);
  border: 1px solid var(--border);
  border-radius: var(--radius-lg);
  padding: 48px;
}

.oc-card-glow, .eb-card-glow {
  display: none !important;
}

.oc-icon, .eb-icon {
  width: 52px;
  height: 52px;
  color: var(--blue-bright);
  margin-bottom: 22px;
}

.oc-card-title, .eb-card-title {
  font-family: var(--font-display);
  font-size: 2rem;
  font-weight: 900;
  text-transform: uppercase;
  color: #ffffff;
  margin-bottom: 14px;
}

.oc-perks, .eb-perks {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;
  margin-top: 28px;
}

.oc-perk, .eb-perk {
  font-size: 0.95rem;
  color: var(--text-secondary);
  display: flex;
  align-items: center;
  gap: 10px;
}

.oc-perk::before, .eb-perk::before {
  content: '→';
  color: var(--blue-bright);
  font-weight: 800;
}

/* --------------------------------------------------------------------------
   TAKE YOUR SEAT AT THE TABLE (GRAND CALL TO ACTION)
   -------------------------------------------------------------------------- */
#register {
  width: 90%;
  max-width: 1320px;
  margin: 60px auto 40px;
  padding: 100px 50px;
  background: radial-gradient(circle at center, rgba(37, 99, 235, 0.09) 0%, var(--bg-surface) 75%);
  border: 1px solid var(--border);
  border-radius: var(--radius-lg);
  text-align: center;
}

.cta-inner {
  max-width: 780px;
  margin: 0 auto;
}

.cta-eyebrow {
  font-family: var(--font-mono);
  font-size: 0.88rem;
  font-weight: 700;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  color: var(--blue-sky);
  margin-bottom: 18px;
}

.cta-title {
  font-family: var(--font-display);
  font-size: clamp(2.8rem, 5.5vw, 4.2rem);
  font-weight: 900;
  letter-spacing: -0.03em;
  line-height: 1.05;
  text-transform: uppercase;
  color: #ffffff;
  margin-bottom: 22px;
}

.cta-body {
  font-size: 1.2rem;
  line-height: 1.8;
  color: var(--text-secondary);
  margin-bottom: 40px;
}

.cta-actions {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 20px;
  flex-wrap: wrap;
}

/* --------------------------------------------------------------------------
   MODALS (CONVERSATIONAL & ACCESSIBLE)
   -------------------------------------------------------------------------- */
.modal-overlay {
  position: fixed;
  inset: 0;
  z-index: 10000;
  background: rgba(4, 5, 8, 0.92);
  display: none;
  align-items: center;
  justify-content: center;
  padding: 24px;
  overflow-y: auto;
  backdrop-filter: blur(10px);
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
  max-width: 720px;
  background: var(--bg-modal);
  border: 1px solid var(--border-light);
  border-radius: var(--radius-lg);
  padding: 44px;
  max-height: 90vh;
  overflow-y: auto;
  box-shadow: 0 28px 70px rgba(0, 0, 0, 0.9);
}

.modal-close {
  position: absolute;
  top: 22px;
  right: 22px;
  background: none;
  border: 1px solid var(--border);
  color: #ffffff;
  width: 40px;
  height: 40px;
  border-radius: var(--radius-pill);
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all var(--duration-fast);
}

.modal-close:hover {
  border-color: var(--blue-bright);
  background: var(--blue-primary);
  color: #ffffff;
}

.modal-progress-bar {
  width: 100%;
  height: 5px;
  background: #182032;
  border-radius: var(--radius-pill);
  margin-bottom: 26px;
  overflow: hidden;
}

.modal-progress-fill {
  height: 100%;
  background: linear-gradient(90deg, var(--blue-primary), var(--blue-bright));
  border-radius: var(--radius-pill);
  transition: width 0.35s ease;
}

.modal-header {
  margin-bottom: 32px;
}

.step-indicator {
  font-family: var(--font-mono);
  font-size: 0.8rem;
  font-weight: 700;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: var(--blue-sky);
  margin-bottom: 10px;
  display: block;
}

.modal-title {
  font-family: var(--font-display);
  font-size: 2.2rem;
  font-weight: 900;
  letter-spacing: -0.02em;
  text-transform: uppercase;
  color: #ffffff;
}

.modal-subtitle {
  font-family: var(--font-body);
  font-size: 0.92rem;
  color: var(--text-muted);
}

.selection-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 18px;
}

.selection-card {
  background: var(--bg-surface);
  border: 1px solid var(--border);
  border-radius: var(--radius-md);
  padding: 26px;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  gap: 20px;
  transition: border-color var(--duration-fast);
}

.selection-card:hover {
  border-color: var(--blue-border);
}

.selection-card h3 {
  font-family: var(--font-display);
  font-size: 1.4rem;
  font-weight: 800;
  text-transform: uppercase;
  color: #ffffff;
  margin-bottom: 6px;
}

.selection-card p {
  font-size: 0.95rem;
  line-height: 1.6;
  color: var(--text-secondary);
}

.selection-card .btn-primary {
  width: 100%;
  padding: 14px;
  font-size: 0.9rem;
}

/* Form Styles */
.form-step {
  display: none;
}

.form-step.active {
  display: block;
}

.form-group {
  margin-bottom: 24px;
}

.form-group label {
  display: block;
  font-family: var(--font-body);
  font-size: 0.85rem;
  font-weight: 600;
  color: #cbd5e1;
  margin-bottom: 10px;
}

.form-group input,
.form-group select,
.form-group textarea {
  width: 100%;
  background: #111624;
  border: 1px solid #232b3f;
  color: #ffffff;
  font-family: var(--font-body);
  font-size: 1rem;
  padding: 16px 20px;
  border-radius: var(--radius-sm);
  outline: none;
  transition: border-color var(--duration-fast), box-shadow var(--duration-fast);
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
  gap: 18px;
  margin-top: 32px;
}

.btn-back {
  background: transparent;
  border: 1px solid var(--border);
  color: #ffffff;
  font-family: var(--font-display);
  font-weight: 700;
  font-size: 0.95rem;
  padding: 14px 28px;
  border-radius: var(--radius-pill);
  cursor: pointer;
  transition: all var(--duration-fast);
}

.btn-back:hover {
  background: #1c2336;
}

.btn-next,
.btn-full-width {
  background: var(--blue-primary);
  border: none;
  color: #ffffff;
  font-family: var(--font-display);
  font-weight: 700;
  font-size: 0.95rem;
  padding: 14px 32px;
  border-radius: var(--radius-pill);
  cursor: pointer;
  letter-spacing: 0.02em;
  box-shadow: 0 4px 16px var(--blue-glow);
  transition: all var(--duration-fast);
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
}

.btn-full-width {
  width: 100%;
  padding: 18px;
}

.btn-next:hover {
  background: var(--blue-hover);
  box-shadow: 0 8px 25px var(--blue-glow);
}

/* Payment Card */
.payment-banner {
  background: #141b2c;
  border: 1px solid var(--blue-border);
  padding: 24px;
  border-radius: var(--radius-md);
  text-align: center;
  margin-bottom: 28px;
}

.payment-banner h3 {
  font-family: var(--font-display);
  font-size: 1.8rem;
  font-weight: 800;
  color: #ffffff;
}

.payment-card {
  background: #101524;
  border: 1px solid var(--border);
  padding: 32px;
  border-radius: var(--radius-md);
  margin-bottom: 28px;
}

.qr-container {
  display: inline-block;
  background: #ffffff;
  padding: 14px;
  border-radius: var(--radius-sm);
  margin-bottom: 18px;
}

.qr-container img {
  width: 190px;
  height: 190px;
}

.upi-box {
  display: inline-flex;
  align-items: center;
  gap: 12px;
  background: #161e32;
  border: 1px solid var(--border);
  padding: 10px 20px;
  border-radius: var(--radius-pill);
  margin-bottom: 14px;
}

.upi-box span {
  font-family: var(--font-mono);
  font-size: 0.9rem;
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
  gap: 14px;
  background: #111624;
  border: 1px solid #232b3f;
  padding: 12px 20px;
  border-radius: var(--radius-sm);
  cursor: pointer;
}

.file-upload-btn {
  background: var(--blue-primary);
  color: #ffffff;
  font-family: var(--font-display);
  font-size: 0.82rem;
  font-weight: 700;
  padding: 8px 16px;
  border-radius: var(--radius-pill);
}

.file-name {
  font-size: 0.92rem;
  color: #94a3b8;
}

.file-upload-input {
  display: none;
}

.terms-confirmation {
  font-size: 0.85rem;
  color: #94a3b8;
  text-align: center;
  margin-top: 18px;
}

.terms-confirmation a {
  color: var(--blue-bright);
  text-decoration: underline;
}

/* --------------------------------------------------------------------------
   FOOTER (DIPLOMATIC INTERNATIONAL SUMMIT)
   -------------------------------------------------------------------------- */
footer {
  border-top: 1px solid var(--border);
  background: #050608;
  padding: 80px 0 50px;
}

.footer-top {
  width: 90%;
  max-width: 1320px;
  margin: 0 auto;
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  flex-wrap: wrap;
  gap: 50px;
  margin-bottom: 60px;
}

.footer-brand {
  max-width: 420px;
}

.footer-logo-img {
  height: 40px !important;
  width: auto !important;
  max-width: 140px !important;
  margin-bottom: 16px;
}

.footer-brand p {
  font-size: 1rem;
  line-height: 1.7;
  color: var(--text-secondary);
}

.footer-col h5 {
  font-family: var(--font-mono);
  font-size: 0.85rem;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  color: var(--blue-sky);
  margin-bottom: 20px;
}

.footer-col ul {
  list-style: none;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.footer-col a {
  font-size: 0.95rem;
  color: #94a3b8;
  transition: color var(--duration-fast);
}

.footer-col a:hover {
  color: #ffffff;
}

.footer-bottom {
  width: 90%;
  max-width: 1320px;
  margin: 0 auto;
  border-top: 1px solid var(--border-subtle);
  padding-top: 30px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 20px;
  font-size: 0.88rem;
  color: #64748b;
}

.footer-date-pill {
  display: inline-flex;
  align-items: center;
  gap: 10px;
  background: #111624;
  border: 1px solid var(--border);
  padding: 8px 20px;
  border-radius: var(--radius-pill);
  color: #ffffff;
}

.pill-dot {
  width: 7px;
  height: 7px;
  background: var(--blue-bright);
  border-radius: 50%;
}

/* --------------------------------------------------------------------------
   RESPONSIVE DESIGN (MOBILE & TABLET)
   -------------------------------------------------------------------------- */
@media (max-width: 1024px) {
  .hero-container {
    grid-template-columns: 1fr;
    gap: 48px;
  }
  .hero-stats-bar {
    grid-template-columns: repeat(2, 1fr);
    gap: 24px;
    padding: 28px;
  }
  .stat-divider {
    display: none;
  }
  .committees-grid {
    grid-template-columns: repeat(2, 1fr);
  }
  .about-inner, .venue-layout, .oc-layout, .eb-layout {
    grid-template-columns: 1fr;
    gap: 40px;
  }
}

@media (max-width: 768px) {
  #navbar {
    padding: 16px 24px;
  }
  .nav-links {
    display: none;
  }
  .mobile-menu-btn {
    display: flex;
  }
  .hero-title {
    font-size: 3.2rem;
  }
  .hero-stats-bar {
    grid-template-columns: 1fr 1fr;
    gap: 20px;
    padding: 20px;
  }
  .stat-num, .stat-num-wrapper {
    font-size: 2.2rem;
  }
  .committees-grid {
    grid-template-columns: 1fr;
  }
  .selection-grid {
    grid-template-columns: 1fr;
  }
  .modal-content {
    padding: 28px 20px;
  }
  .letter-container {
    padding: 36px 24px;
  }
  .countdown-units-wrapper {
    gap: 14px;
  }
  .countdown-num {
    font-size: 1.5rem;
  }
}
`;

fs.writeFileSync('app/globals.css', editorialCss, 'utf8');
console.log('Successfully wrote editorial diplomatic summit CSS to app/globals.css');
