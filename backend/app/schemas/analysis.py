from typing import Any, Dict, List, Optional
from pydantic import BaseModel, Field
from .evidence import EvidenceTimelineItem, SatelliteObservation


class ChangeMetrics(BaseModel):
    spatial_change_score: float = Field(..., description="Proportion of monitored corridor with verified spectral change (0.0 - 1.0)")
    temporal_consistency: float = Field(..., description="Monotonicity & consistency of change across sequential observations (0.0 - 1.0)")
    construction_feature_score: float = Field(..., description="Spectral alignment with bare soil, clearing, and paving signatures (0.0 - 1.0)")
    milestone_alignment: float = Field(..., description="Alignment between observed disturbance dates and milestone schedules (0.0 - 1.0)")
    image_quality: float = Field(..., description="Average image clarity, low cloud/shadow interference (0.0 - 1.0)")
    ndvi_drop_score: float = Field(0.0, description="Vegetation clearing magnitude along corridor")
    surface_reflectance_score: float = Field(0.0, description="Soil exposure / asphalt paving reflectance shift")


class ProgressBreakdown(BaseModel):
    vegetation_clearance_contribution: float = 5.2
    surface_disturbance_contribution: float = 10.0
    corridor_continuity_contribution: float = 8.0
    built_paved_signal_contribution: float = 7.5
    temporal_consistency_contribution: float = 10.8
    formula_used: str = "0.15×veg_clearance + 0.25×surface_disturbance + 0.20×corridor_continuity + 0.25×built_paved + 0.15×temporal_consistency"


class ConfidenceBreakdown(BaseModel):
    image_quality_weight: float
    observation_coverage_weight: float
    temporal_consistency_weight: float
    indicator_agreement_weight: float
    formula_used: str = "0.30*quality + 0.25*coverage + 0.25*temporal + 0.20*agreement"


class DiscrepancyResult(BaseModel):
    status: str = Field(..., description="e.g. 'Potential Schedule Discrepancy', 'On Track', 'Insufficient Evidence'")
    status_category: str = Field(..., description="'potential_discrepancy', 'on_track', 'insufficient_evidence', 'delayed'")
    severity: str = Field("medium", description="'low', 'medium', 'high', 'critical'")
    discrepancy_gap_pct: float = Field(..., description="Expected progress minus Observable progress")
    explanation: str = Field(..., description="Clear human-readable reason for the status")
    recommendations: List[str] = Field(default_factory=list)


class FullAnalysisResponse(BaseModel):
    project_id: str
    project_name: str
    analyzed_at: str
    expected_progress: float = Field(..., description="Expected progress percentage (0-100)")
    observable_progress: float = Field(..., description="Observed progress percentage (0-100)")
    confidence: float = Field(..., description="Confidence score percentage (0-100)")
    discrepancy: DiscrepancyResult
    metrics: ChangeMetrics
    progress_breakdown: ProgressBreakdown
    confidence_breakdown: ConfidenceBreakdown
    observations: List[SatelliteObservation]
    timeline: List[EvidenceTimelineItem]
    corridor_geojson: Optional[Dict[str, Any]] = None
    change_heatmap_url: Optional[str] = None
    explanation: str
