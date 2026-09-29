"use client";

import React from "react";
import { useAppStore } from "@/lib/store";
import { useForecastQuery, useFieldQuery } from "@/lib/queries";
import { ForecastMap } from "@/components/map/ForecastMap";
import { GlassCard } from "@/components/ui/GlassCard";
import { AlertBadge } from "@/components/ui/AlertBadge";
import { ModelBadge } from "@/components/ui/ModelBadge";

export default function ForecastExplorerPage() {
  const { variable, lead, region, regime, setRegion } = useAppStore();
  const { data: forecast } = useForecastQuery({ variable, lead, regime });
  const { data: field } = useFieldQuery({ variable, lead, model: "samanvay" });

  const statesMapData = forecast?.states.map((st) => ({
    code: st.code,
    name: st.name,
    zone: st.zone,
    lat: st.lat,
    lon: st.lon,
    value: st.consensus.value,
    p10: st.consensus.p10,
    p90: st.consensus.p90,
    alert_level: st.alert_level,
    dominant_model: st.dominant_model
  })) || [];

  const selectedState = forecast?.states.find((s) => s.code === region) || forecast?.states[0];

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-text-1 tracking-tight">Forecast Explorer</h1>
          <p className="text-xs text-text-3">
            0.5° Spatially Gridded Consensus & 36 State Consensus Breakdown (+{lead}h / Day {lead / 24})
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Full Interactive Map */}
        <div className="lg:col-span-8 h-[600px]">
          <ForecastMap
            variable={variable}
            leadHours={lead}
            gridValues={field?.values}
            lats={field?.lats}
            lons={field?.lons}
            minValue={field?.min_value || 0}
            maxValue={field?.max_value || 140}
            statesData={statesMapData}
            selectedRegion={region}
            onSelectRegion={setRegion}
          />
        </div>

        {/* Selected Region Detailed Inspector Card */}
        <div className="lg:col-span-4 flex flex-col gap-4">
          {selectedState ? (
            <GlassCard className="p-5 flex flex-col gap-4">
              <div className="flex items-start justify-between border-b border-border/50 pb-3">
                <div>
                  <span className="text-[10px] font-mono text-cyan-400 font-bold tracking-wider">
                    {selectedState.zone.toUpperCase()}
                  </span>
                  <h3 className="text-lg font-bold text-text-1">{selectedState.name}</h3>
                  <p className="text-xs text-text-3">{selectedState.terrain}</p>
                </div>
                <AlertBadge level={selectedState.alert_level} />
              </div>

              {/* Consensus Point & Spread */}
              <div className="flex items-baseline justify-between bg-surface-2/60 p-3 rounded-xl border border-border/40">
                <div>
                  <span className="text-xs text-text-3">SAMANVAY Consensus</span>
                  <div className="text-3xl font-mono font-bold text-cyan-400 mt-0.5">
                    {selectedState.consensus.value}
                    <span className="text-xs text-text-3 ml-1">
                      {variable === "rainfall" ? "mm/24h" : "°C"}
                    </span>
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-[11px] text-text-3">Confidence Interval</span>
                  <div className="text-xs font-mono text-text-2 mt-0.5">
                    P10: {selectedState.consensus.p10} | P90: {selectedState.consensus.p90}
                  </div>
                </div>
              </div>

              {/* 7 Models Breakdown Table */}
              <div>
                <h4 className="text-xs font-semibold text-text-2 mb-2">Source Model Contributions</h4>
                <div className="flex flex-col gap-1.5 max-h-56 overflow-y-auto pr-1">
                  {Object.entries(selectedState.models).map(([modelId, val]) => (
                    <div
                      key={modelId}
                      className="p-2 rounded-lg bg-surface-2/40 border border-border/30 flex items-center justify-between text-xs"
                    >
                      <span className="font-mono text-text-2 uppercase text-[11px]">{modelId}</span>
                      <span className="font-mono font-bold text-text-1">
                        {val} {variable === "rainfall" ? "mm" : "°C"}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="text-[11px] text-text-3 border-t border-border/40 pt-2 flex justify-between">
                <span>Dominant Source:</span>
                <span className="font-mono text-cyan-400 uppercase font-semibold">
                  {selectedState.dominant_model}
                </span>
              </div>
            </GlassCard>
          ) : (
            <GlassCard className="p-8 text-center text-text-3">Select a region to inspect</GlassCard>
          )}
        </div>
      </div>
    </div>
  );
}
