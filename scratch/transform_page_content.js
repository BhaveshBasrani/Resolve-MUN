const fs = require('fs');

let content = fs.readFileSync('app/pageContent.js', 'utf8');

// 1. Remove the old static <footer>...</footer>
const footerRegex = /<!-- FOOTER -->[\s\S]*?<\/footer>/;
if (footerRegex.test(content)) {
  content = content.replace(footerRegex, '<!-- Footer rendered via React component -->');
  console.log('Successfully removed old static footer from pageContent.js');
} else {
  console.log('Old footer not matched with regex, searching alternative');
}

// 2. Modernize the Selection Modal
const oldSelectionModalRegex = /<!-- SELECTION MODAL -->[\s\S]*?<\/div>\s*<\/div>\s*<\/div>/;
const newSelectionModal = `<!-- SELECTION MODAL (Minimal Boxy Soft Typeform) -->
  <div class=\\"modal-overlay\\" id=\\"selectionModal\\">
    <div class=\\"modal-content selection-modal-content\\">
      <button class=\\"modal-close\\" id=\\"closeSelectionModal\\" aria-label=\\"Close\\">
        <svg viewBox=\\"0 0 24 24\\" fill=\\"none\\" stroke=\\"currentColor\\" stroke-width=\\"1.5\\" stroke-linecap=\\"round\\" stroke-linejoin=\\"round\\">
          <line x1=\\"18\\" y1=\\"6\\" x2=\\"6\\" y2=\\"18\\"></line>
          <line x1=\\"6\\" y1=\\"6\\" x2=\\"18\\" y2=\\"18\\"></line>
        </svg>
      </button>
      
      <div class=\\"modal-header\\">
        <div class=\\"modal-pretitle\\">RESOLVE MUN 2.0 · INTAKE</div>
        <h2 class=\\"modal-title\\">CHOOSE YOUR PATHWAY</h2>
        <p class=\\"modal-subtitle\\">Select your official participation track for Hyderabad 2026</p>
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
  </div>`;

if (oldSelectionModalRegex.test(content)) {
  content = content.replace(oldSelectionModalRegex, newSelectionModal);
  console.log('Successfully modernized Selection Modal');
} else {
  console.log('Could not match old selection modal with regex');
}

