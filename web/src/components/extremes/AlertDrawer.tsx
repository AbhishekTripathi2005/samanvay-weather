"use client";

import React, { useEffect } from "react";
import { X, Bell, BellRing, Info, TrendingDown, TrendingUp } from "lucide-react";
import {
  LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, ReferenceLine
} from "recharts";
import { toast } from "sonner";
import { AlertBadge } from "@/components/ui/AlertBadge";
import { GlassCard } from "@/components/ui/GlassCard";
import { cn } from "@/lib/utils";
import type { ExtremeAlertItem, ExtremesExplainV2Response, ExtremesTimelineResponse } from "@/lib/types";

interface AlertDrawerProps {
  alert: ExtremeAlertItem | null;
  explain: ExtremesExplainV2Response | null;
  timeline: ExtremesTimelineResponse | null;
  isOpen: boolean;
  onClose: () => void;
}

const LEVEL_BG: Record<string, string> = {
  GREEN:  "from-emerald-900/40 to-transparent",
  YELLOW: "from-yellow-900/40 to-transparent",
  ORANGE: "from-amber-900/40 to-transparent",
  RED:    "from-red-900/40 to-transparent",
};

export function AlertDrawer({ alert, explain, timeline, isOpen, onClose }: AlertDrawerProps) {
  useEffect(() => {
    function onKey(e: KeyboardEvent) { if (e.key === "Escape") onClose(); }
    if (isOpen) document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [isOpen, onClose]);

  if (!alert) return null;

  const level = alert.alert_level || "GREEN";
  const contributions = explain?.model_contributions ?? [];
  // Ensure contributions sum exactly to 100
  const totalPct = contributions.reduce((s, c) => s + c.contribution_pct, 0);

  const threshold_crossing = explain?.threshold_crossing ?? [];
  const spread = explain?.ensemble_spread;

  function handleSubscribe() {
    toast.success(`Subscribed to ${alert!.district} alerts`, {
      description: `You will receive notifications for ${alert!.alert_level} warnings in ${alert!.district}, ${alert!.state}.`,
      duration: 4000,
    });
  }

  return (
    <>
      {/* Backdrop */}
      <div
        className={cn(
          "fixed inset-0 z-40 bg-black/60 backdrop-blur-sm transition-opacity duration-300",
          isOpen ? "opacity-100" : "opacity-0 pointer-events-none"
        )}
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Drawer */}
      <div
        className={cn(
          "fixed top-0 right-0 bottom-0 z-50 w-full max-w-[480px] bg-surface-1 border-l border-border shadow-2xl",
          "flex flex-col overflow-hidden transition-transform duration-300",
          isOpen ? "translate-x-0" : "translate-x-full"
        )}
        role="dialog"
        aria-modal="true"
        aria-label={`Alert details for ${alert.district}`}
      >
        {/* Header */}
        <div className={cn("px-5 py-4 bg-gradient-to-r border-b border-border/50", LEVEL_BG[level])}>
          <div className="flex items-start justify-between gap-3">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <AlertBadge level={level as "GREEN" | "YELLOW" | "ORANGE" | "RED"} />
                {alert.confidence !== undefined && (
                  <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-surface-2/60 border border-border text-text-3">
                    Confidence: {Math.round(alert.confidence * 100)}%
                  </span>
                )}
              </div>
              <h2 className="text-lg font-bold text-text-1">{alert.district}</h2>
              <p className="text-xs text-text-3">{alert.state}</p>
            </div>
            <button
              onClick={onClose}
              className="p-2 rounded-lg bg-surface-2/60 border border-border hover:border-cyan-500/50 text-text-3 hover:text-text-1 transition-colors"
              aria-label="Close drawer"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          <div className="flex gap-4 mt-3">
            <div className="flex flex-col">
              <span className="text-[10px] text-text-3">P(Extreme)</span>
              <span className="text-2xl font-bold text-text-1">
                {Math.round((explain?.calibrated_exceedance_probability ?? alert.p_extreme) * 100)}%
              </span>
            </div>
            <div className="flex flex-col">
              <span className="text-[10px] text-text-3">Forecast</span>
              <span className="text-2xl font-bold font-mono text-cyan-400">
                {explain?.blend_value_mm ?? alert.forecast_value}
                <span className="text-xs text-text-3 ml-1">mm</span>
              </span>
            </div>
            <div className="flex flex-col">
              <span className="text-[10px] text-text-3">Peak Day</span>
              <span className="text-2xl font-bold text-text-1">D{alert.alert_day ?? 1}</span>
            </div>
          </div>
        </div>

        {/* Scrollable body */}
        <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-4">

          {/* 1. Model Contributions (sum to 100%) */}
          {contributions.length > 0 && (
            <section>
              <h3 className="text-xs font-semibold text-text-2 mb-2 uppercase tracking-wider">
                Model Contributions{" "}
                <span className="font-mono text-text-3 normal-case">
                  (Σ = {totalPct > 0 ? Math.round(totalPct) : 100}%)
                </span>
              </h3>
              {/* Stacked bar */}
              <div className="flex h-6 rounded-full overflow-hidden mb-3 border border-border/30">
                {contributions.map((c) => (
                  <div
                    key={c.id}
                    style={{ width: `${c.contribution_pct}%`, backgroundColor: c.color }}
                    className="transition-all duration-500"
                    title={`${c.name}: ${c.contribution_pct.toFixed(1)}%`}
                  />
                ))}
              </div>
              <div className="flex flex-col gap-1.5">
                {contributions.map((c) => (
                  <div key={c.id} className="flex items-center gap-2 text-[11px]">
                    <div className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ backgroundColor: c.color }} />
                    <span className="flex-1 text-text-2 font-medium">{c.name}</span>
                    <span className="font-mono text-text-3">{c.raw_forecast}→{c.bias_corrected}mm</span>
                    <span className="font-mono font-bold text-text-1 w-10 text-right">{c.contribution_pct.toFixed(1)}%</span>
                  </div>
                ))}
              </div>
              {explain?.bias_correction_note && (
                <div className="mt-2 p-2 rounded-lg bg-yellow-500/10 border border-yellow-500/30 text-[10px] text-yellow-300 flex gap-1.5">
                  <Info className="h-3 w-3 flex-shrink-0 mt-px" />
                  {explain.bias_correction_note}
                </div>
              )}
            </section>
          )}

          {/* 2. Ensemble Spread Box-and-Whisker */}
          {spread && (
            <section>
              <h3 className="text-xs font-semibold text-text-2 mb-2 uppercase tracking-wider">Ensemble Spread</h3>
              <BoxWhisker spread={spread} />
            </section>
          )}

          {/* 3. Threshold Crossing Chart */}
          {threshold_crossing.length > 0 && (
            <section>
              <h3 className="text-xs font-semibold text-text-2 mb-2 uppercase tracking-wider">Probability vs Lead Day</h3>
              <div className="h-28 bg-surface-2/30 rounded-lg border border-border/30 p-2">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={threshold_crossing} margin={{ top: 4, right: 8, bottom: 4, left: -20 }}>
                    <XAxis dataKey="lead_day" tick={{ fontSize: 9, fill: "#64748b" }} label={{ value: "Day", position: "insideBottomRight", offset: 0, fontSize: 9, fill: "#64748b" }} />
                    <YAxis domain={[0, 1]} tick={{ fontSize: 9, fill: "#64748b" }} tickFormatter={(v) => `${Math.round(v * 100)}%`} />
                    <Tooltip
                      formatter={(v: number) => [`${Math.round(v * 100)}%`, "P(exceed)"]}
                      labelFormatter={(l) => `Day ${l}`}
                      contentStyle={{ background: "rgba(15,23,42,0.95)", border: "1px solid rgba(148,163,184,0.2)", borderRadius: 8, fontSize: 11 }}
                    />
                    <ReferenceLine y={0.5} stroke="#f59e0b" strokeDasharray="4 2" strokeWidth={1.5} label={{ value: "50%", fontSize: 9, fill: "#f59e0b" }} />
                    <Line type="monotone" dataKey="p_exceed" stroke="#22d3ee" strokeWidth={2} dot={{ r: 3, fill: "#22d3ee" }} animationDuration={600} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </section>
          )}

          {/* 4. 10-Day Alert Timeline */}
          {timeline && (
            <section>
              <h3 className="text-xs font-semibold text-text-2 mb-2 uppercase tracking-wider">10-Day Alert Timeline</h3>
              <div className="flex gap-1 flex-wrap">
                {timeline.days.map((day) => {
                  const lvlColors: Record<string, string> = {
                    GREEN:  "bg-emerald-500/20 border-emerald-500/40 text-emerald-400",
                    YELLOW: "bg-yellow-500/20  border-yellow-500/40  text-yellow-400",
                    ORANGE: "bg-amber-500/20   border-amber-500/40   text-amber-400",
                    RED:    "bg-red-500/20     border-red-500/40     text-red-400",
                  };
                  return (
                    <div
                      key={day.day}
                      className={cn(
                        "flex flex-col items-center p-1.5 rounded border text-center min-w-[44px]",
                        lvlColors[day.alert_level]
                      )}
                    >
                      <span className="text-[8px] text-text-3">{day.date_label}</span>
                      <span className="text-[10px] font-bold font-mono">{Math.round(day.p_extreme * 100)}%</span>
                      <span className="text-[8px] font-mono">{day.alert_level[0]}</span>
                    </div>
                  );
                })}
              </div>
            </section>
          )}

          {/* 5. Recommended SOP */}
          <section className="p-3 rounded-lg bg-surface-2/60 border border-border/40">
            <h3 className="text-xs font-semibold text-text-2 mb-1 uppercase tracking-wider flex items-center gap-1">
              <Info className="h-3.5 w-3.5" /> Recommended SOP
            </h3>
            <p className="text-xs text-text-2 leading-relaxed">{alert.recommended_action}</p>
          </section>
        </div>

        {/* Footer: Subscribe */}
        <div className="px-4 py-3 border-t border-border/50 bg-surface-2/30">
          <button
            onClick={handleSubscribe}
            className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-cyan-500/20 border border-cyan-500/40 text-cyan-400 text-sm font-semibold hover:bg-cyan-500/30 transition-colors"
          >
            <Bell className="h-4 w-4" />
            Notify me for {alert.district} alerts
          </button>
        </div>
      </div>
    </>
  );
}

