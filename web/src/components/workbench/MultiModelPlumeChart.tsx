"use client";

import React, { useState } from "react";
import { GlassCard } from "@/components/ui/GlassCard";
import {
  ResponsiveContainer,
  ComposedChart,
  Area,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Legend
} from "recharts";
import { Download, Share2, FileSpreadsheet, Eye, EyeOff } from "lucide-react";
import { PlumeTimelinePoint } from "@/lib/types";
import { exportToCsv, exportElementAsPng, copyShareLink } from "@/lib/export";

interface MultiModelPlumeChartProps {
  timeline: PlumeTimelinePoint[];
  variable: string;
  regionName: string;
  regionCode: string;
  leadHours: number;
  weights: Record<string, number>;
  activeRegime: string;
}

const MODEL_CONFIGS = [
  { key: "ncum_g", name: "NCUM-G", color: "#06B6D4", type: "NWP" },
  { key: "neps", name: "NEPS", color: "#3B82F6", type: "Ensemble" },
  { key: "imd_gfs", name: "IMD-GFS", color: "#10B981", type: "NWP" },
  { key: "ecmwf_ifs", name: "ECMWF-IFS", color: "#6366F1", type: "NWP" },
  { key: "graphcast", name: "GraphCast", color: "#8B5CF6", type: "AI" },
  { key: "pangu", name: "Pangu-Weather", color: "#D946EF", type: "AI" },
  { key: "fourcastnet", name: "FourCastNet", color: "#EC4899", type: "AI" }
];

