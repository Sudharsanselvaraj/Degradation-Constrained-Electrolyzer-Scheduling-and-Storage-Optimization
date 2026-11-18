"""
Hydrogen Demand Profiles for Industrial Baseload, Mobility Refueling, and Stochastic Surges.
"""

from typing import Dict, List, Optional
import numpy as np


class HydrogenDemandModel:
    """Generates realistic time-varying hydrogen off-taker demand trajectories [kg/h]."""

    def __init__(self, daily_demand_target_kg: float = 65.0):
        self.daily_demand_target_kg = daily_demand_target_kg

    def generate_profile(
        self,
        num_steps: int = 96,
        dt_minutes: int = 15,
        profile_type: str = "mobility",
        random_seed: int = 42,
    ) -> np.ndarray:
        """Generate demand trajectory [kg/h] for N time steps.
        
        Profile types:
        - 'baseload': Uniform continuous industrial chemical demand
        - 'mobility': Heavy-duty vehicle refueling with morning (07-09) and evening (16-19) peaks
        - 'stochastic': Baseload with unexpected consumption surges
        """
        rng = np.random.default_rng(seed=random_seed)
        step_hours = (np.arange(num_steps) * (dt_minutes / 60.0)) % 24.0
        avg_hourly_kg_h = self.daily_demand_target_kg / 24.0

        if profile_type == "baseload":
            demand = np.full(num_steps, avg_hourly_kg_h)
            demand += rng.normal(0, avg_hourly_kg_h * 0.05, num_steps)

        elif profile_type == "mobility":
            # Morning peak: 07:00 - 09:30 (centered at 08:00)
            morning = np.exp(-0.5 * ((step_hours - 8.0) / 1.2) ** 2)
            # Evening peak: 16:00 - 19:30 (centered at 17:30)
            evening = np.exp(-0.5 * ((step_hours - 17.5) / 1.5) ** 2)
            # Night minimum
            night = 0.25

            raw_shape = night + 2.5 * morning + 2.2 * evening
            # Scale to match target daily volume
            total_unscaled_daily = np.sum(raw_shape) * (dt_minutes / 60.0) / (num_steps * dt_minutes / (60.0 * 24.0))
            scale = self.daily_demand_target_kg / max(total_unscaled_daily, 1.0)
            demand = raw_shape * scale
            demand += rng.normal(0, avg_hourly_kg_h * 0.08, num_steps)

        elif profile_type == "stochastic":
            demand = np.full(num_steps, avg_hourly_kg_h * 0.8)
            # Add 2-3 random demand surge bursts
            num_surges = max(1, num_steps // 24)
            surge_centers = rng.choice(np.arange(10, num_steps - 10), size=num_surges, replace=False)
            for center in surge_centers:
                width = rng.uniform(2, 6)
                burst = 2.5 * avg_hourly_kg_h * np.exp(-0.5 * ((np.arange(num_steps) - center) / width) ** 2)
                demand += burst
            demand += rng.normal(0, avg_hourly_kg_h * 0.1, num_steps)

        else:
            demand = np.full(num_steps, avg_hourly_kg_h)

        return np.maximum(demand, 0.0)
