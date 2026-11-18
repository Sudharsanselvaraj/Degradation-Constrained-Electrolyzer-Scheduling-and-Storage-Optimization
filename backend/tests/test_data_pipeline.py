"""
Automated unit tests for Jülich data engine, schema, and preprocessing pipeline.
"""

from pathlib import Path
import pytest
import pandas as pd

from backend.app.data_engine.schema import (
    CELLS_PER_STACK,
    CORE_CHANNELS,
    MEA_ACTIVE_AREA_CM2,
    NUM_STACKS,
    STACK1_CELL_VOLTAGE_COLS,
    TOTAL_CELLS,
)
from backend.app.data_engine.juelich_fetcher import JuelichDataverseClient
from backend.app.data_engine.preprocessing import JuelichDataPreprocessor, extract_steady_state_polarization


def test_schema_definitions():
    """Verify core channel mappings, units, and geometric constants."""
    assert NUM_STACKS == 2
    assert CELLS_PER_STACK == 30
    assert TOTAL_CELLS == 60
    assert MEA_ACTIVE_AREA_CM2 == 300.0

    assert "i_meas_stack1" in CORE_CHANNELS
    assert "u_meas_stack1" in CORE_CHANNELS
    assert "h2_flow_rate" in CORE_CHANNELS
    assert len(STACK1_CELL_VOLTAGE_COLS) == 30


def test_juelich_fetcher_cache():
    """Verify that cached experimental files exist and are readable."""
    client = JuelichDataverseClient()
    cached = client.ensure_curated_experiments()
    assert len(cached) > 0
    for name, p in cached.items():
        assert p.exists()
        assert p.stat().st_size > 100


def test_preprocessing_and_parsing():
    """Verify that raw Excel files parse into clean pandas DataFrames with expected columns."""
    client = JuelichDataverseClient()
    cached = client.ensure_curated_experiments()
    sample_file = cached.get("2020-07-07_1st_Data-measured_Wind-Profile.xlsx")
    assert sample_file is not None

    preprocessor = JuelichDataPreprocessor(sample_file)
    df = preprocessor.parse()

    assert isinstance(df, pd.DataFrame)
    assert len(df) > 100
    assert "time_rel_s" in df.columns
    assert "i_meas_stack1" in df.columns
    assert "u_meas_stack1" in df.columns
    assert "power_stack1_kw" in df.columns
    assert "h2_mass_flow_kg_h" in df.columns
    assert "u_cell_s1_1" in df.columns
    assert "u_cell_s1_30" in df.columns

    # Verify steady-state extraction
    pol = extract_steady_state_polarization(df)
    assert len(pol) > 0
    assert "j_meas_stack1_A_cm2" in pol.columns
    assert "u_cell_mean" in pol.columns
