# SkyAudit — Technical Requirements Document (TRD)

**Version:** 1.0  
**Date:** 8 October 2026  
**Target:** Hackathon MVP

---

# 1. Technical Objective

Build a local-first, reproducible prototype that converts:

```text
Project Document
      +
Satellite Observations
      ↓
Geospatial Analysis
      ↓
Observable Progress
      +
Confidence
      ↓
Evidence-Based Assessment
```

The system must avoid paid services and avoid depending on live external services during the core demo.

---

# 2. Architecture

```text
                     USER
                      │
                      ▼
              Next.js / React
                      │
                      ▼
                   FastAPI
                      │
          ┌───────────┴───────────┐
          ▼                       ▼
     Project PDF              Project Data
          │                       │
          ▼                       ▼
      PyMuPDF                 GeoJSON
          │                       │
          ▼                       ▼
        LLM                  GeoPandas
          │                       │
          ▼                       ▼
      Pydantic                Corridor
                                  │
                                  ▼
                           Satellite Data
                                  │
                                  ▼
                         Rasterio + NumPy
                                  │
                                  ▼
                    OpenCV / scikit-image
                                  │
                                  ▼
                       Change Detection
                                  │
                    ┌─────────────┴────────────┐
                    ▼                          ▼
             Progress Engine            Confidence Engine
                    │                          │
                    └─────────────┬────────────┘
                                  ▼
                         Discrepancy Engine
                                  │
                                  ▼
                         Explanation Layer
                                  │
                                  ▼
                         Dashboard / Report
```

---

# 3. Recommended MVP Stack

| Layer | Technology | Type | Purpose |
|---|---|---|---|
| Frontend | Next.js | Web framework | Application |
| UI | React | UI library | Components |
| Styling | Tailwind CSS | CSS framework | UI styling |
| Map | MapLibre GL JS | Map library | Geographic visualization |
| Backend | FastAPI | Python web framework | API |
| Language | Python | Programming language | Backend/geospatial/ML |
| PDF | PyMuPDF | Python library | PDF extraction |
| Validation | Pydantic | Python library | Schema validation |
| Vector GIS | GeoPandas | Python library | Vector geometry |
| Geometry | Shapely | Python library | Spatial operations |
| Raster | Rasterio | Python library | Satellite imagery |
| Numerical | NumPy | Python library | Pixel/array calculations |
| CV | OpenCV | Computer vision library | Image processing |
| Image processing | scikit-image | Python library | Image operations |
| ML | PyTorch | ML framework | Optional pretrained models |
| Satellite | Sentinel-2 | EO satellite/data source | Evidence |
| Satellite catalog | Copernicus Data Space/STAC | Data platform/catalog | Future automated retrieval |
| Storage | Local filesystem | Storage | Satellite files |
| Database | SQLite/JSON | Local data | MVP metadata/results |
| LLM | Ollama/local model | Local AI runtime | Optional extraction/explanation |
| Deployment | Localhost | Runtime | Hackathon demo |

---

# 4. Why Local-First?

The hackathon prototype should not depend on:

- Paid APIs
- API keys arriving during the hackathon
- Live satellite downloads
- Cloud deployment
- External databases

Satellite data should be downloaded beforehand and cached locally.

Example:

```text
data/
└── projects/
    └── demo-road/
        ├── tender.pdf
        ├── project.geojson
        ├── before.tif
        ├── middle.tif
        ├── after.tif
        └── metadata.json
```

---

# 5. Repository Structure

Recommended:

```text
sky-audit/
│
├── frontend/
│   ├── app/
│   ├── components/
│   ├── lib/
│   └── public/
│
├── backend/
│   └── app/
│       ├── main.py
│       │
│       ├── api/
│       │   ├── projects.py
│       │   ├── analysis.py
│       │   └── reports.py
│       │
│       ├── schemas/
│       │   ├── project.py
│       │   ├── analysis.py
│       │   └── evidence.py
│       │
│       ├── services/
│       │   ├── document_service.py
│       │   ├── llm_service.py
│       │   ├── analysis_service.py
│       │   └── report_service.py
│       │
│       ├── geo/
│       │   ├── corridor.py
│       │   └── geometry.py
│       │
│       ├── satellite/
│       │   ├── loader.py
│       │   ├── preprocessing.py
│       │   └── metadata.py
│       │
│       └── analysis/
│           ├── change_detection.py
│           ├── progress.py
│           ├── confidence.py
│           └── discrepancy.py
│
├── data/
│   └── projects/
│
├── tests/
│
├── README.md
├── docker-compose.yml
└── .gitignore
```

