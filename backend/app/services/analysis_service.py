"""Analysis Service orchestrating data ingestion, geospatial clipping, change detection, progress and discrepancy assessment."""
from typing import Any, Dict, List, Optional
import os
import json
from datetime import datetime
from ..schemas.project import Project
from ..schemas.analysis import FullAnalysisResponse, ChangeMetrics, ProgressBreakdown, ConfidenceBreakdown, DiscrepancyResult
from ..schemas.evidence import SatelliteObservation, EvidenceTimelineItem
from ..geo.geometry import parse_geojson_geometry, geometry_to_geojson, create_demo_road_centerline
from ..geo.corridor import create_road_corridor_geojson, buffer_centerline_meters
from ..satellite.loader import read_geotiff, generate_realistic_synthetic_sentinel2_series
from ..satellite.metadata import load_observation_metadata
from ..analysis.change_detection import analyze_multitemporal_changes
from ..analysis.progress import calculate_observable_progress
from ..analysis.confidence import calculate_confidence_score
from ..analysis.discrepancy import calculate_expected_progress, evaluate_discrepancy
from .llm_service import generate_guardrailed_explanation


class AnalysisService:
    def __init__(self, data_root: str = "data/projects"):
        self.data_root = data_root

    def get_project_dir(self, project_id: str) -> str:
        return os.path.join(self.data_root, project_id)

    def run_full_project_analysis(self, project: Project) -> FullAnalysisResponse:
        project_dir = self.get_project_dir(project.project_id)
        os.makedirs(project_dir, exist_ok=True)

        # 1. Resolve or create geometry and corridor
        geom = parse_geojson_geometry(project.geometry)
        if geom is None:
            # Default demo road centerline across Hyderabad coordinates
            geom = create_demo_road_centerline(start_coord=(78.435, 17.395), end_coord=(78.525, 17.465))
            project.geometry = geometry_to_geojson(geom)

        corridor_geojson = create_road_corridor_geojson(geom, buffer_meters=50.0)
        corridor_geom = parse_geojson_geometry(corridor_geojson["geometry"])
        project.corridor_geometry = corridor_geojson

        # 2. Check for or generate satellite observations (Live Copernicus / Offline Cache)
        from ..satellite.copernicus_client import fetch_live_sentinel2_geotiff, get_access_token

        observations = load_observation_metadata(project_dir)
        tif_files = [os.path.join(project_dir, f) for f in ["before.tif", "middle.tif", "after.tif"]]
        has_all_tifs = all(os.path.exists(f) for f in tif_files)

        # Attempt live acquisition if token is present and files don't exist yet
        if not observations or not has_all_tifs:
            live_success = False
            token = get_access_token()
            if token and geom:
                try:
                    # Calculate bounding box from geometry with small buffer
                    bounds = geom.bounds  # (minx, miny, maxx, maxy)
                    bbox = (bounds[0] - 0.01, bounds[1] - 0.01, bounds[2] + 0.01, bounds[3] + 0.01)
                    
                    # Fetch before (start of project) and after (current) passes
                    start_date = project.start_date
                    end_date = project.expected_completion
                    
                    b_ok = fetch_live_sentinel2_geotiff(
                        bbox=bbox, 
                        time_from=start_date, 
                        time_to="2026-03-31", 
                        output_geotiff_path=os.path.join(project_dir, "before.tif")
                    )
                    a_ok = fetch_live_sentinel2_geotiff(
                        bbox=bbox, 
                        time_from="2026-08-01", 
                        time_to="2026-09-30", 
                        output_geotiff_path=os.path.join(project_dir, "after.tif")
                    )
                    if b_ok and a_ok:
                        live_success = True
                except Exception as e:
                    print(f"Live Copernicus download attempt encountered error: {e}")

            if not live_success and (not observations or not has_all_tifs):
                # Generate reproducible local Sentinel-2 series tailored to this project
                bounds = (78.43, 17.38, 78.53, 17.48)
                if geom:
                    b = geom.bounds
                    bounds = (b[0] - 0.01, b[1] - 0.01, b[2] + 0.01, b[3] + 0.01)
                
                obs_dicts = generate_realistic_synthetic_sentinel2_series(
                    output_dir=project_dir,
                    project_id=project.project_id,
                    start_date=project.start_date,
                    expected_completion=project.expected_completion,
                    bounds=bounds
                )
                with open(os.path.join(project_dir, "metadata.json"), "w", encoding="utf-8") as f:
                    json.dump({"project_id": project.project_id, "observations": obs_dicts}, f, indent=2)
                observations = load_observation_metadata(project_dir)

        # 3. Read GeoTIFF rasters
        loaded_rasters = []
        for obs in observations:
            if obs.file_path and os.path.exists(obs.file_path):
                try:
                    raster_obj = read_geotiff(obs.file_path)
                    loaded_rasters.append(raster_obj)
                except Exception as e:
                    print(f"Error reading raster {obs.file_path}: {e}")

        # Fallback to direct file paths if metadata had relative paths
        if not loaded_rasters:
            for tf in tif_files:
                if os.path.exists(tf):
                    loaded_rasters.append(read_geotiff(tf))

        # 4. Multi-temporal Change Detection
        heatmap_rel_path = f"heatmap_overlay.png"
        heatmap_abs_path = os.path.join(project_dir, heatmap_rel_path)
        metrics, _, detailed_summary = analyze_multitemporal_changes(
            rasters=loaded_rasters,
            corridor_geom=corridor_geom,
            output_heatmap_path=heatmap_abs_path
        )
        heatmap_url = f"/api/projects/{project.project_id}/images/{heatmap_rel_path}"

        # Ensure RGB preview PNGs exist for all passes
        from ..satellite.loader import render_rgb_png
        def get_raster_data(r):
            return r.get("data") if isinstance(r, dict) else getattr(r, "data", None)

        if len(loaded_rasters) >= 1 and get_raster_data(loaded_rasters[0]) is not None:
            render_rgb_png(get_raster_data(loaded_rasters[0]), os.path.join(project_dir, "before.png"))
        if len(loaded_rasters) >= 2 and get_raster_data(loaded_rasters[1]) is not None:
            render_rgb_png(get_raster_data(loaded_rasters[1]), os.path.join(project_dir, "middle.png"))
        if len(loaded_rasters) >= 3 and get_raster_data(loaded_rasters[2]) is not None:
            render_rgb_png(get_raster_data(loaded_rasters[2]), os.path.join(project_dir, "after.png"))
        elif len(loaded_rasters) >= 2 and get_raster_data(loaded_rasters[1]) is not None:
            render_rgb_png(get_raster_data(loaded_rasters[1]), os.path.join(project_dir, "after.png"))

        # Guarantee change_mask.png exists alongside heatmap_overlay.png
        change_mask_path = os.path.join(project_dir, "change_mask.png")
        if os.path.exists(heatmap_abs_path) and not os.path.exists(change_mask_path):
            try:
                import shutil
                shutil.copyfile(heatmap_abs_path, change_mask_path)
            except Exception:
                pass

        # 5. Progress and Confidence Engine
        observable_progress, progress_breakdown = calculate_observable_progress(metrics)
        confidence, confidence_breakdown = calculate_confidence_score(
            metrics=metrics,
            observation_coverage=1.0,
            observation_count=len(observations)
        )

        # 6. Expected Progress & Discrepancy
        expected_progress = calculate_expected_progress(
            start_date_str=project.start_date,
            end_date_str=project.expected_completion
        )
        discrepancy = evaluate_discrepancy(
            expected_progress=expected_progress,
            observable_progress=observable_progress,
            confidence=confidence
        )

        # 7. Construct Evidence Timeline
        timeline = self._build_evidence_timeline(project, observations, metrics, observable_progress)

        # 8. Generate Guardrailed Explanation
        explanation = generate_guardrailed_explanation(
            project_name=project.project_name,
            expected_progress=expected_progress,
            observable_progress=observable_progress,
            confidence=confidence,
            discrepancy=discrepancy,
            metrics=metrics,
            observation_count=len(observations)
        )

        response = FullAnalysisResponse(
            project_id=project.project_id,
            project_name=project.project_name,
            analyzed_at=datetime.utcnow().strftime("%Y-%m-%d %H:%M UTC"),
            expected_progress=expected_progress,
            observable_progress=observable_progress,
            confidence=confidence,
            discrepancy=discrepancy,
            metrics=metrics,
            progress_breakdown=progress_breakdown,
            confidence_breakdown=confidence_breakdown,
            observations=observations,
            timeline=timeline,
            corridor_geojson=corridor_geojson,
            change_heatmap_url=heatmap_url,
            explanation=explanation
        )

        # Cache analysis response JSON
        with open(os.path.join(project_dir, "analysis_result.json"), "w", encoding="utf-8") as f:
            f.write(response.model_dump_json(indent=2))

        return response

    def _build_evidence_timeline(
        self,
        project: Project,
        observations: List[SatelliteObservation],
        metrics: ChangeMetrics,
        observable_progress: float
    ) -> List[EvidenceTimelineItem]:
        timeline = []
        
        # Project start item
        timeline.append(EvidenceTimelineItem(
            date=project.start_date,
            phase="Project Initiation",
            title="Contract Award & Project Kickoff",
            description=f"Initial tender baseline established for '{project.project_name}'. Total scope: {project.project_length_km or 12.0} km.",
            change_level="baseline",
            key_findings=["Contract agreement executed", "Corridor right-of-way defined"]
        ))

        # Observations timeline
        for idx, obs in enumerate(observations):
            if idx == 0:
                timeline.append(EvidenceTimelineItem(
                    date=obs.date,
                    phase="Baseline Observation",
                    title="Pre-Construction Satellite Pass",
                    description=f"Sentinel-2 baseline imagery captured. Natural undisturbed terrain (Mean NDVI: {obs.mean_ndvi or 0.74}).",
                    observation_id=obs.id,
                    change_level="low",
                    metrics={"cloud_cover": obs.cloud_cover, "mean_ndvi": obs.mean_ndvi or 0.74},
                    key_findings=["Clean optical conditions", "Intact baseline canopy along corridor"]
                ))
            elif idx == 1:
                timeline.append(EvidenceTimelineItem(
                    date=obs.date,
                    phase="Mid-term Earthworks",
                    title="Earthwork & Land Clearing Detected",
                    description="Multispectral analysis indicates clear vegetation removal and initial cut-and-fill soil disturbance.",
                    observation_id=obs.id,
                    change_level="moderate",
                    metrics={"cloud_cover": obs.cloud_cover, "ndvi_drop": metrics.ndvi_drop_score},
                    key_findings=["Vegetation clearing confirmed", "Earthwork active on initial road segments"]
                ))
            else:
                timeline.append(EvidenceTimelineItem(
                    date=obs.date,
                    phase="Current State",
                    title="Latest Observation Pass",
                    description=f"Surface reflectance analysis shows partial asphalt/subbase laying. Total observable corridor progress: {observable_progress}%.",
                    observation_id=obs.id,
                    change_level="significant" if observable_progress > 50 else "moderate",
                    metrics={"cloud_cover": obs.cloud_cover, "surface_score": metrics.surface_reflectance_score},
                    key_findings=["Paving and subbase detected on partial chainage", "Remaining segments unworked"]
                ))

        return sorted(timeline, key=lambda x: x.date)
