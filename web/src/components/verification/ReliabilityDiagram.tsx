"use client";

import React from "react";
import { GlassCard } from "@/components/ui/GlassCard";
import { ReliabilityBin } from "@/lib/types";
import {
  ResponsiveContainer,
  ComposedChart,
  Line,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  Legend
} from "recharts";
import { ShieldCheck, BarChart3, TrendingUp, AlertTriangle } from "lucide-react";

interface ReliabilityDiagramProps {
  bins: ReliabilityBin[];
  brierScoreRaw?: number;
  brierScoreCalibrated?: number;
  brierSkillScorePct?: number;
  variable?: string;
  leadLabel?: string;
  threshold?: number;
}

export function ReliabilityDiagram({
  bins = [],
  brierScoreRaw = 0.142,
  brierScoreCalibrated = 0.089,
  brierSkillScorePct = 37.3,
  variable = "Rainfall",
  leadLabel = "Day 3",
  threshold = 64.5
}: ReliabilityDiagramProps) {
  // Format chart data
  const chartData = bins.map((b) => ({
    bin: b.bin,
    p_fcst: Math.round(b.forecast_probability * 100),
    perfect: Math.round(b.perfect_reliability * 100),
    raw: Math.round(b.raw_observed_frequency * 100),
    calibrated: Math.round(b.calibrated_observed_frequency * 100),
    count: b.sample_count
  }));

  return (
    <GlassCard className="p-5 flex flex-col gap-4 border-cyan-500/20">
      {/* Header with Brier Scores */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-border/50">
        <div>
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-cyan-400" />
            <h2 className="text-base font-bold text-text-1 tracking-tight">
              Reliability Calibration & Sample Frequency ({leadLabel})
            </h2>
          </div>
          <p className="text-xs text-text-3">
            Observed relative frequency vs forecast probability for extreme threshold (≥ {threshold} {variable === "tmax" ? "°C" : "mm"})
          </p>
        </div>

        {/* Brier Score Pill Group */}
        <div className="flex items-center gap-2 font-mono text-xs">
          <div className="bg-surface-2 px-2.5 py-1 rounded-lg border border-border flex items-center gap-1.5">
            <span className="text-text-3">Raw BS:</span>
            <span className="text-rose-400 font-semibold">{brierScoreRaw.toFixed(3)}</span>
          </div>
          <div className="bg-surface-2 px-2.5 py-1 rounded-lg border border-border flex items-center gap-1.5">
            <span className="text-text-3">Calibrated BS:</span>
            <span className="text-emerald-400 font-semibold">{brierScoreCalibrated.toFixed(3)}</span>
          </div>
          <div className="bg-cyan-500/15 px-2.5 py-1 rounded-lg border border-cyan-400/30 flex items-center gap-1.5 text-cyan-300 font-bold">
            <TrendingUp className="w-3.5 h-3.5" />
            <span>+{brierSkillScorePct.toFixed(1)}% BSS</span>
          </div>
        </div>
      </div>

      {/* Main Dual-Axis Chart: Reliability Curve + Histogram */}
      <div className="w-full h-[320px]">
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart data={chartData} margin={{ top: 10, right: 20, bottom: 20, left: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255, 255, 255, 0.07)" vertical={false} />
            <XAxis
              dataKey="bin"
              stroke="#64748B"
              fontSize={11}
              fontFamily="monospace"
              tickLine={false}
              label={{ value: "Forecast Probability Bin (%)", position: "insideBottom", offset: -12, fill: "#64748B", fontSize: 11 }}
            />
            {/* Left Y Axis: Observed Frequency */}
            <YAxis
              yAxisId="freq"
              domain={[0, 100]}
              stroke="#64748B"
              fontSize={11}
              fontFamily="monospace"
              tickLine={false}
              unit="%"
              label={{ value: "Observed Frequency (%)", angle: -90, position: "insideLeft", offset: 12, fill: "#64748B", fontSize: 11 }}
            />
            {/* Right Y Axis: Sample Count Histogram */}
            <YAxis
              yAxisId="count"
              orientation="right"
              stroke="#64748B"
              fontSize={10}
              fontFamily="monospace"
              tickLine={false}
              domain={[0, 300]}
              label={{ value: "Sample Count", angle: 90, position: "insideRight", offset: 12, fill: "#64748B", fontSize: 10 }}
            />

            <RechartsTooltip
              content={({ active, payload, label }) => {
                if (!active || !payload || !payload.length) return null;
                const d = payload[0].payload;
                return (
                  <div className="bg-surface-1/95 border border-cyan-500/40 p-3 rounded-xl shadow-2xl backdrop-blur-xl text-xs font-mono">
                    <span className="text-cyan-300 font-bold block mb-1.5">{label} Forecast Probability</span>
                    <div className="flex flex-col gap-1 text-[11px]">
                      <div className="flex items-center justify-between gap-4">
                        <span className="text-text-3">Perfect 1:1:</span>
                        <span className="text-white font-semibold">{d.perfect}%</span>
                      </div>
                      <div className="flex items-center justify-between gap-4">
                        <span className="text-cyan-400">SAMANVAY Calibrated:</span>
                        <span className="text-cyan-300 font-bold">{d.calibrated}%</span>
                      </div>
                      <div className="flex items-center justify-between gap-4">
                        <span className="text-rose-400">Raw Uncalibrated:</span>
                        <span className="text-rose-300 font-semibold">{d.raw}%</span>
                      </div>
                      <div className="flex items-center justify-between gap-4 border-t border-border pt-1 mt-1 text-slate-400">
                        <span>Sample Size (Nk):</span>
                        <span className="text-text-1 font-bold">{d.count} cases</span>
                      </div>
                    </div>
                  </div>
                );
              }}
            />

            <Legend
              verticalAlign="top"
              height={36}
              wrapperStyle={{ fontSize: 11, fontFamily: "monospace" }}
            />

            {/* Background Sample Count Bars */}
            <Bar
              yAxisId="count"
              dataKey="count"
              name="Sample Count (Nk)"
              fill="rgba(100, 116, 139, 0.2)"
              radius={[4, 4, 0, 0]}
            />

            {/* Perfect 1:1 Diagonal Reference Line */}
            <Line
              yAxisId="freq"
              type="monotone"
              dataKey="perfect"
              name="1:1 Perfect Reliability"
              stroke="rgba(255, 255, 255, 0.4)"
              strokeWidth={1.5}
              strokeDasharray="4 4"
              dot={false}
            />

            {/* Raw Overconfident Model Line */}
            <Line
              yAxisId="freq"
              type="monotone"
              dataKey="raw"
              name="Raw Uncalibrated Model"
              stroke="#F43F5E"
              strokeWidth={2}
              dot={{ r: 3, fill: "#F43F5E" }}
            />

            {/* SAMANVAY Calibrated Line */}
            <Line
              yAxisId="freq"
              type="monotone"
              dataKey="calibrated"
              name="SAMANVAY Calibrated Blend"
              stroke="#00F5FF"
              strokeWidth={2.5}
              dot={{ r: 4, fill: "#00F5FF", stroke: "#0B0F19", strokeWidth: 1.5 }}
            />
          </ComposedChart>
        </ResponsiveContainer>
      </div>

      {/* Explanatory Footnote */}
      <div className="text-[11px] text-text-3 border-t border-border/50 pt-2 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <span>
          💡 <strong>Reliability Check</strong>: Raw models exhibit overconfidence bias (forecast probabilities exceed observed event frequency). Isotonic regression calibration pulls SAMANVAY along the 1:1 diagonal.
        </span>
        <span className="font-mono text-cyan-400 shrink-0">
          Calibration: Isotonic Regression
        </span>
      </div>
    </GlassCard>
  );
}
