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
import { printOfficialReceipt, downloadQrPassImage, printQrPassPdf } from "@/lib/receiptGenerator";
import {
  getDelegateReferralCode,
  getStallCouponCode,
  calculateResStats,
  RES_POINTS_PER_REFERRAL,
  RES_POINT_RUPEE_VALUE,
  RUPEES_PER_REFERRAL,
} from "@/lib/referrals";
import {
  CheckCircle2, Clock, Lock, ArrowRight,
  RefreshCw, ShieldCheck, ChevronRight,
  Globe, ExternalLink, Trash2, Printer,
  Pencil, MapPin, Award, X, Save, Bus,
  Copy, Check, Share2, Ticket, Gift
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
          {(settings?.venueShort || settings?.conferenceVenue || "NORTHFIELD INTERNATIONAL SCHOOL").toUpperCase()}
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
  const [isMobile, setIsMobile] = useState(false);
  const [copiedField, setCopiedField] = useState("");
  const [activeTab, setActiveTab] = useState("overview");

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth <= 768);
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);

  // Works reliably over BOTH HTTPS and LAN HTTP (e.g. http://192.168.x.x:3000)
  const handleCopyValue = async (val, key) => {
    if (!val) return;
    let copied = false;
    try {
      if (navigator?.clipboard?.writeText && window.isSecureContext) {
        await navigator.clipboard.writeText(val);
        copied = true;
      }
    } catch (_) {}

    if (!copied) {
      try {
        const ta = document.createElement("textarea");
        ta.value = val;
        ta.setAttribute("readonly", "");
        ta.style.position = "fixed";
        ta.style.top = "-9999px";
        ta.style.left = "-9999px";
        document.body.appendChild(ta);
        ta.focus();
        ta.select();
        ta.setSelectionRange(0, val.length);
        copied = document.execCommand("copy");
        ta.remove();
      } catch (_) {}
    }

    if (copied) {
      setCopiedField(key);
      setTimeout(() => setCopiedField(""), 1800);
    } else {
      window.prompt("Copy this link:", val);
    }
  };

  // High-friction 3-step self-serve account deletion modal state
  const [showDangerZone, setShowDangerZone] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [deleteStep, setDeleteStep] = useState(1);
  const [deleteAck1, setDeleteAck1] = useState(false);
  const [deleteAck2, setDeleteAck2] = useState(false);
  const [deleteAck3, setDeleteAck3] = useState(false);
  const [deleteReason, setDeleteReason] = useState("");
  const [deleteEmailInput, setDeleteEmailInput] = useState("");
  const [deletePhraseInput, setDeletePhraseInput] = useState("");
  const [deleteCooldown, setDeleteCooldown] = useState(5);
  const [deleteError, setDeleteError] = useState("");

  useEffect(() => {
    if (!deleteModalOpen || deleteStep !== 3) return;
    setDeleteCooldown(5);
    const interval = setInterval(() => {
      setDeleteCooldown((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [deleteModalOpen, deleteStep]);

  const openDeleteAccountFlow = () => {
    setDeleteStep(1);
    setDeleteAck1(false);
    setDeleteAck2(false);
    setDeleteAck3(false);
    setDeleteReason("");
    setDeleteEmailInput("");
    setDeletePhraseInput("");
    setDeleteCooldown(5);
    setDeleteError("");
    setDeleteModalOpen(true);
  };

  const handleConfirmFinalDelete = async () => {
    const targetEmail = (user?.email || "").trim().toLowerCase();
    const targetId = user?.id || user?.uid;
    if (!targetEmail && !targetId) return;

    if (deleteEmailInput.trim().toLowerCase() !== targetEmail) {
      setDeleteError("Entered email does not match your signed-in account.");
      return;
    }
    if (deletePhraseInput.trim().toUpperCase() !== "DELETE MY ACCOUNT") {
      setDeleteError('Please type "DELETE MY ACCOUNT" exactly to confirm.');
      return;
    }
    if (deleteCooldown > 0) return;

    setIsDeletingAccount(true);
    setDeleteError("");
    try {
      const [delRes] = await Promise.allSettled([
        fetch("/api/delegate/", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            action: "DELETE_MY_ACCOUNT",
            email: targetEmail,
            userId: targetId,
            confirmPhrase: deletePhraseInput.trim(),
            reason: deleteReason,
          }),
        }),
        fetch("/api/admin/", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            action: "USER_DELETE_SELF",
            email: targetEmail,
            userId: targetId,
          }),
        }),
      ]);

      if (delRes.status === "fulfilled" && !delRes.value.ok) {
        throw new Error("Could not complete server-side deletion.");
      }

      // Attempt to permanently delete Firebase Auth user; fall back to signOut if recent login is required
      try {
        if (auth?.currentUser) {
          const { deleteUser } = await import("firebase/auth");
          await deleteUser(auth.currentUser);
        }
      } catch (_) {
        await signOutUser();
      }

      if (typeof window !== "undefined") {
        localStorage.clear();
        sessionStorage.clear();
        window.location.href = "/?account_deleted=true";
      }
    } catch (err) {
      setDeleteError(err?.message || "Failed to delete account. Please try again or contact the Secretariat.");
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

  // Delegate Self-Edit Modal State
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [editForm, setEditForm] = useState({});
  const [editSaving, setEditSaving] = useState(false);
  const [editSuccessMsg, setEditSuccessMsg] = useState("");

  const openEditProfileModal = () => {
    if (!delegateRecord) return;
    setEditForm({
      fullName: delegateRecord.fullName || "",
      phone: delegateRecord.phone || "",
      institution: delegateRecord.institution || "",
      grade: delegateRecord.grade || "",
      dob: delegateRecord.dob || "",
      address: delegateRecord.address || "",
      transport: delegateRecord.transport || "No",
      experience: delegateRecord.experience || "",
      pref1_committee: delegateRecord.pref1_committee || "",
      pref1_country: delegateRecord.pref1_country || "",
      pref2_committee: delegateRecord.pref2_committee || "",
      pref2_country: delegateRecord.pref2_country || "",
      pref3_committee: delegateRecord.pref3_committee || "",
      pref3_country: delegateRecord.pref3_country || "",
    });
    setEditSuccessMsg("");
    setIsEditingProfile(true);
  };

  const handleSaveProfile = async (e) => {
    if (e && e.preventDefault) e.preventDefault();
    setEditSaving(true);
    setEditSuccessMsg("");

    try {
      const targetEmail = (delegateRecord?.email || user?.email || "").trim().toLowerCase();
      const targetId = delegateRecord?.regId || delegateRecord?.delegateId || "";

      const res = await fetch("/api/delegate/", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...editForm,
          email: targetEmail,
          regId: targetId,
        }),
      });

      const data = await res.json();
      if (data && (data.success || data.found !== false)) {
        const updatedPref1 = editForm.pref1_committee
          ? `${editForm.pref1_committee}${editForm.pref1_country ? ' · ' + editForm.pref1_country : ''}`
          : delegateRecord.pref1;
        const updatedPref2 = editForm.pref2_committee
          ? `${editForm.pref2_committee}${editForm.pref2_country ? ' · ' + editForm.pref2_country : ''}`
          : delegateRecord.pref2;
        const updatedPref3 = editForm.pref3_committee
          ? `${editForm.pref3_committee}${editForm.pref3_country ? ' · ' + editForm.pref3_country : ''}`
          : delegateRecord.pref3;

        const updated = {
          ...delegateRecord,
          ...editForm,
          pref1: updatedPref1,
          pref2: updatedPref2,
          pref3: updatedPref3,
          preferencesUpdatedCount: Number(data.preferencesUpdatedCount ?? delegateRecord.preferencesUpdatedCount ?? 0),
          preferences_updated_count: Number(data.preferencesUpdatedCount ?? delegateRecord.preferences_updated_count ?? 0),
          preferencesLocked: Boolean(data.preferencesLocked || delegateRecord.preferencesLocked),
        };

        setDelegateRecord(updated);

        // Update session storage cache
        try {
          const cacheKey = `resolve_delegate_cache_${targetEmail}`;
          sessionStorage.setItem(cacheKey, JSON.stringify({ timestamp: Date.now(), data: updated }));
        } catch (_) { }

        setEditSuccessMsg(data.message || "Your details have been updated successfully!");
        setTimeout(() => {
          setIsEditingProfile(false);
          setEditSuccessMsg("");
        }, 1200);
      } else {
        alert("Failed to save changes: " + (data.message || "Unknown error"));
      }
    } catch (err) {
      alert("Error saving changes. Please check your internet connection.");
    } finally {
      setEditSaving(false);
    }
  };

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
        fetchDelegateProfile(normalized.uid, normalized.email, true);
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
        const status = record.status || "Pending";
        const rawPayUpper = String(record.paymentStatus || record.payment_status || "").toUpperCase().trim();
        const rawStatusUpper = String(status || "").toUpperCase().trim();
        const isPayFailed =
          rawPayUpper.includes("FAIL") ||
          rawPayUpper.includes("REJECT") ||
          rawStatusUpper.includes("FAIL");
        const isPayPending =
          !isPayFailed &&
          (rawPayUpper.includes("PENDING") || rawPayUpper.includes("REVIEW"));
        const isPayVerified =
          !isPayFailed &&
          !isPayPending &&
          (roleType === "SECRETARIAT" ||
            roleType === "EB" ||
            rawPayUpper === "VERIFIED" ||
            rawPayUpper === "PAID" ||
            rawPayUpper === "APPROVED" ||
            status === "Payment_Verified" ||
            status === "Manual_Approved" ||
            status === "APPROVED" ||
            status === "Accepted" ||
            status === "Allocated");

        setDelegateRecord({
          ...record,
          roleType,
          delegateId,
          fullName,
          email: record.email || email,
          phone: record.phone || "",
          grade: record.grade || record["Grade"] || "",
          dob: record.dob || record["DOB"] || record["Date of Birth"] || "",
          address: record.address || record.residential_address || record.residentialAddress || record["Address"] || "",
          transport: record.transport || record.transport_needed || record.transportNeeded || record["Transport"] || "No",
          experience: record.experience || record.mun_experience || record.munExperience || record["Experience"] || "",
          pref1_committee: record.pref1_committee || record.committeePref1 || "",
          pref1_country: record.pref1_country || record.pref1_portfolio1 || "",
          pref2_committee: record.pref2_committee || record.committeePref2 || "",
          pref2_country: record.pref2_country || record.pref2_portfolio1 || "",
          pref3_committee: record.pref3_committee || record.committeePref3 || "",
          pref3_country: record.pref3_country || record.pref3_portfolio1 || "",
          paymentUTR,
          paymentStatus: isPayFailed ? "FAILED" : isPayVerified ? "VERIFIED" : "PENDING_VERIFICATION",
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
          checkInDay1: String(record.checkInDay1 || record.check_in_day1 || "").toLowerCase() === "present",
          checkInDay2: String(record.checkInDay2 || record.check_in_day2 || "").toLowerCase() === "present",
          checkInDay3: String(record.checkInDay3 || record.check_in_day3 || "").toLowerCase() === "present",
          pref1: record.pref1 || (record.pref1_committee
            ? `${record.pref1_committee} · ${record.pref1_country || "General"}`
            : record.committeePref1 || null),
          pref2: record.pref2 || (record.pref2_committee
            ? `${record.pref2_committee} · ${record.pref2_country || "General"}`
            : record.committeePref2 || null),
          pref3: record.pref3 || (record.pref3_committee
            ? `${record.pref3_committee} · ${record.pref3_country || "General"}`
            : record.committeePref3 || null),
        });
      } else {
        // Server confirmed no registration exists (e.g. never registered or deleted by Admin).
        // Wipe all local registration flags, caches, and saved form drafts so it resets cleanly.
        if (typeof window !== "undefined") {
          try {
            localStorage.removeItem("resolve_user_registered");
            localStorage.removeItem("resolve_delegate_id");
            localStorage.removeItem("resolve_user_email");
            localStorage.removeItem("resolve_user_name");
            const keysToRemove = [];
            for (let i = 0; i < localStorage.length; i++) {
              const k = localStorage.key(i);
              if (k && (k.startsWith("resolve_draft_") || k.startsWith("resolve_form_") || k.startsWith("resolve_delegate_"))) {
                keysToRemove.push(k);
              }
            }
            keysToRemove.forEach((k) => localStorage.removeItem(k));
            sessionStorage.clear();
          } catch (_) {}
        }
        setDelegateRecord(null);
        setDrafts([]);
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

  const handlePrintReceipt = () => {
    const rec = delegateRecord || {};
    const rawId = rec.regId || rec.delegateId || "RM26-DEL-0000";
    const cleanId = /^[0-9a-f]{8}-[0-9a-f]{4}-/i.test(rawId)
      ? `RM-${rawId.replace(/-/g, "").slice(0, 4).toUpperCase()}`
      : String(rawId || "").replace(/^RM26-DEL-/i, "RM-");
    printOfficialReceipt({
      ticketId: cleanId,
      cardHolder: rec.fullName || rec.name || user?.displayName || "Registered Delegate",
      email: rec.email || user?.email || "",
      phone: rec.phone || "",
      institution: rec.institution || rec.school || "",
      passCategory:
        rec.roleType === "OC"
          ? "Organizing Committee Pass"
          : rec.roleType === "SECRETARIAT"
            ? "Secretariat Credential"
            : rec.roleType === "SOCIALS"
              ? "Socials Night Pass"
              : "Delegate Pass",
      amount: rec.roleType === "SOCIALS" ? 999 : rec.roleType === "OC" ? 1500 : rec.roleType === "SECRETARIAT" ? 0 : 2500,
      utrNumber: rec.paymentUTR || rec.payment_utr || "",
      date: rec.created_at ? new Date(rec.created_at) : new Date(),
      paymentStatus:
        rec.paymentStatus === "VERIFIED"
          ? "Verified & Confirmed"
          : rec.paymentStatus === "FAILED"
            ? "Payment Failed"
            : "Recorded · Pending Verification",
      conferenceDates: systemSettings?.conferenceDates || "26, 27 December 2026",
      venue:
        systemSettings?.conferenceVenue ||
        "Northfield International School, Devarayamjal Road, Kompally, Hyderabad 500078",
    });
  };

  const handleDownloadQrImage = () => {
    const rec = delegateRecord || {};
    const rawId = rec.regId || rec.delegateId || "RM26-DEL-0000";
    const cleanId = /^[0-9a-f]{8}-[0-9a-f]{4}-/i.test(rawId)
      ? `RM-${rawId.replace(/-/g, "").slice(0, 4).toUpperCase()}`
      : String(rawId || "").replace(/^RM26-DEL-/i, "RM-");
    downloadQrPassImage({
      ticketId: cleanId,
      cardHolder: rec.fullName || rec.name || user?.displayName || "Registered Delegate",
      roleType: rec.roleType || "DELEGATE",
      email: rec.email || user?.email || "",
    });
  };

  const handlePrintPass = () => {
    const rec = delegateRecord || {};
    const rawId = rec.regId || rec.delegateId || "RM26-DEL-0000";
    const cleanId = /^[0-9a-f]{8}-[0-9a-f]{4}-/i.test(rawId)
      ? `RM-${rawId.replace(/-/g, "").slice(0, 4).toUpperCase()}`
      : String(rawId || "").replace(/^RM26-DEL-/i, "RM-");
    printQrPassPdf({
      ticketId: cleanId,
      cardHolder: rec.fullName || rec.name || user?.displayName || "Registered Delegate",
      roleType: rec.roleType || "DELEGATE",
      email: rec.email || user?.email || "",
      committee: rec.allocatedCommittee || "",
    });
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
    const isPaymentFailed =
      isReg &&
      (String(delegateRecord.paymentStatus || "").toUpperCase().includes("FAIL") ||
        String(delegateRecord.paymentStatus || "").toUpperCase().includes("REJECT") ||
        String(delegateRecord.status || "").toUpperCase().includes("FAIL"));
    const isPaid =
      isReg &&
      !isPaymentFailed &&
      (delegateRecord.paymentStatus === "VERIFIED" ||
        delegateRecord.status === "Manual_Approved" ||
        delegateRecord.status === "Payment_Verified" ||
        delegateRecord.status === "ALLOTTED" ||
        delegateRecord.status === "APPROVED" ||
        delegateRecord.roleType === "SECRETARIAT" ||
        delegateRecord.roleType === "EB");
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
          <div className="no-print"><Navbar /></div>
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
          <div className="no-print"><Footer /></div>
        </div>
      );
    }

    const rawDelegateId = delegateRecord?.delegateId || delegateRecord?.regId || "";
    const formattedDelegateId = /^[0-9a-f]{8}-[0-9a-f]{4}-/i.test(rawDelegateId)
      ? `RM-${rawDelegateId.replace(/-/g, "").slice(0, 4).toUpperCase()}`
      : String(rawDelegateId || "").replace(/^RM26-DEL-/i, "RM-");

    const crmTabs = [
      { id: "overview", label: "Overview" },
      ...(isReg
        ? [
            { id: "application", label: "Application" },
            { id: "pass", label: "Gate Pass" },
            { id: "referrals", label: "Referrals" },
          ]
        : []),
      { id: "account", label: "Account" },
    ];

    return (
      <div id="dashboard-root" className="min-h-screen bg-black text-white font-sans selection:bg-white selection:text-black flex flex-col justify-between">
        {/* DEDICATED MINIMAL SAAS WORKSPACE TOP BAR (Zero landing-page notch collision) */}
        <header className="no-print sticky top-0 z-40 h-14 border-b border-[#1f1f1f] bg-black/95 backdrop-blur-sm">
          <div className="max-w-6xl h-full mx-auto px-4 sm:px-6 flex items-center justify-between gap-3">
            <div className="flex items-center gap-2.5 min-w-0">
              <Link href="/" className="flex items-center gap-2 !no-underline shrink-0">
                <img src="/images/Logo.svg" alt="Resolve MUN" className="w-5 h-5 object-contain" />
                <span
                  className="text-base tracking-[0.12em] text-white font-bold pt-0.5"
                  style={{ fontFamily: "'Bebas Neue', sans-serif" }}
                >
                  RESOLVE MUN 2.0
                </span>
              </Link>
              <span className="text-zinc-700 hidden sm:inline">/</span>
              <span className="text-xs text-zinc-400 hidden sm:inline truncate">Delegate Workspace</span>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <button
                type="button"
                onClick={() => fetchDelegateProfile(user?.id, user?.email, true)}
                disabled={dataLoading}
                className="h-8 px-2.5 rounded-md border border-[#262626] bg-black hover:bg-white/[0.04] text-xs text-zinc-300 hover:text-white flex items-center gap-1.5 cursor-pointer"
                title="Sync latest status"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${dataLoading ? "animate-spin" : ""}`} />
                <span className="hidden sm:inline">{dataLoading ? "Syncing" : "Sync"}</span>
              </button>
              <Link
                href="/"
                className="h-8 px-2.5 rounded-md border border-[#262626] bg-black hover:bg-white/[0.04] text-xs text-zinc-300 hover:text-white flex items-center gap-1.5"
              >
                <Globe className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Home</span>
              </Link>
              <button
                type="button"
                onClick={handleSignOut}
                className="lg:hidden h-8 px-2.5 rounded-md border border-[#262626] bg-black text-xs text-zinc-400 hover:text-white cursor-pointer"
              >
                Sign Out
              </button>
            </div>
          </div>
        </header>

        <main id="dashboard-main" className="no-print max-w-6xl w-full mx-auto px-4 sm:px-6 pt-6 sm:pt-8 pb-20 flex-1">
          {/* SAAS / CRM WORKSPACE SHELL: LEFT SIDEBAR ON DESKTOP + CRISP TOP TABS ON PHONES */}
          <div className="grid grid-cols-1 lg:grid-cols-[224px_minmax(0,1fr)] gap-5 lg:gap-7 items-start">
            {/* DESKTOP CRM SIDEBAR */}
            <aside className="hidden lg:flex flex-col sticky top-20 border border-[#1f1f1f] bg-black rounded-md overflow-hidden">
              <div className="p-3.5 border-b border-[#1f1f1f] flex items-center gap-2.5">
                {user.photoURL ? (
                  <img src={user.photoURL} alt={displayName} className="w-8 h-8 rounded-full object-cover shrink-0" />
                ) : (
                  <div className="w-8 h-8 rounded-full bg-[#141414] border border-[#262626] flex items-center justify-center text-xs font-bold text-white shrink-0">
                    {initials}
                  </div>
                )}
                <div className="min-w-0">
                  <p className="m-0 text-xs font-semibold text-white truncate">{displayName}</p>
                  <p className="m-0 text-[11px] text-zinc-500 truncate mt-0.5">{formattedDelegateId || user.email}</p>
                </div>
              </div>

              <div className="p-2 flex flex-col gap-0.5" role="tablist" aria-label="Dashboard sections">
                {crmTabs.map((t) => {
                  const active = activeTab === t.id;
                  return (
                    <button
                      key={t.id}
                      type="button"
                      role="tab"
                      aria-selected={active}
                      onClick={() => setActiveTab(t.id)}
                      className={`w-full h-9 px-3 rounded text-left text-xs font-medium flex items-center justify-between cursor-pointer transition-colors ${
                        active
                          ? "bg-white text-black font-semibold"
                          : "bg-transparent text-zinc-400 hover:text-white hover:bg-white/[0.04]"
                      }`}
                    >
                      <span>{t.label}</span>
                      {t.id === "pass" && isPaymentFailed && (
                        <span className="w-2 h-2 rounded-full bg-red-500" />
                      )}
                    </button>
                  );
                })}
              </div>

              <div className="p-2 border-t border-[#1f1f1f] space-y-0.5">
                <button
                  type="button"
                  onClick={handleSignOut}
                  className="w-full h-8 px-3 rounded text-left text-xs text-zinc-500 hover:text-white hover:bg-white/[0.04] cursor-pointer"
                >
                  Sign Out
                </button>
              </div>
            </aside>

            {/* MAIN CRM WORKSPACE COLUMN */}
            <div className="min-w-0 space-y-4">
              {/* MOBILE CRM HORIZONTAL TAB STRIP */}
              <div className="lg:hidden flex items-center gap-1.5 overflow-x-auto pb-2 border-b border-[#1f1f1f]">
                {crmTabs.map((t) => {
                  const active = activeTab === t.id;
                  return (
                    <button
                      key={t.id}
                      type="button"
                      onClick={() => setActiveTab(t.id)}
                      className={`shrink-0 h-9 px-3.5 rounded-md text-xs font-medium whitespace-nowrap cursor-pointer ${
                        active
                          ? "bg-white text-black font-semibold"
                          : "bg-black text-zinc-400 border border-[#262626]"
                      }`}
                    >
                      {t.label}
                    </button>
                  );
                })}
              </div>

          {/* 1. IDENTITY & PROFILE CARD (Visible on Overview tab) */}
          {activeTab === "overview" && (isMobile ? (
            <section className="rounded-xl border border-[#1f1f1f] bg-black p-4 space-y-4">
              {/* Profile Header Row */}
              <div className="flex items-center gap-3">
                {user.photoURL ? (
                  <img
                    src={user.photoURL}
                    alt={displayName}
                    className="w-11 h-11 rounded-full object-cover shrink-0"
                  />
                ) : (
                  <div className="w-11 h-11 rounded-full bg-[#141414] border border-[#262626] flex items-center justify-center text-white font-mono font-bold text-sm shrink-0">
                    {initials}
                  </div>
                )}
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between gap-2">
                    <h1 className="m-0 text-base font-bold text-white tracking-tight truncate leading-tight">
                      {displayName}
                    </h1>
                    {isReg && (
                      <span
                        className={`shrink-0 px-2 py-0.5 rounded text-[9px] font-mono font-bold uppercase tracking-wider ${isPaymentFailed
                          ? "bg-red-600 text-white"
                          : isPaid
                            ? "bg-white text-black"
                            : "bg-[#171717] text-[#d4d4d4] border border-[#333333]"
                          }`}
                      >
                        {isPaymentFailed ? "Payment Failed" : isPaid ? "Verified" : "Pending"}
                      </span>
                    )}
                  </div>
                  <p className="m-0 text-xs text-[#8c8c8c] truncate mt-0.5 leading-tight">
                    {user.email}
                  </p>
                </div>
              </div>

              {/* Clean 2x2 Key-Value Strip */}
              <div className="grid grid-cols-2 gap-px bg-[#1f1f1f] border border-[#1f1f1f] rounded-lg overflow-hidden">
                <div className="bg-black p-2.5 min-w-0">
                  <span className="block text-[9px] font-mono uppercase tracking-widest text-[#737373]">
                    Delegate ID
                  </span>
                  <span className="block text-xs font-mono font-bold text-white mt-1 truncate">
                    {formattedDelegateId || "Not Registered"}
                  </span>
                </div>
                <div className="bg-black p-2.5 min-w-0">
                  <span className="block text-[9px] font-mono uppercase tracking-widest text-[#737373]">
                    Pass Type
                  </span>
                  <span className="block text-xs font-semibold text-white mt-1 truncate">
                    {isReg ? `${delegateRecord.roleType || "Delegate"} Pass` : "None"}
                  </span>
                </div>
                <div className="bg-black p-2.5 min-w-0">
                  <span className="block text-[9px] font-mono uppercase tracking-widest text-[#737373]">
                    Venue
                  </span>
                  <span className="block text-xs text-[#d4d4d4] mt-1 truncate">
                    Northfield Int&apos;l School
                  </span>
                </div>
                <div className="bg-black p-2.5 min-w-0">
                  <span className="block text-[9px] font-mono uppercase tracking-widest text-[#737373]">
                    Dates
                  </span>
                  <span className="block text-xs text-[#d4d4d4] mt-1 truncate">
                    26, 27 Dec 2026
                  </span>
                </div>
              </div>

              {/* Action Row */}
              <div className="grid grid-cols-2 gap-2.5">
                <button
                  type="button"
                  onClick={() => fetchDelegateProfile(user?.id, user?.email, true)}
                  disabled={dataLoading}
                  className="h-9 px-3 rounded-lg border border-[#262626] bg-black text-xs font-medium text-white flex items-center justify-center gap-1.5 whitespace-nowrap cursor-pointer"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${dataLoading ? "animate-spin" : ""}`} />
                  <span>{dataLoading ? "Syncing..." : "Refresh"}</span>
                </button>
                <button
                  type="button"
                  onClick={handleSignOut}
                  className="h-9 px-3 rounded-lg border border-[#262626] bg-black text-xs font-medium text-[#a3a3a3] flex items-center justify-center whitespace-nowrap cursor-pointer"
                >
                  Sign Out
                </button>
              </div>
            </section>
          ) : (
            <section className="rounded-md border border-[#1f1f1f] bg-black p-5 space-y-4">
              <div className="flex items-center justify-between gap-4">
                <div className="flex items-center gap-3.5 min-w-0">
                  {user.photoURL ? (
                    <img
                      src={user.photoURL}
                      alt={displayName}
                      className="w-12 h-12 rounded-md object-cover border border-[#262626] shrink-0"
                    />
                  ) : (
                    <div className="w-12 h-12 rounded-md bg-[#111111] border border-[#262626] flex items-center justify-center text-white font-mono font-bold text-base shrink-0">
                      {initials}
                    </div>
                  )}

                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <h1 className="m-0 text-lg font-bold text-white tracking-tight truncate">
                        {displayName}
                      </h1>
                      {isReg && (
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-semibold uppercase tracking-wider shrink-0 ${
                            isPaymentFailed
                              ? "bg-red-600 text-white"
                              : isPaid
                                ? "bg-white text-black"
                                : "border border-[#333333] text-zinc-300"
                          }`}
                        >
                          {isPaymentFailed ? "Payment Failed" : isPaid ? "Verified" : "Pending"}
                        </span>
                      )}
                    </div>
                    <p className="m-0 text-xs text-zinc-500 truncate mt-0.5">
                      {user.email}
                    </p>
                  </div>
                </div>

                {isReg && formattedDelegateId && (
                  <div className="text-right shrink-0">
                    <span className="block text-[10px] font-mono uppercase tracking-wider text-zinc-500">
                      Delegate ID
                    </span>
                    <span className="block text-sm font-mono font-semibold text-white mt-0.5">
                      {formattedDelegateId}
                    </span>
                  </div>
                )}
              </div>

              <div className="pt-3.5 border-t border-[#1f1f1f] flex flex-wrap items-center justify-between gap-2 text-xs text-zinc-500">
                <div>
                  Venue: <span className="text-zinc-300">{systemSettings.conferenceVenue || "Northfield International School"}</span>
                </div>
                <div>
                  Dates: <span className="text-zinc-300">{systemSettings.conferenceDates || "26, 27 December 2026"}</span>
                </div>
              </div>
            </section>
            ))}

            {/* CRM OVERVIEW QUICK KPI GRID & JUMP CARDS */}
            {activeTab === "overview" && isReg && (
              <section className="rounded-md border border-[#262626] bg-black p-4 sm:p-5 space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] uppercase tracking-widest text-zinc-500 font-medium">
                    Workspace Summary
                  </span>
                  <button
                    type="button"
                    onClick={openEditProfileModal}
                    className="h-8 px-3 rounded-md border border-[#262626] bg-black text-xs font-medium text-white hover:bg-white/5 cursor-pointer"
                  >
                    Edit Details
                  </button>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-px bg-[#1f1f1f] border border-[#1f1f1f] rounded-md overflow-hidden">
                  <button
                    type="button"
                    onClick={() => setActiveTab("application")}
                    className="bg-black p-3.5 text-left cursor-pointer hover:bg-white/[0.02]"
                  >
                    <span className="block text-[10px] text-zinc-500">Payment</span>
                    <span className={`block text-sm font-semibold mt-1 ${isPaymentFailed ? "text-red-400" : "text-white"}`}>
                      {isPaymentFailed ? "Failed" : isPaid ? "Verified" : "Pending"}
                    </span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setActiveTab("application")}
                    className="bg-black p-3.5 text-left cursor-pointer hover:bg-white/[0.02]"
                  >
                    <span className="block text-[10px] text-zinc-500">Allotment</span>
                    <span className="block text-sm font-semibold text-white mt-1 truncate">
                      {delegateRecord.allocatedCommittee || "Pending"}
                    </span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setActiveTab("pass")}
                    className="bg-black p-3.5 text-left cursor-pointer hover:bg-white/[0.02]"
                  >
                    <span className="block text-[10px] text-zinc-500">Gate Pass</span>
                    <span className="block text-sm font-semibold text-white mt-1">
                      {isPaid ? "Active →" : "Locked"}
                    </span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setActiveTab("referrals")}
                    className="bg-black p-3.5 text-left cursor-pointer hover:bg-white/[0.02]"
                  >
                    <span className="block text-[10px] text-zinc-500">RES Points</span>
                    <span className="block text-sm font-semibold text-white mt-1">
                      {(delegateRecord.referralStats?.activePoints || 0).toLocaleString("en-IN")} RES
                    </span>
                  </button>
                </div>

                <div className="grid grid-cols-2 gap-2.5">
                  <button
                    type="button"
                    onClick={() => setActiveTab("pass")}
                    className="h-10 px-3 rounded-md bg-white text-black text-xs font-semibold flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <span>Open Gate Pass</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={() => setActiveTab("referrals")}
                    className="h-10 px-3 rounded-md border border-[#262626] bg-black text-white text-xs font-medium flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <span>Share Referral</span>
                  </button>
                </div>
              </section>
            )}

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

          {/* 4. REGISTERED STATE (TAB-SCOPED CRM PANELS) */}
          {isReg && (
            <div className="space-y-4">
              {/* REGISTRATION DETAILS (Application Tab) */}
              {activeTab === "application" && (
              <section className="rounded-md border border-[#262626] bg-black p-5 sm:p-6 space-y-5">
                <div className="flex items-center justify-between border-b border-white/10 pb-4 flex-wrap gap-3">
                  <div>
                    <p className="text-[10px] uppercase font-mono tracking-wider font-semibold text-white/40">
                      YOUR REGISTRATION
                    </p>
                    <h3 className="text-base sm:text-lg font-bold text-white font-sans mt-0.5">
                      Registration Overview
                    </h3>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-xs font-mono text-white/50 hidden sm:inline">
                      {delegateRecord.delegationCode && delegateRecord.delegationCode !== "Independent"
                        ? `Team: ${delegateRecord.delegationCode}`
                        : "Individual Registration"}
                    </span>
                    <button
                      type="button"
                      onClick={openEditProfileModal}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white text-black font-semibold text-xs hover:bg-zinc-200 transition-colors cursor-pointer shadow-sm"
                    >
                      <Pencil className="w-3.5 h-3.5" />
                      <span>Edit Details</span>
                    </button>
                  </div>
                </div>

                {/* Committee Preferences */}
                {(() => {
                  const isPrefsLocked = Boolean(
                    delegateRecord.preferencesLocked ||
                    Number(delegateRecord.preferencesUpdatedCount ?? delegateRecord.preferences_updated_count ?? 0) >= 1
                  );
                  return (
                    <div className="space-y-2.5">
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <div className="flex items-center gap-2">
                          <p className="m-0 text-xs font-mono text-white/40 uppercase tracking-wider font-semibold">
                            Submitted Committee Choices
                          </p>
                          <span
                            className={`px-2 py-0.5 rounded text-[10px] font-mono font-semibold uppercase tracking-wider ${
                              isPrefsLocked
                                ? "border border-[#333333] bg-[#141414] text-zinc-400"
                                : "bg-white text-black"
                            }`}
                          >
                            {isPrefsLocked ? "Locked · 1/1 Change Used" : "1 One-Time Change Available"}
                          </span>
                        </div>
                        {!isPrefsLocked && (
                          <button
                            type="button"
                            onClick={openEditProfileModal}
                            className="text-[11px] font-mono text-white hover:underline flex items-center gap-1 cursor-pointer"
                          >
                            <Pencil className="w-3 h-3" /> Change Choices (Once Only)
                          </button>
                        )}
                      </div>

                      <div className="px-3.5 py-2.5 rounded-md border border-[#262626] bg-[#070707] text-[11.5px] text-zinc-400">
                        {isPrefsLocked ? (
                          <span>
                            <strong className="text-white">Preferences Locked:</strong> You have already used your one-time committee preference update. Contact the Secretariat if you require an administrative override.
                          </span>
                        ) : (
                          <span>
                            <strong className="text-white">Note:</strong> You can update your committee and country preferences <strong className="text-white">only once</strong> after registration. Once saved, your choices will be permanently locked.
                          </span>
                        )}
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                        {[1, 2, 3].map((n) => {
                          const comm = delegateRecord[`pref${n}_committee`];
                          const ctry = delegateRecord[`pref${n}_country`];
                          const displayVal = comm
                            ? `${comm}${ctry ? " · " + ctry : ""}`
                            : delegateRecord[`pref${n}`] || "Not specified";
                          return (
                            <div key={n} className="p-3.5 rounded-xl bg-[#090909] border border-white/10 space-y-1">
                              <span className="text-[10px] font-mono text-white/40 block font-semibold uppercase">Choice {n}</span>
                              <span className="text-xs sm:text-sm font-semibold text-white mt-1 block leading-snug truncate">
                                {displayVal}
                              </span>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  );
                })()}

                {/* Core Data Grid */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                  <DataTile label="Institution" value={delegateRecord.institution || "Individual"} />
                  <DataTile label="Grade / Class" value={delegateRecord.grade || "—"} />
                  <DataTile label="Date of Birth" value={delegateRecord.dob || "—"} />
                  <DataTile
                    label="Transportation"
                    value={
                      delegateRecord.transport && String(delegateRecord.transport).toLowerCase().includes("yes")
                        ? "Yes (Opted In)"
                        : "No (Self Commute)"
                    }
                  />
                  <DataTile label="Assigned Committee" value={isAllotted ? delegateRecord.allocatedCommittee : "Awaiting Allotment"} />
                  <DataTile label="Country / Portfolio" value={isAllotted ? (delegateRecord.allocatedCountry || "Delegate") : "Awaiting Allotment"} />
                  <DataTile label="Contact Phone" value={delegateRecord.phone || "—"} />
                  <DataTile label="Registered Email" value={delegateRecord.email || user?.email || "—"} />
                </div>

                {/* Address & MUN Experience Row */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {/* Residential Address */}
                  <div className="p-4 rounded-xl bg-[#090909] border border-white/10 space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1.5">
                        <MapPin className="w-3.5 h-3.5 text-zinc-400" />
                        <span className="text-[10px] font-mono uppercase tracking-wider text-white/50 font-semibold">
                          Full Residential Address
                        </span>
                      </div>
                      <button
                        type="button"
                        onClick={openEditProfileModal}
                        className="text-[10px] font-mono text-zinc-400 hover:text-white cursor-pointer"
                      >
                        Edit
                      </button>
                    </div>
                    <p className="text-xs text-zinc-300 leading-relaxed font-sans">
                      {delegateRecord.address || "No residential address provided yet. Click 'Edit Details' to add your address."}
                    </p>
                  </div>

                  {/* MUN Experience */}
                  <div className="p-4 rounded-xl bg-[#090909] border border-white/10 space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1.5">
                        <Award className="w-3.5 h-3.5 text-zinc-400" />
                        <span className="text-[10px] font-mono uppercase tracking-wider text-white/50 font-semibold">
                          MUN Experience
                        </span>
                      </div>
                      <button
                        type="button"
                        onClick={openEditProfileModal}
                        className="text-[10px] font-mono text-zinc-400 hover:text-white cursor-pointer"
                      >
                        Edit
                      </button>
                    </div>
                    <p className="text-xs text-zinc-300 leading-relaxed font-sans line-clamp-3">
                      {delegateRecord.experience || "First Timer / N/A"}
                    </p>
                  </div>
                </div>

                {/* Payment Verification Box */}
                <div
                  className={`p-4 rounded-xl border flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${isPaymentFailed
                    ? "bg-red-950/20 border-red-500/40"
                    : "bg-[#090909] border-white/10"
                    }`}
                >
                  <div className="space-y-1.5">
                    <span className="text-[10px] font-mono uppercase tracking-wider text-white/40 font-semibold block">
                      Payment Status
                    </span>
                    <div className="flex items-center gap-2">
                      {isPaymentFailed ? (
                        <>
                          <X className="w-4 h-4 text-red-400 shrink-0" />
                          <span className="text-xs sm:text-sm font-bold text-red-400 font-mono">
                            Payment Failed — Verification Unsuccessful
                          </span>
                        </>
                      ) : isPaid ? (
                        <>
                          <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
                          <span className="text-xs sm:text-sm font-bold text-emerald-300 font-mono">Payment Verified</span>
                        </>
                      ) : (
                        <>
                          <Clock className="w-4 h-4 text-amber-400 animate-pulse shrink-0" />
                          <span className="text-xs sm:text-sm font-bold text-amber-300 font-mono">Verification in Progress</span>
                        </>
                      )}
                    </div>
                    {isPaymentFailed && (
                      <p className="text-xs text-zinc-300 leading-relaxed pt-0.5">
                        We could not verify your submitted UPI transaction. Your Digital Gate Pass is temporarily on hold. Contact the Secretariat on WhatsApp or email with your valid 12-digit UTR &amp; payment screenshot to re-verify.
                      </p>
                    )}
                    {delegateRecord.paymentUTR && (
                      <p className="text-xs text-white/40 font-mono">
                        UTR: <span className="text-white/70">{delegateRecord.paymentUTR}</span>
                      </p>
                    )}
                  </div>

                  {isPaymentFailed ? (
                    <div className="flex flex-wrap items-center gap-2 shrink-0">
                      <a
                        href={`https://wa.me/919212107797?text=${encodeURIComponent(
                          `Hi Resolve MUN Secretariat, my payment (${delegateRecord.delegateId || delegateRecord.email}) was marked failed. Sharing my valid UPI screenshot & UTR.`
                        )}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center justify-center h-9 px-3.5 rounded-lg bg-white text-black text-xs font-bold uppercase tracking-wider whitespace-nowrap"
                      >
                        WhatsApp Support
                      </a>
                      <a
                        href="mailto:resolve.mun@gmail.com?subject=Resolve%20MUN%202.0%20Payment%20Verification%20Issue"
                        className="inline-flex items-center justify-center h-9 px-3.5 rounded-lg border border-white/20 bg-black text-white text-xs font-semibold whitespace-nowrap"
                      >
                        Email
                      </a>
                    </div>
                  ) : isPaid ? (
                    <span className="text-xs font-mono font-semibold uppercase tracking-wider text-emerald-400 self-start sm:self-auto">
                      Seat Confirmed
                    </span>
                  ) : null}
                </div>
              </section>
              )}

              {/* RES POINTS & REFERRALS (Referrals Tab) */}
              {activeTab === "referrals" && (() => {
                const refCode =
                  delegateRecord.referralCode ||
                  getDelegateReferralCode(delegateRecord.delegateId || delegateRecord.regId, delegateRecord.email || user?.email);
                const couponCode =
                  delegateRecord.couponCode ||
                  getStallCouponCode(delegateRecord.delegateId || delegateRecord.regId, delegateRecord.email || user?.email);
                const stats = delegateRecord.referralStats || {
                  code: refCode,
                  couponCode,
                  ...calculateResStats([]),
                };
                const origin = typeof window !== "undefined" ? window.location.origin : "https://resolvemun.in";
                const shareUrl = `${origin}/?open=delegate&ref=${encodeURIComponent(refCode)}`;
                const whatsappText = encodeURIComponent(
                  `Join me at Resolve MUN 2.0 (26–27 Dec 2026 at Northfield International School, Hyderabad)! Register with my referral link: ${shareUrl} (Code: ${refCode})`
                );

                return (
                  <section className="rounded-md border border-[#262626] bg-black p-5 space-y-4">
                    {/* Minimal Header */}
                    <div>
                      <span className="block text-[10px] uppercase tracking-widest text-zinc-500 font-medium">
                        Referrals
                      </span>
                      <h3 className="m-0 text-base font-semibold text-white mt-0.5 tracking-tight">
                        Invite Friends
                      </h3>
                      <p className="m-0 text-xs text-zinc-400 mt-1">
                        {RES_POINTS_PER_REFERRAL} RES points (₹{RUPEES_PER_REFERRAL} stall credit) per verified referral.
                      </p>
                    </div>

                    {/* Clean 3-Stat Hairline Row */}
                    <div className="grid grid-cols-3 gap-px bg-[#1f1f1f] border border-[#1f1f1f] rounded-md overflow-hidden">
                      <div className="bg-black p-3">
                        <span className="block text-[10px] text-zinc-500 font-medium">
                          RES Points
                        </span>
                        <span className="block text-lg font-semibold text-white mt-0.5">
                          {stats.activePoints.toLocaleString("en-IN")}
                        </span>
                      </div>
                      <div className="bg-black p-3">
                        <span className="block text-[10px] text-zinc-500 font-medium">
                          Stall Credit
                        </span>
                        <span className="block text-lg font-semibold text-white mt-0.5">
                          ₹{stats.rupeeValue.toLocaleString("en-IN")}
                        </span>
                      </div>
                      <div className="bg-black p-3">
                        <span className="block text-[10px] text-zinc-500 font-medium">
                          Coupon
                        </span>
                        <span className="block text-sm font-semibold text-white mt-1 truncate">
                          {couponCode}
                        </span>
                      </div>
                    </div>

                    {/* Single Compact Share Row */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 pt-2 border-t border-[#1f1f1f]">
                      <div className="flex items-center justify-between sm:justify-start gap-2">
                        <span className="text-xs text-zinc-400">Your code:</span>
                        <span className="px-2 py-0.5 rounded border border-[#262626] bg-black text-xs font-semibold text-white">
                          {refCode}
                        </span>
                      </div>

                      <div className="grid grid-cols-2 sm:flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => handleCopyValue(shareUrl, "link")}
                          className="h-9 px-3.5 rounded-md bg-white text-black font-semibold text-xs flex items-center justify-center gap-1.5 cursor-pointer hover:bg-zinc-200 whitespace-nowrap"
                        >
                          {copiedField === "link" ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                          <span>{copiedField === "link" ? "Copied" : "Copy Link"}</span>
                        </button>
                        <a
                          href={`https://wa.me/?text=${whatsappText}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="h-9 px-3.5 rounded-md border border-[#262626] bg-black text-white font-medium text-xs flex items-center justify-center gap-1.5 hover:bg-white/5 whitespace-nowrap"
                        >
                          <Share2 className="w-3.5 h-3.5" />
                          <span>WhatsApp</span>
                        </a>
                      </div>
                    </div>

                    {/* Referred Friends Activity List */}
                    {stats.referrals && stats.referrals.length > 0 && (
                      <div className="pt-3 border-t border-[#1f1f1f] space-y-2">
                        <span className="block text-[10px] uppercase tracking-wider text-zinc-500 font-medium">
                          Referred ({stats.referrals.length})
                        </span>
                        <div className="divide-y divide-[#1f1f1f]">
                          {stats.referrals.map((ref, idx) => (
                            <div key={idx} className="py-2 flex items-center justify-between gap-2 text-xs">
                              <span className="font-medium text-white">{ref.name}</span>
                              <span className={`text-[11px] font-medium ${ref.verified ? "text-white" : "text-zinc-500"}`}>
                                {ref.verified ? `+${RES_POINTS_PER_REFERRAL} RES` : "Pending"}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </section>
                );
              })()}

              {/* DIGITAL ENTRY PASS (Gate Pass Tab) */}
              {activeTab === "pass" && (
              <section id="digital-pass-card" className="rounded-md border border-[#262626] bg-black p-5 sm:p-6">
                <div className="mb-5 border-b border-white/10 pb-4">
                  <p className="text-[10px] uppercase font-mono tracking-wider font-semibold text-white/40">
                    CREDENTIAL
                  </p>
                  <h3 className="text-base sm:text-lg font-bold text-white font-sans mt-0.5">
                    Official Digital Pass
                  </h3>
                  <p className="text-xs text-white/50 mt-1 font-sans">
                    Present this QR pass at the entrance desk at {systemSettings.venueShort || systemSettings.conferenceVenue || "Northfield International School"}.
                  </p>
                </div>

                {isPaid ? (
                  <div className="flex flex-col items-center space-y-5">
                    {/* Desktop Variant Switcher & Print Control */}
                    {!isMobile && (
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
                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={handleDownloadQrImage}
                            className="h-7 px-3 rounded-lg border border-white/15 bg-white text-black hover:bg-zinc-200 text-xs font-mono font-bold flex items-center gap-1.5 transition-all cursor-pointer"
                          >
                            <span>Save QR Pic</span>
                          </button>
                          <button
                            type="button"
                            onClick={handlePrintPass}
                            className="h-7 px-3 rounded-lg border border-white/15 bg-white/[0.03] hover:bg-white/[0.08] text-xs font-mono text-white/70 hover:text-white flex items-center gap-1.5 transition-all cursor-pointer"
                          >
                            <Printer className="w-3.5 h-3.5" />
                            <span>QR PDF</span>
                          </button>
                          <button
                            type="button"
                            onClick={handlePrintReceipt}
                            className="h-7 px-3 rounded-lg border border-white/15 bg-white/[0.03] hover:bg-white/[0.08] text-xs font-mono text-white/70 hover:text-white flex items-center gap-1.5 transition-all cursor-pointer"
                          >
                            <span>E-Receipt</span>
                          </button>
                        </div>
                      </div>
                    )}

                    {/* Mobile Flat Gate Pass (Zero Effects) vs Desktop EngravedTicket */}
                    <div className="w-full flex justify-center py-2" id="printable-pass-container">
                      {isMobile ? (
                        <div className="w-full rounded-xl border border-white bg-black p-5 text-white space-y-4">
                          <div className="flex items-center justify-between border-b border-[#262626] pb-3">
                            <div>
                              <span className="text-[10px] font-mono uppercase tracking-[0.2em] text-[#a3a3a3] block">
                                RESOLVE MUN 2.0
                              </span>
                              <span className="text-lg font-bold tracking-tight text-white block mt-0.5">
                                {delegateRecord.fullName || user.displayName}
                              </span>
                            </div>
                            <span className="px-2.5 py-1 rounded bg-white text-black font-mono text-[10px] font-bold uppercase">
                              {(delegateRecord.roleType || "DELEGATE").toUpperCase()}
                            </span>
                          </div>

                          <div className="flex justify-center py-2">
                            <div className="p-3 bg-white rounded-lg">
                              <img
                                src={`https://quickchart.io/qr?size=240&text=${encodeURIComponent(
                                  "RESOLVE_PASS:" +
                                  (delegateRecord.roleType || "DELEGATE") +
                                  ":" +
                                  delegateRecord.delegateId +
                                  ":" +
                                  delegateRecord.email
                                )}`}
                                alt="Delegate Gate Pass QR"
                                className="w-44 h-44 object-contain block"
                              />
                            </div>
                          </div>

                          <div className="grid grid-cols-2 gap-3 border-t border-[#262626] pt-3 text-xs">
                            <div>
                              <span className="text-[9px] font-mono uppercase text-[#a3a3a3] block">Delegate ID</span>
                              <span className="font-mono font-bold text-white">{delegateRecord.delegateId || "RM26-CONFIRMED"}</span>
                              <span className="font-mono font-bold text-white">{formattedDelegateId || "RM26-CONFIRMED"}</span>
                            </div>
                            <div>
                              <span className="text-[9px] font-mono uppercase text-[#a3a3a3] block">Committee</span>
                              <span className="font-semibold text-white">{delegateRecord.allocatedCommittee || "Awaiting Allotment"}</span>
                            </div>
                            <div>
                              <span className="text-[9px] font-mono uppercase text-[#a3a3a3] block">Venue</span>
                              <span className="font-medium text-white">{systemSettings.venueShort || "Northfield International School"}</span>
                            </div>
                            <div>
                              <span className="text-[9px] font-mono uppercase text-[#a3a3a3] block">Dates</span>
                              <span className="font-medium text-white">{systemSettings.conferenceDates || "26, 27 Dec 2026"}</span>
                            </div>
                          </div>

                          <button
                            type="button"
                            onClick={handlePrintPass}
                            className="w-full min-h-[44px] rounded-lg bg-white text-black font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 cursor-pointer no-print"
                          >
                            <Printer className="w-4 h-4" />
                            <span>Print / Save Pass</span>
                          </button>
                          <div className="space-y-2 pt-1 no-print">
                            <div className="grid grid-cols-2 gap-2">
                              <button
                                type="button"
                                onClick={handleDownloadQrImage}
                                className="h-11 rounded-md bg-white text-black font-bold text-[11px] uppercase tracking-wider flex items-center justify-center gap-1.5 cursor-pointer"
                              >
                                <span>Save QR Pic</span>
                              </button>
                              <button
                                type="button"
                                onClick={handlePrintPass}
                                className="h-11 rounded-md border border-white bg-black text-white font-bold text-[11px] uppercase tracking-wider flex items-center justify-center gap-1.5 cursor-pointer"
                              >
                                <Printer className="w-3.5 h-3.5" />
                                <span>QR Pass PDF</span>
                              </button>
                            </div>
                            <button
                              type="button"
                              onClick={handlePrintReceipt}
                              className="w-full h-10 rounded-md border border-[#333333] bg-black text-[#e5e5e5] font-semibold text-[11px] uppercase tracking-wider flex items-center justify-center gap-1.5 cursor-pointer"
                            >
                              <span>Download E-Receipt (PDF)</span>
                            </button>
                          </div>
                        </div>
                      ) : (
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
                          quote={`“${(systemSettings.conferenceDates || "26, 27 DEC 2026").toUpperCase()}”`}
                          venue={systemSettings.venueShort || systemSettings.conferenceVenue || "Northfield International School"}
                          dates={systemSettings.conferenceDates || "26, 27 December 2026"}
                          body={`Official delegate admission credential for Resolve MUN 2026. Convenes at ${systemSettings.conferenceVenue || "Northfield International School, Hyderabad"}. Present this unique scannable pass at the entrance registration desk upon arrival.`}
                          notes={`ADMIT ONE\n${delegateRecord.delegateId}\n${(systemSettings.venueShort || "NORTHFIELD").toUpperCase()}\nACTIVE PASS`}
                          width="100%"
                          className="max-w-2xl"
                        />
                      )}
                    </div>

                    {/* 2-Day Attendance Tracker */}
                    <div className="w-full max-w-2xl rounded-xl border border-white/10 bg-[#090909] p-4 space-y-3 no-print">
                      <div className="flex items-center justify-between text-xs font-mono text-white/50">
                        <span className="uppercase tracking-wider font-semibold text-[10px]">
                          Conference Check-In Tracker
                        </span>
                        <span className="text-white/70">
                          {delegateRecord.delegateId}
                        </span>
                      </div>

                      <div className="grid grid-cols-2 gap-2.5">
                        {[
                          { day: "Day 1", date: "26 Dec 2026", checked: delegateRecord.checkInDay1 },
                          { day: "Day 2", date: "27 Dec 2026", checked: delegateRecord.checkInDay2 },
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
                        <span>{systemSettings.venueShort || systemSettings.conferenceVenue || "Northfield International School"}</span>
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
                )}
            </div>
          )}

          {/* 6. ACCOUNT & PRIVACY (Account Tab) */}
          {activeTab === "account" && (
          <section className="rounded-md border border-[#262626] bg-black overflow-hidden">
            <button
              type="button"
              onClick={() => setShowDangerZone((v) => !v)}
              className="w-full px-5 py-4 flex items-center justify-between gap-3 text-left cursor-pointer hover:bg-white/[0.02] transition-colors"
            >
              <div>
                <p className="text-[10px] font-mono uppercase tracking-wider font-semibold text-zinc-400">
                  ACCOUNT &amp; DATA PRIVACY
                </p>
                <p className="text-xs text-zinc-500 mt-0.5">
                  Manage or permanently remove your account and conference records
                </p>
              </div>
              <span className="text-xs font-mono text-zinc-400 shrink-0">
                {showDangerZone ? "Hide" : "Manage"}
              </span>
            </button>

            {showDangerZone && (
              <div className="px-5 pb-5 pt-4 border-t border-white/10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="space-y-1 max-w-xl">
                  <p className="text-xs font-semibold text-white">
                    Permanently Delete Account &amp; Data
                  </p>
                  <p className="text-xs text-zinc-400 leading-relaxed">
                    Removes your Resolve MUN profile, committee application, Digital Gate Pass, and RES Points across our records. Requires multi-step verification and cannot be undone.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={openDeleteAccountFlow}
                  disabled={isDeletingAccount}
                  className="inline-flex items-center justify-center gap-2 h-9 px-4 rounded-lg border border-red-500/35 bg-red-500/10 hover:bg-red-500/20 text-red-400 hover:text-red-300 text-xs font-semibold transition-all cursor-pointer disabled:opacity-50 shrink-0"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Begin Account Removal</span>
                </button>
              </div>
            )}
          </section>
          )}
            </div>
          </div>

          {/* =========================================================================
                MODAL: 3-STEP HIGH-FRICTION ACCOUNT & DATA DELETION
                ========================================================================= */}
          {deleteModalOpen && (
            <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/90 backdrop-blur-sm overflow-y-auto">
              <div className="relative w-full max-w-md bg-[#080808] border border-white/15 rounded-xl p-5 sm:p-6 space-y-5 my-auto">
                <div className="flex items-start justify-between gap-3 border-b border-white/10 pb-3.5">
                  <div>
                    <span className="text-[10px] font-mono uppercase tracking-widest text-zinc-400">
                      Step {deleteStep} of 3 · Permanent Deletion
                    </span>
                    <h3 className="text-base font-bold text-white mt-0.5">
                      Delete Account &amp; All Data
                    </h3>
                  </div>
                  <button
                    type="button"
                    onClick={() => !isDeletingAccount && setDeleteModalOpen(false)}
                    disabled={isDeletingAccount}
                    className="w-8 h-8 rounded-lg border border-white/15 bg-black flex items-center justify-center text-zinc-400 hover:text-white cursor-pointer"
                    aria-label="Close deletion modal"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>

                {deleteError && (
                  <div className="p-3 rounded-lg border border-red-500/40 bg-red-500/10 text-xs text-red-300">
                    {deleteError}
                  </div>
                )}

                {/* STEP 1: CONSEQUENCE CHECKLIST */}
                {deleteStep === 1 && (
                  <div className="space-y-4">
                    <p className="text-xs text-zinc-300 leading-relaxed">
                      Before continuing, please read and confirm every consequence below. This will permanently erase your details from Resolve MUN 2.0.
                    </p>

                    <div className="space-y-2.5">
                      <label className="flex items-start gap-2.5 p-3 rounded-lg border border-white/10 bg-black cursor-pointer">
                        <input
                          type="checkbox"
                          checked={deleteAck1}
                          onChange={(e) => setDeleteAck1(e.target.checked)}
                          className="mt-0.5 accent-white shrink-0"
                        />
                        <span className="text-xs text-zinc-300 leading-relaxed">
                          I understand my Digital Gate Pass, registration record, and committee allocation will be permanently invalidated.
                        </span>
                      </label>

                      <label className="flex items-start gap-2.5 p-3 rounded-lg border border-white/10 bg-black cursor-pointer">
                        <input
                          type="checkbox"
                          checked={deleteAck2}
                          onChange={(e) => setDeleteAck2(e.target.checked)}
                          className="mt-0.5 accent-white shrink-0"
                        />
                        <span className="text-xs text-zinc-300 leading-relaxed">
                          I understand all my RES Points, referral code, and unredeemed stall coupons will be permanently forfeited.
                        </span>
                      </label>

                      <label className="flex items-start gap-2.5 p-3 rounded-lg border border-white/10 bg-black cursor-pointer">
                        <input
                          type="checkbox"
                          checked={deleteAck3}
                          onChange={(e) => setDeleteAck3(e.target.checked)}
                          className="mt-0.5 accent-white shrink-0"
                        />
                        <span className="text-xs text-zinc-300 leading-relaxed">
                          I understand conference registration fees are strictly non-refundable and this deletion cannot be undone.
                        </span>
                      </label>
                    </div>

                    <div className="flex items-center gap-2.5 pt-2">
                      <button
                        type="button"
                        onClick={() => setDeleteModalOpen(false)}
                        className="flex-1 h-10 rounded-lg border border-white/15 bg-black text-xs font-semibold text-white cursor-pointer"
                      >
                        Keep My Account
                      </button>
                      <button
                        type="button"
                        disabled={!(deleteAck1 && deleteAck2 && deleteAck3)}
                        onClick={() => {
                          setDeleteError("");
                          setDeleteStep(2);
                        }}
                        className="flex-1 h-10 rounded-lg bg-white text-black text-xs font-bold uppercase tracking-wider cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed"
                      >
                        Continue →
                      </button>
                    </div>
                  </div>
                )}

                {/* STEP 2: REASON + EXACT EMAIL VERIFICATION */}
                {deleteStep === 2 && (
                  <div className="space-y-4">
                    <div>
                      <label className="block text-[10px] font-mono uppercase tracking-wider text-zinc-400 mb-1.5">
                        Why are you removing your account? *
                      </label>
                      <select
                        value={deleteReason}
                        onChange={(e) => setDeleteReason(e.target.value)}
                        className="w-full h-10 px-3 rounded-lg border border-white/15 bg-black text-xs text-white focus:outline-none focus:border-white"
                      >
                        <option value="">Select a reason</option>
                        <option value="No longer attending Resolve MUN 2.0">No longer attending Resolve MUN 2.0</option>
                        <option value="Created a duplicate account">Created a duplicate account</option>
                        <option value="Privacy / personal data removal request">Privacy / personal data removal request</option>
                        <option value="Other">Other</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-[10px] font-mono uppercase tracking-wider text-zinc-400 mb-1.5">
                        Type your exact account email to verify identity *
                      </label>
                      <p className="text-[11px] font-mono text-zinc-500 mb-1.5 truncate">
                        Expected: <span className="text-zinc-300">{user?.email}</span>
                      </p>
                      <input
                        type="email"
                        value={deleteEmailInput}
                        onChange={(e) => setDeleteEmailInput(e.target.value)}
                        placeholder="Enter your account email"
                        autoComplete="off"
                        className="w-full h-10 px-3 rounded-lg border border-white/15 bg-black text-xs text-white placeholder:text-zinc-600 focus:outline-none focus:border-white"
                      />
                    </div>

                    <div className="flex items-center gap-2.5 pt-2">
                      <button
                        type="button"
                        onClick={() => setDeleteStep(1)}
                        className="h-10 px-4 rounded-lg border border-white/15 bg-black text-xs font-semibold text-white cursor-pointer"
                      >
                        Back
                      </button>
                      <button
                        type="button"
                        disabled={
                          !deleteReason ||
                          deleteEmailInput.trim().toLowerCase() !== (user?.email || "").trim().toLowerCase()
                        }
                        onClick={() => {
                          setDeleteError("");
                          setDeleteStep(3);
                        }}
                        className="flex-1 h-10 rounded-lg bg-white text-black text-xs font-bold uppercase tracking-wider cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed"
                      >
                        Final Verification →
                      </button>
                    </div>
                  </div>
                )}

                {/* STEP 3: FINAL PHRASE + 5-SECOND SAFETY COOLDOWN */}
                {deleteStep === 3 && (
                  <div className="space-y-4">
                    <div className="p-3 rounded-lg border border-red-500/30 bg-red-950/20 text-xs text-zinc-300 leading-relaxed">
                      Final warning: Once deleted, <strong className="text-white">{user?.email}</strong> and all linked applications will be permanently wiped.
                    </div>

                    <div>
                      <label className="block text-[10px] font-mono uppercase tracking-wider text-zinc-400 mb-1.5">
                        Type <span className="text-white font-bold">DELETE MY ACCOUNT</span> below *
                      </label>
                      <input
                        type="text"
                        value={deletePhraseInput}
                        onChange={(e) => setDeletePhraseInput(e.target.value)}
                        placeholder="DELETE MY ACCOUNT"
                        autoComplete="off"
                        className="w-full h-10 px-3 rounded-lg border border-white/15 bg-black text-xs font-mono text-white placeholder:text-zinc-600 focus:outline-none focus:border-white"
                      />
                    </div>

                    <div className="flex items-center gap-2.5 pt-2">
                      <button
                        type="button"
                        disabled={isDeletingAccount}
                        onClick={() => setDeleteStep(2)}
                        className="h-10 px-4 rounded-lg border border-white/15 bg-black text-xs font-semibold text-white cursor-pointer disabled:opacity-40"
                      >
                        Back
                      </button>
                      <button
                        type="button"
                        onClick={handleConfirmFinalDelete}
                        disabled={
                          isDeletingAccount ||
                          deleteCooldown > 0 ||
                          deletePhraseInput.trim().toUpperCase() !== "DELETE MY ACCOUNT"
                        }
                        className="flex-1 h-10 rounded-lg bg-red-600 hover:bg-red-500 text-white text-xs font-bold uppercase tracking-wider cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed"
                      >
                        {isDeletingAccount
                          ? "Deleting Everything..."
                          : deleteCooldown > 0
                            ? `Wait ${deleteCooldown}s to Confirm`
                            : "Permanently Delete"}
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
          {/* =========================================================================
            MODAL: DELEGATE SELF-EDIT DETAILS (ALL FIELDS MUTABLE)
            ========================================================================= */}
          {isEditingProfile && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/80 backdrop-blur-md animate-fade-in overflow-y-auto">
              <div className="relative w-full max-w-2xl bg-[#0d0d0d] border border-white/20 rounded-2xl p-5 sm:p-7 shadow-2xl space-y-6 my-8 max-h-[90vh] overflow-y-auto">

                {/* Modal Header */}
                <div className="flex items-center justify-between border-b border-white/10 pb-4">
                  <div>
                    <span className="text-[10px] font-mono text-zinc-400 uppercase tracking-wider font-semibold">
                      Delegate Dashboard · Profile Management
                    </span>
                    <h3 className="text-lg font-bold text-white mt-0.5">
                      Edit Registration &amp; Preferences
                    </h3>
                  </div>
                  <button
                    type="button"
                    onClick={() => setIsEditingProfile(false)}
                    className="p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                {editSuccessMsg && (
                  <div className="p-3 rounded-lg bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-xs font-semibold flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                    <span>{editSuccessMsg}</span>
                  </div>
                )}

                {/* Edit Form */}
                <form onSubmit={handleSaveProfile} className="space-y-5 text-left">

                  {/* 1. Personal & Academic */}
                  <div>
                    <h4 className="text-xs font-mono uppercase tracking-wider text-white/50 mb-3 font-semibold">
                      1. Personal &amp; Academic Details
                    </h4>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="text-[11px] font-mono text-zinc-400 block mb-1">Full Name</label>
                        <input
                          type="text"
                          value={editForm.fullName || ""}
                          onChange={(e) => setEditForm({ ...editForm, fullName: e.target.value })}
                          required
                          className="w-full h-9 px-3 rounded-lg border border-white/15 bg-zinc-900 text-xs text-white focus:outline-none focus:border-white/40"
                        />
                      </div>
                      <div>
                        <label className="text-[11px] font-mono text-zinc-400 block mb-1">Contact Phone (WhatsApp)</label>
                        <input
                          type="tel"
                          value={editForm.phone || ""}
                          onChange={(e) => setEditForm({ ...editForm, phone: e.target.value })}
                          required
                          className="w-full h-9 px-3 rounded-lg border border-white/15 bg-zinc-900 text-xs text-white focus:outline-none focus:border-white/40"
                        />
                      </div>
                      <div>
                        <label className="text-[11px] font-mono text-zinc-400 block mb-1">School / College / Institution</label>
                        <input
                          type="text"
                          value={editForm.institution || ""}
                          onChange={(e) => setEditForm({ ...editForm, institution: e.target.value })}
                          required
                          className="w-full h-9 px-3 rounded-lg border border-white/15 bg-zinc-900 text-xs text-white focus:outline-none focus:border-white/40"
                        />
                      </div>
                      <div>
                        <label className="text-[11px] font-mono text-zinc-400 block mb-1">Grade / Class / Year</label>
                        <input
                          type="text"
                          value={editForm.grade || ""}
                          onChange={(e) => setEditForm({ ...editForm, grade: e.target.value })}
                          placeholder="e.g. 10th / 12th / 2nd Year"
                          className="w-full h-9 px-3 rounded-lg border border-white/15 bg-zinc-900 text-xs text-white focus:outline-none focus:border-white/40"
                        />
                      </div>
                    </div>
                  </div>

                  {/* 2. Logistics & Transport */}
                  <div className="pt-2 border-t border-white/10">
                    <h4 className="text-xs font-mono uppercase tracking-wider text-white/50 mb-3 font-semibold">
                      2. Logistics &amp; Transport
                    </h4>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-3">
                      <div>
                        <label className="text-[11px] font-mono text-zinc-400 block mb-1">Date of Birth</label>
                        <input
                          type="text"
                          value={editForm.dob || ""}
                          onChange={(e) => setEditForm({ ...editForm, dob: e.target.value })}
                          placeholder="DD/MM/YYYY"
                          className="w-full h-9 px-3 rounded-lg border border-white/15 bg-zinc-900 text-xs text-white focus:outline-none focus:border-white/40"
                        />
                      </div>
                      <div>
                        <label className="text-[11px] font-mono text-zinc-400 block mb-1">Do You Need Transportation?</label>
                        <select
                          value={editForm.transport || "No"}
                          onChange={(e) => setEditForm({ ...editForm, transport: e.target.value })}
                          className="w-full h-9 px-3 rounded-lg border border-white/15 bg-zinc-900 text-xs text-white focus:outline-none focus:border-white/40"
                        >
                          <option value="No">No — Self Commute</option>
                          <option value="Yes">Yes — Transport Required</option>
                        </select>
                      </div>
                    </div>

                    <div>
                      <label className="text-[11px] font-mono text-zinc-400 block mb-1">
                        Full Residential Address (for route mapping)
                      </label>
                      <textarea
                        value={editForm.address || ""}
                        onChange={(e) => setEditForm({ ...editForm, address: e.target.value })}
                        rows={2}
                        placeholder="Enter your complete house address, area, city, pincode"
                        className="w-full px-3 py-2 rounded-lg border border-white/15 bg-zinc-900 text-xs text-white focus:outline-none focus:border-white/40"
                      />
                    </div>
                  </div>

                  {/* 3. MUN Experience */}
                  <div className="pt-2 border-t border-white/10">
                    <h4 className="text-xs font-mono uppercase tracking-wider text-white/50 mb-3 font-semibold">
                      3. Prior MUN Experience
                    </h4>
                    <textarea
                      value={editForm.experience || ""}
                      onChange={(e) => setEditForm({ ...editForm, experience: e.target.value })}
                      rows={3}
                      placeholder="List past MUNs, committees, awards, or enter 'First Timer / N/A'"
                      className="w-full px-3 py-2 rounded-lg border border-white/15 bg-zinc-900 text-xs text-white focus:outline-none focus:border-white/40"
                    />
                  </div>

                  {/* 4. Committee & Portfolio Preferences */}
                  {(() => {
                    const isPrefsLocked = Boolean(
                      delegateRecord?.preferencesLocked ||
                      Number(delegateRecord?.preferencesUpdatedCount ?? delegateRecord?.preferences_updated_count ?? 0) >= 1
                    );
                    return (
                  <div className="pt-2 border-t border-white/10">
                    <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
                      <h4 className="m-0 text-xs font-mono uppercase tracking-wider text-white/50 font-semibold">
                        4. Committee &amp; Country Preferences
                      </h4>
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase ${
                          isPrefsLocked
                            ? "border border-[#333333] bg-[#141414] text-zinc-400"
                            : "bg-white text-black"
                        }`}
                      >
                        {isPrefsLocked ? "Locked (1/1 Change Used)" : "One-Time Change Only"}
                      </span>
                    </div>

                    <div className="p-3 mb-3 rounded-lg border border-white/15 bg-black text-xs text-zinc-300 leading-relaxed">
                      {isPrefsLocked ? (
                        <span>
                          <strong className="text-white">Preferences Locked:</strong> You have already used your one-time committee preference update. Your committee choices below cannot be modified again.
                        </span>
                      ) : (
                        <span>
                          <strong className="text-white">Important — One-Time Change Limit:</strong> You may modify your committee and country preferences <strong className="text-white">only once</strong>. As soon as you save any change to your choices below, they will be permanently locked.
                        </span>
                      )}
                    </div>

                    <div className={`space-y-3 ${isPrefsLocked ? "opacity-55 pointer-events-none select-none" : ""}`}>

                      {/* Choice 1 */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 bg-[#121212] p-3 rounded-xl border border-white/10">
                        <div>
                          <label className="text-[10px] font-mono text-zinc-400 block mb-1 uppercase font-semibold">
                            Committee Choice 1
                          </label>
                          <select
                            disabled={isPrefsLocked}
                            value={editForm.pref1_committee || ""}
                            onChange={(e) => setEditForm({ ...editForm, pref1_committee: e.target.value })}
                            className="w-full h-8 px-2.5 rounded-lg border border-white/15 bg-zinc-900 text-xs text-white focus:outline-none focus:border-white/40 disabled:cursor-not-allowed"
                          >
                            <option value="">Select Committee 1</option>
                            <option value="UNCSW">UNCSW</option>
                            <option value="UNHRC">UNHRC</option>
                            <option value="DISEC">DISEC</option>
                            <option value="IP">IP (International Press)</option>
                            <option value="Lok Sabha">Lok Sabha</option>
                            <option value="Marvel">Marvel</option>
                          </select>
                        </div>
                        <div>
                          <label className="text-[10px] font-mono text-zinc-400 block mb-1 uppercase font-semibold">
                            Country / Portfolio Preference
                          </label>
                          <input
                            type="text"
                            disabled={isPrefsLocked}
                            value={editForm.pref1_country || ""}
                            onChange={(e) => setEditForm({ ...editForm, pref1_country: e.target.value })}
                            placeholder="e.g. USA / India / Journalist"
                            className="w-full h-8 px-2.5 rounded-lg border border-white/15 bg-zinc-900 text-xs text-white focus:outline-none focus:border-white/40 disabled:cursor-not-allowed"
                          />
                        </div>
                      </div>

                      {/* Choice 2 */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 bg-[#121212] p-3 rounded-xl border border-white/10">
                        <div>
                          <label className="text-[10px] font-mono text-zinc-400 block mb-1 uppercase font-semibold">
                            Committee Choice 2
                          </label>
                          <select
                            disabled={isPrefsLocked}
                            value={editForm.pref2_committee || ""}
                            onChange={(e) => setEditForm({ ...editForm, pref2_committee: e.target.value })}
                            className="w-full h-8 px-2.5 rounded-lg border border-white/15 bg-zinc-900 text-xs text-white focus:outline-none focus:border-white/40 disabled:cursor-not-allowed"
                          >
                            <option value="">Select Committee 2</option>
                            <option value="UNCSW">UNCSW</option>
                            <option value="UNHRC">UNHRC</option>
                            <option value="DISEC">DISEC</option>
                            <option value="IP">IP (International Press)</option>
                            <option value="Lok Sabha">Lok Sabha</option>
                            <option value="Marvel">Marvel</option>
                          </select>
                        </div>
                        <div>
                          <label className="text-[10px] font-mono text-zinc-400 block mb-1 uppercase font-semibold">
                            Country / Portfolio Preference
                          </label>
                          <input
                            type="text"
                            disabled={isPrefsLocked}
                            value={editForm.pref2_country || ""}
                            onChange={(e) => setEditForm({ ...editForm, pref2_country: e.target.value })}
                            placeholder="e.g. France / UK / Photographer"
                            className="w-full h-8 px-2.5 rounded-lg border border-white/15 bg-zinc-900 text-xs text-white focus:outline-none focus:border-white/40 disabled:cursor-not-allowed"
                          />
                        </div>
                      </div>

                      {/* Choice 3 */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 bg-[#121212] p-3 rounded-xl border border-white/10">
                        <div>
                          <label className="text-[10px] font-mono text-zinc-400 block mb-1 uppercase font-semibold">
                            Committee Choice 3
                          </label>
                          <select
                            disabled={isPrefsLocked}
                            value={editForm.pref3_committee || ""}
                            onChange={(e) => setEditForm({ ...editForm, pref3_committee: e.target.value })}
                            className="w-full h-8 px-2.5 rounded-lg border border-white/15 bg-zinc-900 text-xs text-white focus:outline-none focus:border-white/40 disabled:cursor-not-allowed"
                          >
                            <option value="">Select Committee 3</option>
                            <option value="UNCSW">UNCSW</option>
                            <option value="UNHRC">UNHRC</option>
                            <option value="DISEC">DISEC</option>
                            <option value="IP">IP (International Press)</option>
                            <option value="Lok Sabha">Lok Sabha</option>
                            <option value="Marvel">Marvel</option>
                          </select>
                        </div>
                        <div>
                          <label className="text-[10px] font-mono text-zinc-400 block mb-1 uppercase font-semibold">
                            Country / Portfolio Preference
                          </label>
                          <input
                            type="text"
                            disabled={isPrefsLocked}
                            value={editForm.pref3_country || ""}
                            onChange={(e) => setEditForm({ ...editForm, pref3_country: e.target.value })}
                            placeholder="e.g. Germany / Russia"
                            className="w-full h-8 px-2.5 rounded-lg border border-white/15 bg-zinc-900 text-xs text-white focus:outline-none focus:border-white/40 disabled:cursor-not-allowed"
                          />
                        </div>
                      </div>

                    </div>
                  </div>
                    );
                  })()}

                  {/* Form Footer */}
                  <div className="flex items-center justify-end gap-3 pt-4 border-t border-white/10">
                    <button
                      type="button"
                      onClick={() => setIsEditingProfile(false)}
                      disabled={editSaving}
                      className="px-4 py-2 rounded-lg border border-white/15 text-xs text-zinc-400 hover:text-white hover:bg-white/5 transition-colors cursor-pointer"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={editSaving}
                      className="inline-flex items-center gap-1.5 px-5 py-2 rounded-lg bg-white text-black font-bold text-xs hover:bg-zinc-200 transition-colors cursor-pointer disabled:opacity-50"
                    >
                      <Save className="w-4 h-4" />
                      <span>{editSaving ? "Saving Changes..." : "Save All Changes"}</span>
                    </button>
                  </div>

                </form>

              </div>
            </div>
          )}
        </main>

        {/* =========================================================================
            OFFICIAL EMBASSY-GRADE PRINTABLE DELEGATE CREDENTIAL & PASS (PRINT ONLY)
            ========================================================================= */}
        {delegateRecord && (
          <div className="print-only w-full max-w-3xl mx-auto p-8 bg-white text-zinc-950 font-sans border-4 border-zinc-900 rounded-2xl my-4">
            {/* Decorative Diplomatic Top Border */}
            <div className="flex items-center justify-between border-b-2 border-zinc-900 pb-4 mb-5">
              <div className="flex items-center gap-3.5">
                <img
                  src="https://resolvemun.in/images/Logo.svg"
                  alt="Resolve MUN Emblem"
                  className="w-14 h-14 object-contain"
                />
                <div>
                  <h1 className="text-xl font-black uppercase tracking-tight text-zinc-900 font-serif leading-none">
                    RESOLVE MODEL UNITED NATIONS 2.0
                  </h1>
                  <p className="text-[10px] font-mono uppercase tracking-[0.2em] text-zinc-600 mt-1">
                    Official Admission Credential &amp; Security Pass
                  </p>
                  <p className="text-[9px] font-serif italic text-zinc-500 mt-0.5">
                    Resolve · Reform · Reconcile
                  </p>
                </div>
              </div>
              <div className="text-right">
                <div className="inline-block px-3 py-1 bg-zinc-900 text-white text-[10px] font-mono font-bold uppercase rounded tracking-wider">
                  {(delegateRecord.roleType || "DELEGATE").toUpperCase()} PASS
                </div>
                <p className="text-[11px] font-mono font-bold text-zinc-800 mt-1">
                  {delegateRecord.delegateId || delegateRecord.regId || "RM26-CONFIRMED"}
                </p>
              </div>
            </div>

            {/* Delegate Identification Core Card */}
            <div className="border border-zinc-300 rounded-xl p-5 bg-zinc-50 mb-5">
              <div className="flex flex-row justify-between items-start gap-4">
                <div className="space-y-3 flex-1">
                  <div>
                    <span className="text-[9px] font-mono uppercase tracking-widest text-zinc-500 block">
                      Accredited Delegate
                    </span>
                    <h2 className="text-2xl font-black text-zinc-950 tracking-tight font-serif mt-0.5">
                      {delegateRecord.fullName || user.displayName || "Delegate"}
                    </h2>
                    <p className="text-xs font-medium text-zinc-700 mt-0.5">
                      {delegateRecord.institution || "Independent Institution"} · Grade {delegateRecord.grade || "N/A"}
                    </p>
                  </div>

                  <div className="grid grid-cols-2 gap-3 pt-2 border-t border-zinc-200">
                    <div>
                      <span className="text-[9px] font-mono uppercase tracking-widest text-zinc-500 block">
                        Assigned Committee
                      </span>
                      <p className="text-sm font-bold text-zinc-900 font-mono mt-0.5">
                        {delegateRecord.allocatedCommittee || "Awaiting Allotment"}
                      </p>
                    </div>
                    <div>
                      <span className="text-[9px] font-mono uppercase tracking-widest text-zinc-500 block">
                        Country / Portfolio
                      </span>
                      <p className="text-sm font-bold text-zinc-900 mt-0.5">
                        {delegateRecord.allocatedCountry || "General Delegate"}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Security QR Code */}
                <div className="flex flex-col items-center bg-white p-2.5 rounded-lg border border-zinc-300 shrink-0">
                  <img
                    src={`https://quickchart.io/qr?size=180&text=${encodeURIComponent(
                      "RESOLVE_PASS:" +
                      (delegateRecord.roleType || "DELEGATE") +
                      ":" +
                      (delegateRecord.delegateId || delegateRecord.regId) +
                      ":" +
                      (delegateRecord.email || "")
                    )}`}
                    alt="Security Access QR"
                    className="w-28 h-28 object-contain"
                  />
                  <span className="text-[8px] font-mono uppercase tracking-widest text-zinc-500 mt-1">
                    Gate Scan Code
                  </span>
                </div>
              </div>
            </div>

            {/* Conference Logistics & Session Information */}
            <div className="grid grid-cols-3 gap-3 border border-zinc-200 rounded-lg p-3.5 mb-5 text-center font-sans text-xs">
              <div className="border-r border-zinc-200">
                <span className="text-[9px] font-mono uppercase tracking-widest text-zinc-500 block">
                  Conference Dates
                </span>
                <p className="font-bold text-zinc-900 mt-0.5">
                  {systemSettings.conferenceDates || "26, 27 DEC 2026"}
                </p>
              </div>
              <div className="border-r border-zinc-200">
                <span className="text-[9px] font-mono uppercase tracking-widest text-zinc-500 block">
                  Conference Venue
                </span>
                <p className="font-bold text-zinc-900 mt-0.5 truncate px-1">
                  {systemSettings.venueShort || "Northfield International School"}
                </p>
              </div>
              <div>
                <span className="text-[9px] font-mono uppercase tracking-widest text-zinc-500 block">
                  Reporting Protocol
                </span>
                <p className="font-bold text-zinc-900 mt-0.5">
                  08:00 AM IST • Desk 1
                </p>
              </div>
            </div>

            {/* Security Barcode & Status Banner */}
            <div className="flex items-center justify-between border-t border-b border-zinc-200 py-3 mb-5 text-xs">
              <div className="flex items-center gap-2">
                <span className="inline-block w-2.5 h-2.5 rounded-full bg-emerald-600"></span>
                <span className="font-mono text-[11px] font-bold text-zinc-900 uppercase">
                  Status: Verified &amp; Accredited
                </span>
                <span className="text-zinc-400 font-mono text-[10px]">
                  · UTR: {delegateRecord.paymentUTR || "CONFIRMED"}
                </span>
              </div>
              <div className="font-mono text-[10px] text-zinc-500 tracking-widest">
                ADMIT ONE DELEGATE · NON-TRANSFERABLE
              </div>
            </div>

            {/* Mandatory Delegate Instructions */}
            <div className="bg-zinc-100 rounded-lg p-4 mb-4 text-[11px] space-y-1.5 text-zinc-700">
              <p className="font-bold uppercase tracking-wider text-zinc-900 font-mono text-[10px]">
                Official Delegate Instructions &amp; Admission Protocol:
              </p>
              <ol className="list-decimal list-inside space-y-1 text-[10px] leading-relaxed">
                <li>Present this original credential (printed copy or digital PDF) at the registration desk on Day 1 for badge collection.</li>
                <li>Carry a valid government-issued photo ID (Aadhaar / Passport) or current school/college photo ID card for verification.</li>
                <li>Dress Code: Formal Western Business Attire (Blazers/Suits/Ties) or Formal Traditional Indian Attire is mandatory across all committee sessions.</li>
                <li>This pass grants admission solely to the designated committee chamber and all official socials &amp; high tea receptions.</li>
              </ol>
            </div>

            {/* Secretariat Seal & Sign-off Footer */}
            <div className="flex items-center justify-between text-[9px] font-mono text-zinc-500 pt-2 border-t border-zinc-200">
              <div>
                <p className="font-bold text-zinc-800 uppercase">Executive Secretariat Directorate</p>
                <p>Resolve Model United Nations 2.0 • Hyderabad</p>
              </div>
              <div className="text-right">
                <p>Security Hash: RM26-{String(delegateRecord.delegateId || delegateRecord.regId).slice(-6).toUpperCase()}-ACCREDITED</p>
                <p>Official Digital Pass • Validated for Sessions I, II, III</p>
              </div>
            </div>
          </div>
        )}



        <Footer />
      </div>
    );
  }
