"use client";

import React from "react";
import { useRegimesTimelineQuery, useRegimesWeightsQuery } from "@/lib/queries";
import { GlassCard } from "@/components/ui/GlassCard";
import { Heatmap } from "@/components/charts/Heatmap";
import { Sankey } from "@/components/charts/Sankey";

export default function RegimesPage() {
  const { data: timeline } = useRegimesTimelineQuery();
  const { data: weightsData } = useRegimesWeightsQuery();

  const intervals = timeline?.intervals || [];
  const regimeWeights = weightsData?.regime_weights || {};

  const heatmapRows = Object.entries(regimeWeights).map(([regName, wObj]) => ({
    label: regName,
    ...wObj
  }));

  const columns = [
    { key: "ncum_g", label: "NCUM", color: "#06B6D4" },
    { key: "neps", label: "NEPS", color: "#3B82F6" },
    { key: "imd_gfs", label: "GFS", color: "#10B981" },
    { key: "ecmwf_ifs", label: "ECMWF", color: "#6366F1" },
    { key: "graphcast", label: "GraphCast", color: "#8B5CF6" },
    { key: "pangu", label: "Pangu", color: "#D946EF" },
    { key: "fourcastnet", label: "FourCastNet", color: "#EC4899" }
  ];

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-bold text-text-1 tracking-tight">Synoptic Regimes & Timeline</h1>
        <p className="text-xs text-text-3">
          3-Year Synoptic Circulation Regime Timeline & Regime-Conditioned Weight Affinities
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Heatmap (6 cols) */}
        <div className="lg:col-span-6">
          <Heatmap
            title="Regime-Conditioned Weights"
            description="Optimal model weights conditioned on active synoptic regime"
            rows={heatmapRows}
            columns={columns}
          />
        </div>

        {/* Sankey Flow (6 cols) */}
        <div className="lg:col-span-6">
          <Sankey
            title="Signal & Weight Ingestion Flow"
            regime={timeline?.current_regime || "Active monsoon"}
          />
        </div>
      </div>

      {/* 3-Year Regime Timeline Intervals */}
      <GlassCard className="p-4 flex flex-col gap-3">
        <h3 className="text-sm font-semibold text-text-1">Historical Regime Chronology (Recent Intervals)</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {intervals.slice(0, 6).map((item, idx) => (
            <div key={idx} className="p-3 rounded-xl bg-surface-2 border border-border/50 flex flex-col gap-1 text-xs">
              <div className="flex items-center justify-between">
                <span className="font-bold text-cyan-400">{item.regime}</span>
                <span className="text-[10px] text-text-3 font-mono">{item.duration_days} days</span>
              </div>
              <span className="text-text-3 text-[11px] font-mono">
                {item.start_date} → {item.end_date}
              </span>
              <p className="text-[11px] text-text-2 mt-1 leading-snug">{item.description}</p>
            </div>
          ))}
        </div>
      </GlassCard>
    </div>
  );
}
