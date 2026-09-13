"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { Sun, Moon, Instagram, Mail, ArrowUpRight } from "lucide-react";

export default function Footer() {
  const [theme, setTheme] = useState("dark");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const savedTheme = localStorage.getItem("resolve_theme") || (document.documentElement.classList.contains("theme-light") ? "light" : "dark");
    setTheme(savedTheme);
    if (savedTheme === "light") {
      document.documentElement.classList.add("theme-light");
      document.body.classList.add("theme-light");
    } else {
      document.documentElement.classList.remove("theme-light");
      document.body.classList.remove("theme-light");
    }

    const handleThemeChange = (e) => {
      if (e.detail && e.detail.theme) {
        setTheme(e.detail.theme);
      }
    };
    window.addEventListener("resolve_theme_change", handleThemeChange);
    return () => window.removeEventListener("resolve_theme_change", handleThemeChange);
  }, []);

  const toggleTheme = () => {
    const nextTheme = theme === "dark" ? "light" : "dark";
    setTheme(nextTheme);
    localStorage.setItem("resolve_theme", nextTheme);
    if (nextTheme === "light") {
      document.documentElement.classList.add("theme-light");
      document.body.classList.add("theme-light");
    } else {
      document.documentElement.classList.remove("theme-light");
      document.body.classList.remove("theme-light");
    }
    window.dispatchEvent(new CustomEvent("resolve_theme_change", { detail: { theme: nextTheme } }));
  };

  const scrollToCountdown = () => {
    const target = document.getElementById("countdown");
    if (target) {
      const navEl = document.querySelector("header");
      const navHeight = navEl ? navEl.offsetHeight : 70;
      const targetPosition = target.getBoundingClientRect().top + window.pageYOffset - navHeight;
      window.scrollTo({ top: targetPosition, behavior: "smooth" });
    }
  };

  const openSelection = () => {
    if (typeof window !== "undefined") {
      if (window.openAuthModal) return window.openAuthModal();
      if (window.openSelectionModal) return window.openSelectionModal();
      const m = document.getElementById("selectionModal");
      if (m) {
        m.classList.add("active");
        document.body.style.overflow = "hidden";
      }
    }
  };

  const openTerms = () => {
    if (typeof window !== "undefined" && window.openTermsModal) {
      window.openTermsModal();
    } else {
      const m = document.getElementById("termsModal");
      if (m) {
        m.classList.add("active");
        document.body.style.overflow = "hidden";
      }
    }
  };

  return (
    <footer className="relative z-20 border-t border-white/[0.08] bg-[#04050d] text-white overflow-hidden transition-colors duration-300 footer-theme-container">
      {/* Ambient Top Glow */}
      <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-indigo-500/40 to-transparent pointer-events-none" />

      <div className="max-w-7xl mx-auto px-5 sm:px-8 pt-14 pb-10">
        {/* Main Footer Grid */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-10 pb-12 border-b border-white/[0.08] footer-grid-border">
          {/* Col 1: Brand & Mission */}
          <div className="md:col-span-5 space-y-4">
            <Link href="/" className="inline-flex items-center gap-3 group">
              <div className="w-8 h-8 rounded-xl bg-white/[0.05] border border-white/10 p-1 flex items-center justify-center transition-transform group-hover:scale-105">
                <img
                  src="/images/Logo.svg"
                  alt="Resolve MUN 2.0"
                  className="w-full h-full object-contain filter brightness-110"
                />
              </div>
              <span
                className="text-xl tracking-[0.14em] font-extrabold uppercase text-white group-hover:text-indigo-300 transition-colors"
                style={{ fontFamily: "'Bebas Neue', sans-serif" }}
              >
                RESOLVE MUN 2.0
              </span>
            </Link>

            <p className="text-xs sm:text-sm text-white/60 leading-relaxed max-w-sm footer-subtext">
              Resolve. Reform. Reconcile. <br />
              Hyderabad&apos;s premier diplomatic summit dedicated to cultivating the next generation of global statesmen through rigorous, transformative simulation.
            </p>

            {/* Quick Status Tag */}
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/[0.03] border border-white/10 text-[11px] font-mono text-white/70">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span>EDITION 2.0 · HYDERABAD</span>
            </div>
          </div>

          {/* Col 2: Navigation */}
          <div className="md:col-span-2 space-y-3">
            <h5 className="text-[11px] font-mono font-bold tracking-[0.2em] uppercase text-indigo-300/90 footer-col-title">
              Conference
            </h5>
            <ul className="space-y-2 text-xs text-white/65 footer-links">
              <li><a href="/#about" className="hover:text-white transition-colors">About Summit</a></li>
              <li><a href="/#committees" className="hover:text-white transition-colors">Committees</a></li>
              <li><a href="/#secretariat" className="hover:text-white transition-colors">Secretariat</a></li>
              <li><a href="/#venue" className="hover:text-white transition-colors">Venue &amp; Dates</a></li>
              <li><Link href="/dashboard" className="hover:text-white transition-colors">Delegate Portal</Link></li>
            </ul>
          </div>

          {/* Col 3: Pathways */}
          <div className="md:col-span-2 space-y-3">
            <h5 className="text-[11px] font-mono font-bold tracking-[0.2em] uppercase text-indigo-300/90 footer-col-title">
              Participation
            </h5>
            <ul className="space-y-2 text-xs text-white/65 footer-links">
              <li>
                <button type="button" onClick={openSelection} className="hover:text-white transition-colors text-left cursor-pointer">
                  Delegate Registration
                </button>
              </li>
              <li>
                <button type="button" onClick={openSelection} className="hover:text-white transition-colors text-left cursor-pointer">
                  Delegation Registration
                </button>
              </li>
              <li>
                <button type="button" onClick={openSelection} className="hover:text-white transition-colors text-left cursor-pointer">
                  Secretariat Application
                </button>
              </li>
              <li>
                <button type="button" onClick={openSelection} className="hover:text-white transition-colors text-left cursor-pointer">
                  OC Application
                </button>
              </li>
              <li>
                <button type="button" onClick={openTerms} className="hover:text-white transition-colors text-left cursor-pointer">
                  Terms &amp; Policies
                </button>
              </li>
            </ul>
          </div>

          {/* Col 4: Connect & Theme Toggler */}
          <div className="md:col-span-3 space-y-4">
            <h5 className="text-[11px] font-mono font-bold tracking-[0.2em] uppercase text-indigo-300/90 footer-col-title">
              Connect &amp; Display
            </h5>
            <div className="flex items-center gap-2">
              <a
                href="https://www.instagram.com/mun.resolve/"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Instagram"
                className="w-8 h-8 rounded-xl bg-white/[0.04] hover:bg-white/[0.1] border border-white/10 flex items-center justify-center text-white/70 hover:text-white transition-all cursor-pointer"
              >
                <Instagram className="w-4 h-4" />
              </a>
              <a
                href="mailto:resolve.mun@gmail.com"
                aria-label="Email"
                className="w-8 h-8 rounded-xl bg-white/[0.04] hover:bg-white/[0.1] border border-white/10 flex items-center justify-center text-white/70 hover:text-white transition-all cursor-pointer"
              >
                <Mail className="w-4 h-4" />
              </a>
              <a
                href="https://sales.sponsormyevent.com/resolve-model-united-nations-hyderabad"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Sponsorship"
                className="h-8 px-2.5 rounded-xl bg-white/[0.04] hover:bg-white/[0.1] border border-white/10 flex items-center gap-1 text-[11px] font-mono text-white/70 hover:text-white transition-all cursor-pointer"
              >
                <span>Sponsors</span>
                <ArrowUpRight className="w-3 h-3 opacity-60" />
              </a>
            </div>

            {/* THEME TOGGLER */}
            <div className="pt-2">
              <button
                type="button"
                onClick={toggleTheme}
                className="group flex items-center justify-between gap-3 w-full max-w-[220px] p-2 px-3 rounded-2xl border border-white/15 bg-white/[0.04] hover:bg-white/[0.08] transition-all cursor-pointer shadow-sm active:scale-[0.98] theme-toggle-btn"
                aria-label="Toggle display theme"
              >
                <div className="flex items-center gap-2.5">
                  <div className="w-6 h-6 rounded-lg bg-indigo-500/20 text-indigo-400 flex items-center justify-center border border-indigo-500/30 theme-icon-wrap">
                    {theme === "light" ? <Sun className="w-3.5 h-3.5 text-amber-500" /> : <Moon className="w-3.5 h-3.5 text-indigo-300" />}
                  </div>
                  <div className="text-left">
                    <span className="text-[9px] font-mono uppercase tracking-wider text-white/40 block leading-tight theme-label-sub">
                      THEME
                    </span>
                    <span className="text-xs font-bold text-white uppercase tracking-wide theme-label-main">
                      {theme === "light" ? "Premium White" : "Cosmic Dark"}
                    </span>
                  </div>
                </div>
                <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-md bg-white/[0.08] text-white/70 group-hover:text-white theme-switch-pill">
                  SWITCH
                </span>
              </button>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-white/45 footer-bottom-bar">
          <p>© 2026 Resolve MUN. All rights reserved.</p>

          {/* Reveal Dates Pill */}
          <button
            type="button"
            onClick={scrollToCountdown}
            className="flex items-center gap-2 px-3 py-1 rounded-full bg-white/[0.03] hover:bg-white/[0.08] border border-white/10 text-[11px] font-mono text-indigo-300/80 transition-all cursor-pointer"
          >
            <span className="w-1.5 h-1.5 rounded-full bg-indigo-400 animate-ping inline-block" />
            <span>DATES REVEALING SOON</span>
          </button>

          <span className="font-mono text-[10px] tracking-[0.2em] text-white/30 uppercase">
            RESOLVE · REFORM · RECONCILE
          </span>
        </div>
      </div>
    </footer>
  );
}
