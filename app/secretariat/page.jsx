"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import {
  auth,
  onAuthStateChanged,
  signInWithGoogle,
  signOutUser,
  syncUserToBackend,
} from "@/lib/firebase";
import Footer from "@/components/Footer";
import {
  Copy,
  Check,
  Share2,
  RefreshCw,
  Trash2,
  ArrowRight,
  Plus,
  Pencil,
  LogOut,
  ShieldCheck,
} from "lucide-react";

const SPLIT_PRESETS = [
  { discount: 0, cash: 400, tag: "Max Cash" },
  { discount: 100, cash: 300, tag: "Balanced" },
  { discount: 150, cash: 250, tag: "Popular" },
  { discount: 200, cash: 200, tag: "50 / 50" },
  { discount: 250, cash: 150, tag: "High Discount" },
];

const SECRETARIAT_ROLES = [
  "Founder",
  "Co-Founder",
  "Secretary General",
  "Deputy Secretary General",
  "Director General",
  "Charge d'Affairs",
  "Conference Lead",
  "Chief Advisor",
  "USG Policy",
  "Chief Of Operations",
  "USG Logistics",
  "USG Design",
  "USG Delegate Affairs",
  "USG Content Creation",
  "USG Marketing",
  "USG Outreach",
  "USG Editing",
  "OC Head",
];

