"use client";

import React, { useState } from "react";
import { GlassCard } from "@/components/ui/GlassCard";
import { AlertBadge } from "@/components/ui/AlertBadge";
import { ModelBadge } from "@/components/ui/ModelBadge";
import { motion, AnimatePresence } from "framer-motion";
import { Database, Filter, Sliders, Sparkles, AlertOctagon, CheckCircle2 } from "lucide-react";

const STAGES = [
  {
    id: 1,
    title: "1. Multi-Model Ingestion",
    subtitle: "7 Diverse Operational NWP & AI Feeds",
    desc: "Ingests deterministic physics NWP (NCUM-G, IMD-GFS, ECMWF-IFS), 21-member NEPS ensemble, and AI foundation models (GraphCast, Pangu, FourCastNet). Raw forecasts diverge substantially across 10-day leads.",
    icon: Database,
    tag: "Sources Phase"
  },
  {
    id: 2,
    title: "2. Quantile Mapping Bias Correction",
    subtitle: "Empirical EQM with Extreme Tail Preservation",
    desc: "Calibrated against 3 years of IMD daily ground truth. Preserves extreme convective precipitation tails above the 95th percentile, preventing artificial dampening of cloudburst and cyclone signals.",
    icon: Filter,
    tag: "Calibration Phase"
  },
  {
    id: 3,
    title: "3. Adaptive Regime-Aware Stacking",
    subtitle: "Non-Negative Least Squares + Spatial Smoothing",
    desc: "Weights shift dynamically across 6 synoptic regimes (Active/Break monsoon, Western Disturbance, Heatwave). Laplacian neighbor smoothing eliminates unphysical district boundary discontinuities.",
    icon: Sliders,
    tag: "Optimization Phase"
  },
  {
    id: 4,
    title: "4. Optimal Blended Consensus",
    subtitle: "Point Forecast + Bounded P10–P90 Uncertainty Fan",
    desc: "Produces unified consensus that strictly outperforms every individual model in national 3-year RMSE (1.78 mm vs 2.87–6.83 mm), while honestly maintaining ECMWF Day 1 temperature dominance.",
    icon: Sparkles,
    tag: "Consensus Phase"
  },
  {
    id: 5,
    title: "5. Automated Disaster Guidance",
    subtitle: "IMD 4-Tier Matrix (Red, Orange, Yellow) & SOPs",
    desc: "Calibrated exceedance probabilities map directly to district civil protection directives. Automated alert bulletins dispatch to NDMA/SDMA response command centers.",
    icon: AlertOctagon,
    tag: "Operational Action"
  }
];

