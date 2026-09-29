"use client";

import React from "react";
import { GlassCard } from "@/components/ui/GlassCard";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Legend
} from "recharts";
import { TrendingUp, Layers } from "lucide-react";

interface WeightEvolutionStripProps {
  evolutionData: Array<{
    lead: number;
    day: string;
    [modelId: string]: any;
  }>;
  selectedRegionName: string;
  selectedRegionCode: string;
}

const MODELS = [
  { key: "ncum_g", name: "NCUM-G", color: "#06B6D4" },
  { key: "neps", name: "NEPS", color: "#3B82F6" },
  { key: "imd_gfs", name: "IMD-GFS", color: "#10B981" },
  { key: "ecmwf_ifs", name: "ECMWF-IFS", color: "#6366F1" },
  { key: "graphcast", name: "GraphCast", color: "#8B5CF6" },
  { key: "pangu", name: "Pangu", color: "#D946EF" },
  { key: "fourcastnet", name: "FourCastNet", color: "#EC4899" }
];

export function WeightEvolutionStrip({
  evolutionData,
  selectedRegionName,
  selectedRegionCode
}: WeightEvolutionStripProps) {
  // Convert fractions to percentages for stacked 100% area rendering
  const formattedData = evolutionData.map((d) => {
    const item: Record<string, any> = {
      lead: d.lead,
      day: d.day,
      label: d.day
    };
    MODELS.forEach((m) => {
      item[m.key] = Math.round((d[m.key] || 0) * 1000) / 10;
    });
    return item;
  });

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (!active || !payload || !payload.length) return null;

    return (
      <div className="rounded-xl border border-cyan-500/30 bg-[#070B14]/95 backdrop-blur-md p-3 shadow-xl text-xs font-mono min-w-[200px]">
        <div className="flex items-center justify-between pb-1.5 mb-1.5 border-b border-white/10">
          <span className="font-bold text-cyan-300">{label} Stacking Weights</span>
          <span className="text-[10px] text-text-3">100% Total</span>
        </div>
        <div className="flex flex-col gap-1">
          {payload
            .slice()
            .reverse()
            .map((entry: any) => (
              <div key={entry.name} className="flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full" style={{ backgroundColor: entry.color }} />
                  <span className="text-text-2">{entry.name}:</span>
                </div>
                <span className="font-semibold text-text-1">{entry.value}%</span>
              </div>
            ))}
        </div>
      </div>
    );
  };

  return (
    <GlassCard className="p-5 flex flex-col gap-4 border-cyan-500/20">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2 border-b border-border/40">
        <div>
          <h3 className="text-sm font-bold text-text-1 flex items-center gap-1.5">
            <Layers className="w-4 h-4 text-cyan-400" />
            <span>Lead-Time Weight Evolution ({selectedRegionName} - {selectedRegionCode})</span>
          </h3>
          <p className="text-xs text-text-3">
            Dynamic weight transitions across Day 1 to Day 10: AI short-range primacy shifting to Ensemble dispersion
          </p>
        </div>
        <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-cyan-950/60 border border-cyan-500/30 text-cyan-300">
          100% Stacked Area
        </span>
      </div>

      <div className="w-full h-56">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={formattedData} margin={{ top: 10, right: 15, left: -10, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
            <XAxis
              dataKey="day"
              stroke="#64748B"
              fontSize={10}
              tickLine={false}
              axisLine={{ stroke: "rgba(255,255,255,0.1)" }}
            />
            <YAxis
              stroke="#64748B"
              fontSize={10}
              tickLine={false}
              axisLine={{ stroke: "rgba(255,255,255,0.1)" }}
              unit="%"
              domain={[0, 100]}
            />
            <Tooltip content={<CustomTooltip />} />

            {/* Stacked Areas in Reverse Order for Intuitive Layering */}
            {MODELS.map((m) => (
              <Area
                key={m.key}
                type="monotone"
                dataKey={m.key}
                stackId="1"
                stroke={m.color}
                fill={m.color}
                fillOpacity={0.65}
                name={m.name}
              />
            ))}
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* Legend Bar */}
      <div className="flex flex-wrap items-center justify-center gap-3 pt-2 border-t border-border/30 text-[11px] font-mono">
        {MODELS.map((m) => (
          <div key={m.key} className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-sm" style={{ backgroundColor: m.color }} />
            <span className="text-text-2">{m.name}</span>
          </div>
        ))}
      </div>
    </GlassCard>
  );
}
