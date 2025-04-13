
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Slider } from '@/components/ui/slider';
import { Bookmark, EyeOff, FileSearch, FileText, PenTool, Shield } from 'lucide-react';

interface RedactionControlsProps {
  redactionMode: 'blackout' | 'deidentify' | 'none';
  onRedactionModeChange: (mode: 'blackout' | 'deidentify' | 'none') => void;
  sensitivityLevel: number;
  onSensitivityChange: (value: number) => void;
  showPII: boolean;
  onShowPIIChange: (show: boolean) => void;
  showFinancial: boolean;
  onShowFinancialChange: (show: boolean) => void;
  showDates: boolean;
  onShowDatesChange: (show: boolean) => void;
  onProcessDocument: () => void;
  isProcessing: boolean;
}

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
  isProcessing
}) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <Shield className="mr-2 h-5 w-5" />
          Redaction Controls
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <Tabs defaultValue="mode" className="w-full">
          <TabsList className="grid grid-cols-2 w-full">
            <TabsTrigger value="mode">Redaction Mode</TabsTrigger>
            <TabsTrigger value="filters">Content Filters</TabsTrigger>
          </TabsList>
          
          <TabsContent value="mode" className="space-y-4 animate-fade-in">
            <div className="space-y-4 pt-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <EyeOff className="h-4 w-4" />
                  <Label htmlFor="blackout-mode">Blackout Mode</Label>
                </div>
                <Switch
                  id="blackout-mode"
                  checked={redactionMode === 'blackout'}
                  onCheckedChange={() => 
                    onRedactionModeChange(redactionMode === 'blackout' ? 'none' : 'blackout')
                  }
                />
              </div>
              
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <PenTool className="h-4 w-4" />
                  <Label htmlFor="deidentify-mode">De-identification Mode</Label>
                </div>
                <Switch
                  id="deidentify-mode"
                  checked={redactionMode === 'deidentify'}
                  onCheckedChange={() => 
                    onRedactionModeChange(redactionMode === 'deidentify' ? 'none' : 'deidentify')
                  }
                />
              </div>
              
              <div className="space-y-2 pt-2">
                <div className="flex justify-between">
                  <Label>Sensitivity Level</Label>
                  <span className="text-sm text-muted-foreground">
                    {sensitivityLevel < 30 ? 'Low' : sensitivityLevel < 70 ? 'Medium' : 'High'}
                  </span>
                </div>
                <Slider
                  value={[sensitivityLevel]}
                  max={100}
                  step={1}
                  onValueChange={(value) => onSensitivityChange(value[0])}
                />
              </div>
            </div>
          </TabsContent>
          
          <TabsContent value="filters" className="space-y-4 animate-fade-in">
            <div className="space-y-4 pt-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Bookmark className="h-4 w-4" />
                  <Label htmlFor="show-pii">Personal Information (PII)</Label>
                </div>
                <Switch
                  id="show-pii"
                  checked={showPII}
                  onCheckedChange={onShowPIIChange}
                />
              </div>
              
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <FileText className="h-4 w-4" />
                  <Label htmlFor="show-financial">Financial Data</Label>
                </div>
                <Switch
                  id="show-financial"
                  checked={showFinancial}
                  onCheckedChange={onShowFinancialChange}
                />
              </div>
              
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <FileSearch className="h-4 w-4" />
                  <Label htmlFor="show-dates">Dates & Timestamps</Label>
                </div>
                <Switch
                  id="show-dates"
                  checked={showDates}
                  onCheckedChange={onShowDatesChange}
                />
              </div>
            </div>
          </TabsContent>
        </Tabs>
        
        <div className="pt-2">
          <Button 
            className="w-full" 
            onClick={onProcessDocument}
            disabled={isProcessing}
          >
            {isProcessing ? 'Processing...' : 'Process Document'}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default RedactionControls;