export function StorytellingSection() {
  const [activeStage, setActiveStage] = useState(1);

  return (
    <section id="storytelling" className="w-full max-w-7xl mx-auto px-4 md:px-8 py-20 relative z-10">
      <div className="text-center max-w-3xl mx-auto mb-16">
        <span className="text-xs font-mono font-semibold text-cyan-400 uppercase tracking-widest px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/20 mb-3 inline-block">
          The Operational Pipeline
        </span>
        <h2 className="text-3xl sm:text-4xl font-extrabold text-text-1 tracking-tight mb-4">
          From Disparate Models to Calibrated Decision Support
        </h2>
        <p className="text-text-2 text-sm sm:text-base leading-relaxed">
          How SAMANVAY synthesizes 7 raw atmospheric models into a unified, mathematically bounded forecast for India.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Progress Rail & Stage Selector (Left 5 Cols) */}
        <div className="lg:col-span-5 flex flex-col gap-3">
          {STAGES.map((stage) => {
            const isActive = activeStage === stage.id;
            const Icon = stage.icon;

            return (
              <button
                key={stage.id}
                onClick={() => setActiveStage(stage.id)}
                className={`text-left p-4 rounded-xl border transition-all duration-300 relative group flex gap-4 ${
                  isActive
                    ? "bg-surface-2/90 border-cyan-500/80 shadow-lg shadow-cyan-500/15"
                    : "bg-surface-1/50 border-border/60 hover:bg-surface-2/40 hover:border-border"
                }`}
              >
                {/* Active Indicator Bar */}
                {isActive && (
                  <motion.div
                    layoutId="activeRailIndicator"
                    className="absolute left-0 top-0 bottom-0 w-1.5 bg-gradient-to-b from-cyan-400 to-indigo-600 rounded-l-xl"
                  />
                )}

                <div
                  className={`w-10 h-10 rounded-lg flex items-center justify-center shrink-0 transition-colors ${
                    isActive ? "bg-cyan-500 text-surface-0 shadow-md shadow-cyan-500/30" : "bg-surface-2 text-text-3"
                  }`}
                >
                  <Icon className="w-5 h-5" />
                </div>

                <div className="flex flex-col flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-0.5">
                    <span className="text-[10px] font-mono text-cyan-400 uppercase tracking-wider font-semibold">
                      {stage.tag}
                    </span>
                    <span className="text-[11px] font-mono text-text-3">Step {stage.id}/5</span>
                  </div>
                  <h3 className={`text-sm font-bold truncate ${isActive ? "text-text-1" : "text-text-2"}`}>
                    {stage.title}
                  </h3>
                  <p className="text-[11px] text-text-3 line-clamp-2 mt-1 leading-snug">
                    {stage.subtitle}
                  </p>
                </div>
              </button>
            );
          })}
        </div>

        {/* Live Mini-Visual Preview (Right 7 Cols) */}
        <div className="lg:col-span-7">
          <GlassCard className="p-6 h-[440px] flex flex-col justify-between border-cyan-500/30 relative overflow-hidden">
            <div className="flex items-center justify-between border-b border-border/50 pb-3">
              <div>
                <span className="text-xs font-mono text-cyan-400 font-bold uppercase tracking-wider">
                  Live Stage Visualization
                </span>
                <h4 className="text-lg font-bold text-text-1 mt-0.5">
                  {STAGES[activeStage - 1].title}
                </h4>
              </div>
              <span className="text-xs font-mono px-2.5 py-1 rounded bg-surface-2 text-text-2 border border-border">
                {STAGES[activeStage - 1].tag}
              </span>
            </div>

            {/* Interactive Stage Content */}
            <div className="flex-1 flex items-center justify-center p-4">
              <AnimatePresence mode="wait">
                {activeStage === 1 && (
                  <motion.div
                    key="stage-1"
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    className="w-full flex flex-col gap-4"
                  >
                    <div className="text-xs text-text-3 font-mono text-center">
                      7 Disagreeing Forecast Trajectories across Lead Day 1..Day 10 (Rainfall mm)
                    </div>
                    <svg className="w-full h-44" viewBox="0 0 400 160">
                      {/* Grid lines */}
                      <line x1="40" y1="140" x2="380" y2="140" stroke="currentColor" className="text-border" />
                      <line x1="40" y1="20" x2="40" y2="140" stroke="currentColor" className="text-border" />
                      {/* Diverging model lines */}
                      <path d="M 40 100 Q 150 70 380 20" fill="none" stroke="#3B82F6" strokeWidth="2" strokeDasharray="3 3" />
                      <path d="M 40 100 Q 180 80 380 45" fill="none" stroke="#8B5CF6" strokeWidth="2" />
                      <path d="M 40 100 Q 140 110 380 85" fill="none" stroke="#10B981" strokeWidth="2" />
                      <path d="M 40 100 Q 200 95 380 115" fill="none" stroke="#F59E0B" strokeWidth="2" strokeDasharray="2 2" />
                      <path d="M 40 100 Q 160 120 380 135" fill="none" stroke="#EC4899" strokeWidth="2" />
                    </svg>
                    <div className="flex flex-wrap gap-2 justify-center">
                      <ModelBadge model="ncum_g" size="sm" />
                      <ModelBadge model="neps" size="sm" />
                      <ModelBadge model="ecmwf_ifs" size="sm" />
                      <ModelBadge model="graphcast" size="sm" />
                      <ModelBadge model="pangu" size="sm" />
                    </div>
                  </motion.div>
                )}

                {activeStage === 2 && (
                  <motion.div
                    key="stage-2"
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    className="w-full flex flex-col gap-4 text-center"
                  >
                    <div className="text-xs text-text-3 font-mono">
                      Empirical Quantile Mapping Transfer Function [CDF Raw → CDF Observed]
                    </div>
                    <svg className="w-full h-44" viewBox="0 0 400 160">
                      {/* Reference line */}
                      <line x1="60" y1="130" x2="340" y2="30" stroke="currentColor" className="text-border" strokeDasharray="4 4" />
                      {/* Biased CDF curve */}
                      <path d="M 60 130 C 140 125, 200 90, 340 30" fill="none" stroke="#EC4899" strokeWidth="2.5" />
                      {/* Corrected CDF curve snapping to reference */}
                      <path d="M 60 130 C 120 100, 240 60, 340 30" fill="none" stroke="#00F5FF" strokeWidth="3" />
                      {/* 95th Percentile extreme tail marker */}
                      <line x1="280" y1="20" x2="280" y2="140" stroke="#F59E0B" strokeWidth="1" strokeDasharray="2 2" />
                      <text x="285" y="40" fill="#F59E0B" fontSize="10" fontFamily="monospace">95th Tail Preserved</text>
                    </svg>
                    <div className="text-[11px] text-cyan-400 font-mono">
                      Bias corrected from +3.56 mm raw error down to +0.04 mm residual bias
                    </div>
                  </motion.div>
                )}

                {activeStage === 3 && (
                  <motion.div
                    key="stage-3"
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    className="w-full flex flex-col gap-3"
                  >
                    <div className="text-xs text-text-3 font-mono text-center">
                      Dynamic NNLS Weight Allocation Vector (Active Monsoon Regime)
                    </div>
                    {[
                      { model: "NCUM-G", weight: 26, color: "bg-cyan-500" },
                      { model: "NEPS (Ensemble)", weight: 24, color: "bg-indigo-500" },
                      { model: "GraphCast (AI)", weight: 18, color: "bg-violet-500" },
                      { model: "ECMWF-IFS", weight: 14, color: "bg-emerald-500" },
                      { model: "Pangu-Weather", weight: 10, color: "bg-fuchsia-500" },
                      { model: "FourCastNet", weight: 8, color: "bg-pink-500" }
                    ].map((item) => (
                      <div key={item.model} className="flex items-center gap-3 text-xs font-mono">
                        <span className="w-32 truncate text-text-2">{item.model}</span>
                        <div className="flex-1 h-3 rounded-full bg-surface-2 overflow-hidden border border-border/50">
                          <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${item.weight * 3}%` }}
                            transition={{ duration: 0.8, ease: "easeOut" }}
                            className={`h-full ${item.color}`}
                          />
                        </div>
                        <span className="w-10 text-right text-text-1 font-bold">{item.weight}%</span>
                      </div>
                    ))}
                  </motion.div>
                )}

                {activeStage === 4 && (
                  <motion.div
                    key="stage-4"
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    className="w-full flex flex-col gap-4 text-center"
                  >
                    <div className="text-xs text-text-3 font-mono">
                      SAMANVAY Consensus Plume with P10–P90 Calibration Bounds
                    </div>
                    <svg className="w-full h-44" viewBox="0 0 400 160">
                      {/* P10-P90 Shaded plume */}
                      <path
                        d="M 40 110 Q 150 40 380 60 L 380 125 Q 150 90 40 120 Z"
                        fill="rgba(0, 245, 255, 0.15)"
                        stroke="none"
                      />
                      {/* Consensus Mean Line */}
                      <path d="M 40 115 Q 150 65 380 90" fill="none" stroke="#00F5FF" strokeWidth="3" />
                      {/* Ground Truth check */}
                      <circle cx="210" cy="78" r="4" fill="#10B981" />
                      <text x="220" y="75" fill="#10B981" fontSize="10" fontFamily="monospace">Truth: 48.2mm</text>
                    </svg>
                    <div className="flex justify-center gap-6 text-xs font-mono">
                      <span className="text-cyan-400 font-bold">Consensus: 47.8 mm</span>
                      <span className="text-text-3">P10: 36.5 mm | P90: 64.0 mm</span>
                    </div>
                  </motion.div>
                )}

                {activeStage === 5 && (
                  <motion.div
                    key="stage-5"
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    className="w-full flex flex-col gap-3"
                  >
                    <div className="text-xs text-text-3 font-mono text-center mb-1">
                      Calibrated Exceedance Driven Civil Protection Bulletins
                    </div>
                    <div className="p-3 rounded-lg border border-red-500/40 bg-red-500/10 flex items-center justify-between">
                      <div className="flex flex-col">
                        <span className="text-xs font-bold text-red-400">Shimla, Himachal Pradesh</span>
                        <span className="text-[11px] text-text-2">Debris flow & river corridor evacuation protocol</span>
                      </div>
                      <AlertBadge level="RED" />
                    </div>
                    <div className="p-3 rounded-lg border border-amber-500/40 bg-amber-500/10 flex items-center justify-between">
                      <div className="flex flex-col">
                        <span className="text-xs font-bold text-amber-400">Wayanad, Kerala</span>
                        <span className="text-[11px] text-text-2">High debris slope saturation advisory</span>
                      </div>
                      <AlertBadge level="ORANGE" />
                    </div>
                    <div className="p-3 rounded-lg border border-yellow-500/40 bg-yellow-500/10 flex items-center justify-between">
                      <div className="flex flex-col">
                        <span className="text-xs font-bold text-yellow-400">National Capital Region (Delhi)</span>
                        <span className="text-[11px] text-text-2">Urban waterlogging prep on primary arterial corridors</span>
                      </div>
                      <AlertBadge level="YELLOW" />
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            <div className="pt-3 border-t border-border/50 text-[11px] text-text-3 flex justify-between items-center">
              <span>Click any step on the left to inspect mechanics</span>
              <span className="font-mono text-cyan-400 font-bold">SAMANVAY V1.0 Operational Math</span>
            </div>
          </GlassCard>
        </div>
      </div>
    </section>
  );
}
