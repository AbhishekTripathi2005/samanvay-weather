// SAMANVAY TanStack Query Hooks & Data Fetching Layer
// MoES / NCMRWF (PS 26081)

import { useQuery, useMutation, useQueryClient, UseQueryOptions } from "@tanstack/react-query";
import { toast } from "sonner";
import * as api from "./api";
import {
  MetaResponse,
  KpisResponse,
  ForecastResponse,
  FieldResponse,
  WeightsResponse,
  WeightsMatrixResponse,
  SkillScorecardResponse,
  TaylorDiagramResponse,
  ReliabilityResponse,
  ByLeadResponse,
  ExtremesResponse,
  ExtremesVerificationResponse,
  ExtremesExplainResponse,
  ExtremesExplainV2Response,
  ExtremesTimelineResponse,
  RocResponse,
  PerfDiagramResponse,
  EventTimelineResponse,
  RegimesTimelineResponse,
  RegimesWeightsResponse,
  ShimlaImpactResponse,
  OpsPipelineResponse,
  OpsHistoryResponse,
  CustomBlendRequest,
  CustomBlendResponse,
  OpsRunResponse,
  PlumeResponse,
  WeightsMapResponse
} from "./types";


// Standard query configuration: Stale-While-Revalidate with caching
const STALE_TIME = 60 * 1000; // 60 seconds
const GC_TIME = 5 * 60 * 1000; // 5 minutes

export const queryKeys = {
  meta: ["meta"] as const,
  kpis: ["kpis"] as const,
  forecast: (v: string, l: number, d?: string, r?: string) => ["forecast", v, l, d || "today", r || "auto"] as const,
  field: (v: string, l: number, m: string, d?: string) => ["field", v, l, m, d || "today"] as const,
  weights: (v: string, l: number, r: string) => ["weights", v, l, r] as const,
  weightsMatrix: (v: string) => ["weightsMatrix", v] as const,
  skill: (v: string, l: number, m?: string) => ["skill", v, l, m || "all"] as const,
  taylor: (v: string, l: number) => ["taylor", v, l] as const,
  reliability: (v: string, t: number, l: number) => ["reliability", v, t, l] as const,
  byLead: (v: string, m: string) => ["byLead", v, m] as const,
  extremes: ["extremes"] as const,
  extremesVerification: (v: string) => ["extremesVerification", v] as const,
  extremesExplain: (d: string) => ["extremesExplain", d] as const,
  extremesByVariable: (v: string) => ["extremesByVariable", v] as const,
  extremesTimeline: (d: string) => ["extremesTimeline", d] as const,
  extremesRoc: (v: string, t: number) => ["extremesRoc", v, t] as const,
  extremesPerf: (v: string) => ["extremesPerf", v] as const,
  extremesEvents: (v: string, t: number) => ["extremesEvents", v, t] as const,
  extremesExplainV2: (d: string) => ["extremesExplainV2", d] as const,
  regimesTimeline: ["regimesTimeline"] as const,
  regimesWeights: ["regimesWeights"] as const,
  shimlaImpact: (r?: number, a?: number) => ["shimlaImpact", r ?? 85, a ?? 142] as const,
  opsPipeline: ["opsPipeline"] as const,
  opsHistory: (limit: number) => ["opsHistory", limit] as const,
  forecastPlume: (r?: string, v?: string, d?: string, reg?: string, m?: string, hl?: number, t?: number) =>
    ["forecastPlume", r || "DL", v || "rainfall", d || "today", reg || "auto", m || "stacked_nnls", hl ?? 14, t ?? 1.0] as const,
  weightsMap: (v?: string, l?: number, s?: string, reg?: string, m?: string) =>
    ["weightsMap", v || "rainfall", l ?? 72, s || "JJAS", reg || "Active monsoon", m || "stacked_nnls"] as const
};

// 1. Meta Query
export function useMetaQuery(options?: Partial<UseQueryOptions<MetaResponse>>) {
  return useQuery({
    queryKey: queryKeys.meta,
    queryFn: api.fetchMeta,
    staleTime: Infinity, // static catalogue
    ...options
  });
}

// 2. KPIs Query
export function useKpisQuery(options?: Partial<UseQueryOptions<KpisResponse>>) {
  return useQuery({
    queryKey: queryKeys.kpis,
    queryFn: api.fetchKpis,
    staleTime: 30 * 1000,
    refetchInterval: 60 * 1000, // live heartbeat every minute
    ...options
  });
}

