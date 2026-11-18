"""
Integrated Virtual Plant Simulator for the 100 kW PEM Electrolyzer.
Coordinates dual stacks, discrete operating state machine, thermal dynamics, and hydrogen yield.
"""

from enum import Enum
from typing import Dict, List, Optional, Union
import numpy as np

from backend.app.digital_twin.electrochemical_model import PEMElectrochemicalParams, PEMStackModel
from backend.app.digital_twin.hydrogen_model import FaradaicParams, HydrogenProductionModel
from backend.app.digital_twin.thermal_model import PEMThermalModel, PEMThermalParams


class OperatingState(str, Enum):
    OFF = "OFF"
    COLD_START = "COLD_START"
    WARM_STANDBY = "WARM_STANDBY"
    NORMAL_PRODUCTION = "NORMAL_PRODUCTION"
    RAMPING = "RAMPING"
    SHUTDOWN = "SHUTDOWN"
    EMERGENCY_TRIP = "EMERGENCY_TRIP"


class PEMPlantSimulator:
    """Supervisory simulator managing two 50 kW PEM stacks (100 kW plant total) and physical constraints."""

    def __init__(
        self,
        nominal_power_kw: float = 100.0,
        min_load_fraction: float = 0.10,   # 10% minimum turndown load (10 kW)
        max_ramp_rate_pct_s: float = 20.0, # 20% / second ramp rate limit
        initial_temp_c: float = 25.0,
    ):
        self.nominal_power_kw = nominal_power_kw
        self.min_load_kw = nominal_power_kw * min_load_fraction
        self.max_ramp_kw_s = nominal_power_kw * (max_ramp_rate_pct_s / 100.0)

        # Dual stacks: Stack 1 & Stack 2 (30 cells each)
        self.stack1_params = PEMElectrochemicalParams(num_cells=30, cell_active_area_cm2=300.0)
        self.stack2_params = PEMElectrochemicalParams(num_cells=30, cell_active_area_cm2=300.0)
        self.stack1 = PEMStackModel(self.stack1_params)
        self.stack2 = PEMStackModel(self.stack2_params)

        # Thermal models for each stack
        self.thermal1 = PEMThermalModel(PEMThermalParams(num_cells=30), initial_temp_c=initial_temp_c)
        self.thermal2 = PEMThermalModel(PEMThermalParams(num_cells=30), initial_temp_c=initial_temp_c)

        # Hydrogen production models
        self.h2_model1 = HydrogenProductionModel(num_cells=30)
        self.h2_model2 = HydrogenProductionModel(num_cells=30)

        # State tracking
        self.state = OperatingState.OFF
        self.current_power_kw = 0.0
        self.total_h2_produced_kg = 0.0
        self.total_energy_kwh = 0.0
        self.startup_count = 0
        self.operating_hours = 0.0

    def step(
        self,
        target_power_kw: float,
        dt_s: float = 60.0,
        coolant_temp_in_c: float = 45.0,
        ambient_temp_c: float = 22.0,
    ) -> Dict[str, Union[float, str, Dict]]:
        """Advance plant simulation by dt_s seconds under commanded target power."""
        prev_power = self.current_power_kw

        # 1. State Machine & Constraints Check
        if target_power_kw < 0.5:
            # Standby or Off
            if self.state in [OperatingState.NORMAL_PRODUCTION, OperatingState.RAMPING]:
                self.state = OperatingState.SHUTDOWN
            elif self.thermal1.current_temp_c > 40.0:
                self.state = OperatingState.WARM_STANDBY
            else:
                self.state = OperatingState.OFF
            actual_power_kw = 0.0
        else:
            # Power demanded
            if self.state == OperatingState.OFF:
                self.state = OperatingState.COLD_START
                self.startup_count += 1
            elif self.state == OperatingState.WARM_STANDBY:
                self.state = OperatingState.RAMPING
            else:
                self.state = OperatingState.NORMAL_PRODUCTION

            # Enforce minimum turndown load (10 kW)
            demanded = max(target_power_kw, self.min_load_kw)
            demanded = min(demanded, self.nominal_power_kw)

            # Enforce dynamic ramp rate limit
            max_delta = self.max_ramp_kw_s * dt_s
            actual_power_kw = float(np.clip(demanded, prev_power - max_delta, prev_power + max_delta))
            if abs(actual_power_kw - prev_power) > 0.05 * self.nominal_power_kw:
                self.state = OperatingState.RAMPING

        self.current_power_kw = actual_power_kw

        # 2. Split Power Across Dual Stacks (50% each nominally)
        power_s1_kw = actual_power_kw * 0.5
        power_s2_kw = actual_power_kw * 0.5

        # Solve for operating current given target stack power
        # P = V_stack(I) * I
        current_s1_a = self._solve_current_for_power(self.stack1, power_s1_kw, self.thermal1.current_temp_c)
        current_s2_a = self._solve_current_for_power(self.stack2, power_s2_kw, self.thermal2.current_temp_c)

        # 3. Compute Stack Electrical State
        s1_elec = self.stack1.calculate_stack_state(current_s1_a, temp_c=self.thermal1.current_temp_c)
        s2_elec = self.stack2.calculate_stack_state(current_s2_a, temp_c=self.thermal2.current_temp_c)

        # 4. Integrate Thermal Dynamics
        therm1_res = self.thermal1.step(current_s1_a, s1_elec["v_stack_v"], dt_s, t_cool_in_c=coolant_temp_in_c, t_amb_c=ambient_temp_c)
        therm2_res = self.thermal2.step(current_s2_a, s2_elec["v_stack_v"], dt_s, t_cool_in_c=coolant_temp_in_c, t_amb_c=ambient_temp_c)

        # 5. Compute Hydrogen Generation
        h2_1 = self.h2_model1.calculate_production(current_s1_a, s1_elec["current_density_a_cm2"], s1_elec["power_kw"], therm1_res["temperature_c"])
        h2_2 = self.h2_model2.calculate_production(current_s2_a, s2_elec["current_density_a_cm2"], s2_elec["power_kw"], therm2_res["temperature_c"])

        total_h2_kg_s = h2_1["h2_mass_flow_kg_s"] + h2_2["h2_mass_flow_kg_s"]
        total_h2_kg_h = total_h2_kg_s * 3600.0
        delta_h2_kg = total_h2_kg_s * dt_s

        self.total_h2_produced_kg += delta_h2_kg
        self.total_energy_kwh += (actual_power_kw * (dt_s / 3600.0))
        if actual_power_kw > 0:
            self.operating_hours += (dt_s / 3600.0)

        # Plant-level specific energy consumption
        overall_sec = actual_power_kw / total_h2_kg_h if total_h2_kg_h > 1e-4 else 0.0

        return {
            "state": self.state.value,
            "power_total_kw": float(actual_power_kw),
            "power_s1_kw": float(s1_elec["power_kw"]),
            "power_s2_kw": float(s2_elec["power_kw"]),
            "current_s1_a": float(current_s1_a),
            "current_s2_a": float(current_s2_a),
            "v_stack1_v": float(s1_elec["v_stack_v"]),
            "v_stack2_v": float(s2_elec["v_stack_v"]),
            "v_cell_mean_s1_v": float(s1_elec["v_cell_mean_v"]),
            "v_cell_mean_s2_v": float(s2_elec["v_cell_mean_v"]),
            "cell_voltages_s1": s1_elec["cell_voltages_v"],
            "cell_voltages_s2": s2_elec["cell_voltages_v"],
            "temperature_s1_c": float(therm1_res["temperature_c"]),
            "temperature_s2_c": float(therm2_res["temperature_c"]),
            "h2_flow_kg_h": float(total_h2_kg_h),
            "h2_total_produced_kg": float(self.total_h2_produced_kg),
            "energy_total_kwh": float(self.total_energy_kwh),
            "sec_kwh_kg": float(overall_sec),
            "startup_count": int(self.startup_count),
            "operating_hours": float(self.operating_hours),
        }

    def _solve_current_for_power(self, stack: PEMStackModel, target_power_kw: float, temp_c: float) -> float:
        """Find root current I such that V_stack(I) * I = target_power_kw * 1000 using Newton-Raphson."""
        if target_power_kw <= 1e-4:
            return 0.0
        target_w = target_power_kw * 1000.0
        # Initial guess assuming ~1.8 V per cell * 30 cells = 54 V
        curr = target_w / 54.0
        for _ in range(12):
            st = stack.calculate_stack_state(curr, temp_c)
            v = st["v_stack_v"]
            p_calc = v * curr
            err = p_calc - target_w
            if abs(err) < 1.0:
                break
            # Numerical derivative dP/dI ~ V + I * dV/dI
            dp_di = max(v + curr * 0.03, 10.0)
            curr = max(curr - err / dp_di, 0.0)
        return float(curr)
