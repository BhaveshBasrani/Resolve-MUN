"use client";

import React, { useState, useEffect } from "react";
import GlassFolder from "./ui/glass-folder";

const MOBILE_COMMITTEE_ITEMS = [
  "Allocation Matrix",
  "Background Guide",
  "Chairs Info",
];

const COMMITTEES = [
  {
    id: "disec",
    label: "DISEC",
    fullName: "Disarmament and International Security Committee",
    meta: "Disarmament and International Security Committee",
    tone: "dark",
    art: "ember",
    seed: 202,
    files: [
      { name: "DISEC Multilateral Framework", meta: "First Committee · Treaties" },
      { name: "Global Security Dossier", meta: "Nuclear & Autonomous Arms", art: "ember" },
      { name: "Allocation Matrix", meta: "General Assembly Matrix" },
      { name: "Background Guide", meta: "PDF · Coming Soon" },
    ],
  },
  {
    id: "unhrc",
    label: "UNHRC",
    fullName: "United Nations Human Rights Council",
    meta: "United Nations Human Rights Council",
    tone: "dark",
    art: "glacier",
    seed: 303,
    files: [
      { name: "Universal Declaration & Treaties", meta: "Geneva Treaty Body" },
      { name: "Human Rights Dossier", meta: "Civil Liberties & Conflict Zones", art: "glacier" },
      { name: "Allocation Matrix", meta: "Regional Allocations" },
      { name: "Background Guide", meta: "PDF · Coming Soon" },
    ],
  },
  {
    id: "uncsw",
    label: "UNCSW",
    fullName: "United Nations Commission on the Status of Women",
    meta: "United Nations Commission on the Status of Women",
    tone: "dark",
    art: "aurora",
    seed: 101,
    files: [
      { name: "UNCSW Mandate & Policy Framework", meta: "Gender Equality & Empowerment" },
      { name: "Global Women's Rights Dossier", meta: "Civil Liberties & Socio-Economic Law", art: "aurora" },
      { name: "Allocation Matrix", meta: "UN ECOSOC Allocations" },
      { name: "Background Guide", meta: "PDF · Coming Soon" },
    ],
  },
  {
    id: "loksabha",
    label: "Lok Sabha",
    fullName: "Indian Mock Parliament",
    meta: "Indian Mock Parliament",
    tone: "dark",
    art: "verdant",
    seed: 404,
    files: [
      { name: "Lok Sabha Rules of Procedure", meta: "Parliamentary Protocol" },
      { name: "Legislative Agenda Dossier", meta: "National Security & Policy", art: "verdant" },
      { name: "Allocation Matrix", meta: "Members of Parliament" },
      { name: "Background Guide", meta: "PDF · Coming Soon" },
    ],
  },
  {
    id: "marvel",
    label: "Marvel",
    fullName: "Crisis Committee",
    meta: "Crisis Committee",
    tone: "dark",
    art: "ember",
    seed: 606,
    files: [
      { name: "Marvel Crisis Directives & Rules of Procedure", meta: "Continuous Crisis Protocol" },
      { name: "Crisis Strategy Dossier", meta: "Multiverse & Tactical Simulation", art: "ember" },
      { name: "Allocation Matrix", meta: "Hero & Villain Character Assignments" },
      { name: "Background Guide", meta: "PDF · Coming Soon" },
    ],
  },
  {
    id: "ip",
    label: "IP",
    fullName: "International Press",
    meta: "International Press",
    tone: "dark",
    art: "dusk",
    seed: 505,
    files: [
      { name: "Press Code of Conduct", meta: "Accreditation & Wire Ethics" },
      { name: "Investigative Media Dossier", meta: "Press Releases & Live Intel", art: "dusk" },
      { name: "Allocation Matrix", meta: "Reporter & Photographer" },
      { name: "Background Guide", meta: "PDF · Coming Soon" },
    ],
  },
];

