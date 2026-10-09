from typing import Any, Dict, List, Optional
from pydantic import BaseModel, Field


class SatelliteObservation(BaseModel):
    id: str
    date: str
    source: str = "Sentinel-2"
    cloud_cover: float = 0.0
    resolution_m: float = 10.0
    bands: List[str] = Field(default_factory=lambda: ["B02", "B03", "B04", "B08"])
    file_path: Optional[str] = None
    preview_url: Optional[str] = None
    mean_ndvi: Optional[float] = None
    mean_surface_reflectance: Optional[float] = None
    corridor_coverage_pct: float = 100.0


class EvidenceTimelineItem(BaseModel):
    date: str
    phase: str
    title: str
    description: str
    observation_id: Optional[str] = None
    change_level: str = "nominal"  # low, moderate, high, significant
    metrics: Dict[str, float] = Field(default_factory=dict)
    key_findings: List[str] = Field(default_factory=list)


class EvidenceReport(BaseModel):
    project_id: str
    project_name: str
    generated_at: str
    expected_progress_pct: float
    observable_progress_pct: float
    confidence_score_pct: float
    status: str
    status_category: str  # on_track, potential_discrepancy, critical_discrepancy, insufficient_evidence
    executive_summary: str
    evidence_breakdown: List[str]
    timeline: List[EvidenceTimelineItem]
    observations_used: List[SatelliteObservation]
    disclaimer: str = (
        "This assessment is derived from automated multispectral satellite observation analysis. "
        "Satellite imagery represents independent observable physical evidence, not legal or ground-truth proof of fraud or contractual completion."
    )
