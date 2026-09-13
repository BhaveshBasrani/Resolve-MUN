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
  Sparkles, Globe, Award, Star, Briefcase, Zap, ExternalLink
} from "lucide-react";

function FloatingOrbs() {
  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden z-0 opacity-40 dark:opacity-70" aria-hidden="true">
      <div className="absolute top-[-15%] left-[-10%] w-[50vw] h-[50vw] max-w-[600px] max-h-[600px] rounded-full bg-indigo-600/10 blur-[120px] animate-pulse" style={{ animationDuration: "9s" }} />
      <div className="absolute bottom-[-10%] right-[-5%] w-[45vw] h-[45vw] max-w-[500px] max-h-[500px] rounded-full bg-purple-600/10 blur-[100px] animate-pulse" style={{ animationDuration: "12s", animationDelay: "3s" }} />
    </div>
  );
}

function StatusPill({ ok, okLabel, pendingLabel, lockedLabel, locked }) {
  if (locked) return (
    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[10px] font-mono font-bold tracking-widest uppercase bg-neutral-500/10 text-neutral-400 border border-neutral-500/20">
      <span className="w-1.5 h-1.5 rounded-full bg-neutral-400 inline-block" />{lockedLabel}
    </span>
  );
  if (ok) return (
    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[10px] font-mono font-bold tracking-widest uppercase bg-emerald-500/15 text-emerald-500 dark:text-emerald-300 border border-emerald-500/25">
      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 inline-block animate-pulse" />{okLabel}
    </span>
  );
  return (
    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[10px] font-mono font-bold tracking-widest uppercase bg-amber-500/15 text-amber-600 dark:text-amber-300 border border-amber-500/25">
      <span className="w-1.5 h-1.5 rounded-full bg-amber-500 inline-block animate-pulse" />{pendingLabel}
    </span>
  );
}

function PathwayCard({ icon: Icon, title, desc, href, color }) {
  const iconCls = {
    blue: "bg-blue-500/10 border-blue-400/25 text-blue-500 dark:text-blue-400",
    purple: "bg-purple-500/10 border-purple-400/25 text-purple-500 dark:text-purple-400",
    violet: "bg-indigo-500/10 border-indigo-400/25 text-indigo-500 dark:text-indigo-400",
    amber: "bg-amber-500/10 border-amber-400/25 text-amber-500 dark:text-amber-400",
  };
  return (
    <a
      href={href}
      className="group flex items-center justify-between gap-4 p-4 sm:p-5 rounded-2xl border border-black/10 dark:border-white/[0.08] bg-white/70 dark:bg-white/[0.025] hover:border-indigo-500/40 hover:bg-indigo-500/[0.04] transition-all duration-200 cursor-pointer shadow-sm"
    >
      <div className="flex items-center gap-3.5 sm:gap-4">
        <div className={`w-11 h-11 rounded-xl border flex items-center justify-center shrink-0 transition-all ${iconCls[color]}`}>
          <Icon className="w-5 h-5" />
        </div>
        <div>
          <h4 className="text-xs sm:text-sm font-bold tracking-wide uppercase text-neutral-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-300 transition-colors">
            {title}
          </h4>
          <p className="text-[11px] sm:text-xs text-neutral-500 dark:text-white/50 mt-0.5 leading-snug">
            {desc}
          </p>
        </div>
      </div>
      <ChevronRight className="w-4 h-4 text-neutral-400 dark:text-white/30 group-hover:text-indigo-500 dark:group-hover:text-white/70 group-hover:translate-x-1 transition-all shrink-0" />
    </a>
  );
}

function DataTile({ label, value, accent, sub }) {
  return (
    <div className="p-3.5 rounded-2xl bg-black/[0.02] dark:bg-black/30 border border-black/[0.08] dark:border-white/[0.08] space-y-1 hover:border-indigo-500/30 transition-colors">
      <span className="text-[9px] font-mono uppercase tracking-[0.18em] text-neutral-400 dark:text-white/35 block font-semibold">{label}</span>
      <span className={`text-xs sm:text-sm font-bold block leading-tight truncate ${accent ? "text-indigo-600 dark:text-indigo-300" : "text-neutral-900 dark:text-white"}`}>
        {value || "—"}
      </span>
      {sub && <span className="text-[10px] text-neutral-500 dark:text-white/40 block">{sub}</span>}
    </div>
  );
}

