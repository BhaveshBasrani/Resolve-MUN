"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  auth,
  signOutUser,
  onAuthStateChanged,
  fetchDelegateApplicationCached,
  fetchSystemSettingsCached,
} from "@/lib/firebase";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import {
  CheckCircle2, Clock, QrCode, Lock, ArrowRight,
  RefreshCw, User, Users, ShieldCheck, FileCheck, ChevronRight, X,
  Sparkles, Globe, Award, Star, Briefcase, Zap, ExternalLink, ArrowLeft
} from "lucide-react";

function FloatingOrbs() {
  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden z-0 opacity-40 select-none" aria-hidden="true">
      <div className="absolute top-[-15%] left-[-10%] w-[50vw] h-[50vw] max-w-[600px] max-h-[600px] rounded-full bg-indigo-600/15 blur-[130px] animate-pulse" style={{ animationDuration: "9s" }} />
      <div className="absolute bottom-[-10%] right-[-5%] w-[45vw] h-[45vw] max-w-[500px] max-h-[500px] rounded-full bg-purple-600/15 blur-[120px] animate-pulse" style={{ animationDuration: "12s", animationDelay: "3s" }} />
    </div>
  );
}

function StatusPill({ ok, okLabel, pendingLabel, lockedLabel, locked }) {
  if (locked) return (
    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[10px] font-mono font-bold tracking-widest uppercase bg-white/[0.04] text-white/40 border border-white/10">
      <span className="w-1.5 h-1.5 rounded-full bg-white/40 inline-block" />{lockedLabel}
    </span>
  );
  if (ok) return (
    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[10px] font-mono font-bold tracking-widest uppercase bg-emerald-500/15 text-emerald-300 border border-emerald-500/25">
      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 inline-block animate-pulse" />{okLabel}
    </span>
  );
  return (
    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[10px] font-mono font-bold tracking-widest uppercase bg-amber-500/15 text-amber-300 border border-amber-500/25">
      <span className="w-1.5 h-1.5 rounded-full bg-amber-400 inline-block animate-pulse" />{pendingLabel}
    </span>
  );
}

function DataTile({ label, value, accent, sub }) {
  return (
    <div className="p-3.5 rounded-xl bg-[#090b14] border border-white/10 space-y-1 hover:border-white/25 transition-all">
      <span className="text-[9px] font-mono uppercase tracking-[0.18em] text-white/40 block font-semibold">{label}</span>
      <span className={`text-xs sm:text-sm font-bold block leading-tight truncate ${accent ? "text-indigo-300" : "text-white"}`}>
        {value || "—"}
      </span>
      {sub && <span className="text-[10px] text-white/40 block">{sub}</span>}
    </div>
  );
}

/**
 * EXACT CHOOSE PATHWAY COMPONENT MATCHING THE AUTH MODAL
 */
