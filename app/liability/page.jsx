"use client";

import React from "react";
import Link from "next/link";
import { Printer, ArrowLeft } from "lucide-react";

export default function LiabilityWaiverPage() {
  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white font-sans selection:bg-blue-600 selection:text-white print:bg-white print:text-black">
      {/* Scoped overrides to prevent app/globals.css & app/mobile-flat.css from turning text white or inflating <section> spacing */}
      <style>{`
        #liability-sheet,
        #liability-sheet div,
        #liability-sheet p,
        #liability-sheet ul,
        #liability-sheet ol,
        #liability-sheet li,
        #liability-sheet span,
        #liability-sheet td,
        #liability-sheet th {
          color: #111827 !important;
          font-family: 'Inter', -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif !important;
          text-shadow: none !important;
        }
        #liability-sheet p,
        #liability-sheet ul,
        #liability-sheet li {
          margin-bottom: 0 !important;
          line-height: 1.55 !important;
          font-size: 13.5px !important;
        }
        #liability-sheet strong,
        #liability-sheet b {
          color: #000000 !important;
          font-weight: 700 !important;
        }
        #liability-sheet .lw-title {
          color: #2557a7 !important;
          font-family: 'Inter', -apple-system, sans-serif !important;
          font-weight: 800 !important;
          letter-spacing: 0.02em !important;
          line-height: 1.25 !important;
        }
        #liability-sheet .lw-heading {
          color: #2557a7 !important;
          font-family: 'Inter', -apple-system, sans-serif !important;
          font-weight: 800 !important;
          font-size: 15px !important;
          letter-spacing: 0.01em !important;
          line-height: 1.35 !important;
          margin: 0 0 6px 0 !important;
        }
        #liability-sheet .lw-subhead {
          color: #2557a7 !important;
          font-weight: 600 !important;
          font-size: 13px !important;
        }
        #liability-sheet .lw-danger,
        #liability-sheet .lw-danger * {
          color: #c81e1e !important;
          font-weight: 700 !important;
        }
        #liability-sheet .lw-muted {
          color: #6b7280 !important;
          font-size: 11px !important;
        }
        @media print {
          body {
            background: #ffffff !important;
          }
          #liability-sheet {
            box-shadow: none !important;
            border: none !important;
            padding: 0 !important;
            max-width: 100% !important;
          }
        }
      `}</style>

      {/* Top Action Bar (Hidden when printing to PDF) */}
      <header className="sticky top-0 z-40 h-13 border-b border-[#1f1f1f] bg-black/95 backdrop-blur-sm print:hidden">
        <div className="max-w-3xl h-full mx-auto px-4 sm:px-6 flex items-center justify-between gap-3">
          <Link
            href="/"
            className="flex items-center gap-2 text-xs text-zinc-300 hover:text-white !no-underline"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to Resolve MUN 2.0</span>
          </Link>

          <button
            type="button"
            onClick={() => typeof window !== "undefined" && window.print()}
            className="h-8 px-3.5 rounded-md bg-white text-black text-xs font-bold uppercase tracking-wider hover:bg-zinc-200 flex items-center gap-1.5 cursor-pointer"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>Print / Save as PDF</span>
          </button>
        </div>
      </header>

      {/* Printable Official Liability Waiver & Code of Conduct */}
      <main className="max-w-3xl mx-auto px-3 sm:px-6 py-6 sm:py-10 print:p-0">
        <div
          id="liability-sheet"
          className="rounded-md border border-zinc-300 bg-white p-6 sm:p-10 shadow-2xl space-y-5"
        >
          {/* Official Resolve MUN Banner Header */}
          <div className="-mx-6 sm:-mx-10 -mt-6 sm:-mt-10 mb-2 overflow-hidden rounded-t-md border-b border-zinc-200">
            <img
              src="/RESOLVE%20MUN.svg"
              alt="Resolve MUN — Resolve. Reform. Reconcile."
              className="w-full h-auto block object-cover"
            />
          </div>

          {/* Document Title & Conference Meta */}
          <div className="text-center space-y-1.5 pt-1 pb-2">
            <h1 className="lw-title text-xl sm:text-2xl uppercase m-0">
              PARTICIPANT LIABILITY WAIVER &amp; CODE OF CONDUCT
            </h1>
            <p className="m-0">
              <strong>Dates:</strong> 26th - 27th December 2026 &nbsp;&bull;&nbsp;{" "}
              <strong>Venue:</strong> Northfield International School, Kompally, Hyderabad
            </p>
          </div>

          {/* Agreement Acknowledgment */}
          <div>
            <h2 className="lw-heading uppercase">AGREEMENT ACKNOWLEDGMENT</h2>
            <p>
              By participating in Resolve Model United Nations 2.0 (&ldquo;Resolve MUN&rdquo;), you (the Delegate / Participant) and your parent/guardian agree to comply with ALL terms, conditions, and rules outlined in this Liability Waiver and Code of Conduct. Non-compliance with ANY clause will result in IMMEDIATE TERMINATION of participation and exclusion from all Resolve MUN events, including Committee Sessions and the Social Night, without refund.
            </p>
          </div>

          {/* 1. Personal Responsibility for Lost Items & Tech Devices */}
          <div>
            <h2 className="lw-heading uppercase">
              1. PERSONAL RESPONSIBILITY FOR LOST ITEMS &amp; TECHNOLOGY
            </h2>
            <p>
              Delegates are SOLELY and FULLY RESPONSIBLE for all personal belongings and electronic devices brought to Resolve MUN events. This includes but is not limited to: laptops, tablets, mobile phones, chargers, adapters, power banks, bags, wallets, and accessories.
            </p>
            <ul className="list-disc pl-5 mt-1.5 space-y-1">
              <li>
                <strong>No Liability for Devices &amp; Valuables:</strong> Resolve MUN, its Secretariat, and Northfield International School assume NO LIABILITY for lost, stolen, damaged, or misplaced devices or personal items under any circumstances. Delegates participate at their own risk and accept complete responsibility for the safekeeping of their belongings.
              </li>
              <li>
                <strong>Acceptable Tech, Wi-Fi &amp; AI Policy:</strong> Electronic devices may only be used during permitted session intervals as directed by the Executive Board. Unauthorized use of generative AI tools where prohibited, cyber-harassment, unauthorized audio/video recording of participants, or tampering with campus smartboards, AV systems, or networks will result in immediate disqualification.
              </li>
              <li>
                <strong>Mandatory Digital QR Pass:</strong> Every participant must carry their official Resolve MUN 2.0 QR Pass (on phone or printed) along with a valid institution ID card at all times for verification at the Entry Gate and Bus Boarding checkpoints.
              </li>
            </ul>
          </div>

          {/* 2. Mandatory Respectful Conduct & Immediate Termination */}
          <div>
            <h2 className="lw-heading uppercase">
              2. MANDATORY RESPECTFUL CONDUCT &amp; IMMEDIATE TERMINATION
            </h2>
            <p>
              Delegates MUST act respectfully toward ALL individuals at all times, including fellow delegates, Executive Board members, Secretariat &amp; Organizing Committee (OC) members, volunteers, guests, and venue staff. Respectful conduct includes appropriate parliamentary language, courteous behavior, professional diplomatic demeanor, and consideration of others. ANY instance of disrespect, harassment, bullying, intimidation, or aggressive behavior will result in IMMEDIATE AND PERMANENT TERMINATION from Resolve MUN and exclusion from all current and future events.
            </p>
          </div>

          {/* 3. Transportation, Bus Boarding & Commute Protocol */}
          <div>
            <h2 className="lw-heading uppercase">
              3. TRANSPORTATION, BUS BOARDING &amp; COMMUTE PROTOCOL
            </h2>
            <p>
              Official conference transport operates exclusively along designated routes across Hyderabad to Northfield International School, Kompally, and back:
            </p>
            <ul className="list-disc pl-5 mt-1.5 space-y-1">
              <li>
                <strong>Mandatory Bus QR Boarding Pass:</strong> Only delegates and OC members who have registered for official transport and hold a Transport-Enabled QR Pass are permitted to board conference buses. Self-commute participants and transferred Lumen MUN delegates are not eligible for conference bus boarding and are responsible for their own commute.
              </li>
              <li>
                <strong>Strict Departure Schedules:</strong> Buses depart strictly on schedule from designated stops. Resolve MUN is not responsible for participants who miss a bus due to late arrival, nor is it liable for external traffic delays.
              </li>
              <li>
                <strong>Bus Discipline &amp; Safety:</strong> All conference conduct rules apply inside buses. Standing while the vehicle is in motion, damaging bus interiors, or disobeying transport coordinators/drivers will result in immediate revocation of transport access.
              </li>
            </ul>
          </div>

          {/* 4. Strict Compliance with POCSO Guidelines & Venue Property */}
          <div>
            <h2 className="lw-heading uppercase">
              4. STRICT COMPLIANCE WITH POCSO GUIDELINES &amp; VENUE PROPERTY
            </h2>
            <p>
              Delegates agree to comply with all guidelines set forth under the Protection of Children from Sexual Offences (POCSO) Act and applicable child safety protocols. Any conduct that violates child protection laws, creates an unsafe environment for minors, or compromises the well-being of any participant will result in IMMEDIATE TERMINATION and legal action. Furthermore, any participant causing damage to Northfield International School property, furniture, or equipment shall bear the full cost of repair or replacement.
            </p>
          </div>

          {/* 5. Strictly Prohibited Items */}
          <div>
            <h2 className="lw-heading uppercase">5. STRICTLY PROHIBITED ITEMS</h2>
            <p>The following items are STRICTLY FORBIDDEN at all Resolve MUN events and inside conference buses:</p>
            <ul className="list-disc pl-5 mt-1.5 mb-1.5 space-y-0.5">
              <li>E-cigarettes, vapes, tobacco products, cigarettes, lighters, or matchboxes</li>
              <li>Alcoholic beverages (including all types of alcohol) and illegal or unprescribed substances</li>
              <li>Outside food items, snacks, or unauthorized beverages inside committee chambers</li>
              <li>Perfumes, aerosols, or strong-scented sprays</li>
              <li>Sharp objects (including knives, blades, scissors, razors, or anything with a sharp edge)</li>
            </ul>
            <p>
              Delegates found with ANY prohibited items will face immediate confiscation of the item(s) and PERMANENT TERMINATION from Resolve MUN. Organizers reserve the right to conduct inspections of bags and personal items at the gate.
            </p>
          </div>

          {/* 6. Medication Disclosure & Food Allergies */}
          <div>
            <h2 className="lw-heading uppercase">
              6. MEDICATION DISCLOSURE, ALLERGIES &amp; MEDICAL CERTIFICATION
            </h2>
            <p>
              Delegates requiring specific medications MUST declare them below and carry either: (a) a valid medical prescription from a licensed physician, OR (b) written parental authorization. Medications brought without prior declaration and documentation will be confiscated immediately. Delegates with documented food allergies who need to bring their own food must inform organizers prior to the event with medical proof and clearly label their food.
            </p>
          </div>

          {/* 7. Zero Tolerance for Violence & Strict Dress Code */}
          <div>
            <h2 className="lw-heading uppercase">
              7. ZERO TOLERANCE FOR VIOLENCE &amp; STRICT DRESS CODE COMPLIANCE
            </h2>
            <p>
              <strong>Zero Tolerance for Violence:</strong> Fighting, physical altercations, threats of violence, or any form of assault is ABSOLUTELY PROHIBITED and will result in IMMEDIATE TERMINATION and reporting to authorities.
              <br />
              <strong>Strict Dress Code:</strong> Delegates MUST adhere STRICTLY to the designated dress code (Western Business Formal, or Indian Formal for Lok Sabha) on all conference days. Failure to comply will result in non-admission or immediate termination.
            </p>
          </div>

          {/* 8. Critical Requirement: Mandatory Document Submission */}
          <div className="pt-1">
            <h2 className="lw-heading uppercase">
              8. CRITICAL REQUIREMENT: MANDATORY DOCUMENT SUBMISSION
            </h2>
            <p className="lw-danger">
              ATTENTION: Delegates MUST bring a SIGNED COPY of this Liability Waiver on Day 1 of the event (26th December 2026). Any delegate who fails to provide a properly signed copy at the Registration Desk will be DENIED ENTRY to the event and will be BARRED from attending the Conference. There are NO EXCEPTIONS to this requirement.
            </p>
            <p className="mt-1.5">
              All signatures (both delegate and parent/guardian, if applicable) must be present on the document. Delegates aged 18 and above may sign independently without parental signatures. Parental consent is REQUIRED ONLY for delegates who are BELOW 18 YEARS OF AGE.
            </p>
          </div>

          {/* Document Verification Checklist */}
          <div>
            <h2 className="lw-heading uppercase">DOCUMENT VERIFICATION CHECKLIST</h2>
            <ul className="list-disc pl-5 space-y-0.5">
              <li>Delegate name &amp; Registration ID (RM-XXXX) are clearly printed</li>
              <li>Delegate has signed the document</li>
              <li>Delegate&apos;s Date of Birth is filled in</li>
              <li>Parent/Guardian name is clearly printed (if delegate is below 18 years)</li>
              <li>Parent/Guardian has signed the document (if delegate is below 18 years)</li>
              <li>Both dates are filled in (as applicable)</li>
              <li>Special needs / medical section is completed (if applicable)</li>
            </ul>
          </div>

          {/* Signatures & Acknowledgment Table */}
          <div className="pt-1">
            <h2 className="lw-heading uppercase">SIGNATURES &amp; ACKNOWLEDGMENT</h2>

            <div className="border border-zinc-400 rounded-sm overflow-hidden mt-2">
              <div className="grid grid-cols-2 bg-zinc-50 border-b border-zinc-400">
                <div className="p-2.5 border-r border-zinc-400 lw-subhead">
                  Delegate Information (All Delegates)
                </div>
                <div className="p-2.5 lw-subhead">
                  Parent/Guardian Information (If under 18)
                </div>
              </div>

              <div className="grid grid-cols-2 border-b border-zinc-400">
                <div className="p-2.5 border-r border-zinc-400">
                  <strong>Name:</strong>
                </div>
                <div className="p-2.5">
                  <strong>Name:</strong>
                </div>
              </div>

              <div className="grid grid-cols-2 border-b border-zinc-400">
                <div className="p-2.5 border-r border-zinc-400">
                  <strong>Registration ID (RM-XXXX):</strong>
                </div>
                <div className="p-2.5">
                  <strong>Phone Number:</strong>
                </div>
              </div>

              <div className="grid grid-cols-2 border-b border-zinc-400">
                <div className="p-2.5 border-r border-zinc-400 h-14">
                  <strong>Signature:</strong>
                </div>
                <div className="p-2.5 h-14">
                  <strong>Signature:</strong>
                </div>
              </div>

              <div className="grid grid-cols-2 border-b border-zinc-400">
                <div className="p-2.5 border-r border-zinc-400">
                  <strong>Date of Birth:</strong>
                </div>
                <div className="p-2.5">
                  <strong>Transport Opted (Yes / No / Lumen):</strong>
                </div>
              </div>

              <div className="grid grid-cols-2">
                <div className="p-2.5 border-r border-zinc-400">
                  <strong>Date Signed:</strong>
                </div>
                <div className="p-2.5">
                  <strong>Date Signed:</strong>
                </div>
              </div>
            </div>
          </div>

          {/* Special Needs Disclosure */}
          <div className="pt-1">
            <h2 className="lw-heading uppercase">SPECIAL NEEDS &amp; MEDICAL DISCLOSURE</h2>
            <p className="mb-2">
              If the participant has any special needs, medical conditions, food allergies, prescribed medications, or requires any accommodations, please declare them below. This information is REQUIRED for us to ensure appropriate support and safety.
            </p>
            <div className="border border-zinc-400 rounded-sm overflow-hidden">
              <div className="bg-zinc-50 border-b border-zinc-400 px-2.5 py-2 lw-subhead">
                Special Needs / Medical Conditions / Accommodations Required (if any)
              </div>
              <div className="h-16 p-2.5"></div>
            </div>
          </div>

          {/* Compact Document Footer */}
          <div className="pt-3 border-t border-zinc-200 flex items-center justify-between">
            <span className="lw-muted">Resolve MUN 2.0 &bull; resolvemun.in</span>
            <span className="lw-muted">26th &ndash; 27th December 2026 &bull; Northfield International School</span>
          </div>
        </div>
      </main>
    </div>
  );
}
