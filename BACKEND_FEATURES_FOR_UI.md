# SkyAudit — Complete Backend Feature Specification for UI Design

This file documents all backend features, mathematical engines, API endpoints, data models, and sample payloads in SkyAudit. Use this reference to design and map every UI component, widget, and interactive control in your UI design tool (e.g., Google Stitch, Figma).

---

## 1. Executive System Architecture Overview

```text
┌──────────────────────────────────────────────────────────────────────────┐
│                             BACKEND PIPELINE                             │
├──────────────────────────────────────────────────────────────────────────┤
│ 1. Document Ingestion  ──► PyMuPDF text extraction + Structured Parser   │
│ 2. Geospatial Engine   ──► Centerline + Geodesic 50m UTM Buffer Corridor │
│ 3. Satellite Loader    ──► Multi-band Sentinel-2 GeoTIFFs (B02,03,04,08) │
│ 4. Change Analysis     ──► Spectral Difference + NDVI Drop + Bare Soil   │
│ 5. Progress Engine     ──► Observable Progress Score (0–100%)            │
│ 6. Confidence Engine   ──► Independent Confidence Rating (0–100%)        │
│ 7. Discrepancy Engine  ──► Expected Progress vs Observed Variance Alert  │
│ 8. Explanation Engine  ──► Guardrailed Synthesis & Decision Support      │
│ 9. Reporting Service   ──► Formal Printable Evidence Brief Generation    │
└──────────────────────────────────────────────────────────────────────────┘
```

---

## 2. Comprehensive Backend Features & UI Component Mapping

### Feature 1: Tender Document Ingestion & Structured Fact Extraction
- **Backend Service**: `backend/app/services/document_service.py` (`extract_text_from_pdf`, `parse_tender_text_deterministically`)
- **API Endpoints**: 
  - `POST /api/projects/extract-document` (Multipart PDF upload)
  - `POST /api/projects/{project_id}/document` (Upload PDF to existing project)
- **What the Backend Extracts & Provides**:
  - `project_name` (string): Official tender work name
  - `project_type` (string): Infrastructure type (`road`, `bridge`, `corridor`)
  - `location_text` (string): Administrative district, state, or highway section
  - `start_date` (ISO YYYY-MM-DD): Contract award / commencement date
  - `expected_completion` (ISO YYYY-MM-DD): Contractual completion deadline
  - `project_length_km` (float): Linear corridor length in kilometers
  - `budget_allocated` (string): Total approved project cost (e.g., `₹68.50 Cr`)
  - `contractor_name` (string): Executing contractor / concessionaire
  - `milestones` (array of objects): Scheduled milestones with target dates
- **UI Components to Render**:
  - PDF Drag-and-Drop Ingestion Modal / Drawer
  - Extracted Project Identity Card (Editable inputs or structured readouts)
  - Contract Overview Metadata Header Bar

---

### Feature 2: Geospatial Centerline & 50m Buffer Corridor Generation
- **Backend Service**: `backend/app/geo/geometry.py`, `backend/app/geo/corridor.py`
- **What the Backend Computes**:
  - WGS84 geodesic road centerline path (LineString)
  - Automatic UTM zone projection transformation for metric accuracy
  - 50-meter lateral Right-of-Way (RoW) buffer polygon (GeoJSON Polygon)
  - Segmented Road Chainage Calculation (`CH 0+000` start, intermediate work limits, `CH 14+200` terminus)
- **UI Components to Render**:
  - Interactive Map Viewport with vector layers:
    1. Road Centerline (Vector stroke, `#38BDF8`)
    2. 50m Corridor Polygon (Semi-transparent buffer with dashed border)
    3. Chainage Point Markers with clickable coordinate tooltips
  - Map Legend HUD with CRS (`EPSG:4326`) and Coordinates Display

---

