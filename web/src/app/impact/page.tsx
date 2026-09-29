"use client";

import React from "react";
import { useQuery } from "@tanstack/react-query";
import { fetchPINNStudyMetrics, fetchPINNDiagnostics } from "@/lib/api";
import { useOpsStore } from "@/lib/store";
import { ShieldAlert, Award, FileCheck, CheckCircle2, TrendingUp, History, Compass } from "lucide-react";

export default function ImpactPage() {
  const { lead, regime } = useOpsStore();

  const { data: studyMetrics } = useQuery({
    queryKey: ["pinnStudyMetrics"],
    queryFn: fetchPINNStudyMetrics,
    staleTime: 60000
  });

  const { data: diagnostics } = useQuery({
    queryKey: ["pinnDiagnostics", lead, regime],
    queryFn: () => fetchPINNDiagnostics(lead, regime),
    staleTime: 30000
  });

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="glass-panel rounded-xl p-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <span className="p-1.5 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              <ShieldAlert className="h-5 w-5" />
            </span>
            <h2 className="font-heading text-xl font-bold text-emerald-300">
              Physics-Informed (PINN) Consistency & Verification Impact
            </h2>
          </div>
          <p className="text-xs text-slate-400 mt-1 max-w-3xl">
            Mathematical conservation constraints enforcing mass divergence, moisture flux continuity, and
            topographic orographic uplift across India.
          </p>
        </div>
        {/* Prominent required label */}
        <div className="flex items-center space-x-2 bg-emerald-950/60 border border-emerald-500/40 text-emerald-300 px-3 py-1.5 rounded-lg font-mono text-xs">
          <FileCheck className="h-4 w-4" />
          <span className="font-bold tracking-wider uppercase">from prior study</span>
        </div>
      </div>

      {/* Benchmark Metric Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {/* Mass Conservation */}
        <div className="glass-panel rounded-xl p-5 flex flex-col justify-between space-y-4">
          <div>
            <span className="font-mono text-[11px] text-slate-400 uppercase tracking-wider block mb-1">
              Mass Divergence Residual (∇ · vq)
            </span>
            <div className="flex items-baseline space-x-2">
              <span className="font-mono text-3xl font-extrabold text-emerald-400">0.3%</span>
              <span className="font-mono text-xs text-slate-400">vs 4.8% Pure AI</span>
            </div>
            <p className="text-xs text-emerald-300/80 mt-1">
              {studyMetrics?.mass_conservation_violation_pct.improvement_over_ai}
            </p>
          </div>

          <div className="font-mono text-xs space-y-1.5 bg-slate-900/60 p-3 rounded-lg border border-slate-800">
            <div className="flex justify-between text-slate-400">
              <span>Pure AI:</span>
              <span className="text-red-400 font-bold">4.8% violation</span>
            </div>
            <div className="flex justify-between text-slate-400">
              <span>Raw NWP:</span>
              <span className="text-slate-300">0.4% violation</span>
            </div>
            <div className="flex justify-between text-slate-400 border-t border-slate-800 pt-1">
              <span>SAMANVAY PINN:</span>
              <span className="text-emerald-400 font-bold">0.3% violation</span>
            </div>
          </div>
        </div>

        {/* Precipitation RMSE */}
        <div className="glass-panel rounded-xl p-5 flex flex-col justify-between space-y-4">
          <div>
            <span className="font-mono text-[11px] text-slate-400 uppercase tracking-wider block mb-1">
              24h Precipitation RMSE
            </span>
            <div className="flex items-baseline space-x-2">
              <span className="font-mono text-3xl font-extrabold text-cyan-400">8.9 mm</span>
              <span className="font-mono text-xs text-slate-400">vs 14.2 mm Raw NWP</span>
            </div>
            <p className="text-xs text-cyan-300/80 mt-1">
              {studyMetrics?.precipitation_rmse_mm.improvement_over_nwp}
            </p>
          </div>

          <div className="font-mono text-xs space-y-1.5 bg-slate-900/60 p-3 rounded-lg border border-slate-800">
            <div className="flex justify-between text-slate-400">
              <span>Raw NWP:</span>
              <span className="text-slate-400">14.2 mm</span>
            </div>
            <div className="flex justify-between text-slate-400">
              <span>Pure AI:</span>
              <span className="text-slate-300">12.8 mm</span>
            </div>
            <div className="flex justify-between text-slate-400 border-t border-slate-800 pt-1">
              <span>SAMANVAY PINN:</span>
              <span className="text-cyan-400 font-bold">8.9 mm (-37%)</span>
            </div>
          </div>
        </div>

        {/* Threat Score Gain */}
        <div className="glass-panel rounded-xl p-5 flex flex-col justify-between space-y-4">
          <div>
            <span className="font-mono text-[11px] text-slate-400 uppercase tracking-wider block mb-1">
              Equitable Threat Score (&gt;64.5mm)
            </span>
            <div className="flex items-baseline space-x-2">
              <span className="font-mono text-3xl font-extrabold text-amber-400">0.46</span>
              <span className="font-mono text-xs text-slate-400">ETS Score</span>
            </div>
            <p className="text-xs text-amber-300/80 mt-1">
              {studyMetrics?.equitable_threat_score_heavy_rain.improvement}
            </p>
          </div>

          <div className="font-mono text-xs space-y-1.5 bg-slate-900/60 p-3 rounded-lg border border-slate-800">
            <div className="flex justify-between text-slate-400">
              <span>Raw NWP:</span>
              <span className="text-slate-400">0.28</span>
            </div>
            <div className="flex justify-between text-slate-400">
              <span>Pure AI:</span>
              <span className="text-slate-300">0.34</span>
            </div>
            <div className="flex justify-between text-slate-400 border-t border-slate-800 pt-1">
              <span>SAMANVAY PINN:</span>
              <span className="text-amber-400 font-bold">0.46 (+35%)</span>
            </div>
          </div>
        </div>
      </div>

      {/* Historical Extreme Case Studies */}
      <div className="glass-panel rounded-xl p-5">
        <div className="flex items-center space-x-2 mb-4">
          <History className="h-5 w-5 text-cyan-400" />
          <h3 className="font-heading font-bold text-base text-slate-200">
            Historical Extreme Weather Case Studies (from prior study)
          </h3>
        </div>

        <div className="space-y-4">
          {studyMetrics?.historical_extreme_case_studies.map((cs, idx) => (
            <div
              key={idx}
              className="p-4 rounded-xl bg-slate-900/70 border border-slate-800 hover:border-slate-700 transition space-y-2 font-mono"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 border-b border-slate-800 pb-2">
                <h4 className="font-heading font-bold text-sm text-cyan-300">{cs.event_name}</h4>
                <span className="text-[11px] text-slate-400">{cs.region}</span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-2 text-xs pt-1">
                <div className="p-2 rounded bg-slate-950/60 border border-slate-800/80">
                  <span className="text-[10px] text-slate-500 uppercase block">Raw NWP Error:</span>
                  <span className="text-slate-300 text-[11px]">{cs.raw_nwp_lead72_error}</span>
                </div>
                <div className="p-2 rounded bg-slate-950/60 border border-slate-800/80">
                  <span className="text-[10px] text-slate-500 uppercase block">Pure AI Error:</span>
                  <span className="text-red-400/90 text-[11px]">{cs.pure_ai_lead72_error}</span>
                </div>
                <div className="p-2 rounded bg-cyan-950/40 border border-cyan-500/30">
                  <span className="text-[10px] text-cyan-400 uppercase block font-bold">SAMANVAY PINN Result:</span>
                  <span className="text-cyan-300 text-[11px] font-semibold">{cs.samanvay_lead72_result}</span>
                </div>
              </div>

              <div className="text-[11px] text-emerald-400/90 bg-emerald-950/20 p-2 rounded border border-emerald-500/20">
                <strong>Physics Mechanism:</strong> {cs.pinn_constraint_contribution}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
