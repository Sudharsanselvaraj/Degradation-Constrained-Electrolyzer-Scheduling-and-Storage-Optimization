"""
Automated unit tests for 5 optimization baselines, watchdog fallback, and benchmark runner.
"""

import pytest
import numpy as np

from backend.app.experiments.benchmark_runner import BenchmarkRunner
from backend.app.experiments.ablation_runner import AblationStudyRunner
from backend.app.optimization.baseline_fixed import BaselineFixedSchedule
from backend.app.optimization.baseline_deterministic import BaselineDeterministicMPC
from backend.app.optimization.baseline_degradation import BaselineDegradationAwareMPC
from backend.app.optimization.baseline_stochastic import BaselineStochasticMPC
from backend.app.optimization.proposed_confidence_mpc import ProposedConfidenceAwareMPC
from backend.app.optimization.fallback_policy import SupervisoryFallbackWatchdog


def test_baseline_fixed():
    """Verify Baseline 1 fixed schedule generation."""
    b1 = BaselineFixedSchedule()
    res = b1.plan_horizon(num_steps=96)
    assert len(res["p_stack_kw"]) == 96
    assert np.all(res["p_stack_kw"] >= 0.0)


def test_baseline_deterministic_solve():
    """Verify Baseline 2 solves successfully without errors."""
    b2 = BaselineDeterministicMPC()
    p50 = np.full(24, 60.0)
    c_elec = np.full(24, 70.0)
    demand = np.full(24, 2.5)

    res = b2.optimize_horizon(p_renewable_p50_kw=p50, c_electricity_eur_mwh=c_elec, demand_kg_h=demand, dt_hours=1.0)
    assert res["success"] is True
    assert len(res["p_stack_kw"]) == 24
    assert res["solve_time_ms"] < 200.0


def test_baseline_degradation_solve():
    """Verify Baseline 3 solves with degradation penalties."""
    b3 = BaselineDegradationAwareMPC()
    p50 = np.full(24, 60.0)
    c_elec = np.full(24, 70.0)
    demand = np.full(24, 2.5)

    res = b3.optimize_horizon(p_renewable_p50_kw=p50, c_electricity_eur_mwh=c_elec, demand_kg_h=demand, dt_hours=1.0)
    assert res["success"] is True
    assert len(res["p_stack_kw"]) == 24


def test_baseline_stochastic_solve():
    """Verify Baseline 4 solves across multi-scenario matrix."""
    b4 = BaselineStochasticMPC()
    scenarios = np.random.uniform(40, 80, (5, 24))
    c_elec = np.full(24, 70.0)
    demand = np.full(24, 2.5)

    res = b4.optimize_horizon(renewable_scenarios_kw=scenarios, c_electricity_eur_mwh=c_elec, demand_kg_h=demand, dt_hours=1.0)
    assert res["success"] is True
    assert len(res["p_stack_kw"]) == 24


def test_proposed_confidence_mpc():
    """Verify Proposed Confidence-Aware MPC derives LCB envelope and solves."""
    mpc = ProposedConfidenceAwareMPC()
    p10 = np.full(24, 45.0)
    p50 = np.full(24, 65.0)
    c_elec = np.full(24, 70.0)
    demand = np.full(24, 2.5)

    # Test with healthy stack
    res_healthy = mpc.optimize_horizon(
        renewable_p10_kw=p10, renewable_p50_kw=p50, c_electricity_eur_mwh=c_elec, demand_kg_h=demand,
        health_mean=0.98, health_std=0.02, dt_hours=1.0
    )
    assert res_healthy["success"] is True
    assert res_healthy["p_max_effective_kw"] > 80.0
    assert not res_healthy["is_fallback_engaged"]

    # Test with degraded uncertain stack: p_max_effective must derate!
    res_degraded = mpc.optimize_horizon(
        renewable_p10_kw=p10, renewable_p50_kw=p50, c_electricity_eur_mwh=c_elec, demand_kg_h=demand,
        health_mean=0.75, health_std=0.08, dt_hours=1.0
    )
    assert res_degraded["p_max_effective_kw"] < res_healthy["p_max_effective_kw"]


def test_watchdog_timeout_fallback():
    """Verify that watchdog engages deterministic safe fallback when solve timeout or stale telemetry occurs."""
    watchdog = SupervisoryFallbackWatchdog()
    optimal_plan = np.full(24, 90.0)

    # Simulated timeout (> 1.5s)
    dispatched, is_fallback, reason = watchdog.evaluate_and_dispatch(
        solver_success=True,
        solve_time_s=2.1,  # Exceeded 1.5s
        telemetry_age_s=2.0,
        optimal_schedule_kw=optimal_plan,
        available_renewable_kw=60.0,
    )
    assert is_fallback is True
    assert "SOLVER_TIMEOUT" in reason
    # Safe cap is 50 kW
    assert np.all(dispatched <= 50.0)
