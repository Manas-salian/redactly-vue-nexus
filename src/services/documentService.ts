import mammoth from 'mammoth';
import { createWorker } from 'tesseract.js';
import * as pdfjsLib from 'pdfjs-dist';

// Set worker source to the local module file
pdfjsLib.GlobalWorkerOptions.workerSrc = `/pdf.worker.min.mjs`;

export interface ProcessedDocument {
  text: string;
  metadata: {
    type: 'pdf' | 'docx';
    pageCount?: number;
    wordCount: number;
  };
  entities: Array<{
    text: string;
    type: string;
    start: number;
    end: number;
    confidence: number;
  }>;
}

export class DocumentService {
  private static instance: DocumentService;
  private worker: any;

  private constructor() {
    this.initializeServices();
  }

  public static getInstance(): DocumentService {
    if (!DocumentService.instance) {
      DocumentService.instance = new DocumentService();
    }
    return DocumentService.instance;
  }

  private async initializeServices() {
    // Initialize Tesseract worker
    this.worker = await createWorker();
  }

  public async processDocument(file: File): Promise<ProcessedDocument> {
    const fileType = file.type;
    let text = '';
    let metadata = {
      type: fileType.includes('pdf') || file.name.endsWith('.pdf') ? 'pdf' as const 
            : fileType.includes('docx') || file.name.endsWith('.docx') ? 'docx' as const 
            : 'unknown' as const,
      pageCount: undefined as number | undefined,
      wordCount: 0
    };

    if (metadata.type === 'pdf') {
      try {
        const result = await this.processPDF(file);
        text = result.text;
        metadata.pageCount = result.pageCount;
      } catch (error) {
        console.error("Error processing PDF:", error);
        throw new Error("Failed to process PDF file.");
      }
    } else if (metadata.type === 'docx') {
      try {
        text = await this.processDOCX(file);
      } catch (error) {
        console.error("Error processing DOCX:", error);
        throw new Error("Failed to process DOCX file.");
      }
    } else {
      throw new Error("Unsupported file type.");
    }

    // OCR is likely not needed if text extraction works, but keep for now

    // Extract entities using basic regex patterns
    const entities = this.extractEntities(text);

    metadata.wordCount = text.split(/\s+/).filter(Boolean).length;

    return {
      text,
      metadata: metadata as any,
      entities
    };
  }

  private async processPDF(file: File): Promise<{ text: string; pageCount: number }> {
    const arrayBuffer = await file.arrayBuffer();
    const loadingTask = pdfjsLib.getDocument({ data: arrayBuffer });
    const pdf = await loadingTask.promise;
    const pageCount = pdf.numPages;
    
    let text = '';
    for (let i = 1; i <= pageCount; i++) {
      try {
        const page = await pdf.getPage(i);
        const content = await page.getTextContent();
        text += content.items.map((item: any) => item.str || '').join(' ') + '\n';
      } catch(pageError) {
        console.error(`Error processing page ${i}:`, pageError);
      }
    }

    return { text: text.trim(), pageCount };
  }

  private async processDOCX(file: File): Promise<string> {
    const arrayBuffer = await file.arrayBuffer();
    const result = await mammoth.extractRawText({ arrayBuffer });
    return result.value;
  }

  private async performOCR(file: File): Promise<string> {
    if (!this.worker) {
        await this.initializeServices();
    }
    const result = await this.worker.recognize(file);
    return result.data.text;
  }

  private extractEntities(text: string) {
    const emailRegex = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g;
    const phoneRegex = /(\+\d{1,3}[-.]?)?\(?\d{3}\)?[-.]?\d{3}[-.]?\d{4}/g;
    const urlRegex = /(https?:\/\/[^\s]+)/g;

    const entities = [];
    let match;

    while ((match = emailRegex.exec(text)) !== null) {
      entities.push({ text: match[0], type: 'EMAIL', start: match.index, end: match.index + match[0].length, confidence: 0.95 });
    }
    while ((match = phoneRegex.exec(text)) !== null) {
      entities.push({ text: match[0], type: 'PHONE', start: match.index, end: match.index + match[0].length, confidence: 0.95 });
    }
    while ((match = urlRegex.exec(text)) !== null) {
      entities.push({ text: match[0], type: 'URL', start: match.index, end: match.index + match[0].length, confidence: 0.95 });
    }

    return entities;
  }

  public async cleanup() {
    if (this.worker) {
      await this.worker.terminate();
    }
  }
} 