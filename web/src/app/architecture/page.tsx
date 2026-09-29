"use client";

import React from "react";
import { Cpu, Database, Network, ShieldCheck, Code, Layers } from "lucide-react";

export default function ArchitecturePage() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="glass-panel rounded-xl p-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <span className="p-1.5 rounded-lg bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
              <Network className="h-5 w-5" />
            </span>
            <h2 className="font-heading text-xl font-bold text-cyan-300">
              SAMANVAY Operational System Architecture
            </h2>
          </div>
          <p className="text-xs text-slate-400 mt-1 max-w-3xl">
            Technical blueprint of the pluggable ForecastSource adapter pipeline, Bayesian blending mathematics,
            and offline-native edge deployment architecture.
          </p>
        </div>
        <div className="font-mono text-xs bg-slate-900/80 p-2.5 rounded-lg border border-slate-700 text-cyan-400">
          MoES / NCMRWF (PS 26081)
        </div>
      </div>

      {/* Architecture Flow Diagram */}
      <div className="glass-panel rounded-xl p-6">
        <h3 className="font-heading font-bold text-base text-slate-200 mb-4 flex items-center space-x-2">
          <Layers className="h-4 w-4 text-cyan-400" />
          <span>Operational Dataflow & Pipeline Stages</span>
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 font-mono text-xs">
          {/* Stage 1 */}
          <div className="p-4 rounded-xl bg-slate-900/80 border border-cyan-500/30 flex flex-col justify-between space-y-2">
            <div>
              <span className="text-cyan-400 font-bold block text-sm mb-1">1. Ingestion Adapters</span>
              <p className="text-slate-400 text-[11px]">
                Pluggable <code>ForecastSource</code> abstraction. Fetches NetCDF, GRIB2 or synthetic surrogates.
              </p>
            </div>
            <div className="bg-slate-950 p-2 rounded text-[10px] text-slate-300">
              • NCUM-G (12km)<br/>
              • NEPS (21 Members)<br/>
              • IMD-GFS & ECMWF<br/>
              • GraphCast / Pangu / AFNO
            </div>
          </div>

          {/* Stage 2 */}
          <div className="p-4 rounded-xl bg-slate-900/80 border border-violet-500/30 flex flex-col justify-between space-y-2">
            <div>
              <span className="text-violet-400 font-bold block text-sm mb-1">2. Regime Classifier</span>
              <p className="text-slate-400 text-[11px]">
                Classifies synoptic flow into 6 regimes (Active, Break, WD, Cyclone, Heatwave, Neutral).
              </p>
            </div>
            <div className="bg-slate-950 p-2 rounded text-[10px] text-slate-300">
              • Trough axis location<br/>
              • Monsoon index<br/>
              • Sea-level pressure<br/>
              • Upper troposphere ridge
            </div>
          </div>

          {/* Stage 3 */}
          <div className="p-4 rounded-xl bg-slate-900/80 border border-emerald-500/30 flex flex-col justify-between space-y-2">
            <div>
              <span className="text-emerald-400 font-bold block text-sm mb-1">3. PINN Blending</span>
              <p className="text-slate-400 text-[11px]">
                Lead-dependent Bayesian Model Averaging conditioned on mass divergence & moisture flux.
              </p>
            </div>
            <div className="bg-slate-950 p-2 rounded text-[10px] text-slate-300">
              • W_m(t, r) error weights<br/>
              • Orographic uplift correction<br/>
              • Thermodynamic constraints<br/>
              • Calibrated P10/P50/P90
            </div>
          </div>

          {/* Stage 4 */}
          <div className="p-4 rounded-xl bg-slate-900/80 border border-red-500/30 flex flex-col justify-between space-y-2">
            <div>
              <span className="text-red-400 font-bold block text-sm mb-1">4. Disaster Ops (DSS)</span>
              <p className="text-slate-400 text-[11px]">
                IMD criteria threshold evaluation across 36 Indian states. Triggers NDRF SOP actions.
              </p>
            </div>
            <div className="bg-slate-950 p-2 rounded text-[10px] text-slate-300">
              • Heavy rain (&gt;64.5mm)<br/>
              • Heatwave (&ge;40°C, departure)<br/>
              • Wind gusts (&gt;75 km/h)<br/>
              • Automated bulletin output
            </div>
          </div>
        </div>
      </div>

      {/* Code Snippet: Adapter Interface */}
      <div className="glass-panel rounded-xl p-5 font-mono">
        <h3 className="font-heading font-bold text-sm text-cyan-300 mb-3 flex items-center space-x-2">
          <Code className="h-4 w-4" />
          <span>Core Adapter Contract: <code>ForecastSource</code> Interface</span>
        </h3>
        <pre className="bg-slate-950/90 p-4 rounded-lg text-xs text-slate-300 overflow-x-auto border border-slate-800">
{`class ForecastSource(ABC):
    @abstractmethod
    def fetch(
        self,
        variable: str,
        lead: int,
        init_time: Optional[str] = None,
        regime: str = "Neutral",
        season: str = "JJAS"
    ) -> xarray.Dataset:
        """
        Returns gridded xarray Dataset across Indian bounds (6-38N, 68-98E).
        Allows dropping in real GRIB2 / NetCDF NCMRWF operational feeds.
        """
        pass`}
        </pre>
      </div>
    </div>
  );
}
