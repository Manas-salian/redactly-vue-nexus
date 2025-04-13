import { useState, useCallback, useRef } from 'react';
import { DocumentService, ProcessedDocument } from '../services/documentService';
import { AIService, RedactionResult } from '../services/aiService';

interface UseDocumentProcessorState {
  processedDocument: ProcessedDocument | null;
  redactionResult: RedactionResult | null;
  isLoading: boolean;
  error: string | null;
}

interface RedactionOptions {
  sensitivityLevel: number;
  showPII: boolean;
  showFinancial: boolean;
  showDates: boolean;
}

export const useDocumentProcessor = () => {
  const [state, setState] = useState<UseDocumentProcessorState>({
    processedDocument: null,
    redactionResult: null,
    isLoading: false,
    error: null
  });
  
  // Ref to hold the latest processed document for applyRedactions
  const processedDocumentRef = useRef<ProcessedDocument | null>(null);

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