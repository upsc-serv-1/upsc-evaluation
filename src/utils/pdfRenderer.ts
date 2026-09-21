/**
 * Helper to convert uploaded PDF files into high-resolution page image data URLs
 * and extract text content using PDF.js.
 */
import * as pdfjsLib from 'pdfjs-dist';

// Configure worker using CDN
if (typeof window !== 'undefined' && 'Worker' in window) {
  pdfjsLib.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.mjs`;
}

export interface RenderedPdfPage {
  pageNumber: number;
  dataUrl: string;
}

export interface ParsedPdfResult {
  pages: RenderedPdfPage[];
  extractedText: string;
}

export async function convertPdfToImages(file: File): Promise<RenderedPdfPage[]> {
  const result = await parsePdfComplete(file);
  return result.pages;
}

export async function parsePdfComplete(file: File): Promise<ParsedPdfResult> {
  const arrayBuffer = await file.arrayBuffer();
  const loadingTask = pdfjsLib.getDocument({ data: arrayBuffer });
  const pdf = await loadingTask.promise;
  const pages: RenderedPdfPage[] = [];
  const textPieces: string[] = [];

  for (let i = 1; i <= pdf.numPages; i++) {
    const page = await pdf.getPage(i);
    const viewport = page.getViewport({ scale: 1.75 }); // High resolution for crisp handwriting

    const canvas = document.createElement('canvas');
    const context = canvas.getContext('2d');
    if (context) {
      canvas.height = viewport.height;
      canvas.width = viewport.width;

      const renderContext = {
        canvasContext: context,
        viewport: viewport,
      };

      await (page.render(renderContext as any) as any).promise;
      pages.push({
        pageNumber: i,
        dataUrl: canvas.toDataURL('image/jpeg', 0.92),
      });
    }

    try {
      const textContent = await page.getTextContent();
      const pageText = textContent.items
        .map((item: any) => item.str || '')
        .filter(Boolean)
        .join(' ');
      if (pageText.trim()) {
        textPieces.push(`--- Page ${i} ---\n${pageText}`);
      }
    } catch (e) {
      console.warn(`Could not extract raw text from page ${i}:`, e);
    }
  }

  return {
    pages,
    extractedText: textPieces.join('\n\n'),
  };
}

export async function extractTextFromPdf(file: File): Promise<string> {
  const result = await parsePdfComplete(file);
  return result.extractedText;
}
