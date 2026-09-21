import React, { useState, useEffect } from 'react';
import { 
  DEFAULT_PROMPT_SETTINGS, 
  SAMPLE_SCORECARD, 
  SAMPLE_QUESTIONS, 
  SAMPLE_EVALUATION_Q1
} from './data/sampleCopy';
import { SAMPLE_PAGES, BookletPageData } from './data/samplePages';
import { Navbar } from './components/Navbar';
import { CopyViewer } from './components/CopyViewer';
import { TeacherDossier } from './components/TeacherDossier';
import { ScorecardModal } from './components/ScorecardModal';
import { PromptStudioModal } from './components/PromptStudioModal';
import { UploadModal } from './components/UploadModal';
import { ApiSettingsModal } from './components/ApiSettingsModal';
import { 
  AnnotationItem, 
  CopyScorecard, 
  EvaluatorPromptSettings, 
  QuestionEvaluation,
  ApiConnectionConfig,
  QuestionBreakdown,
  MultiPassStepStatus
} from './types';
import { generateAnnotatedPdf } from './utils/pdfGenerator';

const STORAGE_KEYS = {
  PROMPT_SETTINGS: 'upsc_evaluator_prompt_settings',
  API_CONFIG: 'upsc_evaluator_api_config',
  SHOW_TICKS: 'upsc_evaluator_show_ticks',
  SHOW_CROSSES: 'upsc_evaluator_show_crosses',
};

