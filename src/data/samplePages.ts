import { AnnotationItem } from '../types';

export interface BookletPageData {
  pageNumber: number;
  questionNumber?: number;
  questionText?: string;
  maxMarks?: number;
  title?: string;
  studentLines: string[];
  diagramLabel?: string;
  annotations: AnnotationItem[];
  imageBase64?: string; // Original scanned page image if uploaded
  pdfUrl?: string; // Original uploaded PDF url
  pdfPageNum?: number; // Page number in the original PDF
}

export const SAMPLE_PAGES: BookletPageData[] = [
  // Page 1: Cover Sheet
  {
    pageNumber: 1,
    title: "LevelUp Mentorship Program (LMP) - Test Booklet",
    studentLines: [
      "Name: MANAS ARORA",
      "Email: manasarora224@gmail.com",
      "Mode: Offline",
      "Time Allowed: 1.5 Hours       Total Marks: 125",
      "No. of Questions Attempted: 10",
      "Marks Obtained: 44.5 / 125 (Evaluated by Senior Faculty)",
      "",
      "QUESTION PAPER SPECIFIC INSTRUCTIONS:",
      "1. There are 10 questions printed in ENGLISH.",
      "2. All questions are compulsory.",
      "3. The number of marks carried by each question is indicated against it.",
      "4. Word limit in questions should be strictly adhered to."
    ],
    annotations: [
      {
        id: "cover-score",
        pageIndex: 0,
        xPercent: 78,
        yPercent: 36,
        widthPercent: 18,
        text: "Marks: 44.5 / 125",
        type: "mark"
      }
    ]
  },

  // Page 2: Evaluation Matrix & Summary
  {
    pageNumber: 2,
    title: "Evaluation Parameters & Mentor Summary Matrix",
    studentLines: [
      "EVALUATION PARAMETERS:",
      "• Attempts: [EXCELLENT ✓] Attempted all 10 questions within time limit.",
      "• Content Quality: [GOOD ✓] Core definitions accurate; needs deeper physical mechanisms.",
      "• Structure and Flow: [GOOD ✓] Clear headings and sub-headings utilized consistently.",
      "• Presentation: [GOOD ✓] Commendable hand-drawn sketch maps and flowcharts.",
      "• Language: [GOOD ✓] Crisp style; avoid casual abbreviations (e.g. W to E).",
      "",
      "STRENGTHS:",
      "- Crisp introductions and clear definitions [Q2, Q5, Q9].",
      "- Fair use of neat maps and diagrams [Q6, Q7, Q8].",
      "- Strong categorization and valid point generation [Q10].",
      "- Decent linkage to current events and laws [Q4, Q10].",
      "",
      "AREAS FOR IMPROVEMENT:",
      "- Address all core demands and directives strictly [Q1, Q3, Q4].",
      "- Rectify factual errors in core geographic concepts [Q3, Q4, Q8, Q9].",
      "- Substantiate points with specific geographical examples [Q1, Q2].",
      "- Ground conclusions strictly in the main theme [Q2, Q6, Q9]."
    ],
    annotations: [
      {
        id: "mat-1",
        pageIndex: 1,
        xPercent: 78,
        yPercent: 15,
        widthPercent: 20,
        text: "Total = 44.5/125\nGood overall effort.",
        type: "mark"
      }
    ]
  },

  // Page 3: Q1 - Page 1 of Answer (Jetstreams)
  {
    pageNumber: 3,
    questionNumber: 1,
    questionText: "Q1. Explain the mechanism of Jet Streams. Why do they occur near the tropopause? Discuss their relation with the horizontal temperature gradient. (10 Marks)",
    maxMarks: 10,
    title: "(1) Jetstreams Mechanism & Occurrence",
    studentLines: [
      "Jetstreams are very fast flowing winds having speed range 120-500 km/hr that generally flow in a meandering pattern in upper tropopause W to E in both hemisphere.",
      "",
      "Reasons why jetstreams occur near tropopause:",
      "(1) Maximum convective activity of air occurs in this region therefore ample amount of wind occurs.",
      "(2) Has least effect of frictional force especially in the upper tropopause.",
      "(3) Maximum coriolis force leads to deflection of wind to right or left depending upon the hemisphere.",
      "(4) High pressure and temperature gradient leads to stronger jetstream."
    ],
    diagramLabel: "Hand-drawn globe showing Sub-Polar Jet & Sub-Tropical Jet at tropopause",
    annotations: [
      {
        id: "q1-p3-1",
        pageIndex: 2,
        xPercent: 82,
        yPercent: 11,
        widthPercent: 16,
        text: 'Add "narrow bands" keyword. Mention 9-16 km height.',
        type: "suggestion",
        associatedText: "Jetstreams are very fast flowing winds having speed range 120-500 km/hr..."
      },
      {
        id: "q1-p3-2",
        pageIndex: 2,
        xPercent: 2,
        yPercent: 22,
        widthPercent: 15,
        text: "Dont use abbreviations for West East",
        type: "correction",
        associatedText: "W to E in both hemisphere"
      },
      {
        id: "q1-p3-3",
        pageIndex: 2,
        xPercent: 83,
        yPercent: 37,
        widthPercent: 16,
        text: "Incorrect concept in pt 1; convection stops at tropopause, it does not maximize",
        type: "correction",
        hasCross: true,
        associatedText: "Maximum convective activity of air occurs in this region..."
      },
      {
        id: "q1-p3-4",
        pageIndex: 2,
        xPercent: 83,
        yPercent: 51,
        widthPercent: 16,
        text: "✓ Valid point on friction.",
        type: "praise",
        hasCheckmark: true,
        associatedText: "Has least effect of frictional force..."
      },
      {
        id: "q1-p3-5",
        pageIndex: 2,
        xPercent: 83,
        yPercent: 64,
        widthPercent: 16,
        text: "- Add pressure-gradient development.\n- Mention gradient reversal above.",
        type: "suggestion",
        associatedText: "High pressure and temperature gradient leads to stronger jetstream"
      },
      {
        id: "q1-p3-6",
        pageIndex: 2,
        xPercent: 50,
        yPercent: 94,
        widthPercent: 38,
        text: "Mention latitudes as well (e.g. 30° & 60°)",
        type: "suggestion",
        associatedText: "sub-polar jet, sub-tropical jet"
      }
    ]
  },

  // Page 4: Q1 - Page 2 of Answer
  {
    pageNumber: 4,
    questionNumber: 1,
    questionText: "Q1 (Contd.) Relation with horizontal temperature gradient",
    maxMarks: 10,
    title: "Relation with horizontal temperature gradient",
    studentLines: [
      "[Flowchart: High Temperature on ground -> Low pressure on surface -> More convective activity -> High pressure in upper atmosphere -> Increased pressure gradient -> Increased pressure gradient force -> More deflection / more coriolis force -> Jetstream formation]",
      "",
      "Therefore jetstreams play crucial role in determining weather patterns, climatic events and in day to day life affecting flights & fuel efficiency."
    ],
    annotations: [
      {
        id: "q1-p4-1",
        pageIndex: 3,
        xPercent: 6,
        yPercent: 4,
        widthPercent: 88,
        text: "Missed gradient reversal above tropopause, thermal-wind relationship, and winter intensification of polar jet.",
        type: "demand_missed"
      },
      {
        id: "q1-p4-2",
        pageIndex: 3,
        xPercent: 82,
        yPercent: 14,
        widthPercent: 17,
        text: "✓ Good attempt at flowcharting.",
        type: "praise",
        hasCheckmark: true
      },
      {
        id: "q1-p4-3",
        pageIndex: 3,
        xPercent: 1,
        yPercent: 30,
        widthPercent: 15,
        text: "highly simplistic and misses contrasting air mass dynamics",
        type: "correction"
      },
      {
        id: "q1-p4-4",
        pageIndex: 3,
        xPercent: 78,
        yPercent: 25,
        widthPercent: 21,
        text: "Underexplained the horizontal temperature gradient relation; lacks specific geographical examples (e.g., Polar Jet winter intensification) to substantiate claims.",
        type: "suggestion"
      },
      {
        id: "q1-p4-5",
        pageIndex: 3,
        xPercent: 82,
        yPercent: 72,
        widthPercent: 17,
        text: "Generic end. Link to Indian monsoon (STWJ) or aviation routes specifically.",
        type: "suggestion"
      },
      {
        id: "q1-p4-6",
        pageIndex: 3,
        xPercent: 65,
        yPercent: 91,
        widthPercent: 18,
        text: "4/10",
        type: "mark"
      }
    ]
  },

  // Page 5: Q2 - Temperature Inversion
  {
    pageNumber: 5,
    questionNumber: 2,
    questionText: "Q2. What is Temperature Inversion? Discuss the geographical conditions conducive for its occurrence and its impact on local weather and air quality. (10 Marks)",
    maxMarks: 10,
    title: "(2) Temperature Inversion & Conducive Conditions",
    studentLines: [
      "Temperature inversion, also known as Negative Lapse Rate where due to certain conditions, temperature, instead of decreasing with altitude, increases with altitude.",
      "",
      "Geographical Conditions giving rise to Temperature Inversion:",
      "(1) Long winter nights - increased heat loss through terrestrial radiation than incoming solar radiation.",
      "(2) Clear cloudless skies - More loss of heat.",
      "(3) Slow movement of air / convection - Prevents mixing of air / heat transfer.",
      "(4) Presence of dry air near ground limits heat absorption.",
      "(+) Apart from this snow covered surface causes increased albedo & maximizes loss."
    ],
    diagramLabel: "Atmospheric column diagram showing Warm air sandwiched above cold ground air",
    annotations: [
      {
        id: "q2-p5-1",
        pageIndex: 4,
        xPercent: 83,
        yPercent: 11,
        widthPercent: 16,
        text: "✓ Good definition and clear supporting diagram.",
        type: "praise",
        hasCheckmark: true
      },
      {
        id: "q2-p5-2",
        pageIndex: 4,
        xPercent: 83,
        yPercent: 23,
        widthPercent: 16,
        text: 'Use the keyword "reverses normal tropospheric lapse rate".',
        type: "suggestion"
      },
      {
        id: "q2-p5-3",
        pageIndex: 4,
        xPercent: 83,
        yPercent: 48,
        widthPercent: 16,
        text: "✓ Good points on radiation inversion (clear skies, long nights, calm air).",
        type: "praise",
        hasCheckmark: true
      },
      {
        id: "q2-p5-4",
        pageIndex: 4,
        xPercent: 83,
        yPercent: 68,
        widthPercent: 16,
        text: "- Missed valley/basin air drainage effect.\n- Missed subsidence in high-pressure systems.",
        type: "suggestion"
      },
      {
        id: "q2-p5-5",
        pageIndex: 4,
        xPercent: 83,
        yPercent: 85,
        widthPercent: 16,
        text: "Substantiate with regions where this is common (e.g. Kashmir valleys, polar plains).",
        type: "suggestion"
      }
    ]
  },

  // Page 6: Q2 - Impact on Weather & Air Quality
  {
    pageNumber: 6,
    questionNumber: 2,
    questionText: "Q2 (Contd.) Impact on local weather and air quality",
    maxMarks: 10,
    title: "Impact on Local Weather Conditions and Air Quality",
    studentLines: [
      "(1) Stabilized condition of atmosphere; low level clouds & fog etc may form.",
      "(2) Inhibits precipitation.",
      "(3) Causes urban heat effect in areas with high pollution.",
      "(4) Increased global warming.",
      "(5) In certain cases may lead to thunderstorms and tornadoes.",
      "(6) May lead to trapping of aerosols, PM2.5 particulate matter leading to formation of smog and increased vulnerability to respiratory ailments.",
      "(7) May lead to varied temperature conditions and impacts weather predictability & pattern.",
      "",
      "Therefore, minimizing emission control and adopting clean means of transport should be prioritized to prevent the negative effects occurring due to temperature inversion in urban areas."
    ],
    annotations: [
      {
        id: "q2-p6-1",
        pageIndex: 5,
        xPercent: 2,
        yPercent: 18,
        widthPercent: 15,
        text: "Cite Delhi-NCR winter smog as a classic example.",
        type: "suggestion"
      },
      {
        id: "q2-p6-2",
        pageIndex: 5,
        xPercent: 2,
        yPercent: 33,
        widthPercent: 15,
        text: "Include agricultural impacts (frost damaging rabi crops).",
        type: "suggestion"
      },
      {
        id: "q2-p6-3",
        pageIndex: 5,
        xPercent: 78,
        yPercent: 42,
        widthPercent: 20,
        text: "Inversions cause stability, preventing thunderstorms.",
        type: "correction",
        hasCross: true
      },
      {
        id: "q2-p6-4",
        pageIndex: 5,
        xPercent: 2,
        yPercent: 58,
        widthPercent: 15,
        text: "✓ Good points on smog, PM2.5, and fog.",
        type: "praise",
        hasCheckmark: true
      },
      {
        id: "q2-p6-5",
        pageIndex: 5,
        xPercent: 15,
        yPercent: 93,
        widthPercent: 45,
        text: "Keep the conclusion tightly linked to the geographical theme.",
        type: "suggestion"
      },
      {
        id: "q2-p6-6",
        pageIndex: 5,
        xPercent: 75,
        yPercent: 91,
        widthPercent: 18,
        text: "4.5/10",
        type: "mark"
      }
    ]
  },

  // Page 9: Q4 - Tropical Cyclones
  {
    pageNumber: 9,
    questionNumber: 4,
    questionText: "Q4. Explain the conditions necessary for the origin of Tropical Cyclones. What factors govern their intensification? (10 Marks)",
    maxMarks: 10,
    title: "(4) Tropical Cyclones Origin & Conditions",
    studentLines: [
      "Tropical cyclones are disturbed weather condition occurring over oceans/sea surface due to low pressure which may become disastrous due to high wind speed. (May be cyclonic/anticyclonic)",
      "",
      "Factors responsible for origin:",
      "(1) Sea surface temperature - should be more than 27°C.",
      "(2) Presence of vertical wind shear.",
      "(3) Presence of coriolis force for rotation.",
      "(4) A weak pre-existing low pressure area over ocean.",
      "(5) Upper atmospheric divergence so that low pressure sustains.",
      "(6) Continuous source of latent heat - source of warm water (60-70m) below earth's surface."
    ],
    annotations: [
      {
        id: "q4-p9-1",
        pageIndex: 8,
        xPercent: 2,
        yPercent: 16,
        widthPercent: 15,
        text: 'Fair definition, but add "warm-core convective".',
        type: "suggestion"
      },
      {
        id: "q4-p9-2",
        pageIndex: 8,
        xPercent: 68,
        yPercent: 36,
        widthPercent: 28,
        text: "✓ Good detail on SST (>27°C) and depth (60-70m).",
        type: "praise",
        hasCheckmark: true
      },
      {
        id: "q4-p9-3",
        pageIndex: 8,
        xPercent: 55,
        yPercent: 48,
        widthPercent: 42,
        text: "MAJOR MISTAKE: Tropical cyclones require LOW vertical wind shear, not its presence. High shear destroys them.",
        type: "correction",
        hasCross: true
      },
      {
        id: "q4-p9-4",
        pageIndex: 8,
        xPercent: 83,
        yPercent: 64,
        widthPercent: 16,
        text: "✓ Good points on Coriolis and pre-existing low.",
        type: "praise",
        hasCheckmark: true
      },
      {
        id: "q4-p9-5",
        pageIndex: 8,
        xPercent: 62,
        yPercent: 83,
        widthPercent: 35,
        text: "You completely missed explaining the geographical distribution (e.g., Bay of Bengal, Gulf of Mexico). Always address every part of the question demand.",
        type: "demand_missed"
      },
      {
        id: "q4-p9-6",
        pageIndex: 8,
        xPercent: 15,
        yPercent: 92,
        widthPercent: 45,
        text: "Draw a diagram showing the vertical cross-section of a cyclone.",
        type: "suggestion"
      }
    ]
  },

  // Page 10: Q4 - Factors responsible for Intensification
  {
    pageNumber: 10,
    questionNumber: 4,
    questionText: "Q4 (Contd.) Factors responsible for intensification",
    maxMarks: 10,
    title: "Factors responsible for Intensification",
    studentLines: [
      "(1) Continuous supply of moisture due to deep warm water and sea surface temperature of >27°C.",
      "(2) When windy conditions are absent, cyclone intensifies.",
      "(3) High time spent on ocean surface -> more intensification before hitting the land -> lead to an intensified cyclone.",
      "(4) Strong upper air undisturbed divergence -> continuous pressure gradient -> may intensify cyclone.",
      "(5) Presence of Fujiwhara effect may strengthen a weak cyclone.",
      "(6) Strong Jetstreams may intensify cyclones.",
      "",
      "Therefore empirical studies should be done in other Indian states following Odisha model to enhance efficiency of cyclone predictability."
    ],
    annotations: [
      {
        id: "q4-p10-1",
        pageIndex: 9,
        xPercent: 82,
        yPercent: 16,
        widthPercent: 17,
        text: "✓ Good points on latent heat and upper divergence.",
        type: "praise",
        hasCheckmark: true
      },
      {
        id: "q4-p10-2",
        pageIndex: 9,
        xPercent: 83,
        yPercent: 62,
        widthPercent: 16,
        text: "Factual error: Jet streams create high shear and weaken tropical cyclones.",
        type: "correction",
        hasCross: true
      },
      {
        id: "q4-p10-3",
        pageIndex: 9,
        xPercent: 32,
        yPercent: 92,
        widthPercent: 28,
        text: "✓ Good DM reference (Odisha model).",
        type: "praise",
        hasCheckmark: true
      },
      {
        id: "q4-p10-4",
        pageIndex: 9,
        xPercent: 72,
        yPercent: 89,
        widthPercent: 20,
        text: "2.5/10",
        type: "mark"
      }
    ]
  }
];
