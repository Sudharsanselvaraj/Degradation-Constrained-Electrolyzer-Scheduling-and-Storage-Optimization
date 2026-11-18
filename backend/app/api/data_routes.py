"""
API Routes for Dataset Exploration and Ingestion.
"""

from fastapi import APIRouter, HTTPException
from pathlib import Path
from typing import Dict, List

from backend.app.data_engine.dataset_audit import run_dataset_audit
from backend.app.data_engine.juelich_fetcher import JuelichDataverseClient
from backend.app.data_engine.preprocessing import JuelichDataPreprocessor, extract_steady_state_polarization

router = APIRouter(prefix="/api/data", tags=["data"])


@router.get("/files")
def list_available_files():
    """List all curated and cached experimental datasets."""
    client = JuelichDataverseClient()
    cached = client.ensure_curated_experiments()
    file_list = []
    for name, path in cached.items():
        file_list.append({
            "filename": name,
            "path": str(path),
            "size_kb": round(path.stat().st_size / 1024, 1),
            "category": "experimental_data" if name.endswith(".xlsx") else "documentation",
        })
    return {"files": file_list}


@router.get("/audit")
def get_dataset_audit():
    """Run or return dataset audit summary metrics."""
    try:
        summary = run_dataset_audit()
        return {"status": "success", "audit": summary}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/polarization")
def get_empirical_polarization():
    """Get extracted empirical steady-state polarization curve points."""
    raw_dir = Path(__file__).resolve().parent.parent.parent / "datasets" / "juelich_raw"
    sample = raw_dir / "2020-07-07_1st_Data-measured_Wind-Profile.xlsx"
    if not sample.exists():
        client = JuelichDataverseClient()
        client.ensure_curated_experiments()

    proc = JuelichDataPreprocessor(sample)
    df = proc.parse()
    pol = extract_steady_state_polarization(df)
    return {"points": pol.to_dict(orient="records")}
