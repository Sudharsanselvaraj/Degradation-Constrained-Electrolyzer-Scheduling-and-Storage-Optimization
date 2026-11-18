"""
Scientific Benchmark Runner: Compares all 5 competing scheduling algorithms under identical conditions.
Baselines:
1. Fixed Schedule
2. Renewable-Aware Deterministic MPC
3. Degradation-Aware MPC
4. Stochastic MPC
5. Proposed Confidence-Aware Adaptive MPC
"""

import time
from typing import Dict, List, Optional
import numpy as np
import pandas as pd

from backend.app.forecasting.open_meteo_client import OpenMeteoWeatherClient
from backend.app.forecasting.quantile_forecaster import ProbabilisticRenewableForecaster
from backend.app.forecasting.scenario_generator import RenewableScenarioGenerator
from backend.app.health_engine.degradation_model import PEMDegradationModel
from backend.app.optimization.baseline_fixed import BaselineFixedSchedule
from backend.app.optimization.baseline_deterministic import BaselineDeterministicMPC
from backend.app.optimization.baseline_degradation import BaselineDegradationAwareMPC
from backend.app.optimization.baseline_stochastic import BaselineStochasticMPC
from backend.app.optimization.proposed_confidence_mpc import ProposedConfidenceAwareMPC
from backend.app.storage.demand_model import HydrogenDemandModel
from backend.app.storage.tank_model import HydrogenStorageTank


