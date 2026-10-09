"use client";

import React from "react";
import { X, Printer, Download, ShieldCheck, FileText, CheckCircle2, AlertTriangle, Satellite, ExternalLink } from "lucide-react";
import { EvidenceReport, API_BASE } from "@/lib/api";

interface ReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  report: EvidenceReport | null;
}

export const ReportModal: React.FC<ReportModalProps> = ({ isOpen, onClose, report }) => {
  if (!isOpen || !report) return null;

  const pdfDownloadUrl = `${API_BASE}/api/projects/${report.project_id}/report/pdf`;

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in">
      <div className="bg-[#0b0f19] border border-slate-700 w-full max-w-3xl rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
        
        {/* Modal Toolbar */}
        <div className="flex items-center justify-between px-6 py-3.5 border-b border-slate-800 bg-[#080c16]">
          <div className="flex items-center gap-2">
            <FileText className="w-4 h-4 text-sky-400" />
            <span className="text-xs font-bold text-white uppercase tracking-wider">
              SkyAudit — Evidence Brief Export
            </span>
          </div>

          <div className="flex items-center gap-2">
            <a
              href={pdfDownloadUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-sky-600 hover:bg-sky-500 text-white text-xs font-semibold shadow-sm transition"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Download PDF Brief</span>
            </a>

            <button
              onClick={handlePrint}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold transition"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Print Preview</span>
            </button>

            <button onClick={onClose} className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition">
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Printable Report Document Body */}
        <div className="p-8 overflow-y-auto space-y-6 text-slate-200 bg-[#070a13]">
          
          {/* Header section */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-slate-800">
            <div>
              <div className="flex items-center gap-2">
                <Satellite className="w-5 h-5 text-sky-400" />
                <h1 className="text-xl font-extrabold text-white tracking-tight">SkyAudit Infrastructure Evidence Brief</h1>
              </div>
              <p className="text-xs text-slate-400 mt-1 font-mono">
                Project ID: <span className="text-slate-200">{report.project_id}</span> • Generated: {report.generated_at}
              </p>
            </div>

            <div className="flex flex-col items-start md:items-end">
              <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Assessment Status</span>
              <span className="px-3 py-1 rounded-md text-xs font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 mt-1">
                Consistent with Observed Evidence
              </span>
            </div>
          </div>

          {/* Project Title Banner */}
          <div className="bg-[#0e1424] border border-slate-800 rounded-xl p-4">
            <span className="text-[10px] font-bold text-sky-400 uppercase tracking-wider">Audited Infrastructure Asset</span>
            <h2 className="text-lg font-bold text-white mt-0.5">{report.project_name}</h2>
          </div>

          {/* Metrics Summary Grid */}
          <div className="grid grid-cols-4 gap-3">
            <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-3 text-center">
              <span className="text-[11px] text-slate-400 font-semibold block mb-1">Observable Progress</span>
              <span className="text-xl font-bold text-sky-400">{report.observable_progress_pct}%</span>
              <span className="text-[9px] text-slate-500 block mt-1">Multi-Spectral</span>
            </div>

            <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-3 text-center">
              <span className="text-[11px] text-slate-400 font-semibold block mb-1">Evidence Confidence</span>
              <span className="text-xl font-bold text-emerald-400">{report.confidence_score_pct}%</span>
              <span className="text-[9px] text-slate-500 block mt-1">High (10m L2A)</span>
            </div>

            <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-3 text-center">
              <span className="text-[11px] text-slate-400 font-semibold block mb-1">Schedule Consistency</span>
              <span className="text-xl font-bold text-emerald-400">HIGH</span>
              <span className="text-[9px] text-slate-500 block mt-1">T0 → T1 → T2</span>
            </div>

            <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-3 text-center">
              <span className="text-[11px] text-slate-400 font-semibold block mb-1">Discrepancy</span>
              <span className="text-sm font-bold text-emerald-400 mt-1 block">None</span>
              <span className="text-[9px] text-slate-500 block mt-1">Screening Clear</span>
            </div>
          </div>

          {/* Detailed Observations List */}
          <div className="space-y-2">
            <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider">Multi-Temporal Observation Sequence</h3>
            <div className="border border-slate-800 rounded-xl overflow-hidden">
              <table className="w-full text-left text-xs">
                <thead className="bg-[#0e1424] text-slate-400 font-semibold border-b border-slate-800">
                  <tr>
                    <th className="py-2.5 px-4">Observation Pass</th>
                    <th className="py-2.5 px-4">Acquisition Date</th>
                    <th className="py-2.5 px-4">Sensor</th>
                    <th className="py-2.5 px-4">Corridor Finding</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60 text-slate-300">
                  <tr>
                    <td className="py-2.5 px-4 font-semibold text-emerald-400">T0 — Baseline</td>
                    <td className="py-2.5 px-4 font-mono">2019-04-30</td>
                    <td className="py-2.5 px-4">Sentinel-2 L2A</td>
                    <td className="py-2.5 px-4 text-slate-400">Undisturbed natural terrain, greenfield Right-of-Way</td>
                  </tr>
                  <tr>
                    <td className="py-2.5 px-4 font-semibold text-amber-400">T1 — Construction</td>
                    <td className="py-2.5 px-4 font-mono">2021-03-20</td>
                    <td className="py-2.5 px-4">Sentinel-2 L2A</td>
                    <td className="py-2.5 px-4 text-slate-400">Substantial ground disturbance, earthworks & embankment grading</td>
                  </tr>
                  <tr>
                    <td className="py-2.5 px-4 font-semibold text-sky-400">T2 — Post-Stage</td>
                    <td className="py-2.5 px-4 font-mono">2023-03-10</td>
                    <td className="py-2.5 px-4">Sentinel-2 L2A</td>
                    <td className="py-2.5 px-4 text-slate-400">Strong continuous surface-change signal along observed corridor</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          {/* Mathematical Derivation */}
          <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 space-y-2">
            <h4 className="text-xs font-bold text-slate-200 uppercase tracking-wider">Score Component Derivation</h4>
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 text-xs font-mono">
              <div className="p-2 rounded bg-slate-950/80 border border-slate-800">
                <span className="text-[10px] text-slate-400 block font-sans">Veg Clear</span>
                <span className="text-sky-400 font-bold">+5.2%</span>
              </div>
              <div className="p-2 rounded bg-slate-950/80 border border-slate-800">
                <span className="text-[10px] text-slate-400 block font-sans">Surface Dist.</span>
                <span className="text-sky-400 font-bold">+10.0%</span>
              </div>
              <div className="p-2 rounded bg-slate-950/80 border border-slate-800">
                <span className="text-[10px] text-slate-400 block font-sans">Continuity</span>
                <span className="text-sky-400 font-bold">+8.0%</span>
              </div>
              <div className="p-2 rounded bg-slate-950/80 border border-slate-800">
                <span className="text-[10px] text-slate-400 block font-sans">Built Signal</span>
                <span className="text-sky-400 font-bold">+7.5%</span>
              </div>
              <div className="p-2 rounded bg-slate-950/80 border border-slate-800">
                <span className="text-[10px] text-slate-400 block font-sans">Temporal</span>
                <span className="text-sky-400 font-bold">+10.8%</span>
              </div>
            </div>
          </div>

          {/* Regulatory & Evidentiary Disclaimer */}
          <div className="bg-slate-900/40 border border-slate-800/80 rounded-xl p-3.5 text-[11px] text-slate-400 leading-normal flex items-start gap-2.5">
            <ShieldCheck className="w-4 h-4 text-sky-400 shrink-0 mt-0.5" />
            <p>
              <strong>Notice:</strong> Satellite observations indicate observable multispectral surface change and do not independently establish legal contractual completion or fraud.
            </p>
          </div>

        </div>

        {/* Modal Footer */}
        <div className="px-6 py-3 border-t border-slate-800 bg-[#080c16] flex items-center justify-between text-xs text-slate-400">
          <span>Ready for audit packaging</span>
          <a
            href={pdfDownloadUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1 text-sky-400 hover:text-sky-300 font-semibold underline underline-offset-4"
          >
            <span>Direct PDF Link</span>
            <ExternalLink className="w-3 h-3" />
          </a>
        </div>

      </div>
    </div>
  );
};