function ChoiceModal({ user, onClose }) {
  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = ""; };
  }, []);

  const pathways = [
    { href: "/?open=delegate", icon: User, title: "Register as Delegate", desc: "Individual representative in committee simulations. Country allocation included.", color: "blue" },
    { href: "/?open=delegation", icon: Users, title: "Register a Delegation", desc: "Group registration for schools or universities with faculty coordinator.", color: "purple" },
    { href: "/?open=oc", icon: Briefcase, title: "Apply for OC", desc: "Join the Organizing Committee team for summit logistics, marketing & operations.", color: "amber" },
    { href: "/?open=secretariat", icon: Star, title: "Secretariat Application", desc: "Executive Directorate application for conference policy, leadership & management.", color: "violet" },
  ];

  return (
    <div
      className="fixed inset-0 z-[9999] flex items-end sm:items-center justify-center sm:p-4 bg-black/60 backdrop-blur-xl animate-in fade-in duration-200"
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div className="relative w-full sm:max-w-lg bg-white dark:bg-[#070919] rounded-t-3xl sm:rounded-3xl border border-black/10 dark:border-white/[0.12] shadow-2xl overflow-hidden animate-in slide-in-from-bottom-4 sm:zoom-in-95 duration-200">
        <div className="h-1 bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-500" />
        <div className="flex justify-center pt-2.5 pb-0 sm:hidden">
          <div className="w-10 h-1 rounded-full bg-neutral-300 dark:bg-white/20" />
        </div>
        
        <div className="px-6 pt-5 pb-3 flex items-start justify-between">
          <div>
            <p className="text-[9px] font-mono uppercase tracking-[0.25em] text-indigo-600 dark:text-indigo-400 mb-1 font-bold">
              Resolve MUN 2.0 · INTAKE
            </p>
            <h2 className="text-lg sm:text-xl font-extrabold uppercase tracking-tight text-neutral-900 dark:text-white" style={{ fontFamily: "'Inter', sans-serif" }}>
              CHOOSE YOUR PATHWAY
            </h2>
            <p className="text-xs text-neutral-500 dark:text-white/50 mt-0.5">
              Select your participation track to proceed with registration.
            </p>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-neutral-100 dark:bg-white/[0.08] hover:bg-neutral-200 dark:hover:bg-white/[0.16] flex items-center justify-center text-neutral-500 dark:text-white/60 hover:text-neutral-900 dark:hover:text-white transition-all cursor-pointer shrink-0"
            aria-label="Close modal"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="px-6 pb-6 space-y-2.5">
          {pathways.map((p) => <PathwayCard key={p.href} {...p} />)}
          <div className="pt-2 text-center">
            <span className="text-[10px] font-mono text-neutral-400 dark:text-white/35">
              Signed in as <strong className="text-neutral-700 dark:text-white/70">{user?.email}</strong>
            </span>
          </div>
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
  const [systemSettings, setSystemSettings] = useState({ registrationsOpen: true, roundName: "Round 1 Priority Applications" });
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

      if (record) {
        setDelegateRecord({
          ...record,
          delegateId: record.id ? `DEL-${record.id.slice(0, 6).toUpperCase()}` : null,
          fullName: record.name,
          paymentUTR: record.payment_utr,
          paymentStatus: record.payment_status,
          allocatedCommittee: record.allocated_committee,
          allocatedCountry: record.allocated_country,
          institution: record.institute,
          pref1: record.pref1_committee ? `${record.pref1_committee} · ${record.pref1_country || 'General'}` : null,
          pref2: record.pref2_committee ? `${record.pref2_committee} · ${record.pref2_country || 'General'}` : null,
          pref3: record.pref3_committee ? `${record.pref3_committee} · ${record.pref3_country || 'General'}` : null,
        });
      } else {
        setDelegateRecord(null);
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

  const isReg = Boolean(delegateRecord);
  const isPaid = isReg && (delegateRecord.paymentStatus === "VERIFIED" || delegateRecord.status === "ALLOTTED" || delegateRecord.status === "APPROVED");
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
      <div className="min-h-screen bg-[var(--theme-bg-base)] flex flex-col items-center justify-center gap-5 transition-colors duration-300">
        <FloatingOrbs />
        <div className="relative z-10 flex flex-col items-center gap-4">
          <div className="w-12 h-12 rounded-2xl border border-indigo-500/30 bg-indigo-500/10 flex items-center justify-center shadow-lg">
            <span className="font-extrabold text-indigo-500 dark:text-indigo-300 font-mono text-lg">R</span>
          </div>
          <div className="flex gap-1.5">
            {[0, 1, 2].map((i) => (
              <div key={i} className="w-1.5 h-1.5 rounded-full bg-indigo-500 animate-bounce" style={{ animationDelay: `${i * 0.15}s` }} />
            ))}
          </div>
          <p className="font-mono text-[10px] uppercase tracking-[0.25em] text-neutral-400 dark:text-white/40">Securing Session</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-[var(--theme-bg-base)] flex flex-col justify-between transition-colors duration-300">
        <Navbar />
        <div className="flex-1 flex items-center justify-center p-4 pt-28">
          <FloatingOrbs />
          <div className="relative z-10 w-full max-w-md p-8 rounded-3xl border border-black/10 dark:border-white/[0.1] bg-white/80 dark:bg-white/[0.03] backdrop-blur-2xl text-center space-y-6 shadow-xl">
            <div className="w-14 h-14 rounded-2xl border border-indigo-500/30 bg-indigo-500/10 flex items-center justify-center mx-auto text-indigo-500 dark:text-indigo-400 shadow-inner">
              <Lock className="w-7 h-7" />
            </div>
            <div>
              <p className="text-[10px] font-mono uppercase tracking-[0.25em] text-indigo-600 dark:text-indigo-400 mb-1.5 font-bold">
                DELEGATE PORTAL · RESTRICTED
              </p>
              <h1 className="text-2xl font-extrabold text-neutral-900 dark:text-white tracking-tight" style={{ fontFamily: "'Inter', sans-serif" }}>
                Authentication Required
              </h1>
              <p className="text-xs text-neutral-500 dark:text-white/60 mt-2.5 leading-relaxed">
                Sign in with your verified credentials to access committee allocations, conference schedule, and official digital pass.
              </p>
            </div>
            <Link
              href="/"
              className="cta-btn-hero-match w-full"
            >
              Return &amp; Sign In <ArrowRight className="w-3.5 h-3.5 ml-1.5" />
            </Link>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[var(--theme-bg-base)] text-neutral-900 dark:text-white font-sans transition-colors duration-300 selection:bg-indigo-500/30 flex flex-col justify-between">
      <Navbar />
      <FloatingOrbs />

      <main className="relative z-10 max-w-4xl w-full mx-auto px-4 sm:px-6 pt-24 sm:pt-28 pb-20 space-y-5 flex-1">

        {/* HERO IDENTITY CARD (Minimal Boxy Soft Typeform-like) */}
        <section className="relative overflow-hidden rounded-3xl border border-black/10 dark:border-white/[0.1] bg-white/80 dark:bg-[#070919] backdrop-blur-2xl p-6 sm:p-8 shadow-sm">
          <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-500" />
          
          <div className="relative flex flex-col sm:flex-row sm:items-center justify-between gap-6">
            <div className="flex items-center gap-4 sm:gap-5">
              <div className="relative shrink-0">
                {user.photoURL ? (
                  <img
                    src={user.photoURL}
                    alt={displayName}
                    className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl object-cover border-2 border-indigo-400/30 shadow-md"
                  />
                ) : (
                  <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-gradient-to-br from-blue-600 via-indigo-600 to-purple-600 flex items-center justify-center text-white font-extrabold text-xl sm:text-2xl shadow-md border border-white/20">
                    {initials}
                  </div>
                )}
                {isReg && (
                  <div className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-emerald-500 border-2 border-white dark:border-[#070919] flex items-center justify-center text-white shadow-sm">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                  </div>
                )}
              </div>

              <div className="min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-[9px] font-mono uppercase tracking-[0.22em] text-indigo-600 dark:text-indigo-400 font-bold">
                    {systemSettings.roundName}
                  </span>
                  <span className="w-1 h-1 rounded-full bg-neutral-300 dark:bg-white/20" />
                  <span className="text-[10px] font-mono text-neutral-400 dark:text-white/40">
                    EDITION 2.0
                  </span>
                </div>
                <h1 className="text-xl sm:text-2xl font-extrabold text-neutral-900 dark:text-white tracking-tight uppercase" style={{ fontFamily: "'Inter', sans-serif" }}>
                  {displayName}
                </h1>
                <p className="text-xs font-mono text-neutral-500 dark:text-white/50 truncate mt-0.5">
                  {user.email}
                </p>
                <div className="flex flex-wrap items-center gap-2 mt-3">
                  <StatusPill ok={isReg} okLabel="Registered" pendingLabel="Unregistered" />
                  <StatusPill locked={!isReg} ok={isPaid} okLabel="Verified &amp; Paid" pendingLabel="Verification Pending" lockedLabel="Payment Pending" />
                  {isAllotted && (
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[10px] font-mono font-bold tracking-widest uppercase bg-blue-500/15 text-blue-600 dark:text-blue-300 border border-blue-500/25">
                      <Globe className="w-2.5 h-2.5" />Allotted
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Quick Sync & Delegate ID */}
            <div className="flex sm:flex-col items-center sm:items-end justify-between gap-3 pt-3 sm:pt-0 border-t sm:border-t-0 border-black/[0.06] dark:border-white/[0.08]">
              {isReg && delegateRecord?.delegateId ? (
                <div className="p-3 rounded-2xl bg-black/[0.02] dark:bg-black/40 border border-indigo-500/20 text-left sm:text-right">
                  <span className="text-[9px] font-mono uppercase tracking-[0.18em] text-neutral-400 dark:text-white/40 block">DELEGATE ID</span>
                  <span className="text-base font-mono font-black text-indigo-600 dark:text-indigo-300 tracking-wider block mt-0.5">
                    {delegateRecord.delegateId}
                  </span>
                </div>
              ) : (
                <span className="text-[11px] font-mono text-neutral-400 dark:text-white/40">
                  STATUS: <strong className="text-amber-500">PENDING</strong>
                </span>
              )}

              <button
                type="button"
                onClick={() => fetchDelegateProfile(user?.id, user?.email, true)}
                disabled={dataLoading}
                className="h-8 px-3 rounded-xl border border-black/10 dark:border-white/10 bg-black/[0.03] dark:bg-white/[0.04] hover:bg-black/[0.06] dark:hover:bg-white/[0.08] text-[11px] font-mono text-neutral-600 dark:text-white/70 hover:text-neutral-900 dark:hover:text-white flex items-center gap-1.5 transition-all cursor-pointer"
              >
                <RefreshCw className={`w-3 h-3 ${dataLoading ? "animate-spin text-indigo-500" : ""}`} />
                <span>{dataLoading ? "Syncing..." : "Sync Status"}</span>
              </button>
            </div>
          </div>
        </section>

        {/* STATE A: UNREGISTERED STATE */}
        {!isReg && (
          <section className="relative overflow-hidden rounded-3xl border border-amber-500/30 bg-amber-500/[0.03] dark:bg-[#120e09] p-6 sm:p-8 text-center space-y-5 shadow-sm">
            <div className="w-14 h-14 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center mx-auto text-amber-500">
              <FileCheck className="w-7 h-7" />
            </div>
            <div>
              <p className="text-[9px] font-mono uppercase tracking-[0.25em] text-amber-600 dark:text-amber-400 font-bold mb-1">
                ACTION REQUIRED · OFFICIAL INTAKE
              </p>
              <h2 className="text-xl sm:text-2xl font-extrabold uppercase tracking-tight text-neutral-900 dark:text-white" style={{ fontFamily: "'Inter', sans-serif" }}>
                Secure Your Seat at the Summit
              </h2>
              <p className="text-xs sm:text-sm text-neutral-600 dark:text-white/60 leading-relaxed max-w-md mx-auto mt-2">
                Your authenticated profile is active as <strong className="text-neutral-900 dark:text-white">{user.email}</strong>. Complete your registration to receive official committee allocations and your digital entrance QR dossier.
              </p>
            </div>

            {systemSettings.registrationsOpen ? (
              <div>
                <button
                  type="button"
                  onClick={() => setChoiceModalOpen(true)}
                  className="cta-btn-hero-match"
                >
                  <Sparkles className="w-4 h-4 mr-2" />
                  <span>Choose Registration Track</span>
                  <ArrowRight className="w-4 h-4 ml-2" />
                </button>
              </div>
            ) : (
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-red-500/10 border border-red-500/30 text-red-500 text-xs font-mono">
                <span>Registrations paused by the Secretariat.</span>
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-4 border-t border-black/[0.06] dark:border-white/[0.08]">
              {[
                { icon: Globe, label: "Country Matrix", desc: "Flagship committee allotment" },
                { icon: QrCode, label: "Encrypted Pass", desc: "Digital QR venue check-in" },
                { icon: Award, label: "Official Certificate", desc: "Accreditation & recognition" },
              ].map(({ icon: Icon, label, desc }) => (
                <div key={label} className="p-4 rounded-2xl bg-black/[0.02] dark:bg-black/30 border border-black/[0.06] dark:border-white/[0.06] text-center">
                  <Icon className="w-5 h-5 mx-auto mb-1.5 text-indigo-500 dark:text-indigo-400" />
                  <p className="text-xs font-bold text-neutral-900 dark:text-white">{label}</p>
                  <p className="text-[10px] text-neutral-500 dark:text-white/40 mt-0.5">{desc}</p>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* STATE B: REGISTERED STATE */}
        {isReg && (
          <div className="space-y-5">
            {/* DOSSIER & ALLOTMENT */}
            <section className="relative overflow-hidden rounded-3xl border border-black/10 dark:border-white/[0.1] bg-white/80 dark:bg-[#070919] backdrop-blur-2xl p-6 sm:p-7 shadow-sm">
              <div className="flex items-center justify-between mb-5">
                <div>
                  <p className="text-[9px] font-mono uppercase tracking-[0.25em] text-neutral-400 dark:text-white/40 mb-0.5 font-bold">
                    OFFICIAL DOSSIER
                  </p>
                  <h3 className="text-sm sm:text-base font-extrabold uppercase tracking-wide text-neutral-900 dark:text-white" style={{ fontFamily: "'Inter', sans-serif" }}>
                    Conference Registration Record
                  </h3>
                </div>
                <span className={`text-[10px] font-mono font-bold px-2.5 py-1 rounded-lg ${delegateRecord.delegationCode ? "text-indigo-600 dark:text-indigo-300 bg-indigo-500/10 border border-indigo-500/25" : "text-neutral-500 dark:text-white/40 bg-black/[0.03] dark:bg-white/[0.04] border border-black/[0.06] dark:border-white/[0.08]"}`}>
                  {delegateRecord.delegationCode ? `DELEGATION: ${delegateRecord.delegationCode}` : "INDEPENDENT DELEGATE"}
                </span>
              </div>

              {/* Committee Preferences */}
              <div className="mb-4">
                <p className="text-[9px] font-mono uppercase tracking-[0.18em] text-neutral-400 dark:text-white/35 mb-2 font-bold">
                  Committee Preferences Submitted
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                  {[1, 2, 3].map((n) => (
                    <div key={n} className="p-3.5 rounded-2xl bg-black/[0.02] dark:bg-black/30 border border-black/[0.06] dark:border-white/[0.08] hover:border-indigo-500/30 transition-colors">
                      <span className="text-[8px] font-mono uppercase tracking-[0.18em] text-neutral-400 dark:text-white/30 block font-bold">PREFERENCE {n}</span>
                      <span className="text-xs sm:text-sm font-bold text-neutral-900 dark:text-white mt-1 block leading-snug truncate">
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
              <div className="mt-4 p-4 rounded-2xl bg-black/[0.02] dark:bg-black/30 border border-black/[0.06] dark:border-white/[0.08] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <p className="text-[9px] font-mono uppercase tracking-[0.2em] text-neutral-400 dark:text-white/35 mb-1 font-bold">
                    Payment Verification Status
                  </p>
                  <div className="flex items-center gap-2">
                    {isPaid ? (
                      <>
                        <ShieldCheck className="w-4 h-4 text-emerald-500" />
                        <span className="text-xs sm:text-sm font-bold text-emerald-600 dark:text-emerald-400">VERIFIED &amp; CONFIRMED</span>
                      </>
                    ) : (
                      <>
                        <Clock className="w-4 h-4 text-amber-500 animate-pulse" />
                        <span className="text-xs sm:text-sm font-bold text-amber-600 dark:text-amber-400">UNDER SECRETARIAT REVIEW</span>
                      </>
                    )}
                  </div>
                  <p className="text-[11px] font-mono text-neutral-500 dark:text-white/40 mt-0.5">
                    UTR: <span className="font-semibold text-neutral-800 dark:text-white/70">{delegateRecord.paymentUTR || delegateRecord.txnId || "Awaiting submission"}</span>
                  </p>
                </div>
                {isPaid && (
                  <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/25 text-[10px] font-mono uppercase tracking-widest text-emerald-600 dark:text-emerald-300 font-bold">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse inline-block" />
                    Confirmed Pass
                  </span>
                )}
              </div>
            </section>

            {/* DIGITAL PASS WITH QR */}
            <section className="relative overflow-hidden rounded-3xl border border-black/10 dark:border-white/[0.1] bg-white/80 dark:bg-[#070919] backdrop-blur-2xl p-6 sm:p-7 shadow-sm">
              <div className="mb-5">
                <p className="text-[9px] font-mono uppercase tracking-[0.25em] text-neutral-400 dark:text-white/40 mb-0.5 font-bold">
                  ACCREDITATION
                </p>
                <h3 className="text-sm sm:text-base font-extrabold uppercase tracking-wide text-neutral-900 dark:text-white" style={{ fontFamily: "'Inter', sans-serif" }}>
                  Official Digital Conference Pass
                </h3>
                <p className="text-xs text-neutral-500 dark:text-white/40 mt-0.5">
                  Present this authenticated QR pass at the venue entrance checkpoint for seamless roll call and credential verification.
                </p>
              </div>

              {isPaid ? (
                <div className="flex flex-col items-center">
                  <div className="relative w-full max-w-xs mx-auto">
                    <div className="relative rounded-3xl overflow-hidden border border-black/10 dark:border-white/15 bg-white dark:bg-[#050714] shadow-xl">
                      <div className="bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 px-5 py-3 flex items-center justify-between text-white">
                        <div>
                          <p className="text-[8px] font-mono uppercase tracking-[0.25em] text-white/80 font-bold">Resolve MUN 2.0</p>
                          <p className="text-xs font-extrabold tracking-widest uppercase">Digital Pass</p>
                        </div>
                        <ShieldCheck className="w-5 h-5 text-white" />
                      </div>

                      <div className="p-5 flex flex-col items-center gap-4">
                        <div className="p-3 rounded-2xl bg-white border border-neutral-200 shadow-inner">
                          <img
                            src={`https://quickchart.io/qr?size=220&text=${encodeURIComponent("RESOLVE_PASS:" + delegateRecord.delegateId + ":" + delegateRecord.email)}`}
                            alt="QR Pass"
                            className="w-40 h-40 block"
                          />
                        </div>

                        <div className="text-center space-y-1 w-full">
                          <p className="text-sm font-extrabold uppercase text-neutral-900 dark:text-white">
                            {delegateRecord.fullName || user.displayName}
                          </p>
                          <p className="text-[10px] font-mono font-bold text-indigo-600 dark:text-indigo-400 tracking-widest">
                            {delegateRecord.delegateId}
                          </p>
                          {isAllotted && (
                            <div className="flex items-center justify-center gap-2 mt-1">
                              <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/15 border border-emerald-500/25 text-[10px] font-bold text-emerald-600 dark:text-emerald-300 font-mono">
                                {delegateRecord.allocatedCommittee}
                              </span>
                              <span className="text-[10px] text-neutral-500 dark:text-white/50 truncate max-w-[120px]">
                                {delegateRecord.allocatedCountry}
                              </span>
                            </div>
                          )}
                        </div>

                        <div className="w-full flex items-center justify-between pt-3 border-t border-black/[0.06] dark:border-white/[0.08]">
                          <span className="text-[9px] font-mono text-neutral-400 dark:text-white/35 uppercase tracking-widest">resolvemun.in</span>
                          <span className="flex items-center gap-1 text-[9px] font-mono text-emerald-500 uppercase tracking-widest font-bold">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse inline-block" />Verified
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                  <p className="text-[10px] text-neutral-400 dark:text-white/30 mt-4 text-center max-w-xs leading-relaxed">
                    Checkpoint scan via official Secretariat terminals.
                  </p>
                </div>
              ) : (
                <div className="flex flex-col items-center py-8 text-center space-y-4">
                  <div className="relative">
                    <div className="w-16 h-16 rounded-2xl bg-neutral-100 dark:bg-white/[0.04] border border-black/10 dark:border-white/[0.08] flex items-center justify-center mx-auto text-neutral-400 dark:text-white/20">
                      <Lock className="w-8 h-8" />
                    </div>
                    <div className="absolute -top-1 -right-1 w-6 h-6 rounded-full bg-amber-500/20 border border-amber-500/30 flex items-center justify-center text-amber-500">
                      <Clock className="w-3 h-3" />
                    </div>
                  </div>
                  <div className="space-y-1.5 max-w-sm">
                    <h4 className="text-sm font-bold uppercase tracking-wider text-neutral-900 dark:text-white">
                      Pass Awaiting Verification
                    </h4>
                    <p className="text-xs text-neutral-500 dark:text-white/50 leading-relaxed">
                      Your payment (UTR: <span className="font-mono text-neutral-800 dark:text-white/80">{delegateRecord.paymentUTR || delegateRecord.txnId || "Submitted"}</span>) is currently being reconciled. Your QR access pass activates automatically upon Secretariat approval.
                    </p>
                  </div>
                  <div className="flex items-center gap-2 text-[10px] font-mono text-amber-600 dark:text-amber-400">
                    <RefreshCw className="w-3 h-3 animate-spin" style={{ animationDuration: "3s" }} />
                    <span>Awaiting confirmation from Directorate</span>
                  </div>
                </div>
              )}
            </section>
          </div>
        )}

        {/* QUICK ACTIONS CARD */}
        <section className="p-5 sm:p-6 rounded-3xl border border-black/10 dark:border-white/[0.1] bg-white/80 dark:bg-[#070919] backdrop-blur-2xl space-y-3 shadow-sm">
          <p className="text-[9px] font-mono uppercase tracking-[0.25em] text-neutral-400 dark:text-white/35 font-bold">
            PORTAL SHORTCUTS
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            <Link
              href="/"
              className="group flex items-center gap-3 p-3.5 rounded-2xl bg-black/[0.02] dark:bg-white/[0.025] hover:bg-black/[0.05] dark:hover:bg-white/[0.06] border border-black/[0.06] dark:border-white/[0.06] hover:border-indigo-500/30 transition-all"
            >
              <Globe className="w-4 h-4 text-neutral-400 dark:text-white/35 group-hover:text-indigo-500 dark:group-hover:text-indigo-400 transition-colors shrink-0" />
              <span className="text-xs font-semibold text-neutral-700 dark:text-white/70 group-hover:text-neutral-900 dark:group-hover:text-white transition-colors">
                Return to Conference Home
              </span>
              <ExternalLink className="w-3.5 h-3.5 text-neutral-300 dark:text-white/20 ml-auto group-hover:text-neutral-500 dark:group-hover:text-white/50 transition-colors" />
            </Link>

            <button
              type="button"
              onClick={() => fetchDelegateProfile(user?.id, user?.email, true)}
              className="group flex items-center gap-3 p-3.5 rounded-2xl bg-black/[0.02] dark:bg-white/[0.025] hover:bg-black/[0.05] dark:hover:bg-white/[0.06] border border-black/[0.06] dark:border-white/[0.06] hover:border-indigo-500/30 transition-all cursor-pointer w-full text-left"
            >
              <RefreshCw className={`w-4 h-4 text-neutral-400 dark:text-white/35 group-hover:text-indigo-500 dark:group-hover:text-indigo-400 transition-colors shrink-0 ${dataLoading ? "animate-spin" : ""}`} />
              <span className="text-xs font-semibold text-neutral-700 dark:text-white/70 group-hover:text-neutral-900 dark:group-hover:text-white transition-colors">
                Sync Registration Record
              </span>
              {dataLoading && <span className="text-[10px] font-mono text-indigo-500 ml-auto">Syncing...</span>}
            </button>

            {!isReg && systemSettings.registrationsOpen && (
              <button
                type="button"
                onClick={() => setChoiceModalOpen(true)}
                className="group flex items-center gap-3 p-3.5 rounded-2xl bg-indigo-500/10 hover:bg-indigo-500/15 border border-indigo-500/25 hover:border-indigo-500/40 transition-all cursor-pointer col-span-full"
              >
                <Sparkles className="w-4 h-4 text-indigo-500 shrink-0" />
                <span className="text-xs font-bold text-indigo-600 dark:text-indigo-300 uppercase tracking-wider">
                  Open Application Matrix &rarr;
                </span>
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
