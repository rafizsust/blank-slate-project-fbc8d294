import { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Plus, X, Info } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';

interface MultipleAnswersInputProps {
  value: string;
  onChange: (value: string) => void;
  questionType: string;
  placeholder?: string;
}

// Question types that commonly have multiple acceptable answers
const MULTI_ANSWER_TYPES = [
  'FILL_IN_BLANK',
  'SHORT_ANSWER',
  'SENTENCE_COMPLETION',
  'SUMMARY_COMPLETION',
  'TABLE_COMPLETION'
];

export function MultipleAnswersInput({
  value,
  onChange,
  questionType,
  placeholder = 'Enter correct answer'
}: MultipleAnswersInputProps) {
  const [inputValue, setInputValue] = useState('');
  
  const supportsMultiple = MULTI_ANSWER_TYPES.includes(questionType);
  
  // Parse answers - they are separated by "/"
  const answers = value ? value.split('/').map(a => a.trim()).filter(Boolean) : [];
  
  const addAnswer = () => {
    if (!inputValue.trim()) return;
    const newAnswers = [...answers, inputValue.trim()];
    onChange(newAnswers.join(' / '));
    setInputValue('');
  };
  
  const removeAnswer = (index: number) => {
    const newAnswers = answers.filter((_, i) => i !== index);
    onChange(newAnswers.join(' / '));
  };
  
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      addAnswer();
    }
  };
  
  if (!supportsMultiple) {
    return (
      <Input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
      />
    );
  }
  
  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2">
        <div className="flex-1 relative">
          <Input
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Type an answer and press Enter or click Add"
            className="pr-10 bg-background text-foreground"
          />
        </div>
        <Button type="button" variant="outline" size="sm" onClick={addAnswer}>
          <Plus size={14} className="mr-1" />
          Add
        </Button>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button type="button" variant="ghost" size="icon" className="h-8 w-8">
              <Info size={14} />
            </Button>
          </TooltipTrigger>
          <TooltipContent className="max-w-xs">
            <p className="text-sm">
              Add multiple acceptable answers for this question.
              <br/><br/>
              Examples:
              <br/>• "9.00am" and "9:00 a.m."
              <br/>• "color" and "colour"
              <br/>• "1" and "one"
              <br/><br/>
              Answers are case-insensitive when checked.
            </p>
          </TooltipContent>
        </Tooltip>
      </div>
      
      {answers.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {answers.map((answer, idx) => (
            <Badge key={idx} variant="secondary" className="pl-3 pr-1 py-1 gap-1">
              {answer}
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="h-4 w-4 hover:bg-destructive/20"
                onClick={() => removeAnswer(idx)}
              >
                <X size={12} />
              </Button>
            </Badge>
          ))}
        </div>
      )}
      
      {answers.length === 0 && (
        <p className="text-xs text-muted-foreground">
          No answers added yet. Add at least one correct answer.
        </p>
      )}
      
      {answers.length > 0 && (
        <p className="text-xs text-muted-foreground">
          Any of these answers will be accepted (case-insensitive)
        </p>
      )}
    </div>
  );
}

// Helper function to check if user answer matches any correct answer
export function checkAnswer(userAnswer: string, correctAnswers: string): boolean {
  if (!userAnswer || !correctAnswers) return false;
  
  const normalizedUser = userAnswer.trim().toLowerCase();
  const acceptableAnswers = correctAnswers.split('/').map(a => a.trim().toLowerCase());
  
  return acceptableAnswers.some(correct => {
    // Exact match
    if (normalizedUser === correct) return true;
    
    // Handle spacing variations (e.g., "9.00am" vs "9.00 am")
    const normalizedCorrect = correct.replace(/\s+/g, '');
    const normalizedUserNoSpace = normalizedUser.replace(/\s+/g, '');
    if (normalizedUserNoSpace === normalizedCorrect) return true;
    
    return false;
  });
}
