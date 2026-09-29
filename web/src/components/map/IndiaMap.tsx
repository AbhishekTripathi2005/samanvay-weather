"use client";

import React, { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { fetchMapGrid, fetchExtremesBulletin } from "@/lib/api";
import { useOpsStore } from "@/lib/store";
import { formatNumber, getAlertBadgeClass } from "@/lib/utils";
import { StateRisk } from "@/lib/types";
import { AlertTriangle, AlertOctagon, CheckCircle2, Info, Compass, ShieldAlert } from "lucide-react";

export function IndiaMap() {
  const { variable, lead, regime, season, selectedRegion, selectedSource, setSelectedRegion } = useOpsStore();
  const [hoveredState, setHoveredState] = useState<StateRisk | null>(null);

  const { data: gridData, isLoading: gridLoading } = useQuery({
    queryKey: ["mapGrid", variable, lead, regime, season, selectedSource],
    queryFn: () => fetchMapGrid(variable, lead, regime, season, selectedSource),
    staleTime: 30000
  });

  const { data: bulletin } = useQuery({
    queryKey: ["bulletin", lead, regime, season],
    queryFn: () => fetchExtremesBulletin(lead, regime, season),
    staleTime: 30000
  });

  // Map geographic projection (Lat 6-38N, Lon 68-98E) into SVG viewport (width=700, height=750)
  const project = (lat: number, lon: number): [number, number] => {
    const minLat = 6.0, maxLat = 38.0;
    const minLon = 68.0, maxLon = 98.0;
    const x = ((lon - minLon) / (maxLon - minLon)) * 620 + 40;
    const y = ((maxLat - lat) / (maxLat - minLat)) * 680 + 35;
    return [x, y];
  };

  const states = bulletin?.states || [];

  // Color mapping based on variable value
  const getColor = (val: number) => {
    if (variable === "rainfall") {
      if (val < 15.6) return "rgba(30, 58, 138, 0.4)";
      if (val < 64.5) return "rgba(6, 182, 212, 0.7)";
      if (val < 115.6) return "rgba(234, 179, 8, 0.85)";  // Yellow Alert
      if (val < 204.5) return "rgba(245, 158, 11, 0.9)";  // Orange Alert
      return "rgba(239, 68, 68, 0.95)";                   // Red Alert
    } else if (variable === "tmax") {
      if (val < 30) return "rgba(59, 130, 246, 0.5)";
      if (val < 38) return "rgba(234, 179, 8, 0.7)";
      if (val < 42) return "rgba(245, 158, 11, 0.85)";
      if (val < 45) return "rgba(239, 68, 68, 0.9)";
      return "rgba(220, 38, 38, 0.95)";
    } else {
      if (val < 25) return "rgba(16, 185, 129, 0.5)";
      if (val < 50) return "rgba(6, 182, 212, 0.7)";
      if (val < 75) return "rgba(234, 179, 8, 0.85)";
      if (val < 100) return "rgba(245, 158, 11, 0.9)";
      return "rgba(239, 68, 68, 0.95)";
    }
  };

  return (
    <div className="relative w-full h-[620px] rounded-xl border border-cyan-500/20 bg-[#070B14]/90 backdrop-blur-md overflow-hidden flex flex-col items-center justify-center p-2 shadow-inner-glow">
      {/* Top Map Status Banner */}
      <div className="absolute top-3 left-4 z-20 flex flex-col space-y-1">
        <div className="flex items-center space-x-2">
          <span className="flex h-2 w-2 rounded-full bg-cyan-400 animate-ping" />
          <h3 className="font-heading font-bold text-sm tracking-wider text-cyan-300 uppercase">
            Synoptic Geospatial Canvas
          </h3>
          <span className="rounded bg-cyan-950/60 border border-cyan-500/30 px-1.5 py-0.5 font-mono text-[10px] text-cyan-400">
            India Domain (0.25° Grid)
          </span>
        </div>
        <p className="text-[11px] text-slate-400 font-mono">
          Layer: <span className="text-cyan-400 capitalize">{variable}</span> | Regime: <span className="text-violet-400">{regime}</span> | Lead: <span className="text-cyan-400">+{lead}h</span>
        </p>
      </div>

      {/* Source selector on map */}
      <div className="absolute top-3 right-4 z-20 flex items-center space-x-1.5 bg-slate-900/90 border border-slate-700/60 rounded-lg p-1 text-[11px]">
        <span className="text-slate-400 px-1.5 font-medium">Field:</span>
        <button
          onClick={() => useOpsStore.getState().setSelectedSource("samanvay")}
          className={`px-2 py-0.5 rounded font-mono font-semibold transition ${
            selectedSource === "samanvay"
              ? "bg-cyan-500/20 text-cyan-300 border border-cyan-500/40"
              : "text-slate-400 hover:text-slate-200"
          }`}
        >
          SAMANVAY
        </button>
        <button
          onClick={() => useOpsStore.getState().setSelectedSource("neps")}
          className={`px-2 py-0.5 rounded font-mono transition ${
            selectedSource === "neps"
              ? "bg-blue-500/20 text-blue-300 border border-blue-500/40"
              : "text-slate-400 hover:text-slate-200"
          }`}
        >
          NEPS
        </button>
        <button
          onClick={() => useOpsStore.getState().setSelectedSource("graphcast")}
          className={`px-2 py-0.5 rounded font-mono transition ${
            selectedSource === "graphcast"
              ? "bg-violet-500/20 text-violet-300 border border-violet-500/40"
              : "text-slate-400 hover:text-slate-200"
          }`}
        >
          GraphCast
        </button>
      </div>

      {/* SVG Canvas for India Vector & Data */}
      <svg
        viewBox="0 0 700 750"
        className="w-full h-full max-h-[580px] select-none"
        style={{ filter: "drop-shadow(0 0 15px rgba(6,182,212,0.15))" }}
      >
        <defs>
          <radialGradient id="oceanGlow" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#0B152A" stopOpacity="0.8" />
            <stop offset="100%" stopColor="#070B14" stopOpacity="0.1" />
          </radialGradient>
          <filter id="glow">
            <feGaussianBlur stdDeviation="3" result="coloredBlur" />
            <feMerge>
              <feMergeNode in="coloredBlur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        {/* Ambient Maritime Background */}
        <rect width="700" height="750" fill="url(#oceanGlow)" />

        {/* India Outline & Homogeneous Zones Schematic Borders */}
        {/* Northwest Zone */}
        <path
          d="M 120 180 L 220 80 L 320 120 L 280 280 L 140 320 Z"
          fill="none"
          stroke="rgba(56, 189, 248, 0.25)"
          strokeDasharray="4 4"
          strokeWidth="1.5"
        />
        {/* Central Zone */}
        <path
          d="M 140 320 L 280 280 L 400 320 L 350 480 L 210 460 Z"
          fill="none"
          stroke="rgba(52, 211, 153, 0.25)"
          strokeDasharray="4 4"
          strokeWidth="1.5"
        />
        {/* East & Northeast Zone */}
        <path
          d="M 400 320 L 490 280 L 610 240 L 590 380 L 420 440 Z"
          fill="none"
          stroke="rgba(244, 114, 182, 0.25)"
          strokeDasharray="4 4"
          strokeWidth="1.5"
        />
        {/* South Peninsular Zone */}
        <path
          d="M 210 460 L 350 480 L 320 660 L 250 670 Z"
          fill="none"
          stroke="rgba(167, 139, 250, 0.25)"
          strokeDasharray="4 4"
          strokeWidth="1.5"
        />

        {/* Coastlines & Boundary Silhouette */}
        <path
          d="M 220 60 L 250 50 L 300 90 L 330 140 L 300 200 L 350 250 L 440 250 L 520 230 L 620 220 L 600 310 L 540 330 L 450 360 L 430 430 L 370 510 L 310 660 L 250 680 L 230 630 L 200 520 L 190 420 L 120 370 L 130 310 L 170 260 L 170 170 Z"
          fill="rgba(15, 23, 42, 0.7)"
          stroke="rgba(6, 182, 212, 0.5)"
          strokeWidth="2"
        />

        {/* Western Ghats Ridge Highlight */}
        <path
          d="M 195 440 Q 210 540 245 650"
          fill="none"
          stroke="rgba(6, 182, 212, 0.8)"
          strokeWidth="3"
          strokeLinecap="round"
          filter="url(#glow)"
        />

        {/* Render 36 State / UT nodes */}
        {states.map((st) => {
          const [cx, cy] = project(st.lat, st.lon);
          const isSelected = selectedRegion === st.code;
          const isHovered = hoveredState?.code === st.code;
          const isAlert = st.alert_level === "RED" || st.alert_level === "ORANGE";

          return (
            <g
              key={st.code}
              className="cursor-pointer transition-transform"
              onClick={() => setSelectedRegion(st.code)}
              onMouseEnter={() => setHoveredState(st)}
              onMouseLeave={() => setHoveredState(null)}
            >
              {/* Alert Pulse Ring */}
              {isAlert && (
                <circle
                  cx={cx}
                  cy={cy}
                  r={isSelected ? 18 : 14}
                  fill="none"
                  stroke={st.alert_color}
                  strokeWidth="2"
                  className="animate-ping opacity-60"
                />
              )}

              {/* State Base Node */}
              <circle
                cx={cx}
                cy={cy}
                r={isSelected ? 10 : (isHovered ? 8 : 6)}
                fill={getColor(st.metrics.rainfall_mm)}
                stroke={isSelected ? "#00F5FF" : st.alert_color}
                strokeWidth={isSelected ? 3 : 1.5}
                filter={isSelected || isAlert ? "url(#glow)" : undefined}
              />

              {/* Label */}
              <text
                x={cx}
                y={cy + 14}
                textAnchor="middle"
                className={`font-mono text-[9px] pointer-events-none ${
                  isSelected ? "fill-cyan-300 font-bold" : "fill-slate-400"
                }`}
              >
                {st.code}
              </text>
            </g>
          );
        })}
      </svg>

      {/* Hover Tooltip Box */}
      {hoveredState && (
        <div className="absolute bottom-4 left-4 z-30 max-w-sm rounded-xl border border-cyan-500/40 bg-slate-950/95 p-3.5 shadow-2xl backdrop-blur-md pointer-events-none transition-all">
          <div className="flex items-center justify-between border-b border-slate-800 pb-2 mb-2">
            <div>
              <h4 className="font-heading font-bold text-sm text-cyan-300">
                {hoveredState.name} ({hoveredState.code})
              </h4>
              <p className="text-[10px] text-slate-400">{hoveredState.zone} • {hoveredState.terrain}</p>
            </div>
            <span
              className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase border ${
                getAlertBadgeClass(hoveredState.alert_level).border
              } ${getAlertBadgeClass(hoveredState.alert_level).bg} ${
                getAlertBadgeClass(hoveredState.alert_level).text
              }`}
            >
              {hoveredState.alert_level}
            </span>
          </div>

          <div className="grid grid-cols-2 gap-2 text-xs font-mono mb-2">
            <div>
              <span className="text-slate-400 text-[10px]">Consensus Rain:</span>
              <p className="text-cyan-400 font-semibold">{formatNumber(hoveredState.metrics.rainfall_mm)} mm/24h</p>
            </div>
            <div>
              <span className="text-slate-400 text-[10px]">Tmax / Departure:</span>
              <p className="text-amber-400 font-semibold">
                {formatNumber(hoveredState.metrics.tmax_c)}°C ({hoveredState.metrics.tmax_departure_c >= 0 ? "+" : ""}
                {formatNumber(hoveredState.metrics.tmax_departure_c)}°C)
              </p>
            </div>
            <div>
              <span className="text-slate-400 text-[10px]">P(&gt;64.5mm):</span>
              <p className="text-cyan-300">{(hoveredState.metrics.p_heavy_rain * 100).toFixed(0)}%</p>
            </div>
            <div>
              <span className="text-slate-400 text-[10px]">Peak Wind Gust:</span>
              <p className="text-violet-300">{formatNumber(hoveredState.metrics.wind_gust_kmh)} km/h</p>
            </div>
          </div>

          <div className="text-[11px] text-slate-300 bg-slate-900/80 p-2 rounded border border-slate-800">
            <span className="text-red-400 font-semibold block text-[10px] uppercase">Action Protocol:</span>
            {hoveredState.sop_action}
          </div>
        </div>
      )}

      {/* Color Scale Legend */}
      <div className="absolute bottom-3 right-4 z-20 flex flex-col items-end space-y-1 bg-slate-950/80 border border-slate-800 p-2 rounded-lg backdrop-blur-sm">
        <span className="font-mono text-[10px] text-slate-400 uppercase tracking-wider">
          IMD Alert Thresholds
        </span>
        <div className="flex items-center space-x-1.5 text-[10px] font-mono">
          <span className="flex items-center space-x-1">
            <span className="h-2.5 w-2.5 rounded-full bg-emerald-500" />
            <span className="text-slate-400">Normal</span>
          </span>
          <span className="flex items-center space-x-1">
            <span className="h-2.5 w-2.5 rounded-full bg-yellow-400" />
            <span className="text-yellow-400">&gt;64.5mm</span>
          </span>
          <span className="flex items-center space-x-1">
            <span className="h-2.5 w-2.5 rounded-full bg-amber-500" />
            <span className="text-amber-400">&gt;115.6mm</span>
          </span>
          <span className="flex items-center space-x-1">
            <span className="h-2.5 w-2.5 rounded-full bg-red-500" />
            <span className="text-red-400">&gt;204.5mm</span>
          </span>
        </div>
      </div>
    </div>
  );
}
