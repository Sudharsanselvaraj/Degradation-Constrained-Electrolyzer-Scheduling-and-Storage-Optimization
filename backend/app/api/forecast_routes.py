"""
API Routes for Renewable Intelligence & Weather Forecasting.
"""

from fastapi import APIRouter
from typing import Dict, List, Optional
import numpy as np

from backend.app.forecasting.open_meteo_client import OpenMeteoWeatherClient
from backend.app.forecasting.quantile_forecaster import ProbabilisticRenewableForecaster

router = APIRouter(prefix="/api/forecast", tags=["renewable_forecasting"])

_weather_client = OpenMeteoWeatherClient()
_forecaster = ProbabilisticRenewableForecaster()


@router.get("/generate")
def generate_forecast(days: int = 2):
    """Retrieve weather forecast and generate p10, p50, p90 renewable power trajectories."""
    weather_df = _weather_client.fetch_forecast(days=days)
    quantiles = _forecaster.predict_quantiles(weather_df)

    # Convert timestamps to string format for JSON
    time_strs = [t.strftime("%Y-%m-%d %H:%M") for t in weather_df["time"]]

    records = []
    for i in range(len(time_strs)):
        records.append({
            "time": time_strs[i],
            "p10_kw": float(quantiles["p10_kw"][i]),
            "p50_kw": float(quantiles["p50_kw"][i]),
            "p90_kw": float(quantiles["p90_kw"][i]),
            "pv_expected_kw": float(quantiles["pv_expected_kw"][i]),
            "wind_expected_kw": float(quantiles["wind_expected_kw"][i]),
            "ghi_w_m2": float(weather_df["global_horizontal_irradiance"].iloc[i]),
            "wind_speed_m_s": float(weather_df["wind_speed_10m"].iloc[i]),
            "temp_ambient_c": float(weather_df["temperature_2m"].iloc[i]),
        })

    return {
        "status": "success",
        "total_steps": len(records),
        "forecast": records,
    }