export default function CommitteesSection() {
  const [activeFolder, setActiveFolder] = useState(null);
  const [folderWidth, setFolderWidth] = useState(310);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const check = () => {
        const w = window.innerWidth;
        setIsMobile(w <= 768);
        if (w < 640) {
          const colW = Math.floor((w - 40) / 2);
          setFolderWidth(Math.max(142, Math.min(176, colW)));
        } else {
          setFolderWidth(310);
        }
      };
      check();
      window.addEventListener("resize", check);
      return () => window.removeEventListener("resize", check);
    }
  }, []);

  const handleFileSelect = (file, committeeName) => {
    if (typeof window !== "undefined" && window.showCustomAlert) {
      window.showCustomAlert(
        `${committeeName} — ${file.name} Coming Soon!`,
        "info"
      );
    }
  };

  if (isMobile) {
    return (
      <section id="committees" className="relative py-10 px-5 bg-black text-white scroll-mt-16">
        <div className="max-w-xl mx-auto">
          <div className="mb-6 text-center">
            <div className="section-label" style={{ justifyContent: "center", margin: "0 auto 10px auto" }}>
              Official Committees
            </div>
            <h2 className="font-['Bebas_Neue'] text-3xl tracking-wider text-white uppercase leading-none mb-2">
              Where the Debate Happens
            </h2>
            <p className="text-sm text-[#a3a3a3] leading-relaxed">
              Six committees. Tap any committee to view details.
            </p>
          </div>

          <div className="flex flex-col gap-3">
            {COMMITTEES.map((comm) => {
              const isOpen = activeFolder === comm.id;
              return (
                <div
                  key={comm.id}
                  className={`rounded-lg border bg-black ${isOpen ? "border-white" : "border-[#262626]"}`}
                >
                  <button
                    type="button"
                    onClick={() => setActiveFolder(isOpen ? null : comm.id)}
                    aria-expanded={isOpen}
                    className="w-full min-h-[56px] px-4 py-3.5 flex items-center justify-between gap-3 text-left bg-black text-white cursor-pointer"
                  >
                    <div className="min-w-0">
                      <div className="font-['Oswald'] text-lg font-bold tracking-wide uppercase text-white leading-tight">
                        {comm.label}
                      </div>
                      <div className="text-xs text-[#a3a3a3] mt-0.5 leading-snug">
                        {comm.fullName}
                      </div>
                    </div>
                    <span className="shrink-0 w-7 h-7 rounded border border-[#333333] flex items-center justify-center text-sm font-mono text-white">
                      {isOpen ? "−" : "+"}
                    </span>
                  </button>

                  {isOpen && (
                    <div className="px-4 pb-4 pt-3 border-t border-[#1f1f1f] space-y-2 bg-black">
                      {MOBILE_COMMITTEE_ITEMS.map((itemLabel, idx) => (
                        <button
                          key={itemLabel}
                          type="button"
                          onClick={() => handleFileSelect({ name: itemLabel }, comm.label)}
                          className="w-full px-3 py-2.5 rounded-md border border-[#262626] bg-black text-left flex items-center justify-between gap-2 cursor-pointer"
                        >
                          <span className="text-[13px] font-medium text-white leading-snug">
                            <span className="text-[#737373] font-mono text-[11px] mr-2">0{idx + 1}</span>
                            {itemLabel}
                          </span>
                          <span className="text-[10px] font-mono uppercase tracking-wider text-[#737373] shrink-0">
                            Coming Soon
                          </span>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </section>
    );
  }

  return (
    <section id="committees" className="reveal relative py-10 sm:py-20 px-3.5 sm:px-6 lg:px-8 bg-black overflow-hidden scroll-mt-20">
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

      <div className="relative z-10 max-w-7xl mx-auto text-center mb-5 sm:mb-16">
        <div className="section-label" style={{ justifyContent: "center", margin: "0 auto 10px auto" }}>
          Official Committees
        </div>
          <h2 className="font-['Bebas_Neue'] text-2xl sm:text-5xl md:text-6xl tracking-wider text-white uppercase leading-tight sm:leading-none mb-2 text-center">
            Where the Debate Happens
          </h2>
          <p className="font-['Oswald'] text-[11px] sm:text-sm font-normal text-zinc-400 max-w-2xl mx-auto tracking-wide uppercase leading-relaxed text-center">
            Six elite simulations. Tap any folder to open the dossier and inspect committee files.
          </p>
      </div>

      {/* Glass Folder Cards Grid: 2-column compact grid on mobile, flex-wrap on desktop */}
      <div className="relative z-10 max-w-7xl mx-auto grid grid-cols-2 sm:flex sm:flex-wrap items-center justify-items-center justify-center gap-x-2.5 gap-y-3 sm:gap-10 lg:gap-12 pb-4 sm:pb-8">
        {COMMITTEES.map((comm, idx) => (
          <div key={comm.id} className="w-full sm:w-auto sm:max-w-[310px] flex justify-center transition-transform duration-300 sm:hover:scale-[1.02]">
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
              appearDelay={idx * 60}
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

