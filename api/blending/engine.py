"""
SAMANVAY Blending Bridge.
Re-exports and extends the unified blending math suite from api/blend/engine.py
and provides legacy adapter-based regional/grid blending methods.
"""
from typing import Dict, List, Any, Optional
import numpy as np
import xarray as xr

from config import SOURCES, LEAD_HOURS, REGIMES
from adapters import ADAPTERS
from blend.engine import (
    bias_correct_quantile,
    bias_correct_linear,
    skill_table,
    exp_decay_weights,
    inverse_skill_weights,
    nnls_stack,
    smooth_weights,
    equal_weights,
    blend as core_blend,
    exceedance_prob,
    alert_level,
    verify,
    BlendingEngine as CoreBlendingEngine,
    REGIME_AFFINITY,
    MODELS_LIST
)

class BlendingEngine(CoreBlendingEngine):
    @classmethod
    def blend_regional(
        cls,
        variable: str,
        lead: int,
        region_code: str,
        regime: str = "Active monsoon",
        season: str = "JJAS"
    ) -> Dict[str, Any]:
        """
        Blends all 7 sources for a given region using adaptive weights.
        Returns consensus mean, standard deviation, and percentiles.
        """
        weights = cls.compute_weights(lead, regime, variable)
        model_predictions = {}
        
        weighted_sum = 0.0
        variances = []
        for model_id, adapter in ADAPTERS.items():
            pred = adapter.fetch_regional(variable, lead, region_code, regime=regime, season=season)
            model_predictions[model_id] = pred
            w = weights[model_id]
            weighted_sum += w * pred["value"]
            variances.append(w * (pred["std_dev"] ** 2))

        between_model_var = sum(
            weights[m] * ((model_predictions[m]["value"] - weighted_sum) ** 2)
            for m in ADAPTERS
        )
        total_std = float(np.sqrt(sum(variances) + between_model_var))
        
        p10 = float(weighted_sum - 1.282 * total_std)
        p90 = float(weighted_sum + 1.282 * total_std)
        if variable in ("rainfall", "wind_speed", "wind_gust"):
            p10 = max(0.0, p10)
            p90 = max(0.0, p90)
            weighted_sum = max(0.0, weighted_sum)

        return {
            "lead": lead,
            "variable": variable,
            "region_code": region_code,
            "regime": regime,
            "season": season,
            "weights": weights,
            "consensus": {
                "value": round(weighted_sum, 2),
                "std_dev": round(total_std, 2),
                "ci_lower": round(p10, 2),
                "ci_upper": round(p90, 2),
                "p10": round(p10, 2),
                "p50": round(weighted_sum, 2),
                "p90": round(p90, 2)
            },
            "sources": model_predictions
        }

    @classmethod
    def blend_grid(
        cls,
        variable: str,
        lead: int,
        regime: str = "Active monsoon",
        season: str = "JJAS"
    ) -> xr.Dataset:
        """
        Blends spatial grids across all 7 models.
        """
        weights = cls.compute_weights(lead, regime, variable)
        blended_data = None
        ds_ref = None
        
        for model_id, adapter in ADAPTERS.items():
            ds = adapter.fetch(variable, lead, regime=regime, season=season)
            ds_ref = ds
            w = weights[model_id]
            if blended_data is None:
                blended_data = ds[variable].values * w
            else:
                blended_data += ds[variable].values * w

        out_ds = xr.Dataset(
            data_vars={
                variable: (["lat", "lon"], np.round(blended_data, 2))
            },
            coords={
                "lat": ds_ref.lat.values,
                "lon": ds_ref.lon.values
            },
            attrs={
                "lead_hours": lead,
                "regime": regime,
                "season": season,
                "variable": variable,
                "model_type": "Blended Consensus",
                "weights": weights
            }
        )
        return out_ds
