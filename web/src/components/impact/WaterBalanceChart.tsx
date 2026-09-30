"use client";
/**
 * WaterBalanceChart — 10-day dS/dt = P - R - ET chart with flood threshold line.
 * Mass conservation guarantee: R = ET = 0 on dry days (P = 0).
 */
import React from "react";
import {
  ComposedChart, Bar, Line, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, ReferenceLine, Legend, Area
} from "recharts";
import { GlassCard } from "@/components/ui/GlassCard";
import { CheckCircle2, AlertTriangle } from "lucide-react";
import type { WaterBalanceResponse, FloodRisk } from "@/lib/types";

const RISK_COLOR: Record<FloodRisk, string> = {
  LOW:      "#10b981",
  MODERATE: "#f59e0b",
  HIGH:     "#f97316",
  CRITICAL: "#ef4444",
};

const RISK_BG: Record<FloodRisk, string> = {
  LOW:      "bg-emerald-500/15 border-emerald-500/40 text-emerald-400",
  MODERATE: "bg-amber-500/15  border-amber-500/40  text-amber-400",
  HIGH:     "bg-orange-500/15 border-orange-500/40 text-orange-400",
  CRITICAL: "bg-red-500/15    border-red-500/40    text-red-400",
};

interface Props {
  data: WaterBalanceResponse | null;
  isLoading: boolean;
}

