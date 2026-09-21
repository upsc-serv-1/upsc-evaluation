import express from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI, Type } from '@google/genai';
import dotenv from 'dotenv';

dotenv.config();

interface DynamicApiConfig {
  provider?: 'gemini' | 'openai_compatible';
  apiKey?: string;
  baseUrl?: string;
  model?: string;
  customModel?: string;
}

// ---------------------------------------------------------------------------
// Unified AI Generation Helper: Supports both Gemini & OpenAI-compatible
// ---------------------------------------------------------------------------
async function generateAiJson(params: {
  apiConfig?: DynamicApiConfig;
  prompt: string;
  imageBase64?: string;
  systemInstruction?: string;
  schema?: any;
}): Promise<any> {
  const { apiConfig, prompt, imageBase64, systemInstruction, schema } = params;
  const provider = apiConfig?.provider || 'gemini';

  // 1. OPENAI-COMPATIBLE WORKFLOW
  if (provider === 'openai_compatible') {
    const rawKey = apiConfig?.apiKey?.trim() || process.env.OPENAI_API_KEY || '';
    if (!rawKey) {
      throw new Error('OpenAI API Key is required. Please enter your API key in the "API / Model" settings modal.');
    }

    let baseUrl = (apiConfig?.baseUrl?.trim() || 'https://api.openai.com/v1').replace(/\/+$/, '');
    // If user provided a base URL without /v1, and it's standard OpenAI or OpenRouter, append /v1 if missing
    if (!baseUrl.endsWith('/v1') && !baseUrl.includes('/chat/completions')) {
      if (baseUrl.includes('openai.com') || baseUrl.includes('openrouter.ai') || baseUrl.includes('groq.com') || baseUrl.includes('deepseek.com')) {
        baseUrl = `${baseUrl}/v1`;
      }
    }

    const endpoint = baseUrl.endsWith('/chat/completions') ? baseUrl : `${baseUrl}/chat/completions`;
    const requestedModel = apiConfig?.customModel?.trim() || apiConfig?.model || 'gpt-4o';

    const messages: any[] = [];
    if (systemInstruction) {
      messages.push({ role: 'system', content: systemInstruction });
    }

    // Build user content (text + optional image)
    if (imageBase64) {
      const imageUrl = imageBase64.startsWith('data:')
        ? imageBase64
        : `data:image/jpeg;base64,${imageBase64}`;

      messages.push({
        role: 'user',
        content: [
          { type: 'text', text: prompt },
          {
            type: 'image_url',
            image_url: { url: imageUrl, detail: 'high' }
          }
        ]
      });
    } else {
      messages.push({ role: 'user', content: prompt });
    }

    const bodyPayload: any = {
      model: requestedModel,
      messages,
      response_format: { type: 'json_object' },
      temperature: 0.2,
    };

    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${rawKey}`,
    };

    // If using OpenRouter, add optional site identification headers
    if (baseUrl.includes('openrouter.ai')) {
      headers['HTTP-Referer'] = 'https://ai.studio';
      headers['X-Title'] = 'UPSC Test Copy Evaluator';
    }

    const resp = await fetch(endpoint, {
      method: 'POST',
      headers,
      body: JSON.stringify(bodyPayload),
    });

    if (!resp.ok) {
      const errText = await resp.text();
      let parsedErr: any = null;
      try {
        parsedErr = JSON.parse(errText);
      } catch {}
      const errMsg = parsedErr?.error?.message || errText || `OpenAI API returned status ${resp.status}`;
      throw new Error(`OpenAI API error (${resp.status}): ${errMsg}`);
    }

    const data: any = await resp.json();
    const rawContent = data.choices?.[0]?.message?.content || '{}';
    try {
      // Remove any markdown code block wrappers if model output ```json ... ```
      const cleaned = rawContent.replace(/^```json\s*/i, '').replace(/```\s*$/, '').trim();
      return JSON.parse(cleaned);
    } catch {
      return { raw: rawContent };
    }
  }

  // 2. NATIVE GOOGLE GEMINI WORKFLOW
  const geminiKey = apiConfig?.apiKey?.trim() || process.env.GEMINI_API_KEY;
  const geminiBaseUrl = apiConfig?.baseUrl?.trim() || process.env.GEMINI_BASE_URL;

  const clientOptions: any = {
    apiKey: geminiKey,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      },
    },
  };

  if (geminiBaseUrl) {
    clientOptions.baseUrl = geminiBaseUrl;
  }

  const ai = new GoogleGenAI(clientOptions);
  
  // Resolve model name
  const allowedGemini = ['gemini-3.8-flash', 'gemini-3.8-pro', 'gemini-2.5-flash', 'gemini-2.5-pro'];
  const geminiModel = apiConfig?.model && allowedGemini.includes(apiConfig.model) ? apiConfig.model : 'gemini-3.8-flash';

  const parts: any[] = [];
  if (imageBase64) {
    parts.push({
      inlineData: {
        mimeType: 'image/jpeg',
        data: imageBase64.replace(/^data:image\/\w+;base64,/, ''),
      },
    });
  }

  const fullPrompt = systemInstruction ? `${systemInstruction}\n\n${prompt}` : prompt;
  parts.push({ text: fullPrompt });

  const genConfig: any = {
    responseMimeType: 'application/json',
  };
  if (schema) {
    genConfig.responseSchema = schema;
  }

  const response = await ai.models.generateContent({
    model: geminiModel,
    contents: parts.length === 1 ? parts[0].text : { parts },
    config: genConfig,
  });

  return JSON.parse(response.text || '{}');
}

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json({ limit: '50mb' }));

  // Health check
  app.get('/api/health', (req, res) => {
    res.json({ 
      status: 'ok', 
      hasGeminiApiKey: !!process.env.GEMINI_API_KEY,
      baseUrl: process.env.GEMINI_BASE_URL || 'default',
    });
  });

  // AUTO-PARSE UPLOADED COPY: Read printed Question, Max Marks, Candidate Details from first page
  app.post('/api/parse-copy', async (req, res) => {
    try {
      const { imageBase64, rawText, apiConfig } = req.body;

      const prompt = `You are an expert UPSC document processor.
Examine this uploaded UPSC candidate booklet page (image or raw text).
Extract:
1. "questionText": The exact printed UPSC question text (including word limit and marks if printed, e.g. "Explain the mechanism of Jet Streams... (10 Marks / 150 Words)"). If it's a cover sheet, find Question 1. If not found, write an accurate summary.
2. "maxMarks": The marks carried by the question (default 10 if not found, or 15 or 20).
3. "candidateName": Candidate's name if written on booklet (default "UPSC Candidate").
4. "questionNumber": Question number (default 1).
5. "briefSummary": Brief 1-sentence description of the question topic.

Return pure JSON.`;

      const schema = {
        type: Type.OBJECT,
        properties: {
          questionText: { type: Type.STRING },
          maxMarks: { type: Type.NUMBER },
          candidateName: { type: Type.STRING },
          questionNumber: { type: Type.NUMBER },
          briefSummary: { type: Type.STRING },
        },
        required: ['questionText', 'maxMarks'],
      };

      const parsed = await generateAiJson({
        apiConfig,
        prompt,
        imageBase64,
        schema,
      });

      res.json({ success: true, data: parsed });
    } catch (error: any) {
      console.error('Auto parse copy error:', error);
      res.status(500).json({ error: error.message || 'Auto-parsing copy failed' });
    }
  });

  // AUTO-PARSE MODEL ANSWER PDF: Extract key points and core demands from model answer document
  app.post('/api/parse-model-answer', async (req, res) => {
    try {
      const { modelAnswerText, imageBase64, questionText, apiConfig } = req.body;

      const prompt = `You are a Senior UPSC Faculty Member preparing the evaluation benchmark.
Analyze the attached Model Answer document / PDF text.
${questionText ? `Benchmark specifically for Question: "${questionText}"` : ''}

Model Answer Document Content:
${modelAnswerText || 'Please read from attached image/document'}

Extract and synthesize:
1. "coreKeywords": Key technical geographical, constitutional, or economic terms expected (e.g. "thermal wind relation", "tropopause break", "inversion layer").
2. "essentialDemands": List of 3-5 sub-demands that MUST be answered.
3. "diagramsExpected": Diagrams or maps the candidate should draw.
4. "modelAnswerSummary": A concise 3-4 sentence standard model answer summary for grading.
5. "keyPoints": Bullet points of core content.

Return pure JSON.`;

      const schema = {
        type: Type.OBJECT,
        properties: {
          coreKeywords: { type: Type.ARRAY, items: { type: Type.STRING } },
          essentialDemands: { type: Type.ARRAY, items: { type: Type.STRING } },
          diagramsExpected: { type: Type.ARRAY, items: { type: Type.STRING } },
          modelAnswerSummary: { type: Type.STRING },
          keyPoints: { type: Type.ARRAY, items: { type: Type.STRING } },
        },
        required: ['coreKeywords', 'essentialDemands', 'modelAnswerSummary', 'keyPoints'],
      };

      const parsed = await generateAiJson({
        apiConfig,
        prompt,
        imageBase64,
        schema,
      });

      res.json({ success: true, data: parsed });
    } catch (error: any) {
      console.error('Parse model answer error:', error);
      res.status(500).json({ error: error.message || 'Parsing model answer failed' });
    }
  });

  // PASS 1: Extraction & Transcription (Anti-Hallucination Grounding)
  app.post('/api/evaluate/pass1', async (req, res) => {
    try {
      const { questionText, studentContent, imageBase64, apiConfig } = req.body;

      const promptText = `You are a strict UPSC Mains copy evaluator performing PASS 1: TRANSCRIPTION & CONTENT EXTRACTION.
Your goal is to extract what the student ACTUALLY wrote without judging yet. Do NOT hallucinate points that are absent.

Question:
"${questionText || 'Not specified'}"

Student handwritten response (or refer to image):
"${studentContent || 'Please extract from image'}"

Provide a structured JSON breakdown with the following keys:
- "extractedText": (string) line by line transcription of student's answer.
- "headingsIdentified": (array of strings) list of main headings/underlined sections written by student.
- "bulletPoints": (array of strings) list of points student formulated.
- "diagramsIdentified": (array of strings) list of maps, diagrams, or flowcharts drawn by student and what they depict.
- "initialObservations": (string) concise notes on legibility, formatting, or shorthand abbreviations used.`;

      const schema = {
        type: Type.OBJECT,
        properties: {
          extractedText: { type: Type.STRING },
          headingsIdentified: { type: Type.ARRAY, items: { type: Type.STRING } },
          bulletPoints: { type: Type.ARRAY, items: { type: Type.STRING } },
          diagramsIdentified: { type: Type.ARRAY, items: { type: Type.STRING } },
          initialObservations: { type: Type.STRING },
        },
        required: ['extractedText', 'bulletPoints', 'headingsIdentified'],
      };

      const parsed = await generateAiJson({
        apiConfig,
        prompt: promptText,
        imageBase64,
        schema,
      });

      res.json({ success: true, step: 1, data: parsed });
    } catch (error: any) {
      console.error('Pass 1 error:', error);
      res.status(500).json({ error: error.message || 'Pass 1 extraction failed' });
    }
  });

  // PASS 2: Model Answer Comparison & Conceptual Gap Analysis
  app.post('/api/evaluate/pass2', async (req, res) => {
    try {
      const { questionText, modelAnswer, pass1Data, apiConfig } = req.body;

      const prompt = `You are an elite UPSC faculty member performing PASS 2: MODEL ANSWER BENCHMARK & GAP AUDIT.

Question:
${questionText}

Standard Model Answer Key Points:
${modelAnswer || 'Use standard UPSC CSE Mains syllabus knowledge for this subject.'}

Student's Actual Content Extracted (Pass 1):
${JSON.stringify(pass1Data, null, 2)}

Audit Requirements:
1. Compare student answer against the core demands of the question and the model answer.
2. Identify which core demands were addressed vs. completely missed.
3. Identify conceptual errors, inaccurate mechanisms, or faulty assertions.
4. Identify strengths and valid points.
5. List specific keywords, case studies, or diagrams that were absent.

Provide JSON output with keys:
- "demandsMet": array of strings
- "demandsMissed": array of strings
- "conceptualErrors": array of strings
- "strengths": array of strings
- "missingKeywords": array of strings
- "diagramQualityAudit": string`;

      const schema = {
        type: Type.OBJECT,
        properties: {
          demandsMet: { type: Type.ARRAY, items: { type: Type.STRING } },
          demandsMissed: { type: Type.ARRAY, items: { type: Type.STRING } },
          conceptualErrors: { type: Type.ARRAY, items: { type: Type.STRING } },
          strengths: { type: Type.ARRAY, items: { type: Type.STRING } },
          missingKeywords: { type: Type.ARRAY, items: { type: Type.STRING } },
          diagramQualityAudit: { type: Type.STRING },
        },
        required: ['demandsMet', 'demandsMissed', 'conceptualErrors', 'strengths', 'missingKeywords'],
      };

      const parsed = await generateAiJson({
        apiConfig,
        prompt,
        schema,
      });

      res.json({ success: true, step: 2, data: parsed });
    } catch (error: any) {
      console.error('Pass 2 error:', error);
      res.status(500).json({ error: error.message || 'Pass 2 comparison failed' });
    }
  });

  // PASS 3: Authentic Human Teacher Margin Annotations with Exact Coordinates
  app.post('/api/evaluate/pass3', async (req, res) => {
    try {
      const {
        questionText,
        pass1Data,
        pass2Data,
        promptSettings,
        apiConfig,
      } = req.body;

      const negativeConstraints = (promptSettings?.negativeConstraints || []).join('\n- ');
      const customDirectives = (promptSettings?.customDirectives || []).join('\n- ');
      const feedbackCount = promptSettings?.feedbackCount || 'balanced';
      const feedbackFormats = promptSettings?.feedbackFormats || ['margin_note', 'top_demand_callout', 'score_breakdown'];
      const anchorStrategy = promptSettings?.coordinateAnchorStrategy || 'smart_visual_margin';

      const prompt = `You are a legendary UPSC faculty member annotating the student's answer paper in RED PEN on the margins.

CRITICAL INSTRUCTIONS & NEGATIVE CONSTRAINTS (WHAT NOT TO DO):
- NEVER prefix comments with artificial categories or labels (e.g. DO NOT write "Demands Missed:", "Suggestion:", "Correction:", "Praise:"). All comments must be natural human teacher remarks (e.g. write "Missed gradient reversal above tropopause and thermal-wind relationship", not "Demands Missed: Missed...").
- ${negativeConstraints || 'Never use generic AI language. Write sharp teacher notes.'}

ADDITIONAL EVALUATOR DIRECTIVES:
- ${customDirectives || 'Be strict on terminology and diagrams.'}

FEEDBACK VOLUME & FORMAT RULES REQUESTED BY USER:
- Target Annotation Count: ${feedbackCount === 'minimal_strict' ? '2 to 4 high-impact notes' : feedbackCount === 'exhaustive' ? '8 to 12 exhaustive line notes' : '4 to 7 balanced teacher notes'}
- Allowed Formats: ${feedbackFormats.join(', ')}
- Spatial Anchor Strategy: ${anchorStrategy}

Question:
${questionText}

Student Points Extracted (Pass 1):
${JSON.stringify(pass1Data, null, 2)}

Audit Findings (Pass 2):
${JSON.stringify(pass2Data, null, 2)}

TASK:
Generate authentic, sharp handwritten-style margin annotations with PRECISE X & Y COORDINATES.
Margins on standard UPSC copies:
- Left margin: xPercent = 2 to 12 (widthPercent: 12-16)
- Right margin: xPercent = 81 to 86 (widthPercent: 15-18)
- Top banner callout (for "Demands Missed"): xPercent = 5, yPercent = 4, widthPercent = 88
- Score stamp at bottom: xPercent = 65, yPercent = 92, widthPercent = 25

HOW TO ENSURE PRECISE Y-COORDINATES:
- Analyze the line order in pass1Data.
- Line 1 of answer starts around yPercent = 10% to 14%.
- Line 4 (middle) sits around yPercent = 35% to 45%.
- Lower half sits around yPercent = 60% to 75%.
- If commenting on student point 1, anchor yPercent directly opposite student point 1 in the margin!

Types allowed:
- "correction": red pen correction of error or shorthand (e.g. "Dont use abbreviations for West East", "Incorrect concept in pt 1: convection stops at tropopause")
- "praise": teacher checkmark praise (e.g. "✓ Valid point on friction", "Good attempt at flowcharting")
- "suggestion": constructive addition (e.g. "Add 'narrow bands' keyword. Mention 9-16 km height.", "Cite Delhi-NCR winter smog as classic example")
- "demand_missed": prominent header callout (e.g. "Demands Missed: Missed thermal wind relationship and winter intensification.")
- "mark": final score badge (e.g. "4/10" or "5.5/15")

Return a JSON object with:
- "annotations": array of objects containing { pageIndex (0), xPercent (number), yPercent (number), widthPercent (number), text (string), type ("correction"|"praise"|"suggestion"|"demand_missed"|"mark"), hasCheckmark (boolean), hasCross (boolean), associatedText (string) }
- "teacherSummary": (string) 2-3 sentence authentic teacher assessment.`;

      const schema = {
        type: Type.OBJECT,
        properties: {
          annotations: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                pageIndex: { type: Type.INTEGER },
                xPercent: { type: Type.NUMBER },
                yPercent: { type: Type.NUMBER },
                widthPercent: { type: Type.NUMBER },
                text: { type: Type.STRING },
                type: { type: Type.STRING },
                hasCheckmark: { type: Type.BOOLEAN },
                hasCross: { type: Type.BOOLEAN },
                associatedText: { type: Type.STRING },
              },
              required: ['pageIndex', 'xPercent', 'yPercent', 'text', 'type'],
            },
          },
          teacherSummary: { type: Type.STRING },
        },
        required: ['annotations', 'teacherSummary'],
      };

      const parsed = await generateAiJson({
        apiConfig,
        prompt,
        schema,
      });

      res.json({ success: true, step: 3, data: parsed });
    } catch (error: any) {
      console.error('Pass 3 error:', error);
      res.status(500).json({ error: error.message || 'Pass 3 annotation generation failed' });
    }
  });

  // MULTI-AGENT AUDIT & CROSS-TALK ENDPOINT: Agents cross-examine and speak to each other
  app.post('/api/evaluate/agent-audit', async (req, res) => {
    try {
      const {
        questionText,
        studentContent,
        pass1Data,
        pass2Data,
        annotations,
        promptSettings,
        apiConfig,
      } = req.body;

      const auditPrompt = `You are running a 3-Agent Council of UPSC Evaluators conducting an adversarial cross-examination of an evaluated answer copy.

Agents in the Council:
1. "Agent 1: Ground Truth Verifier": Checks student's actual handwritten text against the proposed margin notes. Flags any hallucinated claims or incorrect attributions.
2. "Agent 2: UPSC Subject Specialist": Checks factual and conceptual accuracy, verifies if core physical/constitutional mechanisms were missed, and checks model answer fidelity.
3. "Agent 3: Chief Moderator": Listens to Agent 1 and Agent 2, decides whether to approve, correct, or adjust marks/notes, and ensures teacher tone.

Question:
${questionText}

Student Content:
${studentContent || JSON.stringify(pass1Data)}

Pass 2 Gap Analysis:
${JSON.stringify(pass2Data)}

Proposed Annotations:
${JSON.stringify(annotations)}

Evaluator Prompt Directives:
${JSON.stringify(promptSettings?.customDirectives || [])}

TASK:
Simulate the verbatim cross-talk dialogue between the 3 agents as they debate the evaluation.
If any issue or disagreement is found, they talk to each other and reach consensus.

Return a JSON object with:
- "agentDialogue": array of { agent: string, message: string }
- "issuesFound": boolean
- "revisionsRecommended": array of strings
- "consensusStatus": string (e.g. "APPROVED", "APPROVED_WITH_CORRECTIONS", "FLAGGED_FOR_HUMAN_REVIEW")`;

      const schema = {
        type: Type.OBJECT,
        properties: {
          agentDialogue: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                agent: { type: Type.STRING },
                message: { type: Type.STRING },
              },
              required: ['agent', 'message'],
            },
          },
          issuesFound: { type: Type.BOOLEAN },
          revisionsRecommended: {
            type: Type.ARRAY,
            items: { type: Type.STRING },
          },
          consensusStatus: { type: Type.STRING },
        },
        required: ['agentDialogue', 'issuesFound', 'revisionsRecommended', 'consensusStatus'],
      };

      const parsed = await generateAiJson({
        apiConfig,
        prompt: auditPrompt,
        schema,
      });

      res.json({ success: true, step: 'agent-audit', data: parsed });
    } catch (error: any) {
      console.error('Agent audit error:', error);
      res.status(500).json({ error: error.message || 'Agent audit failed' });
    }
  });

  // PASS 4: Scorecard Synthesis & Parameter-Based Assessment Matrix
  app.post('/api/evaluate/pass4', async (req, res) => {
    try {
      const {
        questionText,
        maxMarks = 10,
        pass1Data,
        pass2Data,
        pass3Data,
        apiConfig,
      } = req.body;

      const prompt = `You are the Chief Examiner at LevelUp IAS / ForumIAS performing PASS 4: SCORECARD SYNTHESIS & FINAL MARKS.

Question:
${questionText} (Max Marks: ${maxMarks})

Pass 1 (Extracted Student Text):
${JSON.stringify(pass1Data, null, 2)}

Pass 2 (Demands Met vs Missed, Conceptual Errors):
${JSON.stringify(pass2Data, null, 2)}

Pass 3 (Margin Annotations):
${JSON.stringify(pass3Data?.annotations || [], null, 2)}

Marking Guidelines for UPSC CSE:
- 10-marker: Average is 3.5, Good is 4.5 - 5.0, Exceptional is 5.5 - 6.0.
- 15-marker: Average is 5.0, Good is 6.5 - 7.0, Exceptional is 8.0+.
- Deduct for missing core demands, lack of diagrams, and factual/conceptual errors.

Return JSON with:
- "marksAwarded": number (e.g. 4.0 or 4.5)
- "parameters": object with "attempts", "contentQuality", "structureAndFlow", "presentation", "language" (values strictly one of: "Excellent", "Good", "Average", "Below Average")
- "strengthsBulletPoints": array of strings
- "improvementBulletPoints": array of strings
- "mentorOverallFeedback": string`;

      const schema = {
        type: Type.OBJECT,
        properties: {
          marksAwarded: { type: Type.NUMBER },
          parameters: {
            type: Type.OBJECT,
            properties: {
              attempts: { type: Type.STRING },
              contentQuality: { type: Type.STRING },
              structureAndFlow: { type: Type.STRING },
              presentation: { type: Type.STRING },
              language: { type: Type.STRING },
            },
            required: ['attempts', 'contentQuality', 'structureAndFlow', 'presentation', 'language'],
          },
          strengthsBulletPoints: { type: Type.ARRAY, items: { type: Type.STRING } },
          improvementBulletPoints: { type: Type.ARRAY, items: { type: Type.STRING } },
          mentorOverallFeedback: { type: Type.STRING },
        },
        required: ['marksAwarded', 'parameters', 'strengthsBulletPoints', 'improvementBulletPoints', 'mentorOverallFeedback'],
      };

      const parsed = await generateAiJson({
        apiConfig,
        prompt,
        schema,
      });

      res.json({ success: true, step: 4, data: parsed });
    } catch (error: any) {
      console.error('Pass 4 error:', error);
      res.status(500).json({ error: error.message || 'Pass 4 synthesis failed' });
    }
  });

  // Vite middleware setup
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`UPSC Copy Evaluation Server running on port ${PORT}`);
  });
}

startServer();
