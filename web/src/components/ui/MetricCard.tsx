"use client";

import React, { useEffect, useState } from "react";
import { ArrowUpRight, ArrowDownRight, Info } from "lucide-react";
import { GlassCard } from "./GlassCard";
import { Tooltip } from "./Tooltip";
import { cn } from "@/lib/utils";

interface MetricCardProps {
  label: string;
  value: number | string;
  unit?: string;
  decimals?: number;
  delta?: {
    value: number | string;
    isPositive?: boolean;
    isPositiveGood?: boolean;
    period?: string;
  };
  sparklineData?: number[];
  tooltip?: string;
  accentColor?: string;
  className?: string;
}

export function MetricCard({
  label,
  value,
  unit,
  decimals = 1,
  delta,
  sparklineData = [12, 16, 14, 22, 19, 28, 25, 34, 30],
  tooltip,
  accentColor = "var(--accent-cyan)",
  className,
}: MetricCardProps) {
  const [displayValue, setDisplayValue] = useState<number>(0);

  useEffect(() => {
    let startTimestamp: number | null = null;
    const duration = 800; // ms

    const step = (timestamp: number) => {
      if (!startTimestamp) startTimestamp = timestamp;
      const progress = Math.min((timestamp - startTimestamp) / duration, 1);
      // easeOutExpo
      const ease = progress === 1 ? 1 : 1 - Math.pow(2, -10 * progress);
      if (typeof value === 'number') { setDisplayValue(ease * value); } else { setDisplayValue(parseFloat(value) || 0); }
      if (progress < 1) {
        window.requestAnimationFrame(step);
      }
    };
    window.requestAnimationFrame(step);
  }, [value]);

  // Sparkline points calculation
  const minVal = Math.min(...sparklineData);
  const maxVal = Math.max(...sparklineData);
  const range = maxVal - minVal || 1;
  const width = 120;
  const height = 36;
  const points = sparklineData
    .map((d, i) => {
      const x = (i / (sparklineData.length - 1)) * width;
      const y = height - ((d - minVal) / range) * (height - 6) - 3;
      return `${x},${y}`;
    })
    .join(" ");

  const isPositive = delta ? (typeof delta.isPositive === 'boolean' ? delta.isPositive : (typeof delta.value === 'number' ? delta.value >= 0 : !delta.value.startsWith('-'))) : true;

  return (
    <GlassCard elevation={2} hoverLift className={cn("p-4 flex flex-col justify-between", className)}>
      <div className="flex items-center justify-between">
        <span className="font-mono text-xs font-semibold uppercase tracking-wider text-[var(--text-2)] flex items-center space-x-1.5">
          <span>{label}</span>
          {tooltip && (
            <Tooltip content={tooltip}>
              <Info className="h-3.5 w-3.5 text-[var(--text-3)] hover:text-[var(--text-1)] cursor-help" />
            </Tooltip>
          )}
        </span>

        {/* Delta Badge */}
        {delta && (
          <span
            className={cn(
              "flex items-center space-x-0.5 rounded px-1.5 py-0.5 font-mono text-[10px] font-bold",
              isPositive
                ? "bg-emerald-500/15 text-emerald-400 border border-emerald-500/30"
                : "bg-red-500/15 text-red-400 border border-red-500/30"
            )}
          >
            {isPositive ? (
              <ArrowUpRight className="h-3 w-3" />
            ) : (
              <ArrowDownRight className="h-3 w-3" />
            )}
            <span>
              {typeof delta.value === 'number' ? (isPositive ? `+${delta.value}%` : `${delta.value}%`) : delta.value}
            </span>
          </span>
        )}
      </div>

      <div className="my-3 flex items-baseline justify-between">
        <div className="flex items-baseline space-x-1.5">
          <span className="font-mono text-3xl font-extrabold text-[var(--text-1)]">
            {displayValue.toFixed(decimals)}
          </span>
          {unit && <span className="font-mono text-xs text-[var(--text-3)]">{unit}</span>}
        </div>

        {/* SVG Sparkline */}
        <div className="relative">
          <svg width={width} height={height} className="overflow-visible">
            <defs>
              <linearGradient id={`sparkGrad-${label}`} x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={accentColor} stopOpacity="0.4" />
                <stop offset="100%" stopColor={accentColor} stopOpacity="0.0" />
              </linearGradient>
            </defs>
            <polygon
              points={`0,${height} ${points} ${width},${height}`}
              fill={`url(#sparkGrad-${label})`}
            />
            <polyline
              points={points}
              fill="none"
              stroke={accentColor}
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </div>
      </div>

      {delta?.period && (
        <span className="text-[10px] font-mono text-[var(--text-3)]">
          Compared to {delta.period}
        </span>
      )}
    </GlassCard>
  );
}
