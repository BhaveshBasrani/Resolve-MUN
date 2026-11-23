"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import Link from "next/link";
import jsQR from "jsqr";
import Footer from "@/components/Footer";
import {
  QrCode,
  CheckCircle2,
  XCircle,
  RefreshCw,
  Camera,
  CameraOff,
  AlertTriangle,
  Volume2,
  VolumeX,
  History,
  ChevronRight,
  Upload,
  X,
  Bus,
  ShieldCheck,
  MapPin,
} from "lucide-react";

const ADMIN_KEY = process.env.NEXT_PUBLIC_ADMIN_KEY || "ResolveMUNAdmin2026@Secure";

function normalizePassId(str) {
  return String(str || "")
    .trim()
    .toUpperCase()
    .replace(/^RM26-DEL-/i, "RM-")
    .replace(/^RM26-/i, "RM-");
}

function parseQrPayload(rawInput) {
  const raw = String(rawInput || "").trim();
  if (!raw) return { raw: "", candidateId: "", candidateEmail: "" };

  const tokens = raw
    .split(/[:|]/)
    .map((t) => t.trim())
    .filter(Boolean);

  let candidateId = "";
  let candidateEmail = "";

  for (const tok of tokens) {
    if (tok.includes("@") && !candidateEmail) {
      candidateEmail = tok.toLowerCase();
    } else if (/^RM(?:26)?-[A-Z0-9-]+$/i.test(tok) && !candidateId) {
      candidateId = normalizePassId(tok);
    } else if (/^[0-9a-f]{8}-[0-9a-f]{4}-/i.test(tok) && !candidateId) {
      candidateId = `RM-${tok.replace(/-/g, "").slice(0, 4).toUpperCase()}`;
    }
  }

  if (!candidateId && tokens.length === 1) {
    candidateId = normalizePassId(raw);
  }

  return { raw, candidateId, candidateEmail };
}

