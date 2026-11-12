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
import EngravedTicket from "@/components/ui/engraved-ticket";
import {
  CheckCircle2, Clock, Lock, ArrowRight,
  RefreshCw, ShieldCheck, ChevronRight,
  Globe, ExternalLink, Trash2, Printer
} from "lucide-react";

const DRAFT_DEFINITIONS = [
  {
    storageKey: "resolveMunRegForm",
    trackKey: "delegate",
    label: "Individual Delegate Registration",
    shortLabel: "Delegate",
    href: "/?open=delegate",
  },
  {
    storageKey: "resolveMunDelRegForm",
    trackKey: "delegation",
    label: "School Delegation Registration",
    shortLabel: "Delegation",
    href: "/?open=delegation",
  },
  {
    storageKey: "resolveMunOcRegForm",
    trackKey: "oc",
    label: "Organizing Committee Application",
    shortLabel: "Organizing Committee",
    href: "/?open=oc",
  },
  {
    storageKey: "resolveMunEbRegForm",
    trackKey: "eb",
    label: "Executive Board Application",
    shortLabel: "Executive Board",
    href: "/?open=eb",
  },
  {
    storageKey: "resolve_socials_reg_draft_v1",
    trackKey: "socials",
    label: "Socials Pass Registration",
    shortLabel: "Socials Pass",
    href: "/?open=socials",
  },
];

function inspectDrafts(isRegistered) {
  if (isRegistered) return [];
  if (typeof window === "undefined") return [];
  const active = [];
  for (const def of DRAFT_DEFINITIONS) {
    try {
      const raw = localStorage.getItem(def.storageKey);
      if (!raw) continue;
      const parsed = JSON.parse(raw);
      if (!parsed || typeof parsed !== "object") continue;

      let filledCount = 0;
      let primaryField = "";
      for (const k of Object.keys(parsed)) {
        const val = parsed[k];
        if (typeof val === "string" && val.trim().length >= 2) {
          filledCount++;
          if (!primaryField && (k.toLowerCase().includes("name") || k.toLowerCase().includes("email"))) {
            primaryField = val.trim();
          }
        }
      }

      if (filledCount >= 3) {
        active.push({
          ...def,
          filledCount,
          primaryField,
        });
      }
    } catch (_) { }
  }
  active.sort((a, b) => b.filledCount - a.filledCount);
  return active.slice(0, 1);
}

function DataTile({ label, value, sub }) {
  return (
    <div className="p-3.5 rounded-xl bg-[#090909] border border-white/10 space-y-1 hover:border-white/20 transition-all">
      <span className="text-[9px] font-mono uppercase tracking-[0.18em] text-white/40 block font-semibold">{label}</span>
      <span className="text-xs sm:text-sm font-semibold block leading-tight truncate text-white">
        {value || "—"}
      </span>
      {sub && <span className="text-[10px] text-white/40 block font-mono">{sub}</span>}
    </div>
  );
}

/**
 * Minimalist Black & White Participation Pathways (No Pills)
 */
