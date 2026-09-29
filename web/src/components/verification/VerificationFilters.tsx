"use client";

import React from "react";
import { GlassCard } from "@/components/ui/GlassCard";
import { STATES_UTS } from "@/lib/constants";
import { VerificationMetricKey } from "@/lib/types";
import { Filter, Sparkles } from "lucide-react";
import { Tooltip } from "@/components/ui/Tooltip";

export interface MetricDefinition {
  key: VerificationMetricKey;
  label: string;
  name: string;
  unit: string;
  better: "lower" | "higher";
  desc: string;
}

export const METRIC_DEFINITIONS: MetricDefinition[] = [
  { key: "rmse", label: "RMSE", name: "Root Mean Square Error", unit: "mm / °C / km/h", better: "lower", desc: "Penalizes large errors heavily; primary operational benchmark metric" },
  { key: "mae", label: "MAE", name: "Mean Absolute Error", unit: "mm / °C / km/h", better: "lower", desc: "Linear average magnitude of forecast errors" },
  { key: "bias", label: "Bias", name: "Mean Error (Bias)", unit: "mm / °C / km/h", better: "lower", desc: "Systematic over-prediction (+) or under-prediction (-)" },
  { key: "corr", label: "Corr (r)", name: "Pearson Correlation", unit: "[-1 to 1]", better: "higher", desc: "Spatial & temporal pattern coherence with observed truth" },
  { key: "crps", label: "CRPS", name: "Continuous Ranked Prob Score", unit: "Score", better: "lower", desc: "Probabilistic distribution calibration and sharpness penalty" },
  { key: "pod", label: "POD", name: "Probability of Detection", unit: "[0 to 1]", better: "higher", desc: "Hit rate: proportion of observed extreme events correctly forecasted" },
  { key: "far", label: "FAR", name: "False Alarm Ratio", unit: "[0 to 1]", better: "lower", desc: "Proportion of forecasted alarms that did not materialize" },
  { key: "csi", label: "CSI", name: "Critical Success Index", unit: "[0 to 1]", better: "higher", desc: "Threat score combining hits, misses, and false alarms" },
  { key: "ets", label: "ETS", name: "Equitable Threat Score", unit: "[-0.3 to 1]", better: "higher", desc: "Threat score penalizing hits occurring purely by random chance" },
  { key: "sedi", label: "SEDI", name: "Symmetric Extremal Dep Index", unit: "[-1 to 1]", better: "higher", desc: "Extreme tail dependency index independent of base rate" }
];

interface VerificationFiltersProps {
  selectedMetric: VerificationMetricKey;
  onSelectMetric: (metric: VerificationMetricKey) => void;
  variable: string;
  onSelectVariable: (v: string) => void;
  leadDay: number;
  onSelectLeadDay: (d: number) => void;
  season: string;
  onSelectSeason: (s: string) => void;
  region: string;
  onSelectRegion: (r: string) => void;
  regime: string;
  onSelectRegime: (rg: string) => void;
}

