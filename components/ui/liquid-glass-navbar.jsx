"use client";

/**
 * Nimbus UI · Liquid Glass Navbar — "Waterline"
 * Pure Minimal Monochrome Liquid Glass Squircle
 * Clean Heroicons with smooth, seamless spring transitions.
 */

import React, {
  useState,
  useEffect,
  useRef,
  useCallback,
} from "react";

const PAD = 14;

/* ---------- Clean Heroicons (outline style, 24x24) ---------- */
const HeroIcon = ({ children, className = "" }) => (
  <svg
    viewBox="0 0 24 24"
    width="15"
    height="15"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.7"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
    aria-hidden="true"
  >
    {children}
  </svg>
);

export const ProIcons = {
  // Heroicons: Information Circle
  about: (
    <HeroIcon>
      <path d="M11.25 11.25l.041-.02a.75.75 0 011.063.852l-.708 2.836a.75.75 0 001.063.853l.041-.021M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9-3.75h.008v.008H12V8.25z" />
    </HeroIcon>
  ),
  // Heroicons: Document Text
  letter: (
    <HeroIcon>
      <path d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
    </HeroIcon>
  ),
  // Heroicons: Globe Alt
  committees: (
    <HeroIcon>
      <path d="M12 21a9.004 9.004 0 008.716-6.747M12 21a9.004 9.004 0 01-8.716-6.747M12 21c2.485 0 4.5-4.03 4.5-9S14.485 3 12 3m0 18c-2.485 0-4.5-4.03-4.5-9S9.515 3 12 3m0 0a8.997 8.997 0 017.843 4.582M12 3a8.997 8.997 0 00-7.843 4.582m15.686 0A11.953 11.953 0 0112 10.5c-2.998 0-5.74-1.1-7.843-2.918m15.686 0A8.959 8.959 0 0121 12c0 .778-.099 1.533-.284 2.253m0 0A17.919 17.919 0 0112 16.5c-3.162 0-6.133-.815-8.716-2.247m0 0A9.015 9.015 0 013 12c0-1.605.42-3.113 1.157-4.418" />
    </HeroIcon>
  ),
  // Heroicons: Map Pin
  venue: (
    <HeroIcon>
      <path d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" />
      <path d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z" />
    </HeroIcon>
  ),
  // Heroicons: User Group
  secretariat: (
    <HeroIcon>
      <path d="M18 18.72a9.094 9.094 0 003.741-.479 3 3 0 00-4.682-2.72m.94 3.198l.001.031c0 .225-.012.447-.037.666A11.944 11.944 0 0112 21c-2.17 0-4.207-.576-5.963-1.584A6.062 6.062 0 016 18.719m12 0a5.971 5.971 0 00-.941-3.197m0 0A5.995 5.995 0 0012 12.75a5.995 5.995 0 00-5.058 2.772m0 0a3 3 0 00-4.681 2.72 8.986 8.986 0 003.74.477m.94-3.197a5.971 5.971 0 00-.94 3.197M15 6.75a3 3 0 11-6 0 3 3 0 016 0zm6 3a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0zm-13.5 0a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0z" />
    </HeroIcon>
  ),
  // Heroicons: Arrow Down Tray
  brochure: (
    <HeroIcon>
      <path d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3" />
    </HeroIcon>
  ),
  // Heroicons: Squares 2x2
  dashboard: (
    <HeroIcon>
      <path d="M3.75 6A2.25 2.25 0 016 3.75h2.25A2.25 2.25 0 0110.5 6v2.25a2.25 2.25 0 01-2.25 2.25H6a2.25 2.25 0 01-2.25-2.25V6zM3.75 15.75A2.25 2.25 0 016 13.5h2.25a2.25 2.25 0 012.25 2.25V18a2.25 2.25 0 01-2.25 2.25H6A2.25 2.25 0 013.75 18v-2.25zM13.5 6a2.25 2.25 0 012.25-2.25H18A2.25 2.25 0 0120.25 6v2.25A2.25 2.25 0 0118 10.5h-2.25a2.25 2.25 0 01-2.25-2.25V6zM13.5 15.75a2.25 2.25 0 012.25-2.25H18a2.25 2.25 0 012.25 2.25V18A2.25 2.25 0 0118 20.25h-2.25A2.25 2.25 0 0113.5 18v-2.25z" />
    </HeroIcon>
  ),
  // Heroicons: Arrow Right On Rectangle
  logout: (
    <HeroIcon>
      <path d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15m3 0l3-3m0 0l-3-3m3 3H9" />
    </HeroIcon>
  ),
  // Heroicons: Chevron Down
  chevronDown: (
    <HeroIcon>
      <path d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
    </HeroIcon>
  ),
  // Heroicons: Arrow Up Right
  arrowUpRight: (
    <HeroIcon>
      <path d="M4.5 19.5l15-15m0 0H8.25m11.25 0v11.25" />
    </HeroIcon>
  ),
  // Heroicons: Bars 3
  menu: (
    <HeroIcon>
      <path d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
    </HeroIcon>
  ),
  // Heroicons: X Mark
  close: (
    <HeroIcon>
      <path d="M6 18L18 6M6 6l12 12" />
    </HeroIcon>
  ),
  // Heroicons: Phone
  phone: (
    <HeroIcon>
      <path d="M2.25 6.75c0 8.284 6.716 15 15 15h2.25a2.25 2.25 0 002.25-2.25v-1.372c0-.516-.351-.966-.852-1.091l-4.423-1.106c-.44-.11-.902.055-1.173.417l-.97 1.293c-.282.376-.769.542-1.21.38a12.035 12.035 0 01-7.143-7.143c-.162-.441.004-.928.38-1.21l1.293-.97c.363-.271.527-.734.417-1.173L6.963 3.102a1.125 1.125 0 00-1.091-.852H4.5A2.25 2.25 0 002.25 4.5v2.25z" />
    </HeroIcon>
  ),
};

