import { cn } from '@/lib/utils';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

interface MatchingFeaturesQuestion {
  question_number: number;
  statement_before: string;
  statement_after?: string;
}

interface FeatureOption {
  letter: string;
  text: string;
}

interface MatchingFeaturesProps {
  questions: MatchingFeaturesQuestion[];
  options: FeatureOption[];
  optionsTitle?: string;
  answers: Record<number, string>;
  onAnswerChange: (questionNumber: number, answer: string) => void;
  currentQuestion?: number;
  onSetActive?: (questionNumber: number) => void;
  fontSize?: number;
}

export function MatchingFeatures({
  questions,
  options,
  optionsTitle = 'List of People',
  answers,
  onAnswerChange,
  currentQuestion,
  onSetActive,
  fontSize = 14,
}: MatchingFeaturesProps) {
  return (
    <div className="space-y-3" style={{ fontSize: `${fontSize}px`, fontFamily: 'var(--font-ielts)' }}>
      {/* Options Reference List - At the beginning - aligned left, no padding */}
      <div className="pb-3">
        <h4 className="font-bold text-sm mb-2">{optionsTitle}</h4>
        <div className="grid gap-0.5">
          {options.map((option) => (
            <div key={option.letter} className="text-sm">
              <span className="font-bold">{option.letter}.</span>{' '}
              {option.text}
            </div>
          ))}
        </div>
      </div>

      {/* Questions with Inline Dropdown Selects */}
      <div className="space-y-1">
        {questions.map((q) => {
          const isActive = currentQuestion === q.question_number;
          const answer = answers[q.question_number] || '';

          return (
            <div
              key={q.question_number}
              className={cn(
                "cursor-pointer py-1 transition-colors",
                isActive && "bg-[hsl(var(--ielts-option-hover,0_0%_96%))]"
              )}
              onClick={() => onSetActive?.(q.question_number)}
            >
              <p className="leading-relaxed" style={{ lineHeight: '2' }}>
                <span>{q.statement_before}</span>
                {' '}
                <Select
                  value={answer || ''}
                  onValueChange={(value) => onAnswerChange(q.question_number, value)}
                >
                  <SelectTrigger 
                    className={cn(
                      "inline-flex w-28 h-7 px-2 text-sm mx-1 gap-1 rounded-[3px]",
                      "bg-[hsl(var(--ielts-input-bg,0_0%_100%))] border border-[hsl(var(--ielts-input-border))] text-foreground",
                      "focus:border-[hsl(var(--ielts-input-focus))] focus:ring-0",
                      answer && "border-[hsl(var(--ielts-input-focus))]"
                    )}
                    style={{ verticalAlign: 'middle' }}
                    onClick={(e) => e.stopPropagation()}
                    onMouseDown={(e) => e.stopPropagation()}
                  >
                    <span className="ielts-question-badge text-xs flex-shrink-0">
                      {q.question_number}
                    </span>
                    <SelectValue placeholder="" />
                  </SelectTrigger>
                  <SelectContent className="bg-background border border-[hsl(var(--ielts-input-border))] rounded-[3px]">
                    {options.map((option) => (
                      <SelectItem key={option.letter} value={option.letter}>
                        {option.letter}. {option.text}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {q.statement_after && (
                  <span className="text-muted-foreground"> {q.statement_after}</span>
                )}
              </p>
            </div>
          );
        })}
      </div>
    </div>
  );
}
