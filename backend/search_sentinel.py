import os
import requests
from dotenv import load_dotenv

load_dotenv()

CLIENT_ID = os.getenv("COPERNICUS_CLIENT_ID")
CLIENT_SECRET = os.getenv("COPERNICUS_CLIENT_SECRET")

TOKEN_URLS = [
    "https://services.sentinel-hub.com/oauth/token",
    "https://identity.dataspace.copernicus.eu/auth/realms/CDSE/protocol/openid-connect/token",
]

CATALOG_URLS = [
    "https://services.sentinel-hub.com/api/v1/catalog/1.0.0/search",
    "https://sh.dataspace.copernicus.eu/catalog/v1/search",
]


def get_access_token():
    for token_url in TOKEN_URLS:
        try:
            response = requests.post(
                token_url,
                data={
                    "grant_type": "client_credentials",
                    "client_id": CLIENT_ID,
                    "client_secret": CLIENT_SECRET,
                },
                headers={"Content-Type": "application/x-www-form-urlencoded"},
                timeout=30,
            )
            if response.status_code == 200:
                return response.json()["access_token"]
        except Exception:
            continue
    raise RuntimeError("Failed to obtain access token from authentication endpoints")


def search_sentinel2(
    access_token,
    bbox,
    start_date,
    end_date,
    max_cloud_cover=30,
):
    headers = {
        "Authorization": f"Bearer {access_token}",
        "Content-Type": "application/json",
    }

    query = {
        "bbox": bbox,
        "datetime": (
            f"{start_date}T00:00:00Z/"
            f"{end_date}T23:59:59Z"
        ),
        "collections": ["sentinel-2-l2a"],
        "limit": 10,
    }

    # If supported by STAC API, include cloud cover filter
    if max_cloud_cover is not None:
        query["filter"] = f"eo:cloud_cover <= {max_cloud_cover}"

    for catalog_url in CATALOG_URLS:
        try:
            response = requests.post(
                catalog_url,
                headers=headers,
                json=query,
                timeout=60,
            )
            if response.status_code == 200:
                return response.json()
        except Exception:
            continue

    # Fallback without CQL filter if syntax differs across catalog versions
    query.pop("filter", None)
    for catalog_url in CATALOG_URLS:
        try:
            response = requests.post(
                catalog_url,
                headers=headers,
                json=query,
                timeout=60,
            )
            if response.status_code == 200:
                return response.json()
        except Exception:
            continue

    raise RuntimeError("Failed to query catalog endpoints")


if __name__ == "__main__":

    # TEMPORARY API TEST AREA.
    # We will replace this with the actual
    # SkyAudit project corridor later.

    bbox = [
        13.8221,
        45.8508,
        14.5596,
        46.2919,
    ]

    start_date = "2025-01-01"
    end_date = "2025-03-31"

    print("Getting CDSE access token...")
    token = get_access_token()

    print("Searching Sentinel-2 L2A...")
    
    result = search_sentinel2(
        token,
        bbox,
        start_date,
        end_date,
        max_cloud_cover=30,
    )

    features = result.get("features", [])

    print()
    print("Sentinel-2 observations found:", len(features))
    print()

    for i, feature in enumerate(features, start=1):

        properties = feature.get("properties", {})

        print(f"--- Observation {i} ---")
        print("ID:", feature.get("id"))
        print("Date:", properties.get("datetime"))
        print(
            "Cloud cover:",
            properties.get("eo:cloud_cover")
        )
        print()