/* ---------- Minimal Pure Monochrome Glass CSS ---------- */
const NIMBUS_CSS = `
.nimbus-nav {
  position: relative;
  display: inline-flex;
  align-items: center;
  gap: 2px;
  padding: 3px;
  border-radius: 12px;
  isolation: isolate;
  font-family: inherit;
  user-select: none;
  -webkit-tap-highlight-color: transparent;
  box-sizing: border-box;
}

.nimbus-glass {
  position: absolute;
  inset: 0;
  border-radius: inherit;
  z-index: -2;
  overflow: hidden;
  background: rgba(255, 255, 255, 0.03);
  -webkit-backdrop-filter: blur(14px) saturate(100%);
  backdrop-filter: blur(14px) saturate(100%);
  border: 1px solid rgba(255, 255, 255, 0.08);
  box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.12);
}

.nimbus-water {
  position: absolute;
  left: ${-PAD}px;
  top: ${-PAD}px;
  z-index: -1;
  pointer-events: none;
}

.nimbus-nav[data-gl="off"] .nimbus-water {
  display: none;
}

/* Fallback Monochrome Translucent Squircle Drop */
.nimbus-drop {
  display: none;
  position: absolute;
  top: 3px;
  bottom: 3px;
  left: 0;
  border-radius: 9px;
  z-index: -1;
  pointer-events: none;
  will-change: transform, width;
  background: linear-gradient(135deg, rgba(255, 255, 255, 0.15) 0%, rgba(255, 255, 255, 0.04) 100%), rgba(255, 255, 255, 0.06);
  border: 1px solid rgba(255, 255, 255, 0.2);
  box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.45), 0 2px 8px -2px rgba(0, 0, 0, 0.5);
}

.nimbus-nav[data-gl="off"] .nimbus-drop {
  display: block;
}

.nimbus-item {
  position: relative;
  z-index: 1;
  display: inline-flex;
  align-items: center;
  gap: 6px;
  height: 32px;
  padding: 0 11px;
  border: 0;
  border-radius: 9px;
  background: none;
  color: rgba(255, 255, 255, 0.65);
  font-family: inherit;
  font-weight: 500;
  font-size: 13px;
  line-height: 1;
  letter-spacing: 0.01em;
  text-decoration: none;
  cursor: pointer;
  transition: color 0.18s ease, background-color 0.18s ease;
  white-space: nowrap;
}

.nimbus-item:hover {
  color: #FFFFFF;
  background-color: rgba(255, 255, 255, 0.05);
}

.nimbus-item[aria-current="page"] {
  color: #FFFFFF;
  font-weight: 600;
}

.nimbus-item:focus-visible {
  outline: 2px solid rgba(255, 255, 255, 0.4);
  outline-offset: 2px;
}

.nv-ico {
  position: relative;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  flex: none;
  color: inherit;
  opacity: 0.85;
}

.nimbus-item:hover .nv-ico,
.nimbus-item[aria-current="page"] .nv-ico {
  opacity: 1;
  color: #ffffff;
}
`;

