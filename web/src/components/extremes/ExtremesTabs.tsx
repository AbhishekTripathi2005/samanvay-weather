"use client";

import React, { useState, useRef, useEffect, useCallback } from "react";
import { Play, Pause, ChevronLeft, ChevronRight } from "lucide-react";
import { GlassCard } from "@/components/ui/GlassCard";
import { ViridisLegend } from "./ViridisLegend";

type TabVar = "rainfall" | "tmax" | "wind_gust";

interface TabConfig {
  id: TabVar;
  label: string;
  icon: string;
  threshold: string;
  imdLabel: string;
  unit: string;
  thresholds: { name: string; value: number; level: "YELLOW" | "ORANGE" | "RED" }[];
}

const TABS: TabConfig[] = [
  {
    id: "rainfall",
    label: "Heavy Rainfall",
    icon: "🌧️",
    threshold: "≥64.5 mm/24h",
    imdLabel: "IMD Heavy Rain Category",
    unit: "mm",
    thresholds: [
      { name: "Heavy", value: 64.5, level: "YELLOW" },
      { name: "Very Heavy", value: 115.5, level: "ORANGE" },
      { name: "Extremely Heavy", value: 204.5, level: "RED" },
    ],
  },
  {
    id: "tmax",
    label: "Heatwave",
    icon: "🔥",
    threshold: "Tmax ≥40°C / +4.5°C anomaly",
    imdLabel: "IMD Heatwave Category",
    unit: "°C",
    thresholds: [
      { name: "Heat Watch", value: 40, level: "YELLOW" },
      { name: "Heatwave", value: 44, level: "ORANGE" },
      { name: "Severe Heatwave", value: 47, level: "RED" },
    ],
  },
  {
    id: "wind_gust",
    label: "High Wind",
    icon: "💨",
    threshold: "Gust ≥75 km/h",
    imdLabel: "IMD Wind Advisory Category",
    unit: "km/h",
    thresholds: [
      { name: "Strong Wind", value: 50, level: "YELLOW" },
      { name: "Damaging Gust", value: 75, level: "ORANGE" },
      { name: "Destructive Gust", value: 100, level: "RED" },
    ],
  },
];

// 36 Indian states/UTs as (col, row, abbr, name) for a schematic grid map
const STATE_CELLS = [
  { c: 1, r: 0, id: "JK", name: "J&K" },
  { c: 2, r: 0, id: "LA", name: "Ladakh" },
  { c: 0, r: 1, id: "PB", name: "Punjab" },
  { c: 1, r: 1, id: "HP", name: "H.P." },
  { c: 2, r: 1, id: "UK", name: "Uttarakhand" },
  { c: 3, r: 1, id: "SK", name: "Sikkim" },
  { c: 4, r: 1, id: "AR", name: "Arunachal" },
  { c: 0, r: 2, id: "HR", name: "Haryana" },
  { c: 1, r: 2, id: "DL", name: "Delhi" },
  { c: 2, r: 2, id: "UP", name: "U.P." },
  { c: 3, r: 2, id: "BI", name: "Bihar" },
  { c: 4, r: 2, id: "AS", name: "Assam" },
  { c: 5, r: 2, id: "NE", name: "NE States" },
  { c: 0, r: 3, id: "RJ", name: "Rajasthan" },
  { c: 1, r: 3, id: "MP", name: "M.P." },
  { c: 2, r: 3, id: "JH", name: "Jharkhand" },
  { c: 3, r: 3, id: "WB", name: "W. Bengal" },
  { c: 4, r: 3, id: "OD", name: "Odisha" },
  { c: 0, r: 4, id: "GJ", name: "Gujarat" },
  { c: 1, r: 4, id: "MH", name: "Maharashtra" },
  { c: 2, r: 4, id: "CG", name: "Chhattisgarh" },
  { c: 3, r: 4, id: "AP", name: "Andhra P." },
  { c: 4, r: 4, id: "MN", name: "Manipur" },
  { c: 0, r: 5, id: "DD", name: "D&D" },
  { c: 1, r: 5, id: "GA", name: "Goa" },
  { c: 2, r: 5, id: "KA", name: "Karnataka" },
  { c: 3, r: 5, id: "TL", name: "Telangana" },
  { c: 1, r: 6, id: "KL", name: "Kerala" },
  { c: 2, r: 6, id: "TN", name: "Tamil Nadu" },
  { c: 3, r: 6, id: "PY", name: "Puducherry" },
  { c: 5, r: 3, id: "AN", name: "A&N Islands" },
  { c: 4, r: 5, id: "ML", name: "Meghalaya" },
  { c: 5, r: 4, id: "MZ", name: "Mizoram" },
  { c: 5, r: 5, id: "TR", name: "Tripura" },
  { c: 4, r: 0, id: "CH", name: "Chandigarh" },
  { c: 5, r: 1, id: "MG", name: "Nagaland" },
];

