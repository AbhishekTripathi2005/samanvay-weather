"""IMD-GFS Adapter (IMD Operational Global Forecast System)"""
from typing import Dict, Any, Optional
import numpy as np
import xarray as xr
from .base import ForecastSource
from .simulation import generate_gridded_field
from geo.regions import STATES_UTS

class IMDGFSAdapter(ForecastSource):
    def __init__(self):
        super().__init__(
            source_id="imd_gfs",
            name="IMD-GFS",
            source_type="NWP",
            color="#10B981",
            badge="IMD Operational GFS"
        )
        self.bias = 0.04
        self.noise = 0.90

    def fetch(self, variable: str, lead: int, init_time: Optional[str] = None, regime: str = "Neutral", season: str = "JJAS") -> xr.Dataset:
        return generate_gridded_field(
            variable=variable, lead=lead, regime=regime, season=season,
            model_bias=self.bias, model_noise=self.noise, model_type="NWP", seed=303
        )

    def fetch_regional(self, variable: str, lead: int, region_code: str, init_time: Optional[str] = None, regime: str = "Neutral", season: str = "JJAS") -> Dict[str, Any]:
        ds = self.fetch(variable, lead, init_time, regime, season)
        state = next((s for s in STATES_UTS if s["code"] == region_code), None)
        lat = state["lat"] if state else 22.0
        lon = state["lon"] if state else 79.0
        val = float(ds[variable].sel(lat=lat, lon=lon, method="nearest").values)
        spread = float(0.9 + 0.025 * lead)
        return {"source": self.source_id, "name": self.name, "value": round(val, 2), "std_dev": round(spread, 2), "ci_lower": round(val - 1.96*spread, 2), "ci_upper": round(val + 1.96*spread, 2)}
