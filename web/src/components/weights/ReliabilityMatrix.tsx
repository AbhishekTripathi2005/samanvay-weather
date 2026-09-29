"use client";

import React, { useState } from "react";
import { GlassCard } from "@/components/ui/GlassCard";
import { Grid, Eye, SlidersHorizontal, Info } from "lucide-react";
import { ReliabilityMatrixRow, RegionWeightDetail } from "@/lib/types";

interface ReliabilityMatrixProps {
  rows: ReliabilityMatrixRow[];
  regions: RegionWeightDetail[];
  selectedRegion: string;
  onSelectRegion: (code: string) => void;
}

const MODELS = [
  { id: "ncum_g", name: "NCUM-G", color: "#06B6D4", initial: "NC" },
  { id: "neps", name: "NEPS", color: "#3B82F6", initial: "NE" },
  { id: "imd_gfs", name: "IMD-GFS", color: "#10B981", initial: "GF" },
  { id: "ecmwf_ifs", name: "ECMWF-IFS", color: "#6366F1", initial: "EC" },
  { id: "graphcast", name: "GraphCast", color: "#8B5CF6", initial: "GC" },
  { id: "pangu", name: "Pangu", color: "#D946EF", initial: "PG" },
  { id: "fourcastnet", name: "FourCastNet", color: "#EC4899", initial: "FC" }
];

