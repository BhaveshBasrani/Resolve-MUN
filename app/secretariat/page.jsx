"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { auth, onAuthStateChanged } from "@/lib/firebase";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import {
  Copy,
  Check,
  Share2,
  RefreshCw,
  Trash2,
  ArrowRight,
  Lock,
  Plus,
} from "lucide-react";

const SPLIT_PRESETS = [
  { discount: 0, cash: 400, tag: "Max Cash" },
  { discount: 100, cash: 300, tag: "Balanced" },
  { discount: 150, cash: 250, tag: "Popular" },
  { discount: 200, cash: 200, tag: "50 / 50" },
  { discount: 250, cash: 150, tag: "High Discount" },
];

export default function SecretariatDashboardPage() {
  const [user, setUser] = useState(null);
  const [authReady, setAuthReady] = useState(false);
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState(null);

  const [codeInput, setCodeInput] = useState("");
  const [discountAmount, setDiscountAmount] = useState(100);
  const [saving, setSaving] = useState(false);
  const [feedback, setFeedback] = useState({ type: "", text: "" });
  const [copiedKey, setCopiedKey] = useState("");

  const [onboardingForm, setOnboardingForm] = useState({
    fullName: "",
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
          phone: json.rosterMember.phone || prev.phone || "",
          school: json.rosterMember.school || prev.school || "",
          grade: json.rosterMember.grade || prev.grade || "",
          upiId: json.rosterMember.upiId || prev.upiId || "",
          instagram: json.rosterMember.instagram || prev.instagram || "",
        }));
      }
      if (json?.myCodes?.length > 0 && !codeInput) {
        setCodeInput(json.myCodes[0].code);
        setDiscountAmount(Number(json.myCodes[0].discountAmount ?? 100));
      }
    } catch (_) {
      setFeedback({ type: "error", text: "Failed to load Secretariat stats." });
    } finally {
      setLoading(false);
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
        setFeedback({ type: "error", text: json.message || "Could not save onboarding details." });
      } else {
        setFeedback({ type: "success", text: json.message });
        await fetchStats(user.email);
      }
    } catch (_) {
      setFeedback({ type: "error", text: "Network error while saving details." });
    } finally {
      setOnboardingSaving(false);
    }
  };

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (u) => {
      setUser(u || null);
      setAuthReady(true);
      if (u?.email) {
        fetchStats(u.email);
      } else {
        setLoading(false);
      }
    });
    return () => unsub();
  }, []);

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
          ownerName: data?.memberName || user.displayName || user.email.split("@")[0],
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

  if (!authReady || loading) {
    return (
      <div className="min-h-screen bg-black text-white flex flex-col justify-between">
        <Navbar />
        <div className="flex-1 flex items-center justify-center pt-24">
          <p className="text-xs font-mono uppercase tracking-widest text-zinc-500">
            Loading Secretariat Dashboard...
          </p>
        </div>
        <Footer />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-black text-white flex flex-col justify-between">
        <Navbar />
        <main className="flex-1 flex items-center justify-center px-4 pt-24 pb-16">
          <div className="w-full max-w-md border border-[#262626] bg-black rounded-md p-6 text-center space-y-4">
            <div className="w-10 h-10 rounded-md border border-[#262626] mx-auto flex items-center justify-center">
              <Lock className="w-4 h-4 text-white" />
            </div>
            <h1 className="m-0 text-lg font-bold text-white">Secretariat Referral Portal</h1>
            <p className="m-0 text-xs text-zinc-400 leading-relaxed">
              Sign in with your Secretariat or Organizing Committee Google/Email account to manage custom referral codes and track cash commissions.
            </p>
            <Link
              href="/?open=auth"
              className="flex h-10 w-full items-center justify-center rounded-md bg-white text-black text-xs font-bold uppercase tracking-wider"
            >
              Sign In <ArrowRight className="w-3.5 h-3.5 ml-1.5" />
            </Link>
          </div>
        </main>
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

  const topBar = (
    <header className="sticky top-0 z-40 h-14 border-b border-[#1f1f1f] bg-black/95 backdrop-blur-sm">
      <div className="max-w-5xl h-full mx-auto px-4 sm:px-6 flex items-center justify-between gap-3">
        <div className="flex items-center gap-2.5 min-w-0">
          <Link href="/" className="flex items-center gap-2 !no-underline shrink-0">
            <img src="/images/Logo.svg" alt="Resolve MUN" className="w-5 h-5 object-contain" />
            <span className="text-sm font-bold tracking-wider text-white">RESOLVE MUN 2.0</span>
          </Link>
          <span className="text-zinc-700">/</span>
          <span className="text-xs text-zinc-400 truncate">Secretariat</span>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <button
            type="button"
            onClick={() => fetchStats(user.email)}
            className="h-8 px-2.5 rounded-md border border-[#262626] bg-black text-xs text-zinc-300 hover:text-white flex items-center gap-1.5 cursor-pointer"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Refresh</span>
          </button>
          <Link
            href="/dashboard"
            className="h-8 px-2.5 rounded-md border border-[#262626] bg-black text-xs text-zinc-300 hover:text-white flex items-center"
          >
            Delegate Portal
          </Link>
        </div>
      </div>
    </header>
  );

  // Not authorized on Secretariat Roster
  if (data && data.authorized === false) {
    return (
      <div className="min-h-screen bg-black text-white font-sans flex flex-col justify-between">
        {topBar}
        <main className="flex-1 flex items-center justify-center px-4 py-16">
          <div className="w-full max-w-md border border-[#262626] bg-black rounded-md p-6 text-center space-y-4">
            <div className="w-10 h-10 rounded-md border border-[#262626] mx-auto flex items-center justify-center">
              <Lock className="w-4 h-4 text-white" />
            </div>
            <h1 className="m-0 text-lg font-bold text-white">Secretariat Access Required</h1>
            <p className="m-0 text-xs text-zinc-400 leading-relaxed">
              Your account (<span className="text-white font-mono">{user.email}</span>) has not been added to the Resolve MUN 2.0 Secretariat Roster yet. Ask the Admin to add your email &amp; allotted role in the Admin Panel, then refresh this page.
            </p>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => fetchStats(user.email)}
                className="flex-1 h-9 rounded-md bg-white text-black text-xs font-semibold cursor-pointer"
              >
                Check Again
              </button>
              <Link
                href="/dashboard"
                className="flex-1 h-9 rounded-md border border-[#262626] bg-black text-xs text-zinc-300 flex items-center justify-center"
              >
                Back to Dashboard
              </Link>
            </div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  // Admin added them to Secretariat Roster -> First-time Onboarding Form
  if (data?.needsOnboarding) {
    return (
      <div className="min-h-screen bg-black text-white font-sans flex flex-col justify-between">
        {topBar}
        <main className="flex-1 max-w-xl w-full mx-auto px-4 sm:px-6 py-10">
          <div className="border border-[#262626] bg-black rounded-md p-5 sm:p-7 space-y-5">
            <div className="space-y-1.5 border-b border-[#1f1f1f] pb-4">
              <span className="text-[10px] font-mono uppercase tracking-widest text-zinc-500">
                RESOLVE MUN 2.0 · SECRETARIAT ONBOARDING
              </span>
              <h1 className="m-0 text-xl font-bold text-white">
                Complete Your Secretariat Profile
              </h1>
              <p className="m-0 text-xs text-zinc-400">
                Welcome to the team. Confirm your details below to unlock your referral code setup and cash earnings tracker.
              </p>
            </div>

            {/* Admin-Allotted Role Highlight */}
            <div className="p-3.5 rounded-md border border-white/20 bg-white/[0.03] flex items-center justify-between gap-3">
              <div>
                <span className="block text-[10px] font-mono uppercase tracking-widest text-zinc-400">
                  Your Allotted Role
                </span>
                <span className="block text-base font-bold text-white mt-0.5">
                  {data.memberRole || data.rosterMember?.allottedRole || "Secretariat Member"}
                </span>
              </div>
              <span className="px-2 py-0.5 rounded bg-white text-black text-[10px] font-bold uppercase tracking-wider shrink-0">
                Confirmed
              </span>
            </div>

            {feedback.text && (
              <div className={`p-3 rounded-md border text-xs ${feedback.type === "error" ? "border-red-500/40 bg-red-500/10 text-red-300" : "border-white/20 bg-white/[0.04] text-white"}`}>
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
                  <label className="text-[11px] text-zinc-400">WhatsApp / Phone Number *</label>
                  <input
                    type="tel"
                    required
                    value={onboardingForm.phone}
                    onChange={(e) => setOnboardingForm((p) => ({ ...p, phone: e.target.value }))}
                    placeholder="10-digit mobile number"
                    className="w-full h-10 px-3 rounded-md bg-black border border-[#262626] text-xs text-white focus:border-white focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-[11px] text-zinc-400">School / College *</label>
                  <input
                    type="text"
                    required
                    value={onboardingForm.school}
                    onChange={(e) => setOnboardingForm((p) => ({ ...p, school: e.target.value }))}
                    placeholder="Institution name"
                    className="w-full h-10 px-3 rounded-md bg-black border border-[#262626] text-xs text-white focus:border-white focus:outline-none"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[11px] text-zinc-400">Grade / Year</label>
                  <input
                    type="text"
                    value={onboardingForm.grade}
                    onChange={(e) => setOnboardingForm((p) => ({ ...p, grade: e.target.value }))}
                    placeholder="e.g. Grade 12 / 1st Year"
                    className="w-full h-10 px-3 rounded-md bg-black border border-[#262626] text-xs text-white focus:border-white focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-[11px] text-zinc-400">UPI ID (for Cash Referral Payouts)</label>
                  <input
                    type="text"
                    value={onboardingForm.upiId}
                    onChange={(e) => setOnboardingForm((p) => ({ ...p, upiId: e.target.value }))}
                    placeholder="yourname@okaxis / @ybl"
                    className="w-full h-10 px-3 rounded-md bg-black border border-[#262626] text-xs text-white font-mono focus:border-white focus:outline-none"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[11px] text-zinc-400">Instagram Handle (Optional)</label>
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
                {onboardingSaving ? "Saving Profile..." : "Complete Onboarding & Setup Referral Code →"}
              </button>
            </form>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div id="dashboard-root" className="min-h-screen bg-black text-white font-sans flex flex-col justify-between">
      {topBar}

      <main id="dashboard-main" className="max-w-4xl w-full mx-auto px-4 sm:px-6 pt-8 pb-20 space-y-5 flex-1">
        {/* 1. HEADER & LIVE CASH SUMMARY */}
        <section className="border border-[#262626] bg-black rounded-md p-5 space-y-4">
          <div className="flex items-start justify-between gap-3">
            <div>
              <span className="block text-[10px] font-mono uppercase tracking-widest text-zinc-500">
                RESOLVE MUN 2.0 · SECRETARIAT &amp; OC PORTAL
              </span>
              <h1 className="m-0 text-xl sm:text-2xl font-bold text-white mt-1">
                Referral &amp; Cash Earnings
              </h1>
              <p className="m-0 text-xs text-zinc-400 mt-1">
                {data?.memberName || user.displayName || user.email} · {data?.memberRole || "Secretariat"}
              </p>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <button
                type="button"
                onClick={() => fetchStats(user.email)}
                className="h-9 px-3 rounded-md border border-[#262626] bg-black text-xs font-medium text-white flex items-center gap-1.5 cursor-pointer"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Refresh</span>
              </button>
              <Link
                href="/dashboard"
                className="h-9 px-3 rounded-md border border-[#262626] bg-black text-xs font-medium text-zinc-300 flex items-center"
              >
                Delegate View
              </Link>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-px bg-[#262626] border border-[#262626] rounded-md overflow-hidden">
            <div className="bg-black p-3.5">
              <span className="block text-[9px] font-mono uppercase tracking-widest text-zinc-500">
                Verified Cash Earned
              </span>
              <span className="block text-xl font-bold text-white mt-1 font-mono">
                ₹{stats.totalVerifiedCash.toLocaleString("en-IN")}
              </span>
            </div>
            <div className="bg-black p-3.5">
              <span className="block text-[9px] font-mono uppercase tracking-widest text-zinc-500">
                Pending Cash
              </span>
              <span className="block text-xl font-bold text-zinc-300 mt-1 font-mono">
                ₹{stats.totalPendingCash.toLocaleString("en-IN")}
              </span>
            </div>
            <div className="bg-black p-3.5">
              <span className="block text-[9px] font-mono uppercase tracking-widest text-zinc-500">
                Verified Signups
              </span>
              <span className="block text-xl font-bold text-white mt-1 font-mono">
                {stats.verifiedCount}
              </span>
            </div>
            <div className="bg-black p-3.5">
              <span className="block text-[9px] font-mono uppercase tracking-widest text-zinc-500">
                Pool / Referral
              </span>
              <span className="block text-xl font-bold text-white mt-1 font-mono">
                ₹{pool}
              </span>
            </div>
          </div>
        </section>

        {/* 2. INTERACTIVE ₹400 SPLIT CONFIGURATOR */}
        <section className="border border-[#262626] bg-black rounded-md p-5 space-y-4">
          <div>
            <span className="block text-[10px] font-mono uppercase tracking-widest text-zinc-500">
              CUSTOM CODE &amp; SPLIT CONFIGURATOR
            </span>
            <h2 className="m-0 text-base font-bold text-white mt-0.5">
              Create or Update Your Referral Code
            </h2>
            <p className="m-0 text-xs text-zinc-400 mt-1">
              Base delegate fee is ₹{baseFee.toLocaleString("en-IN")}. You control a ₹{pool} pool per verified referral — keep all ₹{pool} as cash, or pass part of it as a delegate discount to attract more signups.
            </p>
          </div>

          <form onSubmit={handleSaveCode} className="space-y-4">
            <div>
              <label className="block text-[10px] font-mono uppercase tracking-wider text-zinc-400 mb-1.5">
                Your Custom Code
              </label>
              <input
                type="text"
                value={codeInput}
                onChange={(e) => setCodeInput(e.target.value.toUpperCase().replace(/[^A-Z0-9_-]/g, ""))}
                placeholder="e.g. SEC-BHAVESH or BHAVESH100"
                maxLength={20}
                required
                className="w-full h-11 px-3 rounded-md border border-[#262626] bg-black text-sm font-mono font-bold text-white placeholder:text-zinc-600 focus:outline-none focus:border-white"
              />
            </div>

            {/* Quick Split Presets */}
            <div>
              <label className="block text-[10px] font-mono uppercase tracking-wider text-zinc-400 mb-1.5">
                Choose Your ₹{pool} Split (Delegate Discount vs Your Cash)
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
                {SPLIT_PRESETS.map((p) => {
                  const active = discountAmount === p.discount;
                  return (
                    <button
                      key={p.discount}
                      type="button"
                      onClick={() => setDiscountAmount(p.discount)}
                      className={`p-2.5 rounded-md border text-left cursor-pointer ${
                        active
                          ? "bg-white text-black border-white"
                          : "bg-black text-white border-[#262626]"
                      }`}
                    >
                      <span className={`block text-[9px] font-mono uppercase tracking-wider ${active ? "text-black/70" : "text-zinc-500"}`}>
                        {p.tag}
                      </span>
                      <span className="block text-xs font-bold mt-0.5">
                        ₹{p.discount} off
                      </span>
                      <span className={`block text-[11px] font-mono ${active ? "text-black" : "text-zinc-300"}`}>
                        +₹{p.cash} cash
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Custom Slider (₹0 to ₹400 in ₹50 steps) */}
            <div className="p-3.5 rounded-md border border-[#262626] bg-black space-y-2.5">
              <div className="flex items-center justify-between text-xs font-mono">
                <span className="text-zinc-400">Custom Discount Slider</span>
                <span className="text-white font-bold">
                  Delegate pays ₹{delegatePays.toLocaleString("en-IN")} · You pocket ₹{cashEarnedPerRef}
                </span>
              </div>
              <input
                type="range"
                min={0}
                max={pool}
                step={50}
                value={discountAmount}
                onChange={(e) => setDiscountAmount(Number(e.target.value))}
                className="w-full accent-white cursor-pointer"
              />
              <div className="flex justify-between text-[10px] font-mono text-zinc-500">
                <span>₹0 off (₹400 cash)</span>
                <span>₹200 off (₹200 cash)</span>
                <span>₹400 off (₹0 cash)</span>
              </div>
            </div>

            {feedback.text && (
              <div
                className={`p-3 rounded-md border text-xs ${
                  feedback.type === "error"
                    ? "border-red-500/40 bg-red-950/20 text-red-300"
                    : "border-white/30 bg-black text-white"
                }`}
              >
                {feedback.text}
              </div>
            )}

            <button
              type="submit"
              disabled={saving || codeInput.trim().length < 3}
              className="w-full sm:w-auto h-11 px-6 rounded-md bg-white text-black text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2 cursor-pointer disabled:opacity-40"
            >
              <Plus className="w-4 h-4" />
              <span>{saving ? "Saving Code..." : "Save Referral Code & Split"}</span>
            </button>
          </form>
        </section>

        {/* 3. MY ACTIVE CODES & SHARE LINKS */}
        <section className="border border-[#262626] bg-black rounded-md p-5 space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="m-0 text-sm font-bold uppercase tracking-wider text-white">
              Your Active Codes ({myCodes.length})
            </h2>
          </div>

          {myCodes.length === 0 ? (
            <p className="m-0 text-xs text-zinc-500 py-4">
              No referral code created yet. Pick a custom code above to generate your shareable registration link.
            </p>
          ) : (
            <div className="space-y-3">
              {myCodes.map((c) => {
                const shareUrl = `${origin}/?open=delegate&ref=${encodeURIComponent(c.code)}`;
                const disc = Number(c.discountAmount || 0);
                const comm = Math.max(0, pool - disc);
                const fee = Math.max(0, baseFee - disc);
                const waMsg = `Register for Resolve MUN 2.0 (26–27 Dec 2026 at Northfield International School, Hyderabad) using my code ${c.code}${disc > 0 ? ` to get ₹${disc} OFF (Pay ₹${fee})` : ""}: ${shareUrl}`;
                return (
                  <div
                    key={c.code}
                    className="p-4 rounded-md border border-[#262626] bg-black space-y-3"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <span className="font-mono text-base font-bold text-white tracking-wider">
                          {c.code}
                        </span>
                        <p className="m-0 text-xs text-zinc-400 mt-0.5">
                          Delegate pays <strong className="text-white">₹{fee.toLocaleString("en-IN")}</strong> ({disc > 0 ? `₹${disc} off` : "no discount"}) · You earn <strong className="text-white">₹{comm} cash</strong>
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleDeleteCode(c.code)}
                        className="p-2 rounded-md border border-[#262626] text-zinc-500 hover:text-red-400 cursor-pointer"
                        aria-label={`Delete ${c.code}`}
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                      <button
                        type="button"
                        onClick={() => copyText(c.code, `code-${c.code}`)}
                        className="h-9 px-3 rounded-md border border-[#262626] bg-black text-xs font-mono text-white flex items-center justify-center gap-1.5 cursor-pointer"
                      >
                        {copiedKey === `code-${c.code}` ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                        <span>{copiedKey === `code-${c.code}` ? "Copied" : "Copy Code"}</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => copyText(shareUrl, `link-${c.code}`)}
                        className="h-9 px-3 rounded-md bg-white text-black text-xs font-bold flex items-center justify-center gap-1.5 cursor-pointer"
                      >
                        {copiedKey === `link-${c.code}` ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                        <span>{copiedKey === `link-${c.code}` ? "Link Copied" : "Copy Link"}</span>
                      </button>
                      <a
                        href={`https://wa.me/?text=${encodeURIComponent(waMsg)}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="col-span-2 sm:col-span-1 h-9 px-3 rounded-md border border-[#262626] bg-black text-xs font-semibold text-white flex items-center justify-center gap-1.5"
                      >
                        <Share2 className="w-3.5 h-3.5" />
                        <span>Share on WhatsApp</span>
                      </a>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </section>

        {/* 4. REFERRED DELEGATES LEDGER */}
        <section className="border border-[#262626] bg-black rounded-md p-5 space-y-3">
          <h2 className="m-0 text-sm font-bold uppercase tracking-wider text-white">
            Referral Ledger ({referrals.length})
          </h2>

          {referrals.length === 0 ? (
            <p className="m-0 text-xs text-zinc-500 py-4">
              No delegates have registered with your code yet. Share your link to start earning cash commissions.
            </p>
          ) : (
            <div className="divide-y divide-[#1f1f1f] border-t border-[#1f1f1f]">
              {referrals.map((r, i) => (
                <div key={`${r.email}-${i}`} className="py-3 flex items-center justify-between gap-3">
                  <div className="min-w-0">
                    <p className="m-0 text-xs font-semibold text-white truncate">{r.name}</p>
                    <p className="m-0 text-[11px] font-mono text-zinc-500 truncate mt-0.5">
                      Code: {r.referralCode} · {r.email}
                    </p>
                  </div>
                  <div className="text-right shrink-0">
                    <span className="block text-xs font-mono font-bold text-white">
                      +₹{r.cashEarned}
                    </span>
                    <span className="block text-[10px] font-mono uppercase text-zinc-400">
                      {r.verified ? "Verified" : "Pending"}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      </main>

      <Footer />
    </div>
  );
}
