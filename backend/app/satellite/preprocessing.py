"""Satellite imagery preprocessing and index calculations."""
from typing import Any, Dict, List, Optional, Tuple
import numpy as np
import rasterio
from rasterio.features import rasterize
from shapely.geometry import shape, mapping


def compute_ndvi(raster_data: np.ndarray, red_band_idx: int = 2, nir_band_idx: int = 3) -> np.ndarray:
    """
    Compute Normalized Difference Vegetation Index (NDVI).
    NDVI = (NIR - Red) / (NIR + Red + 1e-6)
    """
    red = raster_data[red_band_idx].astype(np.float32)
    nir = raster_data[nir_band_idx].astype(np.float32)

    denom = nir + red
    denom = np.where(denom == 0, 1e-6, denom)
    ndvi = (nir - red) / denom
    return np.clip(ndvi, -1.0, 1.0)


def compute_bare_soil_index(
    raster_data: np.ndarray,
    blue_idx: int = 0,
    green_idx: int = 1,
    red_idx: int = 2,
    nir_idx: int = 3
) -> np.ndarray:
    """
    Compute Bare Soil / Earthwork disturbance index using visible & NIR bands.
    Higher values indicate exposed soil/gravel and clearing vs vegetation.
    """
    blue = raster_data[blue_idx].astype(np.float32)
    red = raster_data[red_idx].astype(np.float32)
    nir = raster_data[nir_idx].astype(np.float32)
    green = raster_data[green_idx].astype(np.float32)

    # Proxy: (Red + Blue - NIR) / (Red + Blue + NIR + 1e-6)
    numerator = (red + blue) - nir
    denom = (red + blue + nir) + 1e-6
    bsi = numerator / denom
    return np.clip(bsi, -1.0, 1.0)


def create_corridor_raster_mask(
    corridor_geom: Any,
    profile: Dict[str, Any],
    transform: rasterio.Affine,
    out_shape: Tuple[int, int]
) -> np.ndarray:
    """Rasterize corridor Shapely geometry to a binary numpy mask matching the raster dimensions."""
    if corridor_geom is None:
        # Return full ones mask if no specific corridor geometry
        return np.ones(out_shape, dtype=np.uint8)

    try:
        shapes = [(mapping(corridor_geom), 1)]
        mask = rasterize(
            shapes=shapes,
            out_shape=out_shape,
            transform=transform,
            fill=0,
            dtype=np.uint8
        )
        # If mask happens to have no pixels inside, fallback to center corridor slice
        if np.sum(mask) == 0:
            h, w = out_shape
            mask = np.zeros(out_shape, dtype=np.uint8)
            mask[int(h * 0.2):int(h * 0.8), int(w * 0.2):int(w * 0.8)] = 1
        return mask
    except Exception as e:
        print(f"Error rasterizing corridor mask: {e}")
        return np.ones(out_shape, dtype=np.uint8)
