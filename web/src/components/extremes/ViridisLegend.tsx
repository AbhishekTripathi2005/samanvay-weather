"use client";

import React from "react";

interface ViridisLegendProps {
  label?: string;
  thresholdLabel?: string;
}

function PatternSwatch({ pattern }: { pattern: string }) {
  const size = 12;
  if (pattern === "none") {
    return (
      <svg width={size} height={size} aria-hidden="true">
        <rect width={size} height={size} fill="currentColor" opacity={0.4} rx={2} />
      </svg>
    );
  }
  if (pattern === "dots") {
    return (
      <svg width={size} height={size} aria-hidden="true">
        <rect width={size} height={size} fill="currentColor" opacity={0.15} rx={2} />
        {[2, 6, 10].flatMap((x) =>
          [2, 6, 10].map((y) => (
            <circle key={`${x}-${y}`} cx={x} cy={y} r={1} fill="currentColor" opacity={0.7} />
          ))
        )}
      </svg>
    );
  }
  if (pattern === "stripes") {
    return (
      <svg width={size} height={size} aria-hidden="true">
        <rect width={size} height={size} fill="currentColor" opacity={0.15} rx={2} />
        <line x1={0} y1={4} x2={12} y2={4} stroke="currentColor" strokeWidth={1.5} opacity={0.7} />
        <line x1={0} y1={8} x2={12} y2={8} stroke="currentColor" strokeWidth={1.5} opacity={0.7} />
      </svg>
    );
  }
  return (
    <svg width={size} height={size} aria-hidden="true">
      <rect width={size} height={size} fill="currentColor" opacity={0.15} rx={2} />
      <line x1={0} y1={4} x2={12} y2={4} stroke="currentColor" strokeWidth={1.2} opacity={0.7} />
      <line x1={0} y1={8} x2={12} y2={8} stroke="currentColor" strokeWidth={1.2} opacity={0.7} />
      <line x1={4} y1={0} x2={4} y2={12} stroke="currentColor" strokeWidth={1.2} opacity={0.7} />
      <line x1={8} y1={0} x2={8} y2={12} stroke="currentColor" strokeWidth={1.2} opacity={0.7} />
    </svg>
  );
}

export function ViridisLegend({ label = "P(Extreme Event)", thresholdLabel }: ViridisLegendProps) {
  return (
    <div className="flex flex-col gap-1.5">
      <div className="flex items-center justify-between text-[10px] text-text-3">
        <span className="font-medium">{label}</span>
        {thresholdLabel && <span className="font-mono text-cyan-400">{thresholdLabel}</span>}
      </div>
      <div
        className="relative h-4 rounded-full overflow-hidden border border-border/30"
        style={{ background: "linear-gradient(to right, #440154, #3b528b, #21908d, #5dc963, #fde725)" }}
        role="img"
        aria-label="Viridis probability scale from 0% (purple) to 100% (yellow)"
      >
        {[0, 25, 50, 75, 100].map((p) => (
          <div key={p} className="absolute top-0 bottom-0 w-px bg-black/20" style={{ left: `${p}%` }} />
        ))}
      </div>
      <div className="relative flex justify-between text-[9px] text-text-3 font-mono">
        {[0, 25, 50, 75, 100].map((p) => <span key={p}>{p}%</span>)}
      </div>
      <div className="flex gap-2 mt-1 flex-wrap">
        {[
          { bg: "bg-emerald-500/20 border-emerald-500/40 text-emerald-400", pattern: "none",    label: "Normal",  thresh: "<25%" },
          { bg: "bg-yellow-500/20  border-yellow-500/40  text-yellow-400",  pattern: "dots",    label: "Watch",   thresh: "25-50%" },
          { bg: "bg-amber-500/20   border-amber-500/40   text-amber-400",   pattern: "stripes", label: "Alert",   thresh: "50-75%" },
          { bg: "bg-red-500/20     border-red-500/40     text-red-400",     pattern: "cross",   label: "Warning", thresh: ">75%" },
        ].map((item) => (
          <span key={item.label} className={`inline-flex items-center gap-1 border rounded px-2 py-0.5 text-[10px] font-mono font-bold ${item.bg}`}>
            <PatternSwatch pattern={item.pattern} />
            {item.label}
            <span className="opacity-60 font-normal">{item.thresh}</span>
          </span>
        ))}
      </div>
    </div>
  );
}
