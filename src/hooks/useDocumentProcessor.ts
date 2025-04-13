import { useState, useCallback, useRef } from 'react';
import { DocumentService, ProcessedDocument } from '../services/documentService';
import { AIService, RedactionResult } from '../services/aiService';

/**
 * Interface defining the state managed by the useDocumentProcessor hook.
 */
interface UseDocumentProcessorState {
  /** The processed document data (text, metadata, initial entities). Null if not processed or error. */
  processedDocument: ProcessedDocument | null;
  /** The results from the AI redaction service. Null if not run or error. */
  redactionResult: RedactionResult | null;
  /** Boolean flag indicating if any processing (document or AI) is currently running. */
  isLoading: boolean;
  /** Error message string if an error occurred during processing. Null otherwise. */
  error: string | null;
}

/**
 * Interface defining the options for the AI redaction service.
 */
interface RedactionOptions {
  /** Sensitivity level (0-100) for AI detection. */
  sensitivityLevel: number;
  /** Whether to detect/redact Personally Identifiable Information (PII). */
  showPII: boolean;
  /** Whether to detect/redact financial data. */
  showFinancial: boolean;
  /** Whether to detect/redact dates. */
  showDates: boolean;
}

/**
 * Custom hook to manage the document processing and AI redaction workflow.
 * Provides state for loading status, errors, processed document data, and redaction results.
 * Exposes functions to initiate document processing and apply AI redactions.
 *
 * @returns An object containing the processor state and action functions:
 *  - `processedDocument`: The result from `DocumentService.processDocument`.
 *  - `redactionResult`: The result from `AIService.detectSensitiveData`.
 *  - `isLoading`: Boolean indicating if processing is active.
 *  - `error`: Error message if any step failed.
 *  - `processDocument`: Function to initiate document processing.
 *  - `applyRedactions`: Function to apply AI redactions based on options.
 *  - `reset`: Function to reset the hook's state.
 */
export const useDocumentProcessor = () => {
  const [state, setState] = useState<UseDocumentProcessorState>({
    processedDocument: null,
    redactionResult: null,
    isLoading: false,
    error: null
  });
  
  /** Ref to hold the latest processed document data to ensure `applyRedactions` uses the correct data, 
   *  even if the state update hasn't completed yet. */
  const processedDocumentRef = useRef<ProcessedDocument | null>(null);

  /**
   * Processes the uploaded file using DocumentService.
   * Extracts text and basic metadata.
   * @param file The file to process.
   * @returns A promise resolving to the ProcessedDocument data, or null if an error occurs.
   */
  const processDocument = useCallback(async (file: File): Promise<ProcessedDocument | null> => {
    setState(prev => ({ ...prev, isLoading: true, error: null, redactionResult: null, processedDocument: null }));
    processedDocumentRef.current = null; // Clear ref

    try {
      const documentService = DocumentService.getInstance();
      const doc = await documentService.processDocument(file);
      console.log("Document processed by service:", doc);

      setState(prev => ({
        ...prev,
        processedDocument: doc,
        isLoading: false // Keep loading true until redactions are applied? Or set false here?
                         // Let's set isLoading false here, applyRedactions will set it true again.
      }));
      processedDocumentRef.current = doc; // Update ref
      return doc;
    } catch (error) {
      console.error("Error in processDocument hook:", error);
      const errorMessage = error instanceof Error ? error.message : 'An error occurred while processing the document';
      setState(prev => ({
        ...prev,
        error: errorMessage,
        isLoading: false,
        processedDocument: null
      }));
      processedDocumentRef.current = null;
      return null;
    }
  }, []);

  /**
   * Applies AI redaction detection using AIService based on the provided options.
   * Requires `processDocument` to have been successfully called first.
   * Uses the `processedDocumentRef` to ensure it operates on the latest processed data.
   * @param options The redaction options (sensitivity, categories).
   */
  const applyRedactions = useCallback(async (options: RedactionOptions) => {
    const currentProcessedDoc = processedDocumentRef.current; // Use the ref
    
    if (!currentProcessedDoc) {
      console.warn("applyRedactions called but no processed document available.");
      setState(prev => ({ ...prev, error: 'Cannot apply redactions: No document processed yet.' }));
      return;
    }

    setState(prev => ({ ...prev, isLoading: true, error: null }));

    try {
      const aiService = AIService.getInstance();
      console.log("Applying redactions with options:", options, "on document:", currentProcessedDoc);
      const result = await aiService.detectSensitiveData(
        currentProcessedDoc, // Use document from ref
        options
      );
      console.log("Redaction result:", result);

      setState(prev => ({
        ...prev,
        redactionResult: result,
        isLoading: false
      }));
    } catch (error) {
      console.error("Error in applyRedactions hook:", error);
      const errorMessage = error instanceof Error ? error.message : 'An error occurred while applying redactions';
      setState(prev => ({
        ...prev,
        error: errorMessage,
        isLoading: false,
        redactionResult: null // Clear results on error
      }));
    }
  }, []); // Dependency removed as we use ref

  /**
   * Resets the hook's state to its initial values, clearing any processed data or errors.
   */
  const reset = useCallback(() => {
    setState({
      processedDocument: null,
      redactionResult: null,
      isLoading: false,
      error: null
    });
    processedDocumentRef.current = null; // Reset ref
  }, []);

  return {
    ...state,
    processDocument,
    applyRedactions,
    reset
  };
}; 