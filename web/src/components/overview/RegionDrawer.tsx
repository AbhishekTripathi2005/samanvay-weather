"use client";

import React from "react";
import { Drawer } from "@/components/ui/Drawer";
import { AlertBadge } from "@/components/ui/AlertBadge";
import { ModelBadge } from "@/components/ui/ModelBadge";
import { AlertLevel } from "@/lib/types";
import { ShieldAlert, TrendingUp, Users, CloudRain, ExternalLink } from "lucide-react";
import Link from "next/link";

export interface RegionDetailData {
  code: string;
  name: string;
  zone: string;
  value: number;
  p10: number;
  p90: number;
  alertLevel: AlertLevel;
  dominantModel: string;
  variable: string;
  leadHours: number;
}

interface RegionDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  data: RegionDetailData | null;
}

export function RegionDrawer({ isOpen, onClose, data }: RegionDrawerProps) {
  if (!data) return null;

  const unit = data.variable === "rainfall" ? "mm/24h" : data.variable === "wind_speed" ? "km/h" : "°C";

  // Plausible synthetic single-model spreads for this region
  const modelSpreads = [
    { model: "samanvay", name: "SAMANVAY Consensus", val: data.value, weight: "Optimal", color: "text-cyan-400 font-bold" },
    { model: "ncum_g", name: "NCUM-G (NWP)", val: Math.max(0, data.value * 1.12 + 1.2), weight: "26%", color: "text-text-2" },
    { model: "neps", name: "NEPS (Ensemble)", val: Math.max(0, data.value * 0.98 + 0.8), weight: "24%", color: "text-text-2" },
    { model: "graphcast", name: "GraphCast (AI)", val: Math.max(0, data.value * 0.86 - 0.5), weight: "18%", color: "text-text-2" },
    { model: "ecmwf_ifs", name: "ECMWF-IFS (NWP)", val: Math.max(0, data.value * 1.05 + 0.4), weight: "14%", color: "text-text-2" },
    { model: "pangu", name: "Pangu-Weather (AI)", val: Math.max(0, data.value * 0.88 - 0.2), weight: "10%", color: "text-text-2" },
    { model: "fourcastnet", name: "FourCastNet (AI)", val: Math.max(0, data.value * 0.84 - 0.8), weight: "8%", color: "text-text-2" }
  ];

  const sopText =
    data.alertLevel === "RED"
      ? "Immediate activation of district emergency operations center (DEOC). Evacuate low-lying river corridors and steep slope settlements. Position NDRF/SDRF rescue boats."
      : data.alertLevel === "ORANGE"
      ? "Issue warning to local disaster managers. Pre-position de-watering equipment, inspect retaining structures, restrict traffic on vulnerable mountain passes."
      : data.alertLevel === "YELLOW"
      ? "Maintain weather watch. Alert municipal drainage squads and monitor tributary stream gauges."
      : "Normal operational watch. Standard agro-meteorological advisories apply.";

  return (
    <Drawer isOpen={isOpen} onClose={onClose} title={`${data.name} (${data.code})`} side="right">
      <div className="flex flex-col gap-6 py-2">
        {/* Header Region Badge */}
        <div className="flex items-center justify-between p-3.5 rounded-xl bg-surface-2/80 border border-border">
          <div>
            <span className="text-[11px] font-mono text-cyan-400 uppercase tracking-wider">
              {data.zone}
            </span>
            <div className="text-xl font-bold text-text-1">{data.name}</div>
          </div>
          <AlertBadge level={data.alertLevel} />
        </div>

        {/* Consensus Metric Box */}
        <div className="p-4 rounded-xl bg-cyan-950/20 border border-cyan-500/40 flex flex-col gap-2">
          <span className="text-xs font-mono text-cyan-300 font-semibold">
            SAMANVAY Point Consensus (+{data.leadHours}h)
          </span>
          <div className="flex items-baseline gap-2">
            <span className="text-4xl font-extrabold text-cyan-400 font-mono">
              {data.value.toFixed(1)}
            </span>
            <span className="text-sm font-semibold text-text-2 font-mono">{unit}</span>
          </div>
          <div className="flex items-center justify-between text-xs font-mono text-text-3 pt-2 border-t border-cyan-500/20">
            <span>P10: {data.p10.toFixed(1)} {unit}</span>
            <span>P90: {data.p90.toFixed(1)} {unit}</span>
          </div>
        </div>

        {/* Multi-Model Breakdown */}
        <div className="flex flex-col gap-2.5">
          <span className="text-xs font-mono text-text-3 uppercase tracking-wider font-semibold">
            Source Model Predictions & Weights
          </span>
          <div className="flex flex-col gap-1.5 border border-border/80 rounded-xl p-3 bg-surface-2/40">
            {modelSpreads.map((m) => (
              <div key={m.model} className="flex items-center justify-between py-1.5 border-b border-border/30 last:border-none text-xs font-mono">
                <div className="flex items-center gap-2">
                  <ModelBadge model={m.model} size="sm" />
                  <span className={m.color}>{m.name}</span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-text-3 text-[11px]">wt: {m.weight}</span>
                  <span className="font-bold text-text-1">{m.val.toFixed(1)}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Standard Operating Procedure Advisory */}
        <div className="p-4 rounded-xl bg-surface-2/80 border border-border flex flex-col gap-2">
          <div className="flex items-center gap-2 text-xs font-bold text-amber-400">
            <ShieldAlert className="w-4 h-4" />
            <span>Recommended SOP Action Protocol</span>
          </div>
          <p className="text-xs text-text-2 leading-relaxed">
            {sopText}
          </p>
        </div>

        {/* Jump Link */}
        <Link
          href={`/extremes?region=${data.code}&lead=${data.leadHours}`}
          className="w-full py-2.5 rounded-xl bg-surface-2 hover:bg-surface-3 border border-border text-xs font-semibold text-cyan-400 flex items-center justify-center gap-2 transition-colors"
        >
          <span>Exceedance Attribution Analysis</span>
          <ExternalLink className="w-3.5 h-3.5" />
        </Link>
      </div>
    </Drawer>
  );
}
