# SkyAudit — Independent Infrastructure Verification Platform

SkyAudit is an AI-assisted, local-first infrastructure verification platform that compares public project commitments with observable satellite evidence over time.

---

## 🏗️ Architecture

```text
Project Tender PDF / Contract
          │
          ▼
    PyMuPDF (fitz)
          │
          ▼
   Structured JSON (Pydantic)
          │
          ▼
   GeoPandas / Shapely (50m Buffer Corridor)
          │
          ▼
Sentinel-2 Multispectral Passes (B02, B03, B04, B08)
          │
          ▼
Rasterio + NumPy + OpenCV + Scikit-Image
  ├── Spatial Change Score (|Image_B - Image_A|)
  ├── Vegetation Clearing Index (NDVI Drop)
  └── Earthwork Soil Exposure Proxy (BSI)
          │
  ┌───────┴────────┐
  ▼                ▼
Observable      Confidence
Progress (35%)  Score (82%)
  │                │
  └───────┬────────┘
          ▼
Discrepancy Engine vs. Expected Progress (75%)
          │
          ▼
Guardrailed LLM Synthesis & Evidence Dashboard
```

---

## 🚀 Quick Start (Localhost)

### 1. Run the Backend (FastAPI)
```powershell
# In project root:
.\backend\.venv\Scripts\python.exe -m uvicorn backend.app.main:app --host 127.0.0.1 --port 8000 --reload
```
API Documentation available at: `http://localhost:8000/docs`

### 2. Run the Frontend (Next.js)
```powershell
cd frontend
$env:Path = "C:\Program Files\nodejs;" + $env:Path

# Option A: Run directly with npm.cmd (Recommended on Windows)
npm.cmd run dev

# Option B: Allow script execution for current PowerShell session
Set-ExecutionPolicy -Scope Process -ExecutionPolicy Bypass
npm run dev
```
Dashboard available at: `http://localhost:3000`

---

## 🧪 Run Tests
```powershell
.\backend\.venv\Scripts\python.exe -m pytest tests/test_pipeline.py -v
```

---

## 🛡️ Core Verification Principles
1. **Evidence over Claims**: Satellite imagery is observable physical evidence, not legal ground truth proof.
2. **Progress ≠ Confidence**: Calculated as two completely independent metrics.
3. **Conservative Discrepancy Classification**: Flags "Potential Schedule Discrepancy" for prioritization rather than speculative accusations.
4. **Human-in-the-Loop**: Decision-support tool for government oversight and field audit prioritization.
