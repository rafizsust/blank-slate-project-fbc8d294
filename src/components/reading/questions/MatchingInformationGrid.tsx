import { cn } from '@/lib/utils';
import { QuestionNumberBadge } from '@/components/common/QuestionNumberBadge';

interface Question {
  id: string;
  question_number: number;
  question_text: string;
  options: string[] | null;
}

interface MatchingInformationGridProps {
  questions: Question[];
  answers: Record<number, string>;
  onAnswerChange: (questionNumber: number, answer: string) => void;
  paragraphLabels?: string[];
  currentQuestion: number;
  setCurrentQuestion: (num: number) => void;
  useLetterHeadings?: boolean;
  optionsTitle?: string;
}

export function MatchingInformationGrid({ 
  questions, 
  answers, 
  onAnswerChange,
  paragraphLabels,
  currentQuestion,
  setCurrentQuestion,
  useLetterHeadings = false,
  optionsTitle = 'List of Options'
}: MatchingInformationGridProps) {
  // Get paragraph options from the first question or use default A-G
  const options = paragraphLabels && paragraphLabels.length > 0 
    ? paragraphLabels 
    : questions[0]?.options || ['A', 'B', 'C', 'D', 'E', 'F', 'G'];

  // Generate letters for headings
  const letters = options.map((_, idx) => String.fromCharCode(65 + idx));

  return (
    <div className="space-y-4">
      {/* Main Grid Table */}
      <div className="overflow-x-auto">
        <table className="w-full border-collapse border border-border">
          <thead>
            <tr>
              <th className="text-left p-3 border-r border-b border-border font-medium text-sm min-w-[300px] bg-background">
                {/* Empty header for statement column */}
              </th>
              {(useLetterHeadings ? letters : options).map((header, idx) => (
                <th 
                  key={idx} 
                  className="text-center p-2 border-l border-b border-border font-bold text-sm w-12 bg-background"
                >
                  {header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {questions.map((question) => {
              const selectedAnswer = answers[question.question_number];
              const isActive = currentQuestion === question.question_number;
              
              return (
                <tr 
                  key={question.id}
                  className={cn(
                    "transition-colors cursor-pointer",
                    isActive ? "bg-primary/5" : "hover:bg-muted/30"
                  )}
                  onClick={() => setCurrentQuestion(question.question_number)}
                >
                  <td className={cn(
                    "p-3 border-r border-b border-border text-sm",
                    isActive && "bg-primary/5"
                  )}>
                    <div className="flex items-start gap-2">
                      <QuestionNumberBadge
                        number={question.question_number}
                        isActive={isActive}
                        variant="outline"
                        size="md"
                      />
                      <span className="leading-relaxed">{question.question_text}</span>
                    </div>
                  </td>
                  {(useLetterHeadings ? letters : options).map((optionValue, idx) => {
                    // When using letter headings, the actual value stored should be the letter
                    const valueToStore = useLetterHeadings ? letters[idx] : optionValue;
                    const isSelected = selectedAnswer === valueToStore;
                    return (
                      <td 
                        key={idx}
                        className="p-2 border-l border-b border-border text-center cursor-pointer"
                        onClick={(e) => {
                          e.stopPropagation();
                          // Toggle selection
                          if (isSelected) {
                            onAnswerChange(question.question_number, '');
                          } else {
                            onAnswerChange(question.question_number, valueToStore);
                          }
                        }}
                      >
                        <div className="flex items-center justify-center">
                          <div 
                            className={cn(
                              "w-4 h-4 rounded-full border-2 flex items-center justify-center transition-colors",
                              isSelected 
                                ? "border-primary" 
                                : "border-muted-foreground/40"
                            )}
                          >
                            {isSelected && (
                              <div className="w-2 h-2 rounded-full bg-primary" />
                            )}
                          </div>
                        </div>
                      </td>
                    );
                  })}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Options Legend - Only shown when using letter headings */}
      {useLetterHeadings && (
        <div className="border border-border inline-block">
          <table className="border-collapse">
            <thead>
              <tr>
                <th 
                  colSpan={2} 
                  className="text-left p-2 border-b border-border font-bold text-sm bg-background"
                >
                  {optionsTitle}
                </th>
              </tr>
            </thead>
            <tbody>
              {options.map((option, idx) => (
                <tr key={idx} className="border-b border-border last:border-b-0">
                  <td className="p-2 pr-4 font-bold text-sm border-r border-border w-8">
                    {letters[idx]}
                  </td>
                  <td className="p-2 text-sm">
                    {option}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
