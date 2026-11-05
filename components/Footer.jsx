"use client";

// Ridgeline Dither Footer — Resolve MUN 2.0
// Monochrome Black & White · End-to-End · Professional Editorial

import * as React from "react";
import Link from "next/link";

export const RDF_BAYER = [
  0, 32, 8, 40, 2, 34, 10, 42, 48, 16, 56, 24, 50, 18, 58, 26,
  12, 44, 4, 36, 14, 46, 6, 38, 60, 28, 52, 20, 62, 30, 54, 22,
  3, 35, 11, 43, 1, 33, 9, 41, 51, 19, 59, 27, 49, 17, 57, 25,
  15, 47, 7, 39, 13, 45, 5, 37, 63, 31, 55, 23, 61, 29, 53, 21,
].map((v) => (v + 0.5) / 64);

export function rdfHex(hex) {
  const m = /^#?([0-9a-f]{3}|[0-9a-f]{6})$/i.exec((hex || "").trim());
  if (!m) return null;
  const h = m[1].length === 3 ? m[1].split("").map((c) => c + c).join("") : m[1];
  return [parseInt(h.slice(0, 2), 16), parseInt(h.slice(2, 4), 16), parseInt(h.slice(4, 6), 16)];
}

export function rdfPack(rgb) {
  return ((255 << 24) | (rgb[2] << 16) | (rgb[1] << 8) | rgb[0]) >>> 0;
}

export function rdfDither(tone, n, b) {
  const t = tone < 0 ? 0 : tone > 1 ? 1 : tone;
  const v = Math.floor(t * (n - 1) + b);
  return v > n - 1 ? n - 1 : v;
}

export function rdfHash(x, y, seed) {
  let h = Math.imul(x | 0, 374761393) + Math.imul(y | 0, 668265263) + Math.imul(seed | 0, 1442695041);
  h = Math.imul(h ^ (h >>> 13), 1274126177);
  h ^= h >>> 16;
  return (h >>> 0) / 4294967296;
}

export function rdfNoise(x, y, seed) {
  const xi = Math.floor(x);
  const yi = Math.floor(y);
  const xf = x - xi;
  const yf = y - yi;
  const u = xf * xf * (3 - 2 * xf);
  const v = yf * yf * (3 - 2 * yf);
  const a = rdfHash(xi, yi, seed);
  const b = rdfHash(xi + 1, yi, seed);
  const c = rdfHash(xi, yi + 1, seed);
  const d = rdfHash(xi + 1, yi + 1, seed);
  return a + (b - a) * u + (c - a) * v + (a - b - c + d) * u * v;
}

export function rdfFbm(x, y, seed, octaves) {
  let sum = 0;
  let amp = 0.5;
  let norm = 0;
  for (let o = 0; o < octaves; o++) {
    sum += rdfNoise(x, y, seed + o * 31) * amp;
    norm += amp;
    x *= 2.03;
    y *= 2.03;
    amp *= 0.5;
  }
  return norm > 0 ? sum / norm : 0;
}

export function rdfSmooth(e0, e1, x) {
  const t = e1 === e0 ? (x < e0 ? 0 : 1) : Math.min(1, Math.max(0, (x - e0) / (e1 - e0)));
  return t * t * (3 - 2 * t);
}

export function rdfEase(t) {
  const c = t < 0 ? 0 : t > 1 ? 1 : t;
  return 1 - Math.pow(1 - c, 3);
}

