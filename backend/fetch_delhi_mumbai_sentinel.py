"""Fetch real Sentinel-2 multispectral observations for Delhi-Mumbai Expressway (Sohna Package)."""
import os
import json
import numpy as np
import requests
from dotenv import load_dotenv
import rasterio
from PIL import Image

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

PROCESS_URLS = [
    "https://services.sentinel-hub.com/api/v1/process",
    "https://sh.dataspace.copernicus.eu/api/v1/process",
]

# Targeted 5 km x 5 km AOI for Delhi-Mumbai Expressway (Sohna Section, Haryana)
# NHAI Package 1 alignment interchange: [min_lon, min_lat, max_lon, max_lat]
PROJECT_BBOX = [77.0100, 28.1800, 77.0800, 28.2400]
OUTPUT_DIR = os.path.join(os.path.dirname(os.path.dirname(__file__)), "data", "projects", "delhi-mumbai-sohna")


def get_token():
    for token_url in TOKEN_URLS:
        try:
            res = requests.post(
                token_url,
                data={
                    "grant_type": "client_credentials",
                    "client_id": CLIENT_ID,
                    "client_secret": CLIENT_SECRET,
                },
                headers={"Content-Type": "application/x-www-form-urlencoded"},
                timeout=30,
            )
            if res.status_code == 200:
                return res.json()["access_token"]
        except Exception:
            continue
    raise RuntimeError("Failed to acquire access token.")


def search_best_observation(token, bbox, start_date, end_date, max_cloud=10.0):
    headers = {"Authorization": f"Bearer {token}", "Content-Type": "application/json"}
    query = {
        "bbox": bbox,
        "datetime": f"{start_date}T00:00:00Z/{end_date}T23:59:59Z",
        "collections": ["sentinel-2-l2a"],
        "limit": 10,
    }
    
    for cat_url in CATALOG_URLS:
        try:
            res = requests.post(cat_url, headers=headers, json=query, timeout=45)
            if res.status_code == 200:
                features = res.json().get("features", [])
                # Filter by cloud cover and sort by lowest cloud cover
                valid = [f for f in features if f.get("properties", {}).get("eo:cloud_cover", 100) <= max_cloud]
                if valid:
                    valid.sort(key=lambda x: x.get("properties", {}).get("eo:cloud_cover", 100))
                    return valid[0]
                elif features:
                    return features[0]
        except Exception:
            continue
    return None


