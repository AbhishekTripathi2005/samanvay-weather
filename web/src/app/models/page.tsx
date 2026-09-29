"use client";

import React, { useState } from "react";
import { useAppStore } from "@/lib/store";
import { useSkillQuery, useTaylorQuery, useReliabilityQuery, useByLeadQuery } from "@/lib/queries";
import { VerificationMetricKey } from "@/lib/types";
import { VerificationFilters, METRIC_DEFINITIONS } from "@/components/verification/VerificationFilters";
import { VerificationCallouts } from "@/components/verification/VerificationCallouts";
import { LeaderboardChart } from "@/components/verification/LeaderboardChart";
import { InteractiveTaylorDiagram } from "@/components/verification/InteractiveTaylorDiagram";
import { ReliabilityDiagram } from "@/components/verification/ReliabilityDiagram";
import { SkillVsLeadChart } from "@/components/verification/SkillVsLeadChart";
import { WinLossMatrix } from "@/components/verification/WinLossMatrix";
import { ScorecardTable } from "@/components/verification/ScorecardTable";
import { ShieldCheck, Sparkles, RefreshCw } from "lucide-react";

export default function VerificationPage() {
  const { variable, setVariable, lead, setLead } = useAppStore();

  const [selectedMetric, setSelectedMetric] = useState<VerificationMetricKey>("rmse");
  const [season, setSeason] = useState("all");
  const [region, setRegion] = useState("all");
  const [regime, setRegime] = useState("all");

  const leadDay = Math.max(1, Math.min(10, Math.round(lead / 24) || 3));

  // Queries
  const { data: skillData, isLoading: isSkillLoading, refetch: refetchSkill } = useSkillQuery({
    variable,
    lead: leadDay * 24,
    metric: selectedMetric,
    season,
    region,
    regime
  });

  const { data: taylorData } = useTaylorQuery({
    variable,
    lead: leadDay * 24
  });

  const threshold = variable === "rainfall" ? 64.5 : variable === "tmax" ? 40.0 : 45.0;
  const { data: reliabilityData } = useReliabilityQuery({
    variable,
    threshold,
    lead: leadDay * 24
  });

  const { data: byLeadData } = useByLeadQuery({
    variable,
    metric: selectedMetric
  });

  const currentMetricDef = METRIC_DEFINITIONS.find((m) => m.key === selectedMetric) || METRIC_DEFINITIONS[0];

  const handleSelectLeadDay = (d: number) => {
    setLead(d * 24);
  };

  return (
    <div className="flex flex-col gap-6 pb-12 max-w-[1600px] mx-auto w-full">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-black text-text-1 tracking-tight flex items-center gap-2.5">
              <span>Operational Verification & Leaderboard</span>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-400 font-bold uppercase tracking-wider">
                Step 8 Core
              </span>
            </h1>
          </div>
          <p className="text-xs text-text-3 mt-1">
            PS 26081 (MoES / NCMRWF) Multi-Model Benchmark Suite: 7 Sources vs Adaptive Blended Consensus & 1/K Baseline
          </p>
        </div>

        {/* Status Chip */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 bg-surface-2 px-3 py-1.5 rounded-lg border border-border text-xs font-mono">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-text-2">3-Year Ground Truth Climatology Active</span>
          </div>

          <button
            onClick={() => refetchSkill()}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-surface-2 border border-border hover:border-cyan-400 text-xs font-mono text-text-2 hover:text-cyan-300 transition-colors"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Recalculate</span>
          </button>
        </div>
      </div>

      {/* 1. Filter Bar & Metric Selector */}
      <VerificationFilters
        selectedMetric={selectedMetric}
        onSelectMetric={setSelectedMetric}
        variable={variable}
        onSelectVariable={setVariable}
        leadDay={leadDay}
        onSelectLeadDay={handleSelectLeadDay}
        season={season}
        onSelectSeason={setSeason}
        region={region}
        onSelectRegion={setRegion}
        regime={regime}
        onSelectRegime={setRegime}
      />

      {/* 2. Operational Callout KPI Cards */}
      <VerificationCallouts
        callouts={skillData?.callouts}
        metricLabel={currentMetricDef.label}
        variable={variable}
      />

      {/* 3. Core 2-Column: Leaderboard Chart + Interactive Taylor Diagram */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Animated Leaderboard with CI Whiskers */}
        <div className="lg:col-span-7">
          <LeaderboardChart
            scorecard={skillData?.scorecard || []}
            metricLabel={currentMetricDef.label}
            metricName={currentMetricDef.name}
            unit={currentMetricDef.unit}
            better={currentMetricDef.better}
          />
        </div>

        {/* Right Column: Interactive Taylor Diagram */}
        <div className="lg:col-span-5">
          <InteractiveTaylorDiagram
            models={taylorData?.models || []}
            referenceStd={taylorData?.reference?.std_dev}
            leadLabel={`Day ${leadDay}`}
            variable={variable}
          />
        </div>
      </div>

      {/* 4. Second Row: Reliability Calibration Diagram + Skill vs Lead Horizon Trajectory */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Reliability Curve & Histogram */}
        <div className="lg:col-span-6">
          <ReliabilityDiagram
            bins={reliabilityData?.bins || []}
            brierScoreRaw={reliabilityData?.brier_score_raw}
            brierScoreCalibrated={reliabilityData?.brier_score_calibrated}
            brierSkillScorePct={reliabilityData?.brier_skill_score_pct}
            variable={variable}
            leadLabel={`Day ${leadDay}`}
            threshold={threshold}
          />
        </div>

        {/* Skill vs Lead Trajectory Lines */}
        <div className="lg:col-span-6">
          <SkillVsLeadChart
            curves={byLeadData?.curves || []}
            variable={variable}
            metric={selectedMetric}
            onSelectMetric={(m) => setSelectedMetric(m as VerificationMetricKey)}
          />
        </div>
      </div>

      {/* 5. Third Row: Honest Win / Loss Matrix */}
      <WinLossMatrix
        data={skillData?.win_loss}
        variable={variable}
      />

      {/* 6. Fourth Row: Complete 10-Metric Scorecard Table & CSV Export */}
      <ScorecardTable
        scorecard={skillData?.scorecard || []}
        variable={variable}
        leadDay={leadDay}
      />
    </div>
  );
}