// Seeded probability values per state per variable per lead day
function getStateProbability(stateId: string, variable: TabVar, leadDay: number): number {
  const seed = stateId.charCodeAt(0) + stateId.charCodeAt(1) + leadDay * 7;
  const base: Record<TabVar, number> = {
    rainfall: [0.84, 0.79, 0.68, 0.62, 0.71, 0.35, 0.45, 0.28, 0.55, 0.38][seed % 10],
    tmax: [0.76, 0.58, 0.42, 0.31, 0.65, 0.72, 0.49, 0.33, 0.56, 0.44][seed % 10],
    wind_gust: [0.71, 0.55, 0.38, 0.29, 0.64, 0.47, 0.52, 0.41, 0.36, 0.60][seed % 10],
  };
  const leadDecay = Math.max(0.05, base[variable] * Math.pow(0.86, leadDay - 1));
  return Math.min(0.95, leadDecay);
}

function pToViridis(p: number): string {
  if (p < 0.25)  return `rgba(68, 1, 84, ${0.3 + p * 2})`;
  if (p < 0.50)  return `rgba(59, 82, 139, ${0.4 + p})`;
  if (p < 0.75)  return `rgba(33, 144, 141, ${0.5 + p * 0.5})`;
  return `rgba(253, 231, 37, ${0.5 + p * 0.4})`;
}

function pToLevel(p: number): "GREEN" | "YELLOW" | "ORANGE" | "RED" {
  if (p >= 0.75) return "RED";
  if (p >= 0.50) return "ORANGE";
  if (p >= 0.25) return "YELLOW";
  return "GREEN";
}

const LEVEL_PATTERNS: Record<string, string> = {
  GREEN:  "none",
  YELLOW: "dots",
  ORANGE: "stripes",
  RED:    "cross",
};

const LEVEL_ARIA: Record<string, string> = {
  GREEN:  "Normal",
  YELLOW: "Watch",
  ORANGE: "Alert",
  RED:    "Warning",
};

interface ExtremesTabsProps {
  activeVariable?: TabVar;
  onVariableChange?: (v: TabVar) => void;
}

