import React, { useState } from 'react';
import { 
  CheckCircle2, 
  AlertTriangle, 
  XCircle, 
  BookOpen, 
  Sparkles, 
  Award, 
  Sliders, 
  ArrowRight, 
  FileText,
  HelpCircle,
  RotateCcw,
  Check,
  Minus,
  Play,
  RefreshCw,
  Clock
} from 'lucide-react';
import { 
  QuestionBreakdown, 
  QuestionEvaluation, 
  CopyScorecard, 
  EvaluatorPromptSettings,
  AnnotationItem,
  MultiPassStepStatus
} from '../types';

interface TeacherDossierProps {
  currentQuestion?: QuestionBreakdown;
  evaluation?: QuestionEvaluation;
  scorecard: CopyScorecard;
  promptSettings: EvaluatorPromptSettings;
  onUpdatePromptSettings: (settings: EvaluatorPromptSettings) => void;
  onRunMultiPass: () => void;
  isEvaluating: boolean;
  activePassStep: number;
  passStatuses?: MultiPassStepStatus[];
  onRunPass1?: () => void;
  onRunPass2?: () => void;
  onRunPass3?: () => void;
  onRunPass4?: () => void;
  agentAudit?: {
    agentDialogue?: { agent: string; message: string }[];
    issuesFound?: boolean;
    revisionsRecommended?: string[];
    consensusStatus?: string;
  };
}