export function VerificationFilters({
  selectedMetric,
  onSelectMetric,
  variable,
  onSelectVariable,
  leadDay,
  onSelectLeadDay,
  season,
  onSelectSeason,
  region,
  onSelectRegion,
  regime,
  onSelectRegime
}: VerificationFiltersProps) {
  const currentMetricDef = METRIC_DEFINITIONS.find((m) => m.key === selectedMetric) || METRIC_DEFINITIONS[0];

  return (
    <GlassCard className="p-4 flex flex-col gap-4 border-cyan-500/20">
      {/* Top Row: Metric Selector Pills */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-cyan-400" />
            <span className="text-xs font-bold uppercase tracking-wider text-text-2">
              Primary Verification Metric
            </span>
          </div>
          <span className="text-[11px] font-mono text-text-3">
            {currentMetricDef.name} ({currentMetricDef.unit}) •{" "}
            <span className={currentMetricDef.better === "lower" ? "text-cyan-400 font-semibold" : "text-emerald-400 font-semibold"}>
              {currentMetricDef.better === "lower" ? "Lower is better (↓)" : "Higher is better (↑)"}
            </span>
          </span>
        </div>

        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
          {METRIC_DEFINITIONS.map((m) => {
            const isSelected = selectedMetric === m.key;
            return (
              <Tooltip key={m.key} content={`${m.name}: ${m.desc}`}>
                <button
                  onClick={() => onSelectMetric(m.key)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-mono font-semibold transition-all whitespace-nowrap border ${
                    isSelected
                      ? "bg-cyan-500/20 text-cyan-300 border-cyan-400 shadow-[0_0_12px_rgba(6,182,212,0.3)]"
                      : "bg-surface-2 text-text-3 border-border hover:bg-surface-3 hover:text-text-1"
                  }`}
                >
                  {m.label}
                </button>
              </Tooltip>
            );
          })}
        </div>
      </div>

      {/* Bottom Row: Multi-Dimensional Filter Controls */}
      <div className="flex flex-wrap items-center gap-3 pt-3 border-t border-border/50 text-xs">
        <div className="flex items-center gap-1.5 text-text-3">
          <Filter className="w-3.5 h-3.5 text-cyan-400" />
          <span className="font-semibold uppercase tracking-wider text-[10px]">Slice Filters:</span>
        </div>

        {/* Variable */}
        <div className="flex items-center gap-1.5 bg-surface-2 px-2.5 py-1 rounded-lg border border-border">
          <span className="text-text-3 text-[11px]">Var:</span>
          <select
            value={variable}
            onChange={(e) => onSelectVariable(e.target.value)}
            className="bg-transparent font-medium text-text-1 outline-none text-xs cursor-pointer"
          >
            <option value="rainfall" className="bg-surface-1">Rainfall (mm/24h)</option>
            <option value="tmax" className="bg-surface-1">Max Temp (°C)</option>
            <option value="tmin" className="bg-surface-1">Min Temp (°C)</option>
            <option value="wind" className="bg-surface-1">Wind Speed (km/h)</option>
          </select>
        </div>

        {/* Lead Horizon */}
        <div className="flex items-center gap-1.5 bg-surface-2 px-2.5 py-1 rounded-lg border border-border">
          <span className="text-text-3 text-[11px]">Lead:</span>
          <select
            value={leadDay}
            onChange={(e) => onSelectLeadDay(Number(e.target.value))}
            className="bg-transparent font-medium text-cyan-300 font-mono outline-none text-xs cursor-pointer"
          >
            {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((d) => (
              <option key={d} value={d} className="bg-surface-1">
                Day {d} (+{d * 24}h)
              </option>
            ))}
          </select>
        </div>

        {/* Season */}
        <div className="flex items-center gap-1.5 bg-surface-2 px-2.5 py-1 rounded-lg border border-border">
          <span className="text-text-3 text-[11px]">Season:</span>
          <select
            value={season}
            onChange={(e) => onSelectSeason(e.target.value)}
            className="bg-transparent font-medium text-text-1 outline-none text-xs cursor-pointer"
          >
            <option value="all" className="bg-surface-1">All Seasons (Annual)</option>
            <option value="JJAS" className="bg-surface-1">JJAS (Monsoon)</option>
            <option value="MAM" className="bg-surface-1">MAM (Pre-Monsoon)</option>
            <option value="DJF" className="bg-surface-1">DJF (Winter)</option>
            <option value="OND" className="bg-surface-1">OND (Post-Monsoon)</option>
          </select>
        </div>

        {/* Region */}
        <div className="flex items-center gap-1.5 bg-surface-2 px-2.5 py-1 rounded-lg border border-border">
          <span className="text-text-3 text-[11px]">Region:</span>
          <select
            value={region}
            onChange={(e) => onSelectRegion(e.target.value)}
            className="bg-transparent font-medium text-text-1 outline-none text-xs cursor-pointer max-w-[140px] truncate"
          >
            <option value="all" className="bg-surface-1">All-India (National)</option>
            {STATES_UTS.map((s) => (
              <option key={s.code} value={s.code} className="bg-surface-1">
                {s.name} ({s.code})
              </option>
            ))}
          </select>
        </div>

        {/* Synoptic Regime */}
        <div className="flex items-center gap-1.5 bg-surface-2 px-2.5 py-1 rounded-lg border border-border">
          <span className="text-text-3 text-[11px]">Regime:</span>
          <select
            value={regime}
            onChange={(e) => onSelectRegime(e.target.value)}
            className="bg-transparent font-medium text-text-1 outline-none text-xs cursor-pointer"
          >
            <option value="all" className="bg-surface-1">All Synoptic Regimes</option>
            <option value="Active monsoon" className="bg-surface-1">Active Monsoon</option>
            <option value="Break monsoon" className="bg-surface-1">Break Monsoon</option>
            <option value="Western Disturbance" className="bg-surface-1">Western Disturbance</option>
            <option value="Cyclone/Depression" className="bg-surface-1">Cyclone / Depression</option>
            <option value="Heatwave ridge" className="bg-surface-1">Heatwave Ridge</option>
            <option value="Neutral" className="bg-surface-1">Neutral Regime</option>
          </select>
        </div>
      </div>
    </GlassCard>
  );
}
