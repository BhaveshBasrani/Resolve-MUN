"use client";

import React, { Suspense, useState, useEffect } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import Footer from "@/components/Footer";
import { FileText, ShieldCheck, ArrowRightLeft, AlertTriangle, ExternalLink } from "lucide-react";

const TABS = [
  { id: "delegate", label: "Delegate Terms" },
  { id: "refunds", label: "No-Refund & Transfers" },
  { id: "lumen", label: "Lumen MUN Policy" },
  { id: "oc", label: "OC & Secretariat" },
  { id: "privacy", label: "Privacy Policy" },
];

const POLICY_CONTENT = {
  delegate: {
    eyebrow: "DELEGATE TERMS & CONDITIONS · EFFECTIVE FOR RESOLVE MUN 2.0",
    title: "Delegate Terms & Conditions",
    preamble:
      "These Terms & Conditions constitute a binding agreement between every registered participant (“Delegate”) and Resolve MUN 2.0 (“Conference”), scheduled for 26 and 27 December 2026 at Northfield International School, BMR Towers, Devarayamjal Road, Kompally, Hyderabad, Telangana 500078. “Secretariat” refers to the official organizing body of Resolve MUN 2.0, and “Founders” refers to Abhilash Vijayakumar, Niveditt Basrani, and Poorvika Setti.",
    sections: [
      {
        num: "01",
        title: "Registration, Accuracy & Verification",
        clauses: [
          "By submitting a registration form or payment on resolvemun.in, the Delegate (and their parent/guardian if under 18 years of age) unconditionally agrees to comply with all policies, Rules of Procedure, safety directives, and Secretariat decisions.",
          "All registration information—including full legal name, school/institution, date of birth, personal WhatsApp number, and Parent/Guardian emergency contact—must be truthful, accurate, and complete. Providing a false or duplicate emergency phone number matching the Delegate’s own number is prohibited.",
          "A registration is considered provisional until the submitted UPI Transaction Reference (UTR) and payment screenshot are manually audited and marked VERIFIED by the Secretariat. Unverified registrations do not grant venue entry, Digital Gate Passes, or committee seats.",
          "Submitting an application for Executive Board (EB), Organizing Committee (OC), or Secretariat does not guarantee appointment. Selection is finalized solely upon official written approval from the Secretariat.",
          "Delegates must carry a valid school/college or government-issued photo ID alongside their official Resolve MUN 2.0 Digital Gate Pass QR code on both conference days.",
        ],
      },
      {
        num: "02",
        title: "Strict Zero-Refund Policy",
        clauses: [
          "ALL registration fees paid to Resolve MUN 2.0 (whether Individual Delegate ₹2,500, Referral-discounted fees, Institutional Delegation fees, OC fees, or Socials passes) are STRICTLY NON-REFUNDABLE under all circumstances.",
          "No full or partial refunds shall be issued for personal inability to attend, academic exam clashes, medical emergencies, travel delays, dissatisfaction with committee or portfolio allotment, late withdrawal, or disciplinary expulsion.",
          "In the event of force majeure, public health advisories, weather disruptions, or administrative rescheduling of conference dates or venue, registrations shall automatically roll over to the rescheduled edition; any credit or adjustment remains at the sole and final discretion of the Founders and Secretariat.",
          "Initiating an unauthorized UPI dispute or bank chargeback after submitting a valid registration will result in immediate permanent blacklisting from Resolve MUN and partner Hyderabad MUN conferences.",
        ],
      },
      {
        num: "03",
        title: "Allocation Transfer & Resale Restrictions",
        clauses: [
          "Registrations and committee allocations are strictly personal and NON-TRANSFERABLE by default.",
          "If a verified Delegate is unable to attend and wishes to transfer or sell their seat to another student, BOTH parties MUST submit the official Allocation Transfer Pre-Approval Application at resolvemun.in/transfer and receive written Secretariat approval BEFORE exchanging money or attempting any handover.",
          "Any private, unapproved resale or name-swap conducted without prior Secretariat approval automatically VOIDS both the seller’s and buyer’s entry pass with ZERO refund and denial of entry at the venue gate.",
          "Resolve MUN 2.0 does not mediate, guarantee, or assume liability for private monetary settlements between a transferring delegate and an incoming delegate.",
        ],
      },
      {
        num: "04",
        title: "Committee Allocation, Attendance & Awards Eligibility",
        clauses: [
          "Committee and portfolio preferences submitted during registration are indicative only and do not guarantee a specific allotment. All allocation decisions by the Secretariat are final and binding.",
          "Delegates are permitted a maximum of one (1) preference edit prior to allotment through their Delegate Dashboard. Requests for post-allotment changes are not guaranteed.",
          "Full attendance across all committee sessions, opening ceremony, and closing ceremony on 26–27 December 2026 is mandatory. Unexplained absences or leaving campus without written parental and Secretariat clearance may disqualify a Delegate from awards and participation certificates.",
          "Executive Board (EB) judging and award decisions (Best Delegate, High Commendation, Special Mention, Verbal/Honourable Mention, and Best School Delegation) are final and non-contestable.",
        ],
      },
      {
        num: "05",
        title: "Code of Conduct, Decorum & Academic Integrity",
        clauses: [
          "Delegates must uphold strict diplomatic decorum, Western/Indian formal dress code (as specified in the Conference Handbook), and respectful conduct toward fellow delegates, Executive Board members, Secretariat, OC volunteers, faculty advisors, and Northfield International School staff.",
          "Harassment, bullying, hate speech, discrimination, verbal abuse, physical altercation, or intimidation—whether in person or on conference WhatsApp/Instagram groups—will trigger immediate expulsion without refund and formal notification to the Delegate’s school and parent/guardian.",
          "Plagiarism, pre-written resolutions copied from external sources, or unauthorized use of AI/electronic devices during restricted debate sessions is strictly forbidden and will lead to disqualification.",
        ],
      },
      {
        num: "06",
        title: "Zero-Tolerance Contraband, Campus Safety & Property Liability",
        clauses: [
          "Alcohol, cigarettes, vapes, e-cigarettes, lighters, narcotics, sharp objects, weapons, fireworks, or any illegal/hazardous items are strictly banned on campus and inside school buses. Possession results in immediate expulsion, confiscation, parental notification, and zero refund.",
          "Delegates are strictly prohibited from leaving the Northfield International School campus during conference hours without verified parent/guardian authorization logged with the Secretariat security desk.",
          "Delegates and their parents/guardians bear full financial liability for any intentional or negligent damage caused to school classrooms, smart boards, auditorium equipment, furniture, or conference installations.",
          "Resolve MUN 2.0, its Founders, Secretariat, and Northfield International School are not responsible for lost, stolen, or damaged phones, laptops, wallets, or personal belongings.",
        ],
      },
      {
        num: "07",
        title: "Mandatory Liability Waiver, Media Consent & Secretariat Finality",
        clauses: [
          "Submission of the signed Participant Liability Waiver & Code of Conduct (resolvemun.in/liability) is mandatory for every participant prior to or during registration check-in.",
          "By attending Resolve MUN 2.0 (including Socials Night produced with JMediaFactory), participants grant Resolve MUN irrevocable permission to capture and publish photographs, reels, and videos for official archives, press, and promotional media.",
          "The Founders and Secretariat reserve the right to amend conference schedules, committee caps, or operational guidelines at any time to preserve delegate safety and conference integrity.",
        ],
      },
    ],
  },

  refunds: {
    eyebrow: "IRONCLAD NO-REFUND & MANDATORY PRE-APPROVAL TRANSFER PROTOCOL",
    title: "Strict No-Refund & Allocation Transfer Policy",
    preamble:
      "Resolve MUN 2.0 locks venue contracts, delegate kits, catering, production (JMediaFactory Socials Night), transport fleets, and awards well in advance based on confirmed headcounts. Accordingly, all payments are 100% final and non-refundable. Delegates unable to attend may only seek a supervised seat transfer through our mandatory pre-approval portal.",
    sections: [
      {
        num: "01",
        title: "Absolute No-Refund Policy (Zero Exceptions)",
        clauses: [
          "All fees paid toward Resolve MUN 2.0—including Individual Delegate passes (₹2,500 or referral-discounted rates), Acquired Lumen MUN transfers, School/Institutional Delegations (15+), Organizing Committee (OC) plans (₹1,500 / ₹1,000 / ₹750), and Socials Night passes—are strictly NON-REFUNDABLE once paid.",
          "Refunds will NOT be processed for scheduling conflicts, school/board examinations, illness, personal emergencies, change of mind, committee/portfolio dissatisfaction, transport opt-outs, or failure to attend.",
          "Delegates expelled for violating the Code of Conduct, contraband rules, or campus safety policies forfeit all fees immediately with zero recourse.",
          "Referral discounts (Secretariat/OC codes) and RES Points stall credits have no cash-redemption value for delegates and cannot be converted into partial refunds after registration.",
        ],
      },
      {
        num: "02",
        title: "Mandatory Pre-Approval Before Selling or Transferring an Allocation",
        clauses: [
          "No Delegate may privately sell, trade, gift, or hand over their Resolve MUN 2.0 pass or committee allocation to another person without PRIOR WRITTEN APPROVAL from the Secretariat.",
          "To request a transfer, the current pass holder MUST submit the official Allocation Transfer Application at resolvemun.in/transfer BEFORE finalizing any deal, selecting their exact Mode of Registration (Individual Delegate, Acquired Lumen MUN, Delegation, or OC) and providing complete incoming delegate + parent emergency details.",
          "Upon submission, both the Seller and Buyer receive a “Pending Secretariat Approval” email. Do NOT exchange money until you receive an official “Allocation Transfer APPROVED” email from no-reply@resolvemun.in.",
          "Once approved, the Secretariat deactivates the original holder’s Gate Pass QR and issues a new credential to the incoming delegate. Committee/portfolio reassignment remains at the Secretariat’s discretion depending on matrix availability.",
        ],
      },
      {
        num: "03",
        title: "Penalty for Unauthorized Resale & Registration-Mode Differences",
        clauses: [
          "Any delegate caught selling or transferring a pass informally (e.g., via WhatsApp/Instagram DMs without an approved RM-TRF-XXXX request) will have the pass IMMEDIATELY VOIDED at the gate—neither the seller nor the buyer will be admitted, and no refund will be issued.",
          "Different registration modes carry distinct transfer conditions: Acquired Lumen MUN passes do NOT include bus transport and cannot be upgraded to transport upon transfer; Institutional Delegation seats require Faculty Advisor / Head Delegate written sign-off; OC transfers require Department Head clearance.",
          "Transfer applications must be submitted at least 72 hours prior to Day 1 (on or before 23 December 2026) so security rosters, ID badges, and committee matrices can be updated accurately.",
        ],
      },
    ],
  },

  lumen: {
    eyebrow: "SPECIAL TERMS FOR ACQUIRED LUMEN MUN DELEGATES",
    title: "Acquired Lumen MUN Delegate Policy",
    preamble:
      "Resolve MUN 2.0 is pleased to honor verified registrations from Lumen MUN under a dedicated transfer pathway (resolvemun.in/lumen). Because Lumen MUN passes were originally issued under separate fee structures, the following specific terms govern all Acquired Lumen MUN delegates.",
    sections: [
      {
        num: "01",
        title: "Eligibility & Proof Verification",
        clauses: [
          "Every Acquired Lumen MUN delegate must complete onboarding via resolvemun.in/lumen, providing accurate personal details, Parent/Guardian Name & Emergency Phone (distinct from their own number), Top 3 Committee Preferences, and their original Lumen MUN payment UTR + transaction screenshot.",
          "Passes remain in PENDING_VERIFICATION until our Secretariat audits the uploaded Lumen transaction screenshot and approves the transfer in the Admin Console.",
          "Submitting forged, duplicate, or unverifiable transaction proofs will result in immediate rejection and permanent disqualification.",
        ],
      },
      {
        num: "02",
        title: "Transport Exclusion & Conference Inclusions",
        clauses: [
          "Acquired Lumen MUN transfer passes include full 2-day conference access (26–27 December 2026), committee sessions, delegate kit, on-campus lunch on both days, participation certificate, and Socials Night access.",
          "IMPORTANT: Northfield International School bus transport is NOT included in the Acquired Lumen MUN transfer pass. Lumen delegates are responsible for their own commute to and from Northfield International School, Kompally, Hyderabad.",
        ],
      },
      {
        num: "03",
        title: "No Refunds & Transfer Rules for Lumen Delegates",
        clauses: [
          "Acquired Lumen MUN passes are strictly NON-REFUNDABLE by Resolve MUN 2.0 under all circumstances.",
          "If a verified Lumen delegate cannot attend and wishes to transfer their seat to another student, they MUST apply via resolvemun.in/transfer and explicitly select “Acquired Lumen MUN Delegate” as their Mode of Registration.",
          "Any approved transfer of a Lumen pass strictly inherits the Lumen non-transport status—the incoming delegate will NOT receive bus transport, and the Secretariat reserves full discretion to approve or decline the transfer.",
        ],
      },
    ],
  },

  oc: {
    eyebrow: "ORGANIZING COMMITTEE (OC) & SECRETARIAT GOVERNANCE",
    title: "OC & Secretariat Terms & Referral Policy",
    preamble:
      "These terms apply to all appointed Organizing Committee (OC) members and Secretariat officeholders of Resolve MUN 2.0.",
    sections: [
      {
        num: "01",
        title: "Appointment, Attendance & Execution Standards",
        clauses: [
          "OC and Secretariat positions are confirmed solely upon official Admin approval on resolvemun.in/oc or resolvemun.in/secretariat. Submitting a form does not finalize appointment.",
          "Members must attend all mandatory briefings, pre-conference setup rehearsals, and full operational hours on 26–27 December 2026. Unexcused absenteeism or dereliction of duty will result in removal without certificate, payout, or fee refund.",
          "All OC fee plans (₹1,500 Full Plan with Transport, ₹1,000 No Transport, ₹750 Basic Plan, or approved Exempt) are strictly non-refundable once verified.",
        ],
      },
      {
        num: "02",
        title: "₹400 Referral & Cash Commission Engine Rules",
        clauses: [
          "Approved Secretariat and OC members receive access to a ₹400 pool per verified Individual Delegate registration (against the ₹2,500 base fee) using their custom code.",
          "Members may choose any delegate discount between ₹0 and ₹400; the remaining balance (₹400 minus discount) accrues as their cash commission ONLY after the referred delegate’s payment UTR is verified by Admin.",
          "Self-referrals, fake signups, poached delegates already registered without a code, or unauthorized discounting outside the portal are strictly prohibited and forfeit all accrued commissions.",
          "Verified cash commissions are audited and settled via the member’s registered UPI ID following conference financial reconciliation.",
        ],
      },
      {
        num: "03",
        title: "Confidentiality & Internal Portal Security",
        clauses: [
          "Internal portals (/secretariat, /oc, /lumen, /scan, /admin), delegate contact lists, payment proofs, and allotment matrices are strictly confidential. Sharing internal links, spreadsheets, or delegate data with outsiders results in immediate dismissal.",
        ],
      },
    ],
  },

  privacy: {
    eyebrow: "DATA PROTECTION & PARTICIPANT PRIVACY",
    title: "Privacy & Data Protection Policy",
    preamble:
      "Resolve MUN 2.0 respects participant privacy and collects only the information necessary to run a safe, verified, and well-organized conference.",
    sections: [
      {
        num: "01",
        title: "Information We Collect",
        clauses: [
          "We collect participant full name, email address, WhatsApp phone number, school/institution, grade, date of birth, residential address (for transport routing), committee preferences, and UPI transaction verification details (UTR & screenshot).",
          "We also require a Parent/Guardian Name and Emergency Phone Number (distinct from the participant’s own number) strictly for campus safety, medical emergencies, and gate exit authorization.",
        ],
      },
      {
        num: "02",
        title: "How We Use & Protect Your Data",
        clauses: [
          "Data is stored securely on encrypted cloud infrastructure (Supabase & Firebase Auth) and accessed exclusively by authorized Secretariat administrators for payment verification, committee allotments, QR gate check-in, and official email notifications via no-reply@resolvemun.in.",
          "We NEVER sell, rent, or trade participant or parent contact information to third-party marketers or external advertisers.",
          "Transactional emails (registration receipts, verification updates, allotments, transfer decisions, and referral alerts) are dispatched automatically with CC to resolve.mun@gmail.com for audit integrity.",
        ],
      },
      {
        num: "03",
        title: "Your Rights & Account Deletion",
        clauses: [
          "Delegates may review or update their profile details on resolvemun.in/dashboard or permanently delete their account and associated records using the self-serve deletion workflow (or by emailing resolve.mun@gmail.com).",
          "Note that deleting an account after paying registration fees does not entitle the participant to a refund under our strict No-Refund Policy.",
        ],
      },
    ],
  },
};

