import { SourceMeta, VariableMeta, RegimeMeta } from "./types";

export const SOURCES_LIST: SourceMeta[] = [
  {
    id: "ncum_g",
    name: "NCUM-G",
    full_name: "NCMRWF Unified Model Global (12km)",
    type: "NWP",
    color: "#06B6D4",
    badge: "NCMRWF Global 12km NWP",
    organization: "NCMRWF / MoES",
    resolution: "0.12° (~12 km)",
    physics_type: "Primitive Equation NWP"
  },
  {
    id: "neps",
    name: "NEPS",
    full_name: "NCMRWF Ensemble Prediction System (21-Member)",
    type: "Ensemble",
    color: "#3B82F6",
    badge: "NCMRWF Ensemble (21 Members)",
    organization: "NCMRWF / MoES",
    resolution: "0.25° (~28 km)",
    members: 21,
    physics_type: "Perturbed Physics Ensemble"
  },
  {
    id: "imd_gfs",
    name: "IMD-GFS",
    full_name: "IMD Global Forecast System (12km)",
    type: "NWP",
    color: "#10B981",
    badge: "IMD Operational GFS",
    organization: "IMD / MoES",
    resolution: "0.12° (~12 km)",
    physics_type: "Spectral NWP (T1534)"
  },
  {
    id: "ecmwf_ifs",
    name: "ECMWF-IFS",
    full_name: "ECMWF Integrated Forecasting System HRES",
    type: "NWP",
    color: "#6366F1",
    badge: "ECMWF IFS Global HRES",
    organization: "ECMWF",
    resolution: "0.1° (~9 km)",
    physics_type: "Semi-Lagrangian NWP"
  },
  {
    id: "graphcast",
    name: "GraphCast",
    full_name: "DeepMind GraphCast-style AI GNN",
    type: "AI",
    color: "#8B5CF6",
    badge: "GraphCast-style GNN AI",
    organization: "DeepMind / Open Surrogate",
    resolution: "0.25° (~28 km)",
    physics_type: "Graph Neural Network"
  },
  {
    id: "pangu",
    name: "Pangu-Weather",
    full_name: "Pangu-style 3D Earth Transformer",
    type: "AI",
    color: "#D946EF",
    badge: "Pangu-style 3D Transformer",
    organization: "Huawei / Open Surrogate",
    resolution: "0.25° (~28 km)",
    physics_type: "3D Earth-Specific Vision Transformer"
  },
  {
    id: "fourcastnet",
    name: "FourCastNet",
    full_name: "FourCastNet-style Adaptive Fourier Neural Operator",
    type: "AI",
    color: "#EC4899",
    badge: "FourCastNet AFNO AI",
    organization: "NVIDIA / Open Surrogate",
    resolution: "0.25° (~28 km)",
    physics_type: "Adaptive Fourier Neural Operator"
  }
];

export const SAMANVAY_SOURCE: SourceMeta = {
  id: "samanvay",
  name: "SAMANVAY",
  full_name: "SAMANVAY Adaptive AI-NWP Blended Consensus",
  type: "Blended",
  color: "#00F5FF",
  badge: "SAMANVAY Adaptive Consensus",
  organization: "MoES / NCMRWF",
  resolution: "0.12° (~12 km blended)",
  physics_type: "Regime-Conditioned PINN Blended"
};

export const VARIABLES_LIST: VariableMeta[] = [
  {
    id: "rainfall",
    name: "24h Accumulated Rainfall",
    short_name: "Rainfall",
    unit: "mm/24h",
    min: 0,
    max: 350,
    step: 0.5,
    color_scale: "viridis",
    icon: "CloudRain"
  },
  {
    id: "tmax",
    name: "Maximum Temperature (Tmax)",
    short_name: "Tmax",
    unit: "°C",
    min: 10,
    max: 52,
    step: 0.1,
    color_scale: "plasma",
    icon: "Sun"
  },
  {
    id: "tmin",
    name: "Minimum Temperature (Tmin)",
    short_name: "Tmin",
    unit: "°C",
    min: -15,
    max: 35,
    step: 0.1,
    color_scale: "cividis",
    icon: "Moon"
  },
  {
    id: "wind_speed",
    name: "10m Wind Speed",
    short_name: "10m Wind",
    unit: "km/h",
    min: 0,
    max: 140,
    step: 1,
    color_scale: "mako",
    icon: "Wind"
  },
  {
    id: "wind_gust",
    name: "10m Peak Wind Gust",
    short_name: "10m Gust",
    unit: "km/h",
    min: 0,
    max: 220,
    step: 1,
    color_scale: "rocket",
    icon: "Zap"
  }
];

export const LEAD_HOURS = [24, 48, 72, 96, 120, 144, 168, 192, 216, 240];

