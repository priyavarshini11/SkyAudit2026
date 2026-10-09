"""Projects API routes with Government Portal and Gemini document extraction."""
from typing import Any, Dict, List, Optional
import os
import shutil
import json
from pydantic import BaseModel
from fastapi import APIRouter, UploadFile, File, HTTPException, BackgroundTasks, Query
from fastapi.responses import FileResponse
from ..schemas.project import Project, ProjectCreate, ProjectUpdate, ExtractedProject
from ..services.document_service import extract_text_from_pdf, parse_tender_text_deterministically
from ..services.llm_service import extract_project_claims_with_gemini
from ..services.government_portal_service import (
    search_government_projects,
    get_government_project_by_tender_id,
    get_all_available_states,
    convert_gov_record_to_project,
    GovernmentProjectRecord
)
from ..geo.geometry import parse_geojson_geometry, geometry_to_geojson, create_demo_road_centerline, calculate_linestring_length_km
from ..geo.corridor import create_road_corridor_geojson

router = APIRouter(prefix="/api/projects", tags=["projects"])

DATA_ROOT = "data/projects"
os.makedirs(DATA_ROOT, exist_ok=True)

# In-memory registry with disk persistence
_projects_cache: Dict[str, Project] = {}


def _init_demo_project_if_needed():
    dme_id = "delhi-mumbai-sohna"
    if dme_id not in _projects_cache:
        dme_dir = os.path.join(DATA_ROOT, dme_id)
        os.makedirs(dme_dir, exist_ok=True)
        
        # Real Delhi-Mumbai Expressway Package 1 (Sohna Interchange corridor)
        centerline = create_demo_road_centerline((77.015, 28.185), (77.075, 28.235))
        corridor = create_road_corridor_geojson(centerline, buffer_meters=50.0)

        dme_proj = Project(
            project_id=dme_id,
            project_name="Delhi-Mumbai Expressway (NHAI Package 1 • Sohna-Kolgaon)",
            project_type="road",
            location_text="Sohna-Nuh Corridor, Haryana",
            start_date="2019-02-15",
            expected_completion="2023-02-12",
            project_length_km=18.4,
            budget_allocated="INR 1,240 Crores",
            contractor_name="NHAI / GR Infraprojects Ltd.",
            geometry=geometry_to_geojson(centerline),
            corridor_geometry=corridor,
            has_imagery=True,
            observation_count=3,
            milestones=[
                {"name": "Greenfield Right-of-Way Acquisition", "expected_date": "2019-06-30", "completed": True},
                {"name": "Major Embankment & Culvert Earthworks", "expected_date": "2021-03-31", "completed": True},
                {"name": "8-Lane Bituminous Paving & Surfacing", "expected_date": "2022-12-31", "completed": True},
                {"name": "Official Inauguration & Commercial Toll Opening", "expected_date": "2023-02-12", "completed": True}
            ]
        )
        _projects_cache[dme_id] = dme_proj

    demo_id = "demo-road-001"
    if demo_id not in _projects_cache:
        demo_dir = os.path.join(DATA_ROOT, demo_id)
        os.makedirs(demo_dir, exist_ok=True)
        
        centerline = create_demo_road_centerline((78.435, 17.395), (78.525, 17.465))
        corridor = create_road_corridor_geojson(centerline, buffer_meters=50.0)

        demo_proj = Project(
            project_id=demo_id,
            project_name="NH-65 Hyderabad Northern Bypass Corridor",
            project_type="road",
            location_text="Hyderabad Outer Ring, Telangana",
            start_date="2026-01-15",
            expected_completion="2026-12-30",
            project_length_km=14.2,
            budget_allocated="INR 68.50 Crores",
            contractor_name="Apex Infrastructure & Highways Ltd.",
            geometry=geometry_to_geojson(centerline),
            corridor_geometry=corridor,
            has_imagery=True,
            observation_count=3,
            milestones=[
                {"name": "Right of Way Clearing & Demolition", "expected_date": "2026-03-31", "completed": True},
                {"name": "Earthwork & Embankment Formation", "expected_date": "2026-06-30", "completed": False},
                {"name": "Dense Bituminous Macadam (DBM)", "expected_date": "2026-09-30", "completed": False},
                {"name": "Wearing Course & Road Safety Furniture", "expected_date": "2026-12-30", "completed": False}
            ]
        )
        _projects_cache[demo_id] = demo_proj


_init_demo_project_if_needed()


@router.get("", response_model=List[Project])
def list_projects():
    """List all registered infrastructure projects in active workspace."""
    _init_demo_project_if_needed()
    return list(_projects_cache.values())


