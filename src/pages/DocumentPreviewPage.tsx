
import React, { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import DocumentPreview from '@/components/DocumentPreview';
import RedactionDetailsPanel from '@/components/RedactionDetailsPanel';
import { Button } from '@/components/ui/button';
import { ArrowLeft, CheckCircle } from 'lucide-react';

interface LocationState {
  documentUrl?: string;
  redactionMode: 'blackout' | 'deidentify' | 'none';
  selectedRedactionId?: string | null;
  redactions?: Record<string, any>;
}

const DocumentPreviewPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const state = location.state as LocationState;
  
  const { 
    documentUrl, 
    redactionMode = 'none', 
    selectedRedactionId = null,
    redactions = {}
  } = state || {};
  
  useEffect(() => {
    if (!documentUrl) {
      navigate('/');
    }
  }, [documentUrl, navigate]);
  
  const handleRedactionClick = (id: string) => {
    // In a real application, we would update the state here
    console.log('Redaction clicked:', id);
  };
  
  const handleApproveRedaction = (id: string) => {
    console.log('Redaction approved:', id);
  };
  
  const handleRejectRedaction = (id: string) => {
    console.log('Redaction rejected:', id);
  };
  
  const handleAddAnnotation = (id: string, annotation: string) => {
    console.log('Annotation added:', id, annotation);
  };
  
  const handleBackToMain = () => {
    navigate('/');
  };
  
  const handleFinalize = () => {
    // In a real app, this would save the final redacted document
    navigate('/', { state: { documentProcessed: true } });
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="bg-white dark:bg-background border-b border-border">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Button 
              variant="ghost" 
              size="icon"
              onClick={handleBackToMain}
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <h1 className="text-xl font-semibold text-foreground">Document Preview</h1>
          </div>
          
          <Button 
            onClick={handleFinalize}
            className="flex items-center"
          >
            <CheckCircle className="h-4 w-4 mr-2" />
            Finalize Document
          </Button>
        </div>
      </header>
      
      <main className="container mx-auto p-4 md:p-6">
        <div className="grid gap-6 lg:grid-cols-3">
          <div className="lg:col-span-2">
            <h2 className="text-lg font-medium mb-4 text-foreground">Redacted Document</h2>
            <DocumentPreview 
              documentUrl={documentUrl}
              redactionMode={redactionMode}
              onRedactionClick={handleRedactionClick}
            />
          </div>
          
          <div>
            <h2 className="text-lg font-medium mb-4 text-foreground">Redaction Details</h2>
            <RedactionDetailsPanel 
              selectedRedaction={selectedRedactionId ? redactions[selectedRedactionId] : null}
              onApprove={handleApproveRedaction}
              onReject={handleRejectRedaction}
              onAddAnnotation={handleAddAnnotation}
            />
          </div>
        </div>
      </main>
    </div>
  );
};

export default DocumentPreviewPage;
