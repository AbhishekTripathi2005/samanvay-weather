"use client";

import React from "react";
import { GlassCard } from "@/components/ui/GlassCard";
import { TaylorModelItem } from "@/lib/types";

interface TaylorDiagramProps {
  referenceStd?: number;
  models: TaylorModelItem[];
  title?: string;
  className?: string;
}

function TaylorDiagramComponent({
  referenceStd = 12.5,
  models = [],
  title = "Taylor Diagram (Pattern Correlation & Spread)",
  className = ""
}: TaylorDiagramProps) {
  const size = 320;
  const padding = 45;
  const radius = size - padding * 2;

  // Converts (r, normalized_std) to Cartesian SVG coords
  // Angle theta = arccos(r)
  const toCoords = (r: number, normStd: number) => {
    const clampedR = Math.max(-1, Math.min(1, r));
    const theta = Math.acos(clampedR); // 0 to pi
    const dist = (normStd / 1.75) * radius;
    const x = padding + dist * Math.cos(theta);
    const y = size - padding - dist * Math.sin(theta);
    return { x, y };
  };

  const refCoords = toCoords(1.0, 1.0);

  return (
    <GlassCard
      role="region"
      aria-label={title}
      className={`p-4 flex flex-col ${className}`}
    >
      {/* Screen-reader accessible alternative table */}
      <div className="sr-only">
        <h4>Model Performance Metrics (Taylor Diagram)</h4>
        <table>
          <thead>
            <tr>
              <th scope="col">Model</th>
              <th scope="col">Correlation</th>
              <th scope="col">Normalized Std-Dev</th>
              <th scope="col">Centered RMS</th>
            </tr>
          </thead>
          <tbody>
            {models.map((m) => (
              <tr key={m.id}>
                <td>{m.name}</td>
                <td>{m.correlation}</td>
                <td>{m.normalized_std}</td>
                <td>{m.centered_rms}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="mb-2">
        <h3 className="text-sm font-semibold text-text-1">{title}</h3>
        <p className="text-xs text-text-3">Radial: normalized std-dev | Spoke: correlation | Arcs: centered RMS</p>
      </div>

      <div className="flex justify-center items-center py-2">
        <svg width={size} height={size} className="overflow-visible select-none">
          {/* Quarter Circle Arc (Normalized Std = 1.0) */}
          <path
            d={`M ${padding} ${size - padding} A ${radius * (1.0 / 1.75)} ${radius * (1.0 / 1.75)} 0 0 1 ${padding + radius * (1.0 / 1.75)} ${size - padding}`}
            fill="none"
            stroke="rgba(0, 245, 255, 0.3)"
            strokeWidth="1.5"
            strokeDasharray="4,4"
          />

          {/* Outer Arc (Normalized Std = 1.75) */}
          <path
            d={`M ${padding} ${size - padding} A ${radius} ${radius} 0 0 1 ${padding + radius} ${size - padding}`}
            fill="none"
            stroke="rgba(255,255,255,0.15)"
            strokeWidth="1.5"
          />

          {/* Axes */}
          <line
            x1={padding}
            y1={size - padding}
            x2={padding + radius}
            y2={size - padding}
            stroke="rgba(255,255,255,0.3)"
            strokeWidth="1"
          />
          <line
            x1={padding}
            y1={size - padding}
            x2={padding}
            y2={padding}
            stroke="rgba(255,255,255,0.3)"
            strokeWidth="1"
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
                  stroke="rgba(255,255,255,0.06)"
                  strokeWidth="1"
                />
                <text
                  x={pt.x + 3}
                  y={pt.y - 2}
                  fontSize="8"
                  fill="#64748B"
                  className="font-mono font-medium"
                >
                  {corr}
                </text>
              </g>
            );
          })}

          {/* Reference Observation Point at (1.0, 1.0) */}
          <circle cx={refCoords.x} cy={refCoords.y} r="5" fill="#10B981" stroke="#FFF" strokeWidth="1.5" />
          <text x={refCoords.x - 8} y={refCoords.y + 16} fontSize="9" fill="#10B981" className="font-mono font-bold">
            OBS
          </text>

          {/* Plotted Models */}
          {models.map((m) => {
            const pt = toCoords(m.correlation, m.normalized_std);
            const isBlend = m.id === "samanvay";
            return (
              <g key={m.id} className="cursor-pointer group">
                <circle
                  cx={pt.x}
                  cy={pt.y}
                  r={isBlend ? 7 : 4.5}
                  fill={m.color}
                  stroke={isBlend ? "#FFF" : "rgba(0,0,0,0.6)"}
                  strokeWidth={isBlend ? 2 : 1}
                  className="transition-transform group-hover:scale-125"
                />
                <title>{`${m.name}: r=${m.correlation.toFixed(2)}, std=${m.normalized_std.toFixed(2)}`}</title>
              </g>
            );
          })}
        </svg>
      </div>

      {/* Model Legend Chips */}
      <div className="flex flex-wrap gap-2 justify-center mt-1 border-t border-border/40 pt-2 text-[11px]">
        {models.map((m) => (
          <div key={m.id} className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: m.color }} />
            <span className="text-text-2">{m.name}</span>
          </div>
        ))}
      </div>
    </GlassCard>
  );
}

export const TaylorDiagram = React.memo(TaylorDiagramComponent);

