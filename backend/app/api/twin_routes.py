"""
API Routes for Digital Twin Electrochemical and Thermal Simulation.
"""

from fastapi import APIRouter
from pydantic import BaseModel
from typing import Dict, List, Optional
import numpy as np

from backend.app.digital_twin.electrochemical_model import PEMCellModel, PEMElectrochemicalParams, PEMStackModel
from backend.app.digital_twin.hydrogen_model import HydrogenProductionModel
from backend.app.digital_twin.plant_simulator import PEMPlantSimulator

router = APIRouter(prefix="/api/twin", tags=["digital_twin"])

_simulator_instance = PEMPlantSimulator()


class StepRequest(BaseModel):
    target_power_kw: float = 50.0
    dt_s: float = 60.0
    coolant_temp_in_c: float = 45.0
    ambient_temp_c: float = 22.0


@router.post("/step")
def step_plant(req: StepRequest):
    """Advance digital twin plant simulation forward by dt_s seconds."""
    state = _simulator_instance.step(
        target_power_kw=req.target_power_kw,
        dt_s=req.dt_s,
        coolant_temp_in_c=req.coolant_temp_in_c,
        ambient_temp_c=req.ambient_temp_c,
    )
    return {"status": "success", "state": state}


@router.get("/polarization_curve")
def get_synthetic_polarization_curve(temp_c: float = 60.0, num_points: int = 50):
    """Generate high-resolution polarization curve from calibrated physics model."""
    stack = PEMStackModel()
    h2_model = HydrogenProductionModel()
    j_arr = np.linspace(0.01, 2.2, num_points)
    curve = []

    for j in j_arr:
        current_a = float(j * 300.0)
        st = stack.calculate_stack_state(current_a, temp_c=temp_c)
        h2 = h2_model.calculate_production(current_a, j, st["power_kw"], temp_c=temp_c)
        curve.append({
            "current_density_a_cm2": float(j),
            "current_a": float(current_a),
            "v_cell_mean_v": st["v_cell_mean_v"],
            "v_stack_v": st["v_stack_v"],
            "e_rev_v": st["e_rev_v"],
            "eta_act_v": st["eta_act_v"],
            "eta_ohm_v": st["eta_ohm_v"],
            "eta_conc_v": st["eta_conc_v"],
            "power_kw": st["power_kw"],
            "h2_flow_kg_h": h2["h2_mass_flow_kg_h"],
            "sec_kwh_kg": h2["sec_kwh_kg"],
            "eta_faradaic": h2["eta_faradaic"],
        })

    return {"temp_c": temp_c, "curve": curve}
