"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import {
  auth,
  onAuthStateChanged,
  signInWithGoogle,
  signOutUser,
  syncUserToBackend,
  fetchSystemSettingsCached,
} from "@/lib/firebase";
import { uploadFileToSupabase } from "@/lib/supabase";
import Footer from "@/components/Footer";
import {
  CheckCircle2,
  ArrowRight,
  LogOut,
  Pencil,
  ShieldCheck,
  Lock,
  FileText,
  Download,
  Bus,
  Upload,
  Clock,
} from "lucide-react";

const COMMITTEES = [
  "UNCSW",
  "UNHRC",
  "DISEC",
  "IP",
  "Lok Sabha",
  "Marvel",
];

const GRADES = [
  "8th",
  "9th",
  "10th",
  "11th",
  "12th",
  "Undergraduate / College",
  "Other",
];

export default function LumenDelegatesPortalPage() {
  const [user, setUser] = useState(null);
  const [authReady, setAuthReady] = useState(false);
  const [googleBusy, setGoogleBusy] = useState(false);
  const [loading, setLoading] = useState(true);
  const [lumenDelegate, setLumenDelegate] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [feedback, setFeedback] = useState({ type: "", text: "" });
  const [liabilityUrl, setLiabilityUrl] = useState("/liability");
  const [showTermsModal, setShowTermsModal] = useState(false);
  const [uploadingProof, setUploadingProof] = useState(false);
  const [proofFileName, setProofFileName] = useState("");
  const [proofBase64, setProofBase64] = useState("");

  const [form, setForm] = useState({
    fullName: "",
    phone: "",
    school: "",
    grade: "11th",
    dob: "",
    address: "",
    emergencyName: "",
    emergencyPhone: "",
    experience: "",
    pref1Committee: "DISEC",
    pref1Country: "",
    pref2Committee: "UNHRC",
    pref2Country: "",
    pref3Committee: "UNCSW",
    pref3Country: "",
    paymentUtr: "",
    paymentScreenshotUrl: "",
    liabilityAccepted: true,
  });

  useEffect(() => {
    fetchSystemSettingsCached(false)
      .then((s) => {
        if (s?.liabilityFormUrl) setLiabilityUrl(s.liabilityFormUrl);
      })
      .catch(() => {});
  }, []);

  const fetchLumenProfile = async (email) => {
    if (!email) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/referrals/?lumenEmail=${encodeURIComponent(email)}`);
      const json = await res.json();
      if (json?.found && json.lumenDelegate) {
        const d = json.lumenDelegate;
        setLumenDelegate(d);
        setForm({
          fullName: d.fullName || user?.displayName || "",
          phone: d.phone || "",
          school: d.school || "",
          grade: d.grade || "11th",
          dob: d.dob || "",
          address: d.address || "",
          emergencyName: d.emergencyName || "",
          emergencyPhone: d.emergencyPhone || "",
          experience: d.experience || "",
          pref1Committee: d.pref1Committee || "DISEC",
          pref1Country: d.pref1Country || "",
          pref2Committee: d.pref2Committee || "UNHRC",
          pref2Country: d.pref2Country || "",
          pref3Committee: d.pref3Committee || "UNCSW",
          pref3Country: d.pref3Country || "",
          paymentUtr: d.paymentUtr === "LUMEN-ACQUIRED" ? "" : d.paymentUtr || "",
          paymentScreenshotUrl: d.paymentScreenshotUrl || "",
          liabilityAccepted: true,
        });
      } else {
        setLumenDelegate(null);
        setForm((prev) => ({
          ...prev,
          fullName: prev.fullName || user?.displayName || "",
        }));
      }
    } catch (_) {
      setFeedback({ type: "error", text: "Could not load delegate record." });
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
        setForm((prev) => ({ ...prev, fullName: prev.fullName || u.displayName || "" }));
        fetchLumenProfile(u.email);
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

  const handleProofUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 8 * 1024 * 1024) {
      setFeedback({ type: "error", text: "Screenshot file must be under 8MB." });
      return;
    }
    setUploadingProof(true);
    setProofFileName(file.name);
    setFeedback({ type: "", text: "" });
    try {
      const reader = new FileReader();
      reader.onload = () => setProofBase64(String(reader.result || ""));
      reader.readAsDataURL(file);
      const uploaded = await uploadFileToSupabase(file, "payment-screenshots", "LUMEN_PAY");
      if (uploaded) {
        setForm((p) => ({ ...p, paymentScreenshotUrl: uploaded }));
      }
    } catch (_) {
      // Base64 fallback handles Drive upload on submit
    } finally {
      setUploadingProof(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!user?.email) return;
    if (!form.liabilityAccepted) {
      setFeedback({
        type: "error",
        text: "Please acknowledge the Resolve MUN 2.0 Delegate Terms & Liability Waiver.",
      });
      return;
    }
    const cleanPhone = String(form.phone || "").replace(/\D/g, "").slice(-10);
    const cleanEmergencyPhone = String(form.emergencyPhone || "").replace(/\D/g, "").slice(-10);
    if (!/^[6-9]\d{9}$/.test(cleanPhone)) {
      setFeedback({ type: "error", text: "Please enter a valid 10-digit WhatsApp phone number." });
      return;
    }
    if (!/^[6-9]\d{9}$/.test(cleanEmergencyPhone)) {
      setFeedback({ type: "error", text: "Please enter a valid 10-digit Parent / Emergency contact number." });
      return;
    }
    if (cleanPhone === cleanEmergencyPhone) {
      setFeedback({
        type: "error",
        text: "Parent / Emergency contact number cannot be the same as the delegate's phone number.",
      });
      return;
    }
    if (!form.paymentScreenshotUrl && !proofBase64) {
      setFeedback({
        type: "error",
        text: "Please upload your Lumen MUN payment transaction screenshot for Secretariat verification.",
      });
      return;
    }
    setSaving(true);
    setFeedback({ type: "", text: "" });
    try {
      const res = await fetch("/api/referrals/", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "COMPLETE_LUMEN_ONBOARDING",
          email: user.email,
          ...form,
          paymentScreenshotBase64: proofBase64 || "",
          screenshotName: proofFileName || "Lumen_Payment_Proof.png",
        }),
      });
      const json = await res.json();
      if (!res.ok || !json.success) {
        setFeedback({ type: "error", text: json.message || "Failed to save Lumen delegate record." });
      } else {
        if (typeof window !== "undefined") {
          localStorage.setItem("resolve_user_registered", "true");
          localStorage.setItem("resolve_user_email", user.email);
          if (json.regId) localStorage.setItem("resolve_delegate_id", json.regId);
        }
        setFeedback({ type: "success", text: json.message });
        setIsEditing(false);
        await fetchLumenProfile(user.email);
      }
    } catch (_) {
      setFeedback({ type: "error", text: "Network error while saving profile." });
    } finally {
      setSaving(false);
    }
  };

  const topBar = (
    <header className="sticky top-0 z-40 h-14 border-b border-[#1f1f1f] bg-black/95 backdrop-blur-sm">
      <div className="max-w-3xl h-full mx-auto px-4 sm:px-6 flex items-center justify-between gap-3">
        <Link href="/" className="flex items-center gap-2 !no-underline shrink-0">
          <img src="/images/Logo.svg" alt="Resolve MUN" className="w-5 h-5 object-contain" />
          <span
            className="text-base tracking-[0.12em] text-white font-bold pt-0.5"
            style={{ fontFamily: "'Bebas Neue', sans-serif" }}
          >
            RESOLVE MUN 2.0
          </span>
        </Link>
        <div className="flex items-center gap-2">
          {user && (
            <>
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
              >
                <LogOut className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Sign Out</span>
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
            Loading Lumen Delegate Portal...
          </p>
        </div>
        <Footer />
      </div>
    );
  }

  const prefsLocked = Boolean(lumenDelegate?.preferencesLocked);

  return (
    <div className="min-h-screen bg-black text-white font-sans flex flex-col justify-between selection:bg-white selection:text-black">
      {topBar}

      <main className="flex-1 max-w-2xl w-full mx-auto px-4 sm:px-6 py-8 sm:py-12 space-y-6">
        {/* RESOLVE SIGNATURE EYEBROW & TITLE */}
        <div className="text-center space-y-2">
          <div className="flex items-center justify-center gap-2.5">
            <span className="h-px w-8 bg-gradient-to-r from-transparent to-[#7c3aed]" />
            <span className="text-[10px] font-mono uppercase tracking-[0.22em] text-zinc-400 font-semibold">
              OFFICIAL LUMEN MUN TRANSFER · DELEGATE PORTAL
            </span>
            <span className="h-px w-8 bg-gradient-to-l from-transparent to-[#7c3aed]" />
          </div>
          <h1 className="m-0 text-2xl sm:text-3xl font-bold tracking-tight text-white">
            Lumen Delegate Onboarding
          </h1>
          <p className="m-0 text-xs sm:text-sm text-zinc-400 max-w-md mx-auto leading-relaxed">
            26, 27 December 2026 · Northfield International School, Hyderabad
          </p>
        </div>

        {/* TRANSFER TERMS BANNER */}
        <div className="border border-[#262626] bg-[#050505] rounded-md p-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 text-xs">
          <div className="flex items-center gap-2 text-zinc-200">
            <CheckCircle2 className="w-4 h-4 text-white shrink-0" />
            <span>
              <strong>Registration Fee Covered</strong> · Direct transfer from Lumen MUN
            </span>
          </div>
          <div className="flex items-center gap-1.5 text-[11px] font-mono text-zinc-400 bg-black border border-[#262626] px-2.5 py-1 rounded shrink-0">
            <Bus className="w-3.5 h-3.5 text-zinc-500" />
            <span>Transport: Excluded (Self Commute)</span>
          </div>
        </div>

        {!user ? (
          /* STEP 1: SIGN IN RIGHT ON THIS PAGE */
          <section className="border border-[#262626] bg-black rounded-md p-6 sm:p-8 text-center space-y-5">
            <div className="w-11 h-11 rounded-md border border-[#262626] mx-auto flex items-center justify-center">
              <ShieldCheck className="w-5 h-5 text-white" />
            </div>
            <div className="space-y-1.5">
              <h2 className="m-0 text-lg font-bold text-white">
                Sign In to Claim Your Lumen Delegate Pass
              </h2>
              <p className="m-0 text-xs text-zinc-400 max-w-sm mx-auto leading-relaxed">
                Sign in with your Google account to enter your details, choose your 3 committee preferences, and activate your official Resolve MUN 2.0 QR Gate Pass.
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
        ) : lumenDelegate && !isEditing ? (
          /* STEP 3: LUMEN DELEGATE SUMMARY CARD (PENDING APPROVAL OR VERIFIED) */
          <section className="border border-[#262626] bg-black rounded-md p-5 sm:p-6 space-y-5">
            <div className="flex items-start justify-between gap-3 border-b border-[#1f1f1f] pb-4">
              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  {lumenDelegate.paymentStatus === "VERIFIED" ? (
                    <span className="inline-flex items-center gap-1.5 text-xs font-mono text-emerald-400 font-semibold">
                      <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
                      Approved Lumen Delegate
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1.5 text-xs font-mono text-amber-400 font-semibold">
                      <span className="h-1.5 w-1.5 rounded-full bg-amber-400" />
                      Pending Secretariat Approval
                    </span>
                  )}
                  <span className="text-xs font-mono text-zinc-500">
                    · {lumenDelegate.regId}
                  </span>
                </div>
                <h2 className="m-0 text-xl font-bold text-white mt-2">
                  {lumenDelegate.fullName}
                </h2>
                <p className="m-0 text-xs text-zinc-400 mt-0.5">
                  {lumenDelegate.email} · {lumenDelegate.phone}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setIsEditing(true)}
                className="h-8 px-3 rounded-md border border-[#262626] bg-black text-xs text-white hover:bg-white/5 flex items-center gap-1.5 cursor-pointer"
              >
                <Pencil className="w-3 h-3" />
                <span>Edit</span>
              </button>
            </div>

            {lumenDelegate.paymentStatus !== "VERIFIED" && (
              <div className="p-3.5 rounded-md border border-amber-500/30 bg-amber-500/5 flex items-start gap-2.5 text-xs text-amber-200">
                <Clock className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                <div>
                  <strong className="text-white block">Verification in Progress</strong>
                  <span className="text-zinc-400">
                    Your Lumen MUN transaction screenshot and details have been submitted. Once the Resolve MUN Secretariat approves your transfer, your official QR Gate Pass will unlock automatically on your dashboard and via email.
                  </span>
                </div>
              </div>
            )}

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-px bg-[#1f1f1f] border border-[#1f1f1f] rounded-md overflow-hidden">
              <div className="bg-black p-3">
                <span className="block text-[10px] font-mono uppercase text-zinc-500">Institution</span>
                <span className="block text-xs font-semibold text-white mt-1 truncate">{lumenDelegate.school || "—"}</span>
              </div>
              <div className="bg-black p-3">
                <span className="block text-[10px] font-mono uppercase text-zinc-500">Grade / DOB</span>
                <span className="block text-xs font-semibold text-white mt-1">{lumenDelegate.grade || "—"} · {lumenDelegate.dob || "—"}</span>
              </div>
              <div className="bg-black p-3">
                <span className="block text-[10px] font-mono uppercase text-zinc-500">Transport</span>
                <span className="block text-xs font-semibold text-zinc-400 mt-1">Excluded (Self Commute)</span>
              </div>
              <div className="bg-black p-3">
                <span className="block text-[10px] font-mono uppercase text-zinc-500">Preference 1</span>
                <span className="block text-xs font-semibold text-white mt-1 truncate">
                  {lumenDelegate.pref1Committee} {lumenDelegate.pref1Country ? `(${lumenDelegate.pref1Country})` : ""}
                </span>
              </div>
              <div className="bg-black p-3">
                <span className="block text-[10px] font-mono uppercase text-zinc-500">Preference 2</span>
                <span className="block text-xs font-semibold text-white mt-1 truncate">
                  {lumenDelegate.pref2Committee} {lumenDelegate.pref2Country ? `(${lumenDelegate.pref2Country})` : ""}
                </span>
              </div>
              <div className="bg-black p-3">
                <span className="block text-[10px] font-mono uppercase text-zinc-500">Preference 3</span>
                <span className="block text-xs font-semibold text-white mt-1 truncate">
                  {lumenDelegate.pref3Committee} {lumenDelegate.pref3Country ? `(${lumenDelegate.pref3Country})` : ""}
                </span>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-1">
              <Link
                href="/dashboard"
                className="h-10 rounded-md bg-white text-black text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-1.5"
              >
                <span>Open Digital QR Gate Pass</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
              <a
                href={liabilityUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="h-10 rounded-md border border-[#262626] bg-black text-white text-xs font-semibold flex items-center justify-center gap-1.5 hover:bg-white/[0.04]"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Download Liability Waiver Form</span>
              </a>
            </div>
          </section>
        ) : (
          /* STEP 2: LUMEN DELEGATE REGISTRATION FORM */
          <section className="border border-[#262626] bg-black rounded-md p-5 sm:p-6 space-y-5">
            <div className="flex items-center justify-between gap-2 border-b border-[#1f1f1f] pb-3.5">
              <div>
                <span className="block text-[10px] font-mono uppercase tracking-widest text-zinc-500">
                  Signed in as {user.email}
                </span>
                <h2 className="m-0 text-base sm:text-lg font-bold text-white mt-0.5">
                  Complete Your Lumen Delegate Profile
                </h2>
              </div>
              {lumenDelegate && (
                <button
                  type="button"
                  onClick={() => setIsEditing(false)}
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

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Personal Details */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-[11px] text-zinc-400">Full Name *</label>
                  <input
                    type="text"
                    required
                    value={form.fullName}
                    onChange={(e) => setForm((p) => ({ ...p, fullName: e.target.value }))}
                    placeholder="Enter your full name"
                    className="w-full h-10 px-3 rounded-md bg-black border border-[#262626] text-xs text-white focus:border-white focus:outline-none"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[11px] text-zinc-400">WhatsApp Phone Number *</label>
                  <input
                    type="tel"
                    required
                    value={form.phone}
                    onChange={(e) => setForm((p) => ({ ...p, phone: e.target.value }))}
                    placeholder="10-digit mobile number"
                    className="w-full h-10 px-3 rounded-md bg-black border border-[#262626] text-xs text-white font-mono focus:border-white focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="space-y-1 sm:col-span-1">
                  <label className="text-[11px] text-zinc-400">School / College / Institution *</label>
                  <input
                    type="text"
                    required
                    value={form.school}
                    onChange={(e) => setForm((p) => ({ ...p, school: e.target.value }))}
                    placeholder="Institution name"
                    className="w-full h-10 px-3 rounded-md bg-black border border-[#262626] text-xs text-white focus:border-white focus:outline-none"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[11px] text-zinc-400">Grade / Year *</label>
                  <select
                    required
                    value={form.grade}
                    onChange={(e) => setForm((p) => ({ ...p, grade: e.target.value }))}
                    className="w-full h-10 px-3 rounded-md bg-black border border-[#262626] text-xs text-white focus:border-white focus:outline-none"
                  >
                    {GRADES.map((g) => (
                      <option key={g} value={g}>
                        {g}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="text-[11px] text-zinc-400">Date of Birth *</label>
                  <input
                    type="date"
                    required
                    value={form.dob}
                    onChange={(e) => setForm((p) => ({ ...p, dob: e.target.value }))}
                    className="w-full h-10 px-3 rounded-md bg-black border border-[#262626] text-xs text-white font-mono focus:border-white focus:outline-none"
                  />
                </div>
              </div>

              {/* Locked Transport Policy Notice */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-[11px] text-zinc-400">Full Residential Address *</label>
                  <input
                    type="text"
                    required
                    value={form.address}
                    onChange={(e) => setForm((p) => ({ ...p, address: e.target.value }))}
                    placeholder="Area, Street, Hyderabad, Pincode"
                    className="w-full h-10 px-3 rounded-md bg-black border border-[#262626] text-xs text-white focus:border-white focus:outline-none"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[11px] text-zinc-400 flex items-center gap-1">
                    <span>Transportation</span>
                    <Lock className="w-3 h-3 text-zinc-500" />
                  </label>
                  <input
                    type="text"
                    disabled
                    value="No — Self Commute (Lumen Transfer)"
                    className="w-full h-10 px-3 rounded-md bg-[#0a0a0a] border border-[#1f1f1f] text-xs text-zinc-500 font-mono cursor-not-allowed"
                  />
                </div>
              </div>

              {/* Emergency Contact & MUN Experience */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-[11px] text-zinc-400">Parent / Emergency Contact Name *</label>
                  <input
                    type="text"
                    required
                    value={form.emergencyName}
                    onChange={(e) => setForm((p) => ({ ...p, emergencyName: e.target.value }))}
                    placeholder="Parent / Guardian Name"
                    className="w-full h-10 px-3 rounded-md bg-black border border-[#262626] text-xs text-white focus:border-white focus:outline-none"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[11px] text-zinc-400">Parent / Emergency Contact Phone *</label>
                  <input
                    type="tel"
                    required
                    value={form.emergencyPhone}
                    onChange={(e) => setForm((p) => ({ ...p, emergencyPhone: e.target.value }))}
                    placeholder="10-digit emergency number"
                    className="w-full h-10 px-3 rounded-md bg-black border border-[#262626] text-xs text-white font-mono focus:border-white focus:outline-none"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[11px] text-zinc-400">Past MUN Experience *</label>
                <input
                  type="text"
                  required
                  value={form.experience}
                  onChange={(e) => setForm((p) => ({ ...p, experience: e.target.value }))}
                  placeholder="List past MUNs & awards, or write 'First Timer / N/A'"
                  className="w-full h-10 px-3 rounded-md bg-black border border-[#262626] text-xs text-white focus:border-white focus:outline-none"
                />
              </div>

              {/* 3 Committee & Portfolio Preferences */}
              <div className="border border-[#262626] bg-[#050505] rounded-md p-4 space-y-3.5">
                <div className="flex items-center justify-between gap-2">
                  <span className="text-xs font-bold text-white uppercase tracking-wider">
                    Committee &amp; Portfolio Preferences
                  </span>
                  <span className="text-[10px] font-mono text-zinc-400">
                    {prefsLocked ? "LOCKED (1/1 Edit Used)" : "1 Change Allowed After Submission"}
                  </span>
                </div>

                {[1, 2, 3].map((n) => {
                  const commKey = `pref${n}Committee`;
                  const countryKey = `pref${n}Country`;
                  const isIp = form[commKey] === "IP";
                  return (
                    <div key={n} className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                      <div className="space-y-1">
                        <label className="text-[11px] text-zinc-400">Committee Preference {n} *</label>
                        <select
                          required
                          disabled={prefsLocked}
                          value={form[commKey]}
                          onChange={(e) => setForm((p) => ({ ...p, [commKey]: e.target.value }))}
                          className="w-full h-10 px-3 rounded-md bg-black border border-[#262626] text-xs text-white focus:border-white focus:outline-none disabled:opacity-50"
                        >
                          {COMMITTEES.map((c) => (
                            <option key={c} value={c}>
                              {c}
                            </option>
                          ))}
                        </select>
                      </div>
                      <div className="space-y-1">
                        <label className="text-[11px] text-zinc-400">
                          {isIp ? `Preference ${n} Role (Reporter / Photographer) *` : `Preference ${n} Country / Portfolio (Top 2) *`}
                        </label>
                        <input
                          type="text"
                          required
                          disabled={prefsLocked}
                          value={form[countryKey]}
                          onChange={(e) => setForm((p) => ({ ...p, [countryKey]: e.target.value }))}
                          placeholder={isIp ? "Reporter or Photographer" : "e.g. USA / France"}
                          className="w-full h-10 px-3 rounded-md bg-black border border-[#262626] text-xs text-white focus:border-white focus:outline-none disabled:opacity-50"
                        />
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Lumen MUN Transaction Proof Upload */}
              <div className="border border-[#262626] bg-[#050505] rounded-md p-4 space-y-3">
                <div>
                  <span className="text-xs font-bold text-white uppercase tracking-wider block">
                    Lumen MUN Payment Transaction Proof *
                  </span>
                  <span className="text-[11px] text-zinc-400 block mt-0.5">
                    Upload the screenshot of your original Lumen MUN payment transaction for Secretariat approval.
                  </span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-[11px] text-zinc-400">Transaction Reference / UTR ID *</label>
                    <input
                      type="text"
                      required
                      value={form.paymentUtr}
                      onChange={(e) => setForm((p) => ({ ...p, paymentUtr: e.target.value }))}
                      placeholder="12-digit UPI UTR / Transaction ID"
                      className="w-full h-10 px-3 rounded-md bg-black border border-[#262626] text-xs text-white font-mono focus:border-white focus:outline-none"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[11px] text-zinc-400">Transaction Screenshot (JPG/PNG/PDF) *</label>
                    <label className="flex items-center justify-between gap-2 h-10 px-3 rounded-md bg-black border border-[#262626] hover:border-zinc-500 text-xs text-zinc-300 cursor-pointer">
                      <span className="truncate">
                        {uploadingProof
                          ? "Uploading proof..."
                          : proofFileName
                          ? `✓ ${proofFileName}`
                          : form.paymentScreenshotUrl
                          ? "✓ Screenshot Attached (Replace)"
                          : "Choose Screenshot File"}
                      </span>
                      <Upload className="w-3.5 h-3.5 text-zinc-400 shrink-0" />
                      <input
                        type="file"
                        accept="image/*,.pdf"
                        onChange={handleProofUpload}
                        className="hidden"
                      />
                    </label>
                  </div>
                </div>
              </div>

              {/* Liability Form & Terms Acknowledgment */}
              <div className="border border-[#262626] bg-[#050505] rounded-md p-3.5 space-y-2.5">
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2 text-xs font-semibold text-white">
                    <FileText className="w-4 h-4 text-zinc-400" />
                    <span>Liability Form &amp; Conference Code of Conduct</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <button
                      type="button"
                      onClick={() => setShowTermsModal(true)}
                      className="text-[11px] font-mono text-zinc-300 underline hover:text-white cursor-pointer"
                    >
                      Delegate Terms
                    </button>
                    <a
                      href={liabilityUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-[11px] font-mono text-white underline hover:text-zinc-300 flex items-center gap-1"
                    >
                      <Download className="w-3 h-3" />
                      <span>Liability Form</span>
                    </a>
                  </div>
                </div>
                <label className="flex items-start gap-2.5 text-xs text-zinc-400 cursor-pointer">
                  <input
                    type="checkbox"
                    required
                    checked={form.liabilityAccepted}
                    onChange={(e) => setForm((p) => ({ ...p, liabilityAccepted: e.target.checked }))}
                    className="mt-0.5 h-4 w-4 accent-white rounded cursor-pointer"
                  />
                  <span className="leading-relaxed">
                    I confirm that I am an official Lumen MUN delegate transferred to Resolve MUN 2.0 (26, 27 December 2026 at Northfield International School), understand that transportation is self-arranged, and agree to the{" "}
                    <button
                      type="button"
                      onClick={(e) => {
                        e.preventDefault();
                        setShowTermsModal(true);
                      }}
                      className="text-white underline hover:text-zinc-300 font-medium cursor-pointer"
                    >
                      Delegate Terms &amp; Conditions
                    </button>{" "}
                    and{" "}
                    <a
                      href={liabilityUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-white underline hover:text-zinc-300 font-medium"
                    >
                      Participant Liability Waiver &amp; Code of Conduct
                    </a>
                    .
                  </span>
                </label>
              </div>

              <button
                type="submit"
                disabled={saving || uploadingProof}
                className="w-full h-10 rounded-md bg-white text-black text-xs font-bold uppercase tracking-wider hover:bg-zinc-200 cursor-pointer disabled:opacity-50"
              >
                {saving ? "Submitting for Secretariat Approval..." : "Submit Lumen Transfer for Approval →"}
              </button>
            </form>
          </section>
        )}
      </main>

      {/* INLINE DELEGATE TERMS & CONDITIONS MODAL */}
      {showTermsModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-sm"
          onClick={() => setShowTermsModal(false)}
        >
          <div
            className="max-w-xl w-full max-h-[85vh] overflow-y-auto rounded-md border border-[#262626] bg-black p-5 sm:p-6 space-y-4 text-xs text-zinc-300"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-[#1f1f1f] pb-3">
              <div>
                <span className="text-[10px] font-mono uppercase tracking-widest text-zinc-500 block">
                  RESOLVE MUN 2.0 · LEGAL POLICIES
                </span>
                <h3 className="text-base font-bold text-white m-0 mt-0.5">
                  Delegate Terms &amp; Conditions
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setShowTermsModal(false)}
                className="h-7 px-2.5 rounded border border-[#262626] text-xs text-zinc-400 hover:text-white cursor-pointer"
              >
                Close
              </button>
            </div>

            <div className="space-y-3 leading-relaxed">
              <p className="m-0">
                <strong>1. Registration &amp; Eligibility:</strong> By registering for Resolve MUN 2.0 (26 &amp; 27 December 2026 at Northfield International School, Hyderabad), the delegate agrees to abide by all rules, regulations, and decisions of the Secretariat and Founders (Abhilash Vijayakumar, Niveditt Basrani, and Poorvika Setti). Delegates under 18 confirm parental consent.
              </p>
              <p className="m-0">
                <strong>2. Committee Allocation &amp; Conduct:</strong> Committee and portfolio allocations made by the Secretariat are final. Preference edits are permitted only once before allocation. Disrespectful, disruptive, or discriminatory conduct will result in immediate disqualification.
              </p>
              <p className="m-0">
                <strong>3. Technology &amp; Personal Belongings:</strong> Delegates are solely responsible for laptops, phones, chargers, and personal items brought to the venue. Unauthorized AI usage or tampering with venue tech/AV equipment is prohibited.
              </p>
              <p className="m-0">
                <strong>4. Transportation &amp; Bus Pass:</strong> Official bus boarding requires an active Transport Pass verified by the Bus QR Scanner. Transferred Lumen MUN delegates and Self-Commute delegates arrange their own transportation.
              </p>
              <p className="m-0">
                <strong>5. Prohibited Items &amp; Venue Property:</strong> Vapes, e-cigarettes, alcohol, tobacco, narcotics, lighters, and sharp objects are strictly forbidden and carry immediate expulsion and fines. Delegates are financially liable for any damage caused to venue property.
              </p>
            </div>

            <div className="pt-3 border-t border-[#1f1f1f] flex items-center justify-between gap-2">
              <a
                href={liabilityUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs font-mono text-white underline hover:text-zinc-300"
              >
                Open Printable Liability Waiver &amp; Code of Conduct →
              </a>
              <button
                type="button"
                onClick={() => setShowTermsModal(false)}
                className="h-8 px-4 rounded-md bg-white text-black text-xs font-bold uppercase cursor-pointer"
              >
                I Understand
              </button>
            </div>
          </div>
        </div>
      )}

      <Footer />
    </div>
  );
}
