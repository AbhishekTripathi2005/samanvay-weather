"use client";

import React from "react";
import { useAppStore } from "@/lib/store";
import { useExtremesQuery, useReliabilityQuery, useExtremesExplainQuery } from "@/lib/queries";
import { GlassCard } from "@/components/ui/GlassCard";
import { AlertBadge } from "@/components/ui/AlertBadge";
import { ReliabilityDiagram } from "@/components/charts/ReliabilityDiagram";

export default function ExtremesPage() {
  const { variable } = useAppStore();
  const { data: extremes } = useExtremesQuery();
  const { data: reliability } = useReliabilityQuery({ variable, threshold: 64.5, lead: 3 });
  const { data: explain } = useExtremesExplainQuery("shimla");

  const alerts = extremes?.alerts || [];

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-bold text-text-1 tracking-tight">Disaster Decision Support & Extremes</h1>
        <p className="text-xs text-text-3">
          IMD Four-Tier Alert Matrix (Red / Orange / Yellow) with Calibrated Exceedance Probabilities & SOP Protocols
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Active Extreme Alerts Table (7 cols) */}
        <div className="lg:col-span-7">
          <GlassCard className="p-4 flex flex-col">
            <div className="flex items-center justify-between mb-3">
              <div>
                <h3 className="text-sm font-semibold text-text-1">Active Operational Advisories</h3>
                <p className="text-xs text-text-3">{alerts.length} districts under active meteorological warning</p>
              </div>
              <div className="flex gap-2">
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-rose-500/20 text-rose-300 font-bold border border-rose-500/30">
                  {extremes?.red_count || 0} RED
                </span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 font-bold border border-amber-500/30">
                  {extremes?.orange_count || 0} ORANGE
                </span>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-border/60 text-text-3">
                    <th className="py-2 px-2">District</th>
                    <th className="py-2 px-2">Alert</th>
                    <th className="py-2 px-2 text-right">Forecast</th>
                    <th className="py-2 px-2 text-right">P(Ext)</th>
                    <th className="py-2 px-2">Recommended SOP</th>
                  </tr>
                </thead>
                <tbody>
                  {alerts.map((a) => (
                    <tr key={a.id} className="border-b border-border/20 hover:bg-surface-2/40">
                      <td className="py-2.5 px-2 font-medium text-text-1">
                        {a.district} <span className="text-[10px] text-text-3">({a.state})</span>
                      </td>
                      <td className="py-2.5 px-2">
                        <AlertBadge level={a.alert_level} />
                      </td>
                      <td className="py-2.5 px-2 text-right font-mono text-cyan-400 font-bold">
                        {a.forecast_value} mm
                      </td>
                      <td className="py-2.5 px-2 text-right font-mono text-text-1">
                        {Math.round(a.p_extreme * 100)}%
                      </td>
                      <td className="py-2.5 px-2 text-text-3 text-[11px] truncate max-w-[200px]" title={a.recommended_action}>
                        {a.recommended_action}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </GlassCard>
        </div>

        {/* Reliability & Explainability (5 cols) */}
        <div className="lg:col-span-5 flex flex-col gap-5">
          <ReliabilityDiagram
            bins={reliability?.bins || []}
            brierSkillScore={reliability?.brier_skill_score_pct || 37.3}
            threshold={64.5}
          />

          {/* Explainability Card */}
          {explain && (
            <GlassCard className="p-4 flex flex-col gap-2">
              <h3 className="text-sm font-semibold text-text-1">Alert Feature Attribution ({explain.district})</h3>
              <p className="text-xs text-text-3">SHAP-style additive factors triggering warning:</p>
              <div className="flex flex-col gap-1.5 mt-1">
                {explain.features.slice(0, 4).map((f, i) => (
                  <div key={i} className="flex items-center justify-between text-xs p-1.5 bg-surface-2 rounded-lg">
                    <span className="text-text-2">{f.feature}</span>
                    <span className="font-mono font-bold text-cyan-400">
                      {f.attribution > 0 ? `+${f.attribution}` : f.attribution}
                    </span>
                  </div>
                ))}
              </div>
            </GlassCard>
          )}
        </div>
      </div>
    </div>
  );
}
