"use client";

import React from "react";
import { useAppStore } from "@/lib/store";
import { useWeightsQuery, useWeightsMatrixQuery, useCustomBlendMutation } from "@/lib/queries";
import { GlassCard } from "@/components/ui/GlassCard";
import { RadialWeights } from "@/components/charts/RadialWeights";
import { Heatmap } from "@/components/charts/Heatmap";

export default function AdaptiveWeightsPage() {
  const { variable, lead, regime } = useAppStore();
  const { data: weightsData } = useWeightsQuery({ variable, lead, regime });
  const { data: matrixData } = useWeightsMatrixQuery(variable);

  const weights = weightsData?.weights || {};
  const leadMatrix = matrixData?.lead_matrix || [];

  const heatmapRows = leadMatrix.map((row) => ({
    label: (row.day as string) || "",
    ...row
  }));

  const columns = [
    { key: "ncum_g", label: "NCUM", color: "#06B6D4" },
    { key: "neps", label: "NEPS", color: "#3B82F6" },
    { key: "imd_gfs", label: "GFS", color: "#10B981" },
    { key: "ecmwf_ifs", label: "ECMWF", color: "#6366F1" },
    { key: "graphcast", label: "GraphCast", color: "#8B5CF6" },
    { key: "pangu", label: "Pangu", color: "#D946EF" },
    { key: "fourcastnet", label: "FourCastNet", color: "#EC4899" }
  ];

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-bold text-text-1 tracking-tight">Adaptive Weights & Stacking</h1>
        <p className="text-xs text-text-3">
          Non-Negative Least Squares (NNLS) with Graph Laplacian Spatial Neighbor Smoothing across Leads & Regimes
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Radial Polar Radar (5 cols) */}
        <div className="lg:col-span-5">
          <RadialWeights
            weights={weights}
            modelsMeta={columns.map((c) => ({ id: c.key, name: c.label, color: c.color }))}
            title={`Lead Day ${lead / 24} Weight Allocation`}
          />
        </div>

        {/* Lead x Model Heatmap (7 cols) */}
        <div className="lg:col-span-7">
          <Heatmap
            title="Lead-Time Stacking Matrix (Day 1..10)"
            description="AI dominance at 24-72h transitions to NWP & Ensemble medium range stability"
            rows={heatmapRows}
            columns={columns}
          />
        </div>
      </div>
    </div>
  );
}
