---
name: Orbital Precision Telemetry
colors:
  surface: '#051424'
  surface-dim: '#051424'
  surface-bright: '#2c3a4c'
  surface-container-lowest: '#010f1f'
  surface-container-low: '#0d1c2d'
  surface-container: '#122131'
  surface-container-high: '#1c2b3c'
  surface-container-highest: '#273647'
  on-surface: '#d4e4fa'
  on-surface-variant: '#bdc8d1'
  inverse-surface: '#d4e4fa'
  inverse-on-surface: '#233143'
  outline: '#87929a'
  outline-variant: '#3e484f'
  surface-tint: '#7bd0ff'
  primary: '#8ed5ff'
  on-primary: '#00354a'
  primary-container: '#38bdf8'
  on-primary-container: '#004965'
  inverse-primary: '#00668a'
  secondary: '#4edea3'
  on-secondary: '#003824'
  secondary-container: '#00a572'
  on-secondary-container: '#00311f'
  tertiary: '#ffc174'
  on-tertiary: '#472a00'
  tertiary-container: '#f59e0b'
  on-tertiary-container: '#613b00'
  error: '#ffb4ab'
  on-error: '#690005'
  error-container: '#93000a'
  on-error-container: '#ffdad6'
  primary-fixed: '#c4e7ff'
  primary-fixed-dim: '#7bd0ff'
  on-primary-fixed: '#001e2c'
  on-primary-fixed-variant: '#004c69'
  secondary-fixed: '#6ffbbe'
  secondary-fixed-dim: '#4edea3'
  on-secondary-fixed: '#002113'
  on-secondary-fixed-variant: '#005236'
  tertiary-fixed: '#ffddb8'
  tertiary-fixed-dim: '#ffb95f'
  on-tertiary-fixed: '#2a1700'
  on-tertiary-fixed-variant: '#653e00'
  background: '#051424'
  on-background: '#d4e4fa'
  surface-variant: '#273647'
typography:
  display-lg:
    fontFamily: Space Grotesk
    fontSize: 32px
    fontWeight: '700'
    lineHeight: 40px
    letterSpacing: -0.02em
  display-lg-mobile:
    fontFamily: Space Grotesk
    fontSize: 24px
    fontWeight: '700'
    lineHeight: 32px
    letterSpacing: -0.01em
  headline-lg:
    fontFamily: Space Grotesk
    fontSize: 22px
    fontWeight: '600'
    lineHeight: 28px
    letterSpacing: -0.01em
  headline-md:
    fontFamily: Space Grotesk
    fontSize: 18px
    fontWeight: '600'
    lineHeight: 24px
    letterSpacing: 0em
  headline-sm:
    fontFamily: Space Grotesk
    fontSize: 15px
    fontWeight: '600'
    lineHeight: 20px
    letterSpacing: 0.01em
  body-lg:
    fontFamily: JetBrains Mono
    fontSize: 14px
    fontWeight: '500'
    lineHeight: 22px
    letterSpacing: -0.01em
  body-md:
    fontFamily: JetBrains Mono
    fontSize: 13px
    fontWeight: '400'
    lineHeight: 18px
    letterSpacing: 0em
  body-sm:
    fontFamily: JetBrains Mono
    fontSize: 11px
    fontWeight: '400'
    lineHeight: 16px
    letterSpacing: 0.01em
  label-md:
    fontFamily: JetBrains Mono
    fontSize: 12px
    fontWeight: '600'
    lineHeight: 16px
    letterSpacing: 0.04em
  label-sm:
    fontFamily: JetBrains Mono
    fontSize: 10px
    fontWeight: '700'
    lineHeight: 14px
    letterSpacing: 0.08em
  label-xs:
    fontFamily: JetBrains Mono
    fontSize: 9px
    fontWeight: '700'
    lineHeight: 12px
    letterSpacing: 0.12em
spacing:
  gutter: 0.5rem
  gutter-mobile: 0.25rem
  margin: 0.75rem
  margin-mobile: 0.5rem
  space-xs: 0.125rem
  space-sm: 0.25rem
  space-md: 0.5rem
  space-lg: 0.75rem
  space-xl: 1rem
---

## Brand & Style

