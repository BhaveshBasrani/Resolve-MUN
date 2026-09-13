"use client";

import React, { useState, useEffect } from "react";
import {
  auth, googleProvider, signInWithPopup, signInWithEmailAndPassword,
  createUserWithEmailAndPassword, sendPasswordResetEmail, signOut, onAuthStateChanged,
} from "@/lib/firebase";
import { X, Eye, EyeOff, Loader2, CheckCircle2, AlertCircle, ArrowLeft, Sparkles, Globe, Award, QrCode, ChevronRight, ArrowRight } from "lucide-react";

/* Floating ambient orbs */
function Orbs() {
  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden" aria-hidden="true">
      <div className="absolute top-[-20%] left-[-15%] w-[60%] h-[60%] rounded-full bg-violet-700/15 blur-[100px] animate-pulse" style={{ animationDuration: "9s" }} />
      <div className="absolute bottom-[-15%] right-[-10%] w-[50%] h-[50%] rounded-full bg-indigo-600/12 blur-[90px] animate-pulse" style={{ animationDuration: "13s", animationDelay: "4s" }} />
    </div>
  );
}

/* Google icon */
function GoogleIcon({ className }) {
  return (
    <svg className={className} viewBox="0 0 24 24" aria-hidden="true">
      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
      <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
    </svg>
  );
}