### Feature 3: Multi-Temporal Sentinel-2 Imagery Processing
- **Backend Service**: `backend/app/satellite/loader.py`, `backend/app/satellite/preprocessing.py`
- **Sensor Specs**: ESA Sentinel-2 L2A (10m ground resolution, optical multispectral)
- **Bands Processed**:
  - `B02` (Blue, 490 nm)
  - `B03` (Green, 560 nm)
  - `B04` (Red, 665 nm)
  - `B08` (Near-Infrared / NIR, 842 nm)
- **Observation Metadata Provided per Pass**:
  - `id` (string): e.g., `obs-01`, `obs-02`, `obs-03`
  - `date` (ISO YYYY-MM-DD): Satellite capture timestamp
  - `cloud_cover` (float %): Atmospheric cloud interference
  - `mean_ndvi` (float): Vegetation density index inside corridor
  - `corridor_coverage_pct` (float %): Valid pixel coverage inside 50m buffer
  - `preview_url` (string): True-color RGB rendered PNG path
- **UI Components to Render**:
  - Time-Series Observation Scrubber (T0 Baseline $\rightarrow$ T1 Earthworks $\rightarrow$ T2 Latest Pass)
  - Observation Gallery Cards (Showing date, sensor, cloud %, mean NDVI)
  - Before / After Split Slider or Side-by-Side Comparison Tool

---

### Feature 4: Multi-Temporal Change Detection & Heatmap Generation
- **Backend Service**: `backend/app/analysis/change_detection.py` (`analyze_multitemporal_changes`)
- **Spectral Indices Computed**:
  1. **Normalized Difference Vegetation Index (NDVI)**:
     $$\text{NDVI} = \frac{\text{NIR} - \text{Red}}{\text{NIR} + \text{Red} + 10^{-6}}$$
     *Measures vegetation loss / clearing along the corridor.*
  2. **Bare Soil / Earthwork Index (BSI)**:
     $$\text{BSI} = \frac{(\text{Red} + \text{Blue}) - \text{NIR}}{(\text{Red} + \text{Blue} + \text{NIR}) + 10^{-6}}$$
     *Detects soil exposure, grading, and asphalt subbase preparation.*
  3. **Multi-Band Spectral Difference**:
     $$\text{Difference} = |\text{Image}_{t_2} - \text{Image}_{t_0}|$$
  4. **Multi-Temporal Heatmap Overlay (PNG/Raster)**:
     Colormapped pixel mask highlighting verified physical disturbance inside corridor.
- **UI Components to Render**:
  - Toggleable "Change Heatmap" layer on the map
  - Spectral Indices Telemetry Table (NDVI drop score, BSI score, Monotonicity %)

---

### Feature 5: Observable Progress Calculation Engine
- **Backend Service**: `backend/app/analysis/progress.py` (`calculate_observable_progress`)
- **Mathematical Formula**:
  $$\text{Progress} = (0.40 \times \text{Spatial Change}) + (0.25 \times \text{Construction Feature}) + (0.20 \times \text{Temporal Consistency}) + (0.15 \times \text{Milestone Alignment})$$
- **Output**: `observable_progress` (Float percentage, e.g. `35.0%`)
- **Component Breakdown Provided**:
  - `spatial_change_contribution`: Weighted contribution of corridor coverage
  - `construction_feature_contribution`: Weighted contribution of soil/asphalt signatures
  - `temporal_consistency_contribution`: Weighted contribution of monotonic change
  - `milestone_alignment_contribution`: Weighted alignment with milestone schedule
- **UI Components to Render**:
  - Hero Scorecard: "Observable Progress" (e.g. `35%`)
  - Sub-metric breakdown progress bar with formula tooltip

---

### Feature 6: Independent Confidence Rating Engine
- **Backend Service**: `backend/app/analysis/confidence.py` (`calculate_confidence_score`)
- **Core Principle**: *Confidence is 100% independent from progress* (high progress can have low confidence; low progress can have high confidence).
- **Mathematical Formula**:
  $$\text{Confidence} = (0.30 \times \text{Image Quality}) + (0.25 \times \text{Observation Coverage}) + (0.25 \times \text{Temporal Consistency}) + (0.20 \times \text{Indicator Agreement})$$