export function WaterBalanceChart({ data, isLoading }: Props) {
  if (isLoading) {
    return (
      <GlassCard className="p-4 h-72 flex items-center justify-center text-text-3 text-xs animate-pulse">
        Running water balance model…
      </GlassCard>
    );
  }
  if (!data) return null;

  const chartData = data.days.map((d) => ({
    day: d.date_label,
    "Rainfall (mm)": d.rainfall_mm,
    "Runoff (mm)": d.runoff_mm,
    "ET (mm)": d.et_mm,
    "Soil Moisture (mm)": d.soil_moisture_mm,
    risk: d.flood_risk,
    mass_ok: d.mass_conserved,
    raw: d,
  }));

  const CustomTooltip = ({ active, payload, label }: Record<string, unknown>) => {
    if (!active || !(payload as unknown[])?.length) return null;
    const d = (payload as { payload: typeof chartData[0] }[])[0]?.payload?.raw;
    if (!d) return null;
    const riskBg = RISK_BG[d.flood_risk];
    return (
      <div className="bg-surface-1 border border-border rounded-xl p-3 text-[11px] shadow-xl min-w-[180px]">
        <div className="font-semibold text-text-1 mb-2">{label as string} · Day {d.day}</div>
        <div className="flex flex-col gap-1">
          <div className="flex justify-between gap-4"><span className="text-sky-400">Rainfall</span><span className="font-mono">{d.rainfall_mm} mm</span></div>
          <div className="flex justify-between gap-4"><span className="text-blue-400">Soil Moisture</span><span className="font-mono">{d.soil_moisture_mm} mm ({d.soil_moisture_pct}%)</span></div>
          <div className="flex justify-between gap-4"><span className="text-amber-400">Runoff</span><span className="font-mono">{d.runoff_mm} mm</span></div>
          <div className="flex justify-between gap-4"><span className="text-emerald-400">ET</span><span className="font-mono">{d.et_mm} mm</span></div>
          <div className="flex justify-between gap-4"><span className="text-text-3">ΔS</span><span className="font-mono">{d.delta_S >= 0 ? "+" : ""}{d.delta_S} mm</span></div>
          <div className={`mt-1 px-2 py-0.5 rounded border font-bold text-center text-[10px] ${riskBg}`}>{d.flood_risk}</div>
          {d.rainfall_mm <= 0 && (
            <div className="flex items-center gap-1 text-emerald-400 text-[10px] mt-1">
              <CheckCircle2 className="h-3 w-3" />
              R = ET = 0 (mass conserved, dry day)
            </div>
          )}
        </div>
      </div>
    );
  };

  return (
    <GlassCard className="p-4 flex flex-col gap-3">
      <div className="flex items-start justify-between flex-wrap gap-2">
        <div>
          <h3 className="text-sm font-semibold text-text-1">
            Water Balance — dS/dt = P − R − ET
          </h3>
          <p className="text-[11px] text-text-3 mt-0.5">
            Shimla sub-catchment · S<sub>max</sub> = {data.s_max_mm} mm · 10-day outlook
          </p>
        </div>

        {/* Mass conservation badge */}
        <div className={`flex items-center gap-1.5 px-2 py-1 rounded-lg border text-[10px] font-semibold ${
          data.mass_conservation_check
            ? "bg-emerald-500/15 border-emerald-500/40 text-emerald-400"
            : "bg-red-500/15 border-red-500/40 text-red-400"
        }`}>
          {data.mass_conservation_check
            ? <><CheckCircle2 className="h-3 w-3" /> Mass conserved (R=ET=0 on dry days)</>
            : <><AlertTriangle className="h-3 w-3" /> Mass conservation violation</>
          }
        </div>
      </div>

      {/* Peak stats row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
        {[
          { label: "Initial S", val: `${data.initial_soil_moisture_mm} mm`, sub: `(${data.initial_soil_moisture_pct}%)`, color: "text-blue-400" },
          { label: "Peak S", val: `${data.peak_soil_moisture_mm} mm`, sub: `vs threshold ${data.flood_threshold_80p_mm} mm`, color: "text-amber-400" },
          { label: "Peak Runoff", val: `${data.peak_runoff_mm} mm`, sub: "Day 1 event", color: "text-orange-400" },
          { label: "Day 1 Rainfall", val: `${data.effective_rainfall_day1} mm`, sub: `scenario ${data.scenario_pct >= 0 ? "+" : ""}${data.scenario_pct}%`, color: "text-sky-400" },
        ].map((s) => (
          <div key={s.label} className="bg-surface-2/40 rounded-lg p-2 border border-border/40">
            <div className="text-[10px] text-text-3">{s.label}</div>
            <div className={`text-base font-mono font-bold ${s.color}`}>{s.val}</div>
            <div className="text-[9px] text-text-3">{s.sub}</div>
          </div>
        ))}
      </div>

      {/* Main chart */}
      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart data={chartData} margin={{ top: 4, right: 12, bottom: 8, left: -10 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(148,163,184,0.08)" />
            <XAxis dataKey="day" tick={{ fontSize: 10, fill: "#64748b" }} />
            <YAxis yAxisId="left" tick={{ fontSize: 10, fill: "#64748b" }} label={{ value: "mm", angle: -90, position: "insideLeft", offset: 12, fontSize: 9, fill: "#64748b" }} />
            <YAxis yAxisId="right" orientation="right" tick={{ fontSize: 10, fill: "#64748b" }} domain={[0, data.s_max_mm]} label={{ value: "S (mm)", angle: 90, position: "insideRight", offset: -4, fontSize: 9, fill: "#64748b" }} />
            <Tooltip content={<CustomTooltip />} />
            <Legend wrapperStyle={{ fontSize: 10 }} />

            {/* 80th-percentile flood threshold */}
            <ReferenceLine yAxisId="right" y={data.flood_threshold_80p_mm} stroke="#ef4444" strokeDasharray="5 3" strokeWidth={1.5} label={{ value: `Flood threshold ${data.flood_threshold_80p_mm}mm (P80)`, position: "insideTopRight", fontSize: 9, fill: "#ef4444" }} />

            {/* Rainfall bars */}
            <Bar yAxisId="left" dataKey="Rainfall (mm)" fill="#38bdf8" opacity={0.7} radius={[2, 2, 0, 0]} maxBarSize={24} />
            {/* Runoff */}
            <Bar yAxisId="left" dataKey="Runoff (mm)" fill="#f97316" opacity={0.8} radius={[2, 2, 0, 0]} maxBarSize={24} />
            {/* ET */}
            <Bar yAxisId="left" dataKey="ET (mm)" fill="#34d399" opacity={0.7} radius={[2, 2, 0, 0]} maxBarSize={24} />
            {/* Soil moisture line */}
            <Area yAxisId="right" type="monotone" dataKey="Soil Moisture (mm)" stroke="#a78bfa" fill="rgba(167,139,250,0.1)" strokeWidth={2.5} dot={{ r: 3, fill: "#a78bfa" }} animationDuration={600} />
          </ComposedChart>
        </ResponsiveContainer>
      </div>

      {/* Per-day flood risk strip */}
      <div className="flex gap-1 flex-wrap">
        {data.days.map((d) => (
          <div
            key={d.day}
            className="flex flex-col items-center px-1.5 py-1 rounded border text-center min-w-[44px]"
            style={{ borderColor: RISK_COLOR[d.flood_risk] + "60", backgroundColor: RISK_COLOR[d.flood_risk] + "20" }}
            aria-label={`Day ${d.day}: ${d.flood_risk} flood risk, S=${d.soil_moisture_mm}mm`}
          >
            <span className="text-[8px] text-text-3">{d.date_label}</span>
            <span className="text-[10px] font-bold font-mono" style={{ color: RISK_COLOR[d.flood_risk] }}>
              {d.soil_moisture_mm}
            </span>
            <span className="text-[8px] font-bold" style={{ color: RISK_COLOR[d.flood_risk] }}>
              {d.flood_risk[0]}
            </span>
          </div>
        ))}
      </div>
    </GlassCard>
  );
}
