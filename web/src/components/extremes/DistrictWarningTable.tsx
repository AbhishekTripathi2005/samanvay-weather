"use client";

import React, { useState, useMemo, useCallback } from "react";
import {
  Search, SortAsc, SortDesc, Filter, AlertOctagon,
  AlertCircle, AlertTriangle, CheckCircle2, Info
} from "lucide-react";
import { GlassCard } from "@/components/ui/GlassCard";
import { AlertBadge } from "@/components/ui/AlertBadge";
import type { ExtremeAlertItem } from "@/lib/types";
import { cn } from "@/lib/utils";

type SortKey = "district" | "p_extreme" | "forecast_value" | "confidence" | "alert_day";
type SortDir = "asc" | "desc";
type LevelFilter = "ALL" | "RED" | "ORANGE" | "YELLOW" | "GREEN";

const VARIABLE_ICONS: Record<string, string> = {
  rainfall:  "🌧️",
  tmax:      "🔥",
  wind_gust: "💨",
};
const VARIABLE_UNIT: Record<string, string> = {
  rainfall:  "mm",
  tmax:      "°C",
  wind_gust: "km/h",
};

const LEVEL_ORDER: Record<string, number> = { RED: 0, ORANGE: 1, YELLOW: 2, GREEN: 3 };
const LEVEL_STRIPE_CLASS: Record<string, string> = {
  RED:    "border-l-4 border-l-red-500",
  ORANGE: "border-l-4 border-l-amber-500",
  YELLOW: "border-l-4 border-l-yellow-500",
  GREEN:  "border-l-4 border-l-emerald-500",
};

interface Props {
  alerts: ExtremeAlertItem[];
  isLoading?: boolean;
  onDistrictSelect: (alert: ExtremeAlertItem) => void;
  selectedId?: string | null;
}