// 3. Forecast Query
export function useForecastQuery(params: {
  variable: string;
  lead: number;
  date?: string;
  regime?: string;
}) {
  return useQuery({
    queryKey: queryKeys.forecast(params.variable, params.lead, params.date, params.regime),
    queryFn: () => api.fetchForecast(params),
    staleTime: STALE_TIME,
    gcTime: GC_TIME
  });
}

// 4. Field Query
export function useFieldQuery(params: {
  variable: string;
  lead: number;
  model: string;
  date?: string;
}) {
  return useQuery({
    queryKey: queryKeys.field(params.variable, params.lead, params.model, params.date),
    queryFn: () => api.fetchField(params),
    staleTime: STALE_TIME,
    gcTime: GC_TIME
  });
}

// 5. Custom Blend Mutation
export function useCustomBlendMutation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: CustomBlendRequest) => api.postCustomBlend(payload),
    onSuccess: () => {
      toast.success("Custom weights calculated successfully");
    },
    onError: (err: any) => {
      toast.error(`Custom blend failed: ${err.message}`);
    }
  });
}

// 6. Weights Query
export function useWeightsQuery(params: {
  variable: string;
  lead: number;
  regime: string;
}) {
  return useQuery({
    queryKey: queryKeys.weights(params.variable, params.lead, params.regime),
    queryFn: () => api.fetchWeights(params),
    staleTime: STALE_TIME
  });
}

// 7. Weights Matrix Query
export function useWeightsMatrixQuery(variable: string = "rainfall") {
  return useQuery({
    queryKey: queryKeys.weightsMatrix(variable),
    queryFn: () => api.fetchWeightsMatrix(variable),
    staleTime: STALE_TIME
  });
}

// 8. Skill Scorecard Query
export function useSkillQuery(params: {
  variable: string;
  lead: number;
  metric?: string;
  season?: string;
  region?: string;
  regime?: string;
}) {
  return useQuery({
    queryKey: [...queryKeys.skill(params.variable, params.lead, params.metric), params.season, params.region, params.regime],
    queryFn: () => api.fetchSkill(params),
    staleTime: STALE_TIME
  });
}

// 9. Taylor Diagram Query
export function useTaylorQuery(params: {
  variable: string;
  lead: number;
}) {
  return useQuery({
    queryKey: queryKeys.taylor(params.variable, params.lead),
    queryFn: () => api.fetchTaylor(params),
    staleTime: STALE_TIME
  });
}

// 10. Reliability Diagram Query
export function useReliabilityQuery(params: {
  variable: string;
  threshold: number;
  lead: number;
}) {
  return useQuery({
    queryKey: queryKeys.reliability(params.variable, params.threshold, params.lead),
    queryFn: () => api.fetchReliability(params),
    staleTime: STALE_TIME
  });
}

// 11. By-Lead Query
export function useByLeadQuery(params: {
  variable: string;
  metric: string;
}) {
  return useQuery({
    queryKey: queryKeys.byLead(params.variable, params.metric),
    queryFn: () => api.fetchByLead(params),
    staleTime: STALE_TIME
  });
}

// 12. Extremes Active Alerts Query
export function useExtremesQuery() {
  return useQuery({
    queryKey: queryKeys.extremes,
    queryFn: api.fetchExtremes,
    staleTime: 30 * 1000,
    refetchInterval: 45 * 1000
  });
}

// 13. Extremes Verification Query
export function useExtremesVerificationQuery(variable: string = "rainfall") {
  return useQuery({
    queryKey: queryKeys.extremesVerification(variable),
    queryFn: () => api.fetchExtremesVerification(variable),
    staleTime: STALE_TIME
  });
}

// 14. Extremes Explainability Query
export function useExtremesExplainQuery(district: string = "shimla") {
  return useQuery({
    queryKey: queryKeys.extremesExplain(district),
    queryFn: () => api.fetchExtremesExplain(district),
    staleTime: STALE_TIME
  });
}

// 15. Regimes Timeline Query
export function useRegimesTimelineQuery() {
  return useQuery({
    queryKey: queryKeys.regimesTimeline,
    queryFn: api.fetchRegimesTimeline,
    staleTime: STALE_TIME
  });
}

// 16. Regimes Weights Query
export function useRegimesWeightsQuery() {
  return useQuery({
    queryKey: queryKeys.regimesWeights,
    queryFn: api.fetchRegimesWeights,
    staleTime: STALE_TIME
  });
}

