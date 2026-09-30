"use client";
/**
 * PipelineVisual — animated SVG pipeline: Blended Rainfall → Water Balance → Outputs.
 */
import React from "react";
import { GlassCard } from "@/components/ui/GlassCard";
import { CloudRain, Database, TrendingDown, AlertTriangle, Droplets, Thermometer } from "lucide-react";

const NODES = [
  { id: "blend", label: "Blended Rainfall", sub: "7-model consensus", icon: CloudRain, color: "#22d3ee" },
  { id: "wb",    label: "Water Balance",    sub: "dS/dt = P − R − ET", icon: Database,  color: "#a78bfa" },
  { id: "S",     label: "Soil Moisture S",  sub: "mm (0 → S_max)", icon: Droplets,   color: "#60a5fa" },
  { id: "R",     label: "Surface Runoff R", sub: "mm (R=0 if P=0)", icon: TrendingDown, color: "#f97316" },
  { id: "ET",    label: "Evapotranspiration", sub: "mm (ET=0 if P=0)", icon: Thermometer, color: "#34d399" },
  { id: "risk",  label: "Flood Risk Class", sub: "LOW→CRITICAL", icon: AlertTriangle, color: "#ef4444" },
];

const EDGES = [
  { from: "blend", to: "wb"   },
  { from: "wb",    to: "S"    },
  { from: "wb",    to: "R"    },
  { from: "wb",    to: "ET"   },
  { from: "S",     to: "risk" },
];

interface NodeBoxProps {
  node: typeof NODES[0];
  x: number;
  y: number;
  w: number;
  h: number;
}

export function PipelineVisual() {
  const W = 700; const H = 220;

  // Layout positions for SVG
  const positions: Record<string, { x: number; y: number; w: number; h: number }> = {
    blend: { x: 20,  y: 80, w: 120, h: 60 },
    wb:    { x: 195, y: 80, w: 120, h: 60 },
    S:     { x: 380, y: 20, w: 100, h: 50 },
    R:     { x: 380, y: 85, w: 100, h: 50 },
    ET:    { x: 380, y: 150, w: 100, h: 50 },
    risk:  { x: 545, y: 80, w: 120, h: 60 },
  };

  const getColor = (id: string) => NODES.find((n) => n.id === id)?.color ?? "#64748b";

  return (
    <GlassCard className="p-4 flex flex-col gap-3">
      <div>
        <h3 className="text-sm font-semibold text-text-1">Processing Pipeline</h3>
        <p className="text-[11px] text-text-3 mt-0.5">Blended rainfall → water-balance physics → hydrological outputs</p>
      </div>

      <div className="overflow-x-auto">
        <svg viewBox={`0 0 ${W} ${H}`} className="w-full" style={{ minWidth: 480 }} aria-label="Processing pipeline diagram">
          <defs>
            <marker id="arrow" markerWidth={8} markerHeight={8} refX={6} refY={3} orient="auto">
              <path d="M0,0 L0,6 L8,3 z" fill="#475569" />
            </marker>
            {/* Animated flow gradient */}
            <linearGradient id="flowGrad" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#22d3ee" stopOpacity={0.8}>
                <animate attributeName="offset" values="0%;100%;0%" dur="3s" repeatCount="indefinite" />
              </stop>
              <stop offset="50%" stopColor="#a78bfa" stopOpacity={0.6}>
                <animate attributeName="offset" values="50%;150%;50%" dur="3s" repeatCount="indefinite" />
              </stop>
            </linearGradient>
          </defs>

          {/* Edges */}
          {EDGES.map(({ from, to }) => {
            const f = positions[from]; const t2 = positions[to];
            const x1 = f.x + f.w; const y1 = f.y + f.h / 2;
            const x2 = t2.x;      const y2 = t2.y + t2.h / 2;
            const mx = (x1 + x2) / 2;
            return (
              <g key={`${from}-${to}`}>
                <path
                  d={`M${x1},${y1} C${mx},${y1} ${mx},${y2} ${x2},${y2}`}
                  fill="none" stroke="#334155" strokeWidth={2}
                  markerEnd="url(#arrow)"
                />
                <path
                  d={`M${x1},${y1} C${mx},${y1} ${mx},${y2} ${x2},${y2}`}
                  fill="none" stroke="url(#flowGrad)" strokeWidth={1.5} opacity={0.7}
                  strokeDasharray="6 4"
                >
                  <animate attributeName="stroke-dashoffset" values="0;-20" dur="1.5s" repeatCount="indefinite" />
                </path>
              </g>
            );
          })}

          {/* Nodes */}
          {NODES.map((node) => {
            const pos = positions[node.id];
            const Icon = node.icon;
            return (
              <g key={node.id} transform={`translate(${pos.x},${pos.y})`}>
                <rect
                  width={pos.w} height={pos.h} rx={10}
                  fill={node.color + "15"} stroke={node.color + "80"} strokeWidth={1.5}
                />
                <foreignObject x={6} y={8} width={pos.w - 12} height={pos.h - 16}>
                  <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
                    <div style={{ fontSize: 9, color: node.color, fontWeight: 700, fontFamily: "monospace" }}>
                      {node.label}
                    </div>
                    <div style={{ fontSize: 8, color: "#94a3b8" }}>{node.sub}</div>
                  </div>
                </foreignObject>
              </g>
            );
          })}

          {/* Mass conservation annotation */}
          <text x={352} y={13} fontSize={8} fill="#94a3b8" fontStyle="italic">
            R = ET = 0 when P = 0
          </text>
          <line x1={350} y1={16} x2={380} y2={36} stroke="#475569" strokeWidth={0.8} strokeDasharray="3 2" />
        </svg>
      </div>
    </GlassCard>
  );
}
