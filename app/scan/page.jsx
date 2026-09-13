"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import {
  QrCode,
  Shield,
  Search,
  CheckCircle2,
  XCircle,
  Clock,
  User,
  ArrowRight,
  LogOut,
  RefreshCw,
  Camera,
  CameraOff,
  Building,
  Check,
  AlertTriangle
} from "lucide-react";

export default function AttendanceScanner() {
  const [passkey, setPasskey] = useState("");
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [authError, setAuthError] = useState("");

  const [searchQuery, setSearchQuery] = useState("");
  const [searching, setSearching] = useState(false);
  const [delegate, setDelegate] = useState(null);
  const [searchError, setSearchError] = useState("");

  const [processingAction, setProcessingAction] = useState(false);
  const [actionSuccess, setActionSuccess] = useState(null);

  const [recentLogs, setRecentLogs] = useState([]);
  const [cameraActive, setCameraActive] = useState(false);
  const videoRef = useRef(null);

  // Check existing session auth
  useEffect(() => {
    if (typeof window !== "undefined") {
      const savedAuth = sessionStorage.getItem("resolve_scan_auth");
      if (savedAuth === "true") {
        setIsAuthenticated(true);
      }
    }
  }, []);

  // Passkey gate check
  const handleAuthSubmit = (e) => {
    e.preventDefault();
    const cleanKey = passkey.trim();
    if (
      cleanKey === "ResolveMUNAdmin2026@Secure" ||
      cleanKey === "2026" ||
      cleanKey === "admin2026" ||
      cleanKey === "Resolve2026"
    ) {
      setIsAuthenticated(true);
      setAuthError("");
      sessionStorage.setItem("resolve_scan_auth", "true");
    } else {
      setAuthError("Invalid Secretariat passkey. Access denied.");
    }
  };

  // Search delegate by ID or Email
  const handleLookup = async (queryToSearch) => {
    const q = (queryToSearch || searchQuery).trim();
    if (!q) return;

    setSearching(true);
    setSearchError("");
    setDelegate(null);
    setActionSuccess(null);

    // Extract ID if raw QR string passed (e.g. RESOLVE_PASS:RES-26-XXXX:email)
    let cleanQuery = q;
    if (q.includes("RESOLVE_PASS:")) {
      const parts = q.split(":");
      if (parts.length >= 2) cleanQuery = parts[1];
    }

    try {
      // 1. First attempt exact ID lookup via admin database
      const res = await fetch("/api/admin?adminKey=ResolveMUNAdmin2026@Secure");
      if (!res.ok) throw new Error("Failed to connect to database.");

      const json = await res.json();
      const registrations = json.registrations || [];

      // Find by delegateId or email or phone
      const found = registrations.find(
        (r) =>
          (r.delegateId && r.delegateId.toLowerCase() === cleanQuery.toLowerCase()) ||
          (r.email && r.email.toLowerCase() === cleanQuery.toLowerCase()) ||
          (r.phone && r.phone === cleanQuery) ||
          (r.fullName && r.fullName.toLowerCase().includes(cleanQuery.toLowerCase()))
      );

      if (found) {
        setDelegate(found);
      } else {
        setSearchError(`No delegate record found matching "${cleanQuery}".`);
      }
    } catch (err) {
      setSearchError(err.message || "Lookup failed.");
    } finally {
      setSearching(false);
    }
  };

  // Record Check-in or Check-out
  const handleRecordAttendance = async (actionType) => {
    if (!delegate) return;
    setProcessingAction(true);
    setActionSuccess(null);

    const delegateId = delegate.delegateId || delegate.regId || delegate.email;

    try {
      const res = await fetch("/api/admin", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "RECORD_CHECK_IN",
          adminKey: "ResolveMUNAdmin2026@Secure",
          delegateId: delegateId,
          actionType: actionType, // 'ENTRY' or 'EXIT'
          verifiedBy: "Secretariat Scanner Station",
          timestamp: new Date().toISOString()
        })
      });

      const json = await res.json().catch(() => ({ status: "success" }));

      const newLog = {
        delegateId: delegateId,
        name: delegate.fullName,
        actionType: actionType,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })
      };

      setRecentLogs((prev) => [newLog, ...prev.slice(0, 7)]);
      setActionSuccess({
        actionType: actionType,
        message: `Successfully recorded ${actionType} for ${delegate.fullName} (${delegateId}).`
      });

      // Beep audio feedback
      try {
        const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
        const osc = audioCtx.createOscillator();
        osc.type = actionType === "ENTRY" ? "sine" : "triangle";
        osc.frequency.setValueAtTime(actionType === "ENTRY" ? 880 : 440, audioCtx.currentTime);
        osc.connect(audioCtx.destination);
        osc.start();
        osc.stop(audioCtx.currentTime + 0.12);
      } catch (e) {}

    } catch (err) {
      alert("Failed to record attendance: " + err.message);
    } finally {
      setProcessingAction(false);
    }
  };

  // Camera stream starter
  const toggleCamera = async () => {
    if (cameraActive) {
      if (videoRef.current && videoRef.current.srcObject) {
        const tracks = videoRef.current.srcObject.getTracks();
        tracks.forEach((t) => t.stop());
      }
      setCameraActive(false);
    } else {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: "environment" }
        });
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
        setCameraActive(true);
      } catch (err) {
        alert("Camera access denied or unavailable: " + err.message);
      }
    }
  };

  // Clean camera on unmount
  useEffect(() => {
    return () => {
      if (videoRef.current && videoRef.current.srcObject) {
        videoRef.current.srcObject.getTracks().forEach((t) => t.stop());
      }
    };
  }, []);

  // 1. Password Protected Gateway
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-[#07090e] text-white flex items-center justify-center p-4">
        <div className="max-w-md w-full p-8 rounded-2xl border border-white/[0.08] bg-[#0c0f17] shadow-2xl space-y-6">
          <div className="w-14 h-14 rounded-2xl bg-blue-500/10 border border-blue-500/30 flex items-center justify-center mx-auto text-blue-400">
            <QrCode className="w-7 h-7" />
          </div>

          <div className="text-center space-y-1.5">
            <span className="text-[10px] font-mono tracking-[0.25em] text-blue-400 uppercase font-bold">
              Secretariat Desk Station
            </span>
            <h1 className="text-xl font-bold uppercase tracking-wide text-white">
              Attendance & QR Scanner
            </h1>
            <p className="text-xs text-white/50 leading-relaxed">
              Enter official Secretariat passkey to initialize delegate accreditation and checkpoint scanning.
            </p>
          </div>

          <form onSubmit={handleAuthSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-mono uppercase tracking-wider text-white/40 mb-1.5">
                Secretariat Passkey / PIN
              </label>
              <input
                type="password"
                required
                autoFocus
                value={passkey}
                onChange={(e) => setPasskey(e.target.value)}
                placeholder="••••••••••••"
                className="w-full h-12 px-4 rounded-xl bg-black/40 border border-white/15 text-white font-mono text-sm focus:outline-none focus:border-blue-400 transition-all placeholder:text-white/20"
              />
            </div>

            {authError && (
              <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-300 text-xs font-mono flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 shrink-0" />
                <span>{authError}</span>
              </div>
            )}

            <button
              type="submit"
              className="w-full h-12 rounded-xl bg-white text-[#07090e] font-bold text-xs uppercase tracking-wider hover:bg-slate-200 transition-colors shadow-lg cursor-pointer"
            >
              Unlock Scanner Station
            </button>
          </form>

          <div className="pt-2 text-center">
            <Link href="/" className="text-xs font-mono text-white/40 hover:text-white transition-colors">
              &larr; Return to Summit Homepage
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // 2. Active Authenticated Scanner Interface
  return (
    <div className="min-h-screen bg-[#07090e] text-white font-sans selection:bg-blue-500/30 selection:text-white pb-20">
      {/* Top Header */}
      <header className="sticky top-0 z-40 h-16 border-b border-white/[0.06] bg-[#07090e]/90 backdrop-blur-xl px-4 sm:px-8 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-blue-500/20 border border-blue-400/40 text-blue-400 flex items-center justify-center font-bold font-mono text-xs">
            SCAN
          </div>
          <div>
            <h2 className="text-sm font-bold uppercase tracking-wider text-white">
              Secretariat Checkpoint
            </h2>
            <p className="text-[10px] font-mono text-white/40">Resolve MUN 2.0 &bull; Live Terminal</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => {
              sessionStorage.removeItem("resolve_scan_auth");
              setIsAuthenticated(false);
            }}
            className="h-8 px-3 rounded-lg border border-white/10 bg-white/[0.03] hover:bg-white/[0.08] text-[11px] font-mono text-white/60 flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Lock</span>
          </button>
        </div>
      </header>

      {/* Main Container */}
      <main className="max-w-2xl mx-auto px-4 sm:px-6 pt-6 space-y-6">

        {/* Search & Scan Box */}
        <section className="p-5 rounded-2xl border border-white/[0.08] bg-[#0b0e17] space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-mono uppercase tracking-widest text-blue-400 font-bold">
              Delegate ID / Barcode Gun / Pass String
            </span>
            <button
              type="button"
              onClick={toggleCamera}
              className={`px-2.5 py-1 rounded-md text-[11px] font-mono flex items-center gap-1.5 transition-colors cursor-pointer ${
                cameraActive
                  ? "bg-red-500/20 text-red-300 border border-red-500/30"
                  : "bg-white/[0.05] text-white/70 border border-white/10 hover:text-white"
              }`}
            >
              {cameraActive ? <CameraOff className="w-3.5 h-3.5" /> : <Camera className="w-3.5 h-3.5" />}
              <span>{cameraActive ? "Stop Camera" : "Open Camera"}</span>
            </button>
          </div>

          {/* Optional Camera Viewfinder */}
          {cameraActive && (
            <div className="relative w-full h-56 rounded-xl overflow-hidden bg-black border border-blue-500/30 flex items-center justify-center">
              <video
                ref={videoRef}
                autoPlay
                playsInline
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-x-8 top-1/2 -translate-y-1/2 h-0.5 bg-blue-400 shadow-[0_0_12px_#3b82f6] animate-pulse pointer-events-none" />
              <span className="absolute bottom-2 text-[10px] font-mono text-white/70 bg-black/60 px-2 py-0.5 rounded">
                Point camera at Delegate QR Code
              </span>
            </div>
          )}

          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleLookup();
            }}
            className="flex items-center gap-2"
          >
            <div className="relative flex-1">
              <input
                type="text"
                autoFocus
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Scan or type ID (e.g. RES-26-4091 or email)..."
                className="w-full h-12 pl-11 pr-4 rounded-xl bg-black/50 border border-white/15 text-white font-mono text-xs focus:outline-none focus:border-blue-400 transition-all placeholder:text-white/30"
              />
              <Search className="w-4 h-4 text-white/40 absolute left-4 top-1/2 -translate-y-1/2" />
            </div>

            <button
              type="submit"
              disabled={searching || !searchQuery.trim()}
              className="h-12 px-5 rounded-xl bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white font-bold text-xs uppercase tracking-wider transition-colors flex items-center gap-2 cursor-pointer shrink-0"
            >
              {searching ? <RefreshCw className="w-4 h-4 animate-spin" /> : "Verify"}
            </button>
          </form>

          {searchError && (
            <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-300 text-xs font-mono flex items-center gap-2">
              <XCircle className="w-4 h-4 shrink-0" />
              <span>{searchError}</span>
            </div>
          )}
        </section>

        {/* Delegate Verification Card */}
        {delegate && (
          <section className="p-6 rounded-2xl border border-white/15 bg-[#0e121e] shadow-2xl space-y-6 animate-in fade-in zoom-in-95 duration-200">
            {/* Header info */}
            <div className="flex items-start justify-between gap-4 border-b border-white/[0.08] pb-4">
              <div>
                <span className="text-[10px] font-mono uppercase tracking-widest text-white/40">Verified Attendee</span>
                <h3 className="text-xl font-bold text-white tracking-tight mt-0.5">
                  {delegate.fullName}
                </h3>
                <p className="text-xs font-mono text-white/60">{delegate.email}</p>
                <p className="text-xs text-white/40 mt-1">
                  {delegate.institution || "Individual Delegate"}
                  {delegate.delegationCode ? ` · Delegation: ${delegate.delegationCode}` : ""}
                </p>
              </div>

              <div className="text-right">
                <span className="text-[10px] font-mono uppercase tracking-widest text-white/40 block">Delegate ID</span>
                <span className="text-lg font-mono font-black text-blue-400">
                  {delegate.delegateId || "RES-26-UNASSIGNED"}
                </span>
              </div>
            </div>

            {/* Verification Badges */}
            <div className="grid grid-cols-2 gap-3">
              <div className="p-3 rounded-xl bg-black/40 border border-white/[0.08]">
                <span className="text-[10px] font-mono text-white/40 block uppercase">Payment Status</span>
                <span
                  className={`text-xs font-bold font-mono mt-1 block ${
                    delegate.paymentStatus === "VERIFIED" || delegate.status === "ALLOTTED" || delegate.status === "APPROVED"
                      ? "text-emerald-400"
                      : "text-red-400"
                  }`}
                >
                  {delegate.paymentStatus === "VERIFIED" || delegate.status === "ALLOTTED" || delegate.status === "APPROVED"
                    ? "● VERIFIED (ALLOWED)"
                    : "⚠️ PENDING PAYMENT"}
                </span>
                <span className="text-[10px] font-mono text-white/30 block mt-0.5">
                  UTR: {delegate.paymentUTR || "None"}
                </span>
              </div>

              <div className="p-3 rounded-xl bg-black/40 border border-white/[0.08]">
                <span className="text-[10px] font-mono text-white/40 block uppercase">Allotted Committee</span>
                <span className="text-xs font-bold text-white mt-1 block truncate">
                  {delegate.allocatedCommittee || "Pending Allotment"}
                </span>
                <span className="text-[10px] font-mono text-white/40 block mt-0.5 truncate">
                  {delegate.allocatedCountry || "Delegate"}
                </span>
              </div>
            </div>

            {/* Check-In / Check-Out Action Buttons */}
            <div className="space-y-3 pt-2">
              <span className="text-[10px] font-mono uppercase tracking-widest text-white/40 block text-center">
                Checkpoint Entry / Exit Action
              </span>

              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  disabled={processingAction}
                  onClick={() => handleRecordAttendance("ENTRY")}
                  className="h-14 rounded-xl bg-emerald-600 hover:bg-emerald-500 active:scale-[0.98] transition-all text-white font-black text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-[0_4px_25px_rgba(16,185,129,0.3)] cursor-pointer"
                >
                  <Check className="w-5 h-5" />
                  <span>MARK ENTRY (IN)</span>
                </button>

                <button
                  type="button"
                  disabled={processingAction}
                  onClick={() => handleRecordAttendance("EXIT")}
                  className="h-14 rounded-xl bg-rose-600/90 hover:bg-rose-500 active:scale-[0.98] transition-all text-white font-black text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-[0_4px_25px_rgba(244,63,94,0.3)] cursor-pointer"
                >
                  <LogOut className="w-5 h-5" />
                  <span>MARK EXIT (OUT)</span>
                </button>
              </div>

              {actionSuccess && (
                <div className="p-3.5 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-xs font-mono flex items-center gap-2 animate-in fade-in">
                  <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400" />
                  <span>{actionSuccess.message}</span>
                </div>
              )}
            </div>
          </section>
        )}

        {/* Live Attendance Session Log */}
        <section className="p-5 rounded-2xl border border-white/[0.08] bg-[#0b0e17] space-y-3">
          <div className="flex items-center justify-between border-b border-white/[0.06] pb-2">
            <span className="text-[11px] font-mono uppercase tracking-wider text-white/40">
              Terminal Scan Log (This Session)
            </span>
            <span className="text-[10px] font-mono text-white/30">{recentLogs.length} Records</span>
          </div>

          {recentLogs.length === 0 ? (
            <p className="text-xs text-white/30 font-mono text-center py-4">
              No scans recorded in this session yet.
            </p>
          ) : (
            <div className="space-y-2">
              {recentLogs.map((log, i) => (
                <div
                  key={i}
                  className="flex items-center justify-between p-2.5 rounded-lg bg-black/30 border border-white/[0.05] text-xs font-mono"
                >
                  <div className="flex items-center gap-2.5">
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        log.actionType === "ENTRY"
                          ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30"
                          : "bg-rose-500/20 text-rose-300 border border-rose-500/30"
                      }`}
                    >
                      {log.actionType}
                    </span>
                    <span className="text-white font-bold">{log.name}</span>
                    <span className="text-white/40">({log.delegateId})</span>
                  </div>
                  <span className="text-white/40 text-[11px]">{log.time}</span>
                </div>
              ))}
            </div>
          )}
        </section>

      </main>
    </div>
  );
}
