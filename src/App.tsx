import React, { useState } from 'react';
import { Toaster } from 'sonner';
import DocumentUpload from './components/DocumentUpload';
import DocumentPreview from './components/DocumentPreview';
import RedactionControls from './components/RedactionControls';
import RedactionDetailsPanel from './components/RedactionDetailsPanel';
import { useDocumentProcessor } from './hooks/useDocumentProcessor';
import { ThemeProvider } from './context/ThemeContext';
import ThemeToggle from './components/ThemeToggle';

function App() {
  return (
    <ThemeProvider>
      <AppContent />
    </ThemeProvider>
  );
}

/**
 * Main application content component.
 * Manages the overall application state including the selected file,
 * redaction settings, and coordinates interactions between different components.
 */
function AppContent() {
  /** State for the currently selected file object. */
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  /** State for the ArrayBuffer content of the selected file, used for preview. */
  const [fileArrayBuffer, setFileArrayBuffer] = useState<ArrayBuffer | null>(null);
  /** State for the selected redaction mode ('blackout', 'deidentify', 'none'). */
  const [redactionMode, setRedactionMode] = useState<'blackout' | 'deidentify' | 'none'>('none');
  /** State for the AI sensitivity level for redaction (0-100). */
  const [sensitivityLevel, setSensitivityLevel] = useState(50);
  /** State to control visibility of PII redactions. */
  const [showPII, setShowPII] = useState(true);
  /** State to control visibility of Financial data redactions. */
  const [showFinancial, setShowFinancial] = useState(true);
  /** State to control visibility of Date redactions. */
  const [showDates, setShowDates] = useState(true);
  /** State for the ID of the currently selected redaction detail. */
  const [selectedRedactionId, setSelectedRedactionId] = useState<string | null>(null);
  /** State to store user-added annotations for specific redactions. */
  const [annotations, setAnnotations] = useState<Record<string, string[]>>({});

  const {
    processedDocument,
    redactionResult,
    isLoading,
    error,
    processDocument,
    applyRedactions,
    reset
  } = useDocumentProcessor();

  /** The details of the currently selected redaction, derived from redactionResult. */
  const selectedRedaction = selectedRedactionId && redactionResult?.redactions.find(
    r => r.id === selectedRedactionId
  ) || null;

  /**
   * Handles the selection of a new file.
   * Reads the file into an ArrayBuffer for preview and potentially triggers processing.
   * @param file The file selected by the user.
   */
  const handleFileSelected = async (file: File) => {
    setSelectedFile(file);
    setFileArrayBuffer(null);

    const reader = new FileReader();
    reader.onload = async (e) => {
      const buffer = e.target?.result as ArrayBuffer;
      setFileArrayBuffer(buffer);

      // const processedDoc = await processDocument(file);

      /*
      if (processedDoc) {
        await applyRedactions({
          sensitivityLevel,
          showPII,
          showFinancial,
          showDates
        });
      }
      */
    };
    reader.onerror = (e) => {
      console.error("Failed to read file:", e);
      setFileArrayBuffer(null);
      reset();
    };
    reader.readAsArrayBuffer(file);
  };

  /**
   * Updates the redaction mode state.
   * @param mode The new redaction mode.
   */
  const handleRedactionModeChange = (mode: 'blackout' | 'deidentify' | 'none') => {
    setRedactionMode(mode);
  };

  /**
   * Updates the sensitivity level state and potentially triggers re-processing.
   * @param value The new sensitivity level.
   */
  const handleSensitivityChange = async (value: number) => {
    setSensitivityLevel(value);
    // await applyRedactions({ sensitivityLevel: value, showPII, showFinancial, showDates });
  };

  /**
   * Handles changes to redaction category filters (PII, Financial, Dates).
   * Updates the corresponding state and potentially triggers re-processing.
   * @param filter The category being toggled.
   * @param value The new boolean value for the filter.
   */
  const handleFilterChange = async (
    filter: 'showPII' | 'showFinancial' | 'showDates',
    value: boolean
  ) => {
    let updatedOptions = { sensitivityLevel, showPII, showFinancial, showDates };
    switch (filter) {
      case 'showPII':
        setShowPII(value);
        updatedOptions.showPII = value;
        break;
      case 'showFinancial':
        setShowFinancial(value);
        updatedOptions.showFinancial = value;
        break;
      case 'showDates':
        setShowDates(value);
        updatedOptions.showDates = value;
        break;
    }
    // await applyRedactions(updatedOptions);
  };

  /**
   * Placeholder for approving a specific redaction.
   * @param id The ID of the redaction to approve.
   */
  const handleApproveRedaction = (id: string) => {
    console.log('Approved:', id);
  };

  /**
   * Placeholder for rejecting a specific redaction.
   * @param id The ID of the redaction to reject.
   */
  const handleRejectRedaction = (id: string) => {
    console.log('Rejected:', id);
  };

  /**
   * Adds an annotation to a specific redaction.
   * @param id The ID of the redaction to annotate.
   * @param annotation The annotation text to add.
   */
  const handleAddAnnotation = (id: string, annotation: string) => {
    setAnnotations(prev => ({
      ...prev,
      [id]: [...(prev[id] || []), annotation]
    }));
  };

  /**
   * Handler triggered by the 'Process' or similar button in RedactionControls.
   * Can be used to re-apply redactions with current settings.
   */
  const handleReProcess = async () => {
    if (selectedFile) { // Use selectedFile as a check if processing is valid
      console.log("Re-applying redactions...");
      /*
      await applyRedactions({ 
        sensitivityLevel, 
        showPII, 
        showFinancial, 
        showDates 
      });
      */
    }
  };

  return (
    <div className="min-h-screen bg-white dark:bg-gray-900 transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <header className="flex justify-between items-center mb-8 pb-4 border-b border-gray-200 dark:border-gray-700">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Redactly</h1>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
              AI-powered document redaction
            </p>
          </div>
          <ThemeToggle />
        </header>

        <main>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-8">
              {!selectedFile ? (
                <DocumentUpload onDocumentProcessed={handleFileSelected} />
              ) : (
                <>
                  <DocumentPreview
                    documentData={fileArrayBuffer}
                    isLoading={isLoading}
                  />
                  <RedactionControls
                    redactionMode={redactionMode}
                    onRedactionModeChange={handleRedactionModeChange}
                    sensitivityLevel={sensitivityLevel}
                    onSensitivityChange={handleSensitivityChange}
                    showPII={showPII}
                    onShowPIIChange={(value) => handleFilterChange('showPII', value)}
                    showFinancial={showFinancial}
                    onShowFinancialChange={(value) => handleFilterChange('showFinancial', value)}
                    showDates={showDates}
                    onShowDatesChange={(value) => handleFilterChange('showDates', value)}
                    onProcessDocument={handleReProcess}
                    isProcessing={isLoading}
                  />
                </>
              )}
            </div>

            <div className="lg:col-span-1">
              <RedactionDetailsPanel
                 selectedRedaction={selectedRedaction}
                 onApprove={handleApproveRedaction}
                 onReject={handleRejectRedaction}
                 onAddAnnotation={handleAddAnnotation}
              />
            </div>
          </div>
        </main>
      </div>
      <Toaster position="top-right" />
    </div>
  );
}

export default App;
