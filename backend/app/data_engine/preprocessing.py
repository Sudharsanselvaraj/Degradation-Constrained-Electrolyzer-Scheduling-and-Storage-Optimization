"""
Parsing, cleaning, and SI unit normalization for Jülich 100 kW PEM experimental datasets.
"""

import logging
from pathlib import Path
from typing import Dict, List, Optional, Tuple

import numpy as np
import openpyxl
import pandas as pd

from backend.app.data_engine.schema import (
    CELLS_PER_STACK,
    CORE_CHANNELS,
    MEA_ACTIVE_AREA_CM2,
    NUM_STACKS,
    STACK1_CELL_VOLTAGE_COLS,
    STACK2_CELL_VOLTAGE_COLS,
)

logger = logging.getLogger(__name__)


class JuelichDataPreprocessor:
    """Parses raw Excel files with 52-row metadata headers into structured, cleaned dataframes."""

    def __init__(self, excel_path: Path):
        self.excel_path = Path(excel_path)
        if not self.excel_path.exists():
            raise FileNotFoundError(f"Dataset file not found: {self.excel_path}")

    def parse(self) -> pd.DataFrame:
        """Parse the primary measurement worksheet into a clean Pandas DataFrame."""
        wb = openpyxl.load_workbook(self.excel_path, data_only=True, read_only=True)
        # Select first sheet or specific measurement sheet
        sheet_name = wb.sheetnames[0]
        ws = wb[sheet_name]

        # Extract rows 50, 51, 52 (descriptions, tags, units)
        header_rows = list(ws.iter_rows(min_row=50, max_row=52, values_only=True))
        row_descs = header_rows[0]
        row_tags = header_rows[1]
        row_units = header_rows[2]

        # Read data starting at row 53
        data_rows = list(ws.iter_rows(min_row=53, values_only=True))
        if not data_rows:
            wb.close()
            return pd.DataFrame()

        num_cols = len(row_tags)
        # Build column mapping
        raw_df = pd.DataFrame(data_rows)
        wb.close()

        # Clean column count match
        raw_df = raw_df.iloc[:, :num_cols]

        # Build clean standardized column names
        cleaned_records = {}

        # 1. Map Time and Index
        # Col 4 is relative time in seconds
        if raw_df.shape[1] > 3:
            cleaned_records["time_rel_s"] = pd.to_numeric(raw_df.iloc[:, 3], errors="coerce").fillna(0.0)

        # 2. Map Core Channels
        for ch_key, ch_info in CORE_CHANNELS.items():
            col_idx = ch_info.col_index - 1
            if col_idx < raw_df.shape[1]:
                series = pd.to_numeric(raw_df.iloc[:, col_idx], errors="coerce")
                cleaned_records[ch_key] = series

        # 3. Map Individual Cell Voltages
        s1_cell_cols = []
        for cell_idx in range(1, CELLS_PER_STACK + 1):
            col_idx = STACK1_CELL_VOLTAGE_COLS[f"u_cell_s1_{cell_idx}"] - 1
            if col_idx < raw_df.shape[1]:
                col_name = f"u_cell_s1_{cell_idx}"
                cleaned_records[col_name] = pd.to_numeric(raw_df.iloc[:, col_idx], errors="coerce")
                s1_cell_cols.append(col_name)

        s2_cell_cols = []
        for cell_idx in range(1, CELLS_PER_STACK + 1):
            col_idx = STACK2_CELL_VOLTAGE_COLS[f"u_cell_s2_{cell_idx}"] - 1
            if col_idx < raw_df.shape[1]:
                col_name = f"u_cell_s2_{cell_idx}"
                cleaned_records[col_name] = pd.to_numeric(raw_df.iloc[:, col_idx], errors="coerce")
                s2_cell_cols.append(col_name)

        df = pd.DataFrame(cleaned_records)

        # 4. Computed Synthesis & Cross-Checks
        # Correct current density if it was recorded in A/cm² vs mA/cm²
        # In Jülich testbed, active area is 300 cm². Nominal current is ~300 A at 1.0 A/cm²
        if "i_meas_stack1" in df.columns and "j_meas_stack1" in df.columns:
            # If j is close to I / 300, it is A/cm². If j is close to (I/300)*1000, it is mA/cm²
            sample_mask = (df["i_meas_stack1"] > 50) & (df["j_meas_stack1"] > 0)
            if sample_mask.any():
                ratio = (df.loc[sample_mask, "i_meas_stack1"] / df.loc[sample_mask, "j_meas_stack1"]).median()
                if 250 <= ratio <= 350:
                    # j is in A/cm²
                    df["j_meas_stack1_A_cm2"] = df["j_meas_stack1"]
                else:
                    # j is in mA/cm² -> convert to A/cm²
                    df["j_meas_stack1_A_cm2"] = df["j_meas_stack1"] / 1000.0
            else:
                df["j_meas_stack1_A_cm2"] = df["i_meas_stack1"] / MEA_ACTIVE_AREA_CM2
        else:
            df["j_meas_stack1_A_cm2"] = 0.0

        # Stack power calculations
        if "u_meas_stack1" in df.columns and "i_meas_stack1" in df.columns:
            df["power_stack1_kw"] = (df["u_meas_stack1"] * df["i_meas_stack1"]) / 1000.0
        else:
            df["power_stack1_kw"] = 0.0

        if "u_meas_stack2" in df.columns and "i_meas_stack2" in df.columns:
            df["power_stack2_kw"] = (df["u_meas_stack2"] * df["i_meas_stack2"]) / 1000.0
        else:
            df["power_stack2_kw"] = 0.0

        df["power_total_kw"] = df["power_stack1_kw"] + df["power_stack2_kw"]

        # Cell Voltage Distribution statistics across 30 cells
        if s1_cell_cols:
            df["u_cell_s1_mean"] = df[s1_cell_cols].mean(axis=1)
            df["u_cell_s1_std"] = df[s1_cell_cols].std(axis=1)
            df["u_cell_s1_min"] = df[s1_cell_cols].min(axis=1)
            df["u_cell_s1_max"] = df[s1_cell_cols].max(axis=1)

        # Average internal stack temperature
        t_cols = [c for c in ["t_stack_1", "t_stack_2", "t_stack_3"] if c in df.columns]
        if t_cols:
            df["t_stack_mean_c"] = df[t_cols].mean(axis=1)
        elif "t_anode_out" in df.columns:
            df["t_stack_mean_c"] = df["t_anode_out"]
        else:
            df["t_stack_mean_c"] = 60.0

        # Convert H2 volumetric flow (m³/h) to mass flow (kg/h)
        # Normal density of H2 at standard conditions is ~0.08988 kg/m³
        if "h2_flow_rate" in df.columns:
            df["h2_mass_flow_kg_h"] = df["h2_flow_rate"] * 0.08988
        else:
            df["h2_mass_flow_kg_h"] = 0.0

        # Clean NaNs using forward fill then backward fill
        df = df.ffill().bfill().fillna(0.0)
        return df


