"""LLM Service with Gemini AI integration and strict evidentiary verification guardrails."""
from typing import Any, Dict, List, Optional
import os
import json
import logging
from ..schemas.project import ExtractedProject, Milestone
from ..schemas.analysis import ChangeMetrics, DiscrepancyResult
from ..geo.geometry import create_demo_road_centerline, geometry_to_geojson
from .document_service import parse_tender_text_deterministically

logger = logging.getLogger(__name__)


def _get_gemini_client():
    """Obtain initialized Google GenAI client if GEMINI_API_KEY is available."""
    api_key = os.getenv("GEMINI_API_KEY")
    if not api_key:
        return None
    try:
        from google import genai
        return genai.Client(api_key=api_key)
    except Exception as e:
        logger.warning(f"Failed to initialize google-genai client: {e}")
        return None


def extract_project_claims_with_gemini(document_text: str) -> ExtractedProject:
    """
    Extract structured project claims from tender/contract text using Gemini 2.5 Flash.
    Falls back gracefully to deterministic rule-based parsing if offline or unconfigured.
    """
    client = _get_gemini_client()
    if not client:
        logger.info("GEMINI_API_KEY not found or client unavailable. Using deterministic extraction.")
        return parse_tender_text_deterministically(document_text)

    prompt = f"""You are an expert infrastructure audit AI for SkyAudit.
Analyze the following official infrastructure project tender / contract / DPR document text and extract structured project claims.

Document Text:
\"\"\"{document_text[:12000]}\"\"\"

Return a valid JSON object matching this exact structure:
{{
  "project_name": "Official tender or highway project title",
  "project_type": "road",
  "location_text": "State / District / Geographical corridor",
  "start_date": "YYYY-MM-DD",
  "expected_completion": "YYYY-MM-DD",
  "project_length_km": 18.4,
  "budget_allocated": "e.g. INR 1,240 Crores",
  "contractor_name": "Awarded Contractor / Concessionaire name",
  "start_coordinates": [77.015, 28.185],
  "end_coordinates": [77.075, 28.235],
  "milestones": [
    {{
      "name": "Milestone title",
      "expected_date": "YYYY-MM-DD",
      "completed": true,
      "description": "Milestone scope summary"
    }}
  ],
  "extraction_confidence": 0.95
}}

Guidelines:
- Ensure all dates are normalized to YYYY-MM-DD format.
- If coordinates are not explicitly present, extract the best known town/interchange coordinates or omit.
- Milestones should be sorted chronologically.
- Return raw JSON only with no markdown wrapping.
"""

    try:
        response = client.models.generate_content(
            model="gemini-2.5-flash",
            contents=prompt,
            config={
                "response_mime_type": "application/json"
            }
        )

        raw_json = response.text.strip()
        data = json.loads(raw_json)

        # Build Milestone models
        milestones = []
        for m in data.get("milestones", []):
            milestones.append(Milestone(
                name=m.get("name", "Execution Milestone"),
                expected_date=m.get("expected_date", "2023-01-01"),
                completed=m.get("completed", True),
                description=m.get("description")
            ))

        # Build geometry if coordinates present
        geom = None
        start_c = data.get("start_coordinates")
        end_c = data.get("end_coordinates")
        if start_c and end_c and len(start_c) == 2 and len(end_c) == 2:
            try:
                centerline = create_demo_road_centerline((float(start_c[0]), float(start_c[1])), (float(end_c[0]), float(end_c[1])))
                geom = geometry_to_geojson(centerline)
            except Exception:
                pass

        return ExtractedProject(
            project_name=data.get("project_name", "Extracted Infrastructure Project"),
            project_type="road",
            location_text=data.get("location_text", "India"),
            start_date=data.get("start_date", "2019-02-15"),
            expected_completion=data.get("expected_completion", "2023-02-12"),
            project_length_km=float(data.get("project_length_km", 18.4)) if data.get("project_length_km") is not None else None,
            budget_allocated=data.get("budget_allocated"),
            contractor_name=data.get("contractor_name"),
            milestones=milestones,
            geometry=geom,
            extraction_confidence=float(data.get("extraction_confidence", 0.96)),
            raw_snippet=document_text[:400]
        )
    except Exception as e:
        logger.warning(f"Gemini claim extraction encountered error: {e}. Falling back to deterministic parser.")
        return parse_tender_text_deterministically(document_text)


