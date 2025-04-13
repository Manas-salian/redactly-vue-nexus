import React, { useState, useRef, useCallback } from 'react';
import { DocumentService, ProcessedDocument } from '../services/documentService';

const DocumentUploader: React.FC = () => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [processing, setProcessing] = useState(false);
  const [processedDocument, setProcessedDocument] = useState<ProcessedDocument | null>(null);
  const [isDragging, setIsDragging] = useState(false);

  const documentService = DocumentService.getInstance();

  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files?.length) {
      await processFile(event.target.files[0]);
    }
  };

  const handleDragOver = useCallback((event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback(async (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    setIsDragging(false);
    if (event.dataTransfer?.files.length) {
      await processFile(event.dataTransfer.files[0]);
    }
  }, []);

  const processFile = async (file: File) => {
    if (!file.type.includes('pdf') && !file.name.endsWith('.docx')) {
      alert('Please upload a PDF or DOCX file');
      return;
    }

    setProcessing(true);
    setProcessedDocument(null); // Clear previous results
    try {
      const result = await documentService.processDocument(file);
      setProcessedDocument(result);
    } catch (error) {
      console.error('Error processing document:', error);
      alert('Error processing document. Please try again.');
    } finally {
      setProcessing(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto">
      <div
        className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-all duration-200 
          ${isDragging 
            ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/10' 
            : 'border-gray-300 dark:border-gray-700 hover:border-primary-400 hover:bg-gray-50 dark:hover:bg-gray-800'
          }`}
        onClick={triggerFileInput}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept=".pdf,.docx,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
          onChange={handleFileSelect}
          className="hidden"
        />
        <div className="flex flex-col items-center gap-4 pointer-events-none">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="48"
            height="48"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="w-12 h-12 text-primary-500 dark:text-primary-400"
          >
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
            <polyline points="17 8 12 3 7 8" />
            <line x1="12" y1="3" x2="12" y2="15" />
          </svg>
          <p className="text-gray-700 dark:text-gray-300 text-lg font-medium">
            Drag and drop your document here, or click to select
          </p>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Supported formats: PDF, DOCX
          </p>
        </div>
      </div>

      {processing && (
        <div className="mt-8 text-center">
          <div className="w-10 h-10 border-4 border-gray-200 dark:border-gray-700 border-t-primary-500 dark:border-t-primary-400 rounded-full animate-spin mx-auto"></div>
          <p className="mt-4 text-gray-600 dark:text-gray-400">Processing document...</p>
        </div>
      )}

      {processedDocument && (
        <div className="mt-8 bg-white dark:bg-gray-800 rounded-lg shadow p-6 animate-fadeIn">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">Document Analysis</h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6 pb-4 border-b border-gray-200 dark:border-gray-700">
            <div className="p-3 bg-gray-50 dark:bg-gray-900 rounded">
              <p className="text-sm text-gray-500 dark:text-gray-400">Type</p>
              <p className="font-medium text-gray-900 dark:text-white">{processedDocument.metadata.type.toUpperCase()}</p>
            </div>
            
            {processedDocument.metadata.pageCount !== undefined && (
              <div className="p-3 bg-gray-50 dark:bg-gray-900 rounded">
                <p className="text-sm text-gray-500 dark:text-gray-400">Pages</p>
                <p className="font-medium text-gray-900 dark:text-white">{processedDocument.metadata.pageCount}</p>
              </div>
            )}
            
            <div className="p-3 bg-gray-50 dark:bg-gray-900 rounded">
              <p className="text-sm text-gray-500 dark:text-gray-400">Word Count</p>
              <p className="font-medium text-gray-900 dark:text-white">{processedDocument.metadata.wordCount}</p>
            </div>
          </div>

          {processedDocument.entities.length > 0 && (
            <div className="mt-4">
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-3">Detected Entities</h3>
              <div className="flex flex-wrap gap-2">
                {processedDocument.entities.map((entity, index) => (
                  <div key={index} className="flex items-center bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded px-3 py-1.5">
                    <span className="px-2 py-0.5 bg-primary-100 dark:bg-primary-900 text-primary-800 dark:text-primary-200 text-xs font-medium rounded mr-2">
                      {entity.type}
                    </span>
                    <span className="text-sm text-gray-700 dark:text-gray-300">{entity.text}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default DocumentUploader; 