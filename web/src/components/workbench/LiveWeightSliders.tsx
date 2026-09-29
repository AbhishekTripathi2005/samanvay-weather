"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import { GlassCard } from "@/components/ui/GlassCard";
import { Slider } from "@/components/ui/Slider";
import { RotateCcw, Lock, Unlock, Zap, TrendingUp, TrendingDown, CheckCircle2 } from "lucide-react";
import { useCustomBlendMutation } from "@/lib/queries";
import { CustomBlendResponse } from "@/lib/types";

interface LiveWeightSlidersProps {
  initialWeights: Record<string, number>;
  sourceValues: Record<string, number>;
  optimalConsensus: number;
  variable: string;
  leadHours: number;
  region: string;
  regime: string;
  unit: string;
}

const MODELS = [
  { id: "ncum_g", name: "NCUM-G", color: "#06B6D4", type: "NWP", org: "NCMRWF" },
  { id: "neps", name: "NEPS", color: "#3B82F6", type: "Ensemble", org: "NCMRWF" },
  { id: "imd_gfs", name: "IMD-GFS", color: "#10B981", type: "NWP", org: "IMD" },
  { id: "ecmwf_ifs", name: "ECMWF-IFS", color: "#6366F1", type: "NWP", org: "ECMWF" },
  { id: "graphcast", name: "GraphCast", color: "#8B5CF6", type: "AI", org: "DeepMind" },
  { id: "pangu", name: "Pangu", color: "#D946EF", type: "AI", org: "Huawei" },
  { id: "fourcastnet", name: "FourCastNet", color: "#EC4899", type: "AI", org: "NVIDIA" }
];