def generate_guardrailed_explanation(
    project_name: str,
    expected_progress: float,
    observable_progress: float,
    confidence: float,
    discrepancy: DiscrepancyResult,
    metrics: ChangeMetrics,
    observation_count: int
) -> str:
    """
    Generate an explainable, fact-anchored summary of physical satellite observations.
    Uses Gemini 2.5 Flash if available, with deterministic fallback adhering to strict guardrails.
    
    Guardrail rules:
    - Never assert 'fraud' or definitive criminal conduct.
    - Treat satellite observations strictly as observable multispectral evidence.
    - Anchor all claims directly in observable metrics (NDVI drop, bare soil reflectance, spatial change score).
    """
    client = _get_gemini_client()
    if client:
        try:
            prompt = f"""You are a senior satellite geospatial auditor generating a formal screening summary for SkyAudit.
Synthesize an audit assessment based strictly on the following deterministic data points.

Project Title: {project_name}
Observations Count: {observation_count} Sentinel-2 multispectral passes
Expected Milestone Progress: {expected_progress}%
Observable Surface Progress (Computed): {observable_progress}%
Sensor Evidence Quality Confidence: {confidence}%
Status Category: {discrepancy.status_category} ({discrepancy.status})
NDVI Drop Score: {metrics.ndvi_drop_score}
Surface Reflectance Score: {metrics.surface_reflectance_score}
Spatial Change Continuity Score: {metrics.spatial_change_score}
Temporal Consistency: {metrics.temporal_consistency}

MANDATORY AUDIT RULES:
1. Never use inflammatory language or assert fraud / crime.
2. Clearly distinguish between 'self-reported milestone schedule' and 'independently observable physical surface change'.
3. Mention specific multispectral metrics (NDVI drop indicating vegetation clearance, surface reflectance indicating earthwork/paving, and corridor spatial continuity).
4. Provide a clear, objective conclusion recommending appropriate next steps (e.g. ground verification or scheduled review).
5. Keep the narrative concise, authoritative, and defensible (2 to 3 paragraphs).
"""
            response = client.models.generate_content(
                model="gemini-2.5-flash",
                contents=prompt
            )
            if response.text and len(response.text.strip()) > 50:
                return response.text.strip()
        except Exception as e:
            logger.warning(f"Gemini explanation generation failed: {e}. Using deterministic narrative.")

    # Deterministic fallback explanation
    gap = round(expected_progress - observable_progress, 1)
    if discrepancy.status_category == "potential_discrepancy":
        explanation = (
            f"Automated multispectral analysis of {observation_count} Sentinel-2 observations indicates an observable "
            f"surface progress of {observable_progress}% within the designated road corridor, compared to an expected "
            f"schedule benchmark of {expected_progress}% (variance: -{gap}%). "
            f"Vegetation clearing (NDVI drop score: {metrics.ndvi_drop_score}) and earthwork soil disturbance "
            f"(reflectance score: {metrics.surface_reflectance_score}) were detected in early sections, but spatial "
            f"continuity across the full corridor remains incomplete. "
            f"Calculated confidence is {confidence}% based on high temporal consistency ({metrics.temporal_consistency}) "
            f"and clear optical observation passes. "
            f"Conclusion: Potential Schedule Discrepancy. Independent ground inspection is recommended."
        )
    elif discrepancy.status_category == "on_track":
        explanation = (
            f"Satellite analysis across {observation_count} observation intervals confirms substantial physical corridor "
            f"modification matching expected schedules. Observable physical progress is estimated at {observable_progress}%, "
            f"correlating with the expected {expected_progress}% benchmark. "
            f"Spatial change continuity is high ({metrics.spatial_change_score}), with active earthwork and paving signatures "
            f"detected along the corridor. Confidence stands at {confidence}%."
        )
    else:
        explanation = (
            f"Analysis across {observation_count} satellite passes yielded an observable progress of {observable_progress}% "
            f"with an overall confidence rating of {confidence}%. Due to observation frequency or atmospheric factors, "
            f"evidence is currently categorized as {discrepancy.status}. Additional satellite acquisitions are advised."
        )

    return explanation
