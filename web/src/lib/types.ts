// SAMANVAY Core Meteorological & Operational Domain Types
// MoES / NCMRWF (PS 26081)

export type SourceType = "NWP" | "Ensemble" | "AI" | "Blended";
export type AlertLevel = "GREEN" | "YELLOW" | "ORANGE" | "RED";
export type VariableId = "rainfall" | "tmax" | "tmin" | "wind_speed" | "wind_gust";
export type RegimeId =
  | "Active monsoon"
  | "Break monsoon"
  | "Western Disturbance"
  | "Cyclone/Depression"
  | "Heatwave ridge"
  | "Neutral";

export interface SourceMeta {
  id: string;
  name: string;
  full_name: string;
  type: SourceType;
  color: string;
  badge: string;
  organization: string;
  resolution: string;
  is_blended?: boolean;
  physics_type?: string;
  members?: number;
}

export interface VariableMeta {
  id: VariableId | string;
  name: string;
  short_name: string;
  unit: string;
  min: number;
  max: number;
  step?: number;
  color_scale: string;
  icon: string;
}

export interface RegimeMeta {
  id: string;
  description: string;
  primary_season: string;
  dominant_source: string;
}

export interface RegionState {
  code: string;
  name: string;
  zone: string;
  lat: number;
  lon: number;
  pop_millions: number;
  terrain: string;
}

export interface MetaResponse {
  models: SourceMeta[];
  variables: VariableMeta[];
  regions: {
    zones: Record<string, { id: string; name: string; description: string; bounds: { min_lat: number; max_lat: number; min_lon: number; max_lon: number }; color: string }>;
    states_count: number;
    states: RegionState[];
  };
  regimes: Array<{
    id: RegimeId | string;
    name: string;
    description: string;
    dominant_source: string;
  }>;
  leads: Array<{
    hours: number;
    day: string;
    day_int: number;
  }>;
}

export interface KpisResponse {
  active_regime: RegimeId | string;
  regime_description: string;
  national_alert_counts: {
    red: number;
    orange: number;
    yellow: number;
    green: number;
    total_states: number;
  };
  population_at_risk_millions: number;
  blend_skill_score_24h: {
    metric: string;
    value_pct: number;
    reference: string;
    national_mean_rmse: number;
  };
  system_status: {
    pipelines_online: string;
    health: string;
    last_cycle: string;
    last_run_timestamp: string;
    active_bulletins: number;
  };
  pilot_districts: {
    shimla_landslide_risk: string;
    shimla_flash_flood: string;
    mumbai_pluvial_risk: string;
    wayanad_debris_risk: string;
  };
}

export interface ForecastStateItem {
  code: string;
  name: string;
  zone: string;
  lat: number;
  lon: number;
  pop_millions: number;
  terrain: string;
  consensus: {
    value: number;
    p10: number;
    p50: number;
    p90: number;
    spread: number;
  };
  p_extreme: number;
  alert_level: AlertLevel;
  dominant_model: string;
  models: Record<string, number>;
}

export interface ForecastResponse {
  variable: string;
  lead_day: number;
  lead_hours: number;
  date: string;
  regime: string;
  weights: Record<string, number>;
  national_summary: {
    mean: number;
    min: number;
    max: number;
  };
  states: ForecastStateItem[];
}

export interface FieldResponse {
  variable: string;
  lead_hours: number;
  model: string;
  regime: string;
  bounds: {
    min_lat: number;
    max_lat: number;
    min_lon: number;
    max_lon: number;
  };
  lats: number[];
  lons: number[];
  values: number[][];
  min_value: number;
  max_value: number;
  mean_value: number;
}

export interface CustomBlendRequest {
  variable: string;
  lead: number;
  weights: Record<string, number>;
  region: string;
  regime?: string;
}

