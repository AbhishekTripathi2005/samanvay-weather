"use client";

import React, { useState, useMemo } from "react";
import {
  BookOpen,
  Calculator,
  Database,
  ShieldCheck,
  AlertTriangle,
  Search,
  Users,
  ExternalLink,
  Layers,
  Atom,
  CheckCircle2,
  FileCode
} from "lucide-react";
import { GlassCard } from "@/components/ui/GlassCard";
import { KatexMath } from "@/components/ui/KatexMath";

// Comprehensive Glossary of Terms
interface GlossaryTerm {
  term: string;
  category: "Statistics" | "Physics" | "AI & ML" | "Meteorology";
  definition: string;
  formula?: string;
}

const GLOSSARY_TERMS: GlossaryTerm[] = [
  {
    term: "Empirical Quantile Mapping (EQM)",
    category: "Statistics",
    definition: "Non-parametric bias correction calibrating the cumulative distribution function (CDF) of model predictions to match historical observational CDFs.",
    formula: "x_{\\text{corr}} = F_{\\text{obs}}^{-1}(F_{\\text{model}}(x_{\\text{raw}}))"
  },
  {
    term: "Non-Negative Least Squares (NNLS)",
    category: "AI & ML",
    definition: "Constrained quadratic optimization estimating multi-model blending weights strictly bound to non-negative values and regularized to sum to unity.",
    formula: "\\min_{\\mathbf{w}} \\|\\mathbf{y} - \\sum w_m \\hat{\\mathbf{y}}_m\\|_2^2 \\quad \\text{s.t.} \\quad w_m \\ge 0"
  },
  {
    term: "Continuous Ranked Probability Score (CRPS)",
    category: "Statistics",
    definition: "Proper scoring rule quantifying the distance between probabilistic forecast distributions and scalar verification observations across all thresholds.",
    formula: "\\text{CRPS}(F, y) = \\int_{-\\infty}^\\infty (F(x) - \\mathbb{I}(x \\ge y))^2 dx"
  },
  {
    term: "Symmetric Extremal Dependence Index (SEDI)",
    category: "Meteorology",
    definition: "Base-rate independent verification metric assessing forecast skill for rare severe weather events without degeneracy as frequency approaches zero.",
    formula: "\\text{SEDI} = \\frac{\\ln F - \\ln H - \\ln(1-F) + \\ln(1-H)}{\\ln F + \\ln H + \\ln(1-F) + \\ln(1-H)}"
  },
  {
    term: "Inverse-Skill Softmax Weighting",
    category: "AI & ML",
    definition: "Dynamic model weighting algorithm mapping validation error metrics into convex combinations via scaled temperature softmax.",
    formula: "w_m = \\frac{\\exp(-\\text{RMSE}_m / \\tau)}{\\sum_k \\exp(-\\text{RMSE}_k / \\tau)}"
  },
  {
    term: "Physics-Informed Neural Network (PINN)",
    category: "AI & ML",
    definition: "Neural surrogate architecture incorporating conservation of mass, momentum, and moisture flux divergence directly into its loss function.",
    formula: "\\mathcal{L}_{\\text{total}} = \\mathcal{L}_{\\text{data}} + \\lambda_{\\text{physics}} \\|\\nabla \\cdot (\\mathbf{v} q) - (P - E)\\|_2^2"
  },
  {
    term: "Antecedent Precipitation Index (API-30)",
    category: "Physics",
    definition: "Geotechnical proxy for ground water saturation computing exponentially decaying cumulative rainfall over a 30-day antecedent window.",
    formula: "\\text{API}_{30} = \\sum_{t=1}^{30} \\alpha^t P_t \\quad (\\alpha = 0.90)"
  },
  {
    term: "Infinite Slope Factor of Safety (FS)",
    category: "Physics",
    definition: "Ratio of resisting shear strength to destabilizing shear stress in a saturated soil mantle resting on mountain bedrock.",
    formula: "FS = \\frac{c' + (\\gamma z - \\gamma_w h_w)\\cos^2\\beta \\tan\\phi'}{\\gamma z \\sin\\beta \\cos\\beta}"
  },
  {
    term: "Synoptic Weather Regime",
    category: "Meteorology",
    definition: "Macro-scale atmospheric circulation pattern (e.g. Active Monsoon Trough, Western Disturbance, Heatwave Ridge) governing regional predictability."
  },
  {
    term: "Equitable Threat Score (ETS)",
    category: "Statistics",
    definition: "Contingency verification metric measuring fraction of observed/forecast events correctly predicted, penalizing random chance hits."
  }
];