# =========================================================================
# REAL-TIME GOVERNMENT PORTAL INTEGRATIONS
# =========================================================================

@router.get("/portal/states", response_model=List[str])
def list_portal_states():
    """List all available States & Union Territories in the government project catalog."""
    return get_all_available_states()


@router.get("/portal/search", response_model=List[GovernmentProjectRecord])
def search_portal_projects(
    query: Optional[str] = Query(None, description="Search keyword for project, corridor, or contractor"),
    state: Optional[str] = Query(None, description="Filter by state (e.g. Haryana, Maharashtra, Karnataka)"),
    authority: Optional[str] = Query(None, description="Filter by authority (e.g. NHAI, MoRTH, UPEIDA)"),
    status: Optional[str] = Query(None, description="Filter by status (Completed, Under Construction)")
):
    """
    Search live national infrastructure contracts & tender records across official portals
    (NHAI PMIS, MoRTH e-Tendering, PM GatiShakti, CPPP, and OCDS registries).
    """
    return search_government_projects(query=query, state=state, authority=authority, status=status)


class ImportPortalProjectRequest(BaseModel):
    tender_id: str
    custom_project_id: Optional[str] = None


@router.post("/portal/import", response_model=Project)
def import_portal_project(payload: ImportPortalProjectRequest):
    """
    Import a real government infrastructure tender directly into the active SkyAudit workspace.
    Automatically builds road centerline GeoJSON, 50m corridor buffer, and milestone schedule.
    """
    record = get_government_project_by_tender_id(payload.tender_id)
    if not record:
        raise HTTPException(status_code=404, detail=f"Government project with tender ID '{payload.tender_id}' not found.")

    project = convert_gov_record_to_project(record, project_id=payload.custom_project_id)
    _projects_cache[project.project_id] = project

    # Persist to disk
    proj_dir = os.path.join(DATA_ROOT, project.project_id)
    os.makedirs(proj_dir, exist_ok=True)
    with open(os.path.join(proj_dir, "project.json"), "w", encoding="utf-8") as f:
        f.write(project.model_dump_json(indent=2))

    return project


# =========================================================================
# STANDARD PROJECT CRUD & DOCUMENT INGESTION
# =========================================================================

@router.post("", response_model=Project)
def create_project(payload: ProjectCreate):
    """Create a new infrastructure project."""
    project_id = payload.project_id or f"proj-{len(_projects_cache) + 1:03d}"
    
    geom = payload.geometry
    corridor = None
    if geom:
        try:
            corridor = create_road_corridor_geojson(geom, buffer_meters=50.0)
        except Exception:
            pass

    length_km = payload.project_length_km
    if length_km is None and geom:
        parsed = parse_geojson_geometry(geom)
        length_km = calculate_linestring_length_km(parsed)

    project = Project(
        project_id=project_id,
        project_name=payload.project_name,
        project_type=payload.project_type,
        location_text=payload.location_text,
        start_date=payload.start_date,
        expected_completion=payload.expected_completion,
        project_length_km=length_km,
        budget_allocated=payload.budget_allocated,
        contractor_name=payload.contractor_name,
        milestones=payload.milestones,
        geometry=geom,
        corridor_geometry=corridor,
        has_imagery=False,
        observation_count=0
    )

    _projects_cache[project_id] = project
    proj_dir = os.path.join(DATA_ROOT, project_id)
    os.makedirs(proj_dir, exist_ok=True)
    with open(os.path.join(proj_dir, "project.json"), "w", encoding="utf-8") as f:
        f.write(project.model_dump_json(indent=2))

    return project


@router.get("/{project_id}", response_model=Project)
def get_project(project_id: str):
    """Retrieve metadata for a specific project."""
    if project_id not in _projects_cache:
        # Check disk
        proj_file = os.path.join(DATA_ROOT, project_id, "project.json")
        if os.path.exists(proj_file):
            with open(proj_file, "r", encoding="utf-8") as f:
                data = json.load(f)
                _projects_cache[project_id] = Project(**data)
        else:
            raise HTTPException(status_code=404, detail="Project not found")
    return _projects_cache[project_id]


@router.put("/{project_id}", response_model=Project)
def update_project(project_id: str, payload: ProjectUpdate):
    """Update project fields."""
    if project_id not in _projects_cache:
        raise HTTPException(status_code=404, detail="Project not found")
    
    current = _projects_cache[project_id]
    update_data = payload.model_dump(exclude_unset=True)
    
    for key, value in update_data.items():
        if value is not None:
            setattr(current, key, value)
            
    if payload.geometry:
        current.corridor_geometry = create_road_corridor_geojson(payload.geometry, buffer_meters=50.0)

    proj_dir = os.path.join(DATA_ROOT, project_id)
    with open(os.path.join(proj_dir, "project.json"), "w", encoding="utf-8") as f:
        f.write(current.model_dump_json(indent=2))

    return current


