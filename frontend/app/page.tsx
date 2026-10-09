"use client";

import React, { useEffect, useState } from "react";
import { 
  fetchProjects, 
  fetchProject, 
  fetchLatestAnalysis, 
  runAnalysis, 
  fetchReport, 
  Project, 
  FullAnalysisResponse, 
  EvidenceReport,
  API_BASE 
} from "@/lib/api";
import dynamic from "next/dynamic";
import { UploadModal } from "@/components/UploadModal";
import { ReportModal } from "@/components/ReportModal";
import { EvidenceInspectorModal } from "@/components/EvidenceInspectorModal";
import { SatelliteImageryWorkspace } from "@/components/SatelliteImageryWorkspace";
import { MetricCards } from "@/components/MetricCards";
import { TimelineView } from "@/components/TimelineView";
import { ExplanationCard } from "@/components/ExplanationCard";

const MapLibreView = dynamic(
  () => import("@/components/MapLibreView").then((mod) => mod.MapLibreView),
  { ssr: false }
);
import { 
  Sparkles, 
  ArrowRight, 
  FileText, 
  Satellite, 
  Activity, 
  ShieldCheck, 
  CheckCircle2, 
  Download, 
  RefreshCw, 
  Layers,
  LayoutDashboard,
  Calendar,
  Calculator,
  Building2
} from "lucide-react";