For the first version, Docker is optional. Do not waste hackathon time containerizing before the application works.

---

# 6. Project Data Schema

Example:

```json
{
  "project_id": "demo-road-001",
  "project_name": "ABC Road Expansion",
  "project_type": "road",
  "location_text": "Hyderabad",
  "start_date": "2026-01-01",
  "expected_completion": "2026-12-31",
  "project_length_km": 12,
  "geometry": null,
  "milestones": [
    {
      "name": "Land preparation",
      "expected_date": "2026-03-31"
    },
    {
      "name": "Road construction",
      "expected_date": "2026-09-30"
    }
  ]
}
```

---

# 7. API

## Create Project

```http
POST /api/projects
```

Creates a project.

---

## Upload Document

```http
POST /api/projects/{project_id}/document
```

Uploads the tender/project PDF.

Pipeline:

```text
PDF
 ↓
PyMuPDF
 ↓
Text
 ↓
LLM
 ↓
Structured JSON
 ↓
Pydantic
 ↓
Project object
```

---

## Get Project

```http
GET /api/projects/{project_id}
```

Returns project metadata.

---

## Run Analysis

```http
POST /api/projects/{project_id}/analyze
```

Runs:

```text
Load imagery
 ↓
Preprocess
 ↓
Change detection
 ↓
Progress
 ↓
Confidence
 ↓
Expected progress
 ↓
Discrepancy
```

---

## Get Analysis

```http
GET /api/projects/{project_id}/analysis
```

Returns latest analysis.

---

## Get Evidence

```http
GET /api/projects/{project_id}/evidence
```

Returns satellite observations and evidence metrics.

---

## Get Report

```http
GET /api/projects/{project_id}/report
```

Returns generated report.

---

# 8. Document Processing

Use PyMuPDF to extract text.

Example:

```python
import fitz

doc = fitz.open("tender.pdf")

text = ""

for page in doc:
    text += page.get_text()
```

Then send the extracted text to a local LLM or use a deterministic parser for the MVP.

---

# 9. LLM Structured Extraction

The LLM should produce structured JSON.

Example:

```json
{
  "project_name": "ABC Road Expansion",
  "project_type": "road",
  "location_text": "Hyderabad",
  "start_date": "2026-01-01",
  "expected_completion": "2026-12-31",
  "project_length_km": 12,
  "milestones": []
}
```

Validate with Pydantic.

The LLM should **not** be allowed to directly control the analysis pipeline.

---

# 10. LLM Guardrails

The LLM can:

- Extract project facts
- Structure messy documents
- Explain analysis results
- Generate reports

The LLM cannot:

- Invent satellite observations
- Decide that construction definitely happened
- Declare fraud
- Create unsupported completion percentages
- Override confidence calculations

Correct architecture:

```text
Satellite imagery
      ↓
Geospatial / CV analysis
      ↓
Structured evidence
      ↓
LLM
      ↓
Human-readable explanation
```

Not:

```text
Satellite image
      ↓
LLM
      ↓
"Construction is 73% complete"
```

---

# 11. Project Geometry

For roads:

```text
Road centerline
      ↓
Buffer
      ↓
Monitoring corridor
```

Example:

```text
centerline + 50m buffer
```

The exact buffer should depend on project type and available geometry.

Use:

- GeoPandas
- Shapely

Store the resulting geometry as GeoJSON.

---

# 12. Satellite Data

For MVP:

- Sentinel-2
- Pre-downloaded GeoTIFFs
- At least 2–3 observation dates

Example:

```text
before.tif
middle.tif
after.tif
```

Each observation should retain:

```json
{
  "date": "2026-05-12",
  "source": "Sentinel-2",
  "cloud_cover": 8.2
}
```

The production architecture can later connect directly to Copernicus Data Space.

---

# 13. Raster Processing Pipeline

```text
GeoTIFF
  ↓
Rasterio
  ↓
Validate CRS
  ↓
Validate dimensions
  ↓
Align observations
  ↓
Clip to project corridor
  ↓
Quality filtering
  ↓
Normalize
  ↓
Feature extraction
```

---

# 14. Change Detection — MVP

Do **not** begin with a complicated custom neural network.

First create a deterministic baseline.

Potential features:

### Pixel/spectral difference

```text
Difference = |Image_B - Image_A|
```

### NDVI

Use vegetation-related spectral changes.

### Bare-soil / surface proxies

Useful for detecting:

- Land clearing
- Earthwork
- Exposed soil
- Surface changes

### Spatial consistency

Change should occur:

- Inside/near the project corridor
- Across multiple observations
- In patterns consistent with the project

---

# 15. Optional ML Layer

After the baseline works, optionally add:

- Pretrained segmentation
- Change-detection model
- PyTorch model

Do not spend most of the hackathon training a custom model.

The deterministic baseline is more important than a fancy model that doesn't work reliably.

---

# 16. Change Analysis Output

Example:

```json
{
  "spatial_change_score": 0.62,
  "temporal_consistency": 0.74,
  "construction_feature_score": 0.58,
  "milestone_alignment": 0.70,
  "image_quality": 0.90
}
```

These are prototype metrics, not validated scientific probabilities.

---

# 17. Progress Engine

Prototype formula:

```text
Progress =
    0.40 × spatial_change
  + 0.25 × construction_feature
  + 0.20 × temporal_consistency
  + 0.15 × milestone_alignment
```

Example:

```text
Progress =
    0.40 × 0.62
  + 0.25 × 0.58
  + 0.20 × 0.74
  + 0.15 × 0.70

≈ 65%
```

Convert to:

```text
Observable Progress: 65%
```

### Important

These weights are **prototype parameters**.

They are not scientifically validated.

Do not present them as a proven industry-standard formula.

---

# 18. Confidence Engine

Confidence should be independent of progress.

Possible inputs:

```text
Image Quality
Observation Coverage
Temporal Consistency
Spatial Alignment
Indicator Agreement
```

Conceptually:

```text
Confidence =
    weighted evidence quality
  + observation coverage
  + temporal consistency
  + indicator agreement
```

Example:

```text
Observable Progress: 65%
Confidence: 82%
```

---

# 19. Expected Progress

For the MVP, use a simplified timeline model.

Example:

```text
Project duration = 12 months

Current date = month 9

Expected progress ≈ 75%
```

Milestones can modify the curve.

Future versions should support:

- Weighted milestones
- Contract-specific schedules
- Delays
- Revised completion dates
- Multiple project phases

---

# 20. Discrepancy Engine

Example:

```text
Expected Progress = 75%
Observable Progress = 35%
Confidence = 82%
```

Potential rule:

```text
IF

expected_progress >= 70%
AND observable_progress <= 40%
AND confidence >= 70%

THEN

status = "Potential Schedule Discrepancy"
```

Otherwise:

```text
On Track
```

or:

```text
Insufficient Evidence
```

All thresholds should be configurable.

---

# 21. Frontend Screens

## Screen 1 — Upload

```text
Upload Project / Tender

[ Choose PDF ]

[ Analyze Project ]
```

---

## Screen 2 — Project Review

Display extracted:

```text
Project Name
Location
Type
Start Date
Expected Completion
Length
Milestones
```

Allow user correction.

---

## Screen 3 — Analysis Dashboard

```text
------------------------------------------------
PROJECT NAME
Road Expansion Project
------------------------------------------------

Observable Progress       Confidence
      35%                    82%

Status:
⚠ Potential Schedule Discrepancy

Expected Progress: 75%
Observed Progress: 35%

[ MAP ]

[ BEFORE ] [ MIDDLE ] [ AFTER ]

Evidence Timeline
------------------------------------------------
```

---

# 22. Map Requirements

MapLibre should display:

- Project geometry
- Project corridor
- Satellite coverage
- Change overlay
- Optional observation footprints

The map should allow:

- Zoom
- Pan
- Layer toggling

---

# 23. Evidence Timeline

Example:

```text
January
Project started

March
Satellite observation
Low change

June
Satellite observation
Land clearing detected

August
Satellite observation
Surface change detected

October
Current assessment

Observable Progress: 35%
Confidence: 82%
```

---

# 24. Report Generation

Example output:

```text
Project:
ABC Road Expansion

Expected Progress:
75%

Observable Progress:
35%

Confidence:
82%

Status:
Potential Schedule Discrepancy

Evidence:
Satellite observations indicate limited
project-related surface change within
the monitored corridor.

Important:
This result is satellite-based evidence,
not a ground-truth construction audit.
```

---

# 25. Testing

## Unit tests

Test:

- PDF parsing
- Pydantic validation
- Geometry creation
- CRS consistency
- Raster dimensions
- Nodata handling
- Change calculations
- Progress calculation
- Confidence calculation
- Discrepancy thresholds

---

## Integration test

