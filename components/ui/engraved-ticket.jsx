"use client";

import React, {
  useId,
  useRef,
  useState,
  useEffect,
  useMemo,
} from "react";

/**
 * Engraved Credential Pass & Ticket — die-cut poster ticket / VIP badge
 * with authentic burin flow-field engraving or mirrored crimson acanthus ornament,
 * unique scannable QR code, and interactive breathing physics.
 */

export const clamp01 = (v) => (v > 0 ? (v < 1 ? v : 1) : 0);
export const easeSine = (v) => 0.5 - 0.5 * Math.cos(Math.PI * clamp01(v));

export const mulberry32 = (seed) => {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
};

export const hashString = (s) => {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
};

export const breathAt = (t, rhythm) => {
  const r = [0, 1, 2, 3].map((i) => (rhythm[i] > 0 ? rhythm[i] : 0));
  const total = r[0] + r[1] + r[2] + r[3];
  if (!(total > 0) || !Number.isFinite(t))
    return { value: 0, phase: 3, left: 0, index: 0 };
  const index = Math.floor(t / total);
  let u = t - index * total;
  for (let p = 0; p < 4; p++) {
    if (u < r[p] || p === 3) {
      const k = r[p] > 0 ? clamp01(u / r[p]) : 1;
      const value =
        p === 0 ? easeSine(k) : p === 1 ? 1 : p === 2 ? 1 - easeSine(k) : 0;
      return { value, phase: p, left: Math.max(0, r[p] - u), index };
    }
    u -= r[p];
  }
  return { value: 0, phase: 3, left: 0, index };
};

export const ticketPath = (w, h, r, inset) => {
  const d = inset;
  const R = r + d;
  const f = (n) => String(Math.round(n * 100) / 100);
  return (
    "M" +
    f(R) +
    " " +
    f(d) +
    "H" +
    f(w - R) +
    "A" +
    f(R) +
    " " +
    f(R) +
    " 0 0 0 " +
    f(w - d) +
    " " +
    f(R) +
    "V" +
    f(h - R) +
    "A" +
    f(R) +
    " " +
    f(R) +
    " 0 0 0 " +
    f(w - R) +
    " " +
    f(h - d) +
    "H" +
    f(R) +
    "A" +
    f(R) +
    " " +
    f(R) +
    " 0 0 0 " +
    f(d) +
    " " +
    f(h - R) +
    "V" +
    f(R) +
    "A" +
    f(R) +
    " " +
    f(R) +
    " 0 0 0 " +
    f(R) +
    " " +
    f(d) +
    "Z"
  );
};

export const barcode = (code, width) => {
  const rnd = mulberry32(hashString(code || "0"));
  const bars = [];
  let x = 0;
  while (x < width) {
    const w = 0.8 + Math.floor(rnd() * 4) * 0.9;
    if (x + w > width) break;
    bars.push({ x, w });
    x += w + 0.9 + Math.floor(rnd() * 3) * 0.9;
  }
  return bars;
};

const PAPER = {
  accent: "#d9241c",
  ink: "#111111",
  ground: "#f4f1ea",
  type: "#111111",
};
const CRIMSON = {
  accent: "#d9241c",
  ink: "#d9241c",
  ground: "#09090b",
  type: "#f4f1ea",
};

const FONT =
  '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif';

const smooth = (a, b, x) => {
  const t = clamp01((x - a) / (b - a));
  return t * t * (3 - 2 * t);
};

let grainTile = null;
const grain = () => {
  if (grainTile) return grainTile;
  if (typeof document === "undefined") return null;
  const c = document.createElement("canvas");
  c.width = 160;
  c.height = 160;
  const g = c.getContext("2d");
  if (g) {
    const img = g.createImageData(160, 160);
    const rnd = mulberry32(42);
    for (let i = 0; i < img.data.length; i += 4) {
      const v = Math.floor(rnd() * 255);
      img.data[i] = v;
      img.data[i + 1] = v;
      img.data[i + 2] = v;
      img.data[i + 3] = 255;
    }
    g.putImageData(img, 0, 0);
  }
  grainTile = c;
  return c;
};

