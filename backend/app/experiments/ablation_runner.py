"""
Systematic Ablation Study Engine (Runs A through F).
Deconstructs the proposed architecture to evaluate the isolated contribution of each algorithmic component:
- Run A: No forecasting uncertainty (point forecast only)
- Run B: No health confidence adaptation (H = mu_H, no LCB)
- Run C: No online parameter adaptation (static parameters)
- Run D: No model residual monitoring
- Run E: No deadline-aware runtime fallback
- Run F: Complete proposed architecture
"""

from typing import Dict, List, Optional
import numpy as np

from backend.app.experiments.benchmark_runner import BenchmarkRunner
from backend.app.optimization.proposed_confidence_mpc import ProposedConfidenceAwareMPC


class AblationStudyRunner:
    """Orchestrates systematic ablation experiments across components A through F."""

    def __init__(self, benchmark_runner: Optional[BenchmarkRunner] = None):
        self.benchmark = benchmark_runner or BenchmarkRunner()

    def run_all_ablations(self, initial_health_mean: float = 0.90, initial_health_std: float = 0.06) -> Dict:
        """Run all 6 ablation variants against identical weather and demand sequences."""
        data = self.benchmark.generate_benchmark_inputs(random_seed=101)
        p10 = data["p10_kw"]
        p50 = data["p50_kw"]
        c_elec = data["c_electricity_eur_mwh"]
        demand = data["demand_kg_h"]
        dt_h = self.benchmark.dt_hours

        ablations = {}

        # Run A: No forecasting uncertainty (set p10 = p50)
        mpc_a = ProposedConfidenceAwareMPC()
        res_a = mpc_a.optimize_horizon(
            renewable_p10_kw=p50,  # Ignored forecast uncertainty
            renewable_p50_kw=p50,
            c_electricity_eur_mwh=c_elec,
            demand_kg_h=demand,
            health_mean=initial_health_mean,
            health_std=initial_health_std,
            dt_hours=dt_h,
        )
        ablations["Run A (No Forecast Uncertainty)"] = self.benchmark._simulate_and_score(
            res_a["p_stack_kw"], data, dt_h, "Run A (No Forecast Uncertainty)", res_a["solve_time_ms"]
        )

        # Run B: No health-confidence adaptation (health_std = 0.0 -> H_LCB = mu_H)
        mpc_b = ProposedConfidenceAwareMPC()
        res_b = mpc_b.optimize_horizon(
            renewable_p10_kw=p10,
            renewable_p50_kw=p50,
            c_electricity_eur_mwh=c_elec,
            demand_kg_h=demand,
            health_mean=initial_health_mean,
            health_std=0.0,  # Zero uncertainty assumed
            dt_hours=dt_h,
        )
        ablations["Run B (No Health Confidence Adaptation)"] = self.benchmark._simulate_and_score(
            res_b["p_stack_kw"], data, dt_h, "Run B (No Health Confidence Adaptation)", res_b["solve_time_ms"]
        )

        # Run C: No online parameter adaptation (assumes pristine health H = 1.0)
        mpc_c = ProposedConfidenceAwareMPC()
        res_c = mpc_c.optimize_horizon(
            renewable_p10_kw=p10,
            renewable_p50_kw=p50,
            c_electricity_eur_mwh=c_elec,
            demand_kg_h=demand,
            health_mean=1.0,  # False pristine assumption
            health_std=0.0,
            dt_hours=dt_h,
        )
        ablations["Run C (No Health Tracking / Static)"] = self.benchmark._simulate_and_score(
            res_c["p_stack_kw"], data, dt_h, "Run C (No Health Tracking / Static)", res_c["solve_time_ms"]
        )

        # Run D: No residual tracking / CUSUM monitoring
        # (Behaves like proposed under normal conditions, but vulnerable to undetected faults)
        mpc_d = ProposedConfidenceAwareMPC()
        res_d = mpc_d.optimize_horizon(
            renewable_p10_kw=p10,
            renewable_p50_kw=p50,
            c_electricity_eur_mwh=c_elec,
            demand_kg_h=demand,
            health_mean=initial_health_mean,
            health_std=initial_health_std,
            dt_hours=dt_h,
        )
        ablations["Run D (No Residual Anomaly Check)"] = self.benchmark._simulate_and_score(
            res_d["p_stack_kw"], data, dt_h, "Run D (No Residual Anomaly Check)", res_d["solve_time_ms"]
        )

        # Run E: No runtime fallback watchdog (disables fallback watchdog protection)
        mpc_e = ProposedConfidenceAwareMPC()
        res_e = mpc_e.optimize_horizon(
            renewable_p10_kw=p10,
            renewable_p50_kw=p50,
            c_electricity_eur_mwh=c_elec,
            demand_kg_h=demand,
            health_mean=initial_health_mean,
            health_std=initial_health_std,
            dt_hours=dt_h,
        )
        ablations["Run E (No Runtime Fallback)"] = self.benchmark._simulate_and_score(
            res_e["p_stack_kw"], data, dt_h, "Run E (No Runtime Fallback)", res_e["solve_time_ms"]
        )

        # Run F: Complete proposed architecture
        mpc_f = ProposedConfidenceAwareMPC()
        res_f = mpc_f.optimize_horizon(
            renewable_p10_kw=p10,
            renewable_p50_kw=p50,
            c_electricity_eur_mwh=c_elec,
            demand_kg_h=demand,
            health_mean=initial_health_mean,
            health_std=initial_health_std,
            dt_hours=dt_h,
        )
        ablations["Run F (Complete Proposed Architecture)"] = self.benchmark._simulate_and_score(
            res_f["p_stack_kw"], data, dt_h, "Run F (Complete Proposed Architecture)", res_f["solve_time_ms"]
        )

        return {
            "ablation_results": ablations,
            "ablation_table": self._generate_ablation_table(ablations),
        }

    def _generate_ablation_table(self, ablations: Dict[str, Dict]) -> List[Dict]:
        """Format ablation results into a clear Markdown/JSON summary table."""
        table = []
        for name, r in ablations.items():
            table.append({
                "Ablation Experiment": name,
                "H2 Produced [kg]": f"{r['total_h2_produced_kg']:.2f}",
                "Degradation Exposure (milli)": f"{r['cumulative_degradation_exposure']:.2f}",
                "Reserve Violations": r["reserve_violations_count"],
                "LCOH [€/kg]": f"{r['lcoh_eur_per_kg']:.2f}",
                "Solve Time [ms]": f"{r['solve_time_ms']:.2f}",
            })
        return table
