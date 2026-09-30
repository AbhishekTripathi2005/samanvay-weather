"use client";
/**
 * LandslideMap — synthetic 30m DEM-derived susceptibility grid for Shimla District.
 * Layer toggles: Susceptibility / Elevation / Slope / Aspect.
 * Pattern fills for greyscale accessibility.
 */
import React, { useState } from "react";
import { GlassCard } from "@/components/ui/GlassCard";
import { Layers } from "lucide-react";
import type { LandslideDemResponse, LandslideDemCell, SusceptLevel } from "@/lib/types";

type Layer = "susceptibility" | "elevation" | "slope" | "aspect";

const SUSCEPT_COLOR: Record<SusceptLevel, string> = {
  LOW:       "#10b981",
  MODERATE:  "#f59e0b",
  HIGH:      "#f97316",
  VERY_HIGH: "#ef4444",
};

const SUSCEPT_PATTERN: Record<SusceptLevel, string> = {
  LOW:       "none",
  MODERATE:  "dots",
  HIGH:      "stripes",
  VERY_HIGH: "cross",
};

const SUSCEPT_ARIA: Record<SusceptLevel, string> = {
  LOW: "Low susceptibility",
  MODERATE: "Moderate susceptibility",
  HIGH: "High susceptibility",
  VERY_HIGH: "Very high susceptibility",
};

function slopeToColor(slope: number): string {
  const t = Math.min(1, slope / 65);
  const r = Math.round(68 + t * (239 - 68));
  const g = Math.round(168 - t * 168);
  const b = Math.round(84 - t * 84);
  return `rgb(${r},${g},${b})`;
}
function elevToColor(elev: number): string {
  const t = Math.min(1, Math.max(0, (elev - 1400) / 2400));
  const r = Math.round(59  + t * (255 - 59));
  const g = Math.round(130 - t * 60);
  const b = Math.round(246 - t * 200);
  return `rgb(${r},${g},${b})`;
}
function aspectToColor(aspect: number): string {
  const hue = aspect;
  return `hsl(${hue}, 60%, 45%)`;
}

function cellColor(cell: LandslideDemCell, layer: Layer): string {
  if (layer === "susceptibility") return SUSCEPT_COLOR[cell.level];
  if (layer === "elevation")      return elevToColor(cell.elevation_m);
  if (layer === "slope")          return slopeToColor(cell.slope_deg);
  return aspectToColor(cell.aspect_deg);
}

function PatternOverlayCell({ pattern }: { pattern: string }) {
  if (pattern === "none") return null;
  return (
    <svg className="absolute inset-0 w-full h-full" style={{ opacity: 0.3 }} aria-hidden="true">
      {pattern === "dots" && [3, 9, 15].flatMap((x) => [3, 8].map((y) => (
        <circle key={`${x}-${y}`} cx={x} cy={y} r={1.2} fill="white" />
      )))}
      {pattern === "stripes" && [0, 4, 8, 12, 16].map((o) => (
        <line key={o} x1={o} y1={0} x2={o + 12} y2={12} stroke="white" strokeWidth={1.2} />
      ))}
      {pattern === "cross" && <>
        {[4, 10].map((x) => <line key={`v${x}`} x1={x} y1={0} x2={x} y2={14} stroke="white" strokeWidth={1} />)}
        {[4, 9].map((y) => <line key={`h${y}`} x1={0} y1={y} x2={18} y2={y} stroke="white" strokeWidth={1} />)}
      </>}
    </svg>
  );
}

interface Props {
  data: LandslideDemResponse | null;
  isLoading: boolean;
}

