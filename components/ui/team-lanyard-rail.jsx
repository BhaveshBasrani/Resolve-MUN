"use client";

import * as React from "react";

const RATIO = 96 / 62;
const MAX_W = 124;
const MIN_RAIL_W = 100;
const EM = 11.2;
const RAIL_PITCH_MIN = 1.16;
const RAIL_PITCH_MAX = 1.62;
const CAROUSEL_PITCH = 1.2;
const GAP = 0.07;
const PERSPECTIVE = 900;
const MAX_STRETCH = 64;
const FIRST_DELAY = 1100;
const FLIP_DELAY = 700;
const SWING_K = 28;
const SWING_DAMP = 2.2;
const LAG = 0.12;
const REEL_K = 220;
const REEL_ZETA = 0.5;
const REST_Y = [9, -10, 7, -8, 10, -7, 8, -9];
const REST_Z = [-1.6, 1.2, -2, 1.5, -1, 1.8, -1.3, 2];
const DROPS = [6, 20, 0, 13, 22, 4, 16, 9];
const TONES = ["text-chart-1", "text-chart-2", "text-chart-3", "text-chart-4", "text-chart-5"];
const DEFAULT_LABELS = {
  flip: "Click or press Enter to flip the badge",
  back: "Click again or press Esc to turn it back",
  show: "Show"
};
const METAL = "linear-gradient(to right, color-mix(in oklab, var(--color-muted-foreground) 70%, black), color-mix(in oklab, var(--color-muted-foreground) 22%, white) 38%, var(--color-muted-foreground) 70%, color-mix(in oklab, var(--color-muted-foreground) 65%, black))";
const PLASTIC = "linear-gradient(180deg, color-mix(in oklab, var(--color-muted-foreground) 30%, var(--color-background)), color-mix(in oklab, var(--color-muted-foreground) 72%, var(--color-background)))";

function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}

function hash(text) {
  let h = 0;
  for (let i = 0; i < text.length; i++) {
    h = (h << 5) - h + text.charCodeAt(i) | 0;
  }
  return Math.abs(h);
}

function restY(i) {
  return REST_Y[i % REST_Y.length];
}

function restZ(i) {
  return REST_Z[i % REST_Z.length];
}

function restDrop(i) {
  return DROPS[i % DROPS.length];
}

function toneClass(tone) {
  return tone ? TONES[(tone - 1) % TONES.length] : "text-muted-foreground";
}

function stepSpring(pos, vel, target, k, zeta, dt) {
  const d = pos - target;
  const omega = Math.sqrt(Math.max(0, k));
  const c = 2 * zeta * omega;
  const accel = -k * d - c * vel;
  const nVel = vel + accel * dt;
  const nPos = pos + nVel * dt;
  return [nPos, nVel];
}

function RibbonHanger({ width, height }) {
  const d = React.useMemo(() => {
    const hw = width / 2;
    const peak = 1;
    const drop = height * 0.94;
    const baseW = 14;
    const c1x = hw * 0.42;
    const c1y = drop * 0.08;
    const c2x = baseW * 0.72;
    const c2y = drop * 0.78;
    const path = [`M ${hw} ${peak}`, `C ${hw - c1x} ${c1y}, ${hw - c2x} ${c2y}, ${hw - baseW / 2} ${drop}`, `L ${hw + baseW / 2} ${drop}`, `C ${hw + c2x} ${c2y}, ${hw + c1x} ${c1y}, ${hw} ${peak}`, "Z"].join(" ");
    return path;
  }, [width, height]);
  return <path d={d} fill="currentColor" opacity={0.92} />;
}

function RibbonTexture() {
  return <>
      <span className="absolute inset-x-0 bottom-0 h-px bg-black/15" />
      <span className="absolute left-1/2 top-[0.72em] block h-[0.56em] w-[2.7em] -translate-x-1/2 rounded-full bg-background" />
      <svg aria-hidden="true" className="pointer-events-none absolute inset-y-0 -left-1/2 w-[200%] opacity-70 dark:opacity-35" preserveAspectRatio="none">
        <defs>
          <pattern id="team-lanyard-ribbon" width="6" height="6" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
            <line x1="0" y1="0" x2="0" y2="6" stroke="currentColor" strokeWidth="2.4" className="text-black/35 dark:text-white/20" />
            <line x1="3" y1="0" x2="3" y2="6" stroke="currentColor" strokeWidth="1.2" className="text-white/25 dark:text-black/40" />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#team-lanyard-ribbon)" />
      </svg>
    </>;
}

