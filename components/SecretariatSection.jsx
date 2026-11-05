"use client";

import React from "react";
import TeamLanyardRail from "./ui/team-lanyard-rail";

// SVG data URI generator for initials avatar
function createAvatar(name, role) {
  const initials = name
    .split(/[\s&/,]+/)
    .map((w) => w[0])
    .filter(Boolean)
    .slice(0, 2)
    .join("")
    .toUpperCase() || "RM";

  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="200" height="200" viewBox="0 0 200 200">
    <defs>
      <radialGradient id="g" cx="50%" cy="38%" r="65%">
        <stop offset="0%" stop-color="#1f2238"/>
        <stop offset="100%" stop-color="#07080f"/>
      </radialGradient>
      <linearGradient id="ring" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="#818cf8"/>
        <stop offset="100%" stop-color="#c084fc"/>
      </linearGradient>
    </defs>
    <rect width="200" height="200" fill="url(#g)"/>
    <circle cx="100" cy="100" r="86" fill="none" stroke="url(#ring)" stroke-width="3" opacity="0.35"/>
    <text x="100" y="116" font-family="'Oswald', -apple-system, BlinkMacSystemFont, sans-serif" font-size="64" font-weight="700" fill="#ffffff" text-anchor="middle" letter-spacing="2">${initials}</text>
  </svg>`;

  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
}

const MEMBERS = [
  {
    id: "founder",
    name: "Niveditt Basrani",
    role: "Founder",
    team: "Resolve MUN 2.0",
    image: createAvatar("Niveditt Basrani", "Founder"),
    bio: "Visionary founder of Resolve MUN. Dedicated to fostering high-stakes diplomatic discourse and youth leadership.",
    tags: ["Founder", "Edition 2.0"],
    tone: 1,
  },
  {
    id: "sg",
    name: "TBD",
    role: "Secretary General",
    team: "Secretariat High Command",
    image: createAvatar("TBD", "Secretary General"),
    bio: "Chief Executive of Resolve MUN 2.0, directing diplomatic proceedings and conference administration.",
    tags: ["Secretariat", "High Command"],
    tone: 2,
  },
  {
    id: "dsg",
    name: "Chaithra",
    role: "Deputy Secretary General",
    team: "Secretariat High Command",
    image: createAvatar("Chaithra", "Deputy Secretary General"),
    bio: "Overseeing conference logistics, substantive debate frameworks, and procedural excellence.",
    tags: ["High Command", "Substantive"],
    tone: 3,
  },
  {
    id: "dg",
    name: "Abhignya",
    role: "Director General",
    team: "Secretariat High Command",
    image: createAvatar("Abhignya", "Director General"),
    bio: "Head of internal operations, delegate services, and conference hospitality.",
    tags: ["Operations", "Administration"],
    tone: 4,
  },
  {
    id: "chief-advisor",
    name: "Swayam Bakshi",
    role: "Chief Advisor",
    team: "Advisory Council",
    image: createAvatar("Swayam Bakshi", "Chief Advisor"),
    bio: "Guiding the conference vision, policy oversight, and strategic institutional partnerships.",
    tags: ["Advisory", "Strategy"],
    tone: 5,
  },
  {
    id: "conf-leads",
    name: "Likith & Risheeth",
    role: "Conference Leads",
    team: "Steering Committee",
    image: createAvatar("Likith Risheeth", "Conference Leads"),
    bio: "Steering conference coordination, inter-departmental workflows, and execution timelines.",
    tags: ["Conference Leads", "Coordination"],
    tone: 1,
  },
  {
    id: "special-advisors",
    name: "Aarav & Abhik",
    role: "Special Advisors",
    team: "Advisory Council",
    image: createAvatar("Aarav Abhik", "Special Advisors"),
    bio: "Counseling the Secretariat on committee dynamics, debate rigor, and high-level strategy.",
    tags: ["Advisory", "Diplomacy"],
    tone: 2,
  },
  {
    id: "head-oc",
    name: "Devansh",
    role: "Head of OC",
    team: "Organizing Committee",
    image: createAvatar("Devansh", "Head of OC"),
    bio: "Leading ground logistics, on-site personnel orchestration, and conference infrastructure.",
    tags: ["OC", "Ground Operations"],
    tone: 3,
  },
  {
    id: "head-logistics",
    name: "Merlin",
    role: "Head of Logistics",
    team: "Operations Directorate",
    image: createAvatar("Merlin", "Head of Logistics"),
    bio: "Commanding venue logistics, chamber allotments, equipment, and conference movement.",
    tags: ["Logistics", "Operations"],
    tone: 4,
  },
  {
    id: "head-volunteers",
    name: "Nipun",
    role: "Head of Volunteers",
    team: "Secretariat Directorate",
    image: createAvatar("Nipun", "Head of Volunteers"),
    bio: "Mobilizing and deploying conference volunteer forces across all committee chambers.",
    tags: ["Volunteers", "OC"],
    tone: 5,
  },
  {
    id: "head-content",
    name: "Hima",
    role: "Head of Content Creation",
    team: "Media & Comms",
    image: createAvatar("Hima", "Head of Content Creation"),
    bio: "Curating official conference publications, background guides, and media copy.",
    tags: ["Content", "Media"],
    tone: 1,
  },
  {
    id: "cohead-content",
    name: "Kanishka",
    role: "Co-Head of Content Creation",
    team: "Media & Comms",
    image: createAvatar("Kanishka", "Co-Head of Content Creation"),
    bio: "Directing collaborative writing, communications strategy, and official editorial releases.",
    tags: ["Content", "Editorial"],
    tone: 2,
  },
  {
    id: "head-design",
    name: "Ronith",
    role: "Head of Design",
    team: "Creative Directorate",
    image: createAvatar("Ronith", "Head of Design"),
    bio: "Crafting the brand identity, visual style, and print deliverables of Resolve MUN.",
    tags: ["Design", "Branding"],
    tone: 3,
  },
  {
    id: "coheads-design",
    name: "Arushi & Saanvi",
    role: "Co-Heads of Design",
    team: "Creative Directorate",
    image: createAvatar("Arushi Saanvi", "Co-Heads of Design"),
    bio: "Architecting visual campaigns, stage aesthetics, and digital assets.",
    tags: ["Design", "Creatives"],
    tone: 4,
  },
  {
    id: "head-editing",
    name: "Charan",
    role: "Head of Editing",
    team: "Media & Film",
    image: createAvatar("Charan", "Head of Editing"),
    bio: "Leading video production, motion graphics, and post-production storytelling.",
    tags: ["Editing", "Media"],
    tone: 5,
  },
  {
    id: "head-partnerships",
    name: "Havish",
    role: "Head of Partnership & Delegate Acquisition",
    team: "External Relations",
    image: createAvatar("Havish", "Head of Partnership & Delegate Acquisition"),
    bio: "Managing institutional alliances, sponsor relations, and school delegations.",
    tags: ["Partnerships", "Acquisition"],
    tone: 1,
  },
  {
    id: "head-delegate-affairs",
    name: "Meghana",
    role: "Head of Delegate Affairs",
    team: "Delegate Directorate",
    image: createAvatar("Meghana", "Head of Delegate Affairs"),
    bio: "Overseeing delegate onboarding, country allocations, and participant experience.",
    tags: ["Delegates", "Affairs"],
    tone: 2,
  },
  {
    id: "cohead-delegate-affairs",
    name: "Dhanvi",
    role: "Co-Head of Delegate Affairs",
    team: "Delegate Directorate",
    image: createAvatar("Dhanvi", "Co-Head of Delegate Affairs"),
    bio: "Assisting delegate queries, grievance redressing, and council communications.",
    tags: ["Delegates", "Support"],
    tone: 3,
  },
  {
    id: "usg-outreach",
    name: "Dhairya",
    role: "USG of Outreach",
    team: "Outreach & Public Relations",
    image: createAvatar("Dhairya", "USG of Outreach"),
    bio: "Driving pan-city delegate outreach, school partnerships, and institutional registrations.",
    tags: ["Outreach", "PR"],
    tone: 4,
  },
  {
    id: "cohead-outreach",
    name: "Ryan",
    role: "Co-Head of Outreach",
    team: "Outreach & Public Relations",
    image: createAvatar("Ryan", "Co-Head of Outreach"),
    bio: "Coordinating youth outreach, regional networks, and delegation invitations.",
    tags: ["Outreach", "Networks"],
    tone: 5,
  },
  {
    id: "usg-content",
    name: "Abhinaya",
    role: "USG of Content Creation",
    team: "Media Directorate",
    image: createAvatar("Abhinaya", "USG of Content Creation"),
    bio: "Drafting press memos, social broadcasts, and substantive delegate briefings.",
    tags: ["Content", "Media"],
    tone: 1,
  },
  {
    id: "usg-stalls",
    name: "Vignesh",
    role: "USG of Stalls",
    team: "Campus Hospitality",
    image: createAvatar("Vignesh", "USG of Stalls"),
    bio: "Managing merchandise, vendor stalls, food courts, and on-ground commercial spaces.",
    tags: ["Stalls", "Campus"],
    tone: 2,
  },
  {
    id: "usg-del-affairs-moksha",
    name: "Moksha",
    role: "USG of Delegate Affairs",
    team: "Delegate Directorate",
    image: createAvatar("Moksha", "USG of Delegate Affairs"),
    bio: "Facilitating delegate credentials, committee coordination, and conference support.",
    tags: ["Delegates", "Chambers"],
    tone: 3,
  },
  {
    id: "usg-del-affairs-parinitha",
    name: "Parinitha",
    role: "USG of Delegate Affairs",
    team: "Delegate Directorate",
    image: createAvatar("Parinitha", "USG of Delegate Affairs"),
    bio: "Managing committee roll calls, dossiers, and diplomatic facilitation.",
    tags: ["Delegates", "Operations"],
    tone: 4,
  },
  {
    id: "usg-hospitality",
    name: "Niyathi",
    role: "USG of Hospitality",
    team: "Campus Hospitality",
    image: createAvatar("Niyathi", "USG of Hospitality"),
    bio: "Overseeing dignitary receptions, executive dining, and campus hospitality standards.",
    tags: ["Hospitality", "Vetting"],
    tone: 5,
  },
  {
    id: "usg-research",
    name: "Deeksha",
    role: "USG of Research",
    team: "Substantive Council",
    image: createAvatar("Deeksha", "USG of Research"),
    bio: "Conducting international law, geopolitics, and historical crisis research.",
    tags: ["Research", "Geopolitics"],
    tone: 1,
  },
  {
    id: "usg-marketing",
    name: "Moksh",
    role: "USG of Marketing",
    team: "Growth Directorate",
    image: createAvatar("Moksh", "USG of Marketing"),
    bio: "Spearheading digital campaigns, influencer engagement, and conference visibility.",
    tags: ["Marketing", "Growth"],
    tone: 2,
  },
];

export default function SecretariatSection() {
  return (
    <section
      id="secretariat"
      className="reveal relative bg-black text-white py-10 sm:py-14 border-t border-white/10 overflow-hidden"
      style={{ backgroundColor: "#000000" }}
    >
      {/* Background Halftone & Ambient Glow */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 opacity-[0.035]"
        style={{
          backgroundImage: "radial-gradient(#ffffff 1px, transparent 1px)",
          backgroundSize: "24px 24px",
        }}
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[300px] bg-indigo-600/10 blur-[120px] rounded-full"
      />

      {/* Section Header */}
      <div className="relative z-10 max-w-5xl mx-auto px-6 text-center mb-4 sm:mb-6">
        <div
          className="section-label"
          style={{ justifyContent: "center", margin: "0 auto 10px auto" }}
        >
          Secretariat
        </div>

        <h2
          className="text-3xl sm:text-5xl font-extrabold uppercase tracking-tight text-white"
          style={{ fontFamily: "'Oswald', sans-serif" }}
        >
          MEET THE TEAM
        </h2>
      </div>

      {/* Rail Container with Blurred Underneath + Minimal Text Only Overlay */}
      <div className="relative w-full overflow-hidden">
        {/* BLURRED LANYARD RAIL */}
        <div
          className="w-full transition-all duration-700 pointer-events-none select-none"
          style={{
            filter: "blur(22px) saturate(0.6)",
            WebkitFilter: "blur(22px) saturate(0.6)",
            opacity: 0.32,
            transform: "scale(0.98)",
          }}
          aria-hidden="true"
        >
          <TeamLanyardRail
            items={MEMBERS}
            className="!bg-transparent !text-white"
            autoplay={false}
            compact={true}
            showCaption={false}
          />
        </div>

        {/* MINIMAL FLOATING OVERLAY: ONLY KEEP TEXT "TEAM REVEAL SOON" */}
        <div className="absolute inset-0 z-30 flex items-center justify-center p-4 pointer-events-none select-none">
          <h3
            className="text-3xl sm:text-5xl md:text-6xl font-extrabold uppercase text-white text-center drop-shadow-[0_4px_35px_rgba(0,0,0,0.98)]"
            style={{
              fontFamily: "'Oswald', sans-serif",
              letterSpacing: "0.18em",
            }}
          >
            TEAM REVEAL SOON
          </h3>
        </div>
      </div>
    </section>
  );
}

