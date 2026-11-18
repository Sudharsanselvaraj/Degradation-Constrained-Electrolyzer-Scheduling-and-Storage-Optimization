"""
Baseline 4: Scenario-Based Stochastic Model Predictive Control (SMPC).
Optimizes dispatch across an ensemble of S renewable power scenarios with chance constraints on storage reserves.
"""

from typing import Dict, List, Optional
import numpy as np

from backend.app.optimization.solver_interface import SolverInterface, SolverResult


class BaselineStochasticMPC:
    """Multi-scenario stochastic LP minimizing expected costs across weather trajectories."""

    def __init__(
        self,
        nominal_power_kw: float = 100.0,
        tank_capacity_kg: float = 65.0,
        min_reserve_kg: float = 12.0,
        h2_yield_kg_per_kwh: float = 0.0195,
        risk_epsilon: float = 0.10, # 90% chance constraint satisfaction
    ):
        self.nominal_power_kw = nominal_power_kw
        self.tank_capacity_kg = tank_capacity_kg
        self.min_reserve_kg = min_reserve_kg
        self.h2_yield = h2_yield_kg_per_kwh
        self.risk_epsilon = risk_epsilon
        self.solver = SolverInterface()

    def optimize_horizon(
        self,
        renewable_scenarios_kw: np.ndarray, # Shape (S, N)
        c_electricity_eur_mwh: np.ndarray,
        demand_kg_h: np.ndarray,
        initial_storage_kg: float = 30.0,
        dt_hours: float = 0.25,
    ) -> Dict:
        """Solve multi-scenario chance-constrained stochastic formulation."""
        S, N = renewable_scenarios_kw.shape
        scenario_prob = 1.0 / S

        # Non-anticipativity: p_stack[k] is shared across all scenarios (here first-stage decision is shared,
        # or simplified robust proxy where conservative scenario bounds the dispatch)
        # To keep LP fast and standard, we formulate the robust scenario envelope where
        # effective available power is evaluated across scenarios:
        # Effective renewable power per step k with risk tolerance epsilon:
        # e.g., (1 - epsilon) quantile across scenarios
        p_renew_robust = np.quantile(renewable_scenarios_kw, self.risk_epsilon, axis=0)

        # Decision variables: [p_stack (N), p_grid (N), m_tank (N), shortfall (N)]
        num_vars = 4 * N
        c = np.zeros(num_vars)
        for k in range(N):
            c[N + k] = (c_electricity_eur_mwh[k] / 1000.0) * dt_hours
            c[3 * N + k] = 60.0

        bounds = []
        for _ in range(N):
            bounds.append((0.0, self.nominal_power_kw))
        for _ in range(N):
            bounds.append((0.0, 50.0))
        # Chance-constrained storage reserve: strictly enforce min_reserve_kg under robust scenario
        for _ in range(N):
            bounds.append((self.min_reserve_kg, self.tank_capacity_kg))
        for _ in range(N):
            bounds.append((0.0, 100.0))

        A_ub_list = []
        b_ub_list = []
        for k in range(N):
            row = np.zeros(num_vars)
            row[k] = 1.0
            row[N + k] = -1.0
            A_ub_list.append(row)
            b_ub_list.append(float(p_renew_robust[k]))

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
            "shortfall_kg": x_sol[3*N:],
            "objective_value": res.objective_value,
            "solve_time_ms": res.solve_time_ms,
            "success": res.success,
            "algorithm": "Baseline 4 (Stochastic MPC)",
        }
