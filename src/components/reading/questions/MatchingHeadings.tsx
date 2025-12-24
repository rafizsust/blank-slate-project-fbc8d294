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

interface MatchingHeadingsProps {
  question: Question;
  answer: string | undefined;
  onAnswerChange: (answer: string) => void;
  isActive: boolean;
}

export function MatchingHeadings({ question, answer, onAnswerChange, isActive }: MatchingHeadingsProps) {
  const options = ((question.options || []) as any[]);

  return (
    <div onClick={(e) => e.stopPropagation()}>
      <Select value={answer || ''} onValueChange={onAnswerChange}>
        <SelectTrigger
          className={cn(
            "w-full h-7 rounded-[3px]",
            "bg-[hsl(var(--ielts-input-bg,0_0%_100%))] border border-[hsl(var(--ielts-input-border))] text-foreground",
            "focus:border-[hsl(var(--ielts-input-focus))] focus:ring-0",
            isActive && "border-[hsl(var(--ielts-input-focus))]"
          )}
        >
          <SelectValue placeholder={String(question.question_number)} />
        </SelectTrigger>
        <SelectContent className="bg-background border border-[hsl(var(--ielts-input-border))] rounded-[3px]">
          {options.map((option, idx) => {
            const value = typeof option === 'string' ? option : (option?.id ?? String(idx));
            const label = typeof option === 'string' ? option : (option?.text ?? String(value));

            return (
              <SelectItem key={String(value)} value={String(value)}>
                {label}
              </SelectItem>
            );
          })}
        </SelectContent>
      </Select>
    </div>
  );
}