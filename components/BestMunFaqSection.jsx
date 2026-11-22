"use client";

import React, { useState } from "react";

const FAQ_ITEMS = [
  {
    q: "Why is Resolve MUN 2.0 rated the best MUN in Hyderabad?",
    a: "Resolve MUN is built from the ground up for delegates. It brings together 500+ students from top schools and colleges across India. With 6 top-tier committees, exciting cash prizes (Total CP: TBA, with ₹25,000 Delegation CP), and experienced executive boards that genuinely help delegates speak and grow, Resolve is recognized as the best MUN in Hyderabad.",
  },
  {
    q: "When and where is Resolve MUN 2.0 taking place?",
    a: "Resolve MUN 2.0 takes place on 26 and 27 December 2026 at Northfield International School (BMR Towers, H.No. 8-95/2, Devarayamjal Road, Kompally, Hyderabad, Telangana 500078).",
  },
  {
    q: "Is Resolve MUN 2.0 good for first-time beginners?",
    a: "Yes, 100%. Whether this is your first conference or your twentieth, you will feel supported. Every delegate receives a simple study guide, rules of procedure training, and fair, friendly executive boards who guide you step-by-step.",
  },
  {
    q: "Which committees are available at Resolve MUN 2.0?",
    a: "Resolve MUN 2.0 features 6 exciting committees: UNCSW (Women's Rights), UNHRC (Human Rights), DISEC (Security & Disarmament), International Press (Journalism & Photography), Lok Sabha (Indian Politics), and the Marvel Crisis Committee (Continuous Crisis).",
  },
  {
    q: "What are the cash prizes and delegate awards?",
    a: "The Total Cash Prize (Total CP) for Resolve MUN 2.0 will be announced soon (TBA) across all committees. A guaranteed ₹25,000 cash prize pool (Delegation CP) is reserved for the Best Delegation, along with official Best Delegate, High Commendation, and Special Mention trophies, certificates, and letters of recommendation.",
  },
  {
    q: "How do I register and get my delegate pass?",
    a: "Click 'Register' on resolvemun.in, select whether you are applying as a single delegate or school delegation, pick your committee preferences, and complete your registration. You will instantly get a digital pass with your reference ID and QR code.",
  },
];

export default function BestMunFaqSection() {
  const [openIndex, setOpenIndex] = useState(0);

  const toggle = (idx) => {
    setOpenIndex(openIndex === idx ? -1 : idx);
  };

  return (
    <section
      id="faq"
      className="relative w-full bg-black text-white py-14 sm:py-24 px-5 sm:px-6 border-t border-white/10 z-10"
      style={{ backgroundColor: "#000000" }}
      aria-label="Frequently Asked Questions about Resolve MUN 2.0"
    >
      <div className="max-w-3xl mx-auto">
        {/* Header — Matches all other site sections (.section-label + Oswald title) */}
        <div className="text-center mb-10 sm:mb-14">
          <div
            className="section-label"
            style={{ justifyContent: "center", margin: "0 auto 10px auto" }}
          >
            FAQ
          </div>
          <h2
            className="text-3xl sm:text-5xl font-extrabold text-white tracking-tight uppercase"
            style={{ fontFamily: "'Oswald', sans-serif" }}
          >
            Frequently Asked Questions
          </h2>
          <p className="text-xs sm:text-sm text-zinc-400 mt-2.5 max-w-lg mx-auto leading-relaxed">
            Dates, venue, committees, prizes, and registration for Resolve MUN 2.0.
          </p>
        </div>

        {/* Minimal Editorial Hairline Accordion */}
        <div className="border-t border-white/15 divide-y divide-white/15">
          {FAQ_ITEMS.map((item, idx) => {
            const isOpen = openIndex === idx;
            const num = String(idx + 1).padStart(2, "0");
            return (
              <div key={idx} className="bg-black">
                <button
                  type="button"
                  onClick={() => toggle(idx)}
                  className="w-full py-5 sm:py-6 text-left flex items-center justify-between gap-4 cursor-pointer focus:outline-none group"
                  aria-expanded={isOpen}
                >
                  <div className="flex items-baseline gap-3.5 sm:gap-5 min-w-0">
                    <span className="font-mono text-[11px] text-zinc-500 shrink-0 tabular-nums">
                      {num}
                    </span>
                    <span
                      className={`text-sm sm:text-base font-medium tracking-tight leading-snug ${
                        isOpen ? "text-white" : "text-zinc-200 group-hover:text-white"
                      }`}
                    >
                      {item.q}
                    </span>
                  </div>
                  <span
                    className="font-mono text-lg leading-none text-zinc-400 group-hover:text-white shrink-0 w-6 text-right select-none"
                    aria-hidden="true"
                  >
                    {isOpen ? "−" : "+"}
                  </span>
                </button>

                {isOpen && (
                  <div className="pb-6 pl-7 sm:pl-10 pr-6 text-xs sm:text-sm text-zinc-400 leading-relaxed">
                    {item.a}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Minimal Contact Line */}
        <div className="mt-8 text-center">
          <p className="text-xs text-zinc-500">
            More questions? Email{" "}
            <a
              href="mailto:resolve.mun@gmail.com"
              className="text-zinc-200 underline underline-offset-4 hover:text-white"
            >
              resolve.mun@gmail.com
            </a>
          </p>
        </div>
      </div>
    </section>
  );
}
