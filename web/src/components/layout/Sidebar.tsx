"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Map,
  Layers,
  AlertTriangle,
  Mountain,
  CloudRain,
  Sliders,
  Cpu,
  Palette,
  ChevronLeft,
  ChevronRight,
  Radio
} from "lucide-react";
import { useAppStore } from "@/lib/store";
import { Tooltip } from "@/components/ui/Tooltip";
import { Kbd } from "@/components/ui/Kbd";

export const NAVIGATION_ROUTES = [
  { path: "/", label: "Overview", icon: LayoutDashboard, key: "1", desc: "National Command Center" },
  { path: "/forecast", label: "Forecast Explorer", icon: Map, key: "2", desc: "0.5° Grid & Regional Consensus" },
  { path: "/models", label: "Model Matrix", icon: Layers, key: "3", desc: "7 Models vs Blended Skill" },
  { path: "/extremes", label: "Disaster DSS", icon: AlertTriangle, key: "4", desc: "Extreme Weather Alerts" },
  { path: "/impact", label: "Mountain Hydrology", icon: Mountain, key: "5", desc: "Shimla Landslide & Runoff" },
  { path: "/regimes", label: "Synoptic Regimes", icon: CloudRain, key: "6", desc: "Monsoon & Circulation Regimes" },
  { path: "/weights", label: "Adaptive Weights", icon: Sliders, key: "7", desc: "NNLS Stacking & Attribution" },
  { path: "/ops", label: "Ingestion Pipeline", icon: Cpu, key: "8", desc: "Model DAGs & Streaming SSE" },
  { path: "/design-system", label: "Design System", icon: Palette, key: "9", desc: "Tokens & Component Showroom" }
];

export function Sidebar() {
  const pathname = usePathname();
  const { sidebarCollapsed, toggleSidebar } = useAppStore();

  return (
    <aside
      className={`hidden md:flex flex-col border-r border-border/70 bg-surface-1/90 backdrop-blur-xl transition-all duration-300 z-30 select-none ${
        sidebarCollapsed ? "w-[68px]" : "w-[240px]"
      }`}
    >
      {/* Brand Header */}
      <div className="h-16 flex items-center justify-between px-3.5 border-b border-border/60">
        <Link href="/" className="flex items-center gap-2.5 overflow-hidden">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-cyan-500 to-indigo-600 flex items-center justify-center shadow-lg shadow-cyan-500/25 shrink-0">
            <Radio className="w-4 h-4 text-white animate-pulse" />
          </div>
          {!sidebarCollapsed && (
            <div className="flex flex-col leading-tight overflow-hidden">
              <span className="font-extrabold text-sm tracking-wider text-text-1 truncate">
                SAMANVAY
              </span>
              <span className="text-[10px] font-mono text-cyan-400 truncate">
                समन्वय | MoES / NCMRWF
              </span>
            </div>
          )}
        </Link>
        <button
          onClick={toggleSidebar}
          aria-label={sidebarCollapsed ? "Expand sidebar" : "Collapse sidebar"}
          className="p-1 rounded-md text-text-3 hover:text-text-1 hover:bg-surface-2 transition-colors shrink-0"
        >
          {sidebarCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
        </button>
      </div>

      {/* Navigation Items */}
      <nav className="flex-1 py-3 px-2 flex flex-col gap-1 overflow-y-auto overflow-x-hidden">
        {NAVIGATION_ROUTES.map((route) => {
          const isActive = pathname === route.path;
          const Icon = route.icon;

          const linkContent = (
            <Link
              href={route.path}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-xl font-medium text-xs transition-all group relative ${
                isActive
                  ? "bg-cyan-500/15 text-cyan-300 border border-cyan-500/40 shadow-sm shadow-cyan-500/10"
                  : "text-text-2 hover:text-text-1 hover:bg-surface-2/60"
              }`}
            >
              <Icon
                className={`w-4 h-4 shrink-0 transition-colors ${
                  isActive ? "text-cyan-400" : "text-text-3 group-hover:text-text-1"
                }`}
              />
              {!sidebarCollapsed && (
                <div className="flex items-center justify-between flex-1 overflow-hidden">
                  <span className="truncate">{route.label}</span>
                  <Kbd className="text-[9px] opacity-60 ml-1 shrink-0">{route.key}</Kbd>
                </div>
              )}
              {/* Active Route Vertical Indicator */}
              {isActive && (
                <span className="absolute left-0 top-1.5 bottom-1.5 w-1 rounded-r bg-cyan-400 shadow-[0_0_8px_#00F5FF]" />
              )}
            </Link>
          );

          if (sidebarCollapsed) {
            return (
              <Tooltip key={route.path} content={`${route.label} (${route.key})`} side="right">
                {linkContent}
              </Tooltip>
            );
          }

          return <React.Fragment key={route.path}>{linkContent}</React.Fragment>;
        })}
      </nav>

      {/* Operational System Footer Status */}
      <div className="p-3 border-t border-border/60 text-xs">
        {!sidebarCollapsed ? (
          <div className="bg-surface-2/60 rounded-xl p-2.5 border border-border/40">
            <div className="flex items-center gap-2 mb-1">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span className="text-[11px] font-semibold text-text-1">SYSTEM ONLINE</span>
            </div>
            <p className="text-[10px] text-text-3 font-mono">7 Models • 240h Cycle</p>
          </div>
        ) : (
          <Tooltip content="System Operational (7 Models Synced)" side="right">
            <div className="flex justify-center py-1">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
            </div>
          </Tooltip>
        )}
      </div>
    </aside>
  );
}