function ChoosePathwayBlock({ onSelect, settings = {} }) {
  const masterOpen = settings.registrationsOpen !== false;
  const delOpen = masterOpen && settings.delegateOpen !== false;
  const teamOpen = masterOpen && settings.delegationOpen !== false;
  const secOpen = masterOpen && settings.secretariatOpen !== false;
  const ocOpen = masterOpen && settings.ocOpen !== false;
  const ebOpen = masterOpen && settings.ebOpen !== false;
  const socialsOpen = masterOpen && settings.socialsOpen !== false;

  const handleSelect = (pathway, isOpen) => {
    if (!isOpen) return;
    if (onSelect) {
      onSelect(pathway);
    } else {
      window.location.href = `/?open=${pathway}`;
    }
  };

  const pathways = [
    {
      key: "delegate",
      title: "Priority Delegate",
      tag: delOpen ? `₹${settings.delegateFee || "2,500"}` : "Closed",
      desc: "Participate as an individual delegate in one chosen committee.",
      open: delOpen,
    },
    {
      key: "delegation",
      title: "School Delegation",
      tag: teamOpen ? `₹${settings.delegationFee || "2,200"} / del` : "Closed",
      desc: "Register a contingent of 6+ delegates representing your school or college.",
      open: teamOpen,
    },
    {
      key: "secretariat",
      title: "Secretariat",
      tag: secOpen ? "Leadership" : "Closed",
      desc: "Apply for Under-Secretary-General and senior directorate positions.",
      open: secOpen,
    },
    {
      key: "oc",
      title: "Organizing Committee",
      tag: ocOpen ? `From ₹${settings.ocFeeBasic || "750"}` : "Closed",
      desc: "Lead conference logistics, public relations, creatives, and operations.",
      open: ocOpen,
    },
    {
      key: "eb",
      title: "Executive Board",
      tag: ebOpen ? "Honorary" : "Closed",
      desc: "Direct or moderate one of Resolve MUN 2026's official committees.",
      open: ebOpen,
    },
    {
      key: "socials",
      title: "Socials Pass",
      tag: socialsOpen ? `₹${settings.socialsFee || "999"}` : "Closed",
      desc: "Access the official Resolve MUN 2026 delegate social networking evening.",
      open: socialsOpen,
    },
  ];

  return (
    <section className="space-y-4 text-left font-sans" aria-labelledby="dashboard-pathway-title">
      <div className="flex items-center justify-between border-b border-white/10 pb-3">
        <span className="text-[10px] font-mono tracking-[0.2em] text-white/50 uppercase font-semibold">
          HYDERABAD 2026
        </span>
        <span className="text-[10px] font-mono tracking-[0.15em] text-white/40 uppercase font-semibold truncate">
          MERIDIAN SCHOOL, KOMPALLY
        </span>
      </div>

      <div>
        <h2 id="dashboard-pathway-title" className="font-sans text-xl sm:text-2xl font-bold tracking-tight text-white leading-tight">
          How would you like to participate?
        </h2>
        <p className="mt-1 text-xs text-white/50 leading-relaxed font-sans max-w-[48ch]">
          Select an application track below to begin registration for Resolve MUN 2026.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1" aria-label="Participation pathways">
        {pathways.map((p) => (
          <div
            key={p.key}
            role="button"
            tabIndex={0}
            onClick={() => handleSelect(p.key, p.open)}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                handleSelect(p.key, p.open);
              }
            }}
            className={`group relative flex flex-col justify-between gap-3 rounded-xl border border-white/10 bg-[#090909] p-4 text-left transition-all duration-200 ${p.open
                ? "hover:border-white/30 hover:bg-[#111111] cursor-pointer active:scale-[0.99]"
                : "opacity-40 cursor-not-allowed"
              }`}
          >
            <div className="space-y-1">
              <div className="flex items-center justify-between gap-2">
                <span className="font-sans font-semibold text-sm text-white tracking-tight">
                  {p.title}
                </span>
                <span className="text-xs font-mono text-white/40 tracking-wider">
                  {p.tag}
                </span>
              </div>
              <p className="text-xs text-white/50 leading-relaxed group-hover:text-white/70 transition-colors">
                {p.desc}
              </p>
            </div>
            <div className="flex items-center justify-end pt-1">
              <span
                className="flex h-7 w-7 items-center justify-center rounded-lg border border-white/10 bg-white/[0.02] text-white/40 group-hover:text-white group-hover:border-white/30 transition-all"
                aria-hidden="true"
              >
                <ChevronRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
              </span>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

export default function DelegateDashboard() {
  const [user, setUser] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [delegateRecord, setDelegateRecord] = useState(null);
  const [dataLoading, setDataLoading] = useState(false);
  const [isDeletingAccount, setIsDeletingAccount] = useState(false);

  const handleSelfDeleteAccount = async () => {
    if (
      !confirm(
        "Are you sure you want to permanently delete your account?\n\nThis will permanently erase your profile, registration details, allocated portfolio, and entry pass from Resolve MUN records. This action cannot be undone."
      )
    ) {
      return;
    }
    const targetEmail = user?.email;
    const targetId = user?.id || user?.uid;
    if (!targetEmail && !targetId) return;

    setIsDeletingAccount(true);
    try {
      await fetch("/api/admin/", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "USER_DELETE_SELF",
          email: targetEmail,
          userId: targetId,
        }),
      });
      await signOutUser();
      if (typeof window !== "undefined") {
        localStorage.clear();
        sessionStorage.clear();
        window.location.href = "/?account_deleted=true";
      }
    } catch (_) {
      alert("Failed to delete account. Please try again or contact the Secretariat.");
      setIsDeletingAccount(false);
    }
  };
  const [systemSettings, setSystemSettings] = useState({
    registrationsOpen: true,
    roundName: "Priority Round Applications",
  });
  const [ticketVariant, setTicketVariant] = useState("paper");
  const [ticketFormat, setTicketFormat] = useState("badge");
  const [drafts, setDrafts] = useState([]);

  useEffect(() => {
    setDrafts(inspectDrafts(false));

    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      if (firebaseUser) {
        const normalized = {
          uid: firebaseUser.uid,
          id: firebaseUser.uid,
          email: firebaseUser.email,
          displayName:
            firebaseUser.displayName ||
            firebaseUser.email?.split("@")[0] ||
            "Delegate",
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
        const roleType =
          record.roleType ||
          (String(record.appId || record.regId || "").includes("-OC-")
            ? "OC"
            : String(record.appId || record.regId || "").includes("-SEC-")
              ? "SECRETARIAT"
              : String(record.appId || record.regId || "").includes("-EB-")
                ? "EB"
                : record.delId
                  ? "DELEGATION"
                  : "DELEGATE");
        const delegateId =
          record.regId ||
          record.appId ||
          record.delId ||
          record.delegateId ||
          (record.id
            ? `RM26-DEL-${String(record.id).slice(0, 4).toUpperCase()}`
            : "RM26-CONFIRMED");
        const fullName =
          record.fullName ||
          record.name ||
          record.headDelegateName ||
          user?.displayName ||
          "Participant";
        const paymentUTR =
          record.paymentUTR ||
          record.payment_utr ||
          (roleType === "SECRETARIAT" || roleType === "EB"
            ? "HONORARY-EXEMPT"
            : "");
        const status = record.status || "Confirmed";
        const isPaymentOk =
          roleType === "SECRETARIAT" ||
          roleType === "EB" ||
          status === "Confirmed" ||
          status === "Payment_Verified" ||
          status === "Manual_Approved" ||
          status === "APPROVED" ||
          status === "Accepted" ||
          status === "Allocated" ||
          (paymentUTR && String(paymentUTR).trim().length > 3);

        setDelegateRecord({
          ...record,
          roleType,
          delegateId,
          fullName,
          email: record.email || email,
          phone: record.phone || "",
          grade: record.grade || record["Grade"] || "",
          paymentUTR,
          paymentStatus: isPaymentOk ? "VERIFIED" : "PENDING_VERIFICATION",
          status,
          allocatedCommittee:
            record.allocatedCommittee ||
            record.allocated_committee ||
            record["Allocated Committee"] ||
            (roleType === "OC"
              ? "Organizing Committee"
              : roleType === "SECRETARIAT"
                ? "Secretariat"
                : roleType === "EB"
                  ? "Executive Board"
                  : ""),
          allocatedCountry:
            record.allocatedCountry ||
            record.allocated_country ||
            record["Allocated Country"] ||
            (roleType === "OC"
              ? record.feeTier || "OC Member"
              : roleType === "SECRETARIAT"
                ? record.position || "Secretariat Directorate"
                : roleType === "EB"
                  ? record.role_preference || "Executive Board Member"
                  : ""),
          institution:
            record.institution ||
            record.institute ||
            record.schoolCollege ||
            record.institutionName ||
            record["School / Institution"] ||
            "Individual Delegate",
          checkInDay1: Boolean(record.checkInDay1 || record.check_in_day1),
          checkInDay2: Boolean(record.checkInDay2 || record.check_in_day2),
          checkInDay3: Boolean(record.checkInDay3 || record.check_in_day3),
          pref1: record.pref1_committee
            ? `${record.pref1_committee} · ${record.pref1_country || "General"}`
            : record.committeePref1 || record.pref1 || null,
          pref2: record.pref2_committee
            ? `${record.pref2_committee} · ${record.pref2_country || "General"}`
            : record.committeePref2 || record.pref2 || null,
          pref3: record.pref3_committee
            ? `${record.pref3_committee} · ${record.pref3_country || "General"}`
            : record.committeePref3 || record.pref3 || null,
        });
      } else {
        const isLocallyRegistered =
          typeof window !== "undefined" &&
          localStorage.getItem("resolve_user_registered") === "true";
        if (isLocallyRegistered) {
          const storedEmail =
            localStorage.getItem("resolve_user_email") || email;
          const storedName =
            localStorage.getItem("resolve_user_name") ||
            user?.displayName ||
            "Delegate";
          const storedId =
            localStorage.getItem("resolve_delegate_id") || "RM26-DEL-CONFIRMED";
          setDelegateRecord({
            regId: storedId,
            delegateId: storedId,
            fullName: storedName,
            email: storedEmail,
            status: "Confirmed",
            paymentStatus: "VERIFIED",
            institution: "Individual Delegate",
            roleType: "DELEGATE",
          });
        } else {
          setDelegateRecord(null);
        }
      }

      if (settings) {
        setSystemSettings({
          ...settings,
          registrationsOpen:
            settings.registrationsOpen !== false &&
            settings.registrations_open !== false,
          roundName:
            settings.roundName ||
            settings.round_name ||
            "Priority Round Applications",
        });
      }
    } catch (e) {
      console.error("[Dashboard] Error fetching profile:", e);
    } finally {
      setDataLoading(false);
    }
  };

  const handlePrintPass = () => {
    document.body.classList.add("print-pass-active");
    const cleanup = () => {
      document.body.classList.remove("print-pass-active");
      window.removeEventListener("afterprint", cleanup);
    };
    window.addEventListener("afterprint", cleanup);
    setTimeout(() => {
      window.print();
      setTimeout(cleanup, 3000);
    }, 100);
  };

  const handleDiscardDraft = (storageKey) => {
    if (typeof window === "undefined") return;
    try {
      localStorage.removeItem(storageKey);
      setDrafts(inspectDrafts(isReg));
    } catch (_) { }
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
    (delegateRecord.regId ||
      delegateRecord.delegateId ||
      delegateRecord.fullName ||
      delegateRecord.found)
  );
  const isPaid =
    isReg &&
    (delegateRecord.paymentStatus === "VERIFIED" ||
      delegateRecord.status === "Confirmed" ||
      delegateRecord.status === "Manual_Approved" ||
      delegateRecord.status === "Payment_Verified" ||
      delegateRecord.status === "ALLOTTED" ||
      delegateRecord.status === "APPROVED" ||
      delegateRecord.roleType === "SECRETARIAT" ||
      delegateRecord.roleType === "EB" ||
      Boolean(
        delegateRecord.paymentUTR &&
        String(delegateRecord.paymentUTR).trim().length > 3
      ));
  const isAllotted = isReg && Boolean(delegateRecord.allocatedCommittee);

  useEffect(() => {
    setDrafts(inspectDrafts(isReg));
  }, [isReg]);

  const initials = (user?.displayName || user?.email || "D")
    .split(" ")
    .map((w) => w[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
  const displayName =
    user?.displayName || user?.email?.split("@")[0] || "Delegate";

  if (authLoading) {
    return (
      <div className="min-h-screen bg-black text-white flex flex-col items-center justify-center gap-4">
        <div className="w-10 h-10 rounded-xl border border-white/20 bg-[#0a0a0a] flex items-center justify-center">
          <span className="font-mono font-bold text-white text-base">R</span>
        </div>
        <div className="flex gap-1.5">
          {[0, 1, 2].map((i) => (
            <div
              key={i}
              className="w-1.5 h-1.5 rounded-full bg-white/70 animate-pulse"
              style={{ animationDelay: `${i * 0.2}s` }}
            />
          ))}
        </div>
        <p className="text-xs text-white/40 font-mono">Authenticating...</p>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-black text-white flex flex-col justify-between selection:bg-white selection:text-black">
        <Navbar />
        <div className="flex-1 flex items-center justify-center p-4 pt-28">
          <div className="w-full max-w-md p-8 rounded-2xl border border-white/15 bg-[#080808] text-center space-y-6">
            <div className="w-12 h-12 rounded-xl border border-white/20 bg-white/[0.04] flex items-center justify-center mx-auto text-white">
              <Lock className="w-5 h-5 text-white/80" />
            </div>
            <div className="space-y-1.5">
              <p className="text-[10px] font-mono uppercase tracking-[0.2em] text-white/40 font-semibold">
                RESOLVE MUN 2026
              </p>
              <h1 className="text-xl sm:text-2xl font-bold text-white tracking-tight font-sans">
                Sign In to Your Dashboard
              </h1>
              <p className="text-xs text-white/50 leading-relaxed font-sans max-w-sm mx-auto">
                Sign in to view your application status, committee assignment, event passes, and conference schedule.
              </p>
            </div>
            <Link
              href="/?open=auth"
              className="flex h-11 w-full items-center justify-center rounded-xl bg-white text-xs font-mono font-bold uppercase tracking-wider text-black transition-all hover:bg-neutral-200 active:scale-[0.99]"
            >
              Sign In <ArrowRight className="w-3.5 h-3.5 ml-1.5" />
            </Link>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
      <div id="dashboard-root" className="min-h-screen bg-black text-white font-sans selection:bg-white selection:text-black flex flex-col justify-between">
        <Navbar />

          <main id="dashboard-main" className="max-w-4xl w-full mx-auto px-4 sm:px-6 pt-24 sm:pt-28 pb-20 space-y-5 flex-1">

            {/* 1. IDENTITY & PROFILE CARD */}
            <section className="relative overflow-hidden rounded-2xl border border-white/15 bg-[#080808] p-4 sm:p-7 shadow-sm">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 sm:gap-6">
                <div className="flex items-center gap-3.5 sm:gap-5">
                  <div className="relative shrink-0">
                    {user.photoURL ? (
                      <img
                        src={user.photoURL}
                        alt={displayName}
                        className="w-12 h-12 sm:w-16 sm:h-16 rounded-xl object-cover border border-white/20"
                      />
                    ) : (
                      <div className="w-12 h-12 sm:w-16 sm:h-16 rounded-xl bg-[#111111] border border-white/20 flex items-center justify-center text-white font-mono font-bold text-lg sm:text-xl">
                        {initials}
                      </div>
                    )}
                    {isReg && (
                      <div className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-white text-black flex items-center justify-center border-2 border-black">
                        <CheckCircle2 className="w-3.5 h-3.5" strokeWidth={3} />
                      </div>
                    )}
                  </div>

                  <div className="min-w-0 space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-mono text-white/40 uppercase tracking-wider">
                        {systemSettings.roundName}
                      </span>
                      <span className="text-white/20">·</span>
                      <span className="text-[10px] font-mono text-white/40 uppercase tracking-wider">
                        Hyderabad 2026
                      </span>
                    </div>

                    <h1 className="text-xl sm:text-2xl font-bold text-white tracking-tight font-sans">
                      {displayName}
                    </h1>
                    <p className="text-xs text-white/40 font-mono truncate">
                      {user.email}
                    </p>

                    {/* Single Clean Monochrome Status Line */}
                    <div className="pt-1.5 flex flex-wrap items-center gap-2">
                      {isReg ? (
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-mono font-bold tracking-wider uppercase text-white">
                            {delegateRecord.roleType || "DELEGATE"} PASS
                          </span>
                          <span className="text-xs font-mono text-white/40">·</span>
                          <span className="text-xs font-mono text-white/60">
                            Payment: <strong className="text-white font-semibold">{isPaid ? "Verified" : "Under Review"}</strong>
                          </span>
                        </div>
                      ) : (
                        <span className="text-xs font-mono text-white/50">
                          Status: <strong className="text-white/80 font-normal">No active registration</strong>
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Delegate ID & Top Actions */}
                <div className="flex sm:flex-col items-center sm:items-end justify-between gap-3 pt-4 sm:pt-0 border-t sm:border-t-0 border-white/10">
                  {isReg && delegateRecord?.delegateId ? (
                    <div className="p-3 rounded-xl bg-[#0e0e0e] border border-white/15 text-left sm:text-right">
                      <span className="text-[9px] text-white/40 font-mono uppercase tracking-wider block font-semibold">DELEGATE ID</span>
                      <span className="text-sm sm:text-base font-mono font-bold text-white tracking-wider block mt-0.5">
                        {delegateRecord.delegateId}
                      </span>
                    </div>
                  ) : (
                    <span className="text-xs font-mono text-white/40">
                      Account Verified
                    </span>
                  )}

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => fetchDelegateProfile(user?.id, user?.email, true)}
                      disabled={dataLoading}
                      className="h-8 px-3 rounded-lg border border-white/15 bg-white/[0.03] hover:bg-white/[0.08] text-xs font-mono text-white/70 hover:text-white flex items-center gap-1.5 transition-all cursor-pointer"
                    >
                      <RefreshCw className={`w-3 h-3 ${dataLoading ? "animate-spin" : ""}`} />
                      <span>{dataLoading ? "Syncing..." : "Refresh"}</span>
                    </button>
                    <button
                      type="button"
                      onClick={handleSignOut}
                      className="h-8 px-3 rounded-lg border border-white/15 bg-white/[0.03] hover:bg-white/[0.08] text-xs font-mono text-white/50 hover:text-white transition-colors cursor-pointer"
                    >
                      Sign Out
                    </button>
                  </div>
                </div>
              </div>

              <div className="mt-5 pt-4 border-t border-white/10 flex flex-wrap items-center justify-between gap-2 text-xs text-white/40 font-mono">
                <div>
                  Venue: <span className="text-white/70 font-sans">Meridian School, Kompally</span>
                </div>
                <div>
                  Dates: <span className="text-white/70 font-sans">27th – 29th November 2026</span>
                </div>
              </div>
            </section>

            {/* 2. INCOMPLETE APPLICATION RESUME NOTIFICATION */}
            {!isReg && drafts.length > 0 && (
              <section className="space-y-2.5">
                {drafts.map((draft) => (
                  <div
                    key={draft.storageKey}
                    className="rounded-xl border border-white/20 bg-[#090909] p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 transition-all"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
                        <span className="text-[10px] font-mono uppercase tracking-[0.18em] text-white/50 font-semibold">
                          Incomplete Draft Detected
                        </span>
                      </div>
                      <h3 className="text-sm sm:text-base font-bold text-white tracking-tight font-sans">
                        Continue your {draft.label}
                      </h3>
                      <p className="text-xs text-white/50 leading-relaxed font-sans max-w-xl">
                        You have saved details from your previous session ({draft.filledCount} fields filled
                        {draft.primaryField ? ` · "${draft.primaryField}"` : ""}). Pick up right where you left off.
                      </p>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <button
                        type="button"
                        onClick={() => handleDiscardDraft(draft.storageKey)}
                        title="Clear saved draft data"
                        className="h-8 px-3 rounded-lg border border-white/10 hover:border-white/30 bg-transparent text-xs font-mono text-white/40 hover:text-white transition-all cursor-pointer flex items-center gap-1.5"
                      >
                        <Trash2 className="w-3 h-3" />
                        <span>Discard</span>
                      </button>
                      <Link
                        href={draft.href}
                        className="h-8 px-4 rounded-lg bg-white text-black hover:bg-neutral-200 text-xs font-mono font-bold uppercase tracking-wider transition-all flex items-center gap-1.5 cursor-pointer shadow-sm active:scale-98"
                      >
                        <span>Continue Application</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </Link>
                    </div>
                  </div>
                ))}
              </section>
            )}

            {/* 3. UNREGISTERED STATE: CHOOSE PATHWAY */}
            {!isReg && (
              <section className="rounded-2xl border border-white/15 bg-[#080808] p-6 sm:p-7 shadow-sm">
                <ChoosePathwayBlock
                  settings={systemSettings}
                  onSelect={(track) => {
                    window.location.href = `/?open=${track}`;
                  }}
                />
              </section>
            )}

            {/* 4. REGISTERED STATE */}
            {isReg && (
              <div className="space-y-5">
                {/* REGISTRATION DETAILS */}
                <section className="rounded-2xl border border-white/15 bg-[#080808] p-6 sm:p-7 shadow-sm space-y-5">
                  <div className="flex items-center justify-between border-b border-white/10 pb-4">
                    <div>
                      <p className="text-[10px] uppercase font-mono tracking-wider font-semibold text-white/40">
                        YOUR REGISTRATION
                      </p>
                      <h3 className="text-base sm:text-lg font-bold text-white font-sans mt-0.5">
                        Registration Overview
                      </h3>
                    </div>
                    <span className="text-xs font-mono text-white/50">
                      {delegateRecord.delegationCode && delegateRecord.delegationCode !== "Independent"
                        ? `Team: ${delegateRecord.delegationCode}`
                        : "Individual Registration"}
                    </span>
                  </div>

                  {/* Committee Preferences */}
                  {(delegateRecord.pref1 || delegateRecord.pref2 || delegateRecord.pref3) && (
                    <div>
                      <p className="text-xs font-mono text-white/40 uppercase tracking-wider mb-2 font-semibold">
                        Submitted Committee Choices
                      </p>
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                        {[1, 2, 3].map((n) => (
                          <div key={n} className="p-3.5 rounded-xl bg-[#090909] border border-white/10">
                            <span className="text-[10px] font-mono text-white/40 block font-semibold">Choice {n}</span>
                            <span className="text-xs sm:text-sm font-semibold text-white mt-1 block leading-snug truncate">
                              {delegateRecord[`pref${n}`] || "—"}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Data Grid */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                    <DataTile label="Institution" value={delegateRecord.institution || "Individual"} />
                    <DataTile label="Grade / Year" value={delegateRecord.grade || "—"} />
                    <DataTile label="Assigned Committee" value={isAllotted ? delegateRecord.allocatedCommittee : "Awaiting Allotment"} />
                    <DataTile label="Country / Portfolio" value={isAllotted ? (delegateRecord.allocatedCountry || "Delegate") : "Awaiting Allotment"} />
                  </div>

                  {/* Payment Verification Box */}
                  <div className="p-4 rounded-xl bg-[#090909] border border-white/10 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div className="space-y-1">
                      <span className="text-[10px] font-mono uppercase tracking-wider text-white/40 font-semibold block">
                        Payment Status
                      </span>
                      <div className="flex items-center gap-2">
                        {isPaid ? (
                          <>
                            <ShieldCheck className="w-4 h-4 text-white" />
                            <span className="text-xs sm:text-sm font-bold text-white font-mono">Payment Verified</span>
                          </>
                        ) : (
                          <>
                            <Clock className="w-4 h-4 text-white/50 animate-pulse" />
                            <span className="text-xs sm:text-sm font-bold text-white/80 font-mono">Verification in Progress</span>
                          </>
                        )}
                      </div>
                      {delegateRecord.paymentUTR && (
                        <p className="text-xs text-white/40 font-mono">
                          UTR: <span className="text-white/70">{delegateRecord.paymentUTR}</span>
                        </p>
                      )}
                    </div>

                    {isPaid && (
                      <span className="text-xs font-mono font-semibold uppercase tracking-wider text-white self-start sm:self-auto">
                        Seat Confirmed
                      </span>
                    )}
                  </div>
                </section>

                {/* DIGITAL ENTRY PASS */}
                  <section id="digital-pass-card" className="rounded-2xl border border-white/15 bg-[#080808] p-6 sm:p-7 shadow-sm">
                    <div className="mb-5 border-b border-white/10 pb-4">
                      <p className="text-[10px] uppercase font-mono tracking-wider font-semibold text-white/40">
                        CREDENTIAL
                      </p>
                      <h3 className="text-base sm:text-lg font-bold text-white font-sans mt-0.5">
                        Official Digital Pass
                      </h3>
                      <p className="text-xs text-white/50 mt-1 font-sans">
                        Present this QR pass at the entrance desk at Meridian School, Kompally.
                      </p>
                    </div>

                    {isPaid ? (
                      <div className="flex flex-col items-center space-y-5">
                        {/* Variant Switcher & Print Control */}
                        <div className="w-full flex flex-wrap items-center justify-between gap-3 pb-2 border-b border-white/10 no-print">
                          <div className="flex flex-wrap items-center gap-3">
                            <div className="flex items-center gap-1.5">
                              <span className="text-[10px] font-mono text-white/40 uppercase tracking-wider">
                                Format:
                              </span>
                              <button
                                type="button"
                                onClick={() => setTicketFormat("badge")}
                                className={`h-7 px-3 rounded-lg text-xs font-mono transition-all cursor-pointer ${ticketFormat === "badge"
                                    ? "bg-white text-black font-bold shadow-sm"
                                    : "bg-white/[0.04] text-white/50 hover:text-white border border-white/10"
                                  }`}
                              >
                                VIP Badge
                              </button>
                              <button
                                type="button"
                                onClick={() => setTicketFormat("stub")}
                                className={`h-7 px-3 rounded-lg text-xs font-mono transition-all cursor-pointer ${ticketFormat === "stub"
                                    ? "bg-white text-black font-bold shadow-sm"
                                    : "bg-white/[0.04] text-white/50 hover:text-white border border-white/10"
                                  }`}
                              >
                                Ticket Stub
                              </button>
                            </div>

                            <div className="flex items-center gap-1.5">
                              <span className="text-[10px] font-mono text-white/40 uppercase tracking-wider">
                                Theme:
                              </span>
                              <button
                                type="button"
                                onClick={() => setTicketVariant("paper")}
                                className={`h-7 px-2.5 rounded-lg text-xs font-mono transition-all cursor-pointer ${ticketVariant === "paper"
                                    ? "bg-white text-black font-bold shadow-sm"
                                    : "bg-white/[0.04] text-white/50 hover:text-white border border-white/10"
                                  }`}
                              >
                                Paper
                              </button>
                              <button
                                type="button"
                                onClick={() => setTicketVariant("crimson")}
                                className={`h-7 px-2.5 rounded-lg text-xs font-mono transition-all cursor-pointer ${ticketVariant === "crimson"
                                    ? "bg-[#d9241c] text-white font-bold shadow-sm"
                                    : "bg-white/[0.04] text-white/50 hover:text-white border border-white/10"
                                  }`}
                              >
                                Crimson
                              </button>
                            </div>
                          </div>

                          <button
                            type="button"
                            onClick={handlePrintPass}
                            className="h-7 px-3 rounded-lg border border-white/15 bg-white/[0.03] hover:bg-white/[0.08] text-xs font-mono text-white/70 hover:text-white flex items-center gap-1.5 transition-all cursor-pointer"
                          >
                            <Printer className="w-3.5 h-3.5" />
                            <span>Print Pass</span>
                          </button>
                        </div>

                        {/* Engraved Ticket Component with Unique QR */}
                        <div className="w-full flex justify-center py-2" id="printable-pass-container">
                          <EngravedTicket
                            format={ticketFormat}
                            variant={ticketVariant}
                            word="RESOLVE"
                            code={delegateRecord.delegateId || "RM26-CONFIRMED"}
                            qrUrl={`https://quickchart.io/qr?size=320&text=${encodeURIComponent(
                              "RESOLVE_PASS:" +
                              (delegateRecord.roleType || "DELEGATE") +
                              ":" +
                              delegateRecord.delegateId +
                              ":" +
                              delegateRecord.email
                            )}`}
                            qrLabel={`${delegateRecord.roleType || "DELEGATE"} PASS`}
                            delegateName={delegateRecord.fullName || user.displayName}
                            committee={delegateRecord.allocatedCommittee || "Awaiting Allotment"}
                            portfolio={delegateRecord.allocatedCountry || ""}
                            tagline={`RESOLVE MUN 2.0\n${(delegateRecord.roleType || "DELEGATE").toUpperCase()} PASS`}
                            quote="“27TH – 29TH NOV 2026”"
                            body={`Official delegate admission credential for Resolve MUN 2026. Convenes at Meridian School, Kompally, Hyderabad. Present this unique scannable pass at the entrance registration desk upon arrival.`}
                            notes={`ADMIT ONE\n${delegateRecord.delegateId}\nMERIDIAN KOMPALLY\nACTIVE PASS`}
                            width="100%"
                            className="max-w-2xl"
                          />
                        </div>

                        {/* 3-Day Attendance Tracker */}
                        <div className="w-full max-w-2xl rounded-xl border border-white/10 bg-[#090909] p-4 space-y-3 no-print">
                          <div className="flex items-center justify-between text-xs font-mono text-white/50">
                            <span className="uppercase tracking-wider font-semibold text-[10px]">
                              Conference Check-In Tracker
                            </span>
                            <span className="text-white/70">
                              {delegateRecord.delegateId}
                            </span>
                          </div>

                          <div className="grid grid-cols-3 gap-2">
                            {[
                              { day: "Day 1", date: "27 Nov", checked: delegateRecord.checkInDay1 },
                              { day: "Day 2", date: "28 Nov", checked: delegateRecord.checkInDay2 },
                              { day: "Day 3", date: "29 Nov", checked: delegateRecord.checkInDay3 },
                            ].map((d) => (
                              <div
                                key={d.day}
                                className={`p-3 rounded-lg border text-center font-mono transition-all ${d.checked
                                    ? "bg-white text-black border-white font-bold"
                                    : "bg-white/[0.02] border-white/10 text-white/40"
                                  }`}
                              >
                                <span className="text-xs block font-bold">{d.day}</span>
                                <span className="text-[10px] block mt-0.5 opacity-80">
                                  {d.checked ? "Checked In ✓" : d.date}
                                </span>
                              </div>
                            ))}
                          </div>

                          <div className="flex items-center justify-between pt-2 border-t border-white/10 text-xs font-mono text-white/40">
                            <span>Meridian School, Kompally</span>
                            <span className="text-white/80 font-semibold flex items-center gap-1.5">
                              <ShieldCheck className="w-3.5 h-3.5 text-white" />
                              Verified Digital Credential
                            </span>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="flex flex-col items-center py-10 text-center space-y-4">
                        <div className="w-14 h-14 rounded-2xl bg-white/[0.03] border border-white/10 flex items-center justify-center mx-auto text-white/40">
                          <Clock className="w-6 h-6 animate-pulse" />
                        </div>
                        <div className="space-y-1.5 max-w-md">
                          <h4 className="text-base font-bold text-white font-sans">
                            Pass Verification in Progress
                          </h4>
                          <p className="text-xs text-white/50 leading-relaxed font-sans">
                            We're verifying your transaction (UTR:{" "}
                            <span className="font-mono text-white">
                              {delegateRecord.paymentUTR || "Submitted"}
                            </span>
                            ). Your official <strong>Engraved QR Entry Pass</strong> will unlock here automatically as soon as payment is confirmed by the Secretariat in the admin portal.
                          </p>
                        </div>
                      </div>
                    )}
                  </section>
              </div>
            )}

            {/* 5. QUICK LINKS */}
            <section className="p-5 sm:p-6 rounded-2xl border border-white/15 bg-[#080808] space-y-3 shadow-sm">
              <p className="text-[10px] font-mono uppercase tracking-wider font-semibold text-white/40">
                QUICK LINKS
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                <Link
                  href="/"
                  className="group flex items-center gap-3 p-3.5 rounded-xl bg-[#090909] hover:bg-[#111111] border border-white/10 hover:border-white/30 transition-all"
                >
                  <Globe className="w-4 h-4 text-white/40 group-hover:text-white transition-colors shrink-0" />
                  <span className="text-xs font-semibold text-white/70 group-hover:text-white transition-colors">
                    Return to Home Page
                  </span>
                  <ExternalLink className="w-3.5 h-3.5 text-white/20 ml-auto group-hover:text-white/60 transition-colors" />
                </Link>

                <button
                  type="button"
                  onClick={() => fetchDelegateProfile(user?.id, user?.email, true)}
                  className="group flex items-center gap-3 p-3.5 rounded-xl bg-[#090909] hover:bg-[#111111] border border-white/10 hover:border-white/30 transition-all cursor-pointer w-full text-left"
                >
                  <RefreshCw
                    className={`w-4 h-4 text-white/40 group-hover:text-white transition-colors shrink-0 ${dataLoading ? "animate-spin" : ""
                      }`}
                  />
                  <span className="text-xs font-semibold text-white/70 group-hover:text-white transition-colors">
                    Refresh Record Status
                  </span>
                  {dataLoading && (
                    <span className="text-xs text-white/50 font-mono ml-auto">
                      Syncing...
                    </span>
                  )}
                </button>

              </div>
            </section>

            {/* 6. DANGER ZONE: SELF-SERVE DATA PURGE */}
            <section className="p-5 sm:p-6 rounded-2xl border border-red-500/20 bg-red-950/[0.06] space-y-3">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="space-y-1">
                  <p className="text-[10px] font-mono uppercase tracking-wider font-semibold text-red-400">
                    DANGER ZONE &bull; ACCOUNT &amp; PRIVACY
                  </p>
                  <p className="text-xs text-white/60 font-sans">
                    Permanently delete your profile, committee applications, and all submitted registration data.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={handleSelfDeleteAccount}
                  disabled={isDeletingAccount}
                  className="inline-flex items-center justify-center gap-2 h-9 px-4 rounded-xl border border-red-500/30 bg-red-500/10 hover:bg-red-500/20 text-red-400 hover:text-red-300 text-xs font-semibold transition-all cursor-pointer disabled:opacity-50 shrink-0"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>{isDeletingAccount ? "Purging Data..." : "Delete Account & Purge Data"}</span>
                </button>
              </div>
            </section>
          </main>

          <Footer />
      </div>
      );
}