export function MultiModelPlumeChart({
  timeline,
  variable,
  regionName,
  regionCode,
  leadHours,
  weights,
  activeRegime
}: MultiModelPlumeChartProps) {
  const [visibleModels, setVisibleModels] = useState<Record<string, boolean>>({
    ncum_g: true,
    neps: true,
    imd_gfs: true,
    ecmwf_ifs: true,
    graphcast: true,
    pangu: true,
    fourcastnet: true,
    samanvay: true,
    truth: true,
    plume: true
  });

  const toggleModel = (key: string) => {
    setVisibleModels((prev) => ({ ...prev, [key]: !prev[key] }));
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

  // CSV Export Trigger
  const handleExportCsv = () => {
    const csvRows = timeline.map((p) => ({
      lead_day: p.lead_day,
      lead_hours: p.lead_hours,
      samanvay_consensus: p.samanvay,
      p10_uncertainty: p.p10,
      p90_uncertainty: p.p90,
      observed_truth: p.truth,
      ncum_g: p.ncum_g,
      neps: p.neps,
      imd_gfs: p.imd_gfs,
      ecmwf_ifs: p.ecmwf_ifs,
      graphcast: p.graphcast,
      pangu: p.pangu,
      fourcastnet: p.fourcastnet
    }));
    exportToCsv(`samanvay_${regionCode}_${variable}_plume.csv`, csvRows);
  };

  // PNG Export Trigger
  const handleExportPng = () => {
    exportElementAsPng("workbench-plume-chart-container", `samanvay_${regionCode}_${variable}_fan_chart.png`);
  };

  // Share Link Trigger
  const handleShareLink = () => {
    copyShareLink({
      region: regionCode,
      variable,
      lead: leadHours,
      regime: activeRegime
    });
  };

  // Custom Glass Hover Tooltip
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (!active || !payload || !payload.length) return null;

    const dataPoint = payload[0]?.payload as PlumeTimelinePoint;
    if (!dataPoint) return null;

    return (
      <div className="rounded-xl border border-cyan-500/30 bg-[#070B14]/95 backdrop-blur-md p-3.5 shadow-2xl min-w-[260px] text-xs">
        <div className="flex items-center justify-between pb-2 mb-2 border-b border-white/10">
          <div>
            <span className="font-bold text-text-1 text-sm">{dataPoint.label}</span>
            <span className="text-[10px] font-mono text-cyan-400 ml-2">(+{dataPoint.lead_hours}h)</span>
          </div>
          <span className="font-mono text-[11px] text-text-3">{unit}</span>
        </div>

        {/* SAMANVAY Consensus */}
        <div className="flex items-center justify-between py-1 px-1.5 rounded bg-cyan-950/40 border border-cyan-500/30 mb-2">
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-[#00F5FF] shadow-[0_0_8px_#00F5FF]" />
            <span className="font-bold text-cyan-300">SAMANVAY Blend</span>
          </div>
          <div className="text-right font-mono">
            <span className="font-bold text-cyan-300 text-sm">{dataPoint.samanvay}</span>
            <span className="text-[10px] text-text-3 block">
              [{dataPoint.p10} – {dataPoint.p90}]
            </span>
          </div>
        </div>

        {/* Ground Truth / Verified Observation */}
        <div className="flex items-center justify-between py-1 px-1.5 text-text-2 mb-2 border-b border-white/5 font-mono">
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-0.5 bg-amber-400 border border-dashed border-amber-400" />
            <span className="text-amber-300 font-medium">Ground Truth</span>
          </div>
          <span className="font-bold text-amber-300">{dataPoint.truth}</span>
        </div>

        {/* 7 Models List */}
        <div className="flex flex-col gap-1 font-mono text-[11px]">
          {MODEL_CONFIGS.map((m) => {
            const val = dataPoint[m.key];
            const weightVal = dataPoint.weights?.[m.key] ?? weights?.[m.key] ?? 0;
            const weightPct = (weightVal * 100).toFixed(1);
            return (
              <div key={m.key} className="flex items-center justify-between py-0.5 px-1 hover:bg-white/5 rounded">
                <div className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full" style={{ backgroundColor: m.color }} />
                  <span className="text-text-2">{m.name}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-text-3 text-[10px]">({weightPct}%)</span>
                  <span className="font-semibold text-text-1">{val ?? "—"}</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  return (
    <GlassCard className="p-5 flex flex-col gap-4 border-cyan-500/20">
      {/* Header and Action Toolbar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-border/50">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-lg font-bold text-text-1 tracking-tight">
              Multi-Model Plume & Uncertainty Fan
            </h2>
            <span className="text-xs font-mono px-2 py-0.5 rounded bg-cyan-950/60 border border-cyan-500/30 text-cyan-300 font-semibold">
              {regionName} ({regionCode})
            </span>
          </div>
          <p className="text-xs text-text-3">
            7-model forecast divergence, SAMANVAY optimal consensus, P10–P90 dispersion plume & ground truth
          </p>
        </div>

        {/* Export Buttons */}
        <div className="flex items-center gap-2">
          <button
            onClick={handleExportCsv}
            title="Export Plume Dataset as RFC 4180 CSV"
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium bg-surface-2 hover:bg-surface-3 border border-border/60 text-text-2 hover:text-text-1 transition-all"
          >
            <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-400" />
            <span>CSV</span>
          </button>
          <button
            onClick={handleExportPng}
            title="Export High-Resolution PNG Chart"
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium bg-surface-2 hover:bg-surface-3 border border-border/60 text-text-2 hover:text-text-1 transition-all"
          >
            <Download className="w-3.5 h-3.5 text-cyan-400" />
            <span>PNG</span>
          </button>
          <button
            onClick={handleShareLink}
            title="Copy Shareable Operational Link"
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium bg-cyan-500/20 hover:bg-cyan-500/30 border border-cyan-400/40 text-cyan-300 transition-all"
          >
            <Share2 className="w-3.5 h-3.5" />
            <span>Share</span>
          </button>
        </div>
      </div>

      {/* Interactive Chart Container */}
      <div id="workbench-plume-chart-container" className="w-full h-[400px] relative">
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart data={timeline} margin={{ top: 10, right: 20, left: 0, bottom: 20 }}>
            <defs>
              <linearGradient id="plumeGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#00F5FF" stopOpacity={0.25} />
                <stop offset="100%" stopColor="#00F5FF" stopOpacity={0.03} />
              </linearGradient>
            </defs>

            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />

            <XAxis
              dataKey="label"
              stroke="#64748B"
              fontSize={11}
              tickLine={false}
              axisLine={{ stroke: "rgba(255,255,255,0.1)" }}
            />

            <YAxis
              stroke="#64748B"
              fontSize={11}
              tickLine={false}
              axisLine={{ stroke: "rgba(255,255,255,0.1)" }}
              unit={` ${unit}`}
            />

            <Tooltip content={<CustomTooltip />} />

            {/* Shaded P10-P90 Plume */}
            {visibleModels.plume && (
              <Area
                type="monotone"
                dataKey="p90"
                stroke="none"
                fill="url(#plumeGradient)"
                name="P10–P90 Plume"
              />
            )}

            {/* 7 Models Lines */}
            {MODEL_CONFIGS.map((m) =>
              visibleModels[m.key] ? (
                <Line
                  key={m.key}
                  type="monotone"
                  dataKey={m.key}
                  stroke={m.color}
                  strokeWidth={1.5}
                  strokeOpacity={0.7}
                  dot={{ r: 2.5, fill: m.color, strokeWidth: 0 }}
                  activeDot={{ r: 5, stroke: "#fff", strokeWidth: 1.5 }}
                  name={m.name}
                />
              ) : null
            )}

            {/* Ground Truth Observation Overlay */}
            {visibleModels.truth && (
              <Line
                type="monotone"
                dataKey="truth"
                stroke="#F59E0B"
                strokeWidth={2}
                strokeDasharray="4 4"
                dot={{ r: 3, fill: "#F59E0B" }}
                name="Verified Observation"
              />
            )}

            {/* SAMANVAY Consensus Line */}
            {visibleModels.samanvay && (
              <Line
                type="monotone"
                dataKey="samanvay"
                stroke="#00F5FF"
                strokeWidth={3.5}
                dot={{ r: 4, fill: "#00F5FF", stroke: "#070B14", strokeWidth: 2 }}
                activeDot={{ r: 7, fill: "#00F5FF", stroke: "#fff", strokeWidth: 2 }}
                name="SAMANVAY Blend"
              />
            )}
          </ComposedChart>
        </ResponsiveContainer>
      </div>

      {/* Model Toggle Chips Strip */}
      <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-border/40 text-xs">
        <span className="text-text-3 text-[11px] font-mono mr-1">Layer Visibility:</span>

        {/* SAMANVAY Toggle */}
        <button
          onClick={() => toggleModel("samanvay")}
          className={`flex items-center gap-1.5 px-2 py-1 rounded text-[11px] font-semibold transition-all ${
            visibleModels.samanvay
              ? "bg-cyan-500/20 text-cyan-300 border border-cyan-400/40"
              : "bg-surface-2 text-text-3 opacity-50 border border-transparent"
          }`}
        >
          <span className="w-2 h-2 rounded-full bg-[#00F5FF] shadow-[0_0_6px_#00F5FF]" />
          <span>SAMANVAY</span>
          {visibleModels.samanvay ? <Eye className="w-3 h-3 ml-0.5" /> : <EyeOff className="w-3 h-3 ml-0.5" />}
        </button>

        {/* Uncertainty Plume Toggle */}
        <button
          onClick={() => toggleModel("plume")}
          className={`flex items-center gap-1.5 px-2 py-1 rounded text-[11px] font-semibold transition-all ${
            visibleModels.plume
              ? "bg-cyan-500/15 text-cyan-400 border border-cyan-500/30"
              : "bg-surface-2 text-text-3 opacity-50 border border-transparent"
          }`}
        >
          <span className="w-2 h-2 rounded-sm bg-cyan-400/40 border border-cyan-400" />
          <span>P10–P90 Plume</span>
        </button>

        {/* Observation Truth Toggle */}
        <button
          onClick={() => toggleModel("truth")}
          className={`flex items-center gap-1.5 px-2 py-1 rounded text-[11px] font-semibold transition-all ${
            visibleModels.truth
              ? "bg-amber-500/20 text-amber-300 border border-amber-400/40"
              : "bg-surface-2 text-text-3 opacity-50 border border-transparent"
          }`}
        >
          <span className="w-2 h-2 rounded-full bg-amber-400" />
          <span>Observation</span>
        </button>

        {/* 7 Models Toggles */}
        {MODEL_CONFIGS.map((m) => {
          const isVis = visibleModels[m.key];
          return (
            <button
              key={m.key}
              onClick={() => toggleModel(m.key)}
              className={`flex items-center gap-1.5 px-2 py-1 rounded text-[11px] transition-all ${
                isVis
                  ? "bg-surface-2 text-text-1 border border-border"
                  : "bg-surface-1 text-text-3 opacity-40 border border-transparent"
              }`}
            >
              <span className="w-2 h-2 rounded-full" style={{ backgroundColor: m.color }} />
              <span>{m.name}</span>
            </button>
          );
        })}
      </div>
    </GlassCard>
  );
}
