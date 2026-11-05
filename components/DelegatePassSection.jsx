"use client";

import React, { useState, useEffect } from "react";
import AdmitOneTicket, { TICKET_LAYOUT } from "./ui/admit-one-ticket";
import { auth, onAuthStateChanged } from "@/lib/firebase";

const PASSES = [
  {
    id: "delegate",
    label: "Delegate Pass",
    stub: "DELEGATE PASS",
    accent: "#a855f7",
    glow: "rgba(168, 85, 247, 0.25)",
    texture: {
      engine: "generative",
      colorBack: "#070311",
      colorFront: "#6d28d9",
      colorHighlight: "#a855f7",
      shape: "warp",
      type: "4x4",
      size: 1.1,
      speed: 0.35,
    },
    action: () => {
      if (typeof window !== "undefined") {
        if (window.openSelection) {
          window.openSelection();
        } else if (window.openAuthModal) {
          window.openAuthModal("signup");
        }
      }
    },
  },
  {
    id: "oc",
    label: "OC Pass",
    stub: "OC PASS",
    accent: "#38bdf8",
    glow: "rgba(56, 189, 248, 0.25)",
    texture: {
      engine: "generative",
      colorBack: "#020a14",
      colorFront: "#0284c7",
      colorHighlight: "#38bdf8",
      shape: "wave",
      type: "4x4",
      size: 1.2,
      speed: 0.32,
    },
    action: () => {
      if (typeof window !== "undefined") {
        if (window.openOcModal) {
          window.openOcModal();
        } else if (window.selectPathway) {
          window.selectPathway("oc");
        } else if (window.openSelection) {
          window.openSelection();
        }
      }
    },
  },
  {
    id: "eb",
    label: "EB Pass",
    stub: "EB PASS",
    accent: "#f59e0b",
    glow: "rgba(245, 158, 11, 0.25)",
    texture: {
      engine: "generative",
      colorBack: "#130902",
      colorFront: "#d97706",
      colorHighlight: "#fbbf24",
      shape: "circle",
      type: "4x4",
      size: 1.15,
      speed: 0.28,
    },
    action: () => {
      if (typeof window !== "undefined") {
        if (window.openEbModal) {
          window.openEbModal();
        } else if (window.showCustomAlert) {
          window.showCustomAlert("Executive Board applications are undergoing final review.", "info");
        }
      }
    },
  },
  {
    id: "socials",
    label: "Socials Pass",
    stub: "SOCIALS PASS",
    accent: "#fb7185",
    glow: "rgba(251, 113, 133, 0.25)",
    texture: {
      engine: "generative",
      colorBack: "#15020a",
      colorFront: "#e11d48",
      colorHighlight: "#fb7185",
      shape: "warp",
      type: "4x4",
      size: 1.3,
      speed: 0.38,
    },
    action: () => {
      if (typeof window !== "undefined") {
        if (window.showCustomAlert) {
          window.showCustomAlert("Socials Night passes are releasing soon! Stay tuned.", "info");
        } else {
          alert("Socials Night passes are releasing soon! Stay tuned.");
        }
      }
    },
  },
  {
    id: "secretariat",
    label: "Secretariat Pass",
    stub: "SECRETARIAT PASS",
    accent: "#34d399",
    glow: "rgba(52, 211, 153, 0.25)",
    texture: {
      engine: "generative",
      colorBack: "#021309",
      colorFront: "#059669",
      colorHighlight: "#34d399",
      shape: "wave",
      type: "4x4",
      size: 1.2,
      speed: 0.3,
    },
    action: () => {
      if (typeof window !== "undefined") {
        if (window.openSecModal) {
          window.openSecModal();
        } else if (window.selectPathway) {
          window.selectPathway("secretariat");
        } else if (window.openSelection) {
          window.openSelection();
        }
      }
    },
  },
];

const RESOLVE_TICKET_LAYOUT = {
  ...TICKET_LAYOUT,
  inkColor: "#ffffff",
  watermarkColor: "#ffffff",
  watermarkOpacity: 0.28,
  labelTop: 45 / 741,
  labelSize: 14 / 741,
  labelLead: 20 / 741,
  labelTracking: 0.04,
  nameTop: 168 / 741,
  nameSize: 52 / 741,
  nameLead: 54 / 741,
  nameTracking: -0.015,
  footerTop: 326 / 741,
  footerSize: 13.5 / 741,
  footerTracking: 0.04,
};

