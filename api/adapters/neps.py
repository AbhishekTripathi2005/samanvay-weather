"""NEPS Ensemble Adapter (NCMRWF Ensemble Prediction System, 21 members)"""
from typing import Dict, Any, Optional, List
import numpy as np
import xarray as xr
from .base import ForecastSource
from .simulation import generate_gridded_field, LATS, LONS
from geo.regions import STATES_UTS

class NEPSAdapter(ForecastSource):
    def __init__(self):
        super().__init__(
            source_id="neps",
            name="NEPS",
            source_type="Ensemble",
            color="#3B82F6",
            badge="NCMRWF Ensemble (21 Members)"
        )
        self.member_count = 21

    def fetch(self, variable: str, lead: int, init_time: Optional[str] = None, regime: str = "Neutral", season: str = "JJAS") -> xr.Dataset:
        # Generates ensemble mean field
        return generate_gridded_field(
            variable=variable, lead=lead, regime=regime, season=season,
            model_bias=-0.01, model_noise=0.70, model_type="NWP", seed=202
        )

    def fetch_members(self, variable: str, lead: int, region_code: str, regime: str = "Neutral", season: str = "JJAS") -> List[Dict[str, Any]]:
        state = next((s for s in STATES_UTS if s["code"] == region_code), None)
        lat = state["lat"] if state else 22.0
        lon = state["lon"] if state else 79.0
        base_ds = self.fetch(variable, lead, regime=regime, season=season)
        base_val = float(base_ds[variable].sel(lat=lat, lon=lon, method="nearest").values)

        rng = np.random.default_rng(2024 + lead * 17)
        # Lead time dispersion increases ensemble spread
        spread_scale = 1.0 + (lead / 72.0) * 0.85
        members = []
        for i in range(self.member_count):
            mem_type = "Control (M00)" if i == 0 else f"Perturbed Member M{i:02d}"
            # member 0 is control
            mem_offset = 0.0 if i == 0 else rng.normal(0, spread_scale * (2.4 if variable == "rainfall" else 0.8))
            val = max(0.0, base_val + mem_offset) if variable in ("rainfall", "wind_speed", "wind_gust") else (base_val + mem_offset)
            members.append({
                "member_id": i,
                "label": mem_type,
                "value": round(val, 2),
                "is_control": i == 0
            })
        return members

    def fetch_regional(self, variable: str, lead: int, region_code: str, init_time: Optional[str] = None, regime: str = "Neutral", season: str = "JJAS") -> Dict[str, Any]:
        members = self.fetch_members(variable, lead, region_code, regime, season)
        vals = [m["value"] for m in members]
        mean_val = float(np.mean(vals))
        std_val = float(np.std(vals))
        p10 = float(np.percentile(vals, 10))
        p90 = float(np.percentile(vals, 90))
        return {
            "source": self.source_id,
            "name": self.name,
            "value": round(mean_val, 2),
            "std_dev": round(std_val, 2),
            "ci_lower": round(p10, 2),
            "ci_upper": round(p90, 2),
            "members": members
        }
