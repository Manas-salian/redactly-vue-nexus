
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { FileText, Lock } from 'lucide-react';

interface DocumentPreviewProps {
  documentUrl?: string;
  isLoading?: boolean;
  redactionMode: 'blackout' | 'deidentify' | 'none';
  redactions?: Array<{
    id: string;
    x: number;
    y: number;
    width: number;
    height: number;
    text: string;
    type: string;
    confidence: number;
    needsReview: boolean;
  }>;
  onRedactionClick?: (id: string) => void;
}

const DocumentPreview: React.FC<DocumentPreviewProps> = ({
  documentUrl,
  isLoading = false,
  redactionMode = 'none',
  redactions = [],
  onRedactionClick
}) => {
  if (isLoading) {
    return (
      <Card className="document-container relative h-[800px] w-full">
        <CardContent className="p-0 h-full">
          <div className="absolute top-4 right-4 z-10">
            <Badge variant="outline" className="bg-background/80 backdrop-blur-sm">
              <Lock className="h-3 w-3 mr-1" /> Preview Mode
            </Badge>
          </div>
          <Skeleton className="h-full w-full" />
        </CardContent>
      </Card>
    );
  }

  if (!documentUrl) {
    return (
      <Card className="document-container relative h-[800px] w-full">
        <CardContent className="p-0 h-full flex items-center justify-center">
          <div className="text-center">
            <FileText className="h-16 w-16 mx-auto text-muted-foreground" />
            <p className="mt-4 text-muted-foreground">Upload a document to view the preview</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  // This would be a real document preview in production
  // For now we're using a placeholder with simulated content
  return (
    <Card className="document-container relative h-[800px] w-full">
      <CardContent className="p-0 h-full">
        <div className="absolute top-4 right-4 z-10">
          <Badge variant="outline" className="bg-background/80 backdrop-blur-sm">
            <Lock className="h-3 w-3 mr-1" /> Preview Mode
          </Badge>
        </div>
        
        {/* Simulated document content */}
        <div className="p-8 h-full overflow-auto font-serif text-black relative">
          <h1 className="text-2xl font-bold mb-6">Confidential Project Report</h1>
          
          <p className="mb-4">
            This document contains sensitive information about <span className={redactionMode === 'blackout' ? 'redacted-blackout' : redactionMode === 'deidentify' ? 'redacted-deidentify' : 'redacted-highlight'} onClick={() => onRedactionClick && onRedactionClick('1')}>Project Nexus</span> and its implementation schedule.
          </p>
          
          <p className="mb-4">
            Prepared by: <span className={redactionMode === 'blackout' ? 'redacted-blackout' : redactionMode === 'deidentify' ? 'redacted-deidentify' : 'redacted-highlight'} onClick={() => onRedactionClick && onRedactionClick('2')}>John Smith</span>, Senior Project Manager
          </p>
          
          <p className="mb-4">
            Contact: <span className={redactionMode === 'blackout' ? 'redacted-blackout' : redactionMode === 'deidentify' ? 'redacted-deidentify' : 'redacted-highlight'} onClick={() => onRedactionClick && onRedactionClick('3')}>john.smith@example.com</span> | <span className={redactionMode === 'blackout' ? 'redacted-blackout' : redactionMode === 'deidentify' ? 'redacted-deidentify' : 'redacted-highlight'} onClick={() => onRedactionClick && onRedactionClick('4')}>+1 (555) 123-4567</span>
          </p>
          
          <h2 className="text-xl font-bold mt-8 mb-4">Executive Summary</h2>
          
          <p className="mb-4">
            The proposed budget for fiscal year 2025 is <span className={redactionMode === 'blackout' ? 'redacted-blackout' : redactionMode === 'deidentify' ? 'redacted-deidentify' : 'redacted-highlight'} onClick={() => onRedactionClick && onRedactionClick('5')}>$1,250,000</span>, which represents a 15% increase from the previous year. This budget will support our expansion into the <span className={redactionMode === 'blackout' ? 'redacted-blackout' : redactionMode === 'deidentify' ? 'redacted-deidentify' : 'redacted-highlight'} onClick={() => onRedactionClick && onRedactionClick('6')}>European market</span>, specifically targeting <span className={redactionMode === 'blackout' ? 'redacted-blackout' : redactionMode === 'deidentify' ? 'redacted-deidentify' : 'redacted-highlight'} onClick={() => onRedactionClick && onRedactionClick('7')}>Germany and France</span>.
          </p>
          
          <h2 className="text-xl font-bold mt-8 mb-4">Security Classification</h2>
          
          <p className="mb-4">
            This document is classified as <span className="redacted-review" onClick={() => onRedactionClick && onRedactionClick('8')}>CONFIDENTIAL</span> and should not be shared outside of the organization without proper authorization.
          </p>
          
          <h2 className="text-xl font-bold mt-8 mb-4">Team Members</h2>
          
          <ul className="list-disc pl-6 mb-6">
            <li className="mb-2">Project Lead: <span className={redactionMode === 'blackout' ? 'redacted-blackout' : redactionMode === 'deidentify' ? 'redacted-deidentify' : 'redacted-highlight'} onClick={() => onRedactionClick && onRedactionClick('9')}>Sarah Johnson</span></li>
            <li className="mb-2">Technical Lead: <span className={redactionMode === 'blackout' ? 'redacted-blackout' : redactionMode === 'deidentify' ? 'redacted-deidentify' : 'redacted-highlight'} onClick={() => onRedactionClick && onRedactionClick('10')}>Michael Chen</span></li>
            <li className="mb-2">Marketing Director: <span className={redactionMode === 'blackout' ? 'redacted-blackout' : redactionMode === 'deidentify' ? 'redacted-deidentify' : 'redacted-highlight'} onClick={() => onRedactionClick && onRedactionClick('11')}>David Rodriguez</span></li>
            <li className="mb-2">Financial Analyst: <span className={redactionMode === 'blackout' ? 'redacted-blackout' : redactionMode === 'deidentify' ? 'redacted-deidentify' : 'redacted-highlight'} onClick={() => onRedactionClick && onRedactionClick('12')}>Amanda Peterson</span></li>
          </ul>
          
          <h2 className="text-xl font-bold mt-8 mb-4">Implementation Timeline</h2>
          
          <p className="mb-4">
            Phase 1 will commence on <span className={redactionMode === 'blackout' ? 'redacted-blackout' : redactionMode === 'deidentify' ? 'redacted-deidentify' : 'redacted-highlight'} onClick={() => onRedactionClick && onRedactionClick('13')}>January 15, 2026</span> and is expected to be completed by <span className={redactionMode === 'blackout' ? 'redacted-blackout' : redactionMode === 'deidentify' ? 'redacted-deidentify' : 'redacted-highlight'} onClick={() => onRedactionClick && onRedactionClick('14')}>March 31, 2026</span>.
          </p>
          
          <h2 className="text-xl font-bold mt-8 mb-4">Financial Details</h2>
          
          <p className="mb-4">
            Our company's tax ID is <span className={redactionMode === 'blackout' ? 'redacted-blackout' : redactionMode === 'deidentify' ? 'redacted-deidentify' : 'redacted-highlight'} onClick={() => onRedactionClick && onRedactionClick('15')}>12-3456789</span> and our DUNS number is <span className={redactionMode === 'blackout' ? 'redacted-blackout' : redactionMode === 'deidentify' ? 'redacted-deidentify' : 'redacted-highlight'} onClick={() => onRedactionClick && onRedactionClick('16')}>987654321</span>.
          </p>
          
          <p className="mb-4">
            Primary banking relationship is with <span className={redactionMode === 'blackout' ? 'redacted-blackout' : redactionMode === 'deidentify' ? 'redacted-deidentify' : 'redacted-highlight'} onClick={() => onRedactionClick && onRedactionClick('17')}>First National Bank</span>, account number <span className={redactionMode === 'blackout' ? 'redacted-blackout' : redactionMode === 'deidentify' ? 'redacted-deidentify' : 'redacted-highlight'} onClick={() => onRedactionClick && onRedactionClick('18')}>XXXX-XXXX-1234</span>.
          </p>
        </div>
      </CardContent>
    </Card>
  );
};

export default DocumentPreview;
