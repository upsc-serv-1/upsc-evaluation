import { CopyScorecard, EvaluatorPromptSettings, QuestionBreakdown, QuestionEvaluation } from '../types';

export const DEFAULT_PROMPT_SETTINGS: EvaluatorPromptSettings = {
  persona: 'strict_senior',
  personaName: 'Senior UPSC Evaluator & Subject Mentor',
  systemPrompt: `You are a veteran UPSC Civil Services Mains evaluator and senior faculty at a premier IAS institute (like LevelUp IAS / ForumIAS / VisionIAS).
Your mission is to evaluate the student's answer copy with laser precision, benchmarking against the provided Model Answer and UPSC marking standards.
You write crisp, authentic handwritten-style margin annotations on the left/right margins. Your tone is that of an experienced, discerning teacher speaking directly to the aspirant.`,
  negativeConstraints: [
    'NEVER use generic AI compliments like "Overall, this is a comprehensive answer", "Your answer demonstrates a commendable grasp", or "Well articulated".',
    'NEVER write lengthy multi-sentence paragraphs in margin annotations. Keep margin notes punchy, concise, and direct (1-3 lines max, just like a teacher writes in red pen with limited space).',
    'NEVER hallucinate or claim the student wrote something they did not. If a point is missing, label it clearly as "Missed demand:" or "Missing core concept:".',
    'DO NOT ignore conceptual errors! If student states an incorrect scientific/factual premise (e.g. saying convection maximizes at tropopause, or tropical cyclones need high vertical wind shear), flag it immediately with a prominent correction.',
    'DO NOT award marks leniently. A 10-marker in UPSC typically scores between 2.5 and 5.5 (rarely 6). A 15-marker scores between 4.0 and 7.5. Grade strictly on demand fulfillment, core concepts, diagrams, and value addition.',
    'NEVER use passive, bureaucratic language. Use active teacher imperative phrases: "Add...", "Avoid...", "Cite...", "Incorrect concept in pt 1:", "Demands Missed:".',
    'Always point out missed directives (e.g., if question asked "To what extent", verify if candidate weighed both sides or just listed one-sided points).'
  ],
  customDirectives: [
    'Enforce standard UPSC geographical and constitutional keywords (e.g., "narrow bands", "9-16 km height", "solar dimming", "sensible heat vs latent heat", "Article 19(5)", "5th and 6th Schedules").',
    'Evaluate quality of maps and diagrams: check for proper labeling, latitudes, directional indicators, and relevance.',
    'Look for local and recent Indian examples (e.g., Delhi-NCR winter smog, Western Ghats, Odisha disaster management model, Uttarakhand/Assam UCC laws).',
    'Check if the conclusion is geographically or constitutionally grounded, rather than ending abruptly on a generic cliche.'
  ],
  teacherToneStyle: 'concise_margin',
  feedbackCount: 'balanced',
  feedbackFormats: ['margin_note', 'top_demand_callout', 'score_breakdown'],
  coordinateAnchorStrategy: 'smart_visual_margin'
};

