# SkyAudit — Product Requirements Document (PRD)

**Version:** 1.0  
**Date:** 8 October 2026  
**Target:** Hackathon MVP

---

## 1. Executive Summary

SkyAudit is an AI-assisted infrastructure verification platform that compares public project commitments with observable satellite evidence over time.

The MVP focuses on geographically defined **road projects**.

A user uploads a project/tender document. SkyAudit:

1. Extracts structured project information.
2. Creates or loads the project's geographic corridor.
3. Loads Sentinel-2 satellite observations.
4. Performs temporal/change analysis.
5. Estimates **observable project-related progress**.
6. Calculates a separate **confidence score**.
7. Compares expected progress with observed evidence.
8. Flags potential schedule discrepancies.
9. Presents the evidence in an explainable dashboard.

> **Core principle:** Satellite imagery is evidence, not ground truth.

SkyAudit does **not** claim to prove fraud or exact contractual completion.

---

## 2. Product Vision

> **Create an independent evidence layer between public infrastructure promises and physical reality.**

The long-term goal is to make infrastructure monitoring scalable by automatically screening large project portfolios and identifying projects that deserve human investigation.

---

## 3. Problem Statement

Infrastructure projects contain commitments around:

- Location
- Scope
- Budget
- Timeline
- Milestones
- Expected completion

However:

- Independent physical verification is expensive.
- Field inspections are periodic and difficult to scale.
- Public project documents and satellite observations are usually disconnected.
- Monitoring teams cannot continuously inspect thousands of projects.
- Decision-makers need a way to prioritize which projects require attention.

### Problem in one sentence

> **There is no simple evidence layer connecting what an infrastructure project promised with what can actually be observed on the ground over time.**

---

## 4. Target Users and Customers

| Segment | Problem | SkyAudit Value |
|---|---|---|
| Government monitoring teams | Too many projects to inspect | Portfolio-level screening |
| Auditors / consultants | Expensive field verification | Pre-audit evidence |
| NGOs | Difficult independent monitoring | Project evidence and timelines |
| Journalists | Need evidence for investigations | Satellite-backed investigation leads |
| Citizens | Limited project transparency | Public project information |

### Primary commercial customers

1. Government monitoring departments
2. Auditing/consulting organizations
3. Infrastructure oversight organizations

### Secondary users

- NGOs
- Journalists
- Citizens

---

# 5. Product Principles

### 5.1 Evidence over claims

SkyAudit should never treat an AI-generated statement as ground truth.

### 5.2 Progress ≠ confidence

A project can have:

- High observable progress + low confidence
- Low observable progress + high confidence

These must remain separate metrics.

### 5.3 Conservative conclusions

The system should say:

> Potential schedule discrepancy

rather than:

> Fraud detected

### 5.4 Human-in-the-loop

SkyAudit is a decision-support and screening system, not an autonomous auditor.

---

# 6. MVP Scope

## 6.1 MUST WORK

### Project ingestion

- Upload one project/tender PDF.
- Extract:
  - Project name
  - Location
  - Project type
  - Start date
  - Expected completion date
  - Project length where available
  - Milestones

### Geography

- Create or load a project geographic representation.
- For roads, represent the project as a corridor around a centerline.

### Satellite analysis

- Load at least 2–3 pre-downloaded Sentinel-2 observations.
- Compare observations over time.
- Detect meaningful spatial/temporal change.

### Results

Produce:

- Observable Progress
- Confidence
- Expected Progress
- Potential Discrepancy status
- Evidence timeline

### Dashboard

Show:

- Project information
- Map
- Project corridor
- Satellite imagery
- Before/after comparison
- Timeline
- Progress
- Confidence
- Evidence explanation

---

# 7. SHOULD WORK

- LLM-assisted project-document extraction
- Pydantic schema validation
- Multiple change indicators
- Spectral indicators such as NDVI/bare-soil proxies
- Evidence explanation
- PDF/report export
- Project history

---

# 8. OUT OF SCOPE FOR MVP

Do **not** attempt these during the hackathon:

- Monitoring every infrastructure type
- Real-time satellite monitoring
- Exact contractual completion percentage
- Automatic fraud detection
- Autonomous auditing
- Training a large model from scratch
- Production-scale cloud deployment
- Commercial high-resolution satellite imagery
- Large-scale multi-tenant architecture

---

# 9. Core User Journey

```text
User uploads project/tender
        ↓
Extract project information
        ↓
User reviews/corrects fields
        ↓
Create project corridor
        ↓
Load satellite observations
        ↓
Quality filtering
        ↓
Change detection
        ↓
Observable Progress
        +
Confidence
        ↓
Expected vs Observed comparison
        ↓
Status
        ↓
Evidence dashboard
```

---

# 10. Product Outputs

## 10.1 Observable Progress

Definition:

> Estimated physical/project-related change that is observable from available satellite evidence.

Do **not** call this:

> Project Completion %

