---
name: SkyAudit Enterprise Geospatial
colors:
  surface: '#f8f9ff'
  surface-dim: '#cbdbf5'
  surface-bright: '#f8f9ff'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#eff4ff'
  surface-container: '#e5eeff'
  surface-container-high: '#dce9ff'
  surface-container-highest: '#d3e4fe'
  on-surface: '#0b1c30'
  on-surface-variant: '#3f4850'
  inverse-surface: '#213145'
  inverse-on-surface: '#eaf1ff'
  outline: '#707881'
  outline-variant: '#bfc7d2'
  surface-tint: '#006398'
  primary: '#006194'
  on-primary: '#ffffff'
  primary-container: '#007bb9'
  on-primary-container: '#fdfcff'
  inverse-primary: '#93ccff'
  secondary: '#0051d5'
  on-secondary: '#ffffff'
  secondary-container: '#316bf3'
  on-secondary-container: '#fefcff'
  tertiary: '#545c72'
  on-tertiary: '#ffffff'
  tertiary-container: '#6c748b'
  on-tertiary-container: '#fefcff'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#cce5ff'
  primary-fixed-dim: '#93ccff'
  on-primary-fixed: '#001d31'
  on-primary-fixed-variant: '#004b73'
  secondary-fixed: '#dbe1ff'
  secondary-fixed-dim: '#b4c5ff'
  on-secondary-fixed: '#00174b'
  on-secondary-fixed-variant: '#003ea8'
  tertiary-fixed: '#dae2fd'
  tertiary-fixed-dim: '#bec6e0'
  on-tertiary-fixed: '#131b2e'
  on-tertiary-fixed-variant: '#3f465c'
  background: '#f8f9ff'
  on-background: '#0b1c30'
  surface-variant: '#d3e4fe'
typography:
  headline-xl:
    fontFamily: Manrope
    fontSize: 28px
    fontWeight: '700'
    lineHeight: 36px
    letterSpacing: -0.02em
  headline-lg:
    fontFamily: Manrope
    fontSize: 22px
    fontWeight: '600'
    lineHeight: 28px
    letterSpacing: -0.015em
  headline-md:
    fontFamily: Manrope
    fontSize: 18px
    fontWeight: '600'
    lineHeight: 24px
    letterSpacing: -0.01em
  headline-sm:
    fontFamily: Manrope
    fontSize: 15px
    fontWeight: '600'
    lineHeight: 20px
    letterSpacing: -0.005em
  body-lg:
    fontFamily: Inter
    fontSize: 15px
    fontWeight: '400'
    lineHeight: 22px
  body-md:
    fontFamily: Inter
    fontSize: 13px
    fontWeight: '400'
    lineHeight: 18px
  body-sm:
    fontFamily: Inter
    fontSize: 12px
    fontWeight: '400'
    lineHeight: 16px
  label-md:
    fontFamily: Inter
    fontSize: 12px
    fontWeight: '500'
    lineHeight: 16px
    letterSpacing: 0.01em
  label-sm:
    fontFamily: Inter
    fontSize: 11px
    fontWeight: '600'
    lineHeight: 14px
    letterSpacing: 0.02em
  code-tabular:
    fontFamily: Inter
    fontSize: 12px
    fontWeight: '500'
    lineHeight: 16px
    letterSpacing: 0.005em
rounded:
  sm: 0.125rem
  DEFAULT: 0.25rem
  md: 0.375rem
  lg: 0.5rem
  xl: 0.75rem
  full: 9999px
spacing:
  gutter: 1rem
  gutter-compact: 0.75rem
  margin: 1.5rem
  margin-sm: 1rem
  space-xs: 0.25rem
  space-sm: 0.5rem
  space-md: 0.75rem
  space-lg: 1.25rem
  space-xl: 1.75rem
  space-2xl: 2.5rem
---

## Brand & Style

This design system is engineered for mission-critical geospatial verification, infrastructure audit, and remote sensing analysis. It embodies an elevated aerospace-grade precision that strips away decorative novelties, AI glitz, and high-saturation trends in favor of disciplined visual utility, high legibility, and operational trust.

### Brand Personality & Core Mood
- **Aerospace Rigor:** Every pixel, border, and coordinate aligns to a mathematical cadence. The UI feels like an institutional command workstation engineered for civil engineers, spatial analysts, and risk officers.
- **Calm Authority:** Low-chroma slate and pure white surfaces provide an uncluttered backdrop that grants immediate primacy to satellite raster tiles, multispectral heatmaps, and vector polygons.
- **Auditable Clarity:** Discrepancies, milestone lags, and confidence thresholds are highlighted via precise semantic signals rather than loud alarms, preserving analytical focus.

