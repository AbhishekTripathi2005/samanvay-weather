"use client";

import React, { useState } from "react";
import { GlassCard } from "@/components/ui/GlassCard";
import { MODELS } from "@/lib/constants";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  Legend
} from "recharts";
import { TrendingUp, Layers } from "lucide-react";

interface SkillVsLeadChartProps {
  curves: Array<Record<string, any>>;
  variable?: string;
  metric?: string;
  onSelectMetric?: (metric: string) => void;
}

export function SkillVsLeadChart({
  curves = [],
  variable = "rainfall",
  metric = "rmse",
  onSelectMetric
}: SkillVsLeadChartProps) {
  const [activeMetric, setActiveMetric] = useState(metric);

  const handleMetricChange = (newMetric: string) => {
    setActiveMetric(newMetric);
    if (onSelectMetric) onSelectMetric(newMetric);
  };

  return (
    <GlassCard className="p-5 flex flex-col gap-4 border-cyan-500/20">
      {/* Header & Metric Switcher */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-border/50">
        <div>
          <div className="flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-cyan-400" />
            <h2 className="text-base font-bold text-text-1 tracking-tight">
              Skill Trajectory Across Lead Times (Day 1 to Day 10)
            </h2>
          </div>
          <p className="text-xs text-text-3">
            Error growth & dispersion across forecast horizons: AI models dominate short-range, NWP/Ensemble anchors medium-range
          </p>
        </div>

        {/* Metric Selector Tabs */}
        <div className="flex items-center bg-surface-2 p-1 rounded-lg border border-border text-xs font-mono">
          {[
            { id: "rmse", label: "RMSE" },
            { id: "mae", label: "MAE" },
            { id: "corr", label: "Corr (r)" }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => handleMetricChange(tab.id)}
              className={`px-3 py-1 rounded transition-colors ${
                activeMetric === tab.id
                  ? "bg-cyan-500/20 text-cyan-300 font-bold border border-cyan-500/40"
                  : "text-text-3 hover:text-text-1"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Trajectory Multi-Line Chart */}
      <div className="w-full h-[320px]">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={curves} margin={{ top: 10, right: 20, bottom: 15, left: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255, 255, 255, 0.07)" vertical={false} />
            <XAxis
              dataKey="label"
              stroke="#64748B"
              fontSize={11}
              fontFamily="monospace"
              tickLine={false}
            />
            <YAxis
              stroke="#64748B"
              fontSize={11}
              fontFamily="monospace"
              tickLine={false}
              domain={activeMetric === "corr" ? [0.7, 1.0] : ["auto", "auto"]}
              unit={activeMetric === "corr" ? "" : variable === "tmax" ? "°C" : "mm"}
            />

            <RechartsTooltip
              content={({ active, payload, label }) => {
                if (!active || !payload || !payload.length) return null;
                return (
                  <div className="bg-surface-1/95 border border-cyan-500/40 p-3 rounded-xl shadow-2xl backdrop-blur-xl text-xs font-mono">
                    <span className="text-cyan-300 font-bold block mb-1.5">{label} Verification</span>
                    <div className="flex flex-col gap-1 text-[11px]">
                      {payload.map((entry: any) => {
                        const isBlend = entry.dataKey === "samanvay";
                        return (
                          <div
                            key={entry.dataKey}
                            className={`flex items-center justify-between gap-4 py-0.5 ${
                              isBlend ? "font-bold text-cyan-300 border-t border-border pt-1 mt-0.5" : "text-text-2"
                            }`}
                          >
                            <div className="flex items-center gap-1.5">
                              <span
                                className="w-2 h-2 rounded-full shrink-0"
                                style={{ backgroundColor: entry.color }}
                              />
                              <span>{entry.name}:</span>
                            </div>
                            <span className="font-mono">{entry.value}</span>
                          </div>
                        );
                      })}
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

            {/* 7 Models */}
            {MODELS.map((m) => (
              <Line
                key={m.id}
                type="monotone"
                dataKey={m.id}
                name={m.name}
                stroke={m.color}
                strokeWidth={1.5}
                dot={{ r: 2 }}
                opacity={0.7}
              />
            ))}

            {/* Glowing SAMANVAY Consensus Line */}
            <Line
              type="monotone"
              dataKey="samanvay"
              name="SAMANVAY Consensus"
              stroke="#00F5FF"
              strokeWidth={3}
              dot={{ r: 4, fill: "#00F5FF", stroke: "#0B0F19", strokeWidth: 1.5 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      <div className="text-[11px] text-text-3 border-t border-border/50 pt-2 flex items-center justify-between font-mono">
        <span>AI models (GraphCast/Pangu) command Day 1–3 but degrade past Day 5</span>
        <span className="text-cyan-400">Consensus maintains lowest error curve</span>
      </div>
    </GlassCard>
  );
}
