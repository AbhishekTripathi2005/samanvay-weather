"""
SAMANVAY Climatological Synthetic Weather Engine.
Produces 3 years (1095 days) of deterministic, daily gridded truth and model forecasts
over the Indian domain (0.5 degree grid, 6-38N, 68-98E, masked to Indian territory)
and regional aggregates across all 36 States/UTs.

Realistic Climatology Encoded:
- Monsoon Rain: Heavy-tailed Gamma distribution, Western Ghats & Central monsoon trough
- Tmax/Tmin: Annual solar declination sinusoidal curve + lapse-rate elevation dependence
- Wind: Weibull distribution with cyclone and monsoonal surges

Model Strengths/Weaknesses Encoded:
- ECMWF-IFS: Best at short lead for temperature, outstanding synoptic skill
- AI models (GraphCast, Pangu, FourCastNet): Strong Day 1-3 rainfall & circulation, but smoothed extreme peaks
- NEPS: Best calibrated probabilistic/extreme guidance, captures heavy tails
- NCUM-G: Specially tuned for Indian Summer Monsoon, dominates Central & Peninsular JJAS rain
- IMD-GFS: Good general baseline, carries positive precipitation bias in the Western Himalayas
- NO MODEL WINS EVERYWHERE.
"""
from typing import Dict, List, Any, Tuple, Optional
import datetime
import numpy as np
from geo.regions import STATES_UTS, IMD_ZONES
from synth.regimes import detect_regime, REGIME_NAMES

# 0.5 deg grid coordinates over India domain
LATS = np.arange(6.0, 38.5, 0.5)   # 65 points: 6.0, 6.5, ..., 38.0
LONS = np.arange(68.0, 98.5, 0.5)  # 61 points: 68.0, 68.5, ..., 98.0
N_LATS = len(LATS)
N_LONS = len(LONS)

# Precompute simplified land mask for Indian domain
def _create_india_mask() -> np.ndarray:
    mask = np.zeros((N_LATS, N_LONS), dtype=bool)
    for i, lat in enumerate(LATS):
        for j, lon in enumerate(LONS):
            # Polygon check for Indian subcontinent approximate boundary
            if 8.0 <= lat <= 36.5 and 68.5 <= lon <= 97.5:
                # Exclude Arabian Sea
                if lat < 22.0 and lon < 72.5:
                    continue
                # Exclude Bay of Bengal
                if lat < 20.0 and 81.5 <= lon <= 92.0:
                    continue
                # Exclude southern ocean
                if lat < 8.0:
                    continue
                mask[i, j] = True
    return mask

INDIA_MASK = _create_india_mask()

# 36 state codes mapping
STATE_MAP = {s["code"]: s for s in STATES_UTS}

# Model identifiers
MODELS = ["ncum_g", "neps", "imd_gfs", "ecmwf_ifs", "graphcast", "pangu", "fourcastnet"]

