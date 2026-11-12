"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

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
      .replace(",", " •");

    return (
      <>
        {showConfetti && <ConfettiExplosion />}
        <div
          ref={ref}
          className={cn(
            "relative w-full max-w-sm bg-[#090909] text-white rounded-2xl shadow-2xl font-sans z-10 border border-white/20",
            "animate-in fade-in-0 zoom-in-95 duration-300",
            className
          )}
          {...props}
        >
          <div className="absolute -left-3.5 top-1/2 -translate-y-1/2 w-7 h-7 rounded-full bg-black border-r border-white/20" />
          <div className="absolute -right-3.5 top-1/2 -translate-y-1/2 w-7 h-7 rounded-full bg-black border-l border-white/20" />

          <div className="p-4 sm:p-5 flex flex-col items-center text-center">
            <div className="p-2 sm:p-2.5 bg-emerald-500/15 border border-emerald-500/30 rounded-full animate-in zoom-in-50 delay-150 duration-300">
              <CheckCircleIcon className="w-6 h-6 sm:w-7 sm:h-7 text-emerald-400" />
            </div>
            <h2 className="text-lg sm:text-xl font-bold mt-2.5 text-white tracking-tight">
              {title}
            </h2>
            <p className="text-xs text-white/60 mt-0.5 max-w-[280px]">
              {subtitle}
            </p>
          </div>

          <div className="px-5 sm:px-6 pb-5 space-y-3 sm:space-y-3.5">
            <DashedLine />

            <div className="grid grid-cols-2 gap-3 text-left">
              <div>
                <p className="text-[10px] text-white/50 uppercase tracking-widest font-mono">
                  Reference ID
                </p>
                <p className="font-mono font-semibold text-xs sm:text-sm text-white mt-0.5 truncate">
                  {ticketId}
                </p>
              </div>
              <div className="text-right">
                <p className="text-[10px] text-white/50 uppercase tracking-widest font-mono">
                  Amount Paid
                </p>
                <p className="font-bold text-base sm:text-lg text-white mt-0.5">
                  {formattedAmount}
                </p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 text-left">
              <div>
                <p className="text-[10px] text-white/50 uppercase tracking-widest font-mono">
                  Date &amp; Time
                </p>
                <p className="text-xs font-medium text-white/85 mt-0.5">
                  {formattedDate}
                </p>
              </div>
              <div className="text-right">
                <p className="text-[10px] text-white/50 uppercase tracking-widest font-mono">
                  Pass Category
                </p>
                <p className="text-xs font-semibold text-white mt-0.5">
                  {passCategory}
                </p>
              </div>
            </div>

            <div className="bg-white/[0.04] border border-white/15 p-3 rounded-xl flex items-center space-x-3 text-left">
              <UpiBadgeIcon className="shrink-0" />
              <div className="min-w-0 flex-1">
                <p className="font-semibold text-xs sm:text-sm text-white truncate">
                  {cardHolder}
                </p>
                <p className="text-white/60 font-mono text-[11px] tracking-wider truncate mt-0.5">
                  {utrNumber ? `UPI UTR: ${utrNumber}` : "Verified Application"}
                </p>
              </div>
            </div>

            <DashedLine />

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
    <div className="fixed inset-0 z-[10005] bg-black/95 backdrop-blur-md overflow-y-auto overscroll-contain flex flex-col items-center p-4 sm:p-6">
      {/* Floating Close Button */}
      <button
        type="button"
        onClick={handleContinue}
        className="fixed top-4 right-4 z-[10010] w-10 h-10 rounded-full bg-zinc-900/90 border border-white/25 text-white/80 hover:text-white flex items-center justify-center transition-all cursor-pointer hover:bg-zinc-800 shadow-2xl active:scale-95"
        aria-label="Close pass dialog"
      >
        <CloseIcon />
      </button>

      <div className="w-full max-w-sm flex flex-col items-center my-auto py-8 sm:py-12">
        <AnimatedTicket
          ticketId={receipt.ticketId}
          amount={receipt.amount}
          date={receipt.date}
          cardHolder={receipt.cardHolder}
          utrNumber={receipt.utrNumber}
          passCategory={receipt.passCategory}
          barcodeValue={receipt.barcodeValue}
        />
        <div className="mt-4 flex flex-col sm:flex-row items-center gap-2.5 w-full z-20 pb-2">
          <button
            type="button"
            onClick={() => window.print()}
            className="w-full sm:w-1/2 py-2.5 px-4 rounded-xl border border-white/25 bg-[#111] text-white text-xs font-bold uppercase tracking-wider hover:bg-white/10 transition-colors cursor-pointer"
          >
            Print / Save PDF
          </button>
          <button
            type="button"
            onClick={handleContinue}
            className="w-full sm:w-1/2 py-2.5 px-4 rounded-xl border border-white bg-white text-black text-xs font-bold uppercase tracking-wider hover:bg-white/90 transition-colors cursor-pointer"
          >
            Open Dashboard →
          </button>
        </div>
      </div>
    </div>
  );
}

