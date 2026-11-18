"""
Deadline-Aware Supervisory Watchdog and Deterministic Fallback Policy.
Protects physical plant integrity when solver exceeds deadline, encounters infeasibility, or receives stale telemetry.
"""

import time
from dataclasses import dataclass
from typing import Dict, Optional, Tuple
import numpy as np


@dataclass
class WatchdogConfig:
    """Watchdog timing and fallback setpoints."""
    max_solver_latency_s: float = 1.5   # Maximum acceptable solve time [s]
    max_telemetry_age_s: float = 30.0   # Stale data detection limit [s]
    safe_fraction_power: float = 0.50   # Safe fallback operating fraction (50 kW)
    nominal_power_kw: float = 100.0


class SupervisoryFallbackWatchdog:
    """Supervises optimization execution and triggers deterministic safe control when necessary."""

    def __init__(self, config: Optional[WatchdogConfig] = None):
        self.config = config or WatchdogConfig()
        self.fallback_count = 0
        self.last_fallback_reason = "NONE"

    def evaluate_and_dispatch(
        self,
        solver_success: bool,
        solve_time_s: float,
        telemetry_age_s: float,
        optimal_schedule_kw: np.ndarray,
        available_renewable_kw: float,
    ) -> Tuple[np.ndarray, bool, str]:
        """Verify solver decision against watchdog criteria; dispatch optimal schedule or engage fallback.
        
        Returns:
            (dispatched_power_kw_array, is_fallback_engaged, status_reason)
        """
        cfg = self.config

        # Check 1: Solver failure or infeasibility
        if not solver_success:
            self.fallback_count += 1
            self.last_fallback_reason = "SOLVER_INFEASIBLE_OR_FAILED"
            fallback_schedule = self._generate_safe_fallback(optimal_schedule_kw, available_renewable_kw)
            return fallback_schedule, True, self.last_fallback_reason

        # Check 2: Solver deadline timeout
        if solve_time_s > cfg.max_solver_latency_s:
            self.fallback_count += 1
            self.last_fallback_reason = f"SOLVER_TIMEOUT: solve time {solve_time_s:.2f}s exceeded limit {cfg.max_solver_latency_s}s"
            fallback_schedule = self._generate_safe_fallback(optimal_schedule_kw, available_renewable_kw)
            return fallback_schedule, True, self.last_fallback_reason

        # Check 3: Stale input telemetry
        if telemetry_age_s > cfg.max_telemetry_age_s:
            self.fallback_count += 1
            self.last_fallback_reason = f"STALE_TELEMETRY: data age {telemetry_age_s:.1f}s exceeded limit {cfg.max_telemetry_age_s}s"
            fallback_schedule = self._generate_safe_fallback(optimal_schedule_kw, available_renewable_kw)
            return fallback_schedule, True, self.last_fallback_reason

        # All checks passed
        return optimal_schedule_kw, False, "OPTIMAL_DISPATCH"

    def _generate_safe_fallback(self, reference_shape: np.ndarray, available_renewable_kw: float) -> np.ndarray:
        """Deterministic safe policy: throttle power to safe fraction and strictly limit to available renewable power."""
        N = len(reference_shape)
        safe_cap = self.config.nominal_power_kw * self.config.safe_fraction_power
        # Immediate first step throttles to available renewable up to safe cap
        p_step0 = min(available_renewable_kw, safe_cap)
        fallback = np.full(N, p_step0)
        return fallback