def fetch_process_geotiff(token, bbox, date_str, output_path):
    """
    Download 4-band float32 GeoTIFF (B02 Blue, B03 Green, B04 Red, B08 NIR) via Process API.
    """
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
                "bbox": bbox,
                "properties": {"crs": "http://www.opengis.net/def/crs/EPSG/0/4326"}
            },
            "data": [
                {
                    "type": "sentinel-2-l2a",
                    "dataFilter": {
                        "timeRange": {
                            "from": f"{date_str}T00:00:00Z",
                            "to": f"{date_str}T23:59:59Z"
                        }
                    }
                }
            ]
        },
        "output": {
            "width": 512,
            "height": 512,
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

    for proc_url in PROCESS_URLS:
        try:
            res = requests.post(proc_url, json=payload, headers=headers, timeout=60)
            if res.status_code == 200 and len(res.content) > 1000:
                os.makedirs(os.path.dirname(output_path), exist_ok=True)
                with open(output_path, "wb") as f:
                    f.write(res.content)
                return True
            else:
                print(f"Process API response from {proc_url}: {res.status_code}")
        except Exception as e:
            print(f"Error on {proc_url}: {e}")
    return False


def render_rgb_and_ndvi(tif_path, png_path):
    with rasterio.open(tif_path) as src:
        data = src.read()  # (4, H, W): 0=Blue, 1=Green, 2=Red, 3=NIR

    # True Color RGB: R=B04 (index 2), G=B03 (index 1), B=B02 (index 0)
    r = data[2]
    g = data[1]
    b = data[0]
    nir = data[3]

    def norm(b_arr):
        p2, p98 = np.percentile(b_arr[b_arr > 0], (2, 98)) if np.any(b_arr > 0) else (0, 1)
        denom = p98 - p2 if p98 > p2 else 1e-6
        scaled = np.clip((b_arr - p2) / denom, 0, 1)
        return (scaled * 255).astype(np.uint8)

    rgb = np.stack([norm(r), norm(g), norm(b)], axis=-1)
    img = Image.fromarray(rgb)
    img.save(png_path)

    # Compute Mean NDVI: (NIR - Red) / (NIR + Red)
    denom = nir + r
    denom = np.where(denom == 0, 1e-6, denom)
    ndvi = (nir - r) / denom
    valid_ndvi = ndvi[nir > 0]
    mean_ndvi = float(np.mean(valid_ndvi)) if len(valid_ndvi) > 0 else 0.0

    return round(mean_ndvi, 3)


if __name__ == "__main__":
    print("===================================================================")
    print("SkyAudit -- Live Sentinel-2 Acquisition: Delhi-Mumbai Expressway")
    print("Project Section: Sohna-Kolgaon Package 1 Alignment")
    print(f"Target Bounding Box: {PROJECT_BBOX}")
    print("===================================================================\n")

    token = get_token()
    print("[OK] CDSE Authentication: Bearer Token Ready\n")

    intervals = [
        ("T0_Baseline", "2019-02-01", "2019-04-30", "before.tif", "before.png"),
        ("T1_Earthworks", "2021-01-01", "2021-03-31", "middle.tif", "middle.png"),
        ("T2_Paved_Expressway", "2023-01-01", "2023-03-31", "after.tif", "after.png"),
    ]

    obs_records = []

    for label, s_date, e_date, tif_name, png_name in intervals:
        print(f"Searching best observation for {label} ({s_date} to {e_date})...")
        feature = search_best_observation(token, PROJECT_BBOX, s_date, e_date, max_cloud=15.0)

        if not feature:
            print(f"WARNING: No cloud-free pass found for {label} in {s_date}..{e_date}")
            continue

        obs_id = feature.get("id")
        dt_full = feature.get("properties", {}).get("datetime", "")
        dt_date = dt_full.split("T")[0]
        cloud = feature.get("properties", {}).get("eo:cloud_cover", 0.0)

        print(f"  -> Found Pass: {dt_date} (Cloud: {cloud}%, ID: {obs_id[:35]}...)")
        print(f"  -> Requesting 4-Band GeoTIFF (B02, B03, B04, B08) via Process API...")

        tif_path = os.path.join(OUTPUT_DIR, tif_name)
        png_path = os.path.join(OUTPUT_DIR, png_name)

        success = fetch_process_geotiff(token, PROJECT_BBOX, dt_date, tif_path)
        if success:
            mean_ndvi = render_rgb_and_ndvi(tif_path, png_path)
            print(f"  [OK] Saved GeoTIFF: {tif_path}")
            print(f"  [OK] Rendered RGB Preview: {png_path} (Mean NDVI: {mean_ndvi})\n")

            obs_records.append({
                "id": f"obs-{label}",
                "phase": label,
                "date": dt_date,
                "cloud_cover": round(cloud, 2),
                "mean_ndvi": mean_ndvi,
                "file_path": tif_path,
                "preview_url": f"/api/projects/delhi-mumbai-sohna/images/{png_name}",
                "resolution_m": 10.0,
                "bands": ["B02", "B03", "B04", "B08"]
            })
        else:
            print(f"  [FAIL] Process API download failed for {dt_date}\n")

    # Save project metadata
    os.makedirs(OUTPUT_DIR, exist_ok=True)
    meta_path = os.path.join(OUTPUT_DIR, "metadata.json")
    with open(meta_path, "w", encoding="utf-8") as f:
        json.dump({
            "project_id": "delhi-mumbai-sohna",
            "project_name": "Delhi-Mumbai Expressway (Sohna Package 1)",
            "bbox": PROJECT_BBOX,
            "observations": obs_records
        }, f, indent=2)

    print(f"[OK] Created project observation metadata: {meta_path}")
