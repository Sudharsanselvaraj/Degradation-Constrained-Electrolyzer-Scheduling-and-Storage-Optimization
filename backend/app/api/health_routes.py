"""
API Routes for Equipment Health, EKF Estimation, and Confidence Bounds.
"""

from fastapi import APIRouter
from pydantic import BaseModel
from typing import Dict, Optional

from backend.app.health_engine.anomaly_detector import ResidualAnomalyDetector
from backend.app.health_engine.confidence_engine import HealthConfidenceEngine
from backend.app.health_engine.ekf_estimator import PEMExtendedKalmanFilter

router = APIRouter(prefix="/api/health", tags=["equipment_health"])

_ekf = PEMExtendedKalmanFilter()
_confidence = HealthConfidenceEngine()
_anomaly = ResidualAnomalyDetector()


class HealthUpdateRequest(BaseModel):
    v_stack_meas_v: float
    t_meas_c: float
    current_a: float
    dt_s: float = 60.0


@router.post("/update")
def update_health_state(req: HealthUpdateRequest):
    """Run EKF predict & update steps and calculate dynamic safe envelope."""
    _ekf.predict(req.dt_s, req.current_a)
    ekf_res = _ekf.update(req.v_stack_meas_v, req.t_meas_c, req.current_a)

    # Dynamic envelope based on LCB
    envelope = _confidence.dynamic_safe_power_envelope(
        health_mean=ekf_res["health_mean"],
        health_std=ekf_res["health_std"],
        stack_temp_c=req.t_meas_c,
    )

    # Residual anomaly check
    # Predicted stack voltage = v_measured - residual
    v_pred = req.v_stack_meas_v - ekf_res["v_stack_residual"]
    anomaly_res = _anomaly.process_sample(req.v_stack_meas_v, v_pred)

    return {
        "ekf": ekf_res,
        "envelope": envelope,
        "anomaly": anomaly_res,
    }


@router.get("/current_status")
def get_current_health_status(health_mean: float = 0.94, health_std: float = 0.04, temp_c: float = 60.0):
    """Get current health estimate, confidence interval, and derated limit."""
    envelope = _confidence.dynamic_safe_power_envelope(
        health_mean=health_mean,
        health_std=health_std,
        stack_temp_c=temp_c,
    )
    return {"envelope": envelope}
