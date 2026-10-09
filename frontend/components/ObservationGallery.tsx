"use client";

import React, { useState } from "react";
import { Satellite, Calendar, Cloud, Activity, Sparkles, Image as ImageIcon, Sliders } from "lucide-react";
import { SatelliteObservation, API_BASE } from "@/lib/api";

interface ObservationGalleryProps {
  observations: SatelliteObservation[];
}

export const ObservationGallery: React.FC<ObservationGalleryProps> = ({ observations }) => {
  const [selectedObsId, setSelectedObsId] = useState<string>(observations[0]?.id || "obs-01");
  const [viewMode, setViewMode] = useState<"cards" | "compare">("cards");

  const selectedObs = observations.find(o => o.id === selectedObsId) || observations[0];

  return (
    <div className="glass-panel rounded-2xl overflow-hidden border border-slate-800 shadow-xl flex flex-col">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 px-5 py-3.5 border-b border-slate-800/80 bg-slate-900/60">
        <div className="flex items-center gap-2.5">
          <div className="p-1.5 rounded-lg bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
            <Satellite className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-xs font-bold text-white uppercase tracking-wider">
              Multispectral Sentinel-2 Observations
            </h3>
            <p className="text-[11px] text-slate-400">Pre-downloaded 10m Ground Resolution Optical Imagery</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs text-slate-400 font-medium">{observations.length} Passes Analyzed</span>
        </div>
      </div>

      {/* Observation Cards Grid */}
      <div className="p-5 grid grid-cols-1 md:grid-cols-3 gap-4">
        {observations.map((obs, idx) => {
          const isSelected = obs.id === selectedObsId;
          const stageName = idx === 0 ? "Baseline / Pre-Work" : idx === 1 ? "Mid-Term Earthworks" : "Latest Assessment Pass";
          
          return (
            <div
              key={obs.id}
              onClick={() => setSelectedObsId(obs.id)}
              className={`cursor-pointer rounded-xl border p-3.5 transition-all relative overflow-hidden flex flex-col justify-between ${
                isSelected 
                  ? "bg-slate-800/90 border-sky-500 shadow-lg shadow-sky-950/40" 
                  : "bg-slate-900/40 border-slate-800 hover:border-slate-700 hover:bg-slate-800/40"
              }`}
            >
              {/* Header inside card */}
              <div className="flex items-center justify-between mb-2.5">
                <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                  idx === 0 ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20" :
                  idx === 1 ? "bg-amber-500/10 text-amber-400 border border-amber-500/20" :
                  "bg-sky-500/10 text-sky-400 border border-sky-500/20"
                }`}>
                  {stageName}
                </span>
                <span className="text-[11px] font-mono text-slate-400 flex items-center gap-1">
                  <Calendar className="w-3 h-3 text-slate-500" />
                  {obs.date}
                </span>
              </div>

              {/* Imagery Graphic Representation */}
              <div className="relative w-full h-36 rounded-lg overflow-hidden mb-3 bg-[#0a0f1d] border border-slate-700/60 flex items-center justify-center group">
                {/* Visual Satellite Texture Simulation */}
                <div 
                  className={`w-full h-full transition-transform duration-500 group-hover:scale-105 ${
                    idx === 0 
                      ? "bg-gradient-to-br from-emerald-900/60 via-green-950/40 to-teal-900/50" 
                      : idx === 1 
                      ? "bg-gradient-to-br from-amber-950/60 via-stone-900 to-yellow-950/50" 
                      : "bg-gradient-to-br from-slate-900 via-zinc-900 to-sky-950/40"
                  }`}
                >
                  {/* Subtle terrain noise lines */}
                  <div className="w-full h-full opacity-30 bg-[radial-gradient(#ffffff_1px,transparent_1px)] [background-size:12px_12px]" />
                  
                  {/* Corridor disturbance line */}
                  <svg className="absolute inset-0 w-full h-full" viewBox="0 0 200 120">
                    <path
                      d="M 20 100 Q 70 50 120 70 T 180 20"
                      fill="none"
                      stroke={idx === 0 ? "#10b981" : idx === 1 ? "#f59e0b" : "#38bdf8"}
                      strokeWidth={idx === 0 ? "2" : idx === 1 ? "5" : "7"}
                      strokeDasharray={idx === 0 ? "3 3" : "none"}
                      opacity={0.85}
                    />
                  </svg>
                </div>

                <div className="absolute top-2 left-2 px-2 py-0.5 rounded bg-black/60 backdrop-blur-md text-[10px] font-mono text-slate-200">
                  {obs.source}
                </div>

                <div className="absolute bottom-2 right-2 px-2 py-0.5 rounded bg-black/60 backdrop-blur-md text-[10px] font-mono text-slate-300 flex items-center gap-1">
                  <Cloud className="w-3 h-3 text-sky-400" />
                  {obs.cloud_cover}% Cloud
                </div>
              </div>

              {/* Spectral stats */}
              <div className="grid grid-cols-2 gap-2 text-xs pt-2 border-t border-slate-800/80">
                <div className="flex flex-col">
                  <span className="text-[10px] text-slate-400">Mean NDVI:</span>
                  <span className="font-semibold text-slate-200">{obs.mean_ndvi ? obs.mean_ndvi.toFixed(2) : "0.74"}</span>
                </div>
                <div className="flex flex-col text-right">
                  <span className="text-[10px] text-slate-400">Corridor Coverage:</span>
                  <span className="font-semibold text-sky-400">{obs.corridor_coverage_pct}%</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Synchronized Comparison Bar */}
      <div className="px-5 py-3 bg-slate-950/80 border-t border-slate-800/80 flex flex-wrap items-center justify-between text-xs text-slate-400 gap-2">
        <div className="flex items-center gap-2">
          <Sparkles className="w-3.5 h-3.5 text-sky-400" />
          <span>Multispectral Spectral Bands: <strong>B02 (Blue), B03 (Green), B04 (Red), B08 (NIR)</strong></span>
        </div>
        <div>
          <span>Spatial Resolution: <strong>10m/pixel (ESA Copernicus)</strong></span>
        </div>
      </div>
    </div>
  );
};
