"""Report generation service for SkyAudit evidence briefs."""
from typing import Any, Dict, List
from datetime import datetime
from ..schemas.evidence import EvidenceReport, SatelliteObservation, EvidenceTimelineItem
from ..schemas.analysis import FullAnalysisResponse


def generate_audit_report(analysis: FullAnalysisResponse) -> EvidenceReport:
    """Generate a comprehensive, printable and exportable evidence report."""
    evidence_breakdown = [
        f"Spatial Change Score: {int(analysis.metrics.spatial_change_score * 100)}% of corridor shows verified surface disruption.",
        f"Vegetation Clearing Index (NDVI drop): {analysis.metrics.ndvi_drop_score} magnitude decrease across baseline.",
        f"Earthwork & Soil Exposure Index: {analysis.metrics.surface_reflectance_score} signature correlation.",
        f"Temporal Monotonicity: {int(analysis.metrics.temporal_consistency * 100)}% consistency over observation intervals.",
        f"Milestone Temporal Alignment: {int(analysis.metrics.milestone_alignment * 100)}% schedule phase coherence."
    ]

    exec_summary = (
        f"Automated satellite verification of '{analysis.project_name}' indicates {analysis.observable_progress}% "
        f"observable physical progress against a {analysis.expected_progress}% schedule expectation. "
        f"Confidence rating is {analysis.confidence}%. "
        f"Current status: {analysis.discrepancy.status}."
    )

    return EvidenceReport(
        project_id=analysis.project_id,
        project_name=analysis.project_name,
        generated_at=datetime.utcnow().strftime("%Y-%m-%d %H:%M UTC"),
        expected_progress_pct=analysis.expected_progress,
        observable_progress_pct=analysis.observable_progress,
        confidence_score_pct=analysis.confidence,
        status=analysis.discrepancy.status,
        status_category=analysis.discrepancy.status_category,
        executive_summary=exec_summary,
        evidence_breakdown=evidence_breakdown,
        timeline=analysis.timeline,
        observations_used=analysis.observations
    )