This design system establishes an uncompromising, technical workstation environment engineered for geospatial auditing, sub-meter structural monitoring, and orbital reconnaissance. The visual tone prioritizes hyper-dense information architecture, mechanical utility, and spatial certainty over decorative software design. Every interface primitive mirrors the cold efficiency of aerospace avionics, radar analysis suites, and precision telemetry consoles.

The target audience comprises GIS directors, civil infrastructure auditors, and orbital payload analysts operating in mission-critical environments. The experience avoids ambient blurs, synthetic glass flourishes, and decorative gradients. Visual hierarchy is instead enforced through hairline demarcation, mathematical typographic scales, absolute contrast, and strict rectangular geometries. The resulting atmosphere feels institutional, permanent, and defensively crafted.

## Colors

The palette operates under an absolute low-reflectance paradigm to prevent retinal fatigue across extended analytical shifts while optimizing contrast for micro-scale vectors and high-resolution raster tiles.

- **Primary (`#38BDF8`):** Active target vector, cursor crosshair, vector bounding box, active state geometry, and high-priority orbital HUD instrumentation.
- **Secondary (`#10B981`):** Verified ground-truth verification, locked integrity, positive sensor clearance, and compliant infrastructure metrics.
- **Tertiary (`#F59E0B`):** Structural deviation alerts, moderate variance telemetry, spectral drift warnings, and pending ingest queues.
- **Critical / Alert (`#EF4444`):** Catastrophic structural subsidence, geometric breach, telemetry timeout, and high-risk anomalies.
- **Neutral Telemetry (`#94A3B8`):** Coordinates, projection descriptors, inactive coordinate axes, and static chainage text.

### Surface Architecture
- **Base Canvas (`#090D16`):** The deep matte foundation of the workstation viewport.
- **Panel Surface (`#111827`):** Side rail inspectors, timeline docks, and floating metric shelves.
- **Elevated Control Surface (`#161B22`):** Input containers, active tool palettes, and table header rows.
- **Structural Hairline (`#232D3F`):** Standard 1px boundary separating coordinate panes and canvas panels.
- **Accent Hairline (`#38BDF8`):** Active selection boundary and target acquisition brackets.

## Typography

The typographic hierarchy enforces a division between geospatial mission headers and strict machine telemetry:

1. **Section Headers and Terminal Names (`Space Grotesk`):** Engineered geometric grotesque with razor-sharp cuts. Used exclusively for window framing, module titles, and mission status milestones.
2. **Data, Metrics, and Body Elements (`JetBrains Mono`):** Every data readout, chainage stamp, coordinate pair (EPSG/WGS84), confidence coefficient, and body paragraph renders strictly in tabular monospaced letterforms. Characters align vertical columns across multiple rows of telemetry tables, ensuring instant error detection during high-speed scans.
3. **Casing Rules:** Technical micro-labels, axis markers, and status indicators strictly employ `uppercase` with tracking ranging from `+0.04em` to `+0.12em`. Standard telemetry readouts maintain raw code formatting (case preserved).

## Layout & Spacing

The layout is built for mission workstations, emphasizing data density through a 4px modular baseline grid. Padding and margins are compressed to prioritize analytical real estate:

- **Desktop (>= 1440px):** Multi-dock architecture with a fixed-width left mission hierarchy (280px), a high-resolution center canvas (fill), and a collapsible right inspector/spectral telemetry dock (340px). Gutters hold strictly at `0.5rem` (`8px`) to allow maximum panel utilization.
- **Tablet / Split View (768px - 1439px):** Inspector docks collapse into floating hairline tool drawers positioned over the primary map canvas. Margin drops to `0.5rem` (`8px`).
- **Mobile Handheld (< 768px):** Single-column HUD feed. Tool panels become bottom-pinned modal sheets with swipe locks. Gutters and section margins contract to `0.25rem` (`4px`) and `0.5rem` (`8px`).

## Elevation & Depth

This system rejects soft dropshadows, blurred halos, and glassmorphic backdrops. Spatial hierarchy relies entirely on hairline surface containment and surface brightness steps:

