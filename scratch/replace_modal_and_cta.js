const fs = require('fs');
let content = fs.readFileSync('app/pageContent.js', 'utf8');

// 1. Replace Selection Modal
const selStartStr = '<div class=\\"modal-overlay\\" id=\\"selectionModal\\">';
const regStartStr = '<div class=\\"modal-overlay\\" id=\\"regModal\\">';

const selStart = content.indexOf(selStartStr);
const regStart = content.indexOf(regStartStr);

if (selStart !== -1 && regStart !== -1) {
  const newSelectionModal = `<div class=\\"modal-overlay\\" id=\\"selectionModal\\">
    <div class=\\"modal-content selection-modal-content\\">
      <button class=\\"modal-close\\" id=\\"closeSelectionModal\\" aria-label=\\"Close\\">
        <svg viewBox=\\"0 0 24 24\\" fill=\\"none\\" stroke=\\"currentColor\\" stroke-width=\\"1.5\\" stroke-linecap=\\"round\\" stroke-linejoin=\\"round\\">
          <line x1=\\"18\\" y1=\\"6\\" x2=\\"6\\" y2=\\"18\\"></line>
          <line x1=\\"6\\" y1=\\"6\\" x2=\\"18\\" y2=\\"18\\"></line>
        </svg>
      </button>
      
      <div class=\\"modal-header text-center\\">
        <div class=\\"modal-pretitle\\">RESOLVE MUN 2.0 · INTAKE</div>
        <h2 class=\\"modal-title\\">CHOOSE YOUR PATHWAY</h2>
        <p class=\\"modal-subtitle\\">Select your participation track for Hyderabad 2026</p>
      </div>

      <div class=\\"selection-grid\\">
        <!-- 1. Delegate -->
        <div class=\\"selection-card selection-card--delegate\\" onclick=\\"selectPathway('delegate')\\">
          <div class=\\"selection-card-header\\">
            <span class=\\"selection-badge badge-blue\\">INDIVIDUAL</span>
            <span class=\\"selection-arrow\\">&rarr;</span>
          </div>
          <div class=\\"selection-card-body\\">
            <h3>Delegate</h3>
            <p>Individual representative in flagship committee simulations with personal country allotment.</p>
          </div>
          <div class=\\"selection-card-action\\">
            <span class=\\"selection-btn-ghost\\">Register Now &rarr;</span>
          </div>
        </div>

        <!-- 2. Delegation -->
        <div class=\\"selection-card selection-card--delegation\\" onclick=\\"selectPathway('delegation')\\">
          <div class=\\"selection-card-header\\">
            <span class=\\"selection-badge badge-purple\\">INSTITUTION</span>
            <span class=\\"selection-arrow\\">&rarr;</span>
          </div>
          <div class=\\"selection-card-body\\">
            <h3>Delegation</h3>
            <p>Institutional group registration for schools and universities with dedicated faculty advisor coordination.</p>
          </div>
          <div class=\\"selection-card-action\\">
            <span class=\\"selection-btn-ghost\\">Register Group &rarr;</span>
          </div>
        </div>

        <!-- 3. OC -->
        <div class=\\"selection-card selection-card--oc\\" onclick=\\"selectPathway('oc')\\">
          <div class=\\"selection-card-header\\">
            <span class=\\"selection-badge badge-amber\\">OPERATIONS</span>
            <span class=\\"selection-arrow\\">&rarr;</span>
          </div>
          <div class=\\"selection-card-body\\">
            <h3>Organizing Committee</h3>
            <p>Join the backstage architects managing venue, delegate affairs, security, marketing, and media.</p>
          </div>
          <div class=\\"selection-card-action\\">
            <span class=\\"selection-btn-ghost\\">Apply for OC &rarr;</span>
          </div>
        </div>

        <!-- 4. Secretariat -->
        <div class=\\"selection-card selection-card--sec\\" onclick=\\"selectPathway('secretariat')\\">
          <div class=\\"selection-card-header\\">
            <span class=\\"selection-badge badge-indigo\\">LEADERSHIP</span>
            <span class=\\"selection-arrow\\">&rarr;</span>
          </div>
          <div class=\\"selection-card-body\\">
            <h3>Secretariat</h3>
            <p>Executive board leadership roles guiding policy, outreach, finance, logistics, and summit direction.</p>
          </div>
          <div class=\\"selection-card-action\\">
            <span class=\\"selection-btn-ghost\\">Apply for Secretariat &rarr;</span>
          </div>
        </div>

        <!-- 5. EB (Closed) -->
        <div class=\\"selection-card selection-card--disabled\\" onclick=\\"window.showCustomAlert ? window.showCustomAlert('Round 1 Executive Board applications are closed. Follow @mun.resolve for future announcements.', 'info') : alert('Round 1 EB Applications are closed.')\\">
          <div class=\\"selection-card-header\\">
            <span class=\\"selection-badge badge-closed\\">ROUND 1 CLOSED</span>
            <span class=\\"selection-arrow\\">&times;</span>
          </div>
          <div class=\\"selection-card-body\\">
            <h3>Executive Board</h3>
            <p>Chair prestigious committees and evaluate high-level debate. Round 1 intake concluded.</p>
          </div>
          <div class=\\"selection-card-action\\">
            <span class=\\"selection-btn-ghost opacity-40\\">Closed</span>
          </div>
        </div>
      </div>
    </div>
  </div>\r\n\r\n`;
  content = content.slice(0, selStart) + newSelectionModal + content.slice(regStart);
  console.log('Successfully replaced Selection Modal!');
} else {
  console.log('Could not find selectionModal boundaries:', selStart, regStart);
}

// 2. Replace CTA in #register
const ctaStartStr = '<div class=\\"cta-actions reveal\\">';
const ctaSecEndStr = '</section>';
const ctaStart = content.lastIndexOf(ctaStartStr);
const ctaEnd = content.indexOf(ctaSecEndStr, ctaStart);

if (ctaStart !== -1 && ctaEnd !== -1) {
  const newCta = `<div class=\\"cta-actions reveal\\">
      <button class=\\"adaptive-hero-btn cta-btn-hero-match\\" onclick=\\"window.selectPathway ? window.selectPathway('delegate') : (window.openRegistration ? window.openRegistration() : (window.openAuthModal ? window.openAuthModal() : alert('Opening Registration...')))\\">
        <span>REGISTER AS A DELEGATE</span>
      </button>
      <button class=\\"adaptive-hero-btn cta-btn-hero-match cta-btn-secondary\\" onclick=\\"window.selectPathway ? window.selectPathway('delegation') : (window.openDelRegistration ? window.openDelRegistration() : (window.openAuthModal ? window.openAuthModal() : alert('Opening Registration...')))\\">
        <span>REGISTER A DELEGATION</span>
      </button>
    </div>
  </div>\r\n`;
  content = content.slice(0, ctaStart) + newCta + content.slice(ctaEnd);
  console.log('Successfully updated CTA buttons to match Hero buttons!');
} else {
  console.log('Could not find CTA boundaries:', ctaStart, ctaEnd);
}

fs.writeFileSync('app/pageContent.js', content, 'utf8');
console.log('Done modifying pageContent.js');
