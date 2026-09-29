"use client";

import React, { useEffect } from "react";
import { Play, Pause, FastForward, CloudRain, Sun, Moon, Wind, Zap, Layers } from "lucide-react";
import { useOpsStore } from "@/lib/store";
import { VARIABLES_LIST, LEAD_HOURS, REGIMES_LIST, SEASONS_LIST } from "@/lib/constants";

export function ControlBar() {
  const {
    variable,
    lead,
    regime,
    season,
    isAutoAdvancing,
    setVariable,
    setLead,
    setRegime,
    setSeason,
    setIsAutoAdvancing
  } = useOpsStore();

  // Auto-play lead times
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isAutoAdvancing) {
      interval = setInterval(() => {
        const currentLead = useOpsStore.getState().lead;
        const idx = LEAD_HOURS.indexOf(currentLead);
        const nextIdx = (idx + 1) % LEAD_HOURS.length;
        setLead(LEAD_HOURS[nextIdx]);
      }, 2000);
    }
    return () => clearInterval(interval);
  }, [isAutoAdvancing, setLead]);

  const varIcons: Record<string, React.ReactNode> = {
    rainfall: <CloudRain className="h-3.5 w-3.5" />,
    tmax: <Sun className="h-3.5 w-3.5" />,
    tmin: <Moon className="h-3.5 w-3.5" />,
    wind_speed: <Wind className="h-3.5 w-3.5" />,
    wind_gust: <Zap className="h-3.5 w-3.5" />
  };

  return (
    <div className="w-full bg-[#0B1222]/80 border-b border-cyan-500/20 backdrop-blur-md px-4 py-2.5">
      <div className="mx-auto max-w-7xl flex flex-wrap items-center justify-between gap-3">
        {/* Variable Switcher */}
        <div className="flex items-center space-x-1 bg-slate-900/80 p-1 rounded-lg border border-slate-800">
          {VARIABLES_LIST.map((v) => {
            const isSelected = variable === v.id;
            return (
              <button
                key={v.id}
                onClick={() => setVariable(v.id)}
                className={`flex items-center space-x-1.5 px-2.5 py-1 rounded-md text-xs font-medium transition ${
                  isSelected
                    ? "bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 shadow-[0_0_10px_rgba(6,182,212,0.25)]"
                    : "text-slate-400 hover:text-slate-200"
                }`}
              >
                {varIcons[v.id]}
                <span>{v.short_name}</span>
              </button>
            );
          })}
        </div>

        {/* Lead Scrubber */}
        <div className="flex items-center space-x-3 bg-slate-900/80 px-3 py-1 rounded-lg border border-slate-800">
          <button
            onClick={() => setIsAutoAdvancing(!isAutoAdvancing)}
            className="text-cyan-400 hover:text-cyan-300 transition"
            title={isAutoAdvancing ? "Pause Animation" : "Play Lead Sequence"}
          >
            {isAutoAdvancing ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
          </button>

          <div className="flex items-center space-x-2">
            <span className="font-mono text-xs font-bold text-cyan-400 whitespace-nowrap">
              +{lead}h (Day {lead / 24})
            </span>
            <input
              type="range"
              min="24"
              max="240"
              step="24"
              value={lead}
              onChange={(e) => setLead(parseInt(e.target.value, 10))}
              className="w-28 sm:w-36 h-1.5 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-cyan-400"
            />
          </div>

          {/* Quick lead pills */}
          <div className="hidden md:flex items-center space-x-1">
            {[24, 72, 120, 240].map((l) => (
              <button
                key={l}
                onClick={() => setLead(l)}
                className={`px-1.5 py-0.5 font-mono text-[10px] rounded ${
                  lead === l
                    ? "bg-cyan-500/30 text-cyan-200 border border-cyan-500/50"
                    : "text-slate-500 hover:text-slate-300"
                }`}
              >
                +{l}h
              </button>
            ))}
          </div>
        </div>

        {/* Regime and Season Selectors */}
        <div className="flex items-center space-x-2">
          {/* Regime */}
          <div className="flex items-center space-x-1.5 bg-slate-900/80 px-2 py-1 rounded-lg border border-slate-800">
            <Layers className="h-3.5 w-3.5 text-violet-400" />
            <select
              value={regime}
              onChange={(e) => setRegime(e.target.value)}
              className="bg-transparent text-xs text-slate-200 font-medium focus:outline-none cursor-pointer"
            >
              {REGIMES_LIST.map((r) => (
                <option key={r} value={r} className="bg-slate-900 text-slate-200">
                  Regime: {r}
                </option>
              ))}
            </select>
          </div>

          {/* Season */}
          <div className="hidden sm:flex items-center space-x-1.5 bg-slate-900/80 px-2 py-1 rounded-lg border border-slate-800">
            <select
              value={season}
              onChange={(e) => setSeason(e.target.value)}
              className="bg-transparent text-xs text-slate-200 font-medium focus:outline-none cursor-pointer"
            >
              {SEASONS_LIST.map((s) => (
                <option key={s.id} value={s.id} className="bg-slate-900 text-slate-200">
                  {s.id} ({s.name.split(" ")[0]})
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>
    </div>
  );
}
