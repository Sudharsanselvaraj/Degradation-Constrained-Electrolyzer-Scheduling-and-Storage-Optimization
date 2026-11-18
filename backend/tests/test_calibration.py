"""
Automated unit tests for calibrated parameters and verification against thresholds.
"""

from pathlib import Path
import json
import pytest

from backend.app.digital_twin.electrochemical_model import PEMCellModel, PEMElectrochemicalParams
from backend.app.digital_twin.calibration import CALIBRATED_PARAMS_FILE


def test_calibrated_parameters_file():
    """Verify that calibration artifact file exists and satisfies research criteria."""
    assert CALIBRATED_PARAMS_FILE.exists()
    with open(CALIBRATED_PARAMS_FILE, "r", encoding="utf-8") as f:
        data = json.load(f)

    assert data["success"] is True
    assert data["calibration_points_count"] >= 50

    metrics = data["metrics"]
    # Required threshold: Cell Voltage RMSE < 30 mV / cell
    assert metrics["cell_voltage_rmse_mv"] < 30.0
    # Required threshold: R² > 0.90
    assert metrics["cell_voltage_r2"] > 0.90
    # Required threshold: Total stack RMSE < 1.0 V
    assert metrics["stack_voltage_rmse_v"] < 1.0

    params = data["parameters"]
    assert 0.04 <= params["r_mem_0_ohm_cm2"] <= 0.20
    assert 1e-5 <= params["j0_ref_a_cm2"] <= 1e-1
    assert 0.3 <= params["alpha_ct"] <= 0.8


def test_calibrated_model_behavior():
    """Verify calibrated model predictions under standard operating conditions."""
    with open(CALIBRATED_PARAMS_FILE, "r", encoding="utf-8") as f:
        data = json.load(f)
    p = data["parameters"]

    params = PEMElectrochemicalParams(
        r_mem_0=p["r_mem_0_ohm_cm2"],
        j0_ref=p["j0_ref_a_cm2"],
        alpha_ct=p["alpha_ct"],
        b_conc=p["b_conc_v"],
        num_cells=30,
        cell_active_area_cm2=300.0,
    )
    cell = PEMCellModel(params)

    # 1.0 A/cm² at 60 °C (333.15 K) should yield typical commercial PEM cell voltage ~ 1.55 - 1.85 V
    v_1 = cell.cell_voltage(1.0, temp_k=333.15)
    assert 1.50 < v_1 < 1.90

    # 2.0 A/cm² should be higher than 1.0 A/cm²
    v_2 = cell.cell_voltage(2.0, temp_k=333.15)
    assert v_2 > v_1
    assert v_2 < 2.30
