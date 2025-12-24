import { cn } from '@/lib/utils';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
} from "@/components/ui/select";
import { QuestionTextWithTools } from '@/components/common/QuestionTextWithTools';

interface Question {
  id: string;
  question_number: number;
  question_text: string; // This will be the descriptive text for the option (e.g., "A. The first image shows...")
  instruction?: string | null;
  is_given: boolean;
  heading?: string | null;
  correct_answer: string; // e.g., 'A', 'B', 'C'
}

interface MapsProps {
  testId: string;
  question: Question;
  answer: string | undefined;
  onAnswerChange: (answer: string) => void;
  groupOptionLetters: string[]; // e.g., ['A', 'B', 'C'] - these are the values for the dropdown
  fontSize: number;
  renderRichText: (text: string) => string;
  isActive: boolean;
}

export function Maps({
  testId,
  question,
  answer,
  onAnswerChange,
  groupOptionLetters,
  fontSize,
  renderRichText,
  isActive: _isActive,
}: MapsProps) {

  return (
    <div onClick={(e) => e.stopPropagation()} onMouseDown={(e) => e.stopPropagation()}>
      {/* Question Heading (if any) */}
      {question.heading && (
        <div className="mb-2">
          <QuestionTextWithTools
            testId={testId}
            contentId={`${question.id}-heading`}
            text={question.heading}
            fontSize={fontSize}
            renderRichText={renderRichText}
            isActive={false} 
          />
        </div>
      )}

      {/* Option Text on left, Dropdown (with question number inside) on right */}
      <div className="flex items-center gap-3">
        <div className="flex-1">
          <QuestionTextWithTools
            testId={testId}
            contentId={question.id}
            text={question.question_text}
            fontSize={fontSize}
            renderRichText={renderRichText}
            isActive={false} 
          />
        </div>

        <Select
          value={answer || ''}
          onValueChange={onAnswerChange}
          disabled={question.is_given}
        >
          <SelectTrigger
            className={cn(
              "w-28 h-7 text-sm flex-shrink-0 rounded-[3px]",
              "bg-[hsl(var(--ielts-input-bg,0_0%_100%))] border border-[hsl(var(--ielts-input-border))] text-foreground",
              "focus:border-[hsl(var(--ielts-input-focus))] focus:ring-0"
            )}
            style={{ fontFamily: 'var(--font-ielts)' }}
          >
            <div className="flex items-center gap-1.5 w-full">
              <span className="font-semibold text-foreground">{question.question_number}</span>
              {answer ? <span>{answer}</span> : null}
            </div>
          </SelectTrigger>
          <SelectContent className="bg-background border border-[hsl(var(--ielts-input-border))] rounded-[3px]">
            {groupOptionLetters.map((optionLetter) => (
              <SelectItem key={optionLetter} value={optionLetter} style={{ fontFamily: 'var(--font-ielts)' }}>
                {optionLetter}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </div>
  );
}