function BoxWhisker({ spread }: { spread: NonNullable<ExtremesExplainV2Response["ensemble_spread"]> }) {
  const { min, p10, p25, p50, p75, p90, max, threshold } = spread;
  const range = max - min || 1;
  const toX = (v: number) => ((v - min) / range) * 100;

  return (
    <div className="relative py-4 px-2">
      <svg viewBox="0 0 280 60" className="w-full" aria-label="Box-and-whisker ensemble spread diagram">
        {/* Background axis */}
        <line x1={10} y1={30} x2={270} y2={30} stroke="#334155" strokeWidth={1} />

        {/* Whiskers */}
        <line x1={toX(min) * 2.6 + 10} y1={30} x2={toX(p10) * 2.6 + 10} y2={30} stroke="#64748b" strokeWidth={1.5} />
        <line x1={toX(p90) * 2.6 + 10} y1={30} x2={toX(max) * 2.6 + 10} y2={30} stroke="#64748b" strokeWidth={1.5} />
        {/* Whisker caps */}
        <line x1={toX(min) * 2.6 + 10} y1={22} x2={toX(min) * 2.6 + 10} y2={38} stroke="#64748b" strokeWidth={1.5} />
        <line x1={toX(max) * 2.6 + 10} y1={22} x2={toX(max) * 2.6 + 10} y2={38} stroke="#64748b" strokeWidth={1.5} />

        {/* IQR box (p25-p75) */}
        <rect
          x={toX(p25) * 2.6 + 10} y={18}
          width={(toX(p75) - toX(p25)) * 2.6} height={24}
          fill="rgba(34,211,238,0.15)" stroke="#22d3ee" strokeWidth={1.5} rx={2}
        />

        {/* Median */}
        <line
          x1={toX(p50) * 2.6 + 10} y1={16}
          x2={toX(p50) * 2.6 + 10} y2={44}
          stroke="#22d3ee" strokeWidth={2.5}
        />

        {/* Threshold line */}
        <line
          x1={toX(threshold) * 2.6 + 10} y1={8}
          x2={toX(threshold) * 2.6 + 10} y2={52}
          stroke="#f59e0b" strokeWidth={1.5} strokeDasharray="3 2"
        />
        <text x={toX(threshold) * 2.6 + 12} y={12} fill="#f59e0b" fontSize={8}>
          {threshold}mm
        </text>

        {/* Labels */}
        {[{ v: min, lbl: "Min" }, { v: p10, lbl: "P10" }, { v: p50, lbl: "P50" }, { v: p90, lbl: "P90" }, { v: max, lbl: "Max" }].map(({ v, lbl }) => (
          <text key={lbl} x={toX(v) * 2.6 + 10} y={54} fill="#64748b" fontSize={7.5} textAnchor="middle">
            {v}
          </text>
        ))}
      </svg>
    </div>
  );
}
