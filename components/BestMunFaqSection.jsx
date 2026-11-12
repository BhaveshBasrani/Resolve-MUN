"use client";

import React, { useState } from "react";
import { ChevronDown, Sparkles } from "lucide-react";

const FAQ_ITEMS = [
  {
    q: "Why is Resolve MUN 2.0 rated the best MUN in Hyderabad?",
    a: "Resolve MUN is built from the ground up for delegates. It brings together 500+ students from top schools and colleges across India. With 6 top-tier committees, ₹2,50,000 in cash prizes, and experienced executive boards that genuinely help delegates speak and grow, Resolve is recognized as the best MUN in Hyderabad.",
  },
  {
    q: "When and where is Resolve MUN 2.0 taking place?",
    a: "Resolve MUN 2.0 happens on 25, 26, and 27 December 2026 in Hyderabad, India. The official venue will be announced soon (TBA) with complete travel, drop-off, and parking instructions.",
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
    a: "Resolve MUN 2.0 features a prize pool of ₹2,50,000 in cash across all committees, along with official Best Delegate, High Commendation, and Special Mention trophies, certificates, and letters of recommendation.",
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
      className="relative w-full max-w-4xl mx-auto px-4 sm:px-6 py-16 sm:py-24 z-10"
      aria-label="Frequently Asked Questions about Best MUN in Hyderabad"
    >
      {/* Header */}
      <div className="text-center mb-10 sm:mb-14">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/[0.04] border border-white/10 mb-3.5">
          <span className="font-mono text-[11px] uppercase tracking-wider text-zinc-300">
            Resolve MUN 2.0 &bull; FAQ
          </span>
        </div>
        <h2
          className="text-2xl sm:text-4xl font-extrabold text-white tracking-tight uppercase"
          style={{ fontFamily: "'Oswald', sans-serif" }}
        >
          Frequently Asked Questions
        </h2>
        <p className="text-xs sm:text-sm text-zinc-400 mt-2 max-w-xl mx-auto leading-relaxed">
          Clear answers about dates, committees, cash prizes, and registration for Resolve MUN 2.0.
        </p>
      </div>

      {/* Accordion */}
      <div className="space-y-3">
        {FAQ_ITEMS.map((item, idx) => {
          const isOpen = openIndex === idx;
          return (
            <div
              key={idx}
              className={`rounded-2xl border transition-all duration-200 overflow-hidden ${
                isOpen
                  ? "bg-zinc-950/80 border-white/25 shadow-[0_0_25px_rgba(0,0,0,0.6)]"
                  : "bg-zinc-950/40 border-white/10 hover:border-white/20"
              }`}
            >
              <button
                type="button"
                onClick={() => toggle(idx)}
                className="w-full px-5 py-4 sm:px-6 sm:py-4.5 text-left flex items-center justify-between gap-4 cursor-pointer focus:outline-none"
                aria-expanded={isOpen}
              >
                <span className="text-sm sm:text-base font-semibold text-white tracking-tight">
                  {item.q}
                </span>
                <span
                  className={`w-7 h-7 rounded-full bg-white/5 border border-white/10 flex items-center justify-center shrink-0 transition-transform duration-200 ${
                    isOpen ? "rotate-180 bg-white/10 text-white" : "text-zinc-400"
                  }`}
                >
                  <ChevronDown className="w-4 h-4" />
                </span>
              </button>

              {isOpen && (
                <div className="px-5 pb-5 sm:px-6 sm:pb-5 pt-0 text-xs sm:text-sm text-zinc-300 leading-relaxed border-t border-white/5 mt-1 animate-in fade-in-50 duration-200">
                  {item.a}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Bottom Trust Strip */}
      <div className="mt-8 text-center">
        <p className="text-[11px] text-zinc-500 font-mono">
          Have more questions? Contact our secretariat at{" "}
          <a
            href="mailto:resolve.mun@gmail.com"
            className="text-zinc-300 underline hover:text-white transition-colors"
          >
            resolve.mun@gmail.com
          </a>
        </p>
      </div>
    </section>
  );
}