@router.post("/extract-document", response_model=ExtractedProject)
async def extract_document_standalone(file: UploadFile = File(...)):
    """
    Upload a tender/contract PDF directly and extract structured claims
    using Gemini AI (with automatic deterministic fallback).
    """
    if not file.filename.lower().endswith(".pdf"):
        raise HTTPException(status_code=400, detail="Only PDF files are supported.")

    temp_path = os.path.join(DATA_ROOT, f"temp_{file.filename}")
    with open(temp_path, "wb") as f:
        content = await file.read()
        f.write(content)

    try:
        raw_text = extract_text_from_pdf(temp_path)
        extracted = extract_project_claims_with_gemini(raw_text)
        return extracted
    finally:
        if os.path.exists(temp_path):
            os.remove(temp_path)


@router.post("/{project_id}/document", response_model=Project)
async def upload_project_document(project_id: str, file: UploadFile = File(...)):
    """Upload a tender PDF to an existing project, extracting and updating facts with Gemini AI."""
    if project_id not in _projects_cache:
        raise HTTPException(status_code=404, detail="Project not found")

    proj_dir = os.path.join(DATA_ROOT, project_id)
    os.makedirs(proj_dir, exist_ok=True)
    pdf_path = os.path.join(proj_dir, file.filename)

    with open(pdf_path, "wb") as f:
        content = await file.read()
        f.write(content)

    # Extract text with Gemini
    raw_text = extract_text_from_pdf(pdf_path)
    extracted = extract_project_claims_with_gemini(raw_text)

    current = _projects_cache[project_id]
    current.document_path = pdf_path
    if extracted.project_name:
        current.project_name = extracted.project_name
    if extracted.location_text:
        current.location_text = extracted.location_text
    if extracted.start_date:
        current.start_date = extracted.start_date
    if extracted.expected_completion:
        current.expected_completion = extracted.expected_completion
    if extracted.project_length_km:
        current.project_length_km = extracted.project_length_km
    if extracted.budget_allocated:
        current.budget_allocated = extracted.budget_allocated
    if extracted.contractor_name:
        current.contractor_name = extracted.contractor_name
    if extracted.milestones:
        current.milestones = extracted.milestones

    return current


@router.get("/{project_id}/images/{filename}")
def get_project_image(project_id: str, filename: str):
    """Serve satellite preview PNG or change heatmap overlay with on-the-fly auto-generation."""
    file_path = os.path.join(DATA_ROOT, project_id, filename)
    if not os.path.exists(file_path):
        # Auto-generate on the fly for this project
        if project_id in _projects_cache:
            proj = _projects_cache[project_id]
        else:
            proj_json = os.path.join(DATA_ROOT, project_id, "project.json")
            if os.path.exists(proj_json):
                with open(proj_json, "r", encoding="utf-8") as f:
                    proj = Project(**json.load(f))
            else:
                proj = Project(
                    project_id=project_id,
                    project_name=project_id,
                    location_text="Infrastructure Corridor",
                    start_date="2022-01-01",
                    expected_completion="2024-12-31"
                )
        
        try:
            from ..services.analysis_service import AnalysisService
            svc = AnalysisService(data_root=DATA_ROOT)
            svc.run_full_project_analysis(proj)
        except Exception as e:
            print(f"Failed to auto-generate project images for {project_id}: {e}")

    # Re-check file_path
    if not os.path.exists(file_path):
        if filename == "change_mask.png":
            alt_path = os.path.join(DATA_ROOT, project_id, "heatmap_overlay.png")
            if os.path.exists(alt_path):
                return FileResponse(alt_path, media_type="image/png")
        if filename == "heatmap_overlay.png":
            alt_path = os.path.join(DATA_ROOT, project_id, "change_mask.png")
            if os.path.exists(alt_path):
                return FileResponse(alt_path, media_type="image/png")
        for fallback_name in ["after.png", "before.png", "middle.png"]:
            fallback_path = os.path.join(DATA_ROOT, project_id, fallback_name)
            if os.path.exists(fallback_path):
                return FileResponse(fallback_path, media_type="image/png")
        demo_fallback = os.path.join(DATA_ROOT, "delhi-mumbai-sohna", filename)
        if os.path.exists(demo_fallback):
            return FileResponse(demo_fallback, media_type="image/png")
        raise HTTPException(status_code=404, detail="Image not found")

    return FileResponse(file_path, media_type="image/png")
