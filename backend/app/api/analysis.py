"""Analysis API endpoints."""
from typing import Any, Dict, List
import os
import json
from fastapi import APIRouter, HTTPException
from ..schemas.analysis import FullAnalysisResponse
from ..schemas.evidence import SatelliteObservation
from ..services.analysis_service import AnalysisService
from .projects import _projects_cache, DATA_ROOT

router = APIRouter(prefix="/api/projects", tags=["analysis"])
analysis_service = AnalysisService(data_root=DATA_ROOT)


@router.post("/{project_id}/analyze", response_model=FullAnalysisResponse)
def run_project_analysis(project_id: str):
    """
    Run full multi-temporal satellite change detection and progress verification.
    """
    if project_id not in _projects_cache:
        raise HTTPException(status_code=404, detail="Project not found")

    project = _projects_cache[project_id]
    try:
        response = analysis_service.run_full_project_analysis(project)
        project.has_imagery = True
        project.observation_count = len(response.observations)
        return response
    except Exception as e:
        import traceback
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=f"Analysis failed: {str(e)}")


@router.get("/{project_id}/analysis", response_model=FullAnalysisResponse)
def get_latest_analysis(project_id: str):
    """
    Retrieve latest cached analysis result. If not yet run, run it automatically.
    """
    if project_id not in _projects_cache:
        raise HTTPException(status_code=404, detail="Project not found")

    project_dir = os.path.join(DATA_ROOT, project_id)
    cache_file = os.path.join(project_dir, "analysis_result.json")

    if os.path.exists(cache_file):
        with open(cache_file, "r", encoding="utf-8") as f:
            data = json.load(f)
            return FullAnalysisResponse(**data)

    # Run analysis if cache doesn't exist
    return run_project_analysis(project_id)


@router.get("/{project_id}/evidence", response_model=List[SatelliteObservation])
def get_project_evidence(project_id: str):
    """
    Retrieve list of satellite observations and optical evidence.
    """
    analysis = get_latest_analysis(project_id)
    return analysis.observations
