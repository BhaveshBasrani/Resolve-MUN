import { redirect } from "next/navigation";

export async function generateMetadata({ params }) {
  const { pathway } = await params;
  const key = (pathway || "").toLowerCase();
  const titles = {
    oc: "Apply for Organizing Committee | Resolve MUN 2026",
    secretariat: "Apply for Secretariat | Resolve MUN 2026",
    sec: "Apply for Secretariat | Resolve MUN 2026",
    eb: "Apply for Executive Board | Resolve MUN 2026",
    delegate: "Register as Delegate | Resolve MUN 2026",
    delegation: "Register Delegation | Resolve MUN 2026",
  };

  const title = titles[key] || "Official Application | Resolve MUN 2026";
  const description = `Direct application pathway for ${key.toUpperCase()} at Resolve MUN 2.0 (27th–29th November 2026, Meridian School, Kompally, Hyderabad).`;

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      url: `https://resolvemun.in/apply/${key}`,
      siteName: "Resolve MUN 2026",
      images: [{ url: "/images/hero-bg.webp", width: 1200, height: 630 }],
    },
  };
}

export default async function ApplyPathwayPage({ params, searchParams }) {
  const { pathway } = await params;
  const sParams = await searchParams;
  const query = new URLSearchParams(sParams || {});

  const rawKey = (pathway || "").toLowerCase().trim();
  let normalized = rawKey;
  if (["del", "individual"].includes(rawKey)) normalized = "delegate";
  else if (["school", "contingent"].includes(rawKey)) normalized = "delegation";
  else if (["sec"].includes(rawKey)) normalized = "secretariat";

  query.set("open", normalized);
  redirect(`/?${query.toString()}`);
}
