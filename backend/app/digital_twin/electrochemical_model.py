"""
Physics-based reduced-order electrochemical model of a PEM electrolyzer cell and stack.
Calibrated for the Forschungszentrum Jülich 100 kW dual-stack testbed.
"""

from dataclasses import dataclass, field
from typing import Dict, List, Optional, Tuple, Union
import numpy as np

# Fundamental Physical Constants
R_GAS = 8.314462618  # Universal gas constant [J/(mol*K)]
F_CONST = 96485.3321  # Faraday constant [C/mol]
M_H2 = 2.01588e-3     # Molar mass of H2 [kg/mol]
STANDARD_TEMP_K = 298.15  # 25 °C in Kelvin
DELTA_S = 163.15      # Standard reaction entropy change [J/(mol*K)]
E0_REV = 1.229        # Standard reversible potential at 298.15 K [V]
E_TN = 1.482          # Standard thermoneutral voltage [V]


@dataclass
class PEMElectrochemicalParams:
    """Calibrated parameters of the PEM electrochemical cell."""
    # Membrane & Ohmic
    r_mem_0: float = 0.125         # Baseline area-specific ohmic resistance [Ohm*cm²]
    alpha_ohm: float = 0.0018      # Temperature coefficient for ohmic resistance [1/K]
    t_mem_cm: float = 0.0175       # Membrane thickness (~175 um, Nafion 117 standard) [cm]
    
    # Activation Kinetics (Butler-Volmer / Tafel)
    j0_ref: float = 1.85e-4        # Reference exchange current density at T_ref [A/cm²]
    t_ref_k: float = 333.15        # Reference temperature for kinetics (60 °C) [K]
    e_act_j: float = 28500.0       # Activation energy [J/mol]
    alpha_ct: float = 0.485        # Anodic charge transfer coefficient [-]
    
    # Concentration / Mass Transport
    b_conc: float = 0.048          # Concentration overpotential slope [V]
    j_lim: float = 3.20            # Limiting current density [A/cm²]
    
    # Geometry
    num_cells: int = 30            # Cells per stack
    cell_active_area_cm2: float = 300.0  # Active area [cm²]
    cell_to_cell_sigma: float = 0.018    # Cell voltage manufacturing standard deviation [V]


class PEMCellModel:
    """Calculates cell voltage components: Nernst reversible, activation, ohmic, and concentration."""

    def __init__(self, params: Optional[PEMElectrochemicalParams] = None):
        self.params = params or PEMElectrochemicalParams()

    def reversible_potential(self, temp_k: float, p_h2_bar: float = 1.0, p_o2_bar: float = 1.0) -> float:
        """Nernst reversible cell potential E_rev(T, P) [V]."""
        # Temperature dependence: dE/dT = -Delta_S / (2*F) = -0.845e-3 V/K
        e_t = E0_REV - 0.845e-3 * (temp_k - STANDARD_TEMP_K)
        # Pressure correction
        p_ratio = max(p_h2_bar * np.sqrt(max(p_o2_bar, 0.1)), 0.01)
        e_p = (R_GAS * temp_k / (2.0 * F_CONST)) * np.log(p_ratio)
        return float(e_t + e_p)

    def exchange_current_density(self, temp_k: float) -> float:
        """Arrhenius temperature-dependent exchange current density j0(T) [A/cm²]."""
        p = self.params
        return float(p.j0_ref * np.exp(-(p.e_act_j / R_GAS) * (1.0 / temp_k - 1.0 / p.t_ref_k)))

    def activation_overpotential(self, j_a_cm2: float, temp_k: float) -> float:
        """Activation overpotential using inverse hyperbolic sine formulation [V]."""
        p = self.params
        if j_a_cm2 <= 1e-6:
            return 0.0
        j0 = self.exchange_current_density(temp_k)
        # arcsinh formulation smoothly handles zero to high current densities
        eta_act = (R_GAS * temp_k / (p.alpha_ct * F_CONST)) * np.arcsinh(j_a_cm2 / (2.0 * j0))
        return float(eta_act)

    def ohmic_overpotential(self, j_a_cm2: float, temp_k: float) -> float:
        """Ohmic overpotential across proton exchange membrane and bipolar plates [V]."""
        p = self.params
        # Ohmic resistance decreases with temperature due to increased proton mobility
        r_ohm = p.r_mem_0 * (1.0 - p.alpha_ohm * (temp_k - p.t_ref_k))
        r_ohm = max(r_ohm, 0.04)  # Lower bound for physical resistance
        return float(j_a_cm2 * r_ohm)

    def concentration_overpotential(self, j_a_cm2: float) -> float:
        """Mass transport / concentration overpotential at high current densities [V]."""
        p = self.params
        ratio = min(max(j_a_cm2 / p.j_lim, 0.0), 0.985)
        return float(-p.b_conc * np.log(1.0 - ratio))

    def cell_voltage(
        self,
        j_a_cm2: float,
        temp_k: float = 333.15,
        p_h2_bar: float = 1.0,
        p_o2_bar: float = 1.0,
    ) -> float:
        """Total cell voltage V_cell = E_rev + eta_act + eta_ohm + eta_conc [V]."""
        if j_a_cm2 <= 1e-6:
            return self.reversible_potential(temp_k, p_h2_bar, p_o2_bar)

        e_rev = self.reversible_potential(temp_k, p_h2_bar, p_o2_bar)
        eta_act = self.activation_overpotential(j_a_cm2, temp_k)
        eta_ohm = self.ohmic_overpotential(j_a_cm2, temp_k)
        eta_conc = self.concentration_overpotential(j_a_cm2)
        return float(e_rev + eta_act + eta_ohm + eta_conc)