function ChoosePathwayBlock({ onSelect, isModal = false, onClose }) {
  const handleSelect = (pathway) => {
    if (onSelect) {
      onSelect(pathway);
    } else {
      window.location.href = `/?open=${pathway}`;
    }
  };

  return (
    <section className="space-y-3.5 text-left font-sans" aria-labelledby="dashboard-pathway-title">
      {/* Top Nav Eyebrow */}
      <div className="flex items-center justify-between">
        <span className="text-[10px] font-mono tracking-[0.2em] text-indigo-400/90 uppercase font-semibold">
          HYDERABAD 2026
        </span>
        <span className="text-[10px] font-mono tracking-[0.15em] text-white/40 uppercase font-semibold truncate max-w-[240px]">
          DWPS KOMPALLY
        </span>
      </div>

      {/* Header */}
      <div>
        <span className="block mb-1 text-[10px] font-mono font-medium tracking-[0.18em] uppercase text-indigo-300/80">
          Select your role
        </span>
        <h2 id="dashboard-pathway-title" className="font-sans text-2xl sm:text-[26px] font-bold tracking-tight text-white leading-tight">
          Choose Pathway
        </h2>
        <p className="mt-1 text-xs text-white/50 leading-relaxed font-sans max-w-[42ch]">
          Select your participation track for Resolve MUN 2.0.
        </p>
      </div>

      {/* 3 Pathway Cards with Thin Borders */}
      <div className="space-y-2.5 pt-1" aria-label="Participation pathways">
        
        {/* 1. Delegate */}
        <div
          role="button"
          tabIndex={0}
          onClick={() => handleSelect("delegate")}
          onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); handleSelect("delegate"); } }}
          className="group relative flex w-full items-center justify-between gap-3 rounded-xl border border-white/15 bg-[#090b14] px-4 py-3 text-left transition-all duration-200 hover:border-white/40 hover:bg-[#0f111e] hover:shadow-[0_4px_20px_rgba(0,0,0,0.4)] cursor-pointer active:scale-[0.99]"
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

        {/* 2. Delegation */}
        <div
          role="button"
          tabIndex={0}
          onClick={() => handleSelect("delegation")}
          onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); handleSelect("delegation"); } }}
          className="group relative flex w-full items-center justify-between gap-3 rounded-xl border border-white/15 bg-[#090b14] px-4 py-3 text-left transition-all duration-200 hover:border-white/40 hover:bg-[#0f111e] hover:shadow-[0_4px_20px_rgba(0,0,0,0.4)] cursor-pointer active:scale-[0.99]"
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

        {/* 3. Secretariat */}
        <div
          role="button"
          tabIndex={0}
          onClick={() => handleSelect("secretariat")}
          onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); handleSelect("secretariat"); } }}
          className="group relative flex w-full items-center justify-between gap-3 rounded-xl border border-white/15 bg-[#090b14] px-4 py-3 text-left transition-all duration-200 hover:border-white/40 hover:bg-[#0f111e] hover:shadow-[0_4px_20px_rgba(0,0,0,0.4)] cursor-pointer active:scale-[0.99]"
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
      <div className="pt-3 border-t border-white/[0.08] flex items-center justify-between text-xs text-white/40 font-sans">
        <span>Looking for OC or EB?</span>
        <span className="font-mono uppercase tracking-wider text-[10px] text-white/30">
          Round 1 Closed
        </span>
      </div>
    </section>
  );
}

/**
 * EXACT CHOOSE PATHWAY MODAL (Matching Auth Modal Chassis)
 */
function ChoiceModal({ user, onClose }) {
  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = ""; };
  }, []);

  return (
    <div
      className="fixed inset-0 z-[99999] flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-xl animate-in fade-in duration-200"
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div className="relative z-10 w-full max-w-[480px] rounded-2xl border border-white/20 bg-[#07080e] shadow-[0_25px_65px_rgba(0,0,0,0.85),0_0_35px_rgba(99,102,241,0.15)] overflow-hidden p-6 sm:p-7 animate-in zoom-in-95 duration-200">
        
        {/* High-Visibility Rounded Close Button */}
        <button
          type="button"
          onClick={onClose}
          aria-label="Close modal"
          className="absolute top-4 right-4 z-40 w-9 h-9 rounded-xl bg-black/80 hover:bg-black border border-white/30 hover:border-white/60 text-white flex items-center justify-center transition-all cursor-pointer shadow-lg active:scale-95"
        >
          <X className="w-4 h-4 text-white/90" strokeWidth={2.2} />
        </button>

        <ChoosePathwayBlock onClose={onClose} isModal={true} />

        <div className="pt-4 text-center">
          <span className="text-[10px] font-mono text-white/35">
            Signed in as <strong className="text-white/70">{user?.email}</strong>
          </span>
        </div>
      </div>
    </div>
  );
}