export interface CustomBlendResponse {
  region: string;
  variable: string;
  lead_hours: number;
  custom: {
    value: number;
    p10: number;
    p90: number;
    spread: number;
    weights: Record<string, number>;
  };
  operational: {
    value: number;
    p10: number;
    p90: number;
    spread: number;
    weights: Record<string, number>;
  };
  delta: number;
  source_values: Record<string, number>;
}

export interface WeightsResponse {
  variable: string;
  lead_hours: number;
  lead_day: string;
  regime: string;
  weights: Record<string, number>;
  sources: Array<{
    id: string;
    name: string;
    type: SourceType;
    color: string;
    badge: string;
    weight: number;
    percentage: number;
  }>;
}

export interface WeightsMatrixResponse {
  variable: string;
  lead_matrix: Array<Record<string, number | string>>;
  regime_matrix: Array<Record<string, number | string>>;
  models: string[];
}

export interface VerificationMetrics {
  rmse: number;
  mae: number;
  bias: number;
  corr: number;
  crps: number;
  pod: number;
  far: number;
  csi: number;
  ets: number;
  sedi: number;
}

export type VerificationMetricKey =
  | "rmse"
  | "mae"
  | "bias"
  | "corr"
  | "crps"
  | "pod"
  | "far"
  | "csi"
  | "ets"
  | "sedi";

export interface ScorecardItem {
  id: string;
  name: string;
  type: SourceType | "Baseline";
  color: string;
  badge: string;
  metric_value?: number;
  ci_lower?: number;
  ci_upper?: number;
  skill_improvement_pct?: number;
  metrics: VerificationMetrics;
}

export interface SkillCallouts {
  headline: string;
  best_single_model: string;
  best_single_id: string;
  best_single_score: number;
  blend_score: number;
  skill_vs_best_pct: number;
  skill_ci_lower: number;
  skill_ci_upper: number;
  skill_vs_equal_pct: number;
  p_value: string;
  honest_nuance: string;
}

export interface WinLossCell {
  lead_day: number;
  lead_hours: number;
  regime: string;
  winner_id: string;
  winner_name: string;
  winner_color: string;
  winner_type: string;
  is_blend_win: boolean;
  margin_pct: number;
  reason: string;
}

export interface WinLossData {
  total_scenarios: number;
  blend_wins: number;
  single_model_wins: number;
  blend_win_rate_pct: number;
  single_model_win_rate_pct: number;
  regimes: string[];
  leads: number[];
  matrix: WinLossCell[];
}

export interface SkillScorecardResponse {
  variable: string;
  lead_day: number;
  lead_hours: number;
  threshold: number;
  metric?: string;
  season?: string;
  region?: string;
  regime?: string;
  scorecard: ScorecardItem[];
  callouts?: SkillCallouts;
  win_loss?: WinLossData;
}

export interface TaylorModelItem {
  id: string;
  name: string;
  type: SourceType;
  color: string;
  badge: string;
  std_dev: number;
  normalized_std: number;
  correlation: number;
  centered_rms: number;
}

export interface TaylorDiagramResponse {
  variable: string;
  lead_hours: number;
  lead_day: string;
  reference: {
    name: string;
    std_dev: number;
    normalized_std: number;
    correlation: number;
    centered_rms: number;
  };
  models: TaylorModelItem[];
}

export interface ReliabilityBin {
  bin: string;
  forecast_probability: number;
  perfect_reliability: number;
  raw_observed_frequency: number;
  calibrated_observed_frequency: number;
  sample_count: number;
}

export interface ReliabilityResponse {
  variable: string;
  threshold: number;
  lead_day: string;
  brier_score_raw: number;
  brier_score_calibrated: number;
  brier_skill_score_pct: number;
  bins: ReliabilityBin[];
}

export interface ByLeadResponse {
  variable: string;
  metric: string;
  curves: Array<Record<string, number | string>>;
  models: string[];
}

