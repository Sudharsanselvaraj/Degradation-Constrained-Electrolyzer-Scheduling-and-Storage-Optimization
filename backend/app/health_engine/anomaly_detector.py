"""
Online Model Residual Tracker and CUSUM Anomaly Detector.
Monitors discrepancy between predicted digital twin voltage and observed telemetry:
r_t = V_measured - V_predicted
Detects sensor drift, cell membrane crossover anomalies, and model invalidation.
"""

from dataclasses import dataclass
from typing import Dict, List, Optional, Union
import numpy as np


@dataclass
class AnomalyConfig:
    """Thresholds for residual anomaly detection."""
    residual_warning_v: float = 1.2    # Absolute stack voltage discrepancy warning [V]
    residual_trip_v: float = 3.0       # Absolute stack voltage trip threshold [V]
    cusum_slack_k: float = 0.5         # CUSUM reference value k (allowable slack) [V]
    cusum_threshold_h: float = 4.0     # CUSUM decision boundary h [V]
    window_size: int = 50              # Rolling window for residual statistics


class ResidualAnomalyDetector:
    """Tracks physical voltage residuals and evaluates CUSUM drift detection."""

    def __init__(self, config: Optional[AnomalyConfig] = None):
        self.config = config or AnomalyConfig()
        self.residuals: List[float] = []
        self.cusum_pos = 0.0
        self.cusum_neg = 0.0
        self.anomaly_flag = False
        self.anomaly_reason = ""

    def process_sample(self, v_measured_v: float, v_predicted_v: float) -> Dict[str, Union[float, bool, str]]:
        """Evaluate new measurement against twin prediction and update CUSUM statistics."""
        cfg = self.config
        r_t = float(v_measured_v - v_predicted_v)
        self.residuals.append(r_t)
        if len(self.residuals) > cfg.window_size:
            self.residuals.pop(0)

        # CUSUM test for positive and negative mean shifts
        self.cusum_pos = max(0.0, self.cusum_pos + r_t - cfg.cusum_slack_k)
        self.cusum_neg = max(0.0, self.cusum_neg - r_t - cfg.cusum_slack_k)

        # Determine anomaly status
        self.anomaly_flag = False
        self.anomaly_reason = "NORMAL"

        if abs(r_t) >= cfg.residual_trip_v:
            self.anomaly_flag = True
            self.anomaly_reason = f"CRITICAL_VOLTAGE_DEVIATION: residual {r_t:+.2f} V exceeds trip limit {cfg.residual_trip_v} V"
        elif self.cusum_pos > cfg.cusum_threshold_h:
            self.anomaly_flag = True
            self.anomaly_reason = f"SYSTEMATIC_POSITIVE_DRIFT: CUSUM+ {self.cusum_pos:.2f} V indicates accelerated resistance growth"
        elif self.cusum_neg > cfg.cusum_threshold_h:
            self.anomaly_flag = True
            self.anomaly_reason = f"SYSTEMATIC_NEGATIVE_DRIFT: CUSUM- {self.cusum_neg:.2f} V indicates sensor fault or model mismatch"
        elif abs(r_t) >= cfg.residual_warning_v:
            self.anomaly_reason = f"WARNING_VOLTAGE_DEVIATION: residual {r_t:+.2f} V"

        rolling_mean = float(np.mean(self.residuals))
        rolling_std = float(np.std(self.residuals)) if len(self.residuals) > 1 else 0.0

        return {
            "v_measured_v": float(v_measured_v),
            "v_predicted_v": float(v_predicted_v),
            "residual_v": float(r_t),
            "rolling_residual_mean_v": float(rolling_mean),
            "rolling_residual_std_v": float(rolling_std),
            "cusum_pos": float(self.cusum_pos),
            "cusum_neg": float(self.cusum_neg),
            "is_anomaly": bool(self.anomaly_flag),
            "status_message": str(self.anomaly_reason),
        }
