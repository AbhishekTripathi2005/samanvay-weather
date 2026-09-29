"use client";

import React from "react";
import { GlassCard } from "@/components/ui/GlassCard";
import { Sparkles, TrendingUp, ShieldAlert, Mountain, Compass } from "lucide-react";
import { WeightsMapInsight } from "@/lib/types";

interface WeightInsightCardsProps {
  insights: WeightsMapInsight[];
}

const ICONS = [Sparkles, TrendingUp, Mountain, Compass];

export function WeightInsightCards({ insights }: WeightInsightCardsProps) {
  if (!insights || insights.length === 0) return null;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {insights.map((insight, idx) => {
        const Icon = ICONS[idx % ICONS.length];
        return (
          <GlassCard
            key={insight.id || idx}
            className="p-4 flex flex-col justify-between gap-3 border-cyan-500/20 hover:border-cyan-500/40 transition-all"
          >
            <div className="flex items-start justify-between gap-2">
              <div className="flex items-center gap-2">
                <div className="p-1.5 rounded-lg bg-cyan-950/60 border border-cyan-500/30 text-cyan-400">
                  <Icon className="w-4 h-4" />
                </div>
                <h4 className="text-xs font-bold text-text-1">{insight.title}</h4>
              </div>
              <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-surface-3 border border-border text-cyan-300 font-semibold flex-shrink-0">
                {insight.badge}
              </span>
            </div>

            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-bold font-mono text-cyan-300">
                {insight.metric}
              </span>
              <span className="text-[11px] text-text-3 font-mono">Dominance Plurality</span>
            </div>

            <p className="text-xs text-text-2 leading-relaxed">
              {insight.description}
            </p>
          </GlassCard>
        );
      })}
    </div>
  );
}
