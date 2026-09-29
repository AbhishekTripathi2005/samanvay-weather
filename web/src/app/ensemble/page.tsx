"use client";

import React from "react";
import { useQuery } from "@tanstack/react-query";
import { fetchEnsembleDistribution, fetchExtremesBulletin } from "@/lib/api";
import { useOpsStore } from "@/lib/store";
import { formatNumber } from "@/lib/utils";
import { EnsemblePlumeChart } from "@/components/charts/EnsemblePlumeChart";
import { Layers, Activity, Users, ShieldAlert, Sparkles } from "lucide-react";

export default function EnsemblePage() {
  const { variable, lead, selectedRegion, regime, season } = useOpsStore();

  const { data: ensembleData } = useQuery({
    queryKey: ["ensembleDistribution", variable, lead, selectedRegion, regime, season],
    queryFn: () => fetchEnsembleDistribution(variable, lead, selectedRegion, regime, season),
    staleTime: 30000
  });

  const members = ensembleData?.current_members || [];
  const controlMember = members.find((m) => m.is_control);
  const perturbedMembers = members.filter((m) => !m.is_control);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="glass-panel rounded-xl p-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <span className="p-1.5 rounded-lg bg-blue-500/10 text-blue-400 border border-blue-500/20">
              <Layers className="h-5 w-5" />
            </span>
            <h2 className="font-heading text-xl font-bold text-blue-300">
              NEPS Ensemble Prediction System (21 Members)
            </h2>
          </div>
          <p className="text-xs text-slate-400 mt-1 max-w-3xl">
            Full 21-member ensemble breakdown (Control M00 + 20 Perturbed Physics Members) simulating initial condition
            uncertainty and stochastic physics over the Indian Monsoon regime.
          </p>
        </div>
        <div className="font-mono text-xs text-right bg-slate-900/80 p-2.5 rounded-lg border border-slate-700">
          <span className="text-[10px] text-slate-400 block">Total Members:</span>
          <span className="text-blue-400 font-bold">21 Members (0.25° Resolution)</span>
        </div>
      </div>

      {/* Main Plume Spaghetti Chart */}
      <EnsemblePlumeChart />

      {/* 21 Members Grid */}
      <div className="glass-panel rounded-xl p-5">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-heading font-bold text-base text-slate-200 flex items-center space-x-2">
            <Users className="h-4 w-4 text-cyan-400" />
            <span>NEPS 21-Member State Snapshot at +{lead}h</span>
          </h3>
          <span className="font-mono text-xs text-slate-400">
            Region: <strong className="text-cyan-300">{selectedRegion}</strong>
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-7 gap-3">
          {members.map((m) => (
            <div
              key={m.member_id}
              className={`p-3 rounded-lg border flex flex-col justify-between font-mono text-xs transition ${
                m.is_control
                  ? "bg-cyan-950/40 border-cyan-500/50 shadow-[0_0_10px_rgba(6,182,212,0.2)]"
                  : "bg-slate-900/60 border-slate-800 hover:border-slate-700"
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <span className={`text-[10px] font-bold ${m.is_control ? "text-cyan-300" : "text-slate-400"}`}>
                  {m.is_control ? "M00 (CTRL)" : `M${m.member_id.toString().padStart(2, "0")}`}
                </span>
                {m.is_control && (
                  <span className="h-2 w-2 rounded-full bg-cyan-400 animate-pulse" />
                )}
              </div>
              <div className="text-right">
                <span className={`text-base font-bold ${m.is_control ? "text-cyan-300" : "text-blue-200"}`}>
                  {formatNumber(m.value)}
                </span>
                <span className="text-[10px] text-slate-500 ml-1">
                  {variable === "rainfall" ? "mm" : (variable.startsWith("t") ? "°C" : "km/h")}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
