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

    <div class="selection-top-grid" style="grid-template-columns: 1fr;">
      <!-- 1. Secretariat (THE ONLY ACTIVE APPLICATION) -->
      <div class="selection-card selection-card--sec selection-card--featured" style="border: 2px solid #818cf8; background: linear-gradient(135deg, rgba(30, 27, 75, 0.7) 0%, rgba(15, 23, 42, 0.9) 100%); box-shadow: 0 0 30px rgba(99, 102, 241, 0.25);" onclick="selectPathway('secretariat')">
        <div class="selection-card-header">
          <span class="selection-badge" style="background: #22c55e; color: #042f2e; font-weight: 800; letter-spacing: 0.08em;">NOW OPEN · ZERO FEE</span>
          <span style="font-size: 11px; color: #a5b4fc; font-family: monospace;">HYDERABAD 2026</span>
        </div>
        <div class="selection-card-body" style="padding: 10px 0;">
          <h3 style="font-size: 1.4rem; color: #ffffff;">SECRETARIAT 2.0</h3>
          <p style="font-size: 0.85rem; color: rgba(255, 255, 255, 0.8); line-height: 1.5;">
            Join the executive high-command of Resolve MUN 2.0. Open leadership tracks across USG, Operations, IT, Media, and Delegate Affairs. No application or participation fees.
          </p>
        </div>
        <div class="selection-card-action">
          <span class="selection-btn-primary" style="background: linear-gradient(135deg, #6366f1, #a855f7); color: #fff; padding: 10px 20px; border-radius: 8px; font-weight: 700;">Open Official Application &rarr;</span>
        </div>
      </div>
    </div>

    <div class="selection-bottom-grid" style="grid-template-columns: repeat(auto-fit, minmax(140px, 1fr)); margin-top: 14px;">
      <!-- 2. Delegate (Closed) -->
      <div class="selection-card selection-card--delegate selection-card--closed" style="opacity: 0.6; cursor: not-allowed;" onclick="window.showCustomAlert ? window.showCustomAlert('Delegate registrations are currently closed. Only Secretariat Applications are open.', 'info') : alert('Delegate registrations are currently closed.')">
        <div class="selection-card-header">
          <span class="selection-badge selection-badge--muted">CLOSED</span>
        </div>
        <div class="selection-card-body">
          <h3 style="font-size: 1rem;">DELEGATE</h3>
          <p style="font-size: 0.72rem;">Individual delegate registration currently closed.</p>
        </div>
        <div class="selection-card-action">
          <span class="selection-btn-ghost opacity-40 text-xs">Closed</span>
        </div>
      </div>

      <!-- 3. Delegation (Closed) -->
      <div class="selection-card selection-card--delegation selection-card--closed" style="opacity: 0.6; cursor: not-allowed;" onclick="window.showCustomAlert ? window.showCustomAlert('Delegation registrations are currently closed. Only Secretariat Applications are open.', 'info') : alert('Delegation registrations are currently closed.')">
        <div class="selection-card-header">
          <span class="selection-badge selection-badge--muted">CLOSED</span>
        </div>
        <div class="selection-card-body">
          <h3 style="font-size: 1rem;">DELEGATION</h3>
          <p style="font-size: 0.72rem;">Institutional delegations currently closed.</p>
        </div>
        <div class="selection-card-action">
          <span class="selection-btn-ghost opacity-40 text-xs">Closed</span>
        </div>
      </div>

      <!-- 4. OC (Closed) -->
      <div class="selection-card selection-card--oc selection-card--closed" style="opacity: 0.6; cursor: not-allowed;" onclick="window.showCustomAlert ? window.showCustomAlert('OC applications are closed. Only Secretariat Applications are open.', 'info') : alert('OC Applications are closed.')">
        <div class="selection-card-header">
          <span class="selection-badge selection-badge--muted">CLOSED</span>
        </div>
        <div class="selection-card-body">
          <h3 style="font-size: 1rem;">OC</h3>
          <p style="font-size: 0.72rem;">Organizing Committee is closed.</p>
        </div>
        <div class="selection-card-action">
          <span class="selection-btn-ghost opacity-40 text-xs">Closed</span>
        </div>
      </div>

      <!-- 5. EB (Closed) -->
      <div class="selection-card selection-card--disabled selection-card--closed" style="opacity: 0.6; cursor: not-allowed;" onclick="window.showCustomAlert ? window.showCustomAlert('Executive Board applications are closed.', 'info') : alert('Executive Board applications are closed.')">
        <div class="selection-card-header">
          <span class="selection-badge selection-badge--muted">CLOSED</span>
        </div>
        <div class="selection-card-body">
          <h3 style="font-size: 1rem;">EB</h3>
          <p style="font-size: 0.72rem;">Executive Board is closed.</p>
        </div>
        <div class="selection-card-action">
          <span class="selection-btn-ghost opacity-40 text-xs">Closed</span>
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
<section id="secretariat" class="reveal" style="position: relative;">
  <div class="sec-header reveal">
    <div class="section-label">Secretariat</div>
    <h2 class="section-title">MEET THE TEAM</h2>
    <p class="section-body" style="max-width: 600px;">The official Executive Secretariat of Resolve MUN 2.0 is currently being finalized. Full leadership roster releasing soon.</p>
  </div>
  
  <div class="sec-carousel-container" style="position: relative; overflow: hidden; min-height: 380px;">
    <!-- RELEASING SOON FROSTED BLUE OVERLAY -->
    <div class="secretariat-coming-soon coming-soon-overlay" style="position: absolute; inset: 0; display: flex; flex-direction: column; align-items: center; justify-content: center; background: radial-gradient(circle at center, rgba(14, 21, 56, 0.88) 0%, rgba(5, 7, 20, 0.96) 100%); backdrop-filter: blur(25px); -webkit-backdrop-filter: blur(25px); z-index: 100; padding: 24px; text-align: center; border: 1px solid rgba(56, 189, 248, 0.25); border-radius: 24px; box-shadow: inset 0 0 100px rgba(0,0,0,0.7);">
      <div style="display: inline-flex; align-items: center; gap: 8px; padding: 6px 18px; border-radius: 9999px; background: rgba(56, 189, 248, 0.12); border: 1px solid rgba(56, 189, 248, 0.35); box-shadow: 0 0 20px rgba(56, 189, 248, 0.2); margin-bottom: 16px;">
        <span style="width: 8px; height: 8px; border-radius: 50%; background: #38bdf8; box-shadow: 0 0 10px #38bdf8;"></span>
        <span style="font-family: 'Oswald', sans-serif; font-size: 13px; letter-spacing: 0.18em; text-transform: uppercase; color: #7dd3fc; font-weight: 600;">Executive Roster</span>
      </div>
      <div style="font-family: 'Oswald', sans-serif; font-size: clamp(26px, 4vw, 42px); font-weight: 700; letter-spacing: 0.12em; text-transform: uppercase; color: #ffffff; margin-bottom: 12px; text-shadow: 0 4px 25px rgba(56, 189, 248, 0.4);">
        RELEASING SOON
      </div>
      <p style="font-size: 14px; color: rgba(255, 255, 255, 0.72); max-width: 480px; line-height: 1.6; margin: 0 0 18px 0;">
        The official appointments for the Resolve MUN 2.0 Secretariat will be revealed shortly. Stay tuned for the official release.
      </p>
      <div style="display: inline-flex; align-items: center; gap: 10px; font-size: 12px; font-family: monospace; color: rgba(255, 255, 255, 0.45); letter-spacing: 0.1em; text-transform: uppercase; padding: 6px 14px; background: rgba(255, 255, 255, 0.04); border-radius: 8px; border: 1px solid rgba(255, 255, 255, 0.08);">
        <span>✦ 25 Executive Appointments</span>
        <span>•</span>
        <span>Edition 2.0</span>
      </div>
    </div>

    <div class="sec-track is-coming-soon" id="secTrack" style="filter: blur(28px) saturate(0.6) !important; opacity: 0.12 !important; pointer-events: none !important; user-select: none !important;">
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