const drawPlate = (canvas, variant, seed, pal, w, h) => {
  const ctx = canvas.getContext("2d");
  if (!ctx || !w || !h) return;
  const dpr = Math.min(typeof window !== "undefined" ? window.devicePixelRatio || 1 : 1, 2);
  canvas.width = Math.round(w * dpr);
  canvas.height = Math.round(h * dpr);
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

  ctx.fillStyle = pal.ground;
  ctx.fillRect(0, 0, w, h);

  const rnd = mulberry32(seed);

  if (variant === "crimson") {
    // Crimson Ornate Plate: engraved hatch & mirrored rosettes
    ctx.strokeStyle = pal.accent;
    ctx.globalAlpha = 0.14;
    ctx.lineWidth = 0.8;
    ctx.beginPath();
    for (let x = -h; x < w + h; x += 5) {
      ctx.moveTo(x, 0);
      ctx.lineTo(x + h, h);
    }
    ctx.stroke();
    ctx.globalAlpha = 1;

    // Corner Ornaments
    const drawRosette = (cx, cy, r) => {
      ctx.save();
      ctx.strokeStyle = pal.accent;
      ctx.fillStyle = pal.ground;
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.arc(cx, cy, r, 0, Math.PI * 2);
      ctx.stroke();
      ctx.beginPath();
      ctx.arc(cx, cy, r * 0.35, 0, Math.PI * 2);
      ctx.fillStyle = pal.accent;
      ctx.fill();
      ctx.restore();
    };

    drawRosette(35, 35, 18);
    drawRosette(w - 35, 35, 18);
    drawRosette(35, h - 35, 18);
    drawRosette(w - 35, h - 35, 18);
  } else {
    // Paper Burin Engraving: fine flowing lines
    ctx.strokeStyle = pal.ink;
    ctx.globalAlpha = 0.12;
    ctx.lineWidth = 0.7;
    for (let y = 10; y < h; y += 12) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      for (let x = 0; x <= w; x += 30) {
        const ny = y + Math.sin(x * 0.015 + seed) * 8 + Math.cos(y * 0.02) * 5;
        ctx.lineTo(x, ny);
      }
      ctx.stroke();
    }

    // A few subtle red burin accent curves
    ctx.strokeStyle = pal.accent;
    ctx.globalAlpha = 0.35;
    ctx.lineWidth = 1.4;
    for (let i = 0; i < 3; i++) {
      ctx.beginPath();
      const startY = 80 + i * 120 + rnd() * 40;
      ctx.moveTo(0, startY);
      ctx.bezierCurveTo(w * 0.3, startY - 40, w * 0.7, startY + 50, w, startY - 20);
      ctx.stroke();
    }
    ctx.globalAlpha = 1;
  }

  // Grain texture
  const gTile = grain();
  if (gTile) {
    const pat = ctx.createPattern(gTile, "repeat");
    if (pat) {
      ctx.globalCompositeOperation = variant === "crimson" ? "screen" : "multiply";
      ctx.globalAlpha = variant === "crimson" ? 0.06 : 0.08;
      ctx.fillStyle = pat;
      ctx.fillRect(0, 0, w, h);
      ctx.globalCompositeOperation = "source-over";
      ctx.globalAlpha = 1;
    }
  }
};

/**
 * EngravedTicket Component
 *
 * Supports two formats:
 * - format="badge" (default): Vertical portrait VIP credential optimized for phone check-ins and prominent scannable QR.
 * - format="stub": Horizontal landscape admission stub with dedicated prominent left-wing scan plate.
 */
