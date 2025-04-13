import React, { useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Upload, FileText, AlertCircle } from 'lucide-react';
import { useDocumentProcessor } from '@/hooks/useDocumentProcessor';
import { toast } from 'sonner';

interface DocumentUploadProps {
  onDocumentProcessed: (file: File) => void;
}

const DocumentUpload: React.FC<DocumentUploadProps> = ({ onDocumentProcessed }) => {
  const { processDocument, isLoading, error } = useDocumentProcessor();

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    if (acceptedFiles.length === 0) return;

    const file = acceptedFiles[0];
    if (!file.type.includes('pdf') && !file.type.includes('docx')) {
      toast.error('Please upload a PDF or DOCX file');
      return;
    }

    try {
      await processDocument(file);
      onDocumentProcessed(file);
      toast.success('Document processed successfully');
    } catch (err) {
      toast.error('Failed to process document');
    }
  }, [processDocument, onDocumentProcessed]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/pdf': ['.pdf'],
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx']
    },
    maxFiles: 1
  });

  return (
    <Card>
      <CardContent className="p-6">
        <div
          {...getRootProps()}
          className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors
            ${isDragActive ? 'border-primary bg-primary/5' : 'border-muted-foreground/25 hover:border-primary'}`}
        >
          <input {...getInputProps()} />
          
          {isLoading ? (
            <div className="flex flex-col items-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mb-4" />
              <p className="text-muted-foreground">Processing document...</p>
            </div>
          ) : (
            <>
              <Upload className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
              <p className="text-lg font-medium mb-2">
                {isDragActive ? 'Drop the file here' : 'Drag and drop your document here'}
              </p>
              <p className="text-sm text-muted-foreground mb-4">
                Supported formats: PDF, DOCX
              </p>
              <Button variant="outline">
                <FileText className="h-4 w-4 mr-2" />
                Select File
              </Button>
            </>
          )}

          {error && (
            <div className="mt-4 flex items-center justify-center text-destructive">
              <AlertCircle className="h-4 w-4 mr-2" />
              <span>{error}</span>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default DocumentUpload;
