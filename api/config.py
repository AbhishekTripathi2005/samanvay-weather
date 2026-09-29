"""
SAMANVAY Configuration and Meteorological Constants
Operational AI-NWP Blending Command Center (MoES / NCMRWF, PS 26081)
"""
from typing import Dict, List, Any

SOURCES: Dict[str, Dict[str, Any]] = {
    "ncum_g": {
        "id": "ncum_g",
        "name": "NCUM-G",
        "full_name": "NCMRWF Unified Model Global (12km)",
        "type": "NWP",
        "color": "#06B6D4",
        "badge": "NCMRWF Global 12km NWP",
        "organization": "NCMRWF / MoES",
        "resolution": "0.12 deg (~12 km)",
        "physics_type": "Primitive Equation NWP"
    },
    "neps": {
        "id": "neps",
        "name": "NEPS",
        "full_name": "NCMRWF Ensemble Prediction System (21-Member)",
        "type": "Ensemble",
        "color": "#3B82F6",
        "badge": "NCMRWF Ensemble (21 Members)",
        "organization": "NCMRWF / MoES",
        "resolution": "0.25 deg (~28 km)",
        "members": 21,
        "physics_type": "Perturbed Physics Ensemble"
    },
    "imd_gfs": {
        "id": "imd_gfs",
        "name": "IMD-GFS",
        "full_name": "IMD Global Forecast System (12km)",
        "type": "NWP",
        "color": "#10B981",
        "badge": "IMD Operational GFS",
        "organization": "IMD / MoES",
        "resolution": "0.12 deg (~12 km)",
        "physics_type": "Spectral NWP (T1534)"
    },
    "ecmwf_ifs": {
        "id": "ecmwf_ifs",
        "name": "ECMWF-IFS",
        "full_name": "ECMWF Integrated Forecasting System HRES",
        "type": "NWP",
        "color": "#6366F1",
        "badge": "ECMWF IFS Global HRES",
        "organization": "ECMWF",
        "resolution": "0.1 deg (~9 km)",
        "physics_type": "Semi-Lagrangian NWP"
    },
    "graphcast": {
        "id": "graphcast",
        "name": "GraphCast",
        "full_name": "DeepMind GraphCast-style AI GNN",
        "type": "AI",
        "color": "#8B5CF6",
        "badge": "GraphCast-style GNN AI",
        "organization": "DeepMind / Open Surrogate",
        "resolution": "0.25 deg (~28 km)",
        "physics_type": "Graph Neural Network"
    },
    "pangu": {
        "id": "pangu",
        "name": "Pangu-Weather",
        "full_name": "Pangu-style 3D Earth Transformer",
        "type": "AI",
        "color": "#D946EF",
        "badge": "Pangu-style 3D Transformer",
        "organization": "Huawei / Open Surrogate",
        "resolution": "0.25 deg (~28 km)",
        "physics_type": "3D Earth-Specific Vision Transformer"
    },
    "fourcastnet": {
        "id": "fourcastnet",
        "name": "FourCastNet",
        "full_name": "FourCastNet-style Adaptive Fourier Neural Operator",
        "type": "AI",
        "color": "#EC4899",
        "badge": "FourCastNet AFNO AI",
        "organization": "NVIDIA / Open Surrogate",
        "resolution": "0.25 deg (~28 km)",
        "physics_type": "Adaptive Fourier Neural Operator"
    },
    "samanvay": {
        "id": "samanvay",
        "name": "SAMANVAY Consensus",
        "full_name": "SAMANVAY Adaptive AI-NWP Blended Consensus",
        "type": "Blended",
        "color": "#00F5FF",
        "badge": "SAMANVAY Adaptive Consensus",
        "organization": "MoES / NCMRWF",
        "resolution": "0.12 deg (~12 km blended)",
        "physics_type": "Regime-Conditioned PINN Blended"
    }
}

