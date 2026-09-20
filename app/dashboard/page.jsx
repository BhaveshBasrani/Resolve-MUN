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
  Home,
  MessageSquare,
  Activity,
  Settings,
  Lock,
  LogOut,
  Search,
  Bell,
  Calendar,
  ChevronRight,
  TrendingUp,
  Clock,
  CheckCircle2,
  QrCode,
  ShieldCheck,
  Printer,
  Download,
  ExternalLink,
  MapPin,
  RefreshCw,
  X,
  Menu,
  Phone,
  Mail,
  FileText,
  Users,
  Award,
  Sparkles,
  Check
} from "lucide-react";

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
  const [activeTab, setActiveTab] = useState("dashboard"); // dashboard, pass, committee, schedule, settings, support
  const [searchQuery, setSearchQuery] = useState("");
  const [notification, setNotification] = useState("");
  const [sidebarMobileOpen, setSidebarMobileOpen] = useState(false);

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
        if (force) showToast("Live data synced with Cloud Firestore!");
      } else {
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
      showToast("Sync error. Please retry.");
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
  const initials = (user?.displayName || user?.email || "YN")
    .split(" ")
    .map((w) => w[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  if (authLoading) {
    return (
      <div className="min-h-screen bg-[#cce5dc] flex items-center justify-center p-4">
        <div className="flex flex-col items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-[#1d6f54] text-white flex items-center justify-center font-bold text-xl shadow-lg animate-bounce">
            R
          </div>
          <p className="font-mono text-xs font-bold text-[#1d6f54] tracking-wider uppercase">Loading Resolve MUN Portal...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-[#cce5dc] flex items-center justify-center p-4">
        <div className="w-full max-w-md bg-white rounded-[32px] p-8 text-center shadow-2xl space-y-6">
          <div className="w-16 h-16 rounded-full bg-[#1d6f54]/10 text-[#1d6f54] flex items-center justify-center mx-auto">
            <Lock className="w-7 h-7" />
          </div>
          <div>
            <span className="text-[10px] font-mono font-bold tracking-widest text-[#1d6f54] uppercase block mb-1">
              RESOLVE MUN 2026
            </span>
            <h2 className="text-2xl font-bold text-slate-800 tracking-tight">Authentication Required</h2>
            <p className="text-xs text-slate-500 mt-2 leading-relaxed">
              Sign in with your verified credentials to access committee allocations, digital pass, and conference details.
            </p>
          </div>
          <Link
            href="/?open=auth"
            className="flex h-12 w-full items-center justify-center rounded-full bg-[#1d6f54] text-white text-xs font-bold uppercase tracking-wider shadow-lg hover:bg-[#165a44] transition-all"
          >
            Sign In to Dashboard
          </Link>
          <Link href="/" className="text-xs text-slate-400 hover:text-slate-600 block">
            Return to Resolve MUN Homepage
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#cbe5dc] py-6 px-3 sm:px-6 md:py-10 flex items-center justify-center font-sans antialiased text-slate-800 selection:bg-[#1d6f54]/20">
      
      {/* Toast alert */}
      {notification && (
        <div className="fixed top-6 right-6 z-50 flex items-center gap-2 px-4 py-3 rounded-xl bg-[#1d6f54] text-white text-xs font-semibold shadow-xl animate-in fade-in slide-in-from-top-3">
          <CheckCircle2 className="w-4 h-4" />
          <span>{notification}</span>
        </div>
      )}

      {/* ============================================================ */}
      {/* MAIN ENCLOSED DASHBOARD CARD (Matches Image Exactly)        */}
      {/* ============================================================ */}
      <div className="w-full max-w-[1240px] bg-white rounded-[32px] sm:rounded-[36px] shadow-[0_20px_60px_rgba(18,56,43,0.18)] overflow-hidden flex flex-col md:flex-row min-h-[760px] border border-[#1d6f54]/10">
        
        {/* ============================================================ */}
        {/* LEFT SIDEBAR (PINE GREEN #1d6f54)                           */}
        {/* ============================================================ */}
        <aside
          className={`w-full md:w-[240px] lg:w-[260px] bg-[#1e6f54] text-white p-6 sm:p-7 flex flex-col justify-between shrink-0 transition-all ${
            sidebarMobileOpen ? "block" : "hidden md:flex"
          }`}
        >
          <div className="space-y-8">
            {/* Logo */}
            <div className="flex items-center justify-between">
              <Link href="/" className="flex items-center gap-2.5 group">
                <div className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center text-white">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.8" strokeLinecap="round" strokeLinejoin="round"><path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"/></svg>
                </div>
                <span className="font-bold text-base tracking-tight text-white group-hover:text-emerald-200 transition-colors">
                  Resolve MUN
                </span>
              </Link>
              <button
                type="button"
                onClick={() => setSidebarMobileOpen(false)}
                className="md:hidden text-white/70 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Navigation List */}
            <nav className="space-y-2">
              <button
                type="button"
                onClick={() => setActiveTab("dashboard")}
                className={`w-full flex items-center justify-between px-3.5 py-3 rounded-xl text-sm font-medium transition-colors cursor-pointer ${
                  activeTab === "dashboard"
                    ? "text-white font-semibold"
                    : "text-white/70 hover:text-white hover:bg-white/5"
                }`}
              >
                <div className="flex items-center gap-3.5">
                  <Home className="w-5 h-5" />
                  <span>Dashboard</span>
                </div>
                {activeTab === "dashboard" && <span className="w-2 h-2 rounded-full bg-white shadow-sm" />}
              </button>

              <button
                type="button"
                onClick={() => setActiveTab("pass")}
                className={`w-full flex items-center justify-between px-3.5 py-3 rounded-xl text-sm font-medium transition-colors cursor-pointer ${
                  activeTab === "pass"
                    ? "text-white font-semibold"
                    : "text-white/70 hover:text-white hover:bg-white/5"
                }`}
              >
                <div className="flex items-center gap-3.5">
                  <QrCode className="w-5 h-5" />
                  <span>Digital Pass</span>
                </div>
                {activeTab === "pass" && <span className="w-2 h-2 rounded-full bg-white shadow-sm" />}
              </button>

              <button
                type="button"
                onClick={() => setActiveTab("committee")}
                className={`w-full flex items-center justify-between px-3.5 py-3 rounded-xl text-sm font-medium transition-colors cursor-pointer ${
                  activeTab === "committee"
                    ? "text-white font-semibold"
                    : "text-white/70 hover:text-white hover:bg-white/5"
                }`}
              >
                <div className="flex items-center gap-3.5">
                  <Activity className="w-5 h-5" />
                  <span>Committee</span>
                </div>
                {activeTab === "committee" && <span className="w-2 h-2 rounded-full bg-white shadow-sm" />}
              </button>

              <button
                type="button"
                onClick={() => setActiveTab("schedule")}
                className={`w-full flex items-center justify-between px-3.5 py-3 rounded-xl text-sm font-medium transition-colors cursor-pointer ${
                  activeTab === "schedule"
                    ? "text-white font-semibold"
                    : "text-white/70 hover:text-white hover:bg-white/5"
                }`}
              >
                <div className="flex items-center gap-3.5">
                  <Calendar className="w-5 h-5" />
                  <span>Schedule</span>
                </div>
                {activeTab === "schedule" && <span className="w-2 h-2 rounded-full bg-white shadow-sm" />}
              </button>

              <button
                type="button"
                onClick={() => setActiveTab("settings")}
                className={`w-full flex items-center justify-between px-3.5 py-3 rounded-xl text-sm font-medium transition-colors cursor-pointer ${
                  activeTab === "settings"
                    ? "text-white font-semibold"
                    : "text-white/70 hover:text-white hover:bg-white/5"
                }`}
              >
                <div className="flex items-center gap-3.5">
                  <Settings className="w-5 h-5" />
                  <span>Setting</span>
                </div>
                {activeTab === "settings" && <span className="w-2 h-2 rounded-full bg-white shadow-sm" />}
              </button>

              <button
                type="button"
                onClick={() => setActiveTab("support")}
                className={`w-full flex items-center justify-between px-3.5 py-3 rounded-xl text-sm font-medium transition-colors cursor-pointer ${
                  activeTab === "support"
                    ? "text-white font-semibold"
                    : "text-white/70 hover:text-white hover:bg-white/5"
                }`}
              >
                <div className="flex items-center gap-3.5">
                  <Lock className="w-5 h-5" />
                  <span>Privacy</span>
                </div>
                {activeTab === "support" && <span className="w-2 h-2 rounded-full bg-white shadow-sm" />}
              </button>
            </nav>
          </div>

          {/* Bottom Logout Pill (Matches Image) */}
          <div className="pt-6">
            <button
              type="button"
              onClick={handleSignOut}
              className="w-full h-11 px-5 rounded-full bg-white text-[#1e6f54] text-sm font-bold flex items-center justify-center gap-2 shadow-md hover:bg-emerald-50 active:scale-[0.98] transition-all cursor-pointer"
            >
              <LogOut className="w-4 h-4 rotate-180" />
              <span>Logout</span>
            </button>
          </div>
        </aside>

        {/* ============================================================ */}
        {/* RIGHT MAIN WORKSPACE (LIGHT SLATE #f4f7f6)                  */}
        {/* ============================================================ */}
        <div className="flex-1 bg-[#f4f7f6] p-5 sm:p-8 flex flex-col justify-between overflow-y-auto">
          
          <div className="space-y-6">
            {/* Top Bar (Matches Image: Search Pill on Left, Action Pill on Right) */}
            <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              
              {/* Mobile hamburger */}
              <div className="flex items-center justify-between sm:hidden">
                <button
                  type="button"
                  onClick={() => setSidebarMobileOpen(true)}
                  className="p-2 rounded-xl bg-white text-[#1e6f54] shadow-sm"
                >
                  <Menu className="w-5 h-5" />
                </button>
                <span className="font-bold text-sm text-[#1e6f54]">RESOLVE MUN 2026</span>
              </div>

              {/* Search Pill */}
              <div className="relative w-full sm:w-72">
                <input
                  type="text"
                  placeholder="Search..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full h-10 pl-5 pr-10 rounded-full bg-white text-xs text-slate-700 placeholder:text-slate-400 shadow-sm border-0 focus:ring-2 focus:ring-[#1e6f54]/30 outline-none"
                />
                <Search className="w-4 h-4 text-slate-400 absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              </div>

              {/* Right Action Capsule Cluster (Matches Image) */}
              <div className="flex items-center gap-3 self-end sm:self-auto">
                <div className="h-10 pl-3 pr-1 py-1 rounded-full bg-[#1e6f54] flex items-center gap-3 shadow-md">
                  
                  {/* Dashed Upload / Action Pill */}
                  <button
                    type="button"
                    onClick={() => {
                      if (!isReg) {
                        window.location.href = "/?open=delegate";
                      } else {
                        fetchDelegateProfile(user?.id, user?.email, true);
                      }
                    }}
                    className="h-7 px-3 rounded-full border border-dashed border-white/60 text-white text-[11px] font-medium hover:bg-white/10 transition-colors flex items-center gap-1.5 cursor-pointer"
                  >
                    <span>{isReg ? "+ Sync" : "+ Register"}</span>
                  </button>

                  {/* Notification Bell */}
                  <button
                    type="button"
                    onClick={() => showToast("All notifications up to date.")}
                    className="text-white/80 hover:text-white relative p-1"
                    title="Notifications"
                  >
                    <Bell className="w-4 h-4" />
                    <span className="absolute top-1 right-1 w-1.5 h-1.5 rounded-full bg-emerald-300" />
                  </button>

                  {/* Circular User Avatar Pill */}
                  <div className="w-8 h-8 rounded-full bg-white text-[#1e6f54] font-bold text-xs flex items-center justify-center shadow-inner">
                    {initials}
                  </div>
                </div>
              </div>
            </header>

            {/* ============================================================ */}
            {/* TAB: DASHBOARD (EXACT GRID AS THE IMAGE)                    */}
            {/* ============================================================ */}
            {activeTab === "dashboard" && (
              <div className="space-y-6 animate-in fade-in duration-200">
                
                {/* ROW 1: TOP 2 CARDS */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
                  
                  {/* Card 1: Analytics Bar Chart (lg:col-span-7) */}
                  <div className="lg:col-span-7 bg-white rounded-2xl p-5 sm:p-6 shadow-sm border border-slate-100 flex flex-col justify-between">
                    <div className="flex items-center justify-between mb-4">
                      <span className="font-bold text-sm text-slate-800">Conference Analytics</span>
                      <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#1e6f54] text-white text-[11px] font-medium shadow-sm">
                        <Calendar className="w-3 h-3" />
                        <span>Nov 2026</span>
                      </div>
                    </div>

                    {/* Chart Container with Benchmark Line */}
                    <div className="relative pt-6 pb-2">
                      {/* Dashed orange benchmark line */}
                      <div className="absolute top-10 inset-x-0 border-b-2 border-dashed border-amber-400 z-10 opacity-75" />

                      {/* Bar Visualization */}
                      <div className="h-40 flex items-end justify-around gap-2 px-2">
                        {/* October Group */}
                        <div className="flex flex-col items-center gap-2 flex-1">
                          <div className="w-full flex items-end justify-center gap-1.5 h-32">
                            <div className="w-3 sm:w-4 h-16 rounded-t-sm bg-slate-100" />
                            <div className="w-3 sm:w-4 h-24 rounded-t-sm bg-[#8dcbb8]" />
                          </div>
                          <span className="text-[11px] font-medium text-slate-400">Day 1 (20th)</span>
                        </div>

                        {/* November Group (Peak) */}
                        <div className="flex flex-col items-center gap-2 flex-1">
                          <div className="w-full flex items-end justify-center gap-1.5 h-32">
                            <div className="w-3 sm:w-4 h-20 rounded-t-sm bg-slate-100" />
                            <div className="w-3 sm:w-4 h-32 rounded-t-sm bg-[#52aa91]" />
                            <div className="w-3 sm:w-4 h-28 rounded-t-sm bg-[#8dcbb8]" />
                          </div>
                          <span className="text-[11px] font-medium text-slate-700 font-bold">Day 2 (21st)</span>
                        </div>

                        {/* December Group */}
                        <div className="flex flex-col items-center gap-2 flex-1">
                          <div className="w-full flex items-end justify-center gap-1.5 h-32">
                            <div className="w-3 sm:w-4 h-12 rounded-t-sm bg-slate-100" />
                            <div className="w-3 sm:w-4 h-22 rounded-t-sm bg-[#8dcbb8]" />
                            <div className="w-3 sm:w-4 h-14 rounded-t-sm bg-slate-100" />
                          </div>
                          <span className="text-[11px] font-medium text-slate-400">Day 3 (22nd)</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Card 2: Spline Graph & Stats (lg:col-span-5) */}
                  <div className="lg:col-span-5 bg-white rounded-2xl p-5 sm:p-6 shadow-sm border border-slate-100 flex flex-col justify-between">
                    <div className="flex items-center justify-between mb-3">
                      <span className="font-bold text-sm text-slate-800">Delegate Status</span>
                      <div className="flex rounded-full bg-slate-100 p-0.5 text-[10px] font-medium">
                        <span className="px-2.5 py-0.5 rounded-full text-slate-500">Seat</span>
                        <span className="px-2.5 py-0.5 rounded-full bg-[#1e6f54] text-white font-semibold">Cleared</span>
                      </div>
                    </div>

                    <p className="text-[10px] text-slate-400 uppercase font-mono">20TH – 22ND NOV 2026</p>

                    {/* 3 Metric Numbers (230, 2, 1500) */}
                    <div className="grid grid-cols-3 gap-2 my-2 text-center">
                      <div>
                        <span className="text-lg font-bold text-slate-800 block leading-tight">
                          ₹{systemSettings.delegateBaseFee}
                        </span>
                        <span className="text-[10px] text-slate-400 block">Base Fee</span>
                      </div>
                      <div>
                        <span className="text-lg font-bold text-[#1e6f54] block leading-tight">
                          {isPaid ? "1" : "0"}
                        </span>
                        <span className="text-[10px] text-slate-400 block">Seat Booked</span>
                      </div>
                      <div>
                        <span className="text-lg font-bold text-slate-800 block leading-tight">
                          250+
                        </span>
                        <span className="text-[10px] text-slate-400 block">Delegates</span>
                      </div>
                    </div>

                    {/* Spline Wave Graph */}
                    <div className="my-2">
                      <svg viewBox="0 0 300 70" className="w-full h-14 overflow-visible">
                        <path
                          d="M 0 45 Q 40 25 75 40 T 150 55 T 225 30 T 300 40"
                          fill="none"
                          stroke="#1e6f54"
                          strokeWidth="2.5"
                          strokeLinecap="round"
                        />
                      </svg>
                      <div className="flex justify-between text-[8px] text-slate-300 font-mono">
                        <span>09:00</span>
                        <span>11:00</span>
                        <span>13:00</span>
                        <span>15:00</span>
                        <span>17:00</span>
                      </div>
                    </div>

                    {/* Bottom Pill Toggles */}
                    <div className="flex items-center justify-between gap-1.5 pt-2 border-t border-slate-100 text-[10px]">
                      <button type="button" onClick={() => setActiveTab("pass")} className="flex-1 py-1 rounded-full bg-slate-100 text-slate-600 hover:bg-slate-200 text-center font-medium">Digital Pass</button>
                      <button type="button" onClick={() => setActiveTab("committee")} className="flex-1 py-1 rounded-full bg-slate-100 text-slate-600 hover:bg-slate-200 text-center font-medium">Committee</button>
                      <button type="button" onClick={() => setActiveTab("schedule")} className="flex-1 py-1 rounded-full bg-[#1e6f54]/15 text-[#1e6f54] text-center font-bold">Venue</button>
                    </div>
                  </div>
                </div>

                {/* ROW 2: MIDDLE VISITOR / MATRIX STATS */}
                <div className="bg-white rounded-2xl p-5 sm:p-6 shadow-sm border border-slate-100">
                  <div className="flex items-center justify-between mb-4">
                    <span className="font-bold text-sm text-slate-800">Registration &amp; Conference Vitals</span>
                    <span className="text-[10px] font-mono text-emerald-600 font-bold bg-emerald-50 px-2 py-0.5 rounded-full">
                      ACTIVE ROUND
                    </span>
                  </div>

                  <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 items-center">
                    {/* Stat 1 */}
                    <div className="flex items-center justify-between p-3 rounded-xl bg-[#f4f7f6]">
                      <div>
                        <span className="text-xl font-extrabold text-slate-800 block leading-tight">250+</span>
                        <span className="text-[10px] text-slate-400">Total Delegates</span>
                      </div>
                      <svg width="40" height="20" className="stroke-[#22c55e] fill-none stroke-2">
                        <path d="M0 15 L12 8 L24 14 L36 4" />
                      </svg>
                    </div>

                    {/* Stat 2 */}
                    <div className="flex items-center justify-between p-3 rounded-xl bg-[#f4f7f6]">
                      <div>
                        <span className="text-xl font-extrabold text-slate-800 block leading-tight">
                          {isPaid ? "100%" : "85%"}
                        </span>
                        <span className="text-[10px] text-slate-400">Seat Clearance</span>
                      </div>
                      <span className="px-2 py-1 rounded-full bg-[#1e6f54] text-white text-[9px] font-bold">
                        UP ▲
                      </span>
                    </div>

                    {/* Stat 3 */}
                    <div className="flex items-center justify-between p-3 rounded-xl bg-[#f4f7f6]">
                      <div>
                        <span className="text-xl font-extrabold text-slate-800 block leading-tight">6</span>
                        <span className="text-[10px] text-slate-400">Committees</span>
                      </div>
                      <svg width="40" height="20" className="stroke-[#38bdf8] fill-none stroke-2">
                        <path d="M0 14 L12 8 L24 12 L36 2" />
                      </svg>
                    </div>

                    {/* Stat 4 */}
                    <div className="flex items-center justify-between p-3 rounded-xl bg-[#f4f7f6]">
                      <div>
                        <span className="text-xl font-extrabold text-slate-800 block leading-tight">3 Days</span>
                        <span className="text-[10px] text-slate-400">DWPS Kompally</span>
                      </div>
                      <span className="px-2 py-1 rounded-full bg-[#1e6f54] text-white text-[9px] font-bold">
                        TIME ▲
                      </span>
                    </div>
                  </div>
                </div>

                {/* ROW 3: BOTTOM 2 CARDS (3 CIRCLE GAUGES + RANKED LIST) */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
                  
                  {/* Bottom Left: 3 Donut Percentage Gauges (lg:col-span-7) */}
                  <div className="lg:col-span-7 bg-white rounded-2xl p-5 sm:p-6 shadow-sm border border-slate-100">
                    <span className="font-bold text-sm text-slate-800 block mb-4">Allocation &amp; Seat Progress</span>
                    
                    <div className="grid grid-cols-3 gap-3 text-center">
                      {/* Donut 1: 85% (Orange / Gold) */}
                      <div className="flex flex-col items-center">
                        <div className="relative w-18 h-18 flex items-center justify-center">
                          <svg className="w-18 h-18 -rotate-90" viewBox="0 0 36 36">
                            <path className="text-slate-100" strokeWidth="3.5" stroke="currentColor" fill="none" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
                            <path className="text-[#f59e0b]" strokeDasharray="85, 100" strokeWidth="3.5" strokeLinecap="round" stroke="currentColor" fill="none" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
                          </svg>
                          <span className="absolute font-extrabold text-xs text-slate-800">85%</span>
                        </div>
                        <span className="text-[10px] font-bold text-slate-700 mt-2">Seat Quota</span>
                        <span className="text-[9px] font-mono text-slate-400">223 Filled</span>
                      </div>

                      {/* Donut 2: 100% or 40% (Magenta / Purple) */}
                      <div className="flex flex-col items-center">
                        <div className="relative w-18 h-18 flex items-center justify-center">
                          <svg className="w-18 h-18 -rotate-90" viewBox="0 0 36 36">
                            <path className="text-slate-100" strokeWidth="3.5" stroke="currentColor" fill="none" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
                            <path className="text-[#8b5cf6]" strokeDasharray={isPaid ? "100, 100" : "40, 100"} strokeWidth="3.5" strokeLinecap="round" stroke="currentColor" fill="none" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
                          </svg>
                          <span className="absolute font-extrabold text-xs text-slate-800">{isPaid ? "100%" : "40%"}</span>
                        </div>
                        <span className="text-[10px] font-bold text-slate-700 mt-2">Verification</span>
                        <span className="text-[9px] font-mono text-slate-400">{isPaid ? "Cleared" : "Pending UTR"}</span>
                      </div>

                      {/* Donut 3: 65% (Indigo / Slate) */}
                      <div className="flex flex-col items-center">
                        <div className="relative w-18 h-18 flex items-center justify-center">
                          <svg className="w-18 h-18 -rotate-90" viewBox="0 0 36 36">
                            <path className="text-slate-100" strokeWidth="3.5" stroke="currentColor" fill="none" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
                            <path className="text-[#6366f1]" strokeDasharray={isAllotted ? "100, 100" : "65, 100"} strokeWidth="3.5" strokeLinecap="round" stroke="currentColor" fill="none" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
                          </svg>
                          <span className="absolute font-extrabold text-xs text-slate-800">{isAllotted ? "100%" : "65%"}</span>
                        </div>
                        <span className="text-[10px] font-bold text-slate-700 mt-2">Matrix Matrix</span>
                        <span className="text-[9px] font-mono text-slate-400">{isAllotted ? "Assigned" : "Processing"}</span>
                      </div>
                    </div>
                  </div>

                  {/* Bottom Right: Ranked Info Lists (lg:col-span-5) */}
                  <div className="lg:col-span-5 bg-white rounded-2xl p-5 sm:p-6 shadow-sm border border-slate-100 flex flex-col justify-between">
                    <div className="grid grid-cols-2 gap-4">
                      {/* Left Column: Top Committees */}
                      <div>
                        <span className="font-bold text-xs text-slate-800 block mb-2">Committees</span>
                        <ol className="space-y-1.5 text-xs text-slate-600">
                          <li className="truncate">1. UNSC (Security)</li>
                          <li className="truncate">2. UNHRC (Rights)</li>
                          <li className="truncate">3. AIPPM (Indian)</li>
                        </ol>
                      </div>

                      {/* Right Column: Delegate Meta */}
                      <div>
                        <span className="font-bold text-xs text-slate-800 block mb-2">Delegate Info</span>
                        <div className="space-y-1 text-xs text-slate-600">
                          <p className="font-semibold text-slate-800 truncate">{displayName}</p>
                          <p className="font-mono text-[10px] text-[#1e6f54] font-bold">{delegateRecord?.delegateId || "RM26-DEL"}</p>
                          <p className="text-[10px] text-slate-400 truncate">{delegateRecord?.institution || "Delegate"}</p>
                        </div>
                      </div>
                    </div>

                    <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-400">
                      <span>Host Venue:</span>
                      <strong className="text-[#1e6f54]">DWPS Kompally</strong>
                    </div>
                  </div>
                </div>

              </div>
            )}

            {/* ============================================================ */}
            {/* TAB: DIGITAL PASS                                            */}
            {/* ============================================================ */}
            {activeTab === "pass" && (
              <div className="bg-white rounded-2xl p-6 sm:p-8 shadow-sm border border-slate-100 max-w-lg mx-auto text-center space-y-6 animate-in fade-in">
                <div>
                  <span className="text-[10px] font-mono font-bold text-[#1e6f54] tracking-widest uppercase">
                    OFFICIAL ACCREDITATION
                  </span>
                  <h3 className="text-xl font-bold text-slate-800 mt-1">Digital Conference Pass</h3>
                  <p className="text-xs text-slate-500 mt-1">Present this QR pass at the entrance terminal at DWPS Kompally.</p>
                </div>

                <div className="p-5 rounded-2xl bg-[#f4f7f6] border border-slate-200 inline-block shadow-inner">
                  <img
                    src={`https://api.qrserver.com/v1/create-qr-code/?size=220x220&data=${encodeURIComponent("https://resolvemun.in/scan?id=" + (delegateRecord?.delegateId || user.email))}&bgcolor=ffffff&color=1e6f54&margin=1`}
                    alt="Delegate QR Pass"
                    className="w-48 h-48 rounded-xl shadow-md block mx-auto"
                  />
                  <div className="mt-4 text-center">
                    <p className="font-bold text-sm text-slate-800 uppercase">{delegateRecord?.fullName || displayName}</p>
                    <p className="font-mono text-xs font-bold text-[#1e6f54] tracking-wider mt-0.5">{delegateRecord?.delegateId || "RM26-DEL-CONFIRMED"}</p>
                    <p className="text-[11px] text-slate-500 mt-1">{delegateRecord?.institution || "Individual Delegate"}</p>
                  </div>
                </div>

                <div className="flex items-center justify-center gap-3">
                  <button
                    type="button"
                    onClick={() => window.print()}
                    className="h-10 px-5 rounded-full bg-slate-100 hover:bg-slate-200 text-xs font-bold text-slate-700 flex items-center gap-2 cursor-pointer transition-all"
                  >
                    <Printer className="w-3.5 h-3.5" />
                    <span>Print PDF</span>
                  </button>
                  <a
                    href={`https://api.qrserver.com/v1/create-qr-code/?size=600x600&data=${encodeURIComponent("https://resolvemun.in/scan?id=" + (delegateRecord?.delegateId || user.email))}`}
                    download="resolve-mun-pass.png"
                    target="_blank"
                    rel="noreferrer"
                    className="h-10 px-5 rounded-full bg-[#1e6f54] hover:bg-[#165a44] text-xs font-bold text-white flex items-center gap-2 shadow-md cursor-pointer transition-all"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Save QR</span>
                  </a>
                </div>
              </div>
            )}

            {/* ============================================================ */}
            {/* TAB: COMMITTEE ALLOTMENT                                     */}
            {/* ============================================================ */}
            {activeTab === "committee" && (
              <div className="bg-white rounded-2xl p-6 sm:p-8 shadow-sm border border-slate-100 space-y-5 animate-in fade-in">
                <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                  <div>
                    <h3 className="text-base font-bold text-slate-800">Committee Matrix Allocation</h3>
                    <p className="text-xs text-slate-400">Assigned country portfolio and committee preferences.</p>
                  </div>
                  <span className="px-3 py-1 rounded-full bg-[#1e6f54]/10 text-[#1e6f54] text-xs font-bold font-mono">
                    {isAllotted ? "ALLOTTED" : "PROCESSING"}
                  </span>
                </div>

                {isAllotted ? (
                  <div className="p-4 rounded-xl bg-[#f4f7f6] flex items-center justify-between">
                    <div>
                      <span className="text-[10px] font-mono uppercase text-slate-400">ASSIGNED COMMITTEE</span>
                      <p className="text-lg font-bold text-[#1e6f54]">{delegateRecord.allocatedCommittee}</p>
                    </div>
                    <div>
                      <span className="text-[10px] font-mono uppercase text-slate-400">PORTFOLIO</span>
                      <p className="text-lg font-bold text-slate-800">{delegateRecord.allocatedCountry || "Delegate"}</p>
                    </div>
                  </div>
                ) : (
                  <div className="p-4 rounded-xl bg-amber-50 border border-amber-100 text-xs text-amber-800 flex items-center gap-3">
                    <Clock className="w-5 h-5 text-amber-600 shrink-0" />
                    <span>Your committee preferences are under review. Round 1 portfolio allocations will update here directly.</span>
                  </div>
                )}

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
                  {[1, 2, 3].map((n) => (
                    <div key={n} className="p-3.5 rounded-xl bg-slate-50 border border-slate-100">
                      <span className="text-[10px] font-mono text-[#1e6f54] font-bold block">PREFERENCE {n}</span>
                      <p className="text-xs font-bold text-slate-700 truncate mt-1">{delegateRecord?.[`pref${n}`] || "—"}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* ============================================================ */}
            {/* TAB: SCHEDULE & VENUE                                        */}
            {/* ============================================================ */}
            {activeTab === "schedule" && (
              <div className="bg-white rounded-2xl p-6 sm:p-8 shadow-sm border border-slate-100 space-y-6 animate-in fade-in">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
                  <div>
                    <h3 className="text-base font-bold text-slate-800">Delhi World Public School, Kompally</h3>
                    <p className="text-xs text-slate-500">Host Venue · Hyderabad, Telangana 500043</p>
                  </div>
                  <a
                    href="https://maps.google.com/?q=Delhi+World+Public+School+Kompally+Hyderabad"
                    target="_blank"
                    rel="noreferrer"
                    className="h-9 px-4 rounded-full bg-[#1e6f54] text-white text-xs font-bold flex items-center gap-1.5 hover:bg-[#165a44] transition-all self-start sm:self-auto"
                  >
                    <MapPin className="w-3.5 h-3.5" />
                    <span>Open in Maps</span>
                  </a>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
                  <div className="p-4 rounded-xl bg-[#f4f7f6] space-y-2">
                    <span className="font-bold text-[#1e6f54] block">Day 1 · 20 Nov</span>
                    <ul className="space-y-1 text-slate-600">
                      <li>• 08:30: Registration</li>
                      <li>• 10:00: Opening Ceremony</li>
                      <li>• 11:45: Session I</li>
                    </ul>
                  </div>
                  <div className="p-4 rounded-xl bg-[#f4f7f6] space-y-2">
                    <span className="font-bold text-[#1e6f54] block">Day 2 · 21 Nov</span>
                    <ul className="space-y-1 text-slate-600">
                      <li>• 09:00: Session II &amp; III</li>
                      <li>• 14:30: Crisis Session</li>
                      <li>• 18:00: Socials</li>
                    </ul>
                  </div>
                  <div className="p-4 rounded-xl bg-[#f4f7f6] space-y-2">
                    <span className="font-bold text-[#1e6f54] block">Day 3 · 22 Nov</span>
                    <ul className="space-y-1 text-slate-600">
                      <li>• 09:30: Voting Procedures</li>
                      <li>• 14:00: Valedictory</li>
                      <li>• 16:30: Awards</li>
                    </ul>
                  </div>
                </div>
              </div>
            )}

            {/* ============================================================ */}
            {/* TAB: SETTINGS / DOSSIER                                      */}
            {/* ============================================================ */}
            {activeTab === "settings" && (
              <div className="bg-white rounded-2xl p-6 sm:p-8 shadow-sm border border-slate-100 space-y-5 animate-in fade-in">
                <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                  <h3 className="text-base font-bold text-slate-800">Delegate Dossier Details</h3>
                  <span className="font-mono text-xs font-bold text-[#1e6f54]">{delegateRecord?.delegateId || "RM26-DEL"}</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3.5 text-xs">
                  <div className="p-3 rounded-xl bg-[#f4f7f6]">
                    <span className="text-slate-400 block text-[10px]">NAME</span>
                    <strong className="text-slate-700">{delegateRecord?.fullName || displayName}</strong>
                  </div>
                  <div className="p-3 rounded-xl bg-[#f4f7f6]">
                    <span className="text-slate-400 block text-[10px]">EMAIL</span>
                    <strong className="text-slate-700 truncate block">{delegateRecord?.email || user.email}</strong>
                  </div>
                  <div className="p-3 rounded-xl bg-[#f4f7f6]">
                    <span className="text-slate-400 block text-[10px]">PHONE</span>
                    <strong className="text-slate-700">{delegateRecord?.phone || "—"}</strong>
                  </div>
                  <div className="p-3 rounded-xl bg-[#f4f7f6]">
                    <span className="text-slate-400 block text-[10px]">INSTITUTION</span>
                    <strong className="text-slate-700">{delegateRecord?.institution || "—"}</strong>
                  </div>
                  <div className="p-3 rounded-xl bg-[#f4f7f6]">
                    <span className="text-slate-400 block text-[10px]">PAYMENT UTR</span>
                    <strong className="text-[#1e6f54]">{delegateRecord?.paymentUTR || "VERIFIED"}</strong>
                  </div>
                  <div className="p-3 rounded-xl bg-[#f4f7f6]">
                    <span className="text-slate-400 block text-[10px]">FEE STATUS</span>
                    <strong className="text-[#1e6f54]">{isPaid ? "CLEARED (₹2799)" : "PENDING"}</strong>
                  </div>
                </div>
              </div>
            )}

            {/* ============================================================ */}
            {/* TAB: PRIVACY / SUPPORT                                       */}
            {activeTab === "support" && (
              <div className="bg-white rounded-2xl p-6 sm:p-8 shadow-sm border border-slate-100 space-y-5 animate-in fade-in">
                <h3 className="text-base font-bold text-slate-800">Support &amp; Delegate Assistance</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                  <a href="tel:+919212107797" className="p-4 rounded-xl bg-[#f4f7f6] hover:bg-emerald-50 transition-colors flex items-center gap-3">
                    <Phone className="w-5 h-5 text-[#1e6f54]" />
                    <div>
                      <span className="text-slate-400 block text-[10px]">PHONE HELPLINE</span>
                      <strong className="text-slate-800">+91 92121 07797</strong>
                    </div>
                  </a>
                  <a href="mailto:resolvemun2026@gmail.com" className="p-4 rounded-xl bg-[#f4f7f6] hover:bg-emerald-50 transition-colors flex items-center gap-3">
                    <Mail className="w-5 h-5 text-[#1e6f54]" />
                    <div>
                      <span className="text-slate-400 block text-[10px]">EMAIL SUPPORT</span>
                      <strong className="text-slate-800">resolvemun2026@gmail.com</strong>
                    </div>
                  </a>
                </div>
              </div>
            )}

          </div>

          {/* Footer note */}
          <footer className="pt-6 border-t border-slate-200/60 flex flex-wrap items-center justify-between gap-2 text-[11px] text-slate-400 font-medium">
            <span>© 2026 Resolve MUN · Hyderabad</span>
            <div className="flex items-center gap-3">
              <Link href="/" className="hover:text-[#1e6f54]">Homepage</Link>
              <span>•</span>
              <button type="button" onClick={() => fetchDelegateProfile(user?.id, user?.email, true)} className="hover:text-[#1e6f54] cursor-pointer">
                Sync Live
              </button>
            </div>
          </footer>

        </div>
      </div>

    </div>
  );
}
