"use client";

import React from "react";
import { GlassCard } from "@/components/ui/GlassCard";
import {
  ResponsiveContainer,
  ComposedChart,
  Line,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid
} from "recharts";
import { ReliabilityBin } from "@/lib/types";

interface ReliabilityDiagramProps {
  bins: ReliabilityBin[];
  brierSkillScore?: number;
  title?: string;
  threshold?: number;
  className?: string;
}

export function ReliabilityDiagram({
  bins = [],
  brierSkillScore = 37.3,
  title = "Reliability Diagram (Calibrated Exceedance)",
  threshold = 64.5,
  className = ""
}: ReliabilityDiagramProps) {
  const chartData = bins.map((b) => ({
    probPct: Math.round(b.forecast_probability * 100),
    perfect: Math.round(b.perfect_reliability * 100),
    rawObs: Math.round(b.raw_observed_frequency * 100),
    calibratedObs: Math.round(b.calibrated_observed_frequency * 100),
    count: b.sample_count
  }));

  return (
    <GlassCard className={`p-4 flex flex-col ${className}`}>
      <div className="flex items-center justify-between mb-3">
        <div>
          <h3 className="text-sm font-semibold text-text-1">{title}</h3>
          <p className="text-xs text-text-3">Threshold: {threshold}mm | Brier Skill Score: +{brierSkillScore}%</p>
        </div>
        <div className="flex items-center gap-3 text-[11px]">
          <div className="flex items-center gap-1">
            <span className="w-3 h-0.5 bg-emerald-400 rounded-full" />
            <span className="text-text-2">Calibrated</span>
          </div>
          <div className="flex items-center gap-1">
            <span className="w-3 h-0.5 bg-pink-400 stroke-dasharray rounded-full" />
            <span className="text-text-3">Raw AI/NWP</span>
          </div>
        </div>
      </div>

      <div className="w-full h-64">
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
            <XAxis dataKey="probPct" stroke="#888" fontSize={10} unit="%" />
            <YAxis stroke="#888" fontSize={10} domain={[0, 100]} unit="%" />
            <Tooltip
              content={({ active, payload }) => {
                if (!active || !payload || !payload.length) return null;
                const d = payload[0].payload;
                return (
                  <div className="bg-surface-2 p-2 rounded border border-border shadow-lg text-xs">
                    <p className="font-semibold text-text-1 mb-1">Forecast Bin: {d.probPct}%</p>
                    <p className="text-emerald-400">Calibrated Obs: {d.calibratedObs}%</p>
                    <p className="text-pink-400">Raw Obs: {d.rawObs}%</p>
                    <p className="text-text-3">Samples: {d.count}</p>
                  </div>
                );
              }}
            />
            {/* 1:1 Diagonal Perfect Reliability */}
            <Line
              type="monotone"
              dataKey="perfect"
              stroke="#64748B"
              strokeDasharray="4 4"
              strokeWidth={1.5}
              dot={false}
            />
            {/* Raw Uncalibrated Curve */}
            <Line
              type="monotone"
              dataKey="rawObs"
              stroke="#F472B6"
              strokeWidth={2}
              dot={{ r: 2 }}
            />
            {/* SAMANVAY Calibrated Curve */}
            <Line
              type="monotone"
              dataKey="calibratedObs"
              stroke="#10B981"
              strokeWidth={2.5}
              dot={{ r: 3.5, fill: "#10B981" }}
            />
          </ComposedChart>
        </ResponsiveContainer>
      </div>
    </GlassCard>
  );
}
