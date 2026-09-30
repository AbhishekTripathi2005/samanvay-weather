"use client";

import React, { useState } from "react";
import {
  ComposedChart, Line, Scatter, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, Legend, ReferenceLine
} from "recharts";
import { GlassCard } from "@/components/ui/GlassCard";
import { ChevronDown, ChevronUp } from "lucide-react";
import type { RocResponse, PerfDiagramResponse, EventTimelineResponse } from "@/lib/types";

// ------------------------------------------------------------------
// ROC Curve
// ------------------------------------------------------------------
interface RocCurveProps { data: RocResponse | null; isLoading: boolean; }

function RocCurveChart({ data, isLoading }: RocCurveProps) {
  if (isLoading || !data) {
    return <div className="h-56 flex items-center justify-center text-text-3 text-xs">Loading ROC curve…</div>;
  }

  // Build combined dataset for recharts; diagonal is no-skill reference
  const allFpr = Array.from({ length: 21 }, (_, i) => i / 20);

  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center justify-between text-[11px]">
        <span className="font-semibold text-text-2">ROC Curve</span>
        <div className="flex gap-3">
          {data.curves.map((c) => (
            <span key={c.id} className="flex items-center gap-1 text-text-3">
              <span className="w-3 h-0.5 inline-block rounded" style={{ backgroundColor: c.color }} />
              {c.name} (AUC={c.auc.toFixed(3)})
            </span>
          ))}
        </div>
      </div>
      <div className="h-52 bg-surface-2/30 rounded-lg border border-border/30 p-2">
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart margin={{ top: 4, right: 8, bottom: 16, left: -10 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(148,163,184,0.08)" />
            <XAxis
              type="number" dataKey="fpr" domain={[0, 1]} ticks={[0, 0.25, 0.5, 0.75, 1]}
              tick={{ fontSize: 9, fill: "#64748b" }} label={{ value: "FPR (1-Specificity)", position: "insideBottom", offset: -8, fontSize: 9, fill: "#64748b" }}
            />
            <YAxis
              type="number" dataKey="tpr" domain={[0, 1]} ticks={[0, 0.25, 0.5, 0.75, 1]}
              tick={{ fontSize: 9, fill: "#64748b" }} label={{ value: "TPR (Sensitivity)", angle: -90, position: "insideLeft", offset: 10, fontSize: 9, fill: "#64748b" }}
            />
            <Tooltip
              formatter={(v: number, name: string) => [v.toFixed(3), name]}
              contentStyle={{ background: "rgba(15,23,42,0.95)", border: "1px solid rgba(148,163,184,0.2)", borderRadius: 8, fontSize: 10 }}
            />
            {/* No-skill diagonal */}
            <Line
              data={allFpr.map((f) => ({ fpr: f, tpr: f }))}
              type="linear" dataKey="tpr" stroke="#475569"
              strokeDasharray="4 3" strokeWidth={1} dot={false} name="No Skill"
            />
            {/* Model curves */}
            {data.curves.map((curve) => (
              <Line
                key={curve.id}
                data={curve.points}
                type="monotone" dataKey="tpr" stroke={curve.color}
                strokeWidth={curve.id === "samanvay" ? 2.5 : 1.5}
                dot={false} name={curve.name} connectNulls
              />
            ))}
          </ComposedChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

// ------------------------------------------------------------------
// Performance Diagram (POD vs Success Ratio)
// ------------------------------------------------------------------
interface PerfDiagramProps { data: PerfDiagramResponse | null; isLoading: boolean; }

function PerfDiagram({ data, isLoading }: PerfDiagramProps) {
  const [activeThreshIdx, setActiveThreshIdx] = useState(0);
  if (isLoading || !data) {
    return <div className="h-56 flex items-center justify-center text-text-3 text-xs">Loading performance diagram…</div>;
  }
  const thresh = data.thresholds[activeThreshIdx];

  // CSI isolines: CSI = POD / (1/SR + 1/POD - 1)
  const csiIsolines = [0.1, 0.3, 0.5, 0.7].map((csi) => {
    const pts: { sr: number; pod: number }[] = [];
    for (let sr = 0.05; sr <= 1; sr += 0.05) {
      const pod = csi / (1 - csi * (1 - sr) / sr);
      if (pod > 0 && pod <= 1) pts.push({ sr: Math.round(sr * 100) / 100, pod: Math.round(pod * 100) / 100 });
    }
    return { csi, pts };
  });

  const scatterData = thresh.models.map((m) => ({
    ...m,
    sr: m.success_ratio,
    name: m.name,
  }));

  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center justify-between">
        <span className="text-[11px] font-semibold text-text-2">Performance Diagram (POD vs Success Ratio)</span>
        <div className="flex gap-1">
          {data.thresholds.map((t, i) => (
            <button
              key={t.threshold}
              onClick={() => setActiveThreshIdx(i)}
              className={`text-[9px] px-2 py-0.5 rounded border font-mono transition-colors ${
                activeThreshIdx === i ? "bg-cyan-500/20 border-cyan-500/50 text-cyan-300" : "border-border text-text-3 hover:border-border/80"
              }`}
            >
              ≥{t.threshold}mm ({t.label})
            </button>
          ))}
        </div>
      </div>
      <div className="h-52 bg-surface-2/30 rounded-lg border border-border/30 p-2">
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart margin={{ top: 4, right: 8, bottom: 16, left: -10 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(148,163,184,0.08)" />
            <XAxis
              type="number" dataKey="sr" domain={[0, 1]} name="Success Ratio" ticks={[0, 0.25, 0.5, 0.75, 1]}
              tick={{ fontSize: 9, fill: "#64748b" }} label={{ value: "Success Ratio (1−FAR)", position: "insideBottom", offset: -8, fontSize: 9, fill: "#64748b" }}
            />
            <YAxis
              type="number" dataKey="pod" domain={[0, 1]} name="POD" ticks={[0, 0.25, 0.5, 0.75, 1]}
              tick={{ fontSize: 9, fill: "#64748b" }} label={{ value: "POD", angle: -90, position: "insideLeft", offset: 10, fontSize: 9, fill: "#64748b" }}
            />
            <Tooltip
              cursor={{ strokeDasharray: "3 3" }}
              content={({ active, payload }) => {
                if (!active || !payload?.length) return null;
                const d = payload[0]?.payload as typeof scatterData[0];
                return (
                  <div className="bg-surface-1 border border-border rounded-lg p-2 text-[10px] shadow-xl">
                    <div className="font-semibold text-text-1">{d?.name}</div>
                    <div className="text-text-3">POD: {d?.pod?.toFixed(3)}</div>
                    <div className="text-text-3">Success Ratio: {d?.sr?.toFixed(3)}</div>
                  </div>
                );
              }}
            />
            {/* CSI isolines */}
            {csiIsolines.map(({ csi, pts }) => (
              <Line
                key={csi}
                data={pts}
                type="monotone" dataKey="pod" stroke="rgba(148,163,184,0.2)"
                strokeWidth={1} dot={false} name={`CSI=${csi}`}
              />
            ))}
            {/* Model scatter */}
            <Scatter
              data={scatterData}
              shape={(props: unknown) => {
                const { cx, cy, payload } = props as { cx: number; cy: number; payload: typeof scatterData[0] };
                const isBlend = payload.is_blend;
                return (
                  <g>
                    <circle
                      cx={cx} cy={cy}
                      r={isBlend ? 8 : 5}
                      fill={payload.color}
                      stroke={isBlend ? "#22d3ee" : "rgba(255,255,255,0.3)"}
                      strokeWidth={isBlend ? 2 : 1}
                      opacity={0.9}
                    />
                    <text x={cx + 8} y={cy + 4} fontSize={8} fill="#94a3b8">{payload.name.split(" ")[0]}</text>
                  </g>
                );
              }}
            />
          </ComposedChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

// ------------------------------------------------------------------
// Event Timeline (90-day hit/miss/false alarm calendar)
// ------------------------------------------------------------------
interface EventTimelineProps { data: EventTimelineResponse | null; isLoading: boolean; }

const OUTCOME_CONFIG = {
  hit:          { label: "Hit",          color: "#22d3ee", textColor: "text-cyan-400",    bg: "bg-cyan-500/20",    symbol: "●" },
  miss:         { label: "Miss",         color: "#f59e0b", textColor: "text-amber-400",   bg: "bg-amber-500/20",   symbol: "○" },
  false_alarm:  { label: "False Alarm",  color: "#ef4444", textColor: "text-red-400",     bg: "bg-red-500/20",     symbol: "✕" },
  correct_null: { label: "Correct Null", color: "#334155", textColor: "text-slate-500",   bg: "bg-slate-700/20",   symbol: "·" },
};

function EventTimelineChart({ data, isLoading }: EventTimelineProps) {
  if (isLoading || !data) {
    return <div className="h-32 flex items-center justify-center text-text-3 text-xs">Loading event timeline…</div>;
  }

  const summary = [
    { label: "Hits",         val: data.hits,         color: "text-cyan-400" },
    { label: "Misses",       val: data.misses,        color: "text-amber-400" },
    { label: "False Alarms", val: data.false_alarms,  color: "text-red-400" },
    { label: "POD",          val: `${(data.pod * 100).toFixed(1)}%`,  color: "text-emerald-400" },
    { label: "FAR",          val: `${(data.far * 100).toFixed(1)}%`,  color: "text-rose-400" },
  ];

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <span className="text-[11px] font-semibold text-text-2">90-Day Event Timeline (Hit / Miss / False Alarm)</span>
        <div className="flex gap-2">
          {Object.entries(OUTCOME_CONFIG).filter(([k]) => k !== "correct_null").map(([k, v]) => (
            <span key={k} className={`text-[9px] font-mono flex items-center gap-1 ${v.textColor}`}>
              {v.symbol} {v.label}
            </span>
          ))}
        </div>
      </div>

      {/* Stats row */}
      <div className="flex gap-3">
        {summary.map((s) => (
          <div key={s.label} className="flex flex-col items-center">
            <span className={`text-sm font-bold font-mono ${s.color}`}>{s.val}</span>
            <span className="text-[9px] text-text-3">{s.label}</span>
          </div>
        ))}
      </div>

      {/* Calendar dots — 30 per row × 3 rows */}
      <div
        className="flex flex-wrap gap-0.5 p-2 bg-surface-2/30 rounded-lg border border-border/30"
        style={{ display: "grid", gridTemplateColumns: "repeat(30, minmax(0, 1fr))" }}
        role="img"
        aria-label="90-day event outcome calendar"
      >
        {data.events.map((ev, i) => {
          const cfg = OUTCOME_CONFIG[ev.outcome];
          return (
            <div
              key={i}
              className="relative group w-full aspect-square rounded-sm flex items-center justify-center"
              style={{ backgroundColor: `${cfg.color}22` }}
              aria-label={`${ev.date_label}: ${cfg.label} (obs=${ev.observed}mm, fc=${ev.forecast}mm)`}
              tabIndex={0}
            >
              <span className="text-[6px] leading-none" style={{ color: cfg.color }}>{cfg.symbol}</span>
              {/* Tooltip */}
              <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-1 z-10 opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity">
                <div className="bg-surface-1 border border-border rounded px-1.5 py-1 text-[9px] whitespace-nowrap shadow-lg">
                  <div className="font-semibold">{ev.date_label}</div>
                  <div className={cfg.textColor}>{cfg.label}</div>
                  <div className="text-text-3">Obs: {ev.observed}mm | Fc: {ev.forecast}mm</div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ------------------------------------------------------------------
// Main Panel
// ------------------------------------------------------------------
interface ExtremesVerificationPanelProps {
  rocData: RocResponse | null;
  rocLoading: boolean;
  perfData: PerfDiagramResponse | null;
  perfLoading: boolean;
  eventsData: EventTimelineResponse | null;
  eventsLoading: boolean;
  variable?: string;
  threshold?: number;
}

export function ExtremesVerificationPanel({
  rocData, rocLoading,
  perfData, perfLoading,
  eventsData, eventsLoading,
  variable = "rainfall",
  threshold = 64.5,
}: ExtremesVerificationPanelProps) {
  const [collapsed, setCollapsed] = useState(false);

  return (
    <GlassCard className="flex flex-col gap-0 overflow-hidden">
      {/* Section header */}
      <button
        onClick={() => setCollapsed((c) => !c)}
        className="flex items-center justify-between w-full px-4 py-3 text-left border-b border-border/40 hover:bg-surface-2/30 transition-colors"
        aria-expanded={!collapsed}
      >
        <div>
          <span className="text-sm font-semibold text-text-1">Probabilistic Verification</span>
          <span className="ml-2 text-[10px] text-text-3 font-mono">
            {variable} ≥ {threshold}mm · 500-day sample
          </span>
        </div>
        {collapsed ? <ChevronDown className="h-4 w-4 text-text-3" /> : <ChevronUp className="h-4 w-4 text-text-3" />}
      </button>

      {!collapsed && (
        <div className="p-4 flex flex-col gap-6">
          {/* ROC Curve */}
          <RocCurveChart data={rocData} isLoading={rocLoading} />

          {/* Performance Diagram */}
          <PerfDiagram data={perfData} isLoading={perfLoading} />

          {/* Event Timeline */}
          <EventTimelineChart data={eventsData} isLoading={eventsLoading} />
        </div>
      )}
    </GlassCard>
  );
}
