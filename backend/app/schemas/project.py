from datetime import date
from typing import Any, Dict, List, Optional
from pydantic import BaseModel, Field


class Milestone(BaseModel):
    name: str = Field(..., description="Milestone name, e.g. Land preparation")
    expected_date: str = Field(..., description="Expected date (YYYY-MM-DD)")
    completed: Optional[bool] = Field(False, description="Whether milestone is marked complete")
    description: Optional[str] = None


class ProjectBase(BaseModel):
    project_name: str = Field(..., description="Official project/tender title")
    project_type: str = Field("road", description="Infrastructure type (road, bridge, building)")
    location_text: str = Field(..., description="Geographical location or administrative area")
    start_date: str = Field(..., description="Project start date (YYYY-MM-DD)")
    expected_completion: str = Field(..., description="Target completion date (YYYY-MM-DD)")
    project_length_km: Optional[float] = Field(None, description="Length of the road project in km")
    budget_allocated: Optional[str] = Field(None, description="Allocated budget if stated")
    contractor_name: Optional[str] = Field(None, description="Awarded contractor or executing agency")
    milestones: List[Milestone] = Field(default_factory=list, description="Project milestones list")


class ProjectCreate(ProjectBase):
    project_id: Optional[str] = None
    geometry: Optional[Dict[str, Any]] = None


class ProjectUpdate(BaseModel):
    project_name: Optional[str] = None
    project_type: Optional[str] = None
    location_text: Optional[str] = None
    start_date: Optional[str] = None
    expected_completion: Optional[str] = None
    project_length_km: Optional[float] = None
    budget_allocated: Optional[str] = None
    contractor_name: Optional[str] = None
    milestones: Optional[List[Milestone]] = None
    geometry: Optional[Dict[str, Any]] = None


class ExtractedProject(BaseModel):
    project_name: str
    project_type: str = "road"
    location_text: str
    start_date: str
    expected_completion: str
    project_length_km: Optional[float] = None
    budget_allocated: Optional[str] = None
    contractor_name: Optional[str] = None
    milestones: List[Milestone] = Field(default_factory=list)
    extraction_confidence: float = 0.90
    raw_snippet: Optional[str] = None


class Project(ProjectBase):
    project_id: str
    geometry: Optional[Dict[str, Any]] = None
    corridor_geometry: Optional[Dict[str, Any]] = None
    document_path: Optional[str] = None
    has_imagery: bool = False
    observation_count: int = 0
    created_at: str = Field(default_factory=lambda: date.today().isoformat())
