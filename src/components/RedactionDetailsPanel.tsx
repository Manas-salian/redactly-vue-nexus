
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { 
  AlertTriangle, 
  Check, 
  ChevronRight, 
  FileWarning, 
  MessageSquare,
  ThumbsDown,
  ThumbsUp,
  X
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface RedactionDetailsProps {
  selectedRedaction: {
    id: string;
    text: string;
    type: string;
    confidence: number;
    needsReview: boolean;
    annotations?: string[];
  } | null;
  onApprove: (id: string) => void;
  onReject: (id: string) => void;
  onAddAnnotation: (id: string, annotation: string) => void;
}

const RedactionDetailsPanel: React.FC<RedactionDetailsProps> = ({
  selectedRedaction,
  onApprove,
  onReject,
  onAddAnnotation
}) => {
  const [annotation, setAnnotation] = useState('');

  const handleSubmitAnnotation = () => {
    if (selectedRedaction && annotation.trim()) {
      onAddAnnotation(selectedRedaction.id, annotation);
      setAnnotation('');
    }
  };

  const getConfidenceClass = (confidence: number) => {
    if (confidence >= 90) return 'confidence-high';
    if (confidence >= 70) return 'confidence-medium';
    return 'confidence-low';
  };

  const getConfidenceLabel = (confidence: number) => {
    if (confidence >= 90) return 'High';
    if (confidence >= 70) return 'Medium';
    return 'Low';
  };

  if (!selectedRedaction) {
    return (
      <Card className="h-full">
        <CardHeader>
          <CardTitle className="flex items-center">
            <FileWarning className="mr-2 h-5 w-5" />
            Redaction Details
          </CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col items-center justify-center h-[70vh] text-muted-foreground">
          <AlertTriangle className="h-12 w-12 mb-4" />
          <p>Select a redacted item to view details</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle className="flex items-center">
          <FileWarning className="mr-2 h-5 w-5" />
          Redaction Details
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="rounded-md border p-4 animate-fade-in">
          <div className="font-medium mb-2">Redacted Content</div>
          <div className="bg-muted p-3 rounded text-muted-foreground">
            {selectedRedaction.text}
          </div>
        </div>
        
        <div className="space-y-4 animate-fade-in">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <span className="text-sm font-medium block mb-1">Type</span>
              <Badge variant="outline" className="bg-background">
                {selectedRedaction.type}
              </Badge>
            </div>
            <div>
              <span className="text-sm font-medium block mb-1">Confidence</span>
              <span className={cn("text-sm", getConfidenceClass(selectedRedaction.confidence))}>
                {getConfidenceLabel(selectedRedaction.confidence)} ({selectedRedaction.confidence}%)
              </span>
            </div>
          </div>
          
          {selectedRedaction.needsReview && (
            <div className="rounded-md bg-yellow-50 border border-yellow-200 p-3 flex items-start text-sm">
              <AlertTriangle className="h-4 w-4 text-yellow-600 mr-2 mt-0.5" />
              <div className="text-yellow-800">
                This content has been flagged for review due to low confidence in classification.
              </div>
            </div>
          )}
          
          <div className="flex space-x-2">
            <Button 
              variant="outline" 
              className="flex-1 bg-green-50 border-green-200 hover:bg-green-100 hover:text-green-700"
              onClick={() => onApprove(selectedRedaction.id)}
            >
              <ThumbsUp className="h-4 w-4 mr-2" />
              Approve
            </Button>
            <Button 
              variant="outline" 
              className="flex-1 bg-red-50 border-red-200 hover:bg-red-100 hover:text-red-700"
              onClick={() => onReject(selectedRedaction.id)}
            >
              <ThumbsDown className="h-4 w-4 mr-2" />
              Reject
            </Button>
          </div>
        </div>
        
        <div className="space-y-3 animate-fade-in">
          <div className="font-medium flex items-center">
            <MessageSquare className="h-4 w-4 mr-2" />
            Annotations
          </div>
          
          {selectedRedaction.annotations && selectedRedaction.annotations.length > 0 ? (
            <div className="space-y-2">
              {selectedRedaction.annotations.map((note, index) => (
                <div key={index} className="bg-muted rounded-md p-3 text-sm">
                  {note}
                </div>
              ))}
            </div>
          ) : (
            <div className="text-sm text-muted-foreground italic">
              No annotations added yet
            </div>
          )}
          
          <div className="space-y-2 pt-2">
            <Textarea 
              placeholder="Add your annotation here..."
              value={annotation}
              onChange={(e) => setAnnotation(e.target.value)}
              className="resize-none"
              rows={3}
            />
            <Button 
              onClick={handleSubmitAnnotation} 
              disabled={!annotation.trim()}
              className="w-full"
            >
              Add Annotation
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default RedactionDetailsPanel;
