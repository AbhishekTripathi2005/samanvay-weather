"use client";

import React from "react";
import { useQuery } from "@tanstack/react-query";
import { fetchEnsembleDistribution } from "@/lib/api";
import { useOpsStore } from "@/lib/store";
import { formatNumber } from "@/lib/utils";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
  Area,
  ComposedChart
} from "recharts";

export function EnsemblePlumeChart() {
  const { variable, lead, selectedRegion, regime, season } = useOpsStore();

  const { data, isLoading } = useQuery({
    queryKey: ["ensembleDistribution", variable, lead, selectedRegion, regime, season],
    queryFn: () => fetchEnsembleDistribution(variable, lead, selectedRegion, regime, season),
    staleTime: 30000
  });

  if (isLoading || !data) {
    return (
      <div className="h-80 w-full animate-pulse rounded-xl bg-slate-900/60 border border-slate-800 flex items-center justify-center">
        <span className="text-xs font-mono text-cyan-400">Loading NEPS 21-member ensemble plumes...</span>
      </div>
    );
  }

  const chartData = data.plume_timeline.map((p) => ({
    lead: `+${p.lead}h`,
    lead_h: p.lead,
    consensus: p.consensus,
    p10: p.p10,
    p50: p.p50,
    p90: p.p90,
    ensemble_mean: p.ensemble_mean,
    spread: [p.p10, p.p90],
    ...p.members.reduce((acc, m, idx) => ({ ...acc, [`m_${idx}`]: m }), {})
  }));

  return (
    <div className="w-full h-80 rounded-xl border border-cyan-500/20 bg-[#070B14]/80 p-4 backdrop-blur-md flex flex-col justify-between">
      <div className="flex items-center justify-between mb-2">
        <div>
          <h3 className="font-heading font-bold text-sm text-cyan-300">
            NEPS 21-Member Uncertainty Plume (Day 1 - 10)
          </h3>
          <p className="text-[11px] text-slate-400">
            Ensemble spread, 10th-90th percentile envelope & SAMANVAY consensus track
          </p>
        </div>
        <div className="flex items-center space-x-3 font-mono text-[11px]">
          <span className="flex items-center space-x-1 text-cyan-400 font-bold">
            <span className="h-0.5 w-3 bg-cyan-400" />
            <span>Consensus</span>
          </span>
          <span className="flex items-center space-x-1 text-blue-400">
            <span className="h-0.5 w-3 bg-blue-500" />
            <span>NEPS Mean</span>
          </span>
          <span className="flex items-center space-x-1 text-slate-400">
            <span className="h-2 w-2 rounded-sm bg-blue-500/20 border border-blue-500/40" />
            <span>P10-P90 Spread</span>
          </span>
        </div>
      </div>

      <div className="w-full flex-1">
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart data={chartData} margin={{ top: 10, right: 10, left: -10, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
            <XAxis dataKey="lead" stroke="#64748b" tick={{ fontSize: 10, fill: "#94a3b8" }} />
            <YAxis stroke="#64748b" tick={{ fontSize: 10, fill: "#94a3b8" }} />
            <Tooltip
              content={({ active, payload }) => {
                if (active && payload && payload.length) {
                  const p = payload[0].payload;
                  return (
                    <div className="rounded-lg border border-cyan-500/40 bg-slate-950/95 p-3 font-mono text-xs shadow-xl">
                      <p className="font-bold text-cyan-300 mb-1">{p.lead} Forecast</p>
                      <p className="text-cyan-400">Consensus: <strong>{p.consensus}</strong></p>
                      <p className="text-blue-400">NEPS Mean: {p.ensemble_mean}</p>
                      <p className="text-slate-400">P10 - P90: [{p.p10} - {p.p90}]</p>
                    </div>
                  );
                }
                return null;
              }}
            />
            {/* Uncertainty envelope */}
            <Area
              dataKey="p90"
              baseValue="dataMin"
              stroke="none"
              fill="rgba(59, 130, 246, 0.15)"
            />
            {/* Ensemble members individual spaghettis */}
            {Array.from({ length: 10 }).map((_, i) => (
              <Line
                key={`mem_${i}`}
                type="monotone"
                dataKey={`m_${i}`}
                stroke="rgba(59, 130, 246, 0.25)"
                strokeWidth={1}
                dot={false}
              />
            ))}
            {/* NEPS Mean */}
            <Line
              type="monotone"
              dataKey="ensemble_mean"
              stroke="#3B82F6"
              strokeWidth={2}
              dot={{ r: 2 }}
            />
            {/* Blended Consensus */}
            <Line
              type="monotone"
              dataKey="consensus"
              stroke="#00F5FF"
              strokeWidth={2.5}
              dot={{ r: 3, fill: "#00F5FF" }}
            />
          </ComposedChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
