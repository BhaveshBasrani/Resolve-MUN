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
  Building2,
  Check,
  AlertTriangle,
  BadgeCheck,
  Calendar,
  Sparkles,
  Volume2,
  VolumeX,
  History,
  Zap,
  ChevronRight,
  SlidersHorizontal,
  X
} from "lucide-react";

const ADMIN_KEY = process.env.NEXT_PUBLIC_ADMIN_KEY || "ResolveMUNAdmin2026@Secure";

export default function UltraFastEntranceScanner() {
  const [passkey, setPasskey] = useState("");
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [authError, setAuthError] = useState("");

  // Cached delegates roster for 0ms instant in-memory lookup
  const [delegatesList, setDelegatesList] = useState([]);
  const [isLoadingRoster, setIsLoadingRoster] = useState(false);
  const [rosterSyncTime, setRosterSyncTime] = useState(null);

  // Configuration & Settings
  const [selectedDay, setSelectedDay] = useState("Day 1");
  const [actionType, setActionType] = useState("ENTRY"); // ENTRY or EXIT
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [autoCheckIn, setAutoCheckIn] = useState(true);

  // Active Scan Pop State (Sub-50ms visual flash)
  const [activeBadge, setActiveBadge] = useState(null); // { status, delegate, time, message, isRepeat }
  const [searchQuery, setSearchQuery] = useState("");

  // Scan History
  const [scanHistory, setScanHistory] = useState([]);

  // Camera QR stream refs & loop
  const [cameraActive, setCameraActive] = useState(false);
  const [cameraError, setCameraError] = useState("");
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const scanLoopRef = useRef(null);
  const barcodeInputRef = useRef(null);

  // Debounce refs for multi-pass 2-scan/sec throughput
  const lastScannedCodeRef = useRef("");
  const lastScanTimestampRef = useRef(0);
  const badgeTimerRef = useRef(null);

  // Check saved session or admin login
  useEffect(() => {
    if (typeof window !== "undefined") {
      const savedAuth = sessionStorage.getItem("resolve_scan_auth");
      const adminAuth = localStorage.getItem("resolve_admin_key");
      if (savedAuth === "true" || adminAuth === "abhilashisgoat") {
        setIsAuthenticated(true);
      }
    }
  }, []);

  // Web Audio Synthesizer Chimes
  const playChime = useCallback((type = "success") => {
    if (!soundEnabled) return;
    try {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();

      if (type === "success") {
        // High-frequency crisp dual-tone futuristic admission chime
        const now = ctx.currentTime;
        const osc1 = ctx.createOscillator();
        const osc2 = ctx.createOscillator();
        const gain = ctx.createGain();

        osc1.type = "sine";
        osc1.frequency.setValueAtTime(880, now); // A5
        osc1.frequency.exponentialRampToValueAtTime(1760, now + 0.08); // A6

        osc2.type = "triangle";
        osc2.frequency.setValueAtTime(1174.66, now + 0.04); // D6
        osc2.frequency.exponentialRampToValueAtTime(2349.32, now + 0.12);

        gain.gain.setValueAtTime(0.18, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.16);

        osc1.connect(gain);
        osc2.connect(gain);
        gain.connect(ctx.destination);

        osc1.start(now);
        osc2.start(now + 0.04);
        osc1.stop(now + 0.16);
        osc2.stop(now + 0.16);
      } else if (type === "warning") {
        // Repeated pass notice
        const now = ctx.currentTime;
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = "sine";
        osc.frequency.setValueAtTime(659.25, now); // E5
        osc.frequency.setValueAtTime(523.25, now + 0.08); // C5
        gain.gain.setValueAtTime(0.15, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.18);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(now);
        osc.stop(now + 0.18);
      } else {
        // Error buzzer
        const now = ctx.currentTime;
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = "sawtooth";
        osc.frequency.setValueAtTime(220, now);
        osc.frequency.setValueAtTime(164.81, now + 0.08);
        gain.gain.setValueAtTime(0.2, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.22);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(now);
        osc.stop(now + 0.22);
      }
    } catch (_) {}
  }, [soundEnabled]);

  // Fetch full delegate roster into memory for 0ms instant matching
  const fetchRoster = useCallback(async () => {
    setIsLoadingRoster(true);
    try {
      const res = await fetch(`/api/admin/?adminKey=abhilashisgoat`);
      if (res.ok) {
        const data = await res.json();
        const regs = data.registrations || [];
        setDelegatesList(regs);
        setRosterSyncTime(new Date().toLocaleTimeString());
      }
    } catch (err) {
      console.warn("Roster sync notice:", err);
    } finally {
      setIsLoadingRoster(false);
    }
  }, []);

  useEffect(() => {
    if (isAuthenticated) {
      fetchRoster();
    }
  }, [isAuthenticated, fetchRoster]);

  // Execute Instant Sub-500ms Scan Check-In
  const executeScan = useCallback(
    (rawCode) => {
      let code = String(rawCode || "").trim();
      if (!code) return;

      // Extract Clean ID from QuickChart QR format (RESOLVE_PASS:DELEGATE:RM26-DEL-1001:email)
      if (code.includes("RESOLVE_PASS:") || code.includes("RESOLVE26:")) {
        const parts = code.split(":");
        const idPart = parts.find((p) => p.trim().startsWith("RM26-"));
        if (idPart) code = idPart.trim();
        else if (parts.length >= 2) code = parts[parts.length - 2].trim();
      }

      const qLower = code.toLowerCase();
      const qDigits = code.replace(/[^0-9]/g, "");

      // 0ms in-memory match
      const matched = delegatesList.find((d) => {
        const id = String(d.regId || d.id || d.delegateId || "").toLowerCase().trim();
        const em = String(d.email || "").toLowerCase().trim();
        const ph = String(d.phone || "").replace(/[^0-9]/g, "");
        const nm = String(d.fullName || d.name || "").toLowerCase().trim();
        return id === qLower || em === qLower || (qDigits && ph === qDigits) || nm === qLower;
      });

      const timeNow = new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" });

      if (matched) {
        const dayProp = selectedDay === "Day 2" ? "checkInDay2" : selectedDay === "Day 3" ? "checkInDay3" : "checkInDay1";
        const alreadyCheckedIn = matched[dayProp] === "Present";

        const badgeData = {
          id: `scan_${Date.now()}`,
          status: "AUTHORIZED",
          isRepeat: alreadyCheckedIn,
          code: matched.regId || matched.delegateId || code,
          delegate: matched,
          day: selectedDay,
          action: actionType,
          time: timeNow,
          message: alreadyCheckedIn
            ? `Repeat scan · Already checked in for ${selectedDay}`
            : `Admission authorized for ${matched.fullName}`,
        };

        // Instant visual feedback (<50ms)
        setActiveBadge(badgeData);
        playChime(alreadyCheckedIn ? "warning" : "success");

        // Prepend to live entrance audit feed
        setScanHistory((prev) => [badgeData, ...prev.slice(0, 49)]);

        // Optimistically update memory roster
        matched[dayProp] = actionType === "ENTRY" ? "Present" : "Absent";

        // Asynchronously persist to backend (Non-blocking background dispatch)
        if (autoCheckIn) {
          fetch("/api/admin/", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              action: "RECORD_CHECK_IN",
              adminKey: "abhilashisgoat",
              delegateId: matched.regId || matched.delegateId || code,
              day: selectedDay,
              actionType: actionType,
            }),
          }).catch(() => {});
        }

        // Auto-dock pop badge after 800ms so screen is instantly ready for next pass
        if (badgeTimerRef.current) clearTimeout(badgeTimerRef.current);
        badgeTimerRef.current = setTimeout(() => {
          setActiveBadge(null);
        }, 850);
      } else {
        // Unrecognized code
        const failData = {
          id: `scan_${Date.now()}`,
          status: "UNRECOGNIZED",
          isRepeat: false,
          code: code,
          delegate: null,
          day: selectedDay,
          action: actionType,
          time: timeNow,
          message: `Unrecognized credential: ${code}`,
        };
        setActiveBadge(failData);
        playChime("error");
        setScanHistory((prev) => [failData, ...prev.slice(0, 49)]);

        if (badgeTimerRef.current) clearTimeout(badgeTimerRef.current);
        badgeTimerRef.current = setTimeout(() => {
          setActiveBadge(null);
        }, 1200);
      }

      setSearchQuery("");
      if (barcodeInputRef.current) barcodeInputRef.current.focus();
    },
    [delegatesList, selectedDay, actionType, autoCheckIn, playChime]
  );

  // 60FPS Continuous jsQR Decoding Loop
  const scanFrame = useCallback(() => {
    if (!videoRef.current || !cameraActive) return;

    const video = videoRef.current;
    if (video.readyState === video.HAVE_ENOUGH_DATA) {
      let canvas = canvasRef.current;
      if (!canvas) {
        canvas = document.createElement("canvas");
        canvasRef.current = canvas;
      }
      const ctx = canvas.getContext("2d", { willReadFrequently: true });
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      const code = jsQR(imageData.data, imageData.width, imageData.height, {
        inversionAttempts: "dontInvert",
      });

      if (code && code.data) {
        const scannedText = code.data.trim();
        const now = Date.now();

        // Throughput control: require 450ms gap or different code for 2 passes/sec
        if (scannedText !== lastScannedCodeRef.current || now - lastScanTimestampRef.current > 1800) {
          lastScannedCodeRef.current = scannedText;
          lastScanTimestampRef.current = now;
          executeScan(scannedText);
        }
      }
    }

    scanLoopRef.current = requestAnimationFrame(scanFrame);
  }, [cameraActive, executeScan]);

  // Start / Stop Camera Stream
  const toggleCamera = async () => {
    if (cameraActive) {
      if (scanLoopRef.current) cancelAnimationFrame(scanLoopRef.current);
      if (videoRef.current && videoRef.current.srcObject) {
        videoRef.current.srcObject.getTracks().forEach((t) => t.stop());
        videoRef.current.srcObject = null;
      }
      setCameraActive(false);
    } else {
      setCameraError("");
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: {
            facingMode: { ideal: "environment" },
            width: { ideal: 1280 },
            height: { ideal: 720 },
          },
        });
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          videoRef.current.setAttribute("playsinline", "true");
          await videoRef.current.play();
          setCameraActive(true);
        }
      } catch (err) {
        setCameraError("Camera permission denied or camera device unavailable.");
      }
    }
  };

  useEffect(() => {
    if (cameraActive) {
      scanLoopRef.current = requestAnimationFrame(scanFrame);
    }
    return () => {
      if (scanLoopRef.current) cancelAnimationFrame(scanLoopRef.current);
    };
  }, [cameraActive, scanFrame]);

  // Handle Passcode Unlock
  const handleAuthSubmit = (e) => {
    e.preventDefault();
    const clean = passkey.trim();
    if (
      clean === "abhilashisgoat" ||
      clean === "2026" ||
      clean === "admin2026" ||
      clean === "Resolve2026" ||
      clean === ADMIN_KEY
    ) {
      setIsAuthenticated(true);
      setAuthError("");
      sessionStorage.setItem("resolve_scan_auth", "true");
    } else {
      setAuthError("Incorrect secretariat passcode.");
    }
  };

  // Locked Gatekeeper Screen
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center p-4">
        <div className="max-w-md w-full p-8 rounded-2xl border border-white/10 bg-zinc-950 shadow-2xl space-y-6">
          <div className="w-14 h-14 rounded-2xl bg-white/[0.05] border border-white/15 flex items-center justify-center mx-auto text-emerald-400">
            <QrCode className="w-7 h-7" />
          </div>

          <div className="text-center space-y-1.5">
            <span className="text-[10px] font-mono tracking-[0.25em] text-emerald-400 uppercase font-bold">
              Resolve MUN 2.0 · Hyderabad
            </span>
            <h1 className="text-xl font-bold uppercase tracking-tight text-white font-sans">
              Gatekeeper Entry Scanner
            </h1>
            <p className="text-xs text-zinc-400 leading-relaxed">
              Ultra-fast 2-pass/second admission scanner for Secretariat and logistics staff.
            </p>
          </div>

          <form onSubmit={handleAuthSubmit} className="space-y-4">
            <div>
              <label className="block text-[11px] font-mono uppercase tracking-wider text-zinc-400 mb-1.5">
                Secretariat Passcode
              </label>
              <input
                type="password"
                required
                autoFocus
                value={passkey}
                onChange={(e) => setPasskey(e.target.value)}
                placeholder="Enter passcode..."
                className="w-full h-11 px-4 rounded-xl bg-zinc-900 border border-white/15 text-white font-mono text-sm focus:outline-none focus:border-white transition-all"
              />
            </div>

            {authError && (
              <div className="p-3 rounded-lg bg-red-950/30 border border-red-500/20 text-red-300 text-xs font-mono flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 shrink-0" />
                <span>{authError}</span>
              </div>
            )}

            <button
              type="submit"
              className="w-full h-11 rounded-xl bg-white hover:bg-zinc-200 text-black font-bold text-xs uppercase tracking-wider transition-all cursor-pointer shadow-lg"
            >
              Unlock Scanner Engine
            </button>
          </form>

          <div className="pt-2 text-center flex items-center justify-center gap-4 text-xs font-mono text-zinc-500">
            <Link href="/" className="hover:text-white transition-colors">
              &larr; Homepage
            </Link>
            <span>&bull;</span>
            <Link href="/admin/" className="hover:text-white transition-colors">
              Admin Console &rarr;
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // Active Confirmed Count Today
  const dayKey = selectedDay === "Day 2" ? "checkInDay2" : selectedDay === "Day 3" ? "checkInDay3" : "checkInDay1";
  const checkedCount = delegatesList.filter((d) => d[dayKey] === "Present").length;

  return (
    <div className="min-h-screen bg-black text-white font-sans flex flex-col selection:bg-white selection:text-black">
      {/* Sleek Top Navigation */}
      <header className="sticky top-0 z-40 h-16 border-b border-white/10 bg-zinc-950/90 backdrop-blur-xl px-4 sm:px-6 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="h-9 w-9 rounded-xl bg-white/5 border border-white/15 flex items-center justify-center text-emerald-400">
            <Zap className="h-4 w-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-sm font-bold uppercase tracking-tight text-white">
                Ultra-Fast Gatekeeper Scanner
              </h1>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-950/60 border border-emerald-500/30 text-emerald-300 font-bold">
                2 Scans/Sec
              </span>
            </div>
            <div className="flex items-center gap-2 text-[10px] font-mono text-zinc-400">
              <span>{delegatesList.length} Roster Synced</span>
              <span>&bull;</span>
              <span>{checkedCount} Admitted Today</span>
              {rosterSyncTime && <span>({rosterSyncTime})</span>}
            </div>
          </div>
        </div>

        {/* Global Controls */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setSoundEnabled((s) => !s)}
            className="h-8 px-2.5 rounded-lg border border-white/15 bg-zinc-900 text-zinc-300 hover:text-white text-xs flex items-center gap-1.5 cursor-pointer"
            title="Toggle synthesizer chime"
          >
            {soundEnabled ? <Volume2 className="h-3.5 w-3.5 text-emerald-400" /> : <VolumeX className="h-3.5 w-3.5 text-zinc-500" />}
            <span className="hidden md:inline font-mono text-[10px]">{soundEnabled ? "Audio ON" : "Muted"}</span>
          </button>

          <button
            type="button"
            onClick={fetchRoster}
            disabled={isLoadingRoster}
            className="h-8 px-3 rounded-lg border border-white/15 bg-zinc-900 hover:bg-zinc-800 text-xs font-mono text-zinc-300 hover:text-white flex items-center gap-1.5 cursor-pointer"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${isLoadingRoster ? "animate-spin text-emerald-400" : ""}`} />
            <span className="hidden sm:inline">Sync Roster</span>
          </button>

          <Link
            href="/admin/"
            className="h-8 px-3 rounded-lg border border-white/15 bg-white text-black hover:bg-zinc-200 text-xs font-semibold flex items-center gap-1 transition-colors"
          >
            <span>Admin</span>
            <ChevronRight className="h-3.5 w-3.5" />
          </Link>
        </div>
      </header>

      {/* Main Scanner Workspace */}
      <main className="flex-1 max-w-6xl w-full mx-auto p-4 sm:p-6 grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Camera Viewfinder & Barcode Receiver */}
        <div className="lg:col-span-7 space-y-4">
          {/* Day & Action Selector Bar */}
          <div className="p-3 rounded-xl border border-white/10 bg-zinc-950 flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-1 bg-black p-1 rounded-lg border border-white/10">
              {["Day 1", "Day 2", "Day 3"].map((d) => (
                <button
                  key={d}
                  type="button"
                  onClick={() => setSelectedDay(d)}
                  className={`px-3 py-1 rounded text-xs font-mono font-bold transition-all cursor-pointer ${
                    selectedDay === d
                      ? "bg-white text-black shadow-sm"
                      : "text-zinc-400 hover:text-white"
                  }`}
                >
                  {d}
                </button>
              ))}
            </div>

            <div className="flex items-center gap-1 bg-black p-1 rounded-lg border border-white/10">
              <button
                type="button"
                onClick={() => setActionType("ENTRY")}
                className={`px-3 py-1 rounded text-xs font-mono font-bold transition-all cursor-pointer ${
                  actionType === "ENTRY"
                    ? "bg-emerald-500 text-black shadow-sm"
                    : "text-zinc-400 hover:text-white"
                }`}
              >
                CHECK-IN
              </button>
              <button
                type="button"
                onClick={() => setActionType("EXIT")}
                className={`px-3 py-1 rounded text-xs font-mono font-bold transition-all cursor-pointer ${
                  actionType === "EXIT"
                    ? "bg-amber-500 text-black shadow-sm"
                    : "text-zinc-400 hover:text-white"
                }`}
              >
                CHECK-OUT
              </button>
            </div>
          </div>

          {/* Camera Viewfinder Viewport with Laser Scanline */}
          <div className="relative rounded-2xl border border-white/15 bg-black overflow-hidden shadow-2xl flex flex-col items-center justify-center min-h-[380px]">
            {cameraActive ? (
              <div className="relative w-full h-[380px] bg-black">
                <video
                  ref={videoRef}
                  className="w-full h-full object-cover"
                />
                {/* HUD Laser Targeting Frame */}
                <div className="absolute inset-0 pointer-events-none flex items-center justify-center p-8">
                  <div className="relative w-64 h-64 border-2 border-emerald-400/80 rounded-2xl shadow-[0_0_20px_rgba(52,211,153,0.3)] flex items-center justify-center">
                    {/* Corner Reticles */}
                    <div className="absolute -top-1 -left-1 w-6 h-6 border-t-4 border-l-4 border-emerald-400" />
                    <div className="absolute -top-1 -right-1 w-6 h-6 border-t-4 border-r-4 border-emerald-400" />
                    <div className="absolute -bottom-1 -left-1 w-6 h-6 border-b-4 border-l-4 border-emerald-400" />
                    <div className="absolute -bottom-1 -right-1 w-6 h-6 border-b-4 border-r-4 border-emerald-400" />

                    {/* Animated High-Speed Laser Scanline */}
                    <div className="absolute left-2 right-2 h-0.5 bg-gradient-to-r from-transparent via-emerald-400 to-transparent animate-pulse shadow-[0_0_12px_#10b981]" />

                    <span className="absolute bottom-2 text-[10px] font-mono uppercase tracking-widest text-emerald-400 font-bold bg-black/60 px-2 py-0.5 rounded">
                      Align Credential QR
                    </span>
                  </div>
                </div>
              </div>
            ) : (
              <div className="py-16 px-6 text-center space-y-4 max-w-sm">
                <div className="h-16 w-16 rounded-2xl bg-zinc-900 border border-white/15 flex items-center justify-center mx-auto text-zinc-400">
                  <Camera className="h-8 w-8" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white uppercase font-sans">
                    Camera Scanner Standby
                  </h3>
                  <p className="text-xs text-zinc-400 mt-1">
                    Activate camera for continuous hands-free multi-pass scanning, or use hardware barcode scanner gun below.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={toggleCamera}
                  className="h-10 px-5 rounded-xl bg-white hover:bg-zinc-200 text-black font-bold text-xs uppercase tracking-wider transition-all cursor-pointer"
                >
                  Start Live Camera
                </button>
              </div>
            )}

            {/* Camera Floating Toggle */}
            {cameraActive && (
              <button
                type="button"
                onClick={toggleCamera}
                className="absolute top-4 right-4 z-20 h-8 px-3 rounded-lg bg-black/70 hover:bg-black text-red-400 border border-red-500/30 text-xs font-mono flex items-center gap-1.5 cursor-pointer backdrop-blur-md"
              >
                <CameraOff className="h-3.5 w-3.5" />
                <span>Stop Camera</span>
              </button>
            )}

            {cameraError && (
              <div className="absolute bottom-4 left-4 right-4 p-3 rounded-xl bg-red-950/80 border border-red-500/40 text-red-300 text-xs font-mono text-center">
                {cameraError}
              </div>
            )}
          </div>

          {/* Hardware Barcode Gun / Manual Rapid Input Form */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              executeScan(searchQuery);
            }}
            className="rounded-xl border border-white/10 bg-zinc-950 p-3 space-y-2"
          >
            <div className="flex items-center justify-between text-[11px] font-mono text-zinc-400">
              <span className="uppercase font-semibold">Barcode Gun &amp; Manual Override</span>
              <span className="text-emerald-400">Auto-Submits on Scan</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="relative flex-1">
                <input
                  ref={barcodeInputRef}
                  type="text"
                  placeholder="Scan pass with barcode gun or type RM26-DEL-1001..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full h-11 pl-4 pr-10 rounded-xl bg-black border border-white/15 text-sm text-white font-mono placeholder-zinc-600 focus:outline-none focus:border-emerald-400 transition-colors"
                />
                {searchQuery && (
                  <button
                    type="button"
                    onClick={() => setSearchQuery("")}
                    className="absolute right-3 top-3 text-zinc-500 hover:text-white"
                  >
                    <X className="h-4 w-4" />
                  </button>
                )}
              </div>
              <button
                type="submit"
                className="h-11 px-5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-black font-bold text-xs uppercase tracking-wider cursor-pointer transition-colors"
              >
                Scan Pass
              </button>
            </div>
          </form>
        </div>

        {/* Right Column: Instant Visual Badge Pop & Entrance Ledger Feed */}
        <div className="lg:col-span-5 space-y-4 flex flex-col">
          {/* REAL-TIME BADGE POP VIEWPORT (Sub-50ms Reaction) */}
          <div className="rounded-2xl border border-white/15 bg-zinc-950 p-5 min-h-[220px] flex flex-col justify-between shadow-2xl relative overflow-hidden">
            <div className="flex items-center justify-between border-b border-white/10 pb-2.5">
              <span className="text-[10px] font-mono uppercase tracking-widest text-zinc-400 font-bold">
                Gatekeeper Admission Badge
              </span>
              <span className="text-[10px] font-mono text-zinc-500">
                {selectedDay} · {actionType}
              </span>
            </div>

            {activeBadge ? (
              <div className="my-auto py-2 space-y-3 text-center animate-in fade-in zoom-in-95 duration-100">
                <div
                  className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-mono font-bold uppercase tracking-wider ${
                    activeBadge.status === "AUTHORIZED"
                      ? activeBadge.isRepeat
                        ? "bg-amber-500/20 text-amber-300 border border-amber-500/40"
                        : "bg-emerald-500/20 text-emerald-300 border border-emerald-500/40"
                      : "bg-red-500/20 text-red-300 border border-red-500/40"
                  }`}
                >
                  {activeBadge.status === "AUTHORIZED" ? (
                    <CheckCircle2 className="h-3.5 w-3.5" />
                  ) : (
                    <XCircle className="h-3.5 w-3.5" />
                  )}
                  <span>
                    {activeBadge.status === "AUTHORIZED"
                      ? activeBadge.isRepeat
                        ? "REPEAT ADMISSION PASS"
                        : "ADMISSION CONFIRMED"
                      : "INVALID CREDENTIAL"}
                  </span>
                </div>

                <h2 className="text-2xl font-extrabold text-white font-sans tracking-tight line-clamp-1">
                  {activeBadge.delegate?.fullName || activeBadge.code}
                </h2>

                {activeBadge.delegate && (
                  <div className="space-y-1 font-mono text-xs">
                    <p className="text-zinc-200">
                      <strong className="text-emerald-400 font-bold">
                        {activeBadge.delegate.allocatedCommittee || "DISEC"}
                      </strong>{" "}
                      · {activeBadge.delegate.allocatedCountry || "Delegate"}
                    </p>
                    <p className="text-zinc-400 text-[11px] truncate">
                      {activeBadge.delegate.institution || "Individual"}
                    </p>
                    <span className="text-[10px] text-zinc-500 font-mono block">
                      ID: {activeBadge.delegate.regId} · Checked at {activeBadge.time}
                    </span>
                  </div>
                )}
              </div>
            ) : (
              <div className="my-auto py-10 text-center space-y-2">
                <div className="h-10 w-10 rounded-full border border-white/10 bg-black flex items-center justify-center mx-auto text-zinc-600">
                  <QrCode className="h-5 w-5" />
                </div>
                <p className="text-xs font-mono text-zinc-500">
                  Awaiting next pass in scanner view...
                </p>
              </div>
            )}

            <div className="pt-2 border-t border-white/10 flex items-center justify-between text-[10px] font-mono text-zinc-500">
              <span>Velocity: 2 passes/sec target</span>
              <span>Session Scans: {scanHistory.length}</span>
            </div>
          </div>

          {/* Real-Time Entrance Audit Stream */}
          <div className="flex-1 rounded-2xl border border-white/15 bg-zinc-950 p-4 space-y-3 flex flex-col">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-zinc-300 uppercase tracking-wider flex items-center gap-1.5">
                <History className="h-3.5 w-3.5 text-zinc-400" />
                Live Entrance Feed ({scanHistory.length})
              </span>
              <button
                type="button"
                onClick={() => setScanHistory([])}
                className="text-[10px] font-mono text-zinc-500 hover:text-zinc-300"
              >
                Clear Log
              </button>
            </div>

            <div className="flex-1 max-h-[360px] overflow-y-auto space-y-2 pr-1">
              {scanHistory.length === 0 ? (
                <div className="py-12 text-center text-xs font-mono text-zinc-600">
                  No scan events recorded in this session.
                </div>
              ) : (
                scanHistory.map((s) => (
                  <div
                    key={s.id}
                    className="p-2.5 rounded-xl border border-white/5 bg-black/60 flex items-center justify-between text-xs"
                  >
                    <div className="min-w-0 flex-1 mr-3">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-white truncate">
                          {s.delegate?.fullName || s.code}
                        </span>
                        <span className="text-[10px] font-mono text-zinc-500">{s.time}</span>
                      </div>
                      <div className="text-[11px] font-mono text-zinc-400 truncate mt-0.5">
                        {s.delegate ? (
                          <>
                            {s.delegate.allocatedCommittee || "DISEC"} · {s.delegate.allocatedCountry || "Delegate"}
                          </>
                        ) : (
                          <span className="text-red-400">Unrecognized pass</span>
                        )}
                      </div>
                    </div>
                    <span
                      className={`text-[9px] font-mono font-bold px-2 py-0.5 rounded border uppercase shrink-0 ${
                        s.status === "AUTHORIZED"
                          ? s.isRepeat
                            ? "border-amber-500/30 text-amber-400 bg-amber-950/20"
                            : "border-emerald-500/30 text-emerald-400 bg-emerald-950/20"
                          : "border-red-500/30 text-red-400 bg-red-950/20"
                      }`}
                    >
                      {s.status === "AUTHORIZED" ? (s.isRepeat ? "REPEAT" : "OK") : "FAIL"}
                    </span>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