export const REGIMES_LIST = [
  "Active monsoon",
  "Break monsoon",
  "Western Disturbance",
  "Cyclone/Depression",
  "Heatwave ridge",
  "Neutral"
];

export const SEASONS_LIST = [
  { id: "JJAS", name: "Southwest Monsoon (JJAS)" },
  { id: "OND", name: "Post-Monsoon (OND)" },
  { id: "DJF", name: "Winter (DJF)" },
  { id: "MAM", name: "Pre-Monsoon / Summer (MAM)" }
];

export const IMD_THRESHOLDS_UI = {
  rainfall: [
    { label: "Heavy Rain (Yellow)", min: 64.5, color: "#EAB308", icon: "AlertTriangle" },
    { label: "Very Heavy (Orange)", min: 115.6, color: "#F59E0B", icon: "AlertCircle" },
    { label: "Extremely Heavy (Red)", min: 204.5, color: "#EF4444", icon: "AlertOctagon" }
  ],
  heatwave: [
    { label: "Heatwave Watch (Yellow)", minDeparture: 3.5, color: "#EAB308" },
    { label: "Heatwave Alert (Orange)", minDeparture: 4.5, minTemp: 40.0, color: "#F59E0B" },
    { label: "Severe Heatwave (Red)", minDeparture: 6.4, minTemp: 45.0, color: "#EF4444" }
  ],
  wind_gust: [
    { label: "Squally (Yellow)", min: 50.0, color: "#EAB308" },
    { label: "Gale (Orange)", min: 75.0, color: "#F59E0B" },
    { label: "Violent Storm (Red)", min: 100.0, color: "#EF4444" }
  ]
};

export const MODELS = SOURCES_LIST;

export const STATES_UTS: Array<{ code: string; name: string; zone: string }> = [
  { code: "AN", name: "Andaman & Nicobar Islands", zone: "Southern Peninsular" },
  { code: "AP", name: "Andhra Pradesh", zone: "Southern Peninsular" },
  { code: "AR", name: "Arunachal Pradesh", zone: "Northeast India" },
  { code: "AS", name: "Assam", zone: "Northeast India" },
  { code: "BR", name: "Bihar", zone: "East & Central India" },
  { code: "CH", name: "Chandigarh", zone: "Northwest India" },
  { code: "CG", name: "Chhattisgarh", zone: "East & Central India" },
  { code: "DD", name: "Dadra & Nagar Haveli and Daman & Diu", zone: "West Coast & Gujarat" },
  { code: "DL", name: "Delhi (NCT)", zone: "Northwest India" },
  { code: "GA", name: "Goa", zone: "West Coast & Gujarat" },
  { code: "GJ", name: "Gujarat", zone: "West Coast & Gujarat" },
  { code: "HR", name: "Haryana", zone: "Northwest India" },
  { code: "HP", name: "Himachal Pradesh", zone: "Western Himalayas" },
  { code: "JK", name: "Jammu & Kashmir", zone: "Western Himalayas" },
  { code: "JH", name: "Jharkhand", zone: "East & Central India" },
  { code: "KA", name: "Karnataka", zone: "Southern Peninsular" },
  { code: "KL", name: "Kerala", zone: "Southern Peninsular" },
  { code: "LA", name: "Ladakh", zone: "Western Himalayas" },
  { code: "LD", name: "Lakshadweep", zone: "Southern Peninsular" },
  { code: "MP", name: "Madhya Pradesh", zone: "East & Central India" },
  { code: "MH", name: "Maharashtra", zone: "West Coast & Gujarat" },
  { code: "MN", name: "Manipur", zone: "Northeast India" },
  { code: "ML", name: "Meghalaya", zone: "Northeast India" },
  { code: "MZ", name: "Mizoram", zone: "Northeast India" },
  { code: "NL", name: "Nagaland", zone: "Northeast India" },
  { code: "OD", name: "Odisha", zone: "East & Central India" },
  { code: "PY", name: "Puducherry", zone: "Southern Peninsular" },
  { code: "PB", name: "Punjab", zone: "Northwest India" },
  { code: "RJ", name: "Rajasthan", zone: "Northwest India" },
  { code: "SK", name: "Sikkim", zone: "Northeast India" },
  { code: "TN", name: "Tamil Nadu", zone: "Southern Peninsular" },
  { code: "TG", name: "Telangana", zone: "Southern Peninsular" },
  { code: "TR", name: "Tripura", zone: "Northeast India" },
  { code: "UP", name: "Uttar Pradesh", zone: "East & Central India" },
  { code: "UT", name: "Uttarakhand", zone: "Western Himalayas" },
  { code: "WB", name: "West Bengal", zone: "East & Central India" }
];