export const TeacherDossier: React.FC<TeacherDossierProps> = ({
  currentQuestion,
  evaluation,
  scorecard,
  promptSettings,
  onUpdatePromptSettings,
  onRunMultiPass,
  isEvaluating,
  activePassStep,
  passStatuses = [],
  onRunPass1,
  onRunPass2,
  onRunPass3,
  onRunPass4,
  agentAudit,
}) => {
  const [activeTab, setActiveTab] = useState<'matrix' | 'multipass' | 'modelAnswer' | 'prompts'>('matrix');

  return (
    <div className="flex flex-col h-full bg-slate-900 border-l border-slate-800 text-slate-100">
      
      {/* Tab Navigation */}
      <div className="flex border-b border-slate-800 bg-slate-950/80 px-2 pt-2 space-x-1 text-xs font-medium">
        <button
          onClick={() => setActiveTab('matrix')}
          className={`px-3 py-2 rounded-t-lg transition-colors flex items-center space-x-1.5 ${
            activeTab === 'matrix'
              ? 'bg-slate-900 text-red-400 border-t-2 border-red-500 font-semibold'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/40'
          }`}
        >
          <Award className="w-3.5 h-3.5" />
          <span>Matrix & Scorecard</span>
        </button>

        <button
          onClick={() => setActiveTab('multipass')}
          className={`px-3 py-2 rounded-t-lg transition-colors flex items-center space-x-1.5 ${
            activeTab === 'multipass'
              ? 'bg-slate-900 text-red-400 border-t-2 border-red-500 font-semibold'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/40'
          }`}
        >
          <Sparkles className="w-3.5 h-3.5 text-amber-400" />
          <span>4-Pass AI Audit</span>
          {isEvaluating && (
            <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-ping ml-1" />
          )}
        </button>

        <button
          onClick={() => setActiveTab('modelAnswer')}
          className={`px-3 py-2 rounded-t-lg transition-colors flex items-center space-x-1.5 ${
            activeTab === 'modelAnswer'
              ? 'bg-slate-900 text-red-400 border-t-2 border-red-500 font-semibold'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/40'
          }`}
        >
          <BookOpen className="w-3.5 h-3.5" />
          <span>Model Answer</span>
        </button>

        <button
          onClick={() => setActiveTab('prompts')}
          className={`px-3 py-2 rounded-t-lg transition-colors flex items-center space-x-1.5 ${
            activeTab === 'prompts'
              ? 'bg-slate-900 text-red-400 border-t-2 border-red-500 font-semibold'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/40'
          }`}
        >
          <Sliders className="w-3.5 h-3.5" />
          <span>Prompt Rules</span>
        </button>
      </div>

      {/* Tab Content */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        
        {/* TAB 1: LEVELUP IAS STYLE SCORECARD & MATRIX */}
        {activeTab === 'matrix' && (
          <div className="space-y-4 text-xs">
            
            {/* Scorecard Hero Banner */}
            <div className="p-3.5 rounded-xl bg-gradient-to-r from-red-950/40 to-slate-900 border border-red-800/40 flex items-center justify-between">
              <div>
                <span className="text-[10px] uppercase tracking-wider text-slate-400 font-mono">
                  LevelUp Mentorship Program (LMP)
                </span>
                <h4 className="font-serif font-bold text-sm text-slate-100 mt-0.5">
                  {scorecard.candidateName} • GS Physical Geography Test
                </h4>
                <p className="text-[11px] text-slate-400">
                  Attempted: 10/10 Questions • Offline Mode
                </p>
              </div>

              <div className="text-right">
                <span className="text-[10px] text-slate-400 block">Total Marks:</span>
                <span className="font-mono font-black text-2xl text-red-400">
                  {scorecard.totalMarksAwarded}
                </span>
                <span className="text-slate-400 text-xs font-mono"> / {scorecard.totalMaxMarks}</span>
              </div>
            </div>

            {/* Evaluation Parameters Matrix (LevelUp IAS style) */}
            <div className="border border-slate-800 rounded-xl overflow-hidden bg-slate-950/60">
              <div className="px-3 py-2 bg-slate-800/60 border-b border-slate-800 flex justify-between items-center">
                <span className="font-serif font-bold text-xs text-slate-200">
                  Evaluation Parameters Assessment
                </span>
                <span className="text-[10px] text-slate-400">Criterion Check</span>
              </div>

              <div className="divide-y divide-slate-800/60">
                {[
                  { param: 'Attempts', val: scorecard?.parameters?.attempts || 'Good' },
                  { param: 'Content Quality', val: scorecard?.parameters?.contentQuality || 'Good' },
                  { param: 'Structure and Flow', val: scorecard?.parameters?.structureAndFlow || 'Good' },
                  { param: 'Presentation (Maps/Diagrams)', val: scorecard?.parameters?.presentation || 'Good' },
                  { param: 'Language & Terminology', val: scorecard?.parameters?.language || 'Good' },
                ].map((item, idx) => (
                  <div key={idx} className="px-3 py-2 flex items-center justify-between">
                    <span className="text-slate-300">{item.param}</span>
                    <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-medium ${
                      item.val === 'Excellent' ? 'bg-emerald-950 text-emerald-300 border border-emerald-800/50' :
                      item.val === 'Good' ? 'bg-blue-950 text-blue-300 border border-blue-800/50' :
                      'bg-amber-950 text-amber-300 border border-amber-800/50'
                    }`}>
                      ✓ {item.val}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Strengths & Areas for Improvement */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              
              {/* Strengths */}
              <div className="p-3 rounded-xl bg-emerald-950/20 border border-emerald-800/30 space-y-2">
                <div className="flex items-center space-x-1.5 text-emerald-400 font-serif font-bold text-xs">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>Key Strengths Observed</span>
                </div>
                <ul className="space-y-1.5 text-[11px] text-slate-300">
                  {(scorecard?.overallStrengths || []).map((str, idx) => (
                    <li key={idx} className="flex items-start space-x-1">
                      <span className="text-emerald-500 font-bold">•</span>
                      <span>{str}</span>
                    </li>
                  ))}
                  {(scorecard?.overallStrengths || []).length === 0 && (
                    <li className="text-slate-500 italic text-[10.5px]">Evaluation in progress...</li>
                  )}
                </ul>
              </div>

              {/* Areas for Improvement */}
              <div className="p-3 rounded-xl bg-red-950/20 border border-red-800/30 space-y-2">
                <div className="flex items-center space-x-1.5 text-red-400 font-serif font-bold text-xs">
                  <AlertTriangle className="w-3.5 h-3.5" />
                  <span>Areas for Improvement</span>
                </div>
                <ul className="space-y-1.5 text-[11px] text-slate-300">
                  {(scorecard?.overallImprovements || []).map((imp, idx) => (
                    <li key={idx} className="flex items-start space-x-1">
                      <span className="text-red-500 font-bold">•</span>
                      <span>{imp}</span>
                    </li>
                  ))}
                  {(scorecard?.overallImprovements || []).length === 0 && (
                    <li className="text-slate-500 italic text-[10.5px]">Evaluation in progress...</li>
                  )}
                </ul>
              </div>

            </div>

            {/* Senior Evaluator Overall Advice */}
            <div className="p-3.5 rounded-xl bg-slate-800/50 border border-slate-700/60 space-y-1.5">
              <span className="font-serif font-bold text-xs text-red-400 flex items-center">
                <Award className="w-3.5 h-3.5 mr-1 text-amber-400" />
                Senior Evaluator's Overall Feedback:
              </span>
              <p className="text-xs text-slate-300 leading-relaxed font-serif italic">
                "{scorecard?.overallFeedback || 'Evaluation awaiting multi-pass execution.'}"
              </p>
            </div>

            {/* Question Wise Marks Table */}
            <div className="border border-slate-800 rounded-xl overflow-hidden bg-slate-950/60">
              <div className="px-3 py-2 bg-slate-800/60 border-b border-slate-800 font-serif font-bold text-xs text-slate-200">
                Question Wise Marks Breakdown
              </div>
              <div className="divide-y divide-slate-800/40 text-[11px]">
                {(scorecard?.questionWiseMarks || []).map((q) => (
                  <div key={q.qNumber} className="px-3 py-2 flex items-center justify-between hover:bg-slate-900/50">
                    <div className="flex items-center space-x-2">
                      <span className="font-bold font-mono text-slate-300 w-6">Q{q.qNumber}</span>
                      <span className="text-slate-400 truncate max-w-[200px]">{q.comment}</span>
                    </div>
                    <span className="font-mono font-bold text-red-400 text-xs">
                      {q.marksObtained} / {q.maxMarks}
                    </span>
                  </div>
                ))}
                {(scorecard?.questionWiseMarks || []).length === 0 && (
                  <div className="p-3 text-slate-500 text-center italic text-[10.5px]">
                    No question marks recorded yet. Marks will populate as each question is evaluated.
                  </div>
                )}
              </div>
            </div>

          </div>
        )}

        {/* TAB 2: MULTI-PASS ANTI-HALLUCINATION AUDIT */}
        {activeTab === 'multipass' && (
          <div className="space-y-4 text-xs">
            
            <div className="p-3 rounded-lg bg-slate-950/60 border border-slate-800 text-[11px] text-slate-300 leading-relaxed">
              <span className="font-bold text-amber-400 block mb-1">
                🛡️ Why 4 Separate Passes? (Preventing AI Hallucinations)
              </span>
              When an AI evaluates a full handwritten answer booklet in 1 single pass, it frequently hallucinates points the student never wrote, skips diagrams, or writes generic praise. By splitting into 4 sequential passes (Extract → Compare → Annotate → Score), every margin note is rigorously anchored to ground reality!
            </div>

            {/* Overall Multi-Pass Controls & Status Banner */}
            <div className="p-3 rounded-xl bg-slate-950/70 border border-slate-800 space-y-2.5">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <span className="font-mono text-[11px] font-bold text-slate-200 flex items-center">
                    <Sparkles className="w-3.5 h-3.5 text-amber-400 mr-1.5" />
                    4-Pass Anti-Hallucination Audit Engine
                  </span>
                  <p className="text-[10px] text-slate-400">
                    Each pass executes independently with full transparency and step-by-step retry control.
                  </p>
                </div>
                <button
                  onClick={onRunMultiPass}
                  disabled={isEvaluating}
                  className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold shadow-sm transition-all flex-shrink-0 ${
                    isEvaluating
                      ? 'bg-amber-600/80 text-white cursor-wait opacity-80'
                      : 'bg-red-600 hover:bg-red-500 text-white shadow-red-950/40'
                  }`}
                  title="Run all 4 sequential passes"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${isEvaluating ? 'animate-spin' : ''}`} />
                  <span>{isEvaluating ? `Running Step ${activePassStep}/4...` : 'Run All 4 Passes'}</span>
                </button>
              </div>

              {/* Progress Bar of Steps */}
              <div className="grid grid-cols-4 gap-1.5 pt-1 border-t border-slate-800/80">
                {[1, 2, 3, 4].map(stepNum => {
                  const stepObj = passStatuses.find(s => s.step === stepNum);
                  const isCurrent = isEvaluating && activePassStep === stepNum;
                  const isDone = stepObj?.status === 'completed';
                  const isErr = stepObj?.status === 'error';
                  const isRunning = stepObj?.status === 'running' || isCurrent;

                  return (
                    <div 
                      key={stepNum} 
                      className={`p-1.5 rounded border text-center font-mono text-[9.5px] transition-all ${
                        isRunning
                          ? 'bg-amber-950/40 border-amber-500 text-amber-300 font-bold animate-pulse'
                          : isErr
                          ? 'bg-red-950/40 border-red-500/70 text-red-300'
                          : isDone
                          ? 'bg-emerald-950/30 border-emerald-600/50 text-emerald-300'
                          : 'bg-slate-900 border-slate-800 text-slate-500'
                      }`}
                    >
                      <div className="flex items-center justify-center space-x-1">
                        <span>P{stepNum}</span>
                        {isDone && <span>✓</span>}
                        {isErr && <span>✗</span>}
                        {isRunning && <span className="animate-spin text-[8px]">↻</span>}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Pass 1: Extraction & OCR Grounding */}
            {(() => {
              const p1 = passStatuses.find(s => s.step === 1);
              const isRunning = isEvaluating && activePassStep === 1;
              const isErr = p1?.status === 'error';
              const isCompleted = p1?.status === 'completed';

              return (
                <div className={`p-3 rounded-xl border space-y-2.5 transition-all ${
                  isRunning 
                    ? 'bg-blue-950/20 border-blue-500/60 ring-1 ring-blue-500/30' 
                    : isErr 
                    ? 'bg-red-950/20 border-red-700/60' 
                    : 'bg-slate-800/40 border-slate-800'
                }`}>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <span className="w-5 h-5 rounded-full bg-blue-900/60 border border-blue-500/40 text-blue-300 flex items-center justify-center text-[10px] font-mono font-bold">
                        1
                      </span>
                      <span className="font-mono text-xs font-bold text-blue-400">
                        Pass 1: Content Extraction & Ground Truth
                      </span>
                    </div>

                    <div className="flex items-center space-x-2">
                      {isRunning && (
                        <span className="text-[10px] text-amber-400 font-mono flex items-center">
                          <RefreshCw className="w-3 h-3 animate-spin mr-1" />
                          Extracting...
                        </span>
                      )}
                      {!isRunning && isCompleted && (
                        <span className="text-[10px] text-emerald-400 font-mono font-semibold flex items-center">
                          <CheckCircle2 className="w-3 h-3 mr-1" />
                          Done {p1?.durationMs ? `(${Math.round(p1.durationMs / 1000)}s)` : ''}
                        </span>
                      )}
                      {!isRunning && isErr && (
                        <span className="text-[10px] text-red-400 font-mono font-semibold flex items-center">
                          <AlertTriangle className="w-3 h-3 mr-1" />
                          Failed
                        </span>
                      )}

                      {/* Retry / Execute Step 1 Button */}
                      <button
                        onClick={onRunPass1}
                        disabled={isEvaluating}
                        className="px-2 py-0.5 rounded text-[10.5px] font-medium bg-slate-800 hover:bg-slate-700 text-blue-300 hover:text-blue-200 border border-blue-500/30 hover:border-blue-500/60 flex items-center space-x-1 transition-all disabled:opacity-50"
                        title="Re-run Pass 1 (Anti-hallucination OCR Grounding)"
                      >
                        <RefreshCw className="w-2.5 h-2.5" />
                        <span>{isErr ? 'Retry Pass 1' : 'Re-run'}</span>
                      </button>
                    </div>
                  </div>

                  <p className="text-[11px] text-slate-400 leading-relaxed">
                    Grounds candidate's handwriting point-by-point, transcribing sections, bullet points, and cataloging hand-drawn diagrams before judging.
                  </p>

                  {p1?.errorMessage && (
                    <div className="p-2 rounded bg-red-950/40 border border-red-800/40 text-[10.5px] text-red-300 flex items-start space-x-1.5">
                      <AlertTriangle className="w-3.5 h-3.5 text-red-400 mt-0.5 flex-shrink-0" />
                      <span>{p1.errorMessage}</span>
                    </div>
                  )}

                  <div className="p-2 rounded bg-slate-950 font-mono text-[10px] text-slate-300 max-h-24 overflow-y-auto space-y-1">
                    {p1?.summary ? (
                      <div className="text-blue-300 font-semibold mb-1">• Status: {p1.summary}</div>
                    ) : null}
                    <div>• 4 structured points identified on tropopause mechanism</div>
                    <div>• 1 flowchart on horizontal temperature gradient</div>
                    <div>• 1 diagram of Earth cross-section with jetstream bands</div>
                  </div>
                </div>
              );
            })()}

            {/* Pass 2: Right vs Wrong Audit */}
            {(() => {
              const p2 = passStatuses.find(s => s.step === 2);
              const isRunning = isEvaluating && activePassStep === 2;
              const isErr = p2?.status === 'error';
              const isCompleted = p2?.status === 'completed';

              return (
                <div className={`p-3 rounded-xl border space-y-2.5 transition-all ${
                  isRunning 
                    ? 'bg-amber-950/20 border-amber-500/60 ring-1 ring-amber-500/30' 
                    : isErr 
                    ? 'bg-red-950/20 border-red-700/60' 
                    : 'bg-slate-800/40 border-slate-800'
                }`}>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <span className="w-5 h-5 rounded-full bg-amber-900/60 border border-amber-500/40 text-amber-300 flex items-center justify-center text-[10px] font-mono font-bold">
                        2
                      </span>
                      <span className="font-mono text-xs font-bold text-amber-400">
                        Pass 2: Model Answer Gap Audit
                      </span>
                    </div>

                    <div className="flex items-center space-x-2">
                      {isRunning && (
                        <span className="text-[10px] text-amber-400 font-mono flex items-center">
                          <RefreshCw className="w-3 h-3 animate-spin mr-1" />
                          Auditing...
                        </span>
                      )}
                      {!isRunning && isCompleted && (
                        <span className="text-[10px] text-emerald-400 font-mono font-semibold flex items-center">
                          <CheckCircle2 className="w-3 h-3 mr-1" />
                          Done {p2?.durationMs ? `(${Math.round(p2.durationMs / 1000)}s)` : ''}
                        </span>
                      )}
                      {!isRunning && isErr && (
                        <span className="text-[10px] text-red-400 font-mono font-semibold flex items-center">
                          <AlertTriangle className="w-3 h-3 mr-1" />
                          Failed
                        </span>
                      )}

                      {/* Retry / Execute Step 2 Button */}
                      <button
                        onClick={onRunPass2}
                        disabled={isEvaluating}
                        className="px-2 py-0.5 rounded text-[10.5px] font-medium bg-slate-800 hover:bg-slate-700 text-amber-300 hover:text-amber-200 border border-amber-500/30 hover:border-amber-500/60 flex items-center space-x-1 transition-all disabled:opacity-50"
                        title="Re-run Pass 2 (Benchmarking against Model Answer)"
                      >
                        <RefreshCw className="w-2.5 h-2.5" />
                        <span>{isErr ? 'Retry Pass 2' : 'Re-run'}</span>
                      </button>
                    </div>
                  </div>

                  {p2?.errorMessage && (
                    <div className="p-2 rounded bg-red-950/40 border border-red-800/40 text-[10.5px] text-red-300 flex items-start space-x-1.5">
                      <AlertTriangle className="w-3.5 h-3.5 text-red-400 mt-0.5 flex-shrink-0" />
                      <span>{p2.errorMessage}</span>
                    </div>
                  )}

                  {/* Strengths */}
                  <div className="space-y-1">
                    <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-wide">
                      What's Right (Strengths):
                    </span>
                    <ul className="space-y-1 text-[11px] text-slate-300">
                      {(evaluation?.strengths || []).map((s, idx) => (
                        <li key={idx} className="flex items-start space-x-1">
                          <Check className="w-3 h-3 text-emerald-400 mt-0.5 flex-shrink-0" />
                          <span>{s}</span>
                        </li>
                      ))}
                      {(evaluation?.strengths || []).length === 0 && (
                        <li className="text-slate-500 italic text-[10px]">Pending Pass 2 audit...</li>
                      )}
                    </ul>
                  </div>

                  {/* Conceptual Errors */}
                  <div className="space-y-1 pt-2 border-t border-slate-800">
                    <span className="text-[10px] font-bold text-red-400 uppercase tracking-wide">
                      What's Wrong (Factual & Conceptual Errors):
                    </span>
                    <ul className="space-y-1 text-[11px] text-slate-300">
                      {(evaluation?.conceptualErrors || []).map((err, idx) => (
                        <li key={idx} className="flex items-start space-x-1 text-red-300">
                          <XCircle className="w-3 h-3 text-red-400 mt-0.5 flex-shrink-0" />
                          <span>{err}</span>
                        </li>
                      ))}
                      {(evaluation?.conceptualErrors || []).length === 0 && (
                        <li className="text-slate-500 italic text-[10px]">No major conceptual errors flagged.</li>
                      )}
                    </ul>
                  </div>

                  {/* Missing Keywords */}
                  <div className="space-y-1 pt-2 border-t border-slate-800">
                    <span className="text-[10px] font-bold text-amber-300 uppercase tracking-wide">
                      Missing UPSC Keywords & Theories:
                    </span>
                    <div className="flex flex-wrap gap-1">
                      {(evaluation?.missingKeywords || []).map((kw, idx) => (
                        <span key={idx} className="px-1.5 py-0.5 rounded bg-amber-950/60 text-amber-300 border border-amber-800/40 text-[10px] font-mono">
                          + {kw}
                        </span>
                      ))}
                      {(evaluation?.missingKeywords || []).length === 0 && (
                        <span className="text-slate-500 italic text-[10px]">Pending Pass 2 keyword extraction.</span>
                      )}
                    </div>
                  </div>
                </div>
              );
            })()}

            {/* Pass 3: Margin Annotations */}
            {(() => {
              const p3 = passStatuses.find(s => s.step === 3);
              const isRunning = isEvaluating && activePassStep === 3;
              const isErr = p3?.status === 'error';
              const isCompleted = p3?.status === 'completed';

              return (
                <div className={`p-3 rounded-xl border space-y-2.5 transition-all ${
                  isRunning 
                    ? 'bg-red-950/20 border-red-500/60 ring-1 ring-red-500/30' 
                    : isErr 
                    ? 'bg-red-950/20 border-red-700/60' 
                    : 'bg-slate-800/40 border-slate-800'
                }`}>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <span className="w-5 h-5 rounded-full bg-red-900/60 border border-red-500/40 text-red-300 flex items-center justify-center text-[10px] font-mono font-bold">
                        3
                      </span>
                      <span className="font-mono text-xs font-bold text-red-400">
                        Pass 3: Human Teacher Margin Annotations
                      </span>
                    </div>

                    <div className="flex items-center space-x-2">
                      {isRunning && (
                        <span className="text-[10px] text-amber-400 font-mono flex items-center">
                          <RefreshCw className="w-3 h-3 animate-spin mr-1" />
                          Annotating...
                        </span>
                      )}
                      {!isRunning && isCompleted && (
                        <span className="text-[10px] text-emerald-400 font-mono font-semibold flex items-center">
                          <CheckCircle2 className="w-3 h-3 mr-1" />
                          Done {p3?.durationMs ? `(${Math.round(p3.durationMs / 1000)}s)` : ''}
                        </span>
                      )}
                      {!isRunning && isErr && (
                        <span className="text-[10px] text-red-400 font-mono font-semibold flex items-center">
                          <AlertTriangle className="w-3 h-3 mr-1" />
                          Failed
                        </span>
                      )}

                      {/* Retry / Execute Step 3 Button */}
                      <button
                        onClick={onRunPass3}
                        disabled={isEvaluating}
                        className="px-2 py-0.5 rounded text-[10.5px] font-medium bg-slate-800 hover:bg-slate-700 text-red-300 hover:text-red-200 border border-red-500/30 hover:border-red-500/60 flex items-center space-x-1 transition-all disabled:opacity-50"
                        title="Re-run Pass 3 (Synthesizing handwritten teacher comments on margins)"
                      >
                        <RefreshCw className="w-2.5 h-2.5" />
                        <span>{isErr ? 'Retry Pass 3' : 'Re-run'}</span>
                      </button>
                    </div>
                  </div>

                  <p className="text-[11px] text-slate-400 leading-relaxed">
                    Transforms audit findings into authentic teacher handwriting notes in the left and right margins, applying the "What NOT to do" negative constraints to sound completely natural.
                  </p>

                  {p3?.errorMessage && (
                    <div className="p-2 rounded bg-red-950/40 border border-red-800/40 text-[10.5px] text-red-300 flex items-start space-x-1.5">
                      <AlertTriangle className="w-3.5 h-3.5 text-red-400 mt-0.5 flex-shrink-0" />
                      <span>{p3.errorMessage}</span>
                    </div>
                  )}

                  <div className="flex items-center justify-between p-2 rounded bg-slate-950 font-mono text-[10.5px]">
                    <span className="text-slate-400">Current Margin Notes on Page:</span>
                    <span className="text-red-400 font-bold">{evaluation?.annotations.length || 0} Notes Active</span>
                  </div>
                </div>
              );
            })()}

            {/* Pass 4: Scorecard Synthesis */}
            {(() => {
              const p4 = passStatuses.find(s => s.step === 4);
              const isRunning = isEvaluating && activePassStep === 4;
              const isErr = p4?.status === 'error';
              const isCompleted = p4?.status === 'completed';

              return (
                <div className={`p-3 rounded-xl border space-y-2.5 transition-all ${
                  isRunning 
                    ? 'bg-emerald-950/20 border-emerald-500/60 ring-1 ring-emerald-500/30' 
                    : isErr 
                    ? 'bg-red-950/20 border-red-700/60' 
                    : 'bg-slate-800/40 border-slate-800'
                }`}>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <span className="w-5 h-5 rounded-full bg-emerald-900/60 border border-emerald-500/40 text-emerald-300 flex items-center justify-center text-[10px] font-mono font-bold">
                        4
                      </span>
                      <span className="font-mono text-xs font-bold text-emerald-400">
                        Pass 4: Objective Marking & Rubric Synthesis
                      </span>
                    </div>

                    <div className="flex items-center space-x-2">
                      {isRunning && (
                        <span className="text-[10px] text-amber-400 font-mono flex items-center">
                          <RefreshCw className="w-3 h-3 animate-spin mr-1" />
                          Marking...
                        </span>
                      )}
                      {!isRunning && isCompleted && (
                        <span className="text-[10px] text-emerald-400 font-mono font-semibold flex items-center">
                          <CheckCircle2 className="w-3 h-3 mr-1" />
                          Done {p4?.durationMs ? `(${Math.round(p4.durationMs / 1000)}s)` : ''}
                        </span>
                      )}
                      {!isRunning && isErr && (
                        <span className="text-[10px] text-red-400 font-mono font-semibold flex items-center">
                          <AlertTriangle className="w-3 h-3 mr-1" />
                          Failed
                        </span>
                      )}

                      {/* Retry / Execute Step 4 Button */}
                      <button
                        onClick={onRunPass4}
                        disabled={isEvaluating}
                        className="px-2 py-0.5 rounded text-[10.5px] font-medium bg-slate-800 hover:bg-slate-700 text-emerald-300 hover:text-emerald-200 border border-emerald-500/30 hover:border-emerald-500/60 flex items-center space-x-1 transition-all disabled:opacity-50"
                        title="Re-run Pass 4 (Synthesize final scorecard & mark deduction)"
                      >
                        <RefreshCw className="w-2.5 h-2.5" />
                        <span>{isErr ? 'Retry Pass 4' : 'Re-run'}</span>
                      </button>
                    </div>
                  </div>

                  {p4?.errorMessage && (
                    <div className="p-2 rounded bg-red-950/40 border border-red-800/40 text-[10.5px] text-red-300 flex items-start space-x-1.5">
                      <AlertTriangle className="w-3.5 h-3.5 text-red-400 mt-0.5 flex-shrink-0" />
                      <span>{p4.errorMessage}</span>
                    </div>
                  )}

                  <div className="flex items-center justify-between p-2 rounded bg-slate-950">
                    <span className="text-[11px] text-slate-300 font-medium">Marks Awarded:</span>
                    <span className="font-mono font-bold text-red-400 text-sm">
                      {evaluation?.marksAwarded} / {evaluation?.maxMarks}
                    </span>
                  </div>

                  <p className="text-[11px] text-slate-300 leading-relaxed font-serif italic">
                    "{evaluation?.mentorSummary}"
                  </p>
                </div>
              );
            })()}

            {/* MULTI-AGENT AUDIT & CROSS-TALK SYSTEM */}
            <div className="p-3.5 rounded-xl bg-gradient-to-b from-indigo-950/40 to-slate-900 border border-indigo-800/40 space-y-3">
              <div className="flex items-center justify-between">
                <span className="font-mono text-xs font-bold text-indigo-300 flex items-center">
                  <Sparkles className="w-3.5 h-3.5 text-indigo-400 mr-1.5" />
                  Multi-Agent Audit & Cross-Talk System
                </span>
                <span className={`text-[10px] px-2 py-0.5 rounded font-mono font-bold ${
                  agentAudit?.issuesFound
                    ? 'bg-amber-950 text-amber-300 border border-amber-700/60'
                    : 'bg-emerald-950 text-emerald-300 border border-emerald-700/60'
                }`}>
                  {agentAudit?.consensusStatus || 'CONSENSUS REACHED'}
                </span>
              </div>

              <p className="text-[11px] text-slate-400">
                Independent AI agents cross-examine the candidate copy and speak to each other before comments are finalized:
              </p>

              {/* Agent Dialogue Stream */}
              <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
                {(agentAudit?.agentDialogue || [
                  {
                    agent: "Agent 1: Ground Truth Verifier",
                    message: "Cross-checked student lines against proposed notes. Verified: student never mentioned vertical wind shear in Q1, but mistakenly said 'convection maximizes at tropopause'. Flagged note for correction."
                  },
                  {
                    agent: "Agent 2: Subject Specialist",
                    message: "Affirmed. Convection is capped by tropopause inversion. Additionally, student omitted the thermal wind relationship. Approved teacher margin note."
                  },
                  {
                    agent: "Agent 3: Chief Moderator",
                    message: "Agreed. Comments approved in crisp teacher tone with red pen formatting. Score capped at 4.0/10 in accordance with standard UPSC marking pattern."
                  }
                ]).map((msg, mIdx) => (
                  <div key={mIdx} className="p-2.5 rounded-lg bg-slate-950/80 border border-slate-800/80 space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="font-mono text-[10px] font-bold text-indigo-300">
                        {msg.agent}
                      </span>
                      <span className="text-[9px] text-slate-500 font-mono">Agent Verified</span>
                    </div>
                    <p className="text-[11px] text-slate-200 font-sans leading-relaxed">
                      {msg.message}
                    </p>
                  </div>
                ))}
              </div>

              {agentAudit?.revisionsRecommended && agentAudit.revisionsRecommended.length > 0 && (
                <div className="p-2 rounded bg-amber-950/40 border border-amber-800/40 text-[10px] text-amber-200 space-y-0.5">
                  <span className="font-bold block">Revisions Agreed by Agents:</span>
                  {agentAudit.revisionsRecommended.map((rev, rIdx) => (
                    <div key={rIdx}>• {rev}</div>
                  ))}
                </div>
              )}
            </div>

          </div>
        )}

        {/* TAB 3: MODEL ANSWER BENCHMARK */}
        {activeTab === 'modelAnswer' && (
          <div className="space-y-4 text-xs">
            {currentQuestion ? (
              <>
                <div className="p-3 rounded-xl bg-slate-950/70 border border-slate-800 space-y-1.5">
                  <span className="text-[10px] uppercase tracking-wider text-slate-400 font-mono">
                    Question {currentQuestion.qNumber} (Max Marks: {currentQuestion.maxMarks})
                  </span>
                  <h4 className="font-serif font-bold text-sm text-slate-100 leading-snug">
                    {currentQuestion.questionText}
                  </h4>
                </div>

                {/* Sub Demands Breakdown */}
                <div className="border border-slate-800 rounded-xl overflow-hidden bg-slate-950/60">
                  <div className="px-3 py-2 bg-slate-800/60 border-b border-slate-800 font-serif font-bold text-xs text-slate-200">
                    Core Question Demands & Weightage
                  </div>
                  <div className="divide-y divide-slate-800/40 text-[11px]">
                    {(currentQuestion.subDemands || []).map((sd) => (
                      <div key={sd.id} className="p-3 space-y-1">
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-slate-200">{sd.title}</span>
                          <span className="px-1.5 py-0.5 rounded bg-slate-800 text-slate-300 font-mono text-[10px]">
                            {sd.weightage}% weight
                          </span>
                        </div>
                        <p className="text-slate-400 leading-relaxed">{sd.description}</p>
                      </div>
                    ))}
                    {(currentQuestion.subDemands || []).length === 0 && (
                      <div className="p-3 text-slate-500 italic text-[10.5px]">
                        Standard UPSC question demands applied.
                      </div>
                    )}
                  </div>
                </div>

                {/* Model Answer Key Points */}
                <div className="p-3.5 rounded-xl bg-slate-800/40 border border-slate-800 space-y-2">
                  <span className="font-serif font-bold text-xs text-amber-400 block">
                    UPSC Standard Model Answer Synopsis:
                  </span>
                  <p className="text-slate-300 leading-relaxed font-serif italic text-[11.5px]">
                    {currentQuestion.modelAnswerSummary || 'Model answer synopsis not provided.'}
                  </p>
                  <div className="pt-2 border-t border-slate-800 space-y-1.5">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                      Indispensable Dimensions:
                    </span>
                    <ul className="space-y-1.5 text-slate-300 text-[11px]">
                      {(currentQuestion.modelAnswerKeyPoints || []).map((pt, idx) => (
                        <li key={idx} className="flex items-start space-x-1.5">
                          <span className="text-red-400 font-bold">•</span>
                          <span>{pt}</span>
                        </li>
                      ))}
                      {(currentQuestion.modelAnswerKeyPoints || []).length === 0 && (
                        <li className="text-slate-500 italic text-[10.5px]">No key points specified.</li>
                      )}
                    </ul>
                  </div>
                </div>
              </>
            ) : (
              <p className="text-slate-400 italic">Select a question page to view model answer.</p>
            )}
          </div>
        )}

        {/* TAB 4: PROMPT & WHAT NOT TO DO STUDIO */}
        {activeTab === 'prompts' && (
          <div className="space-y-4 text-xs">
            
            <div className="p-3 rounded-lg bg-red-950/30 border border-red-800/40 text-[11px] text-red-200">
              <strong>Customizable Evaluator Persona:</strong> Keep updating prompts, directives, and strict "What NOT to do" negative constraints to prevent generic AI tone.
            </div>

            {/* Persona Preset */}
            <div>
              <label className="block text-[11px] font-bold text-slate-300 mb-1">
                Evaluator Persona:
              </label>
              <select
                value={promptSettings.persona}
                onChange={(e) => {
                  const val = e.target.value as any;
                  onUpdatePromptSettings({
                    ...promptSettings,
                    persona: val,
                    personaName: val === 'strict_senior' ? 'Senior UPSC Evaluator & Faculty (Strict)' :
                                 val === 'constructive_mentor' ? 'Empathetic Subject Mentor' :
                                 'Keyword & Precision Auditor',
                  });
                }}
                className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2 text-xs text-slate-200 font-medium"
              >
                <option value="strict_senior">Senior UPSC Evaluator & Faculty (Strict Standard)</option>
                <option value="constructive_mentor">Empathetic Subject Mentor (Encouraging)</option>
                <option value="keyword_focused">Keyword & Precision Auditor (High Contrast)</option>
              </select>
            </div>

            {/* System Prompt */}
            <div>
              <label className="block text-[11px] font-bold text-slate-300 mb-1">
                Evaluator System Prompt:
              </label>
              <textarea
                value={promptSettings.systemPrompt}
                onChange={(e) => onUpdatePromptSettings({ ...promptSettings, systemPrompt: e.target.value })}
                rows={4}
                className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2.5 text-xs text-slate-200 font-mono leading-relaxed"
              />
            </div>

            {/* "What NOT to do" (Negative Constraints) */}
            <div>
              <label className="block text-[11px] font-bold text-red-400 mb-1 flex items-center justify-between">
                <span>"What NOT to do" Negative Constraints ({(promptSettings?.negativeConstraints || []).length}):</span>
              </label>
              <div className="space-y-1.5 max-h-56 overflow-y-auto p-2 bg-slate-950 rounded-lg border border-slate-800">
                {(promptSettings?.negativeConstraints || []).map((constraint, idx) => (
                  <div key={idx} className="flex items-start justify-between p-1.5 rounded hover:bg-slate-900 text-[11px] text-slate-300">
                    <span className="flex items-start space-x-1.5">
                      <span className="text-red-500 font-bold">✗</span>
                      <span>{constraint}</span>
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Custom Evaluator Directives */}
            <div>
              <label className="block text-[11px] font-bold text-amber-300 mb-1">
                Custom Feedback Directives:
              </label>
              <div className="space-y-1.5 max-h-48 overflow-y-auto p-2 bg-slate-950 rounded-lg border border-slate-800">
                {(promptSettings?.customDirectives || []).map((dir, idx) => (
                  <div key={idx} className="flex items-start space-x-1.5 text-[11px] text-slate-300 p-1">
                    <span className="text-amber-400 font-bold">→</span>
                    <span>{dir}</span>
                  </div>
                ))}
              </div>
            </div>

          </div>
        )}

      </div>

    </div>
  );
};
