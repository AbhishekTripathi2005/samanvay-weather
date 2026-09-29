"use client";

import React from "react";
import { AlertTriangle, AlertOctagon, CheckCircle2, Flame, Wind, Droplets } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { fetchExtremesBulletin } from "@/lib/api";
import { useOpsStore } from "@/lib/store";
import Link from "next/link";

export function AlertsTicker() {
  const { lead, regime, season } = useOpsStore();
  const { data: bulletin } = useQuery({
    queryKey: ["bulletin", lead, regime, season],
    queryFn: () => fetchExtremesBulletin(lead, regime, season),
    staleTime: 30000
  });

  const redCount = bulletin?.summary.red_alerts ?? 0;
  const orangeCount = bulletin?.summary.orange_alerts ?? 0;
  const yellowCount = bulletin?.summary.yellow_watches ?? 0;

  const topThreat = bulletin?.states.find((s) => s.alert_level === "RED") || bulletin?.states.find((s) => s.alert_level === "ORANGE");

  return (
    <div className="w-full bg-[#0B1222] border-b border-cyan-500/20 px-4 py-1.5 flex items-center justify-between text-xs overflow-hidden">
      <div className="flex items-center space-x-3 overflow-hidden">
        {/* Ticker Tag */}
        <div className="flex items-center space-x-1.5 flex-shrink-0 bg-red-950/50 border border-red-500/40 text-red-400 px-2 py-0.5 rounded font-mono font-semibold tracking-wider text-[11px]">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500"></span>
          </span>
          <span>IMD CRITERIA ALERT</span>
        </div>

        {/* Alert Ticker Message */}
        <div className="truncate text-slate-300 text-[12px] flex items-center space-x-2">
          {topThreat ? (
            <span>
              <strong className="text-red-400 font-semibold">{topThreat.name} ({topThreat.alert_level}):</strong> {topThreat.primary_hazard} — {topThreat.sop_action.slice(0, 85)}...
            </span>
          ) : (
            <span className="text-emerald-400 flex items-center space-x-1">
              <CheckCircle2 className="h-3.5 w-3.5" />
              <span>Normal synoptic flow; no critical IMD red thresholds exceeded at +{lead}h.</span>
            </span>
          )}
        </div>
      </div>

      {/* Pill summary badges */}
      <div className="hidden sm:flex items-center space-x-2 flex-shrink-0 font-mono text-[11px]">
        <Link href="/dss" className="flex items-center space-x-1 rounded bg-red-500/15 border border-red-500/30 px-2 py-0.5 text-red-400 hover:bg-red-500/25 transition">
          <AlertOctagon className="h-3 w-3" />
          <span>{redCount} RED</span>
        </Link>
        <Link href="/dss" className="flex items-center space-x-1 rounded bg-amber-500/15 border border-amber-500/30 px-2 py-0.5 text-amber-400 hover:bg-amber-500/25 transition">
          <AlertTriangle className="h-3 w-3" />
          <span>{orangeCount} ORANGE</span>
        </Link>
        <Link href="/dss" className="flex items-center space-x-1 rounded bg-yellow-500/15 border border-yellow-500/30 px-2 py-0.5 text-yellow-400 hover:bg-yellow-500/25 transition">
          <span>{yellowCount} WATCH</span>
        </Link>
      </div>
    </div>
  );
}
