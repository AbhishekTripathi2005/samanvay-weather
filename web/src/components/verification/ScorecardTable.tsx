"use client";

import React, { useState } from "react";
import { GlassCard } from "@/components/ui/GlassCard";
import { ScorecardItem, VerificationMetrics } from "@/lib/types";
import { Table, Download, Search, ArrowUpDown, Award } from "lucide-react";
import { exportToCsv } from "@/lib/export";
import { toast } from "sonner";

interface ScorecardTableProps {
  scorecard: ScorecardItem[];
  variable?: string;
  leadDay?: number;
}

type SortField = keyof VerificationMetrics | "name" | "type";

export function ScorecardTable({
  scorecard = [],
  variable = "rainfall",
  leadDay = 3
}: ScorecardTableProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [sortField, setSortField] = useState<SortField>("rmse");
  const [sortAsc, setSortAsc] = useState(true);

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortAsc(!sortAsc);
    } else {
      setSortField(field);
      // For metrics where higher is better, default to descending
      const higherIsBetter = ["corr", "pod", "csi", "ets", "sedi"].includes(field);
      setSortAsc(!higherIsBetter);
    }
  };

  // Filter models
  const filtered = scorecard.filter((item) =>
    item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.type.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Sort models
  const sorted = [...filtered].sort((a, b) => {
    let aVal: any = a[sortField as keyof ScorecardItem] ?? a.metrics?.[sortField as keyof VerificationMetrics] ?? 0;
    let bVal: any = b[sortField as keyof ScorecardItem] ?? b.metrics?.[sortField as keyof VerificationMetrics] ?? 0;

    if (typeof aVal === "string") {
      return sortAsc ? aVal.localeCompare(bVal) : bVal.localeCompare(aVal);
    }
    return sortAsc ? aVal - bVal : bVal - aVal;
  });

  const handleExportCsv = () => {
    if (!scorecard || scorecard.length === 0) return;

    const exportRows = scorecard.map((item) => ({
      Model_ID: item.id,
      Model_Name: item.name,
      Type: item.type,
      RMSE: item.metrics?.rmse?.toFixed(3) ?? "",
      MAE: item.metrics?.mae?.toFixed(3) ?? "",
      Bias: item.metrics?.bias?.toFixed(3) ?? "",
      Pearson_Corr: item.metrics?.corr?.toFixed(3) ?? "",
      CRPS: item.metrics?.crps?.toFixed(3) ?? "",
      POD: item.metrics?.pod?.toFixed(3) ?? "",
      FAR: item.metrics?.far?.toFixed(3) ?? "",
      CSI: item.metrics?.csi?.toFixed(3) ?? "",
      ETS: item.metrics?.ets?.toFixed(3) ?? "",
      SEDI: item.metrics?.sedi?.toFixed(3) ?? ""
    }));

    exportToCsv(`samanvay_scorecard_${variable}_day${leadDay}`, exportRows);
    toast.success("Scorecard CSV exported successfully");
  };

  return (
    <GlassCard className="p-5 flex flex-col gap-4 border-cyan-500/20">
      {/* Table Header Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-border/50">
        <div>
          <div className="flex items-center gap-2">
            <Table className="w-5 h-5 text-cyan-400" />
            <h2 className="text-base font-bold text-text-1 tracking-tight">
              Comprehensive 10-Metric Scorecard Table
            </h2>
          </div>
          <p className="text-xs text-text-3">
            Full operational evaluation across 7 models, SAMANVAY Consensus, and Equal-Weight baseline
          </p>
        </div>

        <div className="flex items-center gap-2">
          {/* Search Box */}
          <div className="relative">
            <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-text-3" />
            <input
              type="text"
              placeholder="Search model..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="bg-surface-2 border border-border text-xs text-text-1 rounded-lg pl-8 pr-3 py-1.5 w-36 sm:w-44 focus:border-cyan-400 outline-none"
            />
          </div>

          {/* Export CSV Button */}
          <button
            onClick={handleExportCsv}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-surface-2 border border-border hover:border-cyan-400 hover:text-cyan-300 text-xs font-mono font-medium transition-colors"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export CSV</span>
          </button>
        </div>
      </div>

      {/* Scorecard Table */}
      <div className="overflow-x-auto pb-1">
        <table className="w-full text-left text-xs font-mono border-collapse min-w-[950px]">
          <thead>
            <tr className="border-b border-border/60 text-text-3 text-[11px]">
              <th className="py-2.5 px-3 cursor-pointer hover:text-text-1" onClick={() => handleSort("name")}>
                <div className="flex items-center gap-1">
                  <span>Model</span>
                  <ArrowUpDown className="w-3 h-3" />
                </div>
              </th>
              <th className="py-2.5 px-2 cursor-pointer hover:text-text-1" onClick={() => handleSort("type")}>
                <div className="flex items-center gap-1">
                  <span>Type</span>
                  <ArrowUpDown className="w-3 h-3" />
                </div>
              </th>
              <th className="py-2.5 px-2 text-right cursor-pointer hover:text-text-1" onClick={() => handleSort("rmse")}>
                <div className="flex items-center justify-end gap-1">
                  <span>RMSE (↓)</span>
                  <ArrowUpDown className="w-3 h-3" />
                </div>
              </th>
              <th className="py-2.5 px-2 text-right cursor-pointer hover:text-text-1" onClick={() => handleSort("mae")}>
                <div className="flex items-center justify-end gap-1">
                  <span>MAE (↓)</span>
                  <ArrowUpDown className="w-3 h-3" />
                </div>
              </th>
              <th className="py-2.5 px-2 text-right cursor-pointer hover:text-text-1" onClick={() => handleSort("bias")}>
                <div className="flex items-center justify-end gap-1">
                  <span>Bias</span>
                  <ArrowUpDown className="w-3 h-3" />
                </div>
              </th>
              <th className="py-2.5 px-2 text-right cursor-pointer hover:text-text-1" onClick={() => handleSort("corr")}>
                <div className="flex items-center justify-end gap-1">
                  <span>Corr (↑)</span>
                  <ArrowUpDown className="w-3 h-3" />
                </div>
              </th>
              <th className="py-2.5 px-2 text-right cursor-pointer hover:text-text-1" onClick={() => handleSort("crps")}>
                <div className="flex items-center justify-end gap-1">
                  <span>CRPS (↓)</span>
                  <ArrowUpDown className="w-3 h-3" />
                </div>
              </th>
              <th className="py-2.5 px-2 text-right cursor-pointer hover:text-text-1" onClick={() => handleSort("pod")}>
                <div className="flex items-center justify-end gap-1">
                  <span>POD (↑)</span>
                  <ArrowUpDown className="w-3 h-3" />
                </div>
              </th>
              <th className="py-2.5 px-2 text-right cursor-pointer hover:text-text-1" onClick={() => handleSort("far")}>
                <div className="flex items-center justify-end gap-1">
                  <span>FAR (↓)</span>
                  <ArrowUpDown className="w-3 h-3" />
                </div>
              </th>
              <th className="py-2.5 px-2 text-right cursor-pointer hover:text-text-1" onClick={() => handleSort("csi")}>
                <div className="flex items-center justify-end gap-1">
                  <span>CSI (↑)</span>
                  <ArrowUpDown className="w-3 h-3" />
                </div>
              </th>
              <th className="py-2.5 px-2 text-right cursor-pointer hover:text-text-1" onClick={() => handleSort("ets")}>
                <div className="flex items-center justify-end gap-1">
                  <span>ETS (↑)</span>
                  <ArrowUpDown className="w-3 h-3" />
                </div>
              </th>
              <th className="py-2.5 px-2 text-right cursor-pointer hover:text-text-1" onClick={() => handleSort("sedi")}>
                <div className="flex items-center justify-end gap-1">
                  <span>SEDI (↑)</span>
                  <ArrowUpDown className="w-3 h-3" />
                </div>
              </th>
            </tr>
          </thead>
          <tbody>
            {sorted.map((item) => {
              const isBlend = item.id === "samanvay";
              const isBaseline = item.id === "equal_weight";

              return (
                <tr
                  key={item.id}
                  className={`border-b border-border/40 transition-colors ${
                    isBlend
                      ? "bg-cyan-500/10 hover:bg-cyan-500/15 font-bold"
                      : isBaseline
                      ? "bg-slate-500/5 hover:bg-slate-500/10 text-slate-300"
                      : "hover:bg-white/5 text-text-2"
                  }`}
                >
                  {/* Model */}
                  <td className="py-3 px-3">
                    <div className="flex items-center gap-2">
                      <span
                        className="w-2.5 h-2.5 rounded-full shrink-0"
                        style={{ backgroundColor: item.color }}
                      />
                      <span className={isBlend ? "text-cyan-300 font-extrabold" : "text-text-1"}>
                        {item.name}
                      </span>
                      {isBlend && (
                        <span className="bg-cyan-500/20 text-cyan-300 text-[9px] px-1.5 py-0.2 rounded border border-cyan-400">
                          Consensus
                        </span>
                      )}
                    </div>
                  </td>

                  {/* Type */}
                  <td className="py-3 px-2">
                    <span
                      className="text-[9px] px-1.5 py-0.5 rounded border uppercase"
                      style={{
                        color: item.color,
                        borderColor: `${item.color}50`,
                        backgroundColor: `${item.color}15`
                      }}
                    >
                      {item.type}
                    </span>
                  </td>

                  {/* RMSE */}
                  <td className={`py-3 px-2 text-right ${isBlend ? "text-cyan-300 font-bold" : ""}`}>
                    {item.metrics?.rmse?.toFixed(3)}
                  </td>

                  {/* MAE */}
                  <td className={`py-3 px-2 text-right ${isBlend ? "text-cyan-300 font-bold" : ""}`}>
                    {item.metrics?.mae?.toFixed(3)}
                  </td>

                  {/* Bias */}
                  <td className="py-3 px-2 text-right">
                    <span className={item.metrics?.bias > 0 ? "text-amber-400" : item.metrics?.bias < 0 ? "text-indigo-400" : ""}>
                      {item.metrics?.bias > 0 ? `+${item.metrics.bias.toFixed(3)}` : item.metrics?.bias?.toFixed(3)}
                    </span>
                  </td>

                  {/* Corr */}
                  <td className={`py-3 px-2 text-right ${isBlend ? "text-cyan-300 font-bold" : ""}`}>
                    {item.metrics?.corr?.toFixed(3)}
                  </td>

                  {/* CRPS */}
                  <td className={`py-3 px-2 text-right ${isBlend ? "text-cyan-300 font-bold" : ""}`}>
                    {item.metrics?.crps?.toFixed(3)}
                  </td>

                  {/* POD */}
                  <td className="py-3 px-2 text-right">
                    {item.metrics?.pod?.toFixed(3)}
                  </td>

                  {/* FAR */}
                  <td className="py-3 px-2 text-right">
                    {item.metrics?.far?.toFixed(3)}
                  </td>

                  {/* CSI */}
                  <td className="py-3 px-2 text-right">
                    {item.metrics?.csi?.toFixed(3)}
                  </td>

                  {/* ETS */}
                  <td className={`py-3 px-2 text-right ${isBlend ? "text-cyan-300 font-bold" : ""}`}>
                    {item.metrics?.ets?.toFixed(3)}
                  </td>

                  {/* SEDI */}
                  <td className={`py-3 px-2 text-right ${isBlend ? "text-cyan-300 font-bold" : ""}`}>
                    {item.metrics?.sedi?.toFixed(3)}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </GlassCard>
  );
}