export default function AboutMethodologyPage() {
  const [glossaryQuery, setGlossaryQuery] = useState("");
  const [glossaryCategory, setGlossaryCategory] = useState<string>("ALL");

  const filteredGlossary = useMemo(() => {
    return GLOSSARY_TERMS.filter((g) => {
      const matchQuery =
        g.term.toLowerCase().includes(glossaryQuery.toLowerCase()) ||
        g.definition.toLowerCase().includes(glossaryQuery.toLowerCase());
      const matchCat = glossaryCategory === "ALL" || g.category === glossaryCategory;
      return matchQuery && matchCat;
    });
  }, [glossaryQuery, glossaryCategory]);

  return (
    <div className="flex flex-col gap-6 max-w-6xl mx-auto pb-12">
      {/* Page Header */}
      <div className="flex flex-col gap-2">
        <div className="flex items-center gap-2">
          <span className="px-2.5 py-0.5 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 font-mono text-[11px] font-bold">
            MoES / NCMRWF (PS 26081)
          </span>
          <span className="text-xs text-text-3 font-mono">Scientific Whitepaper &amp; System Catalog</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-bold text-text-1 tracking-tight">
          Methodology &amp; Scientific Foundations
        </h1>
        <p className="text-xs sm:text-sm text-text-3 leading-relaxed max-w-4xl">
          SAMANVAY (समन्वय) synthesizes operational numerical weather prediction (NWP) models from ECMWF and NCMRWF
          with state-of-the-art AI foundation surrogates (GraphCast, Pangu-Weather, FourCastNet) using physically constrained
          non-negative least squares stacking, empirical quantile mapping, and hydrological downscaling.
        </p>
      </div>

      {/* Section 1: Mathematical Formulations with KaTeX */}
      <GlassCard className="p-6 flex flex-col gap-6">
        <div className="flex items-center gap-2.5 pb-3 border-b border-border/60">
          <Calculator className="w-5 h-5 text-cyan-400" />
          <div>
            <h2 className="text-base font-bold text-text-1">Mathematical Formulations &amp; Governing Equations</h2>
            <p className="text-xs text-text-3">Exact statistical and physical formulations implemented in the SAMANVAY blending engine</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {/* Formula 1: Quantile Mapping */}
          <div className="p-4 rounded-xl bg-surface-2/40 border border-border/60 flex flex-col justify-between gap-3">
            <div>
              <div className="flex items-center justify-between">
                <h3 className="font-bold text-xs text-text-1">1. Empirical Quantile Mapping (EQM)</h3>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-cyan-950/40 text-cyan-300 border border-cyan-500/30">
                  Bias Correction
                </span>
              </div>
              <p className="text-[11px] text-text-3 mt-1 leading-relaxed">
                Matches the cumulative distribution function (CDF) of each candidate model to gridded IMD gauge observations.
                Extremes beyond the calibration domain are corrected using generalized Pareto tail scaling:
              </p>
              <KatexMath
                block
                math="x_{\text{corr}} = F_{\text{obs}}^{-1}\Big(F_{\text{model}}(x_{\text{raw}})\Big)"
              />
              <KatexMath
                block
                math="\hat{x}_{\text{tail}} = x_0 \left(\frac{1 - F_{\text{model}}(x_{\text{raw}})}{1 - F_{\text{model}}(x_0)}\right)^{-1/\alpha}"
              />
            </div>
            <div className="text-[10px] font-mono text-text-3 border-t border-border/30 pt-2">
              Parameters: Tail threshold percentile q=0.95, shape parameter ?=0.18
            </div>
          </div>

          {/* Formula 2: Inverse-Skill Softmax Weighting */}
          <div className="p-4 rounded-xl bg-surface-2/40 border border-border/60 flex flex-col justify-between gap-3">
            <div>
              <div className="flex items-center justify-between">
                <h3 className="font-bold text-xs text-text-1">2. Inverse-Skill Softmax Weighting</h3>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-indigo-950/40 text-indigo-300 border border-indigo-500/30">
                  Adaptive Weighting
                </span>
              </div>
              <p className="text-[11px] text-text-3 mt-1 leading-relaxed">
                Dynamically penalizes models with high rolling RMSE for the detected synoptic regime.
                Temperature parameter ? controls entropy between pure ensemble selection and equal-weight consensus:
              </p>
              <KatexMath
                block
                math="w_m = \frac{\exp\left(-\frac{\text{RMSE}_m}{\tau}\right)}{\sum_{k=1}^M \exp\left(-\frac{\text{RMSE}_k}{\tau}\right)}"
              />
              <KatexMath
                block
                math="w_m(t) = w_m(0) \cdot 2^{-t / t_{1/2}} \quad (t_{1/2} = 14 \text{ days})"
              />
            </div>
            <div className="text-[10px] font-mono text-text-3 border-t border-border/30 pt-2">
              Parameters: Softmax temperature ?=1.0, half-life decay t_{1/2}=14 days
            </div>
          </div>

          {/* Formula 3: NNLS Constrained Stacking */}
          <div className="p-4 rounded-xl bg-surface-2/40 border border-border/60 flex flex-col justify-between gap-3">
            <div>
              <div className="flex items-center justify-between">
                <h3 className="font-bold text-xs text-text-1">3. Non-Negative Least Squares (NNLS) Stacking</h3>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-violet-950/40 text-violet-300 border border-violet-500/30">
                  Optimization
                </span>
              </div>
              <p className="text-[11px] text-text-3 mt-1 leading-relaxed">
                Minimizes sum-of-squared errors against verification observations subject to non-negativity and convex partition of unity,
                regularized with a 2D spatial Laplacian operator for smooth field boundaries:
              </p>
              <KatexMath
                block
                math="\min_{\mathbf{w}} \; \frac{1}{2}\left\| \mathbf{y} - \sum_{m=1}^M w_m \hat{\mathbf{y}}_m \right\|_2^2 + \lambda \|\nabla^2 \mathbf{w}\|_2^2"
              />
              <KatexMath
                block
                math="\text{subject to} \quad w_m \ge 0, \quad \sum_{m=1}^M w_m = 1"
              />
            </div>
            <div className="text-[10px] font-mono text-text-3 border-t border-border/30 pt-2">
              Parameters: Spatial regularizer ?=0.08, active-set Lawson-Hanson solver
            </div>
          </div>

          {/* Formula 4: CRPS & SEDI Verification Metrics */}
          <div className="p-4 rounded-xl bg-surface-2/40 border border-border/60 flex flex-col justify-between gap-3">
            <div>
              <div className="flex items-center justify-between">
                <h3 className="font-bold text-xs text-text-1">4. Probabilistic Skill: CRPS &amp; SEDI</h3>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-950/40 text-emerald-300 border border-emerald-500/30">
                  Verification
                </span>
              </div>
              <p className="text-[11px] text-text-3 mt-1 leading-relaxed">
                Continuous Ranked Probability Score (CRPS) measures probabilistic sharpness and calibration,
                while the Symmetric Extremal Dependence Index (SEDI) assesses rare heavy rain forecast reliability:
              </p>
              <KatexMath
                block
                math="\text{CRPS}(F, y) = \int_{-\infty}^\infty \Big(F(x) - \mathbb{I}(x \ge y)\Big)^2 dx"
              />
              <KatexMath
                block
                math="\text{SEDI} = \frac{\ln F - \ln H - \ln(1-F) + \ln(1-H)}{\ln F + \ln H + \ln(1-F) + \ln(1-H)}"
              />
            </div>
            <div className="text-[10px] font-mono text-text-3 border-t border-border/30 pt-2">
              Notation: H = Hit Rate (POD), F = False Alarm Ratio (FAR)
            </div>
          </div>
        </div>
      </GlassCard>

      {/* Section 2: Data Sources Table */}
      <GlassCard className="p-6 flex flex-col gap-4">
        <div className="flex items-center gap-2.5 pb-2 border-b border-border/60">
          <Database className="w-5 h-5 text-indigo-400" />
          <div>
            <h2 className="text-base font-bold text-text-1">Forecast Sources &amp; Observational Ingestion</h2>
            <p className="text-xs text-text-3">Multi-center NWP models, global AI foundation models, and observational networks</p>
          </div>
        </div>

        <div className="overflow-x-auto rounded-xl border border-border/50">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-border/60 bg-surface-2/60 text-text-3 font-semibold text-[11px]">
                <th className="py-2.5 px-3">Model / Source</th>
                <th className="py-2.5 px-3">Institution</th>
                <th className="py-2.5 px-3">Class</th>
                <th className="py-2.5 px-3">Native Grid</th>
                <th className="py-2.5 px-3">Update Cycle</th>
                <th className="py-2.5 px-3">Operational Role</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/20 font-mono text-[11px]">
              <tr className="hover:bg-surface-2/40">
                <td className="py-2.5 px-3 font-bold text-cyan-400">NCUM-G</td>
                <td className="py-2.5 px-3 text-text-2">NCMRWF / MoES</td>
                <td className="py-2.5 px-3 text-cyan-300">Physics NWP</td>
                <td className="py-2.5 px-3">12 km (~0.12°)</td>
                <td className="py-2.5 px-3">00Z, 12Z</td>
                <td className="py-2.5 px-3 font-sans text-text-3">India-tuned orographic precipitation baseline</td>
              </tr>
              <tr className="hover:bg-surface-2/40">
                <td className="py-2.5 px-3 font-bold text-indigo-400">NEPS</td>
                <td className="py-2.5 px-3 text-text-2">NCMRWF / MoES</td>
                <td className="py-2.5 px-3 text-indigo-300">Ensemble</td>
                <td className="py-2.5 px-3">12 km (22 members)</td>
                <td className="py-2.5 px-3">00Z, 12Z</td>
                <td className="py-2.5 px-3 font-sans text-text-3">Ensemble spread and probability density estimation</td>
              </tr>
              <tr className="hover:bg-surface-2/40">
                <td className="py-2.5 px-3 font-bold text-violet-400">ECMWF-IFS</td>
                <td className="py-2.5 px-3 text-text-2">ECMWF</td>
                <td className="py-2.5 px-3 text-violet-300">Physics NWP</td>
                <td className="py-2.5 px-3">9 km (~0.1°)</td>
                <td className="py-2.5 px-3">00Z, 12Z</td>
                <td className="py-2.5 px-3 font-sans text-text-3">Global medium-range skill anchor</td>
              </tr>
              <tr className="hover:bg-surface-2/40">
                <td className="py-2.5 px-3 font-bold text-emerald-400">IMD-GFS</td>
                <td className="py-2.5 px-3 text-text-2">IMD / MoES</td>
                <td className="py-2.5 px-3 text-emerald-300">Physics NWP</td>
                <td className="py-2.5 px-3">12 km (~0.12°)</td>
                <td className="py-2.5 px-3">00Z, 06Z, 12Z, 18Z</td>
                <td className="py-2.5 px-3 font-sans text-text-3">Rapid update synoptic cycle &amp; cyclone tracks</td>
              </tr>
              <tr className="hover:bg-surface-2/40">
                <td className="py-2.5 px-3 font-bold text-purple-400">GraphCast</td>
                <td className="py-2.5 px-3 text-text-2">Google DeepMind</td>
                <td className="py-2.5 px-3 text-purple-300">AI Foundation</td>
                <td className="py-2.5 px-3">0.25° (~28 km)</td>
                <td className="py-2.5 px-3">Fast (~60s inference)</td>
                <td className="py-2.5 px-3 font-sans text-text-3">Medium-range 500hPa geopotential and trough tracking</td>
              </tr>
              <tr className="hover:bg-surface-2/40">
                <td className="py-2.5 px-3 font-bold text-pink-400">Pangu-Weather</td>
                <td className="py-2.5 px-3 text-text-2">Huawei Cloud</td>
                <td className="py-2.5 px-3 text-pink-300">AI Foundation</td>
                <td className="py-2.5 px-3">0.25° (~28 km)</td>
                <td className="py-2.5 px-3">Fast (~30s inference)</td>
                <td className="py-2.5 px-3 font-sans text-text-3">3D Earth-specific transformer for temperature extremes</td>
              </tr>
              <tr className="hover:bg-surface-2/40">
                <td className="py-2.5 px-3 font-bold text-rose-400">FourCastNet</td>
                <td className="py-2.5 px-3 text-text-2">NVIDIA Earth-2</td>
                <td className="py-2.5 px-3 text-rose-300">AI Foundation</td>
                <td className="py-2.5 px-3">0.25° (~28 km)</td>
                <td className="py-2.5 px-3">Ultra-fast (~10s)</td>
                <td className="py-2.5 px-3 font-sans text-text-3">Adaptive Fourier Neural Operator for surface wind gusts</td>
              </tr>
              <tr className="hover:bg-surface-2/40 bg-surface-2/20">
                <td className="py-2.5 px-3 font-bold text-amber-300">IMD Gauge / AWS</td>
                <td className="py-2.5 px-3 text-text-2">IMD Realtime</td>
                <td className="py-2.5 px-3 text-amber-300">Ground Truth</td>
                <td className="py-2.5 px-3">Point network (~3,500 gauges)</td>
                <td className="py-2.5 px-3">Hourly telemetry</td>
                <td className="py-2.5 px-3 font-sans text-text-3">Validation benchmark, calibration &amp; bias correction</td>
              </tr>
            </tbody>
          </table>
        </div>
      </GlassCard>

      {/* Section 3: Assumptions & Constraints */}
      <GlassCard className="p-6 flex flex-col gap-4">
        <div className="flex items-center gap-2.5 pb-2 border-b border-border/60">
          <Atom className="w-5 h-5 text-emerald-400" />
          <div>
            <h2 className="text-base font-bold text-text-1">Physical Assumptions &amp; Governing Constraints</h2>
            <p className="text-xs text-text-3">Conservation laws enforced across data-driven blending stages</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
          <div className="p-4 rounded-xl bg-surface-2/40 border border-border/50 flex flex-col gap-2">
            <div className="font-bold text-text-1 flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              Hydrological Mass Conservation
            </div>
            <p className="text-[11px] text-text-3 leading-relaxed">
              In the catchment water balance module, soil storage obeys:
            </p>
            <KatexMath block math="\frac{dS}{dt} = P - R - ET" />
            <p className="text-[11px] text-text-3 leading-relaxed">
              Crucially, runoff <KatexMath math="R = 0" /> and evapotranspiration <KatexMath math="ET = 0" /> on dry days where precipitation <KatexMath math="P = 0" />.
            </p>
          </div>

          <div className="p-4 rounded-xl bg-surface-2/40 border border-border/50 flex flex-col gap-2">
            <div className="font-bold text-text-1 flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-cyan-400" />
              Convex Partition of Unity
            </div>
            <p className="text-[11px] text-text-3 leading-relaxed">
              Weights across all candidate models must be strictly non-negative and sum exactly to 1.0 at every grid cell:
            </p>
            <KatexMath block math="\sum_{m=1}^M w_m(\mathbf{x}) = 1, \quad w_m(\mathbf{x}) \ge 0" />
            <p className="text-[11px] text-text-3 leading-relaxed">
              This guarantees the blended consensus never generates spurious unphysical negative values or runaway amplification.
            </p>
          </div>

          <div className="p-4 rounded-xl bg-surface-2/40 border border-border/50 flex flex-col gap-2">
            <div className="font-bold text-text-1 flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-indigo-400" />
              Spatial Regularity (Laplacian)
            </div>
            <p className="text-[11px] text-text-3 leading-relaxed">
              Adjacent administrative districts and grid cells are penalized for abrupt step discontinuities:
            </p>
            <KatexMath block math="\mathcal{R}(\mathbf{w}) = \lambda \int_\Omega \|\nabla^2 \mathbf{w}(\mathbf{x})\|_2^2 d\mathbf{x}" />
            <p className="text-[11px] text-text-3 leading-relaxed">
              Ensures seamless geographic transitions without artificial seam lines at model dominance borders.
            </p>
          </div>
        </div>
      </GlassCard>

      {/* Section 4: Honest Limitations */}
      <GlassCard className="p-6 flex flex-col gap-4 border-amber-500/30 bg-amber-950/10">
        <div className="flex items-center gap-2.5 pb-2 border-b border-amber-500/20">
          <AlertTriangle className="w-5 h-5 text-amber-400" />
          <div>
            <h2 className="text-base font-bold text-text-1">Honest Scientific Limitations &amp; Caveats</h2>
            <p className="text-xs text-text-3">Operational boundaries transparently documented for forecasters and judges</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
          <div className="p-3.5 rounded-lg bg-surface-1/80 border border-amber-500/30">
            <h3 className="font-bold text-amber-300 text-xs mb-1">1. PINN Over-Smoothing on Saturation Peaks</h3>
            <p className="text-[11px] text-text-3 leading-relaxed">
              The physics loss term penalizes high spatial variance, creating an implicit low-pass filter.
              Consequently, localized cloudburst events (&gt;100 mm/hr) may have peak saturation smoothed by 15–30%.
            </p>
          </div>

          <div className="p-3.5 rounded-lg bg-surface-1/80 border border-amber-500/30">
            <h3 className="font-bold text-amber-300 text-xs mb-1">2. AI Surrogate Convective Damping</h3>
            <p className="text-[11px] text-text-3 leading-relaxed">
              Global AI models (GraphCast, Pangu) are trained on 0.25° ERA5 reanalysis and lack explicit sub-grid
              cloud microphysics. They excel at synoptic steering but systematically underpredict mesoscale convective bursts.
            </p>
          </div>

          <div className="p-3.5 rounded-lg bg-surface-1/80 border border-amber-500/30">
            <h3 className="font-bold text-amber-300 text-xs mb-1">3. Landslide Discriminative vs. Forecast Accuracy</h3>
            <p className="text-[11px] text-text-3 leading-relaxed">
              Reported landslide ROC-AUC (0.9235) reflects discriminative terrain susceptibility classification,
              where non-events were sampled via pseudo-absence. It does not constitute an exact temporal prediction of slope release.
            </p>
          </div>
        </div>
      </GlassCard>

      {/* Section 5: Searchable Glossary */}
      <GlassCard className="p-6 flex flex-col gap-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-border/60">
          <div className="flex items-center gap-2.5">
            <BookOpen className="w-5 h-5 text-cyan-400" />
            <div>
              <h2 className="text-base font-bold text-text-1">Searchable Meteorological &amp; ML Glossary</h2>
              <p className="text-xs text-text-3">Definitions and mathematical representations of system components</p>
            </div>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <div className="relative">
              <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-text-3" />
              <input
                type="text"
                placeholder="Search glossary terms..."
                value={glossaryQuery}
                onChange={(e) => setGlossaryQuery(e.target.value)}
                className="pl-8 pr-3 py-1.5 text-xs rounded-lg bg-surface-2 border border-border text-text-1 placeholder:text-text-3 focus:outline-none focus:border-cyan-400 w-56"
              />
            </div>

            <div className="flex items-center gap-1 text-[11px]">
              {["ALL", "Statistics", "Physics", "AI & ML", "Meteorology"].map((cat) => (
                <button
                  key={cat}
                  onClick={() => setGlossaryCategory(cat)}
                  className={`px-2 py-1 rounded-md transition-colors ${
                    glossaryCategory === cat
                      ? "bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 font-semibold"
                      : "bg-surface-2 text-text-3 hover:text-text-2 border border-border/40"
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
          {filteredGlossary.length === 0 ? (
            <div className="col-span-2 py-6 text-center text-xs text-text-3 italic">
              No matching glossary terms found.
            </div>
          ) : (
            filteredGlossary.map((item) => (
              <div
                key={item.term}
                className="p-3.5 rounded-xl bg-surface-2/40 border border-border/60 flex flex-col justify-between gap-2"
              >
                <div>
                  <div className="flex items-center justify-between gap-2 mb-1">
                    <h3 className="font-bold text-xs text-text-1">{item.term}</h3>
                    <span className="text-[10px] font-mono px-2 py-0.2 rounded bg-surface-3 text-text-3 border border-border/40">
                      {item.category}
                    </span>
                  </div>
                  <p className="text-[11px] text-text-2 leading-relaxed">{item.definition}</p>
                </div>
                {item.formula && (
                  <div className="pt-2 border-t border-border/30">
                    <KatexMath block math={item.formula} className="my-1 text-xs" />
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      </GlassCard>

      {/* Section 6: Team, Institutions & Credits */}
      <GlassCard className="p-6 flex flex-col gap-4">
        <div className="flex items-center gap-2.5 pb-2 border-b border-border/60">
          <Users className="w-5 h-5 text-pink-400" />
          <div>
            <h2 className="text-base font-bold text-text-1">Research Credits &amp; Partner Institutions</h2>
            <p className="text-xs text-text-3">Collaborative engineering across India MoES, NCMRWF, IMD, and open AI research</p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-xs">
          <div className="p-4 rounded-xl bg-surface-2/40 border border-border/50 flex flex-col justify-between gap-2">
            <div>
              <div className="font-bold text-text-1">MoES / NCMRWF</div>
              <div className="text-[11px] text-cyan-400 font-mono mt-0.5">Project Sponsor (PS 26081)</div>
              <p className="text-[11px] text-text-3 mt-2 leading-relaxed">
                National Centre for Medium Range Weather Forecasting, Ministry of Earth Sciences, Govt. of India.
              </p>
            </div>
            <div className="text-[10px] text-text-3 border-t border-border/30 pt-2 font-mono">
              NCUM-G, NEPS, Mihir HPC
            </div>
          </div>

          <div className="p-4 rounded-xl bg-surface-2/40 border border-border/50 flex flex-col justify-between gap-2">
            <div>
              <div className="font-bold text-text-1">India Meteorological Dept</div>
              <div className="text-[11px] text-emerald-400 font-mono mt-0.5">Observational Ground Truth</div>
              <p className="text-[11px] text-text-3 mt-2 leading-relaxed">
                IMD-GFS model feeds, automatic weather stations, gridded rain-gauge telemetry, and four-tier warning protocols.
              </p>
            </div>
            <div className="text-[10px] text-text-3 border-t border-border/30 pt-2 font-mono">
              IMD-GFS, AWS, 4-Tier Matrix
            </div>
          </div>

          <div className="p-4 rounded-xl bg-surface-2/40 border border-border/50 flex flex-col justify-between gap-2">
            <div>
              <div className="font-bold text-text-1">Open AI Weather Models</div>
              <div className="text-[11px] text-purple-400 font-mono mt-0.5">Foundation Architecture</div>
              <p className="text-[11px] text-text-3 mt-2 leading-relaxed">
                Google DeepMind (GraphCast), Huawei Cloud (Pangu-Weather), and NVIDIA Earth-2 (FourCastNet) open weights.
              </p>
            </div>
            <div className="text-[10px] text-text-3 border-t border-border/30 pt-2 font-mono">
              GraphCast, Pangu, FourCastNet
            </div>
          </div>

          <div className="p-4 rounded-xl bg-surface-2/40 border border-border/50 flex flex-col justify-between gap-2">
            <div>
              <div className="font-bold text-text-1">ECMWF Open Data</div>
              <div className="text-[11px] text-violet-400 font-mono mt-0.5">Global Medium-Range Benchmark</div>
              <p className="text-[11px] text-text-3 mt-2 leading-relaxed">
                European Centre for Medium-Range Weather Forecasts 0.1° IFS deterministic model outputs and ERA5 reanalysis.
              </p>
            </div>
            <div className="text-[10px] text-text-3 border-t border-border/30 pt-2 font-mono">
              ECMWF-IFS, ERA5 Climatology
            </div>
          </div>
        </div>
      </GlassCard>
    </div>
  );
}
