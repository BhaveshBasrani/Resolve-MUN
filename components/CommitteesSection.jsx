"use client";

import React, { useState } from "react";
import GlassFolder from "./ui/glass-folder";

const COMMITTEES = [
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
    id: "disec",
    label: "UNGA - DISEC",
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
    id: "ip",
    label: "IP (Press Corps)",
    meta: "International Press · 4 Files",
    tone: "dark",
    art: "dusk",
    seed: 505,
    files: [
      { name: "Press Code of Conduct", meta: "Accreditation & Wire Ethics" },
      { name: "Investigative Media Dossier", meta: "Press Releases & Live Intel", art: "dusk" },
      { name: "Media House Beats", meta: "Reuters, BBC, Al Jazeera, NYT" },
      { name: "Background Guide", meta: "PDF · Releasing Soon" },
    ],
  },
];

export default function CommitteesSection() {
  const [activeFolder, setActiveFolder] = useState(null);

  const handleFileSelect = (file, committeeName) => {
    if (typeof window !== "undefined" && window.showCustomAlert) {
      window.showCustomAlert(
        `${committeeName} — ${file.name} will be released with complete delegate study guides.`,
        "info"
      );
    }
  };

  return (
    <section id="committees" className="reveal relative py-20 px-4 sm:px-6 lg:px-8 bg-black overflow-hidden">
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

      <div className="relative z-10 max-w-7xl mx-auto text-center mb-16">
        <div className="section-label" style={{ justifyContent: "center", margin: "0 auto 12px auto" }}>
          Official Committees
        </div>
        <h2 className="font-['Bebas_Neue'] text-5xl sm:text-6xl md:text-7xl tracking-wider text-white uppercase leading-none mb-4">
          Where the Debate Happens
        </h2>
        <p className="font-['Oswald'] text-sm sm:text-base font-normal text-zinc-400 max-w-2xl mx-auto tracking-wide uppercase">
          Five elite simulations. Crisis, diplomacy, and parliamentary debate. Click or hover any folder to open the dossier and inspect committee files.
        </p>
      </div>

      {/* Glass Folder Cards Grid */}
      <div className="relative z-10 max-w-7xl mx-auto flex flex-wrap items-center justify-center gap-8 sm:gap-10 lg:gap-12 pb-8">
        {COMMITTEES.map((comm, idx) => (
          <div key={comm.id} className="transition-transform duration-300 hover:scale-[1.02]">
            <GlassFolder
              label={comm.label}
              meta={comm.meta}
              tone={comm.tone}
              art={comm.art}
              seed={comm.seed}
              files={comm.files}
              action="more"
              width={310}
              appear={true}
              appearDelay={idx * 80}
              open={activeFolder === comm.id}
              onOpenChange={(isOpen) => setActiveFolder(isOpen ? comm.id : null)}
              onFileSelect={(file) => handleFileSelect(file, comm.label)}
              menu={[
                {
                  label: "Apply for Committee",
                  onSelect: () => {
                    if (typeof window !== "undefined" && window.selectPathway) {
                      window.selectPathway("secretariat");
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