export default function App() {
  const [pages, setPages] = useState<BookletPageData[]>(SAMPLE_PAGES);
  const [currentPageIndex, setCurrentPageIndex] = useState<number>(2); // Start on Question 1 (Page 3)
  const [scorecard, setScorecard] = useState<CopyScorecard>(SAMPLE_SCORECARD);
  const [evaluation, setEvaluation] = useState<QuestionEvaluation>(SAMPLE_EVALUATION_Q1);

  // Persistent prompt settings from localStorage or fallback
  const [promptSettings, setPromptSettings] = useState<EvaluatorPromptSettings>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.PROMPT_SETTINGS);
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.warn('Failed to load saved prompt settings:', e);
    }
    return DEFAULT_PROMPT_SETTINGS;
  });

  // Persistent API credentials & Model selector
  const [apiConfig, setApiConfig] = useState<ApiConnectionConfig>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.API_CONFIG);
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.warn('Failed to load saved api config:', e);
    }
    return {
      apiKey: '',
      baseUrl: '',
      model: 'gemini-3.8-flash',
    };
  });
  
  // UI & Evaluation States
  const [isEvaluating, setIsEvaluating] = useState<boolean>(false);
  const [currentPassStep, setCurrentPassStep] = useState<number>(1);
  const [isExportingPdf, setIsExportingPdf] = useState<boolean>(false);
  const [zoomLevel, setZoomLevel] = useState<number>(100);
  const [isCustomCopy, setIsCustomCopy] = useState<boolean>(false);
  const [batchProgress, setBatchProgress] = useState<{ isRunning: boolean; currentPage: number; totalPages: number }>({
    isRunning: false,
    currentPage: 0,
    totalPages: 0,
  });
  const stopBatchRef = React.useRef<boolean>(false);

  // Annotation Checkmark & Cross display toggles with persistence
  const [showTicks, setShowTicks] = useState<boolean>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.SHOW_TICKS);
      return saved !== null ? JSON.parse(saved) : true;
    } catch {
      return true;
    }
  });

  const [showCrosses, setShowCrosses] = useState<boolean>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.SHOW_CROSSES);
      return saved !== null ? JSON.parse(saved) : true;
    } catch {
      return true;
    }
  });

  // Synchronize state changes to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.PROMPT_SETTINGS, JSON.stringify(promptSettings));
    } catch (e) {
      console.warn('Could not persist prompt settings to localStorage:', e);
    }
  }, [promptSettings]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.API_CONFIG, JSON.stringify(apiConfig));
    } catch (e) {
      console.warn('Could not persist api config to localStorage:', e);
    }
  }, [apiConfig]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.SHOW_TICKS, JSON.stringify(showTicks));
    } catch (e) {}
  }, [showTicks]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.SHOW_CROSSES, JSON.stringify(showCrosses));
    } catch (e) {}
  }, [showCrosses]);

  // Multi-Agent Audit state
  const [agentAudit, setAgentAudit] = useState<{
    agentDialogue?: { agent: string; message: string }[];
    issuesFound?: boolean;
    revisionsRecommended?: string[];
    consensusStatus?: string;
  }>({
    agentDialogue: [
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
    ],
    issuesFound: true,
    revisionsRecommended: [
      "Ensure student's claim on convection is marked with correction ✗",
      "Demands missed highlighted at top banner"
    ],
    consensusStatus: "APPROVED_WITH_CORRECTIONS"
  });

  // Granular 4-Pass State Machine & Retry Control
  const [passStatuses, setPassStatuses] = useState<MultiPassStepStatus[]>([
    {
      step: 1,
      title: "Content Extraction & OCR Ground Truth",
      shortLabel: "Pass 1: Extract",
      status: "completed",
      summary: "Transcribed lines, sub-headings, and cataloged student diagrams without judging.",
    },
    {
      step: 2,
      title: "Model Answer Benchmarking & Gap Audit",
      shortLabel: "Pass 2: Gap Audit",
      status: "completed",
      summary: "Identified what's right (strengths), what's wrong (errors), and missed syllabus keywords.",
    },
    {
      step: 3,
      title: "Human Teacher Margin Annotations",
      shortLabel: "Pass 3: Annotate",
      status: "completed",
      summary: "Placed red-pen margin comments and correction coordinates on the student canvas.",
    },
    {
      step: 4,
      title: "Objective Marking & Rubric Synthesis",
      shortLabel: "Pass 4: Scorecard",
      status: "completed",
      summary: "Assigned official marks and compiled the LevelUp Mentorship Program scorecard.",
    },
  ]);

  // Intermediate outputs stored so any step can be re-run independently
  const [cachedPass1, setCachedPass1] = useState<any>({
    extractedText: "Student handwritten text on Jet Streams and Western Disturbances.",
    bulletPoints: ["Tropopause inversion", "Subtropical westerly jet", "Coriolis force"],
    headingsIdentified: ["Mechanism of Jet Stream", "Role of Western Disturbance"],
  });
  const [cachedPass2, setCachedPass2] = useState<any>(null);
  const [cachedPass3, setCachedPass3] = useState<any>(null);

  // Modals
  const [isScorecardOpen, setIsScorecardOpen] = useState<boolean>(false);
  const [isPromptStudioOpen, setIsPromptStudioOpen] = useState<boolean>(false);
  const [isUploadModalOpen, setIsUploadModalOpen] = useState<boolean>(false);
  const [isApiSettingsOpen, setIsApiSettingsOpen] = useState<boolean>(false);

  // Questions state (allows dynamic questions from uploaded copies)
  const [questionsList, setQuestionsList] = useState<QuestionBreakdown[]>(SAMPLE_QUESTIONS);

  // Current active page and question
  const currentPage = pages[currentPageIndex] || pages[0];
  const currentQNumber = currentPage.questionNumber || 1;
  const currentQuestion = questionsList.find(q => q.qNumber === currentQNumber) || questionsList[0] || SAMPLE_QUESTIONS[0];

  // Annotation Handlers
  const handleUpdateAnnotation = (updated: AnnotationItem) => {
    setPages(prevPages => {
      return prevPages.map((pg, pIdx) => {
        if (pIdx !== currentPageIndex) return pg;
        return {
          ...pg,
          annotations: pg.annotations.map((a: AnnotationItem) => a.id === updated.id ? updated : a),
        };
      });
    });
  };

  const handleDeleteAnnotation = (id: string) => {
    setPages(prevPages => {
      return prevPages.map((pg, pIdx) => {
        if (pIdx !== currentPageIndex) return pg;
        return {
          ...pg,
          annotations: pg.annotations.filter((a: AnnotationItem) => a.id !== id),
        };
      });
    });
  };

  const handleAddAnnotation = (newAnnotData: Omit<AnnotationItem, 'id'>) => {
    const newAnnot: AnnotationItem = {
      ...newAnnotData,
      id: `custom-${Date.now()}`,
    };
    setPages(prevPages => {
      return prevPages.map((pg, pIdx) => {
        if (pIdx !== currentPageIndex) return pg;
        return {
          ...pg,
          annotations: [...pg.annotations, newAnnot],
        };
      });
    });
  };

  // Upload original copy image specifically for current page
  const handleUploadCopyImageForPage = (fileOrBase64: File | string) => {
    if (typeof fileOrBase64 === 'string') {
      setPages(prevPages => {
        return prevPages.map((pg, pIdx) => {
          if (pIdx !== currentPageIndex) return pg;
          return {
            ...pg,
            imageBase64: fileOrBase64,
          };
        });
      });
    } else {
      const reader = new FileReader();
      reader.onload = () => {
        const result = reader.result as string;
        setPages(prevPages => {
          return prevPages.map((pg, pIdx) => {
            if (pIdx !== currentPageIndex) return pg;
            return {
              ...pg,
              imageBase64: result,
            };
          });
        });
      };
      reader.readAsDataURL(fileOrBase64);
    }
  };

  // Helper to update individual step status in the passStatuses list
  const updatePassStatus = (
    stepNum: 1 | 2 | 3 | 4,
    updates: Partial<MultiPassStepStatus>
  ) => {
    setPassStatuses(prev =>
      prev.map(p => (p.step === stepNum ? { ...p, ...updates } : p))
    );
  };

  // PASS 1: Extraction & Ground Truth OCR
  const handleRunPass1 = async (targetPage?: BookletPageData, targetQuestion?: QuestionBreakdown): Promise<any> => {
    const activePage = targetPage || pages[currentPageIndex] || pages[0];
    const activeQNumber = activePage?.questionNumber || 1;
    const activeQuestion = targetQuestion || questionsList.find(q => q.qNumber === activeQNumber) || questionsList[0] || SAMPLE_QUESTIONS[0];

    const qText = activeQuestion?.questionText || activePage?.title || "UPSC Question";
    const studentText = (activePage?.studentLines || []).join("\n");

    updatePassStatus(1, { status: 'running', errorMessage: undefined });
    setCurrentPassStep(1);
    const start = Date.now();

    try {
      const res = await fetch('/api/evaluate/pass1', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          questionText: qText, 
          studentContent: studentText,
          imageBase64: activePage?.imageBase64,
          apiConfig,
        }),
      });

      if (!res.ok) {
        const errJson = await res.json().catch(() => ({}));
        throw new Error(errJson.error || `Pass 1 failed with status ${res.status}`);
      }

      const resData = await res.json();
      const pass1Data = resData.data || { extractedText: studentText, bulletPoints: activePage?.studentLines || [] };
      setCachedPass1(pass1Data);

      // Dynamically update question text, number, and marks if detected from this page
      if (pass1Data.detectedQuestion && pass1Data.detectedQuestion.trim()) {
        const qNum = pass1Data.detectedQuestionNumber || activeQNumber;
        const marks = pass1Data.detectedMaxMarks || activeQuestion?.maxMarks || 10;

        setPages(prev => prev.map((p, idx) => {
          const isTarget = targetPage ? p.pageNumber === targetPage.pageNumber : idx === currentPageIndex;
          if (!isTarget) return p;
          return {
            ...p,
            questionNumber: qNum,
            questionText: pass1Data.detectedQuestion,
            maxMarks: marks,
            title: `Q${qNum} (${marks}M): ${pass1Data.detectedQuestion.slice(0, 35)}...`,
          };
        }));

        setQuestionsList(prev => {
          const existing = prev.find(q => q.qNumber === qNum);
          if (existing) {
            return prev.map(q => q.qNumber === qNum ? { ...q, questionText: pass1Data.detectedQuestion, maxMarks: marks } : q);
          } else {
            return [...prev, {
              qNumber: qNum,
              questionText: pass1Data.detectedQuestion,
              maxMarks: marks,
              coreDirectives: ['Analyze', 'Explain', 'Discuss'],
              subDemands: [],
              modelAnswerSummary: activeQuestion?.modelAnswerSummary || '',
              modelAnswerKeyPoints: activeQuestion?.modelAnswerKeyPoints || [],
            }];
          }
        });
      }

      updatePassStatus(1, {
        status: 'completed',
        durationMs: Date.now() - start,
        summary: `Transcribed ${pass1Data.bulletPoints?.length || 0} candidate points & ${(pass1Data.headingsIdentified || []).length} headings.`,
        data: pass1Data,
      });

      return pass1Data;
    } catch (err: any) {
      console.error("Pass 1 error:", err);
      updatePassStatus(1, {
        status: 'error',
        errorMessage: err.message || 'Pass 1 failed. Click Retry Pass 1 to re-attempt.',
      });
      throw err;
    }
  };

  // PASS 2: Gap Analysis & Model Answer Benchmarking
  const handleRunPass2 = async (inputPass1?: any, targetPage?: BookletPageData, targetQuestion?: QuestionBreakdown): Promise<any> => {
    const activePage = targetPage || pages[currentPageIndex] || pages[0];
    const activeQNumber = activePage?.questionNumber || 1;
    const activeQuestion = targetQuestion || questionsList.find(q => q.qNumber === activeQNumber) || questionsList[0] || SAMPLE_QUESTIONS[0];

    const qText = activeQuestion?.questionText || activePage?.title || "UPSC Question";
    const modelAnswer = activeQuestion?.modelAnswerSummary || (activeQuestion?.modelAnswerKeyPoints || []).join("\n") || "";
    const p1 = inputPass1 || cachedPass1 || { extractedText: (activePage?.studentLines || []).join("\n") };

    updatePassStatus(2, { status: 'running', errorMessage: undefined });
    setCurrentPassStep(2);
    const start = Date.now();

    try {
      const res = await fetch('/api/evaluate/pass2', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          questionText: qText, 
          modelAnswer, 
          pass1Data: p1,
          apiConfig,
        }),
      });

      if (!res.ok) {
        const errJson = await res.json().catch(() => ({}));
        throw new Error(errJson.error || `Pass 2 failed with status ${res.status}`);
      }

      const resData = await res.json();
      const pass2Data = resData.data || { strengths: evaluation.strengths, conceptualErrors: evaluation.conceptualErrors };
      setCachedPass2(pass2Data);

      if (pass2Data.strengths || pass2Data.conceptualErrors) {
        setEvaluation(prev => ({
          ...prev,
          strengths: pass2Data.strengths || prev.strengths,
          conceptualErrors: pass2Data.conceptualErrors || prev.conceptualErrors,
          missingKeywords: pass2Data.missingKeywords || prev.missingKeywords,
        }));
      }

      updatePassStatus(2, {
        status: 'completed',
        durationMs: Date.now() - start,
        summary: `Found ${(pass2Data.strengths || []).length} strengths, ${(pass2Data.conceptualErrors || []).length} errors, and ${(pass2Data.missingKeywords || []).length} missing keywords.`,
        data: pass2Data,
      });

      return pass2Data;
    } catch (err: any) {
      console.error("Pass 2 error:", err);
      updatePassStatus(2, {
        status: 'error',
        errorMessage: err.message || 'Pass 2 failed. Click Retry Pass 2 to re-attempt.',
      });
      throw err;
    }
  };

  // PASS 3: Human Teacher Margin Annotations Placement
  const handleRunPass3 = async (inputPass1?: any, inputPass2?: any, targetPage?: BookletPageData, targetQuestion?: QuestionBreakdown): Promise<any> => {
    const activePage = targetPage || pages[currentPageIndex] || pages[0];
    const activeQNumber = activePage?.questionNumber || 1;
    const activeQuestion = targetQuestion || questionsList.find(q => q.qNumber === activeQNumber) || questionsList[0] || SAMPLE_QUESTIONS[0];

    const qText = activeQuestion?.questionText || activePage?.title || "UPSC Question";
    const p1 = inputPass1 || cachedPass1 || { extractedText: (activePage?.studentLines || []).join("\n") };
    const p2 = inputPass2 || cachedPass2 || { strengths: evaluation.strengths, conceptualErrors: evaluation.conceptualErrors };

    updatePassStatus(3, { status: 'running', errorMessage: undefined });
    setCurrentPassStep(3);
    const start = Date.now();

    try {
      const res = await fetch('/api/evaluate/pass3', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          questionText: qText,
          pass1Data: p1,
          pass2Data: p2,
          promptSettings,
          apiConfig,
        }),
      });

      if (!res.ok) {
        const errJson = await res.json().catch(() => ({}));
        throw new Error(errJson.error || `Pass 3 failed with status ${res.status}`);
      }

      const resData = await res.json();
      const pass3Data = resData.data;
      setCachedPass3(pass3Data);

      // Render annotations onto the target page
      if (pass3Data?.annotations && pass3Data.annotations.length > 0) {
        const targetIdx = targetPage ? (targetPage.pageNumber - 1) : currentPageIndex;
        const formattedAnnots: AnnotationItem[] = pass3Data.annotations.map((a: any, idx: number) => ({
          id: `ai-${Date.now()}-${idx}`,
          pageIndex: targetIdx,
          xPercent: a.xPercent || 82,
          yPercent: a.yPercent || (15 + idx * 15),
          widthPercent: a.widthPercent || 16,
          text: a.text,
          type: a.type || 'suggestion',
          hasCheckmark: a.hasCheckmark ?? true,
          hasCross: a.hasCross ?? false,
          associatedText: a.associatedText,
        }));

        setPages(prevPages =>
          prevPages.map((pg, pIdx) => {
            const isMatch = targetPage ? pg.pageNumber === targetPage.pageNumber : pIdx === currentPageIndex;
            if (!isMatch) return pg;
            return {
              ...pg,
              annotations: formattedAnnots,
            };
          })
        );
      }

      // Step 3.5: Run Agent Audit Cross-Talk
      try {
        const auditRes = await fetch('/api/evaluate/agent-audit', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            questionText: qText,
            studentContent: (activePage?.studentLines || []).join("\n"),
            pass1Data: p1,
            pass2Data: p2,
            annotations: pass3Data?.annotations || activePage?.annotations || [],
            promptSettings,
            apiConfig,
          }),
        });
        const auditData = await auditRes.json();
        if (auditData?.data) {
          setAgentAudit(auditData.data);
        }
      } catch (agentErr) {
        console.warn("Agent cross-talk audit fallback:", agentErr);
      }

      updatePassStatus(3, {
        status: 'completed',
        durationMs: Date.now() - start,
        summary: `Placed ${(pass3Data?.annotations || []).length} human margin notes with verified spatial coordinates.`,
        data: pass3Data,
      });

      return pass3Data;
    } catch (err: any) {
      console.error("Pass 3 error:", err);
      updatePassStatus(3, {
        status: 'error',
        errorMessage: err.message || 'Pass 3 failed. Click Retry Pass 3 to re-attempt.',
      });
      throw err;
    }
  };

  // PASS 4: Objective Marking & Scorecard Synthesis
  const handleRunPass4 = async (
    inputPass1?: any, 
    inputPass2?: any, 
    inputPass3?: any, 
    targetPage?: BookletPageData, 
    targetQuestion?: QuestionBreakdown, 
    targetCandidateName?: string
  ): Promise<any> => {
    const activePage = targetPage || pages[currentPageIndex] || pages[0];
    const activeQNumber = activePage?.questionNumber || 1;
    const activeQuestion = targetQuestion || questionsList.find(q => q.qNumber === activeQNumber) || questionsList[0] || SAMPLE_QUESTIONS[0];

    const qText = activeQuestion?.questionText || activePage?.title || "UPSC Question";
    const p1 = inputPass1 || cachedPass1 || { extractedText: (activePage?.studentLines || []).join("\n") };
    const p2 = inputPass2 || cachedPass2 || { strengths: evaluation.strengths, conceptualErrors: evaluation.conceptualErrors };
    const p3 = inputPass3 || cachedPass3 || { annotations: activePage?.annotations || [] };
    const candidateName = targetCandidateName || scorecard.candidateName || 'Candidate';

    updatePassStatus(4, { status: 'running', errorMessage: undefined });
    setCurrentPassStep(4);
    const start = Date.now();

    try {
      const res = await fetch('/api/evaluate/pass4', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          questionText: qText,
          maxMarks: activeQuestion?.maxMarks || 10,
          pass1Data: p1,
          pass2Data: p2,
          pass3Data: p3,
          candidateName,
          apiConfig,
        }),
      });

      if (!res.ok) {
        const errJson = await res.json().catch(() => ({}));
        throw new Error(errJson.error || `Pass 4 failed with status ${res.status}`);
      }

      const resData = await res.json();
      const pass4Data = resData.data;

      if (pass4Data?.marksAwarded) {
        setEvaluation(prev => ({
          ...prev,
          marksAwarded: pass4Data.marksAwarded,
          strengths: pass4Data.strengthsBulletPoints || prev.strengths,
          areasForImprovement: pass4Data.improvementBulletPoints || prev.areasForImprovement,
          mentorSummary: pass4Data.mentorOverallFeedback || prev.mentorSummary,
        }));

        if (pass4Data.parameters || pass4Data.marksAwarded) {
          setScorecard(prev => {
            const existingMarks = prev.questionWiseMarks || [];
            const exists = existingMarks.some(q => q.qNumber === activeQNumber);
            const updatedQuestionMarks = exists
              ? existingMarks.map(q => q.qNumber === activeQNumber ? { ...q, marksObtained: pass4Data.marksAwarded, comment: pass4Data.mentorOverallFeedback || 'Evaluated' } : q)
              : [...existingMarks, {
                  qNumber: activeQNumber,
                  maxMarks: activeQuestion?.maxMarks || 10,
                  marksObtained: pass4Data.marksAwarded,
                  comment: pass4Data.mentorOverallFeedback || 'Evaluated',
                }];

            const sumAwarded = updatedQuestionMarks.reduce((acc, q) => acc + (q.marksObtained || 0), 0);

            return {
              ...prev,
              parameters: pass4Data.parameters ? { ...prev.parameters, ...pass4Data.parameters } : prev.parameters,
              totalMarksAwarded: sumAwarded,
              questionWiseMarks: updatedQuestionMarks,
            };
          });
        }
      }

      updatePassStatus(4, {
        status: 'completed',
        durationMs: Date.now() - start,
        summary: `Awarded ${pass4Data.marksAwarded || evaluation.marksAwarded}/${activeQuestion?.maxMarks || 10} marks with LevelUp Mentorship scorecard.`,
        data: pass4Data,
      });

      return pass4Data;
    } catch (err: any) {
      console.error("Pass 4 error:", err);
      updatePassStatus(4, {
        status: 'error',
        errorMessage: err.message || 'Pass 4 failed. Click Retry Pass 4 to re-attempt.',
      });
      throw err;
    }
  };

  // FULL MULTI-PASS PIPELINE (runs 1 -> 2 -> 3 -> 4 seamlessly)
  const handleRunMultiPass = async (targetPage?: BookletPageData, targetQuestion?: QuestionBreakdown, targetCandidateName?: string) => {
    setIsEvaluating(true);
    try {
      const p1 = await handleRunPass1(targetPage, targetQuestion);
      const p2 = await handleRunPass2(p1, targetPage, targetQuestion);
      const p3 = await handleRunPass3(p1, p2, targetPage, targetQuestion);
      await handleRunPass4(p1, p2, p3, targetPage, targetQuestion, targetCandidateName);
    } catch (pipelineErr) {
      console.warn("Pipeline halted at step due to error. Individual step can be retried:", pipelineErr);
    } finally {
      setIsEvaluating(false);
    }
  };

  // Stop batch evaluation in progress
  const handleStopBatch = () => {
    stopBatchRef.current = true;
    setBatchProgress(prev => ({ ...prev, isRunning: false }));
  };

  // Sequentially evaluate all pages in the test booklet
  const handleEvaluateAllPages = async (targetPagesList?: BookletPageData[]) => {
    const pagesToEvaluate = targetPagesList || pages;
    if (!pagesToEvaluate || pagesToEvaluate.length === 0) return;

    stopBatchRef.current = false;
    setBatchProgress({
      isRunning: true,
      currentPage: 1,
      totalPages: pagesToEvaluate.length,
    });

    for (let i = 0; i < pagesToEvaluate.length; i++) {
      if (stopBatchRef.current) {
        console.log("Batch evaluation cancelled by user.");
        break;
      }

      setCurrentPageIndex(i);
      setBatchProgress({
        isRunning: true,
        currentPage: i + 1,
        totalPages: pagesToEvaluate.length,
      });

      const page = pagesToEvaluate[i];
      try {
        await handleRunMultiPass(page);
      } catch (err) {
        console.warn(`Error evaluating page ${i + 1}:`, err);
      }
    }

    setBatchProgress({
      isRunning: false,
      currentPage: pagesToEvaluate.length,
      totalPages: pagesToEvaluate.length,
    });
  };

  // Export PDF with standard ISO FreeText annotations AND original copy background overlay
  const handleExportPdf = async () => {
    try {
      setIsExportingPdf(true);
      const pdfBytes = await generateAnnotatedPdf({
        scorecard,
        pages: pages.map(p => ({
          pageNumber: p.pageNumber,
          title: p.title,
          studentLines: p.studentLines,
          diagramLabel: p.diagramLabel,
          originalImageBase64: p.imageBase64,
          annotations: p.annotations.map((a: AnnotationItem) => ({
            ...a,
            // Honor global toggles for checkmarks and crosses
            hasCheckmark: showTicks ? a.hasCheckmark : false,
            hasCross: showCrosses ? a.hasCross : false,
          })),
        })),
      });

      // Create download link
      const blob = new Blob([pdfBytes.buffer as ArrayBuffer], { type: 'application/pdf' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${scorecard.candidateName.replace(/\s+/g, '_')}_UPSC_Evaluated_Copy_FreeText.pdf`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error("PDF generation failed:", err);
      alert("Failed to export PDF. Please check console for details.");
    } finally {
      setIsExportingPdf(false);
    }
  };

  // Switch back to sample copy
  const handleLoadSampleCopy = () => {
    setIsCustomCopy(false);
    setPages(SAMPLE_PAGES);
    setCurrentPageIndex(2); // Jump to Q1
    setQuestionsList(SAMPLE_QUESTIONS);
    setScorecard(SAMPLE_SCORECARD);
    setEvaluation(SAMPLE_EVALUATION_Q1);
    setCachedPass1({
      extractedText: "Student handwritten text on Jet Streams and Western Disturbances.",
      bulletPoints: ["Tropopause inversion", "Subtropical westerly jet", "Coriolis force"],
      headingsIdentified: ["Mechanism of Jet Stream", "Role of Western Disturbance"],
    });
    setCachedPass2(null);
    setCachedPass3(null);
    setAgentAudit({
      agentDialogue: [
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
      ],
      issuesFound: true,
      revisionsRecommended: [
        "Ensure student's claim on convection is marked with correction ✗",
        "Demands missed highlighted at top banner"
      ],
      consensusStatus: "APPROVED_WITH_CORRECTIONS"
    });
  };

  // Jump to sample question
  const handleSelectSampleQuestion = (qNum: number) => {
    if (isCustomCopy || pages.length !== SAMPLE_PAGES.length) {
      handleLoadSampleCopy();
    }
    const targetPage = SAMPLE_PAGES.find(p => p.questionNumber === qNum);
    if (targetPage) {
      const idx = SAMPLE_PAGES.indexOf(targetPage);
      setCurrentPageIndex(idx);
    }
  };

  // Custom evaluation initiation with uploaded PDF pages or image
  const handleStartCustomEvaluation = (payload: {
    candidateName?: string;
    questionText: string;
    maxMarks: number;
    modelAnswer: string;
    studentContent: string;
    imageBase64?: string;
    pagesList?: { pageNumber: number; dataUrl: string }[];
  }) => {
    setIsCustomCopy(true);
    const candidateName = payload.candidateName?.trim() || 'Candidate Copy';
    const newQuestionBreakdown: QuestionBreakdown = {
      qNumber: 1,
      questionText: payload.questionText,
      maxMarks: payload.maxMarks,
      coreDirectives: ['Analyze', 'Explain', 'Discuss'],
      subDemands: [
        {
          id: 'd1',
          title: 'Core Conceptual Demands',
          description: 'Key dimensions outlined in model answer',
          weightage: 60,
        },
        {
          id: 'd2',
          title: 'Presentation & Diagrams',
          description: 'Maps, flowcharts, and structured presentation',
          weightage: 40,
        }
      ],
      modelAnswerKeyPoints: payload.modelAnswer ? payload.modelAnswer.split('\n').filter(Boolean) : [],
      modelAnswerSummary: payload.modelAnswer,
    };

    const isMultiPage = !!(payload.pagesList && payload.pagesList.length > 1);
    const initialTotalMarks = isMultiPage ? 250 : (payload.maxMarks || 10);

    let createdPages: BookletPageData[] = [];
    if (payload.pagesList && payload.pagesList.length > 0) {
      createdPages = payload.pagesList.map((pg, idx) => ({
        pageNumber: idx + 1,
        questionNumber: idx === 0 ? 1 : undefined,
        title: `Page ${idx + 1} of ${payload.pagesList!.length}`,
        imageBase64: pg.dataUrl,
        studentLines: [
          `Candidate answer copy page ${idx + 1}.`,
        ],
        annotations: [],
      }));
    } else {
      createdPages = [{
        pageNumber: 1,
        questionNumber: 1,
        questionText: payload.questionText,
        maxMarks: payload.maxMarks || 10,
        title: "Page 1",
        imageBase64: payload.imageBase64,
        studentLines: payload.studentContent ? payload.studentContent.split("\n") : [
          "Candidate copy submitted for evaluation.",
        ],
        annotations: [],
      }];
    }

    // Set new active copy: replace old pages with the user's uploaded copy
    setQuestionsList([newQuestionBreakdown]);
    setPages(createdPages);
    setCurrentPageIndex(0);

    // Reset scorecard completely for this candidate
    setScorecard({
      candidateName: candidateName,
      testTitle: isMultiPage ? `UPSC Test Booklet (${createdPages.length} Pages)` : `UPSC Mains Answer Evaluation`,
      date: new Date().toISOString().split('T')[0],
      totalMarksAwarded: 0,
      totalMaxMarks: initialTotalMarks,
      parameters: {
        attempts: 'Good',
        contentQuality: 'Average',
        structureAndFlow: 'Average',
        presentation: 'Average',
        language: 'Good',
      },
      questionWiseMarks: [],
      overallStrengths: [],
      overallImprovements: [],
      overallFeedback: isMultiPage 
        ? `Loaded ${createdPages.length}-page test booklet for ${candidateName}. The evaluator will automatically identify each question and its marks from each page header as you review.`
        : 'Awaiting AI multi-pass evaluation...',
    });

    // Reset evaluation state
    setEvaluation({
      qNumber: 1,
      marksAwarded: 0,
      maxMarks: 10,
      strengths: [],
      areasForImprovement: [],
      demandsAddressed: [],
      conceptualErrors: [],
      missingKeywords: [],
      annotations: [],
      mentorSummary: 'Initiating evaluation on candidate copy...',
    });

    // Reset intermediate audit states
    setCachedPass1(null);
    setCachedPass2(null);
    setCachedPass3(null);
    setAgentAudit({
      agentDialogue: [
        {
          agent: "Agent 1: Ground Truth Verifier",
          message: `Starting OCR verification on candidate answer copy (${candidateName})...`
        }
      ],
      issuesFound: false,
      revisionsRecommended: [],
      consensusStatus: "AUDIT_IN_PROGRESS"
    });

    // Run multi-pass immediately passing the new page, question, and candidate!
    setTimeout(() => {
      handleRunMultiPass(createdPages[0], newQuestionBreakdown, candidateName);
    }, 100);
  };

  return (
    <div className="flex flex-col h-screen bg-slate-950 text-slate-100 overflow-hidden font-sans">
      
      {/* Top Navbar */}
      <Navbar
        onRunMultiPass={() => handleRunMultiPass()}
        isEvaluating={isEvaluating}
        onOpenPromptStudio={() => setIsPromptStudioOpen(true)}
        onOpenScorecard={() => setIsScorecardOpen(true)}
        onOpenUpload={() => setIsUploadModalOpen(true)}
        onOpenApiSettings={() => setIsApiSettingsOpen(true)}
        onExportPdf={handleExportPdf}
        isExportingPdf={isExportingPdf}
        promptSettings={promptSettings}
        apiConfig={apiConfig}
        totalScore={scorecard.totalMarksAwarded}
        totalMaxMarks={scorecard.totalMaxMarks}
        currentPassStep={currentPassStep}
        candidateName={scorecard.candidateName}
        isCustomCopy={isCustomCopy}
        onLoadSampleCopy={handleLoadSampleCopy}
        onEvaluateAllPages={() => handleEvaluateAllPages()}
        onStopBatch={handleStopBatch}
        batchProgress={batchProgress}
        currentPageNumber={currentPageIndex + 1}
        totalPages={pages.length}
      />

      {/* Main Split Layout: Copy Viewer (Left) + Teacher Dossier (Right) */}
      <div className="flex-1 flex overflow-hidden">
        
        {/* Left: UPSC Answer Booklet & Margin Annotations */}
        <div className="flex-1 h-full min-w-0">
          <CopyViewer
            currentPage={currentPage}
            currentPageIndex={currentPageIndex}
            totalPages={pages.length}
            onPageChange={setCurrentPageIndex}
            onUpdateAnnotation={handleUpdateAnnotation}
            onDeleteAnnotation={handleDeleteAnnotation}
            onAddAnnotation={handleAddAnnotation}
            zoomLevel={zoomLevel}
            setZoomLevel={setZoomLevel}
            showTicks={showTicks}
            setShowTicks={setShowTicks}
            showCrosses={showCrosses}
            setShowCrosses={setShowCrosses}
            onUploadCopyImage={handleUploadCopyImageForPage}
            onExportPdf={handleExportPdf}
            isExportingPdf={isExportingPdf}
          />
        </div>

        {/* Right: Teacher Dossier, Scorecard Matrix, & Multi-Pass Anti-Hallucination Audit */}
        <div className="w-[420px] lg:w-[480px] xl:w-[520px] h-full flex-shrink-0">
          <TeacherDossier
            currentQuestion={currentQuestion}
            evaluation={evaluation}
            scorecard={scorecard}
            promptSettings={promptSettings}
            onUpdatePromptSettings={setPromptSettings}
            onRunMultiPass={handleRunMultiPass}
            isEvaluating={isEvaluating}
            activePassStep={currentPassStep}
            passStatuses={passStatuses}
            onRunPass1={handleRunPass1}
            onRunPass2={() => handleRunPass2()}
            onRunPass3={() => handleRunPass3()}
            onRunPass4={() => handleRunPass4()}
            agentAudit={agentAudit}
          />
        </div>

      </div>

      {/* Modals */}
      <ScorecardModal
        scorecard={scorecard}
        isOpen={isScorecardOpen}
        onClose={() => setIsScorecardOpen(false)}
        onExportPdf={handleExportPdf}
        isExportingPdf={isExportingPdf}
      />

      <PromptStudioModal
        isOpen={isPromptStudioOpen}
        onClose={() => setIsPromptStudioOpen(false)}
        settings={promptSettings}
        onSave={setPromptSettings}
      />

      <UploadModal
        isOpen={isUploadModalOpen}
        onClose={() => setIsUploadModalOpen(false)}
        onSelectSampleQuestion={handleSelectSampleQuestion}
        onLoadSampleCopy={handleLoadSampleCopy}
        onOpenApiSettings={() => setIsApiSettingsOpen(true)}
        apiConfig={apiConfig}
        onStartCustomEvaluation={handleStartCustomEvaluation}
      />

      <ApiSettingsModal
        isOpen={isApiSettingsOpen}
        onClose={() => setIsApiSettingsOpen(false)}
        config={apiConfig}
        onSave={setApiConfig}
      />

    </div>
  );
}
