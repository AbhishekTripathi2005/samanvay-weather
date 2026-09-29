"use client";

import React from "react";
import { Cpu, Layers, Activity, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";

interface ModelBadgeProps {
  name: string;
  type: "NWP" | "Ensemble" | "AI" | "Blended";
  color: string;
  resolution?: string;
  className?: string;
}

export function ModelBadge({
  name,
  type,
  color,
  resolution,
  className,
}: ModelBadgeProps) {
  const typeIcons = {
    NWP: <Activity className="h-3 w-3" />,
    Ensemble: <Layers className="h-3 w-3" />,
    AI: <Cpu className="h-3 w-3" />,
    Blended: <Sparkles className="h-3 w-3" />,
  };

  return (
    <div
      className={cn(
        "inline-flex items-center space-x-1.5 rounded-lg border px-2.5 py-1 text-xs font-mono font-medium backdrop-blur-sm",
        className
      )}
      style={{
        backgroundColor: `${color}15`,
        borderColor: `${color}40`,
        color: color,
      }}
    >
      <span className="h-2 w-2 rounded-full" style={{ backgroundColor: color }} />
      <span className="font-bold text-[var(--text-1)]">{name}</span>
      <span
        className="flex items-center space-x-0.5 rounded px-1 text-[10px]"
        style={{ backgroundColor: `${color}25` }}
      >
        {typeIcons[type]}
        <span>{type}</span>
      </span>
      {resolution && (
        <span className="text-[10px] text-[var(--text-3)] font-normal">
          ({resolution})
        </span>
      )}
    </div>
  );
}
