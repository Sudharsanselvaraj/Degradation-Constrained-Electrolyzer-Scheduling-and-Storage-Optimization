"""
Monte Carlo Stress Tester for Green Hydrogen Digital Twin.
Simulates extreme operational disturbances:
- Sudden solar dropout (storm cloud cover)
- Wind gust cut-outs
- Severe demand spikes
- Degraded stack health with high estimation variance
- Solver latency injection (evaluating watchdog fallback transition)
"""

from typing import Dict, List, Optional
import numpy as np

from backend.app.experiments.benchmark_runner import BenchmarkRunner
from backend.app.optimization.proposed_confidence_mpc import ProposedConfidenceAwareMPC


class DigitalTwinStressTester:
    """Executes Monte Carlo disturbance experiments to evaluate platform resilience and safety envelopes."""

    def __init__(self, benchmark_runner: Optional[BenchmarkRunner] = None):
        self.benchmark = benchmark_runner or BenchmarkRunner()

    def run_stress_test(
        self,
        scenario_type: str = "solar_dropout",
        severity_fraction: float = 0.50, # 50% drop or surge
        inject_solver_timeout: bool = False,
    ) -> Dict:
        """Run stress scenario and return comparative telemetry before and after disturbance."""
        data = self.benchmark.generate_benchmark_inputs(random_seed=777)
        p10 = data["p10_kw"].copy()
        p50 = data["p50_kw"].copy()
        demand = data["demand_kg_h"].copy()
        c_elec = data["c_electricity_eur_mwh"]
        dt_h = self.benchmark.dt_hours
        N = len(p50)

        disturbance_desc = ""

        if scenario_type == "solar_dropout":
            # Midday storm: drop solar generation by severity_fraction between steps 36 and 60 (09:00 - 15:00)
            p10[36:60] *= (1.0 - severity_fraction)
            p50[36:60] *= (1.0 - severity_fraction)
            disturbance_desc = f"Solar dropout: {severity_fraction*100:.0f}% reduction from midday storm"

        elif scenario_type == "wind_gust_cutout":
            # High-speed wind cut-out between steps 20 and 40
            p10[20:40] *= 0.15
            p50[20:40] *= 0.20
            disturbance_desc = "Wind turbine aerodynamic cut-out due to storm gusts (> 25 m/s)"

        elif scenario_type == "demand_surge":
            # Fleet refueling rush: 2.5x demand spike between steps 64 and 80 (16:00 - 20:00)
            demand[64:80] *= (1.0 + severity_fraction * 2.0)
            disturbance_desc = f"Refueling demand surge: +{severity_fraction*200:.0f}% truck off-taker surge"

        elif scenario_type == "degraded_stack":
            health_mean = 0.78
            health_std = 0.09
            disturbance_desc = "Severe stack aging with high health uncertainty (mean 78%, std 9%)"
        else:
            disturbance_desc = "Standard baseline scenario"

        health_mean = 0.82 if scenario_type == "degraded_stack" else 0.94
        health_std = 0.08 if scenario_type == "degraded_stack" else 0.04

        mpc = ProposedConfidenceAwareMPC()
        res = mpc.optimize_horizon(
            renewable_p10_kw=p10,
            renewable_p50_kw=p50,
            c_electricity_eur_mwh=c_elec,
            demand_kg_h=demand,
            health_mean=health_mean,
            health_std=health_std,
            dt_hours=dt_h,
            artificial_timeout_s=2.0 if inject_solver_timeout else None,
        )

        sim_inputs = {
            "p10_kw": p10,
            "p50_kw": p50,
            "demand_kg_h": demand,
            "c_electricity_eur_mwh": c_elec,
        }
        scored = self.benchmark._simulate_and_score(
            res["p_stack_kw"], sim_inputs, dt_h, f"Stress Scenario: {scenario_type}", res["solve_time_ms"],
            extra_meta={
                "is_fallback_engaged": res["is_fallback_engaged"],
                "watchdog_status": res["watchdog_status"],
                "p_max_effective_kw": res["p_max_effective_kw"],
                "health_lcb": res["health_lcb"],
                "disturbance_description": disturbance_desc,
            }
        )

        return scored
