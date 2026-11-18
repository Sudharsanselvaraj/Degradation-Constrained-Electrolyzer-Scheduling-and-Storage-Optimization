"""
API Routes for Mathematical Predictive Optimization.
"""

from fastapi import APIRouter
from pydantic import BaseModel
from typing import Dict, List, Optional
import numpy as np

from backend.app.optimization.proposed_confidence_mpc import ProposedConfidenceAwareMPC

router = APIRouter(prefix="/api/optimizer", tags=["optimizer"])

_optimizer = ProposedConfidenceAwareMPC()


class OptimizeScheduleRequest(BaseModel):
    renewable_p10_kw: List[float]
    renewable_p50_kw: List[float]
    c_electricity_eur_mwh: List[float]
    demand_kg_h: List[float]
    health_mean: float = 0.94
    health_std: float = 0.04
    initial_storage_kg: float = 30.0
    dt_hours: float = 0.25


@router.post("/run")
def run_optimization(req: OptimizeScheduleRequest):
    """Execute Confidence-Aware Adaptive MPC optimization over the horizon."""
    p10 = np.array(req.renewable_p10_kw)
    p50 = np.array(req.renewable_p50_kw)
    c_elec = np.array(req.c_electricity_eur_mwh)
    demand = np.array(req.demand_kg_h)

    res = _optimizer.optimize_horizon(
        renewable_p10_kw=p10,
        renewable_p50_kw=p50,
        c_electricity_eur_mwh=c_elec,
        demand_kg_h=demand,
        health_mean=req.health_mean,
        health_std=req.health_std,
        initial_storage_kg=req.initial_storage_kg,
        dt_hours=req.dt_hours,
    )

    return {
        "status": "success",
        "p_stack_kw": res["p_stack_kw"].tolist() if isinstance(res["p_stack_kw"], np.ndarray) else res["p_stack_kw"],
        "p_grid_kw": res["p_grid_kw"].tolist() if isinstance(res["p_grid_kw"], np.ndarray) else res["p_grid_kw"],
        "m_tank_kg": res["m_tank_kg"].tolist() if isinstance(res["m_tank_kg"], np.ndarray) else res["m_tank_kg"],
        "shortfall_kg": res["shortfall_kg"].tolist() if isinstance(res["shortfall_kg"], np.ndarray) else res["shortfall_kg"],
        "p_max_effective_kw": res["p_max_effective_kw"],
        "health_lcb": res["health_lcb"],
        "uncertainty_gap_kw": res["uncertainty_gap_kw"],
        "solve_time_ms": res["solve_time_ms"],
        "is_fallback_engaged": res["is_fallback_engaged"],
        "watchdog_status": res["watchdog_status"],
    }
