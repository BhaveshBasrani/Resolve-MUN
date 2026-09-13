const fs = require('fs');

const themeCss = `

/* ==========================================================================
   RESOLVE MUN 2.0 — UNIFIED DESIGN SYSTEM & THEME ENGINE
   Minimal Boxy Soft Typeform-Inspired Aesthetics & Mobile Perfection
   ========================================================================== */

:root {
  --theme-bg-base: #050508;
  --theme-bg-surface: #0a0d1e;
  --theme-card-bg: rgba(255, 255, 255, 0.035);
  --theme-card-hover: rgba(255, 255, 255, 0.065);
  --theme-card-border: rgba(255, 255, 255, 0.1);
  --theme-card-border-hover: rgba(99, 102, 241, 0.45);
  --theme-text-main: #ffffff;
  --theme-text-sub: rgba(255, 255, 255, 0.7);
  --theme-text-muted: rgba(255, 255, 255, 0.4);
  --theme-input-bg: rgba(255, 255, 255, 0.04);
  --theme-input-border: rgba(255, 255, 255, 0.12);
  --theme-input-focus-border: rgba(99, 102, 241, 0.8);
  --theme-input-focus-shadow: rgba(99, 102, 241, 0.25);
  --theme-modal-bg: rgba(7, 10, 26, 0.96);
  --theme-modal-border: rgba(255, 255, 255, 0.14);
}

/* --------------------------------------------------------------------------
   PREMIUM WHITE THEME (Luxury Editorial Alabaster)
   -------------------------------------------------------------------------- */
html.theme-light,
body.theme-light {
  --theme-bg-base: #f8fafc;
  --theme-bg-surface: #ffffff;
  --theme-card-bg: #ffffff;
  --theme-card-hover: #f1f5f9;
  --theme-card-border: rgba(0, 0, 0, 0.09);
  --theme-card-border-hover: rgba(79, 70, 229, 0.5);
  --theme-text-main: #090d16;
  --theme-text-sub: #334155;
  --theme-text-muted: #64748b;
  --theme-input-bg: #f8fafc;
  --theme-input-border: #cbd5e1;
  --theme-input-focus-border: #4f46e5;
  --theme-input-focus-shadow: rgba(79, 70, 229, 0.15);
  --theme-modal-bg: #ffffff;
  --theme-modal-border: rgba(0, 0, 0, 0.1);
  --black: #f8fafc !important;
  --deep: #f1f5f9 !important;
  --white: #090d16 !important;
  --card-bg: #ffffff !important;
  --card-border: rgba(0, 0, 0, 0.09) !important;
  background-color: #f8fafc !important;
  color: #090d16 !important;
}

/* Light Theme Component Overrides */
.theme-light #main-container,
.theme-light section,
.theme-light .page-wrapper {
  background-color: transparent !important;
  color: #090d16 !important;
}

.theme-light p,
.theme-light span:not([class*="badge"]):not([class*="pill"]):not([class*="dot"]):not([class*="text-indigo"]):not([class*="text-blue"]):not([class*="text-emerald"]):not([class*="text-amber"]),
.theme-light li {
  color: #334155 !important;
}

.theme-light h1,
.theme-light h2,
.theme-light h3,
.theme-light h4,
.theme-light .hero-title,
.theme-light .section-title,
.theme-light .modal-title,
.theme-light .cta-title {
  color: #090d16 !important;
  text-shadow: none !important;
}

/* Light Theme Cards & Containers */
.theme-light .selection-card,
.theme-light .committee-card,
.theme-light .sec-card,
.theme-light .about-stat,
.theme-light .letter-container,
.theme-light .oc-card,
.theme-light .eb-card,
.theme-light .releasing-soon-card,
.theme-light .boxy-card,
.theme-light .payment-card {
  background: #ffffff !important;
  border-color: rgba(0, 0, 0, 0.09) !important;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.04), 0 1px 3px rgba(0, 0, 0, 0.02) !important;
}

.theme-light .about-stat .num {
  color: #090d16 !important;
}

.theme-light .letter-container {
  background: #ffffff !important;
  border: 1px solid rgba(0, 0, 0, 0.08) !important;
}

.theme-light .letter-content p {
  color: #1e293b !important;
}

.theme-light .letter-signature .sig-details h4 {
  color: #090d16 !important;
}

.theme-light .word-carousel-strip {
  background: #f1f5f9 !important;
  border-color: rgba(0, 0, 0, 0.08) !important;
  color: #334155 !important;
}

.theme-light .marquee-track span {
  color: #475569 !important;
}

.theme-light .hero-grid {
  background-image: 
    linear-gradient(to right, rgba(0, 0, 0, 0.04) 1px, transparent 1px),
    linear-gradient(to bottom, rgba(0, 0, 0, 0.04) 1px, transparent 1px) !important;
}

/* Light Theme Floating Navbar */
.theme-light header > div {
  background: rgba(255, 255, 255, 0.88) !important;
  border-color: rgba(0, 0, 0, 0.08) !important;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.06), 0 1px 3px rgba(0, 0, 0, 0.03) !important;
}

.theme-light .nav-pill-link {
  color: #475569 !important;
}

.theme-light .nav-pill-link:hover {
  color: #090d16 !important;
  background: rgba(0, 0, 0, 0.04) !important;
}

.theme-light header a span {
  color: #090d16 !important;
}

/* Light Theme Modals */
.theme-light .modal-overlay {
  background: rgba(15, 23, 42, 0.45) !important;
  backdrop-filter: blur(24px) !important;
  -webkit-backdrop-filter: blur(24px) !important;
}

.theme-light .modal-content {
  background: #ffffff !important;
  border: 1px solid rgba(0, 0, 0, 0.1) !important;
  box-shadow: 0 30px 80px rgba(0, 0, 0, 0.16), 0 4px 16px rgba(0, 0, 0, 0.04) !important;
  color: #090d16 !important;
}

.theme-light .modal-close {
  background: #f1f5f9 !important;
  border: 1px solid #e2e8f0 !important;
  color: #475569 !important;
}

.theme-light .modal-close:hover {
  background: #e2e8f0 !important;
  color: #090d16 !important;
}

.theme-light .modal-pretitle {
  color: #4f46e5 !important;
}

.theme-light .modal-subtitle {
  color: #64748b !important;
}

.theme-light .form-group label {
  color: #1e293b !important;
}

.theme-light .form-group input,
.theme-light .form-group select,
.theme-light .form-group textarea {
  background: #f8fafc !important;
  border: 1px solid #cbd5e1 !important;
  color: #090d16 !important;
}

.theme-light .form-group input::placeholder,
.theme-light .form-group textarea::placeholder {
  color: #94a3b8 !important;
}

.theme-light .form-group input:focus,
.theme-light .form-group select:focus,
.theme-light .form-group textarea:focus {
  background: #ffffff !important;
  border-color: #4f46e5 !important;
  box-shadow: 0 0 0 3px rgba(79, 70, 229, 0.15) !important;
}

.theme-light .btn-back {
  background: #f1f5f9 !important;
  border: 1px solid #cbd5e1 !important;
  color: #334155 !important;
}

.theme-light .btn-back:hover {
  background: #e2e8f0 !important;
  color: #090d16 !important;
}

/* Light Theme Footer */
.theme-light .footer-theme-container {
  background: #ffffff !important;
  border-top: 1px solid rgba(0, 0, 0, 0.08) !important;
  color: #090d16 !important;
}

.theme-light .footer-grid-border {
  border-color: rgba(0, 0, 0, 0.08) !important;
}

.theme-light .footer-subtext,
.theme-light .footer-bottom-bar,
.theme-light .footer-links a,
.theme-light .footer-links button {
  color: #475569 !important;
}

.theme-light .footer-col-title {
  color: #4f46e5 !important;
}

.theme-light .theme-toggle-btn {
  background: #f8fafc !important;
  border-color: #e2e8f0 !important;
}

.theme-light .theme-label-main {
  color: #090d16 !important;
}

.theme-light .theme-label-sub {
  color: #64748b !important;
}

.theme-light .theme-switch-pill {
  background: #e2e8f0 !important;
  color: #334155 !important;
}

/* --------------------------------------------------------------------------
   MINIMAL BOXY SOFT TYPEFORM-INSPIRED SELECTION MODAL
   -------------------------------------------------------------------------- */
.selection-modal-content {
  max-width: 660px !important;
  padding: 36px 32px !important;
  border-radius: 26px !important;
}

.modal-pretitle {
  font-family: 'Inter', monospace, sans-serif;
  font-size: 0.72rem;
  font-weight: 700;
  letter-spacing: 0.22em;
  text-transform: uppercase;
  color: #818cf8;
  margin-bottom: 6px;
}

.selection-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 14px;
  margin-top: 24px;
}

.selection-card {
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  border-radius: 18px;
  padding: 20px;
  background: var(--theme-card-bg);
  border: 1px solid var(--theme-card-border);
  transition: all 0.22s cubic-bezier(0.16, 1, 0.3, 1);
  cursor: pointer;
  position: relative;
  overflow: hidden;
  min-height: 155px;
}

.selection-card:hover:not(.selection-card--disabled) {
  transform: translateY(-2px);
  border-color: var(--theme-card-border-hover);
  background: var(--theme-card-hover);
  box-shadow: 0 12px 32px rgba(99, 102, 241, 0.12);
}

.selection-card:active:not(.selection-card--disabled) {
  transform: translateY(0px) scale(0.99);
}

.selection-card-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 12px;
}

.selection-badge {
  font-family: 'Inter', monospace, sans-serif;
  font-size: 0.65rem;
  font-weight: 800;
  letter-spacing: 0.14em;
  text-transform: uppercase;
  padding: 3px 8px;
  border-radius: 6px;
  display: inline-block;
  line-height: 1;
}

.badge-blue {
  background: rgba(59, 130, 246, 0.15);
  color: #60a5fa;
  border: 1px solid rgba(59, 130, 246, 0.3);
}

.badge-purple {
  background: rgba(168, 85, 247, 0.15);
  color: #c084fc;
  border: 1px solid rgba(168, 85, 247, 0.3);
}

.badge-amber {
  background: rgba(245, 158, 11, 0.15);
  color: #fbbf24;
  border: 1px solid rgba(245, 158, 11, 0.3);
}

.badge-indigo {
  background: rgba(99, 102, 241, 0.15);
  color: #a5b4fc;
  border: 1px solid rgba(99, 102, 241, 0.3);
}

.badge-closed {
  background: rgba(255, 255, 255, 0.05);
  color: rgba(255, 255, 255, 0.4);
  border: 1px solid rgba(255, 255, 255, 0.08);
}

.selection-arrow {
  font-size: 0.95rem;
  color: var(--theme-text-muted);
  transition: transform 0.2s, color 0.2s;
}

.selection-card:hover .selection-arrow {
  transform: translateX(3px);
  color: #818cf8;
}

.selection-card-body h3 {
  font-family: 'Inter', sans-serif !important;
  font-size: 1.08rem !important;
  font-weight: 700 !important;
  color: var(--theme-text-main) !important;
  letter-spacing: -0.01em !important;
  margin-bottom: 4px !important;
}

.selection-card-body p {
  font-size: 0.76rem !important;
  color: var(--theme-text-sub) !important;
  line-height: 1.4 !important;
  margin-bottom: 0 !important;
}

.selection-card-action {
  margin-top: 14px;
}

.selection-btn-ghost {
  font-size: 0.72rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  color: #818cf8;
  display: inline-flex;
  align-items: center;
  gap: 4px;
}

.selection-card--disabled {
  opacity: 0.55;
  cursor: not-allowed;
  filter: grayscale(0.5);
}

/* Typeform Multi-Step Progress Indicator */
.typeform-step-indicator {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  margin: 18px 0 24px;
  padding: 6px 12px;
  border-radius: 9999px;
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid rgba(255, 255, 255, 0.08);
  width: fit-content;
  margin-left: auto;
  margin-right: auto;
}

.theme-light .typeform-step-indicator {
  background: #f1f5f9;
  border-color: #e2e8f0;
}

.step-pill {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  font-size: 0.72rem;
  font-weight: 600;
  color: var(--theme-text-muted);
  transition: all 0.2s;
}

.step-pill.active {
  color: var(--theme-text-main);
}

.step-pill span {
  width: 18px;
  height: 18px;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.1);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.65rem;
  font-weight: 700;
}

.step-pill.active span {
  background: #6366f1;
  color: #ffffff;
}

.step-divider {
  width: 16px;
  height: 1px;
  background: rgba(255, 255, 255, 0.1);
}

.theme-light .step-divider {
  background: #cbd5e1;
}

/* --------------------------------------------------------------------------
   CTA BUTTON UNIFICATION (MATCHES HERO METALBUTTON)
   -------------------------------------------------------------------------- */
.cta-btn-hero-match {
  position: relative !important;
  display: inline-flex !important;
  align-items: center !important;
  justify-content: center !important;
  height: 48px !important;
  min-height: 48px !important;
  padding: 0 32px !important;
  border-radius: 9999px !important;
  font-family: 'Inter', system-ui, sans-serif !important;
  font-size: 0.8rem !important;
  font-weight: 800 !important;
  letter-spacing: 0.12em !important;
  text-transform: uppercase !important;
  color: #ffffff !important;
  background: linear-gradient(135deg, #3b82f6 0%, #6366f1 50%, #9333ea 100%) !important;
  border: 1px solid rgba(255, 255, 255, 0.3) !important;
  box-shadow: 
    0 10px 30px rgba(99, 102, 241, 0.4),
    0 0 20px rgba(59, 130, 246, 0.2),
    inset 0 1px 1px rgba(255, 255, 255, 0.4) !important;
  transition: all 0.25s cubic-bezier(0.16, 1, 0.3, 1) !important;
  cursor: pointer !important;
  text-decoration: none !important;
  user-select: none !important;
}

.cta-btn-hero-match:hover {
  transform: translateY(-2px) scale(1.02) !important;
  box-shadow: 
    0 14px 40px rgba(99, 102, 241, 0.55),
    0 0 30px rgba(59, 130, 246, 0.35),
    inset 0 1px 2px rgba(255, 255, 255, 0.6) !important;
}

.cta-btn-hero-match:active {
  transform: translateY(1px) scale(0.98) !important;
}

.cta-btn-secondary {
  background: rgba(255, 255, 255, 0.05) !important;
  border: 1px solid rgba(255, 255, 255, 0.2) !important;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.3) !important;
  color: rgba(255, 255, 255, 0.9) !important;
}

.cta-btn-secondary:hover {
  background: rgba(255, 255, 255, 0.12) !important;
  border-color: rgba(255, 255, 255, 0.4) !important;
  color: #ffffff !important;
}

.theme-light .cta-btn-secondary {
  background: #ffffff !important;
  border-color: rgba(0, 0, 0, 0.15) !important;
  color: #090d16 !important;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.06) !important;
}

/* --------------------------------------------------------------------------
   MOBILE RESPONSIVENESS REFINEMENT (320px - 640px)
   -------------------------------------------------------------------------- */
@media (max-width: 640px) {
  /* Headings without awkward line wrapping */
  .hero-title {
    font-size: clamp(2.3rem, 10.5vw, 4.2rem) !important;
    letter-spacing: -0.01em !important;
    text-wrap: balance !important;
  }

  .cta-title {
    font-size: clamp(2rem, 8vw, 3.2rem) !important;
    line-height: 1.08 !important;
    letter-spacing: -0.01em !important;
    text-wrap: balance !important;
  }

  .section-title {
    font-size: clamp(1.7rem, 6.5vw, 2.6rem) !important;
    line-height: 1.12 !important;
    text-wrap: balance !important;
  }

  /* Single Column Selection Grid on Phones */
  .selection-grid {
    grid-template-columns: 1fr !important;
    gap: 10px !important;
  }

  .selection-modal-content {
    padding: 24px 18px !important;
    border-radius: 22px !important;
    width: 95% !important;
  }

  .selection-card {
    min-height: auto !important;
    padding: 16px !important;
  }

  /* CTA actions stacked cleanly */
  .cta-actions {
    flex-direction: column !important;
    gap: 12px !important;
    width: 100% !important;
    max-width: 320px !important;
    margin: 0 auto !important;
  }

  .cta-btn-hero-match {
    width: 100% !important;
  }

  /* Modal inputs single column */
  .form-group[style*="grid-template-columns"] {
    grid-template-columns: 1fr !important;
    gap: 12px !important;
  }

  /* Countdown pill on phone */
  .countdown-unit {
    min-width: unset !important;
    width: 100% !important;
    padding: 12px 20px !important;
  }

  /* Prevent any horizontal screen wobbling */
  html, body {
    overflow-x: hidden !important;
    max-width: 100vw !important;
  }
}
`;

let globalsCss = fs.readFileSync('app/globals.css', 'utf8');
globalsCss = globalsCss + themeCss;
fs.writeFileSync('app/globals.css', globalsCss, 'utf8');
console.log('Successfully appended Theme & Minimal Boxy Soft Design System to app/globals.css');
