"""
Physics-Consistent Field Generator for Indian Subcontinent.
Simulates realistic orographic uplift over Western Ghats & Himalayas,
monsoon troughs, heatwave ridges, and cyclone circulations.
"""
import numpy as np
import xarray as xr
from typing import Dict, Tuple

# Standard India meteorological grid: 0.5 degree resolution (65 x 61 cells)
LATS = np.linspace(6.0, 38.0, 65)  # 6.0 to 38.0 N
LONS = np.linspace(68.0, 98.0, 61) # 68.0 to 98.0 E
LON_GRID, LAT_GRID = np.meshgrid(LONS, LATS)

# Orography elevation mask (km)
# Western Ghats: 8 to 21N, 73 to 77E
# Himalayas: 27 to 36N, 73 to 96E
ELEVATION_KM = np.zeros_like(LAT_GRID)
# Western Ghats
ghats_mask = (LAT_GRID >= 8.5) & (LAT_GRID <= 20.5) & (LON_GRID >= 73.0) & (LON_GRID <= 76.5)
ELEVATION_KM[ghats_mask] = 1.2 * np.exp(-((LON_GRID[ghats_mask] - 74.5)**2) / 1.5)
# Himalayas
himalaya_mask = (LAT_GRID >= 27.0) & (LAT_GRID <= 36.0) & (LON_GRID >= 74.0) & (LON_GRID <= 96.0)
ELEVATION_KM[himalaya_mask] = 4.0 * np.sin(np.pi * (LAT_GRID[himalaya_mask] - 27.0) / 9.0)

def generate_gridded_field(
    variable: str,
    lead: int,
    regime: str,
    season: str,
    model_bias: float,
    model_noise: float,
    model_type: str,
    seed: int = 42
) -> xr.Dataset:
    rng = np.random.default_rng(seed + lead * 101)
    
    # Base field by variable and season
    if variable == "rainfall":
        # Base monsoonal rain
        if season == "JJAS":
            base = 12.0 * np.exp(-((LAT_GRID - 21.0)**2) / 45.0) * np.exp(-((LON_GRID - 82.0)**2) / 80.0)
            # Orographic Ghats rain
            base += 38.0 * np.exp(-((LON_GRID - 74.0)**2) / 1.2) * (LAT_GRID >= 10) * (LAT_GRID <= 19)
            # Northeast rain
            base += 25.0 * np.exp(-((LAT_GRID - 25.5)**2) / 10.0) * np.exp(-((LON_GRID - 92.5)**2) / 15.0)
        elif season == "OND":
            # Post-monsoon Northeast rain over Tamil Nadu & Bay of Bengal
            base = 22.0 * np.exp(-((LAT_GRID - 12.5)**2) / 25.0) * np.exp(-((LON_GRID - 81.0)**2) / 35.0)
        elif season == "DJF":
            # WD light snow/rain in north
            base = 6.0 * np.exp(-((LAT_GRID - 32.5)**2) / 20.0) * (LON_GRID <= 80.0)
        else: # MAM
            base = 4.0 * np.exp(-((LAT_GRID - 24.0)**2) / 60.0)

        # Regime modulation
        if regime == "Active monsoon":
            base *= 1.85
            base += 45.0 * np.exp(-((LAT_GRID - 20.0)**2) / 18.0) * np.exp(-((LON_GRID - 79.0)**2) / 40.0)
        elif regime == "Break monsoon":
            base *= 0.35
            base += 35.0 * np.exp(-((LAT_GRID - 29.5)**2) / 8.0) # Shift to foothills
        elif regime == "Cyclone/Depression":
            # Concentrated torrential core
            base += 120.0 * np.exp(-(((LAT_GRID - 18.0)**2 + (LON_GRID - 86.0)**2) / 8.0))
        elif regime == "Western Disturbance":
            base += 28.0 * np.exp(-(((LAT_GRID - 33.0)**2 + (LON_GRID - 75.0)**2) / 15.0))
        elif regime == "Heatwave ridge":
            base *= 0.1

        # Lead time degradation: AI models smooth out rain at long leads, NWP increases dispersion
        if model_type == "AI":
            smoothing_factor = max(0.5, 1.0 - (lead / 320.0))
            base *= smoothing_factor
        else:
            base *= (1.0 + 0.05 * np.sin(lead / 24.0))

        # Add model bias and noise
        val = np.maximum(0.0, base * (1.0 + model_bias) + rng.normal(0, model_noise * 3.5, base.shape))
        val = np.round(val, 2)

    elif variable in ("tmax", "tmin"):
        is_max = variable == "tmax"
        # Base temperature
        if season == "MAM":
            temp_base = 42.0 if is_max else 26.0
        elif season == "JJAS":
            temp_base = 33.0 if is_max else 24.0
        elif season == "DJF":
            temp_base = 22.0 if is_max else 9.0
        else:
            temp_base = 31.0 if is_max else 19.0

        # Lapse rate cooling with elevation: 6.5 C per km
        temp = temp_base - (LAT_GRID - 12.0) * 0.45 - ELEVATION_KM * 6.5
        
        # Thar desert heating in NW
        temp += 5.5 * np.exp(-(((LAT_GRID - 27.0)**2 + (LON_GRID - 72.0)**2) / 30.0))

        # Regime adjustment
        if regime == "Heatwave ridge":
            temp += 5.8 * np.exp(-(((LAT_GRID - 26.0)**2 + (LON_GRID - 78.0)**2) / 50.0))
        elif regime == "Active monsoon":
            temp -= 3.5 # Evaporative cooling
        elif regime == "Western Disturbance":
            temp -= 4.2 * (LAT_GRID >= 28.0)

        temp += model_bias * 1.5 + rng.normal(0, model_noise * 0.6, temp.shape)
        val = np.round(temp, 1)

    elif variable in ("wind_speed", "wind_gust"):
        is_gust = variable == "wind_gust"
        mult = 1.8 if is_gust else 1.0
        
        # Base coastal and marine winds
        w_base = 15.0 * mult
        # Monsoon westerly jet over peninsular India
        if season == "JJAS":
            w_base += 18.0 * mult * np.exp(-((LAT_GRID - 14.0)**2) / 25.0)

        if regime == "Cyclone/Depression":
            # Cyclone core gale
            w_base += 85.0 * mult * np.exp(-(((LAT_GRID - 18.0)**2 + (LON_GRID - 86.0)**2) / 12.0))
        elif regime == "Active monsoon":
            w_base *= 1.4
        elif regime == "Western Disturbance":
            w_base += 20.0 * mult * (LAT_GRID >= 30.0)

        w = np.maximum(2.0, w_base * (1.0 + model_bias) + rng.normal(0, model_noise * 2.0, w_base.shape))
        val = np.round(w, 1)

    ds = xr.Dataset(
        data_vars={
            variable: (["lat", "lon"], val)
        },
        coords={
            "lat": LATS,
            "lon": LONS
        },
        attrs={
            "lead_hours": lead,
            "regime": regime,
            "season": season,
            "variable": variable,
            "model_type": model_type
        }
    )
    return ds