export interface ExtremeAlertItem {
  id: string;
  district: string;
  state: string;
  variable: string;
  threshold_value: number;
  forecast_value: number;
  p10: number;
  p90: number;
  p_extreme: number;
  alert_level: AlertLevel;
  alert_day?: number;
  confidence?: number;
  leading_model: string;
  top_models?: Array<{ id: string; name: string; weight: number }>;
  population_exposed_thousands: number;
  recommended_action: string;
}

export interface ExtremesResponse {
  timestamp: string;
  variable_filter?: string;
  total_active_alerts: number;
  red_count: number;
  orange_count: number;
  yellow_count: number;
  alerts: ExtremeAlertItem[];
}

// Step 9: 10-day alert timeline per district
export interface ExtremesTimelineDay {
  day: number;
  date: string;
  date_label: string;
  p_extreme: number;
  alert_level: AlertLevel;
  forecast_value: number;
}
export interface ExtremesTimelineResponse {
  district: string;
  days: ExtremesTimelineDay[];
}

// Step 9: ROC curve data
export interface RocPoint { fpr: number; tpr: number; threshold: number; }
export interface RocCurve {
  id: string; name: string; color: string; auc: number;
  points: RocPoint[];
}
export interface RocResponse {
  variable: string; threshold: number; sample_size: number;
  curves: RocCurve[];
}

// Step 9: Performance diagram (POD vs success ratio)
export interface PerfPoint {
  id: string; name: string; color: string; type: SourceType;
  pod: number; success_ratio: number; is_blend: boolean;
}
export interface PerfThreshold { threshold: number; label: string; models: PerfPoint[]; }
export interface PerfDiagramResponse { variable: string; thresholds: PerfThreshold[]; }

// Step 9: 90-day event timeline
export type EventOutcome = "hit" | "miss" | "false_alarm" | "correct_null";
export interface EventTimelineItem {
  date: string; date_label: string;
  observed: number; forecast: number; outcome: EventOutcome;
}
export interface EventTimelineResponse {
  variable: string; threshold: number; sample_days: number;
  hits: number; misses: number; false_alarms: number;
  pod: number; far: number;
  events: EventTimelineItem[];
}

// Step 9: Enhanced explain v2
export interface ModelContribution {
  id: string; name: string; color: string; type: SourceType;
  weight: number; raw_forecast: number; bias_corrected: number;
  contribution_pct: number;
}
export interface EnsembleSpread {
  min: number; p10: number; p25: number; p50: number;
  p75: number; p90: number; max: number; threshold: number;
}
export interface ThresholdCrossingPoint { lead_day: number; p_exceed: number; }
export interface ExtremesExplainV2Response {
  district: string; state: string;
  calibrated_exceedance_probability: number;
  alert_level: AlertLevel;
  blend_value_mm: number;
  features: Array<{ feature: string; attribution: number; type: string }>;
  waterfall: ExplainWaterfallStep[];
  model_contributions: ModelContribution[];
  ensemble_spread: EnsembleSpread;
  threshold_crossing: ThresholdCrossingPoint[];
  bias_correction_note: string;
}


export interface ExtremesVerificationThreshold {
  name: string;
  threshold_mm: number;
  imd_category: string;
  models: Array<{
    id: string;
    name: string;
    type: SourceType;
    color: string;
    pod: number;
    far: number;
    csi: number;
    ets: number;
    sedi: number;
  }>;
}

export interface ExtremesVerificationResponse {
  variable: string;
  lead_hours: number;
  sample_size: number;
  thresholds: ExtremesVerificationThreshold[];
}

export interface ExplainWaterfallStep {
  step: string;
  delta: number;
  start: number;
  end: number;
  type: string;
}

export interface ExtremesExplainResponse {
  district: string;
  state: string;
  calibrated_exceedance_probability: number;
  alert_level: AlertLevel;
  base_rate: number;
  features: Array<{
    feature: string;
    attribution: number;
    type: string;
    description: string;
  }>;
  waterfall: ExplainWaterfallStep[];
}

