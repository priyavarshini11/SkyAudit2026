"use client";

import React from "react";
import { Sparkles, ShieldCheck, AlertCircle, FileCheck, CheckCircle, ArrowUpRight } from "lucide-react";
import { FullAnalysisResponse } from "@/lib/api";

interface ExplanationCardProps {
  analysis: FullAnalysisResponse;
}

export const ExplanationCard: React.FC<ExplanationCardProps> = ({ analysis }) => {
  const { explanation, discrepancy, metrics } = analysis;

  return (
    <div className="glass-panel-glow rounded-2xl overflow-hidden border border-sky-500/20 shadow-2xl flex flex-col">
      {/* Card Header */}
      <div className="flex items-center justify-between px-5 py-3.5 border-b border-slate-800/80 bg-slate-900/80">
        <div className="flex items-center gap-2.5">
          <div className="p-1.5 rounded-lg bg-sky-500/10 text-sky-400 border border-sky-500/20">
            <Sparkles className="w-4 h-4 animate-pulse" />
          </div>
          <div>
            <h3 className="text-xs font-bold text-white uppercase tracking-wider">
              Explainable Verification Summary
            </h3>
            <p className="text-[11px] text-slate-400">Fact-Anchored Evidence Synthesis with Strict Guardrails</p>
          </div>
        </div>

        <div className="flex items-center gap-1.5 px-2 py-0.5 rounded bg-sky-500/10 border border-sky-500/20 text-sky-400 text-[11px] font-semibold">
          <ShieldCheck className="w-3.5 h-3.5" />
          <span>Audit-Ready</span>
        </div>
      </div>

      <div className="p-5 space-y-5">
        
        {/* Main Narrative Explanation */}
        <div className="bg-slate-950/60 border border-slate-800 rounded-xl p-4 text-sm text-slate-200 leading-relaxed font-sans">
          <p className="italic text-slate-300">
            "{explanation}"
          </p>
        </div>

        {/* Spectral Evidence Indicators Grid */}
        <div>
          <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2.5">
            Key Spectral Indicators Detected in Corridor
          </h4>
          
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="bg-slate-900/60 border border-slate-800/80 rounded-xl p-3 text-center">
              <span className="text-[10px] text-slate-400 uppercase font-semibold">Spatial Change</span>
              <div className="text-lg font-bold text-white mt-1">{(metrics.spatial_change_score * 100).toFixed(0)}%</div>
              <span className="text-[10px] text-slate-400">corridor modified</span>
            </div>

            <div className="bg-slate-900/60 border border-slate-800/80 rounded-xl p-3 text-center">
              <span className="text-[10px] text-slate-400 uppercase font-semibold">Vegetation Drop (NDVI)</span>
              <div className="text-lg font-bold text-emerald-400 mt-1">{metrics.ndvi_drop_score.toFixed(2)}</div>
              <span className="text-[10px] text-slate-400">clearing magnitude</span>
            </div>

            <div className="bg-slate-900/60 border border-slate-800/80 rounded-xl p-3 text-center">
              <span className="text-[10px] text-slate-400 uppercase font-semibold">Soil Exposure (BSI)</span>
              <div className="text-lg font-bold text-amber-400 mt-1">{metrics.surface_reflectance_score.toFixed(2)}</div>
              <span className="text-[10px] text-slate-400">earthwork proxy</span>
            </div>

            <div className="bg-slate-900/60 border border-slate-800/80 rounded-xl p-3 text-center">
              <span className="text-[10px] text-slate-400 uppercase font-semibold">Temporal Monotonicity</span>
              <div className="text-lg font-bold text-cyan-400 mt-1">{(metrics.temporal_consistency * 100).toFixed(0)}%</div>
              <span className="text-[10px] text-slate-400">multi-pass consistency</span>
            </div>
          </div>
        </div>

        {/* Recommendations */}
        {discrepancy.recommendations && discrepancy.recommendations.length > 0 && (
          <div className="bg-slate-900/40 border border-slate-800/80 rounded-xl p-4">
            <div className="flex items-center gap-2 mb-2">
              <AlertCircle className="w-4 h-4 text-sky-400" />
              <h4 className="text-xs font-bold text-white uppercase tracking-wider">
                Recommended Decision-Support Actions
              </h4>
            </div>

            <ul className="space-y-1.5 pl-6 list-disc text-xs text-slate-300">
              {discrepancy.recommendations.map((rec, rIdx) => (
                <li key={rIdx} className="leading-normal">{rec}</li>
              ))}
            </ul>
          </div>
        )}

      </div>
    </div>
  );
};
