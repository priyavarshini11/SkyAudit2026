# SkyAudit — UI/UX Design Specification & Custom Template Guide

This document is your blueprint and customizable wireframe system to craft a high-tier, human-crafted UI/UX for **SkyAudit** without generic "AI dashboard" tropes.

---

## 1. Design Direction & Anti-Patterns

### ❌ What makes a UI look "AI-ish" (To Avoid):
- Excessive glowing gradient borders on every single card.
- Too many colorful pills, floating sparkles, and generic pulse animations.
- Symmetrical 4-box card grids with centered bold text and generic icon badges.
- Vague "futuristic" dark modes with ungrounded purple/cyan neon everywhere.
- Walls of generated text pretending to be meaningful analytics.

### ✅ What Real Geospatial / Intelligence Tools Look Like (e.g., Palantir Foundry, Planet Labs, Linear, Sentinel Hub):
- **High Information Density with Clear Hierarchy**: Clean typography, crisp borders (`1px solid #1e293b` or `#e2e8f0`), compact toolbars.
- **Map / Imagery as the Hero**: 65–75% of screen estate dedicated to the spatial viewport with overlayable collapsible floating tool panels.
- **Purposeful Color System**: Color is only used for data state (e.g., Red/Amber for discrepancy, Green for verified, Slate for neutral telemetry).
- **Proportional Typography**: Small, readable tabular numbers (`font-mono text-xs`), distinct labels, restrained headings.
- **Split View / Inspector Pattern**: Left pane for portfolio & timeline, center for map/split slider, right pane for evidence inspector & spectral breakdown.

---

## 2. Design System Tokens (Customizable)

### A. Color Palette Options

#### Option 1: Modern Industrial Dark (Default Pro)
```css
/* Surface */
--bg-app:        #0B0F17;   /* Deep charcoal background */
--bg-surface:    #111827;   /* Panel & card background */
--bg-surface-sub:#1F2937;   /* Secondary containers */
--border-subtle: #2D3748;   /* Subtle divider lines */
--border-focus:  #3B82F6;   /* Active selection */

/* Typography */
--text-primary:   #F9FAFB;  /* 900 lightness */
--text-secondary: #9CA3AF;  /* 400 muted text */
--text-tertiary:  #6B7280;  /* 500 captions/metadata */

/* Status Accents (Strict Semantic Use) */
--status-alert:   #EF4444;  /* Schedule Discrepancy / Behind */
--status-warning: #F59E0B;  /* Moderate Variance */
--status-success: #10B981;  /* On Track / Verified */
--status-neutral: #60A5FA;  /* Observation / Info */
```

#### Option 2: Clean Institutional Light Mode (Government / Audit Style)
```css
--bg-app:        #F8FAFC;   /* Crisp slate canvas */
--bg-surface:    #FFFFFF;   /* Clean white cards */
--bg-surface-sub:#F1F5F9;   /* Off-white toolbar */
--border-subtle: #E2E8F0;   /* Light gray borders */
--text-primary:  #0F172A;   /* Deep slate */
--text-secondary:#475569;   /* Slate body */
```

---

## 3. Recommended Screen Layout Wireframe

### "Studio Inspector" Layout (3-Column / Pro Geospatial Workspace)

```text
┌────────────────────────────────────────────────────────────────────────────────────────┐
│ TOP BAR: [Logo: SkyAudit] [Project Selector ▾] | [Filter / Date Range] | [Export PDF] [Upload]│
├───────────────────┬─────────────────────────────────────────────────┬──────────────────┤
│ LEFT PANEL (20%)  │ CENTER WORKSPACE (55%)                          │ RIGHT PANEL (25%)│
│                   │                                                 │                  │
│ 📁 PROJECT CLAIMS │ 🛰️ MAP & SATELLITE EVIDENCE                     │ 🔍 EVIDENCE      │
│ • Name & ID       │ ┌─────────────────────────────────────────────┐ │    INSPECTOR     │
│ • Location & CRS  │ │ MAP / IMAGERY VIEWPORT                      │ │                  │
│ • Contractor      │ │ • Monitored Corridor (50m buffer)           │ │ 📊 Scorecards:   │
│ • Budget          │ │ • Road Centerline & Chainage Points         │ │ • Observable: 35%│
│ • Schedule:       │ │ • Detected Spectral Change Layer            │ │ • Expected: 75%  │
│   Jan 26 → Dec 26 │ │                                             │ │ • Confidence: 82%│
│                   │ └─────────────────────────────────────────────┘ │ • Status: Alert  │
│ 📅 TIMELINE:      │                                                 │                  │
│ [Jan] Awarded     │ 🎛️ Observation Slider: [T0 Baseline] [T1] [T2]  │ 📈 Spectral Data:│
│ [Mar] Baseline 🛰️ │                                                 │ • NDVI Drop: 0.40│
│ [Jun] Clearing 🛰️ │ [Split View ↔] [Layer Toggles ▾] [Inspect Tool] │ • Soil BSI: 0.35 │
│ [Sep] Paving   🛰️ │                                                 │ • Mono: 80%      │
│ [Dec] Target      │                                                 │                  │
│                   │                                                 │ 📝 Action Items: │
│                   │                                                 │ • Send Inspector │
└───────────────────┴─────────────────────────────────────────────────┴──────────────────┘
```

---

## 4. Component Structure & Template Slots

Below are the exact component contracts for your custom template:

### Component 1: `ProjectHeader`
- **Slot A**: Project Identity (Title, ID, Location, Type)
- **Slot B**: Project Context Badges (Contractor, Total Length, Budget)
- **Slot C**: Primary Actions (`Upload New Tender`, `Download Evidence Brief`, `Refresh Pass`)

### Component 2: `VerificationScorecard`
- **Metric 1: Observable Progress (%)**: Physical surface change calculated from satellite bands.
- **Metric 2: Expected Progress (%)**: Timeline benchmark based on elapsed calendar duration.
- **Metric 3: Confidence Score (%)**: Independent rating of observation clarity, coverage, and sensor agreement.
- **Metric 4: Discrepancy Status**: Clear, actionable flag (`On Track`, `Potential Schedule Discrepancy`, `Insufficient Evidence`).

### Component 3: `GeospatialViewport`
- Interactive MapLibre canvas or GeoTIFF preview.
- Toggle layers:
  1. `Road Centerline`
  2. `50m Corridor Polygon Buffer`
  3. `Detected Change Mask / Heatmap`
  4. `Raw Sentinel-2 Optical RGB`
- Split Swipe Compare Tool (Slide between Before & After).

### Component 4: `ObservationTimeline`
- Sequential list of satellite passes with date, sensor ID, cloud coverage percentage, and mean NDVI.
- Direct alignment with contractual milestones.

### Component 5: `AuditBriefModal` (Print / Export View)
- Clean, monochrome-friendly report template designed for printing or PDF export for auditors and government officials.

---

## 5. Next Steps to Implement Your Custom Design
1. Open the interactive playground at [frontend/app/sandbox/page.tsx](file:///c:/Users/mysel/OneDrive/Desktop/SkyAudit/frontend/app/sandbox/page.tsx) or `http://localhost:3000/sandbox`.
2. Edit the JSX layout and CSS classes in the sandbox to match your preferred aesthetic.
3. When you are satisfied with the structure, we can apply it directly to the main [page.tsx](file:///c:/Users/mysel/OneDrive/Desktop/SkyAudit/frontend/app/page.tsx).
