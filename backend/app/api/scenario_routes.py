"""
API Routes for Scenario Studio What-If Experimentation.
"""

from fastapi import APIRouter
from pydantic import BaseModel
from typing import Dict, Optional

from backend.app.experiments.stress_tester import DigitalTwinStressTester

router = APIRouter(prefix="/api/scenarios", tags=["scenarios"])

_stress_tester = DigitalTwinStressTester()


class ScenarioRunRequest(BaseModel):
    solar_availability_pct: float = 75.0
    wind_availability_pct: float = 35.0
    initial_health_pct: float = 90.0
    hydrogen_demand_target_kg: float = 65.0
    uncertainty_level: str = "moderate" # "low", "moderate", "high"
    scenario_type: str = "custom"       # "solar_dropout", "wind_gust_cutout", "demand_surge", "degraded_stack", "custom"
    inject_timeout: bool = False


@router.post("/run")
def run_scenario(req: ScenarioRunRequest):
    """Run configured virtual plant what-if scenario and return timeseries and KPIs."""
    severity = 0.3 if req.uncertainty_level == "low" else (0.5 if req.uncertainty_level == "moderate" else 0.75)
    scenario_name = req.scenario_type if req.scenario_type != "custom" else "solar_dropout"

    res = _stress_tester.run_stress_test(
        scenario_type=scenario_name,
        severity_fraction=severity,
        inject_solver_timeout=req.inject_timeout,
    )
    return {
        "status": "success",
        "scenario_config": req.model_dump(),
        "results": res,
    }
