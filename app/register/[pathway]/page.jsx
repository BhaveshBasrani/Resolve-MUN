import { redirect } from "next/navigation";

const PATHWAY_CONFIG = {
  delegate: {
    title: "Individual Delegate Registration | Resolve MUN 2026",
    description:
      "Register as an individual delegate for Resolve MUN 2.0 (27th–29th November 2026 at Meridian School, Kompally, Hyderabad). High-stakes diplomacy across 6 elite committees.",
  },
  del: {
    title: "Individual Delegate Registration | Resolve MUN 2026",
    description:
      "Register as an individual delegate for Resolve MUN 2.0 (27th–29th November 2026 at Meridian School, Kompally, Hyderabad).",
  },
  delegation: {
    title: "School & Institutional Delegation Registration | Resolve MUN 2026",
    description:
      "Register your school or college contingent for Resolve MUN 2.0. Institutional tier benefits, group allocations, and Best Delegation awards.",
  },
  oc: {
    title: "Organizing Committee (OC) Application | Resolve MUN 2026",
    description:
      "Apply for the official Organizing Committee at Resolve MUN 2.0. Leadership roles across Logistics, Public Relations, Delegate Affairs, and Hospitality.",
  },
  secretariat: {
    title: "Secretariat Application | Resolve MUN 2026",
    description:
      "Apply for the Secretariat High Command of Resolve MUN 2.0. Direct diplomatic proceedings, committee frameworks, and conference leadership.",
  },
  sec: {
    title: "Secretariat Application | Resolve MUN 2026",
    description:
      "Apply for the Secretariat High Command of Resolve MUN 2.0.",
  },
  eb: {
    title: "Executive Board Application | Resolve MUN 2026",
    description:
      "Apply as Executive Board (Chair / Vice-Chair / Moderator) for Resolve MUN 2.0 committees.",
  },
  socials: {
    title: "Socials Night Pass | Resolve MUN 2026",
    description:
      "Official entry pass for Resolve MUN 2026 Socials Night. Music, networking, and banquet access.",
  },
};

export async function generateMetadata({ params }) {
  const { pathway } = await params;
  const key = (pathway || "").toLowerCase();
  const meta = PATHWAY_CONFIG[key] || {
    title: "Registration | Resolve MUN 2026",
    description: "Official registration link for Resolve MUN 2.0 at Meridian School, Kompally, Hyderabad.",
  };

  return {
    title: meta.title,
    description: meta.description,
    openGraph: {
      title: meta.title,
      description: meta.description,
      url: `https://resolvemun.in/register/${key}`,
      siteName: "Resolve MUN 2026",
      images: [{ url: "/images/hero-bg.webp", width: 1200, height: 630 }],
      locale: "en_IN",
      type: "website",
    },
  };
}

export default async function RegisterPathwayPage({ params, searchParams }) {
  const { pathway } = await params;
  const sParams = await searchParams;
  const query = new URLSearchParams(sParams || {});
  
  // Normalize key
  const rawKey = (pathway || "").toLowerCase().trim();
  let normalized = rawKey;
  if (["del", "individual"].includes(rawKey)) normalized = "delegate";
  else if (["school", "contingent"].includes(rawKey)) normalized = "delegation";
  else if (["sec"].includes(rawKey)) normalized = "secretariat";
  else if (["social", "party"].includes(rawKey)) normalized = "socials";

  query.set("open", normalized);
  redirect(`/?${query.toString()}`);
}

