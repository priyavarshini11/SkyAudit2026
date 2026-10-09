"use client";

import React from "react";
import { Satellite, ShieldCheck, FileText, Upload, RefreshCw, Layers } from "lucide-react";
import { Project } from "@/lib/api";

interface HeaderProps {
  projects: Project[];
  selectedProject: Project | null;
  onSelectProject: (proj: Project) => void;
  onOpenUpload: () => void;
  onOpenReport: () => void;
  onReanalyze: () => void;
  isAnalyzing: boolean;
}

export const Header: React.FC<HeaderProps> = ({
  projects,
  selectedProject,
  onSelectProject,
  onOpenUpload,
  onOpenReport,
  onReanalyze,
  isAnalyzing
}) => {
  return (
    <header className="sticky top-0 z-40 w-full border-b border-slate-800/80 bg-[#070b14]/90 backdrop-blur-md px-4 lg:px-8 py-3.5">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
        
        {/* Brand */}
        <div className="flex items-center gap-3 w-full md:w-auto justify-between md:justify-start">
          <div className="flex items-center gap-2.5">
            <div className="relative flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-tr from-sky-600 via-cyan-500 to-indigo-500 shadow-lg shadow-sky-500/20 text-white">
              <Satellite className="w-5 h-5 animate-pulse" />
              <div className="absolute -top-1 -right-1 w-3 h-3 rounded-full bg-emerald-400 border-2 border-[#090d16]" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-xl tracking-tight bg-gradient-to-r from-white via-slate-100 to-slate-400 bg-clip-text text-transparent">
                  SkyAudit
                </span>
                <span className="px-2 py-0.5 text-[10px] uppercase font-bold tracking-wider rounded-full bg-sky-500/10 text-sky-400 border border-sky-500/20">
                  Sentinel-2
                </span>
              </div>
              <p className="text-xs text-slate-400 font-medium">Independent Infrastructure Verification</p>
            </div>
          </div>

          {/* Offline Badge */}
          <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-semibold">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Local-First Engine</span>
          </div>
        </div>

        {/* Project Selector & Actions */}
        <div className="flex items-center flex-wrap gap-2.5 w-full md:w-auto justify-end">
          
          {/* Project dropdown */}
          <div className="flex items-center gap-2 bg-slate-900/90 border border-slate-700/80 rounded-lg px-3 py-1.5 text-xs text-slate-200">
            <Layers className="w-3.5 h-3.5 text-sky-400" />
            <select
              className="bg-transparent outline-none cursor-pointer pr-2 font-medium"
              value={selectedProject?.project_id || ""}
              onChange={(e) => {
                const found = projects.find(p => p.project_id === e.target.value);
                if (found) onSelectProject(found);
              }}
            >
              {projects.map((p) => (
                <option key={p.project_id} value={p.project_id} className="bg-slate-900 text-slate-200">
                  {p.project_name} ({p.project_type})
                </option>
              ))}
            </select>
          </div>

          {/* Re-Analyze Button */}
          <button
            onClick={onReanalyze}
            disabled={isAnalyzing}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700/90 border border-slate-700 text-xs font-semibold text-slate-200 transition-all active:scale-95 disabled:opacity-50"
            title="Re-run change detection and recalculate metrics"
          >
            <RefreshCw className={`w-3.5 h-3.5 text-sky-400 ${isAnalyzing ? "animate-spin" : ""}`} />
            <span>{isAnalyzing ? "Analyzing..." : "Re-Analyze"}</span>
          </button>

          {/* Ingest Gov Project / Tender PDF */}
          <button
            onClick={onOpenUpload}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-sky-600 hover:bg-sky-500 text-white text-xs font-semibold shadow-md shadow-sky-600/20 transition-all active:scale-95"
            title="Search real government project portals or parse tender PDF with Gemini AI"
          >
            <Upload className="w-3.5 h-3.5" />
            <span>Ingest Gov Project</span>
          </button>

          {/* Evidence Brief Report */}
          <button
            onClick={onOpenReport}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white text-xs font-semibold shadow-md shadow-indigo-600/20 transition-all active:scale-95"
          >
            <FileText className="w-3.5 h-3.5" />
            <span>Evidence Brief</span>
          </button>
        </div>

      </div>
    </header>
  );
};