export function ExtremesTabs({ activeVariable = "rainfall", onVariableChange }: ExtremesTabsProps) {
  const [activeTab, setActiveTab] = useState<TabVar>(activeVariable);
  const [leadDay, setLeadDay] = useState(1);
  const [playing, setPlaying] = useState(false);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const tab = TABS.find((t) => t.id === activeTab) ?? TABS[0];

  const handleTabChange = useCallback((id: TabVar) => {
    setActiveTab(id);
    setLeadDay(1);
    setPlaying(false);
    onVariableChange?.(id);
  }, [onVariableChange]);

  useEffect(() => {
    if (playing) {
      intervalRef.current = setInterval(() => {
        setLeadDay((d) => {
          if (d >= 5) { setPlaying(false); return 1; }
          return d + 1;
        });
      }, 900);
    }
    return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
  }, [playing]);

  const COLS = 6, ROWS = 7;
  const CELL_W = 52, CELL_H = 38, GAP = 2;

  return (
    <GlassCard className="p-4 flex flex-col gap-4">
      {/* Tab bar */}
      <div className="flex items-center gap-2 flex-wrap">
        {TABS.map((t) => (
          <button
            key={t.id}
            onClick={() => handleTabChange(t.id)}
            aria-pressed={activeTab === t.id}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all ${
              activeTab === t.id
                ? "bg-cyan-500/20 border-cyan-500/50 text-cyan-300"
                : "bg-surface-2/50 border-border/40 text-text-3 hover:border-border hover:text-text-2"
            }`}
          >
            <span>{t.icon}</span>
            {t.label}
          </button>
        ))}
        <div className="ml-auto text-[10px] text-text-3 font-mono">{tab.threshold}</div>
      </div>

      {/* Main content: map + controls */}
      <div className="flex flex-col lg:flex-row gap-4">
        {/* Schematic probability map */}
        <div className="flex-1">
          <div
            className="relative overflow-hidden rounded-lg border border-border/30 bg-surface-2/30"
            style={{ width: COLS * (CELL_W + GAP), height: ROWS * (CELL_H + GAP), minWidth: 320 }}
          >
            {/* Schematic sea background */}
            <div className="absolute inset-0 bg-gradient-to-br from-slate-900/80 to-blue-950/60" />

            {STATE_CELLS.map((cell) => {
              const p = getStateProbability(cell.id, activeTab, leadDay);
              const level = pToLevel(p);
              const color = pToViridis(p);
              const x = cell.c * (CELL_W + GAP);
              const y = cell.r * (CELL_H + GAP);

              return (
                <div
                  key={cell.id}
                  className="absolute flex flex-col items-center justify-center text-center rounded border border-white/10 cursor-pointer transition-transform hover:scale-105 hover:z-10 group"
                  style={{ left: x, top: y, width: CELL_W, height: CELL_H, backgroundColor: color }}
                  role="region"
                  aria-label={`${cell.name}: ${Math.round(p * 100)}% probability — ${LEVEL_ARIA[level]}`}
                  tabIndex={0}
                >
                  {/* Pattern overlay for greyscale */}
                  <PatternOverlay pattern={LEVEL_PATTERNS[level]} />
                  <span className="relative z-10 text-[9px] font-bold text-white drop-shadow-sm leading-tight">
                    {cell.id}
                  </span>
                  <span className="relative z-10 text-[8px] text-white/80 font-mono">
                    {Math.round(p * 100)}%
                  </span>

                  {/* Tooltip */}
                  <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-1 z-20 opacity-0 group-hover:opacity-100 group-focus:opacity-100 pointer-events-none transition-opacity">
                    <div className="bg-surface-1 border border-border rounded-md px-2 py-1 text-[10px] text-text-1 whitespace-nowrap shadow-xl">
                      <div className="font-semibold">{cell.name}</div>
                      <div className="text-cyan-400 font-mono">P(extreme) = {Math.round(p * 100)}%</div>
                      <div className="text-text-3">Day {leadDay} — {LEVEL_ARIA[level]}</div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right panel: lead selector + legend + thresholds */}
        <div className="flex flex-col gap-4 lg:w-56">
          {/* Lead day control */}
          <div className="flex flex-col gap-2">
            <div className="flex items-center justify-between text-xs text-text-2">
              <span className="font-medium">Lead Day</span>
              <span className="font-mono text-cyan-400 font-bold">Day {leadDay}</span>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setLeadDay((d) => Math.max(1, d - 1))}
                disabled={leadDay <= 1}
                className="p-1 rounded bg-surface-2 border border-border hover:border-cyan-500/50 disabled:opacity-30 transition-colors"
                aria-label="Previous day"
              >
                <ChevronLeft className="h-3.5 w-3.5 text-text-2" />
              </button>
              <input
                type="range"
                min={1} max={5} step={1}
                value={leadDay}
                onChange={(e) => setLeadDay(Number(e.target.value))}
                className="flex-1 accent-cyan-400 cursor-pointer"
                aria-label={`Lead day selector, currently Day ${leadDay}`}
              />
              <button
                onClick={() => setLeadDay((d) => Math.min(5, d + 1))}
                disabled={leadDay >= 5}
                className="p-1 rounded bg-surface-2 border border-border hover:border-cyan-500/50 disabled:opacity-30 transition-colors"
                aria-label="Next day"
              >
                <ChevronRight className="h-3.5 w-3.5 text-text-2" />
              </button>
            </div>
            <div className="flex justify-between text-[9px] text-text-3 font-mono">
              {[1,2,3,4,5].map((d) => (
                <button
                  key={d}
                  onClick={() => setLeadDay(d)}
                  className={`w-6 h-5 rounded text-center transition-colors ${
                    d === leadDay ? "bg-cyan-500/30 text-cyan-300 font-bold" : "hover:bg-surface-2"
                  }`}
                >
                  D{d}
                </button>
              ))}
            </div>
            <button
              onClick={() => setPlaying((p) => !p)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-cyan-500/20 border border-cyan-500/40 text-cyan-400 text-xs font-semibold hover:bg-cyan-500/30 transition-colors"
              aria-label={playing ? "Pause lead-day animation" : "Play lead-day animation"}
            >
              {playing ? <Pause className="h-3.5 w-3.5" /> : <Play className="h-3.5 w-3.5" />}
              {playing ? "Pause" : "Play D1→D5"}
            </button>
          </div>

          {/* IMD category thresholds */}
          <div className="flex flex-col gap-2">
            <div className="text-[10px] font-semibold text-text-3 uppercase tracking-wider">{tab.imdLabel}</div>
            {tab.thresholds.map((th) => {
              const colours: Record<string, string> = {
                YELLOW: "bg-yellow-500/15 border-yellow-500/40 text-yellow-400",
                ORANGE: "bg-amber-500/15  border-amber-500/40  text-amber-400",
                RED:    "bg-red-500/15    border-red-500/40    text-red-400",
              };
              return (
                <div key={th.name} className={`flex items-center justify-between px-2 py-1 rounded border text-[10px] ${colours[th.level]}`}>
                  <span className="font-mono font-bold">
                    {th.level === "YELLOW" ? "YELLOW" : th.level === "ORANGE" ? "ORANGE" : "RED"}
                  </span>
                  <span>{th.name}</span>
                  <span className="font-mono">≥{th.value}{tab.unit}</span>
                </div>
              );
            })}
          </div>

          {/* Viridis legend */}
          <ViridisLegend label="P(Extreme)" thresholdLabel={tab.threshold} />
        </div>
      </div>
    </GlassCard>
  );
}

function PatternOverlay({ pattern }: { pattern: string }) {
  const size = 6;
  if (pattern === "none") return null;
  return (
    <svg
      className="absolute inset-0 w-full h-full pointer-events-none"
      style={{ opacity: 0.25 }}
      aria-hidden="true"
    >
      {pattern === "dots" && (
        <>
          {[8, 20, 32, 44].flatMap((x) =>
            [6, 15, 24, 33].map((y) => (
              <circle key={`${x}-${y}`} cx={x} cy={y} r={1.5} fill="white" />
            ))
          )}
        </>
      )}
      {pattern === "stripes" && (
        <>
          {[0, 6, 12, 18, 24, 30, 36, 42].map((offset) => (
            <line
              key={offset}
              x1={offset} y1={0}
              x2={offset + 40} y2={40}
              stroke="white" strokeWidth={1.5}
            />
          ))}
        </>
      )}
      {pattern === "cross" && (
        <>
          {[8, 24, 40].map((x) => (
            <line key={`v-${x}`} x1={x} y1={0} x2={x} y2={52} stroke="white" strokeWidth={1.2} />
          ))}
          {[8, 18, 28, 38].map((y) => (
            <line key={`h-${y}`} x1={0} y1={y} x2={52} y2={y} stroke="white" strokeWidth={1.2} />
          ))}
        </>
      )}
    </svg>
  );
}
