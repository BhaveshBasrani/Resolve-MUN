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
  <span class="loader-text">Loading...</span>
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
      <div class="modal-pretitle">RESOLVE MUN 2.0 · 27–29 NOV 2026</div>
      <h2 class="modal-title">CHOOSE YOUR PATHWAY</h2>
      <p class="modal-subtitle">Meridian School, Kompally · Hyderabad</p>
    </div>

    <div class="selection-top-grid" style="grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); gap: 14px;">
      <!-- 1. Priority Round Delegate -->
      <div id="pathwayCardDelegate" class="selection-card selection-card--delegate selection-card--featured" style="border: 1.5px solid rgba(168, 85, 247, 0.55); background: linear-gradient(135deg, rgba(59, 7, 100, 0.45) 0%, rgba(15, 23, 42, 0.92) 100%); cursor: pointer;" onclick="selectPathway('delegate')">
        <div class="selection-card-header">
          <span id="pathwayBadgeDelegate" class="selection-badge" style="background: #a855f7; color: #ffffff; font-weight: 800; letter-spacing: 0.08em;">PRIORITY ROUND · ₹2,500</span>
          <span style="font-size: 10px; color: #d8b4fe; font-family: monospace;">OPEN</span>
        </div>
        <div class="selection-card-body" style="padding: 8px 0;">
          <h3 style="font-size: 1.25rem; color: #ffffff;">INDIVIDUAL DELEGATE</h3>
          <p style="font-size: 0.78rem; color: rgba(255, 255, 255, 0.78); line-height: 1.45;">
            Represent a portfolio across 6 dynamic committees (DISEC, UNHRC, UNSC, Lok Sabha, International Press, Committee X).
          </p>
        </div>
        <div class="selection-card-action">
          <span class="selection-btn-primary" style="background: linear-gradient(135deg, #7c3aed, #a855f7); color: #fff; padding: 8px 16px; border-radius: 8px; font-weight: 700; font-size: 0.76rem;">Register as Delegate &rarr;</span>
        </div>
      </div>

      <!-- 2. Institutional Delegation -->
      <div id="pathwayCardDelegation" class="selection-card selection-card--delegation selection-card--featured" style="border: 1.5px solid rgba(56, 189, 248, 0.45); background: linear-gradient(135deg, rgba(12, 74, 110, 0.4) 0%, rgba(15, 23, 42, 0.92) 100%); cursor: pointer;" onclick="selectPathway('delegation')">
        <div class="selection-card-header">
          <span id="pathwayBadgeDelegation" class="selection-badge" style="background: #0284c7; color: #ffffff; font-weight: 800; letter-spacing: 0.08em;">₹2,200 / DEL · MIN 6</span>
          <span style="font-size: 10px; color: #7dd3fc; font-family: monospace;">₹25K PRIZE POOL</span>
        </div>
        <div class="selection-card-body" style="padding: 8px 0;">
          <h3 style="font-size: 1.25rem; color: #ffffff;">DELEGATION</h3>
          <p style="font-size: 0.78rem; color: rgba(255, 255, 255, 0.78); line-height: 1.45;">
            Register a contingent of 6+ delegates and compete for the ₹25,000 Best Delegation cash prize pool.
          </p>
        </div>
        <div class="selection-card-action">
          <span class="selection-btn-primary" style="background: linear-gradient(135deg, #0284c7, #38bdf8); color: #fff; padding: 8px 16px; border-radius: 8px; font-weight: 700; font-size: 0.76rem;">Register Delegation &rarr;</span>
        </div>
      </div>
    </div>

    <div class="selection-bottom-grid" style="grid-template-columns: repeat(auto-fit, minmax(160px, 1fr)); margin-top: 14px; gap: 12px;">
      <!-- 3. Organizing Committee (OC) -->
      <div id="pathwayCardOc" class="selection-card selection-card--oc" onclick="selectPathway('oc')" style="cursor: pointer; border: 1px solid rgba(56, 189, 248, 0.3);">
        <div class="selection-card-header">
          <span id="pathwayBadgeOc" class="selection-badge" style="background: rgba(56, 189, 248, 0.15); color: #7dd3fc; border: 1px solid rgba(56, 189, 248, 0.3);">SALARIED ROLE · OPEN</span>
        </div>
        <div class="selection-card-body">
          <h3 style="font-size: 1.05rem; color: #fff;">ORGANIZING COMMITTEE</h3>
          <p style="font-size: 0.72rem;">Salaried role — choose from ₹1,500 / ₹1,000 / ₹750 tiers or Pay Later.</p>
        </div>
        <div class="selection-card-action">
          <span class="selection-btn-ghost text-xs">Apply for OC &rarr;</span>
        </div>
      </div>

      <!-- 4. Secretariat 2.0 -->
      <div id="pathwayCardSecretariat" class="selection-card selection-card--sec" onclick="selectPathway('secretariat')" style="cursor: pointer; border: 1px solid rgba(52, 211, 153, 0.35);">
        <div class="selection-card-header">
          <span id="pathwayBadgeSecretariat" class="selection-badge" style="background: rgba(52, 211, 153, 0.15); color: #6ee7b7; border: 1px solid rgba(52, 211, 153, 0.3);">NOW OPEN · FREE</span>
        </div>
        <div class="selection-card-body">
          <h3 style="font-size: 1.05rem; color: #fff;">SECRETARIAT 2.0</h3>
          <p style="font-size: 0.72rem;">Apply for SG, DSG, DG, or USG leadership roles. Free application.</p>
        </div>
        <div class="selection-card-action">
          <span class="selection-btn-ghost text-xs">Apply Free &rarr;</span>
        </div>
      </div>

      <!-- 5. EB (Greyed Out by default unless enabled) -->
      <div id="pathwayCardEb" class="selection-card selection-card--disabled selection-card--closed" style="opacity: 0.45; filter: grayscale(1); cursor: not-allowed;" onclick="selectPathway('eb')">
        <div class="selection-card-header">
          <span id="pathwayBadgeEb" class="selection-badge selection-badge--muted">UNAVAILABLE</span>
        </div>
        <div class="selection-card-body">
          <h3 style="font-size: 1.05rem;">EXECUTIVE BOARD</h3>
          <p style="font-size: 0.72rem;">Executive Board applications are currently closed.</p>
        </div>
        <div class="selection-card-action">
          <span class="selection-btn-ghost opacity-40 text-xs">Closed</span>
        </div>
      </div>
    </div>
  </div>
</div>

