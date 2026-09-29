"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Sun, Moon, Shield, Activity, Radio, Cpu } from "lucide-react";
import { useOpsStore } from "@/lib/store";

export function Header() {
  const pathname = usePathname();
  const { theme, toggleTheme } = useOpsStore();
  const [timeUtc, setTimeUtc] = useState("");
  const [timeIst, setTimeIst] = useState("");

  useEffect(() => {
    const update = () => {
      const now = new Date();
      setTimeUtc(now.toUTCString().slice(17, 25) + " UTC");
      setTimeIst(
        now.toLocaleTimeString("en-IN", {
          timeZone: "Asia/Kolkata",
          hour12: false,
          hour: "2-digit",
          minute: "2-digit",
          second: "2-digit"
        }) + " IST"
      );
    };
    update();
    const interval = setInterval(update, 1000);
    return () => clearInterval(interval);
  }, []);

  const navLinks = [
    { href: "/", label: "Command Center", badge: "Live Ops" },
    { href: "/models", label: "Model Matrix", badge: "7 Models" },
    { href: "/ensemble", label: "Ensemble Plumes", badge: "21-Mem" },
    { href: "/dss", label: "Disaster Ops (DSS)", badge: "IMD / NDMA" },
    { href: "/impact", label: "PINN & Studies", badge: "Prior Study" },
    { href: "/architecture", label: "Architecture", badge: "Docs" }
  ];

  return (
    <header className="sticky top-0 z-50 w-full border-b border-cyan-500/20 bg-[#070B14]/90 backdrop-blur-md dark:bg-[#070B14]/90 dark:border-cyan-500/20 light:bg-white/95 light:border-slate-200 transition-colors">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Brand & Emblem */}
        <div className="flex items-center space-x-3">
          <div className="relative flex h-10 w-10 items-center justify-center rounded-lg border border-cyan-500/30 bg-cyan-950/40 text-cyan-400 shadow-[0_0_15px_rgba(6,182,212,0.25)]">
            <span className="font-heading font-black text-xl tracking-tighter">सम</span>
            <div className="absolute -bottom-1 -right-1 h-3 w-3 rounded-full bg-emerald-400 border-2 border-[#070B14] animate-pulse" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <span className="font-heading text-lg font-bold tracking-wider text-cyan-400 dark:text-cyan-400 light:text-cyan-700">
                SAMANVAY
              </span>
              <span className="rounded bg-cyan-500/10 px-1.5 py-0.5 font-mono text-[10px] font-semibold text-cyan-400 border border-cyan-500/30">
                PS 26081
              </span>
              <span className="hidden md:inline-flex items-center rounded-full bg-emerald-500/10 px-2 py-0.5 text-[10px] font-medium text-emerald-400 border border-emerald-500/20">
                <span className="mr-1 h-1.5 w-1.5 rounded-full bg-emerald-400" /> MoES / NCMRWF
              </span>
            </div>
            <p className="text-[11px] text-slate-400 dark:text-slate-400 light:text-slate-600 hidden sm:block">
              Adaptive AI-NWP Forecast Blending Command Center
            </p>
          </div>
        </div>

        {/* Navigation Tabs */}
        <nav className="hidden lg:flex items-center space-x-1">
          {navLinks.map((link) => {
            const isActive = pathname === link.href;
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`relative px-3 py-1.5 rounded-md text-xs font-medium transition-all ${
                  isActive
                    ? "bg-cyan-500/15 text-cyan-300 border border-cyan-500/40 shadow-[0_0_10px_rgba(6,182,212,0.2)]"
                    : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/40"
                }`}
              >
                {link.label}
              </Link>
            );
          })}
        </nav>

        {/* Ops Clock & System Status */}
        <div className="flex items-center space-x-4">
          <div className="hidden sm:flex flex-col text-right font-mono text-[11px] leading-tight">
            <span className="text-cyan-400 font-semibold">{timeIst}</span>
            <span className="text-slate-400">{timeUtc}</span>
          </div>

          {/* Theme Toggle */}
          <button
            onClick={toggleTheme}
            aria-label="Toggle Theme"
            className="flex h-9 w-9 items-center justify-center rounded-lg border border-slate-700 bg-slate-900/60 text-slate-300 hover:border-cyan-500/40 hover:text-cyan-400 transition"
          >
            {theme === "dark" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
          </button>
        </div>
      </div>

      {/* Mobile Nav Bar */}
      <div className="lg:hidden flex overflow-x-auto py-1 px-4 border-t border-slate-800/80 bg-slate-950/80 space-x-1 scrollbar-none">
        {navLinks.map((link) => {
          const isActive = pathname === link.href;
          return (
            <Link
              key={link.href}
              href={link.href}
              className={`whitespace-nowrap px-2.5 py-1 rounded text-[11px] font-medium transition ${
                isActive
                  ? "bg-cyan-500/20 text-cyan-300 border border-cyan-500/30"
                  : "text-slate-400 hover:text-slate-200"
              }`}
            >
              {link.label}
            </Link>
          );
        })}
      </div>
    </header>
  );
}
