"use client";

import React, { useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  Compass,
  X,
  ChevronRight,
  ChevronLeft,
  Check,
  Sparkles,
  Layers,
  MapPin,
  Clock,
  Wind,
  Sliders,
  AlertTriangle,
  Cpu
} from "lucide-react";
import { useAppStore } from "@/lib/store";

interface TourStep {
  title: string;
  category: string;
  description: string;
  route: string;
  icon: React.ElementType;
}

const TOUR_STEPS: TourStep[] = [
  {
    title: "1. National Command Center",
    category: "Overview",
    description: "Welcome to SAMANVAY (समन्वय)! This central operations deck integrates 7 NWP and AI weather models across 36 states and union territories with real-time hazard severity badges.",
    route: "/overview",
    icon: Compass
  },
  {
    title: "2. Atmospheric Variables",
    category: "Controls",
    description: "Switch seamlessly between 24h Precipitation (mm), Maximum/Minimum Temperature (°C), and 10m Wind Gusts (km/h) across the entire Indian sub-continent.",
    route: "/overview",
    icon: Layers
  },
  {
    title: "3. 10-Day Forecast Lead Scrubber",
    category: "Controls",
    description: "Scrub lead times from Day 1 (+24h) to Day 10 (+240h). Notice how AI foundation models retain synoptic steering skill while ensemble spreads widen realistically.",
    route: "/forecast",
    icon: Clock
  },
  {
    title: "4. Synoptic Weather Regimes",
    category: "Meteorology",
    description: "SAMANVAY automatically detects macro-scale circulation states (Active Monsoon, Western Disturbance, Heatwave Ridge) and switches regional model weight priors dynamically.",
    route: "/regimes",
    icon: Wind
  },
  {
    title: "5. Adaptive Weights & Stacking",
    category: "Engine",
    description: "Explore the geographic choropleth showing winning models per state. Non-negative least squares (NNLS) ensures weights strictly sum to 1.0 with spatial Laplacian smoothing.",
    route: "/weights",
    icon: Sliders
  },
  {
    title: "6. Verification & Honest Science",
    category: "Verification",
    description: "Inspect RMSE, CRPS, and SEDI leaderboards. The interactive Taylor diagram and Win/Loss matrix openly reveal specific lead times where individual NWP models outperform.",
    route: "/models",
    icon: Sparkles
  },
  {
    title: "7. Extreme Weather & Landslides",
    category: "Disaster DSS",
    description: "Review IMD four-tier district warnings and the physics-based water balance module (dS/dt = P - R - ET), complete with 30m DEM landslide susceptibility for the Western Himalayas.",
    route: "/extremes",
    icon: AlertTriangle
  },
  {
    title: "8. Operational DAG & Command Palette",
    category: "Operations",
    description: "Inspect the 7-node streaming SSE pipeline, download CF-1.8 NetCDF and GeoJSON bulletins with SHA-256 checksums, and tap Ctrl+K anywhere to launch the Command Palette.",
    route: "/ops",
    icon: Cpu
  }
];

export function ProductTour() {
  const router = useRouter();
  const { isTourOpen, setIsTourOpen, tourStep, setTourStep } = useAppStore();

  const step = TOUR_STEPS[tourStep] || TOUR_STEPS[0];
  const isLast = tourStep === TOUR_STEPS.length - 1;
  const isFirst = tourStep === 0;

  // Handle Escape key to close without trapping focus
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isTourOpen) {
        setIsTourOpen(false);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isTourOpen, setIsTourOpen]);

  if (!isTourOpen) return null;

  const handleNext = () => {
    if (isLast) {
      setIsTourOpen(false);
      return;
    }
    const nextIdx = tourStep + 1;
    setTourStep(nextIdx);
    const nextRoute = TOUR_STEPS[nextIdx].route;
    router.push(nextRoute);
  };

  const handlePrev = () => {
    if (isFirst) return;
    const prevIdx = tourStep - 1;
    setTourStep(prevIdx);
    const prevRoute = TOUR_STEPS[prevIdx].route;
    router.push(prevRoute);
  };

  const Icon = step.icon;

  return (
    <div className="fixed inset-0 z-50 bg-black/65 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200">
      <div className="w-full max-w-lg bg-surface-1 border border-border/80 rounded-2xl shadow-2xl overflow-hidden flex flex-col animate-in zoom-in-95 duration-150">
        {/* Step Progress Top Bar */}
        <div className="w-full h-1.5 bg-surface-3">
          <div
            className="h-full bg-gradient-to-r from-cyan-400 via-indigo-500 to-emerald-400 transition-all duration-300"
            style={{ width: `${((tourStep + 1) / TOUR_STEPS.length) * 100}%` }}
          />
        </div>

        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-border/50 flex items-center justify-between bg-surface-2/40">
          <div className="flex items-center gap-2">
            <span className="p-1.5 rounded-lg bg-cyan-500/20 text-cyan-300">
              <Icon className="w-4 h-4" />
            </span>
            <span className="text-[11px] font-mono text-cyan-400 font-bold uppercase tracking-wider">
              {step.category}
            </span>
            <span className="text-text-3 text-xs">· Step {tourStep + 1} of {TOUR_STEPS.length}</span>
          </div>

          <button
            onClick={() => setIsTourOpen(false)}
            className="p-1 rounded-lg text-text-3 hover:text-text-1 hover:bg-surface-2 transition-colors cursor-pointer"
            aria-label="Skip and close product tour"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 flex flex-col gap-3">
          <h3 className="text-base font-bold text-text-1">
            {step.title}
          </h3>
          <p className="text-xs text-text-2 leading-relaxed">
            {step.description}
          </p>

          <div className="flex items-center gap-1.5 mt-2 text-[11px] font-mono text-text-3 bg-surface-2/60 p-2.5 rounded-xl border border-border/40">
            <span className="text-cyan-400 font-semibold">Active Module:</span>
            <span>{step.route}</span>
          </div>
        </div>

        {/* Modal Footer Controls */}
        <div className="px-6 py-4 border-t border-border/50 bg-surface-2/30 flex items-center justify-between">
          <button
            onClick={() => setIsTourOpen(false)}
            className="text-xs text-text-3 hover:text-text-1 transition-colors px-2 py-1 rounded"
          >
            Skip Tour (ESC)
          </button>

          <div className="flex items-center gap-2">
            {!isFirst && (
              <button
                onClick={handlePrev}
                className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-surface-2 hover:bg-surface-3 border border-border text-text-2 text-xs font-semibold transition-colors"
              >
                <ChevronLeft className="w-3.5 h-3.5" />
                <span>Back</span>
              </button>
            )}

            <button
              onClick={handleNext}
              className="flex items-center gap-1.5 px-4 py-1.5 rounded-xl bg-gradient-to-r from-cyan-500 to-indigo-600 text-white font-bold text-xs shadow-md shadow-cyan-500/20 hover:opacity-95 transition-all cursor-pointer"
            >
              <span>{isLast ? "Finish Tour" : "Next"}</span>
              {isLast ? <Check className="w-3.5 h-3.5" /> : <ChevronRight className="w-3.5 h-3.5" />}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
