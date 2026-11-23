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
import { uploadFileToSupabase } from "@/lib/supabase";
import Footer from "@/components/Footer";
import {
  CheckCircle2,
  RefreshCw,
  ArrowRight,
  LogOut,
  Pencil,
  ShieldCheck,
  Upload,
  Clock,
} from "lucide-react";

const OC_FEE_PLANS = [
  "₹1,500 — Full Plan (Transport + T-Shirt + Meals)",
  "₹1,000 — No Transport (T-Shirt + Meals)",
  "₹750 — Basic Plan (ID + Meals)",
  "Pay Later / Exempt",
];

const OC_DEPARTMENTS = [
  "Delegate Affairs",
  "Hospitality",
  "Logistics & Operations",
  "Marketing & PR",
  "Design & Media",
  "Security",
  "Sponsorship & Finance",
  "Photography & Press",
];

export default function OcOnboardingPortalPage() {
  const [user, setUser] = useState(null);
  const [authReady, setAuthReady] = useState(false);
  const [googleBusy, setGoogleBusy] = useState(false);
  const [loading, setLoading] = useState(true);
  const [ocMember, setOcMember] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [feedback, setFeedback] = useState({ type: "", text: "" });
  const [uploadingProof, setUploadingProof] = useState(false);
  const [proofFileName, setProofFileName] = useState("");
  const [proofBase64, setProofBase64] = useState("");

  const [form, setForm] = useState({
    fullName: "",
    phone: "",
    emergencyName: "",
    emergencyPhone: "",
    school: "",
    grade: "",
    dob: "",
    department: "Delegate Affairs",
    feeTier: OC_FEE_PLANS[0],
    transport: "Yes",
    address: "",
    instagram: "",
    paymentUtr: "",
    paymentScreenshotUrl: "",
  });

  const fetchOcProfile = async (email) => {
    if (!email) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/referrals/?ocEmail=${encodeURIComponent(email)}`);
      const json = await res.json();
      if (json?.found && json.ocMember) {
        setOcMember(json.ocMember);
        setForm({
          fullName: json.ocMember.fullName || user?.displayName || "",
          phone: json.ocMember.phone || "",
          emergencyName: json.ocMember.emergencyName || "",
          emergencyPhone: json.ocMember.emergencyPhone || "",
          school: json.ocMember.school || "",
          grade: json.ocMember.grade || "",
          dob: json.ocMember.dob || "",
          department: json.ocMember.department || "Delegate Affairs",
          feeTier: json.ocMember.feeTier || OC_FEE_PLANS[0],
          transport: json.ocMember.transport || "No",
          address: json.ocMember.address || "",
          instagram: json.ocMember.instagram || "",
          paymentUtr: json.ocMember.paymentUtr === "OC-CONFIRMED" ? "" : json.ocMember.paymentUtr || "",
          paymentScreenshotUrl: json.ocMember.paymentScreenshotUrl || "",
        });
      } else {
        setOcMember(null);
        setForm((prev) => ({
          ...prev,
          fullName: prev.fullName || user?.displayName || "",
        }));
      }
    } catch (_) {
      setFeedback({ type: "error", text: "Could not load OC record." });
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
        fetchOcProfile(u.email);
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
      setFeedback({ type: "error", text: "Payment screenshot must be under 8MB." });
      return;
    }
    setUploadingProof(true);
    setProofFileName(file.name);
    setFeedback({ type: "", text: "" });
    try {
      const reader = new FileReader();
      reader.onload = () => setProofBase64(String(reader.result || ""));
      reader.readAsDataURL(file);
      const uploaded = await uploadFileToSupabase(file, "oc-payments", "OC_PAY");
      if (uploaded) {
        setForm((p) => ({ ...p, paymentScreenshotUrl: uploaded }));
      }
    } catch (_) {
    } finally {
      setUploadingProof(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!user?.email) return;
    const cleanPhone = String(form.phone || "").replace(/\D/g, "").slice(-10);
    const cleanEmg = String(form.emergencyPhone || "").replace(/\D/g, "").slice(-10);
    if (!/^[6-9]\d{9}$/.test(cleanPhone)) {
      setFeedback({ type: "error", text: "Please enter a valid 10-digit WhatsApp mobile number." });
      return;
    }
    if (cleanEmg && cleanEmg === cleanPhone) {
      setFeedback({ type: "error", text: "Parent / Emergency number cannot be the same as your own phone number." });
      return;
    }
    const isPayLater = String(form.feeTier || "").toLowerCase().includes("later");
    if (!isPayLater && !form.paymentScreenshotUrl && !proofBase64) {
      setFeedback({ type: "error", text: "Please upload your payment transaction screenshot for your selected OC plan." });
      return;
    }
    setSaving(true);
    setFeedback({ type: "", text: "" });
    try {
      const res = await fetch("/api/referrals/", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "COMPLETE_OC_ONBOARDING",
          email: user.email,
          ...form,
          paymentScreenshotBase64: proofBase64 || "",
          screenshotName: proofFileName || "OC_Payment_Proof.png",
        }),
      });
      const json = await res.json();
      if (!res.ok || !json.success) {
        setFeedback({ type: "error", text: json.message || "Failed to save OC details." });
      } else {
        setFeedback({ type: "success", text: json.message });
        setIsEditing(false);
        await fetchOcProfile(user.email);
      }
    } catch (_) {
      setFeedback({ type: "error", text: "Network error while saving OC details." });
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
            Loading OC Portal...
          </p>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white font-sans flex flex-col justify-between selection:bg-white selection:text-black">
      {topBar}

      <main className="flex-1 max-w-2xl w-full mx-auto px-4 sm:px-6 py-8 sm:py-12 space-y-6">
        {/* RESOLVE SIGNATURE EYEBROW & TITLE */}
        <div className="text-center space-y-2">
          <div className="flex items-center justify-center gap-2.5">
            <span className="h-px w-8 bg-gradient-to-r from-transparent to-[#7c3aed]" />
            <span className="text-[10px] font-mono uppercase tracking-[0.22em] text-zinc-400 font-semibold">
              GOOGLE FORMS OC ONBOARDING · OFFICIAL ROSTER
            </span>
            <span className="h-px w-8 bg-gradient-to-l from-transparent to-[#7c3aed]" />
          </div>
          <h1 className="m-0 text-2xl sm:text-3xl font-bold tracking-tight text-white">
            Resolve MUN 2.0 — OC Database Onboarding
          </h1>
          <p className="m-0 text-xs sm:text-sm text-zinc-400 max-w-md mx-auto leading-relaxed">
            For Organizing Committee members who registered via Google Forms · 26, 27 December 2026 · Northfield International School
          </p>
        </div>

        {!user ? (
          /* STEP 1: SIGN IN RIGHT ON THIS PAGE */
          <section className="border border-[#262626] bg-black rounded-md p-6 sm:p-8 text-center space-y-5">
            <div className="w-11 h-11 rounded-md border border-[#262626] mx-auto flex items-center justify-center">
              <ShieldCheck className="w-5 h-5 text-white" />
            </div>
            <div className="space-y-1.5">
              <h2 className="m-0 text-lg font-bold text-white">
                Sign In to Register Your OC Profile
              </h2>
              <p className="m-0 text-xs text-zinc-400 max-w-sm mx-auto leading-relaxed">
                Sign in with your Google account to enter your Organizing Committee details and department into the official Resolve MUN 2.0 database.
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
        ) : ocMember && !isEditing ? (
          /* STEP 3: CONFIRMED OC CREDENTIAL SUMMARY CARD */
          <section className="border border-[#262626] bg-black rounded-md p-5 sm:p-6 space-y-5">
            <div className="flex items-start justify-between gap-3 border-b border-[#1f1f1f] pb-4">
              <div>
                <div className="flex items-center gap-2">
                  {ocMember.status === "Approved" || ocMember.status === "Accepted" ? (
                    <span className="inline-flex items-center gap-1.5 text-xs font-mono text-emerald-400 font-semibold">
                      <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
                      Approved OC
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1.5 text-xs font-mono text-amber-400 font-semibold">
                      <span className="h-1.5 w-1.5 rounded-full bg-amber-400" />
                      Pending Secretariat Approval
                    </span>
                  )}
                  <span className="text-xs font-mono text-zinc-500">
                    · {ocMember.appId}
                  </span>
                </div>
                <h2 className="m-0 text-xl font-bold text-white mt-2">
                  {ocMember.fullName}
                </h2>
                <p className="m-0 text-xs text-zinc-400 mt-0.5">
                  {ocMember.email} · {ocMember.phone}
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

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-px bg-[#1f1f1f] border border-[#1f1f1f] rounded-md overflow-hidden">
              <div className="bg-black p-3">
                <span className="block text-[10px] font-mono uppercase text-zinc-500">Department</span>
                <span className="block text-xs font-semibold text-white mt-1">{ocMember.department}</span>
              </div>
              <div className="bg-black p-3">
                <span className="block text-[10px] font-mono uppercase text-zinc-500">Institution</span>
                <span className="block text-xs font-semibold text-white mt-1 truncate">{ocMember.school || "—"}</span>
              </div>
              <div className="bg-black p-3">
                <span className="block text-[10px] font-mono uppercase text-zinc-500">Grade / DOB</span>
                <span className="block text-xs font-semibold text-white mt-1">{ocMember.grade || "—"} · {ocMember.dob || "—"}</span>
              </div>
              <div className="bg-black p-3">
                <span className="block text-[10px] font-mono uppercase text-zinc-500">Transport</span>
                <span className="block text-xs font-semibold text-white mt-1">{ocMember.transport}</span>
              </div>
              <div className="bg-black p-3">
                <span className="block text-[10px] font-mono uppercase text-zinc-500">Selected OC Plan</span>
                <span className="block text-xs font-semibold text-white mt-1 truncate">{ocMember.feeTier || "Standard OC"}</span>
              </div>
              <div className="bg-black p-3">
                <span className="block text-[10px] font-mono uppercase text-zinc-500">Status</span>
                <span className="block text-xs font-semibold text-white mt-1">{ocMember.status || "Pending Approval"}</span>
              </div>
            </div>

            {ocMember.status !== "Approved" && ocMember.status !== "Accepted" && (
              <div className="p-3.5 rounded-md border border-amber-500/30 bg-amber-500/5 flex items-start gap-2.5 text-xs text-amber-200">
                <Clock className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                <div>
                  <strong className="text-white block">Awaiting Admin Approval</strong>
                  <span className="text-zinc-400">
                    Your OC profile, chosen fee plan, and payment proof have been received. Once approved by the Secretariat, your official OC pass will be activated.
                  </span>
                </div>
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-1">
              <Link
                href="/dashboard"
                className="h-10 rounded-md bg-white text-black text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-1.5"
              >
                <span>Open Digital Pass</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
              <a
                href="/liability"
                target="_blank"
                rel="noopener noreferrer"
                className="h-10 rounded-md border border-[#262626] bg-black text-white text-xs font-semibold flex items-center justify-center gap-1.5 hover:bg-white/[0.04]"
              >
                <span>Download Liability Form</span>
              </a>
            </div>
          </section>
        ) : (
          /* STEP 2: EXISTING OC SELF-ONBOARDING FORM */
          <section className="border border-[#262626] bg-black rounded-md p-5 sm:p-6 space-y-5">
            <div className="flex items-center justify-between gap-2 border-b border-[#1f1f1f] pb-3.5">
              <div>
                <span className="block text-[10px] font-mono uppercase tracking-widest text-zinc-500">
                  Signed in as {user.email}
                </span>
                <h2 className="m-0 text-base sm:text-lg font-bold text-white mt-0.5">
                  Enter Your OC Details
                </h2>
              </div>
              {ocMember && (
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

            <form onSubmit={handleSubmit} className="space-y-3.5">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-[11px] text-zinc-400">Full Name *</label>
                  <input
                    type="text"
                    required
                    value={form.fullName}
                    onChange={(e) => setForm((p) => ({ ...p, fullName: e.target.value }))}
                    placeholder="Your full name"
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
                    className="w-full h-10 px-3 rounded-md bg-black border border-[#262626] text-xs text-white focus:border-white focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-[11px] text-zinc-400">Allotted OC Department *</label>
                  <select
                    required
                    value={form.department}
                    onChange={(e) => setForm((p) => ({ ...p, department: e.target.value }))}
                    className="w-full h-10 px-3 rounded-md bg-black border border-[#262626] text-xs text-white focus:border-white focus:outline-none"
                  >
                    {OC_DEPARTMENTS.map((dept) => (
                      <option key={dept} value={dept}>
                        {dept}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="space-y-1">
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
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="space-y-1">
                  <label className="text-[11px] text-zinc-400">Grade / Year *</label>
                  <input
                    type="text"
                    required
                    value={form.grade}
                    onChange={(e) => setForm((p) => ({ ...p, grade: e.target.value }))}
                    placeholder="e.g. Grade 11 / 2nd Yr"
                    className="w-full h-10 px-3 rounded-md bg-black border border-[#262626] text-xs text-white focus:border-white focus:outline-none"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[11px] text-zinc-400">Date of Birth *</label>
                  <input
                    type="date"
                    required
                    value={form.dob}
                    onChange={(e) => setForm((p) => ({ ...p, dob: e.target.value }))}
                    className="w-full h-10 px-3 rounded-md bg-black border border-[#262626] text-xs text-white focus:border-white focus:outline-none"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[11px] text-zinc-400">Transport Required? *</label>
                  <select
                    value={form.transport}
                    onChange={(e) => setForm((p) => ({ ...p, transport: e.target.value }))}
                    className="w-full h-10 px-3 rounded-md bg-black border border-[#262626] text-xs text-white focus:border-white focus:outline-none"
                  >
                    <option value="No">No — Self Commute</option>
                    <option value="Yes">Yes — Transport Needed</option>
                  </select>
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[11px] text-zinc-400">Full Residential Address *</label>
                <input
                  type="text"
                  required
                  value={form.address}
                  onChange={(e) => setForm((p) => ({ ...p, address: e.target.value }))}
                  placeholder="House/Flat No., Street, Area, Hyderabad, Pincode"
                  className="w-full h-10 px-3 rounded-md bg-black border border-[#262626] text-xs text-white focus:border-white focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-[11px] text-zinc-400">Parent / Guardian Full Name *</label>
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
                  <label className="text-[11px] text-zinc-400">Parent / Emergency Phone *</label>
                  <input
                    type="tel"
                    required
                    value={form.emergencyPhone}
                    onChange={(e) => setForm((p) => ({ ...p, emergencyPhone: e.target.value }))}
                    placeholder="Must differ from your phone"
                    className="w-full h-10 px-3 rounded-md bg-black border border-[#262626] text-xs text-white font-mono focus:border-white focus:outline-none"
                  />
                </div>
              </div>

              {/* OC Fee Plan & Payment Proof */}
              <div className="border border-[#262626] bg-[#050505] rounded-md p-4 space-y-3">
                <div className="space-y-1">
                  <label className="text-[11px] text-zinc-400 font-semibold">OC Fee Plan Chosen *</label>
                  <select
                    required
                    value={form.feeTier}
                    onChange={(e) => {
                      const val = e.target.value;
                      setForm((p) => ({
                        ...p,
                        feeTier: val,
                        transport: val.includes("1,500") ? "Yes" : val.includes("1,000") || val.includes("750") ? "No" : p.transport,
                      }));
                    }}
                    className="w-full h-10 px-3 rounded-md bg-black border border-[#262626] text-xs text-white focus:border-white focus:outline-none"
                  >
                    {OC_FEE_PLANS.map((plan) => (
                      <option key={plan} value={plan}>
                        {plan}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-[11px] text-zinc-400">UPI UTR / Transaction Reference</label>
                    <input
                      type="text"
                      value={form.paymentUtr}
                      onChange={(e) => setForm((p) => ({ ...p, paymentUtr: e.target.value }))}
                      placeholder="12-digit UTR (if paid)"
                      className="w-full h-10 px-3 rounded-md bg-black border border-[#262626] text-xs text-white font-mono focus:border-white focus:outline-none"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[11px] text-zinc-400">Payment Screenshot (JPG/PNG/PDF)</label>
                    <label className="flex items-center justify-between gap-2 h-10 px-3 rounded-md bg-black border border-[#262626] hover:border-zinc-500 text-xs text-zinc-300 cursor-pointer">
                      <span className="truncate">
                        {uploadingProof
                          ? "Uploading proof..."
                          : proofFileName
                          ? `✓ ${proofFileName}`
                          : form.paymentScreenshotUrl
                          ? "✓ Screenshot Attached (Replace)"
                          : "Upload Transaction Screenshot"}
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

              <div className="space-y-1">
                <label className="text-[11px] text-zinc-400">Instagram Handle</label>
                <input
                  type="text"
                  value={form.instagram}
                  onChange={(e) => setForm((p) => ({ ...p, instagram: e.target.value }))}
                  placeholder="@handle"
                  className="w-full h-10 px-3 rounded-md bg-black border border-[#262626] text-xs text-white focus:border-white focus:outline-none"
                />
              </div>

              <div className="border border-[#262626] bg-[#050505] rounded-md p-3.5 space-y-2">
                <div className="flex items-center justify-between gap-2 text-xs">
                  <span className="font-semibold text-white">OC Liability &amp; Code of Conduct Waiver</span>
                  <a
                    href="/liability"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="font-mono text-[11px] text-white underline hover:text-zinc-300"
                  >
                    Open Liability Form
                  </a>
                </div>
                <label className="flex items-start gap-2.5 text-xs text-zinc-400 cursor-pointer">
                  <input
                    type="checkbox"
                    required
                    defaultChecked
                    className="mt-0.5 h-4 w-4 accent-white rounded cursor-pointer"
                  />
                  <span>
                    I confirm my Organizing Committee details from my Google Forms registration and agree to the{" "}
                    <a
                      href="/?open=terms"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-white underline hover:text-zinc-300 font-medium"
                    >
                      Resolve MUN 2.0 OC Terms &amp; Conditions
                    </a>{" "}
                    and{" "}
                    <a
                      href="/liability"
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
                disabled={saving}
                className="w-full h-10 rounded-md bg-white text-black text-xs font-bold uppercase tracking-wider hover:bg-zinc-200 cursor-pointer disabled:opacity-50 mt-2"
              >
                {saving ? "Saving to Database..." : "Save My OC Profile →"}
              </button>
            </form>
          </section>
        )}
      </main>

      <Footer />
    </div>
  );
}
