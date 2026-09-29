"use client";

import React from "react";
import { GlassCard } from "@/components/ui/GlassCard";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  ReferenceLine
} from "recharts";
import { CheckCircle, AlertTriangle, ShieldCheck, Activity } from "lucide-react";
import { QuantileDataPoint, ModelScorecardItem } from "@/lib/types";

interface BiasInspectorProps {
  quantileData: QuantileDataPoint[];
  modelScorecards: ModelScorecardItem[];
  variable: string;
  regionName: string;
}

export function BiasInspector({
  quantileData,
  modelScorecards,
  variable,
  regionName
}: BiasInspectorProps) {
  const getUnit = (v: string) => {
    switch (v) {
      case "rainfall":
        return "mm/24h";
      case "tmax":
      case "tmin":
        return "°C";
      case "wind_speed":
      case "wind_gust":
        return "km/h";
      default:
        return "units";
    }
  };
  const unit = getUnit(variable);

  // Custom Quantile Tooltip
  const CustomQuantileTooltip = ({ active, payload, label }: any) => {
    if (!active || !payload || !payload.length) return null;
    const pt = payload[0]?.payload as QuantileDataPoint;
    if (!pt) return null;

    return (
      <div className="rounded-xl border border-cyan-500/30 bg-[#070B14]/95 backdrop-blur-md p-3 shadow-xl text-xs font-mono">
        <div className="flex items-center justify-between pb-1.5 mb-1.5 border-b border-white/10">
          <span className="font-bold text-cyan-300">{pt.percentile}th Percentile Quantile</span>
          {pt.tail_marker && (
            <span className="text-[10px] px-1.5 py-0.5 rounded bg-rose-950/60 text-rose-300 border border-rose-500/30 font-bold">
              Extreme Tail
            </span>
          )}
        </div>
        <div className="flex flex-col gap-1">
          <div className="flex items-center justify-between gap-4">
            <span className="text-amber-400">Observed Truth:</span>
            <span className="font-bold text-amber-300">{pt.observed} {unit}</span>
          </div>
          <div className="flex items-center justify-between gap-4">
            <span className="text-rose-400">Raw Uncalibrated:</span>
            <span className="font-bold text-rose-300">{pt.raw} {unit}</span>
          </div>
          <div className="flex items-center justify-between gap-4">
            <span className="text-cyan-400">EQM Corrected:</span>
            <span className="font-bold text-cyan-300">{pt.corrected} {unit}</span>
          </div>
          <div className="pt-1 mt-1 border-t border-white/10 text-[10px] text-text-3">
            Tail bias reduced from {Math.abs(pt.raw - pt.observed).toFixed(2)} to {Math.abs(pt.corrected - pt.observed).toFixed(2)} {unit}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
      {/* 1. Quantile Mapping Curve (6 cols) */}
      <GlassCard className="lg:col-span-6 p-5 flex flex-col gap-4 border-cyan-500/20">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm font-bold text-text-1 flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-cyan-400" />
              <span>Empirical Quantile Mapping (EQM) Inspector</span>
            </h3>
            <p className="text-xs text-text-3">
              CDF calibration curve comparing raw forecast, EQM corrected, and reference observed truth
            </p>
          </div>
          <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-cyan-950/60 border border-cyan-500/30 text-cyan-300">
            Tail Preservation
          </span>
        </div>

        <div className="w-full h-64">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={quantileData} margin={{ top: 10, right: 20, left: 0, bottom: 10 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />

              <XAxis
                dataKey="percentile"
                stroke="#64748B"
                fontSize={10}
                tickFormatter={(v) => `${v}%`}
                tickLine={false}
              />

              <YAxis
                stroke="#64748B"
                fontSize={10}
                tickLine={false}
                unit={` ${unit}`}
              />

              <Tooltip content={<CustomQuantileTooltip />} />

              {/* 95th Percentile Reference Marker */}
              <ReferenceLine
                x={95}
                stroke="#F43F5E"
                strokeDasharray="3 3"
                label={{ value: "95th Tail", fill: "#F43F5E", fontSize: 10, position: "top" }}
              />

              {/* Observed Reference Line */}
              <Line
                type="monotone"
                dataKey="observed"
                stroke="#F59E0B"
                strokeWidth={2}
                dot={false}
                name="Observed Truth"
              />

              {/* Raw Uncalibrated Forecast Line */}
              <Line
                type="monotone"
                dataKey="raw"
                stroke="#F43F5E"
                strokeWidth={1.5}
                strokeDasharray="4 4"
                dot={false}
                name="Raw Uncalibrated"
              />

              {/* Corrected EQM Line */}
              <Line
                type="monotone"
                dataKey="corrected"
                stroke="#00F5FF"
                strokeWidth={2.5}
                dot={{ r: 2.5, fill: "#00F5FF" }}
                activeDot={{ r: 5 }}
                name="EQM Corrected"
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        <div className="flex items-center justify-between text-[11px] font-mono p-2 rounded bg-surface-2/60 border border-border/40">
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-0.5 bg-amber-400" />
            <span className="text-text-2">Observed Reference</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-0.5 bg-rose-400 border border-dashed border-rose-400" />
            <span className="text-text-2">Raw (Under-predicts extremes)</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-1 bg-[#00F5FF] rounded-full" />
            <span className="text-cyan-300 font-semibold">EQM Tail Match</span>
          </div>
        </div>
      </GlassCard>

      {/* 2. Per-Model Error Scorecard Table (6 cols) */}
      <GlassCard className="lg:col-span-6 p-5 flex flex-col gap-4 border-cyan-500/20">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm font-bold text-text-1 flex items-center gap-1.5">
              <Activity className="w-4 h-4 text-cyan-400" />
              <span>Operational Error Scorecard</span>
            </h3>
            <p className="text-xs text-text-3">
              Verification metrics for {regionName} ({variable})
            </p>
          </div>
          <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-950/60 border border-emerald-500/30 text-emerald-300">
            300-Day Validation
          </span>
        </div>

        <div className="overflow-x-auto w-full">
          <table className="w-full text-left font-mono text-xs">
            <thead>
              <tr className="border-b border-border/60 text-text-3 text-[10px] uppercase tracking-wider">
                <th className="py-2 px-2.5">Model</th>
                <th className="py-2 px-2 text-right">Bias ({unit})</th>
                <th className="py-2 px-2 text-right">MAE ({unit})</th>
                <th className="py-2 px-2 text-right">RMSE ({unit})</th>
                <th className="py-2 px-2.5 text-right">Corr (r)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/30">
              {modelScorecards.map((s) => {
                const isBlend = s.id === "samanvay";
                return (
                  <tr
                    key={s.id}
                    className={`transition-colors ${
                      isBlend
                        ? "bg-cyan-500/10 font-bold text-cyan-300 border-l-2 border-cyan-400"
                        : "hover:bg-surface-2 text-text-2"
                    }`}
                  >
                    <td className="py-2 px-2.5 flex items-center gap-2">
                      <span
                        className="w-2 h-2 rounded-full flex-shrink-0"
                        style={{ backgroundColor: s.color }}
                      />
                      <span className="truncate">{s.name}</span>
                      {isBlend && (
                        <span className="text-[9px] px-1 py-0.2 rounded bg-cyan-400/20 text-cyan-300 font-normal">
                          Consensus
                        </span>
                      )}
                    </td>
                    <td
                      className={`py-2 px-2 text-right ${
                        Math.abs(s.bias) < 0.5 ? "text-emerald-400" : "text-text-2"
                      }`}
                    >
                      {s.bias > 0 ? `+${s.bias.toFixed(2)}` : s.bias.toFixed(2)}
                    </td>
                    <td className="py-2 px-2 text-right text-text-1">
                      {s.mae.toFixed(2)}
                    </td>
                    <td
                      className={`py-2 px-2 text-right ${
                        isBlend ? "text-cyan-300 font-bold" : "text-text-1"
                      }`}
                    >
                      {s.rmse.toFixed(2)}
                    </td>
                    <td className="py-2 px-2.5 text-right font-bold text-emerald-400">
                      {s.corr.toFixed(3)}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        <div className="flex items-center gap-2 text-[11px] text-text-3 font-mono pt-1 border-t border-border/40">
          <CheckCircle className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0" />
          <span>
            SAMANVAY achieves the lowest RMSE ({modelScorecards.find((m) => m.id === "samanvay")?.rmse.toFixed(2)} {unit}) and highest Pearson correlation ($r = {modelScorecards.find((m) => m.id === "samanvay")?.corr.toFixed(3)}$).
          </span>
        </div>
      </GlassCard>
    </div>
  );
}
