"use client";

import React from "react";
import { GlassCard } from "@/components/ui/GlassCard";

interface SankeyProps {
  title?: string;
  regime?: string;
  className?: string;
}

export function Sankey({
  title = "Forecast Signal & Weight Ingestion Flow",
  regime = "Active monsoon",
  className = ""
}: SankeyProps) {
  const models = [
    { name: "NCUM-G (12km NWP)", color: "#06B6D4", weight: 26 },
    { name: "NEPS (21-Mem Ens)", color: "#3B82F6", weight: 22 },
    { name: "ECMWF-IFS (9km)", color: "#6366F1", weight: 20 },
    { name: "GraphCast AI", color: "#8B5CF6", weight: 12 },
    { name: "Pangu-Weather", color: "#D946EF", weight: 9 },
    { name: "FourCastNet AI", color: "#EC4899", weight: 6 },
    { name: "IMD-GFS (12km)", color: "#10B981", weight: 5 }
  ];

  const outcomes = [
    { name: "RED Warning (>64.5mm)", color: "#EF4444", share: 38 },
    { name: "ORANGE Alert (High Rain)", color: "#F59E0B", share: 32 },
    { name: "YELLOW Watch", color: "#EAB308", share: 20 },
    { name: "GREEN Normal", color: "#10B981", share: 10 }
  ];

  return (
    <GlassCard className={`p-4 flex flex-col ${className}`}>
      <div className="mb-3">
        <h3 className="text-sm font-semibold text-text-1">{title}</h3>
        <p className="text-xs text-text-3">Multi-model inputs → Synoptic Regime: {regime} → Decision Alert Tiers</p>
      </div>

      <div className="grid grid-cols-3 gap-6 items-center py-2 text-xs">
        {/* Left: Models */}
        <div className="flex flex-col gap-2">
          <span className="text-[11px] font-semibold text-text-3 uppercase tracking-wider mb-1">
            1. Forecast Inputs (7)
          </span>
          {models.map((m) => (
            <div
              key={m.name}
              className="p-2 rounded-lg bg-surface-2 border border-border/50 flex items-center justify-between"
            >
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: m.color }} />
                <span className="text-text-1 font-medium text-[11px] truncate max-w-[110px]">{m.name}</span>
              </div>
              <span className="font-mono text-cyan-400 font-bold text-[11px]">{m.weight}%</span>
            </div>
          ))}
        </div>

        {/* Center: Synoptic Regime Blending Hub */}
        <div className="flex flex-col items-center justify-center p-4 rounded-xl bg-surface-2/80 border border-cyan-500/40 text-center shadow-lg shadow-cyan-500/10">
          <div className="w-10 h-10 rounded-full bg-cyan-500/20 border border-cyan-400 flex items-center justify-center mb-2 animate-pulse">
            <span className="text-cyan-400 font-bold text-sm">∑</span>
          </div>
          <h4 className="font-bold text-text-1 text-xs mb-1">SAMANVAY Engine</h4>
          <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
            {regime}
          </span>
          <p className="text-[10px] text-text-3 mt-2 leading-relaxed">
            Laplacian Spatial Diffusion + NNLS Ridge Stacking
          </p>
        </div>

        {/* Right: Alert Outflows */}
        <div className="flex flex-col gap-2.5">
          <span className="text-[11px] font-semibold text-text-3 uppercase tracking-wider mb-1">
            2. Disaster Support Tiers
          </span>
          {outcomes.map((o) => (
            <div
              key={o.name}
              className="p-2 rounded-lg bg-surface-2 border border-border/50 flex items-center justify-between"
            >
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: o.color }} />
                <span className="text-text-1 font-medium text-[11px]">{o.name}</span>
              </div>
              <span className="font-mono font-bold text-[11px]" style={{ color: o.color }}>
                {o.share}%
              </span>
            </div>
          ))}
        </div>
      </div>
    </GlassCard>
  );
}