def extract_steady_state_polarization(df: pd.DataFrame, window_s: int = 120, tolerance_current: float = 2.0) -> pd.DataFrame:
    """Extract steady-state (current, voltage, temperature) operating points for model calibration.
    
    Identifies plateaus where stack current variation is within tolerance for at least window_s.
    """
    if "i_meas_stack1" not in df.columns or "u_meas_stack1" not in df.columns:
        return pd.DataFrame()

    df_filtered = df[df["i_meas_stack1"] > 5].copy()
    if len(df_filtered) < 10:
        return pd.DataFrame()

    # Rolling standard deviation over window
    rolling_std = df_filtered["i_meas_stack1"].rolling(window=10, min_periods=5).std()
    steady_points = df_filtered[rolling_std < tolerance_current]

    # Cluster or bin by current in steps of 20 A
    if len(steady_points) == 0:
        steady_points = df_filtered

    steady_points["current_bin"] = (steady_points["i_meas_stack1"] / 25.0).round() * 25.0
    agg_dict = {
        "i_meas_stack1": "mean",
        "j_meas_stack1_A_cm2": "mean",
        "u_meas_stack1": "mean",
        "t_stack_mean_c": "mean",
        "h2_mass_flow_kg_h": "mean",
    }
    if "i_meas_stack2" in steady_points.columns:
        agg_dict["i_meas_stack2"] = "mean"
    if "u_meas_stack2" in steady_points.columns:
        agg_dict["u_meas_stack2"] = "mean"

    polarization = steady_points.groupby("current_bin").agg(agg_dict).reset_index(drop=True)

    polarization["u_cell_mean"] = polarization["u_meas_stack1"] / CELLS_PER_STACK
    polarization = polarization.sort_values(by="j_meas_stack1_A_cm2").reset_index(drop=True)
    return polarization
