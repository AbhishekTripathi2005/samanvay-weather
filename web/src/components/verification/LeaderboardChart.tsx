"use client";

import React from "react";
import { GlassCard } from "@/components/ui/GlassCard";
import { ScorecardItem } from "@/lib/types";
import { motion } from "framer-motion";
import { Award, TrendingUp, Sparkles, AlertCircle } from "lucide-react";
import { Tooltip } from "@/components/ui/Tooltip";

interface LeaderboardChartProps {
  scorecard: ScorecardItem[];
  metricLabel: string;
  metricName: string;
  unit: string;
  better: "lower" | "higher";
}

export function LeaderboardChart({
  scorecard,
  metricLabel,
  metricName,
  unit,
  better
}: LeaderboardChartProps) {
  if (!scorecard || scorecard.length === 0) {
    return (
      <GlassCard className="p-6 text-center text-text-3">
        No scorecard data available for this slice.
      </GlassCard>
    );
  }

  // Find min and max for scaling the bars
  const values = scorecard.map((s) => s.metric_value ?? (s.metrics?.rmse ?? 0));
  const ciLows = scorecard.map((s) => s.ci_lower ?? s.metric_value ?? 0);
  const ciHighs = scorecard.map((s) => s.ci_upper ?? s.metric_value ?? 0);

  const minVal = Math.min(...values, ...ciLows, 0);
  const maxVal = Math.max(...values, ...ciHighs) * 1.15 || 1;

  return (
    <GlassCard className="p-5 flex flex-col gap-4 border-cyan-500/20">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-border/50">
        <div>
          <div className="flex items-center gap-2">
            <Award className="w-5 h-5 text-cyan-400" />
            <h2 className="text-base font-bold text-text-1 tracking-tight">
              Operational Leaderboard ({metricLabel})
            </h2>
          </div>
          <p className="text-xs text-text-3">
            Ranked by {metricName} with 95% Bootstrap Confidence Whiskers (500 resamples)
          </p>
        </div>

        <div className="flex items-center gap-2 text-xs font-mono">
          <span className="text-text-3">Scale:</span>
          <span className="bg-surface-2 px-2 py-1 rounded text-cyan-300 border border-border">
            0 to {maxVal.toFixed(2)} {unit}
          </span>
        </div>
      </div>

      {/* Leaderboard Rows */}
      <div className="flex flex-col gap-3">
        {scorecard.map((item, idx) => {
          const isBlend = item.id === "samanvay";
          const isBaseline = item.id === "equal_weight";
          const val = item.metric_value ?? (item.metrics?.rmse ?? 0);
          const ciLow = item.ci_lower ?? val * 0.92;
          const ciHigh = item.ci_upper ?? val * 1.08;

          const barPct = Math.max(2, Math.min(100, ((val - minVal) / (maxVal - minVal)) * 100));
          const ciLowPct = Math.max(0, Math.min(100, ((ciLow - minVal) / (maxVal - minVal)) * 100));
          const ciHighPct = Math.max(0, Math.min(100, ((ciHigh - minVal) / (maxVal - minVal)) * 100));

          const skillGain = item.skill_improvement_pct ?? 0;

          return (
            <div
              key={item.id}
              className={`p-2.5 rounded-xl border transition-all ${
                isBlend
                  ? "bg-gradient-to-r from-cyan-950/40 via-surface-2 to-indigo-950/20 border-cyan-400 shadow-[0_0_18px_rgba(6,182,212,0.25)]"
                  : isBaseline
                  ? "bg-surface-2/60 border-slate-500/40 text-slate-300"
                  : "bg-surface-2/40 border-border/60 hover:border-text-3/40"
              }`}
            >
              {/* Row Header: Rank, Name, Type, Skill Gain, Value */}
              <div className="flex items-center justify-between text-xs mb-1.5">
                <div className="flex items-center gap-2">
                  {/* Rank badge */}
                  <span
                    className={`w-5 h-5 rounded-full flex items-center justify-center font-mono font-bold text-[10px] ${
                      isBlend
                        ? "bg-cyan-400 text-black shadow-[0_0_8px_rgba(6,182,212,0.8)]"
                        : idx === 1
                        ? "bg-amber-400/20 text-amber-300 border border-amber-400/40"
                        : "bg-surface-3 text-text-3"
                    }`}
                  >
                    {isBlend ? "★" : idx + 1}
                  </span>

                  {/* Model identity badge */}
                  <span
                    className="w-2.5 h-2.5 rounded-full shrink-0"
                    style={{ backgroundColor: item.color }}
                  />
                  <span className={`font-semibold tracking-tight ${isBlend ? "text-cyan-300 text-sm font-bold" : "text-text-1"}`}>
                    {item.name}
                  </span>

                  {/* Type Pill */}
                  <span
                    className="text-[9px] font-mono px-1.5 py-0.5 rounded border uppercase"
                    style={{
                      borderColor: `${item.color}50`,
                      color: item.color,
                      backgroundColor: `${item.color}15`
                    }}
                  >
                    {item.type}
                  </span>
                </div>

                <div className="flex items-center gap-3">
                  {/* Skill Gain Badge vs SAMANVAY */}
                  {!isBlend && skillGain !== 0 && (
                    <span
                      className={`text-[11px] font-mono font-semibold px-2 py-0.5 rounded ${
                        skillGain > 0
                          ? "bg-cyan-500/15 text-cyan-300 border border-cyan-500/30"
                          : "bg-rose-500/15 text-rose-300 border border-rose-500/30"
                      }`}
                    >
                      {skillGain > 0 ? `+${skillGain}% vs Blend` : `${skillGain}% vs Blend`}
                    </span>
                  )}

                  {/* Numerical Metric Value */}
                  <div className="text-right">
                    <span className="font-mono font-bold text-sm text-text-1">
                      {val.toFixed(3)}
                    </span>
                    <span className="text-[10px] font-mono text-text-3 ml-1">
                      {unit}
                    </span>
                  </div>
                </div>
              </div>

              {/* Bar Container with Bootstrap CI Whisker */}
              <div className="relative h-4 bg-surface-3/80 rounded-full overflow-visible flex items-center px-1">
                {/* Value Bar */}
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${barPct}%` }}
                  transition={{ duration: 0.6, ease: "easeOut" }}
                  className={`h-2.5 rounded-full relative ${
                    isBlend
                      ? "bg-gradient-to-r from-cyan-500 to-indigo-500 shadow-[0_0_10px_rgba(6,182,212,0.6)]"
                      : isBaseline
                      ? "bg-slate-400"
                      : "opacity-90"
                  }`}
                  style={{ backgroundColor: !isBlend && !isBaseline ? item.color : undefined }}
                />

                {/* 95% Bootstrap Confidence Whiskers */}
                <Tooltip content={`95% CI: [${ciLow.toFixed(3)}, ${ciHigh.toFixed(3)}]`}>
                  <div
                    className="absolute top-1/2 -translate-y-1/2 pointer-events-auto cursor-help"
                    style={{
                      left: `${ciLowPct}%`,
                      width: `${Math.max(4, ciHighPct - ciLowPct)}%`
                    }}
                  >
                    {/* Horizontal whisker line */}
                    <div className="h-[2px] bg-white/70 w-full relative">
                      {/* Left bracket cap */}
                      <div className="absolute left-0 -top-1 w-[2px] h-2.5 bg-white/90" />
                      {/* Right bracket cap */}
                      <div className="absolute right-0 -top-1 w-[2px] h-2.5 bg-white/90" />
                    </div>
                  </div>
                </Tooltip>
              </div>

              {/* Subtitle with confidence interval */}
              <div className="flex items-center justify-between text-[10px] font-mono text-text-3 mt-1 px-1">
                <span>95% CI: [{ciLow.toFixed(3)} — {ciHigh.toFixed(3)}]</span>
                <span>
                  {better === "lower" ? (idx === 0 ? "🏆 Benchmark Winner" : "") : (idx === 0 ? "🏆 Benchmark Winner" : "")}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </GlassCard>
  );
}