### Design Movement & Aesthetic Approach
The system follows a modern high-density Swiss-corporate paradigm integrated with specialized workstation controls:
- Hairline structural dividers (`1px` borders in neutral slate tones) create distinct visual enclosures without bulky elevations.
- Zero decorative blurred shadows or gradient fills; depth is created strictly through surface tinting and crisp layer hierarchies.
- Balanced font pairings: technical Manrope headings anchored by neutral Inter body copy, utilizing tabular figures for coordinate grids, spectral indices, and chainage readouts.

## Colors

The palette is tuned for high-luminance enterprise desktop displays. It guarantees contrast ratios meeting WCAG AAA requirements for tabular metrics and map overlays.

### Palette Architecture
- **Primary (`#0284C7`):** Precision aerospace cyan-blue. Utilized for interactive active states, selected map corridors, chainage station pins, and primary metric emphasis.
- **Secondary (`#2563EB`):** True blue. Dedicated to actionable system buttons, primary links, split-view slider handles, and baseline telemetry plots.
- **Tertiary (`#0F172A`):** Deep charcoal slate. Forms high-contrast headings, active navigation states, dark satellite coordinate overlays, and high-priority callout surfaces.
- **Neutrals:**
  - Base canvas: `#F8FAFC` (Slate 50)
  - Surface white: `#FFFFFF` (Surface Container 0)
  - Hairline border: `#E2E8F0` (Slate 200)
  - Secondary text / metadata: `#64748B` (Slate 500)
  - Muted borders / dividers: `#F1F5F9` (Slate 100)

### Semantic Alerting System
Alert and status colors are intentionally desaturated to integrate into complex geospatial imagery without creating eye fatigue:
- **Success / On Track:** Emerald tint (`#059669`), paired with `#ECFDF5` container fill.
- **Warning / Review Needed:** Amber tint (`#D97706`), paired with `#FFFBEB` container fill.
- **Discrepancy / Behind:** Crimson tint (`#DC2626`), paired with `#FEF2F2` container fill.
- **Informational / Baseline:** Cyan-slate (`#0284C7`), paired with `#F0F9FF` container fill.

## Typography

The typographic hierarchy distinguishes operational headings from dense tabular telemetry.

- **Headlines (Manrope):** Geometric, modern, and sturdy. Delivers a clean architectural presence across dashboard section titles, inspector panels, and KPI summaries.
- **Body & Labels (Inter):** Highly legible neutral grotesque designed for digital interfaces. Configured with CSS OpenType feature settings `tnum` (tabular numbers) and `cv02`, `cv03`, `cv04` for zero-ambiguity character differentiation.
- **Technical & Metric Readouts:** All spatial indices (NDVI, BSI), chainage stations (`CH 15+000`), geographic coordinates (`12.8456° N, 79.4123° E`), and audit timestamps are rendered with strict tabular numeral spacing to prevent column jittering during real-time data streaming.

## Layout & Spacing

The layout is built for high-density spatial inspection on 16:9 and 16:10 desktop workstation screens, with structured adaptive degradation for smaller panels.

### Structural Framework
- **Primary Shell:** Fixed collapsible left sidebar (`240px` standard, `64px` icon-only), persistent global utility header (`56px` height), and an expansive fluid work-area canvas.
- **Inspector Split Layout:** The main analytical views utilize an asymmetric 3-column workstation model:
  - Left panel: Layer control & base map selection (`260px` to `300px`).
  - Center stage: Interactive geospatial viewport / split-view canvas (dynamic fluid flex).
  - Right panel: Verification scorecard, spectral plots, and inspector metadata (`340px` to `400px` fixed).
- **Data Densities:** A standard base unit of `4px` governs all gaps. High-density data tables use `8px` vertical cell padding to maximize visible records on a single screen fold.

## Elevation & Depth

This design system deliberately rejects heavy drop shadows, blurred ambient lighting, and multi-layer diffuse stacking. Visual hierarchy is established via **architectural planar containment** and **low-contrast micro-outlines**.

### Elevation Scale
- **Level 0 (Base Canvas):** Background foundation at `#F8FAFC`. Zero elevation.
- **Level 1 (Card & Module Surfaces):** Pure white `#FFFFFF` surface enclosed by a hairline `1px solid #E2E8F0` border. A faint, razor-sharp edge definition is added: `box-shadow: 0 1px 2px 0 rgba(15, 23, 42, 0.04)`.
- **Level 2 (Floating Viewport Controls):** Translucent or solid white toolbars floating directly over satellite imagery (zoom toggles, split view sliders, layer selectors). Border: `1px solid rgba(226, 232, 240, 0.9)`. Shadow: `0 4px 6px -1px rgba(15, 23, 42, 0.08), 0 2px 4px -2px rgba(15, 23, 42, 0.05)`.
- **Level 3 (Inspection Overlays & Drawers):** Contextual popovers, date range pickers, and filter dropdowns. Border: `1px solid #CBD5E1`. Shadow: `0 10px 15px -3px rgba(15, 23, 42, 0.1), 0 4px 6px -4px rgba(15, 23, 42, 0.05)`.
- **HUD Overlays (Viewport HUD):** For indicators placed directly onto dark satellite imagery (e.g., EPSG:4326 badge, chainage callouts), use deep charcoal backgrounds (`#0F172A` at 85% opacity) with `backdrop-filter: blur(4px)` and a hairline border of `rgba(255, 255, 255, 0.15)`.

