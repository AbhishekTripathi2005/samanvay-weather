// SAMANVAY Typed API Client
// MoES / NCMRWF (PS 26081)

import {
  MetaResponse,
  KpisResponse,
  ForecastResponse,
  FieldResponse,
  CustomBlendRequest,
  CustomBlendResponse,
  WeightsResponse,
  WeightsMatrixResponse,
  SkillScorecardResponse,
  TaylorDiagramResponse,
  ReliabilityResponse,
  ByLeadResponse,
  ExtremesResponse,
  ExtremesVerificationResponse,
  ExtremesExplainResponse,
  RegimesTimelineResponse,
  RegimesWeightsResponse,
  ShimlaImpactResponse,
  OpsPipelineResponse,
  OpsHistoryResponse,
  OpsRunResponse,
  ExtremesBulletin,
  ModelComparisonResponse,
  BlendingWeightsResponse,
  EnsembleDistributionResponse,
  PINNStudyMetrics,
  MapGridResponse,
  PlumeResponse,
  WeightsMapResponse
} from "./types";

const API_BASE = typeof window !== "undefined" ? "/api" : "http://127.0.0.1:8000/api";

async function request<T>(endpoint: string, options?: RequestInit): Promise<T> {
  const url = `${API_BASE}${endpoint}`;
  try {
    const res = await fetch(url, {
      ...options,
      headers: {
        "Content-Type": "application/json",
        ...options?.headers
      }
    });
    if (!res.ok) {
      const errBody = await res.text();
      throw new Error(`API Error [${res.status}]: ${errBody || res.statusText}`);
    }
    return res.json();
  } catch (err: any) {
    console.error(`Failed request to ${url}:`, err);
    throw err;
  }
}

// 1. Meta
export async function fetchMeta(): Promise<MetaResponse> {
  return request<MetaResponse>("/meta");
}

// 2. KPIs
export async function fetchKpis(): Promise<KpisResponse> {
  return request<KpisResponse>("/kpis");
}

// 3. Forecast
export async function fetchForecast(params: {
  variable?: string;
  lead?: number;
  date?: string;
  regime?: string;
}): Promise<ForecastResponse> {
  const qs = new URLSearchParams();
  if (params.variable) qs.set("var", params.variable);
  if (params.lead !== undefined) qs.set("lead", params.lead.toString());
  if (params.date) qs.set("date", params.date);
  if (params.regime) qs.set("regime", params.regime);
  return request<ForecastResponse>(`/forecast?${qs.toString()}`);
}

// 4. Field
export async function fetchField(params: {
  variable?: string;
  lead?: number;
  model?: string;
  date?: string;
}): Promise<FieldResponse> {
  const qs = new URLSearchParams();
  if (params.variable) qs.set("var", params.variable);
  if (params.lead !== undefined) qs.set("lead", params.lead.toString());
  if (params.model) qs.set("model", params.model);
  if (params.date) qs.set("date", params.date);
  return request<FieldResponse>(`/field?${qs.toString()}`);
}

// 5. Custom Blend (POST)
export async function postCustomBlend(payload: CustomBlendRequest): Promise<CustomBlendResponse> {
  return request<CustomBlendResponse>("/blend/custom", {
    method: "POST",
    body: JSON.stringify(payload)
  });
}

// 6. Weights
export async function fetchWeights(params: {
  variable?: string;
  lead?: number;
  regime?: string;
}): Promise<WeightsResponse> {
  const qs = new URLSearchParams();
  if (params.variable) qs.set("var", params.variable);
  if (params.lead !== undefined) qs.set("lead", params.lead.toString());
  if (params.regime) qs.set("regime", params.regime);
  return request<WeightsResponse>(`/weights?${qs.toString()}`);
}

// 7. Weights Matrix
export async function fetchWeightsMatrix(variable?: string): Promise<WeightsMatrixResponse> {
  const qs = variable ? `?var=${encodeURIComponent(variable)}` : "";
  return request<WeightsMatrixResponse>(`/weights/matrix${qs}`);
}