// 3. Add Secretariat Application Modal if not present
if (!content.includes('id=\\"secModal\\"')) {
  const secModalHtml = `
  <!-- SECRETARIAT APPLICATION MODAL (Minimal Boxy Soft Typeform) -->
  <div class=\\"modal-overlay\\" id=\\"secModal\\">
    <canvas class=\\"modal-particles\\" id=\\"secModalParticles\\"></canvas>
    <div class=\\"modal-content\\">
      <button class=\\"modal-close\\" id=\\"closeSecModal\\" onclick=\\"closeSecModal()\\" aria-label=\\"Close\\">
        <svg viewBox=\\"0 0 24 24\\" fill=\\"none\\" stroke=\\"currentColor\\" stroke-width=\\"1.5\\" stroke-linecap=\\"round\\" stroke-linejoin=\\"round\\">
          <line x1=\\"18\\" y1=\\"6\\" x2=\\"6\\" y2=\\"18\\"></line>
          <line x1=\\"6\\" y1=\\"6\\" x2=\\"18\\" y2=\\"18\\"></line>
        </svg>
      </button>
      
      <div class=\\"modal-header\\">
        <div class=\\"modal-pretitle\\">EXECUTIVE LEADERSHIP · RESOLVE 2.0</div>
        <h2 class=\\"modal-title\\">SECRETARIAT APPLICATION</h2>
        <span class=\\"modal-subtitle\\">Join the Organizing Directorate</span>
      </div>

      <div class=\\"typeform-step-indicator\\" id=\\"secStepIndicator\\">
        <div class=\\"step-pill active\\" id=\\"secPill1\\"><span>1</span> Identity</div>
        <div class=\\"step-divider\\"></div>
        <div class=\\"step-pill\\" id=\\"secPill2\\"><span>2</span> Experience &amp; Vision</div>
        <div class=\\"step-divider\\"></div>
        <div class=\\"step-pill\\" id=\\"secPill3\\"><span>3</span> Submit</div>
      </div>
      
      <form id=\\"secRegForm\\" onsubmit=\\"window.submitSecForm ? window.submitSecForm(event) : event.preventDefault()\\">
        <!-- STEP 1: PERSONAL & DEPARTMENT -->
        <div class=\\"form-step active\\" id=\\"secStep1\\">
          <div class=\\"form-group\\">
            <label for=\\"secName\\">Full Name</label>
            <input type=\\"text\\" id=\\"secName\\" name=\\"name\\" autocomplete=\\"name\\" placeholder=\\"Enter your full name\\" required>
          </div>
          
          <div class=\\"form-group\\" style=\\"display: grid; grid-template-columns: 1fr 1fr; gap: 16px;\\">
            <div>
              <label for=\\"secPhone\\">Contact No (WhatsApp)</label>
              <input type=\\"tel\\" id=\\"secPhone\\" name=\\"phone\\" autocomplete=\\"tel\\" placeholder=\\"10-digit number\\" required pattern=\\"[0-9]{10}\\" minlength=\\"10\\" maxlength=\\"10\\">
            </div>
            <div>
              <label for=\\"secEmail\\">Email ID</label>
              <input type=\\"email\\" id=\\"secEmail\\" name=\\"email\\" autocomplete=\\"email\\" placeholder=\\"yourname@example.com\\" required>
            </div>
          </div>

          <div class=\\"form-group\\" style=\\"display: grid; grid-template-columns: 1fr 1fr; gap: 16px;\\">
            <div>
              <label for=\\"secInst\\">Institution (School/College)</label>
              <input type=\\"text\\" id=\\"secInst\\" name=\\"institute\\" autocomplete=\\"organization\\" placeholder=\\"Enter your institution\\" required>
            </div>
            <div>
              <label for=\\"secDept\\">Preferred Secretariat Department</label>
              <select id=\\"secDept\\" name=\\"department\\" required>
                <option value=\\"\\" disabled selected>Select Department</option>
                <option value=\\"Delegate Affairs\\">Delegate Affairs</option>
                <option value=\\"Marketing & Outreach\\">Marketing &amp; Outreach</option>
                <option value=\\"Design & Media\\">Design &amp; Media</option>
                <option value=\\"Logistics & Operations\\">Logistics &amp; Operations</option>
                <option value=\\"Policy & Academics\\">Policy &amp; Academics</option>
                <option value=\\"Finance & Sponsorship\\">Finance &amp; Sponsorship</option>
                <option value=\\"Culturals & Hospitality\\">Culturals &amp; Hospitality</option>
                <option value=\\"Security & Protocol\\">Security &amp; Protocol</option>
              </select>
            </div>
          </div>

          <button type=\\"button\\" class=\\"btn-next btn-full-width\\" onclick=\\"nextSecStep(2)\\">
            Next: Experience &amp; Vision
            <svg width=\\"16\\" height=\\"16\\" viewBox=\\"0 0 24 24\\" fill=\\"none\\" stroke=\\"currentColor\\" stroke-width=\\"2\\"><path d=\\"M5 12h14M12 5l7 7-7 7\\"/></svg>
          </button>
        </div>

        <!-- STEP 2: EXPERIENCE & VISION -->
        <div class=\\"form-step\\" id=\\"secStep2\\">
          <div class=\\"form-group\\">
            <label for=\\"secExp\\">Past MUN &amp; Organizing Experience</label>
            <textarea id=\\"secExp\\" name=\\"experience\\" rows=\\"3\\" placeholder=\\"List conferences attended, past roles, awards, or leadership posts...\\" required style=\\"resize: vertical; min-height: 90px;\\"></textarea>
          </div>

          <div class=\\"form-group\\">
            <label for=\\"secWhy\\">Why do you want to join the Secretariat &amp; what is your vision?</label>
            <textarea id=\\"secWhy\\" name=\\"vision\\" rows=\\"3\\" placeholder=\\"What unique strengths and ideas will you bring to Resolve MUN 2.0?\\" required style=\\"resize: vertical; min-height: 90px;\\"></textarea>
          </div>

          <div class=\\"form-group\\">
            <label for=\\"secPortfolio\\">Portfolio / Resume / LinkedIn URL (Optional)</label>
            <input type=\\"url\\" id=\\"secPortfolio\\" name=\\"portfolio\\" placeholder=\\"https://...\\">
          </div>

          <div class=\\"form-actions\\">
            <button type=\\"button\\" class=\\"btn-back\\" onclick=\\"nextSecStep(1)\\">Back</button>
            <button type=\\"button\\" class=\\"btn-next\\" onclick=\\"nextSecStep(3)\\">Review &amp; Submit</button>
          </div>
        </div>

        <!-- STEP 3: REVIEW & CONFIRMATION -->
        <div class=\\"form-step\\" id=\\"secStep3\\">
          <div class=\\"payment-banner\\" style=\\"background: linear-gradient(135deg, #1e1b4b 0%, #312e81 50%, #4338ca 100%);\\">
            <h3>DIRECTORATE APPLICATION DOSSIER</h3>
            <p style=\\"font-size: 0.7rem; opacity: 0.85; margin-top: 4px;\\">Direct Review by Secretary-General &amp; Executive Directorate</p>
          </div>

          <div class=\\"payment-card\\">
            <p style=\\"font-size: 0.82rem; color: rgba(255,255,255,0.8); line-height: 1.6; margin-bottom: 12px;\\">
              Thank you for applying to serve on the Resolve MUN 2.0 Secretariat. Applications are reviewed on a rolling basis. Shortlisted candidates will be contacted for an executive interview.
            </p>
            <div style=\\"padding: 12px; border-radius: 12px; background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.08); font-size: 0.75rem; color: #a5b4fc;\\">
              <strong>SELECTION STAGES:</strong> Dossier Screening &rarr; Departmental Interview &rarr; Official Appointment Letter
            </div>
          </div>

          <div class=\\"form-actions\\">
            <button type=\\"button\\" class=\\"btn-back\\" onclick=\\"nextSecStep(2)\\">Back</button>
            <button type=\\"submit\\" class=\\"btn-next\\" id=\\"secSubmitBtn\\">Submit Application</button>
          </div>
        </div>
      </form>
    </div>
  </div>
`;

  // Insert before closing modal or after ebModal
  const ebModalPos = content.indexOf('<!-- EB APPLICATION MODAL -->');
  if (ebModalPos !== -1) {
    content = content.slice(0, ebModalPos) + secModalHtml + content.slice(ebModalPos);
    console.log('Successfully inserted secModal into pageContent.js');
  } else {
    content = content + secModalHtml;
    console.log('Appended secModal to pageContent.js');
  }
}

