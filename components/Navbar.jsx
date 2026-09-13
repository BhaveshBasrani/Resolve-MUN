"use client";

import React, { useState, useEffect, useRef } from "react";
import { MetalButton } from "@/components/ui/metal-button";
import { Menu, X, ArrowUpRight, LayoutDashboard, LogOut, User as UserIcon, ChevronDown, Shield } from "lucide-react";
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
    { href: "/#about", label: "About" },
    { href: "/#letter", label: "Letter" },
    { href: "/#committees", label: "Committees" },
    { href: "/#venue", label: "Venue" },
    { href: "/#secretariat", label: "Secretariat" },
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
            "pointer-events-auto flex items-center justify-between gap-3 sm:gap-4 select-none",
            "transition-all duration-300 ease-out",
            "mt-2.5 sm:mt-3 md:mt-4 py-2 px-4 sm:px-6 lg:px-7 rounded-xl border backdrop-blur-2xl w-[94%] sm:w-[92%] lg:w-[88%] max-w-5xl",
            scrolled
              ? "bg-[#050614]/98 border-white/25 shadow-[0_20px_50px_rgba(0,0,0,0.95),0_0_30px_rgba(59,130,246,0.25)]"
              : "bg-[#060818]/92 border-white/[0.15] shadow-[0_16px_40px_rgba(0,0,0,0.85),0_0_24px_rgba(59,130,246,0.18)]",
          ].join(" ")}
        >
          {/* Logo & Brand */}
          <Link
            href="/#hero"
            className="flex items-center gap-2.5 md:gap-3 shrink-0 group"
            style={{ textDecoration: "none" }}
          >
            <div className="relative shrink-0 flex items-center justify-center">
              <img
                src="/images/Logo.svg"
                onError={(e) => {
                  e.currentTarget.src = "https://resolvemun.in/images/Logo.svg";
                }}
                alt="Resolve MUN"
                className="w-7 h-7 md:w-8 md:h-8 object-contain block transition-transform duration-300 group-hover:scale-105"
              />
              <div className="absolute inset-0 rounded-lg bg-blue-500/25 blur-md opacity-0 group-hover:opacity-100 transition-opacity -z-10" />
            </div>
            <span
              className="text-[1.25rem] md:text-[1.38rem] tracking-[0.12em] leading-none text-white group-hover:text-blue-300 transition-colors duration-200"
              style={{ fontFamily: "'Bebas Neue', sans-serif" }}
            >
              RESOLVE MUN 2.0
            </span>
          </Link>

          {/* Desktop Nav Pills */}
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

          {/* Right Action: PFP AVATAR (WHEN LOGGED IN) OR REGISTER BUTTON (WHEN LOGGED OUT) */}
          <div className="flex items-center gap-2.5 shrink-0" ref={userMenuRef}>
            {user ? (
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setUserMenuOpen(!userMenuOpen)}
                  className="h-9 pl-1.5 pr-3 rounded-full bg-white/[0.08] hover:bg-white/[0.14] border border-white/20 flex items-center gap-2 transition-all duration-150 cursor-pointer active:scale-95 shadow-sm overflow-hidden"
                  aria-label="User menu"
                  aria-expanded={userMenuOpen}
                >
                  {user.photoURL ? (
                    <img
                      src={user.photoURL}
                      alt={user.displayName || "User"}
                      className="w-6 h-6 min-w-[24px] min-h-[24px] rounded-full object-cover shrink-0 border border-white/30"
                    />
                  ) : (
                    <div
                      className="w-6 h-6 min-w-[24px] min-h-[24px] rounded-full bg-gradient-to-tr from-purple-600 via-indigo-600 to-blue-500 text-white font-bold text-[11px] flex items-center justify-center border border-white/30 shrink-0 select-none overflow-hidden"
                    >
                      {getUserInitials()}
                    </div>
                  )}
                  <span className="text-xs font-semibold text-white/95 max-w-[85px] truncate leading-none">
                    {user.displayName ? user.displayName.trim().split(/\s+/)[0] : "Delegate"}
                  </span>
                  <ChevronDown className="w-3 h-3 text-white/60 shrink-0" />
                </button>

                {/* User Dropdown Menu - Spaced, Solid High-Contrast & Sleek */}
                {userMenuOpen && (
                  <div
                    className="absolute right-0 mt-4 sm:mt-5 w-60 p-2 rounded-2xl border border-white/20 bg-[#0c0d18] shadow-[0_20px_50px_rgba(0,0,0,0.95),0_0_30px_rgba(0,0,0,0.9)] animate-in fade-in zoom-in-95 duration-100 z-[100000] select-none"
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
                          <LayoutDashboard className="w-3.5 h-3.5 text-blue-400 shrink-0" />
                          <span>Dashboard</span>
                        </div>
                        <ArrowUpRight className="w-3 h-3 text-white/40" />
                      </Link>

                      <button
                        type="button"
                        onClick={handleSignOut}
                        className="w-full flex items-center gap-2 px-2.5 py-2 rounded-lg text-xs font-semibold text-rose-400 hover:text-rose-300 hover:bg-rose-500/15 transition-colors text-left cursor-pointer"
                      >
                        <LogOut className="w-3.5 h-3.5 shrink-0" />
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
                className="nav-register-btn h-8 px-4 text-[11px] font-bold tracking-wider uppercase"
              >
                REGISTER
              </MetalButton>
            )}

            {/* Mobile Navigation Toggle */}
            <button
              type="button"
              onClick={() => setMobileOpen(!mobileOpen)}
              className="lg:hidden flex items-center justify-center min-w-[36px] min-h-[36px] w-9 h-9 rounded-lg bg-white/[0.08] hover:bg-white/[0.15] border border-white/20 text-white active:scale-95 transition-all duration-200 cursor-pointer shadow-sm shrink-0"
              aria-label={mobileOpen ? "Close navigation menu" : "Open navigation menu"}
              aria-expanded={mobileOpen}
            >
              {mobileOpen ? <X className="w-4.5 h-4.5 text-white" /> : <Menu className="w-4.5 h-4.5 text-white" />}
            </button>
          </div>
        </div>
      </header>

      {/* Mobile Drawer Backdrop */}
      {mobileOpen && (
        <div
          className="fixed inset-0 z-[10001] bg-black/70 backdrop-blur-md lg:hidden transition-opacity duration-300"
          onClick={() => setMobileOpen(false)}
          aria-hidden="true"
        />
      )}

      {/* Mobile Refined Navigation Drawer */}
      {mobileOpen && (
        <div
          className="fixed inset-x-3 top-[68px] z-[10002] p-4 rounded-xl flex flex-col gap-1 lg:hidden select-none animate-in fade-in slide-in-from-top-4 duration-300"
          style={{
            background: "rgba(6, 9, 26, 0.96)",
            backdropFilter: "blur(32px) saturate(190%)",
            WebkitBackdropFilter: "blur(32px) saturate(190%)",
            border: "1px solid rgba(255,255,255,0.14)",
            boxShadow: "0 24px 60px rgba(0,0,0,0.9), 0 0 30px rgba(59,130,246,0.2), inset 0 1px 1px rgba(255,255,255,0.2)",
          }}
          role="dialog"
          aria-label="Mobile Navigation"
        >
          {user && (
            <div className="flex items-center gap-3 p-2.5 rounded-lg bg-white/[0.05] border border-white/10 mb-2">
              {user.photoURL ? (
                <img
                  src={user.photoURL}
                  alt={user.displayName || "User"}
                  className="w-9 h-9 rounded-full object-cover shrink-0 border border-blue-400/50"
                  style={{ width: '36px', height: '36px', minWidth: '36px', minHeight: '36px' }}
                />
              ) : (
                <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-purple-600 via-indigo-600 to-blue-500 text-white font-bold text-xs flex items-center justify-center border border-white/30">
                  {getUserInitials()}
                </div>
              )}
              <div className="overflow-hidden">
                <p className="text-sm font-bold text-white truncate">
                  {user.displayName || "Delegate"}
                </p>
                <p className="text-xs text-white/50 truncate">{user.email}</p>
              </div>
            </div>
          )}

          <div className="flex flex-col gap-1">
            {user && (
              <Link
                href="/dashboard"
                onClick={() => setMobileOpen(false)}
                className="flex items-center gap-2.5 min-h-[44px] px-3.5 rounded-lg text-sm font-bold text-blue-300 bg-blue-500/10 border border-blue-400/20"
              >
                <LayoutDashboard className="w-4 h-4 text-blue-400" />
                <span>Go to Dashboard</span>
              </Link>
            )}

            {navLinks.map((l) => (
              <a
                key={l.label}
                href={l.href}
                className="flex items-center min-h-[44px] px-3.5 rounded-lg text-sm font-semibold text-white/85 hover:text-white hover:bg-white/[0.06] active:bg-white/10 transition-colors"
                onClick={() => setMobileOpen(false)}
              >
                {l.label}
              </a>
            ))}

            {/* Disabled Brochure in Mobile Drawer */}
            <button
              type="button"
              disabled
              className="flex items-center justify-between min-h-[44px] px-3.5 rounded-lg text-sm font-semibold text-white/40 cursor-not-allowed w-full text-left"
            >
              <span className="flex items-center gap-2">
                <span>Delegate Brochure</span>
                <span className="text-[9px] font-bold tracking-wider uppercase px-1.5 py-0.5 rounded bg-blue-500/20 text-blue-300 border border-blue-400/30">
                  Releasing Soon
                </span>
              </span>
              <ArrowUpRight className="w-4 h-4 opacity-30 text-white" />
            </button>
          </div>

          <div className="pt-3 mt-1 border-t border-white/[0.08]">
            {user ? (
              <button
                type="button"
                onClick={handleSignOut}
                className="w-full flex items-center justify-center gap-2 min-h-[44px] rounded-lg text-sm font-bold text-red-400 bg-red-500/10 border border-red-500/20 cursor-pointer"
              >
                <LogOut className="w-4 h-4" />
                <span>SIGN OUT</span>
              </button>
            ) : (
              <MetalButton
                preset="chromatic"
                size="md"
                strength={1}
                onClick={openModal}
                wrapperClassName="w-full"
                className="w-full justify-center tracking-wider uppercase font-bold min-h-[48px]"
              >
                REGISTER FOR RESOLVE 2.0
              </MetalButton>
            )}
          </div>
        </div>
      )}
    </>
  );
}

export default Navbar;
