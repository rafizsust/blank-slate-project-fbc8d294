import { cn } from '@/lib/utils';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';

interface Question {
  id: string;
  question_number: number;
  question_text: string;
  question_type?: string;
  options: string[] | null;
}

interface TrueFalseNotGivenProps {
  testId: string;
  renderRichText: (text: string) => string;
  question: Question;
  answer: string | undefined;
  onAnswerChange: (answer: string) => void;
  isActive: boolean;
  onSetActive?: () => void;
}

export function TrueFalseNotGiven({ question, answer, onAnswerChange, onSetActive }: TrueFalseNotGivenProps) {
  // Determine options based on question type
  const getDefaultOptions = () => {
    if (question.question_type === 'YES_NO_NOT_GIVEN') {
      return ['YES', 'NO', 'NOT GIVEN'];
    }
    return ['TRUE', 'FALSE', 'NOT GIVEN'];
  };

  const options = (question.options && question.options.length > 0) ? question.options : getDefaultOptions();

  const handleValueChange = (value: string) => {
    onAnswerChange(value);
  };

  return (
    <div
      onMouseDown={(e) => e.stopPropagation()}
      onClick={() => onSetActive?.()}
      className="mt-1"
    >
      {/* IELTS Official Style - vertical radio options */}
      <RadioGroup
        value={answer || ''}
        onValueChange={handleValueChange}
        className="space-y-0.5"
      >
        {options.map((option, idx) => {
          const isSelected = answer === option;
          return (
            <label 
              key={idx} 
              htmlFor={`q${question.question_number}-opt-${idx}`}
              onClick={(e) => {
                e.stopPropagation();
                onSetActive?.();
              }}
              className={cn(
                "ielts-mcq-option",
                isSelected && "ielts-mcq-option--selected"
              )}
            >
              <RadioGroupItem 
                value={option} 
                id={`q${question.question_number}-opt-${idx}`}
                className="ielts-mcq-indicator"
              />
              <span className="text-sm" style={{ fontFamily: 'var(--font-ielts)' }}>
                {option}
              </span>
            </label>
          );
        })}
      </RadioGroup>
    </div>
  );
}