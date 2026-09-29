"use client";

import React, { useState, useEffect } from "react";
import { Dialog } from "@/components/ui/Dialog";
import { Play, Pause, RotateCcw, CheckCircle2, ChevronRight, Activity } from "lucide-react";

interface DemoModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const DEMO_STEPS = [
  { step: 1, name: "Parallel Ingestion", detail: "Syncing 7 feeds (NCUM, NEPS, IFS, GFS, GraphCast, Pangu, FourCastNet)...", duration: 1800 },
  { step: 2, name: "Regime Detection", detail: "Analyzing surface pressure gradients -> ACTIVE MONSOON detected.", duration: 1500 },
  { step: 3, name: "Quantile Mapping", detail: "Applying EQM with tail preservation on heavy precipitation cells...", duration: 2000 },
  { step: 4, name: "NNLS Stacking", detail: "Computing optimal constrained weights with spatial Laplacian smoothing...", duration: 2200 },
  { step: 5, name: "Consensus Synthesis", detail: "Generated 0.5° consensus field + 7 district RED alerts dispatched.", duration: 2000 }
];

export function DemoModal({ isOpen, onClose }: DemoModalProps) {
  const [currentStep, setCurrentStep] = useState(1);
  const [isPlaying, setIsPlaying] = useState(true);

  useEffect(() => {
    if (!isOpen || !isPlaying) return;

    const timer = setTimeout(() => {
      setCurrentStep((prev) => (prev < 5 ? prev + 1 : 1));
    }, DEMO_STEPS[currentStep - 1].duration);

    return () => clearTimeout(timer);
  }, [isOpen, isPlaying, currentStep]);

  return (
    <Dialog isOpen={isOpen} onClose={onClose} title="SAMANVAY Operational Blend Simulation" className="max-w-2xl">
      <div className="flex flex-col gap-6 py-2">
        <p className="text-xs text-text-3">
          Watch the automated 5-step blending pipeline execute in real-time on 00Z cycle data:
        </p>

        {/* Pipeline Steps Tracker */}
        <div className="grid grid-cols-5 gap-2">
          {DEMO_STEPS.map((s) => {
            const isDone = currentStep > s.step;
            const isCurrent = currentStep === s.step;

            return (
              <div
                key={s.step}
                className={`p-2.5 rounded-lg border text-center transition-all ${
                  isCurrent
                    ? "bg-cyan-500/15 border-cyan-500 text-cyan-300 font-bold"
                    : isDone
                    ? "bg-emerald-500/10 border-emerald-500/40 text-emerald-400"
                    : "bg-surface-2 border-border text-text-3"
                }`}
              >
                <div className="text-[10px] font-mono mb-1">Phase {s.step}</div>
                <div className="text-[11px] truncate">{s.name}</div>
              </div>
            );
          })}
        </div>

        {/* Live Terminal Output */}
        <div className="p-4 rounded-xl bg-surface-0 border border-border/80 font-mono text-xs text-text-2 flex flex-col gap-2 min-h-[140px]">
          <div className="flex items-center justify-between text-text-3 text-[11px] border-b border-border/40 pb-2">
            <span className="flex items-center gap-1.5 text-cyan-400 font-bold">
              <Activity className="w-3.5 h-3.5 animate-spin" />
              LIVE TELEMETRY LOG
            </span>
            <span>CYCLE: 2026-09-29 00:00Z</span>
          </div>
          <div className="text-cyan-400 font-bold mt-1">
            &gt; STAGE {currentStep}: {DEMO_STEPS[currentStep - 1].name}
          </div>
          <div className="text-text-1">
            {DEMO_STEPS[currentStep - 1].detail}
          </div>
          <div className="text-[11px] text-text-3 mt-auto">
            Execution time: {(currentStep * 0.28).toFixed(2)}s | RAM: 124MB | Offline Cache: OK
          </div>
        </div>

        {/* Controls */}
        <div className="flex items-center justify-between pt-2 border-t border-border/60">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsPlaying(!isPlaying)}
              className="px-3 py-1.5 rounded-lg bg-surface-2 hover:bg-surface-3 text-text-1 border border-border text-xs flex items-center gap-1.5 transition-colors"
            >
              {isPlaying ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
              <span>{isPlaying ? "Pause" : "Play"}</span>
            </button>
            <button
              onClick={() => setCurrentStep(1)}
              className="px-3 py-1.5 rounded-lg bg-surface-2 hover:bg-surface-3 text-text-2 border border-border text-xs flex items-center gap-1.5 transition-colors"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Restart</span>
            </button>
          </div>

          <span className="text-[11px] text-text-3 font-mono">
            Step {currentStep} of 5
          </span>
        </div>
      </div>
    </Dialog>
  );
}
