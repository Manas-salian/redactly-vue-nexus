import React, { useState } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { ThumbsUp, ThumbsDown, MessageSquare, Info, ListChecks } from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Label } from "@/components/ui/label";

/**
 * Represents the structure of a single redaction item.
 */
interface Redaction {
  id: string;
  text: string;
  type: string;
  confidence: number;
  needsReview?: boolean; // Optional flag if AI suggests manual review
  // Add other relevant fields as needed, e.g., page number, coordinates
}

/**
 * Props for the RedactionDetailsPanel component.
 */
interface RedactionDetailsPanelProps {
  /** The currently selected redaction object to display details for. Null if none selected. */
  selectedRedaction: Redaction | null;
  /** Callback function when the 'Approve' button is clicked. */
  onApprove: (id: string) => void;
  /** Callback function when the 'Reject' button is clicked. */
  onReject: (id: string) => void;
  /** Callback function when an annotation is added. */
  onAddAnnotation: (id: string, annotation: string) => void;
  // Consider adding allRedactions if needed for context or navigation
  // allRedactions?: Redaction[];
}

/**
 * Displays the details of a selected redaction and provides actions
 * like approving, rejecting, and adding annotations.
 */
const RedactionDetailsPanel: React.FC<RedactionDetailsPanelProps> = ({
  selectedRedaction,
  onApprove,
  onReject,
  onAddAnnotation,
}) => {
  /** Local state for the annotation text area. */
  const [annotationText, setAnnotationText] = useState('');

  /** Handles adding the current annotation text. */
  const handleAddAnnotationClick = () => {
    if (selectedRedaction && annotationText.trim()) {
      onAddAnnotation(selectedRedaction.id, annotationText.trim());
      setAnnotationText(''); // Clear the textarea
    }
  };

  /** Reset annotation text when the selected redaction changes. */
  React.useEffect(() => {
    setAnnotationText('');
  }, [selectedRedaction]);

  return (
    <Card className="h-full flex flex-col">
      <CardHeader>
        <CardTitle className="flex items-center">
          <ListChecks className="h-5 w-5 mr-2 text-primary" />
          Redaction Details
        </CardTitle>
        <CardDescription>
          Review and manage individual redactions suggested by the AI.
        </CardDescription>
      </CardHeader>

      <ScrollArea className="flex-grow">
        <CardContent className="space-y-4">
          {selectedRedaction ? (
            <div className="space-y-4 animate-fade-in">
              <div>
                <Label className="text-xs text-muted-foreground">Detected Text</Label>
                <p className="font-mono text-sm bg-muted/50 p-2 rounded">{selectedRedaction.text}</p>
              </div>
              <div>
                <Label className="text-xs text-muted-foreground">Detected Type</Label>
                <p>
                    <Badge variant="secondary">{selectedRedaction.type}</Badge>
                </p>
              </div>
              <div>
                <Label className="text-xs text-muted-foreground">Confidence Score</Label>
                <p className="text-sm font-medium">{selectedRedaction.confidence}%</p>
                 {selectedRedaction.needsReview && (
                    <Badge variant="destructive" className="mt-1">
                        Needs Review
                    </Badge>
                 )}
              </div>

              {/* Action Buttons */}    
              <div className="flex space-x-2 pt-2">
                <Button variant="outline" size="sm" onClick={() => onApprove(selectedRedaction.id)} className="flex-1">
                  <ThumbsUp className="h-4 w-4 mr-1.5" /> Approve
                </Button>
                <Button variant="destructive" size="sm" onClick={() => onReject(selectedRedaction.id)} className="flex-1">
                  <ThumbsDown className="h-4 w-4 mr-1.5" /> Reject
                </Button>
              </div>

              {/* Annotations Section */}    
              <div className="space-y-2 pt-4 border-t">
                 <Label htmlFor="annotation-text" className="text-xs text-muted-foreground flex items-center">
                     <MessageSquare className="h-3 w-3 mr-1" /> Add Annotation
                </Label>
                <Textarea
                  id="annotation-text"
                  value={annotationText}
                  onChange={(e) => setAnnotationText(e.target.value)}
                  placeholder="Add notes or context here..."
                  className="h-24"
                  aria-label="Annotation Text Area"
                />
                <Button 
                  size="sm" 
                  onClick={handleAddAnnotationClick} 
                  disabled={!annotationText.trim()}
                  className="w-full"
                >
                  Add Annotation
                </Button>
                 {/* Display existing annotations if available - Assuming annotations are passed or fetched */}
                 {/* 
                 <div className="mt-2 space-y-1 text-xs text-muted-foreground">
                     <p className="font-medium">Existing Annotations:</p>
                     <ul><li>Annotation 1...</li></ul> 
                 </div>
                 */}
              </div>
            </div>
          ) : (
            <div className="text-center text-muted-foreground py-10">
              <Info className="h-10 w-10 mx-auto mb-3 text-muted-foreground/50" />
              <p>Select a redaction from the document preview or list to see its details here.</p>
            </div>
          )}
        </CardContent>
      </ScrollArea>
      
      {/* Footer can be used for summary or global actions if needed */}
       {/* <CardFooter className="border-t pt-4">
         <p className="text-xs text-muted-foreground">Footer text</p>
       </CardFooter> */}
    </Card>
  );
};

export default RedactionDetailsPanel;