Use:

> Observable Progress: 35%

---

## 10.2 Confidence

Confidence reflects how reliable the available evidence is.

Potential inputs:

- Image quality
- Cloud/coverage quality
- Number of observations
- Temporal consistency
- Spatial alignment
- Agreement between indicators/models

Example:

```text
Observable Progress: 35%
Confidence: 78%
```

---

## 10.3 Expected Progress

Expected progress is derived from:

- Project start date
- Expected completion date
- Milestones
- Current observation date

For the MVP, a simplified timeline model is acceptable.

---

## 10.4 Potential Discrepancy

Example:

```text
Expected Progress: 75%
Observable Progress: 35%
Confidence: 82%

Status:
Potential Schedule Discrepancy
```

This does **not** mean fraud.

It means:

> The observed evidence may not align with the expected project timeline and deserves investigation.

---

# 11. Dashboard Requirements

## Project Header

Display:

- Project name
- Project type
- Location
- Start date
- Expected completion
- Project length

## Status

Possible states:

### On Track

Observed evidence broadly aligns with expected progress.

### Potential Discrepancy

Observed progress appears materially below expected progress with sufficient confidence.

### Insufficient Evidence

Satellite evidence is inadequate or ambiguous.

---

## Progress Card

```text
Observable Progress
35%

Confidence
78%
```

These must be visually separate.

---

## Timeline

Show:

```text
Project Start
     │
     ├── Satellite Observation 1
     │
     ├── Satellite Observation 2
     │
     ├── Satellite Observation 3
     │
     ▼
Current Assessment
```

---

## Map

Show:

- Project corridor
- Satellite footprint/coverage
- Detected change areas
- Optional imagery overlay

---

## Evidence

Show:

- Observation date
- Image
- Change score
- Relevant indicators
- Confidence
- Explanation

---

# 12. Success Criteria

The hackathon MVP succeeds if:

- A judge can upload the demo project.
- Project details are extracted.
- The project appears on the map.
- Satellite imagery is displayed.
- Change analysis runs.
- Observable progress is calculated.
- Confidence is calculated separately.
- Expected vs observed progress is shown.
- A discrepancy can be demonstrated.
- Evidence is visible.
- The system works without a paid API dependency.
- The complete demo can be completed in under 2 minutes.

---

# 13. Demo Strategy

The demo should use **one carefully prepared road project**.

Do not rely on live satellite downloading during the presentation.

Recommended data:

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

The live workflow should appear dynamic while the expensive satellite data retrieval is already cached.

---

# 14. Product Risks

| Risk | Mitigation |
|---|---|
| Change is not construction | Multi-date evidence + project geometry + confidence |
| Clouds | Multiple observations; SAR later |
| LLM hallucination | Structured schema + validation |
| False precision | Use observable progress |
| False accusation | Use discrepancy language |
| API failure | Pre-cache satellite data |
| Scope creep | Start with roads |
| Poor resolution | Focus on visible infrastructure changes |

---

# 15. Roadmap

## Phase 1 — Hackathon

- Roads
- Local data
- Sentinel-2
- Classical change detection
- Dashboard
- Evidence timeline

## Phase 2 — V1

- Automated Copernicus retrieval
- Stronger change detection
- More project types
- Better project geometry extraction

## Phase 3 — V2

- Sentinel-1/SAR
- Higher-resolution imagery
- Portfolio monitoring
- Automated alerts

## Phase 4 — V3

- Government integrations
- Auditor integrations
- Public transparency portal
- Validated infrastructure-specific models
- Large-scale monitoring

---

# 16. Business Model

SkyAudit should not initially depend on citizens paying subscriptions.

### Primary model

**B2G / B2B**

Sell infrastructure monitoring to:

- Governments
- Auditors
- Infrastructure oversight organizations
- NGOs

### Value proposition

> SkyAudit reduces the cost of monitoring large infrastructure portfolios by identifying which projects deserve human inspection.

### Future model

```text
Professional Monitoring Platform
                +
        Free Public Layer
```

The public layer creates transparency while professional monitoring generates revenue.

---

# 17. Positioning

Do not position SkyAudit as:

> "An AI that detects corruption."

Position it as:

> **"An evidence platform that compares infrastructure commitments with observable satellite evidence."**

Or:

> **"We turn public infrastructure promises into independently verifiable evidence."**

---

# 18. Definition of Done

The MVP is complete when:

- [ ] PDF upload works
- [ ] Project metadata extraction works
- [ ] Metadata validation works
- [ ] Project geometry is displayed
- [ ] Satellite imagery loads
- [ ] Multi-date analysis works
- [ ] Observable progress is calculated
- [ ] Confidence is calculated
- [ ] Expected progress is calculated
- [ ] Discrepancy logic works
- [ ] Map works
- [ ] Before/after imagery works
- [ ] Evidence timeline works
- [ ] Explanation works
- [ ] Demo works offline after data preparation