/* ---------- Pure Monochrome Squircle WebGL Shader ---------- */
const VERT = `attribute vec2 a;void main(){gl_Position=vec4(a,0.,1.);}`;
const FRAG = `precision highp float;
uniform vec2 uRes;uniform float uDpr;uniform vec4 uPill;uniform vec4 uDrop;
float sdRB(vec2 p,vec2 b,float r){vec2 q=abs(p)-b+r;return length(max(q,0.))+min(max(q.x,q.y),0.)-r;}
float pillD(vec2 p){vec2 h=uPill.zw*.5;return sdRB(p-uPill.xy-h,h,10.);}
float dropD(vec2 p){vec2 h=uDrop.zw*.5;return sdRB(p-uDrop.xy-h,h,8.);}
void main(){
 vec2 p=vec2(gl_FragCoord.x,uRes.y*uDpr-gl_FragCoord.y)/uDpr;
 float dp=pillD(p);float dd=dropD(p);
 float dm=smoothstep(0.5,-0.5,dd)*smoothstep(1.,-1.,dp);
 if(dm<0.001){gl_FragColor=vec4(0.);return;}
 float rim=dm*smoothstep(-2.5,0.0,dd);
 float topHighlight=smoothstep(uDrop.y-1.,uDrop.y+uDrop.w*.4,p.y)*dm;
 vec3 c=mix(vec3(0.08,0.08,0.08),vec3(0.24,0.24,0.24),topHighlight);
 c+=vec3(1.0)*rim*0.5;
 float a=dm*(0.25+0.15*topHighlight);
 gl_FragColor=vec4(c,a);
}`;

function makeState() {
  return {
    cur: { x: 0, w: 0, vX: 0, vW: 0 },
    t: { x: 0, y: 0, w: 0, h: 32 },
    ready: false,
    w: 0,
    h: 0,
    visible: true,
    raf: 0,
    last: 0,
    glc: null,
  };
}

function initGL(canvas) {
  try {
    const gl = canvas.getContext("webgl", {
      premultipliedAlpha: true,
      alpha: true,
      antialias: false,
      powerPreference: "low-power",
    });
    if (!gl) return null;

    const sh = (type, src) => {
      const s = gl.createShader(type);
      if (!s) return null;
      gl.shaderSource(s, src);
      gl.compileShader(s);
      return gl.getShaderParameter(s, gl.COMPILE_STATUS) ? s : null;
    };

    const vs = sh(gl.VERTEX_SHADER, VERT);
    const fs = sh(gl.FRAGMENT_SHADER, FRAG);
    if (!vs || !fs) return null;

    const p = gl.createProgram();
    if (!p) return null;
    gl.attachShader(p, vs);
    gl.attachShader(p, fs);
    gl.linkProgram(p);
    if (!gl.getProgramParameter(p, gl.LINK_STATUS)) return null;
    gl.useProgram(p);

    const buf = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buf);
    gl.bufferData(
      gl.ARRAY_BUFFER,
      new Float32Array([-1, -1, 3, -1, -1, 3]),
      gl.STATIC_DRAW
    );
    const loc = gl.getAttribLocation(p, "a");
    gl.enableVertexAttribArray(loc);
    gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0);

    const u = {};
    for (const n of ["uRes", "uDpr", "uPill", "uDrop"]) {
      u[n] = gl.getUniformLocation(p, n);
    }
    return { gl, u };
  } catch (_) {
    return null;
  }
}

