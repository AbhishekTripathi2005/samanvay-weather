import math
"""
IMD Operational Disaster Management Threshold Evaluation.
Evaluates Rainfall, Heatwave, and Wind Gust Alerts across 36 Indian States/UTs.
"""
from typing import Dict, List, Any
import numpy as np
from geo.regions import STATES_UTS, SEASON_CLIMATOLOGY
from blending.engine import BlendingEngine
from config import IMD_THRESHOLDS

class ExtremeEvaluator:
    @classmethod
    def evaluate_state_risk(
        cls,
        lead: int = 24,
        regime: str = "Active monsoon",
        season: str = "JJAS"
    ) -> List[Dict[str, Any]]:
        """
        Evaluates disaster warning levels for all 36 States/UTs under current forecast.
        """
        results = []
        for state in STATES_UTS:
            code = state["code"]
            zone = state["zone"]
            pop = state["pop_millions"]
            
            # Fetch blended values for rainfall, tmax, wind_gust
            rain_blend = BlendingEngine.blend_regional("rainfall", lead, code, regime, season)
            tmax_blend = BlendingEngine.blend_regional("tmax", lead, code, regime, season)
            gust_blend = BlendingEngine.blend_regional("wind_gust", lead, code, regime, season)

            rain_val = rain_blend["consensus"]["value"]
            rain_p90 = rain_blend["consensus"]["p90"]
            tmax_val = tmax_blend["consensus"]["value"]
            gust_val = gust_blend["consensus"]["value"]

            # Climatology departure
            climatology = SEASON_CLIMATOLOGY.get(season, {}).get(zone, {})
            tmax_clim = climatology.get("tmax", 35.0)
            tmax_departure = round(tmax_val - tmax_clim, 1)

            # IMD Probability of Exceedance Calculation
            # Heavy Rain (>64.5 mm), Very Heavy (>115.6 mm), Extremely Heavy (>204.5 mm)
            rain_std = max(1.0, rain_blend["consensus"]["std_dev"])
            p_heavy = float(np.clip(1.0 - 0.5 * (1.0 + math.erf((64.5 - rain_val) / (rain_std * np.sqrt(2)))), 0.0, 1.0))
            p_very_heavy = float(np.clip(1.0 - 0.5 * (1.0 + math.erf((115.6 - rain_val) / (rain_std * np.sqrt(2)))), 0.0, 1.0))
            p_extreme = float(np.clip(1.0 - 0.5 * (1.0 + math.erf((204.5 - rain_val) / (rain_std * np.sqrt(2)))), 0.0, 1.0))

            # Heatwave probability
            tmax_std = max(0.5, tmax_blend["consensus"]["std_dev"])
            p_heatwave = float(np.clip(1.0 - 0.5 * (1.0 + math.erf((40.0 - tmax_val) / (tmax_std * np.sqrt(2)))), 0.0, 1.0)) if tmax_departure >= 3.0 else 0.0

            # Gust probability (>75 km/h)
            gust_std = max(2.0, gust_blend["consensus"]["std_dev"])
            p_gale = float(np.clip(1.0 - 0.5 * (1.0 + math.erf((75.0 - gust_val) / (gust_std * np.sqrt(2)))), 0.0, 1.0))

            # Determine dominant alert level
            alert_level = "GREEN"
            alert_color = "#10B981"
            primary_hazard = "Normal Weather Conditions"
            sop_action = "Routine meteorological monitoring; standard district readiness."

            if rain_val >= 204.5 or p_extreme > 0.40 or (tmax_val >= 45.0 and tmax_departure >= 6.4) or gust_val >= 100.0:
                alert_level = "RED"
                alert_color = "#EF4444"
                if rain_val >= 204.5 or p_extreme > 0.40:
                    primary_hazard = "Extremely Heavy Rainfall (>204.5 mm)"
                    sop_action = "RED WARNING: Mobilize NDRF/SDRF teams. Evacuate low-lying and riverine inundation zones. Halt non-essential transport. Activate Emergency Operations Centers (EOC)."
                elif gust_val >= 100.0:
                    primary_hazard = "Violent Gale Wind Gusts (>100 km/h)"
                    sop_action = "RED WARNING: Cyclone preparedness protocol. Secure telecom/power lines, suspend fishing/port operations."
                else:
                    primary_hazard = "Severe Heatwave (IMD Red Criteria)"
                    sop_action = "RED WARNING: Mandatory cooling shelters, emergency water distribution, suspend outdoor industrial/construction shifts."

            elif rain_val >= 115.6 or p_very_heavy > 0.45 or (tmax_val >= 40.0 and tmax_departure >= 4.5) or gust_val >= 75.0:
                alert_level = "ORANGE"
                alert_color = "#F59E0B"
                if rain_val >= 115.6 or p_very_heavy > 0.45:
                    primary_hazard = "Very Heavy Rainfall (115.6 - 204.4 mm)"
                    sop_action = "ORANGE ALERT: District magistrate alert. Pre-position dewatering pumps and medical supplies. Issue travel advisories."
                elif gust_val >= 75.0:
                    primary_hazard = "Severe Wind Gusts (75 - 99 km/h)"
                    sop_action = "ORANGE ALERT: Secure temporary structures, issue coastal advisories, stand-by emergency power crews."
                else:
                    primary_hazard = "Heatwave Conditions (IMD Orange Criteria)"
                    sop_action = "ORANGE ALERT: Health department heat stroke ward mobilization, reschedule school hours."

            elif rain_val >= 64.5 or p_heavy > 0.50 or tmax_departure >= 3.5 or gust_val >= 50.0:
                alert_level = "YELLOW"
                alert_color = "#EAB308"
                if rain_val >= 64.5 or p_heavy > 0.50:
                    primary_hazard = "Heavy Rainfall (64.5 - 115.5 mm)"
                    sop_action = "YELLOW WATCH: Keep watch on localized waterlogging, urban traffic diversions, agricultural drainage."
                elif gust_val >= 50.0:
                    primary_hazard = "Squally Wind Gusts (50 - 74 km/h)"
                    sop_action = "YELLOW WATCH: Fishermen cautioned against venturing into deep sea."
                else:
                    primary_hazard = "Pre-Heatwave Warm Spell"
                    sop_action = "YELLOW WATCH: Public awareness campaign regarding hydration."

            # Population exposure estimate
            affected_pop_millions = round(pop * (0.8 if alert_level == "RED" else (0.45 if alert_level == "ORANGE" else (0.2 if alert_level == "YELLOW" else 0.0))), 2)

            results.append({
                "code": code,
                "name": state["name"],
                "zone": zone,
                "lat": state["lat"],
                "lon": state["lon"],
                "population_millions": pop,
                "affected_pop_millions": affected_pop_millions,
                "terrain": state["terrain"],
                "alert_level": alert_level,
                "alert_color": alert_color,
                "primary_hazard": primary_hazard,
                "sop_action": sop_action,
                "metrics": {
                    "rainfall_mm": rain_val,
                    "rainfall_p90_mm": rain_p90,
                    "tmax_c": tmax_val,
                    "tmax_departure_c": tmax_departure,
                    "wind_gust_kmh": gust_val,
                    "p_heavy_rain": round(p_heavy, 3),
                    "p_very_heavy_rain": round(p_very_heavy, 3),
                    "p_extreme_rain": round(p_extreme, 3),
                    "p_heatwave": round(p_heatwave, 3),
                    "p_gale_gust": round(p_gale, 3)
                }
            })

        # Sort with RED first, then ORANGE, then YELLOW, then GREEN
        priority_map = {"RED": 0, "ORANGE": 1, "YELLOW": 2, "GREEN": 3}
        results.sort(key=lambda x: (priority_map[x["alert_level"]], -x["metrics"]["rainfall_mm"]))
        return results
