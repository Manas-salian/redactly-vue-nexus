
import React, { useState, useEffect } from 'react';
import DocumentUpload from '@/components/DocumentUpload';
import DocumentPreview from '@/components/DocumentPreview';
import RedactionControls from '@/components/RedactionControls';
import RedactionDetailsPanel from '@/components/RedactionDetailsPanel';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { FileWarning, Upload } from 'lucide-react';

// Mock data for redactions
const MOCK_REDACTIONS = {
  '1': { id: '1', text: 'Project Nexus', type: 'Project Name', confidence: 95, needsReview: false, annotations: [] },
  '2': { id: '2', text: 'John Smith', type: 'Person Name', confidence: 92, needsReview: false, annotations: [] },
  '3': { id: '3', text: 'john.smith@example.com', type: 'Email Address', confidence: 98, needsReview: false, annotations: [] },
  '4': { id: '4', text: '+1 (555) 123-4567', type: 'Phone Number', confidence: 95, needsReview: false, annotations: [] },
  '5': { id: '5', text: '$1,250,000', type: 'Financial Amount', confidence: 90, needsReview: false, annotations: [] },
  '6': { id: '6', text: 'European market', type: 'Location', confidence: 75, needsReview: true, annotations: [] },
  '7': { id: '7', text: 'Germany and France', type: 'Location', confidence: 88, needsReview: false, annotations: [] },
  '8': { id: '8', text: 'CONFIDENTIAL', type: 'Classification', confidence: 60, needsReview: true, annotations: [] },
  '9': { id: '9', text: 'Sarah Johnson', type: 'Person Name', confidence: 94, needsReview: false, annotations: [] },
  '10': { id: '10', text: 'Michael Chen', type: 'Person Name', confidence: 92, needsReview: false, annotations: [] },
  '11': { id: '11', text: 'David Rodriguez', type: 'Person Name', confidence: 91, needsReview: false, annotations: [] },
  '12': { id: '12', text: 'Amanda Peterson', type: 'Person Name', confidence: 93, needsReview: false, annotations: [] },
  '13': { id: '13', text: 'January 15, 2026', type: 'Date', confidence: 85, needsReview: false, annotations: [] },
  '14': { id: '14', text: 'March 31, 2026', type: 'Date', confidence: 87, needsReview: false, annotations: [] },
  '15': { id: '15', text: '12-3456789', type: 'Tax ID', confidence: 96, needsReview: false, annotations: [] },
  '16': { id: '16', text: '987654321', type: 'DUNS Number', confidence: 89, needsReview: false, annotations: [] },
  '17': { id: '17', text: 'First National Bank', type: 'Organization Name', confidence: 82, needsReview: false, annotations: [] },
  '18': { id: '18', text: 'XXXX-XXXX-1234', type: 'Account Number', confidence: 97, needsReview: false, annotations: [] },
};

