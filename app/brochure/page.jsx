import { redirect } from "next/navigation";

export const metadata = {
  title: "Delegate Information Brochure | Resolve MUN 2.0",
  description:
    "Download the official Resolve MUN 2.0 Delegate Information Brochure — 26–27 December 2026 at Northfield International School, Kompally, Hyderabad.",
};

export default function BrochureRedirectPage() {
  redirect("/Resolve-MUN-2.0-Delegate-Brochure.pdf");
}