// 8. Skill Scorecard
export async function fetchSkill(params: {
  variable?: string;
  lead?: number;
  metric?: string;
  season?: string;
  region?: string;
  regime?: string;
}): Promise<SkillScorecardResponse> {
  const qs = new URLSearchParams();
  if (params.variable) qs.set("var", params.variable);
  if (params.lead !== undefined) qs.set("lead", params.lead.toString());
  if (params.metric) qs.set("metric", params.metric);
  if (params.season) qs.set("season", params.season);
  if (params.region) qs.set("region", params.region);
  if (params.regime) qs.set("regime", params.regime);
  return request<SkillScorecardResponse>(`/skill?${qs.toString()}`);
}

// 9. Taylor Diagram
export async function fetchTaylor(params: {
  variable?: string;
  lead?: number;
}): Promise<TaylorDiagramResponse> {
  const qs = new URLSearchParams();
  if (params.variable) qs.set("var", params.variable);
  if (params.lead !== undefined) qs.set("lead", params.lead.toString());
  return request<TaylorDiagramResponse>(`/skill/taylor?${qs.toString()}`);
}

// 10. Reliability Diagram
export async function fetchReliability(params: {
  variable?: string;
  threshold?: number;
  lead?: number;
}): Promise<ReliabilityResponse> {
  const qs = new URLSearchParams();
  if (params.variable) qs.set("var", params.variable);
  if (params.threshold !== undefined) qs.set("threshold", params.threshold.toString());
  if (params.lead !== undefined) qs.set("lead", params.lead.toString());
  return request<ReliabilityResponse>(`/reliability?${qs.toString()}`);
}

// 11. By-Lead Skill Trajectory
export async function fetchByLead(params: {
  variable?: string;
  metric?: string;
}): Promise<ByLeadResponse> {
  const qs = new URLSearchParams();
  if (params.variable) qs.set("var", params.variable);
  if (params.metric) qs.set("metric", params.metric);
  return request<ByLeadResponse>(`/by-lead?${qs.toString()}`);
}

// 12. Extremes Active Alerts
export async function fetchExtremes(): Promise<ExtremesResponse> {
  return request<ExtremesResponse>("/extremes");
}

// 13. Extremes Verification Contingency
export async function fetchExtremesVerification(variable?: string): Promise<ExtremesVerificationResponse> {
  const qs = variable ? `?var=${encodeURIComponent(variable)}` : "";
  return request<ExtremesVerificationResponse>(`/extremes/verification${qs}`);
}

// 14. Explainability (SHAP-style Feature Attribution)
export async function fetchExtremesExplain(district?: string): Promise<ExtremesExplainResponse> {
  const qs = district ? `?district=${encodeURIComponent(district)}` : "";
  return request<ExtremesExplainResponse>(`/extremes/explain${qs}`);
}

// 15. Regimes Timeline
export async function fetchRegimesTimeline(): Promise<RegimesTimelineResponse> {
  return request<RegimesTimelineResponse>("/regimes/timeline");
}

// 16. Regimes Weights
export async function fetchRegimesWeights(): Promise<RegimesWeightsResponse> {
  return request<RegimesWeightsResponse>("/regimes/weights");
}

// 17. Shimla PINN-Lite Impact Module
export async function fetchShimlaImpact(params?: {
  forecast_rain?: number;
  api_30?: number;
}): Promise<ShimlaImpactResponse> {
  const qs = new URLSearchParams();
  if (params?.forecast_rain !== undefined) qs.set("forecast_rain", params.forecast_rain.toString());
  if (params?.api_30 !== undefined) qs.set("api_30", params.api_30.toString());
  return request<ShimlaImpactResponse>(`/impact/shimla?${qs.toString()}`);
}

// 18. Ops Pipeline Health
export async function fetchOpsPipeline(): Promise<OpsPipelineResponse> {
  return request<OpsPipelineResponse>("/ops/pipeline");
}

// 19. Ops Run History
export async function fetchOpsHistory(limit: number = 30): Promise<OpsHistoryResponse> {
  return request<OpsHistoryResponse>(`/ops/history?limit=${limit}`);
}

