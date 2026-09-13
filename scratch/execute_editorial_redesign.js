const fs = require('fs');
const path = require('path');

// 1. EXTRACT RAW HTML FROM index_archive.html
const raw = fs.readFileSync('index_archive.html', 'utf8');
const lines = raw.split('\n');

const bodyStartIdx = lines.findIndex(l => /<body[\s>]/i.test(l));
const mainScriptStartIdx = lines.findIndex((l, i) => i > 5000 && l.includes('<script>'));

let bodyLines = lines.slice(bodyStartIdx + 1, mainScriptStartIdx);
let bodyHtml = bodyLines.join('\n');

// Replace external image URLs with clean local paths
bodyHtml = bodyHtml.replace(/https:\/\/resolvemun.in\/images\//g, '/images/');

// Ensure committeePrompt is present
if (!bodyHtml.includes('id="committeePrompt"')) {
  const promptMarkup = `
<div aria-hidden="true" class="committee-prompt" id="committeePrompt">
  <div class="committee-prompt__text">
    CHOOSE YOUR COMMITTEE
    <span class="committee-prompt__subtext">Background guides are live</span>
  </div>
</div>
`;
  bodyHtml = bodyHtml.replace('</nav>', '</nav>\n' + promptMarkup);
}

// Ensure regModal has progress bar
if (!bodyHtml.includes('id="regProgressFill"')) {
  bodyHtml = bodyHtml.replace(
    '<div class="modal-header">',
    '<div class="modal-progress-bar"><div class="modal-progress-fill" id="regProgressFill" style="width: 33.33%;"></div></div>\n    <div class="modal-header">\n      <div class="step-indicator" id="regStepBadge">Step 01 / 03 · Personal Details</div>'
  );
}

// Re-write the HERO section to be an authoritative editorial composition
const heroSectionPattern = /<section id="hero">[\s\S]*?<\/section>/;

const editorialHero = `<section id="hero">
  <div class="hero-container">
    <div class="hero-content">
      <div class="hero-eyebrow">
        <span class="eyebrow-pill">Edition 2.0</span>
        <span class="eyebrow-date">June 12th — 14th, 2026 · Hyderabad, India</span>
      </div>
      
      <h1 class="hero-title">
        <span class="title-primary">RESOLVE</span>
        <span class="title-secondary">MUN 2.0</span>
      </h1>
      
      <p class="hero-manifesto">
        Where diplomacy meets ambition. Hyderabad’s premier Model United Nations conference returns—challenging delegates to debate, deliberate, and lead with intellectual rigor on the global stage.
      </p>
      
      <div class="hero-actions">
        <button class="btn-primary hero-reg-btn" onclick="openSelectionModal()">
          <span>Register Now</span>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="7" y1="17" x2="17" y2="7"></line><polyline points="7 7 17 7 17 17"></polyline></svg>
        </button>
        <a href="documents/Delegate Brochure.pdf" target="_blank" class="btn-secondary">
          <span>Delegate Brochure</span>
        </a>
      </div>

      <div class="hero-venue-tag">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path><circle cx="12" cy="10" r="3"></circle></svg>
        Hosted at Laurus The Universal School, Hyderabad
      </div>
    </div>

    <div class="hero-visual">
      <div class="emblem-editorial-frame">
        <div class="emblem-halo"></div>
        <img src="/images/Logo.svg" alt="Resolve MUN 2026 Diplomatic Emblem" class="hero-emblem-img">
        <div class="emblem-caption">
          <span>THE DIPLOMATIC CONCLAVE</span>
          <strong>RESOLVE · REFORM · RECONCILE</strong>
        </div>
      </div>
    </div>
  </div>

  <!-- THE CONFERENCE AT A GLANCE (EDITORIAL HORIZONTAL STATS BAR) -->
  <div class="hero-stats-bar">
    <div class="stat-item">
      <span class="stat-num" data-target="2026">2026</span>
      <span class="stat-label">Edition</span>
    </div>
    <div class="stat-divider"></div>
    <div class="stat-item">
      <div class="stat-num-wrapper">
        <span class="stat-num" data-target="250">250</span><span class="stat-suffix">+</span>
      </div>
      <span class="stat-label">Delegates</span>
    </div>
    <div class="stat-divider"></div>
    <div class="stat-item">
      <span class="stat-num" data-target="7">7</span>
      <span class="stat-label">Committees</span>
    </div>
    <div class="stat-divider"></div>
    <div class="stat-item">
      <span class="stat-num" data-target="3">3</span>
      <span class="stat-label">Days of Debate</span>
    </div>
    <div class="stat-divider"></div>
    <div class="stat-item stat-item--highlight">
      <span class="stat-num">₹1.30L</span>
      <span class="stat-label">Cash Rewards</span>
    </div>
  </div>
</section>`;

if (heroSectionPattern.test(bodyHtml)) {
  bodyHtml = bodyHtml.replace(heroSectionPattern, editorialHero);
  console.log('Successfully applied Editorial Hero to pageContent!');
} else {
  console.error('Failed to match hero section pattern in bodyHtml');
}

// Write clean pageContent.js
fs.writeFileSync('app/pageContent.js', `// Clean authentic Resolve MUN 2.0 with Editorial Redesign
export const homeHtml = ${JSON.stringify(bodyHtml)};
`, 'utf8');

console.log('Successfully wrote app/pageContent.js');
