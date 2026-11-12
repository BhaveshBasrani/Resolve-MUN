"use client";

import React, { useState, useEffect } from "react";
import AdmitOneTicket, { TICKET_LAYOUT } from "./ui/admit-one-ticket";
import { auth, onAuthStateChanged, fetchSystemSettingsCached } from "@/lib/firebase";
import { DEFAULT_SITE_SETTINGS } from "@/lib/supabase";

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
        if (window.selectPathway) {
          window.selectPathway("delegate");
        } else if (window.openRegistration) {
          window.openRegistration();
        } else if (window.openAuthModal) {
          window.pendingPathway = "delegate";
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
        if (window.selectPathway) {
          window.selectPathway("oc");
        } else if (window.openOcModal) {
          window.openOcModal();
        } else if (window.openAuthModal) {
          window.pendingPathway = "oc";
          window.openAuthModal("signup");
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
        if (window.selectPathway) {
          window.selectPathway("eb");
        } else if (window.openEbRegistration) {
          window.openEbRegistration();
        } else if (window.openEbModal) {
          window.openEbModal();
        } else if (window.openAuthModal) {
          window.pendingPathway = "eb";
          window.openAuthModal("signup");
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
        if (window.selectPathway) {
          window.selectPathway("socials");
        } else if (window.openSocialsModal) {
          window.openSocialsModal();
        } else if (window.openAuthModal) {
          window.pendingPathway = "socials";
          window.openAuthModal("signup");
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
        if (window.selectPathway) {
          window.selectPathway("secretariat");
        } else if (window.openSecModal) {
          window.openSecModal();
        } else if (window.openAuthModal) {
          window.pendingPathway = "secretariat";
          window.openAuthModal("signup");
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
  const [siteSettings, setSiteSettings] = useState(DEFAULT_SITE_SETTINGS);

  // Sync live ticket availability & dynamic pricing from Supabase / Admin Settings
  useEffect(() => {
    let mounted = true;
    const loadSettings = async (force = false) => {
      try {
        const s = await fetchSystemSettingsCached(force);
        if (mounted && s) {
          setSiteSettings((prev) => ({ ...prev, ...s }));
        }
      } catch (e) {
        // Keep defaults
      }
    };
    loadSettings(false);

    const onSettingsUpdated = (e) => {
      if (e?.detail) {
        setSiteSettings((prev) => ({ ...prev, ...e.detail }));
      } else {
        loadSettings(true);
      }
    };
    window.addEventListener("siteSettingsUpdated", onSettingsUpdated);
    return () => {
      mounted = false;
      window.removeEventListener("siteSettingsUpdated", onSettingsUpdated);
    };
  }, []);

  const isPassOpen = (passId) => {
    if (siteSettings.registrationsOpen === false) return false;
    switch (passId) {
      case "delegate":
        return siteSettings.delegateOpen !== false;
      case "oc":
        return siteSettings.ocOpen !== false;
      case "eb":
        return Boolean(siteSettings.ebOpen);
      case "socials":
        return Boolean(siteSettings.socialsOpen);
      case "secretariat":
        return siteSettings.secretariatOpen !== false;
      default:
        return true;
    }
  };

  const getPassPriceTag = (passId) => {
    switch (passId) {
      case "delegate":
        return `₹${Number(siteSettings.delegateFee || 2500).toLocaleString("en-IN")} · PRIORITY ROUND`;
      case "oc":
        return `FROM ₹${Number(siteSettings.ocFeeBasic || 750).toLocaleString("en-IN")} · SALARIED ROLE`;
      case "eb":
        return "EXECUTIVE BOARD";
      case "socials":
        return `₹${Number(siteSettings.socialsFee || 999).toLocaleString("en-IN")} · SOCIALS NIGHT`;
      case "secretariat":
        return "FREE APPLICATION · INTERVIEW";
      default:
        return "";
    }
  };

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

  // Compact responsive ticket sizing so passes never clip or overflow on mobile screens
  useEffect(() => {
    const updateSize = () => {
      const w = window.innerWidth;
      if (w < 640) {
        setTicketWidth(Math.min(295, Math.max(250, w - 36)));
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
      className="reveal relative bg-black text-white py-10 sm:py-24 overflow-hidden border-t border-white/10"
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

      <div className="relative z-10 max-w-7xl mx-auto px-3.5 sm:px-6 text-left sm:text-center">
        {/* Sleek Modern Sideline Label */}
        <div
          className="section-label"
          style={{ margin: "0 0 8px 0" }}
        >
          Resolve MUN 2.0
        </div>

        {/* Section Headline */}
        <h2
          className="text-3xl sm:text-5xl md:text-6xl font-extrabold uppercase tracking-tight text-white mb-1.5"
          style={{ fontFamily: "'Oswald', sans-serif" }}
        >
          Official Passes
        </h2>

        {/* Minimal Uncluttered Description */}
        <p className="text-xs sm:text-sm text-white/60 max-w-xl sm:mx-auto font-light leading-relaxed mb-6 sm:mb-14">
          Select your pass below.
        </p>

        {/* All 5 Passes Laid Out (Grid / Flex-Wrap like the folder cards) */}
        <div className="flex flex-wrap items-center justify-center gap-4 sm:gap-9 lg:gap-10">
          {PASSES.map((pass) => {
            const open = isPassOpen(pass.id);
            const priceTag = getPassPriceTag(pass.id);
            const handlePassClick = () => {
              if (!open) {
                if (typeof window !== "undefined" && window.showCustomAlert) {
                  window.showCustomAlert(
                    `${pass.label} registrations are currently unavailable / closed.`,
                    "info"
                  );
                }
                return;
              }
              pass.action();
            };

            return (
              <div
                key={pass.id}
                role="button"
                tabIndex={0}
                aria-disabled={!open}
                onClick={handlePassClick}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    handlePassClick();
                  }
                }}
                className={`group relative select-none outline-none transition-all duration-300 rounded-xl flex flex-col items-center gap-3 ${open
                  ? "cursor-pointer hover:scale-[1.04] active:scale-[0.98] focus-visible:ring-2 focus-visible:ring-white/40"
                  : "cursor-not-allowed grayscale opacity-45 contrast-75 hover:opacity-55"
                  }`}
                title={open ? `Click to claim ${pass.label}` : `${pass.label} — Currently Closed`}
                aria-label={open ? `Claim ${pass.label} for ${delegateName}` : `${pass.label} Closed`}
              >
                <div
                  className="relative perspective-[1200px] drop-shadow-[0_12px_32px_rgba(0,0,0,0.85)] group-hover:drop-shadow-[0_20px_45px_rgba(0,0,0,0.95)] transition-all duration-300"
                  style={{
                    filter: open ? `drop-shadow(0 0 16px ${pass.glow})` : "none",
                  }}
                >
                  <AdmitOneTicket
                    name={delegateName}
                    presenter="RESOLVE MODEL UNITED NATIONS 2.0"
                    event={open ? priceTag || "DIPLOMACY · REFORM · RECONCILE" : "REGISTRATIONS CLOSED"}
                    venue={siteSettings.venueShort || siteSettings.conferenceVenue || "MERIDIAN SCHOOL, KOMPALLY"}
                    dates={(siteSettings.conferenceDates || "27–29 NOVEMBER 2026").toUpperCase()}
                    stubText={open ? pass.stub : "UNAVAILABLE"}
                    watermark="2026"
                    width={ticketWidth}
                    texture={pass.texture}
                    layout={RESOLVE_TICKET_LAYOUT}
                    tilt={open ? { maxTilt: 11, scale: 1.02, glare: 0.16 } : { maxTilt: 0, scale: 1, glare: 0 }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
