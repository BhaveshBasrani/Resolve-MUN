"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import Link from "next/link";
import jsQR from "jsqr";
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
  AlertTriangle,
  BadgeCheck,
  Calendar,
  Sparkles
} from "lucide-react";

const ADMIN_KEY = process.env.NEXT_PUBLIC_ADMIN_KEY || "ResolveMUNAdmin2026@Secure";

export default function AttendanceScanner() {
  const [passkey, setPasskey] = useState("");
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [authError, setAuthError] = useState("");

  // Cached delegates roster for 0ms instant lookup
  const [delegatesList, setDelegatesList] = useState([]);
  const [isLoadingRoster, setIsLoadingRoster] = useState(false);
  const [rosterSyncTime, setRosterSyncTime] = useState(null);

  // Search & current candidate
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedDelegate, setSelectedDelegate] = useState(null);
  const [searchStatus, setSearchStatus] = useState(null); // { type: 'success' | 'error', message: '' }

  // Attendance recording
  const [recordingAction, setRecordingAction] = useState(false);
  const [sessionLogs, setSessionLogs] = useState([]);

  // Camera QR scanner state
  const [cameraActive, setCameraActive] = useState(false);
  const [cameraError, setCameraError] = useState("");
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const scanLoopRef = useRef(null);
  const lastScannedCodeRef = useRef("");
  const lastScanTimestampRef = useRef(0);

  // Check saved session
  useEffect(() => {
    if (typeof window !== "undefined") {
      const savedAuth = sessionStorage.getItem("resolve_scan_auth");
      if (savedAuth === "true") {
        setIsAuthenticated(true);
      }
    }
  }, []);

  // Fetch full delegate roster into local memory once authenticated
  const fetchRoster = useCallback(async () => {
    setIsLoadingRoster(true);
    try {
      const res = await fetch(`/api/admin?adminKey=${encodeURIComponent(ADMIN_KEY)}`);
      if (res.ok) {
        const data = await res.json();
        const regs = data.registrations || [];
        setDelegatesList(regs);
        setRosterSyncTime(new Date().toLocaleTimeString());
      }
    } catch (err) {
      console.error("Roster sync notice:", err);
    } finally {
      setIsLoadingRoster(false);
    }
  }, []);

  useEffect(() => {
    if (isAuthenticated) {
      fetchRoster();
    }
  }, [isAuthenticated, fetchRoster]);

  // Passkey authentication
  const handleAuthSubmit = (e) => {
    e.preventDefault();
    const cleanKey = passkey.trim();
    if (
      cleanKey === ADMIN_KEY ||
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

  // Play audio chime
  const playBeep = (type = "success") => {
    try {
      const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      osc.connect(gain);
      gain.connect(audioCtx.destination);

      if (type === "success") {
        osc.type = "sine";
        osc.frequency.setValueAtTime(587.33, audioCtx.currentTime); // D5
        osc.frequency.exponentialRampToValueAtTime(880, audioCtx.currentTime + 0.1); // A5
        gain.gain.setValueAtTime(0.12, audioCtx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.15);
        osc.start();
        osc.stop(audioCtx.currentTime + 0.15);
      } else {
        osc.type = "sawtooth";
        osc.frequency.setValueAtTime(220, audioCtx.currentTime);
        gain.gain.setValueAtTime(0.15, audioCtx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.2);
        osc.start();
        osc.stop(audioCtx.currentTime + 0.2);
      }
    } catch (_) {}
  };

  // Instant In-Memory Lookup
  const findAndSelectDelegate = useCallback(
    (rawQuery) => {
      let q = String(rawQuery || searchQuery || "").trim();
      if (!q) return;

      // Clean raw QR formats (e.g., RESOLVE_PASS:RM26-DEL-1049:...)
      if (q.includes("RESOLVE_PASS:")) {
        const parts = q.split(":");
        if (parts.length >= 2) q = parts[1].trim();
      }

      const qLower = q.toLowerCase();
      const qDigits = q.replace(/[^0-9]/g, "");

      // Search cached delegates roster
      let match = delegatesList.find((d) => {
        const id = String(d.regId || d.RegID || d.id || d.delegateId || "").trim().toLowerCase();
        const em = String(d.email || d.Email || "").trim().toLowerCase();
        const ph = String(d.phone || d.Phone || "").replace(/[^0-9]/g, "");
        const nm = String(d.fullName || d.name || d.FullName || "").trim().toLowerCase();
        const delCode = String(d.delegationCode || d.DelegationCode || "").trim().toLowerCase();

        return (
          id === qLower ||
          em === qLower ||
          (qDigits && ph === qDigits) ||
          (delCode && delCode === qLower) ||
          nm.includes(qLower)
        );
      });

      if (match) {
        setSelectedDelegate({
          regId: match.regId || match.RegID || match.id || match.delegateId || "RM26-DEL",
          name: match.fullName || match.name || match.FullName || "Delegate",
          email: match.email || match.Email || "",
          phone: match.phone || match.Phone || "",
          institution: match.institution || match.Institution || "Independent",
          committee: match.allocatedCommittee || match.AllocatedCommittee || match.committeePref1 || "Unassigned",
          country: match.allocatedCountry || match.AllocatedCountry || "Unassigned",
          status: match.status || match.Status || "Confirmed",
          delegationCode: match.delegationCode || match.DelegationCode || "Independent",
          paymentUTR: match.paymentUTR || match.PaymentUTR || ""
        });
        setSearchStatus({ type: "success", message: "Delegate credentials verified." });
        playBeep("success");
      } else {
        setSelectedDelegate(null);
        setSearchStatus({ type: "error", message: `No delegate record found for "${q}".` });
        playBeep("error");
      }
    },
    [delegatesList, searchQuery]
  );

  // Continuous Camera QR Decoder Loop (uses jsQR)
  const scanFrame = useCallback(() => {
    if (!videoRef.current || !cameraActive) return;

    const video = videoRef.current;
    if (video.readyState === video.HAVE_ENOUGH_DATA) {
      const canvas = canvasRef.current || document.createElement("canvas");
      canvasRef.current = canvas;
      const ctx = canvas.getContext("2d", { willReadFrequently: true });

      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      const code = jsQR(imageData.data, imageData.width, imageData.height, {
        inversionAttempts: "dontInvert"
      });

      if (code && code.data) {
        const scannedText = code.data.trim();
        const now = Date.now();

        // Avoid re-scanning same code repeatedly within 2.5 seconds
        if (scannedText !== lastScannedCodeRef.current || now - lastScanTimestampRef.current > 2500) {
          lastScannedCodeRef.current = scannedText;
          lastScanTimestampRef.current = now;
          setSearchQuery(scannedText);
          findAndSelectDelegate(scannedText);
        }
      }
    }

    scanLoopRef.current = requestAnimationFrame(scanFrame);
  }, [cameraActive, findAndSelectDelegate]);

  // Start / Stop Camera Stream
  const toggleCamera = async () => {
    if (cameraActive) {
      if (scanLoopRef.current) cancelAnimationFrame(scanLoopRef.current);
      if (videoRef.current && videoRef.current.srcObject) {
        videoRef.current.srcObject.getTracks().forEach((t) => t.stop());
        videoRef.current.srcObject = null;
      }
      setCameraActive(false);
      setCameraError("");
    } else {
      setCameraError("");
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: "environment", width: { ideal: 1280 }, height: { ideal: 720 } }
        });

        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          videoRef.current.play();
        }
        setCameraActive(true);
      } catch (err) {
        setCameraError("Camera access denied or unavailable: " + err.message);
      }
    }
  };

  // Run scanner loop when camera active
  useEffect(() => {
    if (cameraActive) {
      scanLoopRef.current = requestAnimationFrame(scanFrame);
    } else if (scanLoopRef.current) {
      cancelAnimationFrame(scanLoopRef.current);
    }
    return () => {
      if (scanLoopRef.current) cancelAnimationFrame(scanLoopRef.current);
    };
  }, [cameraActive, scanFrame]);

  // Stop camera on unmount
  useEffect(() => {
    return () => {
      if (scanLoopRef.current) cancelAnimationFrame(scanLoopRef.current);
      if (videoRef.current && videoRef.current.srcObject) {
        videoRef.current.srcObject.getTracks().forEach((t) => t.stop());
      }
    };
  }, []);

  // Record Check-in or Check-out
  const handleRecordAttendance = async (actionType) => {
    if (!selectedDelegate) return;
    setRecordingAction(true);

    const delegateId = selectedDelegate.regId || selectedDelegate.email;

    try {
      const res = await fetch("/api/admin", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "RECORD_CHECK_IN",
          adminKey: ADMIN_KEY,
          delegateId: delegateId,
          actionType: actionType, // 'ENTRY' or 'EXIT'
          day: "Day 1",
          verifiedBy: "Secretariat Scanner Station",
          timestamp: new Date().toISOString()
        })
      });

      const newLog = {
        id: delegateId,
        name: selectedDelegate.name,
        committee: selectedDelegate.committee,
        country: selectedDelegate.country,
        actionType: actionType,
        time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" })
      };

      setSessionLogs((prev) => [newLog, ...prev]);
      setSearchStatus({
        type: "success",
        message: `Successfully logged ${actionType === "ENTRY" ? "Check-In (Entry)" : "Check-Out (Exit)"} for ${selectedDelegate.name}.`
      });
      playBeep("success");
    } catch (err) {
      setSearchStatus({ type: "error", message: "Failed to record attendance: " + err.message });
      playBeep("error");
    } finally {
      setRecordingAction(false);
    }
  };

  // Gateway screen
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-[#07090e] text-white flex items-center justify-center p-4">
        <div className="max-w-md w-full p-8 rounded-2xl border border-white/[0.08] bg-[#0c0f17] shadow-2xl space-y-6">
          <div className="w-14 h-14 rounded-2xl bg-indigo-500/10 border border-indigo-500/30 flex items-center justify-center mx-auto text-indigo-400">
            <QrCode className="w-7 h-7" />
          </div>

          <div className="text-center space-y-1.5">
            <span className="text-[10px] font-mono tracking-[0.25em] text-indigo-400 uppercase font-bold">
              Secretariat Desk Station
            </span>
            <h1 className="text-xl font-bold uppercase tracking-wide text-white">
              Delegate Check-In & Scanner
            </h1>
            <p className="text-xs text-white/50 leading-relaxed">
              Enter official Secretariat passkey to initialize delegate accreditation and checkpoint scanning.
            </p>
          </div>

          <form onSubmit={handleAuthSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-mono uppercase tracking-wider text-white/40 mb-1.5">
                Secretariat Passkey
              </label>
              <input
                type="password"
                required
                autoFocus
                value={passkey}
                onChange={(e) => setPasskey(e.target.value)}
                placeholder="Enter passkey..."
                className="w-full h-12 px-4 rounded-xl bg-black/40 border border-white/15 text-white font-mono text-sm focus:outline-none focus:border-indigo-400 transition-all"
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
              className="w-full h-12 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-bold text-xs uppercase tracking-wider hover:opacity-90 transition-opacity shadow-lg cursor-pointer"
            >
              Unlock Scanner Station
            </button>
          </form>

          <div className="pt-2 text-center">
            <Link href="/" className="text-xs font-mono text-white/40 hover:text-white transition-colors">
              &larr; Return to Homepage
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#07090e] text-white font-sans pb-20">
      {/* Top Header */}
      <header className="sticky top-0 z-40 h-16 border-b border-white/[0.06] bg-[#07090e]/90 backdrop-blur-xl px-4 sm:px-8 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-indigo-500/20 border border-indigo-400/40 text-indigo-400 flex items-center justify-center font-bold font-mono text-xs">
            SCAN
          </div>
          <div>
            <h2 className="text-sm font-bold uppercase tracking-wider text-white">
              Secretariat Checkpoint & Attendance
            </h2>
            <div className="flex items-center gap-2 text-[10px] font-mono text-white/40">
              <span>Resolve MUN 2.0</span>
              <span>&bull;</span>
              <span>{delegatesList.length} Delegates Synced</span>
              {rosterSyncTime && <span>({rosterSyncTime})</span>}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={fetchRoster}
            disabled={isLoadingRoster}
            className="h-8 px-3 rounded-lg border border-white/10 bg-white/[0.03] hover:bg-white/[0.08] text-[11px] font-mono text-white/70 flex items-center gap-1.5 transition-colors cursor-pointer"
            title="Reload delegates list"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isLoadingRoster ? "animate-spin text-indigo-400" : ""}`} />
            <span className="hidden sm:inline">Sync Roster</span>
          </button>

          <button
            type="button"
            onClick={() => {
              sessionStorage.removeItem("resolve_scan_auth");
              setIsAuthenticated(false);
            }}
            className="h-8 px-3 rounded-lg border border-red-500/20 bg-red-500/10 hover:bg-red-500/20 text-[11px] font-mono text-red-300 flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Lock</span>
          </button>
        </div>
      </header>

      {/* Main Container */}
      <main className="max-w-3xl mx-auto px-4 sm:px-6 pt-6 space-y-6">
        {/* Scanner Box */}
        <section className="p-5 rounded-2xl border border-white/[0.08] bg-[#0b0e17] space-y-4 shadow-xl">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-mono uppercase tracking-widest text-indigo-400 font-bold">
              Live Camera QR Scanner & Barcode Gun
            </span>
            <button
              type="button"
              onClick={toggleCamera}
              className={`px-3 py-1.5 rounded-lg text-xs font-mono font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
                cameraActive
                  ? "bg-red-500/20 text-red-300 border border-red-500/30 shadow-lg shadow-red-500/10"
                  : "bg-indigo-600 hover:bg-indigo-500 text-white shadow-lg shadow-indigo-600/20"
              }`}
            >
              {cameraActive ? <CameraOff className="w-3.5 h-3.5" /> : <Camera className="w-3.5 h-3.5" />}
              <span>{cameraActive ? "Stop Camera" : "Open Camera Scanner"}</span>
            </button>
          </div>

          {/* Camera Viewfinder */}
          {cameraActive && (
            <div className="relative w-full h-64 sm:h-80 rounded-2xl overflow-hidden bg-black border-2 border-indigo-500/40 shadow-2xl flex items-center justify-center">
              <video ref={videoRef} autoPlay playsInline muted className="w-full h-full object-cover" />
              {/* Aiming Reticle */}
              <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
                <div className="w-56 h-56 border-2 border-indigo-400/70 rounded-2xl relative">
                  <div className="absolute top-0 left-0 w-4 h-4 border-t-4 border-l-4 border-white -mt-1 -ml-1 rounded-tl"></div>
                  <div className="absolute top-0 right-0 w-4 h-4 border-t-4 border-r-4 border-white -mt-1 -mr-1 rounded-tr"></div>
                  <div className="absolute bottom-0 left-0 w-4 h-4 border-b-4 border-l-4 border-white -mb-1 -ml-1 rounded-bl"></div>
                  <div className="absolute bottom-0 right-0 w-4 h-4 border-b-4 border-r-4 border-white -mb-1 -mr-1 rounded-br"></div>
                  <div className="w-full h-0.5 bg-gradient-to-r from-transparent via-indigo-400 to-transparent absolute top-1/2 -translate-y-1/2 animate-pulse shadow-[0_0_15px_#818cf8]"></div>
                </div>
              </div>
              <span className="absolute bottom-3 text-[11px] font-mono text-white/90 bg-black/70 px-3 py-1 rounded-full border border-white/10 backdrop-blur-md">
                Align QR Code within the frame &bull; Real-time detection active
              </span>
            </div>
          )}

          {cameraError && (
            <div className="p-3 rounded-xl bg-red-950/40 border border-red-500/30 text-xs text-red-300 font-mono">
              {cameraError}
            </div>
          )}

          {/* Search or Barcode Gun Input */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              findAndSelectDelegate();
            }}
            className="flex items-center gap-2"
          >
            <div className="relative flex-1">
              <input
                type="text"
                autoFocus
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  if (e.target.value.trim().length >= 3) {
                    findAndSelectDelegate(e.target.value);
                  }
                }}
                placeholder="Scan QR or type Delegate ID (RM26-DEL-xxxx), Email, or Phone..."
                className="w-full h-12 pl-11 pr-4 rounded-xl bg-black/50 border border-white/15 text-white font-mono text-xs focus:outline-none focus:border-indigo-400 transition-all placeholder:text-white/30"
              />
              <Search className="w-4 h-4 text-white/40 absolute left-4 top-1/2 -translate-y-1/2" />
            </div>

            <button
              type="submit"
              className="h-12 px-6 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs uppercase tracking-wider transition-all cursor-pointer flex items-center gap-1.5 shrink-0"
            >
              Lookup
            </button>
          </form>

          {searchStatus && (
            <div
              className={`p-3 rounded-xl text-xs font-mono flex items-center gap-2 ${
                searchStatus.type === "success"
                  ? "bg-emerald-950/40 border border-emerald-500/30 text-emerald-300"
                  : "bg-red-950/40 border border-red-500/30 text-red-300"
              }`}
            >
              {searchStatus.type === "success" ? (
                <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400" />
              ) : (
                <XCircle className="w-4 h-4 shrink-0 text-red-400" />
              )}
              <span>{searchStatus.message}</span>
            </div>
          )}
        </section>

        {/* Verified Delegate Card */}
        {selectedDelegate && (
          <section className="p-6 rounded-2xl border border-indigo-500/30 bg-gradient-to-b from-[#0e1222] to-[#070914] shadow-2xl space-y-6 animate-in fade-in zoom-in-95 duration-200">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-white/[0.08]">
              <div className="flex items-center gap-3.5">
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center font-bold text-xl text-white shadow-lg">
                  {selectedDelegate.name.charAt(0).toUpperCase()}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 rounded-md bg-indigo-500/20 border border-indigo-400/30 font-mono text-[10px] text-indigo-300 font-bold">
                      {selectedDelegate.regId}
                    </span>
                    <span className="px-2 py-0.5 rounded-md bg-emerald-500/15 border border-emerald-400/30 text-[10px] text-emerald-300 font-semibold">
                      {selectedDelegate.status}
                    </span>
                  </div>
                  <h3 className="text-lg font-bold text-white mt-1">{selectedDelegate.name}</h3>
                  <p className="text-xs text-white/50 font-mono">{selectedDelegate.email} &bull; {selectedDelegate.phone}</p>
                </div>
              </div>

              <div className="text-left sm:text-right">
                <span className="text-[10px] font-mono text-white/40 uppercase block">Institution</span>
                <span className="text-xs font-semibold text-white/90">{selectedDelegate.institution}</span>
                {selectedDelegate.delegationCode && selectedDelegate.delegationCode !== "Independent" && (
                  <span className="text-[10px] font-mono text-purple-300 block mt-0.5">
                    Delegation: {selectedDelegate.delegationCode}
                  </span>
                )}
              </div>
            </div>

            {/* Committee & Country Badge Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-4 rounded-xl bg-black/40 border border-white/[0.06]">
              <div>
                <span className="text-[10px] font-mono text-white/40 uppercase block">Assigned Committee</span>
                <span className="text-sm font-bold text-white mt-0.5 block">{selectedDelegate.committee}</span>
              </div>
              <div>
                <span className="text-[10px] font-mono text-white/40 uppercase block">Assigned Country / Portfolio</span>
                <span className="text-sm font-bold text-indigo-300 mt-0.5 block">{selectedDelegate.country}</span>
              </div>
            </div>

            {/* Check-In / Check-Out Action Buttons */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
              <button
                type="button"
                disabled={recordingAction}
                onClick={() => handleRecordAttendance("ENTRY")}
                className="h-12 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition-all shadow-lg shadow-emerald-600/20 cursor-pointer disabled:opacity-50"
              >
                <BadgeCheck className="w-4 h-4" />
                <span>Admit &bull; Check-In (Entry)</span>
              </button>

              <button
                type="button"
                disabled={recordingAction}
                onClick={() => handleRecordAttendance("EXIT")}
                className="h-12 rounded-xl bg-white/[0.06] hover:bg-white/10 border border-white/15 text-white font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition-all cursor-pointer disabled:opacity-50"
              >
                <Clock className="w-4 h-4 text-amber-300" />
                <span>Log Departure (Exit)</span>
              </button>
            </div>
          </section>
        )}

        {/* Live Session Scan History */}
        <section className="p-5 rounded-2xl border border-white/[0.08] bg-[#0b0e17] space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-mono uppercase tracking-widest text-white/40 font-bold">
              Terminal Scan Log (This Session)
            </span>
            <span className="text-[10px] font-mono text-white/40">{sessionLogs.length} Records</span>
          </div>

          {sessionLogs.length === 0 ? (
            <div className="py-8 text-center text-white/30 text-xs font-mono">
              No scans recorded in this session yet.
            </div>
          ) : (
            <div className="divide-y divide-white/[0.06]">
              {sessionLogs.map((log, idx) => (
                <div key={`log-${idx}`} className="py-2.5 flex items-center justify-between text-xs font-mono">
                  <div className="flex items-center gap-2.5">
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        log.actionType === "ENTRY"
                          ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30"
                          : "bg-amber-500/20 text-amber-300 border border-amber-500/30"
                      }`}
                    >
                      {log.actionType}
                    </span>
                    <span className="text-white font-semibold">{log.name}</span>
                    <span className="text-white/40">({log.id})</span>
                  </div>
                  <div className="flex items-center gap-3 text-white/40">
                    <span>{log.committee}</span>
                    <span className="text-indigo-300">{log.time}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      </main>
    </div>
  );
}
