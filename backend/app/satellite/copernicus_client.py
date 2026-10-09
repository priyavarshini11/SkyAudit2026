"""Copernicus Data Space & Sentinel Hub Live Satellite Client."""
from typing import Any, Dict, List, Optional, Tuple
import os
from datetime import datetime, timedelta
import requests
from dotenv import load_dotenv

# Load backend/.env
load_dotenv(os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(__file__))), ".env"))

COPERNICUS_CLIENT_ID = os.getenv("COPERNICUS_CLIENT_ID")
COPERNICUS_CLIENT_SECRET = os.getenv("COPERNICUS_CLIENT_SECRET")

# Sentinel Hub / Copernicus Endpoints
SENTINEL_HUB_TOKEN_URL = "https://services.sentinel-hub.com/oauth/token"
CDSE_TOKEN_URL = "https://identity.dataspace.copernicus.eu/auth/realms/CDSE/protocol/openid-connect/token"
SENTINEL_HUB_PROCESS_URL = "https://services.sentinel-hub.com/api/v1/process"
CDSE_PROCESS_URL = "https://sh.dataspace.copernicus.eu/api/v1/process"


def get_access_token() -> Optional[str]:
    """Retrieve OAuth2 Bearer Access Token using client credentials."""
    client_id = os.getenv("COPERNICUS_CLIENT_ID")
    client_secret = os.getenv("COPERNICUS_CLIENT_SECRET")

    if not client_id or not client_secret:
        return None

    # Try Sentinel Hub OAuth first
    for token_url in [SENTINEL_HUB_TOKEN_URL, CDSE_TOKEN_URL]:
        try:
            response = requests.post(
                token_url,
                data={
                    "grant_type": "client_credentials",
                    "client_id": client_id,
                    "client_secret": client_secret,
                },
                headers={"Content-Type": "application/x-www-form-urlencoded"},
                timeout=10,
            )
            if response.status_code == 200:
                data = response.json()
                return data.get("access_token")
        except Exception as e:
            print(f"Token retrieval error from {token_url}: {e}")

    return None


def fetch_live_sentinel2_geotiff(
    bbox: Tuple[float, float, float, float],  # (min_lon, min_lat, max_lon, max_lat)
    time_from: str,
    time_to: str,
    output_geotiff_path: str,
    max_cloud_coverage: float = 20.0
) -> bool:
    """
    Fetch 4-band Sentinel-2 L2A GeoTIFF (B02, B03, B04, B08) via Sentinel Hub Process API.
    Returns True if successfully downloaded and written, False otherwise.
    """
    token = get_access_token()
    if not token:
        print("No valid Copernicus / Sentinel Hub token available.")
        return False

    min_lon, min_lat, max_lon, max_lat = bbox

    # Evalscript to return 4 bands (Blue, Green, Red, NIR) as float32 GeoTIFF
    evalscript = """
    //VERSION=3
    function setup() {
      return {
        input: ["B02", "B03", "B04", "B08", "dataMask"],
        output: { bands: 4, sampleType: "FLOAT32" }
      };
    }

    function evaluatePixel(sample) {
      if (sample.dataMask == 0) {
        return [0, 0, 0, 0];
      }
      return [sample.B02, sample.B03, sample.B04, sample.B08];
    }
    """

    payload = {
        "input": {
            "bounds": {
                "bbox": [min_lon, min_lat, max_lon, max_lat],
                "properties": {"crs": "http://www.opengis.net/def/crs/EPSG/0/4326"}
            },
            "data": [
                {
                    "type": "sentinel-2-l2a",
                    "dataFilter": {
                        "timeRange": {
                            "from": f"{time_from}T00:00:00Z",
                            "to": f"{time_to}T23:59:59Z"
                        },
                        "maxCloudCoverage": max_cloud_coverage
                    }
                }
            ]
        },
        "output": {
            "width": 256,
            "height": 256,
            "responses": [
                {
                    "identifier": "default",
                    "format": {"type": "image/tiff"}
                }
            ]
        },
        "evalscript": evalscript
    }

    headers = {
        "Authorization": f"Bearer {token}",
        "Content-Type": "application/json",
        "Accept": "image/tiff"
    }

    for process_url in [SENTINEL_HUB_PROCESS_URL, CDSE_PROCESS_URL]:
        try:
            res = requests.post(process_url, json=payload, headers=headers, timeout=30)
            if res.status_code == 200:
                os.makedirs(os.path.dirname(output_geotiff_path), exist_ok=True)
                with open(output_geotiff_path, "wb") as f:
                    f.write(res.content)
                return True
            else:
                print(f"Sentinel Hub Process API response {res.status_code}: {res.text[:200]}")
        except Exception as e:
            print(f"Error requesting live imagery from {process_url}: {e}")

    return False
