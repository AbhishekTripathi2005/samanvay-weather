"use client";

import React, { useState } from "react";
import { useAppStore } from "@/lib/store";
import { useForecastPlumeQuery, useMetaQuery } from "@/lib/queries";
import { WorkbenchControls } from "@/components/workbench/WorkbenchControls";
import { MultiModelPlumeChart } from "@/components/workbench/MultiModelPlumeChart";
import { LiveWeightSliders } from "@/components/workbench/LiveWeightSliders";
import { BiasInspector } from "@/components/workbench/BiasInspector";
import { Sparkles, Compass, ShieldAlert, Cpu } from "lucide-react";

export default function ForecastExplorerPage() {
  const { variable, lead, region, regime, setVariable, setLead, setRegion, setRegime } = useAppStore();

  // Local workbench parameters
  const [cycle, setCycle] = useState<string>("00Z");
  const [method, setMethod] = useState<string>("stacked_nnls");
  const [halfLife, setHalfLife] = useState<number>(14);
  const [temperature, setTemperature] = useState<number>(1.0);

  // Queries
  const { data: meta } = useMetaQuery();
  const { data: plumeData, isLoading, error } = useForecastPlumeQuery({
    region,
    variable,
    regime,
    method,
    half_life: halfLife,
    temperature
  });

  const states = meta?.regions.states || [];
  const selectedState = states.find((s) => s.code === region) || states[0] || {
    code: "DL",
    name: "Delhi (NCT)",
    zone: "Northwest India",
    terrain: "Urban Megacity Basin",
    lat: 28.7,
    lon: 77.1,
    pop_millions: 21.0
  };

  const timeline = plumeData?.timeline || [];
  const currentLeadDay = Math.max(1, Math.min(10, Math.floor(lead / 24)));
  const currentTimelinePoint = timeline.find((t) => t.lead_day === currentLeadDay) || timeline[0];

  const optimalWeights = currentTimelinePoint?.weights || {};
  const optimalConsensus = currentTimelinePoint?.samanvay || 0;

  // Extract source values for current lead
  const sourceValues: Record<string, number> = {
    ncum_g: currentTimelinePoint?.ncum_g ?? 0,
    neps: currentTimelinePoint?.neps ?? 0,
    imd_gfs: currentTimelinePoint?.imd_gfs ?? 0,
    ecmwf_ifs: currentTimelinePoint?.ecmwf_ifs ?? 0,
    graphcast: currentTimelinePoint?.graphcast ?? 0,
    pangu: currentTimelinePoint?.pangu ?? 0,
    fourcastnet: currentTimelinePoint?.fourcastnet ?? 0
  };

  const getUnit = (v: string) => {
    switch (v) {
      case "rainfall":
        return "mm/24h";
      case "tmax":
      case "tmin":
        return "°C";
      case "wind_speed":
      case "wind_gust":
        return "km/h";
      default:
        return "units";
    }
  };
  const unit = getUnit(variable);

  return (
    <div className="flex flex-col gap-6 max-w-[1920px] mx-auto pb-12">
      {/* Page Title & Operational Status Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Compass className="w-5 h-5 text-cyan-400" />
            <h1 className="text-2xl font-bold text-text-1 tracking-tight">
              Interactive Forecast Workbench
            </h1>
            <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-cyan-950/60 border border-cyan-500/40 text-cyan-300 font-semibold uppercase">
              Step 6 Core
            </span>
          </div>
          <p className="text-xs text-text-3">
            Real-time multi-model plume simulation, live weight override, and empirical quantile mapping calibration
          </p>
        </div>

        {/* Status Tags */}
        <div className="flex items-center gap-2.5 font-mono text-xs">
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-surface-2 border border-border">
            <Cpu className="w-3.5 h-3.5 text-cyan-400" />
            <span className="text-text-3">Method:</span>
            <span className="text-cyan-300 font-semibold uppercase">{method.replace("_", " ")}</span>
          </div>
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-surface-2 border border-border">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-emerald-300 font-semibold">7 Models Active</span>
          </div>
        </div>
      </div>

      {/* Main 3-Column Workbench Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Target & Controls (3 cols) */}
        <div className="lg:col-span-3">
          <WorkbenchControls
            states={states}
            selectedRegion={region}
            onSelectRegion={setRegion}
            variable={variable}
            onSelectVariable={setVariable}
            leadHours={lead}
            onSelectLead={setLead}
            cycle={cycle}
            onSelectCycle={setCycle}
            method={method}
            onSelectMethod={setMethod}
            halfLife={halfLife}
            onSelectHalfLife={setHalfLife}
            temperature={temperature}
            onSelectTemperature={setTemperature}
          />
        </div>

        {/* Centre Column: Multi-Model Plume Fan Chart (6 cols) */}
        <div className="lg:col-span-6">
          <MultiModelPlumeChart
            timeline={timeline}
            variable={variable}
            regionName={selectedState.name}
            regionCode={region}
            leadHours={lead}
            weights={optimalWeights}
            activeRegime={regime}
          />
        </div>

        {/* Right Column: Live Weight Sliders (3 cols) */}
        <div className="lg:col-span-3">
          <LiveWeightSliders
            initialWeights={optimalWeights}
            sourceValues={sourceValues}
            optimalConsensus={optimalConsensus}
            variable={variable}
            leadHours={lead}
            region={region}
            regime={regime}
            unit={unit}
          />
        </div>
      </div>

      {/* Automated Meteorological Insights Banner */}
      {plumeData?.insights && plumeData.insights.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {plumeData.insights.map((insight, idx) => (
            <div
              key={idx}
              className="p-3 rounded-xl bg-surface-1/80 border border-cyan-500/20 backdrop-blur-sm flex items-start gap-2.5 text-xs"
            >
              <Sparkles className="w-4 h-4 text-cyan-400 flex-shrink-0 mt-0.5" />
              <p className="text-text-2 leading-relaxed">{insight}</p>
            </div>
          ))}
        </div>
      )}

      {/* Bottom Panel: Bias-Correction Inspector & Error Scorecard */}
      <BiasInspector
        quantileData={plumeData?.quantile_data || []}
        modelScorecards={plumeData?.model_scorecards || []}
        variable={variable}
        regionName={selectedState.name}
      />
    </div>
  );
}
