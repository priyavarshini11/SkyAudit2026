"""Geospatial helper functions for SkyAudit."""
from typing import Any, Dict, List, Optional, Tuple, Union
import json
import math
from shapely.geometry import shape, mapping, LineString, Polygon, MultiPolygon, Point
from shapely.ops import transform
import pyproj


def parse_geojson_geometry(geo_input: Union[str, Dict[str, Any]]) -> Optional[Any]:
    """Parse a GeoJSON dictionary or string into a Shapely geometry."""
    if not geo_input:
        return None
    try:
        if isinstance(geo_input, str):
            geo_dict = json.loads(geo_input)
        else:
            geo_dict = geo_input

        # Check if it's a Feature or FeatureCollection
        if geo_dict.get("type") == "Feature":
            return shape(geo_dict["geometry"])
        elif geo_dict.get("type") == "FeatureCollection":
            features = geo_dict.get("features", [])
            if features:
                return shape(features[0]["geometry"])
            return None
        return shape(geo_dict)
    except Exception as e:
        print(f"Error parsing geometry: {e}")
        return None


def geometry_to_geojson(geom: Any) -> Dict[str, Any]:
    """Convert a Shapely geometry to a GeoJSON dictionary."""
    if geom is None:
        return {}
    return mapping(geom)


def calculate_linestring_length_km(geom: Any) -> float:
    """Calculate approximate length in kilometers using WGS84 geodesic distance."""
    if geom is None or geom.is_empty:
        return 0.0

    # If it's a LineString
    if isinstance(geom, LineString):
        coords = list(geom.coords)
    elif hasattr(geom, "geoms"):  # MultiLineString
        coords = []
        for line in geom.geoms:
            coords.extend(list(line.coords))
    else:
        return 0.0

    if len(coords) < 2:
        return 0.0

    # Geodesic calculation via pyproj Geod
    geod = pyproj.Geod(ellps="WGS84")
    total_length_m = 0.0
    for i in range(len(coords) - 1):
        lon1, lat1 = coords[i][0], coords[i][1]
        lon2, lat2 = coords[i+1][0], coords[i+1][1]
        _, _, dist = geod.inv(lon1, lat1, lon2, lat2)
        total_length_m += dist

    return round(total_length_m / 1000.0, 2)


def create_demo_road_centerline(start_coord: Tuple[float, float], end_coord: Tuple[float, float], num_points: int = 15) -> LineString:
    """Create a realistic curved road centerline between two coordinates (lon, lat)."""
    lon1, lat1 = start_coord
    lon2, lat2 = end_coord
    
    coords = []
    for i in range(num_points):
        t = i / (num_points - 1)
        # Add subtle natural road curve deviation
        deviation = math.sin(t * math.pi) * 0.003
        lon = lon1 + (lon2 - lon1) * t + deviation * 0.5
        lat = lat1 + (lat2 - lat1) * t + deviation
        coords.append((lon, lat))
        
    return LineString(coords)
