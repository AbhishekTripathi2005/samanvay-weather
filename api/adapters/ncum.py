"""NCUM-G Adapter (NCMRWF Global 12km NWP)"""
from typing import Dict, Any, Optional
import numpy as np
import xarray as xr
from .base import ForecastSource
from .simulation import generate_gridded_field, LATS, LONS
from geo.regions import STATES_UTS

class NCUMGAdapter(ForecastSource):
    def __init__(self):
        super().__init__(
            source_id="ncum_g",
            name="NCUM-G",
            source_type="NWP",
            color="#06B6D4",
            badge="NCMRWF Global 12km NWP"
        )
        self.bias = 0.02
        self.noise = 0.85

    def fetch(self, variable: str, lead: int, init_time: Optional[str] = None, regime: str = "Neutral", season: str = "JJAS") -> xr.Dataset:
        return generate_gridded_field(
            variable=variable, lead=lead, regime=regime, season=season,
            model_bias=self.bias, model_noise=self.noise, model_type="NWP", seed=101
        )

    def fetch_regional(self, variable: str, lead: int, region_code: str, init_time: Optional[str] = None, regime: str = "Neutral", season: str = "JJAS") -> Dict[str, Any]:
        ds = self.fetch(variable, lead, init_time, regime, season)
        state = next((s for s in STATES_UTS if s["code"] == region_code), None)
        lat = state["lat"] if state else 22.0
        lon = state["lon"] if state else 79.0
        val = float(ds[variable].sel(lat=lat, lon=lon, method="nearest").values)
        spread = float(0.8 + 0.02 * lead)
        return {"source": self.source_id, "name": self.name, "value": round(val, 2), "std_dev": round(spread, 2), "ci_lower": round(val - 1.96*spread, 2), "ci_upper": round(val + 1.96*spread, 2)}
