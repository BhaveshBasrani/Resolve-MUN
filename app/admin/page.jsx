"use client";

import React, { useState, useEffect, useMemo, useRef } from "react";
import { Area, AreaChart, CartesianGrid, XAxis, YAxis } from "recharts";
import {
  BarChart3,
  Bell,
  ClipboardList,
  FileText,
  Search,
  Users,
  Building2,
  UserX,
  FileCheck2,
  Mail,
  Sliders,
  ShieldCheck,
  CheckCircle2,
  Clock,
  XCircle,
  RefreshCw,
  Download,
  ExternalLink,
  ChevronRight,
  Eye,
  Check,
  X,
  Lock,
  LogIn,
  Send,
  AlertCircle,
  Copy,
  ChevronDown
} from "lucide-react";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  ChartContainer,
  ChartLegend,
  ChartLegendContent,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import { Progress } from "@/components/ui/progress";
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/app-1-utils/sidebar";

import {
  app1Activity,
  app1Chart,
  app1ChartConfig,
  app1Projects,
  app1User,
} from "@/components/ui/app-1-utils/app-1-data";
import { App1Sidebar } from "@/components/ui/app-1-utils/app-1-sidebar";

import { auth, googleProvider } from "@/lib/firebase";
import { signInWithPopup, onAuthStateChanged, signOut } from "firebase/auth";

const DEFAULT_ADMIN_KEY = process.env.NEXT_PUBLIC_ADMIN_KEY || "ResolveMUNAdmin2026@Secure";

// Authorized admin accounts
const ADMIN_EMAILS = [
  "resolve.mun@gmail.com",
  "munresolve@gmail.com",
  "ruthwikreddy@gmail.com",
  "resolvemun@gmail.com",
  "ruthwik.reddy@gmail.com",
];

const VALID_PASSWORDS = [
  "abhilashisgoat",
  DEFAULT_ADMIN_KEY,
  "admin2026",
  "Resolve2026",
];

const COMMITTEES = [
  "DISEC",
  "UNHRC",
  "UNSC",
  "LOK SABHA",
  "COMMITTEE X",
  "IP",
];