export const SAMPLE_QUESTIONS: QuestionBreakdown[] = [
  {
    qNumber: 1,
    questionText: "Explain the mechanism of Jet Streams. Why do they occur near the tropopause? Discuss their relation with the horizontal temperature gradient. (10 Marks / 150 Words)",
    maxMarks: 10,
    coreDirectives: ["Explain mechanism", "Why near tropopause", "Relation with horizontal temperature gradient"],
    subDemands: [
      { id: "d1", title: "Definition & Characteristics", description: "Narrow meandering bands of high-speed westerly winds in upper troposphere (9-16 km height, 120-400 km/hr).", weightage: 20 },
      { id: "d2", title: "Why near Tropopause", description: "Upper tropospheric pressure gradient, thermal wind equation, absence of surface friction, tropopause break at cell boundaries.", weightage: 40 },
      { id: "d3", title: "Horizontal Temperature Gradient", description: "Steep pole-to-equator temperature gradient in mid-latitudes creates steep pressure gradient aloft; thermal wind balance; winter intensification.", weightage: 30 },
      { id: "d4", title: "Diagram & Value Addition", description: "Tricellular boundary diagram, latitudes (30° and 60°), link to weather/aviation/monsoon.", weightage: 10 }
    ],
    modelAnswerSummary: "Jet streams are fast flowing, narrow, meandering air currents in the upper troposphere (near tropopause at 9-16 km). They form due to steep horizontal temperature gradients between contrasting air masses (polar vs tropical) creating strong pressure gradients aloft via the thermal wind relation. They peak near the tropopause because horizontal temperature contrast is strongest in troposphere and reverses in stratosphere, combined with negligible friction.",
    modelAnswerKeyPoints: [
      "Definition: Narrow meandering bands, 9-16 km height, 120-400 km/hr, westerly flow in both hemispheres.",
      "Why near tropopause: Maximum accumulated pressure gradient from surface to tropopause; reversal of temperature gradient in stratosphere dampens winds above; zero surface friction; tropopause breaks at cell junctions.",
      "Horizontal temperature gradient: Strongest contrast across polar front (Polar Jet) and subtropical boundary (STWJ); thermal wind equation (dV/dz proportional to -dT/dy); winter intensification when temperature contrast is greatest.",
      "Diagram: Cross section showing polar jet at 60° (polar front break) and STWJ at 30° (Hadley-Ferrel break).",
      "Significance: Steers temperate cyclones, influences Indian monsoon onset and withdrawal, aviation flight times."
    ]
  },
  {
    qNumber: 2,
    questionText: "What is Temperature Inversion? Discuss the geographical conditions conducive for its occurrence and its impact on local weather and air quality. (10 Marks / 150 Words)",
    maxMarks: 10,
    coreDirectives: ["Define Temperature Inversion", "Geographical conditions", "Impact on local weather and air quality"],
    subDemands: [
      { id: "d1", title: "Definition", description: "Reversal of normal environmental lapse rate (temperature increases with height instead of decreasing).", weightage: 20 },
      { id: "d2", title: "Conditions Conducive", description: "Long winter nights, clear cloudless skies, calm/still air, dry air, snow-covered surface.", weightage: 40 },
      { id: "d3", title: "Weather & Air Quality Impact", description: "Atmospheric stability, dense fog/smog, trapping of pollutants/PM2.5, frost damage to crops, suppression of rainfall/convection.", weightage: 40 }
    ],
    modelAnswerSummary: "Temperature inversion is a meteorological phenomenon where temperature increases with altitude, reversing the normal environmental lapse rate. Occurs primarily during long winter nights with clear skies, calm air, and snow-cover (radiation inversion) or valley air drainage. Impact includes trapping pollutants (winter smog in Indo-Gangetic plain/Delhi), dense radiation fog, frost damaging agriculture, and suppressing convective rainfall.",
    modelAnswerKeyPoints: [
      "Definition: Reversal of normal tropospheric lapse rate; layer of warm air traps cooler dense air below.",
      "Conditions: Long winter nights (terrestrial radiation exceeds insolation), cloudless skies (unimpeded radiation loss), calm air (prevents vertical mixing), dry air (low absorption of outgoing longwave radiation), high albedo snow cover.",
      "Impacts on weather: Atmospheric stability, fog formation, frost in valleys, inhibition of vertical convection.",
      "Impacts on air quality: Trapping of aerosols and PM2.5 in shallow boundary layer; severe smog episodes (Delhi-NCR); respiratory health hazards."
    ]
  },
  {
    qNumber: 4,
    questionText: "Explain the conditions necessary for the origin of Tropical Cyclones. What factors govern their intensification? (10 Marks / 150 Words)",
    maxMarks: 10,
    coreDirectives: ["Conditions for origin", "Factors governing intensification"],
    subDemands: [
      { id: "d1", title: "Necessary Pre-conditions", description: "SST > 27°C, sufficient Coriolis force (5°-20° latitude), pre-existing weak low pressure, LOW vertical wind shear, high mid-tropospheric humidity.", weightage: 50 },
      { id: "d2", title: "Intensification Factors", description: "Continuous latent heat supply from warm ocean, upper-level divergence (evacuation of air), low vertical shear maintaining vertical column, friction-induced moisture convergence.", weightage: 40 },
      { id: "d3", title: "Distribution & Examples", description: "Bay of Bengal, Arabian Sea, Caribbean; vertical cross-section diagram showing eye, eyewall, and spiral rainbands.", weightage: 10 }
    ],
    modelAnswerSummary: "Tropical cyclones are intense low-pressure warm-core convective weather systems originating over tropical oceans. Origin requires SST > 27°C to depths of 60-70m, Coriolis force (absent at equator 0-5°), pre-existing low-level disturbance, LOW vertical wind shear (high shear shreds the vortex), and high relative humidity. Intensification relies on massive latent heat of condensation release, robust upper tropospheric divergence, and warm ocean transit.",
    modelAnswerKeyPoints: [
      "Crucial distinction: LOW vertical wind shear is vital! High wind shear tears apart the vertical convective structure.",
      "SST > 27°C over depth of 60m provides energy via latent heat of condensation.",
      "Coriolis force needed for cyclonic spin (deflection), hence they do not form within 0-5° of equator.",
      "Intensification: Upper-level anticyclonic divergence pumping out rising air, enabling deeper surface pressure drop; prolonged transit over warm ocean waters before landfall; Fujiwhara interaction when two cyclones interact.",
      "Diagram: Vertical structure showing eye, eyewall updrafts, anvil outflow, and descending air in eye."
    ]
  }
];

