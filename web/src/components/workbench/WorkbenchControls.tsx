"use client";

import React from "react";
import { GlassCard } from "@/components/ui/GlassCard";
import { Slider } from "@/components/ui/Slider";
import { Combobox } from "@/components/ui/Combobox";
import { SegmentedControl } from "@/components/ui/SegmentedControl";
import { MapPin, Sliders, Calendar, Clock, Layers, Sparkles } from "lucide-react";
import { RegionState } from "@/lib/types";

interface WorkbenchControlsProps {
  states: RegionState[];
  selectedRegion: string;
  onSelectRegion: (code: string) => void;
  variable: string;
  onSelectVariable: (v: string) => void;
  leadHours: number;
  onSelectLead: (lead: number) => void;
  cycle: string;
  onSelectCycle: (c: string) => void;
  method: string;
  onSelectMethod: (m: string) => void;
  halfLife: number;
  onSelectHalfLife: (hl: number) => void;
  temperature: number;
  onSelectTemperature: (t: number) => void;
}

const VARIABLES = [
  { id: "rainfall", label: "Precipitation", unit: "mm/24h" },
  { id: "tmax", label: "Max Temp (Tmax)", unit: "°C" },
  { id: "tmin", label: "Min Temp (Tmin)", unit: "°C" },
  { id: "wind_speed", label: "Wind Speed", unit: "km/h" },
  { id: "wind_gust", label: "Peak Gust", unit: "km/h" }
];

const METHODS = [
  { id: "stacked_nnls", label: "Stacked NNLS" },
  { id: "inverse_skill", label: "Inverse-Skill" },
  { id: "equal", label: "Equal-Weight" }
];

