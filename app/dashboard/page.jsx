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
import {
  CheckCircle2, Clock, QrCode, Lock, ArrowRight,
  RefreshCw, User, Users, ShieldCheck, FileCheck, ChevronRight, X,
  Sparkles, Globe, Award, Star, Briefcase, Zap, ExternalLink, ArrowLeft,
  LayoutDashboard, Calendar, MapPin, FileText, HelpCircle, Phone, Menu,
  Printer, Check, AlertCircle, Download, Mail, Info, Compass
} from "lucide-react";

function FloatingOrbs() {
  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden z-0 opacity-30 select-none" aria-hidden="true">
      <div className="absolute top-[-15%] left-[-10%] w-[50vw] h-[50vw] max-w-[500px] max-h-[500px] rounded-full bg-indigo-600/15 blur-[120px] animate-pulse" style={{ animationDuration: "10s" }} />
      <div className="absolute bottom-[-10%] right-[-5%] w-[45vw] h-[45vw] max-w-[450px] max-h-[450px] rounded-full bg-purple-600/15 blur-[120px] animate-pulse" style={{ animationDuration: "12s", animationDelay: "3s" }} />
    </div>
  );
}

function StatusPill({ ok, okLabel, pendingLabel, lockedLabel, locked }) {
  if (locked) return (
    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-mono font-bold tracking-widest uppercase bg-white/[0.04] text-white/40 border border-white/10">
      <span className="w-1.5 h-1.5 rounded-full bg-white/40 inline-block" />{lockedLabel}
    </span>
  );
  if (ok) return (
    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-mono font-bold tracking-widest uppercase bg-emerald-500/15 text-emerald-300 border border-emerald-500/25">
      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 inline-block animate-pulse" />{okLabel}
    </span>
  );
  return (
    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-mono font-bold tracking-widest uppercase bg-amber-500/15 text-amber-300 border border-amber-500/25">
      <span className="w-1.5 h-1.5 rounded-full bg-amber-400 inline-block animate-pulse" />{pendingLabel}
    </span>
  );
}

function DataTile({ label, value, accent, sub }) {
  return (
    <div className="p-4 rounded-xl bg-[#090b16] border border-white/10 space-y-1 hover:border-white/20 transition-all">
      <span className="text-[10px] font-mono uppercase tracking-[0.16em] text-white/40 block font-semibold">{label}</span>
      <span className={`text-sm sm:text-base font-bold block leading-tight truncate ${accent ? "text-indigo-300" : "text-white"}`}>
        {value || "—"}
      </span>
      {sub && <span className="text-[11px] text-white/40 block">{sub}</span>}
    </div>
  );
}

/**
 * PARTICIPATION PATHWAY CARD (FOR UNREGISTERED USERS)
 */
function ChoosePathwayBlock({ onSelect }) {
  const handleSelect = (pathway) => {
    if (onSelect) {
      onSelect(pathway);
    } else {
      window.location.href = `/?open=${pathway}`;
    }
  };

  return (
    <section className="space-y-4 text-left font-sans" aria-labelledby="dashboard-pathway-title">
      <div className="flex items-center justify-between">
        <span className="text-[10px] font-mono tracking-[0.2em] text-indigo-400 uppercase font-semibold">
          HYDERABAD 2026
        </span>
        <span className="text-[10px] font-mono tracking-[0.15em] text-white/40 uppercase font-semibold truncate">
          DWPS KOMPALLY
        </span>
      </div>

      <div>
        <span className="block mb-1 text-[10px] font-mono font-medium tracking-[0.18em] uppercase text-indigo-300/80">
          SELECT YOUR PARTICIPATION TRACK
        </span>
        <h2 id="dashboard-pathway-title" className="font-sans text-2xl font-bold tracking-tight text-white leading-tight">
          Choose Your Pathway
        </h2>
        <p className="mt-1 text-xs text-white/50 leading-relaxed font-sans max-w-[44ch]">
          Register now to unlock your digital badge, committee allocation, and access to Resolve MUN 2.0.
        </p>
      </div>

      <div className="space-y-3 pt-1">
        {/* 1. Delegate */}
        <div
          role="button"
          tabIndex={0}
          onClick={() => handleSelect("delegate")}
          onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); handleSelect("delegate"); } }}
          className="group relative flex w-full items-center justify-between gap-4 rounded-xl border border-white/15 bg-[#090b16] px-4 py-3.5 text-left transition-all duration-200 hover:border-indigo-400/40 hover:bg-[#0f1224] hover:shadow-[0_4px_25px_rgba(99,102,241,0.15)] cursor-pointer active:scale-[0.99]"
        >
          <div className="space-y-1 min-w-0 flex-1">
            <div className="flex items-center gap-2">
              <span className="font-sans font-bold text-sm text-white tracking-tight">
                Individual Delegate
              </span>
              <span className="text-[9px] font-mono uppercase tracking-wider px-2 py-0.5 rounded-full bg-violet-500/10 border border-violet-400/20 text-violet-300 font-semibold">
                ₹2799 · Priority
              </span>
            </div>
            <span className="block text-xs text-white/50 leading-normal group-hover:text-white/70 transition-colors">
              Single delegate representation in one specialized committee of your choice.
            </span>
          </div>
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-white/15 bg-white/[0.03] text-white/40 group-hover:text-white group-hover:border-indigo-400/40 transition-all">
            <ChevronRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
          </span>
        </div>

        {/* 2. Delegation */}
        <div
          role="button"
          tabIndex={0}
          onClick={() => handleSelect("delegation")}
          onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); handleSelect("delegation"); } }}
          className="group relative flex w-full items-center justify-between gap-4 rounded-xl border border-white/15 bg-[#090b16] px-4 py-3.5 text-left transition-all duration-200 hover:border-sky-400/40 hover:bg-[#0f1224] hover:shadow-[0_4px_25px_rgba(56,189,248,0.15)] cursor-pointer active:scale-[0.99]"
        >
          <div className="space-y-1 min-w-0 flex-1">
            <div className="flex items-center gap-2">
              <span className="font-sans font-bold text-sm text-white tracking-tight">
                Institutional Delegation
              </span>
              <span className="text-[9px] font-mono uppercase tracking-wider px-2 py-0.5 rounded-full bg-sky-500/10 border border-sky-400/20 text-sky-300 font-semibold">
                School / College
              </span>
            </div>
            <span className="block text-xs text-white/50 leading-normal group-hover:text-white/70 transition-colors">
              Represent your institution with a delegation of 8+ student delegates.
            </span>
          </div>
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-white/15 bg-white/[0.03] text-white/40 group-hover:text-white group-hover:border-sky-400/40 transition-all">
            <ChevronRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
          </span>
        </div>

        {/* 3. Secretariat */}
        <div
          role="button"
          tabIndex={0}
          onClick={() => handleSelect("secretariat")}
          onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); handleSelect("secretariat"); } }}
          className="group relative flex w-full items-center justify-between gap-4 rounded-xl border border-white/15 bg-[#090b16] px-4 py-3.5 text-left transition-all duration-200 hover:border-purple-400/40 hover:bg-[#0f1224] hover:shadow-[0_4px_25px_rgba(168,85,247,0.15)] cursor-pointer active:scale-[0.99]"
        >
          <div className="space-y-1 min-w-0 flex-1">
            <div className="flex items-center gap-2">
              <span className="font-sans font-bold text-sm text-white tracking-tight">
                Secretariat & Executive Board
              </span>
              <span className="text-[9px] font-mono uppercase tracking-wider px-2 py-0.5 rounded-full bg-purple-500/10 border border-purple-400/20 text-purple-300 font-semibold">
                Leadership
              </span>
            </div>
            <span className="block text-xs text-white/50 leading-normal group-hover:text-white/70 transition-colors">
              High-command leadership, USG positions, and committee directors.
            </span>
          </div>
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-white/15 bg-white/[0.03] text-white/40 group-hover:text-white group-hover:border-purple-400/40 transition-all">
            <ChevronRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
          </span>
        </div>
      </div>
    </section>
  );
}

