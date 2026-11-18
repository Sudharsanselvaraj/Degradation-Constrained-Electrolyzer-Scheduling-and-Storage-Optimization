"""
Hydrogen production and Faradaic efficiency model for PEM water electrolysis.
Computes molar rate, mass flow, specific energy consumption (SEC), and HHV efficiency.
"""

from dataclasses import dataclass
from typing import Dict, Optional
import numpy as np

# Physical Constants
F_CONST = 96485.3321  # Faraday constant [C/mol]
M_H2 = 2.01588e-3     # Molar mass of H2 [kg/mol]
HHV_H2_MJ_KG = 141.86 # Higher Heating Value of H2 [MJ/kg] = 39.405 kWh/kg
LHV_H2_MJ_KG = 119.96 # Lower Heating Value of H2 [MJ/kg] = 33.322 kWh/kg
RHO_H2_NORMAL = 0.08988  # Normal density of H2 at 0 °C, 1.013 bar [kg/m³]


@dataclass
class FaradaicParams:
    """Calibrated empirical Faradaic efficiency coefficients."""
    f11: float = 0.024       # Parasitic cross-over loss parameter [(A/cm²)²]
    f12: float = 0.00018     # Temperature coefficient for cross-over [(A/cm²)²/°C]
    f21: float = 0.992       # Peak Faradaic asymptotic efficiency [-]


class HydrogenProductionModel:
    """Calculates instantaneous hydrogen generation rate, Faradaic efficiency, and power consumption."""

    def __init__(self, num_cells: int = 30, params: Optional[FaradaicParams] = None):
        self.num_cells = num_cells
        self.params = params or FaradaicParams()

    def faradaic_efficiency(self, j_a_cm2: float, temp_c: float = 60.0) -> float:
        """Faradaic efficiency accounting for membrane gas cross-over at low current densities."""
        if j_a_cm2 <= 1e-5:
            return 0.0
        p = self.params
        denom = p.f11 + p.f12 * temp_c + (j_a_cm2 ** 2)
        eta_f = ((j_a_cm2 ** 2) / denom) * p.f21
        return float(np.clip(eta_f, 0.0, 1.0))

    def calculate_production(
        self,
        current_a: float,
        j_a_cm2: float,
        power_kw: float,
        temp_c: float = 60.0,
    ) -> Dict[str, float]:
        """Calculate molar rate, mass flow rate, volumetric rate, and specific energy consumption."""
        if current_a <= 1e-4:
            return {
                "eta_faradaic": 0.0,
                "h2_molar_flow_mol_s": 0.0,
                "h2_mass_flow_kg_s": 0.0,
                "h2_mass_flow_kg_h": 0.0,
                "h2_vol_flow_nm3_h": 0.0,
                "sec_kwh_kg": 0.0,
                "hhv_efficiency_pct": 0.0,
            }

        eta_f = self.faradaic_efficiency(j_a_cm2, temp_c)

        # Faraday's law: n_dot = (N_cells * eta_F * I) / (z * F) with z = 2 electrons per H2
        molar_flow_mol_s = (self.num_cells * eta_f * current_a) / (2.0 * F_CONST)
        mass_flow_kg_s = molar_flow_mol_s * M_H2
        mass_flow_kg_h = mass_flow_kg_s * 3600.0

        # Normal cubic meters per hour (Nm³/h)
        vol_flow_nm3_h = mass_flow_kg_h / RHO_H2_NORMAL

        # Specific Energy Consumption (SEC): kWh of electrical input per kg of H2 produced
        sec_kwh_kg = power_kw / mass_flow_kg_h if mass_flow_kg_h > 1e-5 else 0.0

        # Energy conversion efficiency based on HHV (39.405 kWh/kg)
        hhv_kwh_kg = HHV_H2_MJ_KG / 3.6
        hhv_eff = (mass_flow_kg_h * hhv_kwh_kg) / power_kw if power_kw > 1e-5 else 0.0

        return {
            "eta_faradaic": float(eta_f),
            "h2_molar_flow_mol_s": float(molar_flow_mol_s),
            "h2_mass_flow_kg_s": float(mass_flow_kg_s),
            "h2_mass_flow_kg_h": float(mass_flow_kg_h),
            "h2_vol_flow_nm3_h": float(vol_flow_nm3_h),
            "sec_kwh_kg": float(sec_kwh_kg),
            "hhv_efficiency_pct": float(hhv_eff * 100.0),
        }
