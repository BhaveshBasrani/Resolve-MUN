import { redirect } from "next/navigation";

export const metadata = {
  title: "Official Registrations & Applications | Resolve MUN 2026",
  description:
    "Choose your application pathway for Resolve MUN 2.0 (27th–29th November 2026 at Meridian School, Kompally, Hyderabad) — Delegate, Institutional Delegation, OC, Secretariat, or Socials Pass.",
  openGraph: {
    title: "Official Registrations & Applications | Resolve MUN 2026",
    description:
      "Choose your application pathway for Resolve MUN 2.0 at Meridian School, Kompally, Hyderabad.",
    url: "https://resolvemun.in/register",
    siteName: "Resolve MUN 2026",
    images: [{ url: "/images/hero-bg.webp", width: 1200, height: 630 }],
    locale: "en_IN",
    type: "website",
  },
};

export default async function RegisterIndexPage({ searchParams }) {
  const sParams = await searchParams;
  const query = new URLSearchParams(sParams || {});
  if (!query.has("open")) {
    query.set("open", "pathway");
  }
  redirect(`/?${query.toString()}`);
}
