"use client";

import React from "react";
import Link from "next/link";
import { GlassCard } from "@/components/ui/GlassCard";
import {
  LayoutDashboard,
  Map,
  Layers,
  AlertTriangle,
  Mountain,
  CloudRain,
  Sliders,
  Cpu,
  ArrowUpRight
} from "lucide-react";

export function FeatureGrid() {
  const modules = [
    {
      title: "National Command Center",
      href: "/overview",
      icon: LayoutDashboard,
      badge: "Command Core",
      desc: "Live 36-state weather watch, interactive gridded forecast map, real-time plume fan, and active operational bulletins.",
      color: "from-cyan-500/20 to-blue-500/5",
      border: "hover:border-cyan-500/60"
    },
    {
      title: "Forecast Explorer",
      href: "/forecast",
      icon: Map,
      badge: "0.5° Resolution",
      desc: "Pan-India gridded consensus fields, state drilldowns with P10/P90 confidence intervals, and dominant source attribution.",
      color: "from-blue-500/20 to-indigo-500/5",
      border: "hover:border-blue-500/60"
    },
    {
      title: "Model Matrix & Verification",
      href: "/models",
      icon: Layers,
      badge: "10-Metric Suite",
      desc: "Full operational verification scorecard, SVG Taylor diagram, and dual-benchmark validation against IMD truth.",
      color: "from-indigo-500/20 to-violet-500/5",
      border: "hover:border-indigo-500/60"
    },
    {
      title: "Disaster DSS & Extremes",
      href: "/extremes",
      icon: AlertTriangle,
      badge: "IMD 4-Tier Matrix",
      desc: "Calibrated extreme rainfall exceedance, Brier reliability diagram, and SHAP-style additive feature attribution waterfalls.",
      color: "from-amber-500/20 to-orange-500/5",
      border: "hover:border-amber-500/60"
    },
    {
      title: "Mountain Hydrology (Shimla)",
      href: "/impact",
      icon: Mountain,
      badge: "PINN-Lite Engine",
      desc: "30-day API soil saturation, perched water table balance, landslide Factor of Safety, and critical road infrastructure surveillance.",
      color: "from-emerald-500/20 to-teal-500/5",
      border: "hover:border-emerald-500/60"
    },
    {
      title: "Synoptic Regimes",
      href: "/regimes",
      icon: CloudRain,
      badge: "6 Weather States",
      desc: "Rule-based synoptic regime detection (Active/Break monsoon, Western Disturbance, Heatwave) with 3-year timeline transition intervals.",
      color: "from-violet-500/20 to-fuchsia-500/5",
      border: "hover:border-violet-500/60"
    },
    {
      title: "Adaptive Weights",
      href: "/weights",
      icon: Sliders,
      badge: "NNLS + Laplacian",
      desc: "Interactive 2D heatmaps across Leads and Regimes, polar radar weight distributions, and on-the-fly custom reblending overrides.",
      color: "from-fuchsia-500/20 to-pink-500/5",
      border: "hover:border-fuchsia-500/60"
    },
    {
      title: "Operational Pipeline & DAGs",
      href: "/ops",
      icon: Cpu,
      badge: "Live SSE Streaming",
      desc: "7 model ingestion feeds, end-to-end execution pipeline latencies, fallback history logs, and instant operational blend triggering.",
      color: "from-teal-500/20 to-cyan-500/5",
      border: "hover:border-teal-500/60"
    }
  ];

  return (
    <section id="modules" className="w-full max-w-7xl mx-auto px-4 md:px-8 py-20 relative z-10">
      <div className="text-center max-w-3xl mx-auto mb-16">
        <span className="text-xs font-mono font-semibold text-indigo-400 uppercase tracking-widest px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 mb-3 inline-block">
          Complete Operational Suite
        </span>
        <h2 className="text-3xl sm:text-4xl font-extrabold text-text-1 tracking-tight mb-4">
          Integrated Command Modules
        </h2>
        <p className="text-text-2 text-sm sm:text-base leading-relaxed">
          Every screen in SAMANVAY provides specialized decision support for meteorologists and disaster response teams.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
        {modules.map((m) => {
          const Icon = m.icon;
          return (
            <Link key={m.title} href={m.href} className="group">
              <GlassCard
                className={`p-6 h-full flex flex-col justify-between border-border/70 ${m.border} transition-all duration-300 relative overflow-hidden group-hover:-translate-y-1 group-hover:shadow-xl`}
              >
                <div className={`absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl ${m.color} rounded-bl-full pointer-events-none`} />

                <div>
                  <div className="flex items-center justify-between mb-4">
                    <div className="p-2.5 rounded-xl bg-surface-2 border border-border/80 group-hover:bg-surface-3 transition-colors">
                      <Icon className="w-5 h-5 text-cyan-400" />
                    </div>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded-md bg-surface-2 text-text-3 border border-border/60">
                      {m.badge}
                    </span>
                  </div>

                  <h3 className="text-base font-bold text-text-1 mb-2 group-hover:text-cyan-400 transition-colors flex items-center justify-between">
                    <span>{m.title}</span>
                    <ArrowUpRight className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity" />
                  </h3>

                  <p className="text-xs text-text-3 leading-relaxed">
                    {m.desc}
                  </p>
                </div>

                <div className="mt-6 pt-3 border-t border-border/40 flex items-center justify-between text-[11px] font-mono text-cyan-400">
                  <span>Launch Screen</span>
                  <span>→</span>
                </div>
              </GlassCard>
            </Link>
          );
        })}
      </div>
    </section>
  );
}
