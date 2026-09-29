"use client";

import React from "react";
import Link from "next/link";
import { Radio, Sun, Moon, ArrowRight, ShieldCheck } from "lucide-react";
import { useAppStore } from "@/lib/store";
import { MagneticButton } from "@/components/ui/MagneticButton";
import { Kbd } from "@/components/ui/Kbd";

export function LandingHeader() {
  const { theme, toggleTheme, setIsShortcutsOpen } = useAppStore();

  return (
    <header className="fixed top-0 left-0 right-0 h-16 bg-surface-0/75 backdrop-blur-xl border-b border-border/60 z-50 px-4 md:px-8 flex items-center justify-between transition-colors">
      {/* Brand */}
      <Link href="/" className="flex items-center gap-3 group">
        <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-cyan-500 via-indigo-600 to-fuchsia-600 flex items-center justify-center shadow-lg shadow-cyan-500/20 group-hover:scale-105 transition-transform">
          <Radio className="w-4 h-4 text-white animate-pulse" />
        </div>
        <div className="flex flex-col leading-tight">
          <span className="font-extrabold text-base tracking-wider text-text-1">
            SAMANVAY
          </span>
          <span className="text-[10px] font-mono text-cyan-400">
            समन्वय | MoES / NCMRWF
          </span>
        </div>
      </Link>

      {/* Navigation Anchor Links */}
      <nav className="hidden md:flex items-center gap-6 text-xs font-medium text-text-2">
        <a href="#storytelling" className="hover:text-cyan-400 transition-colors">
          The Science
        </a>
        <a href="#why-blending" className="hover:text-cyan-400 transition-colors">
          Why Blending Wins
        </a>
        <a href="#modules" className="hover:text-cyan-400 transition-colors">
          Operational Modules
        </a>
        <a href="#stats" className="hover:text-cyan-400 transition-colors">
          Performance
        </a>
      </nav>

      {/* Right Actions */}
      <div className="flex items-center gap-3">
        <button
          onClick={() => setIsShortcutsOpen(true)}
          className="hidden lg:flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-surface-2 border border-border/70 text-[11px] text-text-2 hover:text-text-1 transition-colors"
          title="Press '?' for keyboard shortcuts"
        >
          <span className="text-text-3">Shortcuts</span>
          <Kbd>?</Kbd>
        </button>

        <button
          onClick={toggleTheme}
          aria-label="Toggle theme"
          className="p-2 rounded-lg bg-surface-2 border border-border/70 text-text-2 hover:text-text-1 transition-colors"
        >
          {theme === "dark" ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-indigo-500" />}
        </button>

        <Link href="/overview">
          <MagneticButton className="px-4 py-2 text-xs font-semibold rounded-lg bg-gradient-to-r from-cyan-500 to-indigo-600 hover:from-cyan-400 hover:to-indigo-500 text-white shadow-md shadow-cyan-500/25 flex items-center gap-1.5">
            <span>Command Center</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </MagneticButton>
        </Link>
      </div>
    </header>
  );
}
