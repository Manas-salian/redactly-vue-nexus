import mammoth from 'mammoth';
// import { createWorker, Worker } from 'tesseract.js'; // Removed unused import
import * as pdfjsLib from 'pdfjs-dist';

// Set worker source for pdf.js
pdfjsLib.GlobalWorkerOptions.workerSrc = `/pdf.worker.min.mjs`;

/**
 * Represents the result of processing a document.
 */
export interface ProcessedDocument {
  /** The extracted text content of the document. */
  text: string;
  /** Metadata about the document. */
  metadata: {
    /** The detected type of the document ('pdf' or 'docx'). */
    type: 'pdf' | 'docx';
    /** The number of pages in the document (only applicable for PDFs). */
    pageCount?: number;
    /** The calculated word count of the extracted text. */
    wordCount: number;
  };
  /** An array of basic entities detected using regex (e.g., emails, phone numbers). */
  entities: Array<{
    /** The matched entity text. */
    text: string;
    /** The type of the entity (e.g., 'EMAIL', 'PHONE', 'URL'). */
    type: string;
    /** The starting character index of the entity in the text. */
    start: number;
    /** The ending character index of the entity in the text. */
    end: number;
    /** A predefined confidence score (currently fixed at 0.95). */
    confidence: number;
  }>;
}

/**
 * Service class for processing uploaded documents (PDF, DOCX).
 * Handles text extraction and basic entity recognition.
 * Implemented as a Singleton.
 */
export class DocumentService {
  private static instance: DocumentService;
  // private worker: Worker | null = null; // Removed Tesseract worker reference

  /** Private constructor to enforce Singleton pattern. */
  private constructor() {
    // this.initializeServices(); // Removed Tesseract worker initialization call
  }

  /**
   * Gets the singleton instance of the DocumentService.
   * @returns The singleton DocumentService instance.
   */
  public static getInstance(): DocumentService {
    if (!DocumentService.instance) {
      DocumentService.instance = new DocumentService();
    }
    return DocumentService.instance;
  }

  /**
   * Processes the uploaded file based on its type (PDF or DOCX).
   * Extracts text, calculates metadata, and performs basic entity extraction.
   * @param file The file to process.
   * @returns A promise resolving to the ProcessedDocument object.
   * @throws Error if the file type is unsupported or processing fails.
   */
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

  /**
   * Extracts text content and page count from a PDF file.
   * @param file The PDF file to process.
   * @returns A promise resolving to an object containing the extracted text and page count.
   */
  private async processPDF(file: File): Promise<{ text: string; pageCount: number }> {
    const originalArrayBuffer = await file.arrayBuffer();
    // Copy the buffer to prevent detachment issues when passed to pdfjsLib
    const arrayBufferCopy = originalArrayBuffer.slice(0);
    const loadingTask = pdfjsLib.getDocument({ data: arrayBufferCopy }); // Use the copy
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

  /**
   * Extracts raw text content from a DOCX file using mammoth.
   * @param file The DOCX file to process.
   * @returns A promise resolving to the extracted text string.
   */
  private async processDOCX(file: File): Promise<string> {
    const arrayBuffer = await file.arrayBuffer();
    const result = await mammoth.extractRawText({ arrayBuffer });
    return result.value;
  }

  /**
   * Extracts basic entities (Email, Phone, URL) from text using regular expressions.
   * @param text The text content to search within.
   * @returns An array of found entity objects.
   */
  private extractEntities(text: string): ProcessedDocument['entities'] {
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

  /**
   * Cleans up resources, specifically terminating the Tesseract worker.
   * Should be called when the service is no longer needed (e.g., component unmount).
   */
  /* // Removed Tesseract worker cleanup
  public async cleanup() {
    if (this.worker) {
      console.log('Terminating Tesseract worker...');
      await this.worker.terminate();
      this.worker = null; // Clear the reference
      console.log('Tesseract worker terminated.');
    }
  }
  */
} 