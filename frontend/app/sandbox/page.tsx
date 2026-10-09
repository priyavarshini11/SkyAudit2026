"use client";

import React, { useState } from "react";
import Link from "next/link";
import { 
  Layers, 
  MapPin, 
  Calendar, 
  Satellite, 
  Sliders, 
  ChevronRight, 
  Download, 
  Upload, 
  AlertTriangle, 
  CheckCircle, 
  Info,
  Maximize2,
  Columns,
  RotateCcw,
  Sparkles
} from "lucide-react";

/**
 * UI/UX Template Sandbox
 * 
 * A clean, modular, pro-enterprise geospatial layout template.
 * Free of generic "AI dashboard" clutter (no excessive glows, no tacky gradients).
 * Feel free to tweak the layout, styles, components, or colors here.
 */

export default function TemplateSandbox() {
  const [activeTab, setActiveTab] = useState<"inspector" | "spectral" | "milestones">("inspector");
  const [selectedPass, setSelectedPass] = useState(2); // 0=Before, 1=Middle, 2=After
  const [showOverlay, setShowOverlay] = useState(true);
  const [splitPosition, setSplitPosition] = useState(50); // percentage

  // Mock data for templating
  const project = {
    id: "NH65-HYD-2026",
    title: "NH-65 Northern Bypass Expansion (14.2 km)",
    location: "Hyderabad Outer Ring, Telangana",
    contractor: "Apex Infrastructure & Highways Ltd.",
    budget: "₹68.50 Cr",
    startDate: "15 Jan 2026",
    targetDate: "30 Dec 2026",
    observableProgress: 35,
    expectedProgress: 75,
    confidenceScore: 82,
    status: "Potential Schedule Discrepancy",
    severity: "High",
  };

  const passes = [
    { id: "T0", date: "15 Feb 2026", label: "Baseline (Pre-Work)", cloud: "1.2%", ndvi: "0.74", status: "Intact Canopy" },
    { id: "T1", date: "20 Jun 2026", label: "Mid-Term Clearing", cloud: "4.5%", ndvi: "0.48", status: "Earthwork Active" },
    { id: "T2", date: "28 Sep 2026", label: "Latest Assessment", cloud: "2.1%", ndvi: "0.36", status: "Paving 35%" },
  ];

  return (
    <div className="min-h-screen bg-[#0d1117] text-slate-200 font-sans flex flex-col antialiased">
      
      {/* 1. Pro Enterprise App Bar */}
      <header className="h-14 border-b border-slate-800 bg-[#161b22] px-4 flex items-center justify-between z-30 shrink-0">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded bg-sky-600 flex items-center justify-center font-black text-xs text-white">
              S
            </div>
            <span className="font-bold text-sm tracking-tight text-white">SkyAudit <span className="font-mono text-xs text-slate-400 font-normal">/ Studio</span></span>
          </div>

          <div className="h-4 w-px bg-slate-700 mx-1 hidden sm:block" />

          {/* Project Selector pill */}
          <div className="flex items-center gap-2 px-2.5 py-1 rounded bg-slate-800/80 border border-slate-700 text-xs text-slate-300">
            <span className="font-mono text-slate-400">{project.id}</span>
            <span className="text-slate-500">•</span>
            <span className="font-medium text-white truncate max-w-[220px]">{project.title}</span>
          </div>
        </div>

        {/* Global Action Bar */}
        <div className="flex items-center gap-2">
          <Link
            href="/"
            className="text-xs text-slate-400 hover:text-slate-200 px-3 py-1.5 rounded hover:bg-slate-800 transition"
          >
            ← Back to Main Dashboard
          </Link>
          
          <button className="flex items-center gap-1.5 px-3 py-1.5 rounded bg-slate-800 hover:bg-slate-700 border border-slate-700 text-xs font-medium text-slate-200 transition">
            <Download className="w-3.5 h-3.5 text-slate-400" />
            <span>Export Brief</span>
          </button>

          <button className="flex items-center gap-1.5 px-3 py-1.5 rounded bg-sky-600 hover:bg-sky-500 text-xs font-semibold text-white transition">
            <Upload className="w-3.5 h-3.5" />
            <span>New Tender</span>
          </button>
        </div>
      </header>

      {/* 2. Three-Column Geospatial Studio Workspace */}
      <div className="flex-1 flex flex-col lg:flex-row overflow-hidden">
        
        {/* LEFT COLUMN: Project Details & Milestones (260px - 300px) */}
        <aside className="w-full lg:w-80 border-r border-slate-800 bg-[#11161d] flex flex-col shrink-0 overflow-y-auto">
          
          {/* Section: Project Metadata */}
          <div className="p-4 border-b border-slate-800/80 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-[11px] uppercase font-bold text-slate-400 tracking-wider">Project Scope</span>
              <span className="px-1.5 py-0.5 rounded bg-slate-800 text-[10px] font-mono text-sky-400 border border-slate-700">Road 50m Buffer</span>
            </div>

            <div className="space-y-1.5 text-xs">
              <div className="text-slate-300 font-medium">{project.location}</div>
              <div className="text-slate-400 flex items-center justify-between pt-1">
                <span>Contractor:</span>
                <span className="text-slate-200 font-medium">{project.contractor}</span>
              </div>
              <div className="text-slate-400 flex items-center justify-between">
                <span>Budget:</span>
                <span className="text-slate-200 font-mono">{project.budget}</span>
              </div>
              <div className="text-slate-400 flex items-center justify-between">
                <span>Duration:</span>
                <span className="text-slate-200 font-mono text-[11px]">{project.startDate} → {project.targetDate}</span>
              </div>
            </div>
          </div>

          {/* Section: Observation History Passes */}
          <div className="p-4 border-b border-slate-800/80 space-y-2">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[11px] uppercase font-bold text-slate-400 tracking-wider">Sentinel-2 Passes</span>
              <span className="text-[11px] text-slate-500">{passes.length} Captured</span>
            </div>

            <div className="space-y-1.5">
              {passes.map((p, idx) => (
                <button
                  key={p.id}
                  onClick={() => setSelectedPass(idx)}
                  className={`w-full text-left p-2.5 rounded border transition-all flex items-center justify-between ${
                    selectedPass === idx 
                      ? "bg-slate-800 border-sky-500/80 text-white" 
                      : "bg-slate-900/60 border-slate-800 hover:border-slate-700 text-slate-300"
                  }`}
                >
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs font-bold text-sky-400">{p.id}</span>
                      <span className="text-xs font-medium">{p.label}</span>
                    </div>
                    <div className="text-[11px] text-slate-400 mt-0.5">{p.date} • Cloud: {p.cloud}</div>
                  </div>
                  <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-slate-950/80 border border-slate-800 text-slate-300">
                    NDVI {p.ndvi}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Section: Contract Milestones Checklist */}
          <div className="p-4 space-y-2">
            <span className="text-[11px] uppercase font-bold text-slate-400 tracking-wider block mb-2">Contract Milestones</span>
            <div className="space-y-2 text-xs">
              <div className="p-2.5 rounded bg-slate-900/50 border border-slate-800 flex items-start gap-2.5">
                <CheckCircle className="w-4 h-4 text-emerald-400 mt-0.5 shrink-0" />
                <div>
                  <div className="font-medium text-slate-200">Right-of-Way Clearing</div>
                  <div className="text-[11px] text-slate-400">Target: 31 Mar 2026 • <span className="text-emerald-400 font-medium">Verified by Satellite</span></div>
                </div>
              </div>

              <div className="p-2.5 rounded bg-slate-900/50 border border-slate-800 flex items-start gap-2.5">
                <AlertTriangle className="w-4 h-4 text-amber-400 mt-0.5 shrink-0" />
                <div>
                  <div className="font-medium text-slate-200">Earthwork & Subbase</div>
                  <div className="text-[11px] text-slate-400">Target: 30 Jun 2026 • <span className="text-amber-400 font-medium">Partial (~35%)</span></div>
                </div>
              </div>

              <div className="p-2.5 rounded bg-slate-900/50 border border-slate-800 flex items-start gap-2.5 opacity-60">
                <div className="w-4 h-4 rounded-full border border-slate-600 mt-0.5 shrink-0" />
                <div>
                  <div className="font-medium text-slate-300">Bituminous Macadam Surfacing</div>
                  <div className="text-[11px] text-slate-500">Target: 30 Sep 2026 • Pending</div>
                </div>
              </div>
            </div>
          </div>

        </aside>

        {/* CENTER COLUMN: The Primary Geospatial Canvas & Imagery Viewport (Flexible) */}
        <main className="flex-1 flex flex-col bg-[#0b0f14] overflow-hidden relative">
          
          {/* Top Canvas Controls Toolbar */}
          <div className="h-10 border-b border-slate-800/80 bg-[#161b22]/90 px-4 flex items-center justify-between text-xs text-slate-300 z-20">
            <div className="flex items-center gap-3">
              <span className="font-mono text-slate-400">EPSG:4326</span>
              <span className="text-slate-600">|</span>
              <span className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-400" />
                <span>Viewing Pass: <strong className="text-white">{passes[selectedPass].label} ({passes[selectedPass].date})</strong></span>
              </span>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setShowOverlay(!showOverlay)}
                className={`px-2 py-1 rounded text-xs border transition ${
                  showOverlay 
                    ? "bg-sky-950 border-sky-700 text-sky-300" 
                    : "bg-slate-800 border-slate-700 text-slate-400"
                }`}
              >
                Change Heatmap {showOverlay ? "ON" : "OFF"}
              </button>
            </div>
          </div>

          {/* Interactive Geospatial Viewport Simulation */}
          <div className="flex-1 relative flex items-center justify-center p-6 select-none bg-[radial-gradient(#1f2937_1px,transparent_1px)] [background-size:24px_24px]">
            
            {/* Viewport Frame */}
            <div className="w-full h-full max-w-4xl max-h-[560px] bg-[#0f141c] border border-slate-800 rounded-xl overflow-hidden relative shadow-2xl">
              
              {/* Simulated Multi-Spectral Satellite Canvas */}
              <div className="absolute inset-0 bg-[#0d141e]">
                {/* Visual Terrain Structure */}
                <div className={`w-full h-full transition-all duration-700 ${
                  selectedPass === 0 ? "opacity-90 bg-emerald-950/40" :
                  selectedPass === 1 ? "opacity-90 bg-amber-950/40" :
                  "opacity-90 bg-slate-900/60"
                }`} />

                {/* Road Corridor Vector Layer */}
                <svg className="absolute inset-0 w-full h-full" viewBox="0 0 800 500" preserveAspectRatio="none">
                  <defs>
                    <linearGradient id="corridorFill" x1="0" y1="0" x2="1" y2="1">
                      <stop offset="0%" stopColor="rgba(56, 189, 248, 0.15)" />
                      <stop offset="100%" stopColor="rgba(99, 102, 241, 0.10)" />
                    </linearGradient>
                  </defs>

                  {/* 50m Monitored Corridor Buffer */}
                  <path
                    d="M 80 380 Q 250 240 400 270 T 720 120 L 730 160 Q 430 310 390 300 T 85 420 Z"
                    fill="url(#corridorFill)"
                    stroke="rgba(56, 189, 248, 0.5)"
                    strokeWidth="1.5"
                    strokeDasharray="4 4"
                  />

                  {/* Spectral Change Mask (Heatmap) */}
                  {showOverlay && (
                    <path
                      d="M 82 390 Q 250 255 330 280 L 328 305 Q 250 275 84 408 Z"
                      fill="rgba(239, 68, 68, 0.6)"
                      stroke="rgba(239, 68, 68, 0.9)"
                      strokeWidth="1.5"
                    />
                  )}

                  {/* Road Centerline */}
                  <path
                    d="M 82 400 Q 250 255 400 285 T 725 140"
                    fill="none"
                    stroke="#38bdf8"
                    strokeWidth="3.5"
                    strokeLinecap="round"
                  />

                  {/* Chainage Labels */}
                  <circle cx="82" cy="400" r="4" fill="#38bdf8" stroke="#fff" strokeWidth="1.5" />
                  <text x="60" y="435" fill="#94a3b8" fontSize="11" fontFamily="monospace" fontWeight="bold">CH 0+000</text>

                  <circle cx="330" cy="280" r="4" fill="#f59e0b" stroke="#fff" strokeWidth="1.5" />
                  <text x="310" y="260" fill="#f59e0b" fontSize="11" fontFamily="monospace" fontWeight="bold">CH 5+800 (Work Limit)</text>

                  <circle cx="725" cy="140" r="4" fill="#ef4444" stroke="#fff" strokeWidth="1.5" />
                  <text x="660" y="125" fill="#ef4444" fontSize="11" fontFamily="monospace" fontWeight="bold">CH 14+200</text>
                </svg>
              </div>

              {/* Viewport Floating HUD Legend */}
              <div className="absolute bottom-4 left-4 p-3 rounded-lg bg-[#161b22]/90 border border-slate-700/80 backdrop-blur-md text-xs space-y-1.5 shadow-lg">
                <div className="font-semibold text-white text-[11px] uppercase tracking-wider mb-1">Spectral Change Legend</div>
                <div className="flex items-center gap-2 text-slate-300">
                  <div className="w-3 h-3 rounded bg-red-500" />
                  <span>Verified Paving / Earthwork (35%)</span>
                </div>
                <div className="flex items-center gap-2 text-slate-400">
                  <div className="w-3 h-3 rounded bg-slate-700 border border-slate-600" />
                  <span>Unworked Intact Canopy (65%)</span>
                </div>
              </div>

              {/* Coordinates Badge */}
              <div className="absolute top-4 left-4 px-2.5 py-1 rounded bg-[#161b22]/90 border border-slate-700 text-[11px] font-mono text-slate-300">
                17.435° N, 78.480° E • Sentinel-2 L2A (10m)
              </div>
            </div>

          </div>

          {/* Bottom Time-Series Scrub Bar */}
          <div className="h-16 border-t border-slate-800 bg-[#11161d] px-6 flex items-center justify-between text-xs z-20">
            <div className="flex items-center gap-4">
              <span className="text-[11px] uppercase font-bold text-slate-400">Observation Timeline:</span>
              <div className="flex items-center gap-2">
                {passes.map((p, idx) => (
                  <button
                    key={p.id}
                    onClick={() => setSelectedPass(idx)}
                    className={`px-3 py-1.5 rounded text-xs font-mono font-medium transition ${
                      selectedPass === idx
                        ? "bg-sky-600 text-white shadow-sm"
                        : "bg-slate-800 text-slate-400 hover:text-slate-200"
                    }`}
                  >
                    {p.id}: {p.date}
                  </button>
                ))}
              </div>
            </div>

            <div className="text-slate-400 text-xs">
              Corridor Buffer: <strong className="text-slate-200">50m Right-of-Way</strong>
            </div>
          </div>

        </main>

        {/* RIGHT COLUMN: Evidence Inspector & Scorecards (320px - 360px) */}
        <aside className="w-full lg:w-96 border-l border-slate-800 bg-[#11161d] flex flex-col shrink-0 overflow-y-auto">
          
          {/* Tab navigation */}
          <div className="flex border-b border-slate-800 text-xs font-medium">
            <button
              onClick={() => setActiveTab("inspector")}
              className={`flex-1 py-3 text-center transition ${
                activeTab === "inspector" 
                  ? "border-b-2 border-sky-500 text-white font-semibold bg-slate-800/30" 
                  : "text-slate-400 hover:text-slate-200"
              }`}
            >
              Verification
            </button>
            <button
              onClick={() => setActiveTab("spectral")}
              className={`flex-1 py-3 text-center transition ${
                activeTab === "spectral" 
                  ? "border-b-2 border-sky-500 text-white font-semibold bg-slate-800/30" 
                  : "text-slate-400 hover:text-slate-200"
              }`}
            >
              Spectral Indices
            </button>
          </div>

          {/* Tab 1: Verification Inspector */}
          {activeTab === "inspector" && (
            <div className="p-4 space-y-4">
              
              {/* Primary Status Banner */}
              <div className="p-3.5 rounded-lg border bg-red-950/20 border-red-500/40 text-red-200 space-y-1">
                <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-red-400">
                  <AlertTriangle className="w-4 h-4" />
                  <span>{project.status}</span>
                </div>
                <p className="text-xs text-slate-300 leading-normal">
                  Contractual target is {project.expectedProgress}%, but satellite observations indicate only {project.observableProgress}% observable physical change (variance: -40%).
                </p>
              </div>

              {/* Progress & Confidence Metrics */}
              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 rounded-lg bg-slate-900 border border-slate-800">
                  <span className="text-[11px] text-slate-400 uppercase font-semibold">Observable Progress</span>
                  <div className="text-2xl font-bold font-mono text-sky-400 mt-1">{project.observableProgress}%</div>
                  <div className="text-[10px] text-slate-500 mt-1">Formula: 0.40×spatial + 0.25×features</div>
                </div>

                <div className="p-3 rounded-lg bg-slate-900 border border-slate-800">
                  <span className="text-[11px] text-slate-400 uppercase font-semibold">Expected Progress</span>
                  <div className="text-2xl font-bold font-mono text-indigo-400 mt-1">{project.expectedProgress}%</div>
                  <div className="text-[10px] text-slate-500 mt-1">Calendar schedule elapsed</div>
                </div>
              </div>

              <div className="p-3 rounded-lg bg-slate-900 border border-slate-800">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-[11px] text-slate-400 uppercase font-semibold">Confidence Rating</span>
                  <span className="text-xs font-mono font-bold text-emerald-400">{project.confidenceScore}%</span>
                </div>
                <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden mb-2">
                  <div className="bg-emerald-500 h-full rounded-full" style={{ width: `${project.confidenceScore}%` }} />
                </div>
                <p className="text-[11px] text-slate-400 leading-tight">
                  Independent metric calculated from image clarity, observation frequency, and temporal consistency.
                </p>
              </div>

              {/* Guardrailed Decision Support */}
              <div className="space-y-2 pt-2 border-t border-slate-800">
                <span className="text-[11px] uppercase font-bold text-slate-400 tracking-wider">Recommended Audit Action</span>
                <ul className="space-y-1.5 text-xs text-slate-300 list-disc pl-4">
                  <li>Deploy physical inspection team to Chainage 6+000 to 14+200.</li>
                  <li>Request contractor daily earthwork logs and equipment manifests.</li>
                  <li>Hold milestone disbursement pending field verification.</li>
                </ul>
              </div>

            </div>
          )}

          {/* Tab 2: Spectral Indices */}
          {activeTab === "spectral" && (
            <div className="p-4 space-y-3">
              <span className="text-[11px] uppercase font-bold text-slate-400 tracking-wider">Corridor Multi-Spectral Data</span>
              
              <div className="space-y-2 text-xs">
                <div className="p-3 rounded bg-slate-900 border border-slate-800 flex justify-between items-center">
                  <div>
                    <div className="font-semibold text-slate-200">Vegetation Drop (NDVI)</div>
                    <div className="text-[11px] text-slate-500">Corridor clearing proxy</div>
                  </div>
                  <span className="text-sm font-mono font-bold text-emerald-400">0.40</span>
                </div>

                <div className="p-3 rounded bg-slate-900 border border-slate-800 flex justify-between items-center">
                  <div>
                    <div className="font-semibold text-slate-200">Soil Exposure Index (BSI)</div>
                    <div className="text-[11px] text-slate-500">Earthwork & cutting proxy</div>
                  </div>
                  <span className="text-sm font-mono font-bold text-amber-400">0.35</span>
                </div>

                <div className="p-3 rounded bg-slate-900 border border-slate-800 flex justify-between items-center">
                  <div>
                    <div className="font-semibold text-slate-200">Temporal Monotonicity</div>
                    <div className="text-[11px] text-slate-500">Pass-to-pass consistency</div>
                  </div>
                  <span className="text-sm font-mono font-bold text-sky-400">80%</span>
                </div>
              </div>
            </div>
          )}

        </aside>

      </div>
    </div>
  );
}
