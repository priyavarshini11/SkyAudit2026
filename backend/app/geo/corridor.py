"""Road corridor generation and buffering."""
from typing import Any, Dict, Optional, Tuple, Union
import pyproj
from shapely.geometry import LineString, Polygon, shape, mapping
from shapely.ops import transform
from .geometry import parse_geojson_geometry, geometry_to_geojson


def get_utm_epsg(lon: float, lat: float) -> int:
    """Calculate appropriate UTM EPSG code for a given WGS84 coordinate."""
    zone = int((lon + 180) / 6) + 1
    if lat >= 0:
        return 32600 + zone
    else:
        return 32700 + zone


def buffer_centerline_meters(geom: Any, buffer_meters: float = 50.0) -> Polygon:
    """Buffer a WGS84 LineString by a metric distance (e.g. 50 meters) using local UTM projection."""
    if geom is None or geom.is_empty:
        raise ValueError("Geometry is empty or null")

    # Determine centroid for UTM zone calculation
    centroid = geom.centroid
    utm_epsg = get_utm_epsg(centroid.x, centroid.y)

    wgs84 = pyproj.CRS("EPSG:4326")
    utm = pyproj.CRS(f"EPSG:{utm_epsg}")

    project_to_utm = pyproj.Transformer.from_crs(wgs84, utm, always_xy=True).transform
    project_to_wgs84 = pyproj.Transformer.from_crs(utm, wgs84, always_xy=True).transform

    # Project to metric UTM
    geom_utm = transform(project_to_utm, geom)
    
    # Buffer in meters (round cap style)
    buffered_utm = geom_utm.buffer(buffer_meters, cap_style=1, join_style=1)

    # Transform back to WGS84
    buffered_wgs84 = transform(project_to_wgs84, buffered_utm)
    return buffered_wgs84


def create_road_corridor_geojson(
    geometry_data: Union[str, Dict[str, Any], LineString],
    buffer_meters: float = 50.0
) -> Dict[str, Any]:
    """Take GeoJSON or Shapely geometry, buffer it, and return GeoJSON Polygon corridor."""
    if isinstance(geometry_data, (dict, str)):
        geom = parse_geojson_geometry(geometry_data)
    else:
        geom = geometry_data

    if geom is None:
        raise ValueError("Invalid geometry provided")

    corridor_polygon = buffer_centerline_meters(geom, buffer_meters)
    return {
        "type": "Feature",
        "properties": {
            "buffer_meters": buffer_meters,
            "corridor_type": "road_buffer"
        },
        "geometry": geometry_to_geojson(corridor_polygon)
    }
