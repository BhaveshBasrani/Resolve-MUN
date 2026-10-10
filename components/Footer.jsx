"use client";

import React from "react";
import Link from "next/link";

export default function Footer() {
  const scrollToTop = () => {
    if (typeof window !== "undefined") {
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  const handleOpenSelection = (e) => {
    if (e && e.preventDefault) e.preventDefault();
    if (typeof window !== "undefined") {
      if (typeof window.openSelection === "function") return window.openSelection();
      if (typeof window.openSelectionModal === "function") return window.openSelectionModal();
      if (typeof window.openAuthModal === "function") return window.openAuthModal();
      const m = document.getElementById("selectionModal");
      if (m) {
        m.classList.add("active");
        document.body.style.overflow = "hidden";
      }
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

  const handleOpenTermsModal = (e) => {
    if (e && e.preventDefault) e.preventDefault();
    if (typeof window !== "undefined" && typeof window.openTermsModal === "function") {
      window.openTermsModal();
    }
  };

  return (
    <footer className="w-full bg-[#07080C] text-[#F3F4F6] border-t border-[#1C1D24] font-sans relative overflow-hidden select-none">
      {/* Main Content Container */}
      <div className="max-w-[1360px] mx-auto px-6 sm:px-8 lg:px-12 pt-14 sm:pt-16 pb-10 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-8 lg:gap-8">
          
          {/* Left Column: Brand, Editorial Copy, Venue Card & Socials */}
          <div className="lg:col-span-5 space-y-4">
            {/* Logo and Brand Title */}
            <Link href="/#hero" className="inline-flex items-center gap-2.5 group">
              <img
                src="/images/Logo.svg"
                alt="Resolve MUN 2.0"
                className="w-8 h-8 object-contain block transition-transform group-hover:scale-105"
              />
              <span
                className="text-2xl tracking-[0.06em] text-white leading-none block"
                style={{ fontFamily: "'Bebas Neue', sans-serif" }}
              >
                RESOLVE MUN 2.0
              </span>
            </Link>

            {/* Conference Editorial Overview */}
            <p className="text-[13px] text-[#9CA3AF] leading-relaxed max-w-[400px]">
              Hyderabad’s premier diplomatic simulation, convening 350+ delegates across six specialized councils to debate international policy and crisis response.
            </p>

            {/* Venue Card - Soft-rounded Rectangle */}
            <div className="p-3.5 bg-[#111216] border border-[#22242A] rounded-2xl max-w-[400px] space-y-1.5">
              <div className="flex items-center gap-1.5 text-[10px] font-mono uppercase tracking-wider text-[#9CA3AF] font-medium">
                {/* Heroicons MapPin */}
                <svg fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-3.5 h-3.5 text-[#818CF8]">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1 1 15 0Z" />
                </svg>
                <span>HOST CAMPUS</span>
              </div>
              <p className="text-xs text-white leading-relaxed font-normal">
                Meridian School, Kompally, Hyderabad, Telangana 500014
              </p>
            </div>

            {/* Social Icons Row - Soft-rounded squares */}
            <div className="flex items-center gap-2 pt-1">
              {/* Instagram */}
              <a
                href="https://www.instagram.com/mun.resolve"
                target="_blank"
                rel="noopener noreferrer"
                className="w-8 h-8 rounded-xl bg-[#111216] border border-[#22242A] hover:border-[#383B45] hover:text-white text-[#9CA3AF] flex items-center justify-center transition-colors"
                aria-label="Instagram"
              >
                <svg className="w-3.5 h-3.5 fill-currentColor" viewBox="0 0 24 24">
                  <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
                </svg>
              </a>

              {/* LinkedIn */}
              <a
                href="https://www.linkedin.com"
                target="_blank"
                rel="noopener noreferrer"
                className="w-8 h-8 rounded-xl bg-[#111216] border border-[#22242A] hover:border-[#383B45] hover:text-white text-[#9CA3AF] flex items-center justify-center transition-colors"
                aria-label="LinkedIn"
              >
                <svg className="w-3.5 h-3.5 fill-currentColor" viewBox="0 0 24 24">
                  <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"/>
                </svg>
              </a>

              {/* Email */}
              <a
                href="mailto:resolve.mun@gmail.com"
                className="w-8 h-8 rounded-xl bg-[#111216] border border-[#22242A] hover:border-[#383B45] hover:text-white text-[#9CA3AF] flex items-center justify-center transition-colors"
                aria-label="Email Secretariat"
              >
                <svg fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-3.5 h-3.5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 0 1-2.25 2.25h-15a2.25 2.25 0 0 1-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0 0 19.5 4.5h-15a2.25 2.25 0 0 0-2.25 2.25m19.5 0v.243a2.25 2.25 0 0 1-1.07 1.916l-7.5 4.615a2.25 2.25 0 0 1-2.36 0L3.32 8.91a2.25 2.25 0 0 1-1.07-1.916V6.75" />
                </svg>
              </a>

              {/* WhatsApp */}
              <a
                href="https://wa.me/919212107797?text=Hi%20Resolve%20MUN%20Secretariat"
                target="_blank"
                rel="noopener noreferrer"
                className="w-8 h-8 rounded-xl bg-[#111216] border border-[#22242A] hover:border-[#383B45] hover:text-white text-[#9CA3AF] flex items-center justify-center transition-colors"
                aria-label="WhatsApp Secretariat"
              >
                <svg fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-3.5 h-3.5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M7.5 8.25h9m-9 3H12m-9.75 1.51c0 1.6 1.123 2.994 2.707 3.227 1.129.166 2.27.293 3.423.379.35.026.67.21.865.501L12 21l2.755-4.133a1.14 1.14 0 0 1 .865-.501 48.172 48.172 0 0 0 3.423-.379c1.584-.233 2.707-1.626 2.707-3.228V6.741c0-1.602-1.123-2.995-2.707-3.228A48.394 48.394 0 0 0 12 3c-2.392 0-4.744.175-7.043.513C3.373 3.746 2.25 5.14 2.25 6.741v7.018Z" />
                </svg>
              </a>
            </div>
          </div>

          {/* Center Navigation Columns */}
          <div className="lg:col-span-4 grid grid-cols-2 gap-6 sm:gap-8 pt-0.5">
            {/* Column 1: Conference Navigation */}
            <div className="space-y-3">
              <span className="text-[10.5px] font-mono font-semibold uppercase tracking-[0.2em] text-[#818CF8] block">
                CONFERENCE
              </span>
              <ul className="space-y-2.5 text-[13.5px] font-normal text-[#9CA3AF]">
                <li>
                  <a href="/#about" className="hover:text-white hover:translate-x-0.5 transition-all block py-0.5">
                    About Conference
                  </a>
                </li>
                <li>
                  <a href="/#committees" className="hover:text-white hover:translate-x-0.5 transition-all block py-0.5">
                    Committees
                  </a>
                </li>
                <li>
                  <a href="/#secretariat" className="hover:text-white hover:translate-x-0.5 transition-all block py-0.5">
                    Secretariat
                  </a>
                </li>
                <li>
                  <a href="/#venue" className="hover:text-white hover:translate-x-0.5 transition-all block py-0.5">
                    Venue
                  </a>
                </li>
                <li>
                  <a href="/#letter" className="hover:text-white hover:translate-x-0.5 transition-all block py-0.5">
                    Letter from SG
                  </a>
                </li>
              </ul>
            </div>

            {/* Column 2: Delegate Resources */}
            <div className="space-y-3">
              <span className="text-[10.5px] font-mono font-semibold uppercase tracking-[0.2em] text-[#818CF8] block">
                RESOURCES
              </span>
              <ul className="space-y-2.5 text-[13.5px] font-normal text-[#9CA3AF]">
                <li>
                  <a href="/#hero" className="hover:text-white hover:translate-x-0.5 transition-all block py-0.5">
                    Home Portal
                  </a>
                </li>
                <li>
                  <button
                    type="button"
                    onClick={handleOpenCommitteeIntro}
                    className="hover:text-white hover:translate-x-0.5 transition-all block py-0.5 text-left cursor-pointer"
                  >
                    Background Guides
                  </button>
                </li>
                <li>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.preventDefault();
                      handleOpenCommModal("Delegate Guide", "📖");
                    }}
                    className="hover:text-white hover:translate-x-0.5 transition-all block py-0.5 text-left cursor-pointer"
                  >
                    Delegate Guide
                  </button>
                </li>
                <li>
                  <a
                    href="https://sales.sponsormyevent.com/resolve-model-united-nations-hyderabad"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="hover:text-white hover:translate-x-0.5 transition-all block py-0.5"
                  >
                    Sponsorship
                  </a>
                </li>
                <li>
                  <button
                    type="button"
                    onClick={handleOpenTermsModal}
                    className="hover:text-white hover:translate-x-0.5 transition-all block py-0.5 text-left cursor-pointer"
                  >
                    Terms &amp; Policies
                  </button>
                </li>
              </ul>
            </div>
          </div>

          {/* Right Column: Contact Channels & Intake Card */}
          <div className="lg:col-span-3 space-y-2">
            {/* WhatsApp Direct Channel */}
            <a
              href="https://wa.me/919212107797?text=Hi%20Resolve%20MUN%20Secretariat%2C%20I%20have%20a%20query%20regarding%20registration"
              target="_blank"
              rel="noopener noreferrer"
              className="p-2.5 bg-[#111216] border border-[#22242A] rounded-xl flex items-center justify-between hover:border-[#383B45] transition-colors group"
            >
              <div className="flex items-center gap-2">
                <svg fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-3.5 h-3.5 text-[#10B981] shrink-0">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M7.5 8.25h9m-9 3H12m-9.75 1.51c0 1.6 1.123 2.994 2.707 3.227 1.129.166 2.27.293 3.423.379.35.026.67.21.865.501L12 21l2.755-4.133a1.14 1.14 0 0 1 .865-.501 48.172 48.172 0 0 0 3.423-.379c1.584-.233 2.707-1.626 2.707-3.228V6.741c0-1.602-1.123-2.995-2.707-3.228A48.394 48.394 0 0 0 12 3c-2.392 0-4.744.175-7.043.513C3.373 3.746 2.25 5.14 2.25 6.741v7.018Z" />
                </svg>
                <div>
                  <span className="text-[9px] font-mono text-[#6B7280] block uppercase tracking-wider">WHATSAPP</span>
                  <span className="text-xs font-medium text-white block">+91 92121 07797</span>
                </div>
              </div>
              <svg fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-3 h-3 text-[#6B7280] group-hover:text-white transition-colors shrink-0">
                <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 6H5.25A2.25 2.25 0 0 0 3 8.25v10.5A2.25 2.25 0 0 0 5.25 21h10.5A2.25 2.25 0 0 0 18 18.75V10.5m-10.5 6L21 3m0 0h-5.25M21 3v5.25" />
              </svg>
            </a>

            {/* Email Channel */}
            <a
              href="mailto:resolve.mun@gmail.com"
              className="p-2.5 bg-[#111216] border border-[#22242A] rounded-xl flex items-center justify-between hover:border-[#383B45] transition-colors group"
            >
              <div className="flex items-center gap-2">
                <svg fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-3.5 h-3.5 text-[#818CF8] shrink-0">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 0 1-2.25 2.25h-15a2.25 2.25 0 0 1-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0 0 19.5 4.5h-15a2.25 2.25 0 0 0-2.25 2.25m19.5 0v.243a2.25 2.25 0 0 1-1.07 1.916l-7.5 4.615a2.25 2.25 0 0 1-2.36 0L3.32 8.91a2.25 2.25 0 0 1-1.07-1.916V6.75" />
                </svg>
                <div>
                  <span className="text-[9px] font-mono text-[#6B7280] block uppercase tracking-wider">EMAIL</span>
                  <span className="text-xs font-medium text-white block">resolve.mun@gmail.com</span>
                </div>
              </div>
              <svg fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-3 h-3 text-[#6B7280] group-hover:text-white transition-colors shrink-0">
                <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 6H5.25A2.25 2.25 0 0 0 3 8.25v10.5A2.25 2.25 0 0 0 5.25 21h10.5A2.25 2.25 0 0 0 18 18.75V10.5m-10.5 6L21 3m0 0h-5.25M21 3v5.25" />
              </svg>
            </a>

            {/* Registration Intake Card - Soft rounded */}
            <div className="p-3.5 bg-[#111216] border border-[#22242A] rounded-2xl space-y-2">
              <span className="text-[10px] font-mono font-bold tracking-wider text-white uppercase block">
                APPLICANT INTAKE
              </span>
              <p className="text-[11px] text-[#9CA3AF] leading-relaxed">
                Council allocations are actively processing for the November session.
              </p>
              <button
                type="button"
                onClick={handleOpenSelection}
                className="w-full py-2 px-3 rounded-xl bg-[#5845EE] hover:bg-[#4B39E0] text-white text-xs font-mono font-bold tracking-wider uppercase flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
              >
                <span>REGISTER NOW</span>
                <svg fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-3.5 h-3.5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5 21 12m0 0-7.5 7.5M21 12H3" />
                </svg>
              </button>
            </div>
          </div>

        </div>

        {/* Bottom Metadata Bar */}
        <div className="mt-10 pt-5 border-t border-[#1C1D24] flex flex-col sm:flex-row items-center justify-between gap-3 text-xs font-mono text-[#6B7280] text-center sm:text-left">
          <div>
            &copy; 2026 RESOLVE MUN&reg;. ALL RIGHTS RESERVED.
          </div>

          <div className="flex items-center gap-2">
            <span className="px-3 py-1 bg-[#111216] border border-[#22242A] rounded-full text-[11px] text-[#9CA3AF]">
              27TH &mdash; 29TH NOVEMBER 2026
            </span>

            <button
              type="button"
              onClick={scrollToTop}
              className="inline-flex items-center gap-1.5 px-3 py-1 bg-[#111216] border border-[#22242A] hover:border-[#383B45] rounded-full text-[11px] text-white transition-colors cursor-pointer"
              aria-label="Back to top"
            >
              <svg fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-3 h-3 text-[#818CF8]">
                <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 10.5 12 3m0 0 7.5 7.5M12 3v18" />
              </svg>
              <span>TOP</span>
            </button>
          </div>
        </div>

      </div>

      {/* Signature Massive Watermark (Refined Scale & Proportion) */}
      <div className="w-full overflow-hidden flex justify-center items-end px-6 pb-0 pointer-events-none select-none">
        <svg
          viewBox="0 0 1600 110"
          className="w-full max-w-[1360px] h-auto select-none"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <text
            x="50%"
            y="90"
            textAnchor="middle"
            fill="#101117"
            style={{
              fontFamily: "'Syne', 'Plus Jakarta Sans', system-ui, sans-serif",
              fontWeight: 800,
              fontSize: "86px",
              letterSpacing: "-0.01em",
            }}
          >
            RESOLVE MUN
          </text>
        </svg>
      </div>

      {/* SEO Hidden Geographic Signals */}
      <div style={{ display: "none" }}>
        <p>Upcoming Model United Nations (MUN) in Hyderabad November 2026. Top MUN conferences in Telangana including Resolve MUN at Meridian School, Kompally.</p>
        <p>Best school and college MUN in Hyderabad. International relations and diplomacy events in Hyderabad.</p>
      </div>
    </footer>
  );
}
