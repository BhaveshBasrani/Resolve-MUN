"use client";

import React, { useState, useEffect, useRef } from "react";
import { MetalButton } from "@/components/ui/metal-button";
import { Menu, X, ArrowUpRight, LayoutDashboard, LogOut, User as UserIcon, ChevronDown, Shield } from "lucide-react";
import { auth, signOut, onAuthStateChanged } from "@/lib/firebase";
import Link from "next/link";

export function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [user, setUser] = useState(null);
  const scrollTicking = useRef(false);
  const userMenuRef = useRef(null);

  useEffect(() => {
    // Listen to Firebase auth changes
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
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
      await signOut(auth);
      setUserMenuOpen(false);
      if (typeof window !== "undefined" && window.showAlert) {
        window.showAlert("Signed out successfully", "info");
      }
    } catch (err) {
      console.error("Sign out error:", err);
    }
  };

  const getUserInitials = () => {
    if (!user) return "U";
    if (user.displayName) {
      const parts = user.displayName.trim().split(" ");
      return parts.length >= 2
        ? (parts[0][0] + parts[1][0]).toUpperCase()
        : parts[0].slice(0, 2).toUpperCase();
    }
    if (user.email) return user.email.slice(0, 2).toUpperCase();
    return "U";
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
      <header className="fixed top-0 left-0 right-0 z-[1000] flex justify-center pointer-events-none">
        <div
          style={{
            willChange: "transform, max-width, padding, border-radius, background-color, box-shadow",
            transform: "translate3d(0, 0, 0)",
          }}
          className={[
            "pointer-events-auto flex items-center justify-between gap-3 sm:gap-4 select-none",
            "transition-[max-width,width,padding,margin,border-radius,background-color,border-color,box-shadow] duration-500 ease-[cubic-bezier(0.22,1,0.36,1)]",
            scrolled
              ? "mt-2 md:mt-3 py-1.5 px-4 sm:px-6 lg:px-8 rounded-full border border-white/[0.14] bg-[#060818]/85 backdrop-blur-xl shadow-[0_16px_40px_rgba(0,0,0,0.7),0_0_24px_rgba(59,130,246,0.18)] w-[95%] md:w-[90%] lg:w-[88%] max-w-5xl"
              : "mt-0 py-2.5 px-4 md:py-3.5 md:px-8 rounded-none border-b border-white/[0.06] bg-[#050714]/65 backdrop-blur-xl w-full max-w-full shadow-none",
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
                alt="Resolve MUN"
                className="w-7 h-7 md:w-8 md:h-8 object-contain block transition-transform duration-300 group-hover:scale-105"
              />
              <div className="absolute inset-0 rounded-full bg-blue-500/25 blur-md opacity-0 group-hover:opacity-100 transition-opacity -z-10" />
            </div>
            <span
              className="text-[1.25rem] md:text-[1.38rem] tracking-[0.12em] leading-none text-white group-hover:text-blue-300 transition-colors duration-200"
              style={{ fontFamily: "'Bebas Neue', sans-serif" }}
            >
              RESOLVE MUN 2.0
            </span>
          </Link>

          {/* Desktop Nav Pills */}
          <nav className="hidden lg:flex items-center gap-0.5 bg-white/[0.04] border border-white/[0.1] rounded-full px-2 py-1 backdrop-blur-xl shadow-[inset_0_1px_1px_rgba(255,255,255,0.15)]">
            {navLinks.map((l) => (
              <a key={l.label} href={l.href} className="nav-pill-link">
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
              className="nav-pill-link inline-flex items-center gap-1.5 opacity-60 cursor-not-allowed select-none pointer-events-auto"
            >
              <span>Brochure</span>
              <span className="text-[9px] font-bold tracking-wider uppercase px-1.5 py-0.5 rounded-full bg-blue-500/20 text-blue-300 border border-blue-400/30 inline-block leading-none">
                Soon
              </span>
            </button>
          </nav>

          {/* Right Action: PFP AVATAR (WHEN LOGGED IN) OR REGISTER BUTTON (WHEN LOGGED OUT) */}
          <div className="flex items-center gap-2.5 shrink-0" ref={userMenuRef}>
            {user ? (
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setUserMenuOpen(!userMenuOpen)}
                  className="h-9 max-h-9 px-1.5 pr-2.5 rounded-full bg-white/[0.06] hover:bg-white/[0.12] border border-white/15 flex items-center gap-2 transition-all duration-200 cursor-pointer active:scale-95"
                  style={{ height: '36px', maxHeight: '36px' }}
                  aria-label="User menu"
                  aria-expanded={userMenuOpen}
                >
                  {user.photoURL ? (
                    <img
                      src={user.photoURL}
                      alt={user.displayName || "User"}
                      className="w-6.5 h-6.5 rounded-full object-cover shrink-0 border border-blue-400/50"
                      style={{ width: '26px', height: '26px', minWidth: '26px', minHeight: '26px' }}
                    />
                  ) : (
                    <div
                      className="rounded-full bg-gradient-to-tr from-purple-600 via-indigo-600 to-blue-500 text-white font-bold text-[11px] flex items-center justify-center border border-white/30 shrink-0"
                      style={{ width: '26px', height: '26px', minWidth: '26px', minHeight: '26px' }}
                    >
                      {getUserInitials()}
                    </div>
                  )}
                  <span className="text-xs font-semibold text-white/90 max-w-[80px] truncate hidden sm:inline-block">
                    {user.displayName ? user.displayName.split(" ")[0] : "Delegate"}
                  </span>
                  <ChevronDown className="w-3 h-3 text-white/50 hidden sm:inline-block shrink-0" />
                </button>

                {/* User Dropdown Menu */}
                {userMenuOpen && (
                  <div
                    className="absolute right-0 mt-2.5 w-64 p-3 rounded-2xl border border-white/15 bg-[#080b20]/95 backdrop-blur-2xl shadow-[0_20px_50px_rgba(0,0,0,0.8),0_0_30px_rgba(59,130,246,0.2)] animate-in fade-in zoom-in-95 duration-200 z-[1001]"
                  >
                    <div className="px-2 py-2 border-b border-white/10 mb-2">
                      <p className="text-xs font-bold text-white truncate">
                        {user.displayName || "Delegate"}
                      </p>
                      <p className="text-[11px] text-white/50 truncate">
                        {user.email}
                      </p>
                    </div>

                    <Link
                      href="/dashboard"
                      onClick={() => setUserMenuOpen(false)}
                      className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold text-white/90 hover:text-white hover:bg-white/[0.08] transition-colors"
                    >
                      <LayoutDashboard className="w-4 h-4 text-blue-400" />
                      <span>Delegate Dashboard</span>
                    </Link>

                    

                    <button
                      type="button"
                      onClick={handleSignOut}
                      className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold text-red-400 hover:text-red-300 hover:bg-red-500/10 transition-colors text-left mt-1 cursor-pointer"
                    >
                      <LogOut className="w-4 h-4" />
                      <span>Sign Out</span>
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <MetalButton
                preset="chromatic"
                size="xs"
                strength={0.6}
                onClick={openModal}
                wrapperClassName="shrink-0"
                className="nav-register-btn h-7.5 px-3.5 text-[11px] font-bold tracking-wider"
              >
                REGISTER
              </MetalButton>
            )}

            {/* Mobile Navigation Toggle */}
            <button
              type="button"
              onClick={() => setMobileOpen(!mobileOpen)}
              className="lg:hidden flex items-center justify-center min-w-[44px] min-h-[44px] rounded-full bg-white/[0.08] border border-white/20 text-white hover:bg-white/15 active:scale-95 transition-all duration-200 cursor-pointer"
              aria-label={mobileOpen ? "Close navigation menu" : "Open navigation menu"}
              aria-expanded={mobileOpen}
            >
              {mobileOpen ? <X className="w-5 h-5 text-white" /> : <Menu className="w-5 h-5 text-white" />}
            </button>
          </div>
        </div>
      </header>

      {/* Mobile Drawer Backdrop */}
      {mobileOpen && (
        <div
          className="fixed inset-0 z-[998] bg-black/60 backdrop-blur-sm lg:hidden transition-opacity duration-300"
          onClick={() => setMobileOpen(false)}
          aria-hidden="true"
        />
      )}

      {/* Mobile Refined Navigation Drawer */}
      {mobileOpen && (
        <div
          className="fixed inset-x-3 top-[68px] z-[999] p-5 rounded-[24px] flex flex-col gap-1 lg:hidden select-none animate-in fade-in slide-in-from-top-4 duration-300"
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
            <div className="flex items-center gap-3 p-3 rounded-2xl bg-white/[0.05] border border-white/10 mb-2">
              {user.photoURL ? (
                <img
                  src={user.photoURL}
                  alt={user.displayName || "User"}
                  className="w-10 h-10 rounded-full object-cover shrink-0 border border-blue-400/50"
                  style={{ width: '40px', height: '40px', minWidth: '40px', minHeight: '40px' }}
                />
              ) : (
                <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-purple-600 via-indigo-600 to-blue-500 text-white font-bold text-sm flex items-center justify-center border border-white/30">
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
                className="flex items-center gap-3 min-h-[48px] px-4 rounded-xl text-[1rem] font-bold text-blue-300 bg-blue-500/10 border border-blue-400/20"
              >
                <LayoutDashboard className="w-5 h-5 text-blue-400" />
                <span>Go to Dashboard</span>
              </Link>
            )}

            {navLinks.map((l) => (
              <a
                key={l.label}
                href={l.href}
                className="flex items-center min-h-[48px] px-4 rounded-xl text-[1rem] font-semibold text-white/85 hover:text-white hover:bg-white/[0.06] active:bg-white/10 transition-colors"
                onClick={() => setMobileOpen(false)}
              >
                {l.label}
              </a>
            ))}

            {/* Disabled Brochure in Mobile Drawer */}
            <button
              type="button"
              disabled
              className="flex items-center justify-between min-h-[48px] px-4 rounded-xl text-[1rem] font-semibold text-white/40 cursor-not-allowed w-full text-left"
            >
              <span className="flex items-center gap-2">
                <span>Delegate Brochure</span>
                <span className="text-[10px] font-bold tracking-wider uppercase px-2 py-0.5 rounded-full bg-blue-500/20 text-blue-300 border border-blue-400/30">
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
                className="w-full flex items-center justify-center gap-2 min-h-[48px] rounded-xl text-sm font-bold text-red-400 bg-red-500/10 border border-red-500/20 cursor-pointer"
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
