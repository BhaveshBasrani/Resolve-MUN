"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { printOfficialReceipt } from "@/lib/receiptGenerator";

const CheckCircleIcon = (props) => (
  <svg
    {...props}
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
    <polyline points="22 4 12 14.01 9 11.01" />
  </svg>
);

const CloseIcon = (props) => (
  <svg
    {...props}
    xmlns="http://www.w3.org/2000/svg"
    width="20"
    height="20"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <line x1="18" y1="6" x2="6" y2="18" />
    <line x1="6" y1="6" x2="18" y2="18" />
  </svg>
);

const UpiBadgeIcon = (props) => (
  <svg
    {...props}
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 44 24"
    width="44"
    height="24"
    fill="none"
  >
    <rect
      x="0.75"
      y="0.75"
      width="42.5"
      height="22.5"
      rx="5.25"
      fill="#111111"
      stroke="rgba(255,255,255,0.28)"
      strokeWidth="1.5"
    />
    <text
      x="19"
      y="15.5"
      fill="#FFFFFF"
      fontSize="10"
      fontWeight="800"
      fontFamily="monospace"
      textAnchor="middle"
      letterSpacing="0.06em"
    >
      UPI
    </text>
    <path
      d="M33 7L37 12L33 17"
      stroke="#10B981"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

const DashedLine = () => (
  <div
    className="w-full border-t-2 border-dashed border-white/15"
    aria-hidden="true"
  />
);

const Barcode = ({ value }) => {
  const hashCode = (s) =>
    String(s || "RESOLVE2026")
      .split("")
      .reduce((a, b) => {
        a = (a << 5) - a + b.charCodeAt(0);
        return a & a;
      }, 0);
  const seed = hashCode(value);
  const random = (s) => {
    const x = Math.sin(s) * 10000;
    return x - Math.floor(x);
  };

  const bars = Array.from({ length: 60 }).map((_, index) => {
    const rand = random(seed + index);
    const width = rand > 0.7 ? 2.5 : 1.5;
    return { width };
  });

  const spacing = 1.5;
  const totalWidth =
    bars.reduce((acc, bar) => acc + bar.width + spacing, 0) - spacing;
  const svgWidth = 250;
  const svgHeight = 44;
  let currentX = (svgWidth - totalWidth) / 2;

  return (
    <div className="flex flex-col items-center py-1">
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width={svgWidth}
        height={svgHeight}
        viewBox={`0 0 ${svgWidth} ${svgHeight}`}
        aria-label={`Barcode for value ${value}`}
        className="fill-current text-white max-w-full"
      >
        {bars.map((bar, index) => {
          const x = currentX;
          currentX += bar.width + spacing;
          return (
            <rect
              key={index}
              x={x}
              y="4"
              width={bar.width}
              height="36"
            />
          );
        })}
      </svg>
      <p className="text-[11px] text-white/55 tracking-[0.22em] mt-0.5 font-mono">
        {value}
      </p>
    </div>
  );
};

const ConfettiExplosion = () => {
  const confettiCount = 70;
  const colors = [
    "#ffffff",
    "#10b981",
    "#e5e7eb",
    "#a1a1aa",
    "#34d399",
    "#f4f4f5",
  ];

  return (
    <>
      <style>
        {`
          @keyframes fall {
            0% {
                transform: translateY(-10vh) rotate(0deg);
                opacity: 1;
            }
            100% {
              transform: translateY(105vh) rotate(720deg);
              opacity: 0;
            }
          }
        `}
      </style>
      <div
        className="fixed inset-0 z-0 pointer-events-none overflow-hidden"
        aria-hidden="true"
      >
        {Array.from({ length: confettiCount }).map((_, i) => (
          <div
            key={i}
            className="absolute w-2 h-3.5 rounded-xs"
            style={{
              left: `${(i * 17) % 100}%`,
              top: `${-15 + ((i * 7) % 15)}%`,
              backgroundColor: colors[i % colors.length],
              transform: `rotate(${(i * 43) % 360}deg)`,
              animation: `fall ${2.4 + ((i * 3) % 2)}s ${
                ((i * 11) % 15) * 0.1
              }s linear forwards`,
            }}
          />
        ))}
      </div>
    </>
  );
};

export const AnimatedTicket = React.forwardRef(
  (
    {
      className,
      ticketId,
      amount,
      date,
      cardHolder,
      utrNumber,
      passCategory = "Delegate Pass",
      barcodeValue,
      title = "Registration Recorded!",
      subtitle = "Your application & UPI transaction have been logged.",
      ...props
    },
    ref
  ) => {
    const [showConfetti, setShowConfetti] = React.useState(false);

    React.useEffect(() => {
      if (typeof window !== "undefined" && window.innerWidth <= 768) return;
      const mountTimer = setTimeout(() => setShowConfetti(true), 100);
      const unmountTimer = setTimeout(() => setShowConfetti(false), 5500);
      return () => {
        clearTimeout(mountTimer);
        clearTimeout(unmountTimer);
      };
    }, []);

    const formattedAmount =
      typeof amount === "number" && amount > 0
        ? new Intl.NumberFormat("en-IN", {
            style: "currency",
            currency: "INR",
            maximumFractionDigits: 0,
          }).format(amount)
        : "FREE / WAIVED";

    const formattedDate = new Intl.DateTimeFormat("en-IN", {
      day: "numeric",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    })
      .format(date || new Date())
      .replace(",", " ·");

    return (
      <>
        {showConfetti && <ConfettiExplosion />}
        <div
          ref={ref}
          className={cn(
            "relative w-full max-w-sm bg-[#080808] text-white rounded-xl font-sans z-10 border border-[#262626] overflow-hidden",
            className
          )}
          style={{ fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, sans-serif" }}
          {...props}
        >
          {/* Header */}
          <div className="px-5 pt-6 pb-4 flex flex-col items-center text-center">
            <div className="w-11 h-11 rounded-full bg-white text-black flex items-center justify-center mb-3">
              <CheckCircleIcon className="w-6 h-6 text-black" />
            </div>
            <h2
              className="m-0 text-lg font-bold text-white tracking-tight leading-snug"
              style={{ fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, sans-serif" }}
            >
              {title}
            </h2>
            <p className="m-0 text-xs text-zinc-400 mt-1 max-w-[260px] leading-relaxed">
              {subtitle}
            </p>
          </div>

          <div className="px-5 pb-5 space-y-4">
            <div className="border-t border-dashed border-[#262626]" />

            {/* Row 1: Reference ID & Amount */}
            <div className="grid grid-cols-2 gap-3 text-left items-end">
              <div className="min-w-0">
                <p className="m-0 text-[10px] text-zinc-500 uppercase tracking-widest font-mono leading-none">
                  Reference ID
                </p>
                <p className="m-0 font-mono font-semibold text-xs text-white mt-1.5 truncate leading-none">
                  {ticketId}
                </p>
              </div>
              <div className="text-right min-w-0">
                <p className="m-0 text-[10px] text-zinc-500 uppercase tracking-widest font-mono leading-none">
                  Amount Paid
                </p>
                <p className="m-0 font-bold text-base text-white mt-1.5 leading-none">
                  {formattedAmount}
                </p>
              </div>
            </div>

            {/* Row 2: Date & Category */}
            <div className="grid grid-cols-2 gap-3 text-left items-end">
              <div className="min-w-0">
                <p className="m-0 text-[10px] text-zinc-500 uppercase tracking-widest font-mono leading-none">
                  Date &amp; Time
                </p>
                <p className="m-0 text-xs font-medium text-zinc-200 mt-1.5 leading-snug">
                  {formattedDate}
                </p>
              </div>
              <div className="text-right min-w-0">
                <p className="m-0 text-[10px] text-zinc-500 uppercase tracking-widest font-mono leading-none">
                  Pass Category
                </p>
                <p className="m-0 text-xs font-semibold text-white mt-1.5 leading-snug">
                  {passCategory}
                </p>
              </div>
            </div>

            {/* Applicant & UPI UTR strip */}
            <div className="bg-black border border-[#262626] px-3.5 py-2.5 rounded-lg flex items-center gap-3 text-left">
              <UpiBadgeIcon className="shrink-0" />
              <div className="min-w-0 flex-1">
                <p className="m-0 font-semibold text-xs text-white truncate leading-tight">
                  {cardHolder}
                </p>
                <p className="m-0 text-zinc-400 font-mono text-[11px] tracking-wide truncate mt-1 leading-tight">
                  {utrNumber ? `UPI UTR: ${utrNumber}` : "Verified Application"}
                </p>
              </div>
            </div>

            <div className="border-t border-dashed border-[#262626]" />

            <Barcode value={barcodeValue || ticketId} />
          </div>
        </div>
      </>
    );
  }
);
AnimatedTicket.displayName = "AnimatedTicket";

export function PaymentReceiptModal() {
  const [receipt, setReceipt] = React.useState(null);

  React.useEffect(() => {
    if (typeof window === "undefined") return;
    window.showPaymentReceiptModal = (data) => {
      setReceipt({
        ticketId: data?.ticketId || `RMUN-${String(Date.now()).slice(-8)}`,
        amount: typeof data?.amount === "number" ? data.amount : Number(data?.amount || 0),
        date: data?.date ? new Date(data.date) : new Date(),
        cardHolder: data?.cardHolder || "Registered Applicant",
        utrNumber: data?.utrNumber || "",
        passCategory: data?.passCategory || "Delegate Pass",
        barcodeValue:
          data?.barcodeValue ||
          data?.utrNumber ||
          data?.ticketId ||
          `RMUN${String(Date.now()).slice(-8)}`,
        onContinue: data?.onContinue || null,
      });
    };
    return () => {
      delete window.showPaymentReceiptModal;
    };
  }, []);

  if (!receipt) return null;

  const handleContinue = () => {
    const cb = receipt.onContinue;
    setReceipt(null);
    if (typeof cb === "function") {
      cb();
    } else if (typeof window !== "undefined") {
      window.location.href = "/dashboard";
    }
  };

  return (
    <>
      {/* SCREEN-ONLY MODAL (HIDDEN ON PRINT) */}
      <div className="no-print fixed inset-0 z-[10005] bg-black overflow-y-auto overscroll-contain">
        {/* Clean Close Button */}
        <button
          type="button"
          onClick={handleContinue}
          className="fixed top-4 right-4 z-[10010] w-9 h-9 rounded-lg bg-black border border-[#262626] text-zinc-400 hover:text-white flex items-center justify-center cursor-pointer"
          aria-label="Close pass dialog"
        >
          <CloseIcon />
        </button>

        {/* Scrollable Centered Receipt Wrapper */}
        <div className="min-h-full w-full flex flex-col items-center justify-center px-4 pt-16 pb-10">
          <div className="w-full max-w-[360px] sm:max-w-sm flex flex-col items-center">
            <AnimatedTicket
              ticketId={receipt.ticketId}
              amount={receipt.amount}
              date={receipt.date}
              cardHolder={receipt.cardHolder}
              utrNumber={receipt.utrNumber}
              passCategory={receipt.passCategory}
              barcodeValue={receipt.barcodeValue}
            />
            <div className="mt-3.5 grid grid-cols-2 gap-2.5 w-full z-20">
              <button
                type="button"
                onClick={() =>
                  printOfficialReceipt({
                    ticketId: receipt.ticketId,
                    cardHolder: receipt.cardHolder,
                    passCategory: receipt.passCategory,
                    amount: receipt.amount,
                    utrNumber: receipt.utrNumber,
                    date: receipt.date,
                    paymentStatus: "Recorded · Pending Verification",
                  })
                }
                className="h-11 px-3 rounded-lg border border-[#333333] bg-black text-white text-[11px] font-semibold uppercase tracking-wider cursor-pointer flex items-center justify-center"
              >
                Print E-Receipt
              </button>
              <button
                type="button"
                onClick={handleContinue}
                className="h-11 px-3 rounded-lg border border-white bg-white text-black text-[11px] font-bold uppercase tracking-wider cursor-pointer flex items-center justify-center"
              >
                Dashboard →
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* =========================================================================
          OFFICIAL EMBASSY-GRADE PRINTABLE RECEIPT / TAX INVOICE (SHOWN ONLY ON PRINT)
          ========================================================================= */}
      <div className="print-only w-full max-w-2xl mx-auto p-10 bg-white text-zinc-950 font-sans border-2 border-zinc-900 rounded-xl my-6">
        {/* Letterhead */}
        <div className="flex items-center justify-between border-b-2 border-zinc-900 pb-5">
          <div className="flex items-center gap-3">
            <img
              src="https://resolvemun.in/images/Logo.svg"
              alt="Resolve MUN Emblem"
              className="w-12 h-12 object-contain"
            />
            <div>
              <h1 className="text-xl font-black uppercase tracking-tight text-zinc-900 font-serif">
                RESOLVE MUN 2.0
              </h1>
              <p className="text-[10px] font-mono uppercase tracking-widest text-zinc-600">
                Official Registration Receipt &amp; Tax Invoice
              </p>
            </div>
          </div>
          <div className="text-right">
            <span className="inline-block px-3 py-1 bg-emerald-100 border border-emerald-600 text-emerald-800 text-[10px] font-mono font-bold uppercase rounded-md">
              ✓ Verified &amp; Confirmed
            </span>
            <p className="text-[11px] font-mono text-zinc-500 mt-1">
              Doc Ref: {receipt.ticketId}
            </p>
          </div>
        </div>

        {/* Metadata Grid */}
        <div className="grid grid-cols-2 gap-6 py-6 border-b border-zinc-200 text-xs">
          <div>
            <span className="text-[10px] font-mono uppercase tracking-wider text-zinc-500 block mb-1">
              Applicant Details
            </span>
            <p className="font-bold text-sm text-zinc-900">{receipt.cardHolder}</p>
            <p className="text-zinc-600 mt-0.5 font-mono">{receipt.passCategory || "Individual Delegate"}</p>
            <p className="text-zinc-500 text-[11px] mt-1">Convenes: 25, 26, 27 December 2026 • Hyderabad</p>
          </div>
          <div className="text-right">
            <span className="text-[10px] font-mono uppercase tracking-wider text-zinc-500 block mb-1">
              Transaction Details
            </span>
            <p className="font-mono text-zinc-800">
              <span className="text-zinc-500">Date: </span>
              {new Date(receipt.date).toLocaleDateString("en-IN", {
                day: "numeric",
                month: "short",
                year: "numeric",
              })}
            </p>
            <p className="font-mono text-zinc-800 mt-0.5">
              <span className="text-zinc-500">Mode: </span>UPI Transfer
            </p>
            <p className="font-mono font-semibold text-zinc-900 mt-0.5">
              <span className="text-zinc-500 font-normal">UTR Ref: </span>
              {receipt.utrNumber || "VERIFIED-DIRECT"}
            </p>
          </div>
        </div>

        {/* Itemized Table */}
        <div className="py-6 border-b border-zinc-200">
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b border-zinc-300 text-left font-mono text-[10px] uppercase text-zinc-500">
                <th className="pb-2">Description</th>
                <th className="pb-2 text-center">Sessions</th>
                <th className="pb-2 text-right">Amount</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100 font-sans">
              <tr>
                <td className="py-3">
                  <p className="font-semibold text-zinc-900">
                    Resolve MUN 2.0 — {receipt.passCategory || "Delegate Pass"}
                  </p>
                  <p className="text-[11px] text-zinc-500">
                    Includes 3-day admission, committee pack, high tea, delegate kit &amp; socials entry
                  </p>
                </td>
                <td className="py-3 text-center font-mono text-zinc-600">3 Days</td>
                <td className="py-3 text-right font-mono font-bold text-zinc-900">
                  ₹{Number(receipt.amount || 2500).toLocaleString("en-IN")}.00
                </td>
              </tr>
              <tr>
                <td className="py-2.5 text-zinc-600">Conference Materials, Working Papers &amp; Kit</td>
                <td className="py-2.5 text-center font-mono text-zinc-600">Full</td>
                <td className="py-2.5 text-right font-mono text-zinc-500">Included</td>
              </tr>
              <tr>
                <td className="py-2.5 text-zinc-600">Payment Gateway / Processing Surcharge</td>
                <td className="py-2.5 text-center font-mono text-zinc-600">—</td>
                <td className="py-2.5 text-right font-mono text-zinc-500">₹0.00</td>
              </tr>
            </tbody>
            <tfoot>
              <tr className="border-t-2 border-zinc-900 font-bold">
                <td colSpan={2} className="pt-3 text-right font-mono uppercase text-xs">
                  Total Paid (INR):
                </td>
                <td className="pt-3 text-right font-mono text-base text-zinc-950">
                  ₹{Number(receipt.amount || 2500).toLocaleString("en-IN")}.00
                </td>
              </tr>
            </tfoot>
          </table>
        </div>

        {/* Verification Footer & QR */}
        <div className="flex items-center justify-between pt-6 text-[11px]">
          <div className="space-y-1 max-w-sm">
            <p className="font-bold uppercase tracking-wider text-zinc-900 font-mono text-[10px]">
              Secretariat Directorate of Finance
            </p>
            <p className="text-zinc-600 leading-relaxed text-[10px]">
              This is a computer-generated official receipt issued by Resolve MUN 2.0.
              Retain this receipt for your records and present it at the entrance desk if requested.
            </p>
            <p className="text-[9px] font-mono text-zinc-400 pt-1">
              Auth Hash: RMUN26-{receipt.ticketId.slice(-8)}-VERIFIED
            </p>
          </div>
          <div className="flex flex-col items-center">
            <img
              src={`https://quickchart.io/qr?size=150&text=${encodeURIComponent(
                "RESOLVE_RECEIPT:" + receipt.ticketId + ":" + receipt.cardHolder + ":" + (receipt.amount || 2500)
              )}`}
              alt="Receipt Verification QR"
              className="w-20 h-20 object-contain border border-zinc-300 rounded p-1"
            />
            <span className="text-[8px] font-mono uppercase tracking-widest text-zinc-500 mt-1">
              Scan to Verify
            </span>
          </div>
        </div>
      </div>
    </>
  );
}