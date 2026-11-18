"""
Health Confidence Engine and Lower Confidence Bound (LCB) safe operating envelope.
Transforms Bayesian state estimation uncertainty into dynamic constraints for predictive optimization.
"""

from dataclasses import dataclass
from typing import Dict, Optional, Tuple
import numpy as np


@dataclass
class ConfidenceConfig:
    """Risk tolerance and derating coefficients."""
    risk_alpha: float = 0.05           # Significance level (95% confidence -> z = 1.645)
    z_score: float = 1.645             # Standard normal quantile for (1 - alpha)
    min_derated_power_ratio: float = 0.25 # Minimum turndown floor even when heavily derated
    max_safe_temp_c: float = 75.0      # Critical temperature threshold above which power is curtailed
    nominal_power_kw: float = 100.0


class HealthConfidenceEngine:
    """Calculates Lower Confidence Bound (LCB) on equipment health and safe operating power envelope."""

    def __init__(self, config: Optional[ConfidenceConfig] = None):
        self.config = config or ConfidenceConfig()

    def calculate_health_lcb(self, health_mean: float, health_std: float) -> float:
        """Lower Confidence Bound: H_LCB = mu_H - z_{1-alpha} * sigma_H."""
        lcb = health_mean - self.config.z_score * health_std
        return float(np.clip(lcb, 0.05, 1.0))

    def dynamic_safe_power_envelope(
        self,
        health_mean: float,
        health_std: float,
        stack_temp_c: float = 60.0,
        rated_power_kw: Optional[float] = None,
    ) -> Dict[str, float]:
        """Derive dynamic safe maximum power limit based on health LCB and thermal headroom."""
        p_rated = rated_power_kw if rated_power_kw is not None else self.config.nominal_power_kw
        h_lcb = self.calculate_health_lcb(health_mean, health_std)

        # Health derating factor: linear scaling between min_derated_power_ratio and 1.0
        health_factor = float(np.clip(h_lcb, self.config.min_derated_power_ratio, 1.0))

        # Thermal derating: if stack temperature approaches max_safe_temp_c (75 °C), throttle power
        if stack_temp_c > 65.0:
            thermal_factor = max(0.2, (self.config.max_safe_temp_c - stack_temp_c) / 10.0)
        else:
            thermal_factor = 1.0

        effective_limit_kw = p_rated * health_factor * thermal_factor
        effective_limit_kw = float(np.clip(effective_limit_kw, p_rated * self.config.min_derated_power_ratio, p_rated))

        # Uncertainty penalty metric
        uncertainty_gap_kw = float(p_rated * (health_mean - h_lcb))

        return {
            "health_mean": float(health_mean),
            "health_std": float(health_std),
            "health_lcb": float(h_lcb),
            "health_factor": float(health_factor),
            "thermal_factor": float(thermal_factor),
            "p_rated_kw": float(p_rated),
            "p_max_effective_kw": float(effective_limit_kw),
            "uncertainty_gap_kw": float(uncertainty_gap_kw),
            "confidence_level_pct": float((1.0 - self.config.risk_alpha) * 100.0),
        }
