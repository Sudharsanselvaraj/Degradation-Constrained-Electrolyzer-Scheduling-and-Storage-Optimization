"""
Baseline 1: Fixed Schedule Policy.
Operates the electrolyzer according to a predefined schedule without forecast-aware optimization.
"""

from typing import Dict
import numpy as np


class BaselineFixedSchedule:
    """Fixed schedule heuristic: constant nominal load during daytime (08:00 - 18:00) and standby at night."""

    def __init__(self, nominal_power_kw: float = 100.0, daytime_fraction: float = 0.70):
        self.nominal_power_kw = nominal_power_kw
        self.daytime_fraction = daytime_fraction

    def plan_horizon(
        self,
        num_steps: int = 96,
        dt_minutes: int = 15,
        start_hour: float = 0.0,
    ) -> Dict[str, np.ndarray]:
        """Generate static power schedule for prediction horizon."""
        step_hours = (start_hour + np.arange(num_steps) * (dt_minutes / 60.0)) % 24.0
        p_stack = np.zeros(num_steps)

        # Active between 08:00 and 18:00
        active_mask = (step_hours >= 8.0) & (step_hours < 18.0)
        p_stack[active_mask] = self.nominal_power_kw * self.daytime_fraction

        return {
            "p_stack_kw": p_stack,
            "p_grid_kw": np.maximum(0.0, p_stack - 30.0),  # Rough grid deficit assumption
            "solve_time_ms": 0.05,
            "success": True,
            "algorithm": "Baseline 1 (Fixed Schedule)",
        }
