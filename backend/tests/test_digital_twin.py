"""
Automated unit tests for PEM electrochemical model, thermal ODE, Faradaic yield, and plant simulator.
"""

import pytest
import numpy as np

from backend.app.digital_twin.electrochemical_model import (
    PEMCellModel,
    PEMElectrochemicalParams,
    PEMStackModel,
)
from backend.app.digital_twin.thermal_model import PEMThermalModel, PEMThermalParams
from backend.app.digital_twin.hydrogen_model import HydrogenProductionModel
from backend.app.digital_twin.plant_simulator import OperatingState, PEMPlantSimulator


def test_cell_model_physics():
    """Verify electrochemical cell potential equations."""
    cell = PEMCellModel()

    # 1. Reversible potential at 60 °C (333.15 K) should be approx 1.19 - 1.20 V
    e_rev = cell.reversible_potential(333.15, p_h2_bar=1.0, p_o2_bar=1.0)
    assert 1.18 < e_rev < 1.21

    # 2. Cell voltage at zero current must equal reversible potential
    v_zero = cell.cell_voltage(0.0, temp_k=333.15)
    assert abs(v_zero - e_rev) < 1e-4

    # 3. Monotonic polarization curve: dV/dj > 0
    j_vals = [0.1, 0.5, 1.0, 1.5, 2.0]
    voltages = [cell.cell_voltage(j, temp_k=333.15) for j in j_vals]
    for k in range(len(voltages) - 1):
        assert voltages[k + 1] > voltages[k]
        # At 2.0 A/cm², voltage should be physically typical for PEM (1.7 - 2.2 V)
        assert 1.4 < voltages[k] < 2.5


def test_stack_model_distribution():
    """Verify multi-cell voltage distribution across 30 cells in the stack."""
    stack = PEMStackModel()
    res = stack.calculate_stack_state(current_a=300.0, temp_c=60.0)

    assert "cell_voltages_v" in res
    assert len(res["cell_voltages_v"]) == 30
    assert abs(res["v_stack_v"] - sum(res["cell_voltages_v"])) < 1e-3
    assert res["power_kw"] > 0.0
    assert res["current_density_a_cm2"] == 1.0  # 300 A / 300 cm² = 1.0 A/cm²


def test_thermal_model_energy_balance():
    """Verify lumped thermal ODE integration under heating and cooling."""
    thermal = PEMThermalModel(initial_temp_c=25.0)

    # Apply 50 kW electrical power at 300 A (V_stack ~ 55 V) for 300 seconds
    res = thermal.step(current_a=300.0, v_stack_v=55.0, dt_s=300.0)
    # Stack temperature must rise due to internal overpotentials
    assert res["temperature_c"] > 25.0
    assert res["q_gen_kw"] > 0.0


def test_hydrogen_faradaic_production():
    """Verify Faraday's law of electrolysis and specific energy consumption."""
    h2_model = HydrogenProductionModel(num_cells=30)
    # At 300 A, 30 cells
    res = h2_model.calculate_production(current_a=300.0, j_a_cm2=1.0, power_kw=15.0, temp_c=60.0)

    assert res["eta_faradaic"] > 0.95
    assert res["h2_mass_flow_kg_h"] > 0.3  # Theoretical is ~0.338 kg/h
    assert 40.0 < res["sec_kwh_kg"] < 60.0  # Commercial PEM SEC range is ~48 - 56 kWh/kg
    assert 60.0 < res["hhv_efficiency_pct"] < 90.0


def test_plant_simulator_states():
    """Verify supervisory plant state transitions and turndown constraints."""
    sim = PEMPlantSimulator(nominal_power_kw=100.0, min_load_fraction=0.10)
    assert sim.state == OperatingState.OFF

    # Command 50 kW
    out = sim.step(target_power_kw=50.0, dt_s=60.0)
    assert out["state"] in [OperatingState.COLD_START, OperatingState.NORMAL_PRODUCTION, OperatingState.RAMPING]
    assert out["power_total_kw"] > 0.0
    assert out["h2_flow_kg_h"] > 0.0
    assert out["v_stack1_v"] > 40.0
    assert out["v_stack2_v"] > 40.0

    # Command 0 kW
    out_off = sim.step(target_power_kw=0.0, dt_s=60.0)
    assert out_off["power_total_kw"] == 0.0
    assert out_off["state"] in [OperatingState.SHUTDOWN, OperatingState.WARM_STANDBY]