<!-- DELEGATE REGISTRATION MODAL (1:1 PRIORITY ROUND DELEGATE GOOGLE FORM) -->
<div class="modal-overlay" id="regModal">
  <div class="modal-content" style="max-width: 660px; max-height: 90vh; overflow-y: auto;">
    <button class="modal-close" id="closeModal" aria-label="Close">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
        <line x1="18" y1="6" x2="6" y2="18"></line>
        <line x1="6" y1="6" x2="18" y2="18"></line>
      </svg>
    </button>
    
    <div class="modal-header">
      <div class="modal-pretitle">RESOLVE MUN 2.0 · PRIORITY ROUND</div>
      <h2 class="modal-title">DELEGATE REGISTRATION</h2>
      <span class="modal-subtitle">27th – 29th November 2026 · Meridian School, Kompally</span>
    </div>
    
    <form id="regForm" novalidate>
      <!-- STEP 1: PERSONAL DETAILS -->
      <div class="form-step active" id="step1">
        <div class="form-group">
          <label for="regName">Full Name <span style="color:#f87171;">*</span></label>
          <input type="text" id="regName" name="fullName" placeholder="Enter your full name" required data-required="true" autocomplete="name">
        </div>
        
        <div class="form-group" style="display: grid; grid-template-columns: 1fr 1fr; gap: 14px;">
          <div>
            <label for="regPhone">Contact Number (WhatsApp) <span style="color:#f87171;">*</span></label>
            <input type="tel" id="regPhone" name="phone" placeholder="10-digit mobile number" required data-required="true" minlength="10" maxlength="10" pattern="[0-9]{10}" title="Please enter a valid 10-digit phone number">
          </div>
          <div>
            <label for="regEmail">Email ID <span style="color:#f87171;">*</span></label>
            <input type="email" id="regEmail" name="email" placeholder="you@example.com" required data-required="true" autocomplete="email">
          </div>
        </div>

        <div class="form-group">
          <label for="regInstitute">School / College / Institution <span style="color:#f87171;">*</span></label>
          <input type="text" id="regInstitute" name="institution" placeholder="Enter your school or college name" required data-required="true">
        </div>

        <div class="form-group" style="display: grid; grid-template-columns: 1fr 1fr; gap: 14px;">
          <div>
            <label for="regDob">Date of Birth <span style="color:#f87171;">*</span></label>
            <input type="date" id="regDob" name="dob" required data-required="true" autocomplete="bday" style="color-scheme: dark;">
          </div>
          <div>
            <label for="regGrade">Grade / Class / Year <span style="color:#f87171;">*</span></label>
            <select id="regGrade" name="grade" required data-required="true">
              <option value="" disabled selected>Select Grade</option>
              <option value="8th">8th</option>
              <option value="9th">9th</option>
              <option value="10th">10th</option>
              <option value="11th">11th</option>
              <option value="12th">12th</option>
              <option value="Undergraduate / College">Undergraduate / College</option>
              <option value="Other">Other</option>
            </select>
          </div>
        </div>

        <div class="form-group">
          <label for="regAddress">Full Residential Address <span style="color:#f87171;">*</span></label>
          <textarea id="regAddress" name="address" placeholder="Enter your full residential address (used for transport route mapping if opted)" required data-required="true" style="resize: vertical; min-height: 60px;"></textarea>
        </div>

        <div class="form-group" style="display: grid; grid-template-columns: 1fr 1fr; gap: 14px;">
          <div>
            <label for="regTransport">Do you require transportation? <span style="color:#f87171;">*</span></label>
            <select id="regTransport" name="transport" required data-required="true">
              <option value="" disabled selected>Select an option</option>
              <option value="Yes">Yes</option>
              <option value="No">No</option>
            </select>
          </div>
          <div>
            <label for="regReferral">Referral Code (If applicable)</label>
            <input type="text" id="regReferral" name="referralCode" placeholder="e.g. RES-123" autocomplete="off">
            <div id="referralFeedback" class="referral-feedback" style="font-size:0.75rem; margin-top:4px; color:var(--muted);"></div>
          </div>
        </div>

        <div class="form-group">
          <label for="regExp">MUN Experience (Conference - Committee - Portfolio - Award/NA) <span style="color:#f87171;">*</span></label>
          <textarea id="regExp" name="munExperience" placeholder="List your past MUN experiences or write 'First Timer / N/A'" required data-required="true" style="resize: vertical; min-height: 68px;"></textarea>
        </div>

        <button type="button" class="btn-next btn-full-width" onclick="nextStep(2)">
          Next: Committee Preferences
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
          <label for="pref1_committee">Committee Preference 1 <span style="color:#f87171;">*</span></label>
          <select id="pref1_committee" required data-required="true" onchange="updatePortfolioOptions(1)">
            <option value="" disabled selected>Select Committee Preference 1</option>
            <option value="DISEC">DISEC</option>
            <option value="UNHRC">UNHRC</option>
            <option value="UNSC">UNSC</option>
            <option value="LOK SABHA">Lok Sabha</option>
            <option value="IP">International Press (IP)</option>
            <option value="COMMITTEE X">Committee X</option>
            <option value="CCC">CCC</option>
            <option value="UNCSW">UNCSW</option>
          </select>
          <div id="pref1_container" style="display: none; margin-top: 10px;">
            <div id="pref1_portfolios" style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px;">
              <input type="text" id="pref1_port1" placeholder="Portfolio / Country Preference 1" required data-required="true">
              <input type="text" id="pref1_port2" placeholder="Portfolio / Country Preference 2" required data-required="true">
            </div>
            <select id="pref1_role" style="display: none;">
              <option value="" disabled selected>Select IP Role</option>
              <option value="Reporter">Reporter (Journalist)</option>
              <option value="Photographer">Photographer</option>
            </select>
          </div>
        </div>

        <!-- Preference 2 -->
        <div class="form-group">
          <label for="pref2_committee">Committee Preference 2 <span style="color:#f87171;">*</span></label>
          <select id="pref2_committee" required data-required="true" onchange="updatePortfolioOptions(2)">
            <option value="" disabled selected>Select Committee Preference 2</option>
            <option value="DISEC">DISEC</option>
            <option value="UNHRC">UNHRC</option>
            <option value="UNSC">UNSC</option>
            <option value="LOK SABHA">Lok Sabha</option>
            <option value="IP">International Press (IP)</option>
            <option value="COMMITTEE X">Committee X</option>
            <option value="CCC">CCC</option>
            <option value="UNCSW">UNCSW</option>
          </select>
          <div id="pref2_container" style="display: none; margin-top: 10px;">
            <div id="pref2_portfolios" style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px;">
              <input type="text" id="pref2_port1" placeholder="Portfolio / Country Preference 1" required data-required="true">
              <input type="text" id="pref2_port2" placeholder="Portfolio / Country Preference 2" required data-required="true">
            </div>
            <select id="pref2_role" style="display: none;">
              <option value="" disabled selected>Select IP Role</option>
              <option value="Reporter">Reporter (Journalist)</option>
              <option value="Photographer">Photographer</option>
            </select>
          </div>
        </div>

        <!-- Preference 3 -->
        <div class="form-group">
          <label for="pref3_committee">Committee Preference 3 <span style="color:#f87171;">*</span></label>
          <select id="pref3_committee" required data-required="true" onchange="updatePortfolioOptions(3)">
            <option value="" disabled selected>Select Committee Preference 3</option>
            <option value="DISEC">DISEC</option>
            <option value="UNHRC">UNHRC</option>
            <option value="UNSC">UNSC</option>
            <option value="LOK SABHA">Lok Sabha</option>
            <option value="IP">International Press (IP)</option>
            <option value="COMMITTEE X">Committee X</option>
            <option value="CCC">CCC</option>
            <option value="UNCSW">UNCSW</option>
          </select>
          <div id="pref3_container" style="display: none; margin-top: 10px;">
            <div id="pref3_portfolios" style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px;">
              <input type="text" id="pref3_port1" placeholder="Portfolio / Country Preference 1" required data-required="true">
              <input type="text" id="pref3_port2" placeholder="Portfolio / Country Preference 2" required data-required="true">
            </div>
            <select id="pref3_role" style="display: none;">
              <option value="" disabled selected>Select IP Role</option>
              <option value="Reporter">Reporter (Journalist)</option>
              <option value="Photographer">Photographer</option>
            </select>
          </div>
        </div>

        <div class="form-actions">
          <button type="button" class="btn-back" onclick="nextStep(1)">Back</button>
          <button type="button" class="btn-next" onclick="nextStep(3)">Proceed to Payment</button>
        </div>
      </div>

      <!-- STEP 3: PAYMENT & SUBMISSION -->
      <div class="form-step" id="step3">
        <div class="payment-banner" style="text-align: center; margin-bottom: 16px; padding: 14px 16px; border-radius: 14px; background: radial-gradient(circle at top, rgba(99,102,241,0.12) 0%, rgba(168,85,247,0.06) 100%); border: 1px solid rgba(168,85,247,0.22);">
          <span style="display: inline-flex; align-items: center; gap: 6px; font-size: 0.68rem; font-weight: 700; font-family: ui-monospace, monospace; text-transform: uppercase; letter-spacing: 0.14em; color: #c084fc; background: rgba(168,85,247,0.14); border: 1px solid rgba(168,85,247,0.3); padding: 4px 12px; border-radius: 9999px; margin-bottom: 8px;">
            <span style="width: 6px; height: 6px; border-radius: 50%; background: #a855f7; display: inline-block; box-shadow: 0 0 8px #a855f7;"></span>
            Priority Round · Delegate Registration
          </span>
          <h3 id="regFeeDisplay" style="font-size: 1.6rem; font-weight: 800; color: #ffffff; letter-spacing: -0.02em; margin: 0; font-family: 'Oswald', sans-serif;">Registration Fee: ₹2,500</h3>
          <p class="non-refundable-notice" style="font-size: 0.68rem; color: #60a5fa; margin-top: 5px; letter-spacing: 0.08em; text-transform: uppercase; font-weight: 600;">Payment is non-refundable once submitted</p>
        </div>

        <div class="payment-card" style="background: #07080e; border: 1px solid rgba(255,255,255,0.12); border-radius: 16px; padding: 18px 16px; box-shadow: 0 12px 40px rgba(0,0,0,0.5);">
          <div class="form-group" style="margin-bottom: 0;">
            <label style="text-align: center; margin-bottom: 10px; font-size: 0.7rem; letter-spacing: 0.16em; opacity: 0.85; font-weight: 700; color: #e2e8f0; display: block;">1. SCAN NAVI / UPI QR CODE VIA ANY UPI APP</label>
            <div style="text-align: center;">
              
              <!-- DYNAMIC AUTOGENERATED QR CONTAINER WITH VIEWING BRACKETS -->
              <div class="qr-container" style="position: relative; display: inline-block; padding: 12px; border-radius: 16px; background: #ffffff; box-shadow: 0 0 30px rgba(99,102,241,0.25); border: 2px solid rgba(255,255,255,0.2);">
                <img id="paymentQRImage" src="https://api.qrserver.com/v1/create-qr-code/?size=320x320&data=upi%3A%2F%2Fpay%3Fpa%3D6301550628%40nyes%26pn%3DBejugam%2520Aditya%26am%3D2500%26cu%3DINR%26tn%3DResolve%2520MUN%25202026%2520Delegate%2520Fee&bgcolor=ffffff&color=05060c&margin=1" alt="Payment QR Code" style="width: 170px; height: 170px; display: block; border-radius: 8px;">
                <div id="paymentQRScanLabel" style="margin-top: 6px; font-size: 0.65rem; font-weight: 800; color: #0f172a; font-family: ui-monospace, monospace; letter-spacing: 0.06em;">SCAN & PAY ₹2,500</div>
              </div>

              <!-- DIRECT MOBILE UPI DEEP LINK BUTTON -->
              <div style="margin-top: 12px;">
                <a id="payUpiMobileLink" href="upi://pay?pa=6301550628@nyes&pn=Bejugam%20Aditya&am=2500&cu=INR&tn=Resolve%20MUN%202026%20Delegate%20Fee" style="display: inline-flex; align-items: center; justify-content: center; gap: 8px; width: 100%; max-width: 280px; height: 38px; border-radius: 10px; background: linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%); color: #ffffff; font-size: 0.76rem; font-weight: 700; text-transform: uppercase; letter-spacing: 0.08em; text-decoration: none; box-shadow: 0 4px 15px rgba(79,70,229,0.35); transition: all 0.2s;">
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>
                  Pay via UPI App (Mobile)
                </a>
              </div>

              <div class="upi-supported-apps" style="display: flex; flex-wrap: wrap; justify-content: center; gap: 6px; margin: 12px 0;">
                <span class="upi-app-pill" style="font-size: 0.62rem; padding: 2px 8px; border-radius: 6px; background: rgba(255,255,255,0.06); border: 1px solid rgba(255,255,255,0.1); color: #cbd5e1; font-weight: 600;">Navi</span>
                <span class="upi-app-pill" style="font-size: 0.62rem; padding: 2px 8px; border-radius: 6px; background: rgba(255,255,255,0.06); border: 1px solid rgba(255,255,255,0.1); color: #cbd5e1; font-weight: 600;">GPay</span>
                <span class="upi-app-pill" style="font-size: 0.62rem; padding: 2px 8px; border-radius: 6px; background: rgba(255,255,255,0.06); border: 1px solid rgba(255,255,255,0.1); color: #cbd5e1; font-weight: 600;">PhonePe</span>
                <span class="upi-app-pill" style="font-size: 0.62rem; padding: 2px 8px; border-radius: 6px; background: rgba(255,255,255,0.06); border: 1px solid rgba(255,255,255,0.1); color: #cbd5e1; font-weight: 600;">Paytm</span>
                <span class="upi-app-pill" style="font-size: 0.62rem; padding: 2px 8px; border-radius: 6px; background: rgba(255,255,255,0.06); border: 1px solid rgba(255,255,255,0.1); color: #cbd5e1; font-weight: 600;">BHIM</span>
              </div>

              <!-- UPI ID BOX WITH COPY & REFRESH -->
              <div class="upi-box" style="display: flex; align-items: center; justify-content: space-between; gap: 8px; max-width: 320px; margin: 0 auto; background: rgba(255,255,255,0.04); border: 1px solid rgba(255,255,255,0.15); border-radius: 10px; padding: 6px 10px;">
                <span id="upiID" style="font-family: ui-monospace, monospace; font-size: 0.74rem; color: #e2e8f0; font-weight: 600; overflow: hidden; text-overflow: ellipsis;">6301550628@nyes</span>
                <div style="display: flex; gap: 5px; shrink: 0;">
                  <button type="button" class="refresh-qr-btn" onclick="refreshDelegatePaymentQR()" title="Regenerate QR" style="width: 28px; height: 28px; border-radius: 6px; background: rgba(255,255,255,0.08); border: 1px solid rgba(255,255,255,0.15); color: #cbd5e1; display: flex; align-items: center; justify-content: center; cursor: pointer;">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="23 4 23 10 17 10"></polyline><polyline points="1 20 1 14 7 14"></polyline><path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"></path></svg>
                  </button>
                  <button type="button" class="copy-btn" id="copyUpiBtn" onclick="copyUPI()" title="Copy UPI ID" style="display: flex; align-items: center; gap: 4px; padding: 4px 8px; border-radius: 6px; background: rgba(99,102,241,0.2); border: 1px solid rgba(99,102,241,0.4); color: #a5b4fc; font-size: 0.68rem; font-weight: 700; cursor: pointer;">
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path></svg>
                    <span>COPY</span>
                  </button>
                </div>
              </div>
              <span style="display: inline-flex; align-items: center; gap: 4px; font-size: 0.68rem; color: #94a3b8; margin-top: 6px;">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#22c55e" stroke-width="2.5"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>
                Verified Payee: <strong style="color: #ffffff;">Bejugam Aditya</strong>
              </span>
            </div>
          </div>

          <div class="form-group" style="margin-top: 18px;">
            <label for="regTxnID" style="font-size: 0.72rem; font-weight: 700; color: #e2e8f0; letter-spacing: 0.08em;">2. TRANSACTION / UTR / REFERENCE ID <span style="color:#f87171;">*</span></label>
            <input type="text" id="regTxnID" placeholder="Enter UPI Transaction ID / 12-digit UTR" required data-required="true" style="background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.15); color: #fff; border-radius: 8px; padding: 10px 12px; width: 100%; font-size: 0.82rem; font-family: ui-monospace, monospace;">
          </div>

          <div class="form-group" style="margin-top: 14px;">
            <label style="font-size: 0.72rem; font-weight: 700; color: #e2e8f0; letter-spacing: 0.08em;">3. UPLOAD PAYMENT SCREENSHOT <span style="color:#f87171;">*</span></label>
            <label class="file-upload-wrapper" for="regDriveLink" style="cursor: pointer; display: flex; align-items: center; gap: 10px; padding: 10px 14px; background: rgba(255,255,255,0.04); border: 1px dashed rgba(255,255,255,0.25); border-radius: 10px;">
              <span class="file-upload-btn" style="padding: 4px 10px; background: rgba(255,255,255,0.1); border-radius: 6px; font-size: 0.72rem; font-weight: 700; color: #ffffff;">Choose File</span>
              <span class="file-name" id="regDriveFileName" style="font-size: 0.72rem; color: #94a3b8; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">No file chosen</span>
              <input type="file" id="regDriveLink" class="file-upload-input" accept="image/*,.pdf" required data-required="true" style="display: none;">
            </label>
            <div id="regScreenshotPreview" style="display: none; margin-top: 8px; padding: 8px; border-radius: 8px; background: rgba(34,197,94,0.08); border: 1px solid rgba(34,197,94,0.25);" class="payment-screenshot-preview"></div>
          </div>

          <div class="form-group" style="margin-top: 14px;">
            <label for="regAdditionalInfo" style="font-size: 0.72rem; font-weight: 700; color: #e2e8f0; letter-spacing: 0.08em;">4. ADDITIONAL INFORMATION / QUERIES (OPTIONAL)</label>
            <input type="text" id="regAdditionalInfo" placeholder="Any specific notes or questions for the Secretariat" style="background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.15); color: #fff; border-radius: 8px; padding: 10px 12px; width: 100%; font-size: 0.82rem;">
          </div>

          <div style="margin-top: 16px; padding: 10px 14px; border-radius: 10px; background: rgba(255,255,255,0.025); border: 1px solid rgba(255,255,255,0.08); text-align: center;">
            <p style="font-size: 0.68rem; color: #cbd5e1; font-family: ui-monospace, monospace; margin: 0; text-transform: uppercase; letter-spacing: 0.06em; font-weight: 600;">Meridian School, Kompally, Hyderabad</p>
            <p style="font-size: 0.64rem; color: #94a3b8; margin: 4px 0 0 0;">Conference Dates: 27th – 29th November 2026</p>
          </div>
        </div>

        <div class="form-actions" style="display: flex; gap: 10px; margin-top: 16px;">
          <button type="button" class="btn-back" onclick="nextStep(2)" style="flex: 1; height: 42px; border-radius: 10px; background: rgba(255,255,255,0.06); border: 1px solid rgba(255,255,255,0.15); color: #fff; font-size: 0.76rem; font-weight: 700; text-transform: uppercase; cursor: pointer;">Back</button>
          <button type="submit" class="btn-next" style="flex: 2; height: 42px; border-radius: 10px; background: linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%); border: none; color: #fff; font-size: 0.8rem; font-weight: 800; text-transform: uppercase; letter-spacing: 0.06em; cursor: pointer; box-shadow: 0 4px 20px rgba(99,102,241,0.35);">Submit Registration</button>
        </div>
        <p class="terms-confirmation" style="font-size: 0.64rem; color: #64748b; text-align: center; margin-top: 12px; line-height: 1.4;">
          By clicking Submit Registration, you agree to the
          <a href="#" onclick="openTermsModal('delegate'); return false;" style="color: #818cf8; text-decoration: underline;">Delegate Terms &amp; Conditions</a>
          of Resolve MUN 2.0.
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
        We're getting things ready. Join the waitlist to be the first to know when registrations open.
      </p>

      <div style="margin-top:12px;">
        <button id="commModalBgBtn" class="btn-secondary" style="display:none; margin-right:10px;" onclick="(function(){ if(window.currentCommBg) window.open(window.currentCommBg, '_blank'); })()">Background Guide</button>
      </div>

      <div id="waitlistContainer">
        <form id="waitlistForm">
          <div class="waitlist-form">
            <input data-required="true">
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

