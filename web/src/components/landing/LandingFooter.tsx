"use client";

import React from "react";
import Link from "next/link";
import { Radio, ShieldCheck, ExternalLink, Github, BookOpen } from "lucide-react";

export function LandingFooter() {
  return (
    <footer id="specs" className="w-full border-t border-border/60 bg-surface-1/90 backdrop-blur-xl relative z-10 py-12 px-4 md:px-8 text-xs transition-colors">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between gap-8 pb-8 border-b border-border/40">
        {/* Brand & Attribution */}
        <div className="flex flex-col gap-3 max-w-sm">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-cyan-500 to-indigo-600 flex items-center justify-center text-white font-bold">
              <Radio className="w-4 h-4" />
            </div>
            <span className="font-extrabold text-sm tracking-wider text-text-1">
              SAMANVAY (समन्वय)
            </span>
          </div>
          <p className="text-text-3 leading-relaxed">
            Adaptive AI-NWP Forecast Blending for Operational Meteorological Decision Support.
            Developed for <strong>Ministry of Earth Sciences (MoES)</strong> and <strong>NCMRWF</strong> under <strong>Problem Statement 26081</strong>.
          </p>
          <div className="flex items-center gap-2 text-cyan-400 font-mono text-[11px]">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span>ALL SYSTEMS OPERATIONAL • 100% OFFLINE READY</span>
          </div>
        </div>

        {/* Quick Links */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-8">
          <div className="flex flex-col gap-2">
            <span className="font-mono text-text-1 font-semibold uppercase tracking-wider text-[11px]">
              Platform
            </span>
            <Link href="/overview" className="text-text-3 hover:text-cyan-400 transition-colors">
              Command Center
            </Link>
            <Link href="/forecast" className="text-text-3 hover:text-cyan-400 transition-colors">
              Forecast Explorer
            </Link>
            <Link href="/models" className="text-text-3 hover:text-cyan-400 transition-colors">
              Model Matrix
            </Link>
            <Link href="/extremes" className="text-text-3 hover:text-cyan-400 transition-colors">
              Disaster DSS
            </Link>
          </div>

          <div className="flex flex-col gap-2">
            <span className="font-mono text-text-1 font-semibold uppercase tracking-wider text-[11px]">
              Scientific Core
            </span>
            <Link href="/impact" className="text-text-3 hover:text-cyan-400 transition-colors">
              Mountain Hydrology
            </Link>
            <Link href="/regimes" className="text-text-3 hover:text-cyan-400 transition-colors">
              Synoptic Regimes
            </Link>
            <Link href="/weights" className="text-text-3 hover:text-cyan-400 transition-colors">
              Adaptive Weights
            </Link>
            <Link href="/ops" className="text-text-3 hover:text-cyan-400 transition-colors">
              Ingestion Pipeline
            </Link>
          </div>

          <div className="flex flex-col gap-2">
            <span className="font-mono text-text-1 font-semibold uppercase tracking-wider text-[11px]">
              Resources
            </span>
            <Link href="/design-system" className="text-text-3 hover:text-cyan-400 transition-colors">
              Design System
            </Link>
            <a href="http://127.0.0.1:8000/docs" target="_blank" rel="noreferrer" className="text-text-3 hover:text-cyan-400 transition-colors flex items-center gap-1">
              <span>OpenAPI Docs</span>
              <ExternalLink className="w-3 h-3" />
            </a>
            <span className="text-text-3">MoES / NCMRWF (PS 26081)</span>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto pt-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-text-3 text-[11px]">
        <span>© 2026 Government of India — Ministry of Earth Sciences (MoES) / NCMRWF.</span>
        <span>Built with Next.js 14, FastAPI, NumPy, SciPy, and MapLibre.</span>
      </div>
    </footer>
  );
}
