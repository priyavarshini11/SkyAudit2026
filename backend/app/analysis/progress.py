"""Observable Progress calculation engine."""
from typing import Tuple
from ..schemas.analysis import ChangeMetrics, ProgressBreakdown


def calculate_observable_progress(metrics: ChangeMetrics) -> Tuple[float, ProgressBreakdown]:
    """
    Calculate estimated observable infrastructure progress from satellite change metrics.
    
    Formula:
    Observable Progress = 0.15 * veg_clearance
                        + 0.25 * surface_disturbance
                        + 0.20 * corridor_continuity
                        + 0.25 * built_paved_signal
                        + 0.15 * temporal_consistency
    """
    # 1. Vegetation clearance (NDVI drop along corridor)
    score_veg = max(0.20, min(0.95, metrics.ndvi_drop_score if metrics.ndvi_drop_score > 0 else 0.35))
    
    # 2. Surface disturbance (Bare Soil Index / earthworks)
    score_surface = max(0.25, min(0.95, metrics.surface_reflectance_score if metrics.surface_reflectance_score > 0 else 0.40))
    
    # 3. Corridor continuity (Spatial change across chainage)
    score_continuity = max(0.25, min(0.98, metrics.spatial_change_score if metrics.spatial_change_score > 0 else 0.40))
    
    # 4. Built / paved surface signal
    score_built = max(0.20, min(0.92, metrics.construction_feature_score if metrics.construction_feature_score > 0 else 0.30))
    
    # 5. Temporal consistency across sequential passes
    score_temporal = max(0.50, min(0.95, metrics.temporal_consistency if metrics.temporal_consistency > 0 else 0.72))

    w_veg = 0.15
    w_surface = 0.25
    w_continuity = 0.20
    w_built = 0.25
    w_temporal = 0.15

    c_veg = score_veg * w_veg
    c_surface = score_surface * w_surface
    c_continuity = score_continuity * w_continuity
    c_built = score_built * w_built
    c_temporal = score_temporal * w_temporal

    raw_progress = c_veg + c_surface + c_continuity + c_built + c_temporal
    progress_pct = round(float(raw_progress * 100.0), 1)
    progress_pct = max(0.0, min(100.0, progress_pct))

    breakdown = ProgressBreakdown(
        vegetation_clearance_contribution=round(c_veg * 100.0, 1),
        surface_disturbance_contribution=round(c_surface * 100.0, 1),
        corridor_continuity_contribution=round(c_continuity * 100.0, 1),
        built_paved_signal_contribution=round(c_built * 100.0, 1),
        temporal_consistency_contribution=round(c_temporal * 100.0, 1),
        formula_used="0.15×veg_clearance + 0.25×surface_disturbance + 0.20×corridor_continuity + 0.25×built_paved + 0.15×temporal_consistency"
    )

    return progress_pct, breakdown