export function WorkbenchControls({
  states,
  selectedRegion,
  onSelectRegion,
  variable,
  onSelectVariable,
  leadHours,
  onSelectLead,
  cycle,
  onSelectCycle,
  method,
  onSelectMethod,
  halfLife,
  onSelectHalfLife,
  temperature,
  onSelectTemperature
}: WorkbenchControlsProps) {
  const currentState = states.find((s) => s.code === selectedRegion) || states[0];

  const stateOptions = states.map((s) => ({
    value: s.code,
    label: `${s.name} (${s.code}) - ${s.zone}`
  }));

  return (
    <div className="flex flex-col gap-4">
      {/* 1. Point / Region Picker */}
      <GlassCard className="p-4 flex flex-col gap-3 border-cyan-500/20">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <MapPin className="w-4 h-4 text-cyan-400" />
            <h3 className="text-sm font-semibold text-text-1">Regional Target</h3>
          </div>
          <span className="text-[10px] font-mono text-cyan-400/80 uppercase px-1.5 py-0.5 rounded bg-cyan-950/40 border border-cyan-500/20">
            {currentState?.zone || "All India"}
          </span>
        </div>

        <div className="w-full">
          <label className="text-[11px] text-text-3 font-medium block mb-1">State / UT Target</label>
          <Combobox
            options={stateOptions}
            value={selectedRegion}
            onChange={(val: string) => onSelectRegion(val)}
            placeholder="Search 36 States & UTs..."
            className="w-full"
          />
        </div>

        {currentState && (
          <div className="grid grid-cols-2 gap-2 p-2 rounded bg-surface-2/60 border border-border/50 text-[11px] font-mono">
            <div>
              <span className="text-text-3 block text-[10px]">Terrain Class</span>
              <span className="text-text-1 truncate block font-medium">{currentState.terrain}</span>
            </div>
            <div>
              <span className="text-text-3 block text-[10px]">Population</span>
              <span className="text-text-1 block font-medium">{currentState.pop_millions}M</span>
            </div>
            <div>
              <span className="text-text-3 block text-[10px]">Latitude</span>
              <span className="text-text-2">{currentState.lat.toFixed(2)}° N</span>
            </div>
            <div>
              <span className="text-text-3 block text-[10px]">Longitude</span>
              <span className="text-text-2">{currentState.lon.toFixed(2)}° E</span>
            </div>
          </div>
        )}
      </GlassCard>

      {/* 2. Meteorological Variable Selector */}
      <GlassCard className="p-4 flex flex-col gap-3">
        <div className="flex items-center gap-2">
          <Layers className="w-4 h-4 text-cyan-400" />
          <h3 className="text-sm font-semibold text-text-1">Forecast Variable</h3>
        </div>

        <div className="grid grid-cols-1 gap-1.5">
          {VARIABLES.map((v) => {
            const isSelected = variable === v.id;
            return (
              <button
                key={v.id}
                onClick={() => onSelectVariable(v.id)}
                className={`flex items-center justify-between px-3 py-2 rounded-lg text-xs font-medium transition-all text-left ${
                  isSelected
                    ? "bg-cyan-500/15 border border-cyan-500/40 text-cyan-300 shadow-[0_0_12px_rgba(6,182,212,0.15)]"
                    : "bg-surface-1/60 border border-border/40 text-text-2 hover:bg-surface-2 hover:text-text-1"
                }`}
              >
                <span>{v.label}</span>
                <span className="text-[10px] font-mono opacity-60">{v.unit}</span>
              </button>
            );
          })}
        </div>
      </GlassCard>

      {/* 3. Lead Time & Cycle */}
      <GlassCard className="p-4 flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-cyan-400" />
            <h3 className="text-sm font-semibold text-text-1">Temporal Scope</h3>
          </div>
          <span className="text-xs font-mono font-bold text-cyan-400 bg-cyan-950/60 px-2 py-0.5 rounded border border-cyan-500/30">
            Day {leadHours / 24} (+{leadHours}h)
          </span>
        </div>

        <div>
          <div className="flex justify-between text-xs text-text-3 mb-2 font-mono">
            <span>Day 1 (24h)</span>
            <span>Day 5 (120h)</span>
            <span>Day 10 (240h)</span>
          </div>
          <Slider
            min={24}
            max={240}
            step={24}
            value={leadHours}
            onChange={(val: number) => onSelectLead(val)}
            className="w-full"
          />
        </div>

        <div>
          <label className="text-[11px] text-text-3 font-medium block mb-1.5">Model Cycle Init</label>
          <div className="grid grid-cols-2 gap-2">
            {["00Z", "12Z"].map((c) => (
              <button
                key={c}
                onClick={() => onSelectCycle(c)}
                className={`py-1.5 px-3 rounded text-xs font-mono font-medium transition-colors ${
                  cycle === c
                    ? "bg-cyan-500/20 border border-cyan-400/50 text-cyan-300"
                    : "bg-surface-2 border border-border/40 text-text-3 hover:text-text-1"
                }`}
              >
                {c} Operational
              </button>
            ))}
          </div>
        </div>
      </GlassCard>

      {/* 4. Blending Architecture & Hyperparameters */}
      <GlassCard className="p-4 flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sliders className="w-4 h-4 text-cyan-400" />
            <h3 className="text-sm font-semibold text-text-1">Blending Engine</h3>
          </div>
          <Sparkles className="w-3.5 h-3.5 text-accent-glow" />
        </div>

        <div>
          <label className="text-[11px] text-text-3 font-medium block mb-1.5">Stacking Algorithm</label>
          <div className="flex flex-col gap-1.5">
            {METHODS.map((m) => (
              <button
                key={m.id}
                onClick={() => onSelectMethod(m.id)}
                className={`px-3 py-1.5 rounded text-xs text-left transition-colors flex items-center justify-between ${
                  method === m.id
                    ? "bg-cyan-500/20 border border-cyan-400/40 text-cyan-300 font-semibold"
                    : "bg-surface-1 border border-border/40 text-text-3 hover:text-text-1"
                }`}
              >
                <span>{m.label}</span>
                {method === m.id && <span className="w-1.5 h-1.5 rounded-full bg-cyan-400" />}
              </button>
            ))}
          </div>
        </div>

        {/* Hyperparameter 1: Half-life tau */}
        <div className="flex flex-col gap-1.5 pt-2 border-t border-border/40">
          <div className="flex items-center justify-between text-xs">
            <span className="text-text-2 font-mono">Half-Life (τ)</span>
            <span className="font-mono text-cyan-400 font-semibold">{halfLife} days</span>
          </div>
          <Slider
            min={3}
            max={30}
            step={1}
            value={halfLife}
            onChange={(v: number) => onSelectHalfLife(v)}
            className="w-full"
          />
          <p className="text-[10px] text-text-3">Exponential decay memory window for historical skill weighting</p>
        </div>

        {/* Hyperparameter 2: Softmax Temperature T */}
        <div className="flex flex-col gap-1.5 pt-2 border-t border-border/40">
          <div className="flex items-center justify-between text-xs">
            <span className="text-text-2 font-mono">Temperature (T)</span>
            <span className="font-mono text-cyan-400 font-semibold">{temperature.toFixed(2)}</span>
          </div>
          <Slider
            min={0.1}
            max={2.0}
            step={0.05}
            value={temperature}
            onChange={(v: number) => onSelectTemperature(v)}
            className="w-full"
          />
          <p className="text-[10px] text-text-3">Entropy sharpening: low T concentrates on top model, high T flattens</p>
        </div>
      </GlassCard>
    </div>
  );
}