export interface RegimeInterval {
  regime: RegimeId | string;
  start_date: string;
  end_date: string;
  duration_days: number;
  dominant_model: string;
  description: string;
}

export interface RegimesTimelineResponse {
  current_regime: string;
  total_days: number;
  total_intervals: number;
  intervals: RegimeInterval[];
}

export interface RegimesWeightsResponse {
  lead_hours: number;
  variable: string;
  regime_weights: Record<string, Record<string, number>>;
  models: string[];
}

export interface ShimlaImpactResponse {
  district: string;
  state: string;
  coordinates: { lat: number; lon: number };
  elevation_m: number;
  slope_deg: number;
  input_conditions: {
    forecast_rain_24h_mm: number;
    antecedent_precipitation_30d_mm: number;
    soil_saturation_prior_pct: number;
    soil_saturation_post_pct: number;
  };
  hydrology: {
    surface_runoff_mm: number;
    soil_infiltration_mm: number;
    perched_water_table_m: number;
    flash_flood_risk_index: number;
    flash_flood_alert: AlertLevel;
    flash_flood_description: string;
  };
  geotechnical: {
    factor_of_safety: number;
    landslide_risk: "LOW" | "MODERATE" | "HIGH" | "CRITICAL";
    landslide_color: string;
    landslide_description: string;
    pore_water_pressure_kpa: number;
    effective_normal_stress_kpa: number;
  };
  critical_infrastructure_risk: Array<{
    asset: string;
    status: string;
    threat: string;
  }>;
}

export interface OpsPipelineItem {
  id: string;
  name: string;
  full_name: string;
  type: SourceType;
  color: string;
  status: string;
  health: string;
  latency_ms: number;
  last_sync_utc: string;
  resolution: string;
  data_adapter: string;
  fallback_engaged: boolean;
  validation_status: string;
}

export interface OpsPipelineResponse {
  system_status: string;
  active_sources: number;
  total_sources: number;
  pipelines: OpsPipelineItem[];
}

export interface OpsRunRecord {
  run_id: string;
  timestamp: string;
  cycle: string;
  duration_ms: number;
  models_synced: number;
  models_total: number;
  models_used?: string[];
  fallback_engaged: boolean;
  active_alerts: number;
  regime: string;
  status: "SUCCESS" | "FAILED" | "WARNING" | string;
  skill_delta?: string;
  logs?: string;
}

export interface OpsHistoryResponse {
  total_runs: number;
  returned_runs: number;
  runs: OpsRunRecord[];
}

export interface OpsRunResponse {
  status: string;
  run_id: string;
  stream_url: string;
  details: OpsRunRecord;
}

export type DagNodeId = "ingest" | "qc" | "bias_correct" | "weight_update" | "blend" | "verify" | "publish";
export type DagNodeState = "idle" | "running" | "success" | "warn" | "fail";

export interface OpsStreamEvent {
  run_id: string;
  node_id?: DagNodeId;
  step: string;
  progress: number;
  duration_ms?: number;
  node_state?: DagNodeState;
  status?: string;
  message: string;
  timestamp: string;
}

export interface OpsProduct {
  id: string;
  name: string;
  format: string;
  size: string;
  download_url: string;
  filename: string;
  sha256: string;
  description: string;
}

export interface OpsProductsResponse {
  products: OpsProduct[];
}

export interface OpsHealthSource {
  id: string;
  name: string;
  type: string;
  freshness: string;
  latency_ms: number;
  error_rate: string;
  status: string;
  health: string;
}

