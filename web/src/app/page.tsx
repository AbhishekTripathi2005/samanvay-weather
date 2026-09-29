"use client";

import React from "react";
import { useAppStore } from "@/lib/store";
import { useKpisQuery, useForecastQuery, useFieldQuery, useExtremesQuery } from "@/lib/queries";
import { GlassCard } from "@/components/ui/GlassCard";
import { MetricCard } from "@/components/ui/MetricCard";
import { AlertBadge } from "@/components/ui/AlertBadge";
import { ForecastMap } from "@/components/map/ForecastMap";
import { LineFan } from "@/components/charts/LineFan";
import { AlertTriangle, TrendingUp, ShieldCheck, Activity, ArrowUpRight } from "lucide-react";
import Link from "next/link";

export default function CommandCenterPage() {
  const { variable, lead, region, regime, setRegion } = useAppStore();
  const { data: kpis } = useKpisQuery();
  const { data: forecast } = useForecastQuery({ variable, lead, regime });
  const { data: field } = useFieldQuery({ variable, lead, model: "samanvay" });
  const { data: extremes } = useExtremesQuery();

  const mockPlume = [
    { lead: 24, label: "Day 1", consensus: 32.5, p10: 24.0, p90: 44.0 },
    { lead: 48, label: "Day 2", consensus: 48.0, p10: 36.5, p90: 64.0 },
    { lead: 72, label: "Day 3", consensus: 62.4, p10: 48.0, p90: 86.0 },
    { lead: 96, label: "Day 4", consensus: 54.0, p10: 38.0, p90: 78.0 },
    { lead: 120, label: "Day 5", consensus: 42.0, p10: 28.0, p90: 68.0 },
    { lead: 144, label: "Day 6", consensus: 38.0, p10: 22.0, p90: 65.0 },
    { lead: 168, label: "Day 7", consensus: 35.0, p10: 18.0, p90: 64.0 },
    { lead: 192, label: "Day 8", consensus: 31.0, p10: 14.0, p90: 62.0 },
    { lead: 216, label: "Day 9", consensus: 28.0, p10: 12.0, p90: 60.0 },
    { lead: 240, label: "Day 10", consensus: 25.0, p10: 10.0, p90: 58.0 }
  ];

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

  return (
    <div className="flex flex-col gap-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="w-2.5 h-2.5 rounded-full bg-cyan-400 animate-pulse shadow-[0_0_8px_#00F5FF]" />
            <span className="text-xs font-mono font-semibold text-cyan-400 uppercase tracking-wider">
              Live Operational Watch
            </span>
          </div>
          <h1 className="text-2xl font-bold text-text-1 tracking-tight">
            National Meteorological Command Center
          </h1>
          <p className="text-xs text-text-3">
            MoES / NCMRWF Adaptive AI-NWP Consensus • Active Regime:{" "}
            <span className="text-text-1 font-semibold">{kpis?.active_regime || "Active monsoon"}</span>
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Link
            href="/forecast"
            className="px-3.5 py-1.5 rounded-xl bg-surface-2 hover:bg-surface-3 border border-border text-xs font-medium text-text-1 transition-colors flex items-center gap-1.5"
          >
            <span>Explore Map</span>
            <ArrowUpRight className="w-3.5 h-3.5 text-cyan-400" />
          </Link>
          <Link
            href="/extremes"
            className="px-3.5 py-1.5 rounded-xl bg-rose-500/15 border border-rose-500/40 text-xs font-semibold text-rose-300 hover:bg-rose-500/25 transition-colors flex items-center gap-1.5"
          >
            <AlertTriangle className="w-3.5 h-3.5 text-rose-400" />
            <span>{extremes?.total_active_alerts || 0} Alerts Active</span>
          </Link>
        </div>
      </div>

      {/* KPI Cards Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard
          label="Severe Alert States"
          value={kpis?.national_alert_counts.red || 3}
          delta={{ value: "+2 from 00Z", isPositive: false }}
          sparklineData={[1, 1, 2, 2, 3, 3]}
          tooltip="States currently under RED or ORANGE emergency warnings"
        />
        <MetricCard
          label="Population at Risk"
          value={kpis?.population_at_risk_millions || 142.5}
          unit="M"
          delta={{ value: "14.2% of national pop", isPositive: true }}
          sparklineData={[90, 110, 125, 138, 142.5]}
          tooltip="Total population residing in active warning zones"
        />
        <MetricCard
          label="24h Blend Skill Gain"
          value={kpis?.blend_skill_score_24h.value_pct || 19.8}
          unit="%"
          delta={{ value: "vs best single NWP/AI", isPositive: true }}
          sparklineData={[12, 14, 16, 18, 19.8]}
          tooltip="RMSE reduction achieved by SAMANVAY over best single model"
        />
        <MetricCard
          label="Ingestion DAGs"
          value={7}
          unit="/ 7"
          delta={{ value: "All Sources Synced", isPositive: true }}
          sparklineData={[7, 7, 7, 7, 7]}
          tooltip="Real-time status of NCUM, NEPS, GFS, ECMWF, GraphCast, Pangu, FourCastNet"
        />
      </div>

      {/* Main Grid: Interactive Map + Trajectory & Alerts */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Forecast Map (7 cols) */}
        <div className="lg:col-span-7 h-[560px]">
          <ForecastMap
            variable={variable}
            leadHours={lead}
            gridValues={field?.values}
            lats={field?.lats}
            lons={field?.lons}
            minValue={field?.min_value || 0}
            maxValue={field?.max_value || 120}
            statesData={statesMapData}
            selectedRegion={region}
            onSelectRegion={setRegion}
          />
        </div>

        {/* Right Column: Predictive Plume + Active Extremes (5 cols) */}
        <div className="lg:col-span-5 flex flex-col gap-5">
          <LineFan
            data={mockPlume}
            variable={variable}
            unit={variable === "rainfall" ? "mm" : "°C"}
          />

          {/* Quick Extreme Advisories Box */}
          <GlassCard className="p-4 flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-semibold text-text-1">Critical Disaster Bulletins</h3>
                <p className="text-xs text-text-3">High risk multi-hazard alerts requiring SOP response</p>
              </div>
              <Link href="/extremes" className="text-xs text-cyan-400 hover:underline">
                View all
              </Link>
            </div>

            <div className="flex flex-col gap-2 overflow-y-auto max-h-56 pr-1">
              {(extremes?.alerts || []).slice(0, 3).map((a) => (
                <div
                  key={a.id}
                  className="p-2.5 rounded-xl bg-surface-2/70 border border-border/60 flex items-center justify-between text-xs"
                >
                  <div className="flex flex-col">
                    <span className="font-semibold text-text-1">
                      {a.district}, {a.state}
                    </span>
                    <span className="text-[11px] text-text-3">
                      {a.forecast_value} mm (p={Math.round(a.p_extreme * 100)}%)
                    </span>
                  </div>
                  <AlertBadge level={a.alert_level} />
                </div>
              ))}
            </div>
          </GlassCard>
        </div>
      </div>
    </div>
  );
}
