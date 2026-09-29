"use client";

import React from "react";
import { cn } from "@/lib/utils";

export interface SliderProps {
  min?: number;
  max?: number;
  step?: number;
  value: number;
  onChange: (val: number) => void;
  disabled?: boolean;
  className?: string;
  ariaLabel?: string;
}

export function Slider({
  min = 0,
  max = 100,
  step = 1,
  value,
  onChange,
  disabled = false,
  className,
  ariaLabel = "Slider control"
}: SliderProps) {
  return (
    <div className={cn("relative w-full flex items-center", className)}>
      <input
        type="range"
        aria-label={ariaLabel}
        min={min}
        max={max}
        step={step}
        value={value}
        disabled={disabled}
        onChange={(e) => onChange(parseFloat(e.target.value))}
        className={cn(
          "w-full h-1.5 bg-surface-3 rounded-lg appearance-none cursor-pointer accent-cyan-400 transition-opacity focus:outline-none focus:ring-1 focus:ring-cyan-400",
          disabled && "opacity-40 cursor-not-allowed"
        )}
      />
    </div>
  );
}
