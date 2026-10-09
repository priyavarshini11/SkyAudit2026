"use client";

import React from "react";
import { Clock, Calendar, CheckCircle2, CircleDashed, AlertCircle, ArrowRight } from "lucide-react";
import { EvidenceTimelineItem, Milestone } from "@/lib/api";

interface TimelineViewProps {
  timeline: EvidenceTimelineItem[];
  milestones: Milestone[];
}

export const TimelineView: React.FC<TimelineViewProps> = ({ timeline, milestones }) => {
  return (
    <div className="glass-panel rounded-2xl overflow-hidden border border-slate-800 shadow-xl flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between px-5 py-3.5 border-b border-slate-800/80 bg-slate-900/60">
        <div className="flex items-center gap-2.5">
          <div className="p-1.5 rounded-lg bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
            <Clock className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-xs font-bold text-white uppercase tracking-wider">
              Evidence Timeline & Schedule Tracking
            </h3>
            <p className="text-[11px] text-slate-400">Sequential verification of contractual commitments vs observable events</p>
          </div>
        </div>
      </div>

      <div className="p-5 grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Column: Satellite Evidence Chronology (7 cols) */}
        <div className="lg:col-span-7 space-y-4">
          <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-2">
            <span>Satellite Observation Chain</span>
            <span className="text-[10px] font-normal px-2 py-0.5 rounded bg-slate-800 text-slate-400">Time Series</span>
          </h4>

          <div className="relative pl-6 space-y-6 before:absolute before:left-2 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-800">
            {timeline.map((item, idx) => {
              return (
                <div key={idx} className="relative group">
                  {/* Dot */}
                  <div className={`absolute -left-6 top-1.5 w-4 h-4 rounded-full border-2 border-[#090d16] flex items-center justify-center ${
                    idx === 0 ? "bg-sky-400" :
                    idx === 1 ? "bg-emerald-400" :
                    idx === 2 ? "bg-amber-400" :
                    "bg-rose-400"
                  }`} />

                  {/* Card */}
                  <div className="bg-slate-900/60 border border-slate-800/80 rounded-xl p-3.5 hover:border-slate-700 transition">
                    <div className="flex items-center justify-between gap-2 mb-1">
                      <span className="font-bold text-xs text-white tracking-tight">{item.title}</span>
                      <span className="text-[11px] font-mono text-slate-400 bg-slate-800/80 px-2 py-0.5 rounded">
                        {item.date}
                      </span>
                    </div>

                    <p className="text-xs text-slate-300 mb-2 leading-relaxed">
                      {item.description}
                    </p>

                    {item.key_findings && item.key_findings.length > 0 && (
                      <div className="flex flex-wrap gap-1.5 mt-2">
                        {item.key_findings.map((f, fIdx) => (
                          <span key={fIdx} className="text-[10px] bg-slate-800/90 text-slate-300 px-2 py-0.5 rounded border border-slate-700/60">
                            • {f}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Column: Milestone Verification Checklist (5 cols) */}
        <div className="lg:col-span-5 space-y-4">
          <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-2">
            <span>Contractual Milestones</span>
            <span className="text-[10px] font-normal px-2 py-0.5 rounded bg-slate-800 text-slate-400">Tender Scope</span>
          </h4>

          <div className="space-y-2.5">
            {milestones.map((m, mIdx) => {
              return (
                <div key={mIdx} className="bg-slate-900/60 border border-slate-800/80 rounded-xl p-3 flex items-start gap-3">
                  <div className="mt-0.5">
                    {m.completed ? (
                      <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                    ) : (
                      <CircleDashed className="w-4 h-4 text-slate-500" />
                    )}
                  </div>

                  <div className="flex-1">
                    <div className="flex items-center justify-between gap-2">
                      <span className={`text-xs font-semibold ${m.completed ? 'text-slate-200' : 'text-slate-400'}`}>
                        {m.name}
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-[11px] text-slate-400 mt-1">
                      <span>Target: {m.expected_date}</span>
                      <span className={`font-medium ${m.completed ? 'text-emerald-400' : 'text-amber-400'}`}>
                        {m.completed ? 'Observable Evidence Found' : 'Pending Verification'}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

      </div>
    </div>
  );
};
