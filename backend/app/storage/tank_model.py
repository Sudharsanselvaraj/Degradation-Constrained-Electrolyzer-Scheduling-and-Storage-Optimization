"""
Hydrogen Buffer Storage Tank with Real-Gas Compressibility Z(P, T).
Tracks inventory mass, pressure up to 350 bar, minimum safety reserve, and boil-off/leakage.
"""

from dataclasses import dataclass
from typing import Dict, Optional
import numpy as np

# Universal gas constant [J/(mol*K)]
R_GAS = 8.314462618
M_H2 = 2.01588e-3  # [kg/mol]


@dataclass
class StorageTankParams:
    """Buffer storage physical dimensions and operating limits."""
    tank_volume_m3: float = 12.0       # Geometric water volume [m³] (~12,000 L)
    p_max_bar: float = 350.0          # Maximum certified pressure [bar]
    p_min_bar: float = 30.0           # Minimum discharge pressure [bar]
    t_tank_c: float = 20.0            # Tank ambient temperature [°C]
    reserve_fraction: float = 0.20    # Minimum strategic reserve inventory (20%)
    leakage_rate_per_day: float = 0.0005 # 0.05% per day nominal seal leakage


class HydrogenStorageTank:
    """Dynamic inventory and real-gas pressure state model."""

    def __init__(self, params: Optional[StorageTankParams] = None, initial_soc: float = 0.50):
        self.params = params or StorageTankParams()
        self.p_tank_k = self.params.t_tank_c + 273.15

        # Compute maximum mass capacity at p_max_bar using real-gas equation
        self.max_capacity_kg = self._mass_from_pressure(self.params.p_max_bar)
        self.min_capacity_kg = self._mass_from_pressure(self.params.p_min_bar)
        self.reserve_mass_kg = self.min_capacity_kg + (self.max_capacity_kg - self.min_capacity_kg) * self.params.reserve_fraction

        # Initial inventory
        self.current_mass_kg = self.min_capacity_kg + initial_soc * (self.max_capacity_kg - self.min_capacity_kg)

    def compressibility_factor_z(self, pressure_bar: float, temp_k: float) -> float:
        """Real-gas compressibility factor Z(P, T) for hydrogen (Beattie-Bridgeman / Abel-Nobel approximation).
        
        For H2, Z increases linearly with pressure at ambient temperatures due to molecular co-volume:
        Z(P, T) ~ 1 + (b_H2 * P) / (R * T) where b_H2 ~ 0.0156 L/mol.
        """
        p_pa = pressure_bar * 1e5
        # Empirical high-pressure H2 correction
        z = 1.0 + (0.00058 * pressure_bar) / (temp_k / 300.0)
        return float(z)

    def _mass_from_pressure(self, pressure_bar: float) -> float:
        """Calculate stored hydrogen mass [kg] from pressure [bar] using real-gas law."""
        z = self.compressibility_factor_z(pressure_bar, self.p_tank_k)
        p_pa = pressure_bar * 1e5
        n_mol = (p_pa * self.params.tank_volume_m3) / (z * R_GAS * self.p_tank_k)
        return float(n_mol * M_H2)

    def pressure_from_mass(self, mass_kg: float) -> float:
        """Calculate tank pressure [bar] from stored mass [kg] by solving P = Z(P)*m*R*T/(M*V)."""
        if mass_kg <= 1e-4:
            return 1.0
        # Ideal gas initial guess
        p_ideal = (mass_kg * R_GAS * self.p_tank_k) / (M_H2 * self.params.tank_volume_m3 * 1e5)
        p_est = p_ideal
        # Newton-Raphson iteration
        for _ in range(6):
            z = self.compressibility_factor_z(p_est, self.p_tank_k)
            f = p_est - (p_ideal * z)
            # Derivative df/dP ~ 1 - p_ideal * (0.00058 / (T/300))
            df = 1.0 - p_ideal * (0.00058 / (self.p_tank_k / 300.0))
            p_est = p_est - f / max(df, 0.2)
        return float(max(p_est, 1.0))

    def step(
        self,
        h2_inflow_kg: float,
        h2_demand_kg: float,
        dt_s: float = 900.0,
    ) -> Dict[str, float]:
        """Update inventory mass over dt_s seconds."""
        # Leakage loss
        leakage_rate_s = self.params.leakage_rate_per_day / 86400.0
        leakage_kg = self.current_mass_kg * leakage_rate_s * dt_s

        # Delivered hydrogen cannot exceed available mass above minimum pressure
        available_discharge = max(self.current_mass_kg - self.min_capacity_kg, 0.0)
        delivered_kg = min(h2_demand_kg, available_discharge)
        shortfall_kg = max(h2_demand_kg - delivered_kg, 0.0)

        # Net mass update
        net_inflow = h2_inflow_kg - delivered_kg - leakage_kg
        new_mass = float(np.clip(self.current_mass_kg + net_inflow, self.min_capacity_kg * 0.95, self.max_capacity_kg))
        self.current_mass_kg = new_mass

        pressure_bar = self.pressure_from_mass(self.current_mass_kg)
        soc = (self.current_mass_kg - self.min_capacity_kg) / (self.max_capacity_kg - self.min_capacity_kg)
        is_reserve_violated = bool(self.current_mass_kg < self.reserve_mass_kg)

        return {
            "current_mass_kg": float(self.current_mass_kg),
            "max_capacity_kg": float(self.max_capacity_kg),
            "reserve_mass_kg": float(self.reserve_mass_kg),
            "pressure_bar": float(pressure_bar),
            "state_of_charge": float(np.clip(soc, 0.0, 1.0)),
            "delivered_kg": float(delivered_kg),
            "shortfall_kg": float(shortfall_kg),
            "is_reserve_violated": is_reserve_violated,
        }
