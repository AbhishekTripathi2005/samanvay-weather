export type SourceType = "NWP" | "Ensemble" | "AI" | "Blended";

export interface SourceMeta {
  id: string;
  name: string;
  full_name: string;
  type: SourceType;
  color: string;
  badge: string;
  organization: string;
  resolution: string;
  physics_type?: string;
  members?: number;
}

export interface VariableMeta {
  id: string;
  name: string;
  short_name: string;
  unit: string;
  min: number;
  max: number;
  step: number;
  color_scale: string;
  icon: string;
}

export interface RegimeMeta {
  id: string;
  description: string;
  primary_season: string;
  dominant_source: string;
}

export interface StateRisk {
  code: string;
  name: string;
  zone: string;
  lat: number;
  lon: number;
  population_millions: number;
  affected_pop_millions: number;
  terrain: string;
  alert_level: "RED" | "ORANGE" | "YELLOW" | "GREEN";
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