class BenchmarkRunner:
    """Orchestrates head-to-head empirical comparison across the 5 competing methods."""

    def __init__(self, horizon_steps: int = 96, dt_minutes: int = 15):
        self.horizon_steps = horizon_steps
        self.dt_minutes = dt_minutes
        self.dt_hours = dt_minutes / 60.0

        self.weather_client = OpenMeteoWeatherClient()
        self.forecaster = ProbabilisticRenewableForecaster()
        self.scenario_gen = RenewableScenarioGenerator()
        self.demand_model = HydrogenDemandModel(daily_demand_target_kg=65.0)

    def generate_benchmark_inputs(self, random_seed: int = 42) -> Dict:
        """Create synchronized weather, renewable quantiles, demand, and electricity pricing inputs."""
        weather_df = self.weather_client._generate_synthetic_weather_profile(num_hours=int(self.horizon_steps * self.dt_hours) + 12)
        # Resample to dt_minutes if needed
        quantiles = self.forecaster.predict_quantiles(weather_df.iloc[:self.horizon_steps])

        p10 = quantiles["p10_kw"]
        p50 = quantiles["p50_kw"]
        p90 = quantiles["p90_kw"]
        scenarios = self.scenario_gen.generate_scenarios(p10, p50, p90, num_scenarios=5)

        # Dynamic German day-ahead spot electricity tariff (€/MWh):
        # Diurnal shape peaking in morning (08:00) and evening (19:00), dipping in midday due to solar
        step_hours = (np.arange(self.horizon_steps) * self.dt_hours) % 24.0
        c_base = 65.0 + 35.0 * np.sin(np.pi * (step_hours - 5.0) / 12.0)
        c_midday_dip = -25.0 * np.exp(-0.5 * ((step_hours - 13.0) / 2.0) ** 2)
        c_electricity = np.maximum(10.0, c_base + c_midday_dip + np.random.normal(0, 4.0, self.horizon_steps))

        demand = self.demand_model.generate_profile(num_steps=self.horizon_steps, dt_minutes=self.dt_minutes, profile_type="mobility", random_seed=random_seed)

        return {
            "p10_kw": p10,
            "p50_kw": p50,
            "p90_kw": p90,
            "scenarios_kw": scenarios,
            "c_electricity_eur_mwh": c_electricity,
            "demand_kg_h": demand,
        }

    def run_benchmark(
        self,
        initial_health_mean: float = 0.92,
        initial_health_std: float = 0.05,
        inputs: Optional[Dict] = None,
    ) -> Dict:
        """Execute all 5 baselines and compile multi-objective engineering metrics."""
        data = inputs or self.generate_benchmark_inputs()
        p10 = data["p10_kw"]
        p50 = data["p50_kw"]
        p90 = data["p90_kw"]
        scenarios = data["scenarios_kw"]
        c_elec = data["c_electricity_eur_mwh"]
        demand = data["demand_kg_h"]

        dt_h = self.dt_hours
        results = {}

        # 1. Baseline 1: Fixed Schedule
        b1 = BaselineFixedSchedule(nominal_power_kw=100.0)
        res1 = b1.plan_horizon(num_steps=self.horizon_steps, dt_minutes=self.dt_minutes)
        results["Baseline 1 (Fixed)"] = self._simulate_and_score(res1["p_stack_kw"], data, dt_h, "Baseline 1 (Fixed Schedule)", res1["solve_time_ms"])

        # 2. Baseline 2: Renewable-Aware Deterministic MPC
        b2 = BaselineDeterministicMPC(nominal_power_kw=100.0)
        res2 = b2.optimize_horizon(p_renewable_p50_kw=p50, c_electricity_eur_mwh=c_elec, demand_kg_h=demand, dt_hours=dt_h)
        results["Baseline 2 (Deterministic)"] = self._simulate_and_score(res2["p_stack_kw"], data, dt_h, "Baseline 2 (Deterministic MPC)", res2["solve_time_ms"])

        # 3. Baseline 3: Degradation-Aware MPC
        b3 = BaselineDegradationAwareMPC(nominal_power_kw=100.0)
        res3 = b3.optimize_horizon(p_renewable_p50_kw=p50, c_electricity_eur_mwh=c_elec, demand_kg_h=demand, dt_hours=dt_h, estimated_health=initial_health_mean)
        results["Baseline 3 (Degradation-Aware)"] = self._simulate_and_score(res3["p_stack_kw"], data, dt_h, "Baseline 3 (Degradation-Aware MPC)", res3["solve_time_ms"])

        # 4. Baseline 4: Stochastic MPC
        b4 = BaselineStochasticMPC(nominal_power_kw=100.0)
        res4 = b4.optimize_horizon(renewable_scenarios_kw=scenarios, c_electricity_eur_mwh=c_elec, demand_kg_h=demand, dt_hours=dt_h)
        results["Baseline 4 (Stochastic)"] = self._simulate_and_score(res4["p_stack_kw"], data, dt_h, "Baseline 4 (Stochastic MPC)", res4["solve_time_ms"])

        # 5. Proposed: Confidence-Aware Adaptive MPC
        b5 = ProposedConfidenceAwareMPC(nominal_power_kw=100.0)
        res5 = b5.optimize_horizon(
            renewable_p10_kw=p10,
            renewable_p50_kw=p50,
            c_electricity_eur_mwh=c_elec,
            demand_kg_h=demand,
            health_mean=initial_health_mean,
            health_std=initial_health_std,
            dt_hours=dt_h,
        )
        results["Proposed (Confidence-Adaptive)"] = self._simulate_and_score(
            res5["p_stack_kw"], data, dt_h, "Proposed (Confidence-Adaptive MPC)", res5["solve_time_ms"],
            extra_meta={"p_max_effective_kw": res5["p_max_effective_kw"], "health_lcb": res5["health_lcb"], "is_fallback": res5["is_fallback_engaged"]}
        )

        return {
            "comparison_table": self._generate_comparison_table(results),
            "algorithm_results": results,
            "inputs": {
                "horizon_steps": self.horizon_steps,
                "dt_minutes": self.dt_minutes,
                "demand_total_kg": float(np.sum(demand * dt_h)),
                "p50_mean_kw": float(np.mean(p50)),
                "p10_mean_kw": float(np.mean(p10)),
            },
        }

    def _simulate_and_score(
        self,
        p_stack_kw: np.ndarray,
        data: Dict,
        dt_hours: float,
        algorithm_name: str,
        solve_time_ms: float,
        extra_meta: Optional[Dict] = None,
    ) -> Dict:
        """Simulate dispatched power through physical storage and degradation models to evaluate actual realized KPIs."""
        p_renew_real = data["p50_kw"]  # Realized renewable generation
        demand_h = data["demand_kg_h"]
        c_elec = data["c_electricity_eur_mwh"]
        N = len(p_stack_kw)

        tank = HydrogenStorageTank(initial_soc=0.50)
        deg_model = PEMDegradationModel()

        total_prod_kg = 0.0
        total_grid_kwh = 0.0
        total_cost_eur = 0.0
        total_shortfall_kg = 0.0
        reserve_violations = 0

        p_grid_arr = []
        soc_arr = []
        pressure_arr = []

        h2_yield = 0.0195  # ~51.3 kWh/kg nominal SEC

        for k in range(N):
            p_cmd = float(p_stack_kw[k])
            p_ren = float(p_renew_real[k])

            # Grid import needed
            p_grid = max(0.0, p_cmd - p_ren)
            p_grid_arr.append(p_grid)
            cost_step = (c_elec[k] / 1000.0) * p_grid * dt_hours
            total_cost_eur += cost_step
            total_grid_kwh += (p_grid * dt_hours)

            # Hydrogen produced
            h2_prod = p_cmd * h2_yield * dt_hours
            total_prod_kg += h2_prod

            # Storage dynamics
            step_res = tank.step(h2_inflow_kg=h2_prod, h2_demand_kg=demand_h[k] * dt_hours, dt_s=dt_hours * 3600.0)
            total_shortfall_kg += step_res["shortfall_kg"]
            if step_res["is_reserve_violated"]:
                reserve_violations += 1
            soc_arr.append(step_res["state_of_charge"])
            pressure_arr.append(step_res["pressure_bar"])

            # Degradation exposure
            j_val = p_cmd / (60.0 * 300.0 * 1.8e-3) # Approx current density A/cm²
            deg_model.compute_stress_rate(j_a_cm2=j_val, temp_c=60.0, dt_s=dt_hours * 3600.0)

        lcoh_proxy = total_cost_eur / total_prod_kg if total_prod_kg > 0.1 else 999.0
        demand_fulfilled_pct = 100.0 * (1.0 - total_shortfall_kg / max(np.sum(demand_h * dt_hours), 0.1))

        res_dict = {
            "algorithm": algorithm_name,
            "total_h2_produced_kg": float(total_prod_kg),
            "total_grid_kwh": float(total_grid_kwh),
            "electricity_cost_eur": float(total_cost_eur),
            "lcoh_eur_per_kg": float(lcoh_proxy),
            "demand_fulfilled_pct": float(demand_fulfilled_pct),
            "shortfall_kg": float(total_shortfall_kg),
            "reserve_violations_count": int(reserve_violations),
            "cumulative_degradation_exposure": float(deg_model.cumulative_damage * 1000.0), # milli-stress
            "final_state_of_health": float(1.0 - deg_model.cumulative_damage),
            "solve_time_ms": float(solve_time_ms),
            "p_stack_kw": p_stack_kw.tolist(),
            "p_grid_kw": p_grid_arr,
            "soc_history": soc_arr,
            "pressure_history_bar": pressure_arr,
        }
        if extra_meta:
            res_dict.update(extra_meta)
        return res_dict

    def _generate_comparison_table(self, results: Dict[str, Dict]) -> List[Dict]:
        """Format metrics into a clean comparative summary table."""
        table = []
        for name, r in results.items():
            table.append({
                "Algorithm": name,
                "H2 Produced [kg]": f"{r['total_h2_produced_kg']:.2f}",
                "Grid Energy [kWh]": f"{r['total_grid_kwh']:.1f}",
                "Elec Cost [€]": f"{r['electricity_cost_eur']:.2f}",
                "LCOH Proxy [€/kg]": f"{r['lcoh_eur_per_kg']:.2f}",
                "Demand Fulfillment [%]": f"{r['demand_fulfilled_pct']:.1f}%",
                "Reserve Violations": r["reserve_violations_count"],
                "Degradation Exposure (milli)": f"{r['cumulative_degradation_exposure']:.2f}",
                "Solve Time [ms]": f"{r['solve_time_ms']:.2f}",
            })
        return table
