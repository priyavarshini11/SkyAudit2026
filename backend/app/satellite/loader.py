"""Satellite imagery loading and synthetic GeoTIFF generation for offline reproducibility."""
from typing import Any, Dict, List, Optional, Tuple
import os
import numpy as np
import rasterio
from rasterio.transform import from_bounds
from rasterio.crs import CRS
from PIL import Image


def read_geotiff(file_path: str) -> Dict[str, Any]:
    """Read a GeoTIFF raster file and return numpy array (bands, H, W) along with profile and metadata."""
    if not os.path.exists(file_path):
        raise FileNotFoundError(f"GeoTIFF file not found at: {file_path}")

    with rasterio.open(file_path) as src:
        data = src.read()  # Shape: (bands, height, width)
        profile = src.profile.copy()
        bounds = src.bounds
        crs = src.crs
        transform = src.transform

    return {
        "data": data,
        "profile": profile,
        "bounds": bounds,
        "crs": crs,
        "transform": transform,
        "bands_count": data.shape[0],
        "height": data.shape[1],
        "width": data.shape[2]
    }


def save_geotiff(
    file_path: str,
    data: np.ndarray,
    bounds: Tuple[float, float, float, float],
    crs: str = "EPSG:4326",
    dtype: str = "float32"
) -> None:
    """Save a multi-band numpy array (Bands, Height, Width) as a GeoTIFF raster."""
    os.makedirs(os.path.dirname(file_path), exist_ok=True)
    count, height, width = data.shape
    minx, miny, maxx, maxy = bounds
    transform = from_bounds(minx, miny, maxx, maxy, width, height)

    profile = {
        "driver": "GTiff",
        "height": height,
        "width": width,
        "count": count,
        "dtype": dtype,
        "crs": CRS.from_string(crs),
        "transform": transform,
        "nodata": None
    }

    with rasterio.open(file_path, "w", **profile) as dst:
        dst.write(data.astype(dtype))


def render_rgb_png(
    data: np.ndarray,
    output_png_path: str,
    band_indices: Tuple[int, int, int] = (2, 1, 0)  # Red (B04), Green (B03), Blue (B02)
) -> str:
    """Convert multi-band raster data (Bands, Height, Width) to an 8-bit RGB PNG file."""
    os.makedirs(os.path.dirname(output_png_path), exist_ok=True)
    r = data[band_indices[0]]
    g = data[band_indices[1]]
    b = data[band_indices[2]]

    def normalize_band(band: np.ndarray) -> np.ndarray:
        p2, p98 = np.percentile(band, (2, 98))
        if p98 > p2:
            scaled = (band - p2) / (p98 - p2)
        else:
            scaled = band / (np.max(band) + 1e-6)
        return (np.clip(scaled, 0, 1) * 255).astype(np.uint8)

    rgb = np.stack([normalize_band(r), normalize_band(g), normalize_band(b)], axis=-1)
    img = Image.fromarray(rgb)
    img.save(output_png_path, format="PNG")
    return output_png_path