export function rdfRidgeline(cols, rows, i, layers, seed, margin) {
  const k = layers > 1 ? i / (layers - 1) : 1;
  const n = cols + margin * 2;
  const out = new Float32Array(n);
  const base = rows * (0.38 + 0.66 * Math.pow(k, 1.4));
  const amp = rows * (0.2 + 0.24 * k);
  const freq = 6 - 3.8 * k;
  const flankL = rows * 0.5 * k * k * k * (0.55 + 0.6 * rdfHash(i, 11, seed));
  const flankR = rows * 0.5 * k * k * k * (0.55 + 0.6 * rdfHash(i, 13, seed));
  const ceil = rows * 0.17;
  const tilt = (rdfHash(i, 7, seed) - 0.5) * rows * 0.34 * (0.4 + k);
  const s = (seed | 0) * 13 + i * 101;
  for (let x = 0; x < n; x++) {
    const u = (x - margin) / cols;
    const r1 = 1 - Math.abs(rdfNoise(u * freq + i * 3.7, 0.5, s) * 2 - 1);
    const r2 = 1 - Math.abs(rdfNoise(u * freq * 2.3, 3.5, s + 1) * 2 - 1);
    const f = rdfFbm(u * freq * 4.1, 9.5, s + 2, 3);
    const h = r1 * r1 * 0.62 + r2 * 0.24 + f * 0.14;
    const e = Math.min(1.2, Math.abs(u * 2 - 1));
    const y = base - h * amp + tilt * (u - 0.5) * 2 - (u < 0.5 ? flankL : flankR) * e * e * Math.sqrt(e);
    out[x] = y < ceil ? ceil - (ceil - y) * 0.25 : y;
  }
  return out;
}

export function rdfElevation(crest, rows, layer, layers) {
  const up = rows > 0 ? 1 - Math.min(1, Math.max(0, crest / rows)) : 0;
  return Math.round(540 + up * 3200 + (layers - 1 - layer) * 180);
}

