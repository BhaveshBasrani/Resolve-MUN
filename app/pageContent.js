// Cleaned, deduplicated, and optimized pageContent.js for Resolve MUN 2.0
export const homeHtml = `
<!-- SUBMIT SPINNER (hidden by default) -->
<div id="submitSpinner" style="display:none;position:fixed;inset:0;z-index:99999;background:rgba(0,0,0,0.65);backdrop-filter:blur(4px);align-items:center;justify-content:center;">
  <div style="text-align:center;color:#fff;">
    <div style="width:48px;height:48px;border-radius:50%;border:4px solid rgba(255,255,255,0.15);border-top-color:#818cf8;animation:spin 0.8s linear infinite;margin:0 auto 10px;"></div>
    <div style="font-family:'Oswald',sans-serif;letter-spacing:0.08em;font-weight:600;font-size:13px;text-transform:uppercase;">Submitting...</div>
  </div>
</div>

<!-- CUSTOM ALERT CONTAINER -->
<div id="custom-alert-container"></div>
<div id="loading-screen">
  <img src="/images/Logo.svg" alt="Resolve MUN 2026 - Official Logo" class="loader-logo">
  <div class="loader-bar-container">
    <div class="loader-bar-fill"></div>
  </div>
  <span class="loader-text">Initializing Diplomacy</span>
</div>

<!-- SELECTION MODAL -->
<div class="modal-overlay" id="selectionModal">
  <div class="modal-content selection-modal-content">
    <button class="modal-close" id="closeSelectionModal" aria-label="Close">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
        <line x1="18" y1="6" x2="6" y2="18"></line>
        <line x1="6" y1="6" x2="18" y2="18"></line>
      </svg>
    </button>
    
    <div class="modal-header text-center">
      <div class="modal-pretitle">RESOLVE MUN 2.0 · INTAKE</div>
      <h2 class="modal-title">CHOOSE YOUR PATHWAY</h2>
      <p class="modal-subtitle">Select your participation track for Hyderabad 2026</p>
    </div>

    <div class="selection-top-grid">
      <!-- 1. Delegate -->
      <div class="selection-card selection-card--delegate selection-card--featured" onclick="selectPathway('delegate')">
        <div class="selection-card-header">
          <span class="selection-badge selection-badge--primary">INDIVIDUAL</span>
        </div>
        <div class="selection-card-body">
          <h3>DELEGATE</h3>
          <p>Single delegate representation in one specialized diplomatic committee.</p>
        </div>
        <div class="selection-card-action">
          <span class="selection-btn-primary">Apply Now &rarr;</span>
        </div>
      </div>

      <!-- 2. Delegation -->
      <div class="selection-card selection-card--delegation selection-card--featured" onclick="selectPathway('delegation')">
        <div class="selection-card-header">
          <span class="selection-badge selection-badge--primary">INSTITUTION</span>
        </div>
        <div class="selection-card-body">
          <h3>DELEGATION</h3>
          <p>School or university delegations with 8+ student representatives.</p>
        </div>
        <div class="selection-card-action">
          <span class="selection-btn-primary">Register Delegation &rarr;</span>
        </div>
      </div>
    </div>

    <div class="selection-bottom-grid">
      <!-- 3. Secretariat -->
      <div class="selection-card selection-card--sec" onclick="selectPathway('secretariat')">
        <div class="selection-card-header">
          <span class="selection-badge selection-badge--accent">EXECUTIVE</span>
        </div>
        <div class="selection-card-body">
          <h3>SECRETARIAT</h3>
          <p>High-command leadership, USG positions, and directors.</p>
        </div>
        <div class="selection-card-action">
          <span class="selection-btn-primary">Open Application &rarr;</span>
        </div>
      </div>

      <!-- 4. OC -->
      <div class="selection-card selection-card--oc selection-card--closed" onclick="window.showCustomAlert ? window.showCustomAlert('OC applications are closed.', 'info') : alert('OC Applications are closed.')">
        <div class="selection-card-header">
          <span class="selection-badge selection-badge--muted">LEADERSHIP</span>
        </div>
        <div class="selection-card-body">
          <h3>ORGANIZING COMMITTEE</h3>
          <p>Operations, crisis design, and logistics.</p>
        </div>
        <div class="selection-card-action">
          <span class="selection-btn-ghost opacity-40">Closed</span>
        </div>
      </div>

      <!-- 5. EB (Disabled) -->
      <div class="selection-card selection-card--disabled selection-card--closed" onclick="window.showCustomAlert ? window.showCustomAlert('Round 1 Executive Board applications are closed. Follow @mun.resolve for future announcements.', 'info') : alert('Round 1 EB Applications are closed.')">
        <div class="selection-card-header">
          <span class="selection-badge selection-badge--muted">EXECUTIVE BOARD</span>
        </div>
        <div class="selection-card-body">
          <h3>EXECUTIVE BOARD</h3>
          <p>Chairs and committee moderation.</p>
        </div>
        <div class="selection-card-action">
          <span class="selection-btn-ghost opacity-40">Closed</span>
        </div>
      </div>
    </div>
  </div>
</div>

<!-- DELEGATE REGISTRATION MODAL -->
<div class="modal-overlay" id="regModal">
  <div class="modal-content">
    <button class="modal-close" id="closeModal" aria-label="Close">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
        <line x1="18" y1="6" x2="6" y2="18"></line>
        <line x1="6" y1="6" x2="18" y2="18"></line>
      </svg>
    </button>
    
    <div class="modal-header">
      <div class="modal-pretitle">INDIVIDUAL INTAKE · RESOLVE 2.0</div>
      <h2 class="modal-title">DELEGATE REGISTRATION</h2>
      <span class="modal-subtitle">Join Resolve MUN 2026</span>
    </div>
    
    <form id="regForm" novalidate>
      <!-- STEP 1: PERSONAL DETAILS -->
      <div class="form-step active" id="step1">
        <div class="form-group">
          <label for="regName">Full Name</label>
          <input type="text" id="regName" name="name" autocomplete="name" placeholder="Enter your full name" required>
        </div>
        
        <div class="form-group" style="display: grid; grid-template-columns: 1fr 1fr; gap: 14px;">
          <div>
            <label for="regGrade">Grade / Class</label>
            <input type="text" id="regGrade" name="grade" autocomplete="off" placeholder="e.g. 10th, 1st Year" required>
          </div>
          <div>
            <label for="regPhone">Phone Number</label>
            <input type="tel" id="regPhone" name="phone" autocomplete="tel" placeholder="10-digit number" required pattern="[0-9]{10}" minlength="10" maxlength="10" title="Please enter a valid 10-digit phone number">
          </div>
        </div>
        
        <div class="form-group">
          <label for="regEmail">Email Address</label>
          <input type="email" id="regEmail" name="email" autocomplete="email" placeholder="yourname@example.com" required pattern="[a-z0-9._%+\\-]+@[a-z0-9.\\-]+\\.[a-z]{2,}">
        </div>

        <div class="form-group">
          <label for="regInstitute">Institute name</label>
          <input type="text" id="regInstitute" name="institute" autocomplete="organization" placeholder="School or University name" required>
        </div>

        <div class="form-group">
          <label for="regAddress">Full Residential Address</label>
          <textarea id="regAddress" name="address" autocomplete="address-line1" rows="2" placeholder="Street, Area, City, Pincode" required style="resize: vertical; min-height: 64px;"></textarea>
        </div>

        <div class="form-group">
          <label>Do you require transportation?</label>
          <select id="regTransport" required>
            <option value="" disabled selected>Select an option</option>
            <option value="yes">Yes</option>
            <option value="no">No</option>
          </select>
        </div>

        <div class="form-group" style="display: grid; grid-template-columns: 1fr 1fr; gap: 14px;">
          <div>
            <label for="regDob">Date of Birth</label>
            <input type="date" id="regDob" required autocomplete="bday">
          </div>
          <div>
            <label for="regReferral">Referral Code (Optional)</label>
            <input type="text" id="regReferral" placeholder="e.g. RES-123" autocomplete="off">
            <div id="referralFeedback" class="referral-feedback" style="font-size:0.75rem; margin-top:4px; color:var(--muted);"></div>
          </div>
        </div>

        <div class="form-group" style="display: grid; grid-template-columns: 1fr 1fr; gap: 14px;">
          <div>
            <label for="regEmergencyName">Emergency Contact Name</label>
            <input type="text" id="regEmergencyName" name="emergency-name" autocomplete="name" placeholder="Parent / Guardian name" required>
          </div>
          <div>
            <label for="regEmergencyPhone">Emergency Contact Phone</label>
            <input type="tel" id="regEmergencyPhone" name="emergency-phone" autocomplete="tel" placeholder="10-digit number" required pattern="[0-9]{10}" minlength="10" maxlength="10" title="Please enter a valid 10-digit phone number">
          </div>
        </div>

        <div class="form-group">
          <label>MUN Experience (Conference - Committee - Portfolio - Award/NA)</label>
          <textarea id="regExp" rows="3" placeholder="List your experiences here..." required style="resize: vertical; min-height: 70px;"></textarea>
        </div>

        <button type="button" class="btn-next btn-full-width" onclick="nextStep(2)">
          Next Step
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
        </button>
      </div>

      <!-- STEP 2: COMMITTEE PREFERENCE -->
      <div class="form-step" id="step2">
        <a href="#" onclick="showCustomAlert('Country Matrix Coming Soon!', 'default')" class="btn-matrix">
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/></svg>
          Country Matrices
        </a>

        <!-- Preference 1 -->
        <div class="form-group">
          <label>Preference 1</label>
          <select id="pref1_committee" required onchange="updatePortfolioOptions(1)">
            <option value="" disabled selected>Select Committee Preference 1</option>
            <option value="DISEC">DISEC</option>
            <option value="LOK SABHA">Lok Sabha</option>
            <option value="UNHRC">UNHRC</option>
            <option value="CCC">CCC</option>
            <option value="UNCSW">UNCSW</option>
            <option value="IP">IP</option>
          </select>
          <div id="pref1_container" style="display: none; margin-top: 10px;">
            <div id="pref1_portfolios" style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px;">
              <input type="text" id="pref1_port1" placeholder="portfolio / country - 1" required>
              <input type="text" id="pref1_port2" placeholder="portfolio / country - 2" required>
            </div>
            <select id="pref1_role" style="display: none;">
              <option value="" disabled selected>Select Role</option>
              <option value="Reporter">Reporter</option>
              <option value="Photographer">Photographer</option>
            </select>
          </div>
        </div>

        <!-- Preference 2 -->
        <div class="form-group">
          <label>Preference 2</label>
          <select id="pref2_committee" required onchange="updatePortfolioOptions(2)">
            <option value="" disabled selected>Select Committee Preference 2</option>
            <option value="DISEC">DISEC</option>
            <option value="LOK SABHA">Lok Sabha</option>
            <option value="UNHRC">UNHRC</option>
            <option value="CCC">CCC</option>
            <option value="UNCSW">UNCSW</option>
            <option value="IP">IP</option>
          </select>
          <div id="pref2_container" style="display: none; margin-top: 10px;">
            <div id="pref2_portfolios" style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px;">
              <input type="text" id="pref2_port1" placeholder="portfolio / country - 1" required>
              <input type="text" id="pref2_port2" placeholder="portfolio / country - 2" required>
            </div>
            <select id="pref2_role" style="display: none;">
              <option value="" disabled selected>Select Role</option>
              <option value="Reporter">Reporter</option>
              <option value="Photographer">Photographer</option>
            </select>
          </div>
        </div>

        <!-- Preference 3 -->
        <div class="form-group">
          <label>Preference 3</label>
          <select id="pref3_committee" required onchange="updatePortfolioOptions(3)">
            <option value="" disabled selected>Select Committee Preference 3</option>
            <option value="DISEC">DISEC</option>
            <option value="LOK SABHA">Lok Sabha</option>
            <option value="UNHRC">UNHRC</option>
            <option value="CCC">CCC</option>
            <option value="UNCSW">UNCSW</option>
            <option value="IP">IP</option>
          </select>
          <div id="pref3_container" style="display: none; margin-top: 10px;">
            <div id="pref3_portfolios" style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px;">
              <input type="text" id="pref3_port1" placeholder="portfolio / country - 1" required>
              <input type="text" id="pref3_port2" placeholder="portfolio / country - 2" required>
            </div>
            <select id="pref3_role" style="display: none;">
              <option value="" disabled selected>Select Role</option>
              <option value="Reporter">Reporter</option>
              <option value="Photographer">Photographer</option>
            </select>
          </div>
        </div>

        <div class="form-actions">
          <button type="button" class="btn-back" onclick="nextStep(1)">Back</button>
          <button type="button" class="btn-next" onclick="nextStep(3)">Review & Pay</button>
        </div>
      </div>

      <!-- STEP 3: PAYMENT & SUBMISSION -->
      <div class="form-step" id="step3">
        <div class="payment-banner" style="text-align: center; margin-bottom: 14px;">
          <span style="display: inline-block; font-size: 0.65rem; font-weight: 700; font-mono: true; text-transform: uppercase; letter-spacing: 0.12em; color: #a855f7; background: rgba(168,85,247,0.1); border: 1px solid rgba(168,85,247,0.25); padding: 3px 10px; border-radius: 9999px; margin-bottom: 6px;">Priority Pass Allocation</span>
          <h3 id="regFeeDisplay" style="font-size: 1.4rem; font-weight: 800; color: #ffffff; letter-spacing: -0.02em; margin: 0;">Registration Fee: ₹2199</h3>
          <p class="non-refundable-notice" style="font-size: 0.65rem; color: #f87171; margin-top: 4px; letter-spacing: 0.08em; text-transform: uppercase; font-weight: 600;">⚠️ Payment is non-refundable once submitted</p>
        </div>

        <div class="payment-card">
          <div class="form-group" style="margin-bottom: 0;">
            <label style="text-align: center; margin-bottom: 10px; font-size: 0.65rem; letter-spacing: 0.16em; opacity: 0.7; font-weight: 700;">1. SCAN QR CODE VIA ANY UPI APP</label>
            <div style="text-align: center;">
              <div class="qr-container">
                <img id="paymentQRImage" src="https://quickchart.io/qr?size=320&text=upi%3A%2F%2Fpay%3Fpa%3Dbhoomianilbasrani%40okhdfcbank%26pn%3DBhoomi%2520Basrani%26am%3D2199%26cu%3DINR" alt="Payment QR Code">
              </div>

              <div class="upi-supported-apps">
                <span class="upi-app-pill">GPay</span>
                <span class="upi-app-pill">PhonePe</span>
                <span class="upi-app-pill">Paytm</span>
                <span class="upi-app-pill">CRED</span>
                <span class="upi-app-pill">BHIM</span>
                <span class="upi-app-pill">Any UPI</span>
              </div>

              <div class="upi-box">
                <span id="upiID">bhoomianilbasrani@okhdfcbank</span>
                <button type="button" class="refresh-qr-btn" onclick="refreshDelegatePaymentQR()" title="Regenerate QR">
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="23 4 23 10 17 10"></polyline><polyline points="1 20 1 14 7 14"></polyline><path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"></path></svg>
                </button>
                <button type="button" class="copy-btn" onclick="copyUPI()" title="Copy UPI ID">
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path></svg>
                </button>
              </div>
              <span style="display: block; font-size: 0.68rem; color: #a1a1aa; margin-top: 2px;">Verified Payee: <strong style="color: #fff;">Bhoomi Basrani</strong></span>
            </div>
          </div>

          <div class="form-group" style="margin-top: 16px;">
            <label>2. TRANSACTION / REFERENCE ID*</label>
            <input type="text" id="regTxnID" placeholder="Enter Transaction / Reference ID" required>
          </div>

          <div class="form-group">
            <label>3. UPLOAD PAYMENT SCREENSHOT*</label>
            <label class="file-upload-wrapper" for="regDriveLink">
              <span class="file-upload-btn">Choose File</span>
              <span class="file-name" id="regDriveFileName">No file chosen</span>
              <input type="file" id="regDriveLink" class="file-upload-input" accept="image/*" required>
            </label>
            <div id="regScreenshotPreview" style="display: none;" class="payment-screenshot-preview"></div>
          </div>

          <div class="form-group">
            <label>4. 12-DIGIT UTR NUMBER (OPTIONAL)</label>
            <input type="text" id="regUTR" placeholder="Enter 12-digit UTR from banking app">
          </div>

          <div style="margin-top: 14px; padding: 10px 12px; border-radius: 8px; background: rgba(255,255,255,0.02); border: 1px solid rgba(255,255,255,0.06); text-align: center;">
            <p style="font-size: 0.66rem; color: #94a3b8; font-family: ui-monospace, monospace; margin: 0; text-transform: uppercase; letter-spacing: 0.05em;">🏛️ Delhi World Public School, Kompally, Hyderabad</p>
            <p style="font-size: 0.62rem; color: #64748b; margin: 3px 0 0 0;">Conference Dates: 20th – 22nd November 2026</p>
          </div>
        </div>

        <div class="payment-footer">
          <p class="payment-contact">For Any Assistance, Secretariat Hotline: <span>+91 92121 07797</span></p>
        </div>

        <div class="form-actions">
          <button type="button" class="btn-back" onclick="nextStep(2)">Back</button>
          <button type="submit" class="btn-next">Submit Registration</button>
        </div>
        <p class="terms-confirmation">
          By clicking Submit Registration, you agree to the
          <a href="#" onclick="openTermsModal()">Terms &amp; Conditions</a>
          of Resolve MUN 2026 shown below.
        </p>
      </div>
    </form>
  </div>
</div>

<!-- COMING SOON MODAL -->
<div class="modal-overlay" id="commModal">
  <div class="modal-content comm-modal-content">
    <button class="modal-close" onclick="closeCommModal()">
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
        <line x1="18" y1="6" x2="6" y2="18"></line>
        <line x1="6" y1="6" x2="18" y2="18"></line>
      </svg>
    </button>
    <div class="comm-modal-inner">
      <div class="comm-modal-icon" id="commModalIcon">ROUND ONE</div>
      <h2 class="comm-modal-title" id="commModalTitle">RESOLVE 2026</h2>
      <span class="comm-modal-agenda" id="commModalAgenda">Registrations opening soon.</span>
      <p class="comm-modal-text" id="commModalText">
        The premier diplomatic summit is meticulously preparing its corridors. Join the waitlist for priority access to delegate allocations and early-bird benefits.
      </p>

      <div style="margin-top:12px;">
        <button id="commModalBgBtn" class="btn-secondary" style="display:none; margin-right:10px;" onclick="(function(){ if(window.currentCommBg) window.open(window.currentCommBg, '_blank'); })()">Background Guide</button>
      </div>

      <div id="waitlistContainer">
        <form id="waitlistForm">
          <div class="waitlist-form">
            <input type="email" id="waitlistEmail" placeholder="Enter your email address" required>
            <button type="submit" class="waitlist-btn" id="waitlistSubmitBtn">Notify Me</button>
          </div>
        </form>
        <p id="waitlistSuccess" style="display: none; color: var(--white); font-family: 'Crimson Pro', serif; font-size: 0.95rem; margin-top: 20px; opacity: 0.85;">
          You've been added to the priority list. We will be in touch.
        </p>
      </div>
    </div>
  </div>
</div>

<!-- TERMS & CONDITIONS MODAL -->
<div class="modal-overlay" id="termsModal">
  <div class="modal-content terms-modal-content">
    <button class="modal-close" onclick="closeTermsModal()">
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
        <line x1="18" y1="6" x2="6" y2="18"></line>
        <line x1="6" y1="6" x2="18" y2="18"></line>
      </svg>
    </button>
    <div class="terms-modal-header">
      <h2 class="modal-title">TERMS &amp; CONDITIONS</h2>
      <span class="terms-modal-subtitle">Resolve Model United Nations 2026</span>
    </div>
    <div class="terms-body">
      <p><strong>Last Updated:</strong> March 2026</p>
      <p>Welcome to Resolve Model United Nations 2026 (“Resolve MUN”, “Conference”, “we”, “our”, or “us”). 
         By registering for, accessing, participating in, attending, or engaging with Resolve MUN 2026 in any capacity, you acknowledge and agree to comply with these Terms &amp; Conditions.</p>
      <h3>1. Acceptance of Terms</h3>
      <p>By submitting a registration form, making payment, or attending the conference, you agree to be legally bound by these Terms &amp; Conditions.</p>
      <h3>2. Registration &amp; Payment Policy</h3>
      <p>Registration is confirmed upon receipt of applicable fees. Registration fees are non-refundable and non-transferable.</p>
      <h3>3. Code of Conduct</h3>
      <p>Participants must maintain diplomatic decorum and professionalism. Harassment, discrimination, or abusive behavior will result in immediate disqualification without refund.</p>
      <div class="terms-contact">
        <p>For queries: <a href="mailto:resolve.mun@gmail.com">resolve.mun@gmail.com</a> | <a href="https://www.instagram.com/mun.resolve/" target="_blank" rel="noopener noreferrer">@mun.resolve</a></p>
      </div>
    </div>
  </div>
</div>

<div class="cursor-dot" id="cursorDot"></div>
<div class="cursor-reticle" id="cursorReticle"></div>

<div class="committee-prompt" id="committeePrompt" aria-hidden="true">
  <div class="committee-prompt__text">
    CHOOSE YOUR COMMITTEE
    <span class="committee-prompt__subtext">Background guides are live</span>
  </div>
</div>

<!-- COUNTDOWN -->
<div id="countdown" class="reveal">
  <span class="countdown-label">Conference Opens In</span>
  <div class="countdown-units-wrapper">
    <div class="countdown-unit">
      <span class="countdown-num" id="cd-days">--</span>
      <span class="countdown-unit-label">Days</span>
    </div>
    <span class="countdown-sep">:</span>
    <div class="countdown-unit">
      <span class="countdown-num" id="cd-hours">--</span>
      <span class="countdown-unit-label">Hours</span>
    </div>
    <span class="countdown-sep">:</span>
    <div class="countdown-unit">
      <span class="countdown-num" id="cd-mins">--</span>
      <span class="countdown-unit-label">Minutes</span>
    </div>
    <span class="countdown-sep">:</span>
    <div class="countdown-unit">
      <span class="countdown-num" id="cd-secs">--</span>
      <span class="countdown-unit-label">Seconds</span>
    </div>
  </div>
</div>

<!-- ABOUT -->
<section id="about">
<div class="about-inner">
  <div class="about-visual reveal">
    <div class="emblem-wrapper">
      <div class="logo-halo"></div>
      <img src="/images/Logo.svg" alt="Resolve MUN 2026 Emblem - Symbol of Excellence and Diplomacy" class="emblem-main">
      <div class="about-particles">
        <div class="about-particle" style="top: 20%; left: 10%; animation-delay: 0s;"></div>
        <div class="about-particle" style="top: 80%; left: 30%; animation-delay: 2s;"></div>
        <div class="about-particle" style="top: 50%; left: 80%; animation-delay: 4s;"></div>
        <div class="about-particle" style="top: 10%; left: 60%; animation-delay: 6s;"></div>
        <div class="about-particle" style="top: 90%; left: 70%; animation-delay: 8s;"></div>
      </div>
    </div>
    
    <div class="about-stat-grid">
      <div class="about-stat">
        <span class="num">300+</span>
        <div class="stat-divider"></div>
        <span class="desc">Delegates</span>
      </div>
      <div class="about-stat">
        <span class="num text-[1.2rem] tracking-wider text-blue-300 font-sans">RELEASING SOON</span>
        <div class="stat-divider"></div>
        <span class="desc">Committees</span>
      </div>
      <div class="about-stat cash-rewards-stat">
        <span class="num text-[1.2rem] tracking-wider text-blue-300 font-sans">COMING SOON</span>
        <div class="stat-divider"></div>
        <span class="desc">Cash Rewards</span>
      </div>
      <div class="about-stat">
        <span class="num">3</span>
        <div class="stat-divider"></div>
        <span class="desc">Days of Diplomacy</span>
      </div>
    </div>
  </div>

  <div class="reveal reveal-delay-2 about-content">
    <div class="section-label">About the Conference</div>
    <h2 class="section-title">WHERE DIPLOMACY<br>MEETS <span class="title-accent">AMBITION</span></h2>
    <div class="title-line-divider"></div>
    
    <p class="section-body">Resolve MUN is not just a conference — it is an arena where the next generation of Hyderabad's leaders converge to debate, deliberate, and drive change. Built on the pillars of intellectual rigor and diplomatic excellence, Resolve MUN challenges delegates to engage with the city's and the world's most pressing issues.</p>
    <p class="section-body">From crisis committees that demand split-second decisions to general assemblies that require sweeping coalition-building, every moment at Resolve MUN is designed to forge leaders of consequence.</p>
  </div>
</div>
</section>

<div class="glow-line"></div>

<!-- SECRETARY GENERAL'S LETTER -->
<section id="letter" class="reveal">
  <div class="letter-bg-glow"></div>
  <div class="letter-inner">
    <div class="section-label reveal" style="justify-content: center;">Message from the Secretariat</div>
    <h2 class="section-title reveal" style="text-align: center;">A LETTER FROM THE<br>SECRETARY GENERAL</h2>
    
    <div class="letter-container reveal reveal-delay-2">
      <div class="letter-content">
        <p>It is my privilege to welcome you to <strong>Resolve Model United Nations 2026</strong>.</p>
        <p>Resolve was never meant to be just another conference. From the start, the idea was simple. If we were going to do this, we would do it properly. That meant focusing on quality, being intentional with every decision, and not compromising where it actually matters.</p>
        <p>In a circuit where numbers often take priority, we chose to care more about what happens inside the room. Every committee has been put together with that in mind. Our Executive Board is made up of some of the strongest individuals in the Hyderabad circuit, and the expectation they bring is clear. <strong>Come prepared, think critically, and be ready to engage seriously.</strong></p>
        <p>There is a certain standard attached to Resolve. Not because we say it, but because of how the conference is built. The pace will be demanding. The debate will be competitive. You will be pushed to do more than just speak. You will have to think, adapt, and actually understand what you are doing.</p>
        <p>At the same time, Resolve is not just about committee sessions. The experience matters. The people you meet, the conversations you have, and the overall atmosphere are just as important. We have put equal effort into making sure that side of the conference feels just as strong.</p>
        <p>As Secretary-General, I see Resolve as something we are building, not just hosting. If we get this right, it sets a standard going forward. That is the goal.</p>
        <p>This conference is not meant to be easy.<br><strong>It is meant to be worth it.</strong></p>
        <p>I look forward to welcoming you to Resolve MUN 2026.</p>
      </div>
      <div class="letter-signature">
        <div class="sig-avatar">SB</div>
        <div class="sig-details">
          <h4>Swayam Bakshi</h4>
          <span>Secretary-General — Resolve Model United Nations 2026</span>
        </div>
      </div>
    </div>
  </div>
</section>

<div class="glow-line"></div>

<!-- COMMITTEES -->
<section id="committees" class="reveal" style="background: linear-gradient(0deg, rgba(7,6,22,0.7), rgba(7,6,22,0.3)), url('/images/committees-bg.svg'); background-size: cover; background-position: center;">
  <div class="section-label reveal">Committees</div>
  <h2 class="section-title reveal">THE ARENA OF<br>HIGH-LEVEL DEBATE</h2>
  <p class="section-body reveal" style="max-width: 620px; margin: 0 auto 30px;">Seven specialized diplomatic chambers are currently being finalized by the academic secretariat. Agendas, background guides, and portfolio matrices will be unveiled shortly.</p>
  
  <div class="releasing-soon-card reveal">
    <div class="releasing-badge-pill">ANNOUNCEMENT</div>
    <h3>COMMITTEES RELEASING SOON</h3>
    <p>Prepare for unprecedented crisis simulations, bilateral negotiations, and multilateral draft resolutions.</p>
  </div>
</section>

<div class="glow-line"></div>

<!-- VENUE -->
<section id="venue" class="reveal">
  <div class="section-label reveal">Venue</div>
  <h2 class="section-title reveal">A STAGE WORTHY<br>OF THE DEBATE</h2>
  <p class="section-body reveal" style="max-width: 600px; margin: 0 auto 30px;">A state-of-the-art diplomatic arena in Hyderabad, designed to foster collaboration and intense discourse.</p>
  
  <div class="releasing-soon-card reveal">
    <div class="releasing-badge-pill">LOCATION</div>
    <h3>VENUE RELEASING SOON</h3>
    <p>Official venue announcement and campus walkthrough will be released soon.</p>
  </div>
</section>

<div class="glow-line"></div>

<!-- SECRETARIAT -->
<section id="secretariat" class="reveal">
  <div class="sec-header reveal">
    <div class="section-label">Secretariat</div>
    <h2 class="section-title">MEET THE TEAM</h2>
    <p class="section-body" style="max-width: 600px;">The Secretariat of Resolve MUN comprises exceptional leaders dedicated to delivering a world-class conference experience.</p>
  </div>
  
  <div class="sec-carousel-container">
    <div class="sec-track" id="secTrack">
      <div class="sec-card sec-card--sg">
        <div class="sec-avatar">SB</div>
        <div class="sec-name">Swayam Bakshi</div>
        <div class="sec-role">Secretary General</div>
      </div>
      <div class="sec-card sec-card--dsg">
        <div class="sec-avatar">PS</div>
        <div class="sec-name">Poorvika Setti</div>
        <div class="sec-role">Deputy Secretary General</div>
      </div>
      <div class="sec-card sec-card--dg">
        <div class="sec-avatar">AV</div>
        <div class="sec-name">Abhilash VijayaKumar</div>
        <div class="sec-role">Director General</div>
      </div>
      <div class="sec-card">
        <div class="sec-avatar">SD</div>
        <div class="sec-name">Siddhi Kothari</div>
        <div class="sec-role">Charge D'Affairs</div>
      </div>
      <div class="sec-card">
        <div class="sec-avatar">JK</div>
        <div class="sec-name">Jayakrishna</div>
        <div class="sec-role">OC Head</div>
      </div>
      <div class="sec-card">
        <div class="sec-avatar">MH</div>
        <div class="sec-name">Mahathi</div>
        <div class="sec-role">USG Finance</div>
      </div>
      <div class="sec-card">
        <div class="sec-avatar">ED</div>
        <div class="sec-name">Eesha Datla</div>
        <div class="sec-role">USG Logistics</div>
      </div>
      <div class="sec-card">
        <div class="sec-avatar">RY</div>
        <div class="sec-name">Rayon</div>
        <div class="sec-role">USG Logistics</div>
      </div>
      <div class="sec-card">
        <div class="sec-avatar">JT</div>
        <div class="sec-name">Jagadeesh Ram Tekamudi</div>
        <div class="sec-role">USG Policy</div>
      </div>
      <div class="sec-card">
        <div class="sec-avatar">AV</div>
        <div class="sec-name">Avni</div>
        <div class="sec-role">Delegate Affairs</div>
      </div>
      <div class="sec-card">
        <div class="sec-avatar">AL</div>
        <div class="sec-name">Anmol Lokhande</div>
        <div class="sec-role">Delegate Affairs</div>
      </div>
      <div class="sec-card">
        <div class="sec-avatar">AV</div>
        <div class="sec-name">Anvita Vijay</div>
        <div class="sec-role">USG Marketing</div>
      </div>
      <div class="sec-card">
        <div class="sec-avatar">AC</div>
        <div class="sec-name">Aryan Chakravarthy</div>
        <div class="sec-role">USG Marketing</div>
      </div>
      <div class="sec-card">
        <div class="sec-avatar">MG</div>
        <div class="sec-name">Madhurima Guduru</div>
        <div class="sec-role">USG Marketing</div>
      </div>
      <div class="sec-card">
        <div class="sec-avatar">AA</div>
        <div class="sec-name">Anjuman Ara</div>
        <div class="sec-role">USG Design</div>
      </div>
      <div class="sec-card">
        <div class="sec-avatar">PM</div>
        <div class="sec-name">Parnika M</div>
        <div class="sec-role">USG Design</div>
      </div>
      <div class="sec-card">
        <div class="sec-avatar">PT</div>
        <div class="sec-name">Pratham</div>
        <div class="sec-role">USG Design</div>
      </div>
      <div class="sec-card">
        <div class="sec-avatar">KN</div>
        <div class="sec-name">Kushnoor</div>
        <div class="sec-role">Head Of Outreach</div>
      </div>
      <div class="sec-card">
        <div class="sec-avatar">PR</div>
        <div class="sec-name">Pranavi Reddy</div>
        <div class="sec-role">Head Of Outreach</div>
      </div>
      <div class="sec-card">
        <div class="sec-avatar">AB</div>
        <div class="sec-name">Abhinaya</div>
        <div class="sec-role">Director of Content Creation</div>
      </div>
      <div class="sec-card">
        <div class="sec-avatar">KT</div>
        <div class="sec-name">Keerthi</div>
        <div class="sec-role">Director of Content Creation</div>
      </div>
      <div class="sec-card">
        <div class="sec-avatar">HM</div>
        <div class="sec-name">Harshita Muchhal</div>
        <div class="sec-role">USG Culturals</div>
      </div>
      <div class="sec-card">
        <div class="sec-avatar">VR</div>
        <div class="sec-name">Vetsha Rithvik Siddarth</div>
        <div class="sec-role">USG Video & Productions</div>
      </div>
      <div class="sec-card">
        <div class="sec-avatar">VG</div>
        <div class="sec-name">Vignesh</div>
        <div class="sec-role">USG Security</div>
      </div>
      <div class="sec-card">
        <div class="sec-avatar">DH</div>
        <div class="sec-name">Dhamini</div>
        <div class="sec-role">USG Security</div>
      </div>
    </div>
  </div>
</section>

<div class="glow-line"></div>

<!-- SPONSORS -->
<section id="sponsors">
  <div class="sponsors-inner reveal" style="text-align: center;">
    <div class="section-label" style="justify-content: center; margin-bottom: 20px;">
      Partner Organizations & Sponsors
    </div>
    
    <h2 class="section-title" style="text-align: center; margin-bottom: 40px;">BECOME A PARTNER</h2>
    
    <div class="sponsors-row" style="justify-content: center; gap: 16px;">
      <div class="sponsor-slot">Sponsor</div>
      <div class="sponsor-slot">Partner</div>
      <div class="sponsor-slot">Media</div>
      <div class="sponsor-slot">Academic</div>
      <div class="sponsor-slot">Sponsor</div>
    </div>
    <div class="sponsors-contact" style="margin-top: 36px;">
      Sponsorship packages available — <a href="mailto:contact@resolvemun.org">Contact Us</a>
    </div>
  </div>
</section>

<div class="glow-line"></div>

<!-- OC APPLICATIONS (CLOSED) -->
<section id="oc-applications">
  <div class="oc-inner">
    <div class="oc-layout">
      <!-- Left: Narrative -->
      <div class="oc-text-content reveal">
        <div class="section-label">Organizing Committee</div>
        <h2 class="section-title">JOIN THE<br>ARCHITECTS</h2>
        <p class="section-body">Help build one of Hyderabad's most ambitious Model United Nations conferences from the ground up.</p>
        
        <div class="oc-perks">
          <div class="oc-perk">Elite Leadership Roles</div>
          <div class="oc-perk">Strategic Logistics & Planning</div>
          <div class="oc-perk">Prime Networking Context</div>
          <div class="oc-perk">Exclusive Certification</div>
        </div>
      </div>

      <!-- Right: Action Card -->
      <div class="oc-card reveal reveal-delay-2">
        <div class="oc-card-glow"></div>
        <div class="oc-icon">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1" stroke-linecap="round" stroke-linejoin="round">
            <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/>
            <path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/>
          </svg>
        </div>
        <h3 class="oc-card-title">OC</h3>
        <p class="oc-card-body">Build one of Hyderabad's most ambitious Model United Nations conferences from the ground up.</p>
        <button class="btn-primary oc-btn" disabled><span style="opacity: 0.6;">APPLICATIONS CLOSED</span></button>
      </div>
    </div>
  </div>
</section>

<div class="glow-line glow-line--blue" style="margin: 60px 0;"></div>

<!-- EB APPLICATIONS -->
<section id="eb-applications">
  <div class="eb-inner">
    <div class="eb-layout">
      <!-- Left: Narrative -->
      <div class="eb-text-content reveal">
        <div class="section-label">Executive Board</div>
        <h2 class="section-title">LEAD THE<br>DIALOGUE</h2>
        <p class="section-body">Shape the academic landscape of Resolve MUN. We are inviting seasoned debaters to chair our prestigious committees.</p>
        
        <div class="eb-perks">
          <div class="eb-perk">Academic Authority</div>
          <div class="eb-perk">Strategic Committee Management</div>
          <div class="eb-perk">Mentorship & Evaluation</div>
          <div class="eb-perk">Honorarium & Benefits</div>
        </div>
      </div>

      <!-- Right: Action Card -->
      <div class="eb-card reveal reveal-delay-2">
        <div class="eb-card-glow"></div>
        <div class="eb-icon">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1" stroke-linecap="round" stroke-linejoin="round">
            <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/><path d="M12 8v4"/><path d="M12 16h.01"/>
          </svg>
        </div>
        <h3 class="eb-card-title">Apply for EB</h3>
        <p class="eb-card-body">Join us as a Chairperson, Vice-Chairperson, or Rapporteur. Applications are now open for experienced MUNers.</p>
        <button class="btn-primary eb-btn" disabled><span>EB Applications Closed</span></button>
      </div>
    </div>
  </div>
</section>

<!-- OC APPLICATION MODAL -->
<div class="modal-overlay" id="ocModal">
  <div class="modal-content">
    <button class="modal-close" id="closeOcModal" aria-label="Close">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
        <line x1="18" y1="6" x2="6" y2="18"></line>
        <line x1="6" y1="6" x2="18" y2="18"></line>
      </svg>
    </button>
    
    <div class="modal-header">
      <div class="modal-pretitle">STAFF CORPS · RESOLVE 2.0</div>
      <h2 class="modal-title">OC APPLICATIONS</h2>
      <span class="modal-subtitle">Join the Organizing Committee</span>
    </div>
    
    <form id="ocRegForm">
      <!-- STEP 1: PERSONAL & CORE DETAILS -->
      <div class="form-step active" id="ocStep1">
        <div class="form-group">
          <label for="ocName">Full Name</label>
          <input type="text" id="ocName" name="name" autocomplete="name" placeholder="Enter your full name" required>
        </div>
        
        <div class="form-group" style="display: grid; grid-template-columns: 1fr 1fr; gap: 14px;">
          <div>
            <label for="ocDob">Date of Birth</label>
            <input type="date" id="ocDob" name="dob" autocomplete="bday" required>
          </div>
          <div>
            <label for="ocGrade">Grade / Class</label>
            <input type="text" id="ocGrade" name="grade" placeholder="e.g. 10th, 1st Year" required>
          </div>
        </div>
        
        <div class="form-group" style="display: grid; grid-template-columns: 1fr 1fr; gap: 14px;">
          <div>
            <label for="ocPhone">Contact No (WhatsApp)</label>
            <input type="tel" id="ocPhone" name="phone" autocomplete="tel" placeholder="10-digit number" required pattern="[0-9]{10}" minlength="10" maxlength="10" title="Please enter a valid 10-digit phone number">
          </div>
          <div>
            <label for="ocEmail">Email ID</label>
            <input type="email" id="ocEmail" name="email" autocomplete="email" placeholder="yourname@example.com" required pattern="[a-z0-9._%+-]+@[a-z0-9.-]+\\.[a-z]{2,}$">
          </div>
        </div>

        <div class="form-group">
          <label for="ocInst">Institution (School/College/University)</label>
          <input type="text" id="ocInst" name="institute" autocomplete="organization" placeholder="Enter your institution" required>
        </div>

        <div class="form-group">
          <label for="ocInsta">Instagram ID (Optional)</label>
          <input type="text" id="ocInsta" name="instagram" autocomplete="username" placeholder="@username">
        </div>

        <div class="form-group">
          <label>Number of MUNs attended</label>
          <select id="ocMunCount" required>
            <option value="" disabled selected>Select an option</option>
            <option value="N/A">N/A</option>
            <option value="1-5">1-5</option>
            <option value="6-10">6-10</option>
            <option value="11+">11 & more</option>
          </select>
        </div>

        <button type="button" class="btn-next btn-full-width" onclick="nextOcStep(2)">
          Next Step
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
        </button>
      </div>

      <!-- STEP 2: MOTIVATION & ATTRIBUTES -->
      <div class="form-step" id="ocStep2">
        <div class="form-group">
          <label>Why do you want to be part of the Organizing Committee for Resolve MUN?</label>
          <textarea id="ocWhy" name="why" rows="3" placeholder="What do you hope to contribute?" required style="resize: vertical; min-height: 80px;"></textarea>
        </div>

        <div class="form-group">
          <label>What attributes do you possess that make you well-suited for an OC position?</label>
          <textarea id="ocAttributes" name="attributes" rows="3" placeholder="Mention your skills and qualities..." required style="resize: vertical; min-height: 80px;"></textarea>
        </div>

        <div class="form-actions">
          <button type="button" class="btn-back" onclick="nextOcStep(1)">Back</button>
          <button type="button" class="btn-next" onclick="nextOcStep(3)">Review & Pay</button>
        </div>
      </div>

      <!-- STEP 3: PAYMENT -->
      <div class="form-step" id="ocStep3">
        <div class="payment-banner" style="text-align: center; margin-bottom: 14px;">
          <span style="display: inline-block; font-size: 0.65rem; font-weight: 700; font-mono: true; text-transform: uppercase; letter-spacing: 0.12em; color: #a855f7; background: rgba(168,85,247,0.1); border: 1px solid rgba(168,85,247,0.25); padding: 3px 10px; border-radius: 9999px; margin-bottom: 6px;">Organizing Committee Induction</span>
          <h3 style="font-size: 1.4rem; font-weight: 800; color: #ffffff; letter-spacing: -0.02em; margin: 0;">Registration Fee: ₹1699</h3>
          <p class="non-refundable-notice" style="font-size: 0.65rem; color: #f87171; margin-top: 4px; letter-spacing: 0.08em; text-transform: uppercase; font-weight: 600;">⚠️ Payment is non-refundable once submitted</p>
        </div>

        <div class="payment-card">
          <div class="form-group" style="margin-bottom: 0;">
            <label style="text-align: center; margin-bottom: 10px; font-size: 0.65rem; letter-spacing: 0.16em; opacity: 0.7; font-weight: 700;">1. SCAN QR CODE VIA ANY UPI APP</label>
            <div style="text-align: center;">
              <div class="qr-container">
                <img id="ocPaymentQRImage" src="https://quickchart.io/qr?size=320&text=upi%3A%2F%2Fpay%3Fpa%3Dbhoomianilbasrani%40okhdfcbank%26pn%3DBhoomi%2520Basrani%26am%3D1699%26cu%3DINR" alt="OC Payment QR Code">
              </div>

              <div class="upi-supported-apps">
                <span class="upi-app-pill">GPay</span>
                <span class="upi-app-pill">PhonePe</span>
                <span class="upi-app-pill">Paytm</span>
                <span class="upi-app-pill">CRED</span>
                <span class="upi-app-pill">BHIM</span>
                <span class="upi-app-pill">Any UPI</span>
              </div>

              <div class="upi-box">
                <span id="ocUpiID">bhoomianilbasrani@okhdfcbank</span>
                <button type="button" class="refresh-qr-btn" onclick="generateDynamicQR('1699', 'ocPaymentQRImage', 'ocUpiID')" title="Regenerate QR">
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="23 4 23 10 17 10"></polyline><polyline points="1 20 1 14 7 14"></polyline><path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"></path></svg>
                </button>
                <button type="button" class="copy-btn" onclick="copyOcUPI()" title="Copy UPI ID">
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path></svg>
                </button>
              </div>
              <span style="display: block; font-size: 0.68rem; color: #a1a1aa; margin-top: 2px;">Verified Payee: <strong style="color: #fff;">Bhoomi Basrani</strong></span>
            </div>
          </div>

          <div class="form-group" style="margin-top: 16px;">
            <label>2. TRANSACTION / REFERENCE ID*</label>
            <input type="text" id="ocTxnID" name="txnID" placeholder="Enter Transaction / Reference ID" required>
          </div>

          <div class="form-group">
            <label>3. 12-DIGIT UTR ID (OPTIONAL)</label>
            <input type="text" id="ocUTR" name="utr" placeholder="Enter 12-digit UTR ID from banking app">
          </div>

          <div class="form-group">
            <label>4. UPLOAD PAYMENT SCREENSHOT*</label>
            <label class="file-upload-wrapper" for="ocDriveLink">
              <span class="file-upload-btn">Choose File</span>
              <span class="file-name" id="ocDriveFileName">No file chosen</span>
              <input type="file" id="ocDriveLink" class="file-upload-input" accept="image/*" required>
            </label>
            <div id="ocScreenshotPreview" style="display: none;" class="payment-screenshot-preview"></div>
          </div>
          
          <div style="margin-top: 14px; padding: 10px 12px; border-radius: 8px; background: rgba(255,255,255,0.02); border: 1px solid rgba(255,255,255,0.06); text-align: center;">
            <p style="font-size: 0.66rem; color: #94a3b8; font-family: ui-monospace, monospace; margin: 0; text-transform: uppercase; letter-spacing: 0.05em;">🏛️ Delhi World Public School, Kompally, Hyderabad</p>
            <p style="font-size: 0.62rem; color: #64748b; margin: 3px 0 0 0;">Conference Dates: 20th – 22nd November 2026</p>
          </div>
        </div>

        <div class="form-actions">
          <button type="button" class="btn-back" onclick="nextOcStep(2)">Back</button>
          <button type="submit" class="btn-next">Submit Application</button>
        </div>
      </div>
    </form>
  </div>
</div>

<!-- SECRETARIAT APPLICATION MODAL -->
<div class="modal-overlay" id="secModal">
  <div class="modal-content">
    <button class="modal-close" id="closeSecModal" onclick="closeSecModal()" aria-label="Close">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
        <line x1="18" y1="6" x2="6" y2="18"></line>
        <line x1="6" y1="6" x2="18" y2="18"></line>
      </svg>
    </button>
    
    <div class="modal-header">
      <div class="modal-pretitle">EXECUTIVE LEADERSHIP · RESOLVE 2.0</div>
      <h2 class="modal-title">SECRETARIAT APPLICATION</h2>
      <span class="modal-subtitle">Join the Organizing Directorate</span>
    </div>

    <div class="typeform-step-indicator" id="secStepIndicator">
      <div class="step-pill active" id="secPill1"><span>1</span> Identity</div>
      <div class="step-divider"></div>
      <div class="step-pill" id="secPill2"><span>2</span> Experience &amp; Vision</div>
      <div class="step-divider"></div>
      <div class="step-pill" id="secPill3"><span>3</span> Submit</div>
    </div>
    
    <form id="secRegForm" onsubmit="window.submitSecForm ? window.submitSecForm(event) : event.preventDefault()">
      <!-- STEP 1: PERSONAL & DEPARTMENT -->
      <div class="form-step active" id="secStep1">
        <div class="form-group">
          <label for="secName">Full Name</label>
          <input type="text" id="secName" name="name" autocomplete="name" placeholder="Enter your full name" required>
        </div>
        
        <div class="form-group" style="display: grid; grid-template-columns: 1fr 1fr; gap: 14px;">
          <div>
            <label for="secPhone">Contact No (WhatsApp)</label>
            <input type="tel" id="secPhone" name="phone" autocomplete="tel" placeholder="10-digit number" required pattern="[0-9]{10}" minlength="10" maxlength="10">
          </div>
          <div>
            <label for="secEmail">Email ID</label>
            <input type="email" id="secEmail" name="email" autocomplete="email" placeholder="yourname@example.com" required>
          </div>
        </div>

        <div class="form-group" style="display: grid; grid-template-columns: 1fr 1fr; gap: 14px;">
          <div>
            <label for="secInst">Institution (School/College)</label>
            <input type="text" id="secInst" name="institute" autocomplete="organization" placeholder="Enter your institution" required>
          </div>
          <div>
            <label for="secDept">Preferred Secretariat Department</label>
            <select id="secDept" name="department" required>
              <option value="" disabled selected>Select Department</option>
              <option value="Delegate Affairs">Delegate Affairs</option>
              <option value="Marketing & Outreach">Marketing &amp; Outreach</option>
              <option value="Design & Media">Design &amp; Media</option>
              <option value="Logistics & Operations">Logistics &amp; Operations</option>
              <option value="Policy & Academics">Policy &amp; Academics</option>
              <option value="Finance & Sponsorship">Finance &amp; Sponsorship</option>
              <option value="Culturals & Hospitality">Culturals &amp; Hospitality</option>
              <option value="Security & Protocol">Security &amp; Protocol</option>
            </select>
          </div>
        </div>

        <button type="button" class="btn-next btn-full-width" onclick="nextSecStep(2)">
          Next: Experience &amp; Vision
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
        </button>
      </div>

      <!-- STEP 2: EXPERIENCE & VISION -->
      <div class="form-step" id="secStep2">
        <div class="form-group">
          <label for="secExp">Past MUN &amp; Organizing Experience</label>
          <textarea id="secExp" name="experience" rows="3" placeholder="List conferences attended, past roles, awards, or leadership posts..." required style="resize: vertical; min-height: 75px;"></textarea>
        </div>

        <div class="form-group">
          <label for="secWhy">Why do you want to join the Secretariat &amp; what is your vision?</label>
          <textarea id="secWhy" name="vision" rows="3" placeholder="What unique strengths and ideas will you bring to Resolve MUN 2.0?" required style="resize: vertical; min-height: 75px;"></textarea>
        </div>

        <div class="form-group">
          <label for="secPortfolio">Portfolio / Resume / LinkedIn URL (Optional)</label>
          <input type="url" id="secPortfolio" name="portfolio" placeholder="https://...">
        </div>

        <div class="form-actions">
          <button type="button" class="btn-back" onclick="nextSecStep(1)">Back</button>
          <button type="button" class="btn-next" onclick="nextSecStep(3)">Review &amp; Submit</button>
        </div>
      </div>

      <!-- STEP 3: REVIEW & CONFIRMATION -->
      <div class="form-step" id="secStep3">
        <div class="payment-banner" style="background: linear-gradient(135deg, #1e1b4b 0%, #312e81 50%, #4338ca 100%);">
          <h3>DIRECTORATE APPLICATION DOSSIER</h3>
          <p style="font-size: 0.68rem; opacity: 0.85; margin-top: 4px;">Direct Review by Secretary-General &amp; Executive Directorate</p>
        </div>

        <div class="payment-card">
          <p style="font-size: 0.8rem; color: rgba(255,255,255,0.8); line-height: 1.5; margin-bottom: 10px;">
            Thank you for applying to serve on the Resolve MUN 2.0 Secretariat. Applications are reviewed on a rolling basis. Shortlisted candidates will be contacted for an executive interview.
          </p>
          <div style="padding: 10px 12px; border-radius: 8px; background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.08); font-size: 0.72rem; color: #a5b4fc;">
            <strong>SELECTION STAGES:</strong> Dossier Screening &rarr; Departmental Interview &rarr; Official Appointment Letter
          </div>
        </div>

        <div class="form-actions">
          <button type="button" class="btn-back" onclick="nextSecStep(2)">Back</button>
          <button type="submit" class="btn-next" id="secSubmitBtn">Submit Application</button>
        </div>
      </div>
    </form>
  </div>
</div>

<!-- EB APPLICATION MODAL -->
<div class="modal-overlay" id="ebModal">
  <div class="modal-content">
    <button class="modal-close" id="closeEbModal" aria-label="Close">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
        <line x1="18" y1="6" x2="6" y2="18"></line>
        <line x1="6" y1="6" x2="18" y2="18"></line>
      </svg>
    </button>
    
    <div class="modal-header">
      <div class="modal-pretitle">ACADEMIC BOARD · RESOLVE 2.0</div>
      <h2 class="modal-title">EB APPLICATIONS</h2>
      <span class="modal-subtitle">Executive Board Recruitment</span>
    </div>
    
    <form id="ebRegForm">
      <!-- STEP 1: PERSONAL DETAILS -->
      <div class="form-step active" id="ebStep1">
        <div class="form-group">
          <label for="ebName">Full Name</label>
          <input type="text" id="ebName" placeholder="Enter your full name" required autocomplete="name">
        </div>
        
        <div class="form-group" style="display: grid; grid-template-columns: 1fr 1fr; gap: 14px;">
          <div>
            <label for="ebPhone">Phone (WhatsApp)</label>
            <input type="tel" id="ebPhone" placeholder="10-digit number" required autocomplete="tel" pattern="[0-9]{10}" minlength="10" maxlength="10" title="Please enter a valid 10-digit phone number">
          </div>
          <div>
            <label for="ebEmail">Email Address</label>
            <input type="email" id="ebEmail" placeholder="you@example.com" required autocomplete="email" pattern="[a-z0-9._%+\\-]+@[a-z0-9.\\-]+\\.[a-z]{2,}">
          </div>
        </div>

        <div class="form-group" style="display: grid; grid-template-columns: 1fr 1fr; gap: 14px;">
          <div>
            <label for="ebDob">Date of Birth</label>
            <input type="date" id="ebDob" required autocomplete="bday">
          </div>
          <div>
            <label for="ebReferral">Referral Code (Optional)</label>
            <input type="text" id="ebReferral" placeholder="e.g. RES-123" autocomplete="off">
          </div>
        </div>

        <div class="form-group">
          <label for="ebInst">Institution / School / College</label>
          <input type="text" id="ebInst" placeholder="Name of your current school/college" required>
        </div>

        <button type="button" class="btn-next btn-full-width" onclick="nextEbStep(2)">
          Next: Experience
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
        </button>
      </div>

      <!-- STEP 2: EXPERIENCE -->
      <div class="form-step" id="ebStep2">
        <div class="form-group">
          <label for="ebRole">Preferred Role</label>
          <select id="ebRole" required>
            <option value="" disabled selected>Select a role</option>
            <option value="Chairperson">Chairperson</option>
            <option value="Vice-Chairperson">Vice-Chairperson</option>
            <option value="Rapporteur">Rapporteur</option>
          </select>
        </div>

        <div class="form-group">
          <label for="ebMunCount">Number of MUNs attended</label>
          <select id="ebMunCount" required>
            <option value="" disabled selected>Select an option</option>
            <option value="15-20">15-20</option>
            <option value="21-30">21-30</option>
            <option value="31-50">31-50</option>
            <option value="51+">51 & More</option>
          </select>
        </div>

        <div class="form-group">
          <label for="ebExp">MUN Experience (Detailed Summary)</label>
          <textarea id="ebExp" placeholder="List committees chaired, awards won, and notable MUN experience" required style="min-height: 80px;"></textarea>
        </div>

        <div class="form-group">
          <label for="ebWhy">Why should we select you?</label>
          <textarea id="ebWhy" placeholder="Tell us about your moderation style and committee management skills" required style="min-height: 70px;"></textarea>
        </div>

        <div class="form-actions">
          <button type="button" class="btn-back" onclick="nextEbStep(1)">Back</button>
          <button type="button" class="btn-next" onclick="nextEbStep(3)">Committees</button>
        </div>
      </div>

      <!-- STEP 3: PREFERENCES -->
      <div class="form-step" id="ebStep3">
        <p style="font-size: 0.75rem; color: var(--gold); margin-bottom: 16px; text-transform: uppercase; letter-spacing: 0.1em; text-align: center;">Committee Preferences</p>
        
        <div class="form-group">
          <label>Preference 1</label>
          <select id="ebPref1" required>
            <option value="" disabled selected>Select Committee</option>
            <option value="DISEC">DISEC</option>
            <option value="LOK SABHA">Lok Sabha</option>
            <option value="UNHRC">UNHRC</option>
            <option value="CCC">CCC</option>
            <option value="UNCSW">UNCSW</option>
            <option value="IP (International Press)">IP (International Press)</option>
          </select>
        </div>

        <div class="form-group">
          <label>Preference 2</label>
          <select id="ebPref2" required>
            <option value="" disabled selected>Select Committee</option>
            <option value="DISEC">DISEC</option>
            <option value="LOK SABHA">Lok Sabha</option>
            <option value="UNHRC">UNHRC</option>
            <option value="CCC">CCC</option>
            <option value="UNCSW">UNCSW</option>
            <option value="IP (International Press)">IP (International Press)</option>
          </select>
        </div>

        <div class="form-group">
          <label for="ebCv">Upload CV / Portfolio (PDF or Image)</label>
          <label class="file-upload-wrapper" for="ebCv">
            <span class="file-upload-btn">Choose File</span>
            <span class="file-name">No file chosen</span>
            <input type="file" id="ebCv" class="file-upload-input" accept=".pdf,image/*" required>
          </label>
        </div>

        <div class="form-actions">
          <button type="button" class="btn-back" onclick="nextEbStep(2)">Back</button>
          <button type="submit" class="btn-next">Submit EB Application</button>
        </div>
      </div>
    </form>
  </div>
</div>

<!-- DELEGATION REGISTRATION MODAL -->
<div class="modal-overlay" id="delModal">
  <div class="modal-content" style="max-height: 90vh;">
    <button class="modal-close" id="closeDelModal" aria-label="Close">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
        <line x1="18" y1="6" x2="6" y2="18"></line>
        <line x1="6" y1="6" x2="18" y2="18"></line>
      </svg>
    </button>
    
    <div class="modal-header">
      <div class="modal-pretitle">INSTITUTIONAL INTAKE · RESOLVE 2.0</div>
      <h2 class="modal-title">DELEGATION APPLICATIONS</h2>
      <span class="modal-subtitle">Register as a Delegation</span>
    </div>
    
    <form id="delRegForm" novalidate>
      <!-- STEP 1: INSTITUTION DETAILS -->
      <div class="form-step active" id="delStep1">
        <div class="form-group">
          <label for="delInstName">Name of Institution</label>
          <input type="text" id="delInstName" name="instName" autocomplete="organization" placeholder="School/College/University Name" required>
        </div>
        
        <div class="form-group">
          <label for="delAdviserName">Faculty Adviser Name</label>
          <input type="text" id="delAdviserName" name="adviserName" autocomplete="name" placeholder="Full name of faculty in-charge" required>
        </div>

        <div class="form-group" style="display: grid; grid-template-columns: 1fr 1fr; gap: 14px;">
          <div>
            <label for="delAdviserPhone">Adviser Phone</label>
            <input type="tel" id="delAdviserPhone" name="adviserPhone" autocomplete="tel" placeholder="10-digit number" required pattern="[0-9]{10}" minlength="10" maxlength="10" title="Please enter a valid 10-digit phone number">
          </div>
          <div>
            <label for="delAdviserEmail">Adviser Email</label>
            <input type="email" id="delAdviserEmail" name="adviserEmail" autocomplete="email" placeholder="faculty@example.com" required pattern="[a-z0-9._%+\\-]+@[a-z0-9.\\-]+\\.[a-z]{2,}">
          </div>
        </div>

        <div class="form-group">
          <label for="delSize">Number of Delegates</label>
          <input type="number" id="delSize" name="delSize" min="8" value="8" placeholder="Minimum 8 delegates" required oninput="updateDelPrice(); updateDelegateFields();">
        </div>

        <button type="button" class="btn-next btn-full-width" onclick="nextDelStep(2)">
          Next Step
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
        </button>
      </div>

      <!-- STEP 2: DELEGATE DETAILS -->
      <div class="form-step" id="delStep2">
        <a href="#" onclick="showCustomAlert('Country Matrix Coming Soon!', 'default')" class="btn-matrix" style="margin-bottom: 16px;">
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/></svg>
          Country Matrices
        </a>
        <div id="delegateInputsContainer" style="max-height: 300px; overflow-y: auto; padding-right: 8px; margin-bottom: 16px;">
          <!-- Dynamic delegate fields will be injected here -->
        </div>

        <div class="form-actions">
          <button type="button" class="btn-back" onclick="nextDelStep(1)">Back</button>
          <button type="button" class="btn-next" onclick="nextDelStep(3)">Payment Details</button>
        </div>
      </div>

      <!-- STEP 3: PAYMENT & CONFIRMATION -->
      <div class="form-step" id="delStep3">
        <div class="payment-banner" style="text-align: center; margin-bottom: 14px;">
          <span style="display: inline-block; font-size: 0.65rem; font-weight: 700; font-mono: true; text-transform: uppercase; letter-spacing: 0.12em; color: #a855f7; background: rgba(168,85,247,0.1); border: 1px solid rgba(168,85,247,0.25); padding: 3px 10px; border-radius: 9999px; margin-bottom: 6px;">Institutional Delegation Roster</span>
          <h3 id="delTotalPriceDisplay" style="font-size: 1.4rem; font-weight: 800; color: #ffffff; letter-spacing: -0.02em; margin: 0;">Total Amount: ₹17,592</h3>
          <p style="font-size: 0.68rem; opacity: 0.7; margin-top: 4px;">(₹2199 per enrolled delegate)</p>
          <p class="non-refundable-notice" style="font-size: 0.65rem; color: #f87171; opacity: 0.9; margin-top: 6px; letter-spacing: 0.08em; text-transform: uppercase; font-weight: 600;">⚠️ Payment is non-refundable once submitted</p>
        </div>

        <div class="payment-card">
          <div class="form-group" style="margin-bottom: 0;">
            <label style="text-align: center; margin-bottom: 10px; font-size: 0.65rem; letter-spacing: 0.16em; opacity: 0.7; font-weight: 700;">1. SCAN QR CODE VIA ANY UPI APP</label>
            <div style="text-align: center;">
              <div class="qr-container">
                <img id="delPaymentQRImage" src="https://quickchart.io/qr?size=320&text=upi%3A%2F%2Fpay%3Fpa%3Dbhoomianilbasrani%40okhdfcbank%26pn%3DBhoomi%2520Basrani%26am%3D17592%26cu%3DINR" alt="Delegation Payment QR Code">
              </div>

              <div class="upi-supported-apps">
                <span class="upi-app-pill">GPay</span>
                <span class="upi-app-pill">PhonePe</span>
                <span class="upi-app-pill">Paytm</span>
                <span class="upi-app-pill">CRED</span>
                <span class="upi-app-pill">BHIM</span>
                <span class="upi-app-pill">Any UPI</span>
              </div>

              <div class="upi-box">
                <span id="delUpiID">bhoomianilbasrani@okhdfcbank</span>
                <button type="button" class="refresh-qr-btn" onclick="const size = parseInt(document.getElementById('delSize').value) || 8; generateDynamicQR((size * 2199).toString(), 'delPaymentQRImage', 'delUpiID')" title="Regenerate QR">
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="23 4 23 10 17 10"></polyline><polyline points="1 20 1 14 7 14"></polyline><path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"></path></svg>
                </button>
                <button type="button" class="copy-btn" onclick="copyDelUPI()" title="Copy UPI ID">
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path></svg>
                </button>
              </div>
              <span style="display: block; font-size: 0.68rem; color: #a1a1aa; margin-top: 2px;">Verified Payee: <strong style="color: #fff;">Bhoomi Basrani</strong></span>
            </div>
          </div>

          <div class="form-group" style="margin-top: 16px;">
            <label>2. TRANSACTION / REFERENCE ID*</label>
            <input type="text" id="delTxnID" placeholder="Enter Transaction / Reference ID" required>
          </div>

          <div class="form-group">
            <label>3. UPLOAD PAYMENT SCREENSHOT*</label>
            <label class="file-upload-wrapper" for="delDriveLink">
              <span class="file-upload-btn">Choose File</span>
              <span class="file-name" id="delDriveFileName">No file chosen</span>
              <input type="file" id="delDriveLink" class="file-upload-input" accept="image/*" required>
            </label>
            <div id="delScreenshotPreview" style="display: none;" class="payment-screenshot-preview"></div>
          </div>

          <div class="form-group">
            <label>4. 12-DIGIT UTR NUMBER (OPTIONAL)</label>
            <input type="text" id="delUTR" placeholder="Enter 12-digit UTR from banking app">
          </div>

          <div style="margin-top: 14px; padding: 10px 12px; border-radius: 8px; background: rgba(255,255,255,0.02); border: 1px solid rgba(255,255,255,0.06); text-align: center;">
            <p style="font-size: 0.66rem; color: #94a3b8; font-family: ui-monospace, monospace; margin: 0; text-transform: uppercase; letter-spacing: 0.05em;">🏛️ Delhi World Public School, Kompally, Hyderabad</p>
            <p style="font-size: 0.62rem; color: #64748b; margin: 3px 0 0 0;">Conference Dates: 20th – 22nd November 2026</p>
          </div>
        </div>

        <div class="payment-footer">
          <p class="payment-contact">For Any Queries, contact: <span>+91 92121 07797</span></p>
        </div>

        <div class="form-actions">
          <button type="button" class="btn-back" onclick="nextDelStep(2)">Back</button>
          <button type="submit" class="btn-next">Submit Delegation</button>
        </div>
      </div>
    </form>
  </div>
</div>

<!-- CTA -->
<section id="register">
  <div class="cta-inner">
    <p class="cta-eyebrow reveal visible">Limited Spots Available</p>
    <h2 class="cta-title reveal">TAKE YOUR<br>SEAT AT<br>THE TABLE</h2>
    <p class="cta-body reveal">
      Resolve MUN is where future statesmen are forged. Join 300+ delegates from all over Hyderabad in three days of rigorous, transformative diplomacy.
    </p>
    <div class="cta-actions reveal">
      <button class="adaptive-hero-btn cta-btn-hero-match" onclick="window.selectPathway ? window.selectPathway('delegate') : (window.openRegistration ? window.openRegistration() : (window.openAuthModal ? window.openAuthModal() : alert('Opening Registration...')))">
        <span>REGISTER AS A DELEGATE</span>
      </button>
      <button class="adaptive-hero-btn cta-btn-hero-match cta-btn-secondary" onclick="window.selectPathway ? window.selectPathway('delegation') : (window.openDelRegistration ? window.openDelRegistration() : (window.openAuthModal ? window.openAuthModal() : alert('Opening Registration...')))">
        <span>REGISTER A DELEGATION</span>
      </button>
    </div>
  </div>
</section>
`;