def generate_realistic_synthetic_sentinel2_series(
    output_dir: str,
    project_id: str = "demo-road-001",
    start_date: str = "2026-02-15",
    expected_completion: str = "2026-09-28",
    status: str = "Under Construction",
    bounds: Tuple[float, float, float, float] = (78.43, 17.38, 78.53, 17.48),
    height: int = 256,
    width: int = 256
) -> List[Dict[str, Any]]:
    """
    Generate 3 realistic Sentinel-2 GeoTIFFs (Before, Middle, After) for any road infrastructure project.
    Bands: 0=Blue(B02), 1=Green(B03), 2=Red(B04), 3=NIR(B08)
    
    Before: Dense baseline vegetation (High NIR, low Red, low Blue)
    Middle: Land clearing / earthworks along corridor (NIR drops, bare soil Red/NIR increase)
    After: Paved asphalt / subbase or continuing earthwork (depending on status)
    """
    os.makedirs(output_dir, exist_ok=True)
    
    # Deterministic seed unique to this specific project ID
    seed = abs(hash(project_id)) % (2**31)
    np.random.seed(seed)
    
    y, x = np.mgrid[0:height, 0:width]
    
    # Natural landscape undulation
    landscape = np.sin(x / 30.0) * np.cos(y / 35.0) * 0.15 + np.random.normal(0, 0.03, (height, width))
    
    # Road corridor path across image: diagonal spline
    road_center_y = height * 0.25 + (y / height) * 0.5 * height + np.sin(x / 25.0) * 10.0
    dist_to_road = np.abs(y - road_center_y)
    road_mask = np.clip(1.0 - (dist_to_road / 8.0), 0.0, 1.0)  # corridor width ~16 pixels
    
    # BEFORE (Phase 1 - Baseline natural terrain)
    b_blue_1 = np.clip(0.08 + landscape * 0.05, 0.02, 0.3)
    b_green_1 = np.clip(0.14 + landscape * 0.08, 0.05, 0.4)
    b_red_1 = np.clip(0.09 + landscape * 0.06, 0.03, 0.35)
    b_nir_1 = np.clip(0.65 + landscape * 0.12, 0.3, 0.95)
    img_before = np.stack([b_blue_1, b_green_1, b_red_1, b_nir_1], axis=0)
    
    # Determine physical progress factor
    is_completed = "completed" in status.lower() or "operational" in status.lower() or "audited" in status.lower()
    clearing_ratio = 1.0 if is_completed else 0.65
    paving_ratio = 0.95 if is_completed else 0.40
    
    # MIDDLE (Phase 2 - Land clearing / Earthwork)
    clearing_progress = np.clip((x / (width * clearing_ratio)), 0.0, 1.0)
    clearing_mask = road_mask * clearing_progress
    
    b_blue_2 = b_blue_1 * (1 - clearing_mask) + (0.16 + np.random.normal(0, 0.02, (height, width))) * clearing_mask
    b_green_2 = b_green_1 * (1 - clearing_mask) + (0.22 + np.random.normal(0, 0.02, (height, width))) * clearing_mask
    b_red_2 = b_red_1 * (1 - clearing_mask) + (0.29 + np.random.normal(0, 0.02, (height, width))) * clearing_mask
    b_nir_2 = b_nir_1 * (1 - clearing_mask) + (0.31 + np.random.normal(0, 0.02, (height, width))) * clearing_mask
    img_middle = np.stack([b_blue_2, b_green_2, b_red_2, b_nir_2], axis=0)
    
    # AFTER (Phase 3 - Paved Road / Construction Observation)
    paved_progress = np.clip((x / (width * paving_ratio)), 0.0, 1.0)
    paved_mask = road_mask * paved_progress
    
    b_blue_3 = b_blue_2 * (1 - paved_mask) + (0.11 + np.random.normal(0, 0.01, (height, width))) * paved_mask
    b_green_3 = b_green_2 * (1 - paved_mask) + (0.13 + np.random.normal(0, 0.01, (height, width))) * paved_mask
    b_red_3 = b_red_2 * (1 - paved_mask) + (0.12 + np.random.normal(0, 0.01, (height, width))) * paved_mask
    b_nir_3 = b_nir_2 * (1 - paved_mask) + (0.15 + np.random.normal(0, 0.01, (height, width))) * paved_mask
    img_after = np.stack([b_blue_3, b_green_3, b_red_3, b_nir_3], axis=0)

    # Save 3 GeoTIFFs
    before_tif = os.path.join(output_dir, "before.tif")
    middle_tif = os.path.join(output_dir, "middle.tif")
    after_tif = os.path.join(output_dir, "after.tif")
    
    save_geotiff(before_tif, img_before, bounds)
    save_geotiff(middle_tif, img_middle, bounds)
    save_geotiff(after_tif, img_after, bounds)
    
    # Render PNG previews
    render_rgb_png(img_before, os.path.join(output_dir, "before.png"))
    render_rgb_png(img_middle, os.path.join(output_dir, "middle.png"))
    render_rgb_png(img_after, os.path.join(output_dir, "after.png"))

    # Compute realistic timeline dates
    try:
        dt_start = datetime.strptime(start_date[:10], "%Y-%m-%d")
        dt_end = datetime.strptime(expected_completion[:10], "%Y-%m-%d")
        delta = (dt_end - dt_start).days
        d_t0 = dt_start.strftime("%Y-%m-%d")
        d_t1 = (dt_start + timedelta(days=int(delta * 0.5))).strftime("%Y-%m-%d")
        d_t2 = dt_end.strftime("%Y-%m-%d") if is_completed else (dt_start + timedelta(days=int(delta * 0.85))).strftime("%Y-%m-%d")
    except Exception:
        d_t0 = start_date or "2022-01-15"
        d_t1 = "2023-06-20"
        d_t2 = expected_completion or "2024-12-10"

    mean_ndvi_t0 = round(float(np.mean((b_nir_1 - b_red_1) / (b_nir_1 + b_red_1 + 1e-6))), 3)
    mean_ndvi_t1 = round(float(np.mean((b_nir_2 - b_red_2) / (b_nir_2 + b_red_2 + 1e-6))), 3)
    mean_ndvi_t2 = round(float(np.mean((b_nir_3 - b_red_3) / (b_nir_3 + b_red_3 + 1e-6))), 3)

    observations = [
        {
            "id": "T0",
            "date": d_t0,
            "source": "Sentinel-2A MSI (ESA)",
            "cloud_cover": 0.8,
            "resolution_m": 10.0,
            "bands": ["B02 (Blue)", "B03 (Green)", "B04 (Red)", "B08 (NIR)"],
            "file_path": before_tif,
            "preview_url": f"/api/projects/{project_id}/images/before.png",
            "mean_ndvi": max(0.1, mean_ndvi_t0),
            "corridor_coverage_pct": 100.0,
            "notes": "Pre-construction baseline optical pass"
        },
        {
            "id": "T1",
            "date": d_t1,
            "source": "Sentinel-2B MSI (ESA)",
            "cloud_cover": 1.4,
            "resolution_m": 10.0,
            "bands": ["B02 (Blue)", "B03 (Green)", "B04 (Red)", "B08 (NIR)"],
            "file_path": middle_tif,
            "preview_url": f"/api/projects/{project_id}/images/middle.png",
            "mean_ndvi": max(0.1, mean_ndvi_t1),
            "corridor_coverage_pct": 99.2,
            "notes": "Mid-term earthworks and ground disturbance detection"
        },
        {
            "id": "T2",
            "date": d_t2,
            "source": "Sentinel-2A MSI (ESA)",
            "cloud_cover": 0.5,
            "resolution_m": 10.0,
            "bands": ["B02 (Blue)", "B03 (Green)", "B04 (Red)", "B08 (NIR)"],
            "file_path": after_tif,
            "preview_url": f"/api/projects/{project_id}/images/after.png",
            "mean_ndvi": max(0.1, mean_ndvi_t2),
            "corridor_coverage_pct": 100.0,
            "notes": "Latest verification pass (paving & corridor continuity)"
        }
    ]
    return observations