export const SAMPLE_SCORECARD: CopyScorecard = {
  candidateName: "Manas Arora",
  testTitle: "LevelUp Mentorship Program (LMP) - GS Paper 1 Physical Geography & Polity Test",
  date: "2026-09-21",
  totalMarksAwarded: 44.5,
  totalMaxMarks: 125,
  parameters: {
    attempts: "Excellent",
    contentQuality: "Good",
    structureAndFlow: "Good",
    presentation: "Good",
    language: "Good"
  },
  questionWiseMarks: [
    { qNumber: 1, maxMarks: 10, marksObtained: 4.0, comment: "Fair attempt. Missed thermal wind equation and gradient reversal above tropopause." },
    { qNumber: 2, maxMarks: 10, marksObtained: 4.5, comment: "Crisp definition and neat diagram. Missed subsidence inversion and valley air drainage." },
    { qNumber: 3, maxMarks: 10, marksObtained: 4.0, comment: "Factual error on Earth albedo (~30%, not 6%). Addressed aerosol scattering well." },
    { qNumber: 4, maxMarks: 10, marksObtained: 2.5, comment: "CRITICAL conceptual error: Tropical cyclones require LOW vertical wind shear, not presence of shear." },
    { qNumber: 5, maxMarks: 10, marksObtained: 3.5, comment: "Addressed NE communities well. Missing BEFR 1873 historical background and Art 19(5)." },
    { qNumber: 6, maxMarks: 15, marksObtained: 5.5, comment: "Good diagrams and coverage of inversion types. Avoid blaming global warming for localized inversions." },
    { qNumber: 7, maxMarks: 15, marksObtained: 5.5, comment: "Neat tricellular diagram. Better explain dry subtropical high pressure zones." },
    { qNumber: 8, maxMarks: 15, marksObtained: 6.0, comment: "Good world map. Rectify error on Westerlies; trade winds (offshore Easterlies) cause western desert aridity." },
    { qNumber: 9, maxMarks: 15, marksObtained: 6.0, comment: "Good source regions diagram. Conceptual error on cP air (it is dry cold, not snowfall causing unless modified)." },
    { qNumber: 10, maxMarks: 15, marksObtained: 6.5, comment: "Well-structured constitutional and social arguments. Excellent reference to Sarla Mudgal and Khursheed Ahmad cases." }
  ],
  overallStrengths: [
    "Crisp introductions and clear definitions [Q2, Q5, Q9].",
    "Fair use of neat maps and diagrams [Q6, Q7, Q8, Q9].",
    "Strong categorization and valid point generation [Q10].",
    "Decent linkage to current events and laws [Q4, Q10]."
  ],
  overallImprovements: [
    "Address all core demands and directives strictly [Q1, Q3, Q4].",
    "Rectify factual errors in core geographic concepts [Q3, Q4, Q8, Q9].",
    "Substantiate points with specific geographical examples [Q1, Q2].",
    "Ground conclusions strictly in the main theme [Q2, Q6, Q9]."
  ],
  overallFeedback: "Fair effort moving in the right direction. Prioritize conceptual accuracy over generic points now. Rectify the major misconception regarding vertical wind shear in tropical cyclones and albedo percentages. Keep writing and revising core syllabus concepts."
};

