import Link from "next/link";
import { ArrowLeft, Compass } from "lucide-react";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-[#05060b] text-white flex flex-col items-center justify-center p-6 text-center font-sans relative overflow-hidden select-none">
      {/* Background ambient lighting */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[550px] h-[550px] bg-indigo-600/10 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute top-12 left-12 w-64 h-64 bg-violet-600/5 rounded-full blur-[90px] pointer-events-none" />

      {/* Main Content Box (Bliss Balance style) */}
      <div className="space-y-5 max-w-lg relative z-10 p-8 sm:p-10 rounded-2xl bg-[#07080e]/80 border border-white/10 backdrop-blur-xl shadow-[0_25px_60px_rgba(0,0,0,0.8)]">
        
        {/* Eyebrow Pill */}
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-300 text-[10px] font-mono uppercase tracking-[0.2em]">
          <Compass className="w-3 h-3 text-indigo-400 motion-safe:animate-spin" style={{ animationDuration: "12s" }} />
          <span>Diplomatic Route Unresolved</span>
        </div>

        {/* 404 Big Number */}
        <div className="leading-none py-1">
          <span className="font-display font-black text-7xl sm:text-9xl tracking-tight text-transparent bg-clip-text bg-gradient-to-b from-indigo-300 via-indigo-400 to-indigo-600 drop-shadow-[0_0_35px_rgba(99,102,241,0.4)]">
            404
          </span>
        </div>

        {/* Heading & Subtitle */}
        <div className="space-y-2">
          <h1 className="text-xl sm:text-2xl font-bold uppercase text-white tracking-wide">
            Page Not Found
          </h1>
          <p className="text-xs sm:text-sm text-white/50 leading-relaxed max-w-md mx-auto">
            The requested diplomatic committee dossier, registration route, or portal page does not exist or has been relocated.
          </p>
        </div>

        {/* Action Button (Bliss Balance style return button) */}
        <div className="pt-3">
          <Link
            href="/"
            className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white text-xs font-mono font-bold uppercase tracking-wider transition-all shadow-[0_10px_25px_rgba(99,102,241,0.3)] hover:shadow-[0_12px_30px_rgba(99,102,241,0.5)] border border-indigo-400/30 group"
          >
            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
            <span>Return to Homepage</span>
          </Link>
        </div>
      </div>

      {/* Massive Editorial Background Stamp (Bliss Balance signature) */}
      <div className="absolute bottom-0 w-full overflow-hidden flex justify-center items-end px-4 sm:px-8 pb-0 pointer-events-none select-none">
        <svg
          viewBox="0 0 1600 140"
          className="w-full max-w-[1400px] h-auto select-none"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <text
            x="50%"
            y="110"
            textAnchor="middle"
            fill="url(#grad404)"
            style={{
              fontFamily: "'Syne', 'Plus Jakarta Sans', system-ui, sans-serif",
              fontWeight: 800,
              fontSize: "110px",
              letterSpacing: "-0.02em",
            }}
          >
            RESOLVE MUN
          </text>
          <defs>
            <linearGradient id="grad404" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#ffffff" stopOpacity="0.05" />
              <stop offset="100%" stopColor="#ffffff" stopOpacity="0" />
            </linearGradient>
          </defs>
        </svg>
      </div>
    </div>
  );
}
