const fs = require('fs');

const raw = fs.readFileSync('index_archive.html', 'utf8');
const lines = raw.split('\n');

const bodyStartIdx = lines.findIndex(l => /<body[\s>]/i.test(l));
const mainScriptStartIdx = lines.findIndex((l, i) => i > 5000 && l.includes('<script>'));

let bodyLines = lines.slice(bodyStartIdx + 1, mainScriptStartIdx);
let bodyHtml = bodyLines.join('\n');

// 1. Ensure committeePrompt is included
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

// 2. Remove old radar rings and purple nodes from #committees if present
bodyHtml = bodyHtml.replace(/<div class="committees-radar">[\s\S]*?<\/div>\s*<\/div>/g, '');

// 3. Update Hero Section to the Flat Architectural Design (Image 2 Inspired)
const oldHeroRegex = /<section id="hero">[\s\S]*?<\/section>/;

const newHeroSection = `<section id="hero">
  <div class="hero-top-meta">
    <span class="hero-badge">[ 2026 // EDITION ]</span>
    <span class="hero-meta-text">JUNE 12TH — 14TH, 2026 · HYDERABAD, INDIA</span>
  </div>

  <h1 class="hero-title">
    <span>RESOLVE</span><br>
    <span class="mun">MUN 2.0</span>
  </h1>

  <div class="hero-flat-pill">RESOLVE. &nbsp;REFORM. &nbsp;RECONCILE.</div>

  <p class="hero-description-flat">
    Flat, uncompromising diplomacy. Resolve MUN 2.0 strips away the noise to focus on what truly matters: high-level debate, critical policy reform, and student leadership.
  </p>

  <div class="hero-actions reveal">
    <button class="btn-primary hero-reg-btn" onclick="openSelectionModal()"><span>REGISTER FOR 2.0 ↗</span></button>
    <a href="documents/Delegate Brochure.pdf" target="_blank" class="btn-secondary"><span>DELEGATE BROCHURE ↗</span></a>
  </div>

  <div class="hero-meta">
    <div class="hero-meta-item">
      <span class="label">EDITION</span>
      <span class="value" data-target="2026">0</span>
    </div>
    <div class="hero-meta-item">
      <span class="label">DELEGATES</span>
      <span class="value" data-target="250">0</span><span class="value-suffix">+</span>
    </div>
    <div class="hero-meta-item">
      <span class="label">COMMITTEES</span>
      <span class="value" data-target="7">0</span>
    </div>
    <div class="hero-meta-item">
      <span class="label">DAYS</span>
      <span class="value" data-target="3">0</span>
    </div>
  </div>

  <!-- HOW RESOLVE MUN WORKS (FLAT ARCHITECTURE MATRIX) -->
  <div class="flat-architecture-section">
    <div class="flat-matrix-header">
      <div class="flat-matrix-title-group">
        <span class="flat-red-dot">■</span>
        <span class="flat-matrix-title">HOW RESOLVE MUN WORKS</span>
      </div>
      <div class="flat-matrix-line"></div>
      <span class="flat-matrix-code">2026 // SYSTEM</span>
    </div>

    <div class="flat-matrix-layout">
      <div class="flat-matrix-grid">
        <div class="flat-matrix-col">
          <div class="matrix-symbol">■</div>
          <h4>SIMPLICITY</h4>
          <p>Eliminates procedural clutter for high-velocity, substance-driven diplomatic discourse.</p>
        </div>
        <div class="flat-matrix-col">
          <div class="matrix-symbol">●</div>
          <h4>BOLD COALITIONS</h4>
          <p>Forges dynamic alliances across 7 committees with 250+ ambitious delegates.</p>
        </div>
        <div class="flat-matrix-col">
          <div class="matrix-symbol">◪</div>
          <h4>CLEAR LAYOUT</h4>
          <p>Comprehensive study guides, transparent allocations, and real-world treaty formulation.</p>
        </div>
        <div class="flat-matrix-col">
          <div class="matrix-symbol">✚</div>
          <h4>FOCUS ON IMPACT</h4>
          <p>Over ₹1.30 Lakhs in cash rewards, national citations, and life-long leadership connections.</p>
        </div>
      </div>

      <div class="why-matters-card">
        <div class="why-header">
          <span class="why-red-box">■</span>
          <span class="why-title">WHY RESOLVE MATTERS</span>
        </div>
        <ul class="why-list">
          <li><span class="why-arrow">→</span> Develops decisive negotiation and oratory skills under pressure.</li>
          <li><span class="why-arrow">→</span> Executive Board vetted from top tier national debate circuits.</li>
          <li><span class="why-arrow">→</span> Hosted on an expansive, modern green campus in Hyderabad.</li>
          <li><span class="why-arrow">→</span> Keeps the focus strictly on delegate growth and recognition.</li>
        </ul>
        <div class="why-footer-action">
          <button class="why-action-btn" onclick="openSelectionModal()"><span>JOIN THE CONCLAVE ↗</span></button>
        </div>
      </div>
    </div>
  </div>
</section>`;

if (oldHeroRegex.test(bodyHtml)) {
  bodyHtml = bodyHtml.replace(oldHeroRegex, newHeroSection);
  console.log('Replaced Hero Section with Flat Architecture Matrix');
} else {
  console.error('Could not find old hero section');
}

// 4. In regModal, ensure progress bar is present
if (!bodyHtml.includes('id="regProgressFill"')) {
  bodyHtml = bodyHtml.replace(
    '<div class="modal-header">',
    '<div class="modal-progress-bar"><div class="modal-progress-fill" id="regProgressFill" style="width: 33.33%;"></div></div>\n    <div class="modal-header">\n      <div class="step-indicator" id="regStepBadge">Step 01 / 03 · Personal Details</div>'
  );
}

fs.writeFileSync('app/pageContent.js', `// Exactly extracted line-by-line from index_archive.html with Flat Architecture Redesign
export const homeHtml = ${JSON.stringify(bodyHtml)};
`, 'utf8');

console.log('Successfully updated app/pageContent.js with valid JSON.stringify!');
