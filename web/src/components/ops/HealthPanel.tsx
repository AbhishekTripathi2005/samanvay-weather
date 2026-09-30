"use client";

import React from "react";
import { Activity, Clock, AlertCircle, CheckCircle2, Zap, Server, ShieldCheck } from "lucide-react";
import { GlassCard } from "@/components/ui/GlassCard";
import type { OpsHealthResponse } from "@/lib/types";

interface Props {
  health?: OpsHealthResponse;
}

const DEFAULT_SOURCES = [
  { id: "ncum_g",      name: "NCUM-G",        type: "NWP",      freshness: "8m ago",  latency_ms: 380, error_rate: "0.01%", status: "ONLINE",  health: "HEALTHY" },
  { id: "neps",        name: "NEPS",          type: "Ensemble", freshness: "12m ago", latency_ms: 490, error_rate: "0.02%", status: "ONLINE",  health: "HEALTHY" },
  { id: "imd_gfs",     name: "IMD-GFS",       type: "NWP",      freshness: "5m ago",  latency_ms: 310, error_rate: "0.01%", status: "ONLINE",  health: "HEALTHY" },
  { id: "ecmwf_ifs",   name: "ECMWF-IFS",     type: "NWP",      freshness: "18m ago", latency_ms: 420, error_rate: "0.00%", status: "ONLINE",  health: "HEALTHY" },
  { id: "graphcast",   name: "GraphCast",     type: "AI",       freshness: "2m ago",  latency_ms: 140, error_rate: "0.00%", status: "ONLINE",  health: "HEALTHY" },
  { id: "pangu",       name: "Pangu-Weather", type: "AI",       freshness: "3m ago",  latency_ms: 110, error_rate: "0.00%", status: "ONLINE",  health: "HEALTHY" },
  { id: "fourcastnet", name: "FourCastNet",   type: "AI",       freshness: "4m ago",  latency_ms: 95,  error_rate: "0.01%", status: "ONLINE",  health: "HEALTHY" }
];

export function HealthPanel({ health }: Props) {
  const sources = health?.sources || DEFAULT_SOURCES;

  return (
    <GlassCard className="p-5 flex flex-col gap-4">
      {/* Header & Overall KPIs */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <Activity className="w-4 h-4 text-emerald-400" />
            <h3 className="text-sm font-bold text-text-1">Forecast Sources Ingestion &amp; Health</h3>
          </div>
          <p className="text-xs text-text-3 mt-0.5">
            Real-time feed freshness, endpoint network latencies, and packet error rates
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
          <span className="text-xs font-mono font-bold text-emerald-400">
            {health?.system_status || "ALL_SYSTEMS_OPERATIONAL"}
          </span>
        </div>
      </div>

      {/* KPI Cards Strip */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="p-3 rounded-xl bg-surface-2/40 border border-border/50 flex flex-col justify-between">
          <span className="text-[11px] text-text-3 flex items-center gap-1">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
            System Uptime
          </span>
          <span className="text-xl font-bold font-mono text-emerald-400 mt-1">
            {health?.uptime_pct || 99.98}%
          </span>
        </div>

        <div className="p-3 rounded-xl bg-surface-2/40 border border-border/50 flex flex-col justify-between">
          <span className="text-[11px] text-text-3 flex items-center gap-1">
            <Zap className="w-3.5 h-3.5 text-cyan-400" />
            Average Latency
          </span>
          <span className="text-xl font-bold font-mono text-cyan-400 mt-1">
            {health?.average_latency_ms || 277}ms
          </span>
        </div>

        <div className="p-3 rounded-xl bg-surface-2/40 border border-border/50 flex flex-col justify-between">
          <span className="text-[11px] text-text-3 flex items-center gap-1">
            <Clock className="w-3.5 h-3.5 text-indigo-400" />
            Queue Depth
          </span>
          <span className="text-xl font-bold font-mono text-indigo-400 mt-1">
            {health?.queue_depth ?? 0} jobs
          </span>
        </div>

        <div className="p-3 rounded-xl bg-surface-2/40 border border-border/50 flex flex-col justify-between">
          <span className="text-[11px] text-text-3 flex items-center gap-1">
            <Server className="w-3.5 h-3.5 text-violet-400" />
            Active Workers
          </span>
          <span className="text-xl font-bold font-mono text-violet-400 mt-1">
            {health?.active_workers || 8} nodes
          </span>
        </div>
      </div>

      {/* 7 Sources Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        {sources.map((s) => (
          <div
            key={s.id}
            className="p-3.5 rounded-xl bg-surface-2/30 border border-border/50 flex flex-col justify-between gap-2.5 hover:border-border transition-all"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="font-bold text-xs text-text-1">{s.name}</span>
                <span className="text-[9px] font-mono px-1.5 py-0.2 rounded bg-surface-3 text-text-3 border border-border/40">
                  {s.type}
                </span>
              </div>
              <span className="w-2 h-2 rounded-full bg-emerald-400" />
            </div>

            <div className="grid grid-cols-3 gap-1 text-[10px] font-mono border-t border-border/30 pt-2 text-text-3">
              <div>
                <div className="text-[9px] text-text-3">Freshness</div>
                <div className="text-text-2 font-bold mt-0.5">{s.freshness}</div>
              </div>
              <div>
                <div className="text-[9px] text-text-3">Latency</div>
                <div className="text-cyan-400 font-bold mt-0.5">{s.latency_ms}ms</div>
              </div>
              <div>
                <div className="text-[9px] text-text-3">Error Rate</div>
                <div className="text-emerald-400 font-bold mt-0.5">{s.error_rate}</div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </GlassCard>
  );
}