const Index = () => {
  const [currentTab, setCurrentTab] = useState('upload');
  const [documentUrl, setDocumentUrl] = useState<string | undefined>();
  const [isLoading, setIsLoading] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [redactionMode, setRedactionMode] = useState<'blackout' | 'deidentify' | 'none'>('none');
  const [sensitivityLevel, setSensitivityLevel] = useState(50);
  const [showPII, setShowPII] = useState(true);
  const [showFinancial, setShowFinancial] = useState(true);
  const [showDates, setShowDates] = useState(true);
  const [selectedRedactionId, setSelectedRedactionId] = useState<string | null>(null);
  const [redactions, setRedactions] = useState<Record<string, any>>(MOCK_REDACTIONS);
  
  const { toast } = useToast();

  const handleFileUpload = (file: File) => {
    // In a real app, this would create a URL for the file
    setIsLoading(true);
    
    // Simulate file processing
    setTimeout(() => {
      setDocumentUrl(`preview-${file.name}`); // This is just a placeholder, not a real URL
      setIsLoading(false);
      toast({
        title: "Document uploaded successfully",
        description: `${file.name} is ready for processing`,
      });
    }, 1500);
  };

  const handleRedactionModeChange = (mode: 'blackout' | 'deidentify' | 'none') => {
    setRedactionMode(mode);
  };

  const handleProcessDocument = () => {
    if (!documentUrl) {
      toast({
        title: "No document to process",
        description: "Please upload a document first",
        variant: "destructive"
      });
      return;
    }
    
    setIsProcessing(true);
    
    // Simulate AI processing
    setTimeout(() => {
      setIsProcessing(false);
      setCurrentTab('review');
      toast({
        title: "Document processed",
        description: "AI redaction completed successfully. Review the results."
      });
    }, 2000);
  };

  const handleRedactionClick = (id: string) => {
    setSelectedRedactionId(id);
  };

  const handleApproveRedaction = (id: string) => {
    toast({
      title: "Redaction approved",
      description: `The redaction for "${redactions[id].text}" has been approved.`
    });
    
    // In a real app, this would update the redaction status in the backend
  };

  const handleRejectRedaction = (id: string) => {
    toast({
      title: "Redaction rejected",
      description: `The redaction for "${redactions[id].text}" has been rejected.`
    });
    
    // In a real app, this would update the redaction status in the backend
  };

  const handleAddAnnotation = (id: string, annotation: string) => {
    setRedactions(prev => ({
      ...prev,
      [id]: {
        ...prev[id],
        annotations: [...(prev[id].annotations || []), annotation]
      }
    }));
    
    toast({
      title: "Annotation added",
      description: "Your annotation has been saved."
    });
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="bg-white dark:bg-background border-b border-border">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <FileWarning className="h-6 w-6 text-primary" />
            <h1 className="text-xl font-semibold text-foreground">Redactly</h1>
          </div>
          
          {documentUrl && (
            <Button 
              variant="outline" 
              className="flex items-center"
              onClick={() => setCurrentTab('upload')}
            >
              <Upload className="h-4 w-4 mr-2" />
              New Document
            </Button>
          )}
        </div>
      </header>
      
      <main className="container mx-auto p-4 md:p-6">
        <Tabs
          value={currentTab}
          onValueChange={setCurrentTab}
          className="space-y-6"
        >
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="upload">Upload & Configure</TabsTrigger>
            <TabsTrigger value="review" disabled={!documentUrl}>Review & Redact</TabsTrigger>
          </TabsList>
          
          <TabsContent value="upload" className="space-y-6 animate-fade-in">
            <div className="grid gap-6 md:grid-cols-2">
              <div>
                <h2 className="text-lg font-medium mb-4">Upload Document</h2>
                <DocumentUpload onFileUpload={handleFileUpload} />
              </div>
              
              <div>
                <h2 className="text-lg font-medium mb-4">Redaction Settings</h2>
                <RedactionControls 
                  redactionMode={redactionMode}
                  onRedactionModeChange={handleRedactionModeChange}
                  sensitivityLevel={sensitivityLevel}
                  onSensitivityChange={setSensitivityLevel}
                  showPII={showPII}
                  onShowPIIChange={setShowPII}
                  showFinancial={showFinancial}
                  onShowFinancialChange={setShowFinancial}
                  showDates={showDates}
                  onShowDatesChange={setShowDates}
                  onProcessDocument={handleProcessDocument}
                  isProcessing={isProcessing}
                />
              </div>
            </div>
            
            <div>
              <h2 className="text-lg font-medium mb-4">Document Preview</h2>
              <DocumentPreview 
                documentUrl={documentUrl}
                isLoading={isLoading}
                redactionMode="none"
              />
            </div>
          </TabsContent>
          
          <TabsContent value="review" className="space-y-6 animate-fade-in">
            <div className="grid gap-6 lg:grid-cols-3">
              <div className="lg:col-span-2">
                <h2 className="text-lg font-medium mb-4">Redacted Document</h2>
                <DocumentPreview 
                  documentUrl={documentUrl}
                  redactionMode={redactionMode}
                  onRedactionClick={handleRedactionClick}
                />
              </div>
              
              <div>
                <h2 className="text-lg font-medium mb-4">Redaction Details</h2>
                <RedactionDetailsPanel 
                  selectedRedaction={selectedRedactionId ? redactions[selectedRedactionId] : null}
                  onApprove={handleApproveRedaction}
                  onReject={handleRejectRedaction}
                  onAddAnnotation={handleAddAnnotation}
                />
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
};

export default Index;
