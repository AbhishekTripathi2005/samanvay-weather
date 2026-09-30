"use client";
/**
 * PriorStudyPanel — fixed PINN study metrics, labelled as "prior study results".
 * R2=0.80, RMSE=0.0345, MAE=0.0214, Flood-risk accuracy=89.33%, ROC-AUC=0.9235
 * All clearly labelled as prior-study, NOT live metrics.
 */
import React from "react";
import { GlassCard } from "@/components/ui/GlassCard";
import { BookOpen, FlaskConical } from "lucide-react";

const METRICS = [
  { label: "R²", value: "0.80",  unit: "",    color: "text-cyan-400",   desc: "Variance explained (soil moisture proxy vs observed runoff)" },
  { label: "RMSE", value: "0.0345", unit: "norm.", color: "text-violet-400", desc: "Normalised root-mean-square error on soil-saturation field" },
  { label: "MAE",  value: "0.0214", unit: "norm.", color: "text-fuchsia-400", desc: "Mean absolute error on saturation fraction" },
  { label: "Flood-risk accuracy", value: "89.33", unit: "%", color: "text-amber-400", desc: "Classification accuracy on 4-class flood risk (balanced dataset)" },
  { label: "ROC-AUC", value: "0.9235", unit: "", color: "text-emerald-400", desc: "Area under ROC curve for binary flood / no-flood detection" },
];

const LIMITATIONS = [
  {
    title: "PINN over-smoothing on peaks",
    body: "The physics-informed loss function penalises oscillations; this reduces false positives but causes systematic under-prediction of soil saturation extremes (>95th percentile). Recall on extreme saturation events is weak — peak flows can be underestimated by 15–30%.",
    severity: "ORANGE",
  },
  {
    title: "Landslide metrics: discriminative, not forecast accuracy",
    body: "The slope–elevation–aspect susceptibility model was trained and evaluated on a dataset where negatives were pseudo-absence samples (random non-event locations), not confirmed non-landslide sites. This inflates specificity. The reported ROC-AUC applies to distinguishing susceptible vs. unlikely terrain — NOT to predicting when a slide will occur.",
    severity: "RED",
  },
  {
    title: "Temporal scope: prior study (2018–2023)",
    body: "All metrics are from a retrospective ERA5 + IMD gridded gauge evaluation (PS 26081). Live operational performance may differ due to regime shift, sensor drift, or data assimilation changes. Monitor skill scores in the Verification panel for updated estimates.",
    severity: "YELLOW",
  },
];

const SEV_STYLE: Record<string, string> = {
  RED:    "border-red-500/40    bg-red-500/10    text-red-300",
  ORANGE: "border-amber-500/40  bg-amber-500/10  text-amber-300",
  YELLOW: "border-yellow-500/40 bg-yellow-500/10 text-yellow-300",
};

export function PriorStudyPanel() {
  return (
    <div className="flex flex-col gap-3">
      {/* Prior study metrics */}
      <GlassCard className="p-4 flex flex-col gap-3">
        <div className="flex items-center gap-2">
          <FlaskConical className="h-4 w-4 text-cyan-400" />
          <h3 className="text-sm font-semibold text-text-1">PINN Prior Study Results</h3>
          <span className="ml-auto text-[10px] font-mono px-2 py-0.5 rounded border border-cyan-500/40 bg-cyan-500/10 text-cyan-400 font-semibold">
            Prior study — MoES / NCMRWF PS 26081
          </span>
        </div>
        <p className="text-[11px] text-text-3">
          ERA5 reanalysis + IMD High-Resolution Gridded Gauges (2018–2023).
          PINN-Constrained Adaptive Blending vs. pure NWP and pure AI baselines.
          Labelled <strong className="text-cyan-300">&ldquo;prior-study results&rdquo;</strong> — not live operational metrics.
        </p>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2">
          {METRICS.map((m) => (
            <div key={m.label} className="flex flex-col bg-surface-2/40 border border-border/40 rounded-lg p-3 gap-1">
              <div className="text-[10px] text-text-3">{m.label}</div>
              <div className={`text-xl font-mono font-bold ${m.color}`}>
                {m.value}
                <span className="text-xs text-text-3 ml-1">{m.unit}</span>
              </div>
              <div className="text-[9px] text-text-3 leading-tight">{m.desc}</div>
            </div>
          ))}
        </div>
      </GlassCard>

      {/* Honest limitations card — visible without scrolling on desktop */}
      <GlassCard className="p-4 flex flex-col gap-3">
        <div className="flex items-center gap-2">
          <BookOpen className="h-4 w-4 text-amber-400" />
          <h3 className="text-sm font-semibold text-text-1">Honest Limitations</h3>
          <span className="ml-auto text-[10px] px-2 py-0.5 rounded border border-amber-500/40 bg-amber-500/10 text-amber-400 font-semibold">
            Read before operational use
          </span>
        </div>
        <div className="flex flex-col gap-2">
          {LIMITATIONS.map((lim) => (
            <div
              key={lim.title}
              className={`rounded-lg border p-3 text-[11px] leading-relaxed ${SEV_STYLE[lim.severity]}`}
            >
              <div className="font-semibold mb-1">{lim.title}</div>
              <div className="opacity-90">{lim.body}</div>
            </div>
          ))}
        </div>
      </GlassCard>
    </div>
  );
}
