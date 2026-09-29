"use client";

import React from "react";
import { Cpu, Layers, Activity, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";

const MODEL_REGISTRY: Record<string, { name: string; type: "NWP" | "Ensemble" | "AI" | "Blended"; color: string; resolution?: string }> = {
  samanvay: { name: "SAMANVAY", type: "Blended", color: "#00F5FF", resolution: "0.5°" },
  ncum_g: { name: "NCUM-G", type: "NWP", color: "#00C2FF", resolution: "12km" },
  neps: { name: "NEPS", type: "Ensemble", color: "#3B82F6", resolution: "12km (21-M)" },
  imd_gfs: { name: "IMD-GFS", type: "NWP", color: "#10B981", resolution: "12km" },
  ecmwf_ifs: { name: "ECMWF-IFS", type: "NWP", color: "#6366F1", resolution: "9km" },
  graphcast: { name: "GraphCast", type: "AI", color: "#8B5CF6", resolution: "0.25°" },
  pangu: { name: "Pangu-Weather", type: "AI", color: "#EC4899", resolution: "0.25°" },
  fourcastnet: { name: "FourCastNet", type: "AI", color: "#F43F5E", resolution: "0.25°" }
};

export interface ModelBadgeProps {
  model?: string;
  name?: string;
  type?: "NWP" | "Ensemble" | "AI" | "Blended";
  color?: string;
  resolution?: string;
  size?: "sm" | "md";
  className?: string;
}

export function ModelBadge({
  model,
  name,
  type,
  color,
  resolution,
  size = "md",
  className
}: ModelBadgeProps) {
  const meta = model && MODEL_REGISTRY[model.toLowerCase()] ? MODEL_REGISTRY[model.toLowerCase()] : null;
  const finalName = name || meta?.name || model || "Unknown";
  const finalType = type || meta?.type || "NWP";
  const finalColor = color || meta?.color || "#00F5FF";
  const finalResolution = resolution || meta?.resolution;

  const typeIcons = {
    NWP: <Activity className={size === "sm" ? "h-2.5 w-2.5" : "h-3 w-3"} />,
    Ensemble: <Layers className={size === "sm" ? "h-2.5 w-2.5" : "h-3 w-3"} />,
    AI: <Cpu className={size === "sm" ? "h-2.5 w-2.5" : "h-3 w-3"} />,
    Blended: <Sparkles className={size === "sm" ? "h-2.5 w-2.5" : "h-3 w-3"} />
  };

  return (
    <div
      className={cn(
        "inline-flex items-center space-x-1.5 rounded-lg border font-mono font-medium backdrop-blur-sm",
        size === "sm" ? "px-2 py-0.5 text-[10px]" : "px-2.5 py-1 text-xs",
        className
      )}
      style={{
        backgroundColor: `${finalColor}15`,
        borderColor: `${finalColor}40`,
        color: finalColor
      }}
    >
      <span className={size === "sm" ? "h-1.5 w-1.5 rounded-full" : "h-2 w-2 rounded-full"} style={{ backgroundColor: finalColor }} />
      <span className="font-bold text-[var(--text-1)]">{finalName}</span>
      <span
        className="flex items-center space-x-0.5 rounded px-1 text-[9px]"
        style={{ backgroundColor: `${finalColor}25` }}
      >
        {typeIcons[finalType]}
        <span className="font-semibold">{finalType}</span>
      </span>
      {finalResolution && (
        <span className="text-[9px] opacity-75">{finalResolution}</span>
      )}
    </div>
  );
}
