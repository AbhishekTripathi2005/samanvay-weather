"use client";

import React from "react";
import { GlassCard } from "@/components/ui/GlassCard";
import {
  ResponsiveContainer,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  Tooltip
} from "recharts";

interface RadialWeightsProps {
  weights: Record<string, number>;
  modelsMeta?: Array<{ id: string; name: string; color: string }>;
  title?: string;
  className?: string;
}

export function RadialWeights({
  weights,
  modelsMeta = [],
  title = "Model Weight Allocation",
  className = ""
}: RadialWeightsProps) {
  const chartData = Object.entries(weights).map(([k, v]) => {
    const meta = modelsMeta.find((m) => m.id === k);
    return {
      model: meta?.name || k,
      weightPct: Math.round(v * 100),
      rawWeight: v,
      color: meta?.color || "#00F5FF"
    };
  });

  return (
    <GlassCard className={`p-4 flex flex-col ${className}`}>
      <div className="mb-2">
        <h3 className="text-sm font-semibold text-text-1">{title}</h3>
        <p className="text-xs text-text-3">Multi-model affinity balance (sums to 100%)</p>
      </div>

      <div className="w-full h-64">
        <ResponsiveContainer width="100%" height="100%">
          <RadarChart data={chartData} margin={{ top: 10, right: 15, bottom: 10, left: 15 }}>
            <PolarGrid stroke="rgba(255,255,255,0.08)" />
            <PolarAngleAxis dataKey="model" stroke="#94A3B8" fontSize={10} />
            <PolarRadiusAxis angle={30} domain={[0, 40]} stroke="#64748B" fontSize={9} />
            <Radar
              name="Weight %"
              dataKey="weightPct"
              stroke="#00F5FF"
              fill="#00F5FF"
              fillOpacity={0.35}
            />
            <Tooltip
              content={({ active, payload }) => {
                if (!active || !payload || !payload.length) return null;
                const d = payload[0].payload;
                return (
                  <div className="bg-surface-2 p-2 rounded border border-border shadow-lg text-xs">
                    <span className="font-semibold text-text-1">{d.model}</span>:{" "}
                    <span className="font-mono text-cyan-400 font-bold">{d.weightPct}%</span>
                  </div>
                );
              }}
            />
          </RadarChart>
        </ResponsiveContainer>
      </div>
    </GlassCard>
  );
}
