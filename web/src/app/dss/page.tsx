"use client";

import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { fetchExtremesBulletin } from "@/lib/api";
import { useOpsStore } from "@/lib/store";
import { formatNumber, getAlertBadgeClass } from "@/lib/utils";
import {
  ShieldAlert,
  Printer,
  Search,
  Users,
  MapPin,
  FileText,
  AlertTriangle,
  AlertOctagon,
  RefreshCw
} from "lucide-react";

export default function DSSPage() {
  const { lead, regime, season, setSelectedRegion } = useOpsStore();
  const [filterAlert, setFilterAlert] = useState<string>("ALL");
  const [searchQuery, setSearchQuery] = useState<string>("");

  const { data: bulletin, isLoading, isError, refetch } = useQuery({
    queryKey: ["bulletin", lead, regime, season],
    queryFn: () => fetchExtremesBulletin(lead, regime, season),
    staleTime: 30000
  });

  const states = bulletin?.states || [];
  const filteredStates = states.filter((s) => {
    const matchesAlert = filterAlert === "ALL" || s.alert_level === filterAlert;
    const matchesSearch =
      s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.zone.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesAlert && matchesSearch;
  });

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="glass-panel rounded-xl p-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <span className="p-1.5 rounded-lg bg-red-500/10 text-red-400 border border-red-500/20">
              <ShieldAlert className="h-5 w-5" />
            </span>
            <h2 className="font-heading text-xl font-bold text-red-300">
              Disaster Management Decision Support System (DSS)
            </h2>
          </div>
          <p className="text-xs text-slate-400 mt-1 max-w-3xl">
            Official operational weather warnings across 36 Indian States and Union Territories. Calibrated
            probabilistic trigger thresholds for NDMA & State Disaster Management Authorities (SDMA).
          </p>
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={() => window.print()}
            className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-700 text-xs font-mono text-slate-300 hover:text-cyan-400 hover:border-cyan-500/40 transition"
          >
            <Printer className="h-3.5 w-3.5" />
            <span>Print Bulletin</span>
          </button>
        </div>
      </div>

      {/* Summary KPI Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 font-mono">
        <div className="glass-panel rounded-xl p-4 border-l-4 border-l-red-500">
          <span className="text-[10px] text-slate-400 block uppercase">RED WARNING</span>
          <span className="text-2xl font-black text-red-400">
            {isLoading ? "--" : (bulletin?.summary.red_alerts ?? 0)}
          </span>
          <span className="text-[10px] text-slate-500 block">Immediate NDRF Mobilization</span>
        </div>
        <div className="glass-panel rounded-xl p-4 border-l-4 border-l-amber-500">
          <span className="text-[10px] text-slate-400 block uppercase">ORANGE ALERT</span>
          <span className="text-2xl font-black text-amber-400">
            {isLoading ? "--" : (bulletin?.summary.orange_alerts ?? 0)}
          </span>
          <span className="text-[10px] text-slate-500 block">District Readiness</span>
        </div>
        <div className="glass-panel rounded-xl p-4 border-l-4 border-l-yellow-500">
          <span className="text-[10px] text-slate-400 block uppercase">YELLOW WATCH</span>
          <span className="text-2xl font-black text-yellow-400">
            {isLoading ? "--" : (bulletin?.summary.yellow_watches ?? 0)}
          </span>
          <span className="text-[10px] text-slate-500 block">Enhanced Monitoring</span>
        </div>
        <div className="glass-panel rounded-xl p-4 border-l-4 border-l-cyan-500">
          <span className="text-[10px] text-slate-400 block uppercase">Pop. at Risk</span>
          <span className="text-2xl font-black text-cyan-300">
            {isLoading ? "--" : `${bulletin?.summary.population_at_risk_millions ?? 0}M`}
          </span>
          <span className="text-[10px] text-slate-500 block">Estimated Population Exposure</span>
        </div>
      </div>

      {/* State List & Filters */}
      <div className="glass-panel rounded-xl p-5">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 mb-4">
          <div className="flex items-center space-x-2 w-full sm:w-auto">
            <div className="relative w-full sm:w-64">
              <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-slate-400" />
              <input
                type="text"
                placeholder="Search state, UT, or zone..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-slate-900 border border-slate-700 rounded-lg pl-8 pr-3 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-cyan-500/60"
              />
            </div>

            {/* Filter Buttons */}
            <div className="flex items-center space-x-1 font-mono text-[11px]">
              {["ALL", "RED", "ORANGE", "YELLOW", "GREEN"].map((lvl) => (
                <button
                  key={lvl}
                  onClick={() => setFilterAlert(lvl)}
                  className={`px-2 py-1 rounded transition ${
                    filterAlert === lvl
                      ? "bg-cyan-500/20 text-cyan-300 border border-cyan-500/40"
                      : "text-slate-400 hover:text-slate-200"
                  }`}
                >
                  {lvl}
                </button>
              ))}
            </div>
          </div>

          <span className="font-mono text-xs text-slate-400">
            {isLoading
              ? "Synthesizing alerts..."
              : `Showing ${filteredStates.length} of ${states.length} Jurisdictions`}
          </span>
        </div>

        {/* Loading Skeleton */}
        {isLoading && (
          <div className="space-y-2 py-4">
            {Array.from({ length: 8 }).map((_, i) => (
              <div
                key={i}
                className="h-10 w-full animate-pulse rounded-lg bg-slate-900/60 border border-slate-800"
              />
            ))}
          </div>
        )}

        {/* Error State */}
        {isError && (
          <div className="py-12 text-center space-y-3 font-mono">
            <p className="text-red-400 text-xs">Failed to fetch disaster bulletin from operational API.</p>
            <button
              onClick={() => refetch()}
              className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-slate-800 border border-slate-700 text-xs text-cyan-400 hover:bg-slate-700"
            >
              <RefreshCw className="h-3.5 w-3.5" />
              <span>Retry Query</span>
            </button>
          </div>
        )}

        {/* Table of 36 States */}
        {!isLoading && !isError && (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs font-mono">
              <thead className="bg-slate-900/90 text-slate-400 border-b border-slate-800">
                <tr>
                  <th className="py-3 px-3">State / UT</th>
                  <th className="py-3 px-3">Zone</th>
                  <th className="py-3 px-3 text-center">Alert Tier</th>
                  <th className="py-3 px-3 text-right">Rain mm/24h</th>
                  <th className="py-3 px-3 text-right">P(&gt;64.5mm)</th>
                  <th className="py-3 px-3 text-right">Tmax (°C)</th>
                  <th className="py-3 px-3 text-right">Peak Gust</th>
                  <th className="py-3 px-4">Standard Operating Protocol (SOP)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {filteredStates.map((st) => {
                  const badge = getAlertBadgeClass(st.alert_level);
                  return (
                    <tr
                      key={st.code}
                      onClick={() => setSelectedRegion(st.code)}
                      className="hover:bg-slate-800/40 cursor-pointer transition"
                    >
                      <td className="py-3 px-3 font-semibold text-slate-200">
                        {st.name} <span className="text-slate-500">({st.code})</span>
                      </td>
                      <td className="py-3 px-3 text-slate-400">{st.zone}</td>
                      <td className="py-3 px-3 text-center">
                        <span
                          className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold uppercase border ${badge.border} ${badge.bg} ${badge.text}`}
                        >
                          {st.alert_level}
                        </span>
                      </td>
                      <td className="py-3 px-3 text-right text-cyan-300 font-bold">
                        {formatNumber(st.metrics.rainfall_mm)}
                      </td>
                      <td className="py-3 px-3 text-right text-slate-300">
                        {(st.metrics.p_heavy_rain * 100).toFixed(0)}%
                      </td>
                      <td className="py-3 px-3 text-right text-amber-300">
                        {formatNumber(st.metrics.tmax_c)}
                      </td>
                      <td className="py-3 px-3 text-right text-violet-300">
                        {formatNumber(st.metrics.wind_gust_kmh)} km/h
                      </td>
                      <td className="py-3 px-4 text-slate-300 text-[11px] max-w-md truncate">
                        {st.sop_action}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