class PEMStackModel:
    """Full PEM stack model consisting of N cells, calculating stack voltage, power, and cell distribution."""

    def __init__(self, params: Optional[PEMElectrochemicalParams] = None):
        self.params = params or PEMElectrochemicalParams()
        self.cell_model = PEMCellModel(self.params)

    def calculate_stack_state(
        self,
        current_a: float,
        temp_c: float = 60.0,
        pressure_bar: float = 1.0,
    ) -> Dict[str, Union[float, List[float]]]:
        """Calculate complete electrical and voltage distribution metrics for the stack."""
        temp_k = temp_c + 273.15
        j_a_cm2 = max(current_a / self.params.cell_active_area_cm2, 0.0)

        # Single cell components
        e_rev = self.cell_model.reversible_potential(temp_k, pressure_bar, pressure_bar)
        eta_act = self.cell_model.activation_overpotential(j_a_cm2, temp_k)
        eta_ohm = self.cell_model.ohmic_overpotential(j_a_cm2, temp_k)
        eta_conc = self.cell_model.concentration_overpotential(j_a_cm2)
        v_cell_mean = self.cell_model.cell_voltage(j_a_cm2, temp_k, pressure_bar, pressure_bar)

        # Generate individual cell voltage distribution across N cells
        num_cells = self.params.num_cells
        rng = np.random.default_rng(seed=42)
        # Empirical variation: standard deviation scales slightly with current
        sigma = self.params.cell_to_cell_sigma * (1.0 + 0.8 * (j_a_cm2 / 2.0))
        noise = rng.normal(0.0, sigma, num_cells)
        # Ensure zero-sum to preserve exact mean
        noise = noise - np.mean(noise)
        cell_voltages = [float(v_cell_mean + noise[i]) for i in range(num_cells)]

        v_stack = float(sum(cell_voltages))
        power_w = float(v_stack * current_a)
        power_kw = float(power_w / 1000.0)

        return {
            "current_a": float(current_a),
            "current_density_a_cm2": float(j_a_cm2),
            "e_rev_v": float(e_rev),
            "eta_act_v": float(eta_act),
            "eta_ohm_v": float(eta_ohm),
            "eta_conc_v": float(eta_conc),
            "v_cell_mean_v": float(v_cell_mean),
            "v_stack_v": float(v_stack),
            "power_kw": float(power_kw),
            "cell_voltages_v": cell_voltages,
            "cell_voltage_std_v": float(np.std(cell_voltages)),
            "cell_voltage_min_v": float(min(cell_voltages)),
            "cell_voltage_max_v": float(max(cell_voltages)),
        }
