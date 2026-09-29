"use client";

import React from "react";
import { GlassCard } from "@/components/ui/GlassCard";
import { Slider } from "@/components/ui/Slider";
import { Layers, Clock, Sun, CloudRain, Cpu } from "lucide-react";

interface WeightControlsProps {
  variable: string;
  onSelectVariable: (v: string) => void;
  leadHours: number;
  onSelectLead: (lead: number) => void;
  season: string;
  onSelectSeason: (s: string) => void;
  regime: string;
  onSelectRegime: (r: string) => void;
  method: string;
  onSelectMethod: (m: string) => void;
}

const VARIABLES = [
  { id: "rainfall", label: "Precipitation" },
  { id: "tmax", label: "Max Temp" },
  { id: "tmin", label: "Min Temp" },
  { id: "wind_speed", label: "Wind Speed" }
];

const SEASONS = [
  { id: "JJAS", label: "JJAS (Monsoon)" },
  { id: "ON", label: "ON (Post-Monsoon)" },
  { id: "DJF", label: "DJF (Winter)" },
  { id: "MAM", label: "MAM (Pre-Monsoon)" }
];

const REGIMES = [
  "Active monsoon",
  "Western Disturbance",
  "Monsoon depression",
  "Break monsoon",
  "Cyclone / Severe Storm",
  "Neutral"
];

const METHODS = [
  { id: "stacked_nnls", label: "Stacked NNLS" },
  { id: "inverse_skill", label: "Inverse-Skill" },
  { id: "equal", label: "Equal-Weight" }
];

export function WeightControls({
  variable,
  onSelectVariable,
  leadHours,
  onSelectLead,
  season,
  onSelectSeason,
  regime,
  onSelectRegime,
  method,
  onSelectMethod
}: WeightControlsProps) {
  return (
    <GlassCard className="p-4 flex flex-col md:flex-row md:items-center justify-between gap-4 border-cyan-500/20">
      {/* 1. Variable Selector */}
      <div className="flex flex-col gap-1.5">
        <label className="text-[10px] text-text-3 font-mono uppercase tracking-wider flex items-center gap-1">
          <Layers className="w-3 h-3 text-cyan-400" />
          <span>Variable</span>
        </label>
        <div className="flex items-center gap-1 bg-surface-2 p-1 rounded-lg border border-border">
          {VARIABLES.map((v) => (
            <button
              key={v.id}
              onClick={() => onSelectVariable(v.id)}
              className={`px-2.5 py-1 rounded text-xs font-medium transition-colors ${
                variable === v.id
                  ? "bg-cyan-500/20 text-cyan-300 font-semibold"
                  : "text-text-3 hover:text-text-1"
              }`}
            >
              {v.label}
            </button>
          ))}
        </div>
      </div>

      {/* 2. Lead Time Slider */}
      <div className="flex flex-col gap-1.5 min-w-[200px] flex-1 max-w-[320px]">
        <div className="flex items-center justify-between text-xs">
          <label className="text-[10px] text-text-3 font-mono uppercase tracking-wider flex items-center gap-1">
            <Clock className="w-3 h-3 text-cyan-400" />
            <span>Lead Horizon</span>
          </label>
          <span className="font-mono font-bold text-cyan-300">
            Day {leadHours / 24} (+{leadHours}h)
          </span>
        </div>
        <Slider
          min={24}
          max={240}
          step={24}
          value={leadHours}
          onChange={(v: number) => onSelectLead(v)}
          className="w-full"
        />
      </div>

      {/* 3. Season */}
      <div className="flex flex-col gap-1.5">
        <label className="text-[10px] text-text-3 font-mono uppercase tracking-wider flex items-center gap-1">
          <Sun className="w-3 h-3 text-amber-400" />
          <span>Season</span>
        </label>
        <select
          value={season}
          onChange={(e) => onSelectSeason(e.target.value)}
          className="bg-surface-2 border border-border text-text-1 rounded-lg px-2.5 py-1 text-xs font-mono outline-none"
        >
          {SEASONS.map((s) => (
            <option key={s.id} value={s.id}>
              {s.label}
            </option>
          ))}
        </select>
      </div>

      {/* 4. Synoptic Regime */}
      <div className="flex flex-col gap-1.5">
        <label className="text-[10px] text-text-3 font-mono uppercase tracking-wider flex items-center gap-1">
          <CloudRain className="w-3 h-3 text-indigo-400" />
          <span>Synoptic Regime</span>
        </label>
        <select
          value={regime}
          onChange={(e) => onSelectRegime(e.target.value)}
          className="bg-surface-2 border border-border text-text-1 rounded-lg px-2.5 py-1 text-xs font-mono outline-none"
        >
          {REGIMES.map((r) => (
            <option key={r} value={r}>
              {r}
            </option>
          ))}
        </select>
      </div>

      {/* 5. Method */}
      <div className="flex flex-col gap-1.5">
        <label className="text-[10px] text-text-3 font-mono uppercase tracking-wider flex items-center gap-1">
          <Cpu className="w-3 h-3 text-cyan-400" />
          <span>Method</span>
        </label>
        <div className="flex items-center gap-1 bg-surface-2 p-1 rounded-lg border border-border">
          {METHODS.map((m) => (
            <button
              key={m.id}
              onClick={() => onSelectMethod(m.id)}
              className={`px-2.5 py-1 rounded text-xs font-medium transition-colors ${
                method === m.id
                  ? "bg-cyan-500/20 text-cyan-300 font-semibold"
                  : "text-text-3 hover:text-text-1"
              }`}
            >
              {m.label}
            </button>
          ))}
        </div>
      </div>
    </GlassCard>
  );
}