export function LiquidNavbar({
  items = [],
  defaultActive = 0,
  active,
  onChange,
  className = "",
  style = {},
}) {
  const [inner, setInner] = useState(defaultActive);
  const current = active !== undefined ? active : inner;
  const navRef = useRef(null);
  const canvasRef = useRef(null);
  const dropRef = useRef(null);
  const itemRefs = useRef([]);
  const st = useRef(makeState());
  const [gl, setGl] = useState("on");

  const draw = useCallback(() => {
    const s = st.current;
    if (s.glc) {
      const { gl: g, u } = s.glc;
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      g.viewport(0, 0, g.drawingBufferWidth, g.drawingBufferHeight);
      g.uniform2f(u.uRes, s.w + PAD * 2, s.h + PAD * 2);
      g.uniform1f(u.uDpr, dpr);
      g.uniform4f(u.uPill, PAD, PAD, s.w, s.h);
      g.uniform4f(u.uDrop, s.cur.x, s.t.y, s.cur.w, s.t.h);
      g.clearColor(0, 0, 0, 0);
      g.clear(g.COLOR_BUFFER_BIT);
      g.drawArrays(g.TRIANGLES, 0, 3);
    } else if (dropRef.current) {
      dropRef.current.style.width = `${Math.max(16, s.cur.w)}px`;
      dropRef.current.style.transform = `translateX(${s.cur.x - PAD}px)`;
    }
  }, []);

  const step = useCallback((dt) => {
    const s = st.current;
    const targetX = s.t.x;
    const targetW = s.t.w;

    const k = 190;
    const c = 22;

    s.cur.vX += (k * (targetX - s.cur.x) - c * s.cur.vX) * dt;
    s.cur.x += s.cur.vX * dt;

    s.cur.vW += (k * (targetW - s.cur.w) - c * s.cur.vW) * dt;
    s.cur.w += s.cur.vW * dt;

    const moving =
      Math.abs(targetX - s.cur.x) > 0.2 ||
      Math.abs(targetW - s.cur.w) > 0.2 ||
      Math.abs(s.cur.vX) > 1 ||
      Math.abs(s.cur.vW) > 1;

    return !moving;
  }, []);

  const loop = useCallback(() => {
    const s = st.current;
    if (s.raf) return;
    s.last = performance.now();

    const tick = (now) => {
      const dt = Math.min((now - s.last) / 1000, 1 / 30);
      s.last = now;
      const settled = step(dt);
      draw();

      if (s.visible && !settled) {
        s.raf = requestAnimationFrame(tick);
      } else {
        draw();
        s.raf = 0;
      }
    };

    s.raf = requestAnimationFrame(tick);
  }, [draw, step]);

  const measure = useCallback(() => {
    const nav = navRef.current;
    const el = itemRefs.current[current];
    if (!nav || !el) return;
    const s = st.current;

    const navRect = nav.getBoundingClientRect();
    const elRect = el.getBoundingClientRect();

    s.w = nav.offsetWidth;
    s.h = nav.offsetHeight;

    s.t.x = PAD + (elRect.left - navRect.left);
    s.t.y = PAD + (elRect.top - navRect.top);
    s.t.w = el.offsetWidth;
    s.t.h = el.offsetHeight;

    if (!s.ready) {
      s.cur.x = s.t.x;
      s.cur.w = s.t.w;
      s.ready = true;
    }

    const cv = canvasRef.current;
    if (cv) {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      const W = s.w + PAD * 2;
      const Hh = s.h + PAD * 2;
      const rw = Math.round(W * dpr);
      const rh = Math.round(Hh * dpr);
      if (cv.width !== rw || cv.height !== rh) {
        cv.width = rw;
        cv.height = rh;
        cv.style.width = `${W}px`;
        cv.style.height = `${Hh}px`;
      }
    }

    loop();
  }, [current, loop]);

  useEffect(() => {
    const s = st.current;
    const cv = canvasRef.current;
    s.glc = cv ? initGL(cv) : null;
    if (!s.glc) setGl("off");

    const io = new IntersectionObserver(([e]) => {
      s.visible = e.isIntersecting;
      if (s.visible) loop();
    });
    if (navRef.current) io.observe(navRef.current);

    return () => {
      io.disconnect();
      if (s.raf) cancelAnimationFrame(s.raf);
      s.raf = 0;
    };
  }, [loop]);

  useEffect(() => {
    measure();
  }, [measure, items.length]);

  const measureRef = useRef(measure);
  measureRef.current = measure;

  useEffect(() => {
    let lastW = -1;
    const ro = new ResizeObserver(() => {
      const w = navRef.current?.offsetWidth ?? 0;
      if (Math.abs(w - lastW) > 1) {
        lastW = w;
        measureRef.current();
      }
    });
    if (navRef.current) ro.observe(navRef.current);
    return () => ro.disconnect();
  }, []);

  const select = (i) => {
    if (active === undefined) setInner(i);
    onChange?.(i, items[i]);
  };

  return (
    <nav
      ref={navRef}
      className={["nimbus-nav", className].filter(Boolean).join(" ")}
      data-gl={gl}
      aria-label="Main Navigation"
      style={style}
    >
      <style dangerouslySetInnerHTML={{ __html: NIMBUS_CSS }} />
      <span className="nimbus-glass" aria-hidden="true" />
      <canvas className="nimbus-water" ref={canvasRef} aria-hidden="true" />
      <span className="nimbus-drop" ref={dropRef} aria-hidden="true" />

      {items.map((it, i) => {
        const isCurrent = i === current;
        const commonProps = {
          ref: (el) => {
            itemRefs.current[i] = el;
          },
          className: "nimbus-item",
          "aria-current": isCurrent ? "page" : undefined,
          onClick: (e) => {
            if (it.onClick) it.onClick(e);
            select(i);
          },
        };

        const itemContent = (
          <>
            {it.icon && <span className="nv-ico">{it.icon}</span>}
            <span className="nimbus-label">{it.label}</span>
          </>
        );

        if (it.href) {
          return (
            <a key={it.label + i} {...commonProps} href={it.href} aria-label={it.label}>
              {itemContent}
            </a>
          );
        }

        return (
          <button key={it.label + i} {...commonProps} type="button" aria-label={it.label}>
            {itemContent}
          </button>
        );
      })}
    </nav>
  );
}

export default LiquidNavbar;