class SyntheticEngine:
    _instance = None

    def __init__(self, seed: int = 42):
        self.seed = seed
        self.rng = np.random.default_rng(seed)
        self.start_date = datetime.date(2023, 1, 1)
        self.n_days = 1095

    @classmethod
    def get_instance(cls):
        if cls._instance is None:
            cls._instance = cls()
        return cls._instance

    @staticmethod
    def _doy_from_date(dt: Any) -> int:
        if isinstance(dt, str):
            dt = datetime.datetime.strptime(dt[:10], "%Y-%m-%d").date()
        elif isinstance(dt, datetime.datetime):
            dt = dt.date()
        return dt.timetuple().tm_yday

    def get_truth(self, variable: str, region_code: str, date: Any) -> float:
        """
        Returns true observed daily value for a region on a given date.
        """
        doy = self._doy_from_date(date)
        state = STATE_MAP.get(region_code, STATES_UTS[0])
        lat, lon = state["lat"], state["lon"]
        zone = state["zone"]
        terrain = state["terrain"]

        # Deterministic seed per date + region
        rng = np.random.default_rng(self.seed + doy * 37 + hash(region_code) % 9973)

        if variable == "rainfall":
            # Climatology: JJAS heavy rain
            is_monsoon = 152 <= doy <= 273  # June 1 to Sep 30
            is_wd = (doy < 75 or doy > 320) and "Himalayan" in terrain
            is_post_monsoon = 274 <= doy <= 335 and (zone == "South Peninsular India" or "Coast" in terrain)

            if is_monsoon:
                # Heavy orographic in Western Ghats & foothills
                if "Ghats" in terrain or "Konkan" in terrain or "Cherrapunji" in terrain:
                    k, theta = 1.8, 22.0
                elif zone == "Central India":
                    k, theta = 1.4, 14.0
                elif zone == "East & Northeast India":
                    k, theta = 1.6, 16.0
                else:
                    k, theta = 0.9, 8.0
                rain = float(rng.gamma(k, theta))
                # Intermittent dry spells
                if rng.random() < 0.20:
                    rain *= 0.15
            elif is_wd:
                rain = float(rng.gamma(1.2, 10.0)) if rng.random() > 0.55 else 0.0
            elif is_post_monsoon:
                rain = float(rng.gamma(1.3, 14.0)) if rng.random() > 0.40 else 0.0
            else:
                # Pre-monsoon showers or dry
                rain = float(rng.gamma(0.6, 4.0)) if rng.random() > 0.75 else 0.0
            return round(max(0.0, rain), 2)

        elif variable == "tmax":
            # Sinusoidal annual curve peaking in late May (doy ~145)
            # Base amplitude by zone
            mean_temp = 32.0
            amp = 8.5
            phase_peak = 145.0
            annual_cycle = mean_temp + amp * np.cos(2 * np.pi * (doy - phase_peak) / 365.25)
            
            # Elevation lapse rate (-6.5 C per 1000m)
            elevation = 2200.0 if "Himalayan" in terrain else (400.0 if "Plateau" in terrain else 100.0)
            elevation_offset = -(elevation / 1000.0) * 6.5
            
            # Daily synoptic noise
            noise = float(rng.normal(0.0, 1.8))
            val = annual_cycle + elevation_offset + noise
            return round(float(np.clip(val, -5.0, 49.5)), 1)

        elif variable == "tmin":
            tmax = self.get_truth("tmax", region_code, date)
            # Diurnal spread 8 - 14 C
            diurnal = 9.0 + float(rng.uniform(1.0, 5.0))
            if "Desert" in terrain:
                diurnal += 4.0
            elif "Coastal" in terrain:
                diurnal -= 3.0
            return round(float(tmax - diurnal), 1)

        elif variable == "wind_speed":
            is_monsoon = 152 <= doy <= 273
            scale = 22.0 if is_monsoon or "Coast" in terrain else 12.0
            val = float(rng.weibull(1.8) * scale)
            return round(max(1.0, val), 1)

        elif variable == "wind_gust":
            ws = self.get_truth("wind_speed", region_code, date)
            gust = ws * float(rng.uniform(1.4, 1.8))
            return round(gust, 1)

        return 0.0

    def get_forecast(
        self,
        model_id: str,
        variable: str,
        region_code: str,
        date: Any,
        lead_day: int = 1
    ) -> float:
        """
        Returns model forecast = Truth + Bias(model, var, region, season, lead, regime) + Noise(lead)
        Incorporating explicit domain strengths and weaknesses.
        """
        truth = self.get_truth(variable, region_code, date)
        doy = self._doy_from_date(date)
        regime = detect_regime(date=date)
        state = STATE_MAP.get(region_code, STATES_UTS[0])
        terrain = state["terrain"]
        zone = state["zone"]

        rng = np.random.default_rng(
            self.seed + doy * 43 + hash(model_id) % 883 + lead_day * 13 + hash(region_code) % 557
        )

        # Lead time degradation factor (error grows with lead)
        lead_factor = 1.0 + (lead_day - 1) * 0.15

        bias = 0.0
        noise_std = 0.0

        if variable == "rainfall":
            # AI models: strong Day 1-3, underpredict extreme rainfall peaks (>64.5mm)
            if model_id in ["graphcast", "pangu", "fourcastnet"]:
                if truth > 64.5:
                    # Extreme underestimation bias (spectral smoothing)
                    smoothing_factor = 0.72 if model_id == "fourcastnet" else 0.78
                    val = truth * smoothing_factor + rng.normal(0.0, 3.5 * lead_factor)
                else:
                    # Moderate rain: very sharp at short lead
                    bias = -0.5
                    noise_std = 2.0 * lead_factor
                    val = truth + bias + rng.normal(0.0, noise_std)
            elif model_id == "ecmwf_ifs":
                # High synoptic accuracy, moderate noise
                bias = 0.2
                noise_std = 3.2 * lead_factor
                val = truth + bias + rng.normal(0.0, noise_std)
            elif model_id == "ncum_g":
                # Superb in Indian monsoon trough
                if regime == "Active monsoon" and (zone in ["Central India", "South Peninsular India"]):
                    bias = 0.1
                    noise_std = 2.8 * lead_factor
                else:
                    bias = 1.2
                    noise_std = 4.0 * lead_factor
                val = truth + bias + rng.normal(0.0, noise_std)
            elif model_id == "imd_gfs":
                # Positive orographic bias in Himalayas
                if "Himalayan" in terrain:
                    bias = 8.5 * (1.0 + 0.1 * lead_day)  # GFS over-predicts mountain rain
                    noise_std = 6.0 * lead_factor
                else:
                    bias = 1.5
                    noise_std = 4.5 * lead_factor
                val = truth + bias + rng.normal(0.0, noise_std)
            elif model_id == "neps":
                # Ensemble mean: smooth, but excellent tail spread
                bias = 0.3
                noise_std = 3.4 * (1.0 + (lead_day - 1) * 0.08)  # ensemble scales better at long leads
                val = truth + bias + rng.normal(0.0, noise_std)
            else:
                val = truth + rng.normal(0.0, 4.0 * lead_factor)
            return round(max(0.0, val), 2)

        elif variable == "tmax":
            # ECMWF-IFS has world-class Day 1-2 temperature physics (virtually zero bias)
            # Other models have substantial regional biases (+1 to +2 C)
            if model_id == "ecmwf_ifs":
                bias = 0.02
                noise_std = 0.38 * lead_factor  # Outstanding Day 1 temperature skill!
            elif model_id == "pangu":
                bias = 1.10
                noise_std = 1.10 * lead_factor
            elif model_id == "graphcast":
                bias = -1.20
                noise_std = 1.25 * lead_factor
            elif model_id == "fourcastnet":
                bias = 1.65
                noise_std = 1.45 * lead_factor
            elif model_id == "ncum_g":
                bias = 1.35
                noise_std = 1.30 * lead_factor
            elif model_id == "imd_gfs":
                bias = 1.85
                noise_std = 1.60 * lead_factor
            elif model_id == "neps":
                bias = 1.15
                noise_std = 1.35 * lead_factor
            else:
                bias = 1.00
                noise_std = 1.50 * lead_factor

            val = truth + bias + rng.normal(0.0, noise_std)
            return round(float(val), 1)

        elif variable == "tmin":
            if model_id == "ecmwf_ifs":
                noise_std = 0.70 * lead_factor
            else:
                noise_std = 1.25 * lead_factor
            val = truth + rng.normal(0.0, noise_std)
            return round(float(val), 1)

        elif variable in ["wind_speed", "wind_gust"]:
            if model_id == "neps":
                # Ensemble excels at peak wind capture
                bias = 0.2
                noise_std = 2.0 * lead_factor
            elif model_id in ["graphcast", "pangu", "fourcastnet"]:
                bias = -2.0  # AI slightly under-predicts gust peaks
                noise_std = 3.2 * lead_factor
            else:
                bias = 0.5
                noise_std = 3.0 * lead_factor
            val = truth + bias + rng.normal(0.0, noise_std)
            return round(max(0.5, float(val)), 1)

        return round(truth, 2)

    def generate_benchmark_dataset(
        self,
        variable: str = "rainfall",
        lead_day: int = 3,
        n_days: int = 1095
    ) -> Dict[str, Any]:
        """
        Produces 3-year evaluation arrays for all models and truth
        across national and regional slices.
        """
        obs_list = []
        model_preds: Dict[str, List[float]] = {m: [] for m in MODELS}

        # Sample across states and days for representative national verification
        selected_states = ["DL", "MH", "KL", "HP", "UP", "OD", "AS", "RJ"]
        
        start_dt = self.start_date
        for day_idx in range(n_days):
            dt = start_dt + datetime.timedelta(days=day_idx)
            # Cycle through states to form national pooled sample
            st_code = selected_states[day_idx % len(selected_states)]
            o = self.get_truth(variable, st_code, dt)
            obs_list.append(o)
            for m in MODELS:
                p = self.get_forecast(m, variable, st_code, dt, lead_day=lead_day)
                model_preds[m].append(p)

        return {
            "obs": np.array(obs_list),
            "models": {m: np.array(model_preds[m]) for m in MODELS},
            "n_samples": len(obs_list),
            "lead_day": lead_day,
            "variable": variable
        }

    def get_gridded_field(
        self,
        variable: str,
        lead_hours: int = 72,
        model_id: str = "samanvay",
        date: Optional[str] = None
    ) -> Dict[str, Any]:
        """
        Generates 2D 0.5-deg gridded field over India domain.
        """
        lead_day = max(1, lead_hours // 24)
        regime = detect_regime(date=date)
        doy = self._doy_from_date(date) if date else 200

        rng = np.random.default_rng(self.seed + doy * 19 + lead_hours * 7 + hash(model_id) % 991)

        grid = np.zeros((N_LATS, N_LONS), dtype=float)

        if variable == "rainfall":
            # Synoptic precipitation pattern based on regime
            for i, lat in enumerate(LATS):
                for j, lon in enumerate(LONS):
                    if not INDIA_MASK[i, j]:
                        grid[i, j] = 0.0
                        continue

                    # Base climatological rain field
                    base = 0.0
                    # Western ghats ridge (lat 8..20, lon 73..76)
                    if 8.0 <= lat <= 19.5 and 73.0 <= lon <= 76.5:
                        base += 45.0 * np.exp(-((lon - 74.0) ** 2) / 1.5)
                    # Central monsoon trough (lat 20..26, lon 77..88)
                    if 20.0 <= lat <= 26.5 and 76.0 <= lon <= 88.0:
                        base += 32.0 * np.exp(-((lat - 23.0) ** 2) / 6.0)
                    # Northeast (lat 24..28, lon 89..95)
                    if 23.5 <= lat <= 28.5 and 89.0 <= lon <= 95.0:
                        base += 38.0 * np.exp(-((lon - 92.0) ** 2) / 8.0)

                    # Regime modulation
                    if regime == "Active monsoon":
                        base *= 1.45
                    elif regime == "Break monsoon":
                        if lat > 26.0:  # Foothills get heavy rain during break
                            base *= 1.8
                        else:
                            base *= 0.25
                    elif regime == "Western Disturbance":
                        if lat >= 30.0 and lon <= 80.0:  # NW Himalayas
                            base = 42.0 + rng.uniform(5, 25)
                        else:
                            base = 1.0

                    # Model specific characteristics
                    if model_id in ["graphcast", "pangu", "fourcastnet"]:
                        # AI models smooth extremes
                        cell_val = base * 0.82 + rng.normal(0, 3.0)
                    elif model_id == "samanvay":
                        # Blended consensus: optimal balance, realistic sharpness
                        cell_val = base + rng.normal(0, 2.5)
                    else:
                        cell_val = base + rng.normal(0, 4.5)

                    grid[i, j] = round(max(0.0, cell_val), 1)

        elif variable == "tmax":
            for i, lat in enumerate(LATS):
                for j, lon in enumerate(LONS):
                    if not INDIA_MASK[i, j]:
                        grid[i, j] = 25.0
                        continue
                    # Temperature decreases with latitude & elevation
                    lat_gradient = 38.0 - (lat - 10.0) * 0.45
                    # Himalayan cooling in north
                    if lat >= 30.0:
                        lat_gradient -= (lat - 29.0) * 2.8
                    # Thar desert heating in NW
                    if 24.0 <= lat <= 29.0 and 70.0 <= lon <= 76.0:
                        lat_gradient += 5.5

                    if regime == "Heatwave ridge":
                        lat_gradient += 4.5

                    grid[i, j] = round(float(lat_gradient + rng.normal(0, 0.8)), 1)

        else:
            # Default wind or tmin
            base_val = 18.0 if variable == "wind_speed" else 22.0
            for i in range(N_LATS):
                for j in range(N_LONS):
                    if INDIA_MASK[i, j]:
                        grid[i, j] = round(float(base_val + rng.normal(0, 3.0)), 1)

        return {
            "variable": variable,
            "lead_hours": lead_hours,
            "model": model_id,
            "regime": regime,
            "bounds": {
                "min_lat": round(float(np.min(LATS)), 2),
                "max_lat": round(float(np.max(LATS)), 2),
                "min_lon": round(float(np.min(LONS)), 2),
                "max_lon": round(float(np.max(LONS)), 2)
            },
            "lats": [round(float(x), 2) for x in LATS],
            "lons": [round(float(x), 2) for x in LONS],
            "values": grid.tolist(),
            "min_value": float(np.min(grid[INDIA_MASK])),
            "max_value": float(np.max(grid[INDIA_MASK])),
            "mean_value": round(float(np.mean(grid[INDIA_MASK])), 2)
        }
