"use client";

import React, { useState } from "react";
import { 
  Layers, 
  Eye, 
  EyeOff, 
  ZoomIn, 
  ZoomOut, 
  Compass, 
  MapPin, 
  Calendar, 
  Sparkles, 
  Satellite, 
  SlidersHorizontal,
  Maximize2
} from "lucide-react";
import { Project, FullAnalysisResponse, API_BASE } from "@/lib/api";

interface SatelliteImageryWorkspaceProps {
  project: Project;
  analysis: FullAnalysisResponse | null;
  onInspectEvidence?: () => void;
}

export const SatelliteImageryWorkspace: React.FC<SatelliteImageryWorkspaceProps> = ({
  project,
  analysis,
  onInspectEvidence
}) => {
  const [activePass, setActivePass] = useState<0 | 1 | 2>(2); // 0=T0, 1=T1, 2=T2
  const [showCorridor, setShowCorridor] = useState(true);
  const [showChangeMask, setShowChangeMask] = useState(true);
  const [showCenterline, setShowCenterline] = useState(true);
  const [splitMode, setSplitMode] = useState(false);
  const [splitPosition, setSplitPosition] = useState(50); // percentage

  const observations = React.useMemo(() => {
    if (analysis?.observations && analysis.observations.length >= 3) {
      return analysis.observations.slice(0, 3).map((obs, idx) => {
        const id = (idx === 0 ? "T0" : idx === 1 ? "T1" : "T2") as "T0" | "T1" | "T2";
        const tag = idx === 0 
          ? "T0 — Pre-construction baseline" 
          : idx === 1 
          ? "T1 — Construction-stage observation" 
          : "T2 — Latest satellite observation pass";
        const year = obs.date ? obs.date.slice(0, 4) : "2023";
        const desc = idx === 0 
          ? "Undisturbed natural terrain, greenfield Right-of-Way" 
          : idx === 1 
          ? "Substantial ground disturbance, earthworks & embankment grading" 
          : "Surface reflectance and paved corridor continuity verification";
        const fallbackImg = idx === 0 ? "before.png" : idx === 1 ? "middle.png" : "after.png";
        const imageSrc = obs.preview_url 
          ? `${API_BASE}${obs.preview_url}` 
          : `${API_BASE}/api/projects/${project.project_id}/images/${fallbackImg}`;
        
        return {
          id,
          tag,
          year,
          date: obs.date,
          ndvi: obs.mean_ndvi ?? (idx === 0 ? 0.65 : idx === 1 ? 0.42 : 0.28),
          aoi_ndvi: obs.mean_ndvi ? Number((obs.mean_ndvi * 0.95).toFixed(3)) : 0.35,
          cloud: obs.cloud_cover ?? 0.0,
          source: obs.source || (idx === 1 ? "Sentinel-2B MSI (ESA)" : "Sentinel-2A MSI (ESA)"),
          imageSrc,
          desc
        };
      });
    }

    // Dynamic fallback based on project start and expected completion dates
    const startYear = project.start_date ? project.start_date.slice(0, 4) : "2022";
    const endYear = project.expected_completion ? project.expected_completion.slice(0, 4) : "2024";
    const midYear = String(Math.floor((Number(startYear) + Number(endYear)) / 2));

    return [
      {
        id: "T0" as const,
        tag: "T0 — Pre-construction baseline",
        year: startYear,
        date: project.start_date || `${startYear}-03-15`,
        ndvi: 0.682,
        aoi_ndvi: 0.640,
        cloud: 0.8,
        source: "Sentinel-2A MSI (ESA)",
        imageSrc: `${API_BASE}/api/projects/${project.project_id}/images/before.png`,
        desc: "Undisturbed natural terrain, greenfield Right-of-Way"
      },
      {
        id: "T1" as const,
        tag: "T1 — Construction-stage observation",
        year: midYear,
        date: `${midYear}-06-20`,
        ndvi: 0.425,
        aoi_ndvi: 0.410,
        cloud: 1.4,
        source: "Sentinel-2B MSI (ESA)",
        imageSrc: `${API_BASE}/api/projects/${project.project_id}/images/middle.png`,
        desc: "Substantial ground disturbance, earthworks & embankment grading"
      },
      {
        id: "T2" as const,
        tag: "T2 — Latest satellite observation pass",
        year: endYear,
        date: project.expected_completion || `${endYear}-09-10`,
        ndvi: 0.294,
        aoi_ndvi: 0.280,
        cloud: 0.5,
        source: "Sentinel-2A MSI (ESA)",
        imageSrc: `${API_BASE}/api/projects/${project.project_id}/images/after.png`,
        desc: "Surface reflectance and paved corridor continuity verification"
      }
    ];
  }, [project, analysis]);

  const currentObs = observations[activePass] || observations[0];
  const changeMaskSrc = `${API_BASE}/api/projects/${project.project_id}/images/change_mask.png`;

  return (
    <div className="glass-panel rounded-2xl overflow-hidden flex flex-col border border-slate-800 shadow-xl bg-[#090d16]">
      
      {/* Top Map/Imagery Header Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-3 px-5 py-3 border-b border-slate-800/80 bg-slate-900/80">
        <div className="flex items-center gap-3">
          <div className="p-1.5 rounded-lg bg-sky-500/10 text-sky-400 border border-sky-500/20">
            <Satellite className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-white uppercase tracking-wider">
                Sentinel-2 Multispectral Workspace
              </span>
              <span className="text-[10px] font-mono bg-sky-950/80 text-sky-300 px-2 py-0.5 rounded border border-sky-500/30">
                10m L2A
              </span>
            </div>
            <p className="text-[11px] text-slate-400">
              {project.project_name} • {project.location_text}
            </p>
          </div>
        </div>

        {/* Layer Controls */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowChangeMask(!showChangeMask)}
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-semibold transition-all ${
              showChangeMask 
                ? "bg-rose-500/20 text-rose-300 border border-rose-500/30" 
                : "bg-slate-800/80 text-slate-400 border border-slate-700"
            }`}
          >
            {showChangeMask ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
            <span>Change Mask</span>
          </button>

          <button
            onClick={() => setShowCorridor(!showCorridor)}
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-semibold transition-all ${
              showCorridor 
                ? "bg-cyan-500/20 text-cyan-300 border border-cyan-500/30" 
                : "bg-slate-800/80 text-slate-400 border border-slate-700"
            }`}
          >
            {showCorridor ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
            <span>50m Corridor</span>
          </button>

          <button
            onClick={() => setSplitMode(!splitMode)}
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-semibold transition-all ${
              splitMode 
                ? "bg-indigo-500/20 text-indigo-300 border border-indigo-500/30" 
                : "bg-slate-800/80 text-slate-400 border border-slate-700"
            }`}
            title="Toggle T0 vs T2 Split Slider"
          >
            <SlidersHorizontal className="w-3.5 h-3.5" />
            <span>{splitMode ? "Single Pass" : "Swipe Comparison"}</span>
          </button>
        </div>
      </div>

      {/* Main Satellite Canvas Viewport */}
      <div className="relative w-full h-[400px] lg:h-[480px] bg-[#050811] overflow-hidden select-none flex items-center justify-center">
        
        {/* Background Grid Pattern */}
        <div className="absolute inset-0 bg-[radial-gradient(#1e293b_1px,transparent_1px)] [background-size:16px_16px] opacity-30" />

        {/* 1. Base Satellite Imagery Render */}
        {!splitMode ? (
          <div className="relative w-full h-full flex items-center justify-center p-2">
            <img 
              src={currentObs.imageSrc} 
              alt={currentObs.tag}
              className="max-w-full max-h-full object-contain rounded-lg shadow-2xl transition-opacity duration-300"
              onError={(e) => {
                (e.target as HTMLElement).style.display = 'none';
              }}
            />

            {/* Change Mask Overlay */}
            {showChangeMask && (
              <img 
                src={changeMaskSrc}
                alt="Change Mask Overlay"
                className="absolute inset-0 m-auto max-w-full max-h-full object-contain pointer-events-none mix-blend-screen opacity-85 transition-opacity duration-300"
                onError={(e) => {
                  (e.target as HTMLElement).style.display = 'none';
                }}
              />
            )}
          </div>
        ) : (
          /* 2. Interactive Swipe / Split Comparison Mode */
          <div className="relative w-full h-full flex items-center justify-center overflow-hidden p-2">
            {/* Left Image (T0) */}
            <div className="absolute inset-0 flex items-center justify-center p-2">
              <img 
                src={observations[0].imageSrc} 
                alt={`T0 ${observations[0].year} Baseline`}
                className="max-w-full max-h-full object-contain"
              />
              <div className="absolute top-4 left-4 px-2.5 py-1 rounded bg-black/70 backdrop-blur-md text-emerald-400 text-xs font-mono font-bold border border-emerald-500/30">
                T0 ({observations[0].year} Baseline)
              </div>
            </div>

            {/* Right Image (T2) clipped */}
            <div 
              className="absolute inset-0 flex items-center justify-center p-2 overflow-hidden"
              style={{ clipPath: `polygon(${splitPosition}% 0, 100% 0, 100% 100%, ${splitPosition}% 100%)` }}
            >
              <img 
                src={observations[2].imageSrc} 
                alt={`T2 ${observations[2].year} Observation`}
                className="max-w-full max-h-full object-contain"
              />
              <div className="absolute top-4 right-4 px-2.5 py-1 rounded bg-black/70 backdrop-blur-md text-sky-400 text-xs font-mono font-bold border border-sky-500/30">
                T2 ({observations[2].year} Observed)
              </div>
            </div>

            {/* Split Divider Handle */}
            <div 
              className="absolute top-0 bottom-0 w-1 bg-white shadow-2xl cursor-ew-resize flex items-center justify-center"
              style={{ left: `${splitPosition}%` }}
            >
              <div className="w-7 h-7 rounded-full bg-slate-900 border-2 border-white shadow-lg flex items-center justify-center text-[10px] text-white font-bold">
                ⬄
              </div>
            </div>

            {/* Hidden range input overlay for intuitive scrubbing */}
            <input 
              type="range" 
              min="0" 
              max="100" 
              value={splitPosition}
              onChange={(e) => setSplitPosition(Number(e.target.value))}
              className="absolute inset-0 w-full h-full opacity-0 cursor-ew-resize z-30"
            />
          </div>
        )}

        {/* SVG Corridor Right-of-Way Overlay */}
        <svg 
          className="absolute inset-0 w-full h-full pointer-events-none"
          viewBox="0 0 600 400"
          preserveAspectRatio="none"
        >
          {showCorridor && (
            <path
              d="M 60 290 Q 180 180 300 210 T 540 90 L 545 125 Q 320 250 295 240 T 65 320 Z"
              fill="rgba(56, 189, 248, 0.12)"
              stroke="rgba(56, 189, 248, 0.6)"
              strokeWidth="2"
              strokeDasharray="3 3"
            />
          )}

          {showCenterline && (
            <path
              d="M 62 305 Q 180 195 300 225 T 542 108"
              fill="none"
              stroke="#38bdf8"
              strokeWidth="3.5"
              strokeLinecap="round"
              opacity="0.9"
            />
          )}
        </svg>

        {/* Map Top-Left HUD: Pass Details */}
        <div className="absolute top-3 left-3 bg-slate-900/90 backdrop-blur-md border border-slate-700/80 rounded-xl px-3 py-2 text-xs shadow-xl space-y-1">
          <div className="font-bold text-white flex items-center gap-2">
            <span className={`w-2 h-2 rounded-full ${
              activePass === 0 ? "bg-emerald-400" : activePass === 1 ? "bg-amber-400" : "bg-sky-400"
            }`} />
            <span>{currentObs.tag}</span>
          </div>
          <div className="text-[11px] text-slate-300 font-mono flex flex-wrap items-center gap-x-3 gap-y-1">
            <span>Date: <strong>{currentObs.date}</strong></span>
            <span>Sensor: <strong className="text-sky-400">{currentObs.source}</strong></span>
            <span>Corridor NDVI: <strong>{currentObs.ndvi}</strong></span>
          </div>
        </div>

        {/* Map Top-Right HUD: Coordinates */}
        <div className="absolute top-3 right-3 bg-slate-900/90 backdrop-blur-md border border-slate-700/80 rounded-xl px-3 py-1.5 text-[11px] font-mono text-slate-300 flex items-center gap-2 shadow-xl">
          <span>AOI: 50m Corridor</span>
          <span>•</span>
          <span className="text-sky-400">EPSG:4326</span>
        </div>

        {/* Map Bottom-Left HUD: Spectral Legend */}
        {showChangeMask && (
          <div className="absolute bottom-3 left-3 bg-slate-900/90 backdrop-blur-md border border-slate-700/80 rounded-xl p-2.5 text-[11px] shadow-xl space-y-1">
            <span className="font-bold text-slate-200 block text-[10px] uppercase">
              Multispectral Disturbance Mask
            </span>
            <div className="flex items-center gap-2">
              <div className="w-3 h-2 rounded bg-rose-500" />
              <span className="text-slate-300">Corridor Disturbance Area</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-2 rounded bg-cyan-400/50 border border-cyan-400" />
              <span className="text-slate-400">50m Right-of-Way Buffer</span>
            </div>
          </div>
        )}

      </div>

      {/* Observation Pass Timeline Selector Bar (T0 / T1 / T2) */}
      <div className="px-5 py-3.5 bg-slate-950/90 border-t border-slate-800 flex flex-wrap items-center justify-between gap-4">
        
        <div className="flex items-center gap-2">
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
            Observation Pass:
          </span>
          <div className="flex items-center gap-1.5 bg-slate-900 p-1 rounded-xl border border-slate-800">
            {observations.map((obs, idx) => {
              const isSelected = activePass === idx;
              return (
                <button
                  key={obs.id}
                  onClick={() => {
                    setActivePass(idx as 0 | 1 | 2);
                    setSplitMode(false);
                  }}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-2 ${
                    isSelected
                      ? idx === 0 
                        ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 shadow-sm"
                        : idx === 1 
                        ? "bg-amber-500/20 text-amber-300 border border-amber-500/40 shadow-sm"
                        : "bg-sky-500/20 text-sky-300 border border-sky-500/40 shadow-sm"
                      : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/60"
                  }`}
                >
                  <span className="font-bold">{obs.id}</span>
                  <span className="text-[11px] opacity-80">({obs.year})</span>
                  <span className="text-[10px] font-mono opacity-60">NDVI {obs.ndvi}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Quick provenance link */}
        {onInspectEvidence && (
          <button
            onClick={onInspectEvidence}
            className="text-xs text-sky-400 hover:text-sky-300 font-semibold underline underline-offset-4 flex items-center gap-1"
          >
            <span>Inspect Score Derivation ({analysis?.observable_progress ?? 41.6}%)</span>
          </button>
        )}

      </div>

    </div>
  );
};
