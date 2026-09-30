"use client";

import React, { useEffect, useState, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import {
  Sparkles,
  Square,
  Play,
  Pause,
  SkipForward,
  CheckCircle2,
  Clock,
  Zap,
  ShieldCheck
} from "lucide-react";
import { useAppStore } from "@/lib/store";

interface DemoPhase {
  route: string;
  phaseTitle: string;
  caption: string;
  durationMs: number;
  action?: (store: ReturnType<typeof useAppStore.getState>) => void;
}

const DEMO_PHASES: DemoPhase[] = [
  {
    route: "/overview",
    phaseTitle: "Phase 1: National Multi-Model Consensus",
    caption: "SAMANVAY continuously ingests 7 operational models (ECMWF, NCMRWF, IMD-GFS, GraphCast, Pangu, FourCastNet). The 0.5° consensus synthesizes national alerts in real-time.",
    durationMs: 12000,
    action: (s) => {
      s.setVariable("rainfall");
      s.setLead(72);
      s.setRegime("Active monsoon");
    }
  },
  {
    route: "/forecast",
    phaseTitle: "Phase 2: Lead Scrubbing & Uncertainty Fan Chart",
    caption: "Scrubbing Day 1 to Day 5: Notice how the AI surrogates maintain sharp synoptic circulation while ensemble quantiles (P10/P90) capture convective variance.",
    durationMs: 14000,
    action: (s) => {
      s.setLead(96);
      s.setRegion("KL");
    }
  },
  {
    route: "/weights",
    phaseTitle: "Phase 3: Regional Adaptive Model Attribution",
    caption: "Non-negative least squares (NNLS) assigns dynamic weights summing strictly to 1.0. AI foundation models dominate peninsular India while physics NWP anchors the Himalayas.",
    durationMs: 14000,
    action: (s) => {
      s.setRegion("MH");
    }
  },
  {
    route: "/models",
    phaseTitle: "Phase 4: Honest Scientific Verification & Taylor Diagram",
    caption: "SAMANVAY features honest science: the Taylor diagram and Win/Loss matrix openly illustrate where the blend outperforms and where individual NWP models retain edges.",
    durationMs: 14000
  },
  {
    route: "/extremes",
    phaseTitle: "Phase 5: Four-Tier Disaster Decision Support (IMD)",
    caption: "Exceedance probabilities are mapped directly into IMD four-tier alerts (Green, Yellow, Orange, Red) with district emergency protocols and demographic exposures.",
    durationMs: 14000,
    action: (s) => {
      s.setVariable("rainfall");
    }
  },
  {
    route: "/impact",
    phaseTitle: "Phase 6: Mountain Hydrology & Landslide Risk (Shimla)",
    caption: "Physics-constrained water balance: dS/dt = P - R - ET guarantees mass conservation (R=ET=0 on dry days), feeding 30m DEM landslide susceptibility for Himachal Pradesh.",
    durationMs: 14000
  },
  {
    route: "/ops",
    phaseTitle: "Phase 7: Operational Pipeline & Streaming SSE",
    caption: "The production engine orchestrates a 7-stage DAG (Ingest ? QC ? Bias-Correct ? Weight ? Blend ? Verify ? Publish) with real-time Server-Sent Events (SSE).",
    durationMs: 14000
  },
  {
    route: "/about",
    phaseTitle: "Phase 8: Mathematical Methodology & Transparency",
    caption: "Explore rigorous KaTeX peer-reviewed formulations (Quantile Mapping, NNLS, CRPS, SEDI), assumptions, honest limitations, and full research credits.",
    durationMs: 14000
  }
];

export function DemoMode() {
  const router = useRouter();
  const { isDemoMode, setIsDemoMode, demoStep, setDemoStep } = useAppStore();
  const [isPaused, setIsPaused] = useState(false);
  const [elapsed, setElapsed] = useState(0);

  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const currentPhase = DEMO_PHASES[demoStep] || DEMO_PHASES[0];

  const stopDemo = useCallback(() => {
    if (timerRef.current) clearInterval(timerRef.current);
    setIsDemoMode(false);
    setDemoStep(0);
    setElapsed(0);
  }, [setIsDemoMode, setDemoStep]);

  const advanceStep = useCallback(() => {
    setElapsed(0);
    if (demoStep >= DEMO_PHASES.length - 1) {
      stopDemo();
      return;
    }
    const nextIdx = demoStep + 1;
    setDemoStep(nextIdx);
    const nextPhase = DEMO_PHASES[nextIdx];
    router.push(nextPhase.route);
    if (nextPhase.action) {
      nextPhase.action(useAppStore.getState());
    }
  }, [demoStep, router, setDemoStep, stopDemo]);

  // Initial trigger for step 0
  useEffect(() => {
    if (isDemoMode && demoStep === 0 && elapsed === 0) {
      const p = DEMO_PHASES[0];
      router.push(p.route);
      if (p.action) p.action(useAppStore.getState());
    }
  }, [isDemoMode, demoStep, elapsed, router]);

  // Timer loop
  useEffect(() => {
    if (!isDemoMode || isPaused) {
      if (timerRef.current) clearInterval(timerRef.current);
      return;
    }

    const interval = 200; // tick every 200ms
    timerRef.current = setInterval(() => {
      setElapsed((prev) => {
        const next = prev + interval;
        if (next >= currentPhase.durationMs) {
          advanceStep();
          return 0;
        }
        return next;
      });
    }, interval);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isDemoMode, isPaused, currentPhase, advanceStep]);

  if (!isDemoMode) return null;

  const phaseProgress = Math.min(100, Math.round((elapsed / currentPhase.durationMs) * 100));
  const totalProgress = Math.round(((demoStep + phaseProgress / 100) / DEMO_PHASES.length) * 100);

  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 w-[94vw] max-w-3xl bg-surface-1/95 border-2 border-cyan-500/70 rounded-2xl shadow-2xl backdrop-blur-xl p-4 animate-in slide-in-from-bottom duration-300">
      {/* Top Bar with Step & Controls */}
      <div className="flex items-center justify-between gap-3 mb-2.5">
        <div className="flex items-center gap-2">
          <span className="p-1.5 rounded-lg bg-gradient-to-r from-cyan-500 to-indigo-600 text-white animate-pulse">
            <Sparkles className="w-4 h-4" />
          </span>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-cyan-300 font-mono">EVALUATOR DEMO MODE</span>
              <span className="text-[10px] font-mono text-text-3 px-2 py-0.5 rounded bg-surface-2 border border-border/40">
                Step {demoStep + 1} of {DEMO_PHASES.length} ({totalProgress}% total)
              </span>
            </div>
            <div className="text-xs font-bold text-text-1 mt-0.5">
              {currentPhase.phaseTitle}
            </div>
          </div>
        </div>

        {/* Player Controls */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsPaused(!isPaused)}
            className="p-1.5 rounded-lg bg-surface-2 hover:bg-surface-3 border border-border text-text-2 hover:text-text-1 transition-colors cursor-pointer"
            title={isPaused ? "Resume Walkthrough" : "Pause Walkthrough"}
          >
            {isPaused ? <Play className="w-4 h-4 text-emerald-400" /> : <Pause className="w-4 h-4 text-amber-400" />}
          </button>

          <button
            onClick={advanceStep}
            className="p-1.5 rounded-lg bg-surface-2 hover:bg-surface-3 border border-border text-text-2 hover:text-text-1 transition-colors cursor-pointer"
            title="Skip to next step"
          >
            <SkipForward className="w-4 h-4 text-cyan-400" />
          </button>

          <button
            onClick={stopDemo}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-rose-500/20 hover:bg-rose-500/30 border border-rose-500/50 text-rose-300 text-xs font-bold transition-colors cursor-pointer ml-1"
          >
            <Square className="w-3.5 h-3.5 fill-current" />
            <span>Stop Demo</span>
          </button>
        </div>
      </div>

      {/* Caption Narrative Text */}
      <div className="text-xs text-text-2 leading-relaxed bg-surface-2/60 p-2.5 rounded-xl border border-border/40 mb-2.5">
        {currentPhase.caption}
      </div>

      {/* Progress Bars */}
      <div className="space-y-1">
        <div className="flex justify-between text-[10px] font-mono text-text-3">
          <span>Active Phase: {Math.round((currentPhase.durationMs - elapsed) / 1000)}s remaining</span>
          <span>Route: {currentPhase.route}</span>
        </div>
        <div className="w-full h-1.5 rounded-full bg-surface-3 overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-cyan-400 to-indigo-500 rounded-full transition-all duration-200"
            style={{ width: `${phaseProgress}%` }}
          />
        </div>
      </div>
    </div>
  );
}
