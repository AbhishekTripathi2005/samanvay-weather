"use client";

import React, { useState } from "react";
import { Play, RotateCcw, AlertTriangle, CheckCircle2, XCircle, Clock, Zap, Info, ChevronRight, Activity } from "lucide-react";
import { GlassCard } from "@/components/ui/GlassCard";
import type { DagNodeId, DagNodeState } from "@/lib/types";

export interface PipelineNodeInfo {
  id: DagNodeId;
  label: string;
  sub: string;
  duration_ms: number;
  inputs: string;
  outputs: string;
  details: string;
}

export const DAG_NODES: PipelineNodeInfo[] = [
  {
    id: "ingest",
    label: "Ingest",
    sub: "7 Model Streams",
    duration_ms: 45,
    inputs: "ECMWF, NCUM-G, NEPS, IMD-GFS, GraphCast, Pangu, FourCastNet",
    outputs: "Standardized 0.25° grid arrays in memory",
    details: "Fetches GRIB2/NetCDF files via HTTP & local adapters, validates file integrity."
  },
  {
    id: "qc",
    label: "QC & Validation",
    sub: "Physical Consistency",
    duration_ms: 22,
    inputs: "Raw 0.25° precipitation & temperature grids",
    outputs: "Quality-flagged fields; rejected outliers masked",
    details: "Mass conservation check; flags 3.5-sigma gradient divergence anomalies."
  },
  {
    id: "bias_correct",
    label: "Bias-Correct",
    sub: "Quantile Mapping",
    duration_ms: 68,
    inputs: "Quality-controlled raw model arrays + IMD reference climatology",
    outputs: "Empirically calibrated quantile mapped forecasts",
    details: "Preserves heavy-rainfall tails; applies seasonal linear scaling to AI surrogates."
  },
  {
    id: "weight_update",
    label: "Weight Update",
    sub: "NNLS / Inverse-Skill",
    duration_ms: 54,
    inputs: "Current synoptic regime + 90-day verification errors",
    outputs: "Per-region model blending weight vectors (Σ = 1.0)",
    details: "Solves non-negative least squares constrained stacking; penalizes over-smoothed AI."
  },
  {
    id: "blend",
    label: "Blend Consensus",
    sub: "Bayesian Stacking",
    duration_ms: 85,
    inputs: "Bias-corrected grids + spatial weight vectors",
    outputs: "Unified SAMANVAY blended consensus grid + P10/P90 spread",
    details: "Applies spatial Laplacian regularisation (lambda=0.08) for smooth inter-grid transitions."
  },
  {
    id: "verify",
    label: "Verify & Calibrate",
    sub: "Bootstrap Cross-Val",
    duration_ms: 62,
    inputs: "Blended field + live AWS gauge telemetry",
    outputs: "Isotonic calibrated exceedance probabilities & Brier skill scores",
    details: "Runs 200-sample bootstrap for confidence intervals on skill delta."
  },
  {
    id: "publish",
    label: "Publish & Cache",
    sub: "Edge Dispatch",
    duration_ms: 38,
    inputs: "Consensus grid, hazard warnings, verification scorecard",
    outputs: "GeoJSON, NetCDF-4, CSV, and IMD PDF bulletins",
    details: "Writes artifacts to edge cache and pushes alerts to Disaster DSS & SDMA webhooks."
  }
];

interface Props {
  nodeStates: Record<DagNodeId, DagNodeState>;
  currentNodeId: DagNodeId | null;
  overallStatus: "idle" | "running" | "success" | "fail";
  isSimulateFail: boolean;
  onToggleSimulateFail: (val: boolean) => void;
  onRunBlend: () => void;
  onOpenLogs: () => void;
  onReset: () => void;
}