```text
PDF
 ↓
Project JSON
 ↓
Geometry
 ↓
Satellite imagery
 ↓
Change analysis
 ↓
Progress
 ↓
Confidence
 ↓
Discrepancy
 ↓
API response
```

---

## Demo test

Before presentation:

1. Disconnect internet.
2. Start backend.
3. Start frontend.
4. Upload demo PDF.
5. Run analysis.
6. Confirm imagery loads.
7. Confirm dashboard loads.
8. Confirm result is reproducible.

If the demo works offline, you're protected from network/API failures.

---

# 26. Non-Functional Requirements

### Reliability

Core demo must work without external APIs.

### Reproducibility

Store:

- Input imagery
- Observation dates
- Analysis parameters
- Algorithm version
- Output metrics

### Explainability

Every result should be traceable to evidence.

### Performance

Target:

> Complete one cached-project analysis in under 30 seconds.

The entire user demo should finish in under 2 minutes.

---

# 27. Security

For MVP:

- Validate uploaded files.
- Restrict PDF size.
- Never execute uploaded content.
- Sanitize filenames.
- Sanitize project IDs.
- Do not expose filesystem paths.
- Keep secrets out of Git.

Future production system:

- Authentication
- Authorization
- Encrypted storage
- Audit logs
- Tenant isolation

---

# 28. Team Responsibilities

For a 4-person team:

## Person 1 — Frontend

Own:

- Next.js
- React
- Tailwind
- MapLibre
- Dashboard
- Image comparison
- Timeline

---

## Person 2 — Satellite / GIS

Own:

- Sentinel-2 data
- GeoPandas
- Shapely
- Rasterio
- Project corridor
- Satellite preprocessing

---

## Person 3 — Computer Vision / ML

Own:

- NumPy
- OpenCV
- scikit-image
- Change detection
- Progress features
- Confidence features
- Optional PyTorch model

---

## Person 4 — Backend / AI

Own:

- FastAPI
- PyMuPDF
- Pydantic
- SQLite/JSON
- LLM/Ollama
- API integration
- Report generation

---

# 29. Build Order

Do these in this order:

### Step 1

Create FastAPI project.

### Step 2

Create Next.js project.

### Step 3

Create project schema.

### Step 4

Load a hardcoded demo project.

### Step 5

Load one satellite image.

### Step 6

Load second satellite image.

### Step 7

Implement image difference.

### Step 8

Display difference on map.

### Step 9

Calculate observable progress.

### Step 10

Calculate confidence.

### Step 11

Calculate expected progress.

### Step 12

Implement discrepancy status.

### Step 13

Add PDF extraction.

### Step 14

Add structured LLM extraction.

### Step 15

Add evidence explanation.

### Step 16

Polish dashboard.

### Step 17

Create demo fallback.

---

# 30. Priority Levels

## P0 — Must Work

```text
Satellite
 ↓
Change Detection
 ↓
Progress
 ↓
Confidence
 ↓
Dashboard
```

## P1 — Important

```text
Tender PDF
 ↓
Project Extraction
 ↓
Geometry
```

## P2 — Nice to Have

```text
LLM explanation
PDF report
Advanced ML model
Live satellite API
```

If time runs out:

> **Kill P2 before compromising P0.**

---

# 31. Definition of Done

The technical MVP is complete when:

- [ ] FastAPI runs locally
- [ ] Next.js runs locally
- [ ] Project can be created
- [ ] Tender PDF can be uploaded
- [ ] Text can be extracted
- [ ] Project JSON validates
- [ ] Project geometry loads
- [ ] At least two satellite observations load
- [ ] Images align correctly
- [ ] Change detection runs
- [ ] Observable progress is calculated
- [ ] Confidence is calculated
- [ ] Expected progress is calculated
- [ ] Discrepancy status is calculated
- [ ] Map displays project
- [ ] Before/after imagery displays
- [ ] Evidence timeline displays
- [ ] Explanation displays
- [ ] Demo works with internet disconnected
- [ ] No paid API is required

---

# 32. Final Technical Principle

The architecture should always preserve this separation:

```text
PROJECT CLAIMS
      ↓
Structured project data

SATELLITE OBSERVATIONS
      ↓
Geospatial / CV evidence

EVIDENCE
      ↓
Progress + Confidence

PROGRESS + TIMELINE
      ↓
Potential Discrepancy

STRUCTURED RESULT
      ↓
LLM Explanation

HUMAN
      ↓
Final Investigation / Decision
```

The LLM explains the evidence.

It does not manufacture the evidence.