function ClipHardware() {
  return <div className="absolute -top-[1.28em] left-1/2 z-20 flex -translate-x-1/2 flex-col items-center">
      <div style={{ background: METAL }} className="h-[0.32em] w-[1.48em] rounded-[0.06em] shadow-[0_1px_2px_rgba(0,0,0,0.35)]" />
      <div style={{ background: PLASTIC }} className="relative -mt-[0.04em] flex h-[0.62em] w-[1.12em] items-center justify-center rounded-[0.1em] border border-black/30 shadow-[0_2px_4px_rgba(0,0,0,0.25)]">
        <div className="h-[0.18em] w-[0.44em] rounded-[0.04em] bg-black/60 shadow-[inset_0_1px_1px_rgba(0,0,0,0.8)]" />
      </div>
      <div style={{ background: METAL }} className="-mt-[0.04em] h-[0.52em] w-[0.24em] rounded-b-[0.06em] shadow-[0_2px_3px_rgba(0,0,0,0.35)]" />
    </div>;
}

function LinkIcon({ label }) {
  const l = label.toLowerCase();
  if (l.includes("git")) {
    return <svg aria-hidden="true" viewBox="0 0 16 16" fill="currentColor" className="size-[1.05em] shrink-0">
        <path d="M8 0C3.58 0 0 3.58 0 8a8 8 0 0 0 5.47 7.59c.4.08.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27s1.36.09 2 .27c1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.01 8.01 0 0 0 16 8c0-4.42-3.58-8-8-8Z" />
      </svg>;
  }
  if (l.includes("twit") || l === "x" || l.includes("x.com")) {
    return <svg aria-hidden="true" viewBox="0 0 16 16" fill="currentColor" className="size-[1.05em] shrink-0">
        <path d="M9.33 6.74 14.16 1.12h-1.14L8.82 6.01 5.48 1.12H1.61l5.08 7.39L1.61 14.88h1.15l4.44-5.16 3.53 5.16h3.87L9.33 6.74Zm-1.57 1.83-.51-.74-4.1-5.86h1.76l3.3 4.72.51.74 4.3 6.15h-1.76l-3.5-5.01Z" />
      </svg>;
  }
  if (l.includes("in") || l.includes("link")) {
    return <svg aria-hidden="true" viewBox="0 0 16 16" fill="currentColor" className="size-[1.05em] shrink-0">
        <path d="M0 1.15C0 .52.52 0 1.17 0h13.66C15.48 0 16 .52 16 1.15v13.7c0 .63-.52 1.15-1.17 1.15H1.17C.52 16 0 15.48 0 14.85V1.15ZM4.76 13.65V6.02H2.23v7.63h2.53ZM3.5 4.98c.88 0 1.42-.58 1.42-1.31-.02-.74-.54-1.31-1.4-1.31-.87 0-1.42.57-1.42 1.31 0 .73.53 1.31 1.38 1.31h.02ZM13.77 13.65V9.43c0-2.26-1.21-3.31-2.82-3.31-1.3 0-1.88.72-2.2 1.22V6.02H6.22c.03.71 0 7.63 0 7.63h2.53v-4.26c0-.23.02-.45.08-.62.19-.51.65-1.04 1.43-1.04 1.01 0 1.42.77 1.42 1.9v4.02h2.09Z" />
      </svg>;
  }
  return <svg aria-hidden="true" viewBox="0 0 16 16" fill="currentColor" className="size-[1.05em] shrink-0">
      <path d="M8 0a8 8 0 1 0 0 16A8 8 0 0 0 8 0ZM1.5 8a6.5 6.5 0 0 1 11.05-4.66l-1.08 1.08A4.97 4.97 0 0 0 8 3.03v1.5a3.5 3.5 0 0 1 2.47 1.03l-1.06 1.06A2 2 0 0 0 8 6.03v1.5a.5.5 0 0 1 .5.5h1.5a2 2 0 0 0-.59 1.41l1.06 1.06A3.5 3.5 0 0 1 8 11.47v1.5a4.97 4.97 0 0 0 3.47-1.39l1.08 1.08A6.5 6.5 0 0 1 1.5 8Z" />
    </svg>;
}

const LINK_ROW = "relative z-30 inline-flex items-center gap-[0.4em] rounded-[0.4em] px-[0.55em] py-[0.3em] text-[0.8em] font-medium leading-none";

