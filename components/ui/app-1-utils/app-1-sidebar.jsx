"use client";

import * as React from "react";
import {
  LayoutDashboard,
  Users,
  Building2,
  UserX,
  FileCheck2,
  Mail,
  Sliders,
  ShieldCheck,
  LogOut,
  ExternalLink,
  ChevronRight,
  Database,
  Layers,
  QrCode,
  Ticket,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useSidebar } from "./sidebar";

export function App1Sidebar({ activeTab = "overview", onTabChange, counts = {}, onLogout }) {
  const { open, isMobile, setOpen } = useSidebar();

  const NAV_ITEMS = [
    {
      id: "overview",
      label: "Overview",
      icon: LayoutDashboard,
      hint: "Live Analytics",
    },
    {
      id: "delegates",
      label: "Delegates",
      icon: Users,
      count: counts.delegates || 0,
      hint: "Allocations & Passes",
    },
    {
      id: "allocations",
      label: "Allocations Matrix",
      icon: Layers,
      hint: "Seat Capacities & Dossiers",
    },
    {
      id: "scanner",
      label: "Pass Scanner",
      icon: QrCode,
      hint: "Ultra-Fast Check-In",
    },
    {
      id: "delegations",
      label: "Delegations",
      icon: Building2,
      count: counts.delegations || 0,
      hint: "Institutional Rosters",
    },
    {
      id: "leads",
      label: "Abandoned Leads",
      icon: UserX,
      count: counts.leads || 0,
      hint: "Step 1-3 Telemetry",
    },
    {
      id: "applications",
      label: "Team Applications",
      icon: FileCheck2,
      count: counts.applications || 0,
      hint: "OC, Sec & EB",
    },
    {
      id: "secretariat",
      label: "Secretariat Roster",
      icon: ShieldCheck,
      count: counts.secretariatRoster || 0,
      hint: "Allot Roles & Onboarding",
    },
    {
      id: "users",
      label: "Site Accounts",
      icon: ShieldCheck,
      count: counts.users || 0,
      hint: "Auth Logins",
    },
    {
      id: "crm",
      label: "Broadcast CRM",
      icon: Mail,
      hint: "Direct Email Dispatch",
    },
    {
      id: "referrals",
      label: "Referrals & RES",
      icon: Ticket,
      hint: "Codes, Points & Coupons",
    },
    {
      id: "settings",
      label: "System Settings",
      icon: Sliders,
      hint: "Live Fees & Toggles",
    },
  ];

  return (
    <>
      {/* Mobile Backdrop */}
      {isMobile && open && (
        <div
          className="fixed inset-0 z-40 bg-black/80 backdrop-blur-sm"
          onClick={() => setOpen(false)}
        />
      )}

      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-50 flex flex-col border-r border-[#1f1f1f] bg-black transition-all duration-200 ease-in-out md:static shrink-0 font-sans",
          open ? "w-60 max-w-[82vw]" : "w-0 md:w-14",
          !open && isMobile && "-translate-x-full overflow-hidden pointer-events-none border-r-0"
        )}
      >
        {/* Brand Header */}
        <div className="flex h-14 items-center gap-2.5 border-b border-[#1f1f1f] px-3.5">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md border border-[#262626] bg-[#050505]">
            <img
              src="/images/Logo.svg"
              alt="Logo"
              className="h-4 w-4 object-contain"
            />
          </div>
          {open && (
            <div className="flex min-w-0 flex-col">
              <span
                className="truncate text-base font-bold tracking-[0.12em] text-white uppercase leading-none pt-0.5"
                style={{ fontFamily: "'Bebas Neue', sans-serif" }}
              >
                RESOLVE MUN 2.0
              </span>
              <span className="truncate text-[10px] font-mono tracking-wider text-zinc-500 uppercase mt-0.5">
                Secretariat Console
              </span>
            </div>
          )}
        </div>

        {/* Navigation Section */}
        <div className="flex-1 overflow-y-auto px-2.5 py-3 space-y-0.5">
          {NAV_ITEMS.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;

            return (
              <button
                key={item.id}
                type="button"
                onClick={() => {
                  onTabChange?.(item.id);
                  if (isMobile) setOpen(false);
                }}
                className={cn(
                  "group flex w-full items-center gap-2.5 rounded-md px-2.5 py-2 text-xs font-medium transition-colors cursor-pointer",
                  isActive
                    ? "bg-white text-black font-semibold"
                    : "text-zinc-400 hover:bg-[#0a0a0a] hover:text-white"
                )}
                title={!open ? item.label : undefined}
              >
                <Icon
                  className={cn(
                    "h-3.5 w-3.5 shrink-0 transition-colors",
                    isActive ? "text-black" : "text-zinc-500 group-hover:text-white"
                  )}
                />
                {open && (
                  <div className="flex flex-1 items-center justify-between min-w-0">
                    <span className="truncate">{item.label}</span>
                    {item.count !== undefined && item.count > 0 && (
                      <span
                        className={cn(
                          "ml-auto text-[10px] font-mono px-1.5 py-0.5 rounded",
                          isActive
                            ? "bg-black/15 text-black font-bold"
                            : "bg-[#0a0a0a] text-zinc-300 border border-[#262626]"
                        )}
                      >
                        {item.count}
                      </span>
                    )}
                  </div>
                )}
              </button>
            );
          })}
        </div>

        {/* Footer Quick Actions */}
        {open ? (
          <div className="border-t border-white/10 p-3 space-y-1.5">
            <a
              href="/"
              target="_blank"
              rel="noreferrer"
              className="flex items-center justify-between rounded-lg px-3 py-2 text-xs font-medium text-zinc-400 hover:bg-zinc-900 hover:text-white transition-colors"
            >
              <span className="flex items-center gap-2">
                <ExternalLink className="h-3.5 w-3.5" />
                Live Website
              </span>
              <ChevronRight className="h-3.5 w-3.5 opacity-50" />
            </a>

            <button
              type="button"
              onClick={onLogout}
              className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-xs font-medium text-red-400 hover:bg-red-950/30 hover:text-red-300 transition-colors cursor-pointer"
            >
              <LogOut className="h-3.5 w-3.5" />
              Lock Console
            </button>
          </div>
        ) : (
          <div className="border-t border-white/10 p-2 flex flex-col items-center gap-2">
            <button
              type="button"
              onClick={onLogout}
              className="p-2 text-red-400 hover:text-red-300"
              title="Lock Console"
            >
              <LogOut className="h-4 w-4" />
            </button>
          </div>
        )}
      </aside>
    </>
  );
}

