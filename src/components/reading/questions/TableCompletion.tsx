import { cn } from '@/lib/utils';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";


interface Question {
  id: string;
  question_number: number;
  question_text: string;
  options: string[] | null;
}

interface TableCompletionProps {
  question: Question;
  answer: string | undefined;
  onAnswerChange: (answer: string) => void;
  isActive: boolean;
  onSetActive?: () => void;
}

export function TableCompletion({ question, answer, onAnswerChange, isActive, onSetActive }: TableCompletionProps) {
  const options = question.options;
  const hasOptions = options && options.length > 0;

  if (hasOptions) {
    return (
      <div onClick={(e) => { e.stopPropagation(); onSetActive?.(); }}>
        <Select value={answer || ''} onValueChange={onAnswerChange}>
          <SelectTrigger 
            className={cn(
              "w-28 h-7 rounded-[3px]",
              "bg-[hsl(var(--ielts-input-bg,0_0%_100%))] border border-[hsl(var(--ielts-input-border))] text-foreground",
              "focus:border-[hsl(var(--ielts-input-focus))] focus:ring-0",
              isActive && "border-[hsl(var(--ielts-input-focus))] border-2"
            )}
            style={{ fontFamily: 'var(--font-ielts)' }}
          >
            <SelectValue placeholder={String(question.question_number)} />
          </SelectTrigger>
          <SelectContent className="bg-background border border-[hsl(var(--ielts-input-border))] rounded-[3px]">
            {options.map((option, idx) => (
              <SelectItem key={idx} value={option}>
                {option}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    );
  }

  return (
    <div onClick={(e) => { e.stopPropagation(); onSetActive?.(); }}>
      <span className="ielts-input-with-number inline-flex items-center w-full">
        <span className="ielts-input-number-inside">{question.question_number}</span>
        <input
          type="text"
          value={answer || ''}
          onChange={(e) => onAnswerChange(e.target.value)}
          placeholder=""
          className={cn(
            "ielts-input w-28 h-7 text-sm pl-7 pr-2 rounded-[3px]",
            isActive && "border-[hsl(var(--ielts-input-focus))] border-2"
          )}
          style={{ fontFamily: 'var(--font-ielts)' }}
        />
      </span>
    </div>
  );
}