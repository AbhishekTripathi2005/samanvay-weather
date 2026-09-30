"use client";
/**
 * /impact — Step 11: Downstream Disaster Management Layer
 * Shimla, Himachal Pradesh pilot.
 *
 * Layout (desktop — limitations card visible without scrolling):
 *   Row 1: Pipeline visual (full width)
 *   Row 2: Prior study metrics + Honest Limitations  [top half of viewport]
 *   Row 3: Scenario slider + KPI cards
 *   Row 4: Water balance chart (10-day)
 *   Row 5: Landslide DEM map + Critical infrastructure
 */
import React, { useState, useCallback, useTransition } from "react";
import { Sliders, Mountain, Droplets, AlertOctagon, ShieldCheck } from "lucide-react";
import { useShimlaImpactQuery, useWaterBalanceQuery, useLandslideDemQuery } from "@/lib/queries";
import { GlassCard } from "@/components/ui/GlassCard";
import { AlertBadge } from "@/components/ui/AlertBadge";
import { PipelineVisual }    from "@/components/impact/PipelineVisual";
import { WaterBalanceChart } from "@/components/impact/WaterBalanceChart";
import { LandslideMap }      from "@/components/impact/LandslideMap";
import { PriorStudyPanel }   from "@/components/impact/PriorStudyPanel";
import type { FloodRisk }    from "@/lib/types";

const FLOOD_RISK_BADGE: Record<FloodRisk, "GREEN" | "YELLOW" | "ORANGE" | "RED"> = {
  LOW:      "GREEN",
  MODERATE: "YELLOW",
  HIGH:     "ORANGE",
  CRITICAL: "RED",
};

const BASE_RAIN  = 92.4;
const BASE_API30 = 148.0;

