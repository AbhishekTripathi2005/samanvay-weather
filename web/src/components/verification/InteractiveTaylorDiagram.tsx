"use client";

import React, { useState } from "react";
import { GlassCard } from "@/components/ui/GlassCard";
import { TaylorModelItem } from "@/lib/types";
import { Compass, HelpCircle } from "lucide-react";
import { Tooltip } from "@/components/ui/Tooltip";

interface InteractiveTaylorDiagramProps {
  referenceStd?: number;
  models: TaylorModelItem[];
  title?: string;
  leadLabel?: string;
  variable?: string;
}

export function InteractiveTaylorDiagram({
  referenceStd = 12.5,
  models = [],
  title = "Interactive Taylor Diagram",
  leadLabel = "Day 3",
  variable = "Rainfall"
}: InteractiveTaylorDiagramProps) {
  const [hoveredModel, setHoveredModel] = useState<TaylorModelItem | null>(null);

  const size = 360;
  const padding = 50;
  const radius = size - padding * 2;

  // Converts (correlation, normalized_std) to SVG Cartesian coordinates
  // Angle theta = arccos(r)
  const toCoords = (r: number, normStd: number) => {
    const clampedR = Math.max(0, Math.min(1, r));
    const theta = Math.acos(clampedR); // 0 to pi/2
    const dist = (normStd / 1.75) * radius;
    const x = padding + dist * Math.cos(theta);
    const y = size - padding - dist * Math.sin(theta);
    return { x, y };
  };

  const refCoords = toCoords(1.0, 1.0);

  return (
    <GlassCard className="p-5 flex flex-col gap-3 border-cyan-500/20">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2 border-b border-border/50">
        <div>
          <div className="flex items-center gap-2">
            <Compass className="w-5 h-5 text-cyan-400" />
            <h2 className="text-base font-bold text-text-1 tracking-tight">
              {title} ({leadLabel})
            </h2>
          </div>
          <p className="text-xs text-text-3">
            Radial: Normalized Spread (σf/σref) • Spoke: Pearson Corr (r) • Arcs: Centered RMS (E&apos;)
          </p>
        </div>

        <Tooltip content="Taylor diagrams summarize relative pattern correlation, variability (std-dev), and centered RMS error in a single polar coordinate system. Closer to the Reference point (★) means higher skill.">
          <div className="flex items-center gap-1 text-xs text-cyan-300 font-mono cursor-help">
            <HelpCircle className="w-3.5 h-3.5" />
            <span>How to Read</span>
          </div>
        </Tooltip>
      </div>

      <div className="flex flex-col lg:flex-row items-center justify-between gap-6 py-2">
        {/* SVG Diagram Canvas */}
        <div className="relative select-none shrink-0">
          <svg width={size} height={size} className="overflow-visible">
            {/* Grid Radial Circles: Normalized Std = 0.5, 1.0, 1.5 */}
            {[0.5, 1.0, 1.5].map((std) => {
              const rPx = radius * (std / 1.75);
              return (
                <g key={std}>
                  <path
                    d={`M ${padding} ${size - padding} A ${rPx} ${rPx} 0 0 1 ${padding + rPx} ${size - padding}`}
                    fill="none"
                    stroke={std === 1.0 ? "rgba(6, 182, 212, 0.4)" : "rgba(255, 255, 255, 0.08)"}
                    strokeWidth={std === 1.0 ? "1.5" : "1"}
                    strokeDasharray={std === 1.0 ? "4,4" : "2,2"}
                  />
                  <text
                    x={padding + rPx}
                    y={size - padding + 14}
                    fontSize="9"
                    fill={std === 1.0 ? "#22D3EE" : "#64748B"}
                    textAnchor="middle"
                    className="font-mono"
                  >
                    {std.toFixed(1)}
                  </text>
                </g>
              );
            })}

            {/* Outer Arc (Normalized Std = 1.75) */}
            <path
              d={`M ${padding} ${size - padding} A ${radius} ${radius} 0 0 1 ${padding + radius} ${size - padding}`}
              fill="none"
              stroke="rgba(255, 255, 255, 0.2)"
              strokeWidth="1.5"
            />

            {/* Axes */}
            <line
              x1={padding}
              y1={size - padding}
              x2={padding + radius}
              y2={size - padding}
              stroke="rgba(255, 255, 255, 0.4)"
              strokeWidth="1.5"
            />
            <line
              x1={padding}
              y1={size - padding}
              x2={padding}
              y2={size - padding - radius}
              stroke="rgba(255, 255, 255, 0.4)"
              strokeWidth="1.5"
            />

            {/* Correlation Radial Spokes (0.2, 0.4, 0.6, 0.8, 0.9, 0.95, 0.99) */}
            {[0.2, 0.4, 0.6, 0.8, 0.9, 0.95, 0.99].map((corr) => {
              const pt = toCoords(corr, 1.75);
              return (
                <g key={corr}>
                  <line
                    x1={padding}
                    y1={size - padding}
                    x2={pt.x}
                    y2={pt.y}
                    stroke="rgba(255, 255, 255, 0.08)"
                    strokeWidth="1"
                  />
                  <text
                    x={pt.x + (corr > 0.9 ? 4 : 2)}
                    y={pt.y - 3}
                    fontSize="9"
                    fill="#94A3B8"
                    className="font-mono font-medium"
                  >
                    {corr}
                  </text>
                </g>
              );
            })}

            {/* Centered RMS Arcs centered around Reference Point (1.0, 1.0) */}
            {[0.25, 0.5, 0.75].map((crms) => {
              const crmsPx = (crms / 1.75) * radius;
              return (
                <circle
                  key={crms}
                  cx={refCoords.x}
                  cy={refCoords.y}
                  r={crmsPx}
                  fill="none"
                  stroke="rgba(16, 185, 129, 0.2)"
                  strokeWidth="1"
                  strokeDasharray="3,3"
                />
              );
            })}

            {/* Reference Observed Truth Star */}
            <g transform={`translate(${refCoords.x}, ${refCoords.y})`}>
              <circle r="7" fill="rgba(6, 182, 212, 0.2)" stroke="#22D3EE" strokeWidth="1.5" />
              <circle r="3" fill="#22D3EE" />
              <text x="10" y="3" fontSize="10" fill="#22D3EE" className="font-mono font-bold">
                REF (Truth)
              </text>
            </g>

            {/* Model Points */}
            {models.map((m) => {
              const coords = toCoords(m.correlation, m.normalized_std);
              const isBlend = m.id === "samanvay";
              const isHovered = hoveredModel?.id === m.id;

              return (
                <g
                  key={m.id}
                  transform={`translate(${coords.x}, ${coords.y})`}
                  className="cursor-pointer transition-transform"
                  onMouseEnter={() => setHoveredModel(m)}
                  onMouseLeave={() => setHoveredModel(null)}
                >
                  {/* Glowing Focus Ring on Hover */}
                  {isHovered && (
                    <circle
                      r="14"
                      fill="none"
                      stroke={m.color}
                      strokeWidth="2"
                      className="animate-ping opacity-75"
                    />
                  )}

                  {/* Outer point ring */}
                  <circle
                    r={isBlend ? 8 : 6}
                    fill={isBlend ? "#00F5FF" : m.color}
                    stroke="#0B0F19"
                    strokeWidth="2"
                    className="shadow-lg transition-all"
                  />

                  {/* Inner center dot */}
                  <circle r={isBlend ? 3 : 2} fill="#FFFFFF" />

                  {/* Point Label */}
                  <text
                    x="9"
                    y="3"
                    fontSize="9"
                    fill={isBlend ? "#00F5FF" : isHovered ? "#FFFFFF" : "#CBD5E1"}
                    className="font-mono font-semibold select-none pointer-events-none drop-shadow-md"
                  >
                    {m.name}
                  </text>
                </g>
              );
            })}
          </svg>
        </div>

        {/* Hover Inspector Card */}
        <div className="flex-1 w-full flex flex-col gap-3">
          <div className="text-xs font-semibold uppercase tracking-wider text-text-3">
            Point Telemetry Inspector
          </div>

          {hoveredModel ? (
            <GlassCard className="p-4 bg-surface-2/80 border-cyan-500/40 flex flex-col gap-2.5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: hoveredModel.color }}
                  />
                  <span className="font-bold text-sm text-text-1">{hoveredModel.name}</span>
                </div>
                <span
                  className="text-[10px] font-mono px-2 py-0.5 rounded border uppercase"
                  style={{
                    color: hoveredModel.color,
                    borderColor: `${hoveredModel.color}60`,
                    backgroundColor: `${hoveredModel.color}15`
                  }}
                >
                  {hoveredModel.type}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-2 text-xs font-mono pt-1">
                <div className="bg-surface-3/60 p-2 rounded border border-border/50">
                  <span className="text-text-3 text-[10px] block">Pearson Corr (r)</span>
                  <span className="font-bold text-cyan-300 text-sm">
                    {hoveredModel.correlation.toFixed(3)}
                  </span>
                </div>

                <div className="bg-surface-3/60 p-2 rounded border border-border/50">
                  <span className="text-text-3 text-[10px] block">Norm Std (σf/σref)</span>
                  <span className="font-bold text-text-1 text-sm">
                    {hoveredModel.normalized_std.toFixed(3)}
                  </span>
                </div>

                <div className="bg-surface-3/60 p-2 rounded border border-border/50">
                  <span className="text-text-3 text-[10px] block">Centered RMS (E&apos;)</span>
                  <span className="font-bold text-emerald-400 text-sm">
                    {hoveredModel.centered_rms.toFixed(2)}
                  </span>
                </div>

                <div className="bg-surface-3/60 p-2 rounded border border-border/50">
                  <span className="text-text-3 text-[10px] block">Std Dev (σf)</span>
                  <span className="font-bold text-text-1 text-sm">
                    {hoveredModel.std_dev.toFixed(2)}
                  </span>
                </div>
              </div>

              <p className="text-[11px] text-text-3 mt-1 leading-snug">
                {hoveredModel.id === "samanvay"
                  ? "SAMANVAY achieves maximal pattern correlation (r > 0.99) while maintaining optimal variance calibration (σf/σref ≈ 1.0)."
                  : hoveredModel.type === "AI"
                  ? "AI models exhibit high correlation on large scales but typically underestimate variance (spectral smoothing on peaks)."
                  : "NWP models capture physical variability but suffer larger spatial phase error and centered RMS dispersion."}
              </p>
            </GlassCard>
          ) : (
            <GlassCard className="p-4 bg-surface-2/40 border-border/60 flex flex-col items-center justify-center text-center py-8">
              <Compass className="w-8 h-8 text-cyan-400/40 mb-2 animate-spin-slow" />
              <span className="text-xs text-text-2 font-medium">Hover over any model node</span>
              <span className="text-[11px] text-text-3">Inspect correlation, normalized spread, and centered RMS</span>
            </GlassCard>
          )}

          {/* Legend Strip */}
          <div className="flex flex-wrap items-center gap-2 pt-1 text-[11px] font-mono">
            {models.map((m) => (
              <button
                key={m.id}
                onMouseEnter={() => setHoveredModel(m)}
                onMouseLeave={() => setHoveredModel(null)}
                className={`flex items-center gap-1.5 px-2 py-0.5 rounded border transition-colors ${
                  hoveredModel?.id === m.id
                    ? "bg-white/10 border-white/40"
                    : "bg-surface-2/60 border-border/50 text-text-3 hover:text-text-1"
                }`}
              >
                <span className="w-2 h-2 rounded-full" style={{ backgroundColor: m.color }} />
                <span>{m.name}</span>
              </button>
            ))}
          </div>
        </div>
      </div>
    </GlassCard>
  );
}
