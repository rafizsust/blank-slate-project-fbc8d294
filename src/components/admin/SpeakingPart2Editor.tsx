import { useCallback } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { RichTextEditor } from './RichTextEditor';
import { Info } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

export interface SpeakingPart2Data {
  cue_card_topic: string;
  cue_card_content: string;
  preparation_time_seconds: number;
  speaking_time_seconds: number;
}

interface SpeakingPart2EditorProps {
  data: SpeakingPart2Data;
  onUpdate: (updates: Partial<SpeakingPart2Data>) => void;
}

export function SpeakingPart2Editor({ data, onUpdate }: SpeakingPart2EditorProps) {
  const handleUpdate = useCallback((field: keyof SpeakingPart2Data, value: string | number) => {
    onUpdate({ [field]: value });
  }, [onUpdate]);

  return (
    <TooltipProvider>
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Part 2: Individual Long Turn (Cue Card)</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Cue Card Topic</Label>
              <Input
                value={data.cue_card_topic}
                onChange={(e) => handleUpdate('cue_card_topic', e.target.value)}
                placeholder="e.g., Describe a time you helped someone."
              />
            </div>
            <div className="space-y-2">
              <Label className="flex items-center gap-2">
                Full Cue Card Content
                <Tooltip>
                  <TooltipTrigger>
                    <Info size={14} className="text-muted-foreground" />
                  </TooltipTrigger>
                  <TooltipContent className="max-w-xs">
                    <p>Include the main instruction and bullet points. Use `•` for bullet points.</p>
                    <p className="mt-1">Example: "You should say: • What it was • When it happened • Why it was memorable..."</p>
                  </TooltipContent>
                </Tooltip>
              </Label>
              <RichTextEditor
                value={data.cue_card_content}
                onChange={(value) => handleUpdate('cue_card_content', value)}
                placeholder="Enter the full cue card content with bullet points..."
                rows={6}
              />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Preparation Time (seconds)</Label>
                <Select
                  value={String(data.preparation_time_seconds)}
                  onValueChange={(value) => handleUpdate('preparation_time_seconds', parseInt(value))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="45">45 seconds</SelectItem>
                    <SelectItem value="60">60 seconds (Default)</SelectItem>
                    <SelectItem value="75">75 seconds</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Speaking Time (seconds)</Label>
                <Select
                  value={String(data.speaking_time_seconds)}
                  onValueChange={(value) => handleUpdate('speaking_time_seconds', parseInt(value))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="90">90 seconds (1.5 min)</SelectItem>
                    <SelectItem value="120">120 seconds (2 min - Default)</SelectItem>
                    <SelectItem value="150">150 seconds (2.5 min)</SelectItem>
                    <SelectItem value="180">180 seconds (3 min)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </TooltipProvider>
  );
}