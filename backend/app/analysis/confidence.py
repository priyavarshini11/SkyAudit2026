"""Confidence score calculation engine."""
from typing import Tuple
from ..schemas.analysis import ChangeMetrics, ConfidenceBreakdown


def calculate_confidence_score(
    metrics: ChangeMetrics,
    observation_coverage: float = 1.0,
    observation_count: int = 3
) -> Tuple[float, ConfidenceBreakdown]:
    """
    Calculate confidence score independently from observable progress.
    
    Inputs:
    - Image Quality (clarity, low cloud/shadow)
    - Observation Coverage & Count
    - Temporal Consistency
    - Indicator Agreement (NDVI drop vs bare soil increase vs spatial diff)
    
    Formula:
    Confidence = 0.30 * image_quality
               + 0.25 * observation_coverage
               + 0.25 * temporal_consistency
               + 0.20 * indicator_agreement
    """
    w_quality = 0.30
    w_coverage = 0.25
    w_temporal = 0.25
    w_agreement = 0.20

    # Indicator agreement: check if ndvi drop and surface reflectance shift agree
    diff_spread = abs(metrics.ndvi_drop_score - metrics.surface_reflectance_score)
    indicator_agreement = float(max(0.40, min(1.0, 1.0 - diff_spread)))

    # Coverage scale boosted if 3+ observations
    coverage_factor = float(observation_coverage * min(1.0, observation_count / 3.0))

    c_quality = metrics.image_quality * w_quality
    c_coverage = coverage_factor * w_coverage
    c_temporal = metrics.temporal_consistency * w_temporal
    c_agreement = indicator_agreement * w_agreement

    raw_confidence = c_quality + c_coverage + c_temporal + c_agreement
    confidence_pct = round(float(raw_confidence * 100.0), 1)
    confidence_pct = max(0.0, min(100.0, confidence_pct))

    breakdown = ConfidenceBreakdown(
        image_quality_weight=round(c_quality * 100.0, 1),
        observation_coverage_weight=round(c_coverage * 100.0, 1),
        temporal_consistency_weight=round(c_temporal * 100.0, 1),
        indicator_agreement_weight=round(c_agreement * 100.0, 1),
        formula_used="0.30×image_quality + 0.25×observation_coverage + 0.25×temporal_consistency + 0.20×indicator_agreement"
    )

    return confidence_pct, breakdown
