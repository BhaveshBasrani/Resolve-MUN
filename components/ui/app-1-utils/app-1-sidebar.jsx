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
  QrCode
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
          "fixed inset-y-0 left-0 z-50 flex flex-col border-r border-white/10 bg-zinc-950 transition-all duration-200 ease-in-out md:static",
          open ? "w-64" : "w-0 md:w-16",
          !open && isMobile && "-translate-x-full"
        )}
      >
        {/* Brand Header */}
        <div className="flex h-16 items-center gap-3 border-b border-white/10 px-4">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-white/15 bg-white/[0.04]">
            <img
              src="https://resolvemun.in/images/Logo.svg"
              alt="Logo"
              className="h-5 w-5 object-contain filter brightness-110"
            />
          </div>
          {open && (
            <div className="flex min-w-0 flex-col">
              <span className="truncate text-sm font-bold tracking-tight text-white uppercase">
                Resolve MUN 2.0
              </span>
              <span className="truncate text-[10px] font-mono tracking-wider text-zinc-400 uppercase">
                Command Center
              </span>
            </div>
          )}
        </div>

        {/* Navigation Section */}
        <div className="flex-1 overflow-y-auto px-3 py-4 space-y-1">
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
                  "group flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-xs font-medium transition-all cursor-pointer",
                  isActive
                    ? "bg-white text-black font-semibold shadow-sm"
                    : "text-zinc-400 hover:bg-zinc-900 hover:text-white"
                )}
                title={!open ? item.label : undefined}
              >
                <Icon
                  className={cn(
                    "h-4 w-4 shrink-0 transition-colors",
                    isActive ? "text-black" : "text-zinc-400 group-hover:text-white"
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
                            ? "bg-black/10 text-black font-bold"
                            : "bg-zinc-800 text-zinc-300 border border-white/10"
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