const RDF_CSS = `
.rdf-root {
  position: relative; display: block; width: 100%; overflow: hidden; isolation: isolate;
  background: var(--rdf-paper); color: var(--rdf-ink); font-family: var(--rdf-sans);
  -webkit-font-smoothing: antialiased;
  border-top: 1px solid rgba(255, 255, 255, 0.08);
}
.rdf-frame {
  position: relative; display: flex; flex-direction: column;
  width: 100%; max-width: 100%; margin: 0; padding: 0;
}

.rdf-r {
  opacity: 0; transform: translateY(12px); filter: blur(4px);
  transition: opacity .8s cubic-bezier(.2,.7,.1,1), transform .9s cubic-bezier(.2,.7,.1,1), filter .8s ease;
  transition-delay: calc(var(--d, 0) * 1ms);
}
.rdf-in .rdf-r { opacity: 1; transform: none; filter: none; }

.rdf-top {
  position: relative; z-index: 2; width: 100%;
  display: grid; grid-template-columns: minmax(0, 2fr) repeat(var(--rdf-n), minmax(0, 1fr));
  gap: clamp(24px, 4vw, 48px);
  padding: clamp(52px, 6vw, 84px) clamp(24px, 5vw, 72px) clamp(32px, 4vw, 56px);
}
.rdf-brand { display: flex; flex-direction: column; align-items: flex-start; gap: 18px; }
.rdf-logo {
  display: inline-flex; align-items: center; gap: 12px; color: #ffffff; text-decoration: none;
  font-size: 26px; font-weight: 700; letter-spacing: .08em; line-height: 1; font-family: 'Bebas Neue', sans-serif;
}
.rdf-logo img { width: 32px; height: 32px; object-fit: contain; }
.rdf-tag {
  margin: 0; max-width: 44ch; font-size: 13.5px; line-height: 1.6; color: var(--rdf-muted);
  font-weight: 400; text-wrap: pretty; letter-spacing: -0.01em;
}

.rdf-social { display: flex; gap: 8px; margin: 2px 0 0 0; padding: 0; list-style: none; }
.rdf-social a {
  display: grid; place-items: center; width: 34px; height: 34px; border-radius: 9px; color: var(--rdf-muted);
  background: rgba(255, 255, 255, 0.04); border: 1px solid rgba(255, 255, 255, 0.08);
  transition: color .2s ease, background-color .2s ease, border-color .2s ease, transform .25s ease;
}
.rdf-social a:hover { color: #ffffff; background: rgba(255, 255, 255, 0.12); border-color: rgba(255, 255, 255, 0.25); transform: translateY(-2px); }
.rdf-social svg { width: 15px; height: 15px; display: block; }

.rdf-col h3 {
  margin: 4px 0 18px; font-size: 11px; font-weight: 600; line-height: 1;
  letter-spacing: .18em; text-transform: uppercase; color: #ffffff;
}
.rdf-col ul { list-style: none; margin: 0; padding: 0; display: grid; gap: 12px; }
.rdf-link {
  position: relative; display: inline-flex; align-items: center; gap: 8px;
  color: var(--rdf-muted); text-decoration: none; font-size: 13.5px; line-height: 1.4;
  background: transparent; border: none; padding: 0; cursor: pointer; text-align: left;
  transition: color .2s ease, transform .25s ease;
}
.rdf-link::before {
  content: ""; position: absolute; left: -10px; top: 50%; width: 5px; height: 1px; background: #ffffff;
  transform: scaleX(0); transform-origin: 0 50%; transition: transform .25s ease;
}
.rdf-link:hover { color: #ffffff; transform: translateX(6px); }
.rdf-link:hover::before { transform: scaleX(1); }

.rdf-bar {
  position: relative; z-index: 2; width: 100%;
  display: flex; justify-content: space-between; align-items: center; gap: 16px;
  padding: 0 clamp(24px, 5vw, 72px); font-size: 11.5px; color: var(--rdf-muted);
}
.rdf-bar p {
  margin: 0;
  font-size: 10.5px;
  font-weight: 500;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  color: rgba(255, 255, 255, 0.42);
  font-family: var(--rdf-sans);
}
.rdf-credit {
  display: inline-flex;
  align-items: center;
  color: rgba(255, 255, 255, 0.55);
  font-size: 11.5px;
  letter-spacing: 0.02em;
  font-weight: 450;
  text-decoration: none;
  transition: color .2s ease;
}
.rdf-credit:hover { color: #ffffff; }
.rdf-heart { display: inline-block; width: 11px; height: 11px; margin: 0 4px; vertical-align: -1px; color: #ffffff; }

.rdf-scene {
  position: relative;
  z-index: 1;
  width: 100%;
  height: 340px;
  min-height: 280px;
  margin-top: -48px;
  overflow: hidden;
}
.rdf-scene canvas {
  position: absolute;
  left: 0;
  bottom: 0;
  width: 100%;
  height: 100%;
  display: block;
  max-width: none;
  image-rendering: pixelated;
  image-rendering: crisp-edges;
}
.rdf-alt {
  position: absolute; left: 0; top: 0; z-index: 2; pointer-events: none; opacity: 0;
  transition: opacity .35s ease; font-size: 11px; font-weight: 500; font-family: monospace; letter-spacing: .08em; color: #ffffff;
}
.rdf-alt i {
  position: absolute; left: -4px; top: -4px; width: 8px; height: 8px; border-radius: 50%;
  background: #000000; box-shadow: 0 0 0 1.5px #ffffff, 0 0 12px rgba(255, 255, 255, 0.7);
}
.rdf-alt b { position: absolute; left: -.5px; bottom: 6px; width: 1px; height: 26px; background: #ffffff; opacity: .7; }
.rdf-alt span {
  position: absolute; left: 0; bottom: 34px; transform: translateX(-50%); white-space: nowrap; padding: 4px 8px;
  border-radius: 5px; background: rgba(0, 0, 0, 0.9); box-shadow: 0 0 0 1px rgba(255, 255, 255, 0.25);
  -webkit-backdrop-filter: blur(8px); backdrop-filter: blur(8px); color: #ffffff;
}
.rdf-sr { position: absolute; width: 1px; height: 1px; overflow: hidden; clip-path: inset(50%); white-space: nowrap; }

@media (max-width: 860px) {
  .rdf-top { grid-template-columns: minmax(0, 1fr) minmax(0, 1fr); row-gap: 36px; }
  .rdf-brand { grid-column: 1 / -1; }
  .rdf-bar { flex-direction: column; align-items: flex-start; gap: 8px; }
  .rdf-scene { margin-top: -36px; }
}
@media (prefers-reduced-motion: reduce) {
  .rdf-r, .rdf-link, .rdf-link::before, .rdf-social a { transition: none; }
  .rdf-r { filter: none; }
}
`;

