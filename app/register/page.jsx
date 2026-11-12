import { redirect } from "next/navigation";

export const metadata = {
  title: "Resolve MUN 2.0",
  description:
    "Choose your application pathway for Resolve MUN 2.0 (25, 26, 27 December 2026, TBA, Hyderabad) — Delegate, Institutional Delegation, OC, Secretariat, or Socials Pass.",
  openGraph: {
    title: "Resolve MUN 2.0",
    description:
      "Choose your application pathway for Resolve MUN 2.0 (25, 26, 27 December 2026, TBA, Hyderabad).",
    url: "https://resolvemun.in/register",
    siteName: "Resolve MUN 2.0",
    images: [{ url: "https://resolvemun.in/images/OG.jpg", secureUrl: "https://resolvemun.in/images/OG.jpg", width: 1024, height: 576, type: "image/jpeg", alt: "Resolve MUN 2.0 — Official Banner" }],
    locale: "en_IN",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Resolve MUN 2.0",
    description: "Choose your application pathway for Resolve MUN 2.0 (25, 26, 27 December 2026, TBA, Hyderabad).",
    images: ["https://resolvemun.in/images/OG.jpg"],
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

