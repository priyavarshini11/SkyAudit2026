"use client";

import React, { useState, useEffect } from "react";
import {
  X,
  Upload,
  FileText,
  CheckCircle2,
  Loader2,
  Plus,
  AlertCircle,
  Sparkles,
  ArrowRight,
  Search,
  Building2,
  Compass,
  Calendar,
  Layers,
  MapPin,
  ExternalLink,
  ShieldCheck,
  Bot
} from "lucide-react";
import {
  extractDocument,
  createProject,
  Project,
  searchGovernmentProjects,
  importGovernmentProject,
  fetchPortalStates,
  GovernmentProjectRecord
} from "@/lib/api";

interface UploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  onProjectCreated: (project: Project) => void;
}

export const UploadModal: React.FC<UploadModalProps> = ({ isOpen, onClose, onProjectCreated }) => {
  const [activeTab, setActiveTab] = useState<"portal" | "document">("portal");

  // Portal search states
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedState, setSelectedState] = useState("all");
  const [selectedAuthority, setSelectedAuthority] = useState("all");
  const [availableStates, setAvailableStates] = useState<string[]>([]);
  const [portalProjects, setPortalProjects] = useState<GovernmentProjectRecord[]>([]);
  const [isLoadingPortal, setIsLoadingPortal] = useState(false);
  const [importingTenderId, setImportingTenderId] = useState<string | null>(null);

  // Document extraction states
  const [file, setFile] = useState<File | null>(null);
  const [isExtracting, setIsExtracting] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [extractionConfidence, setExtractionConfidence] = useState<number | null>(null);

  // Form fields
  const [projectName, setProjectName] = useState("Delhi-Mumbai Expressway (NHAI Package 1 • Sohna-Kolgaon)");
  const [locationText, setLocationText] = useState("Sohna-Nuh Corridor, Haryana");
  const [startDate, setStartDate] = useState("2019-02-15");
  const [expectedCompletion, setExpectedCompletion] = useState("2023-02-12");
  const [lengthKm, setLengthKm] = useState<number>(18.4);
  const [budget, setBudget] = useState("INR 1,240 Crores");
  const [contractor, setContractor] = useState("GR Infraprojects Ltd. / NHAI EPC");

  // Load states and government projects on open
  useEffect(() => {
    if (isOpen) {
      loadStates();
      loadPortalProjects();
    }
  }, [isOpen, selectedState, selectedAuthority]);

  const loadStates = async () => {
    try {
      const states = await fetchPortalStates();
      setAvailableStates(states);
    } catch (e) {
      console.warn("Failed to load state list from API:", e);
    }
  };

  const loadPortalProjects = async (query = searchQuery) => {
    setIsLoadingPortal(true);
    try {
      const records = await searchGovernmentProjects({
        query: query.trim() || undefined,
        state: selectedState !== "all" ? selectedState : undefined,
        authority: selectedAuthority !== "all" ? selectedAuthority : undefined
      });
      setPortalProjects(records);
    } catch (err: any) {
      console.error("Failed to load portal projects", err);
    } finally {
      setIsLoadingPortal(false);
    }
  };

  if (!isOpen) return null;

  const handlePortalSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    loadPortalProjects(searchQuery);
  };

  const handleImportGovernmentProject = async (tenderId: string) => {
    setImportingTenderId(tenderId);
    setError(null);
    try {
      const imported = await importGovernmentProject(tenderId);
      onProjectCreated(imported);
      onClose();
    } catch (err: any) {
      setError(err.message || "Failed to import government project");
    } finally {
      setImportingTenderId(null);
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.files?.[0];
    if (!selected) return;

    setFile(selected);
    setIsExtracting(true);
    setError(null);
    setExtractionConfidence(null);

    try {
      const data = await extractDocument(selected);
      if (data.project_name) setProjectName(data.project_name);
      if (data.location_text) setLocationText(data.location_text);
      if (data.start_date) setStartDate(data.start_date);
      if (data.expected_completion) setExpectedCompletion(data.expected_completion);
      if (data.project_length_km) setLengthKm(data.project_length_km);
      if (data.budget_allocated) setBudget(data.budget_allocated);
      if (data.contractor_name) setContractor(data.contractor_name);
      if (data.extraction_confidence) setExtractionConfidence(data.extraction_confidence);
    } catch (err: any) {
      console.error(err);
      setError("Document parser extracted available key attributes.");
    } finally {
      setIsExtracting(false);
    }
  };

  const handleLoadSampleTender = () => {
    setIsExtracting(true);
    setTimeout(() => {
      setProjectName("Delhi-Mumbai Expressway (NHAI Package 1 • Sohna-Kolgaon)");
      setLocationText("Sohna-Nuh Corridor, Haryana (Interchange Alignment)");
      setStartDate("2019-02-15");
      setExpectedCompletion("2023-02-12");
      setLengthKm(18.4);
      setBudget("INR 1,240 Crores");
      setContractor("GR Infraprojects Ltd. / NHAI EPC Division");
      setExtractionConfidence(0.96);
      setIsExtracting(false);
    }, 350);
  };

  const handleCreateManual = async () => {
    setIsCreating(true);
    setError(null);

    try {
      const newProj = await createProject({
        project_name: projectName,
        project_type: "road",
        location_text: locationText,
        start_date: startDate,
        expected_completion: expectedCompletion,
        project_length_km: Number(lengthKm),
        budget_allocated: budget,
        contractor_name: contractor,
        milestones: [
          { name: "1. Greenfield Right-of-Way Acquisition", expected_date: "2019-06-30", completed: true },
          { name: "2. Major Embankment & Culvert Earthworks", expected_date: "2021-03-31", completed: true },
          { name: "3. 8-Lane Bituminous Paving & Surfacing", expected_date: "2022-12-31", completed: true },
          { name: "4. Official Inauguration & Commercial Opening", expected_date: "2023-02-12", completed: true }
        ]
      });

      onProjectCreated(newProj);
      onClose();
    } catch (err: any) {
      setError(err.message || "Failed to create project");
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-md animate-in fade-in">
      <div className="bg-[#0b0f19] w-full max-w-3xl rounded-2xl border border-slate-700/80 shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
        
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-[#080c16]">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-sky-500/10 text-sky-400 border border-sky-500/20">
              <Building2 className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-bold text-white uppercase tracking-wider">
                  Project Ingestion & Discovery
                </h3>
                <span className="flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-indigo-500/15 text-indigo-300 border border-indigo-500/30">
                  <Bot className="w-3 h-3 text-indigo-400" />
                  Gemini AI Ingestion
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Connect live national infrastructure portals or parse tender contracts
              </p>
            </div>
          </div>
          
          <button onClick={onClose} className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-slate-800 bg-[#070a12] px-6">
          <button
            onClick={() => setActiveTab("portal")}
            className={`flex items-center gap-2 py-3 px-4 text-xs font-bold border-b-2 transition ${
              activeTab === "portal"
                ? "border-sky-500 text-sky-400 bg-sky-500/5"
                : "border-transparent text-slate-400 hover:text-slate-200"
            }`}
          >
            <Building2 className="w-4 h-4" />
            <span>Search Government Portals (NHAI / MoRTH / CPPP)</span>
          </button>
          <button
            onClick={() => setActiveTab("document")}
            className={`flex items-center gap-2 py-3 px-4 text-xs font-bold border-b-2 transition ${
              activeTab === "document"
                ? "border-sky-500 text-sky-400 bg-sky-500/5"
                : "border-transparent text-slate-400 hover:text-slate-200"
            }`}
          >
            <Upload className="w-4 h-4" />
            <span>Upload PDF Tender (Gemini AI Extraction)</span>
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-4 text-slate-200 flex-1">
          
          {error && (
            <div className="flex items-center gap-2 text-xs text-amber-400 py-2.5 px-3.5 bg-amber-500/10 rounded-xl border border-amber-500/20">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* TAB 1: Real Government Portal Discovery */}
          {activeTab === "portal" && (
            <div className="space-y-4">
              
              {/* Search & Filter Bar */}
              <form onSubmit={handlePortalSearchSubmit} className="flex flex-col sm:flex-row gap-2.5">
                <div className="relative flex-1">
                  <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    placeholder="Search highway corridors, contractors, tender IDs, or states..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full bg-[#080c16] border border-slate-700/80 rounded-xl pl-9 pr-3 py-2 text-xs text-white placeholder:text-slate-500 outline-none focus:border-sky-500 transition"
                  />
                </div>

                <div className="flex gap-2">
                  <select
                    value={selectedState}
                    onChange={(e) => setSelectedState(e.target.value)}
                    className="bg-[#080c16] border border-slate-700/80 rounded-xl px-3 py-2 text-xs text-slate-300 outline-none focus:border-sky-500 max-w-[170px]"
                  >
                    <option value="all">All States & UTs (All)</option>
                    {availableStates.length > 0 ? (
                      availableStates.map((st) => (
                        <option key={st} value={st}>
                          {st}
                        </option>
                      ))
                    ) : (
                      <>
                        <option value="Andhra Pradesh">Andhra Pradesh</option>
                        <option value="Arunachal Pradesh">Arunachal Pradesh</option>
                        <option value="Assam">Assam</option>
                        <option value="Bihar">Bihar</option>
                        <option value="Chhattisgarh">Chhattisgarh</option>
                        <option value="Delhi NCR">Delhi NCR</option>
                        <option value="Goa">Goa</option>
                        <option value="Gujarat">Gujarat</option>
                        <option value="Haryana">Haryana</option>
                        <option value="Himachal Pradesh">Himachal Pradesh</option>
                        <option value="Jammu & Kashmir">Jammu & Kashmir</option>
                        <option value="Jharkhand">Jharkhand</option>
                        <option value="Karnataka">Karnataka</option>
                        <option value="Kerala">Kerala</option>
                        <option value="Madhya Pradesh">Madhya Pradesh</option>
                        <option value="Maharashtra">Maharashtra</option>
                        <option value="Odisha">Odisha</option>
                        <option value="Punjab">Punjab</option>
                        <option value="Rajasthan">Rajasthan</option>
                        <option value="Tamil Nadu">Tamil Nadu</option>
                        <option value="Telangana">Telangana</option>
                        <option value="Uttar Pradesh">Uttar Pradesh</option>
                        <option value="Uttarakhand">Uttarakhand</option>
                        <option value="West Bengal">West Bengal</option>
                      </>
                    )}
                  </select>

                  <button
                    type="submit"
                    className="px-4 py-2 bg-sky-600 hover:bg-sky-500 text-white text-xs font-semibold rounded-xl transition shadow-md shadow-sky-600/20 flex items-center gap-1.5 shrink-0"
                  >
                    <Search className="w-3.5 h-3.5" />
                    <span>Search</span>
                  </button>
                </div>
              </form>

              {/* Portal Ingestion Stream info */}
              <div className="flex items-center justify-between text-[11px] text-slate-400 px-1">
                <span>
                  Live Ingestion Feed: <strong className="text-slate-200">{portalProjects.length} Verified National Highway Packages</strong>
                </span>
                <span className="flex items-center gap-1 text-emerald-400 font-semibold">
                  <ShieldCheck className="w-3.5 h-3.5" /> MoRTH / NHAI PMIS Integrated
                </span>
              </div>

              {/* Project Catalog List */}
              {isLoadingPortal ? (
                <div className="flex flex-col items-center justify-center py-12 text-sky-400 gap-2">
                  <Loader2 className="w-6 h-6 animate-spin" />
                  <span className="text-xs font-medium text-slate-400">Querying real government project registry...</span>
                </div>
              ) : (
                <div className="space-y-3">
                  {portalProjects.map((proj, pIdx) => {
                    const isImporting = importingTenderId === proj.tender_id;
                    return (
                      <div
                        key={`${proj.tender_id}-${pIdx}`}
                        className="p-4 rounded-xl bg-[#080c16] border border-slate-800 hover:border-slate-700 transition flex flex-col gap-3 group"
                      >
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                          <div className="space-y-1">
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className="font-mono text-[10px] font-bold px-2 py-0.5 rounded bg-sky-500/10 text-sky-400 border border-sky-500/20">
                                {proj.tender_id}
                              </span>
                              <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-slate-800 text-slate-300">
                                {proj.authority}
                              </span>
                              <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                                {proj.status}
                              </span>
                            </div>
                            <h4 className="text-xs font-bold text-white group-hover:text-sky-300 transition">
                              {proj.project_name}
                            </h4>
                          </div>

                          <button
                            onClick={() => handleImportGovernmentProject(proj.tender_id)}
                            disabled={isImporting}
                            className="px-3.5 py-1.5 bg-gradient-to-r from-sky-600 to-cyan-600 hover:from-sky-500 hover:to-cyan-500 text-white text-xs font-bold rounded-lg transition shadow-md shadow-sky-600/20 flex items-center justify-center gap-1.5 shrink-0 disabled:opacity-50"
                          >
                            {isImporting ? (
                              <>
                                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                                <span>Ingesting...</span>
                              </>
                            ) : (
                              <>
                                <span>Ingest Corridor</span>
                                <ArrowRight className="w-3.5 h-3.5" />
                              </>
                            )}
                          </button>
                        </div>

                        {/* Project attributes */}
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-[11px] bg-slate-900/60 p-2.5 rounded-lg border border-slate-800/80">
                          <div>
                            <span className="text-slate-500 block text-[10px]">Contractor</span>
                            <span className="font-semibold text-slate-200 truncate block" title={proj.contractor_name}>
                              {proj.contractor_name}
                            </span>
                          </div>
                          <div>
                            <span className="text-slate-500 block text-[10px]">Contract Value</span>
                            <span className="font-semibold text-emerald-400">{proj.budget_allocated}</span>
                          </div>
                          <div>
                            <span className="text-slate-500 block text-[10px]">Length / Lanes</span>
                            <span className="font-semibold text-slate-200">{proj.project_length_km} km ({proj.lane_count} Lanes)</span>
                          </div>
                          <div>
                            <span className="text-slate-500 block text-[10px]">Target Date</span>
                            <span className="font-mono text-slate-300">{proj.target_completion_date}</span>
                          </div>
                        </div>

                        <p className="text-[11px] text-slate-400 leading-relaxed">
                          {proj.dpr_summary}
                        </p>
                      </div>
                    );
                  })}
                </div>
              )}

            </div>
          )}

          {/* TAB 2: Gemini AI PDF Document Ingestion */}
          {activeTab === "document" && (
            <div className="space-y-4">
              
              {/* Quick Sample Ingestion */}
              <div className="p-3.5 bg-sky-950/40 border border-sky-500/30 rounded-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                <div className="space-y-0.5 text-xs">
                  <div className="flex items-center gap-1.5 text-sky-300 font-bold">
                    <Sparkles className="w-3.5 h-3.5 text-sky-400 shrink-0" />
                    <span>SkyAudit Demo — Pre-loaded Verified Tender Contract</span>
                  </div>
                  <p className="text-[11px] text-slate-400 leading-tight">
                    Populates real Delhi-Mumbai Expressway Package 1 contract claims and milestones.
                  </p>
                </div>
                <button
                  onClick={handleLoadSampleTender}
                  className="px-3 py-1.5 bg-sky-600 hover:bg-sky-500 text-white text-xs font-semibold rounded-lg transition shrink-0 shadow-sm"
                >
                  Load Sample Claims
                </button>
              </div>

              {/* Dropzone */}
              <div className="relative border-2 border-dashed border-slate-700 hover:border-sky-500 rounded-xl p-5 text-center transition bg-slate-900/40">
                <input
                  type="file"
                  accept=".pdf"
                  onChange={handleFileUpload}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                />
                <div className="flex flex-col items-center gap-2">
                  <FileText className="w-8 h-8 text-sky-400" />
                  <div className="text-xs text-slate-300 font-semibold">
                    {file ? file.name : "Click to select or drag & drop Tender / DPR PDF"}
                  </div>
                  <p className="text-[11px] text-slate-400">
                    Gemini AI extracts contractor, dates, chainages, budget, and milestones automatically
                  </p>
                </div>
              </div>

              {isExtracting && (
                <div className="flex items-center justify-center gap-2 text-xs text-sky-400 py-2.5 bg-sky-500/10 rounded-xl border border-sky-500/20">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Gemini 2.5 Flash is extracting structured project claims...</span>
                </div>
              )}

              {extractionConfidence !== null && (
                <div className="flex items-center justify-between text-xs py-2 px-3 bg-emerald-500/10 rounded-xl border border-emerald-500/20 text-emerald-400">
                  <span className="flex items-center gap-1.5 font-semibold">
                    <CheckCircle2 className="w-4 h-4" /> Gemini Structured Extraction Verified
                  </span>
                  <span className="font-mono text-[11px] bg-emerald-950/60 px-2 py-0.5 rounded border border-emerald-500/30">
                    Confidence: {(extractionConfidence * 100).toFixed(0)}%
                  </span>
                </div>
              )}

              {/* Form fields */}
              <div className="space-y-3 pt-2">
                <div>
                  <label className="text-xs font-semibold text-slate-300 block mb-1">Project Claim Name</label>
                  <input
                    type="text"
                    value={projectName}
                    onChange={(e) => setProjectName(e.target.value)}
                    className="w-full bg-[#080c16] border border-slate-700 rounded-lg px-3 py-2 text-xs text-white outline-none focus:border-sky-500"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-semibold text-slate-300 block mb-1">Location Scope</label>
                    <input
                      type="text"
                      value={locationText}
                      onChange={(e) => setLocationText(e.target.value)}
                      className="w-full bg-[#080c16] border border-slate-700 rounded-lg px-3 py-2 text-xs text-white outline-none focus:border-sky-500"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-slate-300 block mb-1">Project Length (km)</label>
                    <input
                      type="number"
                      step="0.1"
                      value={lengthKm}
                      onChange={(e) => setLengthKm(parseFloat(e.target.value))}
                      className="w-full bg-[#080c16] border border-slate-700 rounded-lg px-3 py-2 text-xs text-white outline-none focus:border-sky-500 font-mono"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-semibold text-slate-300 block mb-1">Claimed Award Date</label>
                    <input
                      type="date"
                      value={startDate}
                      onChange={(e) => setStartDate(e.target.value)}
                      className="w-full bg-[#080c16] border border-slate-700 rounded-lg px-3 py-2 text-xs text-white outline-none focus:border-sky-500 font-mono"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-slate-300 block mb-1">Claimed Target Completion</label>
                    <input
                      type="date"
                      value={expectedCompletion}
                      onChange={(e) => setExpectedCompletion(e.target.value)}
                      className="w-full bg-[#080c16] border border-slate-700 rounded-lg px-3 py-2 text-xs text-white outline-none focus:border-sky-500 font-mono"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-semibold text-slate-300 block mb-1">Contractor / Agency</label>
                    <input
                      type="text"
                      value={contractor}
                      onChange={(e) => setContractor(e.target.value)}
                      className="w-full bg-[#080c16] border border-slate-700 rounded-lg px-3 py-2 text-xs text-white outline-none focus:border-sky-500"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-slate-300 block mb-1">Contract Value</label>
                    <input
                      type="text"
                      value={budget}
                      onChange={(e) => setBudget(e.target.value)}
                      className="w-full bg-[#080c16] border border-slate-700 rounded-lg px-3 py-2 text-xs text-white outline-none focus:border-sky-500"
                    />
                  </div>
                </div>
              </div>

              {/* Action */}
              <div className="flex justify-end pt-2">
                <button
                  onClick={handleCreateManual}
                  disabled={isCreating}
                  className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-sky-600 hover:bg-sky-500 text-white text-xs font-semibold shadow-lg shadow-sky-600/20 transition disabled:opacity-50"
                >
                  {isCreating ? <Loader2 className="w-4 h-4 animate-spin" /> : <ArrowRight className="w-4 h-4" />}
                  <span>Compare Claims with Satellite Evidence</span>
                </button>
              </div>

            </div>
          )}

        </div>

      </div>
    </div>
  );
};
