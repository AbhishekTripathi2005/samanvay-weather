"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useAppStore } from "@/lib/store";
import {
  useKpisQuery,
  useForecastQuery,
  useFieldQuery,
  useExtremesQuery,
  useSkillQuery,
  useRegimesTimelineQuery,
  useOpsPipelineQuery
} from "@/lib/queries";
import { GlassCard } from "@/components/ui/GlassCard";
import { MetricCard } from "@/components/ui/MetricCard";
import { AlertBadge } from "@/components/ui/AlertBadge";
import { ModelBadge } from "@/components/ui/ModelBadge";
import { ForecastMap } from "@/components/map/ForecastMap";
import { RegionDrawer, RegionDetailData } from "@/components/overview/RegionDrawer";
import {
  AlertTriangle,
  TrendingUp,
  Play,
  Pause,
  CloudRain,
  Sun,
  Wind,
  Thermometer,
  ArrowRight,
  Cpu,
  SplitSquareVertical
} from "lucide-react";

export default function OverviewCommandCenterPage() {
  const { variable, setVariable, lead, setLead, regime, setRegime, setIsRunBlendOpen } = useAppStore();

  const { data: kpis } = useKpisQuery();
  const { data: forecast } = useForecastQuery({ variable, lead, regime });
  const { data: field } = useFieldQuery({ variable, lead, model: "samanvay" });
  const { data: extremes } = useExtremesQuery();
  const { data: skill } = useSkillQuery({ variable, lead });
  const { data: regimesData } = useRegimesTimelineQuery();
  const { data: opsPipeline } = useOpsPipelineQuery();

  // Region drilldown drawer state
  const [selectedRegionData, setSelectedRegionData] = useState<RegionDetailData | null>(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  // Play / Pause auto-advance lead scrubber state
  const [isPlayingLead, setIsPlayingLead] = useState(false);

  // Compare mode (Blend vs Single Model)
  const [isCompareMode, setIsCompareMode] = useState(false);
  const [compareModel, setCompareModel] = useState("graphcast");

  useEffect(() => {
    if (!isPlayingLead) return;

    const interval = setInterval(() => {
      setLead(lead >= 240 ? 24 : lead + 24);
    }, 1500);

    return () => clearInterval(interval);
  }, [isPlayingLead, lead, setLead]);

  const handleSelectRegion = (code: string) => {
    const st = forecast?.states.find((s) => s.code === code);
    if (st) {
      setSelectedRegionData({
        code: st.code,
        name: st.name,
        zone: st.zone,
        value: st.consensus.value,
        p10: st.consensus.p10,
        p90: st.consensus.p90,
        alertLevel: st.alert_level,
        dominantModel: st.dominant_model,
        variable,
        leadHours: lead
      });
      setIsDrawerOpen(true);
    }
  };

  const statesMapData =
    forecast?.states.map((st) => ({
      code: st.code,
      name: st.name,
      zone: st.zone,
      lat: st.lat,
      lon: st.lon,
      value: st.consensus.value,
      p10: st.consensus.p10,
      p90: st.consensus.p90,
      alert_level: st.alert_level,
      dominant_model: st.dominant_model
    })) || [];

  const sparklineSkill = [14.2, 16.5, 18.1, 19.8, 19.5, 18.9, 17.8, 16.5, 15.2, 14.1];
  const sparklineRmse = [2.8, 2.4, 2.1, 1.78, 2.05, 2.35, 2.65, 2.95, 3.25, 3.55];

  const sortedAlerts = [...(extremes?.alerts || [])].sort((a, b) => {
    const rank: Record<string, number> = { RED: 3, ORANGE: 2, YELLOW: 1, GREEN: 0 };
    return (rank[b.alert_level] || 0) - (rank[a.alert_level] || 0);
  });

  const skillGainVal = kpis?.blend_skill_score_24h?.value_pct ?? 19.8;
  const bestRmse = skill?.scorecard[0]?.metrics?.rmse ?? 1.78;
  const activeAlertsCount = extremes?.total_active_alerts ?? 7;

  return (
    <div className="flex flex-col gap-6 select-none">
      {/* Top Command Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="w-2.5 h-2.5 rounded-full bg-cyan-400 animate-pulse shadow-[0_0_8px_#00F5FF]" />
            <span className="text-xs font-mono font-semibold text-cyan-400 uppercase tracking-wider">
              Live Operational Watch • 00Z Cycle
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-text-1 tracking-tight">
            National Meteorological Command Center
          </h1>
          <p className="text-xs text-text-3 font-mono mt-0.5">
            MoES / NCMRWF Adaptive Consensus • Active Synoptic Regime:{" "}
            <span className="text-cyan-400 font-bold uppercase">{kpis?.active_regime || "Active Monsoon"}</span>
          </p>
        </div>

        {/* Global Compare Toggle & Quick Actions */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => setIsCompareMode(!isCompareMode)}
            className={`px-3.5 py-1.5 rounded-lg border text-xs font-mono flex items-center gap-2 transition-all ${
              isCompareMode
                ? "bg-cyan-500/20 border-cyan-500 text-cyan-300 shadow-md shadow-cyan-500/20"
                : "bg-surface-2 border-border text-text-2 hover:text-text-1"
            }`}
          >
            <SplitSquareVertical className="w-4 h-4 text-cyan-400" />
            <span>{isCompareMode ? "Exit Compare Mode" : "Compare vs Model"}</span>
          </button>

          <button
            onClick={() => setIsRunBlendOpen(true)}
            className="px-4 py-1.5 rounded-lg bg-gradient-to-r from-cyan-500 to-indigo-600 hover:from-cyan-400 hover:to-indigo-500 text-white font-semibold text-xs shadow-md shadow-cyan-500/20 flex items-center gap-1.5 transition-all"
          >
            <Cpu className="w-3.5 h-3.5" />
            <span>Run Blend</span>
          </button>
        </div>
      </div>

      {/* 4 Primary KPI Cards with Sparklines */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard
          label="National Skill Gain"
          value={skillGainVal}
          unit="%"
          delta={{ value: 1.4, isPositive: true, period: "vs best single NWP/AI" }}
          sparklineData={sparklineSkill}
          tooltip="Percentage RMSE error reduction achieved by SAMANVAY over best single model"
        />
        <MetricCard
          label="Active Disaster Alerts"
          value={activeAlertsCount}
          unit="Districts"
          delta={{ value: 2, isPositive: false, period: "2 Red, 4 Orange, 1 Yellow" }}
          tooltip="Severe meteorological warning levels active across Indian districts"
        />
        <MetricCard
          label="72h Blend Mean RMSE"
          value={bestRmse}
          unit="mm"
          delta={{ value: 38.0, isPositive: true, period: "-38% error vs 2.87mm GraphCast" }}
          sparklineData={sparklineRmse}
          tooltip="Precipitation Root Mean Square Error evaluated over 3-year IMD ground truth"
        />
        <MetricCard
          label="Data Freshness"
          value={7}
          unit="/ 7 Synced"
          delta={{ value: 0, isPositive: true, period: "00Z cycle • 42ms ingestion latency" }}
          tooltip="All 7 model ingestion DAGs completed successfully with zero fallback flags"
        />
      </div>

      {/* Main Bento Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Main ForecastMap Tile (8 Cols) */}
        <div className="lg:col-span-8 flex flex-col gap-3">
          <GlassCard className="p-4 flex flex-col gap-4 border-cyan-500/30">
            {/* In-Tile Map Controls Bar */}
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border/50 pb-3">
              {/* Variable Switcher */}
              <div className="flex items-center gap-1 bg-surface-2 p-1 rounded-lg border border-border">
                {[
                  { id: "rainfall", label: "Rain", icon: CloudRain },
                  { id: "tmax", label: "Tmax", icon: Sun },
                  { id: "tmin", label: "Tmin", icon: Thermometer },
                  { id: "wind_speed", label: "Wind", icon: Wind }
                ].map((v) => {
                  const Icon = v.icon;
                  const isActive = variable === v.id;
                  return (
                    <button
                      key={v.id}
                      onClick={() => setVariable(v.id as any)}
                      className={`px-2.5 py-1 rounded-md text-xs font-mono flex items-center gap-1.5 transition-colors ${
                        isActive
                          ? "bg-cyan-500 text-surface-0 font-bold shadow-sm"
                          : "text-text-3 hover:text-text-1"
                      }`}
                    >
                      <Icon className="w-3.5 h-3.5" />
                      <span>{v.label}</span>
                    </button>
                  );
                })}
              </div>

              {/* Lead Scrubber with Play/Pause */}
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setIsPlayingLead(!isPlayingLead)}
                  className={`p-1.5 rounded-lg border text-xs flex items-center gap-1 transition-colors ${
                    isPlayingLead
                      ? "bg-amber-500/20 border-amber-500 text-amber-300"
                      : "bg-surface-2 border-border text-text-2 hover:text-text-1"
                  }`}
                  title={isPlayingLead ? "Pause auto-advance" : "Play 10-day loop"}
                >
                  {isPlayingLead ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
                  <span className="font-mono text-[11px]">{isPlayingLead ? "Pause" : "Play"}</span>
                </button>

                <div className="flex items-center gap-2">
                  <span className="text-xs font-mono text-cyan-400 font-bold w-20 text-right">
                    Day {Math.floor(lead / 24)} (+{lead}h)
                  </span>
                  <input
                    type="range"
                    min="24"
                    max="240"
                    step="24"
                    value={lead}
                    onChange={(e) => setLead(parseInt(e.target.value, 10))}
                    className="w-28 sm:w-40 h-1.5 bg-surface-3 rounded-lg appearance-none cursor-pointer accent-cyan-400"
                  />
                </div>
              </div>
            </div>

            {/* Split-View Compare Banner if Active */}
            {isCompareMode && (
              <div className="p-2.5 rounded-lg bg-surface-2/90 border border-cyan-500/40 flex items-center justify-between text-xs font-mono">
                <div className="flex items-center gap-2">
                  <span className="text-cyan-400 font-bold">Comparing:</span>
                  <span>SAMANVAY Consensus (Left)</span>
                  <span className="text-text-3">vs</span>
                  <select
                    value={compareModel}
                    onChange={(e) => setCompareModel(e.target.value)}
                    className="bg-surface-1 border border-border rounded px-2 py-0.5 text-xs text-text-1 focus:outline-none"
                  >
                    <option value="graphcast">GraphCast (AI)</option>
                    <option value="ecmwf_ifs">ECMWF-IFS (NWP)</option>
                    <option value="neps">NEPS (Ensemble)</option>
                    <option value="pangu">Pangu-Weather (AI)</option>
                    <option value="ncum_g">NCUM-G (NWP)</option>
                    <option value="imd_gfs">IMD-GFS (NWP)</option>
                  </select>
                </div>
                <span className="text-[11px] text-text-3">Click any region pin to view comparative differences</span>
              </div>
            )}

            {/* Map Canvas & Region Pins */}
            <div className="w-full h-[460px] relative rounded-xl overflow-hidden bg-surface-1/40">
              <ForecastMap
                variable={variable}
                leadHours={lead}
                gridValues={field?.values}
                lats={field?.lats}
                lons={field?.lons}
                minValue={field?.min_value}
                maxValue={field?.max_value}
                statesData={statesMapData}
                onSelectRegion={handleSelectRegion}
                className="w-full h-full"
              />
            </div>
          </GlassCard>
        </div>

        {/* Right 4 Columns: Leaderboard & Alerts */}
        <div className="lg:col-span-4 flex flex-col gap-4">
          {/* Active Severe Alerts List Card */}
          <GlassCard className="p-4 flex flex-col gap-3 max-h-[300px] overflow-hidden border-border/80">
            <div className="flex items-center justify-between border-b border-border/50 pb-2">
              <div className="flex items-center gap-1.5 text-xs font-bold text-red-400">
                <AlertTriangle className="w-4 h-4" />
                <span>Active Disaster Bulletins</span>
              </div>
              <Link href="/extremes" className="text-[11px] font-mono text-cyan-400 hover:underline flex items-center gap-1">
                <span>View All</span>
                <ArrowRight className="w-3 h-3" />
              </Link>
            </div>

            <div className="flex-1 overflow-y-auto flex flex-col gap-2 pr-1">
              {sortedAlerts.slice(0, 5).map((a) => (
                <Link
                  key={a.id}
                  href={`/extremes?region=${a.district}&lead=${lead}`}
                  className="p-2 rounded-lg bg-surface-2/60 hover:bg-surface-2 border border-border/60 transition-colors flex items-center justify-between"
                >
                  <div className="flex flex-col min-w-0 pr-2">
                    <span className="text-xs font-bold text-text-1 truncate">{a.district}</span>
                    <span className="text-[10px] text-text-3 truncate">{a.state} • {a.variable}</span>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <span className="text-[11px] font-mono font-bold text-text-1">{a.forecast_value} mm</span>
                    <AlertBadge level={a.alert_level} />
                  </div>
                </Link>
              ))}
            </div>
          </GlassCard>

          {/* "Model of the Day" Leaderboard Card */}
          <GlassCard className="p-4 flex flex-col gap-3 border-border/80">
            <div className="flex items-center justify-between border-b border-border/50 pb-2">
              <div className="flex items-center gap-1.5 text-xs font-bold text-text-1">
                <TrendingUp className="w-4 h-4 text-cyan-400" />
                <span>Model Leaderboard (+{lead}h)</span>
              </div>
              <span className="text-[10px] font-mono text-text-3">Metric: RMSE (mm)</span>
            </div>

            <div className="flex flex-col gap-2 font-mono text-xs">
              {[
                { rank: 1, model: "samanvay", name: "SAMANVAY Blend", rmse: 1.78, score: "Top Consensus" },
                { rank: 2, model: "graphcast", name: "GraphCast", rmse: 2.87, score: "AI Winner" },
                { rank: 3, model: "pangu", name: "Pangu-Weather", rmse: 3.10, score: "Fast ML" },
                { rank: 4, model: "neps", name: "NEPS Ensemble", rmse: 3.26, score: "High Spread" },
                { rank: 5, model: "ecmwf_ifs", name: "ECMWF-IFS", rmse: 3.53, score: "Physics Base" }
              ].map((m) => (
                <div
                  key={m.model}
                  className={`flex items-center justify-between py-1.5 px-2 rounded-lg border transition-colors ${
                    m.rank === 1
                      ? "bg-cyan-500/10 border-cyan-500/40 text-cyan-300 font-bold"
                      : "bg-surface-2/40 border-border/40 text-text-2"
                  }`}
                >
                  <div className="flex items-center gap-2 min-w-0">
                    <span className="text-text-3 font-bold w-4 text-center">#{m.rank}</span>
                    <ModelBadge model={m.model} size="sm" />
                    <span className="truncate">{m.name}</span>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <span className="font-extrabold">{m.rmse.toFixed(2)}</span>
                  </div>
                </div>
              ))}
            </div>
          </GlassCard>

          {/* Dominant Synoptic Regime Narrative Card */}
          <GlassCard className="p-4 flex flex-col gap-2 border-border/80">
            <div className="flex items-center justify-between">
              <span className="text-xs font-mono text-cyan-400 font-bold uppercase tracking-wider">
                Synoptic Regime Watch
              </span>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-cyan-500/10 text-cyan-300 border border-cyan-500/30">
                Confidence: 94.2%
              </span>
            </div>
            <div className="text-sm font-bold text-text-1">
              Active Monsoon • Arabian Sea Surge
            </div>
            <p className="text-[11px] text-text-3 leading-relaxed">
              Low-pressure trough extends from South Gujarat across Central MP to Odisha. Strong southwesterly monsoon flow (+24 knot shear). NCUM-G and NEPS receive 50% combined weight.
            </p>
          </GlassCard>

          {/* Last Pipeline Run Status Card with Mini DAG */}
          <GlassCard className="p-4 flex flex-col gap-3 border-border/80">
            <div className="flex items-center justify-between">
              <span className="text-xs font-mono text-text-3 uppercase tracking-wider font-semibold">
                Pipeline Execution Status
              </span>
              <div className="flex items-center gap-1.5 text-[11px] font-mono text-emerald-400">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                <span>ONLINE 200 OK</span>
              </div>
            </div>

            <div className="grid grid-cols-4 gap-1 text-[10px] font-mono text-center">
              <div className="p-1 rounded bg-surface-2 border border-border text-cyan-400">1. Ingest</div>
              <div className="p-1 rounded bg-surface-2 border border-border text-cyan-400">2. EQM</div>
              <div className="p-1 rounded bg-surface-2 border border-border text-cyan-400">3. NNLS</div>
              <div className="p-1 rounded bg-surface-2 border border-border text-emerald-400 font-bold">4. Alerts</div>
            </div>

            <button
              onClick={() => setIsRunBlendOpen(true)}
              className="w-full py-2 rounded-lg bg-surface-2 hover:bg-surface-3 border border-border text-xs font-mono text-cyan-400 flex items-center justify-center gap-1.5 transition-colors"
            >
              <Cpu className="w-3.5 h-3.5" />
              <span>Run blend now</span>
            </button>
          </GlassCard>
        </div>
      </div>

      {/* Region Drilldown Side Drawer */}
      <RegionDrawer
        isOpen={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
        data={selectedRegionData}
      />
    </div>
  );
}
