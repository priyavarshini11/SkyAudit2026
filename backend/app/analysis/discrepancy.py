"""Discrepancy Engine: compares expected timeline commitments vs observable satellite evidence."""
from datetime import datetime, date
from typing import Optional
from ..schemas.analysis import DiscrepancyResult


def calculate_expected_progress(start_date_str: str, end_date_str: str, as_of_date_str: Optional[str] = None) -> float:
    """
    Calculate linear expected progress percentage based on elapsed time vs total project duration.
    """
    try:
        start = datetime.strptime(start_date_str, "%Y-%m-%d").date()
        end = datetime.strptime(end_date_str, "%Y-%m-%d").date()
        
        if as_of_date_str:
            current = datetime.strptime(as_of_date_str, "%Y-%m-%d").date()
        else:
            current = date.today()

        total_days = (end - start).days
        if total_days <= 0:
            return 100.0

        elapsed_days = (current - start).days
        if elapsed_days <= 0:
            return 0.0

        progress = (elapsed_days / total_days) * 100.0
        return round(float(min(100.0, max(0.0, progress))), 1)
    except Exception as e:
        print(f"Error calculating expected progress: {e}")
        return 75.0


def evaluate_discrepancy(
    expected_progress: float,
    observable_progress: float,
    confidence: float,
    threshold_gap: float = 25.0
) -> DiscrepancyResult:
    """
    Evaluate discrepancy between timeline expectations and physical satellite evidence.
    
    Principles:
    - Evidence over claims (satellite is evidence, not ground truth).
    - Conservative conclusions: Use 'Potential Schedule Discrepancy' instead of 'Fraud'.
    - Human-in-the-loop: Provide decision-support for prioritising site inspections.
    """
    gap = round(expected_progress - observable_progress, 1)

    if confidence < 50.0:
        return DiscrepancyResult(
            status="Insufficient Evidence",
            status_category="insufficient_evidence",
            severity="low",
            discrepancy_gap_pct=gap,
            explanation=(
                f"Confidence level ({confidence}%) is below the reliable threshold for automated verification. "
                "Cloud cover, limited observation frequency, or boundary uncertainty requires additional satellite passes."
            ),
            recommendations=[
                "Schedule additional Sentinel-2 / Planet imagery acquisitions.",
                "Verify project geographic alignment and coordinate boundaries.",
                "Review ground contractor logs."
            ]
        )

    # High confidence + substantial gap
    if expected_progress >= 65.0 and observable_progress <= 40.0 and confidence >= 65.0:
        return DiscrepancyResult(
            status="Potential Schedule Discrepancy",
            status_category="potential_discrepancy",
            severity="high",
            discrepancy_gap_pct=gap,
            explanation=(
                f"Expected completion is at {expected_progress}% based on contractual milestones, but multi-temporal "
                f"satellite observations indicate only {observable_progress}% observable surface change (confidence: {confidence}%). "
                "Physical corridor evidence indicates clearing/paving is significantly behind schedule."
            ),
            recommendations=[
                "Prioritize for immediate targeted on-site engineering inspection.",
                "Request contractor interim billing and material delivery manifests.",
                "Cross-reference recent milestone completion claims against satellite corridor segments."
            ]
        )

    # Moderate gap
    if gap >= threshold_gap and confidence >= 60.0:
        return DiscrepancyResult(
            status="Potential Schedule Discrepancy",
            status_category="potential_discrepancy",
            severity="medium",
            discrepancy_gap_pct=gap,
            explanation=(
                f"Observable progress ({observable_progress}%) lags behind contractual expectation ({expected_progress}%) "
                f"by {gap}% with {confidence}% confidence."
            ),
            recommendations=[
                "Monitor upcoming bi-weekly satellite passes for accelerated earthworks.",
                "Conduct milestone alignment review with local oversight authorities."
            ]
        )

    # Consistent with timeline
    return DiscrepancyResult(
        status="Consistent with Observed Evidence",
        status_category="on_track",
        severity="low",
        discrepancy_gap_pct=gap,
        explanation=(
            f"Observable physical progress ({observable_progress}%) correlates with timeline expectations ({expected_progress}%). "
            f"Corridor clearing, earthworks, and surface changes align with active project execution."
        ),
        recommendations=[
            "Continue standard automated satellite monitoring schedule.",
            "Archive current observation milestone report."
        ]
    )
