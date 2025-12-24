import { cn } from '@/lib/utils';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { QuestionTextWithTools } from '@/components/common/QuestionTextWithTools';

interface Question {
  id: string;
  question_number: number;
  question_text: string;
  instruction?: string | null;
  is_given: boolean;
  heading?: string | null;
  correct_answer: string;
  group_id: string; // Added this line
}

interface MultipleChoiceMultipleQuestionsProps {
  testId: string;
  questions: Question[]; // All questions in this group (e.g., 6, 7, 8)
  groupOptions: string[]; // The shared options for the group (e.g., ['A', 'B', 'C', 'D', 'E', 'F', 'G'])
  groupOptionFormat: string; // e.g., 'A'
  answers: Record<number, string>; // Answers for individual questions (question_number -> answer)
  onAnswerChange: (questionNumber: number, answer: string) => void;
  fontSize: number;
  renderRichText: (text: string) => string;
}

// Helper function to get option label (A, B, C or 1, 2, 3 etc.)
const getOptionLabel = (index: number, format: string | null | undefined) => {
  if (format === '1') return String(index + 1);
  if (format === 'i') {
    const romanNumerals = ['i', 'ii', 'iii', 'iv', 'v', 'vi', 'vii', 'viii', 'ix', 'x', 'xi', 'xii'];
    return romanNumerals[index] || String(index + 1);
  }
  return String.fromCharCode(65 + index); // Default to 'A' format
};

export function MultipleChoiceMultipleQuestions({
  testId,
  questions,
  groupOptions,
  groupOptionFormat,
  answers,
  onAnswerChange,
  fontSize,
  renderRichText,
}: MultipleChoiceMultipleQuestionsProps) {

    return (
      <div className="space-y-3 mt-2">
        {/* Display shared options if available */}
        {questions.length > 0 && groupOptions.length > 0 && (
          <div className="p-4 mb-6">
            <h4 className="text-sm font-semibold mb-3 text-foreground">
              <QuestionTextWithTools
                testId={testId}
                contentId={`${questions[0].group_id}-shared-options-instruction`}
                text="Choose the correct letter for each question from the options below:"
                fontSize={fontSize}
                renderRichText={renderRichText}
                isActive={false}
              />
            </h4>
            <div className="flex flex-col gap-y-1">
              {groupOptions.map((optionText: string, idx: number) => (
                <div key={idx} className="text-sm text-foreground flex">
                  <span className="font-bold text-primary mr-2 w-5 shrink-0">
                    {getOptionLabel(idx, groupOptionFormat)}.
                  </span>
                  <QuestionTextWithTools
                    testId={testId}
                    contentId={`${questions[0].group_id}-shared-option-${idx}`}
                    text={optionText}
                    fontSize={fontSize}
                    renderRichText={renderRichText}
                    isActive={false}
                    as="span"
                  />
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Individual questions with dropdowns */}
        {questions.map((question) => {
          const currentAnswer = answers[question.question_number];

          return (
            <div
              key={question.id}
              id={`question-${question.question_number}`}
              className="p-4 transition-all cursor-pointer"
            >
              <div className="flex items-start gap-3">
              <span className={cn(
                "flex-shrink-0 w-7 h-7 rounded flex items-center justify-center text-sm font-bold",
                "bg-primary/10 text-primary"
              )}>
                {question.question_number}
              </span>
              <div className="flex-1 space-y-2">
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
                <div className="flex items-center flex-wrap gap-2">
                  <QuestionTextWithTools
                    testId={testId}
                    contentId={question.id}
                    text={question.question_text}
                    fontSize={fontSize}
                    renderRichText={renderRichText}
                    isActive={false}
                    as="span"
                  />
                  <Select
                    value={currentAnswer || ''}
                    onValueChange={(value) => onAnswerChange(question.question_number, value)}
                    disabled={question.is_given}
                  >
                    <SelectTrigger
                      className={cn(
                        "w-28 h-7 text-sm flex-shrink-0 rounded-[3px]",
                        "bg-[hsl(var(--ielts-input-bg,0_0%_100%))] border border-[hsl(var(--ielts-input-border))] text-foreground",
                        "focus:border-[hsl(var(--ielts-input-focus))] focus:ring-0"
                      )}
                    >
                      <SelectValue placeholder={String(question.question_number)} />
                    </SelectTrigger>
                    <SelectContent className="bg-background border border-[hsl(var(--ielts-input-border))] rounded-[3px]">
                      {groupOptions.map((_optionText, idx) => {
                        const optionValue = getOptionLabel(idx, groupOptionFormat);
                        return (
                          <SelectItem key={optionValue} value={optionValue}>
                            {optionValue}
                          </SelectItem>
                        );
                      })}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}