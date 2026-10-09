"""Automated unit & integration test suite for SkyAudit local pipeline."""
import os
import pytest
from backend.app.schemas.project import Project, Milestone
from backend.app.schemas.analysis import ChangeMetrics
from backend.app.geo.geometry import create_demo_road_centerline, calculate_linestring_length_km
from backend.app.geo.corridor import buffer_centerline_meters, create_road_corridor_geojson
from backend.app.satellite.loader import generate_realistic_synthetic_sentinel2_series, read_geotiff
from backend.app.satellite.preprocessing import compute_ndvi, compute_bare_soil_index
from backend.app.analysis.change_detection import analyze_multitemporal_changes
from backend.app.analysis.progress import calculate_observable_progress
from backend.app.analysis.confidence import calculate_confidence_score
from backend.app.analysis.discrepancy import calculate_expected_progress, evaluate_discrepancy
from backend.app.services.document_service import parse_tender_text_deterministically
from backend.app.services.analysis_service import AnalysisService


def test_geometry_and_corridor_buffering():
    centerline = create_demo_road_centerline((78.435, 17.395), (78.525, 17.465))
    assert centerline is not None
    assert not centerline.is_empty
    
    length = calculate_linestring_length_km(centerline)
    assert length > 5.0  # Approx 12-14 km

    corridor_geojson = create_road_corridor_geojson(centerline, buffer_meters=50.0)
    assert corridor_geojson["type"] == "Feature"
    assert corridor_geojson["geometry"]["type"] == "Polygon"


def test_satellite_synthetic_series_and_geotiff():
    test_dir = "data/projects/test-road"
    obs = generate_realistic_synthetic_sentinel2_series(output_dir=test_dir)
    assert len(obs) == 3
    
    # Read generated GeoTIFF
    before_tif = os.path.join(test_dir, "before.tif")
    assert os.path.exists(before_tif)
    raster_info = read_geotiff(before_tif)
    assert raster_info["bands_count"] == 4
    assert raster_info["height"] == 256
    assert raster_info["width"] == 256


def test_ndvi_and_soil_indices():
    test_dir = "data/projects/test-road"
    before_tif = os.path.join(test_dir, "before.tif")
    raster_info = read_geotiff(before_tif)
    
    ndvi = compute_ndvi(raster_info["data"])
    assert ndvi.shape == (256, 256)
    assert float(ndvi.mean()) > 0.3  # Vegetated baseline

    bsi = compute_bare_soil_index(raster_info["data"])
    assert bsi.shape == (256, 256)


def test_progress_formula_parameters():
    metrics = ChangeMetrics(
        spatial_change_score=0.62,
        temporal_consistency=0.74,
        construction_feature_score=0.58,
        milestone_alignment=0.70,
        image_quality=0.90,
        ndvi_drop_score=0.45,
        surface_reflectance_score=0.40
    )
    progress_pct, breakdown = calculate_observable_progress(metrics)
    # 0.15*0.45 (6.75) + 0.25*0.40 (10.0) + 0.20*0.62 (12.4) + 0.25*0.58 (14.5) + 0.15*0.74 (11.1) = 54.8%
    assert 50.0 <= progress_pct <= 60.0
    assert breakdown.vegetation_clearance_contribution > 0
    assert breakdown.surface_disturbance_contribution > 0


def test_confidence_is_independent_from_progress():
    metrics = ChangeMetrics(
        spatial_change_score=0.20,  # Low progress
        temporal_consistency=0.90,  # High temporal consistency
        construction_feature_score=0.15,
        milestone_alignment=0.30,
        image_quality=0.95,        # High image quality
        ndvi_drop_score=0.10,
        surface_reflectance_score=0.12
    )
    progress_pct, _ = calculate_observable_progress(metrics)
    confidence_pct, _ = calculate_confidence_score(metrics, observation_coverage=1.0, observation_count=3)
    
    # Progress should be low (~20%), but Confidence should remain high (~80%+)
    assert progress_pct < 35.0
    assert confidence_pct > 70.0


def test_discrepancy_evaluation():
    # Scenario: High expected progress (75%), low observable progress (35%), high confidence (82%)
    discrepancy = evaluate_discrepancy(
        expected_progress=75.0,
        observable_progress=35.0,
        confidence=82.0
    )
    assert discrepancy.status == "Potential Schedule Discrepancy"
    assert discrepancy.status_category == "potential_discrepancy"
    assert discrepancy.severity == "high"


def test_deterministic_tender_text_parsing():
    sample_text = """
    TENDER NOTICE: NH-65 Bypass Expansion
    Location: Hyderabad Outer Ring Corridor, Telangana
    Start Date: 2026-01-15
    Completion Date: 2026-12-30
    Total Length: 14.5 km
    Contract Value: INR 68.50 Crores
    """
    extracted = parse_tender_text_deterministically(sample_text)
    assert "NH-65" in extracted.project_name
    assert extracted.start_date == "2026-01-15"
    assert extracted.expected_completion == "2026-12-30"
    assert extracted.project_length_km == 14.5


def test_full_analysis_service_pipeline():
    service = AnalysisService(data_root="data/projects")
    proj = Project(
        project_id="demo-road-test",
        project_name="Integration Test Corridor",
        project_type="road",
        location_text="Hyderabad Test Region",
        start_date="2026-01-01",
        expected_completion="2026-12-31",
        project_length_km=12.0,
        milestones=[
            Milestone(name="Earthwork", expected_date="2026-06-30")
        ]
    )
    analysis = service.run_full_project_analysis(proj)
    assert analysis.project_id == "demo-road-test"
    assert analysis.observable_progress > 0
    assert analysis.confidence > 0
    assert len(analysis.observations) == 3
    assert len(analysis.timeline) >= 4


def test_government_portal_catalog_and_search():
    from backend.app.services.government_portal_service import (
        search_government_projects,
        get_government_project_by_tender_id,
        convert_gov_record_to_project
    )
    # Search by keyword
    expressways = search_government_projects(query="Expressway")
    assert len(expressways) >= 5

    # Filter by State
    haryana_projects = search_government_projects(state="Haryana")
    assert len(haryana_projects) >= 2

    # Get specific project
    dme = get_government_project_by_tender_id("NHAI/DME/PKG-01/2019")
    assert dme is not None
    assert "Delhi–Mumbai" in dme.project_name
    assert dme.lane_count == 8

    # Convert to SkyAudit Project
    proj = convert_gov_record_to_project(dme)
    assert proj.project_name == dme.project_name
    assert proj.corridor_geometry is not None
    assert proj.corridor_geometry["type"] == "Feature"
    assert len(proj.milestones) == 4


def test_llm_service_extraction_fallback():
    from backend.app.services.llm_service import extract_project_claims_with_gemini
    sample_dpr = """
    NATIONAL HIGHWAYS AUTHORITY OF INDIA
    TENDER FOR: Delhi-Mumbai Expressway Package 1
    Awarded To: GR Infraprojects Ltd.
    Start Date: 2019-02-15
    Completion Date: 2023-02-12
    Total Length: 18.4 km
    Contract Value: INR 1,240 Crores
    1. Right-of-Way Clearing 2019-06-30 Forest clearance
    2. Embankment Formation 2021-03-31 Earthwork and subgrade
    """
    extracted = extract_project_claims_with_gemini(sample_dpr)
    assert extracted is not None
    assert extracted.project_name != ""
    assert extracted.start_date == "2019-02-15"
    assert extracted.expected_completion == "2023-02-12"
    assert extracted.extraction_confidence > 0.8