- **Output**: `confidence` (Float percentage, e.g. `82.0%`)
- **UI Components to Render**:
  - Hero Scorecard: "Confidence Rating" (e.g. `82%`)
  - Clarity, coverage, and sensor agreement indicator meters

---

### Feature 7: Timeline Discrepancy & Schedule Variance Engine
- **Backend Service**: `backend/app/analysis/discrepancy.py` (`calculate_expected_progress`, `evaluate_discrepancy`)
- **What the Backend Computes**:
  - **Expected Progress (%)**: $\frac{\text{Elapsed Contract Days}}{\text{Total Contract Days}} \times 100$
  - **Discrepancy Gap (%)**: $\text{Expected Progress} - \text{Observable Progress}$
  - **Status Classification**:
    - `Potential Schedule Discrepancy` (When expected $\ge 65\%$, observed $\le 40\%$, confidence $\ge 65\%$)
    - `On Track` (When observed correlates with expected timeline)
    - `Insufficient Evidence` (When confidence $< 50\%$)
  - **Severity Rating**: `low` | `medium` | `high` | `critical`
- **UI Components to Render**:
  - Status Banner Pill (`⚠ Potential Schedule Discrepancy`, High Severity)
  - Hero Scorecard: "Expected Progress" (e.g. `75%`) with variance tag (`-40% lag`)
  - Schedule Discrepancy Comparison Bar

---

### Feature 8: Evidence Timeline & Milestone Verification Track
- **Backend Service**: `backend/app/services/analysis_service.py` (`_build_evidence_timeline`)
- **What the Backend Provides**:
  - Chronological time-series combining contract claims + satellite observation events
  - Milestone verification comparison:
    • Milestone: *Land Clearing* $\rightarrow$ **Verified by Satellite T1**
    • Milestone: *Earthwork & Embankment* $\rightarrow$ **Partial (35%)**
    • Milestone: *Bituminous Surfacing* $\rightarrow$ **Discrepancy / Inactive**
- **UI Components to Render**:
  - Vertical Chronological Timeline Chain
  - Milestone Verification Checklist (With verified checkmarks and pending flags)

---

### Feature 9: Guardrailed Narrative Explanation & Decision Support
- **Backend Service**: `backend/app/services/llm_service.py` (`generate_guardrailed_explanation`)
- **Guardrail Constraints**:
  - Strictly evidence-based (anchored to NDVI, BSI, spatial scores)
  - Never uses inflammatory words like "Fraud" or "Criminal Negligence"
  - Treats satellite imagery as independent observable evidence, not legal ground truth
- **Decision Support Action Items Provided**:
  - Recommended on-site inspection chainage intervals (e.g., `Deploy field team to CH 6+500 - 14+200`)
  - Material billing and equipment manifest cross-referencing suggestions
- **UI Components to Render**:
  - Synthesis Card with quote callout
  - Actionable Recommendations Checklist

---

### Feature 10: Formal Evidence Brief Report Generation
- **Backend Service**: `backend/app/services/report_service.py` (`generate_audit_report`)
- **API Endpoint**: `GET /api/projects/{project_id}/report`
- **What the Backend Generates**:
  - Official project metadata header
  - Tri-metric scorecard (Expected, Observed, Confidence)
  - Multispectral pass log table
  - Legal disclaimer notice
- **UI Components to Render**:
  - Modal / Drawer with print-ready styling and "Print / Save PDF" trigger

---

## 3. Complete Backend JSON Payload for UI Wireframing

You can copy-paste this JSON payload directly into your design tools or use it as reference data:

