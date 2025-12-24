import { cn } from '@/lib/utils';

interface Question {
  id: string;
  question_number: number;
  question_text: string;
  options: string[] | null;
}

interface ShortAnswerProps {
  question: Question;
  answer: string | undefined;
  onAnswerChange: (answer: string) => void;
  isActive: boolean;
  onSetActive?: () => void;
}

export function ShortAnswer({ question, answer, onAnswerChange, isActive, onSetActive }: ShortAnswerProps) {
  return (
    <div 
      onClick={(e) => { e.stopPropagation(); onSetActive?.(); }}
      style={{ fontFamily: 'var(--font-ielts)' }}
    >
      <span className="ielts-input-with-number inline-flex items-center w-full">
        <span className="ielts-input-number-inside">{question.question_number}</span>
        <input
          type="text"
          value={answer || ''}
          onChange={(e) => onAnswerChange(e.target.value)}
          placeholder={String(question.question_number)}
            className={cn(
              "ielts-input h-7 text-sm pl-7 pr-2 min-w-[174px] max-w-full rounded-[3px]",
              "bg-[hsl(var(--ielts-input-bg,0_0%_100%))] border border-[hsl(var(--ielts-input-border))] text-foreground",
              "focus:outline-none focus:border-[hsl(var(--ielts-input-focus))] focus:border-2",
              "placeholder:font-bold placeholder:text-foreground/70",
              isActive && "border-[hsl(var(--ielts-input-focus))] border-2"
            )}
        />
      </span>
      <p className="text-xs mt-1 text-muted-foreground">
        Write NO MORE THAN THREE WORDS AND/OR A NUMBER
      </p>
    </div>
  );
}