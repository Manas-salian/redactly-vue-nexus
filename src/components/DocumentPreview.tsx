import React, { useState, useEffect, useRef } from 'react';
import * as pdfjsLib from 'pdfjs-dist';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { FileText, Lock, AlertTriangle } from 'lucide-react';

// Set worker source for pdf.js
pdfjsLib.GlobalWorkerOptions.workerSrc = `/pdf.worker.min.mjs`;

/**
 * Props for the DocumentPreview component.
 */
interface DocumentPreviewProps {
  /** The ArrayBuffer containing the PDF document data. */
  documentData?: ArrayBuffer | null | undefined;
  /** Optional flag to indicate if the document is being loaded or processed externally. */
  isLoading?: boolean;
}

/**
 * Renders a preview of a PDF document using pdf.js.
 * Handles loading states, errors, and renders pages onto canvas elements.
 */
const DocumentPreview: React.FC<DocumentPreviewProps> = ({
  documentData,
  isLoading = false,
}) => {
  /** Ref to the container div where canvas elements will be appended. */
  const canvasContainerRef = useRef<HTMLDivElement>(null);
  /** State holding the pdf.js document proxy object once loaded. */
  const [pdfDoc, setPdfDoc] = useState<pdfjsLib.PDFDocumentProxy | null>(null);
  /** State for storing any PDF loading or rendering errors. */
  const [pdfError, setPdfError] = useState<string | null>(null);
  /** State indicating if the component is internally loading/parsing the PDF. */
  const [internalLoading, setInternalLoading] = useState(false);
  /** State tracking the number of pages successfully rendered. */
  const [renderedPages, setRenderedPages] = useState(0);

  /** Effect to load the PDF document when documentData changes. */
  useEffect(() => {
    // Cleanup previous state if documentData is null/undefined
    if (!documentData) {
      setPdfDoc(null);
      setPdfError(null);
      setInternalLoading(false);
      setRenderedPages(0);
      if (canvasContainerRef.current) {
        canvasContainerRef.current.innerHTML = ''; // Clear previous render
      }
      return;
    }

    console.log("DocumentPreview: Received new documentData, attempting to load.");
    setInternalLoading(true);
    setPdfDoc(null);
    setPdfError(null);
    setRenderedPages(0);
    if (canvasContainerRef.current) {
      canvasContainerRef.current.innerHTML = ''; // Clear previous render
    }

    // Ensure documentData is a valid ArrayBuffer before passing to pdfjsLib
    // Although the prop type is ArrayBuffer, it might arrive as null/undefined transiently.
    if (!(documentData instanceof ArrayBuffer) || documentData.byteLength === 0) {
        console.warn("DocumentPreview: Invalid documentData received (not an ArrayBuffer or empty).");
        setPdfError('Invalid document data provided for preview.');
        setInternalLoading(false);
        return;
    }

    // Create a loading task using pdf.js
    // IMPORTANT: We assume documentData is a fresh ArrayBuffer (e.g., copied by the parent)
    // to avoid detached buffer issues.
    const loadingTask = pdfjsLib.getDocument({ data: documentData });

    loadingTask.promise.then(
      (doc) => {
        console.log(`DocumentPreview: PDF loaded successfully with ${doc.numPages} pages.`);
        setPdfDoc(doc);
        setInternalLoading(false);
      },
      (reason) => {
        console.error('DocumentPreview: Failed to load PDF:', reason);
        // Provide a more specific error message if possible
        let errorMsg = 'Failed to load PDF document for preview.';
        if (reason instanceof Error) {
            errorMsg += ` Reason: ${reason.message}`;
        } else if (typeof reason === 'string') {
             errorMsg += ` Reason: ${reason}`;
        }
        setPdfError(errorMsg);
        setPdfDoc(null);
        setInternalLoading(false);
      }
    );

    // Cleanup function for the effect
    return () => {
      console.log("DocumentPreview: Cleaning up loading task.");
      loadingTask.destroy(); // Clean up pdf.js resources
      setPdfDoc(null); // Ensure pdfDoc is null on cleanup/re-run
    };
  }, [documentData]); // Rerun effect only when documentData changes

  /** Effect to render PDF pages when pdfDoc is loaded. */
  useEffect(() => {
    if (!pdfDoc || !canvasContainerRef.current) return;

    const container = canvasContainerRef.current;
    container.innerHTML = ''; // Clear any previous rendering remnants
    let pagesRenderedCount = 0;
    setRenderedPages(0); // Reset rendered pages count for new document

    console.log(`DocumentPreview: Rendering ${pdfDoc.numPages} pages...`);

    /**
     * Renders a single page of the PDF onto a canvas element.
     * @param pageNum The 1-based page number to render.
     */
    const renderPage = async (pageNum: number) => {
      try {
        const page = await pdfDoc.getPage(pageNum);
        const desiredWidth = container.clientWidth || 800; // Use container width or default
        const viewport = page.getViewport({ scale: 1 });
        const scale = desiredWidth / viewport.width;
        const scaledViewport = page.getViewport({ scale });

        const canvas = document.createElement('canvas');
        const context = canvas.getContext('2d');
        if (!context) throw new Error('Could not get canvas 2D context');

        canvas.height = scaledViewport.height;
        canvas.width = scaledViewport.width;
        canvas.style.backgroundColor = '#ffffff'; // Ensure background for text visibility
        canvas.style.display = 'block'; // Prevent extra space below canvas
        canvas.style.marginBottom = '1rem'; // Space between pages
        canvas.style.boxShadow = '0 2px 8px rgba(0, 0, 0, 0.1)'; // Subtle shadow

        // Append canvas before starting render to maintain order
        container.appendChild(canvas);

        const renderContext = {
          canvasContext: context,
          viewport: scaledViewport,
        };

        await page.render(renderContext).promise;
        console.log(`DocumentPreview: Rendered page ${pageNum}`);

        // Update rendered pages count *after* successful render
        pagesRenderedCount++;
        setRenderedPages(prev => prev + 1); // Use functional update for safety

      } catch (error) {
        console.error(`DocumentPreview: Error rendering page ${pageNum}:`, error);
        // Optionally display an error message per page or a general error
        setPdfError(`Error rendering page ${pageNum}. Please try reloading.`);
        // Stop rendering further pages on error?
      }
    };

    // Render all pages sequentially
    const renderAllPages = async () => {
        for (let i = 1; i <= pdfDoc.numPages; i++) {
            await renderPage(i);
            // Add a small delay if needed for smoother rendering, but usually not required
            // await new Promise(resolve => setTimeout(resolve, 10));
        }
         console.log("DocumentPreview: Finished rendering all pages.");
    };

    renderAllPages();

    // Cleanup function for the rendering effect
    return () => {
      console.log("DocumentPreview: Cleaning up rendered pages.");
      if (canvasContainerRef.current) {
        canvasContainerRef.current.innerHTML = ''; // Clear canvases on unmount/doc change
      }
      setRenderedPages(0); // Reset count on cleanup
    };
  }, [pdfDoc]); // Rerun effect only when pdfDoc changes

  /** Combined loading state from external prop and internal loading. */
  const combinedIsLoading = isLoading || internalLoading;

  return (
    <Card className="relative h-[70vh] w-full overflow-hidden shadow-lg border border-border">
      {/* Overlay for Loading State */}       
      {combinedIsLoading && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-background/80 backdrop-blur-sm z-10">
              <Skeleton className="h-32 w-32 rounded-lg mb-4" />
              <p className="text-lg font-medium text-muted-foreground">Loading document preview...</p>
          </div>
      )}

      {/* Overlay for Error State */}       
      {pdfError && !combinedIsLoading && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-destructive/10 backdrop-blur-sm z-10 p-4">
               <AlertTriangle className="h-12 w-12 text-destructive mb-4" />
               <p className="text-lg font-semibold text-destructive text-center mb-2">Error Loading Preview</p>
               <p className="text-sm text-destructive/90 text-center">{pdfError}</p>
               <p className="text-xs text-muted-foreground mt-3 text-center">Please check the console for more details or try uploading the file again.</p>
          </div>
      )}

      {/* Placeholder when no document is loaded */}       
      {!documentData && !combinedIsLoading && !pdfError && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-background/50 z-10">
              <FileText className="h-16 w-16 text-muted-foreground/50 mb-4" />
              <p className="text-lg text-muted-foreground text-center">Upload a document (PDF or DOCX) to see the preview here.</p>
          </div>
      )}
      
      {/* Main Content Area */}       
      <CardContent
        className="p-4 h-full overflow-auto relative"
        style={{ backgroundColor: '#f8f9fa' }} // Light background for contrast
      >
        {/* Preview Mode Badge */}       
        <div className="absolute top-2 right-2 z-20">
          <Badge variant="outline" className="bg-background/80 backdrop-blur-sm text-xs px-2 py-1">
            <Lock className="h-3 w-3 mr-1" /> Preview Mode
          </Badge>
        </div>
        
        {/* Page Rendering Status */}       
        <div className="absolute bottom-2 left-4 text-xs text-muted-foreground z-10 bg-background/80 px-2 py-1 rounded">
          {pdfDoc && renderedPages < pdfDoc.numPages && combinedIsLoading && (
            <span>Loading preview...</span>
          )}
          {pdfDoc && renderedPages < pdfDoc.numPages && !combinedIsLoading && (
            <span>Rendering page {renderedPages + 1} of {pdfDoc.numPages}...</span>
          )}
          {pdfDoc && renderedPages === pdfDoc.numPages && !combinedIsLoading && (
            <span>{pdfDoc.numPages} {pdfDoc.numPages === 1 ? 'page' : 'pages'} rendered.</span>
          )}
        </div>

        {/* Container for PDF page canvases */}       
        <div
          ref={canvasContainerRef}
          className="pdf-canvas-container flex flex-col items-center pt-8 pb-12"
          // Added padding top/bottom inside scrollable area
        >
          {/* Canvases are appended here by the useEffect hook */}       
        </div>
      </CardContent>
    </Card>
  );
};

export default DocumentPreview;