export function AuthModal({ isOpen, onClose }) {
  const [mode, setMode] = useState("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [socialLoading, setSocialLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [currentUser, setCurrentUser] = useState(null);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (u) => setCurrentUser(u));
    return () => unsub();
  }, []);

  useEffect(() => {
    const handle = (e) => { if (e.key === "Escape" && isOpen) onClose(); };
    window.addEventListener("keydown", handle);
    return () => window.removeEventListener("keydown", handle);
  }, [isOpen, onClose]);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
      setError(""); setSuccess("");
    }
    return () => { document.body.style.overflow = ""; };
  }, [isOpen]);

  if (!isOpen) return null;

  const handleEmailAuth = async (e) => {
    e.preventDefault(); setError(""); setSuccess(""); setLoading(true);
    try {
      if (mode === "forgot") {
        if (!email) throw new Error("Please enter your email address.");
        await sendPasswordResetEmail(auth, email);
        setSuccess("Password reset link sent! Check your inbox.");
        setLoading(false); return;
      }
      if (mode === "signup") {
        if (!email || !password) throw new Error("Please fill in all fields.");
        if (password.length < 6) throw new Error("Password must be at least 6 characters.");
        if (password !== confirmPassword) throw new Error("Passwords do not match.");
        const cred = await createUserWithEmailAndPassword(auth, email, password);
        if (typeof window !== "undefined" && cred.user) {
          localStorage.setItem("resolve_user_email", cred.user.email || "");
          if (window.autofillAllKnownFields) window.autofillAllKnownFields(cred.user);
        }
        setSuccess("Account created! Welcome to Resolve MUN 2.0.");
      } else {
        if (!email || !password) throw new Error("Please enter email and password.");
        const cred = await signInWithEmailAndPassword(auth, email, password);
        if (typeof window !== "undefined" && cred.user) {
          localStorage.setItem("resolve_user_email", cred.user.email || "");
          if (window.autofillAllKnownFields) window.autofillAllKnownFields(cred.user);
        }
        setSuccess("Signed in successfully!");
      }
    } catch (err) {
      let msg = err.message || "Authentication failed.";
      if (err.code === "auth/invalid-credential" || err.code === "auth/wrong-password") msg = "Invalid email or password.";
      else if (err.code === "auth/user-not-found") msg = "No account found with this email.";
      else if (err.code === "auth/email-already-in-use") msg = "An account already exists with this email.";
      else if (err.code === "auth/weak-password") msg = "Password should be at least 6 characters.";
      else if (err.code === "auth/invalid-email") msg = "Please enter a valid email address.";
      else if (err.code === "auth/popup-closed-by-user") msg = "Sign in popup closed before finishing.";
      setError(msg);
    } finally { setLoading(false); }
  };

  const handleSocialAuth = async () => {
    setError(""); setSuccess(""); setSocialLoading(true);
    try {
      const cred = await signInWithPopup(auth, googleProvider);
      const u = cred.user;
      if (typeof window !== "undefined" && u) {
        localStorage.setItem("resolve_user_name", u.displayName || "");
        localStorage.setItem("resolve_user_email", u.email || "");
        localStorage.setItem("resolve_user_photo", u.photoURL || "");
        if (window.autofillAllKnownFields) window.autofillAllKnownFields(u);
      }
      setSuccess("Signed in with Google!");
    } catch (err) {
      setError(err.code === "auth/popup-closed-by-user" ? "Sign-in cancelled." : (err.message || "Google sign-in failed."));
    } finally { setSocialLoading(false); }
  };

  const handleProceedToRegistration = () => {
    if (typeof window !== "undefined") {
      localStorage.setItem("resolve_selection_opened", "true");
    }
    onClose();
    if (typeof window.openSelectionModal === "function") {
      window.openSelectionModal();
    } else {
      const modal = document.getElementById("selectionModal");
      if (modal) { modal.classList.add("active"); document.body.style.overflow = "hidden"; }
    }
  };

  const handleSignOut = async () => {
    try { await signOut(auth); setSuccess("Signed out."); } catch (err) { setError(err.message); }
  };

  const switchMode = (m) => { setMode(m); setError(""); setSuccess(""); };

  return (
    <div
      className="fixed inset-0 z-[99999] flex bg-[#050507] overflow-hidden"
      role="dialog"
      aria-modal="true"
    >
      {/* ── LEFT PANEL: Immersive Visual ── */}
      <div className="hidden md:flex relative w-[45%] shrink-0 flex-col justify-between overflow-hidden bg-[#06040f]">
        {/* Full cover image */}
        <img
          src="/images/image.png"
          alt="Resolve MUN"
          className="absolute inset-0 w-full h-full object-cover object-center opacity-60"
        />
        {/* Gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-tr from-[#06040f] via-[#06040f]/50 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-t from-[#06040f] via-transparent to-transparent" />

        {/* Top logo */}
        <div className="relative z-10 p-8">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-violet-600 to-indigo-600 flex items-center justify-center shadow-[0_0_16px_rgba(124,58,237,0.6)]">
              <span className="text-white font-black font-mono text-base">R</span>
            </div>
            <div>
              <p className="text-[9px] font-mono uppercase tracking-[0.35em] text-violet-300/70">Official Portal</p>
              <p className="text-sm font-extrabold tracking-widest text-white uppercase">RESOLVE MUN 2.0</p>
            </div>
          </div>
        </div>

        {/* Bottom copy */}
        <div className="relative z-10 p-8 space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-violet-500/20 border border-violet-400/30">
            <span className="w-1.5 h-1.5 rounded-full bg-violet-400 animate-pulse inline-block" />
            <span className="text-[10px] font-mono uppercase tracking-widest text-violet-300 font-bold">Applications Open</span>
          </div>
          <h2 className="text-4xl font-bold text-white leading-tight" style={{ fontFamily: "Crimson Pro, serif" }}>
            Where Diplomacy<br />Meets Ambition
          </h2>
          <p className="text-sm text-white/55 leading-relaxed max-w-xs">
            Hyderabad's premier Model United Nations conference returns. Join 300+ delegates for three days of rigorous diplomacy.
          </p>
          <div className="grid grid-cols-3 gap-2 pt-2">
            {[{ v: "300+", l: "Delegates" }, { v: "3", l: "Days" }, { v: "2.0", l: "Edition" }].map(({ v, l }) => (
              <div key={l} className="p-3 rounded-2xl bg-white/[0.06] border border-white/[0.08] text-center">
                <p className="text-base font-black text-white">{v}</p>
                <p className="text-[9px] font-mono uppercase tracking-widest text-white/40 mt-0.5">{l}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── RIGHT PANEL: Auth Form ── */}
      <div className="relative flex-1 flex flex-col bg-[#060818] overflow-y-auto">
        <Orbs />

        {/* Top bar */}
        <div className="relative z-10 flex items-center justify-between px-6 py-5 border-b border-white/[0.06]">
          <button
            type="button"
            onClick={onClose}
            className="flex items-center gap-2 text-xs font-semibold text-white/50 hover:text-white px-4 py-2 rounded-full bg-white/[0.06] hover:bg-white/10 border border-white/10 transition-all cursor-pointer"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back</span>
          </button>

          {/* Mobile logo */}
          <div className="md:hidden flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-violet-600 to-indigo-600 flex items-center justify-center">
              <span className="text-white font-black font-mono text-xs">R</span>
            </div>
            <span className="text-xs font-black tracking-widest uppercase text-white">RESOLVE <span className="text-violet-400">2.0</span></span>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="w-9 h-9 rounded-full bg-white/[0.06] hover:bg-white/15 border border-white/10 text-white/50 hover:text-white flex items-center justify-center transition-all cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Auth content */}
        <div className="relative z-10 flex-1 flex flex-col items-center justify-center px-6 py-10">
          <div className="w-full max-w-[400px]">

            {/* ── LOGGED IN STATE ── */}
            {currentUser ? (
              <div className="flex flex-col items-center text-center py-4 space-y-6">
                {/* Avatar */}
                <div className="relative">
                  {currentUser.photoURL ? (
                    <img src={currentUser.photoURL} alt={currentUser.displayName} className="w-20 h-20 rounded-2xl object-cover border-2 border-violet-400/30 shadow-[0_0_32px_rgba(124,58,237,0.3)]" />
                  ) : (
                    <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-violet-600 to-indigo-700 flex items-center justify-center text-white font-black text-2xl border border-violet-400/30 shadow-[0_0_32px_rgba(124,58,237,0.3)]">
                      {(currentUser.displayName || currentUser.email || "D").slice(0, 1).toUpperCase()}
                    </div>
                  )}
                  <div className="absolute -bottom-2 -right-2 w-7 h-7 rounded-full bg-emerald-500 border-2 border-[#060818] flex items-center justify-center shadow-[0_0_16px_rgba(52,211,153,0.5)]">
                    <CheckCircle2 className="w-3.5 h-3.5 text-white" />
                  </div>
                </div>

                <div>
                  <p className="text-[10px] font-mono uppercase tracking-[0.3em] text-violet-400 mb-2">Authentication Successful</p>
                  <h2 className="text-3xl font-bold text-white mb-1.5" style={{ fontFamily: "Crimson Pro, serif" }}>
                    Welcome, {currentUser.displayName?.split(" ")[0] || "Delegate"}!
                  </h2>
                  <p className="text-sm text-white/45">{currentUser.email}</p>
                </div>

                {/* Benefits preview */}
                <div className="w-full grid grid-cols-3 gap-2 text-center">
                  {[{ icon: Globe, label: "Country\nAllocation" }, { icon: QrCode, label: "Digital\nPass" }, { icon: Award, label: "Conference\nCertificate" }].map(({ icon: Icon, label }) => (
                    <div key={label} className="p-3 rounded-2xl bg-white/[0.04] border border-white/[0.07]">
                      <Icon className="w-4 h-4 mx-auto mb-1.5 text-violet-400" />
                      <p className="text-[9px] font-mono text-white/40 whitespace-pre-line">{label}</p>
                    </div>
                  ))}
                </div>

                <div className="w-full space-y-3">
                  <button
                    type="button"
                    onClick={handleProceedToRegistration}
                    className="w-full h-13 rounded-full bg-gradient-to-r from-violet-600 via-indigo-600 to-purple-600 hover:from-violet-500 hover:to-purple-500 text-white font-bold text-sm tracking-wider uppercase transition-all shadow-[0_8px_32px_rgba(124,58,237,0.4)] hover:shadow-[0_12px_48px_rgba(124,58,237,0.6)] active:scale-[0.97] cursor-pointer flex items-center justify-center gap-2.5"
                    style={{ height: "52px" }}
                  >
                    <Sparkles className="w-4 h-4" />
                    <span>Proceed</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                  <button
                    type="button"
                    onClick={handleSignOut}
                    className="w-full h-11 rounded-full bg-white/[0.05] hover:bg-white/[0.1] border border-white/15 text-white/60 hover:text-white text-xs font-semibold tracking-wider transition-all cursor-pointer"
                  >
                    Sign Out
                  </button>
                </div>
              </div>
            ) : (
              /* ── SIGN IN / UP / FORGOT FORM ── */
              <div>
                {/* Header */}
                <div className="mb-7">
                  <p className="text-[10px] font-mono uppercase tracking-[0.35em] text-violet-400 mb-2">
                    {mode === "signin" ? "Delegate Portal" : mode === "signup" ? "Create Account" : "Password Recovery"}
                  </p>
                  <h1 className="text-3xl sm:text-4xl font-bold text-white tracking-tight" style={{ fontFamily: "Crimson Pro, serif" }}>
                    {mode === "signin" && "Welcome Back"}
                    {mode === "signup" && "Join Resolve MUN"}
                    {mode === "forgot" && "Reset Password"}
                  </h1>
                  <p className="text-sm text-white/45 mt-2">
                    {mode === "signin" && (<>No account?{" "}<button type="button" onClick={() => switchMode("signup")} className="text-violet-400 hover:text-violet-300 font-semibold underline underline-offset-4 cursor-pointer transition-colors">Sign up</button></>)}
                    {mode === "signup" && (<>Have an account?{" "}<button type="button" onClick={() => switchMode("signin")} className="text-violet-400 hover:text-violet-300 font-semibold underline underline-offset-4 cursor-pointer transition-colors">Sign in</button></>)}
                    {mode === "forgot" && (<>Remembered?{" "}<button type="button" onClick={() => switchMode("signin")} className="text-violet-400 hover:text-violet-300 font-semibold underline underline-offset-4 cursor-pointer transition-colors">Back to sign in</button></>)}
                  </p>
                </div>

                {/* Alerts */}
                {error && (
                  <div className="mb-5 p-4 rounded-2xl bg-red-500/10 border border-red-500/25 text-red-300 text-sm flex items-start gap-3 animate-in fade-in slide-in-from-top-2 duration-200">
                    <AlertCircle className="w-4 h-4 shrink-0 text-red-400 mt-0.5" />
                    <span>{error}</span>
                  </div>
                )}
                {success && (
                  <div className="mb-5 p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/25 text-emerald-300 text-sm flex items-start gap-3 animate-in fade-in slide-in-from-top-2 duration-200">
                    <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400 mt-0.5" />
                    <span>{success}</span>
                  </div>
                )}

                {/* Form */}
                <form onSubmit={handleEmailAuth} className="space-y-4">
                  {/* Email */}
                  <div>
                    <label className="block text-[10px] font-mono uppercase tracking-[0.2em] text-white/45 mb-2">Email Address</label>
                    <input
                      type="email" required value={email} onChange={(e) => setEmail(e.target.value)}
                      placeholder="name@example.com"
                      className="w-full h-12 px-4 rounded-2xl bg-white/[0.06] border border-white/10 text-white placeholder-white/25 text-sm focus:outline-none focus:border-violet-400 focus:bg-white/[0.08] transition-all"
                    />
                  </div>

                  {/* Password */}
                  {mode !== "forgot" && (
                    <div>
                      <label className="block text-[10px] font-mono uppercase tracking-[0.2em] text-white/45 mb-2">Password</label>
                      <div className="relative">
                        <input
                          type={showPassword ? "text" : "password"} required value={password} onChange={(e) => setPassword(e.target.value)}
                          placeholder="••••••••"
                          className="w-full h-12 px-4 pr-12 rounded-2xl bg-white/[0.06] border border-white/10 text-white placeholder-white/25 text-sm focus:outline-none focus:border-violet-400 focus:bg-white/[0.08] transition-all"
                        />
                        <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-4 top-1/2 -translate-y-1/2 text-white/35 hover:text-white transition-colors cursor-pointer">
                          {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Confirm Password */}
                  {mode === "signup" && (
                    <div>
                      <label className="block text-[10px] font-mono uppercase tracking-[0.2em] text-white/45 mb-2">Confirm Password</label>
                      <input
                        type={showPassword ? "text" : "password"} required value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)}
                        placeholder="••••••••"
                        className="w-full h-12 px-4 rounded-2xl bg-white/[0.06] border border-white/10 text-white placeholder-white/25 text-sm focus:outline-none focus:border-violet-400 focus:bg-white/[0.08] transition-all"
                      />
                    </div>
                  )}

                  {/* Forgot link */}
                  {mode === "signin" && (
                    <div className="text-right -mt-1">
                      <button type="button" onClick={() => switchMode("forgot")} className="text-xs text-white/40 hover:text-violet-300 transition-colors cursor-pointer">Forgot password?</button>
                    </div>
                  )}

                  {/* Submit */}
                  <button
                    type="submit"
                    disabled={loading || socialLoading}
                    className="w-full h-12 rounded-2xl bg-white text-[#060818] hover:bg-violet-50 font-black text-sm tracking-wider uppercase flex items-center justify-center gap-2 transition-all shadow-[0_4px_24px_rgba(255,255,255,0.2)] active:scale-[0.98] disabled:opacity-60 cursor-pointer mt-1"
                  >
                    {loading ? <Loader2 className="w-4 h-4 animate-spin text-[#060818]" /> : (
                      <>
                        {mode === "signin" && "Sign In"}
                        {mode === "signup" && "Create Account"}
                        {mode === "forgot" && "Send Reset Link"}
                      </>
                    )}
                  </button>
                </form>

                {/* Divider */}
                <div className="relative my-6 flex items-center gap-4">
                  <div className="flex-1 h-px bg-white/[0.08]" />
                  <span className="text-[10px] font-mono uppercase tracking-widest text-white/30">or</span>
                  <div className="flex-1 h-px bg-white/[0.08]" />
                </div>

                {/* Google */}
                <button
                  type="button"
                  onClick={handleSocialAuth}
                  disabled={loading || socialLoading}
                  className="w-full h-12 px-4 rounded-2xl bg-white/[0.06] hover:bg-white/[0.1] border border-white/10 hover:border-white/20 text-white text-sm font-semibold flex items-center justify-center gap-3 transition-all disabled:opacity-60 cursor-pointer"
                >
                  {socialLoading ? <Loader2 className="w-4 h-4 animate-spin text-violet-400" /> : <GoogleIcon className="w-5 h-5 shrink-0" />}
                  <span>Continue with Google</span>
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="relative z-10 px-6 py-4 border-t border-white/[0.05] text-center">
          <p className="text-[10px] font-mono text-white/20 tracking-widest uppercase">RESOLVE MUN 2.0 · Secure Authentication</p>
        </div>
      </div>
    </div>
  );
}

export default AuthModal;
