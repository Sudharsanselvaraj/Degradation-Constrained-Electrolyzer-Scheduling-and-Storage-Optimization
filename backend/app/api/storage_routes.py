"""
API Routes for Hydrogen Storage and Compression.
"""

from fastapi import APIRouter
from pydantic import BaseModel

from backend.app.storage.compressor_model import HydrogenCompressorModel
from backend.app.storage.demand_model import HydrogenDemandModel
from backend.app.storage.tank_model import HydrogenStorageTank

router = APIRouter(prefix="/api/storage", tags=["storage"])

_tank = HydrogenStorageTank()
_compressor = HydrogenCompressorModel()
_demand_model = HydrogenDemandModel()


class StorageStepRequest(BaseModel):
    h2_inflow_kg: float
    h2_demand_kg: float
    dt_s: float = 900.0


@router.post("/step")
def simulate_storage_step(req: StorageStepRequest):
    """Advance storage inventory state."""
    res = _tank.step(h2_inflow_kg=req.h2_inflow_kg, h2_demand_kg=req.h2_demand_kg, dt_s=req.dt_s)
    # Compression power for inflow
    mass_flow_h = (req.h2_inflow_kg / req.dt_s) * 3600.0
    comp_res = _compressor.calculate_compression_power(mass_flow_kg_h=mass_flow_h, p_outlet_bar=res["pressure_bar"])
    res["compression_power_kw"] = comp_res["power_kw"]
    res["compression_specific_work_kwh_kg"] = comp_res["specific_work_kwh_kg"]
    return res


@router.get("/demand_profile")
def get_demand_profile(profile_type: str = "mobility", daily_target_kg: float = 65.0, steps: int = 96):
    """Generate off-taker demand trajectory."""
    model = HydrogenDemandModel(daily_demand_target_kg=daily_target_kg)
    profile = model.generate_profile(num_steps=steps, dt_minutes=15, profile_type=profile_type)
    return {
        "profile_type": profile_type,
        "daily_target_kg": daily_target_kg,
        "steps": steps,
        "demand_kg_h": profile.tolist(),
    }
