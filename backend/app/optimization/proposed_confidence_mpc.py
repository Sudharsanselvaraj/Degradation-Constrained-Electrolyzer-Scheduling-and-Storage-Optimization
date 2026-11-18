"""
Proposed Approach: Confidence-Aware, Degradation-Constrained Model Predictive Control.
Integrates Bayesian Lower Confidence Bound (LCB) health envelopes, renewable quantiles,
chance-constrained storage, and deadline-aware watchdog fallback.
"""

import time
from typing import Dict, Optional, Tuple
import numpy as np

from backend.app.health_engine.confidence_engine import HealthConfidenceEngine
from backend.app.optimization.fallback_policy import SupervisoryFallbackWatchdog
from backend.app.optimization.solver_interface import SolverInterface, SolverResult


class ProposedConfidenceAwareMPC:
    """Confidence-Aware Adaptive MPC with epistemic health uncertainty adaptation and deadline watchdog."""

    def __init__(
        self,
        nominal_power_kw: float = 100.0,
        tank_capacity_kg: float = 65.0,
        min_reserve_kg: float = 12.0,
        h2_yield_kg_per_kwh: float = 0.0195,
        lambda_degradation: float = 0.05,
        lambda_ramping: float = 0.02,
        z_score: float = 1.645, # 95% confidence
    ):
        self.nominal_power_kw = nominal_power_kw
        self.tank_capacity_kg = tank_capacity_kg
        self.min_reserve_kg = min_reserve_kg
        self.h2_yield = h2_yield_kg_per_kwh
        self.lambda_deg = lambda_degradation
        self.lambda_ramp = lambda_ramping

        self.confidence_engine = HealthConfidenceEngine()
        self.watchdog = SupervisoryFallbackWatchdog()
        self.solver = SolverInterface()

    def optimize_horizon(
        self,
        renewable_p10_kw: np.ndarray,
        renewable_p50_kw: np.ndarray,
        c_electricity_eur_mwh: np.ndarray,
        demand_kg_h: np.ndarray,
        health_mean: float = 0.95,
        health_std: float = 0.04,
        stack_temp_c: float = 60.0,
        initial_storage_kg: float = 30.0,
        dt_hours: float = 0.25,
        telemetry_age_s: float = 1.0,
        artificial_timeout_s: Optional[float] = None, # for stress testing fallback
    ) -> Dict:
        """Solve confidence-aware MPC formulation with watchdog fallback protection."""
        N = len(renewable_p50_kw)
        start_t = time.perf_counter()

        # 1. Derive Dynamic Safe Operating Envelope using Lower Confidence Bound (LCB)
        envelope = self.confidence_engine.dynamic_safe_power_envelope(
            health_mean=health_mean,
            health_std=health_std,
            stack_temp_c=stack_temp_c,
            rated_power_kw=self.nominal_power_kw,
        )
        p_max_effective = envelope["p_max_effective_kw"]

        # Risk-weighted available renewable power: blend of p50 and p10
        # When health uncertainty is high, weigh p10 more heavily
        uncertainty_weight = float(np.clip(health_std / 0.10, 0.0, 1.0))
        p_renew_eff = (1.0 - 0.5 * uncertainty_weight) * renewable_p50_kw + (0.5 * uncertainty_weight) * renewable_p10_kw

        # 2. Formulate LP: 5*N variables [p_stack (N), p_grid (N), m_tank (N), shortfall (N), delta_p (N)]
        num_vars = 5 * N
        c = np.zeros(num_vars)
        for k in range(N):
            c[N + k] = (c_electricity_eur_mwh[k] / 1000.0) * dt_hours  # Grid electricity cost
            c[3 * N + k] = 65.0                                         # Shortfall penalty
            c[k] = self.lambda_deg * dt_hours                           # Degradation cost
            c[4 * N + k] = self.lambda_ramp                             # Ramping cost

        # Bounds: strictly bounded by p_max_effective
        bounds = []
        for _ in range(N):
            bounds.append((0.0, p_max_effective))
        for _ in range(N):
            bounds.append((0.0, 50.0))
        for _ in range(N):
            bounds.append((self.min_reserve_kg, self.tank_capacity_kg))
        for _ in range(N):
            bounds.append((0.0, 100.0))
        for _ in range(N):
            bounds.append((0.0, self.nominal_power_kw))

        # Constraints
        A_ub_list = []
        b_ub_list = []
        # Power balance
        for k in range(N):
            row = np.zeros(num_vars)
            row[k] = 1.0
            row[N + k] = -1.0
            A_ub_list.append(row)
            b_ub_list.append(float(p_renew_eff[k]))

        # Ramping constraints
        for k in range(1, N):
            row_pos = np.zeros(num_vars)
            row_pos[k] = 1.0
            row_pos[k - 1] = -1.0
            row_pos[4 * N + k] = -1.0
            A_ub_list.append(row_pos)
            b_ub_list.append(0.0)

            row_neg = np.zeros(num_vars)
            row_neg[k] = -1.0
            row_neg[k - 1] = 1.0
            row_neg[4 * N + k] = -1.0
            A_ub_list.append(row_neg)
            b_ub_list.append(0.0)

        # Storage Conservation
        A_eq_list = []
        b_eq_list = []
        for k in range(N):
            row = np.zeros(num_vars)
            row[2 * N + k] = 1.0
            if k > 0:
                row[2 * N + k - 1] = -1.0
            row[k] = -self.h2_yield * dt_hours
            row[3 * N + k] = -dt_hours
            A_eq_list.append(row)

            rhs = -demand_kg_h[k] * dt_hours
            if k == 0:
                rhs += initial_storage_kg
            b_eq_list.append(float(rhs))

        # 3. Solve Optimization Problem
        res: SolverResult = self.solver.solve_linear_program(
            c=c,
            A_ub=np.array(A_ub_list),
            b_ub=np.array(b_ub_list),
            A_eq=np.array(A_eq_list),
            b_eq=np.array(b_eq_list),
            bounds=bounds,
        )

        solve_time_s = (time.perf_counter() - start_t)
        if artificial_timeout_s:
            solve_time_s += artificial_timeout_s

        x_sol = res.solution_vars.get("x", np.zeros(num_vars))
        p_stack_raw = x_sol[:N]

        # 4. Supervisory Watchdog & Fallback Evaluation
        dispatched_p_stack, is_fallback, status_msg = self.watchdog.evaluate_and_dispatch(
            solver_success=res.success,
            solve_time_s=solve_time_s,
            telemetry_age_s=telemetry_age_s,
            optimal_schedule_kw=p_stack_raw,
            available_renewable_kw=float(p_renew_eff[0]),
        )

        return {
            "p_stack_kw": dispatched_p_stack,
            "p_grid_kw": x_sol[N:2*N] if not is_fallback else np.zeros(N),
            "m_tank_kg": x_sol[2*N:3*N] if not is_fallback else np.full(N, initial_storage_kg),
            "shortfall_kg": x_sol[3*N:4*N] if not is_fallback else np.zeros(N),
            "ramping_kw": x_sol[4*N:5*N] if not is_fallback else np.zeros(N),
            "p_max_effective_kw": float(p_max_effective),
            "health_lcb": float(envelope["health_lcb"]),
            "uncertainty_gap_kw": float(envelope["uncertainty_gap_kw"]),
            "objective_value": res.objective_value if not is_fallback else 0.0,
            "solve_time_ms": solve_time_s * 1000.0,
            "success": res.success and not is_fallback,
            "is_fallback_engaged": is_fallback,
            "watchdog_status": status_msg,
            "algorithm": "Proposed Confidence-Aware Adaptive MPC",
        }
