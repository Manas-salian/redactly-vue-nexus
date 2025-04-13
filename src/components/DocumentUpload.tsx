
import React, { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Upload, FileText, AlertTriangle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface DocumentUploadProps {
  onFileUpload: (file: File) => void;
}

const DocumentUpload: React.FC<DocumentUploadProps> = ({ onFileUpload }) => {
  const [isDragging, setIsDragging] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const file = e.dataTransfer.files[0];
      validateAndSetFile(file);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      validateAndSetFile(file);
    }
  };

  const validateAndSetFile = (file: File) => {
    const fileType = file.name.split('.').pop()?.toLowerCase();
    
    if (fileType !== 'pdf' && fileType !== 'docx') {
      toast({
        title: "Invalid file format",
        description: "Please upload PDF or DOCX files only",
        variant: "destructive"
      });
      return;
    }
    
    setSelectedFile(file);
    onFileUpload(file);
  };

  const handleButtonClick = () => {
    fileInputRef.current?.click();
  };

  return (
    <Card className="w-full">
      <CardContent className="p-6">
        <div
          className={`flex flex-col items-center justify-center border-2 border-dashed rounded-lg p-10 transition-colors ${
            isDragging ? 'border-primary bg-primary/5' : 'border-border'
          }`}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
        >
          <input
            type="file"
            accept=".pdf,.docx"
            className="hidden"
            onChange={handleFileChange}
            ref={fileInputRef}
          />
          
          {selectedFile ? (
            <div className="text-center animate-fade-in">
              <FileText className="h-12 w-12 text-primary mx-auto mb-4" />
              <h3 className="text-lg font-medium mb-1">{selectedFile.name}</h3>
              <p className="text-sm text-muted-foreground mb-4">
                {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
              </p>
              <Button onClick={handleButtonClick} variant="outline" className="mt-2">
                Choose another file
              </Button>
            </div>
          ) : (
            <>
              <Upload className="h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-medium mb-1">Drop your document here</h3>
              <p className="text-sm text-muted-foreground text-center mb-4">
                Supported formats: PDF, DOCX
              </p>
              <Button onClick={handleButtonClick}>Select File</Button>
              <div className="flex items-center mt-6 text-sm text-muted-foreground">
                <AlertTriangle className="h-4 w-4 mr-2" />
                <span>Max file size: 10MB</span>
              </div>
            </>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default DocumentUpload;
