import React from 'react';
import { 
  FileText, 
  Sparkles, 
  Download, 
  Sliders, 
  Award, 
  RotateCcw,
  BookOpen,
  CheckCircle2,
  ChevronDown,
  Key,
  Upload
} from 'lucide-react';
import { EvaluatorPromptSettings, ApiConnectionConfig } from '../types';

interface NavbarProps {
  onRunMultiPass: () => void;
  isEvaluating: boolean;
  onOpenPromptStudio: () => void;
  onOpenScorecard: () => void;
  onOpenUpload: () => void;
  onOpenApiSettings: () => void;
  onExportPdf: () => void;
  isExportingPdf: boolean;
  promptSettings: EvaluatorPromptSettings;
  apiConfig: ApiConnectionConfig;
  totalScore: number;
  totalMaxMarks: number;
  currentPassStep: number;
}

export const Navbar: React.FC<NavbarProps> = ({
  onRunMultiPass,
  isEvaluating,
  onOpenPromptStudio,
  onOpenScorecard,
  onOpenUpload,
  onOpenApiSettings,
  onExportPdf,
  isExportingPdf,
  promptSettings,
  apiConfig,
  totalScore,
  totalMaxMarks,
  currentPassStep,
}) => {
  return (
    <header className="bg-slate-900 border-b border-slate-800 text-white sticky top-0 z-30 shadow-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        
        {/* Left: Branding & Persona */}
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-lg bg-red-700/20 border border-red-500/40 flex items-center justify-center text-red-400 font-serif font-black text-xl shadow-inner">
            U
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h1 className="font-serif font-bold text-base tracking-wide text-slate-100">
                UPSC Test Copy Evaluator
              </h1>
              <span className="hidden sm:inline-block px-2 py-0.5 text-xs font-medium rounded-full bg-red-950/60 text-red-300 border border-red-800/60">
                Human Teacher Margin Annotator
              </span>
            </div>
            <div className="flex items-center space-x-2 text-xs text-slate-400">
              <span className="flex items-center">
                <span className="w-2 h-2 rounded-full bg-emerald-400 mr-1.5 animate-pulse" />
                {apiConfig.provider === 'openai_compatible' ? 'OpenAI / Custom LLM' : 'Gemini'} ({apiConfig.model})
              </span>
              <span>•</span>
              <button 
                onClick={onOpenPromptStudio}
                className="hover:text-red-300 transition-colors flex items-center underline decoration-slate-600 underline-offset-2"
              >
                {promptSettings.personaName}
              </button>
            </div>
          </div>
        </div>

        {/* Center / Right: Metrics & Action Buttons */}
        <div className="flex items-center space-x-2 sm:space-x-3">
          
          {/* Score Badge */}
          <button
            onClick={onOpenScorecard}
            className="flex items-center space-x-2 px-3 py-1.5 rounded-lg bg-slate-800/90 border border-slate-700 hover:border-red-500/50 hover:bg-slate-800 transition-all text-xs font-medium"
            title="View LevelUp IAS Style Matrix & Scorecard"
          >
            <Award className="w-4 h-4 text-amber-400" />
            <span className="text-slate-300">Marks:</span>
            <span className="font-bold text-red-400 text-sm font-mono">
              {totalScore} / {totalMaxMarks}
            </span>
          </button>

          {/* API Key, Base URL & Model Selector */}
          <button
            onClick={onOpenApiSettings}
            className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg border text-xs font-medium transition-colors ${
              apiConfig.apiKey || apiConfig.baseUrl || apiConfig.provider === 'openai_compatible'
                ? 'bg-amber-950/70 border-amber-500/60 text-amber-300'
                : 'bg-slate-800 hover:bg-slate-700 text-slate-200 border-slate-700'
            }`}
            title="Configure custom API Key, Base URL and Model (Gemini or OpenAI-compatible)"
          >
            <Key className="w-3.5 h-3.5 text-amber-400" />
            <span className="hidden sm:inline font-mono">
              {apiConfig.provider === 'openai_compatible' ? `OpenAI (${apiConfig.model})` : apiConfig.model.replace('gemini-', '')}
            </span>
          </button>

          {/* Upload / Switch Copy */}
          <button
            onClick={onOpenUpload}
            className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-red-900/40 hover:bg-red-900/60 text-red-200 text-xs font-semibold border border-red-700/60 transition-colors shadow-xs"
            title="Upload Student Copy PDF & Model Answer PDF (Zero typing needed)"
          >
            <Upload className="w-3.5 h-3.5 text-red-400" />
            <span className="hidden sm:inline">Upload PDFs (Auto-Evaluate)</span>
          </button>

          {/* Prompt & What Not To Do Studio */}
          <button
            onClick={onOpenPromptStudio}
            className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium border border-slate-700 transition-colors"
            title="Configure System Prompt & Negative Constraints (What NOT to do)"
          >
            <Sliders className="w-3.5 h-3.5 text-slate-400" />
            <span className="hidden md:inline">Prompts & "Not to do" Rules</span>
          </button>

          {/* Run Multi-Pass Evaluation */}
          <button
            onClick={onRunMultiPass}
            disabled={isEvaluating}
            className={`flex items-center space-x-1.5 px-3.5 py-1.5 rounded-lg text-xs font-semibold shadow-sm transition-all ${
              isEvaluating
                ? 'bg-amber-600 text-white cursor-wait opacity-90'
                : 'bg-red-600 hover:bg-red-500 text-white hover:shadow-red-600/30'
            }`}
          >
            <Sparkles className={`w-3.5 h-3.5 ${isEvaluating ? 'animate-spin' : ''}`} />
            <span>{isEvaluating ? `Running Pass ${currentPassStep}/4...` : 'Run 4-Pass AI Evaluation'}</span>
          </button>

          {/* Export Annotated PDF (Standard ISO FreeText Annotations) */}
          <button
            onClick={onExportPdf}
            disabled={isExportingPdf}
            className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-emerald-400 hover:text-emerald-300 border border-emerald-500/30 hover:border-emerald-500/60 text-xs font-medium transition-all shadow-sm"
            title="Download PDF with Standard FreeText Annotations (editable in Adobe Acrobat)"
          >
            <Download className={`w-3.5 h-3.5 ${isExportingPdf ? 'animate-bounce' : ''}`} />
            <span className="hidden sm:inline">Export Annotated PDF</span>
            <span className="text-[10px] px-1 py-0.2 rounded bg-emerald-950 text-emerald-300 font-mono">
              FreeText
            </span>
          </button>
        </div>

      </div>
    </header>
  );
};