```json
{
  "project_id": "NH65-HYD-01",
  "project_name": "NH-65 Hyderabad Northern Bypass Corridor",
  "project_type": "road",
  "location_text": "Hyderabad Outer Ring, Telangana",
  "start_date": "2026-01-15",
  "expected_completion": "2026-12-30",
  "project_length_km": 14.2,
  "budget_allocated": "INR 68.50 Crores",
  "contractor_name": "Apex Infrastructure & Highways Ltd.",
  "expected_progress": 75.0,
  "observable_progress": 35.0,
  "confidence": 82.0,
  "discrepancy": {
    "status": "Potential Schedule Discrepancy",
    "status_category": "potential_discrepancy",
    "severity": "high",
    "discrepancy_gap_pct": 40.0,
    "explanation": "Expected completion is 75% based on contract elapsed time, but satellite observations indicate only 35% observable physical change along the 14.2 km corridor.",
    "recommendations": [
      "Prioritize on-site engineering audit for Chainage 6+500 to 14+200.",
      "Request contractor interim billing and material delivery manifests.",
      "Hold milestone phase disbursement pending verified earthwork progress."
    ]
  },
  "metrics": {
    "spatial_change_score": 0.35,
    "temporal_consistency": 0.80,
    "construction_feature_score": 0.38,
    "milestone_alignment": 0.65,
    "image_quality": 0.90,
    "ndvi_drop_score": 0.40,
    "surface_reflectance_score": 0.35
  },
  "progress_breakdown": {
    "spatial_change_contribution": 14.0,
    "construction_feature_contribution": 9.5,
    "temporal_consistency_contribution": 16.0,
    "milestone_alignment_contribution": 9.8,
    "formula_used": "0.40×spatial + 0.25×features + 0.20×temporal + 0.15×milestones"
  },
  "confidence_breakdown": {
    "image_quality_weight": 27.0,
    "observation_coverage_weight": 25.0,
    "temporal_consistency_weight": 20.0,
    "indicator_agreement_weight": 10.0,
    "formula_used": "0.30×quality + 0.25×coverage + 0.25×temporal + 0.20×agreement"
  },
  "observations": [
    {
      "id": "obs-01",
      "date": "2026-02-15",
      "source": "Sentinel-2 L2A (10m)",
      "cloud_cover": 1.2,
      "mean_ndvi": 0.74,
      "corridor_coverage_pct": 100.0
    },
    {
      "id": "obs-02",
      "date": "2026-06-20",
      "source": "Sentinel-2 L2A (10m)",
      "cloud_cover": 4.5,
      "mean_ndvi": 0.48,
      "corridor_coverage_pct": 98.5
    },
    {
      "id": "obs-03",
      "date": "2026-09-28",
      "source": "Sentinel-2 L2A (10m)",
      "cloud_cover": 2.1,
      "mean_ndvi": 0.36,
      "corridor_coverage_pct": 100.0
    }
  ],
  "milestones": [
    { "name": "Right of Way Clearing & Demolition", "expected_date": "2026-03-31", "completed": true },
    { "name": "Earthwork & Embankment Formation", "expected_date": "2026-06-30", "completed": false },
    { "name": "Dense Bituminous Macadam (DBM)", "expected_date": "2026-09-30", "completed": false },
    { "name": "Wearing Course & Road Furniture", "expected_date": "2026-12-30", "completed": false }
  ]
}
```

---

## 4. API Endpoints Summary Table

| HTTP Method | Endpoint Path | Backend Handler | UI Purpose |
|---|---|---|---|
| `GET` | `/api/projects` | `list_projects` | Populate Project Selector dropdown |
| `POST` | `/api/projects` | `create_project` | Create new project from modal |
| `GET` | `/api/projects/{id}` | `get_project` | Load project scope & metadata |
| `POST` | `/api/projects/extract-document` | `extract_document_standalone` | Auto-fill fields from uploaded tender PDF |
| `POST` | `/api/projects/{id}/analyze` | `run_project_analysis` | Trigger re-analysis & recalculate metrics |
| `GET` | `/api/projects/{id}/analysis` | `get_latest_analysis` | Fetch full analysis & scorecards |
| `GET` | `/api/projects/{id}/evidence` | `get_project_evidence` | Fetch Sentinel-2 observation list |
| `GET` | `/api/projects/{id}/report` | `get_project_report` | Load printable Evidence Brief Report |
| `GET` | `/api/projects/{id}/images/{file}`| `get_project_image` | Serve preview PNGs and heatmap overlay |
