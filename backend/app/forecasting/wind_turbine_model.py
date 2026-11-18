"""
Wind Turbine aerodynamic power generation model with cut-in, rated, and cut-out curve.
"""

from dataclasses import dataclass
from typing import Optional, Union
import numpy as np


@dataclass
class WindTurbineParams:
    """Wind turbine power curve specifications."""
    rated_capacity_kw: float = 60.0    # Rated electrical capacity [kW]
    v_cut_in_m_s: float = 3.0          # Cut-in wind speed [m/s]
    v_rated_m_s: float = 11.5          # Rated wind speed [m/s]
    v_cut_out_m_s: float = 25.0        # Cut-out wind speed [m/s]


class WindTurbineModel:
    """Computes electrical power generation from wind speed."""

    def __init__(self, params: Optional[WindTurbineParams] = None):
        self.params = params or WindTurbineParams()

    def calculate_power(self, wind_speed_m_s: Union[float, np.ndarray]) -> Union[float, np.ndarray]:
        """Compute wind power output [kW] based on piecewise aerodynamic power curve."""
        p = self.params
        v = np.maximum(wind_speed_m_s, 0.0)

        # Vectorized power curve
        if isinstance(v, (int, float)):
            if v < p.v_cut_in_m_s or v >= p.v_cut_out_m_s:
                return 0.0
            elif v < p.v_rated_m_s:
                # Cubic progression in partial load region
                return float(p.rated_capacity_kw * ((v - p.v_cut_in_m_s) / (p.v_rated_m_s - p.v_cut_in_m_s)) ** 3)
            else:
                return float(p.rated_capacity_kw)
        else:
            power = np.zeros_like(v, dtype=float)
            partial_mask = (v >= p.v_cut_in_m_s) & (v < p.v_rated_m_s)
            rated_mask = (v >= p.v_rated_m_s) & (v < p.v_cut_out_m_s)

            power[partial_mask] = p.rated_capacity_kw * ((v[partial_mask] - p.v_cut_in_m_s) / (p.v_rated_m_s - p.v_cut_in_m_s)) ** 3
            power[rated_mask] = p.rated_capacity_kw
            return power
