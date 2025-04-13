import React, { useState, useEffect, useRef } from 'react';
import * as pdfjsLib from 'pdfjs-dist';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { FileText, Lock } from 'lucide-react';

// Set worker source to the local module file
pdfjsLib.GlobalWorkerOptions.workerSrc = `/pdf.worker.min.mjs`; 

interface DocumentPreviewProps {
  documentData?: ArrayBuffer | null | undefined;
  isLoading?: boolean;
}

const DocumentPreview: React.FC<DocumentPreviewProps> = ({
  documentData,
  isLoading = false,
}) => {
  const canvasContainerRef = useRef<HTMLDivElement>(null);
  const [pdfDoc, setPdfDoc] = useState<pdfjsLib.PDFDocumentProxy | null>(null);
  const [pdfError, setPdfError] = useState<string | null>(null);
  const [internalLoading, setInternalLoading] = useState(false);
  const [renderedPages, setRenderedPages] = useState(0);

  useEffect(() => {
    if (!documentData) {
      setPdfDoc(null);
      setPdfError(null);
      setInternalLoading(false);
      setRenderedPages(0);
      if (canvasContainerRef.current) {
        canvasContainerRef.current.innerHTML = '';
      }
      return;
    }

    const loadingTask = pdfjsLib.getDocument({ data: documentData });
    setInternalLoading(true);
    setPdfDoc(null);
    setPdfError(null);
    setRenderedPages(0);
    if (canvasContainerRef.current) {
      canvasContainerRef.current.innerHTML = '';
    }

    loadingTask.promise.then(
      (doc) => {
        setPdfDoc(doc);
        setInternalLoading(false);
      },
      (reason) => {
        setPdfError('Failed to load PDF document.');
        setPdfDoc(null);
        setInternalLoading(false);
      }
    );

    return () => {
      loadingTask.destroy();
      setPdfDoc(null);
    };
  }, [documentData]);

  useEffect(() => {
    if (!pdfDoc || !canvasContainerRef.current) return;

    const container = canvasContainerRef.current;
    container.innerHTML = '';

    let pagesRendered = 0;
    const renderPage = async (pageNum: number) => {
      try {
        const page = await pdfDoc.getPage(pageNum);
        const desiredWidth = 800;
        const viewport = page.getViewport({ scale: 1 });
        const scale = desiredWidth / viewport.width;
        const scaledViewport = page.getViewport({ scale });

        const canvas = document.createElement('canvas');
        canvas.height = scaledViewport.height;
        canvas.width = scaledViewport.width;
        canvas.style.backgroundColor = '#ffffff';
        canvas.style.display = 'block';
        canvas.style.marginBottom = '1rem';
        canvas.style.boxShadow = '0 4px 6px rgba(0, 0, 0, 0.1)';

        container.appendChild(canvas);

        const context = canvas.getContext('2d');
        if (!context) throw new Error('Could not get canvas context');

        const renderContext = {
          canvasContext: context,
          viewport: scaledViewport,
        };

        await page.render(renderContext).promise;

        pagesRendered++;
        setRenderedPages(pagesRendered);
      } catch (error) {
        console.error(`Error rendering page ${pageNum}:`, error);
      }
    };

    for (let i = 1; i <= pdfDoc.numPages; i++) {
      renderPage(i);
    }

    return () => {
      if (canvasContainerRef.current) {
        canvasContainerRef.current.innerHTML = '';
      }
    };
  }, [pdfDoc]);

  const combinedIsLoading = isLoading || internalLoading;

  return (
    <Card className="relative h-[800px] w-full overflow-hidden shadow-lg">
      <CardContent
        className="p-4 h-full overflow-auto"
        style={{ backgroundColor: '#ffffff' }}
      >
        <div className="absolute top-4 right-4 z-20">
          <Badge variant="outline" className="bg-background/80 backdrop-blur-sm">
            <Lock className="h-3 w-3 mr-1" /> Preview Mode
          </Badge>
        </div>

        {combinedIsLoading && (
          <div className="absolute inset-0 flex items-center justify-center z-10">
            <div className="text-center">
              <Skeleton className="h-40 w-40 rounded-lg mx-auto" />
              <p className="mt-4 text-muted-foreground">Loading document...</p>
            </div>
          </div>
        )}

        {pdfError && !combinedIsLoading && (
          <div className="absolute inset-0 flex items-center justify-center z-10 bg-background/80">
            <div className="text-center p-4">
              <p className="text-red-600">{pdfError}</p>
            </div>
          </div>
        )}

        {!documentData && !combinedIsLoading && !pdfError && (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-center">
              <FileText className="h-16 w-16 mx-auto text-muted-foreground" />
              <p className="mt-4 text-muted-foreground">Upload a document to view the preview</p>
            </div>
          </div>
        )}

        <div className="absolute bottom-2 left-4 text-sm text-muted-foreground z-10">
          {pdfDoc && renderedPages < pdfDoc.numPages && (
            <span>Rendering page {renderedPages + 1} of {pdfDoc.numPages}...</span>
          )}
          {pdfDoc && renderedPages === pdfDoc.numPages && (
            <span>Document fully rendered.</span>
          )}
        </div>

        <div
          ref={canvasContainerRef}
          className="pdf-canvas-container"
          style={{ backgroundColor: '#ffffff', colorScheme: 'light' }}
        ></div>
      </CardContent>
    </Card>
  );
};

export default DocumentPreview;