export default function DelegateDashboard() {
  const [user, setUser] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [delegateRecord, setDelegateRecord] = useState(null);
  const [dataLoading, setDataLoading] = useState(false);
  const [systemSettings, setSystemSettings] = useState({
    registrationsOpen: true,
    roundName: "Round 1 Applications",
    delegateBaseFee: 2799,
  });
  const [activeTab, setActiveTab] = useState("overview"); // overview, pass, committee, schedule, application, support
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [notification, setNotification] = useState("");

  const showToast = (msg) => {
    setNotification(msg);
    setTimeout(() => setNotification(""), 3500);
  };

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
        const delegateId =
          record.regId ||
          record.delegateId ||
          (record.id ? `RM26-DEL-${String(record.id).slice(0, 4).toUpperCase()}` : "RM26-DEL-CONFIRMED");
        const fullName = record.fullName || record.name || (user?.displayName || "Delegate");
        const paymentUTR = record.paymentUTR || record.payment_utr || record.txnID || "VERIFIED";
        const status = record.status || "Confirmed";
        const isPaymentOk =
          status === "Confirmed" ||
          status === "Payment_Verified" ||
          status === "Manual_Approved" ||
          status === "APPROVED" ||
          (paymentUTR && String(paymentUTR).trim().length > 3);

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
        if (force) showToast("Registration data synced with Firestore!");
      } else {
        // Fallback: Check local registration persistence
        const isLocallyRegistered =
          typeof window !== "undefined" && localStorage.getItem("resolve_user_registered") === "true";
        if (isLocallyRegistered) {
          const storedEmail = localStorage.getItem("resolve_user_email") || email;
          const storedName = localStorage.getItem("resolve_user_name") || user?.displayName || "Delegate";
          const storedId = localStorage.getItem("resolve_delegate_id") || "RM26-DEL-CONFIRMED";
          setDelegateRecord({
            regId: storedId,
            delegateId: storedId,
            fullName: storedName,
            email: storedEmail,
            status: "Confirmed",
            paymentStatus: "VERIFIED",
            institution: "Individual Delegate",
          });
          if (force) showToast("Loaded profile from cache!");
        } else {
          setDelegateRecord(null);
          if (force) showToast("No registration found yet.");
        }
      }

      if (settings) {
        setSystemSettings({
          registrationsOpen: settings.registrations_open !== false,
          roundName: settings.round_name || "Round 1 Applications",
          delegateBaseFee: settings.delegate_base_fee || 2799,
        });
      }
    } catch (e) {
      console.error("[Dashboard] Error fetching profile:", e);
      showToast("Sync error. Please try again.");
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

  const isReg = Boolean(
    delegateRecord &&
      (delegateRecord.regId || delegateRecord.delegateId || delegateRecord.fullName || delegateRecord.found)
  );
  const isPaid =
    isReg &&
    (delegateRecord.paymentStatus === "VERIFIED" ||
      delegateRecord.status === "Confirmed" ||
      delegateRecord.status === "Manual_Approved" ||
      delegateRecord.status === "Payment_Verified" ||
      delegateRecord.status === "ALLOTTED" ||
      delegateRecord.status === "APPROVED" ||
      Boolean(delegateRecord.paymentUTR && String(delegateRecord.paymentUTR).trim().length > 3));
  const isAllotted = isReg && Boolean(delegateRecord.allocatedCommittee);

  const displayName = user?.displayName || user?.email?.split("@")[0] || "Delegate";
  const initials = (user?.displayName || user?.email || "D")
    .split(" ")
    .map((w) => w[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  const handlePrintPass = () => {
    window.print();
  };

  if (authLoading) {
    return (
      <div className="min-h-screen bg-[#05060c] text-white flex flex-col items-center justify-center gap-5">
        <FloatingOrbs />
        <div className="relative z-10 flex flex-col items-center gap-4">
          <div className="w-14 h-14 rounded-2xl border border-white/20 bg-[#090b16] flex items-center justify-center shadow-[0_0_30px_rgba(99,102,241,0.3)]">
            <span className="font-extrabold text-white font-mono text-xl">R</span>
          </div>
          <div className="flex gap-1.5">
            {[0, 1, 2].map((i) => (
              <div
                key={i}
                className="w-2 h-2 rounded-full bg-indigo-400 animate-bounce"
                style={{ animationDelay: `${i * 0.15}s` }}
              />
            ))}
          </div>
          <p className="font-mono text-[11px] uppercase tracking-[0.25em] text-white/50">Verifying Session</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-[#05060c] text-white flex flex-col justify-between selection:bg-indigo-500/30">
        <div className="flex-1 flex items-center justify-center p-4">
          <FloatingOrbs />
          <div className="relative z-10 w-full max-w-md p-8 sm:p-9 rounded-2xl border border-indigo-500/30 bg-[#070916] backdrop-blur-2xl text-center space-y-6 shadow-[0_25px_70px_rgba(0,0,0,0.85)]">
            <div className="w-16 h-16 rounded-2xl border border-indigo-400/30 bg-indigo-500/10 flex items-center justify-center mx-auto text-indigo-400 shadow-[0_0_25px_rgba(99,102,241,0.25)]">
              <Lock className="w-7 h-7" />
            </div>
            <div>
              <p className="text-[10px] font-mono uppercase tracking-[0.25em] text-indigo-400 mb-2 font-bold">
                DELEGATE PORTAL · SECURE AREA
              </p>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight font-sans">
                Sign In Required
              </h1>
              <p className="text-xs text-white/60 mt-2.5 leading-relaxed font-sans">
                Access your official Resolve MUN 2.0 digital badge, committee matrix allotment, conference itinerary, and delegate dossier.
              </p>
            </div>
            <Link
              href="/?open=auth"
              className="flex h-12 w-full items-center justify-center rounded-xl bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 text-xs font-bold uppercase tracking-wider text-white transition-all hover:brightness-110 active:scale-[0.99] shadow-[0_0_25px_rgba(99,102,241,0.4)]"
            >
              Sign In to Portal <ArrowRight className="w-4 h-4 ml-2" />
            </Link>
            <div className="pt-2 border-t border-white/10">
              <Link href="/" className="text-xs text-white/40 hover:text-white transition-colors flex items-center justify-center gap-1.5">
                <ArrowLeft className="w-3.5 h-3.5" /> Return to Resolve MUN Homepage
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const navItems = [
    { id: "overview", label: "Overview", icon: LayoutDashboard, badge: null },
    { id: "pass", label: "Digital Access Pass", icon: QrCode, badge: isPaid ? "ACTIVE" : "PENDING" },
    { id: "committee", label: "Committee & Allotment", icon: Globe, badge: isAllotted ? "ALLOTTED" : null },
    { id: "schedule", label: "Schedule & Venue", icon: Calendar, badge: "3 DAYS" },
    { id: "application", label: "Registration Details", icon: FileText, badge: isReg ? "SAVED" : null },
    { id: "support", label: "Helpline & Support", icon: HelpCircle, badge: null },
  ];

  return (
    <div className="min-h-screen bg-[#05060c] text-white font-sans selection:bg-indigo-500/30 flex flex-col lg:flex-row relative">
      <FloatingOrbs />

      {/* TOAST NOTIFICATION */}
      {notification && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-2.5 px-4 py-3 rounded-xl bg-[#090d24] border border-indigo-400/40 text-white text-xs shadow-2xl animate-in fade-in slide-in-from-bottom-3 duration-200">
          <Info className="w-4 h-4 text-indigo-400" />
          <span>{notification}</span>
        </div>
      )}

      {/* MOBILE BACKDROP FOR SIDEBAR */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/80 backdrop-blur-sm lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* ============================================================ */}
      {/* SIDEBAR NAVIGATION                                            */}
      {/* ============================================================ */}
      <aside
        className={`fixed top-0 bottom-0 left-0 z-50 w-72 bg-[#070914] border-r border-white/10 flex flex-col justify-between transition-transform duration-300 ease-in-out lg:translate-x-0 ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex flex-col h-full overflow-y-auto">
          {/* Brand Header */}
          <div className="p-5 border-b border-white/10 flex items-center justify-between">
            <Link href="/" className="flex items-center gap-3 group">
              <div className="w-10 h-10 rounded-xl bg-white/[0.04] border border-indigo-400/30 p-2 flex items-center justify-center shadow-[0_0_15px_rgba(99,102,241,0.2)] group-hover:border-indigo-400/60 transition-colors">
                <img
                  src="https://resolvemun.in/images/Logo.svg"
                  alt="Resolve MUN Emblem"
                  className="w-full h-full object-contain filter brightness-110"
                />
              </div>
              <div>
                <span className="text-sm font-extrabold tracking-wider uppercase text-white block font-sans">
                  RESOLVE MUN 2.0
                </span>
                <span className="text-[10px] font-mono text-indigo-400 tracking-widest uppercase block">
                  HYDERABAD 2026
                </span>
              </div>
            </Link>
            <button
              type="button"
              onClick={() => setSidebarOpen(false)}
              className="lg:hidden p-1.5 rounded-lg text-white/50 hover:text-white hover:bg-white/10"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* User Profile Mini-Card in Sidebar */}
          <div className="p-4 mx-3 my-3 rounded-xl bg-[#090c1e] border border-white/10">
            <div className="flex items-center gap-3">
              <div className="relative shrink-0">
                {user.photoURL ? (
                  <img
                    src={user.photoURL}
                    alt={displayName}
                    className="w-11 h-11 rounded-xl object-cover border border-white/20"
                  />
                ) : (
                  <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-[#1b1e42] to-[#090b16] flex items-center justify-center text-white font-bold text-sm border border-indigo-500/30">
                    {initials}
                  </div>
                )}
                {isPaid && (
                  <div className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full bg-emerald-500 border-2 border-[#090c1e] flex items-center justify-center text-black">
                    <Check className="w-2.5 h-2.5 stroke-[3]" />
                  </div>
                )}
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-xs font-bold text-white truncate uppercase">{displayName}</p>
                <p className="text-[10px] font-mono text-white/40 truncate">{user.email}</p>
                <div className="mt-1 flex items-center gap-1.5">
                  <span className="inline-block w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  <span className="text-[9px] font-mono text-emerald-300 font-semibold tracking-wider uppercase">
                    {isReg ? (delegateRecord.delegateId || "DELEGATE") : "AUTHENTICATED"}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="px-3 py-2 space-y-1 flex-1">
            <span className="px-3 text-[9px] font-mono tracking-[0.2em] text-white/30 uppercase block mb-2 font-semibold">
              NAVIGATION
            </span>
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => {
                    setActiveTab(item.id);
                    setSidebarOpen(false);
                  }}
                  className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold tracking-wide transition-all cursor-pointer ${
                    isActive
                      ? "bg-gradient-to-r from-indigo-600/30 to-purple-600/20 text-white border border-indigo-500/40 shadow-[0_0_15px_rgba(99,102,241,0.15)]"
                      : "text-white/60 hover:text-white hover:bg-white/[0.04] border border-transparent"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Icon className={`w-4 h-4 ${isActive ? "text-indigo-400" : "text-white/40"}`} />
                    <span>{item.label}</span>
                  </div>
                  {item.badge && (
                    <span
                      className={`text-[9px] font-mono font-bold px-1.5 py-0.5 rounded ${
                        isActive
                          ? "bg-indigo-500/30 text-indigo-200"
                          : "bg-white/[0.06] text-white/50"
                      }`}
                    >
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>

          {/* Sidebar Bottom Controls */}
          <div className="p-4 border-t border-white/10 space-y-2">
            <button
              type="button"
              onClick={() => fetchDelegateProfile(user?.id, user?.email, true)}
              disabled={dataLoading}
              className="w-full h-9 px-3 rounded-xl border border-white/10 bg-white/[0.03] hover:bg-white/[0.07] text-[11px] font-mono text-white/70 hover:text-white flex items-center justify-center gap-2 transition-all cursor-pointer"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${dataLoading ? "animate-spin text-indigo-400" : ""}`} />
              <span>{dataLoading ? "Syncing Firestore..." : "Sync Profile (Live)"}</span>
            </button>

            <Link
              href="/"
              className="w-full h-9 px-3 rounded-xl border border-white/10 bg-white/[0.02] hover:bg-white/[0.06] text-[11px] font-semibold text-white/60 hover:text-white flex items-center justify-center gap-2 transition-all"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Back to Home</span>
            </Link>

            <button
              type="button"
              onClick={handleSignOut}
              className="w-full h-9 px-3 rounded-xl border border-red-500/20 bg-red-500/5 hover:bg-red-500/15 text-[11px] font-mono text-red-300 hover:text-red-200 flex items-center justify-center gap-2 transition-colors cursor-pointer"
            >
              Sign Out
            </button>
          </div>
        </div>
      </aside>

      {/* ============================================================ */}
      {/* MAIN CONTENT AREA                                             */}
      {/* ============================================================ */}
      <div className="flex-1 lg:pl-72 flex flex-col min-h-screen">
        
        {/* Top Navbar */}
        <header className="sticky top-0 z-30 h-16 bg-[#05060c]/90 backdrop-blur-xl border-b border-white/10 px-4 sm:px-8 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden p-2 rounded-xl border border-white/15 bg-white/[0.04] text-white"
              aria-label="Open sidebar"
            >
              <Menu className="w-5 h-5" />
            </button>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-mono tracking-widest text-indigo-400 uppercase font-semibold">
                  RESOLVE 2.0
                </span>
                <span className="text-white/20">/</span>
                <span className="text-xs font-semibold text-white/80 capitalize">
                  {activeTab.replace("-", " ")}
                </span>
              </div>
              <h2 className="text-sm sm:text-base font-extrabold tracking-wide uppercase text-white">
                {navItems.find((n) => n.id === activeTab)?.label || "Dashboard"}
              </h2>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="hidden sm:flex items-center gap-2 py-1 px-3 rounded-full bg-white/[0.04] border border-white/10 text-[10px] font-mono text-white/60">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span>HYDERABAD 2026</span>
            </div>

            <button
              type="button"
              onClick={() => fetchDelegateProfile(user?.id, user?.email, true)}
              title="Sync with Firestore"
              className="h-9 px-3 rounded-xl border border-white/15 bg-white/[0.03] hover:bg-white/[0.08] text-xs font-mono text-white/80 hover:text-white flex items-center gap-1.5 transition-all cursor-pointer"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${dataLoading ? "animate-spin text-indigo-400" : ""}`} />
              <span className="hidden md:inline">{dataLoading ? "Syncing..." : "Sync"}</span>
            </button>
          </div>
        </header>

        {/* Content Body */}
        <main className="flex-1 p-4 sm:p-8 max-w-6xl w-full mx-auto space-y-6">

          {/* ============================================================ */}
          {/* TAB 1: OVERVIEW PAGE                                         */}
          {/* ============================================================ */}
          {activeTab === "overview" && (
            <div className="space-y-6 animate-in fade-in duration-200">
              {/* HERO BANNER CARD */}
              <section className="relative overflow-hidden rounded-2xl border border-indigo-500/25 bg-gradient-to-br from-[#0c102a] via-[#070918] to-[#04050c] p-6 sm:p-8 shadow-[0_20px_60px_rgba(0,0,0,0.6)]">
                <div className="absolute top-0 inset-x-0 h-[2px] bg-gradient-to-r from-violet-500 via-indigo-500 to-blue-500" />
                
                <div className="relative flex flex-col md:flex-row md:items-center justify-between gap-6">
                  <div className="space-y-2">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="px-2.5 py-0.5 rounded-full text-[9px] font-mono font-bold tracking-widest uppercase bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                        {systemSettings.roundName}
                      </span>
                      <span className="text-[10px] font-mono text-white/40">20TH – 22ND NOVEMBER 2026</span>
                    </div>
                    <h1 className="text-2xl sm:text-3xl font-extrabold uppercase tracking-tight text-white font-sans">
                      Welcome, {displayName}
                    </h1>
                    <p className="text-xs sm:text-sm text-white/60 max-w-xl leading-relaxed">
                      Your official delegate command center. Track your seat confirmation, access your digital badge, view committee allocations, and prepare for debate at DWPS Kompally.
                    </p>
                  </div>

                  <div className="flex flex-col sm:flex-row md:flex-col items-start md:items-end gap-2.5 shrink-0">
                    <div className="p-3.5 rounded-xl bg-[#090b16] border border-white/10 text-left md:text-right w-full sm:w-auto">
                      <span className="text-[9px] font-mono uppercase tracking-[0.18em] text-white/40 block">DELEGATE IDENTIFIER</span>
                      <span className="text-base font-mono font-extrabold text-indigo-300 tracking-wider block mt-0.5">
                        {isReg ? (delegateRecord.delegateId || "RM26-DEL-CONFIRMED") : "NOT REGISTERED"}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 w-full sm:w-auto">
                      <StatusPill ok={isReg} okLabel="Registered" pendingLabel="Not Registered" />
                      <StatusPill locked={!isReg} ok={isPaid} okLabel="Seat Confirmed" pendingLabel="Verification Pending" lockedLabel="Payment Required" />
                    </div>
                  </div>
                </div>

                <div className="mt-6 pt-5 border-t border-white/10 grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs font-sans text-white/60">
                  <div>
                    <span className="text-[9px] font-mono uppercase tracking-wider text-white/30 block">VENUE</span>
                    <strong className="text-white">DWPS Kompally</strong>
                  </div>
                  <div>
                    <span className="text-[9px] font-mono uppercase tracking-wider text-white/30 block">CITY</span>
                    <strong className="text-white">Hyderabad, India</strong>
                  </div>
                  <div>
                    <span className="text-[9px] font-mono uppercase tracking-wider text-white/30 block">STATUS</span>
                    <strong className="text-emerald-400 font-semibold">{isPaid ? "Cleared & Verified" : "Registration Open"}</strong>
                  </div>
                  <div>
                    <span className="text-[9px] font-mono uppercase tracking-wider text-white/30 block">FEE</span>
                    <strong className="text-indigo-300">₹{systemSettings.delegateBaseFee}</strong>
                  </div>
                </div>
              </section>

              {/* 4 STAT TILES */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
                <DataTile
                  label="Conference Pass"
                  value={isPaid ? "Ready & Verified" : isReg ? "Under Review" : "Awaiting Registration"}
                  accent={isPaid}
                  sub="Entrance QR Code"
                />
                <DataTile
                  label="Committee Matrix"
                  value={isAllotted ? delegateRecord.allocatedCommittee : isReg ? "Preferences Submitted" : "Pending Selection"}
                  accent={isAllotted}
                  sub={isAllotted ? delegateRecord.allocatedCountry : "Round 1 Processing"}
                />
                <DataTile
                  label="Institution"
                  value={delegateRecord?.institution || "Individual Delegate"}
                  sub="Affiliation"
                />
                <DataTile
                  label="Payment Reference"
                  value={delegateRecord?.paymentUTR || delegateRecord?.txnId || (isReg ? "Verified" : "Pending")}
                  sub="Bank Verification"
                />
              </div>

              {/* UNREGISTERED STATE CALL TO ACTION */}
              {!isReg && (
                <section className="p-6 sm:p-8 rounded-2xl border border-indigo-500/20 bg-[#07080e] shadow-xl">
                  <ChoosePathwayBlock onSelect={(track) => { window.location.href = `/?open=${track}`; }} />
                </section>
              )}

              {/* REGISTERED STATE: CHECKLIST & PASS PREVIEW */}
              {isReg && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Readiness Checklist */}
                  <div className="p-6 rounded-2xl border border-white/10 bg-[#070914] space-y-4">
                    <div className="flex items-center justify-between">
                      <h3 className="text-sm font-extrabold uppercase tracking-wide text-white">
                        Delegate Preparation Checklist
                      </h3>
                      <span className="text-[10px] font-mono text-indigo-400">RESOLVE 2026</span>
                    </div>

                    <div className="space-y-3">
                      <div className="flex items-start gap-3 p-3 rounded-xl bg-white/[0.02] border border-white/5">
                        <div className="w-5 h-5 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0 mt-0.5">
                          <Check className="w-3 h-3 stroke-[3]" />
                        </div>
                        <div>
                          <p className="text-xs font-bold text-white">Registration & Credentials Verified</p>
                          <p className="text-[11px] text-white/50">Your account is connected to Resolve MUN 2.0.</p>
                        </div>
                      </div>

                      <div className="flex items-start gap-3 p-3 rounded-xl bg-white/[0.02] border border-white/5">
                        <div className={`w-5 h-5 rounded-full flex items-center justify-center shrink-0 mt-0.5 ${isPaid ? "bg-emerald-500/20 text-emerald-400" : "bg-amber-500/20 text-amber-400"}`}>
                          {isPaid ? <Check className="w-3 h-3 stroke-[3]" /> : <Clock className="w-3 h-3" />}
                        </div>
                        <div>
                          <p className="text-xs font-bold text-white">Payment & Seat Clearance</p>
                          <p className="text-[11px] text-white/50">
                            {isPaid ? "Payment cleared and seat permanently booked." : "Payment under Secretariat review."}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-start gap-3 p-3 rounded-xl bg-white/[0.02] border border-white/5">
                        <div className={`w-5 h-5 rounded-full flex items-center justify-center shrink-0 mt-0.5 ${isAllotted ? "bg-emerald-500/20 text-emerald-400" : "bg-indigo-500/20 text-indigo-400"}`}>
                          {isAllotted ? <Check className="w-3 h-3 stroke-[3]" /> : <Clock className="w-3 h-3" />}
                        </div>
                        <div>
                          <p className="text-xs font-bold text-white">Committee Matrix Allocation</p>
                          <p className="text-[11px] text-white/50">
                            {isAllotted
                              ? `Allotted to ${delegateRecord.allocatedCommittee} (${delegateRecord.allocatedCountry || "Delegate"})`
                              : "Preferences submitted. Official matrix published soon."}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-start gap-3 p-3 rounded-xl bg-white/[0.02] border border-white/5">
                        <div className="w-5 h-5 rounded-full bg-white/10 text-white/60 flex items-center justify-center shrink-0 mt-0.5">
                          <MapPin className="w-3 h-3" />
                        </div>
                        <div>
                          <p className="text-xs font-bold text-white">Conference Roll-Call</p>
                          <p className="text-[11px] text-white/50">Delhi World Public School, Kompally on Nov 20, 2026 at 08:30 AM.</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Fast Pass Snapshot Card */}
                  <div className="p-6 rounded-2xl border border-white/10 bg-[#070914] flex flex-col justify-between space-y-4">
                    <div>
                      <div className="flex items-center justify-between mb-3">
                        <h3 className="text-sm font-extrabold uppercase tracking-wide text-white">
                          Digital Conference Pass
                        </h3>
                        <span className="text-[9px] font-mono text-emerald-400 bg-emerald-500/10 border border-emerald-500/25 px-2 py-0.5 rounded-full font-bold">
                          {isPaid ? "CLEARED" : "PENDING"}
                        </span>
                      </div>
                      <p className="text-xs text-white/50 leading-relaxed">
                        Present this authenticated QR pass at the entrance terminal of Delhi World Public School, Kompally.
                      </p>
                    </div>

                    <div className="p-4 rounded-xl bg-[#090c1e] border border-white/10 flex items-center gap-4">
                      <div className="p-2 rounded-lg bg-white shrink-0 shadow-md">
                        <img
                          src={`https://api.qrserver.com/v1/create-qr-code/?size=160x160&data=${encodeURIComponent("https://resolvemun.in/scan?id=" + (delegateRecord.delegateId || user.email))}&bgcolor=ffffff&color=05060c&margin=1`}
                          alt="QR Pass"
                          className="w-16 h-16 block"
                        />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-xs font-bold text-white uppercase truncate">{delegateRecord.fullName || displayName}</p>
                        <p className="text-[10px] font-mono text-indigo-300 font-bold">{delegateRecord.delegateId || "RM26-DEL"}</p>
                        <p className="text-[10px] text-white/40 truncate mt-0.5">{delegateRecord.institution || "Delegate"}</p>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => setActiveTab("pass")}
                      className="w-full h-10 rounded-xl bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 text-white font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 hover:brightness-110 active:scale-[0.99] transition-all cursor-pointer shadow-[0_0_20px_rgba(99,102,241,0.3)]"
                    >
                      <span>View Full Pass</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ============================================================ */}
          {/* TAB 2: DIGITAL ACCESS PASS                                   */}
          {/* ============================================================ */}
          {activeTab === "pass" && (
            <div className="space-y-6 animate-in fade-in duration-200">
              <div className="text-center max-w-xl mx-auto space-y-2">
                <span className="text-[10px] font-mono tracking-[0.25em] text-indigo-400 uppercase font-bold">
                  OFFICIAL ACCREDITATION
                </span>
                <h1 className="text-2xl sm:text-3xl font-extrabold uppercase tracking-tight text-white font-sans">
                  Digital Access Pass
                </h1>
                <p className="text-xs sm:text-sm text-white/60 leading-relaxed">
                  Your electronic credential for admission into committee rooms, opening ceremonies, and conference socials.
                </p>
              </div>

              {/* HOLOGRAPHIC LUXURY PASS CARD */}
              <div className="relative max-w-sm mx-auto w-full">
                <div className="relative rounded-3xl overflow-hidden border border-indigo-500/40 bg-gradient-to-b from-[#0b0e24] via-[#070918] to-[#04050c] shadow-[0_25px_80px_rgba(0,0,0,0.9),0_0_40px_rgba(99,102,241,0.2)]">
                  {/* Top Holographic Strip */}
                  <div className="bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 px-6 py-4 flex items-center justify-between text-white">
                    <div className="flex items-center gap-2.5">
                      <div className="w-7 h-7 rounded-lg bg-white/10 p-1 flex items-center justify-center">
                        <img
                          src="https://resolvemun.in/images/Logo.svg"
                          alt="Resolve MUN"
                          className="w-full h-full object-contain brightness-125"
                        />
                      </div>
                      <div>
                        <p className="text-[8px] font-mono uppercase tracking-[0.25em] text-white/80 font-bold">RESOLVE MUN 2.0</p>
                        <p className="text-xs font-black tracking-wider uppercase font-sans">DELEGATE ACCESS PASS</p>
                      </div>
                    </div>
                    <ShieldCheck className="w-5 h-5 text-white/90" />
                  </div>

                  {/* Pass Body */}
                  <div className="p-6 flex flex-col items-center gap-5">
                    {/* QR Code Container with Scanning Corners */}
                    <div className="relative p-4 rounded-2xl bg-white shadow-2xl">
                      <img
                        src={`https://api.qrserver.com/v1/create-qr-code/?size=260x260&data=${encodeURIComponent("https://resolvemun.in/scan?id=" + (delegateRecord?.delegateId || user.email))}&bgcolor=ffffff&color=05060c&margin=1`}
                        alt="Delegate QR Code"
                        className="w-48 h-48 block"
                      />
                      <div className="absolute top-2 left-2 w-3 h-3 border-t-2 border-l-2 border-indigo-600 pointer-events-none" />
                      <div className="absolute top-2 right-2 w-3 h-3 border-t-2 border-r-2 border-indigo-600 pointer-events-none" />
                      <div className="absolute bottom-2 left-2 w-3 h-3 border-b-2 border-l-2 border-indigo-600 pointer-events-none" />
                      <div className="absolute bottom-2 right-2 w-3 h-3 border-b-2 border-r-2 border-indigo-600 pointer-events-none" />
                    </div>

                    {/* Delegate Metadata */}
                    <div className="text-center space-y-1.5 w-full">
                      <p className="text-lg font-extrabold uppercase text-white tracking-wide font-sans">
                        {delegateRecord?.fullName || displayName}
                      </p>
                      <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/30">
                        <span className="text-xs font-mono font-bold text-indigo-300 tracking-wider">
                          {delegateRecord?.delegateId || "RM26-DEL-CONFIRMED"}
                        </span>
                      </div>
                      <p className="text-xs text-white/60 truncate max-w-xs mx-auto">
                        {delegateRecord?.institution || "Individual Delegate"}
                      </p>

                      {isAllotted && (
                        <div className="pt-2 flex items-center justify-center gap-2">
                          <span className="px-2.5 py-1 rounded-lg bg-emerald-500/15 border border-emerald-500/25 text-[11px] font-bold text-emerald-300 font-mono">
                            {delegateRecord.allocatedCommittee}
                          </span>
                          <span className="text-xs text-white/70 font-semibold">
                            {delegateRecord.allocatedCountry || "Delegate"}
                          </span>
                        </div>
                      )}
                    </div>

                    {/* Security Micro Footer */}
                    <div className="w-full flex items-center justify-between pt-4 border-t border-white/10 text-[10px] font-mono">
                      <span className="text-white/40 uppercase tracking-wider">DWPS Kompally</span>
                      <span className="flex items-center gap-1.5 text-emerald-400 font-bold uppercase tracking-wider">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                        {isPaid ? "CLEARED" : "VERIFYING"}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Print & Download Actions */}
                <div className="mt-5 flex items-center justify-center gap-3">
                  <button
                    type="button"
                    onClick={handlePrintPass}
                    className="h-10 px-5 rounded-xl border border-white/20 bg-white/[0.05] hover:bg-white/[0.1] text-xs font-semibold text-white flex items-center gap-2 transition-all cursor-pointer shadow-sm active:scale-95"
                  >
                    <Printer className="w-3.5 h-3.5" />
                    <span>Print / Save PDF</span>
                  </button>
                  <a
                    href={`https://api.qrserver.com/v1/create-qr-code/?size=600x600&data=${encodeURIComponent("https://resolvemun.in/scan?id=" + (delegateRecord?.delegateId || user.email))}`}
                    download="resolve-mun-pass-qr.png"
                    target="_blank"
                    rel="noreferrer"
                    className="h-10 px-5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-xs font-bold uppercase tracking-wider text-white flex items-center gap-2 transition-all shadow-md active:scale-95"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Download QR</span>
                  </a>
                </div>
              </div>
            </div>
          )}

          {/* ============================================================ */}
          {/* TAB 3: COMMITTEE & ALLOTMENT                                 */}
          {/* ============================================================ */}
          {activeTab === "committee" && (
            <div className="space-y-6 animate-in fade-in duration-200">
              <div>
                <span className="text-[10px] font-mono tracking-[0.2em] text-indigo-400 uppercase font-bold">
                  ACADEMIC AFFAIRS
                </span>
                <h1 className="text-2xl sm:text-3xl font-extrabold uppercase tracking-tight text-white font-sans mt-1">
                  Committee Matrix &amp; Allotment
                </h1>
                <p className="text-xs sm:text-sm text-white/60 mt-1">
                  Check your committee assignment, agenda topic, study guides, and rules of procedure.
                </p>
              </div>

              {/* ALLOTMENT STATUS BANNER */}
              <div className="p-6 rounded-2xl border border-white/10 bg-[#070914] space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-extrabold uppercase tracking-wide text-white">
                    Current Allotment Status
                  </h3>
                  <StatusPill
                    ok={isAllotted}
                    okLabel="Portfolio Allocated"
                    pendingLabel="Allotment in Progress"
                  />
                </div>

                {isAllotted ? (
                  <div className="p-5 rounded-xl bg-[#090d24] border border-indigo-500/30 space-y-3">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                      <div>
                        <span className="text-[9px] font-mono uppercase tracking-widest text-indigo-300">ALLOCATED COMMITTEE</span>
                        <h4 className="text-xl font-extrabold text-white">{delegateRecord.allocatedCommittee}</h4>
                      </div>
                      <div>
                        <span className="text-[9px] font-mono uppercase tracking-widest text-indigo-300">PORTFOLIO / COUNTRY</span>
                        <h4 className="text-xl font-extrabold text-emerald-400">{delegateRecord.allocatedCountry || "Delegate"}</h4>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/25 flex items-start gap-3">
                    <Clock className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
                    <div>
                      <h4 className="text-xs font-bold text-amber-300 uppercase">Round 1 Matrix Under Review</h4>
                      <p className="text-xs text-white/60 mt-0.5 leading-relaxed">
                        The Executive Board and Secretariat are actively assigning country portfolios based on delegate experience and preferences. Your confirmed assignment will appear here.
                      </p>
                    </div>
                  </div>
                )}

                {/* Submitted Preferences */}
                <div className="space-y-2 pt-2">
                  <span className="text-[10px] font-mono uppercase tracking-[0.16em] text-white/40 block font-semibold">
                    YOUR SUBMITTED PREFERENCES
                  </span>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    {[1, 2, 3].map((n) => (
                      <div key={n} className="p-4 rounded-xl bg-[#090b16] border border-white/10 space-y-1">
                        <span className="text-[9px] font-mono text-indigo-400 font-bold uppercase tracking-wider block">
                          PREFERENCE {n}
                        </span>
                        <p className="text-xs sm:text-sm font-bold text-white truncate">
                          {delegateRecord?.[`pref${n}`] || "—"}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* ACADEMIC RESOURCES DOWNLOAD */}
              <div className="p-6 rounded-2xl border border-white/10 bg-[#070914] space-y-4">
                <h3 className="text-sm font-extrabold uppercase tracking-wide text-white">
                  Delegate Study Guides &amp; Handbooks
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="p-4 rounded-xl bg-[#090b16] border border-white/10 flex items-center justify-between gap-3">
                    <div className="space-y-0.5">
                      <p className="text-xs font-bold text-white">Rules of Procedure (RoP)</p>
                      <p className="text-[11px] text-white/40">UNA-USA &amp; Indian Committee Procedures</p>
                    </div>
                    <span className="text-[10px] font-mono font-bold text-indigo-300 bg-indigo-500/10 border border-indigo-500/30 px-2.5 py-1 rounded-lg">
                      PDF Guide
                    </span>
                  </div>

                  <div className="p-4 rounded-xl bg-[#090b16] border border-white/10 flex items-center justify-between gap-3">
                    <div className="space-y-0.5">
                      <p className="text-xs font-bold text-white">Position Paper Template</p>
                      <p className="text-[11px] text-white/40">Official Resolve MUN formatting guide</p>
                    </div>
                    <span className="text-[10px] font-mono font-bold text-indigo-300 bg-indigo-500/10 border border-indigo-500/30 px-2.5 py-1 rounded-lg">
                      Template
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ============================================================ */}
          {/* TAB 4: SCHEDULE & VENUE                                      */}
          {/* ============================================================ */}
          {activeTab === "schedule" && (
            <div className="space-y-6 animate-in fade-in duration-200">
              <div>
                <span className="text-[10px] font-mono tracking-[0.2em] text-indigo-400 uppercase font-bold">
                  ITINERARY &amp; LOGISTICS
                </span>
                <h1 className="text-2xl sm:text-3xl font-extrabold uppercase tracking-tight text-white font-sans mt-1">
                  Schedule &amp; Venue Guide
                </h1>
                <p className="text-xs sm:text-sm text-white/60 mt-1">
                  3 days of intense diplomacy, committee sessions, and crisis deliberations at DWPS Kompally.
                </p>
              </div>

              {/* VENUE CARD WITH MAP LINK */}
              <div className="p-6 rounded-2xl border border-white/10 bg-[#070914] flex flex-col md:flex-row md:items-center justify-between gap-5">
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-indigo-400 animate-pulse" />
                    <span className="text-[10px] font-mono uppercase tracking-widest text-indigo-300 font-bold">
                      OFFICIAL HOST VENUE
                    </span>
                  </div>
                  <h3 className="text-lg font-bold text-white">Delhi World Public School, Kompally</h3>
                  <p className="text-xs text-white/60 max-w-md leading-relaxed">
                    Survey No. 288, Bahadurpally Village, Dundigal Gandimaisamma Mandal, Medchal-Malkajgiri, Hyderabad, Telangana 500043.
                  </p>
                </div>
                <a
                  href="https://maps.google.com/?q=Delhi+World+Public+School+Kompally+Hyderabad"
                  target="_blank"
                  rel="noreferrer"
                  className="h-11 px-5 rounded-xl bg-white text-black text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2 hover:bg-white/90 transition-all shrink-0 shadow-[0_0_20px_rgba(255,255,255,0.2)]"
                >
                  <MapPin className="w-4 h-4" />
                  <span>Open in Google Maps</span>
                  <ExternalLink className="w-3.5 h-3.5 ml-1 opacity-60" />
                </a>
              </div>

              {/* 3-DAY TIMELINE */}
              <div className="space-y-4">
                <h3 className="text-sm font-extrabold uppercase tracking-wide text-white">
                  3-Day Conference Timeline
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {/* Day 1 */}
                  <div className="p-5 rounded-2xl border border-white/10 bg-[#070914] space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-mono font-bold text-indigo-400 uppercase">DAY 1</span>
                      <span className="text-[10px] font-mono text-white/40">20 NOV 2026</span>
                    </div>
                    <h4 className="text-sm font-bold text-white">Opening &amp; Initial Debates</h4>
                    <ul className="space-y-2 text-xs text-white/60">
                      <li>• 08:30 – 10:00: Delegate Registration &amp; Badging</li>
                      <li>• 10:00 – 11:30: Opening Ceremony &amp; Keynote</li>
                      <li>• 11:45 – 13:30: Committee Session I (Agenda Setting)</li>
                      <li>• 13:30 – 14:30: High Tea &amp; Delegate Lunch</li>
                      <li>• 14:30 – 17:30: Committee Session II (General Debate)</li>
                    </ul>
                  </div>

                  {/* Day 2 */}
                  <div className="p-5 rounded-2xl border border-white/10 bg-[#070914] space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-mono font-bold text-indigo-400 uppercase">DAY 2</span>
                      <span className="text-[10px] font-mono text-white/40">21 NOV 2026</span>
                    </div>
                    <h4 className="text-sm font-bold text-white">Crisis &amp; Working Papers</h4>
                    <ul className="space-y-2 text-xs text-white/60">
                      <li>• 09:00 – 11:30: Committee Session III (Moderated Caucus)</li>
                      <li>• 11:45 – 13:30: Committee Session IV (Midnight Crisis Break)</li>
                      <li>• 13:30 – 14:30: Delegate Lunch</li>
                      <li>• 14:30 – 17:00: Committee Session V (Draft Resolutions)</li>
                      <li>• 18:00 – 20:30: Official Delegate Socials &amp; Networking</li>
                    </ul>
                  </div>

                  {/* Day 3 */}
                  <div className="p-5 rounded-2xl border border-white/10 bg-[#070914] space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-mono font-bold text-indigo-400 uppercase">DAY 3</span>
                      <span className="text-[10px] font-mono text-white/40">22 NOV 2026</span>
                    </div>
                    <h4 className="text-sm font-bold text-white">Resolutions &amp; Awards</h4>
                    <ul className="space-y-2 text-xs text-white/60">
                      <li>• 09:30 – 12:30: Final Voting on Draft Resolutions</li>
                      <li>• 12:30 – 13:30: Farewell Lunch</li>
                      <li>• 14:00 – 16:30: Valedictory Ceremony &amp; Awards</li>
                      <li>• 16:30 – 17:30: Certificate Distribution &amp; Dispersal</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ============================================================ */}
          {/* TAB 5: REGISTRATION DETAILS                                  */}
          {/* ============================================================ */}
          {activeTab === "application" && (
            <div className="space-y-6 animate-in fade-in duration-200">
              <div>
                <span className="text-[10px] font-mono tracking-[0.2em] text-indigo-400 uppercase font-bold">
                  DELEGATE DOSSIER
                </span>
                <h1 className="text-2xl sm:text-3xl font-extrabold uppercase tracking-tight text-white font-sans mt-1">
                  Registration Information
                </h1>
                <p className="text-xs sm:text-sm text-white/60 mt-1">
                  Full registration details stored in Cloud Firestore database.
                </p>
              </div>

              {isReg ? (
                <div className="p-6 sm:p-8 rounded-2xl border border-white/10 bg-[#070914] space-y-6">
                  <div className="flex items-center justify-between pb-4 border-b border-white/10">
                    <div>
                      <p className="text-xs text-white/40 font-mono">REGISTRATION ID</p>
                      <h3 className="text-lg font-mono font-black text-indigo-300 mt-0.5">
                        {delegateRecord.delegateId || "RM26-DEL-CONFIRMED"}
                      </h3>
                    </div>
                    <StatusPill ok={isPaid} okLabel="Verified &amp; Paid" pendingLabel="Under Review" />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                    <DataTile label="Full Legal Name" value={delegateRecord.fullName || displayName} />
                    <DataTile label="Registered Email" value={delegateRecord.email || user.email} />
                    <DataTile label="Phone Number" value={delegateRecord.phone || "—"} />
                    <DataTile label="Institution / School" value={delegateRecord.institution || "—"} />
                    <DataTile label="Grade / Academic Year" value={delegateRecord.grade || "—"} />
                    <DataTile label="Registration Fee" value={`₹${systemSettings.delegateBaseFee}`} />
                    <DataTile label="Transaction UTR" value={delegateRecord.paymentUTR || "VERIFIED"} accent />
                    <DataTile label="Payment Status" value={delegateRecord.paymentStatus || "VERIFIED"} accent />
                    <DataTile label="Application Status" value={delegateRecord.status || "Confirmed"} />
                  </div>

                  {delegateRecord.emergency_phone && (
                    <div className="pt-4 border-t border-white/10">
                      <span className="text-[10px] font-mono uppercase tracking-wider text-white/40 block mb-2 font-bold">
                        EMERGENCY CONTACT
                      </span>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <DataTile label="Contact Name" value={delegateRecord.emergency_name || "Parent / Guardian"} />
                        <DataTile label="Contact Phone" value={delegateRecord.emergency_phone} />
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="p-8 rounded-2xl border border-white/10 bg-[#070914] text-center space-y-4">
                  <div className="w-14 h-14 rounded-2xl bg-white/[0.03] border border-white/10 flex items-center justify-center mx-auto text-white/40">
                    <FileText className="w-7 h-7" />
                  </div>
                  <h3 className="text-base font-bold text-white">No Registration Record Found</h3>
                  <p className="text-xs text-white/50 max-w-md mx-auto leading-relaxed">
                    You haven't submitted a delegate application for this account yet. Click below to register for Hyderabad 2026.
                  </p>
                  <button
                    type="button"
                    onClick={() => { window.location.href = "/?open=delegate"; }}
                    className="h-10 px-6 rounded-xl bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 text-xs font-bold uppercase tracking-wider text-white cursor-pointer"
                  >
                    Register as Delegate
                  </button>
                </div>
              )}
            </div>
          )}

          {/* ============================================================ */}
          {/* TAB 6: SUPPORT & HELPLINE                                    */}
          {/* ============================================================ */}
          {activeTab === "support" && (
            <div className="space-y-6 animate-in fade-in duration-200">
              <div>
                <span className="text-[10px] font-mono tracking-[0.2em] text-indigo-400 uppercase font-bold">
                  DELEGATE RELATIONS
                </span>
                <h1 className="text-2xl sm:text-3xl font-extrabold uppercase tracking-tight text-white font-sans mt-1">
                  Support &amp; Delegate Affairs
                </h1>
                <p className="text-xs sm:text-sm text-white/60 mt-1">
                  Have questions regarding your registration, committee matrix, or accommodation? Our Secretariat is here to help.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                {/* Official Contact Card */}
                <div className="p-6 rounded-2xl border border-white/10 bg-[#070914] space-y-4">
                  <h3 className="text-sm font-extrabold uppercase tracking-wide text-white">
                    Emergency &amp; Delegate Hotline
                  </h3>
                  <p className="text-xs text-white/60 leading-relaxed">
                    For urgent questions regarding payment confirmations, transport assistance, or delegation registrations:
                  </p>
                  
                  <div className="space-y-3 pt-2">
                    <a
                      href="tel:+919212107797"
                      className="flex items-center gap-3 p-3.5 rounded-xl bg-[#090b16] border border-white/10 hover:border-indigo-400/40 text-white transition-all"
                    >
                      <div className="w-9 h-9 rounded-lg bg-indigo-500/10 text-indigo-400 flex items-center justify-center shrink-0">
                        <Phone className="w-4 h-4" />
                      </div>
                      <div>
                        <span className="text-[9px] font-mono text-white/40 uppercase block">PHONE HELPLINE</span>
                        <strong className="text-sm font-mono text-white">+91 92121 07797</strong>
                      </div>
                    </a>

                    <a
                      href="mailto:resolvemun2026@gmail.com"
                      className="flex items-center gap-3 p-3.5 rounded-xl bg-[#090b16] border border-white/10 hover:border-indigo-400/40 text-white transition-all"
                    >
                      <div className="w-9 h-9 rounded-lg bg-purple-500/10 text-purple-400 flex items-center justify-center shrink-0">
                        <Mail className="w-4 h-4" />
                      </div>
                      <div>
                        <span className="text-[9px] font-mono text-white/40 uppercase block">SECRETARIAT EMAIL</span>
                        <strong className="text-sm font-mono text-white">resolvemun2026@gmail.com</strong>
                      </div>
                    </a>
                  </div>
                </div>

                {/* Frequently Asked Questions */}
                <div className="p-6 rounded-2xl border border-white/10 bg-[#070914] space-y-4">
                  <h3 className="text-sm font-extrabold uppercase tracking-wide text-white">
                    Frequently Asked Questions
                  </h3>
                  <div className="space-y-3 text-xs">
                    <div className="p-3.5 rounded-xl bg-[#090b16] border border-white/10 space-y-1">
                      <p className="font-bold text-white">When will committee matrix allotments be announced?</p>
                      <p className="text-white/60 leading-relaxed">
                        Round 1 priority allocations will be released directly on your dashboard within 48 hours of verification.
                      </p>
                    </div>

                    <div className="p-3.5 rounded-xl bg-[#090b16] border border-white/10 space-y-1">
                      <p className="font-bold text-white">What should I bring on Conference Day 1?</p>
                      <p className="text-white/60 leading-relaxed">
                        Please carry your digital access pass (on phone or printed), an institutional ID card, and a notebook/laptop.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

        </main>
      </div>
    </div>
  );
}
