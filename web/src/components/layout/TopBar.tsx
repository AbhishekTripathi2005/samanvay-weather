"use client";

import React, { useState, useRef, useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import {
  Sun,
  Moon,
  Bell,
  Play,
  Share2,
  HelpCircle,
  Menu,
  CloudRain,
  Clock,
  Wind,
  Search,
  Sparkles,
  BookOpen,
  Keyboard,
  Compass
} from "lucide-react";
import { useAppStore, AVAILABLE_LEADS } from "@/lib/store";
import { useExtremesQuery } from "@/lib/queries";
import { copyShareableLink } from "./UrlSync";
import { NAVIGATION_ROUTES } from "./Sidebar";
import { MagneticButton } from "@/components/ui/MagneticButton";

const VARIABLES_LIST = [
  { id: "rainfall", label: "24h Rain", unit: "mm" },
  { id: "tmax", label: "Tmax", unit: "°C" },
  { id: "tmin", label: "Tmin", unit: "°C" },
  { id: "wind_speed", label: "10m Wind", unit: "km/h" },
  { id: "wind_gust", label: "10m Gust", unit: "km/h" }
];

const REGIMES_LIST = [
  "auto",
  "Active monsoon",
  "Break monsoon",
  "Western Disturbance",
  "Cyclone/Depression",
  "Heatwave ridge",
  "Neutral"
];

export function TopBar() {
  const pathname = usePathname();
  const router = useRouter();
  const {
    variable,
    lead,
    regime,
    theme,
    setVariable,
    setLead,
    setRegime,
    toggleTheme,
    setIsShortcutsOpen,
    setIsRunBlendOpen,
    setIsAlertsOpen,
    setIsMobileNavOpen,
    setIsCommandPaletteOpen,
    setIsTourOpen,
    setTourStep,
    setIsDemoMode,
    setDemoStep
  } = useAppStore();

  const [isHelpOpen, setIsHelpOpen] = useState(false);
  const helpMenuRef = useRef<HTMLDivElement>(null);

  const { data: extremesData } = useExtremesQuery();
  const activeAlertCount = extremesData
    ? extremesData.red_count + extremesData.orange_count
    : 3;

  const currentRoute = NAVIGATION_ROUTES.find((r) => r.path === pathname) || {
    label: pathname === "/about" ? "Methodology" : "Command Center"
  };

  // Close help menu on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (helpMenuRef.current && !helpMenuRef.current.contains(e.target as Node)) {
        setIsHelpOpen(false);
      }
    };
    if (isHelpOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isHelpOpen]);

  return (
    <header className="h-16 border-b border-border/70 bg-surface-1/80 backdrop-blur-xl px-4 flex items-center justify-between z-20 shrink-0">
      {/* Left: Mobile Toggle + Breadcrumb */}
      <div className="flex items-center gap-3">
        <button
          onClick={() => setIsMobileNavOpen(true)}
          className="md:hidden p-1.5 rounded-lg text-text-3 hover:text-text-1 hover:bg-surface-2 transition-colors"
          aria-label="Open mobile menu"
        >
          <Menu className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-2 text-xs">
          <span className="font-bold text-cyan-400 tracking-wider">SAMANVAY</span>
          <span className="text-text-3 font-mono">/</span>
          <span className="font-medium text-text-1 truncate max-w-[150px] sm:max-w-none">
            {currentRoute.label}
          </span>
        </div>
      </div>

      {/* Center: Global Filter Chips */}
      <div className="hidden lg:flex items-center gap-2">
        {/* Variable Chip */}
        <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-surface-2 border border-border/60 text-xs">
          <CloudRain className="w-3.5 h-3.5 text-cyan-400" />
          <select
            value={variable}
            onChange={(e) => setVariable(e.target.value)}
            className="bg-transparent font-medium text-text-1 focus:outline-none cursor-pointer"
          >
            {VARIABLES_LIST.map((v) => (
              <option key={v.id} value={v.id} className="bg-surface-2 text-text-1">
                {v.label} ({v.unit})
              </option>
            ))}
          </select>
        </div>

        {/* Lead Scrubber Chip */}
        <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-surface-2 border border-border/60 text-xs">
          <Clock className="w-3.5 h-3.5 text-blue-400" />
          <select
            value={lead}
            onChange={(e) => setLead(parseInt(e.target.value, 10))}
            className="bg-transparent font-mono font-medium text-text-1 focus:outline-none cursor-pointer"
          >
            {AVAILABLE_LEADS.map((l) => (
              <option key={l} value={l} className="bg-surface-2 text-text-1">
                Day {l / 24} (+{l}h)
              </option>
            ))}
          </select>
        </div>

        {/* Synoptic Regime Chip */}
        <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-surface-2 border border-border/60 text-xs">
          <Wind className="w-3.5 h-3.5 text-purple-400" />
          <select
            value={regime}
            onChange={(e) => setRegime(e.target.value)}
            className="bg-transparent font-medium text-text-1 focus:outline-none cursor-pointer"
          >
            {REGIMES_LIST.map((r) => (
              <option key={r} value={r} className="bg-surface-2 text-text-1">
                {r === "auto" ? "Regime: Auto (Detected)" : r}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Right Actions */}
      <div className="flex items-center gap-2">
        {/* Command Palette Button */}
        <button
          onClick={() => setIsCommandPaletteOpen(true)}
          className="hidden sm:flex items-center gap-2 px-2.5 py-1.5 rounded-xl bg-surface-2/80 hover:bg-surface-3 border border-border/70 text-text-3 hover:text-text-1 text-xs transition-colors cursor-pointer"
          title="Open Command Palette (Ctrl+K)"
          aria-label="Command Palette"
        >
          <Search className="w-3.5 h-3.5 text-cyan-400" />
          <span className="text-[11px] font-medium hidden md:inline">Command Palette</span>
          <kbd className="font-mono text-[9px] px-1 py-0.2 rounded bg-surface-3 border border-border/60 text-text-2">
            Ctrl+K
          </kbd>
        </button>

        {/* Demo Mode Button */}
        <button
          onClick={() => {
            setDemoStep(0);
            setIsDemoMode(true);
          }}
          className="hidden xl:flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-gradient-to-r from-amber-500/15 to-rose-500/15 border border-amber-500/40 text-amber-300 text-xs font-semibold hover:border-amber-400 transition-all cursor-pointer shadow-sm"
          title="Launch 2-Minute Evaluator Demo Mode"
        >
          <Sparkles className="w-3.5 h-3.5 text-amber-400 animate-spin" style={{ animationDuration: "6s" }} />
          <span>Demo Mode</span>
        </button>

        {/* Quick Action: Run Blend */}
        <MagneticButton
          onClick={() => setIsRunBlendOpen(true)}
          className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-medium text-xs shadow-md shadow-cyan-500/20 hover:opacity-90 transition-opacity"
        >
          <Play className="w-3 h-3 fill-current" />
          <span>Run Blend</span>
        </MagneticButton>

        {/* Copy Shareable Link */}
        <button
          onClick={copyShareableLink}
          className="p-2 rounded-full text-text-3 hover:text-text-1 hover:bg-surface-2 transition-colors"
          title="Copy shareable link with current filters"
          aria-label="Copy shareable link"
        >
          <Share2 className="w-4 h-4" />
        </button>

        {/* Live Alerts Notification Bell */}
        <button
          onClick={() => setIsAlertsOpen(true)}
          className="relative p-2 rounded-full text-text-3 hover:text-text-1 hover:bg-surface-2 transition-colors"
          title="Active severe weather advisories & notification centre"
          aria-label="Severe weather alerts"
        >
          <Bell className="w-4 h-4" />
          {activeAlertCount > 0 && (
            <span className="absolute top-1 right-1 w-4 h-4 rounded-full bg-rose-500 text-white font-mono text-[9px] font-bold flex items-center justify-center animate-pulse">
              {activeAlertCount}
            </span>
          )}
        </button>

        {/* Help Menu Dropdown (Tour, Shortcuts, Whitepaper) */}
        <div className="relative" ref={helpMenuRef}>
          <button
            onClick={() => setIsHelpOpen(!isHelpOpen)}
            className="p-2 rounded-full text-text-3 hover:text-text-1 hover:bg-surface-2 transition-colors cursor-pointer"
            title="Help, Tour & Shortcuts"
            aria-label="Help menu"
          >
            <HelpCircle className="w-4 h-4" />
          </button>

          {isHelpOpen && (
            <div className="absolute right-0 top-full mt-2 w-56 bg-surface-1 border border-border/80 rounded-2xl shadow-2xl p-1.5 z-50 text-xs flex flex-col gap-0.5 animate-in zoom-in-95 duration-150">
              <button
                onClick={() => {
                  setIsHelpOpen(false);
                  setTourStep(0);
                  setIsTourOpen(true);
                }}
                className="flex items-center gap-2.5 px-3 py-2 rounded-xl hover:bg-surface-2 text-text-2 hover:text-text-1 transition-colors text-left"
              >
                <Compass className="w-4 h-4 text-cyan-400" />
                <div>
                  <div className="font-semibold">Guided Product Tour</div>
                  <div className="text-[10px] text-text-3">8-step feature walkthrough</div>
                </div>
              </button>

              <button
                onClick={() => {
                  setIsHelpOpen(false);
                  setDemoStep(0);
                  setIsDemoMode(true);
                }}
                className="flex items-center gap-2.5 px-3 py-2 rounded-xl hover:bg-surface-2 text-text-2 hover:text-text-1 transition-colors text-left"
              >
                <Sparkles className="w-4 h-4 text-amber-400" />
                <div>
                  <div className="font-semibold">2-Minute Demo Mode</div>
                  <div className="text-[10px] text-text-3">Auto-played evaluator tour</div>
                </div>
              </button>

              <button
                onClick={() => {
                  setIsHelpOpen(false);
                  setIsShortcutsOpen(true);
                }}
                className="flex items-center gap-2.5 px-3 py-2 rounded-xl hover:bg-surface-2 text-text-2 hover:text-text-1 transition-colors text-left"
              >
                <Keyboard className="w-4 h-4 text-indigo-400" />
                <div>
                  <div className="font-semibold">Keyboard Shortcuts</div>
                  <div className="text-[10px] text-text-3">Hotkeys reference (?)</div>
                </div>
              </button>

              <button
                onClick={() => {
                  setIsHelpOpen(false);
                  router.push("/about");
                }}
                className="flex items-center gap-2.5 px-3 py-2 rounded-xl hover:bg-surface-2 text-text-2 hover:text-text-1 transition-colors text-left border-t border-border/40 mt-1 pt-1.5"
              >
                <BookOpen className="w-4 h-4 text-emerald-400" />
                <div>
                  <div className="font-semibold">Methodology Whitepaper</div>
                  <div className="text-[10px] text-text-3">KaTeX equations &amp; sources</div>
                </div>
              </button>
            </div>
          )}
        </div>

        {/* Theme Toggle */}
        <button
          onClick={toggleTheme}
          className="p-2 rounded-full text-text-3 hover:text-text-1 hover:bg-surface-2 transition-colors cursor-pointer"
          title={`Switch to ${theme === "dark" ? "light" : "dark"} theme (T)`}
          aria-label="Toggle theme"
        >
          {theme === "dark" ? (
            <Sun className="w-4 h-4 text-amber-400 hover:rotate-45 transition-transform duration-300" />
          ) : (
            <Moon className="w-4 h-4 text-indigo-400 hover:-rotate-12 transition-transform duration-300" />
          )}
        </button>

        {/* MoES / NCMRWF User Org Badge */}
        <div className="hidden md:flex items-center gap-2 pl-2 border-l border-border/60">
          <div className="w-7 h-7 rounded-full bg-surface-2 border border-cyan-500/40 flex items-center justify-center text-[10px] font-bold text-cyan-400 font-mono shadow-sm">
            MoES
          </div>
        </div>
      </div>
    </header>
  );
}
