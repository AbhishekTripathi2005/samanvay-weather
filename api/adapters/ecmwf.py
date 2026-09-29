"""ECMWF-IFS Adapter (ECMWF Integrated Forecasting System HRES)"""
from typing import Dict, Any, Optional
import numpy as np
import xarray as xr
from .base import ForecastSource
from .simulation import generate_gridded_field
from geo.regions import STATES_UTS

class ECMWFIFSAdapter(ForecastSource):
    def __init__(self):
        super().__init__(
            source_id="ecmwf_ifs",
            name="ECMWF-IFS",
            source_type="NWP",
            color="#6366F1",
            badge="ECMWF IFS Global HRES"
        )
        self.bias = -0.02
        self.noise = 0.65

    def fetch(self, variable: str, lead: int, init_time: Optional[str] = None, regime: str = "Neutral", season: str = "JJAS") -> xr.Dataset:
        return generate_gridded_field(
            variable=variable, lead=lead, regime=regime, season=season,
            model_bias=self.bias, model_noise=self.noise, model_type="NWP", seed=404
        )

    def fetch_regional(self, variable: str, lead: int, region_code: str, init_time: Optional[str] = None, regime: str = "Neutral", season: str = "JJAS") -> Dict[str, Any]:
        ds = self.fetch(variable, lead, init_time, regime, season)
        state = next((s for s in STATES_UTS if s["code"] == region_code), None)
        lat = state["lat"] if state else 22.0
        lon = state["lon"] if state else 79.0
        val = float(ds[variable].sel(lat=lat, lon=lon, method="nearest").values)
        spread = float(0.7 + 0.018 * lead)
        return {"source": self.source_id, "name": self.name, "value": round(val, 2), "std_dev": round(spread, 2), "ci_lower": round(val - 1.96*spread, 2), "ci_upper": round(val + 1.96*spread, 2)}
