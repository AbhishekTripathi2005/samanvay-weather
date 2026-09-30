"use client";

import React, { useEffect, useRef, useState, useMemo } from "react";
import { GlassCard } from "@/components/ui/GlassCard";
import { AlertBadge } from "@/components/ui/AlertBadge";
import { AlertLevel } from "@/lib/types";

export interface MapRegionHoverData {
  code: string;
  name: string;
  zone: string;
  value: number;
  p10: number;
  p90: number;
  alertLevel: AlertLevel;
  dominantModel: string;
}

interface ForecastMapProps {
  variable?: string;
  leadHours?: number;
  gridValues?: number[][];
  lats?: number[];
  lons?: number[];
  minValue?: number;
  maxValue?: number;
  statesData?: Array<{
    code: string;
    name: string;
    zone: string;
    lat: number;
    lon: number;
    value: number;
    p10: number;
    p90: number;
    alert_level: AlertLevel;
    dominant_model: string;
  }>;
  selectedRegion?: string;
  onSelectRegion?: (code: string) => void;
  className?: string;
}

// Bounding box of India in degrees
const MIN_LAT = 6.0;
const MAX_LAT = 38.0;
const MIN_LON = 68.0;
const MAX_LON = 98.0;

function ForecastMapComponent({
  variable = "rainfall",
  leadHours = 72,
  gridValues,
  lats,
  lons,
  minValue = 0,
  maxValue = 150,
  statesData = [],
  selectedRegion,
  onSelectRegion,
  className = ""
}: ForecastMapProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [hoveredRegion, setHoveredRegion] = useState<MapRegionHoverData | null>(null);
  const [mousePos, setMousePos] = useState<{ x: number; y: number }>({ x: 0, y: 0 });

  // Color mapping function
  const getColor = useMemo(() => {
    return (val: number, min: number, max: number) => {
      const norm = Math.max(0, Math.min(1, (val - min) / Math.max(1, max - min)));
      if (variable === "rainfall") {
        // Viridis-like palette: deep purple -> teal -> yellow
        if (norm < 0.25) return `rgba(68, 1, 84, ${0.4 + norm * 1.5})`;
        if (norm < 0.5) return `rgba(49, 104, 142, ${0.6 + norm * 0.8})`;
        if (norm < 0.75) return `rgba(53, 183, 121, 0.85)`;
        return `rgba(253, 231, 37, 0.95)`;
      } else if (variable === "tmax") {
        // Plasma-like palette: purple -> magenta -> orange -> yellow
        if (norm < 0.3) return `rgba(13, 8, 135, 0.65)`;
        if (norm < 0.6) return `rgba(180, 52, 120, 0.8)`;
        if (norm < 0.85) return `rgba(240, 110, 40, 0.9)`;
        return `rgba(240, 249, 33, 0.95)`;
      } else {
        // Mako / Cyan-blue palette
        if (norm < 0.33) return `rgba(11, 44, 77, 0.6)`;
        if (norm < 0.66) return `rgba(24, 116, 152, 0.8)`;
        return `rgba(0, 245, 255, 0.95)`;
      }
    };
  }, [variable]);

  // Render 0.5 deg canvas field
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !gridValues || gridValues.length === 0) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const width = canvas.width;
    const height = canvas.height;
    ctx.clearRect(0, 0, width, height);

    const nLats = gridValues.length;
    const nLons = gridValues[0].length;
    const cellW = width / nLons;
    const cellH = height / nLats;

    for (let i = 0; i < nLats; i++) {
      for (let j = 0; j < nLons; j++) {
        const val = gridValues[i][j];
        if (val <= 0.1 && variable === "rainfall") continue;

        // Invert Y so north (high latitude) is top
        const y = height - (i + 1) * cellH;
        const x = j * cellW;

        ctx.fillStyle = getColor(val, minValue, maxValue);
        ctx.fillRect(x, y, cellW + 0.5, cellH + 0.5);
      }
    }
  }, [gridValues, minValue, maxValue, getColor, variable]);

  // Projection helper: maps lat/lon to percentage of container
  const project = (lat: number, lon: number) => {
    const x = ((lon - MIN_LON) / (MAX_LON - MIN_LON)) * 100;
    const y = ((MAX_LAT - lat) / (MAX_LAT - MIN_LAT)) * 100;
    return { x, y };
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    setMousePos({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top
    });
  };

  const unit = variable === "rainfall" ? "mm/24h" : variable === "tmax" || variable === "tmin" ? "°C" : "km/h";

  return (
    <div
      ref={containerRef}
      onMouseMove={handleMouseMove}
      role="region"
      aria-label={`Indian Meteorological Forecast Map: ${variable} at +${leadHours}h lead time`}
      className={`relative w-full h-full min-h-[480px] bg-surface-0 rounded-2xl overflow-hidden border border-border/50 select-none ${className}`}
    >
      {/* Screen-reader accessible data table alternative (WCAG AA) */}
      <div className="sr-only">
        <h3>Tabular Forecast Summary across Indian Regions</h3>
        <table>
          <caption>Forecast {variable} ({unit}) for +{leadHours}h lead time</caption>
          <thead>
            <tr>
              <th scope="col">Region Code</th>
              <th scope="col">Region Name</th>
              <th scope="col">Zone</th>
              <th scope="col">Consensus ({unit})</th>
              <th scope="col">P10-P90 Spread</th>
              <th scope="col">Alert Level</th>
              <th scope="col">Dominant Source</th>
            </tr>
          </thead>
          <tbody>
            {statesData.map((st) => (
              <tr key={st.code}>
                <td>{st.code}</td>
                <td>{st.name}</td>
                <td>{st.zone}</td>
                <td>{st.value}</td>
                <td>{st.p10} - {st.p90}</td>
                <td>{st.alert_level}</td>
                <td>{st.dominant_model}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Background Indian Topographic Grid Map Base */}
      <div className="absolute inset-0 opacity-15 pointer-events-none bg-[radial-gradient(#00F5FF_1px,transparent_1px)] [background-size:24px_24px]" />

      {/* Simplified India Outline SVG basemap (100% Offline) */}
      <svg className="absolute inset-0 w-full h-full pointer-events-none" viewBox="0 0 100 100" preserveAspectRatio="none">
        <path
          d="M 28 8 L 33 5 L 36 12 L 40 8 L 48 18 L 54 22 L 68 22 L 78 20 L 86 24 L 92 30 L 88 35 L 75 35 L 68 38 L 62 48 L 56 65 L 50 82 L 48 88 L 45 82 L 40 70 L 32 58 L 24 50 L 22 40 L 28 32 L 24 24 Z"
          fill="none"
          stroke="currentColor"
          strokeWidth="0.4"
          className="text-cyan-500/30"
          strokeDasharray="2,2"
        />
      </svg>

      {/* 0.5-deg Canvas Heat Field Overlay */}
      <canvas
        ref={canvasRef}
        width={360}
        height={380}
        className="absolute inset-0 w-full h-full object-fill opacity-80 mix-blend-screen transition-opacity duration-300"
      />

      {/* Regional State Interactive Pins & Centroids */}
      <div className="absolute inset-0">
        {statesData.map((st) => {
          const { x, y } = project(st.lat, st.lon);
          const isSelected = selectedRegion === st.code;
          const isRed = st.alert_level === "RED";
          const isOrange = st.alert_level === "ORANGE";
          const isYellow = st.alert_level === "YELLOW";

          const badgeColor = isRed
            ? "#EF4444"
            : isOrange
            ? "#F59E0B"
            : isYellow
            ? "#EAB308"
            : "#10B981";

          return (
            <button
              key={st.code}
              onClick={() => onSelectRegion?.(st.code)}
              onMouseEnter={() =>
                setHoveredRegion({
                  code: st.code,
                  name: st.name,
                  zone: st.zone,
                  value: st.value,
                  p10: st.p10,
                  p90: st.p90,
                  alertLevel: st.alert_level,
                  dominantModel: st.dominant_model
                })
              }
              onMouseLeave={() => setHoveredRegion(null)}
              style={{ left: `${x}%`, top: `${y}%` }}
              className={`absolute -translate-x-1/2 -translate-y-1/2 group z-10 transition-transform duration-200 focus:outline-none ${
                isSelected ? "scale-125 z-20" : "hover:scale-115"
              }`}
              title={`${st.name} (${st.value} ${unit})`}
            >
              <div className="relative flex items-center justify-center">
                {/* Alert Pulse Aura */}
                {(isRed || isOrange) && (
                  <span
                    className="absolute w-6 h-6 rounded-full animate-ping opacity-60"
                    style={{ backgroundColor: badgeColor }}
                  />
                )}
                {/* Node Pill */}
                <div
                  className={`px-1.5 py-0.5 rounded-full text-[10px] font-mono font-bold tracking-tight shadow-lg border transition-all ${
                    isSelected ? "ring-2 ring-cyan-400 border-white shadow-cyan-500/50" : "border-border/60"
                  }`}
                  style={{
                    backgroundColor: `${badgeColor}33`,
                    color: badgeColor,
                    borderColor: badgeColor
                  }}
                >
                  {st.code}
                </div>
              </div>
            </button>
          );
        })}
      </div>

      {/* Floating Hover Card */}
      {hoveredRegion && (
        <div
          style={{
            left: Math.min(mousePos.x + 16, (containerRef.current?.clientWidth || 500) - 220),
            top: Math.max(16, mousePos.y - 70)
          }}
          className="absolute z-30 pointer-events-none transition-all duration-75"
        >
          <GlassCard className="p-3 w-52 shadow-2xl backdrop-blur-xl border-cyan-500/40 animate-fadeUp">
            <div className="flex items-center justify-between mb-1.5">
              <span className="font-semibold text-xs text-text-1">{hoveredRegion.name}</span>
              <AlertBadge level={hoveredRegion.alertLevel} />
            </div>
            <div className="flex items-baseline justify-between mb-1">
              <span className="text-xl font-mono font-bold text-cyan-400">
                {hoveredRegion.value}
                <span className="text-[10px] text-text-3 ml-1 font-normal">{unit}</span>
              </span>
              <span className="text-[10px] text-text-3">Day {leadHours / 24}</span>
            </div>
            <div className="text-[10px] text-text-2 flex justify-between border-t border-border/40 pt-1">
              <span>Spread (P10–P90):</span>
              <span className="font-mono text-text-1">
                {hoveredRegion.p10} - {hoveredRegion.p90}
              </span>
            </div>
            <div className="text-[10px] text-text-3 flex justify-between mt-0.5">
              <span>Top Source:</span>
              <span className="font-mono text-cyan-400 uppercase">{hoveredRegion.dominantModel}</span>
            </div>
          </GlassCard>
        </div>
      )}

      {/* Floating Map Legend (Bottom Right) */}
      <div className="absolute bottom-4 right-4 z-20 pointer-events-auto">
        <GlassCard className="px-3 py-2 text-xs flex flex-col gap-1 border-border/70 shadow-lg backdrop-blur-md">
          <div className="flex items-center justify-between text-[11px] text-text-2 font-medium">
            <span className="capitalize">{variable}</span>
            <span className="text-text-3 font-mono">{unit}</span>
          </div>
          <div
            className="w-44 h-2.5 rounded-full border border-border/50 shadow-inner"
            style={{
              background:
                variable === "rainfall"
                  ? "linear-gradient(to right, #440154, #31688e, #35b779, #fde725)"
                  : variable === "tmax"
                  ? "linear-gradient(to right, #0d0887, #b43478, #f06e28, #f0f921)"
                  : "linear-gradient(to right, #0b2c4d, #187498, #00f5ff)"
            }}
          />
          <div className="flex justify-between text-[10px] font-mono text-text-3">
            <span>{minValue}</span>
            <span>{Math.round((minValue + maxValue) / 2)}</span>
            <span>{maxValue}+</span>
          </div>
        </GlassCard>
      </div>

      {/* Map Header Status Overlay (Top Left) */}
      <div className="absolute top-4 left-4 z-20 pointer-events-none">
        <div className="bg-surface-1/80 backdrop-blur-md border border-border/60 rounded-lg px-2.5 py-1.5 shadow-md flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          <span className="text-xs font-medium text-text-1">0.5° India Gridded Field</span>
          <span className="text-[11px] font-mono text-cyan-400">+{leadHours}h</span>
        </div>
      </div>
    </div>
  );
}

export const ForecastMap = React.memo(ForecastMapComponent);

