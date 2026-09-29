"use client";

import React from "react";
import { useShimlaImpactQuery } from "@/lib/queries";
import { GlassCard } from "@/components/ui/GlassCard";
import { AlertBadge } from "@/components/ui/AlertBadge";
import { Mountain, Droplets, AlertOctagon, ShieldCheck } from "lucide-react";

export default function MountainImpactPage() {
  const { data: shimla } = useShimlaImpactQuery({ forecast_rain: 92.4, api_30: 148.0 });

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-bold text-text-1 tracking-tight">Mountain Hydrological & Geotechnical Impact</h1>
        <p className="text-xs text-text-3">
          PINN-Lite Water Balance, 30-Day API Saturation, and Landslide Factor of Safety (Shimla District Pilot)
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <GlassCard className="p-4 flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs text-text-3">Factor of Safety (FS)</span>
            <AlertOctagon className="w-4 h-4 text-rose-400" />
          </div>
          <div className="text-3xl font-mono font-bold text-rose-400 mt-2">
            {shimla?.geotechnical.factor_of_safety.toFixed(2) || "1.18"}
          </div>
          <span className="text-[11px] text-rose-300 font-semibold mt-1">
            Status: {shimla?.geotechnical.landslide_risk || "HIGH ALERT"}
          </span>
        </GlassCard>

        <GlassCard className="p-4 flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs text-text-3">Antecedent Rain (API-30)</span>
            <Droplets className="w-4 h-4 text-cyan-400" />
          </div>
          <div className="text-3xl font-mono font-bold text-cyan-400 mt-2">
            {shimla?.input_conditions.antecedent_precipitation_30d_mm || 148.0}
            <span className="text-xs text-text-3 ml-1">mm</span>
          </div>
          <span className="text-[11px] text-text-2 mt-1">
            Soil Saturation: {shimla?.input_conditions.soil_saturation_prior_pct || 82}%
          </span>
        </GlassCard>

        <GlassCard className="p-4 flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs text-text-3">Surface Runoff</span>
            <Mountain className="w-4 h-4 text-blue-400" />
          </div>
          <div className="text-3xl font-mono font-bold text-blue-400 mt-2">
            {shimla?.hydrology.surface_runoff_mm || 45.2}
            <span className="text-xs text-text-3 ml-1">mm</span>
          </div>
          <span className="text-[11px] text-text-2 mt-1">Saturation-excess runoff</span>
        </GlassCard>

        <GlassCard className="p-4 flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs text-text-3">Flash Flood Index</span>
            <ShieldCheck className="w-4 h-4 text-amber-400" />
          </div>
          <div className="text-3xl font-mono font-bold text-amber-400 mt-2">
            {shimla?.hydrology.flash_flood_risk_index || 72.0}
            <span className="text-xs text-text-3 ml-1">/ 100</span>
          </div>
          <span className="text-[11px] text-amber-300 font-semibold mt-1">
            Alert: {shimla?.hydrology.flash_flood_alert || "ORANGE"}
          </span>
        </GlassCard>
      </div>

      {/* Critical Infrastructure Table */}
      <GlassCard className="p-5 flex flex-col gap-3">
        <h3 className="text-sm font-semibold text-text-1">Critical Infrastructure Surveillance (Shimla Valley)</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-1">
          {(shimla?.critical_infrastructure_risk || []).map((asset, i) => (
            <div key={i} className="p-3 rounded-xl bg-surface-2 border border-border/50 flex flex-col gap-1">
              <div className="flex items-center justify-between">
                <span className="font-semibold text-xs text-text-1">{asset.asset}</span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-rose-500/20 text-rose-300 border border-rose-500/40">
                  {asset.status}
                </span>
              </div>
              <span className="text-[11px] text-text-3">{asset.threat}</span>
            </div>
          ))}
        </div>
      </GlassCard>
    </div>
  );
}