export default function UltraFastEntranceScanner() {
  const [passkey, setPasskey] = useState("");
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [authError, setAuthError] = useState("");

  // Cached full conference roster (Delegates + OC + Secretariat + EB)
  const [delegatesList, setDelegatesList] = useState([]);
  const [isLoadingRoster, setIsLoadingRoster] = useState(false);
  const [rosterSyncTime, setRosterSyncTime] = useState(null);

  // Scanner Mode: "GATE" (Venue Entry) vs "BUS" (Transport Bus Boarding)
  const [scanMode, setScanMode] = useState("GATE");
  const [selectedDay, setSelectedDay] = useState("Day 1");
  const [actionType, setActionType] = useState("ENTRY"); // ENTRY or EXIT
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [autoCheckIn, setAutoCheckIn] = useState(true);

  // Active Scan Pop State
  const [activeBadge, setActiveBadge] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");

  // Scan History
  const [scanHistory, setScanHistory] = useState([]);

  // Camera QR stream refs & loop (video element stays mounted so videoRef.current is NEVER null)
  const [cameraActive, setCameraActive] = useState(false);
  const [cameraError, setCameraError] = useState("");
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const scanLoopRef = useRef(null);
  const barcodeInputRef = useRef(null);
  const fileInputRef = useRef(null);

  const lastScannedCodeRef = useRef("");
  const lastScanTimestampRef = useRef(0);
  const badgeTimerRef = useRef(null);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const savedAuth = sessionStorage.getItem("resolve_scan_auth");
      const adminAuth = localStorage.getItem("resolve_admin_key");
      const adminUnlocked = sessionStorage.getItem("resolve_admin_unlocked");
      if (savedAuth === "true" || adminAuth === "abhilashisgoat" || adminUnlocked === "true") {
        setIsAuthenticated(true);
      }
    }
  }, []);

  const playChime = useCallback(
    (type = "success") => {
      if (!soundEnabled) return;
      try {
        const AudioCtx = window.AudioContext || window.webkitAudioContext;
        if (!AudioCtx) return;
        const ctx = new AudioCtx();
        const now = ctx.currentTime;
        if (type === "success") {
          const osc1 = ctx.createOscillator();
          const osc2 = ctx.createOscillator();
          const gain = ctx.createGain();
          osc1.type = "sine";
          osc1.frequency.setValueAtTime(880, now);
          osc1.frequency.exponentialRampToValueAtTime(1760, now + 0.08);
          osc2.type = "triangle";
          osc2.frequency.setValueAtTime(1174.66, now + 0.04);
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
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.type = "sine";
          osc.frequency.setValueAtTime(659.25, now);
          osc.frequency.setValueAtTime(523.25, now + 0.08);
          gain.gain.setValueAtTime(0.15, now);
          gain.gain.exponentialRampToValueAtTime(0.001, now + 0.18);
          osc.connect(gain);
          gain.connect(ctx.destination);
          osc.start(now);
          osc.stop(now + 0.18);
        } else {
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
    },
    [soundEnabled]
  );

  const fetchRoster = useCallback(async () => {
    setIsLoadingRoster(true);
    try {
      const res = await fetch(`/api/admin/?adminKey=abhilashisgoat&refresh=true`);
      if (res.ok) {
        const data = await res.json();
        const regs = (data.registrations || []).map((d) => ({
          ...d,
          roleType: "DELEGATE",
          regId: normalizePassId(d.regId || d.delegateId || d.id),
        }));
        const ocs = (data.ocApplicants || []).map((o) => ({
          ...o,
          roleType: "OC",
          regId: normalizePassId(o.appId || o.id),
          fullName: o.fullName || o.name,
          allocatedCommittee: o.allocatedDepartment || o.department1 || "Organizing Committee",
          allocatedCountry: "OC Member",
          transport: o.transportNeeded || o.transport || "No",
          address: o.residentialAddress || o.address || "",
          paymentStatus: "VERIFIED",
        }));
        const secs = (data.secretariatRoster || []).map((s) => ({
          ...s,
          roleType: "SECRETARIAT",
          regId: `RM-SEC-${String(s.id || "").replace(/-/g, "").slice(0, 4).toUpperCase()}`,
          fullName: s.fullName || s.email,
          allocatedCommittee: "Secretariat Directorate",
          allocatedCountry: s.allottedRole || "Secretariat",
          transport: "Yes (Secretariat)",
          paymentStatus: "VERIFIED",
        }));
        const ebs = (data.ebApplicants || []).map((e) => ({
          ...e,
          roleType: "EB",
          regId: normalizePassId(e.appId || e.id),
          fullName: e.fullName || e.name,
          allocatedCommittee: e.allocatedCommittee || e.prefCommittee1 || "Executive Board",
          allocatedCountry: e.position || "EB Member",
          transport: "Yes (EB)",
          paymentStatus: "VERIFIED",
        }));
        setDelegatesList([...regs, ...ocs, ...secs, ...ebs]);
        setRosterSyncTime(new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }));
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

  const executeScan = useCallback(
    (rawInput) => {
      const { raw, candidateId, candidateEmail } = parseQrPayload(rawInput);
      if (!raw) return;

      const qIdLower = candidateId.toLowerCase();
      const qRawLower = raw.toLowerCase();
      const qDigits = raw.replace(/[^0-9]/g, "");

      const matched = delegatesList.find((d) => {
        const idNorm = normalizePassId(d.regId || d.id || d.delegateId).toLowerCase();
        const em = String(d.email || "").toLowerCase().trim();
        const ph = String(d.phone || "").replace(/[^0-9]/g, "");
        const nm = String(d.fullName || d.name || "").toLowerCase().trim();

        if (qIdLower && idNorm === qIdLower) return true;
        if (candidateEmail && em === candidateEmail) return true;
        if (em && em === qRawLower) return true;
        if (qDigits && qDigits.length >= 10 && ph.endsWith(qDigits.slice(-10))) return true;
        if (nm && nm === qRawLower) return true;
        return false;
      });

      const timeNow = new Date().toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
      });

      if (matched) {
        const isLumen =
          String(matched.regId || "").toUpperCase().startsWith("RM-LMN-") ||
          String(matched.paymentUTR || "").toUpperCase() === "LUMEN-ACQUIRED" ||
          String(matched.referral || "").toUpperCase() === "LUMEN-MUN" ||
          String(matched.transport || "").toLowerCase().includes("lumen");

        const rawTransport = String(matched.transport || "No").trim();
        const hasBusPass =
          !isLumen &&
          (rawTransport.toLowerCase().startsWith("yes") ||
            matched.roleType === "SECRETARIAT" ||
            matched.roleType === "EB");

        // BUS SCANNER MODE
        if (scanMode === "BUS") {
          const busProp = selectedDay === "Day 2" ? "busDay2" : "busDay1";
          const alreadyBoarded = matched[busProp] === "Present" && actionType === "ENTRY";

          const busStatus = hasBusPass ? "BUS_AUTHORIZED" : "NO_TRANSPORT";
          const badgeData = {
            id: `scan_${Date.now()}`,
            mode: "BUS",
            status: busStatus,
            isRepeat: alreadyBoarded,
            code: matched.regId || candidateId || raw,
            delegate: matched,
            day: selectedDay,
            action: actionType,
            time: timeNow,
            message: !hasBusPass
              ? isLumen
                ? "LUMEN DELEGATE — NO TRANSPORT INCLUDED (SELF COMMUTE)"
                : "NO TRANSPORT PASS — SELF COMMUTE OPTED"
              : alreadyBoarded
              ? `Repeat scan · Already boarded bus for ${selectedDay}`
              : `Bus Boarding Authorized: ${matched.fullName}`,
          };

          setActiveBadge(badgeData);
          playChime(!hasBusPass ? "error" : alreadyBoarded ? "warning" : "success");
          setScanHistory((prev) => [badgeData, ...prev.slice(0, 49)]);

          if (hasBusPass) {
            matched[busProp] = actionType === "ENTRY" ? "Present" : "Absent";
            if (autoCheckIn) {
              fetch("/api/admin/", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                  action: "RECORD_CHECK_IN",
                  adminKey: "abhilashisgoat",
                  scanMode: "BUS",
                  delegateId: matched.regId || matched.id,
                  fullName: matched.fullName,
                  email: matched.email,
                  role: matched.roleType || "DELEGATE",
                  day: selectedDay,
                  actionType: actionType,
                }),
              }).catch(() => {});
            }
          }
        } else {
          // GATE ENTRY SCANNER MODE
          const dayProp = selectedDay === "Day 2" ? "checkInDay2" : "checkInDay1";
          const alreadyCheckedIn = matched[dayProp] === "Present" && actionType === "ENTRY";
          const isPayUnverified =
            matched.roleType === "DELEGATE" &&
            !isLumen &&
            String(matched.paymentStatus || "").toUpperCase() !== "VERIFIED";

          const badgeData = {
            id: `scan_${Date.now()}`,
            mode: "GATE",
            status: isPayUnverified ? "PAYMENT_UNVERIFIED" : "AUTHORIZED",
            isRepeat: alreadyCheckedIn,
            code: matched.regId || candidateId || raw,
            delegate: matched,
            day: selectedDay,
            action: actionType,
            time: timeNow,
            message: isPayUnverified
              ? `Payment ${matched.paymentStatus || "Pending"} — Verify at Desk`
              : alreadyCheckedIn
              ? `Repeat scan · Already checked in for ${selectedDay}`
              : `${actionType === "ENTRY" ? "Checked in" : "Checked out"}: ${matched.fullName}`,
          };

          setActiveBadge(badgeData);
          playChime(isPayUnverified || alreadyCheckedIn ? "warning" : "success");
          setScanHistory((prev) => [badgeData, ...prev.slice(0, 49)]);

          if (!isPayUnverified) {
            matched[dayProp] = actionType === "ENTRY" ? "Present" : "Absent";
            if (autoCheckIn) {
              fetch("/api/admin/", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                  action: "RECORD_CHECK_IN",
                  adminKey: "abhilashisgoat",
                  scanMode: "GATE",
                  delegateId: matched.regId || matched.id,
                  fullName: matched.fullName,
                  email: matched.email,
                  role: matched.roleType || "DELEGATE",
                  day: selectedDay,
                  actionType: actionType,
                }),
              }).catch(() => {});
            }
          }
        }

        if (badgeTimerRef.current) clearTimeout(badgeTimerRef.current);
        badgeTimerRef.current = setTimeout(() => {
          setActiveBadge(null);
        }, 2500);
      } else {
        const failData = {
          id: `scan_${Date.now()}`,
          mode: scanMode,
          status: "UNRECOGNIZED",
          isRepeat: false,
          code: candidateId || raw,
          delegate: null,
          day: selectedDay,
          action: actionType,
          time: timeNow,
          message: `Unrecognized pass: ${candidateId || raw}`,
        };
        setActiveBadge(failData);
        playChime("error");
        setScanHistory((prev) => [failData, ...prev.slice(0, 49)]);

        if (badgeTimerRef.current) clearTimeout(badgeTimerRef.current);
        badgeTimerRef.current = setTimeout(() => {
          setActiveBadge(null);
        }, 2500);
      }

      setSearchQuery("");
      if (barcodeInputRef.current) barcodeInputRef.current.focus();
    },
    [delegatesList, scanMode, selectedDay, actionType, autoCheckIn, playChime]
  );

  const handleScanImageFile = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement("canvas");
        canvas.width = img.width;
        canvas.height = img.height;
        const ctx = canvas.getContext("2d");
        ctx.drawImage(img, 0, 0);
        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const qr = jsQR(imageData.data, imageData.width, imageData.height, {
          inversionAttempts: "attemptBoth",
        });
        if (qr && qr.data) {
          executeScan(qr.data);
        } else {
          setCameraError("Could not detect a valid QR code in that image.");
        }
      };
      img.src = String(reader.result);
    };
    reader.readAsDataURL(file);
    e.target.value = "";
  };

  const scanFrame = useCallback(() => {
    if (!videoRef.current || !cameraActive) return;

    const video = videoRef.current;
    if (video.readyState === video.HAVE_ENOUGH_DATA && video.videoWidth > 0) {
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
        inversionAttempts: "attemptBoth",
      });

      if (code && code.data) {
        const scannedText = code.data.trim();
        const now = Date.now();
        if (
          scannedText !== lastScannedCodeRef.current ||
          now - lastScanTimestampRef.current > 1800
        ) {
          lastScannedCodeRef.current = scannedText;
          lastScanTimestampRef.current = now;
          executeScan(scannedText);
        }
      }
    }

    scanLoopRef.current = requestAnimationFrame(scanFrame);
  }, [cameraActive, executeScan]);

  const stopCameraStream = useCallback(() => {
    if (scanLoopRef.current) cancelAnimationFrame(scanLoopRef.current);
    if (videoRef.current && videoRef.current.srcObject) {
      videoRef.current.srcObject.getTracks().forEach((t) => t.stop());
      videoRef.current.srcObject = null;
    }
    setCameraActive(false);
  }, []);

  const toggleCamera = async () => {
    if (cameraActive) {
      stopCameraStream();
      return;
    }

    setCameraError("");
    try {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        setCameraError(
          "Live camera requires HTTPS or localhost. Use 'Scan QR Image' or type the RM-XXXX code below."
        );
        return;
      }
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
        setCameraActive(true);
        await videoRef.current.play().catch(() => {});
      }
    } catch (_) {
      setCameraError("Camera permission denied or camera unavailable on this device.");
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

  useEffect(() => {
    return () => stopCameraStream();
  }, [stopCameraStream]);

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
      setAuthError("Incorrect Secretariat passcode.");
    }
  };

  const dayKey =
    scanMode === "BUS"
      ? selectedDay === "Day 2"
        ? "busDay2"
        : "busDay1"
      : selectedDay === "Day 2"
      ? "checkInDay2"
      : "checkInDay1";
  const checkedCount = delegatesList.filter((d) => d[dayKey] === "Present").length;
  const busEligibleCount = delegatesList.filter(
    (d) =>
      !String(d.regId || "").startsWith("RM-LMN-") &&
      String(d.paymentUTR || "") !== "LUMEN-ACQUIRED" &&
      String(d.transport || "").toLowerCase().startsWith("yes")
  ).length;

  const topBar = (
    <header className="sticky top-0 z-40 h-14 border-b border-[#1f1f1f] bg-black/95 backdrop-blur-sm">
      <div className="max-w-5xl h-full mx-auto px-4 sm:px-6 flex items-center justify-between gap-3">
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
          <span className="text-zinc-700">/</span>
          <span className="text-xs text-zinc-400 truncate">
            {scanMode === "BUS" ? "Bus & Transport Scanner" : "Gate Entry Scanner"}
          </span>
        </div>

        {isAuthenticated && (
          <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
            <button
              type="button"
              onClick={() => setSoundEnabled((s) => !s)}
              className="h-8 px-2.5 rounded-md border border-[#262626] bg-black text-zinc-300 hover:text-white text-xs flex items-center gap-1.5 cursor-pointer"
              title="Toggle audio chime"
            >
              {soundEnabled ? (
                <Volume2 className="h-3.5 w-3.5 text-white" />
              ) : (
                <VolumeX className="h-3.5 w-3.5 text-zinc-500" />
              )}
              <span className="hidden md:inline text-[11px]">{soundEnabled ? "Sound" : "Muted"}</span>
            </button>

            <button
              type="button"
              onClick={fetchRoster}
              disabled={isLoadingRoster}
              className="h-8 px-2.5 rounded-md border border-[#262626] bg-black text-xs text-zinc-300 hover:text-white flex items-center gap-1.5 cursor-pointer"
            >
              <RefreshCw className={`h-3.5 w-3.5 ${isLoadingRoster ? "animate-spin" : ""}`} />
              <span className="hidden sm:inline">Sync ({delegatesList.length})</span>
            </button>

            <Link
              href="/admin"
              className="h-8 px-2.5 rounded-md bg-white text-black text-xs font-semibold flex items-center gap-1"
            >
              <span>Admin</span>
              <ChevronRight className="h-3.5 w-3.5" />
            </Link>
          </div>
        )}
      </div>
    </header>
  );

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-black text-white font-sans flex flex-col justify-between selection:bg-white selection:text-black">
        {topBar}
        <main className="flex-1 flex items-center justify-center px-4 py-12">
          <div className="max-w-md w-full p-6 sm:p-8 rounded-md border border-[#262626] bg-black space-y-5">
            <div className="text-center space-y-2">
              <div className="flex items-center justify-center gap-2.5">
                <span className="h-px w-8 bg-gradient-to-r from-transparent to-[#7c3aed]" />
                <span className="text-[10px] font-mono uppercase tracking-[0.22em] text-zinc-400 font-semibold">
                  REGISTRATION &amp; TRANSPORT DESK
                </span>
                <span className="h-px w-8 bg-gradient-to-l from-transparent to-[#7c3aed]" />
              </div>
              <h1 className="m-0 text-xl sm:text-2xl font-bold text-white">
                Gate &amp; Bus Pass Scanner
              </h1>
              <p className="m-0 text-xs text-zinc-400">
                Enter Secretariat passcode to unlock live QR camera for Gate Entry and Bus Boarding.
              </p>
            </div>

            <form onSubmit={handleAuthSubmit} className="space-y-3.5">
              <div>
                <label className="block text-[11px] text-zinc-400 mb-1">
                  Secretariat Passcode
                </label>
                <input
                  type="password"
                  required
                  autoFocus
                  value={passkey}
                  onChange={(e) => setPasskey(e.target.value)}
                  placeholder="Enter passcode..."
                  className="w-full h-10 px-3 rounded-md bg-black border border-[#262626] text-white font-mono text-xs focus:outline-none focus:border-white"
                />
              </div>

              {authError && (
                <div className="p-3 rounded-md bg-red-950/30 border border-red-500/30 text-red-300 text-xs flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 shrink-0" />
                  <span>{authError}</span>
                </div>
              )}

              <button
                type="submit"
                className="w-full h-10 rounded-md bg-white hover:bg-zinc-200 text-black font-bold text-xs uppercase tracking-wider cursor-pointer"
              >
                Unlock Scanner →
              </button>
            </form>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white font-sans flex flex-col justify-between selection:bg-white selection:text-black">
      {topBar}

      <main className="flex-1 max-w-5xl w-full mx-auto px-4 sm:px-6 py-6 sm:py-8 space-y-5">
        {/* TOP MODE SWITCHER: GATE ENTRY vs BUS / TRANSPORT SCANNER */}
        <div className="grid grid-cols-2 gap-2 p-1.5 rounded-md border border-[#262626] bg-[#050505]">
          <button
            type="button"
            onClick={() => {
              setScanMode("GATE");
              setActiveBadge(null);
            }}
            className={`h-10 rounded-md text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2 cursor-pointer transition-colors ${
              scanMode === "GATE"
                ? "bg-white text-black"
                : "bg-black text-zinc-400 hover:text-white"
            }`}
          >
            <ShieldCheck className="w-4 h-4" />
            <span>Gate Entry Scanner</span>
          </button>
          <button
            type="button"
            onClick={() => {
              setScanMode("BUS");
              setActiveBadge(null);
            }}
            className={`h-10 rounded-md text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2 cursor-pointer transition-colors ${
              scanMode === "BUS"
                ? "bg-white text-black"
                : "bg-black text-zinc-400 hover:text-white"
            }`}
          >
            <Bus className="w-4 h-4" />
            <span>Bus / Transport Scanner ({busEligibleCount})</span>
          </button>
        </div>

        {/* HEADER BAR */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#1f1f1f] pb-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="h-px w-6 bg-gradient-to-r from-transparent to-[#7c3aed]" />
              <span className="text-[10px] font-mono uppercase tracking-[0.2em] text-zinc-400 font-semibold">
                {scanMode === "BUS"
                  ? "OFFICIAL SHUTTLE & BUS BOARDING VERIFICATION"
                  : "NORTHFIELD INTERNATIONAL SCHOOL · CHECK-IN DESK"}
              </span>
            </div>
            <h1 className="m-0 text-xl sm:text-2xl font-bold text-white mt-1">
              {scanMode === "BUS"
                ? "Bus & Transport Boarding Scanner"
                : "Venue Gate Entry QR Scanner"}
            </h1>
          </div>

          <div className="flex items-center gap-3 text-xs font-mono text-zinc-400">
            <span>
              Roster: <strong className="text-white">{delegatesList.length}</strong>
            </span>
            <span>·</span>
            <span>
              {scanMode === "BUS" ? `Boarded (${selectedDay})` : `Admitted (${selectedDay})`}:{" "}
              <strong className="text-white">{checkedCount}</strong>
            </span>
            {rosterSyncTime && <span className="text-zinc-500">({rosterSyncTime})</span>}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
          {/* LEFT COLUMN: CAMERA & MANUAL / BARCODE INPUT */}
          <div className="lg:col-span-7 space-y-4">
            {/* Day & Action Controls */}
            <div className="p-3 rounded-md border border-[#262626] bg-black flex flex-wrap items-center justify-between gap-2.5">
              <div className="flex items-center gap-1">
                {[
                  { id: "Day 1", label: "Day 1 · 26 Dec" },
                  { id: "Day 2", label: "Day 2 · 27 Dec" },
                ].map((d) => (
                  <button
                    key={d.id}
                    type="button"
                    onClick={() => setSelectedDay(d.id)}
                    className={`h-8 px-3 rounded-md text-xs font-medium cursor-pointer transition-colors ${
                      selectedDay === d.id
                        ? "bg-white text-black font-semibold"
                        : "bg-black text-zinc-400 border border-[#262626] hover:text-white"
                    }`}
                  >
                    {d.label}
                  </button>
                ))}
              </div>

              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={() => setActionType("ENTRY")}
                  className={`h-8 px-3 rounded-md text-xs font-semibold cursor-pointer ${
                    actionType === "ENTRY"
                      ? "bg-white text-black"
                      : "bg-black text-zinc-400 border border-[#262626]"
                  }`}
                >
                  {scanMode === "BUS" ? "Board Bus" : "Check-In"}
                </button>
                <button
                  type="button"
                  onClick={() => setActionType("EXIT")}
                  className={`h-8 px-3 rounded-md text-xs font-semibold cursor-pointer ${
                    actionType === "EXIT"
                      ? "bg-white text-black"
                      : "bg-black text-zinc-400 border border-[#262626]"
                  }`}
                >
                  {scanMode === "BUS" ? "De-Board" : "Check-Out"}
                </button>
              </div>
            </div>

            {/* Camera Viewport (video element ALWAYS mounted so ref never fails) */}
            <div className="relative rounded-md border border-[#262626] bg-black overflow-hidden flex flex-col items-center justify-center min-h-[320px] sm:min-h-[360px]">
              <video
                ref={videoRef}
                playsInline
                muted
                className={cameraActive ? "w-full h-[320px] sm:h-[360px] object-cover" : "hidden"}
              />

              {cameraActive ? (
                <>
                  <div className="absolute inset-0 pointer-events-none flex items-center justify-center p-6">
                    <div className="relative w-56 h-56 border border-white/70 rounded-md flex items-center justify-center">
                      <div className="absolute -top-0.5 -left-0.5 w-5 h-5 border-t-2 border-l-2 border-white" />
                      <div className="absolute -top-0.5 -right-0.5 w-5 h-5 border-t-2 border-r-2 border-white" />
                      <div className="absolute -bottom-0.5 -left-0.5 w-5 h-5 border-b-2 border-l-2 border-white" />
                      <div className="absolute -bottom-0.5 -right-0.5 w-5 h-5 border-b-2 border-r-2 border-white" />
                      <div className="absolute left-2 right-2 h-px bg-white/80 animate-pulse" />
                      <span className="absolute bottom-2 text-[10px] font-mono uppercase tracking-widest text-white bg-black/80 px-2 py-0.5 rounded">
                        {scanMode === "BUS" ? "Scan Pass for Bus" : "Align QR Pass"}
                      </span>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={toggleCamera}
                    className="absolute top-3 right-3 z-20 h-8 px-3 rounded-md bg-black/85 text-white border border-white/20 text-xs flex items-center gap-1.5 cursor-pointer"
                  >
                    <CameraOff className="h-3.5 w-3.5" />
                    <span>Stop Camera</span>
                  </button>
                </>
              ) : (
                <div className="py-12 px-6 text-center space-y-4 max-w-sm">
                  <div className="h-12 w-12 rounded-md border border-[#262626] flex items-center justify-center mx-auto text-white">
                    {scanMode === "BUS" ? <Bus className="h-5 w-5" /> : <Camera className="h-5 w-5" />}
                  </div>
                  <div className="space-y-1">
                    <h3 className="m-0 text-base font-bold text-white">
                      {scanMode === "BUS" ? "Live Bus Boarding QR Camera" : "Live QR Camera Scanner"}
                    </h3>
                    <p className="m-0 text-xs text-zinc-400 leading-relaxed">
                      {scanMode === "BUS"
                        ? "Scan any delegate or OC QR pass to verify whether transport is included (blocks Self-Commute & Lumen delegates automatically)."
                        : "Start the camera to scan delegate QR passes on phones or printed badges, or upload a QR image file."}
                    </p>
                  </div>
                  <div className="flex flex-wrap items-center justify-center gap-2">
                    <button
                      type="button"
                      onClick={toggleCamera}
                      className="h-10 px-4 rounded-md bg-white hover:bg-zinc-200 text-black font-bold text-xs uppercase tracking-wider cursor-pointer"
                    >
                      Start Live Camera
                    </button>
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="h-10 px-3.5 rounded-md border border-[#262626] bg-black hover:bg-white/[0.04] text-white text-xs font-medium flex items-center gap-1.5 cursor-pointer"
                    >
                      <Upload className="w-3.5 h-3.5" />
                      <span>Scan QR Image</span>
                    </button>
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      onChange={handleScanImageFile}
                      className="hidden"
                    />
                  </div>
                </div>
              )}

              {cameraError && (
                <div className="w-full p-3 border-t border-red-500/30 bg-red-950/30 text-red-300 text-xs text-center">
                  {cameraError}
                </div>
              )}
            </div>

            {/* Manual Code / Email / Phone / Barcode Gun Search */}
            <form
              onSubmit={(e) => {
                e.preventDefault();
                executeScan(searchQuery);
              }}
              className="rounded-md border border-[#262626] bg-black p-3.5 space-y-2"
            >
              <div className="flex items-center justify-between text-[11px] font-mono text-zinc-400">
                <span className="uppercase">Manual ID / Email / Barcode Gun</span>
                <span className="text-zinc-500">Supports RM-XXXX, RM-LMN-XXXX, Email, or Phone</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="relative flex-1">
                  <input
                    ref={barcodeInputRef}
                    type="text"
                    placeholder="Enter RM-8050, delegate email, or scan QR..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full h-10 pl-3 pr-9 rounded-md bg-black border border-[#262626] text-xs sm:text-sm text-white font-mono placeholder-zinc-600 focus:outline-none focus:border-white"
                  />
                  {searchQuery && (
                    <button
                      type="button"
                      onClick={() => setSearchQuery("")}
                      className="absolute right-2.5 top-2.5 text-zinc-500 hover:text-white cursor-pointer"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  )}
                </div>
                <button
                  type="submit"
                  className="h-10 px-4 rounded-md bg-white hover:bg-zinc-200 text-black font-bold text-xs uppercase tracking-wider cursor-pointer shrink-0"
                >
                  {scanMode === "BUS" ? "Verify Bus" : "Check In"}
                </button>
              </div>
            </form>
          </div>

          {/* RIGHT COLUMN: INSTANT VERIFICATION RESULT & SESSION LOG */}
          <div className="lg:col-span-5 space-y-4 flex flex-col">
            {/* Instant Badge Verification Card */}
            <div className="rounded-md border border-[#262626] bg-black p-5 min-h-[225px] flex flex-col justify-between">
              <div className="flex items-center justify-between border-b border-[#1f1f1f] pb-2.5">
                <span className="text-[10px] font-mono uppercase tracking-widest text-zinc-500">
                  {scanMode === "BUS" ? "Bus Boarding Verification" : "Gate Entry Verification"}
                </span>
                <span className="text-[10px] font-mono text-zinc-500">
                  {selectedDay} · {actionType}
                </span>
              </div>

              {activeBadge ? (
                <div className="my-auto py-3 space-y-2.5 text-center">
                  <div
                    className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded text-[11px] font-mono font-bold uppercase tracking-wider ${
                      activeBadge.status === "AUTHORIZED" || activeBadge.status === "BUS_AUTHORIZED"
                        ? activeBadge.isRepeat
                          ? "border border-white/30 bg-white/10 text-white"
                          : "bg-white text-black"
                        : activeBadge.status === "PAYMENT_UNVERIFIED"
                        ? "border border-amber-500/40 bg-amber-500/10 text-amber-300"
                        : "border border-red-500/40 bg-red-500/10 text-red-300"
                    }`}
                  >
                    {activeBadge.status === "AUTHORIZED" || activeBadge.status === "BUS_AUTHORIZED" ? (
                      <CheckCircle2 className="h-3.5 w-3.5" />
                    ) : (
                      <XCircle className="h-3.5 w-3.5" />
                    )}
                    <span>
                      {activeBadge.status === "BUS_AUTHORIZED"
                        ? activeBadge.isRepeat
                          ? "ALREADY BOARDED BUS"
                          : "BUS BOARDING AUTHORIZED"
                        : activeBadge.status === "NO_TRANSPORT"
                        ? "NO TRANSPORT PASS (SELF COMMUTE)"
                        : activeBadge.status === "AUTHORIZED"
                        ? activeBadge.isRepeat
                          ? "ALREADY CHECKED IN"
                          : "ADMISSION CONFIRMED"
                        : activeBadge.status === "PAYMENT_UNVERIFIED"
                        ? "PAYMENT NOT VERIFIED"
                        : "UNRECOGNIZED PASS"}
                    </span>
                  </div>

                  <h2 className="m-0 text-xl font-bold text-white truncate">
                    {activeBadge.delegate?.fullName || activeBadge.code}
                  </h2>

                  {activeBadge.delegate && (
                    <div className="space-y-1 text-xs">
                      <p className="m-0 text-zinc-200 font-medium">
                        {activeBadge.delegate.allocatedCommittee || "Awaiting Committee"} ·{" "}
                        {activeBadge.delegate.allocatedCountry || "Delegate"}
                      </p>
                      {scanMode === "BUS" && (
                        <p className="m-0 text-zinc-300 text-[11px] flex items-center justify-center gap-1">
                          <MapPin className="w-3 h-3 text-zinc-400 shrink-0" />
                          <span className="truncate max-w-xs">
                            {activeBadge.delegate.address || "Pickup Point · Hyderabad"} · Transport:{" "}
                            <strong>{activeBadge.delegate.transport || "No"}</strong>
                          </span>
                        </p>
                      )}
                      <p className="m-0 text-zinc-500 font-mono text-[11px]">
                        {activeBadge.delegate.regId} · {activeBadge.delegate.roleType || "DELEGATE"} · {activeBadge.time}
                      </p>
                    </div>
                  )}
                </div>
              ) : (
                <div className="my-auto py-8 text-center space-y-2">
                  {scanMode === "BUS" ? (
                    <Bus className="h-6 w-6 text-zinc-600 mx-auto" />
                  ) : (
                    <QrCode className="h-6 w-6 text-zinc-600 mx-auto" />
                  )}
                  <p className="m-0 text-xs font-mono text-zinc-500">
                    {scanMode === "BUS"
                      ? "Ready to scan pass for bus boarding..."
                      : "Ready to scan next QR pass..."}
                  </p>
                </div>
              )}

              <div className="pt-2.5 border-t border-[#1f1f1f] flex items-center justify-between text-[10px] font-mono text-zinc-500">
                <span>26–27 Dec 2026</span>
                <span>Session Scans: {scanHistory.length}</span>
              </div>
            </div>

            {/* Live Entrance / Bus Feed */}
            <div className="flex-1 rounded-md border border-[#262626] bg-black p-4 space-y-3 flex flex-col">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-mono uppercase tracking-widest text-zinc-400 flex items-center gap-1.5">
                  <History className="h-3.5 w-3.5" />
                  Recent Scans ({scanHistory.length})
                </span>
                {scanHistory.length > 0 && (
                  <button
                    type="button"
                    onClick={() => setScanHistory([])}
                    className="text-[10px] font-mono text-zinc-500 hover:text-white cursor-pointer"
                  >
                    Clear
                  </button>
                )}
              </div>

              <div className="flex-1 max-h-[320px] overflow-y-auto divide-y divide-[#1f1f1f]">
                {scanHistory.length === 0 ? (
                  <div className="py-10 text-center text-xs text-zinc-600">
                    No passes scanned in this session yet.
                  </div>
                ) : (
                  scanHistory.map((s) => (
                    <div key={s.id} className="py-2.5 flex items-center justify-between gap-2 text-xs">
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="font-semibold text-white truncate">
                            {s.delegate?.fullName || s.code}
                          </span>
                          <span className="text-[10px] font-mono text-zinc-500">{s.time}</span>
                        </div>
                        <div className="text-[11px] font-mono text-zinc-400 truncate mt-0.5">
                          {s.delegate
                            ? `${s.delegate.regId} · ${
                                s.mode === "BUS"
                                  ? `Bus: ${s.delegate.transport || "No"}`
                                  : s.delegate.allocatedCommittee || "Unassigned"
                              }`
                            : "Unrecognized credential"}
                        </div>
                      </div>
                      <span
                        className={`text-[9px] font-mono font-bold px-2 py-0.5 rounded uppercase shrink-0 ${
                          s.status === "AUTHORIZED" || s.status === "BUS_AUTHORIZED"
                            ? s.isRepeat
                              ? "border border-white/25 text-zinc-300"
                              : "bg-white text-black"
                            : s.status === "PAYMENT_UNVERIFIED"
                            ? "border border-amber-500/40 text-amber-300"
                            : "border border-red-500/40 text-red-400"
                        }`}
                      >
                        {s.status === "BUS_AUTHORIZED"
                          ? s.isRepeat
                            ? "REPEAT"
                            : "BUS OK"
                          : s.status === "NO_TRANSPORT"
                          ? "NO BUS"
                          : s.status === "AUTHORIZED"
                          ? s.isRepeat
                            ? "REPEAT"
                            : "OK"
                          : s.status === "PAYMENT_UNVERIFIED"
                          ? "UNPAID"
                          : "FAIL"}
                      </span>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
