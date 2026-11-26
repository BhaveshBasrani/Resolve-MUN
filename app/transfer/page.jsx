"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { auth, onAuthStateChanged } from "@/lib/firebase";
import Footer from "@/components/Footer";
import {
  ArrowRightLeft,
  AlertTriangle,
  CheckCircle2,
  ShieldAlert,
  FileText,
  Clock,
  ArrowRight,
} from "lucide-react";

const REGISTRATION_MODES = [
  {
    id: "Individual Delegate (Resolve MUN)",
    title: "Individual Delegate",
    subtitle: "Registered directly on resolvemun.in (₹2,500 or Referral code)",
    badge: "Standard Pass",
    note: "Eligible for full allocation transfer upon Secretariat approval. Transport option (if opted) is reviewed during approval.",
  },
  {
    id: "Acquired Lumen MUN Delegate",
    title: "Acquired Lumen MUN Delegate",
    subtitle: "Transferred from Lumen MUN (RM-LMN-...)",
    badge: "No Transport · Special Terms",
    note: "IMPORTANT: Lumen MUN transfer passes do NOT include bus transport and cannot be upgraded to transport upon transfer. Original Lumen transaction proof must already be verified.",
  },
  {
    id: "School / Institutional Delegation (15+)",
    title: "School / Institutional Delegation",
    subtitle: "Part of a 15+ school or college contingent",
    badge: "Advisor Sign-off Required",
    note: "Requires written confirmation from your Faculty Advisor or Head Delegate before the Secretariat can reassign the contingent seat.",
  },
  {
    id: "Organizing Committee (OC)",
    title: "Organizing Committee (OC)",
    subtitle: "OC Pass (₹1,500 / ₹1,000 / ₹750)",
    badge: "Dept. Head Clearance",
    note: "OC transfers are strictly subject to Department Head interview & Secretariat clearance. OC fee plans remain non-refundable.",
  },
];

const COMMITTEES = ["UNCSW", "UNHRC", "DISEC", "IP", "Lok Sabha", "Marvel"];

