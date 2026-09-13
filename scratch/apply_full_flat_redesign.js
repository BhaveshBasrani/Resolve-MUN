const fs = require('fs');
const path = require('path');

// =========================================================================
// 1. UPDATE APP/PAGECONTENT.JS
// =========================================================================
const pageContentPath = path.join(__dirname, '../app/pageContent.js');
let pageContent = fs.readFileSync(pageContentPath, 'utf8');

// A. Replace the hero section inside pageContent
const oldHeroRegex = /<section id=\\"hero\\">[\s\S]*?<\/section>/;

const newHeroHtml = `<section id=\\"hero\\">
  <div class=\\"hero-top-meta\\">
    <span class=\\"hero-badge\\">[ 2026 // EDITION ]</span>
    <span class=\\"hero-meta-text\\">JUNE 12TH — 14TH, 2026 · HYDERABAD, INDIA</span>
  </div>

  <h1 class=\\"hero-title\\">
    <span>RESOLVE</span><br>
    <span class=\\"mun\\">MUN 2.0</span>
  </h1>

  <div class=\\"hero-flat-pill\\">RESOLVE. &nbsp;REFORM. &nbsp;RECONCILE.</div>

  <p class=\\"hero-description-flat\\">
    Flat, uncompromising diplomacy. Resolve MUN 2.0 strips away the noise to focus on what truly matters: rigorous debate, strategic policy reform, and the next generation of leadership.
  </p>

  <div class=\\"hero-actions reveal\\">
    <button class=\\"btn-primary hero-reg-btn\\" onclick=\\"openSelectionModal()\\"><span>REGISTER FOR 2.0 ↗</span></button>
    <a href=\\"documents/Delegate Brochure.pdf\\" target=\\"_blank\\" class=\\"btn-secondary\\"><span>DELEGATE BROCHURE ↗</span></a>
  </div>

  <div class=\\"hero-meta\\">
    <div class=\\"hero-meta-item\\">
      <span class=\\"label\\">EDITION</span>
      <span class=\\"value\\" data-target=\\"2026\\">0</span>
    </div>
    <div class=\\"hero-meta-item\\">
      <span class=\\"label\\">DELEGATES</span>
      <span class=\\"value\\" data-target=\\"250\\">0</span><span class=\\"value-suffix\\">+</span>
    </div>
    <div class=\\"hero-meta-item\\">
      <span class=\\"label\\">COMMITTEES</span>
      <span class=\\"value\\" data-target=\\"7\\">0</span>
    </div>
    <div class=\\"hero-meta-item\\">
      <span class=\\"label\\">DAYS</span>
      <span class=\\"value\\" data-target=\\"3\\">0</span>
    </div>
  </div>

  <!-- HOW RESOLVE MUN WORKS (FLAT ARCHITECTURE MATRIX) -->
  <div class=\\"flat-architecture-section\\">
    <div class=\\"flat-matrix-header\\">
      <div class=\\"flat-matrix-title-group\\">
        <span class=\\"flat-red-dot\\">■</span>
        <span class=\\"flat-matrix-title\\">HOW RESOLVE MUN WORKS</span>
      </div>
      <div class=\\"flat-matrix-line\\"></div>
      <span class=\\"flat-matrix-code\\">2026 // SYSTEM</span>
    </div>

    <div class=\\"flat-matrix-layout\\">
      <div class=\\"flat-matrix-grid\\">
        <div class=\\"flat-matrix-col\\">
          <div class=\\"matrix-symbol\\">■</div>
          <h4>SIMPLICITY</h4>
          <p>Eliminates procedural clutter for high-velocity, substance-driven diplomatic discourse.</p>
        </div>
        <div class=\\"flat-matrix-col\\">
          <div class=\\"matrix-symbol\\">●</div>
          <h4>BOLD COALITIONS</h4>
          <p>Forges dynamic alliances across 7 committees with 250+ ambitious delegates.</p>
        </div>
        <div class=\\"flat-matrix-col\\">
          <div class=\\"matrix-symbol\\">◪</div>
          <h4>CLEAR LAYOUT</h4>
          <p>Comprehensive study guides, transparent allocations, and real-world treaty formulation.</p>
        </div>
        <div class=\\"flat-matrix-col\\">
          <div class=\\"matrix-symbol\\">✚</div>
          <h4>FOCUS ON IMPACT</h4>
          <p>Over ₹1.30 Lakhs in cash rewards, national citations, and life-long leadership connections.</p>
        </div>
      </div>

      <div class=\\"why-matters-card\\">
        <div class=\\"why-header\\">
          <span class=\\"why-red-box\\">■</span>
          <span class=\\"why-title\\">WHY RESOLVE MATTERS</span>
        </div>
        <ul class=\\"why-list\\">
          <li><span class=\\"why-arrow\\">→</span> Develops decisive negotiation and oratory skills under pressure.</li>
          <li><span class=\"why-arrow\\">→</span> Executive Board vetted from top tier national debate circuits.</li>
          <li><span class=\\"why-arrow\\">→</span> Hosted on an expansive, modern green campus in Hyderabad.</li>
          <li><span class=\\"why-arrow\\">→</span> Keeps the focus strictly on delegate growth and recognition.</li>
        </ul>
        <div class=\\"why-footer-action\\">
          <button class=\\"why-action-btn\\" onclick=\\"openSelectionModal()\\"><span>JOIN THE CONCLAVE ↗</span></button>
        </div>
      </div>
    </div>
  </div>
</section>`;