<!-- TERMS & CONDITIONS & PRIVACY MODAL -->
<div class="modal-overlay" id="termsModal">
  <div class="modal-content terms-modal-content">
    <div class="terms-modal-header">
      <div class="terms-modal-topline">
        <div class="terms-modal-title-group">
          <h2 class="terms-modal-title">LEGAL POLICIES &amp; TERMS</h2>
          <span class="terms-modal-subtitle">Resolve Model United Nations 2.0 · 27–29 November 2026 · Meridian School, Kompally</span>
        </div>
        <button class="terms-close-btn" onclick="closeTermsModal()" aria-label="Close modal">
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
            <line x1="18" y1="6" x2="6" y2="18"></line>
            <line x1="6" y1="6" x2="18" y2="18"></line>
          </svg>
        </button>
      </div>

      <!-- Segmented Pill Control -->
      <div class="terms-segmented-nav">
        <button type="button" class="terms-tab-pill active" data-tab="delegate" onclick="switchTermsTab('delegate', this)">Delegate Terms &amp; Conditions</button>
        <button type="button" class="terms-tab-pill" data-tab="oc" onclick="switchTermsTab('oc', this)">OC Terms &amp; Conditions</button>
        <button type="button" class="terms-tab-pill" data-tab="privacy" onclick="switchTermsTab('privacy', this)">Privacy Policy</button>
      </div>
    </div>

    <div class="terms-scroll-body">
      <!-- 1. DELEGATE TERMS & CONDITIONS -->
      <div id="termsDelegateContent" style="display: block;">
        <div class="legal-preamble-card">
          <strong style="color: #ffffff; display: block; margin-bottom: 4px; font-size: 13px;">Delegate Terms &amp; Conditions · Resolve MUN 2.0</strong>
          These Terms &amp; Conditions govern the participation of every delegate in Resolve MUN 2.0 (the “Conference”), to be held on 27, 28 and 29 November 2026 at Meridian School, Kompally. In these Terms &amp; Conditions, “Secretariat” means the Secretariat of Resolve MUN, and “Founders” means Abhilash Vijayakumar, Niveditt Basrani and Poorvika Setti (Co-Founder).
        </div>

        <!-- Section 1 -->
        <div class="legal-card">
          <div class="legal-card-header">
            <span class="legal-badge">01</span>
            <h4 class="legal-card-title">Registration &amp; Eligibility</h4>
          </div>
          <ul class="legal-clause-list">
            <li class="legal-clause-item">
              <span class="legal-num">1.</span>
              <p class="legal-text">By registering for the conference, the delegate agrees to abide by all rules, regulations, and decisions of the Secretariat.</p>
            </li>
            <li class="legal-clause-item">
              <span class="legal-num">2.</span>
              <p class="legal-text">Registration details provided by the delegate must be accurate and complete.</p>
            </li>
            <li class="legal-clause-item">
              <span class="legal-num">3.</span>
              <p class="legal-text">Registration is considered confirmed only after completion of the required registration process and payment, where applicable.</p>
            </li>
            <li class="legal-clause-item">
              <span class="legal-num">4.</span>
              <p class="legal-text">Delegates must carry valid identification and any documents required for verification.</p>
            </li>
            <li class="legal-clause-item">
              <span class="legal-num">5.</span>
              <p class="legal-text">A delegate who is under 18 years of age confirms that they have the consent of their parent or guardian to participate in the conference.</p>
            </li>
          </ul>
        </div>

        <!-- Section 2 -->
        <div class="legal-card">
          <div class="legal-card-header">
            <span class="legal-badge">02</span>
            <h4 class="legal-card-title">Fees &amp; Refunds</h4>
          </div>
          <ul class="legal-clause-list">
            <li class="legal-clause-item">
              <span class="legal-num">6.</span>
              <p class="legal-text">Registration fees, once paid, are non-refundable and non-transferable unless explicitly stated otherwise by the Secretariat.</p>
            </li>
            <li class="legal-clause-item">
              <span class="legal-num">7.</span>
              <p class="legal-text">Even if the dates of the conference are postponed or rescheduled, any refund, credit or adjustment of fees shall be at the sole discretion of the Secretariat.</p>
            </li>
            <li class="legal-clause-item">
              <span class="legal-num">8.</span>
              <p class="legal-text">Fees paid are for participation in the conference only and do not cover any damage costs, fines or other amounts payable under these Terms &amp; Conditions.</p>
            </li>
          </ul>
        </div>

        <!-- Section 3 -->
        <div class="legal-card">
          <div class="legal-card-header">
            <span class="legal-badge">03</span>
            <h4 class="legal-card-title">Attendance</h4>
          </div>
          <ul class="legal-clause-list">
            <li class="legal-clause-item">
              <span class="legal-num">9.</span>
              <p class="legal-text">Delegates are expected to attend all sessions, committee proceedings, and mandatory conference activities assigned to them.</p>
            </li>
            <li class="legal-clause-item">
              <span class="legal-num">10.</span>
              <p class="legal-text">Repeated or unexplained absence may result in disciplinary action and may affect eligibility for awards.</p>
            </li>
            <li class="legal-clause-item">
              <span class="legal-num">11.</span>
              <p class="legal-text">Delegates must arrive at the venue and committee rooms on time.</p>
            </li>
          </ul>
        </div>

        <!-- Section 4 -->
        <div class="legal-card">
          <div class="legal-card-header">
            <span class="legal-badge">04</span>
            <h4 class="legal-card-title">Committee Allocation &amp; Conduct</h4>
          </div>
          <ul class="legal-clause-list">
            <li class="legal-clause-item">
              <span class="legal-num">12.</span>
              <p class="legal-text">Delegates must participate in, and stay with, the committee and portfolio allocated to them by the Secretariat for the duration of the conference. Requests for a change of committee or portfolio are not guaranteed, and the allocation decisions of the Secretariat are final.</p>
            </li>
            <li class="legal-clause-item">
              <span class="legal-num">13.</span>
              <p class="legal-text">Delegates must follow the Rules of Procedure and all instructions issued by the Executive Board and Secretariat.</p>
            </li>
            <li class="legal-clause-item">
              <span class="legal-num">14.</span>
              <p class="legal-text">Delegates must maintain proper decorum and professionalism throughout the conference.</p>
            </li>
            <li class="legal-clause-item">
              <span class="legal-num">15.</span>
              <p class="legal-text">Disrespectful, abusive, threatening, discriminatory, or disruptive behaviour towards delegates, Executive Board members, Secretariat members, volunteers, or venue staff will not be tolerated.</p>
            </li>
            <li class="legal-clause-item">
              <span class="legal-num">16.</span>
              <p class="legal-text">Delegates must respect the authority of the Executive Board during committee proceedings.</p>
            </li>
            <li class="legal-clause-item">
              <span class="legal-num">17.</span>
              <p class="legal-text">Attempts to disrupt committee proceedings, manipulate voting, or deliberately violate parliamentary procedure may result in disciplinary action.</p>
            </li>
          </ul>
        </div>

        <!-- Section 5 -->
        <div class="legal-card">
          <div class="legal-card-header">
            <span class="legal-badge">05</span>
            <h4 class="legal-card-title">Academic &amp; Conference Integrity</h4>
          </div>
          <ul class="legal-clause-list">
            <li class="legal-clause-item">
              <span class="legal-num">18.</span>
              <p class="legal-text">Delegates are expected to conduct research independently and represent their assigned country/portfolio responsibly.</p>
            </li>
            <li class="legal-clause-item">
              <span class="legal-num">19.</span>
              <p class="legal-text">Plagiarism, fabrication of information, impersonation, or deliberate misrepresentation of sources may result in disqualification.</p>
            </li>
            <li class="legal-clause-item">
              <span class="legal-num">20.</span>
              <p class="legal-text">The use of AI or other tools must comply with the specific rules communicated by the Secretariat or respective committee.</p>
            </li>
          </ul>
        </div>

        <!-- Section 6 -->
        <div class="legal-card">
          <div class="legal-card-header">
            <span class="legal-badge">06</span>
            <h4 class="legal-card-title">Prohibited Items &amp; Substances</h4>
          </div>
          <ul class="legal-clause-list">
            <li class="legal-clause-item">
              <span class="legal-num">21.</span>
              <div class="legal-text">
                Possession, use, consumption, sale or distribution of any of the following at the conference venue is strictly forbidden:
                <ul class="legal-sublist">
                  <li class="legal-sublist-item"><span class="legal-sub-tag">(a)</span><span>illegal substances, narcotics and drugs;</span></li>
                  <li class="legal-sublist-item"><span class="legal-sub-tag">(b)</span><span>alcohol, tobacco products, e-cigarettes and vapes;</span></li>
                  <li class="legal-sublist-item"><span class="legal-sub-tag">(c)</span><span>weapons and any other items capable of causing harm;</span></li>
                  <li class="legal-sublist-item"><span class="legal-sub-tag">(d)</span><span>any inflammable or flammable item, including lighters, matchboxes, fireworks, firecrackers, and flammable liquids, gases or sprays; and</span></li>
                  <li class="legal-sublist-item"><span class="legal-sub-tag">(e)</span><span>any other item prohibited by the Secretariat or the venue.</span></li>
                </ul>
              </div>
            </li>
            <li class="legal-clause-item">
              <span class="legal-num">22.</span>
              <p class="legal-text">Any delegate found in possession of, or using, any prohibited item or substance shall be fined, in addition to confiscation of the item and any other disciplinary action. The amount of the fine shall be determined by the Secretariat and shall be payable on demand.</p>
            </li>
            <li class="legal-clause-item">
              <span class="legal-num">23.</span>
              <p class="legal-text">Such conduct may also result in immediate removal from the conference, disqualification from awards, and the matter being reported to the delegate’s institution, parent or guardian, the venue authorities and, where required, the appropriate authorities.</p>
            </li>
            <li class="legal-clause-item">
              <span class="legal-num">24.</span>
              <p class="legal-text">The Secretariat and venue may carry out reasonable checks to enforce this section, and delegates must cooperate with them.</p>
            </li>
          </ul>
        </div>

        <!-- Section 7 -->
        <div class="legal-card">
          <div class="legal-card-header">
            <span class="legal-badge">07</span>
            <h4 class="legal-card-title">Safety &amp; Prohibited Conduct</h4>
          </div>
          <ul class="legal-clause-list">
            <li class="legal-clause-item">
              <span class="legal-num">25.</span>
              <p class="legal-text">Harassment, bullying, intimidation, stalking, or any form of inappropriate conduct will not be tolerated.</p>
            </li>
            <li class="legal-clause-item">
              <span class="legal-num">26.</span>
              <p class="legal-text">Delegates must comply with the safety, security, and venue regulations at all times.</p>
            </li>
            <li class="legal-clause-item">
              <span class="legal-num">27.</span>
              <p class="legal-text">Delegates are responsible for their personal belongings. The Secretariat will not be responsible for lost or damaged personal property.</p>
            </li>
          </ul>
        </div>

        <!-- Section 8 -->
        <div class="legal-card">
          <div class="legal-card-header">
            <span class="legal-badge">08</span>
            <h4 class="legal-card-title">Venue &amp; Property</h4>
          </div>
          <ul class="legal-clause-list">
            <li class="legal-clause-item">
              <span class="legal-num">28.</span>
              <p class="legal-text">Delegates must treat the venue, its classrooms, furniture, equipment and facilities with care, and must follow the instructions of the Secretariat and venue staff regarding the use of the premises.</p>
            </li>
            <li class="legal-clause-item">
              <span class="legal-num">29.</span>
              <p class="legal-text">Any delegate who causes damage to the venue, including its property, equipment or facilities, shall bear the full cost of repair or replacement. The cost shall be assessed by the Secretariat and the venue and shall be payable on demand.</p>
            </li>
            <li class="legal-clause-item">
              <span class="legal-num">30.</span>
              <p class="legal-text">Damage caused to the venue may also result in disciplinary action against the delegate.</p>
            </li>
          </ul>
        </div>

        <!-- Section 9 -->
        <div class="legal-card">
          <div class="legal-card-header">
            <span class="legal-badge">09</span>
            <h4 class="legal-card-title">Media &amp; Photography</h4>
          </div>
          <ul class="legal-clause-list">
            <li class="legal-clause-item">
              <span class="legal-num">31.</span>
              <p class="legal-text">Delegates acknowledge that photographs and videos may be taken during the conference for official documentation and promotional purposes.</p>
            </li>
            <li class="legal-clause-item">
              <span class="legal-num">32.</span>
              <p class="legal-text">Delegates must not record, photograph, or publish private conversations or confidential information involving other participants without appropriate permission.</p>
            </li>
          </ul>
        </div>

        <!-- Section 10 -->
        <div class="legal-card">
          <div class="legal-card-header">
            <span class="legal-badge">10</span>
            <h4 class="legal-card-title">Disciplinary Action</h4>
          </div>
          <ul class="legal-clause-list">
            <li class="legal-clause-item">
              <span class="legal-num">33.</span>
              <p class="legal-text">The Secretariat reserves the right to issue warnings, impose fines, remove a delegate from a committee, revoke participation, or take other appropriate disciplinary action in cases of serious misconduct.</p>
            </li>
            <li class="legal-clause-item">
              <span class="legal-num">34.</span>
              <p class="legal-text">Decisions of the Secretariat and Executive Board regarding disciplinary matters shall be considered final.</p>
            </li>
          </ul>
        </div>

        <!-- Section 11 -->
        <div class="legal-card">
          <div class="legal-card-header">
            <span class="legal-badge">11</span>
            <h4 class="legal-card-title">Referral Codes</h4>
          </div>
          <ul class="legal-clause-list">
            <li class="legal-clause-item">
              <span class="legal-num">35.</span>
              <p class="legal-text">A delegate may enter a valid Referral Code issued by Resolve at the time of registration. Only one Referral Code may be used for a registration, and once recorded it shall be treated as final except where the Founders correct a technical error or irregularity. A registration completed without a valid Referral Code shall remain unattributed.</p>
            </li>
          </ul>
        </div>

        <!-- Section 12 -->
        <div class="legal-card">
          <div class="legal-card-header">
            <span class="legal-badge">12</span>
            <h4 class="legal-card-title">Applicability, Changes &amp; Force Majeure</h4>
          </div>
          <ul class="legal-clause-list">
            <li class="legal-clause-item">
              <span class="legal-num">36.</span>
              <p class="legal-text">These Terms &amp; Conditions apply only to Resolve 2.0 and do not extend to any previous or future edition of Resolve MUN.</p>
            </li>
            <li class="legal-clause-item">
              <span class="legal-num">37.</span>
              <p class="legal-text">The Founders and Secretariat may make reasonable changes to the schedule, committees, agendas, venue arrangements or other conference details where necessary, and will communicate such changes through official channels.</p>
            </li>
            <li class="legal-clause-item">
              <span class="legal-num">38.</span>
              <p class="legal-text">Neither Resolve, the Founders nor the Secretariat shall be liable for any failure, delay, postponement, curtailment or cancellation of the Conference caused by events beyond their reasonable control, including rain or adverse weather, natural disasters, fire, flood, epidemic or pandemic, war, riots, civil unrest, government orders or restrictions, venue unavailability, strikes, or failure of utilities or communication networks. Any refund, credit or adjustment in such a case, including where the dates of the Conference are merely postponed, shall be at the sole discretion of the Secretariat.</p>
            </li>
          </ul>
        </div>

        <!-- Section 13 -->
        <div class="legal-card">
          <div class="legal-card-header">
            <span class="legal-badge">13</span>
            <h4 class="legal-card-title">Governing Law &amp; Acceptance</h4>
          </div>
          <ul class="legal-clause-list">
            <li class="legal-clause-item">
              <span class="legal-num">39.</span>
              <p class="legal-text">These Terms &amp; Conditions are governed by the laws of India, and the courts at Hyderabad shall have jurisdiction.</p>
            </li>
            <li class="legal-clause-item">
              <span class="legal-num">40.</span>
              <p class="legal-text">By registering for the conference, the delegate confirms that they have read, understood, and agreed to these Terms &amp; Conditions.</p>
            </li>
          </ul>
        </div>
      </div>

      <!-- 2. ORGANIZING COMMITTEE (OC) TERMS & CONDITIONS -->
      <div id="termsOcContent" style="display: none;">
        <div class="legal-preamble-card">
          <strong style="color: #ffffff; display: block; margin-bottom: 4px; font-size: 13px;">Organizing Committee (OC) Terms &amp; Conditions · Resolve MUN 2.0</strong>
          These Terms &amp; Conditions govern the engagement of every member of the Organizing Committee (“OC”) of Resolve MUN 2.0 (the “Conference”), to be held on 27, 28 and 29 November 2026 at Meridian School, Kompally. In these Terms &amp; Conditions, “Founders” means Abhilash Vijayakumar, Niveditt Basrani and Poorvika Setti (Co-Founder), and “OC Head” means the head of the Organizing Committee, to whom all OC members report.
        </div>

        <!-- Section 1 -->
        <div class="legal-card">
          <div class="legal-card-header">
            <span class="legal-badge">01</span>
            <h4 class="legal-card-title">Appointment &amp; Role</h4>
          </div>
          <ul class="legal-clause-list">
            <li class="legal-clause-item"><span class="legal-num">1.</span><p class="legal-text">By accepting an OC position, the member agrees to fulfil the responsibilities assigned to them by the Secretariat and the OC Head.</p></li>
            <li class="legal-clause-item"><span class="legal-num">2.</span><p class="legal-text">OC members are representatives of the conference and are expected to maintain professionalism both within and outside the venue.</p></li>
            <li class="legal-clause-item"><span class="legal-num">3.</span><p class="legal-text">An OC member’s position does not grant them authority beyond the responsibilities assigned to them.</p></li>
            <li class="legal-clause-item"><span class="legal-num">4.</span><p class="legal-text">OC members must follow the established hierarchy of the Secretariat and shall report only to the OC Head. OC members do not report to any USG.</p></li>
          </ul>
        </div>

        <!-- Section 2 -->
        <div class="legal-card">
          <div class="legal-card-header">
            <span class="legal-badge">02</span>
            <h4 class="legal-card-title">Attendance &amp; Availability</h4>
          </div>
          <ul class="legal-clause-list">
            <li class="legal-clause-item"><span class="legal-num">5.</span><p class="legal-text">Physical presence and appearance at meetings, training sessions, briefings, rehearsals, and on conference days is optional but expected. OC members are expected to make every reasonable effort to attend all of them in person.</p></li>
            <li class="legal-clause-item"><span class="legal-num">6.</span><p class="legal-text">Members who are unable to attend or will be delayed should inform the OC Head in advance.</p></li>
            <li class="legal-clause-item"><span class="legal-num">7.</span><p class="legal-text">As attendance is optional but expected, absence will not by itself be treated as a breach; however, repeated absence, lateness, or failure to complete assigned responsibilities may be taken into account in assessing the member’s contribution, remuneration and position, and may result in removal from the OC.</p></li>
          </ul>
        </div>

        <!-- Section 3 -->
        <div class="legal-card">
          <div class="legal-card-header">
            <span class="legal-badge">03</span>
            <h4 class="legal-card-title">Responsibilities</h4>
          </div>
          <ul class="legal-clause-list">
            <li class="legal-clause-item"><span class="legal-num">8.</span><p class="legal-text">OC members are expected to complete tasks assigned by the OC Head within the specified deadlines.</p></li>
            <li class="legal-clause-item"><span class="legal-num">9.</span><p class="legal-text">Members must actively contribute to the functioning of their respective department rather than merely holding the position.</p></li>
            <li class="legal-clause-item"><span class="legal-num">10.</span><p class="legal-text">Tasks may be reassigned by the OC Head or Secretariat according to operational requirements.</p></li>
            <li class="legal-clause-item"><span class="legal-num">11.</span><p class="legal-text">Members must cooperate with other departments whenever their responsibilities overlap.</p></li>
            <li class="legal-clause-item"><span class="legal-num">12.</span><p class="legal-text">No OC member may deliberately obstruct, delay, or neglect conference operations.</p></li>
          </ul>
        </div>

        <!-- Section 4 -->
        <div class="legal-card">
          <div class="legal-card-header">
            <span class="legal-badge">04</span>
            <h4 class="legal-card-title">Chain of Command</h4>
          </div>
          <ul class="legal-clause-list">
            <li class="legal-clause-item"><span class="legal-num">13.</span><p class="legal-text">OC members must follow instructions issued by the OC Head and authorised Secretariat members.</p></li>
            <li class="legal-clause-item"><span class="legal-num">14.</span><p class="legal-text">OC members should raise departmental issues through the appropriate chain of command, by reporting to the OC Head, rather than bypassing the OC Head without valid reason.</p></li>
            <li class="legal-clause-item"><span class="legal-num">15.</span><p class="legal-text">OC members must not independently make decisions that could materially affect the conference without approval from the appropriate authority.</p></li>
            <li class="legal-clause-item"><span class="legal-num">16.</span><p class="legal-text">In urgent situations, OC members may take reasonable immediate action to protect participants or maintain operations, followed by prompt reporting to their superior.</p></li>
          </ul>
        </div>

        <!-- Section 5 -->
        <div class="legal-card">
          <div class="legal-card-header">
            <span class="legal-badge">05</span>
            <h4 class="legal-card-title">Confidentiality</h4>
          </div>
          <ul class="legal-clause-list">
            <li class="legal-clause-item"><span class="legal-num">17.</span><p class="legal-text">All internal information relating to delegates, applications, phone numbers, email addresses, allocations, finances, sponsorships, partnerships, internal discussions, and Secretariat decisions must be treated as confidential.</p></li>
            <li class="legal-clause-item"><span class="legal-num">18.</span><p class="legal-text">OC members must not share internal documents, screenshots, databases, contact information, or conversations outside authorised channels.</p></li>
            <li class="legal-clause-item"><span class="legal-num">19.</span><p class="legal-text">Confidential information must not be used for personal benefit or to favour any individual or organisation.</p></li>
          </ul>
        </div>

        <!-- Section 6 -->
        <div class="legal-card">
          <div class="legal-card-header">
            <span class="legal-badge">06</span>
            <h4 class="legal-card-title">Professional Conduct</h4>
          </div>
          <ul class="legal-clause-list">
            <li class="legal-clause-item"><span class="legal-num">20.</span><p class="legal-text">OC members must treat delegates, Executive Board members, fellow OCs, Secretariat members, volunteers, sponsors, guests, and venue staff respectfully.</p></li>
            <li class="legal-clause-item"><span class="legal-num">21.</span><p class="legal-text">Bullying, harassment, discrimination, intimidation, inappropriate behaviour, or abuse of authority will not be tolerated.</p></li>
            <li class="legal-clause-item"><span class="legal-num">22.</span><p class="legal-text">OC members must not misuse their position to obtain personal advantages, preferential treatment, or access to restricted information.</p></li>
            <li class="legal-clause-item"><span class="legal-num">23.</span><p class="legal-text">Personal disagreements must not interfere with conference responsibilities.</p></li>
          </ul>
        </div>

        <!-- Section 7 -->
        <div class="legal-card">
          <div class="legal-card-header">
            <span class="legal-badge">07</span>
            <h4 class="legal-card-title">Social Media &amp; Public Representation</h4>
          </div>
          <ul class="legal-clause-list">
            <li class="legal-clause-item"><span class="legal-num">24.</span><p class="legal-text">OC members must not make official statements on behalf of the conference without authorisation.</p></li>
            <li class="legal-clause-item"><span class="legal-num">25.</span><p class="legal-text">Official announcements, posts, designs, photographs, or other conference-related content must follow the approval process established by the Secretariat.</p></li>
            <li class="legal-clause-item"><span class="legal-num">26.</span><p class="legal-text">Internal conflicts, confidential discussions, disciplinary matters, or internal documents must not be publicly disclosed.</p></li>
          </ul>
        </div>

        <!-- Section 8 -->
        <div class="legal-card">
          <div class="legal-card-header">
            <span class="legal-badge">08</span>
            <h4 class="legal-card-title">Conflict of Interest</h4>
          </div>
          <ul class="legal-clause-list">
            <li class="legal-clause-item"><span class="legal-num">27.</span><p class="legal-text">OC members must disclose any conflict of interest that could affect their responsibilities or impartiality.</p></li>
            <li class="legal-clause-item"><span class="legal-num">28.</span><p class="legal-text">OC members must not use their position to unfairly influence delegate allocations, awards, committee decisions, sponsorships, or other conference-related outcomes.</p></li>
          </ul>
        </div>

        <!-- Section 9 -->
        <div class="legal-card">
          <div class="legal-card-header">
            <span class="legal-badge">09</span>
            <h4 class="legal-card-title">Removal from the OC</h4>
          </div>
          <ul class="legal-clause-list">
            <li class="legal-clause-item"><span class="legal-num">29.</span><p class="legal-text">The Secretariat reserves the right to issue warnings, reassign responsibilities, suspend, or remove an OC member for misconduct, repeated negligence, breach of confidentiality, unauthorised disclosure of information, or failure to fulfil responsibilities.</p></li>
            <li class="legal-clause-item"><span class="legal-num">30.</span><p class="legal-text">Serious violations may result in immediate removal from the Organizing Committee.</p></li>
            <li class="legal-clause-item"><span class="legal-num">31.</span><p class="legal-text">The final decision regarding OC membership rests with the authorised Secretariat.</p></li>
            <li class="legal-clause-item"><span class="legal-num">32.</span><p class="legal-text">Notwithstanding the above, the Founders shall have the sole and absolute discretion to remove any OC member, with or without prior notice, if in the Founders’ opinion the member’s conduct is found to be detrimental to Resolve, its reputation, its partners, its delegates or its operations. The decision of the Founders shall be final and binding.</p></li>
            <li class="legal-clause-item"><span class="legal-num">33.</span><p class="legal-text">Upon removal, the OC member shall immediately cease representing Resolve. The Founders may withhold, reduce or forfeit any unpaid remuneration, including the variable component. Revenue already actually received by Resolve and directly attributable to the member may be considered for payment at the Founders’ discretion, having regard to the circumstances of the removal.</p></li>
          </ul>
        </div>

        <!-- Section 10 -->
        <div class="legal-card">
          <div class="legal-card-header">
            <span class="legal-badge">10</span>
            <h4 class="legal-card-title">Handover</h4>
          </div>
          <ul class="legal-clause-list">
            <li class="legal-clause-item"><span class="legal-num">34.</span><p class="legal-text">OC members must properly hand over documents, files, credentials, equipment, and pending responsibilities when requested or upon leaving their position.</p></li>
            <li class="legal-clause-item"><span class="legal-num">35.</span><p class="legal-text">No member may retain confidential conference information after their term without authorisation.</p></li>
          </ul>
        </div>

        <!-- Section 11 -->
        <div class="legal-card">
          <div class="legal-card-header">
            <span class="legal-badge">11</span>
            <h4 class="legal-card-title">Remuneration &amp; Revenue Share</h4>
          </div>
          <ul class="legal-clause-list">
            <li class="legal-clause-item"><span class="legal-num">36.</span><p class="legal-text">The remuneration of an OC member, where applicable, shall depend entirely on their contribution and conduct, assessed on the same two parameters as apply to the Secretariat: (i) contribution to revenue, and (ii) contribution to work and dedication to the conference.</p></li>
            <li class="legal-clause-item">
              <span class="legal-num">37.</span>
              <div class="legal-text">
                The following shall be classified as contributions to revenue, provided they are directly attributable to the OC member through their Referral Code and actually received by Resolve:
                <ul class="legal-sublist">
                  <li class="legal-sublist-item"><span class="legal-sub-tag">(a)</span><span>Delegate registration fees;</span></li>
                  <li class="legal-sublist-item"><span class="legal-sub-tag">(b)</span><span>OC registration fees;</span></li>
                  <li class="legal-sublist-item"><span class="legal-sub-tag">(c)</span><span>Stall rent;</span></li>
                  <li class="legal-sublist-item"><span class="legal-sub-tag">(d)</span><span>Sponsorships; and</span></li>
                  <li class="legal-sublist-item"><span class="legal-sub-tag">(e)</span><span>Social passes.</span></li>
                </ul>
              </div>
            </li>
            <li class="legal-clause-item"><span class="legal-num">38.</span><p class="legal-text">Eight percent (8%) of the OC member’s Contribution to Revenue shall be payable to them as revenue-linked remuneration.</p></li>
            <li class="legal-clause-item"><span class="legal-num">39.</span><p class="legal-text">Based on the OC member’s work, dedication and the profitability of the Conference, a variable additional remuneration may be paid at the sole discretion of the Founders.</p></li>
            <li class="legal-clause-item"><span class="legal-num">40.</span><p class="legal-text">Remuneration shall be paid only after the Conference has concluded and the relevant revenue has been realised, within fifteen (15) days of the conclusion of the Conference, via UPI, subject to verification and approval by the Founders.</p></li>
            <li class="legal-clause-item"><span class="legal-num">41.</span><p class="legal-text">The position held by an OC member shall depend on the same parameters, and the final decision on the position rests with the Founders.</p></li>
          </ul>
        </div>

        <!-- Section 12 -->
        <div class="legal-card">
          <div class="legal-card-header">
            <span class="legal-badge">12</span>
            <h4 class="legal-card-title">Referral, Attribution &amp; Revenue Tracking</h4>
          </div>
          <ul class="legal-clause-list">
            <li class="legal-clause-item"><span class="legal-num">42.</span><p class="legal-text">Resolve shall maintain an official referral and revenue attribution system for Resolve 2.0 (“Referral System”), which shall operate exclusively through unique referral codes issued by Resolve to authorised Secretariat Members and, where approved by the Founders, OC members.</p></li>
            <li class="legal-clause-item"><span class="legal-num">43.</span><p class="legal-text">Each Referral Code is exclusively assigned to one member for the duration of Resolve 2.0 and is the sole mechanism for attributing eligible revenue-generating transactions. No member may claim attribution on the basis of verbal communication, personal correspondence, screenshots, conversations, introductions or any other evidence where the transaction was not recorded against the member’s valid Referral Code, except where the Founders determine that an administrative or technical error occurred.</p></li>
            <li class="legal-clause-item"><span class="legal-num">44.</span><p class="legal-text">A delegate or OC registration made using a valid Referral Code shall be attributed exclusively to the member associated with that code. Each registration may carry only one Referral Code, and once recorded the attribution is final and shall not be transferred except where the Founders determine it resulted from a technical error, fraudulent activity or other material irregularity. A registration completed without a valid Referral Code remains unattributed.</p></li>
            <li class="legal-clause-item"><span class="legal-num">45.</span><p class="legal-text">For sponsorships and stalls, the member must first register the prospective sponsor or stall opportunity through the official Resolve system under their Referral Code. Where the sponsorship or stall is finalised and the funds are actually received by Resolve, the revenue shall be attributed to the Referral Code under which the opportunity was officially recorded, subject to verification by the Founders. Where the same sponsor or stall holder is recorded under more than one Referral Code, the Founders shall determine the valid attribution based primarily on the official Referral System records.</p></li>
            <li class="legal-clause-item"><span class="legal-num">46.</span><p class="legal-text">Social pass revenue shall be attributed exclusively through Referral Codes. A social pass purchased using a valid Referral Code shall be attributed to the member associated with that code, and each transaction may be attributed to only one Referral Code.</p></li>
            <li class="legal-clause-item"><span class="legal-num">47.</span><p class="legal-text">Each eligible transaction shall have only one Referral Code. The same revenue shall not be attributed to multiple members or counted more than once, and no member may substitute, add or change a Referral Code after a transaction has been recorded merely to obtain or increase remuneration.</p></li>
            <li class="legal-clause-item"><span class="legal-num">48.</span><p class="legal-text">A Referral Code establishes attribution but does not by itself create an entitlement to remuneration. Revenue counts only when the amount has actually been received and retained by Resolve. Registrations, leads, commitments, invoices, verbal confirmations, promised sponsorships and pending stall bookings are not realised revenue. Any amount refunded, reversed, cancelled or otherwise not retained by Resolve shall be excluded or deducted.</p></li>
            <li class="legal-clause-item">
              <span class="legal-num">49.</span>
              <div class="legal-text">
                The Referral System shall maintain records including, where applicable:
                <ul class="legal-sublist">
                  <li class="legal-sublist-item"><span class="legal-sub-tag">(a)</span><span>the Referral Code used;</span></li>
                  <li class="legal-sublist-item"><span class="legal-sub-tag">(b)</span><span>the member to whom the Referral Code was issued;</span></li>
                  <li class="legal-sublist-item"><span class="legal-sub-tag">(c)</span><span>the relevant delegate, OC registration, sponsor, stall or social pass transaction;</span></li>
                  <li class="legal-sublist-item"><span class="legal-sub-tag">(d)</span><span>the transaction or registration identification number;</span></li>
                  <li class="legal-sublist-item"><span class="legal-sub-tag">(e)</span><span>the date and time at which the Referral Code was recorded;</span></li>
                  <li class="legal-sublist-item"><span class="legal-sub-tag">(f)</span><span>the amount received by Resolve;</span></li>
                  <li class="legal-sublist-item"><span class="legal-sub-tag">(g)</span><span>the payment status; and</span></li>
                  <li class="legal-sublist-item"><span class="legal-sub-tag">(h)</span><span>any refund, reversal, cancellation or administrative correction.</span></li>
                </ul>
              </div>
            </li>
            <li class="legal-clause-item"><span class="legal-num">50.</span><p class="legal-text">Such records shall be the primary official record for determining attribution and Contribution to Revenue. Where multiple Referral Codes are recorded for the same transaction, only one shall be recognised, as determined by the Founders in their sole discretion. No member is entitled to remuneration merely because they claim to have introduced, contacted or assisted a delegate, sponsor, stall holder or other party where another member’s Referral Code has been validly recorded.</p></li>
            <li class="legal-clause-item">
              <span class="legal-num">51.</span>
              <div class="legal-text">
                A member shall not:
                <ul class="legal-sublist">
                  <li class="legal-sublist-item"><span class="legal-sub-tag">(a)</span><span>use another member’s Referral Code without authorisation;</span></li>
                  <li class="legal-sublist-item"><span class="legal-sub-tag">(b)</span><span>permit another person to use their Referral Code for a transaction that was not generated through their legitimate efforts;</span></li>
                  <li class="legal-sublist-item"><span class="legal-sub-tag">(c)</span><span>knowingly provide or enter an incorrect Referral Code;</span></li>
                  <li class="legal-sublist-item"><span class="legal-sub-tag">(d)</span><span>manipulate, duplicate, alter or interfere with Referral System records;</span></li>
                  <li class="legal-sublist-item"><span class="legal-sub-tag">(e)</span><span>attempt to transfer a transaction from one Referral Code to another for the purpose of obtaining remuneration; or</span></li>
                  <li class="legal-sublist-item"><span class="legal-sub-tag">(f)</span><span>otherwise engage in conduct intended to improperly increase their recorded Contribution to Revenue.</span></li>
                </ul>
              </div>
            </li>
            <li class="legal-clause-item"><span class="legal-num">52.</span><p class="legal-text">Any such conduct may constitute a breach of these Terms &amp; Conditions and may result in the withholding, reduction or forfeiture of unpaid remuneration and removal from the OC.</p></li>
            <li class="legal-clause-item"><span class="legal-num">53.</span><p class="legal-text">The Founders shall have the sole authority to correct Referral System records where there is a demonstrated technical error, duplicate entry, fraudulent entry, unauthorised use of a Referral Code or other material administrative irregularity. Any such correction shall be recorded in the official records, and except for such correction a recorded Referral Code shall be treated as final.</p></li>
            <li class="legal-clause-item"><span class="legal-num">54.</span><p class="legal-text">Following the Conference and verification of records, Revenue-Linked Remuneration = 8% × Net Realised Revenue Attributed to the Member’s Referral Code. The same revenue shall not be included more than once, and the final calculation is subject to verification and approval by the Founders before payment.</p></li>
          </ul>
        </div>

        <!-- Section 13 -->
        <div class="legal-card">
          <div class="legal-card-header">
            <span class="legal-badge">13</span>
            <h4 class="legal-card-title">Force Majeure</h4>
          </div>
          <ul class="legal-clause-list">
            <li class="legal-clause-item"><span class="legal-num">55.</span><p class="legal-text">Neither Resolve nor the Founders shall be liable for any failure or delay in performing their obligations, including the payment of remuneration, where such failure or delay results from events beyond their reasonable control, including failure or cancellation of the Conference, rain or adverse weather, natural disasters, fire, flood, earthquake, epidemic or pandemic, war, riots, civil unrest, terrorism, government orders or restrictions, venue unavailability, strikes, and failure of utilities or communication networks.</p></li>
            <li class="legal-clause-item"><span class="legal-num">56.</span><p class="legal-text">If such an event causes the Conference to be cancelled, abandoned or materially curtailed, no remuneration shall be payable, and the OC member shall have no claim against Resolve or the Founders for any expenses, time or effort incurred.</p></li>
            <li class="legal-clause-item"><span class="legal-num">57.</span><p class="legal-text">If the Conference is merely postponed, these Terms &amp; Conditions shall continue to apply to the rescheduled Conference unless the Founders decide otherwise.</p></li>
          </ul>
        </div>

        <!-- Section 14 -->
        <div class="legal-card">
          <div class="legal-card-header">
            <span class="legal-badge">14</span>
            <h4 class="legal-card-title">Applicability, General &amp; Acceptance</h4>
          </div>
          <ul class="legal-clause-list">
            <li class="legal-clause-item"><span class="legal-num">58.</span><p class="legal-text">These Terms &amp; Conditions, and every term, responsibility, remuneration, position and right set out in them, apply only to Resolve 2.0, to be held on 27, 28 and 29 November 2026 at Meridian School, Kompally. They do not extend to any previous or future edition of Resolve MUN.</p></li>
            <li class="legal-clause-item"><span class="legal-num">59.</span><p class="legal-text">These Terms &amp; Conditions record an understanding of voluntary engagement and do not create an employment relationship, partnership or agency. An OC member has no authority to bind Resolve to any contract or financial commitment without the written approval of the Founders.</p></li>
            <li class="legal-clause-item"><span class="legal-num">60.</span><p class="legal-text">These Terms &amp; Conditions are governed by the laws of India. Any dispute shall first be attempted to be resolved amicably, failing which the courts at Hyderabad shall have jurisdiction.</p></li>
            <li class="legal-clause-item"><span class="legal-num">61.</span><p class="legal-text">By accepting an OC position, the member confirms that they have read, understood, and agreed to these Terms &amp; Conditions.</p></li>
          </ul>
        </div>
      </div>

      <!-- 3. PRIVACY POLICY -->
      <div id="termsPrivacyContent" style="display: none;">
        <div class="legal-preamble-card">
          <strong style="color: #ffffff; display: block; margin-bottom: 4px; font-size: 13px;">Privacy Policy · Resolve MUN 2.0</strong>
          This Privacy Policy explains how Resolve MUN 2.0 (the “Conference”) collects, uses, stores, discloses and otherwise processes personal information when individuals visit the Resolve MUN website, register for or participate in the Conference, apply to join the Organizing Committee, communicate with the Secretariat, or otherwise interact with official Conference channels.
          <div style="margin-top: 8px; font-size: 11.5px; color: rgba(255,255,255,0.45); font-family: monospace;">
            Effective Date: 5 November 2026 · Last Updated: 5 November 2026 · Privacy Contact: Niveditt Basrani (resolve.mun@gmail.com)
          </div>
        </div>

        <!-- Section 1 -->
        <div class="legal-card">
          <div class="legal-card-header">
            <span class="legal-badge">01</span>
            <h4 class="legal-card-title">Scope &amp; Application</h4>
          </div>
          <ul class="legal-clause-list">
            <li class="legal-clause-item"><span class="legal-num">1.1.</span><p class="legal-text">This Privacy Policy applies to personal information processed in connection with Resolve MUN 2.0, scheduled to be held on 27, 28 and 29 November 2026 at Meridian School, Kompally, Hyderabad, Telangana, India.</p></li>
            <li class="legal-clause-item"><span class="legal-num">1.2.</span><p class="legal-text">It applies to delegates, prospective delegates, parents or guardians, Organizing Committee members, applicants, Executive Board members, volunteers, sponsors, guests, website visitors and individuals who communicate with Resolve through its official channels.</p></li>
            <li class="legal-clause-item"><span class="legal-num">1.3.</span><p class="legal-text">This Policy should be read together with the applicable Delegate Terms &amp; Conditions, Organizing Committee Terms &amp; Conditions, registration notices and any specific consent request presented at the point of collection. If a specific notice explains a particular processing activity in greater detail, that notice will apply to that activity to the extent of any inconsistency.</p></li>
            <li class="legal-clause-item"><span class="legal-num">1.4.</span><p class="legal-text">This Policy concerns personal information. It does not govern third-party websites, platforms or services that Resolve does not own or control, even where links to those services appear on the Resolve website.</p></li>
          </ul>
        </div>

        <!-- Section 2 -->
        <div class="legal-card">
          <div class="legal-card-header">
            <span class="legal-badge">02</span>
            <h4 class="legal-card-title">Information We May Collect</h4>
          </div>
          <ul class="legal-clause-list">
            <li class="legal-clause-item"><span class="legal-num">2.1.</span><p class="legal-text"><strong>Registration and identity information:</strong> name, age or date of birth, school or institution, grade or academic level, contact details, city, country, identification or verification details where required, and information submitted through delegate or OC application forms.</p></li>
            <li class="legal-clause-item"><span class="legal-num">2.2.</span><p class="legal-text"><strong>Parent or guardian information:</strong> where a participant is under 18, we may collect the name and contact details of a parent or legal guardian and information necessary to record or verify parental or guardian permission.</p></li>
            <li class="legal-clause-item"><span class="legal-num">2.3.</span><p class="legal-text"><strong>Conference information:</strong> committee and portfolio preferences, allocations, delegation details, research submissions, participation records, attendance, award-related information, accommodation or accessibility requests voluntarily disclosed, and communications with the Secretariat or Executive Board.</p></li>
            <li class="legal-clause-item"><span class="legal-num">2.4.</span><p class="legal-text"><strong>Organizing Committee information:</strong> department and role, application responses, assigned responsibilities, availability, performance and contribution records, referral code information, and records needed to calculate or verify any remuneration described in the OC Terms &amp; Conditions.</p></li>
            <li class="legal-clause-item"><span class="legal-num">2.5.</span><p class="legal-text"><strong>Payment and transaction information:</strong> registration status, amount, date, transaction reference, payment confirmation, refund or reversal status, and related accounting records. Payments may be processed by an external payment service provider. Resolve should not collect or retain full card numbers, card security codes, UPI PINs, passwords or other payment authentication credentials.</p></li>
            <li class="legal-clause-item"><span class="legal-num">2.6.</span><p class="legal-text"><strong>Referral and sponsorship information:</strong> referral codes, attribution records, sponsor or stall enquiries, transaction identifiers, and records of amounts actually received where relevant to Conference administration and OC remuneration.</p></li>
            <li class="legal-clause-item"><span class="legal-num">2.7.</span><p class="legal-text"><strong>Media and communications:</strong> photographs, video or audio recordings taken at Conference activities, messages, emails, feedback, complaints, enquiries and other information individuals choose to provide.</p></li>
            <li class="legal-clause-item"><span class="legal-num">2.8.</span><p class="legal-text"><strong>Technical information:</strong> when you visit the website, the website host or service providers may process technical data such as IP address, browser and device information, pages requested, access times, approximate location derived from network information, and diagnostic or security logs. The precise information collected depends on the website configuration and service providers.</p></li>
          </ul>
        </div>

        <!-- Section 3 -->
        <div class="legal-card">
          <div class="legal-card-header">
            <span class="legal-badge">03</span>
            <h4 class="legal-card-title">How We Use Personal Information</h4>
          </div>
          <ul class="legal-clause-list">
            <li class="legal-clause-item"><span class="legal-num">3.1.</span><p class="legal-text">We may use personal information to receive and administer registrations and applications; verify eligibility and identity; communicate with participants and guardians; allocate committees and portfolios; organise schedules, sessions and venue access; manage attendance; and provide Conference services.</p></li>
            <li class="legal-clause-item"><span class="legal-num">3.2.</span><p class="legal-text">We may use information to administer the Organizing Committee, assign and review responsibilities, maintain internal records, manage referral codes, attribute eligible transactions, verify revenue and calculate remuneration in accordance with the OC Terms &amp; Conditions.</p></li>
            <li class="legal-clause-item"><span class="legal-num">3.3.</span><p class="legal-text">We may process transaction information to confirm payments, reconcile accounts, address payment disputes, administer refunds or adjustments where applicable, prevent fraud and maintain financial records.</p></li>
            <li class="legal-clause-item"><span class="legal-num">3.4.</span><p class="legal-text">We may use communications and feedback to respond to enquiries, resolve complaints, enforce Conference rules, investigate misconduct, protect participant safety and improve future editions of Resolve MUN.</p></li>
            <li class="legal-clause-item"><span class="legal-num">3.5.</span><p class="legal-text">Photographs and recordings may be used for Conference documentation, reporting, archival purposes and promotional materials on official Resolve channels. Where required, we will seek the appropriate permission or consent, including from a parent or guardian for a participant who is a child. A participant may raise a media-related concern using the contact details in Clause 14.</p></li>
            <li class="legal-clause-item"><span class="legal-num">3.6.</span><p class="legal-text">We may use technical information to operate, maintain, secure and troubleshoot the website, detect abuse, protect accounts and systems, and understand website performance where the relevant tools are enabled.</p></li>
            <li class="legal-clause-item"><span class="legal-num">3.7.</span><p class="legal-text">We will not knowingly use personal information for a purpose materially unrelated to the purpose for which it was collected without providing any notice or obtaining any consent required by applicable law.</p></li>
          </ul>
        </div>

        <!-- Section 4 -->
        <div class="legal-card">
          <div class="legal-card-header">
            <span class="legal-badge">04</span>
            <h4 class="legal-card-title">Sharing &amp; Disclosure</h4>
          </div>
          <ul class="legal-clause-list">
            <li class="legal-clause-item"><span class="legal-num">4.1.</span><p class="legal-text">Access to personal information within Resolve is limited to the Founders, Secretariat, authorised OC members and other persons who reasonably require the information to perform an assigned Conference function. Access should be limited to the information necessary for that function.</p></li>
            <li class="legal-clause-item"><span class="legal-num">4.2.</span><p class="legal-text">We may share relevant information with Meridian School or other venue personnel, event service providers, website hosting and form providers, communication platforms, payment processors, technology providers, photographers or media personnel, and professional advisers, where their involvement is reasonably necessary for Conference operations or the purposes described in this Policy.</p></li>
            <li class="legal-clause-item"><span class="legal-num">4.3.</span><p class="legal-text">We may disclose information to a parent or guardian where appropriate for a participant under 18, or to an educational institution where necessary for a legitimate Conference, safety or disciplinary matter and permitted by applicable law.</p></li>
            <li class="legal-clause-item"><span class="legal-num">4.4.</span><p class="legal-text">We may disclose information where required by law, court order, governmental authority or lawful request, or where reasonably necessary to protect the safety, rights or property of participants, Resolve, the venue or another person.</p></li>
            <li class="legal-clause-item"><span class="legal-num">4.5.</span><p class="legal-text">We do not intend to sell personal information to third parties. Where a service provider processes information on our behalf, it should use that information only for the agreed service and subject to appropriate confidentiality and security obligations.</p></li>
            <li class="legal-clause-item"><span class="legal-num">4.6.</span><p class="legal-text">Some service providers may process or store information on servers located outside India. Where this occurs, any transfer will be subject to applicable Indian law and relevant restrictions or safeguards.</p></li>
          </ul>
        </div>

        <!-- Section 5 -->
        <div class="legal-card">
          <div class="legal-card-header">
            <span class="legal-badge">05</span>
            <h4 class="legal-card-title">Children &amp; Parental or Guardian Permission</h4>
          </div>
          <ul class="legal-clause-list">
            <li class="legal-clause-item"><span class="legal-num">5.1.</span><p class="legal-text">Resolve MUN may receive registrations from individuals under 18 years of age. Such individuals must have the permission of a parent or legal guardian to participate, as required by the Delegate Terms &amp; Conditions.</p></li>
            <li class="legal-clause-item"><span class="legal-num">5.2.</span><p class="legal-text">Where required by applicable law, Resolve will obtain verifiable parental or guardian consent before processing a child’s personal data. We will not knowingly undertake processing of a child’s personal data in a manner prohibited by applicable law.</p></li>
            <li class="legal-clause-item"><span class="legal-num">5.3.</span><p class="legal-text">A parent or legal guardian may contact Resolve to ask about the personal information associated with the child, request correction or deletion where legally available, or raise a concern about the child’s information or use of media.</p></li>
            <li class="legal-clause-item"><span class="legal-num">5.4.</span><p class="legal-text">Parents and guardians should avoid submitting information about a child that is not requested or reasonably necessary for registration, safety or Conference administration.</p></li>
          </ul>
        </div>

        <!-- Section 6 -->
        <div class="legal-card">
          <div class="legal-card-header">
            <span class="legal-badge">06</span>
            <h4 class="legal-card-title">Cookies &amp; Similar Technologies</h4>
          </div>
          <ul class="legal-clause-list">
            <li class="legal-clause-item"><span class="legal-num">6.1.</span><p class="legal-text">The website may use cookies, session identifiers or similar technologies that are necessary for website functionality, security, form operation or user preferences. If analytics or advertising technologies are enabled, they may collect information about how visitors use the website.</p></li>
            <li class="legal-clause-item"><span class="legal-num">6.2.</span><p class="legal-text">The exact cookies and technologies used depend on the website’s configuration and third-party integrations. Resolve should identify the active tools and provide any consent or preference controls required by applicable law.</p></li>
            <li class="legal-clause-item"><span class="legal-num">6.3.</span><p class="legal-text">You may be able to control cookies through your browser settings. Disabling certain cookies may affect the availability or operation of some website features.</p></li>
          </ul>
        </div>

        <!-- Section 7 -->
        <div class="legal-card">
          <div class="legal-card-header">
            <span class="legal-badge">07</span>
            <h4 class="legal-card-title">Data Retention</h4>
          </div>
          <ul class="legal-clause-list">
            <li class="legal-clause-item"><span class="legal-num">7.1.</span><p class="legal-text">We retain personal information only for as long as reasonably necessary for the purposes described in this Policy, including Conference administration, participant safety, financial reconciliation, referral attribution, dispute handling, recordkeeping and compliance with legal obligations.</p></li>
            <li class="legal-clause-item"><span class="legal-num">7.2.</span><p class="legal-text">Different categories of information may be retained for different periods. Payment and accounting records may need to be retained for longer than routine enquiries or temporary application data. Media selected for archival or promotional use may remain available on official channels unless removal is appropriate and legally required.</p></li>
            <li class="legal-clause-item"><span class="legal-num">7.3.</span><p class="legal-text">When personal information is no longer required, Resolve will take reasonable steps to delete it, anonymise it or otherwise dispose of it securely, subject to applicable law and legitimate recordkeeping requirements.</p></li>
          </ul>
        </div>

        <!-- Section 8 -->
        <div class="legal-card">
          <div class="legal-card-header">
            <span class="legal-badge">08</span>
            <h4 class="legal-card-title">Security &amp; Confidentiality</h4>
          </div>
          <ul class="legal-clause-list">
            <li class="legal-clause-item"><span class="legal-num">8.1.</span><p class="legal-text">Resolve will take reasonable measures, appropriate to the nature of the information and the circumstances of processing, to protect personal information against unauthorised access, disclosure, alteration, loss or misuse.</p></li>
            <li class="legal-clause-item"><span class="legal-num">8.2.</span><p class="legal-text">Such measures may include limiting access to authorised persons, using access controls and password protection, maintaining appropriate service-provider arrangements, and securely disposing of information when it is no longer required.</p></li>
            <li class="legal-clause-item"><span class="legal-num">8.3.</span><p class="legal-text">No website, online transmission or storage system can be guaranteed to be completely secure. Participants should use official channels, avoid sharing passwords or payment credentials, and promptly report suspected misuse or unauthorised disclosure.</p></li>
            <li class="legal-clause-item"><span class="legal-num">8.4.</span><p class="legal-text">If a personal data breach occurs, Resolve will take appropriate steps to investigate, contain and address it, and provide notices or reports to affected individuals or authorities where required by applicable law.</p></li>
          </ul>
        </div>

        <!-- Section 9 -->
        <div class="legal-card">
          <div class="legal-card-header">
            <span class="legal-badge">09</span>
            <h4 class="legal-card-title">Your Choices &amp; Privacy Requests</h4>
          </div>
          <ul class="legal-clause-list">
            <li class="legal-clause-item"><span class="legal-num">9.1.</span><p class="legal-text">Subject to applicable law, an individual may request information about personal data processed by Resolve, seek correction or updating of inaccurate information, request erasure where retention is no longer necessary or legally required, withdraw consent where processing is based on consent, and raise a grievance concerning the handling of personal information.</p></li>
            <li class="legal-clause-item"><span class="legal-num">9.2.</span><p class="legal-text">A request should be sent using the contact details in Clause 14 and should identify the individual and the request with sufficient detail for Resolve to locate the relevant records. Resolve may seek reasonable information to verify the requester’s identity or authority, particularly where the request concerns a child.</p></li>
            <li class="legal-clause-item"><span class="legal-num">9.3.</span><p class="legal-text">Withdrawal of consent does not affect processing already carried out before withdrawal. It may also affect Resolve’s ability to provide a registration, service or Conference function that depends on the relevant information.</p></li>
            <li class="legal-clause-item"><span class="legal-num">9.4.</span><p class="legal-text">Resolve will review and respond to requests within the period required by applicable law. Certain information may need to be retained where required by law, for accounting, safety, dispute resolution or the establishment or defence of legal claims.</p></li>
          </ul>
        </div>

        <!-- Section 10 -->
        <div class="legal-card">
          <div class="legal-card-header">
            <span class="legal-badge">10</span>
            <h4 class="legal-card-title">Third-Party Websites &amp; Services</h4>
          </div>
          <ul class="legal-clause-list">
            <li class="legal-clause-item"><span class="legal-num">10.1.</span><p class="legal-text">The Resolve website or official communications may contain links to third-party websites, registration tools, payment pages, social media platforms or other external services. Those services operate under their own privacy policies and terms.</p></li>
            <li class="legal-clause-item"><span class="legal-num">10.2.</span><p class="legal-text">Resolve is not responsible for the privacy, security, content or practices of third-party services that it does not control. Individuals should review the relevant third-party privacy notices before submitting information through those services.</p></li>
          </ul>
        </div>

        <!-- Section 11 -->
        <div class="legal-card">
          <div class="legal-card-header">
            <span class="legal-badge">11</span>
            <h4 class="legal-card-title">Changes to this Policy</h4>
          </div>
          <ul class="legal-clause-list">
            <li class="legal-clause-item"><span class="legal-num">11.1.</span><p class="legal-text">Resolve may revise this Privacy Policy to reflect changes in Conference operations, website functionality, service providers or applicable law.</p></li>
            <li class="legal-clause-item"><span class="legal-num">11.2.</span><p class="legal-text">The updated version will be published on the Resolve MUN website with a revised “Last Updated” date. Where a change materially affects how personal information is processed, Resolve will provide any additional notice or seek any consent required by applicable law.</p></li>
          </ul>
        </div>

        <!-- Section 12 -->
        <div class="legal-card">
          <div class="legal-card-header">
            <span class="legal-badge">12</span>
            <h4 class="legal-card-title">Governing Law</h4>
          </div>
          <ul class="legal-clause-list">
            <li class="legal-clause-item"><span class="legal-num">12.1.</span><p class="legal-text">This Privacy Policy is governed by the laws of India. Subject to applicable data protection law and the jurisdiction of any competent statutory authority, courts at Hyderabad, Telangana shall have jurisdiction over disputes arising in connection with this Policy.</p></li>
          </ul>
        </div>

        <!-- Section 13 -->
        <div class="legal-card">
          <div class="legal-card-header">
            <span class="legal-badge">13</span>
            <h4 class="legal-card-title">Relationship with Conference Terms &amp; Conditions</h4>
          </div>
          <ul class="legal-clause-list">
            <li class="legal-clause-item"><span class="legal-num">13.1.</span><p class="legal-text">This Privacy Policy explains personal information practices and is not a substitute for the Delegate Terms &amp; Conditions or Organizing Committee Terms &amp; Conditions. Those documents continue to govern participation, conduct, responsibilities, remuneration, disciplinary matters and other Conference-specific obligations.</p></li>
            <li class="legal-clause-item"><span class="legal-num">13.2.</span><p class="legal-text">If a provision of the Terms &amp; Conditions addresses a matter unrelated to personal information, that provision remains governed by the relevant Terms &amp; Conditions. Personal information will be handled in accordance with this Policy and applicable law.</p></li>
          </ul>
        </div>

        <!-- Section 14 -->
        <div class="legal-card">
          <div class="legal-card-header">
            <span class="legal-badge">14</span>
            <h4 class="legal-card-title">Contact &amp; Grievances</h4>
          </div>
          <ul class="legal-clause-list">
            <li class="legal-clause-item"><span class="legal-num">14.1.</span><p class="legal-text">Questions, privacy requests, complaints or concerns about this Policy may be submitted to Resolve using the contact details below:
              <br/><br/>
              <strong>Privacy Contact / Grievance Officer:</strong> Niveditt Basrani<br/>
              <strong>Email:</strong> <a href="mailto:resolve.mun@gmail.com" style="color: #ffffff; text-decoration: underline;">resolve.mun@gmail.com</a><br/>
              <strong>Website:</strong> <a href="https://resolvemun.in/" target="_blank" rel="noopener noreferrer" style="color: #ffffff; text-decoration: underline;">https://resolvemun.in/</a><br/>
              <strong>Organising Location:</strong> Hyderabad, Telangana, India
            </p></li>
            <li class="legal-clause-item"><span class="legal-num">14.2.</span><p class="legal-text">Please include “Privacy Request – Resolve MUN 2.0” in the subject line of an email. Do not send passwords, UPI PINs, full card details or other sensitive authentication credentials.</p></li>
          </ul>
        </div>
      </div>

      <!-- Legal Footer Contact -->
      <div class="legal-footer-contact">
        <p style="margin: 0; font-size: 12.5px; color: rgba(255, 255, 255, 0.55); line-height: 1.5;">
          Official Legal Documentation · Resolve Model United Nations 2.0 · Hyderabad · Direct contact: <a href="mailto:resolve.mun@gmail.com" style="color: #ffffff; text-decoration: underline;">resolve.mun@gmail.com</a>
        </p>
      </div>
    </div>
  </div>
