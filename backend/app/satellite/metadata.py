"""Satellite observation metadata parsing and validation."""
from typing import Any, Dict, List, Optional
import os
import json
from datetime import datetime
from ..schemas.evidence import SatelliteObservation


def load_observation_metadata(metadata_file_or_dir: str) -> List[SatelliteObservation]:
    """Load satellite observations list from a project directory or metadata.json file."""
    if os.path.isdir(metadata_file_or_dir):
        metadata_path = os.path.join(metadata_file_or_dir, "metadata.json")
    else:
        metadata_path = metadata_file_or_dir

    if not os.path.exists(metadata_path):
        return []

    try:
        with open(metadata_path, "r", encoding="utf-8") as f:
            data = json.load(f)

        observations_data = data.get("observations", [])
        observations = []
        for obs in observations_data:
            observations.append(SatelliteObservation(
                id=obs.get("id", f"obs-{obs.get('date', 'unknown')}"),
                date=obs.get("date", datetime.today().strftime("%Y-%m-%d")),
                source=obs.get("source", "Sentinel-2"),
                cloud_cover=float(obs.get("cloud_cover", 0.0)),
                resolution_m=float(obs.get("resolution_m", 10.0)),
                bands=obs.get("bands", ["B02", "B03", "B04", "B08"]),
                file_path=obs.get("file_path"),
                preview_url=obs.get("preview_url"),
                mean_ndvi=obs.get("mean_ndvi"),
                mean_surface_reflectance=obs.get("mean_surface_reflectance"),
                corridor_coverage_pct=float(obs.get("corridor_coverage_pct", 100.0)),
            ))
        return sorted(observations, key=lambda x: x.date)
    except Exception as e:
        print(f"Error loading observation metadata: {e}")
        return []
