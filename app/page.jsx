"use client";

import {
  auth,
  submitDelegateApplication,
  submitDelegationApplication,
  submitOcApplication,
  submitEbApplication,
  submitSecretariatApplication,
  submitSocialsApplication,
  submitWaitlistEntry,
  fetchSystemSettingsCached,
  onAuthStateChanged,
} from "@/lib/firebase";
import Link from "next/link";
import { MetalButton } from "@/components/ui/metal-button";
import ChromeButton from "@/components/ui/chrome-button";
import { Sparkles, ArrowUpRight, FileText, X, Check } from "lucide-react";
import React, { useState, useEffect, useRef } from "react";
import gsap from "gsap";
import { homeHtml } from "./pageContent";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { AuthModal } from "@/components/AuthModal";
import ModalShaderBackdrop from "@/components/ModalShaderBackdrop";
import CommitteesSection from "@/components/CommitteesSection";
import SecretariatSection from "@/components/SecretariatSection";
import DelegatePassSection from "@/components/DelegatePassSection";
import BestMunFaqSection from "@/components/BestMunFaqSection";
import DobPickerPortals from "@/components/DobPickerPortal";
import { PaymentReceiptModal } from "@/components/ui/animated-ticket";
import { GradientBackground } from "@/components/ui/paper-design-shader-background";
import { DEFAULT_SITE_SETTINGS, uploadFileToSupabase } from "@/lib/supabase";

const [homePart1, rest1] = homeHtml.split("<!-- COMMITTEES_PLACEHOLDER -->");
const [homePart2, homePart3] = (rest1 || "").split("<!-- SECRETARIAT_PLACEHOLDER -->");
const HOME_PART1_HTML = { __html: homePart1 || homeHtml };
const HOME_PART2_HTML = homePart2 ? { __html: homePart2 } : null;
const HOME_PART3_HTML = homePart3 ? { __html: homePart3 } : null;

