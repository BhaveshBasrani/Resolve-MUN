"use client";

import React, { useState, useEffect, useRef } from "react";
import { GrainGradient } from "@paper-design/shaders-react";
import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import {
  auth,
  signInWithGoogle,
  signInWithEmail,
  signUpWithEmail,
  sendPasswordReset,
  signOutUser,
  sendVerificationCodeEmail,
  onAuthStateChanged,
} from "@/lib/firebase";
import {
  X,
  Eye,
  EyeOff,
  Loader2,
  CheckCircle2,
  AlertCircle,
  ArrowLeft,
  ChevronRight,
  Sparkles,
} from "lucide-react";
import Link from "next/link";

export function cn(...inputs) {
  return twMerge(clsx(inputs));
}

// Ultra-premium, lightweight Dot Matrix Canvas (60fps, zero-dependency)
function CanvasDotMatrix({
  dotSize = 1.8,
  spacing = 22,
  speed = 0.0012,
  className = "",
  reverse = false,
}) {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animId;
    let width = 0;
    let height = 0;

    const resize = () => {
      const parent = canvas.parentElement;
      if (!parent) return;
      width = parent.clientWidth;
      height = parent.clientHeight;
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = width * dpr;
      canvas.height = height * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };

    resize();
    window.addEventListener("resize", resize);

    const start = performance.now();

    const render = (now) => {
      const elapsed = (now - start) * speed;
      ctx.clearRect(0, 0, width, height);

      const cols = Math.ceil(width / spacing) + 1;
      const rows = Math.ceil(height / spacing) + 1;
      const centerX = width / 2;
      const centerY = height / 2;
      const maxDist = Math.hypot(centerX, centerY) || 1;

      for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) {
          const x = c * spacing;
          const y = r * spacing;

          const dist = Math.hypot(x - centerX, y - centerY);
          const normDist = dist / maxDist;

          // Wave pulse effect
          const wave = reverse
            ? Math.sin(normDist * 7 + elapsed * 3.5)
            : Math.sin(normDist * 7 - elapsed * 3.5);

          // Organic shimmer
          const seed = Math.sin(c * 12.9898 + r * 78.233) * 43758.5453;
          const twinkle = (Math.sin(elapsed * 2.5 + seed) + 1) * 0.5;

          const baseAlpha = 0.04 + Math.max(0, wave * 0.38) * (twinkle * 0.5 + 0.5);
          const alpha = Math.max(0.02, Math.min(0.65, baseAlpha));

          ctx.fillStyle = `rgba(255, 255, 255, ${alpha.toFixed(3)})`;
          ctx.beginPath();
          ctx.arc(x, y, dotSize, 0, Math.PI * 2);
          ctx.fill();
        }
      }

      animId = requestAnimationFrame(render);
    };

    animId = requestAnimationFrame(render);

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener("resize", resize);
    };
  }, [dotSize, spacing, speed, reverse]);

  return (
    <canvas
      ref={canvasRef}
      className={cn("absolute inset-0 pointer-events-none w-full h-full", className)}
      style={{ width: "100%", height: "100%" }}
    />
  );
}