// Pure Monochrome Black & White Palette
const MONOCHROME_PALETTE = {
  paper: "#000000",
  ink: "#ffffff",
  muted: "#8e8e93",
  line: "rgba(255, 255, 255, 0.08)",
  heart: "#ffffff",
  tones: [
    "#000000",
    "#141419",
    "#24242e",
    "#3d3d4b",
    "#5e5e72",
    "#8b8ba4",
    "#c4c4dc",
    "#ffffff",
  ],
};

export default function Footer() {
  const rootRef = React.useRef(null);
  const sceneRef = React.useRef(null);
  const canvasRef = React.useRef(null);
  const altRef = React.useRef(null);
  const altTextRef = React.useRef(null);
  const revealAt = React.useRef(null);
  const [inView, setInView] = React.useState(false);

  const colors = MONOCHROME_PALETTE;
  const tones = colors.tones;
  const layers = 6;
  const pixel = 2;
  const seed = 53;

  const handleOpenTermsModal = (tab = "delegate") => (e) => {
    if (e && e.preventDefault) e.preventDefault();
    if (typeof window !== "undefined" && typeof window.openTermsModal === "function") {
      window.openTermsModal(tab);
    }
  };

  const handleOpenCommitteeIntro = (e) => {
    if (e && e.preventDefault) e.preventDefault();
    if (typeof window !== "undefined" && typeof window.openCommitteeIntro === "function") {
      window.openCommitteeIntro();
    }
  };

  const handleOpenCommModal = (title, icon) => {
    if (typeof window !== "undefined" && typeof window.openCommModal === "function") {
      window.openCommModal(title, icon);
    }
  };

  const columns = [
    {
      title: "Conference",
      links: [
        { label: "About", href: "/#about" },
        { label: "Founder's Letter", href: "/#letter" },
        { label: "Committees", href: "/#committees" },
        { label: "Official Passes", href: "/#delegate-pass" },
        { label: "Host Campus", href: "/#venue" },
      ],
    },
    {
      title: "Resources",
      links: [
        { label: "Background Guides", onClick: handleOpenCommitteeIntro },
        { label: "Delegate Guide", onClick: (e) => { e.preventDefault(); handleOpenCommModal("Delegate Guide", "📖"); } },
        { label: "Terms & Conditions", onClick: handleOpenTermsModal("delegate") },
        { label: "Privacy Policy", onClick: handleOpenTermsModal("privacy") },
      ],
    },
  ];

  const opts = React.useRef({ mist: 0.75, drift: 1, radius: 140, interactive: true, altimeter: true });

  // Intersection reveal
  React.useEffect(() => {
    const root = rootRef.current;
    if (!root) return;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (revealAt.current === null) {
      revealAt.current = reduced ? -Infinity : performance.now();
    }
    setInView(true);
    const io = new IntersectionObserver(
      (entries) => {
        if (!entries.some((e) => e.isIntersecting)) return;
        setInView(true);
        io.disconnect();
      },
      { threshold: 0.01 }
    );
    io.observe(root);
    return () => io.disconnect();
  }, []);

  // Ridgeline dither canvas rendering loop
  React.useEffect(() => {
    const root = rootRef.current;
    const scene = sceneRef.current;
    const canvas = canvasRef.current;
    if (!root || !scene || !canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const isMobile = window.innerWidth <= 640 || window.matchMedia("(pointer: coarse)").matches;
    const pal = new Uint32Array(tones.map((t) => rdfPack(rdfHex(t) || [128, 128, 128])));
    const nTones = pal.length;

    let p = 2;
    let cols = 1;
    let rows = 1;
    let margin = 2;
    let img = null;
    let buf = new Uint32Array(0);
    let tops = [];
    let pools = [];
    let colTop = new Float32Array(0);
    let colSlope = new Float32Array(0);
    let colPool = new Float32Array(0);
    let fog = new Float32Array(0);
    let fw = 1;
    let fh = 1;
    let ceil = 0;
    let fadeTo = 1;

    let raf = 0;
    let visible = true;
    let awake = true;
    let lastDraw = 0;
    let lastTick = performance.now();
    let tx = 0;
    let ty = 0;
    let ex = 0;
    let ey = 0;
    let inside = false;
    let clear = 0;
    let pt = 0;
    let pe = 0;
    let windV = 0;
    let windX = 0;
    let altShown = false;
    let altLabel = "";

    const layout = () => {
      const rect = scene.getBoundingClientRect();
      p = isMobile ? 3 : Math.max(1, Math.round(pixel));
      const sceneW = rect.width || (typeof window !== "undefined" ? window.innerWidth : 1200);
      const sceneH = isMobile ? 150 : Math.max(260, rect.height || 340);
      cols = Math.max(8, Math.ceil(sceneW / p));
      rows = Math.max(8, Math.ceil(sceneH / p));
      canvas.width = cols;
      canvas.height = rows;
      canvas.style.width = "100%";
      canvas.style.height = "100%";
      img = ctx.createImageData(cols, rows);
      buf = new Uint32Array(img.data.buffer);
      margin = Math.ceil(cols * 0.045) + 3;
      ceil = Math.max(rows * 0.17, 92 / p);
      fadeTo = Math.max(rows * 0.3, 128 / p);
      tops = [];
      pools = [];
      for (let i = 0; i < layers; i++) {
        const t = rdfRidgeline(cols, rows, i, layers, seed, margin);
        for (let x = 0; x < t.length; x++) if (t[x] < ceil) t[x] = ceil - (ceil - t[x]) * 0.2;
        const pool = new Float32Array(t.length);
        for (let x = 0; x < t.length; x++) pool[x] = 0.45 + 1.1 * rdfFbm(((x - margin) / cols) * 4, i * 5.3, seed + 9, 2);
        tops.push(t);
        pools.push(pool);
      }
      colTop = new Float32Array(layers * cols);
      colSlope = new Float32Array(layers * cols);
      colPool = new Float32Array(layers * cols);
      fw = (cols >> 1) + 2;
      fh = (rows >> 1) + 2;
      fog = new Float32Array(fw * fh);
      awake = true;
    };

    const draw = (now) => {
      if (!img) return;
      const o = opts.current;
      const dt = Math.min(64, now - lastTick);
      lastTick = now;
      const live = o.interactive && !reduced;
      const age = revealAt.current === null ? -1 : now - revealAt.current;

      const ease = 1 - Math.pow(0.82, dt / 16.7);
      const slow = 1 - Math.pow(0.93, dt / 16.7);
      ex += (tx - ex) * ease;
      ey += (ty - ey) * ease;
      clear += ((inside && o.interactive ? 1 : 0) - clear) * slow;
      pe += ((live ? pt : 0) - pe) * slow;
      windV *= Math.pow(0.965, dt / 16.7);
      windX += (windV * dt) / 1000;
      const fogT = (reduced ? 0 : (now / 1000) * 0.045 * Math.max(0, o.drift)) + windX;

      const sx = 9 / cols;
      const sy = 4.4 / rows;
      for (let gy = 0; gy < fh; gy++) {
        const ny = gy * sy;
        for (let gx = 0; gx < fw; gx++) {
          const nx = gx * sx + fogT;
          const warp = rdfNoise(nx * 0.45 - fogT * 0.6, ny * 0.8, 77) * 0.6;
          const v = rdfFbm(nx + warp, ny + warp * 0.4, 31, 3);
          fog[gy * fw + gx] = rdfSmooth(0.3, 0.74, v);
        }
      }

      const rev = new Float32Array(layers);
      const k = new Float32Array(layers);
      const toneBase = new Float32Array(layers);
      const fogDepth = new Float32Array(layers);
      for (let i = 0; i < layers; i++) {
        k[i] = i / (layers - 1);
        rev[i] = age < 0 ? 0 : rdfEase((age - 380 - i * 170) / 1300);
        toneBase[i] = 0.16 + 0.76 * Math.pow(k[i], 1.6);
        fogDepth[i] = rows * (0.08 + 0.42 * k[i]);
        const rise = (1 - rev[i]) * rows * 0.09;
        const shift = Math.round(pe * (0.25 + k[i]) * 0.75 * (margin - 3));
        const t = tops[i];
        const last = t.length - 1;
        for (let x = 0; x < cols; x++) {
          const at = x + margin + shift;
          colTop[i * cols + x] = t[at] + rise;
          colSlope[i * cols + x] = t[Math.min(last, at + 2)] - t[Math.max(0, at - 2)];
          colPool[i * cols + x] = fogDepth[i] * pools[i][at];
        }
      }
      const lift = age < 0 ? 1 : 1 - rdfEase((age - 900) / 1800);
      const mistK = Math.max(0, Math.min(1, o.mist));
      const r = Math.max(1, o.radius / p);
      const r2 = r * r;

      for (let y = 0; y < rows; y++) {
        const fade = rdfSmooth(0, fadeTo, y);
        const frow = (y >> 1) * fw;
        const by = (y & 7) * 8;
        const dyc = (y - ey) * 1.5;
        for (let x = 0; x < cols; x++) {
          let L = -1;
          for (let i = layers - 1; i >= 0; i--) {
            if (y >= colTop[i * cols + x]) {
              L = i;
              break;
            }
          }
          let tone = 0;
          let mk = 0.3;
          if (L >= 0) {
            const kk = k[L];
            const d = y - colTop[L * cols + x];
            const depth = colPool[L * cols + x];
            const crest = 1 - rdfSmooth(0, depth, d) * (0.88 - 0.45 * kk);
            tone = toneBase[L] * crest;
            const sl = colSlope[L * cols + x] * 0.06;
            tone += (sl < -0.2 ? -0.2 : sl > 0.2 ? 0.2 : sl) * (1 - rdfSmooth(0, depth * 0.5, d));
            tone += (rdfHash(x + Math.round(colTop[L * cols + x] * 7), d | 0, L) - 0.5) * 0.07 * kk;
            tone *= rev[L];
            mk = 0.95 - 0.5 * kk;
          } else {
            tone = 0.05 * rdfSmooth(rows * 0.15, rows * 0.6, y);
          }

          let m = fog[frow + (x >> 1)] * mistK * mk;
          if (clear > 0.01) {
            const dx = x - ex;
            const q = (dx * dx + dyc * dyc) / r2;
            if (q < 4) {
              const c = clear * Math.exp(-q);
              m *= 1 - c * 0.92;
              if (L >= 0) tone += c * 0.16 * rev[L];
            }
          }
          if (tone > 0.93) tone = 0.93;
          m += lift * 0.55;
          if (m > 1) m = 1;
          tone = (tone * (1 - m) + 0.09 * m * (1 - lift)) * fade;

          buf[y * cols + x] = pal[rdfDither(tone, nTones, RDF_BAYER[by + (x & 7)])];
        }
      }
      ctx.putImageData(img, 0, 0);

      const alt = altRef.current;
      const label = altTextRef.current;
      let show = false;
      if (alt && label && o.altimeter && inside && age > 1600) {
        const x = Math.max(0, Math.min(cols - 1, Math.round(ex)));
        for (let i = layers - 1; i >= 0; i--) {
          const crest = colTop[i * cols + x];
          if (ey >= crest - 6) {
            show = true;
            alt.style.transform = "translate(" + (x * p).toFixed(1) + "px," + (crest * p).toFixed(1) + "px)";
            const text = "Peak Crest: " + rdfElevation(crest, rows, i, layers).toLocaleString("en-US") + " m";
            if (text !== altLabel) {
              altLabel = text;
              label.textContent = text;
            }
            break;
          }
        }
      }
      if (alt && show !== altShown) {
        altShown = show;
        alt.style.opacity = show ? "1" : "0";
      }

      const settling =
        Math.abs(tx - ex) + Math.abs(ty - ey) > 0.05 ||
        Math.abs((inside && o.interactive ? 1 : 0) - clear) > 0.005 ||
        Math.abs((live ? pt : 0) - pe) > 0.001 ||
        Math.abs(windV) > 0.002;
      awake = isMobile
        ? (age >= 0 && age < 2000)
        : ((age >= 0 && age < 3400) || age < 0 || settling || (!reduced && o.drift > 0));
    };

    const busy = () => {
      const age = revealAt.current === null ? -1 : performance.now() - revealAt.current;
      return (age >= 0 && age < 3400) || inside || Math.abs(windV) > 0.002 || Math.abs(pt - pe) > 0.001;
    };

    const loop = (now) => {
      raf = 0;
      if (!visible) return;
      if (revealAt.current === null) {
        raf = requestAnimationFrame(loop);
        return;
      }
      if (busy() || now - lastDraw > 32) {
        draw(now);
        lastDraw = now;
      }
      if (awake) raf = requestAnimationFrame(loop);
    };

    const wake = () => {
      awake = true;
      if (!raf && visible) raf = requestAnimationFrame(loop);
    };

    const onMove = (e) => {
      const o = opts.current;
      if (!o.interactive && !o.altimeter) return;
      const b = root.getBoundingClientRect();
      pt = b.width > 0 ? ((e.clientX - b.left) / b.width) * 2 - 1 : 0;
      const s = scene.getBoundingClientRect();
      const lx = (e.clientX - s.left) / p;
      const ly = (e.clientY - s.top) / p;
      const was = inside;
      inside = lx >= 0 && ly >= 0 && lx < cols && ly < rows;
      tx = lx;
      ty = ly;
      if (inside && !was) {
        ex = tx;
        ey = ty;
      }
      wake();
    };

    const onLeave = () => {
      pt = 0;
      inside = false;
      wake();
    };

    const onDown = (e) => {
      if (!opts.current.interactive || reduced || !inside) return;
      if (e.target.closest("a,button")) return;
      windV += tx < cols / 2 ? 1.4 : -1.4;
      wake();
    };

    layout();
    draw(performance.now());
    wake();

    root.addEventListener("pointermove", onMove);
    root.addEventListener("pointerleave", onLeave);
    root.addEventListener("pointerdown", onDown);
    const ro = new ResizeObserver(() => {
      layout();
      draw(performance.now());
      wake();
    });
    ro.observe(scene);
    const io = new IntersectionObserver((entries) => {
      visible = entries[0] ? entries[0].isIntersecting : true;
      if (visible) {
        lastTick = performance.now();
        wake();
      }
    });
    io.observe(root);

    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
      io.disconnect();
      root.removeEventListener("pointermove", onMove);
      root.removeEventListener("pointerleave", onLeave);
      root.removeEventListener("pointerdown", onDown);
    };
  }, []);

  return (
    <footer
      ref={rootRef}
      className={"rdf-root" + (inView ? " rdf-in" : "")}
      style={{
        minHeight: "600px",
        "--rdf-scene-min": "260px",
        "--rdf-paper": colors.paper,
        "--rdf-ink": colors.ink,
        "--rdf-muted": colors.muted,
        "--rdf-line": colors.line,
        "--rdf-heart": colors.heart,
        "--rdf-n": columns.length,
        "--rdf-sans": '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
      }}
    >
      <style>{RDF_CSS}</style>
      <div className="rdf-frame">
        <div className="rdf-top">
          {/* Brand & Editorial Column */}
          <div className="rdf-brand">
            <Link className="rdf-logo rdf-r" style={{ "--d": 140 }} href="/#hero">
              <img
                src="/images/Logo.svg"
                onError={(e) => {
                  e.currentTarget.src = "https://resolvemun.in/images/Logo.svg";
                }}
                alt="Resolve MUN 2.0"
              />
              <span>RESOLVE MUN 2.0</span>
            </Link>

            {/* Simpler, Professional, Clutter-Free Description */}
            <p className="rdf-tag rdf-r" style={{ "--d": 220 }}>
              Hyderabad&apos;s premier Model United Nations conference. Convening at Meridian School, Kompally on 27–29 November 2026.
            </p>

            {/* Social Icons */}
            <ul className="rdf-social">
              <li className="rdf-r" style={{ "--d": 280 }}>
                <a
                  href="https://www.instagram.com/mun.resolve"
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="Instagram"
                >
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
                    <rect x="3" y="3" width="18" height="18" rx="5" />
                    <circle cx="12" cy="12" r="4.2" />
                    <circle cx="17.4" cy="6.6" r="1" fill="currentColor" stroke="none" />
                  </svg>
                </a>
              </li>
              <li className="rdf-r" style={{ "--d": 330 }}>
                <a
                  href="https://wa.me/919212107797?text=Hi%20Resolve%20MUN"
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="WhatsApp"
                >
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M7.5 8.25h9m-9 3H12m-9.75 1.51c0 1.6 1.123 2.994 2.707 3.227 1.129.166 2.27.293 3.423.379.35.026.67.21.865.501L12 21l2.755-4.133a1.14 1.14 0 0 1 .865-.501 48.172 48.172 0 0 0 3.423-.379c1.584-.233 2.707-1.626 2.707-3.228V6.741c0-1.602-1.123-2.995-2.707-3.228A48.394 48.394 0 0 0 12 3c-2.392 0-4.744.175-7.043.513C3.373 3.746 2.25 5.14 2.25 6.741v7.018Z" />
                  </svg>
                </a>
              </li>
              <li className="rdf-r" style={{ "--d": 380 }}>
                <a
                  href="mailto:resolve.mun@gmail.com"
                  aria-label="Email"
                >
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 0 1-2.25 2.25h-15a2.25 2.25 0 0 1-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0 0 19.5 4.5h-15a2.25 2.25 0 0 0-2.25 2.25m19.5 0v.243a2.25 2.25 0 0 1-1.07 1.916l-7.5 4.615a2.25 2.25 0 0 1-2.36 0L3.32 8.91a2.25 2.25 0 0 1-1.07-1.916V6.75" />
                  </svg>
                </a>
              </li>
            </ul>
          </div>

          {/* Navigation Columns */}
          {columns.map((col, ci) => (
            <nav className="rdf-col" key={col.title} aria-label={col.title}>
              <h3 className="rdf-r" style={{ "--d": 240 + ci * 80 }}>
                {col.title}
              </h3>
              <ul>
                {col.links.map((l, li) => (
                  <li key={l.label} className="rdf-r" style={{ "--d": 300 + ci * 80 + li * 45 }}>
                    {l.onClick ? (
                      <button type="button" onClick={l.onClick} className="rdf-link">
                        {l.label}
                      </button>
                    ) : l.external ? (
                      <a className="rdf-link" href={l.href} target="_blank" rel="noopener noreferrer">
                        {l.label}
                      </a>
                    ) : (
                      <a className="rdf-link" href={l.href || "#"}>
                        {l.label}
                      </a>
                    )}
                  </li>
                ))}
              </ul>
            </nav>
          ))}
        </div>

        {/* Bottom Bar: Clean, Professional, Monochrome */}
        <div className="rdf-bar rdf-r" style={{ "--d": 950 }}>
          <p>© 2026 RESOLVE MUN. ALL RIGHTS RESERVED.</p>
          <a
            className="rdf-credit"
            href="https://rendervoid.xyz"
            target="_blank"
            rel="noopener noreferrer"
          >
            Made with
            <svg className="rdf-heart" viewBox="0 0 24 24" aria-hidden="true">
              <path
                fill="currentColor"
                d="M12 21s-7.5-4.6-9.6-9.2C.9 8.4 3 4.5 6.7 4.5c2.1 0 3.6 1.1 5.3 3 1.7-1.9 3.2-3 5.3-3 3.7 0 5.8 3.9 4.3 7.3C19.5 16.4 12 21 12 21z"
              />
            </svg>
            <span className="rdf-sr">love</span>
            by Rendervoid
          </a>
        </div>

        {/* Monochrome Dither Mountain Canvas (End to End) */}
        <div ref={sceneRef} className="rdf-scene">
          <canvas ref={canvasRef} aria-hidden="true" />
          <div ref={altRef} className="rdf-alt" aria-hidden="true">
            <b />
            <i />
            <span ref={altTextRef} />
          </div>
        </div>
      </div>
    </footer>
  );
}