function TermsContent() {
  const searchParams = useSearchParams();
  const rawTab = (searchParams.get("tab") || "delegate").toLowerCase();
  const validTab = TABS.some((t) => t.id === rawTab) ? rawTab : "delegate";
  const [tab, setTab] = useState(validTab);

  useEffect(() => {
    const t = (searchParams.get("tab") || "").toLowerCase();
    if (TABS.some((item) => item.id === t)) setTab(t);
  }, [searchParams]);

  const current = POLICY_CONTENT[tab] || POLICY_CONTENT.delegate;

  return (
    <div className="min-h-screen bg-black text-white font-sans flex flex-col justify-between antialiased selection:bg-white selection:text-black">
      {/* Resend-inspired Minimal Top Bar */}
      <header className="sticky top-0 z-40 h-14 border-b border-[#1c1c20] bg-black/90 backdrop-blur-md">
        <div className="max-w-4xl h-full mx-auto px-4 sm:px-6 flex items-center justify-between gap-3">
          <Link href="/" className="flex items-center gap-2 !no-underline shrink-0">
            <img src="/images/Logo.svg" alt="Resolve MUN" className="w-5 h-5 object-contain" />
            <span
              className="text-base tracking-[0.12em] text-white font-bold pt-0.5"
              style={{ fontFamily: "'Bebas Neue', sans-serif" }}
            >
              RESOLVE MUN 2.0
            </span>
            <span className="text-zinc-600 text-xs hidden sm:inline">/</span>
            <span className="text-zinc-400 text-xs font-medium hidden sm:inline">Legal &amp; Policies</span>
          </Link>
          <div className="flex items-center gap-2">
            <Link
              href="/transfer"
              className="h-8 px-3 rounded-md bg-white text-black text-xs font-semibold hover:bg-zinc-200 flex items-center gap-1.5 transition"
            >
              <ArrowRightLeft className="w-3.5 h-3.5" />
              <span>Transfer Allocation</span>
            </Link>
            <Link
              href="/brochure"
              className="h-8 px-3 rounded-md border border-[#222226] bg-[#0a0a0c] text-xs text-zinc-300 hover:text-white hover:border-zinc-600 hidden sm:flex items-center gap-1.5 transition"
            >
              <FileText className="w-3.5 h-3.5" />
              <span>Brochure</span>
            </Link>
          </div>
        </div>
      </header>

      <main className="flex-1 max-w-4xl w-full mx-auto px-4 sm:px-6 py-10 sm:py-12 space-y-8">
        {/* Clean Page Header */}
        <div className="space-y-2.5">
          <span className="block text-[11px] font-mono uppercase tracking-[0.18em] text-zinc-500">
            {current.eyebrow}
          </span>
          <h1 className="m-0 text-2xl sm:text-3xl font-semibold tracking-tight text-white">
            {current.title}
          </h1>
          <p className="m-0 text-xs sm:text-[13px] text-zinc-400 leading-relaxed max-w-2xl">
            Resolve MUN 2.0 · 26–27 December 2026 · Northfield International School, Kompally, Hyderabad.
          </p>
        </div>

        {/* Clean Resend-Style Pill Filter Row */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
          {TABS.map((item) => {
            const active = tab === item.id;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => setTab(item.id)}
                className={`h-8 px-3.5 rounded-md text-xs font-medium whitespace-nowrap transition cursor-pointer border ${
                  active
                    ? "bg-[#18181b] text-white border-[#2e2e34]"
                    : "bg-transparent text-zinc-400 border-transparent hover:text-white hover:bg-[#0d0d10]"
                }`}
              >
                {item.label}
              </button>
            );
          })}
        </div>

        {/* Prominent No-Refund & Mandatory Transfer Callout */}
        <div className="rounded-lg border border-red-500/25 bg-red-500/[0.04] p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-start gap-3">
            <AlertTriangle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
            <div className="space-y-1">
              <strong className="block text-xs font-semibold text-white">
                Strict Zero-Refund Policy &amp; Mandatory Pre-Approval for Allocation Transfers
              </strong>
              <p className="m-0 text-xs text-zinc-400 leading-relaxed">
                All Resolve MUN 2.0 fees are 100% non-refundable. Selling or transferring your allocation without prior written Secretariat approval voids the pass with zero refund.
              </p>
            </div>
          </div>
          <Link
            href="/transfer"
            className="h-9 px-3.5 rounded-md bg-white text-black text-xs font-semibold hover:bg-zinc-200 flex items-center justify-center gap-1.5 shrink-0 transition"
          >
            <span>Apply for Transfer</span>
            <ArrowRightLeft className="w-3.5 h-3.5" />
          </Link>
        </div>

        {/* Preamble Card */}
        <div className="rounded-lg border border-[#1c1c20] bg-[#08080a] p-5 text-[13px] text-zinc-300 leading-relaxed">
          {current.preamble}
        </div>

        {/* Policy Sections */}
        <div className="space-y-4">
          {current.sections.map((sec) => (
            <section
              key={sec.num}
              className="rounded-lg border border-[#1c1c20] bg-[#050507] p-5 sm:p-6 space-y-4"
            >
              <div className="flex items-center gap-3 pb-3 border-b border-[#16161a]">
                <span className="px-2 py-0.5 rounded bg-[#141418] border border-[#24242a] font-mono text-[11px] font-medium text-zinc-300">
                  {sec.num}
                </span>
                <h2 className="m-0 text-sm font-semibold tracking-tight text-white">
                  {sec.title}
                </h2>
              </div>
              <ol className="m-0 p-0 list-none space-y-3">
                {sec.clauses.map((clause, i) => (
                  <li key={i} className="flex items-start gap-3 text-[13px] text-zinc-300 leading-[1.7]">
                    <span className="font-mono text-[11px] text-zinc-600 mt-0.5 min-w-[24px]">
                      {sec.num}.{i + 1}
                    </span>
                    <span>{clause}</span>
                  </li>
                ))}
              </ol>
            </section>
          ))}
        </div>

        {/* Footer Quick Links */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-4 border-t border-[#1c1c20] text-xs text-zinc-500">
          <span>Official Secretariat Inquiries: resolve.mun@gmail.com</span>
          <div className="flex items-center gap-4">
            <Link href="/transfer" className="text-zinc-300 hover:text-white inline-flex items-center gap-1">
              <span>Allocation Transfer Form</span>
              <ExternalLink className="w-3 h-3" />
            </Link>
            <Link href="/liability" className="text-zinc-300 hover:text-white inline-flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Liability Waiver</span>
            </Link>
          </div>
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
