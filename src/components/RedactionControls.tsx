import React from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Slider } from '@/components/ui/slider';
import { Bookmark, EyeOff, FileSearch, FileText, PenTool, Shield, Zap } from 'lucide-react';

/**
 * Props for the RedactionControls component.
 */
interface RedactionControlsProps {
  /** Current redaction mode ('blackout', 'deidentify', or 'none'). */
  redactionMode: 'blackout' | 'deidentify' | 'none';
  /** Callback when the redaction mode changes. */
  onRedactionModeChange: (mode: 'blackout' | 'deidentify' | 'none') => void;
  /** Current sensitivity level for AI detection (0-100). */
  sensitivityLevel: number;
  /** Callback when the sensitivity slider value changes. */
  onSensitivityChange: (value: number) => void;
  /** Boolean indicating if PII category should be redacted/shown. */
  showPII: boolean;
  /** Callback when the PII switch is toggled. */
  onShowPIIChange: (show: boolean) => void;
  /** Boolean indicating if Financial category should be redacted/shown. */
  showFinancial: boolean;
  /** Callback when the Financial switch is toggled. */
  onShowFinancialChange: (show: boolean) => void;
  /** Boolean indicating if Dates category should be redacted/shown. */
  showDates: boolean;
  /** Callback when the Dates switch is toggled. */
  onShowDatesChange: (show: boolean) => void;
  /** Callback function to trigger document processing or re-processing. */
  onProcessDocument: () => void;
  /** Boolean flag indicating if processing is currently active. */
  isProcessing: boolean;
}

/**
 * Component providing controls for configuring redaction settings.
 * Includes options for redaction mode, sensitivity, categories, and triggering processing.
 */
const RedactionControls: React.FC<RedactionControlsProps> = ({
  redactionMode,
  onRedactionModeChange,
  sensitivityLevel,
  onSensitivityChange,
  showPII,
  onShowPIIChange,
  showFinancial,
  onShowFinancialChange,
  showDates,
  onShowDatesChange,
  onProcessDocument,
  isProcessing,
}) => {
  // Handler for Slider which expects an array
  const handleSliderChange = (value: number[]) => {
    onSensitivityChange(value[0]);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
            <Shield className="h-5 w-5 mr-2 text-primary" />
            Redaction Settings
        </CardTitle>
        <CardDescription>
          Configure how sensitive information is detected and redacted.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Redaction Mode Selection */}
        <div className="space-y-3">
          <Label htmlFor="redaction-mode" className="text-sm font-medium">Redaction Mode</Label>
          <Tabs
            id="redaction-mode"
            value={redactionMode}
            onValueChange={(value) => onRedactionModeChange(value as 'blackout' | 'deidentify' | 'none')}
            className="w-full"
          >
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="blackout" title="Black out sensitive text">
                <EyeOff className="h-4 w-4 mr-1.5" /> Blackout
              </TabsTrigger>
              <TabsTrigger value="deidentify" title="Replace sensitive text with placeholders">
                <PenTool className="h-4 w-4 mr-1.5" /> De-identify
              </TabsTrigger>
              <TabsTrigger value="none" title="Show original document (no redactions)">
                <FileText className="h-4 w-4 mr-1.5" /> None
              </TabsTrigger>
            </TabsList>
          </Tabs>
        </div>

        {/* Sensitivity Level Slider */}
        <div className="space-y-3">
          <Label htmlFor="sensitivity" className="text-sm font-medium">
            AI Sensitivity Level
          </Label>
          <div className="flex items-center space-x-3">
            <Slider
              id="sensitivity"
              min={0}
              max={100}
              step={10}
              value={[sensitivityLevel]}
              onValueChange={handleSliderChange}
              className="flex-grow"
              aria-label="Sensitivity Level"
            />
            <span className="text-sm font-semibold w-10 text-right">{sensitivityLevel}%</span>
          </div>
           <p className="text-xs text-muted-foreground">
            Higher sensitivity detects more potential redactions, but may include more false positives.
          </p>
        </div>

        {/* Category Toggles */}
        <div className="space-y-4">
           <Label className="text-sm font-medium">Data Categories to Redact</Label>
            <div className="flex items-center justify-between p-3 bg-muted/30 rounded-md">
                <Label htmlFor="show-pii" className="flex flex-col space-y-1 cursor-pointer">
                <span className="font-medium">Personal Information (PII)</span>
                <span className="text-xs text-muted-foreground">
                    Names, emails, phone numbers, addresses, etc.
                </span>
                </Label>
                <Switch
                id="show-pii"
                checked={showPII}
                onCheckedChange={onShowPIIChange}
                aria-label="Toggle Personal Information redaction"
                />
            </div>
            <div className="flex items-center justify-between p-3 bg-muted/30 rounded-md">
                <Label htmlFor="show-financial" className="flex flex-col space-y-1 cursor-pointer">
                 <span className="font-medium">Financial Data</span>
                <span className="text-xs text-muted-foreground">
                    Account numbers, credit cards, monetary values.
                </span>
                </Label>
                <Switch
                id="show-financial"
                checked={showFinancial}
                onCheckedChange={onShowFinancialChange}
                aria-label="Toggle Financial Data redaction"
                />
            </div>
            <div className="flex items-center justify-between p-3 bg-muted/30 rounded-md">
                <Label htmlFor="show-dates" className="flex flex-col space-y-1 cursor-pointer">
                 <span className="font-medium">Dates & Times</span>
                <span className="text-xs text-muted-foreground">
                    Specific dates, timestamps.
                </span>
                </Label>
                <Switch
                id="show-dates"
                checked={showDates}
                onCheckedChange={onShowDatesChange}
                aria-label="Toggle Dates and Times redaction"
                />
            </div>
        </div>

        {/* Process Document Button */}
        <Button 
          onClick={onProcessDocument} 
          disabled={isProcessing}
          className="w-full mt-4"
          aria-label={isProcessing ? "Processing document..." : "Apply Redaction Settings"}
        >
          {isProcessing ? (
            <>
              <Zap className="h-4 w-4 mr-2 animate-spin" /> Processing...
            </>
          ) : (
            <>
              <Zap className="h-4 w-4 mr-2" /> Apply Redaction Settings
            </>
          )}
        </Button>
         <p className="text-xs text-center text-muted-foreground">
            Click to re-analyze the document with the current settings.
          </p>
      </CardContent>
    </Card>
  );
};

export default RedactionControls;