</div>


<div class="committee-prompt" id="committeePrompt" aria-hidden="true">
  <div class="committee-prompt__text">
    CHOOSE YOUR COMMITTEE
    <span class="committee-prompt__subtext">Background guides are live</span>
  </div>
</div>

<!-- COUNTDOWN -->
<div id="countdown" class="reveal">
  <span class="countdown-label" id="cd-label">Conference Opens In</span>
  <div class="countdown-live-banner" id="cd-live-banner" style="display: none;">
    <span class="countdown-live-dot"></span>
    <span class="countdown-live-text">RESOLVE IS HAPPENING RIGHT NOW</span>
  </div>
  <div class="countdown-units-wrapper" id="cd-units">
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
        <span class="num">250+</span>
        <div class="stat-divider"></div>
        <span class="desc">Delegates</span>
      </div>
      <div class="about-stat">
        <span class="num">6</span>
        <div class="stat-divider"></div>
        <span class="desc">Committees</span>
      </div>
      <div class="about-stat cash-rewards-stat">
        <span class="num">???</span>
        <div class="stat-divider"></div>
        <span class="desc">Cashpool</span>
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

<!-- FOUNDER'S LETTER -->
<section id="letter" class="reveal">
  <!-- Interactive Monochrome Wave Shader Backdrop -->
  <div class="letter-shader-backdrop">
    <canvas id="letterShaderCanvas" class="letter-shader-canvas"></canvas>
    <div class="letter-noise-overlay"></div>
  </div>

  <div class="letter-inner">
    <div class="section-label reveal" style="justify-content: center;">Official Correspondence</div>
    <h2 class="section-title reveal" style="text-align: center;">A LETTER FROM THE<br>FOUNDER</h2>
    
    <div class="letter-container reveal reveal-delay-2">
      <!-- Luxury Letterhead -->
      <div class="letterhead-top">
        <div class="letterhead-seal">
          <img src="/images/Logo.svg" alt="Resolve MUN" onerror="this.src='https://resolvemun.in/images/Logo.svg'" />
          <div class="letterhead-seal-text">
            <span class="lh-org">RESOLVE MODEL UNITED NATIONS 2.0</span>
            <span class="lh-office">OFFICE OF THE FOUNDER · HYDERABAD</span>
          </div>
        </div>
        <div class="letterhead-edition">27–29 NOV 2026</div>
      </div>

      <div class="letter-divider-line"></div>

      <div class="letter-content">
        <p class="letter-salutation">Dear Delegates,</p>

        <p class="letter-lead">
          Every conference makes a promise. Very few take the responsibility of keeping it.
        </p>

        <p>
          When we envisioned Resolve, we wanted to build something that extended beyond the usual expectations of a Model United Nations conference. We wanted a room where ideas mattered, where disagreements were meaningful, where research was evident in every argument, and where leadership was measured not by the position one held, but by the substance one brought to the table.
        </p>

        <p class="letter-emphasis">
          That vision continues to define Resolve MUN 2.0.
        </p>

        <p>
          We believe that diplomacy should be challenging. It should demand preparation, reward intellectual honesty, encourage constructive disagreement and, above all, leave room for perspectives that challenge conventional thinking. We have worked towards creating an environment that reflects these values, with committees designed to encourage meaningful deliberation and an Executive Board committed to maintaining the highest standards of debate.
        </p>

        <p>
          But a conference is ultimately more than its committees, its agenda or the arrangements behind it. It is defined by the people who walk into its rooms. By the delegate who questions an established position, the individual who finds common ground where none seemed possible, and the person who leaves with a perspective they did not have before.
        </p>

        <p class="letter-emphasis">
          That is what we hope Resolve will offer you.
        </p>

        <p>
          As you prepare to join us, I encourage you to come with an open mind, an appetite for learning and the willingness to be challenged. Do not measure your experience solely by the awards you receive or the positions you secure. Measure it by the arguments you construct, the people you engage with and the ideas you carry forward.
        </p>

        <p>
          Building Resolve has been an immensely meaningful journey, and seeing this vision take shape through the efforts of our Secretariat, Organizing Committee, Executive Board and everyone who has contributed to this edition makes it all the more worthwhile.
        </p>

        <p>
          Thank you for placing your trust in us.
        </p>

        <p class="letter-conclusion">
          We look forward to welcoming you to Resolve MUN 2.0.
        </p>
      </div>

      <div class="letter-signature-block">
        <p class="letter-signoff">With regards,</p>
        <div class="letter-founder-info">
          <div class="founder-sig-name">NIVEDITT BASRANI</div>
          <div class="founder-sig-role">Founder, Resolve Model United Nations 2026</div>
        </div>
      </div>
    </div>
  </div>