export default function SkyAuditPlatform() {
  // Navigation tabs: "overview" (Dashboard), "geospatial" (Multispectral Workspace), "evidence" (Timeline & Evidence)
  const [activeNav, setActiveNav] = useState<"overview" | "geospatial" | "evidence">("overview");
  const [activeSubTab, setActiveSubTab] = useState<"geospatial" | "change-detection">("geospatial");

  // Project & Analysis state
  const [projects, setProjects] = useState<Project[]>([]);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [analysis, setAnalysis] = useState<FullAnalysisResponse | null>(null);
  const [report, setReport] = useState<EvidenceReport | null>(null);

  // UI state
  const [isLoading, setIsLoading] = useState(true);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  // Modals
  const [isUploadOpen, setIsUploadOpen] = useState(false);
  const [isReportOpen, setIsReportOpen] = useState(false);
  const [isInspectorOpen, setIsInspectorOpen] = useState(false);

  useEffect(() => {
    loadProjectsData();
  }, []);

  const loadProjectsData = async () => {
    try {
      setIsLoading(true);
      const projList = await fetchProjects();
      const uniqueProjects = Array.from(new Map(projList.map(p => [p.project_id, p])).values());
      setProjects(uniqueProjects);
      if (uniqueProjects.length > 0) {
        const dme = uniqueProjects.find(p => p.project_id === "delhi-mumbai-sohna") || uniqueProjects[0];
        setSelectedProject(dme);
        await loadAnalysisData(dme.project_id);
      }
    } catch (err) {
      console.error("Failed to load projects:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const loadAnalysisData = async (projectId: string) => {
    try {
      setIsAnalyzing(true);
      const res = await fetchLatestAnalysis(projectId);
      setAnalysis(res);
    } catch (err) {
      console.error("Failed to load analysis:", err);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleSelectProject = async (proj: Project) => {
    setSelectedProject(proj);
    await loadAnalysisData(proj.project_id);
  };

  const handleLoadDemoProject = async () => {
    const dme = projects.find(p => p.project_id === "delhi-mumbai-sohna");
    if (dme) {
      handleSelectProject(dme);
    } else {
      await loadProjectsData();
    }
    setActiveNav("overview");
  };

  const handleReanalyze = async () => {
    if (!selectedProject) return;
    try {
      setIsAnalyzing(true);
      const updated = await runAnalysis(selectedProject.project_id);
      setAnalysis(updated);
    } catch (err) {
      console.error(err);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleOpenReport = async () => {
    if (!selectedProject) return;
    try {
      const rep = await fetchReport(selectedProject.project_id);
      setReport(rep);
      setIsReportOpen(true);
    } catch (err) {
      console.error("Report fetch error:", err);
    }
  };

  const handleProjectCreated = async (newProj: Project) => {
    setProjects((prev) => {
      const filtered = prev.filter((p) => p.project_id !== newProj.project_id);
      return [newProj, ...filtered];
    });
    setSelectedProject(newProj);
    await loadAnalysisData(newProj.project_id);
  };

  return (
    <div className="flex h-screen w-full bg-[#0b0f19] text-slate-100 font-sans antialiased overflow-hidden">
      
      {/* ========================================================================= */}
      {/* 1. LEFT SIDEBAR                                                           */}
      {/* ========================================================================= */}
      <aside className="w-64 bg-[#080c16] border-r border-slate-800 flex flex-col justify-between shrink-0 select-none z-30">
        <div className="flex flex-col flex-1 overflow-y-auto">
          
          {/* Brand Header */}
          <div className="h-16 flex items-center px-6 border-b border-slate-800/80 gap-3 bg-[#070a13]">
            <div className="w-8 h-8 rounded-lg bg-sky-600 flex items-center justify-center text-white shadow-sm shadow-sky-500/30">
              <svg className="w-5 h-5 fill-none stroke-currentColor stroke-[2.2]" viewBox="0 0 24 24">
                <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>
            <div className="flex flex-col">
              <span className="text-lg font-bold tracking-tight text-white leading-none">SkyAudit</span>
              <span className="text-[10px] tracking-wide text-sky-400 font-semibold uppercase mt-0.5">SATELLITE VERIFICATION</span>
            </div>
          </div>

          {/* Quick Demo Mode Loader */}
          <div className="p-3 border-b border-slate-800/60">
            <button
              onClick={handleLoadDemoProject}
              className="w-full flex items-center justify-between px-3 py-2 bg-gradient-to-r from-sky-600/20 to-indigo-600/20 hover:from-sky-600/30 hover:to-indigo-600/30 border border-sky-500/30 rounded-xl text-xs font-semibold text-sky-300 transition"
              title="Load verified Delhi-Mumbai Expressway case study"
            >
              <div className="flex items-center gap-2">
                <Sparkles className="w-3.5 h-3.5 text-sky-400 animate-pulse" />
                <span>Demo Case Study</span>
              </div>
              <ArrowRight className="w-3.5 h-3.5 text-sky-400" />
            </button>
          </div>

          {/* Navigation Links */}
          <nav className="p-3 space-y-1.5">
            {/* 1. Project Dashboard */}
            <button
              onClick={() => setActiveNav("overview")}
              className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all ${
                activeNav === "overview" 
                  ? "bg-sky-500/15 text-sky-300 border border-sky-500/30 shadow-sm" 
                  : "text-slate-400 hover:text-white hover:bg-slate-800/60"
              }`}
            >
              <LayoutDashboard className={`w-4 h-4 ${activeNav === "overview" ? "text-sky-400" : "text-slate-400"}`} />
              <span>Project Dashboard</span>
            </button>

            {/* 2. Multispectral Workspace */}
            <button
              onClick={() => setActiveNav("geospatial")}
              className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all ${
                activeNav === "geospatial" 
                  ? "bg-sky-500/15 text-sky-300 border border-sky-500/30 shadow-sm" 
                  : "text-slate-400 hover:text-white hover:bg-slate-800/60"
              }`}
            >
              <Satellite className={`w-4 h-4 ${activeNav === "geospatial" ? "text-sky-400" : "text-slate-400"}`} />
              <span>Multispectral Workspace</span>
            </button>

            {/* 3. Timeline & Evidence */}
            <button
              onClick={() => setActiveNav("evidence")}
              className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all ${
                activeNav === "evidence" 
                  ? "bg-sky-500/15 text-sky-300 border border-sky-500/30 shadow-sm" 
                  : "text-slate-400 hover:text-white hover:bg-slate-800/60"
              }`}
            >
              <Calendar className={`w-4 h-4 ${activeNav === "evidence" ? "text-sky-400" : "text-slate-400"}`} />
              <span>Timeline & Evidence</span>
            </button>

            {/* 4. Evidence Inspector */}
            <button
              onClick={() => setIsInspectorOpen(true)}
              className="w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-bold text-slate-400 hover:text-white hover:bg-slate-800/60 transition-all border border-transparent hover:border-slate-700"
            >
              <Calculator className="w-4 h-4 text-sky-400" />
              <span>Evidence Inspector</span>
            </button>
          </nav>

          {/* Project List */}
          <div className="px-4 py-3 border-t border-slate-800/60">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-2">
              Registered Projects ({projects.length})
            </span>
            <div className="space-y-1">
              {projects.map((p, idx) => (
                <button
                  key={`${p.project_id}-${idx}`}
                  onClick={() => handleSelectProject(p)}
                  className={`w-full text-left p-2 rounded-lg text-xs transition-all ${
                    selectedProject?.project_id === p.project_id
                      ? "bg-sky-950/60 text-sky-300 font-semibold border border-sky-500/30"
                      : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/40"
                  }`}
                >
                  <div className="truncate">{p.project_name}</div>
                  <div className="text-[10px] text-slate-400 font-mono mt-0.5">{p.location_text}</div>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Sidebar Footer */}
        <div className="p-4 border-t border-slate-800/80 space-y-3 bg-[#070a13]">
          <div className="p-3 bg-slate-900/80 rounded-xl border border-slate-800 text-xs">
            <div className="flex items-center gap-2 mb-1 font-semibold text-slate-300">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
              <span>Sentinel-2 L2A Active</span>
            </div>
            <p className="text-[11px] text-slate-400 leading-relaxed">
              CDSE 10m Multispectral Telemetry Feed
            </p>
            <div className="mt-2 text-[10px] text-sky-400 font-mono">
              SkyAudit Engine v1.0 • Defensible
            </div>
          </div>
        </div>
      </aside>

      {/* ========================================================================= */}
      {/* 2. MAIN WORKSPACE CONTAINER                                               */}
      {/* ========================================================================= */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden bg-[#0a0e1a]">
        
        {/* Top Header Bar */}
        <header className="h-16 bg-[#080c16] border-b border-slate-800 px-6 flex items-center justify-between shrink-0 z-20">
          
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 bg-slate-900 border border-slate-800 rounded-lg px-3 py-1.5 text-xs text-slate-300">
              <span className="font-semibold text-slate-400">Target:</span>
              <span className="font-bold text-white truncate max-w-xs md:max-w-md">
                {selectedProject?.project_name || "Delhi-Mumbai Expressway"}
              </span>
            </div>

            <button
              onClick={() => setIsInspectorOpen(true)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-sky-500/10 hover:bg-sky-500/20 text-sky-400 border border-sky-500/30 text-xs font-semibold rounded-lg shadow-sm transition-colors"
            >
              <Calculator className="w-3.5 h-3.5" />
              <span>Inspect Provenance ({analysis?.observable_progress ?? 41.6}%)</span>
            </button>
          </div>

          {/* Quick Actions */}
          <div className="flex items-center gap-3">
            
            {/* Re-analyze button */}
            <button
              onClick={handleReanalyze}
              disabled={isAnalyzing}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 text-xs font-semibold rounded-lg shadow-sm transition-colors disabled:opacity-50"
              title="Run multi-temporal change detection"
            >
              <RefreshCw className={`w-3.5 h-3.5 text-sky-400 ${isAnalyzing ? "animate-spin" : ""}`} />
              <span>{isAnalyzing ? "Processing..." : "Re-Run Detection"}</span>
            </button>

            {/* Ingest Gov Project / Tender PDF */}
            <button
              onClick={() => setIsUploadOpen(true)}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-gradient-to-r from-sky-600 to-cyan-600 hover:from-sky-500 hover:to-cyan-500 text-white text-xs font-semibold rounded-lg shadow-sm transition-colors"
              title="Search official government portals or upload tender document with Gemini AI"
            >
              <Building2 className="w-3.5 h-3.5" />
              <span>Ingest Gov Project / Tender</span>
            </button>

            {/* Export Brief Button */}
            <button
              onClick={handleOpenReport}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 text-xs font-semibold rounded-lg shadow-sm transition-colors"
            >
              <Download className="w-3.5 h-3.5 text-slate-400" />
              <span>Export Brief</span>
            </button>

            {/* Auditor Badge */}
            <div className="flex items-center gap-2.5 pl-3 border-l border-slate-800">
              <div className="w-8 h-8 rounded-full bg-slate-800 border border-slate-700 text-sky-400 flex items-center justify-center font-bold text-xs">
                SA
              </div>
            </div>

          </div>
        </header>

        {/* Scrollable Work Area */}
        <main className="flex-1 overflow-y-auto p-6 space-y-6">
          
          {/* ========================================================================= */}
          {/* VIEW 1: PROJECT DASHBOARD (Overview)                                      */}
          {/* ========================================================================= */}
          {activeNav === "overview" && (
            <div className="space-y-6 animate-in fade-in duration-200">
              
              {/* Evidence Chain Narrative Banner */}
              <section className="bg-gradient-to-r from-slate-900 via-[#0e1626] to-slate-900 border border-sky-500/20 rounded-2xl p-4 shadow-xl">
                <div className="flex flex-col lg:flex-row items-center justify-between gap-4 text-xs font-mono">
                  
                  {/* Step 1 */}
                  <div className="flex items-center gap-2 bg-slate-950/80 px-3 py-2 rounded-xl border border-slate-800">
                    <FileText className="w-4 h-4 text-sky-400" />
                    <div>
                      <span className="text-[10px] text-slate-400 block font-sans">PROJECT CLAIM</span>
                      <strong className="text-slate-200">
                        {selectedProject?.start_date ? selectedProject.start_date.slice(0, 4) : "2022"} → {selectedProject?.expected_completion ? selectedProject.expected_completion.slice(0, 4) : "2024"}
                      </strong>
                    </div>
                  </div>

                  <ArrowRight className="hidden lg:block w-4 h-4 text-slate-600" />

                  {/* Step 2 */}
                  <div className="flex items-center gap-2 bg-slate-950/80 px-3 py-2 rounded-xl border border-slate-800">
                    <Satellite className="w-4 h-4 text-indigo-400" />
                    <div>
                      <span className="text-[10px] text-slate-400 block font-sans">SATELLITE PASSES</span>
                      <strong className="text-slate-200">T0 → T1 → T2 (10m)</strong>
                    </div>
                  </div>

                  <ArrowRight className="hidden lg:block w-4 h-4 text-slate-600" />

                  {/* Step 3 */}
                  <div className="flex items-center gap-2 bg-slate-950/80 px-3 py-2 rounded-xl border border-slate-800">
                    <Activity className="w-4 h-4 text-amber-400" />
                    <div>
                      <span className="text-[10px] text-slate-400 block font-sans">CHANGE DETECTION</span>
                      <strong className="text-amber-300">ΔNDVI + Soil Proxy</strong>
                    </div>
                  </div>

                  <ArrowRight className="hidden lg:block w-4 h-4 text-slate-600" />

                  {/* Step 4 */}
                  <div className="flex items-center gap-2 bg-slate-950/80 px-3 py-2 rounded-xl border border-slate-800">
                    <Sparkles className="w-4 h-4 text-sky-400" />
                    <div>
                      <span className="text-[10px] text-slate-400 block font-sans">OBSERVABLE PROGRESS</span>
                      <strong className="text-sky-400 text-sm">
                        {analysis?.observable_progress ?? 41.6}% ({analysis?.confidence ?? 91}% Conf)
                      </strong>
                    </div>
                  </div>

                  <ArrowRight className="hidden lg:block w-4 h-4 text-slate-600" />

                  {/* Step 5 */}
                  <div className="flex items-center gap-2 bg-emerald-950/40 px-3 py-2 rounded-xl border border-emerald-500/30">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                    <div>
                      <span className="text-[10px] text-emerald-400 block font-sans">SCHEDULE VERDICT</span>
                      <strong className="text-emerald-300 uppercase">
                        {analysis?.discrepancy?.status || "CONSISTENT WITH EVIDENCE"}
                      </strong>
                    </div>
                  </div>

                </div>
              </section>

              {/* Defensive Metrics Cards */}
              {analysis && (
                <MetricCards 
                  analysis={analysis}
                  onInspectEvidence={() => setIsInspectorOpen(true)}
                />
              )}

              {/* Gemini / Guardrailed Audit Summary */}
              {analysis && (
                <ExplanationCard analysis={analysis} />
              )}

              {/* Main Workspace Preview */}
              {selectedProject && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-xs font-bold uppercase tracking-wider text-slate-300">
                      Active Monitoring Corridor
                    </h3>
                    <button
                      onClick={() => setActiveNav("geospatial")}
                      className="text-xs text-sky-400 hover:text-sky-300 font-semibold flex items-center gap-1"
                    >
                      <span>Open Fullscreen Workspace</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                  <SatelliteImageryWorkspace 
                    project={selectedProject}
                    analysis={analysis}
                    onInspectEvidence={() => setIsInspectorOpen(true)}
                  />
                </div>
              )}

              {/* Timeline Preview */}
              {analysis && selectedProject && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-xs font-bold uppercase tracking-wider text-slate-300">
                      Evidence Timeline
                    </h3>
                    <button
                      onClick={() => setActiveNav("evidence")}
                      className="text-xs text-sky-400 hover:text-sky-300 font-semibold flex items-center gap-1"
                    >
                      <span>View Full Evidence Audit Log</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                  <TimelineView 
                    timeline={analysis.timeline}
                    milestones={selectedProject.milestones}
                  />
                </div>
              )}

            </div>
          )}

          {/* ========================================================================= */}
          {/* VIEW 2: MULTISPECTRAL WORKSPACE                                           */}
          {/* ========================================================================= */}
          {activeNav === "geospatial" && selectedProject && (
            <div className="space-y-4 animate-in fade-in duration-200">
              
              {/* Workspace View Mode Switcher */}
              <div className="flex items-center justify-between gap-3 bg-slate-900/60 p-2 rounded-2xl border border-slate-800">
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setActiveSubTab("geospatial")}
                    className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                      activeSubTab === "geospatial"
                        ? "bg-sky-600 text-white shadow-md shadow-sky-600/30"
                        : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/60"
                    }`}
                  >
                    <Satellite className="w-4 h-4" />
                    <span>Sentinel-2 Multispectral Lens (10m L2A & Swipe Comparison)</span>
                  </button>

                  <button
                    onClick={() => setActiveSubTab("change-detection")}
                    className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                      activeSubTab === "change-detection"
                        ? "bg-sky-600 text-white shadow-md shadow-sky-600/30"
                        : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/60"
                    }`}
                  >
                    <Layers className="w-4 h-4" />
                    <span>Interactive WebGL Corridor Map (MapLibre 60 FPS)</span>
                  </button>
                </div>

                <div className="hidden sm:flex items-center gap-2 text-xs text-slate-400 pr-3">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                  <span>Spatial Resolution: 10m L2A</span>
                </div>
              </div>

              {activeSubTab === "geospatial" ? (
                <SatelliteImageryWorkspace 
                  project={selectedProject}
                  analysis={analysis}
                  onInspectEvidence={() => setIsInspectorOpen(true)}
                />
              ) : (
                <MapLibreView
                  project={selectedProject}
                  analysis={analysis}
                />
              )}

              {/* Metrics bar below workspace */}
              {analysis && (
                <MetricCards 
                  analysis={analysis}
                  onInspectEvidence={() => setIsInspectorOpen(true)}
                />
              )}
            </div>
          )}

          {/* ========================================================================= */}
          {/* VIEW 3: TIMELINE & EVIDENCE AUDIT TRAIL                                   */}
          {/* ========================================================================= */}
          {activeNav === "evidence" && analysis && selectedProject && (
            <div className="space-y-6 animate-in fade-in duration-200">
              
              <div className="flex items-center justify-between bg-slate-900/60 p-4 rounded-2xl border border-slate-800">
                <div>
                  <h3 className="text-sm font-bold text-white uppercase tracking-wider">
                    Multi-Temporal Evidence Timeline & Milestones
                  </h3>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Chronological verification comparing contractor self-reported milestones against Sentinel-2 multispectral passes
                  </p>
                </div>

                <button
                  onClick={() => setIsInspectorOpen(true)}
                  className="px-3.5 py-1.5 bg-sky-600 hover:bg-sky-500 text-white text-xs font-bold rounded-xl transition shadow-md flex items-center gap-1.5"
                >
                  <Calculator className="w-3.5 h-3.5" />
                  <span>Inspect Derivation Formula</span>
                </button>
              </div>

              <TimelineView 
                timeline={analysis.timeline}
                milestones={selectedProject.milestones}
              />

              {/* Explainable summary in evidence view */}
              <ExplanationCard analysis={analysis} />
            </div>
          )}

        </main>

      </div>

      {/* Modals & Inspectors */}
      <EvidenceInspectorModal
        isOpen={isInspectorOpen}
        onClose={() => setIsInspectorOpen(false)}
        project={selectedProject}
        analysis={analysis}
      />

      <UploadModal
        isOpen={isUploadOpen}
        onClose={() => setIsUploadOpen(false)}
        onProjectCreated={handleProjectCreated}
      />

      <ReportModal
        isOpen={isReportOpen}
        onClose={() => setIsReportOpen(false)}
        report={report}
      />

    </div>
  );
}