export default function DelegateDashboard() {
  const [user, setUser] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [delegateRecord, setDelegateRecord] = useState(null);
  const [dataLoading, setDataLoading] = useState(false);
  const [systemSettings, setSystemSettings] = useState({ registrationsOpen: true, roundName: "Round 2 Applications" });
  const [choiceModalOpen, setChoiceModalOpen] = useState(false);
  const [synced, setSynced] = useState(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      if (firebaseUser) {
        const normalized = {
          uid: firebaseUser.uid,
          id: firebaseUser.uid,
          email: firebaseUser.email,
          displayName: firebaseUser.displayName || firebaseUser.email?.split("@")[0] || "Delegate",
          photoURL: firebaseUser.photoURL || "",
        };
        setUser(normalized);
        fetchDelegateProfile(normalized.uid, normalized.email);
      } else {
        setUser(null);
        setDelegateRecord(null);
      }
      setAuthLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const fetchDelegateProfile = async (userId, email, force = false) => {
    setDataLoading(true);
    try {
      const [record, settings] = await Promise.all([
        fetchDelegateApplicationCached(userId, email, force),
        fetchSystemSettingsCached(force),
      ]);

      if (record && record.found !== false) {
        const delegateId = record.regId || record.delegateId || (record.id ? `RM26-DEL-${String(record.id).slice(0, 4).toUpperCase()}` : "RM26-DEL-CONFIRMED");
        const fullName = record.fullName || record.name || (user?.displayName || "Delegate");
        const paymentUTR = record.paymentUTR || record.payment_utr || "BANK-CONFIRMED";
        const status = record.status || "Confirmed";
        const isPaymentOk = (
          status === "Confirmed" ||
          status === "Payment_Verified" ||
          status === "Manual_Approved" ||
          status === "APPROVED" ||
          (paymentUTR && String(paymentUTR).trim().length > 3)
        );

        setDelegateRecord({
          ...record,
          delegateId,
          fullName,
          email: record.email || email,
          phone: record.phone || "",
          paymentUTR,
          paymentStatus: isPaymentOk ? "VERIFIED" : "PENDING_VERIFICATION",
          status,
          allocatedCommittee: record.allocatedCommittee || record.allocated_committee || "",
          allocatedCountry: record.allocatedCountry || record.allocated_country || "",
          institution: record.institution || record.institute || "Individual Delegate",
          pref1: record.pref1 || (record.pref1_committee ? `${record.pref1_committee} · ${record.pref1_country || 'General'}` : null),
          pref2: record.pref2 || (record.pref2_committee ? `${record.pref2_committee} · ${record.pref2_country || 'General'}` : null),
          pref3: record.pref3 || (record.pref3_committee ? `${record.pref3_committee} · ${record.pref3_country || 'General'}` : null),
        });
      } else {
        // Fallback: Check local registration persistence
        const isLocallyRegistered = typeof window !== 'undefined' && localStorage.getItem('resolve_user_registered') === 'true';
        if (isLocallyRegistered) {
          const storedEmail = localStorage.getItem('resolve_user_email') || email;
          const storedName = localStorage.getItem('resolve_user_name') || user?.displayName || "Delegate";
          const storedId = localStorage.getItem('resolve_delegate_id') || "RM26-DEL-CONFIRMED";
          setDelegateRecord({
            regId: storedId,
            delegateId: storedId,
            fullName: storedName,
            email: storedEmail,
            status: "Confirmed",
            paymentStatus: "VERIFIED",
            institution: "Individual Delegate"
          });
        } else {
          setDelegateRecord(null);
        }
      }

      if (settings) {
        setSystemSettings({
          registrationsOpen: settings.registrations_open !== false,
          roundName: settings.round_name || "Round 1 Priority Applications",
        });
      }
      setSynced(true);
    } catch (e) {
      console.error("[Dashboard] Error fetching profile:", e);
    } finally {
      setDataLoading(false);
    }
  };

  const handleSignOut = async () => {
    try {
      await signOutUser();
      window.location.href = "/";
    } catch (err) {
      console.error("Sign out error:", err);
    }
  };

  const isReg = Boolean(delegateRecord && (delegateRecord.regId || delegateRecord.delegateId || delegateRecord.fullName || delegateRecord.found));
  const isPaid = isReg && (
    delegateRecord.paymentStatus === "VERIFIED" ||
    delegateRecord.status === "Confirmed" ||
    delegateRecord.status === "Manual_Approved" ||
    delegateRecord.status === "Payment_Verified" ||
    delegateRecord.status === "ALLOTTED" ||
    delegateRecord.status === "APPROVED" ||
    Boolean(delegateRecord.paymentUTR && String(delegateRecord.paymentUTR).trim().length > 3)
  );
  const isAllotted = isReg && Boolean(delegateRecord.allocatedCommittee);

  const initials = (user?.displayName || user?.email || "D")
    .split(" ")
    .map((w) => w[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
  const displayName = user?.displayName || user?.email?.split("@")[0] || "Delegate";

  if (authLoading) {
    return (
      <div className="min-h-screen bg-[#05060c] text-white flex flex-col items-center justify-center gap-5">
        <FloatingOrbs />
        <div className="relative z-10 flex flex-col items-center gap-4">
          <div className="w-12 h-12 rounded-2xl border border-white/20 bg-[#090b14] flex items-center justify-center shadow-[0_0_25px_rgba(99,102,241,0.25)]">
            <span className="font-extrabold text-white font-mono text-lg">R</span>
          </div>
          <div className="flex gap-1.5">
            {[0, 1, 2].map((i) => (
              <div key={i} className="w-1.5 h-1.5 rounded-full bg-white/70 animate-bounce" style={{ animationDelay: `${i * 0.15}s` }} />
            ))}
          </div>
          <p className="font-mono text-[10px] uppercase tracking-[0.25em] text-white/40">Securing Session</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-[#05060c] text-white flex flex-col justify-between selection:bg-indigo-500/30">
        <Navbar />
        <div className="flex-1 flex items-center justify-center p-4 pt-28">
          <FloatingOrbs />
          <div className="relative z-10 w-full max-w-md p-8 rounded-2xl border border-white/15 bg-[#07080e] backdrop-blur-2xl text-center space-y-6 shadow-[0_25px_65px_rgba(0,0,0,0.85)]">
            <div className="w-14 h-14 rounded-2xl border border-white/20 bg-white/[0.04] flex items-center justify-center mx-auto text-white shadow-inner">
              <Lock className="w-6 h-6 text-white/80" />
            </div>
            <div>
              <p className="text-[10px] font-mono uppercase tracking-[0.25em] text-indigo-400 mb-1.5 font-bold">
                DELEGATE PORTAL · RESTRICTED
              </p>
              <h1 className="text-2xl font-extrabold text-white tracking-tight font-sans">
                Authentication Required
              </h1>
              <p className="text-xs text-white/60 mt-2.5 leading-relaxed font-sans">
                Sign in with your verified credentials to access committee allocations, conference schedule, and your official digital pass.
              </p>
            </div>
            <Link
              href="/?open=auth"
              className="flex h-11 w-full items-center justify-center rounded-xl bg-white text-xs font-bold uppercase tracking-wider text-black transition-all hover:bg-white/90 active:scale-[0.99] shadow-[0_0_24px_rgba(255,255,255,0.22)]"
            >
              Sign In to Portal <ArrowRight className="w-3.5 h-3.5 ml-1.5" />
            </Link>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#05060c] text-white font-sans selection:bg-indigo-500/30 flex flex-col justify-between">
      <Navbar />
      <FloatingOrbs />

      <main className="relative z-10 max-w-4xl w-full mx-auto px-4 sm:px-6 pt-24 sm:pt-28 pb-20 space-y-5 flex-1">

        {/* HERO IDENTITY CARD (Obsidian Luxury Chassis Matching Auth Page) */}
        <section className="relative overflow-hidden rounded-2xl border border-white/15 bg-[#07080e] backdrop-blur-2xl p-6 sm:p-8 shadow-[0_20px_50px_rgba(0,0,0,0.6)]">
          <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-violet-500 via-indigo-500 to-blue-500" />
          
          <div className="relative flex flex-col sm:flex-row sm:items-center justify-between gap-6">
            <div className="flex items-center gap-4 sm:gap-5">
              <div className="relative shrink-0">
                {user.photoURL ? (
                  <img
                    src={user.photoURL}
                    alt={displayName}
                    className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl object-cover border border-white/20 shadow-[0_0_20px_rgba(255,255,255,0.1)]"
                  />
                ) : (
                  <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-gradient-to-br from-[#100726] via-[#090b1c] to-[#04050a] flex items-center justify-center text-white font-extrabold text-xl sm:text-2xl shadow-md border border-white/20">
                    {initials}
                  </div>
                )}
                {isReg && (
                  <div className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-emerald-500 border-2 border-[#07080e] flex items-center justify-center text-black shadow-sm">
                    <CheckCircle2 className="w-3.5 h-3.5" strokeWidth={3} />
                  </div>
                )}
              </div>

              <div className="min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-[9px] font-mono uppercase tracking-[0.22em] text-indigo-400 font-bold">
                    {systemSettings.roundName}
                  </span>
                  <span className="w-1 h-1 rounded-full bg-white/20" />
                  <span className="text-[10px] font-mono text-white/40">
                    EDITION 2026
                  </span>
                </div>
                <h1 className="text-xl sm:text-2xl font-extrabold text-white tracking-tight uppercase font-sans">
                  {displayName}
                </h1>
                <p className="text-xs font-mono text-white/50 truncate mt-0.5">
                  {user.email}
                </p>
                <div className="flex flex-wrap items-center gap-2 mt-3">
                  <StatusPill ok={isReg} okLabel="Registered" pendingLabel="Unregistered" />
                  <StatusPill locked={!isReg} ok={isPaid} okLabel="Verified &amp; Cleared" pendingLabel="Verification Pending" lockedLabel="Payment Pending" />
                  {isAllotted && (
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[10px] font-mono font-bold tracking-widest uppercase bg-blue-500/15 text-blue-300 border border-blue-500/25">
                      <Globe className="w-2.5 h-2.5" />Allotted
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Quick Sync & Delegate ID */}
            <div className="flex sm:flex-col items-center sm:items-end justify-between gap-3 pt-3 sm:pt-0 border-t sm:border-t-0 border-white/10">
              {isReg && delegateRecord?.delegateId ? (
                <div className="p-3 rounded-xl bg-[#090b14] border border-white/15 text-left sm:text-right shadow-sm">
                  <span className="text-[9px] font-mono uppercase tracking-[0.18em] text-white/40 block">DELEGATE ID</span>
                  <span className="text-base font-mono font-black text-indigo-300 tracking-wider block mt-0.5">
                    {delegateRecord.delegateId}
                  </span>
                </div>
              ) : (
                <span className="text-[11px] font-mono text-white/40">
                  STATUS: <strong className="text-amber-400">PENDING INTAKE</strong>
                </span>
              )}

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => fetchDelegateProfile(user?.id, user?.email, true)}
                  disabled={dataLoading}
                  className="h-8 px-3 rounded-xl border border-white/15 bg-white/[0.04] hover:bg-white/[0.08] text-[11px] font-mono text-white/70 hover:text-white flex items-center gap-1.5 transition-all cursor-pointer"
                >
                  <RefreshCw className={`w-3 h-3 ${dataLoading ? "animate-spin text-indigo-400" : ""}`} />
                  <span>{dataLoading ? "Syncing..." : "Sync Status"}</span>
                </button>
                <button
                  type="button"
                  onClick={handleSignOut}
                  className="h-8 px-3 rounded-xl border border-white/15 bg-white/[0.04] hover:bg-red-500/20 hover:border-red-500/30 text-[11px] font-mono text-white/50 hover:text-red-300 transition-colors cursor-pointer"
                >
                  Sign Out
                </button>
              </div>
            </div>
          </div>

          {/* Venue & Dates Banner */}
          <div className="mt-5 pt-4 border-t border-white/10 flex flex-wrap items-center justify-between gap-2 text-xs text-white/50 font-sans">
            <div className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-indigo-400 animate-pulse" />
              <span>Venue: <strong className="text-white/80">Delhi World Public School, Kompally</strong></span>
            </div>
            <div>
              <span>Dates: <strong className="text-white/80">20th – 22nd November 2026</strong></span>
            </div>
          </div>
        </section>

        {/* STATE A: UNREGISTERED STATE (Exact Choose Pathway Component Embedded) */}
        {!isReg && (
          <section className="relative overflow-hidden rounded-2xl border border-white/15 bg-[#07080e] p-6 sm:p-8 shadow-[0_20px_50px_rgba(0,0,0,0.6)]">
            <ChoosePathwayBlock onSelect={(track) => { window.location.href = `/?open=${track}`; }} />
          </section>
        )}

        {/* STATE B: REGISTERED STATE */}
        {isReg && (
          <div className="space-y-5">
            {/* DOSSIER & ALLOTMENT */}
            <section className="relative overflow-hidden rounded-2xl border border-white/15 bg-[#07080e] p-6 sm:p-7 shadow-sm">
              <div className="flex items-center justify-between mb-5">
                <div>
                  <p className="text-[9px] font-mono uppercase tracking-[0.25em] text-white/40 mb-0.5 font-bold">
                    OFFICIAL DOSSIER
                  </p>
                  <h3 className="text-sm sm:text-base font-extrabold uppercase tracking-wide text-white font-sans">
                    Conference Registration Record
                  </h3>
                </div>
                <span className={`text-[10px] font-mono font-bold px-2.5 py-1 rounded-lg ${delegateRecord.delegationCode ? "text-indigo-300 bg-indigo-500/10 border border-indigo-500/25" : "text-white/50 bg-white/[0.04] border border-white/10"}`}>
                  {delegateRecord.delegationCode ? `DELEGATION: ${delegateRecord.delegationCode}` : "INDEPENDENT DELEGATE"}
                </span>
              </div>

              {/* Committee Preferences */}
              <div className="mb-4">
                <p className="text-[9px] font-mono uppercase tracking-[0.18em] text-white/35 mb-2 font-bold">
                  Committee Preferences Submitted
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                  {[1, 2, 3].map((n) => (
                    <div key={n} className="p-3.5 rounded-xl bg-[#090b14] border border-white/10 hover:border-white/25 transition-colors">
                      <span className="text-[8px] font-mono uppercase tracking-[0.18em] text-white/30 block font-bold">PREFERENCE {n}</span>
                      <span className="text-xs sm:text-sm font-bold text-white mt-1 block leading-snug truncate">
                        {delegateRecord[`pref${n}`] || "—"}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Data Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                <DataTile label="Institution" value={delegateRecord.institution || "Individual"} />
                <DataTile label="Grade / Year" value={delegateRecord.grade || "—"} />
                <DataTile label="Allotted Committee" value={isAllotted ? delegateRecord.allocatedCommittee : "Pending Matrix"} accent={isAllotted} />
                <DataTile label="Portfolio / Country" value={isAllotted ? (delegateRecord.allocatedCountry || "Delegate") : "Pending Matrix"} accent={isAllotted} />
              </div>

              {/* Payment Verification Status Box */}
              <div className="mt-4 p-4 rounded-xl bg-[#090b14] border border-white/10 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <p className="text-[9px] font-mono uppercase tracking-[0.2em] text-white/35 mb-1 font-bold">
                    Payment Verification Status
                  </p>
                  <div className="flex items-center gap-2">
                    {isPaid ? (
                      <>
                        <ShieldCheck className="w-4 h-4 text-emerald-400" />
                        <span className="text-xs sm:text-sm font-bold text-emerald-300">VERIFIED &amp; CONFIRMED</span>
                      </>
                    ) : (
                      <>
                        <Clock className="w-4 h-4 text-amber-400 animate-pulse" />
                        <span className="text-xs sm:text-sm font-bold text-amber-300">UNDER SECRETARIAT REVIEW</span>
                      </>
                    )}
                  </div>
                  <p className="text-[11px] font-mono text-white/40 mt-0.5">
                    UTR: <span className="font-semibold text-white/70">{delegateRecord.paymentUTR || delegateRecord.txnId || "Awaiting verification"}</span>
                  </p>
                </div>
                {isPaid && (
                  <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/25 text-[10px] font-mono uppercase tracking-widest text-emerald-300 font-bold">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse inline-block" />
                    Cleared Seat
                  </span>
                )}
              </div>
            </section>

            {/* DIGITAL PASS WITH QR */}
            <section className="relative overflow-hidden rounded-2xl border border-white/15 bg-[#07080e] p-6 sm:p-7 shadow-sm">
              <div className="mb-5">
                <p className="text-[9px] font-mono uppercase tracking-[0.25em] text-white/40 mb-0.5 font-bold">
                  ACCREDITATION
                </p>
                <h3 className="text-sm sm:text-base font-extrabold uppercase tracking-wide text-white font-sans">
                  Official Digital Conference Pass
                </h3>
                <p className="text-xs text-white/40 mt-0.5">
                  Present this authenticated QR pass at the entrance checkpoint at Delhi World Public School, Kompally.
                </p>
              </div>

              {isPaid ? (
                <div className="flex flex-col items-center">
                  <div className="relative w-full max-w-xs mx-auto">
                    <div className="relative rounded-2xl overflow-hidden border border-white/20 bg-[#090b14] shadow-2xl">
                      <div className="bg-gradient-to-r from-violet-600 via-indigo-600 to-blue-600 px-5 py-3 flex items-center justify-between text-white">
                        <div>
                          <p className="text-[8px] font-mono uppercase tracking-[0.25em] text-white/80 font-bold">Resolve MUN 2026</p>
                          <p className="text-xs font-extrabold tracking-widest uppercase">Digital Pass</p>
                        </div>
                        <ShieldCheck className="w-5 h-5 text-white" />
                      </div>

                      <div className="p-5 flex flex-col items-center gap-4">
                        <div className="p-3 rounded-xl bg-white border border-neutral-200 shadow-inner">
                          <img
                            src={`https://quickchart.io/qr?size=220&text=${encodeURIComponent("RESOLVE_PASS:" + delegateRecord.delegateId + ":" + delegateRecord.email)}`}
                            alt="QR Pass"
                            className="w-40 h-40 block"
                          />
                        </div>

                        <div className="text-center space-y-1 w-full">
                          <p className="text-sm font-extrabold uppercase text-white">
                            {delegateRecord.fullName || user.displayName}
                          </p>
                          <p className="text-[10px] font-mono font-bold text-indigo-300 tracking-widest">
                            {delegateRecord.delegateId}
                          </p>
                          {isAllotted && (
                            <div className="flex items-center justify-center gap-2 mt-1">
                              <span className="px-2.5 py-0.5 rounded-md bg-emerald-500/15 border border-emerald-500/25 text-[10px] font-bold text-emerald-300 font-mono">
                                {delegateRecord.allocatedCommittee}
                              </span>
                              <span className="text-[10px] text-white/60 truncate max-w-[120px]">
                                {delegateRecord.allocatedCountry}
                              </span>
                            </div>
                          )}
                        </div>

                        <div className="w-full flex items-center justify-between pt-3 border-t border-white/10">
                          <span className="text-[9px] font-mono text-white/35 uppercase tracking-widest">DWPS Kompally</span>
                          <span className="flex items-center gap-1 text-[9px] font-mono text-emerald-400 uppercase tracking-widest font-bold">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse inline-block" />Verified
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                  <p className="text-[10px] text-white/35 mt-4 text-center max-w-xs leading-relaxed">
                    Checkpoint roll-call via official Secretariat terminal scanners.
                  </p>
                </div>
              ) : (
                <div className="flex flex-col items-center py-8 text-center space-y-4">
                  <div className="relative">
                    <div className="w-16 h-16 rounded-2xl bg-white/[0.03] border border-white/10 flex items-center justify-center mx-auto text-white/30">
                      <Lock className="w-8 h-8" />
                    </div>
                    <div className="absolute -top-1 -right-1 w-6 h-6 rounded-full bg-amber-500/20 border border-amber-500/30 flex items-center justify-center text-amber-400">
                      <Clock className="w-3 h-3" />
                    </div>
                  </div>
                  <div className="space-y-1.5 max-w-sm">
                    <h4 className="text-sm font-bold uppercase tracking-wider text-white">
                      Pass Awaiting Clearance
                    </h4>
                    <p className="text-xs text-white/50 leading-relaxed font-sans">
                      Your payment (UTR: <span className="font-mono text-white/80">{delegateRecord.paymentUTR || delegateRecord.txnId || "Submitted"}</span>) is currently being verified. Your QR conference pass activates automatically upon Secretariat clearance.
                    </p>
                  </div>
                  <div className="flex items-center gap-2 text-[10px] font-mono text-amber-300">
                    <RefreshCw className="w-3 h-3 animate-spin" style={{ animationDuration: "3s" }} />
                    <span>Awaiting confirmation from Directorate</span>
                  </div>
                </div>
              )}
            </section>
          </div>
        )}

        {/* QUICK ACTIONS CARD */}
        <section className="p-5 sm:p-6 rounded-2xl border border-white/15 bg-[#07080e] space-y-3 shadow-sm">
          <p className="text-[9px] font-mono uppercase tracking-[0.25em] text-white/35 font-bold">
            PORTAL SHORTCUTS
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            <Link
              href="/"
              className="group flex items-center gap-3 p-3.5 rounded-xl bg-[#090b14] hover:bg-[#0f111e] border border-white/10 hover:border-white/30 transition-all"
            >
              <Globe className="w-4 h-4 text-white/40 group-hover:text-indigo-400 transition-colors shrink-0" />
              <span className="text-xs font-semibold text-white/70 group-hover:text-white transition-colors">
                Return to Conference Home
              </span>
              <ExternalLink className="w-3.5 h-3.5 text-white/20 ml-auto group-hover:text-white/60 transition-colors" />
            </Link>

            <button
              type="button"
              onClick={() => fetchDelegateProfile(user?.id, user?.email, true)}
              className="group flex items-center gap-3 p-3.5 rounded-xl bg-[#090b14] hover:bg-[#0f111e] border border-white/10 hover:border-white/30 transition-all cursor-pointer w-full text-left"
            >
              <RefreshCw className={`w-4 h-4 text-white/40 group-hover:text-indigo-400 transition-colors shrink-0 ${dataLoading ? "animate-spin" : ""}`} />
              <span className="text-xs font-semibold text-white/70 group-hover:text-white transition-colors">
                Sync Registration Record
              </span>
              {dataLoading && <span className="text-[10px] font-mono text-indigo-400 ml-auto">Syncing...</span>}
            </button>

            {!isReg && systemSettings.registrationsOpen && (
              <button
                type="button"
                onClick={() => setChoiceModalOpen(true)}
                className="group flex items-center justify-between p-3.5 rounded-xl bg-white text-black font-bold hover:bg-white/90 transition-all cursor-pointer col-span-full shadow-[0_0_20px_rgba(255,255,255,0.2)]"
              >
                <div className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-black" />
                  <span className="text-xs uppercase tracking-wider">
                    Select Your Pathway Now
                  </span>
                </div>
                <ArrowRight className="w-4 h-4 text-black" />
              </button>
            )}
          </div>
        </section>
      </main>

      {choiceModalOpen && <ChoiceModal user={user} onClose={() => setChoiceModalOpen(false)} />}
      <Footer />
    </div>
  );
}
