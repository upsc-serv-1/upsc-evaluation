import React, { useState } from 'react';
import { 
  X, 
  Plus, 
  Trash2, 
  Sliders, 
  CheckCircle2, 
  RotateCcw, 
  MessageSquare,
  Hash,
  MapPin,
  ListOrdered
} from 'lucide-react';
import { EvaluatorPromptSettings } from '../types';
import { DEFAULT_PROMPT_SETTINGS } from '../data/sampleCopy';

interface PromptStudioModalProps {
  isOpen: boolean;
  onClose: () => void;
  settings: EvaluatorPromptSettings;
  onSave: (settings: EvaluatorPromptSettings) => void;
}

export const PromptStudioModal: React.FC<PromptStudioModalProps> = ({
  isOpen,
  onClose,
  settings,
  onSave,
}) => {
  const [current, setCurrent] = useState<EvaluatorPromptSettings>(settings);
  const [newConstraint, setNewConstraint] = useState<string>('');
  const [newDirective, setNewDirective] = useState<string>('');

  if (!isOpen) return null;

  const handleAddConstraint = () => {
    if (!newConstraint.trim()) return;
    setCurrent({
      ...current,
      negativeConstraints: [...current.negativeConstraints, newConstraint.trim()],
    });
    setNewConstraint('');
  };

  const handleRemoveConstraint = (idx: number) => {
    setCurrent({
      ...current,
      negativeConstraints: current.negativeConstraints.filter((_, i) => i !== idx),
    });
  };

  const handleAddDirective = () => {
    if (!newDirective.trim()) return;
    setCurrent({
      ...current,
      customDirectives: [...current.customDirectives, newDirective.trim()],
    });
    setNewDirective('');
  };

  const handleRemoveDirective = (idx: number) => {
    setCurrent({
      ...current,
      customDirectives: current.customDirectives.filter((_, i) => i !== idx),
    });
  };

  const toggleFormat = (fmt: 'margin_note' | 'top_demand_callout' | 'score_breakdown' | 'underlining_comment') => {
    const exists = current.feedbackFormats?.includes(fmt);
    const updated = exists
      ? current.feedbackFormats.filter(f => f !== fmt)
      : [...(current.feedbackFormats || []), fmt];
    setCurrent({ ...current, feedbackFormats: updated });
  };

  const handleResetToDefault = () => {
    setCurrent({ ...DEFAULT_PROMPT_SETTINGS });
  };

  const handleSave = () => {
    onSave(current);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6 overflow-y-auto">
      <div className="bg-slate-900 border border-slate-700 rounded-2xl max-w-3xl w-full text-slate-100 shadow-2xl overflow-hidden flex flex-col max-h-[94vh]">
        
        {/* Header */}
        <div className="p-4 sm:p-5 bg-slate-950 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-9 h-9 rounded-lg bg-red-900/30 border border-red-700/50 flex items-center justify-center text-red-400">
              <Sliders className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-serif font-bold text-base text-slate-100">
                Evaluation Directives, Feedback Volume & Coordinate Placement
              </h3>
              <p className="text-xs text-slate-400">
                Control how many comments are made, what type/format of feedback to generate, and where annotations sit on margins.
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-slate-200"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto space-y-6 text-xs font-sans">
          
          {/* SECTION 1: FEEDBACK VOLUME & FORMAT (Directly requested) */}
          <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-4">
            <div className="flex items-center space-x-2 text-red-400 font-bold text-xs uppercase tracking-wider">
              <Hash className="w-4 h-4" />
              <span>1. Feedback Volume (How Many Comments per Page)</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {[
                { id: 'minimal_strict', title: 'Minimal & Strict', count: '2 to 4 notes', desc: 'Only high-impact conceptual errors and missed core keywords.' },
                { id: 'balanced', title: 'Balanced Teacher', count: '4 to 7 notes', desc: 'Standard UPSC blend: corrections, praise ticks, and margin advice.' },
                { id: 'exhaustive', title: 'Exhaustive Line-by-Line', count: '8 to 12 notes', desc: 'Deep phrase-by-phrase audit of all handwriting and diagrams.' },
              ].map(opt => (
                <div
                  key={opt.id}
                  onClick={() => setCurrent({ ...current, feedbackCount: opt.id as any })}
                  className={`p-3 rounded-lg border cursor-pointer transition-all ${
                    current.feedbackCount === opt.id
                      ? 'bg-red-950/40 border-red-500 text-red-100 ring-1 ring-red-500/50'
                      : 'bg-slate-900 border-slate-800 text-slate-300 hover:border-slate-700'
                  }`}
                >
                  <div className="font-bold text-xs flex items-center justify-between">
                    <span>{opt.title}</span>
                    <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-slate-800 text-slate-300">
                      {opt.count}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-400 mt-1 leading-snug">
                    {opt.desc}
                  </p>
                </div>
              ))}
            </div>

            {/* What Format of Feedback */}
            <div className="pt-2 border-t border-slate-800/80 space-y-2">
              <label className="block text-xs font-bold text-slate-200">
                Allowed Feedback Formats:
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {[
                  { id: 'margin_note', label: 'Margin Notes (Right/Left)', desc: 'Short teacher handwriting notes' },
                  { id: 'top_demand_callout', label: 'Top Demand Callout', desc: 'Header banner for missed demands' },
                  { id: 'score_breakdown', label: 'Marks Stamp (e.g. 4/10)', desc: 'Formal mark awarded stamp' },
                  { id: 'underlining_comment', label: 'Diagram/Map Notes', desc: 'Latitude & spatial corrections' },
                ].map(fmt => {
                  const active = current.feedbackFormats?.includes(fmt.id as any);
                  return (
                    <div
                      key={fmt.id}
                      onClick={() => toggleFormat(fmt.id as any)}
                      className={`p-2.5 rounded-lg border cursor-pointer select-none transition-all ${
                        active
                          ? 'bg-amber-950/40 border-amber-500/80 text-amber-200'
                          : 'bg-slate-900 border-slate-800 text-slate-400 opacity-60 hover:opacity-90'
                      }`}
                    >
                      <div className="flex items-center space-x-1.5 font-bold text-[11px]">
                        <span>{active ? '✓' : '○'}</span>
                        <span>{fmt.label}</span>
                      </div>
                      <p className="text-[10px] text-slate-400 mt-0.5">{fmt.desc}</p>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* SECTION 2: COORDINATES & SPATIAL ANCHORING STRATEGY */}
          <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-3">
            <div className="flex items-center space-x-2 text-indigo-400 font-bold text-xs uppercase tracking-wider">
              <MapPin className="w-4 h-4" />
              <span>2. X & Y Coordinate Anchor Strategy (Exact Placement)</span>
            </div>

            <p className="text-[11.5px] text-slate-300 leading-relaxed">
              How the AI guarantees notes are placed at the exact line coordinate without overlapping text:
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {[
                { 
                  id: 'smart_visual_margin', 
                  title: 'Smart UPSC Margin Anchor', 
                  coords: 'Left: x=2-12%, Right: x=81-88%',
                  desc: 'Places notes strictly in the authentic red-ruled UPSC margins aligned with the exact student line Y-coordinate.' 
                },
                { 
                  id: 'strict_right_margin', 
                  title: 'Right Margin Priority', 
                  coords: 'Right: x=82%, width=16%',
                  desc: 'Forces all general suggestions into the right margin, reserving top banner for major demand omissions.' 
                },
                { 
                  id: 'line_snapped', 
                  title: 'Vertical Line Snapping', 
                  coords: 'Exact Y% derived from OCR line #',
                  desc: 'Snaps Y coordinate strictly to OCR detected bullet or paragraph line number (e.g. line 4 = y:28%).' 
                },
              ].map(opt => (
                <div
                  key={opt.id}
                  onClick={() => setCurrent({ ...current, coordinateAnchorStrategy: opt.id as any })}
                  className={`p-3 rounded-lg border cursor-pointer transition-all ${
                    current.coordinateAnchorStrategy === opt.id
                      ? 'bg-indigo-950/40 border-indigo-500 text-indigo-100 ring-1 ring-indigo-500/50'
                      : 'bg-slate-900 border-slate-800 text-slate-300 hover:border-slate-700'
                  }`}
                >
                  <div className="font-bold text-xs text-indigo-200">
                    {opt.title}
                  </div>
                  <div className="text-[10px] font-mono text-slate-400 mt-0.5">
                    {opt.coords}
                  </div>
                  <p className="text-[11px] text-slate-400 mt-1 leading-snug">
                    {opt.desc}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Persona Selection */}
          <div className="space-y-1.5">
            <label className="block text-xs font-bold text-slate-300">
              Evaluator Persona & Standard:
            </label>
            <select
              value={current.persona}
              onChange={(e) => {
                const val = e.target.value as any;
                setCurrent({
                  ...current,
                  persona: val,
                  personaName: val === 'strict_senior' ? 'Senior UPSC Evaluator & Faculty (Strict Standard)' :
                               val === 'constructive_mentor' ? 'Empathetic Subject Mentor (Supportive)' :
                               'Keyword & Physical Mechanism Auditor',
                });
              }}
              className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2.5 text-xs text-slate-100 font-medium"
            >
              <option value="strict_senior">Senior UPSC Evaluator & Faculty (Strict Standard, LevelUp IAS / ForumIAS Style)</option>
              <option value="constructive_mentor">Empathetic Subject Mentor (Supportive, Detailed Explanations)</option>
              <option value="keyword_focused">Keyword & Physical Mechanism Auditor (Demands, Diagrams & Core Directives)</option>
            </select>
          </div>

          {/* System Prompt */}
          <div className="space-y-1.5">
            <label className="block text-xs font-bold text-slate-300">
              Base System Prompt (Evaluator Identity):
            </label>
            <textarea
              value={current.systemPrompt}
              onChange={(e) => setCurrent({ ...current, systemPrompt: e.target.value })}
              rows={3}
              className="w-full bg-slate-800 border border-slate-700 rounded-lg p-3 text-xs text-slate-100 font-mono leading-relaxed"
            />
          </div>

          {/* "What NOT to do" (Negative Constraints) */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <div>
                <label className="block text-xs font-bold text-red-400">
                  "What NOT to do" Negative Constraints ({current.negativeConstraints.length}):
                </label>
                <p className="text-[11px] text-slate-400">
                  Strictly prohibits robotic AI jargon, unsolicited praise, and generic commentary.
                </p>
              </div>
            </div>

            <div className="space-y-1.5 max-h-44 overflow-y-auto p-2.5 bg-slate-950 rounded-xl border border-slate-800">
              {current.negativeConstraints.map((constraint, idx) => (
                <div key={idx} className="flex items-center justify-between p-2 rounded-lg bg-slate-900 border border-slate-800/80 group">
                  <span className="flex items-start space-x-2 text-slate-200">
                    <span className="text-red-500 font-bold text-xs mt-0.5">✗</span>
                    <span className="text-[11.5px] leading-tight">{constraint}</span>
                  </span>
                  <button
                    onClick={() => handleRemoveConstraint(idx)}
                    className="p-1 text-slate-500 hover:text-red-400 opacity-60 group-hover:opacity-100 transition-opacity"
                    title="Remove rule"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>

            {/* Add New Constraint Input */}
            <div className="flex space-x-2">
              <input
                type="text"
                value={newConstraint}
                onChange={(e) => setNewConstraint(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleAddConstraint()}
                placeholder="Add new rule what NOT to do (e.g. 'Never write long paragraphs in margin')"
                className="flex-1 bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-xs text-slate-100 focus:outline-none focus:border-red-500"
              />
              <button
                onClick={handleAddConstraint}
                disabled={!newConstraint.trim()}
                className="px-3.5 py-2 rounded-lg bg-red-900/60 hover:bg-red-800 text-red-200 text-xs font-semibold flex items-center space-x-1 disabled:opacity-50"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Rule</span>
              </button>
            </div>
          </div>

          {/* Custom Evaluator Directives */}
          <div className="space-y-2">
            <div>
              <label className="block text-xs font-bold text-amber-300">
                Custom Feedback Directives & Keyword Demands:
              </label>
              <p className="text-[11px] text-slate-400">
                Instruct the evaluator to check for specific nuances (e.g. Article citations, case laws, diagram labeling).
              </p>
            </div>

            <div className="space-y-1.5 max-h-40 overflow-y-auto p-2.5 bg-slate-950 rounded-xl border border-slate-800">
              {current.customDirectives.map((dir, idx) => (
                <div key={idx} className="flex items-center justify-between p-2 rounded-lg bg-slate-900 border border-slate-800/80 group">
                  <span className="flex items-start space-x-2 text-slate-200">
                    <span className="text-amber-400 font-bold text-xs mt-0.5">→</span>
                    <span className="text-[11.5px] leading-tight">{dir}</span>
                  </span>
                  <button
                    onClick={() => handleRemoveDirective(idx)}
                    className="p-1 text-slate-500 hover:text-amber-400 opacity-60 group-hover:opacity-100 transition-opacity"
                    title="Remove directive"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>

            <div className="flex space-x-2">
              <input
                type="text"
                value={newDirective}
                onChange={(e) => setNewDirective(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleAddDirective()}
                placeholder="Add custom directive (e.g. 'Pay special attention to diagram labeling')"
                className="flex-1 bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-xs text-slate-100 focus:outline-none focus:border-amber-500"
              />
              <button
                onClick={handleAddDirective}
                disabled={!newDirective.trim()}
                className="px-3.5 py-2 rounded-lg bg-amber-900/60 hover:bg-amber-800 text-amber-200 text-xs font-semibold flex items-center space-x-1 disabled:opacity-50"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Directive</span>
              </button>
            </div>
          </div>

        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-950 border-t border-slate-800 flex items-center justify-between">
          <button
            onClick={handleResetToDefault}
            className="flex items-center space-x-1 text-slate-400 hover:text-slate-200 text-xs"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset to Standard UPSC Default</span>
          </button>

          <div className="flex space-x-2">
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs text-slate-300"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              className="px-5 py-2 rounded-lg bg-red-600 hover:bg-red-500 text-xs font-semibold text-white shadow-md flex items-center space-x-1.5"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>Apply All Directives</span>
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
