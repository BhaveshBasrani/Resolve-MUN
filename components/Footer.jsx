"use client";

import React from "react";
import Link from "next/link";

export default function Footer() {
  const scrollToCountdown = () => {
    const target = document.getElementById("countdown");
    if (target) {
      const navEl = document.getElementById("navbar") || document.querySelector("header");
      const navHeight = navEl ? navEl.offsetHeight : 70;
      const targetPosition = target.getBoundingClientRect().top + window.pageYOffset - navHeight;
      window.scrollTo({ top: targetPosition, behavior: "smooth" });
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
    <footer>
      <div className="footer-top">
        <div className="footer-brand">
          <Link href="/#hero" className="footer-logo-link">
            <img
              src="https://resolvemun.in/images/Logo.svg"
              alt="Resolve MUN Logo"
              className="footer-logo-img"
            />
            <span className="logo-text">RESOLVE MUN</span>
          </Link>
          <p>
            Resolve. Reform. Reconcile.
            <br />
            <br />
            The premier Model United Nations conference in Hyderabad, committed to building the next generation of leaders through rigorous diplomatic simulation.
          </p>
        </div>
        <div className="footer-col">
          <h5>Conference</h5>
          <ul>
            <li><a href="/#about">About</a></li>
            <li><a href="/#committees">Committees</a></li>
            <li><a href="/#secretariat">Secretariat</a></li>
            <li><a href="/#venue">Venue</a></li>
          </ul>
        </div>
        <div className="footer-col">
          <h5>Delegate</h5>
          <ul>
            <li><a href="/#hero">Home</a></li>
            <li>
              <a href="#" onClick={handleOpenSelection}>
                Register
              </a>
            </li>
            <li>
              <a href="#" onClick={handleOpenCommitteeIntro}>
                Background Guides
              </a>
            </li>
            <li>
              <a href="#" onClick={(e) => { e.preventDefault(); handleOpenCommModal("Delegate Guide", "📖"); }}>
                Delegate Guide
              </a>
            </li>
          </ul>
        </div>
        <div className="footer-col">
          <h5>Connect</h5>
          <ul>
            <li>
              <a href="https://www.instagram.com/mun.resolve" target="_blank" rel="noopener noreferrer">
                Instagram
              </a>
            </li>
            <li>
              <a href="https://www.linkedin.com" target="_blank" rel="noopener noreferrer">
                LinkedIn
              </a>
            </li>
            <li>
              <a href="mailto:resolve.mun@gmail.com">
                Email Us
              </a>
            </li>
            <li>
              <a
                href="https://sales.sponsormyevent.com/resolve-model-united-nations-hyderabad"
                target="_blank"
                rel="noopener noreferrer"
              >
                Sponsorship
              </a>
            </li>
            <li>
              <a href="#" onClick={handleOpenTermsModal}>
                Terms &amp; Conditions
              </a>
            </li>
          </ul>
        </div>
      </div>

      {/* SEO Hidden Geographic Signals */}
      <div style={{ display: "none" }}>
        <p>Upcoming Model United Nations (MUN) in Hyderabad November 2026. Top MUN conferences in Telangana including Resolve MUN at Delhi World Public School, Kompally.</p>
        <p>Best school and college MUN in Hyderabad. International relations and diplomacy events in Hyderabad.</p>
      </div>

      <div className="footer-bottom">
        <p className="footer-copy">&copy; 2026 Resolve MUN. All rights reserved.</p>

        <div className="footer-date-pill" onClick={scrollToCountdown} style={{ cursor: "pointer" }}>
          <div className="pill-dot"></div>
          <span>20th &mdash; 22nd November 2026</span>
        </div>

        <span className="footer-tagline">RESOLVE &middot; REFORM &middot; RECONCILE</span>
      </div>
    </footer>
  );
}
