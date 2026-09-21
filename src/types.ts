export interface AnnotationItem {
  id: string;
  pageIndex: number; // 0-based page index
  xPercent: number; // 0 - 100% across the page width
  yPercent: number; // 0 - 100% from top of page
  widthPercent?: number; // width in percent
  text: string;
  type: 'correction' | 'praise' | 'suggestion' | 'demand_missed' | 'mark';
  hasCheckmark?: boolean;
  hasCross?: boolean;
  associatedText?: string; // student answer quote or concept
  editedByUser?: boolean;
}

export interface QuestionBreakdown {
  qNumber: number;
  questionText: string;
  maxMarks: number;
  coreDirectives: string[]; // e.g. ["Examine", "Discuss", "To what extent"]
  subDemands: {
    id: string;
    title: string;
    description: string;
    weightage: number; // percentage
  }[];
  modelAnswerSummary: string;
  modelAnswerKeyPoints: string[];
}

export interface StudentPageAnalysis {
  pageIndex: number;
  qNumber: number;
  extractedText: string;
  headingsIdentified: string[];
  pointsCount: number;
  hasDiagram: boolean;
  diagramDescription?: string;
  hasFlowchart: boolean;
  flowchartDescription?: string;
}

export interface GapAnalysisItem {
  category: 'strength' | 'error' | 'missed_demand' | 'missing_keyword';
  title: string;
  description: string;
  studentQuote?: string;
  modelCorrection?: string;
  severity?: 'critical' | 'moderate' | 'minor';
}

export interface QuestionEvaluation {
  qNumber: number;
  marksAwarded: number;
  maxMarks: number;
  strengths: string[];
  areasForImprovement: string[];
  demandsAddressed: { demand: string; status: 'fully' | 'partially' | 'missed'; notes: string }[];
  conceptualErrors: string[];
  missingKeywords: string[];
  annotations: AnnotationItem[];
  mentorSummary: string;
}

export interface CopyScorecard {
  candidateName: string;
  testTitle: string;
  date: string;
  totalMarksAwarded: number;
  totalMaxMarks: number;
  parameters: {
    attempts: 'Excellent' | 'Good' | 'Average' | 'Below Average';
    contentQuality: 'Excellent' | 'Good' | 'Average' | 'Below Average';
    structureAndFlow: 'Excellent' | 'Good' | 'Average' | 'Below Average';
    presentation: 'Excellent' | 'Good' | 'Average' | 'Below Average';
    language: 'Excellent' | 'Good' | 'Average' | 'Below Average';
  };
  questionWiseMarks: {
    qNumber: number;
    maxMarks: number;
    marksObtained: number;
    comment: string;
  }[];
  overallStrengths: string[];
  overallImprovements: string[];
  overallFeedback: string;
}

export interface EvaluatorPromptSettings {
  persona: 'strict_senior' | 'constructive_mentor' | 'keyword_focused' | 'custom';
  personaName: string;
  systemPrompt: string;
  negativeConstraints: string[]; // "What NOT to do"
  customDirectives: string[];
  teacherToneStyle: 'concise_margin' | 'detailed_academic' | 'bullet_actionable';
  // Feedback Volume & Format preferences
  feedbackCount: 'minimal_strict' | 'balanced' | 'exhaustive'; // minimal (2-4 notes), balanced (4-7), exhaustive (8-12)
  feedbackFormats: ('margin_note' | 'top_demand_callout' | 'score_breakdown' | 'underlining_comment')[];
  coordinateAnchorStrategy: 'smart_visual_margin' | 'line_snapped' | 'strict_right_margin';
}

export interface ApiConnectionConfig {
  provider?: 'gemini' | 'openai_compatible';
  apiKey: string;
  baseUrl: string;
  model: string;
  customModel?: string;
}

export interface MultiPassStepStatus {
  step: 1 | 2 | 3 | 4 | 5;
  title: string;
  shortLabel: string;
  status: 'idle' | 'running' | 'completed' | 'error';
  summary?: string;
  errorMessage?: string;
  durationMs?: number;
  data?: any;
}