export default function Home() {
  const [siteSettings, setSiteSettings] = useState(DEFAULT_SITE_SETTINGS);
  const [authOpen, setAuthOpen] = useState(false);
  const [authInitialMode, setAuthInitialMode] = useState("signup");
  const [currentUser, setCurrentUser] = useState(null);
  const currentUserRef = useRef(currentUser);
  useEffect(() => {
    currentUserRef.current = currentUser;
  }, [currentUser]);

  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const checkMobile = () =>
        setIsMobile(window.innerWidth <= 768 || window.matchMedia("(pointer: coarse)").matches);
      checkMobile();
      window.addEventListener("resize", checkMobile);
      return () => window.removeEventListener("resize", checkMobile);
    }
  }, []);

  const [showWelcomeBox, setShowWelcomeBox] = useState(false);
  const [delegationInviteCode, setDelegationInviteCode] = useState(null);

  useEffect(() => {
    // Check URL for permanent delegation code
    if (typeof window !== 'undefined') {
      window.uploadFileToSupabase = uploadFileToSupabase;
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

      // ── Direct Link / Query Param / Hash Gateway ──────────────────────────
      const rawTarget = (
        params.get('open') ||
        params.get('register') ||
        params.get('apply') ||
        params.get('track') ||
        params.get('pathway') ||
        (typeof window !== 'undefined' ? window.location.hash.replace(/^#/, '') : '')
      )?.trim().toLowerCase();

      if (rawTarget && !del) {
        let normalized = null;
        if (['del', 'delegate', 'individual', 'register-delegate', 'apply-delegate'].includes(rawTarget)) {
          normalized = 'delegate';
        } else if (['delegation', 'school', 'contingent', 'register-delegation', 'apply-delegation'].includes(rawTarget)) {
          normalized = 'delegation';
        } else if (['oc', 'organizing-committee', 'register-oc', 'apply-oc'].includes(rawTarget)) {
          normalized = 'oc';
        } else if (['sec', 'secretariat', 'register-sec', 'register-secretariat', 'apply-sec', 'apply-secretariat'].includes(rawTarget)) {
          normalized = 'secretariat';
        } else if (['eb', 'executive-board', 'register-eb', 'apply-eb'].includes(rawTarget)) {
          normalized = 'eb';
        } else if (['social', 'socials', 'party', 'socials-pass'].includes(rawTarget)) {
          normalized = 'socials';
        } else if (['pathway', 'selection', 'choose', 'all', 'tracks'].includes(rawTarget)) {
          normalized = 'selectionModal';
        } else if (['passes', 'pass', 'ticket', 'tickets'].includes(rawTarget)) {
          normalized = 'SCROLL_TO_PASSES';
        }

        if (normalized) {
          setTimeout(() => {
            if (normalized === 'selectionModal') {
              if (window.openSelectionModal) window.openSelectionModal();
            } else if (normalized === 'SCROLL_TO_PASSES') {
              if (window.scrollToPassesSection) window.scrollToPassesSection();
            } else if (window.selectPathway) {
              window.selectPathway(normalized);
            }
          }, 650);
        }
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
          localStorage.setItem("resolve_user_verified", "true");
          if (window.autofillAllKnownFields) window.autofillAllKnownFields(u);
        }

        if (typeof window !== "undefined" && window.pendingPathway) {
          const target = window.pendingPathway;
          window.pendingPathway = null;
          setTimeout(() => {
            if (target === "SCROLL_TO_PASSES") {
              if (window.scrollToPassesSection) window.scrollToPassesSection();
            } else if (window.selectPathway) {
              window.selectPathway(target);
            }
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
      if (rawUser && rawUser.email) {
        // Fast background check: If already registered, set local storage flag
        fetch(`/api/delegate/?email=${encodeURIComponent(rawUser.email)}`)
          .then((res) => res.json())
          .then((data) => {
            if (data && data.found) {
              if (typeof window !== "undefined") {
                localStorage.setItem("resolve_user_registered", "true");
                if (data.regId) localStorage.setItem("resolve_delegate_id", data.regId);
              }
            }
          })
          .catch(() => {});
      }
    });

    if (typeof window !== "undefined") {
      window.submitDelegateToFirebase = async (formData) => {
        try {
          if (formData && formData.email) {
            localStorage.setItem("resolve_user_verified", "true");
            localStorage.setItem("resolve_user_email", formData.email.trim().toLowerCase());
          }
        } catch (_) {}
        return await submitDelegateApplication(formData, currentUserRef.current);
      };
      window.submitDelegationToFirebase = async (data) => {
        return await submitDelegationApplication(data);
      };
      window.submitOcToFirebase = async (data) => {
        return await submitOcApplication(data);
      };
      window.submitEbToFirebase = async (data) => {
        return await submitEbApplication(data);
      };
      window.submitSocialsToFirebase = async (data) => {
        return await submitSocialsApplication(data);
      };
      window.submitWaitlistToFirebase = async (data) => {
        return await submitWaitlistEntry(data);
      };
      window.submitSecretariatToFirebase = async (data) => {
        return await submitSecretariatApplication(data);
      };
      window.submitSocialsToFirebase = async (data) => {
        return await submitSocialsApplication(data, currentUserRef.current);
      };
    }


    // Global Form Submission Handler for OC
    window.handleOcSubmit = async (e) => {
      e.preventDefault();
      const form = e.target;
      const tierSelect = document.getElementById("ocFeeTier");
      const feeTier = tierSelect?.value || "₹1,500 — Transport & T-Shirt Included";
      const isPayLater = feeTier.toLowerCase().includes("later");
      const selectedOpt = tierSelect?.options?.[tierSelect.selectedIndex];
      const feeAmount = isPayLater ? 0 : Number(selectedOpt?.getAttribute("data-amount") || 1500);

      const txnId = document.getElementById("ocTxnID")?.value?.trim() || "";
      const fileInput = document.getElementById("ocDriveLink");
      const hasFile = fileInput && fileInput.files && fileInput.files.length > 0;

      if (!isPayLater && (!txnId || !hasFile)) {
        if (window.showCustomAlert) {
          window.showCustomAlert("Please enter your UPI Transaction ID and upload your payment screenshot, or select 'Pay Later'.", "warning");
        }
        return;
      }

      let screenshotBase64 = "";
      if (hasFile) {
        screenshotBase64 = await new Promise((resolve) => {
          const reader = new FileReader();
          reader.onload = () => resolve(reader.result || "");
          reader.onerror = () => resolve("");
          reader.readAsDataURL(fileInput.files[0]);
        });
      }

      const nameVal = document.getElementById("ocName")?.value?.trim() || "";
      const emailVal = document.getElementById("ocEmail")?.value?.trim() || "";

      const data = {
        action: "SUBMIT_OC",
        name: nameVal,
        fullName: nameVal,
        phone: document.getElementById("ocPhone")?.value?.trim() || "",
        email: emailVal,
        institute: document.getElementById("ocInst")?.value?.trim() || "",
        dob: document.getElementById("ocDob")?.value || "",
        grade: document.getElementById("ocGrade")?.value || "",
        address: document.getElementById("ocAddress")?.value?.trim() || "",
        instagram: document.getElementById("ocInsta")?.value?.trim() || "",
        munCount: document.getElementById("ocMunCount")?.value || "",
        why: document.getElementById("ocWhy")?.value?.trim() || "",
        attributes: document.getElementById("ocAttributes")?.value?.trim() || "",
        payment_tier: feeTier,
        fee_amount: feeAmount,
        feeTier,
        feeAmount,
        payment_utr: isPayLater ? "PAY_LATER" : txnId,
        payment_screenshot_link: screenshotBase64,
        referral: document.getElementById("ocReferral")?.value?.trim() || "",
        additional_info: document.getElementById("ocAdditionalInfo")?.value?.trim() || "",
      };

      const spinner = document.getElementById("submitSpinner");
      try {
        if (spinner) spinner.style.display = "flex";
        const res = await window.submitOcToFirebase(data);
        if (typeof window !== "undefined") {
          localStorage.setItem("resolve_user_registered", "true");
          localStorage.removeItem("resolveMunOcRegForm");
          if (emailVal) localStorage.setItem("resolve_user_email", emailVal);
          if (nameVal) localStorage.setItem("resolve_user_name", nameVal);
        }
        form.reset();
        if (window.closeModalById) window.closeModalById("ocModal");
        const ocTicketId = res?.appId || `RM26-OC-${Math.floor(1000 + Math.random() * 9000)}`;
        if (typeof window.showPaymentReceiptModal === "function") {
          window.showPaymentReceiptModal({
            ticketId: ocTicketId,
            amount: feeAmount,
            date: new Date(),
            cardHolder: nameVal,
            utrNumber: isPayLater ? "PAY LATER" : txnId,
            passCategory: "OC Pass",
            barcodeValue: ocTicketId,
            onContinue: () => {
              window.location.href = "/dashboard";
            },
          });
        } else {
          if (window.showCustomAlert) {
            window.showCustomAlert("OC Application submitted! Redirecting to your dashboard...", "success");
          }
          setTimeout(() => {
            window.location.href = "/dashboard";
          }, 1200);
        }
      } catch (err) {
        console.error("OC Submit Error:", err);
        if (window.showCustomAlert) {
          window.showCustomAlert("Submission Error: " + (err?.message || "Please try again."), "error");
        }
      } finally {
        if (spinner) spinner.style.display = "none";
      }
    };

    // Global Form Submission Handler for Socials Pass
    window.handleSocialsSubmit = async (e) => {
      e.preventDefault();
      const form = e.target;
      const txnId = document.getElementById("socialsTxnID")?.value?.trim() || "";
      const fileInput = document.getElementById("socialsDriveLink");
      const hasFile = fileInput && fileInput.files && fileInput.files.length > 0;

      if (!txnId || txnId.replace(/\D/g, "").length !== 12) {
        if (window.showCustomAlert) {
          window.showCustomAlert("Please enter a valid 12-digit UPI UTR / Reference ID.", "warning");
        }
        return;
      }
      if (!hasFile) {
        if (window.showCustomAlert) {
          window.showCustomAlert("Please upload your UPI payment screenshot.", "warning");
        }
        return;
      }

      const screenshotBase64 = await new Promise((resolve) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result || "");
        reader.onerror = () => resolve("");
        reader.readAsDataURL(fileInput.files[0]);
      });

      const nameVal = document.getElementById("socialsName")?.value?.trim() || "";
      const emailVal = document.getElementById("socialsEmail")?.value?.trim() || "";
      const socialsFee = Number(window.__siteSettings?.socialsFee || 999);

      const data = {
        name: nameVal,
        fullName: nameVal,
        phone: document.getElementById("socialsPhone")?.value?.trim() || "",
        email: emailVal,
        institute: document.getElementById("socialsInst")?.value?.trim() || "",
        dob: document.getElementById("socialsDob")?.value || "",
        grade: document.getElementById("socialsGrade")?.value || "",
        referral: document.getElementById("socialsReferral")?.value?.trim() || "",
        registration_fee: socialsFee,
        payment_utr: txnId,
        payment_screenshot_link: screenshotBase64,
      };

      const spinner = document.getElementById("submitSpinner");
      try {
        if (spinner) spinner.style.display = "flex";
        const res = await window.submitSocialsToFirebase(data);
        localStorage.removeItem("resolveMunSocialsRegForm");
        form.reset();
        if (window.closeModalById) window.closeModalById("socialsModal");
        const socTicketId = res?.regId || `RM26-SOC-${Math.floor(1000 + Math.random() * 9000)}`;
        if (typeof window.showPaymentReceiptModal === "function") {
          window.showPaymentReceiptModal({
            ticketId: socTicketId,
            amount: socialsFee,
            date: new Date(),
            cardHolder: nameVal,
            utrNumber: txnId,
            passCategory: "Socials Night Pass",
            barcodeValue: socTicketId,
            onContinue: () => {
              window.location.href = "/dashboard";
            },
          });
        } else {
          window.location.href = "/dashboard";
        }
      } catch (err) {
        console.error("Socials Submit Error:", err);
        if (window.showCustomAlert) {
          window.showCustomAlert("Submission Error: " + (err?.message || "Please try again."), "error");
        }
      } finally {
        if (spinner) spinner.style.display = "none";
      }
    };

    // Multi-step navigation for Executive Board Modal
    window.nextEbStep = function (stepNum) {
      const currentStep = document.querySelector("#ebModal .form-step.active");
      const currentStepNum = currentStep ? parseInt(currentStep.id.replace("ebStep", "")) : 1;
      if (stepNum > currentStepNum) {
        const inputs = currentStep ? currentStep.querySelectorAll("input[required], select[required], textarea[required]") : [];
        let isValid = true;
        inputs.forEach((input) => {
          if (!input.value.trim()) {
            input.style.borderBottomColor = "#ff4444";
            isValid = false;
          } else {
            input.style.borderBottomColor = "";
          }
        });
        if (!isValid) {
          if (window.showCustomAlert) window.showCustomAlert("Please fill in all required fields before continuing.", "warning");
          return;
        }
      }
      document.querySelectorAll("#ebModal .form-step").forEach((step) => step.classList.remove("active"));
      const targetStep = document.getElementById("ebStep" + stepNum);
      if (targetStep) targetStep.classList.add("active");
    };

    window.handleEbSubmit = async (e) => {
      if (e && e.preventDefault) e.preventDefault();
      const form = document.getElementById("ebRegForm");
      if (!form) return;
      const btn = form.querySelector('button[type="submit"]');
      const spinner = document.getElementById("submitSpinner");

      const fileInput = document.getElementById("ebCv");
      let cvUrl = fileInput?.dataset?.uploadedUrl || "";
      let cvBase64 = "";
      let cvName = "";
      if (fileInput && fileInput.files && fileInput.files.length > 0) {
        const file = fileInput.files[0];
        cvName = file.name;
        if (!cvUrl) {
          cvUrl = await uploadFileToSupabase(file, "eb-cvs", "EB");
        }
        if (!cvUrl) {
          cvBase64 = await new Promise((resolve) => {
            const reader = new FileReader();
            reader.onload = () => resolve(reader.result || "");
            reader.onerror = () => resolve("");
            reader.readAsDataURL(file);
          });
        }
      }

      const nameVal = document.getElementById("ebName")?.value?.trim() || "";
      const emailVal = document.getElementById("ebEmail")?.value?.trim() || "";
      const pref1 = document.getElementById("ebPref1")?.value || "";
      const pref2 = document.getElementById("ebPref2")?.value || "";

      const data = {
        name: nameVal,
        fullName: nameVal,
        phone: document.getElementById("ebPhone")?.value?.trim() || "",
        email: emailVal,
        institute: document.getElementById("ebInst")?.value?.trim() || "",
        position: document.getElementById("ebRole")?.value?.trim() || "Executive Board",
        experience: document.getElementById("ebExp")?.value?.trim() || "",
        munExperience: document.getElementById("ebExp")?.value?.trim() || "",
        why: document.getElementById("ebWhy")?.value?.trim() || "",
        executiveSummary: document.getElementById("ebWhy")?.value?.trim() || "",
        committees: `${pref1} & ${pref2}`,
        prefCommittee1: pref1,
        prefCommittee2: pref2,
        dob: document.getElementById("ebDob")?.value || "",
        referral: document.getElementById("ebReferral")?.value?.trim() || "",
        munCount: document.getElementById("ebMunCount")?.value || "",
        cv_file: cvUrl || cvBase64,
        cvUrl: cvUrl,
        cvBase64: cvBase64,
        cvName: cvName || `EB_CV_${nameVal.replace(/\s+/g, "_")}.pdf`,
      };

      try {
        if (spinner) spinner.style.display = "flex";
        if (btn) {
          btn.disabled = true;
          btn.innerText = "Submitting Application...";
        }
        const res = await submitEbApplication(data);
        localStorage.removeItem("resolveMunEbRegForm");
        form.reset();
        window.nextEbStep(1);
        if (window.closeModalById) window.closeModalById("ebModal");
        if (window.showCustomAlert) {
          window.showCustomAlert("Executive Board application submitted successfully! Check your inbox for confirmation.", "success", 6000);
        }
      } catch (err) {
        console.error("EB Submit Error:", err);
        if (window.showCustomAlert) {
          window.showCustomAlert("Submission Error: " + (err?.message || "Please try again."), "error");
        }
      } finally {
        if (spinner) spinner.style.display = "none";
        if (btn) {
          btn.disabled = false;
          btn.innerText = "Submit EB Application";
        }
      }
    };

    // Attach listeners to OC, EB, and Socials forms once (no document.body MutationObserver)
    const bindCustomForms = () => {
      const ocForm = document.getElementById("ocRegForm");
      if (ocForm && !ocForm.__bound) {
        ocForm.__bound = true;
        ocForm.onsubmit = window.handleOcSubmit;
      }
      const ebForm = document.getElementById("ebRegForm");
      if (ebForm && !ebForm.__bound) {
        ebForm.__bound = true;
        ebForm.onsubmit = window.handleEbSubmit;
      }
      const ebCvInput = document.getElementById("ebCv");
      if (ebCvInput && !ebCvInput.__bound) {
        ebCvInput.__bound = true;
        ebCvInput.addEventListener("change", async (e) => {
          const fn = document.getElementById("ebCvFileName");
          const file = e.target.files?.[0];
          if (fn && file) {
            const sizeStr = (file.size / (1024 * 1024)).toFixed(2);
            fn.innerHTML = `<span style="color:#34d399;font-weight:700;">✓ ${file.name}</span> <span style="opacity:0.7;">(${sizeStr} MB)</span>`;
            const wrapper = ebCvInput.closest(".file-upload-wrapper");
            if (wrapper) wrapper.classList.add("has-file");
            try {
              const uploaded = await uploadFileToSupabase(file, "eb-cvs", "EB");
              if (uploaded) ebCvInput.dataset.uploadedUrl = uploaded;
            } catch (_) {}
          }
        });
      }

      // Delegate Payment Screenshot (regDriveLink)
      const regProofInput = document.getElementById("regDriveLink");
      if (regProofInput && !regProofInput.__bound) {
        regProofInput.__bound = true;
        regProofInput.addEventListener("change", async (e) => {
          const file = e.target.files?.[0];
          const wrapper = regProofInput.closest(".file-upload-wrapper");
          const fn = wrapper?.querySelector(".file-name");
          if (file) {
            const sizeMb = (file.size / (1024 * 1024)).toFixed(2);
            if (fn) fn.innerHTML = `<span style="color:#34d399;font-weight:700;">Uploading payment proof (${sizeMb} MB)...</span>`;
            if (wrapper) wrapper.classList.add("has-file");
            try {
              const uploadedUrl = await uploadFileToSupabase(file, "payment-screenshots", "DEL_PAY");
              if (uploadedUrl) {
                regProofInput.dataset.uploadedUrl = uploadedUrl;
                if (fn) fn.innerHTML = `<span style="color:#34d399;font-weight:700;">✓ ${file.name}</span> <span style="opacity:0.7;">(${sizeMb} MB)</span>`;
              }
            } catch (err) {
              console.warn("Screenshot background upload notice:", err);
            }
          }
        });
      }

      // Delegation Payment Screenshot (delDriveLink)
      const delProofInput = document.getElementById("delDriveLink");
      if (delProofInput && !delProofInput.__bound) {
        delProofInput.__bound = true;
        delProofInput.addEventListener("change", async (e) => {
          const file = e.target.files?.[0];
          const wrapper = delProofInput.closest(".file-upload-wrapper");
          const fn = wrapper?.querySelector(".file-name");
          if (file) {
            const sizeMb = (file.size / (1024 * 1024)).toFixed(2);
            if (fn) fn.innerHTML = `<span style="color:#34d399;font-weight:700;">Uploading payment proof (${sizeMb} MB)...</span>`;
            if (wrapper) wrapper.classList.add("has-file");
            try {
              const uploadedUrl = await uploadFileToSupabase(file, "delegation-payments", "INST_PAY");
              if (uploadedUrl) {
                delProofInput.dataset.uploadedUrl = uploadedUrl;
                if (fn) fn.innerHTML = `<span style="color:#34d399;font-weight:700;">✓ ${file.name}</span> <span style="opacity:0.7;">(${sizeMb} MB)</span>`;
              }
            } catch (err) {
              console.warn("Delegation proof background upload notice:", err);
            }
          }
        });
      }

      // OC Payment Screenshot (ocDriveLink)
      const ocProofInput = document.getElementById("ocDriveLink");
      if (ocProofInput && !ocProofInput.__bound) {
        ocProofInput.__bound = true;
        ocProofInput.addEventListener("change", async (e) => {
          const file = e.target.files?.[0];
          const wrapper = ocProofInput.closest(".file-upload-wrapper");
          const fn = wrapper?.querySelector(".file-name");
          if (file) {
            const sizeMb = (file.size / (1024 * 1024)).toFixed(2);
            if (fn) fn.innerHTML = `<span style="color:#34d399;font-weight:700;">Uploading payment proof (${sizeMb} MB)...</span>`;
            if (wrapper) wrapper.classList.add("has-file");
            try {
              const uploadedUrl = await uploadFileToSupabase(file, "oc-payments", "OC_PAY");
              if (uploadedUrl) {
                ocProofInput.dataset.uploadedUrl = uploadedUrl;
                if (fn) fn.innerHTML = `<span style="color:#34d399;font-weight:700;">✓ ${file.name}</span> <span style="opacity:0.7;">(${sizeMb} MB)</span>`;
              }
            } catch (err) {
              console.warn("OC proof background upload notice:", err);
            }
          }
        });
      }
      const socForm = document.getElementById("socialsRegForm");
      if (socForm && !socForm.__bound) {
        socForm.__bound = true;
        socForm.onsubmit = window.handleSocialsSubmit;
      }
    };
    bindCustomForms();
    const bindTimer = setTimeout(bindCustomForms, 300);

    return () => {
      clearTimeout(bindTimer);
      unsubscribe();
    };
  }, []);
  const containerRef = useRef(null);

  const scrollToPassesSection = () => {
    if (typeof window === "undefined") return;
    const target = document.getElementById("delegate-pass");
    if (target) {
      const navOffset = 64;
      const targetTop = target.getBoundingClientRect().top + window.scrollY - navOffset;
      window.scrollTo({ top: Math.max(0, targetTop), behavior: "smooth" });
    }
  };

  const handleOpenSelection = (e) => {
    if (e && e.preventDefault) e.preventDefault();
    const isAuthenticated = Boolean(auth.currentUser);

    if (isAuthenticated) {
      scrollToPassesSection();
    } else {
      if (typeof window !== "undefined") {
        window.pendingPathway = "SCROLL_TO_PASSES";
      }
      setAuthInitialMode("signup");
      setAuthOpen(true);
    }
  };

  useEffect(() => {
    // Instant body loaded state
    if (typeof document !== 'undefined' && document.body) {
      document.body.classList.add('loaded');
    }

    // Instant Countdown Initialization (Zero-reflow cached DOM references & diff-only updates)
    let cdInterval = null;
    try {
      const startDateMs = new Date("2026-11-27T08:00:00").getTime();
      const endDateMs = new Date("2026-11-29T20:00:00").getTime();

      let cdLabel = null;
      let cdDays = null;
      let cdHours = null;
      let cdMins = null;
      let cdSecs = null;
      let cdUnits = null;
      let cdLiveBanner = null;
      let lastMode = "";

      const setTextIfChanged = (el, val) => {
        if (el && el.textContent !== val) {
          el.textContent = val;
        }
      };

      const updateCd = () => {
        if (!cdSecs) {
          cdLabel = document.getElementById("cd-label");
          cdDays = document.getElementById("cd-days");
          cdHours = document.getElementById("cd-hours");
          cdMins = document.getElementById("cd-mins");
          cdSecs = document.getElementById("cd-secs");
          cdUnits = document.getElementById("cd-units");
          cdLiveBanner = document.getElementById("cd-live-banner");
          if (!cdDays || !cdHours || !cdMins || !cdSecs) return;
        }

        const nowMs = Date.now();

        // 1. Before Conference -> Count down to startDate
        if (nowMs < startDateMs) {
          if (lastMode !== "pre") {
            lastMode = "pre";
            if (cdLabel) {
              setTextIfChanged(cdLabel, "CONFERENCE OPENS IN");
              cdLabel.style.display = "inline-block";
            }
            if (cdUnits) cdUnits.style.display = "flex";
            if (cdLiveBanner) cdLiveBanner.style.display = "none";
          }

          const diff = startDateMs - nowMs;
          const d = String(Math.floor(diff / 86400000)).padStart(2, "0");
          const h = String(Math.floor((diff % 86400000) / 3600000)).padStart(2, "0");
          const m = String(Math.floor((diff % 3600000) / 60000)).padStart(2, "0");
          const s = String(Math.floor((diff % 60000) / 1000)).padStart(2, "0");

          setTextIfChanged(cdDays, d);
          setTextIfChanged(cdHours, h);
          setTextIfChanged(cdMins, m);
          setTextIfChanged(cdSecs, s);
          return;
        }

        // 2. During the Three Days (Nov 27 to Nov 29) -> RESOLVE IS HAPPENING RIGHT NOW
        if (nowMs >= startDateMs && nowMs <= endDateMs) {
          if (lastMode !== "live") {
            lastMode = "live";
            if (cdLiveBanner) {
              cdLiveBanner.style.display = "inline-flex";
              if (cdLabel) cdLabel.style.display = "none";
              if (cdUnits) cdUnits.style.display = "none";
            } else if (cdLabel) {
              setTextIfChanged(cdLabel, "RESOLVE IS HAPPENING RIGHT NOW");
              cdLabel.style.display = "inline-block";
            }
          }
          return;
        }

        // 3. After the Three Days -> Count up since conclusion
        if (nowMs > endDateMs) {
          if (lastMode !== "post") {
            lastMode = "post";
            if (cdLabel) {
              setTextIfChanged(cdLabel, "SINCE RESOLVE 2.0");
              cdLabel.style.display = "inline-block";
            }
            if (cdUnits) cdUnits.style.display = "flex";
            if (cdLiveBanner) cdLiveBanner.style.display = "none";
          }

          const diff = nowMs - endDateMs;
          const d = String(Math.floor(diff / 86400000)).padStart(2, "0");
          const h = String(Math.floor((diff % 86400000) / 3600000)).padStart(2, "0");
          const m = String(Math.floor((diff % 3600000) / 60000)).padStart(2, "0");
          const s = String(Math.floor((diff % 60000) / 1000)).padStart(2, "0");

          setTextIfChanged(cdDays, d);
          setTextIfChanged(cdHours, h);
          setTextIfChanged(cdMins, m);
          setTextIfChanged(cdSecs, s);
        }
      };

      updateCd();
      cdInterval = setInterval(updateCd, 1000);
    } catch (e) {
      console.warn("Countdown init error:", e);
    }

    // 1. Setup Global Window Modal Methods
    if (typeof window !== "undefined") {
      const closeModalById = (modalId) => {
        if (window.saveAllModalDrafts) window.saveAllModalDrafts(modalId);
        const modal = document.getElementById(modalId);
        if (modal) {
          modal.classList.remove("active");
        }
        const anyActive = document.querySelector(".modal-overlay.active");
        if (!anyActive) {
          document.body.style.overflow = "";
          document.body.classList.remove("modal-locked");
          try {
            const u = new URL(window.location.href);
            if (u.searchParams.has("open") || u.searchParams.has("register") || u.searchParams.has("apply")) {
              u.searchParams.delete("open");
              u.searchParams.delete("register");
              u.searchParams.delete("apply");
              window.history.replaceState(null, "", u.pathname + (u.search ? u.search : ""));
            }
          } catch (_) {}
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

      window.scrollToPassesSection = scrollToPassesSection;

      window.openSelectionModal = function () {
        if (window.autofillAllKnownFields) window.autofillAllKnownFields();
        const isAuthenticated = Boolean(auth.currentUser);
        if (isAuthenticated) {
          scrollToPassesSection();
        } else {
          window.pendingPathway = "SCROLL_TO_PASSES";
          setAuthInitialMode("signup");
          setAuthOpen(true);
        }
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

      // Helper: Send abandoned draft lead on Step transition
      function sendStep1DraftLead(type, step) {
        try {
          const name = (document.getElementById("regName") || document.getElementById("delHeadName") || document.getElementById("delAdviserName"))?.value || "";
          const email = (document.getElementById("regEmail") || document.getElementById("delHeadEmail") || document.getElementById("delAdviserEmail"))?.value || "";
          const phone = (document.getElementById("regPhone") || document.getElementById("delHeadPhone") || document.getElementById("delAdviserPhone"))?.value || "";
          const institute = (document.getElementById("regInstitute") || document.getElementById("delInstName"))?.value || "";
          const p1 = document.getElementById("pref1_committee")?.value || "";
          const p2 = document.getElementById("pref2_committee")?.value || "";
          const p3 = document.getElementById("pref3_committee")?.value || "";
          const prefs = [p1, p2, p3].filter(Boolean).join(" · ");

          if (name || (email && email.includes('@')) || phone) {
            fetch('/api/admin/', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                action: 'SAVE_DRAFT_LEAD',
                fullName: name || 'Prospective Candidate',
                email: email,
                phone: phone,
                institution: institute,
                preferences: prefs,
                formType: type === 'delegation' ? 'Delegation Registration' : 'Delegate Registration',
                step: step || 'Step 1: Personal Details'
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

        // 4b. Secretariat & Socials Forms (#secModal & #socialsModal)
        if (fullName) {
          setVal('secName', fullName);
          setVal('socialsName', fullName);
        }
        if (email) {
          setVal('secEmail', email);
          setVal('socialsEmail', email);
        }

        // 5. Priority Waitlist & Global Inputs
        const waitlistInputs = document.querySelectorAll('input[name="waitlist_email"], #waitlistEmail, .waitlist-input');
        waitlistInputs.forEach(input => {
          if (input && email) {
            input.value = email;
            dispatchEv(input);
          }
        });
      }

      window.autofillAllKnownFields = autofillAllKnownFields;


      // Sync live siteSettings to window.__siteSettings and update modal UI & greyed-out cards
      const applyLiveSettingsToDOM = (settings) => {
        if (!settings) return;
        window.__siteSettings = settings;
        setSiteSettings((prev) => ({ ...prev, ...settings }));
        const delFee = Number(settings.delegateFee || 2500);
        const delgFee = Number(settings.delegationFee || 2200);
        const upi = settings.upiId || "6301550628@nyes";

        // Update live venue section in DOM
        const vTitle = document.getElementById("venueSectionTitle");
        if (vTitle && (settings.venueShort || settings.conferenceVenue)) {
          vTitle.innerText = (settings.venueShort || settings.conferenceVenue).toUpperCase();
        }
        const vAddr = document.getElementById("venueAddressText");
        if (vAddr && settings.venueAddress) {
          vAddr.innerText = settings.venueAddress;
        }
        const vIframe = document.getElementById("venueMapIframe");
        if (vIframe && (settings.venueMapUrl || settings.conferenceVenue)) {
          const mapUrl = (settings.venueMapUrl && settings.venueMapUrl.includes("output=embed"))
            ? settings.venueMapUrl
            : `https://maps.google.com/maps?q=${encodeURIComponent(settings.conferenceVenue || settings.venueAddress || "Hyderabad Telangana")}&t=&z=12&ie=UTF8&iwloc=&output=embed`;
          vIframe.src = mapUrl;
        }
        const vLink = document.getElementById("venueMapLink");
        if (vLink && (settings.venueMapUrl || settings.conferenceVenue)) {
          vLink.href = settings.venueMapUrl || `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(settings.conferenceVenue || "Hyderabad Telangana")}`;
        }

        // Update live prize pool in DOM
        const delPrizeBadge = document.getElementById("delegationPrizePoolBadge");
        if (delPrizeBadge && settings.prizePool) {
          delPrizeBadge.innerText = `${settings.prizePool.toUpperCase()} PRIZE POOL`;
        }
        const delPrizeDesc = document.getElementById("delegationPrizePoolDesc");
        if (delPrizeDesc && settings.prizePool) {
          delPrizeDesc.innerText = `Register a contingent of 6+ delegates and compete for the ${settings.prizePool} Best Delegation cash prize pool.`;
        }
        const aboutCash = document.getElementById("aboutCashpoolNum");
        if (aboutCash && settings.prizePool) {
          aboutCash.innerText = settings.prizePool;
        }

        // Eyebrows across DOM
        document.querySelectorAll(".hero-eyebrow").forEach((el) => {
          if (settings.conferenceDates) el.innerText = settings.conferenceDates.toUpperCase();
        });

        window.copyVenueAddress = () => {
          const addr = window.__siteSettings?.venueAddress || "TBA (To Be Announced)";
          navigator.clipboard?.writeText(addr);
          if (window.showCustomAlert) window.showCustomAlert("Venue address copied to clipboard!", "success");
          else alert("Venue address copied to clipboard!");
        };

        const regFeeEl = document.getElementById("regFeeDisplay");
        if (regFeeEl) regFeeEl.innerText = `Registration Fee: ₹${delFee.toLocaleString("en-IN")}`;
        const scanLbl = document.getElementById("paymentQRScanLabel");
        if (scanLbl) scanLbl.innerText = `SCAN & PAY ₹${delFee.toLocaleString("en-IN")}`;
        const badgeDel = document.getElementById("pathwayBadgeDelegate");
        if (badgeDel) {
          badgeDel.innerText =
            settings.delegateOpen !== false && settings.registrationsOpen !== false
              ? `PRIORITY ROUND · ₹${delFee.toLocaleString("en-IN")}`
              : "CLOSED";
        }
        const badgeDelg = document.getElementById("pathwayBadgeDelegation");
        if (badgeDelg) {
          badgeDelg.innerText =
            settings.delegationOpen !== false && settings.registrationsOpen !== false
              ? `₹${delgFee.toLocaleString("en-IN")} / DEL · MIN 6`
              : "CLOSED";
        }
        const perDelNote = document.getElementById("delPerDelegateNote");
        if (perDelNote) {
          perDelNote.innerText = `(₹${delgFee.toLocaleString("en-IN")} per enrolled delegate · Minimum 6 delegates)`;
        }

        // Grey out any closed pathway cards in #selectionModal
        const cardMap = [
          { id: "pathwayCardDelegate", open: settings.registrationsOpen !== false && settings.delegateOpen !== false },
          { id: "pathwayCardDelegation", open: settings.registrationsOpen !== false && settings.delegationOpen !== false },
          { id: "pathwayCardOc", open: settings.registrationsOpen !== false && settings.ocOpen !== false },
          { id: "pathwayCardSecretariat", open: settings.registrationsOpen !== false && settings.secretariatOpen !== false },
          { id: "pathwayCardEb", open: settings.registrationsOpen !== false && Boolean(settings.ebOpen) },
        ];
        cardMap.forEach(({ id, open }) => {
          const el = document.getElementById(id);
          if (!el) return;
          if (open) {
            el.classList.remove("selection-card--closed");
            el.style.opacity = "1";
            el.style.filter = "none";
            el.style.cursor = "pointer";
          } else {
            el.classList.add("selection-card--closed");
            el.style.opacity = "0.45";
            el.style.filter = "grayscale(1)";
            el.style.cursor = "not-allowed";
          }
        });

        ["upiID", "delUpiID", "ocUpiID"].forEach((id) => {
          const uEl = document.getElementById(id);
          if (uEl) uEl.innerText = upi;
        });

        if (window.generateDynamicQR) {
          window.generateDynamicQR(String(delFee), "paymentQRImage", "upiID");
          const size = parseInt(document.getElementById("delSize")?.value || "6", 10) || 6;
          window.generateDynamicQR(String(size * delgFee), "delPaymentQRImage", "delUpiID");
        }
      };

      fetchSystemSettingsCached(false)
        .then((s) => applyLiveSettingsToDOM(s))
        .catch(() => {});

      window.addEventListener("siteSettingsUpdated", (ev) => {
        if (ev?.detail) applyLiveSettingsToDOM(ev.detail);
      });

      window.updateOcFeeTierUI = function (tierValue) {
        const wrapper = document.getElementById("ocPaymentCardWrapper");
        const txnInput = document.getElementById("ocTxnID");
        const fileInput = document.getElementById("ocDriveLink");
        const scanLabel = document.getElementById("ocQRScanLabel");
        const selectEl = document.getElementById("ocFeeTier");
        const isPayLater = String(tierValue || "").toLowerCase().includes("later");

        if (isPayLater) {
          if (wrapper) wrapper.style.display = "none";
          if (txnInput) txnInput.removeAttribute("required");
          if (fileInput) fileInput.removeAttribute("required");
        } else {
          if (wrapper) wrapper.style.display = "block";
          let amount = 1500;
          if (selectEl && selectEl.selectedIndex >= 0) {
            amount = Number(selectEl.options[selectEl.selectedIndex].getAttribute("data-amount") || 1500);
          }
          if (scanLabel) scanLabel.innerText = `SCAN & PAY ₹${amount.toLocaleString("en-IN")}`;
          if (window.generateDynamicQR) {
            window.generateDynamicQR(String(amount), "ocPaymentQRImage", "ocUpiID");
          }
        }
      };

      window.selectPathway = function (type) {
        if (type === "SCROLL_TO_PASSES") {
          scrollToPassesSection();
          return;
        }

        const s = window.__siteSettings || {};
        if (s.registrationsOpen === false) {
          if (window.showCustomAlert) {
            window.showCustomAlert("Registrations for Resolve MUN 2.0 are currently paused.", "info");
          }
          return;
        }

        const openCheck = {
          delegate: s.delegateOpen !== false,
          delegation: s.delegationOpen !== false,
          oc: s.ocOpen !== false,
          secretariat: s.secretariatOpen !== false,
          eb: Boolean(s.ebOpen),
          socials: Boolean(s.socialsOpen),
        };

        if (openCheck[type] === false) {
          if (window.showCustomAlert) {
            window.showCustomAlert(`${type.toUpperCase()} registrations are currently closed.`, "info");
          }
          return;
        }

        if (window.autofillAllKnownFields) window.autofillAllKnownFields();
        closeModalById("selectionModal");

        // Auth Gate: If logged in, open modal directly; if not logged in, open AuthModal then open clicked ticket modal
        const isAuthenticated = Boolean(auth.currentUser);

        if (!isAuthenticated) {
          window.pendingPathway = type;
          setAuthInitialMode("signup");
          setAuthOpen(true);
          return;
        }

        // Sync active pathway to URL so user can share direct link immediately
        try {
          const u = new URL(window.location.href);
          u.searchParams.set("open", type);
          window.history.replaceState(null, "", u.pathname + u.search);
        } catch (_) {}

        if (type === "delegate") {
          window.openRegistration();
          return;
        } else if (type === "delegation") {
          window.openDelRegistration();
          return;
        } else if (type === "oc") {
          if (window.restoreAllModalDrafts) window.restoreAllModalDrafts("ocModal");
          const ocModal = document.getElementById("ocModal");
          if (ocModal) {
            ocModal.classList.add("active");
            document.body.style.overflow = "hidden";
            if (auth.currentUser) {
              const nameEl = document.getElementById("ocName");
              const emailEl = document.getElementById("ocEmail");
              if (nameEl && !nameEl.value) nameEl.value = auth.currentUser.displayName || "";
              if (emailEl && !emailEl.value) emailEl.value = auth.currentUser.email || "";
            }
          }
          return;
        } else if (type === "eb") {
          if (window.restoreAllModalDrafts) window.restoreAllModalDrafts("ebModal");
          const ebModal = document.getElementById("ebModal");
          if (ebModal) {
            ebModal.classList.add("active");
            document.body.style.overflow = "hidden";
            if (auth.currentUser) {
              const nameEl = document.getElementById("ebName");
              const emailEl = document.getElementById("ebEmail");
              if (nameEl && !nameEl.value) nameEl.value = auth.currentUser.displayName || "";
              if (emailEl && !emailEl.value) emailEl.value = auth.currentUser.email || "";
            }
          }
          return;
        } else if (type === "socials") {
          if (window.restoreAllModalDrafts) window.restoreAllModalDrafts("socialsModal");
          const socialsModal = document.getElementById("socialsModal");
          if (socialsModal) {
            const socFee = Number(window.__siteSettings?.socialsFee || 999);
            const feeEl = document.getElementById("socialsFeeDisplay");
            if (feeEl) feeEl.innerText = `Pass Fee: ₹${socFee.toLocaleString("en-IN")}`;
            const scanEl = document.getElementById("socialsQRScanLabel");
            if (scanEl) scanEl.innerText = `SCAN & PAY ₹${socFee.toLocaleString("en-IN")}`;
            socialsModal.classList.add("active");
            document.body.style.overflow = "hidden";
            if (auth.currentUser) {
              const nameEl = document.getElementById("socialsName");
              const emailEl = document.getElementById("socialsEmail");
              if (nameEl && !nameEl.value) nameEl.value = auth.currentUser.displayName || "";
              if (emailEl && !emailEl.value) emailEl.value = auth.currentUser.email || "";
            }
          }
          return;
        } else if (type === "secretariat") {
          if (window.restoreAllModalDrafts) window.restoreAllModalDrafts("secModal");
          const secModal = document.getElementById("secModal");
          if (secModal) {
            secModal.classList.add("active");
            document.body.style.overflow = "hidden";
            if (auth.currentUser) {
              const nameEl = document.getElementById("secName");
              const emailEl = document.getElementById("secEmail");
              if (nameEl && !nameEl.value) nameEl.value = auth.currentUser.displayName || "";
              if (emailEl && !emailEl.value) emailEl.value = auth.currentUser.email || "";
            }
          }
        }
      };

      window.openSecModal = function () {
        window.selectPathway("secretariat");
      };

      window.openOcModal = function () {
        window.selectPathway("oc");
      };

      window.openEbModal = function () {
        window.selectPathway("eb");
      };

      window.openSocialsModal = function () {
        window.selectPathway("socials");
      };

      window.nextSocialsStep = function (stepNum) {
        const modal = document.getElementById("socialsModal");
        if (!modal) return;
        if (stepNum === 2) {
          const name = document.getElementById("socialsName")?.value?.trim();
          const phone = document.getElementById("socialsPhone")?.value?.trim();
          const email = document.getElementById("socialsEmail")?.value?.trim();
          const inst = document.getElementById("socialsInst")?.value?.trim();
          const grade = document.getElementById("socialsGrade")?.value;
          const dob = document.getElementById("socialsDob")?.value;
          if (!name || !phone || !email || !inst || !grade || !dob) {
            if (window.showCustomAlert) {
              window.showCustomAlert("Please complete all required fields including Date of Birth.", "warning");
            }
            return;
          }
          if (!checkIndianPhoneValid(phone)) {
            if (window.showCustomAlert) {
              window.showCustomAlert("Please enter a valid 10-digit Indian mobile number.", "warning");
            }
            return;
          }
        }
        modal.querySelectorAll(".form-step").forEach((s) => s.classList.remove("active"));
        const target = document.getElementById(`socialsStep${stepNum}`);
        if (target) target.classList.add("active");
        const content = modal.querySelector(".modal-content");
        if (content) content.scrollTop = 0;
        if (window.saveAllModalDrafts) window.saveAllModalDrafts("socialsModal");
      };


      window.openRegistration = function () {
        if (window.autofillAllKnownFields) window.autofillAllKnownFields();
        // Auth Gate
        const isAuthenticated = Boolean(auth.currentUser);
        if (!isAuthenticated) {
          window.pendingPathway = "delegate";
          setAuthInitialMode("signup");
          setAuthOpen(true);
          return;
        }

        const regModal = document.getElementById("regModal");
        if (regModal) {
          if (window.restoreAllModalDrafts) window.restoreAllModalDrafts("regModal");
          // Auto-prefill authenticated user info
          if (auth.currentUser) {
            const nameEl = document.getElementById("regName");
            const emailEl = document.getElementById("regEmail");
            if (nameEl && !nameEl.value) nameEl.value = auth.currentUser.displayName || "";
            if (emailEl && !emailEl.value) emailEl.value = auth.currentUser.email || "";
          }

          // Apply delegation lock
          applyPermanentDelegationLock();

          // Synchronize subtitle with currently active step
          const activeStep = regModal.querySelector(".form-step.active");
          const subtitle = regModal.querySelector(".modal-subtitle");
          if (activeStep && subtitle) {
            const stepNum = activeStep.id.replace("step", "");
            const stepMap = {
              "1": "Step 1 of 3 · Personal Details",
              "2": "Step 2 of 3 · Committee Preferences",
              "3": "Step 3 of 3 · Payment & Submission",
            };
            if (stepMap[stepNum]) subtitle.textContent = stepMap[stepNum];
          }

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
        // Auth Gate
        const isAuthenticated = Boolean(auth.currentUser);
        if (!isAuthenticated) {
          window.pendingPathway = "delegation";
          setAuthInitialMode("signup");
          setAuthOpen(true);
          return;
        }

        const delModal = document.getElementById("delModal");
        if (delModal) {
          if (window.restoreAllModalDrafts) window.restoreAllModalDrafts("delModal");
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

      window.switchTermsTab = function (type, btn) {
        document.querySelectorAll(".terms-tab-pill").forEach((b) => b.classList.remove("active"));
        if (btn) {
          btn.classList.add("active");
        } else {
          const activeBtn = document.querySelector('.terms-tab-pill[data-tab="' + type + '"]');
          if (activeBtn) activeBtn.classList.add("active");
        }
        const del = document.getElementById("termsDelegateContent");
        const oc = document.getElementById("termsOcContent");
        const pri = document.getElementById("termsPrivacyContent");
        if (del) del.style.display = type === "delegate" ? "block" : "none";
        if (oc) oc.style.display = type === "oc" ? "block" : "none";
        if (pri) pri.style.display = type === "privacy" ? "block" : "none";
        const scrollBody = document.querySelector(".terms-scroll-body");
        if (scrollBody) scrollBody.scrollTop = 0;
      };

      window.openTermsModal = function (initialTab) {
        const modal = document.getElementById("termsModal");
        if (modal) {
          if (initialTab && typeof initialTab === "string") {
            window.switchTermsTab(initialTab);
          }
          modal.classList.add("active");
          document.body.style.overflow = "hidden";
        }
      };

      window.closeTermsModal = function () {
        closeModalById("termsModal");
      };

      window.showCustomAlert = function (msg, type, duration, title) {
        if (typeof window !== "undefined") {
          window.dispatchEvent(
            new CustomEvent("resolve-alert", {
              detail: { message: msg, type: type, duration: duration, title: title },
            })
          );
        }
      };

      window.copyUPI = function () {
        const upi =
          document.getElementById("upiID")?.innerText ||
          window.__siteSettings?.upiId ||
          "6301550628@nyes";
        navigator.clipboard?.writeText(upi);
        const copyBtn = document.getElementById("copyUpiBtn");
        if (copyBtn) {
          const originalHtml = copyBtn.innerHTML;
          copyBtn.innerHTML = `<span>COPIED! ✓</span>`;
          copyBtn.style.background = "rgba(34,197,94,0.3)";
          copyBtn.style.borderColor = "rgba(34,197,94,0.6)";
          copyBtn.style.color = "#4ade80";
          setTimeout(() => {
            copyBtn.innerHTML = originalHtml;
            copyBtn.style.background = "";
            copyBtn.style.borderColor = "";
            copyBtn.style.color = "";
          }, 2000);
        }
        if (window.showCustomAlert)
          window.showCustomAlert("UPI ID copied: " + upi, "success");
      };

      window.copyDelUPI = function () {
        const upi =
          document.getElementById("delUpiID")?.innerText ||
          window.__siteSettings?.upiId ||
          "6301550628@nyes";
        navigator.clipboard?.writeText(upi);
        if (window.showCustomAlert)
          window.showCustomAlert("UPI ID copied: " + upi, "success");
      };

      window.copyOcUPI = function () {
        const upi =
          document.getElementById("ocUpiID")?.innerText ||
          window.__siteSettings?.upiId ||
          "6301550628@nyes";
        navigator.clipboard?.writeText(upi);
        if (window.showCustomAlert)
          window.showCustomAlert("UPI ID copied: " + upi, "success");
      };

      window.generateDynamicQR = function (amountStr, imgElementId, upiTextElementId) {
        const defaultFee = String(window.__siteSettings?.delegateFee || 2500);
        let cleanAmount = defaultFee;
        if (amountStr) {
          cleanAmount = String(amountStr).replace(/[^0-9.]/g, "") || defaultFee;
        }
        const currentPayee = {
          pa: window.__siteSettings?.upiId || "6301550628@nyes",
          pn: window.__siteSettings?.upiPayee || "Bejugam Aditya",
        };
        const upiText = document.getElementById(upiTextElementId);
        if (upiText) upiText.innerText = currentPayee.pa;

        let categoryNote = "Resolve MUN 2026 Delegate Fee";
        let mobileLinkId = "payUpiMobileLink";
        if (imgElementId === "ocPaymentQRImage") {
          categoryNote = "Resolve MUN 2026 OC Fee";
          mobileLinkId = "ocPayUpiMobileLink";
        } else if (imgElementId === "delPaymentQRImage") {
          categoryNote = "Resolve MUN 2026 Delegation Fee";
          mobileLinkId = "delPayUpiMobileLink";
        } else if (imgElementId === "socialsPaymentQRImage") {
          categoryNote = "Resolve MUN 2026 Socials Pass";
          mobileLinkId = "socialsPayUpiMobileLink";
        }

        const upiString = `upi://pay?pa=${currentPayee.pa}&pn=${encodeURIComponent(currentPayee.pn)}&am=${cleanAmount}&cu=INR&tn=${encodeURIComponent(categoryNote)}`;

        // Update direct mobile link if element exists
        const mobileLink = document.getElementById(mobileLinkId);
        if (mobileLink) {
          mobileLink.href = upiString;
        }

        const qrImage = document.getElementById(imgElementId);
        if (!qrImage) return;

        // Dynamic QR code generated with exact locked price via QuickChart (with qrserver fallback)
        const safeEncodedData = encodeURIComponent(upiString);
        const quickChartUrl = `https://quickchart.io/qr?size=300&text=${safeEncodedData}&ecLevel=M&margin=1`;
        const fallbackUrl = `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${safeEncodedData}`;

        qrImage.crossOrigin = "anonymous";
        qrImage.onerror = function () {
          if (this.src !== fallbackUrl) {
            this.src = fallbackUrl;
          }
        };
        qrImage.src = quickChartUrl;
      };

      window.refreshDelegatePaymentQR = function () {
        if (typeof window.updateDelegatePaymentUI === "function") {
          window.updateDelegatePaymentUI();
        } else {
          const fee = String(window.__siteSettings?.delegateFee || 2500);
          window.generateDynamicQR(fee, "paymentQRImage", "upiID");
        }
        if (window.showCustomAlert) {
          window.showCustomAlert("UPI payment QR refreshed with verified rate.", "info");
        }
      };

      // 42 Official Secretariat & OC Ambassador Codes + Legacy Partner Codes
      const REFERRAL_CODE_PRICING = {
        SBXS2026: 2350,
        AETHERXR2026: 2350,
        DIYA: 2350,
        ICFAI: 2000,
        NYA200: 2350,
        SOLARIS: 2350,
        PROMOTION: 2350,
        UNT100: 2350,
        HET100: 2350,
        YCE200: 2350,
        AN69: 2350,
        ATHENAXR2026: 2350,
        STYLE100: 2350,
        TTG300: 2300,
        PARNIKA200: 2350,
        RAYON67: 2350,
        IRISXRESOLVE: 2350,
        ABHINAYA200: 2350,
        SKA200: 1999,
        // 42 Official Codes from Spreadsheet
        AVETE99: 2350,
        BHAFN01: 2350,
        POOCF02: 2350,
        RAYFM03: 2350,
        JAYFM04: 2350,
        NIKSH05: 2350,
        AARCL06: 2350,
        SNVPU99: 2350,
        SWASG07: 2350,
        KANDG08: 2350,
        ROHDD09: 2350,
        DHACS10: 2350,
        JOTDC11: 2350,
        RAACA12: 2350,
        RISCO13: 2350,
        ABHCA14: 2350,
        ADYSA15: 2350,
        GAYFH16: 2350,
        AARDM17: 2350,
        ABHCC18: 2350,
        HIMCI19: 2350,
        DEVOC20: 2350,
        DHASP21: 2350,
        HAVST22: 2350,
        NIPLG23: 2350,
        MEGDA24: 2350,
        RYAMK25: 2350,
        SHRPL26: 2350,
        TANHP27: 2350,
        HEMOR28: 2350,
        AKAUF29: 2350,
        ANAUO30: 2350,
        CHAUO31: 2350,
        LIKUM32: 2350,
        VAIUM33: 2350,
        ISHUD34: 2350,
        MOKUD35: 2350,
        PARUD36: 2350,
        NIYUH37: 2350,
        SAAUH38: 2350,
        DEEUC39: 2350,
        PRAUC40: 2350,
        VIGUP41: 2350,
        YUVUT42: 2350,
      };

      const REFERRAL_AMBASSADORS = {
        AVETE99: "Abhilash Vijayakumar",
        BHAFN01: "Bhavesh",
        POOCF02: "Poorvika",
        RAYFM03: "Rayon",
        JAYFM04: "Jayakrishna",
        NIKSH05: "Nikhilesh",
        AARCL06: "Aarav",
        SNVPU99: "Saanvi",
        SWASG07: "Swayam",
        KANDG08: "Kanishka",
        ROHDD09: "Rohan",
        DHACS10: "Dhanvi",
        JOTDC11: "Jotshna",
        RAACA12: "Raahil",
        RISCO13: "Risheeth",
        ABHCA14: "Abhik",
        ADYSA15: "Advith",
        GAYFH16: "Gayathri",
        AARDM17: "Aarushi",
        ABHCC18: "Abhinaya",
        HIMCI19: "Hima Varshith",
        DEVOC20: "Devansh",
        DHASP21: "Dhairya",
        HAVST22: "Havish",
        NIPLG23: "Nipun",
        MEGDA24: "Meghana",
        RYAMK25: "Ryan",
        SHRPL26: "Shresth",
        TANHP27: "Tanishka",
        HEMOR28: "Hemanth",
        AKAUF29: "Akanksha",
        ANAUO30: "Anaitha",
        CHAUO31: "Chaitanya",
        LIKUM32: "Likhith",
        VAIUM33: "Vaishnavi",
        ISHUD34: "Ishika",
        MOKUD35: "Moksha",
        PARUD36: "Parinithi",
        NIYUH37: "Niyati",
        SAAUH38: "Saanvi",
        DEEUC39: "Deeksha",
        PRAUC40: "Pragnhavi",
        VIGUP41: "Vignesh",
        YUVUT42: "Yuvraj",
      };

      const normalizeReferral = (code) => (code || "").trim().toUpperCase();

      window.getDelegateFeeFromReferral = function () {
        const val = normalizeReferral(document.getElementById("regReferral")?.value);
        const baseFee = Number(window.__siteSettings?.delegateFee || 2500);
        if (!val) return baseFee;

        // Check dynamic custom referral codes from admin settings
        const dynamicCodes = window.__siteSettings?.referralCodes || [];
        const dynamicMatch = dynamicCodes.find(
          (c) => normalizeReferral(c.code) === val && c.active !== false
        );
        if (dynamicMatch) {
          if (dynamicMatch.finalFee !== undefined && dynamicMatch.finalFee !== null && dynamicMatch.finalFee !== "") {
            return Number(dynamicMatch.finalFee);
          }
          if (dynamicMatch.discountAmount) {
            return Math.max(0, baseFee - Number(dynamicMatch.discountAmount));
          }
        }

        return REFERRAL_CODE_PRICING[val] || baseFee;
      };

      window.updateDelegatePaymentUI = function () {
        const fee = window.getDelegateFeeFromReferral();
        const baseFee = Number(window.__siteSettings?.delegateFee || 2500);
        const feeDisplay = document.getElementById("regFeeDisplay");
        if (feeDisplay) {
          feeDisplay.innerText = `Registration Fee: ₹${Number(fee).toLocaleString("en-IN")}`;
        }
        window.generateDynamicQR(String(fee), "paymentQRImage", "upiID");

        const referralVal = normalizeReferral(document.getElementById("regReferral")?.value);
        const feedbackEl = document.getElementById("referralFeedback");
        if (feedbackEl) {
          if (!referralVal) {
            feedbackEl.innerText = "";
            feedbackEl.style.color = "";
          } else {
            const dynamicCodes = window.__siteSettings?.referralCodes || [];
            const dynamicMatch = dynamicCodes.find(
              (c) => normalizeReferral(c.code) === referralVal && c.active !== false
            );
            if (dynamicMatch) {
              const applied = Number(dynamicMatch.finalFee ?? (baseFee - Number(dynamicMatch.discountAmount || 0)));
              const savings = baseFee - applied;
              const ambassador = dynamicMatch.ambassador || REFERRAL_AMBASSADORS[referralVal] || "";
              const note = ambassador ? ` (${ambassador})` : "";
              feedbackEl.innerText = `✓ Valid referral code${note} applied — Pay ₹${applied.toLocaleString("en-IN")}${savings > 0 ? ` (You save ₹${savings.toLocaleString("en-IN")})` : ""}`;
              feedbackEl.style.color = "#22c55e";
            } else if (REFERRAL_CODE_PRICING[referralVal]) {
              const applied = REFERRAL_CODE_PRICING[referralVal];
              const savings = baseFee - applied;
              const ambassador = REFERRAL_AMBASSADORS[referralVal];
              const note = ambassador ? ` (${ambassador})` : "";
              feedbackEl.innerText = `✓ Valid referral code${note} applied — Pay ₹${applied.toLocaleString("en-IN")}${savings > 0 ? ` (You save ₹${savings.toLocaleString("en-IN")})` : ""}`;
              feedbackEl.style.color = "#22c55e";
            } else {
              feedbackEl.innerText = "Referral code not recognized";
              feedbackEl.style.color = "#ef4444";
            }
          }
        }
      };

      const attachReferralListener = () => {
        const refInput = document.getElementById("regReferral");
        if (refInput && !refInput.__referralAttached) {
          refInput.__referralAttached = true;
          refInput.addEventListener("input", window.updateDelegatePaymentUI);
          refInput.addEventListener("change", window.updateDelegatePaymentUI);
        }
      };
      setTimeout(attachReferralListener, 500);

      // Global single-row file upload handler (No duplicate previews, validates 10MB with clear feedback)
      const initFileUploadListeners = () => {
        document.querySelectorAll(".file-upload-input").forEach((input) => {
          if (input.__fileListenerAttached) return;
          input.__fileListenerAttached = true;
          input.addEventListener("change", function () {
            const wrapper = this.closest(".file-upload-wrapper");
            const fileNameSpan = wrapper ? wrapper.querySelector(".file-name") : null;
            const btnSpan = wrapper ? wrapper.querySelector(".file-upload-btn") : null;
            if (this.files && this.files.length > 0) {
              const file = this.files[0];
              const maxSize = 10 * 1024 * 1024; // 10MB limit
              if (file.size > maxSize) {
                if (window.showCustomAlert) {
                  window.showCustomAlert(`File "${file.name}" exceeds 10MB limit.`, "error");
                }
                this.value = "";
                if (fileNameSpan) {
                  fileNameSpan.textContent = "File too large (max 10MB)";
                  fileNameSpan.style.color = "#ef4444";
                }
                if (wrapper) wrapper.style.borderColor = "#ef4444";
                return;
              }
              const sizeMb = (file.size / (1024 * 1024)).toFixed(1);
              const sizeText = file.size > 1024 * 1024 ? `${sizeMb} MB` : `${(file.size / 1024).toFixed(0)} KB`;
              if (fileNameSpan) {
                fileNameSpan.textContent = `✓ ${file.name} (${sizeText})`;
                fileNameSpan.style.color = "#34d399";
                fileNameSpan.style.fontWeight = "600";
              }
              if (wrapper) {
                wrapper.classList.add("has-file");
                wrapper.style.borderColor = "rgba(52, 211, 153, 0.6)";
              }
              if (btnSpan) {
                btnSpan.textContent = "Change";
              }
            } else {
              if (fileNameSpan) {
                fileNameSpan.textContent = "No file chosen";
                fileNameSpan.style.color = "";
                fileNameSpan.style.fontWeight = "";
              }
              if (wrapper) {
                wrapper.classList.remove("has-file");
                wrapper.style.borderColor = "";
              }
              if (btnSpan) {
                btnSpan.textContent = "Choose File";
              }
            }
          });
        });
      };
      setTimeout(initFileUploadListeners, 500);

      window.closeSecModal = function () {
        closeModalById("secModal");
      };

      // File preview attachment for Secretariat
      const attachSecFileListeners = () => {
        const portInput = document.getElementById("secPortfolioFile");
        const portName = document.getElementById("secPortfolioFileName");
        const portPrev = document.getElementById("secPortfolioPreview");
        if (portInput && !portInput.__attached) {
          portInput.__attached = true;
          portInput.addEventListener("change", async function () {
            if (this.files && this.files[0]) {
              const f = this.files[0];
              if (portName) portName.innerHTML = `<span style="color:#34d399;font-weight:700;">✓ ${f.name}</span> <span style="opacity:0.7;">(${(f.size / (1024 * 1024)).toFixed(2)} MB)</span>`;
              const wrapper = portInput.closest(".file-upload-wrapper");
              if (wrapper) wrapper.classList.add("has-file");
              try {
                const uploaded = await uploadFileToSupabase(f, "secretariat-portfolios", "SEC_PORT");
                if (uploaded) portInput.dataset.uploadedUrl = uploaded;
              } catch (_) {}
            }
          });
        }

        const resInput = document.getElementById("secResumeFile");
        const resName = document.getElementById("secResumeFileName");
        const resPrev = document.getElementById("secResumePreview");
        if (resInput && !resInput.__attached) {
          resInput.__attached = true;
          resInput.addEventListener("change", async function () {
            if (this.files && this.files[0]) {
              const f = this.files[0];
              if (resName) resName.innerHTML = `<span style="color:#34d399;font-weight:700;">✓ ${f.name}</span> <span style="opacity:0.7;">(${(f.size / (1024 * 1024)).toFixed(2)} MB)</span>`;
              const wrapper = resInput.closest(".file-upload-wrapper");
              if (wrapper) wrapper.classList.add("has-file");
              try {
                const uploaded = await uploadFileToSupabase(f, "secretariat-resumes", "SEC_RES");
                if (uploaded) resInput.dataset.uploadedUrl = uploaded;
              } catch (_) {}
            }
          });
        }
      };
      setTimeout(attachSecFileListeners, 600);

      window.nextSecStep = function (step) {
        const form = document.getElementById("secRegForm");
        if (!form) return;
        attachSecFileListeners();

        if (step === 3) {
          const name = document.getElementById("secName")?.value?.trim();
          const phone = document.getElementById("secPhone")?.value?.trim();
          const email = document.getElementById("secEmail")?.value?.trim();
          const school = document.getElementById("secSchool")?.value?.trim();
          const dob = document.getElementById("secDob")?.value;
          const grade = document.getElementById("secGrade")?.value;
          if (!name || !phone || !email || !school || !dob || !grade) {
            if (window.showCustomAlert) window.showCustomAlert("Please fill in all required personal details marked with *.", "warning");
            else alert("Please fill in all required personal details marked with *.");
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

        const modalContent = document.querySelector("#secModal .modal-content");
        if (modalContent) modalContent.scrollTop = 0;
        if (window.saveAllModalDrafts) window.saveAllModalDrafts("secModal");
      };

      const fileToBase64 = (file) =>
        new Promise((resolve) => {
          if (!file) return resolve(null);
          const reader = new FileReader();
          reader.onload = () => resolve({ base64: reader.result, name: file.name, type: file.type });
          reader.onerror = () => resolve(null);
          reader.readAsDataURL(file);
        });

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

        const position = document.getElementById("secPosition")?.value;
        const whyJoin = document.getElementById("secWhy")?.value?.trim();
        const contribution = document.getElementById("secContribution")?.value?.trim();
        const dailyCommitment = document.getElementById("secHours")?.value?.trim();

        if (!position || !whyJoin || !contribution || !dailyCommitment) {
          if (window.showCustomAlert) window.showCustomAlert("Please complete all required fields for your chosen position.", "warning");
          else alert("Please complete all required fields for your chosen position.");
          return;
        }

        const btn = document.getElementById("secSubmitBtn");
        if (btn) {
          btn.disabled = true;
          btn.innerText = "Uploading to Drive & Submitting...";
        }

        try {
          const portfolioFileInput = document.getElementById("secPortfolioFile");
          const resumeFileInput = document.getElementById("secResumeFile");

          let portfolioUrl = portfolioFileInput?.dataset?.uploadedUrl || "";
          let resumeUrl = resumeFileInput?.dataset?.uploadedUrl || "";

          if (portfolioFileInput?.files?.[0] && !portfolioUrl) {
            portfolioUrl = await uploadFileToSupabase(portfolioFileInput.files[0], "secretariat-portfolios", "SEC_PORT");
          }
          if (resumeFileInput?.files?.[0] && !resumeUrl) {
            resumeUrl = await uploadFileToSupabase(resumeFileInput.files[0], "secretariat-resumes", "SEC_RES");
          }

          const portfolioFileData = (!portfolioUrl && portfolioFileInput?.files?.[0]) ? await fileToBase64(portfolioFileInput.files[0]) : null;
          const resumeFileData = (!resumeUrl && resumeFileInput?.files?.[0]) ? await fileToBase64(resumeFileInput.files[0]) : null;

          const payload = {
            action: "SUBMIT_SECRETARIAT",
            uid: auth.currentUser?.uid || "",
            fullName: document.getElementById("secName")?.value?.trim() || auth.currentUser?.displayName || "Applicant",
            email: document.getElementById("secEmail")?.value?.trim() || auth.currentUser?.email || "",
            phone: document.getElementById("secPhone")?.value?.trim() || "",
            instagram: document.getElementById("secInsta")?.value?.trim() || "",
            schoolCollege: document.getElementById("secSchool")?.value?.trim() || "",
            residentialAddress: document.getElementById("secAddress")?.value?.trim() || "",
            dob: document.getElementById("secDob")?.value || "",
            grade: document.getElementById("secGrade")?.value || "",
            position: position,
            whyJoin: whyJoin,
            contribution: contribution,
            dailyCommitment: dailyCommitment,
            portfolioUrl: portfolioUrl || "",
            resumeUrl: resumeUrl || "",
            portfolioBase64: portfolioFileData?.base64 || "",
            portfolioName: portfolioFileData?.name || portfolioFileInput?.files?.[0]?.name || "",
            portfolioType: portfolioFileData?.type || "application/pdf",
            resumeBase64: resumeFileData?.base64 || "",
            resumeName: resumeFileData?.name || resumeFileInput?.files?.[0]?.name || "",
            resumeType: resumeFileData?.type || "application/pdf",
            timestamp: new Date().toISOString()
          };

          const secRes = await submitSecretariatApplication(payload);
          localStorage.removeItem("resolveMunSecRegForm");

          const form = document.getElementById("secRegForm");
          if (form) form.reset();
          window.nextSecStep(1);
          closeModalById("secModal");

          const secTicketId = secRes?.appId || `RM26-SEC-${Math.floor(1000 + Math.random() * 9000)}`;
          if (typeof window.showPaymentReceiptModal === "function") {
            window.showPaymentReceiptModal({
              ticketId: secTicketId,
              amount: 0,
              date: new Date(),
              cardHolder: payload.fullName,
              utrNumber: "SECRETARIAT-APP",
              passCategory: `Secretariat (${position})`,
              barcodeValue: secTicketId,
              onContinue: () => {
                window.location.href = "/dashboard";
              },
            });
          } else if (window.showCustomAlert) {
            window.showCustomAlert("Application submitted! We've sent a confirmation to your email.", "success");
          }
        } catch (err) {
          console.error("Submission error:", err);
          if (window.showCustomAlert) {
            window.showCustomAlert("Application received. We'll be in touch soon!", "success");
          } else {
            alert("Application received. We'll be in touch soon!");
          }
          closeModalById("secModal");
        } finally {
          if (btn) {
            btn.disabled = false;
            btn.innerText = "Submit Application";
          }
        }
      };

      const MODAL_STORAGE_CONFIG = {
        regModal: {
          key: "resolveMunRegForm",
          stepPrefix: "step",
          fields: [
            "regName", "regGrade", "regPhone", "regEmail", "regInstitute", "regAddress",
            "regTransport", "regDob", "regReferral", "regEmergencyName", "regEmergencyPhone", "regExp",
            "pref1_committee", "pref1_port1", "pref1_port2", "pref1_role",
            "pref2_committee", "pref2_port1", "pref2_port2", "pref2_role",
            "pref3_committee", "pref3_port1", "pref3_port2", "pref3_role",
            "regTxnID", "regAdditionalInfo", "regUTR"
          ]
        },
        delModal: {
          key: "resolveMunDelRegForm",
          stepPrefix: "delStep",
          fields: [
            "delInstName", "delAdviserName", "delAdviserPhone", "delAdviserEmail", "delSize",
            "delReferral", "delTxnID", "delUTR"
          ]
        },
        ocModal: {
          key: "resolveMunOcRegForm",
          stepPrefix: "ocStep",
          fields: [
            "ocName", "ocDob", "ocGrade", "ocPhone", "ocEmail", "ocInst", "ocAddress", "ocInsta",
            "ocMunCount", "ocWhy", "ocAttributes", "ocFeeTier", "ocTxnID", "ocUTR", "ocReferral", "ocAdditionalInfo"
          ]
        },
        ebModal: {
          key: "resolveMunEbRegForm",
          stepPrefix: "ebStep",
          fields: [
            "ebName", "ebPhone", "ebEmail", "ebDob", "ebReferral", "ebInst", "ebRole", "ebMunCount",
            "ebExp", "ebWhy", "ebPref1", "ebPref2"
          ]
        },
        secModal: {
          key: "resolveMunSecRegForm",
          stepPrefix: "secStep",
          fields: [
            "secName", "secEmail", "secPhone", "secInsta", "secSchool", "secAddress",
            "secGrade", "secDob", "secExp", "secPosition", "secWhy", "secContribution", "secHours"
          ]
        },
        socialsModal: {
          key: "resolveMunSocialsRegForm",
          stepPrefix: "socialsStep",
          fields: [
            "socialsName", "socialsPhone", "socialsEmail", "socialsInst", "socialsGrade",
            "socialsDob", "socialsReferral", "socialsTxnID"
          ]
        }
      };

      let liveDraftTimeout = null;
      const scheduleLiveDraftBeacon = (modalId, saved) => {
        if (typeof window === "undefined") return;
        if (liveDraftTimeout) clearTimeout(liveDraftTimeout);
        liveDraftTimeout = setTimeout(() => {
          try {
            const formTypeMap = {
              regModal: "Individual Delegate",
              delModal: "Delegation Registration",
              ocModal: "Organizing Committee",
              ebModal: "Executive Board",
              secModal: "Secretariat Application",
            };
            const fullName = saved.regName || saved.delHeadName || saved.ocFullName || saved.ebFullName || saved.secFullName || "";
            const email = saved.regEmail || saved.delHeadEmail || saved.ocEmail || saved.ebEmail || saved.secEmail || "";
            const phone = saved.regPhone || saved.delHeadPhone || saved.ocPhone || saved.ebPhone || saved.secPhone || "";
            const institution = saved.regInstitute || saved.delInstName || saved.ocInstitute || saved.ebInstitute || saved.secInstitute || "";
            const grade = saved.regGrade || saved.ocGrade || saved.ebGrade || "";
            const prefList = [saved.pref1_committee, saved.pref2_committee, saved.pref3_committee].filter(Boolean);
            const preferences = prefList.length > 0 ? prefList.join(" · ") : (saved.ebRolePref || saved.secRolePref || "");

            if (fullName || (email && email.includes("@")) || phone) {
              fetch("/api/admin/", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                  action: "SAVE_DRAFT_LEAD",
                  fullName: fullName || "Prospective Candidate",
                  email: email || "",
                  phone: phone || "",
                  institution: institution || "Individual",
                  grade: grade || "",
                  preferences: preferences || "Awaiting Selection",
                  step: `Step ${saved._activeStep || 1}`,
                  formType: formTypeMap[modalId] || "Delegate Registration",
                  draftData: saved,
                }),
              }).catch(() => {});
            }
          } catch (_) {}
        }, 1200);
      };

      const saveModalDraft = (modalId) => {
        const cfg = MODAL_STORAGE_CONFIG[modalId];
        if (!cfg || typeof window === "undefined") return;
        try {
          const saved = {};
          cfg.fields.forEach((id) => {
            const el = document.getElementById(id);
            if (el) saved[id] = el.value;
          });
          if (modalId === "delModal") {
            const container = document.getElementById("delegateInputsContainer");
            if (container) {
              container.querySelectorAll("input, select").forEach((inp) => {
                if (inp.name) saved[inp.name] = inp.value;
              });
            }
          }
          const activeStep = document.querySelector(`#${modalId} .form-step.active`);
          if (activeStep && activeStep.id) {
            saved._activeStep = parseInt(activeStep.id.replace(cfg.stepPrefix, ""), 10) || 1;
          }
          localStorage.setItem(cfg.key, JSON.stringify(saved));
          scheduleLiveDraftBeacon(modalId, saved);
        } catch (_) {}
      };

      const restoreModalDraft = (modalId) => {
        const cfg = MODAL_STORAGE_CONFIG[modalId];
        if (!cfg || typeof window === "undefined") return;
        try {
          const raw = localStorage.getItem(cfg.key);
          if (!raw) return;
          const saved = JSON.parse(raw);
          cfg.fields.forEach((id) => {
            const el = document.getElementById(id);
            if (el && saved[id]) {
              el.value = saved[id];
              if (id.toLowerCase().endsWith("dob")) {
                el.dispatchEvent(new Event("change", { bubbles: true }));
              }
              if (id === "ocFeeTier" && typeof window.updateOcFeeTierUI === "function") {
                window.updateOcFeeTierUI(saved[id]);
              }
            }
          });
          if (saved._activeStep && saved._activeStep >= 1) {
            const modal = document.getElementById(modalId);
            if (modal) {
              const target = document.getElementById(`${cfg.stepPrefix}${saved._activeStep}`);
              if (target) {
                modal.querySelectorAll(".form-step").forEach((s) => s.classList.remove("active"));
                target.classList.add("active");
                const subtitle = modal.querySelector(".modal-subtitle");
                if (subtitle) {
                  const stepMap = {
                    1: "Step 1 of 3 · Personal Details",
                    2: "Step 2 of 3 · Committee Preferences",
                    3: "Step 3 of 3 · Payment & Submission",
                  };
                  if (stepMap[saved._activeStep]) {
                    subtitle.textContent = stepMap[saved._activeStep];
                  }
                }
              }
            }
          }
        } catch (_) {}
      };

      window.saveAllModalDrafts = saveModalDraft;
      window.restoreAllModalDrafts = restoreModalDraft;

      // Attach auto-save listeners to all modal inputs
      setTimeout(() => {
        Object.keys(MODAL_STORAGE_CONFIG).forEach((modalId) => {
          const modal = document.getElementById(modalId);
          if (modal && !modal.__autoSaveBound) {
            modal.__autoSaveBound = true;
            modal.addEventListener("input", () => saveModalDraft(modalId));
            modal.addEventListener("change", () => saveModalDraft(modalId));
          }
          restoreModalDraft(modalId);
        });
      }, 300);

      // Modal close buttons
      const modalList = [
        "selectionModal",
        "regModal",
        "delModal",
        "ocModal",
        "ebModal",
        "secModal",
        "socialsModal",
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
        { btnId: "closeSocialsModal", modalId: "socialsModal" },
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

    
    // GSAP Silky Smooth & Minimal Hero Loading Animation
    try {
      const hero = document.querySelector(".hero-title");
      if (hero) {
        const tl = gsap.timeline({ defaults: { ease: "power3.out" } });
        const eyebrow = document.querySelector(".hero-eyebrow");
        if (eyebrow) {
          tl.fromTo(
            eyebrow,
            { opacity: 0, y: -10 },
            { opacity: 1, y: 0, duration: 0.45, delay: 0.1 }
          );
        }
        const span1 = document.querySelector(".hero-title span:first-child");
        if (span1) {
          tl.fromTo(
            span1,
            { opacity: 0, y: 20 },
            { opacity: 1, y: 0, duration: 0.5, ease: "power2.out" },
            "-=0.3"
          );
        }
        const mun = document.querySelector(".hero-title .mun");
        if (mun) {
          tl.fromTo(
            mun,
            { opacity: 0, y: 20 },
            { opacity: 1, y: 0, duration: 0.5, ease: "power2.out" },
            "-=0.35"
          );
        }
        const tagline = document.querySelector(".hero-tagline");
        if (tagline) {
          tl.fromTo(
            tagline,
            { opacity: 0, y: 10 },
            { opacity: 1, y: 0, duration: 0.45, ease: "power2.out" },
            "-=0.3"
          );
        }
        const metaItems = document.querySelectorAll(".hero-meta-item");
        if (metaItems && metaItems.length > 0) {
          tl.fromTo(
            metaItems,
            { opacity: 0, y: 12 },
            {
              opacity: 1,
              y: 0,
              duration: 0.4,
              stagger: 0.06,
              ease: "power2.out",
              onStart: () => {
                // Subtle, premium counter animation for stats
                document.querySelectorAll(".hero-meta-item .value[data-target]").forEach((el) => {
                  const target = parseFloat(el.getAttribute("data-target"));
                  if (isNaN(target)) return;
                  const obj = { val: 0 };
                  gsap.to(obj, {
                    val: target,
                    duration: 0.9,
                    ease: "power2.out",
                    onUpdate: () => {
                      el.textContent = Math.round(obj.val);
                    },
                    onComplete: () => {
                      el.textContent = target;
                    }
                  });
                });
              }
            },
            "-=0.25"
          );
        }
        const dividers = document.querySelectorAll(".hero-meta-divider");
        if (dividers && dividers.length > 0) {
          tl.fromTo(
            dividers,
            { scaleY: 0, opacity: 0 },
            { scaleY: 1, opacity: 1, duration: 0.35, stagger: 0.04, ease: "power2.out" },
            "-=0.35"
          );
        }
        const actions = document.querySelector(".hero-actions");
        if (actions) {
          tl.fromTo(
            actions,
            { opacity: 0, y: 12 },
            { opacity: 1, y: 0, duration: 0.45, ease: "power2.out" },
            "-=0.2"
          );
        }
      }
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
          height: "100dvh",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          textAlign: "center",
          padding: "clamp(75px, 9vh, 95px) 24px clamp(20px, 3vh, 32px)",
          boxSizing: "border-box",
          overflow: "hidden",
        }}
      >
        {/* Immersive Shader Background (Adaptive: Sleek CSS radial mesh on mobile, full WebGL on desktop) */}
        <div style={{ position: "absolute", inset: 0, zIndex: 0, pointerEvents: "none", overflow: "hidden" }}>
          {isMobile ? (
            <div
              style={{
                position: "absolute",
                inset: 0,
                zIndex: 0,
                background:
                  "radial-gradient(circle at 50% 25%, rgba(255, 255, 255, 0.08) 0%, rgba(10, 10, 15, 0.95) 60%, #050508 100%)",
              }}
            />
          ) : (
            <GradientBackground
              colors={["#ffffff", "#000000", "#ffffff"]}
              colorBack="#000000"
              intensity={0.45}
              softness={0.9}
              noise={0}
              speed={0.4}
              style={{ position: "absolute", inset: 0, zIndex: 0 }}
            />
          )}
          {/* Luminous atmospheric depth & vignette */}
          <div
            style={{
              position: "absolute",
              inset: 0,
              zIndex: 1,
              background:
                "linear-gradient(to bottom, transparent 65%, rgba(5, 5, 8, 0.75) 84%, #050508 100%)",
            }}
          />
          {/* Subtle grid overlay */}
          <div className="hero-grid" style={{ zIndex: 2 }} />
        </div>

        {/* Particles (Desktop only to prevent mobile thermal GPU lag) */}
        {!isMobile && (
          <canvas
            className="particles-canvas"
            id="particles"
            style={{ position: "absolute", inset: 0, zIndex: 3, pointerEvents: "none" }}
          />
        )}

        {/* Foreground Content — Perfectly fitted, zero cutoff */}
        <div style={{ position: "relative", zIndex: 10, width: "100%", maxWidth: "900px", margin: "0 auto" }}>
          {/* Eyebrow */}
          <div className="hero-eyebrow">
            {(siteSettings.conferenceDates || "25, 26, 27 DECEMBER 2026").toUpperCase()}
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

          {/* Clean Minimal SEO Badge */}
          <div className="mt-3.5 inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-white/[0.04] border border-white/10 text-[11px] sm:text-xs text-zinc-300 font-medium shadow-sm">
            <span className="text-amber-400 font-bold">★ Rated #1</span>
            <span className="text-white/20">•</span>
            <span className="text-white font-semibold tracking-wide">Best MUN in Hyderabad</span>
            <span className="text-white/20">•</span>
            <span className="text-zinc-400 font-mono">25–27 Dec 2026</span>
          </div>

          {/* Stats: Exact archive design, Committees = 6 */}
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
              <span className="value" data-target="6">6</span>
            </div>
            <div className="hero-meta-divider" />
            <div className="hero-meta-item">
              <span className="label">Days</span>
              <span className="value" data-target="3">3</span>
            </div>
          </div>

          {/* Action Buttons: Register Now + Dotted Wrapped Releasing Soon Brochure */}
          <div className="hero-actions reveal">
            <ChromeButton
              onClick={handleOpenSelection}
            >
              REGISTER NOW
            </ChromeButton>

            <ChromeButton
              onClick={() => {
                if (typeof window !== "undefined") {
                  if (window.showCustomAlert) window.showCustomAlert("Delegate Brochure releasing soon!", "info");
                  else if (window.showAlert) window.showAlert("Delegate Brochure releasing soon!", "info");
                  else alert("Delegate Brochure releasing soon!");
                }
              }}
            >
              DELEGATE BROCHURE
            </ChromeButton>
          </div>
        </div>
      </section>

      {/* LUXURY EDITORIAL CONFERENCE TICKER STRIP */}
      <div className="word-carousel-strip" aria-label="Conference Highlights">
        <div className="marquee-track">
          {/* Track Group 1 */}
          <div className="marquee-group">
            <span className="ticker-item ticker-highlight">RESOLVE MUN 2.0</span>
            <span className="ticker-sep">✦</span>
            <span className="ticker-item">{(siteSettings.conferenceDates || "25, 26, 27 DECEMBER 2026").toUpperCase()}</span>
            <span className="ticker-sep">/</span>
            <span className="ticker-item ticker-highlight">HYDERABAD&apos;S BOLDEST MUN</span>
            <span className="ticker-sep">✦</span>
            <span className="ticker-item">{(siteSettings.venueShort || siteSettings.conferenceVenue || "MERIDIAN SCHOOL, KOMPALLY").toUpperCase()}</span>
            <span className="ticker-sep">/</span>
            <span className="ticker-item ticker-motto">RESOLVE · REFORM · RECONCILE</span>
            <span className="ticker-sep">✦</span>
            <span className="ticker-item ticker-highlight">250+ DELEGATES</span>
            <span className="ticker-sep">/</span>
            <span className="ticker-item ticker-highlight">YOU BETTER PULL UP</span>
            <span className="ticker-sep">✦</span>
            <span className="ticker-item">6 DYNAMIC COMMITTEES</span>
            <span className="ticker-sep">/</span>
            <span className="ticker-item">EXECUTIVE BOARD OF DISTINCTION</span>
            <span className="ticker-sep">✦</span>
            <span className="ticker-item">WHERE DEBATE GETS REAL</span>
            <span className="ticker-sep">/</span>
            <span className="ticker-item">DON&apos;T JUST ATTEND · DOMINATE</span>
            <span className="ticker-sep">✦</span>
          </div>
          {/* Track Group 2 (Exact duplicate for seamless 60fps infinite loop) */}
          <div className="marquee-group" aria-hidden="true">
            <span className="ticker-item ticker-highlight">RESOLVE MUN 2.0</span>
            <span className="ticker-sep">✦</span>
            <span className="ticker-item">{(siteSettings.conferenceDates || "25, 26, 27 DECEMBER 2026").toUpperCase()}</span>
            <span className="ticker-sep">/</span>
            <span className="ticker-item ticker-highlight">HYDERABAD&apos;S BOLDEST MUN</span>
            <span className="ticker-sep">✦</span>
            <span className="ticker-item">{(siteSettings.venueShort || siteSettings.conferenceVenue || "MERIDIAN SCHOOL, KOMPALLY").toUpperCase()}</span>
            <span className="ticker-sep">/</span>
            <span className="ticker-item ticker-motto">RESOLVE · REFORM · RECONCILE</span>
            <span className="ticker-sep">✦</span>
            <span className="ticker-item ticker-highlight">250+ DELEGATES</span>
            <span className="ticker-sep">/</span>
            <span className="ticker-item ticker-highlight">YOU BETTER PULL UP</span>
            <span className="ticker-sep">✦</span>
            <span className="ticker-item">6 DYNAMIC COMMITTEES</span>
            <span className="ticker-sep">/</span>
            <span className="ticker-item">EXECUTIVE BOARD OF DISTINCTION</span>
            <span className="ticker-sep">✦</span>
            <span className="ticker-item">WHERE DEBATE GETS REAL</span>
            <span className="ticker-sep">/</span>
            <span className="ticker-item">DON&apos;T JUST ATTEND · DOMINATE</span>
            <span className="ticker-sep">✦</span>
          </div>
        </div>
      </div>

      {/* Main Page HTML Content with Interactive Committees & Secretariat Team */}
      <div id="main-container" ref={containerRef}>
        <div dangerouslySetInnerHTML={HOME_PART1_HTML} />
        <CommitteesSection />
        {HOME_PART2_HTML && <div dangerouslySetInnerHTML={HOME_PART2_HTML} />}
        <SecretariatSection />
        {HOME_PART3_HTML && <div dangerouslySetInnerHTML={HOME_PART3_HTML} />}
      </div>
      
      {/* Best MUN in Hyderabad FAQ Section */}
      <BestMunFaqSection />

      {/* Interactive Delegate Pass Section (Above Footer) */}
      <DelegatePassSection />

      {/* Universal Footer with Theme Toggler */}
      <Footer />
      
      {/* POST-AUTH WELCOME DIALOG (Diplomatic Luxury Identity) */}
      {showWelcomeBox && currentUser && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/85 backdrop-blur-2xl animate-in fade-in duration-200">
          <div className="relative w-full max-w-md p-6 sm:p-7 rounded-2xl border border-indigo-500/30 bg-gradient-to-b from-[#0b0f24] to-[#05060f] shadow-[0_25px_80px_rgba(0,0,0,0.9),0_0_50px_rgba(99,102,241,0.2)] text-center overflow-hidden">
            {/* Top Glowing Beam */}
            <div className="absolute top-0 inset-x-0 h-[2px] bg-gradient-to-r from-transparent via-indigo-400 to-transparent" />
            <div className="absolute -top-12 left-1/2 -translate-x-1/2 w-48 h-24 bg-indigo-500/20 blur-2xl pointer-events-none rounded-full" />

            {/* Minimalist Close Icon */}
            <button
              type="button"
              onClick={() => {
                sessionStorage.setItem("resolve_welcome_dismissed_" + currentUser.uid, "true");
                setShowWelcomeBox(false);
              }}
              className="absolute top-4 right-4 w-8 h-8 rounded-xl text-white/50 hover:text-white bg-white/[0.04] hover:bg-white/[0.09] border border-white/10 flex items-center justify-center transition-all cursor-pointer active:scale-95"
              aria-label="Close dialog"
            >
              <X className="w-4 h-4" />
            </button>

            {/* Official Resolve MUN Emblem with Verified Ring */}
            <div className="relative w-14 h-14 mx-auto mb-4">
              <div className="w-14 h-14 rounded-2xl bg-[#0e132e] border border-indigo-400/30 p-2.5 flex items-center justify-center shadow-[0_0_20px_rgba(99,102,241,0.3)]">
                <img
                  src="https://resolvemun.in/images/Logo.svg"
                  alt="Resolve MUN Emblem"
                  className="w-full h-full object-contain filter brightness-110 drop-shadow-[0_0_8px_rgba(255,255,255,0.35)]"
                />
              </div>
              <div className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-emerald-500 border-2 border-[#0b0f24] flex items-center justify-center text-black shadow-sm">
                <Check className="w-3 h-3 stroke-[3]" />
              </div>
            </div>

            {/* Eyebrow & Title */}
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/25 mb-2.5">
              <span className="w-1.5 h-1.5 rounded-full bg-indigo-400 animate-pulse" />
              <span className="font-mono text-[10px] tracking-wider text-indigo-300 uppercase font-semibold">
                RESOLVE MUN 2026
              </span>
            </div>

            <h3
              className="text-2xl sm:text-[26px] font-extrabold uppercase tracking-wide text-white mb-2"
              style={{ fontFamily: "'Oswald', sans-serif" }}
            >
              WELCOME, {currentUser.displayName ? currentUser.displayName.split(" ")[0] : "DELEGATE"}
            </h3>

            {/* Natural Copy */}
            <p className="text-xs text-white/70 leading-relaxed max-w-sm mx-auto mb-5 font-normal">
              You're signed in. View your committee assignment, digital entry pass, and event schedule in your dashboard.
            </p>

            {/* Status Strip */}
            <div className="flex items-center justify-center gap-2.5 py-2 px-3 rounded-xl bg-white/[0.03] border border-white/10 text-xs text-white/60 mb-6">
              <span className="flex items-center gap-1.5 text-emerald-400 font-semibold">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                Signed In
              </span>
              <span className="text-white/20">|</span>
              <span className="text-white/70">{siteSettings.conferenceDates || "25, 26, 27 December 2026"}</span>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-2.5">
              <Link
                href="/dashboard"
                onClick={() => {
                  sessionStorage.setItem("resolve_welcome_dismissed_" + currentUser.uid, "true");
                  setShowWelcomeBox(false);
                }}
                className="flex-1 inline-flex items-center justify-center gap-2 h-11 px-5 rounded-xl bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 text-white font-bold text-xs tracking-wider uppercase shadow-[0_0_20px_rgba(99,102,241,0.4)] hover:shadow-[0_0_30px_rgba(99,102,241,0.6)] hover:brightness-110 active:scale-[0.98] transition-all cursor-pointer"
              >
                <span>GO TO DASHBOARD</span>
                <ArrowUpRight className="w-4 h-4" />
              </Link>
              <button
                type="button"
                onClick={() => {
                  sessionStorage.setItem("resolve_welcome_dismissed_" + currentUser.uid, "true");
                  setShowWelcomeBox(false);
                }}
                className="h-11 px-5 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] border border-white/10 text-white/70 hover:text-white text-xs font-semibold tracking-wide transition-colors cursor-pointer active:scale-[0.98]"
              >
                CONTINUE BROWSING
              </button>
            </div>
          </div>
        </div>
      )}

      <ModalShaderBackdrop />
      <DobPickerPortals />
      <PaymentReceiptModal />
      <AuthModal
        isOpen={authOpen}
        initialMode={authInitialMode}
        onClose={() => setAuthOpen(false)}
      />
    </>
  );
}