</section>

<div class="glow-line"></div>

<!-- COMMITTEES_PLACEHOLDER -->

<div class="glow-line"></div>

<!-- VENUE -->
<section id="venue" class="reveal">
  <div class="venue-inner">
    <div class="venue-header text-center reveal">
      <div class="section-label" style="justify-content: center; margin: 0 auto 12px auto;">Official Venue</div>
      <h2 class="section-title" style="text-align: center; margin-bottom: 12px;">MERIDIAN SCHOOL, KOMPALLY</h2>
      <p class="section-body" style="max-width: 720px; margin: 0 auto 36px auto;">
        Hyderabad's premier institutional campus — purpose-built with world-class facilities, state-of-the-art committee chambers, and an expansive plenary hall.
      </p>
    </div>

    <!-- Pic | Exact Location on Maps Split Grid -->
    <div class="venue-split-grid">
      <!-- LEFT: PIC SHOWCASE (FULL FIT, NO PILLS, NO BOXES) -->
      <div class="venue-pic-card reveal">
        <div class="venue-pic-frame">
          <img src="/images/venue-meridian.jpg" alt="Meridian School Kompally - Official Venue for Resolve MUN 2.0" class="venue-showcase-img" />
        </div>
      </div>

      <!-- RIGHT: EXACT LOCATION ON MAPS (EXTENDED) -->
      <div class="venue-map-card reveal reveal-delay-2">
        <div class="venue-map-header">
          <div class="venue-map-meta">
            
            <span class="venue-landmark-text">Behind Cine Planet · Kompally</span>
          </div>
          <span class="venue-city-code">HYD · 500014</span>
        </div>

        <!-- Extended Interactive Dark Google Maps Embed -->
        <div class="venue-map-frame">
          <iframe
            src="https://maps.google.com/maps?q=Meridian+School+Kompally+Hyderabad&t=&z=15&ie=UTF8&iwloc=&output=embed"
            class="venue-map-iframe"
            allowfullscreen=""
            loading="lazy"
            referrerpolicy="no-referrer-when-downgrade"
            title="Meridian School Kompally Google Map Location"
          ></iframe>
        </div>

        <!-- Address & Action Block -->
        <div class="venue-address-block">
          <div class="venue-address-content">
            <div class="venue-pin-icon">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
                <circle cx="12" cy="10" r="3"></circle>
              </svg>
            </div>
            <div class="venue-address-text">
              <strong id="venueAddressText">Survey No. 108 & 109/B, Satyam Enclave, Behind Cine Planet, Kompally, Hyderabad, Telangana 500014</strong>
              <span class="venue-landmark-sub">Landmark: Opposite Subiksha Towers & Behind Cine Planet (Directly off NH 44 Medchal Highway)</span>
            </div>
          </div>

          <!-- Action Buttons -->
          <div class="venue-actions-row">
            <a
              href="https://www.google.com/maps/search/?api=1&query=Meridian+School+Kompally+Hyderabad"
              target="_blank"
              rel="noopener noreferrer"
              class="venue-nav-btn venue-nav-btn--primary"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <polygon points="3 11 22 2 13 21 11 13 3 11"></polygon>
              </svg>
              <span>Get Directions on Maps</span>
            </a>

            <button
              type="button"
              class="venue-nav-btn venue-nav-btn--secondary"
              onclick="(function(){
                navigator.clipboard.writeText('Survey No. 108 & 109/B, Satyam Enclave, Behind Cine Planet, Kompally, Hyderabad, Telangana 500014');
                if (window.showCustomAlert) {
                  window.showCustomAlert('Venue address copied to clipboard!', 'success');
                } else {
                  alert('Venue address copied to clipboard!');
                }
              })()"
            >
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
                <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
              </svg>
              <span>Copy Address</span>
            </button>
          </div>
        </div>
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

