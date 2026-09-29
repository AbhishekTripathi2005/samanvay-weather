"use client";

import React from "react";
import { useQuery } from "@tanstack/react-query";
import { fetchBlendingWeights } from "@/lib/api";
import { useOpsStore } from "@/lib/store";
import { formatNumber } from "@/lib/utils";

export function AdaptiveWeightsRibbon() {
  const { lead, regime, variable } = useOpsStore();

  const { data, isLoading } = useQuery({
    queryKey: ["blendingWeights", lead, regime, variable],
    queryFn: () => fetchBlendingWeights(lead, regime, variable),
    staleTime: 30000
  });

  if (isLoading || !data) {
    return (
      <div className="h-40 w-full animate-pulse rounded-xl bg-slate-900/60 border border-slate-800" />
    );
  }

  return (
    <div className="w-full rounded-xl border border-cyan-500/20 bg-[#070B14]/80 p-4 backdrop-blur-md">
      <div className="flex items-center justify-between mb-3">
        <div>
          <h3 className="font-heading font-bold text-sm text-cyan-300">
            Regime-Conditioned Adaptive Weights Distribution
          </h3>
          <p className="text-[11px] text-slate-400">
            Dynamic Bayesian weighting at lead +{lead}h under &quot;{regime}&quot; regime
          </p>
        </div>
        <span className="font-mono text-[10px] text-cyan-400 bg-cyan-950/60 border border-cyan-500/30 px-2 py-0.5 rounded">
          Σ Weights = 1.0000
        </span>
      </div>

      {/* Stacked Horizontal Ribbon */}
      <div className="w-full h-7 rounded-lg overflow-hidden flex border border-slate-700/60 shadow-inner">
        {data.sources.map((src) => (
          <div
            key={src.id}
            style={{ width: `${src.percentage}%`, backgroundColor: src.color }}
            className="h-full relative group transition-all duration-300 flex items-center justify-center cursor-help"
            title={`${src.name} (${src.type}): ${src.percentage}%`}
          >
            {src.percentage >= 8 && (
              <span className="font-mono text-[10px] font-bold text-slate-900 px-1 truncate drop-shadow">
                {src.name} {src.percentage}%
              </span>
            )}
          </div>
        ))}
      </div>

      {/* Model Badges Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-7 gap-2 mt-3">
        {data.sources.map((src) => (
          <div
            key={src.id}
            className="flex flex-col p-2 rounded-lg bg-slate-900/60 border border-slate-800 text-xs font-mono"
          >
            <div className="flex items-center space-x-1.5 mb-1">
              <span className="h-2 w-2 rounded-full" style={{ backgroundColor: src.color }} />
              <span className="font-bold text-slate-300 truncate">{src.name}</span>
            </div>
            <span className="text-[10px] text-slate-400">{src.type}</span>
            <span className="text-cyan-400 font-semibold mt-0.5">{src.percentage}%</span>
          </div>
        ))}
      </div>
    </div>
  );
}
