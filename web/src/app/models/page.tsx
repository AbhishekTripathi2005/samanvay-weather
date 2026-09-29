"use client";

import React from "react";
import { useQuery } from "@tanstack/react-query";
import { fetchSourcesCompare } from "@/lib/api";
import { useOpsStore } from "@/lib/store";
import { formatNumber } from "@/lib/utils";
import { SOURCES_LIST, SAMANVAY_SOURCE } from "@/lib/constants";
import { CheckCircle2, TrendingUp, Cpu, Award, Zap, Layers, BarChart2 } from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
  Cell
} from "recharts";

export default function ModelsPage() {
  const { variable, lead, selectedRegion, regime, season } = useOpsStore();

  const { data, isLoading } = useQuery({
    queryKey: ["sourcesCompare", variable, lead, selectedRegion, regime, season],
    queryFn: () => fetchSourcesCompare(variable, lead, selectedRegion, regime, season),
    staleTime: 30000
  });

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="glass-panel rounded-xl p-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <span className="p-1.5 rounded-lg bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
              <Cpu className="h-5 w-5" />
            </span>
            <h2 className="font-heading text-xl font-bold text-cyan-300">
              7-Model Head-to-Head Evaluation & Skill Scorecard
            </h2>
          </div>
          <p className="text-xs text-slate-400 mt-1 max-w-3xl">
            Rigorous verification comparing Numerical Weather Prediction (NCUM-G, IMD-GFS, ECMWF-IFS, NEPS Ensemble)
            against SOTA AI Weather Surrogates (GraphCast, Pangu, FourCastNet) and SAMANVAY Blended Consensus.
          </p>
        </div>
        <div className="flex items-center space-x-3 font-mono text-xs">
          <div className="bg-slate-900/80 border border-slate-700 p-2.5 rounded-lg text-right">
            <span className="text-[10px] text-slate-400 block">Lead Horizon:</span>
            <span className="text-cyan-400 font-bold">+{lead}h (Day {lead / 24})</span>
          </div>
          <div className="bg-slate-900/80 border border-slate-700 p-2.5 rounded-lg text-right">
            <span className="text-[10px] text-slate-400 block">Active Regime:</span>
            <span className="text-violet-400 font-bold">{regime}</span>
          </div>
        </div>
      </div>

      {/* Main Scorecard Table */}
      <div className="glass-panel rounded-xl p-5">
        <h3 className="font-heading font-bold text-base text-slate-200 mb-4 flex items-center space-x-2">
          <Award className="h-4 w-4 text-amber-400" />
          <span>Operational Verification Scorecard (IMD Test Suite)</span>
        </h3>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs font-mono">
            <thead className="bg-slate-900/90 text-slate-400 border-b border-slate-800">
              <tr>
                <th className="py-3 px-3">Model</th>
                <th className="py-3 px-3">Type</th>
                <th className="py-3 px-3 text-right">Forecast ({variable})</th>
                <th className="py-3 px-3 text-right">Dynamic Weight</th>
                <th className="py-3 px-3 text-right">RMSE (mm / °C)</th>
                <th className="py-3 px-3 text-right">ETS (&gt;64.5mm)</th>
                <th className="py-3 px-3 text-right">Spread/Skill</th>
                <th className="py-3 px-3 text-right">CRPS</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {data?.models.map((m) => {
                const isConsensus = m.id === "samanvay";
                return (
                  <tr
                    key={m.id}
                    className={`transition-colors ${
                      isConsensus
                        ? "bg-cyan-950/30 font-bold border-l-2 border-cyan-400"
                        : "hover:bg-slate-800/30"
                    }`}
                  >
                    <td className="py-3 px-3 flex items-center space-x-2">
                      <span className="h-2.5 w-2.5 rounded-full flex-shrink-0" style={{ backgroundColor: m.color }} />
                      <span className={isConsensus ? "text-cyan-300 font-bold" : "text-slate-200"}>
                        {m.name}
                      </span>
                      {isConsensus && (
                        <span className="rounded bg-cyan-500/20 px-1 text-[9px] text-cyan-300 border border-cyan-500/30">
                          Consensus
                        </span>
                      )}
                    </td>
                    <td className="py-3 px-3 text-slate-400">{m.type}</td>
                    <td className="py-3 px-3 text-right text-slate-100 font-bold">{formatNumber(m.value)}</td>
                    <td className="py-3 px-3 text-right text-cyan-400 font-bold">
                      {(m.weight * 100).toFixed(1)}%
                    </td>
                    <td className="py-3 px-3 text-right text-slate-300">{formatNumber(m.rmse)}</td>
                    <td className="py-3 px-3 text-right text-emerald-400 font-bold">{m.ets.toFixed(3)}</td>
                    <td className="py-3 px-3 text-right text-slate-300">{m.spread_skill_ratio.toFixed(2)}</td>
                    <td className="py-3 px-3 text-right text-violet-300">{formatNumber(m.crps)}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Model Profiles Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {[...SOURCES_LIST, SAMANVAY_SOURCE].map((s) => (
          <div
            key={s.id}
            className="glass-panel rounded-xl p-4 flex flex-col justify-between space-y-3"
            style={{ borderTop: `3px solid ${s.color}` }}
          >
            <div>
              <div className="flex items-center justify-between mb-1">
                <span className="font-heading font-bold text-sm text-slate-100">{s.name}</span>
                <span
                  className="px-1.5 py-0.5 rounded text-[10px] font-mono font-semibold"
                  style={{ backgroundColor: `${s.color}20`, color: s.color, border: `1px solid ${s.color}40` }}
                >
                  {s.type}
                </span>
              </div>
              <p className="text-[11px] text-slate-400 line-clamp-1">{s.full_name}</p>
            </div>

            <div className="font-mono text-[11px] space-y-1 bg-slate-900/60 p-2.5 rounded-lg border border-slate-800">
              <div className="flex justify-between text-slate-400">
                <span>Agency:</span>
                <span className="text-slate-200">{s.organization}</span>
              </div>
              <div className="flex justify-between text-slate-400">
                <span>Grid Res:</span>
                <span className="text-cyan-400">{s.resolution}</span>
              </div>
              <div className="flex justify-between text-slate-400">
                <span>Core:</span>
                <span className="text-slate-300 truncate max-w-[130px]">{s.physics_type}</span>
              </div>
            </div>

            <div className="text-[10px] text-slate-400 pt-1 border-t border-slate-800">
              Fixed Palette: <code className="text-cyan-400">{s.color}</code>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
