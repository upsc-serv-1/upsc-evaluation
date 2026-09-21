import { PDFDocument, rgb, StandardFonts, PDFHexString, PDFString } from 'pdf-lib';
import { AnnotationItem, CopyScorecard, QuestionEvaluation } from '../types';

export interface GeneratePdfOptions {
  scorecard: CopyScorecard;
  pages: {
    pageNumber: number;
    title?: string;
    studentLines: string[];
    diagramLabel?: string;
    annotations: AnnotationItem[];
    originalImageBase64?: string;
  }[];
  customTitle?: string;
}

/**
 * Creates a high-fidelity annotated UPSC test evaluation PDF with:
 * 1. LevelUp IAS style Evaluation Matrix & Score Summary Page
 * 2. Question-cum-Answer booklet pages with UPSC margin lines
 * 3. Red ink teacher margin annotations, red checkmarks (✓), and score stamps
 * 4. NATIVE ISO-32000 PDF /FreeText Annotations so the user can open & edit them in Adobe Acrobat / PDF editors!
 */
export async function generateAnnotatedPdf(options: GeneratePdfOptions): Promise<Uint8Array> {
  const pdfDoc = await PDFDocument.create();
  const timesRoman = await pdfDoc.embedFont(StandardFonts.TimesRoman);
  const timesRomanBold = await pdfDoc.embedFont(StandardFonts.TimesRomanBold);
  const helvetica = await pdfDoc.embedFont(StandardFonts.Helvetica);
  const helveticaBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
  const courier = await pdfDoc.embedFont(StandardFonts.Courier);

  const pageWidth = 595.28; // Standard A4 width in points
  const pageHeight = 841.89; // Standard A4 height in points

  // Colors
  const redInk = rgb(0.85, 0.15, 0.15); // Teacher marking red
  const redSoftBg = rgb(1.0, 0.95, 0.95);
  const darkNavy = rgb(0.1, 0.15, 0.25);
  const borderGray = rgb(0.75, 0.75, 0.75);
  const textDark = rgb(0.12, 0.12, 0.12);
  const marginLineColor = rgb(0.65, 0.65, 0.65);

  // ==========================================
  // PAGE 1: EVALUATION MATRIX & SCORE SUMMARY
  // ==========================================
  const summaryPage = pdfDoc.addPage([pageWidth, pageHeight]);

  // Header Banner
  summaryPage.drawRectangle({
    x: 40,
    y: pageHeight - 85,
    width: pageWidth - 80,
    height: 55,
    color: rgb(0.96, 0.97, 0.99),
    borderColor: darkNavy,
    borderWidth: 1.5,
  });

  summaryPage.drawText("UPSC CSE MAINS MENTORSHIP PROGRAM", {
    x: 140,
    y: pageHeight - 50,
    size: 14,
    font: timesRomanBold,
    color: darkNavy,
  });

  summaryPage.drawText("EXPERT COPY EVALUATION & PERFORMANCE DOSSIER", {
    x: 155,
    y: pageHeight - 68,
    size: 10,
    font: timesRoman,
    color: rgb(0.3, 0.35, 0.45),
  });

  // Candidate Details Box
  const candBoxY = pageHeight - 150;
  summaryPage.drawRectangle({
    x: 40,
    y: candBoxY,
    width: pageWidth - 80,
    height: 55,
    borderColor: borderGray,
    borderWidth: 1,
  });

  summaryPage.drawText(`Candidate: ${options.scorecard.candidateName}`, {
    x: 52,
    y: candBoxY + 36,
    size: 11,
    font: timesRomanBold,
    color: textDark,
  });

  summaryPage.drawText(`Test: ${options.scorecard.testTitle}`, {
    x: 52,
    y: candBoxY + 18,
    size: 9.5,
    font: timesRoman,
    color: textDark,
  });

  summaryPage.drawText(`Date: ${options.scorecard.date}`, {
    x: pageWidth - 200,
    y: candBoxY + 36,
    size: 9.5,
    font: timesRoman,
    color: textDark,
  });

  // Score Badge
  const scoreBoxWidth = 110;
  summaryPage.drawRectangle({
    x: pageWidth - 160,
    y: candBoxY + 8,
    width: scoreBoxWidth,
    height: 38,
    color: redSoftBg,
    borderColor: redInk,
    borderWidth: 1.5,
  });

  summaryPage.drawText("Total Marks Awarded", {
    x: pageWidth - 155,
    y: candBoxY + 32,
    size: 8,
    font: helveticaBold,
    color: redInk,
  });

  summaryPage.drawText(`${options.scorecard.totalMarksAwarded} / ${options.scorecard.totalMaxMarks}`, {
    x: pageWidth - 145,
    y: candBoxY + 14,
    size: 15,
    font: helveticaBold,
    color: redInk,
  });

  // Parameters Table (Like LevelUp IAS)
  const paramY = pageHeight - 275;
  summaryPage.drawText("Evaluation Parameters Assessment", {
    x: 40,
    y: paramY + 105,
    size: 12,
    font: timesRomanBold,
    color: darkNavy,
  });

  const pCols = ["Parameter", "Excellent", "Good", "Average", "Below Average"];
  const pColWidths = [180, 80, 80, 80, 95];
  let curX = 40;

  // Header row
  summaryPage.drawRectangle({
    x: 40,
    y: paramY + 80,
    width: pageWidth - 80,
    height: 20,
    color: rgb(0.92, 0.94, 0.97),
    borderColor: borderGray,
    borderWidth: 1,
  });

  pCols.forEach((col, idx) => {
    summaryPage.drawText(col, {
      x: curX + 6,
      y: paramY + 85,
      size: 9,
      font: helveticaBold,
      color: darkNavy,
    });
    curX += pColWidths[idx];
  });

  const paramRows = [
    { label: "Attempts & Question Selection", val: options.scorecard.parameters.attempts },
    { label: "Content Quality & Concept Depth", val: options.scorecard.parameters.contentQuality },
    { label: "Structure, Flow & Directives", val: options.scorecard.parameters.structureAndFlow },
    { label: "Presentation, Maps & Flowcharts", val: options.scorecard.parameters.presentation },
    { label: "Language & Standard Terminology", val: options.scorecard.parameters.language },
  ];

  paramRows.forEach((row, rIdx) => {
    const rowY = paramY + 60 - rIdx * 19;
    summaryPage.drawRectangle({
      x: 40,
      y: rowY,
      width: pageWidth - 80,
      height: 19,
      borderColor: borderGray,
      borderWidth: 0.5,
    });

    summaryPage.drawText(row.label, {
      x: 46,
      y: rowY + 5,
      size: 8.5,
      font: timesRoman,
      color: textDark,
    });

    // Draw checkmark in appropriate column
    let checkColX = 40 + pColWidths[0];
    const colOptions = ["Excellent", "Good", "Average", "Below Average"];
    colOptions.forEach((colOpt, cIdx) => {
      if (row.val === colOpt) {
        summaryPage.drawText("✓", {
          x: checkColX + 32,
          y: rowY + 4,
          size: 12,
          font: helveticaBold,
          color: redInk,
        });
      }
      checkColX += pColWidths[cIdx + 1];
    });
  });

  // Strengths & Areas for Improvement (Two Columns)
  const feedbackY = paramY - 55;
  const colW = (pageWidth - 95) / 2;

  // Strengths Box
  summaryPage.drawRectangle({
    x: 40,
    y: feedbackY - 140,
    width: colW,
    height: 175,
    borderColor: rgb(0.2, 0.6, 0.3),
    borderWidth: 1,
    color: rgb(0.97, 0.99, 0.97),
  });

  summaryPage.drawText("Key Strengths Observed", {
    x: 50,
    y: feedbackY + 18,
    size: 11,
    font: helveticaBold,
    color: rgb(0.15, 0.45, 0.2),
  });

  options.scorecard.overallStrengths.forEach((str, sIdx) => {
    summaryPage.drawText(`• ${str}`, {
      x: 48,
      y: feedbackY - 5 - sIdx * 28,
      size: 8.5,
      font: timesRoman,
      color: textDark,
      maxWidth: colW - 16,
      lineHeight: 11,
    });
  });

  // Areas for Improvement Box
  summaryPage.drawRectangle({
    x: 55 + colW,
    y: feedbackY - 140,
    width: colW,
    height: 175,
    borderColor: redInk,
    borderWidth: 1,
    color: redSoftBg,
  });

  summaryPage.drawText("Areas for Improvement", {
    x: 65 + colW,
    y: feedbackY + 18,
    size: 11,
    font: helveticaBold,
    color: redInk,
  });

  options.scorecard.overallImprovements.forEach((imp, iIdx) => {
    summaryPage.drawText(`• ${imp}`, {
      x: 63 + colW,
      y: feedbackY - 5 - iIdx * 28,
      size: 8.5,
      font: timesRoman,
      color: textDark,
      maxWidth: colW - 16,
      lineHeight: 11,
    });
  });

  // Overall Mentor Feedback
  const mentorBoxY = feedbackY - 245;
  summaryPage.drawRectangle({
    x: 40,
    y: mentorBoxY,
    width: pageWidth - 80,
    height: 90,
    borderColor: darkNavy,
    borderWidth: 1.5,
    color: rgb(0.98, 0.98, 1.0),
  });

  summaryPage.drawText("Senior Evaluator's Overall Advice", {
    x: 52,
    y: mentorBoxY + 70,
    size: 11,
    font: helveticaBold,
    color: darkNavy,
  });

  summaryPage.drawText(options.scorecard.overallFeedback, {
    x: 52,
    y: mentorBoxY + 50,
    size: 9.5,
    font: timesRoman,
    color: textDark,
    maxWidth: pageWidth - 105,
    lineHeight: 14,
  });

  // Question Marks Breakdown Mini-Table
  const miniTableY = mentorBoxY - 70;
  summaryPage.drawText("Question Marks Breakdown:", {
    x: 40,
    y: miniTableY + 45,
    size: 9.5,
    font: helveticaBold,
    color: darkNavy,
  });

  let qX = 40;
  options.scorecard.questionWiseMarks.forEach((q) => {
    summaryPage.drawRectangle({
      x: qX,
      y: miniTableY,
      width: 48,
      height: 38,
      borderColor: borderGray,
      borderWidth: 0.5,
    });
    summaryPage.drawText(`Q${q.qNumber}`, {
      x: qX + 14,
      y: miniTableY + 24,
      size: 8.5,
      font: helveticaBold,
      color: darkNavy,
    });
    summaryPage.drawText(`${q.marksObtained}/${q.maxMarks}`, {
      x: qX + 6,
      y: miniTableY + 9,
      size: 8.5,
      font: helveticaBold,
      color: redInk,
    });
    qX += 51;
  });

  // ==========================================
  // PAGES 2+: STUDENT ANSWER BOOKLET PAGES
  // ==========================================
  for (let pageIdx = 0; pageIdx < options.pages.length; pageIdx++) {
    const pData = options.pages[pageIdx];
    const page = pdfDoc.addPage([pageWidth, pageHeight]);

    // If original image background is provided, draw it as the background
    if (pData.originalImageBase64) {
      try {
        const isPng = pData.originalImageBase64.includes('image/png');
        const cleanBase64 = pData.originalImageBase64.replace(/^data:image\/\w+;base64,/, '');
        const imageBytes = Uint8Array.from(atob(cleanBase64), c => c.charCodeAt(0));
        const embeddedImage = isPng 
          ? await pdfDoc.embedPng(imageBytes)
          : await pdfDoc.embedJpg(imageBytes);

        page.drawImage(embeddedImage, {
          x: 0,
          y: 0,
          width: pageWidth,
          height: pageHeight,
        });
      } catch (imgErr) {
        console.warn('Could not embed original page image, falling back to vector layout:', imgErr);
      }
    } else {
      // Draw standard UPSC booklet margins:
      // Left margin line at x = 75 pt
      // Right margin line at x = 505 pt
      const leftMarginX = 80;
      const rightMarginX = 485;

      // Header: "UPSC" & candidate instructions
      page.drawText("UPSC", {
        x: pageWidth / 2 - 28,
        y: pageHeight - 38,
        size: 18,
        font: timesRomanBold,
        color: rgb(0.2, 0.2, 0.2),
      });

      page.drawText("Answer Questions in NOT MORE THAN the Word Limit specified for each in the Parenthesis.", {
        x: 120,
        y: pageHeight - 52,
        size: 7,
        font: timesRoman,
        color: rgb(0.4, 0.4, 0.4),
      });

      // Left and right vertical margin boundaries
      page.drawLine({
        start: { x: leftMarginX, y: 35 },
        end: { x: leftMarginX, y: pageHeight - 55 },
        thickness: 0.7,
        color: marginLineColor,
      });

      page.drawLine({
        start: { x: rightMarginX, y: 35 },
        end: { x: rightMarginX, y: pageHeight - 55 },
        thickness: 0.7,
        color: marginLineColor,
      });

      // Margin instructions
      page.drawText("Candidates\nmust not\nwrite on this\nmargin", {
        x: 18,
        y: pageHeight - 90,
        size: 6.5,
        font: timesRoman,
        color: rgb(0.5, 0.5, 0.5),
        lineHeight: 8,
      });

      page.drawText("Candidates\nmust not\nwrite on this\nmargin", {
        x: rightMarginX + 18,
        y: pageHeight - 90,
        size: 6.5,
        font: timesRoman,
        color: rgb(0.5, 0.5, 0.5),
        lineHeight: 8,
      });

      // Page number footer
      page.drawText(`Page ${pData.pageNumber}`, {
        x: pageWidth / 2 - 18,
        y: 20,
        size: 8,
        font: timesRoman,
        color: rgb(0.4, 0.4, 0.4),
      });

      // Draw student handwriting text emulation (or actual lines)
      let textStartY = pageHeight - 85;
      if (pData.title) {
        page.drawText(pData.title, {
          x: leftMarginX + 15,
          y: textStartY,
          size: 11,
          font: timesRomanBold,
          color: textDark,
          maxWidth: rightMarginX - leftMarginX - 30,
        });
        textStartY -= 24;
      }

      pData.studentLines.forEach((line) => {
        // Draw simulated ruled line under text
        page.drawLine({
          start: { x: leftMarginX + 8, y: textStartY - 2 },
          end: { x: rightMarginX - 8, y: textStartY - 2 },
          thickness: 0.3,
          color: rgb(0.88, 0.88, 0.92),
        });

        page.drawText(line, {
          x: leftMarginX + 15,
          y: textStartY + 2,
          size: 10,
          font: courier,
          color: rgb(0.08, 0.12, 0.28), // Dark blue handwriting ink
          maxWidth: rightMarginX - leftMarginX - 30,
        });

        textStartY -= 22;
      });

      // Diagram placeholder if any
      if (pData.diagramLabel) {
        page.drawRectangle({
          x: leftMarginX + 45,
          y: textStartY - 100,
          width: rightMarginX - leftMarginX - 90,
          height: 95,
          borderColor: rgb(0.3, 0.35, 0.45),
          borderWidth: 1,
          color: rgb(0.98, 0.99, 1.0),
        });

        page.drawText(`[Diagram: ${pData.diagramLabel}]`, {
          x: leftMarginX + 60,
          y: textStartY - 55,
          size: 9.5,
          font: timesRoman,
          color: rgb(0.3, 0.35, 0.45),
        });

        textStartY -= 115;
      }
    }

    // ========================================================
    // DRAW TEACHER ANNOTATIONS & INJECT NATIVE PDF /FreeText
    // ========================================================
    pData.annotations.forEach((annot) => {
      // Calculate coordinates from percentage
      // annot.xPercent: 0 - 100% across page
      // annot.yPercent: 0 - 100% from TOP of page
      const boxWidth = annot.widthPercent ? (annot.widthPercent / 100) * pageWidth : 110;
      const targetX = (annot.xPercent / 100) * pageWidth;
      const targetYFromTop = (annot.yPercent / 100) * pageHeight;
      const pdfY = pageHeight - targetYFromTop;

      // Clean comment text for output: Strip out any artificial category prefixes like "Demands Missed:", "Suggestion:", etc.
      let cleanedText = annot.text
        .replace(/^(demands?\s*missed|suggestion|praise|correction|comment)\s*:\s*/i, '')
        .trim();

      // Uniform teacher red pen styling for all comments
      const borderColor = redInk;
      const bgColor = rgb(1.0, 0.97, 0.97);
      const textColor = redInk;

      const lines = cleanedText.split('\n');
      const boxHeight = Math.max(lines.length * 12 + 10, 24);

      // Draw visible vector annotation box
      page.drawRectangle({
        x: targetX,
        y: pdfY - boxHeight,
        width: boxWidth,
        height: boxHeight,
        borderColor: borderColor,
        borderWidth: annot.type === 'mark' ? 1.5 : 0.8,
        color: bgColor,
      });

      // Draw checkmark or cross if requested
      if (annot.hasCheckmark) {
        page.drawText("✓", {
          x: targetX - 16,
          y: pdfY - boxHeight + 8,
          size: 16,
          font: helveticaBold,
          color: redInk,
        });
      } else if (annot.hasCross) {
        page.drawText("✗", {
          x: targetX - 16,
          y: pdfY - boxHeight + 8,
          size: 15,
          font: helveticaBold,
          color: redInk,
        });
      }

      // Draw the annotation text inside the box (natural human teacher comment)
      lines.forEach((lineText, lIdx) => {
        page.drawText(lineText, {
          x: targetX + 4,
          y: pdfY - 12 - lIdx * 11,
          size: annot.type === 'mark' ? 12 : 7.5,
          font: annot.type === 'mark' ? helveticaBold : helvetica,
          color: textColor,
          maxWidth: boxWidth - 8,
        });
      });

      // -----------------------------------------------------------------
      // INJECT NATIVE PDF /FreeText ANNOTATION DICTIONARY (ISO-32000)
      // All comments are unified as "Comment" without artificial labels.
      // -----------------------------------------------------------------
      try {
        const annotDict = pdfDoc.context.obj({
          Type: 'Annot',
          Subtype: 'FreeText',
          Rect: [targetX, pdfY - boxHeight, targetX + boxWidth, pdfY],
          Contents: PDFHexString.fromText(cleanedText),
          DA: PDFString.of('/Helv 8 Tf 0.85 0.15 0.15 rg'),
          C: [0.85, 0.15, 0.15],
          T: PDFHexString.fromText('Teacher Evaluator'),
          Subj: PDFHexString.fromText('Comment'),
          F: 4, // Bit 3 set = Print flag
        });
        const annotRef = pdfDoc.context.register(annotDict);
        page.node.addAnnot(annotRef);
      } catch (err) {
        console.warn('Could not register native FreeText annot:', err);
      }
    });
  }

  return await pdfDoc.save();
}