export function LandslideMap({ data, isLoading }: Props) {
  const [layer, setLayer] = useState<Layer>("susceptibility");
  const [hovered, setHovered] = useState<LandslideDemCell | null>(null);

  if (isLoading) {
    return (
      <GlassCard className="p-4 h-64 flex items-center justify-center text-text-3 text-xs animate-pulse">
        Loading DEM landslide grid…
      </GlassCard>
    );
  }
  if (!data) return null;

  const COLS = data.cols; const ROWS = data.rows;
  const CELL_W = 22; const CELL_H = 15;

  const layers: { id: Layer; label: string }[] = [
    { id: "susceptibility", label: "Susceptibility" },
    { id: "elevation",      label: "Elevation" },
    { id: "slope",          label: "Slope" },
    { id: "aspect",         label: "Aspect" },
  ];

  const susceptCounts = data.level_counts;

  return (
    <GlassCard className="p-4 flex flex-col gap-3">
      {/* Header */}
      <div className="flex items-start justify-between flex-wrap gap-2">
        <div>
          <h3 className="text-sm font-semibold text-text-1 flex items-center gap-1.5">
            <Layers className="h-4 w-4 text-cyan-400" />
            Landslide Susceptibility — {data.district}
          </h3>
          <p className="text-[10px] text-text-3 mt-0.5">{data.resolution_m}m synthetic DEM grid · {COLS}×{ROWS} cells</p>
        </div>
        {/* Layer toggles */}
        <div className="flex gap-1 flex-wrap">
          {layers.map((l) => (
            <button
              key={l.id}
              onClick={() => setLayer(l.id)}
              aria-pressed={layer === l.id}
              className={`px-2 py-1 text-[10px] font-semibold rounded border transition-all ${
                layer === l.id
                  ? "bg-cyan-500/20 border-cyan-500/50 text-cyan-300"
                  : "bg-surface-2/50 border-border text-text-3 hover:border-border/80"
              }`}
            >
              {l.label}
            </button>
          ))}
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-4">
        {/* Grid map */}
        <div
          className="overflow-auto rounded-lg border border-border/30 bg-surface-2/20 p-2"
          style={{ maxHeight: 320 }}
        >
          <div
            style={{
              display: "grid",
              gridTemplateColumns: `repeat(${COLS}, ${CELL_W}px)`,
              gap: 1,
            }}
            role="img"
            aria-label={`${data.district} DEM landslide susceptibility grid`}
          >
            {data.cells.map((cell, i) => {
              const color = cellColor(cell, layer);
              const pattern = layer === "susceptibility" ? SUSCEPT_PATTERN[cell.level] : "none";
              return (
                <div
                  key={i}
                  className="relative cursor-pointer transition-transform hover:scale-110 hover:z-10"
                  style={{ width: CELL_W, height: CELL_H, backgroundColor: color, borderRadius: 2 }}
                  onMouseEnter={() => setHovered(cell)}
                  onMouseLeave={() => setHovered(null)}
                  tabIndex={0}
                  onFocus={() => setHovered(cell)}
                  onBlur={() => setHovered(null)}
                  aria-label={`Row ${cell.row}, Col ${cell.col}: ${SUSCEPT_ARIA[cell.level]}, ${cell.slope_deg}° slope, ${cell.elevation_m}m`}
                  role="gridcell"
                >
                  <PatternOverlayCell pattern={pattern} />
                </div>
              );
            })}
          </div>
        </div>

        {/* Right panel: legend + hover info */}
        <div className="flex flex-col gap-3 flex-1 min-w-[160px]">
          {/* Susceptibility legend (always shown) */}
          <div>
            <div className="text-[10px] font-semibold text-text-3 uppercase tracking-wider mb-2">
              Susceptibility Legend
            </div>
            {(["VERY_HIGH","HIGH","MODERATE","LOW"] as SusceptLevel[]).map((lv) => (
              <div key={lv} className="flex items-center gap-2 mb-1.5">
                <div className="relative w-5 h-4 rounded flex-shrink-0 border border-white/10"
                     style={{ backgroundColor: SUSCEPT_COLOR[lv] }}>
                  <PatternOverlayCell pattern={SUSCEPT_PATTERN[lv]} />
                </div>
                <span className="text-[10px] text-text-2 flex-1">{lv.replace("_"," ")}</span>
                <span className="text-[9px] font-mono text-text-3">{susceptCounts[lv]} cells</span>
              </div>
            ))}
          </div>

          {/* Count summary */}
          <div className="grid grid-cols-2 gap-1.5">
            {(["VERY_HIGH","HIGH","MODERATE","LOW"] as SusceptLevel[]).map((lv) => {
              const pct = Math.round(susceptCounts[lv] / (COLS * ROWS) * 100);
              const bg: Record<SusceptLevel, string> = {
                VERY_HIGH: "bg-red-500/15 border-red-500/40 text-red-400",
                HIGH:      "bg-orange-500/15 border-orange-500/40 text-orange-400",
                MODERATE:  "bg-amber-500/15 border-amber-500/40 text-amber-400",
                LOW:       "bg-emerald-500/15 border-emerald-500/40 text-emerald-400",
              };
              return (
                <div key={lv} className={`rounded border px-2 py-1.5 ${bg[lv]}`}>
                  <div className="text-[10px] font-bold font-mono">{pct}%</div>
                  <div className="text-[9px]">{lv.replace("_"," ")}</div>
                </div>
              );
            })}
          </div>

          {/* Hover details */}
          {hovered && (
            <div className="p-2.5 rounded-lg border border-border bg-surface-2/60 text-[10px]">
              <div className="font-semibold text-text-1 mb-1.5">Cell Info</div>
              <div className="flex flex-col gap-0.5 text-text-2">
                <div><span className="text-text-3">Elevation: </span><span className="font-mono">{hovered.elevation_m}m</span></div>
                <div><span className="text-text-3">Slope: </span><span className="font-mono">{hovered.slope_deg}°</span></div>
                <div><span className="text-text-3">Aspect: </span><span className="font-mono">{hovered.aspect_deg}°</span></div>
                <div><span className="text-text-3">Susceptibility: </span><span className="font-mono">{hovered.susceptibility.toFixed(3)}</span></div>
                <div className="mt-1 font-bold" style={{ color: SUSCEPT_COLOR[hovered.level] }}>{hovered.level.replace("_"," ")}</div>
              </div>
            </div>
          )}

          {/* Discriminative note */}
          <div className="p-2 rounded-lg border border-yellow-500/30 bg-yellow-500/10 text-[10px] text-yellow-300">
            ℹ️ Discriminative accuracy only — negatives are pseudo-absence samples. Not a real-time landslide forecast.
          </div>
        </div>
      </div>
    </GlassCard>
  );
}
