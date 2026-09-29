"use client";

import React from "react";
import { useAppStore } from "@/lib/store";
import { useOpsPipelineQuery, useOpsHistoryQuery } from "@/lib/queries";
import { GlassCard } from "@/components/ui/GlassCard";
import { MagneticButton } from "@/components/ui/MagneticButton";
import { Play, CheckCircle2, Cpu } from "lucide-react";

export default function OpsPipelinePage() {
  const { setIsRunBlendOpen } = useAppStore();
  const { data: pipelineData } = useOpsPipelineQuery();
  const { data: historyData } = useOpsHistoryQuery(15);

  const pipelines = pipelineData?.pipelines || [];
  const runs = historyData?.runs || [];

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-text-1 tracking-tight">Operational Ingestion Pipeline</h1>
          <p className="text-xs text-text-3">
            Real-time DAG Status for 7 Forecast Sources • Automated Fallback & Validation Harness
          </p>
        </div>

        <MagneticButton
          onClick={() => setIsRunBlendOpen(true)}
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-cyan-500 to-indigo-600 text-white font-bold text-xs shadow-lg shadow-cyan-500/25 hover:opacity-95"
        >
          <Play className="w-3.5 h-3.5 fill-current" />
          <span>Trigger Synthetic Run</span>
        </MagneticButton>
      </div>

      {/* 7 Models Status Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {pipelines.map((p) => (
          <GlassCard key={p.id} className="p-4 flex flex-col justify-between">
            <div className="flex items-center justify-between mb-2">
              <span className="font-bold text-sm text-text-1">{p.name}</span>
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            </div>
            <div className="text-xs text-text-3">{p.full_name}</div>
            <div className="flex items-center justify-between text-[11px] font-mono border-t border-border/40 pt-2 mt-3 text-text-2">
              <span>Latency:</span>
              <span className="text-cyan-400 font-bold">{p.latency_ms}ms</span>
            </div>
          </GlassCard>
        ))}
      </div>

      {/* Execution Logs Table */}
      <GlassCard className="p-4 flex flex-col gap-3">
        <h3 className="text-sm font-semibold text-text-1">Recent Operational Executions</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-border/60 text-text-3 font-medium">
                <th className="py-2 px-3">Run ID</th>
                <th className="py-2 px-2">Cycle</th>
                <th className="py-2 px-2">Duration</th>
                <th className="py-2 px-2">Sources Synced</th>
                <th className="py-2 px-2">Alerts Issued</th>
                <th className="py-2 px-2">Status</th>
              </tr>
            </thead>
            <tbody>
              {runs.map((r) => (
                <tr key={r.run_id} className="border-b border-border/20 hover:bg-surface-2/40">
                  <td className="py-2.5 px-3 font-mono text-cyan-400 font-medium">{r.run_id}</td>
                  <td className="py-2.5 px-2 text-text-2">{r.cycle}</td>
                  <td className="py-2.5 px-2 font-mono text-text-1">{r.duration_ms}ms</td>
                  <td className="py-2.5 px-2 font-mono text-emerald-400">7 / 7</td>
                  <td className="py-2.5 px-2 font-mono text-rose-400 font-bold">{r.active_alerts}</td>
                  <td className="py-2.5 px-2">
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 font-bold">
                      {r.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </GlassCard>
    </div>
  );
}
