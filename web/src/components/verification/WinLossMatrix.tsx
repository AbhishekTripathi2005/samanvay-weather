"use client";

import React, { useState } from "react";
import { GlassCard } from "@/components/ui/GlassCard";
import { WinLossData, WinLossCell } from "@/lib/types";
import { Grid, CheckCircle2, AlertCircle, Info, Sparkles } from "lucide-react";
import { Tooltip } from "@/components/ui/Tooltip";

interface WinLossMatrixProps {
  data?: WinLossData;
  variable?: string;
}

export function WinLossMatrix({ data, variable = "Rainfall" }: WinLossMatrixProps) {
  const [selectedCell, setSelectedCell] = useState<WinLossCell | null>(null);

  if (!data || !data.matrix || data.matrix.length === 0) {
    return (
      <GlassCard className="p-6 text-center text-text-3">
        No win/loss matrix data available.
      </GlassCard>
    );
  }

  const { regimes, leads, matrix, blend_wins, single_model_wins, blend_win_rate_pct, single_model_win_rate_pct } = data;

  // Index cells by `${lead_day}-${regime}`
  const cellMap = new Map<string, WinLossCell>();
  matrix.forEach((c) => {
    cellMap.set(`${c.lead_day}-${c.regime}`, c);
  });

  return (
    <GlassCard className="p-5 flex flex-col gap-4 border-cyan-500/20">
      {/* Header & Win-Rate Telemetry */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 pb-3 border-b border-border/50">
        <div>
          <div className="flex items-center gap-2">
            <Grid className="w-5 h-5 text-cyan-400" />
            <h2 className="text-base font-bold text-text-1 tracking-tight">
              Operational Win / Loss Matrix (Honest Scientific Evaluation)
            </h2>
          </div>
          <p className="text-xs text-text-3">
            Mapping consensus dominance vs individual model physical niches across synoptic regimes and forecast horizons
          </p>
        </div>

        {/* Win Rate Stats Badges */}
        <div className="flex items-center gap-2 text-xs font-mono">
          <div className="bg-cyan-500/15 border border-cyan-500/30 px-3 py-1.5 rounded-lg flex items-center gap-1.5 text-cyan-300">
            <CheckCircle2 className="w-3.5 h-3.5 text-cyan-400" />
            <span>SAMANVAY Wins: <strong>{blend_wins}</strong> ({blend_win_rate_pct}%)</span>
          </div>

          <div className="bg-amber-500/15 border border-amber-500/30 px-3 py-1.5 rounded-lg flex items-center gap-1.5 text-amber-300">
            <AlertCircle className="w-3.5 h-3.5 text-amber-400" />
            <span>Single Model Wins: <strong>{single_model_wins}</strong> ({single_model_win_rate_pct}%)</span>
          </div>
        </div>
      </div>

      {/* 2D Heatmap Grid */}
      <div className="overflow-x-auto pb-2">
        <table className="w-full min-w-[700px] border-collapse text-xs font-mono">
          <thead>
            <tr className="border-b border-border/60 text-text-3">
              <th className="py-2.5 px-3 text-left w-36">Lead Horizon</th>
              {regimes.map((reg) => (
                <th key={reg} className="py-2.5 px-2 text-center text-[11px] font-semibold text-text-2">
                  {reg}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {leads.map((l_day) => (
              <tr key={l_day} className="border-b border-border/30 hover:bg-white/5 transition-colors">
                <td className="py-3 px-3 font-bold text-text-1 whitespace-nowrap">
                  <span>Day {l_day}</span>
                  <span className="text-text-3 text-[10px] ml-1.5 font-normal">+{l_day * 24}h</span>
                </td>

                {regimes.map((reg) => {
                  const cell = cellMap.get(`${l_day}-${reg}`);
                  if (!cell) return <td key={reg} className="py-3 px-2 text-center text-text-3">-</td>;

                  const isBlend = cell.is_blend_win;
                  const isSelected = selectedCell?.lead_day === cell.lead_day && selectedCell?.regime === cell.regime;

                  return (
                    <td key={reg} className="py-2 px-1.5 text-center">
                      <button
                        onClick={() => setSelectedCell(cell)}
                        className={`w-full py-2 px-1.5 rounded-lg border text-center transition-all flex flex-col items-center justify-center gap-1 ${
                          isSelected
                            ? "ring-2 ring-white shadow-lg"
                            : ""
                        } ${
                          isBlend
                            ? "bg-cyan-950/40 border-cyan-500/40 hover:bg-cyan-900/50 hover:border-cyan-400 text-cyan-300"
                            : "bg-indigo-950/40 border-indigo-500/50 hover:bg-indigo-900/60 hover:border-indigo-400 text-indigo-300 shadow-[0_0_8px_rgba(99,102,241,0.2)]"
                        }`}
                      >
                        <div className="flex items-center gap-1">
                          <span
                            className="w-2 h-2 rounded-full shrink-0"
                            style={{ backgroundColor: cell.winner_color }}
                          />
                          <span className="font-bold text-[11px] tracking-tight">
                            {cell.winner_name}
                          </span>
                        </div>

                        <span
                          className={`text-[9px] px-1 py-0.2 rounded font-mono ${
                            isBlend
                              ? "bg-cyan-500/20 text-cyan-300"
                              : "bg-indigo-500/20 text-indigo-200 font-bold border border-indigo-500/40"
                          }`}
                        >
                          +{cell.margin_pct}%
                        </span>
                      </button>
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Selected Cell Inspection Drawer / Box */}
      {selectedCell ? (
        <GlassCard className="p-4 bg-surface-2/90 border-cyan-500/40 flex flex-col gap-2 animate-fadeIn">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-text-3 uppercase tracking-wider">
                Cell Analysis: Day {selectedCell.lead_day} (+{selectedCell.lead_hours}h) • {selectedCell.regime}
              </span>
              <span
                className={`text-[10px] font-mono px-2 py-0.5 rounded font-bold uppercase ${
                  selectedCell.is_blend_win
                    ? "bg-cyan-500/20 text-cyan-300 border border-cyan-500/40"
                    : "bg-indigo-500/20 text-indigo-300 border border-indigo-500/40"
                }`}
              >
                {selectedCell.is_blend_win ? "Consensus Victory" : "Single Model Victory"}
              </span>
            </div>

            <button
              onClick={() => setSelectedCell(null)}
              className="text-xs text-text-3 hover:text-text-1"
            >
              ✕ Close
            </button>
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-1">
            <div className="flex items-center gap-3">
              <div
                className="w-3.5 h-3.5 rounded-full"
                style={{ backgroundColor: selectedCell.winner_color }}
              />
              <span className="font-bold text-base text-text-1">
                Winner: {selectedCell.winner_name}
              </span>
              <span className="text-xs font-mono bg-surface-3 px-2 py-0.5 rounded border border-border text-text-2">
                Winning Margin: +{selectedCell.margin_pct}%
              </span>
            </div>

            <span className="text-xs font-mono text-cyan-400">
              Type: {selectedCell.winner_type}
            </span>
          </div>

          <p className="text-xs text-text-2 leading-relaxed bg-surface-3/60 p-3 rounded-lg border border-border/50">
            <strong>Meteorological Attribution</strong>: {selectedCell.reason}
          </p>
        </GlassCard>
      ) : (
        <div className="text-[11px] text-text-3 bg-surface-2/40 p-3 rounded-lg border border-border/50 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Info className="w-4 h-4 text-cyan-400 shrink-0" />
            <span>
              Click any cell in the matrix above to inspect the physical meteorological reasoning behind why either SAMANVAY or an individual model won.
            </span>
          </div>
          <span className="font-mono text-text-2 shrink-0">
            {single_model_wins} Physical Niches Identified
          </span>
        </div>
      )}
    </GlassCard>
  );
}