export const SAMPLE_EVALUATION_Q1: QuestionEvaluation = {
  qNumber: 1,
  marksAwarded: 4.0,
  maxMarks: 10,
  strengths: [
    "Good attempt at flowcharting for the pressure gradient mechanism.",
    "Correctly noted the role of Coriolis force in wind deflection.",
    "Valid observation regarding absence of surface frictional drag in upper atmosphere."
  ],
  areasForImprovement: [
    "Rectify conceptual error in Point 1: Convection stops at the tropopause, it does not maximize there.",
    "Include the 'narrow bands' keyword and specify exact altitude range (9-16 km).",
    "Explain the thermal wind relation and why the horizontal temperature gradient reverses above the tropopause.",
    "Ground conclusion with specific examples (e.g. Sub-Tropical Westerly Jet link to Indian monsoon or aviation flight routes)."
  ],
  demandsAddressed: [
    { demand: "Mechanism of Jet Streams", status: "partially", notes: "Explained pressure and Coriolis deflection, but missed thermal wind relationship." },
    { demand: "Why occur near Tropopause", status: "partially", notes: "Identified low friction, but erred on convective activity maximizing at tropopause." },
    { demand: "Relation with Horizontal Temperature Gradient", status: "missed", notes: "Underexplained; lacks specific geographical examples like Polar Jet winter intensification." }
  ],
  conceptualErrors: [
    "Point 1 states maximum convective activity occurs at tropopause: Incorrect. Convection is capped by the tropopause inversion lid.",
    "Simplified flowchart omits contrasting air mass dynamics and temperature gradient reversal aloft."
  ],
  missingKeywords: ["Narrow bands", "9-16 km height", "Thermal wind equation", "Polar front", "Sub-Tropical Westerly Jet (STWJ)", "Aviation jet streams"],
  annotations: [
    {
      id: "a-p3-1",
      pageIndex: 2, // Page 3 in booklet (0-based: 2)
      xPercent: 82,
      yPercent: 12,
      widthPercent: 16,
      text: 'Add "narrow bands" keyword. Mention 9-16 km height.',
      type: "suggestion",
      associatedText: "Jetstreams are very fast flowing winds having speed range 120-500 km/hr..."
    },
    {
      id: "a-p3-2",
      pageIndex: 2,
      xPercent: 2,
      yPercent: 24,
      widthPercent: 15,
      text: "Dont use abbreviations for West East",
      type: "correction",
      associatedText: "W to E in both hemisphere"
    },
    {
      id: "a-p3-3",
      pageIndex: 2,
      xPercent: 83,
      yPercent: 39,
      widthPercent: 16,
      text: "Incorrect concept in pt 1; convection stops at tropopause, it does not maximize",
      type: "correction",
      hasCross: true,
      associatedText: "Maximum convective activity of air occurs in this region..."
    },
    {
      id: "a-p3-4",
      pageIndex: 2,
      xPercent: 83,
      yPercent: 52,
      widthPercent: 16,
      text: "- Valid point on friction.",
      type: "praise",
      hasCheckmark: true,
      associatedText: "Has least effect of frictional force especially in the upper tropopause"
    },
    {
      id: "a-p3-5",
      pageIndex: 2,
      xPercent: 83,
      yPercent: 62,
      widthPercent: 16,
      text: "- Add pressure-gradient development.\n- Mention gradient reversal above.",
      type: "suggestion",
      associatedText: "High pressure and temperature gradient leads to stronger jetstream"
    },
    {
      id: "a-p3-6",
      pageIndex: 2,
      xPercent: 55,
      yPercent: 95,
      widthPercent: 35,
      text: "Mention latitudes as well",
      type: "suggestion",
      associatedText: "sub-polar jet, sub-tropical jet, equator"
    },
    {
      id: "a-p4-1",
      pageIndex: 3, // Page 4 in booklet (0-based: 3)
      xPercent: 6,
      yPercent: 4,
      widthPercent: 88,
      text: "Demands Missed: Missed gradient reversal above tropopause, thermal-wind relationship, and winter intensification of polar jet.",
      type: "demand_missed"
    },
    {
      id: "a-p4-2",
      pageIndex: 3,
      xPercent: 83,
      yPercent: 15,
      widthPercent: 16,
      text: "- Good attempt at flowcharting.",
      type: "praise",
      hasCheckmark: true,
      associatedText: "Relation with horizontal temperature gradient flowchart"
    },
    {
      id: "a-p4-3",
      pageIndex: 3,
      xPercent: 1,
      yPercent: 32,
      widthPercent: 15,
      text: "highly simplistic and misses contrasting air mass dynamics",
      type: "correction",
      associatedText: "More convective activity -> high pressure in upper atmosphere..."
    },
    {
      id: "a-p4-4",
      pageIndex: 3,
      xPercent: 78,
      yPercent: 24,
      widthPercent: 21,
      text: "Underexplained the horizontal temperature gradient relation; lacks specific geographical examples (e.g., Polar Jet winter intensification) to substantiate claims.",
      type: "suggestion"
    },
    {
      id: "a-p4-5",
      pageIndex: 3,
      xPercent: 82,
      yPercent: 74,
      widthPercent: 17,
      text: "Generic end. Link to Indian monsoon (STWJ) or aviation routes specifically.",
      type: "suggestion",
      associatedText: "Therefore jetstreams play crucial role in determining weather patterns..."
    },
    {
      id: "a-p4-6",
      pageIndex: 3,
      xPercent: 65,
      yPercent: 91,
      widthPercent: 18,
      text: "4/10",
      type: "mark"
    }
  ],
  mentorSummary: "The candidate shows an intuitive grasp of jet stream speeds and Coriolis deflection, and made a commendable effort to structure the answer with diagrams and a flowchart. However, the explanation of the horizontal temperature gradient was too simplistic and lacked the thermal wind relation. Rectify the misconception in Point 1 regarding convection at the tropopause. Always ground conclusions with specific UPSC applications like the Indian Monsoon (STWJ)."
};
