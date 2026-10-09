"""SkyAudit FastAPI Application Entry Point."""
import os
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from .api import projects_router, analysis_router, reports_router

app = FastAPI(
    title="SkyAudit API",
    description="Independent Satellite-Based Infrastructure Progress & Discrepancy Verification Engine",
    version="1.0.0"
)

# Enable CORS for Next.js frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Register routers
app.include_router(projects_router)
app.include_router(analysis_router)
app.include_router(reports_router)

# Mount static data directory for satellite image preview assets
os.makedirs("data/projects", exist_ok=True)
app.mount("/static", StaticFiles(directory="data"), name="static")


@app.get("/health")
def health_check():
    return {
        "status": "online",
        "service": "SkyAudit Verification API",
        "version": "1.0.0",
        "mode": "local-first-reproducible"
    }


if __name__ == "__main__":
    import uvicorn
    uvicorn.run("backend.app.main:app", host="0.0.0.0", port=8000, reload=True)
