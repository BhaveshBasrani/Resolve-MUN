"use client";

import { auth, submitDelegateApplication, onAuthStateChanged } from "@/lib/firebase";
import Link from "next/link";
import { MetalButton } from "@/components/ui/metal-button";
import { Sparkles, ArrowUpRight, FileText, X } from "lucide-react";
import React, { useState, useEffect, useRef } from "react";
import gsap from "gsap";
import { homeHtml } from "./pageContent";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { AuthModal } from "@/components/AuthModal";
import ModalShaderBackdrop from "@/components/ModalShaderBackdrop";
import { GradientBackground } from "@/components/ui/paper-design-shader-background";

export default function Home() {
  const [authOpen, setAuthOpen] = useState(false);
  const [authInitialMode, setAuthInitialMode] = useState("signup");
  const [currentUser, setCurrentUser] = useState(null);
  const currentUserRef = useRef(currentUser);
  useEffect(() => {
    currentUserRef.current = currentUser;
  }, [currentUser]);

  const [showWelcomeBox, setShowWelcomeBox] = useState(false);
  const [delegationInviteCode, setDelegationInviteCode] = useState(null);

  useEffect(() => {
    // Check URL for permanent delegation code
    if (typeof window !== 'undefined') {
      try {
        localStorage.removeItem('resolve_theme');
        document.documentElement.classList.remove('theme-light');
        document.body.classList.remove('theme-light');
      } catch (_) {}

      const params = new URLSearchParams(window.location.search);
      const del = params.get('del');
      if (del) {
        setDelegationInviteCode(del.trim());
        try {
          localStorage.setItem('resolve_perm_del', del.trim());
        } catch (_) {}
        setTimeout(() => {
          const banner = document.getElementById('delegationBanner');
          if (banner) banner.style.display = 'block';
          const span = document.getElementById('bannerDelCode');
          if (span) span.textContent = del.trim();
          if (!currentUserRef.current) {
            window.pendingPathway = 'delegation';
            setAuthOpen(true);
          } else {
            if (window.openDelRegistration) window.openDelRegistration();
          }
        }, 600);
      }
    }

    const syncUser = (rawUser) => {
      if (rawUser) {
        const uid = rawUser.uid || rawUser.id;
        const displayName =
          rawUser.displayName ||
          rawUser.user_metadata?.full_name ||
          rawUser.user_metadata?.name ||
          rawUser.email?.split("@")[0] ||
          "Delegate";
        const photoURL =
          rawUser.photoURL ||
          rawUser.user_metadata?.avatar_url ||
          rawUser.user_metadata?.picture ||
          "";

        const u = {
          ...rawUser,
          uid,
          displayName,
          photoURL,
        };

        if (typeof window !== "undefined") {
          localStorage.setItem("resolve_user_name", u.displayName || "");
          localStorage.setItem("resolve_user_email", u.email || "");
          localStorage.setItem("resolve_user_photo", u.photoURL || "");
          if (window.autofillAllKnownFields) window.autofillAllKnownFields(u);
        }

        const dismissed =
          typeof window !== "undefined"
            ? sessionStorage.getItem("resolve_welcome_dismissed_" + u.uid)
            : null;
        if (!dismissed) {
          setShowWelcomeBox(true);
        }
        if (typeof window !== "undefined" && window.pendingPathway) {
          const target = window.pendingPathway;
          window.pendingPathway = null;
          setTimeout(() => {
            if (window.selectPathway) window.selectPathway(target);
          }, 300);
        }
        setCurrentUser((prev) => {
          if (prev && prev.uid === uid && prev.email === rawUser.email) return prev;
          return u;
        });
      } else {
        setShowWelcomeBox(false);
        setCurrentUser(null);
      }
    };

    const unsubscribe = onAuthStateChanged(auth, (rawUser) => {
      syncUser(rawUser || null);
    });

    if (typeof window !== "undefined") {
      window.submitDelegateToFirebase = async (formData) => {
        const isVerified = Boolean(
          auth.currentUser &&
          (auth.currentUser.emailVerified || localStorage.getItem("resolve_user_verified") === "true")
        );
        if (!isVerified) {
          setAuthInitialMode("code");
          setAuthOpen(true);
          throw new Error("Email verification required. Please verify your email before submitting your application.");
        }
        return await submitDelegateApplication(formData, currentUserRef.current);
      };
      window.submitDelegateToSupabase = window.submitDelegateToFirebase;
    }

    return () => unsubscribe();
  }, []);
  const containerRef = useRef(null);

  const handleOpenSelection = (e) => {
    if (e && e.preventDefault) e.preventDefault();
    const isVerified = Boolean(
      auth.currentUser &&
      (auth.currentUser.emailVerified || (typeof window !== "undefined" && localStorage.getItem("resolve_user_verified") === "true"))
    );

    if (isVerified) {
      setAuthInitialMode("pathway");
    } else {
      setAuthInitialMode("signup");
    }
    setAuthOpen(true);
  };

  useEffect(() => {
    // Instant body loaded state
    if (typeof document !== 'undefined' && document.body) {
      document.body.classList.add('loaded');
    }

    // Instant Countdown Initialization (Never shows -- : --)
    let cdInterval = null;
    try {
      const countdownDate = new Date("2026-11-20T08:00:00");
      const updateCd = () => {
        const cdDays = document.getElementById("cd-days");
        const cdHours = document.getElementById("cd-hours");
        const cdMins = document.getElementById("cd-mins");
        const cdSecs = document.getElementById("cd-secs");
        if (!cdDays || !cdHours || !cdMins || !cdSecs) return;
        const now = new Date();
        const diff = countdownDate - now;
        if (diff <= 0) {
          cdDays.textContent = "00";
          cdHours.textContent = "00";
          cdMins.textContent = "00";
          cdSecs.textContent = "00";
          return;
        }
        const d = Math.floor(diff / (1000 * 60 * 60 * 24));
        const h = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const m = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
        const s = Math.floor((diff % (1000 * 60)) / 1000);
        cdDays.textContent = String(d).padStart(2, "0");
        cdHours.textContent = String(h).padStart(2, "0");
        cdMins.textContent = String(m).padStart(2, "0");
        cdSecs.textContent = String(s).padStart(2, "0");
      };
      updateCd();
      cdInterval = setInterval(updateCd, 1000);
    } catch (e) {
      console.warn("Countdown init error:", e);
    }

    // 1. Setup Global Window Modal Methods
    if (typeof window !== "undefined") {
      const closeModalById = (modalId) => {
        const modal = document.getElementById(modalId);
        if (modal) {
          modal.classList.remove("active");
        }
        const anyActive = document.querySelector(".modal-overlay.active");
        if (!anyActive) {
          document.body.style.overflow = "";
          document.body.classList.remove("modal-locked");
        }
        if (typeof window !== "undefined") {
          window.dispatchEvent(new Event("modalStateChange"));
        }
      };

      window.closeModalById = closeModalById;

      window.openAuthModal = function (mode = "signup") {
        setAuthInitialMode(mode);
        setAuthOpen(true);
      };
      window.closeAuthModal = function () {
        setAuthOpen(false);
      };

      window.openSelectionModal = function () {
        if (window.autofillAllKnownFields) window.autofillAllKnownFields();
        const isVerified = Boolean(
          auth.currentUser &&
          (auth.currentUser.emailVerified || (typeof window !== "undefined" && localStorage.getItem("resolve_user_verified") === "true"))
        );
        if (isVerified) {
          setAuthInitialMode("pathway");
        } else {
          setAuthInitialMode("signup");
        }
        setAuthOpen(true);
      };

      window.openSelection = window.openSelectionModal;
      window.openPathwayModal = window.openSelectionModal;

      // Helper: Lock permanent delegation banner & hidden field
      function applyPermanentDelegationLock() {
        if (typeof window === 'undefined') return;
        const permDel = localStorage.getItem('resolve_permanent_delegation') || sessionStorage.getItem('resolve_permanent_delegation');
        if (!permDel) return;

        const step1 = document.querySelector('#regModal #step1');
        if (step1 && !document.getElementById('regDelegationNotice')) {
          const notice = document.createElement('div');
          notice.id = 'regDelegationNotice';
          notice.innerHTML = `
            <div style="background: rgba(99, 102, 241, 0.15); border: 1px solid rgba(129, 140, 248, 0.4); border-radius: 12px; padding: 12px 16px; margin-bottom: 20px; display: flex; align-items: flex-start; gap: 12px;">
              <span style="font-size: 20px; line-height: 1;">🔒</span>
              <div>
                <div style="font-family: 'Oswald', sans-serif; font-weight: 700; color: #a5b4fc; font-size: 13px; letter-spacing: 0.05em; text-transform: uppercase;">
                  PERMANENT DELEGATION ASSIGNMENT: ${permDel}
                </div>
                <div style="font-size: 11px; color: rgba(255,255,255,0.7); line-height: 1.4; margin-top: 2px;">
                  You are registering as part of this official delegation. Under Resolve MUN conference regulations, delegation membership is permanent and cannot be modified or removed.
                </div>
              </div>
            </div>
          `;
          step1.insertBefore(notice, step1.firstChild);
        }

        let delInput = document.getElementById('regDelegationCode');
        if (!delInput) {
          delInput = document.createElement('input');
          delInput.type = 'hidden';
          delInput.id = 'regDelegationCode';
          delInput.name = 'delegationCode';
          const form = document.getElementById('regForm');
          if (form) form.appendChild(delInput);
        }
        if (delInput) delInput.value = permDel;
      }

      // Helper: Check 10-digit Indian phone
      function checkIndianPhoneValid(phoneStr) {
        if (!phoneStr) return false;
        let d = phoneStr.replace(/[^0-9]/g, '');
        if (d.length === 12 && d.startsWith('91')) d = d.slice(2);
        return d.length === 10 && /^[6-9]\d{9}$/.test(d);
      }

      // Helper: Send abandoned draft lead on Step 1
      function sendStep1DraftLead(type) {
        try {
          const scriptUrl = process.env.NEXT_PUBLIC_GOOGLE_APP_SCRIPT_URL || "https://script.google.com/macros/s/AKfycbxd_EyDHhJY1yokbma62PFcLu1SyBC-QXe32zb8JRIOUaJBowaivqNcgVwqk4HEsxTLpw/exec";
          const name = (document.getElementById("regName") || document.getElementById("delAdviserName"))?.value || "";
          const email = (document.getElementById("regEmail") || document.getElementById("delAdviserEmail"))?.value || "";
          const phone = (document.getElementById("regPhone") || document.getElementById("delAdviserPhone"))?.value || "";
          if (email && email.includes('@')) {
            fetch(scriptUrl, {
              method: 'POST',
              headers: { 'Content-Type': 'text/plain' },
              body: JSON.stringify({
                action: 'SAVE_DRAFT_LEAD',
                fullName: name || 'Prospect',
                email: email,
                phone: phone,
                formType: type === 'delegation' ? 'Delegation Registration' : 'Delegate Registration',
                step: 'Step 1: Personal Details'
              })
            }).catch(() => {});
          }
        } catch(e) {}
      }

      window.applyPermanentDelegationLock = applyPermanentDelegationLock;

      // Helper: Autofill all known fields from Google / Firebase login
      function autofillAllKnownFields(targetUser) {
        if (typeof window === 'undefined') return;
        const u = targetUser || auth.currentUser;
        const fullName = (u && u.displayName) || localStorage.getItem('resolve_user_name') || '';
        const email = (u && u.email) || localStorage.getItem('resolve_user_email') || '';

        if (!email && !fullName) return;

        // Persist to sync storage
        if (fullName) localStorage.setItem('resolve_user_name', fullName);
        if (email) localStorage.setItem('resolve_user_email', email);

        const dispatchEv = (el) => {
          if (!el) return;
          el.dispatchEvent(new Event('input', { bubbles: true }));
          el.dispatchEvent(new Event('change', { bubbles: true }));
        };

        const setVal = (id, val) => {
          const el = document.getElementById(id);
          if (el && val) {
            el.value = val;
            dispatchEv(el);
          }
        };

        // 1. Delegate Registration Form (#regModal)
        if (fullName) setVal('regName', fullName);
        if (email) setVal('regEmail', email);

        try {
          const raw = localStorage.getItem('resolveMunRegForm');
          const data = raw ? JSON.parse(raw) : {};
          if (fullName && !data.regName) data.regName = fullName;
          if (email) data.regEmail = email;
          localStorage.setItem('resolveMunRegForm', JSON.stringify(data));
        } catch(e) {}

        // 2. Delegation Registration Form (#delModal)
        if (fullName) {
          setVal('delAdviserName', fullName);
          setVal('del_name_1', fullName);
        }
        if (email) {
          setVal('delAdviserEmail', email);
          setVal('del_email_1', email);
        }

        try {
          const raw = localStorage.getItem('resolveMunDelForm');
          const data = raw ? JSON.parse(raw) : {};
          if (fullName && !data.delAdviserName) {
            data.delAdviserName = fullName;
            data.del_name_1 = fullName;
          }
          if (email) {
            data.delAdviserEmail = email;
            data.del_email_1 = email;
          }
          localStorage.setItem('resolveMunDelForm', JSON.stringify(data));
        } catch(e) {}

        // 3. Organizing Committee Form (#ocModal)
        if (fullName) setVal('ocName', fullName);
        if (email) setVal('ocEmail', email);

        // 4. Executive Board Form (#ebModal)
        if (fullName) setVal('ebName', fullName);
        if (email) setVal('ebEmail', email);

        // 5. Priority Waitlist & Global Inputs
        const waitlistInputs = document.querySelectorAll('input[name="waitlist_email"], #waitlistEmail, .waitlist-input');
        waitlistInputs.forEach(input => {
          if (input && email) {
            input.value = email;
            dispatchEv(input);
          }
        });

        // 6. Visual Autofill Badges
        const attachBadge = (badgeId, parentSelector) => {
          if (!email) return;
          const container = document.querySelector(parentSelector);
          if (container && !document.getElementById(badgeId)) {
            const badge = document.createElement('div');
            badge.id = badgeId;
            badge.className = 'google-autofill-badge';
            badge.innerHTML = `
              <div style="background: rgba(66, 133, 244, 0.08); border: 1px solid rgba(66, 133, 244, 0.28); border-radius: 10px; padding: 10px 14px; margin-bottom: 16px; display: flex; align-items: center; justify-content: space-between; gap: 10px;">
                <div style="display: flex; align-items: center; gap: 10px;">
                  <svg width="18" height="18" viewBox="0 0 24 24" style="flex-shrink:0;">
                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"/>
                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"/>
                  </svg>
                  <div>
                    <div style="font-size: 11px; font-weight: 700; color: #93c5fd; text-transform: uppercase; letter-spacing: 0.06em;">
                      Autofilled via Google Account
                    </div>
                    <div style="font-size: 11px; color: rgba(255,255,255,0.75); margin-top: 1px;">
                      ${fullName ? `${fullName} (${email})` : email}
                    </div>
                  </div>
                </div>
                <span style="font-size: 10px; font-family: monospace; color: #34d399; background: rgba(52, 211, 153, 0.12); border: 1px solid rgba(52, 211, 153, 0.25); padding: 2px 8px; border-radius: 9999px; text-transform: uppercase; font-weight: 600; white-space: nowrap;">
                  Verified
                </span>
              </div>
            `;
            container.insertBefore(badge, container.firstChild);
          }
        };

        attachBadge('regGoogleBadge', '#regModal #step1');
        attachBadge('delGoogleBadge', '#delModal #delStep1');
        attachBadge('ocGoogleBadge', '#ocModal .modal-body, #ocModal form');
        attachBadge('ebGoogleBadge', '#ebModal .modal-body, #ebModal form');
      }

      window.autofillAllKnownFields = autofillAllKnownFields;


      window.selectPathway = function (type) {
        if (window.autofillAllKnownFields) window.autofillAllKnownFields();
        closeModalById("selectionModal");

        // Auth & Verification Gate: Only verified users can proceed to forms
        const isVerified = Boolean(
          auth.currentUser &&
          (auth.currentUser.emailVerified || (typeof window !== "undefined" && localStorage.getItem("resolve_user_verified") === "true"))
        );

        if (!isVerified) {
          window.pendingPathway = type;
          setAuthInitialMode(auth.currentUser ? "code" : "signup");
          setAuthOpen(true);
          return;
        }

        if (type === "delegate") {
          window.openRegistration();
        } else if (type === "delegation") {
          window.openDelRegistration();
        } else if (type === "oc") {
          const ocModal = document.getElementById("ocModal");
          if (ocModal) {
            ocModal.classList.add("active");
            document.body.style.overflow = "hidden";
          }
        } else if (type === "eb") {
          const ebModal = document.getElementById("ebModal");
          if (ebModal) {
            ebModal.classList.add("active");
            document.body.style.overflow = "hidden";
          }
        } else if (type === "secretariat") {
          // Open secretariat application modal (secModal), fallback to ebModal
          const secModal = document.getElementById("secModal") || document.getElementById("ebModal");
          if (secModal) {
            secModal.classList.add("active");
            document.body.style.overflow = "hidden";
          }
        }
      };

      window.openRegistration = function () {
        if (window.autofillAllKnownFields) window.autofillAllKnownFields();
        // Auth & Verification Gate
        const isVerified = Boolean(
          auth.currentUser &&
          (auth.currentUser.emailVerified || (typeof window !== "undefined" && localStorage.getItem("resolve_user_verified") === "true"))
        );
        if (!isVerified) {
          window.pendingPathway = "delegate";
          setAuthInitialMode(auth.currentUser ? "code" : "signup");
          setAuthOpen(true);
          return;
        }

        const regModal = document.getElementById("regModal");
        if (regModal) {
          // Auto-prefill authenticated user info
          if (auth.currentUser) {
            const nameEl = document.getElementById("regName");
            const emailEl = document.getElementById("regEmail");
            if (nameEl && !nameEl.value) nameEl.value = auth.currentUser.displayName || "";
            if (emailEl && !emailEl.value) emailEl.value = auth.currentUser.email || "";
          }

          // Apply delegation lock
          applyPermanentDelegationLock();

          // Attach phone validation and draft lead beacon
          const nextBtn1 = regModal.querySelector('.btn-next');
          if (nextBtn1 && !nextBtn1.dataset.leadAttached) {
            nextBtn1.dataset.leadAttached = "true";
            nextBtn1.addEventListener('click', () => {
              const phoneInput = document.getElementById("regPhone");
              if (phoneInput && phoneInput.value && !checkIndianPhoneValid(phoneInput.value)) {
                alert("Please enter a valid 10-digit Indian phone number (+91 6xxxxxxxxx to 9xxxxxxxxx).");
                return;
              }
              sendStep1DraftLead('delegate');
            });
          }

          regModal.classList.add("active");
          document.body.style.overflow = "hidden";
        }
      };

      window.openDelRegistration = function () {
        if (window.autofillAllKnownFields) window.autofillAllKnownFields();
        // Auth & Verification Gate
        const isVerified = Boolean(
          auth.currentUser &&
          (auth.currentUser.emailVerified || (typeof window !== "undefined" && localStorage.getItem("resolve_user_verified") === "true"))
        );
        if (!isVerified) {
          window.pendingPathway = "delegation";
          setAuthInitialMode(auth.currentUser ? "code" : "signup");
          setAuthOpen(true);
          return;
        }

        const delModal = document.getElementById("delModal");
        if (delModal) {
          if (auth.currentUser) {
            const headNameEl = document.getElementById("delAdviserName");
            const headEmailEl = document.getElementById("delAdviserEmail");
            if (headNameEl && !headNameEl.value) headNameEl.value = auth.currentUser.displayName || "";
            if (headEmailEl && !headEmailEl.value) headEmailEl.value = auth.currentUser.email || "";
          }

          const delNextBtn = delModal.querySelector('.btn-next');
          if (delNextBtn && !delNextBtn.dataset.leadAttached) {
            delNextBtn.dataset.leadAttached = "true";
            delNextBtn.addEventListener('click', () => {
              const phoneInput = document.getElementById("delAdviserPhone");
              if (phoneInput && phoneInput.value && !checkIndianPhoneValid(phoneInput.value)) {
                alert("Please enter a valid 10-digit Indian phone number (+91).");
                return;
              }
              sendStep1DraftLead('delegation');
            });
          }

          delModal.classList.add("active");
          document.body.style.overflow = "hidden";
        }
      };

      window.openCommModal = function (name, icon, bgUrl) {
        const modal = document.getElementById("commModal");
        if (!modal) return;
        const mTitle = document.getElementById("commModalTitle");
        const mIcon = document.getElementById("commModalIcon");
        const bgBtn = document.getElementById("commModalBgBtn");
        if (mTitle) mTitle.innerText = name || "RESOLVE 2026";
        if (mIcon && icon) mIcon.innerText = icon;
        if (bgBtn) {
          if (bgUrl) {
            window.currentCommBg = bgUrl;
            bgBtn.style.display = "inline-block";
          } else {
            bgBtn.style.display = "none";
          }
        }
        modal.classList.add("active");
        document.body.style.overflow = "hidden";
      };

      window.closeCommModal = function () {
        closeModalById("commModal");
      };

      window.openTermsModal = function () {
        const modal = document.getElementById("termsModal");
        if (modal) {
          modal.classList.add("active");
          document.body.style.overflow = "hidden";
        }
      };

      window.closeTermsModal = function () {
        closeModalById("termsModal");
      };

      window.showCustomAlert = function (msg, type) {
        const container = document.getElementById("custom-alert-container");
        if (!container) {
          alert(msg);
          return;
        }
        const alertEl = document.createElement("div");
        alertEl.className = "custom-alert " + (type || "default");
        alertEl.innerHTML = `
          <div class="custom-alert-content">${msg}</div>
          <button class="custom-alert-close" aria-label="Close">
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          </button>
        `;
        container.appendChild(alertEl);
        const closeBtn = alertEl.querySelector('.custom-alert-close');
        const dismiss = () => {
          alertEl.classList.add("fade-out");
          setTimeout(() => alertEl.remove(), 350);
        };
        if (closeBtn) closeBtn.onclick = dismiss;
        setTimeout(dismiss, 3800);
      };

      window.copyUPI = function () {
        const upi =
          document.getElementById("upiID")?.innerText ||
          "bhoomianilbasrani@okhdfcbank";
        navigator.clipboard?.writeText(upi);
        if (window.showCustomAlert)
          window.showCustomAlert("UPI ID copied: " + upi, "success");
      };

      window.copyDelUPI = function () {
        const upi =
          document.getElementById("delUpiID")?.innerText ||
          "bhoomianilbasrani@okhdfcbank";
        navigator.clipboard?.writeText(upi);
        if (window.showCustomAlert)
          window.showCustomAlert("UPI ID copied: " + upi, "success");
      };

      window.copyOcUPI = function () {
        const upi =
          document.getElementById("ocUpiID")?.innerText ||
          "bhoomianilbasrani@okhdfcbank";
        navigator.clipboard?.writeText(upi);
        if (window.showCustomAlert)
          window.showCustomAlert("UPI ID copied: " + upi, "success");
      };

      window.generateDynamicQR = function (amountStr, imgElementId, upiTextElementId) {
        let cleanAmount = "2199";
        if (amountStr) {
          cleanAmount = String(amountStr).replace(/[^0-9.]/g, "") || "2199";
        }
        const currentPayee = {
          pa: "bhoomianilbasrani@okhdfcbank",
          pn: "Bhoomi Basrani",
        };
        const upiText = document.getElementById(upiTextElementId);
        if (upiText) upiText.innerText = currentPayee.pa;

        const qrImage = document.getElementById(imgElementId);
        if (!qrImage) return;

        const upiString = `upi://pay?pa=${currentPayee.pa}&pn=${encodeURIComponent(currentPayee.pn)}&am=${cleanAmount}&cu=INR`;
        qrImage.src = `https://quickchart.io/qr?size=320&text=${encodeURIComponent(upiString)}`;
      };

      // Live Screenshot preview handler
      const attachFilePreview = (inputId, nameSpanId, previewId) => {
        const input = document.getElementById(inputId);
        const nameSpan = document.getElementById(nameSpanId);
        const preview = document.getElementById(previewId);
        if (!input || input.__previewAttached) return;
        input.__previewAttached = true;
        input.addEventListener("change", function () {
          if (this.files && this.files[0]) {
            const file = this.files[0];
            if (nameSpan) {
              nameSpan.textContent = file.name;
              nameSpan.style.color = "#22c55e";
            }
            if (preview && file.type.startsWith("image/")) {
              const reader = new FileReader();
              reader.onload = (e) => {
                const sizeKb = (file.size / 1024).toFixed(1);
                preview.innerHTML = `
                  <img src="${e.target.result}" alt="Proof" style="width: 42px; height: 42px; object-fit: cover; border-radius: 6px; border: 1px solid rgba(255,255,255,0.2);">
                  <div style="flex: 1; min-width: 0;">
                    <p style="margin: 0; font-size: 11px; font-weight: 700; color: #fff; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">${file.name}</p>
                    <p style="margin: 2px 0 0 0; font-size: 10px; color: #22c55e; font-weight: 600;">Payment Screenshot Attached (${sizeKb} KB) ✓</p>
                  </div>
                `;
                preview.style.display = "flex";
              };
              reader.readAsDataURL(file);
            }
          }
        });
      };
      setTimeout(() => {
        attachFilePreview("regDriveLink", "regDriveFileName", "regScreenshotPreview");
        attachFilePreview("delDriveLink", "delDriveFileName", "delScreenshotPreview");
        attachFilePreview("ocDriveLink", "ocDriveFileName", "ocScreenshotPreview");
      }, 500);

      window.closeSecModal = function () {
        closeModalById("secModal");
      };

      window.nextSecStep = function (step) {
        const form = document.getElementById("secRegForm");
        if (!form) return;
        if (step === 2) {
          const name = document.getElementById("secName")?.value?.trim();
          const phone = document.getElementById("secPhone")?.value?.trim();
          const email = document.getElementById("secEmail")?.value?.trim();
          const inst = document.getElementById("secInst")?.value?.trim();
          const dept = document.getElementById("secDept")?.value;
          if (!name || !phone || !email || !inst || !dept) {
            if (window.showCustomAlert) window.showCustomAlert("Please fill in all required fields.", "warning");
            else alert("Please fill in all required fields.");
            return;
          }
        }
        if (step === 3) {
          const exp = document.getElementById("secExp")?.value?.trim();
          const why = document.getElementById("secWhy")?.value?.trim();
          if (!exp || !why) {
            if (window.showCustomAlert) window.showCustomAlert("Please complete the experience and vision fields.", "warning");
            else alert("Please complete the experience and vision fields.");
            return;
          }
        }
        for (let i = 1; i <= 3; i++) {
          const stepEl = document.getElementById(`secStep${i}`);
          const pillEl = document.getElementById(`secPill${i}`);
          if (stepEl) {
            if (i === step) stepEl.classList.add("active");
            else stepEl.classList.remove("active");
          }
          if (pillEl) {
            if (i <= step) pillEl.classList.add("active");
            else pillEl.classList.remove("active");
          }
        }
      };

      window.submitSecForm = async function (e) {
        if (e && e.preventDefault) e.preventDefault();
        const isVerified = Boolean(
          auth.currentUser &&
          (auth.currentUser.emailVerified || (typeof window !== "undefined" && localStorage.getItem("resolve_user_verified") === "true"))
        );
        if (!isVerified) {
          setAuthInitialMode(auth.currentUser ? "code" : "signup");
          setAuthOpen(true);
          if (window.showCustomAlert) {
            window.showCustomAlert("Email verification required before applying for Secretariat.", "warning");
          } else {
            alert("Email verification required before applying for Secretariat.");
          }
          return;
        }

        const btn = document.getElementById("secSubmitBtn");
        if (btn) {
          btn.disabled = true;
          btn.innerText = "Submitting Application...";
        }
        const payload = {
          pathway: "SECRETARIAT",
          fullName: document.getElementById("secName")?.value || "",
          phone: document.getElementById("secPhone")?.value || "",
          email: document.getElementById("secEmail")?.value || "",
          institution: document.getElementById("secInst")?.value || "",
          department: document.getElementById("secDept")?.value || "",
          experience: document.getElementById("secExp")?.value || "",
          vision: document.getElementById("secWhy")?.value || "",
          portfolio: document.getElementById("secPortfolio")?.value || "",
          timestamp: new Date().toISOString(),
        };
        try {
          await fetch("/api/registration", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload),
          });
          if (window.showCustomAlert) {
            window.showCustomAlert("Secretariat Application submitted successfully!", "success");
          } else {
            alert("Secretariat Application submitted successfully!");
          }
          closeModalById("secModal");
        } catch (err) {
          console.error(err);
          if (window.showCustomAlert) {
            window.showCustomAlert("Submitted! Secretariat will review your dossier.", "success");
          } else {
            alert("Submitted! Secretariat will review your dossier.");
          }
          closeModalById("secModal");
        } finally {
          if (btn) {
            btn.disabled = false;
            btn.innerText = "Submit Application";
          }
        }
      };

      // Modal close buttons
      const modalList = [
        "selectionModal",
        "regModal",
        "delModal",
        "ocModal",
        "ebModal",
        "secModal",
        "commModal",
        "termsModal",
      ];
      const closeButtons = [
        { btnId: "closeSelectionModal", modalId: "selectionModal" },
        { btnId: "closeModal", modalId: "regModal" },
        { btnId: "closeDelModal", modalId: "delModal" },
        { btnId: "closeOcModal", modalId: "ocModal" },
        { btnId: "closeEbModal", modalId: "ebModal" },
        { btnId: "closeSecModal", modalId: "secModal" },
      ];

      closeButtons.forEach(({ btnId, modalId }) => {
        const btn = document.getElementById(btnId);
        if (btn) {
          btn.onclick = (e) => {
            e.stopPropagation();
            closeModalById(modalId);
          };
        }
      });

      // Catch-all for any close button with .modal-close class
      document.querySelectorAll(".modal-close").forEach((btn) => {
        btn.addEventListener("click", () => {
          const parentOverlay = btn.closest(".modal-overlay");
          if (parentOverlay && parentOverlay.id) {
            closeModalById(parentOverlay.id);
          } else if (parentOverlay) {
            parentOverlay.classList.remove("active");
            if (typeof window !== "undefined") {
              window.dispatchEvent(new Event("modalStateChange"));
            }
          }
        });
      });

      // Overlay background click to close
      modalList.forEach((modalId) => {
        const modal = document.getElementById(modalId);
        if (modal) {
          modal.addEventListener("click", (e) => {
            if (e.target === modal) {
              closeModalById(modalId);
            }
          });
        }
      });

      // Escape key to dismiss any active modal
      const handleEscape = (e) => {
        if (e.key === "Escape") {
          modalList.forEach(closeModalById);
        }
      };
      window.addEventListener("keydown", handleEscape);
    }

    
    // GSAP Fast & Silky Smooth Hero Entrance Timeline
    try {
      const tl = gsap.timeline({ defaults: { ease: "power3.out" } });
      tl.fromTo(
        ".hero-eyebrow",
        { opacity: 0, y: -12 },
        { opacity: 1, y: 0, duration: 0.45, delay: 0.05 }
      )
      .fromTo(
        ".hero-title span:first-child",
        { opacity: 0, y: 25, filter: "blur(4px)" },
        { opacity: 1, y: 0, filter: "blur(0px)", duration: 0.5 },
        "-=0.35"
      )
      .fromTo(
        ".hero-title .mun",
        { opacity: 0, y: 30, filter: "blur(4px)" },
        { opacity: 1, y: 0, filter: "blur(0px)", duration: 0.55 },
        "-=0.4"
      )
      .fromTo(
        ".hero-tagline",
        { opacity: 0, y: 12 },
        { opacity: 1, y: 0, duration: 0.4 },
        "-=0.35"
      )
      .fromTo(
        ".hero-meta-item",
        { opacity: 0, y: 14 },
        { opacity: 1, y: 0, duration: 0.4, stagger: 0.05 },
        "-=0.3"
      )
      .fromTo(
        ".hero-meta-divider",
        { scaleY: 0, opacity: 0 },
        { scaleY: 1, opacity: 1, duration: 0.35, stagger: 0.04 },
        "-=0.35"
      )
      .fromTo(
        ".hero-actions",
        { opacity: 0, y: 16 },
        { opacity: 1, y: 0, duration: 0.45, ease: "power2.out" },
        "-=0.25"
      );
    } catch (e) {
      console.warn("GSAP timeline init:", e);
    }

    // 2. Guarantee 100% visibility of all sections (.reveal)
    const makeAllVisible = () => {
      document.querySelectorAll(".reveal").forEach((el) => {
        el.classList.add("visible");
      });
      if (document.body) {
        document.body.classList.add("loaded");
      }
    };

    if ("IntersectionObserver" in window) {
      const revealObserver = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              entry.target.classList.add("visible");
            }
          });
        },
        { threshold: 0.05, rootMargin: "150px 0px 150px 0px" }
      );

      document.querySelectorAll(".reveal").forEach((el) => revealObserver.observe(el));
    }

    // Immediate and staggered sweeps to ensure everything is visible
    makeAllVisible();
    const t1 = setTimeout(makeAllVisible, 300);
    const t2 = setTimeout(makeAllVisible, 1000);

    // 3. Fast, ultra-smooth cinematic loading screen dismissal (Non-hang)
    const dismissLoader = () => {
      const loader = document.getElementById("loading-screen");
      if (loader && !loader.classList.contains("hidden")) {
        loader.classList.add("hidden");
        setTimeout(() => {
          if (loader) loader.style.display = "none";
        }, 380);
      }
    };

    const loaderTimer = setTimeout(dismissLoader, 400);
    const hardSafetyTimer = setTimeout(dismissLoader, 900);

    return () => {
      if (cdInterval) clearInterval(cdInterval);
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(loaderTimer);
      clearTimeout(hardSafetyTimer);
    };
  }, []);

  return (
    <>
      <Navbar />

      {/* HERO SECTION WITH BOUNDED SHADER BACKGROUND ONLY */}
      <section
        id="hero"
        style={{
          position: "relative",
          minHeight: "100vh",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          textAlign: "center",
          padding: "clamp(85px, 12vh, 110px) 24px clamp(28px, 4vh, 45px)",
          boxSizing: "border-box",
          overflow: "hidden",
        }}
      >
        {/* Immersive Shader Background */}
        <div style={{ position: "absolute", inset: 0, zIndex: 0, pointerEvents: "none", overflow: "hidden" }}>
          <GradientBackground
            colors={["hsl(224, 95%, 58%)", "hsl(262, 90%, 56%)", "hsl(205, 100%, 52%)", "hsl(275, 88%, 54%)"]}
            colorBack="hsl(232, 45%, 4%)"
            intensity={0.82}
            softness={0.72}
            speed={0.85}
            style={{ position: "absolute", inset: 0, zIndex: 0 }}
          />
          {/* Luminous atmospheric depth & vignette */}
          <div
            style={{
              position: "absolute",
              inset: 0,
              zIndex: 1,
              background:
                "radial-gradient(circle 900px at 50% 38%, rgba(99, 102, 241, 0.16) 0%, transparent 65%), radial-gradient(ellipse 90% 70% at 50% 20%, transparent 30%, rgba(5,5,10,0.5) 75%, #050508 100%), linear-gradient(to bottom, transparent 65%, #050508 100%)",
            }}
          />
          {/* Subtle grid overlay */}
          <div className="hero-grid" style={{ zIndex: 2 }} />
        </div>

        {/* Particles */}
        <canvas
          className="particles-canvas"
          id="particles"
          style={{ position: "absolute", inset: 0, zIndex: 3, pointerEvents: "none" }}
        />

        {/* Foreground Content — Perfectly fitted, zero cutoff */}
        <div style={{ position: "relative", zIndex: 10, width: "100%", maxWidth: "900px", margin: "0 auto" }}>
          {/* Eyebrow */}
          <div className="hero-eyebrow">
            20TH - 22ND NOVEMBER 2026
          </div>

          {/* Adaptive Hero Title — NEVER overlaps navbar */}
          <h1 className="hero-title">
            <span>RESOLVE</span>
            <span className="mun">MUN</span>
          </h1>

          {/* Tagline */}
          <p className="hero-tagline">
            <strong>Resolve.</strong>&nbsp; Reform. &nbsp;<strong>Reconcile.</strong>
          </p>

          {/* Stats: Exact archive design, Committees = Releasing Soon */}
          <div className="hero-meta">
            <div className="hero-meta-item">
              <span className="label">Edition</span>
              <span className="value" data-target="2026">2026</span>
            </div>
            <div className="hero-meta-divider" />
            <div className="hero-meta-item">
              <span className="label">Delegates</span>
              <span className="value-container">
                <span className="value" data-target="250">250</span>
                <span className="value-suffix">+</span>
              </span>
            </div>
            <div className="hero-meta-divider" />
            <div className="hero-meta-item">
              <span className="label">Committees</span>
              <span className="value text-[1.1rem] tracking-wider text-blue-300">RELEASING SOON</span>
            </div>
            <div className="hero-meta-divider" />
            <div className="hero-meta-item">
              <span className="label">Days</span>
              <span className="value" data-target="3">3</span>
            </div>
          </div>

          {/* Action Buttons: Register Now + Dotted Wrapped Releasing Soon Brochure */}
          <div className="hero-actions reveal">
            <MetalButton
              preset="chromatic"
              size="md"
              strength={1}
              onClick={handleOpenSelection}
              className="adaptive-hero-btn"
            >
              REGISTER NOW
            </MetalButton>

            {/* Delegate Brochure wrapped in dotted border with Releasing Soon */}
            <div className="dotted-brochure-wrap">
              <span className="dotted-badge">RELEASING SOON</span>
              <button
                type="button"
                disabled
                className="adaptive-hero-btn opacity-60 cursor-not-allowed pointer-events-none"
              >
                DELEGATE BROCHURE
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* CRAZY WORD CAROUSEL / MARQUEE STRIP */}
      <div className="word-carousel-strip">
        <div className="marquee-track">
          <span>RESOLVE MUN 2.0</span>
          <span className="dot">•</span>
          <span>DIPLOMACY</span>
          <span className="dot">•</span>
          <span>REFORM</span>
          <span className="dot">•</span>
          <span>RECONCILE</span>
          <span className="dot">•</span>
          <span>LEADERSHIP</span>
          <span className="dot">•</span>
          <span>HYDERABAD 2026</span>
          <span className="dot">•</span>
          <span>GLOBAL CRISES</span>
          <span className="dot">•</span>
          <span>DEBATE & CONSENSUS</span>
          <span className="dot">•</span>
          <span>RESOLVE MUN 2.0</span>
          <span className="dot">•</span>
          <span>DIPLOMACY</span>
          <span className="dot">•</span>
          <span>REFORM</span>
          <span className="dot">•</span>
          <span>RECONCILE</span>
          <span className="dot">•</span>
          <span>LEADERSHIP</span>
          <span className="dot">•</span>
          <span>HYDERABAD 2026</span>
          <span className="dot">•</span>
          <span>GLOBAL CRISES</span>
          <span className="dot">•</span>
          <span>DEBATE & CONSENSUS</span>
        </div>
      </div>

      {/* Main Page HTML Content (Countdown, About, Letter, Committees, Venue, Secretariat, Sponsors, Applications, Modals) */}
      <div
        id="main-container"
        ref={containerRef}
        dangerouslySetInnerHTML={{ __html: homeHtml }}
      />
      
      {/* Universal Footer with Theme Toggler */}
      <Footer />
      
      {/* POST-AUTH WELCOME DIALOG (Diplomatic Luxury Identity) */}
      {showWelcomeBox && currentUser && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/80 backdrop-blur-xl animate-in fade-in duration-200">
          <div className="relative w-full max-w-sm p-5 sm:p-6 rounded-2xl border border-white/15 bg-[#060814]/98 backdrop-blur-3xl shadow-[0_24px_70px_rgba(0,0,0,0.95),0_0_30px_rgba(99,102,241,0.12)] text-center overflow-hidden">
            {/* Top Hairline Accent */}
            <div className="absolute top-0 inset-x-0 h-[1px] bg-gradient-to-r from-transparent via-indigo-400/50 to-transparent" />

            {/* Minimalist Close Icon */}
            <button
              type="button"
              onClick={() => {
                sessionStorage.setItem("resolve_welcome_dismissed_" + currentUser.uid, "true");
                setShowWelcomeBox(false);
              }}
              className="absolute top-3.5 right-3.5 w-6.5 h-6.5 rounded-xl text-white/40 hover:text-white hover:bg-white/[0.06] flex items-center justify-center transition-colors cursor-pointer"
              aria-label="Close dialog"
            >
              <X className="w-3.5 h-3.5" />
            </button>

            {/* Official Resolve MUN Emblem */}
            <div className="w-10 h-10 mx-auto mb-3 rounded-xl bg-white/[0.03] border border-white/10 p-1.5 flex items-center justify-center shadow-inner">
              <img
                src="https://resolvemun.in/images/Logo.svg"
                alt="Resolve MUN Emblem"
                className="w-full h-full object-contain filter brightness-110 drop-shadow-[0_0_8px_rgba(255,255,255,0.25)]"
              />
            </div>

            {/* Eyebrow & Title */}
            <span className="font-mono text-[9px] tracking-[0.2em] text-indigo-300 uppercase block mb-1 font-semibold">
              CREDENTIALS VERIFIED · RESOLVE 2026
            </span>
            <h3
              className="text-lg sm:text-xl font-extrabold uppercase tracking-wide text-white mb-1.5"
              style={{ fontFamily: "'Oswald', sans-serif" }}
            >
              WELCOME, {currentUser.displayName ? currentUser.displayName.split(" ")[0] : "DELEGATE"}
            </h3>

            {/* Diplomatic Copy */}
            <p className="text-[11px] text-white/60 leading-relaxed max-w-xs mx-auto mb-4 font-normal">
              Your delegate session is active. Access your official committee allotment matrix, encrypted digital QR pass, and conference dossier from the Command Dashboard.
            </p>

            {/* Micro Credential Strip */}
            <div className="flex items-center justify-center gap-2 py-1.5 px-2.5 rounded-lg bg-white/[0.02] border border-white/5 text-[9px] font-mono text-white/50 mb-4">
              <span>STATUS: <strong className="text-emerald-400 font-semibold">VERIFIED</strong></span>
              <span className="text-white/20">|</span>
              <span>ROLE: <strong className="text-white/80 font-semibold">DELEGATE</strong></span>
              <span className="text-white/20">|</span>
              <span>SUMMIT: <strong className="text-purple-300 font-semibold">RESOLVE 2.0</strong></span>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-2">
              <Link
                href="/dashboard"
                onClick={() => {
                  sessionStorage.setItem("resolve_welcome_dismissed_" + currentUser.uid, "true");
                  setShowWelcomeBox(false);
                }}
                className="flex-1 inline-flex items-center justify-center gap-1.5 h-9.5 px-4 rounded-xl bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 text-white font-bold text-xs tracking-wider uppercase shadow-[0_0_15px_rgba(99,102,241,0.3)] hover:shadow-[0_0_25px_rgba(99,102,241,0.45)] active:scale-[0.98] transition-all cursor-pointer"
              >
                <span>ACCESS DASHBOARD</span>
                <ArrowUpRight className="w-3 h-3" />
              </Link>
              <button
                type="button"
                onClick={() => {
                  sessionStorage.setItem("resolve_welcome_dismissed_" + currentUser.uid, "true");
                  setShowWelcomeBox(false);
                }}
                className="h-9.5 px-4 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] border border-white/10 text-white/70 hover:text-white text-xs font-semibold tracking-wide transition-colors cursor-pointer"
              >
                CONTINUE BROWSING
              </button>
            </div>
          </div>
        </div>
      )}

      <ModalShaderBackdrop />
      <AuthModal
        isOpen={authOpen}
        initialMode={authInitialMode}
        onClose={() => setAuthOpen(false)}
      />
    </>
  );
}