VARIABLES: Dict[str, Dict[str, Any]] = {
    "rainfall": {
        "id": "rainfall",
        "name": "24h Accumulated Rainfall",
        "short_name": "Rainfall",
        "unit": "mm/24h",
        "min": 0.0,
        "max": 350.0,
        "step": 0.5,
        "color_scale": "viridis",
        "icon": "CloudRain"
    },
    "tmax": {
        "id": "tmax",
        "name": "Maximum 2m Temperature",
        "short_name": "Tmax",
        "unit": "°C",
        "min": 10.0,
        "max": 52.0,
        "step": 0.1,
        "color_scale": "plasma",
        "icon": "Sun"
    },
    "tmin": {
        "id": "tmin",
        "name": "Minimum 2m Temperature",
        "short_name": "Tmin",
        "unit": "°C",
        "min": -15.0,
        "max": 35.0,
        "step": 0.1,
        "color_scale": "cividis",
        "icon": "Moon"
    },
    "wind_speed": {
        "id": "wind_speed",
        "name": "10m Wind Speed",
        "short_name": "10m Wind",
        "unit": "km/h",
        "min": 0.0,
        "max": 140.0,
        "step": 1.0,
        "color_scale": "mako",
        "icon": "Wind"
    },
    "wind_gust": {
        "id": "wind_gust",
        "name": "10m Peak Wind Gust",
        "short_name": "10m Gust",
        "unit": "km/h",
        "min": 0.0,
        "max": 220.0,
        "step": 1.0,
        "color_scale": "rocket",
        "icon": "Zap"
    }
}

LEAD_HOURS: List[int] = [24, 48, 72, 96, 120, 144, 168, 192, 216, 240]

REGIMES: Dict[str, Dict[str, Any]] = {
    "Active monsoon": {
        "id": "Active monsoon",
        "description": "Intense monsoonal trough with heavy orographic and deep convective precipitation across Central & West Coast India.",
        "primary_season": "JJAS",
        "dominant_source": "ncum_g"
    },
    "Break monsoon": {
        "id": "Break monsoon",
        "description": "Shift of monsoonal trough to Himalayan foothills; subdued central rainfall with enhanced foothills & northeast precipitation.",
        "primary_season": "JJAS",
        "dominant_source": "ecmwf_ifs"
    },
    "Western Disturbance": {
        "id": "Western Disturbance",
        "description": "Mid-latitude upper-tropospheric westerly trough causing snowfall in Western Himalayas and rain in Northwest plains.",
        "primary_season": "DJF",
        "dominant_source": "graphcast"
    },
    "Cyclone/Depression": {
        "id": "Cyclone/Depression",
        "description": "Intense tropical cyclone or low-pressure depression over Bay of Bengal / Arabian Sea with severe gale gusts and torrential deluge.",
        "primary_season": "OND",
        "dominant_source": "neps"
    },
    "Heatwave ridge": {
        "id": "Heatwave ridge",
        "description": "Persistent subtropical high-pressure anticyclone with sinking air and dry advective westerly heating over Northern/Central India.",
        "primary_season": "MAM",
        "dominant_source": "pangu"
    },
    "Neutral": {
        "id": "Neutral",
        "description": "Climatologically typical synoptic flow without dominant mesoscale or synoptic forcing.",
        "primary_season": "All",
        "dominant_source": "graphcast"
    }
}

SEASONS: Dict[str, str] = {
    "DJF": "Winter (Dec - Feb)",
    "MAM": "Pre-Monsoon / Summer (Mar - May)",
    "JJAS": "Southwest Monsoon (Jun - Sep)",
    "OND": "Post-Monsoon / NE Monsoon (Oct - Dec)"
}

IMD_THRESHOLDS = {
    "rainfall": {
        "light": (2.5, 15.5),
        "moderate": (15.6, 64.4),
        "heavy": (64.5, 115.5),
        "very_heavy": (115.6, 204.4),
        "extremely_heavy": 204.5
    },
    "heatwave": {
        "plains_min_temp": 40.0,
        "coastal_min_temp": 37.0,
        "hills_min_temp": 30.0,
        "departure_heatwave": 4.5,
        "departure_severe": 6.4,
        "absolute_heatwave": 45.0,
        "absolute_severe": 47.0
    },
    "wind_gust": {
        "yellow": 50.0,
        "orange": 75.0,
        "red": 100.0
    }
}