<!-- OC APPLICATION MODAL (1:1 ORGANIZING COMMITTEE GOOGLE FORM) -->
<div class="modal-overlay" id="ocModal">
  <div class="modal-content" style="max-width: 660px; max-height: 90vh; overflow-y: auto;">
    <button class="modal-close" id="closeOcModal" aria-label="Close">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
        <line x1="18" y1="6" x2="6" y2="18"></line>
        <line x1="6" y1="6" x2="18" y2="18"></line>
      </svg>
    </button>
    
    <div class="modal-header">
      <div class="modal-pretitle">RESOLVE MUN 2.0 · SALARIED ROLE</div>
      <h2 class="modal-title">ORGANIZING COMMITTEE REGISTRATION</h2>
      <span class="modal-subtitle">27th – 29th November 2026 · Meridian School, Kompally</span>
    </div>
    
    <form id="ocRegForm" novalidate>
      <!-- STEP 1: PERSONAL & CORE DETAILS -->
      <div class="form-step active" id="ocStep1">
        <div style="background: rgba(56, 189, 248, 0.08); border: 1px solid rgba(56, 189, 248, 0.25); border-radius: 10px; padding: 12px 14px; margin-bottom: 16px;">
          <p style="margin: 0; font-size: 0.78rem; color: #7dd3fc; font-weight: 700;">Salaried Role · Organizing Committee</p>
          <p style="margin: 4px 0 0 0; font-size: 0.72rem; color: rgba(255,255,255,0.75); line-height: 1.45;">
            OC members are eligible for performance-based remuneration &amp; referral commissions per the OC Terms &amp; Conditions.
          </p>
        </div>

        <div class="form-group">
          <label for="ocName">Full Name <span style="color:#f87171;">*</span></label>
          <input type="text" id="ocName" name="fullName" placeholder="Enter your full name" required data-required="true" autocomplete="name">
        </div>
        
        <div class="form-group" style="display: grid; grid-template-columns: 1fr 1fr; gap: 14px;">
          <div>
            <label for="ocPhone">Contact Number (WhatsApp) <span style="color:#f87171;">*</span></label>
            <input type="tel" id="ocPhone" name="phone" placeholder="10-digit mobile number" required data-required="true" minlength="10" maxlength="10" pattern="[0-9]{10}" title="Please enter a valid 10-digit phone number">
          </div>
          <div>
            <label for="ocEmail">Email ID <span style="color:#f87171;">*</span></label>
            <input type="email" id="ocEmail" name="email" placeholder="you@example.com" required data-required="true" autocomplete="email">
          </div>
        </div>

        <div class="form-group">
          <label for="ocInst">School / College / Institution <span style="color:#f87171;">*</span></label>
          <input type="text" id="ocInst" name="institution" placeholder="Enter your school or college name" required data-required="true">
        </div>

        <div class="form-group" style="display: grid; grid-template-columns: 1fr 1fr; gap: 14px;">
          <div>
            <label for="ocDob">Date of Birth <span style="color:#f87171;">*</span></label>
            <input type="date" id="ocDob" name="dob" required data-required="true" style="color-scheme: dark;">
          </div>
          <div>
            <label for="ocGrade">Grade / Class / Year <span style="color:#f87171;">*</span></label>
            <select id="ocGrade" name="grade" required data-required="true">
              <option value="" disabled selected>Select Grade</option>
              <option value="8th">8th</option>
              <option value="9th">9th</option>
              <option value="10th">10th</option>
              <option value="11th">11th</option>
              <option value="12th">12th</option>
              <option value="Undergraduate / College">Undergraduate / College</option>
              <option value="Other">Other</option>
            </select>
          </div>
        </div>

        <div class="form-group">
          <label for="ocAddress">Full Residential Address <span style="color:#f87171;">*</span></label>
          <textarea id="ocAddress" name="address" placeholder="Enter your residential address" required data-required="true" style="resize: vertical; min-height: 56px;"></textarea>
        </div>

        <div class="form-group" style="display: grid; grid-template-columns: 1fr 1fr; gap: 14px;">
          <div>
            <label for="ocInsta">Instagram Handle (Optional)</label>
            <input type="text" id="ocInsta" name="instagram" autocomplete="username" placeholder="@username">
          </div>
          <div>
            <label for="ocMunCount">Number of MUNs Attended <span style="color:#f87171;">*</span></label>
            <select id="ocMunCount" required data-required="true">
              <option value="" disabled selected>Select an option</option>
              <option value="N/A">N/A (First Timer)</option>
              <option value="1-5">1-5</option>
              <option value="6-10">6-10</option>
              <option value="11+">11 &amp; more</option>
            </select>
          </div>
        </div>

        <button type="button" class="btn-next btn-full-width" onclick="nextOcStep(2)">
          Next: Experience &amp; Fee Tier
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
        </button>
      </div>

      <!-- STEP 2: MOTIVATION, FEE TIER & PAYMENT -->
      <div class="form-step" id="ocStep2">
        <div class="form-group">
          <label for="ocWhy">Previous MUN / Organizing Experience <span style="color:#f87171;">*</span></label>
          <textarea id="ocWhy" placeholder="Describe your past MUN or event organizing experience (or write N/A)" required data-required="true" style="resize: vertical; min-height: 68px;"></textarea>
        </div>

        <div class="form-group">
          <label for="ocAttributes">Why do you want to join the Resolve MUN 2.0 Organizing Committee? <span style="color:#f87171;">*</span></label>
          <textarea id="ocAttributes" placeholder="Tell us what makes you well-suited for an OC role" required data-required="true" style="resize: vertical; min-height: 68px;"></textarea>
        </div>

        <div class="form-group">
          <label for="ocFeeTier">Select OC Registration Fee Tier <span style="color:#f87171;">*</span></label>
          <select id="ocFeeTier" required data-required="true" onchange="window.updateOcFeeTierUI && window.updateOcFeeTierUI(this.value)">
            <option value="₹1,500 — Transport & T-Shirt Included" data-amount="1500" selected>₹1,500 — Transport &amp; T-Shirt Included</option>
            <option value="₹1,000 — Transport Excluded (T-Shirt Included)" data-amount="1000">₹1,000 — Transport Excluded (T-Shirt Included)</option>
            <option value="₹750 — Transport & T-Shirt Excluded" data-amount="750">₹750 — Transport &amp; T-Shirt Excluded</option>
            <option value="Pay Later" data-amount="0">Pay Later (Complete Payment After Selection)</option>
          </select>
        </div>

        <!-- OC UPI Payment Card (Hidden automatically when 'Pay Later' is chosen) -->
        <div id="ocPaymentCardWrapper" class="payment-card" style="background: #07080e; border: 1px solid rgba(255,255,255,0.12); border-radius: 14px; padding: 14px; margin-bottom: 14px;">
          <div style="text-align: center;">
            <label style="text-align: center; margin-bottom: 8px; font-size: 0.68rem; letter-spacing: 0.14em; color: #7dd3fc; font-weight: 700; display: block;">SCAN NAVI / UPI QR CODE (BEJUGAM ADITYA)</label>
            <div class="qr-container" style="display: inline-block; padding: 10px; border-radius: 12px; background: #ffffff;">
              <img id="ocPaymentQRImage" src="https://api.qrserver.com/v1/create-qr-code/?size=320x320&data=upi%3A%2F%2Fpay%3Fpa%3D6301550628%40nyes%26pn%3DBejugam%2520Aditya%26am%3D1500%26cu%3DINR%26tn%3DResolve%2520MUN%25202026%2520OC%2520Fee&bgcolor=ffffff&color=05060c&margin=1" alt="OC Payment QR Code" style="width: 150px; height: 150px; display: block; border-radius: 6px;">
              <div id="ocQRScanLabel" style="margin-top: 5px; font-size: 0.64rem; font-weight: 800; color: #0f172a; font-family: ui-monospace, monospace;">SCAN &amp; PAY ₹1,500</div>
            </div>
            <div class="upi-box" style="display: flex; align-items: center; justify-content: space-between; gap: 8px; max-width: 300px; margin: 10px auto 4px; background: rgba(255,255,255,0.04); border: 1px solid rgba(255,255,255,0.15); border-radius: 8px; padding: 5px 10px;">
              <span id="ocUpiID" style="font-family: ui-monospace, monospace; font-size: 0.72rem; color: #e2e8f0; font-weight: 600;">6301550628@nyes</span>
              <button type="button" class="copy-btn" onclick="copyOcUPI()" style="padding: 3px 8px; border-radius: 6px; background: rgba(56,189,248,0.2); border: 1px solid rgba(56,189,248,0.4); color: #7dd3fc; font-size: 0.65rem; font-weight: 700; cursor: pointer;">COPY</button>
            </div>
            <span style="font-size: 0.66rem; color: #94a3b8;">Verified Payee: <strong style="color: #fff;">Bejugam Aditya</strong></span>
          </div>

          <div class="form-group" style="margin-top: 12px;">
            <label for="ocTxnID" style="font-size: 0.72rem;">Transaction / Reference ID (Required if paying now)</label>
            <input type="text" id="ocTxnID" placeholder="Enter UPI Transaction ID / 12-digit UTR">
          </div>

          <div class="form-group" style="margin-top: 10px;">
            <label style="font-size: 0.72rem;">Upload Payment Screenshot</label>
            <label class="file-upload-wrapper" for="ocDriveLink" style="cursor: pointer; display: flex; align-items: center; gap: 10px; padding: 9px 12px; background: rgba(255,255,255,0.04); border: 1px dashed rgba(255,255,255,0.25); border-radius: 8px;">
              <span class="file-upload-btn" style="padding: 4px 10px; background: rgba(255,255,255,0.1); border-radius: 6px; font-size: 0.7rem; font-weight: 700; color: #fff;">Choose File</span>
              <span class="file-name" id="ocDriveFileName" style="font-size: 0.7rem; color: #94a3b8;">No file chosen</span>
              <input type="file" id="ocDriveLink" class="file-upload-input" accept="image/*,.pdf" style="display: none;">
            </label>
            <div id="ocScreenshotPreview" style="display: none; margin-top: 6px;" class="payment-screenshot-preview"></div>
          </div>
        </div>

        <div class="form-group" style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px;">
          <div>
            <label for="ocReferral">Referral Code (Optional)</label>
            <input type="text" id="ocReferral" placeholder="e.g. RES-123">
          </div>
          <div>
            <label for="ocAdditionalInfo">Additional Info (Optional)</label>
            <input type="text" id="ocAdditionalInfo" placeholder="Any notes or questions">
          </div>
        </div>

        <div class="form-actions">
          <button type="button" class="btn-back" onclick="nextOcStep(1)">Back</button>
          <button type="submit" class="btn-next">Submit OC Application</button>
        </div>
        <p class="terms-confirmation" style="font-size: 0.64rem; color: #64748b; text-align: center; margin-top: 10px;">
          By submitting, you agree to the <a href="#" onclick="openTermsModal('oc'); return false;" style="color: #38bdf8; text-decoration: underline;">OC Terms &amp; Conditions</a>.
        </p>
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
        <span class="selection-badge" style="background: rgba(99, 102, 241, 0.2); color: #a5b4fc; border: 1px solid rgba(129, 140, 248, 0.3); font-size: 10px; font-weight: 700; letter-spacing: 0.1em;">RESOLVE MUN 2.0 · SECRETARIAT</span>
        <span style="font-size: 10px; color: #34d399; font-weight: 700; background: rgba(52, 211, 153, 0.1); padding: 2px 8px; border-radius: 4px; border: 1px solid rgba(52, 211, 153, 0.25);">FREE TO APPLY</span>
      </div>
      <h2 class="modal-title" style="font-size: 1.5rem; letter-spacing: 0.02em; margin: 4px 0;">Secretariat Applications — Resolve MUN 2.0</h2>
      <span class="modal-subtitle" style="font-size: 0.8rem; color: rgba(255,255,255,0.65);">Hyderabad · 27th – 29th November 2026</span>
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

        <button type="button" class="btn-next btn-full-width" style="padding: 13px 20px; font-weight: 700; letter-spacing: 0.04em;" onclick="nextSecStep(2)">
          <span>Next: Your Details</span>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
        </button>
      </div>

      <!-- STEP 2: PERSONAL DETAILS (FROM GOOGLE FORM PAGE 2) -->
      <div class="form-step" id="secStep2">
        <div style="margin-bottom: 16px; padding-bottom: 8px; border-bottom: 1px solid rgba(255,255,255,0.06);">
          <h3 style="font-size: 1.1rem; color: #ffffff; margin: 0;">Secretariat Application</h3>
          <p style="font-size: 0.75rem; color: #60a5fa; margin: 4px 0 0 0;">* Indicates required question</p>
        </div>

        <div class="form-group">
          <label for="secName">Full Name <span style="color:#f87171;">*</span></label>
          <input type="text" id="secName" name="fullName" placeholder="Enter your full name" required data-required="true">
        </div>
        
        <div class="form-group" style="display: grid; grid-template-columns: 1fr 1fr; gap: 14px;">
          <div>
            <label for="secEmail">Email ID <span style="color:#f87171;">*</span></label>
            <input type="email" id="secEmail" name="email" placeholder="you@example.com" required data-required="true">
          </div>
          <div>
            <label for="secPhone">Contact Number <span style="color:#f87171;">*</span></label>
            <input type="tel" id="secPhone" name="phone" placeholder="10-digit mobile number" required data-required="true" minlength="10" maxlength="10">
          </div>
        </div>

        <div class="form-group" style="display: grid; grid-template-columns: 1fr 1fr; gap: 14px;">
          <div>
            <label for="secInsta">Instagram Handle (Optional)</label>
            <input type="text" id="secInsta" name="instagram" placeholder="@username">
          </div>
          <div>
            <label for="secSchool">School/College <span style="color:#f87171;">*</span></label>
            <input type="text" id="secSchool" name="schoolCollege" placeholder="Enter your school or college" required data-required="true">
          </div>
        </div>

        <div class="form-group">
          <label for="secAddress">Full Residential Address</label>
          <input type="text" id="secAddress" name="residentialAddress" placeholder="Your residential address">
        </div>

        <div class="form-group" style="display: grid; grid-template-columns: 1fr 1fr; gap: 14px;">
          <div>
            <label for="secDob">Date of Birth <span style="color:#f87171;">*</span></label>
            <input type="date" id="secDob" name="dob" required data-required="true" style="color-scheme: dark;">
          </div>
          <div>
            <label for="secGrade">Grade <span style="color:#f87171;">*</span></label>
            <select id="secGrade" name="grade" required data-required="true">
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

        <div class="form-group">
          <label for="secExp">Previous MUN / Leadership Experiences</label>
          <textarea id="secExp" name="previousExperiences" placeholder="List your relevant MUN or leadership roles" style="resize: vertical; min-height: 60px;"></textarea>
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
          <h3 style="font-size: 1.1rem; color: #ffffff; margin: 0;">Role &amp; Experience</h3>
          <p style="font-size: 0.75rem; color: rgba(255,255,255,0.6); margin: 4px 0 0 0;">Choose a position and upload your portfolio</p>
        </div>

        <div class="form-group">
          <label for="secPosition">Which position are you applying for? <span style="color:#f87171;">*</span></label>
          <select id="secPosition" name="position" required data-required="true" style="font-size: 0.88rem; padding: 11px 14px;">
            <option value="" disabled selected>Choose a position...</option>
            <option value="Secretary-General">Secretary-General</option>
            <option value="Deputy Secretary-General">Deputy Secretary-General</option>
            <option value="Director-General">Director-General</option>
            <option value="USG Delegate Affairs (with experience)">USG Delegate Affairs (with experience)</option>
            <option value="USG Logistics/Operations">USG Logistics/Operations</option>
            <option value="USG Marketing & Outreach (with experience)">USG Marketing &amp; Outreach (with experience)</option>
            <option value="USG Sponsorships/Partnerships">USG Sponsorships/Partnerships</option>
            <option value="USG Design & Media (with experience)">USG Design &amp; Media (with experience)</option>
            <option value="USG IT/Technical">USG IT/Technical</option>
            <option value="USG Hospitality">USG Hospitality</option>
            <option value="USG Policy (with experience)">USG Policy (with experience)</option>
            <option value="Other">Other</option>
          </select>
        </div>

        <div class="form-group">
          <label for="secWhy">Why do you want to join Resolve Secretariat? <span style="color:#f87171;">*</span></label>
          <textarea id="secWhy" name="whyJoin" placeholder="Share your motivation for joining the Secretariat" required data-required="true" style="resize: vertical; min-height: 80px;"></textarea>
        </div>

        <div class="form-group">
          <label for="secContribution">What do you think you can contribute to this specific role? <span style="color:#f87171;">*</span></label>
          <textarea id="secContribution" name="contribution" placeholder="Describe your skills and vision for this position" required data-required="true" style="resize: vertical; min-height: 80px;"></textarea>
        </div>

        <div class="form-group">
          <label for="secHours">How many hours per day can you realistically commit? <span style="color:#f87171;">*</span></label>
          <input type="text" id="secHours" name="dailyCommitment" placeholder="e.g. 2–3 hours per day" required data-required="true">
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
          <button type="submit" class="btn-next" id="secSubmitBtn" style="background: linear-gradient(135deg, #6366f1, #a855f7); font-weight: 700;">Submit Application</button>
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
      <div class="modal-pretitle">RESOLVE MUN 2.0</div>
      <h2 class="modal-title">EB APPLICATIONS</h2>
      <span class="modal-subtitle">Apply to chair a committee</span>
    </div>
    
    <form id="ebRegForm">
      <!-- STEP 1: PERSONAL DETAILS -->
      <div class="form-step active" id="ebStep1">
        <div class="form-group">
          <label for="ebName">Full Name</label>
          <input type="text" id="ebName" required data-required="true" autocomplete="name">
        </div>
        
        <div class="form-group" style="display: grid; grid-template-columns: 1fr 1fr; gap: 14px;">
          <div>
            <label for="ebPhone">Phone (WhatsApp)</label>
            <input type="tel" id="ebPhone" required data-required="true" autocomplete="tel" minlength="10" maxlength="10" title="Please enter a valid 10-digit phone number">
          </div>
          <div>
            <label for="ebEmail">Email Address</label>
            <input type="email" id="ebEmail" required data-required="true" autocomplete="email">
          </div>
        </div>

        <div class="form-group" style="display: grid; grid-template-columns: 1fr 1fr; gap: 14px;">
          <div>
            <label for="ebDob">Date of Birth</label>
            <input type="date" id="ebDob" required data-required="true" autocomplete="bday">
          </div>
          <div>
            <label for="ebReferral">Referral Code (Optional)</label>
            <input type="text" id="ebReferral" placeholder="e.g. RES-123" autocomplete="off">
          </div>
        </div>

        <div class="form-group">
          <label for="ebInst">Institution / School / College</label>
          <input type="text" id="ebInst" required data-required="true">
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
          <select id="ebRole" required data-required="true">
            <option value="" disabled selected>Select a role</option>
            <option value="Chairperson">Chairperson</option>
            <option value="Vice-Chairperson">Vice-Chairperson</option>
            <option value="Rapporteur">Rapporteur</option>
          </select>
        </div>

        <div class="form-group">
          <label for="ebMunCount">Number of MUNs attended</label>
          <select id="ebMunCount" required data-required="true">
            <option value="" disabled selected>Select an option</option>
            <option value="15-20">15-20</option>
            <option value="21-30">21-30</option>
            <option value="31-50">31-50</option>
            <option value="51+">51 &amp; More</option>
          </select>
        </div>

        <div class="form-group">
          <label for="ebExp">MUN Experience (Detailed Summary)</label>
          <textarea id="ebExp" required data-required="true" style="min-height: 80px;"></textarea>
        </div>

        <div class="form-group">
          <label for="ebWhy">Why should we select you?</label>
          <textarea id="ebWhy" required data-required="true" style="min-height: 70px;"></textarea>
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
          <label for="ebPref1">Preference 1</label>
          <select id="ebPref1" required data-required="true">
            <option value="" disabled selected>Select Committee</option>
            <option value="DISEC">DISEC</option>
            <option value="LOK SABHA">Lok Sabha</option>
            <option value="UNHRC">UNHRC</option>
            <option value="UNSC">UNSC</option>
            <option value="COMMITTEE X">Committee X</option>
            <option value="IP (International Press)">IP (International Press)</option>
          </select>
        </div>

        <div class="form-group">
          <label for="ebPref2">Preference 2</label>
          <select id="ebPref2" required data-required="true">
            <option value="" disabled selected>Select Committee</option>
            <option value="DISEC">DISEC</option>
            <option value="LOK SABHA">Lok Sabha</option>
            <option value="UNHRC">UNHRC</option>
            <option value="UNSC">UNSC</option>
            <option value="COMMITTEE X">Committee X</option>
            <option value="IP (International Press)">IP (International Press)</option>
          </select>
        </div>

        <div class="form-group">
          <label for="ebCv">Upload CV / Portfolio (PDF or Image)</label>
          <label class="file-upload-wrapper" for="ebCv">
            <span class="file-upload-btn">Choose File</span>
            <span class="file-name">No file chosen</span>
            <input type="file" id="ebCv" class="file-upload-input" accept=".pdf,image/*" required data-required="true" style="display: none;">
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

