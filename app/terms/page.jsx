"use client";

import React, { Suspense, useState, useEffect } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import Footer from "@/components/Footer";
import { FileText, ShieldCheck, ExternalLink } from "lucide-react";

const DELEGATE_SECTIONS = [
  {
    num: "01",
    title: "Registration & Eligibility",
    clauses: [
      "By registering for the conference, the delegate agrees to abide by all rules, regulations, and decisions of the Secretariat.",
      "Registration details provided by the delegate must be accurate and complete.",
      "Registration is considered confirmed only after completion of the required registration process and payment verification, where applicable.",
      "Delegates must carry valid identification and any documents required for verification.",
      "A delegate who is under 18 years of age confirms that they have the consent of their parent or guardian to participate in the conference.",
    ],
  },
  {
    num: "02",
    title: "Fees & Refunds",
    clauses: [
      "Registration fees, once paid, are non-refundable and non-transferable unless explicitly stated otherwise by the Secretariat.",
      "Even if the dates of the conference are postponed or rescheduled, any refund, credit, or adjustment of fees shall be at the sole discretion of the Secretariat.",
      "Fees paid are for participation in the conference only and do not cover any damage costs, fines, or other amounts payable under these Terms & Conditions.",
    ],
  },
  {
    num: "03",
    title: "Attendance",
    clauses: [
      "Delegates are expected to attend all sessions, committee proceedings, and mandatory conference activities assigned to them.",
      "Repeated or unexplained absence may result in disciplinary action and may affect eligibility for awards.",
      "Delegates must arrive at the venue and committee rooms on time.",
    ],
  },
  {
    num: "04",
    title: "Committee Allocation & Conduct",
    clauses: [
      "Delegates must participate in, and stay with, the committee and portfolio allocated to them by the Secretariat for the duration of the conference. Allocation decisions of the Secretariat are final.",
      "Delegates must follow the Rules of Procedure and all instructions issued by the Executive Board and Secretariat.",
      "Delegates must maintain proper decorum and professionalism throughout the conference.",
      "Disrespectful, abusive, threatening, discriminatory, or disruptive behaviour towards delegates, Executive Board members, Secretariat members, volunteers, or venue staff will not be tolerated.",
      "Plagiarism, cheating, or use of unauthorized assistance during committee sessions is strictly prohibited.",
    ],
  },
  {
    num: "05",
    title: "Prohibited Items, Venue Property & Liability",
    clauses: [
      "Alcohol, tobacco, vapes, e-cigarettes, weapons, sharp objects, and any illegal substances are strictly prohibited on campus. Violations result in immediate expulsion without refund.",
      "Delegates are financially responsible for any intentional or negligent damage caused to Northfield International School property, equipment, or conference assets.",
      "Resolve MUN 2.0, its Founders, Secretariat, and Northfield International School are not liable for any lost, stolen, or damaged personal belongings.",
      "All participants must submit the signed Participant Liability Waiver & Code of Conduct prior to or at check-in.",
    ],
  },
  {
    num: "06",
    title: "Media, Photography & Secretariat Discretion",
    clauses: [
      "By attending Resolve MUN 2.0, delegates consent to photography, videography, and official media coverage used for conference archives and promotional materials.",
      "The Founders and Secretariat reserve the right to amend schedules, committee agendas, or rules if required for operational safety, and their decisions in all disciplinary or award matters are final.",
    ],
  },
];

const OC_SECTIONS = [
  {
    num: "01",
    title: "Appointment & Duties",
    clauses: [
      "Organizing Committee (OC) positions are confirmed only upon official approval by the Secretariat.",
      "OC members must execute all assigned duties across Logistics, Delegate Affairs, Hospitality, Design, Marketing, Security, or Press with professionalism and punctuality.",
      "OC members must attend mandatory pre-conference briefings, venue setup days, and both conference days (26–27 December 2026) in full.",
    ],
  },
  {
    num: "02",
    title: "OC Fees, Plans & Conduct",
    clauses: [
      "OC fee plans (₹1,500 Full Plan, ₹1,000 No Transport, ₹750 Basic Plan, or approved Exempt) are non-refundable once verified.",
      "OC members represent Resolve MUN 2.0 at all times; misconduct, absenteeism, or unauthorized disclosure of internal data will result in immediate removal without certificate or refund.",
      "Cash commissions earned through verified OC referral codes are settled after payment verification and conference audit.",
    ],
  },
];

const PRIVACY_SECTIONS = [
  {
    num: "01",
    title: "Data We Collect",
    clauses: [
      "We collect participant name, email, phone number, parent/guardian emergency contact, institution, grade, date of birth, committee preferences, and UPI payment verification proofs solely to manage Resolve MUN 2.0 registrations and venue safety.",
    ],
  },
  {
    num: "02",
    title: "Usage, Security & Deletion",
    clauses: [
      "Participant data is never sold to third parties. It is accessed only by authorized Secretariat administrators for allotments, gate pass check-in, emergency contact, and official communications.",
      "Participants may request updates or permanent deletion of their account and data at any time from their Delegate Dashboard or by emailing resolve.mun@gmail.com.",
    ],
  },
];

