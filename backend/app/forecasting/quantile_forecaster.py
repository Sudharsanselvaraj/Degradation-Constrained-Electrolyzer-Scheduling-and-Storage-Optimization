"""
Probabilistic Renewable Power Forecasting with Quantile Regression (p10, p50, p90).
Evaluates Pinball Loss, Prediction Interval Coverage Probability (PICP), and NMPIW.
"""

from typing import Dict, List, Optional, Tuple
import numpy as np
import pandas as pd
from sklearn.ensemble import GradientBoostingRegressor

from backend.app.forecasting.solar_pv_model import SolarPVModel
from backend.app.forecasting.wind_turbine_model import WindTurbineModel


class ProbabilisticRenewableForecaster:
    """Predicts total available renewable power with risk-bounded quantile intervals [p10, p50, p90]."""

    def __init__(self):
        self.pv_model = SolarPVModel()
        self.wind_model = WindTurbineModel()

        # Three quantile gradient boosted regressors
        self.model_p10 = GradientBoostingRegressor(loss="quantile", alpha=0.10, n_estimators=60, max_depth=3, random_state=42)
        self.model_p50 = GradientBoostingRegressor(loss="quantile", alpha=0.50, n_estimators=60, max_depth=3, random_state=42)
        self.model_p90 = GradientBoostingRegressor(loss="quantile", alpha=0.90, n_estimators=60, max_depth=3, random_state=42)
        self.is_trained = False

    def _extract_features(self, weather_df: pd.DataFrame) -> np.ndarray:
        """Engineer physical and temporal features from weather telemetry."""
        hours = weather_df["time"].dt.hour.values if "time" in weather_df.columns else np.zeros(len(weather_df))
        ghi = weather_df["global_horizontal_irradiance"].values
        temp = weather_df["temperature_2m"].values
        wind = weather_df["wind_speed_10m"].values

        # Physical point estimates
        pv_phys = self.pv_model.calculate_power(ghi, temp)
        wind_phys = self.wind_model.calculate_power(wind)
        total_phys = pv_phys + wind_phys

        # Temporal cyclics
        sin_hour = np.sin(2.0 * np.pi * hours / 24.0)
        cos_hour = np.cos(2.0 * np.pi * hours / 24.0)

        X = np.column_stack([ghi, wind, temp, pv_phys, wind_phys, total_phys, sin_hour, cos_hour])
        return X

    def train_or_calibrate(self, weather_df: pd.DataFrame):
        """Fit quantile models on historical/simulated renewable data."""
        X = self._extract_features(weather_df)
        ghi = weather_df["global_horizontal_irradiance"].values
        temp = weather_df["temperature_2m"].values
        wind = weather_df["wind_speed_10m"].values

        pv_phys = self.pv_model.calculate_power(ghi, temp)
        wind_phys = self.wind_model.calculate_power(wind)
        true_power = pv_phys + wind_phys + np.random.normal(0, 3.5, len(pv_phys))
        true_power = np.maximum(true_power, 0.0)

        self.model_p10.fit(X, true_power)
        self.model_p50.fit(X, true_power)
        self.model_p90.fit(X, true_power)
        self.is_trained = True

    def predict_quantiles(self, weather_df: pd.DataFrame) -> Dict[str, np.ndarray]:
        """Generate p10, p50, p90 renewable power trajectories [kW]."""
        if not self.is_trained:
            self.train_or_calibrate(weather_df)

        X = self._extract_features(weather_df)
        p10 = np.maximum(self.model_p10.predict(X), 0.0)
        p50 = np.maximum(self.model_p50.predict(X), 0.0)
        p90 = np.maximum(self.model_p90.predict(X), 0.0)

        # Enforce non-crossing quantile constraint: p10 <= p50 <= p90
        p50 = np.maximum(p50, p10)
        p90 = np.maximum(p90, p50)

        # Solar PV & Wind components
        pv_kw = self.pv_model.calculate_power(weather_df["global_horizontal_irradiance"].values, weather_df["temperature_2m"].values)
        wind_kw = self.wind_model.calculate_power(weather_df["wind_speed_10m"].values)

        return {
            "p10_kw": p10,
            "p50_kw": p50,
            "p90_kw": p90,
            "pv_expected_kw": pv_kw,
            "wind_expected_kw": wind_kw,
            "uncertainty_spread_kw": p90 - p10,
        }

    @staticmethod
    def evaluate_metrics(y_true: np.ndarray, p10: np.ndarray, p50: np.ndarray, p90: np.ndarray) -> Dict[str, float]:
        """Compute Pinball Loss, PICP (coverage probability), and NMPIW."""
        mae = float(np.mean(np.abs(y_true - p50)))
        rmse = float(np.sqrt(np.mean((y_true - p50) ** 2)))

        # Pinball Loss for quantile tau: L_tau(y, q) = max(tau*(y - q), (1 - tau)*(q - y))
        def pinball(tau, q):
            diff = y_true - q
            return float(np.mean(np.maximum(tau * diff, (tau - 1.0) * diff)))

        pb_10 = pinball(0.10, p10)
        pb_50 = pinball(0.50, p50)
        pb_90 = pinball(0.90, p90)
        avg_pinball = (pb_10 + pb_50 + pb_90) / 3.0

        # Prediction Interval Coverage Probability (PICP) for nominal 80% interval [p10, p90]
        in_interval = (y_true >= p10) & (y_true <= p90)
        picp = float(np.mean(in_interval) * 100.0)

        # Normalized Mean Prediction Interval Width (NMPIW)
        y_range = max(float(np.ptp(y_true)), 1.0)
        nmpiw = float(np.mean(p90 - p10) / y_range)

        return {
            "mae_kw": mae,
            "rmse_kw": rmse,
            "pinball_loss": avg_pinball,
            "picp_pct": picp,
            "nmpiw": nmpiw,
        }