export interface OpsHealthResponse {
  system_status: string;
  uptime_pct: number;
  queue_depth: number;
  active_workers: number;
  last_ingest_cycle: string;
  average_latency_ms: number;
  sources: OpsHealthSource[];
}
// Legacy types retained for backwards compatibility
export interface StateRisk {
  code: string;
  name: string;
  zone: string;
  lat: number;
  lon: number;
  population_millions: number;
  affected_pop_millions: number;
  terrain: string;
  alert_level: AlertLevel;
  alert_color: string;
  primary_hazard: string;
  sop_action: string;
  metrics: {
    rainfall_mm: number;
    rainfall_p90_mm: number;
    tmax_c: number;
    tmax_departure_c: number;
    wind_gust_kmh: number;
    p_heavy_rain: number;
    p_very_heavy_rain: number;
    p_extreme_rain: number;
    p_heatwave: number;
    p_gale_gust: number;
  };
}

export interface ExtremesBulletin {
  issued_at: string;
  lead_hours: number;
  lead_day: string;
  regime: string;
  season: string;
  summary: {
    red_alerts: number;
    orange_alerts: number;
    yellow_watches: number;
    green_normal: number;
    total_states: number;
    population_at_risk_millions: number;
  };
  states: StateRisk[];
}

export interface ModelComparisonItem {
  id: string;
  name: string;
  type: SourceType;
  color: string;
  badge: string;
  value: number;
  std_dev: number;
  ci_lower: number;
  ci_upper: number;
  weight: number;
  rmse: number;
  ets: number;
  spread_skill_ratio: number;
  crps: number;
}

export interface ModelComparisonResponse {
  lead: number;
  variable: string;
  region: string;
  regime: string;
  season: string;
  consensus: {
    value: number;
    std_dev: number;
    ci_lower: number;
    ci_upper: number;
  };
  models: ModelComparisonItem[];
}

export interface BlendingWeightsResponse {
  lead: number;
  regime: string;
  variable: string;
  weights: Record<string, number>;
  sources: Array<{
    id: string;
    name: string;
    type: SourceType;
    color: string;
    badge: string;
    weight: number;
    percentage: number;
  }>;
}

export interface EnsembleMember {
  member_id: number;
  label: string;
  value: number;
  is_control: boolean;
}

export interface PlumePoint {
  lead: number;
  day: string;
  consensus: number;
  p10: number;
  p50: number;
  p90: number;
  ensemble_mean: number;
  members: number[];
}

export interface EnsembleDistributionResponse {
  variable: string;
  region: string;
  lead: number;
  regime: string;
  season: string;
  current_members: EnsembleMember[];
  plume_timeline: PlumePoint[];
}

export interface PINNStudyMetrics {
  title: string;
  study_id: string;
  dataset: string;
  label: string;
  summary: string;
  mass_conservation_violation_pct: {
    raw_nwp: number;
    pure_ai: number;
    samanvay_pinn: number;
    improvement_over_ai: string;
  };
  precipitation_rmse_mm: {
    raw_nwp: number;
    pure_ai: number;
    samanvay_pinn: number;
    improvement_over_nwp: string;
    improvement_over_ai: string;
  };
  equitable_threat_score_heavy_rain: {
    raw_nwp: number;
    pure_ai: number;
    samanvay_pinn: number;
    improvement: string;
  };
  brier_skill_score: {
    raw_nwp: number;
    pure_ai: number;
    samanvay_pinn: number;
    improvement: string;
  };
  lead_time_skill_retention_days: {
    raw_nwp: number;
    pure_ai: number;
    samanvay_pinn: number;
    gain: string;
  };
  historical_extreme_case_studies: Array<{
    event_name: string;
    region: string;
    observed_peak_gust_kmh?: number;
    observed_max_rain_mm?: number;
    observed_max_temp_c?: number;
    raw_nwp_lead72_error: string;
    pure_ai_lead72_error: string;
    samanvay_lead72_result: string;
    pinn_constraint_contribution: string;
  }>;
}

export interface MapGridResponse {
  variable: string;
  source: string;
  lead: number;
  regime: string;
  season: string;
  bounds: {
    min_lat: number;
    max_lat: number;
    min_lon: number;
    max_lon: number;
  };
  lats: number[];
  lons: number[];
  values: number[][];
  min_value: number;
  max_value: number;
  mean_value: number;
}