export function LiveWeightSliders({
  initialWeights,
  sourceValues,
  optimalConsensus,
  variable,
  leadHours,
  region,
  regime,
  unit
}: LiveWeightSlidersProps) {
  // Weights stored as percentages (0 to 100)
  const [weights, setWeights] = useState<Record<string, number>>(() => {
    const w: Record<string, number> = {};
    MODELS.forEach((m) => {
      w[m.id] = Math.round((initialWeights[m.id] ?? 1 / 7) * 1000) / 10;
    });
    return w;
  });

  const [locked, setLocked] = useState<Record<string, boolean>>({});
  const [serverResult, setServerResult] = useState<CustomBlendResponse | null>(null);

  const customBlendMutation = useCustomBlendMutation();
  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Sync when initialWeights change (e.g. Lead or Region changed)
  useEffect(() => {
    const w: Record<string, number> = {};
    MODELS.forEach((m) => {
      w[m.id] = Math.round((initialWeights[m.id] ?? 1 / 7) * 1000) / 10;
    });
    setWeights(w);
    setLocked({});
    setServerResult(null);
  }, [initialWeights]);

  // Toggle lock on a model
  const toggleLock = (modelId: string) => {
    setLocked((prev) => ({ ...prev, [modelId]: !prev[modelId] }));
  };

  // Reset all weights to optimal baseline
  const handleResetOptimal = () => {
    const w: Record<string, number> = {};
    MODELS.forEach((m) => {
      w[m.id] = Math.round((initialWeights[m.id] ?? 1 / 7) * 1000) / 10;
    });
    setWeights(w);
    setLocked({});
    setServerResult(null);
  };

  // Debounced API submission (< 300 ms response)
  const triggerDebouncedBlend = useCallback(
    (newWeightsFraction: Record<string, number>) => {
      if (debounceTimerRef.current) clearTimeout(debounceTimerRef.current);
      debounceTimerRef.current = setTimeout(() => {
        customBlendMutation.mutate(
          {
            variable,
            lead: leadHours,
            region,
            regime,
            weights: newWeightsFraction
          },
          {
            onSuccess: (data) => {
              setServerResult(data);
            }
          }
        );
      }, 180);
    },
    [variable, leadHours, region, regime, customBlendMutation]
  );

  // Slider change handler with strict auto-normalization to 100.0%
  const handleSliderChange = (targetModelId: string, targetNewPct: number) => {
    const currentWeights = { ...weights };
    const lockedModels = Object.keys(locked).filter((m) => locked[m] && m !== targetModelId);
    const lockedSum = lockedModels.reduce((acc, m) => acc + (currentWeights[m] || 0), 0);

    const availableBudget = Math.max(0, 100 - lockedSum);
    const clampedNewPct = Math.min(Math.max(0, targetNewPct), availableBudget);
    currentWeights[targetModelId] = clampedNewPct;

    const remainingBudget = availableBudget - clampedNewPct;
    const otherUnlocked = MODELS.map((m) => m.id).filter(
      (m) => m !== targetModelId && !locked[m]
    );

    if (otherUnlocked.length > 0) {
      const otherCurrentSum = otherUnlocked.reduce(
        (acc, m) => acc + (currentWeights[m] || 0),
        0
      );

      if (otherCurrentSum > 0) {
        let runningSum = 0;
        otherUnlocked.forEach((m, idx) => {
          if (idx === otherUnlocked.length - 1) {
            // Last unlocked model takes exact remaining rounding difference
            const priorAllocated = otherUnlocked
              .slice(0, idx)
              .reduce((acc, prevM) => acc + currentWeights[prevM], 0);
            currentWeights[m] = Math.max(
              0,
              Math.round((remainingBudget - priorAllocated) * 10) / 10
            );
          } else {
            const share = (currentWeights[m] / otherCurrentSum) * remainingBudget;
            currentWeights[m] = Math.max(0, Math.round(share * 10) / 10);
            runningSum += currentWeights[m];
          }
        });
      } else {
        // Distribute equally among other unlocked
        const eq = remainingBudget / otherUnlocked.length;
        otherUnlocked.forEach((m) => {
          currentWeights[m] = Math.max(0, Math.round(eq * 10) / 10);
        });
      }
    }

    // Force sum to exactly 100.0%
    const totalSum = Object.values(currentWeights).reduce((a, b) => a + b, 0);
    const diff = Math.round((100 - totalSum) * 10) / 10;
    if (diff !== 0 && otherUnlocked.length > 0) {
      currentWeights[otherUnlocked[0]] = Math.max(
        0,
        Math.round((currentWeights[otherUnlocked[0]] + diff) * 10) / 10
      );
    }

    setWeights(currentWeights);

    // Convert to fractions (0.0 to 1.0)
    const fractions: Record<string, number> = {};
    MODELS.forEach((m) => {
      fractions[m.id] = (currentWeights[m.id] || 0) / 100;
    });

    triggerDebouncedBlend(fractions);
  };

  // Optimistic real-time calculation
  const totalWeightPercent = Object.values(weights).reduce((a, b) => a + b, 0);
  const optimisticConsensus = MODELS.reduce((acc, m) => {
    const val = sourceValues[m.id] ?? 0;
    const w = (weights[m.id] || 0) / 100;
    return acc + w * val;
  }, 0);

  const displayConsensus = serverResult
    ? serverResult.custom.value
    : Math.round(optimisticConsensus * 100) / 100;

  const valueDelta = serverResult
    ? serverResult.delta
    : Math.round((optimisticConsensus - optimalConsensus) * 100) / 100;

  return (
    <GlassCard className="p-4 flex flex-col gap-4 border-cyan-500/20">
      {/* Header and Reset Action */}
      <div className="flex items-center justify-between pb-2 border-b border-border/40">
        <div>
          <h3 className="text-sm font-semibold text-text-1 flex items-center gap-1.5">
            <Zap className="w-4 h-4 text-cyan-400" />
            <span>Interactive Weights</span>
          </h3>
          <p className="text-[11px] text-text-3">Manual override with strict auto-normalization</p>
        </div>

        <button
          onClick={handleResetOptimal}
          title="Reset to mathematically optimal weights"
          className="flex items-center gap-1 px-2 py-1 rounded text-xs font-mono text-cyan-300 hover:text-cyan-200 bg-cyan-950/40 hover:bg-cyan-900/60 border border-cyan-500/30 transition-all"
        >
          <RotateCcw className="w-3 h-3" />
          <span>Optimal</span>
        </button>
      </div>

      {/* Live "Your Blend vs Optimal" Skill Delta Card */}
      <div className="p-3 rounded-xl bg-surface-2/80 border border-cyan-500/30 flex flex-col gap-2">
        <div className="flex items-center justify-between text-xs">
          <span className="text-text-3 font-medium">Your Custom Blend</span>
          <span className="font-mono font-bold text-cyan-300 text-sm">
            {displayConsensus.toFixed(2)} {unit}
          </span>
        </div>

        <div className="flex items-center justify-between pt-1 border-t border-white/5 text-[11px]">
          <span className="text-text-3 font-mono">Vs. Optimal ({optimalConsensus.toFixed(2)} {unit})</span>
          <div className="flex items-center gap-1 font-mono font-semibold">
            {valueDelta === 0 ? (
              <span className="text-cyan-400 flex items-center gap-1">
                <CheckCircle2 className="w-3 h-3" /> 0.00 (Optimal Match)
              </span>
            ) : valueDelta > 0 ? (
              <span className="text-amber-400 flex items-center gap-1">
                <TrendingUp className="w-3 h-3" /> +{valueDelta.toFixed(2)} {unit}
              </span>
            ) : (
              <span className="text-cyan-300 flex items-center gap-1">
                <TrendingDown className="w-3 h-3" /> {valueDelta.toFixed(2)} {unit}
              </span>
            )}
          </div>
        </div>

        {/* Sum Check Badge */}
        <div className="flex items-center justify-between text-[10px] font-mono text-text-3 pt-1">
          <span>Constraint Check:</span>
          <span
            className={`font-bold ${
              Math.abs(totalWeightPercent - 100) < 0.2
                ? "text-emerald-400"
                : "text-amber-400"
            }`}
          >
            Σ w_i = {totalWeightPercent.toFixed(1)}%
          </span>
        </div>
      </div>

      {/* 7 Model Sliders */}
      <div className="flex flex-col gap-3 font-mono">
        {MODELS.map((m) => {
          const currentPct = weights[m.id] ?? 0;
          const isLocked = locked[m.id] ?? false;
          const modelVal = sourceValues[m.id] ?? 0;

          return (
            <div
              key={m.id}
              className={`p-2.5 rounded-lg border transition-all ${
                isLocked
                  ? "bg-surface-2/40 border-white/20"
                  : "bg-surface-1/60 border-border/40 hover:border-cyan-500/30"
              }`}
            >
              <div className="flex items-center justify-between mb-1.5">
                <div className="flex items-center gap-2">
                  <span
                    className="w-2.5 h-2.5 rounded-full"
                    style={{ backgroundColor: m.color }}
                  />
                  <span className="text-xs font-semibold text-text-1">{m.name}</span>
                  <span className="text-[9px] px-1 py-0.2 rounded bg-surface-3 text-text-3">
                    {m.type}
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  {/* Model Point Prediction */}
                  <span className="text-[11px] text-text-3 font-mono">
                    {modelVal.toFixed(1)}
                  </span>

                  {/* Percentage Value */}
                  <span className="text-xs font-bold text-text-1 w-12 text-right">
                    {currentPct.toFixed(1)}%
                  </span>

                  {/* Lock Toggle Button */}
                  <button
                    onClick={() => toggleLock(m.id)}
                    title={isLocked ? "Unlock weight" : "Lock weight"}
                    className={`p-1 rounded transition-colors ${
                      isLocked
                        ? "text-amber-400 bg-amber-950/40"
                        : "text-text-3 hover:text-text-1 hover:bg-surface-3"
                    }`}
                  >
                    {isLocked ? <Lock className="w-3 h-3" /> : <Unlock className="w-3 h-3" />}
                  </button>
                </div>
              </div>

              {/* Slider */}
              <Slider
                min={0}
                max={100}
                step={0.5}
                value={currentPct}
                onChange={(newVal: number) => handleSliderChange(m.id, newVal)}
                disabled={isLocked}
                className="w-full"
              />
            </div>
          );
        })}
      </div>
    </GlassCard>
  );
}
