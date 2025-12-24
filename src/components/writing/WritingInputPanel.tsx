import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';

import { Button } from '@/components/ui/button';
import { Save, Send } from 'lucide-react';

interface WritingInputPanelProps {
  submissionText: string;
  onSubmissionTextChange: (text: string) => void;
  wordCount: number;
  onSave: () => void;
  onSubmit: () => void;
  isSaving: boolean;
  isSubmitting: boolean;
  fontSize: number;
}

export function WritingInputPanel({
  submissionText,
  onSubmissionTextChange,
  wordCount,
  onSave,
  onSubmit,
  isSaving,
  isSubmitting,
  fontSize,
}: WritingInputPanelProps) {

  return (
    <div className="p-6 flex flex-col h-full" style={{ fontFamily: 'var(--font-ielts)' }}>
      <div className="flex items-center justify-between mb-4">
        <Label htmlFor="writing-textarea" className="text-lg font-semibold" style={{ fontFamily: 'var(--font-ielts)' }}>Your Answer</Label>
        <div className="flex items-center gap-2">
          <span className="text-sm font-semibold text-foreground" style={{ fontFamily: 'var(--font-ielts)' }}>
            Words: {wordCount}
          </span>
        </div>
      </div>

      <Textarea
        id="writing-textarea"
        value={submissionText}
        onChange={(e) => onSubmissionTextChange(e.target.value)}
        placeholder="Start writing your answer here..."
        className="flex-1 resize-none border-border focus-visible:ring-foreground ielts-input"
        style={{ fontSize: `${fontSize}px`, fontFamily: 'var(--font-ielts)', borderRadius: 0 }}
      />

      <div className="flex justify-end gap-3 mt-4">
        <Button 
          variant="outline" 
          onClick={onSave} 
          disabled={isSaving || isSubmitting}
          className="border-border"
          style={{ fontFamily: 'var(--font-ielts)', borderRadius: 0 }}
        >
          <Save size={16} className="mr-2" />
          {isSaving ? 'Saving...' : 'Save Draft'}
        </Button>
        <Button 
          onClick={onSubmit} 
          disabled={isSubmitting}
          className="bg-foreground text-background hover:bg-foreground/90"
          style={{ fontFamily: 'var(--font-ielts)', borderRadius: 0 }}
        >
          <Send size={16} className="mr-2" />
          {isSubmitting ? 'Submitting...' : 'Submit Test'}
        </Button>
      </div>
    </div>
  );
}