export default function DelegatePassSection() {
  const [ticketWidth, setTicketWidth] = useState(328);
  const [delegateName, setDelegateName] = useState("YOUR NAME");

  // Auth sync: Personalize passes with user's name if logged in
  useEffect(() => {
    const syncUserName = () => {
      let name = null;
      if (typeof window !== "undefined") {
        name = localStorage.getItem("resolve_user_name");
      }
      if (!name && auth.currentUser?.displayName) {
        name = auth.currentUser.displayName;
      }
      if (name && name.trim()) {
        setDelegateName(name.trim().toUpperCase());
      } else {
        setDelegateName("YOUR NAME");
      }
    };

    syncUserName();
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user?.displayName) {
        setDelegateName(user.displayName.trim().toUpperCase());
      } else {
        const stored = typeof window !== "undefined" ? localStorage.getItem("resolve_user_name") : null;
        setDelegateName(stored && stored.trim() ? stored.trim().toUpperCase() : "YOUR NAME");
      }
    });

    return () => unsubscribe();
  }, []);

  // Compact responsive ticket sizing to match folder cards
  useEffect(() => {
    const updateSize = () => {
      const w = window.innerWidth;
      if (w < 400) {
        setTicketWidth(Math.max(280, w - 36));
      } else if (w < 640) {
        setTicketWidth(Math.min(320, w - 48));
      } else {
        setTicketWidth(328);
      }
    };
    updateSize();
    window.addEventListener("resize", updateSize);
    return () => window.removeEventListener("resize", updateSize);
  }, []);

  return (
    <section
      id="delegate-pass"
      className="reveal relative bg-black text-white py-16 sm:py-24 overflow-hidden border-t border-white/10"
      style={{ backgroundColor: "#000000" }}
    >
      {/* Background Halftone Grid & Ambient Glow */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage: "radial-gradient(#ffffff 1px, transparent 1px)",
          backgroundSize: "22px 22px",
        }}
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[380px] bg-indigo-600/10 blur-[150px] rounded-full"
      />

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 text-center">
        {/* Sleek Modern Sideline Label */}
        <div
          className="section-label"
          style={{ justifyContent: "center", margin: "0 auto 10px auto" }}
        >
          Resolve MUN 2.0
        </div>

        {/* Section Headline */}
        <h2
          className="text-4xl sm:text-5xl md:text-6xl font-extrabold uppercase tracking-tight text-white mb-3"
          style={{ fontFamily: "'Oswald', sans-serif" }}
        >
          Official Passes
        </h2>

        {/* Minimal Uncluttered Description */}
        <p className="text-sm sm:text-base text-white/60 max-w-xl mx-auto font-light leading-relaxed mb-12 sm:mb-16">
          Select your pass below.
        </p>

        {/* All 5 Passes Laid Out (Grid / Flex-Wrap like the folder cards) */}
        <div className="flex flex-wrap items-center justify-center gap-7 sm:gap-9 lg:gap-10">
          {PASSES.map((pass) => (
            <div
              key={pass.id}
              role="button"
              tabIndex={0}
              onClick={pass.action}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  pass.action();
                }
              }}
              className="group cursor-pointer select-none outline-none transition-all duration-300 hover:scale-[1.04] active:scale-[0.98] focus-visible:ring-2 focus-visible:ring-white/40 rounded-xl"
              title={`Click to claim ${pass.label}`}
              aria-label={`Claim ${pass.label} for ${delegateName}`}
            >
              <div
                className="perspective-[1200px] drop-shadow-[0_12px_32px_rgba(0,0,0,0.85)] group-hover:drop-shadow-[0_20px_45px_rgba(0,0,0,0.95)] transition-all duration-300"
                style={{
                  filter: `drop-shadow(0 0 16px ${pass.glow})`,
                }}
              >
                <AdmitOneTicket
                  name={delegateName}
                  presenter="RESOLVE MODEL UNITED NATIONS 2.0"
                  event="DIPLOMACY · REFORM · RECONCILE"
                  venue="MERIDIAN SCHOOL, KOMPALLY"
                  dates="27–29 NOVEMBER 2026"
                  stubText={pass.stub}
                  watermark="2026"
                  width={ticketWidth}
                  texture={pass.texture}
                  layout={RESOLVE_TICKET_LAYOUT}
                  tilt={{ maxTilt: 11, scale: 1.02, glare: 0.16 }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
