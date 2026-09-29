import {
  ExtremesBulletin,
  ModelComparisonResponse,
  BlendingWeightsResponse,
  EnsembleDistributionResponse,
  PINNStudyMetrics,
  MapGridResponse
} from "./types";

const API_BASE = typeof window !== "undefined" ? "/api" : "http://127.0.0.1:8000/api";

export async function fetchHealth() {
  const res = await fetch(`${API_BASE}/health`);
  if (!res.ok) throw new Error("Health check failed");
  return res.json();
}

export async function fetchConfig() {
  const res = await fetch(`${API_BASE}/config`);
  if (!res.ok) throw new Error("Failed to fetch configuration");
  return res.json();
}

export async function fetchExtremesBulletin(lead: number, regime: string, season: string): Promise<ExtremesBulletin> {
  const params = new URLSearchParams({
    lead: lead.toString(),
    regime,
    season
  });
  const res = await fetch(`${API_BASE}/extremes/bulletin?${params}`);
  if (!res.ok) throw new Error("Failed to fetch extremes bulletin");
  return res.json();
}

export async function fetchSourcesCompare(
  variable: string,
  lead: number,
  region: string,
  regime: string,
  season: string
): Promise<ModelComparisonResponse> {
  const params = new URLSearchParams({
    variable,
    lead: lead.toString(),
    region,
    regime,
    season
  });
  const res = await fetch(`${API_BASE}/sources/compare?${params}`);
  if (!res.ok) throw new Error("Failed to fetch model comparison");
  return res.json();
}

export async function fetchBlendingWeights(lead: number, regime: string, variable: string): Promise<BlendingWeightsResponse> {
  const params = new URLSearchParams({
    lead: lead.toString(),
    regime,
    variable
  });
  const res = await fetch(`${API_BASE}/blending/weights?${params}`);
  if (!res.ok) throw new Error("Failed to fetch blending weights");
  return res.json();
}

export async function fetchEnsembleDistribution(
  variable: string,
  lead: number,
  region: string,
  regime: string,
  season: string
): Promise<EnsembleDistributionResponse> {
  const params = new URLSearchParams({
    variable,
    lead: lead.toString(),
    region,
    regime,
    season
  });
  const res = await fetch(`${API_BASE}/ensemble/distribution?${params}`);
  if (!res.ok) throw new Error("Failed to fetch ensemble distribution");
  return res.json();
}

export async function fetchPINNStudyMetrics(): Promise<PINNStudyMetrics> {
  const res = await fetch(`${API_BASE}/pinn/study-metrics`);
  if (!res.ok) throw new Error("Failed to fetch PINN study metrics");
  return res.json();
}

export async function fetchPINNDiagnostics(lead: number, regime: string) {
  const params = new URLSearchParams({
    lead: lead.toString(),
    regime
  });
  const res = await fetch(`${API_BASE}/pinn/diagnostics?${params}`);
  if (!res.ok) throw new Error("Failed to fetch PINN diagnostics");
  return res.json();
}

export async function fetchMapGrid(
  variable: string,
  lead: number,
  regime: string,
  season: string,
  source: string = "samanvay"
): Promise<MapGridResponse> {
  const params = new URLSearchParams({
    variable,
    lead: lead.toString(),
    regime,
    season,
    source
  });
  const res = await fetch(`${API_BASE}/map/grid?${params}`);
  if (!res.ok) throw new Error("Failed to fetch map grid");
  return res.json();
}