<!-- SECRETARIAT APPLICATION MODAL (1:1 GOOGLE FORM ENGINE) -->
<div class="modal-overlay" id="secModal">
  <div class="modal-content" style="max-width: 680px; max-height: 90vh; overflow-y: auto;">
    <button class="modal-close" id="closeSecModal" onclick="closeSecModal()" aria-label="Close">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
        <line x1="18" y1="6" x2="6" y2="18"></line>
        <line x1="6" y1="6" x2="18" y2="18"></line>
      </svg>
    </button>
    
    <div class="modal-header" style="text-align: left; padding-bottom: 12px; border-bottom: 1px solid rgba(255,255,255,0.08);">
      <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 6px;">
        <span class="selection-badge" style="background: rgba(99, 102, 241, 0.2); color: #a5b4fc; border: 1px solid rgba(129, 140, 248, 0.3); font-size: 10px; font-weight: 700; letter-spacing: 0.1em;">RESOLVE MUN 2.0 · HIGH COMMAND</span>
        <span style="font-size: 10px; color: #34d399; font-weight: 700; background: rgba(52, 211, 153, 0.1); padding: 2px 8px; border-radius: 4px; border: 1px solid rgba(52, 211, 153, 0.25);">ZERO REGISTRATION FEE</span>
      </div>
      <h2 class="modal-title" style="font-size: 1.5rem; letter-spacing: 0.02em; margin: 4px 0;">Secretariat Applications &mdash; Resolve MUN 2.0</h2>
      <span class="modal-subtitle" style="font-size: 0.8rem; color: rgba(255,255,255,0.65);">Hyderabad &bull; 20th &ndash; 22nd November 2026</span>
    </div>

    <!-- 3-STEP PROGRESS INDICATOR -->
    <div class="typeform-step-indicator" id="secStepIndicator" style="margin: 16px 0 20px;">
      <div class="step-pill active" id="secPill1"><span>1</span> Overview</div>
      <div class="step-divider"></div>
      <div class="step-pill" id="secPill2"><span>2</span> Personal Details</div>
      <div class="step-divider"></div>
      <div class="step-pill" id="secPill3"><span>3</span> Role &amp; Portfolio</div>
    </div>
    
    <form id="secRegForm" onsubmit="window.submitSecForm ? window.submitSecForm(event) : event.preventDefault()">
      <!-- STEP 1: BRIEFING & INVITATION (FROM GOOGLE FORM PAGE 1) -->
      <div class="form-step active" id="secStep1">
        <div style="background: rgba(15, 23, 42, 0.75); border: 1px solid rgba(129, 140, 248, 0.2); border-radius: 12px; padding: 20px; margin-bottom: 20px; line-height: 1.65;">
          <p style="font-size: 0.88rem; color: #ffffff; font-weight: 600; margin-top: 0; margin-bottom: 12px;">
            Resolve MUN is inviting motivated individuals to apply for our Secretariat for Resolve MUN 2.0.
          </p>
          <p style="font-size: 0.82rem; color: rgba(255, 255, 255, 0.8); margin-bottom: 12px;">
            As part of the Secretariat, you'll be at the core of how this conference comes together, working across areas like delegate affairs, logistics, committee management, PR and media, IT, and sponsorship outreach. You'll get hands-on experience planning and coordinating a conference for 500+ delegates, working closely with the Executive Board to make sure every committee runs smoothly, and being part of the behind-the-scenes decision-making that turns a three-day event from an idea into reality.
          </p>
          <p style="font-size: 0.82rem; color: rgba(255, 255, 255, 0.8); margin-bottom: 12px;">
            This is real responsibility, not a title. You'll be involved from the planning stage right through to execution on the ground, gaining experience in leadership, crisis management, negotiation, and large-scale event operations that goes well beyond what a typical school activity offers.
          </p>
          <p style="font-size: 0.82rem; color: rgba(255, 255, 255, 0.8); margin-bottom: 12px;">
            Prior experience in MUN or event organising is a plus, but not mandatory. What matters most is that you're motivated, reliable, and ready to put in the work.
          </p>
          <p style="font-size: 0.85rem; color: #a5b4fc; font-weight: 600; margin-bottom: 0;">
            If this sounds like you, we'd love to have you on board. Apply now and be part of the team building Resolve MUN 2.0.
          </p>
        </div>

        <!-- Google Form Sync Banner -->
        <div style="display: flex; align-items: center; gap: 12px; background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.08); border-radius: 10px; padding: 14px 16px; margin-bottom: 20px;">
          <div style="width: 32px; height: 32px; border-radius: 50%; background: rgba(99, 102, 241, 0.2); display: flex; align-items: center; justify-content: center; flex-shrink: 0; color: #818cf8;">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"></path><polyline points="17 21 17 13 7 13 7 21"></polyline><polyline points="7 3 7 8 15 8"></polyline></svg>
          </div>
          <div>
            <p style="margin: 0; font-size: 0.78rem; font-weight: 600; color: #ffffff;">Cloud Synchronized Application</p>
            <p style="margin: 2px 0 0 0; font-size: 0.72rem; color: rgba(255,255,255,0.55);">
              Your contact information, resume, and portfolio will be securely recorded in the official Resolve Directorate Google Drive repository.
            </p>
          </div>
        </div>

        <button type="button" class="btn-next btn-full-width" style="padding: 13px 20px; font-weight: 700; letter-spacing: 0.04em;" onclick="nextSecStep(2)">
          <span>Next: Secretariat Application Details</span>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
        </button>
      </div>

      <!-- STEP 2: PERSONAL DETAILS (FROM GOOGLE FORM PAGE 2) -->
      <div class="form-step" id="secStep2">
        <div style="margin-bottom: 16px; padding-bottom: 8px; border-bottom: 1px solid rgba(255,255,255,0.06);">
          <h3 style="font-size: 1.1rem; color: #ffffff; margin: 0;">Secretariat Application</h3>
          <p style="font-size: 0.75rem; color: #f87171; margin: 4px 0 0 0;">* Indicates required question</p>
        </div>

        <div class="form-group">
          <label for="secName">Full Name <span style="color:#f87171;">*</span></label>
          <input type="text" id="secName" name="name" autocomplete="name" placeholder="Your answer" required>
        </div>
        
        <div class="form-group" style="display: grid; grid-template-columns: 1fr 1fr; gap: 14px;">
          <div>
            <label for="secEmail">Email ID <span style="color:#f87171;">*</span></label>
            <input type="email" id="secEmail" name="email" autocomplete="email" placeholder="Your answer" required>
          </div>
          <div>
            <label for="secPhone">Contact Number <span style="color:#f87171;">*</span></label>
            <input type="tel" id="secPhone" name="phone" autocomplete="tel" placeholder="10-digit mobile number" required pattern="[0-9]{10}" minlength="10" maxlength="10">
          </div>
        </div>

        <div class="form-group" style="display: grid; grid-template-columns: 1fr 1fr; gap: 14px;">
          <div>
            <label for="secInsta">Instagram Handle (Optional)</label>
            <input type="text" id="secInsta" name="instagram" placeholder="@username">
          </div>
          <div>
            <label for="secSchool">School/College <span style="color:#f87171;">*</span></label>
            <input type="text" id="secSchool" name="schoolCollege" autocomplete="organization" placeholder="Your answer" required>
          </div>
        </div>

        <div class="form-group">
          <label for="secAddress">Full Residential Address</label>
          <input type="text" id="secAddress" name="residentialAddress" placeholder="Your residential address">
        </div>

        <div class="form-group" style="display: grid; grid-template-columns: 1fr 1fr; gap: 14px;">
          <div>
            <label for="secDob">Date of Birth <span style="color:#f87171;">*</span></label>
            <input type="date" id="secDob" name="dob" required style="color-scheme: dark;">
          </div>
          <div>
            <label>Grade <span style="color:#f87171;">*</span></label>
            <select id="secGrade" name="grade" required>
              <option value="" disabled selected>Select Grade</option>
              <option value="9th">9th</option>
              <option value="10th">10th</option>
              <option value="11th">11th</option>
              <option value="12th">12th</option>
              <option value="Undergraduate">Undergraduate / College</option>
              <option value="Other">Other</option>
            </select>
          </div>
        </div>

        <div class="form-actions" style="margin-top: 20px;">
          <button type="button" class="btn-back" onclick="nextSecStep(1)">Back</button>
          <button type="button" class="btn-next" onclick="nextSecStep(3)">
            <span>Next: Role &amp; Experience</span>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
          </button>
        </div>
      </div>

      <!-- STEP 3: EXPERIENCE, POSITION & DRIVE UPLOADS (FROM GOOGLE FORM PAGE 3) -->
      <div class="form-step" id="secStep3">
        <div style="margin-bottom: 16px; padding-bottom: 8px; border-bottom: 1px solid rgba(255,255,255,0.06);">
          <h3 style="font-size: 1.1rem; color: #ffffff; margin: 0;">Previous experiences (any, if qualifying)</h3>
          <p style="font-size: 0.75rem; color: rgba(255,255,255,0.6); margin: 4px 0 0 0;">Position selection &amp; portfolio uploads</p>
        </div>

        <div class="form-group">
          <label for="secPosition">Which position are you applying for? <span style="color:#f87171;">*</span></label>
          <select id="secPosition" name="position" required style="font-size: 0.88rem; padding: 11px 14px;">
            <option value="" disabled selected>Choose a position...</option>
            <option value="Secretary-General">Secretary-General</option>
            <option value="Deputy Secretary-General">Deputy Secretary-General</option>
            <option value="Director-General">Director-General</option>
            <option value="USG Delegate Affairs (with experience)">USG Delegate Affairs (with experience)</option>
            <option value="USG Logistics/Operations">USG Logistics/Operations</option>
            <option value="USG Marketing & Outreach (with experience)">USG Marketing & Outreach (with experience)</option>
            <option value="USG Sponsorships/Partnerships">USG Sponsorships/Partnerships</option>
            <option value="USG Design & Media (with experience)">USG Design & Media (with experience)</option>
            <option value="USG IT/Technical">USG IT/Technical</option>
            <option value="USG Hospitality">USG Hospitality</option>
            <option value="USG Policy (with experience)">USG Policy (with experience)</option>
            <option value="Other">Other</option>
          </select>
        </div>

        <div class="form-group">
          <label for="secWhy">Why do you want to join Resolve Secretariat? <span style="color:#f87171;">*</span></label>
          <textarea id="secWhy" name="whyJoin" rows="3" placeholder="Your answer" required style="resize: vertical; min-height: 80px;"></textarea>
        </div>

        <div class="form-group">
          <label for="secContribution">What do you think you can contribute to this specific role? <span style="color:#f87171;">*</span></label>
          <textarea id="secContribution" name="contribution" rows="3" placeholder="Your answer" required style="resize: vertical; min-height: 80px;"></textarea>
        </div>

        <div class="form-group">
          <label for="secHours">How many hours per day can realistically commit? <span style="color:#f87171;">*</span></label>
          <input type="text" id="secHours" name="dailyCommitment" placeholder="e.g. 2-3 hours / day" required>
        </div>

        <!-- DRIVE UPLOAD 1: PORTFOLIO / WORK (UP TO 5 FILES / LINK) -->
        <div class="form-group" style="background: rgba(255,255,255,0.02); border: 1px solid rgba(255,255,255,0.08); border-radius: 10px; padding: 14px;">
          <label style="margin-bottom: 4px; font-weight: 700; color: #ffffff;">Previous designs, work, resume, edits, etc. (upto 5)</label>
          <p style="font-size: 0.72rem; color: rgba(255,255,255,0.5); margin: 0 0 10px 0;">Upload your work files or portfolio (PDF, images, ZIP, max 50MB)</p>
          <label class="file-upload-wrapper" for="secPortfolioFile" style="cursor: pointer; display: flex; align-items: center; gap: 10px; padding: 10px 14px; background: rgba(99,102,241,0.1); border: 1px dashed rgba(129,140,248,0.4); border-radius: 8px;">
            <span class="file-upload-btn" style="background: #6366f1; color: white; padding: 5px 12px; border-radius: 6px; font-size: 11px; font-weight: 700;">+ Add File</span>
            <span class="file-name" id="secPortfolioFileName" style="font-size: 11px; color: rgba(255,255,255,0.6);">No file chosen</span>
            <input type="file" id="secPortfolioFile" class="file-upload-input" accept=".pdf,.png,.jpg,.jpeg,.zip,.docx" style="display: none;">
          </label>
          <div id="secPortfolioPreview" style="display: none; margin-top: 8px; font-size: 11px; color: #34d399; font-weight: 600;"></div>
        </div>

        <!-- DRIVE UPLOAD 2: RESUME / CV (OPTIONAL BUT RECOMMENDED) -->
        <div class="form-group" style="background: rgba(255,255,255,0.02); border: 1px solid rgba(255,255,255,0.08); border-radius: 10px; padding: 14px;">
          <label style="margin-bottom: 4px; font-weight: 700; color: #ffffff;">Resume/CV Upload (optional but recommended)</label>
          <p style="font-size: 0.72rem; color: rgba(255,255,255,0.5); margin: 0 0 10px 0;">Upload 1 supported file (PDF or DOC, max 10 MB)</p>
          <label class="file-upload-wrapper" for="secResumeFile" style="cursor: pointer; display: flex; align-items: center; gap: 10px; padding: 10px 14px; background: rgba(168,85,247,0.1); border: 1px dashed rgba(192,132,252,0.4); border-radius: 8px;">
            <span class="file-upload-btn" style="background: #a855f7; color: white; padding: 5px 12px; border-radius: 6px; font-size: 11px; font-weight: 700;">+ Add File</span>
            <span class="file-name" id="secResumeFileName" style="font-size: 11px; color: rgba(255,255,255,0.6);">No file chosen</span>
            <input type="file" id="secResumeFile" class="file-upload-input" accept=".pdf,.doc,.docx" style="display: none;">
          </label>
          <div id="secResumePreview" style="display: none; margin-top: 8px; font-size: 11px; color: #34d399; font-weight: 600;"></div>
        </div>

        <!-- GOOGLE FORM FOOTER NOTICE -->
        <div style="background: rgba(99, 102, 241, 0.05); border: 1px solid rgba(129, 140, 248, 0.2); border-radius: 10px; padding: 14px 16px; margin: 16px 0;">
          <p style="margin: 0 0 6px 0; font-size: 0.78rem; font-weight: 700; color: #ffffff;">Shortlisted applicants will be contacted for an interview.</p>
          <p style="margin: 0 0 8px 0; font-size: 0.75rem; color: rgba(255,255,255,0.85); font-weight: 600;">Selections and allocations will be made on the basis of merit and availability.</p>
          <p style="margin: 0; font-size: 0.72rem; color: #a5b4fc; font-family: monospace;">Instagram Handle: @mun.resolve &bull; Email ID: resolve.mun@gmail.com</p>
          <p style="margin: 6px 0 0 0; font-size: 0.72rem; color: #34d399; font-weight: 700;">&bull; No registration or application fee required.</p>
        </div>

        <div class="form-actions">
          <button type="button" class="btn-back" onclick="nextSecStep(2)">Back</button>
          <button type="submit" class="btn-next" id="secSubmitBtn" style="background: linear-gradient(135deg, #6366f1, #a855f7); font-weight: 700;">Submit Secretariat Dossier</button>
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
    <p class="cta-eyebrow reveal visible" style="color: #34d399; font-weight: 700;">Executive Directorate Intake Now Active</p>
    <h2 class="cta-title reveal">TAKE YOUR<br>SEAT AT<br>THE TABLE</h2>
    <p class="cta-body reveal">
      Delegate and Delegation registrations are currently closed. Secretariat Applications for Resolve MUN 2.0 are officially open &mdash; apply now to shape the premier diplomatic conference of Hyderabad.
    </p>
    <div class="cta-actions reveal" style="display: flex; flex-direction: column; align-items: center; gap: 14px;">
      <button class="adaptive-hero-btn cta-btn-hero-match" style="background: linear-gradient(135deg, #4f46e5 0%, #7c3aed 50%, #d946ef 100%); box-shadow: 0 0 35px rgba(124, 58, 237, 0.45); border: 1px solid rgba(255, 255, 255, 0.3); padding: 14px 32px;" onclick="window.selectPathway ? window.selectPathway('secretariat') : (window.openSecModal ? window.openSecModal() : alert('Opening Secretariat Application...'))">
        <span>APPLY FOR SECRETARIAT 2.0 &rarr;</span>
      </button>
      <div style="display: flex; flex-wrap: wrap; justify-content: center; gap: 10px;">
        <button class="adaptive-hero-btn cta-btn-hero-match cta-btn-secondary" style="opacity: 0.5; cursor: not-allowed; pointer-events: auto;" onclick="window.showCustomAlert ? window.showCustomAlert('Delegate registrations are currently closed. Only Secretariat Applications are open.', 'info') : alert('Delegate registrations are currently closed.')">
          <span>DELEGATE REGISTRATIONS CLOSED</span>
        </button>
        <button class="adaptive-hero-btn cta-btn-hero-match cta-btn-secondary" style="opacity: 0.5; cursor: not-allowed; pointer-events: auto;" onclick="window.showCustomAlert ? window.showCustomAlert('Delegation registrations are currently closed. Only Secretariat Applications are open.', 'info') : alert('Delegation registrations are currently closed.')">
          <span>DELEGATIONS CLOSED</span>
        </button>
      </div>
    </div>
  </div>
</section>
`;