<!-- DELEGATION REGISTRATION MODAL (1:1 DELEGATION GOOGLE FORM) -->
<div class="modal-overlay" id="delModal">
  <div class="modal-content" style="max-width: 680px; max-height: 90vh; overflow-y: auto;">
    <button class="modal-close" id="closeDelModal" aria-label="Close">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
        <line x1="18" y1="6" x2="6" y2="18"></line>
        <line x1="6" y1="6" x2="18" y2="18"></line>
      </svg>
    </button>
    
    <div class="modal-header">
      <div class="modal-pretitle">RESOLVE MUN 2.0 · CONTINGENT</div>
      <h2 class="modal-title">DELEGATION REGISTRATION</h2>
      <span class="modal-subtitle">Minimum 6 Delegates · ₹2,200/Delegate · Compete for ₹25,000 Best Delegation Prize</span>
    </div>
    
    <form id="delRegForm" novalidate>
      <!-- STEP 1: INSTITUTION DETAILS -->
      <div class="form-step active" id="delStep1">
        <div class="form-group">
          <label for="delInstName">School / College / Delegation Name <span style="color:#f87171;">*</span></label>
          <input type="text" id="delInstName" name="instName" placeholder="Enter your Institution or Delegation Name" required data-required="true">
        </div>
        
        <div class="form-group">
          <label for="delAdviserName">Head Delegate / Faculty Adviser Full Name <span style="color:#f87171;">*</span></label>
          <input type="text" id="delAdviserName" name="adviserName" placeholder="Enter Head Delegate or Faculty Adviser Name" required data-required="true">
        </div>

        <div class="form-group" style="display: grid; grid-template-columns: 1fr 1fr; gap: 14px;">
          <div>
            <label for="delAdviserPhone">Head Delegate / Adviser Phone <span style="color:#f87171;">*</span></label>
            <input type="tel" id="delAdviserPhone" name="adviserPhone" placeholder="10-digit mobile number" required data-required="true" minlength="10" maxlength="10" pattern="[0-9]{10}" title="Please enter a valid 10-digit phone number">
          </div>
          <div>
            <label for="delAdviserEmail">Head Delegate / Adviser Email <span style="color:#f87171;">*</span></label>
            <input type="email" id="delAdviserEmail" name="adviserEmail" placeholder="you@example.com" required data-required="true">
          </div>
        </div>

        <div class="form-group" style="display: grid; grid-template-columns: 1fr 1fr; gap: 14px;">
          <div>
            <label for="delSize">Number of Delegates (Min 6) <span style="color:#f87171;">*</span></label>
            <input type="number" id="delSize" name="size" min="6" max="50" value="6" required data-required="true" oninput="updateDelPrice(); updateDelegateFields();">
          </div>
          <div>
            <label for="delReferral">Referral Code (Optional)</label>
            <input type="text" id="delReferral" name="referralCode" placeholder="e.g. RES-123">
          </div>
        </div>

        <button type="button" class="btn-next btn-full-width" onclick="nextDelStep(2)">
          Next: Delegation Roster
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
        </button>
      </div>

      <!-- STEP 2: DELEGATE DETAILS -->
      <div class="form-step" id="delStep2">
        <a href="#" onclick="showCustomAlert('Country Matrix Coming Soon!', 'default')" class="btn-matrix" style="margin-bottom: 16px;">
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/></svg>
          Country Matrices
        </a>
        <div id="delegateInputsContainer" style="max-height: 320px; overflow-y: auto; padding-right: 8px; margin-bottom: 16px;">
          <!-- Dynamic delegate fields will be injected here -->
        </div>

        <div class="form-actions">
          <button type="button" class="btn-back" onclick="nextDelStep(1)">Back</button>
          <button type="button" class="btn-next" onclick="nextDelStep(3)">Proceed to Payment</button>
        </div>
      </div>

      <!-- STEP 3: PAYMENT & CONFIRMATION -->
      <div class="form-step" id="delStep3">
        <div class="payment-banner" style="text-align: center; margin-bottom: 14px;">
          <span style="display: inline-block; font-size: 0.65rem; font-weight: 700; text-transform: uppercase; letter-spacing: 0.12em; color: #60a5fa; background: rgba(96, 165, 250, 0.1); border: 1px solid rgba(96, 165, 250, 0.25); padding: 3px 10px; border-radius: 9999px; margin-bottom: 6px;">Delegation Registration</span>
          <h3 id="delTotalPriceDisplay" style="font-size: 1.4rem; font-weight: 800; color: #ffffff; letter-spacing: -0.02em; margin: 0;">Total Amount: ₹13,200</h3>
          <p id="delPerDelegateNote" style="font-size: 0.68rem; opacity: 0.7; margin-top: 4px;">(₹2,200 per enrolled delegate · Minimum 6 delegates)</p>
          <p class="non-refundable-notice" style="font-size: 0.65rem; color: #60a5fa; opacity: 0.9; margin-top: 6px; letter-spacing: 0.08em; text-transform: uppercase; font-weight: 600;">Payment is non-refundable once submitted</p>
        </div>

        <div class="payment-card">
          <div class="form-group" style="margin-bottom: 0;">
            <label style="text-align: center; margin-bottom: 10px; font-size: 0.65rem; letter-spacing: 0.16em; opacity: 0.7; font-weight: 700;">1. SCAN NAVI / UPI QR CODE VIA ANY UPI APP</label>
            <div style="text-align: center;">
              <div class="qr-container" style="display: inline-block; padding: 10px; background: #fff; border-radius: 12px;">
                <img id="delPaymentQRImage" src="https://api.qrserver.com/v1/create-qr-code/?size=320x320&data=upi%3A%2F%2Fpay%3Fpa%3D6301550628%40nyes%26pn%3DBejugam%2520Aditya%26am%3D13200%26cu%3DINR&bgcolor=ffffff&color=05060c&margin=1" alt="Delegation Payment QR Code" style="width: 160px; height: 160px; display: block; border-radius: 6px;">
              </div>

              <div class="upi-supported-apps">
                <span class="upi-app-pill">Navi</span>
                <span class="upi-app-pill">GPay</span>
                <span class="upi-app-pill">PhonePe</span>
                <span class="upi-app-pill">Paytm</span>
                <span class="upi-app-pill">BHIM</span>
              </div>

              <div class="upi-box">
                <span id="delUpiID">6301550628@nyes</span>
                <button type="button" class="refresh-qr-btn" onclick="const size = parseInt(document.getElementById('delSize').value) || 6; generateDynamicQR((size * (window.__siteSettings?.delegationFee || 2200)).toString(), 'delPaymentQRImage', 'delUpiID')" title="Regenerate QR">
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="23 4 23 10 17 10"></polyline><polyline points="1 20 1 14 7 14"></polyline><path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"></path></svg>
                </button>
                <button type="button" class="copy-btn" onclick="copyDelUPI()" title="Copy UPI ID">
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path></svg>
                </button>
              </div>
              <span style="display: block; font-size: 0.68rem; color: #a1a1aa; margin-top: 2px;">Verified Payee: <strong style="color: #fff;">Bejugam Aditya</strong></span>
            </div>
          </div>

          <div class="form-group" style="margin-top: 16px;">
            <label for="delTxnID">2. TRANSACTION / UTR / REFERENCE ID <span style="color:#f87171;">*</span></label>
            <input type="text" id="delTxnID" placeholder="Enter UPI Transaction ID / 12-digit UTR" required data-required="true">
          </div>

          <div class="form-group">
            <label>3. UPLOAD PAYMENT SCREENSHOT <span style="color:#f87171;">*</span></label>
            <label class="file-upload-wrapper" for="delDriveLink">
              <span class="file-upload-btn">Choose File</span>
              <span class="file-name" id="delDriveFileName">No file chosen</span>
              <input type="file" id="delDriveLink" class="file-upload-input" accept="image/*,.pdf" required data-required="true" style="display: none;">
            </label>
            <div id="delScreenshotPreview" style="display: none;" class="payment-screenshot-preview"></div>
          </div>

          <div class="form-group">
            <label for="delUTR">4. ADDITIONAL INFO / QUERIES (OPTIONAL)</label>
            <input type="text" id="delUTR" placeholder="Any notes or questions for the Secretariat">
          </div>

          <div style="margin-top: 14px; padding: 10px 12px; border-radius: 8px; background: rgba(255,255,255,0.02); border: 1px solid rgba(255,255,255,0.06); text-align: center;">
            <p style="font-size: 0.66rem; color: #94a3b8; font-family: ui-monospace, monospace; margin: 0; text-transform: uppercase; letter-spacing: 0.05em;">Meridian School, Kompally, Hyderabad</p>
            <p style="font-size: 0.62rem; color: #64748b; margin: 3px 0 0 0;">Conference Dates: 27th – 29th November 2026</p>
          </div>
        </div>

        <div class="form-actions" style="margin-top: 14px;">
          <button type="button" class="btn-back" onclick="nextDelStep(2)">Back</button>
          <button type="submit" class="btn-next">Submit Delegation</button>
        </div>
        <p class="terms-confirmation" style="font-size: 0.64rem; color: #64748b; text-align: center; margin-top: 10px;">
          By submitting, you agree to the <a href="#" onclick="openTermsModal('delegate'); return false;" style="color: #60a5fa; text-decoration: underline;">Delegate Terms &amp; Conditions</a>.
        </p>
      </div>
    </form>
  </div>
</div>
`;
