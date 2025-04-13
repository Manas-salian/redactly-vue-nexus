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

// We need a separate component to use the theme context
function AppContent() {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [fileArrayBuffer, setFileArrayBuffer] = useState<ArrayBuffer | null>(null);
  const [redactionMode, setRedactionMode] = useState<'blackout' | 'deidentify' | 'none'>('none');
  const [sensitivityLevel, setSensitivityLevel] = useState(50);
  const [showPII, setShowPII] = useState(true);
  const [showFinancial, setShowFinancial] = useState(true);
  const [showDates, setShowDates] = useState(true);
  const [selectedRedactionId, setSelectedRedactionId] = useState<string | null>(null);
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

  const selectedRedaction = selectedRedactionId && redactionResult?.redactions.find(
    r => r.id === selectedRedactionId
  ) || null;

  const handleFileSelected = async (file: File) => {
    setSelectedFile(file);
    setFileArrayBuffer(null);

    const reader = new FileReader();
    reader.onload = async (e) => {
      const buffer = e.target?.result as ArrayBuffer;
      setFileArrayBuffer(buffer);

      const processedDoc = await processDocument(file);

      if (processedDoc) {
        await applyRedactions({
          sensitivityLevel,
          showPII,
          showFinancial,
          showDates
        });
      }
    };
    reader.onerror = (e) => {
      console.error("Failed to read file:", e);
      setFileArrayBuffer(null);
      reset();
    };
    reader.readAsArrayBuffer(file);
  };

  const handleRedactionModeChange = (mode: 'blackout' | 'deidentify' | 'none') => {
    setRedactionMode(mode);
  };

  const handleSensitivityChange = async (value: number) => {
    setSensitivityLevel(value);
    await applyRedactions({ sensitivityLevel: value, showPII, showFinancial, showDates });
  };

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
    await applyRedactions(updatedOptions);
  };

  const handleApproveRedaction = (id: string) => {
    console.log('Approved:', id);
  };

  const handleRejectRedaction = (id: string) => {
    console.log('Rejected:', id);
  };

  const handleAddAnnotation = (id: string, annotation: string) => {
    setAnnotations(prev => ({
      ...prev,
      [id]: [...(prev[id] || []), annotation]
    }));
  };

  // Handler for the process button in controls (example: re-apply redactions)
  const handleReProcess = async () => {
    if (selectedFile) { // Use selectedFile as a check if processing is valid
      console.log("Re-applying redactions...");
      await applyRedactions({ 
        sensitivityLevel, 
        showPII, 
        showFinancial, 
        showDates 
      });
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