## Shapes

The shape vocabulary employs a restrained soft curvature (`roundedness: 1`), conveying structural integrity and engineering precision.

### Geometric Rules
- **Base Components (Inputs, Buttons, Badges):** `4px` (`0.25rem`) border-radius.
- **Panels, Cards, and Map Viewports:** `6px` to `8px` (`0.375rem` - `0.5rem`) border-radius, maintaining crisp structural containment without looking playful or bulbous.
- **Map Viewport Inset Canvases:** `6px` radius with `overflow: hidden` to cleanly crop satellite raster tiles and coordinate axes.
- **Status Indicators & Avatars:** Micro pill badges (`9999px`) are reserved exclusively for status indicators (e.g., "On Track", "Needs Review") and circular user avatar anchors.

## Components

### Buttons
- **Primary:** Background `#2563EB`, text `#FFFFFF`, border `1px solid #1D4ED8`. Hover: `#1D4ED8`. Active: `#1E40AF`. Radius: `4px`. Text: Inter 13px Weight 500. Zero gradient.
- **Secondary / Workstation Action:** Background `#FFFFFF`, text `#0F172A`, border `1px solid #E2E8F0`. Hover: `#F8FAFC`, border `#CBD5E1`.
- **Map Floating Button:** Square `32x32px` or `36x36px`, background `#FFFFFF`, border `1px solid #E2E8F0`, icon `#475569`. Active tool state: `#0284C7` with white icon.

### Status Badges & Semantic Chips
- **Structure:** `20px` to `24px` height, `8px` horizontal padding, `4px` radius. Font size: Inter 11px Weight 600.
- **On Track:** Fill `#ECFDF5`, text `#047857`, border `1px solid #A7F3D0`. Includes a `5px` solid circular dot before text.
- **Needs Review:** Fill `#FFFBEB`, text `#B45309`, border `1px solid #FDE68A`.
- **Potential Discrepancy:** Fill `#FEF2F2`, text `#B91C1C`, border `1px solid #FECACA`.
- **Category Chip (Road, Bridge, Metro):** Fill `#F1F5F9`, text `#475569`, border `1px solid #E2E8F0`.

### Data Tables
- **Container:** Hairline enclosure (`1px solid #E2E8F0`), pure white surface.
- **Header:** Background `#F8FAFC`, border-bottom `1px solid #E2E8F0`, font Inter 11px uppercase/semibold, color `#64748B`.
- **Row:** Height `48px`, hover background `#F8FAFC`, border-bottom `1px solid #F1F5F9`.
- **Numeric Alignment:** Always right-aligned with tabular numerals (`font-variant-numeric: tabular-nums`).

### Cards & Scorecards
- **KPI Summary Card:** White surface, `1px solid #E2E8F0` border, `16px` internal padding. Top row houses title and semantic mini-icon; bottom row displays large Manrope 22px bold metric with muted comparison subtext.
- **Circular Progress Metric:** High-contrast SVG gauge with `4px` track stroke (`#E2E8F0`) and `4px` active indicator stroke (`#0284C7` or semantic color), with centered tabular percentage readout.

### Input Fields & Selectors
- **Workstation Inputs:** Height `34px`, font size Inter 13px, background `#FFFFFF`, border `1px solid #CBD5E1`, padding `0 10px`. Focus ring: `1px solid #0284C7` with no wide blurred focus halos.
- **Search Header Input:** Integrated magnifying glass icon, light surface `#F8FAFC`, border `1px solid #E2E8F0`, transitioning to white `#FFFFFF` on active focus.

### Satellite Viewport Controls & Overlays
- **Split View Comparison Handle:** Vertical dividing rule `2px solid #FFFFFF` with a central circular draggable thumb (`28px`), featuring left/right arrows, subtle shadow, and baseline/latest date tags anchored to bottom corners of the imagery.
- **Spatial HUD Information:** Coordinates and projection tags displayed in lower corners (`EPSG:4326`, `12.8456° N 79.4123° E`) inside dark slate translucent badges (`#0F172A` at 80% opacity) with monospaced white tabular type.