export default function AllocationTransferPage() {
  const [user, setUser] = useState(null);
  const [myRequests, setMyRequests] = useState([]);
  const [submitting, setSubmitting] = useState(false);
  const [feedback, setFeedback] = useState({ type: "", text: "" });
  const [submittedId, setSubmittedId] = useState("");

  const [form, setForm] = useState({
    registrationMode: REGISTRATION_MODES[0].id,
    sellerName: "",
    sellerEmail: "",
    sellerPhone: "",
    sellerRegId: "",
    currentAllocation: "",
    transferReason: "",
    agreedAmount: "",
    buyerName: "",
    buyerEmail: "",
    buyerPhone: "",
    buyerEmergencyName: "",
    buyerEmergencyPhone: "",
    buyerSchool: "",
    buyerGrade: "",
    buyerDob: "",
    buyerAddress: "",
    buyerTransport: "No",
    buyerPref1: "DISEC",
    buyerPref2: "UNHRC",
    buyerPref3: "Lok Sabha",
    acceptPolicy: false,
  });

  const isLumen = form.registrationMode.toLowerCase().includes("lumen");
  const selectedModeObj =
    REGISTRATION_MODES.find((m) => m.id === form.registrationMode) || REGISTRATION_MODES[0];

  const loadExistingRequests = async (email) => {
    if (!email) return;
    try {
      const res = await fetch(`/api/transfer?email=${encodeURIComponent(email)}`, { cache: "no-store" });
      const json = await res.json();
      if (json?.success && Array.isArray(json.transfers)) {
        setMyRequests(json.transfers);
      }
    } catch (_) {}
  };

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (u) => {
      setUser(u || null);
      if (u?.email) {
        setForm((prev) => ({
          ...prev,
          sellerName: prev.sellerName || u.displayName || "",
          sellerEmail: prev.sellerEmail || u.email || "",
        }));
        loadExistingRequests(u.email);
      }
    });
    return () => unsub();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFeedback({ type: "", text: "" });

    if (!form.acceptPolicy) {
      setFeedback({ type: "error", text: "You must accept the Mandatory Pre-Approval & No-Refund Declaration before submitting." });
      return;
    }

    const cleanBuyerPh = String(form.buyerPhone || "").replace(/\D/g, "").slice(-10);
    const cleanBuyerEmg = String(form.buyerEmergencyPhone || "").replace(/\D/g, "").slice(-10);
    if (!/^[6-9]\d{9}$/.test(cleanBuyerPh) || !/^[6-9]\d{9}$/.test(cleanBuyerEmg)) {
      setFeedback({ type: "error", text: "Please enter valid 10-digit Indian mobile numbers for the incoming delegate and their parent/guardian." });
      return;
    }
    if (cleanBuyerPh === cleanBuyerEmg) {
      setFeedback({ type: "error", text: "Incoming delegate Parent / Emergency phone cannot be the same as their own phone number." });
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch("/api/transfer", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          buyerTransport: isLumen ? "No (Lumen Policy — No Transport)" : form.buyerTransport,
        }),
      });
      const json = await res.json();
      if (!res.ok || !json.success) {
        setFeedback({ type: "error", text: json.message || "Could not submit transfer request." });
      } else {
        setSubmittedId(json.requestId || "RM-TRF");
        setFeedback({ type: "success", text: json.message });
        loadExistingRequests(form.sellerEmail);
      }
    } catch (_) {
      setFeedback({ type: "error", text: "Network error while submitting transfer application." });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-black text-white font-sans flex flex-col justify-between antialiased selection:bg-white selection:text-black">
      {/* Resend-Style Minimal Header */}
      <header className="sticky top-0 z-40 h-14 border-b border-[#1c1c20] bg-black/90 backdrop-blur-md">
        <div className="max-w-3xl h-full mx-auto px-4 sm:px-6 flex items-center justify-between gap-3">
          <Link href="/" className="flex items-center gap-2 !no-underline shrink-0">
            <img src="/images/Logo.svg" alt="Resolve MUN" className="w-5 h-5 object-contain" />
            <span
              className="text-base tracking-[0.12em] text-white font-bold pt-0.5"
              style={{ fontFamily: "'Bebas Neue', sans-serif" }}
            >
              RESOLVE MUN 2.0
            </span>
            <span className="text-zinc-600 text-xs hidden sm:inline">/</span>
            <span className="text-zinc-400 text-xs font-medium hidden sm:inline">Allocation Transfer</span>
          </Link>
          <div className="flex items-center gap-2">
            <Link
              href="/terms?tab=refunds"
              className="h-8 px-3 rounded-md border border-[#222226] bg-[#0a0a0c] text-xs text-zinc-300 hover:text-white flex items-center gap-1.5 transition"
            >
              <FileText className="w-3.5 h-3.5" />
              <span>Refund &amp; Transfer Policy</span>
            </Link>
          </div>
        </div>
      </header>

      <main className="flex-1 max-w-3xl w-full mx-auto px-4 sm:px-6 py-10 sm:py-12 space-y-7">
        {/* Title */}
        <div className="space-y-2">
          <span className="inline-flex items-center gap-2 text-[11px] font-mono uppercase tracking-[0.18em] text-zinc-500">
            <ArrowRightLeft className="w-3.5 h-3.5 text-zinc-400" />
            MANDATORY PRE-APPROVAL APPLICATION · RESOLVE MUN 2.0
          </span>
          <h1 className="m-0 text-2xl sm:text-3xl font-semibold tracking-tight text-white">
            Allocation Transfer &amp; Resale Request
          </h1>
          <p className="m-0 text-xs sm:text-[13px] text-zinc-400 leading-relaxed">
            Every Resolve MUN 2.0 registration is strictly non-refundable. If you cannot attend and wish to transfer or sell your allocation to another student, you <strong className="text-white">MUST</strong> submit this application and receive written Secretariat approval <strong className="text-white">BEFORE</strong> finalizing any handover.
          </p>
        </div>

        {/* Strict Warning Callout */}
        <div className="rounded-lg border border-amber-500/25 bg-amber-500/[0.04] p-4 flex items-start gap-3">
          <ShieldAlert className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
          <div className="text-xs text-zinc-300 leading-relaxed space-y-1">
            <strong className="text-white block">Do NOT exchange money before Secretariat approval</strong>
            <span>
              Unauthorized private resales or name-swaps automatically void both the seller&apos;s and buyer&apos;s pass at the gate with zero refund. Submit at least 72 hours before Day 1 (by 23 Dec 2026).
            </span>
          </div>
        </div>

        {/* Existing Requests Status (if signed in) */}
        {myRequests.length > 0 && (
          <section className="rounded-lg border border-[#1c1c20] bg-[#08080a] p-5 space-y-3">
            <span className="block text-[10px] font-mono uppercase tracking-widest text-zinc-500">
              Your Transfer Applications ({myRequests.length})
            </span>
            <div className="divide-y divide-[#16161a]">
              {myRequests.map((req) => (
                <div key={req.id} className="py-2.5 flex flex-wrap items-center justify-between gap-2 text-xs">
                  <div>
                    <span className="font-mono font-semibold text-white">{req.request_id}</span>
                    <span className="text-zinc-500 ml-2">
                      {req.seller_reg_id} ({req.registration_mode}) → {req.buyer_name}
                    </span>
                  </div>
                  <span
                    className={`font-mono text-[11px] font-medium ${
                      req.status === "Approved"
                        ? "text-emerald-400"
                        : req.status === "Rejected"
                        ? "text-red-400"
                        : "text-amber-400"
                    }`}
                  >
                    ● {req.status}
                  </span>
                </div>
              ))}
            </div>
          </section>
        )}

        {submittedId ? (
          /* Clean Confirmation Screen */
          <section className="rounded-lg border border-emerald-500/30 bg-[#050806] p-6 sm:p-8 text-center space-y-4">
            <div className="w-11 h-11 rounded-full bg-emerald-500/10 border border-emerald-500/30 mx-auto flex items-center justify-center">
              <CheckCircle2 className="w-5 h-5 text-emerald-400" />
            </div>
            <div className="space-y-1.5">
              <span className="block text-[11px] font-mono uppercase tracking-widest text-emerald-400">
                Request Logged · {submittedId}
              </span>
              <h2 className="m-0 text-xl font-semibold text-white">
                Transfer Application Pending Approval
              </h2>
              <p className="m-0 text-xs text-zinc-400 max-w-md mx-auto leading-relaxed">
                Confirmation emails have been dispatched to both <strong className="text-white">{form.sellerEmail}</strong> and <strong className="text-white">{form.buyerEmail}</strong> (CC: resolve.mun@gmail.com). Please wait for official written approval from the Secretariat before completing any private settlement.
              </p>
            </div>
            <div className="flex flex-wrap items-center justify-center gap-2.5 pt-2">
              <Link
                href="/dashboard"
                className="h-9 px-4 rounded-md bg-white text-black text-xs font-semibold hover:bg-zinc-200 inline-flex items-center gap-1.5"
              >
                <span>Back to Dashboard</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
              <Link
                href="/terms?tab=refunds"
                className="h-9 px-4 rounded-md border border-[#222226] bg-[#0a0a0c] text-xs text-zinc-300 hover:text-white inline-flex items-center gap-1.5"
              >
                <span>Read Transfer Policy</span>
              </Link>
            </div>
          </section>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-6">
            {feedback.text && (
              <div
                className={`p-3.5 rounded-lg border text-xs ${
                  feedback.type === "error"
                    ? "border-red-500/40 bg-red-500/10 text-red-300"
                    : "border-emerald-500/40 bg-emerald-500/10 text-emerald-300"
                }`}
              >
                {feedback.text}
              </div>
            )}

            {/* SECTION 1: MODE OF REGISTRATION */}
            <section className="rounded-lg border border-[#1c1c20] bg-[#060608] p-5 sm:p-6 space-y-4">
              <div className="border-b border-[#16161a] pb-3">
                <span className="block text-[10px] font-mono uppercase tracking-widest text-zinc-500">
                  Step 01 · Registration Category
                </span>
                <h2 className="m-0 text-sm font-semibold text-white mt-0.5">
                  Select Your Original Mode of Registration
                </h2>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {REGISTRATION_MODES.map((m) => {
                  const active = form.registrationMode === m.id;
                  return (
                    <button
                      key={m.id}
                      type="button"
                      onClick={() =>
                        setForm((p) => ({
                          ...p,
                          registrationMode: m.id,
                          buyerTransport: m.id.toLowerCase().includes("lumen") ? "No" : p.buyerTransport,
                        }))
                      }
                      className={`p-3.5 rounded-lg border text-left transition cursor-pointer ${
                        active
                          ? "border-white bg-[#121216]"
                          : "border-[#1f1f24] bg-black hover:border-zinc-700"
                      }`}
                    >
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-xs font-semibold text-white">{m.title}</span>
                        <span className="text-[10px] font-mono text-zinc-400">{m.badge}</span>
                      </div>
                      <span className="block text-[11px] text-zinc-500 mt-1">{m.subtitle}</span>
                    </button>
                  );
                })}
              </div>

              {/* Dynamic Mode-Specific Policy Notice */}
              <div
                className={`rounded-md border p-3.5 text-xs leading-relaxed flex items-start gap-2.5 ${
                  isLumen
                    ? "border-amber-500/35 bg-amber-500/[0.06] text-amber-200"
                    : "border-[#1f1f24] bg-black text-zinc-400"
                }`}
              >
                {isLumen ? (
                  <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                ) : (
                  <Clock className="w-4 h-4 text-zinc-500 shrink-0 mt-0.5" />
                )}
                <span>{selectedModeObj.note}</span>
              </div>
            </section>

            {/* SECTION 2: CURRENT PASS HOLDER (SELLER) */}
            <section className="rounded-lg border border-[#1c1c20] bg-[#060608] p-5 sm:p-6 space-y-4">
              <div className="border-b border-[#16161a] pb-3">
                <span className="block text-[10px] font-mono uppercase tracking-widest text-zinc-500">
                  Step 02 · Current Pass Holder (Seller)
                </span>
                <h2 className="m-0 text-sm font-semibold text-white mt-0.5">
                  Original Registrant Details
                </h2>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div className="space-y-1">
                  <label className="text-[11px] text-zinc-400">Your Full Name *</label>
                  <input
                    type="text"
                    required
                    value={form.sellerName}
                    onChange={(e) => setForm((p) => ({ ...p, sellerName: e.target.value }))}
                    placeholder="Current registered name"
                    className="w-full h-9 px-3 rounded-md bg-black border border-[#222226] text-xs text-white focus:border-white focus:outline-none"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[11px] text-zinc-400">Your Registered Email *</label>
                  <input
                    type="email"
                    required
                    value={form.sellerEmail}
                    onChange={(e) => setForm((p) => ({ ...p, sellerEmail: e.target.value }))}
                    placeholder="you@example.com"
                    className="w-full h-9 px-3 rounded-md bg-black border border-[#222226] text-xs text-white focus:border-white focus:outline-none"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[11px] text-zinc-400">Your WhatsApp Phone *</label>
                  <input
                    type="tel"
                    required
                    value={form.sellerPhone}
                    onChange={(e) => setForm((p) => ({ ...p, sellerPhone: e.target.value }))}
                    placeholder="10-digit mobile number"
                    className="w-full h-9 px-3 rounded-md bg-black border border-[#222226] text-xs text-white font-mono focus:border-white focus:outline-none"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[11px] text-zinc-400">Your Registration ID *</label>
                  <input
                    type="text"
                    required
                    value={form.sellerRegId}
                    onChange={(e) => setForm((p) => ({ ...p, sellerRegId: e.target.value.toUpperCase() }))}
                    placeholder={isLumen ? "e.g. RM-LMN-4821" : "e.g. RM-4821"}
                    className="w-full h-9 px-3 rounded-md bg-black border border-[#222226] text-xs text-white font-mono uppercase focus:border-white focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div className="space-y-1">
                  <label className="text-[11px] text-zinc-400">Current Allotted Committee / Portfolio (if allotted)</label>
                  <input
                    type="text"
                    value={form.currentAllocation}
                    onChange={(e) => setForm((p) => ({ ...p, currentAllocation: e.target.value }))}
                    placeholder="e.g. DISEC — USA (or Pending)"
                    className="w-full h-9 px-3 rounded-md bg-black border border-[#222226] text-xs text-white focus:border-white focus:outline-none"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[11px] text-zinc-400">Proposed Private Settlement Amount (Optional)</label>
                  <input
                    type="text"
                    value={form.agreedAmount}
                    onChange={(e) => setForm((p) => ({ ...p, agreedAmount: e.target.value }))}
                    placeholder="e.g. ₹2,200 (Cannot exceed original fee)"
                    className="w-full h-9 px-3 rounded-md bg-black border border-[#222226] text-xs text-white focus:border-white focus:outline-none"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[11px] text-zinc-400">Reason for Requesting Allocation Transfer *</label>
                <textarea
                  required
                  rows={2}
                  value={form.transferReason}
                  onChange={(e) => setForm((p) => ({ ...p, transferReason: e.target.value }))}
                  placeholder="Briefly explain why you are unable to attend Resolve MUN 2.0..."
                  className="w-full p-3 rounded-md bg-black border border-[#222226] text-xs text-white focus:border-white focus:outline-none resize-none"
                />
              </div>
            </section>

            {/* SECTION 3: INCOMING DELEGATE (BUYER) */}
            <section className="rounded-lg border border-[#1c1c20] bg-[#060608] p-5 sm:p-6 space-y-4">
              <div className="border-b border-[#16161a] pb-3">
                <span className="block text-[10px] font-mono uppercase tracking-widest text-zinc-500">
                  Step 03 · Incoming Delegate (Buyer / Recipient)
                </span>
                <h2 className="m-0 text-sm font-semibold text-white mt-0.5">
                  New Participant Details
                </h2>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div className="space-y-1">
                  <label className="text-[11px] text-zinc-400">Incoming Delegate Full Name *</label>
                  <input
                    type="text"
                    required
                    value={form.buyerName}
                    onChange={(e) => setForm((p) => ({ ...p, buyerName: e.target.value }))}
                    placeholder="Full legal name"
                    className="w-full h-9 px-3 rounded-md bg-black border border-[#222226] text-xs text-white focus:border-white focus:outline-none"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[11px] text-zinc-400">Incoming Delegate Email *</label>
                  <input
                    type="email"
                    required
                    value={form.buyerEmail}
                    onChange={(e) => setForm((p) => ({ ...p, buyerEmail: e.target.value }))}
                    placeholder="buyer@example.com"
                    className="w-full h-9 px-3 rounded-md bg-black border border-[#222226] text-xs text-white focus:border-white focus:outline-none"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[11px] text-zinc-400">Incoming Delegate WhatsApp Phone *</label>
                  <input
                    type="tel"
                    required
                    value={form.buyerPhone}
                    onChange={(e) => setForm((p) => ({ ...p, buyerPhone: e.target.value }))}
                    placeholder="10-digit mobile number"
                    className="w-full h-9 px-3 rounded-md bg-black border border-[#222226] text-xs text-white font-mono focus:border-white focus:outline-none"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[11px] text-zinc-400">School / College / Institution *</label>
                  <input
                    type="text"
                    required
                    value={form.buyerSchool}
                    onChange={(e) => setForm((p) => ({ ...p, buyerSchool: e.target.value }))}
                    placeholder="Institution name"
                    className="w-full h-9 px-3 rounded-md bg-black border border-[#222226] text-xs text-white focus:border-white focus:outline-none"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[11px] text-zinc-400">Parent / Guardian Full Name *</label>
                  <input
                    type="text"
                    required
                    value={form.buyerEmergencyName}
                    onChange={(e) => setForm((p) => ({ ...p, buyerEmergencyName: e.target.value }))}
                    placeholder="Parent or guardian name"
                    className="w-full h-9 px-3 rounded-md bg-black border border-[#222226] text-xs text-white focus:border-white focus:outline-none"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[11px] text-zinc-400">Parent / Emergency Phone *</label>
                  <input
                    type="tel"
                    required
                    value={form.buyerEmergencyPhone}
                    onChange={(e) => setForm((p) => ({ ...p, buyerEmergencyPhone: e.target.value }))}
                    placeholder="Must differ from buyer's phone"
                    className="w-full h-9 px-3 rounded-md bg-black border border-[#222226] text-xs text-white font-mono focus:border-white focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
                <div className="space-y-1">
                  <label className="text-[11px] text-zinc-400">Grade / Year *</label>
                  <input
                    type="text"
                    required
                    value={form.buyerGrade}
                    onChange={(e) => setForm((p) => ({ ...p, buyerGrade: e.target.value }))}
                    placeholder="e.g. Grade 11"
                    className="w-full h-9 px-3 rounded-md bg-black border border-[#222226] text-xs text-white focus:border-white focus:outline-none"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[11px] text-zinc-400">Date of Birth *</label>
                  <input
                    type="date"
                    required
                    value={form.buyerDob}
                    onChange={(e) => setForm((p) => ({ ...p, buyerDob: e.target.value }))}
                    className="w-full h-9 px-3 rounded-md bg-black border border-[#222226] text-xs text-white focus:border-white focus:outline-none"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[11px] text-zinc-400">Bus Transport</label>
                  <select
                    disabled={isLumen}
                    value={isLumen ? "No" : form.buyerTransport}
                    onChange={(e) => setForm((p) => ({ ...p, buyerTransport: e.target.value }))}
                    className="w-full h-9 px-3 rounded-md bg-black border border-[#222226] text-xs text-white focus:border-white focus:outline-none disabled:opacity-60"
                  >
                    <option value="No">{isLumen ? "Not Included (Lumen Policy)" : "No — Self Commute"}</option>
                    {!isLumen && <option value="Yes">Yes — Northfield Bus</option>}
                  </select>
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[11px] text-zinc-400">Incoming Delegate Residential Address</label>
                <input
                  type="text"
                  value={form.buyerAddress}
                  onChange={(e) => setForm((p) => ({ ...p, buyerAddress: e.target.value }))}
                  placeholder="Area, Hyderabad, Pincode"
                  className="w-full h-9 px-3 rounded-md bg-black border border-[#222226] text-xs text-white focus:border-white focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5 pt-1">
                {[
                  { key: "buyerPref1", label: "Committee Preference 1" },
                  { key: "buyerPref2", label: "Committee Preference 2" },
                  { key: "buyerPref3", label: "Committee Preference 3" },
                ].map((pref) => (
                  <div key={pref.key} className="space-y-1">
                    <label className="text-[11px] text-zinc-400">{pref.label}</label>
                    <select
                      value={form[pref.key]}
                      onChange={(e) => setForm((p) => ({ ...p, [pref.key]: e.target.value }))}
                      className="w-full h-9 px-3 rounded-md bg-black border border-[#222226] text-xs text-white focus:border-white focus:outline-none"
                    >
                      {COMMITTEES.map((c) => (
                        <option key={c} value={c}>
                          {c}
                        </option>
                      ))}
                    </select>
                  </div>
                ))}
              </div>
            </section>

            {/* LEGAL DECLARATION & SUBMIT */}
            <section className="rounded-lg border border-[#1c1c20] bg-[#060608] p-5 space-y-4">
              <label className="flex items-start gap-3 text-xs text-zinc-300 leading-relaxed cursor-pointer">
                <input
                  type="checkbox"
                  checked={form.acceptPolicy}
                  onChange={(e) => setForm((p) => ({ ...p, acceptPolicy: e.target.checked }))}
                  className="mt-0.5 h-4 w-4 accent-white rounded cursor-pointer shrink-0"
                />
                <span>
                  I confirm that all details above are accurate and acknowledge the{" "}
                  <Link href="/terms?tab=refunds" target="_blank" className="text-white underline">
                    Strict No-Refund &amp; Allocation Transfer Policy
                  </Link>
                  . I understand this submission is a <strong className="text-white">pre-approval request only</strong>, that unauthorized private resale voids the pass with zero refund, and that Resolve MUN 2.0 holds no liability for private payments between buyer and seller.
                </span>
              </label>

              <button
                type="submit"
                disabled={submitting}
                className="w-full h-10 rounded-md bg-white text-black text-xs font-semibold hover:bg-zinc-200 transition cursor-pointer disabled:opacity-50"
              >
                {submitting ? "Submitting Pre-Approval Request..." : "Submit Transfer Pre-Approval Application →"}
              </button>
            </section>
          </form>
        )}
      </main>

      <Footer />
    </div>
  );
}
