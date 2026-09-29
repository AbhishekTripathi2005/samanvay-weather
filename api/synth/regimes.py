"""
Synoptic Weather Regime Classification and Detection Engine.
Identifies active meteorological regimes over the Indian Subcontinent:
1. Active monsoon
2. Break monsoon
3. Western Disturbance
4. Cyclone/Depression
5. Heatwave ridge
6. Neutral
"""
from typing import Dict, Any, Optional
import datetime
import numpy as np

REGIME_NAMES = [
    "Active monsoon",
    "Break monsoon",
    "Western Disturbance",
    "Cyclone/Depression",
    "Heatwave ridge",
    "Neutral"
]

REGIME_DESCRIPTIONS = {
    "Active monsoon": "Intense monsoonal trough with heavy orographic and deep convective precipitation across Central & West Coast India.",
    "Break monsoon": "Shift of monsoonal trough to Himalayan foothills; subdued central rainfall with enhanced foothills & northeast precipitation.",
    "Western Disturbance": "Mid-latitude upper-tropospheric westerly trough causing snowfall in Western Himalayas and rain in Northwest plains.",
    "Cyclone/Depression": "Intense tropical cyclone or low-pressure depression over Bay of Bengal / Arabian Sea with severe gale gusts and torrential deluge.",
    "Heatwave ridge": "Persistent subtropical high-pressure anticyclone with sinking air and dry advective westerly heating over Northern/Central India.",
    "Neutral": "Climatologically typical synoptic flow without dominant mesoscale or synoptic forcing."
}

def detect_regime(fields: Optional[Dict[str, Any]] = None, date: Optional[Any] = None) -> str:
    """
    Rule-based regime detector.
    Evaluates date, rainfall pattern, gradients, and Tmax anomaly to determine the dominant regime.
    """
    # 1. Parse date to determine month and day of year
    if date is None:
        month = 7  # default July (monsoon)
        doy = 200
    elif isinstance(date, str):
        try:
            dt = datetime.datetime.strptime(date[:10], "%Y-%m-%d")
            month = dt.month
            doy = dt.timetuple().tm_yday
        except Exception:
            month = 7
            doy = 200
    elif isinstance(date, (datetime.date, datetime.datetime)):
        month = date.month
        doy = date.timetuple().tm_yday
    elif isinstance(date, int):
        doy = date % 365 + 1
        month = int(doy / 30.5) + 1
    else:
        month = 7
        doy = 200

    # If explicit field features are provided, evaluate them
    if fields:
        rain_central = fields.get("rain_central", 0.0)
        rain_foothills = fields.get("rain_foothills", 0.0)
        tmax_anomaly = fields.get("tmax_anomaly", 0.0)
        wind_max = fields.get("wind_max", 0.0)
        rain_nw = fields.get("rain_nw", 0.0)

        # Check Cyclone / Depression
        if wind_max >= 55.0 and (rain_central >= 45.0 or fields.get("rain_coastal", 0.0) >= 60.0):
            return "Cyclone/Depression"

        # Check Heatwave ridge (MAM or early June)
        if (month in [3, 4, 5, 6]) and (tmax_anomaly >= 3.8 or fields.get("tmax_max", 0.0) >= 44.0):
            return "Heatwave ridge"

        # Check Western Disturbance (DJF or transition)
        if (month in [11, 12, 1, 2, 3]) and rain_nw >= 12.0:
            return "Western Disturbance"

        # Check Monsoon (JJAS)
        if month in [6, 7, 8, 9]:
            if rain_central >= 10.0 and rain_central > rain_foothills * 0.7:
                return "Active monsoon"
            elif rain_foothills >= 16.0 and rain_central < 6.0:
                return "Break monsoon"
            else:
                return "Active monsoon"

    # Climatological regime based on date and deterministic oscillation
    # Replicates realistic annual cycles:
    # DJF: Western Disturbance periodic pulses
    # MAM: Heatwave episodes
    # JJAS: Active vs Break monsoon cycles (approx 15-25 day Madden-Julian / quasi-biweekly oscillation)
    # OND: Cyclone season in Bay of Bengal
    rng = np.random.default_rng(doy * 101)
    
    if month in [6, 7, 8, 9]:  # Monsoon
        # Quasi-biweekly oscillation
        phase = np.sin(2 * np.pi * doy / 18.0)
        if phase > -0.2:
            return "Active monsoon"
        else:
            return "Break monsoon"
    elif month in [4, 5]:  # Pre-monsoon peak heat
        if rng.random() > 0.4:
            return "Heatwave ridge"
        return "Neutral"
    elif month in [10, 11]:  # Post-monsoon cyclone season
        if rng.random() > 0.65:
            return "Cyclone/Depression"
        return "Neutral"
    elif month in [12, 1, 2]:  # Winter Western Disturbances
        if rng.random() > 0.5:
            return "Western Disturbance"
        return "Neutral"
    else:  # March
        if rng.random() > 0.7:
            return "Heatwave ridge"
        return "Neutral"

def get_regime_timeline(n_days: int = 1095, start_date: str = "2023-01-01"):
    """Generates contiguous regime intervals for timeline rendering."""
    start_dt = datetime.datetime.strptime(start_date, "%Y-%m-%d")
    daily_regimes = []
    
    for day in range(n_days):
        dt = start_dt + datetime.timedelta(days=day)
        reg = detect_regime(date=dt)
        daily_regimes.append((dt.strftime("%Y-%m-%d"), reg))
    
    # Compress into intervals
    intervals = []
    if not daily_regimes:
        return intervals

    curr_reg = daily_regimes[0][1]
    curr_start = daily_regimes[0][0]
    duration = 1

    dominant_models = {
        "Active monsoon": "ncum_g",
        "Break monsoon": "ecmwf_ifs",
        "Western Disturbance": "graphcast",
        "Cyclone/Depression": "neps",
        "Heatwave ridge": "pangu",
        "Neutral": "graphcast"
    }

    for dt_str, reg in daily_regimes[1:]:
        if reg == curr_reg:
            duration += 1
        else:
            intervals.append({
                "regime": curr_reg,
                "start_date": curr_start,
                "end_date": dt_str,
                "duration_days": duration,
                "dominant_model": dominant_models.get(curr_reg, "samanvay"),
                "description": REGIME_DESCRIPTIONS.get(curr_reg, "")
            })
            curr_reg = reg
            curr_start = dt_str
            duration = 1
    
    # Last interval
    intervals.append({
        "regime": curr_reg,
        "start_date": curr_start,
        "end_date": daily_regimes[-1][0],
        "duration_days": duration,
        "dominant_model": dominant_models.get(curr_reg, "samanvay"),
        "description": REGIME_DESCRIPTIONS.get(curr_reg, "")
    })
    return intervals