// 20. Trigger Ops Run (POST)
export async function postOpsRun(): Promise<OpsRunResponse> {
  return request<OpsRunResponse>("/ops/run", { method: "POST" });
}

// Legacy helpers
export async function fetchHealth() {
  return request("/health");
}

export async function fetchConfig() {
  return request("/config");
}

export async function fetchExtremesBulletin(lead: number, regime: string, season: string): Promise<ExtremesBulletin> {
  return request<ExtremesBulletin>(`/extremes/bulletin?lead=${lead}&regime=${encodeURIComponent(regime)}&season=${encodeURIComponent(season)}`);
}

export async function fetchSourcesCompare(
  variable: string,
  lead: number,
  region: string,
  regime: string,
  season: string
): Promise<ModelComparisonResponse> {
  return request<ModelComparisonResponse>(
    `/sources/compare?variable=${encodeURIComponent(variable)}&lead=${lead}&region=${encodeURIComponent(region)}&regime=${encodeURIComponent(regime)}&season=${encodeURIComponent(season)}`
  );
}

export async function fetchBlendingWeights(lead: number, regime: string, variable: string): Promise<BlendingWeightsResponse> {
  return request<BlendingWeightsResponse>(`/blending/weights?lead=${lead}&regime=${encodeURIComponent(regime)}&variable=${encodeURIComponent(variable)}`);
}

export async function fetchEnsembleDistribution(
  variable: string,
  lead: number,
  region: string,
  regime: string,
  season: string
): Promise<EnsembleDistributionResponse> {
  return request<EnsembleDistributionResponse>(
    `/ensemble/distribution?variable=${encodeURIComponent(variable)}&lead=${lead}&region=${encodeURIComponent(region)}&regime=${encodeURIComponent(regime)}&season=${encodeURIComponent(season)}`
  );
}

export async function fetchPINNStudyMetrics(): Promise<PINNStudyMetrics> {
  return request<PINNStudyMetrics>("/pinn/study-metrics");
}

export async function fetchPINNDiagnostics(lead: number, regime: string) {
  return request(`/pinn/diagnostics?lead=${lead}&regime=${encodeURIComponent(regime)}`);
}

export async function fetchMapGrid(
  variable: string,
  lead: number,
  regime: string,
  season: string,
  source: string = "samanvay"
): Promise<MapGridResponse> {
  return request<MapGridResponse>(
    `/map/grid?variable=${encodeURIComponent(variable)}&lead=${lead}&regime=${encodeURIComponent(regime)}&season=${encodeURIComponent(season)}&source=${encodeURIComponent(source)}`
  );
}

// 23. Forecast Plume & Quantile CDF Data
export async function fetchForecastPlume(params: {
  region?: string;
  variable?: string;
  date?: string;
  regime?: string;
  method?: string;
  half_life?: number;
  temperature?: number;
}): Promise<PlumeResponse> {
  const qs = new URLSearchParams();
  if (params.region) qs.set("region", params.region);
  if (params.variable) qs.set("variable", params.variable);
  if (params.date) qs.set("date", params.date);
  if (params.regime) qs.set("regime", params.regime);
  if (params.method) qs.set("method", params.method);
  if (params.half_life !== undefined) qs.set("half_life", params.half_life.toString());
  if (params.temperature !== undefined) qs.set("temperature", params.temperature.toString());
  return request<PlumeResponse>(`/forecast/plume?${qs.toString()}`);
}

// 24. Regional Weights Map & Reliability Matrix
export async function fetchWeightsMap(params: {
  variable?: string;
  lead?: number;
  season?: string;
  regime?: string;
  method?: string;
}): Promise<WeightsMapResponse> {
  const qs = new URLSearchParams();
  if (params.variable) qs.set("variable", params.variable);
  if (params.lead !== undefined) qs.set("lead", params.lead.toString());
  if (params.season) qs.set("season", params.season);
  if (params.regime) qs.set("regime", params.regime);
  if (params.method) qs.set("method", params.method);
  return request<WeightsMapResponse>(`/weights/map?${qs.toString()}`);
}