// 4. Match CTA Buttons with Hero Buttons
const oldCtaRegex = /<div class=\\"cta-actions reveal\\">[\s\S]*?<\/div>\s*<\/div>\s*<\/section>/;
const newCta = `<div class=\\"cta-actions reveal\\">
      <button class=\\"adaptive-hero-btn cta-btn-hero-match\\" onclick=\\"window.selectPathway ? window.selectPathway('delegate') : (window.openRegistration ? window.openRegistration() : (window.openAuthModal ? window.openAuthModal() : alert('Opening Registration...')))\\">
        <span>REGISTER AS A DELEGATE</span>
      </button>
      <button class=\\"adaptive-hero-btn cta-btn-hero-match cta-btn-secondary\\" onclick=\\"window.selectPathway ? window.selectPathway('delegation') : (window.openDelRegistration ? window.openDelRegistration() : (window.openAuthModal ? window.openAuthModal() : alert('Opening Registration...')))\\">
        <span>REGISTER A DELEGATION</span>
      </button>
    </div>
  </div>
</section>`;

if (oldCtaRegex.test(content)) {
  content = content.replace(oldCtaRegex, newCta);
  console.log('Successfully matched CTA buttons with Hero buttons');
} else {
  console.log('Could not match old CTA with regex');
}

fs.writeFileSync('app/pageContent.js', content, 'utf8');
console.log('Done transforming app/pageContent.js');