export default function SecretariatDashboardPage() {
  const [user, setUser] = useState(null);
  const [authReady, setAuthReady] = useState(false);
  const [googleBusy, setGoogleBusy] = useState(false);
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState(null);
  const [editingProfile, setEditingProfile] = useState(false);

  const [codeInput, setCodeInput] = useState("");
  const [discountAmount, setDiscountAmount] = useState(100);
  const [saving, setSaving] = useState(false);
  const [feedback, setFeedback] = useState({ type: "", text: "" });
  const [copiedKey, setCopiedKey] = useState("");

  const [onboardingForm, setOnboardingForm] = useState({
    fullName: "",
    allottedRole: "USG Delegate Affairs",
    phone: "",
    school: "",
    grade: "",
    upiId: "",
    instagram: "",
  });
  const [onboardingSaving, setOnboardingSaving] = useState(false);

  const baseFee = data?.baseFee || 2500;
  const pool = data?.cashPoolPerReferral || 400;
  const cashEarnedPerRef = Math.max(0, pool - discountAmount);
  const delegatePays = Math.max(0, baseFee - discountAmount);

  const fetchStats = async (email) => {
    if (!email) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/referrals/?email=${encodeURIComponent(email)}`);
      const json = await res.json();
      setData(json);
      if (json?.rosterMember) {
        setOnboardingForm((prev) => ({
          fullName: json.rosterMember.fullName || prev.fullName || user?.displayName || "",
          allottedRole: json.rosterMember.allottedRole || json.memberRole || prev.allottedRole || "USG Delegate Affairs",
          phone: json.rosterMember.phone || prev.phone || "",
          school: json.rosterMember.school || prev.school || "",
          grade: json.rosterMember.grade || prev.grade || "",
          upiId: json.rosterMember.upiId || prev.upiId || "",
          instagram: json.rosterMember.instagram || prev.instagram || "",
        }));
      } else if (json?.memberRole) {
        setOnboardingForm((prev) => ({
          ...prev,
          fullName: json.memberName || prev.fullName || user?.displayName || "",
          allottedRole: json.memberRole || prev.allottedRole || "USG Delegate Affairs",
        }));
      }
      if (json?.myCodes?.length > 0 && !codeInput) {
        setCodeInput(json.myCodes[0].code);
        setDiscountAmount(Number(json.myCodes[0].discountAmount ?? 100));
      }
    } catch (_) {
      setFeedback({ type: "error", text: "Failed to load Secretariat portal." });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (u) => {
      setUser(u || null);
      setAuthReady(true);
      if (u?.email) {
        syncUserToBackend(u);
        setOnboardingForm((prev) => ({
          ...prev,
          fullName: prev.fullName || u.displayName || "",
        }));
        fetchStats(u.email);
      } else {
        setLoading(false);
      }
    });
    return () => unsub();
  }, []);

  const handleGoogleLogin = async () => {
    setGoogleBusy(true);
    setFeedback({ type: "", text: "" });
    try {
      await signInWithGoogle();
    } catch (err) {
      setFeedback({ type: "error", text: err?.message || "Google sign-in failed." });
    } finally {
      setGoogleBusy(false);
    }
  };

  const handleCompleteOnboarding = async (e) => {
    e.preventDefault();
    if (!user?.email) return;
    setOnboardingSaving(true);
    setFeedback({ type: "", text: "" });
    try {
      const res = await fetch("/api/referrals/", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "COMPLETE_SECRETARIAT_ONBOARDING",
          email: user.email,
          ...onboardingForm,
        }),
      });
      const json = await res.json();
      if (!res.ok || !json.success) {
        setFeedback({ type: "error", text: json.message || "Could not save Secretariat profile." });
      } else {
        setFeedback({ type: "success", text: json.message });
        setEditingProfile(false);
        await fetchStats(user.email);
      }
    } catch (_) {
      setFeedback({ type: "error", text: "Network error while saving profile." });
    } finally {
      setOnboardingSaving(false);
    }
  };

  const handleSaveCode = async (e) => {
    e.preventDefault();
    if (!user?.email) return;
    const clean = codeInput.trim().toUpperCase().replace(/[^A-Z0-9_-]/g, "");
    if (clean.length < 3) {
      setFeedback({ type: "error", text: "Enter at least 3 characters (e.g. SEC-NAME or NAME100)." });
      return;
    }
    setSaving(true);
    setFeedback({ type: "", text: "" });
    try {
      const res = await fetch("/api/referrals/", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "UPSERT_SECRETARIAT_CODE",
          email: user.email,
          ownerName: onboardingForm.fullName || data?.memberName || user.displayName || user.email.split("@")[0],
          code: clean,
          discountAmount,
        }),
      });
      const json = await res.json();
      if (!res.ok || !json.success) {
        setFeedback({ type: "error", text: json.message || "Could not save code." });
      } else {
        setCodeInput(clean);
        setFeedback({ type: "success", text: json.message });
        await fetchStats(user.email);
      }
    } catch (_) {
      setFeedback({ type: "error", text: "Network error while saving code." });
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteCode = async (code) => {
    if (!user?.email) return;
    if (!confirm(`Deactivate and delete referral code "${code}"?`)) return;
    try {
      await fetch("/api/referrals/", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "DELETE_SECRETARIAT_CODE",
          email: user.email,
          code,
        }),
      });
      await fetchStats(user.email);
    } catch (_) {}
  };

  const copyText = async (val, key) => {
    try {
      if (navigator.clipboard && window.isSecureContext) {
        await navigator.clipboard.writeText(val);
      } else {
        const ta = document.createElement("textarea");
        ta.value = val;
        ta.style.position = "fixed";
        ta.style.opacity = "0";
        document.body.appendChild(ta);
        ta.focus();
        ta.select();
        document.execCommand("copy");
        document.body.removeChild(ta);
      }
      setCopiedKey(key);
      setTimeout(() => setCopiedKey(""), 1800);
    } catch (_) {
      window.prompt("Copy this value:", val);
    }
  };

  const origin = typeof window !== "undefined" ? window.location.origin : "https://resolvemun.in";

  const topBar = (
    <header className="sticky top-0 z-40 h-14 border-b border-[#1f1f1f] bg-black/95 backdrop-blur-sm">
      <div className="max-w-4xl h-full mx-auto px-4 sm:px-6 flex items-center justify-between gap-3">
        <div className="flex items-center gap-2.5 min-w-0">
          <Link href="/" className="flex items-center gap-2 !no-underline shrink-0">
            <img src="/images/Logo.svg" alt="Resolve MUN" className="w-5 h-5 object-contain" />
            <span
              className="text-base tracking-[0.12em] text-white font-bold pt-0.5"
              style={{ fontFamily: "'Bebas Neue', sans-serif" }}
            >
              RESOLVE MUN 2.0
            </span>
          </Link>
          <span className="text-zinc-700">/</span>
          <span className="text-xs text-zinc-400 truncate">Secretariat</span>
        </div>
        <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
          {user && (
            <>
              <button
                type="button"
                onClick={() => fetchStats(user.email)}
                className="h-8 px-2.5 rounded-md border border-[#262626] bg-black text-xs text-zinc-300 hover:text-white flex items-center gap-1.5 cursor-pointer"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Sync</span>
              </button>
              <Link
                href="/dashboard"
                className="h-8 px-2.5 rounded-md border border-[#262626] bg-black text-xs text-zinc-300 hover:text-white flex items-center"
              >
                Dashboard
              </Link>
              <button
                type="button"
                onClick={() => signOutUser()}
                className="h-8 px-2.5 rounded-md border border-[#262626] bg-black text-xs text-zinc-400 hover:text-white flex items-center gap-1 cursor-pointer"
                title="Sign Out"
              >
                <LogOut className="w-3.5 h-3.5" />
              </button>
            </>
          )}
        </div>
      </div>
    </header>
  );

  if (!authReady || loading) {
    return (
      <div className="min-h-screen bg-black text-white flex flex-col justify-between">
        {topBar}
        <div className="flex-1 flex items-center justify-center px-4">
          <p className="text-xs font-mono uppercase tracking-widest text-zinc-500">
            Loading Secretariat Portal...
          </p>
        </div>
        <Footer />
      </div>
    );
  }

  const stats = data?.stats || {
    totalReferrals: 0,
    verifiedCount: 0,
    pendingCount: 0,
    totalVerifiedCash: 0,
    totalPendingCash: 0,
  };
  const myCodes = data?.myCodes || [];
  const referrals = data?.referrals || [];
  const isPendingApproval = Boolean(data?.pendingApproval && !editingProfile);
  const showOnboardingForm = Boolean((data?.needsOnboarding && !data?.pendingApproval) || editingProfile);

  return (
    <div id="dashboard-root" className="min-h-screen bg-black text-white font-sans flex flex-col justify-between selection:bg-white selection:text-black">
      {topBar}

      <main id="dashboard-main" className="max-w-3xl w-full mx-auto px-4 sm:px-6 py-8 sm:py-10 space-y-6 flex-1">
        {/* RESOLVE SIGNATURE EYEBROW & HEADER */}
        <div className="text-center space-y-2">
          <div className="flex items-center justify-center gap-2.5">
            <span className="h-px w-8 bg-gradient-to-r from-transparent to-[#7c3aed]" />
            <span className="text-[10px] font-mono uppercase tracking-[0.22em] text-zinc-400 font-semibold">
              SECRETARIAT DIRECTORATE
            </span>
            <span className="h-px w-8 bg-gradient-to-l from-transparent to-[#7c3aed]" />
          </div>
          <h1 className="m-0 text-2xl sm:text-3xl font-bold tracking-tight text-white">
            Secretariat Portal &amp; Referrals
          </h1>
          <p className="m-0 text-xs sm:text-sm text-zinc-400 max-w-md mx-auto leading-relaxed">
            26, 27 December 2026 · Northfield International School, Hyderabad
          </p>
        </div>

        {!user ? (
          /* STEP 1: BUILT-IN GOOGLE SIGN-IN ON /SECRETARIAT */
          <section className="border border-[#262626] bg-black rounded-md p-6 sm:p-8 text-center space-y-5 max-w-md mx-auto">
            <div className="w-11 h-11 rounded-md border border-[#262626] mx-auto flex items-center justify-center">
              <ShieldCheck className="w-5 h-5 text-white" />
            </div>
            <div className="space-y-1.5">
              <h2 className="m-0 text-lg font-bold text-white">
                Secretariat Sign-In
              </h2>
              <p className="m-0 text-xs text-zinc-400 leading-relaxed">
                Sign in with your Google account to complete your Secretariat onboarding, enter your allotted role, and set up your custom referral code (₹400 cash pool per delegate).
              </p>
            </div>

            {feedback.text && (
              <div className="p-3 rounded-md border border-red-500/40 bg-red-500/10 text-xs text-red-300">
                {feedback.text}
              </div>
            )}

            <button
              type="button"
              onClick={handleGoogleLogin}
              disabled={googleBusy}
              className="w-full h-11 rounded-md bg-white text-black text-xs font-bold uppercase tracking-wider hover:bg-zinc-200 flex items-center justify-center gap-2.5 cursor-pointer disabled:opacity-50"
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.8-2.4 3.66v3.05h3.88c2.27-2.09 3.66-5.17 3.66-9.15z" />
                <path fill="#34A853" d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.24v3.15C3.26 21.4 7.33 24 12 24z" />
                <path fill="#FBBC05" d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.24C.45 8.15 0 9.99 0 12s.45 3.85 1.24 5.42l4.04-3.15z" />
                <path fill="#EA4335" d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.33 0 3.26 2.6 1.24 6.58l4.04 3.15c.95-2.83 3.6-4.98 6.72-4.98z" />
              </svg>
              <span>{googleBusy ? "Signing In..." : "Continue with Google"}</span>
            </button>

            <Link
              href="/?open=auth"
              className="block text-xs text-zinc-400 hover:text-white underline"
            >
              Or sign in with Email &amp; Password
            </Link>
          </section>
        ) : isPendingApproval ? (
          /* STEP 2B: PENDING ADMIN APPROVAL GATE */
          <section className="border border-[#262626] bg-black rounded-md p-6 sm:p-8 text-center space-y-4 max-w-lg mx-auto">
            <div className="inline-flex items-center gap-1.5 text-xs font-mono text-amber-400">
              <span className="h-2 w-2 rounded-full bg-amber-400" />
              Pending Admin Approval
            </div>
            <h2 className="m-0 text-xl font-bold text-white">
              Secretariat Profile Submitted
            </h2>
            <p className="m-0 text-xs text-zinc-400 leading-relaxed">
              Your details ({data?.rosterMember?.fullName || user.email} · {data?.memberRole || "Secretariat"}) have been submitted to the Admin Console. Once an administrator approves your Secretariat profile, your referral code generator (₹400 cash pool) and live payout dashboard will unlock here automatically.
            </p>
            <div className="flex items-center justify-center gap-2 pt-2">
              <button
                type="button"
                onClick={() => fetchStats(user.email)}
                className="h-9 px-4 rounded-md bg-white text-black text-xs font-semibold hover:bg-zinc-200 cursor-pointer"
              >
                Check Approval Status
              </button>
              <button
                type="button"
                onClick={() => setEditingProfile(true)}
                className="h-9 px-4 rounded-md border border-[#262626] text-xs text-zinc-300 hover:text-white cursor-pointer"
              >
                Edit Profile
              </button>
            </div>
          </section>
        ) : showOnboardingForm ? (
          /* STEP 2: SECRETARIAT SELF-ONBOARDING FORM */
          <section className="border border-[#262626] bg-black rounded-md p-5 sm:p-6 space-y-5">
            <div className="flex items-start justify-between gap-3 border-b border-[#1f1f1f] pb-4">
              <div>
                <span className="block text-[10px] font-mono uppercase tracking-widest text-zinc-500">
                  Signed in as {user.email}
                </span>
                <h2 className="m-0 text-lg font-bold text-white mt-0.5">
                  {editingProfile ? "Edit Your Secretariat Profile" : "Complete Secretariat Onboarding"}
                </h2>
                <p className="m-0 text-xs text-zinc-400 mt-1">
                  Enter your details and allotted role to register in the Secretariat database and unlock referral code creation.
                </p>
              </div>
              {editingProfile && (
                <button
                  type="button"
                  onClick={() => setEditingProfile(false)}
                  className="text-xs text-zinc-400 hover:text-white cursor-pointer"
                >
                  Cancel
                </button>
              )}
            </div>

            {feedback.text && (
              <div
                className={`p-3 rounded-md border text-xs ${
                  feedback.type === "error"
                    ? "border-red-500/40 bg-red-500/10 text-red-300"
                    : "border-white/20 bg-white/[0.04] text-white"
                }`}
              >
                {feedback.text}
              </div>
            )}

            <form onSubmit={handleCompleteOnboarding} className="space-y-3.5">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-[11px] text-zinc-400">Full Name *</label>
                  <input
                    type="text"
                    required
                    value={onboardingForm.fullName}
                    onChange={(e) => setOnboardingForm((p) => ({ ...p, fullName: e.target.value }))}
                    placeholder="Your full name"
                    className="w-full h-10 px-3 rounded-md bg-black border border-[#262626] text-xs text-white focus:border-white focus:outline-none"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[11px] text-zinc-400">Your Allotted Role / Position *</label>
                  <select
                    required
                    value={onboardingForm.allottedRole}
                    onChange={(e) => setOnboardingForm((p) => ({ ...p, allottedRole: e.target.value }))}
                    className="w-full h-10 px-3 rounded-md bg-black border border-[#262626] text-xs text-white focus:border-white focus:outline-none"
                  >
                    {SECRETARIAT_ROLES.map((r) => (
                      <option key={r} value={r}>
                        {r}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-[11px] text-zinc-400">WhatsApp Phone Number *</label>
                  <input
                    type="tel"
                    required
                    value={onboardingForm.phone}
                    onChange={(e) => setOnboardingForm((p) => ({ ...p, phone: e.target.value }))}
                    placeholder="10-digit mobile number"
                    className="w-full h-10 px-3 rounded-md bg-black border border-[#262626] text-xs text-white focus:border-white focus:outline-none"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[11px] text-zinc-400">School / College / Institution *</label>
                  <input
                    type="text"
                    required
                    value={onboardingForm.school}
                    onChange={(e) => setOnboardingForm((p) => ({ ...p, school: e.target.value }))}
                    placeholder="Institution name"
                    className="w-full h-10 px-3 rounded-md bg-black border border-[#262626] text-xs text-white focus:border-white focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="space-y-1">
                  <label className="text-[11px] text-zinc-400">Grade / Year</label>
                  <input
                    type="text"
                    value={onboardingForm.grade}
                    onChange={(e) => setOnboardingForm((p) => ({ ...p, grade: e.target.value }))}
                    placeholder="e.g. Grade 12 / 2nd Yr"
                    className="w-full h-10 px-3 rounded-md bg-black border border-[#262626] text-xs text-white focus:border-white focus:outline-none"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[11px] text-zinc-400">UPI ID (for Cash Payouts)</label>
                  <input
                    type="text"
                    value={onboardingForm.upiId}
                    onChange={(e) => setOnboardingForm((p) => ({ ...p, upiId: e.target.value }))}
                    placeholder="yourname@okaxis"
                    className="w-full h-10 px-3 rounded-md bg-black border border-[#262626] text-xs text-white font-mono focus:border-white focus:outline-none"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[11px] text-zinc-400">Instagram Handle</label>
                  <input
                    type="text"
                    value={onboardingForm.instagram}
                    onChange={(e) => setOnboardingForm((p) => ({ ...p, instagram: e.target.value }))}
                    placeholder="@handle"
                    className="w-full h-10 px-3 rounded-md bg-black border border-[#262626] text-xs text-white focus:border-white focus:outline-none"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={onboardingSaving}
                className="w-full h-10 rounded-md bg-white text-black text-xs font-bold uppercase tracking-wider hover:bg-zinc-200 cursor-pointer disabled:opacity-50 mt-2"
              >
                {onboardingSaving
                  ? "Saving Profile..."
                  : editingProfile
                    ? "Save Profile Changes"
                    : "Complete Onboarding & Setup Referral Code →"}
              </button>
            </form>
          </section>
        ) : (
          /* STEP 3: SECRETARIAT REFERRAL & CASH EARNINGS WORKSPACE */
          <>
            {/* 1. PROFILE & LIVE CASH KPI STRIP */}
            <section className="border border-[#262626] bg-black rounded-md p-4 sm:p-5 space-y-4">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <h2 className="m-0 text-base sm:text-lg font-bold text-white truncate">
                      {onboardingForm.fullName || data?.memberName || user.displayName || user.email}
                    </h2>
                    <span className="px-2 py-0.5 rounded bg-white text-black text-[10px] font-bold uppercase tracking-wider">
                      {onboardingForm.allottedRole || data?.memberRole || "Secretariat"}
                    </span>
                  </div>
                  <p className="m-0 text-xs text-zinc-400 mt-0.5 truncate">
                    {user.email}
                    {onboardingForm.upiId ? ` · UPI: ${onboardingForm.upiId}` : ""}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setEditingProfile(true)}
                  className="shrink-0 h-8 px-2.5 rounded-md border border-[#262626] bg-black text-xs text-zinc-300 hover:text-white flex items-center gap-1.5 cursor-pointer"
                >
                  <Pencil className="w-3 h-3" />
                  <span>Edit Role / Info</span>
                </button>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-px bg-[#1f1f1f] border border-[#1f1f1f] rounded-md overflow-hidden">
                <div className="bg-black p-3.5">
                  <span className="block text-[9px] font-mono uppercase tracking-widest text-zinc-500">
                    Verified Cash
                  </span>
                  <span className="block text-xl font-bold text-white mt-1 font-mono">
                    ₹{stats.totalVerifiedCash.toLocaleString("en-IN")}
                  </span>
                  <span className="block text-[10px] text-zinc-500 mt-0.5">
                    {stats.verifiedCount} verified
                  </span>
                </div>

                <div className="bg-black p-3.5">
                  <span className="block text-[9px] font-mono uppercase tracking-widest text-zinc-500">
                    Pending Cash
                  </span>
                  <span className="block text-xl font-bold text-zinc-300 mt-1 font-mono">
                    ₹{stats.totalPendingCash.toLocaleString("en-IN")}
                  </span>
                  <span className="block text-[10px] text-zinc-500 mt-0.5">
                    {stats.pendingCount} awaiting verify
                  </span>
                </div>

                <div className="bg-black p-3.5">
                  <span className="block text-[9px] font-mono uppercase tracking-widest text-zinc-500">
                    Total Signups
                  </span>
                  <span className="block text-xl font-bold text-white mt-1 font-mono">
                    {stats.totalReferrals}
                  </span>
                  <span className="block text-[10px] text-zinc-500 mt-0.5">
                    Used your code
                  </span>
                </div>

                <div className="bg-black p-3.5">
                  <span className="block text-[9px] font-mono uppercase tracking-widest text-zinc-500">
                    Pool / Delegate
                  </span>
                  <span className="block text-xl font-bold text-white mt-1 font-mono">
                    ₹{pool}
                  </span>
                  <span className="block text-[10px] text-zinc-500 mt-0.5">
                    Base ₹{baseFee.toLocaleString("en-IN")}
                  </span>
                </div>
              </div>
            </section>

            {/* 2. CUSTOM REFERRAL CODE & CASH SPLIT CONFIGURATOR */}
            <section className="border border-[#262626] bg-black rounded-md p-4 sm:p-5 space-y-4">
              <div>
                <span className="block text-[10px] font-mono uppercase tracking-widest text-zinc-500">
                  CREATE OR UPDATE YOUR REFERRAL CODE
                </span>
                <h2 className="m-0 text-base font-bold text-white mt-0.5">
                  Custom Code &amp; Discount Split
                </h2>
                <p className="m-0 text-xs text-zinc-400 mt-1">
                  Base fee is ₹{baseFee.toLocaleString("en-IN")}. You have a ₹{pool} pool per delegate: enter any discount amount between ₹0 and ₹{pool} (e.g. ₹0, ₹75, ₹125, ₹250, ₹350) and pocket the remaining balance in cash.
                </p>
              </div>

              <form onSubmit={handleSaveCode} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[10px] font-mono uppercase tracking-widest text-zinc-400 mb-1.5">
                      1. Your Referral Code
                    </label>
                    <input
                      type="text"
                      value={codeInput}
                      onChange={(e) => setCodeInput(e.target.value.toUpperCase().replace(/[^A-Z0-9_-]/g, ""))}
                      placeholder="e.g. SEC-VIBHAV or VIBHAV100"
                      maxLength={20}
                      className="w-full h-10 px-3 rounded-md bg-black border border-[#262626] text-white font-mono text-sm uppercase tracking-wider focus:outline-none focus:border-white"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-mono uppercase tracking-widest text-zinc-400 mb-1.5">
                      2. Discount Given to Delegate (Any ₹0 – ₹{pool})
                    </label>
                    <input
                      type="number"
                      min={0}
                      max={pool}
                      step={1}
                      value={discountAmount}
                      onChange={(e) => {
                        const raw = e.target.value;
                        if (raw === "") {
                          setDiscountAmount(0);
                          return;
                        }
                        const v = Math.max(0, Math.min(pool, Math.floor(Number(raw) || 0)));
                        setDiscountAmount(v);
                      }}
                      className="w-full h-10 px-3 rounded-md bg-black border border-[#262626] text-white font-mono text-sm focus:outline-none focus:border-white"
                    />
                  </div>
                </div>

                {/* Preset Split Chips */}
                <div className="space-y-1.5">
                  <span className="block text-[10px] font-mono uppercase tracking-widest text-zinc-500">
                    Quick Split Presets
                  </span>
                  <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
                    {SPLIT_PRESETS.map((p) => {
                      const active = discountAmount === p.discount;
                      return (
                        <button
                          key={p.discount}
                          type="button"
                          onClick={() => setDiscountAmount(p.discount)}
                          className={`p-2.5 rounded-md border text-left transition-all cursor-pointer ${
                            active
                              ? "bg-white text-black border-white"
                              : "bg-black text-white border-[#262626] hover:border-white/40"
                          }`}
                        >
                          <span className={`block text-[9px] font-mono uppercase tracking-wider ${active ? "text-zinc-700 font-bold" : "text-zinc-500"}`}>
                            {p.tag}
                          </span>
                          <span className="block text-xs font-bold font-mono mt-0.5">
                            ₹{p.discount} Off
                          </span>
                          <span className={`block text-[10px] font-mono mt-0.5 ${active ? "text-black font-semibold" : "text-zinc-400"}`}>
                            You get ₹{p.cash}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Live Payout Breakdown Box */}
                <div className="grid grid-cols-3 gap-px bg-[#1f1f1f] border border-[#1f1f1f] rounded-md overflow-hidden">
                  <div className="bg-black p-3">
                    <span className="block text-[9px] font-mono uppercase tracking-widest text-zinc-500">
                      Delegate Pays
                    </span>
                    <span className="block text-base font-bold text-white font-mono mt-0.5">
                      ₹{delegatePays.toLocaleString("en-IN")}
                    </span>
                  </div>
                  <div className="bg-black p-3">
                    <span className="block text-[9px] font-mono uppercase tracking-widest text-zinc-500">
                      Delegate Saves
                    </span>
                    <span className="block text-base font-bold text-white font-mono mt-0.5">
                      ₹{discountAmount.toLocaleString("en-IN")}
                    </span>
                  </div>
                  <div className="bg-white text-black p-3">
                    <span className="block text-[9px] font-mono uppercase tracking-widest text-zinc-700 font-bold">
                      Your Cash / Delegate
                    </span>
                    <span className="block text-base font-bold text-black font-mono mt-0.5">
                      ₹{cashEarnedPerRef.toLocaleString("en-IN")}
                    </span>
                  </div>
                </div>

                {feedback.text && (
                  <div
                    className={`p-3 rounded-md border text-xs ${
                      feedback.type === "error"
                        ? "border-red-500/50 bg-red-950/20 text-red-300"
                        : "border-white bg-black text-white"
                    }`}
                  >
                    {feedback.text}
                  </div>
                )}

                <button
                  type="submit"
                  disabled={saving}
                  className="h-10 px-5 rounded-md bg-white text-black text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50 w-full sm:w-auto"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>{saving ? "Saving Code..." : "Save & Activate Referral Code"}</span>
                </button>
              </form>
            </section>

            {/* 3. YOUR ACTIVE REFERRAL CODES & SHARE LINKS */}
            {myCodes.length > 0 && (
              <section className="border border-[#262626] bg-black rounded-md p-4 sm:p-5 space-y-3">
                <span className="block text-[10px] font-mono uppercase tracking-widest text-zinc-500">
                  YOUR ACTIVE REFERRAL CODES ({myCodes.length})
                </span>

                <div className="space-y-2.5">
                  {myCodes.map((c) => {
                    const disc = Number(c.discountAmount || 0);
                    const comm = Math.max(0, pool - disc);
                    const finalPay = Math.max(0, baseFee - disc);
                    const shareLink = `${origin}/?open=delegate&ref=${encodeURIComponent(c.code)}`;
                    const waMsg = encodeURIComponent(
                      disc > 0
                        ? `Register for Resolve MUN 2.0 (26–27 Dec 2026 at Northfield International School, Hyderabad) with my referral code ${c.code} to get ₹${disc} OFF (Pay ₹${finalPay.toLocaleString("en-IN")}): ${shareLink}`
                        : `Register for Resolve MUN 2.0 (26–27 Dec 2026 at Northfield International School, Hyderabad) using my referral link (Code: ${c.code}): ${shareLink}`
                    );

                    return (
                      <div
                        key={c.code}
                        className="p-3.5 rounded-md border border-[#262626] bg-black flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                      >
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="text-base font-bold font-mono text-white tracking-wider">
                              {c.code}
                            </span>
                            <span className="px-2 py-0.5 rounded bg-white text-black text-[10px] font-mono font-bold uppercase">
                              Earn ₹{comm} / Delegate
                            </span>
                          </div>
                          <p className="m-0 text-xs text-zinc-400 mt-1">
                            Delegate pays ₹{finalPay.toLocaleString("en-IN")} ({disc > 0 ? `₹${disc} discount` : "Standard ₹2,500 fee"})
                          </p>
                        </div>

                        <div className="flex flex-wrap items-center gap-2">
                          <button
                            type="button"
                            onClick={() => copyText(shareLink, `link_${c.code}`)}
                            className="h-9 px-3 rounded-md bg-white text-black text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 cursor-pointer"
                          >
                            {copiedKey === `link_${c.code}` ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                            <span>{copiedKey === `link_${c.code}` ? "Copied Link" : "Copy Link"}</span>
                          </button>

                          <a
                            href={`https://wa.me/?text=${waMsg}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="h-9 px-3 rounded-md border border-[#262626] bg-black text-white text-xs font-semibold flex items-center gap-1.5"
                          >
                            <Share2 className="w-3.5 h-3.5" />
                            <span>WhatsApp</span>
                          </a>

                          <button
                            type="button"
                            onClick={() => handleDeleteCode(c.code)}
                            className="h-9 px-2.5 rounded-md border border-[#262626] bg-black text-zinc-400 hover:text-white flex items-center cursor-pointer"
                            title="Delete code"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </section>
            )}

            {/* 4. REFERRED DELEGATES LEDGER */}
            <section className="border border-[#262626] bg-black rounded-md p-4 sm:p-5 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-mono uppercase tracking-widest text-zinc-500">
                  REFERRED DELEGATES ({referrals.length})
                </span>
                <span className="text-xs font-mono text-zinc-400">
                  Verified Payout: <strong className="text-white">₹{stats.totalVerifiedCash.toLocaleString("en-IN")}</strong>
                </span>
              </div>

              {referrals.length === 0 ? (
                <div className="py-8 text-center border border-dashed border-[#262626] rounded-md">
                  <p className="m-0 text-xs text-zinc-500">
                    No delegates have registered with your code yet. Share your referral link above to start earning!
                  </p>
                </div>
              ) : (
                <div className="divide-y divide-[#262626] border border-[#262626] rounded-md overflow-hidden">
                  {referrals.map((r, i) => (
                    <div key={r.id || i} className="p-3 bg-black flex items-center justify-between gap-3">
                      <div className="min-w-0">
                        <p className="m-0 text-xs font-semibold text-white truncate">
                          {r.name}
                        </p>
                        <p className="m-0 text-[11px] font-mono text-zinc-500 truncate mt-0.5">
                          Code: {r.referralCode} · Discount: ₹{r.discountGiven}
                        </p>
                      </div>

                      <div className="flex items-center gap-2.5 shrink-0">
                        <span className="text-xs font-mono font-bold text-white">
                          +₹{r.cashEarned}
                        </span>
                        <span
                          className={`px-2 py-0.5 rounded text-[9px] font-mono font-bold uppercase ${
                            r.verified
                              ? "bg-white text-black"
                              : "border border-[#333333] text-zinc-400"
                          }`}
                        >
                          {r.verified ? "Verified" : "Pending"}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </section>
          </>
        )}
      </main>

      <Footer />
    </div>
  );
}