function TermsContent() {
  const searchParams = useSearchParams();
  const initial = (searchParams.get("tab") || "delegate").toLowerCase();
  const [tab, setTab] = useState(
    initial === "oc" ? "oc" : initial === "privacy" ? "privacy" : "delegate"
  );

  useEffect(() => {
    const t = (searchParams.get("tab") || "").toLowerCase();
    if (t === "oc" || t === "privacy" || t === "delegate") setTab(t);
  }, [searchParams]);

  const sections =
    tab === "oc" ? OC_SECTIONS : tab === "privacy" ? PRIVACY_SECTIONS : DELEGATE_SECTIONS;

  const preamble =
    tab === "oc"
      ? "These terms govern all Organizing Committee (OC) members appointed for Resolve MUN 2.0 (26–27 December 2026 at Northfield International School, Kompally, Hyderabad)."
      : tab === "privacy"
      ? "This Privacy Policy explains how Resolve MUN 2.0 collects, protects, and uses registration and verification data submitted on resolvemun.in."
      : "These Terms & Conditions govern the participation of every delegate in Resolve MUN 2.0, held on 26 and 27 December 2026 at Northfield International School, Kompally, Hyderabad. “Secretariat” means the Secretariat of Resolve MUN, and “Founders” means Abhilash Vijayakumar, Niveditt Basrani, and Poorvika Setti.";

  return (
    <div className="min-h-screen bg-black text-white font-sans flex flex-col justify-between">
      <header className="sticky top-0 z-40 h-14 border-b border-[#1f1f1f] bg-black/95 backdrop-blur-sm">
        <div className="max-w-3xl h-full mx-auto px-4 sm:px-6 flex items-center justify-between gap-3">
          <Link href="/" className="flex items-center gap-2 !no-underline shrink-0">
            <img src="/images/Logo.svg" alt="Resolve MUN" className="w-5 h-5 object-contain" />
            <span
              className="text-base tracking-[0.12em] text-white font-bold pt-0.5"
              style={{ fontFamily: "'Bebas Neue', sans-serif" }}
            >
              RESOLVE MUN 2.0
            </span>
          </Link>
          <div className="flex items-center gap-2">
            <Link
              href="/brochure"
              className="h-8 px-3 rounded-md border border-[#262626] bg-black text-xs text-zinc-300 hover:text-white flex items-center gap-1.5"
            >
              <FileText className="w-3.5 h-3.5" />
              <span>Brochure</span>
            </Link>
            <Link
              href="/liability"
              className="h-8 px-3 rounded-md border border-[#262626] bg-black text-xs text-zinc-300 hover:text-white flex items-center gap-1.5"
            >
              <ShieldCheck className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Liability Waiver</span>
            </Link>
          </div>
        </div>
      </header>

      <main className="flex-1 max-w-3xl w-full mx-auto px-4 sm:px-6 py-8 sm:py-10 space-y-6">
        <div className="space-y-2">
          <span className="block text-[10px] font-mono uppercase tracking-[0.2em] text-zinc-500">
            RESOLVE MUN 2.0 · 26–27 DECEMBER 2026 · NORTHFIELD INTERNATIONAL SCHOOL
          </span>
          <h1 className="m-0 text-2xl sm:text-3xl font-bold tracking-tight text-white">
            Legal Policies &amp; Terms
          </h1>
          <p className="m-0 text-xs sm:text-sm text-zinc-400 leading-relaxed">
            Official conference terms, Organizing Committee guidelines, and participant privacy policy.
          </p>
        </div>

        {/* Clean Tab Bar */}
        <div className="inline-flex items-center gap-1 p-1 rounded-full bg-[#0d0d10] border border-[#262626]">
          {[
            { id: "delegate", label: "Delegate Terms" },
            { id: "oc", label: "OC Terms" },
            { id: "privacy", label: "Privacy Policy" },
          ].map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() => setTab(item.id)}
              className={`px-4 py-1.5 rounded-full text-xs font-semibold transition cursor-pointer ${
                tab === item.id
                  ? "bg-white text-black"
                  : "text-zinc-400 hover:text-white"
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>

        {/* Preamble */}
        <div className="rounded-lg border border-[#262626] bg-[#09090b] p-4 sm:p-5 text-xs sm:text-[13px] text-zinc-300 leading-relaxed">
          {preamble}
        </div>

        {/* Clauses */}
        <div className="space-y-4">
          {sections.map((sec) => (
            <section
              key={sec.num}
              className="rounded-lg border border-[#1f1f1f] bg-[#050507] p-4 sm:p-5 space-y-3"
            >
              <div className="flex items-center gap-2.5 pb-2.5 border-b border-[#1a1a1f]">
                <span className="px-2 py-0.5 rounded bg-white/10 font-mono text-[11px] font-bold text-white">
                  {sec.num}
                </span>
                <h2 className="m-0 text-xs font-bold uppercase tracking-wider text-white">
                  {sec.title}
                </h2>
              </div>
              <ol className="m-0 p-0 list-none space-y-2.5">
                {sec.clauses.map((clause, i) => (
                  <li key={i} className="flex items-start gap-3 text-[13px] text-zinc-300 leading-relaxed">
                    <span className="font-mono text-[11px] text-zinc-500 mt-0.5 min-w-[20px]">
                      {i + 1}.
                    </span>
                    <span>{clause}</span>
                  </li>
                ))}
              </ol>
            </section>
          ))}
        </div>

        <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-[#1f1f1f] text-xs text-zinc-400">
          <span>Questions? Email resolve.mun@gmail.com</span>
          <Link
            href="/liability"
            className="text-white hover:underline inline-flex items-center gap-1 font-medium"
          >
            <span>Open Printable Liability Waiver</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </Link>
        </div>
      </main>

      <Footer />
    </div>
  );
}

export default function TermsPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-black" />}>
      <TermsContent />
    </Suspense>
  );
}
