import os
import requests
from dotenv import load_dotenv

load_dotenv()

CLIENT_ID = os.getenv("COPERNICUS_CLIENT_ID")
CLIENT_SECRET = os.getenv("COPERNICUS_CLIENT_SECRET")

if not CLIENT_ID or not CLIENT_SECRET:
    raise RuntimeError(
        "Missing COPERNICUS_CLIENT_ID or COPERNICUS_CLIENT_SECRET in .env"
    )

# Try Sentinel Hub and CDSE token endpoints
TOKEN_URLS = [
    "https://services.sentinel-hub.com/oauth/token",
    "https://identity.dataspace.copernicus.eu/auth/realms/CDSE/protocol/openid-connect/token",
]

response = None
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
            response = res
            break
    except Exception:
        continue

if response is None:
    # Trigger original standard URL for exact traceback if both failed
    response = requests.post(
        TOKEN_URLS[0],
        data={
            "grant_type": "client_credentials",
            "client_id": CLIENT_ID,
            "client_secret": CLIENT_SECRET,
        },
        timeout=30,
    )

response.raise_for_status()

data = response.json()

print("CDSE authentication: SUCCESS")
print("Token type:", data.get("token_type"))
print("Expires in:", data.get("expires_in"), "seconds")
