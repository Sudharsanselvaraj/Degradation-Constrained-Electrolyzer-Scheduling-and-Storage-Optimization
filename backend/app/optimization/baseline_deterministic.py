"""
Baseline 2: Renewable-Aware Deterministic Model Predictive Control (MPC).
Uses point forecasts (p50) to optimize economic cost and meet demand, ignoring degradation and health uncertainty.
"""

from typing import Dict, Optional, Tuple
import numpy as np

from backend.app.optimization.solver_interface import SolverInterface, SolverResult


class BaselineDeterministicMPC:
    """Deterministic LP formulation optimizing renewable utilization without health feedback."""

    def __init__(
        self,
        nominal_power_kw: float = 100.0,
        tank_capacity_kg: float = 65.0,
        min_reserve_kg: float = 12.0,
        h2_yield_kg_per_kwh: float = 0.0195, # ~51.3 kWh/kg nominal SEC
    ):
        self.nominal_power_kw = nominal_power_kw
        self.tank_capacity_kg = tank_capacity_kg
        self.min_reserve_kg = min_reserve_kg
        self.h2_yield = h2_yield_kg_per_kwh
        self.solver = SolverInterface()

    def optimize_horizon(
        self,
        p_renewable_p50_kw: np.ndarray,
        c_electricity_eur_mwh: np.ndarray,
        demand_kg_h: np.ndarray,
        initial_storage_kg: float = 30.0,
        dt_hours: float = 0.25, # 15 minutes
    ) -> Dict:
        """Solve deterministic receding horizon LP."""
        N = len(p_renewable_p50_kw)
        # Decision variables per step k (4*N variables total):
        # x = [p_stack (N), p_grid (N), m_tank (N), shortfall (N)]
        num_vars = 4 * N

        # Objective: minimize Electricity Cost + Shortfall Penalty
        # Cost = sum( (c_elec / 1000) * p_grid * dt + 50.0 * shortfall )
        c = np.zeros(num_vars)
        for k in range(N):
            c[N + k] = (c_electricity_eur_mwh[k] / 1000.0) * dt_hours  # Grid cost
            c[3 * N + k] = 60.0  # High shortfall penalty (€60/kg)

        # Bounds
        bounds = []
        # 1. p_stack: [0, nominal_power_kw]
        for _ in range(N):
            bounds.append((0.0, self.nominal_power_kw))
        # 2. p_grid: [0, 50.0]
        for _ in range(N):
            bounds.append((0.0, 50.0))
        # 3. m_tank: [min_reserve_kg, tank_capacity_kg]
        for _ in range(N):
            bounds.append((self.min_reserve_kg, self.tank_capacity_kg))
        # 4. shortfall: [0, inf]
        for _ in range(N):
            bounds.append((0.0, 100.0))

        # Constraints:
        # A_ub x <= b_ub
        # 1. Power balance: p_stack[k] - p_grid[k] <= p_renewable_p50[k]
        A_ub_list = []
        b_ub_list = []
        for k in range(N):
            row = np.zeros(num_vars)
            row[k] = 1.0       # p_stack[k]
            row[N + k] = -1.0  # -p_grid[k]
            A_ub_list.append(row)
            b_ub_list.append(float(p_renewable_p50_kw[k]))

        # Equality Constraints: Storage Mass Conservation
        # m_tank[k] = m_tank[k-1] + (h2_yield * p_stack[k] - demand[k] + shortfall[k]) * dt
        # -> m_tank[k] - m_tank[k-1] - (h2_yield * dt) * p_stack[k] - dt * shortfall[k] = -demand[k] * dt
        A_eq_list = []
        b_eq_list = []
        for k in range(N):
            row = np.zeros(num_vars)
            row[2 * N + k] = 1.0  # m_tank[k]
            if k > 0:
                row[2 * N + k - 1] = -1.0  # -m_tank[k-1]
            row[k] = -self.h2_yield * dt_hours  # -production
            row[3 * N + k] = -dt_hours          # -shortfall
            A_eq_list.append(row)

            rhs = -demand_kg_h[k] * dt_hours
            if k == 0:
                rhs += initial_storage_kg  # initial inventory on RHS
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
        p_stack_sol = x_sol[:N]
        p_grid_sol = x_sol[N:2*N]
        m_tank_sol = x_sol[2*N:3*N]
        shortfall_sol = x_sol[3*N:]

        return {
            "p_stack_kw": p_stack_sol,
            "p_grid_kw": p_grid_sol,
            "m_tank_kg": m_tank_sol,
            "shortfall_kg": shortfall_sol,
            "objective_value": res.objective_value,
            "solve_time_ms": res.solve_time_ms,
            "success": res.success,
            "algorithm": "Baseline 2 (Renewable-Aware Deterministic MPC)",
        }