export default function EngravedTicket({
  format = "badge",
  word = "RESOLVE",
  variant = "paper",
  code = "RM26-CONFIRMED",
  qrUrl = "",
  qrLabel = "DELEGATE PASS",
  delegateName = "Delegate",
  committee = "Awaiting Allotment",
  portfolio = "",
  institution = "Individual",
  tagline = "RESOLVE MUN 2.0 · HYDERABAD",
  quote = "27TH – 29TH NOVEMBER 2026",
  rhythm = [4, 2, 6, 1],
  phases = ["Inhale", "Hold", "Exhale", "Rest"],
  breathe = true,
  seed = 7,
  accent,
  ink,
  ground,
  type,
  tilt = 6,
  className = "",
}) {
  const base = variant === "crimson" ? CRIMSON : PAPER;
  const pal = {
    accent: accent || base.accent,
    ink: ink || (variant === "crimson" ? accent || base.ink : base.ink),
    ground: ground || base.ground,
    type: type || (variant === "paper" ? ink || base.type : base.type),
  };

  const cardRef = useRef(null);
  const artRef = useRef(null);
  const glareRef = useRef(null);
  const phaseRef = useRef(null);
  const countRef = useRef(null);
  const barRefs = useRef([]);

  const [holding, setHolding] = useState(false);

  const barcodeBars = useMemo(
    () => barcode(code, format === "badge" ? 180 : 160),
    [code, format]
  );

  const live = useRef({ rhythm, phases, breathe, tilt, bars: barcodeBars.length, pal });
  live.current = { rhythm, phases, breathe, tilt, bars: barcodeBars.length, pal };

  const input = useRef({
    holding: false,
    downAt: 0,
    tx: 0,
    ty: 0,
    hover: false,
  });

  // Repaint canvas when dimensions or theme changes
  useEffect(() => {
    const canvas = artRef.current;
    if (!canvas) return;
    let raf = 0;
    const paint = () => {
      raf = 0;
      const w = canvas.clientWidth;
      const h = canvas.clientHeight;
      if (!w || !h) return;
      drawPlate(canvas, variant, seed, pal, w, h);
    };
    const observer = new ResizeObserver(() => {
      if (!raf) raf = requestAnimationFrame(paint);
    });
    observer.observe(canvas);
    paint();
    return () => {
      observer.disconnect();
      cancelAnimationFrame(raf);
    };
  }, [variant, seed, pal.accent, pal.ink, pal.ground, format]);

  // Breathing & 3D Tilt Loop
  useEffect(() => {
    const card = cardRef.current;
    if (!card) return;
    let raf = 0;
    let last = performance.now();
    let t0 = last;
    let manual = false;
    let value = 0;
    let cycle = 0;
    let count = 0;
    let lit = -1;
    let label = "";
    let vx = 0;
    let vy = 0;

    const frame = (now) => {
      raf = 0;
      const dt = Math.min(0.05, (now - last) / 1000);
      last = now;
      const cfg = live.current;
      const inp = input.current;
      let phase = 3;
      let left = 0;

      if (inp.holding && !manual) manual = true;
      if (manual) {
        if (inp.holding) {
          value = Math.min(1, value + dt / Math.max(0.5, cfg.rhythm[0]));
          phase = value >= 1 ? 1 : 0;
          left = (1 - value) * cfg.rhythm[0];
        } else {
          value = Math.max(0, value - dt / Math.max(0.5, cfg.rhythm[2]));
          phase = 2;
          left = value * cfg.rhythm[2];
          if (value <= 0) {
            manual = false;
            t0 = now;
            cycle = 0;
            count++;
            if (countRef.current) countRef.current.textContent = "Nº " + String(count).padStart(3, "0");
          }
        }
      } else if (cfg.breathe) {
        const b = breathAt((now - t0) / 1000, cfg.rhythm);
        if (b.index > cycle) {
          cycle = b.index;
          count++;
          if (countRef.current) countRef.current.textContent = "Nº " + String(count).padStart(3, "0");
        }
        value = b.value;
        phase = b.phase;
        left = b.left;
      }

      const shown = manual ? easeSine(value) : value;

      // Update Barcode Breath Meter
      const on = Math.round(shown * cfg.bars);
      if (on !== lit) {
        lit = on;
        for (let i = 0; i < barRefs.current.length; i++) {
          const bar = barRefs.current[i];
          if (bar) bar.setAttribute("fill", i < on ? cfg.pal.accent : (variant === "crimson" ? "rgba(244,241,234,0.4)" : "rgba(17,17,17,0.4)"));
        }
      }

      const text = cfg.phases[phase] + " · " + Math.max(1, Math.ceil(left - 1e-3));
      if (text !== label && phaseRef.current) {
        label = text;
        phaseRef.current.textContent = text;
      }

      // 3D Tilt Easing
      const k = Math.min(1, dt * 7);
      vx += ((inp.hover ? inp.tx : 0) - vx) * k;
      vy += ((inp.hover ? inp.ty : 0) - vy) * k;
      const press = inp.holding ? 0.985 : 1;
      card.style.transform =
        "rotateX(" + (-vy * cfg.tilt).toFixed(2) + "deg) rotateY(" + (vx * cfg.tilt).toFixed(2) + "deg) scale(" + press + ")";

      const glare = glareRef.current;
      if (glare) {
        glare.style.opacity = inp.hover ? "1" : "0";
        glare.style.background =
          "radial-gradient(circle at " +
          (50 + vx * 50).toFixed(1) +
          "% " +
          (50 + vy * 50).toFixed(1) +
          "%, rgba(255,255,255,0.25), rgba(255,255,255,0) 50%)";
      }

      if (manual || cfg.breathe || inp.hover || Math.abs(vx) > 1e-3) {
        raf = requestAnimationFrame(frame);
      }
    };
    raf = requestAnimationFrame(frame);

    return () => cancelAnimationFrame(raf);
  }, [variant]);

  const aim = (e) => {
    const card = cardRef.current;
    if (!card) return;
    const r = card.getBoundingClientRect();
    input.current.tx = ((e.clientX - r.left) / Math.max(1, r.width)) * 2 - 1;
    input.current.ty = ((e.clientY - r.top) / Math.max(1, r.height)) * 2 - 1;
  };

  const isCrimson = variant === "crimson";
  const textColor = isCrimson ? pal.type : pal.ink;
  const mutedText = isCrimson ? "rgba(244,241,234,0.6)" : "rgba(17,17,17,0.6)";
  const borderColor = isCrimson ? "rgba(217,36,28,0.35)" : "rgba(17,17,17,0.2)";

  // =========================================================================
  // FORMAT 1: VERTICAL BADGE (DEFAULT - MAXIMUM PHONE & SCANNER VISIBILITY)
  // =========================================================================
  if (format === "badge") {
    return (
      <div className={"relative select-none " + className} style={{ width: "100%", maxWidth: "420px", perspective: "1400px" }}>
        <div
          ref={cardRef}
          role="button"
          tabIndex={0}
          aria-label={`${delegateName} Entry Pass - ${code}`}
          className="relative rounded-3xl overflow-hidden outline-none cursor-pointer transition-shadow"
          style={{
            background: pal.ground,
            color: textColor,
            border: `1.5px solid ${borderColor}`,
            boxShadow: "0 25px 50px -12px rgba(0,0,0,0.6), 0 4px 12px rgba(0,0,0,0.3)",
            willChange: "transform",
          }}
          onPointerEnter={(e) => {
            input.current.hover = true;
            aim(e);
          }}
          onPointerMove={aim}
          onPointerLeave={() => {
            input.current.hover = false;
            input.current.holding = false;
            setHolding(false);
          }}
          onPointerDown={() => {
            input.current.holding = true;
            setHolding(true);
          }}
          onPointerUp={() => {
            input.current.holding = false;
            setHolding(false);
          }}
          onKeyDown={(e) => {
            if (e.key === " " && !e.repeat) {
              e.preventDefault();
              input.current.holding = true;
              setHolding(true);
            }
          }}
          onKeyUp={(e) => {
            if (e.key === " ") {
              e.preventDefault();
              input.current.holding = false;
              setHolding(false);
            }
          }}
        >
          {/* Canvas Plate Underneath */}
          <canvas ref={artRef} aria-hidden="true" className="absolute inset-0 block w-full h-full pointer-events-none" />

          {/* Lanyard Punch Hole Inset at Top */}
          <div className="relative pt-4 pb-2 flex justify-center">
            <div
              className="w-14 h-3.5 rounded-full border"
              style={{
                borderColor: borderColor,
                background: isCrimson ? "#000000" : "#d8d3c7",
                boxShadow: "inset 0 1px 3px rgba(0,0,0,0.5)",
              }}
            />
          </div>

          <div className="relative z-10 px-6 pb-6 pt-2 space-y-4">
            {/* Header Communiqué */}
            <div className="text-center space-y-1 border-b pb-3" style={{ borderColor: borderColor }}>
              <div className="flex items-center justify-between font-mono text-[9px] uppercase tracking-[0.2em] font-semibold" style={{ color: mutedText }}>
                <span>HYDERABAD 2026</span>
                <span>MERIDIAN KOMPALLY</span>
              </div>
              <h2 className="text-lg sm:text-xl font-extrabold uppercase tracking-tight text-inherit font-sans" style={{ letterSpacing: "-0.01em" }}>
                RESOLVE MUN 2.0
              </h2>
              <div className="inline-block px-2.5 py-0.5 rounded border text-[10px] font-mono font-bold tracking-widest uppercase"
                style={{
                  borderColor: pal.accent,
                  color: isCrimson ? pal.accent : "#c92018",
                  background: isCrimson ? "rgba(217,36,28,0.12)" : "rgba(217,36,28,0.06)",
                }}
              >
                {qrLabel}
              </div>
            </div>

            {/* THE PROMINENT LARGE SCANNABLE QR CODE (CENTER STAGE) */}
            <div className="flex flex-col items-center justify-center my-1">
              <div
                className="relative p-3.5 rounded-2xl border flex flex-col items-center justify-center"
                style={{
                  background: "#ffffff",
                  borderColor: isCrimson ? "rgba(255,255,255,0.4)" : "rgba(0,0,0,0.2)",
                  boxShadow: "0 16px 32px -4px rgba(0,0,0,0.4), 0 2px 6px rgba(0,0,0,0.1)",
                }}
              >
                {/* 220px Sharp Scannable QR Code */}
                <img
                  src={qrUrl}
                  alt={`Official Entry QR for ${delegateName}`}
                  className="w-52 h-52 sm:w-56 sm:h-56 block object-contain"
                  style={{ imageRendering: "pixelated" }}
                />

                <div className="mt-2 text-center">
                  <span className="font-mono text-[11px] font-extrabold tracking-widest uppercase text-black block">
                    {code}
                  </span>
                  <span className="text-[9px] font-sans font-semibold text-neutral-500 uppercase tracking-wider block">
                    Official Scannable Credential
                  </span>
                </div>
              </div>
            </div>

            {/* Delegate Details */}
            <div className="text-center space-y-1">
              <h3 className="text-xl font-extrabold tracking-tight text-inherit font-sans leading-tight">
                {delegateName}
              </h3>
              <p className="text-xs font-mono font-bold" style={{ color: isCrimson ? pal.accent : "#c92018" }}>
                {committee} {portfolio ? `· ${portfolio}` : ""}
              </p>
              {institution && (
                <p className="text-[11px] font-sans" style={{ color: mutedText }}>
                  {institution}
                </p>
              )}
            </div>

            {/* Barcode Breath Meter */}
            <div className="pt-2 border-t space-y-1.5" style={{ borderColor: borderColor }}>
              <div className="flex justify-center">
                <svg
                  aria-hidden="true"
                  viewBox={`0 0 180 14`}
                  className="w-full max-w-[200px] h-3.5 block"
                  preserveAspectRatio="none"
                >
                  {barcodeBars.map((b, i) => (
                    <rect
                      key={i}
                      ref={(el) => (barRefs.current[i] = el)}
                      x={b.x}
                      y={0}
                      width={b.w}
                      height={14}
                      fill={isCrimson ? "rgba(244,241,234,0.4)" : "rgba(17,17,17,0.4)"}
                    />
                  ))}
                </svg>
              </div>
              <div className="flex items-center justify-between font-mono text-[9px] tracking-wider uppercase" style={{ color: mutedText }}>
                <span ref={phaseRef}>{phases[0]}</span>
                <span>HOLD TO INHALE</span>
                <span ref={countRef}>Nº 000</span>
              </div>
            </div>

            {/* Security Verification Stamp */}
            <div className="text-center font-mono text-[9px] uppercase tracking-wider pt-1 opacity-70">
              <span>27TH – 29TH NOVEMBER 2026 · MERIDIAN SCHOOL</span>
            </div>
          </div>

          {/* Glare Reflection */}
          <div
            ref={glareRef}
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 transition-opacity duration-300"
            style={{ opacity: 0 }}
          />
        </div>
      </div>
    );
  }

  // =========================================================================
  // FORMAT 2: LANDSCAPE TICKET STUB (WITH DEDICATED FULL-SIZE LEFT QR STUB)
  // =========================================================================
  return (
    <div className={"relative select-none " + className} style={{ width: "100%", maxWidth: "860px", perspective: "1600px" }}>
      <div
        ref={cardRef}
        role="button"
        tabIndex={0}
        aria-label={`${delegateName} Ticket - ${code}`}
        className="relative rounded-2xl overflow-hidden outline-none cursor-pointer transition-shadow"
        style={{
          background: pal.ground,
          color: textColor,
          border: `1.5px solid ${borderColor}`,
          boxShadow: "0 25px 50px -12px rgba(0,0,0,0.6), 0 4px 12px rgba(0,0,0,0.3)",
          willChange: "transform",
        }}
        onPointerEnter={(e) => {
          input.current.hover = true;
          aim(e);
        }}
        onPointerMove={aim}
        onPointerLeave={() => {
          input.current.hover = false;
          input.current.holding = false;
          setHolding(false);
        }}
        onPointerDown={() => {
          input.current.holding = true;
          setHolding(true);
        }}
        onPointerUp={() => {
          input.current.holding = false;
          setHolding(false);
        }}
      >
        <canvas ref={artRef} aria-hidden="true" className="absolute inset-0 block w-full h-full pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row items-stretch">
          {/* LEFT WING: DEDICATED PROMINENT SCAN STUB (LARGE SCANNABLE QR) */}
          <div
            className="md:w-[320px] shrink-0 p-5 sm:p-6 flex flex-col items-center justify-between text-center border-b md:border-b-0 md:border-r border-dashed"
            style={{ borderColor: borderColor }}
          >
            <div className="w-full">
              <span className="font-mono text-[9px] uppercase tracking-[0.2em] block font-bold" style={{ color: mutedText }}>
                OFFICIAL ENTRY STUB
              </span>
              <span className="font-mono text-xs font-extrabold uppercase tracking-widest block text-inherit mt-0.5">
                {code}
              </span>
            </div>

            {/* LARGE 200px HIGH-CONTRAST QR CODE */}
            <div
              className="my-3 p-3 rounded-xl bg-white border border-neutral-300 shadow-md flex flex-col items-center justify-center"
            >
              <img
                src={qrUrl}
                alt="Entry QR Code"
                className="w-44 h-44 sm:w-48 sm:h-48 block object-contain"
                style={{ imageRendering: "pixelated" }}
              />
              <span className="font-mono text-[10px] font-bold text-black tracking-wider uppercase mt-1">
                SCAN FOR ADMISSION
              </span>
            </div>

            <div className="w-full space-y-0.5">
              <span className="font-sans font-bold text-sm block truncate text-inherit">
                {delegateName}
              </span>
              <span className="font-mono text-[10px] font-semibold block uppercase" style={{ color: pal.accent }}>
                {qrLabel}
              </span>
            </div>
          </div>

          {/* RIGHT WING: KEEPSAKE ENGRAVED TICKET BODY */}
          <div className="flex-1 p-6 sm:p-7 flex flex-col justify-between space-y-4">
            <div className="flex items-start justify-between gap-4">
              <div>
                <span className="font-mono text-[9px] uppercase tracking-[0.2em] font-semibold block" style={{ color: mutedText }}>
                  {tagline}
                </span>
                <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight uppercase text-inherit font-sans mt-0.5">
                  RESOLVE MUN 2.0
                </h1>
              </div>
              <div className="text-right font-mono text-[10px] uppercase font-bold" style={{ color: mutedText }}>
                <span>{quote}</span>
              </div>
            </div>

            <div className="space-y-1 py-1">
              <div className="text-xs uppercase font-mono tracking-wider font-semibold" style={{ color: mutedText }}>
                COMMITTEE ALLOTMENT
              </div>
              <div className="text-lg font-bold text-inherit font-sans">
                {committee}
              </div>
              {portfolio && (
                <div className="text-sm font-semibold font-mono" style={{ color: pal.accent }}>
                  {portfolio}
                </div>
              )}
            </div>

            <p className="text-xs leading-relaxed font-sans opacity-75 max-w-md">
              Valid official credential for all committee proceedings, official socials, and plenary sessions convening at Meridian School, Kompally, Hyderabad. Non-transferable.
            </p>

            {/* Barcode & Breath Meter */}
            <div className="pt-3 border-t space-y-1.5" style={{ borderColor: borderColor }}>
              <svg
                aria-hidden="true"
                viewBox={`0 0 160 12`}
                className="w-full max-w-[220px] h-3 block"
                preserveAspectRatio="none"
              >
                {barcodeBars.map((b, i) => (
                  <rect
                    key={i}
                    ref={(el) => (barRefs.current[i] = el)}
                    x={b.x}
                    y={0}
                    width={b.w}
                    height={12}
                    fill={isCrimson ? "rgba(244,241,234,0.4)" : "rgba(17,17,17,0.4)"}
                  />
                ))}
              </svg>
              <div className="flex items-center justify-between font-mono text-[9px] tracking-wider uppercase" style={{ color: mutedText }}>
                <span ref={phaseRef}>{phases[0]}</span>
                <span>HOLD TO INHALE</span>
                <span ref={countRef}>Nº 000</span>
              </div>
            </div>
          </div>
        </div>

        <div
          ref={glareRef}
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 transition-opacity duration-300"
          style={{ opacity: 0 }}
        />
      </div>
    </div>
  );
}
