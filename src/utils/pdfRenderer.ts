/**
 * Helper to convert uploaded PDF files into high-resolution page image data URLs
 * and extract text content using PDF.js.
 */
import * as pdfjsLib from 'pdfjs-dist';
import pdfWorker from 'pdfjs-dist/build/pdf.worker.min.mjs?url';

// Configure worker using local Vite bundled URL
if (typeof window !== 'undefined') {
  pdfjsLib.GlobalWorkerOptions.workerSrc = pdfWorker;
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
  const loadingTask = pdfjsLib.getDocument({ 
    data: new Uint8Array(arrayBuffer),
    useWorkerFetch: true,
    isEvalSupported: false,
    useSystemFonts: true,
  });
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

      // Fill canvas background with crisp white to prevent transparent/black artifacts in JPEG
      context.fillStyle = '#ffffff';
      context.fillRect(0, 0, canvas.width, canvas.height);

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
    pages,
    extractedText: textPieces.join('\n\n'),
  };
}

export async function extractTextFromPdf(file: File): Promise<string> {
  const result = await parsePdfComplete(file);
  return result.extractedText;
}
