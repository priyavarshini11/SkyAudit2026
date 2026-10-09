"""Reports API endpoints."""
import os
from fastapi import APIRouter, HTTPException
from fastapi.responses import FileResponse
from ..schemas.evidence import EvidenceReport
from ..services.report_service import generate_audit_report
from ..services.pdf_report_service import generate_pdf_audit_brief
from .analysis import get_latest_analysis
from .projects import _projects_cache, DATA_ROOT

router = APIRouter(prefix="/api/projects", tags=["reports"])


@router.get("/{project_id}/report", response_model=EvidenceReport)
def get_project_report(project_id: str):
    """
    Generate and retrieve printable/exportable Evidence Brief Report (JSON).
    """
    if project_id not in _projects_cache:
        raise HTTPException(status_code=404, detail="Project not found")

    analysis = get_latest_analysis(project_id)
    report = generate_audit_report(analysis)
    return report


@router.get("/{project_id}/report/pdf")
def get_project_report_pdf(project_id: str):
    """
    Generate and stream publication-grade PDF Evidence Brief document for download.
    """
    if project_id not in _projects_cache:
        raise HTTPException(status_code=404, detail="Project not found")

    project = _projects_cache[project_id]
    analysis = get_latest_analysis(project_id)

    data_dir = os.path.join(DATA_ROOT, project_id)
    pdf_path = os.path.join(data_dir, "skyaudit_evidence_brief.pdf")

    generate_pdf_audit_brief(
        project_id=project.project_id,
        project_name=project.project_name,
        location_text=project.location_text,
        start_date=project.start_date,
        expected_completion=project.expected_completion,
        contractor_name=project.contractor_name,
        project_length_km=project.project_length_km,
        observable_progress=analysis.observable_progress,
        confidence_score=analysis.confidence,
        data_dir=data_dir,
        output_pdf_path=pdf_path
    )

    if not os.path.exists(pdf_path):
        raise HTTPException(status_code=500, detail="Failed to generate PDF document")

    return FileResponse(
        pdf_path,
        media_type="application/pdf",
        filename=f"SkyAudit_Evidence_Brief_{project_id}.pdf"
    )
