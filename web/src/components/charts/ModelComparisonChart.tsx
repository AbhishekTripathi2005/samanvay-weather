"use client";

import React from "react";
import { useQuery } from "@tanstack/react-query";
import { fetchSourcesCompare } from "@/lib/api";
import { useOpsStore } from "@/lib/store";
import { formatNumber } from "@/lib/utils";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Cell,
  ReferenceLine,
  CartesianGrid
} from "recharts";

export function ModelComparisonChart() {
  const { variable, lead, selectedRegion, regime, season } = useOpsStore();

  const { data, isLoading } = useQuery({
    queryKey: ["sourcesCompare", variable, lead, selectedRegion, regime, season],
    queryFn: () => fetchSourcesCompare(variable, lead, selectedRegion, regime, season),
    staleTime: 30000
  });

  if (isLoading || !data) {
    return (
      <div className="h-80 w-full animate-pulse rounded-xl bg-slate-900/60 border border-slate-800 flex items-center justify-center">
        <span className="text-xs font-mono text-cyan-400">Synthesizing 7 Model Pipelines...</span>
      </div>
    );
  }

  const chartData = data.models.map((m) => ({
    name: m.name,
    value: m.value,
    color: m.color,
    type: m.type,
    badge: m.badge,
    weight: (m.weight * 100).toFixed(1),
    rmse: m.rmse,
    ets: m.ets,
    ci_lower: m.ci_lower,
    ci_upper: m.ci_upper,
    isBlended: m.id === "samanvay"
  }));

  const consensusVal = data.consensus.value;

  return (
    <div className="w-full h-80 rounded-xl border border-cyan-500/20 bg-[#070B14]/80 p-4 backdrop-blur-md flex flex-col justify-between">
      <div className="flex items-center justify-between mb-2">
        <div>
          <div className="flex items-center space-x-2">
            <h3 className="font-heading font-bold text-sm text-cyan-300">
              7-Model Head-to-Head Comparison
            </h3>
            <span className="font-mono text-[10px] text-slate-400 bg-slate-800/80 px-1.5 py-0.5 rounded border border-slate-700">
              Region: {selectedRegion} (+{lead}h)
            </span>
          </div>
          <p className="text-[11px] text-slate-400">
            NWP Physics vs AI Surrogates vs SAMANVAY Consensus
          </p>
        </div>
        <div className="text-right font-mono">
          <span className="text-[10px] text-slate-400 block">Blended Consensus:</span>
          <span className="text-cyan-400 font-bold text-sm">
            {formatNumber(consensusVal)} {variable === "rainfall" ? "mm" : (variable.startsWith("t") ? "°C" : "km/h")}
          </span>
        </div>
      </div>

      <div className="w-full flex-1">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={chartData} margin={{ top: 15, right: 10, left: -10, bottom: 20 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
            <XAxis
              dataKey="name"
              stroke="#64748b"
              tick={{ fontSize: 10, fill: "#94a3b8" }}
              interval={0}
              angle={-20}
              textAnchor="end"
            />
            <YAxis stroke="#64748b" tick={{ fontSize: 10, fill: "#94a3b8" }} />
            <Tooltip
              content={({ active, payload }) => {
                if (active && payload && payload.length) {
                  const item = payload[0].payload;
                  return (
                    <div className="rounded-lg border border-cyan-500/40 bg-slate-950/95 p-3 font-mono text-xs shadow-xl">
                      <div className="flex items-center space-x-2 mb-1">
                        <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: item.color }} />
                        <span className="font-bold text-slate-200">{item.name}</span>
                        <span className="text-[10px] text-cyan-400 font-semibold bg-cyan-950 px-1 rounded">
                          {item.type}
                        </span>
                      </div>
                      <p className="text-slate-300">Forecast: <strong className="text-cyan-300">{item.value}</strong></p>
                      <p className="text-slate-400 text-[11px]">Dynamic Weight: {item.weight}%</p>
                      <p className="text-slate-400 text-[11px]">RMSE: {item.rmse} | ETS: {item.ets}</p>
                      <p className="text-slate-500 text-[10px] mt-1">{item.badge}</p>
                    </div>
                  );
                }
                return null;
              }}
            />
            <ReferenceLine
              y={consensusVal}
              stroke="#00F5FF"
              strokeDasharray="4 4"
              strokeWidth={1.5}
              label={{ value: "SAMANVAY Consensus", fill: "#00F5FF", fontSize: 10, position: "top" }}
            />
            <Bar dataKey="value" radius={[4, 4, 0, 0]}>
              {chartData.map((entry, index) => (
                <Cell
                  key={`cell-${index}`}
                  fill={entry.color}
                  stroke={entry.isBlended ? "#00F5FF" : "none"}
                  strokeWidth={entry.isBlended ? 2 : 0}
                />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
