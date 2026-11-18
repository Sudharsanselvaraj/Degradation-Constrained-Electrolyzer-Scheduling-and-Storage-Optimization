"""
Extended Kalman Filter (EKF) for online PEM electrolyzer stack state and health estimation.
Estimates hidden membrane resistance drift, overpotential offset, and uncertainty covariance.
"""

from dataclasses import dataclass
from typing import Dict, Optional, Tuple
import numpy as np

from backend.app.digital_twin.electrochemical_model import PEMCellModel, PEMElectrochemicalParams


@dataclass
class EKFConfig:
    """Noise covariance parameters for EKF."""
    # Process noise covariance Q diagonal
    q_r_ohm: float = 1.0e-7       # Drift rate variance in membrane resistance [(Ohm*cm²)² / s]
    q_delta_v: float = 1.0e-6     # Drift rate variance in reversible offset [V² / s]
    q_temp: float = 1.0e-3        # Thermal state process variance [K² / s]
    
    # Measurement noise covariance R diagonal
    r_v_meas: float = 0.04        # Voltage measurement noise variance [V²]
    r_t_meas: float = 0.25        # Temperature measurement noise variance [K²]


class PEMExtendedKalmanFilter:
    """Tracks state x = [R_ohm, Delta_V_rev, T_stack_K]^T from measurements z = [V_stack, T_meas_K]^T."""

    def __init__(
        self,
        base_params: Optional[PEMElectrochemicalParams] = None,
        config: Optional[EKFConfig] = None,
        initial_temp_c: float = 55.0,
    ):
        self.params = base_params or PEMElectrochemicalParams()
        self.config = config or EKFConfig()
        self.cell_model = PEMCellModel(self.params)

        # Initial state: x = [R_ohm (Ohm*cm²), Delta_V (V), Temp (K)]
        self.x = np.array([self.params.r_mem_0, 0.0, initial_temp_c + 273.15], dtype=float)

        # Initial covariance P
        self.P = np.diag([1.0e-4, 1.0e-3, 4.0])

        # Baseline nominal resistance for health normalization
        self.r_nom = self.params.r_mem_0

    def predict(self, dt_s: float, current_a: float) -> np.ndarray:
        """State prediction step: x_{k|k-1} = f(x_{k-1}) + w."""
        # Resistance and potential offset follow random walk with slow degradation drift
        j_a_cm2 = current_a / self.params.cell_active_area_cm2
        drift_rate = 1.0e-8 * (j_a_cm2 ** 1.5) if j_a_cm2 > 0.1 else 0.0

        # State transition: x_new = x + drift
        self.x[0] += drift_rate * dt_s
        # x[1] potential offset stays constant in expectation
        # x[2] temperature stays constant in expectation (or updated by thermal model)

        # Process covariance Q
        cfg = self.config
        Q = np.diag([cfg.q_r_ohm * dt_s, cfg.q_delta_v * dt_s, cfg.q_temp * dt_s])
        # State transition Jacobian F ~ Identity
        F = np.eye(3)
        self.P = F @ self.P @ F.T + Q
        return self.x

    def update(
        self,
        v_stack_meas_v: float,
        t_meas_c: float,
        current_a: float,
    ) -> Dict[str, float]:
        """Measurement update step using nonlinear measurement function h(x)."""
        temp_meas_k = t_meas_c + 273.15
        z = np.array([v_stack_meas_v, temp_meas_k], dtype=float)

        j_a_cm2 = current_a / self.params.cell_active_area_cm2
        num_cells = self.params.num_cells

        # Compute predicted measurement h(x):
        # Cell voltage: V_cell = E_rev(T) + eta_act(j, T) + j * R_ohm + eta_conc(j) + Delta_V
        r_ohm_est, delta_v_est, temp_k_est = self.x
        e_rev = self.cell_model.reversible_potential(temp_k_est)
        eta_act = self.cell_model.activation_overpotential(j_a_cm2, temp_k_est)
        eta_ohm = j_a_cm2 * r_ohm_est
        eta_conc = self.cell_model.concentration_overpotential(j_a_cm2)
        v_cell_pred = e_rev + eta_act + eta_ohm + eta_conc + delta_v_est
        v_stack_pred = num_cells * v_cell_pred

        h_x = np.array([v_stack_pred, temp_k_est], dtype=float)

        # Measurement residual y = z - h(x)
        y = z - h_x

        # Measurement Jacobian H = dh/dx
        # dh_1/d(R_ohm) = N_cells * j
        # dh_1/d(Delta_V) = N_cells
        # dh_1/dT ~ N_cells * dE_rev/dT
        dh1_dr = num_cells * j_a_cm2
        dh1_ddeltav = float(num_cells)
        dh1_dt = num_cells * (-0.845e-3)
        H = np.array([
            [dh1_dr, dh1_ddeltav, dh1_dt],
            [0.0, 0.0, 1.0],
        ], dtype=float)

        # Innovation covariance S = H P H^T + R
        R = np.diag([self.config.r_v_meas, self.config.r_t_meas])
        S = H @ self.P @ H.T + R

        # Kalman gain K = P H^T S^-1
        K = self.P @ H.T @ np.linalg.inv(S)

        # State update x = x + K y
        self.x = self.x + K @ y

        # Covariance update P = (I - K H) P
        I = np.eye(3)
        self.P = (I - K @ H) @ self.P

        # Physical constraints: R_ohm > 0.02
        self.x[0] = max(self.x[0], 0.02)

        # Extract health index and confidence:
        # As R_ohm increases from baseline, health decreases
        r_curr = self.x[0]
        # Normalized Health State: 1.0 at nominal resistance, decreasing as R_ohm grows
        health_mean = float(np.clip(1.0 - max((r_curr - self.r_nom) / (2.0 * self.r_nom), 0.0), 0.1, 1.0))
        # Health variance derived from R_ohm variance
        r_var = float(self.P[0, 0])
        health_std = float(np.sqrt(r_var) / (2.0 * self.r_nom))
        health_std = float(np.clip(health_std, 0.01, 0.25))

        return {
            "r_ohm_est": float(self.x[0]),
            "delta_v_est": float(self.x[1]),
            "temp_est_c": float(self.x[2] - 273.15),
            "v_stack_residual": float(y[0]),
            "health_mean": float(health_mean),
            "health_std": float(health_std),
            "r_ohm_std": float(np.sqrt(r_var)),
        }