// 17. Shimla Impact Query
export function useShimlaImpactQuery(params?: {
  forecast_rain?: number;
  api_30?: number;
}) {
  return useQuery({
    queryKey: queryKeys.shimlaImpact(params?.forecast_rain, params?.api_30),
    queryFn: () => api.fetchShimlaImpact(params),
    staleTime: 30 * 1000
  });
}

// 18. Ops Pipeline Health Query
export function useOpsPipelineQuery() {
  return useQuery({
    queryKey: queryKeys.opsPipeline,
    queryFn: api.fetchOpsPipeline,
    staleTime: 15 * 1000,
    refetchInterval: 30 * 1000
  });
}

// 19. Ops History Query
export function useOpsHistoryQuery(limit: number = 30) {
  return useQuery({
    queryKey: queryKeys.opsHistory(limit),
    queryFn: () => api.fetchOpsHistory(limit),
    staleTime: 20 * 1000
  });
}

// 20. Trigger Ops Run Mutation
export function useOpsRunMutation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: api.postOpsRun,
    onSuccess: (data) => {
      toast.success(`Operational run initiated: ${data.run_id}`);
      qc.invalidateQueries({ queryKey: queryKeys.opsHistory(30) });
      qc.invalidateQueries({ queryKey: queryKeys.kpis });
    },
    onError: (err: any) => {
      toast.error(`Pipeline run trigger failed: ${err.message}`);
    }
  });
}

// 21. Forecast Plume Query (Workbench)
export function useForecastPlumeQuery(params: {
  region?: string;
  variable?: string;
  date?: string;
  regime?: string;
  method?: string;
  half_life?: number;
  temperature?: number;
}) {
  return useQuery({
    queryKey: queryKeys.forecastPlume(
      params.region,
      params.variable,
      params.date,
      params.regime,
      params.method,
      params.half_life,
      params.temperature
    ),
    queryFn: () => api.fetchForecastPlume(params),
    staleTime: STALE_TIME
  });
}

// 22. Regional Weights Map Query (Adaptive Weights)
export function useWeightsMapQuery(params: {
  variable?: string;
  lead?: number;
  season?: string;
  regime?: string;
  method?: string;
}) {
  return useQuery({
    queryKey: queryKeys.weightsMap(
      params.variable,
      params.lead,
      params.season,
      params.regime,
      params.method
    ),
    queryFn: () => api.fetchWeightsMap(params),
    staleTime: STALE_TIME
  });
}

// =============================================================
// STEP 9 — Extreme Weather Guidance Query Hooks
// =============================================================

export function useExtremesByVariableQuery(variable: string = "rainfall") {
  return useQuery({
    queryKey: queryKeys.extremesByVariable(variable),
    queryFn: () => api.fetchExtremesByVariable(variable),
    staleTime: 30 * 1000,
    refetchInterval: 60 * 1000
  });
}

export function useExtremesTimelineQuery(district: string, enabled = true) {
  return useQuery({
    queryKey: queryKeys.extremesTimeline(district),
    queryFn: () => api.fetchExtremesTimeline(district),
    staleTime: STALE_TIME,
    enabled: enabled && district.length > 0
  });
}

export function useExtremesRocQuery(variable: string = "rainfall", threshold: number = 64.5) {
  return useQuery({
    queryKey: queryKeys.extremesRoc(variable, threshold),
    queryFn: () => api.fetchExtremesRoc(variable, threshold),
    staleTime: STALE_TIME
  });
}

export function useExtremesPerfQuery(variable: string = "rainfall") {
  return useQuery({
    queryKey: queryKeys.extremesPerf(variable),
    queryFn: () => api.fetchExtremesPerf(variable),
    staleTime: STALE_TIME
  });
}

export function useExtremesEventsQuery(variable: string = "rainfall", threshold: number = 64.5) {
  return useQuery({
    queryKey: queryKeys.extremesEvents(variable, threshold),
    queryFn: () => api.fetchExtremesEvents(variable, threshold),
    staleTime: STALE_TIME
  });
}

export function useExtremesExplainV2Query(district: string, enabled = true) {
  return useQuery<ExtremesExplainV2Response>({
    queryKey: queryKeys.extremesExplainV2(district),
    queryFn: () => api.fetchExtremesExplainV2(district),
    staleTime: STALE_TIME,
    enabled: enabled && district.length > 0
  });
}
