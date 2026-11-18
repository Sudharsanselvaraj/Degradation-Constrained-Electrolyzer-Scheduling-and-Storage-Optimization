"""
Automated fetcher and local cache manager for the Forschungszentrum Jülich 100 kW PEM dataset.
Dataverse Repository DOI: 10.26165/JUELICH-DATA/FEKKSS
"""

import json
import logging
import os
import urllib.request
from pathlib import Path
from typing import Dict, List, Optional

logger = logging.getLogger(__name__)

DATAVERSE_BASE_URL = "https://data.fz-juelich.de"
PERSISTENT_ID = "doi:10.26165/JUELICH-DATA/FEKKSS"
DEFAULT_CACHE_DIR = Path(__file__).resolve().parent.parent.parent / "datasets" / "juelich_raw"

# Representative curated files across the 2018-2023 operational timeline
CURATED_EXPERIMENT_FILES = [
    # Documentation
    {"id": 37315, "filename": "01_Data_Overview.pdf", "category": "doc"},
    {"id": 37314, "filename": "01_Structure_Organization_Data.pdf", "category": "doc"},
    {"id": 37791, "filename": "01_Process_flow_diagram_100kW-electrolyzer.pdf", "category": "doc"},
    
    # 2018 Commissioning & Startup Phase
    {"id": 21902, "filename": "2018-02-06_Data_startup-phase_manual-mode.xlsx", "category": "startup"},
    
    # 2020 Dynamic Wind Profile & Current Steps
    {"id": 21996, "filename": "2020-07-07_1st_Data-measured_Wind-Profile.xlsx", "category": "dynamic_wind"},
    {"id": 22157, "filename": "2020-07-07_2nd_Data-measured_Wind-Profile.xlsx", "category": "dynamic_wind"},
    
    # 2020 Dynamic PV Phoebus Profile
    {"id": 21932, "filename": "2020-11-03_Data_measured_Kombi-PV-Profile_PHOEBUS-1.xlsx", "category": "dynamic_pv"},
    {"id": 22089, "filename": "2020-11-05_Data_measured_Kombi-PV-Profile_PHOEBUS-2.xlsx", "category": "dynamic_pv"},
    
    # 2023 Highly Dynamic Ramping and Shutdown Constraints
    {"id": 37087, "filename": "2023-10-11_Data_measured_Test_Dynamic_Ramping_constraints.xlsx", "category": "dynamic_ramping"},
    {"id": 22066, "filename": "2023-11-02_Data-measured_Dynamic-Feedforward_Dynamic-Ramping_no-turn-off_meas-1.xlsx", "category": "dynamic_ramping"},
]


class JuelichDataverseClient:
    def __init__(self, cache_dir: Optional[Path] = None):
        self.cache_dir = cache_dir or DEFAULT_CACHE_DIR
        self.cache_dir.mkdir(parents=True, exist_ok=True)
        self.metadata_cache_file = self.cache_dir / "dataset_metadata.json"

    def get_dataset_metadata(self, force_refresh: bool = False) -> Dict:
        """Fetch or load cached Dataverse dataset metadata."""
        if not force_refresh and self.metadata_cache_file.exists():
            try:
                with open(self.metadata_cache_file, "r", encoding="utf-8") as f:
                    return json.load(f)
            except Exception as e:
                logger.warning(f"Failed to read cached metadata: {e}. Refetching.")

        api_url = f"{DATAVERSE_BASE_URL}/api/datasets/:persistentId/?persistentId={PERSISTENT_ID}"
        req = urllib.request.Request(api_url, headers={"User-Agent": "Antigravity-Research-Platform/1.0"})
        with urllib.request.urlopen(req, timeout=30) as resp:
            data = json.loads(resp.read().decode("utf-8"))
            with open(self.metadata_cache_file, "w", encoding="utf-8") as f:
                json.dump(data, f, indent=2)
            return data

    def list_remote_files(self) -> List[Dict]:
        """List all 258 available operational data files from the Dataverse repo."""
        meta = self.get_dataset_metadata()
        files = meta.get("data", {}).get("latestVersion", {}).get("files", [])
        extracted = []
        for f in files:
            df = f.get("dataFile", {})
            extracted.append({
                "id": df.get("id"),
                "filename": df.get("filename"),
                "filesize": df.get("filesize", 0),
                "checksum": df.get("checksum", {}),
                "description": df.get("description", ""),
            })
        return extracted

    def download_file_by_id(self, file_id: int, filename: str, force_download: bool = False) -> Path:
        """Download an individual file from Jülich Dataverse repository into local cache."""
        target_path = self.cache_dir / filename
        if target_path.exists() and not force_download and target_path.stat().st_size > 1000:
            return target_path

        download_url = f"{DATAVERSE_BASE_URL}/api/access/datafile/{file_id}"
        req = urllib.request.Request(download_url, headers={"User-Agent": "Antigravity-Research-Platform/1.0"})
        
        logger.info(f"Downloading {filename} (id: {file_id}) from Jülich Dataverse...")
        with urllib.request.urlopen(req, timeout=60) as resp:
            content = resp.read()
            with open(target_path, "wb") as f:
                f.write(content)
        logger.info(f"Successfully cached {filename} ({len(content)/(1024*1024):.2f} MB)")
        return target_path

    def ensure_curated_experiments(self) -> Dict[str, Path]:
        """Ensure all benchmark curated experiment files are downloaded and cached."""
        paths = {}
        for entry in CURATED_EXPERIMENT_FILES:
            target = self.cache_dir / entry["filename"]
            # If scratch already had sample_wind, check if we can reuse or download
            scratch_file = Path("/Users/sudharsan/.gemini/antigravity/brain/12b7d9f8-412c-4cd8-afc4-1afda5f83eb0/scratch/sample_wind.xlsx")
            if not target.exists() and entry["filename"] == "2020-07-07_1st_Data-measured_Wind-Profile.xlsx" and scratch_file.exists():
                import shutil
                shutil.copy(scratch_file, target)
                paths[entry["filename"]] = target
            else:
                p = self.download_file_by_id(entry["id"], entry["filename"])
                paths[entry["filename"]] = p
        return paths


if __name__ == "__main__":
    logging.basicConfig(level=logging.INFO)
    client = JuelichDataverseClient()
    files = client.list_remote_files()
    print(f"Total remote files available: {len(files)}")
    print("Caching curated benchmark experiments...")
    cached = client.ensure_curated_experiments()
    for name, p in cached.items():
        print(f"  {name} -> {p} ({p.stat().st_size / 1024:.1f} KB)")