export function AuthModal({ isOpen, onClose, initialMode = "signup" }) {
  const [mode, setMode] = useState(initialMode); // "signup" | "signin" | "forgot" | "profile" | "pathway" | "code" | "success"
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [receiveUpdates, setReceiveUpdates] = useState(false);
  const [agreeTerms, setAgreeTerms] = useState(false);
  const [agreePrivacy, setAgreePrivacy] = useState(false);

  const [loading, setLoading] = useState(false);
  const [socialLoading, setSocialLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [currentUser, setCurrentUser] = useState(null);
  const [shaderMounted, setShaderMounted] = useState(false);

  // 6-Digit Email Verification Code State
  const [code, setCode] = useState(["", "", "", "", "", ""]);
  const codeInputRefs = useRef([]);
  const [pendingSignup, setPendingSignup] = useState(null); // { email, password, fullName, code }
  const [resendCooldown, setResendCooldown] = useState(0);

  // Auto-focus first input on code screen
  useEffect(() => {
    if (mode === "code") {
      const t = setTimeout(() => {
        if (codeInputRefs.current[0]) {
          codeInputRefs.current[0].focus();
        }
      }, 350);
      return () => clearTimeout(t);
    }
  }, [mode]);

  // Resend countdown timer
  useEffect(() => {
    if (resendCooldown > 0) {
      const timer = setTimeout(() => setResendCooldown((c) => c - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [resendCooldown]);

  const handleCodeChange = (index, value) => {
    const val = value.replace(/[^0-9]/g, "");
    if (val.length <= 1) {
      const newCode = [...code];
      newCode[index] = val;
      setCode(newCode);

      // Focus next input if digit entered
      if (val && index < 5) {
        codeInputRefs.current[index + 1]?.focus();
      }

      // Check if complete 6-digit code
      if (index === 5 && val) {
        const full = newCode.join("");
        if (full.length === 6 && !newCode.includes("")) {
          setTimeout(() => {
            handleVerifyCode(full);
          }, 150);
        }
      }
    }
  };

  const handleKeyDown = (index, e) => {
    if (e.key === "Backspace") {
      if (!code[index] && index > 0) {
        codeInputRefs.current[index - 1]?.focus();
      }
    } else if (e.key === "ArrowLeft" && index > 0) {
      e.preventDefault();
      codeInputRefs.current[index - 1]?.focus();
    } else if (e.key === "ArrowRight" && index < 5) {
      e.preventDefault();
      codeInputRefs.current[index + 1]?.focus();
    }
  };

  const handlePaste = (e) => {
    e.preventDefault();
    const raw = (e.clipboardData || window.clipboardData)?.getData("text") || "";
    const clean = raw.replace(/[^0-9]/g, "").slice(0, 6);
    if (!clean) return;
    const newCode = [...code];
    for (let i = 0; i < 6; i++) {
      newCode[i] = clean[i] || "";
    }
    setCode(newCode);
    if (clean.length === 6) {
      codeInputRefs.current[5]?.focus();
      setTimeout(() => {
        handleVerifyCode(clean);
      }, 150);
    } else {
      const nextIdx = Math.min(clean.length, 5);
      codeInputRefs.current[nextIdx]?.focus();
    }
  };

  const handleResendCode = async () => {
    if (resendCooldown > 0 || !pendingSignup) return;
    setLoading(true);
    setError("");
    setSuccess("");
    try {
      const newOtp = String(Math.floor(100000 + Math.random() * 900000));
      setPendingSignup((prev) => ({ ...prev, code: newOtp }));
      await sendVerificationCodeEmail(pendingSignup.email, newOtp, pendingSignup.fullName);
      setSuccess("A new 6-digit verification code has been sent to your email.");
      setResendCooldown(45);
      setCode(["", "", "", "", "", ""]);
      setTimeout(() => {
        codeInputRefs.current[0]?.focus();
      }, 100);
    } catch (err) {
      setError("Failed to resend code: " + (err.message || "Please try again later."));
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyCode = async (overrideCode) => {
    const entered = typeof overrideCode === "string" ? overrideCode : code.join("");
    if (entered.length < 6) {
      setError("Please enter the complete 6-digit verification code.");
      return;
    }

    setLoading(true);
    setError("");
    setSuccess("");

    try {
      if (!pendingSignup || entered !== pendingSignup.code) {
        throw new Error("Invalid verification code. Please check your email and try again.");
      }

      // Verification matched! Create verified user account in Firebase
      const u = await signUpWithEmail(pendingSignup.email, pendingSignup.password, pendingSignup.fullName);

      if (typeof window !== "undefined") {
        const name = pendingSignup.fullName || u?.displayName || u?.email?.split("@")[0] || "Delegate";
        localStorage.setItem("resolve_user_name", name);
        localStorage.setItem("resolve_user_email", pendingSignup.email || "");
        localStorage.setItem("resolve_user_verified", "true");
        if (window.autofillAllKnownFields && u) window.autofillAllKnownFields(u);
      }

      setSuccess("Email verified successfully! Welcome to Resolve MUN 2.0.");
      setMode("success");
    } catch (err) {
      setError(err.message || "Verification failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // Auto-transition to pathway selection from celebration screen
  useEffect(() => {
    if (mode === "success") {
      const t = setTimeout(() => {
        setMode("pathway");
      }, 2200);
      return () => clearTimeout(t);
    }
  }, [mode]);

  // Firebase auth state subscription
  useEffect(() => {
    setShaderMounted(true);
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      if (firebaseUser) {
        setCurrentUser({
          uid: firebaseUser.uid,
          email: firebaseUser.email,
          displayName: firebaseUser.displayName || firebaseUser.email?.split("@")[0] || "Delegate",
          photoURL: firebaseUser.photoURL || "",
        });
      } else {
        setCurrentUser(null);
      }
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (isOpen) {
      setMode(initialMode || (currentUser ? "profile" : "signup"));
      setError("");
      setSuccess("");
    }
  }, [isOpen, initialMode, currentUser]);

  useEffect(() => {
    const handleKey = (e) => {
      if (e.key === "Escape" && isOpen) onClose();
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [isOpen, onClose]);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
      setError("");
      setSuccess("");
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const handleEmailAuth = async (e) => {
    if (e && e.preventDefault) e.preventDefault();
    setError("");
    setSuccess("");

    if (mode === "signup") {
      if (!agreeTerms || !agreePrivacy) {
        setError("Please check both the Terms & Conditions and Privacy Policy boxes to proceed.");
        return;
      }
    }

    setLoading(true);

    try {
      if (mode === "forgot") {
        if (!email) throw new Error("Please enter your email address.");
        await sendPasswordReset(email);
        setSuccess("Password reset instructions have been sent to your email.");
        setLoading(false);
        return;
      }

      if (mode === "signup") {
        if (!email || !password) throw new Error("Please fill in your email and password.");
        if (password.length < 6) throw new Error("Password must be at least 6 characters.");

        const fullName = `${firstName} ${lastName}`.trim() || "Delegate";
        const otpCode = String(Math.floor(100000 + Math.random() * 900000));

        setPendingSignup({
          email: email.trim(),
          password,
          fullName,
          code: otpCode,
        });

        // Dispatch verification code via Google Apps Script mailer
        await sendVerificationCodeEmail(email.trim(), otpCode, fullName);

        setCode(["", "", "", "", "", ""]);
        setResendCooldown(45);
        setMode("code");
        setSuccess(`Verification code sent to ${email.trim()}. Enter below to activate.`);
        setLoading(false);
        return;
      } else {
        // Sign in mode
        if (!email || !password) throw new Error("Please enter both email and password.");
        const u = await signInWithEmail(email, password);

        if (typeof window !== "undefined" && u) {
          const name = u.displayName || u.email?.split("@")[0] || "Delegate";
          localStorage.setItem("resolve_user_name", name);
          localStorage.setItem("resolve_user_email", u.email || "");
          localStorage.setItem("resolve_user_photo", u.photoURL || "");
          if (window.autofillAllKnownFields) window.autofillAllKnownFields(u);
        }
        setSuccess("Signed in successfully!");
      }
    } catch (err) {
      let msg = err.message || "Authentication failed.";
      if (err.code === "auth/invalid-credential" || err.message?.includes("invalid-credential")) {
        msg = "Invalid email or password. Please check your credentials.";
      } else if (err.code === "auth/email-already-in-use" || err.message?.includes("email-already-in-use")) {
        msg = "An account with this email already exists. Please sign in.";
      } else if (err.code === "auth/user-not-found") {
        msg = "No account found with this email. Please sign up.";
      } else if (err.code === "auth/wrong-password") {
        msg = "Incorrect password. Please try again.";
      }
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  const handleSocialAuth = async () => {
    setError("");
    setSuccess("");

    if (mode === "signup" && (!agreeTerms || !agreePrivacy)) {
      setError("Please check both the Terms and Conditions and Privacy Policy boxes before registering with Google.");
      return;
    }

    setSocialLoading(true);
    try {
      const u = await signInWithGoogle();
      if (typeof window !== "undefined" && u) {
        const name = u.displayName || u.email?.split("@")[0] || "Delegate";
        localStorage.setItem("resolve_user_name", name);
        localStorage.setItem("resolve_user_email", u.email || "");
        localStorage.setItem("resolve_user_photo", u.photoURL || "");
        localStorage.setItem("resolve_user_verified", "true");
        if (window.autofillAllKnownFields) window.autofillAllKnownFields(u);
      }
    } catch (err) {
      setError(err.message || "Google sign-in failed.");
    } finally {
      setSocialLoading(false);
    }
  };

  const handlePathwaySelect = (track) => {
    if (typeof window !== "undefined") {
      localStorage.setItem("resolve_selection_opened", "true");
    }
    onClose();

    if (typeof window !== "undefined") {
      if (track === "delegate") {
        if (window.selectPathway) window.selectPathway("delegate");
        else if (window.openRegistration) window.openRegistration();
      } else if (track === "delegation") {
        if (window.selectPathway) window.selectPathway("delegation");
        else if (window.openDelRegistration) window.openDelRegistration();
      } else if (track === "secretariat") {
        if (window.selectPathway) window.selectPathway("secretariat");
        else {
          const m = document.getElementById("secretariatModal");
          if (m) m.classList.add("active");
        }
      }
    }
  };

  const handleSignOut = async () => {
    try {
      await signOutUser();
      setSuccess("Signed out successfully.");
      setMode("signin");
    } catch (err) {
      setError(err.message || "Failed to sign out.");
    }
  };

  const switchMode = (m) => {
    setMode(m);
    setError("");
    setSuccess("");
  };

  const isSignupLocked = mode === "signup" && (!agreeTerms || !agreePrivacy);

  return (
    <div
      className="fixed inset-0 z-[99999] flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-xl overflow-hidden overscroll-none select-none font-sans"
      role="dialog"
      aria-modal="true"
    >
      {/* Background click dismiss */}
      <div className="fixed inset-0" onClick={onClose} aria-hidden="true" />

      {/* Main Two-Column Container */}
      <div className="relative z-10 w-full max-w-[780px] h-auto max-h-[92vh] rounded-2xl border border-white/20 bg-[#07080e] shadow-[0_25px_65px_rgba(0,0,0,0.85),0_0_35px_rgba(99,102,241,0.12)] overflow-hidden grid md:grid-cols-[1.14fr_0.86fr]">
        
        {/* Rounded-Edge Square High-Visibility Close Button */}
        <button
          type="button"
          onClick={onClose}
          aria-label="Close"
          className="absolute top-3 right-3 z-40 w-9 h-9 rounded-xl bg-black/80 hover:bg-black border border-white/30 hover:border-white/60 text-white flex items-center justify-center transition-all duration-200 cursor-pointer backdrop-blur-md shadow-[0_4px_20px_rgba(0,0,0,0.6)] active:scale-95 group"
        >
          <X className="w-4 h-4 text-white/90 group-hover:text-white transition-colors" strokeWidth={2.2} />
        </button>

        {/* ── LEFT COLUMN ── */}
        <div className="relative flex flex-col justify-center overflow-hidden px-5 py-4 sm:px-6 sm:py-5 border-b md:border-b-0 md:border-r border-white/10 max-h-[92vh]">
          {/* Ambient Dot Matrix Canvas during Code & Success modes */}
          {(mode === "code" || mode === "success") && (
            <CanvasDotMatrix
              dotSize={1.8}
              spacing={22}
              reverse={mode === "success"}
              className="opacity-20"
            />
          )}

          <div key={mode} className="relative z-10 auth-phase w-full max-w-[360px] mx-auto my-auto py-1">
            
            {/* 1. CODE VERIFICATION VIEW (Ultra-Premium Sculpted Tiles & Thin Borders) */}
            {mode === "code" && (
              <section className="space-y-4 text-center" aria-labelledby="code-title">
                {/* Top Nav Back Link */}
                <div className="flex items-center justify-between text-left">
                  <button
                    type="button"
                    onClick={() => {
                      setMode("signup");
                      setCode(["", "", "", "", "", ""]);
                      setError("");
                      setSuccess("");
                    }}
                    className="group inline-flex items-center gap-1.5 text-xs font-medium text-white/50 hover:text-white transition-colors cursor-pointer"
                  >
                    <ArrowLeft className="w-3.5 h-3.5 group-hover:-translate-x-0.5 transition-transform text-white/40 group-hover:text-white" />
                    <span>Back to sign up</span>
                  </button>
                  <span className="text-[10px] font-mono tracking-[0.2em] text-amber-400 uppercase font-semibold px-2.5 py-0.5 rounded-full bg-amber-500/10 border border-amber-500/20">
                    UNVERIFIED
                  </span>
                </div>

                {/* Header */}
                <div className="space-y-1.5 pt-1 text-center">
                  <h1 id="code-title" className="font-sans text-2xl sm:text-[28px] font-bold tracking-tight text-white leading-tight">
                    We sent you a code
                  </h1>
                  <p className="text-xs sm:text-[13px] text-white/55 font-normal leading-relaxed max-w-[32ch] mx-auto font-sans">
                    Please enter the 6-digit code sent to{" "}
                    <strong className="text-white font-medium">{pendingSignup?.email || email}</strong>
                  </p>
                </div>

                {/* Feedback Alerts */}
                {error && (
                  <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/25 text-red-300 text-xs flex items-start gap-2 text-left animate-in fade-in duration-150">
                    <AlertCircle className="w-4 h-4 shrink-0 text-red-400 mt-0.5" />
                    <span className="leading-snug">{error}</span>
                  </div>
                )}
                {success && (
                  <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/25 text-emerald-300 text-xs flex items-start gap-2 text-left animate-in fade-in duration-150">
                    <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400 mt-0.5" />
                    <span className="leading-snug">{success}</span>
                  </div>
                )}

                {/* 6 Individual Sculpted Digit Tiles with Thin Borders */}
                <div className="w-full py-2">
                  <div className="flex items-center justify-center gap-2 sm:gap-2.5 max-w-[320px] mx-auto">
                    {code.map((digit, i) => (
                      <div
                        key={i}
                        className={cn(
                          "relative w-10 sm:w-11 h-12 sm:h-13 rounded-xl border transition-all duration-200 flex items-center justify-center bg-[#090b14] shadow-[0_2px_8px_rgba(0,0,0,0.5)]",
                          digit
                            ? "border-white/50 bg-white/[0.06] shadow-[0_0_15px_rgba(255,255,255,0.15)]"
                            : "border-white/15 hover:border-white/30 focus-within:border-white/60 focus-within:bg-white/[0.05] focus-within:shadow-[0_0_20px_rgba(99,102,241,0.25)]"
                        )}
                      >
                        <input
                          ref={(el) => {
                            codeInputRefs.current[i] = el;
                          }}
                          type="text"
                          inputMode="numeric"
                          pattern="[0-9]*"
                          maxLength={1}
                          value={digit}
                          onChange={(e) => handleCodeChange(i, e.target.value)}
                          onKeyDown={(e) => handleKeyDown(i, e)}
                          onPaste={handlePaste}
                          className="w-full h-full text-center text-xl sm:text-2xl bg-transparent text-white border-none focus:outline-none focus:ring-0 appearance-none font-mono font-bold"
                          style={{ caretColor: "transparent" }}
                          aria-label={`Verification digit ${i + 1}`}
                        />
                        {!digit && (
                          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                            <span className="text-xl sm:text-2xl text-white/20 font-mono font-light">
                              •
                            </span>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Resend Code Link */}
                <div className="pt-0.5">
                  <button
                    type="button"
                    onClick={handleResendCode}
                    disabled={resendCooldown > 0 || loading}
                    className={`text-xs sm:text-[13px] transition-all font-sans font-medium ${
                      resendCooldown > 0
                        ? "text-white/35 cursor-not-allowed"
                        : "text-white/55 hover:text-white cursor-pointer underline underline-offset-4 hover:scale-[1.02] active:scale-[0.98]"
                    }`}
                  >
                    {resendCooldown > 0 ? `Resend code in ${resendCooldown}s` : "Resend code"}
                  </button>
                </div>

                {/* Action Buttons */}
                <div className="flex w-full gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => {
                      setMode("signup");
                      setCode(["", "", "", "", "", ""]);
                      setError("");
                      setSuccess("");
                    }}
                    className="w-[32%] rounded-full bg-white text-black font-bold px-4 py-3 text-xs sm:text-sm uppercase tracking-wider hover:bg-white/90 active:scale-[0.98] transition-all cursor-pointer shadow-[0_2px_12px_rgba(255,255,255,0.2)]"
                  >
                    Back
                  </button>
                  <button
                    type="button"
                    onClick={() => handleVerifyCode()}
                    disabled={!code.every((d) => d !== "") || loading}
                    className={`flex-1 rounded-full font-bold py-3 text-xs sm:text-sm uppercase tracking-wider transition-all duration-300 flex items-center justify-center gap-2 ${
                      code.every((d) => d !== "") && !loading
                        ? "bg-white text-black border-transparent hover:bg-white/90 cursor-pointer active:scale-[0.98] shadow-[0_0_30px_rgba(255,255,255,0.4)]"
                        : "bg-white/5 text-white/35 border border-white/10 cursor-not-allowed"
                    }`}
                  >
                    {loading ? (
                      <>
                        <Loader2 className="w-3.5 h-3.5 animate-spin text-black" />
                        <span>Verifying...</span>
                      </>
                    ) : (
                      <span>Continue</span>
                    )}
                  </button>
                </div>

                <p className="text-[11px] text-white/40 pt-2 leading-relaxed max-w-[34ch] mx-auto font-sans">
                  Entering the code will authenticate and activate your delegate profile.
                </p>
              </section>
            )}

            {/* 1B. CELEBRATION SUCCESS VIEW ("You're in!") */}
            {mode === "success" && (
              <section className="space-y-6 text-center py-4 animate-in fade-in zoom-in-95 duration-400" aria-labelledby="success-title">
                <div className="space-y-1.5">
                  <h1 id="success-title" className="text-3xl sm:text-[36px] font-bold leading-[1.1] tracking-tight text-white font-sans">
                    You&apos;re in!
                  </h1>
                  <p className="text-sm sm:text-base text-white/60 font-light">
                    Welcome to Resolve MUN 2026
                  </p>
                </div>

                <div className="py-6 flex items-center justify-center">
                  <div className="relative">
                    <div className="absolute inset-0 rounded-full bg-white/20 blur-xl animate-pulse" />
                    <div className="relative w-20 h-20 rounded-full bg-gradient-to-br from-white via-white/95 to-white/80 flex items-center justify-center shadow-[0_0_50px_rgba(255,255,255,0.45)]">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-black" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    </div>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setMode("pathway")}
                  className="w-full rounded-full bg-white text-black font-bold py-3.5 hover:bg-white/90 active:scale-[0.98] transition-all shadow-[0_0_35px_rgba(255,255,255,0.35)] cursor-pointer text-xs sm:text-sm uppercase tracking-wider flex items-center justify-center gap-2"
                >
                  <span>Select Registration Pathway</span>
                  <ChevronRight className="w-4 h-4 text-black" />
                </button>
              </section>
            )}

            {/* 2. PATHWAY VIEW (Compact, Non-Scrollable & Thin Borders) */}
            {mode === "pathway" && (
              <section className="space-y-3" aria-labelledby="pathway-title">
                {/* Top Nav Back Link */}
                <div className="flex items-center justify-between">
                  <button
                    type="button"
                    onClick={() => switchMode(currentUser ? "profile" : "signup")}
                    className="group inline-flex items-center gap-1.5 text-xs font-medium text-white/45 hover:text-white transition-colors cursor-pointer"
                  >
                    <ArrowLeft className="w-3.5 h-3.5 group-hover:-translate-x-0.5 transition-transform text-white/40 group-hover:text-white" />
                    <span>{currentUser ? "Back to profile" : "Back to sign in"}</span>
                  </button>
                  <span className="text-[10px] font-mono tracking-[0.2em] text-indigo-400/80 uppercase font-semibold">
                    HYDERABAD 2026
                  </span>
                </div>

                {/* Header */}
                <div>
                  <span className="block mb-1 text-[10px] font-mono font-medium tracking-[0.18em] uppercase text-indigo-300/80">Select your role</span>
                  <h1 id="pathway-title" className="font-sans text-2xl sm:text-[26px] font-bold tracking-tight text-white leading-tight">
                    Choose Pathway
                  </h1>
                  <p className="mt-1 text-xs text-white/50 leading-relaxed font-sans max-w-[40ch]">
                    Select your participation track for Resolve MUN 2.0.
                  </p>
                </div>

                <div className="space-y-2 pt-0.5" aria-label="Participation pathways">
                  {/* Delegate */}
                  <div
                    role="button"
                    tabIndex={0}
                    onClick={() => handlePathwaySelect("delegate")}
                    onKeyDown={(event) => { if (event.key === "Enter" || event.key === " ") { event.preventDefault(); handlePathwaySelect("delegate"); } }}
                    className="group relative flex w-full items-center justify-between gap-3 rounded-xl border border-white/15 bg-[#090b14] px-4 py-2.5 sm:py-3 text-left transition-all duration-200 hover:border-white/40 hover:bg-[#0f111e] hover:shadow-[0_4px_20px_rgba(0,0,0,0.4)] cursor-pointer active:scale-[0.99]"
                  >
                    <div className="space-y-0.5 min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <span className="font-sans font-semibold text-sm text-white tracking-tight">
                          Delegate
                        </span>
                        <span className="text-[9px] font-mono uppercase tracking-wider px-2 py-0.5 rounded-md bg-violet-500/10 border border-violet-400/20 text-violet-300 font-medium">
                          Individual
                        </span>
                      </div>
                      <span className="block text-xs text-white/50 leading-normal group-hover:text-white/70 transition-colors line-clamp-1">
                        Single delegate representation in one specialized committee.
                      </span>
                    </div>
                    <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-white/15 bg-white/[0.03] text-white/40 group-hover:text-white group-hover:border-white/40 transition-all" aria-hidden="true">
                      <ChevronRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
                    </span>
                  </div>

                  {/* Delegation */}
                  <div
                    role="button"
                    tabIndex={0}
                    onClick={() => handlePathwaySelect("delegation")}
                    onKeyDown={(event) => { if (event.key === "Enter" || event.key === " ") { event.preventDefault(); handlePathwaySelect("delegation"); } }}
                    className="group relative flex w-full items-center justify-between gap-3 rounded-xl border border-white/15 bg-[#090b14] px-4 py-2.5 sm:py-3 text-left transition-all duration-200 hover:border-white/40 hover:bg-[#0f111e] hover:shadow-[0_4px_20px_rgba(0,0,0,0.4)] cursor-pointer active:scale-[0.99]"
                  >
                    <div className="space-y-0.5 min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <span className="font-sans font-semibold text-sm text-white tracking-tight">
                          Delegation
                        </span>
                        <span className="text-[9px] font-mono uppercase tracking-wider px-2 py-0.5 rounded-md bg-sky-500/10 border border-sky-400/20 text-sky-300 font-medium">
                          Institution
                        </span>
                      </div>
                      <span className="block text-xs text-white/50 leading-normal group-hover:text-white/70 transition-colors line-clamp-1">
                        School or university delegations with 8+ student delegates.
                      </span>
                    </div>
                    <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-white/15 bg-white/[0.03] text-white/40 group-hover:text-white group-hover:border-white/40 transition-all" aria-hidden="true">
                      <ChevronRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
                    </span>
                  </div>

                  {/* Secretariat */}
                  <div
                    role="button"
                    tabIndex={0}
                    onClick={() => handlePathwaySelect("secretariat")}
                    onKeyDown={(event) => { if (event.key === "Enter" || event.key === " ") { event.preventDefault(); handlePathwaySelect("secretariat"); } }}
                    className="group relative flex w-full items-center justify-between gap-3 rounded-xl border border-white/15 bg-[#090b14] px-4 py-2.5 sm:py-3 text-left transition-all duration-200 hover:border-white/40 hover:bg-[#0f111e] hover:shadow-[0_4px_20px_rgba(0,0,0,0.4)] cursor-pointer active:scale-[0.99]"
                  >
                    <div className="space-y-0.5 min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <span className="font-sans font-semibold text-sm text-white tracking-tight">
                          Secretariat
                        </span>
                        <span className="text-[9px] font-mono uppercase tracking-wider px-2 py-0.5 rounded-md bg-indigo-500/10 border border-indigo-400/20 text-indigo-300 font-medium">
                          Executive
                        </span>
                      </div>
                      <span className="block text-xs text-white/50 leading-normal group-hover:text-white/70 transition-colors line-clamp-1">
                        High-command leadership, USG positions, and directors.
                      </span>
                    </div>
                    <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-white/15 bg-white/[0.03] text-white/40 group-hover:text-white group-hover:border-white/40 transition-all" aria-hidden="true">
                      <ChevronRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
                    </span>
                  </div>
                </div>

                {/* Subdued Footer for Closed Tracks */}
                <div className="pt-3.5 border-t border-white/[0.08] flex items-center justify-between text-xs text-white/40 font-sans">
                  <span>Looking for OC or EB?</span>
                  <span className="font-mono uppercase tracking-wider text-[10px] text-white/30">
                    Round 1 Closed
                  </span>
                </div>
              </section>
            )}

            {/* 3. AUTHENTICATED PROFILE VIEW */}
            {mode === "profile" && currentUser && (
              <div className="py-2 text-center space-y-4">
                <div className="flex flex-col items-center">
                  {currentUser.photoURL ? (
                    <img
                      src={currentUser.photoURL}
                      alt={currentUser.displayName || "Delegate"}
                      className="w-16 h-16 rounded-full object-cover border-2 border-white/20 shadow-[0_0_20px_rgba(255,255,255,0.15)] mb-3"
                    />
                  ) : (
                    <div className="w-16 h-16 rounded-full bg-gradient-to-tr from-violet-600 via-indigo-600 to-blue-500 text-white font-bold text-xl flex items-center justify-center border-2 border-white/30 shadow-[0_0_20px_rgba(99,102,241,0.3)] mb-3 font-sans">
                      {(currentUser.displayName || currentUser.email || "D").slice(0, 1).toUpperCase()}
                    </div>
                  )}
                  <h2 className="font-sans text-xl sm:text-2xl font-bold text-white tracking-tight">
                    Welcome, {currentUser.displayName || "Delegate"}
                  </h2>
                  <p className="text-xs text-white/50 font-mono mt-0.5 truncate max-w-[280px]">
                    {currentUser.email}
                  </p>
                </div>

                <div className="p-4 rounded-xl bg-white/[0.03] border border-white/[0.08] text-xs text-white/60 leading-relaxed text-left space-y-1.5 font-sans">
                  <p className="font-semibold text-white/90">Active Delegate Session</p>
                  <p>
                    Your delegate credentials are verified. Proceed to submit your conference application or access your real-time dashboard.
                  </p>
                </div>

                <div className="space-y-2.5 pt-1">
                  {/* Clean Solid White Primary Button */}
                  <button
                    type="button"
                    onClick={() => switchMode("pathway")}
                    className="w-full h-11 flex items-center justify-center rounded-xl bg-white text-black font-semibold text-xs sm:text-sm tracking-tight transition-all hover:bg-white/90 active:scale-[0.99] cursor-pointer shadow-[0_0_20px_rgba(255,255,255,0.15)]"
                  >
                    Proceed to Applications
                  </button>

                  {/* Clean Obsidian Secondary Button */}
                  <Link
                    href="/dashboard"
                    onClick={onClose}
                    className="w-full h-11 flex items-center justify-center rounded-xl border border-white/15 bg-white/[0.04] hover:bg-white/[0.08] text-white text-xs sm:text-sm font-medium tracking-tight transition-colors"
                  >
                    Open Delegate Dashboard
                  </Link>

                  {/* Minimal Sign Out Link */}
                  <button
                    type="button"
                    onClick={handleSignOut}
                    className="w-full text-center py-1.5 text-xs font-medium text-white/40 hover:text-rose-300 transition-colors cursor-pointer"
                  >
                    Sign out of session
                  </button>
                </div>
              </div>
            )}

            {/* 4. SIGNUP / SIGNIN / FORGOT VIEW */}
            {mode !== "code" && mode !== "pathway" && !(mode === "profile" && currentUser) && (
              <div className="space-y-4">
                {/* Header */}
                <div>
                  <h1 className="font-sans text-2xl sm:text-[26px] font-bold tracking-tight text-white">
                    {mode === "signup" && "Create an account"}
                    {mode === "signin" && "Sign in to account"}
                    {mode === "forgot" && "Recover password"}
                  </h1>
                  
                  {/* Sleek inline mode switcher */}
                  <div className="flex items-center gap-1.5 mt-1 text-xs text-white/50 font-normal font-sans">
                    <span>
                      {mode === "signup" && "Already have an account?"}
                      {mode === "signin" && "New to Resolve MUN?"}
                      {mode === "forgot" && "Remember your password?"}
                    </span>
                    <button
                      type="button"
                      onClick={() => switchMode(mode === "signup" ? "signin" : mode === "signin" ? "signup" : "signin")}
                      className="font-semibold text-violet-400 hover:text-violet-300 transition-colors cursor-pointer underline-offset-2 hover:underline"
                    >
                      {mode === "signup" && "Sign in"}
                      {mode === "signin" && "Create account"}
                      {mode === "forgot" && "Back to sign in"}
                    </button>
                  </div>
                </div>

                {/* Google Button with requirement enforcement */}
                <div>
                  <button
                    type="button"
                    onClick={handleSocialAuth}
                    disabled={socialLoading || loading}
                    className="w-full h-11 flex items-center justify-center gap-2.5 rounded-xl border border-white/20 bg-[#0d0f1a] hover:bg-[#131626] hover:border-white/35 active:scale-[0.99] text-xs sm:text-sm font-semibold text-white transition-all cursor-pointer shadow-sm disabled:opacity-60"
                  >
                    <GoogleIcon />
                    <span>{socialLoading ? "Connecting to Google..." : "Continue with Google"}</span>
                  </button>
                  {mode === "signup" && (!agreeTerms || !agreePrivacy) && (
                    <p className="text-[10px] text-white/40 text-center mt-1.5 font-sans">
                      * Check both agreements below to enable registration
                    </p>
                  )}
                </div>

                {/* Divider */}
                <div className="flex items-center justify-center gap-3">
                  <div className="flex-1 h-px bg-white/10" />
                  <span className="text-[10px] font-mono uppercase tracking-widest text-white/40">
                    or continue with email
                  </span>
                  <div className="flex-1 h-px bg-white/10" />
                </div>

                {/* Alerts */}
                {error && (
                  <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/25 text-red-300 text-xs flex items-start gap-2 animate-in fade-in duration-150">
                    <AlertCircle className="w-4 h-4 shrink-0 text-red-400 mt-0.5" />
                    <span className="leading-snug">{error}</span>
                  </div>
                )}
                {success && (
                  <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/25 text-emerald-300 text-xs flex items-start gap-2 animate-in fade-in duration-150">
                    <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400 mt-0.5" />
                    <span className="leading-snug">{success}</span>
                  </div>
                )}

                {/* Form Inputs */}
                <form onSubmit={handleEmailAuth} className="space-y-3">
                  {mode === "signup" && (
                    <div className="grid gap-3 grid-cols-2">
                      <FieldBox
                        label="First Name"
                        value={firstName}
                        onChange={(e) => setFirstName(e.target.value)}
                        placeholder="John"
                      />
                      <FieldBox
                        label="Last Name"
                        value={lastName}
                        onChange={(e) => setLastName(e.target.value)}
                        placeholder="Doe"
                      />
                    </div>
                  )}

                  <FieldBox
                    label="Email Address"
                    value={email}
                    type="email"
                    required
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="delegate@example.com"
                  />

                  {mode !== "forgot" && (
                    <FieldBox
                      label="Password"
                      value={password}
                      type="password"
                      required
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••••••"
                    />
                  )}

                  {mode === "signin" && (
                    <div className="flex justify-end pt-0.5">
                      <button
                        type="button"
                        onClick={() => switchMode("forgot")}
                        className="text-[11px] text-white/45 hover:text-white transition-colors cursor-pointer"
                      >
                        Forgot password?
                      </button>
                    </div>
                  )}

                  {/* Dual Mandatory Checkboxes for Registration */}
                  {mode === "signup" && (
                    <div className={cn(
                      "space-y-2 pt-1 p-2.5 rounded-xl transition-colors",
                      error && (!agreeTerms || !agreePrivacy) ? "bg-red-500/[0.06] border border-red-500/20" : ""
                    )}>
                      {/* 1. Terms and Conditions */}
                      <CheckboxLine
                        checked={agreeTerms}
                        onChange={(e) => {
                          setAgreeTerms(e.target.checked);
                          if (error) setError("");
                        }}
                      >
                        I agree to the{" "}
                        <button
                          type="button"
                          onClick={(e) => {
                            e.preventDefault();
                            if (typeof window !== "undefined" && window.openTermsModal) {
                              window.openTermsModal();
                            }
                          }}
                          className="font-medium text-white/90 underline underline-offset-2 hover:text-white cursor-pointer bg-transparent border-none p-0 inline"
                        >
                          Terms &amp; Conditions
                        </button>
                      </CheckboxLine>

                      {/* 2. Privacy Policy */}
                      <CheckboxLine
                        checked={agreePrivacy}
                        onChange={(e) => {
                          setAgreePrivacy(e.target.checked);
                          if (error) setError("");
                        }}
                      >
                        I agree to the{" "}
                        <button
                          type="button"
                          onClick={(e) => {
                            e.preventDefault();
                            if (typeof window !== "undefined" && window.openTermsModal) {
                              window.openTermsModal();
                            }
                          }}
                          className="font-medium text-white/90 underline underline-offset-2 hover:text-white cursor-pointer bg-transparent border-none p-0 inline"
                        >
                          Privacy Policy
                        </button>
                      </CheckboxLine>

                      {/* 3. Optional Updates */}
                      <CheckboxLine
                        checked={receiveUpdates}
                        onChange={(e) => setReceiveUpdates(e.target.checked)}
                      >
                        Receive matrix releases &amp; dossier notifications
                      </CheckboxLine>
                    </div>
                  )}

                  {/* Submit Button */}
                  <button
                    type="submit"
                    disabled={loading || socialLoading}
                    className="mt-3 flex h-11 w-full items-center justify-center rounded-xl bg-white text-xs sm:text-sm font-bold text-black transition-all hover:bg-white/90 active:scale-[0.99] cursor-pointer shadow-[0_0_24px_rgba(255,255,255,0.22)] disabled:opacity-60"
                  >
                    {loading ? (
                      <Loader2 className="w-4 h-4 animate-spin text-black" />
                    ) : (
                      <span>
                        {mode === "signup" && "Submit & Register"}
                        {mode === "signin" && "Sign In"}
                        {mode === "forgot" && "Send Reset Link"}
                      </span>
                    )}
                  </button>
                </form>
              </div>
            )}
          </div>
        </div>

        {/* ── RIGHT COLUMN: SHADER & BRAND VISUAL ── */}
        <div className="relative hidden md:flex min-h-[450px] overflow-hidden rounded-xl bg-black p-6 xl:p-7 text-white flex-col justify-between m-2 border border-white/10 select-none">
          {/* GrainGradient Background */}
          {shaderMounted ? (
            <GrainGradient
              speed={0.9}
              scale={1}
              rotation={0}
              offsetX={0}
              offsetY={0}
              softness={0.5}
              intensity={0.5}
              noise={0.25}
              shape="corners"
              frame={2854.5}
              colors={["#FFFFFF", "#8B5CF6", "#3B82F6", "#FFFFFF"]}
              colorBack="#00000000"
              className="absolute inset-0 bg-black pointer-events-none"
            />
          ) : (
            <div className="absolute inset-0 bg-gradient-to-br from-[#100726] via-[#090b1c] to-[#04050a]" />
          )}

          {/* Top Info */}
          <div className="relative z-10 flex items-center justify-start">
            <span className="text-[10px] sm:text-[11px] font-mono tracking-[0.22em] text-white/60 font-semibold uppercase">
              EDITION 2026
            </span>
          </div>

          {/* Headline & Copy */}
          <div className="relative z-10 py-5 my-auto">
            <h2 className="max-w-[300px] text-2xl sm:text-[30px] font-bold tracking-[-0.04em] text-white leading-[1.05] font-sans">
              Resolve.
              <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-violet-200 via-indigo-200 to-blue-200">
                Reform.
              </span>
              <br />
              Reconcile.
            </h2>
            <p className="mt-3 max-w-[270px] text-xs text-white/65 leading-relaxed font-sans">
              Hyderabad's premier conference. Multilateral debate, crisis diplomacy, and strategic consensus across 6 dynamic committees.
            </p>
          </div>

          {/* Bottom Accent Line */}
          <div className="relative z-10 h-0.5 w-8 bg-gradient-to-r from-violet-400 to-blue-400 rounded-full opacity-60" />
        </div>
      </div>
    </div>
  );
}

function FieldBox({
  label,
  value,
  onChange,
  type = "text",
  required = false,
  placeholder,
  className,
}) {
  const [showPassword, setShowPassword] = useState(false);
  const isPassword = type === "password";
  const effectiveType = isPassword && showPassword ? "text" : type;

  return (
    <div className={cn("flex flex-col gap-1.5 text-left", className)}>
      <label className="text-[11px] sm:text-xs font-medium text-white/75 font-sans tracking-wide">
        {label}
        {required && <span className="text-violet-400 ml-0.5">*</span>}
      </label>
      <div className="relative">
        <input
          type={effectiveType}
          value={value}
          onChange={onChange}
          required={required}
          placeholder={placeholder}
          className="h-10.5 sm:h-11 w-full rounded-xl border border-white/20 bg-[#0d0f1a] px-3.5 text-xs sm:text-sm text-white placeholder-white/30 transition-all hover:border-white/35 focus:border-indigo-400 focus:bg-[#121526] focus:outline-none focus:ring-1 focus:ring-indigo-500/30 font-sans shadow-[inset_0_1px_2px_rgba(0,0,0,0.4)]"
        />
        {isPassword && (
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-white/40 hover:text-white transition-colors cursor-pointer"
            tabIndex={-1}
            aria-label={showPassword ? "Hide password" : "Show password"}
          >
            {showPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
          </button>
        )}
      </div>
    </div>
  );
}

function CheckboxLine({ checked, onChange, children }) {
  return (
    <label className="flex items-start gap-2 cursor-pointer select-none group text-left">
      <div className="relative flex items-center justify-center mt-0.5">
        <input
          type="checkbox"
          checked={checked}
          onChange={onChange}
          className="peer sr-only"
        />
        <div className="w-3.5 h-3.5 rounded border border-white/30 bg-white/5 transition-all peer-checked:bg-white peer-checked:border-white peer-focus-visible:ring-2 peer-focus-visible:ring-violet-400 group-hover:border-white/50" />
        <svg
          className="absolute w-2.5 h-2.5 text-black opacity-0 peer-checked:opacity-100 transition-opacity pointer-events-none"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="3.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <polyline points="20 6 9 17 4 12" />
        </svg>
      </div>
      <span className="text-[11px] text-white/55 leading-tight group-hover:text-white/75 transition-colors font-sans">
        {children}
      </span>
    </label>
  );
}

function GoogleIcon() {
  return (
    <svg className="w-3.5 h-3.5" viewBox="0 0 24 24">
      <path
        fill="#EA4335"
        d="M12 5c1.56 0 2.96.54 4.07 1.43l3.05-3.05C17.27 1.7 14.81 1 12 1 7.58 1 3.77 3.52 1.95 7.19l3.66 2.84C6.49 7.37 8.98 5 12 5z"
      />
      <path
        fill="#4285F4"
        d="M23.49 12.27c0-.79-.07-1.54-.19-2.27H12v4.51h6.47c-.29 1.48-1.14 2.73-2.4 3.58l3.71 2.88c2.16-2 3.71-4.95 3.71-8.7z"
      />
      <path
        fill="#FBBC05"
        d="M5.61 14.71a7.48 7.48 0 0 1 0-5.42L1.95 6.45A11.96 11.96 0 0 0 0 12c0 1.92.45 3.74 1.25 5.35l3.7-2.88.66-.76z"
      />
      <path
        fill="#34A853"
        d="M12 23c3.24 0 5.95-1.08 7.93-2.91l-3.71-2.88c-1.07.73-2.44 1.16-4.22 1.16-3.02 0-5.51-2.37-6.39-5.03L1.95 16.18C3.77 19.85 7.58 22.37 12 23z"
      />
    </svg>
  );
}