export function TeamLanyardRail({
  items,
  eyebrow,
  heading,
  caption,
  action,
  autoplay = false,
  interval = 4600,
  active: activeProp,
  onActiveChange,
  flipped: flippedProp,
  onFlippedChange,
  labels = DEFAULT_LABELS,
  className = "",
  compact = false,
  showCaption = true,
  ...rest
}) {
  const uid = React.useId();
  const rootRef = React.useRef(null);
  const railRef = React.useRef(null);
  const count = items.length;

  const [activeUncontrolled, setActiveUncontrolled] = React.useState(null);
  const [flippedUncontrolled, setFlippedUncontrolled] = React.useState(null);
  const active = activeProp !== undefined ? activeProp : activeUncontrolled;
  const flipped = flippedProp !== undefined ? flippedProp : flippedUncontrolled;

  const setActive = React.useCallback((idx) => {
    if (activeProp === undefined) setActiveUncontrolled(idx);
    onActiveChange?.(idx);
  }, [activeProp, onActiveChange]);

  const setFlipped = React.useCallback((idx) => {
    if (flippedProp === undefined) setFlippedUncontrolled(idx);
    onFlippedChange?.(idx);
  }, [flippedProp, onFlippedChange]);

  const [size, setSize] = React.useState({
    carousel: false,
    railW: 0,
    badgeW: 124,
    scale: 1,
    hangerH: 150
  });

  React.useEffect(() => {
    const el = railRef.current;
    if (!el) return;
    const ro = new ResizeObserver((entries) => {
      const w = entries[0]?.contentRect.width ?? 0;
      if (!w) return;
      const isCarousel = w < 640;
      const baseBadgeW = isCarousel ? clamp(w * 0.36, 110, 134) : clamp(w / (count * 1.35), MIN_RAIL_W, MAX_W);
      const scale = baseBadgeW / 124;
      const hangerH = compact
        ? clamp(w * (isCarousel ? 0.16 : 0.08), 35, 65)
        : clamp(w * (isCarousel ? 0.36 : 0.22), 110, 190);
      setSize({
        carousel: isCarousel,
        railW: w,
        badgeW: baseBadgeW,
        scale,
        hangerH
      });
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, [count]);

  const pitch = React.useMemo(() => {
    if (size.carousel) return CAROUSEL_PITCH;
    if (count <= 1) return 1;
    const available = size.railW / size.badgeW;
    const target = (available - 1) / (count - 1);
    return clamp(target, RAIL_PITCH_MIN, RAIL_PITCH_MAX);
  }, [size.carousel, size.railW, size.badgeW, count]);

  const centerIndex = active ?? 0;
  const dragOffsetRef = React.useRef(0);
  const targetXRef = React.useRef(0);
  const currentXRef = React.useRef(0);
  const reelPosRef = React.useRef(0);
  const reelVelRef = React.useRef(0);
  const [renderCount, setRenderCount] = React.useState(0);

  const dragPointerId = React.useRef(null);
  const dragStartX = React.useRef(0);
  const dragLastX = React.useRef(0);
  const dragLastTime = React.useRef(0);
  const dragVelocity = React.useRef(0);
  const isDragging = React.useRef(false);

  const anglesRef = React.useRef(items.map(() => 0));
  const velsRef = React.useRef(items.map(() => 0));
  const prevXsRef = React.useRef(items.map(() => 0));
  const flipsRef = React.useRef(items.map(() => 0));
  const autoIndexRef = React.useRef(0);
  const autoTimerRef = React.useRef(null);
  const userInteracted = React.useRef(false);

  const stop = React.useCallback(() => {
    userInteracted.current = true;
    if (autoTimerRef.current) clearTimeout(autoTimerRef.current);
  }, []);

  React.useEffect(() => {
    if (!autoplay || userInteracted.current || count === 0) return;
    let cancelled = false;
    const scheduleNext = (delay) => {
      autoTimerRef.current = setTimeout(() => {
        if (cancelled || userInteracted.current) return;
        const idx = autoIndexRef.current % count;
        setActive(idx);
        autoTimerRef.current = setTimeout(() => {
          if (cancelled || userInteracted.current) return;
          setFlipped(idx);
          autoTimerRef.current = setTimeout(() => {
            if (cancelled || userInteracted.current) return;
            setFlipped(null);
            autoIndexRef.current++;
            scheduleNext(interval);
          }, interval);
        }, FLIP_DELAY);
      }, delay);
    };
    scheduleNext(FIRST_DELAY);
    return () => {
      cancelled = true;
      if (autoTimerRef.current) clearTimeout(autoTimerRef.current);
    };
  }, [autoplay, count, interval, setActive, setFlipped]);

  const slotCenter = React.useCallback((i) => {
    if (size.carousel) {
      return (i - centerIndex) * size.badgeW * pitch;
    }
    const span = (count - 1) * size.badgeW * pitch;
    return -span / 2 + i * size.badgeW * pitch;
  }, [size.carousel, size.badgeW, pitch, centerIndex, count]);

  React.useEffect(() => {
    let last = performance.now();
    let frameId;
    const tick = (now) => {
      const dt = Math.min(0.033, (now - last) / 1000);
      last = now;

      if (size.carousel) {
        const targetReel = isDragging.current ? targetXRef.current + dragOffsetRef.current : targetXRef.current;
        const [nPos, nVel] = stepSpring(reelPosRef.current, reelVelRef.current, targetReel, REEL_K, REEL_ZETA, dt);
        reelPosRef.current = nPos;
        reelVelRef.current = nVel;
        currentXRef.current = nPos;
      } else {
        currentXRef.current = 0;
      }

      let moving = false;
      for (let i = 0; i < count; i++) {
        const x = slotCenter(i) + currentXRef.current;
        const dx = x - prevXsRef.current[i];
        prevXsRef.current[i] = x;
        const targetAngle = clamp(-dx * LAG, -32, 32);
        const diff = anglesRef.current[i] - targetAngle;
        const accel = -SWING_K * diff - SWING_DAMP * velsRef.current[i];
        velsRef.current[i] += accel * dt;
        anglesRef.current[i] += velsRef.current[i] * dt;

        const targetFlip = flipped === i ? 180 : 0;
        const flipDiff = targetFlip - flipsRef.current[i];
        flipsRef.current[i] += flipDiff * Math.min(1, dt * 10);

        if (Math.abs(velsRef.current[i]) > 0.05 || Math.abs(diff) > 0.05 || Math.abs(flipDiff) > 0.05) {
          moving = true;
        }
      }

      if (moving || isDragging.current || Math.abs(reelVelRef.current) > 0.1) {
        setRenderCount((c) => (c + 1) % 100000);
      }
      frameId = requestAnimationFrame(tick);
    };
    frameId = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frameId);
  }, [count, size.carousel, slotCenter, flipped]);

  const onPointerDown = (e) => {
    if (!size.carousel) return;
    stop();
    dragPointerId.current = e.pointerId;
    dragStartX.current = e.clientX;
    dragLastX.current = e.clientX;
    dragLastTime.current = performance.now();
    dragVelocity.current = 0;
    isDragging.current = true;
    dragOffsetRef.current = 0;
    e.currentTarget.setPointerCapture(e.pointerId);
  };

  const onPointerMove = (e) => {
    if (!isDragging.current || e.pointerId !== dragPointerId.current) return;
    const now = performance.now();
    const dt = Math.max(1, now - dragLastTime.current);
    const dx = e.clientX - dragLastX.current;
    dragVelocity.current = (dx / dt) * 1000;
    dragLastX.current = e.clientX;
    dragLastTime.current = now;

    const totalDx = e.clientX - dragStartX.current;
    const maxDrag = (count - 1) * size.badgeW * pitch;
    let off = totalDx;
    if (centerIndex === 0 && off > 0) {
      off = Math.sign(off) * Math.min(MAX_STRETCH, Math.sqrt(Math.abs(off)) * 5);
    } else if (centerIndex === count - 1 && off < 0) {
      off = Math.sign(off) * Math.min(MAX_STRETCH, Math.sqrt(Math.abs(off)) * 5);
    }
    dragOffsetRef.current = off;
  };

  const finishDrag = () => {
    if (!isDragging.current) return;
    isDragging.current = false;
    const totalDx = dragLastX.current - dragStartX.current;
    const step = size.badgeW * pitch;
    let shift = -Math.round(totalDx / step);
    if (Math.abs(dragVelocity.current) > 350) {
      shift = -Math.sign(dragVelocity.current);
    }
    const next = clamp(centerIndex + shift, 0, count - 1);
    dragOffsetRef.current = 0;
    setActive(next);
  };

  const onBadgeClick = (i) => {
    stop();
    if (size.carousel && i !== centerIndex) {
      setActive(i);
      return;
    }
    setFlipped(flipped === i ? null : i);
  };

  const onBadgeKeyDown = (e, i) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      onBadgeClick(i);
    } else if (e.key === "Escape" && flipped === i) {
      e.preventDefault();
      setFlipped(null);
    } else if (e.key === "ArrowRight") {
      e.preventDefault();
      const nxt = clamp(i + 1, 0, count - 1);
      setActive(nxt);
      const el = railRef.current?.querySelector(`[data-badge-index="${nxt}"]`);
      el?.focus();
    } else if (e.key === "ArrowLeft") {
      e.preventDefault();
      const prv = clamp(i - 1, 0, count - 1);
      setActive(prv);
      const el = railRef.current?.querySelector(`[data-badge-index="${prv}"]`);
      el?.focus();
    }
  };

  const person = active !== null && active !== undefined ? items[active] : null;
  const showingBack = active !== null && active !== undefined && flipped === active;
  const line1 = person ? showingBack ? person.role : person.name : eyebrow ?? "The Team";
  const line2 = person ? showingBack ? person.team ?? labels.back : `${person.role}${person.team ? ` · ${person.team}` : ""}` : caption ?? labels.flip;

  return (
    <section
      ref={rootRef}
      className={`relative flex flex-col items-stretch overflow-hidden bg-background text-foreground ${className}`}
      {...rest}
    >
      <div className="relative z-10 flex flex-col items-center px-6 pt-8 text-center sm:pt-12">
        {eyebrow && !person && (
          <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
            {eyebrow}
          </p>
        )}
        {heading && (
          <h2 className="mt-1 text-2xl font-bold tracking-tight sm:text-3xl">
            {heading}
          </h2>
        )}
      </div>

      <div
        ref={railRef}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={finishDrag}
        onPointerCancel={finishDrag}
        style={{
          height: `${size.hangerH + size.badgeW * RATIO + (compact ? 15 : 80)}px`,
          perspective: `${PERSPECTIVE}px`,
          touchAction: size.carousel ? "pan-y" : "auto",
        }}
        className="relative my-4 w-full select-none"
      >
        <svg
          aria-hidden="true"
          className="pointer-events-none absolute inset-x-0 top-0 w-full"
          style={{ height: `${size.hangerH + 8}px` }}
        >
          {items.map((item, i) => {
            const h = hash(item.id);
            const extra = item.drop ?? restDrop(h);
            const drop = (extra / 124) * size.badgeW;
            const hangerHeight = size.hangerH + drop;
            const x = slotCenter(i) + currentXRef.current + size.railW / 2;
            const toneCls = toneClass(item.tone);
            return (
              <g
                key={item.id}
                transform={`translate(${x - size.badgeW / 2}, 0)`}
                className={toneCls}
              >
                <RibbonHanger width={size.badgeW} height={hangerHeight} />
              </g>
            );
          })}
        </svg>

        {items.map((item, i) => {
          const h = hash(item.id);
          const extra = item.drop ?? restDrop(h);
          const drop = (extra / 124) * size.badgeW;
          const top = size.hangerH + drop;
          const x = slotCenter(i) + currentXRef.current + size.railW / 2 - size.badgeW / 2;
          const angle = anglesRef.current[i] ?? 0;
          const flip = flipsRef.current[i] ?? 0;
          const ry = restY(h);
          const rz = restZ(h);
          const toneCls = toneClass(item.tone);
          const badgeH = size.badgeW * RATIO;
          const isFlipped = flipped === i;

          return (
            <div
              key={item.id}
              data-badge-index={i}
              role="button"
              tabIndex={0}
              aria-label={`${item.name}, ${item.role}`}
              aria-pressed={isFlipped}
              onClick={() => onBadgeClick(i)}
              onKeyDown={(e) => onBadgeKeyDown(e, i)}
              style={{
                position: "absolute",
                top: `${top}px`,
                left: `${x}px`,
                width: `${size.badgeW}px`,
                height: `${badgeH}px`,
                transformStyle: "preserve-3d",
                transform: `rotateZ(${angle + rz}deg) rotateY(${flip + ry}deg)`,
                cursor: "pointer",
                fontSize: `${size.scale * EM}px`,
              }}
              className="outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              <div
                style={{
                  transformStyle: "preserve-3d",
                  width: "100%",
                  height: "100%",
                }}
                className="relative"
              >
                <ClipHardware />

                {/* FRONT FACE */}
                <span
                  style={{
                    backfaceVisibility: "hidden",
                    WebkitBackfaceVisibility: "hidden",
                    transform: "rotateY(0deg)",
                  }}
                  className="absolute inset-0 flex flex-col items-center overflow-hidden rounded-[0.85em] border border-border bg-card px-[0.8em] pb-[0.7em] text-card-foreground shadow-[0_12px_28px_rgba(0,0,0,0.45)]"
                >
                  <div
                    style={{ height: "1.9em" }}
                    className={`relative -mx-[0.8em] w-[calc(100%+1.6em)] overflow-hidden bg-current ${toneCls}`}
                  >
                    <RibbonTexture />
                  </div>

                  <span className="relative mt-[2.05em] size-[5.3em] overflow-hidden rounded-full p-[0.2em] bg-muted shadow-inner">
                    <img
                      src={item.image}
                      alt=""
                      loading="lazy"
                      className="size-full select-none rounded-full object-cover"
                    />
                  </span>

                  <span className="mt-[0.55em] w-full truncate text-center text-[1.08em] font-semibold tracking-tight">
                    {item.name}
                  </span>
                  <span className="w-full truncate text-center text-[0.82em] text-muted-foreground">
                    {item.role}
                  </span>
                </span>

                {/* BACK FACE */}
                <span
                  style={{
                    backfaceVisibility: "hidden",
                    WebkitBackfaceVisibility: "hidden",
                    transform: "rotateY(180deg)",
                  }}
                  className="absolute inset-0 flex flex-col justify-between overflow-hidden rounded-[0.85em] border border-border bg-card p-[0.85em] text-card-foreground shadow-[0_12px_28px_rgba(0,0,0,0.45)]"
                >
                  <div className="flex flex-col gap-[0.4em]">
                    <span className="text-[0.7em] font-bold uppercase tracking-widest text-muted-foreground">
                      {item.team ?? "Resolve MUN 2.0"}
                    </span>
                    {item.bio && (
                      <p className="line-clamp-4 text-[0.78em] leading-snug text-muted-foreground">
                        {item.bio}
                      </p>
                    )}
                    {item.tags && item.tags.length > 0 && (
                      <div className="mt-[0.2em] flex flex-wrap gap-[0.25em]">
                        {item.tags.map((t) => (
                          <span
                            key={t}
                            className="rounded-full bg-muted/60 px-[0.5em] py-[0.15em] text-[0.68em] text-muted-foreground"
                          >
                            {t}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>

                  {item.links && item.links.length > 0 && (
                    <div className="flex flex-col gap-[0.2em] border-t border-border pt-[0.4em]">
                      {item.links.map((link) => (
                        <a
                          key={link.label}
                          href={link.href}
                          target="_blank"
                          rel="noreferrer"
                          onClick={(e) => e.stopPropagation()}
                          className={`${LINK_ROW} pointer-events-auto text-card-foreground hover:bg-muted`}
                        >
                          <LinkIcon label={link.label} />
                          {link.label}
                        </a>
                      ))}
                    </div>
                  )}
                </span>
              </div>
            </div>
          );
        })}

        {size.carousel && (
          <>
            <div
              aria-hidden="true"
              className="pointer-events-none absolute inset-y-0 left-0 z-50 w-12 bg-gradient-to-r from-background from-25% to-transparent"
            />
            <div
              aria-hidden="true"
              className="pointer-events-none absolute inset-y-0 right-0 z-50 w-12 bg-gradient-to-l from-background from-25% to-transparent"
            />
          </>
        )}
      </div>

      {size.carousel && count > 1 && (
        <div
          className="relative z-10 mt-1 flex justify-center gap-1.5"
          role="group"
          aria-label={labels.show}
        >
          {items.map((item, i) => (
            <button
              key={item.id}
              type="button"
              aria-label={`${labels.show} ${item.name}`}
              aria-current={centerIndex === i}
              onClick={() => {
                stop();
                setActive(i);
              }}
              className={`h-1.5 rounded-full outline-none transition-[width,background-color] duration-300 ${
                centerIndex === i
                  ? "w-6 bg-foreground"
                  : "w-1.5 bg-foreground/25 hover:bg-foreground/45"
              }`}
            />
          ))}
        </div>
      )}

      {showCaption && (
        <div className="relative z-10 flex flex-col items-center gap-3 px-6 pb-7 pt-3 text-center">
          <div
            id={`${uid}-caption`}
            aria-live="polite"
            className="min-h-[2.6rem]"
          >
            <p className="text-sm font-medium">{line1}</p>
            <p className="mt-0.5 text-[13px] text-muted-foreground">{line2}</p>
          </div>
          {action}
        </div>
      )}
    </section>
  );
}

export default TeamLanyardRail;

