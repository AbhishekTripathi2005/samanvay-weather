"use client";

import React from "react";
import { Play, Pause } from "lucide-react";
import { cn } from "@/lib/utils";

interface LeadSliderProps {
  value: number; // 24 to 240
  onChange: (val: number) => void;
  isPlaying?: boolean;
  onTogglePlay?: () => void;
  className?: string;
}

export function LeadSlider({
  value,
  onChange,
  isPlaying = false,
  onTogglePlay,
  className,
}: LeadSliderProps) {
  const steps = [24, 48, 72, 96, 120, 144, 168, 192, 216, 240];

  return (
    <div className={cn("flex flex-col space-y-2 w-full", className)}>
      <div className="flex items-center justify-between font-mono text-xs">
        <div className="flex items-center space-x-2">
          {onTogglePlay && (
            <button
              onClick={onTogglePlay}
              aria-label={isPlaying ? "Pause Forecast Evolution" : "Play Forecast Evolution"}
              className="flex h-7 w-7 items-center justify-center rounded-md border border-[var(--border)] bg-[var(--surface-1)] text-[var(--accent-cyan)] hover:border-[var(--accent-cyan)]"
            >
              {isPlaying ? <Pause className="h-3.5 w-3.5" /> : <Play className="h-3.5 w-3.5" />}
            </button>
          )}
          <span className="font-bold text-[var(--accent-cyan)]">
            +{value}h (Day {value / 24})
          </span>
        </div>
        <span className="text-[var(--text-3)] text-[11px]">
          Lead Horizon: 24h to 240h
        </span>
      </div>

      {/* Slider Bar */}
      <div className="relative w-full py-1">
        <input
          type="range"
          aria-label="Forecast lead time in hours"
          min="24"
          max="240"
          step="24"
          value={value}
          onChange={(e) => onChange(parseInt(e.target.value, 10))}
          className="w-full h-2 bg-[var(--surface-3)] rounded-lg appearance-none cursor-pointer accent-[var(--accent-cyan)]"
        />

        {/* Ticks */}
        <div className="flex justify-between w-full font-mono text-[9px] text-[var(--text-3)] px-1 mt-1">
          {steps.map((s) => (
            <span
              key={s}
              onClick={() => onChange(s)}
              className={cn(
                "cursor-pointer hover:text-[var(--text-1)]",
                value === s ? "text-[var(--accent-cyan)] font-bold" : ""
              )}
            >
              D{s / 24}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}
