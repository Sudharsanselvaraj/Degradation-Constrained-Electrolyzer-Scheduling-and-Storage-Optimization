"""
Multi-stage hydrogen compressor electrical power model.
Calculates polytropic compression work from electrolyzer outlet pressure to storage pressure.
"""

from dataclasses import dataclass
from typing import Dict, Optional
import numpy as np

R_GAS = 8.314462618
M_H2 = 2.01588e-3  # [kg/mol]
KAPPA_H2 = 1.41    # Ratio of specific heats (Cp / Cv) for H2


@dataclass
class CompressorParams:
    """Compressor mechanical and thermodynamic specifications."""
    p_inlet_bar: float = 30.0         # Electrolyzer operating pressure [bar]
    eta_polytropic: float = 0.72      # Polytropic stage efficiency [-]
    eta_motor: float = 0.94           # Electrical motor & drive efficiency [-]
    num_stages: int = 3               # Number of intercooled compression stages


class HydrogenCompressorModel:
    """Calculates electrical power required to compress hydrogen into buffer tank."""

    def __init__(self, params: Optional[CompressorParams] = None):
        self.params = params or CompressorParams()

    def calculate_compression_power(
        self,
        mass_flow_kg_h: float,
        p_outlet_bar: float,
        temp_inlet_c: float = 25.0,
    ) -> Dict[str, float]:
        """Compute electrical power demand [kW] and specific compression work [kWh/kg]."""
        if mass_flow_kg_h <= 1e-4 or p_outlet_bar <= self.params.p_inlet_bar:
            return {
                "power_kw": 0.0,
                "specific_work_kwh_kg": 0.0,
                "pressure_ratio": 1.0,
            }

        p = self.params
        t_in_k = temp_inlet_c + 273.15
        mass_flow_kg_s = mass_flow_kg_h / 3600.0

        # Overall pressure ratio
        total_pr = max(p_outlet_bar / p.p_inlet_bar, 1.0)
        # Pressure ratio per stage assuming equal stage compression
        pr_stage = total_pr ** (1.0 / p.num_stages)

        # Polytropic exponent m = (kappa - 1) / (kappa * eta_poly)
        m = (KAPPA_H2 - 1.0) / (KAPPA_H2 * p.eta_polytropic)

        # Work per stage [J/mol]: w_stage = (R * T / m) * [pr^m - 1]
        w_stage_j_mol = (R_GAS * t_in_k / m) * ((pr_stage ** m) - 1.0)
        w_total_j_kg = (p.num_stages * w_stage_j_mol) / M_H2

        # Electrical power [W] = mass_flow [kg/s] * work [J/kg] / eta_motor
        power_w = (mass_flow_kg_s * w_total_j_kg) / p.eta_motor
        power_kw = power_w / 1000.0

        # Specific electrical compression work [kWh/kg]
        sec_comp_kwh_kg = power_kw / mass_flow_kg_h if mass_flow_kg_h > 1e-4 else 0.0

        return {
            "power_kw": float(power_kw),
            "specific_work_kwh_kg": float(sec_comp_kwh_kg),
            "pressure_ratio": float(total_pr),
        }