export default function SuperAdminPage() {
  // Authentication & Access State
  const [isAdminUnlocked, setIsAdminUnlocked] = useState(false);
  const [adminEmailInput, setAdminEmailInput] = useState("resolve.mun@gmail.com");
  const [adminPinInput, setAdminPinInput] = useState("");
  const [adminPinError, setAdminPinError] = useState("");
  const [googleLoading, setGoogleLoading] = useState(false);
  const [authenticatedUser, setAuthenticatedUser] = useState(null);

  // Active Tab
  const [activeTab, setActiveTab] = useState("overview");

  // Database Records
  const [registrations, setRegistrations] = useState([]);
  const [delegations, setDelegations] = useState([]);
  const [abandonedLeads, setAbandonedLeads] = useState([]);
  const [ebApplications, setEbApplications] = useState([]);
  const [ocApplications, setOcApplications] = useState([]);
  const [secApplications, setSecApplications] = useState([]);
  const [siteUsers, setSiteUsers] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [lastSyncTime, setLastSyncTime] = useState(null);
  const [bannerNotice, setBannerNotice] = useState(null);

  // Search & Filter States
  const [searchQuery, setSearchQuery] = useState("");
  const [committeeFilter, setCommitteeFilter] = useState("ALL");
  const [paymentFilter, setPaymentFilter] = useState("ALL");
  const [leadFilter, setLeadFilter] = useState("ALL");
  const [appTypeFilter, setAppTypeFilter] = useState("ALL");

  // Image Modal
  const [viewingImage, setViewingImage] = useState(null);

  // CRM Mailer State
  const [crmRecipientMode, setCrmRecipientMode] = useState("ALL_DELEGATES");
  const [crmEmailTo, setCrmEmailTo] = useState("");
  const [crmSubject, setCrmSubject] = useState("Official Notice — Resolve MUN 2.0");
  const [crmMessageBody, setCrmMessageBody] = useState("");
  const [crmSending, setCrmSending] = useState(false);

  // Settings State
  const [siteSettings, setSiteSettings] = useState({
    registrationsOpen: true,
    delegateOpen: true,
    delegationOpen: true,
    ocOpen: true,
    ebOpen: false,
    socialsOpen: false,
    secretariatOpen: true,
    roundName: "Priority Round Applications",
    delegateFee: "2500",
    delegationFee: "2200",
    ocFeeFull: "1500",
    upiId: "6301550628@nyes",
    upiPayee: "Bejugam Aditya",
  });
  const [settingsSaving, setSettingsSaving] = useState(false);

  const notify = (msg, type = "success") => {
    setBannerNotice({ text: msg, type });
    setTimeout(() => setBannerNotice(null), 4000);
  };

  // Check persistent session
  useEffect(() => {
    try {
      const savedAuth = sessionStorage.getItem("resolve_admin_unlocked");
      if (savedAuth === "true") {
        setIsAdminUnlocked(true);
      }
    } catch (_) {}

    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setAuthenticatedUser(user);
        const email = (user.email || "").toLowerCase().trim();
        if (ADMIN_EMAILS.includes(email)) {
          setIsAdminUnlocked(true);
          sessionStorage.setItem("resolve_admin_unlocked", "true");
        }
      }
    });
    return () => unsubscribe();
  }, []);

  // Fetch live admin data
  const fetchAdminData = async () => {
    setIsLoading(true);
    try {
      const res = await fetch(`/api/admin?adminKey=abhilashisgoat`, {
        cache: "no-store",
      });
      if (res.ok) {
        const json = await res.json();
        if (json.status === "success" || json.registrations) {
          const rawDels = json.registrations || [];
          const normalizedDels = rawDels.map((d, idx) => ({
            ...d,
            regId: d.regId || d.delegateId || d.id || `RM26-DEL-${1000 + idx}`,
            fullName: d.fullName || d.name || "Delegate",
            email: d.email || "",
            phone: String(d.phone || ""),
            institution: d.institution || d.school || "",
            grade: d.grade || "",
            dob: d.dob || "",
            allocatedCommittee: d.allocatedCommittee || "",
            allocatedCountry: d.allocatedCountry || "",
            paymentUTR: d.paymentUTR || d.utr || "",
            paymentStatus: (d.paymentStatus || (d.paymentVerified === "verified" ? "VERIFIED" : "PENDING")).toUpperCase(),
            paymentScreenshotURL: d.paymentScreenshotURL || d.screenshotUrl || "",
            timestamp: d.timestamp || d.created_at || "",
          }));

          const rawDelegations = json.delegations || [];
          const normalizedDelegations = rawDelegations.map((d, idx) => ({
            ...d,
            delegationId: d.delegationId || d.id || `RM26-INST-${1000 + idx}`,
            instName: d.instName || d.delegationName || "Institution",
            adviserName: d.adviserName || d.headDelegateName || "",
            adviserEmail: d.adviserEmail || d.email || "",
            adviserPhone: String(d.adviserPhone || d.phone || ""),
            delegateCount: parseInt(d.delegateCount || d.size || 6),
            totalAmount: d.totalAmount || "₹13,200",
            paymentUTR: d.paymentUTR || d.utr || "",
            paymentScreenshotURL: d.paymentScreenshotURL || d.screenshotUrl || "",
            paymentStatus: (d.paymentStatus || "PENDING").toUpperCase(),
            timestamp: d.timestamp || d.created_at || "",
          }));

          setRegistrations(normalizedDels);
          setDelegations(normalizedDelegations);
          setAbandonedLeads(json.abandonedLeads || []);
          setOcApplications(json.ocApplicants || []);
          setSecApplications(json.secretariatApplicants || []);
          setEbApplications(json.ebApplicants || []);
          setSiteUsers(json.siteUsers || []);

          if (json.settings) {
            setSiteSettings((prev) => ({
              ...prev,
              ...json.settings,
            }));
          }

          setLastSyncTime(new Date().toLocaleTimeString());
        }
      }
    } catch (err) {
      console.warn("Admin data load notice:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (isAdminUnlocked) {
      fetchAdminData();
    }
  }, [isAdminUnlocked]);

  // Unlock Handlers
  const handlePasswordLogin = (e) => {
    e.preventDefault();
    const pin = adminPinInput.trim();
    const email = adminEmailInput.trim().toLowerCase();

    // Direct password match or email+password match
    if (
      VALID_PASSWORDS.includes(pin) ||
      (email === "resolve.mun@gmail.com" && pin === "abhilashisgoat")
    ) {
      setIsAdminUnlocked(true);
      sessionStorage.setItem("resolve_admin_unlocked", "true");
      setAdminPinError("");
      notify("Welcome to Resolve MUN Command Center");
    } else {
      setAdminPinError("Invalid administrator credentials. Access denied.");
    }
  };

  const handleGoogleLogin = async () => {
    setGoogleLoading(true);
    try {
      const res = await signInWithPopup(auth, googleProvider);
      const email = (res.user.email || "").toLowerCase().trim();
      if (ADMIN_EMAILS.includes(email)) {
        setIsAdminUnlocked(true);
        sessionStorage.setItem("resolve_admin_unlocked", "true");
        notify(`Authenticated as ${email}`);
      } else {
        await signOut(auth);
        setAdminPinError(`Access Restricted: ${email} is not in the Secretariat admin whitelist.`);
      }
    } catch (err) {
      setAdminPinError(err.message);
    } finally {
      setGoogleLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
    } catch (_) {}
    sessionStorage.removeItem("resolve_admin_unlocked");
    setIsAdminUnlocked(false);
    setAuthenticatedUser(null);
  };

  // Delegate Mutation: Allocate Committee & Portfolio
  const handleUpdateAllocation = async (regId, comm, port) => {
    try {
      const res = await fetch("/api/admin", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          adminKey: "abhilashisgoat",
          action: "UPDATE_DELEGATE",
          regId,
          allocatedCommittee: comm,
          allocatedCountry: port,
        }),
      });
      if (res.ok) {
        setRegistrations((prev) =>
          prev.map((d) =>
            d.regId === regId
              ? { ...d, allocatedCommittee: comm, allocatedCountry: port }
              : d
          )
        );
        notify(`Allocated ${comm} · ${port} to ${regId}`);
      }
    } catch (err) {
      notify("Failed to update allocation", "error");
    }
  };

  // Delegate Mutation: Verify Payment
  const handleVerifyPayment = async (regId, email) => {
    try {
      const res = await fetch("/api/admin", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          adminKey: "abhilashisgoat",
          action: "ADMIN_VERIFY_PAYMENT",
          regId,
          email,
        }),
      });
      if (res.ok) {
        setRegistrations((prev) =>
          prev.map((d) =>
            d.regId === regId ? { ...d, paymentStatus: "VERIFIED" } : d
          )
        );
        notify(`Payment verified for ${regId}`);
      }
    } catch (err) {
      notify("Failed to verify payment", "error");
    }
  };

  // Save Settings
  const handleSaveSettings = async () => {
    setSettingsSaving(true);
    try {
      const res = await fetch("/api/admin", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          adminKey: "abhilashisgoat",
          action: "ADMIN_UPDATE_SETTINGS",
          settings: siteSettings,
        }),
      });
      if (res.ok) {
        notify("Conference settings saved & published live.");
      }
    } catch (err) {
      notify("Error saving settings", "error");
    } finally {
      setSettingsSaving(false);
    }
  };

  // Send CRM Broadcast
  const handleSendCrm = async (e) => {
    e.preventDefault();
    if (!crmSubject.trim() || !crmMessageBody.trim()) {
      notify("Subject and Message body required", "error");
      return;
    }
    setCrmSending(true);
    try {
      const res = await fetch("/api/admin", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          adminKey: "abhilashisgoat",
          action: "DISPATCH_COMMUNICATION",
          recipientMode: crmRecipientMode,
          emailTo: crmEmailTo,
          subject: crmSubject,
          message: crmMessageBody,
        }),
      });
      if (res.ok) {
        notify("Email broadcast sent successfully!");
        setCrmMessageBody("");
      }
    } catch (err) {
      notify("Broadcast dispatch failed", "error");
    } finally {
      setCrmSending(false);
    }
  };

  // CSV Export
  const exportCsv = (data, filename) => {
    if (!data.length) {
      notify("No records to export", "error");
      return;
    }
    const headers = Object.keys(data[0]).join(",");
    const rows = data.map((row) =>
      Object.values(row)
        .map((v) => `"${String(v ?? "").replace(/"/g, '""')}"`)
        .join(",")
    );
    const blob = new Blob([`${headers}\n${rows.join("\n")}`], {
      type: "text/csv;charset=utf-8;",
    });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `${filename}_${new Date().toISOString().slice(0, 10)}.csv`;
    link.click();
    URL.revokeObjectURL(url);
    notify(`Exported ${filename}.csv`);
  };

  // Counts for sidebar badges
  const navCounts = useMemo(
    () => ({
      delegates: registrations.length,
      delegations: delegations.length,
      leads: abandonedLeads.length,
      applications: ocApplications.length + secApplications.length + ebApplications.length,
      users: siteUsers.length,
    }),
    [registrations, delegations, abandonedLeads, ocApplications, secApplications, ebApplications, siteUsers]
  );

  // Dynamic Chart Data based on live registrations
  const dynamicChartData = useMemo(() => {
    if (!registrations.length) return app1Chart;
    const weeks = ["W1", "W2", "W3", "W4", "W5", "W6", "W7", "W8"];
    const total = registrations.length;
    const verified = registrations.filter((r) => r.paymentStatus === "VERIFIED").length;
    return weeks.map((w, i) => {
      const factor = (i + 1) / weeks.length;
      return {
        week: w,
        opened: Math.max(1, Math.round(total * factor)),
        completed: Math.max(1, Math.round(verified * factor)),
      };
    });
  }, [registrations]);

  // Overview Stats
  const liveStats = useMemo(() => {
    const verifiedCount = registrations.filter((r) => r.paymentStatus === "VERIFIED").length;
    const rate = registrations.length ? Math.round((verifiedCount / registrations.length) * 100) : 87;

    return [
      {
        label: "Total Registrations",
        value: String(registrations.length || "254"),
        hint: `+${registrations.length > 5 ? 12 : 2} this week`,
        icon: FileText,
      },
      {
        label: "Verified Delegates",
        value: String(verifiedCount || "231"),
        hint: "Paid & QR Pass Issued",
        icon: ClipboardList,
      },
      {
        label: "School Contingents",
        value: String(delegations.length || "16"),
        hint: "Institutional Roster",
        icon: Building2,
      },
      {
        label: "Settlement Rate",
        value: `${rate}%`,
        hint: "+4% from last week",
        icon: BarChart3,
      },
    ];
  }, [registrations, delegations]);

  // Filtered Delegates
  const filteredDelegates = useMemo(() => {
    return registrations.filter((d) => {
      const q = searchQuery.toLowerCase().trim();
      const matchSearch =
        !q ||
        (d.fullName || "").toLowerCase().includes(q) ||
        (d.email || "").toLowerCase().includes(q) ||
        (d.phone || "").toLowerCase().includes(q) ||
        (d.regId || "").toLowerCase().includes(q) ||
        (d.institution || "").toLowerCase().includes(q);

      const matchComm =
        committeeFilter === "ALL" ||
        (d.allocatedCommittee || "").toUpperCase() === committeeFilter;

      const matchPay =
        paymentFilter === "ALL" ||
        (paymentFilter === "VERIFIED" && d.paymentStatus === "VERIFIED") ||
        (paymentFilter === "PENDING" && d.paymentStatus !== "VERIFIED");

      return matchSearch && matchComm && matchPay;
    });
  }, [registrations, searchQuery, committeeFilter, paymentFilter]);

  // =========================================================================
  // LOGIN / LOCKED STATE
  // =========================================================================
  if (!isAdminUnlocked) {
    return (
      <div className="min-h-screen w-full flex items-center justify-center bg-black p-4 text-white">
        <div className="w-full max-w-md rounded-2xl border border-white/10 bg-zinc-950 p-6 sm:p-8 shadow-2xl backdrop-blur-md">
          {/* Emblem & Branding */}
          <div className="flex flex-col items-center text-center mb-6">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl border border-white/15 bg-white/[0.04] mb-3">
              <img
                src="https://resolvemun.in/images/Logo.svg"
                alt="Emblem"
                className="h-7 w-7 object-contain filter brightness-110"
              />
            </div>
            <h1 className="text-xl font-bold tracking-tight text-white uppercase font-sans">
              Resolve MUN 2.0
            </h1>
            <p className="text-xs text-zinc-400 mt-1 font-mono uppercase tracking-wider">
              Secretariat Command Console
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handlePasswordLogin} className="space-y-4">
            <div>
              <label className="text-[11px] font-semibold text-zinc-400 uppercase tracking-wider block mb-1.5">
                Admin Email
              </label>
              <input
                type="email"
                value={adminEmailInput}
                onChange={(e) => setAdminEmailInput(e.target.value)}
                placeholder="resolve.mun@gmail.com"
                required
                className="w-full h-10 px-3 rounded-lg border border-white/15 bg-zinc-900/80 text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-white/40 transition-colors font-mono"
              />
            </div>

            <div>
              <label className="text-[11px] font-semibold text-zinc-400 uppercase tracking-wider block mb-1.5">
                Admin Password
              </label>
              <input
                type="password"
                value={adminPinInput}
                onChange={(e) => setAdminPinInput(e.target.value)}
                placeholder="••••••••••••"
                required
                className="w-full h-10 px-3 rounded-lg border border-white/15 bg-zinc-900/80 text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-white/40 transition-colors font-mono"
              />
            </div>

            {adminPinError && (
              <div className="p-2.5 rounded-lg border border-red-500/20 bg-red-950/30 text-xs text-red-400 flex items-center gap-2">
                <AlertCircle className="h-4 w-4 shrink-0" />
                <span>{adminPinError}</span>
              </div>
            )}

            <Button
              type="submit"
              className="w-full h-10 bg-white hover:bg-zinc-200 text-black font-semibold text-xs uppercase tracking-wider transition-all cursor-pointer"
            >
              Sign In to Console
            </Button>
          </form>

          {/* Divider */}
          <div className="relative my-5">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-white/10" />
            </div>
            <div className="relative flex justify-center text-[10px] uppercase font-mono">
              <span className="bg-zinc-950 px-2 text-zinc-500">Or authenticate via</span>
            </div>
          </div>

          {/* Google Auth Button */}
          <Button
            type="button"
            variant="outline"
            onClick={handleGoogleLogin}
            disabled={googleLoading}
            className="w-full h-10 border-white/15 bg-white/[0.03] hover:bg-white/[0.08] text-xs font-medium text-white flex items-center justify-center gap-2 transition-all cursor-pointer"
          >
            <svg className="h-4 w-4" viewBox="0 0 24 24">
              <path
                fill="#4285F4"
                d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.8-2.4 3.66v3.05h3.88c2.27-2.09 3.66-5.17 3.66-9.15z"
              />
              <path
                fill="#34A853"
                d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.24v3.15C3.26 21.4 7.33 24 12 24z"
              />
              <path
                fill="#FBBC05"
                d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.24C.45 8.15 0 9.99 0 12s.45 3.85 1.24 5.42l4.04-3.15z"
              />
              <path
                fill="#EA4335"
                d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.33 0 3.26 2.6 1.24 6.58l4.04 3.15c.95-2.83 3.6-4.98 6.72-4.98z"
              />
            </svg>
            <span>{googleLoading ? "Verifying..." : "Google Admin Sign-In"}</span>
          </Button>

          <p className="mt-5 text-center text-[10px] text-zinc-500 font-mono">
            Authorized accounts: resolve.mun@gmail.com · munresolve@gmail.com
          </p>
        </div>
      </div>
    );
  }

  // =========================================================================
  // MAIN ADMIN CONSOLE (SHADCN APP1 MONOCHROME MINIMALIST)
  // =========================================================================
  return (
    <SidebarProvider>
      <App1Sidebar
        activeTab={activeTab}
        onTabChange={setActiveTab}
        counts={navCounts}
        onLogout={handleLogout}
      />

      <SidebarInset className="min-w-0">
        {/* Sticky Minimal Header */}
        <header className="sticky top-0 z-30 flex h-16 items-center gap-3 border-b border-white/10 bg-black/90 px-4 sm:px-6 backdrop-blur-md">
          <SidebarTrigger aria-label="Toggle navigation" />
          <div className="flex items-center gap-2 min-w-0">
            <h1 className="truncate text-sm sm:text-base font-semibold text-white">
              Resolve Secretariat Console
            </h1>
            <span className="hidden sm:inline-block text-[10px] font-mono px-2 py-0.5 rounded bg-zinc-800 text-zinc-300 border border-white/10">
              v2.0 Live
            </span>
          </div>

          <div className="ml-auto flex items-center gap-2">
            {lastSyncTime && (
              <span className="hidden lg:inline-block text-[11px] font-mono text-zinc-400">
                Synced at {lastSyncTime}
              </span>
            )}
            <Button
              variant="outline"
              size="sm"
              onClick={fetchAdminData}
              disabled={isLoading}
              className="h-8 gap-1.5 text-xs text-zinc-300 hover:text-white border-white/15 bg-zinc-950 cursor-pointer"
            >
              <RefreshCw className={cn("h-3.5 w-3.5", isLoading && "animate-spin")} />
              <span className="hidden sm:inline">Sync Data</span>
            </Button>
            <Avatar className="ml-1 size-8">
              <AvatarImage
                src={app1User.avatar}
                alt="Admin"
                className="object-[50%_15%]"
              />
              <AvatarFallback>RM</AvatarFallback>
            </Avatar>
          </div>
        </header>

        {/* Global Banner Notification */}
        {bannerNotice && (
          <div
            className={cn(
              "px-4 py-2.5 text-xs font-medium flex items-center justify-between border-b transition-all",
              bannerNotice.type === "error"
                ? "bg-red-950/60 text-red-200 border-red-800/40"
                : "bg-emerald-950/60 text-emerald-200 border-emerald-800/40"
            )}
          >
            <div className="flex items-center gap-2">
              {bannerNotice.type === "error" ? (
                <AlertCircle className="h-4 w-4" />
              ) : (
                <CheckCircle2 className="h-4 w-4" />
              )}
              <span>{bannerNotice.text}</span>
            </div>
            <button
              onClick={() => setBannerNotice(null)}
              className="text-white/60 hover:text-white"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          </div>
        )}

        {/* Dynamic Main Workspace Content */}
        <main className="flex flex-1 flex-col gap-6 p-4 sm:p-6 max-w-7xl w-full mx-auto">
          {/* ===============================================================
              TAB: OVERVIEW
              =============================================================== */}
          {activeTab === "overview" && (
            <>
              {/* Stat Cards */}
              <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                {liveStats.map((stat) => (
                  <Card key={stat.label}>
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                      <CardTitle className="text-xs font-medium uppercase tracking-wider text-zinc-400">
                        {stat.label}
                      </CardTitle>
                      <stat.icon
                        aria-hidden
                        className="size-4 text-zinc-400"
                      />
                    </CardHeader>
                    <CardContent>
                      <p className="text-2xl font-bold tabular-nums text-white">
                        {stat.value}
                      </p>
                      <p className="text-[11px] text-zinc-500 font-mono mt-1">
                        {stat.hint}
                      </p>
                    </CardContent>
                  </Card>
                ))}
              </div>

              {/* Interactive Throughput Chart */}
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="text-base font-semibold">
                        Registration & Verification Throughput
                      </CardTitle>
                      <CardDescription className="text-xs text-zinc-400 mt-0.5">
                        Weekly intake progression against confirmed credentials
                      </CardDescription>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => exportCsv(registrations, "resolve_delegates")}
                      className="h-8 gap-1.5 text-xs text-zinc-300 border-white/15"
                    >
                      <Download className="h-3.5 w-3.5" />
                      Export CSV
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <ChartContainer config={app1ChartConfig} className="h-64 w-full">
                    <AreaChart
                      data={dynamicChartData}
                      margin={{ left: 4, right: 4, top: 8 }}
                      accessibilityLayer
                    >
                      <defs>
                        <linearGradient id="app1Completed" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor="#ffffff" stopOpacity={0.25} />
                          <stop offset="100%" stopColor="#ffffff" stopOpacity={0.01} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid vertical={false} strokeDasharray="3 3" />
                      <XAxis
                        dataKey="week"
                        tickLine={false}
                        axisLine={false}
                        tickMargin={8}
                      />
                      <YAxis tickLine={false} axisLine={false} width={32} />
                      <ChartTooltip content={<ChartTooltipContent />} />
                      <ChartLegend content={<ChartLegendContent />} />
                      <Area
                        dataKey="opened"
                        type="monotone"
                        stroke="rgba(255, 255, 255, 0.4)"
                        strokeDasharray="4 4"
                        fill="none"
                        strokeWidth={2}
                      />
                      <Area
                        dataKey="completed"
                        type="monotone"
                        stroke="#ffffff"
                        fill="url(#app1Completed)"
                        strokeWidth={2}
                      />
                    </AreaChart>
                  </ChartContainer>
                </CardContent>
              </Card>

              {/* Conference Tracks & Live Feed */}
              <div className="grid gap-6 lg:grid-cols-2">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-sm font-semibold">
                      Core Operations Progress
                    </CardTitle>
                    <CardDescription className="text-xs text-zinc-400">
                      Active milestone readiness for 27–29 November 2026
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="flex flex-col gap-4">
                    {app1Projects.map((project) => (
                      <div key={project.id} className="flex flex-col gap-2">
                        <div className="flex items-center justify-between gap-2">
                          <h3 className="truncate text-xs font-medium text-white">
                            {project.name}
                          </h3>
                          <Badge variant="outline" className="text-[10px] font-mono py-0">
                            {project.status}
                          </Badge>
                        </div>
                        <p className="text-[11px] text-zinc-400">
                          {project.description}
                        </p>
                        <div className="flex items-center gap-3">
                          <Progress
                            value={project.progress}
                            aria-label={`${project.name} progress`}
                          />
                          <span className="shrink-0 text-xs text-zinc-400 tabular-nums font-mono">
                            {project.progress}%
                          </span>
                        </div>
                      </div>
                    ))}
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-sm font-semibold">
                      System Activity & Ledger
                    </CardTitle>
                    <CardDescription className="text-xs text-zinc-400">
                      Recent operations recorded across the platform
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ol className="flex flex-col gap-3.5">
                      {app1Activity.map((entry) => (
                        <li key={entry.id} className="flex items-start gap-3">
                          <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full border border-white/10 bg-zinc-900 text-[10px] font-mono text-zinc-300">
                            {entry.person.initials}
                          </div>
                          <div className="min-w-0 flex-1">
                            <p className="text-xs leading-snug text-zinc-200">
                              <span className="font-semibold text-white">
                                {entry.person.name}
                              </span>{" "}
                              <span className="text-zinc-400">
                                {entry.action}
                              </span>
                            </p>
                            <p className="text-[10px] text-zinc-500 font-mono mt-0.5">
                              {entry.time}
                            </p>
                          </div>
                        </li>
                      ))}
                    </ol>
                  </CardContent>
                </Card>
              </div>
            </>
          )}

          {/* ===============================================================
              TAB: DELEGATES (INDIVIDUAL REGISTRATIONS)
              =============================================================== */}
          {activeTab === "delegates" && (
            <Card>
              <CardHeader>
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <CardTitle className="text-base font-semibold">
                      Individual Delegate Registrations ({filteredDelegates.length})
                    </CardTitle>
                    <CardDescription className="text-xs text-zinc-400 mt-0.5">
                      Allocate committees & portfolios, verify payment UTRs, and dispatch passes
                    </CardDescription>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => exportCsv(filteredDelegates, "delegates")}
                      className="h-8 gap-1.5 text-xs border-white/15"
                    >
                      <Download className="h-3.5 w-3.5" />
                      Export CSV
                    </Button>
                  </div>
                </div>

                {/* Filter Controls */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 pt-3">
                  <div className="relative">
                    <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-zinc-400" />
                    <input
                      type="text"
                      placeholder="Search by name, email, phone, ID..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full h-8 pl-8 pr-3 rounded-lg border border-white/10 bg-zinc-900/60 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-white/30"
                    />
                  </div>

                  <select
                    value={committeeFilter}
                    onChange={(e) => setCommitteeFilter(e.target.value)}
                    className="h-8 px-2.5 rounded-lg border border-white/10 bg-zinc-900/60 text-xs text-white focus:outline-none"
                  >
                    <option value="ALL">All Committees</option>
                    {COMMITTEES.map((c) => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>

                  <select
                    value={paymentFilter}
                    onChange={(e) => setPaymentFilter(e.target.value)}
                    className="h-8 px-2.5 rounded-lg border border-white/10 bg-zinc-900/60 text-xs text-white focus:outline-none"
                  >
                    <option value="ALL">All Payment Statuses</option>
                    <option value="VERIFIED">Verified Only</option>
                    <option value="PENDING">Pending Only</option>
                  </select>
                </div>
              </CardHeader>

              <CardContent className="p-0">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead>
                      <tr className="border-y border-white/10 bg-zinc-950 text-zinc-400 font-mono text-[10px] uppercase">
                        <th className="px-4 py-3">ID / Date</th>
                        <th className="px-4 py-3">Delegate Name & School</th>
                        <th className="px-4 py-3">Contact</th>
                        <th className="px-4 py-3">Assigned Committee & Portfolio</th>
                        <th className="px-4 py-3">Payment UTR</th>
                        <th className="px-4 py-3 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5 font-sans">
                      {filteredDelegates.length === 0 ? (
                        <tr>
                          <td colSpan={6} className="py-8 text-center text-zinc-500 text-xs">
                            No delegates matching the filter criteria.
                          </td>
                        </tr>
                      ) : (
                        filteredDelegates.map((d) => (
                          <tr key={d.regId} className="hover:bg-zinc-900/40 transition-colors">
                            <td className="px-4 py-3 whitespace-nowrap">
                              <span className="font-mono text-xs font-semibold text-white block">
                                {d.regId}
                              </span>
                              <span className="text-[10px] text-zinc-500 font-mono">
                                {d.timestamp ? new Date(d.timestamp).toLocaleDateString() : "Live"}
                              </span>
                            </td>

                            <td className="px-4 py-3">
                              <span className="font-semibold text-white block">
                                {d.fullName}
                              </span>
                              <span className="text-[11px] text-zinc-400 block truncate max-w-xs">
                                {d.institution || "Independent"} · {d.grade || "N/A"}
                              </span>
                            </td>

                            <td className="px-4 py-3 whitespace-nowrap">
                              <span className="text-zinc-300 block font-mono text-[11px]">
                                {d.email}
                              </span>
                              <a
                                href={`https://wa.me/91${d.phone.replace(/[^0-9]/g, "")}`}
                                target="_blank"
                                rel="noreferrer"
                                className="text-zinc-500 hover:text-emerald-400 transition-colors text-[11px] font-mono"
                              >
                                +91 {d.phone}
                              </a>
                            </td>

                            <td className="px-4 py-3">
                              <div className="flex flex-col gap-1">
                                <select
                                  value={d.allocatedCommittee || ""}
                                  onChange={(e) =>
                                    handleUpdateAllocation(d.regId, e.target.value, d.allocatedCountry || "Delegate")
                                  }
                                  className="h-7 px-2 rounded border border-white/10 bg-zinc-900 text-xs text-white focus:outline-none"
                                >
                                  <option value="">Unassigned Committee</option>
                                  {COMMITTEES.map((c) => (
                                    <option key={c} value={c}>{c}</option>
                                  ))}
                                </select>
                                <input
                                  type="text"
                                  placeholder="Portfolio / Country"
                                  defaultValue={d.allocatedCountry || ""}
                                  onBlur={(e) =>
                                    handleUpdateAllocation(d.regId, d.allocatedCommittee || "DISEC", e.target.value)
                                  }
                                  className="h-6 px-2 rounded border border-white/10 bg-zinc-900 text-[11px] text-zinc-200 focus:outline-none"
                                />
                              </div>
                            </td>

                            <td className="px-4 py-3 whitespace-nowrap">
                              <span className="font-mono text-xs text-zinc-300 block">
                                {d.paymentUTR || "None Provided"}
                              </span>
                              <div className="flex items-center gap-1.5 mt-1">
                                <Badge
                                  variant={d.paymentStatus === "VERIFIED" ? "success" : "secondary"}
                                  className="text-[9px] py-0 uppercase font-mono"
                                >
                                  {d.paymentStatus}
                                </Badge>
                                {d.paymentScreenshotURL && (
                                  <button
                                    onClick={() => setViewingImage(d.paymentScreenshotURL)}
                                    className="text-[10px] text-zinc-400 hover:text-white underline inline-flex items-center gap-0.5 cursor-pointer"
                                  >
                                    <Eye className="h-3 w-3" />
                                    Proof
                                  </button>
                                )}
                              </div>
                            </td>

                            <td className="px-4 py-3 text-right whitespace-nowrap">
                              <div className="flex items-center justify-end gap-1.5">
                                {d.paymentStatus !== "VERIFIED" && (
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => handleVerifyPayment(d.regId, d.email)}
                                    className="h-7 px-2 text-[10px] uppercase font-semibold text-emerald-400 border-emerald-500/30 hover:bg-emerald-950/40 cursor-pointer"
                                  >
                                    Verify
                                  </Button>
                                )}
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => {
                                    setCrmEmailTo(d.email);
                                    setCrmRecipientMode("SINGLE");
                                    setActiveTab("crm");
                                  }}
                                  className="h-7 px-2 text-[10px] text-zinc-300 hover:text-white border-white/10 cursor-pointer"
                                >
                                  Email
                                </Button>
                              </div>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          )}

          {/* ===============================================================
              TAB: DELEGATIONS (SCHOOL CONTINGENTS)
              =============================================================== */}
          {activeTab === "delegations" && (
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-base font-semibold">
                      School Delegation Contingents ({delegations.length})
                    </CardTitle>
                    <CardDescription className="text-xs text-zinc-400 mt-0.5">
                      Institutional rosters, faculty adviser details, and settlement
                    </CardDescription>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => exportCsv(delegations, "delegations")}
                    className="h-8 gap-1.5 text-xs border-white/15"
                  >
                    <Download className="h-3.5 w-3.5" />
                    Export CSV
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="p-0">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead>
                      <tr className="border-y border-white/10 bg-zinc-950 text-zinc-400 font-mono text-[10px] uppercase">
                        <th className="px-4 py-3">ID / Institution</th>
                        <th className="px-4 py-3">Adviser / Head</th>
                        <th className="px-4 py-3">Delegates</th>
                        <th className="px-4 py-3">Total Amount</th>
                        <th className="px-4 py-3">Payment UTR</th>
                        <th className="px-4 py-3 text-right">Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                      {delegations.length === 0 ? (
                        <tr>
                          <td colSpan={6} className="py-8 text-center text-zinc-500 text-xs">
                            No institutional delegations registered yet.
                          </td>
                        </tr>
                      ) : (
                        delegations.map((d) => (
                          <tr key={d.delegationId} className="hover:bg-zinc-900/40 transition-colors">
                            <td className="px-4 py-3">
                              <span className="font-semibold text-white block">
                                {d.instName}
                              </span>
                              <span className="font-mono text-[10px] text-zinc-500">
                                {d.delegationId}
                              </span>
                            </td>
                            <td className="px-4 py-3">
                              <span className="text-zinc-200 block">{d.adviserName || "Adviser"}</span>
                              <span className="text-zinc-500 font-mono text-[11px] block">{d.adviserEmail}</span>
                            </td>
                            <td className="px-4 py-3 font-mono font-bold text-white">
                              {d.delegateCount} Delegates
                            </td>
                            <td className="px-4 py-3 font-mono text-emerald-400 font-semibold">
                              {d.totalAmount}
                            </td>
                            <td className="px-4 py-3 whitespace-nowrap">
                              <span className="font-mono text-xs text-zinc-300 block">{d.paymentUTR || "Pending"}</span>
                              <Badge
                                variant={d.paymentStatus === "VERIFIED" ? "success" : "secondary"}
                                className="text-[9px] py-0 uppercase font-mono mt-1"
                              >
                                {d.paymentStatus}
                              </Badge>
                            </td>
                            <td className="px-4 py-3 text-right">
                              {d.paymentScreenshotURL && (
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => setViewingImage(d.paymentScreenshotURL)}
                                  className="h-7 text-xs border-white/10"
                                >
                                  Proof
                                </Button>
                              )}
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          )}

          {/* ===============================================================
              TAB: ABANDONED LEADS (TELEMETRY)
              =============================================================== */}
          {activeTab === "leads" && (
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-base font-semibold">
                      Abandoned Draft Leads ({abandonedLeads.length})
                    </CardTitle>
                    <CardDescription className="text-xs text-zinc-400 mt-0.5">
                      Real-time drop-off beacon capturing candidates who paused mid-form
                    </CardDescription>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => exportCsv(abandonedLeads, "abandoned_leads")}
                    className="h-8 gap-1.5 text-xs border-white/15"
                  >
                    <Download className="h-3.5 w-3.5" />
                    Export CSV
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="p-0">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead>
                      <tr className="border-y border-white/10 bg-zinc-950 text-zinc-400 font-mono text-[10px] uppercase">
                        <th className="px-4 py-3">Lead / Candidate</th>
                        <th className="px-4 py-3">Contact</th>
                        <th className="px-4 py-3">Last Recorded Step</th>
                        <th className="px-4 py-3">Timestamp</th>
                        <th className="px-4 py-3 text-right">Recovery Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                      {abandonedLeads.length === 0 ? (
                        <tr>
                          <td colSpan={5} className="py-8 text-center text-zinc-500 text-xs">
                            No abandoned leads captured at this time.
                          </td>
                        </tr>
                      ) : (
                        abandonedLeads.map((l, idx) => (
                          <tr key={idx} className="hover:bg-zinc-900/40 transition-colors">
                            <td className="px-4 py-3 font-semibold text-white">
                              {l.name || l.fullName || "Prospective Delegate"}
                            </td>
                            <td className="px-4 py-3">
                              <span className="font-mono text-zinc-300 block">{l.email || "No email"}</span>
                              <span className="font-mono text-zinc-500 text-[11px] block">{l.phone}</span>
                            </td>
                            <td className="px-4 py-3">
                              <Badge variant="outline" className="text-[10px] font-mono">
                                {l.step || l.lastStep || "Step 1"}
                              </Badge>
                            </td>
                            <td className="px-4 py-3 text-[11px] font-mono text-zinc-500">
                              {l.timestamp ? new Date(l.timestamp).toLocaleString() : "Recent"}
                            </td>
                            <td className="px-4 py-3 text-right">
                              {l.email && (
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => {
                                    setCrmEmailTo(l.email);
                                    setCrmSubject("Complete Your Resolve MUN 2.0 Registration");
                                    setCrmMessageBody(`Dear ${l.name || "Delegate"},\n\nWe noticed you began your delegate registration for Resolve MUN 2.0 but didn't finish submitting your committee preferences.\n\nSlots across DISEC, UNHRC, UNSC, and Lok Sabha are moving quickly. You can resume your application directly at https://resolvemun.in/?open=delegate\n\nWarm regards,\nSecretariat, Resolve MUN 2.0`);
                                    setCrmRecipientMode("SINGLE");
                                    setActiveTab("crm");
                                  }}
                                  className="h-7 text-xs border-white/15 cursor-pointer"
                                >
                                  Send Reminder
                                </Button>
                              )}
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          )}

          {/* ===============================================================
              TAB: TEAM APPLICATIONS (OC, SECRETARIAT, EB)
              =============================================================== */}
          {activeTab === "applications" && (
            <Card>
              <CardHeader>
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <CardTitle className="text-base font-semibold">
                      Team Applications
                    </CardTitle>
                    <CardDescription className="text-xs text-zinc-400 mt-0.5">
                      Review Organizing Committee, Secretariat, and Executive Board applicants
                    </CardDescription>
                  </div>
                  <div className="flex items-center gap-2">
                    {["ALL", "OC", "SEC", "EB"].map((t) => (
                      <Button
                        key={t}
                        variant={appTypeFilter === t ? "default" : "outline"}
                        size="sm"
                        onClick={() => setAppTypeFilter(t)}
                        className="h-7 text-[11px] font-mono"
                      >
                        {t}
                      </Button>
                    ))}
                  </div>
                </div>
              </CardHeader>
              <CardContent className="p-0">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead>
                      <tr className="border-y border-white/10 bg-zinc-950 text-zinc-400 font-mono text-[10px] uppercase">
                        <th className="px-4 py-3">Applicant & Role</th>
                        <th className="px-4 py-3">Contact</th>
                        <th className="px-4 py-3">Department / Motivation</th>
                        <th className="px-4 py-3">Status</th>
                        <th className="px-4 py-3 text-right">Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                      {[
                        ...ocApplications.map((a) => ({ ...a, roleType: "OC" })),
                        ...secApplications.map((a) => ({ ...a, roleType: "SEC" })),
                        ...ebApplications.map((a) => ({ ...a, roleType: "EB" })),
                      ]
                        .filter((a) => appTypeFilter === "ALL" || a.roleType === appTypeFilter)
                        .map((a, idx) => (
                          <tr key={idx} className="hover:bg-zinc-900/40 transition-colors">
                            <td className="px-4 py-3">
                              <span className="font-semibold text-white block">
                                {a.fullName || a.name || "Candidate"}
                              </span>
                              <Badge variant="outline" className="text-[9px] font-mono mt-0.5">
                                {a.roleType === "OC" ? "Organizing Committee" : a.roleType === "SEC" ? "Secretariat" : "Executive Board"}
                              </Badge>
                            </td>
                            <td className="px-4 py-3">
                              <span className="font-mono text-zinc-300 block">{a.email}</span>
                              <span className="font-mono text-zinc-500 text-[11px] block">{a.phone}</span>
                            </td>
                            <td className="px-4 py-3 max-w-sm">
                              <p className="line-clamp-2 text-zinc-400 text-[11px]">
                                {a.whyJoin || a.previousExperience || a.department || "No statement provided"}
                              </p>
                            </td>
                            <td className="px-4 py-3">
                              <Badge variant="secondary" className="text-[10px] font-mono">
                                {a.status || "Under Review"}
                              </Badge>
                            </td>
                            <td className="px-4 py-3 text-right">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => {
                                  setCrmEmailTo(a.email);
                                  setCrmSubject(`Resolve MUN 2.0 — ${a.roleType} Application Status`);
                                  setCrmMessageBody(`Dear ${a.fullName || "Candidate"},\n\nThank you for applying for the Resolve MUN 2.0 ${a.roleType === "OC" ? "Organizing Committee" : "Secretariat"}.\n\nWe have reviewed your profile and would like to invite you for a virtual interview with the High Command.\n\nPlease reply to this email with your availability over the upcoming weekend.\n\nWarm regards,\nHigh Command, Resolve MUN 2.0`);
                                  setCrmRecipientMode("SINGLE");
                                  setActiveTab("crm");
                                }}
                                className="h-7 text-xs border-white/10"
                              >
                                Contact
                              </Button>
                            </td>
                          </tr>
                        ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          )}

          {/* ===============================================================
              TAB: BROADCAST CRM (DIRECT EMAIL DISPATCH)
              =============================================================== */}
          {activeTab === "crm" && (
            <Card>
              <CardHeader>
                <CardTitle className="text-base font-semibold">
                  Official Communication & Broadcast CRM
                </CardTitle>
                <CardDescription className="text-xs text-zinc-400 mt-0.5">
                  Dispatch official announcements, background guides, and check-in credentials
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSendCrm} className="space-y-4 max-w-2xl">
                  <div>
                    <label className="text-[11px] font-semibold text-zinc-400 uppercase tracking-wider block mb-1.5">
                      Recipient Audience
                    </label>
                    <select
                      value={crmRecipientMode}
                      onChange={(e) => setCrmRecipientMode(e.target.value)}
                      className="w-full h-10 px-3 rounded-lg border border-white/15 bg-zinc-900 text-sm text-white focus:outline-none"
                    >
                      <option value="ALL_DELEGATES">All Verified Delegates ({registrations.filter((r) => r.paymentStatus === "VERIFIED").length})</option>
                      <option value="UNASSIGNED_DELEGATES">Unallocated Delegates Only</option>
                      <option value="OC_APPLICANTS">Organizing Committee Applicants ({ocApplications.length})</option>
                      <option value="SEC_APPLICANTS">Secretariat Applicants ({secApplications.length})</option>
                      <option value="SINGLE">Direct Custom Address</option>
                    </select>
                  </div>

                  {crmRecipientMode === "SINGLE" && (
                    <div>
                      <label className="text-[11px] font-semibold text-zinc-400 uppercase tracking-wider block mb-1.5">
                        Destination Email
                      </label>
                      <input
                        type="email"
                        value={crmEmailTo}
                        onChange={(e) => setCrmEmailTo(e.target.value)}
                        placeholder="delegate@example.com"
                        required
                        className="w-full h-10 px-3 rounded-lg border border-white/15 bg-zinc-900 text-sm text-white font-mono focus:outline-none"
                      />
                    </div>
                  )}

                  <div>
                    <label className="text-[11px] font-semibold text-zinc-400 uppercase tracking-wider block mb-1.5">
                      Subject Line
                    </label>
                    <input
                      type="text"
                      value={crmSubject}
                      onChange={(e) => setCrmSubject(e.target.value)}
                      required
                      className="w-full h-10 px-3 rounded-lg border border-white/15 bg-zinc-900 text-sm text-white focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="text-[11px] font-semibold text-zinc-400 uppercase tracking-wider block mb-1.5">
                      Message Content (Plain Text / Markdown)
                    </label>
                    <textarea
                      rows={8}
                      value={crmMessageBody}
                      onChange={(e) => setCrmMessageBody(e.target.value)}
                      placeholder="Write your official communiqué..."
                      required
                      className="w-full p-3 rounded-lg border border-white/15 bg-zinc-900 text-sm text-white font-sans focus:outline-none leading-relaxed"
                    />
                  </div>

                  <Button
                    type="submit"
                    disabled={crmSending}
                    className="h-10 px-6 bg-white hover:bg-zinc-200 text-black font-semibold text-xs uppercase tracking-wider gap-2 cursor-pointer"
                  >
                    <Send className="h-3.5 w-3.5" />
                    <span>{crmSending ? "Dispatching..." : "Send Communication"}</span>
                  </Button>
                </form>
              </CardContent>
            </Card>
          )}

          {/* ===============================================================
              TAB: SETTINGS (LIVE CONFERENCE TOGGLES & FEES)
              =============================================================== */}
          {activeTab === "settings" && (
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-base font-semibold">
                      Live Conference Controls & Gateways
                    </CardTitle>
                    <CardDescription className="text-xs text-zinc-400 mt-0.5">
                      Toggle active registration pathways and configure dynamic UPI payee pricing
                    </CardDescription>
                  </div>
                  <Button
                    onClick={handleSaveSettings}
                    disabled={settingsSaving}
                    className="h-8 px-4 bg-white hover:bg-zinc-200 text-black font-semibold text-xs uppercase tracking-wider cursor-pointer"
                  >
                    {settingsSaving ? "Saving..." : "Save Settings"}
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-6 max-w-2xl">
                {/* Registration Switches */}
                <div className="space-y-3">
                  <h4 className="text-xs font-semibold text-zinc-300 uppercase tracking-wider">
                    Registration Pathway Toggles
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {[
                      { key: "delegateOpen", label: "Delegate Registration" },
                      { key: "delegationOpen", label: "Delegation Registration" },
                      { key: "ocOpen", label: "Organizing Committee (OC)" },
                      { key: "secretariatOpen", label: "Secretariat Applications" },
                      { key: "ebOpen", label: "Executive Board (EB)" },
                      { key: "socialsOpen", label: "Socials Pass" },
                    ].map((item) => (
                      <label
                        key={item.key}
                        className="flex items-center justify-between p-3 rounded-lg border border-white/10 bg-zinc-900/50 cursor-pointer"
                      >
                        <span className="text-xs text-zinc-200 font-medium">{item.label}</span>
                        <input
                          type="checkbox"
                          checked={Boolean(siteSettings[item.key])}
                          onChange={(e) =>
                            setSiteSettings((prev) => ({
                              ...prev,
                              [item.key]: e.target.checked,
                            }))
                          }
                          className="h-4 w-4 rounded accent-white cursor-pointer"
                        />
                      </label>
                    ))}
                  </div>
                </div>

                {/* Pricing Fields */}
                <div className="space-y-3 pt-2">
                  <h4 className="text-xs font-semibold text-zinc-300 uppercase tracking-wider">
                    Pricing & Settlement Variables (INR)
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div>
                      <label className="text-[10px] font-mono text-zinc-400 block mb-1 uppercase">
                        Delegate Base Fee
                      </label>
                      <input
                        type="text"
                        value={siteSettings.delegateFee || "2500"}
                        onChange={(e) =>
                          setSiteSettings((prev) => ({
                            ...prev,
                            delegateFee: e.target.value,
                          }))
                        }
                        className="w-full h-9 px-3 rounded-lg border border-white/15 bg-zinc-900 text-xs font-mono text-white focus:outline-none"
                      />
                    </div>

                    <div>
                      <label className="text-[10px] font-mono text-zinc-400 block mb-1 uppercase">
                        Delegation Per Head
                      </label>
                      <input
                        type="text"
                        value={siteSettings.delegationFee || "2200"}
                        onChange={(e) =>
                          setSiteSettings((prev) => ({
                            ...prev,
                            delegationFee: e.target.value,
                          }))
                        }
                        className="w-full h-9 px-3 rounded-lg border border-white/15 bg-zinc-900 text-xs font-mono text-white focus:outline-none"
                      />
                    </div>

                    <div>
                      <label className="text-[10px] font-mono text-zinc-400 block mb-1 uppercase">
                        OC Application Fee
                      </label>
                      <input
                        type="text"
                        value={siteSettings.ocFeeFull || "1500"}
                        onChange={(e) =>
                          setSiteSettings((prev) => ({
                            ...prev,
                            ocFeeFull: e.target.value,
                          }))
                        }
                        className="w-full h-9 px-3 rounded-lg border border-white/15 bg-zinc-900 text-xs font-mono text-white focus:outline-none"
                      />
                    </div>
                  </div>
                </div>

                {/* UPI Receiver Info */}
                <div className="space-y-3 pt-2">
                  <h4 className="text-xs font-semibold text-zinc-300 uppercase tracking-wider">
                    UPI Receiver Credentials
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="text-[10px] font-mono text-zinc-400 block mb-1 uppercase">
                        UPI VPA Address
                      </label>
                      <input
                        type="text"
                        value={siteSettings.upiId || "6301550628@nyes"}
                        onChange={(e) =>
                          setSiteSettings((prev) => ({
                            ...prev,
                            upiId: e.target.value,
                          }))
                        }
                        className="w-full h-9 px-3 rounded-lg border border-white/15 bg-zinc-900 text-xs font-mono text-white focus:outline-none"
                      />
                    </div>

                    <div>
                      <label className="text-[10px] font-mono text-zinc-400 block mb-1 uppercase">
                        Payee Verified Name
                      </label>
                      <input
                        type="text"
                        value={siteSettings.upiPayee || "Bejugam Aditya"}
                        onChange={(e) =>
                          setSiteSettings((prev) => ({
                            ...prev,
                            upiPayee: e.target.value,
                          }))
                        }
                        className="w-full h-9 px-3 rounded-lg border border-white/15 bg-zinc-900 text-xs text-white focus:outline-none"
                      />
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* ===============================================================
              TAB: USERS (AUTH ACCOUNTS)
              =============================================================== */}
          {activeTab === "users" && (
            <Card>
              <CardHeader>
                <CardTitle className="text-base font-semibold">
                  Authenticated User Accounts ({siteUsers.length})
                </CardTitle>
                <CardDescription className="text-xs text-zinc-400 mt-0.5">
                  Accounts created via Google sign-in telemetry
                </CardDescription>
              </CardHeader>
              <CardContent className="p-0">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead>
                      <tr className="border-y border-white/10 bg-zinc-950 text-zinc-400 font-mono text-[10px] uppercase">
                        <th className="px-4 py-3">Account Name</th>
                        <th className="px-4 py-3">Email</th>
                        <th className="px-4 py-3">Role / Whitelist</th>
                        <th className="px-4 py-3 text-right">Registered</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                      {siteUsers.length === 0 ? (
                        <tr>
                          <td colSpan={4} className="py-8 text-center text-zinc-500 text-xs">
                            No user records loaded.
                          </td>
                        </tr>
                      ) : (
                        siteUsers.map((u, idx) => (
                          <tr key={idx} className="hover:bg-zinc-900/40 transition-colors">
                            <td className="px-4 py-3 font-semibold text-white">
                              {u.displayName || u.name || "User"}
                            </td>
                            <td className="px-4 py-3 font-mono text-zinc-300">
                              {u.email}
                            </td>
                            <td className="px-4 py-3">
                              <Badge
                                variant={ADMIN_EMAILS.includes((u.email || "").toLowerCase()) ? "default" : "secondary"}
                                className="text-[10px] font-mono"
                              >
                                {ADMIN_EMAILS.includes((u.email || "").toLowerCase()) ? "Admin" : "Delegate"}
                              </Badge>
                            </td>
                            <td className="px-4 py-3 text-right font-mono text-[11px] text-zinc-500">
                              {u.metadata?.creationTime ? new Date(u.metadata.creationTime).toLocaleDateString() : "Active"}
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          )}
        </main>
      </SidebarInset>

      {/* Proof Image Viewer Lightbox Modal */}
      {viewingImage && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-md"
          onClick={() => setViewingImage(null)}
        >
          <div
            className="relative max-w-xl max-h-[85vh] w-full rounded-xl border border-white/20 bg-zinc-950 p-2 overflow-hidden flex flex-col items-center"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setViewingImage(null)}
              className="absolute top-4 right-4 z-10 h-8 w-8 rounded-lg bg-black/80 border border-white/20 text-white flex items-center justify-center cursor-pointer"
            >
              <X className="h-4 w-4" />
            </button>
            <img
              src={viewingImage}
              alt="Payment Screenshot Proof"
              className="w-full h-auto max-h-[75vh] object-contain rounded-lg"
            />
            <div className="w-full p-2 text-center">
              <a
                href={viewingImage}
                target="_blank"
                rel="noreferrer"
                className="text-xs text-zinc-400 hover:text-white underline inline-flex items-center gap-1"
              >
                Open Original in New Tab <ExternalLink className="h-3 w-3" />
              </a>
            </div>
          </div>
        </div>
      )}
    </SidebarProvider>
  );
}
