"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import {
  auth, signOutUser, onAuthStateChanged
} from "@/lib/firebase";
import {
  NotchNav,
  NotchLeftWing,
  NotchRightWing,
  NotchCornerLeftWing,
  NotchCornerRightWing,
} from "@/components/ui/adaptive-notch-navigation-bar";
import {
  LogOut,
  LayoutDashboard,
  ExternalLink,
  ChevronDown,
} from "lucide-react";

/* Bespoke Handcrafted Navigation Icons (Custom SVG, Not Lucide) */
function NavAboutIcon({ className, ...props }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className={className} {...props}>
      <circle cx="12" cy="12" r="9" />
      <line x1="12" y1="11" x2="12" y2="17" />
      <circle cx="12" cy="7.5" r="0.8" fill="currentColor" stroke="none" />
    </svg>
  );
}

function NavLetterIcon({ className, ...props }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className={className} {...props}>
      <path d="M4 4h16c.55 0 1 .45 1 1v14c0 .55-.45 1-1 1H4c-.55 0-1-.45-1-1V5c0-.55.45-1 1-1Z" />
      <path d="m3 6 9 6 9-6" />
      <line x1="7" y1="14" x2="11" y2="14" />
      <line x1="7" y1="17" x2="14" y2="17" />
    </svg>
  );
}

function NavCommitteesIcon({ className, ...props }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className={className} {...props}>
      <circle cx="12" cy="12" r="9" />
      <ellipse cx="12" cy="12" rx="4" ry="9" />
      <line x1="3" y1="12" x2="21" y2="12" />
      <line x1="4.5" y1="7" x2="19.5" y2="7" />
      <line x1="4.5" y1="17" x2="19.5" y2="17" />
    </svg>
  );
}

function NavVenueIcon({ className, ...props }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className={className} {...props}>
      <path d="M12 21s-7-4.35-7-10.5a7 7 0 1 1 14 0c0 6.15-7 10.5-7 10.5Z" />
      <circle cx="12" cy="10.5" r="2.5" />
    </svg>
  );
}

function NavTicketPassIcon({ className, ...props }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className={className} {...props}>
      {/* Authentic admission pass with circular cutout notches on top & bottom */}
      <path d="M2 9a3 3 0 0 1 0 6v3.5A1.5 1.5 0 0 0 3.5 20h17a1.5 1.5 0 0 0 1.5-1.5V15a3 3 0 0 1 0-6V5.5A1.5 1.5 0 0 0 20.5 4h-17A1.5 1.5 0 0 0 2 5.5V9Z" />
      {/* Dashed perforation stub dividing line */}
      <line x1="15" y1="4.5" x2="15" y2="19.5" strokeDasharray="2 2" />
      {/* Star / diplomat emblem on main pass body */}
      <path d="m8.5 9 1 2 2.2.3-1.6 1.5.4 2.2-2-1-2 1 .4-2.2-1.6-1.5 2.2-.3 1-2Z" fill="currentColor" stroke="none" />
      {/* Mini barcode lines on stub */}
      <line x1="18" y1="9.5" x2="18" y2="14.5" />
      <line x1="19.5" y1="10.5" x2="19.5" y2="13.5" />
    </svg>
  );
}

function NavBrochureIcon({ className, ...props }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className={className} {...props}>
      <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
      <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2Z" />
      <path d="M12 7v6m-3-3 3 3 3-3" />
    </svg>
  );
}

