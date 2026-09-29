"use client";

import React, { useState } from "react";
import { useAppStore } from "@/lib/store";
import { useWeightsMapQuery, useMetaQuery } from "@/lib/queries";
import { RegionalChoroplethMap } from "@/components/weights/RegionalChoroplethMap";
import { ReliabilityMatrix } from "@/components/weights/ReliabilityMatrix";
import { WeightEvolutionStrip } from "@/components/weights/WeightEvolutionStrip";
import { WeightInsightCards } from "@/components/weights/WeightInsightCards";
import { WeightControls } from "@/components/weights/WeightControls";
import { RadialWeights } from "@/components/charts/RadialWeights";
import { Network, Compass, Sparkles } from "lucide-react";

export default function AdaptiveWeightsPage() {
  const {
    variable,
    lead,
    region,
    regime,
    season,
    setVariable,
    setLead,
    setRegion,
    setRegime,
    setSeason
  } = useAppStore();

  const [method, setMethod] = useState<string>("stacked_nnls");

  const { data: weightsData, isLoading } = useWeightsMapQuery({
    variable,
    lead,
    season,
    regime,
    method
  });

  const { data: meta } = useMetaQuery();

  const regions = weightsData?.regions || [];
  const selectedRegionDetail =
    regions.find((r) => r.code === region) || regions[0] || {
      code: "DL",
      name: "Delhi (NCT)",
      zone: "Northwest India",
      terrain: "Urban Megacity Basin",
      lat: 28.7,
      lon: 77.1,
      weights: {
        ncum_g: 0.20,
        neps: 0.22,
        imd_gfs: 0.16,
        ecmwf_ifs: 0.20,
        graphcast: 0.08,
        pangu: 0.07,
        fourcastnet: 0.07
      },
      dominant_model: "ncum_g",
      dominant_color: "#06B6D4",
      dominant_type: "NWP",
      top_3: [],
      confidence: 0.82,
      sample_size: 730
    };

  // Derive dynamic 10-day lead evolution for whichever region is currently selected
  const selectedEvolution =
    weightsData?.reliability_matrix.rows.map((row) => ({
      lead: row.lead,
      day: row.label,
      ...(row[region]?.weights || {})
    })) ||
    weightsData?.default_evolution ||
    [];

  const modelsMeta = weightsData?.models_meta || [
    { id: "ncum_g", name: "NCUM-G", color: "#06B6D4" },
    { id: "neps", name: "NEPS", color: "#3B82F6" },
    { id: "imd_gfs", name: "IMD-GFS", color: "#10B981" },
    { id: "ecmwf_ifs", name: "ECMWF-IFS", color: "#6366F1" },
    { id: "graphcast", name: "GraphCast", color: "#8B5CF6" },
    { id: "pangu", name: "Pangu", color: "#D946EF" },
    { id: "fourcastnet", name: "FourCastNet", color: "#EC4899" }
  ];

  return (
    <div className="flex flex-col gap-6 max-w-[1920px] mx-auto pb-12">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Network className="w-5 h-5 text-cyan-400" />
            <h1 className="text-2xl font-bold text-text-1 tracking-tight">
              Adaptive Weights & Stacking Matrix
            </h1>
            <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-cyan-950/60 border border-cyan-500/40 text-cyan-300 font-semibold uppercase">
              Step 7 Core
            </span>
          </div>
          <p className="text-xs text-text-3">
            Non-Negative Least Squares (NNLS) with Graph Laplacian Spatial Neighbor Regularization across Leads, Terrains & Synoptic Regimes
          </p>
        </div>

        {/* Selected Region Status Pill */}
        <div className="flex items-center gap-2.5 font-mono text-xs">
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-surface-2 border border-cyan-500/30">
            <Compass className="w-3.5 h-3.5 text-cyan-400" />
            <span className="text-text-3">Target Region:</span>
            <span className="text-cyan-300 font-bold">
              {selectedRegionDetail.name} ({selectedRegionDetail.code})
            </span>
          </div>
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-surface-2 border border-border">
            <span className="text-text-3">Winning Model:</span>
            <span
              className="font-bold uppercase"
              style={{ color: selectedRegionDetail.dominant_color }}
            >
              {selectedRegionDetail.dominant_model}
            </span>
          </div>
        </div>
      </div>

      {/* Global Filter Controls Bar */}
      <WeightControls
        variable={variable}
        onSelectVariable={setVariable}
        leadHours={lead}
        onSelectLead={setLead}
        season={season}
        onSelectSeason={setSeason}
        regime={regime}
        onSelectRegime={setRegime}
        method={method}
        onSelectMethod={setMethod}
      />

      {/* Top Grid: Choropleth Map (7 cols) + Evolution Strip & Radial Radar (5 cols) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Choropleth Map */}
        <div className="lg:col-span-7">
          <RegionalChoroplethMap
            regions={regions}
            selectedRegion={region}
            onSelectRegion={setRegion}
            variable={variable}
            leadHours={lead}
          />
        </div>

        {/* Right Stack: Evolution Strip + Radial Radar */}
        <div className="lg:col-span-5 flex flex-col gap-6">
          <WeightEvolutionStrip
            evolutionData={selectedEvolution}
            selectedRegionName={selectedRegionDetail.name}
            selectedRegionCode={selectedRegionDetail.code}
          />

          <RadialWeights
            weights={selectedRegionDetail.weights}
            modelsMeta={modelsMeta}
            title={`${selectedRegionDetail.name} Lead Day ${lead / 24} Weight Allocation`}
          />
        </div>
      </div>

      {/* Middle Section: Lead x Region Reliability Matrix */}
      <ReliabilityMatrix
        rows={weightsData?.reliability_matrix.rows || []}
        regions={regions}
        selectedRegion={region}
        onSelectRegion={setRegion}
      />

      {/* Bottom Section: Auto-Generated Meteorological Insight Cards */}
      <WeightInsightCards insights={weightsData?.insights || []} />
    </div>
  );
}
