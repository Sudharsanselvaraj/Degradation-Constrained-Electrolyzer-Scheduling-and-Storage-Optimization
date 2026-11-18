"""
Photovoltaic (PV) power generation model with temperature and irradiance derating.
"""

from dataclasses import dataclass
from typing import Optional, Union
import numpy as np


@dataclass
class SolarPVParams:
    """PV Plant capacity and cell temperature derating."""
    rated_capacity_kw: float = 75.0   # Rated DC nameplate capacity [kW]
    g_stc_w_m2: float = 1000.0        # Standard Test Condition irradiance [W/m²]
    t_stc_c: float = 25.0             # STC cell temperature [°C]
    temp_coefficient: float = -0.004  # Power temperature coefficient [-0.4% / °C]
    inverter_efficiency: float = 0.96 # DC-AC inverter efficiency [-]
    noct_c: float = 45.0              # Nominal Operating Cell Temperature [°C]


class SolarPVModel:
    """Calculates instantaneous AC power from GHI and ambient temperature."""

    def __init__(self, params: Optional[SolarPVParams] = None):
        self.params = params or SolarPVParams()

    def calculate_power(self, ghi_w_m2: Union[float, np.ndarray], ambient_temp_c: Union[float, np.ndarray]) -> Union[float, np.ndarray]:
        """Compute electrical power output [kW]."""
        p = self.params
        ghi = np.maximum(ghi_w_m2, 0.0)

        # Estimate PV cell temperature T_cell = T_amb + (NOCT - 20) * (GHI / 800)
        t_cell = ambient_temp_c + ((p.noct_c - 20.0) / 800.0) * ghi

        # Temperature derating factor
        f_temp = 1.0 + p.temp_coefficient * (t_cell - p.t_stc_c)
        f_temp = np.maximum(f_temp, 0.5)

        # Solar DC Power
        p_dc = p.rated_capacity_kw * (ghi / p.g_stc_w_m2) * f_temp
        p_ac = p_dc * p.inverter_efficiency
        return np.maximum(p_ac, 0.0)