- **Layer 0 (Canvas Base):** Ground substrate at `#090D16`. Hosts the GIS viewport, point clouds, and satellite ortho-mosaics.
- **Layer 1 (Fixed Panels):** Telemetry drawers, chainage tables, and time sliders at `#111827`, bordered by a `1px solid #232D3F` boundary.
- **Layer 2 (Floating Overlays / Crosshairs):** Floating HUD elements, contextual coordinate tags, and target brackets at `#161B22` with a `1px solid #38BDF8` active boundary or `1px solid #232D3F` resting boundary.
- **Layer 3 (Modals / Critical Overrides):** System halts, schema errors, and sync collision dialogs at `#090D16`, framed with an inner `1px solid #EF4444` and an outer inset keyline of `1px solid #232D3F`.
- **Depth Cueing:** Elevation changes are communicated solely by hairline edge highlights (`#232D3F` to `#38BDF8`) and subtle background steps (1-4% lightness deltas), completely eliminating drop shadows.

## Shapes

All shapes throughout this design system adhere to absolute zero corner curvature (`roundedness: 0`). 

- **Corners:** Pure 90-degree right angles across every container, button, popover, badge, and input field.
- **HUD Reticles:** Bounding boxes and reticle markers utilize rectangular corner ticks (L-brackets) created using CSS pseudo-elements with 0px radius.
- **Dividers:** 1px hairline rules without caps or rounding, reinforcing a rigid instrument-grade visual grid.

## Components

### Buttons
- **Structure:** Zero-radius, 1px perimeter border, monospaced uppercase typography (`label-sm`), strictly bounded padding (`space-xs` top/bottom, `space-md` left/right). Height: `28px` (compact) or `32px` (standard).
- **Primary Action:** Background `#38BDF8`, border `1px solid #38BDF8`, text `#090D16`, font weight 700. Hover: background `#7DD3FC`, border `#7DD3FC`.
- **Secondary Action:** Background `#111827`, border `1px solid #232D3F`, text `#94A3B8`. Hover: text `#38BDF8`, border `1px solid #38BDF8`, background `#161B22`.
- **Critical Action:** Background `#111827`, border `1px solid #EF4444`, text `#EF4444`. Hover: background `#EF4444`, text `#090D16`.

### Badges & Technical Status Pills
- **Structure:** Height `18px`, 0px border-radius, `label-xs` uppercase typography, padding `0 6px`.
- **Variants:**
  - *Active Lock:* Background `rgba(56, 189, 248, 0.1)`, border `1px solid #38BDF8`, text `#38BDF8`.
  - *Verified Ground Truth:* Background `rgba(16, 185, 129, 0.1)`, border `1px solid #10B981`, text `#10B981`.
  - *Structural Variance:* Background `rgba(245, 158, 11, 0.1)`, border `1px solid #F59E0B`, text `#F59E0B`.
  - *Telemetry Stale:* Background `rgba(239, 68, 68, 0.1)`, border `1px solid #EF4444`, text `#EF4444`.

### Input Fields & Selectors
- **Structure:** Sharp rectangular containers (`#111827`), `1px solid #232D3F`, height `28px`, text color `#FFFFFF`, font `JetBrains Mono` (`body-md`).
- **Focus State:** 1px perimeter ring of `#38BDF8` with zero blur or glow.
- **Prefix / Suffix:** Embedded monospace unit stamps (e.g., `M_ASL`, `LAT`, `LON`, `DEG`) rendered in `#94A3B8` on `#161B22` background.

### Checkboxes & Segmented Toggles
- **Checkbox:** `14px x 14px` square, `1px solid #232D3F`, background `#090D16`. Checked: internal filled square of `8px x 8px` in `#38BDF8`.
- **Toggle Groups:** Segmented strip of sharp rectangular buttons connected by internal 1px hairpins. Selected item: `#161B22` with `#38BDF8` bottom indicator line (`2px solid #38BDF8`).

### Data Tables & Chainage Lists
- **Structure:** Tight row height (`24px`), horizontal hairline separators (`1px solid #232D3F`), zero vertical cell borders.
- **Header:** Sticky, `#161B22`, text in `label-xs` uppercase `#94A3B8`, text-align left with numbers aligned right.
- **Row Interaction:** Hover highlights the row in `#161B22`. Selected row displays a `2px solid #38BDF8` left border notch.

### HUD Overlays & Reticles
- **Coordinate Tags:** Absolute positioned overlays on Layer 2 displaying latitude, longitude, and elevation. Background `#090D16`, border `1px solid #232D3F`.
- **Target Reticle:** 4-point corner crosshairs framing audited structures with `#38BDF8` hairline corners.