export function DistrictWarningTable({ alerts, isLoading, onDistrictSelect, selectedId }: Props) {
  const [search, setSearch] = useState("");
  const [levelFilter, setLevelFilter] = useState<LevelFilter>("ALL");
  const [stateFilter, setStateFilter] = useState("ALL");
  const [sortKey, setSortKey] = useState<SortKey>("alert_level" as SortKey);
  const [sortDir, setSortDir] = useState<SortDir>("asc");

  const allStates = useMemo(() => {
    const s = Array.from(new Set(alerts.map((a) => a.state))).sort();
    return ["ALL", ...s];
  }, [alerts]);

  const filtered = useMemo(() => {
    let rows = [...alerts];
    if (search)        rows = rows.filter((a) => a.district.toLowerCase().includes(search.toLowerCase()) || a.state.toLowerCase().includes(search.toLowerCase()));
    if (levelFilter !== "ALL") rows = rows.filter((a) => a.alert_level === levelFilter);
    if (stateFilter !== "ALL") rows = rows.filter((a) => a.state === stateFilter);

    rows.sort((a, b) => {
      let av: number | string = 0, bv: number | string = 0;
      if (sortKey === "district")        { av = a.district; bv = b.district; }
      else if (sortKey === "p_extreme")  { av = a.p_extreme; bv = b.p_extreme; }
      else if (sortKey === "forecast_value") { av = a.forecast_value; bv = b.forecast_value; }
      else if (sortKey === "confidence") { av = a.confidence ?? 0; bv = b.confidence ?? 0; }
      else if (sortKey === "alert_day")  { av = a.alert_day ?? 1; bv = b.alert_day ?? 1; }
      else { av = LEVEL_ORDER[a.alert_level]; bv = LEVEL_ORDER[b.alert_level]; }
      const cmp = av < bv ? -1 : av > bv ? 1 : 0;
      return sortDir === "asc" ? cmp : -cmp;
    });
    return rows;
  }, [alerts, search, levelFilter, stateFilter, sortKey, sortDir]);

  const toggleSort = useCallback((key: SortKey) => {
    if (sortKey === key) setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    else { setSortKey(key); setSortDir("desc"); }
  }, [sortKey]);

  const SortIcon = ({ k }: { k: string }) =>
    sortKey === k ? (sortDir === "asc" ? <SortAsc className="h-3 w-3" /> : <SortDesc className="h-3 w-3" />) : null;

  const levelCounts = useMemo(() => ({
    RED:    alerts.filter((a) => a.alert_level === "RED").length,
    ORANGE: alerts.filter((a) => a.alert_level === "ORANGE").length,
    YELLOW: alerts.filter((a) => a.alert_level === "YELLOW").length,
  }), [alerts]);

  return (
    <GlassCard className="flex flex-col gap-0 overflow-hidden">
      {/* Header bar */}
      <div className="px-4 pt-4 pb-3 border-b border-border/40 flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm font-semibold text-text-1">District Warning Table</h3>
            <p className="text-[11px] text-text-3 mt-0.5">{filtered.length} districts shown (of {alerts.length} active)</p>
          </div>
          <div className="flex gap-1.5">
            {(["RED","ORANGE","YELLOW"] as LevelFilter[]).map((lv) => {
              const cls: Record<string, string> = {
                RED:    "bg-red-500/20    text-red-400    border-red-500/40",
                ORANGE: "bg-amber-500/20  text-amber-400  border-amber-500/40",
                YELLOW: "bg-yellow-500/20 text-yellow-400 border-yellow-500/40",
              };
              return (
                <span key={lv} className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded border ${cls[lv]}`}>
                  {levelCounts[lv as "RED"|"ORANGE"|"YELLOW"]} {lv}
                </span>
              );
            })}
          </div>
        </div>

        {/* Filters row */}
        <div className="flex flex-wrap gap-2">
          {/* Search */}
          <div className="relative flex-1 min-w-[160px]">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-text-3" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search district / state…"
              className="w-full pl-8 pr-3 py-1.5 text-xs bg-surface-2 border border-border rounded-lg focus:outline-none focus:border-cyan-500/60 text-text-1 placeholder:text-text-3"
              aria-label="Search districts"
            />
          </div>

          {/* Level filter */}
          <div className="flex gap-1">
            {(["ALL","RED","ORANGE","YELLOW"] as LevelFilter[]).map((lv) => (
              <button
                key={lv}
                onClick={() => setLevelFilter(lv)}
                aria-pressed={levelFilter === lv}
                className={cn(
                  "px-2 py-1 text-[10px] font-bold rounded border transition-all",
                  levelFilter === lv ? "bg-cyan-500/20 border-cyan-500/50 text-cyan-300" : "bg-surface-2 border-border text-text-3 hover:border-border/80"
                )}
              >
                {lv}
              </button>
            ))}
          </div>

          {/* State dropdown */}
          <select
            value={stateFilter}
            onChange={(e) => setStateFilter(e.target.value)}
            className="text-xs bg-surface-2 border border-border rounded-lg px-2 py-1.5 text-text-2 focus:outline-none focus:border-cyan-500/60"
            aria-label="Filter by state"
          >
            {allStates.map((s) => <option key={s} value={s}>{s === "ALL" ? "All States" : s}</option>)}
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto overflow-y-auto" style={{ maxHeight: 480 }}>
        <table className="w-full text-xs border-collapse min-w-[720px]" role="table">
          <thead className="sticky top-0 z-10 bg-surface-1 border-b border-border/60">
            <tr>
              <th className="text-left py-2.5 px-3 text-text-3 font-semibold">
                <button className="flex items-center gap-1 hover:text-text-1" onClick={() => toggleSort("district")}>
                  District <SortIcon k="district" />
                </button>
              </th>
              <th className="text-left py-2.5 px-3 text-text-3 font-semibold">Alert</th>
              <th className="text-center py-2.5 px-3 text-text-3 font-semibold">Var</th>
              <th className="text-right py-2.5 px-3 text-text-3 font-semibold">
                <button className="flex items-center gap-1 ml-auto hover:text-text-1" onClick={() => toggleSort("p_extreme")}>
                  P(Ext) <SortIcon k="p_extreme" />
                </button>
              </th>
              <th className="text-right py-2.5 px-3 text-text-3 font-semibold">
                <button className="flex items-center gap-1 ml-auto hover:text-text-1" onClick={() => toggleSort("confidence")}>
                  Conf <SortIcon k="confidence" />
                </button>
              </th>
              <th className="text-center py-2.5 px-3 text-text-3 font-semibold">Top Models</th>
              <th className="text-center py-2.5 px-3 text-text-3 font-semibold">
                <button className="flex items-center gap-1 mx-auto hover:text-text-1" onClick={() => toggleSort("alert_day")}>
                  Peak <SortIcon k="alert_day" />
                </button>
              </th>
              <th className="text-center py-2.5 px-3 text-text-3 font-semibold">Action</th>
            </tr>
          </thead>
          <tbody>
            {isLoading && (
              <tr><td colSpan={8} className="py-8 text-center text-text-3 text-xs">Loading advisories…</td></tr>
            )}
            {!isLoading && filtered.length === 0 && (
              <tr><td colSpan={8} className="py-8 text-center text-text-3 text-xs">No districts match filters.</td></tr>
            )}
            {filtered.map((alert) => (
              <tr
                key={alert.id}
                onClick={() => onDistrictSelect(alert)}
                className={cn(
                  "border-b border-border/20 cursor-pointer transition-colors",
                  LEVEL_STRIPE_CLASS[alert.alert_level],
                  selectedId === alert.id ? "bg-cyan-500/10" : "hover:bg-surface-2/50"
                )}
                role="row"
                tabIndex={0}
                onKeyDown={(e) => e.key === "Enter" && onDistrictSelect(alert)}
                aria-selected={selectedId === alert.id}
              >
                {/* District */}
                <td className="py-2.5 px-3 font-medium text-text-1">
                  {alert.district}
                  <div className="text-[10px] text-text-3">{alert.state}</div>
                </td>

                {/* Alert badge */}
                <td className="py-2.5 px-3">
                  <AlertBadge level={alert.alert_level} />
                </td>

                {/* Variable icon */}
                <td className="py-2.5 px-3 text-center text-base" title={alert.variable}>
                  {VARIABLE_ICONS[alert.variable] ?? "📊"}
                </td>

                {/* P(extreme) */}
                <td className="py-2.5 px-3 text-right">
                  <div className="flex flex-col items-end gap-0.5">
                    <span className="font-mono font-bold text-text-1">{Math.round(alert.p_extreme * 100)}%</span>
                    <div className="w-16 h-1.5 rounded-full bg-surface-2 overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all duration-500"
                        style={{
                          width: `${alert.p_extreme * 100}%`,
                          background: alert.p_extreme >= 0.75 ? "#ef4444" : alert.p_extreme >= 0.5 ? "#f59e0b" : alert.p_extreme >= 0.25 ? "#eab308" : "#10b981"
                        }}
                      />
                    </div>
                  </div>
                </td>

                {/* Confidence */}
                <td className="py-2.5 px-3 text-right">
                  {alert.confidence !== undefined ? (
                    <span className="font-mono text-text-2">{Math.round(alert.confidence * 100)}%</span>
                  ) : (
                    <span className="text-text-3">—</span>
                  )}
                </td>

                {/* Top models */}
                <td className="py-2.5 px-3">
                  <div className="flex flex-col gap-0.5">
                    {(alert.top_models ?? []).slice(0, 3).map((m) => (
                      <div key={m.id} className="flex items-center gap-1 text-[10px]">
                        <span className="text-text-2 font-medium w-20 truncate">{m.name}</span>
                        <div className="flex-1 h-1 rounded-full bg-surface-2 overflow-hidden">
                          <div className="h-full bg-cyan-500/70 rounded-full" style={{ width: `${m.weight * 100}%` }} />
                        </div>
                        <span className="font-mono text-text-3 w-8 text-right">{Math.round(m.weight * 100)}%</span>
                      </div>
                    ))}
                  </div>
                </td>

                {/* Peak day */}
                <td className="py-2.5 px-3 text-center">
                  <span className="font-mono text-text-2">D{alert.alert_day ?? 1}</span>
                </td>

                {/* Why button */}
                <td className="py-2.5 px-3 text-center">
                  <button
                    onClick={(e) => { e.stopPropagation(); onDistrictSelect(alert); }}
                    className="px-2 py-1 text-[10px] font-semibold rounded-md bg-cyan-500/15 border border-cyan-500/40 text-cyan-400 hover:bg-cyan-500/25 transition-colors flex items-center gap-1 mx-auto"
                    aria-label={`Why is ${alert.district} on alert?`}
                  >
                    <Info className="h-3 w-3" /> Why?
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Footer */}
      <div className="px-4 py-2 border-t border-border/30 text-[10px] text-text-3 flex items-center gap-1">
        <Filter className="h-3 w-3" />
        Click any row to open the alert explanation drawer · Sortable columns
      </div>
    </GlassCard>
  );
}
