"use client";

import React, { useState, useEffect, useRef } from "react";
import { MetalButton } from "@/components/ui/metal-button";
import { 
  Menu, 
  X, 
  ArrowUpRight, 
  LayoutDashboard, 
  LogOut, 
  ChevronDown, 
  Shield, 
  Sparkles, 
  FileText, 
  MapPin, 
  Users, 
  FileDown, 
  Headphones 
} from "lucide-react";
import { auth, signOutUser, onAuthStateChanged } from "@/lib/firebase";
import Link from "next/link";

export function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [user, setUser] = useState(null);
  const scrollTicking = useRef(false);
  const userMenuRef = useRef(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      if (firebaseUser) {
        setUser({
          uid: firebaseUser.uid,
          email: firebaseUser.email,
          displayName: firebaseUser.displayName || firebaseUser.email?.split("@")[0] || "Delegate",
          photoURL: firebaseUser.photoURL || "",
        });
      } else {
        setUser(null);
      }
    });

    return () => unsubscribe();
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      if (!scrollTicking.current) {
        window.requestAnimationFrame(() => {
          const currentY = window.scrollY;
          setScrolled((prev) => {
            if (currentY > 50) return true;
            if (currentY < 18) return false;
            return prev;
          });
          scrollTicking.current = false;
        });
        scrollTicking.current = true;
      }
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Close user menu on click outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (userMenuRef.current && !userMenuRef.current.contains(e.target)) {
        setUserMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Prevent background scrolling when mobile menu is open
  useEffect(() => {
    if (mobileOpen) {
      document.body.style.overflow = "hidden";
      document.body.style.touchAction = "none";
    } else {
      document.body.style.overflow = "";
      document.body.style.touchAction = "";
    }
    return () => {
      document.body.style.overflow = "";
      document.body.style.touchAction = "";
    };
  }, [mobileOpen]);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Escape") {
        if (mobileOpen) setMobileOpen(false);
        if (userMenuOpen) setUserMenuOpen(false);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [mobileOpen, userMenuOpen]);

  const openModal = () => {
    setMobileOpen(false);
    if (typeof window !== "undefined") {
      if (typeof window.openAuthModal === "function") return window.openAuthModal();
      if (typeof window.openSelectionModal === "function") return window.openSelectionModal();
      if (typeof window.openSelection === "function") return window.openSelection();
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
      setMobileOpen(false);
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
      if (parts.length >= 2 && parts[0] && parts[1] && parts[0][0] && parts[1][0]) {
        return (parts[0][0] + parts[1][0]).toUpperCase();
      }
      if (parts.length >= 1 && parts[0]) {
        return parts[0].slice(0, 1).toUpperCase();
      }
    }
    if (user.email) {
      const clean = user.email.trim();
      return clean.slice(0, 1).toUpperCase();
    }
    return "D";
  };

  const navLinks = [
    { href: "/#about", label: "About", icon: Sparkles, note: null },
    { href: "/#letter", label: "Letter", icon: FileText, note: null },
    { href: "/#committees", label: "Committees", icon: Shield, note: "Soon" },
    { href: "/#venue", label: "Venue", icon: MapPin, note: "Soon" },
    { href: "/#secretariat", label: "Secretariat", icon: Users, note: "Soon" },
  ];

  return (
    <>
      {/* Header container */}
      <header id="navbar" className="fixed top-0 left-0 right-0 z-[10000] flex justify-center pointer-events-none">
        <div
          style={{
            willChange: "transform, max-width, padding, border-radius, background-color, box-shadow",
            transform: "translate3d(0, 0, 0)",
          }}
          className={[
            "pointer-events-auto flex items-center justify-between gap-2 sm:gap-4 select-none",
            "transition-all duration-300 ease-out",
            "mt-2 sm:mt-3 md:mt-4 py-1.5 sm:py-2 px-3 sm:px-6 lg:px-7 rounded-full sm:rounded-2xl border backdrop-blur-2xl w-[95%] sm:w-[92%] lg:w-[88%] max-w-5xl",
            scrolled
              ? "bg-[#050614]/98 border-white/25 shadow-[0_20px_50px_rgba(0,0,0,0.95),0_0_30px_rgba(59,130,246,0.25)]"
              : "bg-[#060818]/92 border-white/[0.15] shadow-[0_16px_40px_rgba(0,0,0,0.85),0_0_24px_rgba(59,130,246,0.18)]",
          ].join(" ")}
        >
          {/* Logo & Brand */}
          <Link
            href="/#hero"
            className="flex items-center gap-2 sm:gap-2.5 md:gap-3 shrink min-w-0 group"
            style={{ textDecoration: "none" }}
          >
            <div className="relative shrink-0 flex items-center justify-center">
              <img
                src="/images/Logo.svg"
                onError={(e) => {
                  e.currentTarget.src = "https://resolvemun.in/images/Logo.svg";
                }}
                alt="Resolve MUN"
                className="w-6 h-6 sm:w-7 sm:h-7 md:w-8 md:h-8 object-contain block transition-transform duration-300 group-hover:scale-105"
              />
              <div className="absolute inset-0 rounded-lg bg-blue-500/25 blur-md opacity-0 group-hover:opacity-100 transition-opacity -z-10" />
            </div>
            <div className="flex items-center gap-1.5 min-w-0">
              <span
                className="text-[1.15rem] sm:text-[1.25rem] md:text-[1.38rem] tracking-[0.1em] leading-none text-white group-hover:text-blue-300 transition-colors duration-200 truncate"
                style={{ fontFamily: "'Bebas Neue', sans-serif" }}
              >
                RESOLVE MUN
              </span>
              <span className="shrink-0 text-[8px] sm:text-[9px] font-mono font-bold tracking-wider px-1.5 py-0.5 rounded-full bg-gradient-to-r from-blue-500/20 to-purple-500/25 text-blue-300 border border-blue-400/35 leading-none">
                2.0
              </span>
            </div>
          </Link>

          {/* Desktop Nav Pills (Completely Untouched for Desktop) */}
          <div role="navigation" aria-label="Main Navigation" className="hidden lg:flex items-center gap-1 bg-white/[0.04] border border-white/[0.1] rounded-xl px-2.5 py-1 backdrop-blur-xl shadow-[inset_0_1px_1px_rgba(255,255,255,0.15)]">
            {navLinks.map((l) => (
              <a
                key={l.label}
                href={l.href}
                className="px-3 py-1.5 rounded-lg text-xs font-semibold tracking-wide text-white/75 hover:text-white hover:bg-white/[0.08] transition-all duration-150 inline-block"
              >
                {l.label}
              </a>
            ))}

            {/* Disabled Brochure Button in Navbar */}
            <button
              type="button"
              disabled
              title="Delegate Brochure Releasing Soon"
              onClick={(e) => {
                e.preventDefault();
                if (typeof window !== "undefined" && window.showAlert) {
                  window.showAlert("Delegate Brochure releasing soon!");
                }
              }}
              className="px-2.5 py-1.5 rounded-lg text-xs font-semibold tracking-wide text-white/40 inline-flex items-center gap-1.5 opacity-60 cursor-not-allowed select-none pointer-events-auto"
            >
              <span>Brochure</span>
              <span className="text-[9px] font-bold tracking-wider uppercase px-1.5 py-0.5 rounded-md bg-blue-500/20 text-blue-300 border border-blue-400/30 inline-block leading-none">
                Soon
              </span>
            </button>
          </div>

          {/* Right Action: DESKTOP & MOBILE RIGHT CLUSTER */}
          <div className="flex items-center gap-1.5 sm:gap-2.5 shrink-0" ref={userMenuRef}>
            {user ? (
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setUserMenuOpen(!userMenuOpen)}
                  className="h-8 sm:h-9 pl-1.5 pr-2.5 sm:pr-3 rounded-full bg-white/[0.08] hover:bg-white/[0.14] border border-white/20 flex items-center gap-1.5 sm:gap-2 transition-all duration-150 cursor-pointer active:scale-95 shadow-sm overflow-hidden"
                  aria-label="User menu"
                  aria-expanded={userMenuOpen}
                >
                  {user.photoURL ? (
                    <img
                      src={user.photoURL}
                      alt={user.displayName || "User"}
                      className="w-5 h-5 sm:w-6 sm:h-6 min-w-[20px] min-h-[20px] rounded-full object-cover shrink-0 border border-white/30"
                    />
                  ) : (
                    <div
                      className="w-5 h-5 sm:w-6 sm:h-6 min-w-[20px] min-h-[20px] rounded-full bg-gradient-to-tr from-purple-600 via-indigo-600 to-blue-500 text-white font-bold text-[10px] sm:text-[11px] flex items-center justify-center border border-white/30 shrink-0 select-none overflow-hidden"
                    >
                      {getUserInitials()}
                    </div>
                  )}
                  <span className="text-[11px] sm:text-xs font-semibold text-white/95 max-w-[65px] sm:max-w-[85px] truncate leading-none">
                    {user.displayName ? user.displayName.trim().split(/\s+/)[0] : "Delegate"}
                  </span>
                  <ChevronDown size={12} className="text-white/60 shrink-0" />
                </button>

                {/* User Dropdown Menu - Spaced, Solid High-Contrast & Sleek */}
                {userMenuOpen && (
                  <div
                    className="absolute right-0 mt-3 sm:mt-4 w-60 p-2 rounded-2xl border border-white/20 bg-[#0c0d18] shadow-[0_20px_50px_rgba(0,0,0,0.95),0_0_30px_rgba(0,0,0,0.9)] animate-in fade-in zoom-in-95 duration-100 z-[100000] select-none"
                  >
                    <div className="flex items-center gap-2.5 px-2.5 py-2 rounded-xl bg-white/[0.06] border border-white/[0.1] mb-1.5">
                      {user.photoURL ? (
                        <img
                          src={user.photoURL}
                          alt={user.displayName || "User"}
                          className="w-7 h-7 rounded-full object-cover shrink-0 border border-white/30"
                          style={{ width: '28px', height: '28px', minWidth: '28px', minHeight: '28px' }}
                        />
                      ) : (
                        <div
                          className="w-7 h-7 rounded-full bg-gradient-to-tr from-purple-600 to-blue-500 text-white font-bold text-[10px] flex items-center justify-center shrink-0 border border-white/30"
                          style={{ width: '28px', height: '28px', minWidth: '28px', minHeight: '28px' }}
                        >
                          {getUserInitials()}
                        </div>
                      )}
                      <div className="overflow-hidden min-w-0 flex-1">
                        <p className="text-xs font-bold text-white truncate leading-tight">
                          {user.displayName || "Delegate"}
                        </p>
                        <p className="text-[11px] text-white/85 truncate font-mono mt-0.5">
                          {user.email}
                        </p>
                      </div>
                    </div>

                    <div className="space-y-0.5">
                      <Link
                        href="/dashboard"
                        onClick={() => setUserMenuOpen(false)}
                        className="flex items-center justify-between px-2.5 py-2 rounded-lg text-xs font-semibold text-white/90 hover:text-white hover:bg-white/[0.09] transition-colors"
                      >
                        <div className="flex items-center gap-2">
                          <LayoutDashboard size={14} className="text-blue-400 shrink-0" />
                          <span>Dashboard</span>
                        </div>
                        <ArrowUpRight size={12} className="text-white/40" />
                      </Link>

                      <button
                        type="button"
                        onClick={handleSignOut}
                        className="w-full flex items-center gap-2 px-2.5 py-2 rounded-lg text-xs font-semibold text-rose-400 hover:text-rose-300 hover:bg-rose-500/15 transition-colors text-left cursor-pointer"
                      >
                        <LogOut size={14} className="shrink-0" />
                        <span>Sign Out</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <MetalButton
                preset="chromatic"
                size="xs"
                strength={0.7}
                onClick={openModal}
                wrapperClassName="shrink-0"
                className="nav-register-btn h-7 sm:h-8 px-2.5 sm:px-4 text-[10px] sm:text-[11px] font-bold tracking-wider uppercase rounded-full"
              >
                REGISTER
              </MetalButton>
            )}

            {/* Mobile Navigation Toggle Button */}
            <button
              type="button"
              onClick={() => setMobileOpen(!mobileOpen)}
              className="lg:hidden flex items-center justify-center w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-white/[0.08] hover:bg-white/[0.16] border border-white/20 text-white active:scale-90 transition-all duration-200 cursor-pointer shadow-sm shrink-0"
              aria-label={mobileOpen ? "Close navigation menu" : "Open navigation menu"}
              aria-expanded={mobileOpen}
            >
              {mobileOpen ? <X size={16} className="text-white" /> : <Menu size={16} className="text-white" />}
            </button>
          </div>
        </div>
      </header>

      {/* Mobile Drawer Backdrop */}
      {mobileOpen && (
        <div
          className="fixed inset-0 z-[10001] bg-black/80 backdrop-blur-md lg:hidden transition-opacity duration-300"
          onClick={() => setMobileOpen(false)}
          aria-hidden="true"
        />
      )}

      {/* Mobile Refined Navigation Drawer — Premium Glassmorphic Cockpit */}
      {mobileOpen && (
        <div
          className="fixed inset-x-3.5 top-[58px] sm:top-[68px] z-[10002] p-4 rounded-2xl flex flex-col gap-2.5 lg:hidden select-none animate-in fade-in slide-in-from-top-3 duration-250 max-h-[calc(100dvh-78px)] overflow-y-auto"
          style={{
            background: "radial-gradient(ellipse at top right, rgba(16, 22, 58, 0.97) 0%, rgba(5, 7, 22, 0.99) 100%)",
            backdropFilter: "blur(32px) saturate(200%)",
            WebkitBackdropFilter: "blur(32px) saturate(200%)",
            border: "1px solid rgba(99, 102, 241, 0.28)",
            boxShadow: "0 25px 60px rgba(0,0,0,0.95), 0 0 35px rgba(56,189,248,0.18), inset 0 1px 1px rgba(255,255,255,0.2)",
          }}
          role="dialog"
          aria-label="Mobile Navigation"
        >
          {/* Drawer Header Badge */}
          {user ? (
            <div className="flex items-center justify-between p-3 rounded-xl bg-gradient-to-r from-blue-950/40 via-indigo-950/30 to-purple-950/40 border border-blue-400/20">
              <div className="flex items-center gap-2.5 min-w-0">
                {user.photoURL ? (
                  <img
                    src={user.photoURL}
                    alt={user.displayName || "User"}
                    className="w-9 h-9 rounded-full object-cover shrink-0 border border-blue-400/50 shadow-sm"
                    style={{ width: '36px', height: '36px', minWidth: '36px', minHeight: '36px' }}
                  />
                ) : (
                  <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-purple-600 via-indigo-600 to-blue-500 text-white font-bold text-xs flex items-center justify-center border border-white/30 shrink-0">
                    {getUserInitials()}
                  </div>
                )}
                <div className="overflow-hidden min-w-0">
                  <div className="flex items-center gap-1.5">
                    <span className="text-xs font-bold text-white truncate">{user.displayName || "Delegate"}</span>
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 shrink-0 animate-pulse"></span>
                  </div>
                  <p className="text-[11px] text-white/55 truncate font-mono">{user.email}</p>
                </div>
              </div>

              <Link
                href="/dashboard"
                onClick={() => setMobileOpen(false)}
                className="shrink-0 flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-[11px] font-bold text-blue-300 bg-blue-500/15 border border-blue-400/30 hover:bg-blue-500/25 transition-colors"
              >
                <span>Portal</span>
                <ArrowUpRight size={12} />
              </Link>
            </div>
          ) : (
            <div className="p-3 rounded-xl bg-white/[0.03] border border-white/[0.08] flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-400 shrink-0 shadow-[0_0_8px_#34d399] animate-pulse"></span>
                <div>
                  <div className="text-[11px] font-bold font-mono tracking-wider text-emerald-300 uppercase">
                    REGISTRATIONS OPEN
                  </div>
                  <div className="text-[10px] text-white/50 tracking-wide">
                    Resolve MUN 2.0 • Hyderabad
                  </div>
                </div>
              </div>
              <span className="text-[9px] font-mono px-2 py-0.5 rounded bg-white/[0.06] border border-white/10 text-white/60 font-semibold">
                2026
              </span>
            </div>
          )}

          {/* Navigation Links Grid / Stack */}
          <div className="flex flex-col gap-1 my-1">
            {user && (
              <Link
                href="/dashboard"
                onClick={() => setMobileOpen(false)}
                className="group flex items-center justify-between min-h-[44px] px-3.5 rounded-xl text-sm font-bold text-blue-200 bg-blue-500/15 border border-blue-400/25 hover:bg-blue-500/25 transition-all mb-1"
              >
                <div className="flex items-center gap-3">
                  <div className="w-7 h-7 rounded-lg bg-blue-500/20 border border-blue-400/40 flex items-center justify-center text-blue-300">
                    <LayoutDashboard size={14} />
                  </div>
                  <span className="tracking-wide">Delegate Dashboard</span>
                </div>
                <ArrowUpRight size={14} className="text-blue-400" />
              </Link>
            )}

            {navLinks.map((l) => {
              const Icon = l.icon;
              return (
                <a
                  key={l.label}
                  href={l.href}
                  onClick={() => setMobileOpen(false)}
                  className="group flex items-center justify-between min-h-[44px] px-3.5 rounded-xl text-sm font-medium text-white/80 hover:text-white hover:bg-white/[0.06] active:bg-blue-500/15 transition-all duration-150"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-7 h-7 rounded-lg bg-white/[0.05] border border-white/10 flex items-center justify-center text-blue-400 group-hover:text-blue-300 group-hover:border-blue-400/30 transition-colors">
                      <Icon size={14} />
                    </div>
                    <span className="font-semibold tracking-wide text-[13px]">{l.label}</span>
                  </div>
                  {l.note ? (
                    <span className="text-[9px] font-mono font-bold tracking-wider uppercase px-2 py-0.5 rounded-full bg-blue-500/15 text-blue-300 border border-blue-400/25">
                      {l.note}
                    </span>
                  ) : (
                    <ArrowUpRight size={14} className="text-white/25 group-hover:text-white/60 transition-colors" />
                  )}
                </a>
              );
            })}

            {/* Delegate Brochure Link (Disabled Preview) */}
            <div
              className="flex items-center justify-between min-h-[44px] px-3.5 rounded-xl text-sm font-medium text-white/35 cursor-not-allowed bg-white/[0.02]"
              title="Delegate Brochure Releasing Soon"
            >
              <div className="flex items-center gap-3">
                <div className="w-7 h-7 rounded-lg bg-white/[0.03] border border-white/5 flex items-center justify-center text-white/30">
                  <FileDown size={14} />
                </div>
                <span className="tracking-wide text-[13px]">Delegate Brochure</span>
              </div>
              <span className="text-[9px] font-mono font-bold tracking-wider uppercase px-2 py-0.5 rounded-full bg-white/[0.05] text-white/40 border border-white/10">
                Soon
              </span>
            </div>
          </div>

          {/* Drawer Actions CTA */}
          <div className="pt-2 border-t border-white/[0.08] flex flex-col gap-2">
            {user ? (
              <button
                type="button"
                onClick={handleSignOut}
                className="w-full flex items-center justify-center gap-2 min-h-[42px] rounded-xl text-xs font-bold text-rose-400 bg-rose-500/10 border border-rose-500/20 hover:bg-rose-500/20 active:scale-98 transition-all cursor-pointer"
              >
                <LogOut size={14} />
                <span>SIGN OUT</span>
              </button>
            ) : (
              <MetalButton
                preset="chromatic"
                size="md"
                strength={1}
                onClick={openModal}
                wrapperClassName="w-full"
                className="w-full justify-center tracking-wider uppercase font-bold min-h-[46px] rounded-xl text-xs"
              >
                REGISTER FOR RESOLVE 2.0 &rarr;
              </MetalButton>
            )}

            {/* Secretariat Support Quick Note */}
            <div className="flex items-center justify-center gap-2 text-[10px] text-white/45 font-mono pt-1">
              <Headphones size={11} className="text-blue-400/70" />
              <span>Questions? Call <a href="tel:+919212107797" className="text-blue-300/80 hover:underline">+91 92121 07797</a></span>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export default Navbar;