export function PipelineDag({
  nodeStates,
  currentNodeId,
  overallStatus,
  isSimulateFail,
  onToggleSimulateFail,
  onRunBlend,
  onOpenLogs,
  onReset
}: Props) {
  const [selectedNode, setSelectedNode] = useState<PipelineNodeInfo>(DAG_NODES[0]);

  const getStateBadge = (state: DagNodeState) => {
    switch (state) {
      case "running":
        return <span className="w-2.5 h-2.5 rounded-full bg-cyan-400 animate-ping" />;
      case "success":
        return <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />;
      case "warn":
        return <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />;
      case "fail":
        return <XCircle className="w-3.5 h-3.5 text-rose-500" />;
      default:
        return <span className="w-2 h-2 rounded-full bg-slate-600" />;
    }
  };

  const getNodeBorder = (state: DagNodeState, isCurrent: boolean) => {
    if (isCurrent || state === "running") return "border-cyan-400 shadow-md shadow-cyan-500/20 bg-cyan-950/30";
    if (state === "fail") return "border-rose-500/70 shadow-md shadow-rose-500/20 bg-rose-950/30";
    if (state === "warn") return "border-amber-500/70 bg-amber-950/20";
    if (state === "success") return "border-emerald-500/60 bg-emerald-950/20";
    return "border-border/60 bg-surface-2/40 hover:border-border";
  };

  return (
    <GlassCard className="p-5 flex flex-col gap-5">
      {/* Header and Controls */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-base font-bold text-text-1">Operational Consensus Pipeline DAG</h2>
            <span className={`text-[10px] font-mono px-2 py-0.5 rounded-full border ${
              overallStatus === "running" ? "bg-cyan-500/15 border-cyan-500/40 text-cyan-300 animate-pulse" :
              overallStatus === "success" ? "bg-emerald-500/15 border-emerald-500/40 text-emerald-300" :
              overallStatus === "fail" ? "bg-rose-500/15 border-rose-500/40 text-rose-300 font-bold" :
              "bg-surface-2 border-border text-text-3"
            }`}>
              {overallStatus.toUpperCase()}
            </span>
          </div>
          <p className="text-xs text-text-3 mt-0.5">
            Ingest ? QC ? Bias-Correct ? Weight Update ? Blend ? Verify ? Publish
          </p>
        </div>

        <div className="flex items-center gap-3 flex-wrap">
          {/* Simulate Fail Checkbox */}
          <label className="flex items-center gap-2 text-xs text-text-2 cursor-pointer bg-surface-2/70 hover:bg-surface-2 px-3 py-1.5 rounded-lg border border-border/60 transition-colors">
            <input
              type="checkbox"
              checked={isSimulateFail}
              onChange={(e) => onToggleSimulateFail(e.target.checked)}
              disabled={overallStatus === "running"}
              className="accent-rose-500 cursor-pointer rounded"
            />
            <span className="text-[11px] font-medium text-rose-300">Force QC Failure (Test Recovery)</span>
          </label>

          {/* Run Blend Now Button */}
          <button
            onClick={onRunBlend}
            disabled={overallStatus === "running"}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-cyan-500 to-indigo-600 text-white font-bold text-xs shadow-lg shadow-cyan-500/25 hover:opacity-95 disabled:opacity-50 transition-all cursor-pointer"
          >
            <Play className="w-3.5 h-3.5 fill-current" />
            <span>Run Blend Now</span>
          </button>

          {/* Reset button if finished or failed */}
          {(overallStatus === "success" || overallStatus === "fail") && (
            <button
              onClick={onReset}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-surface-2 hover:bg-surface-3 border border-border text-text-2 text-xs font-semibold transition-colors"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reset</span>
            </button>
          )}

          <button
            onClick={onOpenLogs}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-surface-2 hover:bg-surface-3 border border-border text-text-2 text-xs font-medium transition-colors"
          >
            <Activity className="w-3.5 h-3.5 text-cyan-400" />
            <span>Live Logs</span>
          </button>
        </div>
      </div>

      {/* 7-Node DAG Flow */}
      <div className="overflow-x-auto pb-2">
        <div className="flex items-center gap-2 min-w-[880px] justify-between py-2">
          {DAG_NODES.map((node, idx) => {
            const state = nodeStates[node.id] || "idle";
            const isCurrent = currentNodeId === node.id;
            const isSelected = selectedNode.id === node.id;

            return (
              <React.Fragment key={node.id}>
                {/* Node Box */}
                <div
                  onClick={() => setSelectedNode(node)}
                  className={`flex-1 p-3 rounded-xl border transition-all cursor-pointer select-none ${getNodeBorder(state, isCurrent)} ${
                    isSelected ? "ring-2 ring-cyan-500/40" : ""
                  }`}
                >
                  <div className="flex items-center justify-between gap-1 mb-1.5">
                    <span className="text-[10px] font-mono text-text-3 font-semibold">
                      0{idx + 1}
                    </span>
                    <div className="flex items-center gap-1">
                      {getStateBadge(state)}
                    </div>
                  </div>

                  <div className="text-xs font-bold text-text-1 truncate">
                    {node.label}
                  </div>
                  <div className="text-[10px] text-text-3 truncate mt-0.5">
                    {node.sub}
                  </div>

                  <div className="flex items-center justify-between mt-2 pt-2 border-t border-border/30 text-[10px] font-mono text-text-3">
                    <span className="flex items-center gap-1">
                      <Clock className="w-2.5 h-2.5" />
                      {node.duration_ms}ms
                    </span>
                    <span className="capitalize text-text-2 font-medium">
                      {state}
                    </span>
                  </div>
                </div>

                {/* Arrow */}
                {idx < DAG_NODES.length - 1 && (
                  <div className="flex items-center justify-center text-text-3 px-0.5">
                    <ChevronRight className={`w-4 h-4 ${
                      state === "success" ? "text-cyan-400" :
                      state === "running" ? "text-cyan-400 animate-pulse" : "text-border"
                    }`} />
                  </div>
                )}
              </React.Fragment>
            );
          })}
        </div>
      </div>

      {/* Selected Node Inspector Drawer / Card */}
      {selectedNode && (
        <div className="p-3.5 rounded-xl bg-surface-2/60 border border-border/50 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 text-xs">
          <div className="flex items-start gap-3">
            <div className="p-2 rounded-lg bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 mt-0.5">
              <Zap className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-text-1">{selectedNode.label}</span>
                <span className="text-[10px] font-mono text-cyan-400 font-semibold px-2 py-0.5 rounded bg-surface-2 border border-border/40">
                  {selectedNode.duration_ms} ms nominal
                </span>
                <span className="text-[10px] text-text-3">Stage {DAG_NODES.findIndex(n => n.id === selectedNode.id) + 1} of 7</span>
              </div>
              <p className="text-text-2 text-[11px] mt-1">{selectedNode.details}</p>
            </div>
          </div>

          <div className="flex flex-col gap-1 text-[11px] min-w-[280px] bg-surface-1/50 p-2.5 rounded-lg border border-border/40">
            <div>
              <span className="text-text-3 font-semibold">Inputs: </span>
              <span className="text-text-2">{selectedNode.inputs}</span>
            </div>
            <div>
              <span className="text-text-3 font-semibold">Outputs: </span>
              <span className="text-text-2">{selectedNode.outputs}</span>
            </div>
          </div>
        </div>
      )}
    </GlassCard>
  );
}
