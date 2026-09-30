"use client";

import React from "react";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid
} from "recharts";
import { GlassCard } from "@/components/ui/GlassCard";

export interface LineFanPoint {
  lead: number;
  label: string;
  consensus: number;
  p10: number;
  p90: number;
  [key: string]: any;
}

interface LineFanProps {
  data: LineFanPoint[];
  variable?: string;
  title?: string;
  unit?: string;
  className?: string;
}

function LineFanComponent({
  data,
  variable = "Rainfall",
  title = "Predictive Plume & Uncertainty Fan (Day 1..10)",
  unit = "mm/24h",
  className = ""
}: LineFanProps) {
  return (
    <GlassCard
      role="region"
      aria-label={title}
      className={`p-4 flex flex-col ${className}`}
    >
      {/* Screen-reader accessible alternative table */}
      <div className="sr-only">
        <h4>Forecast Lead Trajectory and Uncertainty Intervals</h4>
        <table>
          <thead>
            <tr>
              <th scope="col">Lead Time</th>
              <th scope="col">Consensus Mean ({unit})</th>
              <th scope="col">P10 Lower Bound</th>
              <th scope="col">P90 Upper Bound</th>
            </tr>
          </thead>
          <tbody>
            {data.map((d) => (
              <tr key={d.lead}>
                <td>{d.label}</td>
                <td>{d.consensus}</td>
                <td>{d.p10}</td>
                <td>{d.p90}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-sm font-semibold text-text-1">{title}</h3>
          <p className="text-xs text-text-3">Consensus trajectory with P10–P90 dispersion plume</p>
        </div>
        <div className="flex items-center gap-3 text-xs">
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-0.5 bg-cyan-400 rounded-full" />
            <span className="text-text-2">SAMANVAY Mean</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-2 bg-cyan-500/20 border border-cyan-500/40 rounded-sm" />
            <span className="text-text-3">P10–P90 Spread</span>
          </div>
        </div>
      </div>

      <div className="w-full h-64">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
            <defs>
              <linearGradient id="plumeGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#00F5FF" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#00F5FF" stopOpacity={0.05} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
            <XAxis dataKey="label" stroke="#888" fontSize={11} tickLine={false} />
            <YAxis stroke="#888" fontSize={11} tickLine={false} />
            <Tooltip
              content={({ active, payload }) => {
                if (!active || !payload || !payload.length) return null;
                const d = payload[0].payload as LineFanPoint;
                return (
                  <div className="bg-surface-2/95 border border-border p-2.5 rounded-lg shadow-xl text-xs backdrop-blur-md">
                    <p className="font-semibold text-text-1 mb-1">{d.label} ({d.lead}h)</p>
                    <p className="text-cyan-400 font-mono font-bold">
                      Consensus: {d.consensus} {unit}
                    </p>
                    <p className="text-text-3 font-mono text-[11px]">
                      Spread: {d.p10} - {d.p90} {unit}
                    </p>
                  </div>
                );
              }}
            />
            {/* P90 Area */}
            <Area
              type="monotone"
              dataKey="p90"
              stroke="transparent"
              fill="url(#plumeGradient)"
              fillOpacity={1}
            />
            {/* Consensus Line */}
            <Line
              type="monotone"
              dataKey="consensus"
              stroke="#00F5FF"
              strokeWidth={2.5}
              dot={{ r: 3, fill: "#00F5FF", strokeWidth: 0 }}
              activeDot={{ r: 5, stroke: "#FFF", strokeWidth: 2 }}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </GlassCard>
  );
}

export const LineFan = React.memo(LineFanComponent);

