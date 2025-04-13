import React, { useCallback } from 'react';
import { useDropzone, DropzoneOptions, FileRejection } from 'react-dropzone';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Upload, FileText, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';

/**
 * Props for the DocumentUpload component.
 */
interface DocumentUploadProps {
  /** 
   * Callback function triggered when a valid document is selected and dropped.
   * Note: The original implementation included processing via a hook, which is removed here.
   * This callback now simply receives the selected file.
   */
  onDocumentProcessed: (file: File) => void;
  /** Optional flag to indicate if an operation (like uploading or initial processing) is in progress. */
  isLoading?: boolean; 
}

/**
 * A component that allows users to upload documents (PDF, DOCX) via drag-and-drop or file selection.
 * Displays loading and error states.
 */
const DocumentUpload: React.FC<DocumentUploadProps> = ({ onDocumentProcessed, isLoading = false }) => {

  /**
   * Handles the drop event when files are dragged onto the dropzone.
   * Validates the file type and calls the onDocumentProcessed callback.
   * @param acceptedFiles Array of files accepted by the dropzone configuration.
   * @param fileRejections Array of files rejected by the dropzone configuration.
   */
  const onDrop = useCallback(async (acceptedFiles: File[], fileRejections: FileRejection[]) => {
    if (fileRejections.length > 0) {
      fileRejections.forEach(({ errors }) => {
        errors.forEach(err => {
          if (err.code === 'file-invalid-type') {
            toast.error('Invalid file type. Please upload a PDF or DOCX file.');
          } else {
            toast.error(`File error: ${err.message}`);
          }
        });
      });
      return;
    }

    if (acceptedFiles.length === 0) return;

    const file = acceptedFiles[0];
    
    // Basic check - react-dropzone's accept prop handles more robust validation
    if (!file.type.includes('pdf') && !file.name.toLowerCase().endsWith('.pdf') && 
        !file.type.includes('vnd.openxmlformats-officedocument.wordprocessingml.document') && !file.name.toLowerCase().endsWith('.docx')) {
      toast.error('Please upload a PDF or DOCX file.');
      return;
    }

    try {
      // Directly call the callback provided by the parent component
      onDocumentProcessed(file);
      // Toast moved to parent or hook if needed after actual processing
      // toast.success('Document selected'); 
    } catch (err) {
      console.error("Error in onDrop handler (should not happen if onDocumentProcessed is simple):");
      toast.error('An unexpected error occurred while handling the file.');
    }
  }, [onDocumentProcessed]);

  /** Configuration for the react-dropzone hook. */
  const dropzoneOptions: DropzoneOptions = {
    onDrop,
    accept: {
      'application/pdf': ['.pdf'],
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx']
    },
    maxFiles: 1,
    multiple: false, // Ensure only one file can be dropped
  };

  const { getRootProps, getInputProps, isDragActive, fileRejections } = useDropzone(dropzoneOptions);

  const errorMessages = fileRejections.flatMap(rejection => 
    rejection.errors.map(error => error.message)
  );

  return (
    <Card>
      <CardContent className="p-6">
        <div
          {...getRootProps()}
          className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-all duration-200 
            ${
              isDragActive
                ? 'border-primary bg-primary/10'
                : 'border-gray-300 dark:border-gray-700 hover:border-primary/70 hover:bg-gray-50 dark:hover:bg-gray-800/50'
            }
            ${
              isLoading ? 'opacity-50 cursor-not-allowed' : ''
            }`}
        >
          <input {...getInputProps()} disabled={isLoading} />
          <div className="flex flex-col items-center justify-center space-y-4">
            <Upload className={`h-12 w-12 ${isDragActive ? 'text-primary' : 'text-gray-400 dark:text-gray-500'}`} />
            {isDragActive ? (
              <p className="text-lg font-medium text-primary">Drop the document here...</p>
            ) : (
              <>
                <p className="text-lg font-medium text-gray-700 dark:text-gray-300">
                  Drag & drop a document here, or click to select
                </p>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Supported formats: PDF, DOCX
                </p>
                <Button variant="outline" size="sm" className="mt-2" disabled={isLoading}>
                  {isLoading ? 'Processing...' : 'Select Document'}
                </Button>
              </>
            )}
          </div>
        </div>
        {errorMessages.length > 0 && (
          <div className="mt-4 space-y-1">
            {errorMessages.map((error, index) => (
              <p key={index} className="text-sm text-red-600 flex items-center">
                <AlertCircle className="h-4 w-4 mr-1.5 flex-shrink-0" />
                {error}
              </p>
            ))}
          </div>
        )}
         {isLoading && (
          <div className="mt-4 text-center text-sm text-gray-600 dark:text-gray-400">
            Processing document...
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default DocumentUpload;
