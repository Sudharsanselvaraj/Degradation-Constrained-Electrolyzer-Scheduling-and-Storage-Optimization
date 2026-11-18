"""
Reduced-order degradation exposure and stress tracking model for PEM electrolyzer stacks.
Accounts for high current density wear, rapid dynamic load cycling, and cold start events.
"""

from dataclasses import dataclass
from typing import Dict, Optional
import numpy as np

# Gas constant [J/(mol*K)]
R_GAS = 8.314462618


@dataclass
class DegradationParams:
    """Empirically calibrated coefficients for PEM stress exposure rate."""
    a1_current: float = 1.2e-6        # High current density stress factor [1/s]
    gamma_current: float = 2.1        # Current exponent (accelerated wear at high load) [-]
    e_act_deg_j: float = 18500.0      # Thermal activation energy for membrane degradation [J/mol]
    t_ref_deg_k: float = 333.15       # Reference operating temperature (60 °C) [K]
    a2_ramping: float = 4.5e-5        # Load cycling / power ramping stress coefficient [1/(A/cm²)]
    a3_startup: float = 1.8e-4        # Stress damage per cold startup cycle [unitless damage]
    j_nom_a_cm2: float = 1.0          # Nominal rated current density [A/cm²]


class PEMDegradationModel:
    """Calculates instantaneous stress exposure rate and tracks cumulative damage."""

    def __init__(self, params: Optional[DegradationParams] = None):
        self.params = params or DegradationParams()
        self.cumulative_damage = 0.0
        self.prev_j = 0.0

    def compute_stress_rate(
        self,
        j_a_cm2: float,
        temp_c: float,
        dt_s: float,
        is_cold_start: bool = False,
    ) -> Dict[str, float]:
        """Compute degradation exposure rate dD/dt [1/hour] and increment cumulative damage."""
        p = self.params
        temp_k = temp_c + 273.15

        # 1. High current density and Arrhenius thermal stress
        if j_a_cm2 > 1e-4:
            arrhenius = np.exp((p.e_act_deg_j / R_GAS) * (1.0 / p.t_ref_deg_k - 1.0 / temp_k))
            current_stress = p.a1_current * ((j_a_cm2 / p.j_nom_a_cm2) ** p.gamma_current) * arrhenius
        else:
            current_stress = 0.0

        # 2. Dynamic ramping stress: |dj/dt|
        delta_j = abs(j_a_cm2 - self.prev_j)
        ramping_stress = (p.a2_ramping * delta_j) / max(dt_s, 1.0)

        # 3. Startup penalty
        startup_stress = (p.a3_startup / max(dt_s, 1.0)) if is_cold_start else 0.0

        # Total stress rate [1/s]
        total_stress_rate_s = current_stress + ramping_stress + startup_stress
        incremental_damage = total_stress_rate_s * dt_s

        self.cumulative_damage += incremental_damage
        self.prev_j = j_a_cm2

        # Effective health index normalized to [0, 1]
        health_index = float(np.clip(1.0 - self.cumulative_damage, 0.0, 1.0))

        return {
            "current_stress_rate_s": float(current_stress),
            "ramping_stress_rate_s": float(ramping_stress),
            "startup_stress_rate_s": float(startup_stress),
            "total_stress_rate_s": float(total_stress_rate_s),
            "stress_rate_per_hour": float(total_stress_rate_s * 3600.0),
            "incremental_damage": float(incremental_damage),
            "cumulative_damage": float(self.cumulative_damage),
            "state_of_health": float(health_index),
        }
