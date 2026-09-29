"""
Abstract Base Class for Forecast Sources.
Every data source sits behind this adapter interface:
fetch(variable, lead, init_time) -> xarray.Dataset / ndarray
so real GRIB/NetCDF files can replace synthetic simulations seamlessly.
"""
from abc import ABC, abstractmethod
from typing import Dict, Any, Optional
import numpy as np
import xarray as xr

class ForecastSource(ABC):
    def __init__(self, source_id: str, name: str, source_type: str, color: str, badge: str):
        self.source_id = source_id
        self.name = name
        self.source_type = source_type  # "NWP", "Ensemble", "AI", "Blended"
        self.color = color
        self.badge = badge

    @abstractmethod
    def fetch(
        self,
        variable: str,
        lead: int,
        init_time: Optional[str] = None,
        regime: str = "Neutral",
        season: str = "JJAS"
    ) -> xr.Dataset:
        """
        Fetch gridded spatial forecast field across India bounding box:
        Lat: 6.0°N to 38.0°N, Lon: 68.0°E to 98.0°E.
        Returns an xarray.Dataset with dimensions (lat, lon) and variable values.
        """
        pass

    @abstractmethod
    def fetch_regional(
        self,
        variable: str,
        lead: int,
        region_code: str,
        init_time: Optional[str] = None,
        regime: str = "Neutral",
        season: str = "JJAS"
    ) -> Dict[str, Any]:
        """
        Fetch aggregated forecast value and confidence interval for a specific state or zone.
        """
        pass
