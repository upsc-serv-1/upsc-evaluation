import React from 'react';
import { X, Award, CheckCircle2, AlertTriangle, Download, Printer } from 'lucide-react';
import { CopyScorecard } from '../types';

interface ScorecardModalProps {
  scorecard: CopyScorecard;
  isOpen: boolean;
  onClose: () => void;
  onExportPdf: () => void;
  isExportingPdf: boolean;
}

export const ScorecardModal: React.FC<ScorecardModalProps> = ({
  scorecard,
  isOpen,
  onClose,
  onExportPdf,
  isExportingPdf,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6 overflow-y-auto">
      <div className="bg-slate-900 border border-slate-700 rounded-2xl max-w-4xl w-full text-slate-100 shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
        
        {/* Modal Header */}
        <div className="p-4 sm:p-5 bg-slate-950 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-red-700/20 border border-red-500/40 flex items-center justify-center text-red-400 font-serif font-black text-xl">
              U
            </div>
            <div>
              <h3 className="font-serif font-bold text-base sm:text-lg text-slate-100">
                Evaluation Dossier & Assessment Sheet
              </h3>
              <p className="text-xs text-slate-400 font-serif">
                UPSC Mains Mentorship Program • Official Copy Evaluation Report
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={onExportPdf}
              disabled={isExportingPdf}
              className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-red-600 hover:bg-red-500 text-white text-xs font-semibold shadow-sm transition-all"
            >
              <Download className={`w-3.5 h-3.5 ${isExportingPdf ? 'animate-bounce' : ''}`} />
              <span>{isExportingPdf ? 'Generating PDF...' : 'Download Full PDF'}</span>
            </button>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-slate-200"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Modal Body (Scrollable Sheet) */}
        <div className="p-6 overflow-y-auto space-y-6 font-serif">
          
          {/* Candidate & Test Info Header Box */}
          <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <span className="text-[10px] text-slate-400 uppercase tracking-wider block font-sans">
                Candidate Name
              </span>
              <span className="font-bold text-base text-slate-100">
                {scorecard.candidateName}
              </span>
              <span className="text-xs text-slate-400 block font-sans">
                Roll No: LMP127-M
              </span>
            </div>

            <div>
              <span className="text-[10px] text-slate-400 uppercase tracking-wider block font-sans">
                Test Description
              </span>
              <span className="text-xs text-slate-200 block">
                {scorecard.testTitle}
              </span>
              <span className="text-[11px] text-slate-400 font-sans">
                Date: {scorecard.date}
              </span>
            </div>

            <div className="sm:text-right">
              <span className="text-[10px] text-slate-400 uppercase tracking-wider block font-sans">
                Total Score Awarded
              </span>
              <div className="flex items-baseline sm:justify-end space-x-1">
                <span className="font-mono font-black text-3xl text-red-400">
                  {scorecard.totalMarksAwarded}
                </span>
                <span className="text-slate-400 text-sm font-mono">
                  / {scorecard.totalMaxMarks}
                </span>
              </div>
              <span className="text-[11px] text-emerald-400 font-sans block">
                Percentile: ~68th Percentile (Above Average)
              </span>
            </div>
          </div>

          {/* Parameters Table (Like LevelUp IAS Page 2) */}
          <div className="border border-slate-800 rounded-xl overflow-hidden bg-slate-950/60 font-sans">
            <div className="px-4 py-2.5 bg-slate-800/60 border-b border-slate-800 font-serif font-bold text-xs text-slate-200 flex justify-between">
              <span>Evaluation Parameters Assessment</span>
              <span className="text-[10px] text-slate-400 font-sans">Benchmark Ratings</span>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left">
                <thead className="bg-slate-900 text-slate-400 border-b border-slate-800 text-[11px]">
                  <tr>
                    <th className="p-3">Parameters</th>
                    <th className="p-3 text-center">Excellent</th>
                    <th className="p-3 text-center">Good</th>
                    <th className="p-3 text-center">Average</th>
                    <th className="p-3 text-center">Below Average</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {[
                    { label: 'Attempts', val: scorecard?.parameters?.attempts || 'Good' },
                    { label: 'Content Quality', val: scorecard?.parameters?.contentQuality || 'Good' },
                    { label: 'Structure and Flow', val: scorecard?.parameters?.structureAndFlow || 'Good' },
                    { label: 'Presentation (Diagrams/Maps)', val: scorecard?.parameters?.presentation || 'Good' },
                    { label: 'Language & Terminology', val: scorecard?.parameters?.language || 'Good' },
                  ].map((row, idx) => (
                    <tr key={idx} className="hover:bg-slate-900/40">
                      <td className="p-3 font-medium text-slate-300">{row.label}</td>
                      {['Excellent', 'Good', 'Average', 'Below Average'].map((col) => (
                        <td key={col} className="p-3 text-center">
                          {row.val === col && (
                            <span className="inline-block px-2 py-0.5 rounded bg-red-950 text-red-400 font-bold border border-red-800/50">
                              ✓
                            </span>
                          )}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Question-Wise Score Breakdown Grid */}
          <div className="border border-slate-800 rounded-xl overflow-hidden bg-slate-950/60 font-sans">
            <div className="px-4 py-2.5 bg-slate-800/60 border-b border-slate-800 font-serif font-bold text-xs text-slate-200">
              Question-Wise Marks Breakdown
            </div>
            <div className="p-3 grid grid-cols-2 sm:grid-cols-5 gap-2 text-xs">
              {(scorecard?.questionWiseMarks || []).map((q) => (
                <div key={q.qNumber} className="p-2.5 rounded-lg bg-slate-900 border border-slate-800 flex flex-col justify-between">
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-bold text-slate-300">Question {q.qNumber}</span>
                    <span className="text-[10px] text-slate-500 font-mono">{q.maxMarks}M</span>
                  </div>
                  <div className="font-mono font-bold text-sm text-red-400">
                    {q.marksObtained} <span className="text-slate-500 text-xs">/ {q.maxMarks}</span>
                  </div>
                </div>
              ))}
              {(scorecard?.questionWiseMarks || []).length === 0 && (
                <div className="col-span-full p-3 text-center text-slate-500 italic text-xs">
                  No individual question marks recorded yet.
                </div>
              )}
            </div>
          </div>

          {/* Strengths & Areas for Improvement */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 font-sans text-xs">
            
            {/* Strengths */}
            <div className="p-4 rounded-xl bg-emerald-950/20 border border-emerald-800/40 space-y-3">
              <div className="flex items-center space-x-2 text-emerald-400 font-serif font-bold text-sm">
                <CheckCircle2 className="w-4 h-4" />
                <span>Strengths Noted by Mentor</span>
              </div>
              <ul className="space-y-2 text-slate-300 text-[11.5px]">
                {(scorecard?.overallStrengths || []).map((str, idx) => (
                  <li key={idx} className="flex items-start space-x-2">
                    <span className="text-emerald-500 font-bold">•</span>
                    <span>{str}</span>
                  </li>
                ))}
                {(scorecard?.overallStrengths || []).length === 0 && (
                  <li className="text-slate-500 italic">Strengths will be recorded upon evaluation.</li>
                )}
              </ul>
            </div>

            {/* Areas for Improvement */}
            <div className="p-4 rounded-xl bg-red-950/20 border border-red-800/40 space-y-3">
              <div className="flex items-center space-x-2 text-red-400 font-serif font-bold text-sm">
                <AlertTriangle className="w-4 h-4" />
                <span>Critical Areas for Improvement</span>
              </div>
              <ul className="space-y-2 text-slate-300 text-[11.5px]">
                {(scorecard?.overallImprovements || []).map((imp, idx) => (
                  <li key={idx} className="flex items-start space-x-2">
                    <span className="text-red-500 font-bold">•</span>
                    <span>{imp}</span>
                  </li>
                ))}
                {(scorecard?.overallImprovements || []).length === 0 && (
                  <li className="text-slate-500 italic">Improvement areas will be recorded upon evaluation.</li>
                )}
              </ul>
            </div>

          </div>

          {/* Evaluator's Overall Feedback */}
          <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
            <span className="font-serif font-bold text-sm text-red-400 flex items-center">
              <Award className="w-4 h-4 mr-2 text-amber-400" />
              Senior Mentor's Comprehensive Verdict:
            </span>
            <p className="text-slate-300 leading-relaxed font-serif italic text-xs sm:text-sm">
              "{scorecard.overallFeedback}"
            </p>
          </div>

        </div>

        {/* Modal Footer */}
        <div className="p-4 bg-slate-950 border-t border-slate-800 flex justify-end space-x-3">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs font-medium text-slate-300"
          >
            Close Dossier
          </button>
          <button
            onClick={onExportPdf}
            disabled={isExportingPdf}
            className="px-5 py-2 rounded-lg bg-red-600 hover:bg-red-500 text-xs font-semibold text-white shadow-md flex items-center space-x-2"
          >
            <Download className="w-4 h-4" />
            <span>Export Full Annotated PDF</span>
          </button>
        </div>

      </div>
    </div>
  );
};
