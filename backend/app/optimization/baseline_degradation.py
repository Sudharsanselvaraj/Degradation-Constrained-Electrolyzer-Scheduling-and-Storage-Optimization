"""
Baseline 3: Degradation-Aware Model Predictive Control.
Penalizes high current density operation and power ramping with deterministic wear costs, but ignores health uncertainty.
"""

from typing import Dict, Optional
import numpy as np

from backend.app.optimization.solver_interface import SolverInterface, SolverResult


class BaselineDegradationAwareMPC:
    """Considers empirical degradation penalties and ramping costs, assuming deterministic stack health."""

    def __init__(
        self,
        nominal_power_kw: float = 100.0,
        tank_capacity_kg: float = 65.0,
        min_reserve_kg: float = 12.0,
        h2_yield_kg_per_kwh: float = 0.0195,
        lambda_degradation: float = 0.045, # € / kWh degradation penalty
        lambda_ramping: float = 0.015,     # € / kW ramping penalty
    ):
        self.nominal_power_kw = nominal_power_kw
        self.tank_capacity_kg = tank_capacity_kg
        self.min_reserve_kg = min_reserve_kg
        self.h2_yield = h2_yield_kg_per_kwh
        self.lambda_deg = lambda_degradation
        self.lambda_ramp = lambda_ramping
        self.solver = SolverInterface()

    def optimize_horizon(
        self,
        p_renewable_p50_kw: np.ndarray,
        c_electricity_eur_mwh: np.ndarray,
        demand_kg_h: np.ndarray,
        initial_storage_kg: float = 30.0,
        dt_hours: float = 0.25,
        estimated_health: float = 1.0,
    ) -> Dict:
        """Solve LP with degradation and ramping slack variables."""
        N = len(p_renewable_p50_kw)
        # Decision variables (5*N variables):
        # x = [p_stack (N), p_grid (N), m_tank (N), shortfall (N), delta_p (N)]
        num_vars = 5 * N

        c = np.zeros(num_vars)
        for k in range(N):
            # Electricity grid cost
            c[N + k] = (c_electricity_eur_mwh[k] / 1000.0) * dt_hours
            # Hydrogen delivery shortfall penalty
            c[3 * N + k] = 60.0
            # Degradation cost per kWh operating at high load
            c[k] = self.lambda_deg * dt_hours
            # Ramping cost
            c[4 * N + k] = self.lambda_ramp

        # Bounds: stack power capped by estimated health (deterministic point value)
        max_power = self.nominal_power_kw * max(0.3, estimated_health)
        bounds = []
        for _ in range(N):
            bounds.append((0.0, max_power))
        for _ in range(N):
            bounds.append((0.0, 50.0))
        for _ in range(N):
            bounds.append((self.min_reserve_kg, self.tank_capacity_kg))
        for _ in range(N):
            bounds.append((0.0, 100.0))
        for _ in range(N):
            bounds.append((0.0, self.nominal_power_kw))

        # Constraints:
        A_ub_list = []
        b_ub_list = []
        # 1. Renewable + Grid balance: p_stack[k] - p_grid[k] <= p_renew[k]
        for k in range(N):
            row = np.zeros(num_vars)
            row[k] = 1.0
            row[N + k] = -1.0
            A_ub_list.append(row)
            b_ub_list.append(float(p_renewable_p50_kw[k]))

        # 2. Ramping constraints: p_stack[k] - p_stack[k-1] <= delta_p[k]
        # and p_stack[k-1] - p_stack[k] <= delta_p[k]
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

        # Equality Constraints: Storage Balance
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

        res: SolverResult = self.solver.solve_linear_program(
            c=c,
            A_ub=np.array(A_ub_list),
            b_ub=np.array(b_ub_list),
            A_eq=np.array(A_eq_list),
            b_eq=np.array(b_eq_list),
            bounds=bounds,
        )

        x_sol = res.solution_vars.get("x", np.zeros(num_vars))
        return {
            "p_stack_kw": x_sol[:N],
            "p_grid_kw": x_sol[N:2*N],
            "m_tank_kg": x_sol[2*N:3*N],
            "shortfall_kg": x_sol[3*N:4*N],
            "ramping_kw": x_sol[4*N:5*N],
            "objective_value": res.objective_value,
            "solve_time_ms": res.solve_time_ms,
            "success": res.success,
            "algorithm": "Baseline 3 (Degradation-Aware MPC)",
        }