if (oldHeroRegex.test(pageContent)) {
  pageContent = pageContent.replace(oldHeroRegex, newHeroHtml);
  console.log('Successfully replaced Hero section in app/pageContent.js');
} else {
  console.error('Could not match old Hero section');
}

fs.writeFileSync(pageContentPath, pageContent, 'utf8');

// =========================================================================
// 2. WRITE APP/GLOBALS.CSS
// =========================================================================
const globalsCss = `/* ==========================================================================
   RESOLVE MUN 2.0 — HIGH CONTRAST FLAT DESIGN SYSTEM
   Inspired by RenderVoid / Editorial Brutalist Flat Aesthetic
   Colors: Deep Obsidian (#08080a), Stark White (#ffffff), Electric Red (#ff2a2a)
   Typography: Space Grotesk (Headings), Inter (Body), Space Mono (Technical Meta)
   ========================================================================== */

:root {
  /* Surfaces */
  --black: #08080a;
  --bg: #08080a;
  --bg-card: #101014;
  --bg-card-hover: #16161c;
  --bg-modal: #0d0d10;
  
  /* High Impact Flat Borders */
  --border: #22222a;
  --border-hover: #ff2a2a;
  --border-subtle: #18181f;
  --border-focus: #ff2a2a;
  --border-light: #2c2c36;
  
  /* Primary Flat Red / Scarlet Accent */
  --red: #ff2a2a;
  --red-hover: #e01b1b;
  --red-tint: rgba(255, 42, 42, 0.12);
  
  /* Text & Contrast */
  --white: #ffffff;
  --text-primary: #ffffff;
  --text-secondary: #d1d5db;
  --text-muted: #80808e;
  
  /* Typography */
  --font-display: 'Space Grotesk', 'Plus Jakarta Sans', -apple-system, sans-serif;
  --font-body: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
  --font-mono: 'Space Mono', ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
  
  /* Radii */
  --radius-xs: 3px;
  --radius-sm: 6px;
  --radius-md: 8px;
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
   GLOBAL VISIBILITY & CONTAINER
   -------------------------------------------------------------------------- */
.reveal {
  opacity: 1 !important;
  transform: none !important;
  visibility: visible !important;
}

.cursor-dot, .cursor-reticle, #loading-screen, #submitSpinner {
  display: none !important;
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
  padding: 16px 40px;
  background: rgba(8, 8, 10, 0.96);
  border-bottom: 1px solid var(--border);
  backdrop-filter: blur(8px);
}

.nav-logo {
  display: flex;
  align-items: center;
  gap: 12px;
  font-family: var(--font-display);
  font-weight: 800;
  font-size: 1.1rem;
  letter-spacing: 0.08em;
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
  font-size: 0.8rem;
  letter-spacing: 0.06em;
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
  font-size: 0.82rem;
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
  font-size: 0.92rem;
  letter-spacing: 0.04em;
  text-transform: uppercase;
  padding: 14px 28px;
  border-radius: var(--radius-xs);
  border: 1px solid var(--red);
  transition: background var(--transition-fast), transform var(--transition-fast);
  text-decoration: none;
}

.btn-primary:hover {
  background: var(--red-hover);
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
  font-size: 0.92rem;
  letter-spacing: 0.04em;
  text-transform: uppercase;
  padding: 14px 28px;
  border-radius: var(--radius-xs);
  border: 1px solid #444452;
  transition: all var(--transition-fast);
  text-decoration: none;
}

.btn-secondary:hover {
  background: #ffffff;
  color: #08080a !important;
  border-color: #ffffff;
  transform: translateY(-2px);
}

.btn-matrix {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  background: #14141a;
  color: var(--white);
  border: 1px solid var(--border);
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
  background: #1c1c24;
}

/* --------------------------------------------------------------------------
   HERO SECTION (FLAT EDITORIAL BRUTALIST)
   -------------------------------------------------------------------------- */
#hero {
  position: relative;
  min-height: 90vh;
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

.hero-top-meta {
  display: flex;
  align-items: center;
  gap: 16px;
  margin-bottom: 24px;
  flex-wrap: wrap;
}

.hero-badge {
  font-family: var(--font-mono);
  font-size: 0.82rem;
  font-weight: 700;
  letter-spacing: 0.1em;
  color: var(--red);
  text-transform: uppercase;
}

.hero-meta-text {
  font-family: var(--font-mono);
  font-size: 0.82rem;
  letter-spacing: 0.08em;
  color: #888894;
  text-transform: uppercase;
}

.hero-title {
  font-family: var(--font-display);
  font-size: clamp(3.4rem, 7.5vw, 6.8rem);
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
  font-size: 0.75em;
}

/* Flat Red Box Tagline matching Image 2 "SIMPLE. CLEAN. IMPACTFUL." */
.hero-flat-pill {
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

.hero-description-flat {
  font-size: 1.25rem;
  line-height: 1.65;
  color: var(--text-secondary);
  max-width: 780px;
  margin-bottom: 40px;
}

.hero-actions {
  display: flex;
  align-items: center;
  gap: 18px;
  margin-bottom: 60px;
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
  background: var(--bg-card);
  border: 1px solid var(--border);
  border-radius: var(--radius-sm);
  padding: 24px;
  display: flex;
  flex-direction: column;
  gap: 6px;
  transition: border-color var(--transition-fast);
}

.hero-meta-item:hover {
  border-color: var(--border-hover);
}

.hero-meta-item .value {
  font-family: var(--font-display);
  font-size: 2.6rem;
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
   FLAT ARCHITECTURE MATRIX (EXACT IMAGE 2 REPLICATION)
   -------------------------------------------------------------------------- */
.flat-architecture-section {
  margin-top: 70px;
  width: 100%;
}

.flat-matrix-header {
  display: flex;
  align-items: center;
  gap: 20px;
  margin-bottom: 32px;
}

.flat-matrix-title-group {
  display: flex;
  align-items: center;
  gap: 10px;
}

.flat-red-dot {
  color: var(--red);
  font-size: 0.8rem;
}

.flat-matrix-title {
  font-family: var(--font-mono);
  font-size: 0.85rem;
  font-weight: 700;
  letter-spacing: 0.12em;
  color: #ffffff;
  text-transform: uppercase;
}

.flat-matrix-line {
  flex: 1;
  height: 1px;
  background: var(--border);
}

.flat-matrix-code {
  font-family: var(--font-mono);
  font-size: 0.82rem;
  font-weight: 700;
  letter-spacing: 0.08em;
  color: var(--red);
  text-transform: uppercase;
}

.flat-matrix-layout {
  display: grid;
  grid-template-columns: 1.4fr 1fr;
  gap: 24px;
}

.flat-matrix-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;
}

.flat-matrix-col {
  background: var(--bg-card);
  border: 1px solid var(--border);
  border-radius: var(--radius-sm);
  padding: 26px;
  display: flex;
  flex-direction: column;
  gap: 8px;
  transition: border-color var(--transition-fast);
}

.flat-matrix-col:hover {
  border-color: var(--red);
}

.matrix-symbol {
  font-size: 1.3rem;
  color: var(--red);
  margin-bottom: 8px;
}

.flat-matrix-col h4 {
  font-family: var(--font-display);
  font-size: 1.15rem;
  font-weight: 800;
  text-transform: uppercase;
  color: #ffffff;
}

.flat-matrix-col p {
  font-size: 0.9rem;
  color: var(--text-secondary);
  line-height: 1.5;
}

.why-matters-card {
  background: var(--bg-card);
  border: 1px solid var(--border-light);
  border-radius: var(--radius-sm);
  padding: 32px;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
}

.why-header {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 24px;
}

.why-red-box {
  color: var(--red);
  font-size: 0.8rem;
}

.why-title {
  font-family: var(--font-mono);
  font-size: 0.85rem;
  font-weight: 800;
  letter-spacing: 0.1em;
  color: #ffffff;
  text-transform: uppercase;
}

.why-list {
  list-style: none;
  display: flex;
  flex-direction: column;
  gap: 16px;
  margin-bottom: 28px;
}

.why-list li {
  font-size: 0.92rem;
  color: var(--text-secondary);
  display: flex;
  align-items: flex-start;
  gap: 10px;
  line-height: 1.5;
}

.why-arrow {
  color: var(--red);
  font-weight: 800;
}

.why-action-btn {
  width: 100%;
  background: var(--red);
  color: #ffffff;
  font-family: var(--font-display);
  font-weight: 700;
  font-size: 0.88rem;
  letter-spacing: 0.06em;
  text-transform: uppercase;
  padding: 14px;
  border: none;
  border-radius: var(--radius-xs);
  cursor: pointer;
  transition: background var(--transition-fast);
}

.why-action-btn:hover {
  background: var(--red-hover);
}

/* --------------------------------------------------------------------------
   COUNTDOWN TIMER BAR
   -------------------------------------------------------------------------- */
#countdown {
  width: 92%;
  max-width: 1360px;
  margin: 60px auto 100px;
  background: var(--bg-card);
  border: 1px solid var(--border);
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
   EDITORIAL HEADERS & LABELS
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
  margin: 70px auto;
  width: 92%;
  max-width: 1360px;
}

/* --------------------------------------------------------------------------
   ABOUT SECTION
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
  background: var(--bg-card);
  border: 1px solid var(--border);
  border-radius: var(--radius-sm);
  padding: 24px;
  display: flex;
  flex-direction: column;
  gap: 6px;
  transition: border-color var(--transition-fast);
}

.about-stat:hover {
  border-color: var(--border-hover);
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
  background: var(--bg-card);
  border: 1px solid var(--border);
  border-radius: var(--radius-sm);
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
  background: var(--bg-card);
  border: 1px solid var(--border);
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
  background: var(--bg-card);
  border: 1px solid var(--border);
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
  background: var(--bg-card-hover);
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
  border: 1px solid var(--border);
  padding: 6px 12px;
  border-radius: var(--radius-xs);
  width: fit-content;
  display: inline-block;
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
  border: 1px solid var(--border);
  border-radius: var(--radius-sm);
  overflow: hidden;
  background: var(--bg-card);
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
  background: var(--bg-card);
  border: 1px solid var(--border);
  color: var(--white);
  padding: 8px 14px;
  border-radius: var(--radius-xs);
}

/* --------------------------------------------------------------------------
   SECRETARIAT CAROUSEL
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
  scrollbar-color: var(--border) transparent;
}

.sec-card {
  flex: 0 0 240px;
  background: var(--bg-card);
  border: 1px solid var(--border);
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
  background: #181820;
  border: 1px solid var(--border);
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
  background: var(--bg-card);
  border: 1px solid var(--border);
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
  background: var(--bg-card);
  border: 1px solid var(--border);
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
   MODALS (FLAT CONVERSATIONAL REGISTRATION)
   -------------------------------------------------------------------------- */
.modal-overlay {
  position: fixed;
  inset: 0;
  z-index: 10000;
  background: rgba(5, 5, 8, 0.92);
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
  background: var(--bg-modal);
  border: 1px solid var(--border-light);
  border-radius: var(--radius-sm);
  padding: 40px;
  max-height: 90vh;
  overflow-y: auto;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.9);
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
  background: #1c1c24;
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

.selection-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;
}

.selection-card {
  background: var(--bg-card);
  border: 1px solid var(--border);
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
  background: #14141a;
  border: 1px solid #2e2e38;
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
  background: #14141a;
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
  border-radius: var(--radius-xs);
  cursor: pointer;
  text-transform: uppercase;
  transition: all var(--transition-fast);
}

.btn-back:hover {
  background: #1e1e26;
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

/* Payment Card */
.payment-banner {
  background: #16161e;
  border: 1px solid var(--border);
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
  background: #121218;
  border: 1px solid var(--border);
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
  background: #1a1a22;
  border: 1px solid var(--border);
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
  background: #14141a;
  border: 1px solid #2e2e38;
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
  border-top: 1px solid var(--border);
  background: #060608;
  padding: 60px 0 40px;
}

.footer-top {
  width: 92%;
  max-width: 1360px;
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
  width: 92%;
  max-width: 1360px;
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
  color: #666675;
  text-transform: uppercase;
}

.footer-date-pill {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  background: #14141a;
  border: 1px solid var(--border);
  padding: 6px 14px;
  border-radius: var(--radius-xs);
  color: #ffffff;
}

.pill-dot {
  width: 6px;
  height: 6px;
  background: var(--red);
  border-radius: 50%;
}

/* --------------------------------------------------------------------------
   RESPONSIVE DESIGN (TABLET & MOBILE)
   -------------------------------------------------------------------------- */
@media (max-width: 1024px) {
  .hero-meta {
    grid-template-columns: repeat(2, 1fr);
  }
  .flat-matrix-layout {
    grid-template-columns: 1fr;
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
  .flat-matrix-grid {
    grid-template-columns: 1fr;
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

fs.writeFileSync(path.join(__dirname, '../app/globals.css'), globalsCss, 'utf8');
console.log('Successfully updated app/globals.css with flat design system');