export function Navbar() {
  const [user, setUser] = useState(null);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("about");
  const userMenuRef = useRef(null);

  // Auth observer
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      if (firebaseUser) {
        setUser({
          uid: firebaseUser.uid,
          email: firebaseUser.email,
          displayName:
            firebaseUser.displayName ||
            firebaseUser.email?.split("@")[0] ||
            "Delegate",
          photoURL: firebaseUser.photoURL || "",
        });
      } else {
        setUser(null);
      }
    });
    return () => unsubscribe();
  }, []);

  // Scrollspy to automatically synchronize active notch tab
  useEffect(() => {
    if (typeof window === "undefined") return;

    const sectionIds = ["about", "letter", "committees", "venue", "delegate-pass"];
    const handleScrollSpy = () => {
      const scrollY = window.scrollY;
      const windowHeight = window.innerHeight;
      const offsetThreshold = windowHeight * 0.35;

      if (scrollY < 200) {
        setActiveTab("about");
        return;
      }

      for (let i = sectionIds.length - 1; i >= 0; i--) {
        const el = document.getElementById(sectionIds[i]);
        if (el) {
          const rect = el.getBoundingClientRect();
          if (rect.top <= offsetThreshold) {
            setActiveTab(sectionIds[i]);
            return;
          }
        }
      }
    };

    window.addEventListener("scroll", handleScrollSpy, { passive: true });
    return () => window.removeEventListener("scroll", handleScrollSpy);
  }, []);

  // Close user menu on outside click
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (userMenuRef.current && !userMenuRef.current.contains(e.target)) {
        setUserMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const openModal = () => {
    if (typeof window !== "undefined") {
      if (typeof window.openSelectionModal === "function") return window.openSelectionModal();
      if (typeof window.openAuthModal === "function") {
        window.pendingPathway = "SCROLL_TO_PASSES";
        return window.openAuthModal("signup");
      }
    }
    const m = document.getElementById("selectionModal");
    if (m) {
      m.classList.add("active");
      document.body.style.overflow = "hidden";
    }
  };

  const handleSignOut = async () => {
    try {
      await signOutUser();
      setUserMenuOpen(false);
      if (typeof window !== "undefined" && window.showAlert) {
        window.showAlert("Signed out successfully", "info");
      }
    } catch (err) {
      console.error("Sign out error:", err);
    }
  };

  const getUserInitials = () => {
    if (!user) return "D";
    const name = (user.displayName || "").trim();
    if (name) {
      const parts = name.split(/\s+/).filter(Boolean);
      if (parts.length >= 2 && parts[0] && parts[1]) {
        return (parts[0][0] + parts[1][0]).toUpperCase();
      }
      if (parts.length >= 1) {
        return parts[0].slice(0, 1).toUpperCase();
      }
    }
    if (user.email) {
      return user.email.slice(0, 1).toUpperCase();
    }
    return "D";
  };

  const scrollToAnchor = useCallback((targetId) => {
    if (typeof window === "undefined") return;
    const target = document.getElementById(targetId);
    if (target) {
      const navOffset = 64;
      const targetTop = target.getBoundingClientRect().top + window.scrollY - navOffset;
      window.scrollTo({ top: Math.max(0, targetTop), behavior: "smooth" });
    }
  }, []);

  const handleNavSelect = (id) => {
    setActiveTab(id);
    if (id === "brochure") {
      if (typeof window !== "undefined") {
        if (window.showCustomAlert) {
          window.showCustomAlert("Delegate Brochure releasing soon!", "info");
        } else if (window.showAlert) {
          window.showAlert("Delegate Brochure releasing soon!", "info");
        } else {
          alert("Delegate Brochure releasing soon!");
        }
      }
      return;
    }
    scrollToAnchor(id);
  };

  const navItems = [
    { id: "about", label: "About", icon: NavAboutIcon },
    { id: "letter", label: "Letter", icon: NavLetterIcon },
    { id: "committees", label: "Committees", icon: NavCommitteesIcon },
    { id: "venue", label: "Venue", icon: NavVenueIcon },
    { id: "delegate-pass", label: "Passes", icon: NavTicketPassIcon },
    { id: "brochure", label: "Brochure", icon: NavBrochureIcon, disabled: false },
  ];

  // Brand Logo Notch Slot (Vivid UN Colors)
  const logoSlot = (
    <Link
      href="/#hero"
      onClick={(e) => {
        if (typeof window !== "undefined" && window.location.pathname === "/") {
          e.preventDefault();
          window.scrollTo({ top: 0, behavior: "smooth" });
        }
      }}
      className="flex items-center gap-1.5 sm:gap-2 group outline-none select-none !no-underline"
      aria-label="Resolve MUN 2.0"
    >
      <div className="relative size-5 sm:size-6 shrink-0 flex items-center justify-center">
        <img
          src="/images/Logo.svg"
          onError={(e) => {
            e.currentTarget.src = "https://resolvemun.in/images/Logo.svg";
          }}
          alt="Resolve MUN"
          className="size-full object-contain transition-transform duration-200 group-hover:scale-105"
        />
      </div>
      <span
        className="text-[0.98rem] min-[360px]:text-[1.08rem] sm:text-[1.28rem] tracking-[0.08em] sm:tracking-[0.14em] leading-none text-white group-hover:text-zinc-200 transition-colors duration-200 font-bold whitespace-nowrap pt-0.5"
        style={{ fontFamily: "'Bebas Neue', sans-serif" }}
      >
        RESOLVE MUN <span className="hidden min-[360px]:inline">2.0</span>
      </span>
    </Link>
  );

  // Animation variants for sleek profile dropdown
  const dropdownContentVariants = {
    hidden: { opacity: 0, y: -8, scale: 0.96 },
    visible: {
      opacity: 1,
      y: 0,
      scale: 1,
      transition: {
        type: "spring",
        damping: 22,
        stiffness: 320,
        staggerChildren: 0.04,
      },
    },
    exit: { opacity: 0, y: -6, scale: 0.96, transition: { duration: 0.15 } },
  };

  const dropdownItemVariants = {
    hidden: { opacity: 0, y: 6 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.2 } },
  };

  // Right Action Notch Slot (Refined Luxury Glass Pill & Floating Profile Card)
  const rightContentSlot = (
    <div className="flex items-center gap-2" ref={userMenuRef}>
      {user ? (
        <div className="relative">
          <button
            type="button"
            onClick={() => setUserMenuOpen(!userMenuOpen)}
            className="h-7 sm:h-8 p-1 sm:pl-1.5 sm:pr-2.5 rounded-full bg-gradient-to-b from-white/[0.12] to-white/[0.04] hover:from-white/[0.18] hover:to-white/[0.08] border border-white/20 hover:border-white/35 flex items-center gap-1.5 sm:gap-2 transition-all duration-200 cursor-pointer active:scale-95 shadow-[0_4px_16px_rgba(0,0,0,0.6),inset_0_1px_0_rgba(255,255,255,0.15)] text-xs text-white backdrop-blur-md"
            aria-label="User menu"
            aria-expanded={userMenuOpen}
          >
            {user.photoURL ? (
              <img
                src={user.photoURL}
                alt={user.displayName || "User"}
                className="size-5 rounded-full object-cover shrink-0 ring-1 ring-white/40 shadow-sm"
              />
            ) : (
              <div className="size-5 rounded-full bg-gradient-to-tr from-indigo-500 via-purple-500 to-pink-500 text-white font-bold text-[10px] flex items-center justify-center shrink-0 ring-1 ring-white/30 shadow-sm">
                {getUserInitials()}
              </div>
            )}
            <span className="hidden sm:inline text-xs font-medium text-white max-w-[85px] truncate leading-none tracking-tight">
              {user.displayName ? user.displayName.trim().split(/\s+/)[0] : "Delegate"}
            </span>
            <ChevronDown className={`size-3 text-white/50 transition-transform duration-200 hidden sm:block ${userMenuOpen ? "rotate-180 text-white" : ""}`} />
          </button>

          {/* User Dropdown */}
          <AnimatePresence>
            {userMenuOpen && (
              <motion.div
                initial={{ opacity: 0, y: -8, scale: 0.96 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -6, scale: 0.96 }}
                transition={{ duration: 0.15, ease: "easeOut" }}
                style={{ backgroundColor: "#0d0e15" }}
                className="absolute right-0 top-full mt-2.5 w-[min(18rem,calc(100vw-24px))] p-2.5 rounded-2xl border border-white/20 shadow-[0_30px_90px_rgba(0,0,0,0.98),0_0_0_1px_rgba(255,255,255,0.12)] z-[999999] select-none flex flex-col gap-1.5"
              >
                {/* Profile Card Header - High Contrast Solid Card */}
                <div className="p-3 rounded-xl bg-[#161824] border border-white/10 flex items-center gap-3">
                  {user.photoURL ? (
                    <img
                      src={user.photoURL}
                      alt={user.displayName || "User"}
                      className="size-9 rounded-full object-cover shrink-0 ring-1 ring-white/30 shadow-md"
                    />
                  ) : (
                    <div className="size-9 rounded-full bg-gradient-to-tr from-indigo-600 to-purple-600 border border-white/20 text-white font-bold text-xs flex items-center justify-center shrink-0 shadow-md">
                      {getUserInitials()}
                    </div>
                  )}
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-bold text-white tracking-tight truncate leading-tight">
                      {user.displayName || "Account"}
                    </p>
                    <p className="text-xs text-zinc-300 font-mono truncate mt-0.5">
                      {user.email}
                    </p>
                  </div>
                </div>

                <div className="h-px bg-white/10 my-0.5 mx-1" />

                {/* Delegate Dashboard */}
                <div>
                  <Link
                    href="/dashboard"
                    onClick={() => setUserMenuOpen(false)}
                    className="group flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-semibold text-zinc-200 hover:text-white hover:bg-white/10 transition-all !no-underline"
                  >
                    <div className="flex items-center gap-2.5">
                      <div className="size-7 rounded-lg bg-white/10 border border-white/15 flex items-center justify-center text-white group-hover:bg-white/20 transition-all">
                        <LayoutDashboard className="size-3.5" />
                      </div>
                      <div className="flex flex-col text-left">
                        <span className="leading-tight text-white text-[13px] font-semibold">Delegate Dashboard</span>
                        <span className="text-[11px] text-zinc-300 font-normal">View pass & credentials</span>
                      </div>
                    </div>
                    <ExternalLink className="size-3 text-zinc-300 group-hover:text-white group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all" />
                  </Link>
                </div>

                <div className="h-px bg-white/10 my-0.5 mx-1" />

                {/* Sign Out */}
                <div>
                  <button
                    type="button"
                    onClick={handleSignOut}
                    className="group w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-xs font-semibold text-zinc-200 hover:text-red-400 hover:bg-red-500/10 transition-all text-left cursor-pointer"
                  >
                    <div className="size-7 rounded-lg bg-white/10 border border-white/15 flex items-center justify-center text-zinc-300 group-hover:text-red-400 group-hover:border-red-500/30 group-hover:bg-red-500/20 transition-all">
                      <LogOut className="size-3.5" />
                    </div>
                    <span className="text-[13px] font-semibold">Sign Out</span>
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      ) : (
        <button
          type="button"
          onClick={openModal}
          className="relative inline-flex items-center justify-center h-7 sm:h-8 px-3 sm:px-4 rounded-full bg-white text-black font-extrabold text-[11px] sm:text-xs uppercase tracking-wider hover:bg-zinc-100 hover:shadow-[0_0_20px_rgba(255,255,255,0.3)] active:scale-95 transition-all shadow-sm cursor-pointer whitespace-nowrap"
        >
          Register
        </button>
      )}
    </div>
  );

  return (
    <NotchNav
      items={navItems}
      activeId={activeTab}
      position="top"
      logo={logoSlot}
      rightContent={rightContentSlot}
      showLogo={true}
      showRightContent={true}
      onActiveChange={handleNavSelect}
    />
  );
}
export default Navbar;