export function ReliabilityMatrix({
  rows,
  regions,
  selectedRegion,
  onSelectRegion
}: ReliabilityMatrixProps) {
  // Mode: "dominant" (winning model categorical) or "continuous" (weight of a specific model)
  const [viewMode, setViewMode] = useState<"dominant" | "continuous">("dominant");
  const [selectedContinuousModel, setSelectedContinuousModel] = useState<string>("graphcast");
  const [hoveredCell, setHoveredCell] = useState<{
    lead: number;
    leadDay: number;
    regionCode: string;
    regionName: string;
    dominantModel: string;
    weightPct: number;
  } | null>(null);

  // Group regions by Zone for clean columnar organization
  const sortedRegions = [...regions].sort((a, b) => a.zone.localeCompare(b.zone) || a.code.localeCompare(b.code));

  // Helper for continuous heat color
  const getContinuousColor = (weight: number, baseColor: string) => {
    // Weight typically 0.0 to 0.45
    const opacity = Math.min(1.0, Math.max(0.1, weight * 2.5));
    return `${baseColor}${Math.round(opacity * 255).toString(16).padStart(2, "0")}`;
  };

  const currentContinuousModelObj = MODELS.find((m) => m.id === selectedContinuousModel) || MODELS[4];

  return (
    <GlassCard className="p-5 flex flex-col gap-4 border-cyan-500/20">
      {/* Header and View Mode Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-border/50">
        <div>
          <div className="flex items-center gap-2">
            <Grid className="w-5 h-5 text-cyan-400" />
            <h2 className="text-lg font-bold text-text-1 tracking-tight">
              Model Reliability Matrix (Lead × Region Heatmap)
            </h2>
          </div>
          <p className="text-xs text-text-3">
            Synoptic performance matrix across all 10 forecast lead days and 36 Indian administrative territories
          </p>
        </div>

        {/* View Mode Switcher */}
        <div className="flex items-center gap-2">
          <div className="flex items-center bg-surface-2 p-1 rounded-lg border border-border text-xs font-medium">
            <button
              onClick={() => setViewMode("dominant")}
              className={`px-2.5 py-1 rounded transition-colors ${
                viewMode === "dominant"
                  ? "bg-cyan-500/20 text-cyan-300 font-semibold"
                  : "text-text-3 hover:text-text-1"
              }`}
            >
              Winning Model
            </button>
            <button
              onClick={() => setViewMode("continuous")}
              className={`px-2.5 py-1 rounded transition-colors ${
                viewMode === "continuous"
                  ? "bg-cyan-500/20 text-cyan-300 font-semibold"
                  : "text-text-3 hover:text-text-1"
              }`}
            >
              Continuous Scale
            </button>
          </div>

          {/* Model picker for continuous mode */}
          {viewMode === "continuous" && (
            <select
              value={selectedContinuousModel}
              onChange={(e) => setSelectedContinuousModel(e.target.value)}
              className="bg-surface-2 border border-cyan-500/40 text-cyan-300 rounded-lg px-2.5 py-1 text-xs font-mono font-medium outline-none"
            >
              {MODELS.map((m) => (
                <option key={m.id} value={m.id}>
                  {m.name} Weight
                </option>
              ))}
            </select>
          )}
        </div>
      </div>

      {/* 2D Heatmap Grid Container */}
      <div className="overflow-x-auto w-full pb-2">
        <div className="min-w-[1000px] flex flex-col font-mono text-[11px]">
          {/* Header Row: Region Codes */}
          <div className="flex items-center border-b border-border/60 pb-1.5 mb-1 text-[10px] text-text-3">
            <div className="w-20 flex-shrink-0 font-semibold pl-2">Lead Day</div>
            <div className="flex-1" style={{ display: "grid", gridTemplateColumns: "repeat(36, minmax(20px, 1fr))", gap: "3px" }}>
              {sortedRegions.map((reg) => (
                <button
                  key={reg.code}
                  onClick={() => onSelectRegion(reg.code)}
                  title={`${reg.name} (${reg.zone})`}
                  className={`text-center py-0.5 rounded transition-colors hover:text-cyan-300 ${
                    selectedRegion === reg.code
                      ? "bg-cyan-500/30 text-cyan-300 font-bold border border-cyan-400"
                      : "text-text-3 hover:bg-surface-3"
                  }`}
                >
                  {reg.code}
                </button>
              ))}
            </div>
          </div>

          {/* 10 Lead Rows */}
          <div className="flex flex-col gap-1">
            {rows.map((row) => (
              <div key={row.lead} className="flex items-center hover:bg-white/5 rounded py-0.5">
                {/* Lead Label */}
                <div className="w-20 flex-shrink-0 pl-2 font-semibold text-text-2 flex items-center justify-between pr-2">
                  <span>Day {row.lead_day}</span>
                  <span className="text-[9px] text-text-3">+{row.lead}h</span>
                </div>

                {/* 36 Region Cells */}
                <div className="flex-1" style={{ display: "grid", gridTemplateColumns: "repeat(36, minmax(20px, 1fr))", gap: "3px" }}>
                  {sortedRegions.map((reg) => {
                    const cellData = row[reg.code];
                    const dominantModelId = cellData?.dominant_model || "ncum_g";
                    const dominantColor = cellData?.dominant_color || "#06B6D4";
                    const weightsDict = cellData?.weights || {};

                    const continuousWeight = weightsDict[selectedContinuousModel] || 0;
                    const continuousPct = Math.round(continuousWeight * 100);

                    const cellBg =
                      viewMode === "dominant"
                        ? dominantColor
                        : getContinuousColor(continuousWeight, currentContinuousModelObj.color);

                    const isSelectedReg = selectedRegion === reg.code;

                    return (
                      <div
                        key={reg.code}
                        onMouseEnter={() => {
                          setHoveredCell({
                            lead: row.lead,
                            leadDay: row.lead_day,
                            regionCode: reg.code,
                            regionName: reg.name,
                            dominantModel: dominantModelId,
                            weightPct:
                              viewMode === "dominant"
                                ? Math.round((weightsDict[dominantModelId] || 0) * 100)
                                : continuousPct
                          });
                        }}
                        onMouseLeave={() => setHoveredCell(null)}
                        onClick={() => onSelectRegion(reg.code)}
                        className={`h-7 rounded cursor-pointer transition-transform hover:scale-110 flex items-center justify-center text-[9px] font-bold text-white shadow-sm ${
                          isSelectedReg ? "ring-2 ring-white ring-offset-1 ring-offset-black" : ""
                        }`}
                        style={{ backgroundColor: cellBg }}
                      >
                        {viewMode === "dominant" ? (
                          <span>
                            {MODELS.find((m) => m.id === dominantModelId)?.initial || "NC"}
                          </span>
                        ) : (
                          <span className="text-[8px] opacity-90">{continuousPct}%</span>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Hover Info Strip & Quick Legend */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-3 border-t border-border/40 text-xs font-mono">
        {/* Cell Telemetry */}
        {hoveredCell ? (
          <div className="flex items-center gap-2 text-text-1">
            <span className="text-cyan-400 font-bold">
              Day {hoveredCell.leadDay} (+{hoveredCell.lead}h)
            </span>
            <span className="text-text-3">•</span>
            <span className="text-text-2 font-semibold">{hoveredCell.regionName} ({hoveredCell.regionCode})</span>
            <span className="text-text-3">•</span>
            {viewMode === "dominant" ? (
              <span className="flex items-center gap-1.5">
                <span className="text-text-3">Winner:</span>
                <span className="text-cyan-300 font-bold uppercase">{hoveredCell.dominantModel}</span>
                <span className="text-emerald-400">({hoveredCell.weightPct}%)</span>
              </span>
            ) : (
              <span className="flex items-center gap-1.5">
                <span className="text-text-3">{currentContinuousModelObj.name}:</span>
                <span className="text-cyan-300 font-bold">{hoveredCell.weightPct}% Weight</span>
              </span>
            )}
          </div>
        ) : (
          <div className="flex items-center gap-1.5 text-text-3 text-[11px]">
            <Info className="w-3.5 h-3.5 text-cyan-400/80" />
            <span>Hover over any grid cell to inspect regional weight allocation</span>
          </div>
        )}

        {/* Legend */}
        <div className="flex items-center gap-2 text-[10px]">
          {MODELS.map((m) => (
            <div key={m.id} className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-full" style={{ backgroundColor: m.color }} />
              <span className="text-text-3">{m.initial}</span>
            </div>
          ))}
        </div>
      </div>
    </GlassCard>
  );
}
