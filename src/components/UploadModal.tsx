import React, { useState } from 'react';
import { 
  X, 
  Upload, 
  Sparkles, 
  BookOpen, 
  FileText, 
  CheckCircle2, 
  FileCheck,
  ArrowRight,
  Loader2,
  HelpCircle,
  Brain
} from 'lucide-react';
import { SAMPLE_QUESTIONS } from '../data/sampleCopy';
import { parsePdfComplete } from '../utils/pdfRenderer';
import { ApiConnectionConfig } from '../types';

interface UploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectSampleQuestion: (qNumber: number) => void;
  apiConfig: ApiConnectionConfig;
  onStartCustomEvaluation: (payload: {
    questionText: string;
    maxMarks: number;
    modelAnswer: string;
    studentContent: string;
    imageBase64?: string;
    pagesList?: { pageNumber: number; dataUrl: string }[];
  }) => void;
}

export const UploadModal: React.FC<UploadModalProps> = ({
  isOpen,
  onClose,
  onSelectSampleQuestion,
  apiConfig,
  onStartCustomEvaluation,
}) => {
  const [activeTab, setActiveTab] = useState<'upload_both' | 'samples'>('upload_both');
  
  // File 1: Candidate Answer Copy PDF
  const [copyFile, setCopyFile] = useState<File | null>(null);
  const [copyPages, setCopyPages] = useState<{ pageNumber: number; dataUrl: string }[]>([]);
  const [copyRawText, setCopyRawText] = useState<string>('');
  const [isProcessingCopy, setIsProcessingCopy] = useState<boolean>(false);

  // File 2: Model Answer PDF
  const [modelFile, setModelFile] = useState<File | null>(null);
  const [modelAnswerText, setModelAnswerText] = useState<string>('');
  const [isProcessingModel, setIsProcessingModel] = useState<boolean>(false);

  // Auto-Detected / Extracted Fields (AI populates these instantly)
  const [detectedQuestion, setDetectedQuestion] = useState<string>('');
  const [detectedMaxMarks, setDetectedMaxMarks] = useState<number>(10);
  const [modelSummary, setModelSummary] = useState<string>('');
  const [isAutoParsing, setIsAutoParsing] = useState<boolean>(false);
  const [autoParseDone, setAutoParseDone] = useState<boolean>(false);

  if (!isOpen) return null;

  // Handle Candidate Copy PDF/Image Upload
  const handleCopyUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setCopyFile(file);
    setIsProcessingCopy(true);

    try {
      if (file.type === 'application/pdf' || file.name.toLowerCase().endsWith('.pdf')) {
        const { pages, extractedText } = await parsePdfComplete(file);
        setCopyPages(pages);
        setCopyRawText(extractedText);

        // Immediately trigger AI auto-detection of Question & Marks from Page 1
        if (pages.length > 0) {
          triggerCopyAutoDetection(pages[0].dataUrl, extractedText);
        }
      } else {
        // Single Image
        const reader = new FileReader();
        reader.onload = () => {
          const dataUrl = reader.result as string;
          setCopyPages([{ pageNumber: 1, dataUrl }]);
          triggerCopyAutoDetection(dataUrl, '');
        };
        reader.readAsDataURL(file);
      }
    } catch (err) {
      console.error('Failed to parse candidate copy:', err);
    } finally {
      setIsProcessingCopy(false);
    }
  };

  // Auto-detect question text & marks from Candidate copy image/text
  const triggerCopyAutoDetection = async (imageBase64: string, rawText: string) => {
    setIsAutoParsing(true);
    try {
      const resp = await fetch('/api/parse-copy', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          imageBase64,
          rawText,
          apiConfig,
        }),
      });
      const data = await resp.json();
      if (data?.data) {
        if (data.data.questionText) {
          setDetectedQuestion(data.data.questionText);
        }
        if (data.data.maxMarks) {
          setDetectedMaxMarks(data.data.maxMarks);
        }
        setAutoParseDone(true);
      }
    } catch (e) {
      console.warn('Auto question detection finished with fallback:', e);
      // Fallback: Use first non-empty lines from raw text if any
      if (rawText) {
        const firstLine = rawText.split('\n').filter(l => l.trim().length > 15)[0];
        if (firstLine) setDetectedQuestion(firstLine.slice(0, 140));
      }
    } finally {
      setIsAutoParsing(false);
    }
  };

  // Handle Model Answer PDF Upload
  const handleModelUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setModelFile(file);
    setIsProcessingModel(true);

    try {
      if (file.type === 'application/pdf' || file.name.toLowerCase().endsWith('.pdf')) {
        const { pages, extractedText } = await parsePdfComplete(file);
        setModelAnswerText(extractedText);

        // Summarize and extract model answer demands via AI
        const resp = await fetch('/api/parse-model-answer', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            modelAnswerText: extractedText,
            imageBase64: pages[0]?.dataUrl,
            questionText: detectedQuestion,
            apiConfig,
          }),
        });
        const data = await resp.json();
        if (data?.data) {
          setModelSummary(data.data.modelAnswerSummary || extractedText.slice(0, 300));
        }
      } else {
        const reader = new FileReader();
        reader.onload = () => {
          setModelAnswerText('Uploaded image reference');
        };
        reader.readAsDataURL(file);
      }
    } catch (err) {
      console.error('Failed to parse model answer:', err);
    } finally {
      setIsProcessingModel(false);
    }
  };

  // Start 1-Click Evaluation
  const handleStartEvaluation = () => {
    if (copyPages.length === 0) return;

    const finalQuestion = detectedQuestion.trim() || "UPSC Mains Question (Extracted from Booklet)";
    const finalModel = modelSummary.trim() || modelAnswerText.trim() || "Use standard UPSC CSE Mains syllabus knowledge for this question.";

    onStartCustomEvaluation({
      questionText: finalQuestion,
      maxMarks: detectedMaxMarks || 10,
      modelAnswer: finalModel,
      studentContent: copyRawText || "Original candidate handwritten response.",
      imageBase64: copyPages[0]?.dataUrl,
      pagesList: copyPages,
    });

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6 overflow-y-auto">
      <div className="bg-slate-900 border border-slate-700 rounded-2xl max-w-2xl w-full text-slate-100 shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
        
        {/* Header */}
        <div className="p-4 sm:p-5 bg-slate-950 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-9 h-9 rounded-lg bg-red-900/30 border border-red-700/50 flex items-center justify-center text-red-400">
              <Brain className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-serif font-bold text-base text-slate-100">
                Automatic Copy & Model Answer Evaluator
              </h3>
              <p className="text-xs text-slate-400">
                Zero typing needed: Just drop the Student Copy PDF and Model Answer PDF. AI reads everything.
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

        {/* Tab switch */}
        <div className="flex border-b border-slate-800 bg-slate-950/60 px-5 pt-3 space-x-4 text-xs font-medium">
          <button
            onClick={() => setActiveTab('upload_both')}
            className={`pb-2.5 border-b-2 transition-colors flex items-center space-x-1.5 ${
              activeTab === 'upload_both'
                ? 'border-red-500 text-red-400 font-bold'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Upload className="w-3.5 h-3.5" />
            <span>Upload PDFs (Zero-Typing 1-Click Evaluation)</span>
          </button>

          <button
            onClick={() => setActiveTab('samples')}
            className={`pb-2.5 border-b-2 transition-colors flex items-center space-x-1.5 ${
              activeTab === 'samples'
                ? 'border-red-500 text-red-400 font-bold'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <BookOpen className="w-3.5 h-3.5" />
            <span>Explore Pre-Loaded Manas Arora UPSC Copy</span>
          </button>
        </div>

        {/* Content */}
        <div className="p-5 sm:p-6 overflow-y-auto space-y-5 text-xs">

          {/* TAB 1: ZERO TYPING PDF UPLOADER */}
          {activeTab === 'upload_both' && (
            <div className="space-y-4">
              
              {/* Highlight Banner */}
              <div className="p-3.5 rounded-xl bg-red-950/30 border border-red-800/50 flex items-start space-x-2.5 text-slate-200">
                <Sparkles className="w-4 h-4 text-amber-400 flex-shrink-0 mt-0.5" />
                <div className="space-y-0.5">
                  <p className="font-bold text-amber-300">
                    Fully Automated UPSC Evaluation
                  </p>
                  <p className="text-[11px] text-slate-300 leading-relaxed">
                    You do NOT need to type any questions or copy text. When you upload the candidate's PDF and model answer PDF, the AI vision engine automatically extracts the printed question, candidate handwriting, diagrams, and benchmarks them directly.
                  </p>
                </div>
              </div>

              {/* 2 Side-by-Side Upload Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                
                {/* CARD 1: CANDIDATE ANSWER COPY */}
                <div className={`p-4 rounded-xl border transition-all flex flex-col justify-between ${
                  copyFile 
                    ? 'bg-slate-800/80 border-emerald-500/70 text-slate-200 ring-1 ring-emerald-500/30' 
                    : 'bg-slate-800/40 border-slate-700/80 hover:border-red-500/50'
                }`}>
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-bold text-xs text-slate-100 flex items-center space-x-1.5">
                        <FileText className="w-4 h-4 text-red-400" />
                        <span>1. Student Answer Copy PDF</span>
                      </span>
                      {copyFile && (
                        <span className="px-2 py-0.5 rounded-full bg-emerald-900/60 text-emerald-300 font-mono text-[10px] border border-emerald-700/60 flex items-center space-x-1">
                          <CheckCircle2 className="w-3 h-3" />
                          <span>{copyPages.length} Pages</span>
                        </span>
                      )}
                    </div>
                    <p className="text-[11px] text-slate-400 mb-3 leading-snug">
                      Candidate's scanned booklet with handwritten answers and diagrams.
                    </p>
                  </div>

                  <label className="w-full py-3 px-3 rounded-lg bg-slate-900/80 border border-dashed border-slate-600 hover:border-red-400 cursor-pointer flex flex-col items-center justify-center text-center transition-colors">
                    {isProcessingCopy ? (
                      <div className="flex items-center space-x-2 text-amber-400">
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span className="text-[11px]">Rendering original pages...</span>
                      </div>
                    ) : copyFile ? (
                      <div className="space-y-0.5">
                        <p className="font-bold text-emerald-300 text-[11px] truncate max-w-[200px]">
                          {copyFile.name}
                        </p>
                        <p className="text-[10px] text-slate-400">
                          Click to change file
                        </p>
                      </div>
                    ) : (
                      <div className="space-y-1 text-slate-300">
                        <Upload className="w-4 h-4 mx-auto text-red-400" />
                        <p className="font-semibold text-[11px]">Choose Student Copy PDF</p>
                        <p className="text-[10px] text-slate-500">Supports PDF & Scanned Images</p>
                      </div>
                    )}
                    <input
                      type="file"
                      accept="application/pdf,image/*"
                      onChange={handleCopyUpload}
                      className="hidden"
                    />
                  </label>
                </div>

                {/* CARD 2: MODEL ANSWER PDF */}
                <div className={`p-4 rounded-xl border transition-all flex flex-col justify-between ${
                  modelFile 
                    ? 'bg-slate-800/80 border-emerald-500/70 text-slate-200 ring-1 ring-emerald-500/30' 
                    : 'bg-slate-800/40 border-slate-700/80 hover:border-blue-500/50'
                }`}>
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-bold text-xs text-slate-100 flex items-center space-x-1.5">
                        <BookOpen className="w-4 h-4 text-blue-400" />
                        <span>2. Model Answer PDF</span>
                      </span>
                      {modelFile && (
                        <span className="px-2 py-0.5 rounded-full bg-emerald-900/60 text-emerald-300 font-mono text-[10px] border border-emerald-700/60 flex items-center space-x-1">
                          <CheckCircle2 className="w-3 h-3" />
                          <span>Extracted</span>
                        </span>
                      )}
                    </div>
                    <p className="text-[11px] text-slate-400 mb-3 leading-snug">
                      Official institute key points, expected dimensions, or syllabus solution.
                    </p>
                  </div>

                  <label className="w-full py-3 px-3 rounded-lg bg-slate-900/80 border border-dashed border-slate-600 hover:border-blue-400 cursor-pointer flex flex-col items-center justify-center text-center transition-colors">
                    {isProcessingModel ? (
                      <div className="flex items-center space-x-2 text-blue-400">
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span className="text-[11px]">Extracting model answer...</span>
                      </div>
                    ) : modelFile ? (
                      <div className="space-y-0.5">
                        <p className="font-bold text-emerald-300 text-[11px] truncate max-w-[200px]">
                          {modelFile.name}
                        </p>
                        <p className="text-[10px] text-slate-400">
                          Click to change file
                        </p>
                      </div>
                    ) : (
                      <div className="space-y-1 text-slate-300">
                        <Upload className="w-4 h-4 mx-auto text-blue-400" />
                        <p className="font-semibold text-[11px]">Choose Model Answer PDF</p>
                        <p className="text-[10px] text-slate-500">Optional: AI uses standard UPSC knowledge if omitted</p>
                      </div>
                    )}
                    <input
                      type="file"
                      accept="application/pdf,image/*,.txt"
                      onChange={handleModelUpload}
                      className="hidden"
                    />
                  </label>
                </div>

              </div>

              {/* AUTOMATICALLY DETECTED QUESTION & DETAILS (READ-ONLY CONFIRMATION) */}
              {(isAutoParsing || autoParseDone || detectedQuestion) && (
                <div className="p-3.5 rounded-xl bg-slate-950/80 border border-slate-800 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-xs text-amber-300 flex items-center space-x-1.5">
                      {isAutoParsing ? (
                        <>
                          <Loader2 className="w-3.5 h-3.5 animate-spin text-amber-400" />
                          <span>AI Reading Question from Scanned Booklet...</span>
                        </>
                      ) : (
                        <>
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                          <span>Automatically Detected from Booklet:</span>
                        </>
                      )}
                    </span>
                    <span className="px-2 py-0.5 rounded bg-slate-800 font-mono text-[10px] text-slate-300 border border-slate-700">
                      {detectedMaxMarks} Marks
                    </span>
                  </div>

                  <p className="font-serif italic text-slate-200 text-xs bg-slate-900/60 p-2.5 rounded-lg border border-slate-800">
                    "{detectedQuestion || 'Scanning question header from booklet page...'}"
                  </p>

                  {modelSummary && (
                    <div className="pt-1">
                      <span className="text-[10px] font-bold text-blue-400 block mb-0.5">
                        Model Answer Dimensions Extracted:
                      </span>
                      <p className="text-[11px] text-slate-400 line-clamp-2">
                        {modelSummary}
                      </p>
                    </div>
                  )}
                </div>
              )}

              {/* START BUTTON */}
              <div className="pt-2 flex items-center justify-between">
                <div className="text-[11px] text-slate-400">
                  {copyPages.length > 0 ? (
                    <span className="text-emerald-400 font-medium">
                      ✓ Ready to evaluate {copyPages.length} authentic page(s)
                    </span>
                  ) : (
                    <span>Please select a Student Copy PDF above to begin</span>
                  )}
                </div>

                <button
                  onClick={handleStartEvaluation}
                  disabled={copyPages.length === 0 || isProcessingCopy || isProcessingModel}
                  className="px-6 py-2.5 rounded-lg bg-red-600 hover:bg-red-500 text-xs font-bold text-white shadow-lg flex items-center space-x-2 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
                >
                  <Sparkles className="w-4 h-4 text-amber-300" />
                  <span>Start 4-Pass AI Evaluation Now</span>
                  <ArrowRight className="w-3.5 h-3.5 ml-1" />
                </button>
              </div>

            </div>
          )}

          {/* TAB 2: EXPLORE SAMPLE COPIES */}
          {activeTab === 'samples' && (
            <div className="space-y-3">
              <p className="text-slate-400 text-xs">
                Select an authentic UPSC answer copy from the LevelUp Mentorship Program (LMP):
              </p>

              <div className="space-y-2">
                {SAMPLE_QUESTIONS.map((q) => (
                  <div
                    key={q.qNumber}
                    onClick={() => {
                      onSelectSampleQuestion(q.qNumber);
                      onClose();
                    }}
                    className="p-3 rounded-xl bg-slate-800/60 border border-slate-700/60 hover:border-red-500/60 hover:bg-slate-800 cursor-pointer transition-all flex items-center justify-between group"
                  >
                    <div className="space-y-1 pr-3">
                      <div className="flex items-center space-x-2">
                        <span className="font-mono font-bold text-red-400">Q{q.qNumber}</span>
                        <span className="px-1.5 py-0.2 rounded bg-slate-700 text-slate-300 font-mono text-[10px]">
                          {q.maxMarks} Marks
                        </span>
                      </div>
                      <p className="font-serif text-slate-200 text-xs line-clamp-2">
                        {q.questionText}
                      </p>
                    </div>
                    <span className="text-xs font-semibold text-slate-400 group-hover:text-red-400 transition-colors flex items-center flex-shrink-0">
                      View Copy →
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

        </div>

      </div>
    </div>
  );
};
