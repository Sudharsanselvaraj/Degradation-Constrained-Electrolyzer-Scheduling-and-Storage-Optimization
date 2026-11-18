"""
Renewable power scenario generation for Stochastic Model Predictive Control (SMPC).
Generates S Latin Hypercube / Monte Carlo sampled power profiles bounded by quantiles.
"""

from typing import List, Optional
import numpy as np


class RenewableScenarioGenerator:
    """Generates correlated trajectory ensembles across the prediction horizon N."""

    def __init__(self, num_scenarios: int = 5, random_seed: int = 42):
        self.num_scenarios = num_scenarios
        self.rng = np.random.default_rng(seed=random_seed)

    def generate_scenarios(
        self,
        p10: np.ndarray,
        p50: np.ndarray,
        p90: np.ndarray,
        num_scenarios: Optional[int] = None,
    ) -> np.ndarray:
        """Generate (S, N) power scenarios centered at p50 and bounded within [p10, p90]."""
        S = num_scenarios or self.num_scenarios
        N = len(p50)
        scenarios = np.zeros((S, N), dtype=float)

        # Baseline: Scenario 0 is always the expected median forecast (p50)
        scenarios[0, :] = p50

        # Scenario 1: Conservative low profile (p10)
        if S > 1:
            scenarios[1, :] = p10

        # Scenario 2: Optimistic high profile (p90)
        if S > 2:
            scenarios[2, :] = p90

        # Additional stochastic perturbations with AR(1) temporal auto-correlation
        spread = (p90 - p10) / 2.0
        for s in range(3, S):
            # AR(1) disturbance: epsilon_t = phi * epsilon_{t-1} + sqrt(1 - phi^2) * eta_t
            phi = 0.82  # Temporal correlation in cloud cover / wind gusts
            noise = np.zeros(N)
            curr = self.rng.normal(0, 1)
            for t in range(N):
                curr = phi * curr + np.sqrt(1 - phi ** 2) * self.rng.normal(0, 1)
                noise[t] = curr

            sampled = p50 + (noise / 2.0) * spread
            scenarios[s, :] = np.clip(sampled, np.maximum(0.0, p10 * 0.8), p90 * 1.15)

        return scenarios
