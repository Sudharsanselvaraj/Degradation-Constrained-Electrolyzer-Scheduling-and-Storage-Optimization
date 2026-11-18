"""
Lumped-capacitance dynamic thermal model for the 100 kW PEM electrolyzer.
Predicts core stack temperature response under fluctuating renewable power and coolant flow.
"""

from dataclasses import dataclass
from typing import Dict, Optional
import numpy as np

# Thermoneutral voltage [V] for water electrolysis at standard state
E_TN = 1.482
# Specific heat capacity of water [J/(kg*K)]
CP_WATER = 4184.0


@dataclass
class PEMThermalParams:
    """Thermal parameters calibrated for the Jülich 100 kW dual-stack testbed."""
    c_th_j_k: float = 380000.0       # Stack lumped thermal heat capacity [J/K] (~380 kJ/K)
    ua_ambient_w_k: float = 24.5     # Stack ambient heat loss conductance UA [W/K]
    t_ambient_c: float = 22.0        # Ambient test hall temperature [°C]
    m_dot_cool_nom_kg_s: float = 0.55 # Nominal cooling deionized water mass flow [kg/s] (~33 L/min)
    t_cool_in_nom_c: float = 45.0    # Coolant inlet temperature setpoint [°C]
    num_cells: int = 30              # Cells per stack


class PEMThermalModel:
    """Simulates transient stack temperature ODE over time steps dt."""

    def __init__(self, params: Optional[PEMThermalParams] = None, initial_temp_c: float = 25.0):
        self.params = params or PEMThermalParams()
        self.current_temp_c = float(initial_temp_c)

    def heat_generation_rate_w(self, current_a: float, v_stack_v: float) -> float:
        """Internal heat generation Q_gen = I * (V_stack - N_cells * E_tn) [W]."""
        p = self.params
        v_tn_total = p.num_cells * E_TN
        # If stack voltage exceeds thermoneutral, heat is generated
        over_voltage = max(v_stack_v - v_tn_total, 0.0)
        return float(current_a * over_voltage)

    def heat_removal_coolant_w(
        self,
        temp_c: float,
        m_dot_cool_kg_s: Optional[float] = None,
        t_cool_in_c: Optional[float] = None,
    ) -> float:
        """Heat removed by active deionized water cooling system [W]."""
        p = self.params
        m_dot = m_dot_cool_kg_s if m_dot_cool_kg_s is not None else p.m_dot_cool_nom_kg_s
        t_in = t_cool_in_c if t_cool_in_c is not None else p.t_cool_in_nom_c

        # Effective heat exchange: coolant warms up towards stack temperature
        effectiveness = 0.75  # Heat exchanger effectiveness
        t_out = t_in + effectiveness * (temp_c - t_in)
        q_cool = m_dot * CP_WATER * (t_out - t_in)
        return float(max(q_cool, 0.0))

    def heat_loss_ambient_w(self, temp_c: float, t_amb_c: Optional[float] = None) -> float:
        """Convective and radiative heat loss to surroundings [W]."""
        p = self.params
        t_amb = t_amb_c if t_amb_c is not None else p.t_ambient_c
        return float(p.ua_ambient_w_k * (temp_c - t_amb))

    def step(
        self,
        current_a: float,
        v_stack_v: float,
        dt_s: float,
        m_dot_cool_kg_s: Optional[float] = None,
        t_cool_in_c: Optional[float] = None,
        t_amb_c: Optional[float] = None,
    ) -> Dict[str, float]:
        """Integrate thermal balance forward by dt_s using explicit Euler integration."""
        q_gen = self.heat_generation_rate_w(current_a, v_stack_v)
        q_cool = self.heat_removal_coolant_w(self.current_temp_c, m_dot_cool_kg_s, t_cool_in_c)
        q_loss = self.heat_loss_ambient_w(self.current_temp_c, t_amb_c)

        # Net thermal power [W]
        q_net = q_gen - q_cool - q_loss

        # dT/dt = Q_net / C_th
        dt_temp = (q_net / self.params.c_th_j_k) * dt_s
        self.current_temp_c = float(np.clip(self.current_temp_c + dt_temp, 10.0, 95.0))

        return {
            "temperature_c": self.current_temp_c,
            "q_gen_kw": q_gen / 1000.0,
            "q_cool_kw": q_cool / 1000.0,
            "q_loss_kw": q_loss / 1000.0,
            "q_net_kw": q_net / 1000.0,
        }
