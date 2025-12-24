import { cn } from '@/lib/utils';
import { QuestionNumberBadge } from '@/components/common/QuestionNumberBadge';

interface TableSelectionProps {
  questions: {
    question_number: number;
    question_text: string;
  }[];
  options: string[]; // e.g., ['A', 'B', 'C', 'D', 'E'] or ['Tichitt-Oualata', 'Jenné-Jeno', 'Igbo-Ukwu']
  answers: Record<number, string>;
  onAnswerChange: (questionNumber: number, answer: string) => void;
  fontSize?: number;
  useLetterHeadings?: boolean; // Show A, B, C in headers with legend below
  optionsTitle?: string; // Title for options legend (e.g., "List of political units")
  currentQuestion?: number; // Currently active question
  onSetActive?: (questionNumber: number) => void; // Callback to set active question
}

export function TableSelection({
  questions,
  options,
  answers,
  onAnswerChange,
  fontSize = 14,
  useLetterHeadings = false,
  optionsTitle = 'List of Options',
  currentQuestion,
  onSetActive,
}: TableSelectionProps) {
  // Generate letters for headings (A, B, C, ...)
  const letters = options.map((_, idx) => String.fromCharCode(65 + idx));
  
  return (
    <div className="space-y-4">
      {/* Main Grid Table */}
      <div className="overflow-x-auto">
        <table className="w-full border-collapse" style={{ fontSize }}>
          <thead>
            <tr>
              {/* Empty header cell for question column */}
              <th className="border border-border px-4 py-3 text-left font-semibold min-w-[300px] bg-background">
                {/* Empty - statement column */}
              </th>
              {(useLetterHeadings ? letters : options).map((header, idx) => (
                <th 
                  key={idx} 
                  className="border border-border px-4 py-3 text-center font-bold min-w-[50px] w-16 bg-background"
                >
                  {header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {questions.map((question, index) => {
              const isEven = index % 2 === 0;
              const isActive = currentQuestion === question.question_number;
              
              return (
                <tr 
                  key={question.question_number} 
                  className={cn(
                    "transition-colors cursor-pointer",
                    isEven ? "bg-muted/30" : "bg-background"
                  )}
                  onClick={() => onSetActive?.(question.question_number)}
                >
                  <td className="border border-border px-4 py-3">
                    <div className="flex items-center gap-2">
                      <QuestionNumberBadge
                        number={question.question_number}
                        isActive={isActive}
                        variant="outline"
                        size="md"
                      />
                      <span dangerouslySetInnerHTML={{ 
                        __html: question.question_text
                          .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
                          .replace(/\*(.+?)\*/g, '<em>$1</em>')
                      }} />
                    </div>
                  </td>
                  {(useLetterHeadings ? letters : options).map((_, idx) => {
                    // When using letter headings, store the letter value (A, B, C)
                    const valueToStore = letters[idx];
                    const isSelected = answers[question.question_number] === valueToStore;
                    return (
                      <td 
                        key={idx}
                        className="border border-border p-0 text-center cursor-pointer"
                        onClick={(e) => {
                          e.stopPropagation();
                          onAnswerChange(
                            question.question_number,
                            isSelected ? '' : valueToStore
                          );
                          onSetActive?.(question.question_number);
                        }}
                      >
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            onAnswerChange(
                              question.question_number,
                              isSelected ? '' : valueToStore
                            );
                            onSetActive?.(question.question_number);
                          }}
                          className="w-full h-full min-h-[48px] transition-all flex items-center justify-center hover:bg-muted/30"
                          role="radio"
                          aria-checked={isSelected}
                        >
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
                        </button>
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