export interface PlumeTimelinePoint {
  lead_day: number;
  lead_hours: number;
  label: string;
  samanvay: number;
  p10: number;
  p50: number;
  p90: number;
  truth: number;
  weights: Record<string, number>;
  ncum_g: number;
  neps: number;
  imd_gfs: number;
  ecmwf_ifs: number;
  graphcast: number;
  pangu: number;
  fourcastnet: number;
  [key: string]: any;
}

export interface QuantileDataPoint {
  percentile: number;
  observed: number;
  raw: number;
  corrected: number;
  tail_marker: boolean;
}

export interface ModelScorecardItem {
  id: string;
  name: string;
  type: string;
  color: string;
  badge: string;
  bias: number;
  mae: number;
  rmse: number;
  corr: number;
}

export interface PlumeResponse {
  region: RegionState;
  variable: string;
  regime: string;
  method: string;
  timeline: PlumeTimelinePoint[];
  quantile_data: QuantileDataPoint[];
  model_scorecards: ModelScorecardItem[];
  insights: string[];
}

export interface RegionWeightDetail {
  code: string;
  name: string;
  zone: string;
  terrain: string;
  lat: number;
  lon: number;
  weights: Record<string, number>;
  dominant_model: string;
  dominant_color: string;
  dominant_type: string;
  top_3: Array<{
    id: string;
    name: string;
    type: string;
    color: string;
    weight: number;
    percentage: number;
  }>;
  confidence: number;
  sample_size: number;
}

export interface ReliabilityMatrixRow {
  lead: number;
  lead_day: number;
  label: string;
  [regionCode: string]: any;
}

export interface WeightsMapInsight {
  id: string;
  title: string;
  metric: string;
  description: string;
  badge: string;
}

export interface WeightsMapResponse {
  variable: string;
  lead_hours: number;
  lead_day: number;
  season: string;
  regime: string;
  method: string;
  regions: RegionWeightDetail[];
  reliability_matrix: {
    leads: number[];
    rows: ReliabilityMatrixRow[];
  };
  default_evolution: Array<{
    lead: number;
    day: string;
    [modelId: string]: any;
  }>;
  insights: WeightsMapInsight[];
  models_meta: Array<{
    id: string;
    name: string;
    type: string;
    color: string;
    badge: string;
  }>;
}


// =============================================================
// STEP 11 — Disaster Management Water Balance + DEM types
// =============================================================

export type FloodRisk = "LOW" | "MODERATE" | "HIGH" | "CRITICAL";
export type SusceptLevel = "LOW" | "MODERATE" | "HIGH" | "VERY_HIGH";

export interface WaterBalanceDay {
  day: number;
  date: string;
  date_label: string;
  rainfall_mm: number;
  soil_moisture_mm: number;
  soil_moisture_pct: number;
  runoff_mm: number;
  et_mm: number;
  delta_S: number;
  flood_risk: FloodRisk;
  mass_conserved: boolean;
}

export interface WaterBalanceResponse {
  scenario_pct: number;
  effective_rainfall_day1: number;
  initial_soil_moisture_mm: number;
  initial_soil_moisture_pct: number;
  s_max_mm: number;
  flood_threshold_80p_mm: number;
  peak_runoff_mm: number;
  peak_soil_moisture_mm: number;
  mass_conservation_check: boolean;
  days: WaterBalanceDay[];
}

export interface LandslideDemCell {
  row: number;
  col: number;
  elevation_m: number;
  slope_deg: number;
  aspect_deg: number;
  susceptibility: number;
  level: SusceptLevel;
}

export interface LandslideDemResponse {
  cols: number;
  rows: number;
  resolution_m: number;
  district: string;
  note: string;
  level_counts: Record<SusceptLevel, number>;
  cells: LandslideDemCell[];
}
