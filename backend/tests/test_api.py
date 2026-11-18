"""
Automated integration tests for FastAPI REST endpoints.
"""

import pytest
from fastapi.testclient import TestClient

from backend.app.main import app

client = TestClient(app)


def test_root_endpoint():
    """Verify API root endpoint."""
    response = client.get("/")
    assert response.status_code == 200
    data = response.json()
    assert data["platform"] == "Forecast-Aware Green Hydrogen Digital Twin"


def test_data_files_endpoint():
    """Verify dataset files listing endpoint."""
    response = client.get("/api/data/files")
    assert response.status_code == 200
    data = response.json()
    assert "files" in data
    assert len(data["files"]) > 0


def test_twin_polarization_endpoint():
    """Verify digital twin synthetic polarization curve generation."""
    response = client.get("/api/twin/polarization_curve?temp_c=60.0&num_points=15")
    assert response.status_code == 200
    data = response.json()
    assert "curve" in data
    assert len(data["curve"]) == 15
    assert data["curve"][-1]["v_cell_mean_v"] > 1.5


def test_forecast_generate_endpoint():
    """Verify renewable forecast generation endpoint."""
    response = client.get("/api/forecast/generate?days=1")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "success"
    assert "forecast" in data
    assert len(data["forecast"]) > 0


def test_optimizer_run_endpoint():
    """Verify optimization endpoint solves and returns schedule."""
    req_payload = {
        "renewable_p10_kw": [40.0] * 12,
        "renewable_p50_kw": [60.0] * 12,
        "c_electricity_eur_mwh": [75.0] * 12,
        "demand_kg_h": [2.5] * 12,
        "health_mean": 0.95,
        "health_std": 0.03,
        "initial_storage_kg": 25.0,
        "dt_hours": 0.5,
    }
    response = client.post("/api/optimizer/run", json=req_payload)
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "success"
    assert len(data["p_stack_kw"]) == 12
    assert "p_max_effective_kw" in data


def test_scenario_run_endpoint():
    """Verify scenario what-if simulation endpoint."""
    payload = {
        "solar_availability_pct": 75.0,
        "wind_availability_pct": 35.0,
        "initial_health_pct": 90.0,
        "hydrogen_demand_target_kg": 65.0,
        "uncertainty_level": "moderate",
        "scenario_type": "solar_dropout",
        "inject_timeout": False,
    }
    response = client.post("/api/scenarios/run", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "success"
    assert "results" in data
