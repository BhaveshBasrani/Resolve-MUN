
  function isIndianPhoneValid(val) {
    if (!val) return false;
    let d = String(val).replace(/[^0-9]/g, '');
    if (d.length === 12 && d.startsWith('91')) d = d.slice(2);
    return d.length === 10 && /^[6-9]\d{9}$/.test(d);
  }

  function sendAbandonedDraftLead(formType, name, email, phone) {
    if (!email || !email.includes('@')) return;
    try {
      fetch(GOOGLE_APP_SCRIPT_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'text/plain' },
        body: JSON.stringify({
          action: 'SAVE_DRAFT_LEAD',
          fullName: name || 'Prospect',
          email: email,
          phone: phone || '',
          formType: formType,
          step: 'Step 1: Personal Details'
        })
      }).catch(() => {});
    } catch(e) {}
  }
(function () {
  if (typeof window !== 'undefined' && window.__archiveScriptInitialized) return;
  if (typeof window !== 'undefined') window.__archiveScriptInitialized = true;


  window.isLive = false;
  window.RECAPTCHA_SITE_KEY = "6LesB7gtAAAAAPTHA-4HMMhWytZLAV0yE4Jd7OcJ";

  // ==========================================
  // UTILITY FUNCTIONS (QR & VALIDATION)
  // ==========================================

  const DELEGATE_BASE_FEE = 2799;
  const REFERRAL_CODE_PRICING = {
    SBXS2026: 2599,
    AETHERXR2026: 2499,
    DIYA: 2499,
    ICFAI: 2000,
    NYA200: 2699,
    SOLARIS: 2599,
    PROMOTION: 2349,
    UNT100: 2349,
    HET100: 2399,
    YCE200: 2399,
    AN69: 2399,
    ATHENAXR2026: 2699,
    STYLE100: 2599,
    TTG300: 2300,
    PARNIKA200: 2449,
    RAYON67: 2349,
    IRISXRESOLVE: 2499,
    ABHINAYA200: 2499,
    SKA200: 1999,

  };

  function normalizeReferralCode(code) {
    return (code || '').trim().toUpperCase();
  }

  function getDelegateFeeFromReferral() {
    const referralInput = document.getElementById('regReferral');
    const normalizedCode = normalizeReferralCode(referralInput ? referralInput.value : '');
    return REFERRAL_CODE_PRICING[normalizedCode] || DELEGATE_BASE_FEE;
  }

  function updateDelegatePaymentUI() {
    const fee = getDelegateFeeFromReferral();
    const feeDisplay = document.getElementById('regFeeDisplay');
    if (feeDisplay) {
      feeDisplay.innerText = `Registration Fee: ₹${fee}`;
    }
    generateDynamicQR(String(fee), 'paymentQRImage', 'upiID');

    const referralVal = normalizeReferralCode(document.getElementById('regReferral')?.value || '');
    const feedbackEl = document.getElementById('referralFeedback');
    if (feedbackEl) {
      if (!referralVal) {
        feedbackEl.innerText = '';
        feedbackEl.style.color = 'var(--muted)';
      } else if (REFERRAL_CODE_PRICING[referralVal]) {
        const applied = REFERRAL_CODE_PRICING[referralVal];
        const savings = DELEGATE_BASE_FEE - applied;
        feedbackEl.innerText = `Valid code applied — Pay ₹${applied}${savings > 0 ? ` (You save ₹${savings})` : ''}`;
        feedbackEl.style.color = '#22c55e';
      } else {
        feedbackEl.innerText = 'Referral code not recognized';
        feedbackEl.style.color = '#ff6b6b';
      }
    }
  }

  function refreshDelegatePaymentQR() {
    updateDelegatePaymentUI();
  }

  // 1. Dynamic QR Generator (Ad-Blocker Safe & QuickChart API)
  async function generateDynamicQR(amountStr, imgElementId, upiTextElementId) {
    let cleanAmount = "2199";
    if (amountStr) {
      cleanAmount = String(amountStr).replace(/[^0-9.]/g, '') || "2199";
    }

    const currentPayee = {
      pa: "bhoomianilbasrani@okhdfcbank",
      pn: "Bhoomi Basrani"
    };

    const upiText = document.getElementById(upiTextElementId);
    if (upiText) {
      upiText.innerText = currentPayee.pa;
    }

    const qrImage = document.getElementById(imgElementId);
    if (!qrImage) return;

    const upiString = `upi://pay?pa=${currentPayee.pa}&pn=${encodeURIComponent(currentPayee.pn)}&am=${cleanAmount}&cu=INR`;
    const safeEncodedData = encodeURIComponent(upiString);

    qrImage.src = `https://quickchart.io/qr?size=320&text=${safeEncodedData}`;
  }

  // 2. Form Validation Error Handling
  function showError(input, message) {
    if (!input) return;

    input.style.borderColor = '#ff3b30';

    let errorSpan = input.nextElementSibling;
    if (!errorSpan || !errorSpan.classList.contains('error-message')) {
      errorSpan = document.createElement('span');
      errorSpan.className = 'error-message';
      errorSpan.style.color = '#ff3b30';
      errorSpan.style.fontSize = '12px';
      errorSpan.style.display = 'block';
      errorSpan.style.marginTop = '5px';
      input.parentNode.insertBefore(errorSpan, input.nextSibling);
    }
    errorSpan.innerText = message;
  }

  function clearError(input) {
    if (!input) return;

    input.style.borderColor = '';
    const errorSpan = input.nextElementSibling;
    if (errorSpan && errorSpan.classList.contains('error-message')) {
      errorSpan.remove();
    }
  }


  /**
   * CUSTOM ALERT SYSTEM
   */
  function showCustomAlert(message, type = 'default', duration = 4000) {
    const container = document.getElementById('custom-alert-container');
    if (!container) return;

    const alert = document.createElement('div');
    alert.className = `custom-alert ${type}`;

    alert.innerHTML = `
      <div class="custom-alert-content">${message}</div>
      <button class="custom-alert-close">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <line x1="18" y1="6" x2="6" y2="18"></line>
          <line x1="6" y1="6" x2="18" y2="18"></line>
        </svg>
      </button>
    `;

    container.appendChild(alert);

    const closeBtn = alert.querySelector('.custom-alert-close');
    const closeAlert = () => {
      alert.classList.add('fade-out');
      setTimeout(() => alert.remove(), 350);
    };

    if (closeBtn) closeBtn.onclick = closeAlert;
    setTimeout(closeAlert, duration);
  }

  // Override window.alert
  var originalAlert = window.alert;
  window.alert = function (message) {
    showCustomAlert(message);
  };

  // Submission spinner and simple client-side validation helpers
  function showSpinner() {
    const s = document.getElementById('submitSpinner');
    if (s) s.style.display = 'flex';
  }

  function hideSpinner() {
    const s = document.getElementById('submitSpinner');
    if (s) s.style.display = 'none';
  }

  function validateForm(formEl) {
    if (!formEl) return true;
    let valid = true;
    const inputs = formEl.querySelectorAll('input[required], select[required], textarea[required]');
    inputs.forEach(input => {
      clearError(input);
      const val = input.value ? String(input.value).trim() : '';
      if (!val) {
        showError(input, 'This field is required.');
        valid = false;
        return;
      }

      // Email validation
      if (input.type === 'email' || /email/i.test(input.id) || /email/i.test(input.name)) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(val)) {
          showError(input, 'Enter a valid email address.');
          valid = false;
          return;
        }
      }

      // Phone validation
      if (input.type === 'tel') {
        const phoneVal = val.replace(/\D/g, '');
        const phoneRegex = /^[1-9][0-9]{9}$/;
        if (!phoneRegex.test(phoneVal)) {
          showError(input, 'Enter a valid 10-digit phone number.');
          valid = false;
          return;
        }
      }

      // UTR validation (12 digits expected if field mentions UTR)
      if (/utr/i.test(input.id) || /utr/i.test(input.name) || /txn|transaction/i.test(input.id) && /utr/i.test(input.placeholder || '')) {
        const digits = val.replace(/\D/g, '');
        if (digits.length !== 12) {
          showError(input, 'Enter a valid 12-digit UTR.');
          valid = false;
          return;
        }
      }

      // File input validation (if required)
      if (input.type === 'file') {
        if (input.files && input.files.length > 0) {
          const f = input.files[0];
          const maxSize = 5 * 1024 * 1024; // 5MB
          const allowed = ['image/png', 'image/jpeg', 'application/pdf'];
          if (f.size > maxSize) {
            showError(input, 'File too large (max 5MB).');
            valid = false;
            return;
          }
          if (allowed.indexOf(f.type) === -1) {
            showError(input, 'Unsupported file type (jpg, png, pdf allowed).');
            valid = false;
            return;
          }
        }
      }
    });

    if (!valid) showCustomAlert('Please correct the highlighted fields before submitting.', 'error', 4000);
    return valid;
  }

  // Lightweight haptic + smooth interaction handler
  (function initHaptics() {
    try {
      const selector = '.btn-primary, .btn-secondary, .copy-btn, .nav-cta, .committee-card, .refresh-qr-btn';
      document.addEventListener('pointerdown', (e) => {
        const el = e.target.closest ? e.target.closest(selector) : null;
        if (!el) return;
        // brief vibration where supported
        if (navigator.vibrate) navigator.vibrate(8);
        // add visual press class
        el.classList && el.classList.add('interaction-press');
        setTimeout(() => el.classList && el.classList.remove('interaction-press'), 160);
      }, { passive: true });
    } catch (err) { /* noop */ }
  })();

  /**
   * RECAPTCHA v3 EXECUTION
   * This function gets a token from Google and should be called before form submission.
   */
  async function getRecaptchaToken(actionName) {
    if (typeof window !== 'undefined' && window.matchMedia && window.matchMedia('(max-width: 767px)').matches) {
      return null;
    }
    return new Promise((resolve, reject) => {
      if (typeof grecaptcha === 'undefined') {
        console.error('reCAPTCHA not loaded');
        resolve(null);
        return;
      }
      grecaptcha.ready(() => {
        grecaptcha.execute(window.RECAPTCHA_SITE_KEY, { action: actionName })
          .then(token => resolve(token))
          .catch(err => {
            console.error('reCAPTCHA execution failed:', err);
            resolve(null);
          });
      });
    });
  }

  // INITIAL LOADING SCREEN - Bulletproof dismissal
  let loaderDismissed = false;
  function dismissLoadingScreen() {
    if (loaderDismissed) return;
    loaderDismissed = true;
    const loader = document.getElementById('loading-screen');
    if (loader) {
      loader.classList.add('hidden');
      setTimeout(() => {
        if (loader) loader.style.display = 'none';
      }, 800);
    }
    if (document.body) {
      document.body.classList.add('loaded');
      document.body.style.overflow = '';
    }

    // AUTO-OPEN REGISTRATION VIA URL PARAMETER ?open=registration
    try {
      const urlParams = new URLSearchParams(window.location.search);
      const openParam = urlParams.get('open');

      if (openParam === 'registration' || openParam === 'selection') {
        setTimeout(openSelection, 500);
      } else if (openParam === 'delegate') {
        setTimeout(openRegistration, 500);
      } else if (openParam === 'eb') {
        setTimeout(openEbRegistration, 500);
      } else if (openParam === 'oc') {
        setTimeout(openOcRegistration, 500);
      } else if (openParam === 'delegation') {
        setTimeout(openDelRegistration, 500);
      }
    } catch (_) { }
  }
  // Submission spinner and simple client-side validation helpers
  function showSpinner() {
    const s = document.getElementById('submitSpinner');
    if (s) s.style.display = 'flex';
  }

  function hideSpinner() {
    const s = document.getElementById('submitSpinner');
    if (s) s.style.display = 'none';
  }

  function validateForm(formEl) {
    if (!formEl) return true;
    let valid = true;
    const inputs = formEl.querySelectorAll('input[required], select[required], textarea[required]');
    inputs.forEach(input => {
      clearError(input);
      const val = input.value ? String(input.value).trim() : '';
      if (!val) {
        showError(input, 'This field is required.');
        valid = false;
        return;
      }

      // Email validation
      if (input.type === 'email' || /email/i.test(input.id) || /email/i.test(input.name)) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(val)) {
          showError(input, 'Enter a valid email address.');
          valid = false;
          return;
        }
      }

      // Phone validation
      if (input.type === 'tel') {
        const phoneVal = val.replace(/\D/g, '');
        const phoneRegex = /^[1-9][0-9]{9}$/;
        if (!phoneRegex.test(phoneVal)) {
          showError(input, 'Enter a valid 10-digit phone number.');
          valid = false;
          return;
        }
      }

      // UTR validation (12 digits expected if field mentions UTR)
      if (/utr/i.test(input.id) || /utr/i.test(input.name) || /txn|transaction/i.test(input.id) && /utr/i.test(input.placeholder || '')) {
        const digits = val.replace(/\D/g, '');
        if (digits.length !== 12) {
          showError(input, 'Enter a valid 12-digit UTR.');
          valid = false;
          return;
        }
      }

      // File input validation (if required)
      if (input.type === 'file') {
        if (input.files && input.files.length > 0) {
          const f = input.files[0];
          const maxSize = 5 * 1024 * 1024; // 5MB
          const allowed = ['image/png', 'image/jpeg', 'application/pdf'];
          if (f.size > maxSize) {
            showError(input, 'File too large (max 5MB).');
            valid = false;
            return;
          }
          if (allowed.indexOf(f.type) === -1) {
            showError(input, 'Unsupported file type (jpg, png, pdf allowed).');
            valid = false;
            return;
          }
        }
      }
    });

    if (!valid) showCustomAlert('Please correct the highlighted fields before submitting.', 'error', 4000);
    return valid;
  }

  // Lightweight haptic + smooth interaction handler
  (function initHaptics() {
    try {
      const selector = '.btn-primary, .btn-secondary, .copy-btn, .nav-cta, .committee-card, .refresh-qr-btn';
      document.addEventListener('pointerdown', (e) => {
        const el = e.target.closest ? e.target.closest(selector) : null;
        if (!el) return;
        // brief vibration where supported
        if (navigator.vibrate) navigator.vibrate(8);
        // add visual press class
        el.classList && el.classList.add('interaction-press');
        setTimeout(() => el.classList && el.classList.remove('interaction-press'), 160);
      }, { passive: true });
    } catch (err) { /* noop */ }
  })();

  /**
   * RECAPTCHA v3 EXECUTION
   * This function gets a token from Google and should be called before form submission.
   */
  async function getRecaptchaTokenLegacy(actionName) {
    return new Promise((resolve, reject) => {
      if (typeof grecaptcha === 'undefined') {
        console.error('reCAPTCHA not loaded');
        resolve(null);
        return;
      }
      grecaptcha.ready(() => {
        grecaptcha.execute(window.RECAPTCHA_SITE_KEY, { action: actionName })
          .then(token => resolve(token))
          .catch(err => {
            console.error('reCAPTCHA execution failed:', err);
            resolve(null);
          });
      });
    });
  }

  // INITIAL LOADING SCREEN - Bulletproof dismissal
  let legacyLoaderDismissed = false;
  function dismissLoadingScreenLegacy() {
    if (legacyLoaderDismissed) return;
    legacyLoaderDismissed = true;
    const loader = document.getElementById('loading-screen');
    if (loader) {
      loader.classList.add('hidden');
      setTimeout(() => {
        if (loader) loader.style.display = 'none';
      }, 800);
    }
    if (document.body) {
      document.body.classList.add('loaded');
      document.body.style.overflow = '';
    }

    // AUTO-OPEN REGISTRATION VIA URL PARAMETER ?open=registration
    try {
      const urlParams = new URLSearchParams(window.location.search);
      const openParam = urlParams.get('open');

      if (openParam === 'registration' || openParam === 'selection') {
        setTimeout(openSelection, 500);
      } else if (openParam === 'delegate') {
        setTimeout(openRegistration, 500);
      } else if (openParam === 'eb') {
        setTimeout(openEbRegistration, 500);
      } else if (openParam === 'oc') {
        setTimeout(openOcRegistration, 500);
      } else if (openParam === 'delegation') {
        setTimeout(openDelRegistration, 500);
      }
    } catch (_) { }
  }

  if (document.readyState === 'complete') {
    setTimeout(dismissLoadingScreen, 300);
  } else {
    window.addEventListener('load', () => setTimeout(dismissLoadingScreen, 300));
  }
  // Hard safety timeout
  setTimeout(dismissLoadingScreen, 600);

  // REGISTRATION MODAL LOGIC
  // =============================================
  // OC APPLICATION LINK — Update this URL to change where the OC Apply button links to
  const OC_APPLICATION_LINK = '#oc-applications'; // Replace with actual form URL
  // =============================================
  const ocApplyBtn = document.getElementById('ocApplyBtn');
  if (ocApplyBtn) {
    ocApplyBtn.setAttribute('href', OC_APPLICATION_LINK);
    ocApplyBtn.addEventListener('click', function (e) {
      if (OC_APPLICATION_LINK === '#oc-applications') {
        e.preventDefault();
        openOcRegistration();
      }
    });
  }

  const regModal = document.getElementById('regModal');
  const selectionModal = document.getElementById('selectionModal');

  function openCommModal(title, icon, bgPath) {
    // Reset modal content
    const mIcon = document.getElementById('commModalIcon');
    const mTitle = document.getElementById('commModalTitle');
    const mAgenda = document.getElementById('commModalAgenda');
    const mText = document.getElementById('commModalText');
    const waitlist = document.getElementById('waitlistContainer');

    mIcon.innerText = "COMMITTEE";
    mTitle.innerText = title;
    mTitle.style.textTransform = 'uppercase';
    mTitle.style.letterSpacing = '-0.01em';

    if (title === 'Background Guides') {
      mIcon.innerText = "OVERVIEW";
      mAgenda.innerText = "CRAFTING THE BLUEPRINT";
      mText.innerText = "The Secretariat is currently finalizing the comprehensive background guides and study material to ensure all delegates have the depth required for high-level diplomatic discourse. These resources will be released as per the official summit timeline.";
      waitlist.style.display = 'none';
    } else if (title === 'Delegate Guide') {
      mIcon.innerText = "HANDBOOK";
      mAgenda.innerText = "ESTABLISHING PROTOCOL";
      mText.innerText = "From diplomatic etiquette to the intricacies of the rules of procedure, the official Resolve 2026 handbook is being polished to provide you with a seamless conference experience. The complete briefing will be available shortly.";
      waitlist.style.display = 'none';
    } else if (title === 'LOK SABHA') {
      mIcon.innerText = "AGENDA";
      mAgenda.innerText = "Deliberation on Border Security & Trade";
      mText.innerText = "Deliberation on the recent developments in border security with special emphasis on India’s trade relations and foreign policy amidst the west Asian conflict with recent developments.";
      waitlist.style.display = 'none';
    } else if (title === 'CCC') {
      mIcon.innerText = "AGENDA";
      mAgenda.innerText = "Freeze Date";
      mText.innerText = "Freeze date: 12 July, 2026";
      waitlist.style.display = 'none';
    } else if (title === 'UNHRC') {
      mIcon.innerText = "AGENDA";
      mAgenda.innerText = "Human Rights of Seafarers";
      mText.innerText = "Promoting and protecting the enjoyment of human rights by seafarers.";
      waitlist.style.display = 'none';
    } else if (title.includes('DISEC') || title === 'DISEC') {
      mIcon.innerText = "AGENDA";
      mAgenda.innerText = "Regulating ASAT & Dual-Use Space Tech (PAROS)";
      mText.innerText = "Discussion on regulating Anti-Satellite Weapons, Offensive Counter-Space capabilities and Dual-Use Space Technologies within the Framework of Preventing an Arms Race in Outer Space (PAROS).";
      waitlist.style.display = 'none';
    } else if (title === 'UNCSW') {
      mIcon.innerText = "AGENDA";
      mAgenda.innerText = "Strengthening Access to Justice";
      mText.innerText = "Deliberation on strengthening access to justice, promoting inclusive legal systems, eliminating discriminatory laws and practices with special emphasis on structural barriers.";
      waitlist.style.display = 'none';
    } else if (title === 'ILLUMINATI') {
      mIcon.innerText = "AGENDA";
      mTitle.innerHTML = 'Illuminati<br>';
      mTitle.style.textTransform = 'none';
      mTitle.style.letterSpacing = '0.02em';
      mAgenda.innerText = "REVEALING THE MANDATE";
      mText.innerText = "Our academic team is meticulously defining the scope of debate for Illuminati. All technical documentation, including the agenda specifics and topic briefs, will be unveiled during the next phase of the summit lifecycle.";
      waitlist.style.display = 'none';
    } else {
      mIcon.innerText = "AGENDA";
      mAgenda.innerText = "REVEALING THE MANDATE";
      mText.innerText = "Our academic team is meticulously defining the scope of debate for " + title + ". All technical documentation, including the agenda specifics and topic briefs, will be unveiled during the next phase of the summit lifecycle.";
      waitlist.style.display = 'none';
    }

    /* Set current background (if any) and toggle BG button */
    window.currentCommBg = bgPath || null;
    var bgBtn = document.getElementById('commModalBgBtn');
    if (bgBtn) {
      if (window.currentCommBg) {
        bgBtn.style.display = 'inline-block';
        bgBtn.onclick = function () { window.open(window.currentCommBg, '_blank'); };
      } else {
        bgBtn.style.display = 'none';
        bgBtn.onclick = null;
      }
    }

    /* ILLUMINATI BYPASS - Now accessible via standard modal logic */
    document.getElementById('commModal').classList.add('active');
    document.body.style.overflow = 'hidden';
  }

  function openTermsModal() {
    const termsModal = document.getElementById('termsModal');
    if (termsModal) {
      termsModal.classList.add('active');
      document.body.style.overflow = 'hidden';
    }
  }

  function closeTermsModal() {
    const termsModal = document.getElementById('termsModal');
    if (termsModal) {
      termsModal.classList.remove('active');
      if (!regModal.classList.contains('active') && !selectionModal.classList.contains('active') && !document.getElementById('commModal').classList.contains('active')) {
        document.body.style.overflow = '';
      }
    }
  }

  function openSelection() {
    const mIcon = document.getElementById('commModalIcon');
    const mTitle = document.getElementById('commModalTitle');
    const mAgenda = document.getElementById('commModalAgenda');
    const mText = document.getElementById('commModalText');
    const waitlist = document.getElementById('waitlistContainer');

    /*
    if (typeof window.isLive !== 'undefined' && !window.isLive) {
      mIcon.innerText = "SUMMIT STATUS";
      mTitle.innerText = "RESOLVE 2026";
      mAgenda.innerText = "REGISTRATIONS OPENING SOON";
      mText.innerText = "The premier diplomatic summit is meticulously preparing its corridors. Join the elite waitlist to receive priority access to delegate allocations, committee preferences, and exclusive early-bird benefits.";
      waitlist.style.display = 'block';
      
      document.getElementById('commModal').classList.add('active');
      document.body.style.overflow = 'hidden';
      return;
    }
    */
    selectionModal.classList.add('active');
    document.body.style.overflow = 'hidden';
  }

  function openCommitteeIntro() {
    const prompt = document.getElementById('committeePrompt');
    const committeeCard = document.querySelector('#committees .committee-card');
    if (!prompt || !committeeCard) return;

    // Ensure any previous timer is cleared and reset state
    window.clearTimeout(window.committeePromptTimer);
    prompt.classList.remove('active');
    prompt.setAttribute('aria-hidden', 'false');

    const navbar = document.getElementById('navbar');
    const navHeight = navbar ? navbar.offsetHeight : 0;

    // On small screens the prompt takes up vertical space — compensate for that so the
    // committee card scrolls into view below the prompt.
    const isMobile = window.innerWidth <= 768;
    const mobilePromptEstimate = isMobile ? Math.round(window.innerHeight * 0.42) : 0;
    const targetTop = Math.max(0, committeeCard.getBoundingClientRect().top + window.scrollY - navHeight - mobilePromptEstimate - 18);
    window.scrollTo({ top: targetTop, behavior: 'smooth' });

    // Add a slight delay before showing the prompt so the scroll completes
    window.setTimeout(() => {
      prompt.classList.add('active');
    }, 450);

    // Allow mobile users to tap the backdrop/text to dismiss quickly.
    if (!prompt.dataset.dismissAttached) {
      prompt.addEventListener('click', (ev) => {
        // only dismiss when tapping the backdrop or the prompt itself
        prompt.classList.remove('active');
        prompt.setAttribute('aria-hidden', 'true');
        window.clearTimeout(window.committeePromptTimer);
      });
      prompt.dataset.dismissAttached = '1';
    }

    window.committeePromptTimer = window.setTimeout(() => {
      prompt.classList.remove('active');
      prompt.setAttribute('aria-hidden', 'true');
    }, isMobile ? 4200 : 3200);
  }

  window.openCommitteeIntro = openCommitteeIntro;

  // Waitlist Logic
  const waitlistForm = document.getElementById('waitlistForm');
  const WAITLIST_STORAGE_KEY = 'resolveMunWaitlist';

  function restoreWaitlistData() {
    const saved = localStorage.getItem(WAITLIST_STORAGE_KEY);
    if (saved) {
      const el = document.getElementById('waitlistEmail');
      if (el) el.value = saved;
    }
  }

  function saveWaitlistData() {
    const el = document.getElementById('waitlistEmail');
    if (el) localStorage.setItem(WAITLIST_STORAGE_KEY, el.value);
  }

  document.addEventListener('DOMContentLoaded', restoreWaitlistData);
  const wEmailEl = document.getElementById('waitlistEmail');
  if (wEmailEl) wEmailEl.addEventListener('input', saveWaitlistData);

  if (waitlistForm) {
    waitlistForm.addEventListener('submit', async function (e) {
      e.preventDefault();
      const btn = document.getElementById('waitlistSubmitBtn');
      const success = document.getElementById('waitlistSuccess');
      const emailInput = document.getElementById('waitlistEmail');
      const email = emailInput.value;

      if (!validateForm(e.target)) return;
      btn.innerText = "Adding...";
      btn.disabled = true;
      showSpinner();

      try {
        const token = await getRecaptchaToken('waitlist_submission');
        const data = {
          type: 'WAITLIST_ENTRY',
          email: email,
          recaptcha_token: token
        };

        // Re-using your existing Google Sheet fetch function with retries
        await submitToGoogleSheetWithRetry(data, { retries: 2, timeoutMs: 10000 });
        // Hide form and show success message smoothly
        waitlistForm.style.display = 'none';
        success.style.display = 'block';
        localStorage.removeItem(WAITLIST_STORAGE_KEY);
      } catch (err) {
        showCustomAlert("Submission Error: " + (err && err.message ? err.message : String(err)), 'error', 7000);
        btn.innerText = "Notify Me";
        btn.disabled = false;
      } finally {
        hideSpinner();
      }
    });
  }

  function closeCommModal() {
    document.getElementById('commModal').classList.remove('active');
    if (!regModal.classList.contains('active') && !selectionModal.classList.contains('active')) {
      document.body.style.overflow = '';
    }
  }

  function closeSelection() {
    selectionModal.classList.remove('active');
    document.body.style.overflow = '';
  }

  const closeSelectionModalBtn = document.getElementById('closeSelectionModal');
  if (closeSelectionModalBtn) closeSelectionModalBtn.onclick = closeSelection;

  function selectPathway(type) {
    /*
    if (typeof window.isLive !== 'undefined' && !window.isLive) {
      if (type === 'oc') {
        openOcRegistration();
      } else if (type === 'eb') {
        openEbRegistration();
      } else {
        openSelection();
      }
      return;
    }
    */
    closeSelection();
    if (type === 'delegate') {
      openRegistration();
    } else if (type === 'delegation') {
      openDelRegistration();
    } else if (type === 'oc') {
      openOcRegistration();
    } else if (type === 'eb') {
      openEbRegistration();
    }
  }

  function openDelRegistration() {
    restoreDelFormData();
    /*
    if (typeof window.isLive !== 'undefined' && !window.isLive) {
      openSelection();
      return;
    }
    */
    const delModal = document.getElementById('delModal');
    if (delModal) {
      delModal.classList.add('active');
      document.body.style.overflow = 'hidden';
    }
  }

  window.addEventListener('click', (event) => {
    if (event.target === selectionModal) closeSelection();
    if (event.target === regModal) closeRegistration();
    const dModal = document.getElementById('delModal');
    const oModal = document.getElementById('ocModal');
    const eModal = document.getElementById('ebModal');
    if (event.target === dModal) closeDelRegistration();
    if (event.target === oModal) closeOcRegistration();
    if (event.target === eModal) closeEbRegistration();
    if (event.target === document.getElementById('commModal')) {
      document.getElementById('commModal').classList.remove('active');
      document.body.style.overflow = '';
    }
    if (event.target === document.getElementById('termsModal')) {
      closeTermsModal();
    }
  });

  const fileToBase64 = (file) => {
    return new Promise((resolve, reject) => {
      const maxSize = 5 * 1024 * 1024; // 5MB
      if (file.size > maxSize) {
        showCustomAlert("⚠️ FILE TOO LARGE: The maximum allowed size is 5MB. Please compress your screenshot.", "error");
        reject(new Error("File too large"));
        return;
      }
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result);
      reader.onerror = (error) => reject(error);
    });
  };

  const GOOGLE_APP_SCRIPT_URL = "https://script.google.com/macros/s/AKfycbxd_EyDHhJY1yokbma62PFcLu1SyBC-QXe32zb8JRIOUaJBowaivqNcgVwqk4HEsxTLpw/exec";

  async function submitToGoogleSheet(data) {
    try {
      const response = await fetch(GOOGLE_APP_SCRIPT_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'text/plain;charset=utf-8' },
        body: JSON.stringify(data)
      });

      const result = await response.json();
      if (!response.ok || !result || result.status !== 'success') {
        throw new Error((result && result.message) ? result.message : 'Submission failed on server.');
      }

      return result;
    } catch (error) {
      console.error('Error submitting to Google Sheets:', error);
      if (error instanceof Error) throw error;
      throw new Error('Failed to connect to the server.');
    }
  }

  // Robust submit with timeout and retries
  async function submitToGoogleSheetWithRetry(data, options = {}) {
    const retries = options.retries ?? 2;
    const timeoutMs = options.timeoutMs ?? 15000;

    for (let attempt = 0; attempt <= retries; attempt++) {
      const controller = new AbortController();
      const id = setTimeout(() => controller.abort(), timeoutMs);
      try {
        const response = await fetch(GOOGLE_APP_SCRIPT_URL, {
          method: 'POST',
          headers: { 'Content-Type': 'text/plain;charset=utf-8' },
          body: JSON.stringify(data),
          signal: controller.signal
        });
        clearTimeout(id);

        const result = await response.json().catch(() => null);
        if (response.ok && result && result.status === 'success') {
          return result;
        }

        const msg = (result && result.message) ? result.message : 'Server rejected the submission';
        throw new Error(msg);
      } catch (err) {
        clearTimeout(id);
        const isLast = attempt === retries;
        if (err.name === 'AbortError') {
          if (isLast) throw new Error('Request timed out. Please try again.');
        } else if (isLast) {
          throw err;
        }
        // backoff before retry
        await new Promise(r => setTimeout(r, 800 * Math.pow(2, attempt)));
      }
    }
  }

  // Modern File Upload Handler
  document.querySelectorAll('.file-upload-input').forEach(input => {
    input.addEventListener('change', function () {
      const wrapper = this.closest('.file-upload-wrapper');
      const fileNameSpan = wrapper.querySelector('.file-name');

      if (this.files && this.files.length > 0) {
        const file = this.files[0];
        const maxSize = 5 * 1024 * 1024; // 5MB

        if (file.size > maxSize) {
          showCustomAlert(`⚠️ ERROR: "${file.name}" exceeds 5MB limit.`, "error");
          this.value = ''; // Reset the input
          fileNameSpan.textContent = "FILE TOO LARGE (MAX 5MB)";
          fileNameSpan.style.color = "#ef4444";
          wrapper.style.borderColor = "#ef4444";
          return;
        }

        fileNameSpan.textContent = file.name;
        fileNameSpan.style.color = 'var(--gold-light)';
        wrapper.style.borderColor = 'var(--gold)';
      } else {
        fileNameSpan.textContent = "No file chosen";
        fileNameSpan.style.color = 'var(--muted)';
        wrapper.style.borderColor = 'rgba(255, 255, 255, 0.1)';
      }
    });
  });

  const closeModal = document.getElementById('closeModal');
  const regForm = document.getElementById('regForm');

  // AUTO-SAVE form fields to localStorage
  const STORAGE_KEY = 'resolveMunRegForm';
  const formFieldIds = [
    'regName', 'regGrade', 'regPhone', 'regEmail', 'regInstitute', 'regAddress',
    'regTransport', 'regDob', 'regReferral', 'regEmergencyName', 'regEmergencyPhone', 'regExp',
    'pref1_committee', 'pref1_port1', 'pref1_port2', 'pref1_role',
    'pref2_committee', 'pref2_port1', 'pref2_port2', 'pref2_role',
    'pref3_committee', 'pref3_port1', 'pref3_port2', 'pref3_role',
    'regTxnID', 'regDriveLink', 'regUTR'
  ];

  function saveFormData() {
    const saved = {};
    formFieldIds.forEach(id => {
      const el = document.getElementById(id);
      if (el) saved[id] = el.value;
    });
    localStorage.setItem(STORAGE_KEY, JSON.stringify(saved));
  }

  function restoreFormData() {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return;
    try {
      const saved = JSON.parse(raw);
      formFieldIds.forEach(id => {
        const el = document.getElementById(id);
        if (el && saved[id]) {
          let val = saved[id];
          if ((id.endsWith('_committee') || id.startsWith('ebPref')) && val === 'LOKSABHA') {
            val = 'LOK SABHA';
          }
          el.value = val;
        }
      });
      // Re-trigger committee UI updates so containers/roles show correctly
      [1, 2, 3].forEach(n => {
        const commVal = saved['pref' + n + '_committee'];
        if (commVal) {
          updatePortfolioOptions(n);
          // Special handling for Portfolios/Role fields that were dynamically generated/hidden
          const port1 = document.getElementById('pref' + n + '_port1');
          const port2 = document.getElementById('pref' + n + '_port2');
          const role = document.getElementById('pref' + n + '_role');
          if (port1 && saved['pref' + n + '_port1']) port1.value = saved['pref' + n + '_port1'];
          if (port2 && saved['pref' + n + '_port2']) port2.value = saved['pref' + n + '_port2'];
          if (role && saved['pref' + n + '_role']) role.value = saved['pref' + n + '_role'];
        }
      });
    } catch (_) { }
  }

  function clearFormData() {
    localStorage.removeItem(STORAGE_KEY);
  }

  // Restore on load
  document.addEventListener('DOMContentLoaded', restoreFormData);

  // Save on every input/change
  formFieldIds.forEach(id => {
    const el = document.getElementById(id);
    if (el) {
      el.addEventListener('input', saveFormData);
      el.addEventListener('change', saveFormData);
    }
  });

  const regReferralInput = document.getElementById('regReferral');
  if (regReferralInput) {
    regReferralInput.addEventListener('input', updateDelegatePaymentUI);
    regReferralInput.addEventListener('change', updateDelegatePaymentUI);
  }

  function openRegistration() {
    restoreFormData();
    /*
    if (typeof window.isLive !== 'undefined' && !window.isLive) {
      openSelection();
      return;
    }
    */
    restoreFormData();
    regModal.classList.add('active');
    document.body.style.overflow = 'hidden';
  }

  function closeRegistration() {
    regModal.classList.remove('active');
    document.body.style.overflow = '';
    // Reset to step 1
    nextStep(1);
    regForm.reset();
  }

  function copyUPI() {
    const upi = document.getElementById('upiID').innerText;
    navigator.clipboard.writeText(upi).then(() => {
      const btn = document.querySelector('#regModal .copy-btn');
      const original = btn.innerHTML;
      btn.innerHTML = '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#22c55e" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>';
      setTimeout(() => btn.innerHTML = original, 2000);
    });
  }

  function nextStep(stepNum) {
    const modal = document.getElementById('regModal');
    const currentActiveStep = modal.querySelector('.form-step.active');
    const currentStepNum = parseInt(currentActiveStep.id.replace('step', ''));

    if (stepNum > currentStepNum) {
      const inputs = currentActiveStep.querySelectorAll('input[required], select[required], textarea[required]');
      let isValid = true;

      inputs.forEach(input => {
        if (input.offsetParent === null) return;

        let inputLineValid = true;
        let errMsg = "This field is required.";

        if (!input.value.trim()) {
          inputLineValid = false;
        } else if (input.id === 'regPhone') {
          const phoneRegex = /^[0-9]{10}$/;
          if (!phoneRegex.test(input.value.trim())) {
            inputLineValid = false;
            errMsg = "Phone number must be 10 digits.";
          }
        }

        if (!inputLineValid) {
          showError(input, errMsg);
          isValid = false;
        } else {
          clearError(input);
        }
      });

      if (currentStepNum === 2) {
        for (let i = 1; i <= 3; i++) {
          const comm = document.getElementById(`pref${i}_committee`).value;
          if (comm && comm !== 'IP') {
            const p1 = document.getElementById(`pref${i}_port1`);
            const p2 = document.getElementById(`pref${i}_port2`);
            if (p1.value.trim().toLowerCase() === p2.value.trim().toLowerCase() && p1.value.trim() !== "") {
              showError(p1, "Portfolios must be unique.");
              showError(p2, "Portfolios must be unique.");
              isValid = false;
            }
          }
        }
      }

      if (!isValid) return;
    }

    if (stepNum === 3) {
      updateDelegatePaymentUI();
    }

    modal.querySelectorAll('.form-step').forEach(step => step.classList.remove('active'));
    const targetStep = modal.querySelector('#step' + stepNum);
    if (targetStep) targetStep.classList.add('active');

    const progressSteps = document.querySelectorAll('#regModal .progress-step');
    progressSteps.forEach((step, idx) => {
      if (idx < stepNum) {
        step.classList.add('active');
      } else {
        step.classList.remove('active');
      }
    });

    saveFormData();
  }

  function updatePortfolioOptions(prefNum) {
    const committee = document.getElementById(`pref${prefNum}_committee`).value;
    const container = document.getElementById(`pref${prefNum}_container`);
    const portfolioDiv = document.getElementById(`pref${prefNum}_portfolios`);
    const roleSelect = document.getElementById(`pref${prefNum}_role`);

    // Show the container once a committee is selected
    if (committee) {
      container.style.display = 'block';
    } else {
      container.style.display = 'none';
    }

    if (committee === 'IP') {
      if (portfolioDiv) {
        portfolioDiv.style.display = 'none';
        portfolioDiv.querySelectorAll('input').forEach(input => {
          input.required = false;
        });
      }
      if (roleSelect) {
        roleSelect.style.display = 'block';
        roleSelect.required = true;
      }
    } else {
      if (portfolioDiv) {
        portfolioDiv.style.display = 'grid';
        portfolioDiv.querySelectorAll('input').forEach(input => {
          input.required = true;
          input.placeholder = input.id.includes('port1') ? "Country Preference 1" : "Country Preference 2";
        });
      }
      if (roleSelect) {
        roleSelect.style.display = 'none';
        roleSelect.required = false;
      }
    }

    // Dynamic Filter: Prevent selecting the same committee across preferences
    const allSelects = [
      document.getElementById('pref1_committee'),
      document.getElementById('pref2_committee'),
      document.getElementById('pref3_committee')
    ];

    const selectedValues = allSelects.map(s => s.value).filter(v => v !== "");

    allSelects.forEach((select, index) => {
      const currentVal = select.value;
      Array.from(select.options).forEach(option => {
        if (option.value === "" || option.value === currentVal) {
          option.disabled = false;
          option.style.display = 'block';
        } else if (selectedValues.includes(option.value)) {
          option.disabled = true;
          option.style.display = 'none';
        } else {
          option.disabled = false;
          option.style.display = 'block';
        }
      });
    });
  }

  if (closeModal) closeModal.addEventListener('click', closeRegistration);

  // HERO SCROLL FADE
  const heroScroll = document.querySelector('.hero-scroll');
  window.addEventListener('scroll', () => {
    if (!heroScroll) return;
    // Fades and translates smoothly based on scroll distance
    const scrollPos = window.scrollY;
    const threshold = 150;

    if (scrollPos > 10) {
      heroScroll.classList.add('hidden');
    } else {
      heroScroll.classList.remove('hidden');
    }
  }, { passive: true });

  // CINEMATIC CURSOR LOGIC
  const cursorDot = document.getElementById('cursorDot');
  const cursorReticle = document.getElementById('cursorReticle');
  let mx = 0, my = 0, rx = 0, ry = 0;
  let isMoving = false;

  const hasInteractivePointer =
    window.matchMedia('(any-pointer: fine)').matches &&
    window.matchMedia('(any-hover: hover)').matches;

  // Force hide cursor on touch interaction
  window.addEventListener('touchstart', function onFirstTouch() {
    document.documentElement.classList.remove('custom-cursor-enabled');
    const dot = document.getElementById('cursorDot');
    const reticle = document.getElementById('cursorReticle');
    if (dot) dot.style.display = 'none';
    if (reticle) reticle.style.display = 'none';
    window.removeEventListener('touchstart', onFirstTouch);
  }, { passive: true });

    if (hasInteractivePointer && cursorDot && cursorReticle) {
    // Disable old reticle in favor of the cosmic 3D pointer cursor
    if (cursorDot) cursorDot.style.display = 'none';
    if (cursorReticle) cursorReticle.style.display = 'none';
    document.documentElement.classList.remove('custom-cursor-enabled');

    const animateCursor = () => {
      rx += (mx - rx) * 0.18;
      ry += (my - ry) * 0.18;

      if (cursorDot) {
        cursorDot.style.setProperty('--mx', `${mx}px`);
        cursorDot.style.setProperty('--my', `${my}px`);
        cursorDot.style.transform = `translate3d(${mx}px, ${my}px, 0) translate(-50%, -50%)`;
      }

      if (cursorReticle) {
        cursorReticle.style.setProperty('--x', `${rx}px`);
        cursorReticle.style.setProperty('--y', `${ry}px`);
        cursorReticle.style.transform = `translate3d(${rx}px, ${ry}px, 0) translate(-50%, -50%)`;
      }

      requestAnimationFrame(animateCursor);
    };

    document.addEventListener('mousemove', e => {
      mx = e.clientX;
      my = e.clientY;

      if (!isMoving) {
        isMoving = true;
        if (cursorDot) cursorDot.style.opacity = '1';
        if (cursorReticle) cursorReticle.style.opacity = '1';
        animateCursor();
      }
    });

    document.addEventListener('mousedown', () => {
      if (cursorReticle) cursorReticle.classList.add('firing');
      if (cursorDot) cursorDot.classList.add('firing');
    });

    document.addEventListener('mouseup', () => {
      if (cursorReticle) cursorReticle.classList.remove('firing');
      if (cursorDot) cursorDot.classList.remove('firing');
    });

    document.addEventListener('mouseenter', () => {
      if (cursorDot) cursorDot.classList.remove('hidden-state');
      if (cursorReticle) cursorReticle.classList.remove('hidden-state');
    });

    document.addEventListener('mouseleave', () => {
      if (cursorDot) cursorDot.classList.add('hidden-state');
      if (cursorReticle) cursorReticle.classList.add('hidden-state');
    });
  } else {
    if (cursorDot) cursorDot.style.display = 'none';
    if (cursorReticle) cursorReticle.style.display = 'none';
    document.documentElement.classList.remove('custom-cursor-enabled');
  }

  // Update HUD target interaction
  const updateInteractables = () => {
    const targetSelectors = 'a, button, .committee-card, input, select, textarea, label, [role="button"], .clickable, .sec-card';
    const dot = document.getElementById('cursorDot');
    const reticle = document.getElementById('cursorReticle');
    if (!dot || !reticle) return;
    document.querySelectorAll(targetSelectors).forEach(el => {
      if (el.dataset.hasCursorListener) return;
      el.addEventListener('mouseenter', () => {
        if (reticle) reticle.classList.add('locked');
        if (dot) dot.classList.add('locked');
      });
      el.addEventListener('mouseleave', () => {
        if (reticle) reticle.classList.remove('locked');
        if (dot) dot.classList.remove('locked');
      });
      el.dataset.hasCursorListener = 'true';
    });
  };

  updateInteractables();

  const cursorMutationObserver = new MutationObserver(updateInteractables);
  if (document.body) {
    cursorMutationObserver.observe(document.body, { childList: true, subtree: true });
  }

  // Attach to registration triggers
  document.querySelectorAll('.nav-cta').forEach(btn => {
    btn.addEventListener('click', (ev) => {
      ev.preventDefault();
      // Only triggered by buttons without specific onclick handlers
      if (!btn.hasAttribute('onclick')) {
        openSelection();
      }
    });
  });

  // Handle form submission
  if (regForm) regForm.addEventListener('submit', async function (e) {
    e.preventDefault();
    if (!validateForm(e.target)) return;
    const btn = e.target.querySelector('button[type="submit"]');
    const closeBtn = document.getElementById('closeModal');
    const backBtns = e.target.querySelectorAll('.btn-back');

    // Submission Hardening
    btn.disabled = true;
    btn.innerHTML = 'Submitting...';
    if (closeBtn) closeBtn.style.pointerEvents = 'none';
    backBtns.forEach(b => b.disabled = true);
    showSpinner();

    try {
      // Get reCAPTCHA v3 token
      const token = await getRecaptchaToken('delegate_registration');

      // Get file data
      const fileInput = document.getElementById("regDriveLink");
      let fileBase64 = "";
      let fileName = "";
      if (fileInput.files.length > 0) {
        const file = fileInput.files[0];
        fileBase64 = await fileToBase64(file);
        fileName = file.name;
      }

      const data = {
        type: 'DELEGATE_REGISTRATION',
        recaptcha_token: token,
        name: document.getElementById("regName").value,
        grade: document.getElementById("regGrade").value,
        phone: document.getElementById("regPhone").value,
        email: document.getElementById("regEmail").value,
        institute: document.getElementById("regInstitute").value,
        address: document.getElementById("regAddress").value,
        transport: document.getElementById("regTransport").value,
        experience: document.getElementById("regExp").value,
        payment_utr: document.getElementById("regUTR")?.value || "",
        payment_screenshot_link: fileBase64,

        pref1_committee: document.getElementById("pref1_committee").value,
        pref1_country: document.getElementById("pref1_role")?.value ||
          (document.getElementById("pref1_port1")?.value + " / " + document.getElementById("pref1_port2")?.value) || "",

        pref2_committee: document.getElementById("pref2_committee").value,
        pref2_country: document.getElementById("pref2_role")?.value ||
          (document.getElementById("pref2_port1")?.value + " / " + document.getElementById("pref2_port2")?.value) || "",

        pref3_committee: document.getElementById("pref3_committee").value,
        pref3_country: document.getElementById("pref3_role")?.value ||
          (document.getElementById("pref3_port1")?.value + " / " + document.getElementById("pref3_port2")?.value) || "",

        payment_utr: document.getElementById("regTxnID")?.value || document.getElementById("regUTR")?.value || "",
        payment_screenshot_link: fileBase64,
        registration_fee: getDelegateFeeFromReferral(),
        emergency_name: document.getElementById("regEmergencyName")?.value || "",
        emergency_phone: document.getElementById("regEmergencyPhone")?.value || "",
        referral: document.getElementById("regReferral")?.value || ""
      };

      if (typeof window.submitDelegateToSupabase === 'function') {
        try {
          await window.submitDelegateToSupabase(data);
        } catch (supaErr) {
          console.warn('Supabase direct insert notice, falling back to Sheets:', supaErr);
          await submitToGoogleSheetWithRetry(data, { retries: 2, timeoutMs: 15000 });
        }
      } else {
        await submitToGoogleSheetWithRetry(data, { retries: 2, timeoutMs: 15000 });
      }
      showCustomAlert('Registration Submitted Successfully! The Secretariat will review your application and notify you soon.', 'success', 6000);
      clearFormData();
      closeRegistration();
    } catch (err) {
      showCustomAlert("Submission Error: " + (err && err.message ? err.message : String(err)), 'error', 7000);
    } finally {
      btn.disabled = false;
      btn.innerHTML = 'Submit Registration';
      if (closeBtn) closeBtn.style.pointerEvents = 'all';
      backBtns.forEach(b => b.disabled = false);
      hideSpinner();
    }
  });
  // Hero section register button (Scroll only)
  const heroRegBtn = document.querySelector('.hero-reg-btn');
  if (heroRegBtn) {
    heroRegBtn.addEventListener('click', (e) => {
      e.preventDefault();
      const target = document.getElementById('register');
      if (target) {
        target.scrollIntoView({ behavior: 'smooth' });
      }
    });
  }

  // DELEGATION MODAL LOGIC
  const delModal = document.getElementById('delModal');
  const openDelBtn = document.getElementById('openDelModal');
  const closeDelBtn = document.getElementById('closeDelModal');
  const delRegForm = document.getElementById('delRegForm');

  // AUTO-SAVE DELEGATION form fields
  const DEL_STORAGE_KEY = 'resolveMunDelRegForm';
  const delFormFieldIds = [
    'delInstName', 'delAdviserName', 'delAdviserPhone', 'delAdviserEmail', 'delSize',
    'delTxnID', 'delUTR'
  ];

  function saveDelFormData() {
    const saved = {};
    // Save Step 1 & 3 static fields
    delFormFieldIds.forEach(id => {
      const el = document.getElementById(id);
      if (el) saved[id] = el.value;
    });

    // Save dynamic delegate fields
    const container = document.getElementById('delegateInputsContainer');
    if (container) {
      container.querySelectorAll('input, select').forEach(input => {
        saved[input.name] = input.value;
      });
    }

    localStorage.setItem(DEL_STORAGE_KEY, JSON.stringify(saved));
  }

  function restoreDelFormData() {
    const raw = localStorage.getItem(DEL_STORAGE_KEY);
    if (!raw) return;
    try {
      const saved = JSON.parse(raw);
      // Restore static fields
      delFormFieldIds.forEach(id => {
        const el = document.getElementById(id);
        if (el && saved[id]) {
          el.value = saved[id];
        }
      });

      // Update price display
      updateDelPrice();
      // Re-generate delegate fields which will use the saved values
      updateDelegateFields();
    } catch (_) { }
  }

  function clearDelFormData() {
    localStorage.removeItem(DEL_STORAGE_KEY);
  }

  // Restore on load
  document.addEventListener('DOMContentLoaded', restoreDelFormData);

  // Attach listeners to static fields
  delFormFieldIds.forEach(id => {
    const el = document.getElementById(id);
    if (el) {
      el.addEventListener('input', saveDelFormData);
      el.addEventListener('change', saveDelFormData);
    }
  });

  function updateDelPrice() {
    const size = parseInt(document.getElementById('delSize').value) || 0;
    const totalPrice = size * 2199;
    const display = document.getElementById('delTotalPriceDisplay');
    if (display) {
      display.innerText = `Total Amount: ₹${totalPrice.toLocaleString()}`;
    }
    saveDelFormData();
  }

  function updateDelPortfolioOptions(index) {
    const committeeSelect = document.querySelector(`select[name="del_pref_${index}"]`);
    const container = document.getElementById(`del_portfolio_container_${index}`);
    if (!committeeSelect || !container) return;

    const committee = committeeSelect.value;
    const isIP = committee === 'IP';

    // Smoothly update the label and input type
    container.innerHTML = `
      <label id="del_label_${index}">${isIP ? 'Role Preference' : 'Country Preference'}</label>
      ${isIP ? `
        <select name="del_country_${index}" required>
          <option value="" disabled selected>Select Role</option>
          <option value="Reporter">Reporter</option>
          <option value="Photographer">Photographer</option>
        </select>
      ` : `
        <input type="text" name="del_country_${index}" placeholder="Preferred Country" required>
      `}
    `;

    // Re-attach save listeners
    container.querySelectorAll('input, select').forEach(input => {
      input.addEventListener('input', saveDelFormData);
      input.addEventListener('change', saveDelFormData);
    });
    saveDelFormData();
  }

  function updateDelegateFields() {
    const container = document.getElementById('delegateInputsContainer');
    const size = parseInt(document.getElementById('delSize').value) || 0;
    if (size < 8) return;

    // Look for values in localStorage first, then in current DOM
    let savedValues = {};
    const raw = localStorage.getItem(DEL_STORAGE_KEY);
    if (raw) {
      try { savedValues = JSON.parse(raw); } catch (e) { }
    }

    // Also merge current UI values if they aren't in storage yet
    const currentInputs = container.querySelectorAll('input, select');
    currentInputs.forEach(input => {
      if (input.value) savedValues[input.name] = input.value;
    });

    container.innerHTML = '';

    for (let i = 1; i <= size; i++) {
      const fieldset = document.createElement('div');
      fieldset.className = 'delegate-entry';
      fieldset.style.padding = '20px';
      fieldset.style.marginBottom = '20px';
      fieldset.style.background = 'rgba(255,255,255,0.03)';
      fieldset.style.border = '1px solid rgba(255,255,255,0.1)';
      fieldset.style.borderRadius = '12px';

      fieldset.innerHTML = `
        <h4 style="color: var(--gold); margin-bottom: 15px; font-size: 0.9rem;">Delegate #${i} ${i === 1 ? '(Head Delegate)' : ''}</h4>
        <div class="form-group">
          <label>Full Name</label>
          <input type="text" name="del_name_${i}" placeholder="Enter name" required autocomplete="name" value="${savedValues[`del_name_${i}`] || (i === 1 ? (localStorage.getItem('resolve_user_name') || '') : '')}">
        </div>
        <div class="form-group" style="display: grid; grid-template-columns: 1fr 1fr; gap: 15px;">
           <div>
            <label>Contact Number</label>
            <input type="tel" name="del_phone_${i}" placeholder="Phone number" required autocomplete="tel" value="${savedValues[`del_phone_${i}`] || ''}" pattern="[0-9]{10}" minlength="10" maxlength="10" title="Please enter a valid 10-digit phone number">
           </div>
           <div>
            <label>Email ID</label>
            <input type="email" name="del_email_${i}" placeholder="Email" required autocomplete="email" value="${savedValues[`del_email_${i}`] || ''}" pattern="[a-z0-9._%+\-]+@[a-z0-9.\-]+\.[a-z]{2,}">
           </div>
        </div>
        <div class="form-group" style="display: grid; grid-template-columns: 1fr 1fr; gap: 15px;">
           <div>
            <label>Committee Preference</label>
            <select name="del_pref_${i}" required onchange="updateDelPortfolioOptions(${i})">
              <option value="" disabled ${!savedValues[`del_pref_${i}`] ? 'selected' : ''}>Select Committee</option>
              <option value="DISEC" ${savedValues[`del_pref_${i}`] === 'DISEC' ? 'selected' : ''}>DISEC</option>
              <option value="LOK SABHA" ${(savedValues[`del_pref_${i}`] === 'LOK SABHA' || savedValues[`del_pref_${i}`] === 'LOKSABHA') ? 'selected' : ''}>Lok Sabha</option>
              <option value="UNHRC" ${savedValues[`del_pref_${i}`] === 'UNHRC' ? 'selected' : ''}>UNHRC</option>
              <option value="CCC" ${savedValues[`del_pref_${i}`] === 'CCC' ? 'selected' : ''}>CCC</option>
              <option value="UNCSW" ${savedValues[`del_pref_${i}`] === 'UNCSW' ? 'selected' : ''}>UNCSW</option>
              <option value="IP" ${savedValues[`del_pref_${i}`] === 'IP' ? 'selected' : ''}>IP</option>
            </select>
           </div>
           <div id="del_portfolio_container_${i}">
            <label id="del_label_${i}">${savedValues[`del_pref_${i}`] === 'IP' ? 'Role Preference' : 'Country Preference'}</label>
            ${savedValues[`del_pref_${i}`] === 'IP' ? `
              <select name="del_country_${i}" required>
                <option value="" disabled ${!savedValues[`del_country_${i}`] ? 'selected' : ''}>Select Role</option>
                <option value="Reporter" ${savedValues[`del_country_${i}`] === 'Reporter' ? 'selected' : ''}>Reporter</option>
                <option value="Photographer" ${savedValues[`del_country_${i}`] === 'Photographer' ? 'selected' : ''}>Photographer</option>
                <option value="Caricaturist" ${savedValues[`del_country_${i}`] === 'Caricaturist' ? 'selected' : ''}>Caricaturist</option>
              </select>
            ` : `
              <input type="text" name="del_country_${i}" placeholder="Preferred Country" required value="${savedValues[`del_country_${i}`] || ''}">
            `}
           </div>
        </div>
      `;
      container.appendChild(fieldset);

      // Re-attach listeners for new inputs to persist to localStorage if needed
      fieldset.querySelectorAll('input, select').forEach(input => {
        input.addEventListener('input', saveDelFormData);
        input.addEventListener('change', saveDelFormData);
      });
    }
  }

  // Initial call
  document.addEventListener('DOMContentLoaded', () => {
    updateDelPrice();
    updateDelegateFields();
    restoreOcFormData();

    // LIVE TOGGLE LOGIC
    if (typeof window.isLive !== 'undefined' && !window.isLive) {
      // 1. All applications are made Coming Soon (Handled by JS alerts/modals in open functions)

      // 2. Iluminati is NO LONGER blurred (Bypassed)
      /*
      document.querySelectorAll('.committee-card').forEach(card => {
        const name = card.querySelector('.committee-name').innerText;
        if (name === 'ILLUMINATI') {
          card.classList.add('is-coming-soon', 'coming-soon-overlay');
        }
      });
      */

      // 3. The Secretariat is also blured and coming soon
      const secTrack = document.getElementById('secTrack');
      if (secTrack) {
        // Blur the individual track or the whole section
        secTrack.classList.add('is-coming-soon');
        const container = document.querySelector('.sec-carousel-container');
        if (container) {
          const banner = document.createElement('div');
          banner.className = 'secretariat-coming-soon coming-soon-overlay';
          container.appendChild(banner);
        }
      }

      // 4. The Cash Prize Card is Revealed (Bypassed)
      /*
      document.querySelectorAll('.about-stat').forEach(stat => {
        const descEl = stat.querySelector('.desc');
        const isCashReward = stat.classList.contains('cash-rewards-stat') || 
                            (descEl && descEl.textContent.trim().toLowerCase() === 'cash rewards');
        
        if (isCashReward) {
          stat.classList.add('coming-soon-overlay', 'cash-prize-coming-soon');
          // Blur the inner text specifically so the overlay stays sharp!
          stat.querySelectorAll('.num, .desc').forEach(el => el.classList.add('is-coming-soon'));
        }
      });
      */

      // 5. OC Applications Section (BYPASSED - Always Active)
      /* 
      const ocSection = document.getElementById('oc-applications');
      if (ocSection) {
        ocSection.style.position = 'relative'; 
        const ocInner = ocSection.querySelector('.oc-inner');
        if (ocInner) {
          ocInner.classList.add('is-coming-soon');
          const banner = document.createElement('div');
          banner.className = 'oc-coming-soon coming-soon-overlay';
          ocSection.appendChild(banner);
        }
      }
      */

      // 6. EB Applications Section (BYPASSED - Always Active)
      /* 
      const ebSection = document.getElementById('eb-applications');
      if (ebSection) {
        ebSection.style.position = 'relative';
        const ebInner = ebSection.querySelector('.eb-inner');
        if (ebInner) {
          ebInner.classList.add('is-coming-soon');
          const banner = document.createElement('div');
          banner.className = 'eb-coming-soon coming-soon-overlay';
          ebSection.appendChild(banner);
        }
      }
      */
    }
  });

  if (openDelBtn && delModal) {
    openDelBtn.addEventListener('click', (e) => {
      e.preventDefault();
      delModal.classList.add('active');
      document.body.style.overflow = 'hidden';
      restoreDelFormData();
      // Ensure fields are correct when opening
      updateDelPrice();
      updateDelegateFields();
    });
  }

  if (closeDelBtn) {
    closeDelBtn.addEventListener('click', closeDelRegistration);
  }

  function copyDelUPI() {
    const upiID = document.getElementById('delUpiID').innerText;
    navigator.clipboard.writeText(upiID).then(() => {
      const btn = document.querySelector('#delModal .copy-btn');
      const original = btn.innerHTML;
      btn.innerHTML = '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#22c55e" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>';
      setTimeout(() => btn.innerHTML = original, 2000);
    });
  }

  function closeDelRegistration() {
    const delModal = document.getElementById('delModal');
    const delRegForm = document.getElementById('delRegForm');
    delModal.classList.remove('active');
    document.body.style.overflow = '';
    nextDelStep(1);
    delRegForm.reset();
    updateDelPrice();
    updateDelegateFields();
  }

  function nextDelStep(stepNum) {
    const currentStep = document.querySelector('#delModal .form-step.active');
    if (!currentStep) return;
    const currentStepNum = parseInt(currentStep.id.replace('delStep', ''));

    if (stepNum > currentStepNum) {
      // Validate current step
      const inputs = currentStep.querySelectorAll('input[required], select[required], textarea[required]');
      let isValid = true;

      inputs.forEach(input => {
        if (!input.value.trim()) {
          input.style.borderBottomColor = '#ff4444';
          isValid = false;
        } else {
          input.style.borderBottomColor = '';
        }

        // Phone specific validation
        if (input.type === 'tel') {
          const phoneVal = input.value.trim();
          const phoneRegex = /^[1-9][0-9]{9}$/;
          if (!phoneRegex.test(phoneVal)) {
            input.style.borderBottomColor = '#ff4444';
            isValid = false;
          }
        }
      });

      // Special check for Step 1: Minimum Size
      if (currentStepNum === 1) {
        const size = parseInt(document.getElementById('delSize').value);
        if (isNaN(size) || size < 8) {
          alert('Minimum delegation size is 8 delegates.');
          document.getElementById('delSize').style.borderBottomColor = '#ff4444';
          isValid = false;
        }
      }

      if (!isValid) return;
    }

    document.querySelectorAll('#delModal .form-step').forEach(step => step.classList.remove('active'));
    const targetStep = document.getElementById('delStep' + stepNum);
    if (targetStep) targetStep.classList.add('active');

    if (stepNum === 3) {
      const size = parseInt(document.getElementById('delSize').value) || 8;
      const delegationPrice = size * 2199;
      generateDynamicQR(delegationPrice.toString(), 'delPaymentQRImage', 'delUpiID');
    }
  }

  if (delRegForm) delRegForm.addEventListener('submit', async function (e) {
    e.preventDefault();
    const btn = e.target.querySelector('button[type="submit"]');
    const closeBtn = document.getElementById('closeDelModal');
    const backBtns = e.target.querySelectorAll('.btn-back');

    if (!validateForm(e.target)) return;
    // Submission Hardening
    btn.disabled = true;
    btn.innerHTML = 'Submitting...';
    if (closeBtn) closeBtn.style.pointerEvents = 'none';
    backBtns.forEach(b => b.disabled = true);
    showSpinner();

    try {
      // Get reCAPTCHA v3 token
      const token = await getRecaptchaToken('delegation_application');

      const size = parseInt(document.getElementById("delSize").value);
      const delegates = [];
      for (let i = 1; i <= size; i++) {
        delegates.push({
          name: e.target[`del_name_${i}`].value,
          phone: e.target[`del_phone_${i}`].value,
          email: e.target[`del_email_${i}`].value,
          pref: e.target[`del_pref_${i}`].value,
          country: e.target[`del_country_${i}`].value
        });
      }

      // Get file data
      const fileInput = document.getElementById("delDriveLink");
      let fileBase64 = "";
      let fileName = "";
      if (fileInput.files.length > 0) {
        const file = fileInput.files[0];
        fileBase64 = await fileToBase64(file);
        fileName = file.name;
      }

      const data = {
        action: 'SUBMIT_DELEGATION',
        type: 'DELEGATION_APPLICATION',
        screenshotBase64: fileBase64,
        screenshotName: fileName,
        recaptcha_token: token,
        instName: document.getElementById("delInstName").value,
        adviserName: document.getElementById("delAdviserName").value,
        adviserPhone: document.getElementById("delAdviserPhone").value,
        adviserEmail: document.getElementById("delAdviserEmail").value,
        size: size,
        delegates: delegates,
        txnID: document.getElementById("delTxnID")?.value || "",
        utr: document.getElementById("delUTR")?.value || "",
        payment_screenshot_link: fileBase64,
        totalAmount: size * 2199
      };

      console.log('Sending Delegation Data:', data);
      await submitToGoogleSheetWithRetry(data, { retries: 2, timeoutMs: 20000 });
      showCustomAlert('Delegation Registered Successfully! All ' + size + ' delegates have been enrolled. The Secretariat will contact the Faculty Adviser shortly.', 'success', 7000);
      delRegForm.reset();
      clearDelFormData();
      closeDelRegistration();
    } catch (err) {
      showCustomAlert("Submission Error: " + (err && err.message ? err.message : String(err)), 'error', 7000);
    } finally {
      btn.disabled = false;
      btn.innerHTML = 'Submit Delegation';
      if (closeBtn) closeBtn.style.pointerEvents = 'all';
      backBtns.forEach(b => b.disabled = false);
      hideSpinner();
    }
  });

  // Handle outside click for Delegation Modal
  // (Main listener at line 4719-4735 handles all modals centralizing here)

  // OC MODAL LOGIC
  const ocModal = document.getElementById('ocModal');
  const openOcBtn = document.getElementById('openOcModal');
  const closeOcBtn = document.getElementById('closeOcModal');
  const ocRegForm = document.getElementById('ocRegForm');

  // AUTO-SAVE OC form fields to localStorage
  const OC_STORAGE_KEY = 'resolveMunOcRegForm';
  const ocFormFieldIds = [
    'ocName', 'ocDob', 'ocGrade', 'ocPhone', 'ocEmail', 'ocInst', 'ocInsta',
    'ocMunCount', 'ocWhy', 'ocAttributes', 'ocTxnID', 'ocUTR', 'ocDriveLink'
  ];

  function saveOcFormData() {
    const saved = {};
    ocFormFieldIds.forEach(id => {
      const el = document.getElementById(id);
      if (el) saved[id] = el.value;
    });
    localStorage.setItem(OC_STORAGE_KEY, JSON.stringify(saved));
  }

  function restoreOcFormData() {
    const raw = localStorage.getItem(OC_STORAGE_KEY);
    if (!raw) return;
    try {
      const saved = JSON.parse(raw);
      ocFormFieldIds.forEach(id => {
        const el = document.getElementById(id);
        if (el && saved[id]) el.value = saved[id];
      });
    } catch (_) { }
  }

  function clearOcFormData() {
    localStorage.removeItem(OC_STORAGE_KEY);
  }

  // Listen for OC form changes to save
  ocFormFieldIds.forEach(id => {
    const el = document.getElementById(id);
    if (el) {
      el.addEventListener('input', saveOcFormData);
      el.addEventListener('change', saveOcFormData);
    }
  });

  // Restore on load
  document.addEventListener('DOMContentLoaded', restoreOcFormData);

  function openOcRegistration() {
    alert("OC Applications are now closed.");
    return;
    /*
    restoreOcFormData();
    const ocModal = document.getElementById('ocModal');
    if (ocModal) {
      ocModal.classList.add('active');
      document.body.style.overflow = 'hidden';
    }
    */
  }

  if (openOcBtn && ocModal) {
    openOcBtn.addEventListener('click', (e) => {
      e.preventDefault();
      openOcRegistration();
    });
  }

  function closeOcRegistration() {
    ocModal.classList.remove('active');
    document.body.style.overflow = '';
    // Reset to step 1
    nextOcStep(1);
    ocRegForm.reset();
  }

  if (closeOcBtn) {
    closeOcBtn.addEventListener('click', closeOcRegistration);
  }

  function nextOcStep(stepNum) {
    const currentStep = document.querySelector('#ocModal .form-step.active');
    const currentStepNum = parseInt(currentStep.id.replace('ocStep', ''));

    if (stepNum > currentStepNum) {
      const inputs = currentStep.querySelectorAll('input[required], select[required], textarea[required]');
      let isValid = true;
      inputs.forEach(input => {
        if (!input.value.trim()) {
          showError(input, "This field is required.");
          isValid = false;
        } else if (input.id === 'ocPhone' && (input.value.length !== 10 || isNaN(input.value))) {
          showError(input, "Phone number must be exactly 10 digits.");
          isValid = false;
        } else {
          clearError(input);
        }
      });
      if (!isValid) return;
    }

    if (stepNum === 3) {
      generateDynamicQR("1699", "ocPaymentQRImage", "ocUpiID");
    }

    document.querySelectorAll('#ocModal .form-step').forEach(step => step.classList.remove('active'));
    const targetStep = document.getElementById('ocStep' + stepNum);
    if (targetStep) targetStep.classList.add('active');

    const progressSteps = document.querySelectorAll('#ocModal .progress-step');
    progressSteps.forEach((step, idx) => {
      if (idx < stepNum) {
        step.classList.add('active');
      } else {
        step.classList.remove('active');
      }
    });

    saveOcFormData();
  }

  function copyOcUPI() {
    const upiID = document.getElementById('ocUpiID').innerText;
    navigator.clipboard.writeText(upiID).then(() => {
      const btn = document.querySelector('#ocModal .copy-btn');
      const original = btn.innerHTML;
      btn.innerHTML = '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#22c55e" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>';
      setTimeout(() => btn.innerHTML = original, 2000);
    });
  }

  if (ocRegForm) ocRegForm.addEventListener('submit', async function (e) {
    e.preventDefault();
    const btn = e.target.querySelector('button[type="submit"]');
    const closeBtn = document.getElementById('closeOcModal');
    const backBtns = e.target.querySelectorAll('.btn-back');

    if (!validateForm(e.target)) return;
    // Submission Hardening
    btn.disabled = true;
    btn.innerHTML = 'Submitting...';
    if (closeBtn) closeBtn.style.pointerEvents = 'none';
    backBtns.forEach(b => b.disabled = true);
    showSpinner();

    try {
      // Get reCAPTCHA v3 token
      const token = await getRecaptchaToken('oc_application');

      // Get file data
      const fileInput = document.getElementById("ocDriveLink");
      let fileBase64 = "";
      let fileName = "";
      if (fileInput.files.length > 0) {
        const file = fileInput.files[0];
        fileBase64 = await fileToBase64(file);
        fileName = file.name;
      }

      const data = {
        action: 'SUBMIT_OC',
        type: 'OC_APPLICATION',
        cvBase64: fileBase64,
        cvName: fileName,
        recaptcha_token: token,
        name: document.getElementById("ocName").value,
        grade: document.getElementById("ocGrade").value,
        phone: document.getElementById("ocPhone").value,
        email: document.getElementById("ocEmail").value,
        dob: document.getElementById("ocDob").value,
        institute: document.getElementById("ocInst").value,
        instagram: document.getElementById("ocInsta").value,
        munCount: document.getElementById("ocMunCount").value,
        why: document.getElementById("ocWhy").value,
        attributes: document.getElementById("ocAttributes").value,
        payment_utr: document.getElementById("ocTxnID")?.value || document.getElementById("ocUTR")?.value || "",
        payment_screenshot_link: fileBase64
      };

      console.log('OC Data:', data);
      await submitToGoogleSheetWithRetry(data, { retries: 2, timeoutMs: 15000 });
      showCustomAlert('Application Submitted Successfully! The Secretariat will review your OC application soon.', 'success', 6000);
      ocRegForm.reset();
      clearOcFormData();
      closeOcRegistration();
    } catch (err) {
      showCustomAlert("Submission Error: " + (err && err.message ? err.message : String(err)), 'error', 7000);
    } finally {
      btn.disabled = false;
      btn.innerHTML = 'Submit Application';
      if (closeBtn) closeBtn.style.pointerEvents = 'all';
      backBtns.forEach(b => b.disabled = false);
      hideSpinner();
    }
  });

  // Handle outside click for OC Modal
  window.addEventListener('click', (e) => {
    if (e.target === ocModal) closeOcRegistration();
  });

  // NAV SCROLL
  const navbar = document.getElementById('navbar');
  const mobileMenuBtn = document.getElementById('mobileMenuBtn');
  const navLinks = document.getElementById('navLinks');

  if (mobileMenuBtn && navLinks) mobileMenuBtn.addEventListener('click', () => {
    mobileMenuBtn.classList.toggle('active');
    navLinks.classList.toggle('mobile-active');
    // Lock background scroll
    document.body.style.overflow = navLinks.classList.contains('mobile-active') ? 'hidden' : '';
  });

  // Close menu when a link is clicked
  if (navLinks) {
    navLinks.querySelectorAll('a').forEach(link => {
      link.addEventListener('click', () => {
        if (mobileMenuBtn) mobileMenuBtn.classList.remove('active');
        navLinks.classList.remove('mobile-active');
        // Unlock background scroll
        document.body.style.overflow = '';
      });
    });
  }

  window.addEventListener('scroll', () => {
    if (navbar) navbar.classList.toggle('scrolled', window.scrollY > 60);

    // Active Navigation Highlighting
    const sections = ['hero', 'about', 'letter', 'committees', 'venue', 'secretariat'];
    let current = '';

    const pageYOffset = window.pageYOffset;

    sections.forEach(s => {
      const section = document.getElementById(s);
      if (section) {
        const sectionTop = section.offsetTop;
        const sectionHeight = section.offsetHeight;
        if (pageYOffset >= sectionTop - 250) {
          current = s;
        }
      }
    });

    document.querySelectorAll('.nav-links a').forEach(link => {
      link.classList.remove('active');
      const href = link.getAttribute('href').substring(1);
      if (href === current) {
        link.classList.add('active');
      }
    });

    // Venue Parallax Effect
    const venueVisual = document.querySelector('.venue-visual');
    if (venueVisual) {
      const img = venueVisual.querySelector('img');
      if (img) {
        const rect = venueVisual.getBoundingClientRect();
        const viewHeight = window.innerHeight;

        // Only calculate if section is in view
        if (rect.top < viewHeight && rect.bottom > 0) {
          // Calculate how far through the element the scroll is (0 to 1)
          const elementHeight = rect.height;
          const elementVisible = viewHeight - rect.top;
          const scrollFraction = Math.max(0, Math.min(1, elementVisible / (viewHeight + elementHeight)));

          // Delay movement until the section is fully established on screen
          // Movement starts after the initial reveal and landing
          let moveAmount = 0;
          if (scrollFraction > 0.45) { // Threshold for "reading part"
            moveAmount = (scrollFraction - 0.45) * 50;
          }

          img.style.transform = `translateY(${moveAmount}px)`;
        }
      }
    }
  }, { passive: true });

  // SCROLL REVEAL
  const observer = new IntersectionObserver(entries => {
    entries.forEach(e => { if (e.isIntersecting) e.target.classList.add('visible'); });
  }, {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px'
  });
  document.querySelectorAll('.reveal').forEach(el => observer.observe(el));

  // COUNTDOWN — target date: November 20, 2026 08:00
  const countdownDate = new Date('2026-11-20T08:00:00');
  function updateCountdown() {
    const cdDays = document.getElementById('cd-days');
    const cdHours = document.getElementById('cd-hours');
    const cdMins = document.getElementById('cd-mins');
    const cdSecs = document.getElementById('cd-secs');
    if (!cdDays || !cdHours || !cdMins || !cdSecs) return;

    const now = new Date();
    const diff = countdownDate - now;
    if (diff <= 0) {
      cdDays.textContent = '00';
      cdHours.textContent = '00';
      cdMins.textContent = '00';
      cdSecs.textContent = '00';
      return;
    }
    const d = Math.floor(diff / 86400000);
    const h = Math.floor((diff % 86400000) / 3600000);
    const m = Math.floor((diff % 3600000) / 60000);
    const s = Math.floor((diff % 60000) / 1000);
    cdDays.textContent = String(d).padStart(2, '0');
    cdHours.textContent = String(h).padStart(2, '0');
    cdMins.textContent = String(m).padStart(2, '0');
    cdSecs.textContent = String(s).padStart(2, '0');
  }
  updateCountdown();
  setInterval(updateCountdown, 1000);

  // PARTICLES
  const canvas = document.getElementById('particles');
  const ctx = canvas && typeof canvas.getContext === 'function' ? canvas.getContext('2d') : null;
  let W = 0, H = 0, particles = [];
  mx = -1000;
  my = -1000;
  if (typeof window !== 'undefined') {
    window.addEventListener('mousemove', (e) => {
      mx = e.clientX;
      my = e.clientY;
    }, { passive: true });
  }

  // Adaptive performance profile: 'high' | 'medium' | 'low'
  const PERFORMANCE_PROFILE = (function detectPerformanceProfile() {
    try {
      if (window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches) return 'low';
      const deviceMemory = navigator.deviceMemory || 4; // GB
      const threads = navigator.hardwareConcurrency || 4;
      const isMobile = /Mobi|Android/i.test(navigator.userAgent);
      // Simple heuristic
      if (!isMobile && (deviceMemory >= 8 || threads >= 8)) return 'high';
      if ((deviceMemory >= 4 && threads >= 4) && !isMobile) return 'medium';
      if (isMobile && deviceMemory >= 4 && threads >= 4) return 'medium';
      return 'low';
    } catch (e) { return 'medium'; }
  })();

  class Particle {
    constructor() {
      this.reset();
    }
    reset() {
      this.x = Math.random() * W;
      this.y = Math.random() * H;
      this.size = Math.random() * 1.5 + 0.5;
      this.baseX = this.x;
      this.baseY = this.y;
      this.density = (Math.random() * 30) + 1;
      this.vx = (Math.random() - 0.5) * 0.3;
      this.vy = (Math.random() - 0.5) * 0.3;
      this.opacity = Math.random() * 0.5 + 0.1;
    }
    update() {
      // Gentle drift
      this.x += this.vx;
      this.y += this.vy;

      // Wrap around screen
      if (this.x < 0) this.x = W;
      if (this.x > W) this.x = 0;
      if (this.y < 0) this.y = H;
      if (this.y > H) this.y = 0;

      // Mouse interaction
      let dx = mx - this.x;
      let dy = my - this.y;
      let distance = Math.sqrt(dx * dx + dy * dy);
      let forceDirectionX = dx / distance;
      let forceDirectionY = dy / distance;
      let maxDistance = 150;
      let force = (maxDistance - distance) / maxDistance;

      if (distance < maxDistance) {
        this.x -= forceDirectionX * force * 3;
        this.y -= forceDirectionY * force * 3;
      }
    }
    draw() {
      ctx.fillStyle = `rgba(51, 14, 92, ${this.opacity})`;
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
      ctx.closePath();
      ctx.fill();
    }
  }

  function resize() {
    if (!canvas) return;
    const dpr = Math.max(1, window.devicePixelRatio || 1);
    W = Math.floor(window.innerWidth);
    H = Math.floor(window.innerHeight);
    canvas.width = W * dpr;
    canvas.height = H * dpr;
    canvas.style.width = W + 'px';
    canvas.style.height = H + 'px';
    if (ctx) ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    initParticles();
  }

  function initParticles() {
    particles = [];
    // Lower particle count on mobile for performance
    // Slightly increase density divisor to reduce particle count for smoother FPS
    let particleDensity = (window.innerWidth < 768) ? 36000 : 18000;
    let numberOfParticles = (W * H) / particleDensity;
    for (let i = 0; i < numberOfParticles; i++) {
      particles.push(new Particle());
    }
  }

  // Intersection Observer for Background Particles
  const canvasObserver = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.target.id === 'particles') {
        entry.target.dataset.visible = entry.isIntersecting;
      }
    });
  }, { threshold: 0.1 });

  if (canvas) {
    canvas.dataset.visible = 'true';
    canvasObserver.observe(canvas);
  }

  window.addEventListener('resize', resize);
  // Don't start drawing immediately; choose best renderer for device
  function initAdaptiveParticles() {
    // High-performance canvas particle system
    resize();
    requestAnimationFrame(function drawParticles() {
      if (canvas && canvas.dataset.visible === 'false') {
        setTimeout(() => requestAnimationFrame(drawParticles), 600);
        return;
      }
      if (ctx) {
        ctx.clearRect(0, 0, W, H);
        for (let i = 0; i < particles.length; i++) {
          particles[i].update();
          particles[i].draw();
        }
      }
      requestAnimationFrame(drawParticles);
    });
  }

  
  function initWebGLParticles() {
    const glCanvas = canvas; // reuse the same DOM canvas
    const gl = glCanvas.getContext('webgl2', { antialias: false });
    if (!gl) throw new Error('WebGL2 not available');

    // Resize for DPR
    const dpr = Math.max(1, window.devicePixelRatio || 1);
    const w = Math.floor(window.innerWidth), h = Math.floor(window.innerHeight);
    glCanvas.width = w * dpr; glCanvas.height = h * dpr;
    glCanvas.style.width = w + 'px'; glCanvas.style.height = h + 'px';
    gl.viewport(0, 0, glCanvas.width, glCanvas.height);

    // Shaders: simple point render with circular point in fragment
    const vs = `#version 300 es
    in vec2 a_pos; in float a_size; in float a_op;
    uniform vec2 u_resolution;
    out float v_op;
    void main(){
      vec2 zeroToOne = a_pos / u_resolution;
      vec2 clipSpace = zeroToOne * 2.0 - 1.0;
      gl_Position = vec4(clipSpace * vec2(1, -1), 0, 1);
      gl_PointSize = a_size;
      v_op = a_op;
    }`;

    const fs = `#version 300 es
    precision mediump float;
    in float v_op; out vec4 outColor;
    void main(){
      vec2 c = gl_PointCoord - 0.5;
      float r = dot(c,c);
      float alpha = smoothstep(0.25, 0.24, r) * v_op;
      outColor = vec4(0.376, 0.647, 0.98, alpha);
    }`;

    function compile(type, src) { const s = gl.createShader(type); gl.shaderSource(s, src); gl.compileShader(s); if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) throw new Error(gl.getShaderInfoLog(s)); return s; }
    const prog = gl.createProgram(); gl.attachShader(prog, compile(gl.VERTEX_SHADER, vs)); gl.attachShader(prog, compile(gl.FRAGMENT_SHADER, fs)); gl.linkProgram(prog); if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) throw new Error(gl.getProgramInfoLog(prog));

    const maxParticles = Math.max(200, Math.floor((w * h) / 12000));
    const posBuffer = gl.createBuffer();
    const sizeBuffer = gl.createBuffer();
    const opBuffer = gl.createBuffer();

    const a_pos = gl.getAttribLocation(prog, 'a_pos');
    const a_size = gl.getAttribLocation(prog, 'a_size');
    const a_op = gl.getAttribLocation(prog, 'a_op');
    const u_resolution = gl.getUniformLocation(prog, 'u_resolution');

    // Create particle state on CPU
    const P = new Float32Array(maxParticles * 2);
    const S = new Float32Array(maxParticles);
    const O = new Float32Array(maxParticles);
    const VX = new Float32Array(maxParticles);
    const VY = new Float32Array(maxParticles);
    for (let i = 0; i < maxParticles; i++) { P[i * 2] = Math.random() * w; P[i * 2 + 1] = Math.random() * h; S[i] = Math.random() * 2 + 1; O[i] = Math.random() * 0.6 + 0.2; VX[i] = (Math.random() - 0.5) * 0.6; VY[i] = (Math.random() - 0.5) * 0.6; }

    gl.useProgram(prog);
    gl.enable(gl.BLEND); gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);

    function updateAndDraw() {
      // Update CPU-side quickly
      for (let i = 0; i < maxParticles; i++) {
        let x = P[i * 2] + VX[i]; let y = P[i * 2 + 1] + VY[i];
        if (x < 0) x += w; if (x > w) x -= w; if (y < 0) y += h; if (y > h) y -= h;
        P[i * 2] = x; P[i * 2 + 1] = y;
      }

      // Upload buffers
      gl.bindBuffer(gl.ARRAY_BUFFER, posBuffer); gl.bufferData(gl.ARRAY_BUFFER, P, gl.DYNAMIC_DRAW);
      gl.enableVertexAttribArray(a_pos); gl.vertexAttribPointer(a_pos, 2, gl.FLOAT, false, 0, 0);

      gl.bindBuffer(gl.ARRAY_BUFFER, sizeBuffer); gl.bufferData(gl.ARRAY_BUFFER, S, gl.DYNAMIC_DRAW);
      gl.enableVertexAttribArray(a_size); gl.vertexAttribPointer(a_size, 1, gl.FLOAT, false, 0, 0);

      gl.bindBuffer(gl.ARRAY_BUFFER, opBuffer); gl.bufferData(gl.ARRAY_BUFFER, O, gl.DYNAMIC_DRAW);
      gl.enableVertexAttribArray(a_op); gl.vertexAttribPointer(a_op, 1, gl.FLOAT, false, 0, 0);

      gl.uniform2f(u_resolution, w, h);
      gl.clearColor(0, 0, 0, 0); gl.clear(gl.COLOR_BUFFER_BIT);
      gl.drawArrays(gl.POINTS, 0, maxParticles);
      requestAnimationFrame(updateAndDraw);
    }

    requestAnimationFrame(updateAndDraw);
  }

  // Start the adaptive particle system now that both paths are defined
  initAdaptiveParticles();

  // EB MODAL LOGIC
  const ebModal = document.getElementById('ebModal');
  const ebRegForm = document.getElementById('ebRegForm');

  // AUTO-SAVE EB form fields to localStorage
  const EB_STORAGE_KEY = 'resolveMunEbRegForm';
  const ebFormFieldIds = [
    'ebName', 'ebPhone', 'ebEmail', 'ebDob', 'ebReferral', 'ebInst', 'ebRole', 'ebMunCount',
    'ebExp', 'ebWhy', 'ebPref1', 'ebPref2', 'ebCv'
  ];

  function saveEbFormData() {
    const saved = {};
    ebFormFieldIds.forEach(id => {
      const el = document.getElementById(id);
      if (el) saved[id] = el.value;
    });
    localStorage.setItem(EB_STORAGE_KEY, JSON.stringify(saved));
  }

  function restoreEbFormData() {
    const raw = localStorage.getItem(EB_STORAGE_KEY);
    if (!raw) return;
    try {
      const saved = JSON.parse(raw);
      ebFormFieldIds.forEach(id => {
        const el = document.getElementById(id);
        if (el && saved[id]) el.value = saved[id];
      });
    } catch (_) { }
  }

  function clearEbFormData() {
    localStorage.removeItem(EB_STORAGE_KEY);
  }

  // Listen for EB form changes to save
  ebFormFieldIds.forEach(id => {
    const el = document.getElementById(id);
    if (el) {
      el.addEventListener('input', saveEbFormData);
      el.addEventListener('change', saveEbFormData);
    }
  });

  // Restore on load
  document.addEventListener('DOMContentLoaded', restoreEbFormData);

  function openEbRegistration() {
    alert("EB Applications are now closed.");
    return;
    restoreEbFormData();
    if (ebModal) {
      ebModal.classList.add('active');
      document.body.style.overflow = 'hidden';
    }
  }

  function closeEbRegistration() {
    if (ebModal) {
      ebModal.classList.remove('active');
      document.body.style.overflow = '';
      nextEbStep(1);
      ebRegForm.reset();
    }
  }

  const closeEbBtn = document.getElementById('closeEbModal');
  if (closeEbBtn) {
    closeEbBtn.addEventListener('click', closeEbRegistration);
  }

  function nextEbStep(stepNum) {
    const currentStep = document.querySelector('#ebModal .form-step.active');
    const currentStepNum = parseInt(currentStep.id.replace('ebStep', ''));

    if (stepNum > currentStepNum) {
      const inputs = currentStep.querySelectorAll('input[required], select[required], textarea[required]');
      let isValid = true;
      inputs.forEach(input => {
        if (!input.value.trim()) {
          input.style.borderBottomColor = '#ff4444';
          isValid = false;
        } else {
          input.style.borderBottomColor = '';
        }
      });
      if (!isValid) return;
    }

    document.querySelectorAll('#ebModal .form-step').forEach(step => step.classList.remove('active'));
    const targetStep = document.getElementById('ebStep' + stepNum);
    if (targetStep) targetStep.classList.add('active');
  }

  if (ebRegForm) ebRegForm.addEventListener('submit', async function (e) {
    e.preventDefault();
    const btn = e.target.querySelector('button[type="submit"]');
    const closeBtn = document.getElementById('closeEbModal');
    const backBtns = e.target.querySelectorAll('.btn-back');

    if (!validateForm(e.target)) return;
    // Submission Hardening
    btn.disabled = true;
    btn.innerHTML = 'Submitting Application...';
    if (closeBtn) closeBtn.style.pointerEvents = 'none';
    backBtns.forEach(b => b.disabled = true);
    showSpinner();

    try {
      const token = await getRecaptchaToken('eb_application');

      // Get file data
      const fileInput = document.getElementById("ebCv");
      let fileBase64 = "";
      let fileName = "";
      if (fileInput && fileInput.files && fileInput.files.length > 0) {
        const file = fileInput.files[0];
        fileBase64 = await fileToBase64(file);
        fileName = file.name;
      }

      const data = {
        type: 'EB_APPLICATION',
        recaptcha_token: token,
        name: document.getElementById("ebName") ? document.getElementById("ebName").value : "",
        phone: document.getElementById("ebPhone") ? document.getElementById("ebPhone").value : "",
        email: document.getElementById("ebEmail") ? document.getElementById("ebEmail").value : "",
        institute: document.getElementById("ebInst") ? document.getElementById("ebInst").value : "",
        position: document.getElementById("ebRole") ? document.getElementById("ebRole").value : "",
        experience: document.getElementById("ebExp") ? document.getElementById("ebExp").value : "",
        why: document.getElementById("ebWhy") ? document.getElementById("ebWhy").value : "",
        committees: (document.getElementById("ebPref1") ? document.getElementById("ebPref1").value : "") + " & " + (document.getElementById("ebPref2") ? document.getElementById("ebPref2").value : ""),
        cv_file: fileBase64,
        dob: document.getElementById("ebDob") ? document.getElementById("ebDob").value : "",
        referral: document.getElementById("ebReferral") ? document.getElementById("ebReferral").value : "",
        munCount: document.getElementById("ebMunCount") ? document.getElementById("ebMunCount").value : ""
      };

      await submitToGoogleSheetWithRetry(data, { retries: 2, timeoutMs: 15000 }); 
      showCustomAlert('EB Application Submitted Successfully! The Secretariat will review your profile and contact you for an interview.', 'success', 6000);
      ebRegForm.reset();
      clearEbFormData();
      closeEbRegistration();
    } catch (err) {
      showCustomAlert("Submission Error: " + (err && err.message ? err.message : String(err)), 'error', 7000);
    } finally {
      btn.disabled = false;
      btn.innerHTML = 'Submit EB Application';
      if (closeBtn) closeBtn.style.pointerEvents = 'all';
      backBtns.forEach(b => b.disabled = false);
      hideSpinner();
    }
  });

  // Handle outside click for EB Modal
  window.addEventListener('click', (e) => {
    if (e.target === ebModal) closeEbRegistration();
  });

  // EXPERIENCE tabs
  const expItems = document.querySelectorAll('.exp-item');
  const expVisuals = document.querySelectorAll('.showcase-visual');
  let currentExpIdx = 0;
  let expAutoPlayTimer;

  const updateExp = (index) => {
    if (!expItems.length || !expItems[index]) return;
    
    // Update items
    expItems.forEach(i => i.classList.remove('active'));
    expItems[index].classList.add('active');

    // Update visuals
    const expId = expItems[index].getAttribute('data-exp');
    expVisuals.forEach(v => {
      v.classList.remove('active');
      if (v.id === `exp-vis-${expId}`) {
        v.classList.add('active');
      }
    });
    
    currentExpIdx = index;
  };

  const startAutoPlay = () => {
    if (!expItems.length) return;
    stopAutoPlay();
    expAutoPlayTimer = setInterval(() => {
      let nextIdx = (currentExpIdx + 1) % expItems.length;
      updateExp(nextIdx);
    }, 2000);
  };

  const stopAutoPlay = () => {
    if (expAutoPlayTimer) clearInterval(expAutoPlayTimer);
  };

  expItems.forEach((item, idx) => {
    item.addEventListener('mouseenter', () => {
      stopAutoPlay();
      updateExp(idx);
    });
    
    item.addEventListener('mouseleave', () => {
      startAutoPlay();
    });

    item.addEventListener('click', () => {
      stopAutoPlay();
      updateExp(idx);
    });
  });

  // Start the 2-second rotation initially
  startAutoPlay();

  // HERO META NUMBER SCROLL EFFECT
  const animateValue = (obj, start, end, duration) => {
    let startTimestamp = null;
    const step = (timestamp) => {
      if (!startTimestamp) startTimestamp = timestamp;
      const progress = Math.min((timestamp - startTimestamp) / duration, 1);
      obj.innerHTML = Math.floor(progress * (end - start) + start);
      if (progress < 1) {
        window.requestAnimationFrame(step);
      }
    };
    window.requestAnimationFrame(step);
  };

  const observerOptions = {
    threshold: 0.5
  };

  const heroMetaObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const valueElements = entry.target.querySelectorAll('.value');
        valueElements.forEach(el => {
          const target = parseInt(el.getAttribute('data-target'));
          if (!isNaN(target)) {
            animateValue(el, 0, target, 2000);
          }
        });
        heroMetaObserver.unobserve(entry.target);
      }
    });
  }, observerOptions);

  const heroMeta = document.querySelector('.hero-meta');
  if (heroMeta) {
    heroMetaObserver.observe(heroMeta);
  }

  // SECRETARIAT INFINITE SCROLL & MOUSE DRAG & WHEEL SUPPORT
  const track = document.getElementById('secTrack');
  const container = document.querySelector('.sec-carousel-container');

  if (track && container) {
    // Clone the track content to ensure seamless loop
    const originalCards = Array.from(track.children);
    originalCards.forEach(card => {
      const clone = card.cloneNode(true);
      track.appendChild(clone);
    });

    let isDown = false;
    let startX;
    let scrollLeft = 0;
    let trackWidth = 0;
    let animationSpeed = 0.5;
    let currentX = 0;
    let isDragging = false;

    function updateTrackWidth() {
      trackWidth = track.scrollWidth / 2;
    }
    updateTrackWidth();
    window.addEventListener('resize', updateTrackWidth);

    track.classList.add('is-animating');

    function animate() {
      if (!isDown) {
        currentX -= animationSpeed;
        if (Math.abs(currentX) >= trackWidth) {
          currentX = 0;
        }
        track.style.transform = `translateX(${currentX}px)`;
      }
      requestAnimationFrame(animate);
    }
    
    track.classList.remove('is-animating');
    requestAnimationFrame(animate);

    container.addEventListener('mousedown', (e) => {
      isDown = true;
      isDragging = false;
      container.classList.add('active');
      startX = e.pageX - container.offsetLeft;
      scrollLeft = currentX;
    });

    container.addEventListener('mouseleave', () => {
      isDown = false;
      container.classList.remove('active');
    });

    container.addEventListener('mouseup', () => {
      isDown = false;
      container.classList.remove('active');
    });

    container.addEventListener('mousemove', (e) => {
      if (!isDown) return;
      isDragging = true;
      e.preventDefault();
      const x = e.pageX - container.offsetLeft;
      const walk = (x - startX) * 1.2;
      currentX = scrollLeft + walk;

      if (currentX > 0) currentX -= trackWidth;
      if (currentX < -trackWidth) currentX += trackWidth;

      track.style.transform = `translateX(${currentX}px)`;
    });

    container.addEventListener('touchstart', (e) => {
      isDown = true;
      isDragging = false;
      container.classList.add('active');
      startX = e.touches[0].pageX - container.offsetLeft;
      scrollLeft = currentX;
    }, { passive: true });

    container.addEventListener('touchend', () => {
      isDown = false;
      container.classList.remove('active');
    });

    container.addEventListener('touchmove', (e) => {
      if (!isDown) return;
      isDragging = true;
      const x = e.touches[0].pageX - container.offsetLeft;
      const walk = (x - startX) * 1.5;
      currentX = scrollLeft + walk;

      if (currentX > 0) currentX -= trackWidth;
      if (currentX < -trackWidth) currentX += trackWidth;

      track.style.transform = `translateX(${currentX}px)`;
    }, { passive: true });

    container.addEventListener('wheel', (e) => {
      const delta = Math.abs(e.deltaX) > Math.abs(e.deltaY) ? e.deltaX : e.deltaY;
      currentX -= delta * 0.5;
      if (currentX > 0) currentX -= trackWidth;
      if (currentX < -trackWidth) currentX += trackWidth;
      track.style.transform = `translateX(${currentX}px)`;
      e.preventDefault();
    }, { passive: false });

    container.addEventListener('click', (e) => {
      if (isDragging) e.preventDefault();
    });
  }

  // --- CINEMATIC EASTER EGG (The "Resolve" Event) ---
  let resolveKeyBuffer = "";
  
  window.addEventListener('keydown', (e) => {
    if (!e.key) return;
    const key = e.key.toLowerCase();
    if ("resolve".includes(key)) {
      const expected = "resolve"[resolveKeyBuffer.length];
      if (key === expected) {
        resolveKeyBuffer += key;
        if (resolveKeyBuffer === "resolve") {
          triggerCinematicResolve();
          resolveKeyBuffer = "";
        }
      } else {
        resolveKeyBuffer = (key === 'r') ? 'r' : "";
      }
    } else {
      resolveKeyBuffer = "";
    }
  });

  function triggerCinematicResolve() {
    const overlay = document.createElement('div');
    overlay.className = 'resolve-event-overlay';
    document.documentElement.appendChild(overlay);
    
    const bg = document.createElement('div');
    bg.className = 'resolve-event-bg';
    overlay.appendChild(bg);
    
    const text = document.createElement('div');
    text.className = 'resolve-event-text';
    text.textContent = 'RESOLVE';
    overlay.appendChild(text);
    
    for (let i = 0; i < 3; i++) {
      const line = document.createElement('div');
      line.className = 'resolve-event-line';
      line.style.position = 'absolute';
      line.style.top = '50%';
      line.style.left = '0';
      line.style.marginTop = `${(i - 1) * 15}px`;
      overlay.appendChild(line);
      line.animate([
        { transform: 'translateY(-25vh) scaleX(0.5)', opacity: 0 },
        { transform: 'translateY(0) scaleX(1)', opacity: 0.8, offset: 0.5 },
        { transform: 'translateY(25vh) scaleX(0.5)', opacity: 0 }
      ], { duration: 2500, easing: 'cubic-bezier(0.4, 0, 0.2, 1)', delay: i * 200 });
    }

    bg.animate([
      { opacity: 0, backdropFilter: 'grayscale(0) blur(0px)' }, 
      { opacity: 1, backdropFilter: 'grayscale(1) blur(15px)', offset: 0.1 }, 
      { opacity: 1, backdropFilter: 'grayscale(1) blur(15px)', offset: 0.85 },
      { opacity: 0, backdropFilter: 'grayscale(0) blur(0px)' }
    ], { duration: 5000 });

    text.animate([
      { opacity: 0, scale: 0.85, filter: 'blur(30px)', letterSpacing: '12vw' },
      { opacity: 1, scale: 1, filter: 'blur(0px)', letterSpacing: '5vw', offset: 0.15 },
      { opacity: 1, scale: 1.02, filter: 'blur(0px)', letterSpacing: '4.5vw', offset: 0.8 },
      { opacity: 0, scale: 1.15, filter: 'blur(50px)', letterSpacing: '2vw' }
    ], { duration: 5000, easing: 'cubic-bezier(0.19, 1, 0.22, 1)' });

    for (let i = 0; i < 60; i++) {
      const p = document.createElement('div');
      p.className = 'resolve-event-particle';
      p.style.position = 'absolute';
      const left = Math.random() * 100;
      const delay = Math.random() * 1500;
      p.style.left = `${left}%`;
      p.style.top = '-15%';
      overlay.appendChild(p);

      p.animate([
        { transform: 'translateY(0) scaleY(1)', opacity: 0 },
        { transform: 'translateY(115vh) scaleY(4)', opacity: 0.8 }
      ], { duration: 1000 + Math.random() * 1000, easing: 'linear', delay: delay });
    }

    setTimeout(() => overlay.remove(), 5200);

    document.body.animate([
      { filter: 'brightness(1) saturate(1)' },
      { filter: 'brightness(2) saturate(0) contrast(1.5)', offset: 0.1 },
      { filter: 'brightness(1.5) saturate(0) contrast(1.2)', offset: 0.8 },
      { filter: 'brightness(1) saturate(1)' }
    ], { duration: 5000 });
  }

  // Global exports for inline HTML onclick handlers
  if (typeof window !== 'undefined') {
    window.openSelectionModal = typeof openSelectionModal !== 'undefined' ? openSelectionModal : () => { };
    window.closeSelectionModal = typeof closeSelectionModal !== 'undefined' ? closeSelectionModal : () => { };
    window.openRegistration = typeof openRegistration !== 'undefined' ? openRegistration : () => { };
    window.closeRegistration = typeof closeRegistration !== 'undefined' ? closeRegistration : () => { };
    window.openDelRegistration = typeof openDelRegistration !== 'undefined' ? openDelRegistration : () => { };
    window.closeDelRegistration = typeof closeDelRegistration !== 'undefined' ? closeDelRegistration : () => { };
    window.openOcRegistration = typeof openOcRegistration !== 'undefined' ? openOcRegistration : () => { };
    window.closeOcRegistration = typeof closeOcRegistration !== 'undefined' ? closeOcRegistration : () => { };
    window.openEbRegistration = typeof openEbRegistration !== 'undefined' ? openEbRegistration : () => { };
    window.closeEbRegistration = typeof closeEbRegistration !== 'undefined' ? closeEbRegistration : () => { };
    window.selectPathway = typeof selectPathway !== 'undefined' ? selectPathway : () => { };
    window.openSelection = typeof openSelection !== 'undefined' ? openSelection : (typeof openSelectionModal !== 'undefined' ? openSelectionModal : () => { });
    window.openTermsModal = typeof openTermsModal !== 'undefined' ? openTermsModal : () => { };
    window.closeTermsModal = typeof closeTermsModal !== 'undefined' ? closeTermsModal : () => { };
    window.openCommModal = typeof openCommModal !== 'undefined' ? openCommModal : () => { };
    window.closeCommModal = typeof closeCommModal !== 'undefined' ? closeCommModal : () => { };
    window.openCommitteeIntro = typeof openCommitteeIntro !== 'undefined' ? openCommitteeIntro : () => { };
    window.showCustomAlert = typeof showCustomAlert !== 'undefined' ? showCustomAlert : (msg) => alert(msg);
    window.nextStep = typeof nextStep !== 'undefined' ? nextStep : () => { };
    window.nextDelStep = typeof nextDelStep !== 'undefined' ? nextDelStep : () => { };
    window.nextOcStep = typeof nextOcStep !== 'undefined' ? nextOcStep : () => { };
    window.nextEbStep = typeof nextEbStep !== 'undefined' ? nextEbStep : () => { };
    window.updatePortfolioOptions = typeof updatePortfolioOptions !== 'undefined' ? updatePortfolioOptions : () => { };
    window.copyUPI = typeof copyUPI !== 'undefined' ? copyUPI : () => { };
    window.copyDelUPI = typeof copyDelUPI !== 'undefined' ? copyDelUPI : () => { };
    window.copyOcUPI = typeof copyOcUPI !== 'undefined' ? copyOcUPI : () => { };
    window.copyEbUPI = typeof copyEbUPI !== 'undefined' ? copyEbUPI : () => { };
    window.refreshDelegatePaymentQR = typeof refreshDelegatePaymentQR !== 'undefined' ? refreshDelegatePaymentQR : () => { };
    window.refreshDelegationPaymentQR = typeof refreshDelegationPaymentQR !== 'undefined' ? refreshDelegationPaymentQR : () => { };
    window.generateDynamicQR = typeof generateDynamicQR !== 'undefined' ? generateDynamicQR : () => { };
  }

})();