export default function ImpactPage() {
  const [scenarioPct, setScenarioPct] = useState(0);
  const [, startTransition] = useTransition();

  const handleScenario = useCallback((v: number) => {
    startTransition(() => setScenarioPct(v));
  }, []);

  // Shimla impact (existing endpoint)
  const { data: shimla } = useShimlaImpactQuery({
    forecast_rain: BASE_RAIN * (1 + scenarioPct / 100),
    api_30: BASE_API30,
  });

  // New Step 11 queries
  const { data: wb, isLoading: wbLoading } = useWaterBalanceQuery({
    forecast_rain: BASE_RAIN,
    api_30: BASE_API30,
    scenario_pct: scenarioPct,
  });

  const { data: dem, isLoading: demLoading } = useLandslideDemQuery();

  const peakRisk: FloodRisk = wb?.days?.[0]?.flood_risk ?? "MODERATE";
  const effectiveRain = wb?.effective_rainfall_day1 ?? BASE_RAIN;

  return (
    <div className="flex flex-col gap-5">
      {/* Page header */}
      <div>
        <h1 className="text-2xl font-bold text-text-1 tracking-tight">
          Mountain Hydrological &amp; Geotechnical Impact
        </h1>
        <p className="text-xs text-text-3 mt-1">
          PINN-Lite Water Balance · 30-Day API Saturation · Landslide Susceptibility ·
          Shimla District Pilot — Himachal Pradesh
        </p>
      </div>

      {/* Row 1: Pipeline visual */}
      <PipelineVisual />

      {/* Row 2: Prior study + Limitations (visible without scroll on desktop) */}
      <PriorStudyPanel />

      {/* Row 3: Scenario slider + KPI cards */}
      <GlassCard className="p-4 flex flex-col gap-4">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <div>
            <h3 className="text-sm font-semibold text-text-1 flex items-center gap-1.5">
              <Sliders className="h-4 w-4 text-cyan-400" />
              Rainfall Scenario Adjustment
            </h3>
            <p className="text-[11px] text-text-3">
              Shift ±50% from the blended forecast to explore runoff and flood-risk sensitivity
            </p>
          </div>
          <div className="flex items-center gap-3">
            <span className={`text-lg font-mono font-bold ${
              scenarioPct > 0 ? "text-red-400" : scenarioPct < 0 ? "text-emerald-400" : "text-text-2"
            }`}>
              {scenarioPct >= 0 ? "+" : ""}{scenarioPct}%
            </span>
            <span className="text-[11px] text-text-3">
              → {effectiveRain.toFixed(1)} mm effective D1 rain
            </span>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <span className="text-[10px] text-emerald-400 font-mono w-10 text-right">−50%</span>
          <input
            type="range"
            min={-50} max={100} step={5}
            value={scenarioPct}
            onChange={(e) => handleScenario(Number(e.target.value))}
            className="flex-1 accent-cyan-400 cursor-pointer"
            aria-label={`Rainfall scenario slider, currently ${scenarioPct}%`}
          />
          <span className="text-[10px] text-red-400 font-mono w-10">+100%</span>
          <button
            onClick={() => handleScenario(0)}
            className="px-2 py-1 text-[10px] rounded border border-border text-text-3 hover:border-cyan-500/50 hover:text-text-1 transition-colors"
          >
            Reset
          </button>
        </div>

        {/* Scenario presets */}
        <div className="flex gap-1.5 flex-wrap">
          {[
            { label: "−30% (Dry)", val: -30, cls: "text-emerald-400 border-emerald-500/40 bg-emerald-500/10" },
            { label: "Baseline",   val: 0,   cls: "text-text-2   border-border/60         bg-surface-2/40" },
            { label: "+25% (Wet)", val: 25,  cls: "text-amber-400 border-amber-500/40 bg-amber-500/10" },
            { label: "+50% (Extreme)", val: 50, cls: "text-orange-400 border-orange-500/40 bg-orange-500/10" },
            { label: "+100% (2× rain)", val: 100, cls: "text-red-400 border-red-500/40 bg-red-500/10" },
          ].map((p) => (
            <button
              key={p.val}
              onClick={() => handleScenario(p.val)}
              aria-pressed={scenarioPct === p.val}
              className={`text-[10px] font-semibold px-2 py-1 rounded border transition-all ${p.cls} ${
                scenarioPct === p.val ? "ring-1 ring-cyan-500/50" : ""
              }`}
            >
              {p.label}
            </button>
          ))}
        </div>
      </GlassCard>

      {/* KPI cards row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <GlassCard className="p-4 flex flex-col gap-1">
          <div className="flex items-center justify-between">
            <span className="text-xs text-text-3">Factor of Safety (FS)</span>
            <AlertOctagon className="w-4 h-4 text-rose-400" />
          </div>
          <div className="text-3xl font-mono font-bold text-rose-400 mt-1">
            {shimla?.geotechnical.factor_of_safety.toFixed(2) ?? "1.18"}
          </div>
          <AlertBadge level={
            (shimla?.geotechnical.factor_of_safety ?? 1.18) < 1.0   ? "RED"    :
            (shimla?.geotechnical.factor_of_safety ?? 1.18) < 1.25  ? "ORANGE" :
            (shimla?.geotechnical.factor_of_safety ?? 1.18) < 1.50  ? "YELLOW" : "GREEN"
          } />
        </GlassCard>

        <GlassCard className="p-4 flex flex-col gap-1">
          <div className="flex items-center justify-between">
            <span className="text-xs text-text-3">Antecedent Rain (API-30)</span>
            <Droplets className="w-4 h-4 text-cyan-400" />
          </div>
          <div className="text-3xl font-mono font-bold text-cyan-400 mt-1">
            {shimla?.input_conditions.antecedent_precipitation_30d_mm ?? BASE_API30}
            <span className="text-xs text-text-3 ml-1">mm</span>
          </div>
          <span className="text-[11px] text-text-2">
            Soil sat: {shimla?.input_conditions.soil_saturation_prior_pct ?? 82}%
          </span>
        </GlassCard>

        <GlassCard className="p-4 flex flex-col gap-1">
          <div className="flex items-center justify-between">
            <span className="text-xs text-text-3">Surface Runoff (D1)</span>
            <Mountain className="w-4 h-4 text-blue-400" />
          </div>
          <div className="text-3xl font-mono font-bold text-blue-400 mt-1">
            {shimla?.hydrology.surface_runoff_mm ?? 45.2}
            <span className="text-xs text-text-3 ml-1">mm</span>
          </div>
          <span className="text-[11px] text-text-2">Saturation-excess runoff</span>
        </GlassCard>

        <GlassCard className="p-4 flex flex-col gap-1">
          <div className="flex items-center justify-between">
            <span className="text-xs text-text-3">10-Day Peak Risk</span>
            <ShieldCheck className="w-4 h-4 text-amber-400" />
          </div>
          <div className="text-3xl font-mono font-bold mt-1" style={{
            color: peakRisk === "CRITICAL" ? "#ef4444" : peakRisk === "HIGH" ? "#f97316" : peakRisk === "MODERATE" ? "#f59e0b" : "#10b981"
          }}>
            {wb?.peak_soil_moisture_mm ?? "…"}
            <span className="text-xs text-text-3 ml-1">mm</span>
          </div>
          <AlertBadge level={FLOOD_RISK_BADGE[peakRisk]} />
        </GlassCard>
      </div>

      {/* Row 4: Water balance chart */}
      <WaterBalanceChart data={wb ?? null} isLoading={wbLoading} />

      {/* Row 5: Landslide map */}
      <LandslideMap data={dem ?? null} isLoading={demLoading} />

      {/* Critical infrastructure (from existing Shimla data) */}
      {shimla?.critical_infrastructure_risk && (
        <GlassCard className="p-5 flex flex-col gap-3">
          <h3 className="text-sm font-semibold text-text-1">Critical Infrastructure Surveillance — Shimla Valley</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {shimla.critical_infrastructure_risk.map((asset, i) => (
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
      )}
    </div>
  );
}
