"use client";

import React, { useState } from "react";
import { GlassCard } from "@/components/ui/GlassCard";

interface HeatmapProps {
  title?: string;
  description?: string;
  rows: Array<{ label: string; [key: string]: any }>;
  columns: Array<{ key: string; label: string; color?: string }>;
  minVal?: number;
  maxVal?: number;
  className?: string;
}

function HeatmapComponent({
  title = "Weights Heatmap",
  description = "Dynamic weights across forecast leads and models",
  rows,
  columns,
  minVal = 0.0,
  maxVal = 0.4,
  className = ""
}: HeatmapProps) {
  const [hoveredCell, setHoveredCell] = useState<{ row: string; col: string; val: number } | null>(null);

  const getColor = (val: number) => {
    const ratio = Math.max(0, Math.min(1, (val - minVal) / Math.max(0.01, maxVal - minVal)));
    // Hue from deep navy (0.0) to vibrant cyan/electric green (1.0)
    return `rgba(0, 245, 255, ${0.1 + ratio * 0.85})`;
  };

  return (
    <GlassCard
      role="region"
      aria-label={title}
      className={`p-4 flex flex-col ${className}`}
    >
      <div className="mb-3">
        <h3 className="text-sm font-semibold text-text-1">{title}</h3>
        <p className="text-xs text-text-3">{description}</p>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs border-collapse">
          <thead>
            <tr className="border-b border-border/50">
              <th className="py-2 px-2 text-text-3 font-medium">Lead / Regime</th>
              {columns.map((c) => (
                <th key={c.key} className="py-2 px-2 font-mono text-center text-text-2">
                  <span className="px-1.5 py-0.5 rounded text-[10px]" style={{ color: c.color || "#00F5FF" }}>
                    {c.label}
                  </span>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((row, rIdx) => (
              <tr key={rIdx} className="border-b border-border/20 hover:bg-surface-2/40 transition-colors">
                <td className="py-2 px-2 font-medium text-text-1 whitespace-nowrap">{row.label}</td>
                {columns.map((c) => {
                  const val = typeof row[c.key] === "number" ? (row[c.key] as number) : 0;
                  const pct = Math.round(val * 100);
                  return (
                    <td
                      key={c.key}
                      onMouseEnter={() => setHoveredCell({ row: row.label, col: c.label, val })}
                      onMouseLeave={() => setHoveredCell(null)}
                      className="py-1.5 px-2 text-center transition-all cursor-pointer"
                    >
                      <div
                        className="py-1.5 rounded font-mono font-bold text-[11px] border border-cyan-500/20"
                        style={{
                          backgroundColor: getColor(val),
                          color: val > 0.22 ? "#070B14" : "#E2E8F0"
                        }}
                      >
                        {pct}%
                      </div>
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {hoveredCell && (
        <div className="mt-2 text-xs text-text-2 bg-surface-2 px-2.5 py-1 rounded-md self-start border border-border">
          <span className="text-cyan-400 font-semibold">{hoveredCell.col}</span> at {hoveredCell.row}:{" "}
          <span className="font-mono font-bold text-text-1">{hoveredCell.val.toFixed(4)}</span> (
          {Math.round(hoveredCell.val * 100)}% weight)
        </div>
      )}
    </GlassCard>
  );
}

export const Heatmap = React.memo(HeatmapComponent);

