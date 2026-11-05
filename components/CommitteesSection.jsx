"use client";

import React, { useState, useEffect } from "react";
import GlassFolder from "./ui/glass-folder";

const COMMITTEES = [
  {
    id: "disec",
    label: "DISEC",
    meta: "Disarmament & Security · 4 Files",
    tone: "dark",
    art: "aurora",
    seed: 202,
    files: [
      { name: "DISEC Multilateral Framework", meta: "First Committee · Treaties" },
      { name: "Global Security Dossier", meta: "Nuclear & Autonomous Arms", art: "aurora" },
      { name: "Country Allocations (193)", meta: "General Assembly Matrix" },
      { name: "Background Guide", meta: "PDF · Releasing Soon" },
    ],
  },
  {
    id: "unhrc",
    label: "UNHRC",
    meta: "Human Rights Council · 4 Files",
    tone: "dark",
    art: "glacier",
    seed: 303,
    files: [
      { name: "Universal Declaration & Treaties", meta: "Geneva Treaty Body" },
      { name: "Human Rights Dossier", meta: "Civil Liberties & Conflict Zones", art: "glacier" },
      { name: "Council Matrix (47 States)", meta: "Regional Allocations" },
      { name: "Background Guide", meta: "PDF · Releasing Soon" },
    ],
  },
  {
    id: "unsc",
    label: "UNSC",
    meta: "Security Council · 4 Files",
    tone: "dark",
    art: "ember",
    seed: 101,
    files: [
      { name: "UNSC Mandate & Rules.pdf", meta: "Security Council · Veto Power" },
      { name: "Crisis Protocol Dossier", meta: "Continuous Crisis · Directives", art: "ember" },
      { name: "Country Matrix (15 States)", meta: "P5 & Non-Permanent" },
      { name: "Background Guide", meta: "PDF · Releasing Soon" },
    ],
  },
  {
    id: "loksabha",
    label: "Lok Sabha",
    meta: "Indian Parliament · 4 Files",
    tone: "dark",
    art: "verdant",
    seed: 404,
    files: [
      { name: "Lok Sabha Rules of Procedure", meta: "Parliamentary Protocol" },
      { name: "Legislative Agenda Dossier", meta: "National Security & Policy", art: "verdant" },
      { name: "Portfolio Allocations Matrix", meta: "Members of Parliament" },
      { name: "Background Guide", meta: "PDF · Releasing Soon" },
    ],
  },
  {
    id: "committeex",
    label: "Committee X",
    meta: "Classified Crisis · 4 Files",
    tone: "dark",
    art: "ember",
    seed: 606,
    files: [
      { name: "Classified Mandate & Protocol", meta: "Special Crisis · Top Secret" },
      { name: "Cabinet Directives Dossier", meta: "Dynamic Crisis Updates", art: "ember" },
      { name: "Portfolio Matrix", meta: "Classified Allocations" },
      { name: "Background Guide", meta: "PDF · Releasing Soon" },
    ],
  },
  {
    id: "ip",
    label: "International Press",
    meta: "Press Corps · 4 Files",
    tone: "dark",
    art: "dusk",
    seed: 505,
    files: [
      { name: "Press Code of Conduct", meta: "Accreditation & Wire Ethics" },
      { name: "Investigative Media Dossier", meta: "Press Releases & Live Intel", art: "dusk" },
      { name: "Media House Roles", meta: "Reporter & Photographer" },
      { name: "Background Guide", meta: "PDF · Releasing Soon" },
    ],
  },
];

export default function CommitteesSection() {
  const [activeFolder, setActiveFolder] = useState(null);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const check = () => setIsMobile(window.innerWidth < 640);
      check();
      window.addEventListener("resize", check);
      return () => window.removeEventListener("resize", check);
    }
  }, []);

  const handleFileSelect = (file, committeeName) => {
    if (typeof window !== "undefined" && window.showCustomAlert) {
      window.showCustomAlert(
        `${committeeName} — ${file.name} will be released with complete delegate study guides.`,
        "info"
      );
    }
  };

  const folderWidth = isMobile ? 255 : 310;

  return (
    <section id="committees" className="reveal relative py-16 sm:py-20 px-4 sm:px-6 lg:px-8 bg-black overflow-hidden scroll-mt-20">
      {/* Background Halftone Screen Pattern */}
      <div
        className="absolute inset-0 pointer-events-none opacity-40 z-0"
        style={{
          backgroundImage:
            "radial-gradient(circle, rgba(255, 255, 255, 0.22) 1.2px, transparent 1.2px), radial-gradient(circle, rgba(255, 255, 255, 0.08) 1.8px, transparent 1.8px)",
          backgroundSize: "16px 16px, 32px 32px",
          backgroundPosition: "0 0, 8px 8px",
          maskImage: "radial-gradient(ellipse 90% 75% at 50% 50%, black 20%, transparent 85%)",
          WebkitMaskImage: "radial-gradient(ellipse 90% 75% at 50% 50%, black 20%, transparent 85%)",
        }}
      />

      <div className="relative z-10 max-w-7xl mx-auto text-left sm:text-center mb-8 sm:mb-16">
        <div className="section-label" style={{ margin: "0 0 10px 0" }}>
          Official Committees
        </div>
        <h2 className="font-['Bebas_Neue'] text-3xl sm:text-5xl md:text-6xl tracking-wider text-white uppercase leading-tight sm:leading-none mb-3 break-words">
          Where the Debate Happens
        </h2>
        <p className="font-['Oswald'] text-xs sm:text-sm font-normal text-zinc-400 max-w-2xl sm:mx-auto tracking-wide uppercase">
          Six elite simulations. Crisis, diplomacy, and parliamentary debate. Click or hover any folder to open the dossier and inspect committee files.
        </p>
      </div>

      {/* Glass Folder Cards Grid */}
      <div className="relative z-10 max-w-7xl mx-auto flex flex-wrap items-center justify-center gap-5 sm:gap-10 lg:gap-12 pb-8">
        {COMMITTEES.map((comm, idx) => (
          <div key={comm.id} className="w-full max-w-[260px] sm:max-w-[310px] flex justify-center transition-transform duration-300 sm:hover:scale-[1.02]">
            <GlassFolder
              label={comm.label}
              meta={comm.meta}
              tone={comm.tone}
              art={comm.art}
              seed={comm.seed}
              files={comm.files}
              action="more"
              width={folderWidth}
              appear={true}
              appearDelay={idx * 80}
              open={activeFolder === comm.id}
              onOpenChange={(isOpen) => setActiveFolder(isOpen ? comm.id : null)}
              onFileSelect={(file) => handleFileSelect(file, comm.label)}
              menu={[
                {
                  label: "Register as Delegate",
                  onSelect: () => {
                    if (typeof window !== "undefined" && window.selectPathway) {
                      window.selectPathway("delegate");
                    }
                  },
                },
              ]}
            />
          </div>
        ))}
      </div>
    </section>
  );
}

