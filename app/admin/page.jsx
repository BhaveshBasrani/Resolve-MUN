"use client";

import React, { useState, useEffect, useMemo, useRef } from "react";
import Link from "next/link";
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
  ChevronDown,
  Edit3,
  Trash2,
  Layers,
  QrCode,
  Camera,
  Volume2,
  Plus,
  ZoomIn,
  ZoomOut,
  RotateCw,
  Maximize2,
  FolderPlus,
  FileUp,
  Sparkles,
  MessageSquare,
  Phone,
  UserPlus,
  Link2
} from "lucide-react";

import { cn } from "@/lib/utils";
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
  "bhaveshkumarbasrani@gmail.com",
  "adityabejugam@gmail.com",
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

const COMMITTEES_CONFIG = [
  { id: "DISEC", name: "Disarmament & International Security", totalSeats: 80, type: "Security & Disarmament" },
  { id: "UNHRC", name: "United Nations Human Rights Council", totalSeats: 70, type: "Human Rights & Global Law" },
  { id: "UNSC", name: "United Nations Security Council", totalSeats: 40, type: "Flagship Crisis & Global Security" },
  { id: "LOK SABHA", name: "Lok Sabha (Indian Parliament)", totalSeats: 85, type: "National Parliamentary Crisis" },
  { id: "COMMITTEE X", name: "Committee X (Classified / Specialized)", totalSeats: 45, type: "Specialized Historical / Crisis" },
  { id: "IP", name: "International Press Corps", totalSeats: 30, type: "Journalism & Media Oversight" },
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
  const [userSearchQuery, setUserSearchQuery] = useState("");
  const [userRoleFilter, setUserRoleFilter] = useState("ALL");
  const [committeeFilter, setCommitteeFilter] = useState("ALL");
  const [paymentFilter, setPaymentFilter] = useState("ALL");
  const [leadFilter, setLeadFilter] = useState("ALL");
  const [appTypeFilter, setAppTypeFilter] = useState("ALL");

  // Delegate Mutation Modals State
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [addForm, setAddForm] = useState({
    fullName: "",
    email: "",
    phone: "",
    institution: "",
    grade: "11",
    dob: "",
    allocatedCommittee: "DISEC",
    allocatedCountry: "",
    paymentStatus: "VERIFIED",
    paymentUTR: "OFFLINE-MANUAL",
  });
  const [editingDelegate, setEditingDelegate] = useState(null);
  const [allottingDelegate, setAllottingDelegate] = useState(null);
  const [viewingDraftLead, setViewingDraftLead] = useState(null);
  const [leadsFilter, setLeadsFilter] = useState("ALL");
  const [allotForm, setAllotForm] = useState({
    committee: "DISEC",
    country: "",
    sendEmail: false,
  });

  // Committee Capacities & Dossier Files
  const [committeeCapacities, setCommitteeCapacities] = useState({
    "DISEC": 80,
    "UNHRC": 70,
    "UNSC": 40,
    "LOK SABHA": 85,
    "COMMITTEE X": 45,
    "IP": 30,
  });
  const [committeeDocuments, setCommitteeDocuments] = useState({});
  const [capacitiesSaving, setCapacitiesSaving] = useState(false);
  const [newDossierFile, setNewDossierFile] = useState({ committee: "DISEC", title: "", url: "", type: "pdf" });
  const [newRefCode, setNewRefCode] = useState({ code: "", ambassador: "", finalFee: 2350, active: true });

  // Ultra-Fast Pass Scanner State (2 scans/sec throughput)
  const [scannerActive, setScannerActive] = useState(false);
  const [scannerDay, setScannerDay] = useState("Day 1");
  const [scannerActionType, setScannerActionType] = useState("ENTRY");
  const [scannerInput, setScannerInput] = useState("");
  const [scanResult, setScanResult] = useState(null);
  const [scanHistory, setScanHistory] = useState([]);
  const scannerVideoRef = useRef(null);
  const scannerInputRef = useRef(null);

  // In-Site Payment Screenshot Lightbox & Document Viewer
  const [viewingImage, setViewingImage] = useState(null);
  const [viewingDelegate, setViewingDelegate] = useState(null);
  const [imageZoom, setImageZoom] = useState(1);
  const [imageRotation, setImageRotation] = useState(0);
  const [imageLoadError, setImageLoadError] = useState(false);
  const [lightboxMode, setLightboxMode] = useState("image"); // "image" | "preview"

  // Google Drive URL & Thumbnail Resolvers
  const getDriveFileId = (url) => {
    if (!url) return null;
    const s = String(url).trim();
    const match = s.match(/\/file\/d\/([a-zA-Z0-9_-]+)/) ||
                  s.match(/[?&]id=([a-zA-Z0-9_-]+)/) ||
                  s.match(/\/d\/([a-zA-Z0-9_-]+)/);
    return match ? match[1] : null;
  };

  const getDirectImageUrl = (url) => {
    if (!url) return "";
    const s = String(url).trim();
    if (s.startsWith("data:") || s.startsWith("blob:")) return s;
    const fileId = getDriveFileId(s);
    if (fileId) {
      return `https://drive.google.com/thumbnail?id=${fileId}&sz=w1600`;
    }
    return s;
  };

  const getDrivePreviewUrl = (url) => {
    if (!url) return "";
    const s = String(url).trim();
    const fileId = getDriveFileId(s);
    if (fileId) {
      return `https://drive.google.com/file/d/${fileId}/preview`;
    }
    // Direct PDF URLs (e.g. Supabase storage) render natively without Google Docs Viewer embedding blocks
    if (s.toLowerCase().includes(".pdf")) {
      return s;
    }
    if (s.toLowerCase().includes(".doc") || s.toLowerCase().includes(".docx") || s.toLowerCase().includes(".ppt")) {
      return `https://docs.google.com/viewer?url=${encodeURIComponent(s)}&embedded=true`;
    }
    return s;
  };

  const openScreenshotLightbox = (url, delegate = null) => {
    if (!url) return;
    setViewingImage(url);
    setViewingDelegate(delegate);
    setImageZoom(1);
    setImageRotation(0);
    setImageLoadError(false);
    const isPdf = typeof url === "string" && (url.toLowerCase().endsWith(".pdf") || url.toLowerCase().includes(".pdf"));
    setLightboxMode(isPdf ? "preview" : "image");
  };

  const handleUpdateProofUrl = async (regId, proofUrl) => {
    if (!regId || !proofUrl) return;
    setRegistrations((prev) =>
      prev.map((d) => (d.regId === regId ? { ...d, paymentScreenshotURL: proofUrl } : d))
    );
    notify(`Saved receipt link for ${regId}`);
    try {
      await fetch("/api/admin/", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          adminKey: "abhilashisgoat",
          action: "ADMIN_UPDATE_DELEGATE",
          regId,
          updates: { payment_screenshot_url: proofUrl, PaymentScreenshotURL: proofUrl },
        }),
      });
    } catch (_) {}
  };

  // Team Applicant Full Inspector Modal State
  const [selectedTeamApp, setSelectedTeamApp] = useState(null);

  const handleUpdateApplicantStatus = async (app, newStatus) => {
    if (!app) return;
    const appId = app.appId || app.id;
    const roleType = app.roleType || "OC";

    // Optimistically update locally
    if (roleType === "OC") {
      setOcApplications((prev) =>
        prev.map((a) => (a.appId === appId || a.id === appId ? { ...a, status: newStatus } : a))
      );
    } else if (roleType === "EB") {
      setEbApplications((prev) =>
        prev.map((a) => (a.appId === appId || a.id === appId ? { ...a, status: newStatus } : a))
      );
    } else {
      setSecApplications((prev) =>
        prev.map((a) => (a.appId === appId || a.id === appId ? { ...a, status: newStatus } : a))
      );
    }

    if (selectedTeamApp && (selectedTeamApp.appId === appId || selectedTeamApp.id === appId)) {
      setSelectedTeamApp((prev) => ({ ...prev, status: newStatus }));
    }

    notify(`Application marked as ${newStatus}`);

    try {
      await fetch("/api/admin/", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          adminKey: "abhilashisgoat",
          action: "ADMIN_UPDATE_APPLICANT_STATUS",
          appId,
          roleType,
          email: app.email,
          fullName: app.fullName || app.name,
          position:
            app.position ||
            app.prefCommittee1 ||
            (roleType === "OC" ? "Organizing Committee" : roleType === "EB" ? "Executive Board" : "Secretariat"),
          newStatus,
        }),
      });
      if (newStatus === "Accepted") {
        notify(`Acceptance offer email dispatched to ${app.email}!`);
      }
    } catch (_) {}
  };

  const handleDeleteApplicant = async (app) => {
    if (!app) return;
    const appId = app.appId || app.id;
    const roleType = app.roleType || "OC";
    const name = app.fullName || app.name || "Candidate";
    if (!confirm(`Are you sure you want to permanently delete application "${name}" (${appId})?`)) {
      return;
    }

    if (roleType === "OC") {
      setOcApplications((prev) => prev.filter((a) => a.appId !== appId && a.id !== appId));
    } else if (roleType === "EB") {
      setEbApplications((prev) => prev.filter((a) => a.appId !== appId && a.id !== appId));
    } else if (roleType === "SEC") {
      setSecApplications((prev) => prev.filter((a) => a.appId !== appId && a.id !== appId));
    }
    if (selectedTeamApp && (selectedTeamApp.appId === appId || selectedTeamApp.id === appId)) {
      setSelectedTeamApp(null);
    }
    notify(`Application ${appId} deleted`);

    try {
      await fetch("/api/admin/", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          adminKey: "abhilashisgoat",
          action: "ADMIN_DELETE_APPLICATION",
          appId,
          roleType,
          email: app.email,
        }),
      });
    } catch (_) {}
  };

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
    } catch (_) { }

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

  // Fetch live admin data with 10s SWR bypass support
  const fetchAdminData = async (force = false) => {
    setIsLoading(true);
    try {
      const refreshParam = force ? "&refresh=true" : "";
      const res = await fetch(`/api/admin/?adminKey=abhilashisgoat${refreshParam}`, {
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
            paymentScreenshotURL: d.paymentScreenshotURL || d.payment_screenshot_url || d.screenshotUrl || d.driveUrl || d.DriveURL || d.PaymentScreenshotURL || "",
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
            paymentScreenshotURL: d.paymentScreenshotURL || d.payment_screenshot_url || d.screenshotUrl || d.driveUrl || d.DriveURL || d.PaymentScreenshotURL || "",
            paymentStatus: (d.paymentStatus || "PENDING").toUpperCase(),
            timestamp: d.timestamp || d.created_at || "",
          }));

          const rawUsers = (json.siteUsers || []).filter(
            (u) => u && u.email && typeof u.email === "string" && u.email.trim().includes("@")
          );
          const normalizedUsers = rawUsers.map((u, idx) => ({
            ...u,
            id: u.id || u.uid || `usr_${idx}`,
            name: u.fullName || u.name || (u.email ? u.email.split("@")[0] : "User"),
            fullName: u.fullName || u.name || (u.email ? u.email.split("@")[0] : "User"),
            email: u.email.trim().toLowerCase(),
            role: (u.role || (ADMIN_EMAILS.includes((u.email || "").toLowerCase()) ? "ADMIN" : "DELEGATE")).toUpperCase(),
            avatarUrl: u.avatarUrl || u.avatar || "",
            lastActive: u.lastActive || u.updated_at || u.timestamp || new Date().toISOString(),
          }));

          setRegistrations(normalizedDels);
          setDelegations(normalizedDelegations);
          // Retain all leads with valid contact credentials (email, phone, or name)
          const validLeads = (json.abandonedLeads || []).filter(
            (l) => Boolean((l.email && l.email.includes("@")) || l.phone || l.name || l.fullName)
          );
          setAbandonedLeads(validLeads);
          setOcApplications(json.ocApplicants || []);
          setSecApplications(json.secretariatApplicants || []);
          setEbApplications(json.ebApplicants || []);
          setSiteUsers(normalizedUsers);

          if (json.settings) {
            setSiteSettings((prev) => ({
              ...prev,
              ...json.settings,
            }));
            if (json.settings.committeeCapacities) {
              setCommitteeCapacities(json.settings.committeeCapacities);
            }
            if (json.settings.committeeDocuments) {
              setCommitteeDocuments(json.settings.committeeDocuments);
            }
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
    } catch (_) { }
    sessionStorage.removeItem("resolve_admin_unlocked");
    setIsAdminUnlocked(false);
    setAuthenticatedUser(null);
  };

  // Web Audio Synthesizer Chime for Scanner Feedback
  const playSuccessChime = () => {
    try {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = "sine";
      osc.frequency.setValueAtTime(587.33, ctx.currentTime); // D5
      osc.frequency.exponentialRampToValueAtTime(880, ctx.currentTime + 0.1); // A5
      gain.gain.setValueAtTime(0.3, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.25);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.25);
    } catch (_) {}
  };

  // Delegate Mutation: Allocate Committee & Portfolio (Optimistic)
  const handleUpdateAllocation = async (regId, comm, port) => {
    // 1. Optimistic update
    setRegistrations((prev) =>
      prev.map((d) =>
        d.regId === regId
          ? { ...d, allocatedCommittee: comm, allocatedCountry: port, status: "ALLOTTED" }
          : d
      )
    );
    notify(`Allocated ${comm} · ${port} to ${regId}`);

    try {
      await fetch("/api/admin/", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          adminKey: "abhilashisgoat",
          action: "ADMIN_ALLOT_COMMITTEE",
          regId,
          committee: comm,
          country: port,
        }),
      });
    } catch (err) {
      notify("Failed to sync allocation to cloud", "error");
    }
  };

  // Add Delegate (Optimistic & Zero Lag)
  const handleAddDelegateSubmit = async (e) => {
    e.preventDefault();
    if (!addForm.fullName.trim() || !addForm.email.trim()) {
      notify("Full Name and Email are required", "error");
      return;
    }

    const genId = `RM26-DEL-${Math.floor(1000 + Math.random() * 9000)}`;
    const optimisticDel = {
      ...addForm,
      id: genId,
      _id: genId,
      regId: genId,
      delegateId: genId,
      name: addForm.fullName,
      status: addForm.allocatedCountry ? "ALLOTTED" : "Confirmed",
      paymentVerified: addForm.paymentStatus === "VERIFIED" ? "verified" : "Pending",
      checkInDay1: "Absent",
      checkInDay2: "Absent",
      checkInDay3: "Absent",
      timestamp: new Date().toISOString(),
    };

    // 1. Optimistic prepend to state
    setRegistrations((prev) => [optimisticDel, ...prev]);
    setIsAddModalOpen(false);
    notify(`Delegate ${addForm.fullName} added successfully!`);
    setAddForm({
      fullName: "",
      email: "",
      phone: "",
      institution: "",
      grade: "11",
      dob: "",
      allocatedCommittee: "DISEC",
      allocatedCountry: "",
      paymentStatus: "VERIFIED",
      paymentUTR: "OFFLINE-MANUAL",
    });

    // 2. Background sync
    try {
      const res = await fetch("/api/admin/", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "ADMIN_ADD_DELEGATE",
          adminKey: "abhilashisgoat",
          regId: genId,
          ...optimisticDel,
        }),
      });
      const data = await res.json();
      if (data.status !== "success") {
        notify(data.message || "Failed to persist delegate to cloud", "error");
      }
    } catch (err) {
      console.warn("Cloud delegate save error:", err);
    }
  };

  // Edit Delegate (Optimistic & Zero Lag)
  const handleEditDelegateSubmit = async (e) => {
    e.preventDefault();
    if (!editingDelegate) return;

    const targetId = editingDelegate.regId || editingDelegate.id;
    const updated = {
      ...editingDelegate,
      paymentVerified: editingDelegate.paymentStatus === "VERIFIED" ? "verified" : "Pending",
      updated_at: new Date().toISOString(),
    };

    // 1. Optimistic in-place update
    setRegistrations((prev) =>
      prev.map((d) => (d.regId === targetId || d.id === targetId ? updated : d))
    );
    notify(`Updated record for ${editingDelegate.fullName}`);
    setEditingDelegate(null);

    // 2. Background sync
    try {
      const res = await fetch("/api/admin/", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "ADMIN_UPDATE_DELEGATE",
          adminKey: "abhilashisgoat",
          regId: targetId,
          id: targetId,
          ...updated,
        }),
      });
      const data = await res.json();
      if (data.status !== "success") {
        notify(data.message || "Cloud update notice", "error");
      }
    } catch (err) {
      console.warn("Cloud update error:", err);
    }
  };

  // Quick Allot Modal Submit
  const handleQuickAllotSubmit = async (e) => {
    e.preventDefault();
    if (!allottingDelegate) return;
    const targetId = allottingDelegate.regId || allottingDelegate.id;

    // 1. Optimistic update
    setRegistrations((prev) =>
      prev.map((d) =>
        d.regId === targetId || d.id === targetId
          ? { ...d, allocatedCommittee: allotForm.committee, allocatedCountry: allotForm.country, status: "ALLOTTED" }
          : d
      )
    );
    notify(`Allotted ${allotForm.country || "Delegate"} in ${allotForm.committee}`);
    setAllottingDelegate(null);

    // 2. Background sync
    try {
      await fetch("/api/admin/", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "ADMIN_ALLOT_COMMITTEE",
          adminKey: "abhilashisgoat",
          regId: targetId,
          email: allottingDelegate.email,
          committee: allotForm.committee,
          country: allotForm.country,
          sendEmail: allotForm.sendEmail,
        }),
      });
    } catch (_) {}
  };

  // Delete Delegate (Optimistic & Zero Lag)
  const handleDeleteDelegate = async (regId, fullName) => {
    if (!window.confirm(`Are you sure you want to permanently delete ${fullName || regId}?`)) return;

    // 1. Optimistic filter
    setRegistrations((prev) => prev.filter((d) => d.regId !== regId && d.id !== regId));
    notify(`Deleted ${fullName || regId}`);

    // 2. Background sync
    try {
      await fetch("/api/admin/", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "ADMIN_DELETE_RECORD",
          adminKey: "abhilashisgoat",
          recordId: regId,
          sheetName: "Registrations",
        }),
      });
    } catch (_) {}
  };

  // Delete Abandoned Lead (Optimistic & Zero Lag)
  const handleDeleteLead = async (leadId, email, fullName) => {
    if (!window.confirm(`Are you sure you want to delete lead ${fullName || email || leadId}?`)) return;

    // 1. Optimistic filter
    setAbandonedLeads((prev) => prev.filter((l) => (l.id !== leadId && l.leadId !== leadId) && (email ? (l.email || '').toLowerCase() !== email.toLowerCase() : true)));
    notify(`Deleted lead ${fullName || leadId}`);

    // 2. Background sync
    try {
      await fetch("/api/admin/", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "DELETE_LEAD",
          adminKey: "abhilashisgoat",
          leadId,
          email,
        }),
      });
    } catch (_) {}
  };

  // Clear Test Leads & Sample Records
  const handleClearTestLeads = async () => {
    if (!window.confirm("Purge all test leads and draft drop-offs containing test keywords?")) return;

    const testKeywords = ['test', 'example.com', 'asdf', 'qwerty', 'tester', 'placeholder'];
    setAbandonedLeads((prev) => prev.filter((l) => {
      const s = JSON.stringify(l).toLowerCase();
      return !testKeywords.some(k => s.includes(k)) && (l.email || l.phone || l.fullName);
    }));
    notify("Purging test data across Supabase & Google Sheets...");

    try {
      const res = await fetch("/api/admin/", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "CLEAR_TEST_LEADS",
          adminKey: "abhilashisgoat",
        }),
      });
      const data = await res.json();
      notify(data.message || "Test data purged successfully");
      fetchAdminData(true);
    } catch (_) {
      notify("Failed to purge test data", "error");
    }
  };

  // Delegate Mutation: Verify Payment (Optimistic)
  const handleVerifyPayment = async (regId, email, newStatus = "VERIFIED") => {
    // 1. Optimistic update
    setRegistrations((prev) =>
      prev.map((d) =>
        d.regId === regId ? { ...d, paymentStatus: newStatus, paymentVerified: newStatus === "VERIFIED" ? "verified" : "Pending" } : d
      )
    );
    notify(`Payment marked as ${newStatus} for ${regId}`);

    try {
      await fetch("/api/admin/", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          adminKey: "abhilashisgoat",
          action: "ADMIN_VERIFY_PAYMENT",
          regId,
          email,
          paymentStatus: newStatus,
        }),
      });
    } catch (err) {
      notify("Failed to verify payment in cloud", "error");
    }
  };

  // Save Settings
  const handleSaveSettings = async () => {
    setSettingsSaving(true);
    try {
      const res = await fetch("/api/admin/", {
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

  // Save Committee Capacities
  const handleSaveCapacities = async () => {
    setCapacitiesSaving(true);
    try {
      const res = await fetch("/api/admin/", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "UPDATE_COMMITTEE_CAPACITIES",
          adminKey: "abhilashisgoat",
          capacities: committeeCapacities,
        }),
      });
      if (res.ok) {
        notify("Official committee capacities updated live!");
      }
    } catch (_) {
      notify("Failed to save capacities", "error");
    } finally {
      setCapacitiesSaving(false);
    }
  };

  // Upload Committee Resource Dossier
  const handleUploadDossier = async (e) => {
    e.preventDefault();
    if (!newDossierFile.title.trim() || !newDossierFile.url.trim()) {
      notify("Title and URL are required", "error");
      return;
    }
    try {
      const res = await fetch("/api/admin/", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "UPLOAD_COMMITTEE_FILE",
          adminKey: "abhilashisgoat",
          ...newDossierFile,
        }),
      });
      if (res.ok) {
        notify(`Added resource to ${newDossierFile.committee}`);
        setCommitteeDocuments((prev) => {
          const list = prev[newDossierFile.committee] ? [...prev[newDossierFile.committee]] : [];
          list.push({ ...newDossierFile, id: `doc_${Date.now()}` });
          return { ...prev, [newDossierFile.committee]: list };
        });
        setNewDossierFile({ committee: "DISEC", title: "", url: "", type: "pdf" });
      }
    } catch (_) {
      notify("Failed to add resource document", "error");
    }
  };

  // Promote / Demote User Role
  const handleUpdateUserRole = async (email, newRole, id) => {
    setSiteUsers((prev) =>
      prev.map((u) => (u.email === email || u.id === id ? { ...u, role: newRole } : u))
    );
    notify(`Updated role to ${newRole} for ${email}`);
    try {
      await fetch("/api/admin/", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "ADMIN_UPDATE_USER_ROLE",
          adminKey: "abhilashisgoat",
          email,
          role: newRole,
          id,
        }),
      });
    } catch (_) {}
  };

  // Permanently Purge User Account and All Data
  const handleDeleteUser = async (email, id, name) => {
    if (
      !confirm(
        `Are you sure you want to permanently delete user "${name || email}"?\n\nThis will permanently purge their account, delegate applications, committee allocations, and all uploaded files. This action CANNOT be undone.`
      )
    ) {
      return;
    }
    setSiteUsers((prev) => prev.filter((u) => u.email !== email && u.id !== id));
    notify(`Purging user ${email}...`);
    try {
      const res = await fetch("/api/admin/", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "ADMIN_DELETE_USER",
          adminKey: "abhilashisgoat",
          email,
          id,
        }),
      });
      const j = await res.json();
      if (j.status === "success") {
        notify(`User ${email} and all linked records permanently deleted.`);
        fetchAdminData(true);
      } else {
        notify(j.message || "Failed to purge user", "error");
      }
    } catch (_) {
      notify("Network error while purging user", "error");
    }
  };

  // Ultra-Fast QR / Barcode Scanner Check-In (Target: 2 scans/sec)
  const handleExecuteScanCheckIn = async (scannedRaw) => {
    if (!scannedRaw || !scannedRaw.trim()) return;
    const clean = scannedRaw.trim();

    // Parse potential RESOLVE_PASS:DELEGATE:RM26-DEL-1001:email format
    let targetId = clean;
    if (clean.includes("RESOLVE_PASS:")) {
      const parts = clean.split(":");
      targetId = parts[2] || parts[1] || clean;
    } else if (clean.includes(":")) {
      targetId = clean.split(":")[0];
    }

    const matched = registrations.find(
      (r) =>
        r.regId?.toLowerCase() === targetId.toLowerCase() ||
        r.id?.toLowerCase() === targetId.toLowerCase() ||
        r.email?.toLowerCase() === targetId.toLowerCase()
    );

    const nowStr = new Date().toLocaleTimeString();
    playSuccessChime();

    const scanEntry = {
      id: `scan_${Date.now()}`,
      time: nowStr,
      code: targetId,
      delegate: matched || null,
      day: scannerDay,
      action: scannerActionType,
      status: matched ? "VALID" : "UNREGISTERED",
    };

    setScanResult(scanEntry);
    setScanHistory((prev) => [scanEntry, ...prev.slice(0, 19)]);
    setScannerInput("");

    // Optimistically update attendance in state
    if (matched) {
      const dayKey = scannerDay === "Day 2" ? "checkInDay2" : scannerDay === "Day 3" ? "checkInDay3" : "checkInDay1";
      setRegistrations((prev) =>
        prev.map((d) => (d.regId === matched.regId ? { ...d, [dayKey]: "Present" } : d))
      );
    }

    // Async cloud dispatch (non-blocking)
    fetch("/api/admin/", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        action: "RECORD_CHECK_IN",
        adminKey: "abhilashisgoat",
        delegateId: targetId,
        day: scannerDay,
        actionType: scannerActionType,
      }),
    }).catch(() => {});
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
      const res = await fetch("/api/admin/", {
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
    if (!registrations.length) {
      return [
        { week: "W1", opened: 0, completed: 0 },
        { week: "W2", opened: 0, completed: 0 },
        { week: "W3", opened: 0, completed: 0 },
        { week: "W4", opened: 0, completed: 0 },
      ];
    }
    const weeks = ["W1", "W2", "W3", "W4", "W5", "W6", "W7", "W8"];
    const total = registrations.length;
    const verified = registrations.filter((r) => r.paymentStatus === "VERIFIED").length;
    return weeks.map((w, i) => {
      const factor = (i + 1) / weeks.length;
      return {
        week: w,
        opened: Math.round(total * factor),
        completed: Math.round(verified * factor),
      };
    });
  }, [registrations]);

  // Overview Stats (100% Real Live Metrics)
  const liveStats = useMemo(() => {
    const totalCount = registrations.length;
    const verifiedCount = registrations.filter((r) => r.paymentStatus === "VERIFIED").length;
    const pendingCount = registrations.filter((r) => r.paymentStatus !== "VERIFIED").length;
    const rate = totalCount ? Math.round((verifiedCount / totalCount) * 100) : 0;

    return [
      {
        label: "Total Registrations",
        value: String(totalCount),
        hint: `${pendingCount} awaiting approval`,
        icon: FileText,
      },
      {
        label: "Verified Delegates",
        value: String(verifiedCount),
        hint: "Paid & QR Pass Issued",
        icon: ClipboardList,
      },
      {
        label: "School Contingents",
        value: String(delegations.length),
        hint: "Institutional Roster",
        icon: Building2,
      },
      {
        label: "Settlement Rate",
        value: `${rate}%`,
        hint: `${verifiedCount} of ${totalCount} confirmed`,
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

              {/* Conversion Funnel & Committee Capacity Matrix (100% Real Live State) */}
              <div className="grid gap-6 lg:grid-cols-2">
                {/* 1. Delegate Intake & Settlement Funnel */}
                <Card>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div>
                        <CardTitle className="text-sm font-semibold">
                          Intake & Conversion Funnel
                        </CardTitle>
                        <CardDescription className="text-xs text-zinc-400">
                          Live candidate journey from initial form keystroke to venue check-in
                        </CardDescription>
                      </div>
                      <Badge variant="outline" className="text-[10px] font-mono border-white/15">
                        Live Telemetry
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {[
                      {
                        stage: "1. Website Form Drafts Started",
                        count: abandonedLeads.length + registrations.length,
                        pct: 100,
                        desc: "Candidates actively entering data into registration modals",
                        color: "bg-zinc-700",
                      },
                      {
                        stage: "2. Completed Registrations Submitted",
                        count: registrations.length,
                        pct: (abandonedLeads.length + registrations.length) ? Math.round((registrations.length / (abandonedLeads.length + registrations.length)) * 100) : 0,
                        desc: "Full applications received in database",
                        color: "bg-zinc-500",
                      },
                      {
                        stage: "3. Payments Verified & Credentials Issued",
                        count: registrations.filter((r) => r.paymentStatus === "VERIFIED").length,
                        pct: registrations.length ? Math.round((registrations.filter((r) => r.paymentStatus === "VERIFIED").length / registrations.length) * 100) : 0,
                        desc: "Payment UTR verified, scannable QR ticket live",
                        color: "bg-emerald-500",
                      },
                      {
                        stage: "4. Gatekeeper Venue Check-Ins",
                        count: registrations.filter((r) => r.checkInDay1 === "Present" || r.checkInDay2 === "Present" || r.checkInDay3 === "Present").length,
                        pct: registrations.length ? Math.round((registrations.filter((r) => r.checkInDay1 === "Present" || r.checkInDay2 === "Present" || r.checkInDay3 === "Present").length / registrations.length) * 100) : 0,
                        desc: `Scanned at ${siteSettings.venueShort || "Meridian Kompally"} registration desk`,
                        color: "bg-cyan-500",
                      },
                    ].map((step, idx) => (
                      <div key={idx} className="space-y-1.5 p-2.5 rounded-lg border border-white/5 bg-zinc-900/30">
                        <div className="flex items-center justify-between text-xs">
                          <span className="font-semibold text-white">{step.stage}</span>
                          <span className="font-mono font-bold text-zinc-300">
                            {step.count} ({step.pct}%)
                          </span>
                        </div>
                        <Progress value={step.pct} className="h-1.5" />
                        <p className="text-[10px] text-zinc-500 font-sans">{step.desc}</p>
                      </div>
                    ))}
                  </CardContent>
                </Card>

                {/* 2. Official 6 Committees Seat Roster */}
                <Card>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div>
                        <CardTitle className="text-sm font-semibold">
                          Committee Seat Matrix (6 Official Committees)
                        </CardTitle>
                        <CardDescription className="text-xs text-zinc-400">
                          Real-time seat occupancy and capacity thresholds
                        </CardDescription>
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setActiveTab("allocations")}
                        className="h-7 text-[11px] gap-1 border-white/15 cursor-pointer"
                      >
                        <span>Manage Caps</span>
                        <ChevronRight className="h-3 w-3" />
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {COMMITTEES_CONFIG.map((comm) => {
                      const maxCapacity = committeeCapacities[comm.id] ?? comm.totalSeats;
                      const occupied = registrations.filter(
                        (d) => (d.allocatedCommittee || "").toUpperCase() === comm.id
                      ).length;
                      const pct = Math.min(100, Math.round((occupied / maxCapacity) * 100));

                      return (
                        <div key={comm.id} className="p-2.5 rounded-lg border border-white/5 bg-zinc-900/30 space-y-1.5">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <Badge variant="outline" className="text-[10px] font-mono border-white/20 text-white font-bold">
                                {comm.id}
                              </Badge>
                              <span className="text-xs text-zinc-200 font-medium truncate max-w-[180px]">
                                {comm.name}
                              </span>
                            </div>
                            <span className="text-[11px] font-mono text-zinc-400">
                              {occupied} / {maxCapacity} ({pct}%)
                            </span>
                          </div>
                          <Progress value={pct} className="h-1.5" />
                        </div>
                      );
                    })}
                  </CardContent>
                </Card>

                {/* DIRECT REGISTRATION & APPLICATION OUTREACH LINKS */}
                <Card className="col-span-full border border-purple-500/20 bg-gradient-to-r from-purple-950/20 via-zinc-950 to-blue-950/20">
                  <CardHeader className="pb-3">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                      <div>
                        <CardTitle className="text-sm font-semibold flex items-center gap-2 text-white">
                          <Link2 className="size-4 text-purple-400" />
                          Direct Registration & Application Links
                        </CardTitle>
                        <CardDescription className="text-xs text-zinc-400 mt-0.5">
                          Shareable one-click direct links. Anyone opening these URLs lands directly inside that specific registration pathway.
                        </CardDescription>
                      </div>
                      <Badge variant="outline" className="w-fit text-[10px] font-mono border-purple-500/30 text-purple-300">
                        Universal Direct Gateways Active
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                      {[
                        {
                          title: "Individual Delegate",
                          badge: "Delegate",
                          path: "/register/delegate",
                          badgeColor: "bg-purple-500/15 text-purple-300 border-purple-500/30",
                          desc: "Direct individual registration modal with committee preferences & study guides",
                          whatsappText: `Hi! Register as an official Delegate for Resolve MUN 2.0 (${siteSettings.conferenceDates || "27th-29th Nov 2026"} at ${siteSettings.venueShort || "Meridian School, Hyderabad"}) here: https://resolvemun.in/register/delegate`,
                        },
                        {
                          title: "School / Delegation",
                          badge: "Contingent",
                          path: "/register/delegation",
                          badgeColor: "bg-blue-500/15 text-blue-300 border-blue-500/30",
                          desc: "Institutional delegation roster registration (min 6 delegates, institutional perks)",
                          whatsappText: "Register your school / institutional contingent for Resolve MUN 2.0 with institutional perks here: https://resolvemun.in/register/delegation",
                        },
                        {
                          title: "Organizing Committee",
                          badge: "OC Role",
                          path: "/register/oc",
                          badgeColor: "bg-cyan-500/15 text-cyan-300 border-cyan-500/30",
                          desc: "Direct application for logistics, hospitality, PR, and delegate affairs",
                          whatsappText: "Apply for the Organizing Committee (OC) at Resolve MUN 2.0 here: https://resolvemun.in/register/oc",
                        },
                        {
                          title: "Secretariat High Command",
                          badge: "Leadership",
                          path: "/register/secretariat",
                          badgeColor: "bg-emerald-500/15 text-emerald-300 border-emerald-500/30",
                          desc: "Application for conference leadership & procedural directorship",
                          whatsappText: "Apply for Secretariat High Command at Resolve MUN 2.0 here: https://resolvemun.in/register/secretariat",
                        },
                        {
                          title: "Socials Night Pass",
                          badge: "Socials Pass",
                          path: "/register/socials",
                          badgeColor: "bg-amber-500/15 text-amber-300 border-amber-500/30",
                          desc: "Direct pass ticket for music, networking & socials night banquet",
                          whatsappText: "Grab your official Resolve MUN 2026 Socials Night entry pass here: https://resolvemun.in/register/socials",
                        },
                        {
                          title: "Universal Pathway Chooser",
                          badge: "All Tracks",
                          path: "/register",
                          badgeColor: "bg-zinc-500/15 text-zinc-300 border-zinc-500/30",
                          desc: "Main pathway selection screen letting applicants browse and pick any track",
                          whatsappText: "Choose your registration pathway for Resolve MUN 2.0: https://resolvemun.in/register",
                        },
                      ].map((linkItem) => {
                        const fullUrl = `https://resolvemun.in${linkItem.path}`;
                        return (
                          <div
                            key={linkItem.path}
                            className="p-3 rounded-xl border border-white/10 bg-zinc-900/60 hover:border-white/20 transition-all flex flex-col justify-between space-y-2.5"
                          >
                            <div>
                              <div className="flex items-center justify-between gap-1.5 mb-1">
                                <span className="text-xs font-semibold text-white tracking-wide">
                                  {linkItem.title}
                                </span>
                                <Badge variant="outline" className={`text-[9px] font-mono px-1.5 py-0 border ${linkItem.badgeColor}`}>
                                  {linkItem.badge}
                                </Badge>
                              </div>
                              <p className="text-[11px] text-zinc-400 leading-snug line-clamp-2">
                                {linkItem.desc}
                              </p>
                            </div>
                            <div className="space-y-1.5 pt-1 border-t border-white/5">
                              <div className="text-[10px] font-mono text-zinc-300 truncate bg-black/50 px-2 py-1 rounded border border-white/5 select-all">
                                {fullUrl}
                              </div>
                              <div className="flex items-center gap-1.5">
                                <Button
                                  type="button"
                                  size="sm"
                                  variant="outline"
                                  className="h-7 flex-1 text-[11px] border-white/10 bg-zinc-950 hover:bg-zinc-800 text-zinc-200 cursor-pointer"
                                  onClick={() => {
                                    navigator.clipboard.writeText(fullUrl);
                                    if (typeof window !== "undefined" && window.showCustomAlert) {
                                      window.showCustomAlert(`Copied ${linkItem.title} link!`, "success");
                                    } else {
                                      alert(`Copied: ${fullUrl}`);
                                    }
                                  }}
                                >
                                  <Copy className="size-3 mr-1" />
                                  Copy Link
                                </Button>
                                <Button
                                  type="button"
                                  size="sm"
                                  variant="outline"
                                  className="h-7 px-2.5 text-[11px] border-emerald-500/20 bg-emerald-950/30 hover:bg-emerald-900/40 text-emerald-300 cursor-pointer"
                                  onClick={() => {
                                    window.open(`https://wa.me/?text=${encodeURIComponent(linkItem.whatsappText)}`, "_blank");
                                  }}
                                  title="Share on WhatsApp"
                                >
                                  <ExternalLink className="size-3" />
                                </Button>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
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
                      variant="default"
                      size="sm"
                      onClick={() => setIsAddModalOpen(true)}
                      className="h-8 gap-1.5 text-xs bg-white text-black hover:bg-zinc-200 font-semibold cursor-pointer"
                    >
                      <Plus className="h-3.5 w-3.5" />
                      Add Delegate
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => exportCsv(filteredDelegates, "delegates")}
                      className="h-8 gap-1.5 text-xs border-white/15 cursor-pointer"
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
                              {d.allocatedCommittee ? (
                                <div className="space-y-1">
                                  <Badge variant="outline" className="text-[10px] font-mono border-white/20 text-white bg-white/[0.04]">
                                    {d.allocatedCommittee}
                                  </Badge>
                                  <span className="block text-xs font-semibold text-zinc-200 truncate max-w-[180px]">
                                    {d.allocatedCountry || "General Delegate"}
                                  </span>
                                </div>
                              ) : (
                                <span className="text-[11px] text-zinc-500 italic">Unassigned</span>
                              )}
                            </td>

                            <td className="px-4 py-3 whitespace-nowrap">
                              <div className="flex items-center gap-1.5">
                                <span className="font-mono text-xs text-zinc-300">
                                  {d.paymentUTR || "OFFLINE / MANUAL"}
                                </span>
                                {d.paymentUTR && (
                                  <button
                                    onClick={() => {
                                      navigator.clipboard.writeText(d.paymentUTR);
                                      notify(`Copied UTR: ${d.paymentUTR}`);
                                    }}
                                    title="Copy UTR"
                                    className="text-zinc-500 hover:text-white cursor-pointer"
                                  >
                                    <Copy className="h-3 w-3" />
                                  </button>
                                )}
                              </div>
                              <div className="flex items-center gap-1.5 mt-1">
                                <Badge
                                  variant={d.paymentStatus === "VERIFIED" ? "default" : "secondary"}
                                  className={cn(
                                    "text-[9px] py-0 uppercase font-mono",
                                    d.paymentStatus === "VERIFIED" ? "bg-emerald-500/20 text-emerald-300 border-emerald-500/30" : "bg-amber-500/20 text-amber-300 border-amber-500/30"
                                  )}
                                >
                                  {d.paymentStatus || "PENDING"}
                                </Badge>
                                {d.paymentScreenshotURL ? (
                                  <button
                                    onClick={() => openScreenshotLightbox(d.paymentScreenshotURL, d)}
                                    className="text-[10px] text-cyan-400 hover:text-cyan-300 font-medium underline inline-flex items-center gap-0.5 cursor-pointer ml-1"
                                    title="View Payment Proof"
                                  >
                                    <Eye className="h-3 w-3" />
                                    Proof
                                  </button>
                                ) : (
                                  <button
                                    onClick={() => {
                                      const url = window.prompt(`Paste Payment Screenshot / Drive URL for ${d.name || d.fullName} (${d.regId}):`);
                                      if (url && url.trim()) {
                                        handleUpdateProofUrl(d.regId, url.trim());
                                      }
                                    }}
                                    className="text-[9px] text-zinc-500 hover:text-zinc-300 italic inline-flex items-center gap-0.5 cursor-pointer ml-1"
                                    title="Attach receipt link manually"
                                  >
                                    <Plus className="h-2.5 w-2.5" /> Proof
                                  </button>
                                )}
                              </div>
                            </td>

                            <td className="px-4 py-3 text-right whitespace-nowrap">
                              <div className="flex items-center justify-end gap-1">
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  onClick={() => setEditingDelegate(d)}
                                  className="h-7 w-7 text-zinc-400 hover:text-white hover:bg-white/10 cursor-pointer"
                                  title="Edit Delegate Details"
                                >
                                  <Edit3 className="h-3.5 w-3.5" />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  onClick={() => {
                                    setAllottingDelegate(d);
                                    setAllotForm({
                                      committee: d.allocatedCommittee || "DISEC",
                                      country: d.allocatedCountry || "",
                                      sendEmail: false,
                                    });
                                  }}
                                  className="h-7 w-7 text-zinc-400 hover:text-cyan-400 hover:bg-cyan-950/30 cursor-pointer"
                                  title="Allot Committee & Portfolio"
                                >
                                  <Layers className="h-3.5 w-3.5" />
                                </Button>
                                {d.paymentStatus !== "VERIFIED" && (
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => handleVerifyPayment(d.regId, d.email, "VERIFIED")}
                                    className="h-7 px-2 text-[10px] uppercase font-semibold text-emerald-400 border-emerald-500/30 hover:bg-emerald-950/40 cursor-pointer"
                                  >
                                    Verify
                                  </Button>
                                )}
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  onClick={() => {
                                    setCrmEmailTo(d.email);
                                    setCrmRecipientMode("SINGLE");
                                    setActiveTab("crm");
                                  }}
                                  className="h-7 w-7 text-zinc-400 hover:text-white hover:bg-white/10 cursor-pointer"
                                  title="Send Email"
                                >
                                  <Mail className="h-3.5 w-3.5" />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  onClick={() => handleDeleteDelegate(d.regId, d.fullName)}
                                  className="h-7 w-7 text-zinc-400 hover:text-red-400 hover:bg-red-950/30 cursor-pointer"
                                  title="Delete Delegate"
                                >
                                  <Trash2 className="h-3.5 w-3.5" />
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
                              {d.paymentScreenshotURL ? (
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => openScreenshotLightbox(d.paymentScreenshotURL, d)}
                                  className="h-7 text-xs border-cyan-500/30 text-cyan-300 hover:bg-cyan-950/30 cursor-pointer"
                                >
                                  <Eye className="h-3 w-3 mr-1" />
                                  Proof
                                </Button>
                              ) : (
                                <span className="text-[10px] text-zinc-600 italic">No file</span>
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
              TAB: ABANDONED LEADS & REAL-TIME DRAFT TELEMETRY
              =============================================================== */}
          {activeTab === "leads" && (
            <Card>
              <CardHeader>
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <CardTitle className="text-base font-semibold flex items-center gap-2">
                      <Sparkles className="h-4 w-4 text-cyan-400" />
                      Abandoned Draft Leads &amp; Live Telemetry ({abandonedLeads.length})
                    </CardTitle>
                    <CardDescription className="text-xs text-zinc-400 mt-0.5">
                      Real-time drop-off beacon capturing candidates typing in forms before submission. Click Inspect to view all typed fields.
                    </CardDescription>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleClearTestLeads}
                      className="h-8 gap-1.5 text-xs border-red-500/30 text-red-400 hover:bg-red-950/30 cursor-pointer"
                      title="Purge all test entries and blank leads"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                      Purge Test Leads
                    </Button>
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
                </div>
              </CardHeader>
              <CardContent className="p-0">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead>
                      <tr className="border-y border-white/10 bg-zinc-950 text-zinc-400 font-mono text-[10px] uppercase">
                        <th className="px-4 py-3">Candidate / Form</th>
                        <th className="px-4 py-3">Contact Credentials</th>
                        <th className="px-4 py-3">School &amp; Grade</th>
                        <th className="px-4 py-3">Committee Preferences</th>
                        <th className="px-4 py-3">Progress</th>
                        <th className="px-4 py-3">Timestamp</th>
                        <th className="px-4 py-3 text-right">Recovery Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                      {abandonedLeads.length === 0 ? (
                        <tr>
                          <td colSpan={7} className="py-8 text-center text-zinc-500 text-xs">
                            No active draft leads or drop-offs recorded at this time.
                          </td>
                        </tr>
                      ) : (
                        abandonedLeads.map((l, idx) => (
                          <tr key={l.id || idx} className="hover:bg-zinc-900/40 transition-colors">
                            <td className="px-4 py-3">
                              <span className="font-semibold text-white block">
                                {l.fullName || l.name || "Prospective Candidate"}
                              </span>
                              <Badge variant="outline" className="text-[9px] font-mono mt-0.5 border-white/15 text-zinc-400">
                                {l.formType || "Individual Delegate"}
                              </Badge>
                            </td>
                            <td className="px-4 py-3">
                              {l.email ? (
                                <a
                                  href={`mailto:${l.email}`}
                                  className="font-mono text-zinc-300 hover:text-white hover:underline block"
                                >
                                  {l.email}
                                </a>
                              ) : (
                                <span className="text-zinc-500 font-mono text-[11px] block italic">No email entered</span>
                              )}
                              {l.phone ? (
                                <span className="font-mono text-zinc-400 text-[11px] block mt-0.5">
                                  {l.phone}
                                </span>
                              ) : null}
                            </td>
                            <td className="px-4 py-3">
                              <span className="text-zinc-200 block truncate max-w-[150px]">
                                {l.institution || "Individual"}
                              </span>
                              {l.grade && (
                                <span className="text-[10px] text-zinc-500 font-mono block">
                                  Grade {l.grade}
                                </span>
                              )}
                            </td>
                            <td className="px-4 py-3">
                              <span className="text-zinc-300 font-mono text-[11px] block truncate max-w-[180px]">
                                {l.preferences || "Awaiting Selection"}
                              </span>
                            </td>
                            <td className="px-4 py-3 whitespace-nowrap">
                              <Badge variant="outline" className="text-[10px] font-mono border-white/20 text-zinc-300">
                                {l.lastStep || l.step || "Step 1"}
                              </Badge>
                            </td>
                            <td className="px-4 py-3 text-[11px] font-mono text-zinc-500 whitespace-nowrap">
                              {l.timestamp ? new Date(l.timestamp).toLocaleString([], { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" }) : "Recent"}
                            </td>
                            <td className="px-4 py-3 text-right whitespace-nowrap">
                              <div className="flex items-center justify-end gap-1.5">
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => setViewingDraftLead(l)}
                                  className="h-7 px-2.5 text-xs border-white/15 gap-1 text-zinc-200 hover:text-white cursor-pointer"
                                  title="Inspect all fields filled by candidate"
                                >
                                  <Eye className="h-3.5 w-3.5 text-cyan-400" />
                                  <span>Inspect</span>
                                </Button>

                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => {
                                    setAddForm({
                                      fullName: l.fullName || l.name || "",
                                      email: l.email || "",
                                      phone: l.phone || "",
                                      institution: l.institution || "Individual",
                                      grade: l.grade || "11",
                                      dob: "",
                                      allocatedCommittee: (l.preferences || "DISEC").split(" · ")[0] || "DISEC",
                                      allocatedCountry: "",
                                      paymentStatus: "VERIFIED",
                                      paymentUTR: "PROMOTED-LEAD",
                                    });
                                    setIsAddModalOpen(true);
                                  }}
                                  className="h-7 px-2.5 text-xs border-emerald-500/30 bg-emerald-950/20 hover:bg-emerald-950/40 text-emerald-400 gap-1 cursor-pointer"
                                  title="Convert draft into official delegate"
                                >
                                  <UserPlus className="h-3.5 w-3.5" />
                                  <span>Allot</span>
                                </Button>

                                {l.phone && (
                                  <a
                                    href={`https://wa.me/91${l.phone.replace(/\D/g, "").slice(-10)}?text=${encodeURIComponent(
                                      `Hi ${l.fullName || l.name || "Delegate"}! We noticed you began your Resolve MUN 2.0 registration for ${
                                        l.preferences || "our committees"
                                      }. Would you like assistance securing your portfolio before seats fill up?`
                                    )}`}
                                    target="_blank"
                                    rel="noreferrer"
                                    className="h-7 px-2.5 rounded-lg border border-emerald-500/30 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 text-xs flex items-center gap-1 font-mono transition-colors"
                                    title="Open WhatsApp chat with prefilled message"
                                  >
                                    <MessageSquare className="h-3 w-3" />
                                    <span>WA</span>
                                  </a>
                                )}

                                {l.email && (
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={() => {
                                      setCrmEmailTo(l.email);
                                      setCrmSubject("Complete Your Resolve MUN 2.0 Registration");
                                      setCrmMessageBody(`Dear ${l.fullName || l.name || "Delegate"},\n\nWe noticed you began your delegate registration for Resolve MUN 2.0 but didn't finish submitting your committee preferences.\n\nSlots across DISEC, UNHRC, UNSC, Lok Sabha, Committee X, and IP are moving quickly. You can resume your application directly at https://resolvemun.in/?open=delegate\n\nWarm regards,\nSecretariat, Resolve MUN 2.0`);
                                      setCrmRecipientMode("SINGLE");
                                      setActiveTab("crm");
                                    }}
                                    className="h-7 w-7 text-zinc-400 hover:text-white cursor-pointer"
                                    title="Send CRM Email"
                                  >
                                    <Mail className="h-3.5 w-3.5" />
                                  </Button>
                                )}

                                <Button
                                  variant="ghost"
                                  size="icon"
                                  onClick={() => handleDeleteLead(l.id || l.leadId, l.email, l.fullName || l.name)}
                                  className="h-7 w-7 text-zinc-500 hover:text-red-400 cursor-pointer"
                                  title="Delete Lead"
                                >
                                  <Trash2 className="h-3.5 w-3.5" />
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
                        <th className="px-4 py-3">Applicant &amp; Role</th>
                        <th className="px-4 py-3">Contact</th>
                        <th className="px-4 py-3">Department / Motivation</th>
                        <th className="px-4 py-3">CV / Resume</th>
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
                          <tr
                            key={idx}
                            onClick={() => setSelectedTeamApp(a)}
                            className="hover:bg-zinc-900/60 cursor-pointer transition-colors"
                          >
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
                                {a.whyJoin || a.previousExperience || a.munExperience || a.sop || a.department || "No statement provided"}
                              </p>
                            </td>
                            <td className="px-4 py-3 whitespace-nowrap">
                              {a.cvUrl || a.resumeUrl || a.portfolioUrl ? (
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    openScreenshotLightbox(a.cvUrl || a.resumeUrl || a.portfolioUrl, a);
                                  }}
                                  className="h-7 text-[10px] border-cyan-500/30 text-cyan-300 hover:bg-cyan-950/40 cursor-pointer"
                                >
                                  <FileText className="h-3 w-3 mr-1" />
                                  View CV
                                </Button>
                              ) : (
                                <span className="text-[10px] text-zinc-600 italic font-mono">No CV</span>
                              )}
                            </td>
                            <td className="px-4 py-3">
                              <Badge
                                variant={a.status === "Accepted" ? "default" : "secondary"}
                                className={cn(
                                  "text-[10px] font-mono",
                                  a.status === "Accepted" && "bg-emerald-500/20 text-emerald-300 border-emerald-500/30"
                                )}
                              >
                                {a.status || "Under Review"}
                              </Badge>
                            </td>
                            <td className="px-4 py-3 text-right whitespace-nowrap">
                              <div className="flex items-center justify-end gap-1.5" onClick={(e) => e.stopPropagation()}>
                                <Button
                                  size="sm"
                                  onClick={() => setSelectedTeamApp(a)}
                                  className="h-7 text-xs bg-white text-black hover:bg-zinc-200 font-semibold cursor-pointer"
                                >
                                  <Eye className="h-3 w-3 mr-1" />
                                  Inspect
                                </Button>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => {
                                    setCrmEmailTo(a.email);
                                    setCrmSubject(`Resolve MUN 2.0 — ${a.roleType} Application Status`);
                                    setCrmMessageBody(`Dear ${a.fullName || "Candidate"},\n\nThank you for applying for the Resolve MUN 2.0 ${a.roleType === "OC" ? "Organizing Committee" : a.roleType === "EB" ? "Executive Board" : "Secretariat"}.\n\nWe have reviewed your profile and would like to invite you for a virtual interview with the team.\n\nPlease reply to this email with your availability.\n\nWarm regards,\nResolve MUN 2.0 Secretariat`);
                                    setCrmRecipientMode("SINGLE");
                                    setActiveTab("crm");
                                  }}
                                  className="h-7 text-xs border-white/10 hover:bg-white/10 text-zinc-300 cursor-pointer"
                                >
                                  <Mail className="h-3 w-3" />
                                </Button>
                              </div>
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
                {/* 1. Core Conference Logistics & Identity (Dates, Venue, Prize Pool) */}
                <div className="space-y-3 pb-4 border-b border-white/10">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="text-xs font-semibold text-zinc-200 uppercase tracking-wider flex items-center gap-1.5">
                        <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                        Core Conference Identity &amp; Logistics
                      </h4>
                      <p className="text-[11px] text-zinc-400 mt-0.5">
                        Changes here update live everywhere: hero banner, digital passes, emails, WhatsApp messages, and attendee dashboard.
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 pt-1">
                    <div>
                      <label className="text-[10px] font-mono text-zinc-400 block mb-1 uppercase font-semibold">
                        Conference Dates
                      </label>
                      <input
                        type="text"
                        value={siteSettings.conferenceDates || "27th – 29th November 2026"}
                        onChange={(e) =>
                          setSiteSettings((prev) => ({
                            ...prev,
                            conferenceDates: e.target.value,
                          }))
                        }
                        placeholder="e.g. 27th – 29th November 2026"
                        className="w-full h-9 px-3 rounded-lg border border-white/15 bg-zinc-900 text-xs font-sans text-white focus:outline-none focus:border-white/40"
                      />
                      <span className="text-[10px] text-zinc-500 font-mono mt-1 block">
                        Affects hero, passes, entry tracker &amp; emails
                      </span>
                    </div>

                    <div>
                      <label className="text-[10px] font-mono text-zinc-400 block mb-1 uppercase font-semibold">
                        Official Cash Prize Pool
                      </label>
                      <input
                        type="text"
                        value={siteSettings.prizePool || "₹25,000+"}
                        onChange={(e) =>
                          setSiteSettings((prev) => ({
                            ...prev,
                            prizePool: e.target.value,
                          }))
                        }
                        placeholder="e.g. ₹25,000+ or ₹50,000+"
                        className="w-full h-9 px-3 rounded-lg border border-white/15 bg-zinc-900 text-xs font-sans text-white focus:outline-none focus:border-white/40"
                      />
                      <span className="text-[10px] text-zinc-500 font-mono mt-1 block">
                        Displayed on stats counter &amp; delegation awards
                      </span>
                    </div>

                    <div>
                      <label className="text-[10px] font-mono text-zinc-400 block mb-1 uppercase font-semibold">
                        Full Venue Name (Official Diplomatic)
                      </label>
                      <input
                        type="text"
                        value={siteSettings.conferenceVenue || "Meridian School, Kompally, Hyderabad"}
                        onChange={(e) =>
                          setSiteSettings((prev) => ({
                            ...prev,
                            conferenceVenue: e.target.value,
                          }))
                        }
                        placeholder="e.g. Meridian School, Kompally, Hyderabad"
                        className="w-full h-9 px-3 rounded-lg border border-white/15 bg-zinc-900 text-xs font-sans text-white focus:outline-none focus:border-white/40"
                      />
                      <span className="text-[10px] text-zinc-500 font-mono mt-1 block">
                        Printed on official communications &amp; email confirmations
                      </span>
                    </div>

                    <div>
                      <label className="text-[10px] font-mono text-zinc-400 block mb-1 uppercase font-semibold">
                        Short Venue (For Digital Passes &amp; Tickers)
                      </label>
                      <input
                        type="text"
                        value={siteSettings.venueShort || "Meridian School, Kompally"}
                        onChange={(e) =>
                          setSiteSettings((prev) => ({
                            ...prev,
                            venueShort: e.target.value,
                          }))
                        }
                        placeholder="e.g. Meridian School, Kompally"
                        className="w-full h-9 px-3 rounded-lg border border-white/15 bg-zinc-900 text-xs font-sans text-white focus:outline-none focus:border-white/40"
                      />
                      <span className="text-[10px] text-zinc-500 font-mono mt-1 block">
                        Used on entry pass badges and ticker carousel
                      </span>
                    </div>

                    <div className="sm:col-span-2">
                      <label className="text-[10px] font-mono text-zinc-400 block mb-1 uppercase font-semibold">
                        Full Physical Address &amp; Landmarks
                      </label>
                      <input
                        type="text"
                        value={siteSettings.venueAddress || "Survey No. 108 & 109/B, Satyam Enclave, Behind Cine Planet, Kompally, Hyderabad, Telangana 500014"}
                        onChange={(e) =>
                          setSiteSettings((prev) => ({
                            ...prev,
                            venueAddress: e.target.value,
                          }))
                        }
                        placeholder="Exact street address, survey number, landmarks"
                        className="w-full h-9 px-3 rounded-lg border border-white/15 bg-zinc-900 text-xs font-sans text-white focus:outline-none focus:border-white/40"
                      />
                    </div>

                    <div className="sm:col-span-2">
                      <label className="text-[10px] font-mono text-zinc-400 block mb-1 uppercase font-semibold">
                        Google Maps Embed or Navigation URL
                      </label>
                      <input
                        type="text"
                        value={siteSettings.venueMapUrl || "https://maps.google.com/maps?q=Meridian+School+Kompally+Hyderabad"}
                        onChange={(e) =>
                          setSiteSettings((prev) => ({
                            ...prev,
                            venueMapUrl: e.target.value,
                          }))
                        }
                        placeholder="Google Maps link or search query"
                        className="w-full h-9 px-3 rounded-lg border border-white/15 bg-zinc-900 text-xs font-mono text-white focus:outline-none focus:border-white/40"
                      />
                    </div>
                  </div>
                </div>

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

                {/* Referral Codes & Custom Pricing Manager */}
                <div className="space-y-3 pt-3 border-t border-white/10">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="text-xs font-semibold text-zinc-300 uppercase tracking-wider">
                        Referral Codes &amp; Custom Dynamic Pricing
                      </h4>
                      <p className="text-[11px] text-zinc-400 mt-0.5">
                        Define custom delegate registration fees per ambassador or school delegation. The checkout QR updates automatically.
                      </p>
                    </div>
                  </div>

                  {/* Add New Referral Code Form */}
                  <div className="p-3 rounded-lg border border-white/10 bg-zinc-900/40 space-y-2.5">
                    <span className="text-[10px] font-mono uppercase text-zinc-400 block font-semibold">
                      Add New Referral Code
                    </span>
                    <div className="grid grid-cols-1 sm:grid-cols-4 gap-2">
                      <input
                        type="text"
                        placeholder="CODE (e.g. BHAFN01)"
                        value={newRefCode.code}
                        onChange={(e) => setNewRefCode((prev) => ({ ...prev, code: e.target.value.toUpperCase() }))}
                        className="h-8 px-2.5 rounded-lg border border-white/15 bg-zinc-950 text-xs font-mono text-white placeholder:text-zinc-600 focus:outline-none"
                      />
                      <input
                        type="text"
                        placeholder="Ambassador / Partner"
                        value={newRefCode.ambassador}
                        onChange={(e) => setNewRefCode((prev) => ({ ...prev, ambassador: e.target.value }))}
                        className="h-8 px-2.5 rounded-lg border border-white/15 bg-zinc-950 text-xs text-white placeholder:text-zinc-600 focus:outline-none"
                      />
                      <input
                        type="number"
                        placeholder="Custom Fee (₹)"
                        value={newRefCode.finalFee}
                        onChange={(e) => setNewRefCode((prev) => ({ ...prev, finalFee: Number(e.target.value) }))}
                        className="h-8 px-2.5 rounded-lg border border-white/15 bg-zinc-950 text-xs font-mono text-white placeholder:text-zinc-600 focus:outline-none"
                      />
                      <Button
                        type="button"
                        size="sm"
                        onClick={() => {
                          if (!newRefCode.code.trim()) {
                            notify("Please enter a referral code", "error");
                            return;
                          }
                          const cleanCode = newRefCode.code.trim().toUpperCase();
                          const currentCodes = Array.isArray(siteSettings.referralCodes) ? [...siteSettings.referralCodes] : [];
                          const idx = currentCodes.findIndex((c) => (c.code || "").toUpperCase() === cleanCode);
                          const entry = {
                            code: cleanCode,
                            ambassador: newRefCode.ambassador.trim() || "Ambassador",
                            finalFee: Number(newRefCode.finalFee || 2500),
                            active: true,
                          };
                          if (idx >= 0) {
                            currentCodes[idx] = entry;
                          } else {
                            currentCodes.unshift(entry);
                          }
                          setSiteSettings((prev) => ({ ...prev, referralCodes: currentCodes }));
                          setNewRefCode({ code: "", ambassador: "", finalFee: 2350, active: true });
                          notify(`Added referral code ${cleanCode} (₹${entry.finalFee}). Click "Save Settings" to publish.`);
                        }}
                        className="h-8 bg-white hover:bg-zinc-200 text-black text-xs font-bold uppercase tracking-wider cursor-pointer"
                      >
                        + Add Code
                      </Button>
                    </div>
                  </div>

                  {/* Active Referral Codes Table */}
                  <div className="rounded-lg border border-white/10 overflow-hidden bg-zinc-950">
                    <table className="w-full text-left text-xs">
                      <thead>
                        <tr className="bg-zinc-900 border-b border-white/10 text-zinc-400 font-mono text-[10px] uppercase">
                          <th className="px-3 py-2">Code</th>
                          <th className="px-3 py-2">Ambassador / Partner</th>
                          <th className="px-3 py-2">Fee (INR)</th>
                          <th className="px-3 py-2">Status</th>
                          <th className="px-3 py-2 text-right">Action</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-white/5">
                        {(!siteSettings.referralCodes || siteSettings.referralCodes.length === 0) ? (
                          <tr>
                            <td colSpan={5} className="py-4 text-center text-zinc-500 text-xs">
                              No custom referral codes configured. Default fee applies.
                            </td>
                          </tr>
                        ) : (
                          siteSettings.referralCodes.map((rc, idx) => (
                            <tr key={rc.code || idx} className="hover:bg-zinc-900/30">
                              <td className="px-3 py-2 font-mono font-bold text-white">
                                {rc.code}
                              </td>
                              <td className="px-3 py-2 text-zinc-300">
                                {rc.ambassador || "Ambassador"}
                              </td>
                              <td className="px-3 py-2 font-mono text-emerald-400 font-semibold">
                                ₹{Number(rc.finalFee || 2500).toLocaleString("en-IN")}
                              </td>
                              <td className="px-3 py-2">
                                <button
                                  type="button"
                                  onClick={() => {
                                    const updated = siteSettings.referralCodes.map((c, i) =>
                                      i === idx ? { ...c, active: c.active === false ? true : false } : c
                                    );
                                    setSiteSettings((prev) => ({ ...prev, referralCodes: updated }));
                                  }}
                                  className={cn(
                                    "px-2 py-0.5 rounded text-[10px] font-mono cursor-pointer border transition-colors",
                                    rc.active !== false
                                      ? "bg-emerald-950/30 text-emerald-400 border-emerald-500/30"
                                      : "bg-zinc-800 text-zinc-500 border-white/10"
                                  )}
                                >
                                  {rc.active !== false ? "Active" : "Disabled"}
                                </button>
                              </td>
                              <td className="px-3 py-2 text-right">
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  onClick={() => {
                                    const updated = siteSettings.referralCodes.filter((_, i) => i !== idx);
                                    setSiteSettings((prev) => ({ ...prev, referralCodes: updated }));
                                    notify(`Removed referral code ${rc.code}`);
                                  }}
                                  className="h-6 w-6 text-zinc-500 hover:text-red-400 cursor-pointer"
                                  title="Delete code"
                                >
                                  <Trash2 className="h-3 w-3" />
                                </Button>
                              </td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* ===============================================================
              TAB: ALLOCATIONS MATRIX & SEAT CAPACITIES
              =============================================================== */}
          {activeTab === "allocations" && (
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                      <CardTitle className="text-base font-semibold">
                        Committee Capacities &amp; Allocation Matrix
                      </CardTitle>
                      <CardDescription className="text-xs text-zinc-400 mt-0.5">
                        Configure committee seat caps, monitor delegate counts, and attach background guides
                      </CardDescription>
                    </div>
                    <Button
                      variant="default"
                      size="sm"
                      onClick={handleSaveCapacities}
                      disabled={capacitiesSaving}
                      className="h-8 gap-1.5 text-xs bg-white text-black hover:bg-zinc-200 font-semibold cursor-pointer"
                    >
                      <Check className="h-3.5 w-3.5" />
                      {capacitiesSaving ? "Saving..." : "Save Seat Capacities"}
                    </Button>
                  </div>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* 6 Official Committees Grid */}
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {COMMITTEES_CONFIG.map((comm) => {
                      const maxCapacity = committeeCapacities[comm.id] ?? comm.totalSeats;
                      const occupied = registrations.filter(
                        (d) => (d.allocatedCommittee || "").toUpperCase() === comm.id
                      ).length;
                      const percent = Math.min(100, Math.round((occupied / maxCapacity) * 100));
                      const docs = committeeDocuments[comm.id] || [];

                      return (
                        <div
                          key={comm.id}
                          className="rounded-xl border border-white/10 bg-zinc-900/60 p-4 space-y-3 flex flex-col justify-between"
                        >
                          <div>
                            <div className="flex items-center justify-between">
                              <Badge variant="outline" className="text-xs font-mono border-white/20 text-white font-bold">
                                {comm.id}
                              </Badge>
                              <span className="text-[10px] font-mono text-zinc-400">
                                {occupied} / {maxCapacity} seats ({percent}%)
                              </span>
                            </div>
                            <h3 className="text-sm font-semibold text-white mt-1.5 line-clamp-1">
                              {comm.name}
                            </h3>
                            <p className="text-[11px] text-zinc-400 mt-0.5">{comm.type}</p>
                            <Progress value={percent} className="h-1.5 mt-3" />
                          </div>

                          <div className="space-y-2 pt-2 border-t border-white/10">
                            <div className="flex items-center justify-between text-xs">
                              <span className="text-zinc-400">Total Seat Limit:</span>
                              <input
                                type="number"
                                min={5}
                                max={300}
                                value={maxCapacity}
                                onChange={(e) =>
                                  setCommitteeCapacities((prev) => ({
                                    ...prev,
                                    [comm.id]: parseInt(e.target.value) || 0,
                                  }))
                                }
                                className="w-20 h-7 px-2 rounded border border-white/15 bg-black text-right text-xs font-mono text-white focus:outline-none"
                              />
                            </div>

                            {/* Background Guides & Documents */}
                            <div className="text-[11px] space-y-1">
                              <span className="text-zinc-500 font-mono block">Background Guides &amp; Resources:</span>
                              {docs.length === 0 ? (
                                <span className="text-zinc-600 italic block">No guides attached</span>
                              ) : (
                                docs.map((doc, idx) => (
                                  <a
                                    key={idx}
                                    href={doc.url}
                                    target="_blank"
                                    rel="noreferrer"
                                    className="text-cyan-400 hover:underline flex items-center gap-1 truncate"
                                  >
                                    <FileText className="h-3 w-3 shrink-0" />
                                    <span className="truncate">{doc.title}</span>
                                  </a>
                                ))
                              )}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {/* Add Committee Resource Folder / Link */}
                  <div className="rounded-xl border border-white/10 bg-black/60 p-4 space-y-3">
                    <h4 className="text-xs font-semibold text-white uppercase tracking-wider flex items-center gap-2">
                      <FolderPlus className="h-4 w-4 text-cyan-400" />
                      Attach Background Guide / Study Document to Committee
                    </h4>
                    <form onSubmit={handleUploadDossier} className="grid grid-cols-1 sm:grid-cols-4 gap-3 items-end">
                      <div>
                        <label className="text-[10px] font-mono text-zinc-400 block mb-1">Committee</label>
                        <select
                          value={newDossierFile.committee}
                          onChange={(e) => setNewDossierFile({ ...newDossierFile, committee: e.target.value })}
                          className="w-full h-8 px-2 rounded border border-white/15 bg-zinc-900 text-xs text-white focus:outline-none"
                        >
                          {COMMITTEES.map((c) => (
                            <option key={c} value={c}>{c}</option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <label className="text-[10px] font-mono text-zinc-400 block mb-1">Document Title</label>
                        <input
                          type="text"
                          placeholder="e.g. DISEC Background Guide 2026"
                          value={newDossierFile.title}
                          onChange={(e) => setNewDossierFile({ ...newDossierFile, title: e.target.value })}
                          className="w-full h-8 px-2.5 rounded border border-white/15 bg-zinc-900 text-xs text-white focus:outline-none"
                        />
                      </div>
                      <div>
                        <label className="text-[10px] font-mono text-zinc-400 block mb-1">Google Drive / File URL</label>
                        <input
                          type="url"
                          placeholder="https://drive.google.com/..."
                          value={newDossierFile.url}
                          onChange={(e) => setNewDossierFile({ ...newDossierFile, url: e.target.value })}
                          className="w-full h-8 px-2.5 rounded border border-white/15 bg-zinc-900 text-xs text-white focus:outline-none font-mono"
                        />
                      </div>
                      <Button
                        type="submit"
                        className="h-8 bg-white hover:bg-zinc-200 text-black text-xs font-semibold cursor-pointer"
                      >
                        <FileUp className="h-3.5 w-3.5 mr-1" />
                        Attach Guide / Document
                      </Button>
                    </form>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {/* ===============================================================
              TAB: ULTRA-FAST GATEKEEPER PASS SCANNER (2 SCANS/SEC)
              =============================================================== */}
          {activeTab === "scanner" && (
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                      <CardTitle className="text-base font-semibold flex items-center gap-2">
                        <QrCode className="h-5 w-5 text-emerald-400" />
                        Ultra-Fast Entry Pass Scanner &amp; Gatekeeper
                      </CardTitle>
                      <CardDescription className="text-xs text-zinc-400 mt-0.5">
                        Target throughput: 2 passes/sec with instant Web Audio synthesizer chime and zero-lag check-in
                      </CardDescription>
                    </div>
                    <div className="flex flex-wrap items-center gap-2">
                      <Link
                        href="/scan/"
                        target="_blank"
                        className="h-8 px-3 rounded-lg border border-emerald-500/30 bg-emerald-950/20 hover:bg-emerald-950/40 text-emerald-400 text-xs font-mono flex items-center gap-1.5 cursor-pointer transition-colors"
                      >
                        <Camera className="h-3.5 w-3.5" />
                        <span>Launch Camera Scanner</span>
                        <ExternalLink className="h-3 w-3 ml-0.5 opacity-60" />
                      </Link>

                      <select
                        value={scannerDay}
                        onChange={(e) => setScannerDay(e.target.value)}
                        className="h-8 px-2.5 rounded-lg border border-white/15 bg-zinc-900 text-xs text-white font-mono focus:outline-none"
                      >
                        <option value="Day 1">Day 1 · 27 Nov</option>
                        <option value="Day 2">Day 2 · 28 Nov</option>
                        <option value="Day 3">Day 3 · 29 Nov</option>
                      </select>
                      <select
                        value={scannerActionType}
                        onChange={(e) => setScannerActionType(e.target.value)}
                        className="h-8 px-2.5 rounded-lg border border-white/15 bg-zinc-900 text-xs text-white font-mono focus:outline-none"
                      >
                        <option value="ENTRY">ENTRY (Check-In)</option>
                        <option value="EXIT">EXIT (Check-Out)</option>
                      </select>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Scanner Console Controls */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Left: Instant Barcode / Handheld Scanner Input */}
                    <div className="rounded-xl border border-white/10 bg-zinc-900/60 p-5 space-y-4">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-semibold uppercase tracking-wider text-zinc-300">
                          Handheld / Hardware Scanner
                        </span>
                        <span className="text-[10px] font-mono text-emerald-400 bg-emerald-950/40 border border-emerald-500/30 px-2 py-0.5 rounded">
                          Continuous Mode Active
                        </span>
                      </div>

                      <p className="text-xs text-zinc-400">
                        Scan directly with any USB/Bluetooth 2D barcode gun, or paste / type Registration ID below. Auto-submits on Enter.
                      </p>

                      <form
                        onSubmit={(e) => {
                          e.preventDefault();
                          handleExecuteScanCheckIn(scannerInput);
                        }}
                        className="space-y-3"
                      >
                        <input
                          ref={scannerInputRef}
                          type="text"
                          placeholder="Point barcode scanner here or enter RM26-DEL-1001..."
                          value={scannerInput}
                          onChange={(e) => setScannerInput(e.target.value)}
                          autoFocus
                          className="w-full h-12 px-4 rounded-xl border border-emerald-500/40 bg-black text-sm text-white font-mono placeholder-zinc-600 focus:outline-none focus:border-emerald-400 transition-colors shadow-inner"
                        />
                        <div className="flex items-center gap-2">
                          <Button
                            type="submit"
                            className="flex-1 h-9 bg-emerald-500 hover:bg-emerald-400 text-black font-bold text-xs uppercase tracking-wider cursor-pointer"
                          >
                            <CheckCircle2 className="h-4 w-4 mr-1.5" />
                            Confirm Check-In
                          </Button>
                          <Button
                            type="button"
                            variant="outline"
                            onClick={() => playSuccessChime()}
                            className="h-9 px-3 text-xs border-white/15 text-zinc-300 cursor-pointer"
                            title="Test Chime Audio"
                          >
                            <Volume2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </form>
                    </div>

                    {/* Right: Live Feedback Display */}
                    <div className="rounded-xl border border-white/10 bg-zinc-900/60 p-5 flex flex-col justify-between">
                      <span className="text-xs font-semibold uppercase tracking-wider text-zinc-300">
                        Immediate Gatekeeper Verification
                      </span>

                      {scanResult ? (
                        <div className="my-auto py-3 space-y-2 text-center animate-in fade-in zoom-in-95 duration-150">
                          <div
                            className={cn(
                              "inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-mono font-bold uppercase",
                              scanResult.status === "VALID"
                                ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/40"
                                : "bg-red-500/20 text-red-300 border border-red-500/40"
                            )}
                          >
                            {scanResult.status === "VALID" ? <Check className="h-3.5 w-3.5" /> : <X className="h-3.5 w-3.5" />}
                            {scanResult.status === "VALID" ? "ADMISSION AUTHORIZED" : "UNRECOGNIZED PASS"}
                          </div>

                          <h3 className="text-xl font-bold text-white">
                            {scanResult.delegate?.fullName || scanResult.code}
                          </h3>

                          {scanResult.delegate && (
                            <div className="space-y-1 text-xs text-zinc-300 font-mono">
                              <p>
                                <strong className="text-white">{scanResult.delegate.allocatedCommittee || "DISEC"}</strong> ·{" "}
                                {scanResult.delegate.allocatedCountry || "Delegate"}
                              </p>
                              <p className="text-zinc-500">{scanResult.delegate.institution || "Individual"}</p>
                              <Badge variant="outline" className="text-[10px] border-emerald-500/30 text-emerald-400">
                                {scanResult.day} · {scanResult.action} RECORDED AT {scanResult.time}
                              </Badge>
                            </div>
                          )}
                        </div>
                      ) : (
                        <div className="my-auto py-8 text-center text-zinc-500 text-xs font-mono">
                          Awaiting first entry scan...
                        </div>
                      )}

                      <div className="text-[10px] font-mono text-zinc-500 text-right">
                        Session Check-ins: {scanHistory.length}
                      </div>
                    </div>
                  </div>

                  {/* Scan Log History Table */}
                  <div className="space-y-3">
                    <h4 className="text-xs font-semibold text-zinc-300 uppercase tracking-wider">
                      Recent Entry Audits ({scanHistory.length})
                    </h4>
                    <div className="rounded-xl border border-white/10 overflow-hidden">
                      <table className="w-full text-left text-xs border-collapse">
                        <thead>
                          <tr className="border-b border-white/10 bg-black text-zinc-400 font-mono text-[10px] uppercase">
                            <th className="px-4 py-2.5">Time</th>
                            <th className="px-4 py-2.5">ID / Code</th>
                            <th className="px-4 py-2.5">Delegate Name</th>
                            <th className="px-4 py-2.5">Committee &amp; Country</th>
                            <th className="px-4 py-2.5 text-right">Gate Status</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5 font-mono">
                          {scanHistory.length === 0 ? (
                            <tr>
                              <td colSpan={5} className="py-6 text-center text-zinc-600 text-xs">
                                No scan history recorded in this session.
                              </td>
                            </tr>
                          ) : (
                            scanHistory.map((s) => (
                              <tr key={s.id} className="hover:bg-zinc-900/40">
                                <td className="px-4 py-2 text-zinc-400 text-[11px]">{s.time}</td>
                                <td className="px-4 py-2 text-white font-semibold">{s.code}</td>
                                <td className="px-4 py-2 font-sans font-medium text-zinc-200">
                                  {s.delegate?.fullName || "Walk-In"}
                                </td>
                                <td className="px-4 py-2 text-zinc-400 text-[11px]">
                                  {s.delegate?.allocatedCommittee || "—"} / {s.delegate?.allocatedCountry || "—"}
                                </td>
                                <td className="px-4 py-2 text-right">
                                  <Badge
                                    variant="outline"
                                    className={cn(
                                      "text-[9px] py-0",
                                      s.status === "VALID" ? "border-emerald-500/40 text-emerald-400" : "border-red-500/40 text-red-400"
                                    )}
                                  >
                                    {s.status}
                                  </Badge>
                                </td>
                              </tr>
                            ))
                          )}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {/* ===============================================================
              TAB: USERS (SITE ACCOUNTS & ROLES)
              =============================================================== */}
          {activeTab === "users" && (() => {
            const validUsers = siteUsers
              .filter((u) => {
                if (!u) return false;
                const email = (u.email || "").trim().toLowerCase();
                return email.includes("@") && !email.startsWith("@");
              })
              .filter((u) => {
                if (!userSearchQuery) return true;
                const q = userSearchQuery.toLowerCase();
                return (
                  (u.fullName || "").toLowerCase().includes(q) ||
                  (u.name || "").toLowerCase().includes(q) ||
                  (u.email || "").toLowerCase().includes(q) ||
                  (u.phone || "").toLowerCase().includes(q)
                );
              })
              .filter((u) => {
                if (userRoleFilter === "ALL") return true;
                const isAdmin = (u.role || "").toUpperCase() === "ADMIN";
                const linkedDel = registrations.find((r) => r.email?.toLowerCase() === u.email?.toLowerCase());
                if (userRoleFilter === "ADMINS") return isAdmin;
                if (userRoleFilter === "REGISTERED") return Boolean(linkedDel);
                if (userRoleFilter === "UNREGISTERED") return !linkedDel && !isAdmin;
                return true;
              });

            return (
              <Card>
                <CardHeader>
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                      <CardTitle className="text-base font-semibold">
                        Site User Accounts &amp; Access Roles ({validUsers.length})
                      </CardTitle>
                      <CardDescription className="text-xs text-zinc-400 mt-0.5">
                        Verified accounts authenticated via Google Auth with real-time role elevation &amp; pass linkage
                      </CardDescription>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => fetchAdminData(true)}
                        className="h-8 gap-1.5 text-xs border-white/15 cursor-pointer"
                      >
                        <RefreshCw className={cn("h-3.5 w-3.5", isLoading && "animate-spin")} />
                        Refresh Accounts
                      </Button>
                    </div>
                  </div>

                  {/* Search & Filter Bar */}
                  <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 pt-3">
                    <div className="relative flex-1 max-w-sm">
                      <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-zinc-500" />
                      <input
                        type="text"
                        placeholder="Search users by name, email, or phone..."
                        value={userSearchQuery}
                        onChange={(e) => setUserSearchQuery(e.target.value)}
                        className="h-8 pl-8 pr-3 w-full bg-zinc-900 border border-white/10 rounded-md text-xs text-white placeholder:text-zinc-500 focus:outline-none focus:border-white/30"
                      />
                    </div>
                    <div className="flex items-center gap-1.5 overflow-x-auto">
                      {[
                        { key: "ALL", label: `All (${siteUsers.filter(u => u?.email?.includes("@")).length})` },
                        { key: "REGISTERED", label: "Registered" },
                        { key: "UNREGISTERED", label: "Browsing Only" },
                        { key: "ADMINS", label: "Admins" },
                      ].map((tab) => (
                        <button
                          key={tab.key}
                          onClick={() => setUserRoleFilter(tab.key)}
                          className={cn(
                            "px-2.5 py-1 rounded-md text-[11px] font-mono transition-colors whitespace-nowrap cursor-pointer",
                            userRoleFilter === tab.key
                              ? "bg-white text-black font-semibold"
                              : "text-zinc-400 hover:text-white bg-zinc-900 border border-white/10"
                          )}
                        >
                          {tab.label}
                        </button>
                      ))}
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="p-0">
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs border-collapse">
                      <thead>
                        <tr className="border-y border-white/10 bg-zinc-950 text-zinc-400 font-mono text-[10px] uppercase">
                          <th className="px-4 py-3">User</th>
                          <th className="px-4 py-3">Email Address</th>
                          <th className="px-4 py-3">Registered Delegate Pass</th>
                          <th className="px-4 py-3">Role</th>
                          <th className="px-4 py-3 text-right">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-white/5 font-sans">
                        {validUsers.length === 0 ? (
                          <tr>
                            <td colSpan={5} className="py-8 text-center text-zinc-500 text-xs font-mono">
                              No matching user accounts found.
                            </td>
                          </tr>
                        ) : (
                          validUsers.map((u, idx) => {
                            const linkedDel = registrations.find(
                              (r) => r.email?.toLowerCase() === u.email?.toLowerCase()
                            );
                            const isAdmin = (u.role || "").toUpperCase() === "ADMIN";

                            return (
                              <tr key={u.id || idx} className="hover:bg-zinc-900/40 transition-colors">
                                <td className="px-4 py-3">
                                  <div className="flex items-center gap-2.5">
                                    <Avatar className="h-8 w-8 border border-white/15">
                                      <AvatarImage src={u.avatarUrl || u.avatar} alt={u.fullName} />
                                      <AvatarFallback className="text-[10px] bg-zinc-800 text-white font-mono">
                                        {(u.fullName || u.email || "U").slice(0, 2).toUpperCase()}
                                      </AvatarFallback>
                                    </Avatar>
                                    <div>
                                      <span className="font-semibold text-white block">
                                        {u.fullName || u.name || "User"}
                                      </span>
                                      <span className="text-[10px] text-zinc-500 font-mono">
                                        {u.phone || "No phone linked"}
                                      </span>
                                    </div>
                                  </div>
                                </td>

                                <td className="px-4 py-3 font-mono text-zinc-300">
                                  {u.email}
                                </td>

                                <td className="px-4 py-3">
                                  {linkedDel ? (
                                    <div className="space-y-0.5">
                                      <Badge variant="outline" className="text-[10px] font-mono border-emerald-500/40 text-emerald-400">
                                        {linkedDel.regId}
                                      </Badge>
                                      <span className="block text-[11px] text-zinc-400 truncate max-w-[150px]">
                                        {linkedDel.allocatedCommittee || "Pending"} · {linkedDel.paymentStatus}
                                      </span>
                                    </div>
                                  ) : (
                                    <span className="text-[11px] text-zinc-500 italic">No registration linked</span>
                                  )}
                                </td>

                                <td className="px-4 py-3">
                                  <Badge
                                    variant={isAdmin ? "default" : "secondary"}
                                    className={cn(
                                      "text-[10px] font-mono font-bold uppercase",
                                      isAdmin ? "bg-white text-black" : "bg-zinc-800 text-zinc-400 border border-white/10"
                                    )}
                                  >
                                    {u.role || "DELEGATE"}
                                  </Badge>
                                </td>

                                <td className="px-4 py-3 text-right whitespace-nowrap">
                                  <div className="flex items-center justify-end gap-1.5">
                                    {!isAdmin ? (
                                      <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => handleUpdateUserRole(u.email, "ADMIN", u.id)}
                                        className="h-7 px-2 text-[10px] text-zinc-300 hover:text-white border-white/15 cursor-pointer"
                                      >
                                        Make Admin
                                      </Button>
                                    ) : (
                                      <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => handleUpdateUserRole(u.email, "DELEGATE", u.id)}
                                        className="h-7 px-2 text-[10px] text-zinc-500 hover:text-red-400 border-white/10 cursor-pointer"
                                      >
                                        Demote
                                      </Button>
                                    )}
                                    <Button
                                      variant="ghost"
                                      size="icon"
                                      onClick={() => handleDeleteUser(u.email, u.id, u.fullName || u.name)}
                                      className="h-7 w-7 text-zinc-500 hover:text-red-400 hover:bg-red-500/10 cursor-pointer"
                                      title="Permanently purge user & all records"
                                    >
                                      <Trash2 className="h-3.5 w-3.5" />
                                    </Button>
                                  </div>
                                </td>
                              </tr>
                            );
                          })
                        )}
                      </tbody>
                    </table>
                  </div>
                </CardContent>
              </Card>
            );
          })()}
        </main>
      </SidebarInset>

      {/* =========================================================================
          MODAL: ADD MANUAL / WALK-IN DELEGATE
          ========================================================================= */}
      {isAddModalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md"
          onClick={() => setIsAddModalOpen(false)}
        >
          <div
            className="relative max-w-lg w-full rounded-2xl border border-white/15 bg-zinc-950 p-6 shadow-2xl space-y-5"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <div>
                <h3 className="text-base font-bold text-white uppercase tracking-tight">
                  Add Individual Delegate
                </h3>
                <p className="text-xs text-zinc-400">Manual Walk-In &amp; Secretariat Override</p>
              </div>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="h-8 w-8 rounded-lg border border-white/15 text-zinc-400 hover:text-white flex items-center justify-center cursor-pointer"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <form onSubmit={handleAddDelegateSubmit} className="space-y-4 text-xs font-sans">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-[10px] font-mono text-zinc-400 uppercase block mb-1">Full Name *</label>
                  <input
                    type="text"
                    required
                    placeholder="Candidate full name"
                    value={addForm.fullName}
                    onChange={(e) => setAddForm({ ...addForm, fullName: e.target.value })}
                    className="w-full h-8 px-2.5 rounded-lg border border-white/15 bg-zinc-900 text-white focus:outline-none"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-mono text-zinc-400 uppercase block mb-1">Email Address *</label>
                  <input
                    type="email"
                    required
                    placeholder="delegate@gmail.com"
                    value={addForm.email}
                    onChange={(e) => setAddForm({ ...addForm, email: e.target.value })}
                    className="w-full h-8 px-2.5 rounded-lg border border-white/15 bg-zinc-900 text-white focus:outline-none font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-[10px] font-mono text-zinc-400 uppercase block mb-1">WhatsApp Phone *</label>
                  <input
                    type="tel"
                    required
                    placeholder="10-digit mobile"
                    value={addForm.phone}
                    onChange={(e) => setAddForm({ ...addForm, phone: e.target.value })}
                    className="w-full h-8 px-2.5 rounded-lg border border-white/15 bg-zinc-900 text-white focus:outline-none font-mono"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-mono text-zinc-400 uppercase block mb-1">School / Institution</label>
                  <input
                    type="text"
                    placeholder="Institution name"
                    value={addForm.institution}
                    onChange={(e) => setAddForm({ ...addForm, institution: e.target.value })}
                    className="w-full h-8 px-2.5 rounded-lg border border-white/15 bg-zinc-900 text-white focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-[10px] font-mono text-zinc-400 uppercase block mb-1">Allocated Committee</label>
                  <select
                    value={addForm.allocatedCommittee}
                    onChange={(e) => setAddForm({ ...addForm, allocatedCommittee: e.target.value })}
                    className="w-full h-8 px-2 rounded-lg border border-white/15 bg-zinc-900 text-white focus:outline-none font-mono"
                  >
                    {COMMITTEES.map((c) => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="text-[10px] font-mono text-zinc-400 uppercase block mb-1">Country / Portfolio</label>
                  <input
                    type="text"
                    placeholder="e.g. France, Delegate, IP"
                    value={addForm.allocatedCountry}
                    onChange={(e) => setAddForm({ ...addForm, allocatedCountry: e.target.value })}
                    className="w-full h-8 px-2.5 rounded-lg border border-white/15 bg-zinc-900 text-white focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-[10px] font-mono text-zinc-400 uppercase block mb-1">Payment Status</label>
                  <select
                    value={addForm.paymentStatus}
                    onChange={(e) => setAddForm({ ...addForm, paymentStatus: e.target.value })}
                    className="w-full h-8 px-2 rounded-lg border border-white/15 bg-zinc-900 text-white focus:outline-none font-mono"
                  >
                    <option value="VERIFIED">VERIFIED (Activated Pass)</option>
                    <option value="PENDING">PENDING (Unverified)</option>
                  </select>
                </div>
                <div>
                  <label className="text-[10px] font-mono text-zinc-400 uppercase block mb-1">Payment UTR / Txn ID</label>
                  <input
                    type="text"
                    placeholder="OFFLINE-CASH, UPI UTR..."
                    value={addForm.paymentUTR}
                    onChange={(e) => setAddForm({ ...addForm, paymentUTR: e.target.value })}
                    className="w-full h-8 px-2.5 rounded-lg border border-white/15 bg-zinc-900 text-white focus:outline-none font-mono"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-white/10">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsAddModalOpen(false)}
                  className="h-9 px-4 text-xs border-white/15 text-zinc-400 cursor-pointer"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  className="h-9 px-5 bg-white hover:bg-zinc-200 text-black font-semibold text-xs cursor-pointer"
                >
                  Create Delegate Record
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* =========================================================================
          MODAL: EDIT DELEGATE DETAILS
          ========================================================================= */}
      {editingDelegate && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md"
          onClick={() => setEditingDelegate(null)}
        >
          <div
            className="relative max-w-lg w-full rounded-2xl border border-white/15 bg-zinc-950 p-6 shadow-2xl space-y-5"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <div>
                <h3 className="text-base font-bold text-white uppercase tracking-tight">
                  Edit Delegate Information
                </h3>
                <p className="text-xs text-zinc-400 font-mono">{editingDelegate.regId || editingDelegate.id}</p>
              </div>
              <button
                onClick={() => setEditingDelegate(null)}
                className="h-8 w-8 rounded-lg border border-white/15 text-zinc-400 hover:text-white flex items-center justify-center cursor-pointer"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <form onSubmit={handleEditDelegateSubmit} className="space-y-4 text-xs font-sans">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-[10px] font-mono text-zinc-400 uppercase block mb-1">Full Name</label>
                  <input
                    type="text"
                    value={editingDelegate.fullName || ""}
                    onChange={(e) => setEditingDelegate({ ...editingDelegate, fullName: e.target.value })}
                    className="w-full h-8 px-2.5 rounded-lg border border-white/15 bg-zinc-900 text-white focus:outline-none"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-mono text-zinc-400 uppercase block mb-1">Email</label>
                  <input
                    type="email"
                    value={editingDelegate.email || ""}
                    onChange={(e) => setEditingDelegate({ ...editingDelegate, email: e.target.value })}
                    className="w-full h-8 px-2.5 rounded-lg border border-white/15 bg-zinc-900 text-white focus:outline-none font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-[10px] font-mono text-zinc-400 uppercase block mb-1">Phone</label>
                  <input
                    type="tel"
                    value={editingDelegate.phone || ""}
                    onChange={(e) => setEditingDelegate({ ...editingDelegate, phone: e.target.value })}
                    className="w-full h-8 px-2.5 rounded-lg border border-white/15 bg-zinc-900 text-white focus:outline-none font-mono"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-mono text-zinc-400 uppercase block mb-1">School / Institution</label>
                  <input
                    type="text"
                    value={editingDelegate.institution || ""}
                    onChange={(e) => setEditingDelegate({ ...editingDelegate, institution: e.target.value })}
                    className="w-full h-8 px-2.5 rounded-lg border border-white/15 bg-zinc-900 text-white focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-[10px] font-mono text-zinc-400 uppercase block mb-1">Allocated Committee</label>
                  <select
                    value={editingDelegate.allocatedCommittee || ""}
                    onChange={(e) => setEditingDelegate({ ...editingDelegate, allocatedCommittee: e.target.value })}
                    className="w-full h-8 px-2 rounded-lg border border-white/15 bg-zinc-900 text-white focus:outline-none font-mono"
                  >
                    <option value="">Unassigned</option>
                    {COMMITTEES.map((c) => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="text-[10px] font-mono text-zinc-400 uppercase block mb-1">Country / Portfolio</label>
                  <input
                    type="text"
                    value={editingDelegate.allocatedCountry || ""}
                    onChange={(e) => setEditingDelegate({ ...editingDelegate, allocatedCountry: e.target.value })}
                    className="w-full h-8 px-2.5 rounded-lg border border-white/15 bg-zinc-900 text-white focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-[10px] font-mono text-zinc-400 uppercase block mb-1">Payment Status</label>
                  <select
                    value={editingDelegate.paymentStatus || "PENDING"}
                    onChange={(e) => setEditingDelegate({ ...editingDelegate, paymentStatus: e.target.value })}
                    className="w-full h-8 px-2 rounded-lg border border-white/15 bg-zinc-900 text-white focus:outline-none font-mono"
                  >
                    <option value="VERIFIED">VERIFIED</option>
                    <option value="PENDING">PENDING</option>
                  </select>
                </div>
                <div>
                  <label className="text-[10px] font-mono text-zinc-400 uppercase block mb-1">Payment UTR</label>
                  <input
                    type="text"
                    value={editingDelegate.paymentUTR || ""}
                    onChange={(e) => setEditingDelegate({ ...editingDelegate, paymentUTR: e.target.value })}
                    className="w-full h-8 px-2.5 rounded-lg border border-white/15 bg-zinc-900 text-white focus:outline-none font-mono"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-white/10">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setEditingDelegate(null)}
                  className="h-9 px-4 text-xs border-white/15 text-zinc-400 cursor-pointer"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  className="h-9 px-5 bg-white hover:bg-zinc-200 text-black font-semibold text-xs cursor-pointer"
                >
                  Save Changes
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* =========================================================================
          MODAL: QUICK ALLOT COMMITTEE & PORTFOLIO
          ========================================================================= */}
      {allottingDelegate && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md"
          onClick={() => setAllottingDelegate(null)}
        >
          <div
            className="relative max-w-md w-full rounded-2xl border border-white/15 bg-zinc-950 p-6 shadow-2xl space-y-5"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <div>
                <h3 className="text-base font-bold text-white uppercase tracking-tight">
                  Portfolio Allotment
                </h3>
                <p className="text-xs text-zinc-400">{allottingDelegate.fullName} ({allottingDelegate.regId})</p>
              </div>
              <button
                onClick={() => setAllottingDelegate(null)}
                className="h-8 w-8 rounded-lg border border-white/15 text-zinc-400 hover:text-white flex items-center justify-center cursor-pointer"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <form onSubmit={handleQuickAllotSubmit} className="space-y-4 text-xs font-sans">
              <div>
                <label className="text-[10px] font-mono text-zinc-400 uppercase block mb-1">Committee</label>
                <select
                  value={allotForm.committee}
                  onChange={(e) => setAllotForm({ ...allotForm, committee: e.target.value })}
                  className="w-full h-9 px-3 rounded-lg border border-white/15 bg-zinc-900 text-white focus:outline-none font-mono"
                >
                  {COMMITTEES.map((c) => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-[10px] font-mono text-zinc-400 uppercase block mb-1">Portfolio / Country Assignment</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. United States of America, Narendra Modi..."
                  value={allotForm.country}
                  onChange={(e) => setAllotForm({ ...allotForm, country: e.target.value })}
                  className="w-full h-9 px-3 rounded-lg border border-white/15 bg-zinc-900 text-white focus:outline-none"
                />
              </div>

              <div className="flex items-center gap-2 pt-1">
                <input
                  type="checkbox"
                  id="sendEmailCheckbox"
                  checked={allotForm.sendEmail}
                  onChange={(e) => setAllotForm({ ...allotForm, sendEmail: e.target.checked })}
                  className="rounded border-white/20 bg-zinc-900"
                />
                <label htmlFor="sendEmailCheckbox" className="text-xs text-zinc-300">
                  Dispatch official allotment communiqué to delegate email
                </label>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-white/10">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setAllottingDelegate(null)}
                  className="h-9 px-4 text-xs border-white/15 text-zinc-400 cursor-pointer"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  className="h-9 px-5 bg-white hover:bg-zinc-200 text-black font-semibold text-xs cursor-pointer"
                >
                  Confirm Allotment
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* =========================================================================
          IN-SITE PAYMENT SCREENSHOT LIGHTBOX VIEWER WITH ZOOM & 1-CLICK APPROVAL
          ========================================================================= */}
      {viewingImage && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-md"
          onClick={() => {
            setViewingImage(null);
            setViewingDelegate(null);
          }}
        >
          <div
            className="relative max-w-3xl max-h-[92vh] w-full rounded-2xl border border-white/20 bg-zinc-950 p-4 overflow-hidden flex flex-col items-center gap-3 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header Controls */}
            <div className="w-full flex items-center justify-between border-b border-white/10 pb-2">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-white uppercase tracking-wider font-sans">
                  {viewingDelegate?.roleType ? `${viewingDelegate.roleType} Candidate CV / Portfolio` : "Payment Receipt Lightbox"}
                </span>
                {viewingDelegate && (
                  <Badge variant="outline" className="text-[10px] font-mono border-white/20 text-zinc-300">
                    {viewingDelegate.roleType
                      ? `${viewingDelegate.appId || viewingDelegate.id || "Candidate"} · ${viewingDelegate.fullName || viewingDelegate.name || ""}`
                      : `${viewingDelegate.regId} · UTR: ${viewingDelegate.paymentUTR || "None"}`}
                  </Badge>
                )}
              </div>
              <div className="flex items-center gap-1.5">
                {getDriveFileId(viewingImage) && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setLightboxMode((m) => (m === "image" ? "preview" : "image"))}
                    className="h-7 text-[10px] px-2 border-white/15 text-zinc-300 hover:text-white"
                  >
                    {lightboxMode === "image" ? "Drive Preview / PDF" : "Image View"}
                  </Button>
                )}
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setImageZoom((z) => Math.max(0.5, z - 0.25))}
                  className="h-8 w-8 text-zinc-400 hover:text-white"
                  title="Zoom Out"
                >
                  <ZoomOut className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setImageZoom((z) => Math.min(3, z + 0.25))}
                  className="h-8 w-8 text-zinc-400 hover:text-white"
                  title="Zoom In"
                >
                  <ZoomIn className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setImageRotation((r) => (r + 90) % 360)}
                  className="h-8 w-8 text-zinc-400 hover:text-white"
                  title="Rotate Image"
                >
                  <RotateCw className="h-4 w-4" />
                </Button>
                <button
                  onClick={() => {
                    setViewingImage(null);
                    setViewingDelegate(null);
                  }}
                  className="h-8 w-8 rounded-lg bg-white/10 hover:bg-white/20 text-white flex items-center justify-center cursor-pointer ml-1"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            </div>

            {/* Image / Preview Canvas */}
            <div className="w-full flex-1 min-h-[380px] max-h-[62vh] overflow-auto flex items-center justify-center bg-black/70 rounded-xl p-2 border border-white/10">
              {lightboxMode === "preview" || imageLoadError ? (
                <iframe
                  src={getDrivePreviewUrl(viewingImage)}
                  className="w-full h-[58vh] rounded-lg border-0 bg-zinc-900"
                  title="Payment Proof Document"
                  allow="autoplay"
                />
              ) : (
                <img
                  src={getDirectImageUrl(viewingImage)}
                  alt="Payment Screenshot Proof"
                  onError={() => {
                    // Fall back to Drive preview iframe if thumbnail fails
                    setImageLoadError(true);
                  }}
                  style={{
                    transform: `scale(${imageZoom}) rotate(${imageRotation}deg)`,
                    transition: "transform 0.15s ease-out",
                  }}
                  className="max-h-[58vh] max-w-full object-contain rounded"
                />
              )}
            </div>

            {/* Quick Actions Footer */}
            <div className="w-full flex flex-col sm:flex-row items-center justify-between gap-3 pt-1 border-t border-white/10">
              <div className="flex items-center gap-3">
                <a
                  href={viewingImage}
                  target="_blank"
                  rel="noreferrer"
                  className="text-xs text-cyan-300 hover:text-white underline inline-flex items-center gap-1 font-mono"
                >
                  Open Original Document <ExternalLink className="h-3 w-3" />
                </a>
                <button
                  onClick={() => {
                    navigator.clipboard.writeText(viewingImage);
                    notify("Document link copied to clipboard");
                  }}
                  className="text-xs text-zinc-400 hover:text-zinc-200 inline-flex items-center gap-1 cursor-pointer"
                >
                  <Copy className="h-3 w-3" /> Copy Link
                </button>
              </div>

              {viewingDelegate && (
                <div className="flex items-center gap-2">
                  {viewingDelegate.roleType ? (
                    <>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          handleUpdateApplicantStatus(viewingDelegate, "Rejected");
                          setViewingImage(null);
                        }}
                        className="h-8 px-3 text-xs text-red-400 border-red-500/30 hover:bg-red-950/40 cursor-pointer"
                      >
                        <XCircle className="h-4 w-4 mr-1.5" />
                        Reject Application
                      </Button>
                      <Button
                        variant="default"
                        size="sm"
                        onClick={() => {
                          handleUpdateApplicantStatus(viewingDelegate, "Accepted");
                          setViewingImage(null);
                        }}
                        className="h-8 px-4 text-xs bg-emerald-500 hover:bg-emerald-400 text-black font-bold cursor-pointer"
                      >
                        <CheckCircle2 className="h-4 w-4 mr-1.5" />
                        Accept Candidate
                      </Button>
                    </>
                  ) : (
                    <>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          handleVerifyPayment(viewingDelegate.regId, viewingDelegate.email, "FAILED");
                          setViewingImage(null);
                        }}
                        className="h-8 px-3 text-xs text-red-400 border-red-500/30 hover:bg-red-950/40 cursor-pointer"
                      >
                        Reject Payment
                      </Button>
                      <Button
                        variant="default"
                        size="sm"
                        onClick={() => {
                          handleVerifyPayment(viewingDelegate.regId, viewingDelegate.email, "VERIFIED");
                          setViewingImage(null);
                        }}
                        className="h-8 px-4 text-xs bg-emerald-500 hover:bg-emerald-400 text-black font-bold cursor-pointer"
                      >
                        <CheckCircle2 className="h-4 w-4 mr-1.5" />
                        Approve &amp; Activate Pass
                      </Button>
                    </>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* =========================================================================
          MODAL: INSPECT ABANDONED DRAFT LEAD (ALL RAW TYPED INPUTS)
          ========================================================================= */}
      {viewingDraftLead && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md"
          onClick={() => setViewingDraftLead(null)}
        >
          <div
            className="relative max-w-xl w-full rounded-2xl border border-white/20 bg-zinc-950 p-6 shadow-2xl space-y-5 max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-base font-bold text-white uppercase tracking-tight">
                    Candidate Form Telemetry &amp; Draft
                  </h3>
                  <Badge variant="outline" className="text-[10px] font-mono border-cyan-500/40 text-cyan-400">
                    {viewingDraftLead.formType || "Individual Delegate"}
                  </Badge>
                </div>
                <p className="text-xs text-zinc-400 font-mono mt-0.5">
                  Captured at: {viewingDraftLead.timestamp ? new Date(viewingDraftLead.timestamp).toLocaleString() : "Recent"}
                </p>
              </div>
              <button
                onClick={() => setViewingDraftLead(null)}
                className="h-8 w-8 rounded-lg border border-white/15 text-zinc-400 hover:text-white flex items-center justify-center cursor-pointer"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Candidate Identity Card */}
            <div className="p-4 rounded-xl border border-white/10 bg-zinc-900/60 space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-lg font-bold text-white">
                    {viewingDraftLead.fullName || viewingDraftLead.name || "Prospective Candidate"}
                  </h4>
                  <p className="text-xs text-zinc-400">
                    {viewingDraftLead.institution || "Individual"} {viewingDraftLead.grade ? `· Grade ${viewingDraftLead.grade}` : ""}
                  </p>
                </div>
                <Badge variant="outline" className="text-[10px] font-mono border-white/20 text-zinc-300">
                  {viewingDraftLead.lastStep || viewingDraftLead.step || "Step 1"}
                </Badge>
              </div>

              {/* Contact Links */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-2 border-t border-white/10 text-xs font-mono">
                <div>
                  <span className="text-zinc-500 block text-[10px] uppercase">Email</span>
                  {viewingDraftLead.email ? (
                    <a href={`mailto:${viewingDraftLead.email}`} className="text-zinc-200 hover:underline">
                      {viewingDraftLead.email}
                    </a>
                  ) : (
                    <span className="text-zinc-500 italic">Not entered</span>
                  )}
                </div>
                <div>
                  <span className="text-zinc-500 block text-[10px] uppercase">Phone</span>
                  {viewingDraftLead.phone ? (
                    <div className="flex items-center gap-2">
                      <a href={`tel:${viewingDraftLead.phone}`} className="text-zinc-200 hover:underline">
                        {viewingDraftLead.phone}
                      </a>
                      <a
                        href={`https://wa.me/91${viewingDraftLead.phone.replace(/\D/g, "").slice(-10)}?text=${encodeURIComponent(
                          `Hi ${viewingDraftLead.fullName || viewingDraftLead.name || "Delegate"}! We noticed you began your Resolve MUN 2.0 registration for ${
                            viewingDraftLead.preferences || "our committees"
                          }. Would you like assistance completing your allotment?`
                        )}`}
                        target="_blank"
                        rel="noreferrer"
                        className="text-[10px] text-emerald-400 font-bold hover:underline"
                      >
                        [WhatsApp]
                      </a>
                    </div>
                  ) : (
                    <span className="text-zinc-500 italic">Not entered</span>
                  )}
                </div>
              </div>
            </div>

            {/* Committee Preferences & Stated Intent */}
            <div className="p-4 rounded-xl border border-white/10 bg-zinc-900/60 space-y-2 text-xs">
              <span className="text-[10px] font-mono text-zinc-400 uppercase tracking-wider block font-semibold">
                Committee &amp; Portfolio Selections
              </span>
              <p className="text-sm font-semibold text-white font-mono">
                {viewingDraftLead.preferences || "No committee preferences chosen yet"}
              </p>
            </div>

            {/* Detailed Form Fields Captured */}
            {viewingDraftLead.draftData && Object.keys(viewingDraftLead.draftData).length > 0 && (
              <div className="p-4 rounded-xl border border-white/10 bg-black/60 space-y-3">
                <span className="text-[10px] font-mono text-zinc-400 uppercase tracking-wider block font-semibold">
                  All Raw Fields Captured In Progress ({Object.keys(viewingDraftLead.draftData).length} fields)
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                  {Object.entries(viewingDraftLead.draftData).map(([k, v]) => {
                    if (k.startsWith("_") || !v) return null;
                    return (
                      <div key={k} className="p-2 rounded border border-white/5 bg-zinc-900/40">
                        <span className="text-[10px] font-mono text-zinc-500 block truncate">{k}</span>
                        <span className="text-white font-sans text-xs block truncate">{String(v)}</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Actions */}
            <div className="flex items-center justify-between pt-3 border-t border-white/10">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setViewingDraftLead(null)}
                className="h-9 px-4 text-xs border-white/15 text-zinc-400 cursor-pointer"
              >
                Close Inspector
              </Button>

              <div className="flex items-center gap-2">
                <Button
                  variant="default"
                  size="sm"
                  onClick={() => {
                    setAddForm({
                      fullName: viewingDraftLead.fullName || viewingDraftLead.name || "",
                      email: viewingDraftLead.email || "",
                      phone: viewingDraftLead.phone || "",
                      institution: viewingDraftLead.institution || "Individual",
                      grade: viewingDraftLead.grade || "11",
                      dob: "",
                      allocatedCommittee: (viewingDraftLead.preferences || "DISEC").split(" · ")[0] || "DISEC",
                      allocatedCountry: "",
                      paymentStatus: "VERIFIED",
                      paymentUTR: "PROMOTED-LEAD",
                    });
                    setViewingDraftLead(null);
                    setIsAddModalOpen(true);
                  }}
                  className="h-9 px-4 bg-white hover:bg-zinc-200 text-black font-semibold text-xs cursor-pointer gap-1.5"
                >
                  <UserPlus className="h-3.5 w-3.5" />
                  <span>Convert to Official Delegate</span>
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* =========================================================================
          MODAL: TEAM APPLICATION & CV INSPECTOR (FULL ANSWERS + EMBEDDED CV)
          ========================================================================= */}
      {selectedTeamApp && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-md"
          onClick={() => setSelectedTeamApp(null)}
        >
          <div
            className="relative max-w-4xl w-full rounded-2xl border border-white/20 bg-zinc-950 p-5 sm:p-6 shadow-2xl space-y-5 max-h-[92vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header with identity & close */}
            <div className="flex items-start justify-between border-b border-white/10 pb-4">
              <div className="space-y-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <h3 className="text-xl font-bold text-white tracking-tight">
                    {selectedTeamApp.fullName || selectedTeamApp.name || "Candidate"}
                  </h3>
                  <Badge
                    variant="outline"
                    className={cn(
                      "text-[10px] font-mono",
                      selectedTeamApp.roleType === "EB"
                        ? "border-amber-500/40 text-amber-300 bg-amber-500/10"
                        : selectedTeamApp.roleType === "OC"
                        ? "border-cyan-500/40 text-cyan-300 bg-cyan-500/10"
                        : "border-purple-500/40 text-purple-300 bg-purple-500/10"
                    )}
                  >
                    {selectedTeamApp.roleType === "OC"
                      ? "Organizing Committee (OC)"
                      : selectedTeamApp.roleType === "EB"
                      ? "Executive Board (EB)"
                      : "Secretariat"}
                  </Badge>
                  <Badge
                    variant={selectedTeamApp.status === "Accepted" ? "default" : "secondary"}
                    className={cn(
                      "text-[10px] font-mono",
                      selectedTeamApp.status === "Accepted"
                        ? "bg-emerald-500/20 text-emerald-300 border-emerald-500/30"
                        : selectedTeamApp.status === "Rejected"
                        ? "bg-red-500/20 text-red-300 border-red-500/30"
                        : "bg-white/10 text-zinc-300"
                    )}
                  >
                    {selectedTeamApp.status || "Under Review"}
                  </Badge>
                </div>
                <p className="text-xs text-zinc-400 font-mono">
                  Application ID: <span className="text-zinc-200">{selectedTeamApp.appId || selectedTeamApp.id || "APP-PENDING"}</span>
                  {selectedTeamApp.timestamp && ` · Applied: ${new Date(selectedTeamApp.timestamp).toLocaleDateString()}`}
                </p>
              </div>

              <button
                onClick={() => setSelectedTeamApp(null)}
                className="h-8 w-8 rounded-lg border border-white/15 text-zinc-400 hover:text-white flex items-center justify-center cursor-pointer transition-colors"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Quick Status Bar & Actions */}
            <div className="flex flex-wrap items-center justify-between gap-3 p-3 rounded-xl border border-white/10 bg-zinc-900/40">
              <span className="text-xs text-zinc-400 font-mono">
                Update Status &amp; Dispatch Notifications:
              </span>
              <div className="flex items-center gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleUpdateApplicantStatus(selectedTeamApp, "Under Review")}
                  className={cn(
                    "h-8 text-xs cursor-pointer",
                    selectedTeamApp.status === "Under Review" ? "border-amber-500 text-amber-300" : "border-white/10 text-zinc-400"
                  )}
                >
                  Mark Under Review
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleUpdateApplicantStatus(selectedTeamApp, "Rejected")}
                  className={cn(
                    "h-8 text-xs cursor-pointer border-red-500/30 text-red-400 hover:bg-red-950/30",
                    selectedTeamApp.status === "Rejected" && "bg-red-500/20"
                  )}
                >
                  Reject
                </Button>
                <Button
                  size="sm"
                  onClick={() => handleUpdateApplicantStatus(selectedTeamApp, "Accepted")}
                  className="h-8 text-xs bg-emerald-500 hover:bg-emerald-400 text-black font-bold cursor-pointer gap-1.5"
                >
                  <CheckCircle2 className="h-3.5 w-3.5" />
                  <span>Accept &amp; Send Offer</span>
                </Button>
              </div>
            </div>

            {/* Grid with Details */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Left Column: Personal & Contact Information */}
              <div className="space-y-4">
                <div className="p-4 rounded-xl border border-white/10 bg-zinc-900/60 space-y-3">
                  <h4 className="text-xs font-mono font-semibold uppercase tracking-wider text-zinc-400">
                    Contact &amp; Demographics
                  </h4>
                  <div className="space-y-2 text-xs">
                    <div className="flex items-center justify-between py-1 border-b border-white/5">
                      <span className="text-zinc-500 font-mono">Email:</span>
                      <a href={`mailto:${selectedTeamApp.email}`} className="text-cyan-400 hover:underline font-mono">
                        {selectedTeamApp.email || "N/A"}
                      </a>
                    </div>
                    <div className="flex items-center justify-between py-1 border-b border-white/5">
                      <span className="text-zinc-500 font-mono">Phone:</span>
                      {selectedTeamApp.phone ? (
                        <div className="flex items-center gap-2">
                          <a href={`tel:${selectedTeamApp.phone}`} className="text-zinc-200 hover:underline font-mono">
                            {selectedTeamApp.phone}
                          </a>
                          <a
                            href={`https://wa.me/91${String(selectedTeamApp.phone).replace(/\D/g, "").slice(-10)}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-[10px] text-emerald-400 hover:underline font-mono"
                          >
                            WhatsApp ↗
                          </a>
                        </div>
                      ) : (
                        <span className="text-zinc-500 italic">N/A</span>
                      )}
                    </div>
                    {(selectedTeamApp.institution || selectedTeamApp.schoolCollege || selectedTeamApp.school) && (
                      <div className="flex items-center justify-between py-1 border-b border-white/5">
                        <span className="text-zinc-500 font-mono">Institution:</span>
                        <span className="text-zinc-200 font-semibold">{selectedTeamApp.institution || selectedTeamApp.schoolCollege || selectedTeamApp.school}</span>
                      </div>
                    )}
                    {selectedTeamApp.grade && (
                      <div className="flex items-center justify-between py-1 border-b border-white/5">
                        <span className="text-zinc-500 font-mono">Grade/Year:</span>
                        <span className="text-zinc-200">{selectedTeamApp.grade}</span>
                      </div>
                    )}
                    {selectedTeamApp.dob && (
                      <div className="flex items-center justify-between py-1 border-b border-white/5">
                        <span className="text-zinc-500 font-mono">DOB:</span>
                        <span className="text-zinc-200">{selectedTeamApp.dob}</span>
                      </div>
                    )}
                    {selectedTeamApp.instagram && (
                      <div className="flex items-center justify-between py-1 border-b border-white/5">
                        <span className="text-zinc-500 font-mono">Instagram:</span>
                        <a
                          href={`https://instagram.com/${String(selectedTeamApp.instagram).replace("@", "")}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-pink-400 hover:underline font-mono"
                        >
                          @{String(selectedTeamApp.instagram).replace("@", "")}
                        </a>
                      </div>
                    )}
                    {(selectedTeamApp.residentialAddress || selectedTeamApp.address) && (
                      <div className="py-1 border-b border-white/5">
                        <span className="text-zinc-500 font-mono block mb-0.5">Address:</span>
                        <span className="text-zinc-300">{selectedTeamApp.residentialAddress || selectedTeamApp.address}</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Preferences / Role applied for */}
                <div className="p-4 rounded-xl border border-white/10 bg-zinc-900/60 space-y-2">
                  <h4 className="text-xs font-mono font-semibold uppercase tracking-wider text-zinc-400">
                    Application Role &amp; Preferences
                  </h4>
                  {selectedTeamApp.roleType === "EB" ? (
                    <div className="space-y-2 text-xs">
                      <div>
                        <span className="text-zinc-500 font-mono block text-[10px]">Applied Position:</span>
                        <span className="font-bold text-white">{selectedTeamApp.position || selectedTeamApp.role_preference || "Executive Board Member"}</span>
                      </div>
                      <div className="grid grid-cols-2 gap-2 pt-1 border-t border-white/5">
                        <div>
                          <span className="text-zinc-500 font-mono block text-[10px]">Pref 1:</span>
                          <span className="font-semibold text-emerald-400">{selectedTeamApp.prefCommittee1 || (selectedTeamApp.committees ? selectedTeamApp.committees.split(" & ")[0] : "None")}</span>
                        </div>
                        <div>
                          <span className="text-zinc-500 font-mono block text-[10px]">Pref 2:</span>
                          <span className="font-semibold text-zinc-300">{selectedTeamApp.prefCommittee2 || (selectedTeamApp.committees ? selectedTeamApp.committees.split(" & ")[1] : "None")}</span>
                        </div>
                      </div>
                      {selectedTeamApp.munCount && (
                        <div className="pt-1 border-t border-white/5">
                          <span className="text-zinc-500 font-mono text-[10px]">Total MUNs Chaired/Attended: </span>
                          <span className="font-mono font-bold text-amber-300">{selectedTeamApp.munCount}</span>
                        </div>
                      )}
                    </div>
                  ) : selectedTeamApp.roleType === "SEC" ? (
                    <div className="space-y-2 text-xs">
                      <div>
                        <span className="text-zinc-500 font-mono block text-[10px]">Secretariat Position Applied:</span>
                        <span className="font-bold text-white text-sm">{selectedTeamApp.position || "Secretariat High Command"}</span>
                      </div>
                      {selectedTeamApp.dailyCommitment && (
                        <div className="pt-1 border-t border-white/5">
                          <span className="text-zinc-500 font-mono block text-[10px]">Daily Commitment:</span>
                          <span className="font-semibold text-cyan-300">{selectedTeamApp.dailyCommitment}</span>
                        </div>
                      )}
                      {selectedTeamApp.contribution && (
                        <div className="pt-1 border-t border-white/5">
                          <span className="text-zinc-500 font-mono block text-[10px]">Specific Role Contribution:</span>
                          <p className="text-zinc-300 whitespace-pre-line text-[11px] leading-relaxed mt-0.5">{selectedTeamApp.contribution}</p>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="space-y-2 text-xs">
                      <div>
                        <span className="text-zinc-500 font-mono block text-[10px]">Department Preference 1:</span>
                        <span className="font-semibold text-white">{selectedTeamApp.department1 || selectedTeamApp.department || "General"}</span>
                      </div>
                      {selectedTeamApp.department2 && (
                        <div>
                          <span className="text-zinc-500 font-mono block text-[10px]">Department Preference 2:</span>
                          <span className="font-semibold text-zinc-300">{selectedTeamApp.department2}</span>
                        </div>
                      )}
                      {selectedTeamApp.paymentUTR && (
                        <div className="pt-1 border-t border-white/5">
                          <span className="text-zinc-500 font-mono text-[10px]">Payment UTR: </span>
                          <span className="font-mono text-emerald-400">{selectedTeamApp.paymentUTR}</span>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>

              {/* Right Column: Statement, Experience & CV Preview */}
              <div className="space-y-4">
                {/* Experience / Statement */}
                <div className="p-4 rounded-xl border border-white/10 bg-zinc-900/60 space-y-2">
                  <h4 className="text-xs font-mono font-semibold uppercase tracking-wider text-zinc-400">
                    Statement &amp; Experience
                  </h4>
                  <div className="text-xs space-y-3 max-h-48 overflow-y-auto pr-1">
                    {(selectedTeamApp.munExperience || selectedTeamApp.previousExperience || selectedTeamApp.previousExperiences || selectedTeamApp.experience) && (
                      <div>
                        <span className="text-[10px] font-mono text-zinc-500 block">Past Experience:</span>
                        <p className="text-zinc-300 whitespace-pre-line leading-relaxed">
                          {selectedTeamApp.munExperience || selectedTeamApp.previousExperience || selectedTeamApp.previousExperiences || selectedTeamApp.experience}
                        </p>
                      </div>
                    )}
                    {(selectedTeamApp.executiveSummary || selectedTeamApp.whyJoin || selectedTeamApp.why || selectedTeamApp.sop) && (
                      <div>
                        <span className="text-[10px] font-mono text-zinc-500 block">Statement of Purpose / Why Join:</span>
                        <p className="text-zinc-300 whitespace-pre-line leading-relaxed">
                          {selectedTeamApp.executiveSummary || selectedTeamApp.whyJoin || selectedTeamApp.why || selectedTeamApp.sop}
                        </p>
                      </div>
                    )}
                  </div>
                </div>

                {/* CV / Portfolio Document Section */}
                <div className="p-4 rounded-xl border border-white/10 bg-zinc-900/60 space-y-3">
                  {(() => {
                    const candidateDocUrl = selectedTeamApp.cvUrl || selectedTeamApp.cv_url || selectedTeamApp.resumeUrl || selectedTeamApp.resume_url || selectedTeamApp.drive_url || selectedTeamApp.paymentScreenshotURL || "";
                    const candidatePortfolioUrl = selectedTeamApp.portfolioUrl || selectedTeamApp.portfolio_url || "";
                    const activeDoc = candidateDocUrl || candidatePortfolioUrl;

                    return (
                      <>
                        <div className="flex items-center justify-between flex-wrap gap-2">
                          <h4 className="text-xs font-mono font-semibold uppercase tracking-wider text-zinc-400">
                            Curriculum Vitae (CV) &amp; Portfolio
                          </h4>
                          {activeDoc && (
                            <div className="flex items-center gap-2">
                              <a
                                href={activeDoc}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="px-2.5 py-1 rounded bg-white text-black font-semibold text-[11px] hover:bg-zinc-200 transition-colors flex items-center gap-1 cursor-pointer"
                              >
                                <span>Open Full Document</span>
                                <ExternalLink className="h-3 w-3" />
                              </a>
                            </div>
                          )}
                        </div>

                        {activeDoc ? (
                          <div className="space-y-2">
                            <div className="relative w-full h-80 sm:h-96 rounded-lg border border-white/15 overflow-hidden bg-black/60 shadow-inner">
                              <iframe
                                src={getDrivePreviewUrl(activeDoc)}
                                className="w-full h-full border-0"
                                title="Candidate Document"
                              />
                            </div>
                            <div className="flex items-center justify-between text-[11px] font-mono text-zinc-400 pt-1">
                              <span className="truncate max-w-[200px] text-zinc-500">
                                {candidateDocUrl ? "CV / Resume" : "Portfolio Document"}
                              </span>
                              <div className="flex items-center gap-2">
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => openScreenshotLightbox(activeDoc, selectedTeamApp)}
                                  className="h-6 text-[10px] text-cyan-300 hover:text-white hover:bg-white/10 p-1"
                                >
                                  <Maximize2 className="h-3 w-3 mr-1" />
                                  View in Lightbox
                                </Button>
                              </div>
                            </div>
                          </div>
                        ) : (
                          <div className="py-8 text-center border border-dashed border-white/10 rounded-lg">
                            <FileText className="h-8 w-8 text-zinc-600 mx-auto mb-2" />
                            <p className="text-xs text-zinc-400 font-mono">No CV document attached</p>
                            <p className="text-[10px] text-zinc-600 mt-0.5">Applicant did not upload a CV file</p>
                          </div>
                        )}

                        {candidatePortfolioUrl && candidatePortfolioUrl !== activeDoc && (
                          <div className="pt-2 border-t border-white/10 flex items-center justify-between">
                            <span className="text-xs font-mono text-zinc-400">Additional Portfolio Link:</span>
                            <a
                              href={candidatePortfolioUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-xs font-mono text-cyan-400 hover:underline flex items-center gap-1"
                            >
                              <span>View Portfolio</span>
                              <ExternalLink className="h-3 w-3" />
                            </a>
                          </div>
                        )}
                      </>
                    );
                  })()}
                </div>
              </div>
            </div>

            {/* Footer with email link & delete option */}
            <div className="flex items-center justify-between pt-4 border-t border-white/10 flex-wrap gap-2">
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setSelectedTeamApp(null)}
                  className="h-9 px-4 text-xs border-white/15 text-zinc-400 cursor-pointer"
                >
                  Close Inspector
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleDeleteApplicant(selectedTeamApp)}
                  className="h-9 px-3 text-xs text-red-400 hover:text-red-300 hover:bg-red-500/10 cursor-pointer gap-1"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                  <span>Delete Application</span>
                </Button>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setCrmEmailTo(selectedTeamApp.email);
                  setCrmSubject(`Resolve MUN 2.0 — ${selectedTeamApp.roleType} Application Follow-Up`);
                  setCrmMessageBody(`Dear ${selectedTeamApp.fullName || selectedTeamApp.name || "Candidate"},\n\nWe have reviewed your application for Resolve MUN 2.0.\n\nWarm regards,\nResolve MUN 2.0 Secretariat`);
                  setCrmRecipientMode("SINGLE");
                  setSelectedTeamApp(null);
                  setActiveTab("crm");
                }}
                className="h-9 px-4 text-xs border-white/15 text-white hover:bg-white/10 cursor-pointer gap-1.5"
              >
                <Mail className="h-3.5 w-3.5" />
                <span>Message Applicant in CRM</span>
              </Button>
            </div>
          </div>
        </div>
      )}
    </SidebarProvider>
  );
}
